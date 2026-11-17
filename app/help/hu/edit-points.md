---
title: Felmérési pont szerkesztése
summary: Egy pont számának, koordinátáinak, magasságának vagy leírásának módosítása, vagy a pont áthelyezése a terven egy új helyre.
keywords: pont szerkesztése, pont áthelyezése, magasság módosítása, átszámozás, pontszám, leírás, húzás, északi koordináta, keleti koordináta, pont rögzítése, elhibázott mérés
from: 375ae2e9
---

Egy elhibázott mérés, rossz műszermagasság, elgépelt leírás: javítsa ki az egyetlen pontot, és a felület követi.

## Pont értékeinek módosítása

1. Az {{ui:Kijelölés}} eszközzel kattintson a pontra a terven. A **Tulajdonságok** mezőkben mutatja a pont számát, keleti és északi koordinátáját, magasságát és leírását.
2. Írja be az új értéket, és nyomja meg az {{key:Enter}} billentyűt (vagy kattintson máshova). Olyan pontnál, amelynek nincs magassága, üresen hagyja a **Magasság** mezőt.
3. A felület, a szintvonalak és minden rájuk épülő elem azonnal frissül.

Minden módosítás egy lépés: a {{key:Mod+Z}} visszavonja, a {{key:Mod+Y}} pedig újra elvégzi. A CivilCraft nem fogadja el a használhatatlan értéket (olyan számot, amelyet már egy másik pont használ, vagy betűt a koordinátában): a mező keretet kap, és az állapotsor megmondja az okát.

Új leíró kód új ponthalmazt hoz létre, ahogy az importálás is (lásd: [Felület készítése](topic:build-surface)).

## Pont mozgatása a terven

1. Jelölje ki a pontot (gyűrűt kap).
2. Húzza a gyűrűt. Az állapotsor mutatja, hova kerül a keleti és az északi koordináta.
3. Engedje el a mozgatáshoz; a magassága megmarad. Az elengedés előtt nyomja meg az {{key:Esc}} billentyűt, és a pont visszaáll.

## A töréselők követik a pontot

A {{ui:Töréselő}} eszközzel rajzolt töréselő másolja a pontokat, amelyeken átmegy. Ha mozgatja a pontot vagy módosítja a magasságát, a rajta lévő töréselő-sarkok ugyanabban a lépésben vele mozognak. A leírásokból készült töréselő-csoportok mindig újraépülnek a pontokból.

:::note
A LandXML-fájlból beolvasott felület megtartja saját háromszögeit: a pontszerkesztések csak a {{ui:A felület újraépítése a pontokból}} után módosítják azt.
:::
