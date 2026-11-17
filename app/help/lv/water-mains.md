---
title: Ūdensvadi: spiedieni, plūsmas un ugunsdzēsības plūsma
summary: Zīmējiet spiediena tīklu no mezglu, rezervuāru, tvertņu, cauruļu, sūkņu un spiediena reducēšanas vārstu plānā; CivilCraft aprēķina augstumus, spiedienus un plūsmas (Hazen–Williams, cilpveida tīkli), ugunsdzēsībai pieejamo plūsmu un dienas patēriņu. Laboratorijas funkcija; katrs rezultāts prasa inženiera pārbaudi.
keywords: ūdens, ūdensvads, ūdens sadale, spiediena tīkls, spiediena caurule, cilpveida tīkls, hazen-williams, C koeficients, galvas zudums, atlikušais spiediens, ugunsdzēsības plūsma, hidrants, patēriņš, mezgls, rezervuārs, tvertne, sūknis, sūkņa līkne, spiediena reducēšanas vārsts, prv, pretvārsts, pagarinātais periods, epanet, inp, ātrums
from: df46bf6d
---

Ūdensvadi ir tās vietnes spiediena puse: caurules, kas vienmēr ir pilnas, un ūdens tiek virzīts ar rezervuāra, tvertnes vai sūkņa palīdzību. CivilCraft aprēķina augstumu un spiedienu katrā mezglā un plūsmu katrā caurulē, arī cilpveida tīkliem, kur ūdenim ir vairāk nekā viens ceļš. Tas ir laboratorijā, kamēr to pārbauda.

**Tikai aprēķinu palīglīdzeklis.** Katrs skaitlis prasa kvalificēta inženiera pārbaudi: rezultāts ir tikai tik labs, cik labi ir dati par patēriņu, augstumiem, cauruļu izmēriem un raupjuma vērtībām, un stacionārs modelis neko nezina par ūdens triecienu, ūdens kvalitāti vai ugunsdzēsības sūkņa reālo darbību.

## Zīmējiet tīklu

1. Sadaļā **Virsma** › {{ui:Vairāk}} izvēlieties {{ui:Ūdensvadi…}}. Logs paliek atvērts, kamēr strādājat ar plānu.
2. Izvēlieties {{ui:Rezervuārs}} un noklikšķiniet plānā, kur ir padeve. Tā augstums sākas 100 ft (30 m) virs zemes; mainiet to rekvizītos.
3. Izvēlieties {{ui:Mezgls}} un noklikšķiniet katrā vietā, kur ūdens tiek ņemts vai kur saiet caurules. Mezgls savu augstumu ņem no zemes; ierakstiet citu rekvizītos, lai to pārrakstītu.
4. Izvēlieties {{ui:Caurule}}, noklikšķiniet uz viena mezgla un tad uz mezgla, ar kuru tas savienojas. Rīks paliek ieslēgts nākamajai caurulei. {{ui:Sūknis}} un {{ui:Spiediena reducēšanas vārsts}} tiek zīmēti tāpat: no sūkšanas (vai augšplūsmas) mezgla uz piegādes (vai lejplūsmas) mezglu. {{ui:Tvertne}} tiek novietota kā mezgls.
5. Atlasiet mezglu un ierakstiet tā {{ui:Patēriņš}} (gpm vai L/s metru projektā). Atlasiet cauruli un iestatiet tās {{ui:Diametrs}} (in vai mm) un, ja zināt, tās Hazen–Williams C.

Katra izmaiņa ir viens atsaukšanas solis. Delete noņem mezglu un caurules, kas tajā beidzas.

## Ko nozīmē katra daļa

- **Caurule.** Garums tiek mērīts pa plānu, ja vien neierakstāt pats. C ir Hazen–Williams raupjums (sākumā 130; noklusējumu var mainīt logā). Vietējo zudumu koeficients K pievieno līkumu un savienojumu zudumus. Atzīmējiet **Pretvārsts** caurulei, kas nedrīkst vest ūdeni atpakaļ; **Slēgta** caurule nevada neko.
- **Rezervuārs.** Avots ar fiksētu galvu: ūdens līmenis, ko tas notur virs atskaites līmeņa. Tas dod vai ņem to, ko tīkls prasa.
- **Tvertne.** Līmenis, kas mainās dienas laikā. Stacionārajos rezultātos tā ir avots pašreizējā līmenī.
- **Sūknis.** Viens projektēšanas punkts (plūsma un galva) dod parasto līkni caur to: galva pie nulles plūsmas ir 133 % no projektētās galvas, un galva ir nulle divreiz lielākā plūsmā nekā projektētā. Sūknis nekad nevirza ūdeni atpakaļ.
- **Spiediena reducēšanas vārsts.** Notur iestatīto spiedienu lejpus, kamēr padeve ir augstāka. Kad padeve ir zemāka, tas ir atvērts un neko nenotur; ja ūdens tecētu atpakaļ, tas aizveras.

## Lasiet rezultātus

Logs rāda katra mezgla galvu un spiedienu un katras saites plūsmu, ātrumu un galvas zudumu uz 1,000 ft (vai uz km), ar mezgliem krāsotiem plānā: zaļš ir starp jūsu zemāko un augstāko spiedienu, sarkans zem tā, dzeltens virs tā. Plūsmas bultiņas rāda virzienu. Atlasiet mezglu vai cauruli, lai lasītu tās skaitļus rekvizītos.

Zem tabulām ir saraksts ar to, ko pārbaudīt: zems vai augsts spiediens, caurule, kas ir ātrāka par jūsu ierobežojumu, mezgls, kas atvienots no visiem avotiem, vai risinātājs, kas nav nokārtojies. Tās pašas atziņas ir Problēmu panelī. Ierobežojumus iestatiet logā (sākumā 20 psi, 100 psi un 10 ft/s; metru projektā 140 kPa, 700 kPa un 3 m/s).

## Ugunsdzēsības plūsma

{{ui:Ugunsdzēsības plūsma…}} zīmē plūsmu vienā mezglā un parāda tajā esošo spiedienu un zemāko spiedienu jebkurā tīkla vietā. Tas arī atrod plūsmu, kas tajā mezglā ir pieejama, kamēr vājākais tīkla mezgls saglabā jūsu norādīto atlikušo spiedienu. Citi patēriņi paliek kā ir.

## Diena ar patēriņu

{{ui:Diena ar patēriņu…}} palaiž tīklu pa stundām. Norādiet patēriņa shēmu faila iestatījumos (reizinātāju saraksts, kas atkārtojas); tvertnes piepildās un iztukšojas ar ieplūstošo un izplūstošo plūsmu, un sūknis var sekot ieslēgšanas/izslēgšanas shēmai. Tvertne, kas sasniedz savu augstāko vai zemāko līmeni, ir nosaukta sarakstā: CivilCraft neaizver tās ieplūdi vai izplūdi jūsu vietā, tāpēc to lasiet kā "šī tvertne ir pārāk maza vai sūknis pārāk liels".

## EPANET teksts

{{ui:Saglabāt kā EPANET teksta failu (.inp)}} ieraksta tīklu vienkāršā teksta formātā, ko lasa daudzas ūdens programmas, un {{ui:Atvērt EPANET teksta failu (.inp)…}} nolasa vienu. Pārnes tikai to, ko CivilCraft modelē: mezglus, rezervuārus, tvertnes, caurules, sūkņus ar galvas līkni, spiediena reducēšanas vārstus, patēriņa shēmas un laikus. Citi vārstu tipi, sūkņi, kas doti pēc jaudas, un citas galvas zuduma formulas tiek nosauktas un izlaistas. Failam jāizmanto tās pašas mērvienības kā projektam.

## Hidranti, vārsti un savienojumi

Atlasiet mezglu un atzīmējiet **Hidrants**, lai tur ievietotu vienu; atlasiet maģistrāli un nospiediet **Pievienot vidū**, lai uz tās ievietotu vārstu, gaisa vārstu, izlaidi vai skaitītāju. Tie ir tīkla objekti: tie pārvietojas kopā ar to, un viens atsaukšanas solis tos noņem.

Izkārtojums arī nozīmē savienojumus, un CivilCraft tos uzskaita bez lūguma: **tee** (T-savienojums), kur saiet trīs maģistrāles, **cross** (krustveida savienojums), kur saiet četras, **bend** (līkums ar leņķi), kur divas maģistrāles pagriežas par 5° vai vairāk, **reducer** (reducētājs), kur saiet divi izmēri, un **cap** (noslēgs strupceļā). {{ui:Detaļu specifikācija (CSV)}} saskaita tos un maģistrāles pēc izmēra. Tas ir tas, ko nozīmē izkārtojums: apjomu aprēķins, ko pārbaudīt pret saviem detaļu rasējumiem, nevis saraksts, ko pasūtīt.

Maģistrāles tiek novietotas zemes līmenī mīnus segums (4 ft vai 1.2 m), lai tās varētu uzzīmēt un modelēt 3D; iepriekš minētie spiedieni nekad no tā nav atkarīgi.

## Plānā un failos

Plāns, PDF un DWG vai DXF nes maģistrāles uz **C-WATR-MAIN** ar to izmēriem uz **C-WATR-TEXT**, hidrantus uz **C-WATR-HYDR**, vārstus uz **C-WATR-VALV** un savienojumus uz **C-WATR-FITT**. LandXML eksportā raksta ūdens cauruļu tīklu (konstrukcija katram mezglam, caurule katrai maģistrālei, nosaukti hidranti); LandXML importā to nolasa atpakaļ kā ūdensvadus, bez patēriņiem, sūkņiem vai vārstiem, ko LandXML nenes. IFC eksportā maģistrāles raksta kā cauruļu segmentus, hidrantus, vārstus un savienojumus vienā ūdens sistēmā. Šie faili ir pārbaudīti ar mūsu pašu lasītājiem un rakstītājiem; izmēģiniet tos citās savās programmās un pastāstiet mums, ko tās saka.

## Kas vēl nav šeit

Ūdens kvalitāte un vecums, vadība un noteikumi, kas iet pāri sūkņa ieslēgšanas/izslēgšanas shēmai, citi vārstu tipi, patēriņš atkarībā no spiediena, caurules ar mainīgu diametru un kanalizācijas plūsmas laika gaitā. Skatiet [Vēl nav izveidots](topic:not-built-yet). Sanitārās projektēšanas plūsmas, kas ir cits aprēķins, ir aprakstītas sadaļā [Sanitārās projektēšanas plūsmas](topic:sanitary-design).
