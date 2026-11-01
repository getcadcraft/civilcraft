/* SPDX-License-Identifier: Apache-2.0 */
/**
 * r52-test.mjs — BimCraft, round 5 session bim-build_PART_5 (R5.2), DOM-free, run by
 *   node bin/test-bimcraft.mjs --r52 [--only a,b,c]
 *   a   D8.8 pictures in section / elevation sheet views (picture-sheet.js, res-sheets.js image item, PDF + SVG)
 */
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';

export async function r52Mode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(String(args[i + 1] || '').split(',')) : null; })();
  const want = (k) => !only || only.has(k);
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const imp = (f) => import(path.join(APP, f));
  const near = (a, b, e = 1e-3) => Math.abs(a - b) < e;

  if (want('a')) {
    console.log('== a: D8.8 pictures in section and elevation views');
    const PS = await imp('picture-sheet.js'), P = await imp('picture.js'), RS = await imp('res-sheets.js');
    // a picture 4 m wide, 2 m high (centre 2000 along the line, 1500 up) standing over the line (0,0) -> (4000,0)
    const pic = P.makePicture({ w: 400, h: 200, mmPerPx: 10, plane: 'vertical', a: [0, 0], b: [4000, 0], x: 2000, y: 1500 });
    // a view looking along +y (dir [0,1]): right = [1, 0]; the picture's plane is square to it
    const m = PS.viewPlacement(pic, { dir: [0, 1], o: [0, 0], dz: 0 });
    ok(m && near(m[0], 10) && near(m[3], -10), 'a picture square to the view lands in it (pixel scale 10 mm, y flips)', JSON.stringify(m));
    const px = (u, v) => [m[0] * u + m[2] * v + m[4], m[1] * u + m[3] * v + m[5]];
    ok(near(px(0, 0)[0], 0) && near(px(0, 0)[1], 2500) && near(px(400, 200)[0], 4000) && near(px(400, 200)[1], 500), 'its corners are at x 0..4000 and 500..2500 above the level');
    ok(near(PS.viewPlacement(pic, { dir: [0, 1], o: [0, 0], dz: 3000 })[5], 5500), 'a picture on the level above (dz) sits that much higher');
    ok(PS.viewPlacement(pic, { dir: [1, 0], o: [0, 0] }) === null, 'a view at 90 degrees to the plane does not show it');
    ok(PS.viewPlacement(pic, { dir: [0, 1], o: [0, 800] }) === null, 'a section cut 800 mm away does not show it');
    ok(PS.viewPlacement({ ...pic, section: 'G1' }, { dir: [0, 1], o: [0, 800], guid: 'G1' }) !== null, 'a picture put on that section line shows in it wherever the cut is');
    ok(PS.viewPlacement(pic, { dir: [0, 1], o: null, dz: 0 }) !== null, 'an elevation (no cut) shows a parallel picture');
    ok(PS.viewPlacement({ ...pic, hidden: true }, { dir: [0, 1], o: null }) === null && PS.viewPlacement({ ...pic, plane: 'level' }, { dir: [0, 1], o: null }) === null, 'a hidden picture and a level picture never show');
    const back = PS.viewPlacement(pic, { dir: [0, -1], o: null });
    ok(back && back[0] < 0, 'seen from behind it is mirrored (x runs the other way)');

    // the sheet item and the PDF / SVG
    const rgb = zlib.deflateSync(Buffer.from([255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0]));
    const image = { kind: 'flate', w: 2, h: 2, rgb: new Uint8Array(rgb), alpha: null };
    const view = { bounds: { x0: -500, y0: -500, x1: 4500, y1: 3500 }, lines: [[0, 0, 4000, 0]], images: [{ m, w: 400, h: 200, opacity: 0.5, image, href: '' , name: 'site.png' }] };
    const P1 = (q) => [10 + q[0] / 50, 20 + q[1] / 50];
    const items = RS.viewItems(view, P1, 1 / 50);
    const imIt = items.find((i) => i.t === 'image');
    ok(imIt && near(imIt.m[0], 10 / 50) && near(imIt.m[4], 10) && near(imIt.m[5], 20 + 2500 / 50), 'viewItems puts the picture on the sheet at the view scale', JSON.stringify(imIt?.m));
    ok(items.findIndex((i) => i.t === 'image') < items.findIndex((i) => i.t === 'line'), 'the picture is drawn before (under) the view\'s lines');
    ok(items[0].t === 'clip' && items.at(-1).t === 'line' || items.some((i) => i.t === 'unclip'), 'it is clipped to the view');
    const sheet = { number: 'A-301', title: 'Sections', items: [{ t: 'line', pts: [[10, 10], [200, 10]], w: 0.3, g: 0 }, ...items], views: [] };
    const bytes = RS.setPdf([sheet, { number: 'A-302', title: 'Two', items: [] }], { paper: 'a3', title: 'x' });
    const tmp = path.join(ROOT, 'tmp/r52-sheet.pdf');
    fs.mkdirSync(path.dirname(tmp), { recursive: true }); fs.writeFileSync(tmp, bytes);
    const lst = spawnSync('pdfimages', ['-list', tmp], { encoding: 'utf8' });
    const rows = lst.stdout.split('\n').filter((l) => /^\s*1\s+\d+\s+image/.test(l));
    ok(rows.length === 1 && /\s2\s+2\s/.test(rows[0]), 'the sheet PDF holds the picture as an image on page 1 (pdfimages -list)', lst.stdout + lst.stderr);
    const info = spawnSync('pdfinfo', [tmp], { encoding: 'utf8' });
    ok(/Pages:\s+2/.test(info.stdout) && !/Error/i.test(info.stderr), 'the two-page PDF still reads (pdfinfo)', info.stderr.slice(0, 200));
    const withAttach = RS.setPdf([sheet], { paper: 'a3', title: 'x', attach: { name: 'a.json', bytes: new Uint8Array([123, 125]), mime: 'application/json', desc: 'd' } });
    fs.writeFileSync(tmp, withAttach);
    ok(spawnSync('pdfimages', ['-list', tmp], { encoding: 'utf8' }).stdout.split('\n').filter((l) => /image/.test(l) && /^\s*1/.test(l)).length === 1, 'with an attachment the image object numbers still line up');
    const svg = RS.sheetSvg(sheet, { paper: 'a3' });
    ok(/<rect width="400" height="200"/.test(svg), 'the preview SVG draws a frame when there is no picture data');
    const svg2 = RS.sheetSvg({ ...sheet, items: sheet.items.map((i) => i.t === 'image' ? { ...i, href: 'data:image/png;base64,AAAA' } : i) }, { paper: 'a3' });
    ok(/<image href="data:image\/png/.test(svg2) && /transform="matrix\(/.test(svg2), 'the preview SVG shows the picture with its transform');
    fs.rmSync(tmp, { force: true });
  }

  if (want('b')) {
    console.log('== b: SU.1055 a stair from a sketch as a family (stair-family.js)');
    const SF = await imp('stair-family.js'), SK = await imp('stair-sketch.js'), RS = await imp('res-stair.js'), FM = await imp('family-model.js');
    const bb = (poly) => { const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
    const cases = [
      ['straight', [[0, 0], [2500, 0]]],
      ['L left', [[0, 0], [1800, 0], [1800, 1500]]],
      ['L right', [[0, 0], [1800, 0], [1800, -1500]]],
      ['U left', [[0, 0], [1600, 0], [1600, 1200], [0, 1200]]],
      ['U right', [[0, 0], [1600, 0], [1600, -1200], [0, -1200]]],
    ];
    for (const [label, pts] of cases) {
      const r = SK.stairFromSketch(pts, { height: 2800 });
      const spec = { ...r.spec, start: [0, 0], angle: 0 };
      const fam = SF.stairFamily(spec, { name: label });
      const rd = FM.readFamily(fam);
      ok(rd.ok, label + ': the recipe reads as a family', JSON.stringify(rd.error || rd.errors || ''));
      if (!rd.ok) continue;
      const ev = FM.evaluateFamily(rd.family, {}, {});
      ok(ev.ok, label + ': it evaluates at its own values', JSON.stringify(ev.error));
      if (!ev.ok) continue;
      const L = RS.stairLayout({ ...RS.STAIR_DEFAULTS, ...spec });
      const want = [];
      for (const pc of L.pieces) { if (pc.kind === 'landing') want.push({ b: bb(pc.poly), z: pc.z }); else for (const t of pc.treads || []) want.push({ b: bb(t.poly), z: t.z }); }
      const have = [...ev.solids.values()].filter((x) => x.box).map((x) => ({ b: [x.box[0], x.box[1], x.box[3], x.box[4]], z: x.box[5] }));
      const same = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 0.02);
      const missing = want.filter((w) => !have.some((h) => same(h.b, w.b) && Math.abs(h.z - w.z) < 0.02));
      ok(want.length === have.length && !missing.length, label + ': every tread and landing of the ordinary stair is a box of the family (' + want.length + ' pieces)', 'missing ' + missing.length + ' of ' + want.length + ' ' + JSON.stringify(missing[0]));
      ok(Math.abs(fam.params.find((x) => x.key === 'Rise').value - L.riser) < 0.01 && fam.params.find((x) => x.key === 'Steps').value === L.n, label + ': Steps and Rise match (' + L.n + ' risers)');
    }
    // the parameters really drive it: more treads in flight 1, a higher stair
    const f0 = SF.stairFamily({ ...SK.stairFromSketch([[0, 0], [2500, 0]], { height: 2800 }).spec, start: [0, 0], angle: 0 });
    const rd0 = FM.readFamily(f0).family;
    const ev1 = FM.evaluateFamily(rd0, { N1: 20, Height: 3600 }, {});
    ok(ev1.ok && ev1.solids.size === 20, 'N1 = 20 makes twenty treads', String(ev1.solids?.size));
    const top = Math.max(...[...ev1.solids.values()].map((x) => x.box[5]));
    ok(Math.abs(top - 3600 * 20 / 21) < 0.05, 'the top tread is at Height x N1 / Steps (' + top.toFixed(1) + ')');
    const pl = SF.stairFamilyPlace({ start: [100, 200], angle: -90 });
    ok(pl.x === 100 && pl.y === 200 && pl.rot === 270, 'it is placed at the sketch start, turned to its first flight');
    let kindErr = '';
    try { SF.stairFamily({ ...SK.stairFromSketch([[0, 0], [2500, 0]], { height: 2800 }).spec, kind: 'spiral' }); } catch (e) { kindErr = e.key; }
    ok(kindErr === 'model.err.stairfamily.kind', 'a spiral stair is refused, with a word');
  }

  if (want('c')) {
    console.log('== c: EG.6 panel drawings from the model, timber and light-gauge steel (panels-bim.js)');
    const N = await imp('new-model.js'), OPS = await imp('model-ops.js'), { IfcEditor } = await imp('ifc-edit.js'), PB = await imp('panels-bim.js'), FR = await imp('framing.js');
    const text = N.newBuilding({ name: 'R52', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'r.ifc', now: new Date('2026-10-31T12:00:00Z') });
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
    const ed = new IfcEditor(WebIFC, eng);
    let snap = OPS.snapshotModel(ed);
    const L1 = snap.levels[0], L2 = snap.levels[1];
    const room = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: room.map((a, i) => ({ a, b: room[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: L2.guid, extSide: 'right' }));
    snap = OPS.snapshotModel(ed);
    ed.modelChange(OPS.placeOpening({ wall: snap.walls[0].guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
    ed.modelChange(OPS.placeOpening({ wall: snap.walls[0].guid, typeKey: 'win-fixed', offset: 5500, face: 'left' }));
    ed.modelChange(OPS.placeFloor({ storey: L1.guid, seed: [4000, 2500], mode: 'building' }));
    ed.modelChange(OPS.placeRoof({ storey: L1.guid, seed: [4000, 2500], pitch: 30 }));
    snap = OPS.snapshotModel(ed);
    const loops = (st) => OPS.loopsOf(ed, st);
    const hosts = PB.panelHosts({ walls: snap.walls, openings: snap.openings, floors: snap.derived.floors, roofs: snap.derived.roofs, loops, levels: snap.levels });
    const by = (k) => hosts.filter((h) => h.kind === k);
    ok(by('wall').length === 4 && by('floor').length === 1 && by('roof').length === 1, 'four walls, a floor and a roof become six panel hosts', hosts.map((h) => h.kind).join());
    const w0 = by('wall').find((h) => h.guid === snap.walls[0].guid);
    ok(w0.spec.openings.length === 2 && Math.abs(w0.spec.length - snap.walls[0].len) < 1, 'a wall brings its length and both openings');
    const f = by('floor')[0].spec, r = by('roof')[0].spec;
    ok(Math.abs(f.width - 8000) < 250 && Math.abs(f.span - 5000) < 250 && f.width > f.span, 'the floor panel is the outline\'s rectangle (' + Math.round(f.width) + ' x ' + Math.round(f.span) + ')');
    ok(Math.abs(r.run - 2500) < 125 && Math.abs(r.rise - r.run * Math.tan(Math.PI / 6)) < 5 && r.length >= 7900, 'the roof panel runs half the short side at the roof\'s pitch (rise ' + Math.round(r.rise) + ')');
    for (const material of ['timber', 'lgs']) {
      const built = PB.buildPanels(hosts, { material });
      ok(built.length === 6 && built.every((b) => b.panel.pieces.length > 0 && b.spec.material === material), material + ': all six panels frame', built.map((b) => b.panel.pieces.length).join());
      const sizes = new Set(built.flatMap((b) => b.rows.map((x) => x.size)));
      const known = material === 'lgs' ? Object.keys(FR.STEEL) : Object.keys(FR.TIMBER);
      ok([...sizes].every((z) => known.includes(z)), material + ': every piece is a ' + (material === 'lgs' ? 'steel section' : 'lumber size') + ' (' + [...sizes].join(' ') + ')');
      ok(built.every((b) => b.rows.length > 0 && b.rows.every((x) => x.count >= 1 && x.length > 0)), material + ': every panel has a cut list');
    }
    const a = PB.buildPanels(hosts.slice(0, 1), { material: 'lgs', size: 'C150-1.2' })[0];
    ok(a.spec.size === 'C150-1.2' && a.panel.pieces.some((p) => p.size === 'C150-1.2'), 'a chosen steel size is used');
    const wrong = PB.buildPanels(hosts.slice(0, 1), { material: 'lgs', size: '2x4' })[0];
    ok(wrong.spec.size !== '2x4', 'a lumber size on a steel panel is dropped, not used');
    const svg = FR.panelSvg(PB.buildPanels(by('roof'), { material: 'lgs' })[0].panel, { title: 'Roof' });
    ok(/^<svg/.test(svg) && /data-piece/.test(svg), 'the roof panel draws to scale as SVG');
    const pdf = await FR.panelsPdf(PB.buildPanels(hosts, { material: 'lgs' }).map((b) => b.panel), { names: hosts.map((h) => h.id), title: 'x' });
    ok(pdf.bytes.length > 3000 && String.fromCharCode(...pdf.bytes.slice(0, 5)) === '%PDF-', 'one PDF of six pages comes out (' + pdf.bytes.length + ' bytes)');
    const tall = PB.buildPanels([{ ...w0, spec: { ...w0.spec, openings: [{ x: 10, width: 900, height: 2100, sill: 0 }] } }], { material: 'timber' })[0];
    ok(tall.problems.some((q) => q.code === 'frm.edge'), 'an opening too near the wall\'s end is a Problem (frm.edge)', tall.problems.map((q) => q.code).join());
  }

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
