// ============================================================
//  🔥 FIREBASE CONFIG — cafe-app-dd509
//  Project: Brew & Bites Cafe Ordering App
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
