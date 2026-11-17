/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-massing.js — the building masses as an IFC4 file (0.7 LC.1 M6; session massing). DOM-free, no library: ISO 10303-21 text
 * written by hand, the same way landscape/ifc-landscape.js does (and read by cc-ifc and BimCraft: the test round-trips it).
 *
 *   writeMassingIfc({ name, units, crs, lat, lon, origin, masses }, { seed, now }) → { text, counts, unit }
 *     units  the project's ('ft' | 'm'); crs the project's coordinate system (state.crs) or null; lat / lon degrees at `origin`
 *     origin { x, y, z } the file's zero in project coordinates (default: the masses' middle, z = the lowest ground floor)
 *     masses [{ id, name, use, pts: [{x, y}], floors, floorHeight, z0 (ground floor level), base, ground, parcel (name), zone? }]
 *   defaultOrigin(masses) → { x, y, z }
 *
 * The file is written IN THE PROJECT'S LENGTH UNIT — a US survey foot is an IfcConversionBasedUnit (factor 1200/3937 m), a metre
 * an SI unit — and IfcProjectedCRS.MapUnit is that same unit, so IfcMapConversion carries the origin's easting, northing and
 * height as they are in the project, with no scale. (BimCraft reads the nested measure of the foot since the 0.7 fix in
 * ifc-util.js unitMm.) Areas and volumes are SI, so a Pset area is in square metres whatever the length unit.
 *
 * Structure: IfcProject → IfcSite (RefLatitude / RefLongitude / RefElevation) → one IfcBuilding per mass → its IfcBuildingStoreys
 * (one per floor, Elevation = the floor's level in project heights) and ONE IfcBuildingElementProxy "Building mass": the
 * footprint extruded from the ground floor to the roof, in pset CadCraft_SiteMass (Use, Floors, FloorHeight, Height,
 * GroundFloorLevel, FootprintArea and GrossFloorArea in m², BaseOnSlope, Ground, Parcel, MassId). BimCraft's "Develop this mass"
 * turns that proxy into levels, walls and floors (model-site.js).
 * Without a coordinate system there is no IfcProjectedCRS / IfcMapConversion and no site latitude: the file says nothing it
 * does not know.
 *
 * 0.10 BK.44: the writer itself now lives in lib/massing/mass-ifc.js (./massing/mass-ifc.js, a synced copy) so ModelCraft's massing
 * is handed over in the same shape; this file is CivilCraft's door to it (it hands over CivilCraft's GlobalId maker). Output unchanged.
 */

import { guid } from './landscape/ifc-landscape.js';
export { guid };

import { writeMassingIfc as writeMasses, defaultOrigin, fileUnit, FT_US_M } from './massing/mass-ifc.js';
export { defaultOrigin, fileUnit, FT_US_M };

export function writeMassingIfc(input = {}, opts = {}) { return writeMasses(input, { ...opts, guid }); }
