/* Ultra Max 7 Pro - shared UI effects, no external dependencies. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const menu = $('#primaryNav');
  const menuBtn = $('#menuBtn');
  if (menu && menuBtn) {
    const setMenu = open => { menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); };
    menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero-bg'); let index = 0; let timer = null;
    const label = $('#slideStatus');
    const slideTo = n => {
      index = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      if (label) label.textContent = `${index + 1} / ${slides.length}`;
    };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    const start = () => { stop(); if (!reduced && !document.hidden) timer = setInterval(() => slideTo(index + 1), 7200); };
    $('#prevSlide')?.addEventListener('click', () => { slideTo(index - 1); start(); });
    $('#nextSlide')?.addEventListener('click', () => { slideTo(index + 1); start(); });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', e => { if (!hero.contains(e.relatedTarget)) start(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
  }

  const typeHeading = element => {
    if (reduced || element.dataset.typed) return;
    element.dataset.typed = '1';
    const text = element.dataset.text || element.textContent;
    // Keep original space reserved to avoid shifting nearby content while typing.
    element.style.minHeight = `${Math.ceil(element.getBoundingClientRect().height)}px`;
    element.setAttribute('aria-label', text);
    element.textContent = '';
    element.classList.add('is-typing');
    let i = 0;
    const step = () => {
      if (i < text.length) { element.textContent += text.charAt(i++); window.setTimeout(step, 82); }
      else element.classList.remove('is-typing');
    };
    step();
  };
  const heroTitle = $('.hero .typewriter') || $('.inner-hero .typewriter');
  if (heroTitle) typeHeading(heroTitle);
  const description = $('.word-reveal');
  if (description && !reduced) {
    const words = (description.dataset.words || description.textContent).trim().split(/\s+/);
    description.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word + '\u00a0';
      span.style.animationDelay = `${.55 + i * .085}s`;
      description.append(span);
    });
  }
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      if (entry.target.classList.contains('reveal-title')) typeHeading(entry.target);
      io.unobserve(entry.target);
    }), { threshold: .10, rootMargin: '0px 0px -32px 0px' });
    reveals.forEach(item => { item.classList.add('ready'); io.observe(item); });
  } else {
    reveals.forEach(item => item.classList.add('visible'));
  }

  $$('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      const already = card.classList.contains('flipped');
      $$('.flip-card').forEach(c => { c.classList.remove('flipped'); c.setAttribute('aria-pressed', 'false'); });
      if (!already) { card.classList.add('flipped'); card.setAttribute('aria-pressed', 'true'); }
    });
  });

  const year = $('#year'); if (year) year.textContent = String(new Date().getFullYear());
  const dialog = $('#installDialog');
  $('#installHelp')?.addEventListener('click', () => { if (dialog?.showModal) dialog.showModal(); });
  $('#closeDialog')?.addEventListener('click', () => dialog?.close());
  // PWA registration and installation are handled by pwa.js.
})();
