(function initProducts(windowObj, documentObj) {
  const PRODUCT_KEY = 'divine_essentials_products';

  const searchInput = documentObj.getElementById('product-search');
  const categoryFilter = documentObj.getElementById('category-filter');
  const priceFilter = documentObj.getElementById('price-filter');
  const productGrid = documentObj.getElementById('product-grid');

  function slugify(text) {
    return String(text)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function inPriceRange(price, range) {
    if (range === 'all') {
      return true;
    }

    const [min, max] = range.split('-').map(Number);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      return true;
    }

    return price >= min && price <= max;
  }

  function readStoredProducts() {
    const raw = windowObj.localStorage.getItem(PRODUCT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  }

  function getDefaultProductsFromMarkup() {
    return Array.from(documentObj.querySelectorAll('.product-card')).map((card) => {
      const button = card.querySelector('.quick-add');
      const title = card.querySelector('h2')?.textContent?.trim() || '';
      const image = card.querySelector('img')?.src || '';
      const price = Number(card.dataset.price || 0);
      const category = card.dataset.category || 'wellness';
      const id = button?.dataset.id || slugify(title);

      return {
        id,
        name: title,
        category,
        price,
        image,
      };
    });
  }

  function ensureProductCatalog() {
    const stored = readStoredProducts();
    if (stored) {
      return stored;
    }

    const defaults = getDefaultProductsFromMarkup();
    windowObj.localStorage.setItem(PRODUCT_KEY, JSON.stringify(defaults));
    return defaults;
  }

  function createProductCard(product) {
    const card = documentObj.createElement('article');
    card.className = 'product-card';
    card.dataset.name = product.name;
    card.dataset.category = product.category;
    card.dataset.price = String(product.price);

    const image = documentObj.createElement('img');
    image.src = product.image;
    image.alt = product.name;
    image.loading = 'lazy';
    image.decoding = 'async';

    const info = documentObj.createElement('div');
    info.className = 'product-info';

    const heading = documentObj.createElement('h2');
    heading.textContent = product.name;

    const price = documentObj.createElement('p');
    price.setAttribute('data-usd-price', String(product.price));
    price.textContent = `$${Number(product.price).toFixed(0)}`;

    const actions = documentObj.createElement('div');
    actions.className = 'product-actions';

    const viewLink = documentObj.createElement('a');
    viewLink.href = 'product.html';
    viewLink.textContent = 'View Details';

    const addButton = documentObj.createElement('button');
    addButton.className = 'quick-add';
    addButton.type = 'button';
    addButton.dataset.id = product.id;
    addButton.dataset.name = product.name;
    addButton.dataset.price = String(product.price);
    addButton.dataset.image = product.image;
    addButton.textContent = 'Add to Cart';

    actions.append(viewLink, addButton);
    info.append(heading, price, actions);
    card.append(image, info);
    return card;
  }

  function renderProducts(products) {
    productGrid.innerHTML = '';
    products.forEach((product) => {
      productGrid.appendChild(createProductCard(product));
    });
  }

  function addFromButton(button) {
    if (!windowObj.DivineCart) {
      return;
    }

    windowObj.DivineCart.addItem({
      id: button.dataset.id,
      name: button.dataset.name,
      price: Number(button.dataset.price),
      image: button.dataset.image,
      quantity: 1,
    });

    windowObj.dispatchEvent(new Event('cart:changed'));
    button.textContent = 'Added';
    windowObj.setTimeout(() => {
      button.textContent = 'Add to Cart';
    }, 900);
  }

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const category = categoryFilter?.value || 'all';
    const price = priceFilter?.value || 'all';

    const cards = Array.from(documentObj.querySelectorAll('.product-card'));
    cards.forEach((card) => {
      const name = (card.dataset.name || '').toLowerCase();
      const cardCategory = card.dataset.category || '';
      const cardPrice = Number(card.dataset.price || 0);
      const matchesSearch = name.includes(query);
      const matchesCategory = category === 'all' || category === cardCategory;
      const matchesPrice = inPriceRange(cardPrice, price);
      const visible = matchesSearch && matchesCategory && matchesPrice;

      card.classList.toggle('is-hidden', !visible);
      card.setAttribute('aria-hidden', String(!visible));
    });
  }

  let frame = 0;
  function scheduleApply() {
    if (frame) {
      windowObj.cancelAnimationFrame(frame);
    }
    frame = windowObj.requestAnimationFrame(applyFilters);
  }

  function bindQuickAddButtons() {
    const buttons = Array.from(documentObj.querySelectorAll('.quick-add'));
    buttons.forEach((button) => {
      button.addEventListener('click', () => addFromButton(button));
    });
  }

  const products = ensureProductCatalog();
  renderProducts(products);
  bindQuickAddButtons();

  searchInput?.addEventListener('input', scheduleApply);
  categoryFilter?.addEventListener('change', scheduleApply);
  priceFilter?.addEventListener('change', scheduleApply);

  applyFilters();
})(window, document);
