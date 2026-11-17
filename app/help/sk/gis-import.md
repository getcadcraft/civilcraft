---
title: Import údajov GIS
summary: Prineste shapefile, GeoJSON a GeoPackage do projektu ako hladiny GIS, umiestnite ich cez správny súradnicový systém, pozrite si ich atribúty a použite ich pre povrch.
keywords: gis, popisky, označenie prvkov, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, import, hladiny, atribúty, súradnicový systém, epsg, zemepisná šírka, zemepisná dĺžka, vrstevnice, parcely, zlomové čiary, hranica
from: f6b235cc
---

Mestá a okresy poskytujú kontext lokality vo formáte GIS: parcely, vecné bremená, vrstevnice, inžinierske siete, geodetické body. CivilCraft otvorí tri druhy z nich ako **hladiny GIS**, ktoré ležia pod vaším návrhom v pôdoryse.

| Súbor | Čo otvoriť |
|---|---|
| Shapefile | `.shp` spolu s jeho `.shx`, `.dbf`, `.prj` a `.cpg` (vyberte ich všetky), alebo `.zip`, v ktorom prišli. Zip s viacerými shapefile dá viac hladín. |
| GeoJSON | Súbor `.geojson` (súbor `.json`, ktorého prvé riadky hovoria `FeatureCollection` alebo `Feature`, funguje tiež). |
| GeoPackage | Súbor `.gpkg`. Každá tabuľka prvkov v ňom sa uvedie. |
| KML alebo KMZ | Súbor `.kml` (z Google Earth alebo webovej mapy), alebo zabalený `.kmz`. Každý priečinok sa stane hladinou (rozdelený na body, čiary a polygóny, ak obsahuje viac druhov); názov, popis a rozšírené údaje značky sa stanú jej atribútmi. Výšky sú v metroch a zemepisná šírka a dĺžka ako pri GeoJSON. |

Body, multibody, čiary, polygóny s otvormi a viacčastové tvary sa čítajú, s ich výškami (z), ak ich súbor obsahuje. Hodnoty merania (M) sa vynechajú. Mriežky výšok a LiDAR sa otvárajú rovnako: pozri [Mriežky výšok a LiDAR](topic:elevation-grids-and-lidar).

## Otvorenie súborov

1. Kliknite na {{ui:Import}} v skupine **GIS** (alebo {{ui:Open}}), vyberte súbory alebo ich pustite na pôdorys. Súbory sa čítajú na tomto počítači; nič sa neodosiela.
2. Dialóg **Import údajov GIS** vypíše každú nájdenú hladinu: jej druh, počet prvkov (a koľko nemá geometriu), počet atribútových polí a súradnicový systém, ktorý súbor uvádza. Zrušte označenie hladín, ktoré nechcete.
3. Prečítajte si časť **Súradnicový systém** (nižšie) a riadok **Čo sa stane**, potom kliknite na {{ui:Import}}.
4. Hladiny sa objavia v pôdoryse a pod **Hladiny GIS** na ľavom paneli. Import je jeden krok: {{key:Mod+Z}} ho vráti späť.

Veľký súbor zobrazí nad pôdorysom riadok priebehu s tlačidlom {{ui:Cancel}}.

## Súradnicový systém

GIS súbory uvádzajú, kde sa nachádzajú, cez súradnicový systém (`.prj` shapefile, tabuľka referenčných systémov GeoPackage; GeoJSON je vždy zemepisná šírka a dĺžka). CivilCraft prevedie každú hladinu z jej vlastného systému do systému projektu. Nikdy nehádže:

- **Projekt má súradnicový systém** (nastavený v {{ui:Coordinates}}): každá hladina s vlastným systémom sa prevedie do neho, vrátane terénnej alebo miestnej úpravy. Súbor bez `.prj` dostane dve možnosti: **Rovnaké ako projekt** (jeho čísla sa načítajú tak, ako sú) alebo **Vybrať systém súboru**.
- **Projekt nemá žiadny a súbor je v projekčnom systéme v jednotkách vášho projektu** (napríklad zóna štátnej roviny v US survey stopách pre projekt v stopách): dialóg ponúkne **Použiť tento systém ako súradnicový systém projektu**. Nastaví sa v rovnakom kroku späť ako import. Nič v projekte sa nehýbe; systém len hovorí, čo čísla znamenajú. Namiesto toho môžete pre projekt vybrať iný systém a hladiny sa prevedú doň.
- **Projekt nemá žiadny a súbor je v zemepisnej šírke a dĺžke** (každý GeoJSON) **alebo v iných jednotkách**: {{ui:Import}} zostáva sivé, kým nevyberiete súradnicový systém projektu. Výber začína blízko údajov.
- **Ani projekt, ani súbory nepomenúvajú systém**: čísla sa načítajú tak, ako sú, a dialóg to povie.

Výšky sa tiež prevádzajú: výšky GeoJSON sú v metroch (štandard GeoJSON to hovorí); výšky iných súborov sa berú v jednotke ich vlastného systému.

:::warning
Polohy v súbore GeoJSON mimo ±180° zemepisnej dĺžky alebo ±90° zemepisnej šírky nie sú zemepisná šírka a dĺžka. Tieto prvky sa vynechajú a dialóg uvedie, koľko ich bolo. Taký súbor je zvyčajne projekčný súbor uložený bez svojho systému; vyžiadajte si ho znova, alebo shapefile s jeho `.prj`.
:::

NAD83 sa berie ako rovnaký ako WGS 84 (systém, ktorý používa GeoJSON); tieto dva sa v Severnej Amerike líšia o niekoľko metrov, takže údaje GeoJSON môžu byť o toľko mimo. Tam, kde najlepší posun potrebuje mriežkový súbor (napríklad NADCON pre NAD27), CivilCraft použije hrubší uverejnený posun a dialóg súradnicového systému ukáže, aký hrubý je (pre NAD27 asi 20 m), kým mriežkový súbor nepridáte: pozri [Súbory posunu mriežky](topic:coordinate-systems).

## Hladiny GIS

Každý riadok pod **Hladiny GIS** má:

- zaškrtávacie políčko na zobrazenie alebo skrytie hladiny (skryté hladiny sa tiež nevyberajú);
- jej farbu, vybranú zo zoznamu;
- ponuku (tri bodky) s {{ui:Zoom to}}, {{ui:Use for the surface…}}, {{ui:Rename…}} a {{ui:Remove}}.

Zobrazenie, skrytie, zmena farby, premenovanie a odstránenie sú kroky späť. Hladiny GIS sa uložia do súboru projektu a vrátia sa pri jeho otvorení. Idú tiež do PDF výkresu pôdorysu a do exportov DXF a DWG, každá na hladine pomenovanej `GIS-` a jej číslo.

## Označenie prvkov z atribútu

V ponuke {{ui:More}} hladiny (tri bodky v **Hladiny GIS**) vyberte pole pod **Označiť pomocou**: každý prvok ukáže svoju hodnotu v pôdoryse, vo farbe hladiny. Body sú označené vedľa bodu, čiary pozdĺž stredu ich najdlhšej časti (otočené tak, aby sa čítali zľava doprava), polygóny v strede. Čísla sa zobrazia až s tromi desatinnými miestami. Popisky sú na papieri vysoké 1.8 mm pri akejkoľvek mierke a idú do PDF výkresu, DXF a DWG. Vyberte **Bez popiskov**, ak ich chcete odstrániť; každá zmena je jeden krok ({{key:Mod+Z}} ju vráti). Hladina označí najviac 5,000 prvkov.

## Pozrieť prvok

Pri zapnutom {{ui:Select}} kliknite na prvok. **Vlastnosti** ukážu jeho hladinu, ktorý prvok to je, jeho tvar (časti, otvory, vrcholy), jeho výšky, súbor, z ktorého pochádza, a súradnicový systém tohto súboru, potom všetky atribúty v tabuľke. Atribúty sú len na čítanie: CivilCraft zobrazuje údaje GIS tak, ako prišli; neupravuje ich.

Body majú prednosť pred čiarami, keď sú obe pod ukazovateľom; vnútri polygónu sa vyberie najmenší polygón.

## Použitie pre povrch

Otvorte ponuku hladiny a vyberte {{ui:Use for the surface…}} (alebo tlačidlo vo **Vlastnostiach**). Ponúkané závisí od hladiny:

| Hladina | Môže sa stať |
|---|---|
| Čiary s výškami (3D čiary) | Zlomové čiary vo svojich výškach |
| Čiary bez výšok, ale s číselným poľom (vrstevnice) | Zlomové čiary vo výške poľa, ktoré vyberiete |
| Polygóny | Hranica povrchu (vybraný polygón, inak najväčší), alebo zlomové čiary pozdĺž ich hrán |
| Body s výškami alebo s poľom výšky | Body merania, popísané názvom hladiny, aby tvorili skupinu bodov |

Každé použitie je jeden krok späť, ktorý skopíruje geometriu do projektu; samotná hladina zostáva nezmenená. Výšky sa berú v jednotkách projektu.

## Bodové súbory so zemepisnou šírkou a dĺžkou

Bodový súbor, ktorého hlavička pomenúva stĺpce **zemepisná šírka** a **zemepisná dĺžka** (`lat`, `latitude`, `lon`, `long`, `longitude`), sa načíta ako stupne, nie ako sever a východ. Dialóg importu to povie. Pri {{ui:Import}} sa body prevedú do súradnicového systému projektu; projekt bez neho vás najprv požiada, aby ste ho vybrali. Stupne sa nikdy nenačítajú ako stopy. Riadky mimo ±90° zemepisnej šírky alebo ±180° zemepisnej dĺžky sa odmietnu s uvedením dôvodu. Stĺpec výšky sa berie tak, ako je, v jednotkách projektu.

## Súbory LandXML, ktoré uvádzajú súradnicový systém

Keď otvorený súbor LandXML má prvok `CoordinateSystem` (kód EPSG, popis WKT alebo názov systému), CivilCraft ho ponúkne ako súradnicový systém projektu. Ak ho prijmete, nič sa nehýbe; systém len hovorí, čo čísla znamenajú.

## Čo bolo overené

- Každá čítačka bola porovnaná s GDAL, knižnicou, ktorú používa väčšina programov GIS, na súboroch, ktoré zapísal GDAL: shapefile každého druhu s výškami aj bez nich, viacčastové čiary, polygóny s otvormi, prázdne geometrie, atribúty textu, čísel, dátumov a pravda/nepravda, text UTF-8 a Windows-1252 s `.cpg` aj bez neho, zip z viacerých shapefile, GeoJSON so všetkými typmi geometrie a GeoPackage so štyrmi tabuľkami. Každá geometria, výška a atribút sa zhodovali.
- Polohy prevedené zo zemepisnej šírky a dĺžky a z UTM sa zhodovali s PROJ (projekčnou knižnicou za GDAL) na 3 mm.
- Poškodené súbory (useknuté, s nesprávnymi veľkosťami, chybné zipy, chybné GeoPackage) dajú jedno jasné hlásenie; nič sa nezasekne.
- Nič tu zatiaľ nebolo otvorené v iných programoch GIS a súborové geodatabázy, KML a KMZ sa zatiaľ nečítajú (pozri [Ešte nie je hotové](topic:not-built-yet)).
