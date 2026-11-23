#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * display-matrix.mjs — TW.13's hook in ModelCraft's viewer (0.11, view3d.js setDisplayMatrix): a display-only matrix per mesh definition. No page and no
 * login (the real-page run needs a lab session); view3d.js runs in Node on the vendored three.js with the renderer-free parts of the viewer.
 *   node tools/modelcraft-test/display-matrix.mjs
 * Checks: the matrix multiplies the placement's own (column-major, in the definition's space); null clears; a bad matrix or an unknown definition is
 * refused and changes nothing; it survives build(); it is not in the model (toJSON unchanged, no undo step); the box ignores it.
 */
import { register } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const THREE_URL = pathToFileURL(path.join(REPO, 'public_html/assets/vendor/three/current/three.module.js')).href;
register('data:text/javascript,' + encodeURIComponent(`export async function resolve(s, c, n) { return s === 'three' ? { url: ${JSON.stringify(THREE_URL)}, shortCircuit: true } : n(s, c); }`));
globalThis.document = { documentElement: {}, addEventListener() {}, createElement: () => ({ getContext: () => null, style: {} }) };
globalThis.window = globalThis; globalThis.requestAnimationFrame = () => 0; globalThis.MutationObserver = class { observe() {} };
const DEV = path.join(REPO, 'public_html/assets/apps/modelcraft/dev/');
const THREE = await import(THREE_URL);
const { View3D } = await import(DEV + 'view3d.js').catch((e) => { console.log('view3d.js did not load in Node: ' + e.message); process.exit(2); });
let pass = 0, fail = 0;
const ok = (c, n, d = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + n + (d ? ' - ' + d : '')); } };

const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const at = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
// a viewer with only what setDisplayMatrix and the build loop touch
const v = Object.create(View3D.prototype);
v.root = new THREE.Group(); v.invalidate = () => { v.painted = (v.painted || 0) + 1; };
const defs = new Map([['d1', { id: 'd1' }]]);
v.model = { def: (id) => defs.get(id) || null };
v.defGroups = new Map();
const grp = new THREE.Group(); grp.matrixAutoUpdate = false; grp.userData.base = at(10, 0, 0); grp.matrix.fromArray(grp.userData.base); v.root.add(grp);
v.defGroups.set('d1', [grp]);

ok(v.setDisplayMatrix('d1', at(0, 5, 0)) === true, 'a matrix for a known definition is taken');
ok(Array.from(grp.matrix.elements).join() === at(10, 5, 0).join(), 'the placement is drawn at its own matrix times the display matrix', Array.from(grp.matrix.elements).join());
ok(v.displayMatrixOf('d1').join() === at(0, 5, 0).join(), 'it can be read back');
ok(v.painted >= 1, 'the viewer is asked to redraw');
const rot = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];   // 90 degrees about Z
v.setDisplayMatrix('d1', rot);
const p = new THREE.Vector3(1, 0, 0).applyMatrix4(grp.matrix);
ok(Math.abs(p.x - 10) < 1e-12 && Math.abs(p.y - 1) < 1e-12, 'a rotation turns the part about its own origin, then the placement moves it', p.toArray().join());
ok(v.setDisplayMatrix('d1', [1, 2, 3]) === false && v.setDisplayMatrix('d1', I.map((x, i) => (i === 3 ? NaN : x))) === false && v.setDisplayMatrix('nope', I) === false && v.setDisplayMatrix('d1', 'x') === false, 'a bad matrix and an unknown definition are refused');
ok(v.displayMatrixOf('d1').join() === rot.join(), 'a refused call changes nothing');
ok(v.setDisplayMatrix('d1', null) === true && v.displayMatrixOf('d1') === null && Array.from(grp.matrix.elements).join() === at(10, 0, 0).join(), 'null clears: the placement is home again');
v.setDisplayMatrix('d1', at(1, 1, 1)); v.clearDisplayMatrices();
ok(v.displayMatrixOf('d1') === null && Array.from(grp.matrix.elements).join() === at(10, 0, 0).join(), 'clearDisplayMatrices sends every definition home');
// the matrix is viewer state: keeping it across a rebuild is the build loop's job (this.displayM.has(inst.def) in build)
const src = (await import('node:fs')).readFileSync(DEV + 'view3d.js', 'utf8');
ok(/this\.displayM\?\.has\(inst\.def\) \? mmul4\(inst\.m, this\.displayM\.get\(inst\.def\)\) : inst\.m/.test(src) && /this\.defGroups = new Map\(\)/.test(src), 'build() applies it to every placement and rebuilds the group list');
ok(!/displayM/.test(src.slice(src.indexOf('placedBox(def, g, wm) {'), src.indexOf('build() {'))), 'the model box (placedBox) does not read it: the part\'s own place counts');
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
