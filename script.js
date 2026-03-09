// ============================================
// PRAVIN MOBILE SHOP – MAIN SCRIPT
// ============================================

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('pravin_cart') || '[]');
let activeCategory = 'all';
let currentReviewIndex = 0;
const REVIEWS_PER_PAGE = window.innerWidth >= 900 ? (window.innerWidth >= 1100 ? 3 : 2) : 1;

// ---- LOADER ----
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1600);
});

// ---- INIT ----
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  initNavbar();
  initSearch();
  initCart();
  initTheme();
  initCategories();
  initFilters();
  initCompare();
  initReviews();
  initContactForm();
  initScrollReveal();
  initOfferTimer();
  updateCartUI();
});

// ---- LOAD PRODUCTS ----
async function loadProducts() {
  showSkeletons();
  try {
    const res = await fetch('products.json');
    allProducts = await res.json();
    renderProducts(allProducts);
    populateCompareSelects();
  } catch (e) {
    console.error('Failed to load products', e);
    document.getElementById('productsGrid').innerHTML = `<p style="color:var(--text2);text-align:center;grid-column:1/-1;padding:40px">Failed to load products. Please try again.</p>`;
  }
}

function showSkeletons() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = Array(8).fill('').map(() => `
    <div class="skeleton-card">
      <div class="skeleton" style="height:200px;margin-bottom:16px"></div>
      <div class="skeleton" style="height:12px;width:60%;margin-bottom:8px"></div>
      <div class="skeleton" style="height:18px;margin-bottom:8px"></div>
      <div class="skeleton" style="height:12px;width:80%;margin-bottom:16px"></div>
      <div class="skeleton" style="height:24px;width:50%"></div>
    </div>
  `).join('');
}

// ---- RENDER PRODUCTS ----
function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  const countEl = document.getElementById('productCount');
  countEl.textContent = `(${products.length})`;

  if (!products.length) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';
  grid.innerHTML = products.map((p, i) => createProductCard(p, i)).join('');
  attachCardEvents();
}

function formatPrice(n) {
  return '₹' + n.toLocaleString('en-IN');
}

function createProductCard(p, i) {
  const tagClass = p.tag === 'Hot' ? 'hot' : p.tag === 'New' ? 'new' : '';
  return `
    <div class="product-card reveal" style="animation-delay:${i * 50}ms" data-id="${p.id}">
      <div class="product-img-wrap">
        <img
          src="${p.image}"
          alt="${p.brand} ${p.model}"
          class="product-img"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80'"
        />
        ${p.tag ? `<div class="product-tag ${tagClass}">${p.tag}</div>` : ''}
        <div class="discount-badge">${p.discount}%<br/>OFF</div>
        ${!p.inStock ? `<div class="out-of-stock-overlay">Out of Stock</div>` : ''}
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-model">${p.model}</div>
        <div class="product-specs">
          <span class="spec-chip">${p.ram}</span>
          <span class="spec-chip">${p.storage}</span>
          <span class="spec-chip">${p.camera}</span>
          ${p.is5G ? '<span class="spec-chip" style="color:var(--accent);border-color:rgba(61,139,255,0.3)">5G</span>' : ''}
        </div>
        <div class="product-rating">
          <div class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</div>
          <span class="rating-val">${p.rating}</span>
          <span class="rating-count">(${p.reviews.toLocaleString()})</span>
        </div>
        <div class="product-price-row">
          <span class="current-price">${formatPrice(p.price)}</span>
          <span class="original-price">${formatPrice(p.originalPrice)}</span>
        </div>
        <div class="card-actions">
          <button class="card-btn card-btn-view" data-action="view" data-id="${p.id}">View Details</button>
          <button class="card-btn card-btn-reserve ${!p.inStock ? 'disabled' : ''}" data-action="reserve" data-id="${p.id}" ${!p.inStock ? 'disabled' : ''}>Reserve Now</button>
          <a href="https://wa.me/919876543210?text=Hi, I'm interested in ${encodeURIComponent(p.brand + ' ' + p.model + ' at ' + formatPrice(p.price))}" target="_blank" class="card-btn card-btn-wa">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Enquiry
          </a>
        </div>
      </div>
    </div>
  `;
}

function attachCardEvents() {
  document.querySelectorAll('[data-action="view"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openProductModal(parseInt(btn.dataset.id));
    });
  });
  document.querySelectorAll('[data-action="reserve"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openReserveModal(parseInt(btn.dataset.id));
    });
  });
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      openProductModal(id);
    });
  });
  initScrollReveal();
}

// ---- NAVBAR ----
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    // Active nav link
    const sections = ['home','products','categories','compare','offers','location','contact'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) link.classList.toggle('active', rect.top <= 100 && rect.bottom > 100);
    });
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('mobile-open');
  });

  // Close menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('mobile-open');
    });
  });
}

// ---- SEARCH ----
function initSearch() {
  const toggle = document.getElementById('searchToggle');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  toggle.addEventListener('click', () => {
    overlay.classList.toggle('open');
    if (overlay.classList.contains('open')) input.focus();
  });
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('open');
    input.value = '';
    results.innerHTML = '';
  });

  input.addEventListener('input', debounce(() => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = ''; return; }
    const matches = allProducts.filter(p =>
      `${p.brand} ${p.model}`.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 6);
    results.innerHTML = matches.length ? matches.map(p => `
      <div class="search-result-item" data-id="${p.id}">
        <img src="${p.image}" alt="${p.model}" class="search-result-img" loading="lazy" />
        <div class="sr-info">
          <div class="sr-name">${p.brand} ${p.model}</div>
          <div class="sr-price">${formatPrice(p.price)}</div>
        </div>
      </div>
    `).join('') : `<div style="text-align:center;padding:16px;color:var(--text2)">No results found</div>`;

    results.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        openProductModal(parseInt(item.dataset.id));
        overlay.classList.remove('open');
        input.value = '';
        results.innerHTML = '';
      });
    });
  }, 250));
}

// ---- CART ----
function initCart() {
  const toggle = document.getElementById('cartToggle');
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  const closeBtn = document.getElementById('cartClose');

  toggle.addEventListener('click', () => {
    drawer.classList.add('open');
    overlay.classList.add('visible');
  });
  const close = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
  };
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  countEl.textContent = cart.length;
  countEl.classList.toggle('visible', cart.length > 0);

  if (!cart.length) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <p style="font-size:0.8rem;color:var(--text3);margin-top:4px">Add phones to cart to reserve</p>
      </div>`;
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.model}" class="cart-item-img" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.brand} ${item.model}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" title="Remove">✕</button>
    </div>
  `).join('');

  const total = cart.reduce((s, i) => s + i.price, 0);
  footerEl.innerHTML = `
    <div class="cart-total">
      <span>Total (${cart.length} item${cart.length > 1 ? 's' : ''})</span>
      <span class="cart-total-price">${formatPrice(total)}</span>
    </div>
    <button class="btn-primary" style="width:100%;justify-content:center" onclick="checkoutCart()">
      Reserve All Items
    </button>
  `;

  itemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(parseInt(btn.dataset.id));
    });
  });
}

function addToCart(product) {
  if (cart.find(i => i.id === product.id)) return;
  cart.push(product);
  localStorage.setItem('pravin_cart', JSON.stringify(cart));
  updateCartUI();
  showToast(`${product.brand} ${product.model} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem('pravin_cart', JSON.stringify(cart));
  updateCartUI();
}

function checkoutCart() {
  if (!cart.length) return;
  const msg = 'Hi, I want to reserve these phones:\n' + cart.map(i => `• ${i.brand} ${i.model} – ${formatPrice(i.price)}`).join('\n');
  window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, '_blank');
}

// ---- THEME ----
function initTheme() {
  const btn = document.getElementById('themeToggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('pravin_theme') || 'dark';
  html.setAttribute('data-theme', saved);
  updateThemeIcon(saved);

  btn.addEventListener('click', () => {
    const cur = html.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('pravin_theme', next);
    updateThemeIcon(next);
  });
}
function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  btn.querySelector('.sun-icon').style.transform = theme === 'light' ? 'rotate(180deg)' : 'rotate(0)';
}

// ---- CATEGORIES ----
function initCategories() {
  const track = document.getElementById('categoriesTrack');
  document.getElementById('catScrollLeft').addEventListener('click', () => track.scrollBy({ left: -200, behavior: 'smooth' }));
  document.getElementById('catScrollRight').addEventListener('click', () => track.scrollBy({ left: 200, behavior: 'smooth' }));

  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.dataset.filter;
      const brand = chip.dataset.catBrand;
      const acc = chip.dataset.catAcc;

      if (acc) {
        showToast(`${chip.querySelector('span').textContent} accessories — coming soon! Visit our store.`);
        return;
      }

      activeCategory = filter || brand || 'all';
      applyFilters();
      document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ---- FILTERS ----
function initFilters() {
  ['brandFilter', 'priceFilter', 'sortFilter'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
}

function applyFilters() {
  const brand = document.getElementById('brandFilter').value;
  const price = document.getElementById('priceFilter').value;
  const sort = document.getElementById('sortFilter').value;

  let filtered = [...allProducts];

  // Category filter
  if (activeCategory && activeCategory !== 'all') {
    if (['budget','premium','mid-range'].includes(activeCategory)) {
      filtered = filtered.filter(p => p.category === activeCategory);
    } else if (activeCategory === '5g') {
      filtered = filtered.filter(p => p.is5G);
    } else {
      filtered = filtered.filter(p => p.brand.toLowerCase() === activeCategory.toLowerCase());
    }
  }

  if (brand) filtered = filtered.filter(p => p.brand === brand);

  if (price) {
    const [min, max] = price.split('-').map(Number);
    filtered = filtered.filter(p => p.price >= min && p.price <= max);
  }

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sort === 'discount') filtered.sort((a, b) => b.discount - a.discount);

  renderProducts(filtered);
}

// ---- PRODUCT MODAL ----
function openProductModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;

  const modal = document.getElementById('productModal');
  const overlay = document.getElementById('modalOverlay');

  modal.innerHTML = `
    <div class="modal-inner" style="position:relative">
      <button class="modal-close" id="modalClose">✕</button>
      <div class="modal-img-side">
        <img src="${p.image}" alt="${p.brand} ${p.model}" class="modal-img" loading="lazy" />
      </div>
      <div class="modal-info">
        <div class="modal-brand">${p.brand}</div>
        <div class="modal-model">${p.model}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="color:var(--gold)">${'★'.repeat(Math.floor(p.rating))}</span>
          <span style="font-weight:600">${p.rating}</span>
          <span style="color:var(--text3);font-size:0.8rem">(${p.reviews.toLocaleString()} reviews)</span>
        </div>
        <div class="modal-price">${formatPrice(p.price)}</div>
        <div class="modal-original">${formatPrice(p.originalPrice)} · Save ${formatPrice(p.originalPrice - p.price)} (${p.discount}% OFF)</div>
        <div class="modal-specs">
          <div class="modal-spec">
            <div class="modal-spec-label">RAM</div>
            <div class="modal-spec-val">${p.ram}</div>
          </div>
          <div class="modal-spec">
            <div class="modal-spec-label">Storage</div>
            <div class="modal-spec-val">${p.storage}</div>
          </div>
          <div class="modal-spec">
            <div class="modal-spec-label">Camera</div>
            <div class="modal-spec-val">${p.camera}</div>
          </div>
          <div class="modal-spec">
            <div class="modal-spec-label">Battery</div>
            <div class="modal-spec-val">${p.battery}</div>
          </div>
          <div class="modal-spec">
            <div class="modal-spec-label">Display</div>
            <div class="modal-spec-val">${p.display}</div>
          </div>
          <div class="modal-spec">
            <div class="modal-spec-label">Processor</div>
            <div class="modal-spec-val" style="font-size:0.78rem">${p.processor}</div>
          </div>
        </div>
        <div class="modal-actions">
          ${p.inStock
            ? `<button class="btn-primary" onclick="openReserveModal(${p.id});closeProductModal()">Reserve Now</button>
               <button class="btn-outline" onclick="addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')});closeProductModal()">Add to Cart</button>`
            : `<button class="btn-outline" disabled style="opacity:0.5;cursor:not-allowed">Out of Stock</button>`
          }
          <a href="https://wa.me/919876543210?text=Hi, I'm interested in ${encodeURIComponent(p.brand + ' ' + p.model)}" target="_blank" class="card-btn card-btn-wa" style="border-radius:12px;padding:12px">
            WhatsApp Enquiry
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';

  document.getElementById('modalClose').addEventListener('click', closeProductModal);
  overlay.addEventListener('click', closeProductModal);
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
  document.getElementById('modalOverlay').classList.remove('visible');
  document.body.style.overflow = '';
}

// ---- RESERVE MODAL ----
function openReserveModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  const modal = document.getElementById('reserveModal');
  const overlay = document.getElementById('reserveOverlay');

  modal.innerHTML = `
    <div class="reserve-header">
      <h3>Reserve: ${p.brand} ${p.model}</h3>
      <p>Price: <strong style="color:var(--accent)">${formatPrice(p.price)}</strong> · Fill the form and we'll confirm via WhatsApp</p>
    </div>
    <div class="reserve-form">
      <div class="form-group">
        <label>Full Name *</label>
        <input type="text" id="resName" placeholder="Your full name" required />
      </div>
      <div class="form-group">
        <label>Phone Number *</label>
        <input type="tel" id="resPhone" placeholder="+91 XXXXX XXXXX" required />
      </div>
      <div class="form-group">
        <label>Preferred Visit Time</label>
        <input type="text" id="resTime" placeholder="e.g. Tomorrow 5 PM" />
      </div>
      <div class="form-group">
        <label>Message (Optional)</label>
        <textarea id="resMsg" rows="2" placeholder="Any specific color or configuration?"></textarea>
      </div>
      <div style="display:flex;gap:12px">
        <button class="btn-primary" style="flex:1;justify-content:center" onclick="submitReservation(${p.id})">Confirm Reservation</button>
        <button class="btn-outline" onclick="closeReserveModal()">Cancel</button>
      </div>
    </div>
  `;
  modal.classList.add('open');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', closeReserveModal);
}

function closeReserveModal() {
  document.getElementById('reserveModal').classList.remove('open');
  document.getElementById('reserveOverlay').classList.remove('visible');
  document.body.style.overflow = '';
}

function submitReservation(productId) {
  const name = document.getElementById('resName').value.trim();
  const phone = document.getElementById('resPhone').value.trim();
  if (!name || !phone) { showToast('Please fill in name and phone number.', 'error'); return; }

  const p = allProducts.find(x => x.id === productId);
  const time = document.getElementById('resTime').value || 'Not specified';
  const msg = document.getElementById('resMsg').value || '';

  const wa = `Hi Pravin Mobile Shop,\n\nI want to reserve:\n📱 ${p.brand} ${p.model}\n💰 Price: ${formatPrice(p.price)}\n\nCustomer Details:\nName: ${name}\nPhone: ${phone}\nVisit Time: ${time}\nMessage: ${msg || 'None'}`;

  window.open(`https://wa.me/919876543210?text=${encodeURIComponent(wa)}`, '_blank');
  closeReserveModal();
  showToast('Reservation sent via WhatsApp! ✅');
}

// ---- COMPARE ----
function initCompare() {
  const sel1 = document.getElementById('comparePhone1');
  const sel2 = document.getElementById('comparePhone2');
  [sel1, sel2].forEach(sel => sel.addEventListener('change', updateCompare));
}

function populateCompareSelects() {
  const opts = allProducts.map(p => `<option value="${p.id}">${p.brand} ${p.model}</option>`).join('');
  document.getElementById('comparePhone1').innerHTML = `<option value="">-- Select Phone 1 --</option>${opts}`;
  document.getElementById('comparePhone2').innerHTML = `<option value="">-- Select Phone 2 --</option>${opts}`;
}

function updateCompare() {
  const id1 = parseInt(document.getElementById('comparePhone1').value);
  const id2 = parseInt(document.getElementById('comparePhone2').value);
  const p1 = allProducts.find(x => x.id === id1);
  const p2 = allProducts.find(x => x.id === id2);

  updatePreview('preview1', p1);
  updatePreview('preview2', p2);

  const tableWrap = document.getElementById('compareTable');
  if (!p1 || !p2) { tableWrap.style.display = 'none'; return; }
  tableWrap.style.display = 'block';

  const specs = [
    { label: 'Price', key: 'price', format: v => formatPrice(v), lower: true },
    { label: 'RAM', key: 'ram' },
    { label: 'Storage', key: 'storage' },
    { label: 'Camera', key: 'camera' },
    { label: 'Battery', key: 'battery' },
    { label: 'Display', key: 'display' },
    { label: 'Processor', key: 'processor' },
    { label: 'Rating', key: 'rating' },
  ];

  const parseNum = v => parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0;

  tableWrap.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th>Spec</th>
          <th>${p1.brand} ${p1.model}</th>
          <th>${p2.brand} ${p2.model}</th>
        </tr>
      </thead>
      <tbody>
        ${specs.map(s => {
          const v1 = p1[s.key], v2 = p2[s.key];
          const n1 = parseNum(v1), n2 = parseNum(v2);
          let win1 = '', win2 = '';
          if (n1 && n2) {
            if (s.lower) {
              if (n1 < n2) win1 = 'compare-winner';
              else if (n2 < n1) win2 = 'compare-winner';
            } else {
              if (n1 > n2) win1 = 'compare-winner';
              else if (n2 > n1) win2 = 'compare-winner';
            }
          }
          const fmt = s.format || (v => v);
          return `
            <tr>
              <td>${s.label}</td>
              <td class="${win1}">${fmt(v1)}${win1 ? ' ✓' : ''}</td>
              <td class="${win2}">${fmt(v2)}${win2 ? ' ✓' : ''}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function updatePreview(id, p) {
  const el = document.getElementById(id);
  if (!p) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <img src="${p.image}" class="compare-preview-img" alt="${p.model}" loading="lazy" />
    <div class="compare-preview-name">${p.brand} ${p.model}</div>
    <div class="compare-preview-price">${formatPrice(p.price)}</div>
  `;
}

// ---- REVIEWS CAROUSEL ----
function initReviews() {
  const track = document.getElementById('reviewsTrack');
  const cards = track.querySelectorAll('.review-card');
  const perPage = () => window.innerWidth >= 1000 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const total = () => Math.ceil(cards.length / perPage());

  const dotsEl = document.getElementById('revDots');
  const buildDots = () => {
    const t = total();
    dotsEl.innerHTML = Array.from({ length: t }, (_, i) =>
      `<div class="rev-dot${i === currentReviewIndex ? ' active' : ''}" data-i="${i}"></div>`
    ).join('');
    dotsEl.querySelectorAll('.rev-dot').forEach(d => {
      d.addEventListener('click', () => goToReview(parseInt(d.dataset.i)));
    });
  };

  const cardW = () => (cards[0].offsetWidth + 20);
  const goTo = i => {
    const t = total();
    currentReviewIndex = Math.max(0, Math.min(i, t - 1));
    const offset = currentReviewIndex * perPage() * cardW();
    track.style.transform = `translateX(-${offset}px)`;
    buildDots();
  };

  function goToReview(i) { goTo(i); }

  document.getElementById('revPrev').addEventListener('click', () => goTo(currentReviewIndex - 1));
  document.getElementById('revNext').addEventListener('click', () => goTo(currentReviewIndex + 1));

  buildDots();
  let autoInterval = setInterval(() => goTo(currentReviewIndex + 1 >= total() ? 0 : currentReviewIndex + 1), 4000);
  track.addEventListener('mouseenter', () => clearInterval(autoInterval));
  track.addEventListener('mouseleave', () => {
    autoInterval = setInterval(() => goTo(currentReviewIndex + 1 >= total() ? 0 : currentReviewIndex + 1), 4000);
  });
  window.addEventListener('resize', buildDots);
}

// ---- CONTACT FORM ----
function initContactForm() {
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const msg = document.getElementById('contactMsg').value;
    const wa = `Hi Pravin Mobile Shop!\n\nName: ${name}\nPhone: ${phone}\nMessage: ${msg}`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(wa)}`, '_blank');
    document.getElementById('formSuccess').style.display = 'block';
    setTimeout(() => document.getElementById('formSuccess').style.display = 'none', 5000);
    e.target.reset();
  });
}

// ---- SCROLL REVEAL ----
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ---- OFFER TIMER ----
function initOfferTimer() {
  const end = new Date();
  end.setDate(end.getDate() + 2);
  end.setHours(23, 59, 59, 0);

  const el = document.getElementById('offerTimer');
  if (!el) return;

  const tick = () => {
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) { el.textContent = 'Offer Expired'; return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `Ends in: <span>${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s</span>`;
    setTimeout(tick, 1000);
  };
  tick();
}

// ---- TOAST ----
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed; bottom:90px; right:24px; z-index:9999;
    background:${type === 'error' ? '#ef4444' : '#22c55e'};
    color:#fff; padding:12px 20px; border-radius:12px;
    font-size:0.875rem; font-weight:600; font-family:var(--font-body);
    box-shadow:0 8px 32px rgba(0,0,0,0.3);
    animation: toastIn 0.3s ease;
    max-width:300px;
  `;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ---- UTILS ----
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// Add toast animation
const style = document.createElement('style');
style.textContent = `@keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`;
document.head.appendChild(style);
