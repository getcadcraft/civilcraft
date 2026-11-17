---
title: I-import ang datos ng GIS
summary: Ilipat ang shapefile, GeoJSON at GeoPackage sa project bilang GIS layer, ilagay ang mga ito sa tamang coordinate system, tingnan ang kanilang attribute, at gamitin ang mga ito para sa surface.
keywords: gis, labels, label features, attributes on the plan, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, import, layers, attributes, coordinate system, epsg, latitude, longitude, contour, parcels, breakline, hangganan
from: f6b235cc
---

Ang mga city at county GIS department ay nagbibigay ng site context bilang GIS file: parcels, easement, contour, utilities, survey control. Nagbubukas ang CivilCraft ng tatlong uri nito bilang **GIS layer** na nasa ilalim ng disenyo mo sa plano.

| File | Ano ang bubuksan |
|---|---|
| Shapefile | Ang `.shp` kasama ng `.shx`, `.dbf`, `.prj` at `.cpg` (piliin silang lahat), o ang `.zip` na pinanggalingan nila. Ang zip na may ilang shapefile ay nagbibigay ng ilang layer. |
| GeoJSON | Ang `.geojson` file (gumagana rin ang `.json` file na ang mga unang linya ay nagsasabing `FeatureCollection` o `Feature`). |
| GeoPackage | Ang `.gpkg` file. Nakalista ang bawat feature table dito. |
| KML o KMZ | Ang `.kml` file (mula sa Google Earth o web map), o ang naka-zip na `.kmz`. Bawat folder ay nagiging layer (hinahati sa points, lines at polygons kapag ilang uri ang laman); ang pangalan, description at extended data ng placemark ay nagiging attribute nito. Nasa meters ang mga taas, at nasa latitude at longitude, gaya ng sa GeoJSON. |

Binabasa ang points, multipoints, lines, polygon na may butas at multi-part na hugis, kasama ang kanilang elevation (z) kapag mayroon ang file. Hindi isinasama ang mga value ng Measure (M). Nagbubukas ang elevation grid at LiDAR sa parehong paraan: tingnan ang [Elevation grids at LiDAR](topic:elevation-grids-and-lidar).

## Buksan ang mga file

1. I-click ang {{ui:Import}} sa **GIS** group (o {{ui:Open}}), piliin ang mga file, o i-drop sila sa plano. Binabasa ang mga file sa computer na ito; walang ina-upload.
2. Inililista ng dialog na **I-import ang datos ng GIS** ang bawat layer na nakita: ang uri nito, ilang feature (at ilan ang walang geometry), ilang attribute field, at ang coordinate system na tinutukoy ng file. Alisin ang check sa mga layer na ayaw mo.
3. Basahin ang bahaging **Coordinate system** (sa ibaba) at ang linyang **Ano ang mangyayari**, pagkatapos i-click ang {{ui:Import}}.
4. Lalabas ang mga layer sa plano at sa ilalim ng **GIS layers** sa kaliwang panel. Isang hakbang lang ang import: binabawi ito ng {{key:Mod+Z}}.

Ang malaking file ay nagpapakita ng progress line sa ibabaw ng plano kasama ang {{ui:Cancel}} button.

## Ang coordinate system

Sinasabi ng mga GIS file kung nasaan sila sa pamamagitan ng coordinate system (ang `.prj` ng shapefile, ang spatial reference table ng GeoPackage; laging latitude at longitude ang GeoJSON). Kino-convert ng CivilCraft ang bawat layer mula sa sarili nitong sistema papunta sa sistema ng project. Hindi ito kailanman humuhula:

- **May coordinate system ang project** (itinakda sa {{ui:Coordinates}}): bawat layer na may sariling sistema ay kino-convert dito, kasama ang ground o local na adjustment. Ang file na walang `.prj` ay may dalawang pagpipilian: **Pareho sa project** (ilo-load ang mga numero nito gaya ng mga ito) o **Piliin ang sistema ng file**.
- **Walang coordinate system ang project, at ang file ay nasa projected na sistema sa mga unit ng project** (halimbawa, state plane zone sa US survey feet para sa feet na project): iaalok ng dialog ang **Gamitin ang sistemang iyon bilang coordinate system ng project**. Itinatakda ito sa parehong undo step ng import. Walang gumagalaw sa project; sinasabi lang ng sistema kung ano ang ibig sabihin ng mga numero. Maaari kang pumili ng ibang sistema para sa project sa halip, at iko-convert dito ang mga layer.
- **Walang coordinate system ang project, at ang file ay nasa latitude at longitude** (lahat ng GeoJSON) **o sa ibang unit**: mananatiling naka-gray out ang {{ui:Import}} hanggang pumili ka ng coordinate system ng project. Malapit sa datos magsisimula ang picker.
- **Walang pangalan ng sistema ang project at ang mga file**: ilo-load ang mga numero gaya ng mga ito, at sinasabi ito ng dialog.

Kino-convert din ang mga elevation: ang mga taas ng GeoJSON ay nasa metro (sinasabi ito ng GeoJSON standard); ang mga taas ng ibang file ay kinukuha sa unit ng sarili nilang sistema.

:::warning
Ang mga posisyon sa GeoJSON file na nasa labas ng ±180° longitude o ±90° latitude ay hindi latitude at longitude. Hindi isinasama ang mga feature na iyon at sinasabi ng dialog kung ilan. Karaniwang projected na file ito na na-save nang walang sistema; humingi ulit nito, o ang shapefile na may `.prj` nito.
:::

Itinuturing na pareho ang NAD83 at WGS 84 (ang sistemang ginagamit ng GeoJSON); nagkakaiba ang dalawa ng ilang metro sa North America, kaya maaaring mag-iba ang datos ng GeoJSON ng ganoon kalaki. Kapag ang pinakamahusay na shift ay nangangailangan ng grid file (NADCON para sa NAD27, halimbawa), gumagamit ang CivilCraft ng mas magaspang na nailathalang shift at ipinapakita ng coordinate system dialog kung gaano ito kagaspang (para sa NAD27, mga 20 m), hanggang idagdag mo ang grid: tingnan ang [Grid shift files](topic:coordinate-systems).

## GIS layers

Ang bawat hilera sa ilalim ng **GIS layers** ay may:

- checkbox para ipakita o itago ang layer (hindi rin napipili ang mga nakatagong layer);
- ang kulay nito, pinili mula sa listahan;
- isang menu (ang tatlong tuldok) na may {{ui:Zoom to}}, {{ui:Use for the surface…}}, {{ui:Rename…}} at {{ui:Remove}}.

Ang pagpapakita, pagtatago, pagpapalit ng kulay, pagpapalit ng pangalan at pag-aalis ay mga undo step. Naka-save ang GIS layers sa project file at bumabalik kapag binuksan mo ito. Kasama rin sila sa PDF plot ng plano at sa DXF at DWG export nito, bawat isa ay nasa layer na pinangalanang `GIS-` at ang numero nito.

## Lagyan ng label ang mga feature mula sa attribute

Sa menu na {{ui:More}} ng layer (ang tatlong tuldok sa **GIS layers**), pumili ng field sa ilalim ng **Label with**: ipinapakita ng bawat feature ang value nito sa plano, sa kulay ng layer. Nilalagyan ng label ang mga punto sa tabi ng punto, ang mga linya sa gitna ng pinakamahabang bahagi nito (iniikot para mabasa mula kaliwa pakanan), ang mga polygon sa gitna nila. Hanggang tatlong decimal ang ipinapakitang numero. Ang mga label ay 1.8 mm ang taas sa papel sa anumang scale, at napupunta sila sa PDF plot, DXF at DWG. Piliin ang **No labels** para alisin ang mga ito; bawat pagbabago ay isang hakbang ({{key:Mod+Z}} ang nag-uundo nito). Hanggang 5,000 feature lang ang nalalagyan ng label ng isang layer.

## Tingnan ang isang feature

Kapag naka-on ang {{ui:Select}}, i-click ang isang feature. Ipinapakita ng **Properties** ang layer nito, kung aling feature ito, ang hugis nito (mga bahagi, butas, vertices), ang mga elevation nito, ang file na pinanggalingan nito at coordinate system ng file na iyon, pagkatapos ang bawat attribute sa isang table. Read-only ang mga attribute: ipinapakita ng CivilCraft ang datos ng GIS gaya ng dumating ito, hindi nito ito ine-edit.

Nauuna ang mga punto kaysa sa mga linya kapag pareho silang nasa ilalim ng pointer; sa loob ng polygon, ang pinakamaliit na polygon ang napipili.

## Gamitin para sa surface

Buksan ang menu ng layer at piliin ang {{ui:Use for the surface…}} (o ang button sa **Properties**). Nakadepende sa layer ang iaalok:

| Layer | Maaaring maging |
|---|---|
| Mga linya na may elevation (3D lines) | Breakline sa sarili nilang elevation |
| Mga linya na walang elevation pero may number field (contour) | Breakline sa elevation ng field na pipiliin mo |
| Mga polygon | Ang hangganan ng surface (ang napiling polygon, kung wala, ang pinakamalaki), o breakline sa kahabaan ng gilid nila |
| Mga punto na may elevation, o may elevation field | Survey points, inilarawan sa pangalan ng layer para bumuo ng point group |

Ang bawat paggamit ay isang undo step na kumokopya ng geometry sa project; nananatiling pareho ang mismong layer. Kinukuha ang mga elevation sa mga unit ng project.

## Mga point file na may latitude at longitude

Ang point file na ang header ay may mga column na **latitude** at **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) ay binabasa bilang degrees, hindi bilang northing at easting. Sinasabi ito ng import dialog. Sa {{ui:Import}}, kino-convert ang mga punto sa coordinate system ng project; ang project na walang sistema ay hihingi muna na piliin ito. Hindi kailanman nilo-load na feet ang degrees. Tinatanggihan ang mga row na nasa labas ng ±90° latitude o ±180° longitude, kasama ang dahilan. Kinukuha ang elevation column gaya ng pagkakasulat nito, sa mga unit ng project.

## LandXML file na may tinukoy na coordinate system

Kapag ang LandXML file na binuksan mo ay may elementong `CoordinateSystem` (isang EPSG code, WKT description o pangalan ng sistema), iaalok ito ng CivilCraft bilang coordinate system ng project. Walang gumagalaw kapag tinanggap mo; sinasabi lang ng sistema kung ano ang ibig sabihin ng mga numero.

## Ano ang sinuri

- Ikinumpara ang bawat reader sa GDAL, ang library na ginagamit ng karamihan sa GIS program para basahin ang mga file na ito, sa mga file na isinulat ng GDAL: shapefile ng bawat uri na may at walang elevation, multi-part na linya, polygon na may butas, walang lamang geometry, teksto, number, date at true/false na attribute, UTF-8 at Windows-1252 na teksto na may at walang `.cpg`, zip ng ilang shapefile, GeoJSON na may bawat geometry type, at GeoPackage na may apat na table. Tumugma ang bawat geometry, elevation at attribute.
- Tumugma sa PROJ (ang projection library sa likod ng GDAL) hanggang 3 mm ang mga posisyong ni-convert mula sa latitude at longitude, at mula sa UTM.
- Ang mga sirang file (putol, nagsisinungaling tungkol sa laki, sirang zip, sirang GeoPackage) ay nagbibigay ng iisang malinaw na mensahe; walang tumitigil.
- Wala pang nabubuksan dito sa ibang GIS program, at hindi pa nababasa ang file geodatabases, KML at KMZ (tingnan ang [Hindi pa nagagawa](topic:not-built-yet)).
