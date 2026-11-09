/* SPDX-License-Identifier: Apache-2.0 */
/**
 * usd.js — a run as an animated USD text file (0.9 TW.7): the equipment as meshes by colour, UsdPreviewSurface materials, and each load and vehicle as an Xform with time-sampled matrices.
 * Metres, Z up. The way into any program that reads USD. DOM-free.
 *
 *   usdaOf({ parts, tracks, name, fps }) → text
 */
import { COLORS, meshOf, loadSize, loadColor } from './equipment.js';

const num = (x) => { const r = +Number(x).toFixed(5); return Object.is(r, -0) ? '0' : String(r); };
const ident = (s) => { const t = String(s).replace(/[^A-Za-z0-9_]/g, '_'); return /^[A-Za-z_]/.test(t) ? t : '_' + t; };
const rgb = (hex) => { const v = parseInt(hex.slice(1), 16), lin = (c) => { const x = c / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return `(${num(lin(v >> 16))}, ${num(lin((v >> 8) & 255))}, ${num(lin(v & 255))})`; };
const METAL = new Set(['steel', 'steelDark', 'roller', 'leg', 'chute']);

function material(name, hex, metal) {
  return `    def Material "${name}"
    {
        token outputs:surface.connect = </World/Looks/${name}/S.outputs:surface>
        def Shader "S"
        {
            uniform token info:id = "UsdPreviewSurface"
            color3f inputs:diffuseColor = ${rgb(hex)}
            float inputs:metallic = ${metal ? 0.7 : 0}
            float inputs:roughness = ${metal ? 0.45 : 0.6}
            token outputs:surface
        }
    }
`;
}
function meshPrim(ind, name, meshes, mat) {
  const pts = [], counts = [], idx = [];
  for (const m of meshes) {
    const base = pts.length / 3;
    for (const v of m.positions) pts.push(v);
    for (const q of m.quads) { counts.push(4); for (const i of q) idx.push(base + i); }
    for (const c of m.caps) { counts.push(c.length); for (const i of c) idx.push(base + i); }
  }
  const p3 = [];
  for (let i = 0; i < pts.length; i += 3) p3.push(`(${num(pts[i])}, ${num(pts[i + 1])}, ${num(pts[i + 2])})`);
  return `${ind}def Mesh "${name}" (
${ind}    prepend apiSchemas = ["MaterialBindingAPI"]
${ind})
${ind}{
${ind}    uniform token subdivisionScheme = "none"
${ind}    uniform bool doubleSided = 0
${ind}    int[] faceVertexCounts = [${counts.join(', ')}]
${ind}    int[] faceVertexIndices = [${idx.join(', ')}]
${ind}    point3f[] points = [${p3.join(', ')}]
${ind}    rel material:binding = </World/Looks/${mat}>
${ind}}
`;
}
const mat4 = (m) => `( (${num(m[0])}, ${num(m[1])}, ${num(m[2])}, ${num(m[3])}), (${num(m[4])}, ${num(m[5])}, ${num(m[6])}, ${num(m[7])}), (${num(m[8])}, ${num(m[9])}, ${num(m[10])}, ${num(m[11])}), (${num(m[12])}, ${num(m[13])}, ${num(m[14])}, ${num(m[15])}) )`;
const HIDE = -50;
function samples(x, fps, m16) {
  const rows = [], k0 = x.keys[0], kN = x.keys[x.keys.length - 1], f = (t) => num(t * fps);
  // a load that is not in the scene yet, or has left, is held under the floor; the jump takes one frame
  if (k0.t > 0) { rows.push([0, m16([k0.p[0], k0.p[1], HIDE], k0.h)]); if (k0.t > 1 / fps) rows.push([k0.t - 1 / fps, m16([k0.p[0], k0.p[1], HIDE], k0.h)]); }
  for (const k of x.keys) rows.push([k.t, m16(k.p, k.h)]);
  rows.push([kN.t + 1 / fps, m16([kN.p[0], kN.p[1], HIDE], kN.h)]);
  return rows.map(([t, m]) => `                ${f(t)}: ${mat4(m)},`).join('\n');
}
function mover(name, x, fps, m16, bodyText) {
  return `        def Xform "${name}"
        {
            uniform token[] xformOpOrder = ["xformOp:transform"]
            matrix4d xformOp:transform.timeSamples = {
${samples(x, fps, m16)}
            }
${bodyText}        }
`;
}

export function usdaOf({ parts, tracks, name = 'CadCraft run', fps = 30 }) {
  const byCol = new Map();
  for (const p of parts) { const k = p.col; if (!byCol.has(k)) byCol.set(k, []); byCol.get(k).push(meshOf(p)); }
  const unit = (l, w, h) => meshOf({ c: [0, 0, 0], s: [l, w, h], yaw: 0, pitch: 0, shape: 'box' });
  const loadCols = new Map();
  for (const l of tracks.loads) loadCols.set(loadColor(l.type), 'Load_' + loadColor(l.type).slice(1));
  let looks = '';
  for (const k of byCol.keys()) looks += material(ident(k), COLORS[k] || '#888888', METAL.has(k));
  for (const [hex, nm] of loadCols) looks += material(nm, hex, false);
  if (tracks.vehicles.length) looks += material('Vehicle', COLORS.vehicle, false);
  let equip = '';
  for (const [k, ms] of byCol) equip += meshPrim('        ', ident(k), ms, ident(k));
  let movers = '';
  for (const l of tracks.loads) {
    const s = loadSize(l.L);
    movers += mover('Load_' + String(l.id).replace(/[^A-Za-z0-9_]/g, '_'), l, fps, m16Of, meshPrim('            ', 'Box', [unit(s.l, s.w, s.h)], loadCols.get(loadColor(l.type))));
  }
  for (const v of tracks.vehicles) movers += mover('Vehicle_' + v.n, v, fps, m16Of, meshPrim('            ', 'Body', [{ ...unit(1.0, 0.7, 0.25), positions: unit(1.0, 0.7, 0.25).positions.map((x, i) => (i % 3 === 2 ? x + 0.125 : x)) }], 'Vehicle'));
  const end = Math.ceil(tracks.length * fps) + 1;
  return `#usda 1.0
(
    doc = "${String(name).replace(/["\\]/g, '')} : a run of the Digital twin add-on, written by CadCraft. Sizes are for the picture."
    defaultPrim = "World"
    metersPerUnit = 1
    upAxis = "Z"
    startTimeCode = 0
    endTimeCode = ${end}
    timeCodesPerSecond = ${fps}
    framesPerSecond = ${fps}
)

def Xform "World"
{
    def Scope "Looks"
    {
${looks.replace(/^ {4}/gm, '        ').replace(/^ {8}(?=def Material)/gm, '        ')}    }
    def Scope "Equipment"
    {
${equip}    }
    def Scope "Moving"
    {
${movers}    }
}
`;
}
function m16Of(p, h) { const r = (h * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, p[0], p[1], p[2], 1]; }
