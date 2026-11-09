/* SPDX-License-Identifier: GPL-3.0-or-later */
/**
 * case.js — writes an OpenFOAM case (ESI v-series, tested on v1912; results are read back from the written fields by runner/foam-sample.mjs, no function objects) for one wind direction round a set of building masses (wind-openfoam add-on).
 * Pure text in, text out: no OpenFOAM code is included or linked; the case is files that the user's own OpenFOAM reads.
 *
 *   writeCase({ masses, deg, z0, Uref = 10, Zref = 10, cph = 10, iterations = 1500, dialect = 'v2512' (or 'v1912': zGround instead of d), probeCell, probeZ = 1.5, gridMax = 100,
 *               domain: { up = 5, down = 10, side = 5, top = 5 } (AIJ guideline: 5H round the buildings, 10H behind) })
 *     masses: [{ pts: [{x,y}] (metres), z0 (base level), height }]  in the world frame; the wind blows FROM `deg` (clockwise from north)
 *   → { files: { 'system/controlDict': text, ... }, steps: [{ cmd, args }], frame, plan, probes: { grid, points:[[x,y,z]...] } }
 * The case is written in the FLOW frame (x along the wind, y 90 degrees to the left, z up from the lowest mass level), like lib/wind/voxel.js.
 * Model: steady incompressible RANS (simpleFoam), standard k-epsilon, atmospheric boundary layer inlet (Richards and Hoxey 1993: U, k, epsilon from
 * u* and z0), rough ground wall function (nutkAtmRoughWallFunction), slip top and sides, buildings smooth walls, linearUpwind momentum.
 * Limits (shown in the UI): standard k-epsilon over-predicts turbulence at the stagnation point; no vegetation, no terrain.
 */
import { flowFrame } from '../../../wind/voxel.js';
import { prismTriangles, stl } from './geom.js';

const HDR = (cls, obj, loc = '') => `FoamFile\n{\n    version     2.0;\n    format      ascii;\n    class       ${cls};\n${loc ? `    location    "${loc}";\n` : ''}    object      ${obj};\n}\n\n`;
const f = (v) => (Math.abs(v) < 1e-12 ? 0 : +v.toPrecision(10));
const vec = (a) => `(${a.map(f).join(' ')})`;

export function writeCase(o) {
  const { masses, deg, z0, Uref = 10, Zref = 10, cph = 10, iterations = 1500, probeZ = 1.5, gridMax = 100 } = o;
  const dom = { up: 5, down: 10, side: 5, top: 5, ...(o.domain || {}) };
  if (!masses?.length) throw new Error('no_masses');
  if (!(z0 > 0)) throw new Error('z0 must be positive');
  const fr = flowFrame(deg);
  let sx = 0, sy = 0, n = 0, H = 0, ground = Infinity;
  for (const m of masses) { for (const p of m.pts) { sx += p.x; sy += p.y; n++; } H = Math.max(H, m.height); ground = Math.min(ground, m.z0); }
  const cx = sx / n, cy = sy / n;
  const toFlow = (p) => ({ x: (p.x - cx) * fr.ex + (p.y - cy) * fr.ey, y: (p.x - cx) * fr.fx + (p.y - cy) * fr.fy });
  let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity, R = 0;
  const solids = masses.map((m) => {
    const pts = m.pts.map(toFlow);
    for (const p of pts) { bx0 = Math.min(bx0, p.x); bx1 = Math.max(bx1, p.x); by0 = Math.min(by0, p.y); by1 = Math.max(by1, p.y); }
    for (const p of m.pts) R = Math.max(R, Math.hypot(p.x - cx, p.y - cy));
    return { pts, zBottom: -H / cph, zTop: m.z0 + m.height - ground };
  });
  const dxs = H / cph;                                              // finest cell at the buildings
  const L = Math.max(1, Math.round(Math.log2(0.4 * cph)));          // refinement levels over the background mesh
  const base = dxs * 2 ** L;
  const mg = Math.max(1.5 * H, 10), W = R + mg;                     // probe window half-width (matches lib/wind/study.js classify's margin)
  const xmin = Math.min(bx0 - dom.up * H, -W - H), xmax = Math.max(bx1 + dom.down * H, W + H);
  const ymin = Math.min(by0 - dom.side * H, -W - H), ymax = Math.max(by1 + dom.side * H, W + H), zmax = Math.max(dom.top * H, 3 * H + 10);
  const ncx = Math.max(4, Math.round((xmax - xmin) / base)), ncy = Math.max(4, Math.round((ymax - ymin) / base)), ncz = Math.max(4, Math.round(zmax / base));

  const files = {};
  files['constant/triSurface/buildings.stl'] = stl('buildings', solids);
  files['system/blockMeshDict'] = HDR('dictionary', 'blockMeshDict', 'system') + `scale 1;
vertices
(
    (${f(xmin)} ${f(ymin)} 0) (${f(xmax)} ${f(ymin)} 0) (${f(xmax)} ${f(ymax)} 0) (${f(xmin)} ${f(ymax)} 0)
    (${f(xmin)} ${f(ymin)} ${f(zmax)}) (${f(xmax)} ${f(ymin)} ${f(zmax)}) (${f(xmax)} ${f(ymax)} ${f(zmax)}) (${f(xmin)} ${f(ymax)} ${f(zmax)})
);
blocks ( hex (0 1 2 3 4 5 6 7) (${ncx} ${ncy} ${ncz}) simpleGrading (1 1 1) );
edges ();
boundary
(
    inlet  { type patch; faces ((0 4 7 3)); }
    outlet { type patch; faces ((1 2 6 5)); }
    ground { type wall;  faces ((0 3 2 1)); }
    top    { type patch; faces ((4 5 6 7)); }
    sides  { type patch; faces ((0 1 5 4) (3 7 6 2)); }
);
mergePatchPairs ();
`;
  const box = (a, b) => `{ type searchableBox; min ${vec(a)}; max ${vec(b)}; }`;
  const refA = [[bx0 - H, by0 - H, -1], [bx1 + 3 * H, by1 + H, 1.3 * H]], refB = [[bx0 - 3 * H, by0 - 3 * H, -1], [bx1 + 8 * H, by1 + 3 * H, 3 * H]];
  const loc = [xmin + 1.3 * base, ymin + 1.3 * base, zmax * 0.8];
  files['system/snappyHexMeshDict'] = HDR('dictionary', 'snappyHexMeshDict', 'system') + `castellatedMesh true;
snap            true;
addLayers       false;
geometry
{
    buildings.stl { type triSurfaceMesh; name buildings; }
    refA ${box(...refA)}
    refB ${box(...refB)}
}
castellatedMeshControls
{
    maxLocalCells 4000000; maxGlobalCells 8000000; minRefinementCells 0; maxLoadUnbalance 0.10; nCellsBetweenLevels 2;
    features ();
    refinementSurfaces { buildings { level (${L} ${L}); patchInfo { type wall; } } }
    resolveFeatureAngle 30;
    refinementRegions { refA { mode inside; levels ((1E15 ${L})); } refB { mode inside; levels ((1E15 ${Math.max(0, L - 1)})); } }
    locationInMesh ${vec(loc)};
    allowFreeStandingZoneFaces true;
}
snapControls { nSmoothPatch 3; tolerance 2.0; nSolveIter 30; nRelaxIter 5; nFeatureSnapIter 10; implicitFeatureSnap false; explicitFeatureSnap false; multiRegionFeatureSnap false; }
addLayersControls
{
    relativeSizes true; layers {} expansionRatio 1.0; finalLayerThickness 0.3; minThickness 0.1; nGrow 0; featureAngle 30;
    nRelaxIter 3; nSmoothSurfaceNormals 1; nSmoothNormals 3; nSmoothThickness 10; maxFaceThicknessRatio 0.5; maxThicknessToMedialRatio 0.3;
    minMedialAxisAngle 90; nBufferCellsNoExtrude 0; nLayerIter 50;
}
meshQualityControls
{
    maxNonOrtho 65; maxBoundarySkewness 20; maxInternalSkewness 4; maxConcave 80; minVol 1e-13; minTetQuality -1e30; minArea -1; minTwist 0.02;
    minDeterminant 0.001; minFaceWeight 0.05; minVolRatio 0.01; minTriangleTwist -1; nSmoothScale 4; errorReduction 0.75;
    relaxed { maxNonOrtho 75; }
}
mergeTolerance 1e-6;
debug 0;
`;
  const cellP = o.probeCell || Math.max(dxs * 2, (2 * W) / gridMax), pn = Math.ceil((2 * W) / cellP), pts = [];
  for (let j = 0; j < pn; j++) for (let i = 0; i < pn; i++) pts.push([-W + (i + 0.5) * cellP, -W + (j + 0.5) * cellP, probeZ]);
  const gridCount = pts.length;
  for (const q of o.extraProbes || []) pts.push(q);                 // extra points in the flow frame (validation: windward face, wake line)
  files['system/controlDict'] = HDR('dictionary', 'controlDict', 'system') + `application simpleFoam;
startFrom startTime; startTime 0; stopAt endTime; endTime ${iterations}; deltaT 1;
writeControl timeStep; writeInterval ${iterations}; purgeWrite 1; writeFormat ascii; writePrecision 8; writeCompression off; timeFormat general; timePrecision 6; runTimeModifiable false;
${o.dialect === 'v1912' ? '' : `functions
{
    probes
    {
        type probes; libs ("libsampling.so"); fields (U p); writeControl timeStep; writeInterval ${iterations};
        probeLocations
        (
${pts.map((p) => '            ' + vec(p)).join('\n')}
        );
    }
}
`}`;
  files['system/fvSchemes'] = HDR('dictionary', 'fvSchemes', 'system') + `ddtSchemes { default steadyState; }
gradSchemes { default Gauss linear; grad(U) cellLimited Gauss linear 1; }
divSchemes
{
    default none;
    div(phi,U) bounded Gauss linearUpwind grad(U);
    div(phi,k) bounded Gauss limitedLinear 1;
    div(phi,epsilon) bounded Gauss limitedLinear 1;
    div((nuEff*dev2(T(grad(U))))) Gauss linear;
}
laplacianSchemes { default Gauss linear corrected; }
interpolationSchemes { default linear; }
snGradSchemes { default corrected; }
wallDist { method meshWave; }
`;
  files['system/fvSolution'] = HDR('dictionary', 'fvSolution', 'system') + `solvers
{
    p { solver GAMG; smoother GaussSeidel; tolerance 1e-8; relTol 0.05; }
    "(U|k|epsilon)" { solver smoothSolver; smoother symGaussSeidel; tolerance 1e-8; relTol 0.1; }
}
SIMPLE
{
    nNonOrthogonalCorrectors 1; consistent yes;
    residualControl { p 1e-4; U 1e-5; "(k|epsilon)" 1e-5; }
}
relaxationFactors { equations { U 0.9; ".*" 0.9; } }
`;
  files['constant/transportProperties'] = HDR('dictionary', 'transportProperties', 'constant') + 'transportModel Newtonian;\nnu 1.5e-05;\n';
  files['constant/turbulenceProperties'] = HDR('dictionary', 'turbulenceProperties', 'constant') + 'simulationType RAS;\nRAS { RASModel kEpsilon; turbulence on; printCoeffs on; }\n';
  const abl = `flowDir (1 0 0); zDir (0 0 1); Uref ${f(Uref)}; Zref ${f(Zref)}; z0 uniform ${f(z0)}; ${o.dialect === 'v1912' ? 'zGround uniform 0;' : 'd uniform 0;'}`;   // v2512 renamed zGround to d (a displacement height, 0 here)
  const old = o.dialect === 'v1912';
  const field = (cls, name, dims, internal, bcs) => HDR(cls, name, '0') + `dimensions ${dims};\ninternalField ${internal};\nboundaryField\n{\n${Object.entries(bcs).map(([k, v]) => `    ${k}\n    {\n        ${v}\n    }`).join('\n')}\n}\n`;
  const kInt = (0.41 * Uref / Math.log((Zref + z0) / z0)) ** 2 / Math.sqrt(0.09);
  files['0/U'] = field('volVectorField', 'U', '[0 1 -1 0 0 0 0]', `uniform (${f(Uref)} 0 0)`, {
    inlet: `type atmBoundaryLayerInletVelocity; ${abl} value uniform (0 0 0);`, outlet: 'type inletOutlet; inletValue uniform (0 0 0); value uniform (0 0 0);',
    ground: 'type fixedValue; value uniform (0 0 0);', buildings: 'type fixedValue; value uniform (0 0 0);', top: 'type slip;', sides: 'type slip;' });
  files['0/p'] = field('volScalarField', 'p', '[0 2 -2 0 0 0 0]', 'uniform 0', { inlet: 'type zeroGradient;', outlet: 'type fixedValue; value uniform 0;', ground: 'type zeroGradient;', buildings: 'type zeroGradient;', top: 'type zeroGradient;', sides: 'type zeroGradient;' });
  files['0/k'] = field('volScalarField', 'k', '[0 2 -2 0 0 0 0]', `uniform ${f(kInt)}`, {
    inlet: `type atmBoundaryLayerInletK; ${abl} value uniform ${f(kInt)};`, outlet: `type inletOutlet; inletValue uniform ${f(kInt)}; value uniform ${f(kInt)};`,
    ground: `type kqRWallFunction; value uniform ${f(kInt)};`, buildings: `type kqRWallFunction; value uniform ${f(kInt)};`, top: 'type slip;', sides: 'type slip;' });
  const eInt = (0.41 * Uref / Math.log((Zref + z0) / z0)) ** 3 / (0.41 * (Zref + z0));
  files['0/epsilon'] = field('volScalarField', 'epsilon', '[0 2 -3 0 0 0 0]', `uniform ${f(eInt)}`, {
    inlet: `type atmBoundaryLayerInletEpsilon; ${abl} value uniform ${f(eInt)};`, outlet: `type inletOutlet; inletValue uniform ${f(eInt)}; value uniform ${f(eInt)};`,
    ground: old ? `type epsilonWallFunction; value uniform ${f(eInt)};` : `type atmEpsilonWallFunction; z0 uniform ${f(z0)}; value uniform ${f(eInt)};`, buildings: `type epsilonWallFunction; value uniform ${f(eInt)};`, top: 'type slip;', sides: 'type slip;' });
  files['0/nut'] = field('volScalarField', 'nut', '[0 2 -1 0 0 0 0]', 'uniform 0', {
    inlet: 'type calculated; value uniform 0;', outlet: 'type calculated; value uniform 0;', ground: old ? `type nutkAtmRoughWallFunction; z0 uniform ${f(z0)}; value uniform 0;` : `type atmNutkWallFunction; z0 uniform ${f(z0)}; value uniform 0;`,
    buildings: 'type nutkWallFunction; value uniform 0;', top: 'type slip;', sides: 'type slip;' });
  files['cc-probes.json'] = JSON.stringify(pts.map((q) => q.map((v) => +v.toFixed(4))));
  const steps = [{ cmd: 'blockMesh', args: [] }, { cmd: 'snappyHexMesh', args: ['-overwrite'] }, { cmd: 'checkMesh', args: ['-allGeometry', '-allTopology'], optional: true }, { cmd: 'simpleFoam', args: [] }, { cmd: 'cc-sample', args: [] }];
  return { files, steps, frame: { cx, cy, ex: fr.ex, ey: fr.ey, x0: -W, y0: -W }, plan: { dx: cellP, H, ground, cellsPerHeight: cph, cells: null, base, levels: L, nBase: [ncx, ncy, ncz] },
    probes: { n: pn, gridCount, cell: cellP, points: pts, z: probeZ, W } };
}
