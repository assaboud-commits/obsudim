const app = document.getElementById('app');
let lang = localStorage.getItem('lang') || 'ru';
const setLang = l => {
  lang = l;
  localStorage.setItem('lang', l);
  renderMenu();
};

/* --- Splash Screen --- */
function renderSplash() {
  app.innerHTML = `
    <div class="splash">
      <img src="./assets/logo.png" class="logo" alt="logo">
      <h1>Привет!</h1>
      <p>Будем рады тебе помочь</p>
      <p><b>Команда О!бсудим</b></p>
    </div>
  `;
  setTimeout(() => renderMenu(), 2000);
}

/* --- Главное меню --- */
function renderMenu() {
  app.innerHTML = `
    <button class="lang-toggle" onclick="toggleLang()">${lang === 'ru' ? '🌐 EN' : '🌐 RU'}</button>
    <div class="menu">
      <img src="./assets/logo.png" class="menu-logo" alt="logo">
      <button class="btn" onclick="renderCalendar()">🗓️ ${lang === 'ru' ? 'Календарь соревнований' : 'Competition Calendar'}</button>
      <button class="btn" disabled>📘 ${lang === 'ru' ? 'Правила (в разработке)' : 'Rules (coming soon)'}</button>
      <p style="margin-top:20px; font-size:14px; color:#555;">v1.0 | 2025–2026</p>
    </div>
  `;
}

function toggleLang() {
  setLang(lang === 'ru' ? 'en' : 'ru');
}

/* --- Календарь --- */
async function renderCalendar() {
  app.innerHTML = `<p>Загрузка...</p>`;
  try {
    const res = await fetch('./data/calendar.json');
    const data = await res.json();
    const list = data.international || [];
    let html = `
      <button class="lang-toggle" onclick="toggleLang()">${lang === 'ru' ? '🌐 EN' : '🌐 RU'}</button>
      <h1>${lang === 'ru' ? 'Международные старты сезона 2025–2026' : 'International Competitions 2025–2026'}</h1>
      <div class="event-list">
        ${list.map(ev => `
          <div class="event-card">
            <div class="event-title">${lang === 'ru' ? ev.name_ru : ev.name_en}</div>
            <div class="event-info">
              ${lang === 'ru' ? ev.city_ru + ', ' + ev.country_ru : ev.city_en + ', ' + ev.country_en}<br>
              ${formatDate(ev.start)} – ${formatDate(ev.end)}<br>
              ${lang === 'ru' ? 'Тип: ' : 'Type: '} ${ev.type || '-'}
            </div>
          </div>
        `).join('')}
      </div>
      <button class="btn" onclick="renderMenu()">${lang === 'ru' ? '⬅ Назад' : '⬅ Back'}</button>
    `;
    app.innerHTML = html;
  } catch (err) {
    app.innerHTML = `<p>Ошибка загрузки данных.</p>`;
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const monthNames = {
    ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
    en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  };
  return `${d.getDate()} ${monthNames[lang][d.getMonth()]} ${d.getFullYear()}`;
}

/* --- Start App --- */
renderSplash();
