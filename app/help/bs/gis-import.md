---
title: Uvezi GIS podatke
summary: Uvezi shapefile, GeoJSON i GeoPackage u projekt kao GIS slojeve, postavi ih kroz pravi koordinatni sistem, pogledaj njihove atribute i koristi ih za površ.
keywords: gis, oznake, označi objekte, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, uvoz, slojevi, atributi, koordinatni sistem, epsg, geografska širina, geografska dužina, izohipse, parcele, prijelomne linije, granica
from: f6b235cc
---

Službe za GIS gradova i općina daju kontekst lokacije kao GIS datoteke: parcele, služnosti, izohipse, komunalne instalacije, premjerne tačke. CivilCraft otvara tri vrste kao **GIS slojeve** koji stoje ispod tvog projekta na planu.

| Datoteka | Šta otvoriti |
|---|---|
| Shapefile | `.shp` zajedno sa `.shx`, `.dbf`, `.prj` i `.cpg` (odaberi sve), ili `.zip` u kojem su stigle. Zip sa više shapefile-ova daje više slojeva. |
| GeoJSON | Datoteka `.geojson` (i `.json` datoteka čiji prvi redovi kažu `FeatureCollection` ili `Feature` također radi). |
| GeoPackage | Datoteka `.gpkg`. Navedena je svaka tabela objekata u njoj. |
| KML ili KMZ | Datoteka `.kml` (iz Google Earth-a ili web karte), ili zapakovana `.kmz`. Svaki folder postaje sloj (razdvaja se na tačke, linije i poligone kad sadrži više vrsta); ime oznake, opis i prošireni podaci postaju njeni atributi. Visine su u metrima, a geografska širina i dužina kao kod GeoJSON-a. |

Tačke, multitačke, linije, poligoni sa rupama i višedijelni oblici se čitaju, sa svojim kotama (z) kad ih datoteka ima. Vrijednosti mjere (M) se izostavljaju. Mreže kota i LiDAR se otvaraju na isti način: vidi [Mreže kota i LiDAR](topic:elevation-grids-and-lidar).

## Otvaranje datoteka

1. Klikni {{ui:Uvezi}} u grupi **GIS** (ili {{ui:Otvori}}), odaberi datoteke, ili ih prevuci na plan. Datoteke se čitaju na ovom računaru; ništa se ne šalje.
2. Dijalog **Uvoz GIS podataka** navodi svaki pronađeni sloj: vrstu, koliko objekata (i koliko nema geometriju), koliko polja atributa, i koordinatni sistem koji datoteka navodi. Odznači slojeve koje ne želiš.
3. Pročitaj dio **Koordinatni sistem** (dolje) i liniju **Šta će se desiti**, pa klikni {{ui:Uvezi}}.
4. Slojevi se pojavljuju na planu i pod **GIS slojevi** u lijevom panelu. Uvoz je jedan korak: {{key:Mod+Z}} ga vraća.

Velika datoteka prikazuje liniju napretka preko plana sa dugmetom {{ui:Otkaži}}.

## Koordinatni sistem

GIS datoteke kažu gdje se nalaze preko koordinatnog sistema (`.prj` shapefile-a, tabela prostornih referenci GeoPackage-a; GeoJSON je uvijek geografska širina i dužina). CivilCraft pretvara svaki sloj iz njegovog sistema u sistem projekta. Nikad ne pogađa:

- **Projekt ima koordinatni sistem** (postavljen u {{ui:Koordinate}}): svaki sloj sa vlastitim sistemom se pretvara u njega, uključujući korekciju terena ili lokalnu. Datoteka bez `.prj` dobija dva izbora: **Isto kao projekt** (njeni brojevi se učitavaju kakvi jesu) ili **Odaberi sistem datoteke**.
- **Projekt nema sistem, a datoteka je u projektovanom sistemu u jedinicama tvog projekta** (zona State Plane u US survey stopama za projekt u stopama, na primjer): dijalog nudi **Koristi taj sistem kao koordinatni sistem projekta**. Postavlja se u istom koraku poništavanja kao uvoz. Ništa u projektu se ne pomjera; sistem samo kaže šta brojevi znače. Umjesto toga možeš odabrati drugi sistem za projekt, a slojevi se pretvaraju u njega.
- **Projekt nema sistem, a datoteka je u geografskoj širini i dužini** (svaki GeoJSON) **ili u drugim jedinicama**: {{ui:Uvezi}} ostaje zasivljeno dok ne odabereš koordinatni sistem projekta. Birač počinje blizu podataka.
- **Ni projekt ni datoteke ne navode sistem**: brojevi se učitavaju kakvi jesu, a dijalog to kaže.

Kote se također pretvaraju: visine GeoJSON-a su u metrima (tako kaže GeoJSON standard); visine drugih datoteka uzimaju se u jedinici njihovog sistema.

:::warning
Pozicije u GeoJSON datoteci izvan ±180° geografske dužine ili ±90° geografske širine nisu geografska širina i dužina. Ti objekti se izostavljaju, a dijalog kaže koliko ih je. Takva datoteka je obično projektovana datoteka sačuvana bez svog sistema; zatraži je ponovo, ili shapefile sa njegovim `.prj`.
:::

NAD83 se tretira isto kao WGS 84 (sistem koji GeoJSON koristi); njih dvoje se razlikuju za nekoliko metara u Sjevernoj Americi, pa GeoJSON podaci mogu biti udaljeni toliko. Gdje najbolji pomak traži datoteku mreže (NADCON za NAD27, na primjer), CivilCraft koristi grublji objavljeni pomak, a dijalog koordinatnog sistema pokazuje koliko je grub (za NAD27, oko 20 m), dok ne dodaš mrežu: vidi [Datoteke pomaka mreže](topic:coordinate-systems).

## GIS slojevi

Svaki red pod **GIS slojevi** ima:

- potvrdni okvir za prikazivanje ili skrivanje sloja (skriveni slojevi se ne biraju);
- njegovu boju, odabranu sa spiska;
- meni (tri tačke) sa {{ui:Zumiraj na}}, {{ui:Koristi za površinu…}}, {{ui:Preimenuj…}} i {{ui:Ukloni}}.

Prikazivanje, skrivanje, promjena boje, preimenovanje i uklanjanje su koraci poništavanja. GIS slojevi se čuvaju u datoteci projekta i vraćaju se kad je otvoriš. Također idu u PDF plot plana i u DXF i DWG izvoze, svaki na sloju imenovanom `GIS-` i njegovim brojem.

## Oznake objekata po atributu

U meniju sloja {{ui:Više}} (tri tačke u **GIS slojevi**) odaberi polje pod **Označi sa**: svaki objekat prikazuje svoju vrijednost na planu, u boji sloja. Tačke su označene pored tačke, linije duž sredine njihovog najdužeg dijela (okrenute da se čitaju s lijeva na desno), poligoni u svom središtu. Brojevi se prikazuju do tri decimale. Oznake su visoke 1.8 mm na papiru, na svakoj razmjeri, i idu u PDF plot, DXF i DWG. Odaberi **Bez oznaka** da ih ukloniš; svaka promjena je jedan korak ({{key:Mod+Z}} to poništava). Sloj označava najviše 5,000 objekata.

## Pogledaj objekat

Uz uključen {{ui:Odaberi}}, klikni objekat. **Svojstva** pokazuju njegov sloj, koji je to objekat, njegov oblik (dijelovi, rupe, tjemena), njegove kote, datoteku iz koje dolazi i koordinatni sistem te datoteke, zatim svaki atribut u tabeli. Atributi su samo za čitanje: CivilCraft prikazuje GIS podatke kakvi su došli, ne uređuje ih.

Tačke imaju prednost nad linijama kad su obje pod pokazivačem; unutar poligona bira se najmanji poligon.

## Koristi za površinu

Otvori meni sloja i odaberi {{ui:Koristi za površinu…}} (ili dugme u **Svojstvima**). Šta se nudi zavisi od sloja:

| Sloj | Može postati |
|---|---|
| Linije sa kotama (3D linije) | Prijelomne linije na sopstvenim kotama |
| Linije bez kota, ali sa numeričkim poljem (izohipse) | Prijelomne linije na koti iz polja koje odabereš |
| Poligoni | Granica površi (odabrani poligon, inače najveći), ili prijelomne linije duž njihovih ivica |
| Tačke sa kotama, ili sa poljem kote | Tačke premjera, opisane imenom sloja da čine grupu tačaka |

Svaka upotreba je jedan korak poništavanja koji kopira geometriju u projekt; sam sloj ostaje kakav jeste. Kote se uzimaju u jedinicama projekta.

## Tačkaste datoteke sa geografskom širinom i dužinom

Datoteka tačaka čije zaglavlje imenuje kolone **latitude** i **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) čita se kao stepeni, a ne kao sjever i istok. Dijalog uvoza to kaže. Na {{ui:Uvezi}} se tačke pretvaraju u koordinatni sistem projekta; projekt bez njega prvo traži da ga odabereš. Stepeni se nikad ne učitavaju kao stope. Redovi izvan ±90° geografske širine ili ±180° geografske dužine se odbijaju, uz razlog. Kolona kota se uzima kakva jeste, u jedinicama projekta.

## LandXML datoteke koje navode koordinatni sistem

Kad LandXML datoteka koju otvaraš ima element `CoordinateSystem` (EPSG kod, WKT opis ili ime sistema), CivilCraft ga nudi kao koordinatni sistem projekta. Ništa se ne pomjera ako prihvatiš; sistem samo kaže šta brojevi znače.

## Šta je provjereno

- Svaki čitač je upoređen sa GDAL-om, bibliotekom koju većina GIS programa koristi za čitanje ovih datoteka, na datotekama koje je GDAL napisao: shapefile svih vrsta sa i bez kota, linije sa više dijelova, poligoni sa rupama, prazne geometrije, tekstualni, numerički, datumski i tačno/netačno atributi, UTF-8 i Windows-1252 tekst sa i bez `.cpg`, zip sa više shapefile-ova, GeoJSON sa svim vrstama geometrije, i GeoPackage sa četiri tabele. Svaka geometrija, kota i atribut su se poklopili.
- Pozicije pretvorene iz geografske širine i dužine, i iz UTM-a, poklopile su se sa PROJ-om (bibliotekom projekcija iza GDAL-a) do 3 mm.
- Oštećene datoteke (presječene, sa lažnim veličinama, neispravni zipovi, neispravni GeoPackage-i) daju jednu običnu poruku; ništa se ne zaglavi.
- Ovo još nije otvoreno u drugim GIS programima, a datoteke geodatabase, KML i KMZ se još ne čitaju u potpunosti (vidi [Još nije urađeno](topic:not-built-yet)).
