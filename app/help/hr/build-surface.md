---
title: Izrada i dorada terena
summary: Kako CivilCraft triangulira postojeći teren i kako ga oblikovati skupinama prijelomnica, nacrtanim prijelomnicama, vanjskom granicom i najduljim vanjskim bridom.
keywords: tin, teren, triangulacija, prijelomnica, granica, postojeći teren, stvaranje terena, delaunay, trokuti, najveći brid, vanjska granica
from: b9eea3f3
---

CivilCraft ima jedan postojeći teren po projektu. To je TIN (triangulirana nepravilna mreža) izgrađena iz vaših točaka, i automatski se ponovno izrađuje svaki put kad se promijeni neki ulaz. Nema naredbe za ponovnu izradu i nema zastarjelog terena.

## Što ulazi u teren

- Svaka točka s kotom u skupini postavljenoj na {{ui:Točke}}.
- Svaka skupina postavljena na {{ui:Prijelomnica}}, spojena po redoslijedu brojeva točaka.
- Svaka prijelomnica koju nacrtate alatom {{ui:Prijelomnica}}.
- Vanjska granica, ako je nacrtate.
- Postavka **Najduži vanjski brid**.

Trokuti nikad ne prelaze prijelomnicu: teren se prisiljava da je slijedi, zatim se što ravnomjernije izrađuje oko nje (a inače Delaunay).

## Pretvorite kodirane linije u prijelomnice

1. U lijevoj ploči pod **Točke** pronađite skupinu (na primjer FL).
2. Postavite njezin izbor **Teren** na {{ui:Prijelomnica}}.
   Teren se ponovno izradi, linija se crta narančasto (uz uključen {{ui:Prijelomnice}} pod **Prikaz**), a **Prijelomnice** u podacima o terenu povećaju se za jedan.
3. Provjerite liniju na planu. Mora ići od točke do točke redom kojim je snimljena. Ako se lomi kao cik-cak, skupina sadrži više linija ili točke nisu numerirane redom: vratite skupinu na {{ui:Točke}} i nacrtajte linije ručno (sljedeći odjeljak).

## Nacrtajte prijelomnicu kroz točke

1. Pritisnite {{key:B}} ili kliknite {{ui:Prijelomnica}} u grupi **Teren**.
   Traka savjeta kaže: „Prijelomnica: kliknite geodetske točke redom (uzima njihove kote). Enter završava.“
2. Pomaknite pokazivač blizu točke. Mali narančasti kvadrat označava točku koju će uzeti.
3. Kliknite točke linije jednu za drugom. Svaki klik imenuje točku i njezinu kotu u statusnoj traci.
4. Pritisnite {{key:Enter}} za završetak.
   Statusna traka kaže „Prijelomnica 1 dodana; teren je ponovno izrađen.“

Klikovi moraju pasti na geodetsku točku s kotom; klik drugdje se odbija porukom „Kliknite geodetsku točku s kotom: prijelomnica uzima kote točaka.“ {{key:Backspace}} briše zadnju točku; {{key:Esc}} odustaje od cijele linije.

:::warning
Završite s {{key:Enter}}. Dvostruki klik također završava, ali u ovoj verziji odbacuje točku na koju ste dvaput kliknuli. Kliknite zadnju točku jednom, zatim pritisnite {{key:Enter}}.
:::

Da uklonite sve nacrtane prijelomnice odjednom, kliknite {{ui:Ukloni nacrtane prijelomnice}} u odjeljku **Teren**. Da uklonite samo zadnju, upotrijebite {{key:Mod+Z}}. Nacrtane prijelomnice još se ne mogu pojedinačno odabrati ni uređivati.

## Nacrtajte vanjsku granicu

Granica odsijeca teren na područje kojem vjerujete, na primjer granice snimanja, da dugi trokuti preko nesnimljenih kutova nestanu.

1. Pritisnite {{key:O}} ili kliknite {{ui:Granica}}.
2. Kliknite kutove redom oko područja. Isprekidana linija prikazuje oblik.
3. Pritisnite {{key:Enter}}.
   Statusna traka kaže „Granica postavljena; trokuti izvan nje su uklonjeni.“ **Granica** u podacima o terenu kaže „Da“ i broj kutova.

Što treba znati:

- Postoji jedna granica. Crtanje nove zamjenjuje staru. {{ui:Ukloni granicu}} je uklanja.
- Ona samo oduzima: granica koja seže preko točaka odsijeca se na njihov obris, uz napomenu „Granica seže preko točaka; odsječena je na njihov obris.“
- Njezini kutovi uzimaju kote iz terena, pa rub točno slijedi teren.
- Skrivene (unutarnje) granice još nisu dostupne.

## Skratite duge vanjske trokute

Bez granice teren ispunjava cijeli obris točaka, uključujući duge tanke trokute preko konkavnih rubova.

1. U **Teren** upišite duljinu u **Najduži vanjski brid** i pritisnite {{key:Enter}}. Počnite s otprilike dvostrukim do trostrukim uobičajenim razmakom snimanja.
2. Vanjski trokuti čiji je vanjski brid dulji od toga uklanjaju se, postupno prema unutra dok svaki vanjski brid ne postane dovoljno kratak. Brid koji je prijelomnica nikad se ne skida.
3. Upišite 0 da ponovno zadržite sve trokute.

## Pročitajte izvješće o terenu

Ispod podataka o terenu okvir navodi što je izrađivač učinio. S okerom trakom s lijeve strane to je obavijest; s crvenom trakom sadrži grešku i nema terena.

| Poruka | Značenje |
|---|---|
| „3 točke bile su na istom mjestu kao druga i spojile su se s njom.“ | Točke bliže od 0.0001 u tlocrtu postale su jedan vrh (prvi je zadržan). |
| „2 mjesta imaju dvije različite kote …“ | Točke jedna na drugoj ili prijelomnice koje se sijeku ne slažu se u visini. Kota prijelomnice pobjeđuje, zatim prva. |
| „1 dio prijelomnice nije mogao biti prisiljen u teren.“ | Vrlo kratak ili gotovo preklapajući dio prijelomnice nije stao; provjerite to mjesto. |
| „Teren treba najmanje tri točke s kotama.“ | Premalo točaka: provjerite redoslijed stupaca i skupine. |
| „Sve točke su na jednoj liniji: nema trokuta.“ | Točke nemaju širinu, na primjer jedna linija poligonskog vlaka. |
| „Granica ne preklapa točke.“ | Granica je negdje drugdje, često zbog zamjene jedinica ili koordinatnog sustava. |
| „Unutar granice nema preostalih trokuta.“ | Granica je premala ili pogrešno postavljena. |

## Teren pročitan iz LandXML-a

Kad otvorite LandXML, njegov prvi TIN teren koristi se kakav jest: naslov **Teren** kaže „Teren (iz LandXML-a)“, a **Najduži vanjski brid** je zasivljen. Dok je taj teren u uporabi, skupine prijelomnica, nacrtane prijelomnice i nova granica ga ne mijenjaju. Da izradite teren iz točaka datoteke, kliknite {{ui:Ponovno izradi teren iz točaka}}. {{key:Mod+Z}} vraća teren iz LandXML-a.

## Povezano

- [Pročitajte izohipse, kote i nagibe](topic:contours).
- [Uvezite geodetske točke](topic:import-points).
