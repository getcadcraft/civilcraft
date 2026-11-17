---
title: Augstumu režģi un LiDAR
summary: Izveidot esošo zemi no DEM (GeoTIFF vai ASCII režģa) vai LiDAR punktiem (LAS, LAZ) — izvēlēties apgabalu, retināt datus, izvēlēties klases un pārbaudīt augstuma mērvienības — un eksportēt virsmu kā GeoTIFF augstumu režģi.
keywords: dem, dtm, augstumu režģis, geotiff, tif, ascii grid, asc, lidar, las, laz, punktu mākonis, klases, zeme, retināšana, nodata, rastrs, GeoTIFF eksports, gis
from: c8b2d18a
---

Publiskie augstuma dati nāk divos veidos: **augstumu režģi** (DEM: viens augstums katrā kvadrātveida šūnā, parasti GeoTIFF `.tif` vai ASCII režģis `.asc`) un **LiDAR punkti** (miljoniem lāzera atgriezumu `.las` failā vai `.laz`, ja tas ir saspiests). CivilCraft pārvērš abus vai nu uzmērījuma punktos, vai virsmā, tieši pārlūkprogrammā: nekas netiek augšupielādēts.

## Atvērt failu

1. Noklikšķiniet uz {{ui:Atvērt}} (vai {{ui:Importēt}} GIS grupā) un izvēlieties failu, vai velciet to uz plānu. ASCII režģim izvēlieties arī tā `.prj` failu, lai CivilCraft zinātu tā koordinātu sistēmu.
2. Importa dialogā redzams, ko fails par sevi stāsta: tā izmērs, šūnas vai punkti, koordinātu sistēma, atrašanās vieta platuma un garuma grādos un augstuma diapazons. LiDAR gadījumā tas vispirms vienreiz nolasa visus punktus, lai saskaitītu **klases** (progresa josla rāda, cik tālu process ir; {{ui:Atcelt}} to aptur).

GeoTIFF ar trim vai četrām joslām (sarkanā, zaļā, zilā) ir attēls, nevis augstumi: tas tiek nosūtīts uz kartes slāņiem.

## Izvēlēties, ko ievietot

- **Apgabals**: {{ui:The project’s extents and a margin}} (ierakstiet rezervi), {{ui:What the plan shows now}} vai {{ui:The whole file}}. Tiek nolasīta tikai šī faila daļa.
- **Retināt līdz**: punktu atstatums projekta mērvienībās. Līnija zem iestatījumiem rāda, cik punktu tas dod, kamēr ierakstāt. Režģim CivilCraft paturēs katru otro, trešo … šūnu, tāpēc augstumi paliek tieši tādi, kādi tie ir failā; tas nekad nevidurē šūnas. LiDAR gadījumā apgabals tiek sadalīts kvadrātos šajā izmērā, un katrā kvadrātā tiek paturēts viens punkts: {{ui:The point nearest each cell’s center}} (noklusējums), {{ui:The lowest point in each cell}} (labi, ja failā nav zemes klases: zeme ir zem kokiem) vai {{ui:The average of each cell’s points}}.
- **Klases** (LiDAR): zeme (2. klase) ir atzīmēta, ja tāda failā ir; ēkas, koki un troksnis tiek atstāti ārpus. Ja zemes klases nav, ir atzīmētas visas klases, un dialogs to saka.
- **Zeme** (LiDAR, 0.8): dronu mākonī nav zemes klases. Ja failā tādas nav, dialogs sākas ar {{ui:Atrast zemi pašam (drona mākoņi, nav zemes klases)}}: tiek nolasītas visas klases, izņemot troksni, katrā šūnā tiek paturēts zemākais punkts, un tad CivilCraft noņem ēkas, kokus un nejaušos zemos punktus ar progresīvu morfoloģisko filtru (Zhang un citi, 2003), ko var regulēt: **Lielākais noņemamais objekts** (lielākās ēkas platums; logi aug, līdz pārklāj to; 0 nozīmē 20 šūnas) un **Stāvākais zemes slīpums**. Darbs tiek veikts zemāko punktu režģī, tāpēc miljoniem punktu mākonis neizmaksā vairāk par savu šūnu skaitu (retināšana ir viena straumēšanas kārta). Atstatums ir šūnas izmērs: retāks režģis ir ātrāks un mazus objektus palaiž garām retāk, nekā varētu gaidīt; smalkāks saglabā vairāk zemes detaļu. Pārskats norāda, cik punktu paturēti kā zeme, cik šūnu noņemtas kā objekti un cik nejaušu zemu punktu atmesti. Simulētā 300 m drona uzmērījumā ar pieciem ēkām, 70 kokiem un 200 zemiem izlecošiem punktiem paturētie punkti bija 3 cm robežās no patiesā reljefa, un neviens jumts vai lapotne netika paturēta.
- **Augstumi failā**: metri, pēdas vai ASV uzmērījuma pēdas. Kad fails to norāda, mērvienība jau ir izvēlēta. Kad nenorāda, jums jāizvēlas: dialogs rāda augstuma diapazonu abos veidos, lai varētu saprast, kurš ir saprātīgs šai vietai.
- **Importēt kā** (tikai režģiem): {{ui:Survey points (description DEM)}} vai {{ui:The surface itself (a grid of triangles)}}.

Viens imports ņem ne vairāk kā 500 000 punktus. Ja izvēle dotu vairāk, dialogs saka, par cik un kāds atstatums derētu, un {{ui:Importēt}} paliek neaktīvs.

Noklikšķiniet uz {{ui:Importēt}}. Progresa josla rāda nolasīšanu; {{ui:Atcelt}} to aptur, un nekas nemainās.

:::warning
Vertikālās mērvienības ir izplatīta kļūdu vieta. Daudziem valsts plaknes DEM austrumu un ziemeļu koordinātas ir pēdās, bet augstumi metros. Salīdziniet dialogā redzamo diapazonu ar to, ko zināt par vietu.
:::

## Ko jūs iegūstat

- **Uzmērījuma punkti**: numurēti aiz jūsu augstākā punkta numura, ar aprakstu `DEM` (režģiem) vai `LIDAR`, tāpēc tie veido vienu punktu grupu zem **Punkti** un veido virsmu kā jebkuri citi punkti. To importēšana ir viens solis: {{key:Mod+Z}} tos atkal izņem.
- **Pati virsma**: režģa TIN, divi trijstūri katrā šūnā, sadalīti pa dienvidrietumu–ziemeļaustrumu diagonāli. Trijstūris ar stūri bez datiem tiek izlaists, tāpēc datu caurumi paliek caurumi. Virsma sakrīt ar režģi katrā režģa punktā un starp tiem katrā trijstūrī ir plakne. Tā aizstāj projekta virsmu (dialogs vispirms jautā); {{key:Mod+Z}} atgriež iepriekšējo virsmu. Kreisā paneļa virsraksts saka **Virsma (no augstumu režģa)**.

## Koordinātu sistēmas

- Ja projektam ir koordinātu sistēma un fails nosauc citu, katrs punkts tiek pārvērsts projekta sistēmā (un tās zemes vai lokālajās koordinātās, ja tādas ir).
- Ja projektam nav nevienas un faila sistēma ir projekta mērvienībās (pēdās vai metros), dialogs piedāvā to padarīt par projekta koordinātu sistēmu tajā pašā atsaukšanas solī kā punktus.
- Ja fails ir platuma un garuma grādos vai metros pēdu projektā, dialogs vispirms prasa izvēlēties projekta koordinātu sistēmu.
- Ja fails to nenorāda, tā skaitļi tiek ņemti kā projekta koordinātas. Jūs varat izvēlēties faila sistēmu.

## Eksportēt virsmu kā GeoTIFF

1. Noklikšķiniet uz {{ui:Eksportēt}} GIS grupā.
2. GeoTIFF daļā izvēlieties virsmu (esošo zemi vai izlīdzināto virsmu) un šūnas izmēru. Noklusējums nāk no virsmas vidējās trijstūra malas. Dialogs rāda režģa izmēru, ko tas ierakstīs.
3. Noklikšķiniet uz {{ui:Lejupielādēt GeoTIFF}}.

Fails ir viena 32 bitu peldošā komata augstumu josla projekta mērvienībās, pār virsmas apgabalu; šūnas ārpus virsmas ir „nav datu” (−3.4028235e38). Katras šūnas vērtība ir virsmas augstums šūnas centrā. Koordinātas ir **režģa** koordinātas: projekts zemes vai lokālajās koordinātās tiek pārvērsts atpakaļ režģa koordinātās. Fails nosauc projekta koordinātu sistēmu pēc tās EPSG koda; sistēma bez EPSG koda netiek ierakstīta, un dialogs brīdina, ka GIS nodaļai jāpasaka, kāda tā ir.

## Ko pārbaudīja

- GeoTIFF un ASCII režģa lasītāji tika pārbaudīti pret GDAL (caur rasterio), bibliotēku, ko izmanto lielākā daļa GIS programmu: 32 bitu peldošā komata un 16 bitu veselu skaitļu režģi, flīzēti un svītroti, DEFLATE un LZW, nodata, mērogs un nobīde, pixel-is-point, UTM režģis, valsts plaknes režģis ASV uzmērījuma pēdās un platuma un garuma grādu režģis — katra vērtība sakrita.
- LAS un LAZ lasītāji tika pārbaudīti pret laspy: LAS 1.2 un 1.4, punktu formāti 0, 1, 3, 6, 7 un 8, ar un bez koordinātu sistēmas, un LAZ, ko rakstīja LASzip saderīgs aizmugures risinājums — katrs punkts sakrita.
- Pārvērstās koordinātas tika pārbaudītas pret PROJ līdz 1 mm.
- Eksportētie GeoTIFF faili tika nolasīti atpakaļ ar GDAL: koordinātu sistēma, šūnu pozīcijas, nodata, mērvienības un vērtības, kas sakrita ar virsmu līdz 0.0001.
- Neviens no tiem nav atvērts citās GIS vai CAD programmās.

## Vēl nav izveidots

- Vertikālā datuma maiņa (ģeoīda modeļi): augstumi tiek izmantoti tā, kā tie ir failā.
- Viļņu formas dati, LiDAR atgriezumi citādi nekā pēc klases, krāsas un intensitātes.
- Vairākas joslas, pārskatu slāņi (overviews) vai faili, kas lielāki par 200 MB.
- Virsmas vai šī rīka LAS vai LAZ rakstīšana (no [Punktu mākoņi](topic:point-clouds) papildinājuma var rakstīt notīrītu mākoni kā LAS 1.4 vai LAZ).
