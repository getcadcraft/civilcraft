/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model.js — the version-neutral drawing model shared by the reader and the writer (docs/DWG-LIB-SPEC.md
 * "Model"), as JSDoc typedefs, plus small helpers. cc-dwg (Apache-2.0). Field meanings follow DXF group
 * codes (public Autodesk DXF reference); the DWG encodings behind them are in the ODA spec v5.4.1,
 * chapter 20 (object prescriptions) and 2.11 (colours).
 *
 * Helpers (stable exports, used by the writer too):
 *   VERSIONS                         { AC1015: 'R2000', … }
 *   handleHex(n) / handleNum(hex)    Number ⇄ 'ABC' (DXF style, no leading zeros; 0 ⇄ '')
 *   LINEWEIGHTS                      DWG lineweight index → 1/100 mm; lineweightFromIndex(i) / lineweightIndex(lw)
 *   aciRgb(i)                        0xRRGGBB of an AutoCAD colour index 1..255 (ACI palette)
 *   nearestAci(rgb)                  the closest ACI 1..255 to a true colour
 *   colorByLayer() colorByBlock() colorIndex(i) colorRgb(rgb, name?, book?)
 *   isByLayer(c) isByBlock(c)
 *   transparencyFromWord(w)          DWG transparency BL → { byLayer } | { byBlock } | { alpha 0..255 }
 *   newModel(version)                an empty Model
 */

export const VERSIONS = { AC1015: 'R2000', AC1018: 'R2004', AC1021: 'R2007', AC1024: 'R2010', AC1027: 'R2013', AC1032: 'R2018' };

/**
 * @typedef {{x:number, y:number, z?:number}} Point
 * @typedef {{index:number} | {rgb:number, index?:number, name?:string, book?:string}} Color
 *   index: 0 ByBlock, 1..255 ACI, 256 ByLayer, 257 none
 * @typedef {{ byLayer?:true, byBlock?:true, alpha?:number }} Transparency  alpha 0 (clear) … 255 (opaque)
 *
 * @typedef {Object} Entity
 * @property {string} handle
 * @property {string} type      DXF type name: LINE ARC CIRCLE … ; POLYLINE_2D / _3D / PFACE / MESH; DIMENSION_LINEAR …;
 *                              'UNKNOWN' for classes we cannot decode ({typeNum, className})
 * @property {string} owner     owning block record handle (or the polyline / insert for folded sub-entities)
 * @property {string} layer     layer name
 * @property {string} linetype  name | 'ByLayer' | 'ByBlock'
 * @property {Color} color
 * @property {number} lineweight 1/100 mm, -1 ByLayer, -2 ByBlock, -3 default
 * @property {number} ltscale
 * @property {boolean} invisible
 * @property {Transparency} [transparency]
 * @property {string} [material]   handle
 * @property {string} [plotStyle]  handle
 * @property {Object<string, Array<[number, any]>>} [xdata]   APPNAME → [[code, value]…]
 * @property {string} [extDict]     handle
 * @property {string[]} [reactors]
 * @property {'model'|'paper'} [space]   for entities of *Model_Space / *Paper_Space*
 *
 * Type fields (DXF meaning; angles radians; points {x,y,z}; names are resolved: style, block, linetype):
 *   LINE      start end thickness extrusion
 *   POINT     position thickness extrusion xAxisAngle
 *   CIRCLE    center radius thickness extrusion          ARC  + startAngle endAngle
 *   ELLIPSE   center majorAxis ratio startParam endParam extrusion
 *   LWPOLYLINE vertices[{x,y,bulge,startWidth,endWidth,id?}] closed constantWidth elevation thickness extrusion plinegen flags
 *   POLYLINE_2D  flags curveType startWidth endWidth thickness elevation extrusion closed
 *                vertices[{x,y,z,startWidth,endWidth,bulge,tangent,flags,id?}]
 *   POLYLINE_3D  flags (DXF 70: 8 | closed 1 | splined 4) curveType closed vertices[{x,y,z,flags}]
 *   POLYLINE_PFACE numVertices numFaces flags vertices[{x,y,z,flags}] faces[[i1,i2,i3,i4]] (1-based; negative = hidden edge)
 *   POLYLINE_MESH  flags curveType m n mDensity nDensity vertices[{x,y,z,flags}] closed
 *   TEXT      insert align (DXF 11; equal to insert when not stored) height value rotation widthFactor oblique style
 *             hAlign vAlign generation thickness elevation extrusion
 *   ATTRIB/ATTDEF  TEXT fields + tag prompt (ATTDEF) flags fieldLength lockPosition attType (1 single line,
 *             2/4 multi-line R2018) mtext? (the embedded MTEXT of a multi-line attribute)
 *   MTEXT     insert xAxis width (reference rectangle) rectHeight height (text height) attach direction value
 *             (raw, with format codes) style lineSpacing lineSpacingStyle extrusion backgroundFlags backgroundScale
 *             backgroundColor backgroundTransparency columns? storedValue? (the down-saved copy when value came
 *             from the ACAD_MTEXT_RT round-trip record)
 *   INSERT    block (name) blockRecord (handle) insert scale{x,y,z} rotation extrusion attribs[ATTRIB…]
 *   MINSERT   INSERT + cols rows colSpacing rowSpacing
 *   DIMENSION_LINEAR / _ALIGNED / _ANG2LN / _ANG3PT / _RADIUS / _DIAMETER / _ORDINATE, ARC_DIMENSION,
 *   LARGE_RADIAL_DIMENSION  — dimType (0 linear, 1 aligned, 2 angular, 3 diameter, 4 radius, 5 angular 3-pt,
 *             6 ordinate, 8 arc, 9 large radial), flags (DXF 70 incl. 32/64/128), block (name of the drawn
 *             "*D…" block), style (dimension style name), defPoint (DXF 10), textMid (11), insert (12),
 *             xline1 (13), xline2 (14), center (15: centre / far chord point / angular vertex), arcPoint (16),
 *             angle (50, linear), obliqueAngle (52), leaderLen (40), measurement (42), text (1, '' = measured),
 *             attach (71) lineSpacingStyle lineSpacing textRotation (53) horizDir (51) insScale insRotation
 *             extrusion elevation flipArrow1 flipArrow2 (+ arcStart arcEnd isPartial hasLeader leader1 leader2 for arcs)
 *   LEADER    vertices annotation (handle) style annotType pathType hookLineOnX arrowhead origin extrusion
 *             xDirection blockOffset endPointProj boxHeight? boxWidth? (not stored from R2010)
 *   MULTILEADER  style textStyle contentBlock context{roots[{connection, direction, lines[{points}]}], text?{label,
 *             location, …}, block?{location, scale, rotation, matrix}} + the MLEADER override fields — every field, with
 *             its handle references as hex *Handle fields, is listed in mleader-read.js; proxyGraphics (base64) when stored
 *   HATCH     pattern solid associative style patternType angle scale double elevation extrusion pixelSize?
 *             loops[{flags, boundary[handles], edges:[{type:'line',start,end} | {type:'arc',center,radius,startAngle,
 *             endAngle,ccw} | {type:'ellipse',center,majorAxis,ratio,startAngle,endAngle,ccw} | {type:'spline',degree,
 *             rational,periodic,knots,control,weights?,fit?,startTangent?,endTangent?}] | polyline:{closed,hasBulges,
 *             vertices[{x,y,bulge}]}}] seeds patternLines?[{angle,base,offset,dashes}] gradient?{name,angle,shift,
 *             singleColor,tint,colors[{value,rgb}]}
 *   SOLID/TRACE  points[4] thickness elevation extrusion      3DFACE  points[4] invisibleEdges
 *   SPLINE    degree closed periodic rational knots weights? control fit startTangent endTangent knotTolerance
 *             controlTolerance fitTolerance scenario (1 control points, 2 fit points) splineFlags1? knotParam?
 *             controlComputed (true: knots/control computed from fit data with zero tolerance, see read.js)
 *   RAY/XLINE start direction
 *   VIEWPORT  center width height viewCenter viewTarget viewDirection viewHeight twist lensLength frontClip backClip
 *             snapAngle snapBase snapSpacing gridSpacing circleZoom status (DXF 90) frozenLayers[handle] styleSheet
 *             renderMode ucs… shadePlotMode … (R13/R14: the view comes from the ACAD "MVIEW" xdata)
 *   IMAGE/WIPEOUT  def defReactor (handles) insert u v size displayFlags clipping brightness contrast fade clipType clip[Point]
 *   TOLERANCE insert xDirection text style      MLINE  scale justification base extrusion closed vertices style
 *   REGION/3DSOLID/BODY  (builder S, solid-read.js / solid-write.js)
 *             acis { format: 'sat'|'sab', version (ACIS release, e.g. 400, 21800), data (SAT text | SAB base64) } — absent
 *               with acisEmpty: true; R2013+ files keep the SAB in the data storage section, R2000 SAT, R2004–R2010 either
 *             acisExtra? (a second copy of the data some writers add after the wireframe), wireframe? { point?, isolines,
 *               isolinesPresent, wires? [{ type, selectionMarker, color, acisIndex, points [{x,y,z}], transform? }] },
 *             silhouettes? [{ viewportId, target, direction, up, perspective, wiresPresent, wires? }],
 *             hasRevisionGuid, revisionGuid '{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}' (DXF 290 / 2; R2004–R2010 from the
 *               ACAD_OBJECT_CHANGE_GUID xdata), history (3DSOLID, R2007+: handle of the history object, DXF 350)
 *   SURFACE / PLANESURFACE / EXTRUDEDSURFACE / LOFTEDSURFACE / REVOLVEDSURFACE / SWEPTSURFACE / NURBSURFACE (R2013+)
 *             (surface-read.js / surface-write.js; layout in surface-layout.js; DXF codes in brackets; matrices are 16
 *             numbers in DXF order; angles radians): the REGION/BODY fields above (acis, wireframe, silhouettes, revision
 *             GUID; no history) + uIsolines [71] vIsolines [72]; savedDownFrom? 'NURBSURFACE' (a SURFACE that a save-down to
 *             R2000–R2010 made of a NURBS surface: XRECORD ACAD_XREC_ROUNDTRIP "AcadModlrDecomposedType" 1 in its extension
 *             dictionary; written R2013+ it is a NURBSURFACE again), decomposedType? (another such value)
 *     PLANESURFACE  nothing more
 *     sweep options (EXTRUDEDSURFACE, SWEPTSURFACE): draftAngle [42] startDraftDistance [43] endDraftDistance [44]
 *             twistAngle [45] scaleFactor [48] alignAngle [49] solid [290] alignment [70] miterOption [71] alignStart [292]
 *             bank [293] basePointSet [294] twistRefVector [11] sweepTransformComputed [295] pathTransformComputed [296]
 *             sweepEntityTransform [46] pathEntityTransform [47]
 *     EXTRUDEDSURFACE  sweep options + sweepVector [10] matrix [40] profileEntity? [90]
 *     SWEPTSURFACE     sweep options + sweepEntityMatrix [40] pathEntityMatrix [41] sweepEntity? [90] pathEntity? [91]
 *     REVOLVEDSURFACE  draftAngle [43] startDraftDistance [44] endDraftDistance [45] twistAngle [46] solid [290]
 *             closeToAxis [291] axisPoint [10] axisVector [11] revolveAngle [40] startAngle [41] matrix [42] revolveEntity? [90]
 *     LOFTEDSURFACE    matrix [40] crossSections? guides? pathEntity? startDraftAngle [41] endDraftAngle [42]
 *             startDraftMagnitude [43] endDraftMagnitude [44] arcLengthParameterization [290] noTwist [291] alignDirection [292]
 *             simpleSurfaces [293] closedSurfaces [294] solid [295] ruledSurface [296] virtualGuide [297] normal [70]
 *     NURBSURFACE      nurbs170 [170] nurbs290 [290] nurbs10 nurbs11 nurbs12 nurbs13 [10–13 points] (meanings not given by
 *             the spec or the DXF; the NURBS control data itself is in the ACIS data)
 *     The embedded profile / path / sweep / revolve entities and the loft's cross sections and guides: absent when there
 *             are none (every file seen); else { value (class id / count, or true), raw { ver, n, data } } — their encoding
 *             is unknown, so the rest of the entity's data is kept as it is and written back in the same version only
 *   OLE2FRAME  flags mode dataLength
 *   SHAPE     insert scale rotation widthFactor oblique thickness shapeNumber style extrusion
 *   ACAD_TABLE  insert scale rotation extrusion horizDir block (the drawn "*T…" block, name) blockRecord (handle)
 *             table (table-read.js / table-write.js; the same in every version):
 *               { style (TABLESTYLE handle), styleName, flowDirection (0 down, 1 up), flags? (DXF 90), titleSuppressed?,
 *                 headerSuppressed?, name?, description?, tableBits? (R2010+ BS after the content),
 *                 rows[{height, style ('_TITLE'|'_HEADER'|'_DATA'|custom), cellStyle?}], columns[{width, name?, style?, cellStyle?}],
 *                 merged[{top, left, bottom, right}],
 *                 cells[row][col]: { type: 'text'|'block', value (the text shown; a field's evaluated text),
 *                   data? ({dataType 1 long 2 double 4 string 512 general …, flags, value?, bytes?, unitType?, format?, text?}),
 *                   field? (FIELD tree: {handle, evaluatorId, code, value, valueString, childValues?, children?[…], objects?, …}),
 *                   block? (name) blockRecord? blockScale? attrs?[{attdef (handle), tag, value, index}],
 *                   style (cell style name), align (1..9, effective), rotation, autoFit?, merged?{rows, cols} (top-left
 *                   cell of a merge), covered? (inside one), overrides?{align, textHeight, textStyle (name), color,
 *                   background, fillNone, borders{top|right|bottom|left: {color?, lineweight?, visible?}}} (a shared edge
 *                   belongs to the upper / left cell), edges?{flags, virtual}, contentFormat?/cellStyle? (R2010+ detail),
 *                   state?, tooltip?, custom? },
 *                 overrides?/overrideFlags?/borderColors?/… (R13–R2007 table-wide overrides), breaks?, rowRanges? }
 *   TABLESTYLE (object)  name (its ACAD_TABLESTYLE entry) description flowDirection flags hMargin vMargin
 *             titleSuppressed headerSuppressed cellStyles[{id (1 title 2 header 3 data, ≥101 custom), name, styleClass,
 *             textStyle, textHeight, align, color, background, backgroundEnabled, borders{top insideH bottom left insideV
 *             right: {lineweight, visible, color}}, dataType?, unitType?, format?, cell? (R2010+ full cell style)}]
 *             tableCellStyle? (R2010+ "Table" style)
 *   FIELD (object)  evaluatorId code format? evalOptions filingOptions state evalStatus evalError evalMessage? value
 *             valueString childValues?[{key, value}] children[handles] objects?[handles]
 *   LIGHT     lightVersion name lightType (1 distant, 2 point, 3 spot) status lightColor (colour, DXF 63/421) plotGlyph
 *             intensity position target attenuationType useAttenuationLimits attenuationStart attenuationEnd hotspot falloff
 *             (radians; DXF 50/51 degrees) castShadows shadowType shadowMapSize shadowMapSoftness; the entity colour is the
 *             common `color` (DXF 62/420). Written by solid-write.js (class AcDbLight, every version; R2000 true colours → nearest index).
 *   UNKNOWN   typeNum dxfName className bits (undecoded data bits) — custom/proxy entities, counted in report.unknown
 *   raw       (UNKNOWN, ACAD_PROXY_ENTITY and every non-graphical object) the undecoded bits kept for the writer:
 *             { ver, n, data (base64), h: [[code, 'HEX']…], gfx? } — passthrough.js
 *   damaged   (any entity) the error text when the object could only be read in part
 *
 * Blocks and block records also carry trueName (dynamic block name from xdata AcDbDynamicBlockTrueName[2]).
 *
 * @typedef {Object} Block
 * @property {string} name
 * @property {string} handle   BLOCK entity
 * @property {string} record   block record handle
 * @property {Point} base
 * @property {number} flags
 * @property {string} xrefPath
 * @property {string} description
 * @property {Entity[]} entities
 * @property {string} [endHandle]
 *
 * Layout = { handle, owner, name, tabOrder, flags, block (block record handle), paper: { name (paper size), w, h (mm),
 *   units (0 in, 1 mm, 2 px), margins{left,bottom,right,top}, rotation, plotType, scaleType, scaleFactor, plotScale
 *   (real world / drawing units), origin, pageSetupName, printer, styleSheet, flags, windowMin, windowMax },
 *   limits{min,max}, insbase, extents{min,max}, ucs{origin,xAxis,yAxis}, elevation, lastActiveViewport, viewports[handles] }
 *
 * @typedef {Object} Model
 * @property {string} version   'AC1027'
 * @property {number} maintenance
 * @property {string} codepage  'ANSI_1252'
 * @property {Object<string, any>} header
 * @property {Array<{num:number, dxfName:string, cppName:string, appName:string, proxyFlags:number, wasZombie:boolean, isEntity:boolean, instanceCount?:number}>} classes
 * @property {{layers:any[], linetypes:any[], styles:any[], dimstyles:any[], views:any[], ucs:any[], vports:any[], appids:any[], blockRecords:any[]}} tables
 * @property {Block[]} blocks
 * @property {any[]} layouts
 * @property {any[]} objects
 * @property {{counts:Object<string, number>, notes:string[], unknown:Object<string, number>}} report
 */

export function handleHex(n) { return n ? Number(n).toString(16).toUpperCase() : ''; }
export function handleNum(h) { return h ? parseInt(h, 16) : 0; }

// Lineweight index (DWG RC / LAYER bits 0x3E0) → 1/100 mm. Spec gap: chapter 20 stores the index but the spec
// does not list the values; the list is DXF's set of valid lineweights (DXF reference, group 370), and the
// index → value order was checked against the ODA File Converter's DXF of the corpus (reader-compare).
export const LINEWEIGHTS = [0, 5, 9, 13, 15, 18, 20, 25, 30, 35, 40, 50, 53, 60, 70, 80, 90, 100, 106, 120, 140, 158, 200, 211];
export function lineweightFromIndex(i) {
  if (i === 29) return -1;
  if (i === 30) return -2;
  if (i === 31) return -3;
  // Spec gap: indexes 24–28 are not lineweights; the ODA File Converter reports them as ByLayer.
  return LINEWEIGHTS[i] ?? -1;
}
export function lineweightIndex(lw) {
  if (lw === -1) return 29;
  if (lw === -2) return 30;
  if (lw === -3 || lw == null) return 31;
  let best = 0;
  for (let i = 0; i < LINEWEIGHTS.length; i++) if (Math.abs(LINEWEIGHTS[i] - lw) < Math.abs(LINEWEIGHTS[best] - lw)) best = i;
  return best;
}

// ACI palette. 1–9 fixed; 10–249 are 24 hues × 5 brightness levels × (full, half saturation); 250–255 greys.
const ACI = (() => {
  const t = new Uint32Array(256);
  const fixed = [0x000000, 0xFF0000, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x0000FF, 0xFF00FF, 0xFFFFFF, 0x808080, 0xC0C0C0];
  for (let i = 0; i < 10; i++) t[i] = fixed[i];
  const bright = [1, 0.65, 0.5, 0.3, 0.15];
  for (let i = 10; i < 250; i++) {
    const hue = Math.floor(i / 10) - 1, k = i % 10;
    const v = bright[k >> 1], s = k & 1 ? 0.5 : 1;
    const h = (hue * 15) / 60, f = h - Math.floor(h), sector = Math.floor(h) % 6;
    const p = v * (1 - s), q = v * (1 - s * f), u = v * (1 - s * (1 - f));
    const [r, g, b] = [[v, u, p], [q, v, p], [p, v, u], [p, q, v], [u, p, v], [v, p, q]][sector];
    t[i] = (Math.floor(r * 255) << 16) | (Math.floor(g * 255) << 8) | Math.floor(b * 255);
  }
  const greys = [0x33, 0x50, 0x69, 0x82, 0xBE, 0xFF];
  for (let i = 0; i < 6; i++) t[250 + i] = greys[i] * 0x010101;
  return t;
})();
export function aciRgb(i) { return ACI[i & 0xFF]; }
export function nearestAci(rgb) {
  const r = (rgb >> 16) & 255, g = (rgb >> 8) & 255, b = rgb & 255;
  let best = 7, bd = Infinity;
  for (let i = 1; i < 256; i++) {
    const c = ACI[i], dr = ((c >> 16) & 255) - r, dg = ((c >> 8) & 255) - g, db = (c & 255) - b;
    const d = dr * dr + dg * dg + db * db;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}
export const colorByLayer = () => ({ index: 256 });
export const colorByBlock = () => ({ index: 0 });
export const colorIndex = (i) => ({ index: i });
export const colorRgb = (rgb, name, book) => { const c = { rgb }; if (name) c.name = name; if (book) c.book = book; return c; };
export const isByLayer = (c) => !c || (c.rgb === undefined && c.index === 256);
export const isByBlock = (c) => !!c && c.rgb === undefined && c.index === 0;

/** DWG transparency word (top byte 0 ByLayer, 1 ByBlock, 3 alpha in the low byte). */
export function transparencyFromWord(w) {
  const type = w >>> 24;
  if (type === 0) return { byLayer: true };
  if (type === 1) return { byBlock: true };
  return { alpha: w & 0xFF };
}

/** @returns {Model} */
export function newModel(version = 'AC1015') {
  return {
    version, maintenance: 0, codepage: 'ANSI_1252', header: {}, classes: [],
    tables: { layers: [], linetypes: [], styles: [], dimstyles: [], views: [], ucs: [], vports: [], appids: [], blockRecords: [] },
    blocks: [], layouts: [], objects: [], report: { counts: {}, notes: [], unknown: {} },
  };
}
