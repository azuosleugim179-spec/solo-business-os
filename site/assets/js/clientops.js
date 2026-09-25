(() => {
  'use strict';
  const button = document.querySelector('.menu-button');
  const nav = document.querySelector('#primary-nav');
  const close = () => { nav?.classList.remove('open'); button?.setAttribute('aria-expanded', 'false'); };
  button?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) close(); });
})();
