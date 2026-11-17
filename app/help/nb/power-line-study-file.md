---
title: Studiefiler for et annet linjeprogram (.DON)
summary: Lagre én luftlinje som en .DON-studiefil, eller les mastene i en til en ny linje. Ikke testet med programmet som leser dem.
keywords: don, .don, studiefil, xml, eksport, import, luftlinjeprogram, strekk, canton
from: 1abc4d07
---

Noen luftlinjeprogrammer lagrer en studie i en `.DON`-fil (XML-tekst). CivilCraft kan skrive én linje som en slik fil og lese mastene i en.

:::warning
**Ikke testet.** Vi laget dette fra en liste over formatets feltnavn som en bruker delte, ikke fra en ekte fil, og vi har ikke åpnet filene våre i programmet som leser dem. Åpne filen der og kontroller hver verdi før du stoler på den. Hvis du kan dele en `.DON`-fil (med kundens opplysninger fjernet), hjelper det oss å rette dette.
:::

## Lagre en studiefil

1. Gi linjen en leder og sørg for at den har resultater (ingen «ikke beregnet» i Egenskaper).
2. {{ui:Mer}} › {{ui:Lagre en studiefil (.DON)…}}, velg linjen, legg til en beskrivelse og et jobbnummer.
3. {{ui:Lagre studiefilen}}.

Filen inneholder linjens master (koordinater, terreng, høyder, roller, tverrarm, mast som beholdes eller foreslås, laster per lastsituasjon, fundament), én seksjon per strekning mellom endemaster (leder, spenning, referansespenn, spenn, spenning og kjedelinjeparameter, største spenning per lastsituasjon) og strekketabellene. Lengder er i meter og krefter i daN; tekst skrives i Latin-1, så et tegn utenfor det blir `?`.

## Lese en studiefil

{{ui:Mer}} › {{ui:Åpne en studiefil (.DON)…}} leser mastene inn i en ny linje. Lederen, mastene og tverrarmene matches mot biblioteket ditt etter navn; det som ikke finnes, må du velge i Egenskaper.
