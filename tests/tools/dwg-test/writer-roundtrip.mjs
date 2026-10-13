/* SPDX-License-Identifier: Apache-2.0 */
/**
 * writer-roundtrip.mjs — builder W's round trips: read real drawings with our reader (lib/dwg/read.js, builder R),
 * write each in every version with our writer, and check what comes out:
 *   ours      readDwg(written) sees the same tables and entities as the source model
 *   libredwg  dwgread (no errors/warnings beyond ALLOWED) + dwg2dxf → ezdxf → same entities as the source model
 *   libdxfrw  dwg2dxf → ezdxf (minus what its DXF writer drops for AutoCAD's own files too)
 *   oda       ODA File Converter, audit on (any .err fails) → ezdxf → same entities
 * Compared by space/block, order, type, layer, colour and geometry (1e-9 relative), text exact; only entities the
 * writer wrote are expected (report.handles), and what it skipped is counted from report.skipped.
 *
 *   node tools/dwg-test/writer-roundtrip.mjs [--sources a.dwg,dir,…] [--versions AC1015,…] [--readers ours,libredwg,libdxfrw,oda]
 *        [--keep dir] [--json out.json] [--quiet] [--max-ents n] [--no-baseline]
 * Baseline (default on): each oracle also reads the ORIGINAL file (writer-baseline.mjs); a round-trip difference that the
 * oracle shows on the original too (its DXF writer's caret escapes, long attribute strings, …) is counted as allowed.
 * Default sources: testfiles/dwg-samples and testfiles/dwg-corpus/AC1032 (each corpus drawing once; the corpus holds the
 * same drawings in all six versions — --sources testfiles/dwg-corpus/AC1015,… for the rest).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readDwg } from '../../lib/dwg/read.js';
import { writeDwg, VERSIONS } from '../../lib/dwg/write.js';
import { expected, diff, ALLOWED } from './writer-check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOLS = path.join(ROOT, 'tools/civilcraft-test');
const PY = path.join(TOOLS, 'venv/bin/python');
const TF = '/var/www/CADCRAFT/testfiles';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const versions = arg('--versions', Object.keys(VERSIONS).join(',')).split(',');
const readerNames = arg('--readers', 'ours,libredwg,libdxfrw,oda').split(',');
const OUT = path.resolve(arg('--keep', fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'dwgw-rt-'))));
const QUIET = process.argv.includes('--quiet');
fs.mkdirSync(OUT, { recursive: true });
const sourceList = () => {
  const spec = arg('--sources', `${TF}/dwg-samples,${TF}/dwg-corpus/AC1032`).split(',');
  const out = [];
  for (const s of spec) {
    if (fs.existsSync(s) && fs.statSync(s).isDirectory()) for (const f of fs.readdirSync(s).sort()) { if (f.toLowerCase().endsWith('.dwg')) out.push(path.join(s, f)); }
    else if (fs.existsSync(s)) out.push(s);
  }
  return out;
};

const LIBREDWG_LAYER_ACI = { 79: 178, 104: 176, 129: 174, 189: 172, 255: 5 };
// Entity types an oracle's DXF never carries — for AutoCAD's own files too (example_2018.dwg read directly):
// libdxfrw's dwg2dxf writes no RAY/XLINE/3DFACE/TRACE/ATTDEF/VIEWPORT/WIPEOUT/TOLERANCE/MLINE/ARC_DIMENSION; LibreDWG 0.14's
// dwg2dxf writes the ARC_DIMENSION class but no ARC_DIMENSION entity.
const LIBDXFRW_DROPS = new Set(['RAY', 'XLINE', '3DFACE', 'TRACE', 'ATTDEF', 'VIEWPORT', 'WIPEOUT', 'TOLERANCE', 'MLINE', 'ARC_DIMENSION']);
const LIBREDWG_DROPS = new Set(['ARC_DIMENSION']);
const DROPS = { libdxfrw: LIBDXFRW_DROPS, libredwg: LIBREDWG_DROPS };
const hex = (h) => (h === undefined || h === null ? null : String(h).toUpperCase().replace(/^0+(?=.)/, ''));

// ---------------------------------------------------------------- our reader's model → the dump shape of writer-dump.py
const deg = (a) => { let d = ((a || 0) * 180 / Math.PI) % 360; if (d < 0) d += 360; return d; };
const P = (p) => [p?.x || 0, p?.y || 0, p?.z || 0];
const MODE = { POLYLINE_2D: 'AcDb2dPolyline', POLYLINE_3D: 'AcDb3dPolyline', POLYLINE_PFACE: 'AcDbPolyFaceMesh', POLYLINE_MESH: 'AcDbPolygonMesh' };
export function dumpEntity(e) {
  const t = e.type;
  const d = { t: MODE[t] ? 'POLYLINE' : t.startsWith('DIMENSION') ? 'DIMENSION' : t, layer: e.layer, color: { index: e.color?.rgb !== undefined ? (e.color.index ?? 256) : (e.color?.index ?? 256) } };
  if (e.color?.rgb !== undefined) d.color.rgb = e.color.rgb;
  switch (t) {
    case 'LINE': d.start = P(e.start); d.end = P(e.end); break;
    case 'POINT': d.position = P(e.position); break;
    case 'CIRCLE': d.center = P(e.center); d.radius = e.radius; break;
    case 'ARC': d.center = P(e.center); d.radius = e.radius; d.a0 = deg(e.startAngle); d.a1 = deg(e.endAngle); break;
    case 'ELLIPSE': d.center = P(e.center); d.major = P(e.majorAxis); d.ratio = e.ratio; break;
    case 'LWPOLYLINE': d.closed = !!e.closed; d.elevation = e.elevation || 0; d.pts = e.vertices.map((v) => [v.x, v.y, v.bulge || 0]); break;
    case 'POLYLINE_2D': d.mode = MODE[t]; d.closed = !!e.closed; d.elevation = e.elevation || 0; d.pts = e.vertices.map((v) => [v.x, v.y, v.z || 0]); break;
    case 'POLYLINE_3D': case 'POLYLINE_MESH': d.mode = MODE[t]; d.closed = !!e.closed; d.pts = e.vertices.map(P); break;
    case 'POLYLINE_PFACE': d.mode = MODE[t]; d.pts = e.vertices.map(P); d.faces = (e.faces || []).map((f) => (f.indices || f).concat([0, 0, 0, 0]).slice(0, 4)); break;
    case 'TEXT': case 'ATTDEF': case 'ATTRIB':
      d.text = e.value; d.ins = P(e.insert); d.align = e.align ? P(e.align) : null; d.h = e.height; d.rot = deg(e.rotation); d.halign = e.hAlign | 0;
      if (t !== 'TEXT') { d.tag = e.tag; d.prompt = e.prompt ?? ''; }
      break;
    case 'MTEXT': d.text = e.value; d.ins = P(e.insert); d.h = e.height; d.width = e.width || 0; d.attach = e.attach || 1; break;
    case 'INSERT': case 'MINSERT': d.block = e.block; d.ins = P(e.insert); d.scale = [e.scale?.x ?? 1, e.scale?.y ?? 1, e.scale?.z ?? 1]; d.rot = deg(e.rotation);
      d.attribs = (e.attribs || []).map((a) => ({ tag: a.tag, text: a.value })); break;
    case 'SOLID': case 'TRACE': case '3DFACE': d.pts = (e.points || []).map(P); break;
    case 'HATCH': d.pattern = e.pattern; d.solid = e.solid ? 1 : 0; d.loops = (e.loops || []).map((l) => (l.polyline ? { kind: 'poly', pts: l.polyline.vertices.map((v) => [v.x, v.y]) } : { kind: 'edges' })); break;
    case 'SPLINE': d.degree = e.degree; d.ctrl = (e.control || []).map(P); d.fit = (e.fit || []).map(P); break;
    case 'RAY': case 'XLINE': d.start = P(e.start); d.direction = P(e.direction); break;
    case 'VIEWPORT': d.center = P(e.center); d.width = e.width; d.height = e.height; break;
    default: if (t.startsWith('DIMENSION')) { d.block = e.block; d.defpoint = P(e.defPoint); }
  }
  return d;
}
export function dumpFromModel(m) {
  const recBlock = new Map(m.blocks.map((b) => [hex(b.record), b]));
  return {
    header: { INSUNITS: m.header?.INSUNITS, MEASUREMENT: m.header?.MEASUREMENT },
    layers: (m.tables?.layers || []).map((l) => ({ name: l.name, color: l.color?.index ?? 7, rgb: l.color?.rgb ?? null, off: !!l.off, frozen: !!l.frozen, locked: !!l.locked, plot: l.plot === false ? 0 : 1, lineweight: l.lineweight, linetype: l.linetypeName || l.linetype || 'Continuous' })),
    styles: (m.tables?.styles || []).map((s) => ({ name: s.name })), dimstyles: (m.tables?.dimstyles || []).map((s) => ({ name: s.name })),
    linetypes: (m.tables?.linetypes || []).map((s) => ({ name: s.name })),
    blocks: Object.fromEntries(m.blocks.filter((b) => !/^\*(model|paper)_space/i.test(b.name)).map((b) => [b.name, { entities: b.entities.map(dumpEntity) }])),
    layouts: (m.layouts || []).map((l) => ({ name: l.name, taborder: l.tabOrder, entities: (recBlock.get(hex(l.block))?.entities || []).map(dumpEntity) })),
  };
}

// ---------------------------------------------------------------- compare a dump with the source model
export function compareRT(src, report, d, { reader, version, maxEnts = Infinity }) {
  const diffs = [];
  let checked = 0;
  const ren = { layers: report.renamed.layers, blocks: report.renamed.blocks };
  const written = (e) => e.handle !== undefined && report.handles[hex(e.handle)] !== undefined;
  // layers
  for (const l of src.tables?.layers || []) {
    const name = ren.layers[l.name] ?? l.name;
    const g = d.layers.find((x) => x.name === name);
    checked++;
    if (!g) { diffs.push(`layer ${name} missing`); continue; }
    let c = l.color || { index: 7 };
    if (c.rgb !== undefined && (version === 'AC1015' || reader === 'libdxfrw')) c = null;   // R2000 / libdxfrw's R2000 DXF: no true colour
    const quirk = c && c.rgb === undefined && reader === 'libredwg' && version !== 'AC1015' && LIBREDWG_LAYER_ACI[Math.abs(c.index)] === Math.abs(g.color);
    if (c && !quirk && (c.rgb !== undefined ? ((g.rgb ?? -1) & 0xFFFFFF) !== (c.rgb & 0xFFFFFF) : Math.abs(g.color) !== Math.abs(c.index))) diffs.push(`layer ${name}: colour ${g.color}/${g.rgb} vs ${JSON.stringify(l.color)}`);
    if (!!l.off !== !!g.off) diffs.push(`layer ${name}: off ${g.off}`);
    if (!!l.frozen !== !!g.frozen) diffs.push(`layer ${name}: frozen ${g.frozen}`);
    if (!!l.locked !== !!g.locked) diffs.push(`layer ${name}: locked ${g.locked}`);
  }
  // spaces (by layout) and blocks
  const recBlock = new Map(src.blocks.map((b) => [hex(b.record), b]));
  const lists = [];
  for (const L of src.layouts || []) {
    const b = recBlock.get(hex(L.block));
    if (!b) continue;
    const name = /^model$/i.test(L.name) ? 'Model' : (report.renamed.layouts?.[L.name] ?? L.name);
    lists.push([`layout ${name}`, b.entities, d.layouts.find((x) => x.name === name)?.entities]);
  }
  for (const b of src.blocks) {
    if (/^\*(model|paper)_space/i.test(b.name)) continue;
    const name = ren.blocks[b.name] ?? b.name;
    if (!b.entities.some(written)) continue;
    lists.push([`block ${name}`, b.entities, d.blocks[name]?.entities]);
  }
  for (const [where, srcEnts, got] of lists) {
    const drops = DROPS[reader] || new Set();
    const exp = srcEnts.filter(written).map((e) => expected(e, ren, version)).filter((x) => !drops.has(x.t));
    if (!exp.length && !got?.length) continue;
    if (!got) { diffs.push(`${where}: not found`); continue; }
    if (reader === 'libdxfrw') for (const x of exp) { if (x.t === 'DIMENSION') delete x.block; delete x.faces; delete x.rgb; }
    if (version === 'AC1015') for (const x of exp) if (x.rgb !== undefined) delete x.rgb;   // written as the nearest index
    // LibreDWG's dwg2dxf writes every SOLID/TRACE corner at z = 0 — for the original AutoCAD files too (a client drawing:
    // two SOLIDs at z −196.588 in our reader and in the ODA converter's DXF, 0 in LibreDWG's)
    if (reader === 'libredwg') for (const x of exp) if ((x.t === 'SOLID' || x.t === 'TRACE') && x.pts) x.pts = x.pts.map((p) => [p[0], p[1]]);
    let gotF = got.filter((g) => !drops.has(g.t));
    // libdxfrw writes no paper layouts; from an R2000 file it appends their entities to model space instead (ODA's own
    // R2000 copy of a client drawing too: 2,095 extra there). Model space itself must still match entity for entity.
    if (reader === 'libdxfrw' && where === 'layout Model' && gotF.length > exp.length && (src.layouts || []).length > 2) gotF = gotF.slice(0, exp.length);
    if (gotF.length !== exp.length) diffs.push(`${where}: ${gotF.length} entities, expected ${exp.length}`);
    const n = Math.min(gotF.length, exp.length, maxEnts);
    for (let i = 0; i < n; i++) {
      checked++;
      const m = diff(exp[i], gotF[i]);
      if (m) diffs.push(`${where} #${i} ${exp[i].t}: ${m}`);
    }
  }
  return { diffs, checked };
}

// ---------------------------------------------------------------- run
async function main() {
  const { availableReaders } = await import(pathToFileURL(path.join(TOOLS, 'dwg-readers.mjs')).href);
  const key = (r) => (/LibreDWG/.test(r.name) ? 'libredwg' : /libdxfrw/.test(r.name) ? 'libdxfrw' : 'oda');
  const oracles = availableReaders(TOOLS).filter((r) => readerNames.includes(key(r)));
  const results = [];
  let bad = 0;
  const say = (r) => {
    const ok = !r.problems.length && !r.diffs.length;
    if (!ok) bad++;
    results.push({ ...r, ok });
    if (!QUIET || !ok) console.log(`${ok ? 'ok  ' : 'FAIL'} ${r.source.padEnd(48).slice(0, 48)} ${r.version} ${r.reader.padEnd(8)} ${String(r.checked).padStart(6)} checked` +
      (r.allowed ? `, ${r.allowed} allowed` : '') + (r.problems.length ? ' | ' + r.problems.slice(0, 2).join(' | ') : '') +
      (r.diffs.length ? ` | ${r.diffs.length} diff(s): ` + r.diffs.slice(0, 3).join(' ; ') : ''));
  };
  const sources = sourceList();
  const useBase = !process.argv.includes('--no-baseline') && oracles.length;
  const { baseline, diffKey } = await import('./writer-baseline.mjs');
  const baseCache = new Map();
  const baseFor = async (file) => {
    if (!baseCache.has(file)) {
      let b = {};
      try { b = await baseline(file, readerNames.filter((r) => r !== 'ours'), OUT); } catch (e) { console.log('baseline failed', file, e.message); }
      baseCache.set(file, b);
    }
    return baseCache.get(file);
  };
  for (const v of versions) {
    const batch = [];
    for (const s of sources) {
      const name = path.basename(path.dirname(s)).replace(/^dwg-/, '') + '-' + path.basename(s, '.dwg');
      let src;
      try { src = readDwg(new Uint8Array(fs.readFileSync(s))); } catch (e) { console.log('read failed', s, e.message); continue; }
      if (src.report?.error) { console.log('read failed', s, src.report.error); continue; }
      const t0 = Date.now();
      let out;
      try { out = writeDwg(src, { version: v }); } catch (e) { say({ source: name, version: v, reader: 'write', problems: ['write threw: ' + e.stack.split('\n').slice(0, 3).join(' / ')], diffs: [], checked: 0 }); continue; }
      const f = path.join(OUT, `${name}-${v}.dwg`);
      fs.writeFileSync(f, out.bytes);
      const item = { name, src, report: out.report, f, writeMs: Date.now() - t0, size: out.bytes.length, file: s };
      batch.push(item);
      if (readerNames.includes('ours')) {
        const back = readDwg(new Uint8Array(out.bytes));
        const cmp = back.report?.error ? { diffs: ['our reader: ' + back.report.error], checked: 0 } : compareRT(src, out.report, dumpFromModel(back), { reader: 'ours', version: v });
        say({ source: name, version: v, reader: 'ours', problems: back.report?.notes?.filter((n) => /could not|damaged|error/i.test(n)).slice(0, 3) || [], diffs: cmp.diffs, checked: cmp.checked, skipped: out.report.skipped, writeMs: item.writeMs });
      }
    }
    for (const rd of oracles) {
      const k = key(rd);
      const res = rd.run(batch.map((b) => b.f), OUT);
      for (const b of batch) {
        const r = res.get(b.f);
        const pkey = (p) => p.replace(/\d+/g, '#');
        const baseProblems = useBase ? new Set(((await baseFor(b.file))[k]?.problems || []).map(pkey)) : new Set();
        const problems = r.problems.filter((p) => !(ALLOWED[k] || []).some(([re]) => re.test(p)) && !baseProblems.has(pkey(p)));
        let cmp = { diffs: [], checked: 0 };
        if (fs.existsSync(r.dxf)) {
          try {
            const d = JSON.parse(execFileSync(PY, [path.join(ROOT, 'tools/dwg-test/writer-dump.py'), r.dxf, ...(r.encoding ? [r.encoding] : [])], { encoding: 'utf8', maxBuffer: 1 << 30 }));
            cmp = compareRT(b.src, b.report, d, { reader: k, version: v });
            if (useBase) {
              const base = (await baseFor(b.file))[k]?.diffs;
              if (base) { const n = cmp.diffs.length; cmp.diffs = cmp.diffs.filter((m) => !base.has(diffKey(m))); cmp.baseAllowed = n - cmp.diffs.length; }
            }
          } catch (e) { cmp.diffs.push('could not read the DXF: ' + String(e.message).slice(0, 160)); }
        } else if (!problems.length) problems.push('no DXF written');
        say({ source: b.name, version: v, reader: k, problems, allowed: r.problems.length - problems.length + (cmp.baseAllowed || 0), diffs: cmp.diffs, checked: cmp.checked });
      }
    }
  }
  const out = arg('--json', null);
  if (out) fs.writeFileSync(out, JSON.stringify({ when: new Date().toISOString(), results: results.map((r) => ({ ...r, diffs: r.diffs.slice(0, 50) })) }, null, 1));
  console.log(`\n${results.length - bad} of ${results.length} (source × version × reader) clean; files in ${OUT}`);
  process.exit(bad ? 1 : 0);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) main();
