---
title: Výškové mriežky a LiDAR
summary: Vytvorte jestvujúci terén z DEM (GeoTIFF alebo ASCII mriežka) alebo z bodov LiDAR (LAS, LAZ) — vyberte oblasť, zredukujte dáta, zvoľte triedy a skontrolujte jednotky výšok — a vráťte povrch ako výškovú mriežku GeoTIFF.
keywords: dem, dtm, výšková mriežka, geotiff, tif, ascii mriežka, asc, lidar, las, laz, mračno bodov, triedy, terén, redukcia, nodata, raster, export geotiff, gis
from: c8b2d18a
---

Verejné výškové dáta prichádzajú dvoma spôsobmi: **výškové mriežky** (DEM: jedna výška na každú štvorcovú bunku, zvyčajne GeoTIFF `.tif` alebo ASCII mriežka `.asc`) a **body LiDAR** (milióny laserových odrazov v súbore `.las`, alebo `.laz`, ak je komprimovaný). CivilCraft z oboch vytvorí zamerané body alebo povrch priamo v prehliadači: nič sa nenahráva na server.

## Otvorenie súboru

1. Kliknite na {{ui:Otvoriť}} (alebo na {{ui:Importovať}} v skupine GIS), vyberte súbor alebo ho presuňte na pôdorys. Pri ASCII mriežke vyberte aj jej súbor `.prj`, aby CivilCraft poznal jej súradnicový systém.
2. Dialóg importu zobrazí, čo o sebe súbor hovorí: jeho veľkosť, bunky alebo body, súradnicový systém, polohu v zemepisnej šírke a dĺžke a rozsah výšok. Pri LiDAR najprv prečíta každý bod raz, aby spočítal **triedy** (ukazovateľ priebehu ukazuje, koľko je hotové; {{ui:Zrušiť}} ho zastaví).

GeoTIFF s tromi alebo štyrmi pásmami (červená, zelená, modrá) je obrázok, nie výšky: ide namiesto toho do mapových vrstiev.

## Výber dát na import

- **Oblasť**: {{ui:Rozsah projektu a okraj}} (zadajte okraj), {{ui:Čo teraz ukazuje pôdorys}} alebo {{ui:Celý súbor}}. Číta sa len táto časť súboru.
- **Zredukovať na**: rozostup bodov, ktoré dostanete, v jednotkách projektu. Riadok pod nastaveniami ukazuje, koľko bodov to dá, keď píšete. Pri mriežke CivilCraft ponechá každú druhú, tretiu … bunku, takže výšky zostanú presne také, aké sú v súbore; bunky nikdy nespriemeruje. Pri LiDAR sa oblasť rozdelí na štvorce tejto veľkosti a z každého ostane jeden bod: {{ui:Bod najbližšie k stredu každej bunky}} (predvolené), {{ui:Najnižší bod v každej bunke}} (vhodné, ak súbor nemá triedu terénu: terén je pod stromami) alebo {{ui:Priemer bodov každej bunky}}.
- **Triedy** (LiDAR): trieda terénu (trieda 2) je zaškrtnutá, keď ju súbor má; budovy, stromy a šum sa vynechajú. Keď súbor nemá triedu terénu, zaškrtnuté sú všetky triedy a dialóg to uvedie.
- **Terén** (LiDAR, 0.8): oblak z dronu nemá triedu terénu. Keď ju súbor nemá, dialóg začína na {{ui:Nájsť terén sám (dronové oblaky, bez triedy terénu)}}: načítajú sa všetky triedy okrem šumu, v každej bunke sa ponechá najnižší bod a potom CivilCraft odstráni budovy, stromy a náhodné nízke body progresívnym morfologickým filtrom (Zhang a ďalší, 2003), ktorý môžete nastaviť: **Najväčší objekt na odstránenie** (šírka najväčšej budovy; okná rastú, kým ju nepokryjú; 0 znamená 20 buniek) a **Najstrmší sklon terénu**. Práca sa robí na mriežke najnižších bodov, takže oblak s desiatkami miliónov bodov nestojí viac než počet jeho buniek (redukcia je jeden prúdový prechod). Rozostup je veľkosť bunky: hrubšia je rýchlejšia a menšie objekty prehliadne menej, než by ste čakali; jemnejšia zachová viac detailov terénu. Hlásenie uvedie, koľko bodov sa ponechalo ako terén, koľko buniek sa odstránilo ako objekty a koľko náhodných nízkych bodov sa zahodilo. Na zmyslenom 300 m dronovom prieskume s piatimi budovami, 70 stromami a 200 nízkymi odľahlými bodmi boli ponechané body do 3 cm od skutočného terénu a žiadna strecha ani koruna sa neponechala.
- **Výšky v súbore**: metre, stopy alebo americké prieskumné stopy. Keď to súbor uvádza, jednotka je už zvolená. Keď nie, musíte zvoliť: dialóg zobrazí rozsah výšok v oboch smeroch, aby ste videli, ktorá dáva zmysel pre lokalitu.
- **Importovať ako** (len mriežky): {{ui:Zamerané body (popis DEM)}} alebo {{ui:Samotný povrch (mriežka trojuholníkov)}}.

Jeden import má najviac 500 000 bodov. Keď by voľba dala viac, dialóg uvedie, o koľko, a aký rozostup by sa zmestil, a {{ui:Importovať}} zostane vypnuté.

Kliknite na {{ui:Importovať}}. Ukazovateľ priebehu zobrazuje načítavanie; {{ui:Zrušiť}} ho zastaví a nič sa nezmení.

:::warning
Zvislé jednotky sú častá pasca. Mnohé DEM v štátnej rovinnej sústave majú X a Y v stopách, ale výšky v metroch. Porovnajte rozsah, ktorý dialóg zobrazí, s tým, čo viete o lokalite.
:::

## Čo dostanete

- **Zamerané body**: očíslované za vaším najvyšším číslom bodu, s popisom `DEM` (mriežky) alebo `LIDAR`, takže tvoria jednu skupinu bodov pod **Body** a z povrchu sa vytvoria ako ktorékoľvek iné body. Import je jeden krok: {{key:Mod+Z}} ich znova odstráni.
- **Samotný povrch**: mriežka TIN, dva trojuholníky na bunku, rozdelené na uhlopriečke juhozápad – severovýchod. Trojuholník s rohom bez dát sa vynechá, takže diery v dátach zostanú dierami. Povrch sa zhoduje s mriežkou v každom jej bode a medzi nimi je v každom trojuholníku rovina. Nahradí povrch projektu (dialóg sa najprv opýta); {{key:Mod+Z}} vráti predchádzajúci povrch. Nadpis ľavého panela hovorí **Povrch (z výškovej mriežky)**.

## Súradnicové systémy

- Keď má projekt súradnicový systém a súbor uvádza iný, každý bod sa prevedie do systému projektu (a do jeho terénnych alebo miestnych súradníc, ak ich má).
- Keď projekt žiadny nemá a súradnicový systém súboru je v jednotkách projektu (stopy alebo metre), dialóg ponúkne, že ho urobí súradnicovým systémom projektu, v tom istom kroku späť ako body.
- Keď je súbor v zemepisnej šírke a dĺžke, alebo v metroch pri projekte v stopách, dialóg vás najprv požiada, aby ste vybrali súradnicový systém projektu.
- Keď súbor neuvádza systém, jeho čísla sa vezmú ako súradnice projektu. Môžete namiesto toho zvoliť systém súboru.

## Export povrchu ako GeoTIFF

1. Kliknite na {{ui:Export}} v skupine GIS.
2. V časti GeoTIFF zvoľte povrch (jestvujúci terén alebo upravený povrch) a veľkosť bunky. Predvolená hodnota pochádza z priemernej hrany trojuholníka povrchu. Dialóg ukáže veľkosť mriežky, ktorú zapíše.
3. Kliknite na {{ui:Stiahnuť GeoTIFF}}.

Súbor je jedno pásmo 32-bitových čísel s plávajúcou desatinnou čiarkou, v jednotkách projektu, cez rozsah povrchu; bunky mimo povrchu sú „žiadne dáta“ (−3.4028235e38). Hodnota každej bunky je výška povrchu v strede bunky. Súradnice sú **mriežkové**: projekt v terénnych alebo miestnych súradniciach sa prevedie späť do mriežky. Súbor uvádza súradnicový systém projektu kódom EPSG; systém bez kódu EPSG sa nezapíše a dialóg vás upozorní, aby ste oddeleniu GIS povedali, o aký systém ide.

## Čo bolo overené

- Čítačky GeoTIFF a ASCII mriežok boli overené proti GDAL (cez rasterio), knižnici, ktorú používa väčšina programov GIS na čítanie týchto súborov: mriežky 32-bitových float a 16-bitových celých čísel, dlaždicové aj pásové, DEFLATE a LZW, nodata, mierka a posun, pixel-is-point, mriežka UTM, mriežka štátnej rovinnej sústavy v amerických prieskumných stopách a mriežka zemepisnej šírky a dĺžky — každá hodnota sa zhodovala.
- Čítačky LAS a LAZ boli overené proti laspy: LAS 1.2 a 1.4, formáty bodov 0, 1, 3, 6, 7 a 8, so súradnicovým systémom aj bez neho, a LAZ zapísaný backendom kompatibilným s LASzip — každý bod sa zhodoval.
- Prevedené súradnice boli overené proti PROJ na 1 mm.
- Exportované GeoTIFFy boli čítané späť cez GDAL: súradnicový systém, pozície buniek, nodata, jednotky a hodnoty rovnaké s povrchom na 0.0001.
- Nič tu nebolo otvorené v iných programoch GIS ani CAD.

## Ešte nie je hotové

- Zmeny vertikálneho datumu (modely geoidu): výšky sa používajú tak, ako ich súbor má.
- Dáta waveform, odrazy LiDAR iné než podľa triedy, farby a intenzity.
- Viac pásiem, prehľady (overviews) alebo súbory väčšie ako 200 MB.
- Zápis LAS alebo LAZ z povrchu alebo z tohto nástroja ([Mračná bodov](topic:point-clouds) doplnok zapíše vyčistené mračno ako LAS 1.4 alebo LAZ).
