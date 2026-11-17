---
title: Tömegek ellenőrzése a megadott övezeti korlátokkal
summary: Írja be egy telek építési távolságait soronként, egy magassági korlátot, égboltkitekintési síkot, szintterületi mutatót és beépítettséget, nézze meg az építhető területet a terven, és olvassa le, mely tömegek sértik mely korlátot.
keywords: övezet, építési távolság, távolságok, elülső, oldalsó, hátsó, burkolat, építhető terület, magassági korlát, égboltkitekintési sík, szintterületi mutató, FAR, beépítettség, telek, parcella, rendelet, előírás-ellenőrzés
from: 3e267b31
---

**A CivilCraftban nincs beépített övezeti szabályozás.** Nem ismer egyetlen város szabályait sem, és nem tartalmaz ilyen könyvtárat. Ezen az oldalon minden számot Ön ír be a saját helyi rendeletéből, és minden eredmény megjelöli, hogy a megadott korlátokhoz mérték. Ez arra szolgál, hogy lássa, a telek korlátai hogyan alakítják az épületet, nem pedig arra, hogy eldöntse, engedélyezett-e egy terv.

## A korlátok megadása

A **Tulajdonságok** panelen, az **Épülettömegek** alatt válasszon egy **Telket** (vagy jelöljön ki egy tömeget: a telke korlátai megjelennek alatta). Ezután töltse ki, ami alkalmazandó; üresen hagyott mező azt jelenti, hogy nincs korlát:

- **Utcai telekhatár**: a telekhatár az utcánál. Az **Elülső építési távolság** erre vonatkozik, a **Hátsó építési távolság** a vele legszemben lévő határvonalra, az **Oldalsó építési távolság** a többire.
- **Magassági korlát**.
- **Égboltkitekintési sík**: a telekhatárnál egy magasságban indul, és minden 1 egység befelé haladás után a megadott mértékkel emelkedik, mérve az utcai határvonaltól vagy minden telekhatártól (2 esetén 2 az 1-hez). Egy pont felett megengedett magasság a sík és a magassági korlát közül a kisebbik.
- **Szintterületi mutató** (a telken lévő tömegek bruttó alapterülete osztva a telek területével) és **Beépítettség** (lábnyomuk osztva a telek területével, százalékban megadva).

## Az építhető burkolat

Jelölje be a **Burkolat megjelenítése a terven** lehetőséget, hogy a `A-MASS-ENVL` rétegre rajzolja. A burkolat a telek, amelyet minden telekhatártól az adott határ saját építési távolságával befelé húzunk, az eltolt vonalak ferde sarkokban találkoznak. Egy görbe telekhatárt 0,01 eltérésen belüli rövid húrokkal közelítünk. Konvex és konkáv telkek egyaránt működnek. Ha az építési távolságok összecsúsznak (mély távolság keskeny vagy erősen konkáv telken), nincs burkolat, és a Tulajdonságok ezt jelzi; próbáljon kisebb távolságokat.

## Az eredmény

A mezők alatt minden tömeg és minden korlát kap egy sort, pipával vagy kereszttel:

- **építési távolságok**: a tömegnek az építhető burkolaton kívül eső része;
- **magasság**: a tömeg magassága a lábnyomán megengedett legkisebb magassághoz képest (egy adott magasságú hasábot a sarkainál megengedett legkisebb magasság korlátoz);
- **szintterületi mutató** és **beépítettség**: a telken lévő összes tömeg összeadva.
