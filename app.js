let currentLang = "ru";
let calendarData = null;
let currentPage = "home";

document.addEventListener("DOMContentLoaded", async () => {
  await loadCalendar();
  setupLanguageToggle();
  setupNavigation();
  renderHome();
});

async function loadCalendar() {
  try {
    const response = await fetch("calendar.json");
    calendarData = await response.json();
  } catch (error) {
    console.error("Ошибка загрузки календаря:", error);
  }
}

function setupLanguageToggle() {
  const langToggle = document.getElementById("langToggle");
  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "ru" ? "en" : "ru";
    langToggle.textContent = currentLang === "ru" ? "EN" : "RU";
    if (currentPage === "home") renderHome();
    else if (currentPage === "calendar") renderCalendar();
  });
}

function setupNavigation() {
  document.getElementById("btnHome").addEventListener("click", renderHome);
  document.getElementById("btnCalendar").addEventListener("click", () =>
    renderCalendar("international")
  );
  document.getElementById("btnRussian").addEventListener("click", () =>
    renderCalendar("russian")
  );
}

function renderHome() {
  currentPage = "home";
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="home">
      <img src="brand.png" class="brand" alt="logo" />
      <h1>${currentLang === "ru" ? "Фигурное катание" : "Figure Skating"}</h1>
      <p>${currentLang === "ru" ? "Выберите раздел" : "Choose a section"}</p>
    </div>
  `;
}

function renderCalendar(type = "international") {
  currentPage = "calendar";
  const app = document.getElementById("app");
  if (!calendarData) {
    app.innerHTML = `<p>Ошибка загрузки данных</p>`;
    return;
  }

  const events = calendarData[type];
  if (!events) {
    app.innerHTML = `<p>Нет данных</p>`;
    return;
  }

  const title =
    type === "international"
      ? currentLang === "ru"
        ? "Международные соревнования"
        : "International Competitions"
      : currentLang === "ru"
      ? "Российские соревнования"
      : "Russian Competitions";

  app.innerHTML = `
    <div class="calendar">
      <h2>${title}</h2>
      <div class="events">
        ${events
          .map(
            (ev, i) => `
          <div class="event-card" onclick="view_event_details('${type}', ${i})">
            <h3>${
              currentLang === "ru" ? ev.name_ru || ev.name : ev.name_en || ev.name
            }</h3>
            <p>${
              currentLang === "ru"
                ? `${ev.city_ru || ev.city}, ${ev.country_ru || ev.country}`
                : `${ev.city_en || ev.city}, ${ev.country_en || ev.country}`
            }</p>
            <p>${formatDate(ev.start)} — ${formatDate(ev.end)}</p>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
}

function view_event_details(type, index) {
  const app = document.getElementById("app");
  const ev = calendarData[type][index];

  const backButton = `<button class="back" onclick="renderCalendar('${type}')">${
    currentLang === "ru" ? "Назад" : "Back"
  }</button>`;

  const participants = ev.participants
    ? Object.entries(ev.participants)
        .map(([category, arr]) => {
          if (!arr || arr.length === 0) return "";
          const titleMap = {
            men: currentLang === "ru" ? "Мужчины" : "Men",
            women: currentLang === "ru" ? "Женщины" : "Women",
            pairs: currentLang === "ru" ? "Пары" : "Pairs",
            dance: currentLang === "ru" ? "Танцы на льду" : "Ice Dance",
          };
          return `
          <div class="category">
            <h4>${titleMap[category]}</h4>
            <ul>
              ${arr
                .map(
                  (n) =>
                    `<li>${
                      typeof n === "object"
                        ? n[currentLang] || n.en || ""
                        : n
                    }</li>`
                )
                .join("")}
            </ul>
          </div>`;
        })
        .join("")
    : `<p>${currentLang === "ru" ? "Нет участников" : "No participants"}</p>`;

  app.innerHTML = `
    <div class="event-details">
      ${backButton}
      <h2>${
        currentLang === "ru" ? ev.name_ru || ev.name : ev.name_en || ev.name
      }</h2>
      <p>${
        currentLang === "ru"
          ? `${ev.city_ru || ev.city}, ${ev.country_ru || ev.country}`
          : `${ev.city_en || ev.city}, ${ev.country_en || ev.country}`
      }</p>
      <p>${formatDate(ev.start)} — ${formatDate(ev.end)}</p>
      ${participants}
    </div>
  `;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(currentLang === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "short",
  });
}
