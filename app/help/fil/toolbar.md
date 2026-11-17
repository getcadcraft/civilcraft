---
title: Sanggunian ng toolbar
summary: Bawat toolbar button ng CivilCraft, ang ginagawa nito, ang key nito, at kung kailan ito naka-gray out o tumatanggi.
keywords: toolbar, buttons, commands, tools, file, export, surface, design, edit, view, menu
from: 4c4352bc
---

Tumatakbo ang toolbar sa itaas ng app sa pitong grupo. Ipinapakita ng bawat button ang tooltip at key nito kapag itinuro mo ito.

## File

| Button | Key | Ano ang ginagawa |
|---|---|---|
| {{ui:Bago}} | wala | Nagsisimula ng walang lamang project. Nagtatanong muna kung may hindi pa nai-save na pagbabago. |
| {{ui:Buksan}} | {{key:Mod+O}} | Nagbubukas ng point file (CSV, TXT), LandXML o CivilCraft project. |
| {{ui:I-save}} | {{key:Mod+S}} | Dina-download ang project bilang `<name>.civilcraft.json`. |

## Export

| Button | Key | Ano ang ginagawa |
|---|---|---|
| {{ui:LandXML}} | wala | Dina-download ang `<name>.xml`: mga point, surface, alignment, profile at ang pipe network bilang LandXML 1.2. "Wala pang ie-export." kapag walang laman ang project. |
| {{ui:DXF}} | wala | Dina-download ang `<name>.dxf`: ang plan linework bilang R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Binubuksan ang **I-plot ang plan sa PDF**. "Wala pang ipa-plot." kapag walang laman ang project. |

## Surface

| Button | Key | Ano ang ginagawa |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | I-click ang survey points ayon sa pagkakasunod, {{key:Enter}} para tapusin. Kinukuha ng breakline ang elevation ng mga point. |
| {{ui:Boundary}} | {{key:O}} | I-click ang mga sulok ng panlabas na boundary, {{key:Enter}} para tapusin. Pinapalitan ang anumang boundary. |

Parehong nagsasabi ng "Wala pang surface: magbukas muna ng survey points." kapag walang surface.

## Design

| Button | Key | Ano ang ginagawa |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | I-click ang mga PI ayon sa pagkakasunod, {{key:Enter}} para tapusin. |
| {{ui:Pad}} | {{key:G}} | I-click ang mga sulok ng pad, {{key:Enter}} para tapusin. Tulad ng surface tools, nagbababala ito kapag walang surface; sa surface lang nagkakaroon ng grade ang pad. |
| {{ui:Pipes}} | {{key:P}} | I-click ang mga structure mula sa upstream pababa (i-click ang umiiral na para sumali dito), {{key:Enter}} para tapusin. |
| {{ui:Profile}} | {{key:R}} | Ipinapakita o itinatago ang profile view sa ilalim ng plan. |

## Edit

| Button | Key | Ano ang ginagawa |
|---|---|---|
| {{ui:I-undo}} | {{key:Mod+Z}} | Binabawi ang huling pagbabago (hanggang 200). Naka-gray out kapag walang babawiin. |
| {{ui:I-redo}} | {{key:Mod+Y}} | Inuulit ang binawi. Naka-gray out kapag walang uulitin. |
| {{ui:Kopyahin}} | {{key:Mod+C}} | Kinokopya ang napiling survey points, at inilalagay sa clipboard bilang point rows na kayang tanggapin ng spreadsheet. Naka-gray out hanggang may napiling point. |
| {{ui:I-paste}} | {{key:Mod+V}} | Nagpe-paste ng points: sumusunod ang mga ito sa pointer, at kapag nag-click ka, ibinababa ang mga ito na may mga numerong wala pang ibang point. Nagpe-paste din ang mga point row na kinopya sa spreadsheet. |
| {{ui:Higit pa}} | wala | Binubuksan ang menu sa ibaba. |

Ang menu ng {{ui:Higit pa}}:

| Item | Key | Ano ang ginagawa |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | Kinokopya ang napiling points at binubura ang mga ito (isang undo step). |
| {{ui:Kopyahin}} | {{key:Mod+C}} | Gaya ng {{ui:Kopyahin}} button. |
| {{ui:I-paste}} | {{key:Mod+V}} | Gaya ng {{ui:I-paste}} button. |
| {{ui:I-paste sa mismong lugar}} | {{key:Mod+Shift+V}} | Ipinepaste ang mga point sa sarili nilang coordinates, na may mga numerong wala pang ibang point. |
| {{ui:Duplicate}} | {{key:Mod+D}} | Isang kopya ng napiling points ang sumusunod sa pointer; i-click kung saan ito ilalagay. Hindi ginagalaw ang clipboard. |
| {{ui:Burahin}} | {{key:Delete}} | Binubura ang napiling survey points, o ang napiling alignment, pad, structure (kasama ang mga tubo nito), tubo o PVI. |
| {{ui:Piliin lahat ng punto}} | {{key:Mod+A}} | Pinipili ang bawat survey point. |
| {{ui:Alisin ang pagpili}} | {{key:Esc}} | Inaalis ang pagpili. |

Naka-gray out ang item na hindi makakilos sa ngayon, at sinasabi ng tooltip nito kung bakit. Mga detalye: [Piliin, kopyahin at i-paste ang survey points](topic:copy-paste-points).

Sakop ng {{ui:I-undo}} ang mga pagbabago sa design, mga setting ng surface, at mga survey point (paste, cut, duplicate, delete). Hindi nito sakop ang mga display setting, at binubura ng pagbubukas o pag-import ng anumang file ang undo history.

## GIS

| Button | Key | Ano ang ginagawa |
|---|---|---|
| {{ui:Coordinates}} | wala | Binubuksan ang dialog na **Coordinate system**: sabihin kung aling system ang gamit ng project, o gamitin ang ground o local coordinates. Tingnan ang [Itakda ang coordinate system ng project](topic:coordinate-systems) at [Ground at local coordinates](topic:ground-and-local-coordinates). |
| {{ui:I-import}} | wala | Nag-i-import ng GIS data: shapefiles, GeoJSON, GeoPackage, elevation grids at LiDAR. Tingnan ang [Mag-import ng GIS data](topic:gis-import). |
| {{ui:Export}} | wala | Nag-e-export ng as-built data para sa GIS department. Tingnan ang [I-export ang as-built data para sa GIS](topic:gis-export). |
| {{ui:Analyze}} | wala | Binubuksan ang GIS analysis panel: buffer, overlay, spatial join, select by attribute, measure. Tingnan ang [Suriin ang GIS layers](topic:gis-analysis). |
| {{ui:Attribute table}} | wala | Nasa Surface › {{ui:Higit pa}}. Binubuksan ang attribute table ng GIS layer: pag-ayos, filter, pagpili, pag-edit, pagdagdag ng field, calculate, i-save bilang CSV. Tingnan ang [Gamitin ang attribute table ng layer](topic:gis-table). |
| {{ui:Map}} | wala | Binubuksan ang dialog na **Map layers**: isang georeferenced na larawan, o mga map server na idadagdag mo, na iginuguhit sa ilalim ng plan. Tingnan ang [Ipakita ang map layers sa ilalim ng plan](topic:map-layers). |

Naglo-load ang mga GIS tool sa unang gamit mo sa mga button na ito, kapag nagbukas ka ng GIS file, o kapag nagbukas ka ng project na may coordinate system o GIS layers.

## View

| Button | Key | Ano ang ginagawa |
|---|---|---|
| {{ui:Piliin}} | {{key:V}} o {{key:Esc}} | I-click para pumili ng alignment, pad, structure, tubo at point ({{key:Shift}} at click o drag ay nagdadagdag ng point); i-drag ang grips para ilipat ang mga PI, sulok ng pad at structure. |
| {{ui:Fit}} | {{key:F}} | Zinu-zoom ang plan para ipakita ang surface, point, alignment at pad (sa 3D view: ipinapakita ang lahat). |
| {{ui:3D}} | {{key:D}} | Ipinapakita ang site sa 3D sa ibabaw ng plan, o bumabalik sa plan. Itinatakda ng bar sa ibabaw ng 3D view ang view, exaggeration, kulay at kung ano ang nakikita, at nag-e-export ng GLB o OBJ. Tingnan ang [Tingnan ang site sa 3D](topic:site-3d). |

## Mga button sa mga panel

| Button | Saan | Ano ang ginagawa |
|---|---|---|
| {{ui:Buksan ang sample site}} | Ang kahon sa walang lamang plan | Nagla-load ng sample survey (kailangan ng koneksyon, maliban kung na-save ang CivilCraft para sa offline na gamit) |
| {{ui:Alisin ang boundary}} | Kaliwang panel, Surface | Inaalis ang panlabas na boundary |
| {{ui:Alisin ang iginuhit na breakline}} | Kaliwang panel, Surface | Inaalis ang bawat breakline na iginuhit gamit ang tool (hindi ang mga breakline group) |
| {{ui:Buuin muli ang surface mula sa mga punto}} | Kaliwang panel, Surface (LandXML surface lang) | Inaalis ang LandXML TIN at bumubuo mula sa mga point; hindi na mababawi |
| {{ui:Simulan mula sa ground}} | Kanang panel, Alignment | Sinisimulan ang design profile na may PVI sa ground sa bawat dulo |
| {{ui:Profile view}} | Kanang panel, Alignment | Binubuksan ang profile view ng alignment na ito |
| {{ui:Magdagdag ng PVI}} | Profile bar | Habang nakapindot, ang click sa profile ay nagdadagdag ng PVI |
| {{ui:Itakda ang lahat ng invert ayon sa mga patakaran}} | Kanang panel, Pipe network | Itinatakda ang lahat ng invert ng bawat tubo ayon sa mga patakaran |
| {{ui:Itakda ang invert nito ayon sa mga patakaran}} | Kanang panel, Pipe | Itinatakda ang invert ng tubong ito ayon sa mga patakaran |
