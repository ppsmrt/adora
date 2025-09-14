import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyCrGIB_YK33p_2EPTpU-klZ_3xQ5TOPm4c",
  authDomain: "adora-ad.firebaseapp.com",
  databaseURL: "https://adora-ad-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "adora-ad",
  storageBucket: "adora-ad.appspot.com",
  messagingSenderId: "550034277527",
  appId: "1:550034277527:web:966b16ce942a161e8955d2",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- Firebase refs ---
const floorsRef = ref(db, "blocks/A/floors");
const adsRef = ref(db, "ads");
const announcementsRef = ref(db, "announcements");

// --- DOM elements ---
const tenantIntro = document.getElementById("tenantIntro");
const adView = document.getElementById("adView");
const directoryView = document.getElementById("directoryView");
const announcementView = document.getElementById("announcementView");

// --- Helper ---
function ordinal(n){ const s=["th","st","nd","rd"], v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }

let tenantsSequence = [], adsSequence = [], announcementsSequence = [];
let index = 0;

// --- Fetch tenants ---
onValue(floorsRef, snapshot => {
    const data = snapshot.val();
    tenantsSequence = [];
    Object.keys(data).forEach(floor => {
        const tenantsObj = data[floor].tenants;
        if (tenantsObj) Object.keys(tenantsObj).forEach(key => {
            tenantsSequence.push({
                name: tenantsObj[key].name,
                logo: tenantsObj[key].logo,
                floor: ordinal(Number(floor)),
                description: tenantsObj[key].description || "Welcome.",
                core: tenantsObj[key].core || "N/A",
                contact: tenantsObj[key].contact || "N/A",
                email: tenantsObj[key].email || "N/A",
                theme: tenantsObj[key].theme || "#0f1117,#1a1c25"
            });
        });
    });
    startLoop();
});

// --- Fetch ads & announcements ---
onValue(adsRef, snapshot => { adsSequence = snapshot.val() ? Object.values(snapshot.val()) : []; });
onValue(announcementsRef, snapshot => { announcementsSequence = snapshot.val() ? Object.values(snapshot.val()) : []; });

// --- Main Loop ---
function startLoop(){ showNextTenant(); }

function showCard(content, type="tenant", duration=9000){
    tenantIntro.style.display="none";
    adView.style.display="none";
    announcementView.style.display="none";

    const container = type==="tenant"? tenantIntro : type==="ad"? adView : announcementView;
    container.style.display="flex";
    container.innerHTML="";

    const card = document.createElement("div");
    card.className="card";
    if(type==="tenant") card.style.background=`linear-gradient(135deg,${content.theme})`;

    // --- Media (image/video) ---
    if(content.url && content.url.match(/\.(mp4|webm|ogg)$/i)){
        const video = document.createElement("video");
        video.src = content.url;
        video.autoplay = true; video.loop = true; video.muted = true;
        video.className = "media";
        card.appendChild(video);
    } else if(content.logo || content.image || content.url){
        const img = document.createElement("img");
        img.src = content.logo || content.image || content.url;
        img.className = "media";
        card.appendChild(img);
    }

    // --- Tenant details ---
    if(type==="tenant"){
        const header = document.createElement("div");
        header.className="header";
        header.innerHTML = `<img src="${content.logo}" alt="logo"/><div class="name">${content.name}</div>`;
        card.appendChild(header);

        const details = document.createElement("div");
        details.className="details";
        details.innerHTML = `
            <h2>About ${content.name}</h2>
            <p><strong>Description:</strong> ${content.description}</p>
            <p><strong>Floor:</strong> ${content.floor} Floor</p>
            <p><strong>Core:</strong> ${content.core}</p>
            <p><strong>Contact:</strong> ${content.contact}</p>
            <p><strong>Email:</strong> ${content.email}</p>
        `;
        card.appendChild(details);
    }

    container.appendChild(card);

    setTimeout(()=>{
        card.classList.add("fade-out");
        setTimeout(()=>{
            if(type==="tenant") index++;
            nextStep();
        },800);
    },duration);
}

function nextStep(){
    if(index < tenantsSequence.length){
        if(index>0 && index%10===0 && adsSequence.length>0){
            const ad = adsSequence[Math.floor(Math.random()*adsSequence.length)];
            showCard(ad,"ad",9000);
        } else showCard(tenantsSequence[index],"tenant",9000);
    } else showDirectory();
}

function showDirectory(){
    tenantIntro.style.display="none"; adView.style.display="none"; announcementView.style.display="none";
    directoryView.style.display="flex";
    directoryView.innerHTML="";

    const container = document.createElement("div");
    container.className="directory-container";

    const title = document.createElement("div");
    title.className="directory-title"; title.textContent="Tenant Directory";
    container.appendChild(title);

    tenantsSequence.forEach((tenant)=>{
        const floorSection = document.createElement("div");
        floorSection.className="floor-section";

        const floorNum = document.createElement("div");
        floorNum.className="floor-num"; floorNum.textContent=tenant.floor;

        const logosDiv = document.createElement("div"); logosDiv.className="tenant-logos";
        const img = document.createElement("img"); img.src=tenant.logo; logosDiv.appendChild(img);

        floorSection.appendChild(floorNum);
        floorSection.appendChild(logosDiv);
        container.appendChild(floorSection);
    });

    directoryView.appendChild(container);

    setTimeout(()=>{ directoryView.style.display="none"; showAnnouncements(); },10000);
}

function showAnnouncements(){
    let i=0;
    function nextAnn(){
        if(i>=announcementsSequence.length){ index=0; startLoop(); return; }
        showCard(announcementsSequence[i],"announcement",60000);
        i++;
    }
    nextAnn();
    let annInterval = setInterval(nextAnn,60000);
    setTimeout(()=>clearInterval(annInterval), announcementsSequence.length*60000);
}

// --- Animated Corporate Background ---
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
let shapes = [];

function initShapes(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    shapes = [];
    for(let i=0;i<50;i++){
        shapes.push({
            x:Math.random()*canvas.width,
            y:Math.random()*canvas.height,
            size:Math.random()*30+10,
            dx:(Math.random()-0.5)*0.5,
            dy:(Math.random()-0.5)*0.5,
            angle:Math.random()*360
        });
    }
}

function animateShapes(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    shapes.forEach(s=>{
        ctx.save();
        ctx.translate(s.x,s.y);
        ctx.rotate(s.angle*Math.PI/180);
        ctx.strokeStyle = "rgba(0,195,255,0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-s.size/2,-s.size/2,s.size,s.size);
        ctx.restore();

        s.x += s.dx; s.y += s.dy; s.angle += 0.3;
        if(s.x<0||s.x>canvas.width) s.dx*=-1;
        if(s.y<0||s.y>canvas.height) s.dy*=-1;
    });
    requestAnimationFrame(animateShapes);
}

window.addEventListener("resize",()=>{ initShapes(); });
initShapes(); animateShapes();
