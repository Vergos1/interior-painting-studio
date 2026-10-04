/* Оклен — малярні роботи. GSAP + ScrollTrigger + Flip + Lenis */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap) gsap.registerPlugin(...[window.ScrollTrigger, window.Flip].filter(Boolean));

  /* ---------- broken stock photo fallback ---------- */
  // hide only images whose real URL failed; a later successful load always shows them again
  document.addEventListener('error', e => { const t = e.target; if (t.tagName === 'IMG' && t.getAttribute('src')) t.classList.add('is-broken'); }, true);
  document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.remove('is-broken'); }, true);

  /* ---------- scroll lock ---------- */
  // Freeze the page (body becomes position: fixed at the current offset) so nothing behind
  // a modal can scroll: wheel, touch, keyboard, Lenis. Inner modal content keeps its own scroll.
  let lockedY = 0, isLocked = false;
  const lock = on => {
    const root = document.documentElement, body = document.body;
    if (on === isLocked) return;
    isLocked = on;
    if (on) {
      lockedY = window.scrollY;
      root.style.setProperty('--sbw', (innerWidth - root.clientWidth) + 'px');
      if (lenis) lenis.stop();
      Object.assign(body.style, { position: 'fixed', top: `-${lockedY}px`, left: '0', right: '0', width: '100%' });
      root.classList.add('is-locked');
    } else {
      root.classList.remove('is-locked');
      Object.assign(body.style, { position: '', top: '', left: '', right: '', width: '' });
      root.style.removeProperty('--sbw');
      window.scrollTo(0, lockedY);
      if (lenis) { lenis.scrollTo(lockedY, { immediate: true, force: true }); lenis.start(); }
    }
  };

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4) });
    if (hasGsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = target => lenis ? lenis.scrollTo(target, { offset: -60 }) : target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  const toTop = () => lenis ? lenis.scrollTo(0, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) }) : window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  $$('[data-totop]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); closeMenu(); toTop(); }));
  $$('a[href^="#"]:not([data-totop])').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id.length > 1 ? $(id) : document.body;
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollTo(id === '#top' ? 0 : el);
  }));

  /* ---------- header, progress, call bar ---------- */
  const header = $('.header'), bar = $('.progress span'), callbar = $('.callbar'), totop = $('.totop');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    header.classList.toggle('is-solid', y > 40);
    header.classList.toggle('is-hidden', y > 400 && y > lastY && !document.body.classList.contains('menu-open'));
    callbar && callbar.classList.toggle('is-visible', y > innerHeight * .6);
    if (totop) { totop.classList.toggle('is-visible', y > innerHeight * 1.2); totop.style.setProperty('--off', 1 - (h > 0 ? y / h : 0)); }
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- burger ---------- */
  const burger = $('.burger'), menu = $('#menu');
  function closeMenu() {
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Відкрити меню');
    menu.setAttribute('aria-hidden', 'true');
    lock(false);
  }
  burger.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open');
    if (!open) return closeMenu();
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Закрити меню');
    menu.setAttribute('aria-hidden', 'false');
    lock(true);
    if (hasGsap && !reduce) gsap.fromTo($$('.menu__nav a'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .05, delay: .25 });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeLightbox(); } });

  /* ---------- marquees (GSAP, slow on hover) ---------- */
  const loops = [];
  function marquee(track, speed, dir = -1) {
    track.innerHTML += track.innerHTML; // duplicate for seamless loop
    if (!hasGsap || reduce) return;
    const tw = gsap.fromTo(track, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: speed, ease: 'none', repeat: -1 });
    loops.push(tw);
    return tw;
  }
  $$('[data-marquee]').forEach(t => marquee(t, +t.dataset.marquee));
  $$('[data-reel]').forEach(reel => {
    const tw = marquee($('.reel__track', reel), 55, +reel.dataset.reel);
    if (!tw) return;
    reel.addEventListener('mouseenter', () => gsap.to(tw, { timeScale: .2, duration: .8, ease: 'power3.out' }));
    reel.addEventListener('mouseleave', () => gsap.to(tw, { timeScale: 1, duration: .8, ease: 'power3.out' }));
  });

  /* ---------- before / after ---------- */
  const ba = $('[data-ba]');
  if (ba) {
    const range = $('.ba__range', ba);
    const set = v => { v = Math.max(0, Math.min(100, v)); ba.style.setProperty('--pos', v + '%'); range.value = v; };
    range.addEventListener('input', () => set(+range.value));
    let drag = false;
    const fromEvent = e => { const r = ba.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
    ba.addEventListener('pointerdown', e => { drag = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
    ba.addEventListener('pointermove', e => drag && fromEvent(e));
    ba.addEventListener('pointerup', () => { drag = false; });
    ba.addEventListener('pointercancel', () => { drag = false; });
  }

  /* ---------- gallery filter (Flip) + lightbox ---------- */
  const items = $$('.gitem'), chips = $$('.filters .chip'), gallery = $('.gallery');
  // Fill every row: pick column count by width and filter, widen a few cards to close gaps
  function layoutGallery() {
    const vis = items.filter(i => !i.classList.contains('is-hidden'));
    const n = vis.length, w = innerWidth;
    const base = w <= 420 ? 2 : w <= 820 ? 2 : 4;
    const all = $('.filters .chip.is-active').dataset.filter === 'all';
    let cols = all ? base : Math.min(n, base === 4 ? 3 : 2);
    cols = Math.max(cols, 1);
    gallery.style.setProperty('--cols', cols);
    gallery.toggleAttribute('data-few', !all && n <= 3);
    items.forEach(i => i.classList.remove('gitem--wide'));
    let need = cols > 1 ? (cols - (n % cols)) % cols : 0;
    if (need) {
      const step = Math.max(1, Math.floor(n / need));
      for (let k = 0; k < need && k * step < n; k++) vis[k * step].classList.add('gitem--wide');
    }
  }
  layoutGallery();
  let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(layoutGallery, 150); });
  let filtering = false, outTl = null, inTl = null;
  const cardIn = els => gsap.timeline()
    .fromTo(els, { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1, ease: 'expo.out', stagger: .07 }, 0)
    .fromTo(els.map(e => $('img', e)), { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'expo.out', stagger: .07 }, 0)
    .fromTo(els.map(e => $('.gitem__cap', e)), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, ease: 'power3.out', stagger: .07 }, .35)
    .set(els, { clearProps: 'clipPath' })
    .set(els.map(e => $('img', e)), { clearProps: 'transform' });
  const resetCards = () => {
    gsap.set(items, { clearProps: 'clipPath,opacity' });
    gsap.set(items.map(e => $('img', e)), { clearProps: 'transform' });
    gsap.set(items.map(e => $('.gitem__cap', e)), { clearProps: 'opacity,transform' });
  };
  chips.forEach(chip => chip.addEventListener('click', () => {
    if (chip.classList.contains('is-active')) return;
    const f = chip.dataset.filter;
    const show = it => f === 'all' || it.dataset.cat === f;
    chips.forEach(c => { const on = c === chip; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on); });
    const apply = () => { items.forEach(it => it.classList.toggle('is-hidden', !show(it))); layoutGallery(); };
    const refresh = () => window.ScrollTrigger && ScrollTrigger.refresh();
    if (!hasGsap || reduce) { apply(); refresh(); return; }
    gsap.fromTo(chip, { scale: .92 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .5)' });
    const runIn = () => {
      apply(); resetCards(); refresh();
      const next = items.filter(it => !it.classList.contains('is-hidden'));
      inTl = cardIn(next).eventCallback('onComplete', () => { filtering = false; inTl = null; });
    };
    // a new tab while the previous animation is still running: cut it and show the new set right away
    if (filtering) {
      outTl && outTl.kill(); inTl && inTl.kill(); outTl = inTl = null;
      runIn();
      return;
    }
    filtering = true;
    const current = items.filter(it => !it.classList.contains('is-hidden'));
    outTl = gsap.timeline({ onComplete: () => { outTl = null; runIn(); } })
      .to(current.map(e => $('.gitem__cap', e)), { opacity: 0, y: 10, duration: .25, ease: 'power2.in', stagger: .02 }, 0)
      .to(current, { clipPath: 'inset(0% 0% 100% 0% round 22px)', duration: .5, ease: 'expo.in', stagger: { each: .03, from: 'end' } }, .05);
  }));

  // first appearance on scroll
  if (hasGsap && !reduce && window.ScrollTrigger) {
    const first = items.filter(it => !it.classList.contains('is-hidden'));
    gsap.set(first, { clipPath: 'inset(100% 0% 0% 0% round 22px)' });
    ScrollTrigger.create({ trigger: gallery, start: 'top 80%', once: true, onEnter: () => cardIn(first) });
  }

  /* ---------- project viewer: several photos + details per object ----------
     Mock data: replace photos and texts with real objects. */
  const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
  const PX = (id, ext = 'jpeg') => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&w=1600`;
  const PROJECTS = [
    { title: 'Вітальня з паркетом', loc: 'Олексіївка, вул. Клочківська', area: '52 м² стін', time: '6 днів', year: '2026', paint: 'Caparol, матова миюча',
      desc: 'Стара фарба з тріщинами по кутах. Зняли верхній шар, прошпаклювали у 2 шари під лампу й пофарбували у теплий білий.',
      works: ['Видалення старої фарби', 'Фінішна шпаклівка', 'Фарбування стін', 'Укоси вікон'], photos: [U('1493809842364-78817add7ffb'), PX(5691622), PX(7218579), U('1586023492125-27b2c045efd7')] },
    { title: 'Спальня у сірому', loc: 'Салтівка, Північна Салтівка', area: '38 м² стін + 14 м² стелі', time: '5 днів', year: '2026', paint: 'Tikkurila, глибоко-матова',
      desc: 'Спокійний сірий з акцентом за узголів’ям. Стелю вирівняли й пофарбували без смуг під бокове світло.',
      works: ['Шпаклівка стелі', 'Фарбування стелі', 'Фарбування стін', 'Акцентна стіна'], photos: [U('1505693416388-ac5ce068fe85'), U('1615874959474-d609969a20ed'), PX(5691610)] },
    { title: 'Фасадні елементи будинку', loc: 'П’ятихатки', area: '120 м²', time: '9 днів', year: '2025', paint: 'Sniezka, фасадна',
      desc: 'Перефарбування дерев’яних і металевих елементів: віконниці, перила, двері. Захисні шари під погоду.',
      works: ['Підготовка дерева', 'Фарбування дерева', 'Метал: перила', 'Двері з лиштвою'], photos: [U('1600585154340-be6161a56a0c'), PX(14613134, 'png'), PX(7217987)] },
    { title: 'IT-офіс на 140 м²', loc: 'Центр, вул. Сумська', area: '310 м² стін', time: '2 вихідних + 3 дні', year: '2025', paint: 'Caparol, зносостійка',
      desc: 'Фарбували вечорами й у вихідні, щоб команда працювала без перерв. Безповітряним методом — рівно і швидко.',
      works: ['Ґрунтування', 'Безповітряне фарбування', 'Фарбування дверей', 'Прибирання щодня'], photos: [U('1497366216548-37526070297c'), U('1524758631624-e2822e304c36'), PX(7218029)] },
    { title: 'Котедж: вітальня й хол', loc: 'Жуковського', area: '96 м² стін + 40 м² стелі', time: '12 днів', year: '2026', paint: 'Tikkurila, шовковисто-матова',
      desc: 'Повна підготовка після будівельників: армування сіткою, 2 шари шпаклівки, шліфування та фарбування у світлий беж.',
      works: ['Армування сіткою', 'Шпаклівка під фарбу', 'Стеля', 'Стіни', 'Молдинги'], photos: [U('1583847268964-b28dc8f51f92'), PX(5691622), PX(5691610), U('1554995207-c18c203602cb')] },
    { title: 'Студія під оренду', loc: 'ХТЗ', area: '64 м² стін', time: '4 дні', year: '2026', paint: 'Sniezka, миюча',
      desc: 'Швидке оновлення між орендарями: закладення тріщин, ґрунт і 2 шари стійкої до миття фарби.',
      works: ['Закладення тріщин', 'Ґрунтування', 'Фарбування стін', 'Батареї'], photos: [U('1522708323590-d24dbb6b0267'), PX(5583116), PX(5691694)] },
    { title: 'Ефект шовку у вітальні', loc: 'Нагірний район', area: '18 м²', time: '3 дні', year: '2025', paint: 'Декоративна, перламутрова',
      desc: 'Акцентна стіна з м’яким перламутровим блиском. Підібрали відтінок на трьох пробних викрасах.',
      works: ['Підготовка основи', 'Декоративне фарбування', 'Пробні викраси'], photos: [U('1616486338812-3dadae4b4ace'), PX(37486125), U('1618221195710-dd6b41faaea6')] },
    { title: 'Вітальня в приватному будинку', loc: 'Пісочин', area: '70 м² стін', time: '7 днів', year: '2025', paint: 'Caparol, матова',
      desc: 'Світлі стіни під дерев’яні меблі. Плінтуси й укоси пофарбували окремо, з чіткою лінією під скотч.',
      works: ['Шпаклівка під фарбу', 'Фарбування стін', 'Укоси', 'Плінтуси'], photos: [U('1513694203232-719a280e022f'), PX(7217987), PX(7218579)] },
    { title: 'Двоколірна стіна', loc: 'Центр', area: '22 м²', time: '2 дні', year: '2026', paint: 'Tikkurila, глибоко-матова',
      desc: 'Розділення стіни на два кольори з рівною горизонтальною лінією на висоті 1,1 м.',
      works: ['Розмітка', 'Фарбування у два кольори'], photos: [U('1567016432779-094069958ea5'), PX(7217987), PX(5583126)] },
    { title: 'Акцентна стіна за диваном', loc: 'Олексіївка', area: '15 м²', time: '1 день', year: '2026', paint: 'Sniezka, матова',
      desc: 'Одна стіна в насиченому кольорі, щоб зонувати кімнату. Решту освіжили в білому.',
      works: ['Фарбування стін', 'Акцентна стіна'], photos: [U('1484101403633-562f891dc89a'), PX(5583126)] },
    { title: 'Шоурум меблів', loc: 'Центр, вул. Сумська', area: '180 м² стін', time: '6 днів', year: '2025', paint: 'Caparol, зносостійка',
      desc: 'Білі стіни, на яких добре виглядають меблі. Працювали до відкриття, без зупинки продажів.',
      works: ['Ґрунтування', 'Безповітряне фарбування', 'Молдинги'], photos: [U('1524758631624-e2822e304c36'), U('1497366216548-37526070297c'), PX(7218029)] },
  ];
  const CAT_NAME = { flat: 'Квартира', house: 'Будинок', office: 'Офіс', decor: 'Декор' };

  const lb = $('.lightbox');
  document.body.appendChild(lb); // out of any transformed/animated parent
  lb.setAttribute('data-lenis-prevent', '');
  const pvBox = $('.pv', lb);
  const pvImg = $('.pv__img', lb), pvThumbs = $('[data-pv-thumbs]', lb), pvCount = $('[data-pv-count]', lb), pvInfo = $('.pv__info', lb);
  const F = k => $(`[data-pv-${k}]`, lb);
  let lbIndex = -1, photoIdx = 0, lastFocus = null;
  const visible = () => items.filter(i => !i.classList.contains('is-hidden'));
  const currentProject = () => PROJECTS[+visible()[lbIndex].dataset.id];

  function showPhoto(i, dir = 1) {
    const p = currentProject(), n = p.photos.length;
    photoIdx = (i + n) % n;
    pvImg.src = p.photos[photoIdx]; pvImg.alt = `${p.title}, фото ${photoIdx + 1}`;
    pvCount.textContent = `${photoIdx + 1} / ${n}`;
    $$('.pv__thumb', pvThumbs).forEach((t, k) => { t.classList.toggle('is-on', k === photoIdx); t.setAttribute('aria-current', k === photoIdx); });
    if (hasGsap && !reduce) gsap.fromTo(pvImg, { clipPath: dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)', scale: 1.06 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: .8, ease: 'expo.out' });
  }
  function openLightbox(i) {
    const list = visible(); lbIndex = (i + list.length) % list.length;
    const item = list[lbIndex], p = currentProject();
    F('cat').textContent = CAT_NAME[item.dataset.cat] || '';
    F('title').textContent = p.title; F('loc').textContent = p.loc; F('desc').textContent = p.desc;
    F('area').textContent = p.area; F('time').textContent = p.time; F('year').textContent = p.year; F('paint').textContent = p.paint;
    F('works').innerHTML = p.works.map(w => `<li>${w}</li>`).join('');
    pvThumbs.innerHTML = p.photos.map((src, k) => `<button class="pv__thumb" aria-label="Фото ${k + 1}"><img src="${src.replace('w=1600', 'w=300')}" alt="" loading="lazy"></button>`).join('');
    $$('.pv__thumb', pvThumbs).forEach((t, k) => t.addEventListener('click', () => showPhoto(k, k > photoIdx ? 1 : -1)));
    const opening = lb.hidden;
    if (opening) {
      lastFocus = document.activeElement; lb.hidden = false; lock(true);
      if (hasGsap && !reduce) {
        gsap.killTweensOf([lb, pvBox]);
        gsap.timeline()
          .fromTo(lb, { opacity: 0 }, { opacity: 1, duration: .45, ease: 'power2.out' }, 0)
          .fromTo(pvBox, { y: 60, scale: .96, clipPath: 'inset(8% 4% 8% 4% round 32px)' },
            { y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1, ease: 'expo.out', clearProps: 'clipPath,transform' }, .05)
          .fromTo('.lightbox__close', { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: .6, ease: 'back.out(1.7)' }, .3);
      }
    }
    showPhoto(0);
    pvInfo.scrollTop = 0;
    if (hasGsap && !reduce) gsap.fromTo(pvInfo.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out', stagger: .04 });
    if (opening) $('.lightbox__close', lb).focus();
  }
  let closing = false;
  function closeLightbox() {
    if (!lb || lb.hidden || closing) return;
    const done = () => { lb.hidden = true; closing = false; gsap && gsap.set && gsap.set([lb, pvBox], { clearProps: 'all' }); lock(false); lastFocus && lastFocus.focus({ preventScroll: true }); };
    if (!hasGsap || reduce) return done();
    closing = true;
    gsap.timeline({ onComplete: done })
      .to('.lightbox__close', { scale: 0, rotate: 90, duration: .3, ease: 'power2.in' }, 0)
      .to(pvBox, { y: 40, scale: .97, opacity: 0, duration: .4, ease: 'power3.in' }, 0)
      .to(lb, { opacity: 0, duration: .35, ease: 'power2.in' }, .15);
  }
  items.forEach(it => it.addEventListener('click', () => openLightbox(visible().indexOf(it))));
  $('.lightbox__close', lb).addEventListener('click', closeLightbox);
  $('.pv__prev', lb).addEventListener('click', () => showPhoto(photoIdx - 1, -1));
  $('.pv__next', lb).addEventListener('click', () => showPhoto(photoIdx + 1, 1));
  F('prev').addEventListener('click', () => openLightbox(lbIndex - 1));
  F('next').addEventListener('click', () => openLightbox(lbIndex + 1));
  F('cta').addEventListener('click', () => closeLightbox());
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  // inside the modal: let scrollable parts scroll, swallow everything else
  const canScroll = el => {
    for (let n = el; n && n !== lb; n = n.parentElement) {
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY) && n.scrollHeight > n.clientHeight + 1) return true;
    }
    return false;
  };
  ['wheel', 'touchmove'].forEach(ev => lb.addEventListener(ev, e => { if (!canScroll(e.target)) e.preventDefault(); }, { passive: false }));
  // swipe between photos on the image
  let sx = null;
  $('.pv__stage', lb).addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  $('.pv__stage', lb).addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) showPhoto(photoIdx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'ArrowRight') showPhoto(photoIdx + 1, 1);
    if (e.key === 'ArrowLeft') showPhoto(photoIdx - 1, -1);
  });

  /* ---------- FAQ accordion: Flip slides the rows, clip-path reveals the text ---------- */
  const accItems = $$('.acc__item');
  const flipTargets = () => [...$$('.acc__btn'), $('.acc__end'), ...$$('.acc__panel:not([hidden]) p'), $('#form'), $('.footer')].filter(Boolean);
  const canFlip = () => hasGsap && window.Flip && !reduce;
  let accBusy = false;
  const setOpen = (item, open) => {
    item.classList.toggle('is-open', open);
    $('.acc__btn', item).setAttribute('aria-expanded', open);
    $('.acc__panel', item).hidden = !open;
  };
  const relayout = (mutate, done) => {
    if (!canFlip()) { mutate(); done && done(); window.ScrollTrigger && ScrollTrigger.refresh(); return; }
    const state = Flip.getState(flipTargets());
    mutate();
    Flip.from(state, { duration: .45, ease: 'power3.out', onComplete: () => { done && done(); ScrollTrigger.refresh(); } });
  };
  accItems.forEach(item => {
    $('.acc__btn', item).addEventListener('click', () => {
      if (accBusy) return;
      const opening = !item.classList.contains('is-open');
      const others = accItems.filter(o => o !== item && o.classList.contains('is-open'));
      const text = $('.acc__panel p', item);
      if (opening) {
        accBusy = true;
        relayout(() => { others.forEach(o => setOpen(o, false)); setOpen(item, true); }, () => (accBusy = false));
        if (canFlip()) gsap.fromTo(text, { clipPath: 'inset(0% 0% 100% 0%)', y: -16, opacity: 0 },
          { clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1, duration: .45, delay: .05, ease: 'power3.out', clearProps: 'clipPath,transform,opacity' });
      } else if (canFlip()) {
        accBusy = true;
        gsap.to(text, { clipPath: 'inset(0% 0% 100% 0%)', y: -8, opacity: 0, duration: .16, ease: 'power2.in', onComplete: () => {
          gsap.set(text, { clearProps: 'clipPath,transform,opacity' });
          relayout(() => setOpen(item, false), () => (accBusy = false));
        } });
      } else {
        relayout(() => setOpen(item, false));
      }
    });
  });

  /* ---------- lead form ---------- */
  const form = $('.form'), success = $('.success'), err = $('.form__error');
  const phone = form.elements.phone, estMin = $('[data-est-min]'), estMax = $('[data-est-max]');
  const fmt = n => n.toLocaleString('uk-UA');
  /* ---------- calculator + live object preview ----------
     Rates: average prices of good painters in Kharkiv, 2026 (work only, materials extra).
     per = output of one painter per working day; dry = extra days for drying.
     Final price is always fixed after an on-site survey. */
  const WORKS = {
    prep:      { name: 'Шпаклівка',  unit: 'м²',     min: 205, max: 260, per: 15, dry: 1, color: '#9C9580' }, // ґрунт 35 + фініш 2 шари 170
    ceiling:   { name: 'Стеля',      unit: 'м²',     min: 130, max: 170, per: 35, dry: 0, color: '#F7F4EA' },
    walls:     { name: 'Стіни',      unit: 'м²',     min: 110, max: 140, per: 50, dry: 0, color: '#EBDB9C' },
    slopes:    { name: 'Укоси',      unit: 'пог. м', min: 250, max: 320, per: 10, dry: 0, color: '#B7AE96' }, // підготовка 160 + фарба 90
    decor:     { name: 'Декор',      unit: 'м²',     min: 350, max: 600, per: 10, dry: 1, color: '#C9A27E' },
    doors:     { name: 'Двері',      unit: 'шт',     min: 650, max: 900, per: 2,  dry: 0, color: '#6F7A68' },
    radiators: { name: 'Батареї',    unit: 'шт',     min: 250, max: 400, per: 5,  dry: 0, color: '#8A8F95' },
  };
  const ORDER = ['prep', 'ceiling', 'walls', 'slopes', 'decor', 'doors', 'radiators'];
  const PAINT_L = { walls: .25, ceiling: .25, decor: .3 }; // 2 coats ≈ 1 l per 8 m², decor a bit more
  const workInputs = $$('input[name="work"]', form);
  const collage = $('[data-collage]'), preview = $('[data-preview]');
  const sArea = $('[data-s-area]'), sDays = $('[data-s-days]'), sDaysW = $('[data-s-days-w]'), sPaint = $('[data-s-paint]'), room = $('[data-room]');
  const planBar = $('[data-plan]'), planLegend = $('[data-plan-legend]'), planTotal = $('[data-plan-total]'), planBox = $('.plan'), buckets = $('[data-s-buckets]');
  const prepHint = $('[data-prep-hint]');
  const val = n => +form.elements[n].value;
  const qtyOf = k => ({ walls: val('area'), ceiling: val('ceilArea'), slopes: val('slopes'), decor: val('decorArea'), doors: val('doors'), radiators: val('radiators') })[k];

  // on phones show the preview right under the controls, where the choice is made

  // sliders: live value + filled track
  $$('.range', form).forEach(r => {
    const o = $(`[data-out="${r.name}"]`, form);
    const paint = () => { o && (o.value = r.value); r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); };
    r.addEventListener('input', () => { paint(); updateEst(false); }); paint();
  });
  // steppers for pieces
  $$('.stepper', form).forEach(st => {
    const inp = $('input', st), o = $('output', st);
    $$('.stepper__btn', st).forEach(b => b.addEventListener('click', () => {
      inp.value = Math.min(30, Math.max(1, +inp.value + +b.dataset.step)); o.value = inp.value;
      hasGsap && !reduce && gsap.fromTo(o, { y: -6, opacity: .4 }, { y: 0, opacity: 1, duration: .35, ease: 'power3.out' });
      updateEst(false);
    }));
  });

  const tiles = workInputs.map(inp => {
    const f = document.createElement('figure');
    const w = WORKS[inp.value];
    f.className = 'ptile is-off'; f.dataset.key = inp.value;
    f.innerHTML = `<img src="${inp.dataset.img}" alt="${inp.dataset.label}" loading="lazy"><figcaption><span>${inp.dataset.label}</span><b>від ${w.min} грн/${w.unit}</b></figcaption>`;
    collage.appendChild(f);
    return f;
  });
  const plural = n => (n % 10 === 1 && n % 100 !== 11) ? 'день' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 'дні' : 'днів';
  const kinds = n => n === 1 ? 'вид робіт' : (n >= 2 && n <= 4) ? 'види робіт' : 'видів робіт';
  const bucketText = L => !L ? 'не потрібна' : L <= 3 ? 'одна банка 3 л' : L <= 10 ? 'одне відро 10 л' : (n => n <= 4 ? `${n} відра по 10 л` : `${n} відер по 10 л`)(Math.ceil(L / 10));
  const round = n => Math.round(n / 100) * 100;
  const shown = { min: 0, max: 0, days: 0, paint: 0, area: 0 };
  const render = () => {
    estMin.textContent = fmt(round(shown.min)); estMax.textContent = fmt(round(shown.max));
    sArea.textContent = Math.round(shown.area);
    const d = Math.round(shown.days); sDays.textContent = d; sDaysW.textContent = plural(d);
    sPaint.textContent = Math.round(shown.paint);
  };
  const tweenNums = to => (hasGsap && !reduce) ? gsap.to(shown, { ...to, duration: .6, ease: 'power3.out', overwrite: true, onUpdate: render }) : (Object.assign(shown, to), render());

  function updateEst(animateTiles) {
    const keys = workInputs.filter(i => i.checked).map(i => i.value);
    // show only the controls that matter for the chosen works
    $$('[data-qty]', form).forEach(q => { q.hidden = !keys.includes(q.dataset.qty) && !(q.dataset.qty === 'walls' && keys.includes('prep')); });
    prepHint.hidden = !keys.includes('prep');
    // quantities: putty covers walls + ceiling (if ceiling chosen)
    const q = {};
    keys.forEach(k => { q[k] = k === 'prep' ? val('area') + (keys.includes('ceiling') ? val('ceilArea') : 0) : qtyOf(k); });
    let min = 0, max = 0;
    const steps = ORDER.filter(k => keys.includes(k)).map(k => {
      const w = WORKS[k];
      min += q[k] * w.min; max += q[k] * w.max;
      return { ...w, key: k, d: Math.max(1, Math.ceil(q[k] / w.per) + w.dry) };
    });
    const days = steps.reduce((t, p) => t + p.d, 0);
    const paint = Object.keys(PAINT_L).reduce((t, k) => t + (keys.includes(k) ? q[k] * PAINT_L[k] : 0), 0) * 1.1; // +10% reserve
    const area = ['walls', 'ceiling', 'decor'].reduce((t, k) => t + (keys.includes(k) ? q[k] : 0), 0) || (keys.includes('prep') ? q.prep : 0);
    tweenNums({ min, max, days, paint, area });
    room.textContent = `${keys.length} ${kinds(keys.length)}`;
    buckets.textContent = bucketText(Math.round(paint));

    // work plan bar
    planBox.hidden = !steps.length;
    planTotal.textContent = steps.length ? `≈ ${days} ${plural(days)}` : '';
    const sig = steps.map(p => p.key).join();
    if (planBar.dataset.sig !== sig) {
      planBar.dataset.sig = sig;
      planBar.innerHTML = steps.map(p => `<span class="plan__seg" style="background: ${p.color}"></span>`).join('');
      planLegend.innerHTML = steps.map(p => `<li><i style="background: ${p.color}"></i>${p.name} <b></b></li>`).join('');
      if (hasGsap && !reduce) gsap.from($$('.plan__seg', planBar), { scaleX: 0, duration: .7, ease: 'expo.out', stagger: .06 });
    }
    $$('.plan__seg', planBar).forEach((el, i) => { el.style.flex = `${steps[i].d} 1 0`; });
    $$('b', planLegend).forEach((el, i) => { el.textContent = `${steps[i].d} ${plural(steps[i].d)}`; });

    // collage on a 12-column, 2-row grid: top row gets the larger half
    const on = tiles.filter(t => keys.includes(t.dataset.key));
    const state = animateTiles && hasGsap && window.Flip && !reduce ? Flip.getState(tiles) : null;
    tiles.forEach(t => t.classList.toggle('is-off', !keys.includes(t.dataset.key)));
    const n = on.length, rows = n <= 2 ? 1 : 2, top = rows === 1 ? n : Math.ceil(n / 2);
    on.forEach((t, i) => {
      const inTop = i < top, cnt = inTop ? top : n - top, idx = inTop ? i : i - top, span = 12 / cnt;
      const r1 = rows === 1 ? 1 : inTop ? 1 : 2, r2 = rows === 1 ? 3 : r1 + 1, c1 = 1 + idx * span;
      t.style.gridArea = `${r1} / ${c1} / ${r2} / ${c1 + span}`;
    });
    $('.preview__empty', collage).hidden = n > 0;
    if (state) Flip.from(state, { duration: .8, ease: 'expo.inOut', absolute: true, scale: true, nested: true,
      onEnter: els => gsap.fromTo(els, { clipPath: 'inset(100% 0% 0% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: .9, ease: 'expo.out', clearProps: 'clipPath' }),
      onLeave: els => gsap.to(els, { opacity: 0, scale: .85, duration: .4, ease: 'power2.in' }) });
  }
  workInputs.forEach(i => i.addEventListener('change', () => updateEst(true)));
  updateEst(false);

  /* ---------- mobile: 3-step form with a sticky price bar ---------- */
  const isPhone = matchMedia('(max-width: 820px)').matches;
  let wzGo = null;
  if (isPhone) {
    form.classList.add('wizard');
    const TITLES = ['Що потрібно зробити?', 'Який обсяг?', 'Куди передзвонити?'];
    const head = document.createElement('div');
    head.className = 'wz-head';
    head.innerHTML = `<div class="wz-top"><button type="button" class="wz-back" aria-label="Назад"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><span class="wz-count">Крок <b>1</b> з 3</span></div>
      <div class="wz-progress"><span></span><span></span><span></span></div><p class="wz-title"></p>`;
    const steps = [0, 1, 2].map(() => { const d = document.createElement('div'); d.className = 'wz-step'; return d; });
    // step 1: works; step 2: amounts + plan; step 3: contacts
    steps[0].append($('fieldset.field', form));
    $$('[data-qty]', form).forEach(q => steps[1].append(q));
    steps[1].append(prepHint, preview);
    steps[2].append($('.form__row', form), $('.upload', form), $('.form__note', form));
    const err = $('.form__error', form);
    const bar = document.createElement('div');
    bar.className = 'wz-bar';
    bar.innerHTML = `<div class="wz-bar__price"></div><button type="button" class="wz-next">Далі <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>`;
    $('.wz-bar__price', bar).append($('.form__est', form));
    form.prepend(head, ...steps);
    steps[2].after(err);
    form.append(bar);
    $('.form__foot', form).hidden = true;

    let cur = 0;
    const nextBtn = $('.wz-next', bar);
    wzGo = (to, dir = 1) => {
      if (to === 1 && !workInputs.some(i => i.checked)) {
        err.hidden = false; err.textContent = 'Оберіть хоча б один вид робіт.';
        hasGsap && gsap.fromTo($('.chips', form), { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' });
        return;
      }
      err.hidden = true;
      steps.forEach((st, i) => { st.hidden = i !== to; });
      $$('.wz-progress span', head).forEach((sp, i) => sp.classList.toggle('is-done', i <= to));
      $('.wz-count b', head).textContent = to + 1;
      $('.wz-title', head).textContent = TITLES[to];
      $('.wz-back', head).style.visibility = to ? 'visible' : 'hidden';
      nextBtn.firstChild.textContent = to === 2 ? 'Надіслати ' : 'Далі ';
      if (hasGsap && !reduce && to !== cur) gsap.fromTo(steps[to], { y: 14 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power3.out', clearProps: 'transform,opacity' });
      // bring the top of the form under the header only if it is out of view
      if (to !== cur) {
        const top = form.getBoundingClientRect().top, hh = header.offsetHeight + 12;
        if (top < hh || top > innerHeight * .5) {
          const y = window.scrollY + top - hh;
          lenis ? lenis.scrollTo(y, { duration: .6 }) : window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
        }
      }
      cur = to;
    };
    nextBtn.addEventListener('click', () => cur < 2 ? wzGo(cur + 1, 1) : form.requestSubmit());
    $('.wz-back', head).addEventListener('click', () => cur > 0 && wzGo(cur - 1, -1));
    wzGo(0);
    // hide the global call bar while the form is on screen
    if (callbar && 'IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => callbar.classList.toggle('is-muted', en.isIntersecting), { threshold: .15 }).observe(form);
    }
  }

  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (!d.startsWith('380')) d = '380' + d.replace(/^3?8?0?/, '');
    d = d.slice(0, 12);
    const p = d.slice(3);
    let v = '+380';
    if (p.length) v += ' ' + p.slice(0, 2);
    if (p.length > 2) v += ' ' + p.slice(2, 5);
    if (p.length > 5) v += ' ' + p.slice(5, 7);
    if (p.length > 7) v += ' ' + p.slice(7, 9);
    phone.value = v;
  });
  phone.addEventListener('focus', () => { if (!phone.value) phone.value = '+380 '; });

  const fileInput = form.elements.photos, uploadText = $('.upload__text');
  fileInput.addEventListener('change', () => {
    const n = Math.min(fileInput.files.length, 5);
    uploadText.innerHTML = n ? `Додано фото: ${n}<em>можна замінити</em>` : 'Додати фото стін <em>до 5 файлів</em>';
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = form.elements.name, okName = name.value.trim().length > 1, okPhone = phone.value.replace(/\D/g, '').length === 12;
    name.classList.toggle('is-invalid', !okName); phone.classList.toggle('is-invalid', !okPhone);
    if (!okName || !okPhone) { err.hidden = false; err.textContent = !okName ? 'Вкажіть ім’я.' : 'Вкажіть телефон повністю: +380 XX XXX XX XX.'; return; }
    err.hidden = true;
    const btn = $('button[type="submit"]', form); btn.disabled = true;

    const data = new FormData(form);
    // =====================================================================
    // ТУТ ПІДКЛЮЧИТИ ОБРОБНИК ЗАЯВКИ. Приклад:
    // await fetch('https://your-backend.example/lead', { method: 'POST', body: data });
    // або Telegram Bot API: sendMessage / sendMediaGroup з вашого серверу.
    // =====================================================================
    await new Promise(r => setTimeout(r, 700)); // заглушка відправки
    void data;

    btn.disabled = false;
    if (hasGsap && !reduce) {
      await gsap.to(form, { opacity: 0, y: -20, duration: .5, ease: 'power3.in' });
    }
    form.hidden = true; success.hidden = false; success.classList.add('is-in');
    { // keep the success card in view after the tall form disappears
      const top = success.getBoundingClientRect().top, hh = header.offsetHeight + 16;
      if (top < hh || top > innerHeight * .6) { const y = window.scrollY + top - hh; lenis ? lenis.scrollTo(y, { duration: .6 }) : window.scrollTo({ top: y, behavior: 'smooth' }); }
    }
    if (hasGsap && !reduce) gsap.fromTo(success.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, ease: 'expo.out', stagger: .08 });
  });
  $('[data-reset]').addEventListener('click', () => {
    const swap = () => {
      form.reset(); $$('.range', form).forEach(r => r.dispatchEvent(new Event('input')));
      $$('.stepper', form).forEach(st => { $('output', st).value = $('input', st).value; });
      phone.value = '+380 '; uploadText.innerHTML = 'Додати фото стін <em>до 5 файлів</em>';
      success.hidden = true; success.classList.remove('is-in');
      if (hasGsap) gsap.set(success, { clearProps: 'all' });
      form.hidden = false; updateEst(true); wzGo && wzGo(0);
      if (hasGsap && !reduce) {
        gsap.fromTo(form, { opacity: 0, y: 30, clipPath: 'inset(0% 0% 100% 0% round 28px)' },
          { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: .9, ease: 'expo.out', clearProps: 'clipPath,transform' });
        gsap.fromTo($$(':scope > *:not([hidden])', form), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out', stagger: .05, delay: .15, clearProps: 'opacity,transform' });
      } else if (hasGsap) gsap.set(form, { opacity: 1, y: 0 });
      const top = form.getBoundingClientRect().top, hh = header.offsetHeight + 16;
      if (top < hh || top > innerHeight * .6) { const y = window.scrollY + top - hh; lenis ? lenis.scrollTo(y, { duration: .6 }) : window.scrollTo({ top: y, behavior: 'smooth' }); }
    };
    if (!hasGsap || reduce) return swap();
    gsap.to(success, { opacity: 0, y: -20, scale: .98, duration: .35, ease: 'power2.in', onComplete: swap });
  });

  /* ---------- manifest: split words ---------- */
  const manifest = $('[data-manifest]');
  if (manifest) manifest.innerHTML = manifest.textContent.trim().split(/\s+/).map(w => `<span class="mw">${w}</span>`).join(' ');

  /* ---------- sticky offsets ---------- */
  $$('.scard').forEach((c, i) => c.style.setProperty('--i', i));

  /* ---------- counters ---------- */
  const counters = $$('[data-count]');

  /* ======================= GSAP ANIMATIONS ======================= */
  if (!hasGsap || reduce) {
    $$('.mw').forEach(w => (w.style.opacity = 1));
    return;
  }
  gsap.registerPlugin(ScrollTrigger, Flip);

  // Hero: words painted by a roller, photo drops in, rest fades
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo('[data-paint]', { clipPath: 'inset(-25% 100% -25% 0%)' }, { clipPath: 'inset(-25% -5% -25% 0%)', duration: 1.2, ease: 'power3.inOut', stagger: .45, clearProps: 'clipPath' }, .15)
    .from('[data-hero-photo]', { y: -80, rotate: -16, opacity: 0, duration: 1.3 }, .9)
    .from('[data-hero-fade]', { y: 24, opacity: 0, duration: 1, stagger: .1 }, 1.1)
    .from('.header', { yPercent: -100, opacity: 0, duration: 1, clearProps: 'transform,opacity' }, .2);

  // Hero parallax out
  gsap.to('.hero__title', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Manifest: words light up while scrolling
  gsap.to('.mw', { opacity: 1, ease: 'none', stagger: .1,
    scrollTrigger: { trigger: manifest, start: 'top 80%', end: 'bottom 35%', scrub: .6 } });

  // Generic reveals
  $$('[data-reveal], [data-step]').forEach((el, i) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Counters
  counters.forEach(el => {
    const end = +el.dataset.count, obj = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(obj, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(obj.v)) }) });
  });

  // Section titles: clip reveal
  $$('.h2').forEach(h => gsap.fromTo(h, { clipPath: 'inset(-20% -5% 100% -5%)', y: 30 }, { clipPath: 'inset(-20% -5% -20% -5%)', y: 0, duration: 1.2, ease: 'expo.out', clearProps: 'clipPath,transform',
    scrollTrigger: { trigger: h, start: 'top 88%', once: true } }));

  // Services: sticky stack, previous card shrinks when the next one arrives
  const cards = matchMedia('(min-width: 821px)').matches ? $$('.scard') : [];
  $$('.scard').forEach(card => { if (!cards.length) gsap.from(card, { y: 40, opacity: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } }); });
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, { scale: .94, opacity: .55, ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true } });
  });

  // Before/after: curtain sweeps once on enter
  if (ba) {
    const o = { v: 15 };
    ScrollTrigger.create({ trigger: ba, start: 'top 70%', once: true,
      onEnter: () => gsap.fromTo(o, { v: 15 }, { v: 50, duration: 1.4, ease: 'expo.inOut', onUpdate: () => { ba.style.setProperty('--pos', o.v + '%'); $('.ba__range', ba).value = o.v; } }) });
  }

  // Footer marquee speeds up with scroll velocity
  ScrollTrigger.create({ onUpdate: self => {
    const v = Math.min(Math.abs(self.getVelocity()) / 600, 4);
    loops.forEach(tw => gsap.to(tw, { timeScale: 1 + v, duration: .3, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: 1, duration: .8 }) }));
  } });

  /* ---------- desktop only: parallax + custom cursor ---------- */
  if (desktop) {
    $$('[data-parallax], .scard__img img').forEach(img => {
      gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Steps: photo of the stage follows the cursor.
    // Hover is resolved from the real pointer position on every move AND scroll,
    // so the photo never gets stuck when the page scrolls under a still mouse.
    const float = $('.srow-float'), floatImg = float && $('img', float);
    if (float) {
      const fx = gsap.quickTo(float, 'x', { duration: .6, ease: 'power3' }), fy = gsap.quickTo(float, 'y', { duration: .6, ease: 'power3' });
      gsap.set(float, { xPercent: -50, yPercent: -115, rotate: -4 });
      const loaded = {};
      $$('.srow').forEach(row => { const im = new Image(); im.onload = () => (loaded[row.dataset.img] = true); im.src = row.dataset.img; });
      let px = -1, py = -1, current = null, visible = false;
      const show = row => {
        if (row === current) return;
        current = row;
        if (row && loaded[row.dataset.img]) {
          floatImg.src = row.dataset.img;
          if (!visible) { visible = true; gsap.set(float, { x: px, y: py }); }
          gsap.to(float, { opacity: 1, scale: 1, rotate: -4, duration: .5, ease: 'expo.out', overwrite: 'auto' });
        } else if (visible) {
          visible = false; current = null;
          gsap.to(float, { opacity: 0, scale: .6, rotate: 4, duration: .3, ease: 'power2.in', overwrite: 'auto' });
        }
      };
      const check = () => {
        if (px < 0) return;
        const el = document.elementFromPoint(px, py);
        show(el ? el.closest('.srow') : null);
      };
      addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; fx(px); fy(py); check(); }, { passive: true });
      addEventListener('scroll', check, { passive: true });
      document.addEventListener('mouseleave', () => show(null));
    }

    document.documentElement.classList.add('has-cursor');
    const cur = $('.cursor'), label = $('.cursor__label');
    const xTo = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
    addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); document.documentElement.classList.add('cursor-on'); });
    document.addEventListener('mouseleave', () => document.documentElement.classList.remove('cursor-on'));
    const grow = (txt) => { label.textContent = txt || ''; gsap.to(cur, { scale: txt ? 6 : 3, duration: .5, ease: 'expo.out' }); gsap.to(label, { opacity: txt ? 1 : 0, scale: txt ? 1 / 6 : 1, duration: .3 }); };
    const shrink = () => { gsap.to(cur, { scale: 1, duration: .5, ease: 'expo.out' }); gsap.to(label, { opacity: 0, duration: .2 }); };
    $$('a, button, .chip').forEach(el => { el.addEventListener('mouseenter', () => grow()); el.addEventListener('mouseleave', shrink); });
    $$('.gitem').forEach(el => { el.addEventListener('mouseenter', () => grow()); el.addEventListener('mouseleave', shrink); });
    ba && (ba.addEventListener('mouseenter', () => grow('Тягніть')), ba.addEventListener('mouseleave', shrink));
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
