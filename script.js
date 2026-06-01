const PRODUCTS = [
  { id: 1,  name: "Cristiano Ronaldo",  club: "Manchester United",      price: 250000, img: "images/Cristiano Ronaldo.png",     rarity: "legendary", stock: 12, isBestSeller: true },
  { id: 2,  name: "Lionel Messi",      club: "Argentina",   price: 250000, img: "images/messi.png",       rarity: "legendary", stock: 10, isBestSeller: true  },
  { id: 3,  name: "Kylian Mbappe",     club: "Real Madrid",      price: 200000, img: "images/Mbappe.png",       rarity: "legendary", stock: 8  },
  { id: 4,  name: "Erling Haaland",      club: "Manchester City",  price: 190000, img: "images/Erling Haaland.png",     rarity: "legendary", stock: 7  },
  { id: 5,  name: "Vinicius Junior",    club: "Real Madrid",      price: 170000, img: "images/Vinicius Junior.png",        rarity: "rare",      stock: 10 },
  { id: 6,  name: "Jude Bellingham",    club: "Real Madrid",      price: 165000, img: "images/Jude Bellingham.png",  rarity: "rare",      stock: 10 },
  { id: 7,  name: "Phil Foden ",         club: "Manchester City",  price: 155000, img: "images/Phil Foden.png",       rarity: "rare",      stock: 12 },
  { id: 8,  name: "Lamine Yamal",        club: "FC Barcelona",     price: 150000, img: "images/Lamine Yamal.png",       rarity: "rare",      stock: 9  },
  { id: 9,  name: "Bukayo Saka",       club: "Arsenal FC",       price: 140000, img: "images/Bukayo Saka.png",        rarity: "rare",      stock: 11 },
  { id: 10, name: "Rodri",               club: "Manchester City",  price: 135000, img: "images/Rodri.png",        rarity: "rare",      stock: 8  },
  { id: 11, name: "Mohamed Salah",         club: "Liverpool FC",     price: 130000, img: "images/Mohamed Salah.png",       rarity: "common",    stock: 15 },
  { id: 12, name: "Neymar Jr",          club: "Brazil", price: 250000, img: "images/Neymar.png", rarity: "legendary", stock: 15, isBestSeller: true },
];

const COUPONS = {
  "LAO2024": { discount: 0.05, label: "ສ່ວນຫຼຸດ 5%" },
  "KICK10":  { discount: 0.10, label: "ສ່ວນຫຼຸດ 10%" },
  "VIP20":   { discount: 0.20, label: "ສ່ວນຫຼຸດ 20%" },
};

let cart = [];
let stock = {};      
let appliedCoupon = null;

function init() {
  applyLaoFont();
  loadState();
  renderProducts();
  renderCart();
  startClock();
}

function applyLaoFont() {
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;700&display=swap';
  document.head.appendChild(fontLink);

  const style = document.createElement('style');
  style.textContent = `
    body, h1, h2, h3, button, input, select, textarea, .card-name, .card-club, .cart-item-name, .stock-badge {
      font-family: 'Noto Sans Lao', sans-serif !important;
    }
  `;
  document.head.appendChild(style);
}

function saveState() {
  localStorage.setItem('kcs_cart', JSON.stringify(cart));
  localStorage.setItem('kcs_stock', JSON.stringify(stock));
  localStorage.setItem('kcs_coupon', JSON.stringify(appliedCoupon));
}

function loadState() {
  const savedStock = localStorage.getItem('kcs_stock');
  if (savedStock) {
    stock = JSON.parse(savedStock);
    PRODUCTS.forEach(p => {
      if (!(p.id in stock)) stock[p.id] = p.stock;
    });
  } else {
    PRODUCTS.forEach(p => { stock[p.id] = p.stock; });
  }

  const savedCart = localStorage.getItem('kcs_cart');
  if (savedCart) cart = JSON.parse(savedCart);

  const savedCoupon = localStorage.getItem('kcs_coupon');
  if (savedCoupon) appliedCoupon = JSON.parse(savedCoupon);
}

function startClock() {
  const el = document.getElementById('clock');
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);
}

function fmt(n) {
  return n.toLocaleString('lo-LA') + ' ₭';
}

function renderProducts(filter = '') {
  const grid = document.getElementById('productGrid');
  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.club.toLowerCase().includes(filter.toLowerCase())
  );

  grid.innerHTML = filtered.map(p => {
    const qty = stock[p.id] ?? 0;
    const outOfStock = qty === 0;
    const lowStock = qty > 0 && qty <= 3;
    const badgeClass = `badge-${p.rarity}`;
    const rarityLabel = { legendary: 'Legendary', rare: 'Rare', common: 'Common' }[p.rarity];

    let stockLabel = `ເຫຼືອ ${qty} ໃບ`;
    let stockClass = 'stock-badge';
    if (outOfStock) { stockLabel = 'ໝົດສະຕ໋ອກ'; stockClass += ' stock-out'; }
    else if (lowStock) { stockLabel = `⚠ ເຫຼືອ ${qty} ໃບ`; stockClass += ' stock-low'; }

    const bestSellerTag = p.isBestSeller ? `<div class="best-seller-badge">🔥 ຂາຍດີ</div>` : '';

    return `
      <div class="product-card${outOfStock ? ' out-stock' : ''}" onclick="addToCart(${p.id})">
        ${bestSellerTag} <img src="${p.img}" alt="${p.name}" class="card-img" />
        <div class="card-name">${p.name}</div>
        <div class="card-club">⚽ ${p.club}</div>
        <div class="card-footer">
          <span class="card-price">${fmt(p.price)}</span>
          <span class="card-badge ${badgeClass}">${rarityLabel}</span>
        </div>
        <div class="${stockClass}">${stockLabel}</div>
      </div>
    `;
  }).join('');
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  if ((stock[productId] ?? 0) <= 0) { showToast('ສິນຄ້ານີ້ໝົດສະຕ໋ອກແລ້ວ ❌'); return; }

  const existing = cart.find(c => c.id === productId);
  if (existing) {
    if (existing.qty >= (stock[productId] ?? 0) + existing.qty) {
      showToast('ສິນຄ້າໃນສະຕ໋ອກບໍ່ພໍ ⚠'); return;
    }
    existing.qty++;
  } else {
    cart.push({ id: productId, qty: 1, price: product.price, name: product.name });
  }

  stock[productId]--;
  saveState();
  renderProducts(document.getElementById('searchInput').value);
  renderCart();
  showToast(`ເພີ່ມ ${product.name} ✓`);
}

function removeItem(productId) {
  const item = cart.find(c => c.id === productId);
  if (!item) return;
  // Return stock
  stock[productId] = (stock[productId] ?? 0) + item.qty;
  cart = cart.filter(c => c.id !== productId);
  saveState();
  renderProducts(document.getElementById('searchInput').value);
  renderCart();
  showToast('ລຶບລາຍການອອກແລ້ວ 🗑');
}

function updateQty(productId, delta) {
  const item = cart.find(c => c.id === productId);
  if (!item) return;

  if (delta > 0) {
    if ((stock[productId] ?? 0) <= 0) { showToast('ສິນຄ້າໃນສະຕ໋ອກບໍ່ພໍ ⚠'); return; }
    item.qty++;
    stock[productId]--;
  } else {
    if (item.qty <= 1) { removeItem(productId); return; }
    item.qty--;
    stock[productId]++;
  }

  saveState();
  renderProducts(document.getElementById('searchInput').value);
  renderCart();
}

function calcTotals() {
  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const discountRate = appliedCoupon ? appliedCoupon.discount : 0;
  const discount = Math.round(subtotal * discountRate);
  const total = subtotal - discount;
  return { subtotal, discount, total, discountRate };
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const countEl = document.getElementById('cartCount');
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  countEl.textContent = totalItems;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>ຍັງບໍ່ມີສິນຄ້າໃນກະຕ່າ</p>
      </div>
    `;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item" id="ci-${item.id}">
        <div class="cart-item-top">
          <div class="cart-item-name">${item.name}</div>
          <button class="btn-remove" onclick="removeItem(${item.id})" title="ລຶບ">✕</button>
        </div>
        <div class="cart-item-bottom">
          <div class="qty-control">
            <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty(${item.id}, +1)">+</button>
          </div>
          <span class="cart-item-price">${fmt(item.price * item.qty)}</span>
        </div>
      </div>
    `).join('');
  }

  const { subtotal, discount, total } = calcTotals();
  document.getElementById('subtotalVal').textContent = fmt(subtotal);
  document.getElementById('discountRow').style.display = appliedCoupon ? 'flex' : 'none';
  document.getElementById('discountVal').textContent = '−' + fmt(discount);
  document.getElementById('totalVal').textContent = fmt(total);

  document.getElementById('btnCheckout').disabled = cart.length === 0;
}

function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  const msgEl = document.getElementById('couponMsg');

  if (!code) { msgEl.textContent = 'ກະລຸນາໃສ່ລະຫັດ'; msgEl.className = 'coupon-msg coupon-err'; return; }

  if (COUPONS[code]) {
    appliedCoupon = COUPONS[code];
    msgEl.textContent = `✓ ໃຊ້ລະຫັດ ${code} — ${appliedCoupon.label}`;
    msgEl.className = 'coupon-msg coupon-ok';
    saveState();
    renderCart();
  } else {
    appliedCoupon = null;
    msgEl.textContent = '✕ ລະຫັດບໍ່ຖືກတော့';
    msgEl.className = 'coupon-msg coupon-err';
  }
}

function clearCart() {
  cart.forEach(item => { stock[item.id] = (stock[item.id] ?? 0) + item.qty; });
  cart = [];
  appliedCoupon = null;
  document.getElementById('couponInput').value = '';
  document.getElementById('couponMsg').textContent = '';
  saveState();
  renderProducts(document.getElementById('searchInput').value);
  renderCart();
  showToast('ລ້າງກະຕ່າແລ້ວ 🗑');
}

function checkout() {
  if (cart.length === 0) return;
  document.getElementById('confirmModal').classList.add('open');
}

function cancelCheckout() {
  document.getElementById('confirmModal').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').addEventListener('input', e => {
    renderProducts(e.target.value);
  });
  document.getElementById('couponInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') applyCoupon();
  });
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function resetStock() {
  PRODUCTS.forEach(p => { stock[p.id] = p.stock; });
  cart = [];
  appliedCoupon = null;
  saveState();
  renderProducts();
  renderCart();
  showToast('ລີເຊັດສະຕ໋ອກສຳເລັດ ✓');
}
function confirmCheckout() {
  document.getElementById('confirmModal').classList.remove('open');
  const { subtotal, discount, total } = calcTotals();

  const custName = document.getElementById('customerName').value.trim() || 'ລູກຄ້າທົ່ວໄປ';
  const custPhone = document.getElementById('customerPhone').value.trim() || '-';

  const receiptData = {
    customerName: custName,
    customerPhone: custPhone,

    items: cart.map(c => ({
      name: c.name,
      qty: c.qty,
      price: c.price,
      subtotal: c.price * c.qty,
    })),
    subtotal,
    discount,
    total,
    coupon: appliedCoupon ? document.getElementById('couponInput').value.toUpperCase() : null,
    date: new Date().toLocaleString('lo-LA'),
  };

  localStorage.setItem('kcs_receipt', JSON.stringify(receiptData));

  cart = [];
  appliedCoupon = null;
  document.getElementById('couponInput').value = '';
  document.getElementById('couponMsg').textContent = '';
  saveState();
  renderProducts();
  renderCart();

  window.open('receipt.html', '_blank', 'width=480,height=700');
  showToast('ຊຳລະເງິນສຳເລັດ 🎉');
}
init();