/* SPDX-License-Identifier: Apache-2.0 */
/**
 * calc4.js — the calculators for the round-4 engines (0.8 chem-draw_PART_4, rule 41): the mount lines chem-engines_PART_4 left, as entries of the calculator registry
 * (calc.js spreads `makeCalcs4(helpers)` into CALCS). One door for the panels of the P&ID add-on (CadCraft) and the Plant tab (BimCraft).
 *
 *   column2     CH.3  inside-out column and rigorous absorber/stripper
 *   mechanism   CH.3  reaction mechanism file (YAML) in a closed vessel
 *   bell        CH.8  Bell-Delaware geometry and, with a coefficient pack, the shell-side rating
 *   vessel2     CH.9  external pressure, stiffening ring, body outline and shell nozzle
 *   pumptrip    CH.10 pump trip with check valve and rotor run-down; 2-K / 3-K fitting forms
 *   pipestress2 CH.11 pressure thrust, spring hanger selection, stop-gap check
 *   relief2     CH.12 depressuring, control-valve failure, header load summary
 *   blast       CH.16 multi-energy blast (needs a curve pack)
 *   heavygas    CH.16 heavy-gas box model (constants are yours)
 *   packs       CH.17/18 data packs from CSV (thresholds, reactivity, area classification)
 *   pme         CH.25 smooth particle-mesh Ewald against the plain sum, and SHAKE bond constraints
 *   wdesign     CH.20 activated-sludge design equations
 *   lims2       CH.26 the connection screen for your own lab system: validate and redact (the trial runs where the host keeps the secret)
 *
 * Nothing a book supplies is typed here: a table or constant comes from the person's pack, and the engine says what it needs. Samples marked "example" are only there so the form runs.
 */
export function makeCalcs4({ flatten, prob, fromEngine, strip, trendSvg }) {
  const needs = (e) => prob('process.needssource', 'warning', String(e && e.message || e));
  const lines = (obj, max = 60) => flatten(obj, { max });
  const BENZ = { components: ['benzene', 'toluene'], model: 'ideal' };
  return [
    { id: 'column2', group: 'flowsheet', rows: ['CH.3'], title: 'Column: fast inside-out solver, absorber and stripper',
      input: { method: 'insideOut', thermo: BENZ, feeds: [{ stage: 11, flows: { benzene: 50, toluene: 50 }, T: null, P: 101325 }], spec: { N: 20, P: 101325, R: 2.2, D: 50 },
        _absorber: { method: 'absorber', thermo: { components: ['methane', 'propane', 'nhexane'], model: 'pr' }, feeds: [{ stage: 1, flows: { nhexane: 60 }, T: 300, P: 1e6 }, { stage: 6, flows: { methane: 80, propane: 20 }, T: 300, P: 1e6 }], spec: { N: 6, P: 1e6 } },
        _help: 'method: insideOut (a feed T of null means its bubble point) or absorber (liquid solvent at stage 1, gas at stage N). Replace the _absorber block into the main fields to run it.' },
      async run(i) {
        const P = await import('./index.js'), C2 = await import('./column2.js');
        const th = new P.Thermo(i.thermo), feeds = i.feeds.map((f) => ({ stage: f.stage, stream: P.feedStream(th, { flows: f.flows, T: f.T == null ? th.bubbleT(th.ids.map((id) => (f.flows[id] || 0) / Object.values(f.flows).reduce((a, b) => a + b, 0)), f.P).T : f.T, P: f.P }) }));
        const r = i.method === 'absorber' ? C2.absorber(th, feeds, i.spec) : C2.insideOut(th, feeds, i.spec);
        const out = { converged: r.converged, iterations: r.iterations, innerIterations: r.innerIterations, componentClosure: r.componentClosure, energyClosure: r.energyClosure, reboilerDuty_W: r.reboilerDuty, condenserDuty_W: r.condenserDuty, rigorousCalls: r.rigorousCalls };
        if (r.outs) r.outs.forEach((s, k) => { out['out' + (k + 1)] = { F_mol_s: s.F, z: Object.fromEntries(th.ids.map((id, j) => [id, +(s.z[j]).toPrecision(5)])) }; });
        return { lines: lines(out), problems: fromEngine(r.problems).concat(r.converged ? [] : [prob('column2.converge', 'warning', 'The column did not converge in the iteration limit; the profile shown is not a solution.')]) };
      } },
    { id: 'mechanism', group: 'flowsheet', rows: ['CH.3'], title: 'Reaction mechanism file (YAML) in a closed vessel',
      input: { yaml: 'description: example mechanism, not data\nunits: {length: cm, quantity: mol, activation-energy: kJ/mol}\nspecies:\n- name: A\n  composition: {X: 1}\n  thermo:\n    model: NASA7\n    temperature-ranges: [200.0, 1000.0, 3000.0]\n    data:\n    - [3.5, 0.001, 0.0, 0.0, 0.0, -1000.0, 4.0]\n    - [3.5, 0.001, 0.0, 0.0, 0.0, -1000.0, 4.0]\n- name: B\n  composition: {X: 1}\n  thermo:\n    model: NASA7\n    temperature-ranges: [200.0, 1000.0, 3000.0]\n    data:\n    - [3.5, 0.001, 0.0, 0.0, 0.0, -2000.0, 4.0]\n    - [3.5, 0.001, 0.0, 0.0, 0.0, -2000.0, 4.0]\nreactions:\n- equation: A => B\n  rate-constant: {A: 2.0, b: 0, Ea: 0}\n', T: 500, C0: { A: 1 }, t: 1, adiabatic: false },
      async run(i) {
        const M = await import('./mechanism.js'), mech = M.loadMechanism(String(i.yaml || ''));
        const r = M.batchReactor(mech, { T: i.T, C0: i.C0, t: i.t, adiabatic: !!i.adiabatic });
        const out = { species: mech.species.map((s) => s.name).join(', '), reactions: mech.reactions.length, finalT_K: r.T ? r.T[r.T.length - 1] : i.T };
        mech.species.forEach((s, k) => { out['C_' + s.name] = r.final[k]; });
        return { lines: lines(out), problems: fromEngine(mech.problems).concat(fromEngine(r.problems)).concat([prob('mechanism.scope', 'info', 'Elementary and three-body reactions only; falloff, plog, chebyshev and surface reactions are listed above and left out, never guessed.')]) };
      } },
    { id: 'bell', group: 'equipment', rows: ['CH.8'], title: 'Exchanger shell side: Bell-Delaware (coefficients from your pack)',
      input: { geo: { Ds: 0.6, do: 0.019, pitch: 0.0254, layoutAngle: 30, Nt: 150, B: 0.25, Lbc: 0.25, Lsb: 0.004, Ltb: 0.0008, Dotl: 0.55, Nss: 0 }, fluid: { mdot: 5, cp: 2000, mu: 0.001, k: 0.13 }, pack: null, shellsInSeries: { eps1: 0.4, Cr: 0.5, n: 2 },
        _help: 'pack: paste your cadcraft-bell-delaware-pack (the coefficient tables of the Heat Exchanger Design Handbook section 3.3.5, typed by a person with the book open). Without one the geometry is still worked out.' },
      async run(i) {
        const B = await import('./equip/bell.js'), g = B.geometry(i.geo), out = { geometry: g }, problems = [];
        if (i.shellsInSeries) out.shellsInSeries_eps = B.shellsInSeries(i.shellsInSeries.eps1, i.shellsInSeries.Cr, i.shellsInSeries.n);
        if (i.pack) {
          try { const r = B.rateBell({ pack: i.pack, geo: g, fluid: i.fluid, layoutAngle: i.geo.layoutAngle, do: i.geo.do, pitch: i.geo.pitch }); out.rating = strip(r, 'notes'); for (const n of r.notes) problems.push(prob('bell.note', 'info', n)); } catch (e) { problems.push(needs(e)); }
        } else problems.push(prob('bell.needspack', 'info', B.NEEDS_SOURCE));
        return { lines: lines(out), problems };
      } },
    { id: 'vessel2', group: 'equipment', rows: ['CH.9'], title: 'Vessel: external pressure, stiffening ring, body outline',
      input: { external: { Do: 1000, t: 10, A: 0.0005, curve: null, E: null }, ring: { Do: 1000, Ls: 1000, t: 10, As: 500, A: 0.001 }, body: { D: 1000, Ltt: 2000, head: { type: 'ellipsoidal' } }, nozzle: { at: 500, angle: 90, D: 100 },
        _help: 'curve: the [[A, B], ...] pairs of the ASME II-D chart for your material and temperature, typed by you. Without it Pa is not given.' },
      async run(i) {
        const V = await import('./equip/vessel2.js'), out = {}, problems = [];
        if (i.external) { const e = V.externalPressure(i.external); out.externalPressure = strip(e, 'needsSource', 'notes'); for (const n of e.notes || []) problems.push(prob('vessel2.note', 'info', n)); if (e.needsSource) problems.push(needs({ message: e.needsSource })); }
        if (i.ring) out.stiffeningRing = V.stiffeningRing(i.ring);
        if (i.body) { const b = V.bodyProfile(i.body); out.body = strip(b, 'profile'); out.bodyProfilePoints = b.profile ? b.profile.length : 0; if (i.nozzle) out.nozzle = V.nozzleOnBody(b, i.nozzle); }
        return { lines: lines(out), problems };
      } },
    { id: 'pumptrip', group: 'equipment', rows: ['CH.10'], title: 'Pump trip: surge with check valve and run-down',
      input: { L: 1000, D: 0.3, a: 1000, Hs: 5, Hd: 40, Q0: 0.02, H0: 79.2, curve: [80, 0, -2000], eta: 0.75, w0: 150, I: 5, tEnd: 20, Hv: null },
      async run(i) {
        const T = await import('./equip/transient.js'), spec = { ...i }; if (spec.Hv == null) delete spec.Hv;
        const r = T.pumpTrip(spec);
        const out = { steadyH_m: r.steadyH, Hmin_m: r.Hmin, Hmax_m: r.Hmax, checkValveClosesAt_s: r.tClose };
        return { lines: lines(out), problems: fromEngine(r.problems), svg: trendSvg(r.t, { 'head at pump (m)': r.Hpump, 'flow (m3/s)': r.Qpump, 'speed (rad/s)': r.speed }) };
      } },
    { id: 'fittingk', group: 'equipment', rows: ['CH.10'], title: 'Fitting losses: K from the 2-K and 3-K tables (draft pack)',
      picker: true,
      input: { pack: 'draft', method: '3K', fitting: 'valve-gate-valve-standard-beta-1', Re: 100000, Dinch: 4, v: 2,
        _help: 'pack: "draft" is the bundled DRAFT table (constants from the fluids library\'s Hooper and Darby tables, not checked against the papers); null = no pack (it then says what is needed); or your own cadcraft-fitting-k-pack object. Dinch: 2K uses the actual inside diameter, 3K the nominal size, in inches. v (m/s) gives the head loss. Pick a fitting with the list above the input. For a pipe network, put the K it gives on the link (K per link).' },
      async run(i) {
        const F = await import('./equip/fittingk.js'), problems = [];
        let pack = i.pack === 'draft' ? (await F.bundled()).pack : i.pack;
        if (!pack) { problems.push(prob('fittingk.needs', 'warning', F.NEEDS_SOURCE_K)); return { lines: [], problems }; }
        const r = F.fittingK(pack, { method: i.method, id: i.fitting, Re: +i.Re, Dinch: +i.Dinch, v: i.v == null ? null : +i.v });
        const f = (pack.methods[r.method].fittings.find((x) => x.id === r.fitting.id)) || {}, consts = r.method === '2K' ? { K1: f.K1, Kinf: f.Kinf } : { K1: f.K1, Ki: f.Ki, Kd: f.Kd };
        const out = { fitting: r.fitting.label, source_name: r.fitting.source, method: r.method, ...consts, K: r.K, form: r.form, review: r.review, ...(r.headLoss_m != null ? { headLoss_m: r.headLoss_m } : {}), sources: r.sources.join(' | ') };
        if (r.draft) problems.push(prob('fittingk.draft', 'warning', F.DRAFT_NOTE));
        for (const n of r.notes) if (n !== F.DRAFT_NOTE) problems.push(prob('fittingk.note', 'info', n));
        return { lines: lines(out), problems };
      } },
    { id: 'compressor', group: 'equipment', rows: ['CH.10'], title: 'Compressor head, power and outlet temperature (ideal gas)',
      input: { P1: 1.0e5, P2: 3.0e5, T1: 300, M: 0.02897, k: 1.4, Z: 1, eta: 0.75, kind: 'polytropic', mdot: 2, surge: null,
        _help: 'Absolute pressures in Pa, T1 in K, M in kg/mol, k = cp/cv, Z held constant (1 = ideal gas), eta between 0 and 1 and kind says whether it is the polytropic or the isentropic efficiency. mdot (kg/s) gives the power. surge: { line: [[Q, H], ...], Q, headUnit: "J/kg" or "m" } checks the flow margin to your surge line. The example values are placeholders, not a machine.' },
      async run(i) {
        const Cm = await import('./equip/compressor.js'), r = Cm.compressorHead(i), problems = [];
        const out = { pressureRatio: r.r, polytropicExponent_n: r.n, isentropicEfficiency: r.etaS, polytropicEfficiency: r.etaP, isentropicHead_Jkg: r.Hs, polytropicHead_Jkg: r.Hp, polytropicHead_m: r.headM, shaftWork_Jkg: r.work, outletTemperature_K: r.T2, ...(r.power != null ? { power_W: r.power } : {}) };
        for (const n of r.notes) problems.push(prob('compressor.assume', 'info', n));
        if (i.surge && i.surge.line) { const s = Cm.compressorSurge(i.surge.line, +i.surge.Q, r, i.surge.headUnit || 'J/kg'); out.surgeFlow = s.qSurge; out.surgeMargin = s.margin; if (s.surge) problems.push(prob('compressor.surge', 'error', 'The flow is at or below the surge line for this head.')); for (const n of s.notes) problems.push(prob('compressor.surge.note', 'warning', n)); }
        return { lines: lines(out), problems };
      } },
    { id: 'npsh', group: 'equipment', rows: ['CH.10'], title: 'Pump head from its curve and NPSH margin',
      input: { curve: [[0, 40], [0.02, 36], [0.04, 24]], Q: 0.02, rho: 998, P: 101325, Pv: 2339, z: 2, hLoss: 0.5, npshr: [[0, 2], [0.02, 3], [0.04, 5]], eta: 0.7,
        _help: 'curve: pump points [flow m3/s, head m] (3 points = quadratic, 2 points = H0 - kQ2). P suction surface pressure and Pv vapour pressure, absolute Pa; z the liquid level above the pump centreline (m); hLoss the suction line loss (m). npshr: the maker\'s required NPSH points [flow, m]. The example numbers are placeholders, not a pump.' },
      async run(i) {
        const N = await import('./equip/network.js'), problems = [], c = N.fitPumpCurve(i.curve), head = N.pumpHead(c, i.Q), a = N.npsha({ P: i.P, Pv: i.Pv, rho: i.rho, z: i.z, hLoss: i.hLoss }), out = { head_m: head, npsha_m: a };
        if (i.eta > 0) out.hydraulicPower_W = i.rho * N.G * i.Q * head / i.eta;
        if (Array.isArray(i.npshr) && i.npshr.length >= 2) {
          const p = i.npshr.slice().sort((x, y) => x[0] - y[0]); let r = null;
          for (let k = 1; k < p.length; k++) if (i.Q >= p[k - 1][0] && i.Q <= p[k][0]) r = p[k - 1][1] + (i.Q - p[k - 1][0]) / (p[k][0] - p[k - 1][0]) * (p[k][1] - p[k - 1][1]);
          if (r == null) problems.push(prob('npsh.range', 'warning', 'The flow is outside the NPSH-required points; no margin is given.'));
          else { out.npshr_m = r; out.margin_m = a - r; out.ratio = a / r; if (a < r) problems.push(prob('npsh.cavitation', 'error', 'NPSH available is below NPSH required: the pump will cavitate at this flow.')); else problems.push(prob('npsh.margin', 'info', 'NPSH available exceeds required by ' + (a - r).toFixed(2) + ' m; the margin you need is your project\'s decision.')); }
        }
        if (a <= 0) problems.push(prob('npsh.neg', 'error', 'NPSH available is zero or negative: the liquid flashes at the suction.'));
        return { lines: lines(out), problems };
      } },
    { id: 'pipestress2', group: 'equipment', rows: ['CH.11'], title: 'Pipe stress extras: pressure thrust, spring hanger, stop gaps',
      input: { thrust: { P: 2, Di: 100 }, spring: { hotLoad: 5000, travel: 20, maxVariation: 0.25, table: [] }, gaps: { displacements: { N1: { x: 12 } }, gaps: [{ node: 'N1', axis: 'x', plus: 10, minus: 10 }] },
        _help: 'spring.table: the maker\'s load table rows { size, rate, loadMin, loadMax, travelMax }, typed from the catalogue.' },
      async run(i) {
        const S = await import('./equip/pipestress2.js'), out = {}, problems = [];
        if (i.thrust) out.thrust = S.pressureThrust(i.thrust);
        if (i.spring) { try { out.spring = S.selectSpring(i.spring); } catch (e) { problems.push(needs(e)); } }
        if (i.gaps) out.gaps = S.gapCheck(i.gaps.displacements, i.gaps.gaps);
        if (out.gaps && out.gaps.closing && out.gaps.closing.length) problems.push(prob('pipestress2.gap', 'warning', 'A stop closes: ' + out.gaps.closing.map((c) => c.node + ' ' + c.axis).join(', ') + '.'));
        problems.push(prob('pipestress2.cold', 'info', 'Cold spring relations (B31.3 para. 319.5) are not built in.'));
        return { lines: lines(out), problems };
      } },
    { id: 'relief2', group: 'equipment', rows: ['CH.12'], title: 'Relief extras: depressuring, control-valve failure, header loads',
      input: { depressuring: { V: 10, P0: 20e5, T0: 300, M: 0.016, k: 1.3, A: 1e-3, Pb: 101325, tEnd: 600, Ptarget: 10e5 }, valve: { fluid: 'liquid', Kv: 50, dP: 4, SG: 1, normal: 3 },
        header: { scenarios: [{ id: 'S1', header: 'H1', loads: { PSV1: 10, PSV2: 5 } }, { id: 'S2', header: 'H1', loads: { PSV3: 30 } }, { id: 'S3', header: 'H2', loads: { PSV4: 2 } }], cases: [{ name: 'power failure', scenarios: ['S1', 'S3'] }, { name: 'fire', scenarios: ['S2'] }],
          flare: { header: 'H1', fluid: { kind: 'gas', M: 0.016043, T: 300, Z: 1, mu: 1.1e-5, k: 1.31 }, nodes: [{ id: 'PSV1', z: 0 }, { id: 'PSV2', z: 0 }, { id: 'PSV3', z: 0 }, { id: 'J', z: 0 }, { id: 'TIP', z: 20, P: 1.3e5 }], links: [{ id: 'a', a: 'PSV1', b: 'J', D: 0.2, L: 80 }, { id: 'b', a: 'PSV2', b: 'J', D: 0.2, L: 60 }, { id: 'c', a: 'PSV3', b: 'J', D: 0.25, L: 50 }, { id: 'h', a: 'J', b: 'TIP', D: 0.45, L: 300 }], valves: [{ node: 'PSV1', set: 10e5 }, { node: 'PSV2', set: 10e5 }, { node: 'PSV3', set: 10e5 }] } } },
      async run(i) {
        const R = await import('./equip/relief2.js'), out = {}, problems = []; let series = null;
        if (i.depressuring) { const d = R.depressuring(i.depressuring); out.depressuring = { tReach_s: d.tReach, Tmin_K: d.Tmin, Pend_Pa: d.P[d.P.length - 1] }; for (const p of fromEngine(d.problems)) problems.push(p); series = { 'P (bar)': d.P.map((p) => p / 1e5), 'T (K)': d.T }; var tt = d.t; }
        if (i.valve) out.controlValveFailure = strip(R.controlValveFailure(i.valve), 'problems');
        if (i.header) {
          const h = R.headerSummary(i.header); out.headers = h.headers; for (const p of fromEngine(h.problems)) problems.push(p);
          // the governing case's loads of one header become the demands of the flare network's valve nodes, and relief.flareHeader gives the back pressure at each valve (CH.12)
          if (i.header.flare) {
            const f = i.header.flare, src = h.toFlareSources(f.header), RL = await import('./equip/relief.js');
            const nodes = (f.nodes || []).map((n) => (n.id in src ? { ...n, demand: -src[n.id] } : n));
            const missing = Object.keys(src).filter((d) => !nodes.some((n) => n.id === d));
            if (missing.length) problems.push(prob('relief2.flare.nodes', 'warning', 'The governing case loads ' + missing.join(', ') + ', which are not nodes of the flare network, so their flow is left out.'));
            try { const r = RL.flareHeader({ fluid: f.fluid, nodes, links: f.links }, f.valves || []); out.flare = { header: f.header, governing: (out.headers.find((x) => x.header === f.header) || {}).governing, backPressures: r.backPressures, nodeP_Pa: Object.fromEntries(Object.entries(r.nodes).map(([k, v]) => [k, v.P])) }; for (const p of fromEngine(r.problems)) problems.push(p); }
            catch (e) { problems.push(prob('relief2.flare', 'error', String(e.message || e))); }
          }
        }
        return { lines: lines(out), problems, svg: series ? trendSvg(tt, series) : undefined };
      } },
    { id: 'blast', group: 'safety', rows: ['CH.16'], title: 'Blast (multi-energy method, curves from your pack)',
      input: { pack: null, sources: [{ id: 'a', x: 0, y: 0, volume: 100, energyDensity: 3.5e6, strength: 7 }, { id: 'b', x: 50, y: 0, volume: 100, energyDensity: 3.5e6, strength: 3 }], at: { x: 10, y: 0 }, levels: [5000, 20000],
        _help: 'pack: your cadcraft-blast-curve-pack (TNO Yellow Book chapter 5 curves for strength 1 to 10, typed with the book open).' },
      async run(i) {
        const B = await import('./safety/blast.js'), problems = [];
        if (!i.pack) { try { B.overpressure(null, 3, 1e9, 100); } catch (e) { problems.push(needs(e)); } return { lines: [], problems }; }
        const c = B.cloud(i.pack, i.sources, i.at), out = { governing: c.governing, atPoint: c };
        const shapes = [];
        for (const s of i.sources) for (const lv of i.levels || []) { try { const d = B.distanceFor(i.pack, s.strength, s.volume * s.energyDensity, lv); out['distance_' + s.id + '_' + lv + 'Pa_m'] = d; shapes.push({ cx: s.x, cy: s.y, r: d, level: lv, type: 'circle', label: s.id + ' ' + lv + ' Pa' }); } catch (e) { problems.push(needs(e)); } }
        return { lines: lines(out), problems: problems.concat([prob('blast.review', 'info', 'Screening only; the curves are the pack the person typed.')]), zones: shapes };
      } },
    { id: 'heavygas', group: 'safety', rows: ['CH.16'], title: 'Heavy-gas cloud (box model; constants are yours)',
      input: { mass: 1000, rhoGas: 2.5, rhoAir: 1.2, Cg: 1.07, aTop: 0.1, aEdge: 0.6, ustar: 0.3, uWind: 2, R0: 10, tEnd: 300, _help: 'Cg, aTop, aEdge: the gravity-spreading and entrainment constants from your reference (Britter and McQuaid 1988 / Eidsvik 1980). The values here are examples to make the form run.' },
      async run(i) {
        const H = await import('./safety/heavygas.js'), spec = strip(i, '_help'), r = H.instantaneous(spec);
        return { lines: lines({ final: r.final, massConserved_kg: r.massConserved, drift_m: r.x ? r.x[r.x.length - 1] : null }), problems: fromEngine(r.problems).concat([prob('heavygas.constants', 'info', 'The spreading and entrainment constants are the ones you typed; none is built in.')]), svg: r.t ? trendSvg(r.t, { 'radius (m)': r.R || [], 'concentration': r.c || [] }) : undefined };
      } },
    { id: 'packs', group: 'safety', rows: ['CH.17', 'CH.18'], title: 'Data packs from a table (thresholds, reactivity, area classification)',
      input: { kind: 'threshold', csv: 'id,clause,name,cas,group,basis,qty,unit,note\nA,YOUR CLAUSE,Example chemical,000-00-0,,process,2.2046226218,lb,\nB,,No clause,111-11-1,,site,5,kg,\n', groupsCsv: '', pairsCsv: '', name: 'My pack',
        _help: 'kind: threshold | reactivity (groupsCsv + pairsCsv) | area. Every row needs the clause it comes from. The engine refuses rows without one. Copy the pack from the Text box into a Library data pack.' },
      async run(i) {
        const K = await import('./safety/packs.js'); let r;
        if (i.kind === 'reactivity') r = K.reactivityPackFromCsv(i.groupsCsv, i.pairsCsv, { name: i.name });
        else if (i.kind === 'area') r = K.areaPackFromCsv(i.csv, { name: i.name });
        else r = K.thresholdPackFromCsv(i.csv, { name: i.name });
        const out = { kind: i.kind, rows: r.pack ? (r.pack.rules || r.pack.pairs || Object.keys(r.pack.zones || {})).length : 0, complete: r.complete, coverage: r.coverage };
        return { lines: lines(out), problems: fromEngine(r.problems).concat([prob('packs.review', 'info', 'The pack is marked "not confirmed" until a person with the regulation checks it.')]), text: r.pack ? JSON.stringify(r.pack, null, 1) : '' };
      } },
    { id: 'wdesign', group: 'environment', rows: ['CH.20'], title: 'Activated sludge: tank size, return ratio, clarifier',
      input: { mix: { Q: 20000, S0: 250, S: 5, Y: 0.4, kd: 0.06, thetaC: 10, X: 3000 }, ret: { X: 3000, Xr: 9000 }, clarifier: { Q: 20000, Qr: 10000, X: 3000, A: 800 }, _help: 'Q m3/d, S0 and S mg/L, Y and kd are yours (no defaults), thetaC d, X mg/L.' },
      async run(i) {
        const D = await import('./env/design.js'), out = {};
        if (i.mix) out.completeMix = D.completeMix(i.mix);
        if (i.ret) out.returnRatio = D.returnRatio(i.ret);
        if (i.clarifier) out.clarifier = D.clarifier(i.clarifier);
        return { lines: lines(out), problems: [prob('wdesign.review', 'info', 'Complete-mix design equations; the kinetic constants are the ones you typed.')] };
      } },
    { id: 'pme', group: 'chemistry', rows: ['CH.25'], title: 'Electrostatics check: smooth particle-mesh Ewald against the plain Ewald sum, and bond constraints (SHAKE)',
      input: { charges: 32, box: 12, alpha: 0.5, grid: 32, order: 6, kmax: 10, seed: 7, dumbbells: 16, steps: 300, _help: 'Random charges of +-0.8 in a cubic box, in reduced units: the mesh energy and force against the plain sum, then a short run of rigid dumbbells with SHAKE. A method check, not a force field.' },
      async run(i) {
        const MD = await import('../molecular/md.js'), PM = await import('../molecular/pme.js');
        let seed = i.seed | 0 || 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        const L = Math.min(Math.max(+i.box || 12, 6), 30), n = Math.min(Math.max(i.charges | 0 || 32, 2), 128), atoms = [];
        for (let k = 0; k < n; k++) atoms.push({ type: 'A', x: rnd() * L, y: rnd() * L, z: rnd() * L, q: k % 2 ? 0.8 : -0.8 });
        const types = { A: { sigma: 0.0001, eps: 0, mass: 1 } }, grid = [i.grid, i.grid, i.grid];
        const plain = MD.createSystem({ units: 'reduced', box: [L, L, L], types, atoms, rc: L / 2 - 0.1, ewald: { alpha: i.alpha, kmax: i.kmax } });
        const p = PM.pmeRecip({ x: plain.x, q: plain.q, box: plain.box, alpha: i.alpha, grid, order: i.order, ke: 1 });
        const out = { energyMesh: p.E, energyPlain: plain.pe.coulRecip, relativeDifference: Math.abs(p.E - plain.pe.coulRecip) / Math.abs(plain.pe.coulRecip) };
        const at = [], cons = []; let k = 0, m = Math.min(Math.max(i.dumbbells | 0 || 16, 1), 16);
        for (let a = 0; a < 4 && k < 2 * m; a++) for (let b = 0; b < 4 && k < 2 * m; b++) { const x = 2.5 * a + 1, y = 2.5 * b + 1; at.push({ type: 'A', x, y, z: 5 }, { type: 'A', x: x + 1, y, z: 5 }); cons.push([k, k + 1, 1.0]); k += 2; }
        const s = MD.createSystem({ units: 'reduced', box: [10, 10, 10], types: { A: { sigma: 0.9, eps: 1, mass: 1 } }, atoms: at, rc: 3, T0: 1.0, seed: 3, constraints: cons });
        MD.run(s, Math.min(i.steps | 0 || 300, 2000), 0.002, { thermostat: { type: 'langevin', T: 1, gamma: 2 } });
        out.worstBondError = s.shakeInfo.worst; out.constrainedBonds = cons.length;
        return { lines: lines(out), problems: [prob('pme.method', 'info', 'A check of the long-range method on random charges; the mesh energy agrees with the plain sum to the relative difference shown.')] };
      } },
    { id: 'lims2', group: 'plant', rows: ['CH.26'], title: 'Connect your own lab system (settings check)',
      input: { kind: 'rest', name: 'Lab', baseUrl: 'https://lims.example.com/api', authHeader: 'Authorization', secretRef: 'lab-key', paths: { samples: '/samples' }, writeBack: false, test: false },
      async run(i) {
        const L = await import('./env/limsconnect.js'), v = L.validate(i), out = { ok: v.ok, saved: L.redact(i), errors: v.errors };
        const problems = [];
        // Test the connection (input.test = true): the host's own hostFetch(url, init, secretRef) adds the secret and pins the address. A browser tab has none, so it says so; nothing is sent.
        const hostFetch = i.test && globalThis.ccStudioBridge && typeof globalThis.ccStudioBridge.hostFetch === 'function' ? globalThis.ccStudioBridge.hostFetch : null;
        if (i.test && v.ok && hostFetch) { const r = await L.trial(i, { hostFetch, csv: i.csv }); out.trial = r.steps.map((s) => (s.ok ? 'ok: ' : 'failed: ') + s.step + ' - ' + s.message); for (const p of fromEngine(r.problems)) problems.push(p); }
        else problems.push(prob('lims2.trial', 'info', i.test ? 'Test the connection needs CadCraft Studio, which adds your secret and pins the address; a browser tab cannot. Nothing was sent.' : 'Set "test": true to test the connection. It runs in CadCraft Studio, which adds your secret and pins the address. The drawing keeps the secret\'s name only.'));
        if (!v.ok) for (const [k, m] of Object.entries(v.errors || {})) problems.push(prob('lims2.field', 'error', k + ': ' + m));
        return { lines: lines(out), problems, screen: L.SCREEN };
      } },
  ];
}
