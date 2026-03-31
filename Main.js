const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const cartLabels = document.querySelectorAll('[data-cart-link]');
const navbar = document.querySelector('.navbar');
const currencySelectors = document.querySelectorAll('.js-currency');
const languageSelectors = document.querySelectorAll('.js-language');
const languageBadges = document.querySelectorAll('[data-language-current]');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('open');
  });
}

function updateCartLabels() {
  if (!window.DivineCart || cartLabels.length === 0) return;
  const count = window.DivineCart.getCount();
  cartLabels.forEach((label) => {
    label.textContent = `Cart (${count})`;
  });
}

function refreshMoneyLabels() {
  if (!window.DivineIntl) return;
  document.querySelectorAll('[data-usd-price]').forEach((node) => {
    const usd = Number(node.dataset.usdPrice || 0);
    node.textContent = window.DivineIntl.formatPrice(usd);
  });
}

function syncLocaleControls() {
  if (!window.DivineIntl) return;
  const prefs = window.DivineIntl.readPrefs();

  currencySelectors.forEach((select) => {
    select.value = prefs.currency;
  });

  languageSelectors.forEach((select) => {
    select.value = prefs.language;
  });

  languageBadges.forEach((badge) => {
    badge.textContent = window.DivineIntl.labelForLanguage(prefs.language);
  });

  document.documentElement.lang = prefs.language === 'hi' ? 'hi' : 'en';
}

function handleStickyState() {
  if (!navbar) return;
  navbar.classList.toggle('is-scrolled', window.scrollY > 8);
}

function bindLocaleControls() {
  if (!window.DivineIntl) return;

  currencySelectors.forEach((select) => {
    select.addEventListener('change', () => {
      const current = window.DivineIntl.readPrefs();
      window.DivineIntl.writePrefs({ ...current, currency: select.value });
      syncLocaleControls();
      refreshMoneyLabels();
      window.dispatchEvent(new Event('locale:changed'));
    });
  });

  languageSelectors.forEach((select) => {
    select.addEventListener('change', () => {
      const current = window.DivineIntl.readPrefs();
      window.DivineIntl.writePrefs({ ...current, language: select.value });
      syncLocaleControls();
      window.dispatchEvent(new Event('locale:changed'));
    });
  });
}

function injectWhatsAppButton() {
  if (document.querySelector('.whatsapp-float')) return;
  const number = window.WHATSAPP_NUMBER || '919999999999';
  const message = encodeURIComponent(
    'Hello, I want to know more about Divine Essentials products'
  );
  const button = document.createElement('a');
  button.className = 'whatsapp-float';
  button.href = `https://wa.me/${number}?text=${message}`;
  button.target = '_blank';
  button.rel = 'noopener noreferrer';
  button.setAttribute('aria-label', 'Chat on WhatsApp');
  button.textContent = 'WhatsApp';
  document.body.appendChild(button);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}

function setupInstallPrompt() {
  if (!('BeforeInstallPromptEvent' in window) && window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  let deferredPrompt = null;
  let installBtn = null;

  function hideInstallButton() {
    if (!installBtn) return;
    installBtn.classList.remove('show');
    installBtn.setAttribute('aria-hidden', 'true');
  }

  function ensureInstallButton() {
    if (installBtn) return installBtn;

    installBtn = document.createElement('button');
    installBtn.type = 'button';
    installBtn.className = 'pwa-install';
    installBtn.textContent = 'Install App';
    installBtn.setAttribute('aria-label', 'Install Divine Essentials app');
    installBtn.setAttribute('aria-hidden', 'true');

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        hideInstallButton();
      }
      deferredPrompt = null;
    });

    document.body.appendChild(installBtn);
    return installBtn;
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    const button = ensureInstallButton();
    button.classList.add('show');
    button.setAttribute('aria-hidden', 'false');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallButton();
  });
}

syncLocaleControls();
bindLocaleControls();
refreshMoneyLabels();
updateCartLabels();
handleStickyState();
injectWhatsAppButton();
registerServiceWorker();
setupInstallPrompt();

window.addEventListener('storage', () => {
  updateCartLabels();
  syncLocaleControls();
  refreshMoneyLabels();
});
window.addEventListener('cart:changed', updateCartLabels);
window.addEventListener('scroll', handleStickyState, { passive: true });

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href') || '';
  if (
    href.startsWith('#') ||
    href.startsWith('http') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    link.target === '_blank'
  ) {
    return;
  }

  event.preventDefault();
  document.body.classList.add('page-leave');
  setTimeout(() => {
    window.location.href = href;
  }, 170);
});
