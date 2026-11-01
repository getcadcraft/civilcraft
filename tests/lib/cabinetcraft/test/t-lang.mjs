/* SPDX-License-Identifier: Apache-2.0 */
// Every word the add-on shows is in lang/en.json: keys written in the code, key families built from lists, and the library's names.
const { ok, section, ADDON, EN, mine } = globalThis.__ccTest;
import fs from 'node:fs';
import path from 'node:path';

section('Language file');
{
  const files = ['main.js', 'host.js', 'lib/ui.js', 'lib/checks.js', 'lib/drawings.js', 'lib/bodies3d.js', 'lib/cadents.js'];
  const used = new Set();
  for (const f of files) {
    const src = fs.readFileSync(path.join(ADDON, f), 'utf8');
    for (const m of src.matchAll(/\b(?:t|T)\(\s*'([a-z][A-Za-z0-9.\-]*)'/g)) used.add(m[1]);
  }
  const missing = [...used].filter((k) => !k.endsWith('.') && !(k in EN));   // 'view.' + v is a family: checked below
  ok(missing.length === 0, used.size + ' keys written in the code are all in en.json', missing.join(', '));
  const C = await mine('lib/catalog.js'), M = await mine('lib/materials.js'), U = await mine('lib/ui.js'), P = await mine('lib/project.js');
  const fam = [];
  for (const x of C.TEMPLATES) fam.push(x.name);
  for (const m of M.MATERIALS) fam.push(m.name);
  for (const b of M.BANDS) fam.push(b.name);
  for (const v of U.VIEWS) fam.push('view.' + v);
  for (const w of P.WALLS) fam.push('wall.' + w);
  for (const g of ['base', 'tall', 'wall']) fam.push('group.' + g);
  for (const k of ['carcass', 'back', 'fronts', 'drawer', 'drawerBottom', 'frame', 'bandCarcass', 'bandFront', 'bandDrawer']) fam.push('pick.' + k);
  for (const k of ['side', 'bottom', 'top', 'rail-front', 'rail-back', 'back', 'shelf', 'shelf-fixed', 'door', 'drawer-front', 'drawer-side', 'drawer-end', 'drawer-bottom', 'plinth', 'kick-board', 'filler', 'end-panel', 'frame-stile', 'frame-rail', 'frame-mid-rail', 'blind-panel']) fam.push('part.' + k);
  for (const k of ['hinge', 'plate', 'shelf-pin', 'slide', 'leg', 'bracket', 'pull', 'fastener']) fam.push('hw.' + k);
  for (const k of ['sheets', 'band', 'frame', 'hardware', 'counter', 'labour', 'install', 'machine', 'subtotal', 'markup', 'tax', 'total']) fam.push('est.' + k);
  for (const k of ['sheet', 'm', 'each', 'hour']) fam.push('est.u.' + k);
  for (const k of ['too-narrow', 'too-low', 'too-shallow', 'no-slide', 'drawer-low', 'fronts-tall', 'no-size']) fam.push('prob.cab.' + k);
  for (const k of ['a4-24', 'a4-14', 'letter-30', 'letter-10', 'roll-100x50', 'roll-4x2in']) fam.push('label.' + k);
  for (const k of ['id', 'name', 'group', 'material', 'thickness', 'length', 'width', 'qty', 'grain', 'l1', 'l2', 'w1', 'w2', 'cutLength', 'cutWidth', 'note']) fam.push('csv.cut.' + k);
  for (const k of ['part', 'name', 'face', 'kind', 'x', 'y', 'diameter', 'depth', 'side', 'qty', 'note']) fam.push('csv.drill.' + k);
  for (const k of ['item', 'spec', 'qty']) fam.push('csv.hw.' + k);
  for (const k of ['what', 'detail', 'qty', 'unit', 'rate', 'amount', 'placeholder']) fam.push('csv.est.' + k);
  for (const k of ['what', 'qty', 'rate', 'amount']) fam.push('cost.col.' + k);
  for (const k of ['kickH', 'kickSetback', 'reveal', 'wallElev', 'shelfFront', 'railDepth', 'maxDoorW', 'maxDoorH', 'slideGap', 'back', 'kick']) fam.push('rule.' + k);
  for (const k of ['stile', 'rail', 'overlay', 'gap']) fam.push('ff.' + k);
  for (const k of ['gap', 'filler', 'endpanel']) fam.push('item.' + k);
  for (const k of ['h', 'd', 'hinge', 'construction', 'shelves', 'doors', 'drawers', 'blind', 'elev', 'note']) fam.push('cab.' + k);
  for (const k of ['rect', 'L', 'U', 'free']) fam.push('room.shape.' + k.toLowerCase());
  for (const k of ['NE', 'NW', 'SE', 'SW', 'N', 'S', 'E', 'W']) fam.push('room.at.' + k.toLowerCase());
  for (const k of [0, 90, 180, 270]) fam.push('island.rot.' + k);
  for (const k of ['counter', 'floor', 'wall', 'window', 'door']) fam.push('bodies.' + k);
  for (const k of ['unknown', 'bad']) fam.push('cost.import.' + k);
  for (const k of ['triangle', 'round']) fam.push('note.corner.' + k);
  for (const k of ['collide', 'outside', 'opening', 'under-window', 'opening-tight', 'door-swing']) fam.push('prob.cab.' + k);
  for (const k of ['misplaced', 'small', 'double', 'drillsize', 'angle.angle', 'angle.arc', 'angle.size', 'sharp', 'wedge', 'diag']) fam.push('prob.corner.' + k);
  for (const k of ['invalid', 'over', 'gap.bay', 'gap.bow', 'void', 'wedge']) fam.push('prob.arc.' + k);
  for (const k of ['straight', 'order']) fam.push('prob.curved.' + k);
  for (const k of ['empty', 'units', 'relative', 'no-tool', 'no-spindle', 'no-feed', 'rapid-in-stock', 'outside', 'outside-z', 'deep', 'hole.nopart', 'hole.outside', 'hole.edge', 'hole.deep', 'hole.blank']) fam.push('dry.' + k);
  for (const k of ['sheet', 'sheet-other', 'band', 'band-other', 'hardware', 'hardwood', 'counter', 'labour', 'machine', 'made-to-order', 'markup', 'tax', 'currency']) fam.push('cost.cat.' + k);
  for (const k of ['fixing-dia', 'fixing-depth', 'shaft-dia', 'shaft-depth', 'pivot-dia', 'pivot-depth']) fam.push('hw.size.' + k);
  for (const k of ['dowel']) fam.push('hw.' + k);
  for (const k of ['path', 'value', 'placeholder']) fam.push('csv.rates.' + k);
  for (const k of ['kind.island', 'kind.peninsula']) fam.push('island.' + k);
  const miss2 = fam.filter((k) => !(k in EN));
  ok(miss2.length === 0, fam.length + ' keys from lists (templates, materials, parts, hardware, estimate rows, CSV headings …) are all in en.json', miss2.join(', '));
  const bad = Object.entries(EN).filter(([k, v]) => !k.startsWith('@') && (typeof v !== 'string' || !v.trim()));
  ok(bad.length === 0, 'no empty strings', bad.map((x) => x[0]).join());
  // model's own part names and the add-on's: every part name key that buildJob can produce
  const B = await mine('lib/build.js');
  const all = new Set();
  for (const cons of ['frameless', 'faceframe']) {
    const proj = P.cleanProject({ unit: 'mm', construction: cons, room: { w: 5000, d: 3000, h: 2400 }, runs: [{ id: 'A', wall: 'S', from: 300, to: 4000, base: C.TEMPLATES.filter((x) => x.group !== 'wall').map((x) => ({ kind: 'cab', tpl: x.id, w: x.def.w })), upper: C.TEMPLATES.filter((x) => x.group === 'wall').map((x) => ({ kind: 'cab', tpl: x.id, w: x.def.w })) }] });
    for (const x of B.buildJob(proj).parts) all.add(x.nameKey);
    for (const x of B.buildJob(proj).hardware) all.add(x.item);
  }
  const miss3 = [...all].filter((k) => !(k in EN));
  ok(miss3.length === 0, [...all].length + ' part and hardware names every template can produce are all in en.json', miss3.join(', '));
  ok(Object.keys(EN).length > 300, 'the file has ' + Object.keys(EN).length + ' entries');
  // {vars} in a value are words the code gives: check the common ones are spelled the same
  const vars = new Set(); for (const v of Object.values(EN)) for (const m of String(v).matchAll(/\{(\w+)\}/g)) vars.add(m[1]);
  ok(['unit', 'no', 'n', 'run', 'min', 't'].every((v) => vars.has(v)), 'placeholders in use: ' + [...vars].join(' '));
}
