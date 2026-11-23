---
title: Jaunumi 0.9 versijā (iepriekšējā)
summary: Koridoru un reljefa veidnes, piesaistes un izvēles pogas, zīmējot, GIS analīze ar atribūtu tabulu, ēnas, saules raža, komforta un vēja pētījumi objektam, 3D renderēšanas skats un Punktu mākoņu un WaterCraft papildinājumi.
keywords: jaunumi 0.9, iepriekšējais izlaidums, jaunumi, 0.9, izlaiduma piezīmes, koridoru veidnes, reljefa veidnes, veidņu redaktors, tipiskais šķērsgriezums, vairāki koridori, piesaiste, piesaistes, izvēle, pārvietot, kopēt, pagriezt, tangente, renderēt, 3d renderēšana, gis analīze, buferis, pārklāšana, telpiskā savienošana, atribūtu tabula, stils pēc atribūta, ēnu pētījums, saules raža, utci, āra komforts, vēja pētījums, openfoam, punktu mākoņi, las, laz, watercraft, ugunsdzēsības plūsma, hidrants, ūdens vecums, hlors, pieprasījumi, rīku padomi, izkārtojums, izlaiduma piezīmes, izmaiņas, 0.8, 0.8.1, versija, jaunas iespējas, lietus, vētras ūdens, applūšana, zemes darbi, līdzsvars, izrakums un uzbērums, pārvadāšana, labākais maršruts, mazāko izmaksu ceļš, trase, aizturēšanas dīķis, noteka, nolaišanās, brīvais augstums, progress, uzmērījums, drons, krātuve, adrese uz objektu, gabals, augsne, plūdi, nogāzes stabilitāte, bišopa, sēšanās, krustojums, marķējums, zīmes, redzamības attālums, izlīdzināšana, mazāko kvadrātu, poligons, atklātā raktuve, bloku modelis, radio saite, fresnele, pārmija, pārmijas, valodas, problēmas, tiešraide, dwg
from: 4664522c
---

Šis ir tas, kas mainījās CivilCraft 0.9 versijā, salīdzinot ar 0.8.1. CivilCraft 0.9 ir daļa no CadCraft Studio 0.9 un tā astoņām lietotnēm. Galvenās daļas ir koridoru un reljefa veidnes, piesaistes zīmēšanas laikā, GIS analīze, pētījumi par objekta saulēm, saules ražu, komfortu un vēju, kā arī divi papildinājumi: Punktu mākoņi un WaterCraft.

## Jauns

### Koridoru un reljefa veidnes

- **Koridoru veidnes.** Atveriet {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Koridoru veidnes…}} (vai ierakstiet {{cmd:TEMPLATES}}). Veidne ir neliels šķērsgriezums ar komponentiem, nobīdēm, slīpumiem, materiāliem un punktu kodiem. Glabājiet tās projektā, sadaļā {{ui:Mana bibliotēka}} vai kā `.cctemplates.json` failu. Veidņu redaktorā ir zīmējums patiesā mērogā, un tas uzskaita problēmas, kamēr rakstāt.
- **Veidošana no veidnēm pēc piketa.** Atlasiet trasi un Rekvizītos ieslēdziet {{ui:Veidot no veidnēm pēc piketa}}. Katrai reģiona pusei ir savs seguma saraksts un savs gala stāvoklis. {{ui:Pievienot koridoru}} sadaļā {{ui:Koridori šajā trasē}} ievieto vairākus koridorus vienā trasē.
- **Reljefa veidnes.** {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Reljefa veidnes…}} (vai ierakstiet {{cmd:TERRAINTEMPLATES}}) uzliek slāņotus materiālus, piemēram, augsnes slāni vai segumu un pamatni, uz reljefa, ar laukumu un tilpumu katram slānim. Skatiet [Koridoru veidnes un reljefa veidnes](topic:corridor-templates).

### Zīmēšana

- **Piesaistes.** Rīki Trase, Laukums, Zemes gabals, Masa, Raksturlīnija, Mērīt, Robeža un Baseins piesaistās topogrāfijas punktiem, PI, stūriem, virsotnēm un struktūrām, ar etiķeti blakus marķierim. Turiet {{key:Alt}} brīvam punktam.
- **Izvēles pogas, tangente un pārvietošana, kopēšana, pagriešana.** Laukuma, zemes gabala un raksturlīniju stūriem ir ierakstāmi Austrumu un Ziemeļu lauki un krustiņa poga {{ui:Izvēlēties}}. Rekvizīti arī piedāvā {{ui:Tangente no diviem punktiem}} trasēm un {{ui:Pārvietot, kopēt un pagriezt}} trasēm, laukumiem, zemes gabaliem un raksturlīnijām. Skatiet [Zīmēšana ar piesaistēm, izvēlētiem stūriem un pārvietošanu, kopēšanu un pagriešanu](topic:draft-with-snaps).
- **Renderēšanas skats 3D.** Poga {{ui:Renderēt}} 3D joslā zīmē zemi ar dabiskām krāsām, debesīm, miglu un mīkstām ēnām. Tā nemaina modeli. Izvēlne {{ui:Saule}} tagad ir ar pogām {{ui:Lietot}} un {{ui:Aizvērt}}. Skatiet [Skatīt objektu 3D](topic:site-3d).
- **Paneļi atveras pa vienai sadaļai.** Kreisais panelis un Rekvizītu panelis atver vienu sadaļu un aizver pārējās, un Ainavas lentes plāksnītes, kurās ir vairāki rīki, ir sadalītas pogas.

### GIS analīze

- **Analīze.** {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Analizēt}} piedāvā bufera, pārklāšanās, telpiskās savienošanas, atlasi pēc atribūta vai formas un mērīšanu. Katrs rīks veido jaunu slāni vienā atsaukšanas solī.
- **Atribūtu tabula.** Slāņa trīs punktu izvēlnē ir {{ui:Atribūtu tabula…}} un {{ui:Stils pēc atribūta…}}. Skatiet [Analizēt GIS slāņus](topic:gis-analysis) un [Darbs ar slāņa atribūtu tabulu](topic:gis-table).

### Objekts: saule, saules raža, komforts un vējš

- **Vides sadaļa.** Atlasiet masu: sadaļa {{ui:Vide}} atrodas zem {{ui:Saules stundas}} tās Rekvizītos. Tajā ir ēnu pētījums (karte, tabula, animācija, CSV), saules ražas aprēķins no tipiska gada laikapstākļu faila (.epw) un āra komforts (UTCI).
- **Vējš, tikai skrīnings.** {{ui:Palaist vēja pētījumu}} iekrāso zemi no sēdēšanas līdz nepatīkamai katram vēja virzienam laikapstākļu failā. Tas nav validēts, un panelis to saka.
- **Gājēju vējš (OpenFOAM) papildinājums.** Izslēgts, līdz to ieslēdzat sadaļā {{ui:Iestatījumi}} › {{ui:Papildinājumi}}. OpenFOAM ir programmatūra, ko instalējat pats. Skatiet [Ēnas, saules raža un āra komforts](topic:environment).

### Punktu mākoņi (papildinājums)

- Ieslēdziet {{ui:Punktu mākoņi}} sadaļā {{ui:Iestatījumi}} › {{ui:Papildinājumi}}; labās puses panelī parādās cilne Punktu mākoņi. Atveriet LAS vai LAZ failu, notīriet to, sakārtojiet pēc zemes, veģetācijas un ēkām, izveidojiet zemi, horizontāles un apjomus un eksportējiet LAS vai LAZ. Skatiet [Punktu mākoņi no drona vai skenera](topic:point-clouds).

### WaterCraft (papildinājums)

- Ieslēdziet {{ui:WaterCraft (ūdens sadale)}} sadaļā {{ui:Iestatījumi}} › {{ui:Papildinājumi}}; parādās cilne WaterCraft. Tajā ir pieprasījumi no patērētājiem, ugunsdzēsības plūsma pie katra hidranta, kura maģistrāles pārtraukums ir vissvarīgākais, un ūdens vecums un hlors, katrs saglabāts kā CSV. Skatiet [WaterCraft: patēriņš, ugunsdzēsības plūsma, pārtraukumi un ūdens vecums](topic:watercraft).

### Darbs kopā

- Tiešraides sesijā redzat viens otra kursorus un vārdus plānā. Bibliotēkas augi: CivilCraft ainava sākas no tās noklusējuma bibliotēkas kolekcijas {{ui:CivilCraft ainava}}.

## Katrā lietotnē

- Padomi tiek rādīti kā Bootstrap rīku padomi, un sākuma padomu var aizvērt.
- Cilņu josla panelī, kas neiederas, ritina, nevis tiek apgriezta.
- Pārlūkprogrammas cilņu virsraksti: `<dokuments> - CivilCraft | CadCraft`.
- {{ui:Iestatījumi}} ir Izkārtojuma sadaļa, kur izkārtojumi ir nolaižams saraksts ar divrindu izvēlēm.
- Svara un temperatūras mērvienības ir {{ui:Iestatījumi}} › {{ui:Visur}} › {{ui:Mērvienības}}.
- Valodu saraksts rāda valodas, kurām šim izlaidumam ir faili. Valodas, kas nav angļu, ir mašīntulkoti melnraksti.

## Labots

- Adrešu meklēšanas un EnergyPlus pārbaudes papildinājumus nevarēja ieslēgt; tagad var.
- Palīdzība tagad saka, ka Punktu mākoņu papildinājums raksta notīrītu mākoni kā LAS 1.4 vai LAZ.
- Noklikšķinot uz pašas izvēlētā objekta satvērēja, vairs nesākas satvērēja velkšana, kas apturēja gaidošo Izvēli.

## Godīgi ierobežojumi

- Koridoru veidnes piemēri ir vietturi bez standarta; tos jāpārbauda inženierim. Reljefa veidnes nepievieno virsmu un netiek zīmētas 3D vai griezumu skatā. Otrs koridors uz trases nav IFC eksportā. Starp divām veidnēm pēc piketa nav pārejas.
- Punktu mākoņi tika pārbaudīti uz izdomātiem failiem, nevis uz reāla drona uzmērījuma. Tiek lasīti tikai LAS un LAZ.
- GIS analīze tika pārbaudīta uz izdomātiem slāņiem.
- Ēnas, saule un komforts ir plānošanas aprēķini; vējš ir nevalidēts skrīnings. Nekas no tā nav projektēšanas vērtība.
- WaterCraft ir aprēķinu palīglīdzeklis, pārbaudīts uz izdomātiem tīkliem. Ūdens inženieris nosaka, cik daudz skaitļi ir vērti.
- Valodas, kas nav angļu, ir mašīntulkoti melnraksti.
- Windows instalētāji nav parakstīti ar kodu, un macOS diska attēls nav notarizēts.

## Agrāk: 0.8 un 0.8.1

Šis ir tas, kas mainījās CivilCraft 0.8 (2026-11-01) un 0.8.1 (2026-11-02) versijā, salīdzinot ar 0.7. Galvenās jaunās daļas ir rīki, kas pārbauda jūsu zemes izlīdzināšanu un objektu (lietus, zemes darbi, maršruti, dīķi, progress), un seši aprēķinu logi zemei, ceļiem, uzmērījumiem, raktuvēm, saitēm un dzelzceļam.

### Jauns

**Pārbaudiet savu izlīdzināšanu**

- **Uzsist lietu.** {{ui:Uzsist lietu…}} (sadaļā {{ui:Virsma}}) nolaiž vētru izlīdzinātajā zemē. Redzat, kā ūdens notek no laukumiem, uzkrājas zemajos stūros un pārplūst pārāk mazos dīķos. Palaišana ir animēta un dod apjomus, maksimālo izplūdi un CSV ar katru dīķi. Noklusējuma šūna ir rupja, lai pirmais skats būtu ātrs; smalkāka šūna ir lēnāka. Dīķi, kas pārplūst, parādās arī Problēmu panelī.
- **Zemes darbu līdzsvarotājs.** {{ui:Zemes darbu līdzsvarotājs…}} paceļ vai nolaiž laukumu, līdz izrakums ir vienāds ar uzbērumu, un parāda pārvadāšanas tabulu starp tiem.
- **Labākais maršruts.** {{ui:Labākais maršruts…}}: izvēlieties sākumu un beigas, un CivilCraft atrod lētāko ceļu pāri reljefam, kas ievēro jūsu slīpuma un līknes ierobežojumus, un pēc tā veido trasi.
- **Aizturēšanas dīķi.** {{ui:Aizturēšanas dīķi…}} aprēķina pakāpi un uzkrāšanu no jūsu zemes, pieņem izplūdes ierīces (atvere, aizsprosts, V veida izgriezums, pārlietne), maršrutē vētru caur dīķi un pārbauda aizturēto maksimālo plūsmu, nosusināšanas laiku un brīvo augstumu.
- **Progress pēc uzmērījumiem.** {{ui:Progress pēc uzmērījumiem…}} salīdzina dronu vai skenēšanas virsmas no dažādiem datumiem ar zemi, kāda tā bija, un ar projektu: procentuālais izpildījums pēc tilpuma, pārrakti un pārbērti apgabali, krātuves un laiks, kad darbs beigsies šādā tempā (atzīmēts kā aprēķins).

**Zināt vietu**

- **Adrese uz objektu.** {{ui:Adrese uz objektu…}} saskaņo atvērtos gabalu, ēku, zonējuma, augsnes, plūdu un reljefa datus vienā objektā. Objektu var glabāt projekta failā: ievadīto adresi, katru avotu ar dienu, kad to ieguvāt, un tā licenci, un to, kas atgriezās. Atkal atverot vai koplietojot projektu, objekts joprojām ir tur, un nekas netiek iegūts no jauna. Varat to saglabāt arī kā objekta failu vai nosūtīt uz BimCraft. Skatiet [Adrese uz objektu](topic:address-to-site).

**Zeme, ceļi, uzmērījumi, raktuves, saites un dzelzceļš**

- **Augsnes un nogāzes.** {{ui:Augsnes un nogāzes…}} zīmē augsnes profilu starp ievadītiem urbumiem. Bišopa metode tad meklē kritisko apli jūsu zemē, ar gruntsūdens līmeni, papildslodzi un zemestrīces koeficientu; pamata sēšanās iegūst konsolidāciju, tūlītējo sēšanos un laiku.
- **Krustojumi un marķējums.** {{ui:Krustojumi un marķējums…}} saliek kopā kājas ar bordiūru noapaļojumiem (viens rādiuss katrai kājai vai trīscentru noapaļojumi), redzamības attālumu projektētajam ātrumam, redzamības trijstūru pārbaudi, gājēju pārejas, apstāšanās līnijas, marķējumus un zīmes ar zīmju sarakstu. Tie tiek zīmēti plānā un saglabāti kā .dxf ar nosauktiem slāņiem.
- **Uzmērījumu izlīdzināšana.** {{ui:Uzmērījumu izlīdzināšana…}} veic poligona vai tīkla mazāko kvadrātu izlīdzināšanu: izlīdzinātās koordinātas, kļūdu elipses, hi-kvadrāta testu un karogu mērījumam, kas nesaskan. Ietverti brīvie tīkli, poligona aizvēršana ar kompasa likumu un RW5, GSI, JobXML vai CSV lauka faili, un izlīdzinātie punkti tiek saglabāti kā CSV.
- **Atklātās raktuves.** {{ui:Atklātās raktuves…}} pārvērš urbumu paraugus bloku modelī un galīgo bedri jūsu nogāzes leņķa robežās, ar atkritumu attiecību, tabulu pa soliem un pakāpes un tonnāžas līkni. Ligzdotas bedres pēc ieņēmumu koeficienta un ražošanas grafiks ar diskontētu naudas plūsmu arī ir iekļauti.
- **Radio saites.** {{ui:Radio saites…}} pārbauda redzamību pāri jūsu zemei ar zemes izliekumu, pirmo Fresnela zonu, saites budžetu, izbalēšanas rezervi un daudzceļu pārtraukumus, un dod masta augstumu, kas notīrītu ceļu. Tā veic arī šķiedras zudumu budžetus, maršruta daudzumus un vēju uz torni.
- **Dzelzceļa pārmijas.** {{ui:Dzelzceļa pārmijas…}} veido pārmiju pēc tās sirds numura, krustojumus starp paralēlām sliedēm un konstrukcijas atstarpi, ko sašķieb kants un paplašina līknē. Pārmija var atrasties trases piketā.

Skatiet [Augsnes, krustojumi, uzmērījumu izlīdzināšana, raktuves, radio saites un pārmijas](topic:soils-roads-survey-mines-links).

### Katrā lietotnē

- **Valodas.** 54 valodas, desmit no tām jaunas. Valodas, kas nav angļu, ir mašīntulkoti melnraksti, līdz dzimtā valoda tos izlasa. Palīdzības tēmas joprojām galvenokārt ir angļu valodā.
- **Rīkjoslas rindas.** {{ui:Iestatījumi}} › {{ui:Vispārīgi}} › {{ui:Rīkjoslas rindas}}: Ietīt (kā agrāk), 2 rindas vai 1 rinda. CivilCraft lente rāda visbiežāk lietoto rīku lielu, nākamos mazus, bet pārējos aiz grupas nosaukuma bultiņas.
- **Ievades ierīces.** Skārienpaliktnis, pildspalva, 3D pele, vadība un MIDI var vadīt lietotnes.
- **Problēmas.** Problēmu panelis brīdina katrā lietotnē, ar pārbaudēm, kas lasa regulējuma paketes.
- **Tiešraide.** Skats uz to, kas kur atrodas tiešraides sesijā.
- **Papildinājumi.** Papildinājumu saraksts ar apgaismojuma papildinājumiem.
- **Pievienojiet savu AI.** Jebkurš palīgs, ko pievienojat, var vadīt CivilCraft rīkus. Tas nāk ar piezīmi, ka vienas pogas savienošana CadCraft Studio iekšienē un mitinātais savienotājs vēl nav gatavi. Skatiet [Ļaujiet AI palīgam strādāt ar jūsu objektu](topic:assistants).

### Labots 0.8.1 versijā

- **DWG klašu sadaļa.** Tā tika nolasīta kā nepareizs tips (GitHub cadcraft#5). Labots CivilCraft kopā ar CadCraft, BimCraft, ModelCraft un TakeoffCraft.
- **Valodas maiņa darbības laikā.** CadCraft Studio un iepakotie izdevumi var mainīt valodu darbības laikā. Iepriekš tā bija tikai angļu. Vēl nav pārbaudīts katrā platformā: pasakiet, ja valoda nemainās.

### Vēl nav šajā versijā

- **Tie ir aprēķinu palīglīdzekļi.** Katrs rezultāts jaunajos logos prasa inženiera pārbaudi. Augsnes izturība sākas no tipiskām vērtībām augsnes grupai, un logs to saka.
- **Uzsist lietu.** Palaišana izlases objektā var aizņemt vairāk nekā divas minūtes pārlūkprogrammā smalkā šūnā. Tā tika pārbaudīta pret rokas gadījumiem un V veida baseinu, bet vēl ne uz reāla izlīdzināta objekta.
- **Adrese uz objektu.** Tā lasa atvērtos datu failus, ko jūs atnesat, un tika pārbaudīta tikai uz mūsu pašu failiem. Koki nav avots. Avotu iegūšana jums gaida privātuma formulējumu.
- **Progress pēc uzmērījumiem.** Pārbaudīts tikai uz izdomātiem uzmērījumiem. Progress lapās un atzīmēs (MarkupCraft) un skenēšana pret modeli (BimCraft) nav izveidoti.
- **Augsnes un nogāzes.** Tikai apļveida virsmas: nav pleznas vai bloka meklēšanas un nav sprieguma plaisas.
- **Krustojumi.** Viens rādiuss katrai kājai, nav kravas automašīnu šķērsošanas trajektoriju, un tie vēl neiet koridorā.
- **Lauka faili.** Lasītāji rakstīti no publiskiem formāta aprakstiem un izmēģināti uz failiem, ko mēs izveidojām. Vajadzīgi īsti instrumentu faili.
- **Saites un dzelzceļš.** Radio saites: tikai brīvās telpas zudums un daudzceļu (bez lietus izbalēšanas vai antenu diagrammām), un nav dzelzceļa standarta: katrs dzelzceļa ierobežojums ir vietturis ar melnraksta skaitļiem, ko neviens dzelzceļa inženieris nav pārbaudījis.
- **Windows un macOS.** 0.8 nav parakstīts ar kodu. Windows var brīdināt, un macOS prasa labo klikšķi, tad Atvērt.

Viss pārējais ir [Vēl nav izstrādāts](topic:not-built-yet). Par iepriekšējo izlaidumu skatiet [Jaunumi 0.7](topic:whats-new-0-7).
