---
title: Uvezi GIS podatke
summary: Uvezite shapefileove, GeoJSON i GeoPackage u projekt kao GIS slojeve, smjestite ih kroz pravi koordinatni sustav, pogledajte njihove atribute i upotrijebite ih za teren.
keywords: gis, oznake, oznake značajki, atributi na tlocrtu, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, uvoz, slojevi, atributi, koordinatni sustav, epsg, zemljopisna širina, zemljopisna dužina, izohipse, parcele, prijelomnice, granica
from: f6b235cc
---

Gradski i županijski GIS odjeli dijele kontekst lokacije kao GIS datoteke: parcele, služnosti, izohipse, komunalne instalacije, geodetske kontrolne točke. CivilCraft otvara tri vrste tih datoteka kao **GIS slojeve** koji leže ispod vašeg projekta na tlocrtu.

| Datoteka | Što otvoriti |
|---|---|
| Shapefile | `.shp` zajedno sa svojim `.shx`, `.dbf`, `.prj` i `.cpg` (odaberite ih sve), ili `.zip` u kojem su stigli. Zip s više shapefilea daje više slojeva. |
| GeoJSON | Datoteku `.geojson` (datoteka `.json` čiji prvi redci kažu `FeatureCollection` ili `Feature` također radi). |
| GeoPackage | Datoteku `.gpkg`. Navodi se svaka tablica značajki u njoj. |
| KML ili KMZ | Datoteku `.kml` (iz Google Earth ili web karte), ili spakiranu `.kmz`. Svaka mapa postaje sloj (razdvaja se na točke, linije i poligone kad ih ima više vrsta); naziv, opis i prošireni podaci oznake postaju njezini atributi. Visine su u metrima, a zemljopisna širina i dužina kao u GeoJSON-u. |

Točke, višetočke, linije, poligoni s rupama i oblici s više dijelova se čitaju, s njihovim visinama (z) kad ih datoteka ima. Vrijednosti mjerenja (M) se izostavljaju. Mreže visina i LiDAR otvaraju se na isti način: vidi [Visinske mreže i LiDAR](topic:elevation-grids-and-lidar).

## Otvaranje datoteka

1. Kliknite {{ui:Uvezi}} u grupi **GIS** (ili {{ui:Otvori}}), odaberite datoteke ili ih ispustite na tlocrt. Datoteke se čitaju na ovom računalu; ništa se ne učitava na mrežu.
2. Dijalog **Uvoz GIS podataka** navodi svaki pronađeni sloj: njegovu vrstu, koliko ima značajki (i koliko ih nema geometriju), koliko ima polja atributa i koordinatni sustav koji datoteka navodi. Isključite slojeve koje ne želite.
3. Pročitajte dio **Koordinatni sustav** (u nastavku) i redak **Što će se dogoditi**, zatim kliknite {{ui:Uvezi}}.
4. Slojevi se pojavljuju na tlocrtu i pod **GIS slojevi** u lijevoj ploči. Uvoz je jedan korak: {{key:Mod+Z}} ga poništava.

Velika datoteka prikazuje redak napretka preko tlocrta s gumbom {{ui:Odustani}}.

## Koordinatni sustav

GIS datoteke navode gdje se nalaze preko koordinatnog sustava (`.prj` shapefilea, tablica prostornih referenci GeoPackage-a; GeoJSON je uvijek zemljopisna širina i dužina). CivilCraft pretvara svaki sloj iz njegova vlastitog sustava u sustav projekta. Nikad ne pogađa:

- **Projekt ima koordinatni sustav** (postavljen u {{ui:Koordinate}}): svaki sloj s vlastitim sustavom pretvara se u njega, uključujući prilagodbu tla ili lokalnu. Datoteka bez `.prj` dobiva dva izbora: **Isto kao projekt** (njezini se brojevi učitavaju kakvi jesu) ili **Odaberi sustav datoteke**.
- **Projekt nema sustav, a datoteka je u projiciranom sustavu u jedinicama vašeg projekta** (zona državne ravnine u američkim geodetskim stopama za projekt u stopama, na primjer): dijalog nudi **Upotrijebi taj sustav kao koordinatni sustav projekta**. Postavlja se u istom koraku poništavanja kao uvoz. Ništa u projektu se ne pomiče; sustav samo kaže što brojevi znače. Umjesto toga možete odabrati drugi sustav za projekt, pa se slojevi pretvaraju u njega.
- **Projekt nema sustav, a datoteka je u zemljopisnoj širini i dužini** (svaki GeoJSON) **ili u drugim jedinicama**: {{ui:Uvezi}} ostaje zasivljen dok ne odaberete koordinatni sustav projekta. Birač počinje blizu podataka.
- **Ni projekt ni datoteke ne navode sustav**: brojevi se učitavaju kakvi jesu, a dijalog to kaže.

Visine se također pretvaraju: visine GeoJSON-a su u metrima (tako kaže GeoJSON standard); visine ostalih datoteka uzimaju se u jedinici njihova vlastitog sustava.

:::warning
Položaji u GeoJSON datoteci izvan ±180° zemljopisne dužine ili ±90° širine nisu zemljopisna širina i dužina. Te se značajke izostavljaju, a dijalog kaže koliko ih je. Takva datoteka je obično projicirana datoteka spremljena bez svog sustava; zatražite je ponovno ili zatražite shapefile s njegovim `.prj`.
:::

NAD83 se tretira kao isto što i WGS 84 (sustav koji GeoJSON koristi); njih dvije razlikuju se za nekoliko metara u Sjevernoj Americi, pa podaci GeoJSON mogu biti pomaknuti za toliko. Gdje najbolji pomak treba datoteku mreže (NADCON za NAD27, na primjer), CivilCraft koristi grublji objavljeni pomak, a dijalog koordinatnog sustava pokazuje koliko je grub (za NAD27 oko 20 m), dok ne dodate mrežu: vidi [Datoteke pomaka mreže](topic:coordinate-systems).

## GIS slojevi

Svaki redak pod **GIS slojevi** ima:

- potvrdni okvir za prikaz ili skrivanje sloja (skriveni slojevi se također ne biraju);
- njegovu boju, odabranu s popisa;
- izbornik (tri točkice) s {{ui:Zumiraj na}}, {{ui:Koristi za teren…}}, {{ui:Preimenuj…}} i {{ui:Ukloni}}.

Prikaz, skrivanje, promjena boje, preimenovanje i uklanjanje su koraci poništavanja. GIS slojevi se spremaju u datoteku projekta i vraćaju se kad je otvorite. Također idu u PDF ispis tlocrta te u DXF i DWG izvoze, svaki na sloju imenovanom `GIS-` i njegovim brojem.

## Oznake značajki iz atributa

U izborniku {{ui:Više}} sloja (tri točkice pod **GIS slojevi**) odaberite polje pod **Označi s**: svaka značajka prikazuje svoju vrijednost na tlocrtu, u boji sloja. Točke se označavaju pokraj točke, linije duž sredine njihova najdužeg dijela (okrenute da se čitaju slijeva nadesno), a poligoni u svom središtu. Brojevi se prikazuju s najviše tri decimale. Oznake su visoke 1.8 mm na papiru pri bilo kojem mjerilu i idu u PDF ispis, DXF i DWG. Odaberite **Bez oznaka** da ih uklonite; svaka promjena je jedan korak ({{key:Mod+Z}} je poništava). Sloj označava najviše 5,000 značajki.

## Pogledajte značajku

Uz uključen {{ui:Odaberi}}, kliknite značajku. **Svojstva** pokazuju njezin sloj, koja je to značajka, njezin oblik (dijelovi, rupe, vrhovi), njezine visine, datoteku iz koje dolazi i koordinatni sustav te datoteke, zatim svaki atribut u tablici. Atributi su samo za čitanje: CivilCraft prikazuje GIS podatke kakvi su došli, ne uređuje ih.

Kad su točka i linija pod pokazivačem istovremeno, pobjeđuje točka; unutar poligona bira se najmanji poligon.

## Upotreba za teren

Otvorite izbornik sloja i odaberite {{ui:Koristi za teren…}} (ili gumb u **Svojstvima**). Što se nudi ovisi o sloju:

| Sloj | Može postati |
|---|---|
| Linije s visinama (3D linije) | Prijelomnice na svojim visinama |
| Linije bez visina, ali s brojčanim poljem (izohipse) | Prijelomnice na visini iz polja koje odaberete |
| Poligoni | Granica terena (odabrani poligon, inače najveći), ili prijelomnice duž njihovih rubova |
| Točke s visinama, ili s poljem visine | Geodetske točke, opisane nazivom sloja da tvore skupinu točaka |

Svaka upotreba je jedan korak poništavanja i kopira geometriju u projekt; sam sloj ostaje kakav je. Visine se uzimaju u jedinicama projekta.

## Datoteke točaka sa zemljopisnom širinom i dužinom

Datoteka točaka čije zaglavlje navodi stupce **latitude** i **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) čita se kao stupnjevi, a ne kao sjever i istok. Dijalog uvoza to kaže. Pri {{ui:Uvezi}} točke se pretvaraju u koordinatni sustav projekta; projekt bez njega traži da ga prvo odaberete. Stupnjevi se nikad ne učitavaju kao stope. Redci izvan ±90° širine ili ±180° dužine odbijaju se uz razlog. Stupac visine uzima se kakav je, u jedinicama projekta.

## LandXML datoteke koje navode koordinatni sustav

Kad LandXML datoteka koju otvorite ima element `CoordinateSystem` (EPSG kod, WKT opis ili naziv sustava), CivilCraft ga nudi kao koordinatni sustav projekta. Ništa se ne pomiče ako prihvatite; sustav samo kaže što brojevi znače.

## Što je provjereno

- Svaki čitač uspoređen je s GDAL-om, bibliotekom koju koristi većina GIS programa, na datotekama koje je GDAL napisao: shapefilei svake vrste s visinama i bez njih, linije s više dijelova, poligoni s rupama, prazne geometrije, tekstualni, brojčani, datumski i true/false atributi, UTF-8 i Windows-1252 tekst sa `.cpg` i bez njega, zip s više shapefilea, GeoJSON sa svakom vrstom geometrije te GeoPackage s četiri tablice. Svaka geometrija, visina i atribut su se podudarali.
- Položaji pretvoreni iz zemljopisne širine i dužine te iz UTM-a podudarali su se s PROJ-om (bibliotekom projekcija iza GDAL-a) do 3 mm.
- Oštećene datoteke (odrezane, s lažnim veličinama, neispravni zipovi, neispravni GeoPackage) daju jednu običnu poruku; ništa se ne zaglavi.
- Ništa ovdje još nije otvoreno u drugim GIS programima, a datoteke geobaze (file geodatabases), KML i KMZ još se ne čitaju (vidi [Još nije izrađeno](topic:not-built-yet)).
