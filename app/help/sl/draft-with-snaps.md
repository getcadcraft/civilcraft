---
title: Risanje z lovljenjem, izbrana oglišča ter premikanje, kopiranje in zasukanje
summary: Postavite trase, ploščadi, parcele in karakteristične črte natančno na obstoječe točke in oglišča, vpišite ali izberite vzhodno in severno koordinato oglišča, obrnite tangento proti dvema točkama ter premaknite, kopirajte ali zasukajte predmet za razdaljo ali kot.
keywords: lovljenje, osnap, lovljenje na točko, lovljenje na oglišče, PI, vozlišče, oglišče, izbira, zakrižani kazalec, vzhodna koordinata, severna koordinata, koordinate, vpisane koordinate, tangenta, smer, azimut, premik, kopiranje, zasuk, transformacija, kopiranje zasukano, podvoji, alt, prosta točka, risanje
from: 49864dda
---

Novo v 0.9: ko risate, se kazalec prilepi na točke in oglišča, ki so že v načrtu, oglišče ploščadi, parcele ali karakteristične črte pa je mogoče vpisati ali izbrati. Ta tema vodi skozi tri orodja.

## Kaj boste naredili

- Rišite z lovljenjem, da se nova trasa, ploščad, parcela ali črta začne in konča točno na nečem, kar že obstaja.
- Nastavite vzhodno in severno koordinato oglišča tako, da ju vpišete ali izberete mesto v načrtu.
- Obrnite tangento trase proti dvema izbranima točkama.
- Premaknite, kopirajte ali zasukajte celoten predmet.

## Koraki

1. Izberite orodje za risanje, na primer {{ui:Trasa}}, {{ui:Ploščad}}, {{ui:Parcela}} ali {{ui:Karakteristična črta}}. Premaknite kazalec blizu geodetske točke, PI trase, oglišča ploščadi, parcele ali mase, vozlišča karakteristične črte ali meteornega objekta. Prikaže se oznaka z napisom (PI, Oglišče, Vozlišče, Objekt ali Točka in njena številka) ter vzhodna in severna koordinata, na kateri bo pristala. Kliknite, da točko postavite tja.
2. Če želite točko postaviti prosto, med klikom držite {{key:Alt}}. Lovljenje se izklopi.
3. Izberite ploščad, parcelo ali karakteristično črto. V **Lastnostih** blok {{ui:Vogali}} navaja vsako oglišče s poljem za vzhodno koordinato (E) in poljem za severno koordinato (N). Vpišite nove številke ali pritisnite gumb z zakrižanim kazalcem ob oglišču in kliknite mesto v načrtu. Oglišče prevzame to vzhodno in severno koordinato. Za preklic izbire pritisnite {{key:Esc}}. Zakrižani kazalec deluje le v načrtu: najprej zaprite pogled 3D.
4. Za obrat tangente izberite trasо. V **Lastnostih** pod {{ui:Tangenta iz dveh točk}} izberite tangento, pritisnite {{ui:Prva točka}} in kliknite v načrtu, pritisnite {{ui:Druga točka}} in ponovno kliknite, nato pritisnite {{ui:Nastavi smer}}. Tangenta se obrne tako, da teče od prve točke proti drugi, in ohrani svojo dolžino.
5. Za premik, kopiranje ali zasuk izberite trasо, ploščad, parcelo ali karakteristično črto. V **Lastnostih** pod {{ui:Premakni, kopiraj in zasukaj}} vpišite {{ui:Premik vzhodno}} in {{ui:Premik severno}} (negativna števila gredo na zahod in jug) ter pritisnite {{ui:Premakni}} ali {{ui:Kopiraj}}. Ali pritisnite {{ui:Razdalja iz dveh točk}} in kliknite točko, iz katere premaknete, ter točko, na katero premaknete.
6. Za zasuk vpišite kot v {{ui:Zasukaj v nasprotni smeri urnega kazalca}} (stopinje), nato pritisnite {{ui:Zasukaj}} ali {{ui:Kopiraj zasukano}}. Zasuka se okoli sredine svojih oglišč, razen če s zakrižanim kazalcem ob kotu izberete točko, okoli katere naj se zasuka.

## Opombe

- Kopija pusti izvirnik tam, kjer je, in je nato izbrana.
- Vsak premik, kopiranje, zasuk, izbrano oglišče in obrnjena tangenta je en korak razveljavitve.
- Lovljenje seže 10 slikovnih pik od kazalca. Oznaka lovljenja samo ponudi mesto; nič se ne spremeni, dokler ne kliknete.
- Enak zakrižani kazalec je v vrsticah PI trase. Glejte [Trase](topic:alignment), [Parcele](topic:parcels) in [Karakteristične črte](topic:feature-lines).
