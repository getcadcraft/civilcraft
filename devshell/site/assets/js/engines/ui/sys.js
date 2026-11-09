/* SPDX-License-Identifier: Apache-2.0 */
// Descriptor for the shell's Engines panel: lib/sys (XE.12). Input is a flat Modelica-subset model; the end time is experiment(StopTime = …).
const COOL = `model Cool
  Modelica.Thermal.HeatTransfer.Components.HeatCapacitor body(C = 500, T(start = 373.15));
  Modelica.Thermal.HeatTransfer.Components.ThermalConductor skin(G = 5);
  Modelica.Thermal.HeatTransfer.Sources.FixedTemperature amb(T = 293.15);
equation
  connect(body.port, skin.port_a); connect(skin.port_b, amb.port);
  annotation(experiment(StopTime = 100));
end Cool;`;
const DIVIDER = `model Divider
  parameter Real Vs = 12;
  Modelica.Electrical.Analog.Sources.ConstantVoltage V1(V = Vs);
  Modelica.Electrical.Analog.Basic.Resistor R1(R = 3e3);
  Modelica.Electrical.Analog.Basic.Resistor R2(R = 3e3);
  Modelica.Electrical.Analog.Basic.Ground G;
equation
  connect(V1.p, R1.p); connect(R1.n, R2.p); connect(R2.n, G.p); connect(V1.n, G.p);
  annotation(experiment(StopTime = 1));
end Divider;`;

export default {
  inputLabel: 'Model (Modelica subset: electrical and thermal components, connect equations)',
  examples: [
    { id: 'cool', name: 'A body cooling through a conductor (thermal)', text: COOL },
    { id: 'divider', name: 'A resistor divider (electrical)', text: DIVIDER },
  ],
  load: () => import('../sys/index.js'),
  run(S, text) {
    const r = S.readModelica(text);
    const problems = [...(r.problems || [])];
    if (!r.ok) return { tables: [], problems };
    const stop = /StopTime\s*=\s*([0-9.eE+-]+)/.exec(text), tEnd = stop ? parseFloat(stop[1]) : 1;
    const op = S.operatingPoint(r.model); // the table is the DC steady state; the run starts from the declared start values problems.push(...(op.problems || []));
    const tables = [], names = op.system ? op.system.nodeNames : [];
    if (op.ok) tables.push({ title: 'Operating point', head: ['Node', 'Value'], rows: names.map((n) => [n, op.v(n)]) });
    const sim = S.simulate(r.model, { tEnd, dt: tEnd / 500, init: 'ic', adaptive: true, rtol: 1e-6 });
    problems.push(...(sim.problems || []));
    if (sim.t) {
      const pick = [0, 0.25, 0.5, 0.75, 1].map((f) => f * tEnd);
      tables.push({ title: 'Over time', head: ['t (s)', ...names], rows: pick.map((t) => [t, ...names.map((n) => sim.at(n, t))]) });
    }
    return { tables, problems, notes: ['Model ' + (r.name || '') + ': ' + (r.model.elements.length) + ' elements, ' + (sim.steps ?? 0) + ' steps to ' + tEnd + ' s.'] };
  },
};
