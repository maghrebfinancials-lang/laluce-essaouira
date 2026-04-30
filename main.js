/* ============================================
   LALUCE ESSAOUIRA — Main JavaScript
   ============================================ */

/* --- Language System --- */
window.currentLang = getLangFromURL() || 'fr';

function getLangFromURL() {
  const path = window.location.pathname;
  if (path.includes('/en/') || path.includes('/en.html')) return 'en';
  if (path.includes('/fr/') || path.includes('/fr.html')) return 'fr';
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  return urlLang === 'en' ? 'en' : null;
}

function applyTranslations(lang) {
  window.currentLang = lang;
  const t = TRANSLATIONS[lang];

  // Apply data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t[key];
      } else {
        el.innerHTML = t[key].replace(/\n/g, '<br>');
      }
    }
  });

  // Apply data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // Update html lang attribute
  document.documentElement.lang = lang;

  // Update lang toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Update booking nav button text
  const nextBtn = document.getElementById('bookingNext');
  const prevBtn = document.getElementById('bookingPrev');
  const confirmBtn = document.getElementById('bookingConfirm');
  if (nextBtn) nextBtn.textContent = t.book_next;
  if (prevBtn) prevBtn.textContent = t.book_prev;
  if (confirmBtn) confirmBtn.textContent = t.book_confirm;

  // Save preference
  localStorage.setItem('laluce_lang', lang);

  // Re-render dynamic booking content
  renderBookingRooms();
  renderBookingExperiences();
}

function toggleLang(lang) {
  applyTranslations(lang);

  // Update URL without reload
  const url = new URL(window.location);
  if (lang === 'en') {
    url.searchParams.set('lang', 'en');
  } else {
    url.searchParams.delete('lang');
  }
  window.history.pushState({}, '', url.toString());
}

/* --- Render Booking Rooms --- */
function renderBookingRooms() {
  const container = document.getElementById('roomsSelectGrid');
  if (!container) return;

  const t = TRANSLATIONS[window.currentLang];
  const rooms = BookingSystem.rooms;

  container.innerHTML = rooms.map(room => `
    <div class="room-select-card ${BookingSystem.data.room === room.id ? 'selected' : ''}"
         data-room-id="${room.id}"
         data-room-price="${room.price}">
      <div class="room-select-img img-placeholder" style="height:130px; background: linear-gradient(135deg, #1F3D2B, #3A7A52);">
        <img src="${room.image}" alt="${t[room.nameKey]}" onerror="this.style.display='none'" loading="lazy">
      </div>
      <div class="room-select-info">
        <div class="room-select-name">${t[room.nameKey]}</div>
        <div class="room-select-price">
          ${room.price.toLocaleString()} MAD <span>/ ${t.per_night.replace('/ ', '')}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Re-bind room selection events
  container.querySelectorAll('.room-select-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.room-select-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      BookingSystem.data.room = card.dataset.roomId;
      BookingSystem.data.roomPrice = parseInt(card.dataset.roomPrice);
      BookingSystem.updateTotal();
    });
  });
}

/* --- Render Booking Experiences --- */
function renderBookingExperiences() {
  const container = document.getElementById('experiencesGrid');
  if (!container) return;

  const t = TRANSLATIONS[window.currentLang];
  const exps = BookingSystem.experiences;

  container.innerHTML = exps.map(exp => `
    <div class="experience-select-card ${BookingSystem.data.experiences.find(e => e.id === exp.id) ? 'selected' : ''}"
         data-exp-id="${exp.id}"
         data-exp-price="${exp.price}">
      <div class="exp-icon">${exp.icon}</div>
      <div class="exp-info">
        <h4>${t[exp.nameKey]}</h4>
        <p>${t[exp.descKey]}</p>
        <div class="exp-price">${t[exp.priceKey]}</div>
      </div>
      <div class="exp-check">✓</div>
    </div>
  `).join('');

  // Re-bind experience selection events
  container.querySelectorAll('.experience-select-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      const expId = card.dataset.expId;
      const expPrice = parseInt(card.dataset.expPrice);

      if (card.classList.contains('selected')) {
        if (!BookingSystem.data.experiences.find(e => e.id === expId)) {
          BookingSystem.data.experiences.push({ id: expId, price: expPrice });
        }
      } else {
        BookingSystem.data.experiences = BookingSystem.data.experiences.filter(e => e.id !== expId);
      }
      BookingSystem.data.experiencesTotal = BookingSystem.data.experiences.reduce((s, e) => s + e.price, 0);
      BookingSystem.updateTotal();
    });
  });
}

/* --- Header Scroll Effect --- */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --- Sticky Book Button --- */
function initStickyBtn() {
  const btn = document.getElementById('stickyBookBtn');
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => BookingSystem.openModal());
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* --- Scroll Reveal Animations --- */
function initReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));
}

/* --- Smooth Scroll for Anchor Links --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.getElementById('header')?.offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* --- Active Nav Link on Scroll --- */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const onScroll = () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + section.id);
        });
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* --- Hero Parallax --- */
function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  // Trigger loaded state for initial animation
  setTimeout(() => heroBg.classList.add('loaded'), 100);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  }, { passive: true });
}

/* --- Hero Scroll Arrow --- */
function initHeroScroll() {
  const scrollArrow = document.getElementById('heroScroll');
  if (!scrollArrow) return;

  scrollArrow.addEventListener('click', () => {
    const next = document.getElementById('experience');
    if (next) {
      next.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/* --- Contact Form --- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = window.currentLang === 'fr' ? 'Envoi...' : 'Sending...';

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = originalText;
      const t = TRANSLATIONS[window.currentLang];
      showToast('✅ ' + (window.currentLang === 'fr'
        ? 'Message envoyé ! Nous vous répondrons sous 24h.'
        : 'Message sent! We will reply within 24 hours.'
      ));
      form.reset();
    }, 1200);
  });
}

/* --- Newsletter Form --- */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('✅ ' + (window.currentLang === 'fr'
      ? 'Merci pour votre inscription !'
      : 'Thank you for subscribing!'
    ));
    form.reset();
  });
}

/* --- Lazy Loading Images --- */
function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return; // native lazy load

  const images = document.querySelectorAll('img[loading="lazy"]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => observer.observe(img));
}

/* --- Page Loader --- */
function initLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1600);
  });

  // Fallback
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 3000);
}

/* --- Hero Scroll Down Indicator --- */
function initScrollIndicator() {
  const scrollEl = document.querySelector('.hero-scroll');
  if (scrollEl) {
    scrollEl.addEventListener('click', () => {
      document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* --- Init All --- */
document.addEventListener('DOMContentLoaded', () => {
  // Language init
  const savedLang = localStorage.getItem('laluce_lang');
  const urlLang = getLangFromURL();
  const lang = urlLang || savedLang || 'fr';
  applyTranslations(lang);

  // Bind lang toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleLang(btn.dataset.lang));
  });

  // Init systems
  initLoader();
  initHeader();
  initStickyBtn();
  initMobileMenu();
  initReveal();
  initSmoothScroll();
  initActiveNav();
  initParallax();
  initScrollIndicator();
  initContactForm();
  initNewsletter();
  initLazyLoad();

  // Init booking (must be after translations)
  BookingSystem.init();

  // Render booking dynamic content
  renderBookingRooms();
  renderBookingExperiences();
});
