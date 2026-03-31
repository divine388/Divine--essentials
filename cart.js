const cartItemsRoot=document.getElementById("cart-items"),cartTotal=document.getElementById("cart-total");function formatPrice(n){return window.DivineIntl?window.DivineIntl.formatPrice(n):`$${n.toFixed(2)}`}function renderCart(){if(!window.DivineCart||!cartItemsRoot||!cartTotal)return;const n=window.DivineCart.readCart();if(n.length===0){cartItemsRoot.innerHTML='<p class="empty-state">Your cart is empty. Start with a few essentials.</p>',cartTotal.textContent="$0.00";return}cartItemsRoot.innerHTML=n.map(t=>`
      <article class="cart-item" data-id="${t.id}">
        <img src="${t.image}" alt="${t.name}" loading="lazy" decoding="async" />
        <div>
          <h3>${t.name}</h3>
          <p>${formatPrice(t.price)}</p>
        </div>
        <div class="qty-controls">
          <button type="button" class="qty-btn" data-action="decrease">\u2212</button>
          <span>${t.quantity}</span>
          <button type="button" class="qty-btn" data-action="increase">+</button>
        </div>
        <strong>${formatPrice(t.price*t.quantity)}</strong>
      </article>
    `).join(""),cartTotal.textContent=formatPrice(window.DivineCart.getTotal())}cartItemsRoot?.addEventListener("click",n=>{const t=n.target.closest(".qty-btn"),i=n.target.closest(".cart-item");if(!t||!i||!window.DivineCart)return;const e=i.dataset.id,a=window.DivineCart.readCart().find(o=>o.id===e);if(!a)return;const r=t.dataset.action==="increase"?a.quantity+1:a.quantity-1;r<=0?window.DivineCart.removeItem(e):window.DivineCart.updateQuantity(e,r),window.dispatchEvent(new Event("cart:changed")),renderCart()}),window.addEventListener("cart:changed",renderCart),window.addEventListener("locale:changed",renderCart),renderCart();
