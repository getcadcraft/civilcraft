---
title: IFC export and import
summary: Save the whole project as one IFC file in IFC 4.3, IFC4 or IFC2x3 (alignments, roads, earthworks, surfaces, walls, pipes), and open IFC files for their alignments and surfaces.
section: tasks
order: 127
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, alignment, ifcalignment, road, ifcroad, earthworks, tin, deliverable, procurement, export ifc, import ifc
---

IFC is the open exchange format many public clients ask for as a deliverable. CivilCraft writes the whole project into one IFC file and reads alignments and surfaces back from IFC files.

## Export

1. Click {{ui:IFC}} in the **Export** group (in the ribbon styles: {{ui:Output}} › {{ui:Export}} › {{ui:IFC}}).
2. Pick the schema. **IFC 4.3 ADD2** is first and the default: it is the edition with alignments, roads and earthworks. Pick IFC4 or IFC2x3 only when the receiver's software cannot read 4.3.
3. The dialog says what the file will hold and what the chosen schema leaves out. Click {{ui:Export IFC}}.
   The file downloads as "*project name*-ifc4x3.ifc", "-ifc4.ifc" or "-ifc2x3.ifc". CivilCraft remembers the schema you picked last.

## What each schema holds

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Alignments | IfcAlignment with its horizontal (lines, circular arcs, clothoid spirals) and vertical (grades, parabolic curves) layouts, their curves (IfcCompositeCurve, IfcGradientCurve), the start station and the superelevation events | A 3D polyline on a civil element | A 3D polyline on a proxy |
| Corridors | IfcRoad with road parts; lanes, shoulders, gutters and sidewalks as IfcPavement, curbs as IfcKerb, planting strips; each pavement course as an IfcCourse with its thickness, material and volume; the side slopes as IfcEarthworksCut and IfcEarthworksFill with the cut and fill volumes; the design speed and class | Civil elements named for what they are, grouped per road | Proxies, grouped per road |
| Surfaces | IfcGeographicElement TERRAIN with a triangulated irregular network | Triangulated face sets | Face-based surface models (larger files) |
| Pads and walls | The pad top, its slopes as earthworks, retaining walls as IfcWall RETAININGWALL | Same, the wall as a user-defined wall type | Same, the wall's type in ObjectType |
| Pipe networks | IfcPipeSegment and IfcDistributionChamberElement in an IfcDistributionSystem | Same | IfcFlowSegment and chambers in an IfcSystem |
| Georeferencing | IfcProjectedCRS and IfcMapConversion | Same | ePSet_ProjectedCRS and ePSet_MapConversion on the site |

A **railway** (an alignment with Railway on) goes into IFC 4.3 as an IfcRailway: its transitions as their own types (clothoid, cubic parabola, Bloss, Helmert, sine half-wave as cosine curve, sine), its cant as IfcAlignmentCant, and its track as rails, sleepers and the ballast bed, with the sub-ballast beneath. IFC4 and IFC2x3 get the same parts as civil elements or proxies. Opening an IFC 4.3 railway brings its transitions and cant back.

Every file also carries parcels (footprints), the Landscape workspace's plants and hardscape, and building masses (each an IfcBuilding with its storeys), all in one site. Property sets carry what you designed: stations, the assembly, cut and fill slopes, lane width and count, inverts, rims, wall heights; quantities (lengths, areas, volumes) are IfcElementQuantity sets.

## Units and coordinates

The file is in the project's length unit (metres, or US survey feet); areas and volumes are in square and cubic metres. With a coordinate system (GIS › Coordinates) the file is placed on the map: its origin's easting and northing, and a ground (local) system's rotation and scale, are in the map conversion. Without one the file records its local origin in a property set and is not placed on a map.

## Import

Open an .ifc file with {{ui:Open}} or drop it on the plan. The import dialog says what the file holds:

- **Alignments** from IFC 4.3 (the horizontal and vertical layouts) and IFC 4x1 alignment curves become CivilCraft alignments with their PIs, radii, spiral lengths and PVIs. An alignment CivilCraft's PI model cannot hold (compound curves, spirals between two curves, one that starts or ends in a curve) is not imported, and the dialog says why.
- **Surfaces**: pick the one that becomes the existing ground, or keep the project's.
- **Everything else** (and the other surfaces) can be shown in the 3D view as reference. Reference elements stay while the project is open; they are not saved in the project file.

A file CivilCraft wrote in IFC4 or IFC2x3 brings its alignments back exactly from their property sets.

## Not built yet

- A road's superelevation is written as superelevation events and in the road surfaces (cant is for railways).
- Saving reference elements in the project file, and importing pipe networks or pads from IFC as editable objects.
