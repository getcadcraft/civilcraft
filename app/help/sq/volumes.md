---
title: Vëllimet e punimeve të dheut
summary: Lexo vëllimet e prerjes, mbushjes dhe neto midis terrenit ekzistues dhe sipërfaqes së propozuar, për çdo shesh dhe korridor dhe në total, dhe kupto metodën e rrjetës që qëndron pas tyre.
keywords: vëllime, punime dheu, prerje, mbushje, neto, prerje dhe mbushje, sasi, metoda e rrjetës, krahasim sipërfaqesh, sipërfaqe vëllimi, jard kub, metra kub
from: 299d7bc7
---

Sapo një shesh ose një korridor niveloehet pa probleme, CivilCraft krahason sipërfaqen e propozuar me terrenin ekzistues dhe raporton prerjen dhe mbushjen. Numrat përditësohen me çdo ndryshim.

## Ku t’i lexosh

- **Punimet e dheut** në panelin e djathtë kur asgjë nuk është zgjedhur (pamja **Projekti**), kur ka të paktën një shesh ose një korridor.
- **Punimet e dheut** në panelin e djathtë kur një shesh është zgjedhur (të njëjtat totale për gjithë projektin).
- Rreshti nën cilësimet e një korridori, me prerjen dhe mbushjen e vetë atij korridori.

Blloku **Punimet e dheut** shfaq:

- **Prerja**, **Mbushja** dhe **Neto** (me "mbushje" ose "prerje" pas tij, cilado është më e madhe)
- një rresht për çdo artikull kur ka më shumë se një, për shembull "Sheshi 1: prerje 120.4 jard kub, mbushje 310.2 jard kub"
- rreshti i metodës: "Metoda e rrjetës: terreni ekzistues dhe sipërfaqja e niveluar të marra mostra çdo 0.5 ft brenda vijave të kontaktit me terrenin (92,891 qeliza). Nuk u aplikua fryrje ose tkurrje."

Vëllimet janë në jard kub në një projekt në këmbë dhe në metra kub në një projekt në metra.

## Dërgoje te TakeoffCraft

Për të çmuar punimet e dheut, zgjidh {{ui:Dërgo te TakeoffCraft}} në fund të blokut **Punimet e dheut**. CivilCraft ruan një skedar sasish (`<site>.quantities.json`) me dy sasi: prerjen dhe mbushjen, në jard kub (projekt në këmbë) ose metra kub (projekt në metra), të njëjtat numra si blloku, deri në qindësh. Hape në TakeoffCraft me **Hap llogaritjen e sasive**, ose hidhe atje: bëhen dy artikuj që mund t’i çmosh ([Prerja dhe mbushja nga CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Dërgo përsëri pas një ndryshimi dhe hap skedarin e ri: të njëjtët artikuj marrin numrat e rinj.

Vetëm totalet dërgohen, kështu që asgjë nuk numërohet dy herë; shënimi i skedarit liston prerjen dhe mbushjen e secilit shesh dhe korridor.

## Si llogariten

CivilCraft përdor **metodën e rrjetës**:

1. Një rrjet qelizash katrore vendoset mbi zonën brenda çdo vije kontakti me terrenin.
2. Në qendër të çdo qelize, merren mostra nga të dyja sipërfaqet.
3. Çdo qelizë llogaritet si një prizëm: ndryshimi i kotës shumëzuar me sipërfaqen e qelizës. Aty ku sipërfaqja e propozuar është më e ulët, ka prerje; më e lartë, ka mbushje.
4. Qelizat mblidhen.

Madhësia e qelizës zgjidhet për ty, që drejtkëndëshi rreth zonave të niveluara të mbajë rreth 250,000 qeliza, i rrumbullakosur në një vlerë të rregullt (1, 2 ose 5 herë një fuqi të dhjetës). Akoma nuk mund ta vendosësh vetë. Rreshti i metodës të tregon madhësinë e qelizës dhe numrin e qelizave. Qelizat më të vogla janë më të sakta përgjatë skajeve; mbi qeliza të plota midis planeve të sheshta rezultati është i saktë.

## Gjëra për të ditur

- Vetëm sipërfaqja brenda vijave të kontaktit me terrenin numërohet. Terreni jashtë tyre nuk ndryshon.
- Një shesh ose korridor me problem nuk niveloehet dhe nuk shton asgjë. Nëse blloku thotë "Nuk ka ende vëllime: një shesh duhet të nivelohet pa probleme.", shiko për një kuti të kuqe mbi të.
- Kur artikujt mbivendosen, i fundit ka zëvendësuar të parin brenda vijës së kontaktit të tij, dhe mbivendosja numërohet një herë.
- Nuk aplikohet asnjë faktor fryrjeje ose tkurrjeje. Shumëzoji vetë rezultatet nëse të duhen vëllime në gjendje të pa prekur, të lirë ose të ngjeshur.
- Heqja e shtresës sipërfaqësore, thellësitë e rrugës dhe të nënshtresës, dhe vëllimet prizëm TIN-në-TIN nuk janë ende të disponueshme.

## Kontrollimi i një rezultati

- Ndiz {{ui:E propozuar (e nivelluar)}} nën **Shfaqja** dhe shiko izoipsët brenda vijave të kontaktit me terrenin.
- Lëviz treguesin mbi zonën e niveluar: shiriti i statusit shfaq **Terreni** dhe **I niveluar**. Ndryshimi është thellësia e prerjes ose mbushjes në atë vend.
- Për një korridor, lexuesi i pamjes së profilit tregon prerjen ose mbushjen në boshtin qendror në çdo stacion.
