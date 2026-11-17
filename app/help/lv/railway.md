---
title: Sliežu ceļa projektēšana
summary: Padariet trasi par dzelzceļu: sliedes pārejas (klotoīde, kubiskā parabola, Bloss, Helmerts, sinusa pusvilnis, sinuss), virsaugstums katrā līkumā ar tā līdzsvara virsaugstumu, deficītu un pārpalikumu, virsaugstuma un sliežu ceļa ģeometrijas ierobežojumi kā brīdinājumi, pārmijas un savienojumi pēc piketāžas, brīvās telpas aploksne, kas izvērsta gar līniju, un sliežu ceļš ar sliedēm, gulšņiem un balasta gultni, veidots kā koridors plānā, griezumos, garenprofilā, 3D un daudzumos.
keywords: dzelzceļš, sliedes, dzelzceļa līnija, sliežu ceļš, vilciens, metro, tramvajs, virsaugstums, virsaugstuma deficīts, virsaugstuma pārpalikums, līdzsvara virsaugstums, pāreja, pārejas līkums, klotoīde, kubiskā parabola, Bloss, Helmerts, sinusa pusvilnis, kosinuss, sliežu platums, normālais sliežu platums, platais sliežu platums, metra sliežu platums, šaurais sliežu platums, gulsnis, balasts, apakšbalasts, pamatne, sānu josla, sliežu ceļu asu attālums, 60E1, 54E1, UIC60, 115RE, 136RE, virsaugstuma gradients, virsaugstuma izmaiņu ātrums, pārmija, strēle, savienojums, krustojums, krustojuma numurs, pievads, noslēguma līkums, atzarojuma ātrums, brīvā telpa, brīvās telpas aploksne, būvju gabarīts, kravas gabarīts, kinemātiskā aploksne, perons, perona sprauga, sliežu ceļu attālums, slīpums, vertikālais līkums, mazākais rādiuss, LandXML virsaugstums
from: 99de9745
---

Jebkuru trasi var padarīt par dzelzceļa sliežu ceļu. Tās līkumiem tad tiek pievienotas sliedes pārejas un virsaugstums (sliežu virsaugstums), un tās koridors tiek veidots kā sliežu ceļš: sliedes uz gulšņiem uz balasta gultnes, nogāzts zemē kā ceļš. Pārmijas un savienojumi tiek pievienoti pēc piketāžas, un brīvās telpas aploksni var izvērst gar līniju un pārbaudīt pret to, kas atrodas blakus sliežu ceļam.

Katrs skaitlis zemāk ir **vietturis**, nevis standarts. Dzelzceļi savus ierobežojumus nosaka pēc līnijas ātruma, sliežu ceļa veida un valsts; iestatiet tos pēc sava dzelzceļa standarta. CivilCraft nepievieno nacionālu tabulu.

## Padariet trasi par dzelzceļu

1. Atlasiet trasi un rekvizītos atrodiet **Dzelzceļš**.
2. Atzīmējiet **Šī trase ir dzelzceļa sliežu ceļš**. Katra izmaiņa ir viens soli atpakaļ.
3. Iestatiet **Projektētais ātrums** trases rekvizītu augšdaļā: tas ir līnijas ātrums, pret kuru tiek pārbaudīts virsaugstums. **Lēnākie vilcieni** (Dzelzceļa blokā) ir ātrums, pret kuru tiek pārbaudīts virsaugstuma pārpalikums.

## Pārejas

Katram līkumam PI tabulā (**Ieejas spirāle**, **Izejas spirāle**) iestatiet spirāles garumu abos galos, pēc tam izvēlieties tā veidu Dzelzceļa bloka līkumu tabulā vai **Pāreja katram līkumam**:

| Veids | Līkuma izmaiņa pārejā |
|---|---|
| Klotoīde | pieaug vienmērīgi (ceļa spirāle) |
| Kubiskā parabola | y = x³ / (6·R·L), ar L mērītu pa tangentu; pati līkne ir nedaudz garāka |
| Bloss | 3u² − 2u³ no pilnā līkuma (u = garuma daļa): sākas un beidzas maigi |
| Helmerts | divas parabolas, 2u² un tad 1 − 2(1 − u)² |
| Sinusa pusvilnis | (1 − cos πu) / 2 |
| Sinuss | u − sin(2πu) / 2π |

Visi, izņemot kubisko parabolu, pagriežas par L / 2R, tāpat kā klotoīde. Piketāža iet pa īsto garumu. LandXML saglabā veidu (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Virsaugstums

Ierakstiet katra līkuma **Virsaugstums** milimetros. Tabulā katram līkumam redzams:

- **Līdzsvara virsaugstums** = G·v² / (g·R), kur G ir sliežu centru attālums (**Sliežu centri**, sliedes platums plus sliedes galvas platums, ja to neierakstāt pats). Ar G = 1500 mm tas ir pazīstamais 11.8·V² / R (V km/h, R m).
- **Deficīts** = līdzsvara virsaugstums līnijas ātrumā − pielietotais virsaugstums.
- **Pārpalikums** = pielietotais virsaugstums − līdzsvara virsaugstums lēnāko vilcienu ātrumā.
- **Rampa**: lielākais virsaugstuma slīpums tā rampās, milimetros uz metru.

Virsaugstums pieaug pāri katrai pārejai, un tā forma atbilst līkuma izmaiņai: taisna klotoīdei vai kubiskajai parabolai, Blosa forma Blosam un tā tālāk. Līkuma galam bez pārejas virsaugstums pieaug taisnajā posmā pirms tā, cik garš vajadzīgs virsaugstuma slīpuma ierobežojumam, un par to tiek paziņots: tad virsaugstums mainās tur, kur līkums nemainās.

**Virsaugstums pagriežas ap** norāda, kura sliede paliek projektētajā garenprofilā: **zemākā sliede** (parasti), **iekšējā sliede** vai **sliežu ceļa centrs** (katra sliede pārvietojas par pusi no virsaugstuma). Projektētais garenprofils tur ir sliedes augšdaļa.

**Virsaugstuma diagramma** attēlo katras sliedes augstumu pāri profilam pa piketāžu; profila skatā un plāna un garenprofila lapās tas redzams kā josla zem profila.

## Virsaugstuma ierobežojumi un brīdinājumi

**Lielākais pielietotais virsaugstums**, **Lielākais virsaugstuma deficīts**, **Lielākais virsaugstuma pārpalikums**, **Vislielākais virsaugstuma slīpums** un **Straujākā virsaugstuma izmaiņa** (slīpums līnijas ātrumā, mm/s) tiek pārbaudīti katrā līkumā. Vērtība virs ierobežojuma ir brīdinājums Dzelzceļa blokā un Problēmu panelī, ar norādīto ierobežojumu un atrasto vērtību. Ja nav projektētā ātruma, deficīts un izmaiņas ātrums netiek pārbaudīti (par to ir paziņojums).

## Sliežu ceļš

Iestatiet **Sliedes platums** (standarta 1435 mm, platais, metra vai šaurais sagatavotais iestatījums vai savs), **Sliežu sekcija** (60E1, 54E1, 49E1, 115RE, 136RE: tikai to publicētie izmēri), sliežu ceļu skaitu **Sliežu ceļi** un to **Sliežu ceļu attālums**, pēc tam **Gulšņi un balasts**: gulšņu materiālu, garumu, platumu, dziļumu un soli; balasta dziļumu zem gulšņa (pie zemākās sliedes), pleca platumu, nogāzi, cik zem gulšņiem atrodas tā augšdaļa; apakšbalasta dziļumu, sānu joslu aiz balasta pamata un pamatnes šķērsnoteci.

Nospiediet **Veidot sliežu ceļu**. Tas ieslēdz trases koridoru, kas veidots kā sliežu ceļš pa projektēto garenprofilu: sliedes un gulšņi sasveras kopā ar virsaugstumu, pamatne nē. Sānu nogāzes sākas no koridora sānu joslas malas griezumos un uzbērumos, un sliežu ceļš nogāžas līdz plānotajai virsmai kā ceļš.

- **Plāns**: abas katra sliežu ceļa sliedes (slānis C-RAIL-TRAK) un, ja ir vairāk nekā viens sliežu ceļš, katra ceļa ass (C-RAIL-CNTR), ekrānā, DXF, DWG, PDF un plāna un garenprofila lapās.
- **Griezumi**: gulšņi, sliedes un balasta un apakšbalasta apakšējās malas katrā griezumā.
- **3D**: sliedes, katrs gulsnis un balasta gultne (Rādīt › Sliedes), arī GLB, OBJ un USD formātos.
- **Daudzumi**: sliežu ceļa garums, sliedes (abas katra ceļa sliedes gar katra ceļa savu līniju), gulšņi, balasta gultne un balasts bez gulšņiem, kā arī apakšbalasts, pēc vidējo galu laukumu metodes starp griezumiem.

## Sliežu ceļa ģeometrijas pārbaudes

Blakus virsaugstumam Dzelzceļa bloks pārbauda pašu līniju pret vēl sešiem ierobežojumiem (visi ir vietturi, visus iestatāt jūs):

- **Vislielākais slīpums** projektētajā garenprofilā, milimetros uz metru.
- **Mazākais vertikālā līkuma rādiuss** kā koeficients k nosacījumā R ≥ k·V² (R metros, V km/h). Parabolisks vertikālais līkums garumā L starp divām slīpumām ir rādiuss, kas vienāds ar L, dalītu ar slīpuma izmaiņu.
- **Īsākais vertikālais līkums**.
- **Mazākais līkuma rādiuss** plānā (0 izslēdz pārbaudi).
- **Īsākais loks vai taisnējums**, kā braukšanas sekundes līnijas ātrumā: ja riņķveida loks vai taisnējums starp diviem līkumiem ir īsāks par šo attālumu, tiek parādīts brīdinājums. 1,8 s ir pazīstamais "puse no ātruma km/h, metros".
- **Virsaugstuma deficīta izmaiņas ātrums** katrā pārejā, mm/s līnijas ātrumā.

**Sliežu ceļa ģeometrija** parāda atrasto vislielāko slīpumu un katru vertikālo līkumu ar tā rādiusu un rādiusu, ko prasa līnijas ātrums. Vertikālais līkums, kas atrodas pārejā vai virsaugstuma rampā, saņem piezīmi. Ja nav projektētā garenprofila vai projektētā ātruma, pārbaudes, kurām tie vajadzīgi, tiek izlaistas, un par to ir paziņojums.

## Pārmijas un savienojumi

Sadaļā **Pārmijas un savienojumi** nospiediet **Pievienot pārmiju**. Tā tiek novietota garākajā taisnajā posmā; tabulā iestatiet:

- **Strēles sākuma piketāža**: kur pārmija sākas šajā trasē.
- **Krustojums**: krustojuma numurs N (1:N). Krustojuma leņķis ir 2·atan(1 / 2N).
- **Puse**: pa kreisi vai pa labi, skatoties pret piketāžas pieaugumu.
- **Savienojuma attālums** metros: ja lielāks par 0, pārmija kļūst par savienojumu ar paralēlu sliežu ceļu tik tālu (divas pārmijas un taisnējums starp tām).

Tabulā redzami **Pievads** (strēles sākums līdz krustojumam), noslēguma līkuma **Rādiuss** un **Atzarojuma ātrums**, ko šis rādiuss atļauj ar jūsu virsaugstuma deficīta ierobežojumu un bez virsaugstuma. **Veidot tā sliežu ceļu** pārvērš atzarojuma maršrutu par savu trasi (stręle, noslēguma līkums, pēc tam taisni pie krustojuma leņķa) ar tiem pašiem dzelzceļa iestatījumiem, gatavu pagarināšanai.

Plānā tiek attēlotas katras pārmijas divas atzarojuma sliedes, tās centrlīnija, atzīme strēles sākumā un krustojumā, kā arī "1:N" (slānis C-RAIL-TURN), ekrānā un DXF, DWG, PDF un lapās. 3D skatā atzarojuma sliedes tiek attēlotas galvenās līnijas līmenī.

Forma ir **vietturis**: taisna stręle un viens noslēguma līkums no krustojuma numura. Būvēta pārmija seko dzelzceļa standartam un ražotāja rasējumam. Brīdinājumi: pārmija iziet ārpus trases, atrodas uz līkuma, pārejas, virsaugstuma vai vertikālā līkuma, vai pārklājas ar citu; un ir paziņojums, ja līnijas ātrums ir lielāks par tās atzarojuma ātrumu.

## Brīvās telpas aploksne

Atzīmējiet **Izvērst brīvās telpas aploksni gar šo sliežu ceļu**. Izvēlieties **Kontūru** (divas vietturu formas vai **Jūsu pašu kontūra**, ko ieraksta kā vienu punktu katrā rindā: nobīde no sliežu ceļa ass, tad augstums virs sliedes augšdaļas, metros), **Transportlīdzekļa garumu** un **Bogiju attālumu** un, ja tāda ir, **Perona malu** (puse, attālums no sliežu ceļa ass, augstums virs sliedes).

Katrā stacijā kontūra tiek sasvērta ar virsaugstumu ap zemāko sliedi un paplašināta līkuma dēļ: transportlīdzekļa vidus pārvietojas uz iekšu par b² / 8R, gali uz āru par (L² − b²) / 8R (b bogiju attālums, L transportlīdzekļa garums, R tur esošais rādiuss, sekojot pārejai). Blokā tiek attēlots griezums taisnajā posmā un vietā, kur tas ir visplatākais, un tiek uzskaitīts:

- **platākā aploksne** un kur tā atrodas,
- **sliežu ceļu asu attālums** salīdzinājumā ar attālumiem, ko prasa divas blakus aploksnes,
- **brīvā vieta pie perona malas**, vai cik tālu tā atrodas iekšpusē,
- katra objekta līnija, cauruļu konstrukcija un cita dzelzceļa trase, kas atrasta **aploksnes iekšpusē**.

Objekta līnija ar augstuma atzīmēm tiek vērtēta pret kontūru tā augstumā virs sliedes; bez projektētā garenprofila vai punktam bez augstuma tā tiek vērtēta tikai plānā, un saraksts to norāda. Plānā aploksnes divas malas tiek attēlotas (slānis C-RAIL-CLRN) ar krustiņu pie katras lietas, kas atrodas iekšpusē.

Piedāvātās kontūras ir **vietturi, nevis jebkura dzelzceļa gabarīts**. Pirms rezultāta izmantošanas ievadiet sava dzelzceļa būvju gabaritu.

## Citās programmās

- **LandXML**: dzelzceļa trase tiek ierakstīta ar tās pārejām (spiType) un `Cant` bloku: sliedes platums, pagriešanās punkts, līnijas ātrums un piketāža, kur katra virsaugstuma rampa sākas un beidzas, ar pielietoto virsaugstumu, līdzsvara virsaugstumu un deficītu. LandXML faila atvēršana ar `Cant` bloku padara šo trasi par dzelzceļu ar šiem virsaugstumiem.
- **IFC**: trase ar tās virsaugstuma segmentiem, sliedēm, gulšņiem, balastu un apakšbalastu.

## Vēl nav izveidots

Pārmijas IFC eksportā, pārmiju saimes ārpus vienā noslēguma līkuma (izliektas stręles, pārslēdzamie krustojumi, šķērsojumi, rombi), kinemātiskā gabarīta noteikumi (aploksne ir fiksēta kontūra ar līkuma nobīdi), gaisa līnijas un signalizācija.

**Kurš standarts.** Dzelzceļa blokā "Standarts, uz kuru atsaukties" ņem vērtību Nav vai Eiropas (UIC un EN). Izvēloties Eiropas, tiek nosauktie dokumenti, uz kuriem atsaucas Eiropas projekts (EN 13803 trases parametriem, EN 13232 stręlēm un krustojumiem, EN 15273 gabaritiem, EN 13848 sliežu ceļa ģeometrijas kvalitātei), un katram ierobežojumam tiek dots lauciņš klauzulai, no kuras tas nāk. Nav neviena skaitļa no kāda standarta, kas būtu iebūvēts: virsaugstuma, deficīta, pārpalikuma, slīpuma un izmaiņu ierobežojumi, pārmiju ģeometrija un būvju gabarīts joprojām ir vietturi, un logs to norāda. Dzelzceļa inženieris pārbauda katru vērtību pret paša standarta tekstu un pirms jebkā veidošanas ieraksta blakus klauzulu. Dienvidāfrikas un AREMA tabulu šajā laidienā nav.
