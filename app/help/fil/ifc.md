---
title: IFC export at import
summary: I-save ang buong proyekto bilang isang IFC file sa IFC 4.3, IFC4 o IFC2x3 (alignments, roads, earthworks, surfaces, walls, pipes), at magbukas ng IFC file para sa mga alignment at surface nito.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, alignment, ifcalignment, road, ifcroad, earthworks, tin, deliverable, procurement, I-export ang ifc, I-import ang ifc
from: 6b998bcf
---

Ang IFC ay bukas na exchange format na hinihingi ng maraming public client bilang deliverable. Isinusulat ng CivilCraft ang buong proyekto sa isang IFC file at binabasa pabalik ang mga alignment at surface mula sa mga IFC file.

## I-export

1. I-click ang {{ui:IFC}} sa **Export** group (sa ribbon styles: {{ui:Output}} › {{ui:Export}} › {{ui:IFC}}).
2. Pumili ng schema. Ang **IFC 4.3 ADD2** ang nasa unahan at default: ito ang edition na may alignments, roads at earthworks. Pumili ng IFC4 o IFC2x3 lamang kapag hindi mabasa ng software ng tatanggap ang 4.3.
3. Sinasabi ng dialog kung ano ang laman ng file at kung ano ang iniiwan ng napiling schema. I-click ang {{ui:Export IFC}}.
   Dina-download ang file bilang "*pangalan ng proyekto*-ifc4x3.ifc", "-ifc4.ifc" o "-ifc2x3.ifc". Naaalala ng CivilCraft ang schema na huli mong pinili.

## Ano ang laman ng bawat schema

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Alignments | IfcAlignment kasama ang horizontal (lines, circular arcs, clothoid spirals) at vertical (grades, parabolic curves) na layout nito, ang mga curve nito (IfcCompositeCurve, IfcGradientCurve), ang start station at ang superelevation events | Isang 3D polyline sa civil element | Isang 3D polyline sa proxy |
| Corridors | IfcRoad na may road parts; lanes, shoulders, gutters at sidewalks bilang IfcPavement, curbs bilang IfcKerb, planting strips; bawat pavement course bilang IfcCourse na may kapal, material at volume nito; ang side slopes bilang IfcEarthworksCut at IfcEarthworksFill na may cut at fill volumes; ang design speed at class | Mga civil element na pinangalanan ayon sa kung ano sila, nakapangkat kada road | Mga proxy, nakapangkat kada road |
| Surfaces | IfcGeographicElement TERRAIN na may triangulated irregular network | Triangulated face sets | Face-based surface models (mas malalaking file) |
| Pads and walls | Ang top ng pad, ang slopes nito bilang earthworks, retaining walls bilang IfcWall RETAININGWALL | Pareho, ang pader bilang user-defined wall type | Pareho, ang uri ng pader sa ObjectType |
| Pipe networks | IfcPipeSegment at IfcDistributionChamberElement sa isang IfcDistributionSystem | Pareho | IfcFlowSegment at chambers sa isang IfcSystem |
| Georeferencing | IfcProjectedCRS at IfcMapConversion | Pareho | ePSet_ProjectedCRS at ePSet_MapConversion sa site |

Ang **railway** (alignment na naka-on ang Railway) ay napupunta sa IFC 4.3 bilang IfcRailway: ang mga transition nito bilang sarili nilang uri (clothoid, cubic parabola, Bloss, Helmert, sine half-wave bilang cosine curve, sine), ang cant nito bilang IfcAlignmentCant, at ang track nito bilang rails, sleepers at ballast bed, kasama ang sub-ballast sa ilalim. Ang IFC4 at IFC2x3 ay nakakakuha ng parehong bahagi bilang civil element o proxy. Kapag binuksan ang IFC 4.3 railway, ibinabalik nito ang mga transition at cant.

Dala rin ng bawat file ang parcels (footprints), ang plants at hardscape ng Landscape workspace, at ang building masses (bawat isa ay IfcBuilding kasama ang mga palapag nito), lahat sa iisang site. Dala ng property sets ang idinisenyo mo: stations, assembly, cut at fill slopes, lane width at bilang, inverts, rims, taas ng pader; ang mga quantity (haba, area, volume) ay mga IfcElementQuantity set.

## Mga unit at coordinate

Nasa length unit ng proyekto ang file (metro, o US survey feet); nasa square at cubic metres ang area at volume. Kapag may coordinate system (GIS › Coordinates), nakalagay sa mapa ang file: ang easting at northing ng origin nito, at ang rotation at scale ng ground (local) system, ay nasa map conversion. Kapag wala, itinatala ng file ang lokal nitong origin sa isang property set at hindi ito nakalagay sa mapa.

## I-import

Buksan ang .ifc file gamit ang {{ui:Open}} o i-drop ito sa plano. Sinasabi ng import dialog kung ano ang laman ng file:

- **Alignments** mula sa IFC 4.3 (ang horizontal at vertical na layout) at IFC 4x1 alignment curves ay nagiging CivilCraft alignments kasama ang kanilang PI, radii, haba ng spiral at PVI. Hindi ina-import ang alignment na hindi kayang hawakan ng PI model ng CivilCraft (compound curves, spiral sa pagitan ng dalawang curve, o isa na nagsisimula o nagtatapos sa curve), at sinasabi ng dialog kung bakit.
- **Surfaces**: piliin ang magiging existing ground, o panatilihin ang sa proyekto.
- **Lahat ng iba pa** (at ang iba pang surface) ay maaaring ipakita sa 3D view bilang reference. Nananatili ang reference elements habang bukas ang proyekto; hindi sila sine-save sa project file.

Ibinabalik nang eksakto ang alignments ng file na isinulat ng CivilCraft sa IFC4 o IFC2x3 mula sa kanilang property set.

## Hindi pa nagagawa

- Isinusulat ang superelevation ng road bilang superelevation events at sa mga road surface (ang cant ay para sa railways).
- Pag-save ng reference elements sa project file, at pag-import ng pipe networks o pads mula sa IFC bilang editable na object.
