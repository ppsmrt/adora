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
    runImageAnimation(adImage);
    setTimeout(nextAd, 5000);
  } else if (ad.type === "video") {
    adVideo.src = ad.url;
    adVideo.style.display = "block";
    adVideo.style.opacity = 1;
    adVideo.onended = nextAd;
  }
}

function nextAd() {
  index = (index + 1) % ads.length;
  showAd();
}

/* Random animations for images */
function runImageAnimation(el) {
  const animations = [
    "fadeIn",
    "zoomIn",
    "slideLeft",
    "slideRight",
    "rotateIn"
  ];
  const randomAnim = animations[Math.floor(Math.random() * animations.length)];
  
  el.className = ""; // reset
  el.style.opacity = 1;
  el.classList.add(randomAnim);

  // Remove animation after it ends
  setTimeout(() => {
    el.classList.remove(randomAnim);
  }, 2000);
}