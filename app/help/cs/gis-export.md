---
title: Exportovat data skutečného provedení pro GIS
summary: Předejte body měření, vrstevnice, osy tras, plošiny, potrubí a objekty oddělení GIS města nebo kraje jako shapefile, GeoPackage, GeoJSON nebo KML, v mřížkových souřadnicích souřadnicového systému projektu.
keywords: gis, export, kml, kmz, google earth, skutečné provedení, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, potrubí, objekty, inženýrské sítě, město, kraj, mřížka, terén, epsg, prj
from: bba4fea5
---

Mnoho měst a krajů žádá data skutečného provedení v GIS formátu při uzavření projektu: kam šlo potrubí a objekty, konečné sklony, osa silnice. **GIS › Export** zapíše to, co CivilCraft drží, jako vrstvy GIS, jednu pro každý druh objektu.

## Před exportem

1. Nastavte souřadnicový systém projektu v {{ui:Coordinates}}. Oddělení GIS potřebuje vědět, kde čísla jsou; bez systému nesou soubory vlastní čísla projektu a žádný název neuvádějí.
2. Zkontrolujte povrch, osy, plošiny a síť potrubí tak, jak je chcete předat.
3. Zeptejte se oddělení, jaký formát a jaký souřadnicový systém chtějí. Mnohé stále chtějí shapefile v místní zóně státní roviny; novější systémy berou GeoPackage.

## Export

1. Klikněte na {{ui:Export}} ve skupině **GIS**.
2. V části **Co** zaškrtněte druhy k odeslání. U každého je vidět, kolik má prvků; druhy zatím bez prvků jsou našedlé.
3. V části **Jako** zvolte formát.
4. Přečtěte si poznámky o souřadnicích a jednotkách a klikněte na tlačítko stažení. Stavový řádek říká, co bylo zapsáno, a případné názvy polí, které byly zkráceny.

Dialog obsahuje i export mřížky výšek ({{ui:Surface as a GeoTIFF elevation grid}}); viz [Mřížky výšek a LiDAR](topic:elevation-grids-and-lidar).

## Co který druh obsahuje

| Druh | Tvar | Pole |
|---|---|---|
| Body měření | Body s výškou | `P` číslo bodu, `N` Y, `E` X, `Z` výška, `D` popis |
| Vrstevnice stávajícího terénu, navrhovaného povrchu | Čáry ve své výšce | `ELEV` |
| Lomové hrany | Čáry s výškami | `NAME` |
| Hranice povrchu | Mnohoúhelník (nakreslená hranice, jinak okraj povrchu) | `NAME` |
| Osy trasy | Osy | `NAME`, `LENGTH`, `STA_START`, `STA_END` (staničení jako prosté číslo) |
| Plošiny | Mnohoúhelníky ve výšce plošiny | `NAME`, `ELEV`, `AREA` |
| Čáry napojení | Čáry s výškami (plošiny a koridory) | `NAME` |
| Hranové čáry koridoru | Čáry s výškami: osa, hrany vozovky, krajnice | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Potrubí | Čáry od horního ke spodnímu dnu potrubí | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (procenta), `LENGTH`, `NETWORK` |
| Objekty | Body na okraji poklopu | `NAME`, `RIM`, `INVERT` (nejnižší dno potrubí v tomto místě), `SUMP`, `DIA`, `DIA_UNIT` |
| Každá vrstva GIS | Podle importu | Vlastní pole |

Délky, staničení a výšky jsou v jednotkách projektu (stopy US survey nebo metry). Průměry potrubí a objektů jsou v palcích u projektů ve stopách a v milimetrech u projektů v metrech; `DIA_UNIT` říká, které.

## Formáty

- **Shapefile**: jeden `.zip` se shapefile pro každý druh (`.shp`, `.shx`, `.dbf`), soubor `.cpg`, který říká, že text je UTF-8, a `.prj` s názvem souřadnicového systému. Tvary s výškami se zapíší jako typy Z shapefile. Názvy polí delší než 10 znaků se zkrátí, jak formát vyžaduje, a stavový řádek je vypíše.
- **GeoPackage**: jeden soubor `.gpkg` s tabulkou pro každý druh; souřadnicový systém je uložen s kódem EPSG. Jeden soubor místo mnoha, dlouhé názvy polí zachovány.
- **KML** nebo **KMZ** (KML zabalené do zipu): jeden soubor se zeměpisnou šířkou a délkou pro Google Earth a webové mapy, složka pro každý druh, každý prvek jako značka pojmenovaná podle pole NAME se všemi poli jako rozšířená data; výšky v metrech (režim nadmořské výšky: absolutní). Stejně jako GeoJSON potřebuje souřadnicový systém projektu.
- **GeoJSON**: jeden soubor se zeměpisnou šířkou a délkou (standard GeoJSON nepřipouští nic jiného), každý prvek má vlastnost `kind` (`pipes`, `structures`, …), aby příjemce mohl soubor rozdělit. Výšky se převádějí na metry, jak standard žádá; zůstávají na svislém datu projektu (CivilCraft nemá model geoidu). Projekt bez souřadnicového systému nemůže exportovat GeoJSON a dialog to vysvětlí.

## Mřížka, ne terén

Oddělení GIS vedou data v **mřížkových** souřadnicích souřadnicového systému. Pokud váš projekt používá terénní nebo místní souřadnice (nastavené v {{ui:Coordinates}}), každá souřadnice se při výstupu převede zpět na mřížku: čísla v souborech se od půdorysu liší o váš měřítkový faktor (a u místního systému o natočení). Pole bodů `N` a `E` obsahují také mřížkové hodnoty. Dialog to připomene.

:::tip
K souborům přiložte krátkou poznámku: souřadnicový systém a jeho kód EPSG, svislé datum vašich výšek, jednotky a to, co každý soubor obsahuje.
:::

## Co bylo ověřeno

- Každý zapsaný soubor byl přečten zpět knihovnou GDAL, kterou používá většina GIS programů: každý tvar, výška a atribut, počty prvků a souřadnicový systém jako kód EPSG (`.prj` a GeoPackage). Naše vlastní čtečky je přečetly stejně.
- Soubory GeoJSON dodržují RFC 7946: zeměpisná délka před šířkou, žádný člen `crs`, vnější prstence proti směru hodinových ručiček a otvory po směru; polohy odpovídaly PROJ na 2 mm.
- Projekt se souřadnicemi terénu byl exportován a každý bod zkontrolován proti jeho mřížkovým souřadnicím.
- Nic zde zatím nebylo otevřeno v jiných GIS programech. Před spoléháním na první předání si ho ověřte s oddělením.
