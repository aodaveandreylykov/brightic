/* Выбор языка CV: русская и английская версии с Dropbox. */
(() => {
  'use strict';

  const RU = 'https://www.dropbox.com/scl/fi/tz5b1p7gqfhq4m2d01whn/_-_-_.pdf?rlkey=va6bunb1asd64kpsn2iarnfaq&st=e85355oj&dl=1';
  const EN = 'https://www.dropbox.com/scl/fi/xxtnig7c8jgp63cg6wj4e/Andrey_Lykov_Product_Designer_EN.pdf?rlkey=4306j1wt2yogwtkixwv6d1uc8&st=ldlhzi50&dl=1';

  const root = document.createElement('div');
  root.className = 'cvdlg';
  root.hidden = true;
  root.innerHTML = `
    <div class="cvdlg__backdrop" data-cv-close></div>
    <div class="cvdlg__card" role="dialog" aria-modal="true" aria-labelledby="cvdlg-title" tabindex="-1">
      <button type="button" class="cvdlg__close" aria-label="Закрыть" data-cv-close>×</button>
      <p class="cvdlg__kicker">Резюме</p>
      <h2 class="cvdlg__title" id="cvdlg-title">Скачать CV</h2>
      <p class="cvdlg__text">Выберите язык файла</p>
      <div class="cvdlg__actions">
        <a class="cvdlg__btn cvdlg__btn--solid" href="${RU}" target="_blank" rel="noopener">Русская</a>
        <a class="cvdlg__btn cvdlg__btn--ghost" href="${EN}" target="_blank" rel="noopener">English</a>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const card = root.querySelector('.cvdlg__card');
  const firstBtn = root.querySelector('.cvdlg__btn');
  let lastFocus = null;

  document.querySelectorAll('.js-cv').forEach((el) => {
    el.setAttribute('aria-haspopup', 'dialog');
  });

  function isOpen() {
    return root.classList.contains('is-open');
  }

  function open() {
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add('cvdlg-open');
    requestAnimationFrame(() => root.classList.add('is-open'));
    (firstBtn || card).focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen()) return;
    root.classList.remove('is-open');
    document.body.classList.remove('cvdlg-open');
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      root.hidden = true;
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
    };
    root.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 400);
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.js-cv');
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      open();
      return;
    }
    if (!isOpen()) return;
    if (e.target.closest('[data-cv-close]')) close();
    if (e.target.closest('.cvdlg__btn')) setTimeout(close, 80);
  }, true);

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      close();
    }
  });
})();
