---
title: Radni prostor Pejzažno uređenje
summary: Planovi sadnje, nivelacija, popločavanje, zidovi, stepenice, navodnjavanje i listovi pejzaža na istom lokalitetu, istim površima i istoj datoteci kao građevinski radovi.
keywords: pejzažno uređenje, pejzažna arhitektura, bašta, sadnja, biljke, drveće, nivelacija, tvrdo uređenje, popločavanje, navodnjavanje, raspršivači, radni prostor, projektovanje lokaliteta, plan pejzaža
from: eea929d1
---

Radni prostor Pejzažno uređenje stavlja alate za projektovanje pejzaža na lokalitet CivilCraft-a koji već imate: iste tačke snimanja, isti postojeći teren, istu projektovanu površ i istu datoteku projekta.

## Otvaranje

Izaberite {{ui:Površ}} › {{ui:Više}} › {{ui:Radni prostor za pejzažno uređenje}}. Traka sa alatima tada prikazuje izbor **Radni prostor** i grupu **Pejzažno uređenje**, a grupe Površ, Projektovanje i {{ui:GIS}} se sklanjaju da naprave mesta. Izaberite **Građevinski** pod Radni prostor da se vratite. CivilCraft pamti radni prostor koji ste poslednji koristili na ovom računaru.

Levi panel dobija tri odeljka na vrhu:

- **Biljke**: spisak biljaka, za pretragu i izbor onoga što postavljate. Pogledajte [Spisak biljaka](topic:plant-list).
- **Provere nivelacije**: analiza nagiba, strelice toka i zadržavanje vode. Pogledajte [Nivelacija](topic:landscape-grading).
- **{{ui:Navodnjavanje}}**: raspršivači i cevi koje postavljate sledeće, postavke izvora vode. Pogledajte [Navodnjavanje](topic:irrigation).

## Šta je u grupi Pejzažno uređenje

| Alat | Šta radi | Tema |
|---|---|---|
| **Biljka**, **Gredica**, **Živica** | Pojedinačne biljke, gredice za sadnju popunjene na razmaku biljaka, živice duž linije | [Sadnja](topic:planting) |
| **Nivelacija** | Platforme, nasipi, odvodni jarci, površine nivelacije sa kotama tačaka i izohipsama, provere nagiba i toka | [Nivelacija](topic:landscape-grading) |
| **Tvrdo uređenje** | Popločavanje, staze, zidovi, ivičnjaci, rampe i stepenice koji prate teren | [Tvrdo uređenje](topic:hardscape) |
| **Površine** | Zasađene površine: travnjaci, gredice, livade i pokrivač tla sa slojevima, isečene oko tvrdog uređenja | [Zasađene površine](topic:planted-areas) |
| **Kote** | Modifikatori terena u redosledu sa iskopom i nasipom, kote tačaka, strelice nagiba, linije preseka | [Modifikatori terena](topic:ground-modifiers), [Preseci](topic:landscape-sections) |
| **Navodnjavanje** | Raspršivači, cevi, ventili, linije kapanja, dovod, pokrivenost i hidraulička provera | [Navodnjavanje](topic:irrigation) |
| **Više** | Iz linije (objekti povezani sa linijama crteža), spisak biljaka, tabela biljaka, radni listovi, grafika biljaka, slobodni objekti, listovi pejzaža i skup za objavljivanje, izvoz IFC, veličina i oznake biljaka | [Objekti iz linija crteža](topic:objects-from-lines), [Zapisi biljaka](topic:plant-records), [Radni listovi](topic:worksheets), [Listovi pejzaža](topic:landscape-sheets), [Slobodni objekti](topic:freeform-objects) |

Sve što dodate je jedan korak opozivanja, čuva se u datoteci projekta i crta se na planu na slojevima imenovanim `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` i `L-IRRG-…`, pa ih izvozi DXF, DWG i PDF takođe nose.

## Jedna površ za sve

Platforme, nasipi, odvodni jarci, površine nivelacije, popločavanje i staze se nivelišu u **projektovanu površ**, istu koju koriste podloge i koridori. **Postojeći teren se nikad ne menja.** Biljke stoje na terenu koji je ispod njih, pa se pomeraju kad se nivelacija promeni. Zemljani radovi broje nivelaciju pejzaža zajedno sa svim ostalim.

:::tip
Prvi put? [Projektovanje bašte, od početka do kraja](topic:landscape-walkthrough) prolazi kroz ceo radni prostor na uzorku lokaliteta.
:::
