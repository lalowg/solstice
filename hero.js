// SOLSTICE — the day: a sticky stage scrubbed by scroll, dawn → night across five chapters.
import { SCENES, skyAt, sunAt, css, mix, hex, smooth, clamp, rng, HZ } from './landscape.js';

const NS = 'http://www.w3.org/2000/svg';
// p → minutes since midnight (chapter centres match the clocks on the cards)
const CLOCK = [[0, 290], [0.1, 320], [0.3, 520], [0.5, 750], [0.7, 1090], [0.9, 1300], [1, 1350]];

function clockAt(p) {
  let i = 0;
  while (i < CLOCK.length - 2 && p > CLOCK[i + 1][0]) i++;
  const [p0, m0] = CLOCK[i], [p1, m1] = CLOCK[i + 1];
  const m = m0 + (m1 - m0) * clamp((p - p0) / (p1 - p0));
  const h = Math.floor(m / 60), mm = Math.floor(m % 60);
  return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

export function initHero({ reduced, onChapter }) {
  const section = document.getElementById('journey');
  const stage = document.getElementById('stage');
  const backHost = document.getElementById('scenes-back');
  const frontHost = document.getElementById('scenes-front');
  if (!section || !stage || !backHost || !frontHost) return null;
  const N = SCENES.length;

  const $ = (id) => document.getElementById(id);
  const stops = { s0: $('sky0'), s1: $('sky1'), s2: $('sky2'), g0: $('glow0'), g1: $('glow1'), h0: $('haze0'), h1: $('haze1') };
  const sunG = $('sun'), sunDisc = $('sun-disc'), starsG = $('stars');
  const titles = [...stage.querySelectorAll('.title')];
  const cards = [...stage.querySelectorAll('.card')];
  const ticks = [...stage.querySelectorAll('[data-chapter]')];
  const intro = stage.querySelector('.intro');
  const clockEl = $('clock'), fill = $('day-fill'), daySun = $('day-sun');

  // build scenes
  const scenes = [];
  backHost.textContent = '';
  frontHost.textContent = '';
  for (const def of SCENES) {
    const o = def.build();
    const gb = document.createElementNS(NS, 'g');
    const gf = document.createElementNS(NS, 'g');
    gb.setAttribute('class', 'scene');
    gf.setAttribute('class', 'scene');
    gb.innerHTML = o.back;
    gf.innerHTML = o.front;
    backHost.appendChild(gb);
    frontHost.appendChild(gf);
    const all = (sel) => [...gb.querySelectorAll(sel), ...gf.querySelectorAll(sel)];
    scenes.push({
      gb, gf, dark: hex(def.dark), shown: true,
      layers: all('.ly').map((el) => ({ el, d: +el.dataset.d })),
      tones: all('[data-k]').map((el) => ({ el, k: +el.dataset.k, stroke: el.classList.contains('ln') })),
      rims: all('.rim'), lamps: all('.lamp'), waters: all('.wt'),
      glint: gb.querySelector('.glint'),
      balloons: [...gb.querySelectorAll('.balloon')].map((el) => ({ el, base: el.getAttribute('transform'), s: +el.dataset.rise })),
    });
  }

  // stars
  const r = rng(77);
  let st = '';
  for (let i = 0; i < 170; i++) {
    const y = Math.pow(r(), 1.4) * 560;
    const tw = !reduced && r() > 0.78 ? ' class="twinkle" style="animation-delay:-' + (r() * 4).toFixed(1) + 's"' : '';
    st += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.5 + r() * 1.3).toFixed(1)}" opacity="${(0.35 + r() * 0.65).toFixed(2)}"${tw}/>`;
  }
  starsG.innerHTML = st;

  let arcW = 1200;
  let stageH = innerHeight;
  function resize() {
    const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    stageH = h;
    const visible = Math.min(1600, 1000 * (w / h));
    arcW = visible * 0.78;
  }

  let active = -1;
  function render(p) {
    const f = clamp(p) * N;
    const t = clamp(p);
    const sky = skyAt(t);
    const sun = sunAt(t);
    stops.s0.setAttribute('stop-color', css(sky.top));
    stops.s1.setAttribute('stop-color', css(sky.mid));
    stops.s2.setAttribute('stop-color', css(sky.hz));
    stops.g0.setAttribute('stop-color', css(sky.sun));
    stops.g1.setAttribute('stop-color', css(sky.sun));
    stops.h0.setAttribute('stop-color', css(sky.hz));
    stops.h1.setAttribute('stop-color', css(sky.hz));
    stage.style.backgroundColor = css(sky.top);

    const sx = 800 + (sun.q - 0.5) * arcW;
    const sy = HZ + 40 - sun.elev * 560;
    sunG.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
    sunDisc.setAttribute('fill', css(sky.sun));
    sunG.style.opacity = sun.up ? 1 : 0;
    const night = Math.max(smooth(0.84, 0.98, t), (1 - smooth(0.02, 0.1, t)) * 0.8);
    starsG.style.opacity = night.toFixed(3);
    const lampOn = clamp(1 - sun.elev * 1.7);
    const rimC = css(sky.sun);
    const rimA = (0.25 + 0.45 * (1 - sun.elev)) * (1 - night * 0.7);

    scenes.forEach((sc, i) => {
      const u = f - i;
      const enter = i === 0 ? 1 : smooth(-0.14, 0.04, u);
      const exit = i === N - 1 ? 1 : 1 - smooth(0.98, 1.12, u);
      const out = i === N - 1 ? 0 : smooth(0.84, 1.12, u);
      const op = enter * exit;
      const show = op > 0.002;
      if (show !== sc.shown) {
        sc.gb.style.display = sc.gf.style.display = show ? '' : 'none';
        sc.shown = show;
      }
      if (!show) return;
      sc.gb.style.opacity = sc.gf.style.opacity = op.toFixed(3);
      for (const L of sc.layers) {
        let tx = 0, ty = 0, s = 1;
        if (!reduced) {
          ty = (1 - enter) * 260 * L.d * L.d + out * 380 * L.d * L.d;
          tx = (clamp(u) - 0.5) * -70 * L.d;
          s = 1 + out * 0.22 * L.d;
        }
        L.el.setAttribute('transform', `translate(${(tx + 800 * (1 - s)).toFixed(1)} ${(ty + 1000 * (1 - s)).toFixed(1)}) scale(${s.toFixed(4)})`);
      }
      for (const T of sc.tones) {
        const c = css(mix(sky.hz, sc.dark, T.k));
        T.el.setAttribute(T.stroke ? 'stroke' : 'fill', c);
      }
      for (const el of sc.rims) { el.setAttribute('stroke', rimC); el.setAttribute('stroke-opacity', rimA.toFixed(3)); }
      for (const el of sc.lamps) el.style.opacity = (0.15 + 0.85 * lampOn).toFixed(3);
      const wc = css(mix(mix(sky.top, sky.hz, 0.62), sc.dark, 0.2));
      for (const el of sc.waters) el.setAttribute('fill', wc);
      if (sc.glint) {
        sc.glint.setAttribute('transform', `translate(${sx.toFixed(1)} 0)`);
        sc.glint.style.opacity = sun.up ? (0.55 * (1 - sun.elev * 0.6)).toFixed(3) : 0;
      }
      if (!reduced) {
        for (const b of sc.balloons) {
          const rise = (u - 0.2) * -170 * b.s;
          b.el.setAttribute('transform', `${b.base} translate(0 ${(rise / Math.max(0.2, b.s)).toFixed(1)})`);
        }
      }
    });

    titles.forEach((el, i) => {
      const u = f - i;
      const e = i === 0 ? 1 : smooth(-0.12, 0.14, u);
      const x = i === N - 1 ? 0 : smooth(0.8, 1.0, u);
      const op = Math.min(e, 1 - x);
      el.style.opacity = op.toFixed(3);
      if (op <= 0.001) { el.style.visibility = 'hidden'; return; }
      el.style.visibility = '';
      const ty = reduced ? 0 : (1 - e) * stageH * 0.14 - x * stageH * 0.05;
      el.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;
    });

    if (intro) {
      const io = 1 - smooth(0.2, 0.55, f);
      intro.style.opacity = io.toFixed(3);
      intro.style.visibility = io <= 0.01 ? 'hidden' : '';
      if (!reduced) intro.style.transform = `translate3d(0, ${(-f * 40).toFixed(1)}px, 0)`;
    }

    const a = Math.min(N - 1, Math.floor(f));
    if (a !== active) {
      active = a;
      cards.forEach((c, i) => {
        const on = i === a;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-hidden', on ? 'false' : 'true');
        c.inert = !on;
      });
      ticks.forEach((b, i) => { if (i === a) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      if (onChapter) onChapter(a);
    }
    fill.style.transform = `scaleX(${t.toFixed(4)})`;
    daySun.style.left = (t * 100).toFixed(2) + '%';
    clockEl.textContent = clockAt(t);
    section.classList.toggle('is-travelling', t > 0.015);
  }

  let target = 0, cur = 0, raf = 0, near = true;
  function measure() {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - innerHeight;
    target = total > 0 ? clamp(-rect.top / total) : 0;
  }
  function tick() {
    raf = 0;
    cur = reduced ? target : cur + (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.0005) cur = target;
    render(cur);
    if (cur !== target) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { near = es[0].isIntersecting; if (near) { measure(); kick(); } }, { rootMargin: '100px 0px' }).observe(section);
  }
  addEventListener('scroll', () => { if (!near) return; measure(); kick(); }, { passive: true });
  addEventListener('resize', () => { resize(); measure(); render(cur); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; } });

  ticks.forEach((b) => b.addEventListener('click', () => go(+b.dataset.chapter)));
  function go(i) {
    const total = section.offsetHeight - innerHeight;
    const top = section.offsetTop + ((i + 0.42) / N) * total;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }

  resize();
  measure();
  cur = target;
  render(cur);
  return { go };
}
