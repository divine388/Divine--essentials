(function initAdmin(windowObj, documentObj) {
  const PRODUCT_KEY = 'divine_essentials_products';

  const form = documentObj.getElementById('admin-product-form');
  const statusEl = documentObj.getElementById('admin-status');
  const productsContainer = documentObj.getElementById('admin-products');
  const ordersContainer = documentObj.getElementById('admin-orders');
  const productStat = documentObj.getElementById('stat-products');
  const orderStat = documentObj.getElementById('stat-orders');

  function slugify(text) {
    return String(text)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function readProducts() {
    const raw = windowObj.localStorage.getItem(PRODUCT_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }

  function writeProducts(products) {
    windowObj.localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
  }

  function readOrders() {
    if (!windowObj.DivineOrders || typeof windowObj.DivineOrders.readOrders !== 'function') {
      return [];
    }
    return windowObj.DivineOrders.readOrders();
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    if (type) {
      statusEl.dataset.type = type;
      return;
    }
    delete statusEl.dataset.type;
  }

  function productRow(product) {
    const row = documentObj.createElement('article');
    row.className = 'admin-row';

    const details = documentObj.createElement('div');
    details.className = 'admin-row-info';

    const title = documentObj.createElement('strong');
    title.textContent = product.name;

    const meta = documentObj.createElement('p');
    meta.textContent = `${product.category} • $${Number(product.price).toFixed(2)}`;

    details.append(title, meta);

    const actions = documentObj.createElement('div');
    actions.className = 'admin-row-actions';

    const deleteButton = documentObj.createElement('button');
    deleteButton.className = 'quick-add';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Remove';
    deleteButton.addEventListener('click', () => {
      const products = readProducts().filter((entry) => entry.id !== product.id);
      writeProducts(products);
      render();
      setStatus('Product removed.', 'success');
    });

    actions.appendChild(deleteButton);
    row.append(details, actions);
    return row;
  }

  function orderRow(order) {
    const row = documentObj.createElement('article');
    row.className = 'admin-row';

    const details = documentObj.createElement('div');
    details.className = 'admin-row-info';

    const title = documentObj.createElement('strong');
    title.textContent = order.id;

    const meta = documentObj.createElement('p');
    const amount = Number(order.totals?.total ?? 0).toFixed(2);
    const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown date';
    meta.textContent = `${date} • $${amount}`;

    details.append(title, meta);
    row.appendChild(details);
    return row;
  }

  function render() {
    const products = readProducts();
    const orders = readOrders();

    productStat.textContent = String(products.length);
    orderStat.textContent = String(orders.length);

    productsContainer.innerHTML = '';
    if (!products.length) {
      productsContainer.innerHTML = '<p class="empty-state">No admin products yet.</p>';
    } else {
      products.forEach((product) => {
        productsContainer.appendChild(productRow(product));
      });
    }

    ordersContainer.innerHTML = '';
    if (!orders.length) {
      ordersContainer.innerHTML = '<p class="empty-state">No orders yet.</p>';
    } else {
      orders.slice(0, 10).forEach((order) => {
        ordersContainer.appendChild(orderRow(order));
      });
    }
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const price = Number(formData.get('price'));
    const category = String(formData.get('category') || '').trim();
    const image = String(formData.get('image') || '').trim();

    if (!name || !category || !image || Number.isNaN(price) || price <= 0) {
      setStatus('Please enter a valid product.', 'error');
      return;
    }

    const id = slugify(name);
    const products = readProducts();

    if (products.some((product) => product.id === id)) {
      setStatus('A product with this name already exists.', 'error');
      return;
    }

    products.push({
      id,
      name,
      price,
      category,
      image,
    });

    writeProducts(products);
    form.reset();
    render();
    setStatus('Product added.', 'success');
  });

  render();
})(window, document);
