/* SPDX-License-Identifier: Apache-2.0 */
/**
 * calc-treat.js — the water treatment calculators of CH.35-CH.38 (0.11, session water-b-11), as entries of the calculator registry (calc.js spreads
 * `makeCalcsTreat(helpers)` into CALCS, like calc4.js). The CivilCraft Water treatment add-on, the P&ID add-on and the Plant tab all reach them through calc.js.
 *
 *   asm        CH.35  activated sludge with a model picker: ASM1 (water.js), ASM3 (env/asm3.js), ASM2d (env/asm2d.js); matrix continuity shown with the result
 *   digester   CH.36  ADM1 as published for BSM2 (env/adm1.js): the BSM2 test feed, or the waste sludge of the activated sludge plant; biogas flow and composition
 *   mbr        CH.37  membrane bioreactor separation stage (env/membrane.js mbr)
 *   ro         CH.37  reverse osmosis by solution-diffusion (env/membrane.js ro)
 *   dosing     CH.38  iron or aluminium for phosphorus, lime or caustic for alkalinity, chlorine (env/dosing.js)
 * Samples marked "example" are only there so the form runs; the coefficients they carry are the cited ones (see each engine's SOURCES).
 */
const BSM1_TANKS = [{ id: 'R1', V: 1000 }, { id: 'R2', V: 1000 }, { id: 'R3', V: 1333, aerated: true, KLa: 240 }, { id: 'R4', V: 1333, aerated: true, KLa: 240 }, { id: 'R5', V: 1333, aerated: true, KLa: 84 }];
const FLOWS = { Qin: 18446, Qint: 55338, Qr: 18446, Qw: 385, capture: 0.998 };
export const ASM_SAMPLES = Object.freeze({
  asm1: { model: 'asm1', plant: { tanks: BSM1_TANKS, ...FLOWS, influent: { SI: 30, SS: 69.5, XI: 51.2, XS: 202.32, XBH: 28.17, XBA: 0, XP: 0, SO: 0, SNO: 0, SNH: 31.56, SND: 6.95, XND: 10.59, SALK: 7 } },
    _help: 'BSM1 open-loop tanks and influent (as water.js BSM1_OPEN_LOOP) with a clarifier capture instead of the settler. Add "settler": {} for the layered settler.' },
  asm3: { model: 'asm3', plant: { tanks: BSM1_TANKS, ...FLOWS, T: 20, influent: { SI: 30, SS: 69.5, XI: 51.2, XS: 202.32, XH: 28.17, SNH4: 31.56, SALK: 7 } },
    _help: 'Example influent: BSM1\'s ASM1 numbers moved to the ASM3 names (organic N is carried by i_N here), not a characterised ASM3 influent. T between 10 and 20 C uses ASM3\'s two columns.' },
  asm2d: { model: 'asm2d', plant: { tanks: [{ id: 'AN', V: 1000 }, { id: 'AX', V: 1000 }, { id: 'O1', V: 1333, aerated: true, KLa: 240 }, { id: 'O2', V: 1333, aerated: true, KLa: 240 }, { id: 'O3', V: 1333, aerated: true, KLa: 84 }],
    Qin: 18446, Qint: 0, Qr: 18446, Qw: 385, capture: 0.998, influent: { SI: 30, SF: 40, SA: 29.5, XI: 51.2, XS: 202.32, XH: 28.17, SNH4: 31.56, SPO4: 5, SALK: 7 } },
    _help: 'Example influent: BSM1\'s readily biodegradable COD split by hand into SF and SA, and 5 g P/m3 phosphate. No internal recycle: this solver returns it to the first tank, the unaerated one, and nitrate there stops the PAOs (try Qint 18446: phosphate is no longer removed).' },
});
const DIGESTER_BSM2 = { source: 'bsm2', q: 170, T: 35, influent: { Ssu: 0.01, Saa: 0.001, Sfa: 0.001, Sva: 0.001, Sbu: 0.001, Spro: 0.001, Sac: 0.001, Sh2: 1.0e-8, Sch4: 1.0e-5, SIC: 0.04, SIN: 0.01,
  SI: 0.02, Xc: 2.0, Xch: 5.0, Xpr: 20.0, Xli: 5.0, Xsu: 0, Xaa: 0.01, Xfa: 0.01, Xc4: 0.01, Xpro: 0.01, Xac: 0.01, Xh2: 0.01, XI: 25.0, Scat: 0.04, San: 0.02 }, par: { Vliq: 3400, Vgas: 300 },
  _help: 'source "bsm2": the BSM2 test feed (Rosen and Jeppsson 2006 p. 20; the result is compared with their table). source "sludge": the waste sludge of the activated sludge plant (sludge.plant, default the BSM1 plant) thickened by sludge.thicken.' };
const DIGESTER_SLUDGE = { source: 'sludge', T: 35, sludge: { thicken: 8, Scat: 0.04, San: 0.02 }, par: { Vliq: 3400, Vgas: 300 },
  _help: 'The BSM1 plant (water.js) runs first; its waste sludge (Qw, underflow concentrations) is thickened and fed to the digester. Give sludge.plant to use your own plant (ASM1 names).' };

export function makeCalcsTreat({ flatten, prob, fromEngine }) {
  const round = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'number' ? +v.toPrecision(5) : v]));
  return [
    { id: 'asm', group: 'environment', rows: ['CH.35', 'CH.20'], picker: true, title: 'Activated sludge with a model choice: ASM1, ASM3 or ASM2d',
      input: ASM_SAMPLES.asm3,
      options: async () => [
        { label: 'ASM1 (Henze et al. 1987, BSM1 parameters)', set: ASM_SAMPLES.asm1 },
        { label: 'ASM3 (Gujer et al. 1999, values via WaterTAP)', set: ASM_SAMPLES.asm3 },
        { label: 'ASM2d (Henze et al. 1999, values via QSDsan)', set: ASM_SAMPLES.asm2d },
      ],
      async run(i) {
        const m = i.model || 'asm1', W = await import('./env/water.js');
        let r, model, review, sources;
        if (m === 'asm1') { r = W.activatedSludge(i.plant); model = W.ASM1_MODEL; review = W.REVIEW; sources = W.SOURCES; }
        else if (m === 'asm3' || m === 'asm2d') {
          const E = m === 'asm3' ? await import('./env/asm3.js') : await import('./env/asm2d.js');
          try { r = E.plant(i.plant); } catch (e) { if (e.problems) return { lines: [], problems: fromEngine(e.problems) }; throw e; }
          model = m === 'asm3' ? E.ASM3_MODEL : E.ASM2D_MODEL; review = E.REVIEW; sources = E.SOURCES;
        } else return { lines: [], problems: [prob('asm.model', 'error', 'model must be "asm1", "asm3" or "asm2d".')] };
        const lines = [{ k: 'model', v: model.name }].concat(flatten({ converged: r.converged, srt: r.srt, balances: r.balances, effluent: round(r.effluent) }, { max: 50 }));
        if (r.matrix) lines.push({ k: 'matrix continuity, worst row', v: +r.matrix.worst.toExponential(2) + ' (' + model.conserved.join(', ') + ')' });
        return { lines, problems: fromEngine(r.problems).concat([prob(m + '.review', 'info', review.note), prob(m + '.sources', 'info', (sources.values || sources.matrix || '') + '')]) };
      } },
    { id: 'digester', group: 'environment', rows: ['CH.36'], picker: true, title: 'Anaerobic digester (ADM1 as published for BSM2): biogas and digested sludge',
      input: DIGESTER_BSM2,
      options: async () => [
        { label: 'BSM2 test feed (Rosen and Jeppsson 2006, p. 20)', set: DIGESTER_BSM2 },
        { label: 'Waste sludge from the activated sludge plant (BSM1)', set: DIGESTER_SLUDGE },
      ],
      async run(i) {
        const A = await import('./env/adm1.js'), extra = [];
        let feed = { q: i.q, influent: i.influent };
        if (i.source === 'sludge') {
          const W = await import('./env/water.js'), pl = i.sludge?.plant || { ...W.bsm1Plant(), settler: undefined, capture: 0.998 };
          if (pl.settler === undefined) delete pl.settler;
          const as = W.activatedSludge(pl);
          if (!as.converged) extra.push(prob('digester.plant', 'warning', 'The activated sludge plant had not settled; its waste sludge is the last state.'));
          try { const fs = A.fromSludge(as.waste, as.flows.Qw, { thicken: i.sludge?.thicken ?? 1, Scat: i.sludge?.Scat, San: i.sludge?.San }); feed = { q: fs.q, influent: fs.influent }; extra.push(...fromEngine(fs.problems)); }
          catch (e) { return { lines: [], problems: fromEngine(e.problems || [prob('digester.sludge', 'error', String(e.message))]) }; }
        }
        let r;
        try { r = A.digester({ q: feed.q, T: i.T, influent: feed.influent, par: i.par }); } catch (e) { if (e.problems) return { lines: [], problems: fromEngine(e.problems) }; throw e; }
        const b = r.biogas, lines = [
          { k: 'converged', v: String(r.converged) }, { k: 'feed', v: +feed.q.toPrecision(5), u: 'm3/d' }, { k: 'hydraulic retention', v: +r.hrt.toPrecision(4), u: 'd' }, { k: 'pH', v: +r.pH.toPrecision(6) },
          { k: 'biogas', v: +b.flow.toPrecision(6), u: 'm3/d at 1.013 bar' }, { k: 'methane', v: +(b.ch4 * 100).toPrecision(4), u: '%' }, { k: 'carbon dioxide', v: +(b.co2 * 100).toPrecision(4), u: '%' },
          { k: 'hydrogen', v: +(b.h2 * 1e6).toPrecision(4), u: 'ppm' }, { k: 'water vapour', v: +(b.h2o * 100).toPrecision(3), u: '%' }, { k: 'methane flow', v: +b.methane.toPrecision(6), u: 'm3/d' },
          { k: 'methane COD', v: +b.methaneCOD.toPrecision(6), u: 'kg COD/d' }, { k: 'head-space pressure', v: +b.Pgas.toPrecision(5), u: 'bar' },
          { k: 'acetate', v: +r.liquid.Sac.toPrecision(5), u: 'kg COD/m3' }, { k: 'inorganic nitrogen', v: +(r.liquid.SIN * 14).toPrecision(5), u: 'kg N/m3' },
        ].concat(flatten({ balances: { COD: r.balances.COD.rel, C: r.balances.C.rel, N: r.balances.N.rel } }, { max: 6 }));
        if (i.source !== 'sludge') {
          const P = A.BSM2_STEADY_OUTPUT, ours = { ...r.liquid, ...r.gas, ...r.ions, pH: r.pH, SH: r.SH, pgas_h2: b.pgas_h2, pgas_ch4: b.pgas_ch4, pgas_co2: b.pgas_co2, pgas: b.Pgas, qgas: b.flow };
          const same = JSON.stringify(i.influent) === JSON.stringify(A.BSM2_STEADY_INPUT.influent) && i.q === 170 && (i.T ?? 35) === 35 && !(i.par && ((i.par.Vliq ?? 3400) !== 3400 || (i.par.Vgas ?? 300) !== 300));
          if (same) { let w = 0; for (const [k, v] of Object.entries(P)) w = Math.max(w, Math.abs(ours[k] - v) / Math.abs(v)); lines.push({ k: 'largest deviation from the published BSM2 table', v: +w.toExponential(2) }); }
        }
        return { lines, problems: extra.concat(fromEngine(r.problems), [prob('adm1.review', 'info', A.REVIEW.note)]) };
      } },
    { id: 'mbr', group: 'environment', rows: ['CH.37'], title: 'Membrane bioreactor: membrane area, permeate and retentate',
      input: { Qp: 18061, flux: 20, peakFactor: 1.5, recycle: 4, mlss: 10, rejection: 1, tmp: 20, volume: 6000, srt: 25,
        _help: 'Example plant: BSM1 permeate (18,446 - 385 m3/d). flux in L/m2/h (net, average; fluxPeak for the peak), recycle = retentate return / permeate, mlss g/L, tmp kPa, volume m3. Ranges: see the help.' },
      async run(i) { const M = await import('./env/membrane.js'), r = M.mbr(i); return { lines: r.lines, problems: fromEngine(r.problems).concat([prob('mbr.sources', 'info', 'Typical ranges: ' + M.MBR_TYPICAL.source + '.')]) }; } },
    { id: 'ro', group: 'environment', rows: ['CH.37'], title: 'Reverse osmosis: solution-diffusion flux, recovery, permeate and concentrate',
      input: { Qf: 1000, C0: 35, recovery: 0.1, Lp: 1.06, Bs: 0.044, fos: 0.743, flux: 15, cpf: 1, Pp: 0, maxPressure: 70,
        _help: 'Lp, Bs and fos are one seawater element\'s (Li and Li 2025): use your membrane\'s. Qf m3/d, C0 g/L, recovery 0-1, Lp L/m2/h/bar, Bs L/m2/h, fos bar per g/L; give area (m2) or flux (L/m2/h).' },
      async run(i) { const M = await import('./env/membrane.js'), r = M.ro(i); return { lines: r.lines, problems: fromEngine(r.problems).concat([prob('ro.sources', 'info', 'Model and the one set of values read: ' + M.RO_TYPICAL.source + '.')]) }; } },
    { id: 'dosing', group: 'environment', rows: ['CH.38'], picker: true, title: 'Chemical dosing: phosphorus precipitation, alkalinity, chlorine',
      input: { phosphorus: { Q: 18061, Pin: 5, Ptarget: 1, ratio: 1.5, metal: 'fe', strength: 0.40, density: null },
        alkalinity: { Q: 18061, nitrified: 25, denitrified: 15, alkIn: 150, residual: 50, chemical: 'lime', purity: 1 },
        chlorine: { Q: 18061, demand: 5, residual: 0.5, product: 'hypochlorite', strength: null, density: null },
        _help: 'Example flows and concentrations. ratio = mol metal per mol soluble P; strength = w/w fraction of the product; density kg/L (your supplier\'s: none is assumed); alkalinity in mg/L as CaCO3.' },
      options: async () => [
        { label: 'Iron: ferric chloride', set: { phosphorus: { Q: 18061, Pin: 5, Ptarget: 1, ratio: 1.5, metal: 'fe', strength: 0.40, density: null } } },
        { label: 'Aluminium: alum (Al2(SO4)3.14H2O)', set: { phosphorus: { Q: 18061, Pin: 5, Ptarget: 1, ratio: 1.5, metal: 'al', strength: 0.48, density: null } } },
        { label: 'Caustic soda for alkalinity', set: { alkalinity: { Q: 18061, nitrified: 25, denitrified: 15, alkIn: 350, residual: 50, chemical: 'caustic', purity: 1 } } },
      ],
      async run(i) {
        const D = await import('./env/dosing.js'), lines = [], problems = [];
        for (const [key, fn, title] of [['phosphorus', D.phosphorus, 'phosphorus'], ['alkalinity', D.alkalinity, 'alkalinity'], ['chlorine', D.chlorine, 'chlorine']]) {
          if (!i[key]) continue;
          const r = fn(i[key]); for (const l of r.lines) lines.push({ ...l, k: title + ': ' + l.k }); problems.push(...fromEngine(r.problems));
        }
        if (!lines.length && !problems.length) problems.push(prob('dosing.empty', 'warning', 'Give at least one of phosphorus, alkalinity or chlorine.'));
        return { lines, problems: problems.concat([prob('dosing.sources', 'info', 'Ratios and stoichiometry: ' + D.EPA.source + '. Molar masses from the standard atomic weights.')]) };
      } },
  ];
}
