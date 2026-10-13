/* SPDX-License-Identifier: Apache-2.0 */
/**
 * reader-compare.mjs — builder R's check: our readDwg() against the ODA File Converter's DXF (read by ezdxf),
 * entity by entity, by handle.
 *
 *   node tools/dwg-test/reader-compare.mjs [file.dwg|dir …] [--json out.json] [--verbose] [--type LINE]
 *     default: testfiles/dwg-samples, the repo's fixtures/ (recursively), and
 *     testfiles/dwg-corpus/<version>/ when it exists.
 *   Oracle DXF/JSON are cached in tmp/dwg-reader/oracle/ (ODA run per file, then reader-oracle.py).
 *
 * Numbers must agree to 1e-9 relative (absolute below 1); angles are compared in DXF degrees; text exactly.
 * Prints per file: entities in ODA / ours / matched by handle, missing, extra, and per type the fields that
 * differ (with the first examples).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readDwg } from '../../lib/dwg/read.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TF = '/var/www/CADCRAFT/testfiles';
const CACHE = path.join(ROOT, 'tmp/dwg-reader/oracle');
const PY = path.join(ROOT, 'tools/civilcraft-test/venv/bin/python');
const ODA = path.join(ROOT, 'tools/civilcraft-test/venv/dwg-readers/oda/AppRun');

const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const verbose = flag('--verbose');
const onlyType = opt('--type');
const jsonOut = opt('--json');
const inputs = args.filter((a, i) => !a.startsWith('--') && !['--json', '--type'].includes(args[i - 1]));

function walk(p, out) {
  if (!fs.existsSync(p)) return;
  const st = fs.statSync(p);
  if (st.isDirectory()) for (const f of fs.readdirSync(p).sort()) walk(path.join(p, f), out);
  else if (/\.dwg$/i.test(p)) out.push(p);
}
const files = [];
if (inputs.length) for (const i of inputs) walk(i, files);
else for (const d of [path.join(TF, 'dwg-samples'), path.join(ROOT, 'fixtures'), path.join(TF, 'dwg-corpus')]) walk(d, files);

// ---------------------------------------------------------------- oracle
function oracle(file) {
  fs.mkdirSync(CACHE, { recursive: true });
  const key = file.replace(/[^A-Za-z0-9._-]+/g, '_').slice(-180);
  const json = path.join(CACHE, key + '.json');
  const st = fs.statSync(file);
  if (fs.existsSync(json) && fs.statSync(json).mtimeMs > st.mtimeMs) return JSON.parse(fs.readFileSync(json, 'utf8'));
  const inDir = path.join(CACHE, 'in'), outDir = path.join(CACHE, 'out');
  fs.rmSync(inDir, { recursive: true, force: true }); fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(inDir, { recursive: true }); fs.mkdirSync(outDir, { recursive: true });
  fs.copyFileSync(file, path.join(inDir, 'x.dwg'));
  spawnSync('xvfb-run', ['-a', ODA, inDir, outDir, 'ACAD2018', 'DXF', '0', '1', '*.dwg'], { encoding: 'utf8', timeout: 600000 });
  const dxf = path.join(outDir, 'x.dxf');
  if (!fs.existsSync(dxf)) return null;
  const r = spawnSync(PY, ['-I', path.join(ROOT, 'tools/dwg-test/reader-oracle.py'), dxf, json], { encoding: 'utf8' });
  if (r.status !== 0) { console.log('  oracle failed:', r.stderr.slice(-400)); return null; }
  const o = JSON.parse(fs.readFileSync(json, 'utf8'));
  if (fs.existsSync(dxf + '.err')) o.odaErr = fs.readFileSync(dxf + '.err', 'utf8').slice(0, 500);
  fs.writeFileSync(json, JSON.stringify(o));
  return o;
}

// ---------------------------------------------------------------- comparison helpers
const DEG = 180 / Math.PI;
const TOL = 1e-9;
function numEq(a, b) {
  if (a === b) return true;
  if (typeof a !== 'number' || typeof b !== 'number') return false;
  const s = Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) <= TOL * s;
}
function angEq(aDeg, bDeg) {
  if (numEq(aDeg, bDeg)) return true;
  let d = ((aDeg - bDeg) % 360 + 360) % 360;
  if (d > 180) d -= 360;
  return Math.abs(d) <= TOL * Math.max(1, Math.abs(aDeg), Math.abs(bDeg));
}
const P = (p, d = [0, 0, 0]) => (p ? [p.x ?? p[0], p.y ?? p[1], p.z ?? p[2] ?? 0] : d);
function ptEq(a, b) { return numEq(a[0], b[0]) && numEq(a[1], b[1]) && numEq(a[2] ?? 0, b[2] ?? 0); }

const OUR_DXF_TYPE = (e) => {
  if (e.type === 'UNKNOWN') return e.dxfName;
  if (e.type.startsWith('DIMENSION_')) return 'DIMENSION';
  if (e.type.startsWith('POLYLINE_')) return 'POLYLINE';
  if (e.type === 'ACAD_TABLE') return 'ACAD_TABLE';
  if (e.type === 'MINSERT') return 'INSERT';   // ezdxf reports MINSERT as INSERT with rows/columns
  return e.type;
};

// Differences that are explained (ODA's own conventions when it writes DXF), reported apart from mismatches.
let layerInfo = new Map();
function layerExplained(ours, oda) {
  const L = layerInfo.get(ours);
  if (L && L.xdata && L.xdata.AcadAnnotativeDecomposition && ours.startsWith(oda + ' @ ')) return 'annotative decomposition layer "X @ scale" (ODA folds it back into X)';
  if (oda === '*' + ours || (ours === '*LayerNameForDynamicConstraint' && oda === '*ADSK_CONSTRAINTS')) return 'hidden system layer renamed by ODA';
  return null;
}
function cmpCommon(e, o, diff) {
  const d = o.dxf;
  if ((e.layer || '0') !== (d.layer ?? '0')) {
    if (d.layer === undefined && o.type === 'ACAD_TABLE') diff('layer', e.layer, d.layer, 'ezdxf does not load ACAD_TABLE fully');
    else diff('layer', e.layer, d.layer, layerExplained(e.layer || '0', d.layer ?? '0'));
  }
  const lt = (e.linetype || 'ByLayer').toUpperCase(), olt = (d.linetype ?? 'BYLAYER').toUpperCase();
  if (lt !== olt) diff('linetype', e.linetype, d.linetype);
  const c = e.color || { index: 256 };
  if (d.true_color !== undefined) { if (c.rgb !== d.true_color) diff('color.rgb', c.rgb, d.true_color); }
  else if (c.rgb !== undefined) diff('color', JSON.stringify(c), d.color);
  else if ((c.index ?? 256) !== (d.color ?? 256)) diff('color', c.index, d.color);
  if ((e.lineweight ?? -1) !== (d.lineweight ?? -1)) diff('lineweight', e.lineweight, d.lineweight);
  if (!numEq(e.ltscale ?? 1, d.ltscale ?? 1)) diff('ltscale', e.ltscale, d.ltscale);
  // transparency: DXF 440 = 0x02000000 | alpha, 0x01000000 ByBlock, absent = ByLayer
  const tr = e.transparency, tw = d.transparency;
  const ours440 = !tr || tr.byLayer ? undefined : tr.byBlock ? 0x01000000 : (0x02000000 | tr.alpha);
  if (ours440 !== tw && !(ours440 === undefined && tw === 0)) diff('transparency', ours440, tw);
  // extended data, app by app (values compared as numbers/strings/points)
  if (o.xdata) {
    // ODA rewrites round-trip xdata when it loads a file: it consumes ACAD "RTLwPs" (applied as the lineweight),
    // and re-composes annotative decomposition (AcadAnnotative flag, DSTYLE overrides) and hidden system layers
    const layerWhy = layerExplained(e.layer || '0', d.layer ?? '0');
    for (const [app, all] of Object.entries(o.xdata)) {
      const items = all.length && all[0][0] === 1001 ? all.slice(1) : all;   // ezdxf keeps the (1001, app) tag
      let mine = e.xdata && e.xdata[app];
      if (mine && app === 'ACAD') mine = mine.filter((it, i, a) => !(it[1] === 'RTLwPs' || (i > 0 && a[i - 1][1] === 'RTLwPs')));
      if (layerWhy || (e.layer || '').includes('@') || /ADSK_SYSTEM/.test(d.layer || '') || (e.xdata && e.xdata.AcadAnnotative)) {
        const same = mine && mine.length === items.length;
        if (!same || app === 'AcadAnnotative' || app === 'ACAD') { if (JSON.stringify(mine) !== JSON.stringify(items)) diff('xdata.' + app, mine && mine.length, items.length, 'xdata of re-composed annotative / hidden-layer objects (ODA rewrites it)'); continue; }
      }
      if (!mine) { diff('xdata.' + app, undefined, items.length + ' items'); continue; }
      if (mine.length !== items.length) { diff('xdata.' + app + '.length', mine.length, items.length); continue; }
      for (let i = 0; i < items.length; i++) {
        const [c, v] = items[i], [mc, mv] = mine[i];
        const same = c === mc && (Array.isArray(v) ? ptEq(P(mv), v) : typeof v === 'number' ? numEq(mv, v) : String(mv).toUpperCase() === String(v).toUpperCase());
        if (!same) { diff('xdata.' + app + '.item', [mc, mv], [c, v]); break; }
      }
    }
  }
  if (!!e.invisible !== !!d.invisible) diff('invisible', e.invisible, d.invisible, /ADSK_CONSTRAINTS/.test(d.layer || '') ? 'constraint entities on the hidden layer (ODA shows them)' : null);
}

const fieldChecks = {
  LINE: [['start', 'start', 'pt'], ['end', 'end', 'pt'], ['thickness', 'thickness', 'num', 0], ['extrusion', 'extrusion', 'pt', [0, 0, 1]]],
  POINT: [['position', 'location', 'pt'], ['thickness', 'thickness', 'num', 0], ['xAxisAngle', 'angle', 'deg', 0], ['extrusion', 'extrusion', 'pt', [0, 0, 1]]],
  CIRCLE: [['center', 'center', 'pt'], ['radius', 'radius', 'num'], ['thickness', 'thickness', 'num', 0], ['extrusion', 'extrusion', 'pt', [0, 0, 1]]],
  ARC: [['center', 'center', 'pt'], ['radius', 'radius', 'num'], ['startAngle', 'start_angle', 'deg'], ['endAngle', 'end_angle', 'deg'],
    ['thickness', 'thickness', 'num', 0], ['extrusion', 'extrusion', 'pt', [0, 0, 1]]],
  ELLIPSE: [['center', 'center', 'pt'], ['majorAxis', 'major_axis', 'pt'], ['ratio', 'ratio', 'num'], ['startParam', 'start_param', 'num', 0],
    ['endParam', 'end_param', 'num', 2 * Math.PI], ['extrusion', 'extrusion', 'pt', [0, 0, 1]]],
  SOLID: [['points.0', 'vtx0', 'pt'], ['points.1', 'vtx1', 'pt'], ['points.2', 'vtx2', 'pt'], ['points.3', 'vtx3', 'pt'],
    ['thickness', 'thickness', 'num', 0], ['extrusion', 'extrusion', 'pt', [0, 0, 1]]],
  TRACE: [['points.0', 'vtx0', 'pt'], ['points.1', 'vtx1', 'pt'], ['points.2', 'vtx2', 'pt'], ['points.3', 'vtx3', 'pt']],
  '3DFACE': [['points.0', 'vtx0', 'pt'], ['points.1', 'vtx1', 'pt'], ['points.2', 'vtx2', 'pt'], ['points.3', 'vtx3', 'pt'], ['invisibleEdges', 'invisible_edges', 'int', 0]],
  TEXT: [['insert', 'insert', 'pt'], ['height', 'height', 'num'], ['value', 'text', 'str'], ['rotation', 'rotation', 'deg', 0],
    ['widthFactor', 'width', 'num', 1], ['oblique', 'oblique', 'deg', 0], ['style', 'style', 'stri', 'Standard'], ['hAlign', 'halign', 'int', 0],
    ['vAlign', 'valign', 'int', 0], ['generation', 'text_generation_flag', 'int', 0], ['thickness', 'thickness', 'num', 0], ['extrusion', 'extrusion', 'pt', [0, 0, 1]]],
  MTEXT: [['insert', 'insert', 'pt'], ['height', 'char_height', 'num'], ['width', 'width', 'num', 0], ['attach', 'attachment_point', 'int', 1],
    ['style', 'style', 'stri', 'Standard'], ['xAxis', 'text_direction', 'pt', [1, 0, 0]], ['direction', 'flow_direction', 'int', 1],
    ['lineSpacing', 'line_spacing_factor', 'num', 1], ['lineSpacingStyle', 'line_spacing_style', 'int', 1], ['extrusion', 'extrusion', 'pt', [0, 0, 1]]],
  INSERT: [['block', 'name', 'stri'], ['insert', 'insert', 'pt'], ['scale.x', 'xscale', 'num', 1], ['scale.y', 'yscale', 'num', 1], ['scale.z', 'zscale', 'num', 1],
    ['rotation', 'rotation', 'deg', 0], ['extrusion', 'extrusion', 'pt', [0, 0, 1]]],
  MINSERT: [['cols', 'column_count', 'int', 1], ['rows', 'row_count', 'int', 1], ['colSpacing', 'column_spacing', 'num', 0], ['rowSpacing', 'row_spacing', 'num', 0]],
  SPLINE: [['degree', 'degree', 'int', 3], ['startTangent', 'start_tangent', 'ptopt'], ['endTangent', 'end_tangent', 'ptopt']],
  VIEWPORT: [['center', 'center', 'pt'], ['width', 'width', 'num'], ['height', 'height', 'num'], ['viewCenter', 'view_center_point', 'pt'],
    ['viewTarget', 'view_target_point', 'pt', [0, 0, 0]], ['viewDirection', 'view_direction_vector', 'pt', [0, 0, 1]], ['viewHeight', 'view_height', 'num'],
    ['twist', 'view_twist_angle', 'deg', 0], ['status', 'flags', 'int', 0], ['lensLength', 'perspective_lens_length', 'num', 50],
    ['frontClip', 'front_clip_plane_z_value', 'num', 0], ['backClip', 'back_clip_plane_z_value', 'num', 0], ['circleZoom', 'circle_zoom', 'int', 1000]],
  RAY: [['start', 'start', 'pt'], ['direction', 'unit_vector', 'pt']],
  XLINE: [['start', 'start', 'pt'], ['direction', 'unit_vector', 'pt']],
  HATCH: [['pattern', 'pattern_name', 'str'], ['solid', 'solid_fill', 'bool'], ['associative', 'associative', 'bool', 0], ['style', 'hatch_style', 'int', 0],
    ['patternType', 'pattern_type', 'int', 1], ['angle', 'pattern_angle', 'deg', 0], ['scale', 'pattern_scale', 'num', 1], ['double', 'pattern_double', 'bool', 0],
    ['extrusion', 'extrusion', 'pt', [0, 0, 1]], ['elevation', 'elevation.2', 'num', 0]],
  TOLERANCE: [['insert', 'insert', 'pt'], ['xDirection', 'x_axis_direction', 'pt', [1, 0, 0]], ['text', 'content', 'str'], ['style', 'dimstyle', 'stri']],
  LEADER: [['style', 'dimstyle', 'stri'], ['pathType', 'path_type', 'int', 0], ['annotType', 'annotation_type', 'int', 3]],
  LIGHT: [['name', 'name', 'str'], ['lightType', 'type', 'int', 2], ['status', 'status', 'bool', 1], ['plotGlyph', 'plot_glyph', 'bool', 0],
    ['intensity', 'intensity', 'num', 1], ['position', 'location', 'pt'], ['target', 'target', 'pt'], ['attenuationType', 'attenuation_type', 'int', 0],
    ['attenuationStart', 'attenuation_start_limits', 'num', 1], ['attenuationEnd', 'attenuation_end_limits', 'num', 10],
    ['hotspot', 'hotspot_angle', 'deg', 45], ['falloff', 'falloff_angle', 'deg', 50], ['castShadows', 'cast_shadows', 'bool', 1],
    ['shadowType', 'shadow_type', 'int', 0], ['shadowMapSize', 'shadow_map_size', 'int', 256], ['shadowMapSoftness', 'shadow_map_softness', 'int', 1]],
  ACAD_TABLE: [['insert', 'insert', 'pt'], ['block', 'geometry', 'stri']],
};
fieldChecks.ATTRIB = [...fieldChecks.TEXT, ['tag', 'tag', 'str'], ['flags', 'flags', 'int', 0]];
fieldChecks.ATTDEF = [...fieldChecks.TEXT, ['tag', 'tag', 'str'], ['prompt', 'prompt', 'str', ''], ['flags', 'flags', 'int', 0]];
fieldChecks.MINSERT = [...fieldChecks.INSERT, ...fieldChecks.MINSERT];

/** DXF writes control characters as ^ + (char + 64) ("^J" = line feed) and "^ " for a caret. */
const caret = (s) => (typeof s === 'string' ? s.replace(/\^(.)/g, (m, c) => (c === ' ' ? '^' : String.fromCharCode(c.charCodeAt(0) - 64))) : s);
const getPath = (o, p) => p.split('.').reduce((v, k) => (v == null ? undefined : v[k]), o);

function cmpFields(e, o, list, diff) {
  const d = o.dxf;
  for (const [ours, theirs, kind, def] of list) {
    if (e.storedTag && /^(insert|align|vAlign|hAlign|height|rotation)$/.test(ours)) {
      // a multi-line attribute folded back from a save-down: ODA recomputes its single-line placement
      const a0 = getPath(e, ours), b0 = getPath(d, theirs) ?? def;
      const same = kind === 'pt' ? ptEq(P(a0, def), P(b0, def)) : kind === 'deg' ? angEq((a0 ?? 0) * DEG, b0 ?? 0) : kind === 'num' ? numEq(a0 ?? def, b0) : (a0 ?? def) === b0;
      if (!same) diff(ours, a0, b0, 'multi-line attribute restored from ACAD_MLATT: ODA recomputes the single-line placement');
      continue;
    }
    const a = getPath(e, ours);
    let b = getPath(d, theirs);
    if (b === undefined) b = def;
    if (kind === 'pt') { if (!ptEq(P(a, def), P(b, def))) diff(ours, a, b); }
    else if (kind === 'ptopt') { if (b !== undefined && a !== undefined && !ptEq(P(a), P(b))) diff(ours, a, b); }
    else if (kind === 'num') { if (!numEq(a ?? def, b)) diff(ours, a, b, ours === 'widthFactor' && Math.abs(a) < 1e-6 && b === 1 ? 'ODA audit replaces a zero width factor by 1' : null); }
    else if (kind === 'deg') { if (!angEq((a ?? 0) * DEG, b ?? 0)) diff(ours, a === undefined ? a : a * DEG, b); }
    else if (kind === 'int') { if ((a ?? def) !== b) diff(ours, a, b); }
    else if (kind === 'bool') { if (!!a !== !!b) diff(ours, a, b); }
    else if (kind === 'str') { if ((a ?? '') !== caret(b ?? '')) diff(ours, a, b); }
    else if (kind === 'stri') {
      if (String(a ?? '').toUpperCase() !== String(b ?? '').toUpperCase()) {
        diff(ours, a, b, ours === 'block' && e._trueName && e._trueName.toUpperCase() === String(b).toUpperCase() ? 'ODA writes the dynamic block\'s true name for its anonymous *U reference' : null);
      }
    }
  }
}

function cmpSpecial(e, o, diff) {
  const d = o.dxf;
  switch (o.type) {
    case 'LWPOLYLINE': {
      const pts = o.points || [];
      if (pts.length !== e.vertices.length) { diff('vertices.length', e.vertices.length, pts.length); break; }
      // ODA writes per-vertex widths that are all equal as the constant width (43): the same polyline
      const cw = d.const_width ?? 0;
      const allW = cw && e.vertices.every((v) => numEq(v.startWidth, cw) && numEq(v.endWidth, cw)) && !e.constantWidth;
      e.vertices.forEach((v, i) => {
        const q = pts[i];
        if (!numEq(v.x, q[0]) || !numEq(v.y, q[1])) diff('vertex', [v.x, v.y], q.slice(0, 2));
        else if (!allW && (!numEq(v.startWidth, q[2]) || !numEq(v.endWidth, q[3]))) diff('vertex.width', [v.startWidth, v.endWidth], q.slice(2, 4));
        else if (!numEq(v.bulge, q[4])) diff('vertex.bulge', v.bulge, q[4]);
      });
      if (!!e.closed !== !!o.closed) diff('closed', e.closed, o.closed);
      if (!allW && !numEq(e.constantWidth || 0, cw)) diff('constantWidth', e.constantWidth, d.const_width);
      if (!numEq(e.elevation || 0, d.elevation ?? 0)) diff('elevation', e.elevation, d.elevation);
      if (!numEq(e.thickness || 0, d.thickness ?? 0)) diff('thickness', e.thickness, d.thickness);
      break;
    }
    case 'POLYLINE': {
      const vs = (o.vertices || []).filter((v) => !(v.flags & 128) || (v.flags & 64));
      const faces = (o.vertices || []).filter((v) => (v.flags & 128) && !(v.flags & 64));
      if ((d.flags ?? 0) !== (e.flags ?? 0)) diff('flags', e.flags, d.flags);
      if (vs.length !== e.vertices.length) { diff('vertices.length', e.vertices.length, vs.length); break; }
      e.vertices.forEach((v, i) => {
        const q = vs[i];
        if (!ptEq([v.x, v.y, v.z ?? 0], q.location)) diff('vertex', [v.x, v.y, v.z], q.location);
        else if (!numEq(v.bulge ?? 0, q.bulge ?? 0)) diff('vertex.bulge', v.bulge, q.bulge);
        else if (!numEq(v.startWidth ?? 0, q.start_width ?? 0) || !numEq(v.endWidth ?? 0, q.end_width ?? 0)) diff('vertex.width', [v.startWidth, v.endWidth], [q.start_width, q.end_width]);
      });
      if (e.faces) {
        if (faces.length !== e.faces.length) diff('faces.length', e.faces.length, faces.length);
        else e.faces.forEach((f, i) => { const q = faces[i]; const qi = [q.vtx0 ?? 0, q.vtx1 ?? 0, q.vtx2 ?? 0, q.vtx3 ?? 0]; if (f.join() !== qi.join()) diff('face', f, qi); });
      }
      break;
    }
    case 'SPLINE': {
      const kn = o.knots || [], cp = o.control || [], ft = o.fit || [], w = o.weights || [];
      const ek = e.knots || [], ec = e.control || [], ef = e.fit || [], ew = e.weights || [];
      if (!ek.length && kn.length && ef.length) diff('knots/control', 0, kn.length, 'fit points with a fit tolerance > 0: ODA approximates the control points (not reproduced)');
      else if (ek.length !== kn.length) diff('knots.length', ek.length, kn.length);
      else if (!ek.every((k, i) => numEq(k, kn[i]))) diff('knots', ek.slice(0, 4), kn.slice(0, 4));
      if (!ek.length && kn.length && ef.length) { /* explained above */ }
      else if (ec.length !== cp.length) diff('control.length', ec.length, cp.length);
      else if (!ec.every((p, i) => ptEq(P(p), cp[i]))) diff('control', ec.slice(0, 2), cp.slice(0, 2));
      if (ef.length !== ft.length) diff('fit.length', ef.length, ft.length);
      else if (!ef.every((p, i) => ptEq(P(p), ft[i]))) diff('fit', ef.slice(0, 2), ft.slice(0, 2));
      if (w.length && !w.every((x, i) => numEq(x, ew[i] ?? 1))) diff('weights', ew.slice(0, 3), w.slice(0, 3));
      const fl = (e.closed ? 1 : 0) | (e.periodic ? 2 : 0) | (e.rational ? 4 : 0);
      if (((d.flags ?? 0) & 7) !== fl && e.scenario !== 2) diff('flags', fl, d.flags);
      break;
    }
    case 'INSERT': {
      const oa = o.attribs || [], ea = (e.attribs || []).map((a) => a.handle);
      if (oa.join() !== ea.join()) diff('attribs', ea, oa);
      break;
    }
    case 'MTEXT':
      if ((e.value ?? '') !== caret(o.text ?? '')) {
        const strip = (t) => String(t).replace(/^\\p[^;]*;/, '');
        diff('value', e.value, o.text, strip(e.value ?? '') === strip(caret(o.text ?? '')) ? 'ODA rewrites the leading paragraph code (\\p…;)' : null);
      }
      break;
    case 'DIMENSION': {
      const t = d.dimtype ?? 0;
      if ((e.flags ?? 0) !== t) diff('flags', e.flags, t);
      if (String(e.block).toUpperCase() !== String(d.geometry ?? '').toUpperCase()) diff('block', e.block, d.geometry);
      if (String(e.style).toUpperCase() !== String(d.dimstyle ?? 'Standard').toUpperCase()) diff('style', e.style, d.dimstyle);
      const chk = (ours, k, def) => { const a = e[ours]; const b = d[k] ?? def; if (a === undefined && b === undefined) return; if (!ptEq(P(a, def), P(b, def))) diff(ours, a, b); };
      chk('defPoint', 'defpoint', [0, 0, 0]); chk('textMid', 'text_midpoint', [0, 0, 0]);
      const base = t & 7;
      if (base === 0 || base === 1 || base === 6) { chk('xline1', 'defpoint2', [0, 0, 0]); chk('xline2', 'defpoint3', [0, 0, 0]); }
      if (base === 5) { chk('xline1', 'defpoint2', [0, 0, 0]); chk('xline2', 'defpoint3', [0, 0, 0]); chk('center', 'defpoint4', [0, 0, 0]); }
      if (base === 2) { chk('xline1', 'defpoint2', [0, 0, 0]); chk('xline2', 'defpoint3', [0, 0, 0]); chk('center', 'defpoint4', [0, 0, 0]); chk('arcPoint', 'defpoint5', [0, 0, 0]); }
      if (base === 3 || base === 4) { chk('center', 'defpoint4', [0, 0, 0]); if (!numEq(e.leaderLen ?? 0, d.leader_length ?? 0)) diff('leaderLen', e.leaderLen, d.leader_length); }
      if (base === 0 && !angEq((e.angle ?? 0) * DEG, d.angle ?? 0)) diff('angle', (e.angle ?? 0) * DEG, d.angle);
      if ((e.text ?? '') !== caret(d.text ?? '')) diff('text', e.text, d.text);
      if (d.actual_measurement !== undefined && !numEq(e.measurement, d.actual_measurement)) diff('measurement', e.measurement, d.actual_measurement);
      if ((e.attach ?? 5) !== (d.attachment_point ?? 5)) diff('attach', e.attach, d.attachment_point);
      if (!angEq((e.textRotation ?? 0) * DEG, d.text_rotation ?? 0)) diff('textRotation', (e.textRotation ?? 0) * DEG, d.text_rotation);
      if (!ptEq(P(e.extrusion, [0, 0, 1]), P(d.extrusion, [0, 0, 1]))) diff('extrusion', e.extrusion, d.extrusion);
      break;
    }
    case 'HATCH': {
      const op = o.paths || [];
      if (op.length !== e.loops.length) { diff('loops.length', e.loops.length, op.length); break; }
      e.loops.forEach((l, i) => {
        const q = op[i];
        if ((l.flags ?? 0) !== (q.flags ?? 0)) diff('loop.flags', l.flags, q.flags, ((l.flags ?? 0) & ~32) === (q.flags ?? 0) ? 'ODA drops the undefined boundary flag 32' : null);
        if (l.polyline) {
          const qv = q.vertices || [];
          if (qv.length !== l.polyline.vertices.length) diff('loop.vertices.length', l.polyline.vertices.length, qv.length);
          else l.polyline.vertices.forEach((v, k) => { if (!numEq(v.x, qv[k][0]) || !numEq(v.y, qv[k][1]) || !numEq(v.bulge || 0, qv[k][2] || 0)) diff('loop.vertex', [v.x, v.y, v.bulge], qv[k]); });
        } else {
          const qe = q.edges || [];
          if (qe.length !== l.edges.length) diff('loop.edges.length', l.edges.length, qe.length);
          else l.edges.forEach((ed, k) => {
            const x = qe[k];
            if (ed.type === 'line') { if (!ptEq(P(ed.start), x.start) || !ptEq(P(ed.end), x.end)) diff('edge.line', [ed.start, ed.end], [x.start, x.end]); }
            else if (ed.type === 'arc') {
              if (!ptEq(P(ed.center), x.center) || !numEq(ed.radius, x.radius)) diff('edge.arc', [ed.center, ed.radius], [x.center, x.radius]);
              else {
                // ezdxf turns a clockwise edge (73 = 0) into (360 − end, 360 − start); the DXF holds the DWG values
                const sa = ed.ccw ? ed.startAngle * DEG : 360 - ed.endAngle * DEG, ea = ed.ccw ? ed.endAngle * DEG : 360 - ed.startAngle * DEG;
                if (!angEq(sa, x.start_angle) || !angEq(ea, x.end_angle) || !!ed.ccw !== !!x.ccw) diff('edge.arc.angles', [sa, ea, ed.ccw], [x.start_angle, x.end_angle, x.ccw]);
              }
            } else if (ed.type === 'ellipse') {
              if (!ptEq(P(ed.center), x.center) || !ptEq(P(ed.majorAxis), x.major_axis) || !numEq(ed.ratio, x.ratio)) diff('edge.ellipse', [ed.center, ed.majorAxis, ed.ratio], [x.center, x.major_axis, x.ratio]);
              else {
                const sa = ed.ccw ? ed.startAngle * DEG : 360 - ed.endAngle * DEG, ea = ed.ccw ? ed.endAngle * DEG : 360 - ed.startAngle * DEG;
                if (!angEq(sa, x.start_angle) || !angEq(ea, x.end_angle)) diff('edge.ellipse.angles', [sa, ea], [x.start_angle, x.end_angle]);
              }
            } else if (ed.type === 'spline') {
              const kc = x.control_points || [];
              if (kc.length !== ed.control.length || !ed.control.every((p, j) => ptEq(P(p), kc[j]))) diff('edge.spline', ed.control.length, kc.length);
            }
          });
        }
      });
      const os = o.seeds || [];
      if (os.length !== (e.seeds || []).length) diff('seeds.length', (e.seeds || []).length, os.length);
      else e.seeds.forEach((s, i) => { if (!numEq(s.x, os[i][0]) || !numEq(s.y, os[i][1])) diff('seed', s, os[i]); });
      break;
    }
    case 'MULTILEADER': {
      const ml = o.ml, c = e.context;
      if (!ml || !c) break;
      if (ml.text !== null && ml.text !== undefined) {
        if (!c.text || (c.text.label ?? '') !== caret(ml.text)) diff('context.text', c.text && c.text.label, ml.text);
        else if (!ptEq(P(c.text.location), ml.text_insert)) diff('context.text.location', c.text.location, ml.text_insert);
      }
      if (ml.block_insert && (!c.block || !ptEq(P(c.block.location), ml.block_insert))) diff('context.block.location', c.block && c.block.location, ml.block_insert);
      const ours = c.roots.map((r) => r.lines.map((l) => l.points.map((p) => P(p))));
      if (JSON.stringify(ours.map((r) => r.map((l) => l.length))) !== JSON.stringify(ml.leaders.map((r) => r.map((l) => l.length)))) diff('context.leaders', ours.length, ml.leaders.length);
      else ours.forEach((r, i) => r.forEach((l, j) => l.forEach((p, k) => { if (!ptEq(p, ml.leaders[i][j][k])) diff('context.leader.point', p, ml.leaders[i][j][k]); })));
      if (!numEq(c.scale, ml.scale)) diff('context.scale', c.scale, ml.scale, (e.layer || '').includes(' @ ') ? 'annotative decomposition (ODA re-composes the scale)' : null);
      break;
    }
    case 'TEXT': case 'ATTRIB': case 'ATTDEF':
      if ((e.hAlign || e.vAlign) && d.align_point && !ptEq(P(e.align), d.align_point)) diff('align', e.align, d.align_point, e.storedTag ? 'multi-line attribute restored from ACAD_MLATT: ODA recomputes the single-line placement' : null);
      break;
  }
}

// ---------------------------------------------------------------- header, layers, blocks, layouts
function compareModel(model, o) {
  const out = [];
  const H = model.header;
  const byHandle = (list, h) => list.find((x) => x.handle === h);
  const nm = (list, h) => (byHandle(list, h) || {}).name;
  const T = model.tables;
  const hv = {
    INSUNITS: H.INSUNITS, MEASUREMENT: H.MEASUREMENT, EXTMIN: H.EXTMIN, EXTMAX: H.EXTMAX, LIMMIN: H.LIMMIN, LIMMAX: H.LIMMAX,
    CLAYER: nm(T.layers, H.CLAYER), TEXTSTYLE: nm(T.styles, H.TEXTSTYLE), DIMSTYLE: nm(T.dimstyles, H.DIMSTYLE),
    LTSCALE: H.LTSCALE, DIMSCALE: H.DIMSCALE, INSBASE: H.INSBASE, LUNITS: H.LUNITS, LUPREC: H.LUPREC, AUNITS: H.AUNITS,
    CELTSCALE: H.CELTSCALE, PDMODE: H.PDMODE, PDSIZE: H.PDSIZE, TEXTSIZE: H.TEXTSIZE, TDCREATE: H.TDCREATE, TDUPDATE: H.TDUPDATE,
    FINGERPRINTGUID: H.FINGERPRINTGUID, VERSIONGUID: H.VERSIONGUID, DWGCODEPAGE: model.codepage,
  };
  for (const [k, want] of Object.entries(o.header)) {
    if (!(k in hv) || k.startsWith('TD')) continue;   // TDCREATE/TDUPDATE: the converter stamps its own time
    const got = hv[k];
    let same;
    if (Array.isArray(want)) { const g = P(got); same = want.every((x, i) => numEq(x, g[i])); }
    else if (typeof want === 'number') same = typeof got === 'number' && (k.startsWith('TD') ? Math.abs(got - want) < 1e-6 : numEq(got, want));
    else same = String(got ?? '').toUpperCase() === String(want ?? '').toUpperCase();
    if (!same) out.push(`$${k} ours=${JSON.stringify(got)} oda=${JSON.stringify(want)}`);
  }
  // layers
  for (const [h, L] of Object.entries(o.layers)) {
    const l = byHandle(T.layers, h);
    if (!l) { if (!/^defpoints$/i.test(L.name)) out.push('layer ' + h + ' missing'); continue; }   // the converter adds Defpoints
    if (layerExplained(l.name, L.name)) continue;
    if (l.name !== L.name) out.push(`layer ${h} name ${l.name} / ${L.name}`);
    const col = l.color.rgb !== undefined ? null : (l.off ? -1 : 1) * (l.color.index);
    if (L.true_color !== undefined ? l.color.rgb !== L.true_color : col !== (L.color ?? 7)) out.push(`layer ${l.name} color ${JSON.stringify(l.color)}${l.off ? ' off' : ''} / ${L.color} ${L.true_color ?? ''}`);
    if (String(l.linetypeName ?? '').toUpperCase() !== String(L.linetype ?? 'Continuous').toUpperCase()) out.push(`layer ${l.name} linetype ${l.linetypeName} / ${L.linetype}`);
    if ((l.lineweight ?? -3) !== (L.lineweight ?? -3)) out.push(`layer ${l.name} lineweight ${l.lineweight} / ${L.lineweight}`);
    if (!!l.plot !== !!(L.plot ?? 1)) out.push(`layer ${l.name} plot ${l.plot} / ${L.plot}`);
    if (((l.flags ?? 0) & 7) !== ((L.flags ?? 0) & 7)) out.push(`layer ${l.name} flags ${l.flags} / ${L.flags}`);
  }
  // blocks: name and entity order
  for (const [rec, B] of Object.entries(o.blocks)) {
    const b = model.blocks.find((x) => x.record === rec);
    if (!b) { out.push('block ' + B.name + ' missing'); continue; }
    const tn = model.tables.blockRecords.find((r) => r.handle === rec)?.xdata?.AcDbDynamicBlockTrueName?.[0]?.[1];
    if (b.name.toUpperCase() !== B.name.toUpperCase() && !(/^\*Paper_Space/i.test(b.name) && /^\*Paper_Space/i.test(B.name))
      && !(tn && tn.toUpperCase() === B.name.toUpperCase()) && !(B.name.startsWith('$TD_AUDIT_GENERATED'))) out.push(`block ${rec} name ${b.name} / ${B.name}`);
    const ours = b.entities.map((e) => e.handle).join(','), theirs = B.entities.join(',');
    if (ours !== theirs) {
      const a = new Set(b.entities.map((e) => e.handle)), z = new Set(B.entities);
      const sameSet = a.size === z.size && [...a].every((x) => z.has(x));
      out.push(`block ${B.name} entities ${sameSet ? 'same set, other order' : b.entities.length + ' / ' + B.entities.length}`);
    }
  }
  // layouts
  for (const [h, L] of Object.entries(o.layouts)) {
    const l = model.layouts.find((x) => x.handle === h);
    if (!l) { out.push('layout ' + h + ' missing'); continue; }
    if (l.name !== L.name) out.push(`layout ${h} name ${l.name} / ${L.name}`);
    if ((l.tabOrder ?? 0) !== (L.taborder ?? 0)) out.push(`layout ${l.name} tab ${l.tabOrder} / ${L.taborder}`);
    if (L.block_record_handle && l.block !== L.block_record_handle) out.push(`layout ${l.name} block ${l.block} / ${L.block_record_handle}`);
    if (L.limmax && !ptEq(P(l.limits.max), L.limmax)) out.push(`layout ${l.name} limmax`);
    if (L.extmax && !ptEq(P(l.extents.max), L.extmax)) out.push(`layout ${l.name} extmax ${JSON.stringify(l.extents.max)} / ${L.extmax}`);
    if (L.paper_width !== undefined && !numEq(l.paper.w, L.paper_width)) out.push(`layout ${l.name} paper width ${l.paper.w} / ${L.paper_width}`);
  }
  return out;
}

// ---------------------------------------------------------------- run
const summary = [];
let totalMatched = 0, totalOk = 0, totalExpl = 0, totalDiffer = 0, totalOda = 0, totalMissing = 0, totalExtra = 0, crashes = 0;
const explainedTotals = {};
let totalModelDiffs = 0;
const COMMON = new Set(['LINE', 'ARC', 'CIRCLE', 'LWPOLYLINE', 'POLYLINE', 'TEXT', 'MTEXT', 'INSERT', 'ATTRIB', 'DIMENSION', 'HATCH', 'SPLINE', 'ELLIPSE', 'SOLID', 'POINT', 'VIEWPORT']);
for (const file of files) {
  const rel = path.relative(TF, file);
  let model;
  const t0 = performance.now();
  try { model = readDwg(new Uint8Array(fs.readFileSync(file))); }
  catch (e) { crashes++; console.log('CRASH', rel, e.stack); summary.push({ file: rel, crash: e.message }); continue; }
  const ms = performance.now() - t0;
  if (model.report.error) { console.log(rel, '—', model.report.error); summary.push({ file: rel, error: model.report.error }); continue; }
  const o = oracle(file);
  if (!o) { console.log(rel, model.version, 'no oracle (ODA could not convert it)'); summary.push({ file: rel, version: model.version, noOracle: true }); continue; }
  const ours = new Map();
  for (const b of model.blocks) for (const e of b.entities) {
    ours.set(e.handle, e);
    for (const a of e.attribs || []) ours.set(a.handle, a);
  }
  const byType = {};
  let matched = 0, okAll = 0, explAll = 0, missing = 0, extra = 0;
  layerInfo = new Map(model.tables.layers.map((l) => [l.name, l]));
  const trueName = new Map();
  for (const r of model.tables.blockRecords) { const t = r.xdata && r.xdata.AcDbDynamicBlockTrueName; if (t && t[0]) trueName.set(r.name, t[0][1]); }
  const missingTypes = {}, extraTypes = {};
  for (const [h, oe] of Object.entries(o.entities)) {
    const e = ours.get(h);
    if (!e) { missing++; missingTypes[oe.type] = (missingTypes[oe.type] || 0) + 1; continue; }
    matched++;
    const t = oe.type;
    if (onlyType && t !== onlyType) continue;
    if (e.block && trueName.has(e.block)) e._trueName = trueName.get(e.block);
    const bt = byType[t] || (byType[t] = { n: 0, ok: 0, explained: {}, nExpl: 0, fields: {} });
    bt.n++;
    let bad = false, expl = false;
    const diff = (k, a, b, why) => {
      if (why) {
        expl = true;
        const x = bt.explained[why] || (bt.explained[why] = { n: 0, ex: [] });
        x.n++;
        if (x.ex.length < 2) x.ex.push({ h, k, ours: a, oda: b });
        return;
      }
      bad = true;
      const f = bt.fields[k] || (bt.fields[k] = { n: 0, ex: [] });
      f.n++;
      if (f.ex.length < 3) f.ex.push({ h, ours: a, oda: b });
    };
    if (OUR_DXF_TYPE(e) !== t) diff('type', e.type + ':' + (e.dxfName || ''), t, e.type === 'UNKNOWN' && t === 'ACAD_PROXY_ENTITY' ? 'custom entity without its application: ODA writes it as a proxy' : null);
    else {
      cmpCommon(e, oe, diff);
      if (fieldChecks[t]) cmpFields(e, oe, fieldChecks[t], diff);
      cmpSpecial(e, oe, diff);
    }
    if (!bad && !expl) { bt.ok++; okAll++; }
    else if (!bad) { bt.nExpl++; explAll++; }
  }
  for (const [h, e] of ours) if (!o.entities[h]) { extra++; extraTypes[OUR_DXF_TYPE(e)] = (extraTypes[OUR_DXF_TYPE(e)] || 0) + 1; }
  const modelDiffs = compareModel(model, o);
  const n = Object.keys(o.entities).length;
  totalOda += n; totalMatched += matched; totalOk += okAll; totalExpl += explAll; totalMissing += missing; totalExtra += extra;
  const differ = matched - okAll - explAll;
  totalDiffer += differ;
  console.log(`${rel}  ${model.version}  ${ms.toFixed(0)}ms  ODA ${n}  ours ${ours.size}  matched ${matched}  identical ${okAll}  explained ${explAll}  differ ${differ}  missing ${missing}  extra ${extra}` + (o.odaErr ? '  (ODA .err)' : ''));
  if (modelDiffs.length) console.log('    model (header/layers/blocks/layouts):', modelDiffs.length, 'differences:', modelDiffs.slice(0, 6).join(' | ').slice(0, 900));
  totalModelDiffs += modelDiffs.length;
  if (missing) console.log('    missing:', JSON.stringify(missingTypes));
  if (extra) console.log('    extra:', JSON.stringify(extraTypes));
  for (const [t, v] of Object.entries(byType).sort()) {
    for (const [why, x] of Object.entries(v.explained)) explainedTotals[t + ': ' + why] = (explainedTotals[t + ': ' + why] || 0) + x.n;
    if (v.ok + v.nExpl === v.n && !verbose) continue;
    console.log(`    ${t.padEnd(14)} ${v.ok}/${v.n} identical, ${v.nExpl} explained` + (COMMON.has(t) ? '' : ' (not a common type)'));
    for (const [k, f] of Object.entries(v.fields)) console.log(`        ${k}: ${f.n}  e.g. ${f.ex.map((x) => x.h + ' ours=' + JSON.stringify(x.ours) + ' oda=' + JSON.stringify(x.oda)).join(' | ').slice(0, 600)}`);
    if (verbose) for (const [why, x] of Object.entries(v.explained)) console.log(`        (explained) ${why}: ${x.n}  e.g. ${JSON.stringify(x.ex).slice(0, 300)}`);
  }
  summary.push({ file: rel, version: model.version, ms: Math.round(ms), oda: n, ours: ours.size, matched, identical: okAll, missing, extra, byType, notes: model.report.notes });
}
console.log('\nExplained differences (ODA conventions, not reader errors):');
for (const [k, n] of Object.entries(explainedTotals).sort()) console.log('   ', n, k);
console.log(`header/layer/block/layout differences: ${totalModelDiffs}`);
console.log(`\nTOTAL files ${files.length}  crashes ${crashes}  ODA entities ${totalOda}  matched by handle ${totalMatched}  identical ${totalOk}  explained ${totalExpl}  differ ${totalDiffer}  missing ${totalMissing}  extra ${totalExtra}`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(summary, null, 1));
