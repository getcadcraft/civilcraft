---
title: Jaunumi 0.9 versijā
summary: Koridoru un reljefa veidnes, piesaistes un izvēles pogas zīmēšanas laikā, GIS analīze ar atribūtu tabulu, objekta ēnu, saules enerģijas ražas, komforta un vēja pētījumi, 3D Renderēšanas skats, un Punktu mākoņu un WaterCraft papildinājumi.
keywords: jaunumi, 0.9, izlaiduma piezīmes, koridoru veidnes, reljefa veidnes, veidņu redaktors, tipiskais šķērsgriezums, vairāki koridori, piesaiste, piesaistes, izvēle, pārvietot, kopēt, pagriezt, tangente, renderēt, 3d renderēšana, gis analīze, buferis, pārklājums, telpiskā savienošana, atribūtu tabula, stils pēc atribūta, ēnas pētījums, saules enerģijas raža, utci, ārtelpu komforts, vēja pētījums, openfoam, punktu mākoņi, las, laz, watercraft, ugunsdzēsības plūsma, hidrants, ūdens vecums, hlors, pieprasījumi, rīkpadomi, izkārtojums, jaunumi, izlaiduma piezīmes, izmaiņas, 0.8, 0.8.1, versija, jaunas funkcijas, lietus, kanalizācija, ūdens uzkrāšanās, pārplūde, zemes darbi, līdzsvars, izrakums un uzbērums, transportēšana, labākais maršruts, mazākās izmaksas, trase, aizturēšanas dīķis, izplūde, izsīkums, brīvais augstums, progress, uzmērījums, drons, krautne, adrese objektam, zemesgabals, augsne, plūdi, nogāzes stabilitāte, bišopa, sēšanās, mezgls, svītrojums, signāli, redzamības attālums, izlīdzināšana, mazāko kvadrātu, poligons, atklātā raktuve, bloku modelis, radio saite, frenela, pārmija, krustojums, valodas, problēmas, live, dwg
from: d7ac5b14
---

Šis ir tas, kas ir mainījies CivilCraft 0.9 versijā, salīdzinot ar 0.8.1. CivilCraft 0.9 ir daļa no CadCraft Studio 0.9 un tās astoņām lietotnēm. Lielākās daļas ir koridoru un reljefa veidnes, piesaistes zīmēšanas laikā, GIS analīze, objekta saules, saules enerģijas, komforta un vēja pētījumi, un divi papildinājumi: Punktu mākoņi un WaterCraft.

## Jaunumi

### Koridoru un reljefa veidnes

- **Koridoru veidnes.** Atveriet {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Koridoru veidnes…}} (vai ierakstiet {{cmd:TEMPLATES}}). Veidne ir neliels šķērsgriezums ar komponentiem, nobīdēm, nogāzēm, materiāliem un punktu kodiem. Glabājiet tās projektā, sadaļā {{ui:Mana bibliotēka}} vai kā failu `.cctemplates.json`. Veidņu redaktors rāda mēroga zīmējumu un uzskaita problēmas, kamēr rakstāt.
- **Veidot no veidnēm pēc piketa.** Izvēlieties trasi un ieslēdziet {{ui:Veidot no veidnēm pēc piketa}} tās rekvizītos. Katrai reģiona pusei ir sava segumu josla un savs gala nosacījums. {{ui:Pievienot koridoru}} sadaļā {{ui:Koridori šajā trasē}} novieto vairākus koridorus vienā trasē.
- **Reljefa veidnes.** {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Reljefa veidnes…}} (vai ierakstiet {{cmd:TERRAINTEMPLATES}}) uzklāj slāņotus materiālus, piemēram, augsnes virskārtu vai segumu un pamatni, pa reljefu, ar laukumu un tilpumu katram slānim. Skatiet [Koridoru veidnes un reljefa veidnes](topic:corridor-templates).

### Zīmēšana

- **Piesaistes.** Rīki Trase, Pamatne, Zemesgabals, Masa, Raksturlīnija, Mērīt, Robeža un Baseins piesaistās uzmērījumu punktiem, PI, stūriem, virsotnēm un konstrukcijām, ar apzīmējumu pie marķiera. Turiet {{key:Alt}}, lai izvēlētos brīvu punktu.
- **Izvēles pogas, tangente un pārvietošana, kopēšana, pagriešana.** Pamatnes, zemesgabala un raksturlīnijas stūriem ir ierakstāmi Austrumu un Ziemeļu lodziņi un krustiņa izvēles poga {{ui:Izvēlēties}}. Rekvizītos ir arī {{ui:Tangente no diviem punktiem}} trasēm un {{ui:Pārvietot, kopēt un pagriezt}} trasēm, pamatnēm, zemesgabaliem un raksturlīnijām. Skatiet [Zīmēšana ar piesaistēm, izvēlētiem stūriem un pārvietošanu, kopēšanu, pagriešanu](topic:draft-with-snaps).
- **Renderēšanas skats 3D.** Poga {{ui:Renderēt}} 3D joslā zīmē zemi ar dabiskām krāsām, debesīm, miglu un maigām ēnām. Tā nemaina modeli. Izvēlnei {{ui:Saule}} tagad ir pogas {{ui:Lietot}} un {{ui:Aizvērt}}. Skatiet [Objekta skatīšana 3D](topic:site-3d).
- **Paneļi atveras pa vienai sadaļai.** Kreisais panelis un Rekvizītu panelis atver vienu sadaļu un aizver pārējās, un Ainavu lentes plāksnītes, kurās ir vairāki rīki, ir sadalītas pogas.

### GIS analīze

- **Analīze.** {{ui:Virsma}} › {{ui:Vairāk}} › {{ui:Analīze}} piedāvā buferi, pārklājumu, telpisko savienošanu, atlasi pēc atribūta vai formas un mērīšanu. Katrs rīks izveido jaunu slāni vienā atsaukšanas solī.
- **Atribūtu tabula.** Slāņa trīs punktu izvēlnē ir {{ui:Atribūtu tabula…}} un {{ui:Stils pēc atribūta…}}. Skatiet [Analizēt GIS slāņus](topic:gis-analysis) un [Darbs ar slāņa atribūtu tabulu](topic:gis-table).

### Objekts: saule, saules enerģija, komforts un vējš

- **Vides sadaļa.** Izvēlieties masu: sadaļa {{ui:Vide}} atrodas zem {{ui:Saules stundas}} tās rekvizītos. Tajā ir ēnas pētījums (karte, tabula, animācija, CSV), saules enerģijas raža no tipiska gada laikapstākļu faila (.epw) un ārtelpu komforts (UTCI).
- **Vējš, tikai ekrānēšanai.** {{ui:Veikt vēja pētījumu}} iekrāso zemi no sēdēšanai līdz nepatīkamai katram vēja virzienam laikapstākļu failā. Tas nav validēts, un panelis to saka.
- **Gājēju vējš (OpenFOAM) papildinājums.** Izslēgts, līdz to ieslēdzat {{ui:Iestatījumi}} › {{ui:Papildinājumi}}. OpenFOAM ir programmatūra, ko instalējat paši. Skatiet [Ēna, saules enerģijas raža un ārtelpu komforts](topic:environment).

### Punktu mākoņi (papildinājums)

- Ieslēdziet {{ui:Punktu mākoņi}} sadaļā {{ui:Iestatījumi}} › {{ui:Papildinājumi}}; labās puses panelī parādās Punktu mākoņu cilne. Atveriet LAS vai LAZ failu, notīriet to, sakārtojiet zemē, veģetācijā un ēkās, izveidojiet zemi, horizontāles un tilpumus, un eksportējiet LAS vai LAZ. Skatiet [Punktu mākoņi no drona vai skenera](topic:point-clouds).

### WaterCraft (papildinājums)

- Ieslēdziet {{ui:WaterCraft (ūdensapgāde)}} sadaļā {{ui:Iestatījumi}} › {{ui:Papildinājumi}}; parādās WaterCraft cilne. Tajā ir klientu pieprasījumi, ugunsdzēsības plūsma katrā hidrantā, kura maģistrāles pārtraukums visvairāk ietekmē, un ūdens vecums un hlors, katrs saglabājams kā CSV. Skatiet [WaterCraft: pieprasījumi, ugunsdzēsības plūsma, pārtraukumi un ūdens vecums](topic:watercraft).

### Kopā strādājot

- Live sesijā redzat viens otra kursorus un vārdus plānā. Bibliotēkas augi: CivilCraft ainavas sākas no savas noklusējuma bibliotēkas kolekcijas {{ui:CivilCraft ainavas}}.

## Visās lietotnēs

- Padomi tiek rādīti kā Bootstrap rīkpadomi, un sākuma padomu var aizvērt.
- Paneļa cilņu josla, kas nesaiet, ritina, nevis tiek apgriezta.
- Pārlūkprogrammas cilnes nosaukums ir `<dokuments> - CivilCraft | CadCraft`.
- {{ui:Iestatījumi}} ir Izkārtojuma sadaļa, kur izkārtojumi ir nolaižamais saraksts ar divrindu izvēlēm.
- Svara un temperatūras mērvienības ir sadaļā {{ui:Iestatījumi}} › {{ui:Globāls}} › {{ui:Mērvienības}}.
- Valodu sarakstā ir tās valodas, kurām šai versijai ir faili. Valodas, kas nav angļu, ir mašīntulkojuma melnraksti.

## Labots

- Adrešu meklēšanas un EnergyPlus pārbaudes papildinājumus nevarēja ieslēgt; tagad var.
- Palīdzība tagad saka, ka Punktu mākoņu papildinājums notīrītu mākoni raksta kā LAS 1.4 vai LAZ.
- Klikšķis uz paša atlasītā objekta satvēruma vairs nesāk satvēruma vilkšanu, kas apturēja gaidošo izvēli.

## Godīgi ierobežojumi

- Piemēra koridoru veidnes ir vietturi, kas nav balstīti uz standartu; inženierim tās jāpārbauda. Reljefa veidnes nepievieno virsmu un netiek zīmētas 3D vai šķērsgriezuma skatā. Otrais koridors trasē nav IFC eksportā. Starp divām veidnēm pēc piketa nav pārejas.
- Punktu mākoņi tika testēti uz izdomātiem failiem, nevis uz reāla drona uzmērījuma. Tiek lasīti tikai LAS un LAZ.
- GIS analīze tika testēta uz izdomātiem slāņiem.
- Ēna, saules enerģija un komforts ir plānošanas aplēses; vējš ir nevalidēts ekrānējums. Neviens no tā nav projektēšanas vērtība.
- WaterCraft ir aprēķinu palīglīdzeklis, pārbaudīts uz izdomātiem tīkliem. Ūdensapgādes inženieris izlemj, cik daudz skaitļi ir vērti.
- Valodas, kas nav angļu, ir mašīntulkojuma melnraksti.
- Windows instalētāji nav koda parakstīti, un macOS diska attēls nav notarizēts.

## Iepriekš: 0.8 un 0.8.1

Šis ir tas, kas ir mainījies CivilCraft 0.8 (2026-11-01) un 0.8.1 (2026-11-02) versijā, salīdzinot ar 0.7. Lielākās jaunās daļas ir rīki, kas pārbauda jūsu vertikālo plānošanu un objektu (lietus, zemes darbi, maršruti, dīķi, progress), un sešas aprēķinu logi zemei, ceļiem, uzmērījumiem, raktuvēm, saitēm un dzelzceļam.

### Jaunumi

**Pārbaudiet savu vertikālo plānošanu**

- **Uzlija lietu.** {{ui:Uzsist lietu…}} (zem {{ui:Virsma}}) uzlaiž vētru uz vertikāli plānotās zemes. Redzat, kā ūdens notek no platformām, uzkrājas zemajos stūros un pārplūst pārāk mazos dīķos. Gaita ir animēta un dod tilpumus, maksimālo izplūdi un katra dīķa CSV. Noklusējuma šūna ir rupja, lai pirmais skatiens būtu ātrs; smalkāka šūna ir lēnāka. Dīķi, kas pārplūst, parādās arī Problēmu panelī.
- **Zemes darbu līdzsvarotājs.** {{ui:Zemes darbu līdzsvarotājs…}} paceļ vai nolaiž platformu, līdz izrakums ir vienāds ar uzbērumu, un parāda transportēšanas tabulu starp tiem.
- **Labākais maršruts.** {{ui:Labākais maršruts…}}: izvēlieties sākumu un beigas, un CivilCraft atrod lētāko ceļu pa reljefu, kas ievēro jūsu nogāzes un līknes robežas, un pēc tā izveido trasi.
- **Aizturēšanas dīķi.** {{ui:Aizturēšanas dīķi…}} aprēķina līmeni un tilpumu no jūsu zemes, pieņem izplūdes ierīces (atvere, aizsprosts, V veida griezums, pārplūdes slieksnis), izvada vētru caur dīķi un pārbauda aizturēto maksimumu, izsīkuma laiku un brīvo augstumu.
- **Progress no uzmērījumiem.** {{ui:Progress pēc uzmērījumiem…}} salīdzina drona vai skenēšanas virsmas no dažādiem datumiem ar zemi, kāda tā bija, un ar projektu: pabeigtais procents pēc tilpuma, pārrakās un pārbērtās vietas, krautnes un laiks, kad darbs beigsies pēc šā tempa (atzīmēts kā aplēse).

**Pazīstiet objektu**

- **Adrese objektam.** {{ui:No adreses uz objektu…}} savieno atvērtus zemesgabalu, ēku, zonējuma, augsnes, plūdu un reljefa datus vienā objektā. Objektu varat paturēt projekta failā: ierakstīto adresi, katru avotu ar dienu, kad to ieguvāt, un tā licenci, un to, kas atgriezās. Atkal atverot vai kopīgojot projektu, objekts joprojām ir tur, un nekas netiek iegūts no jauna. Varat to arī saglabāt kā objekta failu vai nosūtīt uz BimCraft. Skatiet [Adrese objektam](topic:address-to-site).

**Zeme, ceļi, uzmērījumi, raktuves, saites un dzelzceļš**

- **Augsnes un nogāzes.** {{ui:Augsnes un nogāzes…}} zīmē augsnes profilu starp jūsu ierakstītajiem urbumiem. Bišopa metode pēc tam meklē kritisko apli uz jūsu zemes, ar ūdens līmeni, papildslodzi un zemestrīces koeficientu; pamata sēšanās iegūst konsolidāciju, tūlītēju sēšanos un laiku.
- **Krustojumi un svītrojums.** {{ui:Krustojumi un svītrojums…}} savieno zarus ar apmaļu atgriezieniem (viens rādiuss katram zaram vai trīs centru atgrieziens), redzamības attālumu projektētajam ātrumam, redzamības trīsstūru pārbaudi, gājēju pārejas, apstāšanās līnijas, marķējumu un zīmes ar zīmju sarakstu. Tie tiek zīmēti plānā un saglabāti kā .dxf ar nosauktiem slāņiem.
- **Uzmērījumu izlīdzināšana.** {{ui:Uzmērījumu izlīdzināšana…}} veic poligona vai tīkla mazāko kvadrātu izlīdzināšanu: izlīdzinātās koordinātas, kļūdu elipses, hī kvadrāta pārbaude un atzīme mērījumam, kas neatbilst. Brīvi tīkli, poligona aizvēršana ar kompasa likumu un RW5, GSI, JobXML vai CSV lauka faili ir iekļauti, un izlīdzinātie punkti saglabājas kā CSV.
- **Atklātās raktuves.** {{ui:Atklātās raktuves…}} pārvērš urbšanas paraugus bloku modelī un galīgo bedri jūsu nogāzes leņķa robežās ar atslāņošanas koeficientu, tabulu pa pakāpieniem un rūdas kvalitātes un tonnāžas līkni. Iedobtas bedres pēc ieņēmumu koeficienta un ražošanas grafiks ar diskontētu naudas plūsmu ir arī pieejams.
- **Radio saites.** {{ui:Radio saites…}} pārbauda redzamību pāri jūsu zemei ar zemes izliekumu, pirmo Frenela zonu, saites budžetu, izgaismošanās rezervi un daudzceļu pārtraukumu, un dod masta augstumu, kas notīrītu ceļu. Tā veic arī šķiedras zudumu budžetus, maršrutu daudzumus un vēju uz torni.
- **Dzelzceļa pārmijas.** {{ui:Dzelzceļa pārmijas…}} veido pārmiju pēc tās krustojuma numura, pārejas starp paralēliem sliežu ceļiem un konstrukcijas platumu, ko noliec ar sānslīpi un paplašina līknē. Pārmija var atrasties trases piketā.

Skatiet [Augsnes, krustojumi, uzmērījumu izlīdzināšana, raktuves, radio saites un pārmijas](topic:soils-roads-survey-mines-links).

### Visās lietotnēs

- **Valodas.** 54 valodas, desmit no tām jaunas. Valodas, kas nav angļu, ir mašīntulkojuma melnraksti, līdz dzimtā valodas runātājs tos izlasa. Palīdzības tēmas joprojām ir galvenokārt angļu valodā.
- **Rīkjoslas rindas.** {{ui:Iestatījumi}} › {{ui:Vispārīgi}} › {{ui:Rīkjoslas rindas}}: Ietīt (kā agrāk), 2 rindas vai 1 rinda. CivilCraft Lente rāda visbiežāk lietoto rīku lielu, nākamos mazus, un pārējos aiz grupas nosaukuma bultiņas.
- **Ievades ierīces.** Skārienpaliktnis, pildspalva, 3D pele, vadība un MIDI var vadīt lietotnes.
- **Problēmas.** Problēmu panelis, kas brīdina visās lietotnēs, ar pārbaudēm, kas nolasa regulējuma komplektus.
- **Live.** Skats, kas parāda, kas kur atrodas Live sesijā.
- **Papildinājumi.** Papildinājumu saraksts, ar apgaismojuma papildinājumiem.
- **Pieslēdziet savu MI.** Jebkurš asistents, ko pieslēdzat, var vadīt CivilCraft rīkus. Tas tiek piegādāts ar piezīmi, ka vienas pogas pieslēgšana CadCraft Studio un mītnes savienotājs vēl nav gatavi. Skatiet [Ļaujiet MI asistentam strādāt ar jūsu objektu](topic:assistants).

### Labots 0.8.1

- **DWG klašu sadaļa.** To nolasīja kā nepareizu tipu (GitHub cadcraft#5). Labots CivilCraft kopā ar CadCraft, BimCraft, ModelCraft un TakeoffCraft.
- **Valodas maiņa darbības laikā.** CadCraft Studio un iepakotie izdevumi var mainīt valodu darbības laikā. Agrāk tie bija tikai angļu valodā. Vēl nav testēts visās platformās: pastāstiet mums, ja valoda nemainās.

### Vēl nav šajā versijā

- **Tie ir aprēķinu palīglīdzekļi.** Katrs rezultāts jaunajos logos prasa inženiera pārbaudi. Augsnes izturība sākas no tipiskām vērtībām augsnes grupai, un logs to saka.
- **Uzlija lietu.** Palaišana paraugobjektā pārlūkprogrammā var aizņemt vairāk nekā divas minūtes smalkā šūnā. Tā pārbaudīta pret rokas gadījumiem un V veida baseinu, bet vēl nav pārbaudīta uz reāla vertikāli plānota objekta.
- **Adrese objektam.** Tā nolasa atvērtus datu failus, ko atnesat, un testēta tikai uz mūsu pašu failiem. Koki nav avots. Avotu iegūšana jūsu vietā gaida privātuma formulējumu.
- **Progress no uzmērījumiem.** Testēts tikai uz izdomātiem uzmērījumiem. Progress uz lapām un atzīmēm (MarkupCraft) un skenēšana pret modeli (BimCraft) nav izveidota.
- **Augsnes un nogāzes.** Tikai apļveida virsmas: nav lēkšanas vai bloku meklēšanas un nav sprieguma plaisas.
- **Krustojumi.** Viens rādiuss katram zaram, nav kravas automašīnu nobraukuma ceļu, un tie vēl nenonāk koridorā.
- **Lauka faili.** Lasītāji rakstīti pēc publiskiem formāta aprakstiem un izmēģināti uz failiem, ko mēs izveidojām. Vajadzīgi reāli instrumentu faili.
- **Saites un dzelzceļš.** Radio saites: tikai brīvās telpas zudums un daudzceļu (nav lietus izgaismošanas vai antenu diagrammu), un nav dzelzceļa standarta: katra dzelzceļa robeža ir vietturis ar melnraksta skaitļiem, ko neviens dzelzceļa inženieris nav pārbaudījis.
- **Windows un macOS.** 0.8 nav koda parakstīta. Windows var brīdināt, un macOS prasa peles labo pogu, tad Atvērt.

Viss pārējais ir sadaļā [Vēl nav izveidots](topic:not-built-yet). Iepriekšējai versijai skatiet [Jaunumi 0.7 versijā](topic:whats-new-0-7).
