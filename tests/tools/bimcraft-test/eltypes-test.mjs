/* SPDX-License-Identifier: Apache-2.0 */
/**
 * eltypes-test.mjs — generic starter types and the sketch band (BK.15), floor / roof / ceiling types with layers and the per-layer
 * quantities (BK.24), the room a device stands in (BK.22), an asset linked to a symbol (BK.23). Session bk-r3-types-10. DOM-free:
 *   node bin/test-bimcraft.mjs --eltypes
 * Real IFC models made by the app's own operations. Every expected value is worked out in the comment beside it.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function elTypesMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
  const imp = (f) => import(path.join(APP, f));
  const { ModelWriter } = await imp('model-write.js');
  const OPS = await imp('model-ops.js');
  const MW = await imp('model-walls.js');
  const MF = await imp('model-floors.js');
  const MS = await imp('model-slabs.js');
  const WA = await imp('wall-assemblies.js');
  const ET = await imp('element-types.js');
  const EO = await imp('element-type-ops.js');
  const LQ = await imp('layer-quantities.js');
  const QS = await imp('quantity-schedules.js');
  const WPG = await imp('wall-plan-graphics.js');
  const PM = await imp('project-materials.js');
  const TP = await imp('type-pack.js');
  const TLI = await imp('type-library-item.js');
  const RL = await imp('room-lookup.js');
  const RE = await imp('res-elec.js');
  const AS = await imp('asset-symbol.js');
  const PS = await imp('plan-symbols.js');
  const QM = await imp('quantity-method.js');
  const U = await imp('model-units.js');
  const I18 = await imp('i18n.js');
  const { IfcEditor } = await imp('ifc-edit.js');
  const N = await imp('new-model.js');
  I18.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const t = I18.t;
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const fresh = (name, levels = 1, h = 3000) => boot(new TextEncoder().encode(N.newBuilding({ name, levels: N.stackLevels(levels, h, (i) => 'Level ' + (i + 1)), fileName: 'e.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const W = (ed) => new ModelWriter(WebIFC, ed.api, ed.mid);
  const snap = (ed) => OPS.snapshotModel(ed);
  const fmt = { fmtLen: (mm) => U.fmtLen(mm, 'mm'), fmtArea: (a) => U.fmtArea(a, 'mm'), t, unit: U.unitMark('mm'), metric: true };
  const save = (ed) => new TextDecoder().decode(ed.save());
  const tryKey = (fn) => { try { fn(); return null; } catch (e) { return e.key || e.message; } };
  const room = (ed, typeKey = 'int-2x4', x0 = 0, w = 5000, d = 4000) => { const L = snap(ed).levels[0]; ed.modelChange(OPS.drawWalls({ storey: L.guid, segs: [{ a: [x0, 0], b: [x0 + w, 0] }, { a: [x0 + w, 0], b: [x0 + w, d] }, { a: [x0 + w, d], b: [x0, d] }, { a: [x0, d], b: [x0, 0] }], typeKey, height: 2700 })); return L; };
  const layersOf = (ed, measure = null) => { const w = W(ed), s = snap(ed), loops = new Map(), lf = (id) => { if (!loops.has(id)) loops.set(id, OPS.loopsOf(ed, id)); return loops.get(id); }; const inp = LQ.layerInputs(w, s, lf); return LQ.layerQuantities(s, { ...inp, measure, t }); };

  await (await import('./eltypes-parts.mjs')).run({ ok, near, APP, ROOT, WebIFC, IfcModel, quiet, IfcEditor, fresh, boot, W, snap, fmt, save, tryKey, room, layersOf, t,
    OPS, MW, MF, MS, WA, ET, EO, LQ, QS, WPG, PM, TP, TLI, RL, RE, AS, PS, QM, U, N });

  console.log(`\n${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
