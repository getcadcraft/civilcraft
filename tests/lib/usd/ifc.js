/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc.js — the IFC side of docs/USD-CONVENTIONS.md (§§ 2, 3, 5): which discipline group an IFC class goes in, how a
 * property becomes an `ifc:pset:` attribute, and IFC measures in SI. DOM-free, import-free but for sdf.js names.
 *
 *   disciplineOf(ifcClass, predefinedType) → 'Architecture' | 'Structure' | 'MEP' | 'Furnishing' | 'Site' | 'Spaces' | 'Other'
 *   propertyAttr('ifc:pset', set, name) → { attr, real: name | null }     (real = the name when it isn't an identifier)
 *   siValue(measureType, value, lengthToMetre) → { value, unit } | null   (lengths, areas, volumes → m, m², m³)
 *   writeIfcElement(builder, prim, element)                                writes § 5.1's attributes and § 5.2's properties
 *     element = { cls, guid, name, description, objectType, tag, predefined, storeyGuid, type: {guid, name, cls},
 *                 materials: [names], sets: [{ name, quantities: bool, props: [{ name, type (IFC measure name), value }] }],
 *                 lengthToMetre, groups: [names] }
 */
import { V, identifier } from './sdf.js';

const MEP = /^Ifc(Distribution|Flow|Energy|Duct|Pipe|Cable|Air|Valve|Pump|Fan|Boiler|Chiller|Coil|Compressor|Condenser|Cooling|Damper|Electric|Evaporat|Filter|Fire|Heat|Humidifier|Interceptor|Lamp|Light|Motor|Outlet|Protective|Sanitary|Sensor|Actuator|Alarm|Controller|Flow|Junction|Medical|Solar|Space(Heater)|Stack|Switching|Tank|Transformer|TubeBundle|Unitary|Waste|AudioVisual|Communications|Burner|Chimney)/;
const STRUCT = /^Ifc(Beam|Column|Footing|Pile|ReinforcingBar|ReinforcingMesh|ReinforcingElement|Tendon|TendonAnchor|TendonConduit|Bearing|StructuralMember|MechanicalFastener|Fastener)/;
const ARCH = /^Ifc(Wall|CurtainWall|Door|Window|Roof|Slab|Stair|StairFlight|Ramp|RampFlight|Railing|Covering|Plate|Member|BuildingElementProxy|ShadingDevice|Chimney|BuildingElementPart)/;
const SITE = /^Ifc(GeographicElement|CivilElement|EarthworksElement|EarthworksFill|EarthworksCut|Course|Pavement|Kerb|Site|SurfaceFeature|Road|Bridge|Railway|Alignment)/;
const STRUCT_MEMBER_TYPES = new Set(['BRACE', 'CHORD', 'COLLAR', 'MEMBER', 'MULLION', 'PLATE', 'POST', 'PURLIN', 'RAFTER', 'STRINGER', 'STRUT', 'STUD']);

export function disciplineOf(cls, predefined = null) {
  const c = String(cls || '');
  if (/^Ifc(Space|SpatialZone)$/i.test(c)) return 'Spaces';
  if (/^IfcSlab/i.test(c) && predefined === 'BASESLAB') return 'Structure';
  if (/^IfcMember/i.test(c) && predefined && STRUCT_MEMBER_TYPES.has(predefined) && predefined !== 'MULLION' && predefined !== 'PLATE') return 'Structure';
  if (STRUCT.test(c)) return 'Structure';
  if (/^Ifc(FurnishingElement|Furniture|SystemFurnitureElement)/.test(c)) return 'Furnishing';
  if (MEP.test(c)) return 'MEP';
  if (ARCH.test(c)) return 'Architecture';
  if (SITE.test(c)) return 'Site';
  return 'Other';
}

const PART = /^[A-Za-z_][A-Za-z0-9_]*$/;
export function propertyAttr(prefix, set, name) {
  const s = PART.test(set) ? set : identifier(set);
  const n = PART.test(name) ? name : identifier(name);
  return { attr: prefix + ':' + s + ':' + n, real: n === name && s === set ? null : name, realSet: s === set ? null : set };
}

const LEN = /^IFC(LENGTH|POSITIVELENGTH|NONNEGATIVELENGTH)MEASURE$/;
export function siValue(type, value, lengthToMetre = 1) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const T = String(type || '').toUpperCase();
  if (LEN.test(T) || T === 'LENGTH') return { value: value * lengthToMetre, unit: 'm' };
  if (T === 'IFCAREAMEASURE' || T === 'AREA') return { value: value * lengthToMetre ** 2, unit: 'm2' };
  if (T === 'IFCVOLUMEMEASURE' || T === 'VOLUME') return { value: value * lengthToMetre ** 3, unit: 'm3' };
  if (T === 'IFCMASSMEASURE' || T === 'WEIGHT') return { value, unit: 'kg' };
  return null;
}

/** A property value → [usd type, value, customData entries] (null: nothing to write — UNKNOWN logicals, empty values). */
function typed(p, lengthToMetre) {
  const v = p.value;
  const T = String(p.type || '').toUpperCase();
  const cd = new Map();
  if (T) cd.set('ifcType', V('string', T));
  if (v === null || v === undefined || v === '') return null;
  if (Array.isArray(v)) {
    if (!v.length) return null;
    if (v.every((x) => typeof x === 'number')) return ['double[]', v, cd];
    return [p.enumerated ? 'token[]' : 'string[]', v.map(String), cd];
  }
  if (typeof v === 'boolean') return ['bool', v, cd];
  if (T === 'IFCLOGICAL' && (v === 'UNKNOWN' || v === 'U')) return null;
  if ((T === 'IFCBOOLEAN' || T === 'IFCLOGICAL') && typeof v === 'string') return ['bool', /^(T|TRUE|\.T\.)$/i.test(v), cd];
  if (typeof v === 'number') {
    const si = siValue(T, v, lengthToMetre);
    if (si) { cd.set('unit', V('string', si.unit)); return ['double', si.value, cd]; }
    if (/^IFC(INTEGER|COUNTMEASURE)$/.test(T) && Number.isInteger(v)) return ['int', v, cd];
    return ['double', v, cd];
  }
  if (p.enumerated) return ['token', String(v), cd];
  return ['string', String(v), cd];
}

export function writeIfcElement(b, prim, el) {
  const S = (n, v) => { if (v !== null && v !== undefined && v !== '') b.attr(prim, n, 'string', String(v), { custom: true, uniform: true }); };
  const Tk = (n, v) => { if (v) b.attr(prim, n, 'token', String(v), { custom: true, uniform: true }); };
  Tk('ifc:class', el.cls);
  if (el.predefined && el.predefined !== 'NOTDEFINED') Tk('ifc:predefinedType', el.predefined);
  S('ifc:globalId', el.guid);
  S('ifc:name', el.name); S('ifc:description', el.description); S('ifc:objectType', el.objectType); S('ifc:tag', el.tag);
  S('ifc:storey', el.storeyGuid);
  if (el.type) { S('ifc:type:globalId', el.type.guid); S('ifc:type:name', el.type.name); Tk('ifc:type:class', el.type.cls); }
  if (el.materials && el.materials.length) b.attr(prim, el.materials.length > 1 ? 'ifc:material:layers' : 'ifc:material', el.materials.length > 1 ? 'string[]' : 'string', el.materials.length > 1 ? el.materials : el.materials[0], { custom: true, uniform: true });
  if (el.groups && el.groups.length) b.attr(prim, 'ifc:groups', 'string[]', el.groups, { custom: true, uniform: true });
  for (const set of el.sets || []) {
    for (const p of set.props) {
      const t = typed(p, el.lengthToMetre || 1);
      if (!t) continue;
      const { attr, real, realSet } = propertyAttr(set.quantities ? 'ifc:qto' : 'ifc:pset', set.name, p.name);
      const cd = t[2];
      if (real) cd.set('ifcName', V('string', real));
      if (realSet) cd.set('ifcSet', V('string', realSet));
      const path = prim + '.' + attr;
      if (b.layer.specs.has(path)) continue;   // the instance's own value wins over its type's (sets come instance first)
      b.attr(prim, attr, t[0], t[1], { custom: true, uniform: true, meta: cd.size ? { customData: V('dictionary', cd) } : null });
    }
  }
  b.layer.set(prim, 'apiSchemas', V('listop:token', { explicit: false, prependedItems: ['SemanticsLabelsAPI:ifc'] }));
  b.attr(prim, 'semantics:labels:ifc', 'token[]', [el.cls], { uniform: true });
}
