---
title: Høydegrid og LiDAR
summary: Bygg eksisterende terreng fra en DEM (GeoTIFF eller ASCII grid) eller LiDAR-punkter (LAS, LAZ) — velg området, tynn ut dataene, velg klasser og kontroller høyde­enhetene — og eksporter en terrengmodell som et GeoTIFF-høydegrid.
keywords: dem, dtm, høydegrid, geotiff, tif, ascii grid, asc, lidar, las, laz, punktsky, klasser, bakke, uttynning, nodata, raster, eksporter geotiff, gis
from: c8b2d18a
---

Offentlige høydedata kommer på to måter: **høydegrid** (en DEM: én høyde per kvadratisk celle, vanligvis en GeoTIFF `.tif` eller et ASCII grid `.asc`) og **LiDAR-punkter** (millioner laserreturer i en `.las`-fil, eller `.laz` når den er komprimert). CivilCraft gjør om begge deler til oppmålingspunkter eller en terrengmodell, i nettleseren: ingenting lastes opp.

## Åpne filen

1. Klikk {{ui:Åpne}} (eller {{ui:Importer}} i GIS-gruppen) og velg filen, eller dra den inn på planen. For et ASCII grid velg også `.prj`-filen, slik at CivilCraft vet koordinatsystemet.
2. Importdialogen viser det filen sier om seg selv: størrelse, celler eller punkter, koordinatsystem, plassering i breddegrad og lengdegrad, og høydeområde. For LiDAR leses hvert punkt én gang først for å telle **klassene** (en fremdriftslinje viser hvor langt det er kommet; {{ui:Avbryt}} stopper det).

En GeoTIFF med tre eller fire kanaler (rød, grønn, blå) er et bilde, ikke høyder: den legges i kartlagene i stedet.

## Velg hva som skal hentes inn

- **Område**: {{ui:Prosjektets utstrekning og en margin}} (skriv inn marginen), {{ui:Det planen viser nå}}, eller {{ui:Hele filen}}. Bare den delen av filen leses.
- **Tynn ut til**: avstanden mellom punktene som hentes inn, i prosjektets enheter. Linjen under innstillingene viser hvor mange punkter det gir mens du skriver. For et grid beholder CivilCraft hver andre, tredje … celle, slik at høydene forblir nøyaktig filens; cellene slås aldri sammen. For LiDAR deles området i kvadrater av denne størrelsen, og ett punkt beholdes per kvadrat: {{ui:Punktet nærmest hver celles sentrum}} (standard), {{ui:Det laveste punktet i hver celle}} (godt når filen ikke har en bakkeklasse: bakken ligger under trærne) eller {{ui:Gjennomsnittet av hver celles punkter}}.
- **Klasser** (LiDAR): bakke (klasse 2) er avkrysset når filen har den; bygninger, trær og støy er utelatt. Når det ikke finnes en bakkeklasse, er alle klasser avkrysset, og dialogen sier det.
- **Bakke** (LiDAR, 0.8): en drone-sky har ingen bakkeklasse. Når filen ikke har noen, starter dialogen på {{ui:Finn bakken selv (droneskyer, ingen bakkeklasse)}}: alle klasser unntatt støy leses, det laveste punktet i hver celle beholdes, og så fjerner CivilCraft bygninger, trær og løse lave punkter med et progressivt morfologisk filter (Zhang m.fl., 2003) som kan styres: **Største objekt som fjernes** (bredden på den største bygningen; vinduene vokser til de dekker den; 0 betyr 20 celler) og **Brattest bakkeskråning**. Arbeidet gjøres på rutenettet av laveste punkter, så en sky med titalls millioner punkter koster ikke mer enn antall celler (uttynningen er én strømmende gjennomgang). Avstanden er cellen: en grovere celle er raskere og bommer mindre på små objekter enn man kanskje tror, en finere celle beholder mer bakkedetaljer. Rapporten sier hvor mange punkter som ble beholdt som bakke, hvor mange celler som ble fjernet som objekter, og hvor mange løse lave punkter som ble droppet. I en fiktiv 300 m drone-måling med fem bygninger, 70 trær og 200 lave utliggere lå de beholdte punktene innen 3 cm fra det virkelige terrenget, og ingen tak eller tredekke ble beholdt.
- **Høyder i filen**: meter, fot eller US survey-fot. Når filen sier det, er enheten allerede valgt. Når den ikke gjør det, må enheten velges: dialogen viser høydeområdet begge veier, slik at det blir klart hva som gir mening for stedet.
- **Importer som** (kun grid): {{ui:Oppmålingspunkter (beskrivelse DEM)}}, eller {{ui:Selve terrengmodellen (et rutenett av trekanter)}}.

En import tar høyst 500,000 punkter. Når et valg ville gi flere, sier dialogen hvor mye for mye det er og hvilken avstand som ville passe, og {{ui:Importer}} er deaktivert.

Klikk {{ui:Importer}}. En fremdriftslinje viser lesingen; {{ui:Avbryt}} stopper den, og ingenting endres.

:::warning
Vertikale enheter er en vanlig felle. Mange state plane-DEM-er har øst og nord i fot, men høyder i meter. Sjekk området dialogen viser mot det du vet om stedet.
:::

## Resultatet

- **Oppmålingspunkter**: nummerert etter det høyeste punktnummeret, med beskrivelsen `DEM` (grid) eller `LIDAR`, slik at de danner én punktgruppe under **Punkter** og bygger terrengmodellen som alle andre punkter. Å importere dem er ett steg: {{key:Mod+Z}} tar dem ut igjen.
- **Terrengmodellen selv**: en rutenett-TIN, to trekanter per celle, delt på diagonalen sør-vest til nord-øst. En trekant med et hjørne uten data utelates, så hull i dataene forblir hull. Terrengmodellen er lik gridet i hvert gridpunkt og er et flatt plan inne i hver trekant mellom dem. Den erstatter prosjektets terrengmodell (dialogen spør først); {{key:Mod+Z}} henter forrige terrengmodell tilbake. Overskriften i venstre panel sier **Terrengmodell (fra et høydegrid)**.

## Koordinatsystemer

- Hvis prosjektet har et koordinatsystem og filen oppgir et annet, konverteres hvert punkt til prosjektets system (og til dets bakke- eller lokale koordinater når de finnes).
- Hvis prosjektet ikke har noe, og filens system er i prosjektets enheter (fot eller meter), tilbyr dialogen å gjøre det til prosjektets koordinatsystem, i samme angrer-steg som punktene.
- Hvis filen er i breddegrad og lengdegrad, eller i meter for et prosjekt i fot, ber dialogen om at prosjektets koordinatsystem velges først.
- Hvis filen ikke sier noe, tas tallene som prosjektets koordinater. Filens system kan velges i stedet.

## Eksporter en terrengmodell som GeoTIFF

1. Klikk {{ui:Eksporter}} i GIS-gruppen.
2. I GeoTIFF-delen velg terrengmodellen (eksisterende terreng eller den planlagte terrengmodellen) og cellestørrelsen. Standarden hentes fra terrengmodellens gjennomsnittlige trekantkant. Dialogen viser størrelsen på gridet den vil skrive.
3. Klikk {{ui:Last ned GeoTIFF}}.

Filen er ett bånd (kanal) med 32-bit flyttallshøyder i prosjektets enheter, over terrengmodellens utstrekning; celler utenfor terrengmodellen er «ingen data» (−3.4028235e38). Hver celles verdi er terrengmodellens høyde i cellens sentrum. Koordinatene er **grid**-koordinater: et prosjekt i bakke- eller lokale koordinater konverteres tilbake til gridet. Filen oppgir prosjektets koordinatsystem med sin EPSG-kode; et system uten EPSG-kode skrives ikke, og dialogen varsler om at GIS-avdelingen må få vite hvilket system det er.

## Hva som er kontrollert

- GeoTIFF- og ASCII grid-leserne er kontrollert mot GDAL (via rasterio), biblioteket de fleste GIS-programmer bruker til å lese disse filene: 32-bit flyttall og 16-bit heltallsgrid, flislagt og stripet, DEFLATE og LZW, nodata, skala og forskyvning, pixel-is-point, et UTM-grid, et state plane-grid i US survey-fot og et breddegrad/lengdegrad-grid — alle verdier like.
- LAS- og LAZ-leserne er kontrollert mot laspy: LAS 1.2 og 1.4, punktformatene 0, 1, 3, 6, 7 og 8, med og uten koordinatsystem, og LAZ skrevet av en LASzip-kompatibel motor — alle punkter like.
- Konverterte koordinater er kontrollert mot PROJ til 1 mm.
- Eksporterte GeoTIFF-filer er lest tilbake av GDAL: koordinatsystem, celleposisjoner, nodata, enheter og verdier like terrengmodellen til 0.0001.
- Ingenting her er åpnet i andre GIS- eller CAD-programmer.

## Ikke bygget ennå

- Endringer av vertikal datum (geoidmodeller): høyder brukes slik filen har dem.
- Bølgeformdata, LiDAR-returer utover klasse, farger og intensiteter.
- Flere kanaler, oversiktsbilder (overviews), eller filer over 200 MB.
- Skriving av LAS eller LAZ fra en terrengmodell eller fra dette verktøyet (tillegget [Punktskyer](topic:point-clouds) skriver en renset sky som LAS 1.4 eller LAZ).
