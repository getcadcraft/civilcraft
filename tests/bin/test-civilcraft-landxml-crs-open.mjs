#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Exercise the LandXML Open binding and project save/reopen without a browser.
import assert from 'node:assert/strict';
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
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(app, 'lang/en.json'), 'utf8')) });
const { mountFiles } = await mod('files-ui.js');
const { Project } = await mod('project.js');
const coordinates = [['101', 656167.979125, 164041.994875, 3290.125], ['102', 656217.979875, 164025.995125, 3292.875]];
const values = (p) => p.points.map(({ n, x, y, z }) => [n, x, y, z]);
const landXml = (declaration) => `<LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2" version="1.2" date="2026-11-21" time="10:20:30">
  <Units><Imperial linearUnit="foot" areaUnit="squareFoot" volumeUnit="cubicFoot" temperatureUnit="fahrenheit" pressureUnit="inHG"/></Units>
  ${declaration}<Project name="Synthetic survey"/><CgPoints>
  ${coordinates.map(([id, e, n, z]) => `<CgPoint name="${id}">${n} ${e} ${z}</CgPoint>`).join('')}
  </CgPoints></LandXML>`;

for (const [kind, declaration] of [
  ['absent', ''],
  ['unreadable', '<CoordinateSystem epsgCode="not-a-code"/>'],
  ['declared', '<CoordinateSystem epsgCode="2256"/>'],
]) {
  const shown = [];
  const offered = [];
  let loads = 0;
  const ctx = {
    project: new Project(), view: { fit() {}, invalidateScene() {} }, say: (message) => shown.push(message),
    confirmDiscard: async () => true, refresh() {}, rebind() {}, eg: () => ({}),
    gisLoad: async () => { loads++; },
    gisReg: { extents: [], landxmlCrs: (system) => offered.push(system.epsgCode) },
  };
  await mountFiles(ctx).openText(landXml(declaration), 'fixture.landxml');
  await new Promise(setImmediate); // allow the normal, lazy CRS offer to run
  assert.deepEqual(values(ctx.project), coordinates, kind);
  const back = Project.fromJSON(JSON.parse(JSON.stringify(ctx.project.toJSON()))).project;
  assert.deepEqual(values(back), coordinates, kind + ' after reopen');
  assert.equal(back.state.crs, null);
  assert.equal(back.state.units, 'ft');
  const note = I18N.t('cv.lx.crs.missing');
  if (kind === 'declared') {
    assert.equal(loads, 1);
    assert.deepEqual(offered, [2256]);
    assert.ok(!ctx.lastReport?.includes(note), 'parsed declaration follows the normal offer, not the missing-CRS path');
    assert.ok(!shown.at(-1).includes(note));
  } else {
    assert.equal(loads, 0);
    assert.match(ctx.lastReport?.join(' ') || '', /no usable horizontal coordinate system.+GIS › Coordinates/i, kind + ' import report names the next step');
    assert.ok(shown.at(-1).includes(note), kind + ' status shows same actionable note');
  }
  console.log('PASS', kind, 'declaration: report, status, unchanged ENZ and unit after reopen');
}
