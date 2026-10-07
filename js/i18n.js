/* RU / EN: исходный HTML на русском, английский подставляется до остальных скриптов. */
(() => {
  'use strict';

  const KEY = 'ad_lang';
  const EN = window.ANDY_I18N_EN || {};

  function detect() {
    try {
      const q = new URLSearchParams(location.search).get('lang');
      if (q === 'en' || q === 'ru') return q;
      const s = localStorage.getItem(KEY);
      if (s === 'en' || s === 'ru') return s;
    } catch { /* private mode */ }
    return 'ru';
  }

  function norm(s) {
    return String(s || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\u00ad/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const lang = detect();

  function t(text) {
    if (lang !== 'en') return text;
    const key = norm(text);
    return Object.prototype.hasOwnProperty.call(EN, key) ? EN[key] : text;
  }

  function applyText(node) {
    const raw = node.nodeValue;
    if (!raw || !/[А-Яа-яЁё]/.test(raw)) return;
    const lead = raw.match(/^\s*/)[0];
    const trail = raw.match(/\s*$/)[0];
    const key = norm(raw);
    if (!key || !Object.prototype.hasOwnProperty.call(EN, key)) return;
    node.nodeValue = lead + EN[key] + trail;
  }

  function applyTree(root) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode())) {
      const p = n.parentElement;
      if (!p || /^(SCRIPT|STYLE|TEXTAREA|CODE)$/.test(p.tagName)) continue;
      applyText(n);
    }
    root.querySelectorAll('[alt],[aria-label],[data-rail],[data-cursor],[title]').forEach((el) => {
      ['alt', 'aria-label', 'data-rail', 'data-cursor', 'title'].forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        const next = t(el.getAttribute(attr));
        if (next !== el.getAttribute(attr)) el.setAttribute(attr, next);
      });
    });
    document.querySelectorAll('title, meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach((el) => {
      if (el.tagName === 'TITLE') {
        const next = t(el.textContent);
        if (next !== el.textContent) el.textContent = next;
        return;
      }
      const next = t(el.getAttribute('content') || '');
      if (next) el.setAttribute('content', next);
    });
  }

  function setDoc() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'ru';
    const locale = document.querySelector('meta[property="og:locale"]');
    if (locale) locale.setAttribute('content', lang === 'en' ? 'en_US' : 'ru_RU');
  }

  function closeMenus() {
    document.querySelectorAll('.lang').forEach((wrap) => {
      wrap.classList.remove('is-open');
      const menu = wrap.querySelector('.lang__menu');
      const toggle = wrap.querySelector('.lang__toggle');
      if (menu) {
        menu.hidden = true;
        menu.style.width = '';
      }
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function mountSwitcher() {
    document.querySelectorAll('.header__inner').forEach((inner) => {
      if (inner.querySelector('.lang')) return;
      const label = lang === 'en' ? 'Language' : 'Язык';
      const current = lang === 'en' ? 'EN' : 'RU';
      const box = document.createElement('div');
      box.className = 'header__tools';
      box.innerHTML = `
        <div class="lang">
          <button type="button" class="lang__toggle" aria-label="${label}" aria-haspopup="listbox" aria-expanded="false">
            <span>${current}</span>
            <svg class="lang__chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.4 4.2 6 7.8l3.6-3.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="lang__menu" role="listbox" aria-label="${label}" hidden>
            <button type="button" class="lang__opt${lang === 'ru' ? ' is-active' : ''}" role="option" aria-selected="${lang === 'ru'}" data-set-lang="ru">RU</button>
            <button type="button" class="lang__opt${lang === 'en' ? ' is-active' : ''}" role="option" aria-selected="${lang === 'en'}" data-set-lang="en">EN</button>
          </div>
        </div>`;
      const cv = inner.querySelector('.header__cv');
      const home = !cv ? [...inner.querySelectorAll('.btn--sm')].find((b) => !b.classList.contains('header__cv')) : null;
      const burger = inner.querySelector('.burger');
      const attach = cv || home;
      if (attach) {
        attach.replaceWith(box);
        box.appendChild(attach);
      } else if (burger) {
        inner.insertBefore(box, burger);
      } else {
        inner.appendChild(box);
      }
    });
  }

  function setLang(next) {
    if (next !== 'en' && next !== 'ru') return;
    if (next === lang) {
      closeMenus();
      return;
    }
    try { localStorage.setItem(KEY, next); } catch { /* private mode */ }
    const url = new URL(location.href);
    if (next === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    url.hash = '';
    const path = url.pathname.replace(/\/index(\.html)?$/, '/') || '/';
    const pretty = path.endsWith('.html') ? path.slice(0, -5) : path;
    location.replace(pretty + url.search);
  }

  if (lang === 'en') applyTree(document);
  setDoc();
  mountSwitcher();
  document.documentElement.classList.remove('i18n-wait');

  document.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-set-lang]');
    if (opt) {
      e.preventDefault();
      setLang(opt.getAttribute('data-set-lang'));
      return;
    }
    const toggle = e.target.closest('.lang__toggle');
    if (toggle) {
      e.preventDefault();
      const wrap = toggle.closest('.lang');
      const willOpen = !wrap.classList.contains('is-open');
      closeMenus();
      if (willOpen) {
        wrap.classList.add('is-open');
        const menu = wrap.querySelector('.lang__menu');
        menu.style.width = '';
        menu.hidden = false;
        menu.style.width = Math.ceil(menu.getBoundingClientRect().width * 2.6) + 'px';
        toggle.setAttribute('aria-expanded', 'true');
      }
      return;
    }
    if (!e.target.closest('.lang')) closeMenus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenus();
  });

  window.AndyI18n = { lang, t, setLang };
})();
