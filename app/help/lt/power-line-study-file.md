---
title: Tyrimo failai kitai linijų programai (.DON)
summary: Įrašykite vieną oro liniją kaip .DON tyrimo failą arba nuskaitykite jos atramas į naują liniją. Nepatikrinta su programa, kuri šiuos failus skaito.
keywords: don, .don, tyrimo failas, xml, eksportas, importas, oro linijų programa, montavimas, canton
from: 1abc4d07
---

Kai kurios oro linijų programos tyrimą laiko `.DON` faile (XML tekstas). CivilCraft gali įrašyti vieną liniją į tokį failą ir nuskaityti vienos linijos atramas.

:::warning
**Nepatikrinta.** Tai sukūrėme pagal formato laukų pavadinimų sąrašą, kurį pasidalijo vienas naudotojas, o ne pagal tikrą failą, ir savo failų dar neatidarėme programoje, kuri juos skaito. Atidarykite failą ten ir patikrinkite kiekvieną reikšmę prieš ja pasikliaudami. Jei galite pasidalinti `.DON` failu (su pašalintais kliento duomenimis), tai padėtų mums tai ištaisyti.
:::

## Tyrimo failo įrašymas

1. Linijai priskirkite laidininką ir įsitikinkite, kad ji turi rezultatus (jos Savybėse nėra „neapskaičiuota“).
2. {{ui:Daugiau}} › {{ui:Įrašyti tyrimo failą (.DON)…}}, pasirinkite liniją, pridėkite aprašymą ir darbo numerį.
3. {{ui:Įrašyti studijos failą}}.

Faile yra linijos atramos (koordinatės, žemė, aukščiai, vaidmenys, skersinis, atrama – paliekama ar siūloma, apkrovos kiekvienam apkrovos atvejui, pamatas), po vieną skyrių kiekvienam ruožui tarp galinių atramų (laidininkas, įtampa, kontrolinis tarpas, tarpai, įtempimas ir kateninis parametras, didžiausias įtempimas kiekvienam apkrovos atvejui) ir montavimo lentelės. Ilgiai pateikiami metrais, jėgos – daN; tekstas įrašomas Latin-1 kodavimu, todėl simbolis už jo ribų tampa `?`.

## Tyrimo failo skaitymas

{{ui:Daugiau}} › {{ui:Atverti tyrimo failą (.DON)…}} nuskaito atramas į naują liniją. Laidininkas, atramos ir skersiniai pagal pavadinimą sutapatinami su jūsų biblioteka; viskas, ko nerasta, paliekama, kad pasirinktumėte Savybėse.
