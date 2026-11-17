/* SPDX-License-Identifier: Apache-2.0 */
/**
 * os-radioss.js — writes an explicit dynamics run (a drop onto a rigid floor, an impact, a push at a given speed) as the two input decks of
 * the OpenRadioss solver (lib/opensolvers; suggestion 1309). DOM-free. The solver is a separate program the person adds to their own
 * computer and runs themselves (AGPL; nothing of it is in here: we write the text decks its reference guide documents).
 *
 * Written for input version 2022 (`/BEGIN … 2022`, engine `/VERS/2022`): the card layouts of the Radioss Reference Guide (Altair help,
 * "Starter Input" topics, read 2026-11-11) as they stood for 2022, which is what the solver's own test decks use; later input versions
 * add lines to several cards (INIVEL, PROP/SOLID, MAT/LAW2, INTER/TYPE7), so the version is fixed here.
 *   <name>_0000.rad  the starter deck, block format: every line is ten fields of ten characters; whole numbers right-justified in one
 *                    field, real numbers in two (twenty characters); `#` starts a comment line.
 *                    /BEGIN (run name, 2022, the unit lines Mg mm s twice) · /MAT/ELAST (LAW1) or /MAT/PLAS_JOHNS (LAW2, Johnson-Cook) ·
 *                    /PROP/SOLID (TYPE14) · /PART · /NODE · /TETRA4 or /TETRA10 (two lines an element; mid nodes 1-2, 2-3, 3-1, 1-4, 2-4,
 *                    3-4) · /GRNOD/PART, /GRNOD/NODE · /BCS · /INIVEL/TRA · /FUNCT + /IMPVEL · /RWALL/PLANE · /GRAV ·
 *                    /SURF/PART/EXT + /INTER/TYPE7 (self-contact) · /END
 *   <name>_0001.rad  the engine deck, free format: /RUN/<name>/1 + end time, /VERS/2022, /TFILE/4, /ANIM/DT, /ANIM/VECT/DISP and VEL,
 *                    /ANIM/ELEM/VONM and EPSP, /ANIM/BRICK/TENS/STRESS, /PRINT, /MON/ON
 * Units: Mg (tonne), mm, s, so forces are N and stresses MPa (the guide's own table of consistent units: steel 7.8e-9, 2.1e+5, gravity
 * 9.81e+3). Density kg/m³ × 1e-12; speeds m/s × 1000; the run time is entered in ms and written in s.
 * Elements: /PROP/SOLID is written with Ismstr = -1 and Itetra4 = 3 (the values of the solver's own tetrahedron test deck) and, for
 * ten-node elements, Itetra10 = 2 (the guide's example). A tetrahedron is written with (N2−N1)×(N3−N1)·(N4−N1) > 0.
 * The rigid floor: the plane's normal runs from M to M1 and the solver acts on a node only once it is on the far side of it (its plane
 * routine skips nodes with a positive distance), so M1 is put on the body's side.
 * Results: the solver writes binary animation files <name>A001 …; its own converter anim_to_vtk writes each as legacy ASCII VTK, which
 * os-vtk.js reads (cell scalars 3DELEM_Von_Mises, 3DELEM_Plastic_Strain; point vectors Displacement, Velocity; points already moved).
 *
 *   radiossCase({ name, impact, material, groups, mesh }) → { files, info, problems }
 */
import { safeName } from './os-geom.js';
import { DIRS } from './os-setup.js';
import { orientMesh } from './os-aster.js';

export const RADIOSS_VERSION = 'OpenRadioss, input version 2022';
const I = (v) => String(v).padStart(10);
const B = ' '.repeat(10);
export function real20(v) {
  if (!Number.isFinite(v)) v = 0;
  let s = String(+v.toPrecision(14));
  if (s.length > 20) s = v.toExponential(12);
  return s.padStart(20);
}
const R = real20;
const AXIS = ['X', 'Y', 'Z'];
const ruler = '#---1----|----2----|----3----|----4----|----5----|----6----|----7----|----8----|----9----|---10----|';

export function radiossCase({ name: rawName, impact, material, groups = [], mesh }) {
  let name = safeName(rawName, 'drop', 24); if (name.length < 4) name = (name + '_run').slice(0, 24);   // a run name has at least four characters
  const problems = [], M = orientMesh(mesh), t10 = impact.elem === 'tetra10';
  if (!M.ne) problems.push({ code: 'no_elements' });
  if (M.bad) problems.push({ code: 'bad_elements', n: M.bad });
  if (!(material.rho > 0)) problems.push({ code: 'no_density' });
  // node ids: every node for ten-node elements, the corners only (renumbered) for four-node ones
  const id = new Int32Array(M.n); let nn = 0;
  if (t10) { for (let i = 0; i < M.n; i++) id[i] = i + 1; nn = M.n; }
  else for (let e = 0; e < M.ne; e++) for (let a = 0; a < 4; a++) { const k = M.tets[10 * e + a]; if (!id[k]) id[k] = ++nn; }
  const X = M.nodes, rho = material.rho * 1e-12, tEnd = impact.tEnd * 1e-3;
  // the shortest element edge, for the time step the person should expect
  let hmin = Infinity;
  const P = [[0, 1], [1, 2], [0, 2], [0, 3], [1, 3], [2, 3]];
  for (let e = 0; e < M.ne; e++) for (const [a, b] of P) { const i = M.tets[10 * e + a], j = M.tets[10 * e + b]; const d = Math.hypot(X[3 * i] - X[3 * j], X[3 * i + 1] - X[3 * j + 1], X[3 * i + 2] - X[3 * j + 2]); if (d < hmin) hmin = d; }
  if (t10) hmin /= 2;
  const c = rho > 0 ? Math.sqrt(material.E / rho) : 0, dt = c > 0 && Number.isFinite(hmin) ? 0.9 * hmin / c : 0, cycles = dt > 0 ? Math.round(tEnd / dt) : 0;
  if (cycles > 5e6) problems.push({ code: 'many_cycles', n: cycles });

  const G = [];
  for (const g of groups) {
    if (g.role !== 'fixed' && g.role !== 'velocity') continue;
    const want = new Set(g.faces), nodes = new Set();
    for (let t = 0; t < M.nt; t++) if (want.has(M.bface[t])) for (let k = 0; k < (t10 ? 6 : 3); k++) nodes.add(id[M.tris[6 * t + k]]);
    if (!nodes.size) { problems.push({ code: 'group_empty', id: g.id }); continue; }
    G.push({ ...g, grnod: 10 + G.length + 1, nodes: [...nodes].sort((a, b) => a - b) });
  }
  const v0 = impact.v0.map((v) => v * 1000), moving = Math.hypot(...v0) > 0, pushes = G.filter((g) => g.role === 'velocity');
  if (!moving && !pushes.length && !impact.gravity) problems.push({ code: 'no_motion' });
  const d = DIRS[impact.floorDir], ax = d.findIndex((v) => v !== 0);

  const L = ['#RADIOSS STARTER',
    '# ' + name + '_0000.rad - written by CadCraft (Open solver cases add-on)',
    '# for ' + RADIOSS_VERSION + '.',
    '# The solver is a separate program: it is not part of CadCraft.',
    '# This deck has not been run in the solver by CadCraft.',
    '# Units: Mg (tonne), mm, s -> N, MPa, mJ.',
    '# Density t/mm3 = kg/m3 x 1e-12; speeds mm/s; gravity 9810 mm/s2.',
    ruler, '/BEGIN', name, I(2022) + I(0),
    // the two unit lines (input units, work units): mass, length, time, each right-justified in twenty characters
    'Mg'.padStart(20) + 'mm'.padStart(20) + 's'.padStart(20), 'Mg'.padStart(20) + 'mm'.padStart(20) + 's'.padStart(20)];
  if (impact.law === 'jc') {
    const j = impact.jc;
    L.push(ruler, '/MAT/PLAS_JOHNS/1', 'material (Johnson-Cook, the numbers typed in CadCraft)', '#              RHO_I', R(rho),
      '#                  E                  Nu     Iflag', R(material.E) + R(material.nu) + I(0),
      '#                  a                   b                   n           EPS_p_max            SIG_max0', R(j.a) + R(j.b) + R(j.n) + R(0) + R(0),
      '#                  c           EPS_DOT_0       ICC   Fsmooth               F_cut               Chard', R(j.c) + R(j.eps0) + I(0) + I(0) + R(0) + R(0),
      '#                  m              T_melt              rhoC_p                 T_r', R(0) + R(0) + R(0) + R(0));
  } else L.push(ruler, '/MAT/ELAST/1', 'material (linear elastic)', '#              RHO_I', R(rho), '#                  E                  Nu', R(material.E) + R(material.nu));
  L.push(ruler, '/PROP/SOLID/1', 'solid',
    '#   Isolid    Ismstr               Icpre  Itetra10     Inpts   Itetra4    Iframe                  dn', I(0) + I(-1) + B + I(0) + I(t10 ? 2 : 0) + I(0) + I(t10 ? 0 : 3) + I(0) + R(0),
    '#                q_a                 q_b                   h            LAMBDA_V                MU_V', R(0) + R(0) + R(0) + R(0) + R(0),
    '#             dt_min', R(0),
    ruler, '/PART/1', 'part', '#  prop_ID    mat_ID subset_ID', I(1) + I(1) + I(0),
    ruler, '/NODE', '#  node_ID                  Xc                  Yc                  Zc');
  const nodeLines = new Array(nn);
  for (let i = 0; i < M.n; i++) if (id[i]) nodeLines[id[i] - 1] = I(id[i]) + R(X[3 * i]) + R(X[3 * i + 1]) + R(X[3 * i + 2]);
  L.push(...nodeLines);
  if (t10) {
    L.push(ruler, '/TETRA10/1', '# tetra_ID, then on the next line node_ID1 ... node_ID10');
    for (let e = 0; e < M.ne; e++) L.push(I(e + 1), Array.from(M.tets.subarray(10 * e, 10 * e + 10), (k) => I(id[k])).join(''));
  } else {
    L.push(ruler, '/TETRA4/1', '# tetra_ID  node_ID1  node_ID2  node_ID3  node_ID4');
    for (let e = 0; e < M.ne; e++) L.push(I(e + 1) + Array.from(M.tets.subarray(10 * e, 10 * e + 4), (k) => I(id[k])).join(''));
  }
  L.push(ruler, '/GRNOD/PART/1', 'every node of the part', I(1));
  for (const g of G) { L.push(ruler, '/GRNOD/NODE/' + g.grnod, g.role + ' ' + g.id); for (let i = 0; i < g.nodes.length; i += 10) L.push(g.nodes.slice(i, i + 10).map(I).join('')); }
  G.filter((g) => g.role === 'fixed').forEach((g, k) => L.push(ruler, '/BCS/' + (k + 1), 'fixed ' + g.id, '#  Tra rot   skew_ID  grnod_ID', '   111 000' + I(0) + I(g.grnod)));
  if (moving) L.push(ruler, '/INIVEL/TRA/1', 'initial velocity of the whole part', '#                 Vx                  Vy                  Vz  grnod_ID   skew_ID', R(v0[0]) + R(v0[1]) + R(v0[2]) + I(1) + I(0));
  if (pushes.length) {
    L.push(ruler, '/FUNCT/1', 'constant 1', '#                  X                   Y', R(0) + R(1), R(1) + R(1));
    let k = 0;
    for (const g of pushes) g.v.forEach((v, a) => {
      if (v === 0) return;
      L.push(ruler, '/IMPVEL/' + (++k), 'imposed velocity ' + g.id + ' ' + AXIS[a], '#funct_IDT       Dir   skew_ID sensor_ID  grnod_ID  frame_ID     Icoor', I(1) + AXIS[a].padStart(10) + I(0) + I(0) + I(g.grnod) + I(0) + I(0),
        '#           Ascale_x            Fscale_Y              Tstart               Tstop', R(1) + R(v * 1000) + R(0) + R(0));
    });
  }
  let floor = null;
  if (impact.floor) {
    let top = -Infinity; const cen = [0, 0, 0];
    for (let i = 0; i < M.n; i++) { if (!id[i]) continue; const pr = X[3 * i] * d[0] + X[3 * i + 1] * d[1] + X[3 * i + 2] * d[2]; if (pr > top) top = pr; for (let a = 0; a < 3; a++) cen[a] += X[3 * i + a] / nn; }
    const off = top + impact.gap - (cen[0] * d[0] + cen[1] * d[1] + cen[2] * d[2]);
    const Mp = cen.map((v, a) => v + d[a] * off), M1 = Mp.map((v, a) => v - d[a]);
    floor = { M: Mp, M1 };
    L.push(ruler, '/RWALL/PLANE/1', 'rigid floor', '#  node_ID     Slide grnod_ID1 grnod_ID2', I(0) + I(0) + I(1) + I(0),
      '#           D_search                fric            Diameter                ffac       ifq', R(0) + R(0) + R(0) + R(0) + I(0),
      '#                 XM                  YM                  ZM', R(Mp[0]) + R(Mp[1]) + R(Mp[2]), '#               X_M1                Y_M1                Z_M1', R(M1[0]) + R(M1[1]) + R(M1[2]));
  }
  if (impact.gravity) L.push(ruler, '/GRAV/1', 'gravity', '#funct_IDT       DIR   skew_ID sensor_ID  grnod_ID                      Ascale_x            Fscale_Y', I(0) + AXIS[ax].padStart(10) + I(0) + I(0) + I(0) + B + R(0) + R(d[ax] * 9810));
  if (impact.contact) {
    L.push(ruler, '/SURF/PART/EXT/2', 'outside faces of the part', I(1),
      ruler, '/INTER/TYPE7/1', 'self-contact of the part',
      '# grnod_id   surf_id      Istf      Ithe      Igap                Ibag      Idel     Icurv      Iadm', I(1) + I(2) + I(0) + I(0) + I(0) + B + I(0) + I(0) + I(0) + I(0),
      '#          Fscalegap             Gap_max             Fpenmax                         Itied', R(0) + R(0) + R(0) + B + B + I(0),
      '#              Stmin               Stmax          %mesh_size               dtmin  Irem_gap   Irem_i2', R(0) + R(0) + R(0) + R(0) + I(0) + I(0),
      '#              Stfac                Fric              Gapmin              Tstart               Tstop', R(0) + R(0) + R(0) + R(0) + R(0),
      '#      IBC                        Inacti                VisS                VisF              Bumult', '       000' + B + B + I(0) + R(0) + R(0) + R(0),
      '#    Ifric    Ifiltr               Xfreq     Iform   sens_ID   fct_IDf             AscaleF   fric_ID', I(0) + I(0) + R(0) + I(0) + I(0) + I(0) + R(0) + I(0));
  }
  L.push(ruler, '/END', '');

  const tfreq = tEnd / impact.frames;
  const E = ['#RADIOSS ENGINE', '# ' + name + '_0001.rad - written by CadCraft for ' + RADIOSS_VERSION + '.', '# Units Mg, mm, s. Not run in the solver by CadCraft.',
    '/RUN/' + name + '/1', String(+tEnd.toPrecision(12)), '/VERS/2022', '/TFILE/4', String(+(tfreq / 10).toPrecision(6)), '/ANIM/DT', '0.0 ' + String(+tfreq.toPrecision(6)),
    '/ANIM/VECT/DISP', '/ANIM/VECT/VEL', '/ANIM/ELEM/VONM', '/ANIM/ELEM/EPSP', '/ANIM/BRICK/TENS/STRESS', '/PRINT/-100', '/MON/ON', ''];
  const readme = [
    name + ' - an explicit dynamics run written by CadCraft (Open solver cases add-on)', '',
    'Written for ' + RADIOSS_VERSION + '. The solver is a separate program: it is not part of CadCraft, and you add it to your own computer yourself.',
    'No deck from this add-on has yet been run in the real solver by CadCraft. Read ' + name + '_0000.out and ' + name + '_0001.out and check the energies before you rely on a result.', '',
    'UNITS', '  Mg (tonne), mm, s, so forces are N and stresses MPa. Density ' + String(material.rho) + ' kg/m3 -> ' + String(+rho.toPrecision(12)) + ' t/mm3.',
    '  Speeds are written in mm/s (m/s x 1000), gravity as 9810 mm/s2, the run time ' + String(impact.tEnd) + ' ms as ' + String(+tEnd.toPrecision(12)) + ' s.', '',
    'WHAT IS IN IT', '  ' + nn + ' nodes, ' + M.ne + ' ' + (t10 ? 'ten-node' : 'four-node') + ' tetrahedra, mass ' + String(+(M.volume * rho * 1000).toPrecision(6)) + ' kg.',
    '  Material: ' + (impact.law === 'jc' ? 'Johnson-Cook (LAW2), with the numbers typed in CadCraft.' : 'linear elastic (LAW1).'),
    ...(moving ? ['  Initial velocity of the whole part: ' + impact.v0.join(', ') + ' m/s.'] : []),
    ...(floor ? ['  Rigid floor: a plane through (' + floor.M.map((v) => +v.toPrecision(6)).join(', ') + ') mm, ' + String(impact.gap) + ' mm beyond the part on its ' + ['+X', '-X', '+Y', '-Y', '+Z', '-Z'][impact.floorDir] + ' side.'] : []),
    ...(impact.gravity ? ['  Gravity 9810 mm/s2 toward ' + ['+X', '-X', '+Y', '-Y', '+Z', '-Z'][impact.floorDir] + '.'] : []),
    ...(impact.contact ? ['  Self-contact of the part (interface TYPE7 on its outside faces), with the solver\'s default gap and stiffness.'] : []),
    '  Sound speed sqrt(E / rho) = ' + String(+(c / 1000).toPrecision(4)) + ' m/s; shortest element edge ' + String(+hmin.toPrecision(4)) + ' mm; expect a time step near ' + (dt > 0 ? dt.toExponential(2) : '?') + ' s, about ' + cycles.toLocaleString('en-US') + ' cycles.',
    '  ' + impact.frames + ' animation states, one every ' + String(+tfreq.toPrecision(4)) + ' s.', '',
    'RUN IT (in a terminal where the solver is set up as its own instructions say, inside this folder)', '  starter_linux64_gf -i ' + name + '_0000.rad -np 1', '  engine_linux64_gf -i ' + name + '_0001.rad',
    '(on Windows: starter_win64.exe and engine_win64.exe with the same options)', '',
    'BRING THE RESULTS BACK', '  The run writes binary animation files ' + name + 'A001, ' + name + 'A002, ... Turn each into ASCII VTK with the solver\'s own converter:',
    '    anim_to_vtk_linux64_gf ' + name + 'A001 > ' + name + '_001.vtk', '  In CadCraft press Import results and choose the .vtk files (several at once gives the frames).', '',
  ];
  return { name, files: [{ name: name + '_0000.rad', data: L.join('\n') }, { name: name + '_0001.rad', data: E.join('\n') }, { name: 'README.txt', data: readme.join('\n') }],
    info: { nodes: nn, elements: M.ne, mass: M.volume * rho * 1000, volume: M.volume, soundSpeed: c, hmin, dt, cycles, tEnd, floor, groups: G.map((g) => ({ id: g.id, role: g.role, grnod: g.grnod, nodes: g.nodes.length })) }, problems };
}
