---
title: Bouwmassa's op een bouwplaats tekenen
summary: Teken een bouwmassa op een perceel, geef haar verdiepingen en een verdiepingshoogte, bekijk haar bruto vloeroppervlak, kies hoe ze op hellend terrein zit, duw en trek haar hoogte in 3D, en stuur haar naar BimCraft of sla haar op als IFC-bestand.
keywords: massa, massastudie, bouwmassa, volume, voetafdruk, verdiepingen, verdiepingshoogte, bruto vloeroppervlak, bvo, helling, sokkel, ontgraving en ophoging, duwen trekken, 3D, bouwplaatsstudie, vroeg ontwerp, IFC, ontwikkelen, BimCraft, A-MASS
from: e5a67c16
---

Een bouwmassa is een voetafdruk, een aantal verdiepingen en een verdiepingshoogte: de vroege vraag "hoeveel bouw past hier, en wat doet het met het terrein". Massa's staan op het plan met hun naam, aantal verdiepingen en bruto vloeroppervlak, gaan mee in de PDF-afdruk en de DWG- en DXF-exports op de lagen `A-MASS` en `A-MASS-TEXT`, en worden in het projectbestand opgeslagen.

## Een massa tekenen

1. Klik in **Eigenschappen**, onder **Bouwmassa's**, op **Een massa tekenen**. (Het staat ook in het menu **Meer** van de werkbalk naast **Terrein**.)
2. Klik de hoeken van de voetafdruk aan. Een klik dicht bij een perceelhoek of een meetpunt neemt de exacte plek van dat punt.
3. Klik de eerste hoek opnieuw aan, of druk op {{key:Enter}}, om te beëindigen. {{key:Backspace}} neemt de laatste hoek terug; {{key:Esc}} stopt.

Een nieuwe massa heeft drie verdiepingen en een verdiepingshoogte van 12 ft (3.6 m), en hoort bij het perceel waarin haar middelpunt valt.

## Verdiepingen, hoogte en oppervlak

Klik op een massa om haar **Naam**, **Gebruik**, **Verdiepingen**, **Verdiepingshoogte** en **Perceel** te wijzigen. **Hoogte** is verdiepingen maal verdiepingshoogte: typ een hoogte en het aantal verdiepingen wordt het dichtstbijzijnde hele getal (nooit minder dan één). **Voetafdruk** en **Bruto vloeroppervlak** (voetafdruk maal verdiepingen) worden voor u berekend.

## Op hellend terrein

Het terrein onder een massa wordt uit het terrein gelezen: het bestaande maaiveld, of het geplateauerde maaiveld waar u **Voorgesteld maaiveld (geplateauerd)** koos. **Op hellend terrein** bepaalt waar de begane grond komt:

- **Getrapt**: op het gemiddelde maaiveld onder de voetafdruk. De lage kant wordt opgevuld tot daar, de hoge kant afgegraven, en de twee komen dicht bij elkaar in evenwicht.
- **Sokkel**: op het hoogste maaiveld. Een massief voetstuk vult de lage kant.
- **Afgraven**: op het laagste maaiveld. De hoge kant wordt weggegraven in de heuvel.

Eigenschappen toont het bereik van het maaiveld onder de massa, het **Niveau van de begane grond**, en het volume van opvulling en ontgraving tussen het maaiveld en dat niveau. Een plek van de voetafdruk die naast het terrein ligt, wordt weggelaten, en Eigenschappen zegt hoeveel.

## In de 3D-weergave

Massa's worden getekend in de 3D-bouwplaatsweergave, met een lijn rond elke verdieping en hun namen boven het dak. **Tonen** heeft een keuzevakje voor **Bouwmassa's**. Klik op een massa om haar te selecteren. Met een massa geselecteerd:

- sleep haar dak omhoog of omlaag om haar per verdieping te duwen of trekken, of druk op {{key:PageUp}} en {{key:PageDown}};
- de hele verplaatsing is één stap die u ongedaan kunt maken.

De straatweergave van **Rijden** ziet de massa's ook, en **Zon** werpt hun schaduwen op het maaiveld.

## Doorsturen

- **Massa's als IFC** slaat elke massa op als IFC4-bestand: een terrein, een gebouw met zijn verdiepingen, en de massa als gebouwelement met haar getallen in de eigenschapsset `CadCraft_SiteMass`. Met een coördinatenstelsel ingesteld voor het project wordt het bestand op de kaart geplaatst en draagt het de breedte- en lengtegraad van het terrein; zonder stelsel zegt het niets over de plek.
- **In BimCraft ontwikkelen** opent BimCraft in een nieuw tabblad met de massa's. Daar toont het kiezen van een massa haar getallen en **Deze massa ontwikkelen**, dat op elke verdieping wanden bouwt en een vloer onder het gebouw uit de voetafdruk, in één stap die u ongedaan kunt maken. Er wordt niets geüpload: het bestand gaat tussen de twee tabbladen van deze browser.

Zie ook **Zoneringsgrenzen** en **Zonuren**.
