import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getDatabase, ref, set, push, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCrGIB_YK33p_2EPTpU-klZ_3xQ5TOPm4c",
    authDomain: "adora-ad.firebaseapp.com",
    databaseURL: "https://adora-ad-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "adora-ad"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const toast = document.getElementById('toast');
  function showToast(msg) {
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const blockEl = document.getElementById("block");
    const floorEl = document.getElementById("floor");
    const tenantList = document.getElementById("tenantList");
    const nameEl = document.getElementById("name");
    const logoEl = document.getElementById("logoUrl");
    const coreEl = document.getElementById("core");
    const descEl = document.getElementById("description");
    const contactEl = document.getElementById("contact");
    const emailEl = document.getElementById("email");
    const addForm = document.getElementById("addForm");
    const cancelEditBtn = document.getElementById("cancelEdit");
    let editTenantId = null;

    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const block = blockEl.value;
      const floor = floorEl.value;
      const name = nameEl.value;
      const logo = logoEl.value;
      const core = coreEl.value;
      const description = descEl.value;
      const contact = contactEl.value;
      const email = emailEl.value;
      if (!block || !floor || !name) return showToast("Fill at least block, floor, and name");
      const tenantData = { name, logo, core, description, contact, email };
      try {
        if (editTenantId) {
          await set(ref(db, `blocks/${block}/floors/${floor}/tenants/${editTenantId}`), tenantData);
          editTenantId = null;
          cancelEditBtn.classList.add("hidden");
          showToast("Tenant updated!");
        } else {
          const tenantRef = push(ref(db, `blocks/${block}/floors/${floor}/tenants`));
          await set(tenantRef, tenantData);
          showToast("Tenant added!");
        }
        addForm.reset();
      } catch (err) { showToast("Error: " + err.message); }
    });

    cancelEditBtn.addEventListener("click", () => {
      editTenantId = null;
      addForm.reset();
      cancelEditBtn.classList.add("hidden");
    });

    function watchTenants() {
      const block = blockEl.value;
      const floor = floorEl.value;
      if (!block || !floor) {
        tenantList.innerHTML = "<p class='text-gray-400 text-center'>Select block and floor to view tenants.</p>";
        return;
      }
      const tenantsRef = ref(db, `blocks/${block}/floors/${floor}/tenants`);
      onValue(tenantsRef, (snapshot) => {
        const data = snapshot.val();
        tenantList.innerHTML = "";
        if (!data) {
          tenantList.innerHTML = "<p class='text-gray-400 text-center'>No tenants found.</p>";
          return;
        }
        Object.keys(data).forEach(tid => {
          const t = data[tid];
          const item = document.createElement("div");
          item.className = "flex items-center justify-between bg-white p-4 rounded-lg shadow-md card-hover";

          const left = document.createElement("div");
          left.className = "flex items-center gap-4";
          if (t.logo) {
            const logo = document.createElement("img");
            logo.src = t.logo;
            logo.className = "h-12 w-12 rounded";
            left.appendChild(logo);
          }
          const info = document.createElement("div");
          info.innerHTML = `<span class="font-bold text-lg text-gray-800">${t.name}</span><br><span class="text-sm text-gray-500">Floor: ${floor}</span>`;
          left.appendChild(info);
          item.appendChild(left);

          const right = document.createElement("div");
          right.className = "flex gap-2";
          const editBtn = document.createElement("button");
          editBtn.textContent = "Edit";
          editBtn.className = "bg-yellow-400 px-4 py-1 rounded hover:bg-yellow-500 text-sm";
          editBtn.onclick = () => {
            editTenantId = tid;
            nameEl.value = t.name;
            logoEl.value = t.logo || "";
            coreEl.value = t.core || "";
            descEl.value = t.description || "";
            contactEl.value = t.contact || "";
            emailEl.value = t.email || "";
            cancelEditBtn.classList.remove("hidden");
          };
          right.appendChild(editBtn);

          const delBtn = document.createElement("button");
          delBtn.textContent = "Delete";
          delBtn.className = "bg-red-600 px-4 py-1 rounded hover:bg-red-700 text-sm";
          delBtn.onclick = async () => {
            if (confirm(`Delete tenant ${t.name}?`)) {
              await remove(ref(db, `blocks/${block}/floors/${floor}/tenants/${tid}`));
              showToast("Tenant deleted!");
            }
          };
          right.appendChild(delBtn);

          item.appendChild(right);
          tenantList.appendChild(item);
        });
      });
    }
    blockEl.addEventListener("change", watchTenants);
    floorEl.addEventListener("input", watchTenants);

    // Announcements
    const announcementForm = document.getElementById("announcementForm");
    const announcementUrl = document.getElementById("announcementUrl");
    const announcementList = document.getElementById("announcementList");
    announcementForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!announcementUrl.value) return showToast("Enter announcement URL");
      const newRef = push(ref(db, "announcements"));
      await set(newRef, { url: announcementUrl.value });
      announcementForm.reset();
      showToast("Announcement added!");
    });
    onValue(ref(db, "announcements"), (snap) => {
      const data = snap.val();
      announcementList.innerHTML = "";
      if (!data) return;
      Object.keys(data).forEach((id) => {
        const item = document.createElement("div");
        item.className = "flex items-center justify-between bg-white p-4 rounded-lg shadow-md card-hover";
        item.innerHTML = `<span class="truncate w-2/3 text-gray-800">${data[id].url}</span>`;
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "bg-red-600 px-4 py-1 rounded hover:bg-red-700 text-sm";
        delBtn.onclick = () => { remove(ref(db, "announcements/" + id)); showToast("Announcement deleted!"); };
        item.appendChild(delBtn);
        announcementList.appendChild(item);
      });
    });

    // Ads
    const adsForm = document.getElementById("adsForm");
    const adsUrl = document.getElementById("adsUrl");
    const adsList = document.getElementById("adsList");
    adsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!adsUrl.value) return showToast("Enter ad URL");
      const newRef = push(ref(db, "ads"));
      await set(newRef, { url: adsUrl.value });
      adsForm.reset();
      showToast("Ad added!");
    });
    onValue(ref(db, "ads"), (snap) => {
      const data = snap.val();
      adsList.innerHTML = "";
      if (!data) return;
      Object.keys(data).forEach((id) => {
        const item = document.createElement("div");
        item.className = "flex items-center justify-between bg-white p-4 rounded-lg shadow-md card-hover";
        item.innerHTML = `<span class="truncate w-2/3 text-gray-800">${data[id].url}</span>`;
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "bg-red-600 px-4 py-1 rounded hover:bg-red-700 text-sm";
        delBtn.onclick = () => { remove(ref(db, "ads/" + id)); showToast("Ad deleted!"); };
        item.appendChild(delBtn);
        adsList.appendChild(item);
      });
    });

  });
