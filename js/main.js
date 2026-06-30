/* =============================================
   main.js — TradingView Integration Case Study
   ============================================= */

'use strict';

// ── Navbar Blur on Scroll ──────────────────────
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

// ── Mobile Nav Toggle ──────────────────────────
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ── Scroll Fade-In (Intersection Observer) ────
// Robust: reveals everything if the observer is unsupported,
// and a failsafe timer guarantees nothing stays hidden.
const fadeEls = document.querySelectorAll('.fade-in');

function revealAll() {
  fadeEls.forEach(el => el.classList.add('visible'));
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });

  fadeEls.forEach(el => observer.observe(el));

  // Reveal anything already in the viewport on load immediately
  requestAnimationFrame(() => {
    fadeEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add('visible');
      }
    });
  });

  // Failsafe: if anything is still hidden 2.5s after load, force-reveal it
  window.addEventListener('load', () => {
    setTimeout(revealAll, 2500);
  });
} else {
  // No observer support → just show everything
  revealAll();
}

// ── Hero Flow Diagram — Animated Active State ─
const flowNodes = document.querySelectorAll('.flow-node');
let activeIndex = 0;

function cycleFlowNodes() {
  flowNodes.forEach((node, i) => {
    node.classList.toggle('active', i === activeIndex);
  });
  activeIndex = (activeIndex + 1) % flowNodes.length;
}

if (flowNodes.length > 0) {
  cycleFlowNodes();
  setInterval(cycleFlowNodes, 1800);
}

// ── Challenge Cards Expand/Collapse ──────────
const challengeCards = document.querySelectorAll('.challenge-card');

challengeCards.forEach(card => {
  const header = card.querySelector('.challenge-header');
  if (!header) return;

  // Make the header keyboard-operable
  header.setAttribute('tabindex', '0');
  header.setAttribute('role', 'button');
  const body = card.querySelector('.challenge-body');
  header.setAttribute('aria-expanded', 'false');

  function toggle() {
    const isOpen = card.classList.toggle('open');
    header.setAttribute('aria-expanded', String(isOpen));
    if (body) body.setAttribute('aria-hidden', String(!isOpen));
  }

  header.addEventListener('click', toggle);
  header.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});

// ── Counter Animation (Statistics) ────────────
function animateCounter(el, target, duration = 1600) {
  const isFloat = String(target).includes('.');
  const start   = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quart
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = eased * target;

    el.textContent = isFloat
      ? current.toFixed(1) + '+'
      : Math.floor(current) + (progress < 1 ? '' : el.dataset.suffix || '');

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const statNumbers = document.querySelectorAll('.stat-number[data-target]');

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      animateCounter(el, target);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => statObserver.observe(el));

// ── Smooth Scroll for anchor links ───────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Architecture node hover z-index handled in CSS ──
// (.arch-node:hover { z-index: 30 }) — no JS needed.

// ── Scroll-spy: active nav section indicator ──
(function () {
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const map = new Map();
  navLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, a);
  });
  if (map.size === 0) return;

  let ticking = false;
  function updateActive() {
    ticking = false;
    const probe = window.scrollY + window.innerHeight * 0.35;
    let currentLink = null;
    map.forEach((link, sec) => {
      if (sec.offsetTop <= probe) currentLink = link;
    });
    navLinks.forEach(a => a.classList.remove('active'));
    if (currentLink) currentLink.classList.add('active');
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateActive); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', updateActive, { passive: true });
  updateActive();
})();

// ── Git Commits & Lesson Cards ────────────────
// Reveal animations are now handled purely in CSS
// (.js-enabled .git-commit / .lesson-card with @keyframes).
// No JS opacity manipulation = they can never get stuck hidden.

// ── Page Load flag ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

// ── Implementation Gallery Lightbox ───────────
// v5 — event-delegation version (robust against caching / DOM timing)
(function initLightbox() {
  // Defer until DOM is fully parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox, { once: true });
    return;
  }

  console.log('[portfolio] lightbox v5 active');

  const lightbox  = document.getElementById('lightbox');
  if (!lightbox) { console.warn('[portfolio] #lightbox not found'); return; }
  const lbImg     = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbClose   = document.getElementById('lightbox-close');
  const lbPrev    = document.getElementById('lightbox-prev');
  const lbNext    = document.getElementById('lightbox-next');
  const lbCounter = document.getElementById('lightbox-counter');

  function getItems() { return Array.from(document.querySelectorAll('.gallery-item')); }
  let current = 0;

  function render(i) {
    const items = getItems();
    const item = items[i];
    if (!item) return;
    const src = item.getAttribute('data-src');
    const cap = item.querySelector('figcaption');
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = src || '';
      const innerImg = item.querySelector('img');
      lbImg.alt = innerImg ? (innerImg.alt || '') : '';
      lbCaption.textContent = cap ? cap.textContent.trim() : '';
      if (lbCounter) lbCounter.textContent = (i + 1) + ' / ' + items.length;
      lbImg.style.opacity = '1';
    }, 150);
  }

  function openLightbox(i) {
    current = i;
    render(i);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lbClose) { try { lbClose.focus(); } catch (e) {} }
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  function next() { const n = getItems().length; current = (current + 1) % n; render(current); }
  function prev() { const n = getItems().length; current = (current - 1 + n) % n; render(current); }

  // Mark gallery items as interactive (a11y) — done once
  getItems().forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  // EVENT DELEGATION: a single listener on document catches every gallery
  // click, even if a child (img / figcaption / tag) is the actual target.
  document.addEventListener('click', (e) => {
    const item = e.target.closest && e.target.closest('.gallery-item');
    if (item) {
      const items = getItems();
      const idx = items.indexOf(item);
      if (idx > -1) openLightbox(idx);
      return;
    }
  });

  // Keyboard activation on gallery items
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ')) {
      const item = e.target.closest && e.target.closest('.gallery-item');
      if (item) {
        e.preventDefault();
        const idx = getItems().indexOf(item);
        if (idx > -1) openLightbox(idx);
      }
    }
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbNext)  lbNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  if (lbPrev)  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });

  lightbox.addEventListener('click', (e) => {
    // close only when the dark backdrop (not the image/buttons) is clicked
    if (e.target === lightbox || e.target.classList.contains('lightbox-stage')) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });
})();
