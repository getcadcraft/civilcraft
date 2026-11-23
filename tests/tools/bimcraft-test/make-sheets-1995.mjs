#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-sheets-1995.mjs — the two test models for suggestion #1995 (Sheets on large models; perf-finish-11, lane bim). Made once with
 * BimCraft's own code (new-model.js + model-ops.js drawWalls through the editor, as a person draws), then columns and rebar written as
 * plain IFC lines (IfcColumn extrusions; IfcReinforcingBar = IfcSweptDiskSolid along a polyline, 8 bars a column), as a structural export
 * brings them. Never regenerated: refuses to overwrite (testfiles/LARGE-FILES.md).
 *   node tools/bimcraft-test/make-sheets-1995.mjs        → testfiles/generated/sheets1995/{walls-3500.ifc, structural-rebar-2500.ifc}
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = '/var/www/CADCRAFT/getcadcraft.com', APP = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
const OUT = path.join(ROOT, 'testfiles/generated/sheets1995');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
register('data:text/javascript,' + encodeURIComponent(`import { pathToFileURL } from 'node:url';
export async function resolve(spec, ctx, next) {
  if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true };
  if (spec === 'proj4') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/proj4/current/proj4.esm.min.js')).href)}, shortCircuit: true };
  if (spec === 'delaunator') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/delaunator/current/index.js')).href)}, shortCircuit: true };
  if (spec === 'robust-predicates') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/robust-predicates/current/index.js')).href)}, shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);
const WebIFC = await import(path.join(APP, 'ifc/api.js'));
const { IfcModel } = await import(path.join(APP, 'ifc-model.js'));
const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
const N = await import(path.join(APP, 'new-model.js'));
const OPS = await import(path.join(APP, 'model-ops.js'));
const quiet = (f) => async (...a) => { const l = console.log; console.log = () => {}; try { return await f(...a); } finally { console.log = l; } };
fs.mkdirSync(OUT, { recursive: true });

/** A building of `levels` levels, each a grid of rooms (nx × ny bays of `bay` mm) drawn as walls: outside walls + partitions. */
async function wallsModel(name, { levels, nx, ny, bay }) {
  const text = N.newBuilding({ name, levels: N.stackLevels(levels, 3200, (i) => 'Level ' + (i + 1)), fileName: name + '.ifc', now: new Date('2026-11-21T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null, { manifold: false });
  await quiet((b) => eng.load(b, () => {}, { worker: false }))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  const lv = OPS.snapshotModel(ed).levels;
  for (const L of lv) {
    const segs = [];
    for (let i = 0; i <= nx; i++) for (let j = 0; j < ny; j++) segs.push({ a: [i * bay, j * bay], b: [i * bay, (j + 1) * bay] });
    for (let j = 0; j <= ny; j++) for (let i = 0; i < nx; i++) segs.push({ a: [i * bay, j * bay], b: [(i + 1) * bay, j * bay] });
    ed.modelChange(OPS.drawWalls({ storey: L.guid, segs, typeKey: 'int-100', height: 3000 }), { label: 'walls' });
  }
  return { ed, eng, lv };
}

function add(f, lines) { let id = f.maxId; const out = []; for (const l of lines) { id++; out.push(l.replace(/#N(\d+)/g, (_, k) => '#' + (id - Number(k)))); } return out; }

const make = async (file, spec, rebar) => {
  const p = path.join(OUT, file);
  if (fs.existsSync(p)) { console.log('exists, not overwritten: ' + p); return; }
  const t0 = Date.now();
  const { ed, eng, lv } = await wallsModel(file.replace(/\.ifc$/, ''), spec);
  let text = new TextDecoder().decode(ed.save({ timeStamp: '2026-11-21T12:00:00' }));
  if (rebar) {
    // columns at every grid crossing of each level, 8 bars (12 mm) in each: plain IFC lines, one IfcRelContainedInSpatialStructure per level
    const f = eng.api.file(eng.modelID);
    let next = f.maxId + 1;
    const L = [];
    const N1 = () => next++;
    const ctx = f.ofType('IFCGEOMETRICREPRESENTATIONCONTEXT')[0];
    const oh = f.ofType('IFCOWNERHISTORY')[0];
    const g = () => { const c = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$'; let s = ''; for (let i = 0; i < 22; i++) s += c[(next * 7 + i * 13 + s.length * 31) % 64]; return s; };
    const dirZ = N1(); L.push(`#${dirZ}=IFCDIRECTION((0.,0.,1.));`);
    const dirX = N1(); L.push(`#${dirX}=IFCDIRECTION((1.,0.,0.));`);
    const prof = N1(); L.push(`#${prof}=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,300.,300.);`);
    for (const lvl of lv) {
      const st = eng.api.GetLine(eng.modelID, lvl.id, false), stPl = st.ObjectPlacement.value;
      const kids = [];
      for (let i = 0; i <= spec.nx; i += 2) for (let j = 0; j <= spec.ny; j += 2) {
        const x = i * spec.bay + 400, y = j * spec.bay + 400;   // beside the wall crossing, so the column is its own solid
        const pt = N1(); L.push(`#${pt}=IFCCARTESIANPOINT((${x}.,${y}.,0.));`);
        const ax = N1(); L.push(`#${ax}=IFCAXIS2PLACEMENT3D(#${pt},#${dirZ},#${dirX});`);
        const lp = N1(); L.push(`#${lp}=IFCLOCALPLACEMENT(#${stPl},#${ax});`);
        const o = N1(); L.push(`#${o}=IFCCARTESIANPOINT((0.,0.,0.));`);
        const a0 = N1(); L.push(`#${a0}=IFCAXIS2PLACEMENT3D(#${o},$,$);`);
        const ex = N1(); L.push(`#${ex}=IFCEXTRUDEDAREASOLID(#${prof},#${a0},#${dirZ},3000.);`);
        const sr = N1(); L.push(`#${sr}=IFCSHAPEREPRESENTATION(#${ctx},'Body','SweptSolid',(#${ex}));`);
        const ps = N1(); L.push(`#${ps}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${sr}));`);
        const col = N1(); L.push(`#${col}=IFCCOLUMN('${g()}',#${oh},'Column ${lvl.name} ${i}/${j}',$,$,#${lp},#${ps},$,.COLUMN.);`); kids.push(col);
        for (let b = 0; b < 8; b++) {
          const ang = (b / 8) * 2 * Math.PI, bx = (Math.cos(ang) * 110).toFixed(1), by = (Math.sin(ang) * 110).toFixed(1);
          const p0 = N1(); L.push(`#${p0}=IFCCARTESIANPOINT((${bx},${by},50.));`);
          const p1 = N1(); L.push(`#${p1}=IFCCARTESIANPOINT((${bx},${by},2950.));`);
          const p2 = N1(); L.push(`#${p2}=IFCCARTESIANPOINT((${(Number(bx) * 0.6).toFixed(1)},${(Number(by) * 0.6).toFixed(1)},3150.));`);
          const pl = N1(); L.push(`#${pl}=IFCPOLYLINE((#${p0},#${p1},#${p2}));`);
          const sd = N1(); L.push(`#${sd}=IFCSWEPTDISKSOLID(#${pl},6.,$,$,$);`);
          const br = N1(); L.push(`#${br}=IFCSHAPEREPRESENTATION(#${ctx},'Body','AdvancedSweptSolid',(#${sd}));`);
          const bp = N1(); L.push(`#${bp}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${br}));`);
          const bar = N1(); L.push(`#${bar}=IFCREINFORCINGBAR('${g()}',#${oh},'Bar ${b + 1}',$,$,#${lp},#${bp},$,$,12.,113.1,3100.,.MAIN.,.TEXTURED.);`); kids.push(bar);
        }
      }
      const rel = N1(); L.push(`#${rel}=IFCRELCONTAINEDINSPATIALSTRUCTURE('${g()}',#${oh},$,$,(${kids.map((k) => '#' + k).join(',')}),#${lvl.id});`);
    }
    text = text.replace(/ENDSEC;\nEND-ISO-10303-21;\n$/, () => L.join('\n') + '\nENDSEC;\nEND-ISO-10303-21;\n');   // a function: the GlobalIds hold '$' (a replacement string would read "$'")
  }
  fs.writeFileSync(p, text);
  const n = (re) => (text.match(re) || []).length;
  console.log(`${file}: ${(text.length / 1048576).toFixed(1)} MB, ${n(/=IFCWALL\w*\(/g)} walls, ${n(/=IFCCOLUMN\(/g)} columns, ${n(/=IFCREINFORCINGBAR\(/g)} bars, ${lv.length} levels, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
};
// #1995 (1): "about 3,500 elements" — 5 levels of 13 × 13 bays = 5 × 364 = 1,820 walls is too few; 5 levels × (19 × 18 × 2 + 37) ≈ 3,600 walls
await make('walls-3500.ifc', { levels: 5, nx: 18, ny: 18, bay: 3000 }, false);
// #1995 (2): "about 2,500 elements with rebar" — 4 levels × (5 × 5 bays: 60 walls, 9 columns × 9 = 81 elements) ≈ 2,400 + 240 walls
await make('structural-rebar-2500.ifc', { levels: 4, nx: 10, ny: 10, bay: 4000 }, true);
