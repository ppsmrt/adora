// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// ✅ Your Firebase configuration (from Firebase Console > Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyCrGIB_YK33p_2EPTpU-klZ_3xQ5TOPm4c",
  authDomain: "adora-ad.firebaseapp.com",
  databaseURL: "https://adora-ad-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "adora-ad",
  storageBucket: "adora-ad.appspot.com", // ✅ fixed
  messagingSenderId: "550034277527",
  appId: "1:550034277527:web:966b16ce942a161e8955d2",
  measurementId: "G-QW5Y41EKLR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
