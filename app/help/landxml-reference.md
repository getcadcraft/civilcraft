---
title: LandXML: what is read and written
summary: The LandXML 1.2 elements and attributes CivilCraft reads and writes, element by element, and everything it skips.
section: reference
order: 50
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, schema
---

CivilCraft writes LandXML 1.2 with the official namespace and schema location. It reads any file whose root element is `LandXML` and takes the elements below by name (namespace prefixes are ignored; the version is not checked). Its XML reader accepts only the five standard entities and numeric character references; it never loads a DTD or external file. For the steps, see [Exchange LandXML](topic:landxml).

LandXML writes coordinates northing first: a point is "N E" or "N E Z".

## Written

| Element | What CivilCraft writes |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, areas in square feet, volumes in cubic yards, diameters in inches) or `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = the project name |
| `Application` | name CivilCraft, manufacturer CadCraft |
| `CgPoints` / `CgPoint` | `name` = point number, `desc` = description, `code` = group; text "N E Z" (or "N E" without elevation) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw or ccw, `radius`, `length`, `staStart`, `chord`, `delta` (degrees), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | the existing ground along the alignment, as station and elevation pairs (`PntList2D`), split where it leaves the surface |
| `Profile` / `ProfAlign` | the design profile (named "<alignment> design"): `PVI` for ends and angle points, `ParaCurve` with `length` for vertical curves |
| `Surfaces` / `Surface` | `name` and `desc`; first the existing ground, then "Proposed" when pads or corridors grade |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (existing ground only) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (existing ground only, when there is one) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` with `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm or sanitary |
| `Struct` | `name`, `elevRim` (the rim used, set or from the surface), `elevSump`; `Center`; `CircStruct` with `diameter`; `Invert` with `elev`, `flowDir` in or out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` with `diameter` |

Not written: pads and corridors as objects (their result is the "Proposed" surface), alignments with errors, pipes without both inverts, network rules.

## Read

| Element | What CivilCraft takes |
|---|---|
| `Units` | `Imperial` or `Metric` and its `linearUnit` decide feet or metres. An unknown unit is noted. |
| `Project` | `name` becomes the project name. |
| `CgPoints` / `CgPoint` (nested too) | name (or `oID`), "N E" or "N E Z", `desc` (or `code`) as the description |
| `Surface` with `Definition surfType="TIN"` | `Pnts` and `Faces` as the existing ground (first surface only); invisible faces (`i="1"`) are left out |
| `SourceData` / `Breaklines` | 3D breaklines, kept with the surface |
| `SourceData` / `Boundaries` | the outer boundary |
| `Alignment` / `CoordGeom` | `Line` and `Curve` elements; PIs rebuilt from each curve's `PI`, or from its `Center` and tangents; `staStart` |
| `Profile` / `ProfAlign` | `PVI` and `ParaCurve` (with `length`); the first design profile with at least two PVIs |
| `PipeNetwork` | the first network that has pipes: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` per pipe) and `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Skipped, and named in the notes

- Surfaces after the first, grid surfaces and other non-TIN surfaces
- Alignments that contain `Spiral`, `IrregularLine` or `Chain` elements, or that have no geometry
- Design profiles after the first; `CircCurve` and `UnsymParaCurve` vertical curves (their PVIs are kept without a curve)
- Points that only refer to other points (`pntRef`), and points without readable coordinates
- Repeated point names (the first is kept)
- Hide, show and data-clip boundaries; breaklines without 3D points
- Pipe networks after the first; network types other than storm and sanitary (read as storm)
- Rectangular, inlet and outlet structures (read as round); egg, elliptical and box pipes and channels (read as round pipes of no size)
- `Parcels`, `PlanFeatures`, `Roadways`, `GradeModel` and `Survey`

Ground profiles (`ProfSurf`) in a file are not used: CivilCraft samples the ground from the surface itself.

## Messages when a file will not open

| Message | Meaning |
|---|---|
| "This is XML but not LandXML (its root element is <…>)." | The file is another kind of XML. |
| "… has no points, TIN surfaces or alignments CivilCraft can read." | Everything in the file is in the skipped list. The notes after it say what was there. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | The file is damaged or cut short. |
