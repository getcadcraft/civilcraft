---
title: Objecten uit lijnen, die gekoppeld blijven
summary: Maak bestrating, een beplante zone, een perk, een haag, een pad, een muur, een stoeprand, trappen, een helling, een platform, een greppel of een featurelijn uit een lijn; het volgt de lijn wanneer die verschuift, totdat u de koppeling verbreekt.
keywords: vanuit een lijn, lijnwerk, DWG, DXF, koppeling, gekoppeld, volgen, opnieuw genereren, koppeling verbreken, featurelijn, featurelijn uit lijnwerk, geïmporteerde laag, omtrek, SuperCad Studio, tekenlijn
from: eb67a0c6
---

{{ui:Vanuit een lijn}} (Landschap › {{ui:Meer}}): klik op een featurelijn, of op een lijn of omtrek van een geïmporteerde DWG/DXF-laag. Een gesloten lijn kan bestrating, een gazon, een beplant perk, een weide, bodembedekker, een perk of een platform maken; een open lijn een pad, een muur, een stoeprand, trappen (het eerste en laatste punt), een helling, een haag of een greppel. Beide soorten kunnen een **featurelijn** maken, behalve een featurelijn zelf.

## Een featurelijn uit een lijn

Een featurelijn die uit een lijn is gemaakt, neemt de punten over, gesloten als de lijn gesloten was. De hoogten worden op het bestaande maaiveld gelegd (0 waar er nog geen is), en het gebruik is **Uit**: er wordt geen maaiveld gevormd totdat u een gebruik kiest en de hoogten instelt in de Eigenschappen. Wanneer de lijn verschuift, behoudt een featurelijn met hetzelfde aantal punten elke hoogte die u hebt ingesteld; wanneer de lijn punten krijgt of verliest, worden de hoogten opnieuw op het maaiveld gelegd. Zie [Featurelijnen](topic:feature-lines).

Het nieuwe object behoudt een **koppeling** met zijn lijn. Wanneer de lijn verschuift (u sleept de punten, of de tekening wordt verplaatst of opnieuw gelezen), neemt het object de nieuwe vorm aan in dezelfde ongedaan-maakstap, en via de maaiveldaanpassingen volgt het ontwerpmaaiveld. Eigenschappen laat zien waaraan het is gekoppeld; {{ui:Koppeling verbreken}} maakt het vrij.

Lijnen worden eerst gecontroleerd: een lijn heeft minstens 2 punten nodig (3 voor een omtrek), hooguit 5000, reële getallen; een omtrek moet gesloten zijn en mag zichzelf niet kruisen. Een lijn die niet slaagt, wordt niet gebruikt: het object blijft zoals het was en het paneel Problemen zegt waarom. Als de lijn wordt verwijderd, blijft het object staan en noteert het paneel Problemen dat.

## In SuperCad Studio

Open het terrein en de 2D-tekening in hetzelfde project. Kies één lijn of polylijn in de 2D-tekening, druk op Ctrl+K en voer {{ui:Landschapsobject van de gekozen tekenlijn}} uit: CivilCraft vraagt wat het moet maken, zoals hierboven, en het object blijft gekoppeld aan die lijn van de tekening. Nadat u lijnen in de tekening hebt gewijzigd, laat Ctrl+K {{ui:Het landschap bijwerken vanuit de tekening}} de objecten volgen, met één ongedaan-maakstap per lijn. Het koppelbestand van het project legt vast welk object welke lijn volgt. De eigen help van SuperCad Studio heeft een onderwerp over Landschap.
