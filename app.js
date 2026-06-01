// ============================================================
//  BREW & BITES — Customer App Logic (app.js)
//  Firebase Firestore: writes orders to "orders" collection
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase Config (replace with your own keys) ──────────────
const firebaseConfig = {
  apiKey: "AIzaSyAfoJ-RGRbmZXmCMg79SffMlvS_-KoqaN0",
  authDomain: "cafe-app-dd509.firebaseapp.com",
  databaseURL: "https://cafe-app-dd509-default-rtdb.firebaseio.com",
  projectId: "cafe-app-dd509",
  storageBucket: "cafe-app-dd509.firebasestorage.app",
  messagingSenderId: "112187356043",
  appId: "1:112187356043:web:ce8195eb9a437a71ad758e",
  measurementId: "G-7KLXT5LCQ0"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ── Banner Carousel Data ────────────────────────────────────────────
const BANNERS = [
  {
    img: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
    tag: "☕ Cafe Special",
    title: "Welcome to<br/>Brew &amp; Bites",
    sub: "Fresh brews, happy vibes",
    overlay: "linear-gradient(135deg,rgba(46,21,3,0.85) 0%,rgba(46,21,3,0.35) 100%)"
  },
  {
    img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80",
    tag: "🧊 Today's Offer",
    title: "20% Off<br/>Cold Coffee",
    sub: "Valid today only · Limited time",
    overlay: "linear-gradient(135deg,rgba(10,40,80,0.85) 0%,rgba(10,40,80,0.3) 100%)"
  },
  {
    img: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    tag: "🍫 New Arrival",
    title: "Chocolate<br/>Lava Cake",
    sub: "Hot, gooey &amp; irresistible",
    overlay: "linear-gradient(135deg,rgba(60,20,10,0.85) 0%,rgba(60,20,10,0.3) 100%)"
  },
  {
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    tag: "⏰ Happy Hours",
    title: "Buy 1 Get 1<br/>3 PM – 6 PM",
    sub: "All coffees &middot; Every day",
    overlay: "linear-gradient(135deg,rgba(30,15,60,0.85) 0%,rgba(30,15,60,0.3) 100%)"
  },
  {
    img: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=800&q=80",
    tag: "🥪 Fresh Daily",
    title: "Sandwiches<br/>&amp; Wraps",
    sub: "Made fresh every morning",
    overlay: "linear-gradient(135deg,rgba(10,45,20,0.85) 0%,rgba(10,45,20,0.3) 100%)"
  }
];

// ── Menu Data ──────────────────────────────────────────────────
const MENU = [
  // Coffee
  {
    id: 1, name: "Cappuccino", category: "Coffee",
    desc: "Velvety espresso, steamed milk, and cocoa dust.",
    price: 180, popular: true,
    img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&q=80"
  },
  {
    id: 2, name: "Latte", category: "Coffee",
    desc: "Smooth espresso with soft microfoam.",
    price: 190, popular: true,
    img: "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=300&q=80"
  },
  {
    id: 3, name: "Espresso", category: "Coffee",
    desc: "A bold, rich single shot with a golden crema.",
    price: 120, popular: false,
    img: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300&q=80"
  },
  {
    id: 4, name: "Americano", category: "Coffee",
    desc: "Espresso mellowed with hot water.",
    price: 150, popular: false,
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80"
  },
  {
    id: 5, name: "Flat White", category: "Coffee",
    desc: "Velvety microfoam over a double ristretto.",
    price: 200, popular: false,
    img: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=300&q=80"
  },
  // Cold Drinks
  {
    id: 6, name: "Cold Coffee", category: "Cold Drinks",
    desc: "Chilled coffee blended creamy and light.",
    price: 160, popular: true,
    img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80"
  },
  {
    id: 7, name: "Frappe", category: "Cold Drinks",
    desc: "Ice-blended coffee with a silky whipped crown.",
    price: 200, popular: true,
    img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=80"
  },
  {
    id: 8, name: "Iced Mocha", category: "Cold Drinks",
    desc: "Cold espresso, chocolate, milk, and ice.",
    price: 210, popular: false,
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80"
  },
  {
    id: 9, name: "Cold Brew", category: "Cold Drinks",
    desc: "Slow-steeped 12hr cold brew, smooth & bold.",
    price: 180, popular: false,
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80"
  },
  // Food
  {
    id: 10, name: "Veg Sandwich", category: "Food",
    desc: "Grilled veggies with cheese in toasted bread.",
    price: 140, popular: false,
    img: "https://plus.unsplash.com/premium_photo-1738849384078-590f9060a80c?q=80&w=782&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: 11, name: "Chicken Club", category: "Food",
    desc: "Grilled chicken, lettuce, tomato, and mayo.",
    price: 220, popular: true,
    img: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=300&q=80"
  },
  {
    id: 12, name: "Bruschetta", category: "Food",
    desc: "Toasted baguette with tomato, basil, olive oil.",
    price: 160, popular: false,
    img: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300&q=80"
  },
  {
    id: 13, name: "Pasta Arrabiata", category: "Food",
    desc: "Penne in spicy tomato sauce with garlic.",
    price: 250, popular: false,
    img: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=300&q=80"
  },
  // Desserts
  {
    id: 14, name: "Chocolate Cake", category: "Desserts",
    desc: "Rich dark chocolate layered cake.",
    price: 180, popular: true,
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80"
  },
  {
    id: 15, name: "Tiramisu", category: "Desserts",
    desc: "Classic Italian dessert with mascarpone & espresso.",
    price: 200, popular: false,
    img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&q=80"
  },
  {
    id: 16, name: "Cheesecake", category: "Desserts",
    desc: "New York style with berry compote.",
    price: 190, popular: false,
    img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&q=80"
  },
  {
    id: 17, name: "Brownie", category: "Desserts",
    desc: "Warm fudgy brownie with vanilla ice cream.",
    price: 160, popular: false,
    img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80"
  }
];

const CATEGORIES = ["All", "Coffee", "Cold Drinks", "Food", "Desserts"];

// ── State ──────────────────────────────────────────────────────
let cart = {};           // { itemId: quantity }
let tableNo = "";
let activeCategory = "All";
let lastOrderData = null;

// ── Init ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Get table from URL ?table=4
  const params = new URLSearchParams(window.location.search);
  tableNo = params.get("table") || "";

  const tableLabel = document.getElementById("table-label");
  if (tableNo) {
    tableLabel.textContent = `🪑 Table ${tableNo}`;
  } else {
    tableLabel.textContent = "🪑 Scan QR at your table";
  }

  // Pre-fill table input
  const tableInput = document.getElementById("table-no-input");
  if (tableInput && tableNo) tableInput.value = tableNo;

  renderCategories();
  renderFeatured();
  renderMenu("All");
  initCarousel();  // start the 5-banner slideshow

  // ── Hide splash screen after menu is rendered ──
  const splash = document.getElementById("splash-screen");
  if (splash) {
    // Minimum 1.5s so splash feels intentional, not a flash
    setTimeout(() => {
      splash.classList.add("fade-out");
      // Remove from DOM after transition ends
      setTimeout(() => splash.remove(), 650);
    }, 1500);
  }
});

// ── Banner Carousel ────────────────────────────────────────────
let carouselIndex = 0;
let carouselTimer = null;

function initCarousel() {
  const track = document.getElementById("banner-track");
  const dotsEl = document.getElementById("banner-dots");
  if (!track || !dotsEl) return;

  // Build slides
  track.innerHTML = BANNERS.map((b, i) => `
    <div class="banner-slide">
      <img src="${b.img}" alt="${b.tag}" loading="${i === 0 ? 'eager' : 'lazy'}" />
      <div class="hero-overlay" style="background:${b.overlay}">
        <span class="hero-tag">${b.tag}</span>
        <div class="hero-title">${b.title}</div>
        <div class="hero-sub">${b.sub}</div>
      </div>
    </div>`).join("");

  // Build dots
  dotsEl.innerHTML = BANNERS.map((_, i) =>
    `<button class="banner-dot ${i === 0 ? 'active' : ''}" onclick="goToBanner(${i})" aria-label="Banner ${i+1}"></button>`
  ).join("");

  // Auto-advance every 3.5s
  startCarouselTimer();

  // Pause on hover
  const carousel = document.getElementById("banner-carousel");
  if (carousel) {
    carousel.addEventListener("mouseenter", () => clearInterval(carouselTimer));
    carousel.addEventListener("mouseleave", startCarouselTimer);
  }
}

function goToBanner(index) {
  carouselIndex = index;
  const track = document.getElementById("banner-track");
  if (track) track.style.transform = `translateX(-${carouselIndex * 100}%)`;
  document.querySelectorAll(".banner-dot").forEach((d, i) =>
    d.classList.toggle("active", i === carouselIndex)
  );
}

window.goToBanner = goToBanner;

function startCarouselTimer() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    carouselIndex = (carouselIndex + 1) % BANNERS.length;
    goToBanner(carouselIndex);
  }, 3500);
}

// ── Screen Navigation ──────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(id);
  target.classList.add("active");
  target.scrollTop = 0;
  window.scrollTo(0, 0);
}

window.goToCheckout = function () {
  if (cartTotal() === 0) {
    showToast("Add items to your order first!");
    return;
  }
  renderCheckoutSummary();
  showScreen("screen-checkout");
  // Hide cart bar so it doesn't cover the Place Order button
  document.getElementById("cart-bar").classList.add("hide");
};

window.goBack = function () {
  showScreen("screen-menu");
  updateCartUI(); // restore cart bar visibility if items exist
};

window.orderMore = function () {
  cart = {};
  updateCartUI();
  renderFeatured();
  renderMenu(activeCategory);
  showScreen("screen-menu");
};

// ── Categories ────────────────────────────────────────────────
function renderCategories() {
  const container = document.getElementById("category-tabs");
  container.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `pill ${cat === activeCategory ? "pill-active" : "pill-inactive"}`;
    btn.textContent = cat;
    btn.setAttribute("aria-label", `Filter by ${cat}`);
    btn.onclick = () => {
      activeCategory = cat;
      renderCategories();
      renderMenu(cat);
    };
    container.appendChild(btn);
  });
}

// ── Featured Row ───────────────────────────────────────────────
function buildFeaturedCardHTML(item) {
  const qty = cart[item.id] || 0;
  const controlHTML = qty === 0
    ? `<button class="add-btn-sm" onclick="addToCart(${item.id})" aria-label="Add ${item.name}">+</button>`
    : `<div class="qty-control-sm">
         <button class="qty-btn-sm" onclick="removeFromCart(${item.id})">−</button>
         <span class="qty-num-sm">${qty}</span>
         <button class="qty-btn-sm" onclick="addToCart(${item.id})">+</button>
       </div>`;
  return `
    <div class="featured-card">
      <img src="${item.img}" alt="${item.name}" loading="lazy" />
      <div class="featured-card-body">
        <div class="featured-card-name">${item.name}</div>
        <div class="featured-card-bottom">
          <span class="featured-card-price">₹${item.price}</span>
          <div id="fctrl-${item.id}">${controlHTML}</div>
        </div>
      </div>
    </div>`;
}

function renderFeatured() {
  const container = document.getElementById("featured-row");
  const featured = MENU.filter(i => i.popular);
  container.innerHTML = featured.map(item => buildFeaturedCardHTML(item)).join("");
}

function refreshFeaturedControl(id) {
  const el = document.getElementById(`fctrl-${id}`);
  if (!el) return;
  const item = MENU.find(i => i.id === id);
  const qty = cart[id] || 0;
  if (qty === 0) {
    el.innerHTML = `<button class="add-btn-sm" onclick="addToCart(${id})" aria-label="Add ${item.name}">+</button>`;
  } else {
    el.innerHTML = `
      <div class="qty-control-sm">
        <button class="qty-btn-sm" onclick="removeFromCart(${id})">−</button>
        <span class="qty-num-sm">${qty}</span>
        <button class="qty-btn-sm" onclick="addToCart(${id})">+</button>
      </div>`;
  }
}

// ── Menu List ─────────────────────────────────────────────────
function renderMenu(category) {
  const container = document.getElementById("menu-list");
  const items = category === "All" ? MENU : MENU.filter(i => i.category === category);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🍽️</div>
        <div class="empty-state-text">No items in this category</div>
      </div>`;
    return;
  }

  container.innerHTML = items.map(item => buildMenuItemHTML(item)).join("");
}

function buildMenuItemHTML(item) {
  const qty = cart[item.id] || 0;
  const controlHTML = qty === 0
    ? `<button class="add-btn" onclick="addToCart(${item.id})" aria-label="Add ${item.name}">+</button>`
    : `<div class="qty-control">
         <button class="qty-btn" onclick="removeFromCart(${item.id})" aria-label="Remove one">−</button>
         <span class="qty-num">${qty}</span>
         <button class="qty-btn" onclick="addToCart(${item.id})" aria-label="Add one more">+</button>
       </div>`;

  return `
    <div class="menu-item" id="menu-item-${item.id}">
      <img class="menu-item-img" src="${item.img}" alt="${item.name}" loading="lazy" />
      <div class="menu-item-info">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-desc">${item.desc}</div>
        <div class="menu-item-price">₹${item.price}</div>
      </div>
      <div id="ctrl-${item.id}">${controlHTML}</div>
    </div>`;
}

// ── Cart Logic ─────────────────────────────────────────────────
window.addToCart = function (id) {
  cart[id] = (cart[id] || 0) + 1;
  refreshItemControl(id);
  refreshFeaturedControl(id);
  updateCartUI();
  showToast(`Added to cart ✓`);
};

window.removeFromCart = function (id) {
  if (!cart[id]) return;
  cart[id]--;
  if (cart[id] === 0) delete cart[id];
  refreshItemControl(id);
  refreshFeaturedControl(id);
  updateCartUI();
};

function refreshItemControl(id) {
  const el = document.getElementById(`ctrl-${id}`);
  if (!el) return;
  const item = MENU.find(i => i.id === id);
  const qty = cart[id] || 0;
  if (qty === 0) {
    el.innerHTML = `<button class="add-btn" onclick="addToCart(${id})" aria-label="Add ${item.name}">+</button>`;
  } else {
    el.innerHTML = `
      <div class="qty-control">
        <button class="qty-btn" onclick="removeFromCart(${id})" aria-label="Remove one">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" onclick="addToCart(${id})" aria-label="Add one more">+</button>
      </div>`;
  }
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MENU.find(i => i.id === Number(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);
}

function cartCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function updateCartUI() {
  const count = cartCount();
  const total = cartTotal();
  const cartBar = document.getElementById("cart-bar");
  const cartText = document.getElementById("cart-bar-text");
  const headerBadge = document.getElementById("header-cart-count");

  if (count > 0) {
    cartBar.classList.remove("hide");
    cartText.textContent = `${count} item${count > 1 ? "s" : ""}`;
    headerBadge.textContent = count;
    headerBadge.classList.remove("hidden");
  } else {
    cartBar.classList.add("hide");
    headerBadge.classList.add("hidden");
  }
}

// ── Checkout Summary ──────────────────────────────────────────
function renderCheckoutSummary() {
  const listEl = document.getElementById("checkout-items-list");
  const totalEl = document.getElementById("checkout-total");

  const rows = Object.entries(cart).map(([id, qty]) => {
    const item = MENU.find(i => i.id === Number(id));
    return `
      <div class="summary-row">
        <span class="summary-item-name">${qty}x ${item.name}</span>
        <span class="summary-item-price">₹${item.price * qty}</span>
      </div>`;
  }).join("");

  listEl.innerHTML = rows;
  totalEl.textContent = `₹${cartTotal()}`;
}

// ── Place Order (Firebase) ────────────────────────────────────
window.placeOrder = async function () {
  const nameEl = document.getElementById("customer-name");
  const tableEl = document.getElementById("table-no-input");
  const noteEl = document.getElementById("chef-note");
  const btn = document.getElementById("place-order-btn");

  const customerName = nameEl.value.trim();
  const table = tableEl.value.trim();
  const note = noteEl.value.trim();

  if (!customerName) { showToast("Please enter your name"); nameEl.focus(); return; }
  if (!table) { showToast("Please enter your table number"); tableEl.focus(); return; }
  if (cartTotal() === 0) { showToast("Your cart is empty"); return; }

  // Build items array
  const items = Object.entries(cart).map(([id, qty]) => {
    const item = MENU.find(i => i.id === Number(id));
    return { name: item.name, qty, price: item.price, total: item.price * qty };
  });

  const orderData = {
    customerName,
    tableNo: table,
    note,
    items,
    total: cartTotal(),
    status: "pending",
    createdAt: serverTimestamp()
  };

  btn.disabled = true;
  btn.querySelector("span").textContent = "Placing Order...";

  try {
    await addDoc(collection(db, "orders"), orderData);
    lastOrderData = { ...orderData, items, tableNo: table };
    showConfirmation(lastOrderData);
  } catch (err) {
    console.error("Firebase error:", err);
    // Fallback: show confirmation anyway for demo mode
    lastOrderData = orderData;
    showConfirmation(lastOrderData);
    showToast("Note: Connect Firebase to sync with dashboard");
  } finally {
    btn.disabled = false;
    btn.querySelector("span").textContent = "Place Order";
  }
};

function showConfirmation(orderData) {
  const summaryEl = document.getElementById("confirmed-summary");
  const itemsHTML = orderData.items.map(item => `
    <div class="confirmed-row">
      <span class="confirmed-label">${item.qty}x ${item.name}</span>
      <span class="confirmed-value accent">₹${item.total}</span>
    </div>`).join("");

  summaryEl.innerHTML = `
    <div class="confirmed-row">
      <span class="confirmed-label" style="font-size:18px;font-weight:700;color:#fff">Table ${orderData.tableNo}</span>
      <span class="confirmed-value" style="color:#C8956C">~15 minutes</span>
    </div>
    <hr class="confirmed-divider" />
    ${itemsHTML}
    <hr class="confirmed-divider" />
    <div class="confirmed-row">
      <span class="confirmed-total-label">Total</span>
      <span class="confirmed-total-value">₹${orderData.total}</span>
    </div>`;

  showScreen("screen-confirmed");
  cart = {};
  updateCartUI();
  renderFeatured();           // Reset featured cards back to "+" buttons
  renderMenu(activeCategory); // Reset all menu items back to "+" buttons
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
