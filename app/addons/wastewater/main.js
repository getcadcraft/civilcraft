/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Water and wastewater treatment add-on for CivilCraft (0.8 Track CH, CH.20 "CivilCraft site links"; chem-finish-11, add-on API 1.4). Off until the person adds it.
 * The engine is CivilCraft's synced copy of lib/process (dev/process/, `node tools/process/sync.mjs --env civilcraft`; nobody edits the copy): the same `water` and `wdesign`
 * calculators the P&ID and Plant add-ons show, in one right-panel tab, through the shared calculator panel (calc-ui.js). After a `water` run, "Put the basins on the site"
 * draws each tank's footprint (water.basinPlan: area = volume / water depth, a square placeholder, west to east in one row) as a closed feature line with use "off"
 * (linework, not part of a surface), one undo step. The Site plan buttons save the same footprints as GeoJSON or DXF. The WaterTAP engine record is shown as it registers
 * (held: see water.js WATERTAP_ENGINE). A study aid, not an engineering approval. Nothing is sent anywhere.
 *   basinFeatures(basins, { units, at })   metres → project units, the first basin's south-west corner at `at` (project units)
 *   siteCentre(project)                     the middle of the project's points and feature lines, or [0, 0]
 *   settlerSvg(doc, settler)                CH.33 (water-a-11): the settler's layers as bars (solids, bottom up), the sludge blanket shaded; drawn under the panel after a water run
 * CH.33/34/39 (water-a-11): the water calculator's sample is the BSM1 plant with its 10-layer Takacs settler and a water temperature; after a run the panel says the
 * blanket height and the effluent solids in words and draws the profile. The bsm1 calculator lists the published BSM1 steady state next to this run.
 */
import { mountCalc } from '../../process/calc-ui.js';
import * as CALC from '../../process/calc.js';
import * as W from '../../process/env/water.js';
import { createRegistry } from '../../process/engines.js';
import * as feat from '../../featureline.js';

export const IDS = ['water', 'wdesign', 'bsm1', 'asm', 'digester', 'mbr', 'ro', 'dosing'];   // bsm1: CH.39, the benchmark against its published table; asm, digester, mbr, ro, dosing: CH.35-38 (water-b-11, lib/process/calc-treat.js)
const FT = 0.3048;
const registry = { list: () => CALC.list().filter((c) => IDS.includes(c.id)), get: CALC.get, run: CALC.run, toCsv: CALC.toCsv, pickerOf: CALC.pickerOf };

export function basinFeatures(basins, { units = 'ft', at = [0, 0] } = {}) {
  const k = units === 'm' ? 1 : 1 / FT, [x0, y0] = [Number(at[0]) || 0, Number(at[1]) || 0];
  const first = basins[0]?.polygon?.[0] || [0, 0];
  return basins.map((b) => ({
    name: 'Basin ' + b.id + (b.aerated ? ' (aerated)' : '') + ', ' + +b.volume.toPrecision(5) + ' m3, ' + +b.depth.toPrecision(3) + ' m deep',
    pts: b.polygon.map(([x, y]) => ({ x: x0 + (x - first[0]) * k, y: y0 + (y - first[1]) * k, z: 0 })), closed: true, use: 'off',
  }));
}
export function siteCentre(p) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  const take = (q) => { if (q && Number.isFinite(q.x) && Number.isFinite(q.y)) { a = Math.min(a, q.x); b = Math.min(b, q.y); c = Math.max(c, q.x); d = Math.max(d, q.y); } };
  for (const q of p?.points || []) take(q);
  for (const f of p?.state?.features || []) for (const q of f.pts || []) take(q);
  return Number.isFinite(a) ? [(a + c) / 2, (b + d) / 2] : [0, 0];
}

const SVGNS = 'http://www.w3.org/2000/svg';
export function settlerSvg(d, s) {
  const W = 220, H = 120, L = s.layers.length, bh = (H - 20) / L, max = Math.max(...s.layers.map((l) => l.X), 1), svg = d.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', String(W)); svg.setAttribute('height', String(H)); svg.setAttribute('data-ww-profile', '');
  const el = (tag, a) => { const n = d.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(a)) n.setAttribute(k, String(v)); svg.append(n); return n; };
  el('rect', { x: 40, y: 10, width: W - 50, height: H - 20, fill: 'none', stroke: 'currentColor', 'stroke-width': 0.5 });
  const nb = Math.round(s.blanket.height / (s.height / L));
  if (nb > 0) el('rect', { x: 40, y: 10 + (L - nb) * bh, width: W - 50, height: nb * bh, fill: 'currentColor', 'fill-opacity': 0.12 });
  s.layers.forEach((l, m) => {
    const y = 10 + (L - 1 - m) * bh, w = Math.max(0.5, (W - 52) * Math.log10(1 + l.X) / Math.log10(1 + max));
    el('rect', { x: 41, y: y + 1, width: w, height: bh - 2, fill: m + 1 === s.feedLayer ? 'var(--cc-accent, #c47a00)' : 'currentColor', 'fill-opacity': 0.6 });
    if (m === 0 || m === L - 1 || m + 1 === s.feedLayer) { const t = el('text', { x: 36, y: y + bh - 2, 'text-anchor': 'end', 'font-size': 7, fill: 'currentColor' }); t.textContent = String(+l.X.toPrecision(3)); }
  });
  return svg;
}

export async function activate(api) {
  const t = api.t, P = () => window.civilcraft && window.civilcraft.project;
  const U = () => (P()?.state?.units === 'm' ? 'm' : 'ft');
  let source = null;
  try { source = api.problems.source({ id: 'water', label: t('ww.name') }); } catch { source = null; }
  const engine = createRegistry([W.WATERTAP_ENGINE]).get('watertap');
  const ctx = { api, W, CALC, panel: null, placed: 0, engine };
  function place(last, cur) {
    const p = P();
    if (!p) return { say: t('ww.noproject') };
    if (!last || !Array.isArray(last.basins) || !last.basins.length) return { say: t('ww.norun') };
    const at = Array.isArray(cur?.site?.at) && cur.site.at.length === 2 ? cur.site.at : siteCentre(p);
    const made = basinFeatures(last.basins, { units: U(), at }).map((f) => feat.cleanFeature(f, U())).filter(Boolean);
    const ids = made.map(() => p.nextId('f'));
    p.change(t('ww.undo'), (s) => { s.features = s.features || []; made.forEach((f, i) => s.features.push({ ...f, id: ids[i] })); });
    ctx.placed += made.length;
    return { say: t('ww.placed', { n: made.length }) };
  }
  api.ui.panelTab({
    id: 'wastewater', title: t('ww.name'),
    render: (body) => {
      const d = body.ownerDocument, mk = (tag, text, attrs = {}) => { const n = d.createElement(tag); if (text !== undefined) n.textContent = text; for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
      const root = mk('div', undefined, { 'data-ww-panel': '' });
      root.append(mk('p', t('ww.lede'), { class: 'text-ink-2' }));
      const box = mk('div', undefined, { 'data-ww-calc': '' });
      root.append(box);
      const eng = mk('p', t('ww.engine', { name: engine.name, license: engine.license, why: engine.allowed ? t('ww.engine.ok') : t('ww.engine.held') }), { class: 'text-ink-2', 'data-ww-engine': '' });
      eng.style.fontSize = '0.75rem';
      root.append(eng);
      body.append(root);
      const sum = mk('div', undefined, { 'data-ww-settler': '' });
      sum.hidden = true;
      root.append(sum);
      const onRun = (id, _input, r) => {
        const s = r && r.settler;
        if (id !== 'water' || !s) { sum.hidden = true; sum.replaceChildren(); return; }
        const f = (v) => String(+(+v).toPrecision(3));
        sum.replaceChildren(mk('p', t('ww.settler', { h: f(s.blanket.height), H: f(s.height), x: f(s.effluentTSS), u: f(s.underflowTSS), th: f(s.blanket.threshold) }), { class: 'text-ink-2', 'data-ww-settler-line': '' }), settlerSvg(d, s), mk('p', t('ww.settler.key'), { class: 'text-ink-2' }));
        sum.lastChild.style.fontSize = '0.75rem';
        sum.hidden = false;
      };
      ctx.panel = mountCalc(box, {
        t, calc: registry, onRun,
        publish: (list) => { try { source?.set(list); } catch { /* a build without Problems */ } },
        actions: [{ id: 'basins', label: t('ww.place'), show: (id, last) => id === 'water' && !!(last && last.basins && last.basins.length), run: (last, cur) => place(last, cur) }],
      });
    },
  });
  window.ccWastewater = ctx;   // the tests reach the add-on here
  api.onDeactivate(() => { try { source?.set([]); } catch { /* nothing to clear */ } if (window.ccWastewater === ctx) delete window.ccWastewater; });
}
