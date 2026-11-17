---
title: Export údajov o skutočnom vyhotovení pre GIS
summary: Odovzdajte body merania, vrstevnice, trasy, plošiny, potrubia a objekty mestskému alebo okresnému oddeleniu GIS ako shapefile, GeoPackage, GeoJSON alebo KML, v mriežkových súradniciach súradnicového systému projektu.
keywords: gis, export, kml, kmz, google earth, skutočné vyhotovenie, as-built, shapefile, shp, zip, geopackage, gpkg, geojson, potrubia, objekty, inžinierske siete, mesto, okres, mriežka, terén, epsg, prj
from: bba4fea5
---

Mnohé mestá a okresy pri uzavretí projektu žiadajú údaje o skutočnom vyhotovení vo formáte GIS: kde boli potrubia a objekty uložené, konečné sklony, os cesty. **GIS › Export** zapíše to, čo CivilCraft drží, ako hladiny GIS, jednu pre každý druh objektu.

## Pred exportom

1. Nastavte súradnicový systém projektu v {{ui:Coordinates}}. Oddelenie GIS potrebuje vedieť, kde sú čísla; bez systému súbory nesú vlastné čísla projektu a nepomenujú žiadny systém.
2. Skontrolujte povrch, trasy, plošiny a sieť potrubí tak, ako ich chcete odovzdať.
3. Opýtajte sa oddelenia, aký formát a aký súradnicový systém chcú. Mnohí stále žiadajú shapefile v zóne štátnej roviny; novšie systémy prijímajú GeoPackage.

## Export

1. Kliknite na {{ui:Export}} v skupine **GIS**.
2. V časti **Čo** zaškrtnite druhy, ktoré chcete poslať. Každý ukazuje, koľko má prvkov; druhy bez obsahu sú sivé.
3. V časti **Ako** vyberte formát.
4. Prečítajte si poznámky o súradniciach a jednotkách, potom kliknite na tlačidlo na stiahnutie. Stavový riadok hovorí, čo bolo zahrnuté a ktoré názvy polí boli skrátené.

Dialóg obsahuje aj export mriežky výšok ({{ui:Surface as a GeoTIFF elevation grid}}); pozri [Mriežky výšok a LiDAR](topic:elevation-grids-and-lidar).

## Čo každý druh obsahuje

| Druh | Tvar | Polia |
|---|---|---|
| Body merania | Body s výškou | `P` číslo bodu, `N` sever (Y), `E` východ (X), `Z` výška, `D` popis |
| Vrstevnice jestvujúceho terénu, upraveného povrchu | Čiary vo svojej výške | `ELEV` |
| Zlomové čiary | Čiary s výškami | `NAME` |
| Hranica povrchu | Polygón (nakreslená hranica, inak hrana povrchu) | `NAME` |
| Osi trás | Osi | `NAME`, `LENGTH`, `STA_START`, `STA_END` (staničenia ako čísla) |
| Plošiny | Polygóny vo výške plošiny | `NAME`, `ELEV`, `AREA` |
| Čiary denného svetla | Čiary s výškami (plošiny a koridory) | `NAME` |
| Čiary prvkov koridoru | Čiary s výškami: os, hrany vozovky, krajnice | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Potrubia | Čiary od hornej ku spodnej výške dna | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (percento), `LENGTH`, `NETWORK` |
| Objekty | Body na okraji poklopu | `NAME`, `RIM`, `INVERT` (najnižšia výška dna potrubia tam), `SUMP`, `DIA`, `DIA_UNIT` |
| Každá hladina GIS | Ako bola importovaná | Vlastné polia |

Dĺžky, staničenia a výšky sú v jednotkách projektu (US survey stopy alebo metre). Priemery potrubí a objektov sú v palcoch pre projekty v stopách a v milimetroch pre projekty v metroch; `DIA_UNIT` hovorí, ktoré.

## Formáty

- **Shapefile**: jeden `.zip` so shapefile pre každý druh (`.shp`, `.shx`, `.dbf`), súbor `.cpg`, ktorý hovorí, že text je UTF-8, a `.prj` s menom súradnicového systému. Tvary s výškami sa zapíšu ako typy Z shapefile. Názvy polí dlhšie ako 10 znakov sa skrátia, ako to formát vyžaduje, a stavový riadok ich vypíše.
- **GeoPackage**: jeden súbor `.gpkg` s tabuľkou pre každý druh, súradnicový systém uložený s kódom EPSG. Jeden súbor namiesto mnohých, dlhé názvy polí zachované.
- **KML** alebo **KMZ** (KML zabalený v zip): jeden súbor zemepisnej šírky a dĺžky pre Google Earth a webové mapy, priečinok pre každý druh, každý prvok ako značka pomenovaná podľa poľa NAME so všetkými poľami ako rozšírenými údajmi; výšky v metroch (režim nadmorskej výšky absolútny). Ako GeoJSON vyžaduje súradnicový systém projektu.
- **GeoJSON**: jeden súbor zemepisnej šírky a dĺžky (štandard GeoJSON nepovoľuje nič iné), s každým prvkom nesúcim vlastnosť `kind` (`pipes`, `structures`, …), aby ju príjemca mohol rozdeliť. Výšky sú prevedené na metre, ako štandard žiada; zostávajú na vertikálnom dátume vášho projektu (CivilCraft nemá model geoidu). Projekt bez súradnicového systému nemôže exportovať GeoJSON a dialóg uvedie prečo.

## Mriežka, nie terén

Oddelenia GIS držia svoje údaje v **mriežkových** súradniciach súradnicového systému. Ak váš projekt používa terénne alebo miestne súradnice (nastavené v {{ui:Coordinates}}), každá súradnica sa pri odchode prevedie späť na mriežku: čísla v súboroch sa od čísel v pôdoryse líšia o váš mierkový faktor (a o otočenie pri miestnom systéme). Polia bodov `N` a `E` obsahujú tiež mriežkové hodnoty. Dialóg to pripomenie.

:::tip
K súborom pripojte krátku poznámku: súradnicový systém a jeho kód EPSG, vertikálny dátum vašich výšok, jednotky a čo je v každom súbore.
:::

## Čo bolo overené

- Každý zapísaný súbor bol čítaný späť knižnicou GDAL, ktorú používa väčšina programov GIS: každý tvar, výška a atribút, počty prvkov a súradnicový systém ako kód EPSG (`.prj` a GeoPackage). Naše vlastné čítačky ich čítajú rovnako.
- Súbory GeoJSON zodpovedajú RFC 7946: zemepisná dĺžka pred šírkou, žiadny člen `crs`, vonkajšie krúžky proti smeru hodinových ručičiek a otvory v smere hodinových ručičiek; polohy sa zhodovali s PROJ na 2 mm.
- Projekt so súradnicami terénu bol exportovaný a každý bod bol overený voči jeho mriežkovým súradniciam.
- Nič tu zatiaľ nebolo otvorené v iných programoch GIS. Pred spoliehaním sa na prvé odovzdanie to skontrolujte s oddelením.
