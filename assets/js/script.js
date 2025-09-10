import { db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const adImage = document.getElementById("adImage");
const adVideo = document.getElementById("adVideo");

const adsRef = ref(db, "ads");
let ads = [];
let index = 0;

onValue(adsRef, (snapshot) => {
  ads = [];
  snapshot.forEach((child) => {
    ads.push(child.val());
  });
  index = 0;
  if (ads.length > 0) showAd();
});

function showAd() {
  if (ads.length === 0) return;

  const ad = ads[index];
  adImage.style.display = "none";
  adVideo.style.display = "none";

  if (ad.type === "image") {
    adImage.src = ad.url;
    adImage.style.display = "block";
    setTimeout(nextAd, 5000);
  } else if (ad.type === "video") {
    adVideo.src = ad.url;
    adVideo.style.display = "block";
    adVideo.onended = nextAd;
  }
}

function nextAd() {
  index = (index + 1) % ads.length;
  showAd();
}
