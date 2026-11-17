---
title: "Klimafremtider: flom, varme og skogbrann i 2050 og 2080"
summary: I Adresse til tomt: hev tomtens flomnivå for et fremtidig klima, vurder skogbrannfaren og morf en værfil, og vis nåtid og fremtid side om side, fra en klimadatapakke (SSP2-4.5 og SSP5-8.5, 2050 og 2080).
keywords: klima, klimaendringer, fremtid, 2050, 2080, ssp, cmip6, scenario, havnivå, flom, grunnflomhøyde, bfe, fema, varme, værfil, epw, morfing, skogbrann, buskbrann
from: b0d2ee38
---

Klimatallene kommer fra en **datapakke**, ikke fra appen. Slå på tillegget {{ui:Klimafremtider}} under {{ui:Innstillinger}} › Tillegg, eller last inn en pakkefil du selv har i blokken {{ui:Klimafremtid}}.

:::warning
Pakken som følger med tillegget er et **eksempel**: tre steder (Denver, Miami, Johannesburg), én klimamodell, fem år i hver 20-årsperiode. Den finnes for å prøve verktøyene, **ikke til prosjektering**. En full pakke bygges med `tools/climate/build-pack.mjs` fra NASAs NEX-GDDP-CMIP6-data.
:::

## Hvor det er

Terrengmodell › Mer › Adresse til tomt. Sett punktet, legg til lagene (et FEMA-flomlag gir grunnflomhøyden), og trykk knappen som leser tomten. Under tomtens rader er blokken {{ui:Klimafremtid}}: velg en **Scenario** (SSP2-4.5 eller SSP5-8.5) og et **År** (2050 = 2041-2060, 2080 = 2071-2090, begge mot 1995-2014). Stedet i pakken nærmest punktet brukes, eller det du velger; langt fra alle steder brukes de globale gjennomsnittsendringene, og panelet sier det.

## Dimensjonerende flomnivå

Nåværende nivå er FEMAs grunnflomhøyde når flomlaget hadde én (fot, NAVD 88), ellers skriver du inn ditt eget. Velg flomtype (kyst, elv eller kraftig regn, eller begge), flomdybden på stedet for regndelen, og en frihøyde hvis du vil ha en. {{ui:Hev flomnivået}} viser nåværende og fremtidig nivå side om side, havnivådelen og nedbørdelen, og forutsetningene: hele havnivåstigningen legges til et kystnivå; elvestrømmen stiger én til én med den våteste dagens nedbør, og dybden følger strømmen opphøyd i 0.6 (Manning, bred kanal); delene legges sammen.

:::warning
En vurdering av endringen, ikke en flomstudie. Det dimensjonerende flomnivået er myndighetens eller ingeniørens.
:::

## Skogbrannfare (kun vurdering)

Nærmeste vegetasjon, skråningen opp fra den og avstanden gir et bånd fra svært lav til ekstrem, både nåtid og fremtid (fremtiden multipliserer med endringen i brannværindeksen i pakken). **Kun vurdering:** vår egen relative skala for å se om et sted trenger en ordentlig skogbrannvurdering; ikke en vurdering etter norm.

## Varme: en fremtidig værfil

Velg en `.epw`-fil fra nåtiden og {{ui:Lag den fremtidige værfilen}}: den morfes med den publiserte forskyvnings- og strekkmetoden (Belcher, Hacker og Powell 2005), og varmen sammenlignes (middel- og høyeste temperatur, dimensjonerende temperaturer, timer over 30 °C og 35 °C, gradtall). {{ui:Lagre den fremtidige værfilen}} lagrer den for Miljø-panelet, BimCrafts energikontroll eller egne verktøy.

## Hvor tallene kommer fra

NASA NEX-GDDP-CMIP6 (nedskalert CMIP6-modellutdata, CC BY 4.0 per modell) for temperatur, fuktighet, solskinn, nedbør og brannvær; IPCC AR6s globale gjennomsnitt for havnivåstigning, med mindre pakken har lokale tall. Panelet viser pakkens kilde, lisens og dato.
