/* Скачать CV на языке интерфейса — без модального окна. */
(() => {
  'use strict';

  const FILES = {
    ru: 'https://www.dropbox.com/scl/fi/tz5b1p7gqfhq4m2d01whn/_-_-_.pdf?rlkey=va6bunb1asd64kpsn2iarnfaq&st=e85355oj&dl=1',
    en: 'https://www.dropbox.com/scl/fi/xxtnig7c8jgp63cg6wj4e/Andrey_Lykov_Product_Designer_EN.pdf?rlkey=4306j1wt2yogwtkixwv6d1uc8&st=ldlhzi50&dl=1'
  };

  const lang = (window.AndyI18n && AndyI18n.lang === 'en') ? 'en' : 'ru';
  const href = FILES[lang];

  document.querySelectorAll('.js-cv').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(href, '_blank', 'noopener');
    });
  });
})();
