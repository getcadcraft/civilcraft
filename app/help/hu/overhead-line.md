---
title: Légvezeték rajzolása
summary: Tartók elhelyezése az alaprajzon, a CivilCraft kiszámítja az egyes tartók szerepét és a végtartók közötti szakaszokat, a tartók pedig áthelyezhetők az alaprajzon vagy a vezeték hossz-szelvényén.
keywords: légvezeték, tartó, oszlop, mező, szakasz, végtartó, szög, felfüggesztés, hossz-szelvény, magasság, keresztkar, feszítőhuzal, kihúzó
from: b8e5e272
---

## Rajzolás

1. Legyen felülete: a vezeték alatti terep onnan származik ([Felület készítése](topic:build-surface)). A tartó alatti terep nélküli tartó a **Ellenőrzések** között szerepel; ehelyett a Tulajdonságokban írja be a **Terepszintet**.
2. Kattintson az Erővezetékek csoport {{ui:Line}} gombjára, majd kattintson minden tartóra az alaprajzon.
3. Kattintson duplán az utolsóra, vagy nyomja meg az Entert.

A vezeték azt a vezetőt, tartót és szerelvényt kapja, amelyet legutóbb használt ezen a számítógépen (először: a könyvtár példái). Ezeket a Tulajdonságokban módosíthatja.

## A vezeték a Tulajdonságokban

Jelölje ki a vezetéket (kattintson egy mezőre), hogy beállítsa a **Vezető**t, a **Vezetők áramkörönként** értékét, az **Áramkörök** számát, a **Feszültséget**, a **Biztonsági távolság szabályát**, amelyet a talaj felett tartania kell, és az **Minden tartón** lévő szerelvényeket (keresztkar, szigetelők, kötőelemek). A táblázat felsorolja a **szakaszait**, mindegyiknek a mértékadó mezőjével, a szokásos feszítésével és a rá vonatkozó terhelési esettel.

## Tartók

Kattintson egy tartóra a kijelöléséhez. A Tulajdonságokban:

- **Tartó**: a könyvtári eleme. Ha túl gyenge, a {{ui:Use …}} a könyvtárból a legkisebb azonos anyagú tartót teszi be, amely elbírja a terhelést.
- **Szerep**: Automatikus, Felfüggesztés, Szög vagy Végtartó. Az automatikus azt jelenti: az első és az utolsó tartó végtartó; a szabály szögénél nagyobb fordulat szögtartót készít, a nagyobb fordulat végtartót.
- **Magasság a talaj felett**: üresen hagyva a könyvtári elemből veszi (a hossza mínusz a talajba nyúló mélység).
- **Ezen a tartón is**: további szerelvény, például egy **feszítőhuzal** (kihúzó). A feszített tartó a vezeték húzóerejét a feszítőhuzalra adja át.
- **Meglévő tartó**: úgy ellenőrzik, mint a többit, de nem szerepel a mennyiségekben.

Az {{ui:Support}} a kattintásához legközelebbi mezőre tesz egy tartót. Húzza a tartót az alaprajzon az áthelyezéséhez. A {{ui:Delete}} eltávolítja (a vezetéknek legalább két tartója marad).

A szakaszok végtartók között futnak: egy szakaszon belül a vezető szabadon fut a felfüggesztő bilincseken át, így egy feszítés érvényes az egész szakaszra.

## A vezeték hossz-szelvénye

Kattintson a {{ui:Profile}} gombra (vagy a vezeték Tulajdonságaiban a **Profil**ra). Az alaprajz alatti panel megmutatja a talajt a vezeték mentén, minden tartót a talajtól a tetejéig, a vezető legalacsonyabb fázisát a kiválasztott **Terhelési eset** szerint, és a biztonsági távolságot szaggatott vonalként. A nem megfelelő mező piros; minden mező alatti szám a legkisebb biztonsági távolság.

- A **Vezeték** a megjelenítendő légvezetéket választja ki. Ha egy másik vezetéket, vagy annak egy tartóját választja ki az alaprajzon, a profil arra vált.
- Vigye a mutatót a profil fölé: egy segédvonal követi, a címke pedig megadja a távolságot a vezeték mentén, a talajt, a vezetőt és az ott lévő biztonsági távolságot (és jelzi, ha a biztonsági távolság a vezeték szabálya alatt van).
- A {{ui:Measure}} a profil sávjában: két pont kattintásával megkapja a vízszintes távolságot, a magasságkülönbséget, az egyenes távolságot és a köztük lévő lejtést. A talajhoz, a vezetőhöz vagy egy tartó tetejéhez közeli kattintás oda pattan. A leállításhoz kattintson ismét a {{ui:Measure}} gombra.
- Az akadályok, amelyeket a vezeték keresztez, a talajból állnak ki: a rajzolt akadályok sávként, a tájrendezési növények koronaként, a falak sávként (lásd [Erővezeték-ellenőrzések](topic:power-line-checks#clearances)). A kábelútvonalak és csővezetékek, amelyeket a vezeték keresztez, a talaj alatt jelennek meg a tetejüknél, a nevükkel.

- Húzza a tartót oldalra, hogy a vezeték mentén mozgassa.
- Húzza a tetejét felfelé vagy lefelé, hogy beállítsa a magasságát a talaj felett.
