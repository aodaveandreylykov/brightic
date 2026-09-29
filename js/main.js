(() => {
  'use strict';

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const body = document.body;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isDesktop = () => innerWidth > 900;

  const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
  addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.nx = e.clientX / innerWidth - 0.5;
    mouse.ny = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  /* ---------------------------------------------------------
     Split text на символы
     --------------------------------------------------------- */
  // буквы группируются по словам, чтобы перенос строки шёл только между словами
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

  function flowChars(chars) {
    const n = chars.length;
    chars.forEach((c, i) => {
      c.style.setProperty('--flow-pos', n > 1 ? `${(i / (n - 1)) * 100}%` : '0%');
      c.style.setProperty('--flow-size', `${n * 200}%`);
    });
  }

  $$('.hero .js-split').forEach((el, i) => {
    splitChars(el, 0.15 + i * 0.18);
  });

  $$('.js-split-scroll').forEach((el) => {
    splitChars(el);
  });

  const contactTitle = $('.contact__title');
  if (contactTitle) flowChars($$('.char', contactTitle));

  // двойной rAF: первый кадр рисуется без is-ready, иначе анимации появления не запустятся
  requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('is-ready')));

  /* ---------------------------------------------------------
     Магнитные кнопки
     --------------------------------------------------------- */
  if (finePointer && !reducedMotion) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = el.classList.contains('logo') ? 0.2 : 0.35;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = 'transform 0.2s ease-out';
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------
     Scramble-эффект в навигации
     --------------------------------------------------------- */
  const glyphs = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ!<>-_\\/[]{}=+*^?#';
  $$('[data-scramble]').forEach((el) => {
    const original = el.textContent;
    let raf;
    el.addEventListener('mouseenter', () => {
      if (reducedMotion) return;
      // случайные глифы шире букв: без фиксации ширины ссылка растягивалась,
      // и плашка навигации запоминала растянутый размер и вылезала за меню
      if (!el.style.width) el.style.width = el.offsetWidth + 'px';
      let frame = 0;
      cancelAnimationFrame(raf);
      (function step() {
        el.textContent = [...original].map((ch, i) => {
          if (i < frame / 2) return original[i];
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join('');
        frame++;
        if (frame / 2 <= original.length) raf = requestAnimationFrame(step);
        else { el.textContent = original; el.style.width = ''; }
      })();
    });
  });

  /* ---------------------------------------------------------
     Навигация: плашка-индикатор и активный раздел
     --------------------------------------------------------- */
  const nav = $('.nav');
  const navLinks = $$('.nav__link');
  const pill = document.createElement('span');
  pill.className = 'nav__pill';
  nav.appendChild(pill);

  function movePill(link) {
    if (!link) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.left = link.offsetLeft + 'px';
    pill.style.width = link.offsetWidth + 'px';
  }

  let activeLink = null;
  navLinks.forEach((l) => l.addEventListener('mouseenter', () => movePill(l)));
  nav.addEventListener('mouseleave', () => movePill(activeLink));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
      activeLink = navLinks.find((l) => l.classList.contains('is-active')) || null;
      if (!nav.matches(':hover')) movePill(activeLink);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  ['projects', 'ui', 'concepts', 'experience', 'contact'].forEach((id) => {
    const s = document.getElementById(id);
    if (s) sectionObserver.observe(s);
  });

  // hero — сброс
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      navLinks.forEach((l) => l.classList.remove('is-active'));
      activeLink = null;
      movePill(null);
    }
  }, { rootMargin: '-45% 0px -50% 0px' }).observe($('.hero'));

  /* ---------------------------------------------------------
     Мобильное меню
     --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     Появление при скролле
     --------------------------------------------------------- */
  // ступенчатая задержка для соседних элементов
  const groups = new Map();
  $$('[data-reveal]').forEach((el) => {
    const parent = el.parentElement;
    const idx = groups.get(parent) || 0;
    el.style.setProperty('--d', Math.min(idx * 0.08, 0.4) + 's');
    groups.set(parent, idx + 1);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  $$('[data-reveal]').forEach((el) => revealObserver.observe(el));

  const splitObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $$('.char', entry.target).forEach((c) => c.classList.add('is-in'));
        splitObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  $$('.js-split-scroll').forEach((el) => splitObserver.observe(el));

  /* ---------------------------------------------------------
     Счётчики
     --------------------------------------------------------- */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const to = +el.dataset.to;
      const dur = 1800;
      const t0 = performance.now();
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

  // подсветка карточек статистики за курсором
  $$('.stat').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px');
      el.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });

  /* ---------------------------------------------------------
     Ротатор профессий в hero
     --------------------------------------------------------- */
  const rotItems = $$('.hero__rotator span');
  let rotIdx = 0;
  const rotator = $('.hero__rotator');
  // ширина под самое длинное слово
  rotator.style.minWidth = Math.max(...rotItems.map((s) => s.scrollWidth)) + 'px';
  setInterval(() => {
    const prev = rotItems[rotIdx];
    rotIdx = (rotIdx + 1) % rotItems.length;
    const next = rotItems[rotIdx];
    prev.classList.remove('is-active');
    prev.classList.add('is-out');
    next.classList.remove('is-out');
    next.classList.add('is-active');
    setTimeout(() => prev.classList.remove('is-out'), 650);
  }, 2200);

  /* ---------------------------------------------------------
     3D-наклон изображений в карточках
     --------------------------------------------------------- */
  if (finePointer && !reducedMotion) {
    $$('.js-tilt').forEach((media) => {
      const host = media.closest('.card__inner');
      host.style.perspective = '1200px';
      host.addEventListener('mousemove', (e) => {
        const r = media.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        media.style.transform = `rotateY(${px * 12}deg) rotateX(${-py * 10}deg)`;
      });
      host.addEventListener('mouseleave', () => { media.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     Canvas: «аврора» в hero
     --------------------------------------------------------- */
  const canvas = $('.hero__canvas');
  const ctx = canvas.getContext('2d');
  const DPR_SCALE = 0.5; // рисуем в пониженном разрешении, блюр всё равно всё сгладит
  let cw = 0;
  let ch = 0;

  const blobs = [
    { color: [61, 119, 255], r: 0.42, x: 0.7, y: 0.35, sx: 0.00023, sy: 0.00031, ph: 0 },
    { color: [139, 92, 246], r: 0.36, x: 0.85, y: 0.7, sx: 0.00018, sy: 0.00027, ph: 2 },
    { color: [250, 135, 107], r: 0.24, x: 0.3, y: 0.85, sx: 0.00029, sy: 0.00019, ph: 4 },
  ];

  function resizeCanvas() {
    const r = canvas.getBoundingClientRect();
    cw = canvas.width = Math.max(1, Math.round(r.width * DPR_SCALE));
    ch = canvas.height = Math.max(1, Math.round(r.height * DPR_SCALE));
  }

  const heroMouse = { x: 0.6, y: 0.4 };
  function drawAurora(t) {
    heroMouse.x = lerp(heroMouse.x, mouse.x / innerWidth, 0.04);
    heroMouse.y = lerp(heroMouse.y, mouse.y / innerHeight, 0.04);

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'lighter';

    const size = Math.max(cw, ch);
    blobs.forEach((b, i) => {
      let x = b.x + Math.sin(t * b.sx + b.ph) * 0.12;
      let y = b.y + Math.cos(t * b.sy + b.ph) * 0.1;
      // первый блоб тянется к курсору
      if (i === 0) {
        x = lerp(x, heroMouse.x, 0.45);
        y = lerp(y, heroMouse.y, 0.45);
      }
      const px = x * cw;
      const py = y * ch;
      const rad = b.r * size;
      const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
      const [r, gg, bb] = b.color;
      g.addColorStop(0, `rgba(${r},${gg},${bb},0.32)`);
      g.addColorStop(0.5, `rgba(${r},${gg},${bb},0.1)`);
      g.addColorStop(1, `rgba(${r},${gg},${bb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
    });
  }

  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe($('.hero'));

  /* ---------------------------------------------------------
     Стек карточек проектов
     --------------------------------------------------------- */
  const cards = $$('.card');
  cards.forEach((c) => {
    const inner = $('.card__inner', c);
    const dim = document.createElement('span');
    dim.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:5;border-radius:inherit;transition:opacity .1s';
    inner.appendChild(dim);
    c._inner = inner;
    c._dim = dim;
  });

  function measureStack() {
    cards.forEach((c) => { c._top = parseFloat(getComputedStyle(c).top) || 0; });
  }

  function updateStack() {
    const vh = innerHeight;
    const progress = cards.map((c) => {
      const r = c.getBoundingClientRect();
      return clamp((vh - r.top) / (vh - c._top), 0, 1);
    });
    cards.forEach((c, i) => {
      let covered = 0;
      for (let j = i + 1; j < cards.length; j++) covered += progress[j];
      const scale = 1 - covered * 0.05;
      c._inner.style.transform = `scale(${scale})`;
      c._dim.style.opacity = Math.min(covered * 0.35, 0.6);
    });
  }

  /* ---------------------------------------------------------
     Горизонтальная галерея
     --------------------------------------------------------- */
  const hs = $('.hscroll');
  const hsTrack = $('.hscroll__track');
  const hsBar = $('.js-hs-bar');
  const hsCurrent = $('.js-hs-current');
  const shots = $$('.hscroll .shot');
  let hsDistance = 0;

  function sizeHScroll() {
    if (!isDesktop()) {
      hs.style.height = '';
      hsTrack.style.transform = '';
      const max = hsTrack.scrollWidth - hsTrack.clientWidth;
      setHsIndicator(max > 0 ? clamp(hsTrack.scrollLeft / max, 0, 1) : 0);
      return;
    }
    hsDistance = Math.max(0, hsTrack.scrollWidth - innerWidth);
    hs.style.height = hsDistance + innerHeight + 'px';
  }

  let lastScrollY = scrollY;
  let velocity = 0;

  function setHsIndicator(p) {
    hsBar.style.transform = `scaleX(${p})`;
    const idx = Math.min(shots.length - 1, Math.round(p * (shots.length - 1)));
    hsCurrent.textContent = String(idx + 1).padStart(2, '0');
  }

  function updateHScroll() {
    if (!isDesktop()) return;
    const r = hs.getBoundingClientRect();
    const total = hs.offsetHeight - innerHeight;
    const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    hsTrack.style.transform = `translate3d(${-p * hsDistance}px,0,0)`;
    setHsIndicator(p);
  }

  // на мобильных галерея листается нативным свайпом, поэтому индикатор ведём по scrollLeft
  hsTrack.addEventListener('scroll', () => {
    if (isDesktop()) return;
    const max = hsTrack.scrollWidth - hsTrack.clientWidth;
    setHsIndicator(max > 0 ? clamp(hsTrack.scrollLeft / max, 0, 1) : 0);
  }, { passive: true });

  /* ---------------------------------------------------------
     Таймлайн опыта
     --------------------------------------------------------- */
  const timeline = $('.timeline');
  const timelineFill = $('.js-timeline-fill');
  function updateTimeline() {
    const r = timeline.getBoundingClientRect();
    const p = clamp((innerHeight * 0.7 - r.top) / r.height, 0, 1);
    timelineFill.style.transform = `scaleY(${p})`;
  }

  // аккордеон: открыт только один
  const jobs = $$('.job');
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  jobs.forEach((job) => {
    const bodyEl = $('.job__body', job);
    // элементы, которые появляются поочерёдно: абзац и карточки результатов
    job._items = [...bodyEl.children].flatMap((el) => (el.matches('.job__results') ? [...el.children] : [el]));
    $$('.job__results li', job).forEach((li, i) => li.style.setProperty('--li', i));
    job._body = bodyEl;
  });

  function cancelJobAnims(job) {
    (job._anims || []).forEach((a) => a.cancel());
    job._anims = [];
  }

  function openJob(job) {
    cancelJobAnims(job);
    job.open = true;
    job.classList.add('is-open');
    if (reducedMotion) return;

    const b = job._body;
    const h = b.offsetHeight;
    b.classList.add('is-animating');
    const hAnim = b.animate(
      [{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }],
      { duration: 650, easing: EASE }
    );
    hAnim.onfinish = () => b.classList.remove('is-animating');

    const itemAnims = job._items.map((el, i) => {
      const fromRight = el.tagName === 'LI' && isDesktop();
      return el.animate(
        [
          { opacity: 0, transform: fromRight ? 'translateX(40px)' : 'translateY(24px)', filter: 'blur(6px)' },
          { opacity: 1, transform: 'none', filter: 'blur(0)' },
        ],
        { duration: 700, delay: 120 + i * 90, easing: EASE, fill: 'backwards' }
      );
    });
    job._anims = [hAnim, ...itemAnims];
  }

  function closeJob(job) {
    cancelJobAnims(job);
    job.classList.remove('is-open');
    if (reducedMotion) { job.open = false; return; }

    const b = job._body;
    b.classList.add('is-animating');
    const hAnim = b.animate(
      [{ height: b.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
      { duration: 450, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' }
    );
    const itemAnims = job._items.map((el) => el.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }],
      { duration: 250, easing: 'ease-in', fill: 'forwards' }
    ));
    hAnim.onfinish = () => {
      job.open = false;
      b.classList.remove('is-animating');
      itemAnims.forEach((a) => a.cancel());
    };
    job._anims = [hAnim, ...itemAnims];
  }

  jobs.forEach((job) => {
    $('summary', job).addEventListener('click', (e) => {
      e.preventDefault();
      if (job.classList.contains('is-open')) {
        closeJob(job);
      } else {
        jobs.forEach((o) => { if (o !== job && o.classList.contains('is-open')) closeJob(o); });
        openJob(job);
      }
    });
  });

  // первый пункт открыт сразу, без анимации
  jobs[0].open = true;
  jobs[0].classList.add('is-open');

  /* ---------------------------------------------------------
     Бегущая строка — реагирует на скорость скролла
     --------------------------------------------------------- */
  const mqTrack = $('.marquee__track');
  const mqRow = $('.marquee__row');
  let mqX = 0;
  let mqDir = -1;

  function updateMarquee(dt) {
    const w = mqRow.offsetWidth;
    if (!w) return;
    if (velocity > 0.5) mqDir = -1;
    else if (velocity < -0.5) mqDir = 1;
    const speed = (0.06 + Math.min(Math.abs(velocity) * 0.02, 0.8)) * dt;
    mqX += speed * mqDir;
    if (mqX <= -w) mqX += w;
    if (mqX > 0) mqX -= w;
    mqTrack.style.transform = `translate3d(${mqX}px,0,0)`;
  }

  /* ---------------------------------------------------------
     Header + прогресс
     --------------------------------------------------------- */
  const header = $('.header');
  const progressBar = $('.progress i');
  let lastDir = 0;

  function updateHeader(y) {
    header.classList.toggle('is-scrolled', y > 40);
    const dir = y > lastScrollY ? 1 : y < lastScrollY ? -1 : lastDir;
    if (dir !== lastDir || y < 100) {
      header.classList.toggle('is-hidden', dir === 1 && y > 400 && !body.classList.contains('menu-open'));
      lastDir = dir;
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }

  /* ---------------------------------------------------------
     Параллакс и «плавающие» элементы в hero
     --------------------------------------------------------- */
  const parallaxEls = $$('.js-parallax');
  const floatEls = $$('.js-float');
  const heroSmooth = { x: 0, y: 0 };

  function updateHeroMotion(t, y) {
    heroSmooth.x = lerp(heroSmooth.x, mouse.nx, 0.06);
    heroSmooth.y = lerp(heroSmooth.y, mouse.ny, 0.06);
    parallaxEls.forEach((el) => {
      const s = +el.dataset.speed || 0.1;
      el.style.transform = `translate3d(${heroSmooth.x * -20}px, ${y * s + heroSmooth.y * -14}px, 0)`;
    });
    floatEls.forEach((el, i) => {
      const bob = Math.sin(t * 0.0012 + i * 1.7) * 8;
      const depth = 30 + i * 14;
      el.style.transform = `translate3d(${heroSmooth.x * depth}px, ${bob + heroSmooth.y * depth - y * 0.05 * (i + 1)}px, 0)`;
    });
  }

  /* ---------------------------------------------------------
     Главный цикл
     --------------------------------------------------------- */
  let prevT = performance.now();
  let needsUpdate = true;

  function loop(t) {
    const dt = Math.min(t - prevT, 50);
    prevT = t;
    const y = scrollY;

    velocity = lerp(velocity, y - lastScrollY, 0.2);

    if (heroVisible) {
      drawAurora(t);
      if (!reducedMotion) updateHeroMotion(t, y);
    }

    // скролл-зависимые эффекты — только когда страница движется
    if (needsUpdate || y !== lastScrollY || Math.abs(velocity) > 0.05) {
      updateHeader(y);
      updateStack();
      updateHScroll();
      updateTimeline();
      needsUpdate = false;
    }
    if (!reducedMotion) updateMarquee(dt);

    lastScrollY = y;
    requestAnimationFrame(loop);
  }

  function onResize() {
    resizeCanvas();
    sizeHScroll();
    measureStack();
    movePill(activeLink);
    needsUpdate = true;
  }

  addEventListener('resize', onResize);
  addEventListener('load', onResize);
  onResize();
  if (reducedMotion) drawAurora(0);
  requestAnimationFrame(loop);

  /* ---------------------------------------------------------
     Лайтбокс
     --------------------------------------------------------- */
  const lb = $('.lightbox');
  const lbImg = $('.lightbox__img');
  const lbCap = $('.lightbox__caption');
  let lbItems = [];
  let lbIdx = 0;

  function openLb(list, i) {
    if (!list.length) return;
    lbItems = list;
    lbIdx = (i + lbItems.length) % lbItems.length;
    const img = $('img', lbItems[lbIdx]);
    if (!img || !img.getAttribute('src')) return;
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

  function shotsForLightbox(from) {
    const root = from.closest('.hscroll, .concepts') || document;
    return $$('.shot', root).filter((el) => {
      if (el.classList.contains('shot--soon')) return false;
      const img = $('img', el);
      return img && img.getAttribute('src');
    });
  }

  $$('.shot').forEach((s) => {
    s.addEventListener('click', () => {
      const list = shotsForLightbox(s);
      const i = list.indexOf(s);
      if (i < 0) return;
      openLb(list, i);
    });
  });
  $('.lightbox__close').addEventListener('click', closeLb);
  $('.lightbox__nav--prev').addEventListener('click', (e) => { e.stopPropagation(); openLb(lbItems, lbIdx - 1); });
  $('.lightbox__nav--next').addEventListener('click', (e) => { e.stopPropagation(); openLb(lbItems, lbIdx + 1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lb.classList.contains('is-open')) closeLb();
      else if (body.classList.contains('menu-open')) toggleMenu(false);
    }
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft') openLb(lbItems, lbIdx - 1);
    if (e.key === 'ArrowRight') openLb(lbItems, lbIdx + 1);
  });

  /* ---------------------------------------------------------
     Копирование почты
     --------------------------------------------------------- */
  const toast = $('.toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-show'), 2600);
  }

  $$('.js-copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const email = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(email);
        showToast('Почта скопирована: ' + email);
      } catch {
        location.href = 'mailto:' + email;
      }
    });
  });

  $('.js-year').textContent = new Date().getFullYear();
})();
