/* Анимированный переход между страницами сайта */
(() => {
  'use strict';

  const HOME_SECTION_KEY = 'ad_home_section';
  const STATIC_EXT = /\.(css|js|mjs|png|jpe?g|webp|gif|svg|mp4|woff2?|ico|xml|txt|pdf|json|map)$/i;

  const pt = document.createElement('div');
  pt.className = 'pt';
  pt.setAttribute('aria-hidden', 'true');
  pt.innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
  document.body.appendChild(pt);

  // Шторки раскрываются, только если на страницу перешли по ссылке внутри сайта.
  // При заходе извне страница видна сразу, без анимации.
  let fromInside = false;
  try {
    fromInside = sessionStorage.getItem('pt-leave') === '1';
    sessionStorage.removeItem('pt-leave');
  } catch { /* приватный режим */ }

  if (fromInside) {
    requestAnimationFrame(() => requestAnimationFrame(() => pt.classList.add('is-in')));
  } else {
    pt.classList.add('is-instant', 'is-in');
    requestAnimationFrame(() => requestAnimationFrame(() => pt.classList.remove('is-instant')));
  }

  function prettyPath(pathname) {
    let p = pathname || '/';
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    const file = p.split('/').pop();
    if (file === 'index' || file === 'index.html') {
      const parent = p.slice(0, -file.length);
      p = parent.replace(/\/$/, '') || '/';
    } else if (p.endsWith('.html')) {
      p = p.slice(0, -5) || '/';
    }
    return p || '/';
  }

  function cleanUrl(search) {
    const q = search == null ? location.search : search;
    return location.origin + prettyPath(location.pathname) + q;
  }

  function stripHash() {
    if (!location.hash && prettyPath(location.pathname) === location.pathname) return;
    history.replaceState(null, '', cleanUrl());
  }

  function scrollToId(id, behavior) {
    if (!id) return false;
    if (id === 'top') {
      scrollTo({ top: 0, behavior });
      return true;
    }
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior });
    return true;
  }

  function storeHomeSection(id) {
    if (!id || id === 'top') return;
    try { sessionStorage.setItem(HOME_SECTION_KEY, id); } catch { /* приватный режим */ }
  }

  function takeHomeSection() {
    try {
      const id = sessionStorage.getItem(HOME_SECTION_KEY);
      sessionStorage.removeItem(HOME_SECTION_KEY);
      return id || '';
    } catch {
      return '';
    }
  }

  const hashId = location.hash.replace(/^#/, '');
  stripHash();

  let pendingSection = takeHomeSection() || hashId;
  if (pendingSection) {
    const go = () => scrollToId(pendingSection, 'auto');
    if (document.readyState === 'complete') go();
    else addEventListener('load', go, { once: true });
  }

  // Если браузер всё же поставил якорь — сразу убираем его из адреса
  addEventListener('hashchange', () => { stripHash(); });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented) return;
    if (a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const href = a.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (!id) return;
      e.preventDefault();
      scrollToId(id, 'smooth');
      stripHash();
      return;
    }

    let url;
    try { url = new URL(a.href, location.href); } catch { return; }
    if (url.protocol !== location.protocol || url.host !== location.host) return;
    if (STATIC_EXT.test(url.pathname)) return;

    const destPath = prettyPath(url.pathname);
    const herePath = prettyPath(location.pathname);
    const section = a.getAttribute('data-home-section') || (url.hash ? url.hash.slice(1) : '');

    if (destPath === herePath) {
      e.preventDefault();
      if (section) scrollToId(section, 'smooth');
      else scrollTo({ top: 0, behavior: 'smooth' });
      stripHash();
      return;
    }

    e.preventDefault();
    if ((destPath === '/' || destPath === '/portfolio') && section) storeHomeSection(section);
    try { sessionStorage.setItem('pt-leave', '1'); } catch { /* приватный режим */ }

    if (window.AndyI18n && AndyI18n.lang === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');

    pt.classList.remove('is-in');
    pt.classList.add('is-leave');
    setTimeout(() => { location.href = destPath + url.search; }, 700);
  }, true);

  addEventListener('pageshow', (e) => {
    if (e.persisted) {
      pt.classList.remove('is-leave');
      pt.classList.add('is-in');
    }
    stripHash();
  });
})();
