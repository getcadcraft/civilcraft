---
title: Ekrāns pa daļām
summary: Ekskursija pa katru CivilCraft joslu un paneli to ekrāna nosaukumos — no rīkjoslas līdz statusa joslai.
keywords: saskarne, ekrāns, rīkjosla, paneļi, rekvizīti, statusa josla, garenprofila skats, izkārtojums, ekskursija, lietotāja saskarne
from: 76272010
---

CivilCraft ir viens ekrāns. Cilņu un izkārtojumu nav. Sānu paneļus var pārvietot, atbrīvot vai novietot savā logā: skat. [Paneļu izkārtošana un otrā monitora lietošana](common:arrange-panels). No augšas uz leju un no kreisās uz labo pusi:

- **lietotņu josla** (CadCraft zīme, lietotnes nosaukums, versija, Par, ekrāna režīms, Palīdzība, Saglabāt bezsaistei, Papīrs un Modelis)
- **rīkjosla** ar septiņām pogu grupām
- **kreisais panelis**: Objekts, Punkti, Virsma, Attēlojums un, kad importēsiet dažus, GIS slāņi
- **plāns** vidū, zem tā **garenprofila skats**, kad tas ir atvērts
- **labais panelis**: atlasītā objekta **Rekvizīti**
- **statusa josla** apakšā

## Lietotņu josla

Plānā josla augšpusē pieder CadCraft vietnei, nevis pašam CivilCraft.

- Versijas izvēlne rāda, kuru versiju palaižat.
- {{ui:Par CivilCraft}} atver lietotnes lapu vietnē.
- {{ui:Pilnekrāns}} pārslēdz ekrāna režīmus: pilnekrāns, tad pilnekrāns ar paslēptām joslām, tad atpakaļ uz parasto. {{key:Ctrl+Shift+F}} dara to pašu visās platformās, arī Mac (tur tas ir Control taustiņš, nevis Command). Ar paslēptām joslām pārvietojiet rādītāju uz augšējo malu, lai tās atgrieztu.
- {{ui:Palīdzība}} (vai {{key:F1}}) atver šo palīdzību sānu panelī; {{key:F1}} vai {{key:Esc}} to aizver.
- {{ui:Saglabāt bezsaistei}} saglabā CivilCraft šajā pārlūkā, lai tas atvērtos bez savienojuma; tad rāda {{ui:Gatavs darbam bezsaistē}}. Skat. [Failus, ko varat atvērt, saglabāt un eksportēt](topic:files#online-and-offline).
- {{ui:Papīrs}} un {{ui:Modelis}} pārslēdz gaišo un tumšo motīvu. Plāns un profils seko motīvam; PDF faili vienmēr tiek drukāti uz balta fona.

## Rīkjosla

Katrai grupai virs pogām ir neliels nosaukums. Uzvelciet rādītāju virs pogas, lai redzētu tās padomu un taustiņu.

| Grupa | Pogas | Ko tās dara |
|---|---|---|
| Fails | {{ui:Jauns}}, {{ui:Atvērt}}, {{ui:Saglabāt}} | Sākt no jauna, atvērt punktu failu, LandXML vai projektu, saglabāt projektu kā lejupielādi |
| Eksportēt | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Ierakstīt LandXML 1.2, R12 DXF vai plāna DWG, vai izdrukāt plānu PDF |
| Virsma | {{ui:Lūzumlīnija}}, {{ui:Robeža}} | Zīmēt lūzumlīniju caur uzmērījuma punktiem; zīmēt ārējo robežu |
| Projektēšana | {{ui:Trase}}, {{ui:Platforma}}, {{ui:Caurules}}, {{ui:Garenprofils}} | Zīmēt trasi, platformu, cauruļu līniju; rādīt vai slēpt garenprofila skatu |
| Rediģēt | {{ui:Atsaukt}}, {{ui:Atkārtot}}, {{ui:Kopēt}}, {{ui:Ielīmēt}}, {{ui:Vairāk}} | Atsaukt, atkārtot, kopēt un ielīmēt uzmērījuma punktus; {{ui:Vairāk}} satur Griezt, Ielīmēt vietā, Dublēt, Dzēst, Atlasīt visus punktus un Noņemt atlasi |
| GIS | {{ui:Koordinātes}}, {{ui:Importēt}}, {{ui:Eksportēt}}, {{ui:Karte}} | Iestatīt koordinātu sistēmu, importēt un eksportēt GIS failus, rādīt karšu slāņus zem plāna |
| Skats | {{ui:Atlasīt}}, {{ui:Pielāgot}}, {{ui:3D}} | Atlasīt un pārvietot; tuvināt, lai parādītu visu; rādīt objektu 3D ([Skatīt objektu 3D](topic:site-3d)) |

Zīmēšanas rīks paliek nospiests, kamēr ir aktīvs. Noklikšķinot uz tā vēlreiz, nospiežot {{key:Esc}} vai nospiežot {{key:V}}, atgriežaties pie {{ui:Atlasīt}}. {{ui:Atsaukt}}, {{ui:Atkārtot}}, {{ui:Kopēt}} un {{ui:Vairāk}} vienumi tiek padarīti pelēki, kad nevar darboties; padoms norāda iemeslu (piemēram, "Vispirms atlasiet uzmērījuma punktus"). Katra poga ir uzskaitīta [Rīkjoslas uzziņā](topic:toolbar).

Šaurā logā rīkjosla ritina sāniski.

## Kreisais panelis

### Objekts

- **Nosaukums**: projekta nosaukums. Tas nosauc katru saglabāto vai eksportēto failu un tiek drukāts PDF virsraksta joslā.
- **Mērvienības**: {{ui:ASV pēdas}} vai {{ui:Metri}}. Tas norāda, ko nozīmē skaitļi. Mainot to, koordinātes **netiek** pārveidotas; skat. [Mērvienības, pikets un skaitļu formāti](topic:units-and-stations).

### Punkti

Tukšs, tas parāda, kā atvērt punktu failu. Ar punktiem tas rāda faila nosaukumu, punktu skaitu un to, cik no tiem ir augstums, pēc tam **punktu grupu** tabulu: viena rinda katram apraksta pirmajam vārdam (GRD, FL, TBS …), ar skaitu un izvēli **Virsma**:

- {{ui:Punkti}}: punkti iet virsmā (katras grupas noklusējums).
- {{ui:Lūzumlīnija}}: grupas punkti tiek savienoti punktu numuru secībā vienā lūzumlīnijā.
- {{ui:Atstāts ārpusē}}: grupa neskar virsmu.

### Virsma

Dati par esošo reljefu: punkti, trijstūri, zemākais un augstākais augstums, vidējais augstums, 2D un 3D laukums, lūzumlīnijas un vai ir robeža. Zem datiem lodziņā uzskaitīts viss, ko virsmas veidotājam bija jālabo vai ko tas nevarēja izdarīt. Pēc tam:

- **Garākā ārējā mala**: 0 saglabā katru ārējo trijstūri; skaitlis nogriež garus, šaurus trijstūrus no ārpuses.
- Saites, kas parādās, kad tās attiecas: {{ui:Noņemt robežu}}, {{ui:Noņemt zīmētās lūzumlīnijas}} un, virsmai, kas nolasīta no LandXML, {{ui:Pārbūvēt virsmu no punktiem}}.

### Attēlojums

- **Virsma**: {{ui:Esošais reljefs}} vai {{ui:Projektētā (ar slīpumiem)}}. Otrā ir pieejama, kad platforma vai koridors veido slīpumus bez problēmām.
- **Horizontāles ik pēc**, **Galvenās ik pēc** un **Joslas** (krāsu joslu skaits).
- Izvēles rūtiņas: {{ui:Horizontāles}}, {{ui:Horizontāļu uzraksti}}, {{ui:Trijstūri}}, {{ui:Augstuma joslas}}, {{ui:Nogāžu bultiņas}}, {{ui:Punkti}}, {{ui:Punktu uzraksti}}, {{ui:Lūzumlīnijas}}, {{ui:Virsmas mala}}, {{ui:Caurules}}.
- Joslu augstumu leģenda parādās, kad joslas ir ieslēgtas.

Attēlojuma iestatījumi tiek saglabāti kopā ar projektu, bet nav atsaukšanas soļi: {{key:Mod+Z}} nekad neatgriež izvēles rūtiņu.

## Plāns

Plānā redzami punkti, virsma un viss, ko projektējat, plāna skatā ar ziemeļiem uz augšu. Ritiniet riteni, lai tuvinātu rādītāja vietā, velciet tukšu vietu, lai panoramētu. Pilns saraksts ir [Taustiņi un pele](topic:keyboard).

- Tukšā projektā lodziņš ar nosaukumu **Sāciet ar uzmērījuma punktiem** uzskaita pirmos soļus un piedāvā {{ui:Atvērt parauga objektu}}.
- Kamēr zīmēšanas rīks ir aktīvs, padoms plāna augšdaļā norāda, uz ko noklikšķināt un kā pabeigt.
- Velkot failu pāri plānam, tiek rādīts "Nometiet punktu failu, LandXML vai projektu".
- Atlasītie objekti tiek izcelti. Atlasītai trasei vai platformai kvadrātveida turi rādās PI vai stūros; atlasītai konstrukcijai — viens turis. Velciet turi, lai to pārvietotu.
- Atlasītiem uzmērījuma punktiem ir gredzens. {{key:Shift}} un klikšķis pievieno vai noņem punktu; {{key:Shift}} un velkot zīmē kasti (vai, velkot apkārt tiem, lasso), kas pievieno tajā esošos punktus. Skat. [Uzmērījuma punktu atlase, kopēšana un ielīmēšana](topic:copy-paste-points).

## Garenprofila skats

Nospiediet {{key:R}} vai noklikšķiniet uz {{ui:Garenprofils}}, lai to atvērtu zem plāna. Tā joslā ir:

- trases saraksts (pieejams, ja ir divas vai vairāk trases)
- {{ui:Pievienot PVI}}: kamēr tas ir nospiests, klikšķis garenprofilā pievieno PVI ({{key:I}} to pārslēdz)
- rādījums ar pikets, reljefs, projektētais augstums, slīpums un izrakums vai uzbērums zem rādītāja
- aizvēršanas poga

Garenprofilā redzams esošais reljefs, projektētais profils, slīpumi katrā pieskarē, katra PVI pikets un augstums, katras vertikālās līknes L un K ar tās BVC un EVC, augstākie un zemākie punkti un vertikālais pārspīlējums. Tas vienmēr ietilpina visu trasi: tas netuvina un nepanoramē. Virzot rādītāju pa to, plānā uz trases parādās punkts.

## Labais panelis: Rekvizīti

Tā virsraksts norāda, ko tas rāda.

- **Projekts** (nekas nav atlasīts): trases un platformas kā saites, bloks **Zemes darbi** un bloks **Cauruļu tīkls** ar tā noteikumiem un problēmām.
- **Trase**: nosaukums, sākuma pikets, garums, PI tabula, līknes, projektētā profila PVI tabula un dati, un **Koridors** iestatījumi.
- **Platforma**: nosaukums, augstums, izrakumu un uzbērumu nogāzes, laukums, šķēluma dati un zemes darbi.
- **Konstrukcija** vai **Caurule**: izmēri, malas, apakšas, slīpums, pārsegums un problēmas.
- **Punkts** un tā numurs: punkta koordinātes, augstums, apraksts un grupa (tikai lasāmi).

Lauki stājas spēkā, kad nospiežat {{key:Enter}} vai atstājat lauku. Vērtība, ko nepieņem, tiek atzīmēta kā nederīga, un nekas nemainās.

## Statusa josla

- **E** un **N**: austrumu un ziemeļu koordinātes zem rādītāja.
- **Reljefa** augstums tur (un **Ar slīpumiem**, kur platforma vai koridors to ir mainījis), vai "Ārpus virsmas".
- Tuvākā trase (vai atlasītā) ar **Pik** un nobīdi (**L** vai **R**) zem rādītāja.
- Labajā pusē ziņojumi: kas tikko notika vai kāpēc kaut kas tika noraidīts. Ziņojums pats pazūd pēc dažām sekundēm.

## Dialogi

- **Importēt punktus**: atveras ar katru punktu failu. Skat. [Uzmērījuma punktu importēšana](topic:import-points).
- **Plāna izdruka PDF formātā**: skat. [Plāna izdruka PDF formātā](topic:plot-pdf).
- **Nesaglabātas izmaiņas**: jautā, pirms {{ui:Jauns}} vai projekta vai LandXML faila atvēršana izmet nesaglabātu darbu. {{ui:Saglabāt kopiju}} vispirms lejupielādē projektu.

## Mazi ekrāni

Līdz 760 pikseļiem platumā, piemēram, tālrunī, plāns aizņem visu ekrānu: rīkjosla ir viena rinda, kas ritina sāniski, un paneļi atveras kā lapas no joslas apakšā. {{ui:Rīki}} paslēpj rīkjoslu, un {{ui:Pārvietot}} to novieto apakšā.
