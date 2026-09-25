/* Public configuration is generated from site-config.json. Never put secrets here. */
(() => {
  'use strict';
  const c = window.GROWTH_CONFIG || {};
  const $ = s => document.querySelector(s);
  const menu = $('.menu-toggle');
  const nav = $('#primary-nav');
  function closeMenu() { nav?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); }
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(open)); });
  nav?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav?.classList.contains('is-open')) { closeMenu(); menu.focus(); } });
  matchMedia('(min-width: 801px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  // Strict provider allowlist; unconfigured, malformed, or non-Stripe URLs fail closed.
  function checkoutURL() {
    if (c.CHECKOUT_ENABLED !== true) return null;
    try {
      const u = new URL(c.STRIPE_CHECKOUT_URL);
      return u.protocol === 'https:' && ['buy.stripe.com', 'checkout.stripe.com'].includes(u.hostname) && !u.username && !u.password && !u.port && u.pathname.length > 1 ? u.href : null;
    } catch { return null; }
  }
  let consent = 'unset';
  try { consent = localStorage.getItem('growthms.analytics') || 'unset'; } catch { /* Storage is optional for the sales site. */ }
  const pixelConfigured = c.ANALYTICS_ENABLED === true && /^\d{5,25}$/.test(c.META_PIXEL_ID || '');
  const privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  let pixelStarted = false;
  const banner = $('#consent');
  function startPixel() {
    if (!pixelConfigured || consent !== 'granted' || privacySignal || pixelStarted) return;
    pixelStarted = true;
    const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    const script = document.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.append(script);
    fbq('init', c.META_PIXEL_ID); fbq('track', 'PageView');
    if (document.body.dataset.page === 'product') fbq('track', 'ViewContent', {content_name: 'Solo Business OS', content_ids: ['solo-business-os'], content_type: 'product', value: c.PRODUCT_PRICE, currency: c.CURRENCY});
  }
  function trackCheckout() {
    if (pixelStarted && consent === 'granted' && !privacySignal) window.fbq('track', 'InitiateCheckout', {content_ids: ['solo-business-os'], content_type: 'product', num_items: 1, value: c.PRODUCT_PRICE, currency: c.CURRENCY});
  }
  if (pixelConfigured && !privacySignal) {
    if (consent === 'unset') banner.hidden = false;
    startPixel();
  }
  document.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    consent = button.dataset.consent;
    try { localStorage.setItem('growthms.analytics', consent); } catch { /* Choice lasts for this page if storage is blocked. */ }
    banner.hidden = true;
    if (consent === 'granted') startPixel();
    else if (pixelStarted) { window.fbq('consent', 'revoke'); location.reload(); }
  }));
  $('[data-privacy-settings]')?.addEventListener('click', () => {
    if (pixelConfigured && !privacySignal) { banner.hidden = false; banner.querySelector('button').focus(); }
    else $('#privacy-dialog').showModal();
  });
  let navigating = false;
  document.querySelectorAll('[data-checkout]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      const url = checkoutURL();
      if (!url) { $('#checkout-dialog').showModal(); return; }
      if (navigating) return;
      navigating = true; trackCheckout(); location.assign(url);
    });
  });
  window.addEventListener('pageshow', () => { navigating = false; });
  // No Purchase event in this static application: a return URL is not proof of payment.
  const gallery = $('#gallery-image');
  document.querySelectorAll('[data-screen]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-screen]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    gallery.src = '/assets/images/' + button.dataset.screen + '.webp';
    gallery.alt = button.dataset.alt;
    $('#gallery-link').href = gallery.src;
    $('#gallery-full').href = gallery.src;
    $('#gallery-caption').textContent = button.dataset.caption;
  }));
})();
