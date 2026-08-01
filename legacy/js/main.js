/* =========================================================================
   AVERON LIFE SCIENCES — main.js
   Nav behaviour, scroll reveals, molecular network canvas, contact form
   ========================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Scroll progress bar
     --------------------------------------------------------------------- */
  var progressBar = document.querySelector('.scroll-progress');
  function updateProgress() {
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  /* ---------------------------------------------------------------------
     Navbar shrink-on-scroll
     --------------------------------------------------------------------- */
  var navbar = document.querySelector('.navbar');
  var backToTop = document.querySelector('.back-to-top');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (navbar) navbar.classList.toggle('is-scrolled', y > 40);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 700);
    updateProgress();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------------------
     Mobile menu
     --------------------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var open = toggle.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  /* ---------------------------------------------------------------------
     Active nav link (by current filename)
     --------------------------------------------------------------------- */
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-link]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Scroll reveal (IntersectionObserver)
     --------------------------------------------------------------------- */
  var revealTargets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .pulse-divider');

  // Auto-stagger: within any [data-stagger] container, delay children incrementally
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    var children = group.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    children.forEach(function (child, i) {
      child.style.transitionDelay = (i * 0.09) + 's';
    });
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------------
     Hero heading line-reveal (splits into spans already in markup)
     --------------------------------------------------------------------- */
  document.querySelectorAll('.hero h1 .line > span').forEach(function (span, i) {
    span.style.transform = 'translateY(110%)';
    span.style.opacity = '0';
    span.style.transition = 'transform .9s ' + (0.15 + i * 0.12) + 's cubic-bezier(.22,1,.36,1), opacity .9s ' + (0.15 + i * 0.12) + 's';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        span.style.transform = 'translateY(0)';
        span.style.opacity = '1';
      });
    });
  });

  /* ---------------------------------------------------------------------
     Contact form — builds a mailto: so submissions reach info@ directly
     (static site, no backend). Shows an inline confirmation.
     --------------------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#name').value.trim();
      var email = form.querySelector('#email').value.trim();
      var phone = form.querySelector('#phone') ? form.querySelector('#phone').value.trim() : '';
      var subject = form.querySelector('#subject') ? form.querySelector('#subject').value.trim() : 'Website enquiry';
      var message = form.querySelector('#message').value.trim();

      var body = 'Name: ' + name + '\n' + (phone ? 'Phone: ' + phone + '\n' : '') + 'Email: ' + email + '\n\n' + message;
      var mailto = 'mailto:info@averonlifesciences.com'
        + '?subject=' + encodeURIComponent('[Website] ' + subject)
        + '&body=' + encodeURIComponent(body);

      window.location.href = mailto;

      var success = document.querySelector('.form-success');
      if (success) success.classList.add('is-visible');
      form.reset();
    });
  }

})();
