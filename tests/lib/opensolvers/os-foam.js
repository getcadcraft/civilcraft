/* SPDX-License-Identifier: Apache-2.0 */
/**
 * os-foam.js — writes a complete flow case folder for the OpenFOAM programs from a model's surface (lib/opensolvers; suggestion 1309).
 * DOM-free. OpenFOAM is a separate program the person adds to their own computer and runs themselves (GPL; nothing of it is in here: we
 * write the text dictionaries its user guides and tutorial cases document, and read text files back).
 *
 * Two lines of the program exist and a few file names and keywords differ; `flavour` picks one:
 *   'esi'        written for OpenFOAM v2412 (openfoam.com): simpleFoam / icoFoam (`application`), constant/transportProperties +
 *                turbulenceProperties (`RASModel`), system/surfaceFeatureExtractDict + the surfaceFeatureExtract tool, geometry in
 *                constant/triSurface (`triSurfaceMesh`, `locationInMesh`), blockMeshDict `scale`, fields in 0.orig/ + restore0Dir,
 *                `snappyHexMesh -overwrite`, forces in the controlDict `functions` block, `foamToVTK -ascii -legacy`
 *   'foundation' written for OpenFOAM-13 (openfoam.org): `foamRun` with `solver incompressibleFluid`, constant/physicalProperties +
 *                momentumTransport (`model`), system/surfaceFeaturesDict + the surfaceFeatures tool, geometry in constant/geometry
 *                (`triSurface`, `file`, `insidePoint`), blockMeshDict `convertToMeters`, fields in 0/, snappyHexMesh overwrites by
 *                itself, forces in system/functions, PIMPLE for the transient run, `foamToVTK -ascii`
 * The layout of every dictionary follows the tutorial cases of each line as read on 2026-11-11: motorBike / motorBikeSteady
 * (snappyHexMesh, k-omega SST), pitzDaily / pitzDailySteady (residualControl), the icoFoam cavity (ESI, PISO) and cavity / offsetCylinder
 * (Foundation, PIMPLE). tools/opensolvers/test-foam.mjs compares the keywords with the lists taken from those cases.
 * snappyHexMesh cannot make constraint patches (the tutorials' own comment: "No constraint types (cyclic, symmetry) etc. are allowed"), so a
 * face picked as symmetry is written as a patch with the slip condition, which is the same thing on a flat face.
 *
 * Units: the case is SI (m, kg, s). The model is in mm: every coordinate is written × 0.001. Pressure in the files is kinematic (p/ρ, m²/s²),
 * as the incompressible solvers of both lines expect.
 *
 * Flow kinds:
 *   external  the model is a body in a box of fluid (wind tunnel): box faces = inlet, outlet and slip sides; the body = wall patches
 *   internal  the model IS the fluid space (model the inside of the duct as a solid): picked faces = inlets, outlets, symmetry, slip; the rest = walls
 * Inlet turbulence (k-omega SST) from the intensity I and a length scale L by the usual formulas (as documented in both lines' own
 * inlet conditions turbulentIntensityKineticEnergyInlet and turbulentMixingLengthFrequencyInlet, "C_mu, set to 0.09"; also Versteeg and
 * Malalasekera, An Introduction to Computational Fluid Dynamics, 2nd ed., section 3.7.2):
 *   k = 1.5 (U I)²      omega = √k / (Cμ^¼ L),  Cμ = 0.09
 *
 *   flowInfo(input) → { box, cells, n, cell, U, k, omega, L, Re, dt, location, patches, problems }   what the panel shows before writing
 *   foamCase(input) → { files: [{ name, data }], info, problems }
 *   input = { name, flow (os-setup.js), groups: [{ id, role, faces: [host face index], U?, p? }], surface (os-geom.js), toM = 0.001 }
 */
import { bounds, faceTriangles, otherTriangles, patchStats, stlAscii, inside, distance, triCount, safeName } from './os-geom.js';
import { DIRS, DIR_NAMES } from './os-setup.js';

export const VERSIONS = { esi: 'OpenFOAM v2412 (openfoam.com)', foundation: 'OpenFOAM-13 (openfoam.org)' };
/** Where each line keeps the surface files and the start fields. */
export const DIRS_OF = { esi: { geometry: 'constant/triSurface', zero: '0.orig' }, foundation: { geometry: 'constant/geometry', zero: '0' } };
export const CMU = 0.09;
const sig = (v, n = 6) => (Number.isFinite(v) ? String(+v.toPrecision(n)) : '0');
const vec = (v) => '(' + v.map((x) => sig(x)).join(' ') + ')';

/** k and omega at an inlet from the speed (m/s), the intensity (a fraction) and the length scale (m). */
export function inletTurbulence(U, I, L) {
  const k = 1.5 * (U * I) ** 2;
  return { k, omega: Math.sqrt(k) / (CMU ** 0.25 * L) };
}

function header(flavour, cls, object, location) {
  const esi = flavour === 'esi';
  return [
    '/*--------------------------------*- C++ -*----------------------------------*\\',
    '  Written by CadCraft (Open solver cases add-on) for ' + VERSIONS[flavour] + '.',
    '  Units: SI (m, kg, s); the model was in mm and is written x 0.001. Pressure is kinematic (p/rho).',
    '  This case has not been run in the solver by CadCraft: check it before you rely on it.',
    '\\*---------------------------------------------------------------------------*/',
    'FoamFile',
    '{',
    ...(esi ? ['    version     2.0;'] : []),
    '    format      ascii;',
    '    class       ' + cls + ';',
    ...(location ? ['    location    "' + location + '";'] : []),
    '    object      ' + object + ';',
    '}',
    '// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //',
    '',
  ].join('\n');
}
const END = '\n// ************************************************************************* //\n';

/** The patches of the case and the numbers the panel shows. Throws nothing: problems are listed. */
export function flowInfo({ flow, groups = [], surface, toM = 0.001 }) {
  const problems = [], b = bounds(surface.positions), Lmm = Math.max(...b.size), L = Lmm * toM;
  const d = DIRS[flow.dir], ax = d.findIndex((v) => v !== 0), sgn = d[ax];
  const external = flow.kind === 'external';
  const used = groups.filter((g) => g.faces && g.faces.length);
  const patches = [];   // { name, type (mesh patch type), role, tris, stats, U?, p?, file }
  const usedFaces = [];
  const roles = external ? ['wall'] : ['inlet', 'outlet', 'wall', 'symmetry', 'slip'];
  for (const g of used) {
    if (!roles.includes(g.role)) continue;
    const tris = faceTriangles(surface, g.faces);
    if (!tris.length) { problems.push({ code: 'group_empty', id: g.id }); continue; }
    usedFaces.push(...g.faces);
    patches.push({ name: g.role + '_' + g.id, role: g.role, type: g.role === 'wall' ? 'wall' : 'patch', tris, stats: patchStats(surface, tris), U: g.U, p: g.p, stl: true });
  }
  const rest = otherTriangles(surface, usedFaces);
  if (rest.length) patches.push({ name: external ? 'body' : 'walls', role: 'wall', type: 'wall', tris: rest, stats: patchStats(surface, rest), stl: true });
  // the box
  const min = b.min.map((v) => v * toM), max = b.max.map((v) => v * toM), bmin = [0, 0, 0], bmax = [0, 0, 0];
  let cell;
  if (external) {
    for (let a = 0; a < 3; a++) {
      if (a === ax) { bmin[a] = min[a] - (sgn > 0 ? flow.up : flow.down) * L; bmax[a] = max[a] + (sgn > 0 ? flow.down : flow.up) * L; }
      else { bmin[a] = min[a] - flow.side * L; bmax[a] = max[a] + flow.side * L; }
    }
    cell = flow.cell ? flow.cell * toM : +(L / 8).toPrecision(2);
  } else {
    cell = flow.cell ? flow.cell * toM : +(L / 20).toPrecision(2);
    for (let a = 0; a < 3; a++) { bmin[a] = min[a] - cell; bmax[a] = max[a] + cell; }
  }
  const n = [0, 1, 2].map((a) => Math.max(1, Math.round((bmax[a] - bmin[a]) / cell)));
  const cells = n[0] * n[1] * n[2];
  if (cells > 5e6) problems.push({ code: 'many_cells', n: cells });
  if (external) {
    const lo = sgn > 0 ? 'inlet' : 'outlet', hi = sgn > 0 ? 'outlet' : 'inlet';
    patches.push({ name: 'inlet', role: 'inlet', type: 'patch', box: [ax, lo === 'inlet' ? 0 : 1], U: flow.speed }, { name: 'outlet', role: 'outlet', type: 'patch', box: [ax, hi === 'outlet' ? 1 : 0], p: 0 }, { name: 'sides', role: 'slip', type: 'patch', box: 'sides' });
  } else {
    patches.push({ name: 'box', role: 'box', type: 'patch', box: 'all' });
    if (!patches.some((p) => p.role === 'inlet')) problems.push({ code: 'no_inlet' });
    if (!patches.some((p) => p.role === 'outlet')) problems.push({ code: 'no_outlet' });
  }
  // speeds and turbulence
  const inlets = patches.filter((p) => p.role === 'inlet');
  const Uref = external ? flow.speed : Math.max(0, ...inlets.map((p) => p.U || 0));
  const inletArea = inlets.filter((p) => p.stats).reduce((s, p) => s + p.stats.area, 0) * toM * toM;
  const Lref = external ? L : (inletArea > 0 ? Math.sqrt(4 * inletArea / Math.PI) : L);   // internal: the diameter of a circle with the inlets' area
  const mixing = flow.mixing ? flow.mixing * toM : 0.07 * Lref;
  const I = flow.intensity / 100, turb = inletTurbulence(Uref || 1e-6, I, mixing);
  const fine = cell / 2 ** flow.levelMax;
  const dt = flow.dt || +(0.5 * fine / Math.max(Uref, 1e-9)).toPrecision(2);
  // a point in the fluid
  const location = external ? locateOutside(surface, bmin, bmax, cell, toM) : locateInside(surface, bmin, cell, toM);
  if (!location) problems.push({ code: 'no_location' });
  for (const p of inlets) if (p.stats && p.tris.length > 1 && planarity(surface, p) < 0.999) problems.push({ code: 'inlet_not_flat', id: p.name });
  return { external, axis: ax, sign: sgn, dirName: DIR_NAMES[flow.dir], box: { min: bmin, max: bmax }, n, cells, cell, fine, U: Uref, I, L: mixing, Lref, k: turb.k, omega: turb.omega, Re: Uref * Lref / flow.nu, dt, location, patches, problems };
}
/** 1 when every triangle of the patch has the patch's mean normal. */
function planarity(surface, p) {
  let worst = 1;
  for (const t of p.tris) { const s = patchStats(surface, [t]); worst = Math.min(worst, s.normal[0] * p.stats.normal[0] + s.normal[1] * p.stats.normal[1] + s.normal[2] * p.stats.normal[2]); }
  return worst;
}
// fractions that are not simple, so the point is not on a background cell face or a symmetry plane of the model
const FR = [[0.1173, 0.4219, 0.5631], [0.8719, 0.5713, 0.4127], [0.4311, 0.1279, 0.6113], [0.5917, 0.8831, 0.3719], [0.3373, 0.6191, 0.1117], [0.6229, 0.3307, 0.8923], [0.2131, 0.2377, 0.2719], [0.7873, 0.7717, 0.7391]];
const offCellFace = (p, bmin, cell) => p.every((v, a) => { const f = (v - bmin[a]) / cell; return Math.abs(f - Math.round(f)) > 0.05; });
function locateOutside(surface, bmin, bmax, cell, toM) {
  for (const f of FR) {
    const p = [0, 1, 2].map((a) => bmin[a] + f[a] * (bmax[a] - bmin[a]));
    const mm = p.map((v) => v / toM);
    if (!inside(surface, mm) && distance(surface, mm) * toM > cell && offCellFace(p, bmin, cell)) return { point: p, clearance: distance(surface, mm) * toM };
  }
  return null;
}
function locateInside(surface, bmin, cell, toM) {
  // step in from the larger triangles along the inward normal; keep the candidate farthest from the surface
  const n = triCount(surface), order = [];
  for (let t = 0; t < n; t++) order.push([patchStats(surface, [t]).area, t]);
  order.sort((a, b) => b[0] - a[0]);
  const diag = bounds(surface.positions).diag;
  let best = null;
  for (const [, t] of order.slice(0, 24)) {
    const s = patchStats(surface, [t]);
    for (const step of [0.31, 0.137, 0.053, 0.0211]) {
      const mm = s.centroid.map((c, a) => c - s.normal[a] * step * diag + 0.00137 * diag * (a + 1));   // a small skew, so the point is not on a plane of symmetry
      if (!inside(surface, mm) || !offCellFace(mm.map((v) => v * toM), bmin, cell)) continue;
      const dist = distance(surface, mm);
      if (!best || dist > best.dist) best = { mm, dist };
    }
  }
  return best && best.dist > 0 ? { point: best.mm.map((v) => v * toM), clearance: best.dist * toM } : null;
}

// ------------------------------------------------------------------------------------------------ the dictionaries

function controlDict(fl, flow, info, name) {
  const esi = fl === 'esi', steady = flow.model === 'kOmegaSST';
  const wallPatches = info.patches.filter((p) => p.role === 'wall').map((p) => p.name);
  const app = esi ? ['application     ' + (steady ? 'simpleFoam' : 'icoFoam') + ';'] : ['solver          incompressibleFluid;'];
  const L = [header(fl, 'dictionary', 'controlDict', 'system'), ...app, '',
    'startFrom       startTime;', '', 'startTime       0;', '', 'stopAt          endTime;', '',
    'endTime         ' + (steady ? flow.steps : sig(flow.endTime)) + ';', '',
    'deltaT          ' + (steady ? 1 : sig(info.dt)) + ';', '',
    'writeControl    ' + (steady ? 'timeStep' : (esi ? 'runTime' : 'runTime')) + ';', '',
    'writeInterval   ' + (steady ? Math.max(1, Math.round(flow.steps / 5)) : sig(flow.endTime / 10)) + ';', '',
    'purgeWrite      0;', '', 'writeFormat     ascii;', '', 'writePrecision  6;', '', 'writeCompression off;', '', 'timeFormat      general;', '', 'timePrecision   6;', '', 'runTimeModifiable true;', ''];
  if (wallPatches.length && esi) L.push('functions', '{', ...forcesBlock(fl, flow, wallPatches).map((x) => '    ' + x), '}', '');
  return L.join('\n') + END;
}
/** The forces function object on the wall patches (ESI: inside controlDict; Foundation: the file system/functions). */
function forcesBlock(fl, flow, wallPatches) {
  return ['forces', '{', '    type            forces;', '    libs            ' + (fl === 'esi' ? '(forces)' : '("libforces.so")') + ';',
    '    writeControl    timeStep;', '    writeInterval   1;', '    log             yes;', '    patches         (' + wallPatches.join(' ') + ');',
    '    rho             rhoInf;      // incompressible: the forces are scaled by this density', '    rhoInf          ' + sig(flow.rho) + ';',
    '    CofR            (0 0 0);', '}'];
}
function functionsFile(fl, flow, info) {
  const wallPatches = info.patches.filter((p) => p.role === 'wall').map((p) => p.name);
  return [header(fl, 'dictionary', 'functions', 'system'), ...(wallPatches.length ? forcesBlock(fl, flow, wallPatches) : []), ''].join('\n') + END;
}

function fvSchemes(fl, flow) {
  const esi = fl === 'esi', steady = flow.model === 'kOmegaSST';
  const L = [header(fl, 'dictionary', 'fvSchemes', 'system')];
  if (steady) {
    L.push('ddtSchemes', '{', '    default         steadyState;', '}', '', 'gradSchemes', '{', '    default         Gauss linear;', '    grad(U)         cellLimited Gauss linear 1;', '}', '',
      'divSchemes', '{', '    default         none;', '    div(phi,U)      bounded Gauss linearUpwindV grad(U);', '    div(phi,k)      bounded Gauss upwind;', '    div(phi,omega)  bounded Gauss upwind;',
      '    div((nuEff*dev2(T(grad(U))))) Gauss linear;', '}', '');
  } else {
    L.push('ddtSchemes', '{', '    default         Euler;', '}', '', 'gradSchemes', '{', '    default         Gauss linear;', '}', '',
      'divSchemes', '{', '    default         none;', '    div(phi,U)      Gauss linear;', ...(esi ? [] : ['    div((nuEff*dev2(T(grad(U))))) Gauss linear;']), '}', '');
  }
  L.push('laplacianSchemes', '{', '    default         Gauss linear corrected;', '}', '', 'interpolationSchemes', '{', '    default         linear;', '}', '', 'snGradSchemes', '{', '    default         corrected;', '}', '');
  if (steady) L.push('wallDist', '{', '    method          meshWave;', '}', '');
  return L.join('\n') + END;
}

function fvSolution(fl, flow) {
  const esi = fl === 'esi', steady = flow.model === 'kOmegaSST';
  const L = [header(fl, 'dictionary', 'fvSolution', 'system'), 'solvers', '{'];
  if (steady) {
    L.push('    p', '    {', '        solver          GAMG;', '        smoother        GaussSeidel;', '        tolerance       1e-7;', '        relTol          0.01;', '    }', '',
      '    "(U|k|omega)"', '    {', '        solver          smoothSolver;', '        smoother        GaussSeidel;', '        tolerance       1e-8;', '        relTol          0.1;', '        nSweeps         1;', '    }', '}', '',
      'SIMPLE', '{', '    nNonOrthogonalCorrectors 0;', '    consistent      yes;', '', '    residualControl', '    {', '        p               1e-4;', '        U               1e-4;', '        "(k|omega)"     1e-4;', '    }', '}', '',
      'relaxationFactors', '{', '    equations', '    {', '        U               0.9;', '        k               ' + (esi ? '0.7' : '0.5') + ';', '        omega           ' + (esi ? '0.7' : '0.5') + ';', '    }', '}', '');
  } else {
    L.push('    p', '    {', '        solver          PCG;', '        preconditioner  DIC;', '        tolerance       1e-06;', '        relTol          0.05;', '    }', '',
      '    pFinal', '    {', '        $p;', '        relTol          0;', '    }', '',
      '    ' + (esi ? 'U' : '"(U|UFinal)"'), '    {', '        solver          smoothSolver;', '        smoother        symGaussSeidel;', '        tolerance       1e-05;', '        relTol          0;', '    }', '}', '',
      esi ? 'PISO' : 'PIMPLE', '{', ...(esi ? [] : ['    nOuterCorrectors 1;']), '    nCorrectors     2;', '    nNonOrthogonalCorrectors 1;', '    pRefCell        0;', '    pRefValue       0;', '}', '');
  }
  return L.join('\n') + END;
}

function blockMeshDict(fl, info) {
  const { min, max } = info.box, n = info.n;
  const v = [[min[0], min[1], min[2]], [max[0], min[1], min[2]], [max[0], max[1], min[2]], [min[0], max[1], min[2]], [min[0], min[1], max[2]], [max[0], min[1], max[2]], [max[0], max[1], max[2]], [min[0], max[1], max[2]]];
  // the six faces of the block, each seen from outside: [axis, 0 = low | 1 = high] → vertex list
  const F = { '0,0': '(0 4 7 3)', '0,1': '(1 2 6 5)', '1,0': '(0 1 5 4)', '1,1': '(3 7 6 2)', '2,0': '(0 3 2 1)', '2,1': '(4 5 6 7)' };
  const all = Object.keys(F), taken = new Set();
  const L = [header(fl, 'dictionary', 'blockMeshDict', 'system'), (fl === 'esi' ? 'scale   1;' : 'convertToMeters 1;'), '', 'vertices', '(', ...v.map((p) => '    ' + vec(p)), ');', '',
    'blocks', '(', '    hex (0 1 2 3 4 5 6 7) (' + n.join(' ') + ') simpleGrading (1 1 1)', ');', '', 'edges', '(', ');', '', 'boundary', '('];
  const put = (name, type, keys) => { L.push('    ' + name, '    {', '        type ' + type + ';', '        faces', '        (', ...keys.map((k) => '            ' + F[k]), '        );', '    }'); };
  for (const p of info.patches) {
    if (!p.box) continue;
    if (Array.isArray(p.box)) { const k = p.box.join(','); taken.add(k); put(p.name, 'patch', [k]); }
  }
  for (const p of info.patches) {
    if (p.box === 'sides') put(p.name, 'patch', all.filter((k) => !taken.has(k)));
    if (p.box === 'all') put(p.name, 'patch', all);
  }
  L.push(');', '', 'mergePatchPairs', '(', ');', '');
  return L.join('\n') + END;
}

function snappyDict(fl, flow, info) {
  const esi = fl === 'esi', stl = info.patches.filter((p) => p.stl);
  const L = [header(fl, 'dictionary', 'snappyHexMeshDict', 'system'), 'castellatedMesh true;', 'snap            true;', 'addLayers       ' + (flow.layers > 0 ? 'true' : 'false') + ';', '', 'geometry', '{'];
  for (const p of stl) {
    if (esi) L.push('    ' + p.name + '.stl', '    {', '        type triSurfaceMesh;', '        name ' + p.name + ';', '    }');
    else L.push('    ' + p.name, '    {', '        type triSurface;', '        file "' + p.name + '.stl";', '    }');
  }
  L.push('}', '', 'castellatedMeshControls', '{', '    maxLocalCells 1000000;', '    maxGlobalCells 4000000;', '    minRefinementCells 10;', '    maxLoadUnbalance 0.10;', '    nCellsBetweenLevels 3;', '',
    '    features', '    (');
  for (const p of stl) L.push('        {', '            file "' + p.name + '.eMesh";', '            level ' + flow.levelMin + ';', '        }');
  L.push('    );', '', '    refinementSurfaces', '    {');
  for (const p of stl) L.push('        ' + p.name, '        {', '            level (' + flow.levelMin + ' ' + flow.levelMax + ');', '            patchInfo', '            {', '                type ' + p.type + ';', '            }', '        }');
  L.push('    }', '', '    resolveFeatureAngle 30;', '', '    refinementRegions', '    {', '    }', '',
    '    // a point in the fluid, checked by CadCraft to be ' + (info.external ? 'outside the body' : 'inside the fluid space') + ' and ' + sig((info.location ? info.location.clearance : 0), 3) + ' m from its surface',
    '    ' + (esi ? 'locationInMesh ' : 'insidePoint ') + vec(info.location ? info.location.point : [0, 0, 0]) + ';', '', '    allowFreeStandingZoneFaces true;', '}', '',
    'snapControls', '{', '    nSmoothPatch 3;', '    tolerance 2.0;', '    nSolveIter 30;', '    nRelaxIter 5;', '    nFeatureSnapIter 10;', '    implicitFeatureSnap false;', '    explicitFeatureSnap true;', '    multiRegionFeatureSnap false;', '}', '',
    'addLayersControls', '{', '    relativeSizes true;', '', '    layers', '    {');
  if (flow.layers > 0) for (const p of stl.filter((x) => x.type === 'wall')) L.push('        ' + p.name, '        {', '            nSurfaceLayers ' + flow.layers + ';', '        }');
  L.push('    }', '', '    expansionRatio 1.2;', '    finalLayerThickness 0.3;', '    minThickness 0.1;', '    nGrow 0;', '    featureAngle 60;', '    slipFeatureAngle 30;', '    nRelaxIter 3;', '    nSmoothSurfaceNormals 1;', '    nSmoothNormals 3;',
    '    nSmoothThickness 10;', '    maxFaceThicknessRatio 0.5;', '    maxThicknessToMedialRatio 0.3;', '    minMedialAxisAngle 90;', '    nBufferCellsNoExtrude 0;', '    nLayerIter 50;', '}', '',
    // the values of each line's own default file (ESI etc/caseDicts/meshQualityDict; Foundation etc/caseDicts/mesh/generation/meshQualityDict)
    'meshQualityControls', '{', '    maxNonOrtho 65;', '    maxBoundarySkewness 20;', '    maxInternalSkewness 4;', '    maxConcave 80;',
    ...(esi ? ['    minVol 1e-13;', '    minTetQuality 1e-15;', '    minArea -1;', '    minTwist 0.02;', '    minDeterminant 0.001;', '    minFaceWeight 0.05;', '    minVolRatio 0.01;', '    minTriangleTwist -1;', '    minEdgeLength -1;']
      : ['    minVol -1e30;', '    minTetQuality 1e-15;', '    minTwist 0.02;', '    minDeterminant 0.001;', '    minFaceWeight 0.05;', '    minVolRatio 0.01;']),
    '    nSmoothScale 4;', '    errorReduction 0.75;', '}', '', 'mergeTolerance 1e-6;', '');
  return L.join('\n') + END;
}

function featuresDict(fl, info) {
  const stl = info.patches.filter((p) => p.stl);
  if (fl === 'esi') {
    const L = [header(fl, 'dictionary', 'surfaceFeatureExtractDict', 'system')];
    for (const p of stl) L.push(p.name + '.stl', '{', '    extractionMethod    extractFromSurface;', '', '    includedAngle       150;', '', '    subsetFeatures', '    {', '        nonManifoldEdges    yes;', '        openEdges           yes;', '    }', '', '    writeObj            no;', '}', '');
    return { name: 'system/surfaceFeatureExtractDict', data: L.join('\n') + END };
  }
  const L = [header(fl, 'dictionary', 'surfaceFeaturesDict', 'system'), 'surfaces', '(', ...stl.map((p) => '    "' + p.name + '.stl"'), ');', '', 'includedAngle   150;', '', 'subsetFeatures', '{', '    nonManifoldEdges    yes;', '    openEdges           yes;', '}', ''];
  return { name: 'system/surfaceFeaturesDict', data: L.join('\n') + END };
}

function decomposeParDict(fl, flow) {
  return [header(fl, 'dictionary', 'decomposeParDict', 'system'), 'numberOfSubdomains ' + flow.procs + ';', '', 'method          scotch;', ''].join('\n') + END;
}

function constantFiles(fl, flow) {
  const esi = fl === 'esi', ras = flow.model === 'kOmegaSST', out = [];
  if (esi) {
    out.push({ name: 'constant/transportProperties', data: [header(fl, 'dictionary', 'transportProperties', 'constant'), 'transportModel  Newtonian;', '', 'nu              ' + sig(flow.nu) + ';', ''].join('\n') + END });
    out.push({ name: 'constant/turbulenceProperties', data: [header(fl, 'dictionary', 'turbulenceProperties', 'constant'), 'simulationType  ' + (ras ? 'RAS' : 'laminar') + ';', '',
      ...(ras ? ['RAS', '{', '    RASModel        kOmegaSST;', '', '    turbulence      on;', '', '    printCoeffs     on;', '}', ''] : [])].join('\n') + END });
  } else {
    out.push({ name: 'constant/physicalProperties', data: [header(fl, 'dictionary', 'physicalProperties', 'constant'), 'viscosityModel  constant;', '', 'nu              [0 2 -1 0 0 0 0] ' + sig(flow.nu) + ';', ''].join('\n') + END });
    out.push({ name: 'constant/momentumTransport', data: [header(fl, 'dictionary', 'momentumTransport', 'constant'), 'simulationType  ' + (ras ? 'RAS' : 'laminar') + ';', '',
      ...(ras ? ['RAS', '{', '    model           kOmegaSST;', '', '    turbulence      on;', '', '    printCoeffs     on;', '}', ''] : [])].join('\n') + END });
  }
  return out;
}

/** The 0/ files. Each patch gets an entry in every field; the entries by role are the BC table below. */
function fieldFiles(fl, flow, info, surface) {
  const ras = flow.model === 'kOmegaSST', d = DIRS[flow.dir];
  const Uin = info.external ? d.map((v) => v * flow.speed) : [0, 0, 0];
  const inletU = (p) => (info.external ? Uin : p.stats.normal.map((nv) => -nv * p.U));   // internal: into the fluid = against the outward normal of the fluid space
  const BC = {
    U: { inlet: (p) => ['type            fixedValue;', 'value           uniform ' + vec(inletU(p)) + ';'], outlet: () => ['type            inletOutlet;', 'inletValue      uniform (0 0 0);', 'value           $internalField;'],
      wall: () => ['type            noSlip;'], slip: () => ['type            slip;'], symmetry: () => ['type            slip;'], box: () => ['type            zeroGradient;'] },
    p: { inlet: () => ['type            zeroGradient;'], outlet: (p) => ['type            fixedValue;', 'value           uniform ' + sig((p.p || 0) / flow.rho) + ';'],
      wall: () => ['type            zeroGradient;'], slip: () => ['type            slip;'], symmetry: () => ['type            slip;'], box: () => ['type            zeroGradient;'] },
    k: { inlet: (p) => ['type            fixedValue;', 'value           uniform ' + sig(patchTurb(p).k) + ';'], outlet: () => ['type            inletOutlet;', 'inletValue      $internalField;', 'value           $internalField;'],
      wall: () => ['type            kqRWallFunction;', 'value           $internalField;'], slip: () => ['type            slip;'], symmetry: () => ['type            slip;'], box: () => ['type            zeroGradient;'] },
    omega: { inlet: (p) => ['type            fixedValue;', 'value           uniform ' + sig(patchTurb(p).omega) + ';'], outlet: () => ['type            inletOutlet;', 'inletValue      $internalField;', 'value           $internalField;'],
      wall: () => ['type            omegaWallFunction;', 'value           $internalField;'], slip: () => ['type            slip;'], symmetry: () => ['type            slip;'], box: () => ['type            zeroGradient;'] },
    nut: { inlet: () => ['type            calculated;', 'value           uniform 0;'], outlet: () => ['type            calculated;', 'value           uniform 0;'],
      wall: () => ['type            nutkWallFunction;', 'value           uniform 0;'], slip: () => ['type            calculated;', 'value           uniform 0;'], symmetry: () => ['type            calculated;', 'value           uniform 0;'], box: () => ['type            calculated;', 'value           uniform 0;'] },
  };
  function patchTurb(p) { return inletTurbulence(info.external ? flow.speed : (p.U || 1e-6), info.I, info.L); }
  const spec = [['U', 'volVectorField', '[0 1 -1 0 0 0 0]', 'uniform ' + vec(Uin)], ['p', 'volScalarField', '[0 2 -2 0 0 0 0]', 'uniform 0']];
  if (ras) spec.push(['k', 'volScalarField', '[0 2 -2 0 0 0 0]', 'uniform ' + sig(info.k)], ['omega', 'volScalarField', '[0 0 -1 0 0 0 0]', 'uniform ' + sig(info.omega)], ['nut', 'volScalarField', '[0 2 -1 0 0 0 0]', 'uniform 0']);
  void surface;
  return spec.map(([f, cls, dim, internal]) => {
    const L = [header(fl, cls, f, DIRS_OF[fl].zero), 'dimensions      ' + dim + ';', '', 'internalField   ' + internal + ';', '', 'boundaryField', '{'];
    for (const p of info.patches) L.push('    ' + p.name, '    {', ...BC[f][p.role](p).map((s) => '        ' + s), '    }');
    L.push('}', '');
    return { name: DIRS_OF[fl].zero + '/' + f, data: L.join('\n') + END };
  });
}

/** The commands of a run, in order, as [command, note] (the Allrun script and the README print the same list). */
export function runSteps(fl, flow) {
  const esi = fl === 'esi', steady = flow.model === 'kOmegaSST', par = flow.procs > 1;
  const solver = esi ? (steady ? 'simpleFoam' : 'icoFoam') : 'foamRun';
  const steps = [[esi ? 'surfaceFeatureExtract' : 'surfaceFeatures'], ['blockMesh'], [esi ? 'snappyHexMesh -overwrite' : 'snappyHexMesh'], ['checkMesh']];
  if (esi) steps.push(['restore0Dir', 'shell']);   // copies 0.orig to 0 (a helper of the ESI run functions, not a program)
  if (par) steps.push(['decomposePar'], [solver, 'parallel'], ['reconstructPar' + (steady ? ' -latestTime' : '')]);
  else steps.push([solver]);
  steps.push([esi ? 'foamToVTK -ascii -legacy -poly-decomp -latestTime' : 'foamToVTK -ascii -latestTime']);
  return { steps, solver };
}
function scripts(fl, flow, info, name) {
  const esi = fl === 'esi', { steps } = runSteps(fl, flow);
  const run = [
    '#!/bin/sh', 'cd "${0%/*}" || exit 1                              # run from this folder', '. ${WM_PROJECT_DIR:?}/bin/tools/RunFunctions        # the run helpers of your OpenFOAM', '',
    '# ' + name + ': written by CadCraft for ' + VERSIONS[fl] + '. Not run by CadCraft: read log.checkMesh before you trust the solve.', '',
    ...steps.map(([cmd, kind]) => (kind === 'shell' ? cmd : kind === 'parallel' ? 'runParallel ' + cmd : 'runApplication ' + cmd)), '',
  ];
  const clean = esi
    ? ['#!/bin/sh', 'cd "${0%/*}" || exit 1', '. ${WM_PROJECT_DIR:?}/bin/tools/CleanFunctions', '', 'cleanCase0', 'rm -f constant/triSurface/*.eMesh', 'rm -rf constant/extendedFeatureEdgeMesh VTK', '']
    : ['#!/bin/sh', 'cd "${0%/*}" || exit 1', '. ${WM_PROJECT_DIR:?}/bin/tools/CleanFunctions', '', 'cleanCase', 'cleanExplicitFeatures', 'rm -rf VTK', ''];
  return [{ name: 'Allrun', data: run.join('\n') }, { name: 'Allclean', data: clean.join('\n') }, { name: name + '.foam', data: '' }];
}

function readme(fl, flow, info, name) {
  const esi = fl === 'esi', steady = flow.model === 'kOmegaSST', { steps, solver } = runSteps(fl, flow);
  const forcesFile = esi ? 'postProcessing/forces/0/force.dat' : 'postProcessing/forces/0/forces.dat';
  const L = [
    name + ' - a flow case written by CadCraft (Open solver cases add-on)', '',
    'Written for ' + VERSIONS[fl] + '. OpenFOAM is a separate program: it is not part of CadCraft, and you add it to your own computer yourself.',
    'No case from this add-on has yet been run in the real solver by CadCraft. Check the mesh and the settings before you rely on a result.', '',
    'UNITS', '  SI: metres, kilograms, seconds. The model was in millimetres and every coordinate is written x 0.001.',
    '  Pressure in the files is kinematic (p / rho, m2/s2). Multiply by the density (' + sig(flow.rho) + ' kg/m3) for pascals.',
    '  The forces file is in newtons (the forces function is given rhoInf = ' + sig(flow.rho) + ' kg/m3).',
    '  Axes are the model\'s own (in PartCraft Y is up).', '',
    'WHAT IS IN IT', '  ' + (info.external ? 'External flow: the model is a body in a box of fluid. Flow along ' + info.dirName + ' at ' + sig(flow.speed) + ' m/s.' : 'Internal flow: the model is the fluid space; its picked faces are the inlets and outlets.'),
    '  Model: ' + (steady ? 'steady, incompressible, k-omega SST (wall functions).' : 'transient, incompressible, laminar.'),
    '  Kinematic viscosity ' + sig(flow.nu) + ' m2/s. Reynolds number about ' + sig(info.Re, 3) + ' (speed ' + sig(info.U) + ' m/s, length ' + sig(info.Lref, 4) + ' m).',
    ...(steady ? ['  Inlet turbulence: intensity ' + sig(info.I * 100, 3) + ' %, length scale ' + sig(info.L, 4) + ' m  ->  k = 1.5 (U I)^2 = ' + sig(info.k) + ' m2/s2,  omega = sqrt(k) / (0.09^0.25 L) = ' + sig(info.omega) + ' 1/s.'] : ['  Time step ' + sig(info.dt) + ' s (half a smallest cell at the inlet speed), end time ' + sig(flow.endTime) + ' s.']),
    '  Background mesh ' + info.n.join(' x ') + ' cells of ' + sig(info.cell, 3) + ' m; surface refinement levels ' + flow.levelMin + ' to ' + flow.levelMax + ' (smallest cell ' + sig(info.fine, 3) + ' m)' + (flow.layers ? '; ' + flow.layers + ' wall layers.' : '; no wall layers.'),
    '  A point in the fluid for the mesher: ' + (info.location ? vec(info.location.point) + ' m, ' + sig(info.location.clearance, 3) + ' m from the surface.' : 'NOT FOUND.'),
    '  Patches: ' + info.patches.map((p) => p.name + ' (' + p.role + ')').join(', ') + '.',
    '  A face picked as symmetry is written as a patch with the slip condition (snappyHexMesh cannot make symmetry patches); it must be flat.',
    '  Surface files: ' + DIRS_OF[fl].geometry + '/*.stl (one per patch). Start fields: ' + DIRS_OF[fl].zero + '/.', '',
    'RUN IT (in a terminal where OpenFOAM is loaded, inside this folder)', '  chmod +x Allrun Allclean', '  ./Allrun', '', 'or one command at a time:',
    ...steps.map(([cmd, kind]) => '  ' + (kind === 'parallel' ? 'mpirun -np ' + flow.procs + ' ' + cmd + ' -parallel' : kind === 'shell' ? (esi ? 'cp -r 0.orig 0' : cmd) : cmd)), '',
    'BRING THE RESULTS BACK', '  In CadCraft press Import results and choose the .vtk files of the wall patches (VTK/<patch>/<patch>_<step>.vtk) and, for the',
    '  forces, the text file ' + forcesFile + '. The reader takes legacy ASCII VTK only.', '',
    'CHECK BEFORE YOU TRUST IT', '  - checkMesh must end with "Mesh OK".', '  - Look at the mesh in ParaView (open ' + name + '.foam).', '  - The residuals in log.' + solver + ' must fall, and the forces must settle.',
    '  - With wall functions the first cell should sit at y+ of roughly 30 to 300; refine or add layers and compare.', '',
  ];
  return { name: 'README.txt', data: L.join('\n') };
}

export function foamCase(input) {
  const { flow, surface, toM = 0.001 } = input, fl = flow.flavour, name = safeName(input.name, 'case');
  const info = flowInfo(input);
  const files = [];
  const add = (n, data) => files.push({ name: n, data });
  add('system/controlDict', controlDict(fl, flow, info, name));
  add('system/fvSchemes', fvSchemes(fl, flow));
  add('system/fvSolution', fvSolution(fl, flow));
  add('system/blockMeshDict', blockMeshDict(fl, info));
  add('system/snappyHexMeshDict', snappyDict(fl, flow, info));
  files.push(featuresDict(fl, info));
  add('system/decomposeParDict', decomposeParDict(fl, flow));
  if (fl !== 'esi') add('system/functions', functionsFile(fl, flow, info));
  files.push(...constantFiles(fl, flow));
  for (const p of info.patches) if (p.stl) add(DIRS_OF[fl].geometry + '/' + p.name + '.stl', stlAscii(p.name, surface, p.tris, toM));
  files.push(...fieldFiles(fl, flow, info, surface));
  files.push(...scripts(fl, flow, info, name), readme(fl, flow, info, name));
  return { files, info, problems: info.problems, name };
}
