// === О! Обсудим — Календарь ФК ===

// 🌈 Градиенты флагов (для цветового блюра)
function flagColor(country) {
  const map = {
    "США": "linear-gradient(90deg, #3c3b6e 0%, #fff 50%, #b22234 100%)",
    "Канада": "linear-gradient(90deg, #ff0000 0%, #fff 50%, #ff0000 100%)",
    "Франция": "linear-gradient(90deg, #0055a4 0%, #fff 50%, #ef4135 100%)",
    "Япония": "linear-gradient(90deg, #fff 0%, #d60000 80%)",
    "Китай": "linear-gradient(90deg, #de2910 0%, #ffde00 90%)",
    "Грузия": "linear-gradient(90deg, #fff 0%, #ff0000 100%)",
    "Италия": "linear-gradient(90deg, #008C45 0%, #fff 50%, #CD212A 100%)",
    "Германия": "linear-gradient(90deg, #000 0%, #dd0000 50%, #ffce00 100%)",
    "Корея": "linear-gradient(90deg, #003478 0%, #fff 50%, #c60c30 100%)",
    "Россия": "linear-gradient(90deg, #0039A6 0%, #fff 50%, #D52B1E 100%)"
  };
  return map[country] || "linear-gradient(90deg, #444, #222)";
}

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const NAV = [];
let DATA = { international: [], russian: [] };

function go(view, params = {}) {
  if (
    NAV.length === 0 ||
    NAV[NAV.length - 1].view !== view ||
    JSON.stringify(NAV[NAV.length - 1].params) !== JSON.stringify(params)
  ) {
    NAV.push({ view, params });
  }
  render();
}

function back() {
  NAV.pop();
  render();
}

backBtn.addEventListener("click", back);

function fmtDateRange(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  if (!a || !b || isNaN(da) || isNaN(db)) return "";
  if (da.getTime() === db.getTime()) return da.toLocaleDateString("ru-RU");
  const aDay = da.getDate();
  const bDay = db.getDate();
  const aMonth = da.toLocaleString("ru-RU", { month: "short" });
  const bMonth = db.toLocaleString("ru-RU", { month: "short" });
  return `${aDay}–${bDay} ${bMonth} ${db.getFullYear()}`;
}

function classify(it) {
  const name = (it.name || "").toLowerCase();
  if (name.includes("финал гран-при")) return "gpf";
  if (name.includes("гран-при")) return "gp";
  if (name.includes("мир")) return "worlds";
  if (name.includes("европ")) return "euros";
  if (name.includes("олимп")) return "oly";
  return "";
}

function colorForClass(cls) {
  return cls === "gpf"
    ? "#2563eb"
    : cls === "gp"
    ? "#0ea5e9"
    : cls === "worlds"
    ? "#16a34a"
    : cls === "euros"
    ? "#f59e0b"
    : cls === "oly"
    ? "#ef4444"
    : "#821130";
}

function chips(it) {
  const cls = classify(it);
  const base = colorForClass(cls);
  const light = base + "cc";
  const place = [it.city, it.country].filter(Boolean).join(", ");
  return `
    <div class="subtags">
      <span class="subtag" style="background:${light}">📅 ${fmtDateRange(
        it.start,
        it.end
      )}</span>
      ${
        place
          ? `<span class="subtag" style="background:${light}">📍 ${place}</span>`
          : ""
      }
    </div>
  `;
}

function listView(items, kind) {
  const sorted = items.slice().sort((a, b) => new Date(a.start) - new Date(b.start));
  return `
    <div class="list">
      ${sorted
        .map((it, i) => {
          const cls = classify(it);
          const cssc = cls ? `is-${cls}` : "";
          const labelMap = {
            gp: "Гран-при",
            gpf: "Финал Гран-при",
            worlds: "Чемпионат мира",
            euros: "Чемпионат Европы",
            oly: "Олимпиада"
          };
          const label = labelMap[cls] || "";
          const grad = flagColor(it.country);
          return `
            <a class="event ${cssc}" style="--flag-grad:${grad}" data-kind="${kind}" data-idx="${i}">
              <div><strong>${it.name}</strong>
              ${
                label
                  ? `<span class="subtag" style="background:${colorForClass(cls)}33;color:#000;border:1px solid ${colorForClass(cls)}55">${label}</span>`
                  : ""
              }</div>
              <div class="emeta">${fmtDateRange(it.start, it.end)} | ${it.city || ""}, ${it.country || ""}</div>
              ${chips(it)}
            </a>
          `;
        })
        .join("")}
    </div>
  `;
}

// === Виды экранов ===
function view_menu() {
  backBtn.style.display = "none";
  return `
    <div class="grid view">
      <div class="card">
        <div class="title">Календарь соревнований</div>
        <p class="muted">Выбери раздел и смотри даты, ссылки и составы.</p>
        <button class="btn primary" id="btnCalendar">Открыть календарь</button>
      </div>
      <div class="card">
        <div class="title">Правила</div>
        <p class="muted">Скоро тут будут правила и полезные материалы.</p>
        <button class="btn" id="btnRules" disabled>Скоро</button>
      </div>
    </div>
  `;
}

function view_calendar_select() {
  backBtn.style.display = "inline-flex";
  return `
    <div class="card view">
      <div class="title">Календарь — выбери раздел</div>
      <div class="grid" style="margin-top:10px">
        <div class="card">
          <div class="title">Зарубежные старты</div>
          <p class="muted">ISU: Гран-при, ЧМ, ЧЕ и др.</p>
          <button class="btn primary" id="btnIntl">Открыть</button>
        </div>
        <div class="card">
          <div class="title">Российские старты</div>
          <p class="muted">Календарь ФФККР и всероссийские турниры.</p>
          <button class="btn primary" id="btnRus">Открыть</button>
        </div>
      </div>
    </div>
  `;
}

function view_event_details(kind, idx) {
  backBtn.style.display = "inline-flex";
  const items =
    kind === "international" ? DATA.international : DATA.russian;
  const it = items[idx];
  if (!it) return `<div class="card"><div class="title">Ошибка данных</div></div>`;
  const cls = classify(it);
  const topBorder = colorForClass(cls);
  const p = it.participants || { men: [], women: [], pairs: [], dance: [] };

  const col = (title, arr) => {
    if (!arr || !arr.length) return "";
    return `
      <div class="card" style="min-width:220px">
        <div class="title">${title}</div>
        <ul style="margin:8px 0 0 16px; padding:0">
          ${arr.map((n) => `<li style="margin:6px 0">${n}</li>`).join("")}
        </ul>
      </div>
    `;
  };

  return `
    <div class="card view" style="border-top:4px solid ${topBorder}">
      <div class="title">${it.name}</div>
      ${chips(it)}
      <div class="grid" style="margin-top:12px">
        ${col("Мужчины", p.men)}
        ${col("Женщины", p.women)}
        ${col("Пары", p.pairs)}
        ${col("Танцы на льду", p.dance)}
      </div>
    </div>
  `;
}

// === Рендер ===
function render() {
  const top = NAV[NAV.length - 1];
  const view = top ? top.view : "menu";
  let html = "";

  if (view === "menu") html = view_menu();
  if (view === "calendar_select") html = view_calendar_select();
  if (view === "calendar_list") {
    const kind = top.params.kind;
    const items =
      kind === "international" ? DATA.international : DATA.russian;
    html = `
      <div class="card view">
        <div class="title">${
          kind === "international"
            ? "Зарубежные старты"
            : "Российские старты"
        }</div>
        ${listView(items, kind)}
      </div>
    `;
  }
  if (view === "event_details")
    html = view_event_details(top.params.kind, top.params.idx);

  app.innerHTML = html;

  // навешиваем обработчики
  if (view === "menu") {
    document.getElementById("btnCalendar")?.addEventListener("click", () =>
      go("calendar_select")
    );
  }
  if (view === "calendar_select") {
    document.getElementById("btnIntl")?.addEventListener("click", () =>
      go("calendar_list", { kind: "international" })
    );
    document.getElementById("btnRus")?.addEventListener("click", () =>
      go("calendar_list", { kind: "russian" })
    );
  }
  if (view === "calendar_list") {
    document.querySelectorAll(".event").forEach((el) => {
      el.addEventListener("click", () => {
        const kind = el.getAttribute("data-kind");
        const idx = Number(el.getAttribute("data-idx"));
        go("event_details", { kind, idx });
      });
    });
  }

  backBtn.style.display = NAV.length > 1 ? "inline-flex" : "none";
}

// === Загрузка данных ===
async function load() {
  try {
    const res = await fetch("calendar.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    DATA = await res.json();
  } catch (e) {
    console.error("Ошибка загрузки календаря:", e);
    DATA = { international: [], russian: [] };
  }
  render();
}

go("menu");
load();
