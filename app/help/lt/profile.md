---
title: Vertikaliojo profilio projektavimas
summary: Atverkite profilio rodinį, pradėkite projektinį profilį nuo žemės, pridėkite ir tempkite PVI, nustatykite vertikaliųjų kreivių ilgius ir skaitykite nuolydžius, K reikšmes bei aukščiausius ir žemiausius taškus.
keywords: profilis, vertikalusis išlygiavimas, pvi, vertikalioji kreivė, nuolydis, k reikšmė, viršūnė, įdubimas, bvc, evc, profilio rodinys, galutinis nuolydis, fg, esamas žemės profilis, charakteristinės linijos profilyje, kirtimai, projektuota, bordiūras, griovys, etiketės
from: e9182bfa
---

Kiekviena trasa turi vieną projektinį profilį: PVI sąrašą (piketas ir aukštis), sujungtą tiesiais nuolydžiais, o kiekviename vidiniame PVI, turinčiame ilgį, yra simetriška parabolinė vertikalioji kreivė. Esamas žemės profilis automatiškai paimamas iš paviršiaus.

## Profilio rodinio atidarymas

1. Pasirinkite trasą (spustelėkite ją su {{ui:Pasirinkti}}).
2. Paspauskite {{key:R}}, arba spustelėkite {{ui:Profilis}} įrankių juostoje, arba {{ui:Profilio vaizdas}} dešiniojo skydelio apačioje.
   Profilio rodinys atsiveria po planu su esama žeme palei trasą. Jei yra dvi ar daugiau trasų, pasirinkite vieną sąraše profilio juostos kairėje.

Rodinys visada rodo visą trasą ir ištempia aukščius, kad užpildytų skydelį; išdidinimas nurodomas apatiniame kairiajame kampe, pavyzdžiui, „Vertikalus išdidinimas 10×“. Jo negalima priartinti ar slinkti.

Perkelkite žymeklį palei profilį: juosta rodo pikietą, žemės ir projektinius aukščius, nuolydį bei iškasą ar įpylimą toje vietoje, o taškas plane seka trasą.

## Projektinio profilio pradžia

1. Dešiniajame skydelyje, po **Projektinis profilis**, spustelėkite {{ui:Pradėti nuo grunto}}.
   Du PVI padedami ant žemės abiejuose trasos galuose ir sujungiami vienu tiesiu nuolydžiu. Būsenos juostoje rašoma „Projektinis profilis pradėtas nuo žemės abiejuose galuose. Įjunkite Pridėti PVI ir spustelėkite, kad pridėtumėte nuolydžio lūžius; lentelėje nurodykite jų kreivės ilgį.“

Jei trasa nekerta paviršiaus, gausite pranešimą „Po šia trasa nėra žemės, nuo kurios galima pradėti.“ Tuomet vietoj to pridėkite PVI spustelėdami (kitas skyrius).

## PVI pridėjimas

1. Paspauskite {{key:I}} arba spustelėkite {{ui:Pridėti PVI}} profilio juostoje. Mygtukas lieka nuspaustas.
2. Spustelėkite profilyje ten, kur norite nuolydžio lūžio. PVI pridedamas tame pikete ir aukštyje, suapvalintas iki 0,01, ir pažymimas.
3. Pridėkite, kiek reikia, tada dar kartą paspauskite {{key:I}}, kad baigtumėte pridėjimą.

Spustelėjimas ten, kur jau yra PVI, atmetamas („Jau yra PVI ties …“). PVI visada lieka pikečių tvarka.

## PVI koregavimas

- **Tempkite** PVI profilyje, kad jį perkeltumėte. Jis negali peržengti savo kaimynų. Perkėlimas yra vienas anuliavimo žingsnis.
- **Įveskite** tikslias reikšmes PVI lentelėje dešiniajame skydelyje: **Piketas**, **Aukštis** ir **Kreivė L** (vertikaliosios kreivės ilgis). Po kiekvienos paspauskite {{key:Enter}}.
- **Pašalinkite** PVI su x eilutės gale arba pažymėkite jį (spustelėkite) ir paspauskite {{key:Delete}}. Kai fokusas yra profilio rodinyje, {{key:Backspace}} irgi jį pašalina.

Pirmasis ir paskutinysis PVI niekada negauna kreivės.

## Vertikaliosios kreivės

1. Vidiniam PVI įveskite ilgį lauke **Kreivė L**, pavyzdžiui, 200.
2. Kreivė braižoma centruota ties PVI. Profilis ir dešinysis skydelis rodo jos tipą (viršūnė arba įdubimas), L ir K, BVC bei EVC pikečius ir aukščius, o kai kreivės viduje yra aukštas ar žemas taškas – jį.

K apskaičiuojamas iš L (K = L dalinamas iš algebrinio nuolydžių skirtumo procentais). Įvedate L; K įvesti tiesiogiai dar negalima.

Jei vertikalioji kreivė netelpa, raudona dėžutė parodo priežastį: ji įsiremia į prieš ją esantį PVI ar kreivę arba peržengia kitą PVI, ir rodo, kiek vietos yra toje pusėje (kreivei reikia pusės savo ilgio kiekvienoje savo PVI pusėje). Jos mygtukas nustato **ilgiausią tinkamą kreivę** kartu su jos K vienu žingsniu ({{key:Mod+Z}} tai anuliuoja). Arba išskirstykite PVI.

## Skaitykite faktus

Po PVI lentele sąrašas pateikia kiekvieną nuolydį procentais („Nuolydis 1: +1.25%“) ir kiekvieną kreivę, pavyzdžiui, „Viršūnė ties 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, o po to „Aukštas taškas 1+62.40, 254.12“.

Jei PVI nepasiekia abiejų trasos galų, pastaba tai nurodo. Koridorius sukuriamas tik ten, kur profilis ir trasa sutampa.

## Charakteristinės linijos profilyje

Charakteristinės linijos taip pat rodomos profilio rodinyje, todėl galite matyti bordiūrą, griovį ar sienos viršų, palyginti su kelio profiliu.

- Kur charakteristinė linija **kerta** trasą, profilyje tame pikete ir aukštyje rodomas mažas rombas su linijos pavadinimu ir jos aukščiu toje vietoje (paties linijos aukštis, apskaičiuotas išilgai kertančio segmento).
- Įveskite atstumą lauke {{ui:Šalia, ne toliau kaip}}, kad taip pat būtų braižomos charakteristinės linijos, kurios **eina šalia** trasos per tą atstumą, brūkšninėmis linijomis jų aukščiuose. Tuščias arba 0 rodo tik kirtimus.
- Žymės ir etiketės seka kiekvieną pakeitimą: perkelkite viršūnę, įveskite nuolydį ar pakelkite liniją, ir profilis iš karto rodo naujus aukščius.
- Spustelėkite kirtimo rombą, kad pasirinktumėte tą charakteristinę liniją; pasirinkta linija braižoma ryškinimo spalva.
- {{ui:Charakteristinės linijos}} profilio juostoje paslepia arba parodo visas. Abu nustatymai įrašomi su projektu.

Žr. [Charakteristinės linijos](topic:feature-lines).

## Toliau

- [Nutiesti kelio koridorių](topic:corridor) palei trasą ir šį profilį.
- Profilis įrašomas į LandXML kartu su trasa; žr. [Keitimasis LandXML](topic:landxml).
