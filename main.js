// SOLSTICE — boot: navigation, reveals, destinations, ethos dial, year matrix, enquiry form.
import { DESTINATIONS, byId, SEASONS, MOODS, REGIONS, MONTHS, dayLength, money } from './data.js';
import { thumb } from './landscape.js';
import { initHero } from './hero.js';
import { createItinerary } from './itinerary.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- toast ---------- */
const toastEl = $('#toast');
let toastT = 0;
function toast(msg, link) {
  if (!toastEl) return;
  toastEl.innerHTML = esc(msg) + (link ? ' <a href="#itinerary">View itinerary</a>' : '');
  toastEl.classList.add('is-on');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('is-on'), 4200);
}
toastEl?.addEventListener('click', (e) => { if (e.target.closest('a')) toastEl.classList.remove('is-on'); });

/* ---------- header & menu ---------- */
const hdr = $('.hdr');
const menuBtn = $('.hdr__menu');
const nav = $('#site-nav');
const journey = $('#journey');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  hdr.classList.toggle('is-open', open);
  menuBtn.querySelector('.hdr__menu-label').textContent = open ? 'Close' : 'Menu';
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); } });
function onScrollHdr() {
  const end = journey.offsetTop + journey.offsetHeight - innerHeight - 8;
  hdr.classList.toggle('is-solid', scrollY > end);
}
addEventListener('scroll', onScrollHdr, { passive: true });
addEventListener('resize', onScrollHdr);
onScrollHdr();

/* ---------- itinerary + chart ---------- */
const itin = createItinerary({ reduced, toast });
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-add]');
  if (!b) return;
  itin.addDest(b.dataset.add);
});

/* ---------- hero ---------- */
let hero = null;
try { hero = initHero({ reduced }); } catch (err) { document.documentElement.classList.add('no-stage'); }

/* ---------- destinations ---------- */
const filters = { season: 'any', mood: 'any', region: 'any' };
function chipGroup(host, name, items) {
  host.innerHTML = items.map(([v, label], i) => `<label class="chip"><input type="radio" name="${name}" value="${esc(v)}"${i === 0 ? ' checked' : ''}><span>${esc(label)}</span></label>`).join('');
}
chipGroup($('#f-season'), 'season', [['any', 'Any time'], ...Object.entries(SEASONS).map(([k, s]) => [k, s.label])]);
chipGroup($('#f-mood'), 'mood', [['any', 'Any mood'], ...MOODS.map((m) => [m, m])]);
chipGroup($('#f-region'), 'region', [['any', 'Anywhere'], ...REGIONS.map((r) => [r, r])]);

const dlist = $('#dlist');
dlist.innerHTML = DESTINATIONS.map((d, i) => `<li class="drow" id="dest-${d.id}" data-id="${d.id}">
<span class="drow__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
<div class="drow__thumb">${thumb(d, 3, '-row')}</div>
<div class="drow__text"><h3 class="drow__name">${esc(d.name)}</h3><p class="drow__place">${esc(d.country)} · ${esc(d.region)}</p><p class="drow__line">${esc(d.line)}</p></div>
<div class="drow__facts">
<div class="months" role="img" aria-label="Best months: ${d.months.slice().sort((a, b) => a - b).map((m) => MONTHS[m - 1]).join(', ')}">${MONTHS.map((m, k) => `<span class="${d.months.includes(k + 1) ? 'on' : ''}" aria-hidden="true">${m[0]}</span>`).join('')}</div>
<p class="drow__meta">${d.nights} nights · from ${money(d.from)}<small>per person, illustrative</small></p>
<p class="drow__tags">${d.moods.map((m) => `<span>${esc(m)}</span>`).join('')}</p>
</div>
<button class="btn btn--ink drow__add" type="button" data-add="${d.id}" aria-label="Add ${d.days.length} days in ${esc(d.name)} to your itinerary">Add ${d.days.length} days</button>
</li>`).join('');

function applyFilters() {
  let n = 0;
  $$('.drow', dlist).forEach((row) => {
    const d = byId[row.dataset.id];
    const ok = (filters.season === 'any' || d.months.some((m) => SEASONS[filters.season].months.includes(m)))
      && (filters.mood === 'any' || d.moods.includes(filters.mood))
      && (filters.region === 'any' || d.region === filters.region);
    const was = !row.classList.contains('is-out');
    row.classList.toggle('is-out', !ok);
    row.classList.remove('is-in');
    if (ok && !was && !reduced) { void row.offsetWidth; row.classList.add('is-in'); }
    if (ok) n++;
  });
  $('#dest-count').textContent = n === DESTINATIONS.length ? `Showing all ${n} journeys` : `Showing ${n} of ${DESTINATIONS.length} journeys`;
  $('#dlist-empty').hidden = n > 0;
}
$('#filters').addEventListener('change', (e) => {
  const t = e.target;
  if (t.name in filters) { filters[t.name] = t.value; applyFilters(); }
});
$('#filters').addEventListener('reset', () => {
  setTimeout(() => { filters.season = filters.mood = filters.region = 'any'; applyFilters(); }, 0);
});
$('#filters').addEventListener('submit', (e) => e.preventDefault());

// "The journey" links from the hero cards flash the matching row
function flashRow(id) {
  const row = document.getElementById(id);
  if (!row || !row.classList.contains('drow')) return;
  if (row.classList.contains('is-out')) { $('#filters').reset(); filters.season = filters.mood = filters.region = 'any'; applyFilters(); }
  row.classList.remove('is-flash');
  void row.offsetWidth;
  row.classList.add('is-flash');
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#dest-"]');
  if (a) flashRow(a.getAttribute('href').slice(1));
});

/* ---------- sweep reveals ---------- */
const sweeps = $$('.sweep');
if (reduced || !('IntersectionObserver' in window)) sweeps.forEach((el) => el.classList.add('is-lit'));
else {
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-lit'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -12% 0px' });
  sweeps.forEach((el) => io.observe(el));
}

/* ---------- nav current section ---------- */
const navLinks = $$('.hdr__nav a[href^="#"]');
if ('IntersectionObserver' in window) {
  const secIO = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => { if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => secIO.observe(s));
}

/* ---------- ethos dial ---------- */
(function dial() {
  const LAT = 41.16, DEC = 23.44;
  const C = 200, R = 168;
  const ang = (h) => (h / 24) * 360 + 180;
  const pt = (h, r) => { const a = (ang(h) * Math.PI) / 180; return [C + r * Math.sin(a), C - r * Math.cos(a)]; };
  const dl = dayLength(LAT, DEC);
  const rise = 12 - dl / 2, set = 12 + dl / 2;
  const [x1, y1] = pt(rise, R), [x2, y2] = pt(set, R);
  $('#dial-day').setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)}A${R} ${R} 0 ${dl > 12 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  let t = '';
  for (let h = 0; h < 24; h++) {
    const major = h % 6 === 0;
    const [a1, b1] = pt(h, R - 12), [a2, b2] = pt(h, R - (major ? 26 : 18));
    t += `<line class="tick${major ? ' tick--major' : ''}" x1="${a1.toFixed(1)}" y1="${b1.toFixed(1)}" x2="${a2.toFixed(1)}" y2="${b2.toFixed(1)}"/>`;
    if (major) { const [lx, ly] = pt(h, R - 42); t += `<text class="tick-t" x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}">${String(h).padStart(2, '0')}</text>`; }
  }
  $('#dial-ticks').innerHTML = t;
  const hm = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
  $('#dial-label').textContent = `Sunrise ${hm(rise)} · Sunset ${hm(set)} · solar time`;
  const hand = $('#dial-hand');
  const timeEl = $('#dial-time');
  const sunDot = hand.querySelectorAll('circle');
  let lastAngle = ang(5);
  function setHour(h) {
    let a = ang(h);
    while (a - lastAngle > 180) a -= 360;
    while (a - lastAngle < -180) a += 360;
    lastAngle = a;
    hand.style.transform = `rotate(${a - 360}deg)`;
    timeEl.textContent = hm(h);
    const day = h > rise && h < set;
    sunDot.forEach((c) => c.setAttribute('fill', day ? '#E8A15A' : '#F2E6D8'));
  }
  setHour(5);
  const steps = $$('.step');
  if (!('IntersectionObserver' in window)) { steps.forEach((s) => s.classList.add('is-active')); return; }
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    steps.forEach((s) => s.classList.toggle('is-active', s === en.target));
    setHour(+en.target.dataset.time);
  }), { rootMargin: '-40% 0px -45% 0px' });
  steps.forEach((s) => io.observe(s));
  steps[0].classList.add('is-active');
})();

/* ---------- the year in light ---------- */
(function year() {
  const FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const host = $('#year-months');
  const table = $('#year-table');
  const decl = (m) => 23.44 * Math.sin((2 * Math.PI * (284 + (m - 1) * 30.4 + 15)) / 365);
  host.innerHTML = MONTHS.map((m, i) => {
    const alt = 90 - 40 + decl(i + 1); // noon sun altitude at 40° N
    const y = 14 - ((alt - 26) / 48) * 11;
    return `<button class="mbtn" type="button" data-m="${i + 1}" aria-pressed="false" aria-label="${FULL[i]}"><svg viewBox="0 0 28 16" aria-hidden="true" focusable="false"><path d="M1 15H27" stroke="currentColor" stroke-width=".8" opacity=".5"/><path d="M4 15Q14 ${(y * 2 - 15).toFixed(1)} 24 15" fill="none" stroke="currentColor" stroke-width=".8" stroke-dasharray="1.5 2"/><circle cx="14" cy="${y.toFixed(1)}" r="2.6" fill="#E8A15A"/></svg>${m}</button>`;
  }).join('');
  table.tHead.innerHTML = `<tr><th scope="col"><span class="visually-hidden">Journey</span></th>${MONTHS.map((m, i) => `<th scope="col" data-m="${i + 1}"><abbr title="${FULL[i]}"><span class="m-long">${m}</span><span class="m-short" aria-hidden="true">${m[0]}</span></abbr></th>`).join('')}</tr>`;
  table.tBodies[0].innerHTML = DESTINATIONS.map((d) => `<tr data-id="${d.id}"><th scope="row">${esc(d.name)}</th>${MONTHS.map((m, i) => {
    const on = d.months.includes(i + 1);
    return `<td data-m="${i + 1}"><span class="sun-dot${on ? ' on' : ''}" aria-hidden="true"></span>${on ? '<span class="visually-hidden">Recommended</span>' : ''}</td>`;
  }).join('')}</tr>`).join('');
  function pick(m) {
    $$('.mbtn', host).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.m === m)));
    $$('[data-m]', table).forEach((c) => c.classList.toggle('is-col', +c.dataset.m === m));
    const best = [];
    $$('tbody tr', table).forEach((tr) => { const ok = byId[tr.dataset.id].months.includes(m); tr.classList.toggle('is-dim', !ok); if (ok) best.push(byId[tr.dataset.id].name); });
    const list = best.length > 1 ? best.slice(0, -1).join(', ') + ' and ' + best[best.length - 1] : best[0];
    $('#year-summary').textContent = best.length ? `In ${FULL[m - 1]}, ${best.length} ${best.length === 1 ? 'journey is' : 'journeys are'} at their best: ${list}.` : `No journey is at its best in ${FULL[m - 1]}.`;
  }
  host.addEventListener('click', (e) => { const b = e.target.closest('.mbtn'); if (b) pick(+b.dataset.m); });
  pick(new Date().getMonth() + 1);
})();

/* ---------- enquiry form ---------- */
(function form() {
  const f = $('#enquiry');
  if (!f) return;
  const F = (k) => f.elements[k];
  const FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  const sel = $('#f-month');
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const o = document.createElement('option');
    o.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    o.textContent = `${FULL[d.getMonth()]} ${d.getFullYear()}`;
    sel.appendChild(o);
  }
  const notes = $('#f-notes'), count = $('#f-notes-count');
  notes.addEventListener('input', () => { count.textContent = `${notes.value.length} / 600`; });
  const rules = {
    name: () => (F('name').value.trim().length >= 2 ? '' : 'Please tell us your name.'),
    email: () => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(F('email').value.trim()) ? '' : 'Please enter an email address like name@example.com.'),
    month: () => (F('month').value ? '' : 'Choose the month you would like to travel.'),
    people: () => { const v = F('people').value.trim(); return /^\d+$/.test(v) && +v >= 1 && +v <= 12 ? '' : 'Travellers must be a whole number from 1 to 12.'; },
    pace: () => (f.querySelector('input[name="pace"]:checked') ? '' : 'Choose the pace that suits you.'),
  };
  const errEl = { name: '#f-name-err', email: '#f-email-err', month: '#f-month-err', people: '#f-people-err', pace: '#f-pace-err' };
  let tried = false;
  function check(k) {
    const msg = rules[k]();
    const el = $(errEl[k]);
    el.textContent = msg;
    const field = el.closest('.field');
    field.classList.toggle('is-invalid', !!msg);
    const inputs = k === 'pace' ? $$('input[name="pace"]', f) : [F(k)];
    inputs.forEach((i) => { if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); });
    return !msg;
  }
  ['name', 'email', 'month', 'people'].forEach((k) => {
    F(k).addEventListener('blur', () => { if (tried) check(k); });
    F(k).addEventListener('input', () => { if (tried) check(k); });
  });
  $$('input[name="pace"]', f).forEach((r) => r.addEventListener('change', () => { if (tried) check('pace'); }));
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    tried = true;
    const keys = Object.keys(rules);
    const bad = keys.filter((k) => !check(k));
    const done = $('#enq-done');
    if (bad.length) {
      done.hidden = true;
      const first = bad[0] === 'pace' ? f.querySelector('input[name="pace"]') : F(bad[0]);
      first.focus();
      return;
    }
    const n = itin.days.length;
    const attach = $('#f-attach').checked && n > 0;
    const people = +F('people').value;
    const month = sel.options[sel.selectedIndex].textContent;
    done.innerHTML = `<h3>Thank you, ${esc(F('name').value.trim().split(' ')[0])}.</h3><p>This is a portfolio demo, so your request was <strong>not sent</strong> and nothing has been booked or held.</p><p>In a real studio, a journey designer would now sketch a ${esc(f.querySelector('input[name="pace"]:checked').value)} journey for ${people} ${people === 1 ? 'traveller' : 'travellers'} in ${esc(month)}${attach ? `, starting from your ${n}-day itinerary` : ''}.</p>`;
    done.hidden = false;
    done.focus();
  });
})();

/* ---------- restore hash targets rendered by script ---------- */
if (location.hash && location.hash.length > 1) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) requestAnimationFrame(() => { target.scrollIntoView({ block: 'start' }); if (target.classList.contains('drow')) flashRow(target.id); });
}

window.solsticeReady = true;
void hero;
