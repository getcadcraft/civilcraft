---
title: Delovno okolje krajinske ureditve
summary: Načrti sajenja, oblikovanje terena, tlakovanje, zidovi, stopnice, namakanje in listi krajinske ureditve na istem mestu, z enakimi površinami in isto datoteko kot gradbena dela.
keywords: krajinska ureditev, krajinska arhitektura, vrt, sajenje, rastline, drevesa, oblikovanje terena, utrjene površine, tlakovanje, namakanje, brizgalke, delovno okolje, zasnova mesta, načrt krajinske ureditve
from: eea929d1
---

Delovno okolje krajinske ureditve prinaša orodja za krajinsko načrtovanje na mesto CivilCraft, ki ga že imate: iste geodetske točke, isti obstoječi teren, isto predvideno površje in isto datoteko projekta.

## Odprtje

Izberite {{ui:Površje}} › {{ui:Več}} › {{ui:Delovno okolje krajinske ureditve}}. Orodna vrstica nato prikaže izbiro **Delovno okolje** in skupino **Krajinska ureditev**, skupine Površje, Načrtovanje in GIS pa se umaknejo, da naredijo prostor. Za vrnitev izberite **Gradbeno** pod Delovno okolje. CivilCraft na tem računalniku zapomni delovno okolje, ki ste ga nazadnje uporabljali.

Levi podokno dobi na vrhu tri razdelke:

- **Rastline**: seznam rastlin za iskanje in izbiro tega, kar postavite. Glejte [Seznam rastlin](topic:plant-list).
- **Preverjanja oblikovanja terena**: analiza naklona, puščice toka in zastajanje vode. Glejte [Oblikovanje terena](topic:landscape-grading).
- **Namakanje**: brizgalke in cevi, ki jih postavite naslednje, nastavitve vodovoda. Glejte [Namakanje](topic:irrigation).

## Kaj je v skupini Krajinska ureditev

| Orodje | Kaj naredi | Tema |
|---|---|---|
| **Rastlina**, **Greda**, **Živa meja** | Posamezne rastline, gredice, zasajene na razmik rastlin, žive meje vzdolž črte | [Sajenje](topic:planting) |
| **Oblikovanje** | Ploščadi, nasipi, zatravljeni jarki, območja oblikovanja s točkovnimi kotami in plastnicami, preverjanje naklona in toka | [Oblikovanje terena](topic:landscape-grading) |
| **Utrjene površine** | Tlakovanje, poti, zidovi, robniki, klančine in stopnice, ki sledijo terenu | [Utrjene površine](topic:hardscape) |
| **Površine** | Zasajene površine: trate, gredice, travniki in rušnice s sestavo, obrezane okoli utrjenih površin | [Zasajene površine](topic:planted-areas) |
| **Kote** | Oblikovalci terena v vrstnem redu z odkopom in nasipom, točkovne kote, puščice naklona, črte prerezov | [Oblikovalci terena](topic:ground-modifiers), [Prerezi](topic:landscape-sections) |
| **Namakanje** | Brizgalke, cevi, ventili, kapalne cevi, dovod, pokritje in hidravlično preverjanje | [Namakanje](topic:irrigation) |
| **Več** | Iz črte (objekti, povezani z risbo), razpredelnica rastlin, tabela rastlin, preglednice, grafika rastlin, prosti objekti, listi krajinske ureditve in komplet za objavo, izvoz IFC, velikost in oznake rastlin | [Objekti iz črt](topic:objects-from-lines), [Zapisi rastlin](topic:plant-records), [Preglednice](topic:worksheets), [Listi krajinske ureditve](topic:landscape-sheets), [Prosti objekti](topic:freeform-objects) |

Vse, kar dodate, je en korak razveljavitve, shranjen je v datoteki projekta in riše na načrtu na slojih z imeni `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` in `L-IRRG-…`, zato to nosijo tudi izvozi DXF, DWG in PDF.

## Ena površina za vse

Ploščadi, nasipi, zatravljeni jarki, območja oblikovanja, tlakovanje in poti se oblikujejo v **predvideno površje**, isto, ki ga uporabljajo koridorji in podlage. **Obstoječi teren** se nikoli ne spremeni. Rastline stojijo na terenu, ki je pod njimi, zato se premaknejo, ko se oblikovanje spremeni. Zemeljska dela štejejo krajinsko oblikovanje skupaj z vsem drugim.

:::tip
Še niste vajeni? [Načrtovanje vrta od začetka do konca](topic:landscape-walkthrough) gre skozi celotno delovno okolje na vzorčnem mestu.
:::
