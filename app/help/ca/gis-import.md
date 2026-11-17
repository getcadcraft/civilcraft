---
title: Importa dades SIG
summary: Porta shapefiles, GeoJSON i GeoPackages a un projecte com a capes SIG, situa-les pel sistema de coordenades correcte, mira'n els atributs i usa-les per a la superfície.
keywords: sig, etiquetes, etiqueta elements, atributs al plànol, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importa, capes, atributs, sistema de coordenades, epsg, latitud, longitud, corbes de nivell, parcel·les, línies de ruptura, límit
from: f6b235cc
---

Els departaments municipals i comarcals de SIG faciliten el context del lloc com a fitxers SIG: parcel·les, servituds, corbes de nivell, serveis, punts de control topogràfic. CivilCraft n'obre tres tipus com a **capes SIG** que se situen sota el disseny al plànol.

| Fitxer | Què obrir |
|---|---|
| Shapefile | El `.shp` amb el seu `.shx`, `.dbf`, `.prj` i `.cpg` (seleccioneu-los tots), o el `.zip` on venien. Un zip amb diversos shapefiles dona diverses capes. |
| GeoJSON | El fitxer `.geojson` (també funciona un `.json` les primeres línies del qual diuen `FeatureCollection` o `Feature`). |
| GeoPackage | El fitxer `.gpkg`. Es llista cada taula d'elements que conté. |
| KML o KMZ | El fitxer `.kml` (de Google Earth o d'un mapa web), o el `.kmz` comprimit. Cada carpeta esdevé una capa (es divideix en punts, línies i polígons quan en té de diversos tipus); el nom, la descripció i les dades esteses d'un marcador esdevenen els seus atributs. Les alçades són en metres i en latitud i longitud, com al GeoJSON. |

Es llegeixen punts, multipunts, línies, polígons amb forats i formes de diverses parts, amb les seves elevacions (z) quan el fitxer les té. Els valors de mesura (M) s'exclouen. Les graelles d'elevacions i el LiDAR s'obren de la mateixa manera: vegeu [Graelles d'elevacions i LiDAR](topic:elevation-grids-and-lidar).

## Obriu els fitxers

1. Feu clic a {{ui:Importa}} al grup **SIG** (o a {{ui:Obre}}), trieu els fitxers, o deixeu-los sobre el plànol. Els fitxers es llegeixen en aquest ordinador; no es puja res.
2. El diàleg **Importa dades SIG** llista cada capa trobada: el tipus, quants elements té (i quants no tenen geometria), quants camps d'atributs i el sistema de coordenades que indica el fitxer. Desmarqueu les capes que no voleu.
3. Llegiu la part **Sistema de coordenades** (més avall) i la línia **Què passarà**, i després feu clic a {{ui:Importa}}.
4. Les capes apareixen al plànol i sota **Capes SIG** al panell de l'esquerra. La importació és un sol pas: {{key:Mod+Z}} la desfà.

Un fitxer gran mostra una línia de progrés sobre el plànol amb un botó {{ui:Cancel·la}}.

## El sistema de coordenades

Els fitxers SIG diuen on són a través d'un sistema de coordenades (el `.prj` d'un shapefile, o la taula de referència espacial d'un GeoPackage; el GeoJSON és sempre latitud i longitud). CivilCraft converteix cada capa del seu propi sistema al del projecte. Mai no endevina:

- **El projecte té un sistema de coordenades** (definit a {{ui:Coordenades}}): cada capa amb un sistema propi es converteix a aquest, incloent-hi un ajust de terreny o local. Un fitxer sense `.prj` ofereix dues opcions: **Igual que el projecte** (els números es carreguen tal com són) o **Escull el sistema del fitxer**.
- **El projecte no en té, i el fitxer és en un sistema projectat amb les unitats del projecte** (una zona de projecció estatal en peus de topografia dels EUA per a un projecte en peus, per exemple): el diàleg ofereix **Usa aquest sistema com a sistema de coordenades del projecte**. Es defineix en el mateix pas de desfer que la importació. No es mou res del projecte; el sistema només indica què volen dir els números. Podeu escollir un altre sistema per al projecte, i les capes es convertiran a aquest.
- **El projecte no en té, i el fitxer és en latitud i longitud** (tots els GeoJSON) **o en altres unitats**: {{ui:Importa}} queda en gris fins que trieu el sistema de coordenades del projecte. El selector comença a prop de les dades.
- **Ni el projecte ni els fitxers no diuen cap sistema**: els números es carreguen tal com són, i el diàleg ho diu.

Les elevacions també es converteixen: les alçades del GeoJSON són en metres (l'estàndard GeoJSON ho diu); les alçades de la resta de fitxers es prenen en la unitat del seu propi sistema.

:::warning
Les posicions d'un fitxer GeoJSON fora de ±180° de longitud o ±90° de latitud no són latitud i longitud. Aquests elements es deixen fora i el diàleg indica quants són. Un fitxer així sol ser un fitxer projectat desat sense el seu sistema; demaneu-lo de nou, o demaneu el shapefile amb el seu `.prj`.
:::

NAD83 es tracta com a igual que WGS 84 (el sistema que usa GeoJSON); els dos difereixen en uns quants metres a Amèrica del Nord, de manera que les dades GeoJSON poden estar desplaçades aquesta quantitat. Quan el millor desplaçament necessita un fitxer de graella (NADCON per a NAD27, per exemple), CivilCraft usa un desplaçament aproximat publicat, i el diàleg del sistema de coordenades mostra com n'és d'aproximat (per a NAD27, uns 20 m), fins que afegiu la graella: vegeu [Fitxers de desplaçament de quadrícula](topic:coordinate-systems).

## Capes SIG

Cada fila sota **Capes SIG** té:

- una casella per mostrar o amagar la capa (les capes amagades tampoc no es trien);
- el seu color, escollit de la llista;
- un menú (els tres punts) amb {{ui:Amplia fins a}}, {{ui:Usa per al terreny…}}, {{ui:Canvia el nom…}} i {{ui:Elimina}}.

Mostrar, amagar, recolorar, canviar el nom i eliminar són passos de desfer. Les capes SIG es desen al fitxer del projecte i tornen en obrir-lo. També surten amb el traçat en PDF del plànol i a les exportacions DXF i DWG, cadascuna en una capa anomenada `GIS-` i el seu número.

## Etiqueta els elements amb un atribut

Al menú {{ui:Més}} de la capa (els tres punts de **Capes SIG**), trieu un camp sota **Etiqueta amb**: cada element mostra el seu valor al plànol, en el color de la capa. Els punts s'etiqueten al costat del punt, les línies al mig de la seva part més llarga (girades perquè es llegeixin d'esquerra a dreta), i els polígons al centre. Els números mostren fins a tres decimals. Les etiquetes fan 1.8 mm d'alçada sobre paper a qualsevol escala, i van al traçat PDF, DXF i DWG. Trieu **Sense etiquetes** per treure-les; cada canvi és un pas (es desfà amb {{key:Mod+Z}}). Una capa etiqueta com a màxim 5,000 elements.

## Mireu un element

Amb {{ui:Selecciona}} activat, feu clic a un element. **Propietats** mostra la seva capa, quin element és, la forma (parts, forats, vèrtexs), les seves elevacions, el fitxer del qual prové i el sistema de coordenades d'aquest fitxer, i després tots els atributs en una taula. Els atributs són només de lectura: CivilCraft mostra les dades SIG tal com venen, no les edita.

Quan hi ha punts i línies sota el punter, guanyen els punts; dins d'un polígon se selecciona el més petit.

## Usa per al terreny

Obriu el menú d'una capa i trieu {{ui:Usa per al terreny…}} (o el botó de **Propietats**). El que s'ofereix depèn de la capa:

| Capa | Pot esdevenir |
|---|---|
| Línies amb elevacions (línies 3D) | Línies de ruptura a les seves pròpies elevacions |
| Línies sense elevacions però amb un camp numèric (corbes de nivell) | Línies de ruptura a l'elevació del camp que trieu |
| Polígons | El límit de la superfície (el polígon seleccionat, si no, el més gran), o línies de ruptura al llarg de les seves vores |
| Punts amb elevacions, o amb un camp d'elevació | Punts topogràfics, descrits amb el nom de la capa perquè formin un grup de punts |

Cada ús és un pas de desfer que copia la geometria al projecte; la capa en si queda com estava. Les elevacions es prenen en les unitats del projecte.

## Fitxers de punts amb latitud i longitud

Un fitxer de punts la capçalera del qual nomena les columnes **latitude** i **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) es llegeix com a graus, no com a nord i est. El diàleg d'importació ho diu. En fer clic a {{ui:Importa}}, els punts es converteixen al sistema de coordenades del projecte; un projecte sense sistema us demana que el trieu primer. Els graus mai es carreguen com a peus. Les files fora de ±90° de latitud o ±180° de longitud es refusen, amb el motiu. La columna d'elevació es pren tal com és, en unitats del projecte.

## Fitxers LandXML que indiquen un sistema de coordenades

Quan un fitxer LandXML que obriu té un element `CoordinateSystem` (un codi EPSG, una descripció WKT o un nom de sistema), CivilCraft el proposa com a sistema de coordenades del projecte. Si l'accepteu, no es mou res; el sistema només indica què volen dir els números.

## Què s'ha comprovat

- Cada lector s'ha comparat amb GDAL, la biblioteca que usen la majoria de programes SIG per llegir aquests fitxers, amb fitxers que GDAL ha escrit: shapefiles de tots els tipus amb i sense elevacions, línies de diverses parts, polígons amb forats, geometries buides, atributs de text, número, data i vertader/fals, text UTF-8 i Windows-1252 amb i sense `.cpg`, un zip de diversos shapefiles, GeoJSON de tots els tipus de geometria, i un GeoPackage amb quatre taules. Cada geometria, elevació i atribut coincidia.
- Les posicions convertides des de latitud i longitud, i des d'UTM, coincidien amb PROJ (la biblioteca de projeccions darrere de GDAL) a 3 mm.
- Els fitxers danyats (tallats, amb mides falses, zips dolents, GeoPackages dolents) donen un únic missatge simple; res no es queda penjat.
- Res d'això no s'ha obert encara en altres programes SIG, i les geobases de fitxer, el KML i el KMZ encara no es llegeixen (vegeu [Encara no implementat](topic:not-built-yet)).
