#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-part.mjs — checkThisFrame (lib/frame/frame-part.js, 0.11 SU.1811): one call from members to member and weld checks, run on the PartCraft copy
 * (public_html/assets/apps/partcraft/dev/frame/) so the copy a host mounts is the one tested. No page.
 *
 * Kinds: statics (an identity), closed (worked here), behaviour. Printed (cited) anchors are in bin/test-frame-weld.mjs: AISC E70 fillet 1.392 kip/in per
 * sixteenth (AISC Engineering Journal and Modern Steel, 2014, read through search summaries) and EN 1993-1-8 S355 f_vw,d (ArcelorMittal Orange Book). The AISC
 * Engineering Journal paper by Loomis, Thornton and Kane (4th quarter 1985, pp. 179-182, https://ej.aisc.org/index.php/engj/article/download/450/449) prints
 * worked C-shaped weld examples and capacity tables on the 8th-edition allowable basis from an inelastic (instantaneous-centre) method: read 2026-11-20, NOT used as a
 * test because the table's basis (ASD, ICR, clip eccentricity) is not the elastic LRFD method of frame-weld.js. Not claimed: an engineer's sign-off.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const P = await load('public_html/assets/apps/partcraft/dev/frame/frame-part.js');
const FM = await load('public_html/assets/apps/partcraft/dev/frame/frame-model.js');
const SH = await load('lib/shapes/sections.js');
const shapes = { findSection: SH.findSection, outline: SH.outline };
let pass = 0, fail = 0;
const ok = (c, n, d = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + n + (d ? ' - ' + d : '')); } };
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-300);
const G = FM.G_ACC;
const z = 600, Lx = 2000, Ly = 800;
const skid = (mass = 600, extra = {}) => ({
  members: [['rail1', [0, 0, z], [Lx, 0, z]], ['rail2', [0, Ly, z], [Lx, Ly, z]], ['end1', [0, 0, z], [0, Ly, z]], ['end2', [Lx, 0, z], [Lx, Ly, z]],
    ...[[0, 0], [Lx, 0], [0, Ly], [Lx, Ly]].map(([x, y], k) => ['leg' + (k + 1), [x, y, 0], [x, y, z]])].map(([id, a, b]) => ({ id, a, b, section: 'HSS4X4X1/4' })),
  supports: [[0, 0], [Lx, 0], [0, Ly], [Lx, Ly]].map(([x, y]) => ({ at: [x, y, 0], fix: 'pinned' })),
  equipment: [{ id: 'pump', mass, cg: [1000, 400, 900], mounts: [[500, 0, z], [1500, 0, z], [500, Ly, z], [1500, Ly, z]] }], ...extra });
for (const code of ['asce-aisc', 'en']) {
  const r = P.checkThisFrame(skid(), shapes, { code });
  ok(r.ok && r.notReviewed === true && r.code === code, code + ': runs, and says not reviewed by an engineer');
  ok(r.summary.members === 12 && r.summary.welds === 24 && r.summary.memberNotChecked === 0 && r.summary.weldNotChecked === 0, code + ': 12 members and 24 weld groups, all checked', JSON.stringify(r.summary));
  ok(r.summary.pass === true && r.summary.worst && r.summary.worst.util === Math.max(r.summary.memberMax, r.summary.weldMax), code + ': a 600 kg pump passes and the worst item is the larger of the two maxima');
  const R = r.sol.results['case:dead'].reactions;
  let sumZ = 0; for (let k = 0; k < R.length / 6; k++) sumZ += R[6 * k + 2];
  const steel = r.build.model.members.reduce((s, m) => { const sec = r.build.model.sections.find((x) => x.id === m.section), a = r.build.model.nodes.find((n) => n.id === m.i), b = r.build.model.nodes.find((n) => n.id === m.j); return s + sec.A * Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) * 7850e-9 * G; }, 0);
  ok(near(sumZ, steel + 600 * G, 1e-6), code + ': statics: reactions = steel weight + pump weight');
  const t = (k) => k; const tabs = P.partTables(r, t);
  ok(tabs.length >= 2 && tabs.every((x) => x.title && Array.isArray(x.rows)), code + ': report tables for both checks');
}
const heavy = P.checkThisFrame(skid(60000), shapes, { code: 'asce-aisc' });
ok(heavy.ok && heavy.summary.pass === false && heavy.summary.memberFailed + heavy.summary.weldFailed > 0, 'behaviour: 60 t on the skid fails, and pass is false');
const light = P.checkThisFrame(skid(300), shapes, { code: 'asce-aisc' }), mid = P.checkThisFrame(skid(600), shapes, { code: 'asce-aisc' });
ok(light.summary.worst.util < mid.summary.worst.util, 'behaviour: half the pump, a lower worst utilisation');
ok(P.checkThisFrame({ members: [] }, shapes).error === 'no-members' && P.checkThisFrame({ members: [{ id: 'x', a: [0, 0, 0], b: [1000, 0, 0], section: 'NOPE' }] }, shapes).error === 'no-sections', 'behaviour: no members / unknown section refused with its reason');
const nosup = P.checkThisFrame({ ...skid(), supports: [] }, shapes);
ok(nosup.ok === false && nosup.warnings.some((w) => w.code === 'no-supports'), 'behaviour: a frame with no supports says so and does not pass');
const two = P.checkThisFrame(skid(600), shapes, { code: 'asce-aisc', weldSize: 3 });
ok(two.ok && two.summary.weldMax > mid.summary.weldMax, 'behaviour: weld leg size is passed through');
console.log(fail ? `${fail} FAILED, ${pass} passed` : `all ${pass} passed`); process.exit(fail ? 1 : 0);
