const gsap = window.gsap;

gsap.registerPlugin({
  name: 'drawn',
  init(target, value) {
    const len = target.getTotalLength();
    target.style.strokeDasharray = len;
    this.target = target;
    this.len = len;
    this.value = value;
  },
  render(ratio, data) {
    data.target.style.strokeDashoffset = data.len * (1 - data.value * ratio);
  },
});

const $ = (id) => document.getElementById(id);

const canvas = $('tree');
const ctx = canvas.getContext('2d');
const wishEl = $('wish');
const dYou = $('youName');
const dMe = $('meName');
const dHeart = $('dHeart');
const finaleEl = $('finale');
const act6 = $('act6');
const lc = $('a6Canvas');
const lctx = lc.getContext('2d');

const BV = [
  { top: '#ffd6e8', mid: '#ff7ab8', btm: '#d94f8f', glow: 'rgba(255,120,180,0.4)' },
  { top: '#dcd2ff', mid: '#a88fff', btm: '#7a5fd0', glow: 'rgba(168,143,255,0.4)' },
];
let a6W = 0, a6H = 0, a6Stars = [], a6Orbs = [];
let act6On = false, act6RAF = 0, act6T = 0, act6Last = 0;
let butterflies = [], a6Burst = false;
let bHearts = [], xBurst = [], a6Shoot = [], lastCross = 0, lastShoot = 0;
let a6Const = [];
const OCOLS = ['222,214,255', '198,188,255', '255,224,244', '255,214,170'];

const a6Word = $('a6Word');
(function splitA6Word() {
  const chars = [...a6Word.textContent];
  a6Word.textContent = '';
  chars.forEach((c, i) => {
    if (!c) return;
    const s = document.createElement('span');
    s.className = 'a6ch';
    s.textContent = c === ' ' ? '\u00A0' : c;
    s.style.animationDelay = (1.7 + i * 0.055).toFixed(2) + 's';
    a6Word.appendChild(s);
  });
})();

function wordBurst() {
  if (a6Burst) return;
  a6Burst = true;
  const r = a6Word.getBoundingClientRect();
  const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
  const nodes = [];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('span');
    const s = rand(3, 7);
    el.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;pointer-events:none;border-radius:50%;background:radial-gradient(circle,#fff,rgba(255,215,150,0) 70%);`;
    act6.appendChild(el);
    nodes.push(el);
  }
  nodes.forEach((el) => {
    const ang = rand(0, Math.PI * 2);
    const dist = rand(40, 130);
    gsap.to(el, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, scale: rand(0.4, 1.2), duration: rand(0.7, 1.1), ease: 'power2.out' });
    gsap.to(el, { opacity: 0, duration: 0.45, delay: rand(0.4, 0.7), ease: 'power1.in', onComplete: () => el.remove() });
  });
}

const hero = $('hero');
const eyebrow = $('eyebrow');
const hint = $('hint');
const motes = $('motes');
const target = $('target');
const targetHeart = $('targetHeart');
const heartGlow = target.querySelector('.heart__glow');

const flood = $('flood');
const field = $('field');
const camera = $('camera');
const fgrid = $('fgrid');
const kEyebrow = $('kEyebrow');
const kSub = $('kSub');
const curtainL = $('curtainL');
const curtainR = $('curtainR');
const uline = $('uline').querySelector('.uline__path');
const bloom = $('bloom');
const replay = $('replay');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255);
  const g = clamp(((n >> 8) & 255) + amt, 0, 255);
  const b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

const BLOSSOM = [
  { c0: '#f4e9ff', c1: '#c9a6ff' },
  { c0: '#eaf4ff', c1: '#9fc4ff' },
  { c0: '#ffeef8', c1: '#f3a6d0' },
  { c0: '#f6f1ff', c1: '#d8c6ff' },
  { c0: '#e6f9ff', c1: '#8fd8f2' },
  { c0: '#ffeff5', c1: '#ff9ec9' },
];

const T = {
  trunkStart: 0.10,
  branchSpan: 1.80,
  bloomT0: 1.25,
  bloomSpan: 2.00,
  petalT0: 2.45,
  noteStart: 0.45,
  done: 4.60,
};

const F = { rise: 4.3, comet: 5.0, heart: 5.55, text: 6.25 };

const SS = 168;

function heartShape(c, x, top, w, h) {
  c.beginPath();
  c.moveTo(x, top + h * 0.28);
  c.bezierCurveTo(x, top, x - w * 0.5, top, x - w * 0.5, top + h * 0.28);
  c.bezierCurveTo(x - w * 0.5, top + h * 0.60, x - w * 0.16, top + h * 0.80, x, top + h);
  c.bezierCurveTo(x + w * 0.16, top + h * 0.80, x + w * 0.5, top + h * 0.60, x + w * 0.5, top + h * 0.28);
  c.bezierCurveTo(x + w * 0.5, top, x, top, x, top + h * 0.28);
  c.closePath();
}

function makeBlossom({ c0, c1 }, soft) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = SS;
  const c = cv.getContext('2d');
  const w = SS * 0.62, h = SS * 0.58, x = SS / 2, top = SS * 0.17;

  c.save();
  c.shadowColor = 'rgba(70,45,160,0.38)';
  c.shadowBlur = SS * 0.085;
  c.shadowOffsetY = SS * 0.05;
  c.fillStyle = c1;
  heartShape(c, x, top, w, h);
  c.fill();
  c.restore();

  const g = c.createRadialGradient(x - w * 0.20, top + h * 0.20, h * 0.04, x, top + h * 0.42, h * 0.92);
  g.addColorStop(0, c0);
  g.addColorStop(0.55, c1);
  g.addColorStop(1, shade(c1, -26));
  heartShape(c, x, top, w, h);
  c.fillStyle = g;
  c.fill();

  c.save();
  heartShape(c, x, top, w, h);
  c.clip();
  const g2 = c.createLinearGradient(0, top, 0, top + h);
  g2.addColorStop(0, 'rgba(255,255,255,0)');
  g2.addColorStop(0.65, 'rgba(110,16,46,0)');
  g2.addColorStop(1, 'rgba(110,16,46,0.26)');
  c.fillStyle = g2;
  c.fillRect(0, 0, SS, SS);
  c.globalAlpha = 0.55;
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.ellipse(x - w * 0.15, top + h * 0.24, w * 0.17, h * 0.11, -0.5, 0, Math.PI * 2);
  c.fill();
  c.restore();

  if (!soft) return cv;

  const cv2 = document.createElement('canvas');
  cv2.width = cv2.height = SS;
  const c2 = cv2.getContext('2d');
  c2.filter = 'blur(2.6px)';
  c2.drawImage(cv, 0, 0);
  c2.filter = 'none';
  c2.globalCompositeOperation = 'source-atop';
  c2.globalAlpha = 0.42;
  c2.fillStyle = '#fff3ea';
  c2.fillRect(0, 0, SS, SS);
  return cv2;
}

function makeBokeh(rgb) {
  const S = 128, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const c = cv.getContext('2d');
  const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, `rgba(${rgb},0.9)`);
  g.addColorStop(0.45, `rgba(${rgb},0.22)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, S, S);
  return cv;
}

function makeSparkle() {
  const S = 64, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const c = cv.getContext('2d');
  const m = S / 2;
  const g = c.createRadialGradient(m, m, 0, m, m, m);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.25, 'rgba(255,236,200,0.5)');
  g.addColorStop(1, 'rgba(255,236,200,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(m, m, m, 0, 6.2832);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.95)';
  c.translate(m, m);
  for (let k = 0; k < 2; k++) {
    c.beginPath();
    c.moveTo(0, -m);
    c.quadraticCurveTo(0, 0, m, 0);
    c.quadraticCurveTo(0, 0, 0, m);
    c.quadraticCurveTo(0, 0, -m, 0);
    c.quadraticCurveTo(0, 0, 0, -m);
    c.fill();
    c.rotate(Math.PI / 4);
    c.scale(0.5, 0.5);
  }
  return cv;
}

let SPR = { crisp: [], soft: [] }, BOKEH = [], SPARKLE = null;
function buildSprites() {
  SPR = { crisp: BLOSSOM.map((b) => makeBlossom(b, false)), soft: BLOSSOM.map((b) => makeBlossom(b, true)) };
  BOKEH = [makeBokeh('222,214,255'), makeBokeh('198,188,255'), makeBokeh('255,224,244')];
  SPARKLE = makeSparkle();
}

function drawSprite(sprite, x, y, size, rot, alpha) {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, -size * 0.5, -size * 0.47, size, size);
  ctx.restore();
}

let heartPoly = null;
function buildHeartPoly() {
  const raw = [];
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (let i = 0; i <= 160; i++) {
    const t = (i / 160) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    raw.push([x, y]);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2, hw = (maxX - minX) / 2, hh = (maxY - minY) / 2;
  heartPoly = raw.map(([x, y]) => [(x - midX) / hw, (y - midY) / hh]);
}
function pointInPoly(x, y) {
  let inside = false;
  const p = heartPoly;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const xi = p[i][0], yi = p[i][1], xj = p[j][0], yj = p[j][1];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

let W = 0, H = 0, dpr = 1;
let cx = 0, cy = 0, rx = 0, ry = 0, groundY = 0;
let branches = [], hearts = [], petals = [], rested = [], orbs = [], floaters = [], twinkles = [], stars = [];
let bgGrad = null, glowGrad = null, groundGrad = null;

const quad = (b, t) => {
  const m = 1 - t, a = m * m, k = 2 * m * t, d = t * t;
  return { x: a * b.x1 + k * b.cx + d * b.x2, y: a * b.y1 + k * b.cy + d * b.y2 };
};

function barkGrad(x1, y1, x2, y2, depth) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, `hsl(256 30% ${12 + depth * 3}%)`);
  g.addColorStop(1, `hsl(258 26% ${24 + depth * 5}%)`);
  return g;
}

function buildScene() {
  branches = []; hearts = []; petals = []; rested = []; twinkles = []; orbs = []; floaters = [];
  buildHeartPoly();

  const wide = W / H > 1.2;
  const baseRy = Math.min(H * (wide ? 0.24 : 0.20), W * (wide ? 0.23 : 0.21));
  const cyL = H * (wide ? 0.43 : 0.42);
  const cyR = cyL + H * 0.02;

  cx = W * 0.5;
  cy = (cyL + cyR) / 2;
  ry = baseRy;
  rx = ry * 1.16;
  groundY = H * 0.93;

  bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#221848');
  bgGrad.addColorStop(0.46, '#2d1f5c');
  bgGrad.addColorStop(0.78, '#372966');
  bgGrad.addColorStop(1, '#402f70');
  glowGrad = ctx.createRadialGradient(cx, cy, ry * 0.1, cx, cy, ry * 1.55);
  glowGrad.addColorStop(0, 'rgba(255,240,224,0.5)');
  glowGrad.addColorStop(0.5, 'rgba(190,170,255,0.2)');
  glowGrad.addColorStop(1, 'rgba(190,170,255,0)');
  groundGrad = ctx.createRadialGradient(cx, H * 1.02, ry * 0.2, cx, H * 1.02, ry * 1.6);
  groundGrad.addColorStop(0, 'rgba(150,120,235,0.4)');
  groundGrad.addColorStop(1, 'rgba(150,120,235,0)');

  stars = [];
  for (let i = 0; i < 80; i++) {
    stars.push({ x: rand(0, W), y: rand(0, H * 0.88), r: rand(0.4, 1.5), p: rand(0, 6.28), a: rand(0.15, 0.65) });
  }

  for (let i = 0; i < 11; i++) {
    orbs.push({
      x: rand(0, W), y: rand(0, H), r: rand(W * 0.05, W * 0.17),
      vy: rand(-6, -16), drift: rand(-0.3, 0.3), phase: rand(0, 6.28),
      alpha: rand(0.05, 0.13), sprite: pick(BOKEH)
    });
  }

  const FN = wide ? 18 : 15;
  for (let i = 0; i < FN; i++) {
    const depth = Math.random();
    floaters.push({
      x: rand(0, W), y: rand(-H * 0.1, H * 1.1), depth,
      idx: (Math.random() * BLOSSOM.length) | 0,
      box: lerp(Math.min(W, H) * 0.025, Math.min(W, H) * 0.075, depth),
      vy: lerp(7, 20, depth), sway: rand(8, 22), phase: rand(0, 6.28),
      rot: rand(-0.4, 0.4), vrot: rand(-0.5, 0.5),
      baseA: lerp(0.16, 0.5, depth), soft: depth < 0.45,
    });
  }

  growTree(W * (wide ? 0.32 : 0.25), cyL, baseRy, 1, 0);
  growTree(W * (wide ? 0.68 : 0.75), cyR, baseRy * 0.9, 0.92, 0.22);

  gsap.set(dYou, { x: W * (wide ? 0.32 : 0.25), y: cyL - baseRy * 1.06, xPercent: -50, yPercent: -100 });
  gsap.set(dMe, { x: W * (wide ? 0.68 : 0.75), y: cyR - baseRy * 0.9 * 1.06, xPercent: -50, yPercent: -100 });
  gsap.set(dHeart, { x: W * 0.5, y: cy - baseRy * 0.28, xPercent: -50, yPercent: -50 });

  const maxT0 = branches.reduce((m, b) => Math.max(m, b.t0 + b.dur), 0);
  const sc = (T.branchSpan - T.trunkStart) / (maxT0 - T.trunkStart);
  for (const b of branches) b.t0 = T.trunkStart + (b.t0 - T.trunkStart) * sc;

  hearts.sort((a, b) => (a.soft === b.soft ? a.y - b.y : a.soft ? -1 : 1));
}

function growTree(treeX, treeY, treeRy, sizeMul, delay) {
  const tcx = treeX, tcy = treeY;
  const trx = treeRy * 1.16, tryy = treeRy;
  const trunkTopY = tcy + tryy * 0.62;
  const trunkW = Math.max(7, W * 0.018) * sizeMul;
  const limbLen = tryy * 0.6;
  const insidePx = (x, y, m = 0.9) => pointInPoly((x - tcx) / (trx * m), (tcy - y) / (tryy * m));

  function addBranch(x, y, ang, len, w0, depth, t0) {
    let ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len, clipped = false;
    if (!insidePx(ex, ey)) {
      let lo = 0, hi = 1;
      for (let k = 0; k < 12; k++) {
        const mid = (lo + hi) / 2;
        (insidePx(x + Math.cos(ang) * len * mid, y + Math.sin(ang) * len * mid) ? lo = mid : hi = mid);
      }
      ex = x + Math.cos(ang) * len * lo; ey = y + Math.sin(ang) * len * lo; clipped = true;
    }
    const mx = (x + ex) / 2, my = (y + ey) / 2, perp = ang + Math.PI / 2, bend = rand(-1, 1) * len * 0.12, w1 = w0 * 0.66;
    branches.push({
      x1: x, y1: y, cx: mx + Math.cos(perp) * bend, cy: my + Math.sin(perp) * bend,
      x2: ex, y2: ey, w0, w1, t0, dur: Math.max(0.14, 0.32 - depth * 0.03), depth,
      grad: barkGrad(x, y, ex, ey, depth)
    });
    return { ex, ey, w1, clipped };
  }
  function grow(x, y, ang, len, w, depth, t0) {
    const r = addBranch(x, y, ang, len, w, depth, t0);
    if (r.clipped || depth >= 6 || len < tryy * 0.06) return;
    const childT0 = t0 + (0.32 - depth * 0.03) * 0.6;
    const n = Math.random() < 0.55 ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const spread = 0.6 * (i - (n - 1) / 2) + rand(-0.22, 0.22), lift = -0.06 + rand(-0.05, 0.05);
      grow(r.ex, r.ey, ang + spread + lift, len * rand(0.74, 0.84), r.w1, depth + 1, childT0 + i * 0.03);
    }
  }

  addBranch(tcx, H * 1.0, -Math.PI / 2, H * 1.0 - trunkTopY, trunkW, 0, T.trunkStart + delay);
  branches[branches.length - 1].dur = 0.55;
  const limbT0 = T.trunkStart + delay + 0.36, L = 3;
  for (let i = 0; i < L; i++) {
    const ang = -Math.PI / 2 + 0.62 * (i - (L - 1) / 2) + rand(-0.12, 0.12);
    grow(tcx, trunkTopY, ang, limbLen, trunkW * 0.7, 1, limbT0 + i * 0.05);
  }

  const start = hearts.length;
  const COUNT = Math.round(clamp(trx * tryy / 90, 150, 320));
  const baseBox = clamp(Math.min(W, H) * 0.095, 24, 60);
  let guard = 0;
  while (hearts.length - start < COUNT && guard < COUNT * 50) {
    guard++;
    const u = rand(-1.06, 1.06), v = rand(-1.06, 1.06);
    if (!pointInPoly(u, v)) continue;
    const x = tcx + u * trx, y = tcy - v * tryy;
    const d = clamp01(Math.hypot(u, v + 1) / 2.4);
    const t0 = T.bloomT0 + d * (T.bloomSpan * 0.82) + rand(0, T.bloomSpan * 0.18);
    const soft = Math.random() < 0.42;
    hearts.push({
      x, y, px: tcx, py: tcy, idx: (Math.random() * BLOSSOM.length) | 0, soft,
      box: baseBox * (soft ? rand(0.6, 0.85) : rand(0.78, 1.12)),
      rot: rand(-0.55, 0.55), sway: rand(0, 6.28), t0
    });
  }
}

function drawBackground(t) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);
  for (const s of stars) {
    const tw = 0.55 + 0.45 * Math.sin(t * 1.4 + s.p);
    ctx.globalAlpha = s.a * tw;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 1; ctx.fillStyle = groundGrad; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawGodRays(t, intensity) {
  if (intensity <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const ox = cx, oy = cy - ry * 0.35, R = Math.hypot(W, H) * 1.1;
  const rays = 9, sweep = Math.sin(t * 0.07) * 0.18;
  for (let i = 0; i < rays; i++) {
    const a = -Math.PI / 2 + sweep + (i - (rays - 1) / 2) * 0.2;
    const hw = 0.035 + 0.02 * (0.5 + 0.5 * Math.sin(t * 0.5 + i * 1.7));
    const a1 = a - hw, a2 = a + hw;
    const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(a) * R, oy + Math.sin(a) * R);
    g.addColorStop(0, `rgba(226,214,255,${0.10 * intensity})`);
    g.addColorStop(0.5, `rgba(200,186,255,${0.05 * intensity})`);
    g.addColorStop(1, 'rgba(200,186,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(a1) * R, oy + Math.sin(a1) * R);
    ctx.lineTo(ox + Math.cos(a2) * R, oy + Math.sin(a2) * R);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawGlow(t) {
  const gi = clamp01((t - T.bloomT0) / (T.bloomSpan * 0.9));
  if (gi <= 0) return;
  ctx.save(); ctx.globalAlpha = gi; ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = glowGrad; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawBokeh(t, dt) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const o of orbs) {
    o.y += o.vy * dt; o.x += Math.sin(t * 0.3 + o.phase) * o.drift;
    if (o.y < -o.r) { o.y = H + o.r; o.x = rand(0, W); }
    ctx.globalAlpha = o.alpha;
    ctx.drawImage(o.sprite, o.x - o.r, o.y - o.r, o.r * 2, o.r * 2);
  }
  ctx.restore();
}

function drawFloaters(t, dt, front) {
  const appear = clamp01((t - 0.2) / 1.4);
  if (appear <= 0) return;
  for (const f of floaters) {
    if ((f.depth >= 0.6) !== front) continue;
    f.y -= f.vy * dt;
    f.x += Math.sin(t * 0.5 + f.phase) * f.sway * dt;
    f.rot += f.vrot * dt;
    if (f.y < -f.box) { f.y = H + f.box; f.x = rand(0, W); }
    drawSprite((f.soft ? SPR.soft : SPR.crisp)[f.idx], f.x, f.y, f.box, f.rot, f.baseA * appear);
  }
}

function drawBranches(t) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const b of branches) {
    const f = clamp01((t - b.t0) / b.dur);
    if (f <= 0) continue;
    const e = easeOutCubic(f);
    ctx.strokeStyle = b.grad;
    const steps = 12, last = Math.max(1, Math.ceil(steps * e));
    let prev = quad(b, 0);
    for (let i = 1; i <= last; i++) {
      const tt = Math.min(e, i / steps), p = quad(b, tt);
      ctx.lineWidth = lerp(b.w0, b.w1, tt);
      ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      prev = p;
    }
  }
}

function drawHearts(t) {
  const breathe = 1 + Math.sin(t * 0.8) * 0.012;
  for (const h of hearts) {
    const p = clamp01((t - h.t0) / 0.6);
    if (p <= 0) continue;
    const scale = Math.max(0, easeOutBack(p));
    let alpha = clamp01(p * 1.7); if (h.soft) alpha *= 0.8;
    const settled = clamp01((t - h.t0 - 0.6) / 0.7);
    const sway = settled * Math.sin(t * 1.5 + h.sway) * (h.box * 0.05);
    const rise = (1 - easeOutCubic(p)) * h.box * 0.45;
    const hx = h.px + (h.x - h.px) * breathe + sway;
    const hy = h.py + (h.y - h.py) * breathe - rise;
    drawSprite((h.soft ? SPR.soft : SPR.crisp)[h.idx], hx, hy, h.box * scale, h.rot + sway * 0.012, alpha);
  }
}

function updateTwinkles(t, dt) {
  const active = t > T.bloomT0 + T.bloomSpan * 0.45;
  if (active && twinkles.length < 9 && Math.random() < 0.5) {
    const h = hearts[(Math.random() * hearts.length) | 0];
    if (h) twinkles.push({ x: h.x, y: h.y, size: rand(0.6, 1.3) * (Math.min(W, H) * 0.05), age: 0, life: rand(0.7, 1.2), rot: rand(0, 6.28) });
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = twinkles.length - 1; i >= 0; i--) {
    const s = twinkles[i]; s.age += dt;
    const k = s.age / s.life;
    if (k >= 1) { twinkles.splice(i, 1); continue; }
    const a = Math.sin(k * Math.PI);
    drawSprite(SPARKLE, s.x, s.y, s.size * (0.6 + 0.4 * a), s.rot + k * 1.2, a);
  }
  ctx.restore();
}

function spawnPetal() {
  const h = hearts[(Math.random() * hearts.length) | 0];
  if (!h) return;
  petals.push({
    x: h.x + rand(-8, 8), y: h.y + rand(-8, 8), vy: rand(14, 30),
    vx: rand(-8, 8), sway: rand(0.6, 1.4), phase: rand(0, 6.28),
    box: h.box * rand(0.34, 0.6), idx: h.idx, rot: rand(0, 6.28),
    vrot: rand(-1.4, 1.4), age: 0, land: groundY + rand(-6, H * 0.05)
  });
}

function drawPetals(t, dt) {
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i]; p.age += dt; p.vy += 8 * dt;
    p.x += (p.vx + Math.sin(t * p.sway + p.phase) * 16) * dt;
    p.y += p.vy * dt; p.rot += p.vrot * dt;
    if (p.y >= p.land) {
      rested.push({ x: clamp(p.x, 6, W - 6), y: p.land, box: p.box, idx: p.idx, rot: p.rot, a: rand(0.7, 0.95) });
      if (rested.length > 90) rested.shift();
      petals.splice(i, 1); continue;
    }
    const a = p.age < 0.3 ? p.age / 0.3 : 1;
    drawSprite(SPR.crisp[p.idx], p.x, p.y, p.box, p.rot, a);
  }
}

function drawRested() {
  for (const r of rested) drawSprite(SPR.crisp[r.idx], r.x, r.y, r.box, r.rot, r.a);
}

function showWish(on) { wishEl.classList.toggle('is-in', on); }
function showFinale(on) { finaleEl.classList.toggle('is-in', on); }

let treeStartT = 0, treeLastT = 0, treeRAF = 0, lastPetal = 0, replayArmed = false;
let risers = [], comet = null;

function updateRisers(t, dt) {
  if (t >= F.rise && risers.length < 26 && Math.random() < 0.45) {
    const h = hearts[(Math.random() * hearts.length) | 0];
    if (h) risers.push({
      x: h.x + rand(-6, 6), y: h.y + rand(-6, 6), vy: rand(-30, -52), vx: rand(-5, 5),
      sway: rand(0.8, 1.6), phase: rand(0, 6.28), box: rand(5, 13), idx: h.idx,
      rot: rand(0, 6.28), vrot: rand(-1.2, 1.2), age: 0, life: rand(2.4, 3.6)
    });
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = risers.length - 1; i >= 0; i--) {
    const r = risers[i]; r.age += dt;
    r.x += (r.vx + Math.sin(t * r.sway + r.phase) * 10) * dt;
    r.y += r.vy * dt; r.rot += r.vrot * dt;
    const k = r.age / r.life;
    if (k >= 1) { risers.splice(i, 1); continue; }
    drawSprite((SPR.soft[r.idx] || SPR.crisp[r.idx]), r.x, r.y, r.box, r.rot, Math.sin(k * Math.PI) * 0.9);
  }
  ctx.restore();
}

function updateComet(t, dt) {
  if (t >= F.comet && !comet) {
    comet = { x: W * 0.82, y: H * 0.12, vx: -W * 0.55, vy: H * 0.055, age: 0, life: 1.15, trailed: [] };
  }
  if (!comet) return;
  comet.age += dt;
  comet.x += comet.vx * dt; comet.y += comet.vy * dt;
  comet.trailed.push({ x: comet.x, y: comet.y, age: 0 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = comet.trailed.length - 1; i >= 0; i--) {
    const s = comet.trailed[i]; s.age += dt;
    if (s.age > 0.4) { comet.trailed.splice(i, 1); continue; }
    const a = 0.8 * (1 - s.age / 0.4);
    ctx.strokeStyle = `rgba(255,220,255,${a})`;
    ctx.lineWidth = 2.2 * (1 - s.age / 0.4);
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - comet.vx * 0.045, s.y - comet.vy * 0.045); ctx.stroke();
  }
  const hk = 1 - comet.age / comet.life;
  if (hk > 0) {
    const g = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 18);
    g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(comet.x, comet.y, 18, 0, 6.2832); ctx.fill();
  }
  ctx.restore();
  if (comet.age >= comet.life) comet = null;
}

function drawFinaleHeart(t) {
  const f = clamp01((t - F.heart) / 1.1);
  if (f <= 0) return;
  const scale = Math.max(0, easeOutBack(f));
  const hx = W * 0.5, hy = H * 0.30;
  const size = Math.min(W, H) * 0.20 * scale;
  const pulse = 1 + Math.sin(t * 1.6) * 0.03;
  const alpha = clamp01(f * 1.6);

  ctx.save();
  ctx.shadowColor = 'rgba(255,90,150,0.85)';
  ctx.shadowBlur = size * 0.55;
  const g = ctx.createLinearGradient(0, hy - size, 0, hy + size);
  g.addColorStop(0, '#ff9cc6');
  g.addColorStop(0.5, '#f0609c');
  g.addColorStop(1, '#b23a86');
  ctx.fillStyle = g;
  heartShape(ctx, hx, hy - size, size * pulse, size * 1.06 * pulse);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = alpha * 0.5;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(hx - size * 0.18, hy - size * 0.62, size * 0.16, size * 0.1, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (f > 0.6) {
    const ang = t * 1.4;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const a = ang + (i * Math.PI) / 2;
      const x = hx + Math.cos(a) * size * 0.8;
      const y = hy + Math.sin(a) * size * 0.8;
      const tw = 0.5 + 0.5 * Math.sin(ang * 2 + i * 1.7);
      drawSprite(SPARKLE, x, y, size * (0.09 + 0.09 * tw), a, alpha * tw);
    }
    ctx.restore();
  }
}

function sizeAct6() {
  a6W = lc.clientWidth; a6H = lc.clientHeight;
  const d = Math.min(window.devicePixelRatio || 1, 2);
  lc.width = Math.round(a6W * d); lc.height = Math.round(a6H * d);
  lctx.setTransform(d, 0, 0, d, 0, 0);
  a6Stars = []; a6Orbs = [];
  for (let i = 0; i < 70; i++) a6Stars.push({ x: rand(0, a6W), y: rand(0, a6H * 0.85), r: rand(0.4, 1.5), p: rand(0, 6.28), a: rand(0.15, 0.6) });
  for (let i = 0; i < 14; i++) {
    const rgb = pick(OCOLS);
    a6Orbs.push({ x: rand(0, a6W), y: rand(0, a6H), r: rand(a6W * 0.05, a6W * 0.16), vy: rand(4, 10), p: rand(0, 6.28), a: rand(0.05, 0.13), rgb });
  }
  a6Const = [];
  const s = Math.min(a6W, a6H) * 0.023;
  for (let i = 0; i < 13; i++) {
    const a = -Math.PI / 2 + (i / 12) * Math.PI * 2;
    a6Const.push({
      x: a6W * 0.5 + 16 * Math.pow(Math.sin(a), 3) * s,
      y: a6H * 0.5 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * s * 0.92,
      ph: rand(0, 6.28), delay: 0.55 + i * 0.14,
    });
  }
}

function drawConstellation(t) {
  const vis = a6Const.map((st) => clamp01((t - st.delay) / 0.5));
  let avg = 0;
  lctx.save(); lctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < a6Const.length - 1; i++) {
    const a = Math.min(vis[i], vis[i + 1]) * 0.45;
    if (a <= 0) continue;
    lctx.strokeStyle = `rgba(255,220,240,${a})`;
    lctx.lineWidth = 1.1;
    lctx.beginPath();
    lctx.moveTo(a6Const[i].x, a6Const[i].y);
    lctx.lineTo(a6Const[i + 1].x, a6Const[i + 1].y);
    lctx.stroke();
  }
  for (let i = 0; i < a6Const.length; i++) {
    const st = a6Const[i], v = vis[i];
    if (v <= 0) continue;
    avg += v;
    const tw = 0.6 + 0.4 * Math.sin(t * 2 + st.ph);
    const r = (1.6 + 0.9 * tw) * (Math.min(a6W, a6H) / 800) * 2.2;
    lctx.globalAlpha = v * (0.5 + 0.5 * tw);
    lctx.fillStyle = '#ffffff';
    lctx.beginPath(); lctx.arc(st.x, st.y, r, 0, 6.2832); lctx.fill();
    lctx.globalAlpha = v * 0.5 * tw;
    lctx.strokeStyle = 'rgba(255,240,255,0.9)';
    lctx.lineWidth = 1;
    lctx.beginPath();
    lctx.moveTo(st.x - r * 2.6, st.y); lctx.lineTo(st.x + r * 2.6, st.y);
    lctx.moveTo(st.x, st.y - r * 2.6); lctx.lineTo(st.x, st.y + r * 2.6);
    lctx.stroke();
  }
  if (avg > 0) {
    const hcx = a6W * 0.5, hcy = a6H * 0.5, hr = Math.min(a6W, a6H) * 0.24;
    const g = lctx.createRadialGradient(hcx, hcy, 0, hcx, hcy, hr);
    g.addColorStop(0, `rgba(255,170,200,${0.16 * Math.min(1, avg / 4)})`);
    g.addColorStop(1, 'rgba(255,170,200,0)');
    lctx.fillStyle = g;
    lctx.beginPath(); lctx.arc(hcx, hcy, hr, 0, 6.2832); lctx.fill();
  }
  lctx.restore();
  lctx.globalAlpha = 1;
}

function drawMiniHeart(h, t) {
  const k = h.age / h.life;
  const S = h.s;
  lctx.save();
  lctx.globalAlpha = Math.sin(k * Math.PI) * 0.9;
  lctx.save(); lctx.globalCompositeOperation = 'lighter';
  const og = lctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, S * 1.6);
  og.addColorStop(0, h.v.glow); og.addColorStop(1, 'rgba(255,255,255,0)');
  lctx.fillStyle = og;
  lctx.beginPath(); lctx.arc(h.x, h.y, S * 1.6, 0, 6.2832); lctx.fill();
  lctx.restore();
  const g = lctx.createLinearGradient(0, h.y - S, 0, h.y + S);
  g.addColorStop(0, h.v.top); g.addColorStop(1, h.v.btm);
  lctx.fillStyle = g;
  heartShape(lctx, h.x, h.y - S * 0.55, S, S * 0.95);
  lctx.fill();
  lctx.restore();
}

function drawAct6Particles(t, dt) {
  const sc = Math.min(a6W, a6H) / 800;
  for (let i = bHearts.length - 1; i >= 0; i--) {
    const h = bHearts[i];
    h.age += dt; h.vy += 5 * dt;
    h.x += (h.vx + Math.sin(t * 2 + h.ph) * 7) * dt;
    h.y += h.vy * dt;
    if (h.age >= h.life) { bHearts.splice(i, 1); continue; }
    drawMiniHeart(h, t);
  }
  lctx.save(); lctx.globalCompositeOperation = 'lighter';
  for (let i = xBurst.length - 1; i >= 0; i--) {
    const p = xBurst[i];
    p.age += dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vy += 60 * dt;
    const k = p.age / p.life;
    if (k >= 1) { xBurst.splice(i, 1); continue; }
    lctx.globalAlpha = (1 - k) * 0.9;
    lctx.fillStyle = '#ffe1a0';
    lctx.beginPath(); lctx.arc(p.x, p.y, (0.8 + 1.3 * (1 - k)) * sc, 0, 6.2832); lctx.fill();
  }
  lctx.restore();
  lctx.globalAlpha = 1;

  for (let i = a6Shoot.length - 1; i >= 0; i--) {
    const s = a6Shoot[i];
    s.age += dt;
    s.x += s.vx * dt; s.y += s.vy * dt;
    s.pts.push({ x: s.x, y: s.y });
    if (s.pts.length > 26) s.pts.shift();
    if (s.age >= s.life) { a6Shoot.splice(i, 1); continue; }
    lctx.save(); lctx.globalCompositeOperation = 'lighter';
    for (let j = 0; j < s.pts.length; j++) {
      const q = s.pts[j];
      const k = j / s.pts.length;
      lctx.globalAlpha = 0.7 * k;
      lctx.fillStyle = '#fff0e0';
      lctx.beginPath(); lctx.arc(q.x, q.y, (0.6 + 2.2 * k) * sc, 0, 6.2832); lctx.fill();
    }
    const g = lctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 14 * sc);
    g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    lctx.fillStyle = g;
    lctx.beginPath(); lctx.arc(s.x, s.y, 14 * sc, 0, 6.2832); lctx.fill();
    lctx.restore();
  }
  lctx.globalAlpha = 1;
}

function butterflyPos(b, t) {
  const u = t * b.speed + b.ph;
  return {
    x: a6W * 0.5 + Math.sin(u) * b.ampX * a6W * (1 + 0.16 * Math.sin(t * 0.13 + b.ph)),
    y: a6H * 0.44 + Math.sin(2 * u) * b.ampY * a6H * 0.5 + Math.sin(u * 3 + 1.2) * a6H * 0.018,
  };
}

function updateButterflies(t, dt) {
  for (const b of butterflies) {
    b.enter = Math.min(1, b.enter + dt * 0.55);
    const e = easeOutCubic(b.enter);
    const p2 = butterflyPos(b, t);
    const p1 = butterflyPos(b, t - 0.04);
    const ex = lerp(b.sx, p2.x, e), ey = lerp(b.sy, p2.y, e);
    const ex1 = lerp(b.sx, p1.x, e), ey1 = lerp(b.sy, p1.y, e);
    b.x = ex; b.y = ey;
    b.ang = Math.atan2(ey - ey1, ex - ex1);
    b.bank = Math.sin(2 * (t * b.speed + b.ph)) * 0.24 * e;
    b.pts.push({ x: ex, y: ey, t });
    if (t - b.lastSpark > 0.14) {
      b.lastSpark = t;
      b.sparks.push({ x: ex + rand(-3, 3), y: ey + rand(-3, 3), t });
    }
    b.nextHeart -= dt;
    if (b.nextHeart <= 0 && b.enter > 0.5) {
      b.nextHeart = rand(1.2, 2.1);
      bHearts.push({
        x: ex + rand(-6, 6), y: ey, vx: rand(-4, 4), vy: rand(-16, -26) * (a6H / 800),
        ph: rand(0, 6.28), age: 0, life: rand(1.5, 2.2), v: b.v,
        s: rand(0.4, 0.8) * (Math.min(a6W, a6H) / 800)
      });
    }
  }
  if (butterflies.length === 2) {
    const b0 = butterflies[0], b1 = butterflies[1];
    const d = Math.hypot(b0.x - b1.x, b0.y - b1.y);
    const thr = (b0.size + b1.size) * Math.min(a6W, a6H) * 1.3;
    if (d < thr && t - lastCross > 2.2) {
      lastCross = t;
      const mx = (b0.x + b1.x) / 2, my = (b0.y + b1.y) / 2;
      for (let i = 0; i < 7; i++) {
        xBurst.push({
          x: mx, y: my, vx: rand(-42, 42) * (a6H / 800), vy: rand(-56, -12) * (a6H / 800),
          age: 0, life: rand(0.6, 1)
        });
      }
    }
  }
  if (t > 2.6 && a6Shoot.length < 3 && t - lastShoot > rand(3.2, 5)) {
    lastShoot = t;
    a6Shoot.push({
      x: rand(a6W * 0.55, a6W * 0.95), y: rand(a6H * 0.06, a6H * 0.3),
      vx: -rand(240, 330) * (a6W / 1440), vy: rand(70, 110) * (a6H / 800),
      age: 0, life: 1.1, pts: []
    });
  }
}

function drawTrails(t, sc) {
  lctx.save(); lctx.globalCompositeOperation = 'lighter';
  for (const b of butterflies) {
    for (let i = b.pts.length - 1; i >= 0; i--) {
      const p = b.pts[i];
      const k = (t - p.t) / 1.6;
      if (k >= 1) { b.pts.splice(i, 1); continue; }
      lctx.globalAlpha = 0.8 * (1 - k);
      lctx.fillStyle = b.v.mid;
      lctx.beginPath();
      lctx.arc(p.x, p.y, (0.5 + 2.8 * (1 - k)) * sc, 0, 6.2832);
      lctx.fill();
    }
    for (let i = b.sparks.length - 1; i >= 0; i--) {
      const s = b.sparks[i];
      const k = (t - s.t) / 0.9;
      if (k >= 1) { b.sparks.splice(i, 1); continue; }
      lctx.globalAlpha = 0.9 * (1 - k);
      lctx.fillStyle = '#ffe1a0';
      lctx.beginPath();
      lctx.arc(s.x, s.y, (0.7 + 1.4 * (1 - k)) * sc, 0, 6.2832);
      lctx.fill();
    }
  }
  lctx.restore();
  lctx.globalAlpha = 1;
}

function drawButterfly(b, t, sc) {
  const flap = Math.sin(t * 17 + b.ph * 2);
  const open = 0.24 + 0.76 * Math.abs(flap);
  const S = b.size * Math.min(a6W, a6H) * (1 + 0.05 * Math.sin(t * 9 + b.ph));
  lctx.save();
  lctx.translate(b.x, b.y);
  lctx.rotate(b.ang + b.bank * (flap < 0 ? -1 : 1));
  lctx.save(); lctx.globalCompositeOperation = 'lighter';
  const g = lctx.createRadialGradient(0, 0, 0, 0, 0, S * 1.7);
  g.addColorStop(0, b.v.glow); g.addColorStop(1, 'rgba(255,255,255,0)');
  lctx.fillStyle = g;
  lctx.beginPath(); lctx.arc(0, 0, S * 1.7, 0, 6.2832); lctx.fill();
  lctx.restore();
  for (const side of [-1, 1]) {
    lctx.save();
    lctx.scale(side * open, open);
    const fw = S * 0.78, fh = S * 0.42;
    lctx.save();
    lctx.translate(S * 0.28, -S * 0.34);
    lctx.rotate(-0.3);
    const wg = lctx.createLinearGradient(0, -fh, 0, fh);
    wg.addColorStop(0, b.v.top); wg.addColorStop(0.55, b.v.mid); wg.addColorStop(1, b.v.btm);
    lctx.fillStyle = wg;
    lctx.beginPath(); lctx.ellipse(0, 0, fw, fh, 0, 0, 6.2832); lctx.fill();
    lctx.strokeStyle = 'rgba(255,255,255,0.55)';
    lctx.lineWidth = S * 0.02;
    lctx.beginPath(); lctx.moveTo(-fw * 0.5, 0); lctx.quadraticCurveTo(0, -fh * 0.4, fw * 0.4, -fh * 0.35); lctx.stroke();
    lctx.beginPath(); lctx.moveTo(-fw * 0.5, 0); lctx.quadraticCurveTo(0, fh * 0.15, fw * 0.35, fh * 0.1); lctx.stroke();
    lctx.restore();
    lctx.fillStyle = 'rgba(255,255,255,0.8)';
    lctx.beginPath(); lctx.arc(S * 0.52, -S * 0.34, S * 0.075, 0, 6.2832); lctx.fill();
    lctx.fillStyle = '#ffe1a0';
    lctx.beginPath(); lctx.arc(S * 0.34, -S * 0.22, S * 0.05, 0, 6.2832); lctx.fill();
    lctx.save();
    lctx.translate(S * 0.18, S * 0.3);
    lctx.rotate(0.28);
    const hw = S * 0.5, hh = S * 0.34;
    const hg2 = lctx.createLinearGradient(0, -hh, 0, hh);
    hg2.addColorStop(0, b.v.mid); hg2.addColorStop(1, b.v.btm);
    lctx.fillStyle = hg2;
    lctx.beginPath(); lctx.ellipse(0, 0, hw, hh, 0, 0, 6.2832); lctx.fill();
    lctx.strokeStyle = 'rgba(255,255,255,0.4)';
    lctx.lineWidth = S * 0.018;
    lctx.beginPath(); lctx.moveTo(-hw * 0.5, 0); lctx.quadraticCurveTo(0, -hh * 0.4, hw * 0.42, -hh * 0.3); lctx.stroke();
    lctx.restore();
    lctx.restore();
  }
  lctx.strokeStyle = 'rgba(255,220,240,0.9)';
  lctx.lineWidth = Math.max(1, S * 0.035);
  lctx.lineCap = 'round';
  lctx.beginPath(); lctx.moveTo(S * 0.5, -S * 0.06); lctx.quadraticCurveTo(S * 0.68, -S * 0.28, S * 0.82, -S * 0.3); lctx.stroke();
  lctx.beginPath(); lctx.moveTo(S * 0.5, S * 0.06); lctx.quadraticCurveTo(S * 0.68, S * 0.28, S * 0.82, S * 0.3); lctx.stroke();
  const bg3 = lctx.createLinearGradient(0, -S * 0.1, 0, S * 0.1);
  bg3.addColorStop(0, '#4a2a56'); bg3.addColorStop(1, '#241330');
  lctx.fillStyle = bg3;
  lctx.beginPath(); lctx.ellipse(S * 0.05, 0, S * 0.5, S * 0.09, 0, 0, 6.2832); lctx.fill();
  lctx.fillStyle = b.v.top;
  lctx.beginPath(); lctx.arc(S * 0.52, 0, S * 0.09, 0, 6.2832); lctx.fill();
  lctx.restore();
}

function drawAct6Frame(t, dt) {
  const bg = lctx.createLinearGradient(0, 0, 0, a6H);
  bg.addColorStop(0, '#221848');
  bg.addColorStop(0.46, '#2d1f5c');
  bg.addColorStop(0.78, '#372966');
  bg.addColorStop(1, '#402f70');
  lctx.fillStyle = bg; lctx.fillRect(0, 0, a6W, a6H);

  if (t < 1.2) {
    const f = t < 0.08 ? t / 0.08 : Math.max(0, 1 - (t - 0.08) / 1.12);
    lctx.fillStyle = `rgba(255,246,255,${0.95 * f})`;
    lctx.fillRect(0, 0, a6W, a6H);
  }

  for (const s of a6Stars) {
    const tw = 0.55 + 0.45 * Math.sin(t * 1.4 + s.p);
    lctx.globalAlpha = s.a * tw;
    lctx.fillStyle = '#ffffff';
    lctx.beginPath(); lctx.arc(s.x, s.y, s.r, 0, 6.2832); lctx.fill();
  }
  lctx.globalAlpha = 1;

  lctx.save(); lctx.globalCompositeOperation = 'lighter';
  const mg = lctx.createRadialGradient(a6W * 0.8, a6H * 0.13, 0, a6W * 0.8, a6H * 0.13, a6W * 0.24);
  mg.addColorStop(0, 'rgba(190,170,255,0.16)');
  mg.addColorStop(1, 'rgba(190,170,255,0)');
  lctx.fillStyle = mg;
  lctx.beginPath(); lctx.arc(a6W * 0.8, a6H * 0.13, a6W * 0.24, 0, 6.2832); lctx.fill();
  for (const o of a6Orbs) {
    const y = o.y - ((t * o.vy) % (a6H + 200));
    const og = lctx.createRadialGradient(o.x, y, 0, o.x, y, o.r);
    og.addColorStop(0, `rgba(222,214,255,${o.a})`);
    og.addColorStop(1, 'rgba(222,214,255,0)');
    lctx.fillStyle = og;
    lctx.beginPath(); lctx.arc(o.x, y, o.r, 0, 6.2832); lctx.fill();
  }
  lctx.restore();

  const sc = Math.min(a6W, a6H) / 800;
  if (dt > 0) updateButterflies(t, dt);
  drawTrails(t, sc);
  for (const b of butterflies) drawButterfly(b, t, sc);

  lctx.save(); lctx.globalCompositeOperation = 'lighter';
  const gg = lctx.createRadialGradient(a6W * 0.5, a6H * 1.02, 0, a6W * 0.5, a6H * 1.02, a6W * 0.55);
  gg.addColorStop(0, 'rgba(150,120,235,0.32)');
  gg.addColorStop(1, 'rgba(150,120,235,0)');
  lctx.fillStyle = gg; lctx.fillRect(0, 0, a6W, a6H);
  lctx.restore();

  drawConstellation(t);
  drawAct6Particles(t, dt);
}

function act6Frame(now) {
  if (!act6Last) act6Last = now;
  const dt = Math.min(0.05, (now - act6Last) / 1000);
  act6Last = now; act6T += dt;
  drawAct6Frame(act6T, dt);
  if (!a6Burst && act6T >= 2.05) wordBurst();
  if (!replayArmed && act6T >= 5.4) { replayArmed = true; armReplay(); }
  act6RAF = requestAnimationFrame(act6Frame);
}

function startAct6(staticMode) {
  if (act6On && !staticMode) return;
  act6On = true;
  sizeAct6();
  act6.classList.add('is-in');
  gsap.to([wishEl, finaleEl], { opacity: 0, duration: 0.9, ease: 'power2.out' });
  if (butterflies.length === 0) {
    butterflies = [
      { v: BV[0], ph: 0, speed: 0.5, ampX: 0.21, ampY: 0.17, size: 0.06, enter: 0, sx: a6W * -0.12, sy: a6H * 0.3, x: a6W * -0.12, y: a6H * 0.3, ang: 0, bank: 0, pts: [], sparks: [], lastSpark: 0, nextHeart: rand(1.6, 2.4) },
      { v: BV[1], ph: 2.4, speed: 0.58, ampX: 0.16, ampY: 0.13, size: 0.05, enter: 0, sx: a6W * 1.12, sy: a6H * 0.78, x: a6W * 1.12, y: a6H * 0.78, ang: 0, bank: 0, pts: [], sparks: [], lastSpark: 0, nextHeart: rand(1.6, 2.4) },
    ];
  }
  if (staticMode) {
    for (const b of butterflies) {
      b.enter = 1;
      b.pts = []; b.sparks = [];
      for (let i = 0; i < 30; i++) {
        const tt = 999.2 - (29 - i) * 0.047;
        const p = butterflyPos(b, tt);
        b.pts.push({ x: p.x, y: p.y, t: tt });
      }
      const p = butterflyPos(b, 999);
      b.x = p.x; b.y = p.y;
      b.ang = Math.atan2(p.y - b.pts[b.pts.length - 2]?.y || 0, p.x - b.pts[b.pts.length - 2]?.x || 1);
      b.bank = 0;
    }
    drawAct6Frame(999, 0);
    return;
  }
  act6T = 0; act6Last = 0;
  a6Burst = false;
  bHearts = []; xBurst = []; a6Shoot = [];
  lastCross = 0; lastShoot = 0;
  act6RAF = requestAnimationFrame(act6Frame);
}

function stopAct6() {
  act6On = false;
  if (act6RAF) { cancelAnimationFrame(act6RAF); act6RAF = 0; }
  act6.classList.remove('is-in');
  gsap.set([wishEl, finaleEl], { clearProps: 'opacity' });
  for (const b of butterflies) { b.pts = []; b.sparks = []; b.enter = 0; }
  bHearts = []; xBurst = []; a6Shoot = [];
}

function treeFrame(now) {
  if (!treeStartT) { treeStartT = now; treeLastT = now; }
  const t = (now - treeStartT) / 1000;
  const dt = Math.min(0.05, (now - treeLastT) / 1000);
  treeLastT = now;

  const rays = clamp01((t - T.bloomT0) / T.bloomSpan);

  drawBackground(t);
  drawGodRays(t, rays);
  drawGlow(t);
  drawBokeh(t, dt);
  drawFloaters(t, dt, false);
  drawBranches(t);
  drawHearts(t);
  updateTwinkles(t, dt);
  updateRisers(t, dt);
  if (t > T.petalT0 && now - lastPetal > 150) { spawnPetal(); spawnPetal(); lastPetal = now; }
  drawPetals(t, dt);
  drawRested();
  drawFloaters(t, dt, true);
  updateComet(t, dt);
  drawFinaleHeart(t);

  showWish(t >= T.noteStart);
  showFinale(t >= F.text);

  if (!act6On && t >= T.done + 3.0) startAct6();

  treeRAF = requestAnimationFrame(treeFrame);
}

function treeStart() {
  treeStartT = 0; treeLastT = 0; lastPetal = 0; replayArmed = false;
  risers = []; comet = null;
  showFinale(false);
  buildScene();
  if (!treeRAF) treeRAF = requestAnimationFrame(treeFrame);
}

function treeStop() {
  if (treeRAF) { cancelAnimationFrame(treeRAF); treeRAF = 0; }
  ctx.clearRect(0, 0, W, H);
}

function drawFinal() {
  buildScene();
  drawBackground(0); drawGodRays(0, 1); drawGlow(T.done); drawBokeh(0, 0); drawFloaters(99, 0, false);
  drawBranches(99); drawHearts(99);
  for (let i = 0; i < 40; i++) {
    const h = hearts[(Math.random() * hearts.length) | 0];
    if (h) rested.push({ x: clamp(h.x + rand(-W * 0.3, W * 0.3), 6, W - 6), y: groundY + rand(-6, H * 0.05), box: h.box * 0.5, idx: h.idx, rot: rand(0, 6.28), a: 0.85 });
  }
  drawRested(); drawFloaters(99, 0, true);
  drawFinaleHeart(999);
  showWish(true);
  showFinale(true);
}

/* ============================================================
   PROCEDURAL WEB AUDIO SYNTHESIZER
   ============================================================ */
class SoundEngine {
  constructor() {
    this.ctx = null;
    // Sound is enabled by default, but the browser will only actually start
    // audio after a user gesture (such as tapping the heart).
    this.enabled = localStorage.getItem('romantic_sound_enabled') !== 'false';
    this.ambientTimer = null;
    this.master = null;
    this.reverb = null;
    this.reverbGain = null;
    this.musicStep = 0;

    // A soft D-major / B-minor palette for a warm romantic feeling.
    this.melody = [
      587.33, 659.25, 739.99, 659.25,
      493.88, 587.33, 659.25, 739.99,
      659.25, 587.33, 493.88, 440.00,
      493.88, 587.33, 659.25, 587.33
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();

      this.master = this.ctx.createGain();
      this.master.gain.setValueAtTime(0.0001, this.ctx.currentTime);

      // Small convolution reverb for a dreamy, spacious sound.
      this.reverb = this.ctx.createConvolver();
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = 0.20;
      this.reverb.buffer = this.makeImpulse(2.6, 1.7);

      this.reverb.connect(this.reverbGain);
      this.reverbGain.connect(this.master);
      this.master.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(
        this.enabled ? 0.16 : 0.0001,
        this.ctx.currentTime,
        0.18
      );
    }
  }

  makeImpulse(seconds = 2.4, decay = 1.6) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = this.ctx.createBuffer(2, length, rate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * 0.22;
      }
    }
    return buffer;
  }

  note(freq, duration = 2.8, volume = 0.055, type = 'sine', when = null) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.master) return;

    try {
      const now = when ?? this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2300, now);
      filter.Q.value = 0.35;

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.10);
      gain.gain.exponentialRampToValueAtTime(volume * 0.58, now + duration * 0.32);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      gain.connect(this.reverb);

      osc.start(now);
      osc.stop(now + duration + 0.08);
    } catch (e) {}
  }

  playChime(freq = 523.25, duration = 1.8) {
    this.note(freq, duration, 0.065, 'sine');
    this.note(freq * 2, duration * 0.72, 0.018, 'triangle');
  }

  playHeartbeat() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.master) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.18].forEach((offset, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(i ? 54 : 66, now + offset);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(i ? 0.07 : 0.11, now + offset + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.13);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    } catch (e) {}
  }

  startAmbient() {
    if (!this.enabled || this.ambientTimer) return;
    this.init();
    if (!this.ctx) return;

    // Gentle four-note motif + sustained low pad.
    const playStep = () => {
      if (!this.enabled || !this.ctx) return;

      const f = this.melody[this.musicStep % this.melody.length];
      this.note(f, 2.7, 0.048, 'sine');
      this.note(f / 2, 3.4, 0.018, 'triangle');

      // Occasional high sparkle.
      if (this.musicStep % 4 === 1) {
        this.note(f * 2, 2.0, 0.014, 'sine');
      }

      this.musicStep++;
    };

    playStep();
    this.ambientTimer = setInterval(playStep, 1550);
  }

  stopAmbient() {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.12);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('romantic_sound_enabled', this.enabled ? 'true' : 'false');
    } catch (e) {}

    if (this.enabled) {
      this.init();
      this.playChime(587.33, 1.5);
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
    return this.enabled;
  }
}
const soundEngine = new SoundEngine();

/* ============================================================
   PERSONALIZATION & MODAL SYSTEM
   ============================================================ */
const defaultConfig = {
  you: 'F💔',
  me: 'Shafu🙂',
  line1: 'Will You',
  line2: 'Be Mine?',
  sub: 'I promise, this is only the beginning',
  letter: 'Every second spent with you feels like a quiet miracle. You are my home, my favorite adventure, and the sweetest part of every day. Here is to us, forever and always.'
};

let currentConfig = { ...defaultConfig };

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}

function loadConfig() {
  try {
    const saved = localStorage.getItem('romantic_gift_config');
    if (saved) {
      currentConfig = { ...defaultConfig, ...JSON.parse(saved) };
    }
  } catch (e) {}
  applyConfig();
}

function applyConfig() {
  const { you, me, line1, line2, sub, letter } = currentConfig;

  if ($('wLine1')) $('wLine1').textContent = line1;
  if ($('wLine2')) $('wLine2').textContent = line2;
  if ($('kSub')) $('kSub').textContent = sub;

  if ($('youName')) $('youName').innerHTML = `<span>${escapeHTML(you)}</span>`;
  if ($('meName')) $('meName').innerHTML = `<span>${escapeHTML(me)}</span>`;

  if ($('letterToName')) $('letterToName').textContent = you;
  if ($('letterFromName')) $('letterFromName').textContent = me;
  if ($('letterTextDisplay')) $('letterTextDisplay').textContent = letter;

  // Update inputs
  if ($('inputYou')) $('inputYou').value = you;
  if ($('inputMe')) $('inputMe').value = me;
  if ($('inputLine1')) $('inputLine1').value = line1;
  if ($('inputLine2')) $('inputLine2').value = line2;
  if ($('inputSub')) $('inputSub').value = sub;
  if ($('inputLetter')) $('inputLetter').value = letter;
}

function saveConfig(newCfg) {
  currentConfig = { ...currentConfig, ...newCfg };
  try {
    localStorage.setItem('romantic_gift_config', JSON.stringify(currentConfig));
  } catch (e) {}
  applyConfig();
}

function initUIControls() {
  const btnSound = $('btnSound');
  const soundOn = btnSound ? btnSound.querySelector('.icon-sound-on') : null;
  const soundOff = btnSound ? btnSound.querySelector('.icon-sound-off') : null;

  function updateSoundUI() {
    if (!soundOn || !soundOff) return;
    if (soundEngine.enabled) {
      soundOn.style.display = 'inline';
      soundOff.style.display = 'none';
    } else {
      soundOn.style.display = 'none';
      soundOff.style.display = 'inline';
    }
  }

  if (btnSound) {
    updateSoundUI();
    btnSound.addEventListener('click', (e) => {
      e.stopPropagation();
      const state = soundEngine.toggle();
      updateSoundUI();
    });
  }

  // Customization Modal
  const customModal = $('customModal');
  const btnCustomize = $('btnCustomize');
  const modalClose = $('modalClose');
  const modalBackdrop = $('modalBackdrop');
  const btnSaveCustom = $('btnSaveCustom');
  const btnResetCustom = $('btnResetCustom');

  function openModal(m) {
    if (m) m.classList.add('is-active');
  }
  function closeModal(m) {
    if (m) m.classList.remove('is-active');
  }

  if (btnCustomize) {
    btnCustomize.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(customModal);
    });
  }
  if (modalClose) modalClose.addEventListener('click', () => closeModal(customModal));
  if (modalBackdrop) modalBackdrop.addEventListener('click', () => closeModal(customModal));

  if (btnSaveCustom) {
    btnSaveCustom.addEventListener('click', (e) => {
      e.preventDefault();
      saveConfig({
        you: $('inputYou').value.trim() || defaultConfig.you,
        me: $('inputMe').value.trim() || defaultConfig.me,
        line1: $('inputLine1').value.trim() || defaultConfig.line1,
        line2: $('inputLine2').value.trim() || defaultConfig.line2,
        sub: $('inputSub').value.trim() || defaultConfig.sub,
        letter: $('inputLetter').value.trim() || defaultConfig.letter,
      });
      closeModal(customModal);
    });
  }

  if (btnResetCustom) {
    btnResetCustom.addEventListener('click', (e) => {
      e.preventDefault();
      saveConfig(defaultConfig);
      closeModal(customModal);
    });
  }

  // Love Letter Modal
  const letterModal = $('letterModal');
  const btnLetter = $('btnLetter');
  const letterClose = $('letterClose');
  const letterBackdrop = $('letterBackdrop');

  if (btnLetter) {
    btnLetter.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEngine.playChime(659.25, 1.8);
      openModal(letterModal);
    });
  }
  if (letterClose) letterClose.addEventListener('click', () => closeModal(letterModal));
  if (letterBackdrop) letterBackdrop.addEventListener('click', () => closeModal(letterModal));

  // Initialize saved values
  loadConfig();
}

function splitWord(el) {
  const chars = [...el.textContent];
  el.textContent = '';
  return chars.map((c) => {
    const s = document.createElement('span');
    s.className = 'hl__ch';
    s.textContent = c === ' ' ? '\u00A0' : c;
    el.appendChild(s);
    return s;
  });
}

function getKChars() {
  const line1Chars = splitWord($('wLine1'));
  const line2Chars = splitWord($('wLine2'));
  return [...line1Chars, ...line2Chars];
}


function buildMotes() {
  motes.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const m = document.createElement('span');
    m.className = 'mote';
    const s = rand(4, 12);
    m.style.width = m.style.height = `${s}px`;
    m.style.left = `${rand(4, 96)}%`;
    m.style.top = `${rand(10, 96)}%`;
    motes.appendChild(m);
    gsap.set(m, { opacity: rand(0.25, 0.7) });
    gsap.to(m, { y: -rand(40, 140), x: rand(-30, 30), duration: rand(7, 14), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: -rand(0, 8) });
    gsap.to(m, { opacity: rand(0.1, 0.5), duration: rand(2.5, 5), repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }
}

let beatTL = null;
function startBeat() {
  gsap.set(targetHeart, { scale: 1 });
  gsap.set(heartGlow, { scale: 1, opacity: 0.7 });
  beatTL = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
  beatTL.to(targetHeart, { scale: 1.07, duration: 0.13, ease: 'power2.out', onStart: () => soundEngine.playHeartbeat() }, 0)
    .to(heartGlow, { scale: 1.15, opacity: 0.9, duration: 0.13, ease: 'power2.out' }, 0)
    .to(targetHeart, { scale: 1.0, duration: 0.2, ease: 'power2.in' }, 0.13)
    .to(targetHeart, { scale: 1.05, duration: 0.12, ease: 'power2.out', onStart: () => soundEngine.playHeartbeat() }, 0.3)
    .to(targetHeart, { scale: 1.0, duration: 0.5, ease: 'power2.inOut' }, 0.42)
    .to(heartGlow, { scale: 1.0, opacity: 0.7, duration: 0.7, ease: 'power2.inOut' }, 0.3);
}
function stopBeat() { if (beatTL) { beatTL.kill(); beatTL = null; } gsap.set(targetHeart, { scale: 1 }); }

function miniHeartSVG(fill) {
  return `<svg viewBox="0 0 24 22" width="100%" height="100%"><path d="M12 20C5.5 15 1.5 11.4 1.5 6.9 1.5 3.6 4 1.5 7 1.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3 0 5.5 2.1 5.5 5.4C23.5 11.4 19.5 15 12 20Z" fill="${fill}"/></svg>`;
}
function burstHearts() {
  soundEngine.playChime(783.99, 1.4);
  const r = target.getBoundingClientRect();
  const hr = hero.getBoundingClientRect();
  const ox = r.left - hr.left + r.width / 2;
  const oy = r.top - hr.top + r.height * 0.42;
  const cols = ['#ff6f97', '#ffb14e', '#ff8fae', '#ffd36a', '#e23b67'];
  const frag = document.createDocumentFragment();
  const nodes = [];
  for (let i = 0; i < 12; i++) {
    const heart = i < 8;
    const el = document.createElement('span');
    el.className = 'burst';
    const s = heart ? rand(12, 22) : rand(4, 8);
    el.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;pointer-events:none;z-index:4;`;
    if (heart) el.innerHTML = miniHeartSVG(pick(cols));
    else { el.style.borderRadius = '50%'; el.style.background = 'radial-gradient(circle,#fff,rgba(255,210,150,0) 70%)'; }
    frag.appendChild(el); nodes.push({ el, heart });
  }
  hero.appendChild(frag);
  nodes.forEach(({ el, heart }) => {
    const ang = rand(-Math.PI, 0);
    const dist = rand(heart ? 70 : 40, heart ? 190 : 120);
    gsap.to(el, {
      x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - rand(10, 50),
      rotation: rand(-120, 120), scale: heart ? rand(0.7, 1.2) : rand(0.4, 1),
      duration: rand(0.7, 1.15), ease: 'power2.out',
    });
    gsap.to(el, { opacity: 0, duration: 0.5, delay: rand(0.35, 0.6), ease: 'power1.in', onComplete: () => el.remove() });
  });
}

function tapGeom() {
  const tRect = target.getBoundingClientRect();
  const tcx = tRect.left + tRect.width / 2, tcy = tRect.top + tRect.height / 2;
  const fallPx = Math.min(H * 0.26, H - tcy - tRect.height * 0.4);
  const impactX = tcx, impactY = tcy + fallPx;
  const distC = Math.hypot(Math.max(impactX, W - impactX), Math.max(impactY, H - impactY));
  const reach = Math.hypot(W / 2, H / 2);
  return {
    fallPx, fx: impactX - W / 2, fy: impactY - H / 2,
    floodScale: (distC * 1.12) / 70, bloomScale: (reach * 1.2) / 30,
  };
}

let filmTL = null;
function buildFilm(m) {
  const kChars = getKChars();
  const scatters = kChars.map(() => {
    const ang = rand(0, Math.PI * 2);
    const dist = rand(260, 560);
    return { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, rX: rand(-160, 160), rot: rand(-200, 200), s: rand(1.5, 2.8) };
  });

  const t = gsap.timeline({
    paused: true,
    onComplete: () => {
      gsap.set(field, { autoAlpha: 0 });
      treeStart();
      gsap.to(bloom, { autoAlpha: 0, duration: 1.15, ease: 'power2.out' });
    },
  });

  t.set(target, { y: 0, scaleX: 1, scaleY: 1, opacity: 1 })
    .set([flood, bloom], { autoAlpha: 0, scale: 0.001, x: 0, y: 0 })
    .set(flood, { x: m.fx, y: m.fy })
    .set(field, { autoAlpha: 0 })
    .set('.blob', { opacity: 0 })
    .set(camera, { scale: 1, yPercent: 0, x: 0 })
    .set(fgrid, { xPercent: 0, yPercent: 0 })
    .set(curtainL, { xPercent: 0 })
    .set(curtainR, { xPercent: 0 })
    .set(kEyebrow, { opacity: 0, y: -40 })
    .set(kSub, { opacity: 0, y: 16 })
    .set('.curtain__edge', { opacity: 0 })
    .set('.hl__sheen', { xPercent: 0 })
    .set('.hl__shock', { scale: 0.25, opacity: 0 })
    .set('.hl__flash', { opacity: 0 })
    .set(kChars, { transformPerspective: 620, transformOrigin: '50% 50%', opacity: 0 })
    .set(uline, { drawn: 0 });

  t.to([eyebrow, hint], { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0)
    .to(target, { scale: 1.12, duration: 0.07, ease: 'power2.out' }, 0)
    .to(target, { scale: 1.0, duration: 0.24, ease: 'power2.inOut' }, 0.07)
    .to(heartGlow, { opacity: 0.95, scale: 1.25, duration: 0.2, ease: 'power2.out' }, 0);

  t.add(burstHearts, 0.2)
    .to(target, { x: 7, y: -9, duration: 0.06, ease: 'power2.out' }, 0.2)
    .to(target, { x: 0, y: 0, duration: 0.32, ease: 'power2.out' }, 0.26)
    .to(target, { scale: 1.14, duration: 0.06, ease: 'power2.out' }, 0.2)
    .to(target, { scale: 1.0, duration: 0.26, ease: 'power2.inOut' }, 0.26);

  t.to(target, { y: m.fallPx, scaleX: 0.84, scaleY: 1.3, duration: 0.34, ease: 'power1.in' }, 0.58)
    .to(target, { scaleX: 1.4, scaleY: 0.6, duration: 0.07, ease: 'power2.out' }, 0.92)
    .set(flood, { autoAlpha: 1 }, 0.94)
    .fromTo(flood, { scale: 0.02 }, { scale: m.floodScale, duration: 0.34, ease: 'power2.in' }, 0.94)
    .to(target, { opacity: 0, duration: 0.12, ease: 'power1.out' }, 1.0);

  t.set(field, { autoAlpha: 1 }, 1.26)
    .set(hero, { autoAlpha: 0 }, 1.27)
    .to('.blob', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.28)
    .set(flood, { autoAlpha: 0 }, 1.30);

  t.fromTo(camera, { scale: 1.0, yPercent: 0 }, { scale: 1.07, yPercent: -1.3, duration: 2.6, ease: 'none' }, 1.32)
    .fromTo(fgrid, { xPercent: 0, yPercent: 0 }, { xPercent: -1.5, yPercent: -1.0, duration: 2.6, ease: 'none' }, 1.32);

  t.to(curtainL, { xPercent: -100, duration: 0.8, ease: 'power4.inOut' }, 1.44)
    .to(curtainR, { xPercent: 100, duration: 0.8, ease: 'power4.inOut' }, 1.44)
    .to('.curtain__edge', { opacity: 0.85, duration: 0.3, ease: 'power2.out' }, 1.46)
    .to('.curtain__edge', { opacity: 0, duration: 0.25, ease: 'power1.in' }, 2.15);

  t.to(kEyebrow, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }, 1.48);

  t.fromTo(kChars, {
    x: (i) => scatters[i] ? scatters[i].x : 0, y: (i) => scatters[i] ? scatters[i].y : 0,
    rotationX: (i) => scatters[i] ? scatters[i].rX : 0, rotation: (i) => scatters[i] ? scatters[i].rot : 0,
    scale: (i) => scatters[i] ? scatters[i].s : 1, opacity: 0,
  }, {
    x: 0, y: 0, rotationX: 0, rotation: 0, scale: 1, opacity: 1,
    duration: 0.6, ease: 'elastic.out(1, 0.55)', stagger: 0.045,
  }, 1.62)
    .to(uline, { drawn: 1, duration: 0.45, ease: 'power2.inOut' }, 2.6);

  t.fromTo('.hl__shock', { scale: 0.25, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 0.7, ease: 'power2.out' }, 3.0)
    .fromTo('.hl__flash', { opacity: 0 }, { opacity: 1, duration: 0.08 }, 3.0)
    .to('.hl__flash', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 3.08)
    .to(camera, { x: -7, duration: 0.05, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 3.0)
    .set(camera, { x: 0 }, 3.42)
    .to(kSub, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }, 3.05)
    .to('.hl__sheen', { xPercent: 265, duration: 0.85, ease: 'power2.inOut' }, 3.15);

  t.to('.curtain__edge', { opacity: 0, duration: 0.18, ease: 'power1.in' }, 3.54)
    .to(curtainL, { xPercent: 0, duration: 0.5, ease: 'power3.in' }, 3.6)
    .to(curtainR, { xPercent: 0, duration: 0.5, ease: 'power3.in' }, 3.6)
    .to(camera, { scale: 1.14, duration: 0.4, ease: 'power2.in' }, 3.62)
    .set(bloom, { autoAlpha: 1 }, 3.7)
    .fromTo(bloom, { scale: 0.02 }, { scale: m.bloomScale, duration: 0.58, ease: 'power2.in' }, 3.7);

  return t;
}

let played = false;

function fire() {
  if (played) return;
  played = true;

  // Mobile browsers allow Web Audio when it is started from the user's tap.
  if (soundEngine.enabled) {
    soundEngine.init();
    soundEngine.playHeartbeat();
    soundEngine.playChime(659.25, 2.0);
    soundEngine.startAmbient();
  }
  stopBeat();
  filmTL = buildFilm(tapGeom());
  filmTL.play(0);
}

function ripple(x, y) {
  const r = document.createElement('span');
  r.className = 'ripple';
  r.style.left = x + 'px';
  r.style.top = y + 'px';
  hero.appendChild(r);
  gsap.fromTo(r, { scale: 0.2, opacity: 0.6 }, { scale: 1, opacity: 0, duration: 0.55, ease: 'power2.out', onComplete: () => r.remove() });
}

hero.addEventListener('pointerdown', (e) => {
  if (played) return;
  const hr = hero.getBoundingClientRect();
  ripple(e.clientX - hr.left, e.clientY - hr.top);
  fire();
});
hero.addEventListener('keydown', (e) => {
  if (played) return;
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
});

function enter() {
  gsap.set(hero, { autoAlpha: 1 });
  gsap.set([eyebrow, hint], { opacity: 0, y: 14 });
  gsap.set(target, { opacity: 0, y: 10, scaleX: 0.9, scaleY: 0.9 });
  gsap.set(heartGlow, { opacity: 0, scale: 1 });

  const tl = gsap.timeline({ onComplete: startBeat });
  tl.to(target, { opacity: 1, y: 0, scaleX: 1, scaleY: 1, duration: 0.8, ease: 'power3.out' }, 0.1)
    .to(heartGlow, { opacity: 0.7, duration: 0.8, ease: 'power2.out' }, 0.2)
    .to(eyebrow, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.4)
    .to(hint, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.7);
}

function armReplay() {
  replay.hidden = false;
  requestAnimationFrame(() => replay.classList.add('is-shown'));
}

function resetAll() {
  treeStop();
  stopAct6();
  showWish(false);
  showFinale(false);
  replayArmed = false;
  replay.classList.remove('is-shown'); replay.hidden = true;
  if (filmTL) { filmTL.pause(0); }
  gsap.set([flood, bloom], { autoAlpha: 0 });
  gsap.set(field, { autoAlpha: 0 });
  played = false;
  enter();
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildSprites();
  buildScene();
  if (act6On) {
    sizeAct6();
    bHearts = []; xBurst = []; a6Shoot = [];
    if (reduceMotion) startAct6(true);
    else for (const b of butterflies) { b.pts = []; b.sparks = []; }
  }
  if (reduceMotion) { drawFinal(); return; }
  if (played && filmTL) {
    const at = filmTL.time(); const active = filmTL.isActive();
    filmTL = buildFilm(tapGeom());
    filmTL.pause(at);
    if (active) filmTL.play(at);
  }
}
let resizeRAF = 0;
window.addEventListener('resize', () => { if (resizeRAF) return; resizeRAF = requestAnimationFrame(() => { resizeRAF = 0; resize(); }); });

// Initialize UI Controls & Config
initUIControls();
resize();

if (reduceMotion) {
  drawFinal();
  startAct6(true);
} else {
  buildMotes();
  const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
  Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 2500))]).then(() => { enter(); });
  replay.addEventListener('click', resetAll);
}

