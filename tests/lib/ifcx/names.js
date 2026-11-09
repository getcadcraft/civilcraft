/* SPDX-License-Identifier: Apache-2.0 */
/**
 * names.js — the attribute names cc-ifcx understands and the properties of the core schemas, written by us from the field
 * names the alpha schemas publish (name, data type, quantity kind). It is a table of facts used to choose between the
 * standard `bsi::ifc::prop::*` attribute and our own `cadcraft::pset::*` / `cadcraft::qto::*` ones when we write; when a file
 * is read, the schemas it imports are what decide (a quantity is an attribute whose schema has a quantityKind).
 */
export const A = {
  CLASS: 'bsi::ifc::class',
  MATERIAL: 'bsi::ifc::material',
  COLOR: 'bsi::ifc::presentation::diffuseColor',
  OPACITY: 'bsi::ifc::presentation::opacity',
  PROP: 'bsi::ifc::prop::',
  MATPROP: 'bsi::ifc-mat::prop::',
  MESH: 'usd::usdgeom::mesh',
  VISIBILITY: 'usd::usdgeom::visibility',
  CURVES: 'usd::usdgeom::basiscurves',
  XFORM: 'usd::xformop',
  BOUNDARY: 'bsi::ifc::spaceBoundary',
  PSET: 'cadcraft::pset::',
  QTO: 'cadcraft::qto::',
  ALPHA: 'cadcraft::alpha',
};
/** The 14 quantity kinds of the alpha, as the published schemas spell them. */
export const KINDS = ['Plane angle', 'Thermodynamic temperature', 'Electric current', 'Time', 'Frequency', 'Mass', 'Length', 'Linear velocity', 'Force', 'Pressure', 'Area', 'Energy', 'Power', 'Volume'];
/** name → [dataType, quantityKind?] of the core property schema. */
export const PROPS = {
  Name: ['String'], Description: ['String'], UsageType: ['String'], TypeName: ['String'],
  RefElevation: ['Real', 'Length'], ElevationOfRefHeight: ['Real', 'Length'], ElevationOfTerrain: ['Real', 'Length'],
  NumberOfStoreys: ['Integer'], IsExternal: ['Boolean'], Station: ['Real'],
  Volume: ['Real', 'Volume'], NetVolume: ['Real', 'Volume'],
  Height: ['Real', 'Length'], Width: ['Real', 'Length'], Length: ['Real', 'Length'], Depth: ['Real', 'Length'],
  NetArea: ['Real', 'Area'], NetSideArea: ['Real', 'Area'], CrossSectionArea: ['Real', 'Area'],
};
/** Published addresses of the schema files a layer can import (facts, not their content). */
export const IMPORT_URI = {
  ifc: 'https://ifcx.dev/@standards.buildingsmart.org/ifc/core/ifc@v5a.ifcx',
  prop: 'https://ifcx.dev/@standards.buildingsmart.org/ifc/core/prop@v5a.ifcx',
  mat: 'https://ifcx.dev/@standards.buildingsmart.org/ifc/ifc-mat/ifc-mat@v1.0.0.ifcx',
  usd: 'https://ifcx.dev/@openusd.org/usd@v1.ifcx',
  nlsfb: 'https://ifcx.dev/@nlsfb/nlsfb@v1.ifcx',
};
/** Classification attribute prefixes the published files describe. */
export const KNOWN_CLASS_SYSTEMS = { nlsfb: 'nlsfb' };
export const IFC_CLASS_URI = (code) => 'https://identifier.buildingsmart.org/uri/buildingsmart/ifc/4.3/class/' + code;
export const SPATIAL = ['IfcProject', 'IfcSite', 'IfcBuilding', 'IfcBuildingStorey'];
