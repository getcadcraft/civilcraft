---
title: Projekta koordinātu sistēmas iestatīšana
summary: Norādiet, kādā koordinātu sistēmā ir uzmērījums, lai CivilCraft rādītu platuma un garuma grādus, izvietotu GIS failus un kartes slāņus un rakstītu .prj failus. Izvēlieties pēc koda, nosaukuma, pašām koordinātēm vai no .prj faila.
keywords: koordinātu sistēma, crs, epsg, srid, valsts plakne, spcs, utm, nad83, wgs 84, projekcija, prj, wkt, datums, platums, garums, lat long, ģeogrāfiska, režģis, georeferencēšana, koordinātu sistēmas piešķiršana
from: 964250e2
---

Projekta koordinātes ir vienkārši skaitļi, kamēr nenorādāt, ko tie nozīmē. Koordinātu sistēmas iestatīšana **nekad nepārvieto neko**: tā tikai norāda CivilCraft, ka, piemēram, E 6,150,000 N 2,080,000 ir Kalifornijas 6. zonas valsts plaknes koordinātes ASV uzmērījuma pēdās. Kad sistēma ir zināma:

- statusa joslā tiek rādīts kursora platuma un garuma grāds,
- GIS faili citās sistēmās (shapefile, GeoJSON, GeoPackage, augstuma režģi, LiDAR) tiek pārveidoti projektā, tiklīdz tie tiek atvērti,
- kartes slāņus var zīmēt zem plāna ([Rādīt kartes slāņus zem plāna](topic:map-layers)),
- eksports GIS formātos ietver sistēmu (`.prj` shapefile failiem un EPSG kods GeoPackage un GeoTIFF failiem).

## Izvēlēties sistēmu

1. Rīkjoslas grupā {{ui:GIS}} izvēlieties {{ui:Koordinātes}}. Atveras dialoglodziņš **Koordinātu sistēma**. Augšdaļā ir norādīts, kādā sistēmā projekts ir tagad, vai **Nav — koordinātes ir tikai skaitļi**.
2. Atrodiet sistēmu vienā no šiem veidiem:
   - **Meklēšana**: ierakstiet EPSG kodu (`2277`, `EPSG:2277`) vai vārdus no nosaukuma (`texas central`, `utm 14n`, `lambert-93`). Kodi tiek uzskaitīti no ierakstītā; vārdi tiek uzskaitīti sistēmām, kuru nosaukumā ir visi vārdi.
   - {{ui:Sistēmas, kurām atbilst šīs koordinātas}} (ja projektā ir punkti vai virsma): CivilCraft nolasa projekta vidu visās projekta mērvienību saimes sistēmās un uzskaita tās, kuru izmantošanas apgabals to aptver. Valsts plaknes koordinātes parasti atbilst tikai dažām zonām: projekts Teksasā ar E 3,115,000 N 10,070,000 ASV uzmērījuma pēdās atbilst četrām Teksasas Central variantiem (NAD83, NAD83(2011), HARN, NSRS2007). Katrā ierakstā ir redzams, kur atrastos projekta vidus.
   - **Tuvu (platums, garums)** un {{ui:Ieteikt}}: ierakstiet, kur atrodas vieta, piemēram, `30.27, -97.74` vai `30°16′N 97°44′W`, un CivilCraft uzskaita projicētās sistēmas, kuru apgabals to aptver, vispirms valsts un štatu režģus.
   - {{ui:Nolasīt .prj failu…}}: atveriet `.prj` failu, kas nācis kopā ar shapefile vai zīmējumu. CivilCraft to saskaņo ar savu sarakstu pēc projekcijas aprēķiniem (tāpēc `.prj`, kas datumu nosauc citādi, joprojām atrod pareizo sistēmu) un norāda, kura tā ir; ja nekas nesakrīt precīzi, tiek izmantots paša faila apraksts. Varat arī ievilkt `.prj` failu dialoglodziņā vai atvērt vai ievilkt to uz paša plāna.
3. Noklikšķiniet uz sistēmas sarakstā. Zem **Izvēlētā** tiek rādīts nosaukums, EPSG kods, mērvienība, cik labi tās datums ir piesaistīts WGS 84, tās izmantošanas apgabals platuma un garuma grādos un tas, kur atrodas projekta vidus.
4. Atstājiet atlasītu **Režģis** (vairumam projektu; citus skat. [Ģeogrāfiskās un vietējās koordinātes](topic:ground-and-local-coordinates)) un izvēlieties {{ui:Lietot}}.

Statusa joslā tagad kursora platuma un garuma grāds tiek rādīts blakus E un N. Koordinātu sistēmas iestatīšana ir viens atsaukšanas solis: {{key:Mod+Z}} to atsauc.

:::note
Mērvienībām jāsakrīt: projekts pēdās pieņem sistēmas ASV uzmērījuma pēdās vai starptautiskajās pēdās, projekts metros pieņem sistēmas metros. CivilCraft paskaidro noraidījumu (“Projekts ir pēdās, bet šī sistēma ir metros…”). Pēdu projekts ar ASV uzmērījuma pēdu sistēmu izmanto uzmērījuma pēdas: projekta „ft“ nozīmē sistēmas pēdu. Ģeogrāfiskās sistēmas (platums un garums, piemēram, pats WGS 84) nevar būt projekta sistēma, jo zīmējumiem vajadzīgas austrumu un ziemeļu koordinātes.
:::

## Mainīt vai noņemt sistēmu

Atkal atveriet {{ui:Koordinātes}}, izvēlieties citu sistēmu un izvēlieties {{ui:Lietot}}. Ja projektā ir punkti vai projekts, CivilCraft jautā **Vai koordinātes jau ir …?**

- {{ui:Jā — nekas nepārvietojas}}: skaitļi paliek tādi, kādi tie ir, un mainās tikai to nozīme. Izmantojiet to, ja vecā sistēma tika izvēlēta kļūdaini.
- {{ui:Nē — pārveidot tos}}: katrs uzmērījuma punkts, lūzumlīnija, robeža, trases PI, platformas stūris un konstrukcija tiek pārveidoti no vecās sistēmas uz jauno vienā atsaukšanas solī. Virsmu, kas nolasīta no LandXML kā trijstūri, nevar pārveidot; vispirms to atjaunojiet no punktiem.

{{ui:Noņemt sistēmu}} noņem sistēmu (nekas nepārvietojas). GIS slāņi, kas jau atrodas projektā, paliek savās vietās.

## Platuma un garuma grāds statusa joslā

Kamēr projektam ir sistēma, statusa joslā tiek rādīts kursora platuma un garuma grāds WGS 84, piemēram, `30°18′00.00″ N  97°42′00.00″ W`. Lai redzētu decimālos grādus, izvēlieties tos sadaļā {{ui:Iestatījumi}}, {{ui:CivilCraft}}, **Platums un garums** ([CivilCraft iestatījumi](topic:settings)). Ja koordinātes ir terēna vai vietējās, rādījums vispirms iet caur šo soli, tāpēc tas ir pareizs punktam zem kursora.

## Cik laba ir datuma nobīde

Platums, garums, GeoJSON un kartes slāņi visi ir WGS 84. Katras sistēmas piesaiste WGS 84 ir redzama dialoglodziņā:

| Ko rāda dialoglodziņš | Ko tas nozīmē |
|---|---|
| Pats WGS 84 | Nav nekādas nobīdes. |
| NAD83 tiek uzskatīts par WGS 84 | Abi atšķiras par metru vai diviem lielākajā daļā Ziemeļamerikas, visvairāk par dažiem metriem. Labi kartēm un vietas kontekstam, bet nav piemēroti uzmērījuma kontrolei. |
| Zināms līdz aptuveni *n* m (EPSG dati) | Publicēta nobīde; kartes slāņi un GeoJSON var atšķirties aptuveni tikpat. |
| Šim datumam nav zināms | Bez režģa faila nav publicētas nobīdes: kartes slāņi un GeoJSON var atšķirties par simtiem metru. |
| No režģa nobīdes faila … | Tiek izmantots režģa nobīdes fails (skat. zemāk): režģa iekšienē tas atbilst NAD83 aptuveni 10 cm robežās. |

Projekta paša koordinātes nekad neiet caur datuma nobīdi: to dara tikai tas, kas tiek pārveidots uz platumu un garumu vai no tiem. Vertikālie datumi un ģeoīda modeļi netiek apstrādāti (augstumi nekad netiek pārveidoti). Ja labākā nobīde prasa režģa failu, sarakstā ir norādīta aptuvenāka publicēta nobīde un dialoglodziņš rāda tās precizitāti (piemēram, NAD27 sistēmām aptuveni 20 m), līdz pievienojat režģi.

## Režģa nobīdes faili

NAD27 sistēmai dialoglodziņā koordinātu sistēmā **Režģa nobīdes fails** liek platumam, garumam, GIS failiem un kartes slāņiem atrasties aptuveni 10 cm robežās no NAD83, nevis aptuveni 20 m robežās:

- **Lejupielādēt** režģi, ko tas iesaka sistēmas apgabalam (NADCON5 ASV kontinentālajai daļai, NADCON Aļaskai, NTv2 Kanādai) no cdn.proj.org, PROJ publiskā režģu servera. Tiek nosūtīts tikai režģa faila nosaukums.
- Vai **Pievienot režģa failu…**, ja jau to esat ieguvis: NTv2 (`.gsb`) vai PROJ GeoTIFF režģis (`.tif`), līdz 20 MB.

Režģis tiek saglabāts projekta failā, tāpēc tas pārvietojas kopā ar projektu. Sadaļā norādīts, vai projekta vidus atrodas režģa iekšienē: ārpus tā nobīde netiek piemērota vispār, tāpēc izmantojiet režģi, kas pārklāj vietu. {{ui:Pārtraukt režģa izmantošanu}} atgriež aptuveno nobīdi. Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc.

GIS slāņi, kas jau atrodas projektā, paliek savās vietās, kad mainās režģis; importējiet tos vēlreiz, lai tos izvietotu caur režģi. Projekta paša koordinātes nekad nepārvietojas.

## Kas ir pārbaudīts

- Katra pārveidošana tika salīdzināta ar PROJ (pyproj 3.7.1 ar PROJ 9.5.1), koordinātu bibliotēku, ko izmanto vairums GIS programmu, vairāk nekā 330 sistēmās: valsts plaknes ASV uzmērījuma pēdās un pēdās, UTM ziemeļos un dienvidos, Lambert-93, British National Grid, GDA2020 MGA, Jaunzēlandes šķērsmerkatora projekcija un tīmekļa Merkators citu starpā. Austrumu un ziemeļu koordinātes sakrīt ar 1 cm precizitāti ar to pašu datuma nobīdi (lielākoties ar mazāk nekā 1 mm), un projekcijas aprēķini sakrīt ar PROJ paša definīcijām ar 1 cm precizitāti.
- `.prj` faili, ko rakstījis PROJ abās izplatītākajās formās (ESRI un OGC), tika nolasīti atpakaļ 105 sistēmām: 208 no 210 atbilda precīzam EPSG kodam, bet pārējās divas — sistēmai ar tiem pašiem aprēķiniem uz tā paša elipsoīda. `.prj` faili, ko raksta CivilCraft, PROJ nolasa kā to pašu sistēmu. ESRI `.prj` faili polārajām stereogrāfiskajām sistēmām (UPS, Aļaskas polārā) nav nolasāmi; izvēlieties šīs sistēmas pēc koda.
- Platums un garums statusa joslā sakrita ar PROJ ar 0.01″ precizitāti pārlūkprogrammā.
