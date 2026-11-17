---
title: Kaardikihtide näitamine plaani all
summary: Pane georefereeritud pilt, kaardiruudud, WMS- või WMTS-server või kaarditeenus plaani alla objekti kontekstina, koos interneti-seadete, läbipaistmatuse, järjekorra ja autoriõigustega.
keywords: kaardikihid, taustkaart, taust, õhufoto, ortofoto, satelliit, rasterpilt, maailmafail, pgw, jgw, tfw, wld, geotiff, georefereeritud pilt, xyz, ruudud, slippy map, wms, wmts, getcapabilities, kaarditeenus, rest, mapserver, imageserver, usgs, national map, autoriõigus, läbipaistmatus
from: 32d7718e
---

Kaardikihid on pildid, mis joonistatakse sinu kavandi alla: õhufoto oma maailmafailiga või kaardid internetis asuvatelt serveritelt. Need on objekti kontekst ainult ekraanil: nad **ei** ole PDF-plotides, DXF- ega DWG-eksportides ega 3D-vaates.

Klõpsa rühmas {{ui:GIS}} nupule {{ui:Kaart}}. Dialoog **Kaardikihid** loetleb projekti kihid ja lisab uusi. Kaardikihid vajavad projekti koordinaatsüsteemi ([Määra projekti koordinaatsüsteem](topic:coordinate-systems)), välja arvatud pilt, mille maailmafail kasutab projekti enda koordinaate.

## Interneti-seade

CivilCraft ei küsi kaardiserveritelt midagi enne, kui lubad: {{ui:Sätted}}, {{ui:CivilCraft}}, **Kaardikihid internetist**: **Väljas** (algus) või **Sees**.

:::note
Kui see on sees, küsib CivilCraft sinu lisatud kaardiservereilt pilte ekraanil oleva ala kohta. Sinu joonis jääb sellesse arvutisse; server näeb ala ja sinu internetiaadressi.
:::

Kui see on väljas, on internetikihid dialoogis loetletud, kuid hallina, koos põhjusega, ning midagi ei joonistata ega päringuta. Projekti avamine, mis nimetab kaardiservereid, ei võta neid ühendust. Pilt failist töötab mõlemal viisil. Dialoogi nupp {{ui:Ava sätted}} viib sinna.

## Georefereeritud pilt (töötab võrguühenduseta)

1. Jaotises **Lisa kiht** jäta **Georefereeritud pilt** ja vali failid: pilt (PNG või JPEG) **koos** oma maailmafailiga (`.pgw` PNG jaoks, `.jgw` JPEG jaoks või `.wld`) ning, kui see on olemas, oma `.prj`. Võid need ka plaanile koos lohistada.
2. Ilma `.prj`-ta küsib CivilCraft, mis süsteemi maailmafail kasutab: {{ui:Projekti süsteem}} (kõige tavalisem), {{ui:Vali süsteem…}} või projektis ilma süsteemita **Projekti koordinaadid**.
3. Pilt ilmub plaani alla ja {{ui:Sobita}} arvestab ka seda.

RGB GeoTIFF (õhufoto, salvestatud GeoTIFF-ina) kannab oma paigutust ja süsteemi: ava see eraldi. Pilt jäetakse **projektifaili sisse** (kuni 25 MB); suurem lükatakse tagasi koos oma suurusega, nii et salvesta väiksem koopia (vähem pikslit või JPEG).

## Ruudud, WMS, WMTS ja kaarditeenused

Lülita kõigepealt sisse **Kaardikihid internetist**. Seejärel jaotises **Lisa kiht**:

| Allikas | Mida kleepida | Mida CivilCraft teeb |
|---|---|---|
| Ruudu URL | Mall koos `{z}`, `{x}` ja `{y}` (või `{-y}`) ning `{s}` serveri tähe jaoks, näiteks `https://tile.example.org/{z}/{x}/{y}.png`. Anna sellele nimi ja autoriõigus. | Ruudud veebi Mercatori projektsioonis ekraanil oleva ala ja suurenduse jaoks. |
| WMS-server | Serveri aadress või selle GetCapabilities-link. Vali {{ui:Too kihid}}, seejärel kiht. | Üks pilt ekraanil olevast alast, küsitud projekti EPSG-koodis, kui server seda pakub, muidu veebi Mercatoris või WGS 84-s. |
| WMTS-server | Serveri aadress või selle `WMTSCapabilities.xml`. Vali {{ui:Too kihid}}, seejärel kiht ja ruudumaatriksi komplekt. | Ruudud komplektist projekti süsteemis, kui see on olemas, muidu veebi Mercator. |
| ArcGIS-i kaarditeenus (REST) | URL, mis lõpeb `/MapServer` või `/ImageServer`. Vali {{ui:Loe teenus}}. | Vahemällu salvestatud veebi Mercatori teenused joonistatakse oma ruutudest; teised küsitakse ekraanil oleva ala kohta ühe pildina. |

Ükski server ei ole eelseadistatud. Avalikud näited, kõik USGS National Map'ist (avalik domeen):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Kaarditeenus: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (samuti `USGSImageryOnly` õhufotode jaoks)

Paljud linnade ja maakondade GIS-osakonnad avaldavad oma WMS- või kaarditeenuseid; nende GIS-lehed annavad aadressi. Server, mis nõuab sisselogimist või võtit, ei tööta: CivilCraft ei saada kasutajanimesid, paroole ega võtmeid.

## Kuidas kihid joonistatakse

- Pilte, mis on teises süsteemis kui projekti oma, moonutatakse projekti: pilt lõigatakse tükkideks, igaüks paigutatakse nii, et see on ekraani veerandpiksli piires sellest kohast, kuhu täpne teisendus selle paigutaks.
- Ruudud valitakse ekraanil oleva ala ja suurenduse järgi: vaate kohta mitte rohkem kui 64, korraga 6. Kui liigutad või suumid, tühistatakse vana vaate päringud. Mälus hoitakse umbes 200 ruutu (kettale midagi ei salvestata).
- WMS- või kaarditeenuse pilt küsitakse siis, kui vaade on liikumise lõpetanud; kuni see saabub, jääb viimane paigale.
- Iga kihi autoriõigus kuvatakse plaani alumises paremas nurgas väikesena.

## Kihtide muutmine, järjestus ja eemaldamine

Dialoogis on igal kihil märkeruut näitamiseks või peitmiseks, liugur **Läbipaistmatus**, nooled kihi joonistamiseks varem (madalamale) või hiljem (peale), suumi nupp (pildid) ja eemaldamise nupp. Loendi esimene kiht joonistatakse alumisena. Iga muudatus on üks tagasivõtmise samm.

## Kui kiht ei näita midagi

Põhjus ilmub olekuribal korra ja jääb kihi nime alla dialoogis:

| Teade | Mida teha |
|---|---|
| Väljas: kaardikihid internetist on sätetes välja lülitatud. | Lülita sisse **Kaardikihid internetist**. |
| Vajab projekti koordinaatsüsteemi | Määra see jaotises {{ui:Koordinaadid}}. |
| Server ei lubanud sellel lehel oma pilte kasutada (CORS) või ei saanud ühendust. | Server ei luba veebilehtedel oma pilte kasutada või on maas. Pärast nelja keeldumist CivilCraft lõpetab küsimise; peida ja näita kihti uuesti, et proovida. |
| Server vastas 404 … / Server saatis text/xml, mitte pildi: … | URL, kiht või stiil on vale, või serveri teade ütleb, mida ta tahab. |
| Seda kihti ei pakuta projekti süsteemis, veebi Mercatoris ega WGS 84-s | Server ei saa joonistada sinna, kuhu CivilCraft saab selle paigutada. |

## Mida kontrolliti

- Ruudunumbreid kontrolliti standardse veebi Mercatori ruudustiku vastu; WMS 1.1.1 ja 1.3.0, WMTS ja kaarditeenuse vastuseid loeti käsitsi kirjutatud failidest ja päris vastustest, mis salvestati USGS National Map'ist ja terrestris OpenStreetMap-serveritest; WMS 1.3.0 päringud panevad EPSG:4326 puhul esmalt laiuskraadi, nagu standard ütleb.
- Moonutust võrreldi täpse piksli kaupa teisendusega PROJ-i arvude järgi: ruutude, WMS-piltide ja maakonnasuuruse pildi puhul 0,13 px piires, objekti mõõtkavas ja väljasuumituna.
- Pilt koos maailmafailiga ning GDAL-iga (rasterio kaudu) kirjutatud RGB GeoTIFF joonistati sinna, kuhu nende paigutus ütleb, kontrollituna piksli kaupa brauseris.
- Brauseris, testarvutis asuva asendusserveri vastu: ruudud langevad sinna ruutu, kuhu PROJ iga punkti paneb; WMS-pilt langeb 2 px piires; korraga töötab kuni 6 päringut ja seadega välja ei lahku ükski päring lehelt. USGS National Map'i kaarditeenus, mainitud ülal, loeti ja joonistati brauseris ühe korra elavalt (ruudud saabusid ja joonistati, koos autoriõiguse tekstiga); teised avalikud serverid loeti ainult salvestatud vastustest.
