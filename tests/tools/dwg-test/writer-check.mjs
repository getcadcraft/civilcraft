/* SPDX-License-Identifier: Apache-2.0 */
/**
 * writer-check.mjs — builder W's verification harness for lib/dwg/write.js.
 *
 * For each test drawing and each version (AC1015 … AC1032): write it, open it in the three oracles (LibreDWG
 * dwgread + dwg2dxf, libdxfrw dwg2dxf, ODA File Converter with audit on — tools/civilcraft-test/dwg-readers.mjs),
 * read each oracle's DXF with ezdxf (tools/dwg-test/writer-dump.py) and compare it with the source model: tables,
 * units, blocks, layouts and every entity by order, type, layer, colour and geometry (1e-9 relative), text exact.
 *
 *   node tools/dwg-test/writer-check.mjs [--versions AC1015,AC1018] [--cases sink,every-kind,big,roundtrip]
 *        [--readers libredwg,libdxfrw,oda] [--keep dir] [--json out.json] [--quiet]
 *
 * Reader messages that AutoCAD's own sample files (testfiles/dwg-samples) trigger in exactly the same way are
 * not counted as problems; they are listed under ALLOWED with the evidence.
 * Exit code 1 when any (case, version, reader) has a problem or a content difference.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeDwg, VERSIONS, aciFromRgb } from '../../lib/dwg/write.js';
import { fromCivilList } from '../../lib/dwg/civil.js';
import { kitchenSink } from './writer-models.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOLS = path.join(ROOT, 'tools/civilcraft-test');
const PY = path.join(TOOLS, 'venv/bin/python');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const versions = arg('--versions', Object.keys(VERSIONS).join(',')).split(',');
const caseNames = arg('--cases', 'sink,every-kind').split(',');
const readerNames = arg('--readers', 'libredwg,libdxfrw,oda').split(',');
const OUT = path.resolve(arg('--keep', fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'dwgw-check-'))));
const QUIET = process.argv.includes('--quiet');
fs.mkdirSync(OUT, { recursive: true });

/** Messages AutoCAD's own files raise in the same reader (dwgread -v2 on testfiles/dwg-samples). */
export const ALLOWED = {
  libredwg: [
    [/Skip HATCH common handles due to short handle stream/, 'every HATCH, AutoCAD-saved samples included (example_2004 … 2018)'],
    [/Invalid ATTRIB\.keep_duplicate_records/, 'R2010+ ATTRIB: dwgread reads one byte past the entity (example_2013.dwg raises it too)'],
    [/Unknown flag \(0x8\)/, 'R2013+ fit-point SPLINE flag 8 "use knot parameter", as AutoCAD writes it (example_2013.dwg)'],
  ],
  libdxfrw: [],
  oda: [],
};
/**
 * What libdxfrw's dwg2dxf leaves out of its DXF even for AutoCAD's own example_2000/2018.dwg (so not our files'
 * fault): RAY, XLINE, 3DFACE, TRACE and ATTDEF entities are not written, a polyface mesh loses its face records
 * (flag 128 → 0) and a DIMENSION its block name (group 2).
 */
/**
 * LibreDWG's dwg2dxf writes these R2004+ layer colours as other indexes — for the ODA File Converter's own R2004
 * file of the same drawing too (checked over all 255 colours): 79→178, 104→176, 129→174, 189→172, 255→5.
 */
const LIBREDWG_LAYER_ACI = { 79: 178, 104: 176, 129: 174, 189: 172, 255: 5 };
const LIBDXFRW_DROPS = new Set(['RAY', 'XLINE', '3DFACE', 'TRACE', 'ATTDEF', 'VIEWPORT']);
// (and VIEWPORT entities; true colours cannot appear in the R2000 DXF the harness asks libdxfrw for)

// ---------------------------------------------------------------- test drawings
const CASES = {
  sink: () => kitchenSink(),
  'every-kind': () => fromCivilList({
    units: 'm', layers: [{ name: 'Lay/er:1', color: 3 }, { name: 'Lay_er_1', color: 4 }, { name: 'Pads', color: 'blue' }],
    entities: [
      { type: 'line', layer: 'Lay/er:1', a: { x: -12.5, y: 3.25, z: 1.5 }, b: { x: 100.125, y: -7, z: -2 } },
      { type: 'line', layer: 'Lay_er_1', a: { x: 0, y: 0 }, b: { x: 0, y: 10 } },
      { type: 'poly', layer: 'Pads', pts: [{ x: 1, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 4 }], closed: true },
      { type: 'poly', layer: 'C-TOPO-MAJR', pts: [{ x: 0.1, y: 0.2 }, { x: 0.1, y: 0.3 }, { x: 0.4, y: 0.3 }], elev: -3.75 },
      { type: 'poly3d', layer: 'C-TOPO-BRKL', pts: [{ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 }, { x: 7, y: 9, z: 8 }], closed: true },
      { type: 'arc', layer: 'C-ROAD-CNTR', c: { x: 50, y: 60 }, r: 12.5, a0: 5.5, a1: 0.5 },
      { type: 'circle', layer: 'C-STRM-STRC', c: { x: -5, y: -6 }, r: 0.6 },
      { type: 'point', layer: 'V-NODE', x: 3, y: 4, z: -1.25 },
      { type: 'text', layer: 'V-NODE-TEXT', x: 10, y: 20, h: 1.5, rot: 0, text: 'Left 12° ±0.5 Ω € — ½', align: 'left' },
      { type: 'text', layer: 'C-ROAD-STAN', x: 11, y: 21, h: 2, rot: 1.25, text: '11+00', align: 'center' },
      { type: 'text', layer: 'C-ROAD-STAN', x: 12, y: 22, h: 2.5, rot: -0.5, text: 'PC 12+34.56', align: 'right' },
    ],
  }),
  big: () => {
    const ents = [], layers = [];
    for (let i = 0; i < 300; i++) layers.push({ name: 'L' + i, color: 1 + (i % 255) });
    let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 70000; i++) ents.push({ type: 'point', layer: 'L' + (i % 300), x: 6.2e6 + r() * 1e4, y: 2.1e6 + r() * 1e4, z: r() * 100 });
    ents.push({ type: 'poly', layer: 'L1', pts: Array.from({ length: 20000 }, (_, i) => ({ x: i * 0.5, y: Math.sin(i / 100) * 50 })), elev: 250.5 });
    ents.push({ type: 'poly3d', layer: 'L2', pts: Array.from({ length: 3000 }, (_, i) => ({ x: i, y: Math.cos(i / 30) * 9, z: i / 10 })) });
    return fromCivilList({ units: 'ft', layers, entities: ents });
  },
};

// ---------------------------------------------------------------- what the oracles should see
const deg = (a) => { let d = (a * 180 / Math.PI) % 360; if (d < 0) d += 360; return d; };
const P3 = (p) => [p?.x || 0, p?.y || 0, p?.z || 0];
const DXF_TYPE = { POLYLINE_2D: 'POLYLINE', POLYLINE_3D: 'POLYLINE', POLYLINE_PFACE: 'POLYLINE', POLYLINE_MESH: 'POLYLINE' };
const POLY_MODE = { POLYLINE_2D: 'AcDb2dPolyline', POLYLINE_3D: 'AcDb3dPolyline', POLYLINE_PFACE: 'AcDbPolyFaceMesh', POLYLINE_MESH: 'AcDbPolygonMesh' };
export function expected(e, ren, version = 'AC1018') {
  let t = String(e.type).toUpperCase();
  if (t === 'ACAD_TABLE') { t = 'INSERT'; e = { ...e, type: 'INSERT', attribs: [] }; }   // written as a reference to its *T block
  const layer = ren.layers[e.layer ?? '0'] ?? (e.layer ?? '0');
  const x = { t: DXF_TYPE[t] || (t.startsWith('DIMENSION') ? 'DIMENSION' : t), layer };
  if (e.color && e.color.rgb !== undefined) { if (version === 'AC1015') x.aci = aciFromRgb(e.color.rgb); else x.rgb = e.color.rgb; }
  else if (e.color && e.color.index !== undefined) x.aci = e.color.index;
  switch (t) {
    case 'LINE': x.start = P3(e.start); x.end = P3(e.end); break;
    case 'POINT': x.position = P3(e.position); break;
    case 'CIRCLE': x.center = P3(e.center); x.radius = e.radius; break;
    case 'ARC': x.center = P3(e.center); x.radius = e.radius; x.a0 = deg(e.startAngle); x.a1 = deg(e.endAngle); break;
    case 'ELLIPSE': x.center = P3(e.center); x.major = P3(e.majorAxis); x.ratio = e.ratio; break;
    case 'LWPOLYLINE': x.closed = !!e.closed; x.elevation = e.elevation || 0; x.pts = e.vertices.map((v) => [v.x, v.y, v.bulge || 0]); break;
    case 'POLYLINE_2D': x.mode = POLY_MODE[t]; x.closed = !!e.closed; x.pts = e.vertices.map((v) => [v.x, v.y]); x.elevation = e.elevation || 0; break;
    case 'POLYLINE_3D': x.mode = POLY_MODE[t]; x.closed = !!e.closed; x.pts = e.vertices.map((v) => [v.x, v.y, v.z || 0]); break;
    case 'POLYLINE_PFACE': x.mode = POLY_MODE[t]; x.pts = e.vertices.map(P3); x.faces = e.faces.map((f) => (f.indices || f).concat([0, 0, 0, 0]).slice(0, 4)); break;
    case 'POLYLINE_MESH': x.mode = POLY_MODE[t]; x.pts = e.vertices.map(P3); break;
    case 'TEXT': case 'ATTDEF':
      x.text = e.value; x.h = e.height; x.rot = deg(e.rotation || 0); x.halign = e.hAlign | 0;
      if (e.hAlign || e.vAlign) x.alignPt = P3(e.align || e.insert); else x.ins = P3(e.insert);
      if (t === 'ATTDEF') { x.tag = e.tag; x.prompt = e.prompt ?? ''; }
      break;
    case 'MTEXT': x.text = e.value; x.ins = P3(e.insert); x.h = e.height; x.width = e.width || 0; x.attach = e.attach || 1; break;
    case 'INSERT': x.block = ren.blocks[e.block] ?? e.block; x.ins = P3(e.insert); x.scale = [e.scale?.x ?? 1, e.scale?.y ?? 1, e.scale?.z ?? 1]; x.rot = deg(e.rotation || 0);
      x.attribs = (e.attribs || []).map((a) => ({ tag: a.tag, text: a.value })); break;
    case 'DIMENSION': x.block = ren.blocks[e.block] ?? e.block; x.defpoint = P3(e.defPoint); break;
    case 'SOLID': case 'TRACE': case '3DFACE': x.pts = e.points.map(P3); break;
    case 'HATCH': x.pattern = e.pattern; x.solid = e.solid ? 1 : 0; x.loops = e.loops.length;
      if (e.loops[0]?.polyline) x.loop0 = e.loops[0].polyline.vertices.map((v) => [v.x, v.y]); break;
    case 'SPLINE': x.degree = e.degree; if (e.control?.length) x.ctrl = e.control.map(P3); if (e.fit?.length) x.fit = e.fit.map(P3); break;
    case 'RAY': case 'XLINE': { const d = e.direction, n = Math.hypot(d.x, d.y, d.z || 0); x.start = P3(e.start); x.direction = [d.x / n, d.y / n, (d.z || 0) / n]; break; }
    case 'VIEWPORT': x.center = P3(e.center); x.width = e.width; x.height = e.height; break;
    default: break;
  }
  return x;
}
const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const closeArr = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => (Array.isArray(v) ? closeArr(v, b[i]) : close(v, b[i])));
const ang = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d) < 1e-7; };
/** Compare one expected entity with what a reader dumped. Returns '' or the first difference. */
export function diff(x, g) {
  if (!g) return 'missing';
  if (g.error) return 'reader error ' + g.error;
  if (g.t !== x.t) return `type ${g.t}`;
  if (g.layer !== x.layer) return `layer ${g.layer}`;
  if (x.aci !== undefined && x.aci !== 256 && g.color.index !== x.aci) return `colour ${JSON.stringify(g.color)} vs ACI ${x.aci}`;
  if (x.rgb !== undefined && ((g.color.rgb ?? -1) & 0xFFFFFF) !== x.rgb) return `true colour ${g.color.rgb} vs ${x.rgb}`;
  for (const k of ['start', 'end', 'position', 'center', 'major', 'defpoint', 'ins']) if (x[k] && !closeArr(x[k], g[k])) return `${k} ${JSON.stringify(g[k])} vs ${JSON.stringify(x[k])}`;
  for (const k of ['radius', 'ratio', 'h', 'width', 'height']) if (x[k] !== undefined && !close(x[k], g[k])) return `${k} ${g[k]} vs ${x[k]}`;
  for (const k of ['a0', 'a1', 'rot']) if (x[k] !== undefined && !ang(x[k], g[k])) return `${k} ${g[k]} vs ${x[k]}`;
  if (x.alignPt && !closeArr(x.alignPt, g.align || [])) return `alignment point ${JSON.stringify(g.align)} vs ${JSON.stringify(x.alignPt)}`;
  for (const k of ['text', 'tag', 'prompt', 'block', 'pattern', 'mode']) if (x[k] !== undefined && g[k] !== x[k]) return `${k} ${JSON.stringify(g[k])} vs ${JSON.stringify(x[k])}`;
  for (const k of ['closed', 'halign', 'attach', 'solid', 'degree']) if (x[k] !== undefined && (g[k] ?? 0) != x[k]) return `${k} ${g[k]} vs ${x[k]}`;
  if (x.elevation !== undefined && !close(x.elevation, g.elevation ?? 0)) return `elevation ${g.elevation} vs ${x.elevation}`;
  if (x.pts) {
    const gp = x.t === 'LWPOLYLINE' ? g.pts : g.pts;
    if (!gp || gp.length !== x.pts.length) return `${gp?.length} vertices vs ${x.pts.length}`;
    for (let i = 0; i < x.pts.length; i++) if (!closeArr(x.pts[i], gp[i].slice(0, x.pts[i].length))) return `vertex ${i} ${JSON.stringify(gp[i])} vs ${JSON.stringify(x.pts[i])}`;
  }
  if (x.faces && JSON.stringify(g.faces) !== JSON.stringify(x.faces)) return `faces ${JSON.stringify(g.faces)}`;
  if (x.loops !== undefined && g.loops?.length !== x.loops) return `${g.loops?.length} loops vs ${x.loops}`;
  if (x.loop0 && !closeArr(x.loop0, g.loops[0]?.pts)) return `hatch loop ${JSON.stringify(g.loops[0]?.pts)}`;
  if (x.ctrl && !closeArr(x.ctrl, g.ctrl)) return 'control points';
  if (x.fit && !closeArr(x.fit, g.fit)) return 'fit points';
  if (x.direction) { const n = Math.hypot(...(g.direction || [0])); if (!closeArr(x.direction, (g.direction || []).map((v) => v / n))) return `direction ${g.direction}`; }
  if (x.scale && !closeArr(x.scale, g.scale)) return `scale ${g.scale}`;
  if (x.attribs) {
    if (g.attribs.length !== x.attribs.length) return `${g.attribs.length} attributes vs ${x.attribs.length}`;
    for (let i = 0; i < x.attribs.length; i++) if (g.attribs[i].tag !== x.attribs[i].tag || g.attribs[i].text !== x.attribs[i].text) return `attribute ${i} ${JSON.stringify(g.attribs[i])}`;
  }
  return '';
}

/** Compare a whole dump with the model. Returns { diffs: [string], checked: n }. */
export function compareModel(model, report, d, { reader, version }) {
  const diffs = [];
  let checked = 0;
  const ren = report.renamed;
  // header
  const H = model.header || {};
  if (H.INSUNITS !== undefined && d.header.INSUNITS !== H.INSUNITS) diffs.push(`INSUNITS ${d.header.INSUNITS} vs ${H.INSUNITS}`);
  if (H.MEASUREMENT !== undefined && reader !== 'libdxfrw' && d.header.MEASUREMENT !== H.MEASUREMENT) diffs.push(`MEASUREMENT ${d.header.MEASUREMENT} vs ${H.MEASUREMENT}`);
  // layers
  for (const l of model.tables?.layers || []) {
    const name = ren.layers[l.name] ?? l.name;
    const g = d.layers.find((x) => x.name === name);
    checked++;
    if (!g) { diffs.push(`layer ${name} missing`); continue; }
    let c = l.color || { index: 7 };
    if (c.rgb !== undefined && version === 'AC1015') c = { index: aciFromRgb(c.rgb) };
    if (c.rgb !== undefined && reader === 'libdxfrw') c = null;   // its R2000 DXF has no true colour
    const okQuirk = c && c.rgb === undefined && reader === 'libredwg' && version !== 'AC1015' && LIBREDWG_LAYER_ACI[c.index] === Math.abs(g.color);
    if (c && !okQuirk && (c.rgb !== undefined ? ((g.rgb ?? -1) & 0xFFFFFF) !== c.rgb : Math.abs(g.color) !== Math.abs(c.index))) diffs.push(`layer ${name}: colour ${g.color}/${g.rgb}`);
    if (!!l.off !== g.off) diffs.push(`layer ${name}: off ${g.off}`);
    if (!!l.frozen !== g.frozen) diffs.push(`layer ${name}: frozen ${g.frozen}`);
    if (!!l.locked !== g.locked) diffs.push(`layer ${name}: locked ${g.locked}`);
    if ((l.plot === false ? 0 : 1) !== (g.plot ? 1 : 0) && reader !== 'libdxfrw') diffs.push(`layer ${name}: plot ${g.plot}`);
    if (l.lineweight !== undefined && g.lineweight !== l.lineweight) diffs.push(`layer ${name}: lineweight ${g.lineweight}`);
    if (l.linetype && g.linetype.toUpperCase() !== String(l.linetype).toUpperCase()) diffs.push(`layer ${name}: linetype ${g.linetype}`);
  }
  for (const s of model.tables?.styles || []) { checked++; if (!d.styles.some((x) => x.name.toUpperCase() === s.name.toUpperCase())) diffs.push(`text style ${s.name} missing`); }
  for (const s of model.tables?.dimstyles || []) { checked++; if (!d.dimstyles.some((x) => x.name.toUpperCase() === s.name.toUpperCase())) diffs.push(`dimension style ${s.name} missing`); }
  for (const s of model.tables?.linetypes || []) { checked++; if (!d.linetypes.some((x) => x.name.toUpperCase() === s.name.toUpperCase())) diffs.push(`linetype ${s.name} missing`); }
  // spaces and blocks
  const ms = (model.blocks || []).find((b) => /^\*model_space$/i.test(b.name));
  const ps = (model.blocks || []).find((b) => /^\*paper_space$/i.test(b.name));
  const lists = [['model space', ms?.entities || [], d.layouts.find((l) => /^model$/i.test(l.name))?.entities]];
  if (ps?.entities?.length) {
    const paperL = d.layouts.filter((l) => !/^model$/i.test(l.name)).sort((a, b) => a.taborder - b.taborder)[0];
    lists.push(['paper space', ps.entities, paperL?.entities]);
  }
  for (const b of model.blocks || []) {
    if (/^\*(model|paper)_space/i.test(b.name)) continue;
    const name = report.renamed.blocks[b.name] ?? b.name;
    const g = d.blocks[name];
    if (!g) { diffs.push(`block ${name} missing`); continue; }
    lists.push([`block ${name}`, b.entities, g.entities]);
  }
  for (const [where, src, got] of lists) {
    if (!got) { diffs.push(`${where}: not found`); continue; }
    const drop = (x) => reader === 'libdxfrw' && LIBDXFRW_DROPS.has(x.t);
    const exp = src.filter((e) => validEntity(e)).map((e) => expected(e, ren, version)).filter((x) => !drop(x));
    if (reader === 'libdxfrw') for (const x of exp) { if (x.t === 'DIMENSION') delete x.block; delete x.faces; delete x.rgb; }
    const gotF = got.filter((g) => !drop(g));
    if (gotF.length !== exp.length) diffs.push(`${where}: ${gotF.length} entities, expected ${exp.length} (${tally(gotF)} vs ${tally(exp)})`);
    const n = Math.min(gotF.length, exp.length);
    for (let i = 0; i < n; i++) {
      checked++;
      const m = diff(exp[i], gotF[i]);
      if (m) diffs.push(`${where} #${i} ${exp[i].t}: ${m}`);
    }
  }
  return { diffs, checked };
}
const tally = (list) => { const t = {}; for (const e of list) t[e.t] = (t[e.t] || 0) + 1; return Object.entries(t).map(([k, v]) => `${k}×${v}`).join(' '); };
/** The writer leaves out entities without geometry (the CivilCraft adapter passes those as empty LINEs). */
const validEntity = (e) => !(String(e.type).toUpperCase() === 'LINE' && !e.start);

// ---------------------------------------------------------------- run
async function main() {
  const { availableReaders } = await import(pathToFileURL(path.join(TOOLS, 'dwg-readers.mjs')).href);
  const all = availableReaders(TOOLS);
  const key = (r) => (/LibreDWG/.test(r.name) ? 'libredwg' : /libdxfrw/.test(r.name) ? 'libdxfrw' : 'oda');
  const readers = all.filter((r) => readerNames.includes(key(r)));
  const results = [];
  let bad = 0;
  for (const cn of caseNames) {
    const make = CASES[cn];
    if (!make) { console.log('unknown case', cn); continue; }
    const files = [];
    for (const v of versions) {
      const model = make();
      const t0 = Date.now();
      const { bytes, report } = writeDwg(model, { version: v, created: new Date(Date.UTC(2026, 9, 11, 12)) });
      const f = path.join(OUT, `${cn}-${v}.dwg`);
      fs.writeFileSync(f, bytes);
      files.push({ f, v, model, report, ms: Date.now() - t0, size: bytes.length });
    }
    for (const rd of readers) {
      const res = rd.run(files.map((x) => x.f), OUT);
      for (const x of files) {
        const r = res.get(x.f);
        const k = key(rd);
        const problems = r.problems.filter((p) => !(ALLOWED[k] || []).some(([re]) => re.test(p)));
        let cmp = { diffs: [], checked: 0 }, audit = null;
        if (fs.existsSync(r.dxf)) {
          try {
            const d = JSON.parse(execFileSync(PY, [path.join(ROOT, 'tools/dwg-test/writer-dump.py'), r.dxf, ...(r.encoding ? [r.encoding] : [])], { encoding: 'utf8', maxBuffer: 1 << 30 }));
            audit = d.audit;
            cmp = compareModel(x.model, x.report, d, { reader: k, version: x.v });
          } catch (e) { cmp.diffs.push('could not read the DXF: ' + String(e.message).slice(0, 200)); }
        } else if (!problems.length) problems.push('no DXF written');
        const ok = !problems.length && !cmp.diffs.length;
        if (!ok) bad++;
        results.push({ case: cn, version: x.v, reader: k, ok, problems, allowed: r.problems.length - problems.length, diffs: cmp.diffs, checked: cmp.checked, audit, writeMs: x.ms, size: x.size });
        if (!QUIET || !ok) console.log(`${ok ? 'ok  ' : 'FAIL'} ${cn.padEnd(11)} ${x.v} ${k.padEnd(9)} ${String(cmp.checked).padStart(6)} checked` +
          (r.problems.length - problems.length ? `, ${r.problems.length - problems.length} allowed reader message(s)` : '') +
          (problems.length ? ' | ' + problems.slice(0, 3).join(' | ') : '') + (cmp.diffs.length ? ' | ' + cmp.diffs.length + ' diff(s): ' + cmp.diffs.slice(0, 4).join(' ; ') : ''));
      }
    }
  }
  const out = arg('--json', null);
  if (out) fs.writeFileSync(out, JSON.stringify({ when: new Date().toISOString(), allowed: Object.fromEntries(Object.entries(ALLOWED).map(([k, v]) => [k, v.map(([re, why]) => ({ message: re.source, why }))])), results }, null, 1));
  console.log(`\n${results.length - bad} of ${results.length} (case × version × reader) clean; files in ${OUT}`);
  process.exit(bad ? 1 : 0);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) main();
