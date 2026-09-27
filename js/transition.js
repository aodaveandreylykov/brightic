/* Анимированный переход между страницами сайта */
(() => {
  'use strict';

  const pt = document.createElement('div');
  pt.className = 'pt';
  pt.setAttribute('aria-hidden', 'true');
  pt.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
  document.body.appendChild(pt);

  // шторки уезжают при загрузке страницы
  requestAnimationFrame(() => requestAnimationFrame(() => pt.classList.add('is-in')));

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented) return;
    if (a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    const url = new URL(a.href, location.href);
    if (url.protocol !== location.protocol || url.host !== location.host) return;
    // якорь на этой же странице — обычная прокрутка
    if (url.pathname === location.pathname && url.hash) return;
    if (!/(\.html|\/)$/.test(url.pathname)) return;

    e.preventDefault();
    pt.classList.remove('is-in');
    pt.classList.add('is-leave');
    setTimeout(() => { location.href = a.href; }, 700);
  });

  // возврат кнопкой «назад» из bfcache
  addEventListener('pageshow', (e) => {
    if (e.persisted) {
      pt.classList.remove('is-leave');
      pt.classList.add('is-in');
    }
  });
})();
