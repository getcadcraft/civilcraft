/* SPDX-License-Identifier: Apache-2.0 */
/**
 * elec-agents-test.mjs — GH.10 (0.9, session bim-hosts-09): the electrical assistant tools on BimCraft's real IFC model, DOM-free:
 *   node bin/test-bimcraft.mjs --elecagents
 * Run through the tool entry point (the same `run` the dispatcher calls). Every expected number is worked in the comment beside it (millimetres).
 */
import path from 'node:path';

export async function elecAgentsMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const imp = (f) => import(path.join(APP, f));
  const { ModelWriter } = await imp('model-write.js'), { IfcEditor } = await imp('ifc-edit.js'), OPS = await imp('model-ops.js'), N = await imp('new-model.js');
  const WT = await imp('wall-tools.js'), D = await imp('walls/draw.js'), MW = await imp('model-walls.js'), EL = await imp('res-elec.js'), AG = await imp('elec-agents.js');
  const CT = await import(path.join(ROOT, 'tools/mcp/contract.mjs'));
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(N.newBuilding({ name: 'Elec', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'e.ifc', now: new Date('2026-11-06T12:00:00Z') })));
  const ed = new IfcEditor(WebIFC, eng);
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const L1 = OPS.snapshotModel(ed).levels[0], L2 = OPS.snapshotModel(ed).levels[1];
  const env = { ed: () => ed, apply: async (label, op) => ed.modelChange(op, { label: 'Assistant: ' + label }) };
  const tools = AG.elecTools(env), T = Object.fromEntries(tools.map((x) => [x.name, x]));
  const fails = async (fn) => { try { await fn(); return null; } catch (e) { return e; } };

  console.log('== contract');
  const checks = tools.map((x) => [x.name, CT.checkTool(x, { app: 'bimcraft' })]);
  ok(tools.length === 5 && ['devices_add', 'device_change', 'lights_set', 'devices_delete', 'devices_list'].every((n) => T[n]), 'five tools, the names of the issue');
  ok(checks.every(([, r]) => !r.errors.length && !r.warnings.length), 'the contract checker finds no error or warning', checks.map(([n, r]) => n + ': ' + [...r.errors, ...r.warnings].join('; ')).filter((s) => s.length > 20).join(' | '));
  ok(tools.filter((x) => x.group === 'edit').every((x) => x.rollbackPreview) && T.devices_list.untrusted === true, 'every edit has a preview, the read is marked as content');
  const listed = await import(path.join(APP, 'agents.js'));
  ok(typeof listed.modelTools === 'function', 'agents.js loads with the new import');

  // a 5000 x 4000 room, centre-line walls of the int-2x4 type (114.3 thick)
  ed.modelChange(WT.drawPath({ storey: L1.guid, path: D.rectangle([0, 0], [5000, 4000]), typeKey: 'int-2x4', reference: 'center', height: 2700 }), { label: 'Room' });
  const walls = MW.readWalls(W(), L1.id);
  ok(walls.length === 4, 'four walls drawn');

  console.log('== request 1: a double socket every 2 m along the walls of the room at 300 mm on circuit 3');
  const spots = [];
  for (const w of walls) {
    const dx = w.b[0] - w.a[0], dy = w.b[1] - w.a[1], len = Math.hypot(dx, dy), u = [dx / len, dy / len];
    const mid = [2500, 2000];
    // the room side: the normal that points to the room centre; 250 mm in from the wall centre line is inside the room face (57 mm half thickness + 193)
    let n = [-u[1], u[0]]; const c = [(w.a[0] + w.b[0]) / 2, (w.a[1] + w.b[1]) / 2]; if ((mid[0] - c[0]) * n[0] + (mid[1] - c[1]) * n[1] < 0) n = [-n[0], -n[1]];
    for (let s = 1000; s < len; s += 2000) spots.push({ kind: 'socket.double', at: [w.a[0] + u[0] * s + n[0] * 250, w.a[1] + u[1] * s + n[1] * 250], height_mm: 300, circuit: '3', wall: w.guid });
  }
  // walls 5000 long: s = 1000, 3000 (2 each); walls 4000 long: 1000, 3000 (2 each) = 8 sockets
  ok(spots.length === 8, 'eight positions: 2 per wall');
  const n0 = ed.changes.length;
  const r = await T.devices_add.run({ level: L1.guid, devices: spots });
  ok(r.devices.length === 8 && ed.changes.length === n0 + 1, 'eight sockets in ONE undo step');
  let ls = T.devices_list.run({ level: L1.guid });
  ok(ls.total === 8 && ls.devices.every((d) => d.kind === 'socket.double' && d.circuit === '3' && near(d.height_mm, 300) && d.wall && (d.side === 1 || d.side === -1)), 'listed: all double sockets, circuit 3, 300 mm, each on a wall');
  ok(new Set(ls.devices.map((d) => d.tag)).size === 8 && ls.devices.every((d) => /^R\d+$/.test(d.tag)), 'tags R1..R8, none twice', ls.devices.map((d) => d.tag));
  // a socket on the south wall (y = 0, thickness 114.3): its face is at y = 57.15 on the room side
  const south = ls.devices.filter((d) => near(d.at[1], 57.15, 0.5));
  ok(south.length === 2 && south.every((d) => near(d.angle_deg, 90, 0.01)), 'south wall: two sockets on its room face (y 57.15), facing into the room (90 degrees)', south.map((d) => d.at));
  ok(ls.devices.every((d) => d.mount === 'wall'), 'wall mount');
  // the real model bytes carry the pset
  const bytes0 = new TextDecoder().decode(ed.save());
  ok((bytes0.match(/IFCOUTLET\(/g) || []).length === 8 && /CadCraft_Electrical/.test(bytes0), 'the saved file holds 8 IfcOutlet with the CadCraft_Electrical set');
  ed.undo();
  ok(T.devices_list.run({ level: L1.guid }).total === 0, 'one Undo takes all eight away');
  ed.redo();
  ok(T.devices_list.run({ level: L1.guid }).total === 8, 'redo puts them back');

  console.log('== request 2: a ceiling light with its switch');
  const s1 = walls.find((w) => Math.abs(w.a[1]) < 1 && Math.abs(w.b[1]) < 1);
  const r2 = await T.devices_add.run({ level: L1.guid, devices: [{ kind: 'luminaire', at: [2500, 2000] }, { kind: 'switch', at: [800, 250], wall: s1.guid }, { kind: 'downlight', at: [1000, 1000], angle_deg: 0, tag: 'DL-A' }] });
  ok(r2.devices.length === 3 && r2.devices[2].tag === 'DL-A', 'a luminaire, a switch and a downlight with its own tag');
  const lum = r2.devices[0], sw = r2.devices[1];
  ls = T.devices_list.run({ level: L1.guid, kind: 'luminaire' });
  // the walls are 2700 high: a ceiling device hangs from there
  ok(ls.devices[0].mount === 'ceiling' && near(ls.devices[0].height_mm, 2700) && near(ls.devices[0].at[0], 2500) && near(ls.devices[0].at[1], 2000), 'luminaire on the ceiling (2700) at 2500, 2000');
  const sd = T.devices_list.run({ level: L1.guid, kind: 'switch' }).devices[0];
  ok(near(sd.height_mm, 1100) && sd.wall === s1.guid && near(sd.at[1], 57.15, 0.5), 'switch 1100 mm high on the south wall face');
  const n1 = ed.changes.length;
  const lk = await T.lights_set.run({ switch: sw.guid, lights: [lum.guid, r2.devices[2].guid] });
  ok(lk.linked === 2 && ed.changes.length === n1 + 1, 'link two lights: one undo step');
  const sl = T.devices_list.run({ kind: 'switch' }).devices[0], ll = T.devices_list.run({ kind: 'luminaire' }).devices[0];
  ok(sl.lights.length === 2 && ll.switches.length === 1 && ll.switches[0].guid === sw.guid, 'the switch lists its lights, the light lists its switch');
  await T.lights_set.run({ switch: sw.guid, lights: [lum.guid], unlink: true });
  ok(T.devices_list.run({ kind: 'switch' }).devices[0].lights.length === 1, 'unlink takes one off');

  console.log('== change');
  const sock = T.devices_list.run({ level: L1.guid, kind: 'socket.double' }).devices[0];
  await T.device_change.run({ guid: sock.guid, circuit: '5', load_w: 460, height_mm: 450, tag: 'R-X' });
  const c = T.devices_list.run({}).devices.find((d) => d.guid === sock.guid);
  ok(c.circuit === '5' && c.load_w === 460 && near(c.height_mm, 450) && c.tag === 'R-X', 'tag, circuit, load and height changed');
  const mv = await T.device_change.run({ guid: sock.guid, at: [2500, 3700] });
  const c2 = T.devices_list.run({}).devices.find((d) => d.guid === sock.guid);
  // the north wall (y 4000) room face is y = 4000 - 57.15
  ok(near(c2.at[1], 3942.85, 0.5) && c2.wall !== c.wall, 'moved to the north wall face (y 3942.85) and re-snapped to that wall');
  const lm = await T.device_change.run({ guid: lum.guid, at: [1200, 1500], angle_deg: 45 });
  const l2 = T.devices_list.run({ kind: 'luminaire' }).devices[0];
  ok(near(l2.at[0], 1200) && near(l2.at[1], 1500) && near(l2.angle_deg, 45, 0.01), 'a ceiling light moved and turned');
  void mv; void lm;

  console.log('== refusals say what to do and change nothing');
  const nChanges = ed.changes.length;
  let e = await fails(() => T.devices_add.run({ level: L1.guid, devices: [{ kind: 'socket.deluxe', at: [0, 0] }] }));
  ok(e?.code === 'invalid_argument' && /socket\.double/.test(e.message) && /Valid kinds/.test(e.message), 'an unknown kind returns the list of valid keys');
  e = await fails(() => T.devices_add.run({ level: L1.guid, devices: [{ kind: 'socket', at: [2500, 2000] }] }));
  ok(e?.code === 'invalid_argument' && /within 600 mm/.test(e.message) && e.next.length, 'a socket in the middle of the room (no wall in reach): refused, with the next step');
  e = await fails(() => T.devices_add.run({ level: L1.guid, devices: [{ kind: 'luminaire', at: [1, 1] }, { kind: 'socket', at: [2500, 2000] }] }));
  ok(!!e && ed.changes.length === nChanges, 'one bad device in a batch: nothing placed');
  e = await fails(() => T.devices_add.run({ level: 'Nowhere', devices: [{ kind: 'luminaire', at: [1, 1] }] }));
  ok(e?.code === 'not_found', 'unknown level: not_found');
  e = await fails(() => T.devices_add.run({ level: L1.guid, devices: [{ kind: 'luminaire', at: [1, 1], tag: 'DL-A' }] }));
  ok(e?.code === 'invalid_argument' && /tag/.test(e.message), 'a tag in use is refused');
  e = await fails(() => T.devices_add.run({ level: L1.guid, devices: [{ kind: 'luminaire', at: [1, 1], wall: s1.guid }] }));
  ok(e?.code === 'invalid_argument', 'a wall given for a ceiling device is refused');
  e = await fails(() => T.devices_add.run({ level: L1.guid, devices: [{ kind: 'socket', at: [100, 100], wall: 'nope' }] }));
  ok(e?.code === 'not_found', 'a wall that is not on the level: not_found');
  e = await fails(() => T.device_change.run({ guid: 'nope', circuit: '1' }));
  ok(e?.code === 'not_found', 'device_change on an unknown device: not_found');
  e = await fails(() => T.device_change.run({ guid: lum.guid }));
  ok(e?.code === 'invalid_argument', 'device_change with nothing to change');
  e = await fails(() => T.device_change.run({ guid: lum.guid, tag: 'DL-A' }));
  ok(e?.code === 'invalid_argument', 'device_change to a tag in use');
  e = await fails(() => T.lights_set.run({ switch: lum.guid, lights: [lum.guid] }));
  ok(e?.code === 'invalid_argument' && /not a switch/.test(e.message), 'a light cannot be the switch');
  e = await fails(() => T.lights_set.run({ switch: sw.guid, lights: [sock.guid] }));
  ok(e?.code === 'invalid_argument' && /not a light/.test(e.message), 'a socket is not a light');
  e = await fails(() => T.devices_delete.run({ guids: [lum.guid, 'nope'] }));
  ok(e?.code === 'not_found' && T.devices_list.run({ kind: 'luminaire' }).total === 1, 'delete with one unknown id: nothing removed');
  ok(ed.changes.length === nChanges, 'no refusal wrote anything (undo stack unchanged)');

  console.log('== second level, delete');
  const r3 = await T.devices_add.run({ level: L2.name, devices: [{ kind: 'luminaire', at: [500, 500] }] });
  ok(T.devices_list.run({ level: L2.guid }).total === 1 && T.devices_list.run({ level: L1.guid }).devices.every((d) => d.level === L1.name), 'devices belong to their level');
  const nd = ed.changes.length;
  const del = await T.devices_delete.run({ guids: [lum.guid] });
  ok(del.removed === 1 && ed.changes.length === nd + 1, 'delete is one undo step');
  ok(T.devices_list.run({ kind: 'switch' }).devices[0].lights.length === 0 || T.devices_list.run({ kind: 'switch' }).devices[0].lights.every((l) => l.guid !== lum.guid), 'the switch forgot the light that went');
  const all = T.devices_list.run({});
  ok(all.total === 12 - 1 + 0 || all.total === all.devices.length, 'list total matches the rows');
  ed.undo();
  ok(T.devices_list.run({ kind: 'luminaire' }).total === 2, 'Undo brings the light back');
  void r3;

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
