(function () {
  const body = document.body;
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');

  function closeMenu() {
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  }

  burger.addEventListener('click', function () {
    const open = menu.hidden;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
    document.querySelectorAll('.panel').forEach(function (panel) {
      panel.hidden = true;
    });
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.querySelectorAll('[data-panel]').forEach(function (button) {
    button.addEventListener('click', function () {
      const id = button.getAttribute('aria-controls');
      const panel = document.getElementById(id);
      if (!panel) return;
      const willOpen = panel.hidden;
      document.querySelectorAll('.panel').forEach(function (other) {
        other.hidden = true;
      });
      document.querySelectorAll('[data-panel]').forEach(function (other) {
        other.setAttribute('aria-expanded', 'false');
      });
      panel.hidden = !willOpen;
      button.setAttribute('aria-expanded', String(willOpen));
      closeMenu();
    });
  });

  document.querySelectorAll('.lang__btn').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('.lang__btn').forEach(function (other) {
        const on = other === button;
        other.classList.toggle('is-active', on);
        other.setAttribute('aria-pressed', String(on));
      });
      document.documentElement.lang = button.getAttribute('data-lang') || 'en';
    });
  });

  const track = document.querySelector('.reviews__track');
  const bar = document.querySelector('.reviews__bar i');
  const cards = track ? Array.prototype.slice.call(track.children) : [];
  let index = 0;

  function showReview(next) {
    if (!track || !cards.length) return;
    index = Math.max(0, Math.min(cards.length - 1, next));
    const card = cards[index];
    const shift = card.offsetLeft - cards[0].offsetLeft;
    track.style.transform = 'translateX(' + (-shift) + 'px)';
    if (bar) {
      const portion = (index + 1) / cards.length;
      bar.style.width = Math.max(36.41, portion * 100) + '%';
    }
    cards.forEach(function (cardEl, i) {
      cardEl.setAttribute('aria-hidden', String(i !== index && window.innerWidth < 1920));
    });
  }

  document.querySelectorAll('.arrow').forEach(function (button) {
    button.addEventListener('click', function () {
      showReview(index + Number(button.getAttribute('data-dir')));
    });
  });

  window.addEventListener('resize', function () {
    showReview(index);
  });

  const form = document.querySelector('.form');
  const note = document.querySelector('.form__note');
  if (form && note) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      note.hidden = false;
      form.reset();
    });
  }

  document.querySelectorAll('.panel__form').forEach(function (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = searchForm.querySelector('input');
      if (input && input.value.trim()) {
        window.location.hash = 'catalog';
        searchForm.closest('.panel').hidden = true;
      }
    });
  });
})();
