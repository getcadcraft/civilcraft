/* SPDX-License-Identifier: Apache-2.0 */
/**
 * viewer.js — the year viewer: one weather year as a surface over the days of the year and the hours of the day, with cuts through it,
 * and the same year as a flat map, profiles, a wind rose, a histogram and a monthly table (0.11 Track WX, WX.9-WX.12). The same in every
 * host. This file and panel.js are the only ones of lib/weather that touch a page. Text is always set as text, never as HTML. No library:
 * the surface is drawn with the browser's own WebGL, everything else with a 2D canvas.
 *
 *   openViewer(host, source, settings?) → { el, state(), set(patch), settings(), probe(), png(), close() }
 *   host   = { t(key, vars), storage: { get, set }, download(name, text | Blob, type),
 *              stations?() → [{ set, station }], loadStation?(x) → Promise<source>, onClose?() }
 *   source = { epw (readEpw's result), name, credit?, id? ('set/station', for a link), text? (the file, to save a changed copy) }
 * WX.10: a psychrometric chart with a comfort range, a sun path, two stations on one scale, cuts dragged on the surface, a quantity of the
 * file multiplied or shifted and saved as a new .epw, and a link that carries the view.
 * Keys (while the viewer has the focus): M / Shift+M next / previous quantity · X C V date, time and value cuts on or off · B cut block ·
 * T Y U step the time, date and value cut (Shift = back) · 1-5 the five views · arrows turn · W S nearer / farther · A D slide ·
 * F fit · Space start or stop the animation · Esc close. A cut is dragged by its line on the surface; Alt+drag moves the value cut.
 */
import { METRICS, metric, has, grid, rolling, stats, niceScale, histogram, monthly, windRose, contour, share, csv, comfort, psychroBins, changed as changedEpw, ratio } from './metrics.js';
import { events, keyDays, dateOf, altitude, azimuth, MONTH_START } from './solar.js';
import { cleanSettings, DEFAULTS, RAMPS, rampColor, rampBytes, EASE, VIEWS, PROJECTIONS, PERIODS, ANIMATE, shareCode } from './viewstate.js';
import { writeEpw } from './epw.js';

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'className') n.className = v; else if (k.startsWith('on')) n[k] = v; else if (v !== false && v !== null && v !== undefined) n.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
}
const CSS = `
.wxv{position:fixed;inset:0;z-index:4000;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:var(--sheet,#fff);color:var(--ink,#16202a);font-size:.9rem;outline:none}
.wxv-head{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .7rem;padding:.4rem .7rem;border-bottom:1px solid var(--line,#c5ccd3)}
.wxv-head h3{margin:0;font-size:1.05rem;flex:1 1 100%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wxv-tabs{display:flex;gap:.2rem;overflow-x:auto;max-width:100%}
.wxv button,.wxv .wxv-btn{font:inherit;color:inherit;background:transparent;border:1px solid var(--line,#9aa5b1);border-radius:4px;padding:.2rem .55rem;cursor:pointer;white-space:nowrap}
.wxv button:hover{border-color:var(--action,#2f8fd8)}
.wxv button[aria-pressed="true"],.wxv button[aria-selected="true"]{background:var(--action,#2f8fd8);color:var(--on-action,#fff);border-color:var(--action,#2f8fd8)}
.wxv button:disabled{opacity:.45;cursor:default}
.wxv-body{display:grid;grid-template-columns:minmax(15rem,19rem) minmax(0,1fr);min-height:0}
.wxv-side{overflow:auto;padding:.5rem .7rem;border-right:1px solid var(--line,#c5ccd3);display:grid;gap:.3rem;align-content:start}
.wxv-side h5{margin:.6rem 0 .1rem;font-size:.95rem}
.wxv-f{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.1rem .5rem;align-items:center;min-width:0}
.wxv-f>span{opacity:.9}.wxv-f>output{font-variant-numeric:tabular-nums}
.wxv-f input[type=range]{grid-column:1/-1;width:100%}
.wxv-f select,.wxv-f input[type=number],.wxv textarea{grid-column:1/-1;width:100%;box-sizing:border-box;background:#fff;color:#111;border:1px solid #9aa5b1;border-radius:3px;padding:.2rem .3rem;font:inherit}
.wxv textarea{min-height:7rem;font-family:ui-monospace,monospace;font-size:.8rem}
.wxv-c{display:flex;gap:.4rem;align-items:center}
.wxv-row{display:flex;flex-wrap:wrap;gap:.3rem}
.wxv-stage{position:relative;min-width:0;min-height:0;overflow:hidden}
.wxv-stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.wxv-stage canvas[hidden],.wxv-table[hidden]{display:none}
.wxv-table{position:absolute;inset:0;overflow:auto;padding:1rem}
.wxv-step{position:absolute;right:.7rem;bottom:.6rem;display:flex;gap:.3rem;z-index:1}
.wxv-step button{background:var(--sheet,#fff)}
.wxv-table table{border-collapse:collapse;font-variant-numeric:tabular-nums}
.wxv-table td,.wxv-table th{padding:.25rem .7rem;border-bottom:1px solid var(--line,#c5ccd3);text-align:right}
.wxv-table th:first-child,.wxv-table td:first-child{text-align:left}
.wxv-foot{display:flex;flex-wrap:wrap;gap:.2rem 1.2rem;padding:.3rem .7rem;border-top:1px solid var(--line,#c5ccd3);font-variant-numeric:tabular-nums;min-height:1.6rem}
.wxv-note{font-size:.85em;opacity:.85;margin:.1rem 0;white-space:normal}
.wxv-err{color:#b91c1c}
@media (max-width:760px){.wxv-body{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1.2fr) minmax(0,1fr)}.wxv-side{order:2;border-right:0;border-top:1px solid var(--line,#c5ccd3)}}
`;

/* ---- small matrix kit (column-major, as WebGL reads it) ---- */
const mul = (a, b) => { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function lookAt(eye, f, r, u) { return new Float32Array([r[0], u[0], -f[0], 0, r[1], u[1], -f[1], 0, r[2], u[2], -f[2], 0, -dot(r, eye), -dot(u, eye), dot(f, eye), 1]); }
function perspective(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]); }
function ortho(hw, hh, n, f) { return new Float32Array([1 / hw, 0, 0, 0, 0, 1 / hh, 0, 0, 0, 0, -2 / (f - n), 0, 0, 0, -(f + n) / (f - n), 1]); }
function invert(m) {
  const a = new Float64Array(32);
  for (let r = 0; r < 4; r++) { for (let c = 0; c < 4; c++) a[r * 8 + c] = m[c * 4 + r]; a[r * 8 + 4 + r] = 1; }
  for (let i = 0; i < 4; i++) {
    let p = i;
    for (let r = i + 1; r < 4; r++) if (Math.abs(a[r * 8 + i]) > Math.abs(a[p * 8 + i])) p = r;
    if (Math.abs(a[p * 8 + i]) < 1e-12) return null;
    if (p !== i) for (let c = 0; c < 8; c++) { const x = a[i * 8 + c]; a[i * 8 + c] = a[p * 8 + c]; a[p * 8 + c] = x; }
    const d = a[i * 8 + i];
    for (let c = 0; c < 8; c++) a[i * 8 + c] /= d;
    for (let r = 0; r < 4; r++) if (r !== i) { const f = a[r * 8 + i]; if (f) for (let c = 0; c < 8; c++) a[r * 8 + c] -= f * a[i * 8 + c]; }
  }
  const o = new Float32Array(16);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o[c * 4 + r] = a[r * 8 + 4 + c];
  return o;
}
const xf = (m, x, y, z, w = 1) => [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w, m[2] * x + m[6] * y + m[10] * z + m[14] * w, m[3] * x + m[7] * y + m[11] * z + m[15] * w];

const VS = `
attribute vec2 a_xy; attribute vec2 a_n; attribute float a_ok; attribute float a_top;
uniform mat4 u_mvp; uniform vec3 u_size; uniform vec3 u_sec; uniform vec3 u_clip; uniform float u_mix; uniform float u_mode;
varying vec3 v_p; varying float v_n; varying float v_ok; varying vec3 v_w;
void main() {
  float n = mix(a_n.x, a_n.y, u_mix), z = n;
  if (u_mode > 0.5 && u_mode < 1.5) z = u_sec.z;
  if (u_mode > 1.5) z = a_top * (u_clip.z != 0.0 ? min(n, u_sec.z) : n);
  v_n = u_mode > 1.5 ? z : n; v_ok = a_ok; v_p = vec3(a_xy, z);
  v_w = vec3((a_xy.x - 0.5) * u_size.x, (a_xy.y - 0.5) * u_size.y, z * u_size.z);
  gl_Position = u_mvp * vec4(v_w, 1.0);
}`;
const FS = `
precision highp float;
varying vec3 v_p; varying float v_n; varying float v_ok; varying vec3 v_w;
uniform sampler2D u_ramp; uniform vec3 u_sec; uniform vec3 u_clip; uniform float u_mode; uniform float u_iso; uniform float u_light; uniform float u_alpha;
void main() {
  if (v_ok < 0.99) discard;
  if (u_clip.x != 0.0 && (v_p.x - u_sec.x) * u_clip.x > 0.0005) discard;
  if (u_clip.y != 0.0 && (v_p.y - u_sec.y) * u_clip.y > 0.0005) discard;
  bool flat_ = u_mode > 0.5 && u_mode < 1.5;
  if (u_mode < 0.5 && u_clip.z != 0.0 && v_n > u_sec.z + 0.0005) discard;
  if (flat_ && v_n < u_sec.z) discard;
  vec3 c = texture2D(u_ramp, vec2(clamp(flat_ ? u_sec.z : v_n, 0.002, 0.998), 0.5)).rgb;
#ifdef DERIV
  if (u_iso > 0.0 && u_mode < 0.5) { float f = v_n * u_iso; float w = fwidth(f); float l = 1.0 - smoothstep(0.0, 1.5 * w, abs(fract(f + 0.5) - 0.5)); c = mix(c, c * 0.45, l * 0.8); }
  if (u_light > 0.0) { vec3 nn = normalize(cross(dFdx(v_w), dFdy(v_w))); c *= 0.62 + 0.42 * abs(dot(nn, normalize(vec3(0.35, -0.45, 0.82)))); }
#endif
  gl_FragColor = vec4(c, u_alpha);
}`;
const LVS = 'attribute vec3 a_pos; uniform mat4 u_mvp; uniform vec3 u_size; void main(){ gl_Position = u_mvp * vec4((a_pos.x - 0.5) * u_size.x, (a_pos.y - 0.5) * u_size.y, a_pos.z * u_size.z, 1.0); }';
const LFS = 'precision mediump float; uniform vec4 u_color; void main(){ gl_FragColor = u_color; }';

function program(gl, vs, fs) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
  const u = {}, a = {};
  for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) { const x = gl.getActiveUniform(p, i); u[x.name] = gl.getUniformLocation(p, x.name); }
  for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES); i < n; i++) { const x = gl.getActiveAttrib(p, i); a[x.name] = gl.getAttribLocation(p, x.name); }
  return { p, u, a };
}
const rgbOf = (css, d) => { const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(css || ''); return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : d; };
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

export function openViewer(host, source, settings = null) {
  const t = host.t;
  let S = cleanSettings(settings || host.storage?.get?.('viewer') || DEFAULTS);
  let src = source, base = source.epw, epw = source.epw, place = epw.location, D = epw.n / 24;
  let edits = {}, cmp = null, cmpG = null, sunPos = null;   // changes to the file's columns; the station compared with; where the sun is each hour
  let avail = [], G = null, ST = null, SC = null, M = metric(S.metric), keys = null;
  let nPrev = null, nNext = null, okNext = null, mix = 1, mixAt = 0, said = '', bad = false, hover = null, frames = 0, raf = 0, last = 0, closed = false;
  let sunCache = null;
  if (!document.getElementById('wxv-css')) document.head.append(el('style', { id: 'wxv-css' }, CSS));

  /* ---- words ---- */
  const U = () => (S.units === 'us' && M.us ? M.us : M);
  const unitOf = (m = M) => (S.units === 'us' && m.us ? m.us.unit : m.unit);
  const conv = (v, m = M) => (S.units === 'us' && m.us ? m.us.to(v) : v);
  const fmt = (v, m = M) => (Number.isNaN(v) || v === null || v === undefined ? '—' : conv(v, m).toFixed((S.units === 'us' && m.us ? m.us : m).digits) + (unitOf(m) ? ' ' + unitOf(m) : ''));
  const dateLabel = (d) => { const x = dateOf(Math.round(d)); return t('wx.mon.' + x.month) + ' ' + x.day; };
  const clockLabel = (h) => { if (h === null || h === undefined || Number.isNaN(h)) return '—'; const m = Math.round(h * 60), hh = Math.floor(m / 60) % 24; return String(hh).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const mname = (m = M) => t('wx.m.' + m.id);
  const hIdx = () => clamp(S.section.time.hour - 0.5, 0, 23), dIdx = () => clamp(S.section.date.day, 0, D - 1);
  const level = () => (S.section.value.level === null || Number.isNaN(S.section.value.level) ? (ST && ST.n ? ST.mean : 0) : S.section.value.level);
  const norm = (v) => clamp((v - SC.min) / (SC.max - SC.min), 0, 1);
  const sun = (d) => { if (!sunCache) sunCache = Array.from({ length: 366 }, (_, i) => events(place, i % 365)); return sunCache[clamp(Math.round(d), 0, 365)]; };
  const at = (d, h) => {   // the shown value at a fractional day and hour index
    const d0 = clamp(Math.floor(d), 0, D - 1), d1 = Math.min(D - 1, d0 + 1), h0 = clamp(Math.floor(h), 0, 23), h1 = Math.min(23, h0 + 1), fd = clamp(d - d0, 0, 1), fh = clamp(h - h0, 0, 1), v = G.values;
    return (v[d0 * 24 + h0] * (1 - fd) + v[d1 * 24 + h0] * fd) * (1 - fh) + (v[d0 * 24 + h1] * (1 - fd) + v[d1 * 24 + h1] * fd) * fh;
  };

  /* ---- page ---- */
  const glCanvas = el('canvas', { 'data-wxv-gl': '' }), over = el('canvas', { 'data-wxv-over': '' }), flat = el('canvas', { 'data-wxv-2d': '', hidden: true });
  const tableBox = el('div', { className: 'wxv-table', 'data-wxv-table': '', hidden: true });
  const stage = el('div', { className: 'wxv-stage' }, glCanvas, over, flat, tableBox,
    el('div', { className: 'wxv-step' }, el('button', { type: 'button', 'data-wxv-prev': '', onclick: () => stepMetric(-1) }, '‹ ' + t('wx.v.prev')), el('button', { type: 'button', 'data-wxv-next': '', onclick: () => stepMetric(1) }, t('wx.v.next') + ' ›')));
  const side = el('div', { className: 'wxv-side' }), foot = el('div', { className: 'wxv-foot', role: 'status' }), title = el('h3', {});
  const tabs = el('div', { className: 'wxv-tabs', role: 'tablist' });
  const wrap = el('div', { className: 'wxv', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('wx.v.title'), tabindex: '-1', 'data-wx-viewer': '' },
    el('div', { className: 'wxv-head' }, title, tabs, el('button', { type: 'button', 'data-wxv-close': '', onclick: () => close() }, t('wx.v.close'))),
    el('div', { className: 'wxv-body' }, side, stage), foot);
  const focusBack = document.activeElement;
  document.body.append(wrap);

  /* ---- WebGL ---- */
  let gl = null, P = null, PL = null, bufS = null, bufI = null, bufW = null, bufL = null, tex = null, nIndex = 0, glErr = '';
  try {
    gl = glCanvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: true, alpha: false });
    if (gl) {
      const deriv = gl.getExtension('OES_standard_derivatives');
      P = program(gl, VS, (deriv ? '#extension GL_OES_standard_derivatives : enable\n#define DERIV\n' : '') + FS);
      PL = program(gl, LVS, LFS);
      bufS = gl.createBuffer(); bufI = gl.createBuffer(); bufW = gl.createBuffer(); bufL = gl.createBuffer(); tex = gl.createTexture();
    }
  } catch (e) { glErr = String(e.message || e); gl = null; }
  if (!gl && S.view === 'surface') S.view = 'map';

  function listMetrics() { avail = METRICS.filter((m) => has(epw, m.id)).map((m) => m.id); if (!avail.includes(S.metric)) S.metric = avail[0] || 'db'; }

  /** Work the shown grid out again; `blend` starts a transition from what is on screen now. */
  function compute(blend = true) {
    M = metric(S.metric);
    G = rolling(grid(epw, M.id), S.average); ST = stats(G.values);
    cmpG = cmp && has(cmp.epw, M.id) ? rolling(grid(cmp.epw, M.id), S.average) : null;
    if (S.scale.auto) {
      if (M.fixed) SC = { min: M.fixed[0], max: M.fixed[1], step: niceScale(M.fixed[0], M.fixed[1], 5).step };
      else SC = niceScale(M.floor && ST.min >= 0 ? 0 : ST.min, ST.max);
    } else SC = { min: S.scale.min, max: S.scale.max, step: niceScale(S.scale.min, S.scale.max).step };
    if (!ST.n) SC = { min: 0, max: 1, step: 0.2 };
    const N = D * 24, shown = nNext && nNext.length === N ? Float32Array.from(nNext, (x, i) => (nPrev ? nPrev[i] + (x - nPrev[i]) * EASE[S.transition.ease](mix) : x)) : null;
    nNext = new Float32Array(N); okNext = new Uint8Array(N);
    for (let i = 0; i < N; i++) { const v = G.values[i]; okNext[i] = Number.isNaN(v) ? 0 : 1; nNext[i] = okNext[i] ? norm(v) : 0; }
    if (blend && shown && S.transition.secs > 0 && S.transition.ease !== 'none') { nPrev = shown; mix = 0; mixAt = performance.now(); } else { nPrev = null; mix = 1; }
    upload();
  }
  function upload() {
    if (!gl) return;
    const N = D * 24, v = new Float32Array(N * 6);
    for (let d = 0; d < D; d++) for (let h = 0; h < 24; h++) { const i = d * 24 + h; v.set([d / (D - 1), h / 23, nPrev ? nPrev[i] : nNext[i], nNext[i], okNext[i], 1], i * 6); }
    gl.bindBuffer(gl.ARRAY_BUFFER, bufS); gl.bufferData(gl.ARRAY_BUFFER, v, gl.DYNAMIC_DRAW);
    const ix = new Uint16Array((D - 1) * 23 * 6);
    let k = 0;
    for (let d = 0; d < D - 1; d++) for (let h = 0; h < 23; h++) { const a = d * 24 + h, b = a + 24; ix.set([a, b, a + 1, a + 1, b, b + 1], k); k += 6; }
    nIndex = k;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufI); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ix, gl.STATIC_DRAW);
    ramp();
  }
  function ramp() {
    if (!gl) return;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, rampBytes(S.ramp, { reverse: S.reverse, bands: S.bands }));
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, S.bands > 1 ? gl.NEAREST : gl.LINEAR], [gl.TEXTURE_MAG_FILTER, S.bands > 1 ? gl.NEAREST : gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  }
  const color = (n) => { const c = rampColor(S.ramp, n, { reverse: S.reverse, bands: S.bands }); return 'rgb(' + c.join(',') + ')'; };

  /* ---- camera ---- */
  const FOV = 32 * Math.PI / 180;
  function camera(W, H) {
    const c = S.camera, az = c.az * Math.PI / 180, e = clamp(c.el, -90, 90) * Math.PI / 180, dir = [Math.cos(e) * Math.cos(az), Math.cos(e) * Math.sin(az), Math.sin(e)];
    const f = [-dir[0], -dir[1], -dir[2]], up0 = Math.abs(c.el) > 89 ? [-Math.cos(az) * Math.sign(c.el), -Math.sin(az) * Math.sign(c.el), 0] : [0, 0, 1];
    const r = unit(cross(f, up0)), u = cross(r, f);
    const tg = [r[0] * c.tx + u[0] * c.ty, r[1] * c.tx + u[1] * c.ty, S.size.z * 0.4 + r[2] * c.tx + u[2] * c.ty];
    const eye = [tg[0] + dir[0] * c.dist, tg[1] + dir[1] * c.dist, tg[2] + dir[2] * c.dist], asp = W / Math.max(1, H), hh = c.dist * Math.tan(FOV / 2);
    const proj = c.proj === 'perspective' ? perspective(FOV, asp, 0.05, 60) : ortho(hh * asp, hh, -30, 60);
    const mvp = mul(proj, lookAt(eye, f, r, u));
    return { mvp, eye, dir, r, u };
  }
  const PRESET = { plan: [-90, 90], year: [-90, 0], day: [0, 0] };
  function setProjection(p) {
    const was = S.camera.proj;
    S.camera.proj = p;
    if (PRESET[p]) [S.camera.az, S.camera.el] = PRESET[p];
    else if (PRESET[was]) { S.camera.az = DEFAULTS.camera.az; S.camera.el = DEFAULTS.camera.el; }   // back from a flat view: the usual three-quarter look
    fit(false); sync(); need();
  }
  function fit(redraw = true) {
    S.camera.tx = 0; S.camera.ty = 0;
    const W = Math.max(2, stage.clientWidth), H = Math.max(2, stage.clientHeight), asp = W / H, k = camera(W, H), tg = [0, 0, S.size.z * 0.4];
    let hw = 0, hh = 0, deep = 0;   // how far the box reaches to the side, up and towards the eye, seen from where the camera looks
    for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) for (const z of [0, 1]) {
      const p = [x * S.size.x - tg[0], y * S.size.y - tg[1], z * S.size.z - tg[2]];
      hw = Math.max(hw, Math.abs(dot(p, k.r))); hh = Math.max(hh, Math.abs(dot(p, k.u))); deep = Math.max(deep, dot(p, k.dir));
    }
    const need_ = Math.max(hh, hw / asp) * 1.1 / Math.tan(FOV / 2);
    S.camera.dist = clamp(need_ + (S.camera.proj === 'perspective' ? deep * 0.45 : 0), 0.5, 20);
    if (redraw) { sync(); need(); }
  }

  /* ---- drawing the surface ---- */
  function walls(block) {
    const out = [], a = nPrev || nNext, b = nNext;
    const samp = (arr, d, h) => {
      const d0 = clamp(Math.floor(d), 0, D - 1), d1 = Math.min(D - 1, d0 + 1), h0 = clamp(Math.floor(h), 0, 23), h1 = Math.min(23, h0 + 1), fd = d - d0, fh = h - h0;
      return (arr[d0 * 24 + h0] * (1 - fd) + arr[d1 * 24 + h0] * fd) * (1 - fh) + (arr[d0 * 24 + h1] * (1 - fd) + arr[d1 * 24 + h1] * fd) * fh;
    };
    const okAt = (d, h) => okNext[clamp(Math.floor(d), 0, D - 1) * 24 + clamp(Math.floor(h), 0, 23)] && okNext[Math.min(D - 1, Math.ceil(d)) * 24 + Math.min(23, Math.ceil(h))];
    const seg = (d1, h1, d2, h2) => {
      if (!okAt(d1, h1) || !okAt(d2, h2)) return;
      const p = [d1 / (D - 1), h1 / 23, samp(a, d1, h1), samp(b, d1, h1), 1], q = [d2 / (D - 1), h2 / 23, samp(a, d2, h2), samp(b, d2, h2), 1];
      out.push(...p, 1, ...q, 1, ...p, 0, ...p, 0, ...q, 1, ...q, 0);
    };
    if (block) {
      for (let d = 0; d < D - 1; d++) { seg(d, 0, d + 1, 0); seg(d, 23, d + 1, 23); }
      for (let h = 0; h < 23; h++) { seg(0, h, 0, h + 1); seg(D - 1, h, D - 1, h + 1); }
    }
    const edge = out.length / 6;
    if (S.section.date.on) for (let h = 0; h < 23; h++) seg(dIdx(), h, dIdx(), h + 1);
    if (S.section.time.on) for (let d = 0; d < D - 1; d++) seg(d, hIdx(), d + 1, hIdx());
    return { data: new Float32Array(out), edge, count: out.length / 6 };
  }
  function lines(cam, clip) {
    const frame = [], gridL = [], cut = [], sunL = [];
    const L = (arr, ...p) => arr.push(...p);
    for (const z of [0, 1]) L(z ? gridL : frame, 0, 0, z, 1, 0, z, 1, 0, z, 1, 1, z, 1, 1, z, 0, 1, z, 0, 1, z, 0, 0, z);
    for (const [x, y] of [[0, 0], [1, 0], [1, 1], [0, 1]]) L(gridL, x, y, 0, x, y, 1);
    for (let m = 1; m < 12; m++) { const x = MONTH_START[m] / (D - 1); L(gridL, x, 0, 0, x, 1, 0); }
    for (const c of [6, 12, 18]) { const y = (c - 0.5) / 23; L(gridL, 0, y, 0, 1, y, 0); }
    const bx = cam.eye[0] > 0 ? 0 : 1, by = cam.eye[1] < 0 ? 1 : 0;   // the two far walls carry the value lines
    for (let v = SC.min + SC.step; v < SC.max - SC.step * 1e-6; v += SC.step) { const z = norm(v); L(gridL, bx, 0, z, bx, 1, z, 0, by, z, 1, by, z); }
    const eNow = EASE[S.transition.ease](mix), z = (i) => (nPrev ? nPrev[i] + (nNext[i] - nPrev[i]) * eNow : nNext[i]);
    const zz = (d, h) => { const d0 = clamp(Math.floor(d), 0, D - 1), d1 = Math.min(D - 1, d0 + 1), h0 = clamp(Math.floor(h), 0, 23), h1 = Math.min(23, h0 + 1), fd = d - d0, fh = h - h0; return (z(d0 * 24 + h0) * (1 - fd) + z(d1 * 24 + h0) * fd) * (1 - fh) + (z(d0 * 24 + h1) * (1 - fd) + z(d1 * 24 + h1) * fd) * fh; };
    const lv = norm(level()), cap = S.block && S.section.value.on ? (x) => Math.min(x, lv) : (x) => x;
    const keepX = (d) => !clip[0] || (d / (D - 1) - dIdx() / (D - 1)) * clip[0] <= 1e-6, keepY = (h) => !clip[1] || (h / 23 - hIdx() / 23) * clip[1] <= 1e-6;   // a cut block shows only the part that is left
    if (S.section.date.on) { const x = dIdx() / (D - 1); for (let h = 0; h < 23; h++) if (keepY(h) && keepY(h + 1)) L(cut, x, h / 23, cap(zz(dIdx(), h)) + 0.002, x, (h + 1) / 23, cap(zz(dIdx(), h + 1)) + 0.002); L(cut, x, 0, 0, x, 1, 0); }
    if (S.section.time.on) { const y = hIdx() / 23; for (let d = 0; d < D - 1; d++) if (keepX(d) && keepX(d + 1)) L(cut, d / (D - 1), y, cap(zz(d, hIdx())) + 0.002, (d + 1) / (D - 1), y, cap(zz(d + 1, hIdx())) + 0.002); L(cut, 0, y, 0, 1, y, 0); }
    if (S.section.value.on) L(cut, 0, 0, lv, 1, 0, lv, 1, 0, lv, 1, 1, lv, 1, 1, lv, 0, 1, lv, 0, 1, lv, 0, 0, lv);
    if (S.sun) for (const k of ['sunrise', 'sunset']) for (let d = 0; d < D - 1; d++) { const a = sun(d)[k], b = sun(d + 1)[k]; if (a === null || b === null) continue; L(sunL, d / (D - 1), clamp((a - 0.5) / 23, 0, 1), 0.001, (d + 1) / (D - 1), clamp((b - 0.5) / 23, 0, 1), 0.001); }
    return [[frame, 0.75], [gridL, 0.22], [cut, 1], [sunL, -1]];
  }
  function drawSurface() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.max(2, Math.round(stage.clientWidth * dpr)), H = Math.max(2, Math.round(stage.clientHeight * dpr));
    for (const c of [glCanvas, over]) if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
    const cs = getComputedStyle(wrap), bg = rgbOf(cs.backgroundColor, [255, 255, 255]), ink = rgbOf(cs.color, [20, 30, 40]), cam = camera(W, H);
    gl.viewport(0, 0, W, H); gl.clearColor(bg[0] / 255, bg[1] / 255, bg[2] / 255, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const lv = norm(level()), sec = [dIdx() / (D - 1), hIdx() / 23, lv], e = EASE[S.transition.ease](mix);
    const clip = S.block ? [S.section.date.on ? (cam.eye[0] > 0 ? 1 : -1) : 0, S.section.time.on ? (cam.eye[1] > 0 ? 1 : -1) : 0, S.section.value.on ? 1 : 0] : [0, 0, 0];
    gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.u.u_mvp, false, cam.mvp); gl.uniform3f(P.u.u_size, S.size.x, S.size.y, S.size.z); gl.uniform3fv(P.u.u_sec, sec); gl.uniform3fv(P.u.u_clip, clip);
    gl.uniform1f(P.u.u_mix, e); gl.uniform1f(P.u.u_iso, S.iso ? (SC.max - SC.min) / SC.step : 0); gl.uniform1f(P.u.u_light, S.light ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(P.u.u_ramp, 0);
    const bind = (buf) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      for (const [n, size, off] of [['a_xy', 2, 0], ['a_n', 2, 8], ['a_ok', 1, 16], ['a_top', 1, 20]]) if (P.a[n] >= 0) { gl.enableVertexAttribArray(P.a[n]); gl.vertexAttribPointer(P.a[n], size, gl.FLOAT, false, 24, off); }
    };
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1, 1);
    bind(bufS); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufI);
    gl.uniform1f(P.u.u_mode, 0); gl.uniform1f(P.u.u_alpha, 1); gl.depthMask(true);
    gl.drawElements(gl.TRIANGLES, nIndex, gl.UNSIGNED_SHORT, 0);
    const w = walls(S.block);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufW); gl.bufferData(gl.ARRAY_BUFFER, w.data, gl.DYNAMIC_DRAW);
    if (S.block) {
      if (S.section.value.on) { gl.uniform1f(P.u.u_mode, 1); gl.drawElements(gl.TRIANGLES, nIndex, gl.UNSIGNED_SHORT, 0); }
      bind(bufW); gl.uniform1f(P.u.u_mode, 2); gl.uniform1f(P.u.u_iso, 0);
      if (w.count) gl.drawArrays(gl.TRIANGLES, 0, w.count);
    } else {
      gl.depthMask(false);
      if (S.section.value.on) { gl.uniform1f(P.u.u_mode, 1); gl.uniform1f(P.u.u_alpha, 0.6); gl.drawElements(gl.TRIANGLES, nIndex, gl.UNSIGNED_SHORT, 0); }
      bind(bufW); gl.uniform1f(P.u.u_mode, 2); gl.uniform1f(P.u.u_alpha, 0.55);
      if (w.count > w.edge) gl.drawArrays(gl.TRIANGLES, w.edge, w.count - w.edge);
      gl.depthMask(true);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);
    for (const n of ['a_xy', 'a_n', 'a_ok', 'a_top']) if (P.a[n] >= 0) gl.disableVertexAttribArray(P.a[n]);
    gl.useProgram(PL.p); gl.uniformMatrix4fv(PL.u.u_mvp, false, cam.mvp); gl.uniform3f(PL.u.u_size, S.size.x, S.size.y, S.size.z);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufL); gl.enableVertexAttribArray(PL.a.a_pos);
    for (const [arr, alpha] of lines(cam, clip)) {
      if (!arr.length) continue;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.DYNAMIC_DRAW); gl.vertexAttribPointer(PL.a.a_pos, 3, gl.FLOAT, false, 0, 0);
      if (alpha < 0) gl.uniform4f(PL.u.u_color, 0.95, 0.55, 0.1, 0.95); else gl.uniform4f(PL.u.u_color, ink[0] / 255, ink[1] / 255, ink[2] / 255, alpha);
      gl.drawArrays(gl.LINES, 0, arr.length / 3);
    }
    gl.disableVertexAttribArray(PL.a.a_pos);
    labels(cam, W, H, dpr, ink);
    wrap._cam = { cam, W, H };
  }
  function labels(cam, W, H, dpr, ink) {
    const c = over.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    // i18n-ignore: CSS, selector, class name or search keywords: no words a person reads (words-11)
    c.font = Math.round(12 * dpr) + 'px system-ui, sans-serif'; c.fillStyle = 'rgb(' + ink.join(',') + ')'; c.textBaseline = 'middle';
    const pr = (x, y, z) => { const p = xf(cam.mvp, (x - 0.5) * S.size.x, (y - 0.5) * S.size.y, z * S.size.z); return p[3] <= 0 ? null : [(p[0] / p[3] + 1) / 2 * W, (1 - p[1] / p[3]) / 2 * H]; };
    const o = pr(0.5, 0.5, 0);
    const put = (text, x, y, z, push = 16) => {
      const p = pr(x, y, z);
      if (!p || !o) return;
      const dx = p[0] - o[0], dy = p[1] - o[1], l = Math.hypot(dx, dy) || 1;
      c.textAlign = dx / l > 0.3 ? 'left' : dx / l < -0.3 ? 'right' : 'center';
      c.fillText(text, p[0] + dx / l * push * dpr, p[1] + dy / l * push * dpr);
    };
    const ny = cam.eye[1] < 0 ? 0 : 1, nx = cam.eye[0] > 0 ? 1 : 0;
    if (Math.abs(cam.dir[1]) > 0.08 || Math.abs(cam.dir[2]) > 0.5) for (let m = 0; m < 12; m++) put(t('wx.mon.' + (m + 1)), (MONTH_START[m] + 15) / (D - 1), ny, 0);
    if (Math.abs(cam.dir[0]) > 0.08 || Math.abs(cam.dir[2]) > 0.5) for (const h of [0, 6, 12, 18, 24]) put(h === 24 ? '24:00' : clockLabel(h), nx, clamp((h - 0.5) / 23, 0, 1), 0);
    if (Math.abs(cam.dir[2]) < 0.97) for (let v = SC.min + SC.step; v <= SC.max + SC.step * 1e-6; v += SC.step) put(fmtTick(v), nx, 1 - ny, norm(v), 10);   // the lowest value sits on the floor, where the hours are written
    legend(c, W, H, dpr);
  }
  const fmtTick = (v) => { const x = conv(v), d = Math.abs(conv(SC.step) - conv(0)) < 1 ? 2 : Math.abs(conv(SC.step) - conv(0)) < 5 && !Number.isInteger(x) ? 1 : 0; return String(Number(x.toFixed(d))); };
  function legend(c, W, H, dpr) {
    const h = Math.min(H * 0.5, 260 * dpr), x = W - 64 * dpr, y = 26 * dpr, w = 14 * dpr;
    for (let i = 0; i < h; i++) { c.fillStyle = color(1 - i / (h - 1)); c.fillRect(x, y + i, w, 1.5); }
    c.fillStyle = getComputedStyle(wrap).color; c.textAlign = 'left'; c.textBaseline = 'middle';
    for (let v = SC.min; v <= SC.max + SC.step * 1e-6; v += SC.step) c.fillText(fmtTick(v), x + w + 5 * dpr, y + (1 - norm(v)) * (h - 1));
    c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(unitOf() || '', x + w, y - 5 * dpr);
  }
  /** What is under a point of the surface canvas (CSS pixels) → { d, h } or null. */
  function pick(px, py) {
    const k = wrap._cam;
    if (!k) return null;
    const inv = invert(k.cam.mvp), r = glCanvas.getBoundingClientRect();
    if (!inv) return null;
    const nx = (px - r.left) / r.width * 2 - 1, ny = 1 - (py - r.top) / r.height * 2;
    const A = xf(inv, nx, ny, -1), B = xf(inv, nx, ny, 1), a = A.map((x) => x / A[3]), b = B.map((x) => x / B[3]);
    let floor = null;
    for (let i = 0, was = null; i <= 800; i++) {
      const f = i / 800, bx = (a[0] + (b[0] - a[0]) * f) / S.size.x + 0.5, by = (a[1] + (b[1] - a[1]) * f) / S.size.y + 0.5, bz = (a[2] + (b[2] - a[2]) * f) / S.size.z;
      if (bx < 0 || bx > 1 || by < 0 || by > 1) { was = null; continue; }
      const d = bx * (D - 1), h = by * 23, zs = norm(at(d, h)), above = bz > zs;
      if (!Number.isNaN(zs) && was !== null && was !== above) return { d, h };
      if (bz <= 0 && !floor) floor = { d, h };
      was = Number.isNaN(zs) ? null : above;
    }
    return floor;
  }

  /* ---- the flat charts ---- */
  function prep2d() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.max(2, stage.clientWidth), H = Math.max(2, stage.clientHeight);
    if (flat.width !== Math.round(W * dpr) || flat.height !== Math.round(H * dpr)) { flat.width = Math.round(W * dpr); flat.height = Math.round(H * dpr); }
    const c = flat.getContext('2d'), cs = getComputedStyle(wrap);
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = cs.backgroundColor; c.fillRect(0, 0, W, H);
    c.font = '12px system-ui, sans-serif'; c.fillStyle = cs.color; c.strokeStyle = cs.color; c.lineWidth = 1; c.globalAlpha = 1;
    return { c, W, H, ink: cs.color };
  }
  const head2d = (c, text, x = 56, y = 20) => { c.save(); c.font = '600 13px system-ui, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(text, x, y); c.restore(); };
  function axes(c, R, { xMonths = false, xHours = false, yHours = false, yScale = null }) {
    c.save(); c.globalAlpha = 0.9; c.strokeRect(R.x, R.y, R.w, R.h); c.textBaseline = 'top'; c.textAlign = 'center';
    if (xMonths) for (let m = 0; m < 12; m++) { c.fillText(t('wx.mon.' + (m + 1)), R.x + (MONTH_START[m] + 15) / (D - 1) * R.w, R.y + R.h + 5); if (m) { c.globalAlpha = 0.15; c.beginPath(); c.moveTo(R.x + MONTH_START[m] / (D - 1) * R.w, R.y); c.lineTo(R.x + MONTH_START[m] / (D - 1) * R.w, R.y + R.h); c.stroke(); c.globalAlpha = 0.9; } }
    if (xHours) for (let h = 0; h <= 24; h += 3) c.fillText(String(h), R.x + clamp((h - 0.5) / 23, 0, 1) * R.w, R.y + R.h + 5);
    c.textAlign = 'right'; c.textBaseline = 'middle';
    if (yHours) for (let h = 0; h <= 24; h += 6) c.fillText(h === 24 ? '24:00' : clockLabel(h), R.x - 6, R.y + R.h - clamp((h - 0.5) / 23, 0, 1) * R.h);
    if (yScale) for (let v = yScale.min; v <= yScale.max + yScale.step * 1e-6; v += yScale.step) { const y = R.y + R.h - (v - yScale.min) / (yScale.max - yScale.min) * R.h; c.fillText(yScale.plain ? String(Number(v.toFixed(2))) : fmtTick(v), R.x - 6, y); c.globalAlpha = 0.12; c.beginPath(); c.moveTo(R.x, y); c.lineTo(R.x + R.w, y); c.stroke(); c.globalAlpha = 0.9; }
    c.restore();
  }
  let mapRect = null;
  function drawMap() {
    const { c, W, H } = prep2d(), R = mapRect = { x: 60, y: 34, w: W - 150, h: H - 80 };
    head2d(c, mname() + (unitOf() ? ' (' + unitOf() + ')' : '') + (S.average ? ' · ' + t('wx.v.avg.n', { n: S.average }) : ''));
    const img = new ImageData(D, 24);
    for (let d = 0; d < D; d++) for (let h = 0; h < 24; h++) { const i = d * 24 + h, o = ((23 - h) * D + d) * 4, k = okNext[i] ? rampColor(S.ramp, nNext[i], { reverse: S.reverse, bands: S.bands }) : null; if (k) img.data.set([k[0], k[1], k[2], 255], o); }
    const tmp = el('canvas', { width: D, height: 24 });
    tmp.getContext('2d').putImageData(img, 0, 0);
    c.imageSmoothingEnabled = S.bands <= 1; c.drawImage(tmp, R.x, R.y, R.w, R.h);
    const X = (d) => R.x + d / (D - 1) * R.w, Y = (h) => R.y + R.h - h / 23 * R.h;
    const strokeSegs = (segs) => { c.beginPath(); for (const s of segs) { c.moveTo(X(s[0]), Y(s[1])); c.lineTo(X(s[2]), Y(s[3])); } c.stroke(); };
    c.save(); c.beginPath(); c.rect(R.x, R.y, R.w, R.h); c.clip();
    if (S.iso) { c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.7; for (let v = SC.min + SC.step; v < SC.max - SC.step * 1e-6; v += SC.step) strokeSegs(contour(G, v)); }
    if (S.section.value.on) { c.strokeStyle = '#000'; c.lineWidth = 2.2; strokeSegs(contour(G, level())); c.strokeStyle = '#fff'; c.lineWidth = 0.9; strokeSegs(contour(G, level())); }
    if (S.sun) { c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 1.4; c.setLineDash([5, 4]); for (const k of ['sunrise', 'sunset']) { c.beginPath(); for (let d = 0; d < D; d++) { const v = sun(d)[k]; if (v === null) continue; c.lineTo(X(d), Y(clamp(v - 0.5, 0, 23))); } c.stroke(); } c.setLineDash([]); }
    c.strokeStyle = '#000'; c.lineWidth = 1;
    if (S.section.date.on) { c.beginPath(); c.moveTo(X(dIdx()), R.y); c.lineTo(X(dIdx()), R.y + R.h); c.stroke(); }
    if (S.section.time.on) { c.beginPath(); c.moveTo(R.x, Y(hIdx())); c.lineTo(R.x + R.w, Y(hIdx())); c.stroke(); }
    c.restore();
    c.strokeStyle = c.fillStyle; axes(c, R, { xMonths: true, yHours: true });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    // i18n-ignore: CSS, selector, class name or search keywords: no words a person reads (words-11)
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = Math.round(12 * dpr) + 'px system-ui, sans-serif'; legend(c, flat.width, flat.height, dpr); c.restore();
  }
  function line(c, R, sc, n, f, { fill = null, width = 1.6, style = null } = {}) {
    const X = (i) => R.x + i / (n - 1) * R.w, Y = (v) => R.y + R.h - clamp((v - sc.min) / (sc.max - sc.min), 0, 1) * R.h;
    c.save(); if (style) c.strokeStyle = style; c.lineWidth = width;
    if (fill) { c.globalAlpha = 0.22; c.fillStyle = fill; c.beginPath(); let any = false; for (let i = 0; i < n; i++) { const v = f(i); if (Number.isNaN(v[1])) continue; c[any ? 'lineTo' : 'moveTo'](X(i), Y(v[1])); any = true; } for (let i = n - 1; i >= 0; i--) { const v = f(i); if (!Number.isNaN(v[0])) c.lineTo(X(i), Y(v[0])); } c.closePath(); c.fill(); }
    else { c.beginPath(); let pen = false; for (let i = 0; i < n; i++) { const v = f(i); if (Number.isNaN(v)) { pen = false; continue; } c[pen ? 'lineTo' : 'moveTo'](X(i), Y(v)); pen = true; } c.stroke(); }
    c.restore();
  }
  function drawProfiles() {
    const { c, W, H } = prep2d(), h2 = (H - 110) / 2, A = { x: 60, y: 34, w: W - 90, h: h2 }, B = { x: 60, y: 34 + h2 + 50, w: W - 90, h: h2 }, v = G.values, acc = color(0.85);
    const day = Array.from({ length: D }, (_, d) => stats(v.subarray(d * 24, d * 24 + 24)));
    head2d(c, t('wx.v.prof.year', { metric: mname(), time: clockLabel(S.section.time.hour) }));
    axes(c, A, { xMonths: true, yScale: SC });
    line(c, A, SC, D, (d) => [day[d].min, day[d].max], { fill: acc });
    line(c, A, SC, D, (d) => day[d].mean, { width: 1, style: 'rgba(128,128,128,.9)' });
    line(c, A, SC, D, (d) => at(d, hIdx()), { style: acc, width: 1.8 });
    if (S.section.date.on) { c.beginPath(); c.moveTo(A.x + dIdx() / (D - 1) * A.w, A.y); c.lineTo(A.x + dIdx() / (D - 1) * A.w, A.y + A.h); c.stroke(); }
    const mo = dateOf(dIdx()).month, a = MONTH_START[mo - 1], b = Math.min(D, MONTH_START[mo]);
    const hour = Array.from({ length: 24 }, (_, h) => { const xs = []; for (let d = a; d < b; d++) xs.push(v[d * 24 + h]); return stats(xs); });
    head2d(c, t('wx.v.prof.day', { metric: mname(), date: dateLabel(dIdx()), month: t('wx.month.' + mo) }), 56, B.y - 14);
    axes(c, B, { xHours: true, yScale: SC });
    line(c, B, SC, 24, (h) => [hour[h].min, hour[h].max], { fill: acc });
    line(c, B, SC, 24, (h) => hour[h].mean, { width: 1, style: 'rgba(128,128,128,.9)' });
    line(c, B, SC, 24, (h) => at(dIdx(), h), { style: acc, width: 2 });
    if (S.section.time.on) { c.beginPath(); c.moveTo(B.x + hIdx() / 23 * B.w, B.y); c.lineTo(B.x + hIdx() / 23 * B.w, B.y + B.h); c.stroke(); }
    if (S.section.value.on) for (const R of [A, B]) { const y = R.y + R.h - norm(level()) * R.h; c.save(); c.setLineDash([6, 4]); c.beginPath(); c.moveTo(R.x, y); c.lineTo(R.x + R.w, y); c.stroke(); c.restore(); }
  }
  /** The hours of the chosen period (the whole year = null). */
  function periodOf(e) {
    const per = S.rose.period, H_ = e.hours;
    if (per === 'year') return null;
    if (per === 'day' || per === 'night') { const a = grid(e, 'alt').values; return per === 'day' ? (i) => a[i] > 0 : (i) => a[i] <= 0; }
    return (i) => H_.month[i] === Number(per.slice(1));
  }
  const periodLabel = () => { const per = S.rose.period; return t('wx.v.per.' + (per[0] === 'm' ? 'm' : per), { month: per[0] === 'm' ? t('wx.month.' + per.slice(1)) : '' }); };
  const delta = (v, m = M) => conv(v, m) - conv(0, m);   // a difference in the shown units
  function legendFlat(c, W, sc, unit, col, y = 40, h = 200, show = (v) => String(Number(v.toFixed(2)))) {
    const x = W - 74, w = 14;
    for (let i = 0; i < h; i++) { c.fillStyle = col(1 - i / (h - 1)); c.fillRect(x, y + i, w, 1.5); }
    c.fillStyle = getComputedStyle(wrap).color; c.textAlign = 'left'; c.textBaseline = 'middle';
    for (let v = sc.min; v <= sc.max + sc.step * 1e-6; v += sc.step) c.fillText(show(v), x + w + 5, y + (1 - (v - sc.min) / (sc.max - sc.min)) * (h - 1));
    c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(unit, x + w + 30, y - 5);
  }
  // i18n-ignore: CSS, selector, class name or search keywords: no words a person reads (words-11)
  const mainLegend = (c) => { const dpr = Math.min(2, window.devicePixelRatio || 1); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = Math.round(12 * dpr) + 'px system-ui, sans-serif'; legend(c, flat.width, flat.height, dpr); c.restore(); };
  const comfortNow = () => comfort(epw, S.comfort, periodOf(epw));
  const comfortText = (cf = comfortNow()) => t('wx.v.comfort.count', { n: cf.inside.toLocaleString('en-US'), of: cf.n.toLocaleString('en-US'), pct: (cf.inside / Math.max(1, cf.n) * 100).toFixed(1), t0: fmt(S.comfort.tmin, metric('db')).replace(/ .*/, ''), t1: fmt(S.comfort.tmax, metric('db')), rh0: S.comfort.rhmin, rh1: S.comfort.rhmax });
  function drawPsychro() {
    const { c, W, H, ink } = prep2d(), R = { x: 64, y: 44, w: W - 190, h: H - 104 }, want = periodOf(epw), byMetric = S.psy === 'metric', mdb = metric('db'), mw = metric('w');
    const ts = stats(epw.hours.db), t0 = Math.floor((ts.min - 2) / 5) * 5, t1 = Math.ceil((ts.max + 2) / 5) * 5, tStep = 1, wStep = 0.5;
    const B = psychroBins(epw, { t0, tStep, wStep, hours: want, value: byMetric ? grid(epw, M.id).values : null }), wTop = Math.max(10, Math.ceil((B.wMax + 1) / 5) * 5), cnt = niceScale(0, Math.max(1, B.most), 5);
    const X = (x) => R.x + (x - t0) / (t1 - t0) * R.w, Y = (w) => R.y + R.h - w / wTop * R.h;
    head2d(c, t('wx.v.psy.title', { period: periodLabel(), by: byMetric ? mname() : t('wx.v.psy.hours') }));
    c.save(); c.beginPath(); c.rect(R.x, R.y, R.w, R.h); c.clip();
    for (const [k, cell] of B.cells) {
      const [ti, wi] = k.split(',').map(Number);
      if (byMetric && !cell.vn) continue;
      c.fillStyle = byMetric ? color(norm(cell.sum / cell.vn)) : color(cell.n / cnt.max);
      c.fillRect(X(t0 + ti * tStep), Y((wi + 1) * wStep), R.w / (t1 - t0) * tStep + 0.6, R.h / wTop * wStep + 0.6);
    }
    c.strokeStyle = ink;
    for (let rh = 10; rh <= 100; rh += 10) { c.globalAlpha = rh === 100 ? 1 : 0.35; c.lineWidth = rh === 100 ? 1.8 : 0.8; c.beginPath(); for (let x = t0; x <= t1 + 1e-9; x += 0.5) c.lineTo(X(x), Y(ratio(x, rh, B.p) * 1000)); c.stroke(); }
    c.globalAlpha = 1;
    if (S.comfort.on) {
      const q = S.comfort; c.beginPath();
      for (let x = q.tmin; x <= q.tmax + 1e-9; x += (q.tmax - q.tmin) / 24) c.lineTo(X(x), Y(ratio(x, q.rhmin, B.p) * 1000));
      for (let x = q.tmax; x >= q.tmin - 1e-9; x -= (q.tmax - q.tmin) / 24) c.lineTo(X(x), Y(ratio(x, q.rhmax, B.p) * 1000));
      c.closePath(); c.fillStyle = 'rgba(255,255,255,.28)'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = '#000'; c.stroke(); c.lineWidth = 1; c.strokeStyle = '#fff'; c.stroke();
    }
    c.restore(); c.strokeStyle = ink; c.fillStyle = ink; c.lineWidth = 1; c.strokeRect(R.x, R.y, R.w, R.h);
    c.textAlign = 'center'; c.textBaseline = 'top';
    for (let x = t0; x <= t1; x += 5) c.fillText(String(Number(conv(x, mdb).toFixed(0))), X(x), R.y + R.h + 5);
    c.fillText(t('wx.m.db') + ' (' + unitOf(mdb) + ')', R.x + R.w / 2, R.y + R.h + 22);
    c.textAlign = 'right'; c.textBaseline = 'middle';
    for (let w = 0; w <= wTop; w += 5) c.fillText(String(Number(conv(w, mw).toFixed(0))), R.x - 6, Y(w));
    c.save(); c.translate(16, R.y + R.h / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.fillText(t('wx.m.w') + ' (' + unitOf(mw) + ')', 0, 0); c.restore();
    c.textAlign = 'left'; c.globalAlpha = 0.8;
    for (let rh = 20; rh <= 100; rh += 20) { let x = t1; while (x > t0 && ratio(x, rh, B.p) * 1000 > wTop) x -= 0.25; c.fillText(rh + ' %', Math.min(X(x) + 3, R.x + R.w - 30), Math.max(R.y + 8, Y(ratio(x, rh, B.p) * 1000) - 7)); }
    c.globalAlpha = 1;
    if (S.comfort.on) { c.textBaseline = 'middle'; c.fillText(comfortText(comfort(epw, S.comfort, want)), R.x, H - 14); }
    if (byMetric) mainLegend(c); else legendFlat(c, W, cnt, t('wx.v.psy.hours'), (n) => color(n));
  }
  function drawSunpath() {
    const { c, W, H, ink } = prep2d(), cx = W / 2 - 40, cy = H / 2 + 14, Rm = Math.max(60, Math.min(W - 260, H - 110) / 2), want = periodOf(epw);
    const P = (alt, az) => { const r = (90 - alt) / 90 * Rm, a = az * Math.PI / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
    if (!sunPos) { sunPos = new Float32Array(epw.n * 2); for (let i = 0; i < epw.n; i++) { const d = Math.floor(i / 24) % 365, k = epw.hours.hour[i] - 0.5; sunPos[i * 2] = altitude(place, d, k); sunPos[i * 2 + 1] = azimuth(place, d, k); } }
    head2d(c, t('wx.v.sun.title', { metric: mname(), period: periodLabel(), lat: place.lat.toFixed(2), lon: place.lon.toFixed(2) }));
    c.save(); c.globalAlpha = 0.3;
    for (const a of [0, 30, 60]) { c.beginPath(); c.arc(cx, cy, (90 - a) / 90 * Rm, 0, 7); c.stroke(); }
    c.beginPath(); c.moveTo(cx - Rm, cy); c.lineTo(cx + Rm, cy); c.moveTo(cx, cy - Rm); c.lineTo(cx, cy + Rm); c.stroke(); c.restore();
    c.textAlign = 'left'; c.textBaseline = 'bottom';
    for (const a of [30, 60]) c.fillText(a + '°', cx + 3, cy - (90 - a) / 90 * Rm);
    for (let i = 0; i < epw.n; i++) {
      if (sunPos[i * 2] <= 0 || !okNext[i] || (want && !want(i))) continue;
      const p = P(sunPos[i * 2], sunPos[i * 2 + 1]);
      c.fillStyle = color(nNext[i]); c.beginPath(); c.arc(p[0], p[1], 2.6, 0, 7); c.fill();
    }
    const path = (day, width, alpha) => {
      const e = sun(day); if (e.sunrise === null) return;
      c.save(); c.globalAlpha = alpha; c.lineWidth = width; c.beginPath();
      for (let k = e.sunrise; k <= e.sunset + 1e-9; k += 0.1) { const p = P(Math.max(0, altitude(place, day, k)), azimuth(place, day, k)); c.lineTo(p[0], p[1]); }
      c.stroke(); c.restore();
    };
    c.strokeStyle = ink;
    for (let m = 0; m < 12; m++) path(MONTH_START[m] + 20, 0.7, 0.45);
    path(Math.round(dIdx()), 2.2, 1);
    const altNow = altitude(place, Math.round(dIdx()), S.section.time.hour);
    if (altNow > 0) { const p = P(altNow, azimuth(place, Math.round(dIdx()), S.section.time.hour)); c.lineWidth = 2; c.beginPath(); c.arc(p[0], p[1], 7, 0, 7); c.stroke(); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); }
    c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const [k, a] of [['n', 0], ['e', 90], ['s', 180], ['w', 270]]) { const p = P(-7, a); c.fillText(t('wx.v.dir.' + k), p[0], p[1]); }
    c.textAlign = 'left';
    c.fillText(t('wx.v.sun.now', { date: dateLabel(dIdx()), time: clockLabel(S.section.time.hour), alt: altNow.toFixed(1), az: azimuth(place, Math.round(dIdx()), S.section.time.hour).toFixed(0) }), 60, H - 22);
    mainLegend(c);
  }
  function heat(c, R, vals, Dn, colOf) {
    const img = new ImageData(Dn, 24);
    for (let d = 0; d < Dn; d++) for (let h = 0; h < 24; h++) { const v = vals[d * 24 + h]; if (Number.isNaN(v)) continue; const k = colOf(v); img.data.set([k[0], k[1], k[2], 255], ((23 - h) * Dn + d) * 4); }
    const tmp = el('canvas', { width: Dn, height: 24 });
    tmp.getContext('2d').putImageData(img, 0, 0); c.imageSmoothingEnabled = false; c.drawImage(tmp, R.x, R.y, R.w, R.h);
  }
  function drawCompare() {
    const { c, W, H } = prep2d();
    if (!cmp) { head2d(c, t(host.stations ? 'wx.v.cmp.none' : 'wx.v.cmp.nolist')); return; }
    if (!cmpG) { head2d(c, t('wx.v.cmp.nometric', { name: cmp.name, metric: mname() })); return; }
    const Dn = Math.min(D, cmpG.days), h3 = (H - 140) / 3, R = [0, 1, 2].map((i) => ({ x: 60, y: 40 + i * (h3 + 34), w: W - 170, h: h3 }));
    const diff = new Float32Array(Dn * 24);
    for (let i = 0; i < diff.length; i++) diff[i] = G.values[i] - cmpG.values[i];
    const ds = stats(diff), top = niceScale(0, Math.max(Math.abs(ds.min), Math.abs(ds.max)) || 1, 4), rc = (v) => rampColor(S.ramp, norm(v), { reverse: S.reverse, bands: S.bands });
    heat(c, R[0], G.values, Dn, rc); heat(c, R[1], cmpG.values, Dn, rc); heat(c, R[2], diff, Dn, (v) => rampColor('coolwarm', (v + top.max) / (2 * top.max)));
    head2d(c, src.name + ' · ' + mname() + (unitOf() ? ' (' + unitOf() + ')' : ''), 60, R[0].y - 8); head2d(c, cmp.name, 60, R[1].y - 8);
    head2d(c, t('wx.v.cmp.diff', { mean: (delta(ds.mean) >= 0 ? '+' : '') + delta(ds.mean).toFixed(U().digits + 1) + ' ' + unitOf() }), 60, R[2].y - 8);
    for (let i = 0; i < 3; i++) axes(c, R[i], { xMonths: i === 2, yHours: h3 > 90 });
    mainLegend(c);
    legendFlat(c, W, { min: -top.max, max: top.max, step: top.step }, unitOf(), (n) => 'rgb(' + rampColor('coolwarm', n).join(',') + ')', R[2].y, R[2].h, (v) => String(Number(delta(v).toFixed(2))));
  }
  function drawRose() {
    const { c, W, H } = prep2d(), r = windRose(epw, { hours: periodOf(epw) }), ws = metric('ws');
    head2d(c, t('wx.v.rose.title', { period: periodLabel() }));
    if (!r.n) { c.fillText(t('wx.v.none'), 60, 60); return; }
    const cx = W / 2 - 50, cy = H / 2 + 10, Rm = Math.max(40, Math.min(W - 220, H - 110) / 2), tot = r.counts.map((b) => b.reduce((s, x) => s + x, 0)), top = Math.max(...tot, 1) / r.n, sc = niceScale(0, top * 100, 4);
    c.save(); c.globalAlpha = 0.3;
    for (let p = sc.step; p <= sc.max + 1e-9; p += sc.step) { c.beginPath(); c.arc(cx, cy, p / sc.max * Rm, 0, 7); c.stroke(); }
    c.restore();
    c.textAlign = 'left'; c.textBaseline = 'bottom';
    for (let p = sc.step; p <= sc.max + 1e-9; p += sc.step) c.fillText(Number(p.toFixed(1)) + ' %', cx + 3, cy - p / sc.max * Rm);
    const wdg = 2 * Math.PI / r.dirs * 0.42;
    for (let d = 0; d < r.dirs; d++) {
      let from = 0;
      for (let b = 0; b < r.edges.length; b++) {
        const to = from + r.counts[d][b] / r.n * 100 / sc.max * Rm, a = d / r.dirs * 2 * Math.PI - Math.PI / 2;
        if (to > from) { c.fillStyle = color(b / (r.edges.length - 1)); c.beginPath(); c.arc(cx, cy, to, a - wdg, a + wdg); c.arc(cx, cy, from, a + wdg, a - wdg, true); c.closePath(); c.fill(); }
        from = to;
      }
    }
    c.fillStyle = getComputedStyle(wrap).color; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const [k, a] of [['n', -90], ['e', 0], ['s', 90], ['w', 180]]) c.fillText(t('wx.v.dir.' + k), cx + Math.cos(a * Math.PI / 180) * (Rm + 14), cy + Math.sin(a * Math.PI / 180) * (Rm + 14));
    c.textAlign = 'left';
    const lx = Math.min(W - 150, cx + Rm + 50);
    for (let b = 0; b < r.edges.length; b++) { c.fillStyle = color(b / (r.edges.length - 1)); c.fillRect(lx, 50 + b * 20, 14, 14); c.fillStyle = getComputedStyle(wrap).color; c.fillText(b + 1 < r.edges.length ? fmt(r.edges[b], ws).replace(/ .*/, '') + ' – ' + fmt(r.edges[b + 1], ws) : '≥ ' + fmt(r.edges[b], ws), lx + 20, 57 + b * 20); }
    c.fillText(t('wx.v.rose.calm', { pct: (r.calm / r.n * 100).toFixed(1), n: r.n.toLocaleString('en-US') }), lx, 62 + r.edges.length * 20);
  }
  function drawHist() {
    const { c, W, H } = prep2d(), bins = Math.max(4, Math.min(40, Math.round((SC.max - SC.min) / SC.step) * 2)), hg = histogram(G.values, { min: SC.min, max: SC.max, bins }), R = { x: 70, y: 34, w: W - 110, h: H - 84 };
    head2d(c, t('wx.v.hist.title', { metric: mname(), unit: unitOf() }));
    const sc = niceScale(0, Math.max(...hg.counts, 1), 5); sc.plain = true;
    axes(c, R, { yScale: sc });
    for (let b = 0; b < bins; b++) { const h = hg.counts[b] / sc.max * R.h; c.fillStyle = color((b + 0.5) / bins); c.fillRect(R.x + b / bins * R.w + 1, R.y + R.h - h, R.w / bins - 2, h); }
    c.fillStyle = getComputedStyle(wrap).color; c.textAlign = 'center'; c.textBaseline = 'top';
    for (let v = SC.min; v <= SC.max + SC.step * 1e-6; v += SC.step) c.fillText(fmtTick(v), R.x + norm(v) * R.w, R.y + R.h + 5);
    let run = 0;
    c.save(); c.lineWidth = 1.6; c.beginPath(); c.moveTo(R.x, R.y + R.h);
    for (let b = 0; b < bins; b++) { run += hg.counts[b]; c.lineTo(R.x + (b + 1) / bins * R.w, R.y + R.h - run / Math.max(1, hg.n) * R.h); }
    c.stroke(); c.restore();
    const sh = share(G.values, level()), x = R.x + norm(level()) * R.w;
    c.save(); c.setLineDash([6, 4]); c.beginPath(); c.moveTo(x, R.y); c.lineTo(x, R.y + R.h); c.stroke(); c.restore();
    c.textAlign = x > R.x + R.w / 2 ? 'right' : 'left';
    c.fillText(t('wx.v.hist.share', { level: fmt(level()), n: sh.above.toLocaleString('en-US'), pct: (sh.above / Math.max(1, sh.n) * 100).toFixed(1) }), x + (x > R.x + R.w / 2 ? -6 : 6), R.y + 4);
  }
  function drawTable() {
    const mo = monthly(G), th = [t('wx.v.tab.month'), t('wx.v.tab.mean'), t('wx.v.tab.min'), t('wx.v.tab.max'), M.sum ? t('wx.v.tab.sum') : null].filter(Boolean);
    const sumText = (x) => (Number.isNaN(x) ? '—' : M.id === 'rain' ? fmt(x) : (conv(x) / 1000).toFixed(1) + ' k' + unitOf());
    const cf = S.comfort.on ? comfort(epw, S.comfort) : null, mo2 = cmpG ? monthly(cmpG) : null;
    if (cf) th.push(t('wx.v.tab.comfort')); if (mo2) th.push(t('wx.v.tab.other', { name: cmp.name }));
    const row = (name, s, sum, c1, s2) => el('tr', {}, el('td', {}, name), el('td', {}, fmt(s.mean)), el('td', {}, fmt(s.min)), el('td', {}, fmt(s.max)), M.sum ? el('td', {}, sumText(sum)) : null,
      cf ? el('td', {}, c1.inside.toLocaleString('en-US') + ' (' + (c1.inside / Math.max(1, c1.n) * 100).toFixed(0) + ' %)') : null, mo2 ? el('td', {}, fmt(s2.mean)) : null);
    tableBox.replaceChildren(...[el('h4', {}, mname() + (S.average ? ' · ' + t('wx.v.avg.n', { n: S.average }) : '')),
      el('table', { 'data-wxv-months': '' }, el('thead', {}, el('tr', {}, ...th.map((x) => el('th', {}, x)))),
        el('tbody', {}, ...mo.map((s, i) => row(t('wx.month.' + (i + 1)), s, s.sum, cf && cf.months[i], mo2 && mo2[i])), row(t('wx.v.tab.year'), ST, ST.n ? ST.mean * ST.n : NaN, cf, cmpG && stats(cmpG.values)))),
      cf ? el('p', { className: 'wxv-note' }, t('wx.v.comfort.note')) : null,
      M.group === 'derived' ? el('p', { className: 'wxv-note' }, t('wx.mh.' + M.id)) : null].filter(Boolean));
  }
  let stationDots = [];
  function drawStations() {
    const { c, W, H } = prep2d(), all = host.stations ? host.stations() : [];
    head2d(c, t('wx.v.st.title', { n: all.length }));
    stationDots = [];
    if (!all.length) { c.fillText(t('wx.v.st.none'), 60, 60); return; }
    const lats = all.map((x) => x.station.lat), lons = all.map((x) => x.station.lon), la0 = Math.min(...lats), la1 = Math.max(...lats), lo0 = Math.min(...lons), lo1 = Math.max(...lons);
    const k = Math.cos((la0 + la1) / 2 * Math.PI / 180), sx = (W - 140) / Math.max(1e-6, (lo1 - lo0) * k), sy = (H - 120) / Math.max(1e-6, la1 - la0), s = Math.min(sx, sy);
    const X = (lon) => 70 + (lon - lo0) * k * s, Y = (lat) => 50 + (la1 - lat) * s, temps = all.map((x) => x.station.summary.cool.t004), tmin = Math.min(...temps), tmax = Math.max(...temps);
    for (const x of all) {
      const px = X(x.station.lon), py = Y(x.station.lat), here = Math.abs(x.station.lat - place.lat) < 1e-3 && Math.abs(x.station.lon - place.lon) < 1e-3;
      c.fillStyle = color((x.station.summary.cool.t004 - tmin) / Math.max(1e-6, tmax - tmin)); c.beginPath(); c.arc(px, py, here ? 8 : 5.5, 0, 7); c.fill();
      c.strokeStyle = getComputedStyle(wrap).color; c.lineWidth = here ? 2.5 : 0.8; c.stroke();
      stationDots.push({ px, py, x });
    }
    c.fillStyle = getComputedStyle(wrap).color; c.textAlign = 'left'; c.textBaseline = 'middle';
    if (hover && hover.station) c.fillText(hover.station.x.station.name + ' · ' + t('wx.v.st.summer', { t: hover.station.x.station.summary.cool.t004.toFixed(1) }), hover.station.px + 12, hover.station.py);
    c.fillText(t('wx.v.st.hint'), 70, H - 24);
    if (cmp) for (const s of stationDots) if (s.x.set.id + '/' + s.x.station.id === cmp.id) { c.setLineDash([3, 3]); c.lineWidth = 2; c.beginPath(); c.arc(s.px, s.py, 11, 0, 7); c.stroke(); c.setLineDash([]); }
  }

  /* ---- the frame ---- */
  function need() { if (!raf && !closed) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    if (closed) return;
    const dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
    let more = false;
    if (mix < 1) { mix = S.transition.secs > 0 ? Math.min(1, (now - mixAt) / (S.transition.secs * 1000)) : 1; more = mix < 1; if (!more) { nPrev = null; upload(); } }
    const an = S.animate;
    if (an.what !== 'none') {
      more = true;
      if (an.what === 'date') { S.section.date.on = true; S.section.date.day = (S.section.date.day + dt * 20 * an.speed) % (D - 1); }
      if (an.what === 'time') {
        S.section.time.on = true;
        const e = sun(dIdx()), a = an.daytime && e.sunrise !== null ? e.sunrise : 0.5, b = an.daytime && e.sunset !== null ? e.sunset : 23.5;
        let h = S.section.time.hour + dt * 2.5 * an.speed; if (h > b || h < a) h = a; S.section.time.hour = h;
      }
      if (an.what === 'value') { S.section.value.on = true; const span = SC.max - SC.min; let v = level() + dt * span * 0.12 * an.speed; if (v > SC.max) v = SC.min; S.section.value.level = v; }
      syncLive();
    }
    draw(); frames++;
    if (more) need(); else last = 0;
  }
  function draw() {
    const v = S.view, surface = v === 'surface' && gl;
    glCanvas.hidden = over.hidden = !surface; flat.hidden = !(v !== 'table' && !surface); tableBox.hidden = v !== 'table';
    try {
      if (surface) drawSurface(); else if (v === 'map' || v === 'surface') drawMap(); else if (v === 'profiles') drawProfiles(); else if (v === 'rose') drawRose(); else if (v === 'hist') drawHist(); else if (v === 'table') drawTable(); else if (v === 'psychro') drawPsychro(); else if (v === 'sunpath') drawSunpath(); else if (v === 'compare') drawCompare(); else if (v === 'stations') drawStations();
    } catch (e) { said = String(e.message || e); bad = true; }
    footer();
  }
  function footer() {
    const parts = [], d = dIdx(), h = hIdx(), e = sun(d);
    parts.push(t('wx.v.foot.cut', { date: dateLabel(d), time: clockLabel(S.section.time.hour), value: fmt(at(d, h)) }));
    parts.push(t('wx.v.foot.sun', { rise: clockLabel(e.sunrise), set: clockLabel(e.sunset) }));
    parts.push(t('wx.v.foot.stats', { min: fmt(ST.min), mean: fmt(ST.mean), max: fmt(ST.max) }));
    if (S.section.value.on) { const sh = share(G.values, level()); parts.push(t('wx.v.foot.share', { level: fmt(level()), n: sh.above.toLocaleString('en-US'), pct: (sh.above / Math.max(1, sh.n) * 100).toFixed(1) })); }
    if (S.view === 'psychro' && S.comfort.on) parts.push(comfortText());
    if (S.view === 'compare' && cmpG) parts.push(t('wx.v.foot.cmp', { a: fmt(ST.mean), b: fmt(stats(cmpG.values).mean) }));
    if (hover && hover.d !== undefined) parts.push(t('wx.v.foot.hover', { date: dateLabel(hover.d), time: clockLabel(hover.h + 0.5), value: fmt(at(hover.d, hover.h)) }));
    foot.replaceChildren(...parts.map((p, i) => el('span', { 'data-wxv-foot': i }, p)), ...(said ? [el('span', { className: bad ? 'wxv-err' : '', 'data-wxv-said': '' }, said)] : []));
  }

  /* ---- controls ---- */
  const live = [];   // () => void: put the settings back into the boxes
  const changed = (recompute = false, blend = true) => { if (recompute) compute(blend); sync(); need(); };
  const head = (k) => el('h5', {}, t('wx.v.h.' + k));
  function slider(key, min, max, step, get, set, show = (v) => String(v)) {
    const dyn = typeof min === 'function', out = el('output', {}), inp = el('input', { type: 'range', min: dyn ? 0 : min, max: dyn ? 1 : max, step: dyn ? 'any' : step, 'data-wxv-in': key, 'aria-label': t('wx.v.f.' + key), oninput: () => { set(Number(inp.value)); out.textContent = show(get()); } });
    live.push(() => { const lim = dyn ? min() : null; if (lim) { inp.min = lim[0]; inp.max = lim[1]; inp.step = lim[2]; } inp.value = get(); out.textContent = show(get()); });
    return el('label', { className: 'wxv-f' }, el('span', {}, t('wx.v.f.' + key)), out, inp);
  }
  function select(key, options, get, set) {
    const inp = el('select', { 'data-wxv-in': key, onchange: () => set(inp.value) });
    const fill = () => { const o = options(); inp.replaceChildren(...o.map((x) => (x.group ? el('optgroup', { label: x.group }, ...x.items.map((y) => el('option', { value: y[0] }, y[1]))) : el('option', { value: x[0] }, x[1])))); inp.value = get(); };
    live.push(fill);
    return el('label', { className: 'wxv-f' }, el('span', {}, t('wx.v.f.' + key)), inp);
  }
  function check(key, get, set) {
    const inp = el('input', { type: 'checkbox', 'data-wxv-in': key, onchange: () => set(inp.checked) });
    live.push(() => { inp.checked = !!get(); });
    return el('label', { className: 'wxv-c' }, inp, el('span', {}, t('wx.v.f.' + key)));
  }
  function number(key, get, set, off = () => false) {
    const inp = el('input', { type: 'number', step: 'any', 'data-wxv-in': key, onchange: () => { const x = Number(inp.value); if (inp.value !== '' && Number.isFinite(x)) set(x); } });
    live.push(() => { if (document.activeElement !== inp) inp.value = Number(get().toFixed(3)); inp.disabled = !!off(); });
    return el('label', { className: 'wxv-f' }, el('span', {}, t('wx.v.f.' + key)), inp);
  }
  const btn = (key, fn, attrs = {}) => el('button', { type: 'button', 'data-wxv-btn': key, onclick: fn, ...attrs }, t('wx.v.b.' + key));
  const setCut = (which, patch) => { Object.assign(S.section[which], patch, { on: true }); changed(); };
  const jsonBox = el('textarea', { 'data-wxv-json': '', spellcheck: 'false', 'aria-label': t('wx.v.h.settings') });
  const fileIn = el('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async (ev) => { const f = ev.target.files?.[0]; ev.target.value = ''; if (f) applyText(await f.text()); } });
  function applyText(text) {
    try { const raw = JSON.parse(text); if (!raw || raw.format !== DEFAULTS.format) throw new Error('format'); S = cleanSettings(raw); listMetrics(); said = t('wx.v.set.applied'); bad = false; changed(true, false); }
    catch { said = t('wx.v.set.bad'); bad = true; need(); }
  }
  function buildSide() {
    side.replaceChildren(...[
      head('chart'),
      select('metric', () => ['air', 'sun', 'light', 'wind', 'sky', 'ground', 'derived'].map((g) => ({ group: t('wx.g.' + g), items: METRICS.filter((m) => m.group === g && avail.includes(m.id)).map((m) => [m.id, t('wx.m.' + m.id)]) })).filter((g) => g.items.length), () => S.metric, (v) => setMetric(v)),
      select('units', () => [['si', t('wx.v.units.si')], ['us', t('wx.v.units.us')]], () => S.units, (v) => { S.units = v; changed(); }),
      slider('average', 0, 45, 1, () => S.average, (v) => { S.average = v; compute(true); need(); }, (v) => (v ? t('wx.v.avg.n', { n: v }) : t('wx.v.avg.0'))),
      head('cuts'),
      check('dateOn', () => S.section.date.on, (v) => { S.section.date.on = v; changed(); }),
      slider('day', () => [0, D - 1, 1], 0, 0, () => Math.round(S.section.date.day), (v) => { S.section.date.day = v; need(); }, (v) => dateLabel(v)),
      el('div', { className: 'wxv-row' }, ...['summer', 'autumn', 'winter', 'spring'].map((k) => btn('day.' + k, () => setCut('date', { day: keys[k] })))),
      check('timeOn', () => S.section.time.on, (v) => { S.section.time.on = v; changed(); }),
      slider('hour', 0.5, 23.5, 0.25, () => S.section.time.hour, (v) => { S.section.time.hour = v; need(); }, (v) => clockLabel(v)),
      el('div', { className: 'wxv-row' }, ...[['dawn', (e) => e.civil[0]], ['sunrise', (e) => e.sunrise], ['noon', () => 12], ['solar', (e) => e.noon], ['sunset', (e) => e.sunset], ['dusk', (e) => e.civil[1]]].map(([k, f]) => btn('time.' + k, () => { const v = f(sun(dIdx())); if (v !== null) setCut('time', { hour: clamp(v, 0.5, 23.5) }); }))),
      check('valueOn', () => S.section.value.on, (v) => { S.section.value.on = v; changed(); }),
      slider('level', () => [SC.min, SC.max, (SC.max - SC.min) / 200], 0, 0, () => level(), (v) => { S.section.value.level = v; need(); }, (v) => fmt(v)),
      check('block', () => S.block, (v) => { S.block = v; changed(); }),
      head('scale'),
      check('auto', () => S.scale.auto, (v) => { S.scale.auto = v; if (!v) { S.scale.min = SC.min; S.scale.max = SC.max; } changed(true); }),
      number('min', () => SC.min, (v) => { if (v < S.scale.max) { S.scale.min = v; changed(true); } }, () => S.scale.auto), number('max', () => SC.max, (v) => { if (v > S.scale.min) { S.scale.max = v; changed(true); } }, () => S.scale.auto),
      select('ramp', () => Object.keys(RAMPS).map((k) => [k, t('wx.v.ramp.' + k)]), () => S.ramp, (v) => { S.ramp = v; ramp(); changed(); }),
      check('reverse', () => S.reverse, (v) => { S.reverse = v; ramp(); changed(); }),
      slider('bands', 0, 24, 1, () => S.bands, (v) => { S.bands = v; ramp(); need(); }, (v) => (v > 1 ? String(v) : t('wx.v.bands.0'))),
      check('iso', () => S.iso, (v) => { S.iso = v; changed(); }), check('light', () => S.light, (v) => { S.light = v; changed(); }), check('sun', () => S.sun, (v) => { S.sun = v; changed(); }),
      head('view'),
      select('proj', () => PROJECTIONS.map((p, i) => [p, (i + 1) + ' · ' + t('wx.v.proj.' + p)]), () => S.camera.proj, (v) => setProjection(v)),
      el('div', { className: 'wxv-row' }, btn('fit', () => fit())),
      slider('sizeX', 0.5, 5, 0.1, () => S.size.x, (v) => { S.size.x = v; need(); }), slider('sizeY', 0.3, 5, 0.1, () => S.size.y, (v) => { S.size.y = v; need(); }), slider('sizeZ', 0.1, 3, 0.05, () => S.size.z, (v) => { S.size.z = v; need(); }),
      select('period', () => PERIODS.map((p) => [p, t('wx.v.per.' + (p[0] === 'm' ? 'm' : p), { month: p[0] === 'm' ? t('wx.month.' + p.slice(1)) : '' })]), () => S.rose.period, (v) => { S.rose.period = v; changed(); }),
      head('comfort'),
      select('psy', () => [['hours', t('wx.v.psy.by.hours')], ['metric', t('wx.v.psy.by.metric')]], () => S.psy, (v) => { S.psy = v; changed(); }),
      check('comfortOn', () => S.comfort.on, (v) => { S.comfort.on = v; changed(); }),
      number('tmin', () => S.comfort.tmin, (v) => { if (v < S.comfort.tmax) { S.comfort.tmin = v; changed(); } }), number('tmax', () => S.comfort.tmax, (v) => { if (v > S.comfort.tmin) { S.comfort.tmax = v; changed(); } }),
      number('rhmin', () => S.comfort.rhmin, (v) => { if (v >= 0 && v < S.comfort.rhmax) { S.comfort.rhmin = v; changed(); } }), number('rhmax', () => S.comfort.rhmax, (v) => { if (v <= 100 && v > S.comfort.rhmin) { S.comfort.rhmax = v; changed(); } }),
      el('p', { className: 'wxv-note' }, t('wx.v.comfort.note')),
      host.stations ? head('compare') : null,
      host.stations ? select('compare', () => [['', t('wx.v.cmp.off')], ...host.stations().map((x) => [x.set.id + '/' + x.station.id, x.station.name]).sort((a, b) => a[1].localeCompare(b[1]))], () => (cmp ? cmp.id : ''), (v) => { loadCompare(v); }) : null,
      head('edit'),
      el('p', { className: 'wxv-note', 'data-wxv-editnote': '' }, t('wx.v.edit.note')),
      number('editMul', () => (edits[M.key] ? edits[M.key].mul : 1), (v) => change(M.key, v, edits[M.key] ? edits[M.key].add : 0), () => !M.key),
      number('editAdd', () => (edits[M.key] ? edits[M.key].add : 0), (v) => change(M.key, edits[M.key] ? edits[M.key].mul : 1, v), () => !M.key),
      el('div', { className: 'wxv-row' }, btn('editUndo', () => { edits = {}; applyEdits(); }), btn('editSave', () => saveChanged())),
      head('motion'),
      select('animate', () => ANIMATE.map((a) => [a, t('wx.v.anim.' + a)]), () => S.animate.what, (v) => { S.animate.what = v; changed(); }),
      slider('speed', 0.1, 5, 0.1, () => S.animate.speed, (v) => { S.animate.speed = v; }, (v) => v.toFixed(1) + '×'),
      check('daytime', () => S.animate.daytime, (v) => { S.animate.daytime = v; }),
      select('ease', () => Object.keys(EASE).map((k) => [k, t('wx.v.ease.' + k)]), () => S.transition.ease, (v) => { S.transition.ease = v; }),
      slider('secs', 0, 5, 0.1, () => S.transition.secs, (v) => { S.transition.secs = v; }, (v) => v.toFixed(1) + ' s'),
      head('save'),
      el('div', { className: 'wxv-row' }, btn('png', () => png().then((b) => { if (b) host.download(fileStem() + '-' + S.metric + '.png', b, 'image/png'); })),
        btn('csvChart', () => host.download(fileStem() + '-' + S.metric + '.csv', chartCsv(), 'text/csv')),
        btn('csvHours', () => host.download(fileStem() + '-hours.csv', csv(epw, avail, t, S.units === 'us'), 'text/csv'))),
      head('settings'),
      el('div', { className: 'wxv-row' }, btn('setSave', () => host.download('weather-view.json', JSON.stringify(S, null, 1), 'application/json')),
        el('label', { className: 'wxv-btn' }, t('wx.v.b.setLoad'), fileIn),
        btn('share', () => shareLink()),
        btn('setCopy', async () => { try { await navigator.clipboard.writeText(JSON.stringify(S)); said = t('wx.v.set.copied'); bad = false; } catch { said = t('wx.v.set.nocopy'); bad = true; } need(); }),
        btn('setDefault', () => { host.storage?.set?.('viewer', S); said = t('wx.v.set.stored'); bad = false; need(); }),
        btn('setClear', () => { host.storage?.set?.('viewer', null); said = t('wx.v.set.cleared'); bad = false; need(); })),
      jsonBox,
      el('div', { className: 'wxv-row' }, btn('setRead', () => { jsonBox.value = JSON.stringify(S, null, 1); }), btn('setApply', () => applyText(jsonBox.value))),
      el('p', { className: 'wxv-note' }, t('wx.v.keys')),
      src.credit ? el('p', { className: 'wxv-note', 'data-wxv-credit': '' }, src.credit) : null,
      !gl ? el('p', { className: 'wxv-note wxv-err' }, t('wx.v.nogl') + (glErr ? ' (' + glErr + ')' : '')) : null].filter(Boolean));
    tabs.replaceChildren(...VIEWS.filter((v) => v !== 'stations' || host.stations).map((v) => el('button', { type: 'button', role: 'tab', 'data-wxv-view': v, disabled: v === 'surface' && !gl, onclick: () => { S.view = v; hover = null; changed(); } }, t('wx.v.view.' + v))));
  }
  function syncLive() { for (const f of live) f(); }
  function sync() {
    title.textContent = src.name + (Object.keys(edits).length ? ' · ' + t('wx.v.edit.mark') : '') + ' · ' + mname() + (unitOf() ? ' (' + unitOf() + ')' : '');
    for (const b of tabs.children) b.setAttribute('aria-selected', b.getAttribute('data-wxv-view') === S.view ? 'true' : 'false');
    syncLive();
  }
  const fileStem = () => String(src.name || 'weather').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'weather';
  function chartCsv() {
    const rows = [[t('wx.v.tab.date'), ...Array.from({ length: 24 }, (_, h) => clockLabel(h + 0.5))].join(',')];
    for (let d = 0; d < D; d++) rows.push([dateLabel(d), ...Array.from({ length: 24 }, (_, h) => { const v = G.values[d * 24 + h]; return Number.isNaN(v) ? '' : String(Number(conv(v).toFixed(U().digits + 1))); })].join(','));
    return rows.join('\r\n') + '\r\n';
  }
  /** The chart on screen as a PNG, with its name written on it. */
  function png() {
    draw();
    if (S.view === 'table') return Promise.resolve(null);
    const surface = S.view === 'surface' && gl, a = surface ? glCanvas : flat, out = el('canvas', { width: a.width, height: a.height }), c = out.getContext('2d');
    c.drawImage(a, 0, 0); if (surface) c.drawImage(over, 0, 0);
    const dpr = a.width / Math.max(1, stage.clientWidth);
    // i18n-ignore: CSS, selector, class name or search keywords: no words a person reads (words-11)
    c.fillStyle = getComputedStyle(wrap).color; c.font = '600 ' + Math.round(13 * dpr) + 'px system-ui, sans-serif'; c.textBaseline = 'bottom';
    c.fillText(title.textContent, 12 * dpr, a.height - 8 * dpr);
    return new Promise((res) => out.toBlob((b) => res(b), 'image/png'));
  }
  function setMetric(id) { if (!avail.includes(id) || id === S.metric) return; S.metric = id; S.scale.auto = true; S.section.value.level = null; changed(true); }
  function stepMetric(by) { const i = avail.indexOf(S.metric); setMetric(avail[(i + by + avail.length) % avail.length]); }
  /** Multiply and shift one column of the file (add in the shown metric units). Everything worked out of it follows. */
  function change(key, mul, add) {
    if (!key || !Number.isFinite(mul) || !Number.isFinite(add)) return false;
    if (mul === 1 && add === 0) delete edits[key]; else edits[key] = { mul, add };
    applyEdits(); return true;
  }
  function applyEdits() { epw = changedEpw(base, edits); sunPos = null; said = ''; listMetrics(); compute(true); sync(); need(); }
  const editNote = () => Object.entries(edits).map(([k, e]) => k + ' x' + e.mul + (e.add >= 0 ? ' +' : ' ') + e.add).join('; ');
  function saveChanged() {
    const ks = Object.keys(edits);
    if (!ks.length) { said = t('wx.v.edit.nothing'); bad = true; need(); return null; }
    if (!src.text) { said = t('wx.v.edit.nofile'); bad = true; need(); return null; }
    const text = writeEpw(src.text, epw.hours, ks, 'Changed with the CadCraft Weather files add-on: ' + editNote() + '. Design conditions in this header were not worked out again.');
    host.download(fileStem() + '-changed.epw', text, 'text/plain'); said = t('wx.v.edit.saved'); bad = false; need();
    return text;
  }
  async function loadCompare(id) {
    if (!id) { cmp = null; compute(false); sync(); need(); return true; }
    const x = (host.stations ? host.stations() : []).find((y) => y.set.id + '/' + y.station.id === id);
    if (!x || !host.loadStation) return false;
    said = t('wx.fetching'); bad = false; footer();
    try { cmp = await host.loadStation(x); cmp.id = id; said = ''; compute(false); sync(); need(); return true; }
    catch (e) { said = e.key ? t(e.key) : String(e.message || e); bad = true; sync(); need(); return false; }
  }
  async function shareLink() {
    if (!src.id || !host.link) { said = t('wx.v.share.none'); bad = true; need(); return null; }
    const url = host.link(shareCode({ station: src.id, compare: cmp ? cmp.id : null, settings: S }));
    jsonBox.value = url;
    try { await navigator.clipboard.writeText(url); said = t('wx.v.share.copied'); } catch { said = t('wx.v.share.shown'); }
    bad = false; need();
    return url;
  }
  function setSource(next) {
    src = next; base = next.epw; edits = {}; epw = base; place = epw.location; D = epw.n / 24; sunCache = null; sunPos = null; keys = keyDays(place);
    listMetrics(); buildSide(); compute(false); sync(); need();
  }

  /* ---- pointer and keys ---- */
  let drag = null;
  const pts = new Map();
  /** Which cut a point of the surface lies on, if any: that cut can be dragged. */
  const nearCut = (p) => { if (!p) return null; const dd = S.section.date.on ? Math.abs(p.d - dIdx()) / (D - 1) : 9, dh = S.section.time.on ? Math.abs(p.h - hIdx()) / 23 : 9; return dd < 0.012 && dd <= dh ? 'date' : dh < 0.03 ? 'time' : dd < 0.012 ? 'date' : null; };
  const putCut = (which, p) => { if (which === 'date') S.section.date.day = p.d; else if (which === 'time') S.section.time.hour = clamp(p.h + 0.5, 0.5, 23.5); else { S.section.value.on = true; S.section.value.level = at(p.d, p.h); } };
  function down(ev) { wrap.focus({ preventScroll: true }); pts.set(ev.pointerId, [ev.clientX, ev.clientY]); drag = { x: ev.clientX, y: ev.clientY, moved: 0, pan: ev.button !== 0 || ev.shiftKey, pinch: pts.size === 2 ? Math.hypot(...[...pts.values()].reduce((a, b) => [a[0] - b[0], a[1] - b[1]])) : 0, grab: null };
    if (ev.button === 0 && !ev.shiftKey && pts.size === 1) { const p = pick(ev.clientX, ev.clientY); drag.grab = p ? (ev.altKey ? 'value' : nearCut(p)) : null; }
    ev.currentTarget.setPointerCapture(ev.pointerId); }
  function move(ev) {
    if (pts.has(ev.pointerId)) pts.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (!drag) { const p = pick(ev.clientX, ev.clientY); hover = p; over.style.cursor = nearCut(p) ? 'grab' : ''; footer(); return; }
    if (pts.size === 2 && drag.pinch) { const d = Math.hypot(...[...pts.values()].reduce((a, b) => [a[0] - b[0], a[1] - b[1]])); S.camera.dist = clamp(S.camera.dist * drag.pinch / Math.max(1, d), 0.5, 20); drag.pinch = d; drag.moved = 9; need(); return; }
    const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y; drag.x = ev.clientX; drag.y = ev.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.grab) { const p = pick(ev.clientX, ev.clientY); if (p) { putCut(drag.grab, p); syncLive(); need(); } return; }
    if (drag.pan) { const k = S.camera.dist * 2 * Math.tan(FOV / 2) / Math.max(1, stage.clientHeight); S.camera.tx -= dx * k; S.camera.ty += dy * k; }
    else { S.camera.az -= dx * 0.4; S.camera.el = clamp(S.camera.el + dy * 0.4, -90, 90); if (S.camera.proj !== 'perspective') S.camera.proj = 'parallel'; }
    need();
  }
  function up(ev) {
    pts.delete(ev.pointerId);
    if (drag && drag.moved < 4) { const p = pick(ev.clientX, ev.clientY); if (p) { if (ev.altKey) putCut('value', p); else { putCut('date', p); putCut('time', p); } sync(); } }
    else if (drag) sync();
    drag = null; need();
  }
  over.addEventListener('pointerdown', down); over.addEventListener('pointermove', move); over.addEventListener('pointerup', up); over.addEventListener('pointercancel', up);
  over.addEventListener('pointerleave', () => { hover = null; footer(); });
  over.addEventListener('wheel', (ev) => { ev.preventDefault(); S.camera.dist = clamp(S.camera.dist * Math.exp(ev.deltaY * 0.0012), 0.5, 20); need(); }, { passive: false });
  over.addEventListener('dblclick', () => fit());
  const flatAt = (ev) => {
    const r = flat.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    if (S.view === 'stations') { let best = null; for (const s of stationDots) { const d = Math.hypot(s.px - x, s.py - y); if (d < 14 && (!best || d < best.d)) best = { ...s, d }; } return best ? { station: best } : null; }
    if ((S.view !== 'map' && S.view !== 'surface') || !mapRect) return null;
    const R = mapRect; if (x < R.x || x > R.x + R.w || y < R.y || y > R.y + R.h) return null;
    return { d: (x - R.x) / R.w * (D - 1), h: (R.y + R.h - y) / R.h * 23 };
  };
  flat.addEventListener('pointermove', (ev) => { const was = hover; hover = flatAt(ev);
    if ((ev.buttons & 1) && hover && hover.d !== undefined) { if (ev.altKey) putCut('value', hover); else { putCut('date', hover); putCut('time', hover); } syncLive(); need(); return; } if (S.view === 'stations' && (was?.station?.x !== hover?.station?.x)) need(); else footer(); });
  flat.addEventListener('pointerleave', () => { hover = null; footer(); });
  flat.addEventListener('click', async (ev) => {
    const p = flatAt(ev);
    if (!p) return;
    if (p.station) {
      if (!host.loadStation) return;
      said = t('wx.fetching'); bad = false; footer();
      if (ev.shiftKey) { await loadCompare(p.station.x.set.id + '/' + p.station.x.station.id); return; }
      try { const next = await host.loadStation(p.station.x); said = ''; setSource(next); } catch (e) { said = e.key ? t(e.key) : String(e.message || e); bad = true; need(); }
      return;
    }
    if (ev.altKey) S.section.value.level = at(p.d, p.h); else { S.section.date.day = p.d; S.section.time.hour = clamp(p.h + 0.5, 0.5, 23.5); }
    changed();
  });
  wrap.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { ev.preventDefault(); close(); return; }
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(ev.target.tagName) || ev.ctrlKey || ev.metaKey) return;
    const k = ev.key.toLowerCase(), back = ev.shiftKey ? -1 : 1, c = S.camera;
    const done = () => { ev.preventDefault(); changed(); };
    if (k === 'm') { ev.preventDefault(); stepMetric(back); }
    else if (k === 'x') { S.section.date.on = !S.section.date.on; done(); } else if (k === 'c') { S.section.time.on = !S.section.time.on; done(); }
    else if (k === 'v') { S.section.value.on = !S.section.value.on; done(); } else if (k === 'b') { S.block = !S.block; done(); }
    else if (k === 't') { setCut('time', { hour: clamp(S.section.time.hour + back, 0.5, 23.5) }); ev.preventDefault(); }
    else if (k === 'y') { setCut('date', { day: (Math.round(S.section.date.day) + back * 7 + D) % D }); ev.preventDefault(); }
    else if (k === 'u') { setCut('value', { level: clamp(level() + back * SC.step / 2, SC.min, SC.max) }); ev.preventDefault(); }
    else if (k >= '1' && k <= '5') { ev.preventDefault(); setProjection(PROJECTIONS[Number(k) - 1]); }
    else if (k === 'arrowleft' || k === 'arrowright') { c.az += (k === 'arrowleft' ? -5 : 5); if (c.proj !== 'perspective') c.proj = 'parallel'; done(); }
    else if (k === 'arrowup' || k === 'arrowdown') { c.el = clamp(c.el + (k === 'arrowup' ? 5 : -5), -90, 90); if (c.proj !== 'perspective') c.proj = 'parallel'; done(); }
    else if (k === 'w' || k === 's') { c.dist = clamp(c.dist * (k === 'w' ? 0.9 : 1.1), 0.5, 20); done(); }
    else if (k === 'a' || k === 'd') { c.tx += (k === 'a' ? -0.1 : 0.1); done(); }
    else if (k === 'f') { ev.preventDefault(); fit(); }
    else if (k === ' ') { S.animate.what = S.animate.what === 'none' ? 'date' : 'none'; done(); }
  });
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => need()) : null;
  if (ro) ro.observe(stage);

  function close() {
    if (closed) return;
    closed = true; if (raf) cancelAnimationFrame(raf); if (ro) ro.disconnect();
    try { gl && gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* the context is gone already */ }
    wrap.remove();
    try { focusBack && focusBack.focus && focusBack.focus(); } catch { /* the opener left the page */ }
    host.onClose?.();
  }

  keys = keyDays(place);
  listMetrics(); buildSide(); compute(false);
  if (!settings && !host.storage?.get?.('viewer')) fit(false);   // a first look fills the window; a kept view is left as it was kept
  sync(); draw(); frames++;
  wrap.focus({ preventScroll: true });
  return {
    el: wrap, close, png, settings: () => JSON.parse(JSON.stringify(S)), change, saveChanged, shareLink, compare: loadCompare,
    /** Where a day and hour of the surface is on the screen (client pixels), or null. */
    screenOf(d, h) {
      const k = wrap._cam; if (!k) return null;
      const p = xf(k.cam.mvp, (d / (D - 1) - 0.5) * S.size.x, (h / 23 - 0.5) * S.size.y, norm(at(d, h)) * S.size.z), r = glCanvas.getBoundingClientRect();
      return p[3] <= 0 ? null : { x: r.left + (p[0] / p[3] + 1) / 2 * r.width, y: r.top + (1 - p[1] / p[3]) / 2 * r.height };
    },
    set(patch) { S = cleanSettings({ ...S, ...patch }); listMetrics(); compute(false); sync(); draw(); frames++; },
    state: () => ({ view: S.view, metric: S.metric, metrics: avail.slice(), gl: !!gl, glError: glErr, days: D, scale: { ...SC }, stats: { ...ST }, level: level(), frames, said, bad, name: src.name, compare: cmp ? cmp.name : null, edits: JSON.parse(JSON.stringify(edits)), comfort: comfortNow(), cut: { day: dIdx(), hour: S.section.time.hour, value: at(dIdx(), hIdx()) }, mix }),
    /** How much of the chart is painted: the share of sampled pixels that are not the background (the tests read this). */
    probe() {
      draw();
      const surface = S.view === 'surface' && gl, cv = surface ? glCanvas : flat, w = cv.width, h = cv.height, tmp = el('canvas', { width: 64, height: 64 }), c = tmp.getContext('2d');
      c.drawImage(cv, 0, 0, w, h, 0, 0, 64, 64);
      const px = c.getImageData(0, 0, 64, 64).data, bg = [px[0], px[1], px[2]], seen = new Set();
      let on = 0;
      for (let i = 0; i < px.length; i += 4) { if (Math.abs(px[i] - bg[0]) + Math.abs(px[i + 1] - bg[1]) + Math.abs(px[i + 2] - bg[2]) > 24) on++; seen.add((px[i] >> 4) + ',' + (px[i + 1] >> 4) + ',' + (px[i + 2] >> 4)); }
      return { painted: on / (px.length / 4), colours: seen.size };
    },
  };
}
