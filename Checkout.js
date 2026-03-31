const checkoutItems = document.getElementById('checkout-items');
const checkoutSubtotal = document.getElementById('checkout-subtotal');
const checkoutShipping = document.getElementById('checkout-shipping');
const checkoutEstimate = document.getElementById('checkout-estimate');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutForm = document.getElementById('checkout-form');
const paymentStatus = document.getElementById('payment-status');

function money(value) {
  return window.DivineIntl ? window.DivineIntl.formatPrice(value) : `$${value.toFixed(2)}`;
}

function setStatus(message, type = 'neutral') {
  if (!paymentStatus) return;
  paymentStatus.textContent = message;
  paymentStatus.dataset.type = type;
}

function getShippingUSD(subtotal) {
  if (subtotal >= 50) return 0;
  if (subtotal === 0) return 0;
  return 4.99;
}

function getDeliveryEstimate(subtotal) {
  return subtotal >= 50 ? '2-4 business days' : '4-7 business days';
}

function renderSummary() {
  if (!window.DivineCart || !checkoutItems || !checkoutTotal) return;

  const items = window.DivineCart.readCart();
  const subtotalUSD = window.DivineCart.getTotal();
  const shippingUSD = getShippingUSD(subtotalUSD);
  const totalUSD = subtotalUSD + shippingUSD;

  if (items.length === 0) {
    checkoutItems.innerHTML = '<p class="empty-state">Your cart is empty.</p>';
    checkoutSubtotal.textContent = '$0.00';
    checkoutShipping.textContent = '$0.00';
    checkoutEstimate.textContent = '—';
    checkoutTotal.textContent = '$0.00';
    setStatus('Please add items to cart before payment.', 'neutral');
    return;
  }

  checkoutItems.innerHTML = items
    .map(
      (item) => `
      <div class="checkout-item">
        <span>${item.name} × ${item.quantity}</span>
        <strong>${money(item.price * item.quantity)}</strong>
      </div>
    `
    )
    .join('');

  checkoutSubtotal.textContent = money(subtotalUSD);
  checkoutShipping.textContent = shippingUSD === 0 ? 'Free' : money(shippingUSD);
  checkoutEstimate.textContent = getDeliveryEstimate(subtotalUSD);
  checkoutTotal.textContent = money(totalUSD);
  setStatus('Secure payment powered by Razorpay.', 'neutral');
}

function launchRazorpay(formData, amountInINRPaise, checkoutMeta) {
  const key = window.RAZORPAY_KEY || 'rzp_test_YourKeyHere';

  const options = {
    key,
    amount: amountInINRPaise,
    currency: 'INR',
    name: 'Divine Essentials',
    description: 'Spiritual Essentials Order',
    notes: {
      address: formData.get('address'),
      delivery_estimate: checkoutMeta.deliveryEstimate
    },
    prefill: {
      name: formData.get('fullName') || '',
      email: formData.get('email') || '',
      contact: formData.get('phone') || ''
    },
    theme: {
      color: '#2a2454'
    },
    handler: (response) => {
      const items = window.DivineCart.readCart();
      const order = window.DivineOrders?.createOrder({
        paymentId: response.razorpay_payment_id,
        customer: {
          name: formData.get('fullName') || '',
          email: formData.get('email') || '',
          phone: formData.get('phone') || '',
          address: formData.get('address') || ''
        },
        items,
        subtotalUSD: checkoutMeta.subtotalUSD,
        shippingUSD: checkoutMeta.shippingUSD,
        totalUSD: checkoutMeta.totalUSD,
        deliveryEstimate: checkoutMeta.deliveryEstimate
      });

      setStatus(`Payment successful. ID: ${response.razorpay_payment_id}`, 'success');
      window.DivineCart.writeCart([]);
      window.dispatchEvent(new Event('cart:changed'));

      if (order?.id) {
        window.location.href = `order-success.html?order=${encodeURIComponent(order.id)}`;
      } else {
        renderSummary();
      }
    },
    modal: {
      ondismiss: () => {
        setStatus('Payment cancelled. You can try again anytime.', 'neutral');
      }
    }
  };

  const razorpay = new window.Razorpay(options);
  razorpay.on('payment.failed', (event) => {
    const reason = event?.error?.description || 'Payment failed. Please try again.';
    setStatus(reason, 'error');
  });

  razorpay.open();
}

checkoutForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!window.DivineCart) return;

  const items = window.DivineCart.readCart();
  if (items.length === 0) {
    setStatus('Your cart is empty. Add products to continue.', 'error');
    return;
  }

  if (!window.Razorpay) {
    setStatus('Razorpay SDK failed to load. Check internet and retry.', 'error');
    return;
  }

  const formData = new FormData(checkoutForm);
  const subtotalUSD = window.DivineCart.getTotal();
  const shippingUSD = getShippingUSD(subtotalUSD);
  const totalUSD = subtotalUSD + shippingUSD;
  const amountINR = Math.round(totalUSD * 83 * 100);

  launchRazorpay(formData, amountINR, {
    subtotalUSD,
    shippingUSD,
    totalUSD,
    deliveryEstimate: getDeliveryEstimate(subtotalUSD)
  });
});

window.addEventListener('locale:changed', renderSummary);
renderSummary();
