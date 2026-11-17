---
title: Startverdier og plassholdere
summary: Hver verdi CivilCraft starter med, for nye prosjekter, visning, veglinjer, byggeplater, korridorer, rørnett, volumer og plott, og hvilke som er plassholdere som må erstattes.
keywords: standardverdier, startverdier, innstillinger, plassholdere, prosjekteringskrav, standarder, regler, forutsetninger
from: fbfc7432
---

CivilCraft har ingen innstillingsdialog eller mal. Dette er verdiene ting starter med. Verdier merket **plassholder** er ikke hentet fra noen standard: erstatt dem med prosjektets egne krav før du stoler på en kontroll eller en mengde.

## Nytt prosjekt

| Innstilling | Verdi |
|---|---|
| Navn | Uten navn (navnet på den første punktfilen erstatter det) |
| Enheter | US feet |
| Navn på terrengmodell | Eksisterende terreng |
| Punktgrupper | Hver gruppe starter som {{ui:Punkter}} |
| Lengste ytterkant | 0 (behold alle trekanter) |
| Angrertrinn som beholdes | 200 |

## Visning

| Innstilling | Verdi |
|---|---|
| Terrengmodell | {{ui:Eksisterende terreng}} |
| Kurver hver | 1 (ft eller m) |
| Hovedkurve hver | 5. kurve |
| Antall bånd | 8 |
| På | Kurver, kurveetiketter, punkter, bruddlinjer, terrengmodellens kant, rør |
| Av | Trekanter, høydebånd, fallpiler, punktetiketter |

## Veglinjer og profiler

| Innstilling | Verdi |
|---|---|
| Navn | Veglinje 1, Veglinje 2 … |
| Startstasjon | 0+00 |
| Kurveradius ved hvert mellomliggende PI | 100 ft eller 30 m, mindre hvis det ikke får plass i halvparten av hver tangent |
| Prosjekteringsprofil | Ingen før du starter en. {{ui:Start fra terrenget}} setter en PVI på terrenget i hver ende |
| Lengde på vertikalkurve | 0 (ingen kurve) til du skriver en |

## Byggeplater

| Innstilling | Verdi |
|---|---|
| Navn | Byggeplate 1, Byggeplate 2 … |
| Høyde | Terrenget i byggeplatens midtpunkt, avrundet til 0.1 (0 hvis midtpunktet er utenfor terrengmodellen) |
| Skjæringshelning | 2 : 1 (plassholder) |
| Fyllingshelning | 3 : 1 (plassholder) |

## Korridorsammenstilling (plassholdere)

| Innstilling | US feet | Meter |
|---|---|---|
| Kjørefeltbredde | 12 ft | 3.6 m |
| Kjørefeltshelning | 2 % | 2 % |
| Skulderbredde | 4 ft | 1.2 m |
| Skulderhelning | 4 % | 4 % |
| Skjæringshelning | 2 : 1 | 2 : 1 |
| Fyllingshelning | 3 : 1 | 3 : 1 |
| Snitt hver | 10 ft | 5 m |

## Rørnett

| Innstilling | US feet | Meter |
|---|---|---|
| Navn og type | Overvann, overvann | Overvann, overvann |
| Minste fall (plassholder) | 0.50 % | 0.50 % |
| Minste overdekning (plassholder) | 2 ft | 0.6 m |
| Fall i kummer (plassholder) | 0.10 ft | 0.03 m |
| Diameter på ny kum | 48 in | 1200 mm |
| Diameter på nytt rør | 12 in | 300 mm |
| Sumpdybde | 0 | 0 |
| Kumlokk | Fra terrenget | Fra terrenget |

Et rørnett åpnet fra LandXML bruker disse reglene også, fordi LandXML ikke har dem med.

## Volumer

| Innstilling | Verdi |
|---|---|
| Metode | Rutenett, prøvetatt i cellesentrene innenfor dagslinjene |
| Cellestørrelse | Valgt slik at det avgrensede rektangelet til det formede arealet inneholder omtrent 250 000 celler (1, 2 eller 5 ganger en tierpotens) |
| Svell og krymp | Ingen |

## Plott

| Innstilling | Verdi |
|---|---|
| Område | {{ui:Alt}} |
| Papir | Tabloid 11 × 17 in (fotprosjekter), ISO A3 (meterprosjekter); alltid liggende |
| Målestokk | Den største oppførte målestokken som passer |
| Blekk | {{ui:Layerfarger}} |

DXF-etiketter er dimensjonert for målestokken der alt får plass på Tabloid (fot) eller A3 (meter).
