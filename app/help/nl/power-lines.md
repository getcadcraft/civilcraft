---
title: De werkomgeving Elektriciteitslijnen
summary: Bovenleidingen en ondergrondse kabels op uw terrein, met uw eigen bibliotheken, doorhang en trekkracht onder uw belastinggevallen, controles op vrije hoogte en sterkte, montagetabellen, hoeveelheden, bladen en GIS-export.
keywords: elektriciteitslijn, bovenleiding, elektrisch, distributie, palen, masten, geleider, doorhang, trekkracht, montage, vrije hoogte, ondergrondse kabel, sleuf, werkomgeving, netbeheer
from: 638dd856
---

De werkomgeving Elektriciteitslijnen plaatst bovenleidingen en ondergrondse kabels op de CivilCraft-site die u al hebt: dezelfde opmetingspunten, hetzelfde maaiveld, hetzelfde projectbestand.

:::warning
Een ontwerphulpmiddel. De werkomgeving berekent doorhang, trekkracht, vrije hoogten en belastingen op basis van **uw** belastinggevallen en grenzen; er is geen enkele landelijke norm ingebouwd. Een ingenieur controleert elk resultaat tegen de norm die van toepassing is voordat er iets wordt gebouwd.
:::

## Openen

Kies {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Werkomgeving Elektriciteitslijnen}}, of **Elektriciteitslijnen** onder Werkomgeving. De werkbalk toont dan een groep **Elektriciteitslijnen**; de groepen Ontwerp en GIS wijken. Kies **Civil** onder Werkomgeving om terug te gaan. CivilCraft onthoudt de werkomgeving die u het laatst op deze computer gebruikte.

Het linkerpaneel krijgt bovenaan twee secties erbij:

- **Elektriciteitslijnen**: uw belastinggevallen en grenzen, de lijnen en kabels in het project, en **Controles**, altijd actueel. Klik op een controle om het onderdeel te selecteren waar ze over gaat.
- **Bibliotheek**: uw eigen geleiders, kabels, masten, apparatuur en sleuftypen. Zie [Uw elektriciteitslijnbibliotheek](topic:power-line-library).

## Wat er in de groep Elektriciteitslijnen staat

| Hulpmiddel | Wat het doet | Onderwerp |
|---|---|---|
| **Lijn** | Een bovenleiding: klik op elke mast | [Een bovenleiding tekenen](topic:overhead-line) |
| **Mast** | Een mast toevoegen op een overspanning | [Een bovenleiding tekenen](topic:overhead-line) |
| **Kabel** | Een ondergrondse kabelroute in een sleuf | [Ondergrondse kabels](topic:underground-cables) |
| **Apparatuur** | Een kast, een transformator, een verbinding, of de bron waarvan het net wordt gevoed | [Ondergrondse kabels](topic:underground-cables) |
| **Obstakel** | Iets dat een lijn kruist: een weg, een gebouw, een andere lijn | [Controles](topic:power-line-checks) |
| **Profiel** | Het lijnprofiel: het maaiveld, de masten en de geleider bij elk belastinggeval | [Een bovenleiding tekenen](topic:overhead-line#the-line-profile) |
| **Meer** | Belastinggevallen en grenzen, montagetabellen, hoeveelheden, bladen en rapport, GIS, studiebestanden | [Doorhang en trekkracht](topic:sag-and-tension), [Uitvoer](topic:power-line-outputs), [Studiebestanden](topic:power-line-study-file) |

Alles wat u toevoegt is één stap ongedaan te maken, wordt in het projectbestand bewaard en wordt op het plan getekend op lagen met de naam `C-POWR-…`, zodat de DXF-, DWG- en PDF-exports het ook meenemen.
