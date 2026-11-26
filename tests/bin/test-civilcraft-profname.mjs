#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Synthetic LandXML design profile names and geometry through the regular Open and Export bindings.
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public_html');
const app = path.join(root, 'assets/apps/civilcraft/dev');
const { imports } = JSON.parse(fs.readFileSync(path.join(app, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) {
  return imports[spec] ? { url: pathToFileURL(path.join(root, imports[spec])).href, shortCircuit: true } : next(spec, ctx);
} });
const mod = (name) => import(pathToFileURL(path.join(app, name)).href);
const { init, t } = await mod('i18n.js');
init({ strings: JSON.parse(fs.readFileSync(path.join(app, 'lang/en.json'), 'utf8')) });
const { mountFiles } = await mod('files-ui.js');
const { Project } = await mod('project.js');
const { readLandXml } = await mod('landxml.js');

const para = '<PVI>0 3000</PVI><ParaCurve length="200">500 3010</ParaCurve><PVI>1000 3005</PVI>';
const circle = '<PVI>0 100</PVI><CircCurve radius="1000" length="199.337305">500 150</CircCurve><PVI>1000 100</PVI>';
function fixture(name, geom = para, secondProfile = '') {
  const attr = name === null ? '' : ' name="' + name + '"';
  return '<?xml version="1.0" encoding="UTF-8"?>\n<LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2" version="1.2">' +
    '<Units><Imperial areaUnit="squareFoot" linearUnit="USSurveyFoot" volumeUnit="cubicYard" temperatureUnit="fahrenheit" pressureUnit="inHG"/></Units>' +
    '<Project name="Synthetic alignment"/><Alignments><Alignment name="CL-Main" length="1000" staStart="0">' +
    '<CoordGeom><Line length="1000"><Start>800000 2000000</Start><End>801000 2000000</End></Line></CoordGeom>' +
    '<Profile name="CL-Main"><ProfAlign' + attr + '>' + geom + '</ProfAlign>' + secondProfile +
    '</Profile></Alignment></Alignments></LandXML>';
}

function openBindings() {
  let exported;
  const ctx = {
    project: new Project(), view: { fit() {}, invalidateScene() {} }, say() {}, busy() {},
    confirmDiscard: async () => true, refresh() {}, rebind() {}, eg: () => ({}), graded: () => ({}),
    gisReg: { extents: [] }, fileHost: { download(blob) { exported = blob; } },
  };
  const files = mountFiles(ctx);
  return {
    ctx,
    importXml: (xml) => files.openText(xml, 'synthetic.landxml'),
    reopen: (json) => files.openText(JSON.stringify(json), 'synthetic.civilcraft.json'),
    async exportXml() {
      exported = null;
      files.exportLandXml();
      return exported.text();
    },
  };
}

let pass = 0, fail = 0;
const ok = (condition, message) => {
  if (condition) pass++;
  else { fail++; console.log('  FAIL ' + message); }
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const near = (a, b, tol = 1e-8) => Math.abs(a - b) < tol;
const profiles = (xml) => readLandXml(xml).alignments[0].profiles;

const { ctx, importXml, reopen, exportXml } = openBindings();
const first = () => ctx.project.state.alignments[0];
await importXml(fixture('FG Design', para, '<ProfAlign name="Alternative"><PVI>0 15</PVI><PVI>1000 16</PVI></ProfAlign>'));
ok(first().profName === 'FG Design', 'Open keeps the first design profile name');
ok(ctx.lastReport?.includes(t('cv.lx.profiles.more', { name: 'CL-Main' })), 'the additional-profile notice still appears');
const projectFile = ctx.project.toJSON();
ok(projectFile.alignments[0].profName === 'FG Design', 'the project file stores the name');
await reopen(projectFile);
ok(first().profName === 'FG Design', 'opening the project file restores the name');
const out = profiles(await exportXml());
ok(same(out.map((p) => p.name), ['FG Design']), 'LandXML export and reimport keep just the first name');
ok(same(out[0].pvis, [{ sta: 0, z: 3000, L: 0 }, { sta: 500, z: 3010, L: 200 }, { sta: 1000, z: 3005, L: 0 }]), 'the parabolic profile geometry survives');
ctx.project.change('rename', (s) => { s.alignments[0].name = 'CL-Renamed'; });
ok(profiles(await exportXml())[0].name === 'FG Design', 'renaming the alignment leaves the imported profile name intact');

await importXml(fixture('FG &lt;Alt&gt; &amp; &quot;B&quot;'));
const escaped = await exportXml();
ok(escaped.includes('name="FG &lt;Alt&gt; &amp; &quot;B&quot;"'), 'the name is XML-escaped on export');
ok(profiles(escaped)[0].name === 'FG <Alt> & "B"', 'the escaped name reads back');
await importXml(fixture('N'.repeat(300)));
await reopen(ctx.project.toJSON());
ok(first().profName === 'N'.repeat(120), 'the persisted name is limited to 120 characters');

await importXml(fixture(null));
ok(first().profName === t('lx.def.profile'), 'an unnamed ProfAlign keeps the existing LandXML reader default');
const old = ctx.project.toJSON();
delete old.alignments[0].profName;
await reopen(old);
ok(!Object.hasOwn(first(), 'profName'), 'older saved projects still have no retained name');
ok(!Object.hasOwn(ctx.project.toJSON().alignments[0], 'profName'), 'saving an older alignment writes no name field');
ok(profiles(await exportXml())[0].name === t('cv.lx.design', { name: 'CL-Main' }), 'a project without a retained name uses the usual export name');
for (const bad of [42, { a: 1 }, '   ', '']) {
  old.alignments[0].profName = bad;
  await reopen(old);
  ok(!Object.hasOwn(first(), 'profName'), 'invalid profile name ' + JSON.stringify(bad) + ' is ignored');
}
old.alignments[0].profName = ' FG\u0007Design ';
await reopen(old);
ok(first().profName === 'FG Design', 'saved profile names are trimmed and controls become spaces');

await importXml(fixture('FG &amp; Crest', circle));
ok(first().pvis[1].R === 1000, 'Open reads a true circular vertical curve');
const circularFile = ctx.project.toJSON();
ok(circularFile.alignments[0].profName === 'FG & Crest', 'the circular profile name is saved');
ok(circularFile.alignments[0].pvis[1].R === 1000, 'the circular radius is saved');
await reopen(circularFile);
ok(first().profName === 'FG & Crest', 'the circular profile name survives reopening');
const built = ctx.project.designProfile(first());
ok(built.ok && built.curves[0]?.circ && built.curves[0].R === 1000, 'the reopened project still builds a circle');
ok(near(built.elevationAt(500), 145.012437887911), 'the reopened circle has the expected crest elevation at station 500');
const circXml = await exportXml();
ok(/<CircCurve length="199\.3373\d*" radius="1000">500 150<\/CircCurve>/.test(circXml), 'export keeps the circle, arc length, radius, PVI station and PVI elevation');
const circOut = profiles(circXml)[0];
ok(circOut.name === 'FG & Crest' && circOut.pvis[1].R === 1000, 'reading the export gives the name and circular radius');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
