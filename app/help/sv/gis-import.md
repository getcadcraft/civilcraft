---
title: Importera GIS-data
summary: Hämta shapefiler, GeoJSON och GeoPackage till ett projekt som GIS-lager, placera dem via rätt koordinatsystem, titta på deras attribut och använd dem för terrängmodellen.
keywords: gis, etiketter, etikettera objekt, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importera, lager, attribut, koordinatsystem, epsg, latitud, longitud, höjdkurvor, fastigheter, brytlinjer, gräns
from: f6b235cc
---

Kommuner och län delar ut platsunderlag som GIS-filer: fastigheter, servitut, höjdkurvor, ledningar, mätstommar. CivilCraft öppnar tre slags av dem som **GIS-lager** som ligger under din konstruktion på planen.

| Fil | Vad du öppnar |
|---|---|
| Shapefile | `.shp` tillsammans med dess `.shx`, `.dbf`, `.prj` och `.cpg` (markera alla), eller `.zip` de kom i. En zip med flera shapefiler ger flera lager. |
| GeoJSON | `.geojson`-filen (en `.json`-fil vars första rader säger `FeatureCollection` eller `Feature` fungerar också). |
| GeoPackage | `.gpkg`-filen. Varje objekttabell i den listas. |
| KML eller KMZ | `.kml`-filen (från Google Earth eller en webbkarta), eller den zippade `.kmz`. Varje mapp blir ett lager (delas upp i punkter, linjer och polygoner när den har flera slag); ett platsmärkes namn, beskrivning och utökade data blir dess attribut. Höjder anges i meter och i latitud och longitud, som i GeoJSON. |

Punkter, multipunkter, linjer, polygoner med hål och flerdelade former läses, med sina höjder (z) när filen har dem. Mätvärden (M) utelämnas. Höjdrutnät och LiDAR öppnas på samma sätt: se [Höjdrutnät och LiDAR](topic:elevation-grids-and-lidar).

## Öppna filerna

1. Klicka på {{ui:Import}} i gruppen **GIS** (eller {{ui:Open}}), välj filerna, eller släpp dem på planen. Filerna läses på den här datorn; inget laddas upp.
2. Dialogrutan **Importera GIS-data** listar varje lager som hittats: dess typ, hur många objekt (och hur många som saknar geometri), hur många attributfält, och koordinatsystemet filen anger. Avmarkera de lager du inte vill ha.
3. Läs delen **Koordinatsystem** (nedan) och raden **Vad händer**, klicka sedan på {{ui:Import}}.
4. Lagren visas på planen och under **GIS-lager** i den vänstra panelen. Importen är ett steg: {{key:Mod+Z}} tar tillbaka den.

En stor fil visar en förloppsrad över planen med en knapp för {{ui:Cancel}}.

## Koordinatsystemet

GIS-filer anger var de ligger genom ett koordinatsystem (en shapefils `.prj`, en GeoPackages tabell för referenssystem; GeoJSON är alltid latitud och longitud). CivilCraft konverterar varje lager från dess eget system till projektets. Det gissar aldrig:

- **Projektet har ett koordinatsystem** (ställs in under {{ui:Coordinates}}): varje lager med ett eget system konverteras till det, inklusive en mark- eller lokal justering. En fil utan `.prj` får två val: **Samma som projektet** (dess siffror läses in som de är) eller **Välj filens system**.
- **Projektet har inget, och filen är i ett projicerat system i projektets enheter** (en state plane-zon i US survey feet för ett projekt i fot, till exempel): dialogrutan erbjuder **Använd det systemet som projektets koordinatsystem**. Det sätts i samma steg i ångra som importen. Ingenting i projektet flyttas; systemet anger bara vad siffrorna betyder. Du kan välja ett annat system för projektet i stället, och lagren konverteras till det.
- **Projektet har inget, och filen är i latitud och longitud** (alla GeoJSON) **eller i andra enheter**: {{ui:Import}} är nedtonad tills du väljer projektets koordinatsystem. Väljaren startar nära datat.
- **Varken projektet eller filerna anger något system**: siffrorna läses in som de är, och dialogrutan säger det.

Höjder konverteras också: GeoJSON-höjder är meter (GeoJSON-standarden säger det); andra filers höjder tas i enheten för deras eget system.

:::warning
Positioner i en GeoJSON-fil utanför ±180° longitud eller ±90° latitud är inte latitud och longitud. De objekten utelämnas och dialogrutan säger hur många. En sådan fil är oftast en projicerad fil som sparats utan sitt system; be om den igen, eller om shapefilen med dess `.prj`.
:::

NAD83 behandlas som samma som WGS 84 (systemet GeoJSON använder); de två skiljer sig några meter i Nordamerika, så GeoJSON-data kan vara fel med så mycket. Där den bästa förskjutningen kräver en rutnätsfil (NADCON för NAD27, till exempel) använder CivilCraft en grövre publicerad förskjutning, och dialogrutan för koordinatsystemet visar hur grov den är (för NAD27, ungefär 20 m), tills du lägger till rutnätsfilen: se [Rutnätsförskjutningsfiler](topic:coordinate-systems).

## GIS-lager

Varje rad under **GIS-lager** har:

- en kryssruta för att visa eller dölja lagret (dolda lager väljs inte heller);
- sin färg, vald från listan;
- en meny (de tre prickarna) med {{ui:Zoom to}}, {{ui:Use for the surface…}}, {{ui:Rename…}} och {{ui:Remove}}.

Visa, dölja, ändra färg, byta namn och ta bort är steg i ångra. GIS-lager sparas i projektfilen och kommer tillbaka när du öppnar den. De följer också med planens PDF-utskrift och dess DXF- och DWG-exporter, var och en på ett lager som heter `GIS-` och dess nummer.

## Etikettera objekt från ett attribut

I lagrets {{ui:More}}-meny (de tre prickarna i **GIS-lager**) väljer du ett fält under **Etikettera med**: varje objekt visar sitt värde på planen, i lagrets färg. Punkter etiketteras bredvid punkten, linjer längs mitten av sin längsta del (vänd så att de läses från vänster till höger), polygoner i sin mitt. Tal visas med upp till tre decimaler. Etiketter är 1.8 mm höga på papper i alla skalor, och de går med i PDF-utskriften, DXF och DWG. Välj **Inga etiketter** för att ta bort dem; varje ändring är ett steg ({{key:Mod+Z}} ångrar det). Ett lager etiketterar högst 5,000 objekt.

## Titta på ett objekt

Med {{ui:Select}} på klickar du på ett objekt. **Egenskaper** visar dess lager, vilket objekt det är, dess form (delar, hål, hörn), dess höjder, filen det kom från och den filens koordinatsystem, och sedan varje attribut i en tabell. Attributen är skrivskyddade: CivilCraft visar GIS-data så som den kom, den redigerar den inte.

Punkter väger tyngre än linjer när båda ligger under pekaren; inne i en polygon väljs den minsta polygonen.

## Använd för terrängmodellen

Öppna ett lagers meny och välj {{ui:Use for the surface…}} (eller knappen i **Egenskaper**). Vad som erbjuds beror på lagret:

| Lager | Kan bli |
|---|---|
| Linjer med höjder (3D-linjer) | Brytlinjer på sina egna höjder |
| Linjer utan höjder men med ett talfält (höjdkurvor) | Brytlinjer på höjden i fältet du väljer |
| Polygoner | Terrängmodellens gräns (den markerade polygonen, annars den största), eller brytlinjer längs deras kanter |
| Punkter med höjder, eller med ett höjdfält | Mätpunkter, beskrivna med lagrets namn så att de bildar en punktgrupp |

Varje användning är ett steg i ångra som kopierar geometrin in i projektet; lagret självt förblir som det är. Höjder tas i projektets enheter.

## Punktfiler med latitud och longitud

En punktfil vars rubrikrad anger kolumner för latitud och longitud (`lat`, `latitude`, `lon`, `long`, `longitude`) läses som grader, inte som nordvärde och östvärde. Importdialogen säger det. Vid {{ui:Import}} konverteras punkterna till projektets koordinatsystem; ett projekt utan ett sådant frågar dig först att välja det. Grader laddas aldrig som fot. Rader utanför ±90° latitud eller ±180° longitud avvisas med skälet. Höjdkolumnen tas som den är, i projektets enheter.

## LandXML-filer som anger ett koordinatsystem

När en LandXML-fil du öppnar har ett `CoordinateSystem`-element (en EPSG-kod, en WKT-beskrivning eller ett systemnamn) erbjuder CivilCraft det som projektets koordinatsystem. Ingenting flyttas om du godkänner; systemet anger bara vad siffrorna betyder.

## Vad som kontrollerats

- Varje läsare jämfördes med GDAL, biblioteket de flesta GIS-program använder för att läsa dessa filer, på filer som GDAL skrivit: shapefiler av alla slag med och utan höjder, flerdelade linjer, polygoner med hål, tomma geometrier, text-, tal-, datum- och sant/falskt-attribut, UTF-8- och Windows-1252-text med och utan `.cpg`, en zip med flera shapefiler, GeoJSON med varje geometrityp, och en GeoPackage med fyra tabeller. Varje geometri, höjd och attribut stämde.
- Positioner konverterade från latitud och longitud, och från UTM, stämde mot PROJ (projektionsbiblioteket bakom GDAL) inom 3 mm.
- Skadade filer (avbrutna, med felaktiga storlekar, trasiga zip-filer eller trasiga GeoPackage-filer) ger ett enkelt meddelande; ingenting hänger sig.
- Inget här har ännu öppnats i andra GIS-program, och filgeodatabaser, KML och KMZ läses ännu inte (se [Finns inte ännu](topic:not-built-yet)).
