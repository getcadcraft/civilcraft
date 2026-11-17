/* SPDX-License-Identifier: Apache-2.0 */
/**
 * os-aster.js — writes a structural or thermal study for code_aster as text files, and reads its text result listing back
 * (lib/opensolvers; suggestion 1309). DOM-free. code_aster is a separate program the person adds to their own computer and runs themselves
 * (GPL; nothing of it is in here: we write the command file and the mesh file its manuals document, and read a text file it prints).
 *
 * Written for code_aster 17 (the command catalogue and the test cases of its branch v17, and the U manuals of version 16, read 2026-11-11):
 *   <name>.mail    the mesh in the ASTER text format (manual U3.01.00; LIRE_MAILLAGE FORMAT="ASTER"): TITRE, COOR_3D, TRIA6 (the skin),
 *                  TETRA10, GROUP_MA … FINSF, FIN. Lines stay under 80 characters (the reader stops on a longer line), a record starts on a
 *                  new line, names are N<i> and M<i> in file order with no gaps (version 17 knows entities by that order). Node order of
 *                  TETRA10: corners 1-4, then the mid nodes of 1-2, 2-3, 1-3, 1-4, 2-4, 3-4; of TRIA6: 1-2, 2-3, 3-1 (the reference
 *                  elements in the solver's own tables, checked against the test mesh zzzz289a.mail): the same order as lib/fem.
 *                  A tetrahedron is written with (N2−N1)×(N3−N1)·(N4−N1) > 0 and a skin triangle with its normal pointing out of the solid.
 *   <name>.comm    the command file: LIRE_MAILLAGE, MODI_MAILLAGE ORIE_PEAU (skin normals outward, whatever we wrote), AFFE_MODELE,
 *                  DEFI_MATERIAU, AFFE_MATERIAU, AFFE_CHAR_MECA (DDL_IMPO, FORCE_FACE, PRES_REP, PESANTEUR) + MECA_STATIQUE + CALC_CHAMP,
 *                  or ASSEMBLAGE + CALC_MODES, or AFFE_CHAR_THER (TEMP_IMPO, FLUX_REP, ECHANGE) + THER_LINEAIRE TYPE_CALCUL="STAT";
 *                  IMPR_RESU FORMAT="RESULTAT" (the text listing we read) and FORMAT="MED" (for the person's own viewer).
 *   <name>.export  the run description for run_aster (as_run before 15.2): comm 1, mail 20, mess 6, resu 8, rmed 80.
 *
 * Units: code_aster has no units of its own; the files must be consistent. The decks are mm, tonne, s (so N and MPa):
 *   E MPa · density kg/m³ × 1e-12 = t/mm³ · gravity 9810 mm/s² · force N · pressure MPa · FORCE_FACE = force / area (N/mm² = MPa)
 *   heat: mm, W, K (°C): conductivity W/(m·K) × 1e-3 = W/(mm·K) · flux W/m² × 1e-6 = W/mm² · film coefficient W/(m²·K) × 1e-6
 * PRES_REP is positive against the outward normal (manual U4.44.01), so a positive pressure pushes on the solid, as in the panel.
 *
 * Result listing (IMPR_RESU FORMAT="RESULTAT"): its layout is "not fixed" by the manual (U4.91.01), so the reader is tolerant: a field starts
 * at `CHAMP AUX NOEUDS DE NOM SYMBOLIQUE <name>`, `NUMERO D'ORDRE` gives the order number (and FREQ or INST when printed), the line starting
 * with NOEUD names the components, each data line is a node (N<i> in versions 15 and 16, the bare number i in 17) and its values, a line of
 * numbers only continues the node above, a blank line ends the field. No real listing was available to test against: the layout is taken
 * from the solver's print routines and the manual's sample.
 *
 *   asterCase({ name, structure, material, groups, mesh }) → { files, info, problems }
 *   parseAsterResult(text) → { records: [{ field, order, freq, inst, comps, values: Map(node index → number[]) }] }
 *   asterFrames(parsed, mesh) → [{ label, freq, vtk }]   one frame an order number, in the shape os-vtk.js fieldList / surfaceOf read
 */
import { safeName } from './os-geom.js';
import { DIRS, STRUCTURE_ROLES } from './os-setup.js';

export const ASTER_VERSION = 'code_aster 17';
const PREFIX = { fixed: 'FIX', force: 'FRC', pressure: 'PRS', temp: 'TMP', flux: 'FLX', conv: 'CNV' };
const e14 = (v) => { const [m, x] = v.toExponential(14).split('e'); return (v < 0 ? '' : ' ') + m + 'E' + x[0] + x.slice(1).padStart(2, '0'); };
const py = (v) => { if (!Number.isFinite(v)) return '0.0'; const s = String(+v.toPrecision(12)); return /[.e]/.test(s) ? s : s + '.0'; };

/** The mesh ready to write: tets with positive volume, skin triangles outward, areas by host face. */
export function orientMesh(mesh) {
  const X = mesh.nodes, ne = mesh.tets10.length / 10, nt = mesh.btri6.length / 6;
  const tets = new Int32Array(mesh.tets10), tris = new Int32Array(mesh.btri6);
  const p = (i) => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
  let flipped = 0, bad = 0, volume = 0;
  for (let e = 0; e < ne; e++) {
    const a = p(tets[10 * e]), b = p(tets[10 * e + 1]), c = p(tets[10 * e + 2]), d = p(tets[10 * e + 3]);
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], w = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
    const vol = (u[0] * (v[1] * w[2] - v[2] * w[1]) - u[1] * (v[0] * w[2] - v[2] * w[0]) + u[2] * (v[0] * w[1] - v[1] * w[0])) / 6;
    if (Math.abs(vol) < 1e-300) bad++;
    if (vol < 0) {   // swap corners 2 and 3: the mid nodes 1-2 ↔ 1-3 and 2-4 ↔ 3-4 change places, 2-3 and 1-4 stay
      const o = 10 * e, sw = (i, j) => { const q = tets[o + i]; tets[o + i] = tets[o + j]; tets[o + j] = q; };
      sw(1, 2); sw(4, 6); sw(8, 9); flipped++;
    }
    volume += Math.abs(vol);
  }
  // skin: outward when the closed surface's signed volume is positive (the triangles of one mesh are consistently ordered)
  let sv = 0;
  for (let t = 0; t < nt; t++) { const a = p(tris[6 * t]), b = p(tris[6 * t + 1]), c = p(tris[6 * t + 2]); sv += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6; }
  if (sv < 0) for (let t = 0; t < nt; t++) { const o = 6 * t, sw = (i, j) => { const q = tris[o + i]; tris[o + i] = tris[o + j]; tris[o + j] = q; }; sw(1, 2); sw(3, 5); }   // corners 2 ↔ 3: mids 1-2 ↔ 3-1
  const area = new Map();
  for (let t = 0; t < nt; t++) {
    const a = p(tris[6 * t]), b = p(tris[6 * t + 1]), c = p(tris[6 * t + 2]), u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const A = Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]) / 2;   // the flat (chord) triangle
    area.set(mesh.bface[t], (area.get(mesh.bface[t]) || 0) + A);
  }
  return { nodes: X, tets, tris, bface: mesh.bface, n: X.length / 3, ne, nt, flipped, bad, volume, skinFlipped: sv < 0, area };
}

function mailFile(name, M, groups) {
  const L = [' TITRE', ' ' + name + ' - CadCraft, mm (mesh for ' + ASTER_VERSION + ')', ' FINSF', ' %', ' COOR_3D'];
  for (let i = 0; i < M.n; i++) L.push(' ' + ('N' + (i + 1)).padEnd(8) + ' ' + e14(M.nodes[3 * i]) + ' ' + e14(M.nodes[3 * i + 1]) + ' ' + e14(M.nodes[3 * i + 2]));
  L.push(' FINSF', ' %', ' TRIA6');
  const nm = (k) => ('N' + (k + 1)).padEnd(9);
  for (let t = 0; t < M.nt; t++) L.push((' ' + ('M' + (t + 1)).padEnd(9) + Array.from(M.tris.subarray(6 * t, 6 * t + 6), nm).join('')).trimEnd());
  L.push(' FINSF', ' %', ' TETRA10');
  for (let e = 0; e < M.ne; e++) {
    const v = Array.from(M.tets.subarray(10 * e, 10 * e + 10), nm);
    L.push((' ' + ('M' + (M.nt + e + 1)).padEnd(9) + v.slice(0, 7).join('')).trimEnd(), ('          ' + v.slice(7).join('')).trimEnd());
  }
  L.push(' FINSF', ' %');
  const list = (gname, ids) => { L.push(' GROUP_MA', ' ' + gname); for (let i = 0; i < ids.length; i += 7) L.push(' ' + ids.slice(i, i + 7).map((k) => 'M' + k).join(' ')); L.push(' FINSF', ' %'); };
  list('SKIN', Array.from({ length: M.nt }, (_, t) => t + 1));
  list('VOL', Array.from({ length: M.ne }, (_, e) => M.nt + e + 1));
  for (const g of groups) list(g.gname, g.tris.map((t) => t + 1));
  L.push(' FIN');
  return L.join('\n') + '\n';
}

export function asterCase({ name: rawName, structure, material, groups = [], mesh }) {
  const name = safeName(rawName, 'study', 24), kind = structure.kind, problems = [];
  const M = orientMesh(mesh);
  if (!M.ne) problems.push({ code: 'no_elements' });
  if (M.bad) problems.push({ code: 'bad_elements', n: M.bad });
  const roles = STRUCTURE_ROLES[kind], G = [];
  for (const g of groups) {
    if (!roles.includes(g.role)) continue;
    const want = new Set(g.faces), tris = [];
    for (let t = 0; t < M.nt; t++) if (want.has(M.bface[t])) tris.push(t);
    if (!tris.length) { problems.push({ code: 'group_empty', id: g.id }); continue; }
    G.push({ ...g, gname: PREFIX[g.role] + '_' + g.id.toUpperCase(), tris, area: g.faces.reduce((s, f) => s + (M.area.get(f) || 0), 0) });
  }
  const of = (role) => G.filter((g) => g.role === role), q = (s) => '"' + s + '"';
  const rho = material.rho * 1e-12;
  const C = [
    '# ' + name + '.comm - written by CadCraft (Open solver cases add-on) for ' + ASTER_VERSION + '.',
    '# code_aster is a separate program: it is not part of CadCraft. This study has not been run in the solver by CadCraft.',
    '# Units: mm, tonne, s -> N, MPa. E in MPa, density in t/mm3 (kg/m3 x 1e-12), gravity 9810 mm/s2, forces in N, pressures in MPa.',
    ...(kind === 'thermal' ? ['# Heat: mm, W, degrees C. Conductivity W/(mm.K) = W/(m.K) x 1e-3; flux W/mm2 = W/m2 x 1e-6; film coefficient W/(mm2.K) = W/(m2.K) x 1e-6.'] : []),
    '# Mesh: ' + M.n + ' nodes, ' + M.ne + ' TETRA10, ' + M.nt + ' TRIA6 on the skin (group SKIN); groups: ' + (G.map((g) => g.gname).join(', ') || 'none') + '.',
    '', 'DEBUT()', '', 'mesh = LIRE_MAILLAGE(FORMAT="ASTER", UNITE=20)', '',
    '# skin normals outward (PRES_REP pushes against the outward normal)',
    'mesh = MODI_MAILLAGE(reuse=mesh, MAILLAGE=mesh, ORIE_PEAU=_F(GROUP_MA_PEAU=("SKIN",)))', '',
  ];
  if (kind === 'thermal') {
    if (!(material.k > 0)) problems.push({ code: 'no_conductivity' });
    if (!of('temp').length && !of('conv').length) problems.push({ code: 'no_thermal' });
    C.push('model = AFFE_MODELE(MAILLAGE=mesh, AFFE=_F(TOUT="OUI", PHENOMENE="THERMIQUE", MODELISATION="3D"))', '',
      'mater = DEFI_MATERIAU(THER=_F(LAMBDA=' + py((material.k || 0) * 1e-3) + ', RHO_CP=0.0))   # ' + py(material.k || 0) + ' W/(m.K); RHO_CP is not used by a steady study', '',
      'chmat = AFFE_MATERIAU(MAILLAGE=mesh, AFFE=_F(TOUT="OUI", MATER=mater))', '', 'load = AFFE_CHAR_THER(', '    MODELE=model,');
    if (of('temp').length) C.push('    TEMP_IMPO=(', ...of('temp').map((g) => '        _F(GROUP_MA=' + q(g.gname) + ', TEMP=' + py(g.T) + '),'), '    ),');
    if (of('flux').length) C.push('    FLUX_REP=(', ...of('flux').map((g) => '        _F(GROUP_MA=' + q(g.gname) + ', FLUN=' + py(g.q * 1e-6) + '),   # ' + py(g.q) + ' W/m2; check the sign rule of FLUN in manual U4.44.02'), '    ),');
    if (of('conv').length) C.push('    ECHANGE=(', ...of('conv').map((g) => '        _F(GROUP_MA=' + q(g.gname) + ', COEF_H=' + py(g.hc * 1e-6) + ', TEMP_EXT=' + py(g.Tinf) + '),   # ' + py(g.hc) + ' W/(m2.K)'), '    ),');
    C.push(')', '', 'resu = THER_LINEAIRE(', '    MODELE=model,', '    CHAM_MATER=chmat,', '    EXCIT=_F(CHARGE=load),', '    TYPE_CALCUL="STAT",', '    INCREMENT=_F(LIST_INST=DEFI_LIST_REEL(VALE=0.0)),', ')', '',
      'IMPR_RESU(FORMAT="RESULTAT", UNITE=8, RESU=_F(RESULTAT=resu, NOM_CHAM="TEMP"))', '', 'IMPR_RESU(FORMAT="MED", UNITE=80, RESU=_F(RESULTAT=resu))', '');
  } else {
    const needRho = kind === 'modal' || structure.gravity;
    if (needRho && !(material.rho > 0)) problems.push({ code: 'no_density' });
    if (!of('fixed').length) problems.push({ code: kind === 'static' ? 'no_fixed' : 'modal_free' });
    C.push('model = AFFE_MODELE(MAILLAGE=mesh, AFFE=_F(TOUT="OUI", PHENOMENE="MECANIQUE", MODELISATION="3D"))', '',
      'mater = DEFI_MATERIAU(ELAS=_F(E=' + py(material.E) + ', NU=' + py(material.nu) + ', RHO=' + py(rho) + '))   # ' + py(material.rho) + ' kg/m3', '',
      'chmat = AFFE_MATERIAU(MAILLAGE=mesh, AFFE=_F(TOUT="OUI", MATER=mater))', '');
    if (of('fixed').length) C.push('fix = AFFE_CHAR_MECA(', '    MODELE=model,', '    DDL_IMPO=(', ...of('fixed').map((g) => '        _F(GROUP_MA=' + q(g.gname) + ', DX=0.0, DY=0.0, DZ=0.0),'), '    ),', ')', '');
    if (kind === 'static') {
      const hasLoad = of('force').length || of('pressure').length || structure.gravity;
      if (!hasLoad) problems.push({ code: 'no_load' });
      if (hasLoad) {
        C.push('load = AFFE_CHAR_MECA(', '    MODELE=model,');
        if (of('force').length) C.push('    FORCE_FACE=(', ...of('force').map((g) => '        _F(GROUP_MA=' + q(g.gname) + ', FX=' + py(g.F[0] / g.area) + ', FY=' + py(g.F[1] / g.area) + ', FZ=' + py(g.F[2] / g.area) + '),   # ' + g.F.map(py).join(', ') + ' N over ' + py(+g.area.toPrecision(8)) + ' mm2'), '    ),');
        if (of('pressure').length) C.push('    PRES_REP=(', ...of('pressure').map((g) => '        _F(GROUP_MA=' + q(g.gname) + ', PRES=' + py(g.p) + '),'), '    ),');
        if (structure.gravity) C.push('    PESANTEUR=_F(GRAVITE=9810.0, DIRECTION=(' + DIRS[structure.gdir].map(py).join(', ') + ')),');
        C.push(')', '');
      }
      const ex = [...(of('fixed').length ? ['_F(CHARGE=fix)'] : []), ...(hasLoad ? ['_F(CHARGE=load)'] : [])];
      C.push('resu = MECA_STATIQUE(MODELE=model, CHAM_MATER=chmat, EXCIT=(' + ex.join(', ') + (ex.length === 1 ? ',' : '') + '))', '',
        'resu = CALC_CHAMP(reuse=resu, RESULTAT=resu, CONTRAINTE="SIGM_NOEU", CRITERES="SIEQ_NOEU")', '',
        'IMPR_RESU(', '    FORMAT="RESULTAT",', '    UNITE=8,', '    RESU=(', '        _F(RESULTAT=resu, NOM_CHAM="DEPL"),', '        _F(RESULTAT=resu, NOM_CHAM="SIEQ_NOEU", NOM_CMP=("VMIS",)),', '    ),', ')', '',
        'IMPR_RESU(FORMAT="MED", UNITE=80, RESU=_F(RESULTAT=resu))', '');
    } else {
      C.push('ASSEMBLAGE(', '    MODELE=model,', '    CHAM_MATER=chmat,', ...(of('fixed').length ? ['    CHARGE=fix,'] : []), '    NUME_DDL=CO("numddl"),', '    MATR_ASSE=(', '        _F(MATRICE=CO("rigi"), OPTION="RIGI_MECA"),', '        _F(MATRICE=CO("masse"), OPTION="MASS_MECA"),', '    ),', ')', '',
        'resu = CALC_MODES(MATR_RIGI=rigi, MATR_MASS=masse, OPTION="PLUS_PETITE", CALC_FREQ=_F(NMAX_FREQ=' + structure.modes + '))', '',
        '# the frequencies are also in the table CALC_MODES prints in the .mess file', 'IMPR_RESU(FORMAT="RESULTAT", UNITE=8, RESU=_F(RESULTAT=resu, NOM_CHAM="DEPL"))', '',
        'IMPR_RESU(FORMAT="MED", UNITE=80, RESU=_F(RESULTAT=resu, NOM_CHAM="DEPL"))', '');
    }
  }
  C.push('FIN()', '');
  const exp = ['P time_limit 3600', 'P memory_limit 4096', 'P ncpus 1', 'P mpi_nbcpu 1', '', 'F comm ' + name + '.comm D 1', 'F mail ' + name + '.mail D 20', 'F mess ' + name + '.mess R 6', 'F resu ' + name + '.resu R 8', 'F rmed ' + name + '.rmed R 80', ''];
  const readme = [
    name + ' - a ' + (kind === 'thermal' ? 'steady heat' : kind === 'modal' ? 'natural frequency' : 'linear static') + ' study written by CadCraft (Open solver cases add-on)', '',
    'Written for ' + ASTER_VERSION + '. code_aster is a separate program: it is not part of CadCraft, and you add it to your own computer yourself.',
    'No study from this add-on has yet been run in the real solver by CadCraft. Read the .mess file after the run and check the result before you rely on it.', '',
    'UNITS', '  mm, tonne, s (so N and MPa). Density is written in t/mm3 (kg/m3 x 1e-12): ' + py(material.rho) + ' kg/m3 -> ' + py(rho) + '.',
    ...(kind === 'thermal' ? ['  Heat: mm, W, degrees C. Conductivity ' + py(material.k || 0) + ' W/(m.K) -> ' + py((material.k || 0) * 1e-3) + ' W/(mm.K); fluxes x 1e-6 (W/mm2).'] : ['  Displacements come back in mm, stresses in MPa, frequencies in Hz.']),
    '  The mesh volume is ' + py(+M.volume.toPrecision(8)) + ' mm3' + (kind === 'thermal' ? '.' : ', its mass ' + py(+(M.volume * rho * 1000).toPrecision(6)) + ' kg.'), '',
    'FILES', '  ' + name + '.comm    the commands', '  ' + name + '.mail    the mesh (' + M.n + ' nodes, ' + M.ne + ' ten-node tetrahedra, ' + M.nt + ' skin triangles), ASTER text format',
    '  ' + name + '.export  the run description', '  Face groups: ' + (G.map((g) => g.gname + ' (' + g.role + ', ' + g.tris.length + ' triangles)').join(', ') || 'none') + '.', '',
    'RUN IT (in a terminal, inside this folder)', '  run_aster ' + name + '.export', 'With code_aster 14 or older:', '  as_run ' + name + '.export', '',
    'BRING THE RESULTS BACK', '  The run writes ' + name + '.resu (text) and ' + name + '.rmed (MED, for ParaView or Salome). In CadCraft press Import results and choose',
    '  ' + name + '.resu. Keep the element size in CadCraft as it was when this case was written: the result is matched to the mesh by node number.', '',
    ...(kind === 'thermal' ? ['CHECK', '  FLUN: check the sign rule for the imposed flux in manual U4.44.02 before you rely on a flux face.', ''] : []),
  ];
  return { name, files: [{ name: name + '.comm', data: C.join('\n') }, { name: name + '.mail', data: mailFile(name, M, G) }, { name: name + '.export', data: exp.join('\n') }, { name: 'README.txt', data: readme.join('\n') }],
    info: { nodes: M.n, elements: M.ne, skin: M.nt, flipped: M.flipped, skinFlipped: M.skinFlipped, volume: M.volume, mass: M.volume * rho * 1000, groups: G.map((g) => ({ id: g.id, name: g.gname, role: g.role, triangles: g.tris.length, area: g.area })) }, problems };
}

const NUM = /^[+-]?(\d+\.?\d*|\.\d+)([EeDd][+-]?\d+)?$/;
const toNum = (s) => Number(s.replace(/[Dd]/, 'E'));

export function parseAsterResult(text) {
  const lines = String(text).split(/\r?\n/), records = [];
  let rec = null, lastNode = null, pendingName = null;
  const close = () => { if (rec && rec.values.size) records.push(rec); rec = null; lastNode = null; };
  for (const raw of lines) {
    const s = raw.trim();
    const head = /CHAMP AUX NOEUDS DE NOM SYMBOLIQUE\s+(\S+)/i.exec(s);
    if (head) { close(); pendingName = head[1]; rec = { field: pendingName, order: 1, freq: null, inst: null, comps: null, values: new Map() }; continue; }
    if (/CHAMP PAR ELEMENT/i.test(s)) { close(); continue; }
    if (!rec) continue;
    if (!rec.comps) {
      const o = /NUMERO D'ORDRE\s*:?\s*(\d+)/i.exec(s); if (o) rec.order = Number(o[1]);
      const f = /FREQ\s*:?\s*([+-]?[\d.]+(?:[EeDd][+-]?\d+)?)/.exec(s); if (f) rec.freq = toNum(f[1]);
      const i = /INST\s*:?\s*([+-]?[\d.]+(?:[EeDd][+-]?\d+)?)/.exec(s); if (i) rec.inst = toNum(i[1]);
      if (/^NOEUD\b/i.test(s)) rec.comps = s.split(/\s+/).slice(1);
      continue;
    }
    if (!s) { if (rec.values.size) close(); continue; }
    const tk = s.split(/\s+/);
    if (/^NOEUD\b/i.test(s)) { rec.comps = tk.slice(1); continue; }   // the header is printed again when the components change
    const id = /^N?(\d+)$/i.exec(tk[0]), allNum = tk.every((x) => NUM.test(x));
    if (allNum && /^\s{9}/.test(raw) && lastNode !== null) rec.values.get(lastNode).push(...tk.map(toNum));   // a continuation line (more than six values a node) starts with nine blanks
    else if (id && tk.length > 1 && tk.slice(1).every((x) => NUM.test(x))) { lastNode = Number(id[1]) - 1; rec.values.set(lastNode, tk.slice(1).map(toNum)); }
    else if (rec.values.size) close();
  }
  close();
  if (!records.length) throw new Error('No nodal field was found in this listing (IMPR_RESU FORMAT="RESULTAT" writes them as "CHAMP AUX NOEUDS").');
  return { records };
}

/** Frames (one an order number) as grids os-vtk.js reads: the mesh's nodes, its tetrahedra, and the nodal fields. */
export function asterFrames(parsed, mesh) {
  const n = mesh.nodes.length / 3, ne = mesh.tets10.length / 10;
  const cells = [], cellTypes = new Int32Array(ne).fill(24);
  for (let e = 0; e < ne; e++) cells.push(Int32Array.from(mesh.tets10.slice(10 * e, 10 * e + 10)));
  const orders = [...new Set(parsed.records.map((r) => r.order))].sort((a, b) => a - b);
  return orders.map((o) => {
    const pointData = {}; let freq = null;
    for (const r of parsed.records.filter((x) => x.order === o)) {
      let top = -1; for (const k of r.values.keys()) if (k > top) top = k;
      if (top >= n) throw new Error('The result has node ' + (top + 1) + ' but the mesh here has ' + n + ' nodes. Mesh with the element size the case was written with, then import again.');
      if (r.freq !== null) freq = r.freq;
      const comps = r.comps || [], ix = (c) => comps.indexOf(c);
      if (ix('DX') >= 0 && ix('DY') >= 0 && ix('DZ') >= 0) {
        const d = new Float64Array(3 * n); for (const [k, v] of r.values) { d[3 * k] = v[ix('DX')] || 0; d[3 * k + 1] = v[ix('DY')] || 0; d[3 * k + 2] = v[ix('DZ')] || 0; }
        pointData[r.field] = { comps: 3, data: d };
      } else comps.forEach((c, j) => { const d = new Float64Array(n); for (const [k, v] of r.values) d[k] = v[j] ?? 0; pointData[c === r.field ? c : r.field + '_' + c] = { comps: 1, data: d }; });
    }
    return { label: '#' + o + (freq !== null ? ' ' + +freq.toPrecision(5) + ' Hz' : ''), freq, vtk: { version: 0, title: 'code_aster', dataset: 'UNSTRUCTURED_GRID', points: mesh.nodes, cells, cellTypes, pointData, cellData: {}, fieldData: {} } };
  });
}
