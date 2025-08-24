// Simple SPA router
const els = {
  sidebar: document.getElementById("sidebar"),
  burger: document.getElementById("burger"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  views: {
    home: document.getElementById("view-home"),
    learn: document.getElementById("view-learn"),
    notes: document.getElementById("view-notes"),
    reading: document.getElementById("view-reading"),
    settings: document.getElementById("view-settings"),
  },
  prayers: document.getElementById("prayers"),
  todayDate: document.getElementById("todayDate"),
  resetToday: document.getElementById("resetToday"),
  profileName: document.getElementById("profileName"),
  saveName: document.getElementById("saveName"),
  greeting: document.getElementById("greeting"),
  year: document.getElementById("year"),
  // XP
  xpFill: document.getElementById("xpFill"),
  levelLabel: document.getElementById("levelLabel"),
  xpLabel: document.getElementById("xpLabel"),
  // Notes
  notesArea: document.getElementById("notesArea"),
  clearNotes: document.getElementById("clearNotes"),
  // Learn
  quizCard: document.getElementById("quizCard"),
  quizStatus: document.getElementById("quizStatus"),
  newQuestion: document.getElementById("newQuestion"),
  // Reading
  readingMode: document.getElementById("readingMode"),
  loadReading: document.getElementById("loadReading"),
  readingContent: document.getElementById("readingContent"),
  // Settings
  notifyQuran: document.getElementById("notifyQuran"),
  notifyHadith: document.getElementById("notifyHadith"),
  notifyDhikr: document.getElementById("notifyDhikr"),
  notifyTime: document.getElementById("notifyTime"),
  sunnahKey: document.getElementById("sunnahKey"),
  sunnahCollection: document.getElementById("sunnahCollection"),
  saveSettings: document.getElementById("saveSettings"),
  clearAll: document.getElementById("clearAll"),
};

const PRAYERS = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

const LETTERS = [
  { ar: "ا", tr: "alif" },
  { ar: "ب", tr: "ba" },
  { ar: "ت", tr: "ta" },
  { ar: "ث", tr: "tha" },
  { ar: "ج", tr: "jim" },
  { ar: "ح", tr: "ha" },
  { ar: "خ", tr: "kha" },
  { ar: "د", tr: "dal" },
  { ar: "ذ", tr: "dhal" },
  { ar: "ر", tr: "ra" },
  { ar: "ز", tr: "zay" },
  { ar: "س", tr: "sin" },
  { ar: "ش", tr: "shin" },
  { ar: "ص", tr: "sad" },
  { ar: "ض", tr: "dad" },
  { ar: "ط", tr: "ta" },
  { ar: "ظ", tr: "za" },
  { ar: "ع", tr: "ayn" },
  { ar: "غ", tr: "ghayn" },
  { ar: "ف", tr: "fa" },
  { ar: "ق", tr: "qaf" },
  { ar: "ك", tr: "kaf" },
  { ar: "ل", tr: "lam" },
  { ar: "م", tr: "mim" },
  { ar: "ن", tr: "nun" },
  { ar: "ه", tr: "ha" },
  { ar: "و", tr: "waw" },
  { ar: "ي", tr: "ya" },
];

function lsGet(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}
function lsSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function fmtDate(d) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function xpInfo(xp) {
  let level = 1,
    req = 100,
    rem = xp;
  while (rem >= req) {
    rem -= req;
    level++;
    req = Math.round(req * 1.25 + 10);
  }
  return {
    level,
    progress: Math.max(0, Math.min(1, rem / req)),
    nextReq: req,
    remainder: rem,
  };
}

function updateXP(delta) {
  const xp = Math.max(0, (lsGet("xp", 0) + delta) | 0);
  lsSet("xp", xp);
  const { level, progress, nextReq, remainder } = xpInfo(xp);
  els.levelLabel.textContent = `Lvl ${level}`;
  els.xpFill.style.width = `${Math.round(progress * 100)}%`;
  els.xpLabel.textContent = `${remainder} / ${nextReq} XP`;
}

function toast(msg) {
  els.quizStatus.textContent = msg;
  setTimeout(() => {
    els.quizStatus.textContent = "";
  }, 1800);
}

function renderPrayers() {
  const todayKey = new Date().toDateString();
  const state = lsGet("prayers", {});
  if (!state[todayKey])
    state[todayKey] = {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    };
  lsSet("prayers", state);
  els.prayers.innerHTML = "";
  PRAYERS.forEach((p) => {
    const checked = !!state[todayKey][p.key];
    const row = document.createElement("div");
    row.className = "row";
    const left = document.createElement("div");
    left.className = "inline";
    left.innerHTML = `<div class="checkbox ${
      checked ? "checked" : ""
    }" data-p="${p.key}">${checked ? "✓" : ""}</div><div>${p.label}</div>`;
    const right = document.createElement("div");
    right.className = "muted";
    right.textContent = checked ? "Completed" : "Pending";
    row.appendChild(left);
    row.appendChild(right);
    row.addEventListener("click", () => {
      state[todayKey][p.key] = !state[todayKey][p.key];
      lsSet("prayers", state);
      renderPrayers();
      updateXP(state[todayKey][p.key] ? 10 : -10);
    });
    els.prayers.appendChild(row);
  });
  els.todayDate.textContent = fmtDate(new Date());
}

function resetToday() {
  const todayKey = new Date().toDateString();
  const state = lsGet("prayers", {});
  if (state[todayKey]) {
    Object.keys(state[todayKey]).forEach((k) => (state[todayKey][k] = false));
  }
  lsSet("prayers", state);
  renderPrayers();
}

function greet() {
  const name = lsGet("profile_name", "Guest");
  els.greeting.textContent = `Hi, ${name}`;
  els.profileName.value = name;
}

function saveName() {
  const val = els.profileName.value.trim() || "Guest";
  lsSet("profile_name", val);
  greet();
  toast("Saved name");
  updateXP(5);
}

function showTab(id) {
  Object.entries(els.views).forEach(
    ([key, node]) => (node.style.display = key === id ? "" : "none")
  );
  els.tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === id));
  lsSet("last_tab", id);
}

function initNotes() {
  const v = lsGet("notes", "");
  els.notesArea.value = v;
  els.notesArea.addEventListener("input", () => {
    lsSet("notes", els.notesArea.value);
  });
  els.clearNotes.addEventListener("click", () => {
    if (confirm("Clear all notes?")) {
      els.notesArea.value = "";
      lsSet("notes", "");
    }
  });
}

function randomInt(n) {
  return Math.floor(Math.random() * n);
}

function newQuiz() {
  const correct = LETTERS[randomInt(LETTERS.length)];
  const options = new Set([correct.tr]);
  while (options.size < 4) options.add(LETTERS[randomInt(LETTERS.length)].tr);
  const opts = Array.from(options).sort(() => Math.random() - 0.5);
  els.quizCard.innerHTML = `
    <div class="content-card" style="text-align:center">
      <div style="font-size:64px; line-height:1; margin-bottom:8px">${
        correct.ar
      }</div>
      <div class="muted" style="margin-bottom:10px">What is the transliteration?</div>
      <div class="grid">
        ${opts
          .map(
            (o) =>
              `<button class="btn secondary opt" data-ok="${
                o === correct.tr
              }">${o}</button>`
          )
          .join("")}
      </div>
    </div>
  `;
  Array.from(els.quizCard.querySelectorAll(".opt")).forEach((btn) => {
    btn.addEventListener("click", () => {
      const ok = btn.dataset.ok === "true";
      if (ok) {
        btn.classList.remove("secondary");
        btn.classList.add("btn");
        toast("Correct! +5 XP");
        updateXP(5);
      } else {
        btn.style.borderColor = "var(--danger)";
        toast("Try again");
        updateXP(-1);
      }
    });
  });
}

async function ensureNotifications() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }
  return false;
}

function scheduleDaily(kind) {
  // Soft in-tab scheduler; resets on reload. For real background use Push + SW.
  const time = (els.notifyTime.value || "09:00").split(":");
  const h = parseInt(time[0], 10),
    m = parseInt(time[1], 10);
  const label = "sched_" + kind;
  if (window[label]) clearInterval(window[label]);
  const tick = () => {
    const now = new Date();
    const at = new Date();
    at.setHours(h, m, 0, 0);
    if (now >= at) at.setDate(at.getDate() + 1);
    const delay = at - now;
    setTimeout(() => {
      const prefs = lsGet("notify_prefs", {
        quran: false,
        hadith: false,
        dhikr: false,
      });
      if (prefs[kind] && Notification.permission === "granted") {
        const title =
          kind === "quran"
            ? "Daily Verse"
            : kind === "hadith"
            ? "Daily Hadith"
            : "Daily Dhikr";
        const body =
          kind === "dhikr"
            ? lsGet("custom_dhikr", [
                "Subḥānallāh",
                "Alḥamdulillāh",
                "Allāhu akbar",
              ])[0]
            : "Open to read";
        new Notification(title, { body });
      }
    }, delay);
  };
  tick();
  window[label] = setInterval(tick, 12 * 60 * 60 * 1000);
}

function loadPrefs() {
  const p = lsGet("notify_prefs", {
    quran: false,
    hadith: false,
    dhikr: false,
  });
  els.notifyQuran.value = p.quran ? "on" : "off";
  els.notifyHadith.value = p.hadith ? "on" : "off";
  els.notifyDhikr.value = p.dhikr ? "on" : "off";
  els.notifyTime.value = lsGet("notify_time", els.notifyTime.value || "09:00");

  const integ = lsGet("integrations", { sunnahKey: "", sunnahCollection: "" });
  els.sunnahKey.value = integ.sunnahKey || "";
  els.sunnahCollection.value = integ.sunnahCollection || "";
}

function savePrefs() {
  const prefs = {
    quran: els.notifyQuran.value === "on",
    hadith: els.notifyHadith.value === "on",
    dhikr: els.notifyDhikr.value === "on",
  };
  lsSet("notify_prefs", prefs);
  lsSet("notify_time", els.notifyTime.value || "09:00");
  lsSet("integrations", {
    sunnahKey: els.sunnahKey.value.trim(),
    sunnahCollection: els.sunnahCollection.value.trim(),
  });
  ensureNotifications().then((granted) => {
    scheduleDaily("quran");
    scheduleDaily("hadith");
    scheduleDaily("dhikr");
    alert(
      "Settings saved" +
        (granted
          ? " and notifications allowed."
          : " (notification permission not granted).")
    );
  });
}

function factoryReset() {
  if (!confirm("This will clear all local data. Continue?")) return;
  localStorage.clear();
  location.reload();
}

async function fetchQuranRandom() {
  // Try Quran.com v4 random; fallback to alquran.cloud
  try {
    const r = await fetch(
      "https://api.quran.com/api/v4/verses/random?language=en&fields=verse_key,translated_text,text_uthmani"
    );
    if (r.ok) {
      const j = await r.json();
      const v = j.verse;
      return {
        type: "quran",
        title: `Quran • ${v.verse_key}`,
        text: v.translated_text || v.text_uthmani,
      };
    }
  } catch {}
  try {
    const r2 = await fetch("https://api.alquran.cloud/v1/ayah/random");
    const j2 = await r2.json();
    const d = j2.data;
    return {
      type: "quran",
      title: `Quran • ${d.surah.englishName} ${d.numberInSurah}:${d.number}`,
      text: d.text,
    };
  } catch {}
  return {
    type: "quran",
    title: "Quran (offline example)",
    text: "In the name of Allah, the Most Gracious, the Most Merciful.",
  };
}

async function fetchHadithRandom() {
  const integ = lsGet("integrations", {
    sunnahKey: "",
    sunnahCollection: "bukhari",
  });
  if (integ.sunnahKey) {
    // Attempt sunnah.com random-ish by grabbing a page and picking random item (API specifics may vary).
    try {
      const collection = integ.sunnahCollection || "bukhari";
      // Example endpoint for the first book as a sample (adjust as desired)
      const r = await fetch(
        `https://api.sunnah.com/v1/collections/${collection}/books/1/hadiths`,
        {
          headers: { "X-API-Key": integ.sunnahKey },
        }
      );
      if (r.ok) {
        const j = await r.json();
        const items = j.hadiths || j.data || [];
        if (items.length) {
          const sample = items[Math.floor(Math.random() * items.length)];
          const text = (
            sample.hadith[0]?.body ||
            sample.hadithArabic ||
            sample.arabic ||
            sample.text ||
            "Hadith text"
          ).replace(/<[^>]+>/g, "");
          return { type: "hadith", title: `Hadith • ${collection}`, text };
        }
      }
    } catch {}
  }
  // Fallback example text if no key or fetch fails
  return {
    type: "hadith",
    title: "Hadith (example)",
    text: "Actions are judged by intentions, and everyone will be rewarded according to what they intended.",
  };
}

function renderDhikrList() {
  const list = lsGet("custom_dhikr", [
    "Subḥānallāh",
    "Alḥamdulillāh",
    "Allāhu akbar",
  ]);
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="row" style="border-bottom:none; padding-bottom:0">
      <input id="newDhikr" placeholder="Add new dhikr (press Enter)" />
    </div>
    <div id="dhikrList"></div>
  `;
  const listWrap = wrap.querySelector("#dhikrList");
  list.forEach((t, idx) => {
    const row = document.createElement("div");
    row.className = "row";
    const left = document.createElement("div");
    left.textContent = t;
    const del = document.createElement("button");
    del.className = "btn ghost";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      const updated = lsGet("custom_dhikr", []);
      updated.splice(idx, 1);
      lsSet("custom_dhikr", updated);
      renderReading();
    });
    row.appendChild(left);
    row.appendChild(del);
    listWrap.appendChild(row);
  });
  wrap.querySelector("#newDhikr").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = e.target.value.trim();
      if (!val) return;
      const updated = lsGet("custom_dhikr", []);
      updated.push(val);
      lsSet("custom_dhikr", updated);
      renderReading();
    }
  });
  return wrap;
}

async function renderReading() {
  els.readingContent.innerHTML = "";
  const mode = els.readingMode.value;
  if (mode === "quran") {
    const v = await fetchQuranRandom();
    const card = document.createElement("div");
    card.className = "content-card";
    card.innerHTML = `<div class="section-title" style="margin-top:0">${v.title}</div><div>${v.text}</div>`;
    els.readingContent.appendChild(card);
  } else if (mode === "hadith") {
    const h = await fetchHadithRandom();
    const card = document.createElement("div");
    card.className = "content-card";
    card.innerHTML = `<div class="section-title" style="margin-top:0">${h.title}</div><div>${h.text}</div>`;
    els.readingContent.appendChild(card);
  } else {
    els.readingContent.appendChild(renderDhikrList());
  }
}

function initRouter() {
  const last = lsGet("last_tab", "home");
  showTab(last);
  els.tabs.forEach((t) =>
    t.addEventListener("click", () => {
      showTab(t.dataset.tab);
      els.sidebar.classList.remove("open");
    })
  );
}

function initUI() {
  els.burger.addEventListener("click", () =>
    els.sidebar.classList.toggle("open")
  );
  els.saveName.addEventListener("click", saveName);
  els.resetToday.addEventListener("click", resetToday);
  els.newQuestion.addEventListener("click", newQuiz);
  els.loadReading.addEventListener("click", renderReading);
  els.saveSettings.addEventListener("click", savePrefs);
  els.clearAll.addEventListener("click", factoryReset);
  window.addEventListener("click", (e) => {
    if (
      els.sidebar.classList.contains("open") &&
      !e.target.closest(".sidebar") &&
      !e.target.closest("#burger")
    ) {
      els.sidebar.classList.remove("open");
    }
  });
}

function initPWA() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }
}

function init() {
  // Greetings & year
  greet();
  els.year.textContent = new Date().getFullYear();
  els.todayDate.textContent = fmtDate(new Date());
  // XP
  updateXP(0);
  // UI
  initUI();
  // Tabs
  initRouter();
  // Notes
  initNotes();
  // Prayers
  renderPrayers();
  // Quiz
  newQuiz();
  // Settings
  loadPrefs();
  // Reading default
  renderReading();
  // Notifications
  ensureNotifications().then((granted) => {
    if (granted) {
      scheduleDaily("quran");
      scheduleDaily("hadith");
      scheduleDaily("dhikr");
    }
  });
  // PWA
  initPWA();
}

document.addEventListener("DOMContentLoaded", init);
