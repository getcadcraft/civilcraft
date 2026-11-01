/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geo-ui.js — the windows for geotechnical, roads, survey adjustment, mining, radio links and rail work (0.8 EG.9/10/11/27/28 CV.1, session `civil-geo_PART_2`).
 * Surface › More opens each: Soils and slopes (geo-soil), Roads (geo-road), Survey adjustment (geo-survey), Open pits (geo-mine), Radio links (geo-link), Rail (geo-rail).
 * One generic editor drives every item (a form of fields, plus a text box for each list written one row a line), runs it through geo-run.js (the same code the
 * assistant tools run) and draws the answer. DOM only; every word is a t() key (geo.*). Calculation aids: an engineer checks.
 *
 *   createGeo(ctx) → { command(c) → handled, problems() → [problem] }
 *   ctx = { el, root, project, units, say, download(name, blob), fileStem(), ground() → existing surface, problemsChanged() }
 */
import { t } from './i18n.js';
import { openWin, table, csv } from './eg-win.js';
import { cleanGeo } from './geo-state.js';
import { pitLoops, runProfile, runSlope, runSettlement, runJunction, runStripe, runNet, runPit, runLink, runTurnout, runClearance, runTraverse, runDrawing, DRAWING_LAYERS } from './geo-run.js';
import { runCover } from './geo-run.js';
import { pitGround } from './pit-surface.js';   // 0.8 EG.27
import { adjustedCsv } from './adjust.js';
import { writeDxf } from './dxf.js';
import { boringSvg, profileSvg, slopeSvg, SOILS } from './geotech.js';
import { readCollector, reduce, toObservations } from './collector.js';
import { fixed } from './units.js';

export const GEO_COMMANDS = ['geo-soil', 'geo-road', 'geo-survey', 'geo-mine', 'geo-link', 'geo-rail'];

// ------------------------------------------------------------------ what each item looks like: fields [key, kind, options], lists (one row a line, columns in order)
const F = (k, kind = 'num', o = {}) => ({ k, kind, ...o });
const FORMS = {
  borings: { fields: [F('name', 'text'), F('x'), F('y'), F('z'), F('depth'), F('water')], lists: [{ k: 'layers', cols: ['from', 'to', 'soil|text', 'unit|text', 'desc|text', 'gamma', 'c', 'phi', 'cc', 'cs', 'e0', 'cv', 'sigmaC'] }],
    blank: () => ({ name: 'B-1', x: 0, y: 0, z: 100, depth: 10, water: null, layers: [{ from: 0, to: 3, soil: 'FILL', unit: 'fill' }, { from: 3, to: 10, soil: 'CL', unit: 'clay' }] }) },
  sections: { fields: [F('name', 'text'), F('width')], lists: [{ k: 'line', cols: ['x', 'y'] }], blank: () => ({ name: 'A–A', width: 50, line: [{ x: 0, y: 0 }, { x: 60, y: 0 }] }) },
  slopes: { fields: [F('name', 'text'), F('section', 'ref:sections'), F('method', 'pick:bishop,ordinary'), F('water'), F('ru'), F('kh'), F('floor')], lists: [{ k: 'surcharge', cols: ['x0', 'x1', 'q'] }, { k: 'materials', cols: ['unit|text', 'gamma', 'c', 'phi', 'cu'], map: true }],
    blank: () => ({ name: 'Slope', section: '', method: 'bishop', water: null, ru: 0, kh: 0, surcharge: [], materials: {} }) },
  settles: { fields: [F('name', 'text'), F('boring', 'ref:borings'), F('water'), F('load.q'), F('load.B'), F('load.L'), F('load.depth'), F('load.at', 'pick:centre,corner'), F('load.method', 'pick:boussinesq,2:1')],
    blank: () => ({ name: 'Footing', boring: '', load: { q: 150, B: 3, L: 3, depth: 1, at: 'centre', method: 'boussinesq' } }) },
  junctions: { fields: [F('name', 'text'), F('centre.x'), F('centre.y'), F('radius'), F('curb', 'pick:simple,3centre'), F('crossings', 'pick:none,continental,ladder'), F('speed'), F('gap'), F('show', 'pick:yes,no')], lists: [{ k: 'legs', cols: ['bearing', 'halfWidth', 'length', 'name|text', 'radius'] }],
    blank: () => ({ name: 'Junction', centre: { x: 0, y: 0 }, radius: 9, curb: 'simple', crossings: 'none', show: 'yes', speed: 50, gap: 7.5, legs: [{ bearing: 0, halfWidth: 6, length: 40, name: 'East' }, { bearing: 180, halfWidth: 6, length: 40, name: 'West' }, { bearing: 90, halfWidth: 4, length: 30, name: 'North' }] }) },
  stripes: { fields: [F('name', 'text'), F('alignment', 'ref:alignments'), F('show', 'pick:yes,no'), F('plan.lanesLeft'), F('plan.lanesRight'), F('plan.laneWidth'), F('plan.centre', 'pick:double,dashed,none')], lists: [{ k: 'plan.breaks', cols: ['from', 'to'] }, { k: 'signs', cols: ['kind|text', 'station', 'side|text', 'offset'] }],
    blank: () => ({ name: 'Striping', alignment: '', show: 'yes', plan: { lanesLeft: 1, lanesRight: 1, laneWidth: 3.6, centre: 'double', edge: true, breaks: [] }, signs: [] }) },
  nets: { fields: [F('name', 'text'), F('free', 'pick:no,yes')], lists: [{ k: 'points', cols: ['id|text', 'x', 'y', 'fixed|text', 'sx', 'sy'], map: true }, { k: 'obs', cols: ['type|text', 'from|text', 'to|text', 'at|text', 'value', 'sd', 'set'] }],
    blank: () => ({ name: 'Network', free: 'no', points: {}, obs: [] }) },
  traverses: { fields: [F('name', 'text'), F('start.x'), F('start.y'), F('end.x'), F('end.y')], lists: [{ k: 'legs', tk: 'tlegs', cols: ['dist', 'az'] }],
    blank: () => ({ name: 'Traverse', start: { x: 0, y: 0 }, legs: [{ dist: 100, az: 90 }, { dist: 100, az: 180 }, { dist: 100, az: 270 }, { dist: 100.2, az: 0 }] }) },
  pits: { fields: [F('name', 'text'), F('nx'), F('ny'), F('nz'), F('size.0'), F('size.1'), F('size.2'), F('origin.0'), F('origin.1'), F('origin.2'), F('density'), F('price'), F('recovery'), F('processCost'), F('miningCost'), F('slope'), F('phases'), F('oreCapacity'), F('moveCapacity'), F('discount'), F('rampGrade'), F('rampWidth'), F('rampOn', 'pick:no,yes'), F('cut', 'pick:no,yes'), F('show3d', 'pick:yes,no')], lists: [{ k: 'samples', cols: ['x', 'y', 'z', 'grade'] }],
    blank: () => ({ name: 'Pit', nx: 10, ny: 10, nz: 5, size: [10, 10, 10], origin: [0, 0, 0], density: 2.7, price: 50, recovery: 0.9, processCost: 20, miningCost: 2, slope: 45, phases: 0, oreCapacity: 0, moveCapacity: 0, discount: 0.1, rampGrade: 0.1, rampWidth: 0, rampOn: 'no', cut: 'no', show3d: 'yes', samples: [] }) },
  links: { fields: [F('name', 'text'), F('a.x'), F('a.y'), F('a.h'), F('b.x'), F('b.y'), F('b.h'), F('f'), F('pt'), F('gt'), F('gr'), F('sensitivity'), F('k'), F('clutter'), F('terrain', 'pick:average,smooth,mountain'), F('towerWidth'), F('towerSolidity'), F('antennaArea'), F('wind'), F('towerWeight'), F('footing'), F('towerLegs', 'pick:4,3'), F('legCapacity'), F('loadFactor'), F('legE'), F('legI'), F('legLength'), F('legK')],
    blank: () => ({ name: 'Link', a: { x: 0, y: 0, h: 30 }, b: { x: 5000, y: 0, h: 30 }, f: 5, pt: 20, gt: 30, gr: 30, sensitivity: -85, k: 4 / 3, clutter: 0, terrain: 'average', towerWidth: 0, towerSolidity: 0.3, antennaArea: 0.5, wind: 40, towerWeight: 0, footing: 0, towerLegs: 4, legCapacity: 0, loadFactor: 1, legE: 200, legI: 0, legLength: 0, legK: 1 }) },
  covers: { fields: [F('name', 'text'), F('tx.x'), F('tx.y'), F('tx.h'), F('f'), F('pt'), F('gt'), F('gr'), F('sensitivity'), F('rxH'), F('range'), F('step'), F('k'), F('clutter'), F('show', 'pick:yes,no')],
    blank: () => ({ name: 'Coverage', tx: { x: 0, y: 0, h: 30 }, f: 2, pt: 30, gt: 10, gr: 0, sensitivity: -90, rxH: 2, range: 3000, step: 100, k: 4 / 3, clutter: 0, show: 'yes' }) },
  clearances: { fields: [F('name', 'text'), F('radius'), F('cant'), F('base'), F('length'), F('bogie'), F('curve', 'pick:R,L')], lists: [{ k: 'outline', cols: ['o', 'z'] }],
    blank: () => ({ name: 'Gauge', radius: 300, cant: 100, base: 1500, length: 20, bogie: 14, curve: 'R', outline: [{ o: -1.7, z: 0.1 }, { o: 1.7, z: 0.1 }, { o: 1.7, z: 4.3 }, { o: -1.7, z: 4.3 }] }) },
  turnouts: { fields: [F('name', 'text'), F('n'), F('gauge'), F('side', 'pick:L,R'), F('switchLength'), F('switchAngle'), F('spacing'), F('alignment', 'ref:alignments'), F('station'), F('show', 'pick:yes,no')],
    blank: () => ({ name: 'Turnout', n: 8, gauge: 1.435, side: 'L', switchLength: 6.1, switchAngle: 0.0143, spacing: 0, alignment: '', station: 0, show: 'yes' }) },
};
const GROUPS = {
  'geo-soil': { id: 'cv-geo-soil', title: 'geo.soil.title', cols: ['borings', 'sections', 'slopes', 'settles'] },
  'geo-road': { id: 'cv-geo-road', title: 'geo.road.title', cols: ['junctions', 'stripes'] },
  'geo-survey': { id: 'cv-geo-survey', title: 'geo.survey.title', cols: ['nets', 'traverses'] },
  'geo-mine': { id: 'cv-geo-mine', title: 'geo.mine.title', cols: ['pits'] },
  'geo-link': { id: 'cv-geo-link', title: 'geo.link.title', cols: ['links', 'covers'] },
  'geo-rail': { id: 'cv-geo-rail', title: 'geo.rail.title', cols: ['turnouts', 'clearances'] },
};
const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const put = (o, path, v) => { const ks = path.split('.'); let a = o; ks.slice(0, -1).forEach((k, i) => { if (a[k] == null || typeof a[k] !== 'object') a[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; a = a[k]; }); a[ks[ks.length - 1]] = v; };
const NUM = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

/** The pit in plan: every bench's rim (darker lower down) and the haul ramp over them, in the project unit. */
function pitSvg(r, k) {
  const L = pitLoops(r), all = L.flatMap((b) => b.loops.filter((l) => l.area > 0).flatMap((l) => l.pts)), xs = all.map((q) => q[0] / k), ys = all.map((q) => q[1] / k);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), W = 360, sc = W / Math.max(1e-9, x1 - x0, y1 - y0), X = (v) => ((v / k - x0) * sc + 10).toFixed(1), Y = (v) => ((y1 - v / k) * sc + 10).toFixed(1);
  const rims = L.map((b, i) => b.loops.filter((l) => l.area > 0).map((l) => `<path d="M${l.pts.map((q) => `${X(q[0])} ${Y(q[1])}`).join(' L')}Z" fill="none" stroke="#6b5a45" stroke-opacity="${(0.35 + 0.65 * (i / Math.max(1, L.length - 1))).toFixed(2)}"/>`).join('')).join('');
  const road = `<path d="M${r.road.pts.map((q) => `${X(q[0])} ${Y(q[1])}`).join(' L')}" fill="none" stroke="#d9730d" stroke-width="3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${((x1 - x0) * sc + 20).toFixed(0)} ${((y1 - y0) * sc + 20).toFixed(0)}" width="${((x1 - x0) * sc + 20).toFixed(0)}" height="${((y1 - y0) * sc + 20).toFixed(0)}">${rims}${road}</svg>`;
}

export function createGeo(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => (ctx.units() === 'm' ? 'm' : 'ft'), G = () => P().state.geo || {};
  const probs = new Map();   // item id → [problem]
  const btn = (label, icon, fn, data) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', [data || 'data-geo-btn']: '', onclick: fn }, el('i', { className: 'bi bi-' + icon, 'aria-hidden': 'true' }), ' ', label);   // i18n-ignore: icon class
  const kv = (rows) => el('div', { className: 'cv-props' }, ...rows.flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, v)]));
  const note = (...c) => el('p', { className: 'cv-note' }, ...c);
  const lenU = () => U();
  const svg = (text) => {   // the drawing, with a button that saves it as an .svg file
    const d = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement, w = el('div', { className: 'cv-geo-pic' }), pic = el('div', { role: 'img', 'aria-label': t('geo.pic') });
    pic.append(document.importNode(d, true));
    w.append(pic, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-geo-svg': '', onclick: () => { ctx.download((ctx.fileStem() || 'civilcraft') + '-geo.svg', new Blob([text], { type: 'image/svg+xml' })); ctx.say(t('geo.saved.file')); } }, el('i', { className: 'bi bi-download', 'aria-hidden': 'true' }), ' ', t('geo.save.svg')));
    return w;
  };

  // ------------------------------------------------------------------ the plan drawing (junctions, striping, signs, crossings, turnouts): the window overlay and the .dxf both read runDrawing
  const lineOf = (id, step) => { const al = P().state.alignments.find((a) => a.id === id); if (!al) return null; try { return P().alignment(al).polyline(step || (U() === 'm' ? 5 : 15)).map((q) => ({ x: q.x, y: q.y })); } catch { return null; } };
  const drawing = () => runDrawing(G(), U(), (id) => lineOf(id));
  let memo = { key: '', d: null };
  const drawn = () => {   // the overlay draws on every repaint: recompute only when the items (or the alignments they sit on) changed
    const g = G(), used = new Set([...(g.stripes || []).map((x) => x.alignment), ...(g.turnouts || []).map((x) => x.alignment)]);
    const key = JSON.stringify([g.junctions, g.stripes, g.turnouts, U(), P().state.alignments.filter((a) => used.has(a.id))]);
    if (key !== memo.key) memo = { key, d: (g.junctions?.length || g.stripes?.length || g.turnouts?.length) ? drawing() : { entities: [] } };
    return memo.d;
  };
  // 0.8 EG.28: coverage sketches, recomputed only when the item or the ground changes
  const covCache = new Map();
  const groundKey = () => { const g = ctx.ground(); return g ? g.X.length + ':' + g.nT + ':' + g.ox + ':' + g.Z[0] : 'none'; };
  const coverCache = (c) => { const key = JSON.stringify(c) + '|' + U() + '|' + groundKey(), h = covCache.get(c.id); if (h && h.key === key) return h.r; const r = runCover(c, U(), ctx.ground()); covCache.set(c.id, { key, r }); return r; };
  const BANDS = (sens) => [[sens + 20, '#2e8b57'], [sens + 10, '#c9b21a'], [sens, '#d9730d']];
  function coverSvg(c, r) {
    const W = 360, sc = W / (r.nx * r.step), rects = []; const bands = BANDS(c.sensitivity);
    for (let j = 0; j < r.ny; j++) for (let i = 0; i < r.nx; i++) { const p = r.pr[i + r.nx * j]; if (!(p >= c.sensitivity)) continue; const col = bands.find(([lim]) => p >= lim)[1]; rects.push(`<rect x="${(i * r.step * sc).toFixed(1)}" y="${((r.ny - 1 - j) * r.step * sc).toFixed(1)}" width="${(r.step * sc + 0.5).toFixed(1)}" height="${(r.step * sc + 0.5).toFixed(1)}" fill="${col}" fill-opacity="0.7"/>`); }
    const tx = ((c.tx.x * (U() === 'ft' ? 0.3048 : 1) - r.x0) * sc).toFixed(1), ty = ((r.ny - 1) * r.step * sc - (c.tx.y * (U() === 'ft' ? 0.3048 : 1) - r.y0) * sc + r.step * sc).toFixed(1);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}"><rect width="${W}" height="${W}" fill="none" stroke="#999"/>${rects.join('')}<circle cx="${tx}" cy="${ty}" r="4" fill="#b3122e"/></svg>`;
  }
  function coverOverlay(c2d, S) {
    for (const c of G().covers || []) {
      if (c.show === 'no') continue;
      let r; try { r = coverCache(c); } catch { continue; } if (!r.ok) continue;
      const k = U() === 'ft' ? 0.3048 : 1, bands = BANDS(c.sensitivity); c2d.save(); c2d.globalAlpha = 0.35;
      for (let j = 0; j < r.ny; j++) for (let i = 0; i < r.nx; i++) {
        const p = r.pr[i + r.nx * j]; if (!(p >= c.sensitivity)) continue;
        const a = S((r.x0 + i * r.step) / k, (r.y0 + j * r.step) / k), b = S((r.x0 + (i + 1) * r.step) / k, (r.y0 + (j + 1) * r.step) / k);
        c2d.fillStyle = bands.find(([lim]) => p >= lim)[1]; c2d.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x) + 0.5, Math.abs(b.y - a.y) + 0.5);
      }
      c2d.restore();
    }
  }
  function overlay(c2d, S, C) {
    coverOverlay(c2d, S);
    const d = drawn(); if (!d.entities.length) return;
    c2d.save(); c2d.lineWidth = 1; c2d.lineJoin = 'round';
    const COL = { 'C-ROAD-EDGE': C.ink || '#444', 'C-ROAD-MARK-YELLOW': '#d4a017', 'C-ROAD-MARK-WHITE': C.muted || '#888', 'C-ROAD-XWALK': C.muted || '#888', 'C-ROAD-SIGN': '#2e8b57', 'C-RAIL-TURNOUT': '#c0392b', 'C-RAIL-MAIN': '#555' };
    for (const e of d.entities) {
      c2d.strokeStyle = c2d.fillStyle = COL[e.layer] || '#666';
      if (e.type === 'poly') { c2d.beginPath(); e.pts.forEach((p, i) => { const q = S(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); }); if (e.closed) c2d.closePath(); c2d.stroke(); }
      else if (e.type === 'point') { const q = S(e.x, e.y); c2d.beginPath(); c2d.arc(q.x, q.y, 3, 0, 6.2832); c2d.fill(); }
    }
    c2d.restore();
  }
  const dxfButton = () => btn(t('geo.dxf'), 'filetype-dxf', () => {
    const d = drawing(); if (!d.entities.length) { ctx.say(t('geo.dxf.none')); return; }
    const { text } = writeDxf({ units: U(), layers: DRAWING_LAYERS, entities: d.entities.map(({ of, ...e }) => e) });
    ctx.download((ctx.fileStem() || 'civilcraft') + '-roads.dxf', new Blob([text], { type: 'application/dxf' })); ctx.say(t('geo.saved.file'));
  }, 'data-geo-dxf');

  // ------------------------------------------------------------------ the generic editor
  function listText(L, item) {
    const v = get(item, L.k), rows = L.map ? Object.entries(v || {}).map(([id, o]) => ({ [L.cols[0].split('|')[0]]: id, ...o })) : (v || []);
    return rows.map((r) => L.cols.map((c) => { const [k] = c.split('|'); const x = r[k]; return x === undefined || x === null ? '' : typeof x === 'boolean' ? (x ? 'fixed' : '') : String(x).replace(/[,\n]/g, ' '); }).join(', ')).join('\n');
  }
  function parseList(L, text) {
    const out = [], bad = [];
    text.split(/\r?\n/).forEach((line, i) => {
      if (!line.trim()) return;
      const cells = line.split(',').map((x) => x.trim()), o = {}; let miss = false;
      L.cols.forEach((c, j) => {
        const [k, kind] = c.split('|'), raw = cells[j];
        if (raw === undefined || raw === '') return;
        if (kind === 'text') o[k] = k === 'fixed' ? /^(fixed|true|1|yes)$/i.test(raw) : raw;
        else if (NUM.test(raw.replace(',', '.'))) o[k] = Number(raw);
        else miss = true;
      });
      if (miss) bad.push(i + 1); else out.push(o);
    });
    if (L.map) { const key = L.cols[0].split('|')[0], m = {}; for (const r of out) { const { [key]: id, ...rest } = r; if (id) m[id] = rest; } return { value: m, bad }; }
    return { value: out, bad };
  }

  function open(cmd) {
    const grp = GROUPS[cmd], S = { col: grp.cols[0], draft: null, id: null };
    openWin(ctx, grp.id, grp.title, (body, win) => {
      const col = S.col, form = FORMS[col], items = G()[col] || [];
      if (!S.draft) { S.draft = items.find((x) => x.id === S.id) ? JSON.parse(JSON.stringify(items.find((x) => x.id === S.id))) : form.blank(); }
      const D = S.draft, kids = [note(el('strong', {}, t('geo.review')))];
      if (grp.cols.length > 1) kids.push(el('div', { className: 'cv-actions', role: 'tablist' }, ...grp.cols.map((c) => el('button', { type: 'button', role: 'tab', className: 'btn-line btn-sm-cc' + (c === col ? ' is-active' : ''), 'aria-selected': c === col ? 'true' : 'false', 'data-geo-tab': c, onclick: () => { S.col = c; S.id = null; S.draft = null; win.redraw(); } }, t('geo.c.' + c)))));
      kids.push(note(t('geo.lead.' + col)));
      const pick = el('select', { className: 'select-cc cv-input', 'aria-label': t('geo.pick'), 'data-geo-pick': '', onchange: () => { S.id = pick.value || null; S.draft = null; win.redraw(); } }, el('option', { value: '' }, t('geo.new')), ...items.map((x) => el('option', { value: x.id, selected: x.id === S.id }, x.name || x.id)));
      kids.push(el('div', { className: 'cv-actions' }, pick));
      const refs = (kind) => (kind === 'alignments' ? P().state.alignments.map((a) => [a.id, a.name || a.id]) : (G()[kind] || []).map((x) => [x.id, x.name || x.id]));
      const grid = el('div', { className: 'cv-props', 'data-geo-form': '' }), inputs = [];
      for (const f of form.fields) {
        const id = 'geo-f-' + f.k.replace(/\W/g, '-'), label = t('geo.f.' + f.k.replace(/\.\d+$/, '').replace(/^.*\./, '').replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())) + (/\.\d$/.test(f.k) ? ' ' + 'xyz'[Number(f.k.slice(-1))] : '') + (f.kind === 'num' && /^(x|y|z|depth|water|width|radius|a\.|b\.|centre|size|origin|load\.(B|L|depth)|laneWidth|plan\.laneWidth|gauge|switchLength|clutter|floor)/.test(f.k) ? ' (' + lenU() + ')' : '');
        let inp;
        if (f.kind.startsWith('pick:')) { inp = el('select', { className: 'select-cc cv-input', id }, ...f.kind.slice(5).split(',').map((v) => el('option', { value: v, selected: get(D, f.k) === v }, v))); }
        else if (f.kind.startsWith('ref:')) { inp = el('select', { className: 'select-cc cv-input', id }, el('option', { value: '' }, t('geo.none')), ...refs(f.kind.slice(4)).map(([v, l]) => el('option', { value: v, selected: get(D, f.k) === v }, l))); }
        else inp = el('input', { type: 'text', className: 'cv-input', id, value: get(D, f.k) ?? '', inputMode: f.kind === 'num' ? 'decimal' : 'text', style: f.kind === 'num' ? 'width:8rem' : undefined });
        inp.addEventListener('change', () => {
          if (f.kind === 'num') { const raw = inp.value.trim().replace(',', '.'); if (raw === '') { put(D, f.k, null); inp.removeAttribute('aria-invalid'); return; } if (!NUM.test(raw)) { inp.setAttribute('aria-invalid', 'true'); return; } inp.removeAttribute('aria-invalid'); put(D, f.k, Number(raw)); }
          else put(D, f.k, inp.value);
        });
        inputs.push(inp); grid.append(el('label', { className: 'k', for: id }, label), inp);
      }
      kids.push(grid);
      const areas = [];
      for (const L of form.lists || []) {
        const id = 'geo-l-' + L.k.replace(/\W/g, '-'), ta = el('textarea', { className: 'cv-input', id, rows: 5, spellcheck: false, 'data-geo-list': L.k, style: 'width:100%;font-family:monospace' }, listText(L, D));
        areas.push([L, ta]);
        kids.push(el('label', { className: 'k', for: id }, t('geo.l.' + (L.tk || L.k))), el('p', { className: 'cv-note' }, t('geo.l.' + (L.tk || L.k) + '.how')), ta);
      }
      const status = el('p', { className: 'cv-note', 'aria-live': 'polite', 'data-geo-status': '' }), out = el('div', { 'data-geo-out': '' });
      const commit = () => {
        for (const [L, ta] of areas) { const r = parseList(L, ta.value); if (r.bad.length) { status.textContent = t('geo.badrows', { rows: r.bad.join(', ') }); return false; } put(D, L.k, r.value); }
        return true;
      };
      const save = () => {
        if (!commit()) return null;
        let newId = D.id || null;
        const p = P(), probe = cleanGeo({ [col]: [{ ...D }] }, U(), (v, pre) => (v ? String(v) : pre + '0'));
        if (!probe || !probe[col]?.length) { status.textContent = t('geo.invalid'); return null; }
        p.change(t('geo.undo.save', { what: t('geo.c.' + col) }), (st) => { st.geo ||= {}; const list = (st.geo[col] ||= []); if (newId && list.some((x) => x.id === newId)) st.geo[col] = list.map((x) => (x.id === newId ? { ...probe[col][0], id: newId } : x)); else { newId = p.nextId('g'); list.push({ ...probe[col][0], id: newId }); } });
        S.id = newId; D.id = newId; status.textContent = t('geo.saved'); ctx.redraw?.(); return newId;
      };
      const run = () => {
        const id = save(); if (!id) return;
        const item = G()[col].find((x) => x.id === id);
        try { out.replaceChildren(...RUN[col](item, { out, status, win })); } catch (e) { out.replaceChildren(note(t('geo.failed', { why: String(e.message || e).slice(0, 160) }))); }
        ctx.problemsChanged?.(); ctx.redraw?.();
      };
      kids.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-geo-run': '', onclick: run }, t('geo.run')), btn(t('geo.save'), 'check2-circle', () => { if (save()) win.redraw(); }, 'data-geo-save'),
        ...(D.id ? [btn(t('geo.delete'), 'trash', () => { P().change(t('geo.undo.del'), (st) => { st.geo[col] = (st.geo[col] || []).filter((x) => x.id !== D.id); if (!st.geo[col].length) delete st.geo[col]; if (!Object.keys(st.geo).length) delete st.geo; }); probes.delete(D.id); S.id = null; S.draft = null; win.redraw(); ctx.problemsChanged?.(); ctx.redraw?.(); }, 'data-geo-delete')] : []),
        ...(col === 'nets' ? [btn(t('geo.import'), 'file-earmark-arrow-up', () => importCollector(D, win, status), 'data-geo-import')] : [])), status, out);
      body.replaceChildren(...kids);
      void inputs;
    }, { wide: true });
  }
  const probes = probs;   // alias used when an item is deleted

  // ------------------------------------------------------------------ the data collector import (EG.11)
  function importCollector(D, win, status) {
    const inp = el('input', { type: 'file', accept: '.rw5,.gsi,.xml,.jxl,.csv,.txt', hidden: true });
    inp.addEventListener('change', async () => {
      const f = inp.files[0]; if (!f) return;
      const text = await f.text(), job = readCollector(text, {}), red = reduce(job), o = toObservations(job, {});
      const miss = [...job.problems, ...red.problems].length;
      D.points = o.points; D.obs = o.obs; D.name = D.name === 'Network' ? f.name.replace(/\.[^.]+$/, '') : D.name;
      status.textContent = t('geo.import.done', { format: job.format, setups: job.setups.length, points: Object.keys(o.points).length, obs: o.obs.length, miss }) + ' ' + t('geo.import.untested'); win.redraw();
    });
    inp.click();
  }

  // ------------------------------------------------------------------ the answers
  const RUN = {
    borings: (b) => {
      const rows = b.layers.map((l) => [fixed(l.from, 2) + '–' + fixed(l.to, 2), l.soil + ' · ' + t('geo.uscs.' + l.soil.toLowerCase()), l.unit, fixed(l.gamma, 1), fixed(l.c, 1), fixed(l.phi, 0)]);
      return [svg(boringSvg({ ...b, units: U() }, { units: U(), labels: { depth: t('geo.log.depth'), soil: t('geo.log.soil'), desc: t('geo.log.desc'), spt: 'N', water: t('geo.log.water'), uscs: Object.fromEntries(SOILS.map((s) => [s.code, t('geo.uscs.' + s.code.toLowerCase())])) } })),
        table(ctx, [t('geo.log.depth') + ' (' + U() + ')', t('geo.log.soil'), t('geo.f.unit'), 'γ kN/m³', 'c kPa', 'φ°'], rows, 'data-geo-layers'), note(t('geo.typical'))];
    },
    sections: (s) => {
      const r = runProfile(G(), s.id, U()); if (!r || !r.profile.borings.length) return [note(t('geo.profile.none'))];
      return [svg(profileSvg(r.profile, { title: s.name + ' (m)' })), table(ctx, [t('geo.f.name'), t('geo.sta') + ' (m)', t('geo.off') + ' (m)'], r.profile.borings.map((b) => [b.name, fixed(b.sta, 1), fixed(b.off, 1)]), 'data-geo-borings')];
    },
    slopes: (s) => {
      const r = runSlope(G(), s, U(), ctx.ground()); const pp = (r.problems || []).map((x) => x.code);
      probs.set(s.id, (r.problems || []).filter((x) => x.code === 'geo.slope.low').map((x) => ({ item: s.name || s.id, code: x.code, key: 'geo.prob.slope.low', vars: { fs: fixed(x.value, 2), target: fixed(x.limit, 2) } })));
      if (!r.critical) return [note(t('geo.slope.none', { why: pp.join(', ') }))];
      return [svg(slopeSvg(r.geom, r)), kv([[t('geo.slope.fs'), fixed(r.fs, 2) + ' (' + t('geo.method.' + s.method) + ')'], [t('geo.slope.circle'), t('geo.slope.circle.v', { x: fixed(r.critical.circle.xc, 1), z: fixed(r.critical.circle.zc, 1), r: fixed(r.critical.circle.R, 1) })], [t('geo.slope.tried'), String(r.tried)]]),
        ...(pp.length ? [el('ul', { className: 'cv-plainlist' }, ...pp.map((c) => el('li', {}, t('geo.prob.' + c.replace('geo.', ''), { fs: fixed(r.fs, 2), target: '1.50', item: s.name || s.id }))))] : [note(t('geo.slope.ok'))])];
    },
    settles: (s) => {
      const r = runSettlement(G(), s, U()); if (!r.rows) return [note(t('geo.settle.noboring'))];
      probs.set(s.id, (r.problems || []).map((x) => ({ item: s.name || s.id, code: x.code, key: 'geo.prob.settle.total', vars: { s: fixed(x.value * 1000, 0), limit: fixed(x.limit * 1000, 0) } })));
      return [kv([[t('geo.settle.cons'), fixed(r.consolidation * 1000, 1) + ' mm'], [t('geo.settle.imm'), fixed(r.immediate * 1000, 1) + ' mm'], [t('geo.settle.total'), fixed(r.total * 1000, 1) + ' mm'],
        ...(r.time ? [[t('geo.settle.t50'), fixed(r.time.t50, 2) + ' ' + t('geo.years')], [t('geo.settle.t90'), fixed(r.time.t90, 2) + ' ' + t('geo.years')]] : [])]),
      table(ctx, [t('geo.settle.depth') + ' (m)', "σ'₀ kPa", 'Δσ kPa', t('geo.settle.s') + ' mm', t('geo.settle.kind')], r.rows.map((x) => [fixed(x.depth, 2), fixed(x.sigma0, 1), fixed(x.dsigma, 1), fixed(x.s * 1000, 2), t('geo.settle.' + x.kind)]), 'data-geo-settle')];
    },
    junctions: (j) => {
      const r = runJunction(j, U()), I = r.intersection; if (!I.pavement.length) return [note(t('geo.junction.legs'))];
      const xs = I.pavement.map((p) => p.x), ys = I.pavement.map((p) => p.y), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), W = 520, sc = Math.min(W / (x1 - x0 || 1), 360 / (y1 - y0 || 1));
      const d = 'M' + I.pavement.map((p) => `${((p.x - x0) * sc + 10).toFixed(1)} ${((y1 - p.y) * sc + 10).toFixed(1)}`).join(' L') + 'Z';
      probs.set(j.id, r.problems.map((x) => ({ item: j.name || j.id, code: x.code, key: 'geo.prob.' + x.code.replace(/^geo\./, ''), vars: { leg: x.leg ?? '', need: fixed(x.need ?? 0, 0), tangent: fixed(x.tangent ?? 0, 1) } })));
      return [svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W + 20} ${(y1 - y0) * sc + 20}" width="${W + 20}" height="${(y1 - y0) * sc + 20}"><path d="${d}" fill="#d6d6d6" stroke="#333"/>${r.crossings.flatMap((c) => [...c.bars, c.stopBar]).map((b) => `<path d="M${b.map((p) => `${((p.x - x0) * sc + 10).toFixed(1)} ${((y1 - p.y) * sc + 10).toFixed(1)}`).join(' L')}Z" fill="#fff" stroke="#999" stroke-width=".5"/>`).join('')}</svg>`),
        kv([[t('geo.junction.area'), fixed(I.area, 0) + ' ' + lenU() + '²'], [t('geo.junction.curb'), fixed(I.curbLength, 1) + ' ' + lenU()], [t('geo.junction.isd'), fixed(r.isd, 0) + ' ' + lenU()], [t('geo.junction.curbkind'), t('geo.curb.' + (j.curb || 'simple'))], [t('geo.junction.crossings'), String(r.crossings.length)]]), el('div', { className: 'cv-actions' }, dxfButton()),
        ...(r.problems.length ? [el('ul', { className: 'cv-plainlist' }, ...r.problems.map((x) => el('li', {}, t('geo.prob.' + x.code.replace(/^geo\./, ''), { leg: x.leg ?? '', need: fixed(x.need ?? 0, 0), tangent: fixed(x.tangent ?? 0, 1), item: j.name || j.id }))))] : [])];
    },
    stripes: (s) => {
      const al = P().state.alignments.find((a) => a.id === s.alignment); if (!al) return [note(t('geo.stripe.noal'))];
      const line = P().alignment(al).polyline(U() === 'm' ? 5 : 15).map((q) => ({ x: q.x, y: q.y })), r = runStripe(s, line, U()), q = r.stripe.quantities;
      return [kv([...Object.entries(q.length).map(([k, v]) => [t('geo.mark.' + k), fixed(v, 1) + ' ' + lenU()]), [t('geo.stripe.area'), fixed(q.paintedArea, 1) + ' ' + lenU() + '²']]), el('div', { className: 'cv-actions' }, dxfButton()),
        ...(r.signs.signs.length ? [table(ctx, [t('geo.sign.kind'), t('geo.sign.code'), t('geo.sta'), t('geo.sign.side')], r.signs.signs.map((g) => [t('geo.sign.' + g.kind), g.code, fixed(g.station, 1), g.side]), 'data-geo-signs')] : [])];
    },
    nets: (n) => {
      const r = runNet(n); if (!r.dof && r.dof !== 0) return [note(t('geo.net.bad', { why: (r.problems || []).map((p) => p.code).join(', ') }))];
      probs.set(n.id, (r.problems || []).filter((p) => p.code === 'adj.blunder' || p.code === 'adj.chi2').map((p) => ({ item: n.name || n.id, code: p.code, key: 'geo.prob.' + p.code.replace(/\./g, '-'), vars: { obs: String((p.obs ?? 0) + 1), w: fixed(p.w ?? 0, 1), chi: fixed(p.value ?? 0, 1) } })));
      const free = Object.entries(r.points).filter(([, p]) => !p.fixed);
      return [note(t('geo.import.untested')), ...(n.free === 'yes' ? [note(t('geo.net.free'))] : []), el('div', { className: 'cv-actions' }, btn(t('geo.net.csv'), 'filetype-csv', () => { ctx.download((ctx.fileStem() || 'civilcraft') + '-adjusted.csv', new Blob([adjustedCsv(r)], { type: 'text/csv' })); ctx.say(t('geo.saved.file')); }, 'data-geo-csv')), kv([[t('geo.net.dof'), String(r.dof)], [t('geo.net.sigma'), fixed(r.sigma0, 2)], [t('geo.net.chi'), r.chi2 ? `${fixed(r.chi2.value, 1)} [${fixed(r.chi2.lo, 1)}, ${fixed(r.chi2.hi, 1)}] ${r.chi2.pass === null ? '' : t(r.chi2.pass ? 'geo.net.pass' : 'geo.net.fail')}` : '–']]),
        table(ctx, [t('geo.f.id'), 'x', 'y', t('geo.net.a') + ' ' + lenU(), t('geo.net.b') + ' ' + lenU()], free.map(([k, p]) => [k, fixed(p.x, 3), fixed(p.y, 3), fixed(r.ellipses[k]?.semiMajor ?? 0, 3), fixed(r.ellipses[k]?.semiMinor ?? 0, 3)]), 'data-geo-points'),
        table(ctx, ['#', t('geo.f.type'), t('geo.net.v'), t('geo.net.w'), ''], r.obs.map((o, i) => [String(i + 1), o.type, Array.isArray(o.v) ? o.v.map((v) => fixed(v, 4)).join(' ') : fixed(o.v ?? 0, 4), fixed(o.w ?? 0, 2), o.flag ? t('geo.net.blunder') : '']), 'data-geo-obs')];
    },
    pits: (p) => {
      const r = runPit(p, U()), s = r.summary, kk = U() === 'ft' ? 0.3048 : 1;
      probs.set(p.id, r.problems.map((x) => ({ item: x.item, code: x.code, key: 'geo.prob.' + x.code.replace(/\./g, '-'), vars: {} })));
      const cutG = p.cut === 'yes' && ctx.ground() ? pitGround(ctx.ground(), p, U(), r) : null;
      if (cutG?.belowTop) probs.get(p.id).push({ item: p.name || p.id, code: 'pit.top.belowground', key: 'geo.prob.pit-top-belowground', vars: {} });
      const roadRows = r.road && r.road.pts.length ? [[t('geo.pit.road'), t('geo.pit.road.v', { len: fixed(r.road.length / kk, 0), u: lenU(), drop: fixed(r.road.drop / kk, 1), n: String(r.road.benches.length) })]] : [];
      return [kv([[t('geo.pit.value'), fixed(r.result.value, 0)], [t('geo.pit.ore'), fixed(s.ore, 0) + ' t'], [t('geo.pit.waste'), fixed(s.waste, 0) + ' t'], [t('geo.pit.strip'), Number.isFinite(s.strip) ? fixed(s.strip, 2) : '–'], [t('geo.pit.blocks'), `${r.result.blocks} / ${r.model.nx * r.model.ny * r.model.nz}`]]),
        table(ctx, [t('geo.pit.bench'), t('geo.pit.ore') + ' t', t('geo.pit.waste') + ' t', t('geo.pit.grade')], s.benches.map((b) => [String(b.level + 1), fixed(b.ore, 0), fixed(b.waste, 0), fixed(b.grade, 2)]), 'data-geo-benches'),
        table(ctx, [t('geo.pit.cutoff'), 't', t('geo.pit.grade')], r.gradeTonnage.map((g) => [fixed(g.cutoff, 2), fixed(g.tonnes, 0), fixed(g.grade, 2)]), 'data-geo-gt'),
        kv([[t('geo.pit.ramp'), fixed(r.ramp.perBench, 0) + ' ' + lenU() + ' ' + t('geo.pit.ramp.per') + ' · ' + fixed(r.ramp.total, 0) + ' ' + lenU()]]),
        ...(r.road && r.road.pts.length ? [svg(pitSvg(r, kk))] : []), kv([...roadRows, ...(p.rampOn === 'yes' && p.rampWidth > 0 ? [[t('geo.pit.slope'), fixed(r.slopeUsed, 1) + '°']] : []), ...(cutG ? [[t('geo.pit.dug'), fixed(cutG.dug, 0) + ' ' + lenU() + '³']] : [])]), ...(roadRows.length ? [note(t('geo.pit.road.note'))] : []),
        ...(r.phases ? [table(ctx, [t('geo.pit.factor'), t('geo.pit.blocks'), t('geo.pit.value')], r.phases.map((q) => [fixed(q.factor, 2), String(q.result.blocks), fixed(q.result.value, 0)]), 'data-geo-phases')] : []),
        ...(r.plan ? [kv([[t('geo.pit.npv'), fixed(r.plan.npv, 0)], [t('geo.pit.cash'), fixed(r.plan.undiscounted, 0)], [t('geo.pit.left'), String(r.plan.unscheduled)]]), table(ctx, [t('geo.pit.period'), t('geo.pit.ore') + ' t', t('geo.pit.waste') + ' t', t('geo.pit.grade'), t('geo.pit.cash'), 'PV'], r.plan.periods.map((q) => [String(q.period), fixed(q.ore, 0), fixed(q.waste, 0), fixed(q.grade, 2), fixed(q.cash, 0), fixed(q.pv, 0)]), 'data-geo-schedule')] : [])];
    },
    links: (l) => {
      const r = runLink(l, U(), ctx.ground()); probs.set(l.id, r.problems.map((x) => ({ item: l.name || l.id, code: x.code, key: 'geo.prob.' + x.code.replace(/^tel\./, 'tel-').replace(/\./g, '-'), vars: { margin: fixed(x.margin ?? 0, 1), ratio: fixed((x.ratio ?? 0) * 100, 0), util: fixed((x.util ?? 0) * 100, 0) } })));
      const W = 520, H = 160, d = r.los.samples, zs = d.flatMap((s) => [s.line, s.obstruction]), zmin = Math.min(...zs), zmax = Math.max(...zs), X = (km) => 10 + (km / r.dKm) * W, Y = (z) => 10 + (zmax - z) / (zmax - zmin || 1) * H;
      const pic = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W + 20} ${H + 20}" width="${W + 20}" height="${H + 20}"><path d="M${d.map((s) => `${X(s.d).toFixed(1)} ${Y(s.obstruction).toFixed(1)}`).join(' L')} L${X(r.dKm)} ${H + 10} L10 ${H + 10}Z" fill="#cdbf9d" stroke="#555"/><path d="M${d.map((s) => `${X(s.d).toFixed(1)} ${Y(s.line).toFixed(1)}`).join(' L')}" fill="none" stroke="#c0392b" stroke-width="1.5"/><path d="M${d.map((s) => `${X(s.d).toFixed(1)} ${Y(s.line - 0.6 * s.F1).toFixed(1)}`).join(' L')}" fill="none" stroke="#1f6fb2" stroke-dasharray="4 3"/></svg>`;
      return [svg(pic), kv([[t('geo.link.dist'), fixed(r.dKm, 2) + ' km'], [t('geo.link.fspl'), fixed(r.fspl, 1) + ' dB'], [t('geo.link.pr'), fixed(r.budget.pr, 1) + ' dBm'], [t('geo.link.margin'), fixed(r.budget.margin, 1) + ' dB'],
        [t('geo.link.los'), r.los.clear ? t('geo.link.clear') : t('geo.link.blocked')], ...(r.los.min ? [[t('geo.link.tight'), t('geo.link.tight.v', { km: fixed(r.los.min.d, 2), c: fixed(r.los.min.clearance, 1), p: fixed(r.los.min.ratio * 100, 0) })]] : []), ...(r.mast ? [[t('geo.link.mast'), fixed(r.mast, 1) + ' ' + lenU()]] : []), [t('geo.link.avail'), fixed((1 - r.availability.annual) * 100, 4) + ' %'], [t('geo.link.outage'), fixed(r.availability.secondsPerYear / 60, 1) + ' ' + t('geo.link.min')],
        ...(r.legs ? [[t('geo.tower.leg'), fixed(r.legs.compression, 1) + ' kN'], ...(r.legs.tension > 0 ? [[t('geo.tower.uplift'), fixed(r.legs.tension, 1) + ' kN']] : []), ...(r.legs.utilization !== null ? [[t('geo.tower.util'), fixed(r.legs.utilization * 100, 0) + ' %']] : []), ...(r.legs.pcr ? [[t('geo.tower.pcr'), fixed(r.legs.pcr, 1) + ' kN · ' + fixed(r.legs.bucklingUtil * 100, 0) + ' %']] : [])] : []), ...(r.tower ? [[t('geo.tower.shear'), fixed(r.tower.shear / 1000, 1) + ' kN'], [t('geo.tower.moment'), fixed(r.tower.moment / 1000, 1) + ' kN·m'], ...(r.tower.fsOverturn ? [[t('geo.tower.fs'), fixed(r.tower.fsOverturn, 2)]] : [])] : [])]), note(t('geo.link.avail.note'))];
    },
    covers: (c) => {
      const r = coverCache(c);
      if (!r.ok) return [note(t('geo.prob.tel-cover-fine', { cells: String(r.problems[0].cells), item: c.name || c.id }))];
      probs.set(c.id, r.problems.map((x) => ({ item: c.name || c.id, code: x.code, key: 'geo.prob.tel-cover-noground', vars: {} })));
      return [svg(coverSvg(c, r)), kv([[t('geo.cover.covered'), fixed(r.covered * 100, 1) + ' %'], [t('geo.cover.farthest'), fixed(r.farthest, 0) + ' ' + lenU()], [t('geo.cover.cells'), String(r.cells)]]), note(t('geo.cover.note'))];
    },
    clearances: (c) => {
      const r = runClearance(c), all = [...r.polygon, ...r.straight], xs = all.map((p) => p.o), zs = all.map((p) => p.z), x0 = Math.min(...xs), x1 = Math.max(...xs), z1 = Math.max(...zs), sc = 80, X = (v) => (v - x0) * sc + 10, Y = (v) => (z1 - v) * sc + 10;
      const path = (P, st, da) => `<path d="M${P.map((p) => `${X(p.o).toFixed(1)} ${Y(p.z).toFixed(1)}`).join(' L')}Z" fill="none" stroke="${st}" ${da ? 'stroke-dasharray="4 3"' : ''}/>`;
      return [svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${(x1 - x0) * sc + 20} ${z1 * sc + 20}" width="${(x1 - x0) * sc + 20}" height="${z1 * sc + 20}">${path(r.straight, '#555', true)}${path(r.polygon, '#c0392b', false)}</svg>`),
        kv([[t('geo.clear.inside'), fixed(r.allowance.inside * 1000, 0) + ' mm'], [t('geo.clear.outside'), fixed(r.allowance.outside * 1000, 0) + ' mm'], [t('geo.clear.spacing'), Number.isFinite(r.spacing) ? fixed(r.spacing, 3) + ' m' : '–']]), note(t('geo.clear.placeholder'))];
    },
    turnouts: (tu) => {
      const r = runTurnout(tu), T = r.turnout || r; if (!r.ok) return [note(t('geo.turnout.fail'))];
      const pts = T.centre, xs = pts.map((p) => p.x), ys = pts.map((p) => p.y), x1 = Math.max(...xs), yl = Math.min(...ys, 0), yh = Math.max(...ys, 0), W = 520, sc = W / (x1 || 1), H = Math.max(30, (yh - yl) * sc * 4);
      const pic = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W + 20} ${H + 20}" width="${W + 20}" height="${H + 20}"><path d="M10 ${H / 2 + 10} H${W + 10}" stroke="#333" fill="none"/><path d="M${pts.map((p) => `${(10 + p.x * sc).toFixed(1)} ${(H / 2 + 10 - p.y * sc * 4).toFixed(1)}`).join(' L')}" stroke="#c0392b" stroke-width="1.5" fill="none"/></svg>`;
      return [svg(pic), kv([[t('geo.turnout.angle'), fixed(T.theta * 180 / Math.PI, 3) + '°'], [t('geo.turnout.radius'), fixed(T.R, 1) + ' ' + lenU()], [t('geo.turnout.lead'), fixed(T.lead, 2) + ' ' + lenU()], ...(r.speed ? [[t('geo.turnout.speed'), fixed(r.speed, 0) + ' km/h']] : []), ...(r.straight !== undefined ? [[t('geo.turnout.straight'), fixed(r.straight, 2) + ' ' + lenU()]] : [])]), note(t('geo.turnout.placeholder')), ...(tu.alignment ? [el('div', { className: 'cv-actions' }, dxfButton())] : [])];
    },
    traverses: (tv) => {
      const r = runTraverse(tv);
      probs.set(tv.id, r.problems.map((x) => ({ item: tv.name || tv.id, code: x.code, key: 'geo.prob.traverse.loose', vars: { prec: fixed(x.value, 0) } })));
      return [kv([[t('geo.trav.mis'), fixed(r.misclosure.len, 3) + ' ' + lenU()], [t('geo.trav.dx'), fixed(r.misclosure.dx, 3)], [t('geo.trav.dy'), fixed(r.misclosure.dy, 3)], [t('geo.trav.per'), fixed(r.perimeter, 2) + ' ' + lenU()], [t('geo.trav.prec'), Number.isFinite(r.precision) ? '1 : ' + fixed(r.precision, 0) : '–']]),
        table(ctx, ['#', 'x', 'y', 'x (raw)', 'y (raw)'], r.points.map((p, i) => [String(i), fixed(p.x, 3), fixed(p.y, 3), fixed(r.raw[i].x, 3), fixed(r.raw[i].y, 3)]), 'data-geo-trav')];
    },
  };
  void csv;

  function command(c) { if (GROUPS[c]) { open(c); return true; } return false; }
  function problems() {
    const out = [];
    for (const [id, list] of probs) for (const p of list) out.push({ code: p.code, part: id + ':' + p.code, severity: 'warning', msg: { key: p.key, vars: { ...p.vars, item: p.item } }, text: t(p.key, { ...p.vars, item: p.item }), about: [] });
    return out;
  }
  return { command, problems, overlay, drawing };
}
