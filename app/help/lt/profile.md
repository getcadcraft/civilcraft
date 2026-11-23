---
title: Vertikaliojo profilio projektavimas
summary: Atidarykite profilio rodinį, pradėkite projektinį profilį nuo grunto, pridėkite ir tempkite PVI, nustatykite vertikaliųjų kreivių ilgius ir skaitykite nuolydžius, K reikšmes bei aukščiausius ir žemiausius taškus.
keywords: profilis, vertikalioji trasa, pvi, vertikalioji kreivė, nuolydis, k reikšmė, kalnagūbris, įdubimas, bvc, evc, profilio rodinys, projektinis profilis, esamo grunto profilis, charakteristinės linijos profilyje, kirtimasis, projekcija, bordiūras, griovys, žymos
from: dbb1f32d
---

Kiekviena trasa turi vieną projektinį profilį: PVI sąrašą (stacionažas ir aukštis), sujungtą tiesiais nuolydžiais, o kiekviename vidiniame PVI, kuris turi ilgį, – simetrinę parabolinę vertikaliąją kreivę. Esamo grunto profilis paimamas iš paviršiaus automatiškai.

## Atidarykite profilio rodinį

1. Pasirinkite trasą (spustelėkite ją su {{ui:Pasirinkti}}).
2. Paspauskite {{key:R}}, spustelėkite {{ui:Profilis}} įrankių juostoje arba {{ui:Profilio vaizdas}} dešiniojo skydelio apačioje.
   Po planu atsidaro profilio rodinys su esamu gruntu palei trasą. Jei yra dvi ar daugiau trasų, pasirinkite vieną sąraše profilio juostos kairėje.

Rodinys pradžioje rodo visą trasą ir ištempia aukščius, kad užpildytų skydelį; išdidinimas nurodytas apatiniame kairiajame kampe, pavyzdžiui: „Vertikalus išdidinimas 10×“.

## Profilio keitimas mastelį ir slinkimas

- **Mastelis:** sukite pelės ratuką (arba suspauskite jutiklinėje dangoje) – rodinys keičia mastelį apie žymeklį. Laikykite {{key:Shift}}, kad keistumėte tik stacionažus, arba {{key:Alt}}, kad keistumėte tik aukščius (tai keičia išdidinimą). Kai profilio rodinys aktyvus, pliuso ir minuso klavišai keičia mastelį apie vidurį.
- **Slinkimas:** tempkite dešiniuoju arba vidurine pelės mygtuku arba perbraukite dviem pirštais jutiklinėje dangoje.
- **Pritaikyti:** du kartus spustelėkite profilį arba paspauskite {{key:F}}, kad vėl matytumėte visą trasą.

Redaguojant PVI išlieka jūsų pasirinktas mastelis; rodinys neperšoka atgal į pritaikymą.

Judinkite žymeklį palei profilį: juosta rodo stacionažą, esamo grunto ir projekto aukščius, nuolydį bei iškasą ar įpylimą toje vietoje, o taškas seka trasą plane.

## Pradėkite projektinį profilį

1. Dešiniajame skydelyje, skiltyje **Projektinis profilis**, spustelėkite {{ui:Pradėti nuo grunto}}.
   Du PVI padedami ant grunto abiejuose trasos galuose ir sujungiami vienu tiesiu nuolydžiu. Būsenos juostoje rašoma: „Projektinis profilis pradėtas nuo grunto abiejuose galuose. Įjunkite Pridėti PVI ir spustelėkite, kad pridėtumėte nuolydžio lūžius; lentelėje nurodykite jiems kreivės ilgį.“

Jei trasa nekerta paviršiaus, gausite: „Po šia trasa nėra grunto, nuo kurio galima pradėti.“ Tada pridėkite PVI spustelėdami (kitas skyrius).

## Pridėkite PVI

1. Paspauskite {{key:I}} arba spustelėkite {{ui:Pridėti PVI}} profilio juostoje. Mygtukas lieka nuspaustas.
2. Spustelėkite profilyje ten, kur norite nuolydžio lūžio. PVI pridedamas tame stacionaže ir aukštyje, suapvalintas iki 0.01, ir pažymimas.
3. Pridėkite tiek, kiek reikia, tada dar kartą paspauskite {{key:I}}, kad baigtumėte pridėjimą.

Spustelėjimas ten, kur jau yra PVI, atmetamas („Ten jau yra PVI ties …“). PVI visada lieka stacionažų tvarka.

## Prisitraukimas pridedant ar tempiant

Mygtukas **Prisitraukti** profilio juostoje pradžioje įjungtas. Kol jis įjungtas, pridedamas ar tempiamas PVI nusileidžia ant artimiausio PVI, grunto taško, PVI stacionažo ar grunto linijos, o šalia žymeklio esanti žymė nurodo, kurio. Laisvam taškui bet kur laikykite {{key:Alt}}.

## Koreguokite PVI

- **Tempkite** PVI profilyje, kad jį perkeltumėte. Jis negali peržengti savo kaimynų. Perkėlimas – vienas anuliavimo žingsnis.
- **Įveskite** tikslias reikšmes PVI lentelėje dešiniajame skydelyje: **Stacionažas**, **Aukštis**, **Nuolydis %** ir **Kreivės L** (vertikaliosios kreivės ilgis). Po kiekvienos paspauskite {{key:Enter}}.
- **Pasirinkite** reikšmę iš profilio: mažas mygtukas šalia PVI stacionažo ar aukščio laukia vieno spustelėjimo profilio rodinyje ir įrašo tą reikšmę. Spustelėjimas prisitraukia kaip Pridėti PVI; laisvam taškui laikykite {{key:Alt}}; {{key:Esc}} atšaukia.
- **Nuolydis %** yra liestinės, prasidedančios tame PVI ir einančios iki kito, nuolydis. Jį įvedus perkeliamas **kito** PVI aukštis (jo stacionažas niekada nejuda). Jei kitas PVI užrakintas, vietoj to perkeliamas ankstesnio PVI aukštis.
- **Užrakinkite** PVI spyna savo eilutės gale. Užrakinto PVI nevelkama, o nuolydžio redagavimas jo nejuda. Jei abu liestinės galai užrakinti, jos nuolydis negali keistis: apie tai pranešama būsenos juostoje, ir pirmiausia atrakinkite vieną galą. Užraktas išsaugomas faile.
- **Pašalinkite** PVI su x savo eilutės gale arba pažymėkite jį (spustelėkite) ir paspauskite {{key:Delete}}. Kai profilio rodinys aktyvus, {{key:Backspace}} irgi jį pašalina.

Pirmasis ir paskutinis PVI niekada negauna kreivės.

## Vertikaliosios kreivės

1. Įveskite ilgį lauke **Kreivės L** vidiniam PVI, pavyzdžiui 200.
2. Kreivė braižoma centruota PVI atžvilgiu. Profilis ir dešinysis skydelis rodo jos tipą (kalnagūbris ar įdubimas), L ir K, BVC ir EVC stacionažus bei aukščius, o jei kreivės viduje yra aukščiausias ar žemiausias taškas – ir jį.

K apskaičiuojamas iš L (K = L padalytas iš nuolydžių algebrinio skirtumo procentais). Įvedate L; K tiesiogiai įvesti dar negalima.

Jei vertikalioji kreivė netelpa, raudonas langelis nurodo priežastį: ji užeina ant ankstesnio PVI ar kreivės arba peržengia kitą PVI, ir nurodo, kiek vietos yra toje pusėje (kreivei reikia pusės ilgio kiekvienoje savo PVI pusėje). Jos mygtukas nustato **ilgiausią tinkančią kreivę** su jos K kaip vieną žingsnį ({{key:Mod+Z}} jį anuliuoja). Arba nutolinkite PVI.

## Skaitykite faktus

Po PVI lentele sąrašas pateikia kiekvieną nuolydį procentais („Nuolydis 1: +1.25%“) ir kiekvieną kreivę, pavyzdžiui „Kalnagūbris ties 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, tada „Aukščiausias taškas 1+62.40, 254.12“.

Jei PVI nepasiekia abiejų trasos galų, pastaboje tai nurodoma. Koridorius sukuriamas tik ten, kur profilis ir trasa sutampa.

## Charakteristinės linijos profilyje

Charakteristinės linijos taip pat rodomos profilio rodinyje, todėl galite matyti bordiūrą, griovį ar sienos viršų kelio profilio atžvilgiu.

- Ten, kur charakteristinė linija **kerta** trasą, profilyje tame stacionaže ir aukštyje rodomas mažas rombas, pažymėtas linijos pavadinimu ir jos aukščiu toje vietoje (paties linijos aukštis, apskaičiuotas kertančiame segmente).
- Įveskite atstumą lauke {{ui:Šalia, ne toliau kaip}}, kad taip pat būtų braižomos charakteristinės linijos, kurios **eina šalia** trasos per tą atstumą, kaip brūkšninės linijos jų pačių aukščiuose. Tuščias arba 0 rodo tik kirtimus.
- Žymos ir žymės seka kiekvieną pakeitimą: perkelkite viršūnę, įveskite nuolydį ar pakelkite liniją – ir profilis iš karto rodo naujus aukščius.
- Spustelėkite kirtimo rombą, kad pažymėtumėte tą charakteristinę liniją; pažymėta linija braižoma paryškinimo spalva.
- {{ui:Charakteristinės linijos}} profilio juostoje paslepia arba parodo visas. Abu nustatymai išsaugomi kartu su projektu.

Žr. [Charakteristinės linijos](topic:feature-lines).

## Toliau

- [Kelio koridorius išilgai trasos](topic:corridor) palei šią trasą ir šį profilį.
- Profilis įrašomas į LandXML kartu su trasa; žr. [Keistis LandXML](topic:landxml).
