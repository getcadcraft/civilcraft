---
title: Unos poligonskog vlaka i izravnanje po pravilu kompasa
summary: Upiši uglove ili smjerne uglove i dužine, provjeri ugaono i linearno odstupanje od zatvaranja i tačnost, izravnaj po pravilu kompasa i dodaj stajne tačke kao geodetske tačke ili petlju kao parcelu.
keywords: poligonski vlak, zatvoreni poligonski vlak, petlja, desni uglovi, zadnja tačka, smjerni uglovi, dužine, zatvaranje, odstupanje od zatvaranja, tačnost, pravilo kompasa, bowditch, izravnanje, geodetsko snimanje
from: 56ce5a8c
---

Poligonski vlak je niz izmjerenih dionica: na svakoj stajnoj tački ugao (ili smjerni ugao) i dužina do sljedeće. Klikni **Unesi poligonski vlak** pod **Poligonski vlak** u desnom panelu kad ništa nije odabrano.

## Gdje počinje i završava

1. **Početak na geodetskoj tački**: njen broj. Ili upiši sjever i istok.
2. **Dionice kao**: **Desni uglovi i dužine** ili **Smjerni uglovi i dužine**.
3. Uz uglove, reci odakle počinju: **Zadnja geodetska tačka** ili **njen azimut** (od prve stajne tačke prema zadnjoj, u smjeru kazaljke na satu od sjevera).
4. **Završetak**: **nazad na početnu tačku (petlja)** ili **na geodetskoj tački** i njen broj (otvoreni vlak između poznatih tačaka).

## Upiši dionice

Jedna dionica je jedan red: prvo ugao, zatim dužina, pa naziv stajne tačke do koje vodi, ako želiš:

- Desni uglovi, mjereni u smjeru kazaljke na satu na stajnoj tački koju dionica napušta, od zadnje stajne tačke do sljedeće: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` i `270.0028` također rade.
- Smjerni uglovi: `N 45°30'15" E 125.50 B`, ili azimut kao jedna riječ: `AZ 45-30-15 125.50 B`.
- Na petlji s uglovima završi s `close` i ponovo uglom na početku, mjerenim od zadnje stajne tačke do druge: `close 270°00'05"`. Time se provjeravaju uglovi.

Redovi koji se ne mogu pročitati navedeni su s brojevima redova. Riječi "feet", zarezi i redovi komentara s `#` su u redu.

## Pročitaj zatvaranje

Dok tipkaš, dijalog prikazuje:

- **Ugaono odstupanje od zatvaranja**: koliko su uglovi daleko od zatvaranja i koji udio otpada na svaki ugao. Bez zatvaračkog ugla uglovi se ne provjeravaju, a svaka greška u njima pojavit će se u linearnom odstupanju.
- **Linearno odstupanje od zatvaranja**: koliko je završetak vlaka udaljen od mjesta gdje bi trebao završiti, i u kojem smjeru.
- **Tačnost**: dužina vlaka podijeljena linearnim odstupanjem: 1 : 10,000 znači 1 ft na 10,000 ft.
- Stajne tačke nakon izravnanja i koliko se pomjerila svaka.

## Izravnanje

Prvo se ugaono odstupanje od zatvaranja ravnomjerno raspodijeli na uglove. Zatim se linearno odstupanje raspodijeli na dionice po pravilu kompasa (Bowditch): svaka stajna tačka pomjera se suprotno odstupanju srazmjerno dužini prijeđenog puta do nje, tako da vlak završava tačno tamo gdje treba.

:::note
Pravilo kompasa je standardno izravnanje, a ne metoda najmanjih kvadrata, i ne vaga uglove u odnosu na dužine. Je li tačnost dovoljna, prepušteno je tvojim standardima i propisima tvoje jurisdikcije.
:::

## Iskoristi rezultat

- **Dodaj kao geodetske tačke**: izravnate stajne tačke postaju geodetske tačke s nazivima koje si dao (inače sljedeći slobodni brojevi), opis `TRAV`, bez kote. Posljednja stajna tačka petlje je njen početak, pa se ne dodaje dvaput. Jedan korak: {{key:Mod+Z}} to poništava.
- **Dodaj kao parcelu** (petlje): izravnate stajne tačke postaju [parcela](topic:parcels), s njenim oznakama i pravnim opisom.
- **Izvještaj (CSV)**: linije zatvaranja, zatim za svaku stajnu tačku smjer, dužina, neizravnate i izravnate koordinate i popravke.
