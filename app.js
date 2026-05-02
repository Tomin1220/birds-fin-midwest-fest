/* ============================================================
   Fins & Feathers Market App — App Logic
   ============================================================ */

/* ── Floating Particles ───────────────────────────────────── */
(function spawnParticles() {
  const container = document.getElementById('particles');
  const emojis = ['🦜', '🐠', '🌿', '🦎', '🌊', '🐦', '🌺', '🦋', '🐡', '🦚'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'particle';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = `${Math.random() * 100}%`;
    const duration = 12 + Math.random() * 18;
    const delay = Math.random() * 20;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    el.style.fontSize = `${0.9 + Math.random() * 1.2}rem`;
    container.appendChild(el);
  }
})();

/* ── Phone Number Formatting ──────────────────────────────── */
const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', function () {
    let val = this.value.replace(/\D/g, '').slice(0, 10);
    if (val.length >= 7) {
      val = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6)}`;
    } else if (val.length >= 4) {
      val = `(${val.slice(0,3)}) ${val.slice(3)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    this.value = val;
  });
}

/* ── Validation Helpers ───────────────────────────────────── */
function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('invalid');
  if (error) error.textContent = message;
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.remove('invalid');
  if (error) error.textContent = '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

/* ── Vendor Fields Show/Hide ──────────────────────────────── */
const interestSelect  = document.getElementById('interest');
const vendorFields    = document.getElementById('vendorFields');
const VENDOR_VALUES   = ['vendor', 'both'];

function toggleVendorFields() {
  const isVendor = VENDOR_VALUES.includes(interestSelect.value);
  vendorFields.classList.toggle('visible', isVendor);
  // Clear errors when hiding
  if (!isVendor) {
    ['companyName', 'cityTown', 'sellsWhat'].forEach(id => clearError(id, id + 'Error'));
  }
}

if (interestSelect) {
  interestSelect.addEventListener('change', toggleVendorFields);
}

/* ── Live Validation (on blur) ────────────────────────────── */
const liveFields = [
  { id: 'firstName', errorId: 'firstNameError', check: v => v.trim().length >= 2, msg: 'Please enter your first name.' },
  { id: 'lastName',  errorId: 'lastNameError',  check: v => v.trim().length >= 2, msg: 'Please enter your last name.' },
  { id: 'email',     errorId: 'emailError',     check: v => isValidEmail(v),      msg: 'Please enter a valid email address.' },
  { id: 'phone',     errorId: 'phoneError',     check: v => isValidPhone(v),      msg: 'Please enter a valid 10-digit phone number.' },
];

liveFields.forEach(({ id, errorId, check, msg }) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => {
    if (!check(el.value)) {
      showError(id, errorId, msg);
    } else {
      clearError(id, errorId);
    }
  });
  el.addEventListener('input', () => {
    if (el.classList.contains('invalid') && check(el.value)) {
      clearError(id, errorId);
    }
  });
});

/* ── Form Submit ──────────────────────────────────────────── */
const form = document.getElementById('waitlistForm');
const successState = document.getElementById('successState');
const submitBtn = document.getElementById('submitBtn');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Clear all errors first
    liveFields.forEach(({ id, errorId }) => clearError(id, errorId));
    clearError('agree', 'agreeError');
    ['companyName', 'cityTown', 'sellsWhat'].forEach(id => clearError(id, id + 'Error'));

    let valid = true;

    // Validate each field
    liveFields.forEach(({ id, errorId, check, msg }) => {
      const el = document.getElementById(id);
      if (el && !check(el.value)) {
        showError(id, errorId, msg);
        valid = false;
      }
    });

    // Validate vendor fields if visible
    const isVendor = VENDOR_VALUES.includes(document.getElementById('interest').value);
    if (isVendor) {
      const vendorChecks = [
        { id: 'companyName', msg: 'Please enter your company or booth name.' },
        { id: 'cityTown',    msg: 'Please enter your village or town.' },
        { id: 'sellsWhat',   msg: 'Please briefly describe what you sell.' },
      ];
      vendorChecks.forEach(({ id, msg }) => {
        const el = document.getElementById(id);
        if (el && el.value.trim().length < 2) {
          showError(id, id + 'Error', msg);
          valid = false;
        }
      });
    }

    // Validate agreement checkbox
    const agreeEl = document.getElementById('agree');
    if (agreeEl && !agreeEl.checked) {
      const agreeError = document.getElementById('agreeError');
      if (agreeError) agreeError.textContent = 'You must agree to receive communications to register.';
      valid = false;
    }

    if (!valid) {
      // Scroll to first error
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
      return;
    }

    // Submit to Netlify Forms via fetch
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Registering...';

    // Build encoded body manually to ensure form-name is included
    const isVendorSubmit = VENDOR_VALUES.includes(document.getElementById('interest').value);
    const payload = new URLSearchParams({
      'form-name':   'waitlist',
      'firstName':   document.getElementById('firstName').value.trim(),
      'lastName':    document.getElementById('lastName').value.trim(),
      'email':       document.getElementById('email').value.trim(),
      'phone':       document.getElementById('phone').value.trim(),
      'interest':    document.getElementById('interest').value,
      'agree':       'yes',
      ...(isVendorSubmit && {
        'companyName': document.getElementById('companyName').value.trim(),
        'cityTown':    document.getElementById('cityTown').value.trim(),
        'sellsWhat':   document.getElementById('sellsWhat').value.trim(),
      }),
    }).toString();

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload,
    })
      .then(() => {
        // Show success regardless of redirect — Netlify always returns 200/302
        form.style.display = 'none';
        document.querySelector('.form-header').style.display = 'none';
        successState.style.display = 'block';
        successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Reserve My Spot';
        alert('Something went wrong. Please try again!');
      });
  });
}

/* ── Smooth scroll for any internal anchor ────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ── Intersection Observer — fade in cards ────────────────── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.feature-card, .step').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

/* ── Social Share Functions ───────────────────────────────── */
const SHARE_URL  = 'https://fafma.netlify.app';
const SHARE_TEXT = '🦜🐠🦎🌿 Join me at Fins & Feathers Market App — Midwest\'s premiere exotic pet & aquarium event! Birds, fish, reptiles, plants & more. Sign up for early access:';

function shareFacebook() {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`;
  window.open(url, '_blank', 'width=600,height=460');
}

function shareTwitter() {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`;
  window.open(url, '_blank', 'width=600,height=460');
}

function shareSMS() {
  const body = encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`);
  // sms: works on iOS & Android; falls back gracefully on desktop
  window.location.href = `sms:?&body=${body}`;
}

function shareWhatsApp() {
  const msg = encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
}

function copyLink() {
  const btn = document.getElementById('copyBtn');
  navigator.clipboard.writeText(SHARE_URL).then(() => {
    btn.classList.add('copied');
    const svg = btn.querySelector('svg');
    const oldHTML = btn.innerHTML;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    setTimeout(() => {
      btn.innerHTML = oldHTML;
      btn.classList.remove('copied');
    }, 2500);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = SHARE_URL;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy Link'; }, 2500);
  });
}

/* ── Native share (mobile) — upgrade SMS button on supported devices ── */
if (navigator.share) {
  const smsBtn = document.querySelector('.share-sms');
  if (smsBtn) {
    smsBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> Share`;
    smsBtn.onclick = () => {
      navigator.share({
        title: 'Fins & Feathers Market App',
        text: SHARE_TEXT,
        url: SHARE_URL,
      }).catch(() => {});
    };
  }
}
