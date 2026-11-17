---
title: Izdelava poročila o zakoličbi
summary: Izpišite količke ob trasi na stacionažah in odmikih ali točke izmere blizu nje, z stacionažo, odmikom, severno in vzhodno koordinato, projektno in terensko koto ter izkopom ali nasipom, in poročilo shranite kot CSV ali PDF.
keywords: zakoličba, zakoličevanje, poročilo o zakoličbi, list izkopa, list nivelete, stacionaža, odmik, izkop, nasip, postavitev, zakoličba gradnje, izvedeno stanje
from: d8a4e9f1
---

Izberite trasa in v njenih **Lastnostih** kliknite **Poročilo o zakoličbi**.

## Količki na stacionažah in odmikih

1. **Od** in **do**: stacionaži, na katerih naj se zakoliči (1+50 ali 150).
2. **Razmak**: interval. Količki so postavljeni na vsakem večkratniku razmaka, na obeh koncih in (če je potrditveno polje obkljukano) tam, kjer se trasi začnejo in končajo krivine.
3. **Odmiki**: levo in desno od trase, gledano v smeri naraščajoče stacionaže: `12 L, 0, 12 R`, `L12 CL R12` ali `-12, 0, 12` (levo je minus). Trasa s koridorjem začne z robovi vozišča in bankin.
4. **Številčenje od** in **s predpono** poimenujeta količke: 1, 2, 3 ali S101, S102.

## Točke izmere blizu trase

Izberite **točke izmere blizu trase** in razdaljo, do katere naj bodo. Vsaka točka znotraj te razdalje dobi svojo stacionažo in odmik, projektno koto na tem mestu ter lastno koto kot teren: preverjanje točk, zakoličenih ali izmerjenih kot izvedenih.

## Kaj poročilo prikazuje

| Stolpec | Kaj je |
|---|---|
| Točka | Ime količka ali številka točke izmere |
| Stacionaža, odmik | Kje je vzdolž trase: L levo, R desno |
| Severna (N), vzhodna (E) | Njegovi koordinati |
| Projektna kota | Površje urejenega koridorja tam (od ene mejne črte do druge), sicer projektni vzdolžni profil na osi |
| Terenska kota | Obstoječe površje tam ali lastna kota točke izmere |
| Izkop/nasip | C, kadar je teren nad projektom (ga je treba znižati), F, kadar je pod njim (ga je treba dvigniti), na stotinko natančno |

Količek brez projektne kote (zunaj koridorja ali na trasi brez nje, stran od osi) nima izkopa ali nasipa; pogovorno okno pove, koliko jih je.

## Shranjevanje

- **CSV**: naslovna vrstica, nato zgornji stolpci ter izkop ali nasip kot predznačeno število (teren minus projekt) za preglednice in zbiralnike podatkov.
- **PDF**: tabelarne strani na izbranem papirju, en količek v vrstici, izkopi oranžno, nasipi zeleno, z glavo risbe kot pri drugih listih.

:::note
Količki so izračunani iz projekta. Pred gradnjo jih preverite z odobrenimi načrti.
:::
