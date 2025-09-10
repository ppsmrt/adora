import { db, storage } from "./firebase-config.js";
import { ref as dbRef, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const adList = document.getElementById("adList");

// Display uploaded ads list
const adsRef = dbRef(db, "ads");
onValue(adsRef, (snapshot) => {
  adList.innerHTML = "";
  snapshot.forEach((child) => {
    const ad = child.val();
    const li = document.createElement("li");
    if (ad.type === "image") {
      li.innerHTML = `<img src="${ad.url}" width="100">`;
    } else if (ad.type === "video") {
      li.innerHTML = `<video src="${ad.url}" width="100" controls></video>`;
    }
    adList.appendChild(li);
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;

  const type = file.type.startsWith("image") ? "image" : "video";
  const storagePath = "ads/" + Date.now() + "_" + file.name;
  const fileRef = storageRef(storage, storagePath);

  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  const newAdRef = push(adsRef);
  await set(newAdRef, {
    type,
    url,
    createdAt: Date.now()
  });

  fileInput.value = "";
});
