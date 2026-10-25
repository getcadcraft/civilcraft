/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-test.mjs — BimCraft for building operations and energy (0.7, session `bim-ops`: LC.12 + LC.20), DOM-free, run by
 *   node bin/test-bimcraft.mjs --ops [--only docs,cobie,sensors,feeds,vsc,solar,grid,energy]
 * Each part lives in its own ops-<part>.mjs. Saved IFCs are checked by IfcOpenShell at the end when its venv is here
 * (tools/bimcraft-test/ifc_validate.py), as extra2-test.mjs does.
 */
import fs from 'node:fs';
import path from 'node:path';

export const PARTS = ['docs', 'cobie', 'sensors', 'feeds', 'vsc', 'solar', 'grid', 'energy', 'idf'];

export async function opsMode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(String(args[i + 1] || '').split(',')) : null; })();
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
  const saved = {};
  const open = async (text) => {
    const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(typeof text === 'string' ? new TextEncoder().encode(text) : text);
    return new IfcEditor(WebIFC, eng);
  };
  const ctx = { APP, ROOT, WebIFC, IfcModel, quiet, ok, near, saved, open };
  for (const p of [...PARTS, ...(only?.has('showcase') ? ['showcase'] : [])]) {   // showcase: explicit only (it writes the fixture once)
    if (only && !only.has(p)) continue;
    const f = path.join(ROOT, 'tools/bimcraft-test/ops-' + p + '.mjs');
    if (!fs.existsSync(f)) continue;
    await (await import(f)).default(ctx);
  }

  const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
  if (Object.keys(saved).length && py) {
    const { execFileSync } = await import('node:child_process');
    const dir = fs.mkdtempSync(path.join(ROOT, 'tmp', 'ops-'));
    for (const [name, bytes] of Object.entries(saved)) {
      const f = path.join(dir, name + '.ifc');
      fs.writeFileSync(f, bytes);
      let out = '';
      try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), f], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || e.message); }
      let r = null;
      try { r = JSON.parse(out.trim().split('\n').pop()); } catch { r = null; }
      ok(r && r.errors === 0, 'IfcOpenShell: ' + name + ' (' + (r?.schema || '?') + ') validates, 0 errors', r ? r.first.join(' | ') : out.slice(0, 300));
    }
    fs.rmSync(dir, { recursive: true, force: true });
  } else if (Object.keys(saved).length) console.log('  --   no venv with ifcopenshell: schema validation skipped');

  console.log(`\nops: ${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}

/** A small IFC2X3 file: one storey, a furnishing element "Boiler B-1" with a type that carries a manual. */
export const IFC2X3_SMALL = `ISO-10303-21;
HEADER;FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');FILE_NAME('a.ifc','2026-10-23T12:00:00',(''),(''),'test','test','');FILE_SCHEMA(('IFC2X3'));ENDSEC;
DATA;
#1=IFCPERSON($,$,'',$,$,$,$,$);
#2=IFCORGANIZATION($,'Test',$,$,$);
#3=IFCPERSONANDORGANIZATION(#1,#2,$);
#4=IFCAPPLICATION(#2,'1','Test','Test');
#5=IFCOWNERHISTORY(#3,#4,$,.ADDED.,$,$,$,0);
#6=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);
#7=IFCUNITASSIGNMENT((#6));
#8=IFCCARTESIANPOINT((0.,0.,0.));
#9=IFCAXIS2PLACEMENT3D(#8,$,$);
#10=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#9,$);
#11=IFCPROJECT('0YvctVUKr0kugbFTf53O9L',#5,'P',$,$,$,$,(#10),#7);
#12=IFCLOCALPLACEMENT($,#9);
#13=IFCSITE('1YvctVUKr0kugbFTf53O9L',#5,'Site',$,$,#12,$,$,.ELEMENT.,$,$,$,$,$);
#14=IFCBUILDING('2YvctVUKr0kugbFTf53O9L',#5,'B',$,$,#12,$,$,.ELEMENT.,$,$,$);
#15=IFCBUILDINGSTOREY('3YvctVUKr0kugbFTf53O9L',#5,'Ground',$,$,#12,$,$,.ELEMENT.,0.);
#16=IFCRELAGGREGATES('4YvctVUKr0kugbFTf53O9L',#5,$,$,#11,(#13));
#17=IFCRELAGGREGATES('5YvctVUKr0kugbFTf53O9L',#5,$,$,#13,(#14));
#18=IFCRELAGGREGATES('6YvctVUKr0kugbFTf53O9L',#5,$,$,#14,(#15));
#19=IFCFURNISHINGELEMENT('7YvctVUKr0kugbFTf53O9L',#5,'Boiler B-1',$,$,#12,$,'B-1');
#20=IFCRELCONTAINEDINSPATIALSTRUCTURE('8YvctVUKr0kugbFTf53O9L',#5,$,$,(#19),#15);
#21=IFCFURNITURETYPE('9YvctVUKr0kugbFTf53O9L',#5,'Boiler type',$,$,$,$,$,$,.NOTDEFINED.);
#22=IFCRELDEFINESBYTYPE('AYvctVUKr0kugbFTf53O9L',#5,$,$,(#19),#21);
#23=IFCDOCUMENTREFERENCE('https://example.com/boiler-manual.pdf',$,'Boiler manual');
#24=IFCRELASSOCIATESDOCUMENT('BYvctVUKr0kugbFTf53O9L',#5,$,$,(#21),#23);
ENDSEC;
END-ISO-10303-21;
`;
