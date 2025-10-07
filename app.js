let currentView = "menu";
let calendarData = null;
const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");

// Главное меню
function showMainMenu() {
  currentView = "menu";
  backBtn.style.display = "none";
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
  backBtn.style.display = "inline-flex";
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
  backBtn.style.display = "inline-flex";

  if (!calendarData) {
    try {
      const res = await fetch("./calendar.json");
      calendarData = await res.json();
    } catch (e) {
      app.innerHTML = `<div class="card"><p>Ошибка загрузки календаря 😔</p></div>`;
      return;
    }
  }

  let html = `<div class="view"><h2>Календарь соревнований</h2>`;

  const intl = calendarData.international || [];
  const rus = calendarData.russian || [];

  if (intl.length > 0) {
    html += `<h3>🌍 Международные</h3><div class="list">`;
    intl.forEach(ev => {
      const tag = ev.type || "";
      const tagClass = tag === "GP" ? "is-gp" : tag === "GPF" ? "is-gpf" : tag === "CS" ? "is-cs" : "";
      html += `
        <div class="event ${tagClass}">
          <div class="title">${ev.name}</div>
          <div class="emeta">${ev.city}, ${ev.country}</div>
          <div class="emeta">${ev.start} — ${ev.end}</div>
          <div class="subtags"><span class="subtag">${ev.type || "—"}</span></div>
        </div>`;
    });
    html += `</div>`;
  }

  if (rus.length > 0) {
    html += `<h3>🇷🇺 Российские</h3><div class="list">`;
    rus.forEach(ev => {
      html += `
        <div class="event is-rus">
          <div class="title">${ev.name}</div>
          <div class="emeta">${ev.city}</div>
          <div class="emeta">${ev.start} — ${ev.end}</div>
          <div class="subtags"><span class="subtag">RUS</span></div>
        </div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  app.innerHTML = html;
}

// Назад
backBtn.addEventListener("click", () => {
  if (currentView !== "menu") showMainMenu();
});

// Запуск
document.addEventListener("DOMContentLoaded", showMainMenu);
