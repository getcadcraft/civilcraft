#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * family-types-test.mjs — PO.4: family types as variants, type catalogs, a family's data on another file's shape. Node, no browser.
 *   node tools/bimcraft-test/family-types-test.mjs
 * The multi-type family XML here is WRITTEN FOR THE TEST in the layout a real family file uses (checked against the one real family in
 * testfiles/samples, which has a single type): no real multi-type family or real type catalog has been read yet.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(REPO, 'public_html/assets/apps/bimcraft/dev');
const L = await import(path.join(APP, 'libitem.js'));
const R = await import(path.join(APP, 'rvt-reader.js'));
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const xml = `<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:A="urn:schemas-autodesk-com:partatom"><title>Work table</title><updated>2026-01-01T00:00:00Z</updated>
<category><term>Furniture</term><scheme>adsk:revit:grouping</scheme></category>
<A:features><A:feature><A:title>Family Parameters</A:title><A:group><A:title>Identity Data</A:title><Manufacturer displayName="Manufacturer" type="system" typeOfParameter="Text">Example Co.</Manufacturer></A:group></A:feature></A:features>
<A:family type="user"><A:variationCount>3</A:variationCount>
<A:part type="user"><title>1200 x 600</title><Width displayName="Width" type="custom" typeOfParameter="Length">1200 mm</Width><Depth displayName="Depth" type="custom" typeOfParameter="Length">600 mm</Depth><Height displayName="Height" type="custom" typeOfParameter="Length">900 mm</Height><Model displayName="Model" type="system" typeOfParameter="Text">WT-12</Model><Finish type="custom" typeOfParameter="Text">Steel &amp; oak</Finish></A:part>
<A:part type="user"><title>1500 x 600</title><Width displayName="Width" type="custom" typeOfParameter="Length">1500 mm</Width><Depth displayName="Depth" type="custom" typeOfParameter="Length">600 mm</Depth><Height displayName="Height" type="custom" typeOfParameter="Length">900 mm</Height><Model displayName="Model" type="system" typeOfParameter="Text">WT-15</Model><Finish type="custom" typeOfParameter="Text">Steel &amp; oak</Finish></A:part>
<A:part type="user"><title>6' x 2' 6"</title><Width displayName="Width" type="custom" typeOfParameter="Length">6' - 0"</Width><Depth displayName="Depth" type="custom" typeOfParameter="Length">2' - 6"</Depth><Height displayName="Height" type="custom" typeOfParameter="Length">3' - 0"</Height><Model displayName="Model" type="system" typeOfParameter="Text">WT-18</Model><Finish type="custom" typeOfParameter="Text">Steel &amp; oak</Finish></A:part>
</A:family></entry>`;

console.log('== family types');
const fam = R.parseAtom(xml);
ok(fam.title === 'Work table' && fam.types.length === 3, 'the reader finds the family title and its 3 types', JSON.stringify(fam.types.map((t) => t.name)));
ok(fam.types[2].name === `6' x 2' 6"` && fam.types[0].params.find((p) => p.name === 'Finish').value === 'Steel & oak', 'type names and values are unescaped; the type title is not a parameter');
ok(fam.groups.length === 1 && fam.groups[0].params[0].name === 'Manufacturer', 'the family\'s own parameters are still read');
const r = L.itemFromRfa({ family: fam, fileName: 'Work table.rfa' });
const it = L.cleanItem(r.items[0]);
const v = L.validateItem(it, { partial: true });
ok(v.ok, 'the item passes the format checks', v.errors.slice(0, 3).join('; '));
const list = L.variantList(it);
ok(list.length === 3 && list[0].default && list[0].name === '1200 x 600', '3 variants, the first type is the default');
ok(JSON.stringify(it.variants.columns.map((c) => c.label)) === '["Width","Depth","Height","Model"]', 'columns are only the parameters whose text differs between types (Finish, the same in all, is not one)', JSON.stringify(it.variants.columns));
ok(it.source_attrs.Finish === 'Steel & oak' && it.source_attrs.Manufacturer === 'Example Co.' && it.maker === 'Example Co.' && it.model === 'WT-12', 'shared values, maker and the default type\'s model are on the item');
ok(it.body.w === 1200 && it.body.d === 600 && it.body.h === 900, 'the item\'s own box is the default type\'s');
const b = L.itemAsVariant(it, list[1].id);
ok(b.body.w === 1500 && b.params.width === 1500 && !b.variants, 'the second variant is a 1500 wide box');
const c = L.itemAsVariant(it, list[2].id, { named: true });
ok(Math.abs(c.body.w - 1828.8) < 0.01 && Math.abs(c.body.d - 762) < 0.01 && Math.abs(c.body.h - 914.4) < 0.01, 'feet-and-inches values are read (6\' wide = 1828.8 mm)', JSON.stringify(c.body));
ok(/^[A-Za-z0-9_.-]{1,60}$/.test(list[2].id), 'a type name with quotes and spaces gets a safe id: ' + list[2].id);
ok(r.notes.some((n) => /3 types/.test(n)) && r.notes.some((n) => /Geometry not read/.test(n)), 'the notes say 3 types, and that the geometry was not read');

console.log('== one type, and the real sample');
const one = L.itemFromRfa({ family: R.parseAtom(xml.replace(/<A:part type="user"><title>1500[\s\S]*<\/A:part>\n<\/A:family>/, '</A:family>')) });
ok(!one.items[0].variants && one.items[0].body?.w === 1200 && one.notes.some((n) => /One type/.test(n)), 'a family with one type: no variants, the type\'s sizes fill the item');
const real = await R.readRevit(new Uint8Array(fs.readFileSync('/var/www/CADCRAFT/testfiles/samples/MassWithBoxAndCone.rfa')), 'MassWithBoxAndCone.rfa').catch(() => null);
if (real) {
  ok(real.family.types.length === 1 && real.family.types[0].name === 'MassWithBoxAndCone' && real.family.types[0].params[0].name === 'Default Elevation', 'a real family file (2016): its one type and that type\'s parameter are read');
  const ri = L.itemFromRfa(real).items[0];
  ok(L.validateItem(L.cleanItem(ri), { partial: true }).ok && ri.source_attrs['Default Elevation'] === `4' - 0"`, 'the real family still makes a valid item, now with the type\'s value');
} else console.log('  skip the real sample (testfiles not here)');
const shelf = await R.readRevit(new Uint8Array(fs.readFileSync(path.join(REPO, 'fixtures/folder/Cad/Families/Wall shelf.rfa'))), 'Wall shelf.rfa');
const si = L.itemFromRfa(shelf).items[0];
ok(shelf.family.types.length === 0 && !si.variants && si.body.w === 1219.2, 'a family with no type list is read as before');

console.log('== type catalog');
const cat = `,Width##LENGTH##MILLIMETERS,Depth##LENGTH##MILLIMETERS,Height##LENGTH##INCHES,Model##OTHER##,"Notes##OTHER##"\r\n"900 wide",900,450,36,WT-09,"left, hinged"\r\n1800 wide,1800,450,36,WT-18,\r\n`;
const ct = L.parseTypeCatalog(cat);
ok(ct.length === 2 && ct[0].name === '900 wide' && ct[0].params.find((p) => p.name === 'Width').value === '900 mm' && ct[0].params.find((p) => p.name === 'Height').value === '36 in', 'two types; lengths carry the unit the header names');
ok(ct[0].params.find((p) => p.name === 'Notes').value === 'left, hinged' && !ct[1].params.find((p) => p.name === 'Notes'), 'a quoted value with a comma is one value; an empty cell is left out');
ok(L.parseTypeCatalog('just some notes\nabout nothing').length === 0 && L.parseTypeCatalog('').length === 0, 'a text file that is not a type catalog gives no types');
const rc = L.itemFromRfa(shelf, { types: ct });
const ci = L.cleanItem(rc.items[0]);
ok(L.validateItem(ci, { partial: true }).ok && L.variantList(ci).length === 2, 'the catalog\'s types become the family\'s variants');
const cv = L.itemAsVariant(ci, L.variantList(ci)[1].id);
ok(cv.body.w === 1800 && cv.body.d === 450 && Math.abs(cv.body.h - 914.4) < 0.01, 'the second catalog type is 1800 x 450 x 36 in');
ok(rc.notes.some((n) => /type catalog/.test(n)), 'the notes say the types came from the type catalog');

console.log('== a family\'s data on another file\'s shape');
const obj = 'v 0 0 0\nv 1000 0 0\nv 1000 400 0\nv 0 400 0\nv 0 0 700\nv 1000 0 700\nv 1000 400 700\nv 0 400 700\nf 1 2 3\nf 1 3 4\nf 5 6 7\nf 5 7 8\nf 1 2 6\nf 1 6 5\nf 2 3 7\nf 2 7 6\nf 3 4 8\nf 3 8 7\nf 4 1 5\nf 4 5 8\n';
const mesh = L.itemFromMesh(new TextEncoder().encode(obj), 'obj', { units: 'mm', upAxis: 'z', name: 'Work table' }).items[0];
const joined = L.cleanItem(L.itemWithShape(it, mesh));
const jv = L.validateItem(joined, { partial: true });
ok(jv.ok, 'the joined item passes the format checks', jv.errors.slice(0, 3).join('; '));
ok(joined.body.type === 'mesh' && joined.name === 'Work table' && joined.maker === 'Example Co.' && joined.source_attrs.Finish === 'Steel & oak', 'it has the mesh as its body and the family\'s name, maker and data');
ok(Math.abs(joined.params.width - 1000) < 0.01 && Math.abs(joined.params.height - 700) < 0.01, 'its sizes are the shape\'s (1000 wide, 700 high)', JSON.stringify(joined.params));
const jl = L.variantList(joined);
ok(jl.length === 3 && L.itemAsVariant(joined, jl[1].id).body.type === 'mesh', 'its types are kept as variants, each on the one shape (no stand-in boxes)');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
