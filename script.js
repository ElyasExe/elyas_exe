/* ==========================================================================
   ELYAS — script.js
   Table of contents:
     1. Mobile Navigation
     2. Sticky Nav + Back-to-Top Button
     3. Scroll Spy (active nav-link highlighting)
     4. Scroll-Reveal Animations
     5. Live Status Check (Kick API)
   ========================================================================== */

/* --------------------------------------------------------------------
   1. MOBILE NAVIGATION
   -------------------------------------------------------------------- */
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navToggle.classList.remove('active');
  mobileMenu.classList.remove('open');
}));


/* --------------------------------------------------------------------
   2. STICKY NAV + BACK-TO-TOP BUTTON
   -------------------------------------------------------------------- */
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('show', window.scrollY > 600);
});
backToTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));


/* --------------------------------------------------------------------
   3. SCROLL SPY — highlights the nav link for the section in view
   -------------------------------------------------------------------- */
const navLinksAll = document.querySelectorAll('.nav-links a, .mobile-menu a');
const spySections = document.querySelectorAll('section[id], header[id]');
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinksAll.forEach(l => l.classList.remove('active'));
      document.querySelectorAll(`a[href="#${entry.target.id}"]`).forEach(l => l.classList.add('active'));
    }
  });
}, {rootMargin: '-40% 0px -55% 0px'});
spySections.forEach(s => spyObserver.observe(s));


/* --------------------------------------------------------------------
   4. SCROLL-REVEAL ANIMATIONS — fade/slide elements in as they enter view
   -------------------------------------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold: .15});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* --------------------------------------------------------------------
   5. LIVE STATUS CHECK — pings Kick's public API for on-air status
   -------------------------------------------------------------------- */
// Best effort: if Kick blocks the request via CORS, this fails silently
// and the badge simply stays on its default "Offline" state.
async function checkLiveStatus() {
  const dots = [document.getElementById('statusDot'), document.getElementById('statusDotNav')];
  const texts = [document.getElementById('statusText'), document.getElementById('statusTextNav')];
  try {
    const res = await fetch('https://kick.com/api/v2/channels/elyasexe');
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    const isLive = !!(data && data.livestream);
    dots.forEach(d => d && d.classList.toggle('live', isLive));
    texts.forEach(t => t && (t.textContent = isLive ? 'Live Now' : 'Offline'));
  } catch (e) {
    // Static sites often get blocked by CORS here — badge stays "Offline" as a safe default.
  }
}
checkLiveStatus();
/* --------------------------------------------------------------------
   6. LEADERBOARDS PAGE — CURRENCY TOGGLE (USD / PHP)
   Only activates if the toggle exists on the page (leaderboards.html).
   USD_TO_PHP_RATE is a static approximate rate — swap in a live FX feed
   if you need this to stay accurate as rates move.
   -------------------------------------------------------------------- */
const USD_TO_PHP_RATE = 61.75;
const currencyButtons = document.querySelectorAll('.currency-btn');
if (currencyButtons.length) {
  const amountEls = document.querySelectorAll('.amount[data-usd]');
  const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const phpFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

  function renderCurrency(currency) {
    amountEls.forEach(el => {
      const usdValue = parseFloat(el.getAttribute('data-usd'));
      el.textContent = currency === 'PHP'
        ? phpFormatter.format(usdValue * USD_TO_PHP_RATE)
        : usdFormatter.format(usdValue);
    });
  }

  currencyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currencyButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      renderCurrency(btn.dataset.currency);
    });
  });
}
