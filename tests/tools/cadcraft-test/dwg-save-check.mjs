/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dwg-save-check.mjs — CadCraft "Save as DWG" read back by other programs, for bin/test-cadcraft.mjs (and on its own:
 * `node tools/cadcraft-test/dwg-save-check.mjs [--dwg <dir>] [--keep] [--verbose]`).
 *
 * Saves a drawing that uses every feature dwg-save.js writes (fixture below) in every version Save as offers (AutoCAD
 * 2000 … 2018), and every DWG in /var/www/CADCRAFT/testfiles/dwg-samples (imported with dwg-import.js) in the version
 * it came in (as the app does), then reads each file with the three
 * independent readers of tools/civilcraft-test/setup-dwg-readers.sh — LibreDWG 0.14, libdxfrw (LibreCAD) and the ODA
 * File Converter (audit on) — and checks each reader's DXF with ezdxf (dwg_check.py): no reader problems, no audit
 * errors, model-space objects by type as handed to the writer, layers with their states, blocks, block references with
 * their attribute values, text alignment, ellipses, arcs in polylines, units, real DIMENSIONs, patterned hatches, sheets
 * with their viewports, the length format. Finally each fixture DWG is opened again by CadCraft itself (cc-dwg's readDwg
 * from the app's dwg/, as in the app) and compared with the original drawing.
 *
 *   runDwgSaveChecks({ ok, root, app (build folder), samples (DWG folder), verbose, keep }) → { skipped: string | null }
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function runDwgSaveChecks({ ok, root = path.resolve(HERE, '../..'), app = null, verbose = false, keep = false, samples = '/var/www/CADCRAFT/testfiles/dwg-samples' }) {
  const APP = app || path.join(root, 'public_html/assets/apps/cadcraft/dev');
  const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
  const TOOLS = path.join(root, 'tools/civilcraft-test');
  const PY = path.join(TOOLS, 'venv/bin/python');
  if (!fs.existsSync(path.join(TOOLS, 'dwg-readers.mjs')) || !fs.existsSync(PY)) return { skipped: 'the DWG readers are not set up (tools/civilcraft-test/setup-dwg-readers.sh)' };
  const { availableReaders } = await import(pathToFileURL(path.join(TOOLS, 'dwg-readers.mjs')).href);
  const readers = availableReaders(TOOLS);
  if (!readers.length) return { skipped: 'no DWG reader installed (tools/civilcraft-test/setup-dwg-readers.sh)' };

  const { Doc } = await load('doc.js');
  const { saveDwg, DWG_VERSIONS, dwgVersionKey } = await load('dwg-save.js');
  const { importDwg } = await load('dwg-import.js');
  const { attdef } = await load('attrs.js');
  const { readDwg } = await load('dwg/read.js');   // the app's reader (cc-dwg)
  const openDoc = async (bytes) => { const d = new Doc(); d.load(importDwg(readDwg(bytes), { versionTag: new TextDecoder().decode(bytes.subarray(0, 6)) })); return d; };

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-dwgsave-'));
  const jobs = [];   // { name, file, doc, report, expect }

  // ---- the fixture: every feature, small enough to check exactly — in every version
  const fx = fixture(Doc, attdef);
  for (const { key } of DWG_VERSIONS.slice().reverse()) {
    const { bytes, report } = saveDwg(fx, { version: key });
    const file = path.join(tmp, 'fixture-' + key + '.dwg');
    fs.writeFileSync(file, bytes);
    jobs.push({ name: 'fixture ' + key, fixture: true, version: key, file, doc: fx, report, bytes });
  }
  // ---- the samples, as CadCraft opens them
  const files = !fs.existsSync(samples) ? [] : fs.statSync(samples).isDirectory() ? fs.readdirSync(samples).filter((f) => /\.dwg$/i.test(f)).sort() : [path.basename(samples)];
  if (fs.existsSync(samples) && !fs.statSync(samples).isDirectory()) samples = path.dirname(samples);
  for (const f of files) {
    try {
      const doc = await openDoc(new Uint8Array(fs.readFileSync(path.join(samples, f))));
      const t0 = performance.now();
      const { bytes, report } = saveDwg(doc, { version: dwgVersionKey(doc.meta.version) || '2000' });
      const ms = performance.now() - t0;
      const file = path.join(tmp, 'sample-' + f.replace(/[^\w.-]+/g, '_'));
      fs.writeFileSync(file, bytes);
      jobs.push({ name: f, file, doc, report, ms, bytes });
    } catch (err) { ok(false, f + ': saved as DWG', err.stack); }
  }

  // ---- what each file must hold (from the writer's own counts: every object it wrote, by kind)
  const KIND = { line: 'LINE', arc: 'ARC', circle: 'CIRCLE', lwpolyline: 'LWPOLYLINE', ellipse: 'ELLIPSE', point: 'POINT', text: 'TEXT', mtext: 'MTEXT', solid: 'SOLID', insert: 'INSERT', polyline3d: 'POLYLINE', hatch: 'HATCH', '3dface': '3DFACE' };

  // ---- read every file with every reader
  for (const reader of readers) {
    const dir = path.join(tmp, 'read-' + reader.name.replace(/\W+/g, '-'));
    fs.mkdirSync(dir, { recursive: true });
    const res = reader.run(jobs.map((j) => j.file), dir);
    for (const j of jobs) {
      const got = res.get(j.file);
      const label = j.name + ' — ' + reader.name.split(' ')[0];
      if (!got) { ok(false, label + ': read', 'not run'); continue; }
      // LibreDWG 0.14 prints this for every HATCH, AutoCAD's own included (it reads the common handles first, then looks
      // for them again after the hatch data); it loses nothing.
      // It also reports "Invalid ATTRIB.keep_duplicate_records" for every attribute in an AutoCAD 2010+ file — AutoCAD's own
      // example_2010.dwg gives the same two lines — and reads the attribute all the same.
      // "Unstable Class object … MLEADERSTYLE" is LibreDWG's note about its own support for that object type (it prints
      // the same for TABLESTYLE and MATERIAL in AutoCAD's own sample files), not a problem in the file.
      const problems = got.problems.filter((m) => !/Skip HATCH common handles due to short handle stream|Invalid ATTRIB\.keep_duplicate_records|Unstable Class object \d+ MLEADERSTYLE/.test(m));
      ok(!problems.length, label + ': read without problems', problems.slice(0, 3).join(' | '));
      const p = spawnSync(PY, [path.join(HERE, 'dwg_check.py'), got.dxf, ...(got.encoding ? [got.encoding] : [])], { encoding: 'utf8', maxBuffer: 1 << 28 });
      let s; try { s = JSON.parse(p.stdout); } catch { s = { error: (p.stderr || p.stdout || '').slice(-300) }; }
      if (s.error) { ok(false, label + ': its DXF opens in ezdxf', s.error); continue; }
      j.read = j.read || {}; j.read[reader.name] = s;
      ok(s.audit_errors === 0, label + ': ezdxf audit finds no errors', String(s.audit_errors));
      // model space: every object the writer wrote at top level, as the same kind
      const want = {};
      const top = j.report.top || {};
      for (const [k, n] of Object.entries(top)) want[KIND[k] || k] = n;
      // libdxfrw reads 3DFACE, but its dwg2dxf tool never writes one out (dx_iface::writeEntity has no case for it)
      if (reader.name.startsWith('libdxfrw')) delete want['3DFACE'];
      // libdxfrw's dwg2dxf writes a dimension as what its block draws (lines, text), never as a DIMENSION: the same for
      // AutoCAD's own files (example_2000.dwg: 9 DIMENSIONs in, none out); the dimension checks below use the other two
      if (reader.name.startsWith('libdxfrw')) delete want.DIMENSION;
      // ... and no MULTILEADER either (AutoCAD's example_2000.dwg: 1 in, none out)
      if (reader.name.startsWith('libdxfrw')) delete want.MULTILEADER;
      // ... nor XLINE / RAY (AutoCAD's example_2018.dwg: one of each in, none out; ODA keeps both) — 0.5 DR.7
      if (reader.name.startsWith('libdxfrw')) { delete want.XLINE; delete want.RAY; }
      const have = s.model;
      const diff = Object.keys({ ...want, ...have }).filter((k) => (want[k] || 0) !== (have[k] || 0));
      ok(!diff.length, label + ': model space as written (' + Object.values(want).reduce((a, b) => a + b, 0) + ' objects)', diff.map((k) => k + ' want ' + (want[k] || 0) + ' got ' + (have[k] || 0)).join(', '));
      if (verbose) console.log('       ', JSON.stringify(have));
    }
  }

  // ---- the fixture in detail (every version, every reader)
  for (const fj of jobs.filter((j) => j.fixture)) {
    for (const [rn, s] of Object.entries(fj.read || {})) {
      const r = fj.name + ' — ' + rn.split(' ')[0], dxfrw = rn.startsWith('libdxfrw');
      const L = s.layers;
      ok(L.Walls?.color === 1 && L.Off?.off === true && L.Frozen?.frozen === true && L.Locked?.locked === true && L.NoPlot?.plot === false && L.Walls.plot === true && !L.Walls.off,
        r + ': layer colour and on / frozen / locked / plot states', JSON.stringify(L));
      if (fj.version === '2000') ok(L.Orange?.color === 30, r + ': a true-colour layer becomes the nearest standard colour (30)', JSON.stringify(L.Orange));
      // libdxfrw reads true colours but its dwg2dxf writes only the index
      // (LibreDWG's DXF keeps the colour method byte 0xC2 in group 420: compare the colour only)
      else if (!dxfrw) ok((L.Orange?.rgb & 0xffffff) === 0xff7f00, r + ': a true-colour layer keeps its colour (AutoCAD 2004 and later)', JSON.stringify(L.Orange));
      const tb = s.blocks['Table 30x72'];
      // libdxfrw reads ATTDEFs, but its dwg2dxf tool never writes them out (DRW_Interface::addAttDef is empty — the same
      // for drawings AutoCAD saved), so attribute definitions are checked with the other two readers and on reopening.
      const defsSeen = dxfrw || tb?.attdefs.join() === 'ITEM,MAKER';
      ok(tb && tb.entities.LWPOLYLINE === 1 && tb.entities.CIRCLE === 2 && defsSeen && tb.base[0] === 10 && tb.base[1] === 5,
        r + ': block "Table 30x72" with its geometry, base point' + (dxfrw ? '' : ' and attribute definitions'), JSON.stringify(tb));
      const tables = s.inserts.filter((i) => i.block === 'Table 30x72');
      ok(tables.length === 2 && tables.some((i) => i.attribs.ITEM === '12' && i.attribs.MAKER === 'Acme Ø ±' && i.sx === 2 && i.sy === 2 && Math.abs(i.rot - 90) < 1e-6) && tables.some((i) => i.attribs.ITEM === '13'),
        r + ': two references with scale, rotation and their own attribute values', JSON.stringify(tables));
      ok(s.blocks.Outer && s.blocks.Outer.entities.INSERT === 1, r + ': a block inside a block', JSON.stringify(s.blocks.Outer));
      if (!dxfrw) ok(s.blocks.Site?.xref === 'X-Refs\\Site.dwg' && s.inserts.some((i) => i.block === 'Site'), r + ': a linked drawing (xref) with its path, and its reference', JSON.stringify(s.blocks.Site));
      if (!dxfrw) {
        const d = s.dims[0];
        ok(s.dims.length === 1 && d.type === 0 && s.blocks[d.block]?.entities.LINE >= 3 && String(d.p13) === '0,700' && String(d.p14) === '100,700',
          r + ': the dimension is a real DIMENSION (linear, its points) with the block that draws it', JSON.stringify(s.dims) + ' ' + JSON.stringify(d && s.blocks[d.block]));
      }
      ok(s.texts.some((t) => t.s === 'Left baseline' && t.h === 0 && t.v === 0) && s.texts.some((t) => t.s === 'Centred middle' && t.h === 1 && t.v === 2 && Math.abs(t.wf - 0.8) < 1e-9) && s.texts.some((t) => t.s === 'Right top' && t.h === 2 && t.v === 3),
        r + ': text alignment and width factor', JSON.stringify(s.texts));
      ok(s.mtexts.length === 2 && s.mtexts.some((t) => /First line\\PSecond line/.test(t.s) && t.attach === 1) && s.mtexts.some((t) => t.width === 40 && t.attach === 5),
        r + ': multi-line and wrapped text as MTEXT', JSON.stringify(s.mtexts));
      ok(s.ellipses.length === 2 && s.ellipses.every((e) => e.ratio > 0 && e.ratio <= 1), r + ': ellipses (one turned to keep its ratio ≤ 1)', JSON.stringify(s.ellipses));
      ok(s.bulged_polylines === 1, r + ': a polyline keeps its arc', String(s.bulged_polylines));
      ok(s.colors['3'] >= 1 && s.colors['0'] === undefined, r + ': entity colours', JSON.stringify(s.colors));
      const pat = s.hatches.find((h) => !h.solid);
      ok(s.model.SOLID >= 1 && s.hatches.filter((h) => h.solid).length === 1 && pat && pat.pattern === 'ANSI31' && pat.lines === 1 && Math.abs(pat.scale - 2) < 1e-9,
        r + ': a solid fill with a hole as HATCH, a three-cornered one as SOLID, a patterned one as HATCH ANSI31 with its line', JSON.stringify(s.hatches));
      if (!dxfrw) ok(s.model.MULTILEADER === 1, r + ': the multileader is a MULTILEADER', JSON.stringify(s.model));
      ok(L.Hidden?.linetype?.toUpperCase() === 'HIDDEN' && s.ltypes.includes('HIDDEN') && s.ltypes.includes('DASHED') && (s.entity_ltypes.DASHED || 0) === 1 && (dxfrw || (L.Hidden.lineweight === 35 && (s.entity_lweights['50'] || 0) === 1)),
        r + ': linetypes (layer HIDDEN, object DASHED, both in the table)' + (dxfrw ? '' : ' and lineweights (0.35, 0.5 mm)'), JSON.stringify([L.Hidden, s.ltypes, s.entity_ltypes, s.entity_lweights]));
      if (!dxfrw) ok(L.Hidden?.newvp === true && L.Walls?.newvp === false, r + ': HIDDEN frozen in new viewports (layer flag 2), WALLS not (0.5 VP.2)', JSON.stringify([L.Hidden?.newvp, L.Walls?.newvp]));
      ok(s.insunits === 4 && s.measurement === 1, r + ': units millimetres, metric', s.insunits + ' / ' + s.measurement);
      ok(s.lunits === 4 && s.luprec === 3, r + ': length format (architectural, 1/8)', s.lunits + ' / ' + s.luprec);
      // the Properties panel's fields (part 2, track P): thickness, transparency (2004+), oblique text in its style, a polyline's
      // width, island detection, the named text and dimension styles, a locked viewport
      if (!dxfrw) {
        const pr = s.props || {};
        // transparency 40 % = alpha 153: ODA writes the DWG word as it is (type 3, ODS "value in the last byte"), AutoCAD's
        // DXF uses type 2; LibreDWG's DXF output has no 440 for it (the DWG is read: ODA and CadCraft see it)
        const trOk = fj.version === '2000' ? pr.tr == null : rn.startsWith('LibreDWG') ? pr.tr == null : pr.tr != null && (pr.tr & 0xff) === 153 && [2, 3].includes(pr.tr >>> 24);
        ok(pr.th === 3 && trOk && pr.obl?.[0] === 15 && /^notes$/i.test(pr.tstyle?.[0] || '') && pr.cw?.[0] === 2 && pr.hstyle?.[0] === 1
          && pr.dimstyles?.some((n) => /^arch$/i.test(n)) && pr.styles?.some((n) => /^notes$/i.test(n)) && /^arch$/i.test(pr.dimstyle?.[0] || '') && (pr.vpstatus || []).some((v) => v & 16384),
          r + ': thickness, transparency' + (fj.version === '2000' ? ' (none in 2000)' : '') + ', oblique text in its style, polyline width, island detection, the text and dimension styles, a locked viewport', JSON.stringify(pr));
      }
      // the split screen: three *Active viewports tiling the window (libdxfrw's dwg2dxf writes only the first, as for AutoCAD's files)
      if (!dxfrw) ok(JSON.stringify(s.actives) === '[[0,0,0.6,0.75],[0,0.75,0.6,1],[0.6,0,1,1]]', r + ': the split screen as three *Active viewports', JSON.stringify(s.actives));
      const A = s.layouts['A3 sheet'], B = s.layouts.Detail;
      // libdxfrw's dwg2dxf writes one paper space and no viewports, for AutoCAD's own files too (example_2000.dwg: two
      // layouts with a viewport each in, "Layout1" with none out): sheets are checked with the other two readers
      if (!dxfrw) ok(A && A.viewports === 2 && A.entities.TEXT === 1 && JSON.stringify(A.views) === '[[200,150],[420,297]]' && B && B.viewports === 2,
        r + ': both sheets with their own viewport, the sheet\'s own one and its text', JSON.stringify(s.layouts));
      if (!dxfrw) ok(A && JSON.stringify(A.frozen) === '[[],["HIDDEN"]]', r + ': the layer frozen in the sheet\'s viewport (0.5 VP.1)', JSON.stringify(A?.frozen));
      if (!dxfrw && rn.startsWith('ODA')) ok(JSON.stringify(s.ucs) === '{"org":[10,20],"xdir":[0.866025,0.5],"named":[["Tilted",0.707107,0.707107]],"twist":30,"vptwist":[17.188734]}', r + ': UCS, named UCS, the turned pane (30°) and the twisted viewport as ezdxf reads them (0.5 DR.8)', JSON.stringify(s.ucs));
      if (!dxfrw && rn.startsWith('ODA')) ok(JSON.stringify(s.xclips) === '[[[0,0],[10,0],[10,20],[0,20]]]', r + ': the clipped reference\'s boundary as ezdxf reads it (0.5 WL.16)', JSON.stringify(s.xclips));
      if (!dxfrw && rn.startsWith('ODA')) ok(JSON.stringify(s.vpovr?.WALLS) === '[{"color":5,"lw":70,"tr":0.4}]', r + ': the viewport\'s override of Walls (colour 5, 0.70 mm, 40 %) as ezdxf reads it (0.5 VP.3)', JSON.stringify(s.vpovr));
    }
  }

  // ---- reopened in CadCraft (every version)
  const types = (list) => { const o = {}; for (const e of list) o[e.type] = (o[e.type] || 0) + 1; return o; };
  const expectTypes = types(fx.model.values());
  for (const fj of jobs.filter((j) => j.fixture)) {
    const v = fj.name;
    const back = await openDoc(fj.bytes);
    const b = types(back.model.values());
    const diff = Object.keys({ ...expectTypes, ...b }).filter((k) => (expectTypes[k] || 0) !== (b[k] || 0));
    ok(!diff.length, v + ': reopened in CadCraft with the same objects', diff.map((k) => k + ' want ' + (expectTypes[k] || 0) + ' got ' + (b[k] || 0)).join(', '));
    const t = [...back.model.values()].find((e) => e.type === 'insert' && e.attrs?.ITEM === '12');
    ok(t && t.block === 'Table 30x72' && t.attrs.MAKER === 'Acme Ø ±' && Math.abs(t.sx - 2) < 1e-9, v + ': reopened reference keeps its block, scale and attributes', JSON.stringify(t && { block: t.block, attrs: t.attrs, sx: t.sx }));
    const blk = back.blocks.get('Table 30x72');
    ok(blk && blk.attdefs?.length === 2 && blk.attdefs.find((d) => d.tag === 'MAKER')?.invisible === true, v + ': reopened block keeps its attribute definitions (MAKER invisible)', JSON.stringify(blk?.attdefs?.map((d) => [d.tag, !!d.invisible])));
    const L = back.layers;
    ok(L.get('Off')?.on === false && L.get('Frozen')?.frozen === true && L.get('Locked')?.locked === true && L.get('NoPlot')?.plot === false, v + ': reopened layers keep their states', JSON.stringify([...L.values()].map((l) => [l.name, l.on, l.frozen, l.locked, l.plot])));
    ok(fj.version === '2000' ? L.get('Orange')?.color === 30 : L.get('Orange')?.color === '#ff7f00', v + ': reopened true-colour layer', String(L.get('Orange')?.color));
    const hl = back.layers.get('Hidden'), dl = [...back.model.values()].find((e) => e.lt === 'DASHED');
    ok(hl?.linetype === 'HIDDEN' && hl.lineweight === 0.35 && dl?.lw === 0.5 && back.linetypes.has('DASHED'), v + ': reopened with its linetypes and lineweights', JSON.stringify([hl, dl && { lt: dl.lt, lw: dl.lw }]));
    ok(back.meta.units === 'millimeters' && back.meta.lunits === 4 && back.meta.luprec === 3, v + ': reopened with its units and length format', JSON.stringify(back.meta));
    const p = [...back.model.values()].find((e) => e.type === 'poly' && e.pts.some((q) => q.b));
    ok(p && Math.abs(p.pts.find((q) => q.b).b - 0.5) < 1e-12, v + ': reopened polyline keeps its bulge', JSON.stringify(p?.pts));
    ok([...back.model.values()].filter((e) => e.type === 'ellipse').length === 2, v + ': reopened with its two ellipses');
    const dm = [...back.model.values()].find((e) => e.type === 'dim');
    ok(dm && dm.kind === 'linear' && dm.p1.x === 0 && dm.p2.x === 100 && Math.abs(dm.loc.y - 720) < 1e-9 && dm.st.lunit === 4 && dm.st.dec === 3 && Math.abs(dm.st.txt - 3.5) < 1e-12,
      v + ': reopened dimension is an editable linear dimension with its own settings (format, decimals, text height)', JSON.stringify(dm && { kind: dm.kind, p1: dm.p1, p2: dm.p2, loc: dm.loc, st: dm.st }));
    const ht = [...back.model.values()].find((e) => e.type === 'hatch' && !e.solid);
    ok(ht && ht.pattern === 'ANSI31' && Math.abs(ht.pscale - 2) < 1e-12 && Math.abs(ht.pangle - Math.PI / 12) < 1e-12 && ht.patlines?.length === 1 && Math.abs(ht.patlines[0].angle - 60) < 1e-9 && Math.abs(ht.patlines[0].dy - 6.35) < 1e-9,
      v + ': reopened patterned hatch keeps its pattern, scale, angle and lines', JSON.stringify(ht && { pattern: ht.pattern, pscale: ht.pscale, pangle: ht.pangle, patlines: ht.patlines }));
    const want = fx.layouts.map((l) => [l.name, l.paper.unit, l.paper.w, l.paper.h, l.paper.key || '', [...l.entities.values()].map((e) => e.type).sort().join()].join('|'));
    const got = back.layouts.map((l) => [l.name, l.paper.unit, l.paper.w, l.paper.h, l.paper.key || '', [...l.entities.values()].map((e) => e.type).sort().join()].join('|'));
    ok(JSON.stringify(want) === JSON.stringify(got), v + ': reopened with both sheets (name, paper unit and size, what is on them)', JSON.stringify(got));
    const vp = [...(back.layouts[0]?.entities.values() || [])].find((e) => e.type === 'viewport');
    ok(vp && vp.x === 200 && vp.y === 150 && vp.w === 200 && vp.h === 150 && Math.abs(vp.cx - 250) < 1e-9 && Math.abs(vp.cy - 350) < 1e-9 && Math.abs(vp.s - 0.5) < 1e-12,
      v + ': reopened viewport shows the same part of the model at the same scale', JSON.stringify(vp));
    ok(vp && JSON.stringify(vp.frz) === '["Hidden"]', v + ': reopened viewport keeps the layer frozen in it (0.5 VP.1)', JSON.stringify(vp?.frz));
    ok(vp && JSON.stringify(vp.lov) === '{"Walls":{"color":5,"lw":0.7,"tr":40}}', v + ': reopened viewport keeps its layer override (0.5 VP.3)', JSON.stringify(vp?.lov));
    const cl = [...back.model.values()].find((e) => e.type === 'insert' && e.clip);
    ok(cl && JSON.stringify(cl.clip.pts.map((p) => [p.x, p.y])) === '[[0,0],[10,0],[10,20],[0,20]]', v + ': reopened reference keeps its clip (0.5 WL.16)', JSON.stringify(cl?.clip));
    const xl = [...back.model.values()].find((e) => e.type === 'xline'), ry = [...back.model.values()].find((e) => e.type === 'ray');
    ok(xl && ry && Math.abs(xl.y - 1000) < 1e-9 && Math.abs(xl.dx - Math.SQRT1_2) < 1e-12 && ry.x === 10 && ry.dx === 1, v + ': reopened XLINE and RAY: same point and direction (0.5 DR.7)', JSON.stringify([xl, ry]));
    const ml = [...back.model.values()].find((e) => e.type === 'mleader'), ml0 = [...fx.model.values()].find((e) => e.type === 'mleader');
    ok(ml && JSON.stringify(ml.pts) === JSON.stringify(ml0.pts) && ml.s === ml0.s && ml.dir === ml0.dir && ml.h === ml0.h, v + ': reopened multileader is the same editable multileader (MULTILEADER in the file)', JSON.stringify(ml));
    {
      const ln = [...back.model.values()].find((e) => e.type === 'line' && e.layer === 'Walls' && e.x2 === 500 && e.y1 === 0);
      const tx = [...back.model.values()].find((e) => e.type === 'text' && e.s === 'Left baseline');
      const ht = [...back.model.values()].find((e) => e.type === 'hatch' && !e.solid);
      const dm = [...back.model.values()].find((e) => e.type === 'dim');
      ok(ln?.th === 3 && ln.tr === 40 && ln.url === 'https://getcadcraft.com/' && ln.mat === 'Steel' && tx?.style === 'Notes' && Math.abs(tx.obl - Math.PI / 12) < 1e-12 && tx.ann === true
        && ht?.island === 'outer' && ht.bg === 3 && ht.ox === 5 && dm?.dimstyle === 'Arch' && Math.abs(dm.trot - Math.PI / 12) < 1e-12 && dm.st.blk1 === 'ARCHTICK' && dm.st.tih === true && dm.st.pre === 'L=' && dm.st.tol === 'sym'
        && back.textStyles.get('Notes')?.wf === 0.9 && back.dimStyles.get('Arch')?.dec === 3 && back.layouts[0] && [...back.layouts[0].entities.values()].some((e) => e.type === 'viewport' && e.locked),
        v + ': reopened with every Properties field (thickness, transparency, hyperlink, material, text style + oblique + annotative, hatch island / background / origin, dimension style and its settings, the style tables, a locked viewport)',
        JSON.stringify({ ln, tx, ht: ht && { island: ht.island, bg: ht.bg, ox: ht.ox }, dm: dm && { dimstyle: dm.dimstyle, trot: dm.trot, st: dm.st } }));
    }
    ok(back.vports?.layout === '3r' && back.vports.active === 2 && back.vports.list[2].cx === 600 && back.vports.list[1].h === 50 && Math.abs(back.vports.fy - 0.25) < 1e-12, v + ': reopened with its split screen (3 panes, the third active)', JSON.stringify(back.vports));
    ok(back.views.length === 1 && back.views[0].name === 'Kitchen' && back.views[0].cx === 250 && back.views[0].w === 500 && !back.views[0].layout, v + ': reopened with its named view', JSON.stringify(back.views));
  }

  // ---- the report and the time it took
  const r2000 = jobs.find((j) => j.version === '2000').report, r2018 = jobs.find((j) => j.version === '2018').report;
  ok(r2000.notes.some((n) => /nearest standard colour/.test(n)) && !r2000.notes.some((n) => /sheet|dimension|outline|multileader/.test(n)),
    'fixture 2000: the save report says what changed (true colour) and nothing about sheets, dimensions, hatches or multileaders', r2000.notes.join(' | '));
  ok(!r2018.notes.some((n) => /colour/.test(n)) && r2018.version === '2018', 'fixture 2018: true colours kept, no note', r2018.notes.join(' | '));
  const slow = jobs.filter((j) => j.ms > 2000);
  ok(!slow.length, 'every sample saves in under 2 s (slowest ' + Math.round(Math.max(0, ...jobs.map((j) => j.ms || 0))) + ' ms)', slow.map((j) => j.name).join(', '));
  if (keep) console.log('  kept in ' + tmp); else fs.rmSync(tmp, { recursive: true, force: true });
  return { skipped: null, files: jobs.length, readers: readers.length };
}

/** A small drawing that uses every feature DWG saving writes. Millimetres. */
export function fixture(Doc, attdef) {
  const d = new Doc();
  d.meta.units = 'millimeters';
  d.addLayer({ name: 'Walls', color: 1 });
  d.addLayer({ name: 'Orange', color: '#ff7f00' });
  d.addLayer({ name: 'Off', color: 3, on: false });
  d.addLayer({ name: 'Frozen', color: 4, frozen: true });
  d.addLayer({ name: 'Locked', color: 5, locked: true });
  d.addLayer({ name: 'NoPlot', color: 8, plot: false });
  d.addLayer({ name: 'Hidden', color: 2, linetype: 'HIDDEN', lineweight: 0.35, newVpFrozen: true });   // frozen in new viewports (VP.2)
  d.change('fixture', () => {
    d.defineBlock({
      name: 'Table 30x72', base: { x: 10, y: 5 },
      entities: [
        { type: 'poly', layer: '0', color: 0, closed: true, pts: [{ x: 0, y: 0, b: 0 }, { x: 72, y: 0, b: 0 }, { x: 72, y: 30, b: 0 }, { x: 0, y: 30, b: 0 }] },
        { type: 'circle', layer: '0', color: 0, cx: 6, cy: 6, r: 2 }, { type: 'circle', layer: '0', color: 0, cx: 66, cy: 6, r: 2 },
      ],
      attdefs: [
        attdef({ x: 36, y: 15, h: 4, ha: 'center', va: 'middle' }, { tag: 'ITEM', prompt: 'Item number', def: '1' }),
        attdef({ x: 2, y: 25, h: 2 }, { tag: 'MAKER', prompt: 'Maker', def: '', invisible: true }),
      ],
    });
    d.defineBlock({ name: 'Outer', base: { x: 0, y: 0 }, entities: [{ type: 'insert', layer: '0', color: null, block: 'Table 30x72', x: 0, y: 0, sx: 1, sy: 1, rot: 0, attrs: { ITEM: '99' } }, { type: 'line', layer: '0', color: null, x1: 0, y1: 0, x2: 100, y2: 0 }] });
    const add = (e) => d.add(e);
    add({ type: 'line', layer: 'Walls', color: 3, x1: 0, y1: 0, x2: 500, y2: 0, th: 3, tr: 40, url: 'https://getcadcraft.com/', mat: 'Steel' });   // part 2 track P fields
    add({ type: 'line', layer: 'Off', x1: 0, y1: 10, x2: 500, y2: 10 });
    add({ type: 'line', layer: 'Frozen', x1: 0, y1: 20, x2: 500, y2: 20 });
    add({ type: 'line', layer: 'Locked', x1: 0, y1: 30, x2: 500, y2: 30 });
    add({ type: 'line', layer: 'NoPlot', x1: 0, y1: 40, x2: 500, y2: 40 });
    add({ type: 'line', layer: 'Hidden', lt: 'DASHED', lw: 0.5, x1: 0, y1: 45, x2: 500, y2: 45 });
    add({ type: 'line', layer: 'Orange', color: '#00ff00', x1: 0, y1: 50, x2: 500, y2: 50 });
    add({ type: 'circle', layer: 'Walls', cx: 100, cy: 100, r: 25 });
    add({ type: 'arc', layer: 'Walls', cx: 200, cy: 100, r: 25, a0: 0, a1: Math.PI / 2 });
    add({ type: 'poly', layer: 'Walls', closed: false, pts: [{ x: 300, y: 100, b: 0.5 }, { x: 350, y: 100, b: 0 }, { x: 350, y: 150, b: 0 }] });
    add({ type: 'poly', layer: 'Walls', closed: true, w: 2, pts: [{ x: 400, y: 100, b: 0 }, { x: 450, y: 100, b: 0 }, { x: 450, y: 150, b: 0 }] });
    add({ type: 'ellipse', layer: 'Walls', cx: 100, cy: 200, mx: 40, my: 0, ratio: 0.5, t0: 0, t1: 2 * Math.PI });
    add({ type: 'ellipse', layer: 'Walls', cx: 200, cy: 200, mx: 20, my: 0, ratio: 1.5, t0: 0, t1: Math.PI });
    add({ type: 'point', layer: 'Walls', x: 300, y: 200 });
    add({ type: 'text', layer: 'Walls', x: 0, y: 300, h: 5, rot: 0, s: 'Left baseline', ha: 'left', va: 'baseline', style: 'Notes', obl: Math.PI / 12, ann: true });
    add({ type: 'text', layer: 'Walls', x: 100, y: 300, h: 5, rot: Math.PI / 6, s: 'Centred middle', ha: 'center', va: 'middle', wf: 0.8 });
    add({ type: 'text', layer: 'Walls', x: 200, y: 300, h: 5, rot: 0, s: 'Right top', ha: 'right', va: 'top' });
    add({ type: 'text', layer: 'Walls', x: 300, y: 300, h: 5, rot: 0, s: 'First line\nSecond line {braces} \\ backslash', ha: 'left', va: 'baseline' });
    add({ type: 'text', layer: 'Walls', x: 400, y: 300, h: 5, rot: 0, s: 'A wrapped paragraph of text that is longer than its box', ha: 'center', va: 'middle', ww: 40 });
    add({ type: 'insert', layer: 'Walls', block: 'Table 30x72', x: 100, y: 400, sx: 2, sy: 2, rot: Math.PI / 2, attrs: { ITEM: '12', MAKER: 'Acme Ø ±' } });
    add({ type: 'insert', layer: 'Walls', block: 'Table 30x72', x: 300, y: 400, sx: 1, sy: 1, rot: 0, attrs: { ITEM: '13' }, clip: { pts: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 20 }, { x: 0, y: 20 }] } });   // XCLIP (0.5 WL.16)
    add({ type: 'insert', layer: 'Walls', block: 'Outer', x: 0, y: 500, sx: 1, sy: 1, rot: 0 });
    add({ type: 'hatch', layer: 'Walls', solid: true, loops: [[0, 600, 10, 600, 5, 610, 0, 600]] });
    add({ type: 'hatch', layer: 'Walls', solid: true, loops: [[100, 600, 150, 600, 150, 650, 125, 670, 100, 650, 100, 600], [110, 610, 120, 610, 120, 620, 110, 620, 110, 610]] });
    add({ type: 'hatch', layer: 'Walls', solid: false, pattern: 'ANSI31', pscale: 2, pangle: Math.PI / 12, piso: true, loops: [[200, 600, 250, 600, 250, 650, 200, 650, 200, 600]], island: 'outer', bg: 3, ox: 5, oy: 7 });
    add({ type: 'dim', layer: 'Walls', kind: 'linear', p1: { x: 0, y: 700 }, p2: { x: 100, y: 700 }, loc: { x: 100, y: 720 }, rot: 0, text: '', st: { txt: 3.5, lunit: 4, dec: 3, blk1: 'ARCHTICK', blk2: 'ARCHTICK', tih: true, pre: 'L=', tol: 'sym', tp: 0.5, tm: 0.5 }, dimstyle: 'Arch', trot: Math.PI / 12 });
    add({ type: 'mleader', layer: 'Walls', color: null, pts: [{ x: 600, y: 0 }, { x: 650, y: 50 }], dir: 1, s: 'Note', h: 5 });
    add({ type: 'xline', layer: 'Walls', color: null, x: 0, y: 1000, dx: Math.SQRT1_2, dy: Math.SQRT1_2 });   // construction lines (0.5 DR.7)
    add({ type: 'ray', layer: 'Walls', color: null, x: 10, y: 1000, dx: 1, dy: 0 });
    // a linked drawing CadCraft did not load (0.4 C35): saved as a link to its file
    d.defineBlock({ name: 'Site', base: { x: 0, y: 0 }, entities: [], xref: { path: 'X-Refs\\Site.dwg', loaded: false } });
    add({ type: 'insert', layer: 'Walls', block: 'Site', x: 0, y: 900, sx: 1, sy: 1, rot: 0 });
  });
  d.meta.lunits = 4; d.meta.luprec = 3;
  d.views = [{ name: 'Kitchen', cx: 250, cy: 350, w: 500, h: 300 }];
  d.textStyles = new Map([['Notes', { font: 'romans.shx', h: 0, wf: 0.9, obl: 0 }]]);
  d.dimStyles = new Map([['Arch', { txt: 3.5, asz: 2.5, exe: 1.25, exo: 0.625, gap: 0.625, dli: 3.75, dec: 3, adec: 0, scale: 1, tad: 1, zin: 8, lunit: 4 }]]);
  d.vports = { layout: '3r', fx: 0.6, fy: 0.25, active: 2, list: [{ cx: 250, cy: 350, h: 300 }, { cx: 100, cy: 100, h: 50 }, { cx: 600, cy: 25, h: 120, tw: Math.PI / 6 }] };
  d.ucs = { x: 10, y: 20, ang: Math.PI / 6 }; d.ucsNamed = [{ name: 'Tilted', x: 5, y: 5, ang: Math.PI / 4 }];   // DR.8: the active pane turned 30°, a UCS   // split screen (part 2 Q.1)
  d.layouts.push({ name: 'A3 sheet', paper: { w: 420, h: 297, unit: 'mm', x0: 0, y0: 0, key: 'iso-a3' }, entities: new Map([
    ['s1', { id: 's1', type: 'viewport', layer: '0', color: null, x: 200, y: 150, w: 200, h: 150, cx: 250, cy: 350, s: 0.5, locked: true, frz: ['Hidden'], lov: { Walls: { color: 5, lw: 0.7, tr: 40 } } }],   // Hidden frozen in it (0.5 VP.1); Walls overridden in it (VP.3)
    ['s2', { id: 's2', type: 'text', layer: '0', color: null, x: 300, y: 20, h: 5, rot: 0, s: 'Title', ha: 'left', va: 'baseline' }],
  ]) });
  d.layouts.push({ name: 'Detail', paper: { w: 11, h: 8.5, unit: 'in', x0: 0, y0: 0, key: 'letter' }, entities: new Map([
    ['s3', { id: 's3', type: 'viewport', layer: '0', color: null, x: 5.5, y: 4.25, w: 8, h: 6, cx: 100, cy: 100, s: 0.02, tw: 0.3 }],   // a twisted viewport (DR.8)
  ]) });
  return d;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  {   // the app's language file, as bin/test-cadcraft.mjs sets it up (save notes are t() strings)
    const app = path.resolve(HERE, '../../public_html/assets/apps/cadcraft/dev');
    const I18n = await import(pathToFileURL(path.join(app, 'i18n.js')).href);
    I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(app, 'lang/en.json'), 'utf8')) });
  }
  const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + String(extra).slice(0, 600) : '')); } };
  const di = process.argv.indexOf('--dwg');
  const r = await runDwgSaveChecks({ ok, verbose: process.argv.includes('--verbose'), keep: process.argv.includes('--keep'), ...(di > 0 ? { samples: path.resolve(process.argv[di + 1]) } : {}) });
  if (r.skipped) console.log('  skipped: ' + r.skipped);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
