---
title: Wys kaartlae onder die plan
summary: Plaas 'n georefereerde prent, kaarttegels, 'n WMS- of WMTS-bediener of 'n kaartdiens onder die plan as terreinkonteks, met die internetinstelling, deursigtigheid, orde en erkenning.
keywords: kaartlae, basiskaart, basis kaart, agtergrond, lugfoto, ortofoto, beelde, satelliet, raster, wêreldlêer, pgw, jgw, tfw, wld, geotiff, georefereerde prent, xyz, tegels, slippy map, wms, wmts, getcapabilities, kaartdiens, rest, mapserver, imageserver, usgs, national map, erkenning, deursigtigheid
from: 32d7718e
---

Kaartlae is prente wat onder jou ontwerp geteken word: 'n lugfoto met sy wêreldlêer, of kaarte van bedieners op die internet. Hulle is terreinkonteks op die skerm alleen: hulle is **nie** in PDF-plotte, DXF- of DWG-uitvoere, of die 3D-aansig nie.

Kies {{ui:Kaart}} in die {{ui:GIS}}-groep. Die **Kaartlae**-dialoog lys die projek se lae en voeg nuwe by. Kaartlae benodig die projek se koördinaatstelsel ([Stel die projek se koördinaatstelsel](topic:coordinate-systems)), behalwe 'n prent wie se wêreldlêer die projek se eie koördinate gebruik.

## Die internetinstelling

CivilCraft vra nooit 'n kaartbediener om iets totdat jy dit toelaat nie: {{ui:Instellings}}, {{ui:CivilCraft}}, **Kaartlae van die internet**: **Af** (die begin) of **Aan**.

:::note
Wanneer dit aan is, vra CivilCraft die kaartbedieners wat jy byvoeg om prente van die gebied op die skerm. Jou tekening bly op hierdie rekenaar; die bediener sien die gebied en jou internetadres.
:::

Terwyl dit af is, word internetlae in die dialoog gelys maar grys uitgewys, met die rede, en niks word geteken of gevra nie. Die oopmaak van 'n projek wat kaartbedieners noem, kontak hulle ook nie. 'n Prent uit 'n lêer werk in albei gevalle. Die dialoog se {{ui:Maak Instellings oop}}-knoppie neem jou daarheen.

## 'n Georefereerde prent (werk vanlyn)

1. In **Voeg 'n laag by**, hou **Georefereerde prent** en kies die lêers: die prent (PNG of JPEG) **saam met** sy wêreldlêer (`.pgw` vir PNG, `.jgw` vir JPEG, of `.wld`) en, as daar een is, sy `.prj`. Jy kan hulle ook saam op die plan sleep.
2. Sonder 'n `.prj` vra CivilCraft watter stelsel die wêreldlêer gebruik: {{ui:Die projek se stelsel}} (die algemeenste), {{ui:Kies 'n stelsel…}}, of, in 'n projek sonder 'n stelsel, **Projekkoördinate**.
3. Die prent verskyn onder die plan, en {{ui:Pas aan}} sluit dit in.

'n RGB GeoTIFF ('n lugfoto wat as GeoTIFF gestoor is) dra sy eie plasing en stelsel: maak dit alleen oop. Die prent word **binne die projeklêer** gehou (tot 25 MB); 'n groter een word geweier met sy grootte, so stoor 'n kleiner kopie (minder pixels, of JPEG).

## Tegels, WMS, WMTS en kaartdienste

Skakel eers **Kaartlae van die internet** aan. Dan, in **Voeg 'n laag by**:

| Vanaf | Wat om te plak | Wat CivilCraft doen |
|---|---|---|
| Tegel-URL | 'n Sjabloon met `{z}`, `{x}` en `{y}` (of `{-y}`), en `{s}` vir 'n bedienerletter, byvoorbeeld `https://tile.example.org/{z}/{x}/{y}.png`. Gee dit 'n naam en sy erkenning. | Tegels in web-Mercator vir die gebied en zoem op die skerm. |
| WMS-bediener | Die bediener se adres, of sy GetCapabilities-skakel. Kies {{ui:Kry die lae}}, dan die laag. | Een prent van die gebied op die skerm, gevra in die projek se EPSG-kode wanneer die bediener dit bied, anders in web-Mercator of WGS 84. |
| WMTS-bediener | Die bediener se adres, of sy `WMTSCapabilities.xml`. Kies {{ui:Kry die lae}}, dan die laag en tegelmatriksstel. | Tegels uit die stel in die projek se stelsel wanneer daar een is, anders web-Mercator. |
| ArcGIS-kaartdiens (REST) | 'n URL wat op `/MapServer` of `/ImageServer` eindig. Kies {{ui:Lees die diens}}. | Gekasde web-Mercator-dienste word uit hul tegels geteken; ander word gevra vir een prent van die gebied op die skerm. |

Geen bedieners word vooraf ingestel nie. Openbare voorbeelde, almal van die USGS National Map (publieke domein):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Kaartdiens: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (ook `USGSImageryOnly` vir lugfoto's)

Baie stads- en distrik-GIS-departemente publiseer hul eie WMS of kaartdienste; hul GIS-bladsye gee die adres. 'n Bediener wat 'n aanmelding of 'n sleutel vra, werk nie: CivilCraft stuur geen gebruikersname, wagwoorde of sleutels nie.

## Hoe lae geteken word

- Prente in 'n ander stelsel as die projek se word daarin vervorm: die prent word in stukke gesny, elk só geplaas dat dit binne 'n kwart skerm-pixel is van waar 'n presiese omskakeling dit plaas.
- Tegels word gekies vir die gebied op die skerm en die zoem: nooit meer as 64 vir 'n aansig nie, 6 op 'n keer. Wanneer jy pan of zoem, word versoeke vir die ou aansig gekanselleer. Ongeveer 200 tegels word in geheue gehou (niks word op skyf gestoor nie).
- 'n WMS- of kaartdiensprent word gevra sodra die aansig ophou beweeg; totdat dit aankom, bly die vorige een op sy plek.
- Die erkenning van elke laag op die skerm wys klein onder regs op die plan.

## Verander, orden en verwyder lae

In die dialoog het elke laag 'n blokkie om dit te wys of te verberg, 'n **Deursigtigheid**-skuifbalk, pyltjies om dit vroeër (laer) of later (bo-op) te teken, 'n zoemknoppie (prente) en 'n verwyderknoppie. Die eerste laag in die lys word onderaan geteken. Elke verandering is een ontdoen-stap.

## Wanneer 'n laag niks wys nie

Die rede verskyn een keer in die statuslyn en bly onder die laag se naam in die dialoog:

| Boodskap | Wat om te doen |
|---|---|
| Af: kaartlae van die internet is af in Instellings. | Skakel **Kaartlae van die internet** aan. |
| Benodig die projek se koördinaatstelsel | Stel dit onder {{ui:Koördinate}}. |
| Die bediener het nie hierdie bladsy toegelaat om sy prente te gebruik nie (CORS), of kon nie bereik word nie. | Die bediener laat nie webbladsye toe om sy prente te gebruik nie, of dit is af. Na vier weierings hou CivilCraft op om te vra; verberg en wys die laag om weer te probeer. |
| Die bediener antwoord 404 … / Die bediener stuur text/xml, nie 'n prent nie: … | Die URL, laag of styl is verkeerd, of die bediener se boodskap sê wat dit wil hê. |
| Hierdie laag word nie in die projek se stelsel, web-Mercator of WGS 84 aangebied nie | Die bediener kan nie teken waar CivilCraft dit kan plaas nie. |

## Wat is gekontroleer

- Tegelnommers is teen die standaard web-Mercator-tegeling gekontroleer; WMS 1.1.1 en 1.3.0, WMTS- en kaartdienstantwoorde is gelees uit met die hand geskrewe lêers en uit werklike antwoorde wat gestoor is van die USGS National Map- en terrestris OpenStreetMap-bedieners; WMS 1.3.0-versoeke plaas breedtegraad eerste vir EPSG:4326, soos die standaard sê.
- Vervorming is vergelyk met 'n presiese per-pixel-omskakeling deur PROJ se getalle: binne 0,13 px vir tegels, WMS-prente en 'n distrik-grootte prent, op terreinskaal en uitgezoem.
- 'n Prent met sy wêreldlêer en 'n RGB GeoTIFF wat deur GDAL (deur rasterio) geskryf is, is geteken waar hul plasing sê, pixel vir pixel in die blaaier nagegaan.
- In die blaaier, teen 'n stand-in-bediener op die toetsrekenaar: tegels val in die tegel waarin PROJ elke punt plaas, 'n WMS-prent val binne 2 px, hoogstens 6 versoeke loop op 'n keer, en met die instelling af verlaat geen versoek die bladsy nie. Die USGS National Map-kaartdiens hierbo is ook eenmaal lewendig in die blaaier gelees en geteken (sy tegels het aangekom en is geteken, met sy kopiereg-teks); die ander openbare bedieners is net uit gestoorde antwoorde gelees.
