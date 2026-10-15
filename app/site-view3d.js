/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site-view3d.js — the CivilCraft 3D site view: three.js drawing of the scene site3d.js builds, our own camera
 * (camera.js, a byte-identical copy of ModelCraft's — picking uses the same matrices), ModelCraft's navigation,
 * a small bar over the view (standard views, perspective, extents, exaggeration, colouring, what is shown, export).
 * civilcraft.js imports this module the first time someone opens 3D, so the 2D app never loads three.js otherwise.
 *
 *   const v = mountSite3D(host, { project: () => Project, onPick(hit) → bool, say(msg), exag (Settings › CivilCraft), onExag(x),
 *                                 corner: 'cube'|'axes'|'none' })
 *   v.show() · v.hide() · v.refresh() (the project changed) · v.exportGLB() · v.exportOBJ() · v.setExag(x) · v.setCorner(c)
 *   v.lookAlong(view) (a view cube view {dir, up} — the plan's cube opens 3D this way) · v.state · v.scene · v.cam · v.cube
 *   v.drive (0.4 V10, drive-ui.js: the Drive panel and Sun menu on the bar) · view.setSun(cfg)
 * Corner indicator (viewcube.js + viewcube-camera.js, byte-identical copies of ModelCraft's): the view cube top right of
 * the stage (north = grid north, +Y), or the X/Y/Z axis icon bottom left, or none; cube.update() after every render.
 *
 * Navigation (as ModelCraft): middle-drag or left-drag orbits, Shift+middle/left or right-drag pans, the wheel zooms at
 * the cursor; a trackpad's two-finger swipe orbits (Shift pans) and a pinch zooms (ModelCraft's looksLikePad rule, "auto");
 * touch: one finger orbits, two pinch and pan. A click (no drag) picks: survey point, pipe or structure → selected in
 * the app (onPick), and a tip names what is there with its easting, northing and elevation. Renders on demand.
 * Colours come from the page tokens and follow the theme (data-space paper/model). File text reaches the page only
 * as text nodes (el()).
 */
import * as THREE from 'three';
import { Camera, VIEWS, VIEW_LABELS } from './camera.js';
import { invert } from './vec.js';
import { buildSite3D, siteInput, pickSite, SHOW_DEFAULTS, EXAGGERATIONS, declutterLabels } from './site3d.js';
import { exportGLB, exportOBJ } from './site3d-export.js';
import { mountViewCube, mountAxisIcon } from './viewcube.js';
import { cameraCubeOptions } from './viewcube-camera.js';
import { el } from './ui-util.js';
import { fixed } from './units.js';
import { t, has } from './i18n.js';   // 0.4 V3 strings
import { mountDrive } from './drive-ui.js';   // 0.4 V10
import { action3d, wheelFactor } from './input-mouse.js';   // 0.5 IP.3: buttons and wheel from the menu style

const STORE = 'civilcraft.view3d';
const SHOW_LABELS = [   // [what, language key]: looked up when the bar is built
  ['eg', 'surface.eg'], ['fg', 'surface.fg'], ['triangles', 'v3d.show.triangles'], ['contours', 'v3d.show.contours'], ['boundary', 'scene.layer.bndy'],
  ['breaklines', 'scene.layer.brkl'], ['alignments', 'v3d.show.alignments'], ['corridors', 's3.corridors'], ['pads', 'v3d.show.pads'],
  ['pipes', 'v3d.show.pipes'], ['points', 'scene.layer.node'], ['gis', 'v3d.show.gis'],   // gis: 0.4 V4
  ['labels', 'v3d.show.labels'],   // 0.5 WL.22
];
const VIEW_KEYS = { iso: 'v3d.view.iso', top: 'v3d.view.top', bottom: 'v3d.view.bottom', front: 'v3d.view.front', back: 'v3d.view.back', left: 'v3d.view.left', right: 'v3d.view.right' };

export function readState() {
  const st = { exag: 2, color: 'bands', view: 'iso', persp: true, show: { ...SHOW_DEFAULTS } };
  try {
    const v = JSON.parse(localStorage.getItem(STORE) || '{}');
    if (EXAGGERATIONS.includes(v.exag)) st.exag = v.exag;
    if (v.color === 'bands' || v.color === 'single' || v.color === 'map') st.color = v.color;   // 0.4 V3: 'map'
    if (typeof v.persp === 'boolean') st.persp = v.persp;
    if (v.show && typeof v.show === 'object') for (const k of Object.keys(SHOW_DEFAULTS)) if (typeof v.show[k] === 'boolean') st.show[k] = v.show[k];
  } catch { /* private window or junk: defaults */ }
  return st;
}

/** Colours from the page tokens (the same names the plan uses). */
export function themeColors() {
  const cs = getComputedStyle(document.documentElement);
  const t = (n, d) => cs.getPropertyValue(n).trim() || d;
  const bg = t('--sheet', '#f3f6f8'), ink = t('--ink', '#17202b'), line = t('--line', '#7a8796');
  const dark = luminance(bg) < 0.4;
  return {
    dark, bg, action: t('--action', '#1e48c8'),   // action: 0.4 V5 highlight
    colors: {
      surface: dark ? '#8f8a7c' : '#d6cfbb', graded: dark ? '#7f8c99' : '#c3ccd6', tin: mix(line, bg, 0.35), major: ink, minor: mix(ink, bg, dark ? 0.55 : 0.5),
      breakline: t('--layer-orange', '#a84a00'), edge: t('--ink-2', '#34404e'), alignment: t('--layer-red', '#b3122e'), corridor: t('--layer-ochre', '#8a6200'),
      pad: t('--layer-blue', '#1e48c8'), daylight: t('--layer-magenta', '#9a1f86'), pipe: t('--layer-blue', '#1e48c8'), structure: t('--layer-cyan', '#00707e'),
      problem: t('--layer-red', '#b3122e'), point: t('--layer-green', '#17703a'),
      // 0.4 V4: GIS layer tokens
      ...Object.fromEntries(['blue', 'orange', 'magenta', 'cyan', 'ochre', 'green', 'red'].map((k) => ['gis:' + k, t('--layer-' + k, '#1e48c8')])),
    },
  };
}
function hex(c) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c).trim());
  if (m) return m[1].length === 3 ? m[1].split('').map((x) => x + x).join('') : m[1];
  const r = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i.exec(String(c));
  return r ? [r[1], r[2], r[3]].map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('') : '808080';
}
function luminance(c) { const v = parseInt(hex(c), 16); return (0.2126 * ((v >> 16) & 255) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255)) / 255; }
function mix(a, b, t) {
  const A = parseInt(hex(a), 16), B = parseInt(hex(b), 16);
  const ch = (s) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t);
  return '#' + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('');
}

// ---- labels that face the camera (0.5 WL.22) ----
// One mesh of quads, one text atlas: each quad's corners are pushed out in clip space by its size in CSS pixels, so every
// label faces the camera at the same size however far it is, stands on its point, and is still hidden by a hill in front
// of it (depth-tested; pulled a hair towards the eye so it is not buried in the ground it labels). The atlas holds each
// text in two channels — red the letters, green a halo — painted in the label's colour and the sheet's colour.
const LABEL_FONT_3D = '600 13px Helvetica, Arial, "Liberation Sans", sans-serif';   // i18n-ignore: a font stack
const LABEL_VS = `
attribute vec2 corner; attribute vec4 rect; attribute vec2 size; attribute vec3 tint; attribute float vis;
uniform vec2 viewport;
varying vec2 vUv; varying vec3 vTint; varying float vVis;
void main() {
  vec4 c = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec2 off = vec2((corner.x - 0.5) * size.x, corner.y * size.y + 6.0);
  c.xy += off * 2.0 / viewport * c.w;
  c.z -= 0.0015 * c.w;
  gl_Position = c;
  vUv = vec2(mix(rect.x, rect.z, corner.x), mix(rect.y, rect.w, corner.y));
  vTint = tint; vVis = vis;
}`;
const LABEL_FS = `
uniform sampler2D atlas; uniform vec3 halo;
varying vec2 vUv; varying vec3 vTint; varying float vVis;
void main() {
  if (vVis < 0.5) discard;
  vec4 a = texture2D(atlas, vUv);
  float k = max(a.r, a.g);
  if (k < 0.04) discard;
  gl_FragColor = vec4(mix(halo, vTint, a.r / k), k);
}`;
/** The labels' mesh + atlas for a scene's `labels`; sets each label's measured width `w` (px) for the declutter. */
function labelMesh(labels, haloHex) {
  const W = 2048, RH = 20, cv = document.createElement('canvas'), g = cv.getContext('2d');
  g.font = LABEL_FONT_3D;
  let x = 0, y = 0;
  const slots = labels.map((l) => {
    const w = Math.ceil(g.measureText(l.text).width) + 8;
    if (x + w > W) { x = 0; y += RH; }
    const s = { x, y, w };
    x += w;
    l.w = w;
    return s;
  });
  let H = 64; while (H < y + RH) H *= 2;
  cv.width = W; cv.height = Math.min(H, 8192);
  g.font = LABEL_FONT_3D; g.textBaseline = 'middle'; g.lineJoin = 'round';
  labels.forEach((l, i) => { const s = slots[i]; if (s.y + RH > cv.height) return; g.strokeStyle = 'rgb(0,255,0)'; g.lineWidth = 4; g.strokeText(l.text, s.x + 4, s.y + RH / 2); });
  g.globalCompositeOperation = 'lighter';
  labels.forEach((l, i) => { const s = slots[i]; if (s.y + RH > cv.height) return; g.fillStyle = 'rgb(255,0,0)'; g.fillText(l.text, s.x + 4, s.y + RH / 2); });
  const n = labels.length, pos = new Float32Array(n * 12), corner = new Float32Array(n * 8), rect = new Float32Array(n * 16), size = new Float32Array(n * 8), tint = new Float32Array(n * 12), vis = new Float32Array(n * 4), idx = new Uint32Array(n * 6);
  const C = [[0, 0], [1, 0], [1, 1], [0, 1]];
  labels.forEach((l, i) => {
    const s = slots[i], col = new THREE.Color(l.color || '#17202b');
    const u0 = s.x / W, u1 = (s.x + s.w) / W, v1 = 1 - s.y / cv.height, v0 = 1 - (s.y + RH) / cv.height;   // flipY: canvas top = v 1
    for (let k = 0; k < 4; k++) {
      const j = i * 4 + k;
      pos.set(l.at, j * 3); corner.set(C[k], j * 2); rect.set([u0, v0, u1, v1], j * 4); size.set([s.w, RH], j * 2); tint.set([col.r, col.g, col.b], j * 3); vis[j] = 1;
    }
    idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('corner', new THREE.BufferAttribute(corner, 2));
  geo.setAttribute('rect', new THREE.BufferAttribute(rect, 4));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 2));
  geo.setAttribute('tint', new THREE.BufferAttribute(tint, 3));
  geo.setAttribute('vis', new THREE.BufferAttribute(vis, 1));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);   // quads move in clip space: never culled by their anchors
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const mat = new THREE.ShaderMaterial({ vertexShader: LABEL_VS, fragmentShader: LABEL_FS, transparent: true, depthWrite: false,
    uniforms: { atlas: { value: tex }, viewport: { value: new THREE.Vector2(1, 1) }, halo: { value: new THREE.Color(haloHex) } } });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'labels'; mesh.frustumCulled = false; mesh.renderOrder = 5;
  mesh.userData.tex = tex;
  return mesh;
}

export class SiteView3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.scene = new THREE.Scene();
    this.tcam = new THREE.Camera();
    this.tcam.matrixAutoUpdate = false;
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x7d828a, 1.6);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 1.6);
    this.sun.position.set(-0.45, 0.55, 1);
    this.scene.add(this.sun, this.sun.target);
    this.sunCfg = null;
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.cam = new Camera();
    this.data = null;
    this.frames = 0;
    this.w = 1; this.h = 1;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas.parentElement);
    this.resize();
  }
  resize() {
    const host = this.canvas.parentElement;
    this.w = Math.max(1, host.clientWidth); this.h = Math.max(1, host.clientHeight);
    this.renderer.setSize(this.w, this.h, false);
    this.cam.setSize(this.w, this.h);
    this.invalidate();
  }
  invalidate() {
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; this.draw(); });
  }
  clear() {
    for (const o of [...this.root.children]) { this.root.remove(o); o.geometry?.dispose(); o.material?.dispose(); o.userData?.tex?.dispose(); }
    this.labels = null;
  }
  /** Replace what is drawn with a site3d.js scene; `drape` (0.4 V3) = a THREE texture for meshes that carry uvs. */
  setData(data, bg, drape = null) {
    this.clear();
    this.data = data;
    this.scene.background = new THREE.Color('#' + hex(bg));
    const both = data.meshes.some((m) => m.key === 'eg') && data.meshes.some((m) => m.key === 'fg');
    for (const m of data.meshes) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(m.positions, 3));
      g.setAttribute('normal', new THREE.BufferAttribute(m.normals, 3));
      g.setAttribute('color', new THREE.BufferAttribute(m.colors, 3));
      if (m.uvs && drape) g.setAttribute('uv', new THREE.BufferAttribute(m.uvs, 2));
      g.setIndex(new THREE.BufferAttribute(m.indices, 1));
      g.computeBoundingSphere();
      // the existing ground under a graded surface: see-through, so cut and fill both show
      const ghost = both && m.key === 'eg';
      const mat = new THREE.MeshLambertMaterial({ vertexColors: !(m.uvs && drape), map: m.uvs && drape ? drape : null, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: ghost ? 2 : 1, polygonOffsetUnits: ghost ? 2 : 1, transparent: ghost, opacity: ghost ? 0.45 : 1, depthWrite: !ghost });
      const mesh = new THREE.Mesh(g, mat);
      mesh.name = m.key;
      if (ghost) mesh.renderOrder = 2;
      this.root.add(mesh);
    }
    for (const l of data.lines) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(l.positions, 3));
      const o = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#' + hex(l.color) }));
      o.name = l.key;
      this.root.add(o);
    }
    this.setSun(this.sunCfg);
    if (data.points) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(data.points.positions, 3));
      const o = new THREE.Points(g, new THREE.PointsMaterial({ color: '#' + hex(data.points.color), size: 6, sizeAttenuation: false }));
      o.name = 'points';
      this.root.add(o);
    }
    if (data.labels?.length) { this.labels = labelMesh(data.labels, '#' + hex(bg)); this.root.add(this.labels); }   // 0.5 WL.22
    this.invalidate();
  }
  /** 0.5 WL.22: which labels show from here (declutterLabels), written into the mesh before each frame. */
  placeLabels() {
    const m = this.labels, L = this.data?.labels;
    if (!m || !L) return;
    m.material.uniforms.viewport.value.set(this.w, this.h);
    const vp = this.cam.viewProj();
    const vis = declutterLabels(L, (at) => this.cam.project(at, vp), { w: this.w, h: this.h });
    const a = m.geometry.getAttribute('vis');
    for (let i = 0; i < L.length; i++) { const v = vis[i]; a.array[i * 4] = a.array[i * 4 + 1] = a.array[i * 4 + 2] = a.array[i * 4 + 3] = v; }
    a.needsUpdate = true;
    this.labelsShown = vis.reduce((s, v) => s + v, 0);
  }
  /** 0.4 V10: light from the sun. cfg = null (the usual light from the upper left) | { dir: [x, y, z] toward the sun in view
   *  space, up: above the horizon, shadows }. Shadows: one shadow map over the whole site. */
  setSun(cfg) {
    this.sunCfg = cfg;
    const b = this.data?.bbox, c = b ? [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2] : [0, 0, 0], r = Math.max(1, this.radius());
    const shade = !!(cfg?.up && cfg.shadows);
    if (!cfg) { this.hemi.intensity = 1.6; this.sun.intensity = 1.6; this.sun.position.set(-0.45, 0.55, 1); this.sun.target.position.set(0, 0, 0); }
    else {
      const n = Math.hypot(...cfg.dir) || 1, d = cfg.dir.map((v) => v / n);
      this.hemi.intensity = cfg.up ? 0.9 : 0.35;
      this.sun.intensity = cfg.up ? 2.4 : 0;
      this.sun.position.set(c[0] + d[0] * r * 2, c[1] + d[1] * r * 2, c[2] + d[2] * r * 2);
      this.sun.target.position.set(c[0], c[1], c[2]);
      const sc = this.sun.shadow.camera;
      sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 0.1; sc.far = r * 4; sc.updateProjectionMatrix();
    }
    this.sun.target.updateMatrixWorld();
    if (shade && !this.renderer.shadowMap.enabled) { this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; this.sun.shadow.mapSize.set(2048, 2048); this.sun.shadow.bias = -0.0005; this.sun.shadow.normalBias = 0.02 * r / 50; }
    this.sun.castShadow = shade;
    for (const o of this.root.children) if (o.isMesh) { o.castShadow = shade; o.receiveShadow = shade; o.material.needsUpdate = true; }
    this.invalidate();
  }
  radius() { const b = this.data?.bbox; return b ? Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]) / 2 : 50; }
  fit(dir = null) { this.cam.fit(this.data?.bbox || null, dir); this.invalidate(); }
  standard(name) { this.cam.standard(name, this.data?.bbox || null); this.invalidate(); }
  draw() {
    this.cam.clip(this.radius());
    const tc = this.tcam;
    tc.matrix.fromArray(invert(this.cam.view()));
    tc.matrixWorldNeedsUpdate = true;
    tc.updateMatrixWorld(true);
    tc.projectionMatrix.fromArray(this.cam.proj());
    tc.projectionMatrixInverse.copy(tc.projectionMatrix).invert();
    this.placeLabels();
    this.renderer.render(this.scene, tc);
    this.frames++;
    this.onRender?.();
  }
  dispose() { this.ro.disconnect(); this.clear(); this.renderer.dispose(); }
}

/** The 3D stage inside `host` (the plan area): bar + canvas + tip. */
export function mountSite3D(host, { project, onPick = () => false, say = () => {}, exag: exag0 = null, onExag = () => {}, corner = 'cube', drape: getDrape = null, selection = () => null }) {
  const state = readState();
  if (EXAGGERATIONS.includes(exag0)) state.exag = exag0;
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify({ exag: state.exag, color: state.color, persp: state.persp, show: state.show })); } catch { /* storage blocked: this visit only */ } };
  const opt = (v, label, cur) => el('option', { value: String(v), selected: String(v) === String(cur) }, label);
  const viewSel = el('select', { className: 'cv-select cv3-sel', 'data-3d-view': '', 'aria-label': t('v3d.view'), title: t('v3d.view') }, ...Object.keys(VIEWS).map((k) => opt(k, VIEW_KEYS[k] ? t(VIEW_KEYS[k]) : VIEW_LABELS[k], state.view)));
  const persp = el('button', { type: 'button', className: 'cv-toggle', 'data-3d-persp': '', 'aria-pressed': String(state.persp), title: t('v3d.persp.title') }, t('v3d.persp'));
  const extents = el('button', { type: 'button', className: 'cv-toggle', 'data-3d-extents': '', title: t('v3d.extents.title') }, t('v3d.extents'));
  const exag = el('select', { className: 'cv-select cv3-sel', 'data-3d-exag': '', 'aria-label': t('v3d.exag'), title: t('v3d.exag.title') }, ...EXAGGERATIONS.map((x) => opt(x, t('v3d.exag.opt', { x }), state.exag)));
  const color = el('select', { className: 'cv-select cv3-sel', 'data-3d-color': '', 'aria-label': t('v3d.color'), title: t('v3d.color.title') }, opt('bands', t('v3d.color.bands'), state.color), opt('single', t('v3d.color.single'), state.color), opt('map', t('v3d.color.map'), state.color));
  const checks = SHOW_LABELS.map(([k, label]) => el('label', {}, el('input', { type: 'checkbox', 'data-3d-show': k, checked: !!state.show[k] }), ' ', t(label)));
  const showMenu = el('details', { className: 'cv-menu cv3-menu', 'data-3d-show-menu': '' },
    el('summary', { className: 'cv-toggle', title: t('v3d.show.title') }, t('v3d.show')),
    el('div', { className: 'cv-menu-list cv3-checks' }, ...checks));
  const glb = el('button', { type: 'button', className: 'cv-toggle', 'data-3d-glb': '', title: t('v3d.glb.title') }, 'GLB');   // i18n-ignore: file format name
  const obj = el('button', { type: 'button', className: 'cv-toggle', 'data-3d-obj': '', title: t('v3d.obj.title') }, 'OBJ');   // i18n-ignore: file format name
  const bar = el('div', { className: 'cv3-bar', 'data-3d-bar': '' }, viewSel, persp, extents, exag, color, showMenu, el('span', { className: 'cv3-sep' }, t('v3d.export')), glb, obj);
  const canvas = el('canvas', { className: 'cv-canvas cv3-canvas', 'data-3d-canvas': '', tabindex: '0', 'aria-label': t('v3d.canvas') });   // 0.4 V5: more can be clicked now
  const stage = el('div', { className: 'cv3-stage' }, canvas);
  const tip = el('div', { className: 'cv3-tip', 'data-3d-tip': '', hidden: true });
  const note = el('div', { className: 'cv3-note', 'data-3d-note': '', hidden: true });
  host.replaceChildren(bar, stage, tip, note);

  const view = new SiteView3D(canvas);
  view.cam.persp = state.persp;
  // corner indicator: view cube (grid north = +Y) or axis icon
  const cubeOpts = cameraCubeOptions(view.cam, { invalidate: () => view.invalidate(), home: () => { state.view = 'iso'; viewSel.value = 'iso'; view.standard('iso'); }, north: 0 });
  const cube = mountViewCube(stage, { ...cubeOpts, i18n: { t, has } });
  const axes = mountAxisIcon(stage, { getView: cubeOpts.getView, corner: 'bottom-left', i18n: { t, has } });
  const setCorner = (c) => { cube.setVisible(c === 'cube'); axes.setVisible(c === 'axes'); };
  setCorner(corner);
  view.onRender = () => { cube.update(); axes.update(); };
  let data = null, theme = themeColors(), fitted = false, builtFor = null;
  const dv = mountDrive({ bar, stage, view, project, getData: () => data, rebuild: () => rebuild(), say });   // 0.4 V10 drive + sun

  // 0.4 V3: map layers draped on the surfaces. getDrape() → Promise of gis-map-ui.js's reg.drape (loads the GIS tools);
  // the texture is the drape's canvas, painted again (and uploaded again) whenever more of a map arrives
  let drapeApi = null, drapeTex = null, drapeBox = null, drapeOff = null, drapeNote = '', drapeAsked = false;
  function drapeFor(input) {
    drapeNote = '';
    if (state.color !== 'map') return null;
    if (!drapeApi) {
      if (!drapeAsked && getDrape) { drapeAsked = true; Promise.resolve(getDrape()).then((d) => { drapeApi = d || null; builtFor = null; rebuild(); }).catch(() => { drapeNote = t('v3d.map.noload'); }); }
      drapeNote = getDrape ? t('v3d.map.loading') : t('v3d.map.none');
      return null;
    }
    const surfs = [input.eg, input.fg].filter(Boolean);
    if (!surfs.length) return null;
    const box = surfs.map((sf) => sf.bounds).reduce((a, b) => ({ minX: Math.min(a.minX, b.minX), minY: Math.min(a.minY, b.minY), maxX: Math.max(a.maxX, b.maxX), maxY: Math.max(a.maxY, b.maxY) }));
    const r = drapeApi.render(box, 2048);
    if (!r) { drapeNote = t('v3d.map.none'); return null; }
    if (!drapeTex || drapeTex.image !== r.canvas) { drapeTex?.dispose(); drapeTex = new THREE.CanvasTexture(r.canvas); drapeTex.colorSpace = THREE.SRGBColorSpace; drapeTex.anisotropy = 4; }
    drapeTex.needsUpdate = true;
    drapeBox = box;
    if (r.attribution) drapeNote = r.attribution;
    drapeOff ||= drapeApi.onChange(() => { if (host.hidden || state.color !== 'map' || !drapeBox) return; drapeApi.render(drapeBox, 2048); if (drapeTex) drapeTex.needsUpdate = true; view.invalidate(); });
    return box;
  }
  function rebuild() {
    const p = project();
    const key = p.version + '|' + JSON.stringify(state) + '|' + theme.bg + '|' + p.pointsVersion + '|' + (p.state.gis?.maps ? JSON.stringify(p.state.gis.maps.map((m) => [m.id, m.visible, m.opacity])) : '');
    if (key === builtFor && data) return;
    builtFor = key;
    const input = siteInput(p);
    const box = drapeFor(input);
    data = buildSite3D(input, { exag: state.exag, color: box ? 'map' : state.color === 'map' ? 'bands' : state.color, drape: box, show: state.show, dark: theme.dark, colors: theme.colors });
    if (drapeNote) data.notes.push(drapeNote);
    view.setData(data, theme.bg, box ? drapeTex : null);
    hlFor = null;
    highlight();
    if (!fitted && data.bbox) { view.standard(state.view); fitted = true; }
    dv.refresh();   // 0.4 V10: the driver's eye and the sun follow a new exaggeration
    const empty = !data.meshes.length && !data.lines.length && !data.points;
    note.hidden = !empty && !data.notes.length;
    note.replaceChildren(...(empty ? [t('v3d.empty')] : data.notes).map((t) => el('div', {}, t)));
  }
  // 0.4 V5: the selection (the plan's: an alignment, pad, feature line, pipe, structure — or a breakline picked here) drawn
  // on top in the action colour: its segments, or for a pipe or structure its triangles
  let hlObj = null, hlFor = null, picked3d = null;
  function highlight() {
    const sel = picked3d || selection();
    const key = JSON.stringify(sel) + '|' + builtFor;
    if (key === hlFor) return;
    hlFor = key;
    if (hlObj) { view.scene.remove(hlObj); hlObj.traverse?.((o) => { o.geometry?.dispose(); o.material?.dispose(); }); hlObj = null; }
    if (!sel || !data) { view.invalidate(); return; }
    const color = new THREE.Color(theme.action || '#1e48c8');
    const g = new THREE.Group();
    const seg = [];
    for (const l of data.lines) {
      if (!l.owners) continue;
      const ks = new Set(l.owners.map((o, i) => (o.kind === sel.kind && String(o.id) === String(sel.id) ? i : -1)).filter((i) => i >= 0));
      if (!ks.size) continue;
      for (let k = 0; k < l.segOwner.length; k++) if (ks.has(l.segOwner[k])) for (let j = 0; j < 6; j++) seg.push(l.positions[k * 6 + j]);
    }
    if (seg.length) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(seg), 3));
      const o = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, depthTest: false, transparent: true }));
      o.renderOrder = 10;
      g.add(o);
    }
    for (const m of data.meshes) {
      if (!m.owners) continue;
      const k = m.owners.findIndex((o) => o.kind === sel.kind && String(o.id) === String(sel.id));
      if (k < 0) continue;
      const idx = [];
      for (let t = 0; t < m.triOwner.length; t++) if (m.triOwner[t] === k) idx.push(m.indices[3 * t], m.indices[3 * t + 1], m.indices[3 * t + 2]);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(m.positions, 3));
      geo.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1));
      const o = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.85 }));
      o.renderOrder = 10;
      g.add(o);
    }
    if (g.children.length) { hlObj = g; view.scene.add(g); }
    view.invalidate();
  }

  const api = {
    view, state, cube, axes,
    get highlighted() { return hlObj ? hlObj.children.reduce((n, o) => n + (o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 2), 0) : 0; },   // 0.4 V5 tests
    highlight() { picked3d = null; highlight(); }, get scene() { return data; }, get cam() { return view.cam; },
    setCorner,
    /** Exaggeration from outside (Settings › CivilCraft); the bar follows. */
    setExag(x) { if (!EXAGGERATIONS.includes(x) || x === state.exag) return; exag.value = String(x); changeExag(x, false); },
    /** Look along a view cube view {dir, up} (keeps target and distance; fits first when nothing was shown yet). */
    lookAlong(v) { rebuild(); cubeOpts.setView(v, { animate: false }); view.invalidate(); },
    show() { host.hidden = false; view.resize(); rebuild(); view.invalidate(); canvas.focus({ preventScroll: true }); },
    hide() { host.hidden = true; tip.hidden = true; drapeApi?.clear(); },   // 0.4 V3: the drape's map requests go with it
    refresh() { if (!host.hidden) { rebuild(); picked3d = null; highlight(); } },
    get drape() { return { api: drapeApi, texture: drapeTex, box: drapeBox, note: drapeNote }; },   // 0.4 V3, for tests
    get drive() { return dv; },   // 0.4 V10
    exportGLB() { rebuild(); return download(exportGLB(data, { name: project().state.name }), fileName('glb'), 'model/gltf-binary'); },
    exportOBJ() { rebuild(); return download(exportOBJ(data, { name: project().state.name }), fileName('obj'), 'text/plain'); },
    pick(x, y) { return pickSite(data, view.cam, x, y); },
  };
  const fileName = (ext) => (project().state.name || 'site').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').trim().slice(0, 80) + '-3d.' + ext;
  function download(bytes, name, type) {
    const a = el('a', { href: URL.createObjectURL(new Blob([bytes], { type })), download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    say(t('v3d.exported', { file: name, e: data.origin.x, n: data.origin.y, z: data.origin.z }));
    return name;
  }

  // ---- bar ----
  viewSel.addEventListener('change', () => { if (dv.driving) dv.end(); state.view = viewSel.value; view.standard(state.view); });
  persp.addEventListener('click', () => { state.persp = !state.persp; view.cam.persp = state.persp; persp.setAttribute('aria-pressed', String(state.persp)); save(); view.invalidate(); });
  extents.addEventListener('click', () => { if (dv.driving) dv.end(); view.fit(); });
  exag.addEventListener('change', () => changeExag(Number(exag.value), true));
  function changeExag(x, tell) {
    const k = x / state.exag;
    state.exag = x; save();
    if (tell) onExag(x);
    // keep looking at the same place: the target's height scales with the exaggeration, the eye moves with it
    const c = view.cam, dz = c.target[2] * (k - 1);
    c.target = [c.target[0], c.target[1], c.target[2] + dz]; c.eye = [c.eye[0], c.eye[1], c.eye[2] + dz];
    builtFor = null;
    if (!host.hidden) rebuild();
  }
  color.addEventListener('change', () => { state.color = color.value; save(); rebuild(); });
  showMenu.addEventListener('change', (e) => { const k = e.target.getAttribute('data-3d-show'); if (!k) return; state.show[k] = e.target.checked; save(); rebuild(); });
  document.addEventListener('click', (e) => { if (showMenu.open && !showMenu.contains(e.target)) showMenu.open = false; });
  glb.addEventListener('click', () => api.exportGLB());
  obj.addEventListener('click', () => api.exportOBJ());

  // ---- theme ----
  const retheme = () => { theme = themeColors(); builtFor = null; if (!host.hidden) rebuild(); };
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-space'] });
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', retheme);   // i18n-ignore: CSS media query

  // ---- navigation and picking ----
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  let drag = null, pinch = null;
  const touches = new Map();
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('pointerdown', (e) => {
    canvas.focus({ preventScroll: true });
    const p = pos(e);
    if (e.pointerType === 'touch') {
      touches.set(e.pointerId, p);
      if (touches.size === 2) { const [a, b] = [...touches.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), c: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }; drag = null; return; }
      if (touches.size > 2) return;
    }
    if (e.button > 2) return;
    cubeOpts.stop();
    dv.userMoved();   // 0.4 V10: looking round while driving pauses it
    canvas.setPointerCapture(e.pointerId);
    // 0.5 IP.3: what this button does comes from the menu style (input-mouse.js; null = the view's own: left orbits, right pans);
    // Shift swaps orbit and pan; 'zoom' drags zoom; 'none' leaves the button alone (a click still picks)
    const act = e.pointerType === 'touch' ? null : action3d(e.button);
    const mode = act === null ? (e.button === 2 ? 'pan' : 'orbit') : act;
    drag = { x: p.x, y: p.y, x0: p.x, y0: p.y, button: e.button, pan: act === null ? e.button === 2 || e.shiftKey : mode === 'pan' ? !e.shiftKey : mode === 'orbit' ? e.shiftKey : false, zoom: mode === 'zoom', none: mode === 'none', moved: false };
    if (e.button === 1) e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = pos(e);
    if (e.pointerType === 'touch' && touches.has(e.pointerId)) {
      touches.set(e.pointerId, p);
      if (pinch && touches.size === 2) {
        const [a, b] = [...touches.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y), c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        view.cam.pan(c.x - pinch.c.x, c.y - pinch.c.y);
        if (d > 10 && pinch.d > 10) view.cam.zoomAt(pinch.d / d, c.x, c.y);
        pinch = { d, c };
        view.invalidate();
        return;
      }
      if (pinch) return;
    }
    if (!drag) return;
    const dx = p.x - drag.x, dy = p.y - drag.y;
    drag.x = p.x; drag.y = p.y;
    if (!drag.moved && Math.hypot(p.x - drag.x0, p.y - drag.y0) < (e.pointerType === 'touch' ? 10 : 4)) return;   // a finger's tap wobbles
    drag.moved = true;
    tip.hidden = true;
    if (drag.none) return;
    if (drag.zoom) view.cam.zoomAt(Math.exp(dy * 0.01), drag.x0, drag.y0); else if (drag.pan) view.cam.pan(dx, dy); else view.cam.orbit(dx, dy);
    view.invalidate();
  });
  const end = (e) => {
    if (e.pointerType === 'touch') { touches.delete(e.pointerId); if (pinch) { if (!touches.size) pinch = null; return; } }
    const d = drag; drag = null;
    if (!d || d.moved || d.button !== 0 || e.type !== 'pointerup') return;
    const p = pos(e);
    const hit = api.pick(p.x, p.y);
    showTip(hit, p);
    const taken = hit && hit.kind !== 'surface' ? onPick(hit) : false;
    // 0.4 V5: something the plan cannot select (a breakline) is highlighted here only; a click on nothing clears it
    picked3d = hit && hit.kind === 'breakline' && !taken ? { kind: hit.kind, id: hit.id } : null;
    hlFor = null;
    highlight();
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', (e) => { touches.delete(e.pointerId); pinch = null; drag = null; });
  let padUntil = 0;
  const looksLikePad = (e) => {
    if (e.deltaMode !== 0) return false;
    if (e.deltaX !== 0 || (e.deltaY % 1 !== 0 && Math.abs(e.deltaY) < 50)) padUntil = e.timeStamp + 400;
    return e.timeStamp < padUntil;
  };
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    cubeOpts.stop();
    tip.hidden = true;
    if (!e.ctrlKey && looksLikePad(e)) {
      const k = e.deltaMode === 1 ? 16 : 1;
      if (e.shiftKey) view.cam.pan(-e.deltaX * k, -e.deltaY * k); else view.cam.orbit(-e.deltaX * k * 0.6, -e.deltaY * k * 0.6);
      view.invalidate();
      return;
    }
    const p = pos(e);
    const k = Math.exp((e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) * (e.ctrlKey ? 0.01 : 0.0015 * wheelFactor()));   // IP.3: the style's wheel
    view.cam.zoomAt(k, p.x, p.y);
    view.invalidate();
  }, { passive: false });
  canvas.addEventListener('keydown', (e) => {
    if (dv.keydown(e)) { e.preventDefault(); e.stopPropagation(); return; }   // 0.4 V10
    const step = 40;
    const m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (m && !e.ctrlKey && !e.altKey) { e.preventDefault(); if (e.shiftKey) view.cam.pan(-m[0], -m[1]); else view.cam.orbit(m[0], m[1]); view.invalidate(); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); view.cam.zoomAt(0.8); view.invalidate(); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); view.cam.zoomAt(1.25); view.invalidate(); }
  });

  function showTip(hit, p) {
    if (!hit) { tip.hidden = true; return; }
    const u = project().state.units === 'm' ? 'm' : 'ft';
    tip.replaceChildren(el('strong', {}, hit.name), el('span', {}, t('v3d.tip.at', { e: fixed(hit.at.x, 2), n: fixed(hit.at.y, 2), z: fixed(hit.at.z, 2), u })));
    tip.hidden = false;
    const w = host.clientWidth;
    tip.style.left = Math.min(Math.max(8, p.x + 14), Math.max(8, w - 260)) / 16 + 'rem';
    tip.style.top = (p.y + bar.offsetHeight + 14) / 16 + 'rem';
  }
  return api;
}
