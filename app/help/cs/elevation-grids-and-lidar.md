---
title: Mřížky výšek a LiDAR
summary: Vytvořte stávající terén z DEM (GeoTIFF nebo ASCII mřížka) nebo z bodů LiDAR (LAS, LAZ) — vyberte oblast, prořeďte data, zvolte třídy a zkontrolujte jednotky výšek — a vraťte povrch jako mřížku výšek GeoTIFF.
keywords: dem, dtm, mřížka výšek, geotiff, tif, ascii mřížka, asc, lidar, las, laz, mračno bodů, třídy, terén, proředění, nodata, raster, export geotiff, gis
from: c8b2d18a
---

Veřejná data o výškách přicházejí dvěma způsoby: **mřížky výšek** (DEM: jedna výška na každou čtvercovou buňku, obvykle GeoTIFF `.tif` nebo ASCII mřížka `.asc`) a **body LiDAR** (miliony laserových odrazů v souboru `.las`, nebo `.laz` při kompresi). CivilCraft z obojího vytvoří zaměřovací body nebo povrch přímo v prohlížeči: nic se nenahrává.

## Otevření souboru

1. Klikněte na {{ui:Otevřít}} (nebo {{ui:Importovat}} ve skupině GIS) a vyberte soubor, nebo jej přetáhněte na půdorys. U ASCII mřížky vyberte také její soubor `.prj`, aby CivilCraft věděl její souřadnicový systém.
2. Dialog importu ukáže, co soubor o sobě říká: velikost, buňky nebo body, souřadnicový systém, polohu v zeměpisné šířce a délce a rozsah výšek. U LiDAR nejdřív přečte každý bod jednou, aby spočítal **třídy** (ukazatel průběhu ukazuje, jak daleko je; {{ui:Zrušit}} jej zastaví).

GeoTIFF se třemi nebo čtyřmi pásmy (červené, zelené, modré) je obrázek, ne výšky: přesune se do vrstev mapy.

## Výběr, co se načte

- **Oblast**: {{ui:Rozsah projektu a okraj}} (zadejte okraj), {{ui:Co teď ukazuje půdorys}}, nebo {{ui:Celý soubor}}. Načte se jen tato část souboru.
- **Proředit na**: rozestup bodů, které dostanete, v jednotkách projektu. Řádek pod nastavením ukazuje, kolik bodů to dá, když píšete. U mřížky si CivilCraft ponechá každou druhou, třetí … buňku, takže výšky zůstanou přesně takové, jaké jsou v souboru; buňky nikdy nezprůměrovává. U LiDAR se oblast rozdělí na čtverce této velikosti a ponechá se jeden bod na čtverec: {{ui:Bod nejblíže středu každé buňky}} (výchozí), {{ui:Nejnižší bod v každé buňce}} (vhodné, když soubor nemá třídu terénu: terén je pod stromy), nebo {{ui:Průměr bodů každé buňky}}.
- **Třídy** (LiDAR): terén (třída 2) je zaškrtnut, pokud ho soubor obsahuje; budovy, stromy a šum jsou vynechány. Když třída terénu chybí, jsou zaškrtnuty všechny třídy a dialog to uvede.
- **Terén** (LiDAR, 0,8): mračno z dronu nemá třídu terénu. Když ji soubor nemá, dialog začne na {{ui:Najít terén sám (drony, mračna bez třídy terénu)}}: načtou se všechny třídy kromě šumu, ponechá se nejnižší bod v každé buňce a potom CivilCraft odstraní budovy, stromy a nahodilé nízké body progresivním morfologickým filtrem (Zhang a další, 2003), který můžete řídit: **Největší objekt k odstranění** (šířka největší budovy; okna narostou, dokud ji nepokryjí; 0 znamená 20 buněk) a **Nejstrmější sklon terénu**. Práce se provádí na mřížce nejnižších bodů, takže mračno o desítkách milionů bodů nestojí víc než počet svých buněk (proředění je jeden průchod daty). Rozestup je velikost buňky: hrubší je rychlejší a malé objekty přehlédne méně, než byste čekali; jemnější zachová více detailů terénu. Hlášení uvádí, kolik bodů bylo ponecháno jako terén, kolik buněk bylo odstraněno jako objekty a kolik nahodilých nízkých bodů bylo vyřazeno. Na smyšleném průzkumu dronem o délce 300 m s pěti budovami, 70 stromy a 200 nízkými odlehlými body byly ponechané body do 3 cm od skutečného terénu a žádná střecha ani koruna stromu nebyla ponechána.
- **Výšky v souboru**: metry, stopy nebo US survey feet. Pokud to soubor uvádí, jednotka je už zvolena. Pokud ne, musíte ji zvolit: dialog ukáže rozsah výšek v obou variantách, abyste poznali, která dává smysl pro lokalitu.
- **Importovat jako** (jen mřížky): {{ui:Zaměřovací body (popis DEM)}}, nebo {{ui:Samotný povrch (síť trojúhelníků)}}.

Jeden import přečte nejvýše 500 000 bodů. Pokud by volba dala víc, dialog uvede o kolik a jaký rozestup by se vešel, a {{ui:Importovat}} zůstane vypnuté.

Klikněte na {{ui:Importovat}}. Ukazatel průběhu ukazuje čtení; {{ui:Zrušit}} jej zastaví a nic se nezmění.

:::warning
Svislé jednotky jsou častá past. Mnoho DEM ve státní rovině má souřadnice východ a sever ve stopách, ale výšky v metrech. Porovnejte rozsah, který dialog ukazuje, s tím, co o lokalitě víte.
:::

## Co dostanete

- **Zaměřovací body**: očíslované za vaším nejvyšším číslem bodu, s popisem `DEM` (mřížky) nebo `LIDAR`, takže tvoří jednu skupinu bodů pod **Body** a z povrchu se vytvoří jako z jakýchkoli jiných bodů. Import je jeden krok: {{key:Mod+Z}} je zase odstraní.
- **Samotný povrch**: mřížkový TIN, dva trojúhelníky na buňku, rozdělené diagonálou jihozápad–severovýchod. Trojúhelník, jehož roh nemá data, se vynechá, takže díry v datech zůstanou dírami. Povrch se v každém bodě mřížky rovná mřížce a uvnitř každého trojúhelníku je to rovina mezi nimi. Nahradí povrch projektu (dialog se nejdřív zeptá); {{key:Mod+Z}} vrátí předchozí povrch. Nadpis levého panelu říká **Povrch (z mřížky výšek)**.

## Souřadnicové systémy

- Pokud má projekt souřadnicový systém a soubor uvádí jiný, každý bod se převede do systému projektu (a na jeho místní nebo terénní souřadnice, pokud je má).
- Pokud projekt žádný nemá a systém souboru je v jednotkách projektu (stopy nebo metry), dialog nabídne, že jej nastaví jako souřadnicový systém projektu, ve stejném kroku vrácení zpět jako body.
- Pokud je soubor v zeměpisné šířce a délce, nebo v metrech u projektu ve stopách, dialog vás nejdřív požádá o výběr souřadnicového systému projektu.
- Pokud soubor neuvádí nic, jeho čísla se berou jako souřadnice projektu. Místo toho můžete zvolit systém souboru.

## Export povrchu jako GeoTIFF

1. Klikněte na {{ui:Export}} ve skupině GIS.
2. V části GeoTIFF vyberte povrch (stávající terén nebo upravený povrch) a velikost buňky. Výchozí hodnota vychází z průměrné hrany trojúhelníku povrchu. Dialog ukazuje velikost mřížky, kterou zapíše.
3. Klikněte na {{ui:Stáhnout GeoTIFF}}.

Soubor je jedno pásmo 32bitových výšek s plovoucí desetinnou čárkou v jednotkách projektu, přes rozsah povrchu; buňky mimo povrch jsou "žádná data" (−3.4028235e38). Hodnota každé buňky je výška povrchu ve středu buňky. Souřadnice jsou **mřížkové**: projekt v terénních nebo místních souřadnicích se převede zpět na mřížku. Soubor pojmenuje souřadnicový systém projektu kódem EPSG; systém bez kódu EPSG se nezapíše a dialog vás upozorní, abyste oddělení GIS řekli, o který systém jde.

## Co bylo ověřeno

- Čtečky GeoTIFF a ASCII mřížky byly ověřeny proti GDAL (přes rasterio), knihovně, kterou většina GIS programů používá ke čtení těchto souborů: mřížky 32bitové s plovoucí čárkou a 16bitové celočíselné, dlaždicové i pásové, DEFLATE a LZW, nodata, měřítko a posun, pixel-is-point, mřížka UTM, mřížka státní roviny v US survey feet a mřížka v zeměpisné šířce a délce — každá hodnota se shodovala.
- Čtečky LAS a LAZ byly ověřeny proti laspy: LAS 1.2 a 1.4, formáty bodů 0, 1, 3, 6, 7 a 8, se souřadnicovým systémem i bez něj, a LAZ zapsaný kompatibilním backendem LASzip — každý bod se shodoval.
- Převedené souřadnice byly ověřeny proti PROJ na 1 mm.
- Exportované GeoTIFF byly přečteny zpět v GDAL: souřadnicový systém, polohy buněk, nodata, jednotky a hodnoty shodné s povrchem na 0,0001.
- Nic zde nebylo otevřeno v jiných GIS nebo CAD programech.

## Ještě není hotovo

- Změny svislého datu (modely geoidu): výšky se berou tak, jak je soubor má.
- Data průběhu vlny, odrazy LiDAR jinak než podle třídy, barvy a intenzity.
- Několik pásem, přehledy, nebo soubory větší než 200 MB.
- Zápis LAS nebo LAZ z povrchu nebo z tohoto nástroje (doplněk [Mračna bodů](topic:point-clouds) zapisuje vyčištěné mračno jako LAS 1.4 nebo LAZ).
