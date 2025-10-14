// --- Мини-приложение "Фигурное катание" ---
const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const tBack = document.getElementById("t_back");
const NAV = [];

function go(view, params = {}) {
  if (NAV.length === 0 || NAV[NAV.length - 1].view !== view)
    NAV.push({ view, params });
  render();
}

function back() {
  NAV.pop();
  render();
}

backBtn.addEventListener("click", back);

function fmtDateRange(a, b) {
  const m = [
    "января","февраля","марта","апреля","мая","июня",
    "июля","августа","сентября","октября","ноября","декабря"
  ];
  const da = new Date(a), db = new Date(b);
  const sameDay = da.toDateString() === db.toDateString();
  if (sameDay) return `${da.getDate()} ${m[da.getMonth()]} ${da.getFullYear()}`;
  if (da.getMonth() === db.getMonth())
    return `${da.getDate()}–${db.getDate()} ${m[db.getMonth()]} ${db.getFullYear()}`;
  if (da.getFullYear() === db.getFullYear())
    return `${da.getDate()} ${m[da.getMonth()]} – ${db.getDate()} ${m[db.getMonth()]} ${db.getFullYear()}`;
  return `${da.getDate()} ${m[da.getMonth()]} ${da.getFullYear()} – ${db.getDate()} ${m[db.getMonth()]} ${db.getFullYear()}`;
}

function normalizeCountry(n) {
  const map = {
    "япония": "japan", "франция": "france", "канада": "canada", "сша": "usa",
    "италия": "italy", "финляндия": "finland", "китай": "china",
    "германия": "germany", "великобритания": "uk", "грузия": "georgia", "россия": "russia"
  };
  return map[n?.toLowerCase()?.trim()] || "";
}

function flagEmoji(code) {
  const map = {
    japan: "🇯🇵", france: "🇫🇷", canada: "🇨🇦", usa: "🇺🇸",
    italy: "🇮🇹", finland: "🇫🇮", china: "🇨🇳", germany: "🇩🇪",
    uk: "🇬🇧", georgia: "🇬🇪", russia: "🇷🇺"
  };
  return map[code] || "";
}
// --- Приветствие ---
function view_intro() {
  backBtn.style.display = "none";
  return `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      height:70vh;
      text-align:center;
      animation:fadeIn 1s;
      gap:28px;
    ">
      <img src="./brand.png" style="width:90px;height:auto;opacity:0.95;">
      <div class="intro-box">Привет! Будем рады тебе помочь</div>
      <div class="intro-team">Команда <b>О!БСУДИМ</b></div>
    </div>
  `;
}

/* --- Мини-плашки --- */
function chips(it) {
  const place = [it.city, it.country].filter(Boolean).join(", ");
  return `
    <div class="subtags" style="margin-top:10px;">
      <span class="subtag">📅 ${fmtDateRange(it.start, it.end)}</span>
      ${place ? `<span class="subtag">📍 ${place}</span>` : ""}
    </div>
  `;
}
function findCurrentEvents() {
  const today = new Date();
  const all = [...(DATA.international || []), ...(DATA.russian || [])];
  return all.filter(ev => {
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    return today >= start && today <= end;
  });
}

function findNextEvent() {
  const today = new Date();
  const all = [...(DATA.international || []), ...(DATA.russian || [])];
  const future = all.filter(ev => new Date(ev.start) > today);
  return future.sort((a, b) => new Date(a.start) - new Date(b.start))[0] || null;
}

function view_menu() {
  backBtn.style.display = "none";
  const currents = findCurrentEvents();
  const next = currents.length === 0 ? findNextEvent() : null;

  let currentBlocks = "";

  if (currents.length > 0) {
    currentBlocks = currents.map(ev => {
      const kind = DATA.international.includes(ev) ? "international" : "russian";
      const idx = DATA[kind].indexOf(ev);
      return `
        <div class="card current clickable" data-kind="${kind}" data-idx="${idx}">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="pulse"></span>
            <div class="title">Сейчас идёт</div>
          </div>
          <div style="font-weight:600;margin:6px 0 4px;color:var(--accent);">${ev.name}</div>
          ${chips(ev)}
        </div>`;
    }).join("");
  } else if (next) {
    const kind = DATA.international.includes(next) ? "international" : "russian";
    const idx = DATA[kind].indexOf(next);
    currentBlocks = `
      <div class="card upcoming clickable" data-kind="${kind}" data-idx="${idx}">
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="pulse upcoming"></span>
          <div class="title">Ближайший старт</div>
        </div>
        <div style="font-weight:600;margin:6px 0 4px;color:var(--accent);">${next.name}</div>
        ${chips(next)}
      </div>`;
  }

  return `
    <div class="grid view fade-in" style="gap:38px;">
      ${currentBlocks}
      <div class="card">
        <div class="title">Календарь соревнований</div>
        <p class="muted" style="margin-bottom:18px;">Выбери раздел и смотри даты, ссылки и составы</p>
        <button class="btn" id="btnCalendar">Открыть</button>
      </div>
      <div class="card">
        <div class="title">Правила</div>
        <p class="muted" style="margin-bottom:18px;">Скоро тут будут правила и полезные материалы</p>
        <button class="btn" disabled>Скоро</button>
      </div>
      <div class="card">
        <div class="title">Мерч</div>
        <p class="muted" style="margin-bottom:18px;">Наши эксклюзивные вещи и настольные игры</p>
        <button class="btn" id="btnMerch">Открыть</button>
      </div>
    </div>`;
}
function view_calendar_select() {
  backBtn.style.display = "inline-flex";
  return `
    <div class="card view fade-in">
      <div class="title">Календарь соревнований</div>
      <div class="grid" style="margin-top:24px;gap:32px;">
        <div class="card clickable" id="btnRus" style="padding:22px 16px;">
          <div class="title">🇷🇺 Российские старты</div>
          <p class="muted">Календарь ФФККР и всероссийские турниры</p>
        </div>
        <div class="card clickable" id="btnIntl" style="padding:22px 16px;">
          <div class="title">🌍 Зарубежные старты</div>
          <p class="muted">ISU — Гран-при, чемпионаты, Олимпиада</p>
        </div>
      </div>
    </div>`;
}

function listView(items, kind) {
  return `
    <div class="event-grid fade-in">
      ${items
        .sort((a,b)=>new Date(a.start)-new Date(b.start))
        .map((it,i)=>{
          const flag = normalizeCountry(it.country);
          const flagEmojiHTML = flagEmoji(flag);
          return `
            <div class="event-card clickable" data-kind="${kind}" data-idx="${i}">
              <div class="flag-bg">${flagEmojiHTML}</div>
              <div class="event-title"><strong>${it.name}</strong></div>
              ${chips(it)}
            </div>`;
        })
        .join("")}
    </div>`;
}

function view_merch() {
  backBtn.style.display = "inline-flex";
  return `
    <div class="card view fade-in" style="padding:32px 20px;text-align:center;">
      <div style="
        background:var(--card-bg);
        border-radius:18px;
        padding:40px 20px;
        box-shadow:0 4px 14px rgba(130,17,48,0.1);
        border:1px solid var(--border);
      ">
        <div style="
          font-family:'Unbounded',sans-serif;
          font-weight:700;
          font-size:22px;
          line-height:1.4;
          color:var(--accent);
          margin-bottom:24px;
        ">
          Настольная игра<br>
          <span style="font-weight:800;">ПРО!КАТ ЖИЗНИ</span>
        </div>
        <a href="https://t.me/obsudiim_fk/15054" target="_blank"
           style="display:inline-block;background:#8A1538;color:#fff;
                  text-decoration:none;font-family:'Unbounded',sans-serif;
                  font-weight:700;padding:14px 26px;border-radius:12px;transition:0.3s;">
           Перейти к игре
        </a>
      </div>
    </div>`;
}
// --- Детали соревнования ---
function columnList(title, arr) {
  if (!arr?.length) return "";
  return `<div class="card">
    <div class="title category">${title}</div>
    <ul style="margin:8px 0 0 16px; padding:0;">
      ${arr.map(n => `<li style="margin:6px 0">${n}</li>`).join("")}
    </ul>
  </div>`;
}

function view_event_details(kind, idx) {
  const items = kind === "international" ? DATA.international : DATA.russian;
  const it = items[idx];
  if (!it) return `<div class="card"><div class="title">Ошибка загрузки события</div></div>`;
  const p = it.participants || { men: [], women: [], pairs: [], dance: [] };
  backBtn.style.display = "inline-flex";
  return `<div class="card view fade-in" style="border-top:4px solid var(--accent);">
    <div class="title" style="margin-bottom:12px;">${it.name}</div>
    ${chips(it)}
    <div class="grid" style="margin-top:28px;gap:36px;">
      ${columnList("Мужчины", p.men)}
      ${columnList("Женщины", p.women)}
      ${columnList("Пары", p.pairs)}
      ${columnList("Танцы на льду", p.dance)}
    </div>
  </div>`;
}

// --- Рендер и навигация ---
function render() {
  const top = NAV.at(-1) || { view: "intro" };
  let html = "";

  if (top.view === "intro") html = view_intro();
  if (top.view === "menu") html = view_menu();
  if (top.view === "calendar_select") html = view_calendar_select();
  if (top.view === "calendar_list") {
    const kind = top.params.kind;
    const items = kind === "international" ? DATA.international : DATA.russian;
    html = `<div class="card view fade-in" style="padding-bottom:24px;">
      <div class="title" style="margin-bottom:18px;">
        ${kind === "international" ? "Зарубежные старты" : "Российские старты"}
      </div>
      ${listView(items, kind)}
    </div>`;
  }
  if (top.view === "event_details") html = view_event_details(top.params.kind, top.params.idx);
  if (top.view === "merch") html = view_merch();

  app.innerHTML = html;

  // --- Обработчики ---
  if (top.view === "menu") {
    document.getElementById("btnCalendar")?.addEventListener("click", () => go("calendar_select"));
    document.getElementById("btnMerch")?.addEventListener("click", () => go("merch"));
    document.querySelectorAll(".card.clickable").forEach(c =>
      c.addEventListener("click", () => {
        const kind = c.dataset.kind;
        const idx = +c.dataset.idx;
        go("event_details", { kind, idx });
      })
    );
  }

  if (top.view === "calendar_select") {
    document.getElementById("btnRus")?.addEventListener("click", () => go("calendar_list", { kind: "russian" }));
    document.getElementById("btnIntl")?.addEventListener("click", () => go("calendar_list", { kind: "international" }));
  }

  if (top.view === "calendar_list")
    document.querySelectorAll(".event-card").forEach(e =>
      e.addEventListener("click", () =>
        go("event_details", { kind: e.dataset.kind, idx: +e.dataset.idx })
      )
    );

  backBtn.style.display = NAV.length > 1 ? "inline-flex" : "none";
  tBack.textContent = "←";
}
// --- Пульсирующий кружок ---
const stylePulse = document.createElement("style");
stylePulse.textContent = `
.pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
  margin-top: 1px;
  animation: glow 1.4s ease-in-out infinite;
}
@keyframes glow {
  0% { box-shadow: 0 0 0 rgba(138,21,56,0); opacity: 0.7; }
  50% { box-shadow: 0 0 10px rgba(138,21,56,0.6); opacity: 1; }
  100% { box-shadow: 0 0 0 rgba(138,21,56,0); opacity: 0.7; }
}
[data-theme="light"] .pulse { background: #8A1538; }
[data-theme="dark"] .pulse { background: #fff; }
[data-theme="light"] .pulse.upcoming { background: #bfbfbf; }
[data-theme="dark"] .pulse.upcoming { background: #888; }
.fade-in { animation: fadeIn .8s ease-in-out; }
@keyframes fadeIn { from {opacity:0; transform:translateY(10px);} to {opacity:1; transform:translateY(0);} }
`;
document.head.appendChild(stylePulse);

// --- Загрузка и запуск ---
async function load() {
  try {
    const r = await fetch("calendar.json", { cache: "no-store" });
    window.DATA = await r.json();
  } catch {
    window.DATA = { international: [], russian: [] };
  }
}

(async () => {
  await load();
  go("intro");
  render();
  setTimeout(() => { go("menu"); }, 2000);
})();
