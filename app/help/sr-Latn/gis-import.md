---
title: Uvoz GIS podataka
summary: Uvezite shapefile, GeoJSON i GeoPackage u projekat kao GIS slojeve, smestite ih preko pravog koordinatnog sistema, pogledajte njihove atribute i koristite ih za površ.
keywords: gis, oznake, označi objekte, atributi na osnovi, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, uvoz, slojevi, atributi, koordinatni sistem, epsg, geografska širina, geografska dužina, izohipse, parcele, prelomne linije, granica
from: f6b235cc
---

Gradska i opštinska GIS odeljenja daju podatke o okolini lokacije kao GIS datoteke: parcele, služnosti, izohipse, komunalije, geodetske tačke. CivilCraft otvara tri vrste njih kao **GIS slojeve** koji leže ispod vašeg projekta na osnovi.

| Datoteka | Šta otvoriti |
|---|---|
| Shapefile | `.shp` zajedno sa `.shx`, `.dbf`, `.prj` i `.cpg` (izaberite sve), ili `.zip` u kome su stigle. Zip sa više shapefile-ova daje više slojeva. |
| GeoJSON | Datoteka `.geojson` (i `.json` datoteka čiji prvi redovi kažu `FeatureCollection` ili `Feature` radi takođe). |
| GeoPackage | Datoteka `.gpkg`. Navodi se svaka tabela objekata u njoj. |
| KML ili KMZ | Datoteka `.kml` (iz Google Earth-a ili mape na vebu), ili spakovana `.kmz`. Svaka fascikla postaje sloj (razdvaja se na tačke, linije i poligone kada sadrži više vrsta); naziv, opis i prošireni podaci oznake postaju njeni atributi. Visine su u metrima, a geografska širina i dužina kao kod GeoJSON-a. |

Čitaju se tačke, multitačke, linije, poligoni sa rupama i oblici sa više delova, sa njihovim visinskim kotama (z) kada ih datoteka ima. Vrednosti mere (M) se izostavljaju. Mreže visinskih kota i LiDAR otvaraju se na isti način: vidi [Mreže visina i LiDAR](topic:elevation-grids-and-lidar).

## Otvaranje datoteka

1. Kliknite {{ui:Uvezi}} u grupi **GIS** (ili {{ui:Otvori}}), izaberite datoteke, ili ih prevucite na osnovu. Datoteke se čitaju na ovom računaru; ništa se ne šalje.
2. Dijalog **Uvoz GIS podataka** navodi svaki pronađeni sloj: vrstu, broj objekata (i koliko ih nema geometriju), broj polja atributa i koordinatni sistem koji datoteka navodi. Isključite slojeve koje ne želite.
3. Pročitajte deo **Koordinatni sistem** (dole) i red **Šta će se dogoditi**, pa kliknite {{ui:Uvezi}}.
4. Slojevi se pojavljuju na osnovi i pod **GIS slojevi** u levom panelu. Uvoz je jedan korak: {{key:Mod+Z}} ga vraća.

Velika datoteka prikazuje liniju napretka preko osnove sa dugmetom {{ui:Otkaži}}.

## Koordinatni sistem

GIS datoteke kažu gde su preko koordinatnog sistema (`.prj` shapefile-a, tabela prostornih referenci GeoPackage-a; GeoJSON je uvek geografska širina i dužina). CivilCraft pretvara svaki sloj iz njegovog sistema u sistem projekta. Nikad ne pogađa:

- **Projekat ima koordinatni sistem** (postavljen u {{ui:Koordinate}}): svaki sloj sa sopstvenim sistemom pretvara se u njega, uključujući i podešavanje tla ili lokalno. Datoteka bez `.prj` dobija dva izbora: **Isto kao projekat** (njeni brojevi se učitavaju onakvi kakvi jesu) ili **Izaberi sistem datoteke**.
- **Projekat nema sistem, a datoteka je u projektovanom sistemu u jedinicama vašeg projekta** (na primer zona državne ravni u američkim geodetskim stopama za projekat u stopama): dijalog nudi **Koristi taj sistem kao koordinatni sistem projekta**. Postavlja se u istom koraku opozivanja kao i uvoz. Ništa u projektu se ne pomera; sistem samo kaže šta brojevi znače. Umesto toga možete izabrati drugi sistem za projekat, i slojevi se pretvaraju u njega.
- **Projekat nema sistem, a datoteka je u geografskoj širini i dužini** (svaki GeoJSON) **ili u drugim jedinicama**: {{ui:Uvezi}} je sivo dok ne izaberete koordinatni sistem projekta. Birač počinje blizu podataka.
- **Ni projekat ni datoteke ne imenuju sistem**: brojevi se učitavaju onakvi kakvi jesu, a dijalog to kaže.

Visine se takođe pretvaraju: visine u GeoJSON-u su u metrima (tako kaže standard GeoJSON); visine ostalih datoteka uzimaju se u jedinici njihovog sopstvenog sistema.

:::warning
Položaji u GeoJSON datoteci van ±180° dužine ili ±90° širine nisu geografska širina i dužina. Ti objekti se izostavljaju, a dijalog kaže koliko ih je. Takva datoteka je obično projektovana datoteka sačuvana bez svog sistema; zatražite je ponovo, ili shapefile sa njegovim `.prj`.
:::

NAD83 se tretira kao isto što i WGS 84 (sistem koji koristi GeoJSON); njih dvoje se razlikuju za nekoliko metara u Severnoj Americi, pa GeoJSON podaci mogu biti pomereni za toliko. Kada najbolji pomak zahteva datoteku mreže (na primer NADCON za NAD27), CivilCraft koristi grublji objavljeni pomak, a dijalog koordinatnog sistema pokazuje koliko je grub (za NAD27, oko 20 m), dok ne dodate mrežu: vidi [Datoteke pomaka mreže](topic:coordinate-systems).

## GIS slojevi

Svaki red pod **GIS slojevi** ima:

- polje za štiklu za prikaz ili skrivanje sloja (skriveni slojevi se ne biraju);
- njegovu boju, izabranu sa spiska;
- meni (tri tačke) sa {{ui:Zumiraj na}}, {{ui:Koristi za teren…}}, {{ui:Preimenuj…}} i {{ui:Ukloni}}.

Prikazivanje, skrivanje, promena boje, preimenovanje i uklanjanje su koraci opozivanja. GIS slojevi se čuvaju u datoteci projekta i vraćaju se kada je otvorite. Izlaze i sa PDF štampom plana i njegovim DXF i DWG izvozima, svaki na sloju imenovanom `GIS-` i njegovim brojem.

## Oznake objekata iz atributa

U meniju sloja {{ui:Više}} (tri tačke u **GIS slojevi**) izaberite polje pod **Označi pomoću**: svaki objekat prikazuje svoju vrednost na osnovi, u boji sloja. Tačke se označavaju pored tačke, linije duž sredine njihovog najdužeg dela (okrenute da se čitaju sleva udesno), poligoni u svom središtu. Brojevi se prikazuju do tri decimale. Oznake su visoke 1,8 mm na papiru, u bilo kojoj razmeri, i idu u PDF štampu, DXF i DWG. Izaberite **Bez oznaka** da ih uklonite; svaka promena je jedan korak ({{key:Mod+Z}} je poništava). Sloj označava najviše 5.000 objekata.

## Pogled na objekat

Kada je {{ui:Izaberi}} uključeno, kliknite objekat. **Svojstva** prikazuju njegov sloj, koji je to objekat, njegov oblik (delovi, rupe, temena), njegove visinske kote, datoteku iz koje dolazi i koordinatni sistem te datoteke, pa zatim svaki atribut u tabeli. Atributi su samo za čitanje: CivilCraft prikazuje GIS podatke onakve kakvi su stigli, ne menja ih.

Tačke imaju prednost nad linijama kada su obe ispod pokazivača; unutar poligona bira se najmanji poligon.

## Koristi za površ

Otvorite meni sloja i izaberite {{ui:Koristi za teren…}} (ili dugme u **Svojstvima**). Ponuđeno zavisi od sloja:

| Sloj | Može postati |
|---|---|
| Linije sa visinskim kotama (3D linije) | Prelomne linije na sopstvenim visinskim kotama |
| Linije bez visinskih kota, ali sa brojčanim poljem (izohipse) | Prelomne linije na visini iz polja koje izaberete |
| Poligoni | Granica površi (izabrani poligon, inače najveći), ili prelomne linije duž njihovih ivica |
| Tačke sa visinskim kotama, ili sa poljem visinske kote | Geodetske tačke, opisane nazivom sloja da čine grupu tačaka |

Svaka upotreba je jedan korak opozivanja koji kopira geometriju u projekat; sam sloj ostaje kakav jeste. Visine se uzimaju u jedinicama projekta.

## Datoteke tačaka sa geografskom širinom i dužinom

Datoteka tačaka čija zaglavlja imenuju kolone **latitude** i **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) čita se kao stepeni, a ne kao sever i istok. Dijalog za uvoz to kaže. Pri {{ui:Uvezi}}, tačke se pretvaraju u koordinatni sistem projekta; projekat bez njega najpre traži da ga izaberete. Stepeni se nikad ne učitavaju kao stope. Redovi van ±90° širine ili ±180° dužine se odbijaju, uz razlog. Kolona visinske kote uzima se kakva jeste, u jedinicama projekta.

## LandXML datoteke koje imenuju koordinatni sistem

Kada LandXML datoteka koju otvarate ima element `CoordinateSystem` (EPSG kod, WKT opis ili naziv sistema), CivilCraft ga nudi kao koordinatni sistem projekta. Ništa se ne pomera ako prihvatite; sistem samo kaže šta brojevi znače.

## Šta je provereno

- Svaki čitač je upoređen sa GDAL-om, bibliotekom koju koristi većina GIS programa, na datotekama koje je GDAL napisao: shapefile-ovi svih vrsta sa i bez visinskih kota, linije sa više delova, poligoni sa rupama, prazne geometrije, atributi teksta, brojeva, datuma i tačno/netačno, UTF-8 i Windows-1252 tekst sa i bez `.cpg`, zip sa više shapefile-ova, GeoJSON sa svim vrstama geometrije, i GeoPackage sa četiri tabele. Svaka geometrija, visinska kota i atribut se poklopio.
- Položaji pretvoreni iz geografske širine i dužine, i iz UTM-a, poklopili su se sa PROJ-om (bibliotekom projekcija iza GDAL-a) do 3 mm.
- Oštećene datoteke (skraćene, sa lažnim veličinama, neispravni zipovi, neispravni GeoPackage-i) daju jednu jasnu poruku; ništa se ne blokira.
- Ništa ovde još nije otvoreno u drugim GIS programima, a datoteke geobaze, KML i KMZ još se ne čitaju (vidi [Još nije napravljeno](topic:not-built-yet)).
