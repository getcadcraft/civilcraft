---
title: Landskapsarbeidsområdet
summary: Planteplaner, terrengforming, belegg, murer, trapper, vanning og landskapsark på samme tomt, med de samme overflatene og den samme filen som anleggsarbeidet.
keywords: landskap, landskapsarkitektur, hage, planting, planter, trær, terrengforming, harde flater, belegg, vanning, sprinklere, arbeidsområde, tomtedesign, landskapsplan
from: eea929d1
---

Arbeidsområdet Landskap legger verktøy for landskapsdesign oppå CivilCraft-tomten du allerede har: de samme oppmålingspunktene, det samme eksisterende terrenget, den samme planlagte overflaten og den samme prosjektfilen.

## Åpne det

Velg {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Landskapsarbeidsområde}}. Verktøylinjen viser da et valg **Arbeidsområde** og en gruppe **Landskap**, og gruppene for terrengmodell, Design og GIS trer til side for å gi plass. Velg **Civil** under Arbeidsområde for å gå tilbake. CivilCraft husker arbeidsområdet du sist brukte på denne maskinen.

Venstre panel får tre seksjoner øverst:

- **Planter**: plantelisten, for å søke og velge hva du plasserer. Se [Plantelisten](topic:plant-list).
- **Terrengkontroller**: fallanalyse, strømningspiler og vannsamling. Se [Terrengforming](topic:landscape-grading).
- **Vanning**: sprinklerne og rørene du plasserer neste, og innstillingene for vanntilførselen. Se [Vanning](topic:irrigation).

## Hva som er i gruppen Landskap

| Verktøy | Hva det gjør | Emne |
|---|---|---|
| **Plant**, **Bed**, **Hedge** | Enkeltplanter, plantebed fylt i plantenes avstand, hekker langs en linje | [Planting](topic:planting) |
| **Terrengforming** | Plattformer, voller, grasgrøfter, terrengformingsområder med kotehøyder og konturer, og fall- og strømningskontroller | [Terrengforming](topic:landscape-grading) |
| **Harde flater** | Belegg, stier, murer, kantsteiner, rampe og trapper som følger terrenget | [Harde flater](topic:hardscape) |
| **Områder** | Plantede områder: plen, bed, eng og bakkedekke med oppbygging, klippet rundt harde flater | [Plantede områder](topic:planted-areas) |
| **Nivåer** | Terrengmodifikatorer i rekkefølge med avskjæring og fylling, kotehøyder, fallpiler og snittlinjer | [Terrengmodifikatorer](topic:ground-modifiers), [Snitt](topic:landscape-sections) |
| **Vanning** | Sprinklere, rør, ventiler, dryppslanger, tilførselen, dekning og en hydraulisk kontroll | [Vanning](topic:irrigation) |
| **Mer** | Fra en linje (objekter koblet til linjene), planteliste, plantetabellen, regneark, plantegrafikk, frie objekter, landskapsark og utgivelsessettet, IFC-eksport, plantestørrelse og merkelapper | [Objekter fra linjer](topic:objects-from-lines), [Plantepost](topic:plant-records), [Regneark](topic:worksheets), [Landskapsark](topic:landscape-sheets), [Frie objekter](topic:freeform-objects) |

Alt du legger til er ett angre-steg, lagres i prosjektfilen, og tegnes på planen på layere med navnene `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` og `L-IRRG-…`, slik at DXF-, DWG- og PDF-eksportene tar det med også.

## Én overflate for alt

Plattformer, voller, grasgrøfter, terrengformingsområder, belegg og stier graderes inn i den **planlagte overflaten**, den samme som korridorer og byggeplater bruker. Det **eksisterende terrenget** endres aldri. Planter står på det terrenget som er under dem, så de flytter seg når terrengformingen endres. Massene fra landskapsterrenget regnes med alt annet.

:::tip
Ny til det? [Tegn en hage, fra start til slutt](topic:landscape-walkthrough) gjennomgår hele arbeidsområdet på eksempeltomten.
:::
