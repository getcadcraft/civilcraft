---
title: Radni prostor Krajobraz
summary: Planovi sadnje, uređenje terena, popločenja, zidovi, stube, navodnjavanje i listovi krajobraza na istom lokalitetu, istim površinama i u istoj datoteci kao građevinski radovi.
keywords: krajobraz, krajobrazna arhitektura, vrt, sadnja, biljke, drveće, uređenje terena, popločenje, navodnjavanje, prskalice, radni prostor, oblikovanje lokaliteta, plan krajobraza
from: eea929d1
---

Radni prostor Krajobraz stavlja alate za oblikovanje krajobraza na lokalitet koji već imate u programu CivilCraft: iste točke snimke, isti postojeći teren, istu projektiranu površinu i istu datoteku projekta.

## Otvaranje

Odaberite {{ui:Teren}} › {{ui:Više}} › {{ui:Radni prostor Krajobraz}}. Traka alata tada prikazuje izbor **Radni prostor** i grupu **Krajobraz**, a grupe Teren, Projektiranje i GIS se povlače kako bi napravile mjesta. Pod **Radni prostor** odaberite **Građevina** za povratak. CivilCraft pamti radni prostor koji ste zadnji koristili na ovom računalu.

Lijevi panel dobiva tri odjeljka na vrhu:

- **Biljke**: popis biljaka, za pretraživanje i odabir onoga što postavljate. Pogledajte [Popis biljaka](topic:plant-list).
- **Provjere uređenja terena**: analiza nagiba, strelice tečenja i zadržavanje vode. Pogledajte [Uređenje terena](topic:landscape-grading).
- **Navodnjavanje**: prskalice i cijevi koje sljedeće postavljate, postavke izvora vode. Pogledajte [Navodnjavanje](topic:irrigation).

## Što je u grupi Krajobraz

| Alat | Što radi | Tema |
|---|---|---|
| **Biljka**, **Gredica**, **Živica** | Pojedinačne biljke, gredice sadnje ispunjene razmakom biljaka, živice uz liniju | [Sadnja](topic:planting) |
| **Uređenje** | Platforme, nasipići, zaravnjeni jarci, površine uređenja s kotama točaka i izohipsama, provjere nagiba i tečenja | [Uređenje terena](topic:landscape-grading) |
| **Popločenje i građevinski uređeni elementi** | Popločenja, staze, zidovi, rubnjaci, rampe i stube koji prate teren | [Popločenje i građevinski uređeni elementi](topic:hardscape) |
| **Površine** | Zasađene površine: travnjaci, gredice, livade i pokrovnice s slojevima, izrezane oko popločenja | [Zasađene površine](topic:planted-areas) |
| **Kote** | Modifikatori terena po redu s iskopom i nasipom, kote točaka, strelice nagiba, linije presjeka | [Modifikatori terena](topic:ground-modifiers), [Presjeci](topic:landscape-sections) |
| **Navodnjavanje** | Prskalice, cijevi, ventili, linije kapanja, dovod, pokrivenost i hidraulička provjera | [Navodnjavanje](topic:irrigation) |
| **Više** | S linije (objekti povezani s linijama), popis biljaka, tablica biljaka, radne tablice, grafika biljaka, objekti slobodnog oblika, listovi krajobraza i skup za objavu, IFC izvoz, veličina i oznake biljaka | [Objekti iz linija](topic:objects-from-lines), [Zapisi biljaka](topic:plant-records), [Radne tablice](topic:worksheets), [Listovi krajobraza](topic:landscape-sheets), [Objekti slobodnog oblika](topic:freeform-objects) |

Sve što dodate čini jedan korak poništavanja, sprema se u datoteku projekta i crta se na planu na slojevima nazvanim `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` i `L-IRRG-…`, pa DXF, DWG i PDF izvozi nose i njih.

## Jedna površina za sve

Platforme, nasipići, zaravnjeni jarci, površine uređenja, popločenja i staze uređuju se u **projektiranu površinu**, istu koju koriste koridori i platoi. **Postojeći teren** se nikad ne mijenja. Biljke stoje na tlu koje je ispod njih, pa se pomiču kad se uređenje promijeni. Zemljani radovi uključuju uređenje krajobraza zajedno sa svime ostalim.

:::tip
Prvi put? [Oblikovanje vrta, od početka do kraja](topic:landscape-walkthrough) prolazi kroz cijeli radni prostor na primjeru lokaliteta.
:::
