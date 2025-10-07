// Mini App v11 — full i18n for events & participants (RU/EN), safe fallbacks
const TG = window.Telegram ? window.Telegram.WebApp : null;
const app = document.getElementById('app');
const backBtn = document.getElementById('backBtn');
const langRu = document.getElementById('langRu');
const langEn = document.getElementById('langEn');
const greetEl = document.getElementById('greet');
const tBack = document.getElementById('t_back');

const NAV = [];
const STATE = { lang: 'ru' };

const I18N = {
  ru: {
    greet: "Привет, надеюсь, мы поможем тебе!)",
    menu_calendar: "Календарь соревнований",
    menu_rules: "Правила",
    soon: "Скоро",
    open_calendar: "Открыть календарь",
    open: "Открыть",
    calendar_select_title: "Календарь — выбери раздел",
    intl: "Зарубежные старты",
    rus: "Российские старты",
    rules_soon: "Скоро тут будут правила и полезные материалы.",
    back: "Назад",
    official: "Официальная страница",
    participants: "Состав участников",
    men: "Мужчины", women: "Женщины", pairs: "Пары", dance: "Танцы на льду",
    date: "Дата",
    place: "Место",
    gp: "Гран-при",
    gpf: "Финал Гран-при",
    cs: "Челленджер",
    worlds: "Чемпионат мира",
    euros: "Чемпионат Европы",
    oly: "Олимпиада",
    noEvents: "Соревнований пока нет",
  },
  en: {
    greet: "Hi, we hope to help you!",
    menu_calendar: "Competition Calendar",
    menu_rules: "Rules",
    soon: "Coming soon",
    open_calendar: "Open Calendar",
    open: "Open",
    calendar_select_title: "Calendar — choose a section",
    intl: "International Events",
    rus: "Russian Events",
    rules_soon: "Rules and useful materials will be here soon.",
    back: "Back",
    official: "Official page",
    participants: "Participants",
    men: "Men", women: "Women", pairs: "Pairs", dance: "Ice Dance",
    date: "Dates",
    place: "Place",
    gp: "Grand Prix",
    gpf: "Grand Prix Final",
    cs: "Challenger",
    worlds: "World Championships",
    euros: "European Championships",
    oly: "Olympics",
    noEvents: "No events yet",
  }
};
function t(key){ return I18N[STATE.lang][key] || key; }

function saveLang(){ try{ localStorage.setItem('lang', STATE.lang); }catch(e){} }
function loadLang(){ try{ const v = localStorage.getItem('lang'); if(v) STATE.lang = v; }catch(e){} }

function setLang(lang){
  STATE.lang = lang;
  langRu.classList.toggle('active', lang==='ru');
  langEn.classList.toggle('active', lang==='en');
  greetEl.textContent = t('greet');
  tBack.textContent = t('back');
  render();
  saveLang();
}

// === helpers for bilingual fields ===
function pick(it, ruKey, enKey, fallbackKey){
  if(STATE.lang==='ru'){
    return (it[ruKey] ?? it[fallbackKey] ?? '').toString();
  } else {
    return (it[enKey] ?? it[fallbackKey] ?? '').toString();
  }
}
function titleOf(it){
  // name_ru/name_en/name
  return pick(it, 'name_ru','name_en','name');
}
function cityOf(it){
  return pick(it, 'city_ru','city_en','city');
}
function countryOf(it){
  return pick(it, 'country_ru','country_en','country');
}
function placeOf(it){
  const c = cityOf(it), k = countryOf(it);
  return [c,k].filter(Boolean).join(', ');
}
function nameLowerForClassify(it){
  const s = (it.name_en || it.name_ru || it.name || '').toString();
  return s.toLowerCase();
}

// Participants: array can contain strings or {ru,en}
function mapNames(arr){
  if(!Array.isArray(arr)) return [];
  return arr.map(v=>{
    if(typeof v==='string') return v;
    if(v && typeof v==='object'){
      if(STATE.lang==='ru') return v.ru || v.name_ru || v.name || v.en || '';
      return v.en || v.name_en || v.name || v.ru || '';
    }
    return '';
  }).filter(Boolean);
}

// Dates
function fmtDateRange(a,b){
  const da = new Date(a);
  const db = new Date(b);
  if(isNaN(da) || isNaN(db)) return '';
  const sameDay = da.toDateString()===db.toDateString();
  const locale = STATE.lang==='ru'?'ru-RU':'en-GB';
  if(sameDay) return da.toLocaleDateString(locale,{day:'2-digit',month:'2-digit',year:'numeric'});
  const sameMonth = da.getMonth()===db.getMonth() && da.getFullYear()===db.getFullYear();
  if(sameMonth){
    const mm = String(db.getMonth()+1).padStart(2,'0');
    return `${da.getDate()}–${db.getDate()}.${mm}.${db.getFullYear()}`;
  }
  const aS = da.toLocaleDateString(locale,{day:'2-digit',month:'2-digit'});
  const bS = db.toLocaleDateString(locale,{day:'2-digit',month:'2-digit'});
  return `${aS}–${bS}.${db.getFullYear()}`;
}

// Classify by type/name (works for RU/EN)
function classify(it){
  const type = (it.type||'').toString().toLowerCase();
  const name = nameLowerForClassify(it);
  if(type==='gpf') return 'gpf';
  if(type==='gp') return 'gp';
  if(type==='cs') return 'cs';
  if(type==='worlds'||type==='world') return 'worlds';
  if(type==='euros'||type==='europe') return 'euros';
  if(type==='oly'||type==='olympics') return 'oly';
  if(name.includes('grand prix final') || (name.includes('гран-при') && name.includes('финал'))) return 'gpf';
  if(name.includes('grand prix') || name.includes('гран-при')) return 'gp';
  if(name.includes('challenger') || name.includes('isu cs') || name.includes('(isu cs)') || name.includes('челленджер')) return 'cs';
  if(name.includes('world') || name.includes('мир')) return 'worlds';
  if(name.includes('europe') || name.includes('европ')) return 'euros';
  if(name.includes('olymp')) return 'oly';
  return '';
}
function colorForClass(cls){
  return cls==='gpf' ? '#2563eb'
    : cls==='gp' ? '#0ea5e9'
    : cls==='cs' ? '#9333ea'
    : cls==='worlds' ? '#16a34a'
    : cls==='euros' ? '#f59e0b'
    : cls==='oly' ? '#ef4444'
    : '#821130';
}

function chips(it){
  const cls = classify(it);
  const base = colorForClass(cls);
  const light = base + 'cc';
  const place = placeOf(it);
  return `
    <div class="subtags">
      ${(it.start&&it.end)?`<span class="subtag" style="background:${light}">📅 ${fmtDateRange(it.start,it.end)}</span>`:''}
      ${place?`<span class="subtag" style="background:${light}">📍 ${place}</span>`:''}
    </div>
  `;
}

function listView(items, kind){
  const sorted = items.slice().sort((a,b)=> new Date(a.start)-new Date(b.start));
  return `
    <div class="list">
      ${sorted.map((it,i)=>{
        const cls = classify(it);
        const map = {gp:'is-gp', gpf:'is-gpf', cs:'is-cs', worlds:'is-worlds', euros:'is-euros', oly:'is-oly'};
        const labelMap = {gp:t('gp'), gpf:t('gpf'), cs:t('cs'), worlds:t('worlds'), euros:t('euros'), oly:t('oly')};
        const cssc = map[cls]||'';
        const label = labelMap[cls]||'';
        const topTitle = titleOf(it);
        return `
          <a class="event ${cssc}" data-kind="${kind}" data-idx="${i}">
            <div><strong>${topTitle}</strong> ${label?`<span class="subtag" style="background:${colorForClass(cls)}33;color:#000;border:1px solid ${colorForClass(cls)}55">${label}</span>`:''}</div>
            <div class="emeta">${fmtDateRange(it.start,it.end)} • ${placeOf(it)}</div>
            ${chips(it)}
          </a>
        `;
      }).join('')}
    </div>
  `;
}

function columnList(title, arr){
  if(!arr || arr.length===0) return '';
  const names = mapNames(arr);
  if(names.length===0) return '';
  return `
    <div class="card" style="min-width:220px">
      <div class="title">${title}</div>
      <ul style="margin:8px 0 0 16px; padding:0">
        ${names.map(n=>`<li style="margin:6px 0">${n}</li>`).join('')}
      </ul>
    </div>
  `;
}

function view_event_details(kind, idx){
  backBtn.style.display = 'inline-flex';
  const items = (kind==='international'? (window.DATA?.international||[]) : (window.DATA?.russian||[]));
  const it = items[idx];
  const cls = classify(it);
  const topBorder = colorForClass(cls);
  const p = it.participants || {men:[], women:[], pairs:[], dance:[]};

  return `
    <div class="card view" style="border-top:4px solid ${topBorder}">
      <div class="title">${titleOf(it)}</div>
      <div class="emeta">${placeOf(it)}</div>
      ${chips(it)}
      <div style="margin-top:10px">
        ${it.url?`<a class="btn" href="${it.url}" target="_blank" rel="noopener">🌐 ${t('official')}</a>`:''}
        ${it.entries?` <a class="btn" href="${it.entries}" target="_blank" rel="noopener">📝 Entries</a>`:''}
      </div>
      <div class="grid" style="margin-top:12px">
        ${columnList(t('men'), p.men)}
        ${columnList(t('women'), p.women)}
        ${columnList(t('pairs'), p.pairs)}
        ${columnList(t('dance'), p.dance)}
      </div>
    </div>
  `;
}

// Views
function view_menu(){
  backBtn.style.display = 'none';
  return `
    <div class="grid view">
      <div class="card">
        <div class="title">${t('menu_calendar')}</div>
        <p class="muted">${STATE.lang==='ru'?'Выбери раздел и смотри даты, ссылки и составы.':'Choose a section to see dates, links and entries.'}</p>
        <button class="btn primary" id="btnCalendar">${t('open_calendar')}</button>
      </div>
      <div class="card">
        <div class="title">${t('menu_rules')}</div>
        <p class="muted">${t('rules_soon')}</p>
        <button class="btn" id="btnRules" disabled>${t('soon')}</button>
      </div>
    </div>
  `;
}

function view_calendar_select(){
  backBtn.style.display = 'inline-flex';
  return `
    <div class="card view">
      <div class="title">${t('calendar_select_title')}</div>
      <div class="grid" style="margin-top:10px">
        <div class="card">
          <div class="title">${t('intl')}</div>
          <p class="muted">${STATE.lang==='ru'?'ISU: Гран-при, ЧМ, ЧЕ, Олимпиада и др.':'ISU: Grand Prix, Worlds, Euros, Olympics etc.'}</p>
          <button class="btn primary" id="btnIntl">${t('open')}</button>
        </div>
        <div class="card">
          <div class="title">${t('rus')}</div>
          <p class="muted">${STATE.lang==='ru'?'Календарь ФФККР и всероссийские турниры':'FFKR calendar and national events'}</p>
          <button class="btn primary" id="btnRus">${t('open')}</button>
        </div>
      </div>
    </div>
  `;
}

// Router
function render(){
  const top = NAV[NAV.length-1];
  const view = top ? top.view : 'menu';
  let html = '';
  if(view==='menu') html = view_menu();
  if(view==='calendar_select') html = view_calendar_select();
  if(view==='calendar_list'){
    const kind = top.params.kind;
    const items = (kind==='international'? (window.DATA?.international||[]) : (window.DATA?.russian||[]));
    html = `
      <div class="card view">
        <div class="title">${kind==='international'?t('intl'):t('rus')}</div>
        ${items.length?listView(items, kind):`<p class="muted">${t('noEvents')}</p>`}
      </div>`;
  }
  if(view==='event_details'){
    html = view_event_details(top.params.kind, top.params.idx);
  }
  app.innerHTML = html;

  if(view==='menu'){
    document.getElementById('btnCalendar')?.addEventListener('click', ()=> go('calendar_select'));
  }
  if(view==='calendar_select'){
    document.getElementById('btnIntl')?.addEventListener('click', ()=> go('calendar_list',{kind:'international'}));
    document.getElementById('btnRus')?.addEventListener('click', ()=> go('calendar_list',{kind:'russian'}));
  }
  if(view==='calendar_list'){
    document.querySelectorAll('.event').forEach(el=>{
      el.addEventListener('click', ()=>{
        const kind = el.getAttribute('data-kind');
        const idx = Number(el.getAttribute('data-idx'));
        go('event_details', {kind, idx});
      });
    });
  }
  backBtn.style.display = NAV.length>1 ? 'inline-flex' : 'none';
  tBack.textContent = t('back');
}

// Nav
function go(view, params={}){
  if(NAV.length===0 || NAV[NAV.length-1].view!==view || JSON.stringify(NAV[NAV.length-1].params)!==JSON.stringify(params)){
    NAV.push({view, params});
  }
  render();
}
function back(){ NAV.pop(); render(); }

backBtn.addEventListener('click', back);
langRu.addEventListener('click', ()=> setLang('ru'));
langEn.addEventListener('click', ()=> setLang('en'));

// Data loading
async function load(){
  try{
    const res = await fetch('calendar.json', {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    window.DATA = data;
  }catch(e){
    window.DATA = {season:"2025–2026", international:[], russian:[]};
    console.warn('calendar.json load error; empty data used.', e);
  }
  render();
}

// Init
loadLang();
setLang(STATE.lang || 'ru');
go('menu');
load();

// Apply Telegram theme if present
(function applyThemeFromTelegram(){
  if(!TG || !TG.themeParams) return;
  const th = TG.themeParams;
  const root = document.documentElement;
  if(th.bg_color) root.style.setProperty('--bg', th.bg_color);
  if(th.secondary_bg_color) root.style.setProperty('--card', th.secondary_bg_color);
  if(th.text_color) root.style.setProperty('--text', th.text_color);
  if(th.hint_color) root.style.setProperty('--muted', th.hint_color);
  if(th.link_color) root.style.setProperty('--accent', th.link_color);
  if(th.section_separator_color) root.style.setProperty('--border', th.section_separator_color);
  try{ TG.onEvent && TG.onEvent('themeChanged', applyThemeFromTelegram); }catch(e){}
})();
