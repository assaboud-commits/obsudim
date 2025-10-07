// Mini App v17 — полный перевод: всё на русском / всё на английском
const TG = window.Telegram ? window.Telegram.WebApp : null;
const app = document.getElementById('app');
const backBtn = document.getElementById('backBtn');
const langRu = document.getElementById('langRu');
const langEn = document.getElementById('langEn');
const greetEl = document.getElementById('greet');
const tBack = document.getElementById('t_back');

const NAV = [];
const STATE = { lang: 'ru' };

// === Локализация ===
const I18N = {
  ru: {
    greet: "Привет! Надеемся, мы тебе поможем 🙂",
    menu_calendar: "Календарь соревнований",
    menu_rules: "Правила и материалы",
    soon: "Скоро",
    open_calendar: "Открыть календарь",
    open: "Открыть",
    calendar_select_title: "Календарь — выбери раздел",
    intl: "Зарубежные старты",
    rus: "Российские старты",
    rules_soon: "Здесь появятся правила, ссылки и документы.",
    back: "Назад",
    official: "Официальная страница",
    men: "Мужчины", women: "Женщины", pairs: "Пары", dance: "Танцы на льду",
    gp: "Гран-при", gpf: "Финал Гран-при", worlds: "Чемпионат мира",
    euros: "Чемпионат Европы", oly: "Олимпиада"
  },
  en: {
    greet: "Hi! We hope this helps you 🙂",
    menu_calendar: "Competition schedule",
    menu_rules: "Rules & materials",
    soon: "Coming soon",
    open_calendar: "Open schedule",
    open: "Open",
    calendar_select_title: "Schedule — choose a section",
    intl: "International events",
    rus: "Domestic events",
    rules_soon: "Official rules, documents and materials will appear here.",
    back: "Back",
    official: "Official website",
    men: "Men", women: "Women", pairs: "Pairs", dance: "Ice dance",
    gp: "Grand Prix", gpf: "Grand Prix Final", worlds: "World Championships",
    euros: "European Championships", oly: "Olympic Games"
  }
};

function t(k){return I18N[STATE.lang][k]||k;}

// === Язык ===
function saveLang(){try{localStorage.setItem('lang',STATE.lang);}catch(e){}}
function loadLang(){
  try{
    const saved = localStorage.getItem('lang');
    if(saved) STATE.lang = saved;
    else {
      const sys = TG?.initDataUnsafe?.user?.language_code || navigator.language || 'ru';
      STATE.lang = sys.startsWith('en') ? 'en' : 'ru';
      saveLang();
    }
  }catch(e){}
}

function setLang(lang){
  STATE.lang = lang;
  langRu.classList.toggle('active', lang==='ru');
  langEn.classList.toggle('active', lang==='en');
  greetEl.textContent = t('greet');
  tBack.textContent = t('back');
  saveLang();
  if(NAV.length) render();
}

langRu.addEventListener('click',()=>setLang('ru'));
langEn.addEventListener('click',()=>setLang('en'));

// === Транслитерация ===
function translit(str){
  if(!str) return '';
  const map = {
    А:'A',Б:'B',В:'V',Г:'G',Д:'D',Е:'E',Ё:'Yo',Ж:'Zh',З:'Z',И:'I',Й:'Y',
    К:'K',Л:'L',М:'M',Н:'N',О:'O',П:'P',Р:'R',С:'S',Т:'T',У:'U',Ф:'F',
    Х:'Kh',Ц:'Ts',Ч:'Ch',Ш:'Sh',Щ:'Sch',Ы:'Y',Э:'E',Ю:'Yu',Я:'Ya',
    Ь:'',Ъ:'', а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',
    й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',
    х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ы:'y',э:'e',ю:'yu',я:'ya'
  };
  return str.split('').map(ch=>map[ch]||ch).join('');
}
function maybeLang(text){
  if(!text) return '';
  if(Array.isArray(text)) return text.map(v=>maybeLang(v));
  return STATE.lang==='en' && /[А-Яа-яЁё]/.test(text) ? translit(text) : text;
}

// === Формат даты ===
function fmtDateRange(a,b){
  const opts={day:'2-digit',month:'short',year:'numeric'};
  const da=new Date(a),db=new Date(b);
  if(da.toDateString()===db.toDateString())
    return da.toLocaleDateString(STATE.lang==='ru'?'ru-RU':'en-GB',opts);
  const sm=da.getMonth()===db.getMonth()&&da.getFullYear()===db.getFullYear();
  if(sm){
    const month = da.toLocaleString(STATE.lang==='ru'?'ru-RU':'en-GB',{month:'short'});
    return `${da.getDate()}–${db.getDate()} ${month}`;
  }
  return `${da.toLocaleDateString(STATE.lang==='ru'?'ru-RU':'en-GB',{day:'2-digit',month:'short'})} – ${db.toLocaleDateString(STATE.lang==='ru'?'ru-RU':'en-GB',{day:'2-digit',month:'short'})}`;
}

// === Цвета турниров ===
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

// === Отрисовка ===
function chips(it){
  const cls=classify(it),base=colorForClass(cls)+'cc';
  const place=[it.city,it.country].filter(Boolean).join(', ');
  return `<div class="subtags">
    <span class="subtag" style="background:${base}">📅 ${fmtDateRange(it.start,it.end)}</span>
    ${place?`<span class="subtag" style="background:${base}">📍 ${maybeLang(place)}</span>`:''}
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
        <div><strong>${maybeLang(it.name)}</strong> ${label?`<span class="subtag" style="background:${colorForClass(cls)}33;color:#000;border:1px solid ${colorForClass(cls)}55">${label}</span>`:''}</div>
        ${chips(it)}
      </a>`;
    }).join('')}
  </div>`;
}

function columnList(title,arr){
  if(!arr?.length)return'';
  const names = maybeLang(arr);
  return `<div class="card" style="min-width:220px">
    <div class="title">${title}</div>
    <ul style="margin:8px 0 0 16px; padding:0">
      ${names.map(n=>`<li style="margin:6px 0">${n}</li>`).join('')}
    </ul></div>`;
}

function view_menu(){
  backBtn.style.display='none';
  return `<div class="grid view">
    <div class="card">
      <div class="title">${t('menu_calendar')}</div>
      <p class="muted">${STATE.lang==='ru'
        ?'Выбери раздел, чтобы посмотреть даты и составы участников.'
        :'Choose a section to see dates and entries lists.'}</p>
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
          ?'ISU: Гран-при, ЧМ, ЧЕ, Олимпиада и др.'
          :'ISU events: Grand Prix, Worlds, Euros, Olympics etc.'}</p>
        <button class="btn primary" id="btnIntl">${t('open')}</button>
      </div>
      <div class="card">
        <div class="title">${t('rus')}</div>
        <p class="muted">${STATE.lang==='ru'
          ?'Календарь ФФККР и национальные турниры'
          :'FFKR calendar and domestic competitions'}</p>
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
    <div class="title">${maybeLang(it.name)}</div>
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

// === Router ===
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

  requestAnimationFrame(()=>{
    if(view==='menu'){
      document.getElementById('btnCalendar')?.addEventListener('click',()=>go('calendar_select'));
    }
    if(view==='calendar_select'){
      document.getElementById('btnIntl')?.addEventListener('click',()=>go('calendar_list',{kind:'international'}));
      document.getElementById('btnRus')?.addEventListener('click',()=>go('calendar_list',{kind:'russian'}));
    }
    if(view==='calendar_list'){
      document.querySelectorAll('.event').forEach(el=>{
        el.addEventListener('click',()=>{
          const kind=el.getAttribute('data-kind');
          const idx=+el.getAttribute('data-idx');
          go('event_details',{kind,idx});
        });
      });
    }
  });

  backBtn.style.display=NAV.length>1?'inline-flex':'none';
  tBack.textContent=t('back');
}

// === Навигация ===
function go(view,params={}){NAV.push({view,params});render();}
function back(){NAV.pop();render();}
backBtn.addEventListener('click',back);

// === Загрузка ===
async function load(){
  try{
    const res=await fetch('calendar.json',{cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    window.DATA=await res.json();
  }catch(e){
    window.DATA={season:"2025–2026",international:[],russian:[]};
  }
  render();
}

// === Инициализация ===
loadLang();
setLang(STATE.lang);
NAV.push({view:'menu',params:{}});
load();

