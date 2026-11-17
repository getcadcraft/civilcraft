---
title: Radni prostor za pejzaž
summary: Planovi sadnje, nivelacija, popločavanje, zidovi, stepenice, navodnjavanje i listovi pejzaža na istoj lokaciji, istim površinama i istoj datoteci kao i građevinski radovi.
keywords: pejzaž, pejzažna arhitektura, bašta, sadnja, biljke, drveće, nivelacija, tvrdo uređenje, popločavanje, navodnjavanje, prskalice, radni prostor, projektovanje lokacije, plan pejzaža
from: eea929d1
---

Radni prostor za pejzaž donosi alate za projektovanje pejzaža na lokaciju CivilCraft-a koju već imate: iste tačke geodetskog snimanja, isti postojeći teren, istu projektovanu površinu i istu datoteku projekta.

## Otvaranje

Izaberite {{ui:Površina}} › {{ui:Više}} › {{ui:Radni prostor za pejzaž}}. Traka sa alatima tada prikazuje izbor **Radni prostor** i grupu **Pejzaž**, a grupe Površina, Projektovanje i GIS se povlače da naprave mjesta. Za povratak izaberite **Građevinski** pod Radni prostor. CivilCraft pamti radni prostor koji ste zadnji koristili na ovom računaru.

Lijevi panel na vrhu dobija tri odjeljka:

- **Biljke**: spisak biljaka, za pretragu i izbor onoga što postavljate. Pogledajte [Spisak biljaka](topic:plant-list).
- **Provjere nivelacije**: analiza nagiba, strelice toka i zadržavanje vode. Pogledajte [Nivelacija](topic:landscape-grading).
- **Navodnjavanje**: raspršivači i cijevi koje postavljate sljedeće, postavke izvora vode. Pogledajte [Navodnjavanje](topic:irrigation).

## Šta je u grupi Pejzaž

| Alat | Šta radi | Tema |
|---|---|---|
| **Biljka**, **Gredica**, **Živica** | Pojedinačne biljke, gredice za sadnju popunjene razmakom biljaka, živice duž linije | [Sadnja](topic:planting) |
| **Nivelacija** | Platforme, nasipi, jarci za odvodnju, površine nivelacije sa tačkastim kotama i izohipsama, provjere nagiba i toka | [Nivelacija](topic:landscape-grading) |
| **Tvrdo uređenje** | Popločavanje, staze, zidovi, ivičnjaci, rampe i stepenice koje prate teren | [Tvrdo uređenje](topic:hardscape) |
| **Površine** | Uređene površine: travnjaci, gredice, livade i pokrivači tla sa slojevima, odsječeni oko tvrdog uređenja | [Uređene površine](topic:planted-areas) |
| **Nivoi** | Modifikatori terena redom sa iskopom i nasipom, tačkasti nivoi, strelice nagiba, linije presjeka | [Modifikatori terena](topic:ground-modifiers), [Presjeci](topic:landscape-sections) |
| **Navodnjavanje** | Raspršivači, cijevi, ventili, linije kapanja, dovod, pokrivanje i hidraulička provjera | [Navodnjavanje](topic:irrigation) |
| **Više** | Iz linije (objekti povezani sa linijama), spisak biljaka, tabela biljaka, radni listovi, grafika biljaka, slobodni objekti, listovi za pejzaž i set za objavu, IFC izvoz, veličina i oznake biljaka | [Objekti iz linija](topic:objects-from-lines), [Zapisi o biljkama](topic:plant-records), [Radni listovi](topic:worksheets), [Listovi za pejzaž](topic:landscape-sheets), [Slobodni objekti](topic:freeform-objects) |

Sve što dodate je jedan korak poništavanja, spašava se u datoteku projekta i crta se na planu na slojevima nazvanim `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` i `L-IRRG-…`, pa ga nose i DXF, DWG i PDF izvozi.

## Jedna površina za sve

Platforme, nasipi, jarci za odvodnju, površine nivelacije, popločavanje i staze se nivelišu u **projektovanu površinu**, istu koju koriste koridori i platoi. **Postojeći teren** se nikada ne mijenja. Biljke stoje na terenu koji je ispod njih, pa se pomjeraju kad se nivelacija promijeni. Zemljani radovi računaju nivelaciju pejzaža zajedno sa svim ostalim.

:::tip
Prvi put? [Projektovanje bašte, od početka do kraja](topic:landscape-walkthrough) prolazi kroz cijeli radni prostor na uzorku lokacije.
:::
