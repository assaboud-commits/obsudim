// Mini App v11 — Чистая локализация, без дубля даты, новый логотип
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
    rules_soon: "Здесь появятся правила и полезные материалы.",
    back: "Назад",
    official: "Официальная страница",
    men: "Мужчины", women: "Женщины", pairs: "Пары", dance: "Танцы на льду",
    gp: "Гран-при", gpf: "Финал Гран-при", worlds: "Чемпионат мира",
    euros: "Чемпионат Европы", oly: "Олимпиада"
  },
  en: {
    greet: "Hi, we hope to help you!",
    menu_calendar: "Competition Calendar",
    menu_rules: "Rules",
    soon: "Soon",
    open_calendar: "Open Calendar",
    open: "Open",
    calendar_select_title: "Calendar — choose a section",
    intl: "International events",
    rus: "Russian events",
    rules_soon: "Rules and useful materials will appear here soon.",
    back: "Back",
    official: "Official page",
    men: "Men", women: "Women", pairs: "Pairs", dance: "Ice Dance",
    gp: "Grand Prix", gpf: "Grand Prix Final", worlds: "World Championships",
    euros: "European Championships", oly: "Olympics"
  }
};

function t(k){return I18N[STATE.lang][k]||k;}

function saveLang(){try{localStorage.setItem('lang',STATE.lang);}catch(e){}}
function loadLang(){try{const v=localStorage.getItem('lang');if(v)STATE.lang=v;}catch(e){}}

function setLang(lang){
  STATE.lang=lang;
  langRu.classList.toggle('active',lang==='ru');
  langEn.classList.toggle('active',lang==='en');
  greetEl.textContent=t('greet');
  tBack.textContent=t('back');
  render();
  saveLang();
}

langRu.addEventListener('click',()=>setLang('ru'));
langEn.addEventListener('click',()=>setLang('en'));

function fmtDateRange(a,b){
  const opts={day:'2-digit',month:'2-digit',year:'numeric'};
  const da=new Date(a),db=new Date(b);
  if(da.toDateString()===db.toDateString())
    return da.toLocaleDateString(STATE.lang==='ru'?'ru-RU':'en-GB',opts);
  const sm=da.getMonth()===db.getMonth()&&da.getFullYear()===db.getFullYear();
  const d=n=>String(n).padStart(2,'0');
  if(sm)return`${da.getDate()}–${db.getDate()}.${d(db.getMonth()+1)}.${db.getFullYear()}`;
  const aS=da.toLocaleDateString(STATE.lang==='ru'?'ru-RU':'en-GB',{day:'2-digit',month:'2-digit'});
  const bS=db.toLocaleDateString(STATE.lang==='ru'?'ru-RU':'en-GB',{day:'2-digit',month:'2-digit'});
  return`${aS}–${bS}.${db.getFullYear()}`;
}

function classify(it){
  const n=(it.name||'').toLowerCase();
  if(n.includes('grand prix final')||n.includes('финал гран-при'))return'gpf';
  if(n.includes('grand prix')||n.includes('гран-при'))return'gp';
  if(n.includes('world')||n.includes('мир'))return'worlds';
  if(n.includes('europe')||n.includes('европ'))return'euros';
  if(n.includes('olymp'))return'oly';
  return'';
}
function colorForClass(c){
  return c==='gpf'?'#2563eb':c==='gp'?'#0ea5e9':c==='worlds'?'#16a34a':c==='euros'?'#f59e0b':c==='oly'?'#ef4444':'#821130';
}

function chips(it){
  const cls=classify(it),base=colorForClass(cls)+'cc';
  const place=[it.city,it.country].filter(Boolean).join(', ');
  return `<div class="subtags">
    <span class="subtag" style="background:${base}">📅 ${fmtDateRange(it.start,it.end)}</span>
    ${place?`<span class="subtag" style="background:${base}">📍 ${place}</span>`:''}
  </div>`;
}

function listView(items,kind){
  const sorted=items.slice().sort((a,b)=>new Date(a.start)-new Date(b.start));
  return `<div class="list">
    ${sorted.map((it,i)=>{
      const cls=classify(it);
      const labelMap={gp:t('gp'),gpf:t('gpf'),worlds:t('worlds'),euros:t('euros'),oly:t('oly')};
      const label=labelMap[cls]||'';
      return `<a class="event ${cls?`is-${cls}`:''}" data-kind="${kind}" data-idx="${i}">
        <div><strong>${it.name}</strong> ${label?`<span class="subtag" style="background:${colorForClass(cls)}33;color:#000;border:1px solid ${colorForClass(cls)}55">${label}</span>`:''}</div>
        ${chips(it)}
      </a>`;
    }).join('')}
  </div>`;
}

function columnList(title,arr){
  if(!arr?.length)return'';
  return `<div class="card" style="min-width:220px">
    <div class="title">${title}</div>
    <ul style="margin:8px 0 0 16px; padding:0">
      ${arr.map(n=>`<li style="margin:6px 0">${n}</li>`).join('')}
    </ul></div>`;
}

function view_menu(){
  backBtn.style.display='none';
  return `<div class="grid view">
    <div class="card">
      <div class="title">${t('menu_calendar')}</div>
      <p class="muted">${STATE.lang==='ru'
        ?'Выбери раздел и смотри даты, ссылки и составы.':'Choose a section to view dates, links and entries.'}</p>
      <button class="btn primary" id="btnCalendar">${t('open_calendar')}</button>
    </div>
    <div class="card">
      <div class="title">${t('menu_rules')}</div>
      <p class="muted">${t('rules_soon')}</p>
      <button class="btn" id="btnRules" disabled>${t('soon')}</button>
    </div>
  </div>`;
}

function view_calendar_select(){
  backBtn.style.display='inline-flex';
  return `<div class="card view">
    <div class="title">${t('calendar_select_title')}</div>
    <div class="grid" style="margin-top:10px">
      <div class="card">
        <div class="title">${t('intl')}</div>
        <p class="muted">${STATE.lang==='ru'
          ?'ISU: Гран-при, ЧМ, ЧЕ, Олимпиада и др.':'ISU: Grand Prix, Worlds, Euros, Olympics etc.'}</p>
        <button class="btn primary" id="btnIntl">${t('open')}</button>
      </div>
      <div class="card">
        <div class="title">${t('rus')}</div>
        <p class="muted">${STATE.lang==='ru'
          ?'Календарь ФФККР и всероссийские турниры':'FFKR calendar and national events'}</p>
        <button class="btn primary" id="btnRus">${t('open')}</button>
      </div>
    </div>
  </div>`;
}

function view_event_details(kind,idx){
  backBtn.style.display='inline-flex';
  const items=(kind==='international'?DATA.international:DATA.russian)||[];
  const it=items[idx];
  const cls=classify(it);
  const topBorder=colorForClass(cls);
  const p=it.participants||{men:[],women:[],pairs:[],dance:[]};
  return `<div class="card view" style="border-top:4px solid ${topBorder}">
    <div class="title">${it.name}</div>
    ${chips(it)}
    <div style="margin-top:10px">
      ${it.url?`<a class="btn" href="${it.url}" target="_blank">🌐 ${t('official')}</a>`:''}
      ${it.entries?` <a class="btn" href="${it.entries}" target="_blank">📝 Entries</a>`:''}
    </div>
    <div class="grid" style="margin-top:12px">
      ${columnList(t('men'),p.men)}
      ${columnList(t('women'),p.women)}
      ${columnList(t('pairs'),p.pairs)}
      ${columnList(t('dance'),p.dance)}
    </div>
  </div>`;
}

function render(){
  const top=NAV[NAV.length-1];
  const view=top?top.view:'menu';
  let html='';
  if(view==='menu')html=view_menu();
  if(view==='calendar_select')html=view_calendar_select();
  if(view==='calendar_list'){
    const kind=top.params.kind;
    const items=(kind==='international'?DATA.international:DATA.russian)||[];
    html=`<div class="card view"><div class="title">${kind==='international'?t('intl'):t('rus')}</div>${listView(items,kind)}</div>`;
  }
  if(view==='event_details')html=view_event_details(top.params.kind,top.params.idx);
  app.innerHTML=html;

  if(view==='menu')document.getElementById('btnCalendar')?.addEventListener('click',()=>go('calendar_select'));
  if(view==='calendar_select'){
    document.getElementById('btnIntl')?.addEventListener('click',()=>go('calendar_list',{kind:'international'}));
    document
