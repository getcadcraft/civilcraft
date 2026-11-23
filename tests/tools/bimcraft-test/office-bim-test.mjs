/* SPDX-License-Identifier: Apache-2.0 */
/** office-bim-test.mjs — BimCraft reads the office standard (BK.181 BimCraft half, 0.11 bim-inbox-11):  node bin/test-bimcraft.mjs --office */
import path from 'node:path';
import fs from 'node:fs';
import { HOUSE as H } from './make-small-house.mjs';

export async function officeBimMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (c, m, d = '') => { if (!c) bad++; console.log((c ? '  ok   ' : '  FAIL ') + m + (!c && d !== '' ? ' (' + d + ')' : '')); };
  const O = await import(path.join(APP, 'office-bim.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const open = async (bytes) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(bytes);
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  };
  const B = await open(new Uint8Array(fs.readFileSync(path.join(ROOT, H.file))));
  ok(O.readOfficeRecord(B.w()) === null && O.officeOf(B.w()).from === 'none' && O.officeStrip(B.w()).length === 0 && O.officeLayers(B.w()).add.length === 0, 'no record, no policies: an empty standard, nothing added to the title block or layers');
  const rec = { format: 'cc-office-standard', version: 1, name: 'Office', annotation: { heights: { dimension: 2.5 } },
    titleBlock: { paper: 'a1', fields: [{ key: 'firm', label: 'Firm', value: 'Acme Architects' }, { key: 'checked', label: 'Checked', value: '' }] },
    drawingLayers: [{ name: 'A-WALL', color: '#ff0000', purpose: 'walls' }, { name: 'A-DOOR', color: '#00ff00', purpose: 'doors' }] };
  let key = ''; try { B.ed.modelChange(O.saveOfficeRecord({ format: 'cc-office-standard', version: 1 })); } catch (e) { key = e.key; }
  ok(key === 'model.err.office.empty', 'a record that states nothing is refused');
  B.ed.modelChange(O.saveOfficeRecord(rec));
  const o = O.officeOf(B.w());
  ok(o.from === 'project' && o.standard.annotation.heights.dimension === 2.5, 'saved: the building\'s own record is the standard in force', o.from);
  ok(JSON.stringify(O.officeStrip(B.w())) === '["Firm: Acme Architects"]', 'the title block strip takes the fields that carry a value');
  const lp = O.officeLayers(B.w());
  ok(lp.add.length === 2 && lp.add[0].name === 'A-WALL', 'the layer plan lists the office layers the building lacks', JSON.stringify(lp));
  const back = await open(B.ed.save());
  ok(O.officeOf(back.w()).from === 'project' && O.officeStrip(back.w()).length === 1, 'saved as IFC and opened again: the record travels with the file');
  B.ed.undo();
  ok(O.readOfficeRecord(B.w()) === null || O.officeOf(B.w()).from !== 'project', 'one Undo takes the record away');
  B.ed.modelChange(O.saveOfficeRecord(rec)); B.ed.modelChange(O.clearOfficeRecord());
  ok(O.officeOf(B.w()).from === 'none', 'Clear drops the record');
  console.log(bad ? `\n${bad} failed` : '\nall ok');
  return bad ? 1 : 0;
}
