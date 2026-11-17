---
title: Patikrinkite IFC eksportą pagal kliento IDS
summary: Įkelkite .ids failą, kurį jums davė klientas ar kelių institucija, ir Problemose pamatykite kiekvieną eksportuotą elementą, kuris jam neatitinka.
keywords: ids, informacijos pateikimo specifikacija, buildingsmart, reikalavimai, pristatymas, tikrinimas, validavimas, kokybė, ifc eksportas, ifc 4.3, trasa, kelias, viešieji pirkimai
from: 183d9a0e
---

## Ką darysite

IDS (Informacijos pateikimo specifikacija, buildingSMART standartas) – tai sąrašas, ką IFC turi turėti. Viešieji pirkimai dažnai pateikia jį kartu su darbu. CivilCraft patikrina šio projekto eksportuojamą IFC, pasirinktoje eksporto IFC versijoje, pagal jį ir išvardija kiekvieną elementą, kuris nepasiekia reikalavimų.

## Žingsniai

1. Atidarykite projektą.
2. Spustelėkite {{ui:IFC}} įrankių juostos skyriuje **Eksportas**. Dialoge pasirinkite IFC versiją, kurią pristatysite.
3. Spustelėkite {{ui:Tikrinti pagal IDS…}}.
4. Spustelėkite {{ui:Įkelti .ids failą…}} ir pasirinkite failą. Niekas neįkeliama.
5. Perskaitykite rezultatą: kiekviena specifikacija su {{ui:Atitinka}} arba {{ui:Neatitinka}} ir kiek elementų ji taiko.
6. Atidarykite Problemas ({{key:Ctrl+Shift+M}}) ir spustelėkite neatitikimą, kad pažymėtumėte trasą, aikštelę, vamzdį, konstrukciją ar pastato masę, iš kurios jis kilo.

## Ko turėtumėte matyti

- Vienas įspėjimas kiekvienam eksportuotam elementui ir reikalavimui, kurio jis neatitinka, su specifikacijos pavadinimu, tuo, ko reikalauja IDS, ir tuo, ką turi eksportas.
- Tikrinimo ataskaita (Problemose) prasideda nuo IDS: jo pavadinimas, versija, autorius ir kiekvienos specifikacijos skaičiai.

## Verta žinoti

- IDS įrašomas projekto faile, todėl jis tikrinamas iš naujo, kai atidarote projektą. Jį įkelti ar pamiršti yra vienas žingsnis, kurį galite atšaukti.
- Kiekvienas pakeitimas tikrinamas iš naujo po akimirkos. Dideli paviršiai rašomi ilgiau, todėl tikrinimas tada palaukia šiek tiek ilgiau tarp paleidimų.
- Tikrinimas naudoja tą patį failą, kurį rašo {{ui:IFC}} eksportas, paskutinėje ten pasirinktoje versijoje (IFC 4.3, jei nieko nepasirinkote).
- Skaičiai lyginami SI vienetais: projektas pėdomis (ft) pirmiausia konvertuojamas į metrus.

- IDS šablonai skaitomi kaip visa reikšmė. Pradžioje esantis `^` ir pabaigoje esantis `$` taip pat laikomi „visa reikšme“, kaip dauguma IDS failų jas ir supranta.

## Kitas

- [Eksportuokite IFC](topic:ifc)
