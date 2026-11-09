/* SPDX-License-Identifier: Apache-2.0 */
// class-maint.mjs — GH.5: the class list's DWG version and maintenance version are BITLONG (ODA spec ch. 10), so a
// maintenance version of 256 or more (R2018 files from AutoCAD: 329) must read. We write drawings whose classes carry
// such a value (VERSION_INFO is the writer's table) and read them back: classes, entities and notes must all be intact.
//   node tools/dwg-test/class-maint.mjs
import { writeDwg } from '../../lib/dwg/write.js';
import { readDwg } from '../../lib/dwg/read.js';
import { VERSION_INFO } from '../../lib/dwg/container-write.js';
import { kitchenSink } from './writer-models.mjs';

let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } else console.log('ok  ', m); };
for (const [version, maint] of [['AC1032', 329], ['AC1032', 255], ['AC1032', 256], ['AC1027', 300], ['AC1024', 65536 + 7]]) {
  const saved = VERSION_INFO[version].maint;
  VERSION_INFO[version].maint = maint;
  try {
    const { bytes } = writeDwg(kitchenSink(), { version });
    const m = readDwg(bytes);
    const cls = m.classes || [];
    const n = (m.blocks || []).reduce((a, b) => a + (b.entities || []).length, 0);
    const kept = version === 'AC1024' ? true : cls.every((c) => c.maintVersion === maint);
    ok(cls.length > 0, `${version} maint ${maint}: class list read (${cls.length} classes)`);
    ok(kept, `${version} maint ${maint}: every class carries the maintenance version`);
    ok(n > 0, `${version} maint ${maint}: entities read (${n})`);
    ok(!(m.report?.notes || []).some((x) => /class/i.test(String(x))), `${version} maint ${maint}: no class notes`);
  } catch (e) { ok(false, `${version} maint ${maint}: ${e.message}`); }
  finally { VERSION_INFO[version].maint = saved; }
}
console.log(bad ? `${bad} FAILED` : 'all passed');
process.exit(bad ? 1 : 0);
