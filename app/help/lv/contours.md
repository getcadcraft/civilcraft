---
title: Horizontāļu, augstumu un nogāžu nolasīšana
summary: Iestatiet horizontāļu intervālu un galvenās horizontāles, parādiet augstuma joslas, nogāžu bultiņas un trijstūrus un nolasiet terēna augstumus zem kursora.
keywords: horizontāles, horizontāļu intervāls, galvenās horizontāles, uzraksti, augstuma joslas, nogāžu bultiņas, trijstūri, punktveida augstums, virsmas analīze, augstuma analīze, nogāžu analīze
from: 585e500a
---

Virsma tiek attēlota ar horizontālēm, tiklīdz tā pastāv. Viss, kas aprakstīts šajā tēmā, tiek iestatīts sadaļā **Attēlojums** kreisajā panelī. Attēlojuma iestatījumi maina tikai to, ko redzat (un ko eksportējat); tie nav atsaukšanas soļi.

## Iestatīt horizontāļu intervālu

1. Sadaļā **Attēlojums** izvēlieties vērtību **Horizontāles ik pēc**.
   - Pēdās: 0.25, 0.5, 1, 2, 5, 10 vai 20 ft.
   - Metros: 0.1, 0.25, 0.5, 1, 2, 5 vai 10 m.
2. Izvēlieties **Galvenās ik pēc**: 2., 4., 5. vai 10. horizontāli. Galvenās horizontāles tiek zīmētas biezākas, un to augstums ir norādīts uzrakstā. Tās atrodas veselos galveno intervāla kārtņos (ar 1 ft horizontālēm un ik pēc 5. galveno: 245, 250, 255 …).
3. Izslēdziet {{ui:Horizontāļu uzraksti}}, ja uzraksti sablīvējas nelielā zemesgabalā.

Jauns projekts sākas ar 1 vienību, un ik pēc 5. horizontāle ir galvenā. Horizontāles noliecas pie lūzumlīnijām. Ja tās šķērso noteces līniju vai grēdu, tad šī līnija vēl nav lūzumlīnija (skat. [Virsmas izveide un precizēšana](topic:build-surface)).

:::note
Horizontāles tiek zīmētas tikai tad, ja starp zemāko un augstāko punktu ir ne vairāk kā 2 000 līmeņu. Vietnē ar lielu reljefu un ļoti mazu intervālu plānā horizontāles netiek rādītas nemaz: izvēlieties lielāku intervālu.
:::

## Izlīdzināt horizontāles

Horizontāles tiek izvilktas kā taisni posmi, pa vienam katrā virsmas trijstūrī, tāpēc tās katrā trijstūra malā veido nelielu stūri. **Horizontāļu izlīdzināšana** sadaļā **Attēlojums** noapaļo šos stūrus:

- **Nav (taisni posmi)**: izvilktās līnijas, kādas tās ir. Tā tiek rādīta jaunam vai vecākam rasējumam.
- **Viegla**: stūri nedaudz noapaļoti. Līnija nekad nepārvietojas vairāk nekā par 10% ceļa uz nākamo horizontāli un nekad nenovirzās no sava taisnā posma tālāk par vienu sesto daļu no šī posma garuma.
- **Stipra**: plūstoša līkne. Līnija nekad nepārvietojas vairāk nekā par 25% ceļa uz nākamo horizontāli un nekad nenovirzās no sava taisnā posma tālāk par vienu trešdaļu no šī posma garuma.

Abās izvēlēs izlīdzinātā horizontāle joprojām krusto katras trijstūra malas to pašu punktu kā izvilktā, paliek tā trijstūra iekšpusē, ko šķērso katrs posms, un tāpēc nekad nevar krustot vai pieskarties citai horizontālei. Vietās, kur horizontāle krusto lūzumlīniju vai robežu, tā saglabā asu līkumu. Atzīmētās un eksportētās ir izlīdzinātās līnijas (DXF, DWG, PDF, GIS un 3D), un tām ir vairāk virsotņu nekā izvilktajām līnijām.

Izlīdzināšana maina tikai zīmētās līnijas. Augstumi, tilpumi, profili un griezumi joprojām tiek nolasīti no pašas virsmas. Horizontāle, kas iet tieši caur uzmērījuma punktiem (punkts 250.00 uz 250. horizontāles), katrā šādā punktā saglabā nelielu stūri.

## Kā veidota virsma, uz kuras balstās horizontāles

Horizontāles seko virsmai, un virsma seko **Horizontēšanas metodei** sadaļā **Virsma** kreisajā panelī. Noklusējums, **Triangulācija ar lineāro interpolāciju**, savieno jūsu punktus trijstūros un saglabā katru punktu un lūzumlīniju precīzi. Citas metodes vispirms pielāgo punktiem režģi (krigings, minimālā izliekums, dabiskais kaimiņš, apgrieztais attālums un citas). Tās dod noapaļotākas horizontāles starp punktiem, bet netiek precīzi cauri katram punktam. Virsmas pārskats sadaļā **Virsma** norāda, cik tālu rezultāts ir no jūsu punktiem.

**ABOS (tuvināšana, balstīta uz izlīdzināšanu)** ir viena no režģa metodēm. Tai ir divi paši iestatījumi: **Gludums** (sākotnēji 0.5; jo mazāks, jo gludāks) un **Precizitāte** (sākotnēji 1: virsma tiek pielāgota tā, lai punktos atšķirtos ne vairāk kā 1% no vietnes augstuma diapazona; ierakstiet mazāku skaitli, lai iegūtu precīzāku piegulumu). Ja tā nevar sasniegt precizitāti esošajā režģī, virsmas pārskats to norāda: ierakstiet mazāku **Režģa soli**.

## Nolasīt augstumu jebkurā vietā

Pārvietojiet kursoru pa plānu. Statusa joslā tiek rādīts:

- **E** un **N** zem kursora
- **Terēns** un esošā terēna augstums tur, interpolēts trijstūrī zem kursora
- **Pēc nolīdzināšanas** un projektētais augstums, kur platforma vai koridors ir mainījis terēnu
- „Ārpus virsmas“, ja kursors atrodas ārpus virsmas

Lai nolasītu uzmērījuma punktu precīzi, izvēlieties {{ui:Atlasīt}} un noklikšķiniet uz punkta. Labajā panelī redzams tā numurs, austrumu un ziemeļu koordinātes, augstums, apraksts un grupa.

## Parādīt augstuma joslas

1. Atzīmējiet {{ui:Augstuma joslas}}.
   Virsma tiek aizpildīta ar krāsu no zemas (zilgani zaļa) līdz augstai (okera brūna). Zem izvēles rūtiņām redzams apzīmējums, kurā uzskaitīts katras joslas augstuma diapazons.
2. Izvēlieties joslu skaitu sadaļā **Joslas**: 5, 8, 10 vai 12. Joslas sadala diapazonu no zemākā līdz augstākajam augstumam vienādos soļos.

Joslas paredzētas tikai skatīšanai. Tās netiek eksportētas uz DXF vai drukātas PDF.

## Parādīt nogāžu bultiņas

Atzīmējiet {{ui:Nogāžu bultiņas}}. Katrā trijstūrī, kas ir pietiekami liels, lai tajā ietilptu viena bultiņa, ir īsa bultiņa, kas norāda uz leju. Plakaniem trijstūriem bultiņas nav. Bultiņas ir ātra pārbaude ūdens notecēšanas virzienam; pats slīpuma lielums vēl netiek rakstīts uz zīmējuma.

## Parādīt trijstūrus, punktus un malas

- {{ui:Trijstūri}} zīmē TIN malas. Ieslēdziet, lai pārbaudītu, kā virsma savieno punktus, it īpaši gar lūzumlīnijām un ārmalā.
- {{ui:Punkti}} zīmē katru uzmērījuma punktu; {{ui:Punktu uzraksti}} pievieno tā numuru, augstumu un aprakstu (vai mazāk: skat. **Punktu uzraksti** sadaļā [CivilCraft iestatījumi](topic:settings)).
- {{ui:Lūzumlīnijas}} zīmē lūzumlīnijas (un robežu) oranžā krāsā.
- {{ui:Virsmas mala}} zīmē virsmas kontūru.

## Esošais vai projektētais

Kad platforma vai koridors nolīdzina terēnu bez problēmām, sadaļā **Virsma** zem **Attēlojums** tiek piedāvāta {{ui:Projektētā (ar slīpumiem)}}. Tad horizontāles, joslas un bultiņas rāda nolīdzināto virsmu, lai redzētu jauno terēnu un tam apkārt esošo nogāžu robežu. Lai atgrieztos pie uzmērījuma, izvēlieties {{ui:Esošais reljefs}}.

## Kas tiek eksportēts

DXF un PDF izvade seko šiem iestatījumiem: tas, ko esat izslēdzis, netiek ierakstīts, un horizontāles ir tās, kas tiek rādītas virsmai. Augstuma joslas nekad netiek eksportētas.
