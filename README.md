# ☕ Brew & Bites — Cafe Ordering App

A full mobile-first cafe ordering experience with a real-time waiter dashboard.

---

## 📂 Files

| File | Description |
|------|-------------|
| `index.html` | Customer ordering app (Splash → Menu → Cart → Order) |
| `dashboard.html` | Waiter dashboard with live orders |
| `styles.css` | All styles (shared by both pages) |
| `app.js` | Customer app logic |
| `dashboard.js` | Dashboard logic |
| `firebase-config.js` | Firebase credentials (**fill this in!**) |
| `images/` | Food photos |

---

## 🚀 Quick Start (Without Firebase)

Just open `index.html` in a browser — it works fully without Firebase.  
The dashboard (`dashboard.html`) also loads with demo orders in offline mode.

---

## 🔥 Firebase Setup (for real-time orders)

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **Add project** → name it `brew-and-bites`
3. Click **Add app** → choose **Web** (`</>` icon)
4. Copy the `firebaseConfig` object shown
5. Open `firebase-config.js` and replace the placeholder values
6. In Firebase Console → **Build** → **Realtime Database** → **Create database**
   - Choose your region → **Start in test mode**
7. Done! Orders from customers flow live to the waiter dashboard.

### Realtime Database Rules (for production)
```json
{
  "rules": {
    "orders": {
      ".read": true,
      ".write": true
    }
  }
}
```

---

## 📱 Customer App Flow

```
Splash (2.5s) → Home/Menu → Cart → Order Form → Order Confirmed
```

- Pass table number via URL: `index.html?table=5`
- Cart persists during session
- Firebase order saved on "Place Order"

## 🖥️ Waiter Dashboard

- Open `dashboard.html` in a browser tab (keep it open at the counter)
- Real-time updates — no refresh needed
- Click **Mark as Complete** to move orders to done section
- Stats update live: pending count, completed, revenue

---

## 🎨 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Dark Brown | `#382417` | Headers, buttons, top bar |
| Medium Brown | `#6D3C1C` | Cards, section backgrounds |
| Honey Amber | `#C57938` | Accents, prices, CTAs |
| Vanilla Cream | `#E7C196` | Page background, light cards |
