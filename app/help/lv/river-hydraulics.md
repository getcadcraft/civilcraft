---
title: Upju ūdens virsmas profili
summary: Modelējiet upi pēc zemes virsmas un aprēķiniet stacionārus ūdens virsmas profilus ar standarta soļu metodi: ūdens līmeņi, enerģija, ātrumi, Frūda skaitļi un plūdu apjoms plānā. Laboratorijas funkcija; katrs rezultāts prasa inženiera pārskatīšanu.
keywords: aizsargdambis, neefektīvā plūsmas zona, griezumu redaktors, upe, hidraulika, ūdens virsmas profils, atpakaļplūsma, standarta soļi, stacionāra plūsma, 1d, šķērsgriezumi, manninga, raupjums, caurlaidspēja, kritiskais dziļums, normālais dziļums, frūda, enerģijas līnija, plūdu apjoms, plūdu teritorija, applūšana, krastu punkti, posmu garumi, sašaurinājums, paplašinājums, subkritiska, superkritiska, jaukts režīms, hidrauliskais lēciens
from: fb8bf425
---

CivilCraft aprēķina stacionārus, vienas dimensijas ūdens virsmas profilus gar upi: katrai ievadītajai plūsmai ūdens līmeni katrā šķērsgriezumā, no enerģijas bilances starp blakus esošiem griezumiem (standarta soļu metode). Tā ir laboratorijā, kamēr to pārbauda.

**Tikai projektēšanas palīglīdzeklis.** Ūdens līmeņi prasa kvalificēta inženiera pārskatīšanu, pirms uz tiem paļaujas: 1D modelis ir tikpat labs, cik tā griezumi, raupjuma vērtības, posmu garumi un robežas, un tas nezina par tiltiem, caurtekām vai plūsmu, kas iziet no upes.

## Uzzīmēt upi

1. Vispirms izveidojiet esošās zemes virsmu (punkti, lūzumlīnijas vai TIN, ko atvērāt).
2. Zem **Virsma** › {{ui:Vairāk}} izvēlieties {{ui:Upe}}.
3. Noklikšķiniet gar upes centrālo līniju **no augšteces uz lejteci**, tad nospiediet {{key:Enter}} vai veiciet dubultklikšķi.

CivilCraft nogriež griezumu perpendikulāri centrālajai līnijai ik pēc 50 m (200 ft), 100 m (300 ft) katrā pusē no zemes. Upes pikšeti tiek mērīti no lejtecēs gala, tāpēc tie pieaug augštecē. Krasti sākotnēji ir minējums 10 m (30 ft) katrā pusē no katra griezuma zemākā punkta.

Lai pievienotu griezumu vietā, kur upe sašaurinās vai atrodas būve, atlasiet upi, noklikšķiniet {{ui:Pievienot griezumu}} un novelciet griezuma līniju pāri tai (jebkurā virzienā: tā tiek pagriezta, lai skatoties pa straumi, iet no kreisās uz labo).

## Iestatīt upi

Atlasiet upi, lai redzētu to **Rekvizītos**:

- **Plūsmas režīms**: subkritisks (parastais: aprēķina augšpus no lejupes robežas), superkritisks (aprēķina lejpus no augšpus robežas) vai jaukts (abi, tad tas, kuram katrā griezumā lielāks īpatnējais spēks; priekšskatījums).
- **Plūsmas profili**: nosaukums un plūsma katram (piemēram, 10 gadu un 100 gadu plūsma) un robeža lejtecē (un augštecē, kad režīms nav subkritisks): **Normālais dziļums** ar enerģijas slīpumu (gultnes slīpums ir pirmais minējums), **Zināma ūdens virsmas** augstuma atzīme vai **Kritiskais dziļums**.
- **Griezumi no zemes**: attālums, cik tālu pa kreisi un pa labi, krastu minējums un abas Manninga n vērtības; {{ui:Griezt griezumus no jauna}} aizstāj griezumus (viens solis atpakaļ).
- **Griezumu tabula**: katram griezumam kreisā un labā krasta nobīdes, gultnes n un palienes n, posmu garumi līdz nākamajam griezumam lejtecē (kreisā palienes, gultnes, labā palienes; mērīti no plāna, sākot ar to) un sašaurinājuma un paplašinājuma koeficienti (sākumā 0.1 un 0.3: pakāpeniskas pārejas). {{ui:Rediģēšana}} atver griezumu redaktoru (nākamais); punkts aiz tā nozīmē, ka griezumam ir aizsargdambis vai neefektīva zona.

Katra izmaiņa ir viens solis atpakaļ ({{key:Mod+Z}}).

## Griezuma rediģēšana: krasti, aizsargdambji un neefektīvas zonas

{{ui:Rediģēšana}} uz griezuma zīmē tā zemi un ļauj vilkt to, ko lasa risinātājs: **kreiso un labo krastu** (tie sadala griezumu kreisajā palienē, galvenajā gultnē un labajā palienē), **aizsargdambi** katrā pusē un **neefektīvās plūsmas zonas**. Katru rokturi var pārvietot arī ar bultiņu taustiņiem, un katru skaitli var ierakstīt blakus grafikam. {{ui:Lietot}} ir viens solis atpakaļ.

- **Aizsargdambim** ir vieta (nobīde) un virsotnes augstuma atzīme. Zeme aiz tā, prom no upes, tiek atdalīta no upes, kamēr ūdens virsma ir zem virsotnes: tās laukums, samērotais perimetrs un caurlaidspēja netiek ieskaitīti. Virs virsotnes viss griezums atkal ir ieskaitīts. Aizsargdambis stāv ārpus krasta, ko tas aizsargā; ja tas atrodas krastu iekšpusē, tas tiek atzīmēts.
- **Neefektīvā plūsmas zona** patur ūdeni, bet nenes plūsmu (dīķis aiz uzbēruma, nekustīgs ūdens blakus tilta piebraucamajam ceļam). Norādiet tās divas nobīdes un, ja vēlaties, ūdens līmeni, zem kura tā ir neefektīva ({{ui:vienmēr}}, ja tukšs): virs šī līmeņa tā tek kā pārējā. Tā, kas pārklāj daļu no galvenās gultnes, tiek atzīmēta.
- Starp diviem griezumiem plūdu apjoms atstāj sausu zemi aiz aizsargdambja, ko abi griezumi, kamēr ūdens virsma tur ir zem virsotnes (līnija starp abām virsotnēm ir taisna).

## Aprēķināt un lasīt rezultātus

Noklikšķiniet {{ui:Ūdens virsmas profili}}. Izvēlētajam profilam iegūsiet:

- **grafiku** gar upi (plūsma no kreisās uz labo): gultnes dibens, krasti, ūdens virsma, enerģijas līnija un kritiskā ūdens virsma; griezumi, kas turēti kritiskajā dziļumā, ir apvilkti;
- **tabulu** katram griezumam: upes pikšets, plūsma, gultnes dibens, ūdens virsma, kritiskā ūdens virsma, enerģijas līnija, dziļums, ātrums gultnē un kopumā, gultnes Frūda skaitlis, plūsmas laukums, augšējais platums, plūsma katrā palienē un gultnē, enerģijas slīpums un brīdinājumi;
- **brīdinājumus** vienkāršos vārdos, piemēram, griezums iestatīts uz kritisko dziļumu, ūdens virs griezuma galiem vai liela caurlaidspējas izmaiņa starp diviem griezumiem (pievienojiet starp tiem griezumus).

{{ui:Tabula (CSV)}}, {{ui:Atskaite}} (vienkāršs teksts ar metodi, robežām un katru tabulu) un {{ui:Grafiks (SVG)}} saglabā lejupielādēs. Katrā ir pārskatīšanas rindiņa.

Atzīmējiet {{ui:Rādīt plūdu apjomu}} **Rekvizītos**, lai plānā nokrāsotu mitro zonu izvēlētajam profilam, ar ūdenslīniju, kas novilkta tur, kur dziļums ir nulle. Starp griezumiem ūdens virsma ir līmeniska pāri upei un mainās lineāri ar upes pikšetu. Zeme aiz aizsargdambja paliek sausa, kamēr ūdens ir zem tā virsotnes. Cita zema zeme upes koridora iekšienē, ko ūdens nevar sasniegt (piemēram, aiz ceļa uzbēruma), joprojām tiek nokrāsota: pārbaudiet to.

## Zīmējumā un Problēmās

Upes līnijas nonāk plānā, PDF un DWG savos slāņos: **C-WATR-CNTR** (centrālā līnija), **C-WATR-SCTN** (katra griezuma līnija ar tās upes pikšetu) un **C-WATR-FLOD** (plūdu apjoma ūdenslīnija, kad {{ui:Rādīt plūdu apjomu}} ir atzīmēts profilam). Upes brīdinājumi (griezums iestatīts uz kritisko dziļumu, ūdens virs griezuma galiem, caurlaidspējas izmaiņa, kas prasa vairāk griezumu, enerģijas bilance, kas nav aizvērusies, aizsargdambis krastu iekšpusē) arī nonāk **Problēmu** panelī, saistīti ar upi un novietoti pie griezuma, no kura tie nāk.

## Kā tas tiek aprēķināts

- Enerģija starp diviem griezumiem: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Caurlaidspēja pēc apakšdalījuma: katra palienes daļa ir sadalīta vietā, kur mainās tās n, K = Σ (1/n)·A·R^(2/3) (1.486/n ASV vienībās); gultne ir viens gabals ar saliktu n, kad tās n mainās. α nāk no tā, kā sadalīta caurlaidspēja.
- Berzes slīpums pēc vidējās caurlaidspējas, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², pār plūsmas svērto posma garumu.
- Sašaurinājuma koeficients, kad plūsma lejtecē paātrinās, paplašinājuma, kad tā palēninās.
- Kritiskais dziļums = mazākā īpatnējā enerģija. Katrs ūdens līmenis tiek atrisināts intervālā, tāpēc tas nekad nelec uz nepareizo pusi no kritiskā; kad atbildes nav, tas tiek iestatīts uz kritisko dziļumu un atzīmēts.

Programma ir pārbaudīta pret Manninga normālo dziļumu, kritisko dziļumu taisnstūra gultnē un Čova pretplūsmas piemēru (*Open-Channel Hydraulics*, 1959, 10. nodaļa), kas integrēts neatkarīgi. Tā pati metode tiek izmantota parastajās 1D upju programmās, tāpēc roku aprēķins vai studenta piezīmes sakrīt.

## Caurtekas un tilti

Upes **Rekvizītos**, zem **Caurtekas un tilti**, {{ui:Pievienot caurteku}} vai {{ui:Pievienot tiltu}} ieliek vienu starp diviem griezumiem (katrs posms paliek vismaz ar diviem). Profils zem tās nemainās; ūdens virsma tieši augšpus tās nāk no būves, un profils turpinās augštecē no turienes. **Rezultāti** pievieno katras būves tabulu: pakājes ūdens līmeni, galvas ūdens līmeni, kura vadība nosaka, plūsmu caur atveri un plūsmu pāri ceļam vai klājumam. Tikai subkritiskai plūsmai.

- **Caurteka** (kaste vai apaļa, viena vai vairākas vienādas caurules). Ieejas vadība ir pārplūdes plūsma, kamēr ieeja ir brīva, un atveres plūsma, kad tā ir applūdusi, sajaukta starp galvas ūdens līmeni no viena līdz pusotram augstumiem. Izejas vadība ir enerģijas bilance: ieejas zudums, berze un izejas ātruma augstums, pār augstāko no pakājes un kritiskā dziļuma vidus augstuma un virsotnes, mazāks kritums pa caurules garumu. Galvas ūdens līmenis ir lielākais no abiem. Atzīmējiet **Ūdens var pāriet pāri ceļam**, un ceļa pārplūdes plūsma dalās ar caurulēm.
- **Tilts.** Atvere ir griezums zem tilta, nogriezts pie balstiem, ar katru balstu kā laukumu bez plūsmas. Ūdens virsma atverē nāk no griezuma zem (paplašināšanās koeficients), un griezums virs no atveres (sašaurināšanās koeficients). Ja atvere nespēj izlaist plūsmu pie šīs pakājes ūdens līmeņa, tā darbojas kritiskajā dziļumā un tilts tiek atzīmēts kā aizsērējis. Ja ūdens sasniedz zemo šķērsbalku, plūsma ir spiedienplūsma (služu tipa, kamēr pakājes ūdens ir zem zemā šķērsbalka, applūdusi virs tā), un ūdens pāri klājumam pievieno pārplūdes plūsmu; augšējais līmenis ir tas, kurā tie summējas līdz plūsmai.

Koeficienti (izplūde, ieejas zudums, pārplūde) ir apaļi noklusējuma skaitļi. Mainiet tos savam projektam. Tie nav pielāgotās diagrammas, ko drukā caurteku projektēšanas rokasgrāmatas, tāpēc caurtekas galvas ūdens līmeni tuvu tās robežai uzskatiet par aptuvenu vērtību. Ūdens pār ceļu vai klājumu, applūdusi ieeja, aizsērējusi atvere un ātra plūsma caurulē tiek rādīta **Problēmās**.

## Nestacionāra plūsma

{{ui:Nestacionāra plūsma…}} upes **Rekvizītos** nodod plūdu hidrogrāfu pa griezumiem. Ievadiet pieplūdi kā stundas un plūsmas, pa vienam pārim katrā rindā, lejtecēs slīpumu (normālais dziļums) un cik ilgi darbināt. Tas sākas no stacionārās ūdens virsmas pirmajā plūsmā un atrisina pilnos vienas dimensijas vienādojumus (implicītā četrpunktu shēma ar svaru 0.6 laikā). Jūs iegūstat maksimālo ūdens līmeni un plūsmu katrā griezumā ar stundu, kad katrs notiek, grafiku plūsmai abos galos un tilpuma pārbaudi (iekšā, ārā un uzkrātā izmaiņa). Tā tiek pārbaudīta: stacionāra plūsma paliek stacionāra, pieplūdes solis beidzas jaunās plūsmas stacionārajā profilā, tilpums aizveras un plūdu viļņa ātrums salīdzināts ar kinemātisko vilni. Subkritiska plūsma, viens posms, bez sānu pieplūdes un bez caurtekām vai tiltiem darbības laikā.

## Savienojumi

Posmi, kas saplūst vienā izejā: plūsmas summējas, un ūdens virsma posma sākumā lejtecē tiek pārnesta uz to posmu galiem, kas tam pievienojas (tā pati ūdens virsma savienojumā, vienkāršā metode: bez leņķa, bez impulsa, tāpēc tā der zemiem Frūda skaitļiem). Modelis un testi ir gatavi (`river-structures.js`); panelis divu upju savienošanai plānā vēl nav izveidots.

## Vēl nav izveidots

Aizsprosti un vārti kā atsevišķas būves, savienojumu panelis, būves nestacionārā aprēķinā un superkritiska nestacionāra plūsma. Jaukta režīma aprēķins atzīmē hidraulisku lēcienu starp diviem griezumiem, bet to nenovieto.

**Kur upes saplūst.** Upes Rekvizītos lauks "Ieplūst" nosauc upi, kurā tā ieplūst. Upes, kas saplūst, tiek atrisinātas kopā: upe, kurā tās ieplūst, nes to plūsmu summu, un katra no tām beidzas pie tās upes pirmā griezuma ūdens virsmas (vienlīdzīgas ūdens virsmas metode; tā neņem vērā plūsmu leņķus un impulsu). Lai savienotu galveno upi un strautu, novelciet īsu upi zem savienojuma un ļaujiet abām ieplūst tajā. Rezultāti rāda savienojuma tabulu. Šo rezultātu noklusējuma vērtības (sašaurinājums 0.1, paplašinājums 0.3, viena gabala gultne ar saliktu raupjumu, jauktais režīms pēc īpatnējā spēka) paliek, līdz inženieris tās pārskata, un rezultāti to saka.
