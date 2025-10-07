let currentView = "menu";
let calendarData = null;

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");

// ===== стартовый экран =====
document.addEventListener("DOMContentLoaded", () => {
  // скрываем сплэш через 2c и показываем меню
  setTimeout(() => {
    const splash = document.querySelector(".splash");
    if (splash) splash.remove();
    showMainMenu();
  }, 2000);
});

// ===== главное меню =====
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

// ===== правила =====
function showRules() {
  currentView = "rules";
  backBtn.style.display = "inline-flex";
  app.innerHTML = `
    <div class="card view">
      <h2>Правила соревнований</h2>
      <p>Здесь будут основные правила и регламенты соревнований по фигурному катанию.</p>
      <p class="muted">Позже можно добавить ссылки на документы ISU и ФФКР.</p>
    </div>
  `;
}

// ===== утилиты =====
function classByType(t) {
  if (!t) return "";
  return t === "GP" ? "is-gp" :
         t === "GPF" ? "is-gpf" :
         t === "CS" ? "is-cs" :
         t === "RUS" ? "is-rus" : "";
}

function safeJoin(arr, sep=", ") {
  return (arr || []).filter(Boolean).join(sep);
}

// строим HTML вкладок участников
function buildParticipantsHTML(participants = {}) {
  const groups = [
    { key: "men", label: "Мужчины" },
    { key: "women", label: "Женщины" },
    { key: "pairs", label: "Пары" },
    { key: "dance", label: "Танцы" },
  ];
  const counts = {};
  groups.forEach(g => counts[g.key] = (participants[g.key] || []).length);

  // вкладки
  const tabs = groups.map(g => {
    const c = counts[g.key] || 0;
    return `<button class="tab" data-tab="${g.key}">${g.label} (${c})</button>`;
  }).join("");

  // список по умолчанию (men или первая с данными)
  let defaultKey = groups.find(g => counts[g.key] > 0)?.key || "men";
  const list = (participants[defaultKey] || []).map(n => `<li>${n}</li>`).join("") || `<li class="muted">Нет данных</li>`;

  return `
    <div class="details">
      <div class="tabs">${tabs}</div>
      <ul class="plist" data-current="${defaultKey}">${list}</ul>
    </div>
  `;
}

// навешиваем обработчики на вкладки для одной карточки
function attachTabsHandlers(detailsEl, participants = {}) {
  const tabs = detailsEl.querySelectorAll(".tab");
  const list = detailsEl.querySelector(".plist");

  function activate(tabKey) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tabKey));
    const arr = participants[tabKey] || [];
    list.dataset.current = tabKey;
    list.innerHTML = arr.length ? arr.map(n => `<li>${n}</li>`).join("") : `<li class="muted">Нет данных</li>`;
  }

  // первый активный
  const first = Array.from(tabs).find(t => (participants[t.dataset.tab] || []).length > 0) || tabs[0];
  activate(first.dataset.tab);

 
