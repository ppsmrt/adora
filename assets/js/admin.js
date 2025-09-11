// admin.js
import { auth, db, storage } from "./assets/js/auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref as dbRef, push, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// HTML elements
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const adList = document.getElementById("adList");

// 1️⃣ Monitor auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Not logged in → redirect to login page
    alert("Please login first!");
    window.location.href = "/signin"; // adjust your login page URL
    return;
  }

  try {
    // 2️⃣ Check user role in Realtime Database
    const userRef = dbRef(db, "users/" + user.uid);
    const snapshot = await get(userRef);
    const userData = snapshot.val();

    if (!userData || userData.role !== "superadmin") {
      alert("Access denied! You are not an admin.");
      window.location.href = "/"; // redirect non-admin users
      return;
    }

    console.log("Admin verified:", userData.email);

    // 3️⃣ Display all ads
    const adsRef = dbRef(db, "ads");
    onValue(adsRef, (snapshot) => {
      adList.innerHTML = "";
      snapshot.forEach((child) => {
        const ad = child.val();
        const li = document.createElement("li");
        if (ad.type === "image") {
          li.innerHTML = `<img src="${ad.url}" width="100" style="margin:5px">`;
        } else if (ad.type === "video") {
          li.innerHTML = `<video src="${ad.url}" width="150" controls style="margin:5px"></video>`;
        }
        adList.appendChild(li);
      });
    });

    // 4️⃣ Handle ad uploads
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const file = fileInput.files[0];
      if (!file) return alert("Please select a file to upload.");

      const type = file.type.startsWith("image") ? "image" : "video";
      const path = `ads/${Date.now()}_${file.name}`;
      const fileRef = storageRef(storage, path);

      try {
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        const newAdRef = push(dbRef(db, "ads"));
        await set(newAdRef, { type, url, createdAt: Date.now() });

        alert("Ad uploaded successfully!");
        fileInput.value = "";
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Upload failed: " + err.message);
      }
    });

  } catch (err) {
    console.error("Error verifying admin:", err);
    alert("Error verifying admin: " + err.message);
  }
});