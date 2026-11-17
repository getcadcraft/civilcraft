---
title: Kwessies en BCF
summary: Heg 'n probleem aan die plan, 'n belyningstasie, 'n oppervlakpunt of 'n pyp vas, gee dit 'n status en kommentaar, en ruil die kwessies uit as BCF 2.1-lêers langs die LandXML-lêer.
keywords: kwessie, kwessies, bcf, kommentaar, opmerking, snag, gebrek, terrein, speld, status, oop, opgelos, gesluit, bim-samewerkingsformaat, landxml, probleme
from: e44153b1
---

'n Kwessie is 'n notas wat aan 'n plek in jou CivilCraft-tekening vasgepen is, met 'n titel, 'n status en kommentaar. Gebruik dit om terreinpersoneel of 'n ander program te wys waarna hulle moet kyk, en om hul antwoorde terug te lees.

## Voeg 'n kwessie by

1. Maak **Oppervlak, Meer, Kwessies (BCF)...** oop
2. Tik 'n titel en wat verkeerd is.
3. Kies waar om dit vas te pen: die middel van die planaansig, die oppervlakpunt in die middel, 'n stasie van die gekose belyning (tik die stasie en 'n verplasing in; regs is positief), of die gekose pyp, struktuur of kenlyn.
4. Druk **Voeg kwessie by**. Die speld verskyn op die plan as 'n klein diamant met sy nommer.

Klik op 'n kwessie se titel om daarna te zoem, verander sy status in die lys (Oop, Aktief, Opgelos, Gesluit) en voeg kommentaar by. Elke verandering is een stap wat met Ontdoen teruggedraai kan word, en kwessies word in die projeklêer gestoor.

## Ruil hulle uit as BCF

- **Export BCF** skryf 'n BCF 2.1-lêer met een onderwerp per kwessie: titel, status, kommentaar, en een aansig met 'n ortogonale plankamera en die speld.
- **Import BCF** lees 'n BCF-lêer (2.0- en 3.0-lêers word gelees vir sover hulle by 2.1 pas). 'n Onderwerp met 'n guid wat jy reeds het, werk daardie kwessie by (status, nuwe kommentaar) in plaas van dat 'n tweede een bygevoeg word.
- **Vanaf Probleme** maak 'n kwessie van elke oop inskrywing in die Probleme-paneel wat sê waar dit is.

BCF dra meter in hierdie projek se eie koördinate, sonder verskuiwing. Die ander program moet in dieselfde koördinaatstelsel as jou LandXML-lêer wees, sodat die spelde op die regte plek land. Die element waarna 'n speld wys (belyning, stasie, verplasing, pyp) reis as etikette wat met "cc:" begin, en CivilCraft lees dit terug.

## Wat nie nagegaan is nie

Die spelde en aansigte is net getoets deur 'n lêer te skryf en in CivilCraft terug te lees. Nog geen ander BIM-program het hulle al oopgemaak nie, en of 'n BCF "view to world scale" die volle of halwe hoogte van die aansig beteken, verskil tussen programme: CivilCraft skryf die volle hoogte.
