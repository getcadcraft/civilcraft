#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** test-civilcraft-issues.mjs — CivilCraft 0.10 CV.1: issues, BCF 2.1 out and back in (lib/navis through ./navis/), Problems to issues, scene pins. */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const I = await import(pathToFileURL(path.join(APP, 'issues.js')).href);
const B = await import(pathToFileURL(path.join(APP, 'navis/bcf.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
let seq = 1; const nextId = (p) => p + seq++;
const al = { pointAt: (s) => ({ x: 1000 + s, y: 2000, dir: 0 }) };
const sp = I.stationPin(al, 50, 3, { name: 'Main St', id: 'a1' });
ok(sp.kind === 'station' && Math.abs(sp.x - 1050) < 1e-9 && Math.abs(sp.y - 1997) < 1e-9, 'station pin: 3 to the right of an eastward line is south: ' + JSON.stringify(sp));
const a = I.makeIssue({ id: nextId('i'), title: 'Pipe clash <&>', description: 'at the crossing', author: 'Ana', pin: sp, view: { cx: 1050, cy: 1997, h: 100 }, now: '2026-11-14T10:00:00Z' });
I.addComment(a, 'seen on site', 'Bo', '2026-11-14T11:00:00Z');
const b = I.makeIssue({ id: nextId('i'), title: 'No place', status: 'active' });
const topics = I.toTopics([a, b], { units: 'ft' });
ok(topics[0].viewpoints[0].camera.kind === 'orthogonal' && topics[1].viewpoints.length === 0, 'a pinned issue has a plan camera, an unplaced one none');
ok(Math.abs(topics[0].viewpoints[0].line[0] - 1050 * 0.3048) < 1e-9, 'feet to metres');
const bytes = B.writeBcf({ topics, file: 'site.landxml' });
const back = await B.readBcf(bytes);
ok(back.topics.length === 2 && !back.notes.length, 'BCF zip reads back: ' + JSON.stringify(back.notes));
const r = I.fromTopics(back.topics, { units: 'ft', existing: [], nextId });
const ra = r.issues.find((x) => x.guid === a.guid);
ok(r.added === 2 && ra.title === a.title && ra.comments.length === 1 && ra.status === 'open', 'issues come back with title, comment, status');
ok(ra.pin.kind === 'station' && ra.pin.ref.alignment === 'a1' && ra.pin.ref.sta === 50 && ra.pin.ref.off === 3, 'pin kind and station reference come back from the labels');
ok(Math.abs(ra.pin.x - 1050) < 1e-6 && Math.abs(ra.view.h - 100) < 1e-6, 'pin and view come back in feet');
ok(r.issues.find((x) => x.guid === b.guid).status === 'active' && r.issues.find((x) => x.guid === b.guid).pin === null, 'status Active, no pin');
// the same file again: nothing new; a changed status and a new comment are taken
const t2 = back.topics.map((t) => (t.guid === a.guid ? { ...t, status: 'Resolved', comments: [...t.comments, { guid: B.newUuid(), date: '2026-11-15T09:00:00Z', author: 'Cy', text: 'fixed' }] } : t));
const r2 = I.fromTopics(t2, { units: 'ft', existing: r.issues, nextId });
ok(r2.added === 0 && r2.updated === 1 && r2.issues.find((x) => x.guid === a.guid).status === 'resolved' && r2.issues.find((x) => x.guid === a.guid).comments.length === 2, 'import again: same guid updated, not duplicated');
ok(I.stateFromBcf('Closed') === 'closed' && I.stateFromBcf('In Progress') === 'active' && I.stateFromBcf('Approved') === 'resolved' && I.stateFromBcf('weird') === 'open', 'status words');
const c = I.cleanIssues([{ id: 'i1', title: 'x', status: 'bogus', pin: { x: 1, y: 'a' }, comments: [{ text: '' }] }, { id: 'zz' }, null], 'ft');
ok(c.length === 1 && c[0].status === 'open' && c[0].pin === null && c[0].comments.length === 0 && B.isUuid(c[0].guid), 'cleanIssues: bad rows dropped, fields repaired');
const fp = I.issuesFromProblems([{ id: 'p1', text: 'Slope too steep', where: { at: [10, 20] } }, { id: 'p2', text: 'no place' }], { nextId, existing: [] });
ok(fp.length === 1 && fp[0].from === 'problem:p1' && I.issuesFromProblems([{ id: 'p1', text: 'again', where: { at: [1, 2] } }], { nextId, existing: fp }).length === 0, 'Problems with a place become issues, once');
ok(I.stats([a, b]).unplaced === 1 && I.sceneItems([a, b], { mmPerUnit: 1 }).length === 2, 'stats and scene items (diamond + number for the placed one)');
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
