---
title: Unesite poligonski vlak i izjednačite ga Bowditchovim pravilom
summary: Upišite kutove ili smjerne kutove i duljine, provjerite kutno i linearno zatvaranje te točnost, izjednačite pravilom kompasa i dodajte stajališta kao geodetske točke ili petlju kao katastarsku česticu.
keywords: poligonski vlak, zatvoreni poligonski vlak, petlja, kutovi desno, unazadno viziranje, smjerni kutovi, duljine, zatvaranje, pogreška zatvaranja, točnost, pravilo kompasa, bowditch, izjednačenje, geodezija
from: 56ce5a8c
---

Poligonski vlak je niz izmjerenih dionica: na svakom stajalištu zadaju se kut (ili smjerni kut) i duljina do sljedećeg. Kad ništa nije odabrano, kliknite **Unesi poligonski vlak** pod **Poligonski vlak** na desnoj ploči.

## Početak i kraj

1. **Početak na točki**: njezin broj. Ili upišite sjever (N) i istok (E).
2. **Dionice kao**: **Kutovi desno i duljine** ili **Smjerni kutovi i duljine**.
3. Za kutove navedite odakle kreću: **Točka unazadnog viziranja** ili **njezin azimut** (od prvog stajališta prema unazadnom viziranju, u smjeru kazaljke na satu od sjevera).
4. **Završetak**: **natrag na početak (petlja)** ili **na točku** i njezin broj (otvoreni poligonski vlak između poznatih točaka).

## Upišite dionice

Jedna dionica u jednom retku: kut ili smjerni kut, zatim duljina, pa naziv stajališta do kojeg dionica vodi, ako želite:

- Kutovi desno, mjereni u smjeru kazaljke na satu na stajalištu iz kojeg dionica polazi, od prethodnog do sljedećeg stajališta: `270°00'10" 125.50 B`. Rade i `270-00-10`, `270 00 10` i `270.0028`.
- Smjerni kutovi: `N 45°30'15" E 125.50 B`, ili azimut kao jedna riječ: `AZ 45-30-15 125.50 B`.
- Kod petlje s kutovima završite s `close` i opet kutom na početku, mjerenim od zadnjeg stajališta do drugoga: `close 270°00'05"`. Time se provjeravaju kutovi.

Retci koje nije moguće pročitati navode se s brojevima redaka. Riječi „feet“, zarezi i komentari retka koji počinju znakom `#` su u redu.

## Pročitajte zatvaranje

Dok tipkate, dijaloški okvir prikazuje:

- **Kutna pogreška zatvaranja**: koliko su kutovi udaljeni od zatvaranja i udio koji svaki kut nosi. Bez kuta zatvaranja kutovi se ne provjeravaju, a eventualna pogreška u njima pojavljuje se u linearnoj pogrešci zatvaranja.
- **Linearna pogreška zatvaranja**: koliko poligonski vlak završava dalje od mjesta na kojem bi trebao završiti i u kojem smjeru.
- **Točnost**: duljina poligonskog vlaka podijeljena linearnom pogreškom zatvaranja: 1 : 10,000 znači 1 ft na 10,000 ft.
- Stajališta nakon izjednačenja i koliko se svako od njih pomaknulo.

## Izjednačenje

Najprije se kutna pogreška zatvaranja ravnomjerno raspodjeljuje na kutove. Zatim se linearna pogreška zatvaranja raspodjeljuje na dionice Bowditchovim pravilom (pravilo kompasa): svako stajalište pomiče se suprotno od pogreške razmjerno duljini prijeđenoj do njega, pa poligonski vlak završava točno tamo gdje treba.

:::note
Pravilo kompasa je standardno izjednačenje, a ne izjednačenje metodom najmanjih kvadrata, i ne važe kutove naspram duljina. Hoće li točnost biti dovoljna prepušteno je vašim standardima i propisima vaše nadležnosti.
:::

## Upotreba rezultata

- **Dodaj kao geodetske točke**: izjednačena stajališta postaju geodetske točke s nazivima koje ste dali (inače sljedeći slobodni brojevi), opisom `TRAV`, bez kote. Zadnje stajalište petlje jednako je početku pa se ne dodaje dvaput. Jednim korakom to poništava {{key:Mod+Z}}.
- **Dodaj kao katastarsku česticu** (petlje): izjednačena stajališta postaju [katastarska čestica](topic:parcels), sa svojim oznakama i katastarskim opisom.
- **Izvješće (CSV)**: retci zatvaranja, zatim za svako stajalište smjer, duljina, neizjednačene i izjednačene koordinate te popravci.
