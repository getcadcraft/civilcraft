---
title: Importēt GIS datus
summary: Ievietot shapefile, GeoJSON un GeoPackage failus projektā kā GIS slāņus, novietot tos caur pareizo koordinātu sistēmu, apskatīt to atribūtus un izmantot tos virsmai.
keywords: gis, etiķetes, objektu etiķetes, atribūti plānā, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, imports, slāņi, atribūti, koordinātu sistēma, epsg, platums, garums, horizontāles, zemesgabali, lūzumlīnijas, robeža
from: f6b235cc
---

Pilsētu un novadu GIS nodaļas izsniedz vietas kontekstu GIS failos: zemesgabalus, servitūtus, horizontāles, komunikācijas, uzmērīšanas kontroles punktus. CivilCraft atver trīs veidu failus kā **GIS slāņus**, kas atrodas zem jūsu projekta plānā.

| Fails | Ko atvērt |
|---|---|
| Shapefile | `.shp` kopā ar tā `.shx`, `.dbf`, `.prj` un `.cpg` (atlasiet visus), vai `.zip`, kurā tie ir ievietoti. Zip, kas satur vairākus shapefile, dod vairākus slāņus. |
| GeoJSON | `.geojson` fails (darbojas arī `.json` fails, kura pirmajās rindās ir `FeatureCollection` vai `Feature`). |
| GeoPackage | `.gpkg` fails. Katra objektu tabula tajā tiek uzskaitīta. |
| KML vai KMZ | `.kml` fails (no Google Earth vai tīmekļa kartes) vai saspiestais `.kmz`. Katra mape kļūst par slāni (sadalīts punktos, līnijās un poligonos, ja tajā ir vairāki veidi); atzīmes nosaukums, apraksts un paplašinātie dati kļūst par tās atribūtiem. Augstumi ir metros, un platums un garums ir kā GeoJSON. |

Punkti, multipunkti, līnijas, poligoni ar caurumiem un vairāku daļu formas tiek nolasītas kopā ar to augstumiem (z), ja failā tie ir. Mērījumu (M) vērtības netiek ņemtas. Augstumu režģi un LiDAR atveras tāpat: skatiet [Augstumu režģi un LiDAR](topic:elevation-grids-and-lidar).

## Failu atvēršana

1. Noklikšķiniet uz {{ui:Importēt}} grupā **GIS** (vai {{ui:Atvērt}}), izvēlieties failus vai nometiet tos plānā. Faili tiek nolasīti šajā datorā; nekas netiek augšupielādēts.
2. Dialogs **Importēt GIS datus** uzskaita katru atrasto slāni: tā veidu, objektu skaitu (un cik no tiem nav ģeometrijas), atribūtu lauku skaitu un failā norādīto koordinātu sistēmu. Noņemiet atzīmi no slāņiem, kurus nevēlaties.
3. Izlasiet daļu **Koordinātu sistēma** (zemāk) un rindu **Kas notiks**, pēc tam noklikšķiniet {{ui:Importēt}}.
4. Slāņi parādās plānā un zem **GIS slāņi** kreisajā panelī. Imports ir viens solis: {{key:Mod+Z}} to atsauc.

Liels fails rāda progresa rindu virs plāna ar pogu {{ui:Atcelt}}.

## Koordinātu sistēma

GIS faili norāda, kur tie atrodas, ar koordinātu sistēmas starpniecību (shapefile `.prj`, GeoPackage telpiskās atsauces tabula; GeoJSON vienmēr ir platums un garums). CivilCraft pārvērš katru slāni no tā sistēmas projekta sistēmā. Tas nekad neuzmin:

- **Projektam ir koordinātu sistēma** (iestatīta sadaļā {{ui:Koordinātes}}): katrs slānis ar savu sistēmu tiek pārvērsts tajā, tostarp zemes vai lokālā korekcija. Failam bez `.prj` ir divas izvēles: **Tāda pati kā projektam** (tā skaitļi tiek ielādēti kā ir) vai **Izvēlēties faila sistēmu**.
- **Projektam nav sistēmas, un fails ir projicētā sistēmā projekta vienībās** (piemēram, valsts plaknes zona ASV topogrāfiskajās pēdās pēdu projektam): dialogs piedāvā **Izmantot šo sistēmu kā projekta koordinātu sistēmu**. Tā tiek iestatīta tajā pašā atsaukšanas solī kā imports. Nekas projektā nepārvietojas; sistēma tikai norāda, ko skaitļi nozīmē. Projektam varat izvēlēties citu sistēmu, un slāņi tiks pārvērsti tajā.
- **Projektam nav sistēmas, un fails ir platuma un garuma sistēmā** (katrs GeoJSON) **vai citās vienībās**: {{ui:Importēt}} paliek pelēks, līdz izvēlaties projekta koordinātu sistēmu. Izvēlne sākas netālu no datiem.
- **Ne projekts, ne faili nenorāda sistēmu**: skaitļi tiek ielādēti kā ir, un dialogs to saka.

Arī augstumi tiek pārvērsti: GeoJSON augstumi ir metros (GeoJSON standarts to nosaka); citu failu augstumi tiek ņemti to sistēmas vienībās.

:::warning
Pozīcijas GeoJSON failā ārpus ±180° garuma vai ±90° platuma nav platuma un garuma. Šie objekti tiek izlaisti, un dialogs norāda, cik. Parasti šāds fails ir projicēts fails, kas saglabāts bez sistēmas; pieprasiet to atkārtoti vai shapefile ar `.prj`.
:::

NAD83 tiek uzskatīts par to pašu, kas WGS 84 (sistēma, ko GeoJSON izmanto); abi Ziemeļamerikā atšķiras par dažiem metriem, tāpēc GeoJSON dati var būt novirzīti par tik daudz. Ja labākajai nobīdei nepieciešams režģa fails (piemēram, NADCON NAD27), CivilCraft izmanto grubāku publicētu nobīdi, un koordinātu sistēmas dialogs rāda, cik grubu (NAD27 gadījumā ap 20 m), līdz pievienojat režģi: skatiet [Režģa nobīdes faili](topic:coordinate-systems).

## GIS slāņi

Katrā rindā zem **GIS slāņi** ir:

- izvēles rūtiņa slāņa rādīšanai vai slēpšanai (slēptie slāņi arī netiek atlasīti);
- tā krāsa, izvēlēta no saraksta;
- izvēlne (trīs punkti) ar {{ui:Tālummaiņa uz}}, {{ui:Izmantot virsmai…}}, {{ui:Pārdēvēt…}} un {{ui:Noņemt}}.

Rādīšana, slēpšana, pārkrāsošana, pārdēvēšana un noņemšana ir atsaucamas darbības. GIS slāņi tiek saglabāti projekta failā un atgriežas, kad to atverat. Tie tiek iekļauti arī plāna PDF izdrukā un DXF un DWG eksportos, katrs slānī ar nosaukumu `GIS-` un tā numuru.

## Objektu etiķetes no atribūta

Slāņa izvēlnē {{ui:Vairāk}} (trīs punkti sadaļā **GIS slāņi**) izvēlieties lauku sadaļā **Etiķetēt ar**: katrs objekts plānā rāda savu vērtību slāņa krāsā. Punkti tiek iezīmēti blakus punktam, līnijas pa vidu to garākajai daļai (pagrieztas, lai lasītos no kreisās uz labo), poligoni centrā. Skaitļi tiek rādīti līdz trim decimāldaļām. Etiķetes uz papīra ir 1.8 mm augstas jebkurā mērogā, un tās tiek iekļautas PDF izdrukā, DXF un DWG. Izvēlieties **Bez etiķetēm**, lai tās noņemtu; katra izmaiņa ir viens solis ({{key:Mod+Z}} to atsauc). Slānis iezīmē ne vairāk kā 5,000 objektus.

## Apskatīt objektu

Ar ieslēgtu {{ui:Atlasīt}} noklikšķiniet uz objekta. **Rekvizīti** rāda tā slāni, kurā objekts atrodas, tā formu (daļas, caurumi, virsotnes), augstumus, failu, no kura tas nācis, un šī faila koordinātu sistēmu, pēc tam katru atribūtu tabulā. Atribūti ir tikai lasāmi: CivilCraft rāda GIS datus tādus, kādi tie ir, un tos nerediģē.

Ja zem rādītāja ir gan punkts, gan līnija, uzvar punkts; poligona iekšienē tiek izvēlēts mazākais poligons.

## Izmantot virsmai

Atveriet slāņa izvēlni un izvēlieties {{ui:Izmantot virsmai…}} (vai pogu sadaļā **Rekvizīti**). Piedāvātais atkarīgs no slāņa:

| Slānis | Var kļūt par |
|---|---|
| Līnijas ar augstumiem (3D līnijas) | Lūzumlīnijas to paša augstumā |
| Līnijas bez augstumiem, bet ar skaitļa lauku (horizontāles) | Lūzumlīnijas augstumā no lauka, ko izvēlaties |
| Poligoni | Virsmas robeža (atlasītais poligons, citādi lielākais), vai lūzumlīnijas gar to malām |
| Punkti ar augstumiem vai ar augstuma lauku | Uzmērījumu punkti, aprakstīti ar slāņa nosaukumu, lai veidotu punktu grupu |

Katra izmantošana ir viens atsaucams solis, kas kopē ģeometriju projektā; slānis pats paliek nemainīts. Augstumi tiek ņemti projekta vienībās.

## Punktu faili ar platumu un garumu

Punktu fails, kura galvenē nosauktas kolonnas **platums** un **garums** (`lat`, `latitude`, `lon`, `long`, `longitude`), tiek nolasīts kā grādi, nevis kā ziemeļu un austrumu koordinātes. Importa dialogs to norāda. Pie {{ui:Importēt}} punkti tiek pārvērsti projekta koordinātu sistēmā; projekts bez tādas vispirms prasa to izvēlēties. Grādi nekad netiek ielādēti kā pēdas. Rindas ārpus ±90° platuma vai ±180° garuma tiek noraidītas, norādot iemeslu. Augstuma kolonna tiek ņemta kā tāda, projekta vienībās.

## LandXML faili, kas nosaka koordinātu sistēmu

Kad atvērtajam LandXML failam ir elements `CoordinateSystem` (EPSG kods, WKT apraksts vai sistēmas nosaukums), CivilCraft to piedāvā kā projekta koordinātu sistēmu. Ja piekrītat, nekas nepārvietojas; sistēma tikai norāda, ko skaitļi nozīmē.

## Ko pārbaudīts

- Katrs lasītājs tika salīdzināts ar GDAL, bibliotēku, ko izmanto lielākā daļa GIS programmu, uz failiem, ko rakstījis GDAL: shapefile visu veidu ar un bez augstumiem, daudzdaļu līnijas, poligoni ar caurumiem, tukšas ģeometrijas, teksta, skaitļu, datumu un patiess/aplams atribūti, UTF-8 un Windows-1252 teksts ar un bez `.cpg`, zip ar vairākiem shapefile, GeoJSON ar katru ģeometrijas tipu un GeoPackage ar četrām tabulām. Katra ģeometrija, augstums un atribūts sakrita.
- Pozīcijas, kas pārvērstas no platuma un garuma un no UTM, sakrita ar PROJ (projekciju bibliotēku, kas ir GDAL pamatā) līdz 3 mm.
- Bojāti faili (saīsināti, ar nepatiesiem izmēru norādījumiem, bojāti zip, bojāti GeoPackage) dod vienu vienkāršu paziņojumu; nekas neiestrēgst.
- Nekas šeit vēl nav atvērts citās GIS programmās, un failu geodatabase, KML un KMZ vēl netiek nolasīti (skatiet [Vēl nav izveidots](topic:not-built-yet)).
