---
title: Študijske datoteke za drug program za nadzemne linije (.DON)
summary: Shranite eno nadzemno linijo kot študijsko datoteko .DON ali preberite podpore ene od njih v novo linijo. Še ni preizkušeno s programom, ki jo bere.
keywords: don, .don, študijska datoteka, xml, izvoz, uvoz, program za nadzemne linije, napenjanje, canton
from: 1abc4d07
---

Nekateri programi za nadzemne linije hranijo študijo v datoteki `.DON` (besedilo XML). CivilCraft lahko eno linijo zapiše kot takšno datoteko in prebere podpore iz nje.

:::warning
**Ni preizkušeno.** To smo izdelali iz seznama imen polj formata, ki ga je delil en uporabnik, ne iz prave datoteke, in še nismo odprli svojih datotek v programu, ki jih bere. Datoteko odprite tam in preverite vsako vrednost, preden se nanjo zanesete. Če lahko delite datoteko `.DON` (z odstranjenimi podatki o naročniku), nam to pomaga, da to popravimo.
:::

## Shranjevanje študijske datoteke

1. Liniji dodelite vodnik in preverite, da ima rezultate (v njenih Lastnostih ni „ni izračunano“).
2. {{ui:Več}} › {{ui:Shrani datoteko študije (.DON) …}}, izberite linijo, dodajte opis in številko naloga.
3. {{ui:Shrani datoteko študije}}.

Datoteka vsebuje podpore linije (koordinate, teren, višine, vloge, prečko, podporo, ki je ohranjena ali predlagana, obremenitve po obtežnem primeru, temelj), en odsek med končnimi podporami (vodnik, napetost, merodajni razpon, razponi, napetost in parameter verižnice, največja napetost po obtežnem primeru) ter tabele napenjanja. Dolžine so v metrih, sile v daN; besedilo je zapisano v Latin-1, zato znak zunaj njega postane `?`.

## Branje študijske datoteke

{{ui:Več}} › {{ui:Odpri datoteko študije (.DON) …}} prebere podpore v novo linijo. Vodnik, podpore in prečke se ujemajo z vašo knjižnico po imenu; česar ne najde, izberete sami v Lastnostih.
