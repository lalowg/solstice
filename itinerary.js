// SOLSTICE — itinerary state, builder (add / reorder / remove, session-persisted) and the chart of light.
import { DESTINATIONS, byId, LAND, dayLength, fmtHours, money, MONTHS } from './data.js';
import { thumb, skyAt, sunAt, css } from './landscape.js';

const KEY = 'solstice.itinerary.v1';
const DECL = { june: 23.44, december: -23.44 };
const SOL_LABEL = { june: '21 June', december: '21 December' };
const MAX_DAYS = 30;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function createItinerary({ reduced, toast }) {
  let seq = 0;
  const uid = () => 'd' + Date.now().toString(36) + (seq++).toString(36);
  let days = load();
  let sol = 'june';
  const listeners = [];

  function load() {
    try {
      const raw = sessionStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((d) => byId[d.dest] && byId[d.dest].days[d.day]).map((d) => ({ uid: d.uid || uid(), dest: d.dest, day: d.day })) : [];
    } catch (e) { return []; }
  }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(days)); } catch (e) { /* storage unavailable: keep in memory */ } }
  function emit(opts = {}) { save(); listeners.forEach((fn) => fn(days, opts)); }

  const api = {
    get days() { return days; },
    get sol() { return sol; },
    onChange(fn) { listeners.push(fn); },
    setSol(v) { sol = v; emit({ sol: true }); },
    addDay(dest, day, quiet) {
      if (days.length >= MAX_DAYS) { toast(`A draft can hold up to ${MAX_DAYS} days. Remove one to add another.`); return null; }
      const d = { uid: uid(), dest, day };
      days.push(d);
      if (!quiet) { emit({ added: [d.uid] }); toast(`Added “${byId[dest].days[day]}” as day ${days.length}.`, true); }
      return d;
    },
    addDest(id) {
      const dest = byId[id];
      if (!dest) return;
      const added = [];
      for (let i = 0; i < dest.days.length; i++) { const d = api.addDay(id, i, true); if (d) added.push(d.uid); }
      if (!added.length) return;
      emit({ added });
      toast(`${dest.name}: ${added.length} ${added.length === 1 ? 'day' : 'days'} added to your itinerary.`, true);
    },
    move(from, to, focus) {
      if (to < 0 || to >= days.length || from === to) return;
      const [d] = days.splice(from, 1);
      days.splice(to, 0, d);
      emit({ focus, moved: d.uid });
      status(`${byId[d.dest].days[d.day]} is now day ${to + 1} of ${days.length}.`);
    },
    remove(i) {
      const [d] = days.splice(i, 1);
      const next = days[Math.min(i, days.length - 1)];
      emit({ focus: next ? { uid: next.uid, sel: '[data-act="remove"]' } : { empty: true } });
      status(`Removed ${byId[d.dest].days[d.day]}. ${days.length} ${days.length === 1 ? 'day' : 'days'} left.`);
    },
    clear() { days = []; emit({ focus: { empty: true } }); status('Itinerary cleared.'); },
    sample() {
      days = [['douro', 0], ['douro', 2], ['cappadocia', 0], ['cappadocia', 1], ['wadirum', 0], ['wadirum', 1], ['wadirum', 2]].map(([dest, day]) => ({ uid: uid(), dest, day }));
      emit({ added: days.map((d) => d.uid) });
      status('Sample journey loaded: seven days across Portugal, Türkiye and Jordan.');
    },
    daylight(id) { return dayLength(byId[id].lat, DECL[sol]); },
    solLabel() { return SOL_LABEL[sol]; },
  };

  function status(msg) { const el = document.getElementById('days-status'); if (el) { el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 30); } }

  initBuilder(api, reduced);
  initChart(api, reduced);
  return api;
}

/* ---------------- builder ---------------- */
const ICON = {
  up: '<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M6 10V2M2 5.5 6 1.5l4 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  down: '<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M6 2v8M2 6.5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  x: '<svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2 2l8 8M10 2 2 10" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  grip: '<svg viewBox="0 0 12 18" aria-hidden="true" focusable="false"><g fill="currentColor"><circle cx="3" cy="3" r="1.5"/><circle cx="9" cy="3" r="1.5"/><circle cx="3" cy="9" r="1.5"/><circle cx="9" cy="9" r="1.5"/><circle cx="3" cy="15" r="1.5"/><circle cx="9" cy="15" r="1.5"/></g></svg>',
};

function initBuilder(api, reduced) {
  const list = document.getElementById('days');
  const empty = document.getElementById('days-empty');
  const selDest = document.getElementById('add-dest');
  const selDay = document.getElementById('add-day');
  const adder = document.getElementById('adder');
  if (!list) return;

  selDest.innerHTML = DESTINATIONS.map((d) => `<option value="${d.id}">${esc(d.name)}, ${esc(d.country)}</option>`).join('');
  const fillDays = () => { const d = byId[selDest.value]; selDay.innerHTML = d.days.map((t, i) => `<option value="${i}">${esc(t)}</option>`).join(''); };
  selDest.addEventListener('change', fillDays);
  fillDays();
  adder.addEventListener('submit', (e) => {
    e.preventDefault();
    api.addDay(selDest.value, +selDay.value);
  });
  document.getElementById('sample').addEventListener('click', () => api.sample());
  const clearBtn = document.getElementById('clear-days');
  clearBtn.addEventListener('click', () => api.clear());

  function dayHTML(d, i, n) {
    const dest = byId[d.dest];
    const title = dest.days[d.day];
    const no = String(i + 1).padStart(2, '0');
    return `<li class="day" data-uid="${d.uid}">
<button class="day__handle" type="button" data-act="handle" aria-label="Reorder day ${i + 1}, ${esc(title)}. Press the up or down arrow, or drag.">${ICON.grip}</button>
<p class="day__no"><small>Day</small>${no}</p>
<div class="day__thumb">${thumb(dest, 3, '-' + d.uid)}</div>
<div class="day__body"><p class="day__title">${esc(title)}</p><p class="day__where">${esc(dest.name)} · ${esc(dest.country)}</p><p class="day__light">${fmtHours(api.daylight(d.dest))} of daylight on ${api.solLabel()}</p></div>
<div class="day__ctrl">
<button class="icon-btn" type="button" data-act="up" aria-label="Move day ${i + 1} earlier"${i === 0 ? ' disabled' : ''}>${ICON.up}</button>
<button class="icon-btn" type="button" data-act="down" aria-label="Move day ${i + 1} later"${i === n - 1 ? ' disabled' : ''}>${ICON.down}</button>
<button class="icon-btn" type="button" data-act="remove" aria-label="Remove day ${i + 1}, ${esc(title)}">${ICON.x}</button>
</div></li>`;
  }

  function render(days, opts = {}) {
    const before = new Map();
    list.querySelectorAll('.day').forEach((li) => before.set(li.dataset.uid, li.getBoundingClientRect().top));
    list.innerHTML = days.map((d, i) => dayHTML(d, i, days.length)).join('');
    empty.hidden = days.length > 0;
    clearBtn.disabled = days.length === 0;
    const added = new Set(opts.added || []);
    list.querySelectorAll('.day').forEach((li) => {
      const b = before.get(li.dataset.uid);
      if (b === undefined) { if (added.has(li.dataset.uid) && !reduced) li.classList.add('is-new'); return; }
      const dy = b - li.getBoundingClientRect().top;
      if (dy && !reduced && li.animate) li.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.22,.61,.36,1)' });
    });
    if (opts.focus) {
      if (opts.focus.empty) { (days.length ? list.querySelector('.day__handle') : document.getElementById('sample'))?.focus(); }
      else {
        const li = list.querySelector(`[data-uid="${opts.focus.uid}"]`);
        if (li) { const t = li.querySelector(opts.focus.sel); (t && !t.disabled ? t : li.querySelector('.day__handle')).focus(); }
      }
    }
    renderSummary(days);
  }

  function renderSummary(days) {
    const places = [...new Set(days.map((d) => d.dest))];
    const regions = [...new Set(places.map((p) => byId[p].region))];
    document.getElementById('sum-days').textContent = days.length;
    document.getElementById('sum-places').textContent = places.length;
    document.getElementById('sum-regions').textContent = regions.length ? regions.length : '—';
    document.getElementById('sum-sol').textContent = api.solLabel();
    const light = days.reduce((a, d) => a + api.daylight(d.dest), 0);
    document.getElementById('sum-light').textContent = days.length ? `${Math.round(light)} hours` : '—';
    const est = days.reduce((a, d) => a + byId[d.dest].from / byId[d.dest].nights, 0);
    document.getElementById('sum-est').textContent = days.length ? 'From ' + money(Math.round(est / 100) * 100) : '—';
    const strip = document.getElementById('strip');
    strip.innerHTML = days.map((d) => {
      const dest = byId[d.dest];
      const s = skyAt(dest.light), sun = sunAt(dest.light);
      const top = sun.up ? (14 + (1 - sun.elev) * 60).toFixed(0) + '%' : '-20%';
      return `<span style="background:linear-gradient(${css(s.top)},${css(s.mid)} 60%,${css(s.hz)})"><i style="top:${top}"></i></span>`;
    }).join('');
    document.querySelectorAll('[data-count]').forEach((b) => {
      b.textContent = days.length;
      b.classList.remove('is-bump');
      void b.offsetWidth;
      if (days.length) b.classList.add('is-bump');
      setTimeout(() => b.classList.remove('is-bump'), 400);
    });
    const attach = document.getElementById('f-attach');
    const lab = document.getElementById('f-attach-label');
    if (attach && lab) {
      attach.disabled = days.length === 0;
      if (!days.length) attach.checked = false;
      lab.textContent = days.length ? `Attach my itinerary (${days.length} ${days.length === 1 ? 'day' : 'days'}, ${places.length} ${places.length === 1 ? 'place' : 'places'})` : 'Attach my itinerary (add days above first)';
    }
  }

  // clicks
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const li = btn.closest('.day');
    const i = api.days.findIndex((d) => d.uid === li.dataset.uid);
    const act = btn.dataset.act;
    if (act === 'up') api.move(i, i - 1, { uid: li.dataset.uid, sel: '[data-act="up"]' });
    if (act === 'down') api.move(i, i + 1, { uid: li.dataset.uid, sel: '[data-act="down"]' });
    if (act === 'remove') api.remove(i);
  });
  list.addEventListener('keydown', (e) => {
    const h = e.target.closest('.day__handle');
    if (!h || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault();
    const li = h.closest('.day');
    const i = api.days.findIndex((d) => d.uid === li.dataset.uid);
    api.move(i, i + (e.key === 'ArrowUp' ? -1 : 1), { uid: li.dataset.uid, sel: '.day__handle' });
  });

  // drag to reorder (pointer events: mouse, pen and touch)
  let drag = null;
  list.addEventListener('pointerdown', (e) => {
    const h = e.target.closest('.day__handle');
    if (!h || e.button > 0) return;
    const li = h.closest('.day');
    const items = [...list.querySelectorAll('.day')];
    const from = items.indexOf(li);
    const rects = items.map((el) => el.getBoundingClientRect());
    drag = { li, items, from, to: from, startY: e.clientY, rects, h: rects[from].height, id: e.pointerId };
    h.setPointerCapture?.(e.pointerId);
    li.classList.add('is-dragging');
    items.forEach((el) => { if (el !== li) el.style.transition = 'transform .25s cubic-bezier(.22,.61,.36,1)'; });
    e.preventDefault();
  });
  list.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dy = e.clientY - drag.startY;
    drag.li.style.transform = `translateY(${dy}px)`;
    const mid = drag.rects[drag.from].top + drag.h / 2 + dy;
    let to = drag.from;
    drag.rects.forEach((r, j) => {
      if (j < drag.from && mid < r.top + r.height / 2) to = Math.min(to, j);
      if (j > drag.from && mid > r.top + r.height / 2) to = Math.max(to, j);
    });
    drag.to = to;
    drag.items.forEach((el, j) => {
      if (el === drag.li) return;
      let s = 0;
      if (j > drag.from && j <= to) s = -drag.h;
      if (j < drag.from && j >= to) s = drag.h;
      el.style.transform = s ? `translateY(${s}px)` : '';
    });
  });
  const end = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const { from, to, li, items } = drag;
    drag = null;
    li.classList.remove('is-dragging');
    items.forEach((el) => { el.style.transition = ''; if (el !== li) el.style.transform = ''; });
    if (from !== to) api.move(from, to, { uid: li.dataset.uid, sel: '.day__handle' });
    else li.style.transform = '';
  };
  list.addEventListener('pointerup', end);
  list.addEventListener('pointercancel', end);

  api.onChange((days, opts) => render(days, opts));
  render(api.days);
}

/* ---------------- chart of light ---------------- */
const VW = 1000, VH = 389, LAT0 = 80, LAT1 = -60;
const X = (lon) => ((lon + 180) / 360) * VW;
const Y = (lat) => ((LAT0 - lat) / (LAT0 - LAT1)) * VH;

function initChart(api, reduced) {
  const svg = document.getElementById('chart-svg');
  const panel = document.getElementById('chart-panel');
  const scroller = document.getElementById('chart-scroll');
  if (!svg) return;
  let selected = null;

  const bandStops = [];
  for (let lat = LAT0; lat >= LAT1; lat -= 4) bandStops.push(lat);
  let s = `<defs><linearGradient id="dayBand" x1="0" y1="0" x2="0" y2="1">${bandStops.map((lat) => `<stop offset="${((LAT0 - lat) / (LAT0 - LAT1)).toFixed(3)}" stop-color="#E8A15A" stop-opacity="0" data-lat="${lat}"/>`).join('')}</linearGradient></defs>`;
  s += `<rect width="${VW}" height="${VH}" fill="url(#dayBand)"/>`;
  for (let lon = -150; lon <= 150; lon += 30) s += `<line class="grid" x1="${X(lon)}" y1="0" x2="${X(lon)}" y2="${VH}"/>`;
  s += LAND.map((poly) => `<path class="land" d="M${poly.map(([lo, la]) => X(lo).toFixed(1) + ' ' + Y(la).toFixed(1)).join('L')}Z"/>`).join('');
  const lines = [[66.56, 'Arctic Circle'], [23.44, 'Tropic of Cancer'], [0, 'Equator'], [-23.44, 'Tropic of Capricorn']];
  s += lines.map(([lat, name]) => `<line class="lat${lat === 0 ? ' lat--eq' : ''}" x1="0" y1="${Y(lat).toFixed(1)}" x2="${VW}" y2="${Y(lat).toFixed(1)}"/><text class="lat-label" x="8" y="${(Y(lat) - 5).toFixed(1)}">${name}</text>`).join('');
  s += `<g id="band-labels"></g><g id="route"></g><g id="pins"></g>`;
  svg.innerHTML = s;
  const stops = [...svg.querySelectorAll('#dayBand stop')];
  const labels = svg.querySelector('#band-labels');
  const routeG = svg.querySelector('#route');
  const pinsG = svg.querySelector('#pins');

  let cur = stops.map(() => 0), anim = 0;
  function paintBands() {
    const decl = api.sol === 'june' ? 23.44 : -23.44;
    const target = stops.map((st) => Math.pow(dayLength(+st.dataset.lat, decl) / 24, 1.5) * 0.62);
    const from = cur.slice();
    const t0 = performance.now();
    cancelAnimationFrame(anim);
    const step = (now) => {
      const k = reduced ? 1 : Math.min(1, (now - t0) / 700);
      const e = 1 - Math.pow(1 - k, 3);
      cur = from.map((v, i) => v + (target[i] - v) * e);
      stops.forEach((st, i) => st.setAttribute('stop-opacity', cur[i].toFixed(3)));
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
    labels.innerHTML = [70, 50, 30, 0, -30, -50].map((lat) => `<text class="band-label" x="${VW - 8}" y="${(Y(lat) + 3).toFixed(1)}" text-anchor="end">${lat === 0 ? '0°' : Math.abs(lat) + '°' + (lat > 0 ? 'N' : 'S')} · ${fmtHours(dayLength(lat, decl))}</text>`).join('');
  }

  function renderPins(days) {
    const order = new Map();
    days.forEach((d, i) => { if (!order.has(d.dest)) order.set(d.dest, i + 1); });
    pinsG.innerHTML = DESTINATIONS.map((d) => {
      const x = X(d.lon), y = Y(d.lat);
      const right = x > 860;
      const n = order.get(d.id);
      const hrs = fmtHours(api.daylight(d.id));
      return `<g class="pin${n ? ' is-in' : ''}${selected === d.id ? ' is-sel' : ''}" data-id="${d.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(d.name)}, ${esc(d.country)}: ${hrs} of daylight on ${api.solLabel()}${n ? ', in your itinerary' : ''}">
<circle class="pin__hit" r="15"/><circle class="pin__ring" r="9"/><circle class="pin__dot" r="${n ? 5 : 3.6}"/>
<text class="pin__label" x="${right ? -11 : 11}" y="3.5" text-anchor="${right ? 'end' : 'start'}">${esc(d.name)}</text>
${n ? `<circle class="pin__badge" cx="0" cy="-15" r="7"/><text class="pin__badge-t" x="0" y="-12">${n}</text>` : ''}</g>`;
    }).join('');
  }

  function renderRoute(days, animate) {
    const seq = [];
    days.forEach((d) => { if (seq[seq.length - 1] !== d.dest) seq.push(d.dest); });
    if (seq.length < 2) { routeG.innerHTML = ''; return; }
    let d = '';
    for (let i = 0; i < seq.length - 1; i++) {
      const a = byId[seq[i]], b = byId[seq[i + 1]];
      const x1 = X(a.lon), y1 = Y(a.lat), x2 = X(b.lon), y2 = Y(b.lat);
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 - Math.min(110, dist * 0.28);
      d += `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }
    routeG.innerHTML = `<path class="route-glow" d="${d}"/><path class="route" d="${d}"/>`;
    const p = routeG.querySelector('.route');
    if (animate && !reduced && p.getTotalLength) {
      let len = 0;
      try { len = p.getTotalLength(); } catch (e) { len = 0; }
      if (len > 0) {
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
        p.getBoundingClientRect();
        p.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.65,0,.35,1)';
        requestAnimationFrame(() => { p.style.strokeDashoffset = '0'; });
      }
    }
  }

  function renderPanel() {
    if (!selected) return;
    const d = byId[selected];
    const jun = dayLength(d.lat, 23.44), dec = dayLength(d.lat, -23.44);
    const ll = `${Math.abs(d.lat).toFixed(1)}° ${d.lat >= 0 ? 'N' : 'S'} · ${Math.abs(d.lon).toFixed(1)}° ${d.lon >= 0 ? 'E' : 'W'}`;
    const best = d.months.map((m) => MONTHS[m - 1]).join(', ');
    const bar = (label, h) => `<div class="light-bar"><div class="light-bar__row"><span>${label}</span><b>${fmtHours(h)}</b></div><div class="light-bar__track"><div class="light-bar__fill" style="transform:scaleX(${(h / 24).toFixed(3)})"></div></div></div>`;
    panel.innerHTML = `<p class="chart__panel-k">${esc(d.region)}</p><h3>${esc(d.name)}</h3><p class="coords">${esc(d.country)} · ${ll}</p>
<div class="light-bars">${bar('Daylight on 21 June', jun)}${bar('Daylight on 21 December', dec)}</div>
<p class="chart__panel-hint">Best months: ${best}.</p>
<p style="margin-top:18px"><button class="btn btn--sun" type="button" data-add="${d.id}">Add ${d.days.length} days</button></p>`;
  }

  function select(id, focus) {
    selected = id;
    pinsG.querySelectorAll('.pin').forEach((p) => p.classList.toggle('is-sel', p.dataset.id === id));
    renderPanel();
    if (focus) pinsG.querySelector(`[data-id="${id}"]`)?.focus();
  }
  pinsG.addEventListener('click', (e) => { const p = e.target.closest('.pin'); if (p) select(p.dataset.id); });
  pinsG.addEventListener('keydown', (e) => {
    const p = e.target.closest('.pin');
    if (p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(p.dataset.id); }
  });

  document.querySelectorAll('#sol-toggle input').forEach((r) => r.addEventListener('change', () => { if (r.checked) api.setSol(r.value); }));

  let lastSeq = '';
  api.onChange((days, opts) => {
    renderPins(days);
    const seq = days.map((d) => d.dest).join();
    renderRoute(days, seq !== lastSeq);
    lastSeq = seq;
    if (opts.sol) paintBands();
    renderPanel();
  });
  paintBands();
  renderPins(api.days);
  renderRoute(api.days, false);
  lastSeq = api.days.map((d) => d.dest).join();
  // start the small-screen scroller near the first stop (or Europe)
  requestAnimationFrame(() => {
    if (scroller && scroller.scrollWidth > scroller.clientWidth) {
      const first = api.days[0] ? byId[api.days[0].dest] : byId.douro;
      scroller.scrollLeft = Math.max(0, (X(first.lon) / VW) * scroller.scrollWidth - scroller.clientWidth / 2);
    }
  });
}
