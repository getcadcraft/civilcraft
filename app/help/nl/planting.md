---
title: Beplantingsplannen en plantenstaten
summary: Enkele planten plaatsen, plantvakken gevuld op de plantafstand van de planten met gemengde planten op percentage, en hagen; ze labelen en tellen in een plantenstaat voor een spreadsheet of TakeoffCraft.
keywords: beplantingsplan, plantenstaat, plantvak, massabeplanting, haag, boom, struik, bodembedekker, plantafstand, driehoekige plantafstand, aantal planten, hoeveelheden, labels, kroon, plantsymbolen, ifc, takeoff
from: ab49eab5
---

## Planten plaatsen

1. Kies een plant in **Planten** links.
2. Klik op {{ui:Plant}} en klik daarna op het plan: elke klik plaatst één plant. Druk op {{key:Esc}} om te stoppen.

Het symbool van een plant wordt getekend op de breedte op volwassen leeftijd; Meer › {{ui:Show at planting size}} tekent elke plant op de maat waarin hij wordt geplant. Bomen staan op de grond onder hun kroon: wanneer u het terrein later aanpast (grading), volgen ze het. Om een plant op een bepaald peil vast te zetten, typt u dat peil in **Peil** in Eigenschappen.

## Plantvakken

1. Kies de hoofdplant, klik op {{ui:Bed}} en klik op de hoekpunten van het vak. Druk op {{key:Enter}} (of klik nogmaals op het eerste hoekpunt) om het te sluiten.
2. Het vak wordt gevuld met die plant op zijn plantafstand, in een **driehoekig** patroon (het gebruikelijke: elke plant staat even ver van zes andere), een halve plantafstand van de rand.
3. In Eigenschappen mengt **Een plant toevoegen** de plant die links is gekozen erdoor. Stel het **Aandeel %** van elke plant in: het vak neemt precies dat aandeel van elk, verspreid over het vak. **Opnieuw mengen** verschuift waar ze staan.

Blijft **Plantafstand** leeg, dan gelden de eigen plantafstanden van de planten (gewogen naar hun aandelen); vul er een in om die voor elke plant te gebruiken. Het **Patroon** kan vierkant zijn, en met **Rijen onder hoek** draait u de rijen.

## Hagen

Kies de hagenplant, klik op {{ui:Hedge}}, klik langs de haag en druk op {{key:Enter}}. Planten staan langs de lijn op hun plantafstand, gecentreerd zodat beide uiteinden dezelfde marge hebben. Een haag kan **twee rijen, in verband** zijn, op een vaste afstand van elkaar.

## Labels

Enkele planten krijgen een label volgens de labelinstelling (standaard `{name}`); typ in Eigenschappen uw eigen label voor één plant. Vakken krijgen het aantal van elke plant als label, hagen het hunne. Meer › {{ui:Plant labels}} zet labels aan en uit. Labelvelden: `{name}`, `{botanical}`, `{size}` (de container), `{qty}`, `{height}`, `{spread}`, `{container}`.

## De plantenstaat

Meer › {{ui:Plant schedule…}} telt elke plant per soort, van enkele planten, vakken en hagen samen, met zijn plantmaat. Sla hem op als **CSV** of **XLSX**, of kies **Naar TakeoffCraft verzenden**: een hoeveelhedenbestand dat TakeoffCraft opent om de planten te prijzen (met de verharding- en irrigatiehoeveelheden ernaast).

## IFC

Meer › {{ui:Export landscape IFC}} slaat het landschap op als IFC-bestand (IFC 4.3) dat een BIM-model kan bevatten: elke plant als een `IfcGeographicElement` van type VEGETATION, getypeerd naar zijn soort, met de eigenschappen van de plant (botanische naam, maten, winterhardheid, water, licht); elk vak en elke haag als één element met hun aantallen, op het terrein. BimCraft opent het naast het gebouw.
