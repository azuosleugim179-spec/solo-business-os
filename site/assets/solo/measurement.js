(() => {
  'use strict';
  const endpoint = 'https://growth-ms-delivery.azuosleugim179.workers.dev/events';
  const checkout = 'https://buy.stripe.com/9B6eVf9RU5sa6OTbhe6Ri00';
  const banner = document.querySelector('#measurement-choice');
  if (!banner) return;
  let choice = 'unset';
  try { choice = localStorage.getItem('growthms.analytics') || 'unset'; } catch {}
  const blocked = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  const allowed = () => choice === 'granted' && !blocked();
  const sent = new Set();
  let timer, visible = false;
  function emit(type) {
    if (!allowed() || sent.has(type)) return;
    try {
      const body = JSON.stringify({type, id: crypto.randomUUID(), consent: true, item_id: 'solo-business-os', currency: 'usd', value_minor: 7900});
      sent.add(type);
      // Simple CORS request, no cookies or referrer; navigation never waits for measurement.
      fetch(endpoint, {method: 'POST', body, headers: {'Content-Type': 'text/plain'}, credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true}).catch(() => {});
    } catch { /* Measurement must never interrupt checkout. */ }
  }
  function scheduleView() {
    clearTimeout(timer);
    if (visible && document.visibilityState === 'visible' && allowed()) {
      timer = setTimeout(() => emit('view_item'), 1000);
    }
  }
  const hero = document.querySelector('.hero-section h1');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5);
      scheduleView();
    }, {threshold: [0, 0.5]}).observe(hero);
  }
  document.addEventListener('visibilitychange', scheduleView);
  function showChoices() {
    banner.hidden = false;
    document.querySelector('#measurement-signal').hidden = !blocked();
    banner.querySelector('[data-measurement-consent="granted"]').disabled = blocked();
  }
  document.querySelectorAll('[data-measurement-choices]').forEach(button => button.addEventListener('click', showChoices));
  document.querySelectorAll('[data-measurement-consent]').forEach(button => button.addEventListener('click', () => {
    choice = button.dataset.measurementConsent;
    try { localStorage.setItem('growthms.analytics', choice); } catch {}
    banner.hidden = true;
    scheduleView();
  }));
  window.addEventListener('storage', event => {
    if (event.key === 'growthms.analytics' || event.key === null) {
      choice = event.newValue || 'unset'; scheduleView();
    }
  });
  document.querySelectorAll('a[href="' + checkout + '"]').forEach(link => {
    link.addEventListener('click', () => emit('begin_checkout'));
    link.addEventListener('auxclick', event => { if (event.button === 1) emit('begin_checkout'); });
  });
  if (choice !== 'granted' && choice !== 'denied' && !blocked()) showChoices();
})();
