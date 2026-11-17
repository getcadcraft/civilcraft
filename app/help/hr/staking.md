---
title: Izradite izvješće o iskolčenju
summary: Navedite kolce duž osi trase na stacionažama i odmacima ili točke snimanja u blizini, sa stacionažom, odmakom, sjeverom, istokom, projektnom i terenskom visinom te iskopom ili nasipom, i spremite izvješće kao CSV ili PDF.
keywords: iskolčenje, iskolčivanje, izvješće o kolcima, list iskopa, list nivelacije, stacionaža, odmak, iskop, nasip, raspored, iskolčenje gradnje, izvedeno stanje
from: d8a4e9f1
---

Odaberite os trase i kliknite **Izvješće o iskolčenju** u njezinim **Svojstvima**.

## Kolci na stacionažama i odmacima

1. **Od** i **do**: stacionaže za iskolčenje (1+50 ili 150).
2. **svakih**: razmak. Kolci se postavljaju na svakom višekratniku, na oba kraja i (uz označen okvir) tamo gdje počinju i završavaju krivulje osi trase.
3. **Odmaci**: lijevo i desno od osi trase, gledajući prema rastućoj stacionaži: `12 L, 0, 12 R`, `L12 CL R12` ili `-12, 0, 12` (lijevo je minus). Os trase s koridorom počinje s rubovima kolnika i bankinama.
4. **Brojevi od** i **s prefiksom** imenuju kolce: 1, 2, 3, ili S101, S102.

## Točke snimanja blizu osi trase

Odaberite **točke snimanja blizu osi trase** i koliko blizu. Svaka točka unutar te udaljenosti dobiva svoju stacionažu i odmak, projekt na tom mjestu i vlastitu visinu kao teren: provjeru točaka iskolčenih ili snimljenih kao izvedeno stanje.

## Što izvješće kaže

| Stupac | Što je |
|---|---|
| Točka | Naziv kolca ili broj točke snimanja |
| Stacionaža, odmak | Gdje se nalazi duž osi trase: L lijevo, R desno |
| Sjever (N), istok (E) | Njegove koordinate |
| Projektna visina | Površina isplaniranog koridora na tom mjestu (od nožice do nožice), inače projektni uzdužni profil na osi |
| Visina terena | Postojeća površina na tom mjestu ili vlastita visina točke snimanja |
| Iskop/nasip | C kada je teren iznad projekta (iskop), F kada je ispod (nasip), na stotinku |

Kolac bez projektne visine (izvan koridora ili na osi trase bez nje izvan osi) nema iskop ni nasip; dijaloški okvir kaže koliko ih je.

## Spremite

- **CSV**: redak s naslovom, zatim gore navedeni stupci te iskop ili nasip kao predznačen broj (teren minus projekt) za tablične kalkulatore i uređaje za prikupljanje podataka.
- **PDF**: stranice s tablicom na papiru koji odaberete, jedan kolac po retku, iskopi narančastom, a nasipi zelenom bojom, s naslovnom trakom kao na ostalim listovima.

:::note
Kolci se računaju iz projekta. Provjerite ih prema odobrenim planovima prije bilo kakve gradnje.
:::
