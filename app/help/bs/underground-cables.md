---
title: Podzemni kablovi
summary: Trase kablova u rovovima između oslonaca i opreme, pokrivenost i ukrštanja, spojnice po dužini bubnja, te količine rova i kablova.
keywords: podzemni kabel, trasa kabela, rov, cijev, pokrivenost, ukrštanje, ukrštanje s cijevi, spojnica, bubanj, ormarić, transformator, izvor, pad napona
from: adfd2717
---

## Nacrtaj trasu kabela

1. Prvo postavi opremu ako kabel završava na ormariću, transformatoru ili spojnici: {{ui:Oprema}}, pa klikni.
2. Klikni {{ui:Kabel}} i klikni trasu; početak i kraj na osloncu ili na opremi spajaju se na nju. Enter završava.

U Svojstvima izaberi **Kabel**, **Tip rova**, koliko **kablova jedan pored drugog**, i **rezervu** (%). Trasa prikazuje svoju dužinu, gdje počinje i završava, i struju koju nosi.

## Što se provjerava

- **Pokrivenost**: gornja strana kabela mora biti ispod terena duž trase, u odnosu na pokrivenost za tip rova (ili na najmanju pokrivenost iz skupa pravila).
- **Ukrštanja**: mjesta gdje trasa presijeca CivilCraft cijev ili drugi kabel, i razmak između njih prema pravilu razmaka: **Razmak za ukrštanje** same trase (u njenim Svojstvima) kad ga izabereš, inače pravilo **Podzemna ukrštanja** iz skupa pravila (primjer skupova koristi *Podzemno ukrštanje*, 0.3 m), inače razmak tipa rova do drugih instalacija. Kad se dva kabela ukrštaju, zadržava se veći od njihova dva. Nadzemni vod koji se presijeca navodi se radi informacije, a kabel se prikazuje u profilu tog voda.
- **Spojnice**: jedna na svaku dužinu bubnja kabela (s rezervom), kad stavka kabela daje dužinu bubnja.

## Oprema

Oprema ima stavku iz biblioteke, **opterećenje** (kW) s njenim **faktorom snage**, i može biti **izvor**: mreža se napaja odatle. Napon izvora dolazi iz njegove stavke u biblioteci, ili iz voda ili kabela koji napaja.

## Količine

{{ui:Više}} › {{ui:Količine…}} broji kabel (dužina trase × (1 + rezerva) × kablova jedan pored drugog + uspon na svakom kraju), rov po tipu, zapremine iskopa, posteljice i zatrpavanja, cijevi i spojnice, te provodnik, oslonce i opremu nadzemnih vodova.
