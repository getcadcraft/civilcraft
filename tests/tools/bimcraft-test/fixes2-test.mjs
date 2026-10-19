/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fixes2-test.mjs — BimCraft's 0.6 round-2 fixes (session `bim-fixes_PART_2`), DOM-free, run by
 *   node bin/test-bimcraft.mjs --fixes2
 *   dc53   section caps: which elements are closed is judged over every batch an element is in (caps-closed.js
 *          openAcross) — an element whose parts have different colours lands in several batches, each part open alone
 */
import fs from 'node:fs';
import path from 'node:path';

export async function fixes2Mode({ APP, ROOT, WebIFC, IfcModel, quiet, args }) {
  let good = 0, bad = 0;
  const ok = (c, m) => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
  const want = (k) => !args.includes('--only') || args[args.indexOf('--only') + 1].split(',').includes(k);

  if (want('dc53')) {
    console.log('== DC.53 section caps: elements closed over all their batches');
    const C = await import(path.join(APP, 'caps-closed.js'));
    const text = splitBoxIfc();
    const engine = await quiet(IfcModel.create)(WebIFC, null);
    const model = await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
    const solid = model.batches.filter((b) => !b.space);
    const holds = (b, id) => b.triIds.some((x) => x === id);
    const key = model.keyBase + SPLIT_ID, keyWhole = model.keyBase + WHOLE_ID, keySheet = model.keyBase + SHEET_ID;
    const mine = solid.filter((b) => holds(b, key));
    ok(mine.length === 2, 'the split box (two shells, two colours) lands in two batches: ' + mine.length);
    ok(mine.every((b) => C.openElements(b.positions, b.indices, b.triIds).has(key)), 'each half alone is open (what the caps judged before)');
    const open = C.openAcross(solid);
    ok(!open.has(key), 'over both batches the split box is closed, so the cut fills it');
    ok(!open.has(keyWhole), 'a box in one colour is closed');
    ok(open.has(keySheet), 'an open sheet stays open (no cut colour painted over it)');
    // the cheap path: elements in one batch are never re-checked, and a model of one-colour elements gives the same set
    const one = solid.filter((b) => !holds(b, key));
    const per = new Set(one.flatMap((b) => [...C.openElements(b.positions, b.indices, b.triIds)]));
    ok([...C.openAcross(one)].sort().join() === [...per].sort().join(), 'with no element split, openAcross = the per-batch answer');
    ok(C.openAcross([]).size === 0, 'no batches: nothing open');
  }

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}

export const SPLIT_ID = 1000, WHOLE_ID = 1001, SHEET_ID = 1002;
/** An IFC4 model (mm): a 1 m box made of two open shells styled red and blue (#1000, x 0–1000), a red box in one shell
 *  (#1001, x 2000–3000), and an open sheet on the floor (#1002, x 4000–5000). Generated here; no client file. */
export function splitBoxIfc() {
  const L = [];
  let n = 0, g = 0;
  const add = (s, id) => { const k = id ?? ++n; L.push('#' + k + '=' + s + ';'); return '#' + k; };
  const gid = () => "'" + String(++g).padStart(22, '0').replace(/^0/, '1') + "'";
  const o = add('IFCCARTESIANPOINT((0.,0.,0.))');
  const w = add(`IFCAXIS2PLACEMENT3D(${o},$,$)`);
  const ctx = add(`IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,${w},$)`);
  const body = add(`IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,${ctx},$,.MODEL_VIEW.,$)`);
  const ua = add(`IFCUNITASSIGNMENT((${add('IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)')}))`);
  const proj = add(`IFCPROJECT(${gid()},$,'Split',$,$,$,$,(${ctx}),${ua})`);
  const sp = add(`IFCLOCALPLACEMENT($,${w})`);
  const site = add(`IFCSITE(${gid()},$,'Site',$,$,${sp},$,$,.ELEMENT.,$,$,$,$,$)`);
  const bldg = add(`IFCBUILDING(${gid()},$,'B',$,$,${sp},$,$,.ELEMENT.,$,$,$)`);
  const st = add(`IFCBUILDINGSTOREY(${gid()},$,'Level 1',$,$,${sp},$,$,.ELEMENT.,0.)`);
  const style = (r, gg, b) => add(`IFCSURFACESTYLE($,.BOTH.,(${add(`IFCSURFACESTYLESHADING(${add(`IFCCOLOURRGB($,${r},${gg},${b})`)},0.)`)}))`);
  const red = style(0.8, 0.1, 0.1), blue = style(0.1, 0.1, 0.8);
  const P = (x, y, z) => add(`IFCCARTESIANPOINT((${x}.,${y}.,${z}.))`);
  const face = (pts) => add(`IFCFACE((${add(`IFCFACEOUTERBOUND(${add(`IFCPOLYLOOP((${pts.join(',')}))`)},.T.)`)}))`);
  /** The six faces of a box [x0, x0 + s]³, outward. */
  const boxFaces = (x0, s) => {
    const v = (i, j, k) => P(x0 + i * s, j * s, k * s);
    const c = [v(0, 0, 0), v(1, 0, 0), v(1, 1, 0), v(0, 1, 0), v(0, 0, 1), v(1, 0, 1), v(1, 1, 1), v(0, 1, 1)];
    const q = (a, b, cc, d) => face([c[a], c[b], c[cc], c[d]]);
    return { bottom: q(0, 3, 2, 1), top: q(4, 5, 6, 7), front: q(0, 1, 5, 4), back: q(2, 3, 7, 6), left: q(3, 0, 4, 7), right: q(1, 2, 6, 5) };
  };
  const shell = (faces, sty) => {
    const it = add(`IFCSHELLBASEDSURFACEMODEL((${add(`IFCOPENSHELL((${faces.join(',')}))`)}))`);
    add(`IFCSTYLEDITEM(${it},(${sty}),$)`);
    return it;
  };
  const shape = (items) => add(`IFCPRODUCTDEFINITIONSHAPE($,$,(${add(`IFCSHAPEREPRESENTATION(${body},'Body','SurfaceModel',(${items.join(',')}))`)}))`);
  const proxy = (id, name, items) => add(`IFCBUILDINGELEMENTPROXY(${gid()},$,'${name}',$,$,${sp},${shape(items)},$,$)`, id);
  const a = boxFaces(0, 1000), b = boxFaces(2000, 1000), c = boxFaces(4000, 1000);
  proxy(SPLIT_ID, 'Split box', [shell([a.bottom, a.front, a.left], red), shell([a.top, a.back, a.right], blue)]);
  proxy(WHOLE_ID, 'Whole box', [shell(Object.values(b), red)]);
  proxy(SHEET_ID, 'Sheet', [shell([c.bottom], red)]);
  n = 2000;
  add(`IFCRELAGGREGATES(${gid()},$,$,$,${proj},(${site}))`);
  add(`IFCRELAGGREGATES(${gid()},$,$,$,${site},(${bldg}))`);
  add(`IFCRELAGGREGATES(${gid()},$,$,$,${bldg},(${st}))`);
  add(`IFCRELCONTAINEDINSPATIALSTRUCTURE(${gid()},$,$,$,(#${SPLIT_ID},#${WHOLE_ID},#${SHEET_ID}),${st})`);
  return "ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION((''),'2;1');\nFILE_NAME('split.ifc','2026-10-18T00:00:00',(''),(''),'','','');\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\n" + L.join('\n') + '\nENDSEC;\nEND-ISO-10303-21;\n';
}
