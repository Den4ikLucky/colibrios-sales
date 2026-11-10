/*
 * ColibriOS geo locale router (core only, no visual changes).
 *
 * Exports:
 *   - Browser: window.ColibriGeoRouter
 *   - Node/CommonJS: module.exports (dependency-free tests)
 *
 * Decision order of resolveLocale({country, lang, tz, override, currencyOverride}):
 *   1. Explicit manual override (query, stored choice or switchLocale) wins.
 *      ru is constrained to RUB; en allows USD/EUR; es allows EUR/USD.
 *      Invalid locale or currency values are ignored and fall back safely.
 *   2. Country in RU/CIS -> ru/RUB.
 *   3. Browser language "ru" or timezone Europe/Moscow / Europe/Minsk -> ru/RUB.
 *      This is a fallible language/timezone HINT only. It is NOT VPN detection
 *      and makes no claim about the visitor's real location.
 *   4. Spain -> es/EUR.
 *   5. Spanish-speaking Latin America -> es/USD.
 *   6. Eurozone -> en/EUR (es/EUR when the browser language is Spanish).
 *   7. No country + browser language "es" -> es/EUR.
 *   8. Default -> en/USD.
 *
 * Country data only ever comes from the same-origin /api/geo endpoint, which
 * reads the Vercel edge header server-side. Browser JavaScript cannot read
 * request headers, and this module never calls third-party geolocation.
 * The geo lookup is best effort with a 750 ms deadline; it is never
 * zero-latency and manual choices keep working when it fails.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module && module.exports) {
    module.exports = api;
  }
  if (typeof window !== 'undefined' && window) {
    window.ColibriGeoRouter = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var LOCALES = Object.freeze(['ru', 'en', 'es']);
  var SLUGS = Object.freeze({ ru: 'colibri-os-ru', en: 'denysviet-os-en', es: 'colibri-os-es' });
  var SYMBOLS = Object.freeze({ RUB: '\u20BD', USD: '$', EUR: '\u20AC' });
  var ALLOWED_CURRENCIES = Object.freeze({
    ru: Object.freeze(['RUB']),
    en: Object.freeze(['USD', 'EUR']),
    es: Object.freeze(['EUR', 'USD'])
  });

  // Commonwealth of Independent States members plus associate state (TM).
  var CIS = toSet(['RU', 'BY', 'KZ', 'KG', 'AM', 'AZ', 'TJ', 'UZ', 'MD', 'TM']);
  // Spanish-speaking Latin America and the Caribbean.
  var LATAM_ES = toSet(['MX', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'PR',
    'CO', 'VE', 'EC', 'PE', 'BO', 'CL', 'AR', 'PY', 'UY']);
  // Euro area members as of 2026 (Bulgaria adopted the euro on 2026-01-01).
  var EUROZONE = toSet(['AT', 'BE', 'BG', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE',
    'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES']);
  var RU_TIMEZONES = toSet(['Europe/Moscow', 'Europe/Minsk']);

  var STORAGE_KEY = 'colibri.geoLocale.choice.v1';
  var GEO_ENDPOINT = '/api/geo';
  var GEO_TIMEOUT_MS = 750;
  var ROUTER_PARAMS = ['lang', 'locale', 'currency'];

  function toSet(list) {
    var s = Object.create(null);
    for (var i = 0; i < list.length; i++) s[list[i]] = true;
    return s;
  }

  function has(set, key) {
    return typeof key === 'string' && Object.prototype.hasOwnProperty.call(set, key);
  }

  function sanitizeCountry(value) {
    if (typeof value !== 'string') return null;
    var v = value.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(v) || v === 'XX') return null;
    return v;
  }

  function sanitizeLang(value) {
    if (typeof value !== 'string' || value.length > 35) return null;
    var m = /^\s*([A-Za-z]{2,3})(?:[-_][A-Za-z0-9]{1,8})*\s*$/.exec(value);
    return m ? m[1].toLowerCase() : null;
  }

  function sanitizeTimezone(value) {
    if (typeof value !== 'string' || value.length > 64) return null;
    return /^[A-Za-z_]+(?:\/[A-Za-z0-9_+\-]+){0,2}$/.test(value) ? value : null;
  }

  function sanitizeLocale(value) {
    if (typeof value !== 'string' || value.length > 8) return null;
    var v = value.trim().toLowerCase();
    return LOCALES.indexOf(v) !== -1 ? v : null;
  }

  function sanitizeCurrency(value) {
    if (typeof value !== 'string' || value.length > 8) return null;
    var v = value.trim().toUpperCase();
    return has(SYMBOLS, v) ? v : null;
  }

  function isCurrencyAllowed(locale, currency) {
    return !!locale && !!currency && ALLOWED_CURRENCIES[locale].indexOf(currency) !== -1;
  }

  function build(locale, currency, reason) {
    return {
      locale: locale,
      currency: currency,
      symbol: SYMBOLS[currency],
      slug: SLUGS[locale],
      reason: reason
    };
  }

  function autoResolve(country, lang, tz) {
    if (country && has(CIS, country)) return build('ru', 'RUB', 'geo-ru-cis');
    if (lang === 'ru') return build('ru', 'RUB', 'hint-ru-language');
    if (tz && has(RU_TIMEZONES, tz)) return build('ru', 'RUB', 'hint-ru-timezone');
    if (country === 'ES') return build('es', 'EUR', 'geo-spain');
    if (country && has(LATAM_ES, country)) return build('es', 'USD', 'geo-latam-es');
    if (country && has(EUROZONE, country)) {
      return lang === 'es' ? build('es', 'EUR', 'geo-eurozone-es-language') : build('en', 'EUR', 'geo-eurozone');
    }
    if (!country && lang === 'es') return build('es', 'EUR', 'hint-es-language');
    return build('en', 'USD', 'default');
  }

  /**
   * Pure resolver. Never throws; all inputs are sanitized.
   * @param {{country?:*, lang?:*, tz?:*, override?:*, currencyOverride?:*}} input
   * @returns {{locale:string, currency:string, symbol:string, slug:string, reason:string}}
   */
  function resolveLocale(input) {
    var o = input && typeof input === 'object' ? input : {};
    var country = sanitizeCountry(o.country);
    var lang = sanitizeLang(o.lang);
    var tz = sanitizeTimezone(o.tz);
    var override = sanitizeLocale(o.override);
    var currencyOverride = sanitizeCurrency(o.currencyOverride);
    var auto = autoResolve(country, lang, tz);

    if (override) {
      if (isCurrencyAllowed(override, currencyOverride)) {
        return build(override, currencyOverride, 'manual-override');
      }
      // Invalid or missing currency: locale default, adjusted by geo region.
      var fallback;
      if (override === 'ru') fallback = 'RUB';
      else if (override === 'en') fallback = country && has(EUROZONE, country) ? 'EUR' : 'USD';
      else fallback = country && has(LATAM_ES, country) ? 'USD' : 'EUR';
      return build(override, fallback, 'manual-override');
    }
    if (currencyOverride && currencyOverride !== auto.currency && isCurrencyAllowed(auto.locale, currencyOverride)) {
      return build(auto.locale, currencyOverride, 'manual-currency');
    }
    return auto;
  }

  /* ---------------- Browser helpers (all injectable for tests) ---------------- */

  function readQueryOverride(search) {
    var out = { override: null, currencyOverride: null };
    if (typeof search !== 'string' || typeof URLSearchParams === 'undefined') return out;
    try {
      var p = new URLSearchParams(search);
      out.override = sanitizeLocale(p.get('locale') || p.get('lang'));
      out.currencyOverride = sanitizeCurrency(p.get('currency'));
    } catch (e) { /* malformed query: ignore */ }
    return out;
  }

  function readStoredChoice(storage) {
    try {
      if (!storage || typeof storage.getItem !== 'function') return null;
      var raw = storage.getItem(STORAGE_KEY);
      if (typeof raw !== 'string' || raw.length > 256) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      var locale = sanitizeLocale(parsed.locale);
      if (!locale) return null;
      var currency = sanitizeCurrency(parsed.currency);
      return { locale: locale, currency: isCurrencyAllowed(locale, currency) ? currency : null };
    } catch (e) {
      return null;
    }
  }

  function persistChoice(storage, locale, currency) {
    var l = sanitizeLocale(locale);
    if (!l) return null;
    var decision = resolveLocale({ override: l, currencyOverride: currency });
    try {
      if (storage && typeof storage.setItem === 'function') {
        storage.setItem(STORAGE_KEY, JSON.stringify({ locale: decision.locale, currency: decision.currency }));
      }
    } catch (e) { /* storage full or blocked: choice still applies for this navigation */ }
    return decision;
  }

  function localeFromPath(pathname) {
    if (typeof pathname !== 'string') return null;
    var first = pathname.split('/').filter(Boolean)[0] || '';
    for (var i = 0; i < LOCALES.length; i++) {
      if (SLUGS[LOCALES[i]] === first) return LOCALES[i];
    }
    return null;
  }

  function isExplicitLocalePath(pathname) {
    return localeFromPath(pathname) !== null;
  }

  /**
   * Build a same-origin URL for a locale, preserving foreign query params and hash.
   * Router params (lang, locale, currency) are dropped; currency is re-added when given.
   */
  function buildLocaleUrl(locale, currentHref, currency) {
    var l = sanitizeLocale(locale) || 'en';
    var base;
    try { base = new URL(typeof currentHref === 'string' ? currentHref : '/', 'http://localhost'); }
    catch (e) { base = new URL('http://localhost/'); }
    var target = new URL('/' + SLUGS[l] + '/', base.origin);
    base.searchParams.forEach(function (value, key) {
      if (ROUTER_PARAMS.indexOf(key) === -1) target.searchParams.append(key, value);
    });
    var c = sanitizeCurrency(currency);
    // Single-currency locales (ru) need no currency parameter.
    if (c && isCurrencyAllowed(l, c) && ALLOWED_CURRENCIES[l].length > 1) target.searchParams.set('currency', c);
    target.hash = base.hash && base.hash.length <= 512 ? base.hash : '';
    return target.pathname + target.search + target.hash;
  }

  /**
   * Same-origin, best-effort geo lookup with a hard deadline (default 750 ms).
   * Resolves to {country, ok, error}; never rejects.
   */
  function fetchGeo(options) {
    var opts = options || {};
    var fetchImpl = opts.fetch || (typeof fetch === 'function' ? fetch : null);
    var timeoutMs = typeof opts.timeoutMs === 'number' && opts.timeoutMs > 0 ? opts.timeoutMs : GEO_TIMEOUT_MS;
    if (!fetchImpl) return Promise.resolve({ country: null, ok: false, error: 'no-fetch' });
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer;
    var deadline = new Promise(function (resolve) {
      timer = setTimeout(function () {
        if (controller) { try { controller.abort(); } catch (e) { /* ignore */ } }
        resolve({ country: null, ok: false, error: 'timeout' });
      }, timeoutMs);
    });
    var request;
    try {
      request = Promise.resolve(fetchImpl(GEO_ENDPOINT, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller ? controller.signal : undefined
      })).then(function (res) {
        if (!res || !res.ok) return { country: null, ok: false, error: 'http' };
        return res.json().then(function (body) {
          return { country: sanitizeCountry(body && body.country), ok: true, error: null };
        });
      }).catch(function () {
        return { country: null, ok: false, error: 'network' };
      });
    } catch (e) {
      request = Promise.resolve({ country: null, ok: false, error: 'network' });
    }
    return Promise.race([request, deadline]).then(function (result) {
      clearTimeout(timer);
      return result;
    });
  }

  function envDefaults(env) {
    var e = env || {};
    var w = typeof window !== 'undefined' ? window : {};
    var storage = e.storage;
    if (storage === undefined) { try { storage = w.localStorage; } catch (x) { storage = null; } }
    var tz = e.tz;
    if (tz === undefined) {
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (x) { tz = null; }
    }
    return {
      location: e.location || w.location || null,
      lang: e.lang !== undefined ? e.lang : (w.navigator && w.navigator.language) || null,
      tz: tz,
      storage: storage,
      fetch: e.fetch,
      timeoutMs: e.timeoutMs,
      redirect: e.redirect !== false
    };
  }

  function navigate(location, url) {
    if (!location) return false;
    try {
      if (typeof location.replace === 'function') { location.replace(url); return true; }
      location.href = url;
      return true;
    } catch (e) { return false; }
  }

  /**
   * Root bootstrap for the future root index.html. Never redirects when the
   * current path is already an explicit locale path.
   * @returns {Promise<{decision:object, url:string|null, redirected:boolean, geo:object|null}>}
   */
  function initRoot(env) {
    var e = envDefaults(env);
    var loc = e.location || {};
    var pathname = typeof loc.pathname === 'string' ? loc.pathname : '/';
    var explicit = localeFromPath(pathname);
    var query = readQueryOverride(typeof loc.search === 'string' ? loc.search : '');
    var stored = readStoredChoice(e.storage);

    if (query.override) persistChoice(e.storage, query.override, query.currencyOverride);
    var manual = query.override
      ? { override: query.override, currencyOverride: query.currencyOverride }
      : stored ? { override: stored.locale, currencyOverride: stored.currency } : null;

    if (explicit) {
      var pathDecision = resolveLocale({ override: explicit, currencyOverride: manual && manual.override === explicit ? manual.currencyOverride : query.currencyOverride, lang: e.lang, tz: e.tz });
      return Promise.resolve({ decision: pathDecision, url: null, redirected: false, geo: null });
    }

    var geoPromise = manual ? Promise.resolve(null) : fetchGeo({ fetch: e.fetch, timeoutMs: e.timeoutMs });
    return geoPromise.then(function (geo) {
      var decision = resolveLocale({
        country: geo ? geo.country : null,
        lang: e.lang,
        tz: e.tz,
        override: manual ? manual.override : null,
        currencyOverride: manual ? manual.currencyOverride : query.currencyOverride
      });
      var href = typeof loc.href === 'string' ? loc.href : pathname + (loc.search || '') + (loc.hash || '');
      var url = buildLocaleUrl(decision.locale, href, decision.currency);
      var redirected = e.redirect ? navigate(e.location, url) : false;
      return { decision: decision, url: url, redirected: redirected, geo: geo };
    });
  }

  /**
   * Manual language/currency switch. Works without any geo data.
   */
  function switchLocale(locale, currency, env) {
    var e = envDefaults(env);
    var decision = persistChoice(e.storage, locale, currency);
    if (!decision) return null;
    var loc = e.location || {};
    var href = typeof loc.href === 'string' ? loc.href : '/';
    var url = buildLocaleUrl(decision.locale, href, decision.currency);
    var redirected = e.redirect ? navigate(e.location, url) : false;
    return { decision: decision, url: url, redirected: redirected };
  }

  return Object.freeze({
    LOCALES: LOCALES,
    SLUGS: SLUGS,
    SYMBOLS: SYMBOLS,
    ALLOWED_CURRENCIES: ALLOWED_CURRENCIES,
    STORAGE_KEY: STORAGE_KEY,
    GEO_ENDPOINT: GEO_ENDPOINT,
    GEO_TIMEOUT_MS: GEO_TIMEOUT_MS,
    sanitizeCountry: sanitizeCountry,
    sanitizeLang: sanitizeLang,
    resolveLocale: resolveLocale,
    readQueryOverride: readQueryOverride,
    readStoredChoice: readStoredChoice,
    persistChoice: persistChoice,
    localeFromPath: localeFromPath,
    isExplicitLocalePath: isExplicitLocalePath,
    buildLocaleUrl: buildLocaleUrl,
    fetchGeo: fetchGeo,
    initRoot: initRoot,
    switchLocale: switchLocale
  });
});
