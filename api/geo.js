'use strict';
/*
 * Vercel serverless handler: GET /api/geo -> {"country": "ES" | null, "source": ...}
 *
 * - Trusts the x-vercel-ip-country header ONLY when process.env.VERCEL === '1'
 *   (i.e. the request passed through the Vercel edge, which sets that header).
 *   Anywhere else the header could be forged by the client, so country = null.
 * - Sanitizes the value to an ISO 3166-1 alpha-2 code; anything else -> null.
 * - Responses are private and never cached (no shared CDN caching of geo data).
 * - Stores no IP address and writes no logs.
 * - The country is a coarse network hint, not proof of location (VPNs and
 *   proxies change it); clients must keep manual choices authoritative.
 */

var HEADER = 'x-vercel-ip-country';

function sanitizeCountry(value) {
  var v = Array.isArray(value) ? value[0] : value;
  if (typeof v !== 'string') return null;
  v = v.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(v) || v === 'XX') return null;
  return v;
}

function readHeader(req, name) {
  var headers = req && req.headers;
  if (!headers) return undefined;
  if (typeof headers.get === 'function') return headers.get(name);
  return headers[name];
}

function send(res, status, body, extraHeaders) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (extraHeaders) {
    Object.keys(extraHeaders).forEach(function (k) { res.setHeader(k, extraHeaders[k]); });
  }
  res.end(body === null ? '' : JSON.stringify(body));
}

function handler(req, res) {
  var method = (req && req.method) || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    send(res, 405, { error: 'method_not_allowed' }, { Allow: 'GET, HEAD' });
    return;
  }
  var trusted = process.env.VERCEL === '1';
  var country = trusted ? sanitizeCountry(readHeader(req, HEADER)) : null;
  var body = { country: country, source: country ? 'vercel-edge-header' : 'none' };
  send(res, 200, method === 'HEAD' ? null : body);
}

module.exports = handler;
module.exports.sanitizeCountry = sanitizeCountry;
