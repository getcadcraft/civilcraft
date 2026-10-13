/* SPDX-License-Identifier: Apache-2.0 */
/**
 * surface-layout.js — the field layout of the SURFACE family classes after their AcDbSurface part, shared by
 * surface-read.js and surface-write.js (cc-dwg, Apache-2.0; data only, so neither module pulls in the other).
 *
 * Spec gap: the ODA "Open Design Specification for .dwg files" v5.4.1 documents none of these classes. The layout was
 * found by experiment (surface-read.js tells how) and is the same in every version from R2000 to R2018.
 * Codes: BD, BS, B, BL, BD3 (3BD), M (a 4×4 matrix as 16 BD, in DXF order), ENT (embedded entity data: a BL — a class id
 * or a count — followed by the data when it is not 0) and ENTB (the same announced by a B); the embedded data's
 * encoding is unknown (surface-read.js). Spec gap, found by writing files with this writer: any of those values set
 * without the data makes the ODA File Converter fail to read the object ("Object improperly read").
 */

export const SURFACE_TYPES = ['SURFACE', 'PLANESURFACE', 'EXTRUDEDSURFACE', 'LOFTEDSURFACE', 'REVOLVEDSURFACE', 'SWEPTSURFACE', 'NURBSURFACE'];

/** AcDbSweepOptions as EXTRUDEDSURFACE and SWEPTSURFACE store them (DXF codes in the comments). */
const SWEEP_OPTIONS = [
  ['draftAngle', 'BD'],                // 42
  ['startDraftDistance', 'BD'],        // 43
  ['endDraftDistance', 'BD'],          // 44
  ['twistAngle', 'BD'],                // 45
  ['scaleFactor', 'BD'],               // 48
  ['alignAngle', 'BD'],                // 49
  ['solid', 'B'],                      // 290
  ['alignment', 'BS'],                 // 70 sweep alignment option
  ['miterOption', 'BS'],               // 71
  ['alignStart', 'B'],                 // 292
  ['bank', 'B'],                       // 293
  ['basePointSet', 'B'],               // 294
  ['twistRefVector', 'BD3'],           // 11 reference vector for controlling twist
  ['sweepTransformComputed', 'B'],     // 295
  ['pathTransformComputed', 'B'],      // 296
  ['sweepEntityTransform', 'M'],       // 46
  ['pathEntityTransform', 'M'],        // 47
];

/**
 * Spec gap (all of it, see the header). Found by experiment on the converter's files; DXF codes in the comments.
 * LOFTEDSURFACE: the flags are in DXF order except "solid" (295), which comes before "closed" (294); its DXF 70 is last.
 */
export const SURFACE_LAYOUTS = {
  SURFACE: [],
  PLANESURFACE: [],                     // AcDbPlaneSurface adds nothing
  EXTRUDEDSURFACE: [
    ...SWEEP_OPTIONS,
    ['sweepVector', 'BD3'],             // 10
    ['matrix', 'M'],                    // 40 transform of the extruded entity
    ['profileEntity', 'ENT'],           // 90 (+ size, 310 data)
  ],
  SWEPTSURFACE: [
    ...SWEEP_OPTIONS,
    ['sweepEntityMatrix', 'M'],         // 40 transform of the sweep entity
    ['pathEntityMatrix', 'M'],          // 41 transform of the path entity
    ['sweepEntity', 'ENT'],             // 90
    ['pathEntity', 'ENT'],              // 91
  ],
  REVOLVEDSURFACE: [
    ['draftAngle', 'BD'],               // 43
    ['startDraftDistance', 'BD'],       // 44
    ['endDraftDistance', 'BD'],         // 45
    ['twistAngle', 'BD'],               // 46
    ['solid', 'B'],                     // 290
    ['closeToAxis', 'B'],               // 291
    ['axisPoint', 'BD3'],               // 10
    ['axisVector', 'BD3'],              // 11
    ['revolveAngle', 'BD'],             // 40
    ['startAngle', 'BD'],               // 41
    ['matrix', 'M'],                    // 42 transform of the revolved entity
    ['revolveEntity', 'ENT'],           // 90
  ],
  // Spec gap: after the matrix come a BL, a BL and a B that were 0 in every file the converter wrote, and any other value
  // there makes the converter fail ("Object improperly read") — so they announce embedded data, presumably the cross
  // section and guide curve entities and the path entity of the loft (found by writing such files with this writer). The
  // last field, a BS, is DXF 70 (writing 1 there, the converter's DXF shows 70 1).
  LOFTEDSURFACE: [
    ['matrix', 'M'],                    // 40 transform of the loft entity
    ['crossSections', 'ENT'],           // (not in DXF)
    ['guides', 'ENT'],                  // (not in DXF)
    ['pathEntity', 'ENTB'],             // (not in DXF)
    ['startDraftAngle', 'BD'],          // 41
    ['endDraftAngle', 'BD'],            // 42
    ['startDraftMagnitude', 'BD'],      // 43
    ['endDraftMagnitude', 'BD'],        // 44
    ['arcLengthParameterization', 'B'], // 290
    ['noTwist', 'B'],                   // 291
    ['alignDirection', 'B'],            // 292
    ['simpleSurfaces', 'B'],            // 293
    ['solid', 'B'],                     // 295
    ['closedSurfaces', 'B'],            // 294
    ['ruledSurface', 'B'],              // 296
    ['virtualGuide', 'B'],              // 297
    ['normal', 'BS'],                   // 70 plane normal lofting type
  ],
  // R2013+ only (the converter saves it down to R2000–R2010 as a plain SURFACE). The fields' meanings are not given by
  // the spec nor by the converter's DXF (AcDbNurbSurface 170, 290, 10–13): they are named by their DXF codes.
  NURBSURFACE: [
    ['nurbs170', 'BS'],                 // 170
    ['nurbs290', 'B'],                  // 290
    ['nurbs10', 'BD3'],                 // 10
    ['nurbs11', 'BD3'],                 // 11
    ['nurbs12', 'BD3'],                 // 12
    ['nurbs13', 'BD3'],                 // 13
  ],
};

/** Class table entries (DXF CLASSES), as the ODA File Converter writes them in every version. */
export const SURFACE_CLASSES = {
  SURFACE: { dxf: 'SURFACE', cpp: 'AcDbSurface', app: 'ObjectDBX Classes', entity: true, proxy: 4095 },
  PLANESURFACE: { dxf: 'PLANESURFACE', cpp: 'AcDbPlaneSurface', app: 'ObjectDBX Classes', entity: true, proxy: 4095 },
  EXTRUDEDSURFACE: { dxf: 'EXTRUDEDSURFACE', cpp: 'AcDbExtrudedSurface', app: 'ObjectDBX Classes', entity: true, proxy: 4093 },
  LOFTEDSURFACE: { dxf: 'LOFTEDSURFACE', cpp: 'AcDbLoftedSurface', app: 'ObjectDBX Classes', entity: true, proxy: 4093 },
  REVOLVEDSURFACE: { dxf: 'REVOLVEDSURFACE', cpp: 'AcDbRevolvedSurface', app: 'ObjectDBX Classes', entity: true, proxy: 4093 },
  SWEPTSURFACE: { dxf: 'SWEPTSURFACE', cpp: 'AcDbSweptSurface', app: 'ObjectDBX Classes', entity: true, proxy: 4093 },
  NURBSURFACE: { dxf: 'NURBSURFACE', cpp: 'AcDbNurbSurface', app: 'ObjectDBX Classes', entity: true, proxy: 0 },
};
