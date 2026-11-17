---
title: Unesi poligonski vlak i izravnaj ga pravilom kompasa
summary: Unesite uglove ili pravce i dužine, proverite ugaono i linearno zatvaranje i tačnost, izravnajte pravilom kompasa i dodajte tačke kao geodetske tačke ili petlju kao parcelu.
keywords: poligonski vlak, zatvoren poligonski vlak, petlja, uglovi desno, unazadna tačka, pravci, dužine, zatvaranje, odstupanje zatvaranja, tačnost, pravilo kompasa, bowditch, izravnanje, geodetsko snimanje
from: 56ce5a8c
---

Poligonski vlak je niz izmerenih pravaca: na svakoj tački stajanja nalaze se ugao (ili pravac) i dužina do sledeće tačke. Kliknite **Unesi poligonski vlak** pod **Poligonski vlak** u desnom panelu kada ništa nije izabrano.

## Gde počinje i gde se završava

1. **Početak na geodetskoj tački**: njen broj. Ili unesite sever i istok.
2. **Pravci kao**: **Uglovi desno i dužine**, ili **Pravci i dužine**.
3. Uz uglove, navedite odakle počinju: **Unazadna geodetska tačka**, ili **njen azimut** (od prve tačke prema unazadnoj, u smeru kazaljke na satu od severa).
4. **Završetak**: **na početku (petlja)**, ili **na geodetskoj tački** i njenim brojem (otvoreni poligonski vlak između poznatih tačaka).

## Unesite pravce

Jedan pravac u jednom redu, zatim dužina, zatim naziv tačke do koje stiže, ako želite:

- Uglovi desno, mereni u smeru kazaljke na satu na tački sa koje pravac polazi, od tačke iza do sledeće: `270°00'10" 125.50 B`. Rade i `270-00-10`, `270 00 10` i `270.0028`.
- Pravci: `N 45°30'15" E 125.50 B`, ili azimut kao jedna reč: `AZ 45-30-15 125.50 B`.
- Kod petlje sa uglovima završite sa `close` i ponovo uglom na početku, merenim od poslednje tačke do druge: `close 270°00'05"`. Time se proveravaju uglovi.

Redovi koje ne može da pročita biće navedeni sa brojevima redova. Oznake „feet“, zarezi i redovi komentara sa `#` su dozvoljeni.

## Pročitajte zatvaranje

Dok kucate, dijalog prikazuje:

- **Ugaono odstupanje zatvaranja**: koliko su uglovi daleko od zatvaranja i koliki deo pada na svaki ugao. Bez ugla zatvaranja uglovi se ne proveravaju, a greška u njima se pokazuje u linearnom odstupanju.
- **Linearno odstupanje zatvaranja**: koliko poligonski vlak završava daleko od mesta gde treba da završi, i u kom smeru.
- **Tačnost**: dužina poligonskog vlaka podeljena linearnim odstupanjem: 1 : 10,000 znači 1 ft na 10,000 ft.
- Tačke posle izravnanja i koliko se svaka pomerila.

## Izravnanje

Prvo se ugaono odstupanje ravnomerno raspoređuje na uglove. Zatim se linearno odstupanje raspoređuje na pravce pravilom kompasa (Bowditch): svaka tačka se pomera suprotno odstupanju srazmerno dužini koju je vlak prešao do nje, pa poligonski vlak završava tačno tamo gde treba.

:::note
Pravilo kompasa je standardno izravnanje, a ne izravnanje po metodi najmanjih kvadrata, i ne vrednuje uglove u odnosu na dužine. Da li je tačnost dovoljna, odlučuju vaši sopstveni standardi i propisi nadležnog organa.
:::

## Korišćenje rezultata

- **Dodaj kao geodetske tačke**: izravnane tačke postaju geodetske tačke sa nazivima koje ste dali (inače sledeći slobodni brojevi), opisom `TRAV` i bez kote. Poslednja tačka petlje je njen početak, pa se ne dodaje dvaput. Jedan korak: {{key:Mod+Z}} to poništava.
- **Dodaj kao parcelu** (petlje): izravnane tačke postaju [parcela](topic:parcels), sa njenim oznakama i pravnim opisom.
- **Izveštaj (CSV)**: redovi zatvaranja, zatim za svaku tačku pravac, dužina, neizravnane i izravnane koordinate i popravke.
