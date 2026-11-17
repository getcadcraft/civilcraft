---
title: Emner og BCF
summary: Fastgør et problem til planen, en tracé-station, et overfladepunkt eller et rør, giv det en status og kommentarer, og udveksl emnerne som BCF 2.1-filer ved siden af LandXML-filen.
keywords: emne, emner, bcf, kommentar, markering, mangel, fejl, byggeplads, markør, status, åben, løst, lukket, bim collaboration format, landxml, problemer
from: e44153b1
---

Et emne er en note fastgjort til et sted i din CivilCraft-tegning, med en titel, en status og kommentarer. Brug den til at fortælle byggepladspersonale eller et andet program, hvad de skal kigge på, og til at læse svarene tilbage.

## Tilføj et emne

1. Åbn **Terræn, Mere, Emner (BCF)...**
2. Skriv en titel og hvad der er galt.
3. Vælg hvor det skal fastgøres: midten af planvisningen, overfladepunktet i midten, en station på det valgte tracé (skriv stationen og en forskydning; højre er positiv), eller det valgte rør, den valgte brønd eller feature-linje.
4. Tryk **Tilføj emne**. Markøren vises på planen som en lille diamant med sit nummer.

Klik på et emnes titel for at zoome til det, skift dets status i listen (Åben, Aktiv, Løst, Lukket) og tilføj kommentarer. Hver ændring er ét fortrydelsestrin, og emner gemmes i projektfilen.

## Udveksl dem som BCF

- **Eksportér BCF** skriver en BCF 2.1-fil med én topic pr. emne: titel, status, kommentarer og ét visningspunkt med et ortogonalt plankamera og markøren.
- **Importér BCF** læser en BCF-fil (2.0- og 3.0-filer læses i det omfang de passer til 2.1). En topic med et guid, du allerede har, opdaterer det emne (status, nye kommentarer) i stedet for at tilføje et ekstra.
- **Fra Problemer** laver et emne ud af hver åben post i panelet Problemer, der angiver hvor den er.

BCF angiver meter i projektets egne koordinater uden forskydning. Det andet program skal være i samme koordinatsystem som din LandXML-fil, for at markørerne rammer rigtigt. Elementet en markør peger på (tracé, station, forskydning, rør) følger med som etiketter, der starter med "cc:", og CivilCraft læser dem tilbage.

## Hvad der ikke er kontrolleret

Markørerne og visningspunkterne er kun testet ved at skrive en fil og læse den tilbage i CivilCraft. Intet andet BIM-program har endnu åbnet dem, og om BCF'ens "view to world scale" betyder hele eller halv højde af visningen, varierer mellem programmer: CivilCraft skriver hele højden.
