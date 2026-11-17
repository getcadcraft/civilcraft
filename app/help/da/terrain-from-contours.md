---
title: Terræn fra højdekurver
summary: Lav terrænoverfladen ud fra et højdekurvekort: vælg linjelagene, angiv hvor hver linjes kote kommer fra, kontrollér for krydsninger og dubletter, og byg. Højdekurver bliver til brudlinjer, med flade trekanter på rygge og i dale rettet. Et kort tegnet fra et billede eller en PDF kan skaleres og placeres ud fra to kendte punkter.
keywords: højdekurver, højdekurvelinjer, terræn fra højdekurver, overflade fra højdekurver, topografisk kort, opmålingskort, ingen koordinater, brudlinjer, flade trekanter, ryg, dal, bjergtop, krydsende højdekurver, dublerede højdekurver, højdekurveinterval, skalér et kort, to punkter, placér et kort, DXF, DWG, shapefile
from: e6161653
---

En landinspektør sender nogle gange et højdekurvekort: linjer med koter, men ingen punkter. CivilCraft bygger det eksisterende terræn ud fra disse linjer.

## Hent højdekurverne ind

Åbn kortet som stregtegning: en DXF- eller DWG-tegning, en shapefile eller GeoJSON (**GIS** › {{ui:Importér}}, eller træk filen ind på planen). Linjerne kommer ind som **kortlag**. Under **Terræn** › {{ui:Mere}} vælger du {{ui:Terræn fra højdekurver}}.

## Angiv hvor hver kote kommer fra

Sæt flueben ved de lag, der indeholder højdekurver, og vælg derefter **Kote fra**:

- {{ui:Linjernes egne koter}}: en linje, hvis hjørnepunkter alle har samme kote (en 3D-polylinje, eller en polylinje med en kote). En linje i 0 er plan-stregtegning og har ingen kote.
- Et **talfelt** i laget (for eksempel ELEV), når kortet kom med et.
- {{ui:En start og et interval, i den rækkefølge linjerne er opført}}: til linjer uden nogen kote. Den første opførte linje får **Første linjes kote**, den næste den plus **Højdekurveinterval**, og så videre. Opfør linjerne fra den laveste og op (eller omarrangér dem i laget).

## Kontrollér, og byg

{{ui:Kontrollér}} lister det, der er forkert, med ord, før noget ændres:

- en linje med **ingen kote** eller færre end to punkter;
- en **dublet**-linje (samme form to gange, selv tegnet den anden vej rundt);
- to linjer, der **krydser** hinanden, i forskellige koter eller i den samme (også en linje, der krydser sig selv), med stedet;
- en kote, der **ikke ligger på intervallet** (en skrivefejl som 105.5 på et kort med 1 m-interval).

Sæt flueben i {{ui:Udelad linjer, der krydser en anden}} for at fjerne den linje, der krydser flest andre (så den næste, indtil ingen krydser): det er en løsrevet linje, der skærer hver højdekurve, der fjernes, ikke højdekurverne. **Forenkl linjer inden for** fjerner hjørnepunkter, der ligger tættere på en lige strækning end den afstand.

{{ui:Byg terrænet}} tilføjer linjerne til det eksisterende terræn som brudlinjer (ét trin med fortryd), så overfladen går præcis gennem hver højdekurve. Med {{ui:Ret flade trekanter på rygge, i dale og på toppe}} markeret og et interval angivet, tilføjer CivilCraft også et punkt inde i hver flad trekant (en trekant, hvis hjørner alle ligger på én højdekurve) i den højde, skråningen ved siden af fortsætter til, aldrig mere end et halvt interval fra højdekurven. Uden det fremstår rygtoppe, dalbunde og bjergtoppe som flade plader. På en testbakke faldt fejlen i forhold til den sande overflade med en fjerdedel; på en ryg med 40 %.

## Et kort uden koordinater

For et højdekurvekort, der er overtegnet fra et billede eller en PDF, åbn **Skalér og placér lagene ud fra to kendte punkter**. Angiv to punkter på kortet og hvor de rent faktisk ligger; de markerede lag skaleres, drejes og flyttes, så de passer (ét trin med fortryd; højder ændres ikke). De samme to punkter giver skalaen (vist i meddelelsen) og drejningen.

Overfladen er så god som kortet: mellem to højdekurver er den et plan, så det virkelige terræn mellem dem er ukendt. Kontrollér resultatet mod punktkoter, før du stoler på det.
