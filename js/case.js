(() => {
  'use strict';

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const body = document.body;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
  addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.nx = e.clientX / innerWidth - 0.5;
    mouse.ny = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  /* ---------- Split text ---------- */
  function splitChars(el, baseDelay = 0) {
    const text = el.textContent.trim();
    el.textContent = '';
    el.setAttribute('aria-label', text);
    let ci = 0;
    text.split(/\s+/).forEach((word, wi) => {
      if (wi) el.appendChild(document.createTextNode(' '));
      const w = document.createElement('span');
      w.className = 'word';
      w.setAttribute('aria-hidden', 'true');
      [...word].forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        span.style.setProperty('--ci', ci++);
        if (baseDelay) span.style.setProperty('--base', baseDelay + 's');
        w.appendChild(span);
      });
      el.appendChild(w);
    });
    return $$('.char', el);
  }

  $$('.js-split').forEach((el, i) => splitChars(el, 0.35 + i * 0.15));

  // старт анимаций первого экрана — после того как уедут шторки перехода;
  // при заходе извне шторок нет (transition.js ставит is-instant), и ждать не нужно
  const noCurtains = !!$('.pt.is-instant');
  setTimeout(() => {
    body.classList.add('is-ready');
    $$('.case-hero .char').forEach((c) => c.classList.add('is-in'));
  }, noCurtains ? 50 : 250);

  /* ---------- Магнитные кнопки ---------- */
  if (finePointer && !reducedMotion) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = 'transform 0.2s ease-out';
        el.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const menu = $('.menu');
  function toggleMenu(force) {
    const open = typeof force === 'boolean' ? force : !body.classList.contains('menu-open');
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
  }
  burger.addEventListener('click', () => toggleMenu());
  $$('.menu a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- Reveal ---------- */
  const groups = new Map();
  $$('[data-reveal]').forEach((el) => {
    const parent = el.parentElement;
    const idx = groups.get(parent) || 0;
    el.style.setProperty('--d', Math.min(idx * 0.08, 0.4) + 's');
    groups.set(parent, idx + 1);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('[data-reveal], .media, .jtbd, .bigstat').forEach((el) => revealObserver.observe(el));

  /* ---------- Counters ---------- */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const to = parseFloat(el.dataset.to);
      const t0 = performance.now();
      const dur = 1600;
      (function step(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(to * eased);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.js-counter').forEach((el) => counterObserver.observe(el));

  /* ---------- Подсветка карточек за курсором ---------- */
  $$('.intro__card').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px');
      el.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });

  /* ---------- Before / After ---------- */
  $$('.ba').forEach((ba) => {
    let dragging = false;
    let touched = false;
    const set = (clientX) => {
      const r = ba.getBoundingClientRect();
      ba.style.setProperty('--pos', clamp((clientX - r.left) / r.width, 0, 1) * 100 + '%');
    };
    ba.addEventListener('pointerdown', (e) => {
      dragging = true;
      touched = true;
      ba.classList.add('is-drag');
      ba.setPointerCapture(e.pointerId);
      set(e.clientX);
    });
    ba.addEventListener('pointermove', (e) => { if (dragging) set(e.clientX); });
    const stop = () => { dragging = false; ba.classList.remove('is-drag'); };
    ba.addEventListener('pointerup', stop);
    ba.addEventListener('pointercancel', stop);

    // подсказка: слайдер сам «покачивается», когда появляется на экране
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || touched || reducedMotion) return;
      io.disconnect();
      const t0 = performance.now();
      (function wiggle(now) {
        if (touched) return;
        const t = (now - t0) / 1800;
        if (t >= 1) { ba.style.setProperty('--pos', '50%'); return; }
        const v = 50 + Math.sin(t * Math.PI * 2) * 22 * (1 - t);
        ba.style.setProperty('--pos', v + '%');
        requestAnimationFrame(wiggle);
      })(t0);
    }, { threshold: 0.6 });
    io.observe(ba);
  });

  /* ---------- Видео: играть только в зоне видимости ---------- */
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const v = entry.target;
      if (entry.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.25 });
  $$('video[data-autoplay]').forEach((v) => videoObserver.observe(v));

  /* ---------- Навигация по разделам кейса ---------- */
  const tocSections = $$('[data-rail]');
  const toc = document.createElement('nav');
  toc.className = 'toc';
  const tocLabel = (window.AndyI18n && AndyI18n.t) ? AndyI18n.t('Разделы кейса') : 'Разделы кейса';
  toc.setAttribute('aria-label', tocLabel);
  toc.innerHTML = '<div class="toc__inner"><span class="toc__pill" aria-hidden="true"></span></div>';
  const tocInner = $('.toc__inner', toc);
  const tocPill = $('.toc__pill', toc);

  tocSections.forEach((s, i) => {
    if (!s.id) s.id = 'part-' + (i + 1);
    const a = document.createElement('a');
    a.href = '#' + s.id;
    a.className = 'toc__link';
    a.textContent = s.dataset.rail;
    tocInner.appendChild(a);
  });
  if (tocSections.length) body.appendChild(toc);
  const tocLinks = $$('.toc__link', toc);
  let tocActive = null;

  function moveTocPill(link) {
    if (!link) { tocPill.style.opacity = 0; return; }
    tocPill.style.opacity = 1;
    tocPill.style.width = link.offsetWidth + 'px';
    tocPill.style.transform = `translateX(${link.offsetLeft}px)`;
    // на узких экранах панель прокручивается так, чтобы активная ссылка была по центру.
    // Мгновенно: плавная прокрутка элемента прерывает плавный переход страницы к якорю.
    if (tocInner.scrollWidth > tocInner.clientWidth) {
      tocInner.scrollLeft = link.offsetLeft - (tocInner.clientWidth - link.offsetWidth) / 2;
    }
  }

  function setTocActive(i) {
    const link = tocLinks[i] || null;
    if (link === tocActive) return;
    tocActive = link;
    tocLinks.forEach((l) => l.classList.toggle('is-active', l === link));
    if (link) link.setAttribute('aria-current', 'true');
    tocLinks.forEach((l) => { if (l !== link) l.removeAttribute('aria-current'); });
    moveTocPill(link);
  }

  // активный раздел — последний, чей верх прошёл линию на 40% высоты экрана
  function updateToc() {
    const line = innerHeight * 0.4;
    let idx = -1;
    tocSections.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) idx = i; });
    setTocActive(idx);
  }

  addEventListener('resize', () => moveTocPill(tocActive));

  /* ---------- Lightbox ---------- */
  const zoomables = $$('[data-zoom]');
  const lb = $('.lightbox');
  const lbImg = $('.lightbox__img');
  const lbCap = $('.lightbox__caption');
  let lbIdx = 0;

  function openLb(i) {
    lbIdx = (i + zoomables.length) % zoomables.length;
    const img = $('img', zoomables[lbIdx]) || zoomables[lbIdx];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
  }

  function closeLb() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
  }

  zoomables.forEach((z, i) => {
    z.addEventListener('click', () => openLb(i));
  });
  $('.lightbox__close').addEventListener('click', closeLb);
  $('.lightbox__nav--prev').addEventListener('click', (e) => { e.stopPropagation(); openLb(lbIdx - 1); });
  $('.lightbox__nav--next').addEventListener('click', (e) => { e.stopPropagation(); openLb(lbIdx + 1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lb.classList.contains('is-open')) closeLb();
      else if (body.classList.contains('menu-open')) toggleMenu(false);
    }
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft') openLb(lbIdx - 1);
    if (e.key === 'ArrowRight') openLb(lbIdx + 1);
  });

  /* ---------- Copy email ---------- */
  const toast = $('.toast');
  let toastTimer;
  $$('.js-copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const email = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(email);
        const prefix = (window.AndyI18n && AndyI18n.t)
          ? AndyI18n.t('Почта скопирована:')
          : 'Почта скопирована:';
        toast.textContent = prefix + ' ' + email;
        toast.classList.add('is-show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-show'), 2600);
      } catch {
        location.href = 'mailto:' + email;
      }
    });
  });

  /* ---------- Main loop: курсор, header, прогресс, параллакс ---------- */
  const header = $('.header');
  const progressBar = $('.progress i');
  const heroVisual = $('.case-hero__visual img');
  const heroBg = $('.case-hero__bg');
  let lastY = scrollY;
  let lastDir = 0;
  const smooth = { x: 0, y: 0 };

  function loop() {
    const y = scrollY;

    if (y !== lastY || y === 0) {
      header.classList.toggle('is-scrolled', y > 40);
      const dir = y > lastY ? 1 : y < lastY ? -1 : lastDir;
      if (dir !== lastDir || y < 100) {
        header.classList.toggle('is-hidden', dir === 1 && y > 400 && !body.classList.contains('menu-open'));
        lastDir = dir;
      }
      const max = document.documentElement.scrollHeight - innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      toc.classList.toggle('is-visible', y > innerHeight * 0.8);
      // панель опускается под шапку, когда та видна
      toc.classList.toggle('is-under-header', !header.classList.contains('is-hidden'));
      updateToc();
    }

    if (!reducedMotion && y < innerHeight * 1.2) {
      smooth.x = lerp(smooth.x, mouse.nx, 0.06);
      smooth.y = lerp(smooth.y, mouse.ny, 0.06);
      if (heroVisual) {
        heroVisual.style.transform =
          `translate3d(${smooth.x * 30}px, ${smooth.y * 20 + y * 0.12}px, 0) rotateY(${smooth.x * 8}deg) rotateX(${-smooth.y * 6}deg)`;
      }
      if (heroBg) heroBg.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
    }

    lastY = y;
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
  $('.js-year').textContent = new Date().getFullYear();
})();
