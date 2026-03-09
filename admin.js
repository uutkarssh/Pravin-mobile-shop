// ============================================
// PRAVIN MOBILE SHOP – ADMIN PANEL SCRIPT
// ============================================

const ADMIN_CREDS = { user: 'admin', pass: 'admin123' };
let products = [];
let offers = JSON.parse(localStorage.getItem('pravin_offers') || '[]');
if (!offers.length) {
  offers = [
    { id: 1, title: 'Festival Special', desc: 'Up to 20% OFF on all Samsung & Apple phones', icon: '🎉' },
    { id: 2, title: 'Student Discount', desc: 'Show ID and get 5% extra OFF on any purchase', icon: '🎓' },
    { id: 3, title: 'Exchange & Upgrade', desc: 'Get up to ₹15,000 extra on exchange', icon: '🔄' },
  ];
  localStorage.setItem('pravin_offers', JSON.stringify(offers));
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('pravin_admin') === 'true') {
    showDashboard();
  }
  initLogin();
  initSidebar();
  initProductForm();
  initProductSearch();
});

// ---- LOGIN ----
function initLogin() {
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const errEl = document.getElementById('loginError');
    if (user === ADMIN_CREDS.user && pass === ADMIN_CREDS.pass) {
      sessionStorage.setItem('pravin_admin', 'true');
      errEl.textContent = '';
      showDashboard();
    } else {
      errEl.textContent = '❌ Invalid username or password.';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('pravin_admin');
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
  });
}

async function showDashboard() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'flex';
  await loadProductsData();
  renderDashboard();
  renderProductsTable();
  renderOffersAdmin();
}

// ---- LOAD DATA ----
async function loadProductsData() {
  // Load from localStorage (admin edits) or fallback to products.json
  const saved = localStorage.getItem('pravin_products');
  if (saved) {
    products = JSON.parse(saved);
  } else {
    try {
      const res = await fetch('products.json');
      products = await res.json();
      localStorage.setItem('pravin_products', JSON.stringify(products));
    } catch { products = []; }
  }
}

function saveProducts() {
  localStorage.setItem('pravin_products', JSON.stringify(products));
}

// ---- SIDEBAR ----
function initSidebar() {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.dataset.page;
      showPage(page);
    });
  });
}

function showPage(page) {
  // Update sidebar active
  document.querySelectorAll('.sidebar-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const el = document.getElementById(`page-${page}`);
  if (el) el.style.display = 'block';

  const titles = {
    dashboard: ['Dashboard', 'Overview of your store'],
    products: ['Products', 'Manage your phone inventory'],
    'add-product': ['Add Product', 'Add a new phone to your catalog'],
    offers: ['Offers', 'Manage promotional offers'],
  };
  const [title, sub] = titles[page] || ['Dashboard', ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSub').textContent = sub;

  if (page === 'add-product') {
    document.getElementById('addEditTitle').textContent = 'Add New Product';
    document.getElementById('submitProductBtn').textContent = 'Add Product';
    document.getElementById('editProductId').value = '';
    resetForm();
  }
}

// ---- DASHBOARD ----
function renderDashboard() {
  document.getElementById('statTotal').textContent = products.length;
  document.getElementById('statInStock').textContent = products.filter(p => p.inStock).length;
  document.getElementById('statOOS').textContent = products.filter(p => !p.inStock).length;
  const avg = products.length ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1) : 0;
  document.getElementById('statAvgRating').textContent = avg;

  const recent = products.slice(-5).reverse();
  document.getElementById('recentProducts').innerHTML = recent.length ? `
    <table class="admin-table">
      <thead><tr><th>Image</th><th>Product</th><th>Price</th><th>Stock</th></tr></thead>
      <tbody>
        ${recent.map(p => `
          <tr>
            <td><img src="${p.image}" class="table-img" alt="${p.model}" loading="lazy" onerror="this.style.display='none'" /></td>
            <td><strong>${p.brand} ${p.model}</strong></td>
            <td>₹${p.price.toLocaleString('en-IN')}</td>
            <td><span class="badge ${p.inStock ? 'badge-green' : 'badge-red'}">${p.inStock ? 'In Stock' : 'OOS'}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p style="color:var(--text2);text-align:center;padding:20px">No products found</p>';
}

// ---- PRODUCTS TABLE ----
function renderProductsTable(list = products) {
  const body = document.getElementById('adminProductsBody');
  if (!list.length) {
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text2);padding:32px">No products found</td></tr>`;
    return;
  }
  body.innerHTML = list.map(p => `
    <tr>
      <td><img src="${p.image}" class="table-img" alt="${p.model}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&q=60'" /></td>
      <td>
        <div style="font-weight:700">${p.brand} ${p.model}</div>
        <div style="font-size:0.75rem;color:var(--text2)">${p.ram} · ${p.storage} · ${p.camera}</div>
      </td>
      <td>
        <div style="font-weight:700;color:var(--accent)">₹${p.price.toLocaleString('en-IN')}</div>
        <div style="font-size:0.72rem;color:var(--text3);text-decoration:line-through">₹${p.originalPrice.toLocaleString('en-IN')}</div>
      </td>
      <td><span class="badge ${p.inStock ? 'badge-green' : 'badge-red'}">${p.inStock ? 'In Stock' : 'Out of Stock'}</span></td>
      <td>⭐ ${p.rating}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn action-btn-edit" onclick="editProduct(${p.id})">Edit</button>
          <button class="action-btn action-btn-toggle" onclick="toggleStock(${p.id})">${p.inStock ? 'OOS' : 'InStock'}</button>
          <button class="action-btn action-btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ---- PRODUCT SEARCH ----
function initProductSearch() {
  document.getElementById('productSearch').addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    const filtered = q ? products.filter(p =>
      `${p.brand} ${p.model}`.toLowerCase().includes(q)
    ) : products;
    renderProductsTable(filtered);
  });
}

// ---- ADD/EDIT PRODUCT ----
function initProductForm() {
  document.getElementById('productForm').addEventListener('submit', e => {
    e.preventDefault();
    const editId = document.getElementById('editProductId').value;
    const newProduct = {
      id: editId ? parseInt(editId) : Date.now(),
      brand: document.getElementById('fBrand').value.trim(),
      model: document.getElementById('fModel').value.trim(),
      price: parseInt(document.getElementById('fPrice').value) || 0,
      originalPrice: parseInt(document.getElementById('fOriginalPrice').value) || 0,
      discount: parseInt(document.getElementById('fDiscount').value) || 0,
      ram: document.getElementById('fRam').value.trim() || 'N/A',
      storage: document.getElementById('fStorage').value.trim() || 'N/A',
      battery: document.getElementById('fBattery').value.trim() || 'N/A',
      camera: document.getElementById('fCamera').value.trim() || 'N/A',
      display: document.getElementById('fDisplay').value.trim() || 'N/A',
      processor: document.getElementById('fProcessor').value.trim() || 'N/A',
      rating: parseFloat(document.getElementById('fRating').value) || 4.0,
      reviews: parseInt(document.getElementById('fReviews').value) || 0,
      category: document.getElementById('fCategory').value,
      tag: document.getElementById('fTag').value.trim() || '',
      image: document.getElementById('fImage').value.trim() || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
      inStock: document.getElementById('fInStock').checked,
      is5G: document.getElementById('f5G').checked,
      color: '#3d8bff',
    };

    if (editId) {
      const idx = products.findIndex(p => p.id === parseInt(editId));
      if (idx !== -1) products[idx] = newProduct;
      showToastAdmin('Product updated successfully! ✅');
    } else {
      products.push(newProduct);
      showToastAdmin('Product added successfully! 🎉');
    }

    saveProducts();
    resetForm();
    renderDashboard();
    renderProductsTable();
    showPage('products');
  });
}

function resetForm() {
  ['fBrand','fModel','fPrice','fOriginalPrice','fDiscount','fRam','fStorage','fBattery',
   'fCamera','fDisplay','fProcessor','fRating','fReviews','fTag','fImage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('fCategory').value = 'mid-range';
  document.getElementById('fInStock').checked = true;
  document.getElementById('f5G').checked = true;
  document.getElementById('editProductId').value = '';
}

function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  showPage('add-product');
  document.getElementById('addEditTitle').textContent = 'Edit Product';
  document.getElementById('submitProductBtn').textContent = 'Update Product';
  document.getElementById('editProductId').value = p.id;
  document.getElementById('fBrand').value = p.brand;
  document.getElementById('fModel').value = p.model;
  document.getElementById('fPrice').value = p.price;
  document.getElementById('fOriginalPrice').value = p.originalPrice;
  document.getElementById('fDiscount').value = p.discount;
  document.getElementById('fRam').value = p.ram;
  document.getElementById('fStorage').value = p.storage;
  document.getElementById('fBattery').value = p.battery;
  document.getElementById('fCamera').value = p.camera;
  document.getElementById('fDisplay').value = p.display;
  document.getElementById('fProcessor').value = p.processor;
  document.getElementById('fRating').value = p.rating;
  document.getElementById('fReviews').value = p.reviews;
  document.getElementById('fCategory').value = p.category;
  document.getElementById('fTag').value = p.tag || '';
  document.getElementById('fImage').value = p.image;
  document.getElementById('fInStock').checked = p.inStock;
  document.getElementById('f5G').checked = p.is5G;
}

function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  products = products.filter(p => p.id !== id);
  saveProducts();
  renderDashboard();
  renderProductsTable();
  showToastAdmin('Product deleted.');
}

function toggleStock(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  p.inStock = !p.inStock;
  saveProducts();
  renderProductsTable();
  renderDashboard();
  showToastAdmin(`${p.brand} ${p.model} marked as ${p.inStock ? 'In Stock' : 'Out of Stock'}.`);
}

// ---- OFFERS ----
function renderOffersAdmin() {
  const el = document.getElementById('offersList');
  if (!el) return;
  el.innerHTML = offers.length ? offers.map(o => `
    <div class="offer-admin-item">
      <div class="offer-admin-icon">${o.icon}</div>
      <div class="offer-admin-info">
        <div class="offer-admin-title">${o.title}</div>
        <div class="offer-admin-desc">${o.desc}</div>
      </div>
      <button class="offer-delete-btn" onclick="deleteOffer(${o.id})">Delete</button>
    </div>
  `).join('') : '<p style="color:var(--text2)">No offers added yet.</p>';
}

function addOffer() {
  const title = document.getElementById('offerTitle').value.trim();
  const desc = document.getElementById('offerDesc').value.trim();
  const icon = document.getElementById('offerIcon').value.trim() || '🎁';
  if (!title) { showToastAdmin('Please enter an offer title.', true); return; }
  offers.push({ id: Date.now(), title, desc, icon });
  localStorage.setItem('pravin_offers', JSON.stringify(offers));
  document.getElementById('offerTitle').value = '';
  document.getElementById('offerDesc').value = '';
  document.getElementById('offerIcon').value = '';
  renderOffersAdmin();
  showToastAdmin('Offer added! ✅');
}

function deleteOffer(id) {
  offers = offers.filter(o => o.id !== id);
  localStorage.setItem('pravin_offers', JSON.stringify(offers));
  renderOffersAdmin();
  showToastAdmin('Offer removed.');
}

// ---- TOAST ----
function showToastAdmin(msg, error = false) {
  const existing = document.querySelector('.admin-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'admin-toast';
  t.style.background = error ? '#ef4444' : '#22c55e';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
}
