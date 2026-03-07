/* ===================================================
   Pravin Mobile Shop — script.js  (Fixed)
   Products are embedded inline so the site works
   when opened directly as a local file (file://)
   =================================================== */

const WHATSAPP_NUMBER = "919999999999";
const STORE_NAME = "Pravin Mobile Shop";

// ─── PRODUCTS DATA (inline — no fetch/CORS issue) ───
const PRODUCTS_DATA = [
  { id:1,  name:"Premium Silicone Case – iPhone 15",   category:"covers",       price:299,  originalPrice:599,  image:"https://images.unsplash.com/photo-1601593346740-925612772716?w=400&q=80", description:"Military-grade drop protection with a soft-touch matte finish. Precise cutouts, wireless charging compatible.", badge:"Bestseller" },
  { id:2,  name:"Clear Armor Case – Samsung S24",       category:"covers",       price:249,  originalPrice:499,  image:"https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80", description:"Crystal-clear TPU hard case. Anti-yellowing technology, raised bezels for screen and camera protection.", badge:"New" },
  { id:3,  name:"Tempered Glass Guard – Universal",     category:"screenguards", price:149,  originalPrice:299,  image:"https://images.unsplash.com/photo-1592813952239-5fc5f0baa9e8?w=400&q=80", description:"9H hardness tempered glass with oleophobic coating. 99.9% clarity, full glue for edge-to-edge protection.", badge:"Top Rated" },
  { id:4,  name:"Privacy Screen Guard – iPhone 14",     category:"screenguards", price:199,  originalPrice:399,  image:"https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80", description:"Anti-spy privacy filter with 9H hardness. Blocks side-view visibility, protects your data in public.", badge:null },
  { id:5,  name:"65W GaN Fast Charger",                 category:"chargers",     price:899,  originalPrice:1799, image:"https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&q=80", description:"Gallium Nitride technology. Charges your phone 0–100% in under 45 minutes. Multi-device compatible.", badge:"Hot Deal" },
  { id:6,  name:"20W USB-C PD Charger",                 category:"chargers",     price:499,  originalPrice:999,  image:"https://images.unsplash.com/photo-1631281956016-3cdc1b2fe5fb?w=400&q=80", description:"Power Delivery 3.0 fast charging. Compact travel-friendly design, universal compatibility.", badge:null },
  { id:7,  name:"Pro Bass Wireless Earbuds",            category:"earbuds",      price:1299, originalPrice:2499, image:"https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&q=80", description:"Active Noise Cancellation, 30hr battery life, IPX5 water resistant. Immersive bass with crystal highs.", badge:"Premium" },
  { id:8,  name:"TWS Lite Earbuds",                     category:"earbuds",      price:699,  originalPrice:1299, image:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80", description:"True wireless stereo, 20hr total battery. Touch controls, voice assistant support, ergonomic fit.", badge:"Value Pick" },
  { id:9,  name:"Carbon Fiber Skin – Samsung S23",      category:"skins",        price:199,  originalPrice:399,  image:"https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80", description:"Premium 3M vinyl skin. Bubble-free application, residue-free removal. Precise laser-cut fit.", badge:"New" },
  { id:10, name:"Marble Texture Skin – Universal",      category:"skins",        price:149,  originalPrice:299,  image:"https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=400&q=80", description:"Elegant marble pattern vinyl wrap. Scratch-resistant, ultra-thin 0.2mm profile, easy DIY application.", badge:null },
  { id:11, name:"5000mAh Li-ion Battery – Redmi",       category:"batteries",    price:449,  originalPrice:899,  image:"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80", description:"OEM-grade lithium-ion replacement battery. CE & RoHS certified. Includes installation toolkit.", badge:"Reliable" },
  { id:12, name:"4000mAh Battery – Samsung J-Series",   category:"batteries",    price:399,  originalPrice:799,  image:"https://images.unsplash.com/photo-1609592806596-b008a6b1a636?w=400&q=80", description:"High-capacity replacement battery with 500+ charge cycle life. Zero memory effect, safe chemistry.", badge:null }
];

// ─── GLOBALS ─────────────────────────────────────────
let allProducts = [];
let revealObserverRef = null;

// ─── LOADER ──────────────────────────────────────────
window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("done");
  }, 1400);
});

// ─── THEME TOGGLE ────────────────────────────────────
const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

function setTheme(theme) {
  html.setAttribute("data-theme", theme);
  try { localStorage.setItem("pravin_theme", theme); } catch(e) {}
  const icon = themeToggle && themeToggle.querySelector(".theme-icon");
  if (icon) icon.textContent = theme === "dark" ? "\u2600" : "\u263E";
}

(function initTheme() {
  let t = "dark";
  try { t = localStorage.getItem("pravin_theme") || "dark"; } catch(e) {}
  setTheme(t);
})();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });
}

// ─── NAVBAR ──────────────────────────────────────────
const navbar    = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinksEl= document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 20);
  updateActiveNav();
}, { passive: true });

if (hamburger && navLinksEl) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinksEl.classList.toggle("open");
  });
  navLinksEl.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinksEl.classList.remove("open");
    });
  });
}

function updateActiveNav() {
  const scrollY = window.scrollY + 130;
  document.querySelectorAll("section[id]").forEach(section => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const link = document.querySelector('.nav-link[href="#' + section.id + '"]');
    if (link) link.classList.toggle("active", scrollY >= top && scrollY < bottom);
  });
}

// ─── SMOOTH SCROLL ───────────────────────────────────
document.addEventListener("click", e => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const href = anchor.getAttribute("href");
  if (!href || href === "#") return;
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  const navH = navbar ? navbar.offsetHeight : 68;
  const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
  window.scrollTo({ top, behavior: "smooth" });
});

// ─── REVEAL OBSERVER ─────────────────────────────────
function initRevealObserver() {
  revealObserverRef = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserverRef.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

  document.querySelectorAll(".reveal").forEach(el => revealObserverRef.observe(el));
}

// ─── CATEGORY CARDS ──────────────────────────────────
document.querySelectorAll(".cat-card").forEach(card => {
  card.addEventListener("click", () => {
    const cat = card.getAttribute("data-cat");
    const section = document.getElementById("products");
    if (section) {
      const navH = navbar ? navbar.offsetHeight : 68;
      window.scrollTo({ top: section.offsetTop - navH - 8, behavior: "smooth" });
    }
    setTimeout(() => filterProducts(cat), 700);
  });
});

// ─── CATEGORY LABEL MAP ──────────────────────────────
function categoryLabel(cat) {
  return { covers:"Mobile Covers", screenguards:"Screen Guards", chargers:"Chargers", earbuds:"Earbuds", skins:"Mobile Skins", batteries:"Batteries" }[cat] || cat;
}

function calcDiscount(price, orig) {
  return Math.round(((orig - price) / orig) * 100);
}

// ─── RENDER PRODUCTS ─────────────────────────────────
function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!products.length) {
    grid.innerHTML = '<p style="color:var(--text2);text-align:center;grid-column:1/-1;padding:48px 0;">No products in this category yet.</p>';
    return;
  }

  products.forEach((p, i) => {
    const disc = calcDiscount(p.price, p.originalPrice);
    const card = document.createElement("div");
    card.className = "product-card reveal";
    card.setAttribute("data-id", p.id);
    card.style.transitionDelay = (i * 55) + "ms";
    card.innerHTML =
      '<div class="product-card-img">' +
        '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" />' +
        (p.badge ? '<span class="product-card-badge">' + p.badge + '</span>' : '') +
      '</div>' +
      '<div class="product-card-body">' +
        '<div class="product-card-cat">' + categoryLabel(p.category) + '</div>' +
        '<div class="product-card-name">' + p.name + '</div>' +
        '<div class="product-card-prices">' +
          '<span class="price-new">&#8377;' + p.price.toLocaleString("en-IN") + '</span>' +
          '<span class="price-old">&#8377;' + p.originalPrice.toLocaleString("en-IN") + '</span>' +
          '<span class="price-off">' + disc + '% off</span>' +
        '</div>' +
        '<button class="product-card-action" data-id="' + p.id + '">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
          ' Quick View' +
        '</button>' +
      '</div>';

    grid.appendChild(card);
    if (revealObserverRef) revealObserverRef.observe(card);
  });

  // Click handlers
  grid.querySelectorAll(".product-card-action").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      openModal(parseInt(btn.getAttribute("data-id")));
    });
  });
  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      openModal(parseInt(card.getAttribute("data-id")));
    });
  });
}

// ─── FILTER PRODUCTS ─────────────────────────────────
function filterProducts(category) {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-filter") === category);
  });
  renderProducts(category === "all" ? allProducts : allProducts.filter(p => p.category === category));
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => filterProducts(btn.getAttribute("data-filter")));
});

// ─── MODAL ───────────────────────────────────────────
const modal      = document.getElementById("productModal");
const modalClose = document.getElementById("modalClose");

function openModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p || !modal) return;

  const set = (elId, val, attr) => {
    const el = document.getElementById(elId);
    if (!el) return;
    if (attr) el[attr] = val; else el.textContent = val;
  };

  set("modalTitle", p.name);
  set("modalCat",   categoryLabel(p.category));
  set("modalDesc",  p.description);
  set("modalPrice", "\u20B9" + p.price.toLocaleString("en-IN"));
  set("modalOrig",  "\u20B9" + p.originalPrice.toLocaleString("en-IN"));
  set("modalDiscount", calcDiscount(p.price, p.originalPrice) + "% off");

  const imgEl = document.getElementById("modalImg");
  if (imgEl) { imgEl.src = p.image; imgEl.alt = p.name; }

  const badgeEl = document.getElementById("modalBadge");
  if (badgeEl) { badgeEl.textContent = p.badge || ""; badgeEl.style.display = p.badge ? "inline-block" : "none"; }

  const waEl = document.getElementById("modalWA");
  if (waEl) {
    const msg = "Hi " + STORE_NAME + "! \uD83D\uDC4B\n\nI want to order:\n*" + p.name + "*\nPrice: \u20B9" + p.price + "\n\nPlease confirm availability.";
    waEl.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

if (modalClose) modalClose.addEventListener("click", closeModal);
if (modal)      modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ─── INIT ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initRevealObserver();
  allProducts = PRODUCTS_DATA;
  renderProducts(allProducts);
});
