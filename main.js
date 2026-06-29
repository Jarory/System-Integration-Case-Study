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

  header.addEventListener('click', () => {
    const isOpen = card.classList.toggle('open');
    const body = card.querySelector('.challenge-body');
    if (body) {
      body.setAttribute('aria-hidden', !isOpen);
    }
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

// ── Architecture node hover labels ────────────
const archNodes = document.querySelectorAll('.arch-node');

archNodes.forEach(node => {
  node.addEventListener('mouseenter', () => {
    node.style.zIndex = '10';
  });
  node.addEventListener('mouseleave', () => {
    node.style.zIndex = '';
  });
});

// ── Git Commits & Lesson Cards ────────────────
// Reveal animations are now handled purely in CSS
// (.js-enabled .git-commit / .lesson-card with @keyframes).
// No JS opacity manipulation = they can never get stuck hidden.

// ── Page Load flag ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});
