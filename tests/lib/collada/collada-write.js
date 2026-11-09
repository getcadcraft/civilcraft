/* SPDX-License-Identifier: Apache-2.0 */
/**
 * collada-write.js — cc-collada: the Collada 1.4.1 writer every app shares (0.9 SU.1125, session `bim-dae-09`). DOM-free, no
 * dependency, no words. Canonical here (lib/collada); `node tools/collada/sync.mjs` copies it byte for byte, flat, as
 * collada-write.js into modelcraft/dev (io.js exportDAE, and through the m3d kernel copy into CadCraft) and bimcraft/dev
 * (dae-bim.js). Each host keeps a thin adapter that walks its own model and hands this file plain data.
 *
 * The writer makes the XML text only; what goes in comes from the adapter:
 *   xmlText(s)  fx(x)  ncName(s)  rowMajor(m)                        escaping, numbers (12 significant digits), NCName names, matrices
 *   nameExtra(name, more = '')                                       a node's exact name for ModelCraft's reader (+ more <technique>s)
 *   geometryXml({ id, name, pos, nrm, sets, lines, num })            one <geometry>: positions, normals, a primitive per set, loose lines
 *       sets [{ material: 'mat-0' | null, vcount: [n…] | null, p: [v, n, v, n, …] }]   vcount → <polylist>, null → <triangles>
 *   instanceGeometryXml(gid, materials)                              <instance_geometry> with its <bind_material> ('mat-0', …)
 *   nodeXml({ id, name, matrix, body, extra })                       a <node> (matrix column-major, null = none)
 *   effectsXml(effects) / materialsXml(materials)                    lambert effects ({ id, rgb: [0..1 ×3], alpha }) and materials ({ id, name, effect })
 *   geoExtraXml(geo)                                                 the root <extra> with where the model is on the earth
 *   documentXml({ tool, date, effects, materials, geometries, libraryNodes, scene, extra })   the whole file (Z up, metres)
 *   kmlModel({ name, href, lon, lat, alt, altitudeMode, heading })   Google Earth's doc.kml for a .kmz (KML 2.2 <Model>)
 *
 * Geolocation: Collada 1.4.1 has no place for it (1.5's <coverage> came later), so the .dae carries it in a root <extra>
 * (technique profile "CadCraft", the 1.5 element names) that every reader may skip; Google Earth places a model from the
 * KML <Model> of a .kmz (kmlModel), which is what the hosts write when asked for Google Earth.
 */

export const xmlText = (s) => String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fx = (x) => { let v = +(+x).toPrecision(12); if (Object.is(v, -0) || Math.abs(v) < 1e-12) v = 0; return String(v); };
/** Collada 1.4.1 `name` attributes are NCNames: no spaces or punctuation, no leading digit. */
export const ncName = (s) => {
  let t = String(s || '').replace(/[^\p{L}\p{N}._-]+/gu, '_');
  if (!/^[\p{L}_]/u.test(t)) t = '_' + t;
  return t;
};
/** The exact name, kept for ModelCraft in a node's <extra> (other readers use the NCName); `more` = further <technique>s. */
export const nameExtra = (s, more = '') => `<extra><technique profile="ModelCraft"><name>${xmlText(s)}</name></technique>${more}</extra>`;
/** A column-major 4×4 matrix as Collada's row-major text. */
export const rowMajor = (m) => [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => fx(m[c * 4 + r])).join(' ')).join(' ');

/** A float <source> of xyz triples with its accessor. */
export function sourceXml(sid, arr, num = fx) {
  return `<source id="${sid}"><float_array id="${sid}-array" count="${arr.length}">${Array.prototype.map.call(arr, num).join(' ')}</float_array>` +
    `<technique_common><accessor source="#${sid}-array" count="${arr.length / 3}" stride="3"><param name="X" type="float"/><param name="Y" type="float"/><param name="Z" type="float"/></accessor></technique_common></source>`;
}

/**
 * One <geometry>. Every primitive reads VERTEX at offset 0 and NORMAL at offset 1, so `p` holds (vertex, normal) index pairs.
 * A set with `vcount` is a <polylist> (polygons of any size), without it a <triangles>. `lines` = vertex index pairs of loose edges.
 */
export function geometryXml({ id, name, pos, nrm = [], sets = [], lines = [], num = fx }) {
  const parts = [sourceXml(id + '-pos', pos, num)];
  if (nrm.length) parts.push(sourceXml(id + '-nrm', nrm, num));
  parts.push(`<vertices id="${id}-vtx"><input semantic="POSITION" source="#${id}-pos"/></vertices>`);
  const inputs = `<input semantic="VERTEX" source="#${id}-vtx" offset="0"/><input semantic="NORMAL" source="#${id}-nrm" offset="1"/>`;
  for (const set of sets) {
    const mat = set.material ? ` material="${set.material}"` : '';
    if (set.vcount) parts.push(`<polylist count="${set.vcount.length}"${mat}>${inputs}<vcount>${set.vcount.join(' ')}</vcount><p>${set.p.join(' ')}</p></polylist>`);
    else parts.push(`<triangles count="${set.p.length / 6}"${mat}>${inputs}<p>${set.p.join(' ')}</p></triangles>`);
  }
  if (lines.length) parts.push(`<lines count="${lines.length / 2}"><input semantic="VERTEX" source="#${id}-vtx" offset="0"/><p>${lines.join(' ')}</p></lines>`);
  return `<geometry id="${id}" name="${xmlText(ncName(name))}"><mesh>${parts.join('')}</mesh></geometry>`;
}

/** <instance_geometry> binding each material symbol to the material of the same id. */
export function instanceGeometryXml(gid, materials = []) {
  const bind = materials.length ? '<bind_material><technique_common>' + materials.map((m) => `<instance_material symbol="${m}" target="#${m}"/>`).join('') + '</technique_common></bind_material>' : '';
  return `<instance_geometry url="#${gid}">${bind}</instance_geometry>`;
}

/** A <node>: its matrix (column-major; null = none), then its content, then its <extra>. */
export function nodeXml({ id, name, matrix = null, body = '', extra = '' }) {
  return `<node id="${id}" name="${xmlText(ncName(name))}" type="NODE">` + (matrix ? `<matrix sid="transform">${rowMajor(matrix)}</matrix>` : '') + body + extra + '</node>';
}

/** <library_effects>: one lambert per entry, diffuse = rgb (sRGB 0..1); alpha < 1 adds transparent / transparency (A_ONE). */
export function effectsXml(effects) {
  return '<library_effects>' + effects.map((e) => {
    const a = e.alpha ?? 1;
    const see = a < 1 ? `<transparent opaque="A_ONE"><color>1 1 1 ${fx(a)}</color></transparent><transparency><float>1</float></transparency>` : '';
    return `<effect id="${e.id}"><profile_COMMON><technique sid="common"><lambert><diffuse><color sid="diffuse">${e.rgb.map(fx).join(' ')} 1</color></diffuse>${see}</lambert></technique></profile_COMMON></effect>`;
  }).join('') + '</library_effects>';
}

/** <library_materials>: { id, name, effect } each. */
export function materialsXml(materials) {
  return '<library_materials>' + materials.map((m) => `<material id="${m.id}" name="${xmlText(m.name)}"><instance_effect url="#${m.effect}"/></material>`).join('') + '</library_materials>';
}

const ALT_MODES = new Set(['relativeToGround', 'absolute', 'clampToGround']);
/**
 * Where the model's origin is on the earth (WGS 84), for the root <extra>: { lon, lat, alt (m), altitudeMode, heading (degrees
 * clockwise from north to the model's +Y), crs (the system it was worked out in, text) }. '' when geo is null.
 */
export function geoExtraXml(geo) {
  if (!geo || !Number.isFinite(geo.lon) || !Number.isFinite(geo.lat)) return '';
  const mode = ALT_MODES.has(geo.altitudeMode) ? geo.altitudeMode : 'relativeToGround';
  return '<extra><technique profile="CadCraft"><geographic_location>' +
    `<longitude>${fx(geo.lon)}</longitude><latitude>${fx(geo.lat)}</latitude><altitude mode="${mode}">${fx(geo.alt || 0)}</altitude>` +
    `<heading>${fx(geo.heading || 0)}</heading>` + (geo.crs ? `<crs>${xmlText(geo.crs)}</crs>` : '') +
    '</geographic_location></technique></extra>';
}

/** The whole file: Collada 1.4.1, Z up, metres. `scene` = the <visual_scene> text (id "scene"). */
export function documentXml({ tool, date = new Date(), effects = [], materials = [], geometries = [], libraryNodes = [], scene, extra = '' }) {
  const iso = date.toISOString().replace(/\.\d+Z$/, 'Z');
  const out = ['<?xml version="1.0" encoding="utf-8"?>',
    '<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">',
    `<asset><contributor><authoring_tool>${xmlText(tool)}</authoring_tool></contributor><created>${iso}</created><modified>${iso}</modified><unit name="meter" meter="1"/><up_axis>Z_UP</up_axis></asset>`];
  if (effects.length) out.push(effectsXml(effects), materialsXml(materials));
  if (geometries.length) out.push('<library_geometries>' + geometries.join('\n') + '</library_geometries>');
  if (libraryNodes.length) out.push('<library_nodes>' + libraryNodes.join('\n') + '</library_nodes>');
  out.push('<library_visual_scenes>' + scene + '</library_visual_scenes>');
  out.push('<scene><instance_visual_scene url="#scene"/></scene>');
  if (extra) out.push(extra);
  out.push('</COLLADA>', '');
  return out.join('\n');
}

/** Google Earth's doc.kml for a .kmz holding the model at `href` (KML 2.2; heading clockwise from north, degrees). */
export function kmlModel({ name, href, lon, lat, alt = 0, altitudeMode = 'relativeToGround', heading = 0 }) {
  const mode = ALT_MODES.has(altitudeMode) ? altitudeMode : 'relativeToGround';
  const h = ((heading % 360) + 360) % 360;
  return ['<?xml version="1.0" encoding="UTF-8"?>',
    '<kml xmlns="http://www.opengis.net/kml/2.2">',
    `<Placemark><name>${xmlText(name)}</name>`,
    `<LookAt><longitude>${fx(lon)}</longitude><latitude>${fx(lat)}</latitude><altitude>0</altitude><heading>${fx(h)}</heading><tilt>60</tilt><range>150</range><altitudeMode>relativeToGround</altitudeMode></LookAt>`,
    `<Model><altitudeMode>${mode}</altitudeMode><Location><longitude>${fx(lon)}</longitude><latitude>${fx(lat)}</latitude><altitude>${fx(alt)}</altitude></Location>`,
    `<Orientation><heading>${fx(h)}</heading><tilt>0</tilt><roll>0</roll></Orientation><Scale><x>1</x><y>1</y><z>1</z></Scale>`,
    `<Link><href>${xmlText(href)}</href></Link></Model></Placemark>`,
    '</kml>', ''].join('\n');
}
