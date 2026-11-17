---
title: A saját távvezeték-könyvtár
summary: Készítsen saját vezetőket, földkábeleket, tartókat, berendezéseket és árokfajtákat a saját nevű kategóriákban, és ossza meg őket fájlként.
keywords: könyvtár, vezető, kábel, oszlop, tartó, keresztkar, szigetelő, szerelvény, feszítőkötél, transzformátor, szekrény, kötés, árok, kategória, csv, importálás, exportálás
from: 88733744
---

A Távvezetékek munkaterület **Könyvtár** szakasza tartalmaz minden elemet, amelyet egy vezeték vagy kábel használhat. Semmi nincs hozzá kötve országhoz vagy gyártóhoz: a használt elemeket maga a felhasználó készíti el.

## Három elemtípus

| Típus | Hol található | Módosítható? |
|---|---|---|
| **Példák** | A CivilCraft-tal együtt érkezik, az anyagtulajdonságokból kiszámolt általános számokkal | Nem: előbb {{ui:Másolás a saját könyvtárba}} |
| **A projektben** | A megnyitott projektfájllal érkezett | Nem: előbb {{ui:Másolás a saját könyvtárba}} |
| **Saját** | A saját elemek, ebben a böngészőben tárolva | Igen, a változások azonnal mentődnek |

Minden projekt megőrzi a benne használt elemek másolatát, így a projekt bármelyik számítógépen megnyitható a saját vezetőivel és oszlopaival.

:::warning
A példaelemek csak példák: minden számot ellenőrizni kell a szállító adataival. A földkábeleknél szándékosan nincs áramterhelhetőség, mert az a kábel fektetésétől függ.
:::

## Elem készítése

1. A **Könyvtár** szakaszban válassza ki a **Típust** (légvezetéki vezetők, földkábelek, tartók, berendezések vagy árokfajták).
2. Kattintson a {{ui:Új elem}} gombra, vagy válasszon egy példát, és kattintson a {{ui:Másolás a saját könyvtárba}} vagy a {{ui:Kettőzés}} gombra.
3. Töltse ki a mezőit. A `*`-gal jelölt mezők azok, amelyeket az ellenőrzések igényelnek; a hiányzó mezőjű elem `!` jelet kap, és az **Ellenőrzések** között szerepel, amikor egy vezeték használja.
4. Adjon neki **Kategóriát**, a szintek között `/` jellel: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. A fa a kategóriáit követi.

Mire van szükség típusonként:

| Típus | Az ellenőrzésekhez szükséges |
|---|---|
| Légvezetéki vezető | keresztmetszet, átmérő, tömeg méterenként, szakítószilárdság, rugalmassági modulus, hőtágulás |
| Földkábel | erek, keresztmetszet, feszültség, átmérő, ellenállás, áramterhelhetőség |
| Tartó | teljes hossz, névleges terhelés (a tető alatti ponton véve), mélység a talajban |
| Berendezés | a típusa; névleges terhelés a keresztkarokhoz, szerelvényekhez és feszítőkötelekhez; fázistávolság és esés a keresztkarokhoz; hossz a szigetelőkhöz; szög a feszítőkötelekhez |
| Árokfajta | mélység, szélesség, a kábelek feletti takarás |

## Megosztás

- A {{ui:Saját könyvtár mentése}} minden saját elemet egy `.cclines.json` fájlba ment; a {{ui:Könyvtár megnyitása…}} visszaolvassa (az azonos kulcsú elemek lecserélődnek).
- A {{ui:Mentés CSV-ként}} a megnézett típust táblázatként menti; a {{ui:Könyvtár megnyitása…}} visszaolvassa az ilyen típusú CSV-t. Az oszlopok bármilyen sorrendben lehetnek; a pontosvesszővel elválasztott fájl tizedesvesszőt is használhat.
