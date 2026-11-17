---
title: Ēna, saules ražība un komforts ārā
summary: Pētīt ēnu, ko jūsu ēku masas met dienas vai sezonas laikā, redzēt tās animāciju, aprēķināt, cik elektroenerģijas saules paneļi uz jumtiem un sienām saražotu tipiskā gadā, redzēt, cik komfortabela ir ēkai blakus esošā iela (UTCI), un iegūt orientējošu gājēju vēja komforta novērtējumu.
keywords: ēnu pētījums, ēna, saules stundas, animācija, saule, PV, fotoelektriskie, paneļi, raža, kWh, EPW, laika fails, UTCI, termiskais komforts, komforts ārā, karstuma slodze, vējš
from: 96e7af4d
---

Sadaļa **Vide** atrodas zem **Saules stundas** masas **Rekvizītos**. Tā par ēkām izmanto jūsu uzzīmētās masas.

## Ielādēt laika failu

Izvēlieties tipiska gada laika failu (**.epw**) savai pilsētai. Tie ir bezmaksas no EnergyPlus laika vietnes un no climate.onebuilding.org. Fails šajā apmeklējumā paliek jūsu pārlūkprogrammā. Saules ražas un komforta pētījumam tas ir vajadzīgs; ēnu pētījums darbojas arī bez tā, ja projektam ir koordinātu sistēma.

## Ēnu pētījums

Izvēlieties datumu (vai atzīmējiet **Sezona** un pēdējo datumu un soli dienās) un laika joslu, tad **Palaist ēnu pētījumu**. Iegūsiet karti ar saules vai ēnas stundām uz zemes ap masām; tabulu, cik lielā daļa zemes ir ēnā dienas laikā; un dienas animāciju, ko var atskaņot vai pārslēgt pa kadriem. **Saglabāt karti**, **Saglabāt animācijas kadrus** (visi kadri vienā attēlā) un **Saglabāt stundas** (CSV) saglabā rezultātus.

Zeme tiek uzskatīta par līdzenu zemākās masas līmenī. Nogāžu ēnai izmantojiet **Saules stundas**, kas nolasa reljefu.

## Saules raža

Iestatiet paneļu efektivitāti, cik lielu katra jumta un sienas daļu aizņem paneļi, un sistēmas zudumus, tad **Palaist saules ražu**. Katram jumtam un sienai iegūsiet elektroenerģiju, ko kvadrātmetrs paneļa saražotu tipiskā gadā, cik lielu tās daļu atņem kaimiņu masas, un kopējo summu katrai masai. Modelis ir uzrakstīts vienkāršos vārdos pogas tuvumā: tas ir plānošanas aprēķins no tipiska gada, nevis garantija.

## Komforts ārā

**Palaist komfortu** aprēķina Universālo termiskā klimata indeksu (UTCI) stāvošam cilvēkam atklātā zemē un blakus pirmajai masai (dienvidu, ziemeļu, austrumu un rietumu pusē), ar katras masas ēnu. Tas rāda redzamo debesu daļu, vidējo dienas UTCI un stundas virs 32 (karstuma slodze) un zem 0 (aukstuma slodze).

## Vējš (orientējošs)

**Palaist vēja pētījumu** vienreiz atrisina gaisa plūsmu ap jūsu masām katram vēja virzienam, kas pūš jūsu laika failā (4, 8, 12 vai 16 virzieni), pār apkārtni, ko izvēlaties (atklāta lauku vide, piepilsēta vai centrs), un pēc tam saskaita visa gada stundas vēju. Karte iekrāso zemi pēc komforta klases: no zaļas (**sēdēšana**) caur **stāvēšanu**, **pastaigu** un **soļošanu** līdz sarkanai (**nekomfortabli**). Tā ir aktivitāte, kuras robežātrums (4, 6, 8 un 10 m/s) tiek pārsniegts ne vairāk kā 5 % stundu. Otra tabula dod NEN 8100 pakāpi (no A līdz E) pēc stundu daļas, kurā vējš pārsniedz 5 m/s. Brāzmu koeficients reizina stundas vidējo, lai dotu efektīvo brāzmu.

Kā tas darbojas vienkāršos vārdos: lattice-Boltzmann lielo virpuļu plūsmas risinātājs (mūsu pašu, bibliotēkā `lib/wind`) kastē ap ēkām, vēja ātruma profils, kas pieaug ar augstumu atkarībā no izvēlētās raupjuma, un ātrums apmēram 1.5 m virs zemes, salīdzināts ar ātrumu augšpus plūsmas 10 m augstumā. **Orientējošais** ir ātrs un rupjš; **Standarta** izmanto vairāk šūnu un darbojas daudz ilgāk. Ja panelis saka, ka režģis ir rupjš (mazāk par 10 šūnām virs augstākās ēkas), vai ka plūsma vēl mainījās, kartei ticiet mazāk.

**Ko tas nav.** Risinātājs ir pārbaudīts uz mācību grāmatu plūsmām (kanāls, vāka virzīts dobums) un palaists uz kuba, lai pārliecinātos, ka aizvējš un ātruma pieaugums stūros izskatās pareizi. To **nav** validēts pret vēja tuneļa mērījumiem ēkām, tāpēc katrs rezultāts ir atzīmēts kā nevalidēts. Neizmantojiet to projektēšanas vērtībai, vēja slodzei vai plānošanas sertifikātam: vēja inženierim jāveic un jāapstiprina pareizs pētījums. Līdzenā zeme, gludas ēku sienas, laika stacijas raupjuma saīsinājums un robežvērtību tabula ir vienkāršojumi; robežvērtības var atšķirties no kritērijiem, ko izmanto jūsu iestāde.

## Vējš ar OpenFOAM (papildinājums)

Iebūvētais vēja dzinējs iepriekš ir eksperimentāls. Lai iegūtu pienācīgu plūsmas risinātāju, ieslēdziet papildinājumu **Gājēju vējš (OpenFOAM)** sadaļā **Iestatījumi > Papildinājumi** (tas ir izslēgts, kamēr to nedarāt). Tā ir GPL licencēta programmatūra ar savu licenci, atdalīta no pārējā CadCraft, un tā neietver OpenFOAM: to instalējat paši. Tad **Dzinējs** vēja blokā uzskaita OpenFOAM.

Kas jāiestata vienreiz:
1. **Instalējiet OpenFOAM** (ESI v-sērijas no openfoam.com; papildinājums testēts ar v2512). Ubuntu vai Debian (arī WSL vidē Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, tad `sudo apt install openfoam2512-default`. Tas instalējas `/usr/lib/openfoam/openfoam2512`. CadCraft darbībai vajadzīgi `blockMesh`, `snappyHexMesh` un `simpleFoam`. (Vecākā `openfoam` 1912 pakotne Ubuntu savā arhīvā arī darbojas, bet tās funkciju objekti avarē; tad papildinājums pats nolasa rezultātu failus.)
2. **Palaidiet palīgu** no papildinājuma mapes `runner` ar Node.js: `node cc-openfoam-runner.mjs serve`. Ja OpenFOAM nav meklēšanas ceļā, dodiet tam nelielu `runner.json` ar ceļu uz OpenFOAM `etc/bashrc` (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) un palaidiet to ar `--config runner.json`. Palīgs klausās tikai šajā datorā un izdrukā pilnvaru.
3. **Ielīmējiet pilnvaru** papildinājuma laukos vēja blokā (adrese paliek `http://127.0.0.1:8765`) un nospiediet **Pārbaudīt palīgu**.

Tad **Palaist vēja pētījumu** izpilda vienu gadījumu katram vēja virzienam laika failā: jūsu masas kļūst par virsmu (STL) kastē, kuras izmērs atbilst parastajai vadlīnijai (5 ēku augstumi apkārt un virs, 10 aiz); tā tiek sadalīta režģī ar blockMesh un snappyHexMesh, palaista kā stacionārs k-epsilon RANS ar atmosfēras robežslāņa ieplūdi virs izvēlētās raupjuma, un ātrums 1.5 m augstumā tiek nolasīts atpakaļ un pārvērsts tajās pašās Lawson un NEN 8100 klasēs. Nekas neatstāj jūsu datoru.

**Kas ir pārbaudīts.** Teksts virs rezultātiem to saka skaidri, un tas ir katras saglabātās CSV daļa. Papildinājuma gadījumu rakstīšana, rezultātu nolasīšana un viss cauruļvads ir pārbaudīti bez OpenFOAM, un viens kubs ir palaists caur īstu OpenFOAM trijos režģa izmēros (skaitļi ir projekta piezīmēs). To **nav** validēts pret vēja tuneļa mērījumiem ēkām. Tas ir orientējošs lasījums, nevis projektēšanas vērtība un nevis sertifikāts. Standarta k-epsilon pārvērtē turbulenci ēku priekšā, zeme ir līdzena, sienas ir gludas un nav reljefa vai veģetācijas.
