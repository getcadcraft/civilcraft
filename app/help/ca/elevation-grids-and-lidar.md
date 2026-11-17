---
title: Graelles d'elevació i LiDAR
summary: Construeix el terreny existent a partir d'un DEM (GeoTIFF o graella ASCII) o de punts LiDAR (LAS, LAZ): trieu l'àrea, clarejeu les dades, escolliu les classes i comproveu les unitats d'elevació, i torneu una superfície com a graella d'elevació GeoTIFF.
keywords: dem, dtm, graella d'elevació, geotiff, tif, graella ascii, asc, lidar, las, laz, núvol de punts, classes, terreny, clarejat, nodata, ràster, exporta geotiff, gis
from: c8b2d18a
---

Les dades d'elevació públiques arriben de dues maneres: **graelles d'elevació** (un DEM: una elevació per cada cel·la quadrada, normalment un GeoTIFF `.tif` o una graella ASCII `.asc`) i **punts LiDAR** (milions de retorns làser en un fitxer `.las`, o `.laz` si és comprimit). CivilCraft converteix qualsevol dels dos en punts topogràfics o en una superfície, dins del navegador: no es puja res.

## Obre el fitxer

1. Feu clic a {{ui:Obre}} (o a {{ui:Importa}} al grup **GIS**) i trieu el fitxer, o arrossegueu-lo al plànol. Per a una graella ASCII, trieu també el seu fitxer `.prj`, perquè CivilCraft conegui el seu sistema de coordenades.
2. El diàleg d'importació mostra el que el fitxer diu de si mateix: la mida, les cel·les o els punts, el sistema de coordenades, on és en latitud i longitud, i el rang d'elevació. Per al LiDAR, primer llegeix cada punt una vegada per comptar les **classes** (una barra de progrés indica com va; {{ui:Cancel·la}} l'atura).

Un GeoTIFF amb tres o quatre bandes (vermell, verd, blau) és una imatge, no elevacions: va a les capes de mapa.

## Trieu què importar

- **Àrea**: {{ui:L'extensió del projecte i un marge}} (escriviu el marge), {{ui:El que mostra ara el plànol}}, o {{ui:Tot el fitxer}}. Només es llegeix aquesta part del fitxer.
- **Clareja a**: l'espaiat entre els punts que obteniu, en les unitats del projecte. La línia sota la configuració mostra quants punts dona mentre escriviu. Per a una graella, CivilCraft manté cada segona, tercera… cel·la, de manera que les elevacions es mantenen exactament les del fitxer; mai no en fa mitjanes. Per al LiDAR, l'àrea es divideix en quadrats d'aquesta mida i es manté un punt per quadrat: {{ui:El punt més proper al centre de cada cel·la}} (el predeterminat), {{ui:El punt més baix de cada cel·la}} (bo quan el fitxer no té classe de terreny: el terreny és sota els arbres) o {{ui:La mitjana dels punts de cada cel·la}}.
- **Classes** (LiDAR): el terreny (classe 2) queda marcat quan el fitxer el té; els edificis, els arbres i el soroll queden fora. Quan no hi ha classe de terreny, es marquen totes les classes i el diàleg ho diu.
- **Terreny** (LiDAR, 0.8): un núvol de drone no té classe de terreny. Quan el fitxer no en té, el diàleg comença amb {{ui:Trobo jo el terreny (núvols de drone, sense classe de terreny)}}: es llegeixen totes les classes excepte el soroll, es manté el punt més baix de cada cel·la, i després CivilCraft treu els edificis, els arbres i els punts baixos aïllats amb un filtre morfològic progressiu (Zhang i altres, 2003) que podeu ajustar: **Objecte més gran a treure** (l'amplada de l'edifici més gran; les finestres creixen fins que el cobreixen; 0 vol dir 20 cel·les) i **Pendent més pronunciat del terreny**. El treball es fa sobre la graella de punts més baixos, de manera que un núvol de desenes de milions de punts no costa més que el nombre de cel·les (el clarejat és un sol pas en flux). L'espaiat és la cel·la: una de més gran és més ràpida i perd menys objectes petits del que caldria esperar; una de més fina conserva més detall del terreny. L'informe diu quants punts s'han mantingut com a terreny, quantes cel·les s'han tret com a objectes i quants punts baixos aïllats s'han descartat. En un estudi de drone de 300 m inventat amb cinc edificis, 70 arbres i 200 punts baixos aïllats, els punts mantinguts estaven dins de 3 cm del terreny real i no es va mantenir cap coberta ni capçada.
- **Elevacions del fitxer**: metres, peus o peus d'agrimensura dels EUA. Quan el fitxer ho diu, la unitat ja està triada. Quan no ho diu, cal triar-la: el diàleg mostra el rang d'elevació en ambdues unitats perquè pugueu veure quina té sentit per al lloc.
- **Importa com a** (només graelles): {{ui:Punts topogràfics (DEM de descripció)}}, o {{ui:La superfície en si (una graella de triangles)}}.

Una importació admet com a màxim 500,000 punts. Quan una elecció en donaria més, el diàleg diu en quant i quin espaiat cabria, i {{ui:Importa}} queda desactivat.

Feu clic a {{ui:Importa}}. Una barra de progrés mostra la lectura; {{ui:Cancel·la}} l'atura i no es canvia res.

:::warning
Les unitats verticals són una trampa habitual. Molts DEM de planes estatals tenen coordenades est i nord en peus però elevacions en metres. Compareu el rang que mostra el diàleg amb el que sabeu del lloc.
:::

## Què obteniu

- **Punts topogràfics**: numerats a continuació del vostre número de punt més alt, amb la descripció `DEM` (graelles) o `LIDAR`, de manera que formen un sol grup de punts sota **Punts** i construeixen la superfície com qualsevol altre punt. Importar-los és un sol pas: {{key:Mod+Z}} els treu de nou.
- **La superfície en si**: un TIN de graella, dos triangles per cel·la, dividits per la diagonal sud-oest a nord-est. Un triangle amb un vèrtex sense dades queda fora, de manera que els forats de les dades es mantenen com a forats. La superfície coincideix amb la graella a cada punt de la graella i és un pla pla dins de cada triangle entre ells. Substitueix la superfície del projecte (el diàleg pregunta abans); {{key:Mod+Z}} torna a posar l'anterior. El títol del panell de l'esquerra diu **Superfície (a partir d'una graella d'elevació)**.

## Sistemes de coordenades

- Si el projecte té un sistema de coordenades i el fitxer n'indica un altre, cada punt es converteix al sistema del projecte (i a les seves coordenades de terreny o locals quan en té).
- Si el projecte no en té i el sistema del fitxer està en les unitats del projecte (peus o metres), el diàleg ofereix fer-lo el sistema de coordenades del projecte, en el mateix pas de desfer que els punts.
- Si el fitxer està en latitud i longitud, o en metres per a un projecte en peus, el diàleg us demana que primer trieu el sistema de coordenades del projecte.
- Si el fitxer no ho diu, els seus números es prenen com a coordenades del projecte. Podeu triar el sistema del fitxer en lloc d'això.

## Exporta una superfície com a GeoTIFF

1. Feu clic a {{ui:Exporta}} al grup **GIS**.
2. A la part GeoTIFF, trieu la superfície (terreny existent o la superfície explanada) i la mida de cel·la. El valor per defecte surt de la mitjana de l'aresta dels triangles de la superfície. El diàleg mostra la mida de la graella que escriurà.
3. Feu clic a {{ui:Baixa el GeoTIFF}}.

El fitxer és una banda d'elevacions de coma flotant de 32 bits en les unitats del projecte, sobre l'extensió de la superfície; les cel·les fora de la superfície són "sense dades" (−3.4028235e38). El valor de cada cel·la és l'elevació de la superfície al centre de la cel·la. Les coordenades són **de graella**: un projecte en coordenades de terreny o locals es converteix de nou a la graella. El fitxer indica el sistema de coordenades del projecte pel seu codi EPSG; un sistema sense codi EPSG no s'escriu, i el diàleg us avisa que digueu al departament de GIS quin sistema és.

## Què s'ha comprovat

- Els lectors de GeoTIFF i de graella ASCII s'han comprovat amb GDAL (a través de rasterio), la biblioteca que fan servir la majoria de programes GIS per llegir aquests fitxers: graelles de coma flotant de 32 bits i enteres de 16 bits, en mosaic i en franges, DEFLATE i LZW, nodata, escala i desplaçament, pixel-is-point, una graella UTM, una graella de plana estatal en peus d'agrimensura dels EUA i una graella de latitud/longitud: cada valor és igual.
- Els lectors de LAS i LAZ s'han comprovat amb laspy: LAS 1.2 i 1.4, formats de punt 0, 1, 3, 6, 7 i 8, amb i sense sistema de coordenades, i LAZ escrit pel seu backend compatible amb LASzip: cada punt és igual.
- Les coordenades convertides s'han comprovat amb PROJ fins a 1 mm.
- Els GeoTIFF exportats s'han llegit de nou amb GDAL: sistema de coordenades, posicions de cel·la, nodata, unitats, i valors iguals a la superfície fins a 0.0001.
- Res d'això no s'ha obert encara en altres programes GIS o CAD.

## Encara no implementat

- Canvis de datum vertical (models de geoide): les elevacions s'usen tal com les té el fitxer.
- Dades de forma d'ona, retorns LiDAR diferents de la classe, colors i intensitats.
- Diverses bandes, visions generals (overviews), o fitxers de més de 200 MB.
- Escriure LAS o LAZ a partir d'una superfície o d'aquesta eina (el complement [Núvols de punts](topic:point-clouds) escriu un núvol netejat com a LAS 1.4 o LAZ).
