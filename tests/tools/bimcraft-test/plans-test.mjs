/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --plans` (0.7 DC.116, session `trace`): walls from a set of plans, in Node, on the fixtures of
 * fixtures/raster/ (drawn by us; the truth is in plan-truth.json, in millimetres):
 *   a vector PDF (two pages), a PDF whose pages are pictures, a scanned sheet (PNG, and a TIFF page) → walls and their doors and windows,
 *   each compared with the truth within a tolerance that follows the source's resolution; then both pages into a model as two levels,
 *   one undo step, the pages kept as underlays, saved and reopened.
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export async function plansMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
  const FX = path.join(ROOT, 'fixtures/raster');
  const truth = JSON.parse(fs.readFileSync(path.join(FX, 'plan-truth.json'), 'utf8'));
  const PP = await imp('plan-pages.js');
  const TR = await imp('model-trace.js');
  const R = await imp('raster/index.js');
  const { t } = await imp('i18n.js');
  void t;
  const readF = (f) => new Uint8Array(fs.readFileSync(path.join(FX, f)));
  const SC = truth.paper.scale;

  /** The traced result against the truth of a page: [walls found, openings found] and the worst position error (mm). */
  function compare(res, tr, tol, label) {
    const dirOf = (w) => { const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); return [(w.b[0] - w.a[0]) / L, (w.b[1] - w.a[1]) / L, L]; };
    ok(res.walls.length === tr.walls.length, label + ': ' + tr.walls.length + ' walls (found ' + res.walls.length + ')', JSON.stringify(res.report));
    let worst = 0, missing = 0;
    const match = [];
    for (const tw of tr.walls) {
      const [ux, uy, L] = dirOf(tw), nx = -uy, ny = ux;
      let best = null;
      for (const [i, w] of res.walls.entries()) {
        const [vx, vy] = dirOf(w);
        if (Math.abs(ux * vy - uy * vx) > 0.03) continue;
        const off = Math.max(Math.abs((w.a[0] - tw.a[0]) * nx + (w.a[1] - tw.a[1]) * ny), Math.abs((w.b[0] - tw.a[0]) * nx + (w.b[1] - tw.a[1]) * ny));
        const s0 = (w.a[0] - tw.a[0]) * ux + (w.a[1] - tw.a[1]) * uy, s1 = (w.b[0] - tw.a[0]) * ux + (w.b[1] - tw.a[1]) * uy;
        const lo = Math.max(0, Math.min(s0, s1)), hi = Math.min(L, Math.max(s0, s1));
        if (hi - lo < 0.9 * L || off > tol || Math.abs(w.t - tw.t) > 0.35 * tw.t) continue;
        if (!best || off < best.off) best = { i, off, u: [ux, uy] };
      }
      if (!best) { missing++; match.push(-1); } else { worst = Math.max(worst, best.off); match.push(best.i); }
    }
    ok(!missing, label + ': every wall is on its true centre line within ' + tol + ' mm and as thick as it should be (worst ' + worst.toFixed(0) + ' mm, ' + missing + ' missing)');
    // openings: centre point in plan, kind, width
    const centre = (w, o) => { const [ux, uy] = dirOf(w); return [w.a[0] + ux * (o.offset + o.width / 2), w.a[1] + uy * (o.offset + o.width / 2)]; };
    ok(res.openings.length === tr.openings.length, label + ': ' + tr.openings.length + ' openings (found ' + res.openings.length + ')');
    let bw = 0, wrongKind = 0, lost = 0, wid = 0;
    for (const to of tr.openings) {
      const c = centre(tr.walls[to.wall], to);
      let best = null;
      for (const o of res.openings) { const q = centre(res.walls[o.wall], o), d = Math.hypot(q[0] - c[0], q[1] - c[1]); if (!best || d < best.d) best = { d, o }; }
      if (!best || best.d > tol) { lost++; continue; }
      bw = Math.max(bw, best.d);
      if (best.o.kind !== to.kind) wrongKind++;
      wid = Math.max(wid, Math.abs(best.o.width - to.width) / to.width);
    }
    ok(!lost, label + ': every opening is where it should be within ' + tol + ' mm (worst ' + bw.toFixed(0) + ' mm, ' + lost + ' lost)');
    ok(!wrongKind, label + ': doors are doors and windows are windows (' + tr.openings.filter((o) => o.kind === 'door').length + ' + ' + tr.openings.filter((o) => o.kind === 'window').length + ', ' + wrongKind + ' wrong)');
    ok(wid <= 0.2, label + ': widths within 20% (worst ' + (wid * 100).toFixed(0) + '%)');
    return match;
  }

  // ---- a vector PDF
  console.log('== DC.116 a vector PDF (pdf-vector.js, the page scale from the paper)');
  const pdfjs = await import(pathToFileURL(path.join(ROOT, 'tools/markupcraft-test/node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
  const { extractPage } = await imp('pdf-vector.js');
  const vdoc = await pdfjs.getDocument({ data: readF('plan-vector.pdf'), isEvalSupported: false, enableScripting: false, verbosity: 0 }).promise;
  const pages = {};
  for (const [n, key] of [[1, 'A'], [2, 'B']]) {
    const vec = await extractPage(pdfjs, await vdoc.getPage(n));
    ok(vec.shapes.length > 100 && vec.images === 0, 'page ' + n + ' is vector line work (' + vec.shapes.length + ' shapes, no pictures)');
    const parts = PP.pdfPageParts(vec, { mmPerPt: SC * 25.4 / 72 });
    ok(parts.arcs.length === (key === 'A' ? 3 : 2), 'page ' + n + ': the door swings are arcs (' + parts.arcs.length + ')');
    const res = PP.wallsFromPlan(parts);
    pages[key] = { parts, res };
    compare(res, truth[key], 40, 'vector page ' + n);
    ok(res.report.hatchLines >= 15 && res.report.doors === truth[key].openings.filter((o) => o.kind === 'door').length, 'page ' + n + ': hatching and lettering left out (' + res.report.hatchLines + ' hatch lines, ' + res.report.short + ' short strokes)');
  }
  // the scale from two picked points and a true distance: the outer wall's two outer corners are 12 250 mm apart
  const mm = PP.mmPerUnit([0, 0], [100, 0], 12250);
  ok(Math.abs(mm - 122.5) < 1e-9 && PP.mmPerUnit([1, 1], [1, 1], 5) === 0, 'mmPerUnit: two points and a distance → mm a unit (and nothing from two equal points)');

  // ---- a PDF whose pages are pictures: drawn by poppler (an oracle only) at 150 dpi, then the scan route
  console.log('== DC.116 a PDF whose pages are pictures');
  const tool = ['/usr/bin/pdftoppm', '/usr/local/bin/pdftoppm'].find((f) => fs.existsSync(f));
  const rdoc = await pdfjs.getDocument({ data: readF('plan-raster.pdf'), isEvalSupported: false, verbosity: 0 }).promise;
  const rv = await extractPage(pdfjs, await rdoc.getPage(1));
  ok(rv.shapes.length === 0 && rv.images >= 1, 'page 1 of the raster PDF is a picture: no line work, ' + rv.images + ' image(s): so it goes the scan route');
  if (!tool) console.log('  (pdftoppm is not installed: the drawn raster page is not tested here; tools/cadcraft-test/browser-raster.mjs draws it with pdf.js)');
  else {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plans-'));
    const dpi = 150;
    execFileSync(tool, ['-r', String(dpi), '-gray', '-png', path.join(FX, 'plan-raster.pdf'), path.join(dir, 'p')], { stdio: 'ignore' });
    for (const [n, key] of [[1, 'A'], [2, 'B']]) {
      const f = fs.readdirSync(dir).filter((x) => /^p-.*\.png$/.test(x)).sort()[n - 1];
      const img = await R.readPng(new Uint8Array(fs.readFileSync(path.join(dir, f))));
      const mmPerPx = SC * 25.4 / dpi;
      const tp = PP.tracePicture(img, { tol: 1.5 });
      const parts = PP.scanParts(tp.result, { mmPerPx, hPx: img.h });
      const res = PP.wallsFromPlan(parts);
      compare(res, truth[key], 60, 'raster PDF page ' + n);
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }

  // ---- a scan, crooked and speckled
  console.log('== DC.116 a scan (PNG) and a TIFF page');
  const scanImg = await R.readPng(readF('plan-scan.png'));
  const tps = PP.tracePicture(scanImg, { tol: 1.5 });
  ok(Math.abs(tps.skew.applied - truth.skewDeg) < 0.15, 'the scan was found crooked and squared (' + tps.skew.applied + '°)');
  const mmPx = SC * truth.paper.w / scanImg.w;
  const sres = PP.wallsFromPlan(PP.scanParts(tps.result, { mmPerPx: mmPx, hPx: scanImg.h }));
  compare(sres, truth.A, 110, 'scan');
  const tif = R.readTiff(readF('plan-2page-g4.tif'), 1);
  const tpt = PP.tracePicture(tif, { tol: 1.5 });
  const tres = PP.wallsFromPlan(PP.scanParts(tpt.result, { mmPerPx: SC * truth.paper.w / tif.w, hPx: tif.h }));
  compare(tres, truth.B, 80, 'TIFF page 2');

  // ---- into a model: two levels, one undo step, the pages kept as underlays
  console.log('== DC.116 into a model');
  const N = await imp('new-model.js');
  const OPS = await imp('model-ops.js');
  const { IfcEditor } = await imp('ifc-edit.js');
  const { ModelWriter } = await imp('model-write.js');
  const text = N.newBuilding({ name: 'Plans', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'p.ifc', now: new Date('2026-10-23T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  const levels = OPS.snapshotModel(ed).levels;
  const mk = (key) => {
    const { parts, res } = pages[key];
    const lines = parts.segs.map((q) => [...q]);
    return { walls: res.walls, openings: res.openings.map((o) => ({ ...o, typeKey: o.kind === 'door' ? 'door-single' : 'win-casement' })), typeKey: 'ext-2x6', height: 3000, underlay: { name: 'plan-vector.pdf page ' + (key === 'A' ? 1 : 2), units: 'mm', lines: lines.slice(0, 5000) } };
  };
  // plan coordinates start where the paper does; put the building on the origin
  const shift = (p) => ({ ...p, walls: p.walls.map((w) => ({ ...w, a: [w.a[0] - 1350, w.a[1] - 1250], b: [w.b[0] - 1350, w.b[1] - 1250] })), underlay: { ...p.underlay, lines: p.underlay.lines.map((q) => [q[0] - 1350, q[1] - 1250, q[2] - 1350, q[3] - 1250]) } });
  const n0 = ed.changes.length;
  ed.modelChange(TR.tracePages([{ level: levels[0].guid, ...shift(mk('A')) }, { level: { name: 'Level 2', elevation: 3000, height: 3000 }, ...shift(mk('B')) }]), { label: 'From the plans', verb: 'Made' });
  const snap = OPS.snapshotModel(ed);
  ok(ed.changes.length === n0 + 1, 'both pages are one undo step');
  ok(snap.levels.length === 2 && snap.levels[1].name === 'Level 2' && Math.abs(snap.levels[1].elevation - 3000) < 0.01, 'page 2 went to a level made for it (Level 2 at 3000)');
  const byLevel = (id) => snap.walls.filter((w) => w.storey === id).length;
  ok(snap.walls.length === 11 && byLevel(snap.levels[0].id) === 6 && byLevel(snap.levels[1].id) === 5 && snap.openings.length === 10, 'level 1: 6 walls, level 2: 5 walls, ' + snap.openings.length + ' doors and windows in all', JSON.stringify({ w: snap.walls.length, o: snap.openings.length }));
  const w = new ModelWriter(WebIFC, ed.api, ed.mid);
  const ul = TR.readUnderlays(w);
  ok(ul.length === 2 && ul.every((u) => u.lines.length > 100), 'each page stays as the underlay of its level (' + ul.map((u) => u.storey === snap.levels[0].id ? 'L1' : 'L2').join(',') + ')');
  ok(snap.openings.filter((o) => o.kind === 'door').length === 5 && snap.openings.filter((o) => o.kind === 'window').length === 5, 'five doors and five windows');
  const back = new TextDecoder().decode(ed.save());
  const eng2 = await quiet(IfcModel.create)(WebIFC, null);
  const m2 = await quiet((b) => eng2.load(b))(new TextEncoder().encode(back));
  ok(TR.readUnderlays(new ModelWriter(WebIFC, eng2.api, m2.modelID)).length === 2, 'saved and reopened: both underlays are read back');
  ed.undo();
  const after = OPS.snapshotModel(ed);
  ok(after.walls.length === 0 && after.levels.length === 1 && !TR.readUnderlays(new ModelWriter(WebIFC, ed.api, ed.mid)).length, 'one undo: no walls, no second level, no underlays');
  ed.redo();
  const again = OPS.snapshotModel(ed);
  ok(again.walls.length === 11 && again.levels.length === 2 && again.openings.length === 10, 'redo makes the same elements again');

  console.log('\n' + good + ' passed, ' + bad + ' failed');
  return bad ? 1 : 0;
}
