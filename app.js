// ======== app.js ========

// Глобальные переменные
let currentView = "menu";
let calendarData = null;

// Получаем ссылки на основные элементы
const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const tBack = document.getElementById("t_back");

// ======== Главное меню ========
function showMainMenu() {
  currentView = "menu";
  backBtn.style.display = "none";

  app.innerHTML = `
    <div class="card" style="text-align:center;">
      <h2 style="margin-bottom:16px;">Главное меню</h2>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <button class="btn" id="calendarButton">📅 Календарь соревнований</button>
        <button class="btn" id="rulesButton">📖 Правила</button>
      </div>
    </div>
  `;

  document.getElementById("calendarButton").addEventListener("click", showCalendar);
  document.getElementById("rulesButton").addEventListener("click", showRules);
}

// ======== Правила ========
function showRules() {
  currentView = "rules";
  backBtn.style.display = "inline-flex";

  app.innerHTML = `
    <div class="card view">
      <h2>Правила соревнований</h2>
      <p>
        Здесь будут размещены основные правила и регламенты соревнований по фигурному катанию:
        как начисляются баллы, какие существуют уровни стартов и т.д.
      </p>
      <p>
        Эта секция может быть дополнена ссылками на официальные документы ISU и ФФКР.
      </p>
    </div>
  `;
}

// ======== Календарь ========
async function showCalendar() {
  currentView = "calendar";
  backBtn.style.display = "inline-flex";

  // Если календарь не загружен — загрузим
  if (!calendarData) {
    try {
      const response = await fetch("./calendar.json");
      calendarData = await response.json();
    } catch (err) {
      app.innerHTML = `<div class="card"><p>Ошибка загрузки календаря 😔</p></div>`;
      return;
    }
  }

  // Генерация карточек международных соревнований
  const international = calendarData.international || [];
  const russian = calendarData.russian || [];

  let html = `<div class="view"><h2>Календарь соревнований</h2>`;

  if (international.length > 0) {
    html += `<h3 style="margin-top:12px;">🌍 Международные</h3><div class="list">`;
    international.forEach(event => {
      const tag = event.type || "";
      const tagClass =
        tag === "GP" ? "is-gp" :
        tag === "GPF" ? "is-gpf" :
        tag === "CS" ? "is-cs" :
        tag === "RUS" ? "is-rus" : "";

      html += `
        <div class="event ${tagClass}">
          <div class="title">${event.name}</div>
          <div class="emeta">${event.city}, ${event.country}</div>
          <div class="emeta">${event.start} — ${event.end}</div>
          <div class="subtags">
            <span class="subtag">${event.type || "—"}</span>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (russian.length > 0) {
    html += `<h3 style="margin-top:16px;">🇷🇺 Российские</h3><div class="list">`;
    russian.forEach(event => {
      html += `
        <div class="event is-rus">
          <div class="title">${event.name}</div>
          <div class="emeta">${event.city}</div>
          <div class="emeta">${event.start} — ${event.end}</div>
          <div class="subtags"><span class="subtag">RUS</span></div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  app.innerHTML = html;
}

// ======== Кнопка Назад ========
backBtn.addEventListener("click", () => {
  if (currentView !== "menu") {
    showMainMenu();
  }
});

// ======== Языковая кнопка ========
document.getElementById("langRu").addEventListener("click", () => {
  alert("Русский интерфейс пока активен по умолчанию 😊");
});
document.getElementById("langEn").addEventListener("click", () => {
  alert("English interface coming soon 🇬🇧");
});

// ======== Запуск ========
document.addEventListener("DOMContentLoaded", showMainMenu);
