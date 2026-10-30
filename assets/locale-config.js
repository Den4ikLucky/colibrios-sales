(function () {
  "use strict";
  const html = document.documentElement;
  const locale =
    html.getAttribute("data-locale") || html.getAttribute("lang") || "en";
  window.COLIBRI_LOCALE = Object.freeze({
    code: locale,
    isRtl: false,
    currency: locale === "ru" ? "RUB" : "USD",
  });
  // The root storefront is English. Keep Russian order and legal links in RU
  // without altering the established RUB processor URLs or readiness flag.
  if (locale === "ru" && window.COLIBRI_CONFIG) {
    const base = new URL("/ru/", window.location.href);
    const paymentUrls = {};
    for (const product of ["vip", "light", "pro", "swarm"]) {
      paymentUrls[product] = new URL(
        "checkout.html?product=" + product,
        base,
      ).href;
    }
    window.COLIBRI_CONFIG = Object.freeze({
      ...window.COLIBRI_CONFIG,
      storefrontUrl: base.href,
      paymentUrls: Object.freeze(paymentUrls),
      termsUrl: new URL("terms.html", base).href,
      privacyUrl: new URL("privacy.html", base).href,
    });
  }
})();
