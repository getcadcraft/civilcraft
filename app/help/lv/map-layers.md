---
title: Kartes slāņu rādīšana zem plāna
summary: Ievietojiet georeferencētu attēlu, kartes flīzes, WMS vai WMTS serveri vai kartes pakalpojumu zem plāna kā objekta kontekstu, ar interneta iestatījumu, necaurredzamību, secību un autoru atsauci.
keywords: kartes slāņi, pamatkarte, fona karte, fons, aerofotogrāfija, ortofoto, attēls, satelīts, rastrs, world file, pgw, jgw, tfw, wld, geotiff, georeferencēts attēls, xyz, flīzes, slīdošā karte, wms, wmts, getcapabilities, kartes pakalpojums, rest, mapserver, imageserver, usgs, national map, autoru atsauce, necaurredzamība
from: 32d7718e
---

Kartes slāņi ir attēli, kas zīmēti zem jūsu projekta: aerofotogrāfija ar savu world file vai kartes no serveriem internetā. Tie ir objekta konteksts tikai ekrānā: tie **nav** iekļauti PDF izdrukās, DXF vai DWG eksportos vai 3D skatā.

Izvēlieties {{ui:Map}} grupā {{ui:GIS}}. Dialogs **Kartes slāņi** uzskaita projekta slāņus un pievieno jaunus. Kartes slāņiem vajadzīga projekta koordinātu sistēma ([Projekta koordinātu sistēmas iestatīšana](topic:coordinate-systems)), izņemot attēlu, kura world file izmanto paša projekta koordinātas.

## Interneta iestatījums

CivilCraft nekad nelūdz kartes serverim nekā, kamēr jūs to neatļaujat: {{ui:Settings}}, {{ui:CivilCraft}}, **Kartes slāņi no interneta**: **Izslēgts** (sākumā) vai **Ieslēgts**.

:::note
Kad ieslēgts, CivilCraft pievienotajiem kartes serveriem jautā attēlus par ekrānā redzamo apvidu. Jūsu rasējums paliek šajā datorā; serveris redz apvidu un jūsu interneta adresi.
:::

Kamēr tas ir izslēgts, interneta slāņi dialogā ir uzskaitīti, bet pelēkoti, ar iemeslu, un nekas netiek zīmēts vai pieprasīts. Atverot projektu, kas nosauc kartes serverus, arī tie netiek sazināti. Attēls no faila darbojas abos gadījumos. Dialoga poga {{ui:Open Settings}} aizved jūs uz turieni.

## Georeferencēts attēls (darbojas bezsaistē)

1. Sadaļā **Pievienot slāni** atstājiet **Georeferencēts attēls** un izvēlieties failus: attēlu (PNG vai JPEG) **kopā ar** tā world file (`.pgw` PNG, `.jgw` JPEG vai `.wld`) un, ja tāds ir, tā `.prj`. Varat arī nomest tos uz plāna kopā.
2. Bez `.prj` CivilCraft jautā, kuru sistēmu world file izmanto: {{ui:The project’s system}} (visbiežāk), {{ui:Pick a system…}} vai, projektā bez sistēmas, **Projekta koordinātas**.
3. Attēls parādās zem plāna, un {{ui:Fit}} to iekļauj.

RGB GeoTIFF (aerofotogrāfija, saglabāta kā GeoTIFF) satur pats savu novietojumu un sistēmu: atveriet to atsevišķi. Attēls tiek glabāts **projekta failā** (līdz 25 MB); lielāks tiek noraidīts ar tā izmēru, tāpēc saglabājiet mazāku kopiju (mazāk pikseļu vai JPEG).

## Flīzes, WMS, WMTS un kartes pakalpojumi

Vispirms ieslēdziet **Kartes slāņi no interneta**. Tad sadaļā **Pievienot slāni**:

| No | Ko ielīmēt | Ko dara CivilCraft |
|---|---|---|
| Flīžu URL | Sagatave ar `{z}`, `{x}` un `{y}` (vai `{-y}`), un `{s}` servera burtam, piemēram, `https://tile.example.org/{z}/{x}/{y}.png`. Dodiet tam nosaukumu un autoru atsauci. | Flīzes Web Mercator projekcijā apvidum un tuvinājumam ekrānā. |
| WMS serveris | Servera adrese vai tā GetCapabilities saite. Izvēlieties {{ui:Get the layers}}, tad slāni. | Viens attēls par ekrānā redzamo apvidu, pieprasīts projekta EPSG kodā, kad serveris to piedāvā; citādi Web Mercator vai WGS 84. |
| WMTS serveris | Servera adrese vai tā `WMTSCapabilities.xml`. Izvēlieties {{ui:Get the layers}}, tad slāni un flīžu matricu kopu. | Flīzes no kopas projekta sistēmā, ja tāda ir; citādi Web Mercator. |
| ArcGIS kartes pakalpojums (REST) | URL, kas beidzas ar `/MapServer` vai `/ImageServer`. Izvēlieties {{ui:Read the service}}. | Kešotie Web Mercator pakalpojumi tiek zīmēti no savām flīzēm; citi pieprasa vienu attēlu par ekrānā redzamo apvidu. |

Serveri nav iepriekš iestatīti. Publiski piemēri, visi no USGS National Map (publiskais domēns):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Kartes pakalpojums: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (arī `USGSImageryOnly` aerofotogrāfijām)

Daudzas pilsētu un apgabalu GIS nodaļas publicē savus WMS vai kartes pakalpojumus; to GIS lapās ir adrese. Serveris, kas prasa pieteikšanos vai atslēgu, nedarbojas: CivilCraft nesūta lietotājvārdus, paroles vai atslēgas.

## Kā tiek zīmēti slāņi

- Attēli citā sistēmā nekā projekta tiek pārveidoti tajā: attēls tiek sagriezts gabalos, katrs novietots tā, lai būtu ne tālāk par ceturtdaļ ekrāna pikseļa no vietas, kur to novieto precīza pārvēršana.
- Flīzes tiek izvēlētas ekrānā redzamajam apvidum un tuvinājumam: nekad vairāk par 64 vienam skatam un ne vairāk kā 6 vienlaikus. Kad pārvietojat vai tuvināt, vecā skata pieprasījumi tiek atcelti. Atmiņā tiek turētas aptuveni 200 flīzes (nekas netiek saglabāts diskā).
- WMS vai kartes pakalpojuma attēls tiek pieprasīts, kad skats ir pārstājis kustēties; līdz tas ierodas, paliek pēdējais.
- Katra slāņa autoru atsauce ekrānā redzama mazā burtā plāna apakšējā labajā stūrī.

## Mainīt, kārtot un noņemt slāņus

Dialogā katram slānim ir izvēles rūtiņa tā rādīšanai vai paslēpšanai, **Necaurredzamības** slīdnis, bultiņas, lai zīmētu agrāk (zemāk) vai vēlāk (augšā), tuvināšanas poga (attēliem) un noņemšanas poga. Pirmais saraksta slānis tiek zīmēts apakšā. Katra izmaiņa ir viens atsaukšanas solis.

## Kad slānis nerāda neko

Iemesls parādās vienreiz statusa rindā un paliek zem slāņa nosaukuma dialogā:

| Ziņojums | Ko darīt |
|---|---|
| Izslēgts: kartes slāņi no interneta ir izslēgti iestatījumos. | Ieslēdziet **Kartes slāņi no interneta**. |
| Nepieciešama projekta koordinātu sistēma | Iestatiet to sadaļā {{ui:Coordinates}}. |
| Serveris neatļāva šai lapai izmantot tā attēlus (CORS) vai to nevarēja sasniegt. | Serveris neļauj tīmekļa lapām izmantot tā attēlus, vai tas nedarbojas. Pēc četriem atteikumiem CivilCraft pārtrauc jautāt; paslēpiet un parādiet slāni, lai mēģinātu vēlreiz. |
| Serveris atbildēja 404 … / Serveris nosūtīja text/xml, nevis attēlu: … | URL, slānis vai stils ir nepareizs, vai servera ziņojums saka, ko tas prasa. |
| Šis slānis netiek piedāvāts projekta sistēmā, Web Mercator vai WGS 84 | Serveris nevar zīmēt tur, kur CivilCraft var to novietot. |

## Ko pārbaudīja

- Flīžu numuri tika pārbaudīti pret standarta Web Mercator flīzēšanu. WMS 1.1.1 un 1.3.0, WMTS un kartes pakalpojumu atbildes tika nolasītas no rokām rakstītiem failiem un no reālām USGS National Map un terrestris OpenStreetMap serveru atbildēm, kas saglabātas; WMS 1.3.0 pieprasījumos EPSG:4326 gadījumā platuma grāds ir pirmais, kā to nosaka standarts.
- Pārveidošana tika salīdzināta ar precīzu katra pikseļa pārvēršanu caur PROJ skaitļiem: 0,13 px robežās flīzēm, WMS attēliem un pilsētas lieluma attēlam, objekta mērogā un tālinot.
- Attēls ar savu world file un RGB GeoTIFF, ko rakstījis GDAL (caur rasterio), tika zīmēti tur, kur norāda to novietojums, pārbaudīti pikseļu pa pikselim pārlūkā.
- Pārlūkā, pret palīgserveri testa datorā: flīzes nolaižas tajā flīzē, kuru PROJ izvēlas katram punktam; WMS attēls nolaižas 2 px robežās; vienlaikus iet ne vairāk kā seši pieprasījumi; un, kad iestatījums ir izslēgts, neviens pieprasījums neiziet no lapas. Augstāk minētais USGS National Map kartes pakalpojums vienreiz tika nolasīts un zīmēts tiešsaistē pārlūkā (tā flīzes ieradās un tika zīmētas, ar tā autortiesību tekstu); pārējie publiskie serveri tika nolasīti tikai no saglabātām atbildēm.
