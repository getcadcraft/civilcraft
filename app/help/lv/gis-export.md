---
title: Eksportēt izbūves datus GIS
summary: Nodot uzmērījumu punktus, horizontāles, trases, platformas, caurules un konstrukcijas pilsētas vai novada GIS nodaļai kā shapefile, GeoPackage, GeoJSON vai KML, projekta koordinātu sistēmas režģa koordinātēs.
keywords: gis, eksports, kml, kmz, google earth, izbūves dati, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, caurules, konstrukcijas, komunikācijas, pilsēta, novads, režģis, zeme, epsg, prj
from: bba4fea5
---

Daudzas pilsētas un novadi projekta noslēgumā prasa izbūves datus GIS formātā: kur ir novietotas caurules un konstrukcijas, gala augstumi, ceļa centrālā līnija. **GIS › Eksportēt** ieraksta to, ko CivilCraft glabā, kā GIS slāņus, pa vienam katram objekta veidam.

## Pirms eksportēšanas

1. Iestatiet projekta koordinātu sistēmu sadaļā {{ui:Koordinātes}}. GIS nodaļai jāzina, kur ir skaitļi; bez sistēmas failos ir projekta paši skaitļi, bet nav nosaukta sistēma.
2. Pārbaudiet virsmu, trases, platformas un cauruļu tīklu tā, kā vēlaties tos nodot.
3. Pajautājiet nodaļai, kādu formātu un kuru koordinātu sistēmu viņi vēlas. Daudzi joprojām prasa shapefile vietējā valsts plaknes zonā; jaunākas sistēmas pieņem GeoPackage.

## Eksportēšana

1. Noklikšķiniet uz {{ui:Eksportēt}} grupā **GIS**.
2. Sadaļā **Ko** atzīmējiet veidus, ko sūtīt. Katrs rāda, cik objektu tam ir; veidi, kuriem vēl nekā nav, ir pelēki.
3. Sadaļā **Kā** izvēlieties formātu.
4. Izlasiet piezīmes par koordinātām un vienībām un noklikšķiniet lejupielādes pogu. Statusa rindā teikts, kas tika ietverts un kuri lauku nosaukumi tika saīsināti.

Dialoga logā ir arī augstumu režģa eksports ({{ui:Virsma kā GeoTIFF augstumu režģis}}); skatiet [Augstumu režģi un LiDAR](topic:elevation-grids-and-lidar).

## Ko katrs veids satur

| Veids | Forma | Lauki |
|---|---|---|
| Uzmērījumu punkti | Punkti ar augstumu | `P` punkta numurs, `N` ziemeļu koordināta, `E` austrumu koordināta, `Z` augstums, `D` apraksts |
| Esošās zemes horizontāles, projektētās virsmas horizontāles | Līnijas to augstumā | `ELEV` |
| Lūzumlīnijas | Līnijas ar augstumiem | `NAME` |
| Virsmas robeža | Poligons (zīmētā robeža, citādi virsmas mala) | `NAME` |
| Trases | Centrālās līnijas | `NAME`, `LENGTH`, `STA_START`, `STA_END` (pikketāžas kā vienkārši skaitļi) |
| Platformas | Poligoni platformas augstumā | `NAME`, `ELEV`, `AREA` |
| Dienasgaismas līnijas | Līnijas ar augstumiem (platformas un koridori) | `NAME` |
| Koridora elementu līnijas | Līnijas ar augstumiem: ass, braucamās daļas malas, uzbrauktuves | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Caurules | Līnijas no augšējā līdz apakšējam iekšējam līmenim | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (procenti), `LENGTH`, `NETWORK` |
| Konstrukcijas | Punkti pie šahtas vāka | `NAME`, `RIM`, `INVERT` (zemākais caurules iekšējais līmenis tur), `SUMP`, `DIA`, `DIA_UNIT` |
| Katrs GIS slānis | Kā importēts | Savi lauki |

Garumi, pikketāžas un augstumi ir projekta vienībās (ASV topogrāfiskās pēdas vai metri). Cauruļu un konstrukciju diametri ir collās pēdu projektiem un milimetros metru projektiem; `DIA_UNIT` norāda, kas ir.

## Formāti

- **Shapefile**: viens `.zip` ar shapefile katram veidam (`.shp`, `.shx`, `.dbf`), `.cpg` fails, kas norāda, ka teksts ir UTF-8, un `.prj` fails ar koordinātu sistēmu. Formas ar augstumiem tiek rakstītas kā shapefile Z tipi. Lauku nosaukumi, kas garāki par 10 rakstzīmēm, tiek saīsināti, kā to prasa formāts; statusa rindā tie ir uzskaitīti.
- **GeoPackage**: viens `.gpkg` fails ar tabulu katram veidam; koordinātu sistēma saglabāta ar EPSG kodu. Viens fails, nevis daudz; gari lauku nosaukumi saglabāti.
- **KML** vai **KMZ** (KML saspiests): viens fails ar platuma un garuma koordinātēm Google Earth un tīmekļa kartēm, mape katram veidam, katrs objekts kā atzīme ar nosaukumu no lauka NAME un visi lauki kā paplašinātie dati; augstumi metros (augstuma režīms absolūts). Tāpat kā GeoJSON, tam nepieciešama projekta koordinātu sistēma.
- **GeoJSON**: viens fails platuma un garuma koordinātēs (GeoJSON standarts nepieļauj citas), katram objektam īpašība `kind` (`pipes`, `structures`, …), lai saņēmējs tos var sadalīt. Augstumi pārvērsti metros, kā to prasa standarts; tie paliek jūsu projekta vertikālajā datumā (CivilCraft nav geoīda modeļa). Projekts bez koordinātu sistēmas nevar eksportēt GeoJSON, un dialogs norāda iemeslu.

## Režģis, nevis zeme

GIS nodaļas glabā savus datus koordinātu sistēmas **režģa** koordinātēs. Ja jūsu projektā izmantotas zemes vai lokālās koordinātes (iestatītas sadaļā {{ui:Koordinātes}}), katra koordināte tiek pārvērsta atpakaļ režģī, izejot ārā: skaitļi failos atšķiras no plāna skaitļiem par jūsu mēroga koeficientu (un pagriezienu lokālai sistēmai). Punktu lauki `N` un `E` arī satur režģa vērtības. Dialogs to atgādina.

:::tip
Pievienojiet failiem īsu piezīmi: koordinātu sistēmu un tās EPSG kodu, augstumu vertikālo datumu, vienības un to, kas ir katrs fails.
:::

## Ko pārbaudīts

- Katrs rakstītais fails tika nolasīts atpakaļ ar GDAL, bibliotēku, ko izmanto lielākā daļa GIS programmu: katra forma, augstums un atribūts, objektu skaits un koordinātu sistēma kā EPSG kods (`.prj` un GeoPackage). Mūsu pašu lasītāji tos nolasa tāpat.
- GeoJSON faili atbilst RFC 7946: garums pirms platuma, nav `crs` elementa, ārējie gredzeni pretēji pulksteņrādītāja virzienam un caurumi pulksteņrādītāja virzienā; pozīcijas sakrīt ar PROJ līdz 2 mm.
- Projekts ar zemes koordinātēm tika eksportēts, un katrs punkts pārbaudīts pret tā režģa koordinātēm.
- Nekas šeit vēl nav atvērts citās GIS programmās. Pārbaudiet pirmo nodevumu ar nodaļu, pirms uz to paļaujaties.
