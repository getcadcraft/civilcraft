---
title: Sklypų braižymas ir jų teisiniai aprašai
summary: Nubrėžkite sklypą pagal kampus arba įveskite matmenis iš nuosavybės akto, patikrinkite, kaip gerai matmenys susitinka, pažymėkite kryptis ir atstumus plane, paverskite bet kurią atkarpą lanku ir nukopijuokite juodraštinį teisinį aprašą.
keywords: sklypai, nuosavybės ribos, riba, nuosavybės aktas, kadastro planas, matmenys, kryptis, atstumas, uždarymas, neuždarymas, tikslumas, teisinis aprašas, pradžios taškas, lankas, spindulys, plotas, akrai
from: 6793d6ce
---

Sklypai yra plane, su kryptimi ir atstumu palei kiekvieną tiesią atkarpą (lanko atveju rodomas jo spindulys, ilgis ir centrinis kampas), o pavadinimas ir plotas – viduryje. Jie patenka į PDF brėžinį ir DWG bei DXF eksportus, sluoksniuose `V-PROP` (linijos) ir `V-PROP-TEXT` (žymos). Visa tai rasite skiltyje **Sklypai** dešiniajame skydelyje, kai nieko nepasirinkta.

## Nubrėžti sklypą

1. Spustelėkite **Nubrėžti sklypą**.
2. Spustelėkite kampus, pradėdami nuo pradžios taško. Spustelėjimas netoli geodezinio taško perima tikslią to taško vietą.
3. Spustelėkite pirmąjį kampą dar kartą arba paspauskite {{key:Enter}}, kad baigtumėte. {{key:Backspace}} atšaukia paskutinį kampą; {{key:Esc}} pašalina iki šiol pridėtus kampus; paspauskite jį dar kartą, kad išeitumėte iš įrankio.

## Įvesti matmenis iš nuosavybės akto

1. Spustelėkite **Įvesti nuosavybės akto matmenis**.
2. Nurodykite, kur matmenys prasideda: geodezinio taško numerį arba šiaurės ir rytų koordinates.
3. Įveskite arba įklijuokite matmenis, po vieną eilutėje:
   - atkarpa: kryptis ir atstumas, pavyzdžiui `N 45°30'15" E 125.50`. Veikia ir `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` bei azimutai (`AZ 45°30'15"`); žodžiai „thence“, kableliai ir „feet“ ignoruojami.
   - lankas: `C R 300 L 52.36 right` (spindulys ir lanko ilgis) arba `C R 300 D 10°00'00" left` (spindulys ir centrinis kampas). Lankas seka po ankstesne atkarpa; jei taip nėra, pridėkite jo stygos kryptį: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` pradeda komentaro eilutę.
4. Kol rašote, dialogas rodo matmenų ilgį, **neuždarymą** (kaip toli nuo pradžios jie baigiasi ir kuria kryptimi), **tikslumą** (ilgis, padalytas iš neuždarymo, pavyzdžiui 1 : 10,000 ir pan.) bei plotą. Eilutės, kurių nepavyksta perskaityti, išvardijamos su savo eilučių numeriais.
5. Spustelėkite **Pridėti sklypą**. Jei matmenys neužsidaro, sklypas užsidaro tiesia atkarpa per tarpą: patikrinkite matmenis pagal nuosavybės aktą. Norėdami paskirstyti lauko poligono paklaidą per jo atkarpas, pirmiausia ją sureguliuokite.

## Lankai

Sklypo **Savybėse** kiekviena atkarpa turi **Spindulį**. Įveskite spindulį, kad atkarpa taptų lanku per tuos pačius du kampus (spindulys, mažesnis nei pusė atstumo tarp kampų, neįmanomas ir atmetamas), ir skiltyje **Lankai** pasirinkite **Dešinė** arba **Kairė**: lankas į dešinę turi centrą judėjimo krypties dešinėje pusėje, kaip nuosavybės akte. Išvalykite spindulį, kad atkarpa vėl taptų tiesi. Kiekvienas pakeitimas yra vienas žingsnis: {{key:Mod+Z}} jį atšaukia.

## Teisinis aprašas

Sklypo **Savybės** baigiasi jo teisiniu aprašu, parašytu pagal brėžinį:

- „Pradedant nuo“ – **pradžios taškas**, kurį įvedate (pavyzdžiui, „ketvirtojo sklypo šiaurės rytų kampas“); kitu atveju – pirmojo kampo šiaurės ir rytų koordinatės arba geodezinis taškas, nuo kurio prasidėjo matmenys.
- „toliau“ – kiekviena atkarpa: kryptis ir atstumas, arba lankas su spinduliu, lanko ilgiu, centriniu kampu, stygos kryptimi ir atstumu.
- „Apima“ – plotas kvadratinėmis pėdomis ir akrais (metrų projekte – kvadratiniais metrais ir hektarais).

**Kopijuoti** įdeda jį į iškarpinę; **Atsisiųsti kaip tekstą** įrašo jį kaip `.txt` failą.

:::warning
Teisinis aprašas yra juodraštis, sudarytas pagal brėžinį, o ne geodezinis matavimas. Prieš kuo nors remiantis, licencijuotas geodezininkas turi jį patikrinti pagal įrašus ir pasirašyti.
:::

Spustelėkite sklypo vidų plane, kad jį pasirinktumėte; {{key:Delete}} jį pašalina. Sklypai išsaugomi projekto faile.
