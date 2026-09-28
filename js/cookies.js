/* Согласие на cookie по Закону РБ № 99-З: выбор до необязательных скриптов,
   равнозначные принять/отклонить, отзыв на сайте, без блокировки просмотра. */
(() => {
  'use strict';

  const KEY = 'ad_cookie_consent';
  const VERSION = 1;
  const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

  const html = document.documentElement;

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.v !== VERSION || typeof data.ts !== 'number') return null;
      if (Date.now() - data.ts > MAX_AGE_MS) return null;
      return {
        v: VERSION,
        ts: data.ts,
        necessary: true,
        analytics: !!data.analytics
      };
    } catch {
      return null;
    }
  }

  function write(analytics) {
    const data = {
      v: VERSION,
      ts: Date.now(),
      necessary: true,
      analytics: !!analytics
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch { /* приватный режим — выбор не сохранится */ }
    apply(data);
    window.dispatchEvent(new CustomEvent('andy:consent', { detail: data }));
    return data;
  }

  function apply(data) {
    html.setAttribute('data-consent', data && data.analytics ? 'all' : 'necessary');
    // Аналитику подключать только здесь и только если data.analytics === true.
    // Сейчас счётчиков нет: Метрика / GA не грузятся ни до, ни после отказа.
  }

  function panelTemplate() {
    return `
      <div class="cookie" id="cookie-banner" hidden>
        <div class="cookie__card" role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-desc">
          <div class="cookie__view" data-view="banner">
            <div class="cookie__copy">
              <p class="cookie__kicker">Файлы cookie</p>
              <p class="cookie__title" id="cookie-title">Как сайт запоминает ваш выбор</p>
              <p class="cookie__text" id="cookie-desc">
                Оператор — Андрей Лыков, Республика Беларусь.
                Нужны только технические cookie: работа сайта и сохранение согласия.
                Аналитику не включаю, пока вы не разрешите — отказаться можно так же просто, сайт от этого не закроется.
                <a href="cookies.html">Политика cookie</a>
                ·
                <a href="privacy.html">Конфиденциальность</a>
              </p>
            </div>
            <div class="cookie__actions">
              <button type="button" class="cookie__btn cookie__btn--ghost js-cookie-settings">Настроить</button>
              <button type="button" class="cookie__btn cookie__btn--ghost js-cookie-reject">Только необходимые</button>
              <button type="button" class="cookie__btn cookie__btn--solid js-cookie-accept">Принять все</button>
            </div>
          </div>
          <div class="cookie__view" data-view="settings" hidden>
            <div class="cookie__copy">
              <p class="cookie__kicker">Файлы cookie</p>
              <p class="cookie__title" id="cookie-settings-title">Настройки cookie</p>
              <p class="cookie__text">
                Согласие можно отозвать в любой момент. Подробности — в
                <a href="cookies.html">политике cookie</a>.
              </p>
            </div>
            <div class="cookie__cats">
              <div class="cookie-cat">
                <div class="cookie-cat__text">
                  <b>Необходимые</b>
                  <span>Анимация переходов и запоминание вашего выбора. Без них сайт не сможет сохранить отказ или согласие.</span>
                </div>
                <label class="switch switch--locked">
                  <input type="checkbox" checked disabled tabindex="-1">
                  <span>Вкл</span>
                </label>
              </div>
              <div class="cookie-cat">
                <div class="cookie-cat__text">
                  <b>Аналитика</b>
                  <span>Счётчики посещаемости. Сейчас не подключены: скрипты не загрузятся, пока вы не согласитесь.</span>
                </div>
                <label class="switch">
                  <input type="checkbox" class="js-cookie-analytics">
                  <span>Выкл</span>
                </label>
              </div>
            </div>
            <div class="cookie__actions">
              <button type="button" class="cookie__btn cookie__btn--ghost js-cookie-reject">Только необходимые</button>
              <button type="button" class="cookie__btn cookie__btn--solid js-cookie-save">Сохранить</button>
            </div>
          </div>
        </div>
      </div>
    `.trim();
  }

  let root = null;

  function mount() {
    if (root) return root;
    const wrap = document.createElement('div');
    wrap.innerHTML = panelTemplate();
    root = wrap.firstElementChild;
    document.body.appendChild(root);
    bind(root);
    return root;
  }

  function view(name) {
    if (!root) return;
    root.querySelectorAll('.cookie__view').forEach((el) => {
      const on = el.getAttribute('data-view') === name;
      el.hidden = !on;
    });
    const card = root.querySelector('.cookie__card');
    if (name === 'settings') {
      card.setAttribute('aria-labelledby', 'cookie-settings-title');
      card.setAttribute('aria-modal', 'true');
      syncToggle(true);
    } else {
      card.setAttribute('aria-labelledby', 'cookie-title');
      card.setAttribute('aria-modal', 'false');
    }
  }

  function show(which = 'banner') {
    const el = mount();
    view(which);
    el.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open')));
    document.body.classList.add('cookie-open');
    const card = el.querySelector('.cookie__card');
    if (card) {
      card.setAttribute('tabindex', '-1');
      card.focus({ preventScroll: true });
    }
  }

  function hide() {
    if (!root || root.hidden) return;
    root.classList.remove('is-open');
    document.body.classList.remove('cookie-open');
    const done = () => { root.hidden = true; };
    root.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 400);
  }

  function syncToggle(fromStore) {
    if (!root) return;
    const box = root.querySelector('.js-cookie-analytics');
    if (!box) return;
    const label = box.parentElement.querySelector('span');
    if (fromStore) {
      const data = read();
      box.checked = !!(data && data.analytics);
    }
    if (label) label.textContent = box.checked ? 'Вкл' : 'Выкл';
  }

  function bind(el) {
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .js-cookie-analytics');
      if (!btn) return;
      if (btn.classList.contains('js-cookie-accept')) {
        write(true);
        hide();
      } else if (btn.classList.contains('js-cookie-reject')) {
        const box = el.querySelector('.js-cookie-analytics');
        if (box) box.checked = false;
        write(false);
        hide();
      } else if (btn.classList.contains('js-cookie-save')) {
        const box = el.querySelector('.js-cookie-analytics');
        write(!!(box && box.checked));
        hide();
      } else if (btn.classList.contains('js-cookie-settings')) {
        show('settings');
      }
    });

    el.addEventListener('change', (e) => {
      if (e.target.classList.contains('js-cookie-analytics')) syncToggle(false);
    });
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.js-cookie-settings');
    if (!trigger || (root && root.contains(trigger))) return;
    e.preventDefault();
    show('settings');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !root || root.hidden) return;
    if (read()) hide();
    else view('banner');
  });

  window.AndyCookies = {
    get: read,
    open: () => show('settings')
  };

  function boot() {
    const stored = read();
    if (stored) {
      apply(stored);
      return;
    }
    apply({ analytics: false });
    show('banner');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
