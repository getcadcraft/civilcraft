---
title: Plan- och profilblad
summary: Plotta en linjeföring som en uppsättning plan- och profilblad i en PDF, med matchlinjer emellan.
keywords: plan och profil, blad, plotta, pdf, matchlinje, planframställning, vägritningar, profilplot, vertikal överdrift, bladsamling
from: 34b4ec78
---

Plan- och profilblad är så vägritningar oftast görs: varje blad visar en sträcka av vägen två gånger, planen ovanför och profilen nedanför, i samma horisontella skala, så att en station hamnar på samma plats i båda.

## Skapa bladen

1. Markera linjeföringen. Klicka på {{ui:Plan- och profilblad}} i **Egenskaper**.
2. Välj **Papper**, **Planskala** och **Profilöverdrift** (hur många gånger högre profilen ritas än den är lång; börja med 10×). Dialogen anger hur många blad det blir och hur mycket av linjeföringen varje blad visar.
3. Om du vill plotta en del av linjeföringen, ändra **Från station** och **Till station**.
4. Klicka på {{ui:Ladda ner PDF}}. PDF-filen har en sida per blad.

## Vad som finns på ett blad

| Del | Visar |
|---|---|
| Plan | Allt på planen (höjdkurvor, mätpunkter, linjeföringen och dess stationering, korridorer, byggplattor, funktionslinjer, ledningar, provlinjer) vänt så att sträckan går tvärs över bladet, med en nordpil vriden på samma sätt |
| Matchlinjer | En streck-prickad linje vinkelrät mot linjeföringen i varje ände som fortsätter på ett annat blad, med etiketten "Matchlinje sta 5+50.00, se blad 2" |
| Profil | Befintlig mark (streckad), projekterad profil (röd), lutningen för varje tangent och varje vertikalkurvas PVI, höjd, L och K; stationer längs nederkanten, höjder på båda sidor |
| Titelfält | Projektnamnet, linjeföringen och dess stationsintervall, "Blad 1 av 3", de horisontella och vertikala skalorna samt överdriften |

Sträckan per blad är så lång som planfönstret tillåter i skalan, avrundad nedåt till en hel 50 ft (20 m) på långa sträckor eller en hel 10 ft (5 m) på korta.

:::note
Om profilens höjder inte ryms vid den överdrift du valt, ritar CivilCraft varje blad i den största av 10×, 5×, 4×, 2× och 1× som ryms, och statusfältet säger det. En krökt linjeföring vrids efter riktningen från början till slutet av varje sträcka, så vägen kan gå något uppåt eller nedåt på bladet.
:::
