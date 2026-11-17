---
title: Exporta les dades as-built per al SIG
summary: Lliura punts topogràfics, corbes de nivell, traçats, plataformes, canonades i estructures a un departament de SIG municipal o comarcal com a shapefiles, GeoPackage, GeoJSON o KML, en coordenades de quadrícula del sistema de coordenades del projecte.
keywords: sig, exporta, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, canonades, estructures, serveis, municipi, comarca, quadrícula, terreny, epsg, prj
from: bba4fea5
---

Molts municipis i comarques demanen dades as-built en un format SIG quan es tanca un projecte: on han anat les canonades i les estructures, les rasants finals, l'eix de la carretera. **SIG › Exporta** escriu el que CivilCraft té com a capes SIG, una per cada tipus d'objecte.

## Abans d'exportar

1. Definiu el sistema de coordenades del projecte a {{ui:Coordenades}}. Un departament de SIG ha de saber on són els números; sense sistema, els fitxers porten els números del projecte i no en diuen cap.
2. Reviseu la superfície, els traçats, les plataformes i la xarxa de canonades tal com les voleu lliurar.
3. Pregunteu al departament quin format i quin sistema de coordenades volen. Molts encara demanen shapefiles en la zona local de la projecció estatal (state plane); els sistemes més nous accepten GeoPackage.

## Exporta

1. Feu clic a {{ui:Exporta}} al grup **SIG**.
2. A **Què**, marqueu els tipus a enviar. Cada un mostra quants elements té; els tipus sense res encara surten en gris.
3. A **Com**, trieu el format.
4. Llegiu les notes sobre coordenades i unitats, i feu clic al botó de baixada. La línia d'estat diu què s'ha inclòs i quins noms de camp s'han escurçat.

El diàleg també conté l'exportació de la graella d'elevacions ({{ui:Superfície com a graella d'elevacions GeoTIFF}}); vegeu [Graelles d'elevacions i LiDAR](topic:elevation-grids-and-lidar).

## Què conté cada tipus

| Tipus | Forma | Camps |
|---|---|---|
| Punts topogràfics | Punts amb elevació | `P` número de punt, `N` nord, `E` est, `Z` elevació, `D` descripció |
| Corbes de nivell del terreny existent, de la superfície explanada | Línies a la seva elevació | `ELEV` |
| Línies de ruptura | Línies amb elevacions | `NAME` |
| Límit de la superfície | Polígon (el límit dibuixat, si no, la vora de la superfície) | `NAME` |
| Traçats | Eixos | `NAME`, `LENGTH`, `STA_START`, `STA_END` (punts quilomètrics com a números simples) |
| Plataformes | Polígons a l'elevació de la plataforma | `NAME`, `ELEV`, `AREA` |
| Línies de tall | Línies amb elevacions (plataformes i corredors) | `NAME` |
| Línies característiques del corredor | Línies amb elevacions: eix, vores de calçada, arcens | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Canonades | Línies de la solera superior a la inferior | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (per cent), `LENGTH`, `NETWORK` |
| Estructures | Punts a la tapa | `NAME`, `RIM`, `INVERT` (la solera de canonada més baixa), `SUMP`, `DIA`, `DIA_UNIT` |
| Cada capa SIG | Tal com s'ha importat | Els seus propis camps |

Les longituds, els punts quilomètrics i les elevacions són en les unitats del projecte (peus de topografia dels EUA, US survey feet, o metres). Els diàmetres de canonades i estructures són en polzades per als projectes en peus i en mil·límetres per als projectes en metres; `DIA_UNIT` indica quin.

## Els formats

- **Shapefile**: un `.zip` amb un shapefile per tipus (`.shp`, `.shx`, `.dbf`), un `.cpg` que indica que el text és UTF-8, i un `.prj` que anomena el sistema de coordenades. Les formes amb elevacions s'escriuen com als tipus Z del shapefile. Els noms de camp de més de 10 caràcters s'escurcen, tal com exigeix el format, i la línia d'estat els enumera.
- **GeoPackage**: un fitxer `.gpkg` amb una taula per tipus, i el sistema de coordenades desat amb el seu codi EPSG. Un sol fitxer en lloc de molts, amb els noms de camp llargs conservats.
- **KML** o **KMZ** (KML comprimit): un fitxer de latitud i longitud per a Google Earth i mapes web, una carpeta per tipus, i cada element és un marcador (placemark) amb el nom del camp NAME i tots els camps com a dades esteses; alçades en metres (mode d'altitud absoluta). Com el GeoJSON, necessita el sistema de coordenades del projecte.
- **GeoJSON**: un fitxer de latitud i longitud (l'estàndard GeoJSON no permet res més) amb cada element que porta una propietat `kind` (`pipes`, `structures`, …) perquè el receptor els pugui separar. Les alçades es converteixen a metres, tal com demana l'estàndard; es mantenen en el datum vertical del projecte (CivilCraft no té model de geoide). Un projecte sense sistema de coordenades no pot exportar GeoJSON, i el diàleg n'explica el motiu.

## Quadrícula, no terreny

Els departaments de SIG guarden les dades en coordenades **de quadrícula** d'un sistema de coordenades. Si el projecte usa coordenades de terreny o locals (definides a {{ui:Coordenades}}), cada coordenada es torna a convertir a quadrícula en sortir: els números dels fitxers difereixen dels del plànol pel factor d'escala (i per la rotació, en un sistema local). Els camps de punt `N` i `E` també tenen els valors de quadrícula. El diàleg ho recorda.

:::tip
Envieu una nota curta amb els fitxers: el sistema de coordenades i el seu codi EPSG, el datum vertical de les vostres elevacions, les unitats, i què és cada fitxer.
:::

## Què s'ha comprovat

- Cada fitxer escrit s'ha tornat a llegir amb GDAL, la biblioteca que usen la majoria de programes SIG per llegir aquests fitxers: cada forma, elevació i atribut, els recomptes d'elements, i el sistema de coordenades com a codi EPSG (`.prj` i GeoPackage). Els nostres propis lectors els llegeixen igual.
- Els fitxers GeoJSON segueixen RFC 7946: primer la longitud i després la latitud, sense membre `crs`, els anells exteriors en sentit antihorari i els forats en sentit horari; les posicions coincidien amb PROJ a 2 mm.
- S'ha exportat un projecte amb coordenades de terreny i s'ha comprovat cada punt amb les seves coordenades de quadrícula.
- Encara no s'ha obert res d'això en altres programes SIG. Comproveu la primera entrega amb el departament abans de confiar-hi.
