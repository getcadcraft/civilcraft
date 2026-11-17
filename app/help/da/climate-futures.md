---
title: "Klimafremtider: 2050 og 2080 oversvømmelse, hede og skovbrand"
summary: "I Adresse til byggegrund hæver du byggegrundens oversvømmelseskote for et fremtidigt klima, vurderer skovbrandseksponeringen og morpher en vejrfil, fremtid ved siden af nu, fra en klimadatapakke (SSP2-4.5 og SSP5-8.5, 2050 og 2080)."
keywords: klima, klimaforandringer, fremtid, 2050, 2080, ssp, cmip6, scenarie, havniveau, oversvømmelse, basisoversvømmelseskote, bfe, fema, hede, vejrfil, epw, morph, skovbrand, buskbrand
from: b0d2ee38
---

Klimatallene kommer fra en **datapakke**, ikke fra appen. Slå add-on'et {{ui:Klimafremtider}} til under Indstillinger › Add-ons, eller indlæs en pakkefil af egen i blokken {{ui:Klimafremtid}}.

:::warning
Pakken der følger med add-on'et er en **prøve**: tre steder (Denver, Miami, Johannesburg), én klimamodel, fem år i hver 20-årig periode. Den er der for at prøve værktøjerne, **ikke til design**. En fuld pakke bygges med `tools/climate/build-pack.mjs` ud fra NASAs NEX-GDDP-CMIP6-data.
:::

## Hvor den er

Overflade › Mere › Adresse til byggegrund. Sæt punktet, tilføj lagene (et FEMA-oversvømmelseslag giver basisoversvømmelseskoten), og tryk på knappen der læser byggegrunden. Under byggegrundens rækker er blokken {{ui:Klimafremtid}}: vælg et **Scenarie** (SSP2-4.5 eller SSP5-8.5) og et **År** (2050 = 2041-2060, 2080 = 2071-2090, begge mod 1995-2014). Det nærmeste sted i pakken til punktet bruges, eller det du vælger; langt fra alle steder bruges de globale gennemsnitlige ændringer, og panelet siger det.

## Dimensionerende oversvømmelseskote

Den nuværende kote er FEMAs basisoversvømmelseskote når oversvømmelseslaget havde en (fod, NAVD 88), ellers skriver du din egen. Vælg oversvømmelsestype (kyst, flod eller kraftig regn, eller begge), oversvømmelsesdybden på stedet for regndelen, og en frihøjde hvis du vil have en. {{ui:Hæv oversvømmelsesniveauet}} viser den nuværende og den fremtidige kote side om side, havniveau- og regndelene og antagelserne: hele havniveaustigningen lægges til en kystkote; flodstrømmen stiger én til én med den vådeste dags nedbør, og dybden følger strømmen i potens 0.6 (Manning, bred kanal); delene lægges sammen.

:::warning
En screening af ændringen, ikke en oversvømmelsesundersøgelse. Den dimensionerende oversvømmelseskote er myndighedens eller din ingeniørs.
:::

## Skovbrandseksponering (kun screening)

Den nærmeste vegetation, hældningen op fra den og afstanden giver et bånd fra meget lav til ekstrem, nu og i fremtiden (fremtiden ganges med pakkens ændring i brandvejrindekset). **Kun screening:** vores egen relative skala til at se, om en byggegrund har brug for en ordentlig skovbrandsvurdering; ikke en kodeklassificering.

## Hede: en fremtidig vejrfil

Vælg en nutidig `.epw`-fil og {{ui:Lav den fremtidige vejrfil}}: den morphes med den offentliggjorte forskydnings- og strækningsmetode (Belcher, Hacker og Powell 2005), og heden sammenlignes (middel- og højeste temperatur, dimensionerende temperaturer, timer over 30 °C og 35 °C, graddage). {{ui:Gem den fremtidige vejrfil}} gemmer den til Miljø-panelet, BimCrafts energikontrol eller dine egne værktøjer.

## Hvor tallene kommer fra

NASA NEX-GDDP-CMIP6 (nedskaleret CMIP6-modeloutput, CC BY 4.0 pr. model) for temperatur, fugtighed, solskin, regn og brandvejr; IPCC AR6's globale middel for havniveaustigning, medmindre pakken har lokale tal. Panelet viser pakkens kilde, licens og dato.
