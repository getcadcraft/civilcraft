---
title: Höjdrutnät och LiDAR
summary: Bygg den befintliga marken från en DEM (GeoTIFF eller ASCII-rutnät) eller LiDAR-punkter (LAS, LAZ) — välj område, gallra data, välj klasser och kontrollera höjdenheterna — och lämna tillbaka en terrängmodell som ett GeoTIFF-höjdrutnät.
keywords: dem, dtm, höjdrutnät, geotiff, tif, ascii-rutnät, asc, lidar, las, laz, punktmoln, klasser, mark, gallring, nodata, raster, exportera geotiff, gis
from: c8b2d18a
---

Offentliga höjddata kommer på två sätt: **höjdrutnät** (en DEM: en höjd per kvadratisk cell, oftast en GeoTIFF `.tif` eller ett ASCII-rutnät `.asc`) och **LiDAR-punkter** (miljontals laserekon i en `.las`-fil, eller `.laz` när den är komprimerad). CivilCraft gör antingen om dem till inmätningspunkter eller en terrängmodell, i webbläsaren: inget laddas upp.

## Öppna filen

1. Klicka på {{ui:Öppna}} (eller {{ui:Importera}} i GIS-gruppen) och välj filen, eller dra den till planen. För ett ASCII-rutnät väljer du även dess `.prj`-fil, så att CivilCraft känner till dess koordinatsystem.
2. Importdialogen visar vad filen säger om sig själv: dess storlek, celler eller punkter, dess koordinatsystem, var den ligger i latitud och longitud och dess höjdintervall. För LiDAR läser den först varje punkt en gång för att räkna **klasserna** (en förloppsindikator visar hur långt det har kommit; {{ui:Avbryt}} stoppar den).

En GeoTIFF med tre eller fyra band (röd, grön, blå) är en bild, inte höjder: den hamnar i kartlagren i stället.

## Välj vad som ska hämtas

- **Område**: {{ui:Projektets utsträckning och en marginal}} (skriv marginalen), {{ui:Vad planen visar nu}} eller {{ui:Hela filen}}. Bara den delen av filen läses.
- **Gallra till**: avståndet mellan de punkter du får, i projektets enheter. Raden under inställningarna visar hur många punkter det ger när du skriver. För ett rutnät behåller CivilCraft varannan, var tredje … cell, så att höjderna förblir exakt filens; den räknar aldrig ut medelvärden av celler. För LiDAR delas området i kvadrater av den storleken och en punkt behålls per kvadrat: {{ui:Punkten närmast varje cells mitt}} (standardvalet), {{ui:Den lägsta punkten i varje cell}} (bra när filen saknar markklass: marken ligger under träden) eller {{ui:Medelvärdet av varje cells punkter}}.
- **Klasser** (LiDAR): mark (klass 2) är ikryssad när filen har den; byggnader, träd och brus lämnas bort. När det inte finns någon markklass är alla klasser ikryssade, och dialogrutan säger det.
- **Mark** (LiDAR, 0.8): ett drönarmoln har ingen markklass. När filen saknar en börjar dialogrutan på {{ui:Hitta marken själv (dronarmoln, ingen markklass)}}: alla klasser utom brus läses, den lägsta punkten i varje cell behålls, och sedan tar CivilCraft bort byggnader, träd och lösa låga punkter med ett progressivt morfologiskt filter (Zhang m.fl., 2003) som du kan styra: **Största objekt att ta bort** (bredden på den största byggnaden; fönster växer tills de täcker den; 0 betyder 20 celler) och **Brantaste markslutning**. Arbetet görs på rutnätet av de lägsta punkterna, så ett moln med tiotals miljoner punkter kostar inte mer än sitt antal celler (gallringen är ett enda strömmande pass). Avståndet är cellen: en grövre är snabbare och missar små objekt mindre än man kanske tror, en finare behåller mer markdetalj. Rapporten säger hur många punkter som behölls som mark, hur många celler som togs bort som objekt och hur många lösa låga punkter som släpptes. På en påhittad 300 m drönarmätning med fem byggnader, 70 träd och 200 låga avvikare låg de behållna punkterna inom 3 cm från den verkliga terrängen och inget tak eller krontak behölls.
- **Höjder i filen**: meter, fot eller US survey feet. När filen anger det är enheten redan vald. När den inte gör det måste du välja: dialogrutan visar höjdintervallet åt båda hållen så att du kan se vilket som stämmer för platsen.
- **Importera som** (endast rutnät): {{ui:Inmätningspunkter (beskrivning DEM)}} eller {{ui:Själva terrängmodellen (ett rutnät av trianglar)}}.

En import tar högst 500,000 punkter. När ett val skulle ge fler säger dialogrutan med hur mycket och vilket avstånd som skulle passa, och {{ui:Importera}} förblir inaktiv.

Klicka på {{ui:Importera}}. En förloppsindikator visar inläsningen; {{ui:Avbryt}} stoppar den och ingenting ändras.

:::warning
Vertikala enheter är en vanlig fallgrop. Många DEM i state plane har östvärden och nordvärden i fot men höjder i meter. Jämför intervallet som dialogrutan visar med vad du vet om platsen.
:::

## Vad du får

- **Inmätningspunkter**: numrerade efter ditt högsta punktnummer, med beskrivningen `DEM` (rutnät) eller `LIDAR`, så att de bildar en punktgrupp under **Punkter** och bygger terrängmodellen som alla andra punkter. Att importera dem är ett steg: {{key:Mod+Z}} tar bort dem igen.
- **Själva terrängmodellen**: en TIN för rutnät, två trianglar per cell, delad längs diagonalen från sydväst till nordost. En triangel med ett hörn som saknar data utelämnas, så att hål i data förblir hål. Terrängmodellen är lika med rutnätet i varje rutnätspunkt och är ett plant plan inom varje triangel mellan dem. Den ersätter projektets terrängmodell (dialogrutan frågar först); {{key:Mod+Z}} återställer den föregående terrängmodellen. Vänsterpanelens rubrik säger **Terrängmodell (från ett höjdrutnät)**.

## Koordinatsystem

- Om projektet har ett koordinatsystem och filen anger ett annat, konverteras varje punkt till projektets system (och till dess markkoordinater eller lokala koordinater när de finns).
- Om projektet saknar ett och filens system är i projektets enheter (fot eller meter), erbjuder dialogrutan att göra det till projektets koordinatsystem, i samma ångringssteg som punkterna.
- Om filen är i latitud och longitud, eller i meter för ett projekt i fot, frågar dialogrutan först efter vilket koordinatsystem projektet ska ha.
- Om filen inte anger något tas dess tal som projektets koordinater. Du kan i stället välja filens system.

## Exportera en terrängmodell som GeoTIFF

1. Klicka på {{ui:Exportera}} i GIS-gruppen.
2. I GeoTIFF-delen väljer du terrängmodellen (befintlig mark eller den planerade terrängmodellen) och cellstorleken. Standardvärdet kommer från terrängmodellens genomsnittliga triangelkant. Dialogrutan visar storleken på rutnätet som den skriver.
3. Klicka på {{ui:Ladda ner GeoTIFF}}.

Filen är ett band med 32-bitars flyttalshöjder i projektets enheter, över terrängmodellens utsträckning; celler utanför terrängmodellen är ”inga data” (−3.4028235e38). Varje cells värde är terrängmodellens höjd i cellens mitt. Koordinaterna är **rutnätskoordinater**: ett projekt i markkoordinater eller lokala koordinater omvandlas tillbaka till rutnätet. Filen anger projektets koordinatsystem med dess EPSG-kod; ett system utan EPSG-kod skrivs inte, och dialogrutan varnar dig att berätta för GIS-avdelningen vilket system det är.

## Vad som har kontrollerats

- Läsarna för GeoTIFF och ASCII-rutnät har kontrollerats mot GDAL (via rasterio), biblioteket som de flesta GIS-program använder för att läsa dessa filer: rutnät med 32-bitars flyttal och 16-bitars heltal, kakel- och strimmade, DEFLATE och LZW, nodata, skala och förskjutning, pixel-is-point, ett UTM-rutnät, ett state plane-rutnät i US survey feet och ett latitud/longitud-rutnät — varje värde lika.
- LAS- och LAZ-läsarna har kontrollerats mot laspy: LAS 1.2 och 1.4, punktformat 0, 1, 3, 6, 7 och 8, med och utan koordinatsystem, och LAZ skriven av dess LASzip-kompatibla backend — varje punkt lika.
- Omvandlade koordinater har kontrollerats mot PROJ till 1 mm.
- Exporterade GeoTIFF-filer lästes tillbaka av GDAL: koordinatsystem, cellpositioner, nodata, enheter och värden lika med terrängmodellen till 0.0001.
- Inget här har öppnats i andra GIS- eller CAD-program.

## Finns inte ännu

- Ändringar av vertikal datum (geoidmodeller): höjder används så som filen har dem.
- Vågformsdata, LiDAR-ekon på annat sätt än per klass, färger och intensiteter.
- Flera band, översiktsbilder eller filer över 200 MB.
- Skrivning av LAS eller LAZ från en terrängmodell eller från detta verktyg (tillägget [Punktmoln](topic:point-clouds) skriver ett rensat moln som LAS 1.4 eller LAZ).
