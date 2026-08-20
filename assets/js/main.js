(function () {
  "use strict";

  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('main .section, .hero');
  var backToTop = document.getElementById('backToTop');
  var yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Sticky header shadow */
  function onScroll() {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    if (backToTop) {
      if (window.scrollY > 480) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Back to top */
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Scroll-spy: highlight active nav link */
  if ('IntersectionObserver' in window && sections.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            var match = link.getAttribute('href') === '#' + id;
            link.classList.toggle('active', match);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) {
      if (section.id) spyObserver.observe(section);
    });
  }

  /* Reveal-on-scroll */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* Animated stat counters */
  var counters = document.querySelectorAll('.stat-chip .num');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = (el.getAttribute('data-count') || '0') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* Copy-to-clipboard fallback for mailto:/tel: links
     (clicking does nothing visible if the visitor has no default mail/phone app registered) */
  var toastTimer = null;
  function showToast(message) {
    var toast = document.getElementById('copyToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'copyToast';
      toast.className = 'copy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('visible');
    }, 2200);
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  var copyableLinks = document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]');
  copyableLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var value = link.href.startsWith('mailto:')
        ? decodeURIComponent(link.href.replace('mailto:', ''))
        : link.href.replace('tel:', '');
      var label = link.href.startsWith('mailto:') ? 'Email' : 'Phone number';

      var useNativeClipboard = navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext;
      var nativeAttempt = useNativeClipboard ? navigator.clipboard.writeText(value) : Promise.reject();

      nativeAttempt.then(function () {
        showToast(label + ' copied to clipboard: ' + value);
      }).catch(function () {
        var copied = legacyCopy(value);
        showToast(copied ? (label + ' copied to clipboard: ' + value) : (label + ': ' + value));
      });
    });
  });
})();
