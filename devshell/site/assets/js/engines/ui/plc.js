/* SPDX-License-Identifier: Apache-2.0 */
// Descriptor for the shell's Engines panel: lib/plc (XE.13). Input is IEC 61131-3 structured text with one PROGRAM; the panel checks it, scans it for 24 scans of 10 ms
// and lists the plain variables (BOOL, INT, REAL, TIME …) after each scan. A header comment may set the scan count: (* SCANS 40 *).
const TON = `PROGRAM Main
VAR
  run : BOOL := TRUE;
  t : TON;
  q : BOOL;
  et : TIME;
END_VAR
t(IN := run, PT := T#100ms);
q := t.Q;
et := t.ET;
END_PROGRAM`;
const SEAL = `(* SCANS 30 *)
PROGRAM Main
VAR
  n : INT;
  lamp : BOOL;
  on : BOOL;
END_VAR
n := n + 1;
IF n = 5 THEN on := TRUE; END_IF;
IF n = 20 THEN on := FALSE; END_IF;
lamp := on;
END_PROGRAM`;

// XE.13: a JSON input binds the program to a flow model (lib/des): { "st": program text, "model": {nodes…}, "sensors": {name: "queue:<node>"…}, "commands": {name: "gate:<node>"}, "scans": n, "cycleMs": ms }
const BOUND = JSON.stringify({ cycleMs: 100, scans: 100, model: { nodes: [{ type: 'source', name: 'in', arrival: { const: 1 }, to: 'g' }, { type: 'gate', name: 'g', open: false, to: 'out' }, { type: 'sink', name: 'out' }] },
  sensors: { waiting: 'queue:g' }, numeric: ['waiting'], commands: { release: 'gate:g' }, st: 'PROGRAM Main\n{{declarations}}\nrelease := waiting >= 3;\nEND_PROGRAM' }, null, 1);

async function runBound(P, text) {
  const D = await import('../des/index.js'), input = JSON.parse(text), problems = [];
  if (!input.model || !input.st) throw new Error('The input needs "st" (the program, with {{declarations}} where the variables go) and "model" (a flow model).');
  const sim = new D.Sim(input.model, { seed: input.seed || 1 });
  problems.push(...D.validate(input.model));
  const plant = P.desPlant(sim, { sensors: input.sensors || {}, commands: input.commands || {}, timePerSecond: input.timePerSecond || 1 });
  problems.push(...plant.problems);
  const am = P.addressMap(input.sensors || {}, input.commands || {}, { numeric: input.numeric || [] });
  const proj = P.projectFromST(String(input.st).replace('{{declarations}}', am.st));
  problems.push(...P.analyze(proj));
  if (problems.some((p) => p.severity === 'error')) return { tables: [], problems };
  const scans = Math.min(2000, input.scans || 100), plc = new P.SoftPLC(proj, { cycleMs: input.cycleMs || 100 });
  plc.bind(plant, { sense: am.sense, command: am.command });
  const names = [...Object.keys(input.sensors || {}), ...Object.keys(input.commands || {})], rows = [];
  for (let i = 0; i < scans; i++) {
    plc.cycle(); problems.push(...plc.problems.filter((p) => !problems.includes(p)));
    if (i < 200) rows.push([i + 1, (i + 1) * plc.cycleMs, ...names.map((n) => plc.rt.get(n))]);
  }
  const rep = sim.report(), nice = (v) => (typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : v);
  return {
    tables: [
      { title: 'Model after ' + scans + ' scans', head: ['Node', 'Type', 'Detail'], rows: Object.entries(rep.nodes).map(([n, r]) => [n, r.type, r.type === 'sink' ? 'count ' + r.count : r.type === 'gate' ? `passed ${r.passed}, opened/shut ${r.toggles} times, open ${(100 * r.openFraction).toFixed(0)} % of the time` : r.type === 'source' ? 'made ' + r.made : ''] ) },
      { title: 'Sensors and commands each scan', head: ['Scan', 'ms', ...names], rows: rows.map((r) => r.map(nice)) }],
    problems,
    notes: ['The PLC and the model run together: each scan reads the model\'s sensors, runs the program, writes the commands, then the model runs on for the scan time (model time units = seconds unless "timePerSecond" says otherwise).', 'Scan time is simulated; no hardware is involved. Test on the real controller before use.'],
  };
}


// XE.13 (apps-mount_PART_5): a JSON input with "scene": true binds the program to the 3D scene of the open page (a host that sets window.ccSceneHost, ModelCraft):
// { "scene": true, "st": program with {{declarations}}, "sensors": {name: "Object.prop"}, "numeric": [names], "scale": {sensor: factor}, "commands": {name: "Object.prop"},
//   "values": {command: [whenFalse, whenTrue]}, "scans": n, "cycleMs": ms, "keep": false }. Properties: x, y, z, rotZ, hidden. The run works on an overlay; "keep": true
// writes the final state into the model as one undo step.
const SCENE = JSON.stringify({ scene: true, cycleMs: 100, scans: 40, sensors: { up: 'Lift.z' }, numeric: ['up'], scale: { up: 1000 }, commands: { raise: 'Lift.z' }, values: { raise: [0, 2] }, keep: false,
  st: 'PROGRAM Main\n{{declarations}}\nIF up < 1500 THEN raise := TRUE; END_IF;\nEND_PROGRAM' }, null, 1);

async function runScene(P, text) {
  const input = JSON.parse(text), problems = [];
  const prob = (code, msg, about = []) => ({ id: 'plc:scene:' + code + ':' + about.join(','), code, severity: 'error', text: msg, about: about.map((id) => ({ id })), source: { kind: 'engine', name: 'cc-plc' } });
  if (!input.st) throw new Error('The input needs "st" (the program, with {{declarations}} where the variables go).');
  const H = globalThis.ccSceneHost;
  if (!H || typeof H.open !== 'function') return { tables: [], problems: [prob('none', 'This page has no 3D scene to bind to. Open the Engines panel in ModelCraft, with the model open.')] };
  const sess = H.open();
  try {
    const sensors = input.sensors || {}, commands = input.commands || {}, scale = {}, values = {};
    const split = (spec) => { const m = /^([^.]+)\.(.+)$/.exec(String(spec)); return m ? [m[1], m[2]] : null; };
    for (const [kind, set] of [['Sensor', sensors], ['Command', commands]]) for (const [id, spec] of Object.entries(set)) {
      const p = split(spec);
      if (!p) continue;
      if (!sess.has(p[0])) problems.push(prob('object', `${kind} "${id}" names "${p[0]}", which is not a placement of the open model.`, [id]));
      else if (!(sess.hasProp ? sess.hasProp(p[1]) : true)) problems.push(prob('prop', `${kind} "${id}": "${p[1]}" is not a property (x, y, z, rotZ, hidden).`, [id]));
    }
    for (const [id, f] of Object.entries(input.scale || {})) if (sensors[id] && Number.isFinite(f)) scale[sensors[id]] = f;
    for (const [id, v] of Object.entries(input.values || {})) if (commands[id] && Array.isArray(v) && v.length === 2) values[commands[id]] = v;
    const scene = {
      read: (o, pr) => { const v = sess.read(o, pr); return typeof v === 'number' && scale[o + '.' + pr] ? Math.round(v * scale[o + '.' + pr]) : v; },
      apply: (o, pr, v) => { const m = values[o + '.' + pr]; sess.apply(o, pr, m ? (v ? m[1] : m[0]) : v); },
    };
    const plant = P.scenePlant(scene, { sensors, commands });
    problems.push(...plant.problems);
    const am = P.addressMap(sensors, commands, { numeric: input.numeric || [] });
    const proj = P.projectFromST(String(input.st).replace('{{declarations}}', am.st));
    problems.push(...P.analyze(proj));
    if (problems.some((p) => p.severity === 'error')) return { tables: [], problems };
    const scans = Math.min(2000, input.scans || 100), plc = new P.SoftPLC(proj, { cycleMs: input.cycleMs || 100 });
    plc.bind(plant, { sense: am.sense, command: am.command });
    const names = [...Object.keys(sensors), ...Object.keys(commands)], rows = [];
    for (let i = 0; i < scans; i++) {
      plc.cycle(); problems.push(...plc.problems.filter((p) => !problems.includes(p)));
      if (i < 200) rows.push([i + 1, (i + 1) * plc.cycleMs, ...names.map((n) => plc.rt.get(n))]);
    }
    const nice = (v) => (typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : v);
    const state = Object.entries(sess.state()).map(([k, v]) => [k, typeof v === 'number' ? +v.toFixed(6) : nice(v)]);
    const kept = input.keep === true ? sess.close(true) : (sess.close(false), 0);
    return {
      tables: [
        { title: 'The model after ' + scans + ' scans' + (input.keep === true ? ' (written into the model: ' + kept + ' changes, one undo step)' : ' (the model is not changed)'), head: ['Object.property', 'Value'], rows: state },
        { title: 'Sensors and commands each scan', head: ['Scan', 'ms', ...names], rows: rows.map((r) => r.map(nice)) }],
      problems,
      notes: ['The PLC reads the placements of the open model, runs the program, and writes its commands back to the placements (' + names.length + ' signals). Scan time is simulated; no hardware is involved. Set "keep": true to write the final state into the model; leave it off to test the program without touching the model.'],
    };
  } finally { try { sess.close(false); } catch { /* already closed */ } }
}

export default {
  inputLabel: 'Program (IEC 61131-3 structured text, one PROGRAM; optional (* SCANS n *) first)',
  examples: [
    { id: 'ton', name: 'An on-delay timer: Q rises after 100 ms', text: TON },
    { id: 'bound', name: 'The program bound to a flow model: a gate released in threes', text: BOUND },
    { id: 'scene', name: 'The program bound to the 3D scene: a lift placement raised to 2 m', text: SCENE },
    { id: 'counter', name: 'A scan counter that switches a lamp on and off', text: SEAL },
  ],
  load: () => import('../plc/index.js'),
  run(P, text) {
    if (/^\s*\{/.test(text)) return /"scene"\s*:\s*true/.test(text) ? runScene(P, text) : runBound(P, text);
    const proj = P.projectFromST(text);
    const problems = [...P.analyze(proj)];
    const m = /\(\*\s*SCANS\s+(\d+)\s*\*\)/i.exec(text), scans = Math.min(200, m ? parseInt(m[1], 10) : 24);
    if (problems.some((p) => p.severity === 'error')) return { tables: [], problems };
    const plc = new P.SoftPLC(proj, { cycleMs: 10 });
    const prog = [...proj.pous.values()].find((p) => p.type === 'program');
    const names = prog ? prog.vars.filter((v) => !(v.type in P.STD_FB) && !proj.pous.has(v.type)).map((v) => v.key) : [];
    const rows = [];
    for (let i = 0; i < scans; i++) {
      plc.cycle();
      problems.push(...plc.problems.filter((p) => !problems.includes(p)));
      rows.push([i + 1, (i + 1) * plc.cycleMs, ...names.map((n) => plc.rt.get(n))]);
    }
    const nice = (v) => (typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : v);
    return {
      tables: [{ title: 'Variables after each scan', head: ['Scan', 'ms', ...names], rows: rows.map((r) => r.map(nice)) }],
      problems,
      notes: ['Scan time is simulated: ' + plc.cycleMs + ' ms per scan, ' + scans + ' scans. TIME values are in milliseconds. No hardware is involved; test on the real controller before use.'],
    };
  },
};
