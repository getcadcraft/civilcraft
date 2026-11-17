---
title: "Įvesti poligoninę eigą ir ją išlyginti kompaso taisykle"
summary: "Įveskite lauko kampus arba rumbus ir atstumus, patikrinkite kampinį ir linijinį uždarymą bei tikslumą, išlyginkite kompaso taisykle ir įtraukite stotis kaip geodezinius taškus, o ciklą – kaip sklypą."
keywords: "poligoninė eiga, uždara eiga, ciklas, kampai dešinėn, atgalinis taškas, rumbai, atstumai, uždarymas, nesutapimas, tikslumas, kompaso taisyklė, bowditch, išlyginimas, geodezija"
from: 56ce5a8c
---

Poligoninė eiga – tai matuotų atkarpų seka: kiekvienoje stotyje nurodomas kampas (arba rumbas) ir atstumas iki kitos stoties. Kai nieko nepasirinkta, dešiniajame skydelyje spustelėkite **Įvesti poligoninę eigą**, esančią po **Poligoninė eiga**.

## Kur ji prasideda ir baigiasi

1. **Pradžia geodeziniame taške**: jo numeris. Arba įveskite šiaurinę ir rytinę koordinates.
2. **Atkarpos kaip**: **Kampai dešinėn ir atstumai** arba **Rumbai ir atstumai**.
3. Kai naudojami kampai, nurodykite, nuo ko jie skaičiuojami: **Atgalinis geodezinis taškas** arba **jo azimutas** (nuo pirmos stoties link atgalinio taško, pagal laikrodžio rodyklę nuo šiaurės).
4. **Baigiasi**: **grįžtant į pradžią (ciklas)** arba **ties geodeziniu tašku** ir jo numeriu (atvira eiga tarp žinomų taškų).

## Įveskite atkarpas

Viena atkarpa – viena eilutė: pirma kampas, tada atstumas, ir, jei norite, stoties, į kurią ji veda, pavadinimas:

- Kampai dešinėn, skaičiuojami pagal laikrodžio rodyklę stotyje, iš kurios atkarpa išeina, nuo ankstesnės stoties į kitą: `270°00'10" 125.50 B`. Tinka ir `270-00-10`, `270 00 10` bei `270.0028`.
- Rumbai: `N 45°30'15" E 125.50 B`, arba azimutas vienu žodžiu: `AZ 45-30-15 125.50 B`.
- Cikle su kampais baikite žodžiu `close` ir vėl įveskite kampą pradžios stotyje, sukamą nuo paskutinės stoties į antrąją: `close 270°00'05"`. Būtent pagal jį tikrinami kampai.

Eilutės, kurių nepavyksta perskaityti, išvardijamos su eilučių numeriais. Žodis „feet“, kableliai ir `#` komentarų eilutės leidžiami.

## Įvertinkite uždarymą

Rašant langas rodo:

- **Kampinis nesutapimas**: kiek kampai nesutampa su uždarymu ir kiek tenka kiekvienam kampui. Be uždarymo kampo kampai netikrinami, o jų klaidos atsispindi linijiniame nesutapime.
- **Linijinis nesutapimas**: kiek eiga baigiasi nuo vietos, kur turėtų baigtis, ir kryptis.
- **Tikslumas**: eigos ilgis, padalytas iš linijinio nesutapimo: 1 : 10,000 reiškia 1 ft per 10,000 ft.
- Stotys po išlyginimo ir kiek kiekviena pajudėjo.

## Išlyginimas

Pirmiausia kampinis nesutapimas paskirstomas po lygiai tarp kampų. Tada linijinis nesutapimas paskirstomas per atkarpas kompaso taisykle (Bowditch): kiekviena stotis pasislenka priešinga nesutapimui kryptimi proporcingai ilgiui, nukeliautam iki jos, todėl eiga baigiasi tiksliai ten, kur turi.

:::note
Kompaso taisyklė yra standartinis išlyginimas, o ne mažiausių kvadratų metodas, ir ji nesvers kampų su atstumais. Ar tikslumas pakankamas, sprendžiate pagal savo standartus ir jūsų jurisdikcijos reikalavimus.
:::

## Rezultato naudojimas

- **Pridėti kaip geodezinius taškus**: išlygintos stotys tampa geodeziniais taškais su jūsų suteiktais pavadinimais (kitu atveju – kitais laisvais numeriais), aprašymas `TRAV`, be aukščio. Cikle paskutinė stotis yra pradžia, todėl ji nepridedama dukart. Vienas žingsnis: {{key:Mod+Z}} tai anuliuoja.
- **Pridėti kaip sklypą** (ciklams): išlygintos stotys tampa [sklypu](topic:parcels), su jo žymomis ir teisiniu aprašymu.
- **Ataskaita (CSV)**: uždarymo eilutės, o po jų kiekvienos stoties kryptis, atstumas, neišlygintos ir išlygintos koordinatės bei pataisos.
