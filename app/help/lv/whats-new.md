---
title: Kas jauns versijās 0.8 un 0.8.1
summary: CivilCraft 0.8 pievieno lietus aprēķinu (vētra pār izlīdzināto reljefu), zemes darbu līdzsvarotāju, labākā maršruta meklētāju, aizturēšanas dīķus, progresu pēc uzmērījumiem, adreses importētāju, kas objektu saglabā projektā, un logus augsnēm un nogāzēm, krustojumiem un marķējumam, uzmērījumu izlīdzināšanai, atklātajām raktuvēm, radio saitēm un dzelzceļa pārmijām. 0.8.1 labo DWG failu nolasīšanu.
keywords: jaunumi, kas jauns, laidiena piezīmes, izmaiņu žurnāls, izmaiņas, 0.8, 0.8.1, versija, jaunas funkcijas, lietus, vētra, uzkrāšanās, pārplūšana, zemes darbi, līdzsvars, izrakums un uzbērums, pārvadājums, labākais maršruts, mazākās izmaksas, trase, aizturēšanas dīķis, izplūde, izsīkšana, brīvais augstums, progress, uzmērījums, drons, krautne, adrese uz objektu, zemes gabals, augsne, plūdi, nogāzes stabilitāte, Bišops, sēdums, krustojums, marķējums, zīmes, redzamības attālums, izlīdzināšana, mazāko kvadrātu metode, poligons, atklātā raktuve, blokveida modelis, radio saite, Fresnela, pārmija, valodas, problēmas, tiešraide, dwg
from: b0932cf0
---

Šeit apkopots, kas mainījies programmā CivilCraft 0.8 (2026-11-01) un 0.8.1 (2026-11-02), salīdzinot ar 0.7. Galvenās jaunās daļas ir rīki, ar kuriem pārbaudīt reljefa plānojumu un objektu (lietus, zemes darbi, maršruti, dīķi, progress), un seši aprēķinu logi grunts, ceļiem, uzmērījumiem, raktuvēm, saitēm un dzelzceļam.

## Jaunumi

### Pārbaudiet reljefa plānojumu

- **Uzsist lietu.** {{ui:Uzsist lietu…}} (sadaļā: {{ui:Virsma}}) uzsit vētru pār izlīdzināto virsmu. Redzat, kā ūdens notek no laukumiem, uzkrājas zemajos stūros un pārplūst pārāk mazos dīķos. Aprēķins ir animēts un sniedz tilpumus, maksimālo noteci un CSV failu ar katru dīķi. Noklusējuma šūna ir rupja, lai pirmais skatījums būtu ātrs; smalkāka šūna ir lēnāka. Pārplūstošie dīķi parādās arī Problēmu panelī.
- **Zemes darbu līdzsvarotājs.** {{ui:Zemes darbu līdzsvarotājs…}} paceļ vai pazemina laukumu, līdz griezums ir vienāds ar uzbērumu, un parāda starp tiem pārvadājumu tabulu.
- **Labākais maršruts.** {{ui:Labākais maršruts…}}: izvēlieties sākumu un galu, un CivilCraft atrod lētāko ceļu pār reljefu, kas ievēro jūsu slīpuma un līkuma ierobežojumus, un pēc tā izveido trasi.
- **Aizturēšanas dīķi.** {{ui:Aizturēšanas dīķi…}} aprēķina ūdens līmeni un uzglabāto tilpumu no jūsu reljefa, ņem vērā izplūdes ierīces (atvere, pārliekums, V veida izgriezums, pārlieja), vada lietu caur dīķi un pārbauda aizturēto maksimālo noteci, izsīkšanas laiku un brīvo augstumu.
- **Progress pēc uzmērījumiem.** {{ui:Progress pēc uzmērījumiem…}} salīdzina dronu vai skenēšanas virsmas no dažādiem datumiem ar reljefu, kāds tas bija, un ar projektu: pabeigtība procentos pēc tilpuma, pārrakti un pārbērti laukumi, krautnes un tas, kad darbi tiks pabeigti šādā tempā (atzīmēts kā aplēse).

### Iepazīstiet objektu

- **No adreses uz objektu.** {{ui:No adreses uz objektu…}} apvieno vienā objektā atvērtos zemes gabala, ēkas, zonējuma, augsnes, plūdu un reljefa datus. Objektu var saglabāt projekta failā: ievadīto adresi, katru avotu ar datumu, kad to lejupielādējāt, un tā licenci, kā arī saņemto rezultātu. Atverot projektu no jauna vai kopīgojot to, objekts joprojām ir tur, un nekas nav lejupielādēts no jauna. Varat arī saglabāt to kā objekta failu vai nosūtīt uz BimCraft. Skatiet [No adreses uz objektu](topic:address-to-site).

### Grunts, ceļi, uzmērījumi, raktuves, saites un dzelzceļš

- **Augsnes un nogāzes.** {{ui:Augsnes un nogāzes…}} zīmē augsnes profilu starp jūsu ievadītajiem urbumiem. Bišopa metode pēc tam meklē kritisko riņķa līniju jūsu reljefā, ar gruntsūdens līmeni, papildslodzi un zemestrīces koeficientu; pamatu sēduma aprēķinā ņemta vērā konsolidācija, tūlītējais sēdums un laiks.
- **Krustojumi un marķējums.** {{ui:Krustojumi un marķējums…}} savieno zarus ar bordiūru līknēm (viens rādiuss katram zaram vai trīs centru līknes), redzamības attālumu projektētajam ātrumam, redzamības trijstūru pārbaudi, gājēju pārejas, apstāšanās līnijas, marķējumu un ceļa zīmes ar zīmju specifikāciju. Tie tiek zīmēti plānā un saglabāti kā .dxf fails ar nosauktiem slāņiem.
- **Uzmērījumu izlīdzināšana.** {{ui:Uzmērījumu izlīdzināšana…}} veic poligona vai tīkla izlīdzināšanu ar mazāko kvadrātu metodi: izlīdzinātās koordinātas, kļūdu elipses, hī kvadrāta pārbaudi un atzīmi mērījumam, kas neatbilst. Ir iekļauti brīvie tīkli, poligona noslēgšana ar kompasa likumu un RW5, GSI, JobXML vai CSV lauka failu nolasīšana; izlīdzinātie punkti tiek saglabāti kā CSV.
- **Atklātās raktuves.** {{ui:Atklātās raktuves…}} pārvērš urbumu paraugus blokveida modelī un galīgo raktuvi jūsu nogāzes leņķa robežās, ar atsegumu koeficientu, tabulu pa pakāpieniem un kvalitātes un tonnāžas līkni. Ir pieejamas arī ieligzdotas raktuves pēc ieņēmumu koeficienta un ražošanas grafiks ar diskontētu naudas plūsmu.
- **Radio saites.** {{ui:Radio saites…}} pārbauda redzamību pāri jūsu reljefam, ņemot vērā Zemes izliekumu, pirmo Fresnela zonu, saites bilanci, izbalēšanas rezervi un daudzceļu pārtraukumu, un sniedz masta augstumu, kas nodrošinātu brīvu līniju pāri trasei. Tā veic arī optisko šķiedru zudumu bilances, saišu daudzumus un vēja slodzi uz torni.
- **Dzelzceļa pārmijas.** {{ui:Dzelzceļa pārmijas…}} izveido pārmiju pēc tās krustojuma numura, pārejas savienojumus starp paralēliem sliežu ceļiem un konstrukcijas gabarītu, kas noliekts ar sliežu sānslīpumu un paplašināts līkumā. Pārmija var atrasties trases stacijā.

Skatiet [Augsnes, krustojumi, uzmērījumu izlīdzināšana, raktuves, radio saites un pārmijas](topic:soils-roads-survey-mines-links).

## Visās lietotnēs

- **Valodas.** 54 valodas, no tām desmit jaunas. Valodas, kas nav angļu, ir mašīntulkojumi, līdz tās izlasa dzimtās valodas runātājs. Palīdzības tēmas joprojām galvenokārt ir angļu valodā.
- **Rīkjoslas rindas.** {{ui:Iestatījumi}} › {{ui:Vispārīgi}} › {{ui:Rīkjoslas rindas}}: Apvilkt (kā iepriekš), 2 rindas vai 1 rinda. CivilCraft lente rāda visbiežāk izmantoto rīku lielu, nākamos mazus, bet pārējos aiz grupas nosaukuma bultiņas.
- **Ievades ierīces.** Skārienpaliktnis, pildspalva, 3D pele, spēļu pults un MIDI var vadīt lietotnes.
- **Problēmas.** Problēmu panelis, kas brīdina visās lietotnēs, ar pārbaudēm, kas nolasa noteikumu pakas.
- **Live.** Skats, kas rāda, kas atrodas kur Live sesijā.
- **Papildinājumi.** Papildinājumu saraksts, ar apgaismojuma papildinājumiem.
- **Pievienojiet savu MI.** Jebkurš pievienotais asistents var vadīt CivilCraft rīkus. Tas tiek piegādāts ar piezīmi, ka vienas pieskaršanās savienošana ar vienu klikšķi programmā CadCraft Studio un mitinātais savienotājs vēl nav gatavi. Skatiet [Ļaujiet MI asistentam strādāt ar jūsu objektu](topic:assistants).

## Labots versijā 0.8.1

- **DWG klašu sadaļa.** To nolasīja kā nepareizu tipu (GitHub cadcraft#5). Labots programmā CivilCraft kopā ar CadCraft, BimCraft, ModelCraft un TakeoffCraft.
- **Valodas maiņa darbības laikā.** CadCraft Studio un iepakotie izdevumi var mainīt valodu darbības laikā. Iepriekš tie bija tikai angļu valodā. Vēl nav pārbaudīts katrā platformā: sakiet mums, ja valoda nemainās.

## Vēl nav šajā versijā

- **Tie ir aprēķinu palīglīdzekļi.** Katram jauno logu rezultātam nepieciešama inženiera pārbaude. Augsnes stiprības sākas no tipiskām vērtībām augsnes grupai, un logs to norāda.
- **Uzsist lietu.** Aprēķins paraugobjektā pārlūkprogrammā smalkā šūnā var aizņemt vairāk nekā divas minūtes. Tas pārbaudīts pret roku gadījumiem un V veida noteces baseinu, bet vēl ne uz reāla izlīdzināta objekta.
- **No adreses uz objektu.** Tā nolasa jūsu atvērto datu failus un testēta tikai ar mūsu pašu failiem. Koki nav avots. Avotu lejupielāde jūsu vietā gaida privātuma formulējumu.
- **Progress pēc uzmērījumiem.** Testēts tikai ar izdomātiem uzmērījumiem. Progress pēc lapām un atzīmēm (MarkupCraft) un skenēšanas salīdzinājums ar modeli (BimCraft) nav izstrādāts.
- **Augsnes un nogāzes.** Tikai apļveida virsmas: nav ķīļveida vai bloku meklēšanas un nav sprieguma plaisas.
- **Krustojumi.** Viens rādiuss katram zaram, nav kravas automašīnu pagriešanās trajektoriju, un tie vēl nenonāk koridorā.
- **Lauka faili.** Nolasītāji rakstīti pēc publiskiem formātu aprakstiem un izmēģināti uz mūsu izveidotiem failiem. Vajadzīgi reāli instrumentu faili.
- **Saites un dzelzceļš.** Radio saites: tikai brīvās telpas zudums un daudzceļu (bez lietus izbalēšanas vai antenu diagrammām), un nav dzelzceļa standarta: katra sliežu robeža ir vietturis ar melnraksta skaitļiem, ko neviens dzelzceļa inženieris nav pārbaudījis.
- **Windows un macOS.** 0.8 nav koda parakstīta. Windows var brīdināt, un macOS prasa ar peles labo pogu noklikšķināt, pēc tam Atvērt.

Viss pārējais ir iekļauts [Vēl nav izstrādāts](topic:not-built-yet). Par iepriekšējo laidienu skatiet [Kas jauns versijā 0.7](topic:whats-new-0-7).
