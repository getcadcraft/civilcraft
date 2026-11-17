---
title: Izvezi podatke o izvedenom stanju za GIS
summary: Pošalji tačke premjera, izohipse, osovine trasa, platoe, cijevi i građevine gradskoj ili općinskoj GIS službi kao shapefile, GeoPackage, GeoJSON ili KML, u mrežnim koordinatama koordinatnog sistema projekta.
keywords: gis, izvoz, kml, kmz, google earth, izvedeno stanje, as-built, shapefile, shp, zip, geopackage, gpkg, geojson, cijevi, građevine, komunalne instalacije, grad, općina, mreža, teren, epsg, prj
from: bba4fea5
---

Mnogi gradovi i općine traže podatke o izvedenom stanju u GIS formatu kad se projekt zatvara: gdje su cijevi i građevine, konačne kote terena, osovina puta. **GIS › Izvoz** upisuje ono što CivilCraft čuva kao GIS slojeve, po jedan za svaku vrstu objekta.

## Prije izvoza

1. Postavi koordinatni sistem projekta u {{ui:Koordinate}}. GIS služba mora znati gdje su brojevi; bez sistema datoteke nose vlastite brojeve projekta i ne imenuju nijedan.
2. Provjeri površ, trase, platoe i mrežu cijevi onako kako želiš da ih predaš.
3. Pitaj službu koji format i koji koordinatni sistem žele. Mnogi još traže shapefile u lokalnoj zoni State Plane; noviji sistemi prihvataju GeoPackage.

## Izvoz

1. Klikni {{ui:Izvoz}} u grupi **GIS**.
2. Pod **Šta**, označi vrste koje šalješ. Svaka pokazuje koliko objekata ima; vrste bez ičega su zasivljene.
3. Pod **Kao**, odaberi format.
4. Pročitaj napomene o koordinatama i jedinicama, pa klikni dugme za preuzimanje. Statusna linija kaže šta je ušlo i koja imena polja su skraćena.

Dijalog sadrži i izvoz mreže kota ({{ui:Površina kao GeoTIFF mreža kota}}); vidi [Mreže kota i LiDAR](topic:elevation-grids-and-lidar).

## Šta svaka vrsta sadrži

| Vrsta | Oblik | Polja |
|---|---|---|
| Tačke premjera | Tačke sa visinom | `P` broj tačke, `N` sjever, `E` istok, `Z` kota, `D` opis |
| Izohipse postojećeg terena, nivelisane površi | Linije na svojoj koti | `ELEV` |
| Prijelomne linije | Linije sa kotama | `NAME` |
| Granica površi | Poligon (nacrtana granica, inače rub površi) | `NAME` |
| Osovine trasa | Osovine | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stacionaže kao obični brojevi) |
| Platoi | Poligoni na koti platoa | `NAME`, `ELEV`, `AREA` |
| Linije presijecanja s terenom | Linije sa kotama (platoi i koridori) | `NAME` |
| Linije karakteristika koridora | Linije sa kotama: osovina, ivice kolovoza, bankine | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Cijevi | Linije od gornjeg do donjeg dna cijevi | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (procenat), `LENGTH`, `NETWORK` |
| Građevine | Tačke na poklopcu | `NAME`, `RIM`, `INVERT` (najniže dno cijevi tu), `SUMP`, `DIA`, `DIA_UNIT` |
| Svaki GIS sloj | Kao uvezen | Njegova polja |

Dužine, stacionaže i kote su u jedinicama projekta (US survey stope ili metri). Prečnici cijevi i građevina su u inčima za projekte u stopama i u milimetrima za projekte u metrima; `DIA_UNIT` kaže koje.

## Formati

- **Shapefile**: jedan `.zip` sa shapefile-om za svaku vrstu (`.shp`, `.shx`, `.dbf`), `.cpg` koji kaže da je tekst UTF-8, i `.prj` koji imenuje koordinatni sistem. Oblici sa kotama se zapisuju kao Z tipovi shapefile-a. Imena polja duža od 10 znakova se skraćuju, kako format traži, a statusna linija ih navodi.
- **GeoPackage**: jedna `.gpkg` datoteka sa tabelom za svaku vrstu, koordinatni sistem sačuvan sa svojim EPSG kodom. Jedna datoteka umjesto mnogo, duga imena polja se čuvaju.
- **KML** ili **KMZ** (KML zapakovan): jedna datoteka geografske širine i dužine za Google Earth i web karte, folder za svaku vrstu, svaki objekat je oznaka nazvana prema polju NAME, sa svim poljima kao proširenim podacima; visine su u metrima (režim visine apsolutni). Kao i GeoJSON, treba mu koordinatni sistem projekta.
- **GeoJSON**: jedna datoteka sa geografskom širinom i dužinom (GeoJSON standard ne dozvoljava ništa drugo), a svaki objekat nosi svojstvo `kind` (`pipes`, `structures`, …) da primalac može da ih razdvoji. Visine se pretvaraju u metre, kako standard traži; ostaju na vertikalnom datumu tvog projekta (CivilCraft nema model geoida). Projekt bez koordinatnog sistema ne može izvoziti GeoJSON, a dijalog kaže zašto.

## Mreža, ne teren

GIS službe čuvaju podatke u **mrežnim** koordinatama koordinatnog sistema. Ako projekt koristi koordinate terena ili lokalne (postavljene u {{ui:Koordinate}}), svaka koordinata se pri izlazu pretvara nazad u mrežnu: brojevi u datotekama se razlikuju od onih na planu za tvoj faktor razmjere (i za rotaciju, kod lokalnog sistema). Polja tačaka `N` i `E` također sadrže mrežne vrijednosti. Dijalog te podsjeća.

:::tip
Uz datoteke pošalji kratku napomenu: koordinatni sistem i njegov EPSG kod, vertikalni datum tvojih kota, jedinice i šta je svaka datoteka.
:::

## Šta je provjereno

- Svaka napisana datoteka je pročitana nazad GDAL-om, bibliotekom koju većina GIS programa koristi za čitanje ovih datoteka: svaki oblik, kota i atribut, broj objekata, i koordinatni sistem kao EPSG kod (`.prj` i GeoPackage). Naši vlastiti čitači ih čitaju na isti način.
- GeoJSON datoteke prate RFC 7946: prvo dužina pa širina, bez člana `crs`, vanjski prstenovi suprotno od kazaljke na satu, a rupe u smjeru kazaljke; pozicije se poklapaju sa PROJ-om do 2 mm.
- Projekt sa koordinatama terena je izvezen, i svaka tačka je provjerena naspram svojih mrežnih koordinata.
- Ovo još nije otvoreno u drugim GIS programima. Provjeri prvu isporuku sa službom prije nego se na nju osloniš.
