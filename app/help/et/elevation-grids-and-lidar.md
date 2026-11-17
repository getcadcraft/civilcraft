---
title: Kõrgusruudustikud ja LiDAR
summary: Koosta olemasolev maapind DEM-ist (GeoTIFF või ASCII-ruudustik) või LiDAR-punktidest (LAS, LAZ) — vali ala, hõrenda andmeid, vali klassid ja kontrolli kõrgusühikuid — ning anna pind tagasi GeoTIFF-kõrgusruudustikuna.
keywords: dem, dtm, kõrgusruudustik, geotiff, tif, ascii-ruudustik, asc, lidar, las, laz, punktipilv, klassid, maapind, hõrendamine, nodata, rasterandmed, geotiff-eksport, gis
from: c8b2d18a
---

Avalikud kõrgusandmed tulevad kahel viisil: **kõrgusruudustikud** (DEM: üks kõrgus ruutlahtri kohta, tavaliselt GeoTIFF `.tif` või ASCII-ruudustik `.asc`) ja **LiDAR-punktid** (miljoneid laserpeegeldusi `.las`-failis või `.laz`, kui see on tihendatud). CivilCraft muudab kumbagi brauseris mõõdistuspunktideks või pinnaks: midagi ei laadita üles.

## Faili avamine

1. Klõpsa {{ui:Ava}} (või {{ui:Impordi}} GIS-rühmas) ja vali fail või lohista see plaanile. ASCII-ruudustiku puhul vali ka selle `.prj`-fail, et CivilCraft teaks selle koordinaatsüsteemi.
2. Impordidialoog näitab, mida fail iseenda kohta ütleb: suurust, lahtreid või punkte, koordinaatsüsteemi, asukohta laiuskraadi ja pikkuskraadi järgi ning kõrgusvahemikku. LiDAR-i puhul loeb ta kõigepealt iga punkti ühe korra, et lugeda **klassid** (edenemisriba näitab, kui kaugel ta on; {{ui:Loobu}} peatab selle).

Kolme või nelja kanaliga GeoTIFF (punane, roheline, sinine) on pilt, mitte kõrgused: see läheb selle asemel kaardikihtidesse.

## Vali, mida sisse tuua

- **Ala**: {{ui:The project’s extents and a margin}} (sisesta varu), {{ui:What the plan shows now}} või {{ui:The whole file}}. Loetakse ainult see osa failist.
- **Hõrenda kuni**: saadavate punktide vahe projekti ühikutes. Seadistuse all olev rida näitab sisestamise ajal, mitu punkti see annab. Ruudustiku puhul jätab CivilCraft alles iga teise, kolmanda … lahtri, nii et kõrgused jäävad failiga täpselt samaks; lahtreid ei keskmistata kunagi. LiDAR-i puhul jaotatakse ala selle suurusega ruutudeks ja igast ruudust jäetakse alles üks punkt: {{ui:The point nearest each cell’s center}} (vaikimisi), {{ui:The lowest point in each cell}} (hea, kui failis pole maapinna klassi: maapind on puude all) või {{ui:The average of each cell’s points}}.
- **Klassid** (LiDAR): maapind (klass 2) on märgitud, kui failis see on; hooned, puud ja müra jäetakse välja. Kui maapinna klassi pole, on märgitud kõik klassid ja dialoog ütleb seda.
- **Maapind** (LiDAR, 0.8): droonipilvel maapinna klassi pole. Kui failis seda pole, alustab dialoog valikuga {{ui:Find the ground myself (drone clouds, no ground class)}}: loetakse kõik klassid peale müra, igas lahtris jäetakse alles madalaim punkt ja seejärel eemaldab CivilCraft hooned, puud ja juhuslikud madalad punktid progresseeruva morfoloogilise filtriga (Zhang jt, 2003), mida saad juhtida: **Suurim eemaldatav objekt** (suurima hoone laius; aknad kasvavad, kuni katavad selle; 0 tähendab 20 lahtrit) ja **Maapinna suurim kalle**. Töö tehakse madalaimate punktide ruudustikul, nii et kümnete miljonite punktidega pilv ei maksa rohkem kui oma lahtrite arv (hõrendamine on üks voogedastuskäik). Vahe on lahtri suurus: suurem lahter on kiirem ja väiksemaid objekte jääb märkamata vähem, kui arvata võiks; peenem lahter säilitab rohkem maapinna detaile. Aruanne ütleb, mitu punkti jäeti maapinnaks, mitu lahtrit eemaldati objektidena ja mitu juhuslikku madalat punkti visati välja. Väljamõeldud 300 m droonimõõdistusel viie hoone, 70 puu ja 200 madala kõrvalekaldega jäid jäetud punktid 3 cm piiresse tõelisest maastikust ning ühtegi katust ega võrat ei jäetud.
- **Kõrgused failis**: meetrid, jalad või USA mõõdistusjalad. Kui fail seda ütleb, on ühik juba valitud. Kui ei ütle, pead sina valima: dialoog näitab kõrgusvahemikku mõlemal viisil, et sa saaksid aru, milline on objekti puhul mõistlik.
- **Impordi kui** (ainult ruudustikud): {{ui:Survey points (description DEM)}} või {{ui:The surface itself (a grid of triangles)}}.

Üks import võtab kuni 500,000 punkti. Kui valik annaks rohkem, ütleb dialoog, kui palju rohkem, ja milline vahe sobiks, ning {{ui:Import}} jääb välja lülitatuks.

Klõpsa {{ui:Import}}. Edenemisriba näitab lugemist; {{ui:Cancel}} peatab selle ja midagi ei muutu.

:::warning
Vertikaalsed ühikud on sage lõks. Paljude riigi koordinaatsüsteemi DEM-ide x- ja y-koordinaadid on jalgades, aga kõrgused meetrites. Võrdle dialoogis näidatud vahemikku sellega, mida sa koha kohta tead.
:::

## Mida saad

- **Mõõdistuspunktid**: nummerdatud su kõige kõrgema punktinumbri järel, kirjeldusega `DEM` (ruudustikud) või `LIDAR`, nii et need moodustavad ühe punktirühma jaotises **Punktid** ja koostavad pinna nagu mis tahes muud punktid. Nende importimine on üks samm: {{key:Mod+Z}} võtab need uuesti välja.
- **Pind ise**: ruudustiku TIN, kaks kolmnurka lahtri kohta, jagatud edelast kirdesse kulgeva diagonaali järgi. Kolmnurk, mille nurgas pole andmeid, jäetakse välja, nii et andmete augud jäävad aukudeks. Pind on võrdne ruudustikuga igas ruudustikupunktis ja on iga kolmnurga sees tasane tasapind nende vahel. See asendab projekti pinna (dialoog küsib enne); {{key:Mod+Z}} toob eelmise pinna tagasi. Vasaku paneeli pealkiri ütleb **Pind (kõrgusruudustikust)**.

## Koordinaatsüsteemid

- Kui projektil on koordinaatsüsteem ja fail nimetab teise, teisendatakse iga punkt projekti süsteemi (ja selle maapinna- või kohalikesse koordinaatidesse, kui neil need on).
- Kui projektil pole süsteemi ja faili süsteem on projekti ühikutes (jalad või meetrid), pakub dialoog teha sellest projekti koordinaatsüsteemi samas võtmes kui punktid.
- Kui fail on laiuskraadides ja pikkuskraadides või meetrites jalgade projekti jaoks, palub dialoog esmalt valida projekti koordinaatsüsteemi.
- Kui fail ei ütle, võetakse selle numbreid projekti koordinaatidena. Võid valida hoopis faili süsteemi.

## Pinna eksportimine GeoTIFF-ina

1. Klõpsa GIS-rühmas {{ui:Ekspordi}}.
2. GeoTIFF-osas vali pind (olemasolev maapind või profileeritud pind) ja lahtri suurus. Vaikimisi tuleb see pinna keskmisest kolmnurga servast. Dialoog näitab kirjutatava ruudustiku suurust.
3. Klõpsa {{ui:Laadi GeoTIFF alla}}.

Fail on üks 32-bitine ujukomakõrguste riba projekti ühikutes, pinna ulatuses; pinnast väljaspool olevad lahtrid on „andmeteta“ (−3.4028235e38). Iga lahtri väärtus on pinna kõrgus lahtri keskpunktis. Koordinaadid on **ruudustiku** koordinaadid: maapinna- või kohalikes koordinaatides projekt teisendatakse tagasi ruudustikuks. Fail nimetab projekti koordinaatsüsteemi selle EPSG-koodiga; süsteemi, millel EPSG-koodi pole, ei kirjutata ja dialoog hoiatab, et sa ütled GIS-osakonnale, milline süsteem see on.

## Mida on kontrollitud

- GeoTIFF- ja ASCII-ruudustiku lugejad kontrolliti GDAL-iga (rasterio kaudu), raamatukoguga, mida enamik GIS-programme nende failide lugemiseks kasutab: 32-bitised ujukoma- ja 16-bitised täisarvuruudustikud, plaatidena ja ribadena, DEFLATE ja LZW, nodata, mastaab ja nihe, pixel-is-point, UTM-ruudustik, riigi koordinaatsüsteemi ruudustik USA mõõdistusjalgades ning laiuskraadi/pikkuskraadi ruudustik — iga väärtus võrdne.
- LAS- ja LAZ-lugejad kontrolliti laspy-ga: LAS 1.2 ja 1.4, punktivormingud 0, 1, 3, 6, 7 ja 8, koordinaatsüsteemiga ja ilma, ning LAZ, mille kirjutas selle LASzipiga ühilduv tagaosa — iga punkt võrdne.
- Teisendatud koordinaate kontrolliti PROJ-iga 1 mm täpsusega.
- Eksporditud GeoTIFF-e lugi GDAL tagasi: koordinaatsüsteem, lahtrite asukohad, nodata, ühikud ning väärtused, mis on pinnaga võrdsed 0.0001 täpsusega.
- Midagi siit pole avatud teistes GIS- ega CAD-programmides.

## Veel tegemata

- Vertikaalse datumi muutmine (geoidi mudelid): kõrgusi kasutatakse nii, nagu need failis on.
- Lainekujuandmed, LiDAR-peegeldused muul viisil kui klassi järgi, värvid ja intensiivsused.
- Mitu kanalit, ülevaated või üle 200 MB failid.
- LAS- või LAZ-faili kirjutamine pinnast või sellest tööriistast ([Punktpilved](topic:point-clouds) lisandmoodul kirjutab puhastatud pilve LAS 1.4 või LAZ-na).
