/* SPDX-License-Identifier: Apache-2.0 */
/**
 * view3d.js: the model drawn in 3D, one colour per takeoff row, an element clickable (0.11 MT.3). Plain DOM + WebGL2, no app imports, so the panel
 * shows the same view in every host. Orbit with a drag, pan with Shift + drag (or the right button), zoom with the wheel, Fit and Reset buttons.
 *
 *   const view = mountModelView(root, { elements, t, onPick(id | null) })
 *     elements: read.js elements with a mesh (rooms are left out: a room's volume would hide the building)
 *   view.update({ colors: Map<element id, [r, g, b] 0..1>, hidden: Set<id>, lit: Set<id> | null })
 *     lit = the elements to light (the picked row's); the others are drawn pale and see-through. null: all drawn as coloured.
 *   view.fit() · view.reset() · view.destroy() · view.supported (false: no WebGL2, the root says so)
 *   view.pickAt(clientX, clientY) → element id | null   (what a click does; also for tests)
 *   view.state() → { drawn, hidden, lit, eye, target }
 */
import { pickElement } from './pick.js';

const VS = `#version 300 es
in vec3 aPos; in vec3 aNor; uniform mat4 uVP; out vec3 vN;
void main(){ vN = aNor; gl_Position = uVP * vec4(aPos, 1.0); }`;
const FS = `#version 300 es
precision mediump float; in vec3 vN; uniform vec3 uColor; uniform float uAlpha; out vec4 o;
void main(){ vec3 n = normalize(vN); float l = 0.38 + 0.42 * abs(dot(n, normalize(vec3(0.4, 0.8, 0.45)))) + 0.2 * abs(dot(n, normalize(vec3(-0.7, 0.2, -0.3)))); o = vec4(uColor * l, uAlpha); }`;

const CSS = `.mv-wrap{position:relative;border:1px solid rgba(128,128,128,.4);border-radius:.25rem;background:#eef1f5;height:min(38vh,22rem);min-height:12rem;touch-action:none}
.mv-wrap canvas{display:block;width:100%;height:100%;border-radius:.25rem;cursor:grab}.mv-wrap canvas:active{cursor:grabbing}
.mv-tools{position:absolute;top:.35rem;right:.35rem;display:flex;gap:.3rem}.mv-hint{position:absolute;left:.5rem;bottom:.35rem;font-size:.72rem;color:#333;pointer-events:none;background:rgba(255,255,255,.7);padding:0 .3rem;border-radius:.2rem}
.mv-none{padding:.6rem;font-size:.8rem}`;
function style() {
  if (typeof document === 'undefined' || document.getElementById('cc-modelview-style')) return;
  const s = document.createElement('style'); s.id = 'cc-modelview-style'; s.textContent = CSS; document.head.append(s);
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function lookAt(eye, tgt, up) {
  const f = norm(sub(tgt, eye)), r = norm(cross(f, up)), u = cross(r, f);
  return [r[0], u[0], -f[0], 0, r[1], u[1], -f[1], 0, r[2], u[2], -f[2], 0, -dot(r, eye), -dot(u, eye), dot(f, eye), 1];
}
function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}
function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}

export function mountModelView(root, { elements, t, onPick = () => {} }) {
  style();
  const drawable = elements.filter((e) => e.mesh && e.cls !== 'IfcSpace');
  const wrap = document.createElement('div'); wrap.className = 'mv-wrap'; wrap.setAttribute('data-mt-view', '');
  const canvas = document.createElement('canvas'); canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', t('mt.view.label')); canvas.setAttribute('data-mt-canvas', '');
  const tools = document.createElement('div'); tools.className = 'mv-tools';
  const mkBtn = (key, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn-line btn-sm-cc'; b.textContent = t(key); b.addEventListener('click', fn); tools.append(b); return b; };
  const hint = document.createElement('span'); hint.className = 'mv-hint'; hint.textContent = t('mt.view.hint');
  wrap.append(canvas, tools, hint);
  root.replaceChildren(wrap);
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, preserveDrawingBuffer: true });
  const api = { supported: !!gl, pickAt: () => null, update() {}, fit() {}, reset() {}, destroy() { wrap.remove(); }, state: () => ({}) };
  if (!gl || !drawable.length) {
    wrap.replaceChildren(Object.assign(document.createElement('p'), { className: 'mv-none', textContent: t(gl ? 'mt.view.empty' : 'mt.view.nogl') }));
    api.supported = !!gl && drawable.length > 0;
    return api;
  }

  // ---- buffers: every element's mesh in one vertex and one index buffer; an element is a range of the index buffer ----
  let nv = 0, ni = 0;
  for (const e of drawable) { nv += e.mesh.v.length; ni += e.mesh.i.length; }
  const V = new Float32Array(nv), I = new Uint32Array(ni), range = new Map();
  let ov = 0, oi = 0;
  const box = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const e of drawable) {
    const base = ov / 6;
    V.set(e.mesh.v, ov);
    for (let k = 0; k < e.mesh.i.length; k++) I[oi + k] = e.mesh.i[k] + base;
    range.set(e.id, { first: oi * 4, count: e.mesh.i.length });
    ov += e.mesh.v.length; oi += e.mesh.i.length;
    for (let k = 0; k < 3; k++) { if (e.bbox[k] < box[k]) box[k] = e.bbox[k]; if (e.bbox[k + 3] > box[k + 3]) box[k + 3] = e.bbox[k + 3]; }
  }
  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, V, gl.STATIC_DRAW);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, I, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos'), aNor = gl.getAttribLocation(prog, 'aNor');
  gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(aNor); gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 24, 12);
  const uVP = gl.getUniformLocation(prog, 'uVP'), uColor = gl.getUniformLocation(prog, 'uColor'), uAlpha = gl.getUniformLocation(prog, 'uAlpha');

  // ---- camera: orbit round the model's middle, Y up ----
  const centre = [(box[0] + box[3]) / 2, (box[1] + box[4]) / 2, (box[2] + box[5]) / 2];
  const diag = Math.max(0.5, Math.hypot(box[3] - box[0], box[4] - box[1], box[5] - box[2]));
  const home = { yaw: -0.7, pitch: 0.5, dist: diag * 1.15, target: centre.slice() };
  let cam = { ...home, target: centre.slice() };
  const eyeOf = () => [cam.target[0] + cam.dist * Math.cos(cam.pitch) * Math.sin(cam.yaw), cam.target[1] + cam.dist * Math.sin(cam.pitch), cam.target[2] + cam.dist * Math.cos(cam.pitch) * Math.cos(cam.yaw)];
  const FOV = 0.8;
  let scene = { colors: new Map(), hidden: new Set(), lit: null };
  let drawn = 0;
  const fallback = [0.62, 0.66, 0.72];

  function draw() {
    const w = Math.max(1, Math.round(canvas.clientWidth * (window.devicePixelRatio || 1))), h = Math.max(1, Math.round(canvas.clientHeight * (window.devicePixelRatio || 1)));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.93, 0.945, 0.96, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.useProgram(prog); gl.bindVertexArray(vao);
    const eye = eyeOf();
    gl.uniformMatrix4fv(uVP, false, new Float32Array(mul(perspective(FOV, w / h, diag * 0.01, diag * 8), lookAt(eye, cam.target, [0, 1, 0]))));
    drawn = 0;
    const pass = (dim) => {
      gl.depthMask(!dim);
      if (dim) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); } else gl.disable(gl.BLEND);
      for (const e of drawable) {
        if (scene.hidden.has(e.id)) continue;
        const isDim = !!scene.lit && !scene.lit.has(e.id);
        if (isDim !== dim) continue;
        const c = isDim ? [0.78, 0.8, 0.83] : scene.colors.get(e.id) || fallback, r = range.get(e.id);
        gl.uniform3f(uColor, c[0], c[1], c[2]); gl.uniform1f(uAlpha, isDim ? 0.18 : 1);
        gl.drawElements(gl.TRIANGLES, r.count, gl.UNSIGNED_INT, r.first);
        if (!dim) drawn++;
      }
    };
    pass(false); pass(true);
    gl.depthMask(true);
  }
  let queued = false;
  const redraw = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; try { draw(); } catch (e) { /* context lost */ } }); };

  function rayAt(cx, cy) {
    const r = canvas.getBoundingClientRect();
    const nx = ((cx - r.left) / r.width) * 2 - 1, ny = 1 - ((cy - r.top) / r.height) * 2;
    const eye = eyeOf(), f = norm(sub(cam.target, eye)), right = norm(cross(f, [0, 1, 0])), up = cross(right, f);
    const k = Math.tan(FOV / 2), asp = r.width / r.height;
    return [eye, norm([f[0] + right[0] * nx * k * asp + up[0] * ny * k, f[1] + right[1] * nx * k * asp + up[1] * ny * k, f[2] + right[2] * nx * k * asp + up[2] * ny * k])];
  }
  const pickAt = (cx, cy) => { const [o, d] = rayAt(cx, cy); const hit = pickElement(drawable, o, d, { skip: (e) => scene.hidden.has(e.id) }); return hit ? hit.id : null; };

  // ---- pointer ----
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, pan: e.shiftKey || e.button === 1 || e.button === 2 }; try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* synthetic */ } });
  canvas.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y; down.x = e.clientX; down.y = e.clientY;
    if (down.pan) {
      const eye = eyeOf(), f = norm(sub(cam.target, eye)), right = norm(cross(f, [0, 1, 0])), up = cross(right, f), k = cam.dist * Math.tan(FOV / 2) * 2 / canvas.clientHeight;
      for (let i = 0; i < 3; i++) cam.target[i] += (-right[i] * dx + up[i] * dy) * k;
    } else { cam.yaw -= dx * 0.01; cam.pitch = Math.max(-1.5, Math.min(1.5, cam.pitch + dy * 0.01)); }
    redraw();
  });
  canvas.addEventListener('pointerup', (e) => {
    const d = down; down = null;
    if (d && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 4 && !d.pan) onPick(pickAt(e.clientX, e.clientY));
  });
  canvas.addEventListener('pointercancel', () => { down = null; });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.dist = Math.max(diag * 0.05, Math.min(diag * 6, cam.dist * Math.exp(e.deltaY * 0.001))); redraw(); }, { passive: false });
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(redraw) : null;
  ro?.observe(canvas);
  mkBtn('mt.view.fit', () => { cam.dist = home.dist; cam.target = centre.slice(); redraw(); });
  mkBtn('mt.view.reset', () => { cam = { ...home, target: centre.slice() }; redraw(); });
  redraw();

  api.supported = true;
  api.pickAt = pickAt;
  api.update = (s) => { scene = { colors: s.colors || new Map(), hidden: s.hidden || new Set(), lit: s.lit || null }; redraw(); };
  api.fit = () => { cam.dist = home.dist; cam.target = centre.slice(); redraw(); };
  api.reset = () => { cam = { ...home, target: centre.slice() }; redraw(); };
  api.state = () => { draw(); return { drawn, hidden: scene.hidden.size, lit: scene.lit ? scene.lit.size : null, eye: eyeOf(), target: cam.target.slice(), elements: drawable.length }; };
  api.focus = (ids) => {            // bring a row's elements into the middle of the view
    const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    for (const e of drawable) if (ids.has(e.id)) for (let k = 0; k < 3; k++) { if (e.bbox[k] < b[k]) b[k] = e.bbox[k]; if (e.bbox[k + 3] > b[k + 3]) b[k + 3] = e.bbox[k + 3]; }
    if (!Number.isFinite(b[0])) return;
    cam.target = [(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2];
    cam.dist = Math.max(diag * 0.2, Math.min(home.dist, Math.hypot(b[3] - b[0], b[4] - b[1], b[5] - b[2]) * 2.2));
    redraw();
  };
  api.destroy = () => { ro?.disconnect(); try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (e) { /* gone */ } wrap.remove(); };
  return api;
}
