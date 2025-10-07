// ======== app.js ========

// Ссылки на DOM
const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const langRu = document.getElementById("langRu");
const langEn = document.getElementById("langEn");

// Глобал
let currentView = "menu";
let calendarData = null;

// ======== РЕНДЕРЫ ========

// Главное меню
function showMainMenu() {
  currentView = "menu";
  if (backBtn) backBtn.style.display = "none";

  app.innerHTML = `
    <div class="card" style="text-align:center;">
      <h2>Главное меню</h2>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
        <button class="btn" id="calendarButton">📅 Календарь соревнований</button>
        <button class="btn" id="rulesButton">📖 Правила</button>
      </div>
    </div>
  `;

  document.getElementById("calendarButton").addEventListener("click", showCalendar);
  document.getElementById("rulesButton").addEventListener("click", showRules);
}

// Правила
function showRules() {
  currentView = "rules";
  if (backBtn) backBtn.style.display = "inline-flex";

  app.innerHTML = `
    <div class="card view">
      <h2>Правила соревнований</h2>
      <p>Здесь будут основные правила и регламенты соревнований по фигурному катанию.</p>
      <p>Позже можно добавить ссылки на документы ISU и ФФКР.</p>
    </div>
  `;
}

// Календарь
async function showCalendar() {
  currentView = "calendar";
  if (backBtn) backBtn.style.display = "inline-flex";

  // Загружаем календарь 1 раз
  if (!calendarData) {
    try {
      const res = await fetch("./calendar.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      calendarData = await res.json();
    } catch (e) {
      app.innerHTML = `
        <div class="card view">
          <h2>Календарь соревнований</h2>
          <p>Не удалось загрузить <code>calendar.json</code> 😔</p>
          <p class="muted" style="margin-top:8px">
            Подсказка: если открываешь <code>index.html</code> как файл (scheme <code>file://</code>), 
            браузер блокирует <code>fetch</code>. Запусти через локальный сервер, например:
          </p>
          <pre class="card" style="text-align:left; overflow:auto; font-size:12px; padding:12px; margin-top:8px">
npx serve
# или
python3 -m http.server 5500
          </pre>
        </div>`;
      console.error("Ошибка загрузки calendar.json:", e);
      return;
    }
  }

  // Рендер международных + российских
  const intl = calendarData.international || [];
  const rus = calendarData.russian || [];

  let html = `<div class="view"><h2>Календарь соревнований</h2>`;

  if (intl.length > 0) {
    html += `<h3 style="margin-top:12px;">🌍 Международные</h3><div class="list">`;
    intl.forEach(ev => {
      const tag = ev.type || "";
      const tagClass = tag === "GP" ? "is-gp" : tag === "GPF" ? "is-gpf" : tag === "CS" ? "is-cs" : "";
      const dateStr = (ev.start && ev.end) ? `${ev.start} — ${ev.end}` : "";
      html += `
        <div class="event ${tagClass}">
          <div class="title">${ev.name || "Без названия"}</div>
          <div class="emeta">${[ev.city, ev.country].filter(Boolean).join(", ")}</div>
          <div class="emeta">${dateStr}</div>
          <div class="subtags"><span class="subtag">${tag || "—"}</span></div>
        </div>`;
    });
    html += `</div>`;
  }

  if (rus.length > 0) {
    html += `<h3 style="margin-top:16px;">🇷🇺 Российские</h3><div class="list">`;
    rus.forEach(ev => {
      const dateStr = (ev.start && ev.end) ? `${ev.start} — ${ev.end}` : "";
      html += `
        <div class="event is-rus">
          <div class="title">${ev.name || "Без названия"}</div>
          <div class="emeta">${ev.city || ""}</div>
          <div class="emeta">${dateStr}</div>
          <div class="subtags"><span class="subtag">RUS</span></div>
        </div>`;
    });
    html += `</div>`;
  }

  // Если вообще нет событий
  if (intl.length === 0 && rus.length === 0) {
    html += `<div class="card" style="margin-top:12px">Событий пока нет.</div>`;
  }

  html += `</div>`;
  app.innerHTML = html;
}

// ======== Навигация ========
if (backBtn) {
  backBtn.addEventListener("click", () => {
    if (currentView !== "menu") showMainMenu();
  });
}

// Языковые кнопки пока-заглушки (чтобы не падали)
if (langRu) langRu.addEventListener("click", () => {
  langRu.classList.add("active");
  langEn.classList.remove("active");
  alert("Русский интерфейс активен 😊");
});
if (langEn) langEn.addEventListener("click", () => {
  langEn.classList.add("active");
  langRu.classList.remove("active");
  alert("English interface (UI) — можно добавить, если нужно 🇬🇧");
});

// ======== Запуск ========
document.addEventListener("DOMContentLoaded", showMainMenu);
