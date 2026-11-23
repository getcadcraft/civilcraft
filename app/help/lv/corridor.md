---
title: Ceļa koridora izveide
summary: Ieslēdziet koridoru trasei, iestatiet joslas, malas un sānu nogāžu vērtības un izlasiet griezumus, nogāzes robežlīnijas un zemes darbus, ko tas rada.
keywords: krustojums, krustojums, ceļš sastopas ar ceļu, blakusceļš, T krustojums, šķērsošana, laukuma atzīme, savienošana, pieslēgšana, virsaugstums, pārejas posms, izlīdzināšanas posms, slīpumu tabula, šķērsslīpums, pagriešana, koridors, mezgls, tipiskais šķērsgriezums, ceļš, josla, mala, sānu nogāze, nogāzes robežlīnija, izrakums, uzbērums, griezumi, mērķis, platuma mērķis, augstuma mērķis, nobīdes mērķis, paplašināšana, seguma mala, sekot citam koridoram
from: 6dcb92b3
---

Koridors izvelk vienu vienkāršu tipisku šķērsgriezumu (mezglu) pa trasi un tās projektēto garenprofilu, izlīdzina to ar esošo terēnu un pievieno rezultātu projektētajai virsmai. Vienai trasei var būt vairāki koridori dažādos pikets diapazonos, un koridoru var veidot no atkārtoti izmantojamām veidnēm pēc piketa ([Koridoru veidnes](topic:corridor-templates)). Zemāk redzamais vienkāršais mezgls ir vienāds abās pusēs; lai katrai pusei piešķirtu savas daļas, skatiet [Katras puses veidošana no daļām](topic:corridor#build-each-side-from-parts).

## Mezgls

No centrālās līnijas uz āru, katrā pusē:

1. **josla** noteiktā platumā, kas no kupola nogāžas ar **brauktuves slīpumu**
2. **mala** noteiktā platumā ar **malas slīpumu**
3. **sānu nogāze** no malas malas līdz vietai, kur tā saskaras ar terēnu: **izraktās nogāzes slīpums**, kur terēns ir virs, un **uzbēruma nogāzes slīpums**, kur terēns ir zemāk

Sākuma vērtības ir vietturi, nevis projektēšanas standarts:

| Vērtība | ASV pēdas | Metri |
|---|---|---|
| Brauktuves platums | 12 ft | 3.6 m |
| Brauktuves slīpums | 2% | 2% |
| Malas platums | 4 ft | 1.2 m |
| Malas slīpums | 4% | 4% |
| Izraktās nogāzes slīpums | 2 : 1 | 2 : 1 |
| Uzbēruma nogāzes slīpums | 3 : 1 | 3 : 1 |
| Griezums ik | 10 ft | 5 m |

Sānu nogāžu slīpumi ir horizontāli pret vertikāliem (H:V): 3 : 1 nozīmē 3 pa horizontāli uz 1 pa vertikāli.

## Koridora izveide

Nepieciešama trase bez kļūdām un projektētais garenprofils ar vismaz diviem PVI un bez kļūdām.

1. Atlasiet trasi.
2. Labajā panelī, sadaļā **Koridors**, atzīmējiet **Izvilkt mezglu pa projektēto garenprofilu**.
   Lauki parādās, un koridors uzreiz tiek izveidots. Plānā redzamas brauktuvju un malu robežas un nogāzes robežlīnijas; ja sadaļā **Attēlojums** izvēlēts {{ui:Projektētā (ar slīpumiem)}}, horizontāles rāda jauno terēnu.
3. Mainiet jebkuru vērtību: **Brauktuves platums**, **Brauktuves slīpums**, **Malas platums**, **Malas slīpums**, **Izraktās nogāzes slīpums**, **Uzbēruma nogāzes slīpums**, **Griezums ik**. Pēc katras nospiediet {{key:Enter}}. Izraktās nogāzes, uzbēruma un griezumu soļa vērtībām jābūt lielākām par 0.
4. Izlasiet rindu zem laukiem, piemēram: "39 griezumi no 0+00.00 līdz 3+86.36; izrakums 240.2 cu yd, uzbērums 556.0 cu yd."

Griezumi tiek veidoti ik pēc soļa **Griezums ik**, galos un katras horizontālās un vertikālās līknes sākumā un beigās. Katrs griezums un tajos ietilpstošās līnijas (centrālā līnija, brauktuves un malas robeža, nogāzes robežlīnija) kļūst par projektētās virsmas lūzumlīnijām.

Lai izslēgtu koridoru, noņemiet atzīmi no lodziņa. Tā vērtības tiek saglabātas nākamreizei.

## Kad koridors netiek izveidots

Sarkans lodziņš zem laukiem norāda iemeslu:

| Ziņojums | Ko darīt |
|---|---|
| "Koridoram nepieciešams projektētais garenprofils bez kļūdām." | Pievienojiet PVI vai novērsiet pārklājošās vertikālās līknes (skatiet [Vertikālā garenprofila projektēšana](topic:profile)). |
| "Projektētais garenprofils nepārklājas ar trasi." | Pārvietojiet PVI uz trases piketu diapazonu. |
| "Koridoram virsmā nepieciešami vismaz divi griezumi." | Lielākā daļa koridora atrodas ārpus esošā terēna. |
| "4 sānu nogāzes nobeidzas virsmā, pirms sasniedz terēnu." | Virsmas malas tuvumā nogāze nevar sasniegt terēnu. Turiet ceļu tālāk no malas vai samaziniet uzbēruma vai izrakuma augstumu šajā vietā. |
| "Koridora nogāzes robežlīnijas krustojas (griezumi pārklājas, piemēram, asa līkuma iekšpusē). Izmantojiet lielāku rādiusu vai šaurāku mezglu." | Griezumi asas līknes iekšpusē pārklājas. Palieliniet rādiusu vai sašaurinājiet mezglu. |

Koridors ar problēmu netiek iestrādāts reljefā un neietilpst zemes darbu apjomos.

## Koridori un laukumi kopā

Projektētā virsma tiek veidota secīgi: vispirms visi koridori, pēc tam visi laukumi. Ja laukuma izlīdzinājums pārklājas ar koridoru, uzvar laukums. Ja vēlāk veidots objekts pārklājas ar ceļu, tiek aizstāta tikai tā ceļa daļa, kas atrodas vēlākā objekta nogāzes robežlīnijas iekšpusē; pārējais ceļš un visas terēna lūzumlīnijas, ko ceļš šķērso, saglabā savu formu. Apjomi tiek aprēķināti visu nogāzes robežlīniju iekšienē kopā; skatiet [Zemes darbu apjomi](topic:volumes).

## Virsaugstums

Līknē ceļš var noliekties uz iekšpusi, tāpēc satiksme mazāk tiek spiesta uz ārpusi. Trases **Rekvizītos**, sadaļā **Virsaugstums**, atzīmējiet **Veikt līkņu virsaugstumu**:

- Katra apļveida līkne no slīpumu tabulas saņem likmi **e**: pirmā rinda, kuras rādiusu līkne sasniedz (rinda ar tukšu likmi saglabā parasto kupolu). Tabula un **Maksimālais relatīvais slīpums** (sākumā 0.5 %) ir vietturi, nevis standarts: iestatiet tos atbilstoši saviem projektēšanas kritērijiem. Pievienojiet vai noņemiet rindas pēc vajadzības.
- Brauktuves griežas ap centrālo līniju. Pirms līknes ārējā josla izlīdzinās pāri **izlīdzināšanas posmam** (parastais kupols ÷ e × pārejas posms), pēc tam pāri **pārejas posmam** (brauktuves platums × e ÷ slīpums) ārējā josla turpina griezties, līdz viss ceļš slīpst ar e uz iekšpusi; divas trešdaļas pārejas posma atrodas pirms līknes un viena trešdaļa uz tās. Pēc līknes notiek tas pats, bet otrādi.
- Mala zemākajā pusē nekad nav līdzenāka par savu joslu; augstākajā pusē tā saglabā savu slīpumu (tā nogāžas).
- Zemāk esošajā tabulā uzskaitīts katras līknes rādiuss, likme, pārejas posms un izlīdzināšanas posms, kā arī vieta, kur sākas un beidzas pilnais virsaugstums. **Virsaugstuma diagramma** attēlo abu joslu šķērsslīpumus pa pikietiem (kreisā josla – nepārtraukta, labā – punktēta).
- Par pārāk īsu līkni, kurā nevar sasniegt pilnu virsaugstumu, vai divām līknēm, kuru pārejas posmi pārklājas, tiek paziņots lodziņā virs tabulas.

Griezumi, apjomi, 3D skats un lapas visi rāda noliekto ceļu. Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc.

## Mērķi

Mērķis pārvieto vienu ceļa vienas puses punktu uz līniju: **seguma malu** vai **malas malu**, **kreisajā** vai **labajā** pusē. Katrs griezums saskaras ar līniju taisnā leņķī pret centrālo līniju, iziet tikai šajā pusē, tāpēc labās puses mērķis nekad nepārvieto kreiso pusi.

| Iestata | Kas notiek vietā, kur griezums saskaras ar līniju |
|---|---|
| **Platumu** | Punkts atrodas uz līnijas: josla (vai mala) paplašinās vai sašaurinās līdz tai, saglabājot savu šķērsslīpumu. |
| **Augstumu** | Punkts tur pieņem līnijas augstumu savā nobīdē: seko joslas (vai malas) šķērsslīpums. |

Līnija var būt raksturlīnija (neatkarīgi no tās **Lietojuma**) vai cita koridora līnija: tās centrālā līnija, seguma malas, malu malas vai nogāzes robežlīnijas. Koridora līnija seko šim koridoram: mainot otru ceļu, arī šis seko. CivilCraft vispirms izveido otru koridoru; divi koridori, kuri mērķētu viens uz otru ciklā, vienā pusē tiek noraidīti, un tabulā norādīts, kurš.

1. Atlasiet trasi un ieslēdziet tās koridoru.
2. Sadaļā **Mērķi** noklikšķiniet uz {{ui:Pievienot mērķi}}.
3. Izvēlieties **Pusi**, **Punktu**, ko tas **Iestata**, un **Uz līniju**. Katra izmaiņa ir viens atsaukšanas solis.

**Rezultāts** norāda, pie cik griezumiem līnija tika sasniegta. Griezumi, kas to nesasniedz (aiz tās galiem vai aiz centrālās līnijas), saglabā mezgla vērtības. Dzēsta līnija atstāj koridoru tādu, kāds tas bija pirms mērķa, un tabulā tas tiek norādīts. Vienai pusei katram punktam var būt viens platuma un viens augstuma mērķis.

## Katras puses veidošana no daļām

Koridora iestatījumos ieslēdziet **Veidot katru pusi no daļām**. Tad katrai pusei ir savs saraksts no centrālās līnijas uz āru: joslas, mala, notekrēta, bordiūra, stādījumu josla, gājēju ietve un beigās sānu nogāze līdz terēnam (ar savu izrakuma un uzbēruma attiecību). Sāciet no {{ui:Lauku ceļš}} vai {{ui:Pilsētas iela}}, pievienojiet un noņemiet daļas, pārvietojiet tās ar bultiņām un {{ui:Kopēt}} vienu pusi uz otru. Katra izmaiņa ir viens atsaukšanas solis.

Šķērsslīpums ir slīpums prom no ceļa, tāpēc gājēju ietve, kas novada ūdeni uz ceļa pusi, ir negatīva. Bordiūra ir ar jūsu norādīto augstumu sejas daļa, ar norādīto platumu virsotne un pēc izvēles nolaidums aizmugurē. Virsaugstums pagriež katru joslu pirmajā rindā; notekrēta, bordiūra, josla un ietve atkarīgas no joslu malas, kā tā ir izveidota. Mērķi joprojām pārvieto joslu galu un pēdējo daļu. Šķērsgriezumos atzīmēta notekrētas plūsmas līnija, bordiūras augša un aizmugure un pārējais. Līknē ar spirālēm pārejas posms ir spirāle: līmeņa kupols pie TS, pilns virsaugstums pie SC.

## Seguma slāņi

Joslai, malai, notekrētai, stādījumu joslai vai ietvei var būt savs konstrukcijas slānis: zem daļas {{ui:Pievienot slāni}} pievieno slāni ar nosaukumu, materiālu, biezumu un tā veidu (virsma, saistslānis, pamatne, apakšpamatne, pārklājums vai cits), no augšas uz leju. Slāņi nemaina ceļa virsmu (tās augšdaļa ir projektētā virsma); katrs atrodas zem savas daļas, un tā dziļums mērīts taisni uz leju. Šķērsgriezumos katra slāņa apakša tiek attēlota ar punktētu līniju, un {{ui:Segumu slāņi: daudzumi}} uzskaita katra slāņa plāna laukumu un tilpumu (laukums gar koridoru no tā griezumiem, tilpums = laukums × biezums). IFC eksports katru slāni raksta kā atsevišķu elementu ar tā biezumu un materiālu (skatiet [IFC eksports un imports](topic:ifc)). Biezumu, ko ievadāt, nosakāt jūs: CivilCraft neizmēro segumus.

## Kur ceļi sastopas ar ceļiem, laukumiem un takām

Ja ieslēgts {{ui:Savienot ceļus un laukumus, ar kuriem tas saskaras}} (tas ir ieslēgts katram koridoram), CivilCraft savieno koridoru ar to, ar ko tas plānā saskaras:

- **Ceļš, kas beidzas uz cita ceļa** (tā trases gals atrodas uz otra ceļa vai aptuveni pusē no sava seguma platuma no tā ceļa malas) ir krustojuma blakusceļš. Ceļš, ar ko tas sastopas, atver savu malu blakusceļa segumam: pāri ietekai mala, bordiūra, josla un gājēju ceļš tiek ieklāti uz joslas šķērsslīpuma un attēloti kā segums. Blakusceļš tiek ieklāts uz galvenā ceļa virsmas tur, kur tie pārklājas, un pakāpeniski pacelts vai nolaists līdz tai piebraucamajā posmā.
- **Divi ceļi, kas krustojas**, tiek savienoti tādā pašā veidā abās pusēs. Ceļš, kas sarakstā **Trases** ir uzskaitīts pirmais, ir tranzīta ceļš; otrs seko tā virsmai pāri.
- **Ceļš, kas beidzas laukumā** (tā iekšpusē vai aptuveni pusē no seguma platuma no tā malas) sasniedz laukuma līmeni un pakāpeniski tiek pielāgots tam piebraucamajā posmā.
- **Taka** (Ainava › Cietais segums) apstājas pie ceļa ārējās malas, gājēju ceļa vai malas līmenī tur, nevis guļ pāri ceļam. Taka, kas šķērso ceļu, kļūst par divām daļām. Gals, kas novilkts nedaudz īsāk par ceļu (divreiz taku platuma robežās), tiek turpināts līdz tā malai.

**Rekvizīti** norāda, ko katrs koridors savienoja, par cik tas tur tika pacelts vai nolaists un kādā garumā. Šis garums ir lielākais no 10 m (30 ft) un divdesmitkārtīgas izmaiņas, un nekad nepārsniedz 45 % no koridora. **Projektētais garenprofils netiek mainīts**: garenprofila skats joprojām rāda jūsu zīmēto slīpuma līniju, bet griezumi, projektētā virsma, apjomi un 3D skats rāda ceļu tā, kā tas ir savienots. Lai savienojums projektēšanā būtu precīzs, pārvietojiet pēdējo PVI uz līmeni, ko rāda Rekvizīti.

Izslēdziet šo slēdzi koridoram, lai to atstātu tieši tādu, kāds to nosaka tā garenprofils un mezgls; tad tas nepiedalās nevienā krustojumā ne kā blakusceļš, ne kā tranzīta ceļš. Ceļi, kas sastopas gandrīz uz vienas līnijas (zem aptuveni 20°), netiek mainīti, tāpat kā celiņi.

Ko krustojums vēl nedara: nav bordiūru noapaļojumu (stūri ir taisni), nav pagriešanās joslu vai salu, blakusceļa gals ir nogriezts taisni pret tā pašu trasi, un koridors, kas veidots no veidnēm, atver savu malu tādā pašā vienkāršā veidā (grāvis vai siena tā gala stāvoklī pāri ietekai tiek izlīdzināta bez caurtekas). Plāna bordiūru noapaļojumiem, redzamības trijstūriem un marķējumam skatiet [Augsnes, ceļi, uzmērījumi, raktuves un savienojumi](topic:soils-roads-survey-mines-links).

## Vēl nav izstrādāts

Nogāzes robežlīnijas slīpuma mērķi vēl nav pieejami. Koridoram, kas mainās gar ceļu, ar kreiso un labo pusi atsevišķi, izmantojiet [Koridoru veidnes](topic:corridor-templates). Skatiet [Vēl nav izstrādāts](topic:not-built-yet).
