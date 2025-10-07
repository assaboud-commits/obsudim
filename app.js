let currentView = "menu";
let calendarData = null;
let currentLang = "ru";

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");

// ====== переключение языка ======
const langRu = document.getElementById("langRu");
const langEn = document.getElementById("langEn");

langRu.addEventListener("click", () => { currentLang = "ru"; updateLangButtons(); showMainMenu(); });
langEn.addEventListener("click", () => { currentLang = "en"; updateLangButtons(); showMainMenu(); });

function updateLangButtons() {
  langRu.classList.toggle("active", currentLang === "ru");
  langEn.classList.toggle("active", currentLang === "en");
}

// ====== утилита имени ======
function getName(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  return currentLang === "ru" ? (item.ru || item.en) : (item.en || item.ru);
}

// ====== главное меню ======
function showMainMenu() {
  currentView = "menu";
  backBtn.style.display = "none";
  app.innerHTML = `
    <div class="card" style="text-align:center;">
      <h2>${currentLang === "ru" ? "Главное меню" : "Main Menu"}</h2>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
        <button class="btn" id="calendarButton">📅 ${currentLang === "ru" ? "Календарь соревнований" : "Competition Calendar"}</button>
        <button class="btn" id="rulesButton">📖 ${currentLang === "ru" ? "Правила" : "Rules"}</button>
      </div>
    </div>
  `;
  document.getElementById("calendarButton").addEventListener("click", showCalendar);
  document.getElementById("rulesButton").addEventListener("click", showRules);
}

// ====== страница правил ======
function showRules() {
  currentView = "rules";
  backBtn.style.display = "inline-flex";
  app.innerHTML = `
    <div class="card view">
      <h2>${currentLang === "ru" ? "Правила соревнований" : "Competition Rules"}</h2>
      <p>${currentLang === "ru" ? "Основные правила и регламенты соревнований по фигурному катанию." : "Main figure skating competition regulations."}</p>
    </div>
  `;
}

// ====== календарь ======
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

  let html = `<div class="view"><h2>${currentLang === "ru" ? "Календарь соревнований" : "Competition Calendar"}</h2>`;
  const intl = calendarData.international || [];
  const rus = calendarData.russian || [];

  // Международные
  if (intl.length > 0) {
    html += `<h3>🌍 ${currentLang === "ru" ? "Международные" : "International"}</h3><div class="list">`;
    intl.forEach(ev => {
      const tag = ev.type || "";
      const tagClass = tag === "GP" ? "is-gp" : tag === "GPF" ? "is-gpf" : tag === "CS" ? "is-cs" : "";
      const name = currentLang === "ru" ? (ev.name_ru || ev.name) : (ev.name_en || ev.name);
      const city = currentLang === "ru" ? (ev.city_ru || ev.city) : (ev.city_en || ev.city);
      const country = currentLang === "ru" ? (ev.country_ru || ev.country) : (ev.country_en || ev.country);
      html += `
        <div class="event ${tagClass}">
          <div class="title">${name}</div>
          <div class="emeta">${city}, ${country}</div>
          <div class="emeta">${ev.start} — ${ev.end}</div>
          <div class="subtags"><span class="subtag">${tag || "—"}</span></div>
        </div>`;
    });
    html += `</div>`;
  }

  // Российские
  if (rus.length > 0) {
    html += `<h3>🇷🇺 ${currentLang === "ru" ? "Российские старты" : "Russian Competitions"}</h3><div class="list">`;
    rus.forEach(ev => {
      const name = currentLang === "ru" ? ev.name_ru : ev.name_en;
      const city = currentLang === "ru" ? ev.city_ru : ev.city_en;
      html += `
        <div class="event is-rus">
          <div class="title">${name}</div>
          <div class="emeta">${city}</div>
          <div class="emeta">${ev.start} — ${ev.end}</div>
          <div class="subtags"><span class="subtag">RUS</span></div>
        </div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  app.innerHTML = html;
}

// ====== кнопка Назад ======
backBtn.addEventListener("click", () => {
  if (currentView !== "menu") showMainMenu();
});

// ====== запуск ======
document.addEventListener("DOMContentLoaded", showMainMenu);
