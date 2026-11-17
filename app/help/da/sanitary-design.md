---
title: Beregn dimensionerende spildevandsflow og kontrollér kloakken
summary: Indtast de personer og det areal, der kommer ind ved hver brønd i et spildevandsnet; CivilCraft lægger dem sammen nedstrøms i nettet, beregner spidsflowet med en spidsfaktor og indsivning og kontrollerer hvert rørs kapacitet og hastighed.
keywords: spildevand, kloak, spildevandskloak, dimensionerende flow, spidsflow, spidsfaktor, harmon, babbitt, indsivning, befolkning, pr. person, procent fuld, selvrensende, hastighed, rørdimensionering, dimensioneringsark
from: 73ba197a
---

Dimensionerende spildevandsflow arbejder på [rørnettet](topic:pipe-network), når dets {{ui:Type}} er {{ui:Spildevand}}. Uden noget valgt viser højre panel så **Dimensionerende spildevandsflow**, hvor et regnvandsnet viser regnvandsafløb.

## Indtast hvad der kommer ind

1. Vælg en brønd. Under **Dimensionerende spildevandsflow** skriver du {{ui:Personer, der kommer ind her}} og {{ui:Areal, der kommer ind her}} (hektar i et meterprojekt, acres i et fodprojekt).
2. For butikker, kontorer eller industri skriver du ækvivalente personer: arealet gange de personer pr. hektar (eller acre), dit forvaltningsorgan bruger. Arealet tæller med i indsivningen under alle omstændigheder.
3. Gentag for hver brønd, hvor en gade eller en grund tilsluttes. En brønd, hvor intet tilsluttes, beholder begge på 0.

Hvert rør fører alt, der kommer ind ved sin øvre brønd og ovenfor den. Vælg en brønd for at se, hvad der løber igennem den.

## Indstillingerne

| Indstilling | Hvad den betyder |
|---|---|
| {{ui:Strøm pr. person}} | det gennemsnitlige døgnforbrug pr. person: liter (meterprojekt) eller US-gallons (fodprojekt) |
| {{ui:Indsivning}} | grundvand, der sive ind: liter i sekundet pr. hektar, eller gallon pr. døgn pr. acre |
| {{ui:Spidsfaktor}} | Harmon, 1 + 14 / (4 + √P), eller Babbitt, 5 / P^0.2, med P befolkningen i tusinder |
| {{ui:Spidsfaktor mindst}} / {{ui:Spidsfaktor højst}} | faktoren holdes mellem disse to |
| {{ui:Manning n}} | til kapacitet og hastighed |
| {{ui:Mindste hastighed}} / {{ui:Største hastighed}} | ved spidsflowets egen dybde i røret |
| {{ui:Højst af fuld kapacitet}} | hvor fuldt et rør må løbe ved spidsflowet, som procent af det, det fører, når det løber fuldt |

Startværdierne er pladsholdere, ikke en standard. Brug de værdier, dit forvaltningsorgan offentliggør.

## Hvad den beregner

For hvert rør, i flowrækkefølge:

- spidsflow = personer × flow pr. person × spidsfaktor + areal × indsivning
- kapacitet ved fuld strømning (Mannings ligning ved rørets hældning), og hvor fuldt spidsflowet gør det
- spidsflowets normale dybde og hastigheden der

Tabellen **Spildevandsresultater** lister hvert rørs personer, spidsfaktor, spidsflow (L/s, eller gpm og kubikfod pr. sekund), procent fuld og hastighed. Problemer vises under den: et rør, der er mere fuldt end grænsen, langsommere end den mindste hastighed (det renser måske ikke sig selv), hurtigere end den største, eller uden fald. {{ui:Dimensionér rørene til disse strømme}} vælger for hvert rør den mindste standardstørrelse (200 mm eller 8 tommer og op), der fører sit spidsflow inden for grænsen; ét {{key:Mod+Z}} fortryder det.

:::note
Dette er det stationære spidsflow, et dimensioneringsark beregner, kontrolleret mod et publiceret dimensioneringsark til dets trykte afrunding. Det er ikke en model af kloakken over tid: ingen hydrografer, magasinering, pumper eller overløb. Se [Ikke lavet endnu](topic:not-built-yet).
:::

Hastigheder bruger Mannings ligning med den samme n på alle dybder. Nogle forvaltningsorganers delfyldte diagrammer lader n ændre sig med dybden, hvilket giver en lidt lavere hastighed i et rør, der løber 60 til 70 procent fuldt (ca. 3 procent mindre).
