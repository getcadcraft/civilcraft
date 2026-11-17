---
title: Undersøgelsesfiler til et andet linjeprogram (.DON)
summary: Gem én luftledning som en .DON-undersøgelsesfil, eller læs understøtningerne fra en ind i en ny linje. Ikke testet med det program, der læser dem.
keywords: don, .don, undersøgelsesfil, xml, eksport, import, luftledningsprogram, optrækning, canton
from: 1abc4d07
---

Nogle luftledningsprogrammer gemmer en undersøgelse i en `.DON`-fil (XML-tekst). CivilCraft kan skrive én linje til en sådan fil og læse understøtningerne fra en.

:::warning
**Ikke testet.** Vi har bygget dette ud fra en liste over formatets feltnavne, som en bruger har delt, ikke ud fra en rigtig fil, og vi har ikke åbnet vores filer i det program, der læser dem. Åbn filen dér, og kontrollér hver værdi, før du stoler på den. Hvis du kan dele en `.DON`-fil (med kundens oplysninger fjernet), hjælper det os med at få det rigtigt.
:::

## Gem en undersøgelsesfil

1. Giv linjen en leder, og sørg for, at den har resultater (ingen »ikke beregnet« i dens Egenskaber).
2. {{ui:Mere}} › {{ui:Gem en undersøgelsesfil (.DON)…}}, vælg linjen, og tilføj en beskrivelse og et jobnummer.
3. {{ui:Gem undersøgelsesfilen}}.

Filen indeholder linjens understøtninger (koordinater, terræn, højder, roller, tværbjælke, den understøtning, der er beholdt eller foreslået, laster pr. lasttilfælde, fundament), én sektion pr. strækning mellem endeforankringer (leder, spænding, referencespænd, spænd, spændings- og kædeparametre, den største spænding pr. lasttilfælde) og optrækningstabellerne. Længder er i meter og kræfter i daN; tekst skrives i Latin-1, så et tegn uden for det bliver til `?`.

## Læs en undersøgelsesfil

{{ui:Mere}} › {{ui:Åbn en undersøgelsesfil (.DON)…}} læser understøtningerne ind i en ny linje. Lederen, understøtningerne og tværbjælkerne matches med dit bibliotek efter navn; alt, der ikke findes, lades stå, så du kan vælge det i Egenskaber.
