/* ==========================================================================
   Covcro Electrical & Plumbing — site behaviour
   Vanilla JS, no dependencies. Safe to defer.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Header: expose height as a CSS var + shadow on scroll
     ------------------------------------------------------------------ */
  var header = document.querySelector('.site-header');

  function syncHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 8);
  }

  syncHeaderHeight();
  onScroll();
  window.addEventListener('resize', syncHeaderHeight, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('primary-menu');

  function closeMenu() {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    document.body.style.removeProperty('overflow');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
      document.body.style.overflow = !open ? 'hidden' : '';
    });

    // Collapse when a real link is tapped
    menu.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (link && !link.closest('.has-drop > .nav__link')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1040) closeMenu();
    }, { passive: true });
  }

  /* Sub-menu accordion on touch/small screens */
  document.querySelectorAll('.has-drop > .nav__link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.innerWidth > 1040) return;   // desktop uses hover/focus
      e.preventDefault();
      link.parentElement.classList.toggle('is-open');
    });
  });

  /* ------------------------------------------------------------------
     Missing-photo fallback.
     Photos are referenced by their final filenames before they exist,
     so an unfilled slot renders as a branded placeholder rather than a
     broken-image icon. Drop the real file in and it just works.
     ------------------------------------------------------------------ */
  function flagMissing(img) {
    // The logo falls back to a text wordmark rather than a placeholder block.
    var brand = img.closest('.brand, .footer__brand');
    if (brand) {
      img.hidden = true;
      var mark = brand.querySelector('.brand__fallback');
      if (mark) { mark.hidden = false; mark.removeAttribute('aria-hidden'); }
      return;
    }

    // The hero already sits on a dark gradient, so it just loses the image.
    if (img.closest('.hero__media')) { img.hidden = true; return; }

    var holder = img.closest('.media, .g-item, .split__media');
    if (holder) holder.classList.add('is-missing');
    img.setAttribute('aria-hidden', 'true');
  }

  // Capture phase — image load errors do not bubble.
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.tagName === 'IMG') flagMissing(el);
  }, true);

  // Catch images that already failed before this script ran.
  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) flagMissing(img);
  });

  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */
  var revealables = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        setTimeout(function () { el.classList.add('is-visible'); }, delay);
        observer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Count-up stats
     ------------------------------------------------------------------ */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-count-suffix') || '';
        var start = performance.now();
        var dur = 1400;

        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('en-ZW') + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);

        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ------------------------------------------------------------------
     Gallery lightbox
     ------------------------------------------------------------------ */
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item[data-full]'));

  if (items.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Project photo viewer');
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close viewer">&times;</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo">&#8249;</button>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo">&#8250;</button>' +
      '<figure style="margin:0;max-width:100%">' +
      '<img alt="" />' +
      '<figcaption class="lightbox__cap"></figcaption>' +
      '</figure>';
    document.body.appendChild(box);

    var lbImg = box.querySelector('img');
    var lbCap = box.querySelector('.lightbox__cap');
    var index = 0;
    var lastFocus = null;

    function show(i) {
      index = (i + items.length) % items.length;
      var item = items[index];
      var src = item.getAttribute('data-full');
      var cap = item.getAttribute('data-caption') || '';
      lbImg.setAttribute('src', src);
      lbImg.setAttribute('alt', cap);
      lbCap.textContent = cap;
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      box.querySelector('.lightbox__close').focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.style.removeProperty('overflow');
      if (lastFocus) lastFocus.focus();
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () { open(i); });
    });

    box.querySelector('.lightbox__close').addEventListener('click', close);
    box.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(index - 1); });
    box.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(index + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  /* ------------------------------------------------------------------
     Quote / contact form
     Posts to the endpoint in data-endpoint (Formspree, Netlify, Web3Forms…).
     With no endpoint configured it falls back to opening the visitor's
     mail client so no enquiry is ever silently lost.
     ------------------------------------------------------------------ */
  document.querySelectorAll('form[data-quote-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('[type="submit"]');

    function setStatus(msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status ' + (ok ? 'is-ok' : 'is-err');
    }

    form.addEventListener('submit', function (e) {
      // Honeypot: silently drop bot submissions.
      var trap = form.querySelector('.hp input');
      if (trap && trap.value) { e.preventDefault(); return; }

      var endpoint = form.getAttribute('data-endpoint');
      var data = new FormData(form);

      if (!endpoint) {
        // No backend wired up yet — hand off to the visitor's mail client.
        e.preventDefault();
        var lines = [];
        data.forEach(function (v, k) {
          if (k.charAt(0) !== '_' && String(v).trim()) lines.push(k + ': ' + v);
        });
        var mailto = 'mailto:' + (form.getAttribute('data-mailto') || 'covcroelectrical@gmail.com') +
          '?subject=' + encodeURIComponent('Website enquiry — ' + (data.get('service') || 'General')) +
          '&body=' + encodeURIComponent(lines.join('\n'));
        window.location.href = mailto;
        setStatus('Opening your email app so you can send this enquiry. If nothing happens, WhatsApp us on 077 227 5744.', true);
        return;
      }

      e.preventDefault();
      if (submit) { submit.disabled = true; submit.dataset.label = submit.textContent; submit.textContent = 'Sending…'; }

      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          setStatus('Thank you — your request has reached us. We respond to quote requests within one working day.', true);
        })
        .catch(function () {
          setStatus('Sorry, that did not send. Please WhatsApp us on 077 227 5744 or email covcroelectrical@gmail.com.', false);
        })
        .finally(function () {
          if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label || 'Send request'; }
        });
    });
  });

  /* ------------------------------------------------------------------
     Pre-fill the service dropdown from ?service= in the URL
     (used by the "Request a quote" buttons on each service page)
     ------------------------------------------------------------------ */
  var wanted = new URLSearchParams(window.location.search).get('service');
  if (wanted) {
    document.querySelectorAll('select[name="service"]').forEach(function (sel) {
      Array.prototype.forEach.call(sel.options, function (opt) {
        if (opt.value.toLowerCase() === wanted.toLowerCase()) sel.value = opt.value;
      });
    });
  }

  /* ------------------------------------------------------------------
     Current year in the footer
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
