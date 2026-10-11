// SOLSTICE — procedural SVG landscapes. Every horizon on the site is drawn here.
export const W = 1600, H = 1000, HZ = 640;

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;

export function rng(seed) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function noise(seed) {
  const r = rng(seed);
  const v = Array.from({ length: 512 }, () => r());
  const one = (x) => {
    const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f);
    const a = v[i & 511], b = v[(i + 1) & 511];
    return a + (b - a) * s;
  };
  return (x, oct = 4) => {
    let amp = 1, fr = 1, sum = 0, norm = 0;
    for (let o = 0; o < oct; o++) { sum += one(x * fr + o * 37.17) * amp; norm += amp; amp *= 0.5; fr *= 2.03; }
    return sum / norm;
  };
}

/* ---------- colour ---------- */
export const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const css = (c, a) => a === undefined
  ? `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`
  : `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;

// Sky over one day: [t, top, mid, horizon, sun]
const SKY = [
  [0.00, '#160f14', '#3a2430', '#8e4c52', '#c9706a'],
  [0.10, '#3a2838', '#a65a5e', '#f0b48a', '#f6c79a'],
  [0.30, '#7d8794', '#cdbfb0', '#f2e6d8', '#fff1dc'],
  [0.50, '#b9a68a', '#e6d2b4', '#f6eadb', '#fffaf0'],
  [0.70, '#6e4034', '#cf7c52', '#f2ad62', '#ffd08a'],
  [0.86, '#2a1c28', '#74394a', '#c9706a', '#e8a15a'],
  [0.97, '#0d090b', '#1c1417', '#3a2526', '#c9706a'],
  [1.00, '#0b0809', '#18110f', '#2e1f1f', '#c9706a'],
].map(([t, ...c]) => [t, ...c.map(hex)]);

export function skyAt(t) {
  t = clamp(t);
  let i = 0;
  while (i < SKY.length - 2 && t > SKY[i + 1][0]) i++;
  const a = SKY[i], b = SKY[i + 1];
  const k = smooth(0, 1, (t - a[0]) / (b[0] - a[0] || 1));
  return { top: mix(a[1], b[1], k), mid: mix(a[2], b[2], k), hz: mix(a[3], b[3], k), sun: mix(a[4], b[4], k) };
}

export function sunAt(t) {
  const q = clamp((t - 0.04) / 0.84);
  const e = Math.sin(Math.PI * q);
  return { q, elev: e * e, up: q > 0 && q < 1 };
}

/* ---------- profiles: height 0..1 at x ---------- */
function towers(r, count, x0, x1, wMin, wMax, hMin, hMax) {
  const list = [];
  for (let i = 0; i < count; i++) list.push({ cx: lerp(x0, x1, (i + 0.15 + r() * 0.7) / count), w: lerp(wMin, wMax, r()), h: lerp(hMin, hMax, r()) });
  return list;
}

export function profile(type, seed, layer = 0) {
  const n = noise(seed * 13 + layer * 101 + 7);
  const r = rng(seed * 31 + layer * 17 + 3);
  switch (type) {
    case 'fjord': return (x) => { const a = 1 - Math.abs(2 * n(x / 300, 4) - 1); return Math.pow(a, 2.4) * 0.95 + n(x / 70, 2) * 0.06; };
    case 'lake': return (x) => { const a = 1 - Math.abs(2 * n(x / 380, 4) - 1); return Math.pow(a, 1.8) * 0.85 + 0.1; };
    case 'terraces': return (x) => 0.2 + 0.8 * n(x / 520, 3);
    case 'forest': return (x) => 0.25 + 0.65 * n(x / 560, 2) + 0.035 * Math.abs(Math.sin(x * 0.33 + n(x / 9, 1) * 6));
    case 'mesa': return (x) => { const v = n(x / 380, 3); return smooth(0.4, 0.47, v) * 0.75 + smooth(0.6, 0.64, v) * 0.25 + n(x / 30, 2) * 0.05; };
    case 'dunes': return (x) => { const s = ((x / 560 + n(x / 900, 2) * 0.9) % 1 + 1) % 1; return (s < 0.62 ? Math.pow(s / 0.62, 1.7) : Math.pow((1 - s) / 0.38, 0.75)) * (0.6 + 0.4 * n(x / 700, 2)); };
    case 'valley': return (x) => { const v = Math.abs(x - 800) / 800; const a = 1 - Math.abs(2 * n(x / 260, 4) - 1); return 0.15 + 0.55 * Math.pow(v, 1.1) + 0.3 * a; };
    case 'cliffs': {
      const isl = towers(r, 3, -100, 1700, 220, 420, 0.45, 0.8);
      return (x) => { let h = 0; for (const t of isl) { const d = (x - t.cx) / t.w; if (Math.abs(d) < 1) h = Math.max(h, t.h * (d > 0.7 ? clamp((1 - d) / 0.3) : 1) * (0.85 + 0.15 * n(x / 50, 2))); } return h; };
    }
    case 'karst': {
      const tw = towers(r, 9, -150, 1750, 40, 95, 0.35, 1);
      return (x) => { let h = 0.02; for (const t of tw) { const d = Math.abs(x - t.cx) / t.w; if (d < 1) h = Math.max(h, t.h * Math.pow(1 - Math.pow(d, 4), 0.28) * (0.93 + 0.07 * n(x / 18, 2))); } return h; };
    }
    case 'chimneys': {
      const tw = towers(r, 11, -150, 1750, 16, 34, 0.35, 1);
      return (x) => { let h = 0.18 + 0.2 * n(x / 500, 3); for (const t of tw) { const d = Math.abs(x - t.cx) / t.w; if (d < 1) h = Math.max(h, 0.18 + t.h * 0.82 * Math.pow(1 - Math.pow(d, 2.6), 0.55)); } return h; };
    }
    case 'saltflat': return (x) => { const range = 0.18 + 0.22 * n(x / 300, 4); const c = Math.max(0, 1 - Math.abs(x - 1020) / 380); return Math.max(range, Math.pow(c, 1.25) * 0.95); };
    default: return (x) => n(x / 400, 3);
  }
}

export function ridge(fn, base, amp, { x0 = -240, x1 = 1840, step = 8, bottom = H + 60 } = {}) {
  let d = `M${x0} ${bottom}`;
  for (let x = x0; x <= x1; x += step) d += `L${x} ${(base - amp * fn(x)).toFixed(1)}`;
  return d + `L${x1} ${bottom}Z`;
}

const pathOf = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');

/* ---------- reusable details ---------- */
function balloon(x, y, s, c1, c2, rise) {
  return `<g class="balloon" data-rise="${rise}" transform="translate(${x} ${y}) scale(${s})"><g class="balloon__bob">
<path d="M0 -60C34 -60 46 -30 40 -6C36 10 18 22 10 30H-10C-18 22 -36 10 -40 -6C-46 -30 -34 -60 0 -60Z" fill="${c1}"/>
<path d="M0 -60C14 -50 16 0 6 30H-6C-16 0 -14 -50 0 -60Z" fill="${c2}"/>
<path d="M0 -60C-24 -56 -32 -20 -22 18L-16 24C-26 -10 -20 -48 0 -60Z" fill="${c2}" opacity=".55"/>
<path d="M0 -60C24 -56 32 -20 22 18L16 24C26 -10 20 -48 0 -60Z" fill="#1A1410" opacity=".22"/>
<path d="M-10 30L-5 38M10 30L5 38" stroke="#1A1410" stroke-width="1"/><rect x="-6" y="38" width="12" height="8" rx="1" fill="#2b1d16"/>
<ellipse cx="-16" cy="-30" rx="7" ry="18" fill="#fff6e8" opacity=".18"/></g></g>`;
}

function cabin(x, y, w, h, flip) {
  const roof = h * 0.55;
  const win = (wx) => `<rect class="lamp" x="${(x + wx).toFixed(1)}" y="${(y - h * 0.62).toFixed(1)}" width="${(w * 0.12).toFixed(1)}" height="${(h * 0.24).toFixed(1)}" fill="#ffc77a"/>`;
  let s = `<g class="cabin">`;
  s += `<path d="M${x} ${y}V${y + 52}M${x + w * 0.35} ${y}V${y + 50}M${x + w * 0.7} ${y}V${y + 52}M${x + w} ${y}V${y + 50}" stroke="#1A1410" stroke-width="3"/>`;
  s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#8a3229"/>`;
  s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="url(#cabinShade)"/>`;
  s += `<path d="M${x - 6} ${y - h}L${x + w / 2} ${y - h - roof}L${x + w + 6} ${y - h}Z" fill="#1d1513"/>`;
  s += win(flip ? w * 0.18 : w * 0.62) + win(flip ? w * 0.62 : w * 0.18);
  s += `<rect x="${x}" y="${y + 56}" width="${w}" height="${h * 0.7}" fill="#8a3229" opacity=".22"/>`;
  return s + `</g>`;
}

function tent(x, y, s) {
  return `<path d="M${x - 34 * s} ${y}L${x} ${y - 30 * s}L${x + 34 * s} ${y}Z" fill="#1a1210"/><path d="M${x} ${y - 30 * s}L${x + 34 * s} ${y}H${x + 12 * s}Z" fill="#2c1d16"/>`;
}

function flamingo(x, y, s, flip) {
  const f = flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${f * s} ${s})" fill="#C9706A" stroke="#C9706A"><ellipse cx="0" cy="-30" rx="11" ry="6"/><path d="M8 -32C14 -40 10 -52 14 -58" fill="none" stroke-width="2.4"/><path d="M14 -58L20 -56" stroke-width="3"/><path d="M-1 -25V0M2 -25L6 -12L1 0" fill="none" stroke-width="1.2"/></g>`;
}

/* ---------- hero scenes ---------- */
// Each layer: <g class="ly" data-d="depth">; tone targets carry data-k (mix toward the scene's dark).
const tone = (d, k, extra = '') => `<path class="tn" data-k="${k}" d="${d}"${extra}/>`;
const rim = (d) => `<path class="rim" d="${d}"/>`;

export const SCENES = [
  { id: 'cappadocia', dark: '#3a2320', build: sceneCappadocia },
  { id: 'douro', dark: '#272818', build: sceneDouro },
  { id: 'wadirum', dark: '#6b2c1a', build: sceneWadiRum },
  { id: 'lofoten', dark: '#1b1d23', build: sceneLofoten },
  { id: 'atacama', dark: '#191315', build: sceneAtacama },
];

function sceneCappadocia() {
  const nF = profile('saltflat', 3, 0);
  const far = ridge((x) => { const c = Math.max(0, 1 - Math.abs(x - 1250) / 300); return Math.max(0.12 + 0.1 * nF(x), Math.pow(c, 1.15)); }, HZ - 10, 330);
  const cap = `M1250 ${HZ - 10 - 330 + 6}L1300 ${HZ - 10 - 330 * 0.83}L1284 ${HZ - 285}L1268 ${HZ - 296}L1250 ${HZ - 280}L1232 ${HZ - 294}L1214 ${HZ - 283}L1200 ${HZ - 10 - 330 * 0.83}Z`;
  const mid = ridge(profile('mesa', 5, 1), HZ + 40, 110);
  const near = ridge(profile('chimneys', 8, 2), HZ + 170, 330);
  const fore = ridge(profile('chimneys', 12, 3), H - 60, 190);
  // cave windows on the chimney layer
  const r = rng(91); let caves = '';
  const fn = profile('chimneys', 8, 2);
  for (let i = 0; i < 26; i++) {
    const x = 60 + r() * 1480, top = HZ + 170 - 330 * fn(x);
    if (HZ + 170 - top < 120) continue;
    const y = top + 30 + r() * (HZ + 120 - top);
    caves += `<path class="${r() > 0.6 ? 'lamp' : 'cave'}" d="M${x.toFixed(0)} ${y.toFixed(0)}v-7a4 4 0 0 1 8 0v7z" fill="${r() > 0.6 ? '#ffc77a' : '#120c0a'}"/>`;
  }
  const pal = [['#C9706A', '#E8A15A'], ['#E8A15A', '#F2E6D8'], ['#9b4a3f', '#C9706A'], ['#F2E6D8', '#C9706A'], ['#E8A15A', '#9b4a3f']];
  const B = [[330, 300, 0.7], [520, 180, 0.45], [760, 420, 0.32], [980, 250, 0.55], [1180, 140, 0.38], [1400, 380, 0.8], [640, 520, 0.24], [1080, 520, 0.28], [220, 520, 0.3]];
  const balloons = B.map(([x, y, s], i) => balloon(x, y, s * 1.6, pal[i % 5][0], pal[i % 5][1], s.toFixed(2))).join('');
  return {
    back: `<g class="ly" data-d="0.15">${tone(far, 0.3)}<path d="${cap}" fill="#F2E6D8" opacity=".55"/></g><rect class="haze" x="-240" y="${HZ - 260}" width="2080" height="320"/><g class="ly" data-d="0.3">${tone(mid, 0.5)}${rim(mid)}</g><g class="ly balloons" data-d="0.4">${balloons}</g>`,
    front: `<g class="ly" data-d="0.65">${tone(near, 0.72)}${rim(near)}${caves}</g><g class="ly" data-d="1">${tone(fore, 0.92)}${rim(fore)}</g>`,
  };
}

function sceneDouro() {
  const far = ridge(profile('forest', 21, 0), HZ - 20, 200);
  const mid = ridge(profile('terraces', 22, 1), HZ + 40, 170);
  const n = noise(23);
  const slopeFn = (x) => { const v = HZ + 300 - 360 * smooth(150, 1500, x) - 40 * n(x / 200, 3); return Math.round(v / 20) * 20 + 6 * n(x / 30, 2); };
  let slope = `M-240 ${H + 60}`;
  for (let x = -240; x <= 1840; x += 8) slope += `L${x} ${slopeFn(x).toFixed(1)}`;
  slope += `L1840 ${H + 60}Z`;
  let lines = '';
  for (let k = 1; k < 13; k++) {
    let d = '';
    for (let x = -240; x <= 1840; x += 24) d += (x === -240 ? 'M' : 'L') + x + ' ' + (slopeFn(x) + k * 22).toFixed(1);
    lines += `<path class="ln" data-k="0.95" d="${d}"/>`;
  }
  const river = (() => {
    const top = [], bot = [];
    for (let x = -240; x <= 1840; x += 20) {
      const c = HZ + 150 + Math.sin(x / 260) * 26 + (x / 1600) * -10;
      const w = 10 + (x / 1600) * 18;
      top.push([x, c - w]); bot.unshift([x, c + w]);
    }
    return pathOf(top.concat(bot)) + 'Z';
  })();
  const vines = (() => {
    const fn = (x) => H - 40 - 180 * Math.pow(clamp(1 - (x + 240) / 1100), 1.4);
    let hill = `M-240 ${H + 60}`; for (let x = -240; x <= 900; x += 10) hill += `L${x} ${fn(x).toFixed(1)}`; hill += `L900 ${H + 60}Z`;
    let rows = '';
    for (let rI = 0; rI < 7; rI++) {
      let d = '';
      for (let x = -200; x < 860; x += 14 + rI * 2) { const y = fn(x) + 16 + rI * 22; if (y < H + 20) d += `M${x} ${y.toFixed(0)}v-${6 + rI}`; }
      rows += `<path class="ln vine" data-k="0.55" d="${d}"/>`;
    }
    return { hill, rows };
  })();
  const quinta = `<g><rect x="1110" y="${slopeFn(1150) - 44}" width="86" height="44" fill="#F2E6D8"/><path d="M1102 ${slopeFn(1150) - 44}L1153 ${slopeFn(1150) - 70}L1204 ${slopeFn(1150) - 44}Z" fill="#a4553c"/><rect class="lamp" x="1128" y="${slopeFn(1150) - 32}" width="8" height="12" fill="#ffc77a"/><rect class="lamp" x="1166" y="${slopeFn(1150) - 32}" width="8" height="12" fill="#ffc77a"/></g>`;
  return {
    back: `<g class="ly" data-d="0.15">${tone(far, 0.28)}</g><rect class="haze" x="-240" y="${HZ - 200}" width="2080" height="300"/><g class="ly" data-d="0.3">${tone(mid, 0.45)}${rim(mid)}</g><rect class="mist" x="-240" y="${HZ - 10}" width="2080" height="140"/>`,
    front: `<g class="ly" data-d="0.55"><path class="wt" d="${river}"/></g><g class="ly" data-d="0.7">${tone(slope, 0.72)}${rim(slope)}<g clip-path="url(#clipDouro)">${lines}</g>${quinta}</g><clipPath id="clipDouro"><path d="${slope}"/></clipPath><g class="ly" data-d="1">${tone(vines.hill, 0.9)}${rim(vines.hill)}${vines.rows}</g>`,
  };
}

function sceneWadiRum() {
  const far = ridge(profile('mesa', 31, 0), HZ - 10, 170);
  const n = noise(32);
  const massif = (x) => {
    const a = Math.max(0, 1 - Math.pow(Math.abs(x - 260) / 420, 6));
    const b = Math.max(0, 1 - Math.pow(Math.abs(x - 1380) / 360, 6));
    const dome = (v, c, w) => v * (0.82 + 0.18 * Math.cos(clamp(Math.abs(x - c) / w) * Math.PI / 2));
    return Math.max(dome(a, 260, 420), dome(b, 1380, 360) * 0.9) * (0.9 + 0.1 * n(x / 40, 3));
  };
  const mid = ridge(massif, HZ + 60, 400, { step: 6 });
  let flutes = '';
  const r = rng(33);
  for (let i = 0; i < 70; i++) {
    const x = r() * 1840 - 120, top = HZ + 60 - 400 * massif(x);
    if (HZ + 60 - top < 60) continue;
    flutes += `M${x.toFixed(0)} ${(top + 8 + r() * 20).toFixed(0)}V${(HZ + 40 - r() * 60).toFixed(0)}`;
  }
  const dunes = ridge(profile('dunes', 34, 2), H - 210, 120);
  const fore = ridge(profile('dunes', 35, 3), H - 70, 90);
  const fy = H - 70 - 90 * profile('dunes', 35, 3)(1080);
  const camp = tent(1000, fy + 6, 1.2) + tent(1090, fy + 10, 0.9) + tent(1180, fy + 8, 1.05) + `<circle class="lamp" cx="1050" cy="${fy + 2}" r="22" fill="url(#fireGlow)"/><circle class="lamp" cx="1050" cy="${fy + 2}" r="3" fill="#ffd08a"/>`;
  return {
    back: `<g class="ly" data-d="0.15">${tone(far, 0.3)}</g><rect class="haze" x="-240" y="${HZ - 220}" width="2080" height="300"/><g class="ly" data-d="0.35">${tone(mid, 0.55)}${rim(mid)}<path class="ln" data-k="0.75" d="${flutes}" stroke-width="2"/></g>`,
    front: `<g class="ly" data-d="0.7">${tone(dunes, 0.68)}${rim(dunes)}</g><g class="ly" data-d="1">${tone(fore, 0.86)}${rim(fore)}${camp}</g>`,
  };
}

function sceneLofoten() {
  const fnF = profile('fjord', 41, 0);
  const shape = (x) => fnF(x) * (0.55 + 0.45 * Math.min(1, Math.abs(x - 820) / 600));
  const far = ridge(shape, HZ, 380, { step: 6, bottom: HZ });
  const farFill = far.replace(/Z$/, '') + 'Z';
  const reflect = `<g transform="translate(0 ${2 * HZ}) scale(1 -1)" opacity=".32">${tone(farFill, 0.4)}</g>`;
  const isl = profile('fjord', 43, 2);
  const islandFn = (x) => (x < 700 ? isl(x) * Math.pow(clamp(1 - x / 700), 0.5) : 0);
  let island = `M-240 ${HZ + 80}`; for (let x = -240; x <= 720; x += 6) island += `L${x} ${(HZ + 80 - 300 * islandFn(x)).toFixed(1)}`; island += `L720 ${HZ + 80}Z`;
  const nS = noise(44);
  const shore = ridge((x) => 0.2 + 0.5 * nS(x / 160, 3) * clamp(1 - Math.abs(x - 300) / 900), H - 50, 110);
  const cabins = cabin(880, H - 190, 74, 46, false) + cabin(980, H - 176, 92, 54, true) + cabin(1110, H - 186, 70, 44, false) + cabin(1210, H - 172, 86, 52, true)
    + `<path d="M860 ${H - 132}H1320" stroke="#1A1410" stroke-width="4"/>`;
  let glint = '<g class="glint">';
  for (let i = 0; i < 18; i++) { const y = HZ + 8 + i * i * 1.1; const w = 6 + i * 4; glint += `<rect x="${-w / 2}" y="${y.toFixed(1)}" width="${w}" height="2" rx="1"/>`; }
  glint += '</g>';
  return {
    back: `<rect class="wt" x="-240" y="${HZ}" width="2080" height="${H - HZ + 60}"/><rect x="-240" y="${HZ}" width="2080" height="${H - HZ + 60}" fill="url(#waterShade)"/>${reflect}<g class="ly" data-d="0.12">${tone(farFill, 0.4)}${rim(farFill)}</g>${glint}<rect class="haze" x="-240" y="${HZ - 240}" width="2080" height="250"/>`,
    front: `<g class="ly" data-d="0.5">${tone(island, 0.66)}${rim(island)}<g transform="translate(0 ${2 * HZ + 160}) scale(1 -1)" opacity=".25">${tone(island, 0.7)}</g></g><g class="ly" data-d="1">${tone(shore, 0.9)}${rim(shore)}${cabins}</g>`,
  };
}

function sceneAtacama() {
  const fn = profile('saltflat', 51, 0);
  const shape = (x) => Math.max(fn(x), Math.pow(Math.max(0, 1 - Math.abs(x - 1380) / 230), 1.3) * 0.62);
  const far = ridge(shape, HZ, 420, { step: 6, bottom: HZ });
  const reflect = `<g transform="translate(0 ${2 * HZ}) scale(1 -1)" opacity=".42">${tone(far, 0.45)}</g>`;
  const r = rng(52);
  let crust = '';
  for (let row = 0; row < 9; row++) {
    const y = HZ + 26 + Math.pow(row, 1.75) * 13;
    let x = -240;
    while (x < 1840) { const len = 40 + r() * (90 + row * 40); crust += `M${x.toFixed(0)} ${(y + (r() - 0.5) * row * 3).toFixed(0)}L${(x + len).toFixed(0)} ${(y + (r() - 0.5) * row * 4).toFixed(0)}`; x += len + 6 + r() * 40; }
    for (let k = 0; k < 8 + row * 2; k++) { const cx = r() * 1840 - 120; crust += `M${cx.toFixed(0)} ${y.toFixed(0)}l${((r() - 0.5) * 40).toFixed(0)} ${(10 + row * 6).toFixed(0)}`; }
  }
  const nE = noise(53);
  const edge = ridge((x) => Math.pow(Math.abs(x - 800) / 800, 2.6) * (0.7 + 0.3 * nE(x / 60, 3)), H - 30, 240);
  const birds = flamingo(470, HZ + 34, 0.9, false) + flamingo(520, HZ + 40, 0.75, true) + flamingo(560, HZ + 32, 0.85, false);
  return {
    back: `<rect class="wt" x="-240" y="${HZ}" width="2080" height="${H - HZ + 60}"/><rect x="-240" y="${HZ}" width="2080" height="${H - HZ + 60}" fill="url(#waterShade)"/>${reflect}<g class="ly" data-d="0.1">${tone(far, 0.45)}${rim(far)}</g><rect class="haze" x="-240" y="${HZ - 200}" width="2080" height="210"/><g class="ly" data-d="0.3">${birds}</g>`,
    front: `<g class="ly" data-d="0.6"><path class="ln crust" data-k="0.25" d="${crust}"/></g><g class="ly" data-d="1">${tone(edge, 0.95)}${rim(edge)}</g>`,
  };
}

/* ---------- thumbnails (index list, cards) ---------- */
const WATER = new Set(['fjord', 'saltflat', 'lake', 'karst', 'cliffs']);
export function thumb(dest, seed = 1, uid = '') {
  const s = skyAt(dest.light);
  const dark = hex('#1A1410');
  const id = 'th-' + dest.id + uid;
  const t = dest.light;
  const sun = sunAt(t);
  const sx = 40 + sun.q * 240, sy = 118 - sun.elev * 90;
  const fns = [0, 1, 2].map((l) => profile(dest.type, seed + l * 3, l));
  const hz = 118;
  const water = WATER.has(dest.type);
  const sample = (l, base, amp, k, bottom) => {
    let d = `M-10 ${bottom}`;
    for (let x = -10; x <= 330; x += 4) d += `L${x} ${(base - amp * fns[l](x * 5)).toFixed(1)}`;
    return `<path d="${d}L330 ${bottom}Z" fill="${css(mix(s.hz, dark, k))}"/>`;
  };
  let g = `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${css(s.top)}"/><stop offset=".55" stop-color="${css(s.mid)}"/><stop offset="1" stop-color="${css(s.hz)}"/></linearGradient></defs>`;
  g += `<rect width="320" height="180" fill="url(#${id})"/>`;
  if (t > 0.85) { const r = rng(seed + 9); for (let i = 0; i < 30; i++) g += `<circle cx="${(r() * 320).toFixed(0)}" cy="${(r() * 90).toFixed(0)}" r="${(0.4 + r() * 0.8).toFixed(1)}" fill="#F2E6D8" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`; }
  if (sun.up) g += `<circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="26" fill="${css(s.sun, 0.25)}"/><circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="9" fill="${css(s.sun)}"/>`;
  g += sample(0, hz, 70, 0.35, water ? hz : 200);
  if (water) {
    g += `<rect y="${hz}" width="320" height="62" fill="${css(mix(mix(s.top, s.hz, 0.5), dark, 0.25))}"/>`;
    g += `<g transform="translate(0 ${2 * hz}) scale(1 -1)" opacity=".3">${sample(0, hz, 70, 0.35, hz)}</g>`;
    g += sample(2, 196, 40, 0.88, 200);
  } else {
    g += sample(1, 150, 60, 0.6, 200) + sample(2, 186, 50, 0.88, 200);
  }
  return g + '</svg>';
}
