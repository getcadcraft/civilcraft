---
title: Import dat GIS
summary: Přineste shapefile, GeoJSON a GeoPackage do projektu jako vrstvy GIS, umístěte je přes správný souřadnicový systém, prohlédněte si jejich atributy a použijte je pro povrch.
keywords: gis, popisky, popisky prvků, atributy v půdorysu, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, import, vrstvy, atributy, souřadnicový systém, epsg, zeměpisná šířka, zeměpisná délka, vrstevnice, parcely, lomové hrany, hranice
from: f6b235cc
---

Městská a krajská oddělení GIS předávají kontext lokality jako soubory GIS: parcely, věcná břemena, vrstevnice, inženýrské sítě, body zaměření. CivilCraft otevře tři druhy z nich jako **vrstvy GIS**, které leží pod vaším návrhem v půdorysu.

| Soubor | Co otevřít |
|---|---|
| Shapefile | Soubor `.shp` společně s `.shx`, `.dbf`, `.prj` a `.cpg` (vyberte všechny), nebo `.zip`, ve kterém přišly. Zip s několika shapefile dá několik vrstev. |
| GeoJSON | Soubor `.geojson` (funguje i soubor `.json`, jehož první řádky říkají `FeatureCollection` nebo `Feature`). |
| GeoPackage | Soubor `.gpkg`. Každá tabulka prvků v něm je vypsána. |
| KML nebo KMZ | Soubor `.kml` (z Google Earth nebo webové mapy), nebo zabalený `.kmz`. Každá složka se stane vrstvou (rozdělí se na body, čáry a mnohoúhelníky, pokud obsahuje více druhů); název značky, popis a rozšířená data se stanou jejími atributy. Výšky jsou v metrech a zeměpisná šířka a délka jsou jako u GeoJSON. |

Body, multibody, čáry, mnohoúhelníky s otvory a tvary z více částí se čtou, a to s jejich výškami (z), pokud je soubor obsahuje. Hodnoty měření (M) se vynechají. Mřížky výšek a LiDAR se otevírají stejně: viz [Mřížky výšek a LiDAR](topic:elevation-grids-and-lidar).

## Otevření souborů

1. Klikněte na {{ui:Import}} ve skupině **GIS** (nebo {{ui:Open}}), vyberte soubory, nebo je přetáhněte do půdorysu. Soubory se čtou na tomto počítači; nic se nenahrává.
2. Dialog **Import dat GIS** vypíše každou nalezenou vrstvu: její druh, kolik prvků (a kolik nemá geometrii), kolik polí atributů a souřadnicový systém, který soubor uvádí. Zrušte zaškrtnutí vrstev, které nechcete.
3. Přečtěte si část **Souřadnicový systém** (níže) a řádek **Co se stane**, pak klikněte na {{ui:Import}}.
4. Vrstvy se objeví v půdorysu a pod **Vrstvy GIS** v levém panelu. Import je jeden krok: {{key:Mod+Z}} ho vrátí zpět.

Velký soubor ukazuje nad půdorysem řádek průběhu s tlačítkem {{ui:Cancel}}.

## Souřadnicový systém

Soubory GIS říkají, kde jsou, prostřednictvím souřadnicového systému (`.prj` u shapefile, tabulka prostorových referencí u GeoPackage; GeoJSON je vždy zeměpisná šířka a délka). CivilCraft převádí každou vrstvu z jejího vlastního systému do systému projektu. Nikdy nehádá:

- **Projekt má souřadnicový systém** (nastavený v {{ui:Coordinates}}): každá vrstva s vlastním systémem se převede do něj, včetně úpravy terénu nebo místní úpravy. Soubor bez `.prj` dostane dvě volby: **Stejné jako projekt** (jeho čísla se načtou beze změny) nebo **Vybrat systém souboru**.
- **Projekt žádný nemá a soubor je v promítnutém systému v jednotkách vašeho projektu** (například zóna státní roviny v stopách US survey u projektu ve stopách): dialog nabídne **Použít tento systém jako souřadnicový systém projektu**. Nastaví se ve stejném kroku zpět jako import. Nic v projektu se nepřesune; systém jen říká, co čísla znamenají. Místo toho můžete pro projekt zvolit jiný systém a vrstvy se do něj převedou.
- **Projekt žádný nemá a soubor je ve zeměpisné šířce a délce** (každý GeoJSON) **nebo v jiných jednotkách**: {{ui:Import}} zůstává našedlý, dokud nevyberete souřadnicový systém projektu. Výběr začíná u dat.
- **Ani projekt, ani soubory neuvádějí systém**: čísla se načtou beze změny a dialog to řekne.

Výšky se také převádějí: výšky GeoJSON jsou v metrech (tak říká standard GeoJSON); výšky ostatních souborů se berou v jednotkách jejich vlastního systému.

:::warning
Polohy v souboru GeoJSON mimo ±180° zeměpisné délky nebo ±90° zeměpisné šířky nejsou zeměpisná šířka a délka. Tyto prvky se vynechají a dialog řekne, kolik jich bylo. Takový soubor bývá promítnutý soubor uložený bez svého systému; vyžádejte si jej znovu, nebo shapefile s jeho `.prj`.
:::

NAD83 se bere jako totožný s WGS 84 (systém, který používá GeoJSON); v Severní Americe se ty dva liší o několik metrů, takže data GeoJSON mohou být o tolik mimo. Tam, kde nejlepší posun potřebuje mřížkový soubor (například NADCON pro NAD27), CivilCraft použije hrubší zveřejněný posun a dialog souřadnicového systému ukáže, jak hrubý je (u NAD27 asi 20 m), dokud mřížku nepřidáte: viz [Soubory mřížkového posunu](topic:coordinate-systems).

## Vrstvy GIS

Každý řádek pod **Vrstvy GIS** má:

- zaškrtávací políčko pro zobrazení nebo skrytí vrstvy (skryté vrstvy se také nevybírají);
- její barvu, vybranou ze seznamu;
- nabídku (tři tečky) s {{ui:Zoom to}}, {{ui:Use for the surface…}}, {{ui:Rename…}} a {{ui:Remove}}.

Zobrazení, skrývání, přebarvování, přejmenování a odebírání jsou kroky zpět. Vrstvy GIS se ukládají do souboru projektu a vrátí se při jeho otevření. Odesílají se také s PDF výstupem půdorysu a exporty DXF a DWG, každá na vrstvě pojmenované `GIS-` a jejím číslem.

## Popisky prvků z atributu

V nabídce {{ui:More}} vrstvy (tři tečky v **Vrstvy GIS**) zvolte pole pod **Popisovat podle**: každý prvek ukazuje svou hodnotu v půdorysu v barvě vrstvy. Body jsou popsány vedle bodu, čáry podél středu své nejdelší části (natočeny tak, aby se četly zleva doprava), mnohoúhelníky ve svém středu. Čísla se zobrazují až na tři desetinná místa. Popisky mají na papíře výšku 1.8 mm při jakémkoli měřítku a jdou do PDF výstupu, DXF a DWG. Zvolte **Bez popisků**, abyste je odstranili; každá změna je jeden krok ({{key:Mod+Z}} ji vrátí). Vrstva popíše nejvýše 5,000 prvků.

## Prohlédnout prvek

Při zapnutém {{ui:Select}} klikněte na prvek. **Vlastnosti** ukážou jeho vrstvu, o který prvek jde, jeho tvar (části, otvory, vrcholy), jeho výšky, soubor, odkud pochází, a souřadnicový systém tohoto souboru, pak všechny atributy v tabulce. Atributy jsou jen pro čtení: CivilCraft zobrazuje data GIS tak, jak přišla; neupravuje je.

Body mají přednost před čarami, když jsou obě pod ukazatelem; uvnitř mnohoúhelníku se vybere nejmenší mnohoúhelník.

## Použít pro povrch

Otevřete nabídku vrstvy a zvolte {{ui:Use for the surface…}} (nebo tlačítko v **Vlastnostech**). Co se nabídne, závisí na vrstvě:

| Vrstva | Může se stát |
|---|---|
| Čáry s výškami (3D čáry) | Lomové hrany se svými vlastními výškami |
| Čáry bez výšek, ale s číselným polem (vrstevnice) | Lomové hrany ve výšce z pole, které vyberete |
| Mnohoúhelníky | Hranice povrchu (vybraný mnohoúhelník, jinak největší), nebo lomové hrany podél jejich hran |
| Body s výškami, nebo s polem výšky | Měřické body, popsané názvem vrstvy, aby tvořily skupinu bodů |

Každé použití je jeden krok zpět a zkopíruje geometrii do projektu; samotná vrstva zůstává beze změny. Výšky se berou v jednotkách projektu.

## Body se zeměpisnou šířkou a délkou

Soubor bodů, jehož záhlaví uvádí sloupce **zeměpisná šířka** a **zeměpisná délka** (`lat`, `latitude`, `lon`, `long`, `longitude`), se načte ve stupních, ne jako sever a východ. Dialog importu to říká. Při {{ui:Import}} se body převedou do souřadnicového systému projektu; projekt bez něj vás nejprve požádá o výběr. Stupně se nikdy nenačtou jako stopy. Řádky mimo ±90° zeměpisné šířky nebo ±180° zeměpisné délky se odmítnou s uvedením důvodu. Sloupec výšky se bere beze změny, v jednotkách projektu.

## Soubory LandXML s uvedeným souřadnicovým systémem

Když soubor LandXML, který otevřete, má prvek `CoordinateSystem` (kód EPSG, popis WKT nebo název systému), CivilCraft jej nabídne jako souřadnicový systém projektu. Pokud ho přijmete, nic se nepřesune; systém jen říká, co čísla znamenají.

## Co bylo ověřeno

- Každá čtečka byla porovnána s GDAL, knihovnou, kterou používá většina GIS programů, na souborech, které GDAL zapsal: shapefile každého druhu s výškami i bez nich, víceoblastné čáry, mnohoúhelníky s otvory, prázdné geometrie, textové, číselné, datové a pravda/nepravda atributy, text UTF-8 a Windows-1252 s `.cpg` i bez něj, zip několika shapefile, GeoJSON se všemi typy geometrie a GeoPackage se čtyřmi tabulkami. Každá geometrie, výška a atribut se shodovaly.
- Polohy převedené ze zeměpisné šířky a délky a z UTM se shodovaly s PROJ (knihovnou projekcí za GDAL) na 3 mm.
- Poškozené soubory (oříznuté, s nesprávnými velikostmi, špatné zipy, špatné GeoPackage) dají jednu prostou zprávu; nic se nezasekne.
- Nic zde zatím nebylo otevřeno v jiných GIS programech; geodatabáze souborů, KML a KMZ se zatím nečtou (viz [Ještě není hotovo](topic:not-built-yet)).
