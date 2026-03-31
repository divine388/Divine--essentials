const orderIdNode = document.getElementById('order-id');
const paymentIdNode = document.getElementById('payment-id');
const orderDateNode = document.getElementById('order-date');
const confirmationItems = document.getElementById('confirmation-items');
const confirmationSubtotal = document.getElementById('confirmation-subtotal');
const confirmationShipping = document.getElementById('confirmation-shipping');
const confirmationEstimate = document.getElementById('confirmation-estimate');
const confirmationTotal = document.getElementById('confirmation-total');
const subtitle = document.getElementById('confirmation-subtitle');
const downloadInvoiceBtn = document.getElementById('download-invoice');

function formatMoney(value) {
  return window.DivineIntl ? window.DivineIntl.formatPrice(value) : `$${value.toFixed(2)}`;
}

function loadOrder() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('order');
  if (!id || !window.DivineOrders) return null;
  return window.DivineOrders.findOrder(id);
}

function buildInvoiceHtml(order) {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${formatMoney(item.price)}</td>
        <td>${formatMoney(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join('');

  const subtotal = order.subtotalUSD ?? order.totalUSD ?? 0;
  const shipping = order.shippingUSD ?? 0;
  const total = order.totalUSD ?? subtotal + shipping;

  return `
    <html>
      <head>
        <title>Invoice ${order.id}</title>
        <style>
          body{font-family:Arial,sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse;margin-top:16px}
          th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f7f7fa}
          .meta{margin-top:8px;color:#555}.totals{margin-top:16px;max-width:320px;margin-left:auto}
          .totals p{display:flex;justify-content:space-between;margin:8px 0}
        </style>
      </head>
      <body>
        <h1>Divine Essentials - Invoice</h1>
        <p class="meta"><strong>Order ID:</strong> ${order.id}</p>
        <p class="meta"><strong>Payment ID:</strong> ${order.paymentId || 'N/A'}</p>
        <p class="meta"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <table>
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="totals">
          <p><span>Subtotal</span><strong>${formatMoney(subtotal)}</strong></p>
          <p><span>Shipping</span><strong>${shipping === 0 ? 'Free' : formatMoney(shipping)}</strong></p>
          <p><span>Grand Total</span><strong>${formatMoney(total)}</strong></p>
        </div>
      </body>
    </html>
  `;
}

function renderOrder(order) {
  if (!order) {
    subtitle.textContent = 'We could not find this order. Please contact support.';
    if (downloadInvoiceBtn) downloadInvoiceBtn.disabled = true;
    return;
  }

  orderIdNode.textContent = order.id;
  paymentIdNode.textContent = order.paymentId || 'N/A';
  orderDateNode.textContent = new Date(order.createdAt).toLocaleString();

  confirmationItems.innerHTML = order.items
    .map(
      (item) => `
      <div class="checkout-item">
        <span>${item.name} × ${item.quantity}</span>
        <strong>${formatMoney(item.price * item.quantity)}</strong>
      </div>
    `
    )
    .join('');

  const subtotal = order.subtotalUSD ?? order.totalUSD ?? 0;
  const shipping = order.shippingUSD ?? 0;
  const total = order.totalUSD ?? subtotal + shipping;

  confirmationSubtotal.textContent = formatMoney(subtotal);
  confirmationShipping.textContent = shipping === 0 ? 'Free' : formatMoney(shipping);
  confirmationEstimate.textContent = order.deliveryEstimate || '4-7 business days';
  confirmationTotal.textContent = formatMoney(total);
}

downloadInvoiceBtn?.addEventListener('click', () => {
  const order = loadOrder();
  if (!order) return;

  const popup = window.open('', '_blank', 'width=900,height=700');
  if (!popup) return;

  popup.document.open();
  popup.document.write(buildInvoiceHtml(order));
  popup.document.close();
  popup.focus();
  popup.print();
});

window.addEventListener('locale:changed', () => renderOrder(loadOrder()));
renderOrder(loadOrder());
