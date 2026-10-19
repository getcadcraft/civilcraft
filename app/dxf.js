/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dxf.js — R12 (AC1009) ASCII DXF of the plan linework: contours, alignments, labels, points.
 * Adapted from CadCraft's writer (its own copy; an app never imports another app's folder). No DOM.
 *
 *   writeDxf({ units, layers: [{name, color}], entities }) → { text, report }
 *   entities: { type:'poly', layer, pts:[{x,y}], closed, elev }      2D POLYLINE at an elevation (contours)
 *             { type:'poly3d', layer, pts:[{x,y,z}], closed }       3D POLYLINE (breaklines, daylight lines)
 *                 + xdata { APP: [[code, value]…] } (0.6 WL.24: CivilCraft's feature lines; codes 1000 text, 1040 numbers)
 *             { type:'line', layer, a:{x,y}, b:{x,y} }
 *             { type:'arc', layer, c:{x,y}, r, a0, a1 }             counter-clockwise, radians
 *             { type:'text', layer, x, y, h, rot, text, align:'left'|'center'|'right' }
 *             { type:'point', layer, x, y, z }
 * R12 wants layer names of A–Z 0–9 $ _ - up to 31 characters; others are changed and counted.
 */

import { t } from "./i18n.js";

const ACI = { red: 1, yellow: 2, green: 3, cyan: 4, blue: 5, magenta: 6, white: 7, gray: 8, orange: 30, brown: 34 };

export function writeDxf({ units = 'ft', layers = [], entities = [] }) {
  const report = { notes: [], counts: {} };
  const lines = [];
  const w = (code, v) => { lines.push(String(code).padStart(3, ' ')); lines.push(String(v)); };
  const f = (n) => (Math.abs(n) < 1e-12 ? '0.0' : Number(n.toPrecision(15)).toString());
  const used = new Map();
  let renamed = 0;
  const lname = (n) => {
    if (used.has(n)) return used.get(n);
    let r = String(n).toUpperCase().replace(/[^A-Z0-9$_-]/g, '_').slice(0, 31) || 'UNNAMED';
    if (r !== n) renamed++;
    used.set(n, r);
    return r;
  };
  const layerList = new Map();
  for (const l of layers) layerList.set(lname(l.name), typeof l.color === 'number' ? l.color : ACI[l.color] || 7);
  for (const e of entities) { const n = lname(e.layer || '0'); if (!layerList.has(n)) layerList.set(n, 7); }
  if (!layerList.has('0')) layerList.set('0', 7);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const grow = (x, y) => { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; };
  for (const e of entities) {
    if (e.pts) for (const p of e.pts) grow(p.x, p.y);
    else if (e.type === 'line') { grow(e.a.x, e.a.y); grow(e.b.x, e.b.y); }
    else if (e.type === 'arc') { grow(e.c.x - e.r, e.c.y - e.r); grow(e.c.x + e.r, e.c.y + e.r); }
    else if (Number.isFinite(e.x)) grow(e.x, e.y);
  }
  if (!Number.isFinite(minX)) { minX = minY = 0; maxX = maxY = 1; }

  w(0, 'SECTION'); w(2, 'HEADER');
  w(9, '$ACADVER'); w(1, 'AC1009');
  w(9, '$DWGCODEPAGE'); w(3, 'ANSI_1252');
  w(9, '$INSBASE'); w(10, '0.0'); w(20, '0.0'); w(30, '0.0');
  w(9, '$EXTMIN'); w(10, f(minX)); w(20, f(minY)); w(30, '0.0');
  w(9, '$EXTMAX'); w(10, f(maxX)); w(20, f(maxY)); w(30, '0.0');
  w(9, '$LUNITS'); w(70, 2);
  w(9, '$MEASUREMENT'); w(70, units === 'm' ? 1 : 0);
  w(0, 'ENDSEC');

  w(0, 'SECTION'); w(2, 'TABLES');
  w(0, 'TABLE'); w(2, 'LTYPE'); w(70, 1);
  w(0, 'LTYPE'); w(2, 'CONTINUOUS'); w(70, 0); w(3, 'Solid line'); w(72, 65); w(73, 0); w(40, '0.0');   // i18n-ignore: DXF line type description (file content)
  w(0, 'ENDTAB');
  w(0, 'TABLE'); w(2, 'LAYER'); w(70, layerList.size);
  for (const [n, c] of layerList) { w(0, 'LAYER'); w(2, n); w(70, 0); w(62, c); w(6, 'CONTINUOUS'); }
  w(0, 'ENDTAB');
  // 0.6 WL.24: every application named in extended data needs its APPID (ACAD is always there)
  const apps = [...new Set(entities.flatMap((e) => Object.keys(e.xdata || {})))].filter((a) => /^[A-Z0-9_$-]{1,31}$/.test(a));
  w(0, 'TABLE'); w(2, 'APPID'); w(70, apps.length + 1);
  for (const a of ['ACAD', ...apps.filter((x) => x !== 'ACAD')]) { w(0, 'APPID'); w(2, a); w(70, 0); }
  w(0, 'ENDTAB');
  w(0, 'TABLE'); w(2, 'STYLE'); w(70, 1);
  w(0, 'STYLE'); w(2, 'STANDARD'); w(70, 0); w(40, '0.0'); w(41, '1.0'); w(50, '0.0'); w(71, 0); w(42, '2.5'); w(3, 'txt'); w(4, '');
  w(0, 'ENDTAB');
  w(0, 'ENDSEC');

  w(0, 'SECTION'); w(2, 'BLOCKS'); w(0, 'ENDSEC');

  w(0, 'SECTION'); w(2, 'ENTITIES');
  const count = (k) => { report.counts[k] = (report.counts[k] || 0) + 1; };
  for (const e of entities) {
    const L = lname(e.layer || '0');
    switch (e.type) {
      case 'poly': case 'poly3d': {
        const pts = e.pts;
        if (pts.length < 2) break;
        const three = e.type === 'poly3d';
        w(0, 'POLYLINE'); w(8, L); w(66, 1); w(10, '0.0'); w(20, '0.0'); w(30, three ? '0.0' : f(e.elev || 0)); w(70, (e.closed ? 1 : 0) | (three ? 8 : 0));
        for (const [app, items] of Object.entries(e.xdata || {})) {   // 0.6 WL.24
          if (!apps.includes(app) || !Array.isArray(items)) continue;
          w(1001, app);
          for (const [c, v] of items) { if (c === 1000) w(1000, encodeText(String(v)).slice(0, 255)); else if (c >= 1040 && c <= 1042 && Number.isFinite(v)) w(c, f(v)); else if (c === 1070 || c === 1071) w(c, v | 0); }
        }
        for (const p of pts) { w(0, 'VERTEX'); w(8, L); w(10, f(p.x)); w(20, f(p.y)); w(30, three ? f(p.z || 0) : f(e.elev || 0)); if (three) w(70, 32); }
        w(0, 'SEQEND'); w(8, L);
        count(e.type); break;
      }
      case 'line': w(0, 'LINE'); w(8, L); w(10, f(e.a.x)); w(20, f(e.a.y)); w(30, '0.0'); w(11, f(e.b.x)); w(21, f(e.b.y)); w(31, '0.0'); count('line'); break;
      case 'arc': w(0, 'ARC'); w(8, L); w(10, f(e.c.x)); w(20, f(e.c.y)); w(30, '0.0'); w(40, f(e.r)); w(50, f(deg(e.a0))); w(51, f(deg(e.a1))); count('arc'); break;
      case 'point': w(0, 'POINT'); w(8, L); w(10, f(e.x)); w(20, f(e.y)); w(30, f(e.z || 0)); count('point'); break;
      case 'text': {
        const ha = e.align === 'center' ? 1 : e.align === 'right' ? 2 : 0;
        w(0, 'TEXT'); w(8, L); w(10, f(e.x)); w(20, f(e.y)); w(30, '0.0'); w(40, f(e.h)); w(1, encodeText(e.text)); if (e.rot) w(50, f(deg(e.rot)));
        if (ha) { w(72, ha); w(11, f(e.x)); w(21, f(e.y)); w(31, '0.0'); }
        count('text'); break;
      }
      default: break;
    }
  }
  w(0, 'ENDSEC');
  w(0, 'EOF');
  if (renamed) report.notes.push(t('dxf.renamed', { n: renamed }));
  return { text: lines.join('\r\n') + '\r\n', report };
}

const deg = (a) => { let d = a * 180 / Math.PI; d %= 360; if (d < 0) d += 360; return d; };
/** Plain text → R12 DXF text: non-ASCII as \U+XXXX, ° ± as %% codes. */
function encodeText(s) {
  return String(s).replace(/°/g, '%%d').replace(/±/g, '%%p').replace(/[\r\n]+/g, ' ')
    .replace(/[^\x20-\x7e]/g, (ch) => '\\U+' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'));
}
