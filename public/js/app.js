(function () {
  const cfg = window.__WEDDING_CONFIG__ || { weddingDate: '', events: [], gallery: [] };
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 1. Render Dong Son VietnamesePattern SVGs
  function renderPatterns() {
    document.querySelectorAll('.vn-pattern').forEach((el) => {
      const width = Number(el.dataset.width || 300);
      const height = Number(el.dataset.height || 28);
      const color = el.dataset.color || '#78928A';

      const r = height / 2 - 1;
      const step = r * 2 + 6;
      const count = Math.max(1, Math.floor((width - r * 2) / step) + 1);
      const totalW = (count - 1) * step + r * 2;
      const startX = (width - totalW) / 2 + r;
      const cy = height / 2;

      let circles = '';
      for (let i = 0; i < count; i++) {
        const cx = startX + i * step;
        let spokes = '';
        for (const deg of [0, 45, 90, 135, 180, 225, 270, 315]) {
          const rad = (deg * Math.PI) / 180;
          spokes += `<line x1="${Math.cos(rad) * r * 0.28}" y1="${Math.sin(rad) * r * 0.28}" x2="${Math.cos(rad) * r * 0.52}" y2="${Math.sin(rad) * r * 0.52}" stroke="${color}" stroke-width="0.7" />`;
        }
        circles += `
          <g transform="translate(${cx},${cy})">
            <circle r="${r}" stroke="${color}" stroke-width="0.8" />
            <circle r="${r * 0.58}" stroke="${color}" stroke-width="0.6" />
            <circle r="${r * 0.22}" fill="${color}" />
            ${spokes}
          </g>`;
      }

      el.innerHTML = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true" fill="none" class="mx-auto">
          <line x1="0" y1="${cy}" x2="${width}" y2="${cy}" stroke="${color}" stroke-width="0.6" stroke-dasharray="2 5" />
          ${circles}
        </svg>`;
    });
  }

  // 2. Hero Invitation
  function initHero() {
    const dateEl = document.getElementById('hero-formatted-date');
    if (dateEl && cfg.weddingDate) {
      dateEl.textContent = new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(cfg.weddingDate));
    }

    const openBtn = document.getElementById('open-invitation-btn');
    const envelope = document.getElementById('hero-envelope');
    const content = document.getElementById('hero-content');

    if (!openBtn || !envelope || !content) return;

    openBtn.addEventListener('click', () => {
      if (prefersReduced) {
        envelope.classList.add('hidden');
        content.classList.remove('hidden');
        content.classList.add('flex');
        content.querySelectorAll('.hero-stagger-item').forEach((el) => el.classList.add('is-visible'));
        return;
      }

      envelope.classList.add('envelope-closing');
      setTimeout(() => {
        envelope.classList.add('hidden');
        content.classList.remove('hidden');
        content.classList.add('flex');
        const items = content.querySelectorAll('.hero-stagger-item');
        items.forEach((el, idx) => {
          setTimeout(() => el.classList.add('is-visible'), idx * 140);
        });
      }, 550);
    });
  }

  // 3. Scroll Reveal Observer
  function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal-item, .reveal-left, .reveal-right');
    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '-40px' }
    );

    targets.forEach((el) => io.observe(el));
  }

  // 4. ICS Calendar Download
  window.generateICS = function (index) {
    const event = cfg.events[index];
    if (!event) return;
    const pad = (n) => String(n).padStart(2, '0');
    const dt = new Date(
      event.date.replace(/[^\d]/g, ' ').trim().split(' ').reverse().join('-') + 'T' + event.time + ':00+07:00'
    );
    const end = new Date(dt.getTime() + 2 * 3600 * 1000);
    const fmt = (d) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DTSTART:${fmt(dt)}`,
      `DTEND:${fmt(end)}`,
      `LOCATION:${event.venue}\\, ${event.address}`,
      `DESCRIPTION:${event.title}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // 5. Countdown Timer
  function initCountdown() {
    const grid = document.getElementById('countdown-grid');
    const finished = document.getElementById('countdown-finished');
    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-minutes');
    const sEl = document.getElementById('cd-seconds');
    if (!grid || !finished || !cfg.weddingDate) return;

    const targetMs = new Date(cfg.weddingDate).getTime();

    function tick() {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        grid.classList.add('hidden');
        finished.classList.remove('hidden');
        return;
      }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1_000);

      dEl.textContent = String(days).padStart(2, '0');
      hEl.textContent = String(hours).padStart(2, '0');
      mEl.textContent = String(minutes).padStart(2, '0');
      sEl.textContent = String(seconds).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);
  }

  // 6. RSVP Form
  function initRsvpForm() {
    const form = document.getElementById('rsvp-form');
    const successEl = document.getElementById('rsvp-success');
    const errBanner = document.getElementById('rsvp-error');
    const submitBtn = document.getElementById('rsvp-submit-btn');
    const nameInput = document.getElementById('rsvp-name');
    const phoneInput = document.getElementById('rsvp-phone');
    const guestsInput = document.getElementById('rsvp-guests');
    const msgInput = document.getElementById('rsvp-msg');
    const errName = document.getElementById('err-name');
    const errPhone = document.getElementById('err-phone');
    if (!form) return;

    const PHONE_RE = /^(0|\+84)[0-9]{8,9}$/;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errName.classList.add('hidden');
      errPhone.classList.add('hidden');
      errBanner.classList.add('hidden');
      nameInput.classList.remove('border-red-son');
      phoneInput.classList.remove('border-red-son');

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      let valid = true;

      if (!name) {
        errName.textContent = 'Vui long nhap ho ten.';
        errName.classList.remove('hidden');
        nameInput.classList.add('border-red-son');
        valid = false;
      }
      if (!PHONE_RE.test(phone)) {
        errPhone.textContent = 'So dien thoai khong hop le (VD: 0901234567).';
        errPhone.classList.remove('hidden');
        phoneInput.classList.add('border-red-son');
        valid = false;
      }
      if (!valid) return;

      const attendingEl = form.querySelector('input[name="attending"]:checked');
      const payload = {
        name,
        phone,
        guestCount: Number(guestsInput.value) || 1,
        attending: attendingEl ? attendingEl.value : 'yes',
        message: msgInput.value.trim(),
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Dang gui...';

      try {
        const res = await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          form.classList.add('hidden');
          successEl.classList.remove('hidden');
        } else {
          errBanner.classList.remove('hidden');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Gui xac nhan';
        }
      } catch {
        errBanner.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gui xac nhan';
      }
    });
  }

  // 7. Photo Gallery Lightbox
  function initLightbox() {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const lbCounter = document.getElementById('lb-counter');
    const closeBtn = document.getElementById('lb-close');
    const prevBtn = document.getElementById('lb-prev');
    const nextBtn = document.getElementById('lb-next');
    const imgWrap = document.getElementById('lb-img-wrap');
    if (!lb || !cfg.gallery.length) return;

    let currentIdx = null;

    function renderLb() {
      if (currentIdx === null) return;
      const photo = cfg.gallery[currentIdx];
      lbImg.src = photo.src;
      lbImg.alt = photo.alt;
      lbCounter.textContent = `${currentIdx + 1} / ${cfg.gallery.length}`;
      lb.setAttribute('aria-label', `Anh ${currentIdx + 1} / ${cfg.gallery.length}`);
    }

    window.openLightbox = function (idx) {
      currentIdx = idx;
      renderLb();
      lb.classList.remove('hidden');
      lb.classList.add('flex');
    };

    function closeLb() {
      currentIdx = null;
      lb.classList.add('hidden');
      lb.classList.remove('flex');
    }

    function prevLb() {
      if (currentIdx === null) return;
      currentIdx = (currentIdx - 1 + cfg.gallery.length) % cfg.gallery.length;
      renderLb();
    }

    function nextLb() {
      if (currentIdx === null) return;
      currentIdx = (currentIdx + 1) % cfg.gallery.length;
      renderLb();
    }

    lb.addEventListener('click', closeLb);
    imgWrap.addEventListener('click', (e) => e.stopPropagation());
    closeBtn.addEventListener('click', closeLb);
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevLb();
    });
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextLb();
    });

    window.addEventListener('keydown', (e) => {
      if (currentIdx === null) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') prevLb();
      if (e.key === 'ArrowRight') nextLb();
    });
  }

  // 8. WishBook
  function initWishBook() {
    const listEl = document.getElementById('wishes-list');
    const form = document.getElementById('wish-form');
    const wn = document.getElementById('wn');
    const wm = document.getElementById('wm');
    const wnErr = document.getElementById('wn-err');
    const wmErr = document.getElementById('wm-err');
    const wmHint = document.getElementById('wm-hint');
    const wmCount = document.getElementById('wm-count');
    const wishErr = document.getElementById('wish-error');
    const wishSuccess = document.getElementById('wish-success');
    const btnWrap = document.getElementById('wish-btn-wrap');
    const submitBtn = document.getElementById('wish-submit-btn');

    if (wm && wmCount) {
      wm.addEventListener('input', () => {
        wmCount.textContent = `${wm.value.length}/300`;
      });
    }

    async function loadWishes() {
      if (!listEl) return;
      try {
        const res = await fetch('/api/wishes');
        const data = await res.json();
        const wishes = data.wishes || [];
        if (wishes.length === 0) {
          listEl.innerHTML = '<p class="text-center text-ink-brown/35 font-sans text-sm py-4">Hay la nguoi dau tien gui loi chuc!</p>';
          return;
        }
        listEl.innerHTML = wishes
          .map(
            (w) => `
            <article class="bg-ivory border-l-2 border-jade-light pl-4 py-2">
              <div class="flex items-center gap-2 mb-1.5">
                <svg class="w-3 h-3 text-red-son/70 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                <span class="font-serif text-base text-ink-brown font-semibold">${escapeHtml(w.name)}</span>
              </div>
              <p class="font-sans text-sm text-ink-brown/75 leading-relaxed">${escapeHtml(w.message)}</p>
            </article>`
          )
          .join('');
      } catch {
        // silent
      }
    }

    loadWishes();

    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      wnErr.classList.add('hidden');
      wmErr.classList.add('hidden');
      wmHint.classList.remove('hidden');
      wishErr.classList.add('hidden');
      wn.classList.remove('border-red-son');
      wm.classList.remove('border-red-son');

      const name = wn.value.trim();
      const message = wm.value.trim();
      let valid = true;

      if (!name) {
        wnErr.textContent = 'Vui long nhap ten.';
        wnErr.classList.remove('hidden');
        wn.classList.add('border-red-son');
        valid = false;
      }
      if (!message) {
        wmErr.textContent = 'Vui long nhap loi chuc.';
        wmErr.classList.remove('hidden');
        wmHint.classList.add('hidden');
        wm.classList.add('border-red-son');
        valid = false;
      }
      if (!valid) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Dang gui...';

      try {
        const res = await fetch('/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, message }),
        });
        if (res.ok) {
          wn.value = '';
          wm.value = '';
          wmCount.textContent = '0/300';
          btnWrap.classList.add('hidden');
          wishSuccess.classList.remove('hidden');
        } else {
          wishErr.classList.remove('hidden');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Gui loi chuc';
        }
      } catch {
        wishErr.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gui loi chuc';
      }
    });
  }

  // 9. Copy Bank Account
  window.copyAccount = async function (accountNumber, btn) {
    try {
      await navigator.clipboard.writeText(accountNumber);
      const copyIcon = btn.querySelector('.copy-icon');
      const checkIcon = btn.querySelector('.check-icon');
      const msg = btn.closest('.bg-ivory').querySelector('.copied-msg');

      copyIcon.classList.add('hidden');
      checkIcon.classList.remove('hidden');
      btn.setAttribute('aria-label', 'Da sao chep so tai khoan');
      btn.setAttribute('aria-pressed', 'true');
      if (msg) msg.classList.remove('hidden');

      setTimeout(() => {
        copyIcon.classList.remove('hidden');
        checkIcon.classList.add('hidden');
        btn.setAttribute('aria-label', 'Sao chep so tai khoan');
        btn.setAttribute('aria-pressed', 'false');
        if (msg) msg.classList.add('hidden');
      }, 2200);
    } catch {
      // silent
    }
  };

  // 10. Floating Share & Music Toggle
  function initFloatingAndMusic() {
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const shareData = { title: 'Thiep Cuoi', url: window.location.href };
        if (typeof navigator !== 'undefined' && navigator.share) {
          try {
            await navigator.share(shareData);
          } catch {
            // user cancelled
          }
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          alert('Da sao chep lien ket!');
        }
      });
    }

    const audio = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    const onIcon = document.getElementById('music-on-icon');
    const offIcon = document.getElementById('music-off-icon');
    let playing = false;

    if (audio && musicBtn) {
      musicBtn.addEventListener('click', async () => {
        if (playing) {
          audio.pause();
          playing = false;
          onIcon.classList.add('hidden');
          offIcon.classList.remove('hidden');
          musicBtn.setAttribute('aria-label', 'Bat nhac nen');
          musicBtn.setAttribute('aria-pressed', 'false');
        } else {
          try {
            await audio.play();
            playing = true;
            onIcon.classList.remove('hidden');
            offIcon.classList.add('hidden');
            musicBtn.setAttribute('aria-label', 'Tat nhac nen');
            musicBtn.setAttribute('aria-pressed', 'true');
          } catch {
            // autoplay blocked
          }
        }
      });
    }
  }

  renderPatterns();
  initHero();
  initScrollReveal();
  initCountdown();
  initRsvpForm();
  initLightbox();
  initWishBook();
  initFloatingAndMusic();
})();
