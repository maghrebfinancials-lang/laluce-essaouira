/* ============================================
   LALUCE ESSAOUIRA — Booking System
   ============================================ */

const BookingSystem = {
  currentStep: 1,
  totalSteps: 5,

  data: {
    checkIn: null,
    checkOut: null,
    nights: 0,
    room: null,
    roomPrice: 0,
    experiences: [],
    experiencesTotal: 0,
    guest: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      special: ''
    }
  },

  rooms: [
    {
      id: 'suite-bleue',
      nameKey: 'room1_name',
      descKey: 'room1_desc',
      price: 1800,
      image: 'images/room1.jpg'
    },
    {
      id: 'chambre-safran',
      nameKey: 'room2_name',
      descKey: 'room2_desc',
      price: 1200,
      image: 'images/room2.jpg'
    },
    {
      id: 'rose-des-sables',
      nameKey: 'room3_name',
      descKey: 'room3_desc',
      price: 950,
      image: 'images/room3.jpg'
    }
  ],

  experiences: [
    {
      id: 'yoga',
      nameKey: 'book_yoga_name',
      descKey: 'book_yoga_desc',
      priceKey: 'book_yoga_price',
      price: 350,
      icon: '🧘'
    },
    {
      id: 'cooking',
      nameKey: 'book_cook_name',
      descKey: 'book_cook_desc',
      priceKey: 'book_cook_price',
      price: 600,
      icon: '🍲'
    },
    {
      id: 'sunset',
      nameKey: 'book_sunset_name',
      descKey: 'book_sunset_desc',
      priceKey: 'book_sunset_price',
      price: 250,
      icon: '🌅'
    },
    {
      id: 'hammam',
      nameKey: 'book_hammam_name',
      descKey: 'book_hammam_desc',
      priceKey: 'book_hammam_price',
      price: 450,
      icon: '💆'
    }
  ],

  init() {
    this.bindEvents();
    this.setMinDates();
  },

  bindEvents() {
    // Open modal buttons
    document.querySelectorAll('[data-open-booking]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const roomId = btn.dataset.room;
        this.openModal(roomId);
      });
    });

    // Close modal
    const closeBtn = document.getElementById('bookingClose');
    const overlay = document.getElementById('bookingOverlay');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });

    // Navigation buttons
    const nextBtn = document.getElementById('bookingNext');
    const prevBtn = document.getElementById('bookingPrev');
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());

    // Date inputs
    const checkIn = document.getElementById('checkIn');
    const checkOut = document.getElementById('checkOut');
    if (checkIn) checkIn.addEventListener('change', () => this.updateDates());
    if (checkOut) checkOut.addEventListener('change', () => this.updateDates());

    // Room selection
    document.querySelectorAll('.room-select-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.room-select-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.data.room = card.dataset.roomId;
        this.data.roomPrice = parseInt(card.dataset.roomPrice);
        this.updateTotal();
      });
    });

    // Experience selection
    document.querySelectorAll('.experience-select-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        const expId = card.dataset.expId;
        const expPrice = parseInt(card.dataset.expPrice);

        if (card.classList.contains('selected')) {
          if (!this.data.experiences.find(e => e.id === expId)) {
            this.data.experiences.push({ id: expId, price: expPrice });
          }
        } else {
          this.data.experiences = this.data.experiences.filter(e => e.id !== expId);
        }
        this.data.experiencesTotal = this.data.experiences.reduce((sum, e) => sum + e.price, 0);
        this.updateTotal();
      });
    });

    // Confirm button
    const confirmBtn = document.getElementById('bookingConfirm');
    if (confirmBtn) confirmBtn.addEventListener('click', () => this.confirmBooking());
  },

  openModal(roomId) {
    const overlay = document.getElementById('bookingOverlay');
    if (!overlay) return;

    // Pre-select room if provided
    if (roomId) {
      this.data.room = roomId;
      this.data.roomPrice = this.rooms.find(r => r.id === roomId)?.price || 0;
      document.querySelectorAll('.room-select-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.roomId === roomId);
      });
    }

    this.goToStep(1);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const overlay = document.getElementById('bookingOverlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  },

  setMinDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fmt = (d) => d.toISOString().split('T')[0];

    const checkIn = document.getElementById('checkIn');
    const checkOut = document.getElementById('checkOut');
    if (checkIn) checkIn.min = fmt(today);
    if (checkOut) checkOut.min = fmt(tomorrow);
  },

  updateDates() {
    const checkInEl = document.getElementById('checkIn');
    const checkOutEl = document.getElementById('checkOut');

    if (!checkInEl || !checkOutEl) return;

    const checkIn = checkInEl.value;
    const checkOut = checkOutEl.value;

    if (checkIn) {
      const minCheckout = new Date(checkIn);
      minCheckout.setDate(minCheckout.getDate() + 1);
      checkOutEl.min = minCheckout.toISOString().split('T')[0];

      if (checkOut && new Date(checkOut) <= new Date(checkIn)) {
        checkOutEl.value = minCheckout.toISOString().split('T')[0];
      }
    }

    this.data.checkIn = checkIn;
    this.data.checkOut = checkOutEl.value;

    if (this.data.checkIn && this.data.checkOut) {
      const diff = (new Date(this.data.checkOut) - new Date(this.data.checkIn)) / 86400000;
      this.data.nights = Math.max(0, diff);
    } else {
      this.data.nights = 0;
    }

    this.updateNightsDisplay();
    this.updateTotal();
  },

  updateNightsDisplay() {
    const el = document.getElementById('nightsDisplay');
    if (!el) return;
    const t = window.currentLang || 'fr';
    const trans = TRANSLATIONS[t];

    if (this.data.nights > 0) {
      el.innerHTML = `
        <span class="nights-count">${this.data.nights}</span>
        <span>${trans.book_nights}</span>
      `;
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  },

  updateTotal() {
    const accommodation = this.data.nights * this.data.roomPrice;
    const total = accommodation + this.data.experiencesTotal;

    const miniTotalEl = document.getElementById('bookingMiniTotal');
    if (miniTotalEl) {
      miniTotalEl.textContent = total > 0 ? `${total.toLocaleString()} MAD` : '—';
    }

    // Update summary if on step 5
    this.updateSummary(accommodation, total);
  },

  updateSummary(accommodation, total) {
    const t = window.currentLang || 'fr';
    const trans = TRANSLATIONS[t];

    const roomName = document.getElementById('summaryRoom');
    const datesEl = document.getElementById('summaryDates');
    const extrasEl = document.getElementById('summaryExtras');
    const subtotalEl = document.getElementById('summarySubtotal');
    const extrasTotalEl = document.getElementById('summaryExtrasTotal');
    const totalEl = document.getElementById('summaryTotal');

    const room = this.rooms.find(r => r.id === this.data.room);

    if (roomName && room) roomName.textContent = trans[room.nameKey] || room.id;
    if (datesEl) {
      datesEl.textContent = this.data.checkIn && this.data.checkOut
        ? `${this.formatDate(this.data.checkIn)} → ${this.formatDate(this.data.checkOut)} (${this.data.nights} nuit${this.data.nights > 1 ? 's' : ''})`
        : '—';
    }

    const expNames = this.data.experiences.map(e => {
      const exp = this.experiences.find(x => x.id === e.id);
      return exp ? trans[exp.nameKey] : e.id;
    });

    if (extrasEl) extrasEl.textContent = expNames.length > 0 ? expNames.join(', ') : '—';
    if (subtotalEl) subtotalEl.textContent = accommodation > 0 ? `${accommodation.toLocaleString()} MAD` : '—';
    if (extrasTotalEl) extrasTotalEl.textContent = this.data.experiencesTotal > 0 ? `${this.data.experiencesTotal.toLocaleString()} MAD` : '—';
    if (totalEl) totalEl.textContent = total > 0 ? `${total.toLocaleString()} MAD` : '—';
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const lang = window.currentLang || 'fr';
    return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  },

  validateStep(step) {
    const t = window.currentLang || 'fr';
    const trans = TRANSLATIONS[t];

    switch (step) {
      case 1:
        if (!this.data.checkIn || !this.data.checkOut || this.data.nights < 1) {
          showToast('⚠️ ' + (t === 'fr' ? 'Veuillez sélectionner vos dates.' : 'Please select your dates.'));
          return false;
        }
        return true;

      case 2:
        if (!this.data.room) {
          showToast('⚠️ ' + (t === 'fr' ? 'Veuillez choisir une chambre.' : 'Please choose a room.'));
          return false;
        }
        return true;

      case 4:
        const fn = document.getElementById('guestFirstName')?.value.trim();
        const ln = document.getElementById('guestLastName')?.value.trim();
        const email = document.getElementById('guestEmail')?.value.trim();
        if (!fn || !ln || !email) {
          showToast('⚠️ ' + (t === 'fr' ? 'Veuillez remplir vos coordonnées.' : 'Please fill in your details.'));
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showToast('⚠️ ' + (t === 'fr' ? 'Email invalide.' : 'Invalid email.'));
          return false;
        }
        this.data.guest.firstName = fn;
        this.data.guest.lastName = ln;
        this.data.guest.email = email;
        this.data.guest.phone = document.getElementById('guestPhone')?.value.trim() || '';
        this.data.guest.country = document.getElementById('guestCountry')?.value.trim() || '';
        this.data.guest.special = document.getElementById('guestSpecial')?.value.trim() || '';
        return true;

      default:
        return true;
    }
  },

  nextStep() {
    if (!this.validateStep(this.currentStep)) return;
    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  },

  goToStep(step) {
    // Update summary before showing step 5
    if (step === 5) {
      const accommodation = this.data.nights * this.data.roomPrice;
      const total = accommodation + this.data.experiencesTotal;
      this.updateSummary(accommodation, total);
    }

    this.currentStep = step;

    // Update step content visibility
    document.querySelectorAll('.booking-step').forEach((el, i) => {
      el.classList.toggle('active', i + 1 === step);
    });

    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach((el, i) => {
      const stepNum = i + 1;
      el.classList.remove('active', 'completed');
      if (stepNum === step) el.classList.add('active');
      if (stepNum < step) el.classList.add('completed');
    });

    // Update navigation buttons
    const prevBtn = document.getElementById('bookingPrev');
    const nextBtn = document.getElementById('bookingNext');
    const confirmBtn = document.getElementById('bookingConfirm');

    if (prevBtn) prevBtn.style.display = step > 1 ? 'inline-flex' : 'none';
    if (nextBtn) nextBtn.style.display = step < this.totalSteps ? 'inline-flex' : 'none';
    if (confirmBtn) confirmBtn.style.display = step === this.totalSteps ? 'inline-flex' : 'none';

    // Scroll to top of modal body
    const body = document.querySelector('.booking-body');
    if (body) body.scrollTop = 0;
  },

  confirmBooking() {
    const t = window.currentLang || 'fr';
    const trans = TRANSLATIONS[t];

    // Simulate API call
    const confirmBtn = document.getElementById('bookingConfirm');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = t === 'fr' ? 'Envoi en cours...' : 'Sending...';
    }

    // Simulate network delay
    setTimeout(() => {
      this.closeModal();
      showToast('✅ ' + trans.book_success_text, 5000);
      this.resetForm();
    }, 1500);
  },

  resetForm() {
    this.data = {
      checkIn: null,
      checkOut: null,
      nights: 0,
      room: null,
      roomPrice: 0,
      experiences: [],
      experiencesTotal: 0,
      guest: { firstName: '', lastName: '', email: '', phone: '', country: '', special: '' }
    };

    const checkIn = document.getElementById('checkIn');
    const checkOut = document.getElementById('checkOut');
    if (checkIn) checkIn.value = '';
    if (checkOut) checkOut.value = '';

    document.querySelectorAll('.room-select-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.experience-select-card').forEach(c => c.classList.remove('selected'));

    const guestFields = ['guestFirstName', 'guestLastName', 'guestEmail', 'guestPhone', 'guestCountry', 'guestSpecial'];
    guestFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    const confirmBtn = document.getElementById('bookingConfirm');
    if (confirmBtn) {
      confirmBtn.disabled = false;
    }

    this.updateTotal();
  }
};

/* Global toast function */
function showToast(message, duration = 3000) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}
