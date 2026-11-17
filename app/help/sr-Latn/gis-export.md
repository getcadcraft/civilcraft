---
title: Izvoz podataka o izvedenom stanju za GIS
summary: Predajte tačke premera, izohipse, osovine trase, plato, cevi i objekte gradskom ili opštinskom GIS odeljenju kao shapefile, GeoPackage, GeoJSON ili KML, u mrežnim koordinatama koordinatnog sistema projekta.
keywords: gis, izvoz, kml, kmz, google earth, izvedeno stanje, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, cevi, objekti, komunalije, grad, opština, mreža, tlo, epsg, prj
from: bba4fea5
---

Mnogi gradovi i opštine traže podatke o izvedenom stanju u GIS formatu kada se projekat zatvara: gde su cevi i objekti postavljeni, konačni nagibi, osovina puta. **GIS › Izvoz** upisuje ono što CivilCraft čuva kao GIS slojeve, po jedan za svaku vrstu objekta.

## Pre izvoza

1. Postavite koordinatni sistem projekta u {{ui:Koordinate}}. GIS odeljenju treba da zna gde su brojevi; bez sistema datoteke nose sopstvene brojeve i ne imenuju nijedan.
2. Proverite površ, osovine, platoe i mrežu cevi kako želite da ih isporučite.
3. Pitajte odeljenje koji format i koji koordinatni sistem žele. Mnogi još traže shapefile u zoni državne ravni, a noviji sistemi uzimaju GeoPackage.

## Izvoz

1. Kliknite {{ui:Izvoz}} u grupi **GIS**.
2. Pod **Šta**, označite vrste koje šaljete. Uz svaku piše koliko objekata ima; vrste bez ičega su sive.
3. Pod **Kao**, izaberite format.
4. Pročitajte napomene o koordinatama i jedinicama, pa kliknite dugme za preuzimanje. Statusna linija kaže šta je ušlo i koja su imena polja skraćena.

Dijalog sadrži i izvoz mreže visinskih kota ({{ui:Površ kao GeoTIFF mreža visina}}); vidi [Mreže visina i LiDAR](topic:elevation-grids-and-lidar).

## Šta svaka vrsta sadrži

| Vrsta | Oblik | Polja |
|---|---|---|
| Tačke premera | Tačke sa visinskom kotom | `P` broj tačke, `N` sever, `E` istok, `Z` visinska kota, `D` opis |
| Izohipse postojećeg terena, konačne površi | Linije na svojoj visini | `ELEV` |
| Prelomne linije | Linije sa visinskim kotama | `NAME` |
| Granica površi | Poligon (nacrtana granica, inače ivica površi) | `NAME` |
| Osovine trase | Osovine | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stacionaže kao obični brojevi) |
| Platoi | Poligoni na visini platoa | `NAME`, `ELEV`, `AREA` |
| Linije izlaza | Linije sa visinskim kotama (platoi i koridori) | `NAME` |
| Linije koridora: center, ivice kolovoza, bankine | Linije sa visinskim kotama | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Cevi | Linije od gornjeg do donjeg dna | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (procenti), `LENGTH`, `NETWORK` |
| Objekti na mreži | Tačke na poklopcu | `NAME`, `RIM`, `INVERT` (najniže dno cevi tamo), `SUMP`, `DIA`, `DIA_UNIT` |
| Svaki GIS sloj | Kao uvezen | Sopstvena polja |

Dužine, stacionaže i visinske kote su u jedinicama projekta (američke geodetske stope ili metri). Prečnici cevi i objekata su u inčima za projekte u stopama, a u milimetrima za projekte u metrima; `DIA_UNIT` kaže koje.

## Formati

- **Shapefile**: jedna `.zip` datoteka sa shapefile-om za svaku vrstu (`.shp`, `.shx`, `.dbf`), `.cpg` koja kaže da je tekst UTF-8, i `.prj` koja imenuje koordinatni sistem. Oblici sa visinskim kotama upisuju se kao Z tipovi shapefile-a. Nazivi polja duži od 10 znakova skraćuju se, kako format traži, a statusna linija ih navodi.
- **GeoPackage**: jedna `.gpkg` datoteka sa tabelom za svaku vrstu, koordinatni sistem sačuvan sa EPSG kodom. Jedna datoteka umesto mnogo, dugi nazivi polja se čuvaju.
- **KML** ili **KMZ** (KML spakovan): jedna datoteka sa geografskom širinom i dužinom za Google Earth i mape na vebu, fascikla za svaku vrstu, svaki objekat je oznaka imenovana prema polju NAME, sa svim poljima kao proširenim podacima; visine u metrima (režim nadmorske visine apsolutan). Kao i GeoJSON, zahteva koordinatni sistem projekta.
- **GeoJSON**: jedna datoteka sa geografskom širinom i dužinom (standard GeoJSON ne dozvoljava ništa drugo), a svaki objekat nosi svojstvo `kind` (`pipes`, `structures`, …) da primalac može da ih razdvoji. Visine se pretvaraju u metre, kako standard traži; ostaju na vertikalnom datumu vašeg projekta (CivilCraft nema model geoida). Projekat bez koordinatnog sistema ne može da izveze GeoJSON, a dijalog kaže zašto.

## Mreža, a ne teren

GIS odeljenja čuvaju podatke u **mrežnim** koordinatama koordinatnog sistema. Ako vaš projekat koristi koordinate tla ili lokalne (postavljene u {{ui:Koordinate}}), svaka koordinata se pri izvozu vraća u mrežu: brojevi u datotekama razlikuju se od onih na osnovi za vaš faktor razmere (i za rotaciju, kod lokalnog sistema). Polja tačaka `N` i `E` takođe nose mrežne vrednosti. Dijalog vas podseća na to.

:::tip
Priložite kratku napomenu uz datoteke: koordinatni sistem i njegov EPSG kod, vertikalni datum vaših visinskih kota, jedinice i šta je svaka datoteka.
:::

## Šta je provereno

- Svaka napisana datoteka pročitana je nazad pomoću GDAL-a, biblioteke koju koristi većina GIS programa: svaki oblik, visinska kota i atribut, broj objekata i koordinatni sistem kao EPSG kod (`.prj` i GeoPackage). Naši sopstveni čitači čitaju ih na isti način.
- GeoJSON datoteke prate RFC 7946: prvo dužina pa širina, bez člana `crs`, spoljašnji prstenovi suprotno kazaljci na satu, a rupe u smeru kazaljke; položaji se poklapaju sa PROJ-om do 2 mm.
- Projekat sa koordinatama tla izvezen je i svaka tačka proverena je u odnosu na mrežne koordinate.
- Ništa ovde još nije otvoreno u drugim GIS programima. Proverite prvu isporuku sa odeljenjem pre nego što se na nju oslonite.
