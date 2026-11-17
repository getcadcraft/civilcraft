---
title: I-export ang as-built data para sa GIS
summary: Ibigay ang mga survey point, contour, alignment, pad, tubo at structure sa GIS department ng lungsod o county bilang shapefile, GeoPackage, GeoJSON o KML, sa grid coordinates ng coordinate system ng project.
keywords: gis, export, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, tubo, structures, utilities, lungsod, county, grid, ground, epsg, prj
from: bba4fea5
---

Maraming lungsod at county ang humihingi ng as-built data sa GIS format kapag natapos ang project: kung saan napunta ang mga tubo at structure, ang huling grade, ang road centerline. **GIS › Export** ay nagsusulat ng kung ano ang hawak ng CivilCraft bilang GIS layer, isa para sa bawat uri ng bagay.

## Bago mag-export

1. Itakda ang coordinate system ng project sa {{ui:Coordinates}}. Kailangang malaman ng GIS department kung nasaan ang mga numero; kapag walang sistema, dadalhin ng mga file ang sariling numero ng project at walang pangalan ng sistema.
2. Suriin ang surface, mga alignment, pad at pipe network kung paano mo gustong maihatid ang mga ito.
3. Itanong sa department kung anong format at anong coordinate system ang gusto nila. Marami pa rin ang humihingi ng shapefile sa local state plane zone; mas bagong sistema ang tumatanggap ng GeoPackage.

## Mag-export

1. I-click ang {{ui:Export}} sa **GIS** group.
2. Sa ilalim ng **Ano**, lagyan ng check ang mga uring ipapadala. Ipinapakita ng bawat isa kung ilang feature ang mayroon nito; ang mga uring wala pang laman ay naka-gray out.
3. Sa ilalim ng **Bilang**, piliin ang format.
4. Basahin ang mga tala tungkol sa coordinates at unit, pagkatapos i-click ang download button. Sinasabi ng status line kung ano ang isinama, at anumang pangalan ng field na pinaikli.

Nasa dialog din ang export ng elevation grid ({{ui:Surface as a GeoTIFF elevation grid}}); tingnan ang [Elevation grids at LiDAR](topic:elevation-grids-and-lidar).

## Ano ang laman ng bawat uri

| Uri | Hugis | Mga field |
|---|---|---|
| Survey points | Mga punto na may elevation | `P` numero ng punto, `N` northing, `E` easting, `Z` elevation, `D` description |
| Contour ng umiiral na lupa, ng graded surface | Mga linya sa kanilang elevation | `ELEV` |
| Breakline | Mga linya na may elevation | `NAME` |
| Hangganan ng surface | Polygon (ang iginuhit na hangganan, kung wala, ang gilid ng surface) | `NAME` |
| Alignment | Centerline | `NAME`, `LENGTH`, `STA_START`, `STA_END` (mga station bilang simpleng numero) |
| Pad | Polygon sa elevation ng pad | `NAME`, `ELEV`, `AREA` |
| Daylight line | Mga linya na may elevation (pad at corridor) | `NAME` |
| Corridor feature line | Mga linya na may elevation: center, gilid ng pavement, shoulder | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Tubo | Mga linya mula sa itaas na invert patungo sa ibabang invert | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (percent), `LENGTH`, `NETWORK` |
| Structure | Mga punto sa rim | `NAME`, `RIM`, `INVERT` (ang pinakamababang invert ng tubo doon), `SUMP`, `DIA`, `DIA_UNIT` |
| Bawat GIS layer | Gaya ng na-import | Sarili nitong mga field |

Ang haba, station at elevation ay nasa unit ng project (US survey feet o metres). Ang diameter ng tubo at structure ay nasa inches para sa feet na project at millimetres para sa metre na project; sinasabi ng `DIA_UNIT` kung alin.

## Ang mga format

- **Shapefile**: isang `.zip` na may shapefile para sa bawat uri (`.shp`, `.shx`, `.dbf`), isang `.cpg` na nagsasabing UTF-8 ang teksto, at isang `.prj` na nagpapangalan ng coordinate system. Ang mga hugis na may elevation ay isinusulat bilang Z type ng shapefile. Ang mga pangalan ng field na mas mahaba sa 10 karakter ay pinaiikli, gaya ng hinihingi ng format, at nakalista ito sa status line.
- **GeoPackage**: isang `.gpkg` file na may table para sa bawat uri, at nakaimbak ang coordinate system kasama ang EPSG code nito. Isang file sa halip na marami, at nananatili ang mahahabang pangalan ng field.
- **KML** o **KMZ** (KML na naka-zip): isang file ng latitude at longitude para sa Google Earth at web map, isang folder bawat uri, bawat feature ay placemark na pinangalanan mula sa field na NAME nito, na may bawat field bilang extended data; mga taas sa meters (altitude mode absolute). Gaya ng GeoJSON, kailangan nito ang coordinate system ng project.
- **GeoJSON**: isang file ng latitude at longitude (walang ibang pinapayagan ng GeoJSON standard), na bawat feature ay may property na `kind` (`pipes`, `structures`, …) para mahati ito ng tatanggap. Ang mga taas ay kino-convert sa metro, gaya ng hinihingi ng standard; nananatili sila sa vertical datum ng project mo (walang geoid model ang CivilCraft). Hindi makapag-export ng GeoJSON ang project na walang coordinate system, at sinasabi ng dialog kung bakit.

## Grid, hindi ground

Itinatago ng GIS department ang datos nila sa **grid** coordinates ng isang coordinate system. Kung ang project mo ay gumagamit ng ground o local coordinates (itinakda sa {{ui:Coordinates}}), ang bawat coordinate ay kino-convert pabalik sa grid sa paglabas: ang mga numero sa mga file ay iba sa plano sa pamamagitan ng scale factor mo (at rotation, para sa local na sistema). Ang mga point field na `N` at `E` ay may grid value din. Ipinapaalala ito ng dialog.

:::tip
Magpadala ng maikling tala kasama ang mga file: ang coordinate system at ang EPSG code nito, ang vertical datum ng iyong mga elevation, ang mga unit, at kung ano ang bawat file.
:::

## Ano ang sinuri

- Binasa muli ng GDAL, ang library na ginagamit ng karamihan sa GIS program para basahin ang mga file na ito, ang bawat file na isinulat: bawat hugis, elevation at attribute, ang bilang ng feature, at ang coordinate system bilang EPSG code nito (`.prj` at GeoPackage). Binasa rin ng sarili naming reader ang mga ito nang pareho.
- Sumusunod ang mga GeoJSON file sa RFC 7946: longitude bago latitude, walang `crs` member, counter-clockwise ang outer ring at clockwise ang mga butas; tumugma ang mga posisyon sa PROJ hanggang 2 mm.
- Na-export ang isang project na ground-coordinate at chineck ang bawat punto laban sa grid coordinates nito.
- Wala pang nabubuksan dito sa ibang GIS program. Suriin ang unang paghahatid kasama ang department bago umasa rito.
