import { auth, db } from "./auth.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Signup
const signupBtn = document.getElementById("signup-btn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const msg = document.getElementById("signup-msg");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      let role = snapshot.exists() ? "user" : "superadmin";

      await set(ref(db, "users/" + uid), {
        email,
        role,
        createdAt: Date.now()
      });

      msg.textContent = `Signed up as ${role}. Redirecting...`;
      msg.className = "text-green-400 text-center";
      msg.classList.remove("hidden");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (err) {
      msg.textContent = "Error: " + err.message;
      msg.className = "text-red-500 text-center";
      msg.classList.remove("hidden");
    }
  });
}

// Login
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const msg = document.getElementById("login-msg");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      msg.textContent = "Login successful. Redirecting...";
      msg.className = "text-green-400 text-center";
      msg.classList.remove("hidden");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (err) {
      msg.textContent = "Error: " + err.message;
      msg.className = "text-red-500 text-center";
      msg.classList.remove("hidden");
    }
  });
}
