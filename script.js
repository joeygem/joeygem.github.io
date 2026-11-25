// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => links.classList.remove("open"))
);

// Project filters
const filters = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".projects .card");
filters.forEach((btn) =>
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    cards.forEach((c) => c.classList.toggle("hidden", f !== "all" && c.dataset.cat !== f));
  })
);

// Animated stat counters
const animateCount = (el) => {
  const target = +el.dataset.count;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const start = performance.now();
  const dur = 1200;
  const step = (t) => {
    const p = Math.min((t - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const stats = document.querySelectorAll(".stat-num");

// Reveal on scroll
const revealTargets = document.querySelectorAll(".section-title, .card, .stat, .timeline > li, .skill-group, .pillar");
revealTargets.forEach((el) => el.classList.add("reveal"));

if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        if (e.target.classList.contains("stat")) animateCount(e.target.querySelector(".stat-num"));
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("visible"));
  stats.forEach((el) => (el.textContent = (el.dataset.prefix || "") + el.dataset.count + (el.dataset.suffix || "")));
}

// ---------- Scroll progress + active nav link ----------
const progress = document.getElementById("progress");
let ticking = false;
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  ticking = false;
};
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); } }, { passive: true });
updateProgress();

const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
if ("IntersectionObserver" in window) {
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("current", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => navIO.observe(s));
}

// ---------- Cursor glow on cards ----------
const GLOW = ".card, .stat, .app-card, .skill-group, .pillar, .demo-box";
document.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  const el = e.target.closest && e.target.closest(GLOW);
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
});

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);
const pct = (x, d = 1) => (x * 100).toFixed(d) + "%";
const money = (x) => {
  const a = Math.abs(x), s = x < 0 ? "−" : "";
  return a >= 1e6 ? `${s}$${(a / 1e6).toFixed(2)}M` : `${s}$${Math.round(a / 1e3)}K`;
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (dt) => `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
const setActive = (group, btn) => group.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === btn));

// ---------- Credit scorecard (points from credit-risk-scoring/reports/scorecard_points.csv) ----------
const CS = [
  { short: "latest repayment status", label: "Latest month: repayment status", opts: [["Not late", 68], ["1 month late", 47], ["2+ months late", 21]] },
  { short: "months behind", label: "Months behind on payments (last 6)", opts: [["None", 66], ["1 month", 54], ["2 months", 50], ["3 or more", 42]] },
  { short: "months with no payment", label: "Months with no payment (last 6)", opts: [["None", 64], ["1 month", 54], ["2 or more", 53]] },
  { short: "latest payment size", label: "Latest payment as % of the bill", opts: [["Under 3.4%", 57], ["3.4–24%", 58], ["24–100%", 58], ["Over 100%", 59]] },
  { short: "credit limit", label: "Credit limit (NT$)", opts: [["Up to 30K", 48], ["30K–70K", 54], ["70K–100K", 57], ["100K–140K", 57], ["140K–210K", 62], ["210K–270K", 64], ["270K–360K", 66], ["Over 360K", 69]] },
  { short: "average payment size", label: "Average payment as % of the bill (5 months)", opts: [["Under 4%", 54], ["4–8%", 57], ["8–20%", 58], ["20–100%", 59], ["Over 100%", 64]] },
  { short: "credit utilisation", label: "Average credit utilisation (6 months)", opts: [["Under 28%", 60], ["28–45%", 59], ["45–61%", 58], ["61–76%", 57], ["76–89%", 56], ["Over 89%", 55]] },
  { short: "balance trend", label: "Balance change over 6 months (% of limit)", opts: [["Fell more than 5%", 55], ["Fell 1.4–5%", 57], ["Flat or fell < 1.4%", 57], ["Rose", 60]] },
  { short: "payment vs. limit", label: "Average payment as % of the limit", opts: [["Under 0.3%", 50], ["0.3–5%", 58], ["5–9%", 60], ["Over 9%", 67]] },
];
const CS_PRESETS = { typical: [0, 0, 0, 1, 4, 3, 0, 3, 1], strong: [0, 0, 0, 3, 7, 4, 0, 3, 3], stretched: [1, 2, 1, 0, 1, 1, 4, 1, 1] };
// Ten test-set score bands (credit-risk-scoring/reports/score_bands.csv): [min score, borrowers, defaults], lowest first
const BANDS = [
  [-Infinity, 900, 607], [481.80, 900, 379], [505.75, 900, 214], [527.10, 903, 179], [536.65, 907, 169],
  [541.28, 891, 109], [544.94, 917, 100], [548.78, 911, 99], [552.95, 874, 68], [557.70, 897, 67],
];
const CUTOFF = 505.75, S_MIN = 430, S_MAX = 580;
let shownScore = 555;

function scoreBorrower(instant) {
  let score = 0, drag = null;
  CS.forEach((f, i) => {
    const pts = f.opts[+$(`cs-f${i}`).value][1];
    const lost = Math.max(...f.opts.map((o) => o[1])) - pts;
    $(`cs-f${i}-pts`).textContent = `${pts} pts`;
    score += pts;
    if (lost > 0 && (!drag || lost > drag.lost)) drag = { f, lost };
  });
  let band = 0;
  BANDS.forEach((b, i) => { if (score >= b[0]) band = i; });
  const rate = BANDS[band][2] / BANDS[band][1];
  const ok = score >= CUTOFF;

  $("cs-needle").style.left = `${Math.min(Math.max((score - S_MIN) / (S_MAX - S_MIN), 0), 1) * 100}%`;
  const d = $("cs-decision");
  d.className = "cs-decision " + (ok ? "ok" : "no");
  d.textContent = ok ? "✓ Approved: above the 80%-approval cut-off" : "✗ Declined: below the cut-off of 505";
  $("cs-band").textContent = `${pct(rate)}  (band ${band + 1} of 10)`;
  $("cs-drag").textContent = drag
    ? `${drag.f.short[0].toUpperCase() + drag.f.short.slice(1)} (−${drag.lost} pts vs. the best answer)`
    : "None: every answer is the best possible";

  const el = $("cs-score"), from = shownScore, t0 = performance.now();
  shownScore = score;
  if (instant || reduceMotion) { el.textContent = score; return; }
  const tick = (t) => {
    const p = Math.min((t - t0) / 400, 1);
    el.textContent = Math.round(from + (score - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const csForm = $("cs-form");
if (csForm) {
  CS.forEach((f, i) => {
    const id = `cs-f${i}`;
    const wrap = document.createElement("div");
    wrap.className = "cs-field";
    wrap.innerHTML = `<label for="${id}">${f.label}<span class="pts" id="${id}-pts"></span></label><select id="${id}">${f.opts.map((o, j) => `<option value="${j}">${o[0]}</option>`).join("")}</select>`;
    csForm.appendChild(wrap);
  });
  csForm.addEventListener("change", () => { setActive($("cs-presets"), null); scoreBorrower(); });
  $("cs-presets").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    setActive($("cs-presets"), b);
    CS_PRESETS[b.dataset.preset].forEach((v, i) => ($(`cs-f${i}`).value = v));
    scoreBorrower();
  });
  $("cs-cutoff").style.left = `${((CUTOFF - S_MIN) / (S_MAX - S_MIN)) * 100}%`;
  CS_PRESETS.typical.forEach((v, i) => ($(`cs-f${i}`).value = v));
  scoreBorrower(true);
}

// Approval-rate trade-off: approve the top N score deciles
const apRange = $("ap-range");
const updateApproval = () => {
  const k = +apRange.value / 10;
  const sum = (bs) => bs.reduce((acc, b) => [acc[0] + b[1], acc[1] + b[2]], [0, 0]);
  const all = sum(BANDS), top = sum(BANDS.slice(10 - k));
  const base = all[1] / all[0], model = top[1] / top[0];
  $("ap-out").textContent = apRange.value + "%";
  $("ap-pct").textContent = apRange.value + "%";
  $("ap-base").style.width = `${(base / 0.25) * 100}%`;
  $("ap-model").style.width = `${(model / 0.25) * 100}%`;
  $("ap-base-val").textContent = pct(base);
  $("ap-model-val").textContent = pct(model);
  $("ap-summary").innerHTML = k === 10
    ? `Approving everyone means accepting the full <strong>${pct(base)}</strong> default rate.`
    : `Approving the best ${apRange.value}% cuts the default rate from ${pct(base)} to ${pct(model)}: <strong>${Math.round((1 - model / base) * 100)}% fewer defaults</strong>, while declining ${100 - apRange.value}% of applicants.`;
};
if (apRange) { apRange.addEventListener("input", updateApproval); updateApproval(); }

// ---------- VaR backtest (market-risk-engine/reports/var_forecasts.csv) ----------
const VAR = { data: null, model: "filtered_historical", from: "2008-09-19", to: "2026-12-31", last: 0, hover: -1 };
const varCanvas = $("var-chart");
let varBase = null, varGeom = null;

const loadVar = () =>
  fetch("assets/data/var_backtest.json")
    .then((r) => r.json())
    .then((d) => {
      const t0 = Date.parse(d.start + "T00:00:00Z");
      d.dates = d.days.map((x) => new Date(t0 + x * 864e5));
      d.iso = d.dates.map((x) => x.toISOString().slice(0, 10));
      VAR.data = d;
      $("var-loading").hidden = true;
      drawVar();
    })
    .catch(() => { $("var-loading").textContent = "Could not load the backtest data."; });

const varWindow = () => {
  const d = VAR.data, n = d.pnl.length;
  if (VAR.last) return [Math.max(0, n - VAR.last), n - 1];
  let a = d.iso.findIndex((x) => x >= VAR.from), b = n - 1;
  while (b > 0 && d.iso[b] > VAR.to) b--;
  return [a, b];
};

function erfc(x) { // Abramowitz & Stegun 7.1.26
  const t = 1 / (1 + 0.3275911 * x);
  return t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
}
function kupiec(x, T, p = 0.01) {
  const ph = x / T;
  const ll0 = (T - x) * Math.log(1 - p) + x * Math.log(p);
  const ll1 = (x === 0 ? 0 : x * Math.log(ph)) + (x === T ? 0 : (T - x) * Math.log(1 - ph));
  const lr = Math.max(0, -2 * (ll0 - ll1));
  return { lr, p: erfc(Math.sqrt(lr / 2)) };
}
function niceStep(raw) {
  const p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
}

function drawVar() {
  if (!varCanvas || !VAR.data || $("demo-var").hidden) return;
  const d = VAR.data, v = d[VAR.model];
  const [a, b] = varWindow();
  const n = b - a + 1;
  const dpr = devicePixelRatio || 1;
  const W = varCanvas.clientWidth, H = varCanvas.clientHeight;
  if (!W || !H) return;
  varCanvas.width = W * dpr; varCanvas.height = H * dpr;
  const pad = { l: 58, r: 10, t: 10, b: 26 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

  let lo = 0, hi = 0;
  for (let i = a; i <= b; i++) { lo = Math.min(lo, d.pnl[i], -v[i]); hi = Math.max(hi, d.pnl[i]); }
  lo *= 1.08; hi *= 1.08;
  const X = (i) => pad.l + ((i - a + 0.5) / n) * pw;
  const Y = (y) => pad.t + ((hi - y) / (hi - lo)) * ph;

  // Draw the static chart once offscreen; hovering only copies it and adds the guide line.
  varBase = document.createElement("canvas");
  varBase.width = varCanvas.width; varBase.height = varCanvas.height;
  const g = varBase.getContext("2d");
  g.scale(dpr, dpr);
  g.font = "11px 'JetBrains Mono', monospace";
  g.fillStyle = "#94a3c0"; g.strokeStyle = "#22314f"; g.lineWidth = 1;

  const step = niceStep((hi - lo) / 5);
  g.textAlign = "right"; g.textBaseline = "middle";
  for (let y = Math.ceil(lo / step) * step; y <= hi; y += step) {
    g.beginPath(); g.moveTo(pad.l, Y(y)); g.lineTo(W - pad.r, Y(y)); g.stroke();
    g.fillText(Math.abs(y) < 1 ? "$0" : money(y), pad.l - 6, Y(y));
  }

  // x labels: years for long windows, months for short ones
  g.textAlign = "center"; g.textBaseline = "top";
  const years = (d.dates[b] - d.dates[a]) / 3.156e10;
  let prev = null, lastX = -Infinity;
  for (let i = a; i <= b; i++) {
    const dt = d.dates[i], yr = dt.getUTCFullYear(), mo = dt.getUTCMonth();
    const key = years > 3 ? yr : yr * 12 + mo;
    if (prev !== null && key !== prev) {
      const lab = years > 3 ? String(yr) : `${MONTHS[mo]} ${yr}`;
      const room = g.measureText(lab).width + 16;
      if (X(i) - lastX >= room && X(i) + room / 2 <= W) {
        g.fillText(lab, X(i), H - pad.b + 8);
        lastX = X(i);
      }
    }
    prev = key;
  }

  // P&L bars, exceptions in red
  const bw = Math.max(1, (pw / n) * 0.7), y0 = Y(0);
  const exc = [];
  for (let i = a; i <= b; i++) {
    const isExc = d.pnl[i] < -v[i];
    if (isExc) exc.push(i);
    g.fillStyle = isExc ? "#f87171" : "#5b6b8c";
    const y = Y(d.pnl[i]);
    g.fillRect(X(i) - bw / 2, Math.min(y, y0), bw, Math.max(1, Math.abs(y - y0)));
  }
  // VaR line (as a loss)
  g.strokeStyle = "#fbbf24"; g.lineWidth = 1.5; g.beginPath();
  for (let i = a; i <= b; i++) { if (i === a) g.moveTo(X(i), Y(-v[i])); else g.lineTo(X(i), Y(-v[i])); }
  g.stroke();
  g.fillStyle = "#f87171";
  exc.forEach((i) => { g.beginPath(); g.arc(X(i), Y(d.pnl[i]), n > 1500 ? 2 : 3, 0, 7); g.fill(); });

  varGeom = { a, b, n, X, pad, pw, dpr };
  paintVar();

  // Window statistics
  const x = exc.length, k = kupiec(x, n), pass = k.p > 0.05;
  $("vs-exc").textContent = x;
  $("vs-exp").textContent = `vs. ${(n * 0.01).toFixed(1)} expected over ${n.toLocaleString("en")} days`;
  $("vs-kupiec").textContent = pass ? "Pass" : "Fail";
  $("vs-kupiec").className = "mono var-big " + (pass ? "zone-green" : "zone-red");
  $("vs-p").textContent = `p-value ${k.p < 0.0001 ? "< 0.0001" : k.p.toFixed(4)}`;
  const last = exc.filter((i) => i > b - 250).length;
  const zone = last <= 4 ? "green" : last <= 9 ? "yellow" : "red";
  $("vs-zone").textContent = zone[0].toUpperCase() + zone.slice(1);
  $("vs-zone").className = "mono var-big zone-" + zone;
  $("vs-zone-n").textContent = `${last} exception${last === 1 ? "" : "s"} (green ≤ 4, red ≥ 10)`;
}

function paintVar() {
  if (!varBase || !varGeom) return;
  const ctx = varCanvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, varCanvas.width, varCanvas.height);
  ctx.drawImage(varBase, 0, 0);
  const tip = $("var-tip"), i = VAR.hover, G = varGeom;
  if (i < G.a || i > G.b) { tip.hidden = true; return; }
  const d = VAR.data, v = d[VAR.model][i], p = d.pnl[i];
  ctx.scale(G.dpr, G.dpr);
  ctx.strokeStyle = "rgba(230,235,245,.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(G.X(i), G.pad.t); ctx.lineTo(G.X(i), varCanvas.clientHeight - G.pad.b); ctx.stroke();
  tip.innerHTML = `<b>${fmtDate(d.dates[i])}</b>P&amp;L ${money(p)}<br>VaR ${money(-v)}${p < -v ? '<br><span class="exc">Exception</span>' : ""}`;
  tip.hidden = false;
  const x = G.X(i), w = tip.offsetWidth;
  tip.style.left = `${x + 12 + w > varCanvas.clientWidth ? x - w - 12 : x + 12}px`;
  tip.style.top = `${G.pad.t + 6}px`;
}

if (varCanvas) {
  const hoverAt = (clientX) => {
    if (!varGeom) return;
    const r = varCanvas.getBoundingClientRect();
    VAR.hover = varGeom.a + Math.floor(((clientX - r.left - varGeom.pad.l) / varGeom.pw) * varGeom.n);
    paintVar();
  };
  varCanvas.addEventListener("pointermove", (e) => hoverAt(e.clientX));
  varCanvas.addEventListener("pointerdown", (e) => hoverAt(e.clientX));
  varCanvas.addEventListener("pointerleave", () => { VAR.hover = -1; paintVar(); });
  $("var-models").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    setActive($("var-models"), b); VAR.model = b.dataset.model; drawVar();
  });
  $("var-periods").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    setActive($("var-periods"), b);
    VAR.last = +(b.dataset.last || 0); VAR.from = b.dataset.from; VAR.to = b.dataset.to;
    VAR.hover = -1; drawVar();
  });
  if ("ResizeObserver" in window) new ResizeObserver(() => drawVar()).observe(varCanvas);
}

// ---------- Stress tests (market-risk-engine/reports/stress_tests.csv) ----------
const STRESS = [
  ["Global Financial Crisis (Lehman)", "Historical", "2008-09-12", "2008-11-20", -2131278, -2131278, "USO −51%"],
  ["US downgrade / Euro crisis 2011", "Historical", "2011-07-22", "2011-10-03", -501896, -632624, "EEM −28%"],
  ["Taper tantrum 2013", "Historical", "2013-05-21", "2013-06-24", -636626, -636626, "EEM −16%"],
  ["Oil price collapse 2014–15", "Historical", "2014-06-20", "2015-01-28", 156784, -234870, "USO −58%"],
  ["COVID-19 crash", "Historical", "2020-02-19", "2020-03-23", -1639956, -1774779, "USO −56%"],
  ["2022 inflation & rate shock", "Historical", "2022-01-03", "2022-10-12", -2090689, -2104445, "TLT −29%"],
  ["Equity crash (−25% S&P)", "Hypothetical", "", "", -1166000, -1166000, "SPY −25%"],
  ["Rates +200bp parallel", "Hypothetical", "", "", -1275000, -1275000, "TLT −31%"],
  ["Stagflation", "Hypothetical", "", "", -998000, -998000, "SPY −15%"],
  ["Credit spreads +300bp", "Hypothetical", "", "", -774000, -774000, "SPY −12%"],
  ["USD +10% rally", "Hypothetical", "", "", -369000, -369000, "SPY −3%"],
].sort((x, y) => x[4] - y[4]);
const VAR_TODAY = 176663; // current 99% 1-day VaR, filtered historical (metrics.json)
const fmtDay = (s) => fmtDate(new Date(s + "T00:00:00Z"));

const stressDetail = (s) => {
  const [name, type, from, to, pnl, dd, worst] = s;
  const when = type === "Historical" ? `${fmtDay(from)} – ${fmtDay(to)}, replayed on today's portfolio` : "Instant hypothetical shock";
  const vs = pnl < 0 ? ` That is <b>${(Math.abs(pnl) / VAR_TODAY).toFixed(1)}×</b> today's 1-day 99% VaR.` : "";
  $("st-detail").innerHTML = `<b>${name}</b> · ${when}<br>P&amp;L <b>${money(pnl)}</b> (${(pnl / 1e5).toFixed(1).replace("-", "−")}% of $10M) · worst point ${money(dd)} · hardest-hit asset ${worst}.${vs}`;
};

function initStress() {
  const list = $("st-list");
  const maxLoss = Math.max(...STRESS.map((s) => -s[4])), maxGain = Math.max(0, ...STRESS.map((s) => s[4]));
  const zero = maxLoss / (maxLoss + maxGain);
  STRESS.forEach((s) => {
    const li = document.createElement("li");
    li.dataset.type = s[1];
    const w = (Math.abs(s[4]) / (maxLoss + maxGain)) * 100;
    const cls = s[4] > 0 ? "gain" : s[1] === "Hypothetical" ? "hyp" : "";
    const side = s[4] < 0 ? `right:${(1 - zero) * 100}%` : `left:${zero * 100}%`;
    li.innerHTML = `<button type="button"><span class="st-name">${s[0]}</span><span class="st-track"><span class="st-bar ${cls}" style="${side};width:0"></span></span><span class="st-val">${money(s[4])}</span></button>`;
    const btn = li.querySelector("button");
    const show = () => { list.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === btn)); stressDetail(s); };
    btn.addEventListener("mouseenter", show);
    btn.addEventListener("focus", show);
    btn.addEventListener("click", show);
    list.appendChild(li);
    requestAnimationFrame(() => requestAnimationFrame(() => (li.querySelector(".st-bar").style.width = w + "%")));
  });
  $("st-filter").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    setActive($("st-filter"), b);
    list.querySelectorAll("li").forEach((li) => li.classList.toggle("out", b.dataset.type !== "all" && li.dataset.type !== b.dataset.type));
  });

  // Weight vs. share of VaR by asset class (market-risk-engine/reports/metrics.json)
  const MIX = [["Equity", 0.45, 0.8313, "#34d399"], ["Rates", 0.25, 0.0723, "#60a5fa"], ["Credit", 0.15, 0.0477, "#a78bfa"], ["Commodity", 0.08, 0.0312, "#fbbf24"], ["FX", 0.07, 0.0174, "#f472b6"]];
  const bar = (label, idx) => `<div class="mix-row"><p>${label}</p><div class="mix-bar">${MIX.map((m) => `<span data-grow="${m[idx]}" style="flex:0.2 1 0;background:${m[3]}" title="${m[0]}: ${pct(m[idx], 0)}">${m[idx] >= 0.1 ? pct(m[idx], 0) : ""}</span>`).join("")}</div></div>`;
  $("mix").innerHTML = bar("Share of the money", 1) + bar("Share of the 99% VaR", 2) +
    `<div class="mix-legend">${MIX.map((m) => `<span><i style="background:${m[3]}"></i>${m[0]}</span>`).join("")}</div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => $("mix").querySelectorAll("[data-grow]").forEach((s) => (s.style.flexGrow = s.dataset.grow))));
}

// ---------- Demo tabs ----------
const demoInit = { "demo-var": loadVar, "demo-stress": initStress };
const tabs = [...document.querySelectorAll(".demo-tab")];
const tabOpened = {};
const openTab = (tab, focus) => {
  tabs.forEach((t) => {
    const on = t === tab;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    $(t.getAttribute("aria-controls")).hidden = !on;
  });
  if (focus) tab.focus();
  const id = tab.getAttribute("aria-controls");
  if (!tabOpened[id]) { tabOpened[id] = true; if (demoInit[id]) demoInit[id](); }
  if (id === "demo-var") drawVar();
};
tabs.forEach((t, i) => {
  t.addEventListener("click", () => openTab(t));
  t.addEventListener("keydown", (e) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (step) { e.preventDefault(); openTab(tabs[(i + step + tabs.length) % tabs.length], true); }
  });
});
