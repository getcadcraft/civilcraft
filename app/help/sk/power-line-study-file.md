---
title: Súbory štúdií pre iný program vedení (.DON)
summary: Uložte jedno nadzemné vedenie ako štúdijný súbor .DON alebo načítajte podpery z neho do nového vedenia. Neotestované s programom, ktorý ich číta.
keywords: don, .don, súbor štúdie, xml, export, import, program nadzemných vedení, vešanie, kanton
from: 1abc4d07
---

Niektoré programy nadzemných vedení uchovávajú štúdiu v súbore `.DON` (text XML). CivilCraft dokáže jedno vedenie zapísať ako takýto súbor a načítať podpery z jedného.

:::warning
**Neotestované.** Vytvorili sme to zo zoznamu názvov polí formátu, ktorý nám poskytol používateľ, nie zo skutočného súboru, a naše súbory sme ešte neotvorili v programe, ktorý ich číta. Otvorte tam súbor a pred použitím overte každú hodnotu. Ak môžete zdieľať súbor `.DON` (s odstránenými údajmi klienta), pomôže nám to túto funkciu správne upraviť.
:::

## Uloženie súboru štúdie

1. Priraďte vedeniu vodič a overte, že má výsledky (vo Vlastnostiach nie je uvedené "nevypočítané").
2. {{ui:Viac}} › {{ui:Uložiť súbor štúdie (.DON)…}}, vyberte vedenie, pridajte popis a číslo zákazky.
3. {{ui:Uložiť súbor štúdie}}.

Súbor obsahuje podpery vedenia (súradnice, terén, výšky, úlohy, traverzu, podperu zachovanú alebo navrhnutú, zaťaženia pre každý zaťažovací stav, základ), jeden oddiel pre každý úsek medzi koncovými podperami (vodič, napätie, rozhodujúce rozpätie, úseky, napnutie a parameter závesu, najväčšie napnutie pre každý zaťažovací stav) a tabuľky vešania. Dĺžky sú v metroch a sily v daN; text sa zapisuje v kódovaní Latin-1, takže znak mimo neho sa zmení na `?`.

## Načítanie súboru štúdie

{{ui:Viac}} › {{ui:Otvoriť súbor štúdie (.DON)…}} načíta podpery do nového vedenia. Vodič, podpery a traverzy sa priradia k vašej knižnici podľa názvu; čo sa nenájde, zostane na to, aby ste to vybrali vo Vlastnostiach.
