/* ============================================================
   Birds & Fin Midwest Fest — App Logic
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

    let valid = true;

    // Validate each field
    liveFields.forEach(({ id, errorId, check, msg }) => {
      const el = document.getElementById(id);
      if (el && !check(el.value)) {
        showError(id, errorId, msg);
        valid = false;
      }
    });

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

    // Gather form data
    const data = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName:  document.getElementById('lastName').value.trim(),
      email:     document.getElementById('email').value.trim(),
      phone:     document.getElementById('phone').value.trim(),
      interest:  document.getElementById('interest').value,
      agreed:    true,
      timestamp: new Date().toISOString(),
    };

    // Simulate submission (replace with real API call / Formspree / EmailJS etc.)
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Registering...';

    simulateSubmit(data)
      .then(() => {
        // Hide form, show success
        form.style.display = 'none';
        document.querySelector('.form-header').style.display = 'none';
        successState.style.display = 'block';
        successState.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Log to console for demo purposes
        console.log('[Birds & Fin Midwest Fest] New registration:', data);
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Reserve My Spot';
        alert('Something went wrong. Please try again!');
      });
  });
}

/* ── Simulate API Submission ─────────────────────────────── */
// Replace this with a real form backend:
//   - Formspree:  fetch('https://formspree.io/f/YOUR_FORM_ID', { method: 'POST', ... })
//   - EmailJS:    emailjs.send(...)
//   - Your own:   fetch('/api/register', { method: 'POST', body: JSON.stringify(data) })
function simulateSubmit(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 1200);
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
