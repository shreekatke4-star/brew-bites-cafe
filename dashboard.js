// ============================================================
//  BREW & BITES — Owner Dashboard Logic (dashboard.js)
//  Firebase Firestore: real-time listener on "orders" collection
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── Firebase Config (same as app.js — replace with your keys) ──
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

// ── Constants ──────────────────────────────────────────────────
// No password stored here! Firebase Auth handles it securely.

// ── State ──────────────────────────────────────────────────
let allOrders = [];
let bellOn = true;
let prevPendingCount = 0;
let unsubscribeOrders = null;
let firebaseApp, db, auth;
let activeTab = "live";
let audioCtx = null;

// ── Firebase Init ───────────────────────────────────────────────
function initFirebase() {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    db   = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    return true;
  } catch (e) {
    console.error("Firebase init error:", e);
    return false;
  }
}

// ── Auth State Listener (replaces sessionStorage) ─────────────────
document.addEventListener("DOMContentLoaded", () => {
  initFirebase();

  // Listen for auth state — auto-login if session still valid
  onAuthStateChanged(auth, (user) => {
    if (user) {
      showDashboard();
    } else {
      // Show login screen
      document.getElementById("login-screen").style.display  = "flex";
      document.getElementById("dashboard-screen").style.display = "none";
    }
  });

  // Set month label
  const now = new Date();
  document.getElementById("month-label").textContent =
    now.toLocaleString("default", { month: "long", year: "numeric" });
});

// ── Login ─────────────────────────────────────────────────────
window.doLogin = async function () {
  const emailInput = document.getElementById("login-email");
  const passInput  = document.getElementById("login-password");
  const errEl      = document.getElementById("login-error");
  const btn        = document.getElementById("login-btn");

  const email    = emailInput.value.trim();
  const password = passInput.value;

  if (!email || !password) {
    errEl.textContent = "❌ Please enter your email and password.";
    errEl.classList.remove("hidden");
    return;
  }

  btn.textContent = "Signing in...";
  btn.disabled = true;
  errEl.classList.add("hidden");
  initAudio(); // init sound on user click

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will fire and call showDashboard()
  } catch (e) {
    btn.textContent = "Access Dashboard";
    btn.disabled = false;
    errEl.textContent = "❌ Wrong email or password. Try again.";
    errEl.classList.remove("hidden");
    passInput.value = "";
    passInput.focus();
  }
};

// ── Logout ────────────────────────────────────────────────────
window.doLogout = async function () {
  if (unsubscribeOrders) unsubscribeOrders();
  await signOut(auth);
  // onAuthStateChanged will fire and show login screen automatically
  document.getElementById("login-btn").textContent = "Access Dashboard";
  document.getElementById("login-btn").disabled = false;
  document.getElementById("login-password").value = "";
  document.getElementById("login-email").value = "";
};

function showDashboard() {
  document.getElementById("login-screen").style.display  = "none";
  document.getElementById("dashboard-screen").style.display = "block";
  initAudio();
  startRealtimeListener();
  cleanupOldOrders();

  // Set month label
  const now = new Date();
  document.getElementById("month-label").textContent =
    now.toLocaleString("default", { month: "long", year: "numeric" });
}

// ── Monthly Auto-Cleanup (delete orders > 30 days old) ────────────
async function cleanupOldOrders() {
  if (!db) return;
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30); // 30 days ago

    const q = query(
      collection(db, "orders"),
      where("createdAt", "<", cutoff)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    // Delete all orders older than 30 days
    const deletes = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletes);
    console.log(`✅ Auto-cleanup: removed ${snapshot.docs.length} orders older than 30 days`);
  } catch (e) {
    console.log("Cleanup skipped:", e.message);
  }
}

// ── Audio Init (must be called inside a user click) ───────────
function initAudio() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if browser suspended it
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  } catch (e) {
    console.log("Audio init failed:", e);
  }
}

// ── Real-time Listener ────────────────────────────────────────
function startRealtimeListener() {
  if (!db) {
    // Demo mode — show sample data if Firebase not configured
    renderDemoMode();
    return;
  }

  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

  unsubscribeOrders = onSnapshot(q, (snapshot) => {
    allOrders = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date()
    }));

    updateStats();
    renderCurrentTab();
    checkNewOrders();
  }, (err) => {
    console.error("Firestore error:", err);
    renderDemoMode();
  });
}

// ── Stats Calculator ───────────────────────────────────────────
function updateStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let monthlyRevenue = 0;
  let todayRevenue   = 0;
  let pendingValue   = 0;
  let ordersToday    = 0;

  allOrders.forEach(order => {
    const t = order.createdAt instanceof Date ? order.createdAt : new Date();
    const isToday  = t >= todayStart;
    const isMonth  = t >= monthStart;

    if (order.status === "completed") {
      if (isMonth) monthlyRevenue += order.total || 0;
      if (isToday) todayRevenue   += order.total || 0;
    }
    if (order.status === "pending") {
      pendingValue += order.total || 0;
    }
    if (isToday) ordersToday++;
  });

  animateValue("stat-monthly",     monthlyRevenue, true);
  animateValue("stat-today",       todayRevenue,   true);
  animateValue("stat-pending-val", pendingValue,   true);
  animateValue("stat-orders-today", ordersToday,   false);

  // Update pending pill
  const pendingOrders = allOrders.filter(o => o.status === "pending");
  const pendingPill = document.getElementById("pending-pill");
  pendingPill.textContent = `${pendingOrders.length} Pending`;
  if (pendingOrders.length > 0) {
    pendingPill.classList.add("has-orders");
  } else {
    pendingPill.classList.remove("has-orders");
  }
}

function animateValue(elId, target, currency) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = currency ? `₹${target.toLocaleString("en-IN")}` : target.toLocaleString("en-IN");
}

// ── New Order Notification ────────────────────────────────────
function checkNewOrders() {
  const current = allOrders.filter(o => o.status === "pending").length;
  if (current > prevPendingCount && bellOn && prevPendingCount !== -1) {
    playPing();
    showToast(`🔔 New order received!`);
  }
  prevPendingCount = current;
}

// ── Bell Sound via Web Audio API ───────────────────────────────
function playPing() {
  if (!bellOn || !audioCtx) return;
  try {
    // Resume context if browser paused it
    if (audioCtx.state === "suspended") audioCtx.resume();

    // 3-note ascending chime: ding ding ding ✨
    const notes = [
      { freq: 880,  start: 0,    dur: 0.6 },
      { freq: 1100, start: 0.2,  dur: 0.6 },
      { freq: 1320, start: 0.4,  dur: 0.8 }
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = audioCtx.currentTime + start;
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    });
  } catch (e) {
    console.log("Bell sound error:", e);
  }
}

// ── Tab Switching ──────────────────────────────────────────────
window.switchTab = function (tab) {
  activeTab = tab;
  document.getElementById("tab-live").classList.toggle("active", tab === "live");
  document.getElementById("tab-past").classList.toggle("active", tab === "past");
  document.getElementById("panel-live").classList.toggle("hidden", tab !== "live");
  document.getElementById("panel-past").classList.toggle("hidden", tab !== "past");
  renderCurrentTab();
};

function renderCurrentTab() {
  if (activeTab === "live") renderLiveOrders();
  else renderPastOrders();
}

// ── Live Orders ────────────────────────────────────────────────
function renderLiveOrders() {
  const grid = document.getElementById("live-orders-grid");
  const pending = allOrders.filter(o => o.status === "pending");

  if (pending.length === 0) {
    grid.innerHTML = `
      <div class="empty-orders">
        <div class="empty-orders-icon">☕</div>
        <div class="empty-orders-text">All caught up!</div>
        <div class="empty-orders-sub">No pending orders right now</div>
      </div>`;
    return;
  }

  grid.innerHTML = pending.map(order => buildOrderCard(order)).join("");
}

function buildOrderCard(order) {
  const timeStr = formatTime(order.createdAt);
  const itemsHTML = (order.items || []).map(item =>
    `<div class="order-item-row">
       <span>${item.qty}x ${item.name}</span>
       <span class="order-item-price">₹${item.total || item.price * item.qty}</span>
     </div>`
  ).join("");

  const noteHTML = order.note
    ? `<div class="order-note">📋 ${order.note}</div>`
    : "";

  return `
    <div class="order-card status-pending" id="card-${order.id}">
      <div class="order-card-header">
        <div class="order-table-no">Table ${order.tableNo}</div>
        <div class="order-time">${timeStr}</div>
      </div>
      <div class="order-customer-name">${order.customerName || "Guest"}</div>
      <div class="order-items-list">${itemsHTML}</div>
      ${noteHTML}
      <div class="order-footer">
        <div class="order-total">₹${order.total}</div>
        <span class="order-status-badge status-badge-pending">Pending</span>
      </div>
      <div class="order-actions">
        <button class="action-btn btn-complete"
          onclick="markOrder('${order.id}','completed')"
          id="btn-complete-${order.id}">
          Mark Complete
        </button>
        <button class="action-btn btn-cancel"
          onclick="markOrder('${order.id}','cancelled')"
          id="btn-cancel-${order.id}">
          Cancel Order
        </button>
      </div>
    </div>`;
}

// ── Past Orders ────────────────────────────────────────────────
function renderPastOrders() {
  const tbody = document.getElementById("past-orders-body");
  const past = allOrders.filter(o => o.status !== "pending");

  if (past.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-light)">
        No completed or cancelled orders yet
      </td></tr>`;
    return;
  }

  tbody.innerHTML = past.map(order => {
    const statusClass = order.status === "completed"
      ? "status-badge-completed" : "status-badge-cancelled";
    const statusLabel = order.status === "completed" ? "✓ Completed" : "✗ Cancelled";
    const itemsSummary = (order.items || []).map(i => `${i.qty}x ${i.name}`).join(", ");
    return `
      <tr>
        <td><strong>Table ${order.tableNo}</strong></td>
        <td>${order.customerName || "Guest"}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${itemsSummary}</td>
        <td><strong style="color:var(--accent)">₹${order.total}</strong></td>
        <td><span class="order-status-badge ${statusClass}">${statusLabel}</span></td>
        <td style="color:var(--text-light)">${formatTime(order.createdAt)}</td>
      </tr>`;
  }).join("");
}

// ── Mark Order Status ─────────────────────────────────────────
window.markOrder = async function (orderId, newStatus) {
  const completeBtn = document.getElementById(`btn-complete-${orderId}`);
  const cancelBtn   = document.getElementById(`btn-cancel-${orderId}`);

  if (completeBtn) completeBtn.disabled = true;
  if (cancelBtn)   cancelBtn.disabled   = true;

  try {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });

    const label = newStatus === "completed" ? "Order completed ✓" : "Order cancelled";
    showToast(label);

    // Animate card out
    const card = document.getElementById(`card-${orderId}`);
    if (card) {
      card.style.opacity = "0";
      card.style.transform = "scale(0.95)";
      card.style.transition = "all 0.3s ease";
    }
  } catch (err) {
    console.error("Update error:", err);
    showToast("Error updating order — check Firebase connection");
    if (completeBtn) completeBtn.disabled = false;
    if (cancelBtn)   cancelBtn.disabled   = false;
  }
};

// ── Bell Toggle ───────────────────────────────────────────────
window.toggleBell = function () {
  bellOn = !bellOn;
  const btn = document.getElementById("bell-btn");
  btn.textContent = bellOn ? "🔔 Bell On" : "🔕 Bell Off";
  btn.classList.toggle("on", bellOn);
};

// ── Demo Mode (when Firebase not configured) ──────────────────
function renderDemoMode() {
  const demoOrders = [
    {
      id: "demo1",
      tableNo: "3",
      customerName: "Rahul",
      items: [
        { name: "Cappuccino", qty: 2, price: 180, total: 360 },
        { name: "Brownie", qty: 1, price: 160, total: 160 }
      ],
      total: 520,
      note: "Extra hot please",
      status: "pending",
      createdAt: new Date()
    },
    {
      id: "demo2",
      tableNo: "7",
      customerName: "Priya",
      items: [
        { name: "Cold Coffee", qty: 1, price: 160, total: 160 },
        { name: "Veg Sandwich", qty: 1, price: 140, total: 140 }
      ],
      total: 300,
      note: "",
      status: "pending",
      createdAt: new Date(Date.now() - 8 * 60000)
    },
    {
      id: "demo3",
      tableNo: "1",
      customerName: "Amit",
      items: [{ name: "Espresso", qty: 1, price: 120, total: 120 }],
      total: 120,
      note: "",
      status: "completed",
      createdAt: new Date(Date.now() - 30 * 60000)
    }
  ];

  allOrders = demoOrders;
  prevPendingCount = -1; // suppress notification on load

  // Fake some revenue
  document.getElementById("stat-monthly").textContent  = "₹9,960";
  document.getElementById("stat-today").textContent    = "₹3,980";
  document.getElementById("stat-pending-val").textContent = "₹820";
  document.getElementById("stat-orders-today").textContent = "14";
  document.getElementById("pending-pill").textContent  = "2 Pending";
  document.getElementById("pending-pill").classList.add("has-orders");

  renderLiveOrders();
  showToast("⚠️ Demo mode — add Firebase keys to go live", 5000);

  // Override markOrder for demo
  window.markOrder = function (orderId, newStatus) {
    const idx = allOrders.findIndex(o => o.id === orderId);
    if (idx !== -1) allOrders[idx].status = newStatus;
    renderLiveOrders();
    updateStats();
    showToast(newStatus === "completed" ? "Order completed ✓" : "Order cancelled");
  };
}

// ── Helpers ────────────────────────────────────────────────────
function formatTime(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    ", " + d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

let toastTimer;
function showToast(msg, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
}
