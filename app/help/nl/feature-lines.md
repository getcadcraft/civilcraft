---
title: Elementlijnen
summary: Teken 3D-lijnen die u hoekpunt voor hoekpunt van een helling voorziet, maak er getrapte offsets van, en gebruik ze als breeklijnen van het terrein of als hellende plateaus in het ontwerp.
keywords: boog, kromme, straal, 3D-boog, helix, gebogen opsluiting, hellingoverlay, hoogteoverlay, hellingpijlen, elementlijn, helling, hoogte, getrapte offset, offset, breeklijn, opsluiting, greppel, berm, hellend plateau, ontgravingslijn, grading, 3D-polylijn
from: d55b25fb
---

Een elementlijn is een lijn met een hoogte op elk hoekpunt: een opsluiting, een afvoerlijn van een greppel, de bovenkant van een berm, de rand van een hellend plateau. U stelt de hoogten in met een getal of met een helling, kopieert hem zijwaarts met een stap omhoog of omlaag, en kiest wat de terreinen ermee doen.

## Een tekenen

1. Kies **Terrein** › {{ui:Meer}} › {{ui:Elementlijn}}, of druk op {{key:L}}.
2. Klik op de hoekpunten ervan in het plan. Een klik op een meetpunt neemt de plaats en hoogte van het punt over; overal elders krijgt het hoekpunt de hoogte van het bestaande maaiveld daar.
3. Druk op {{key:Enter}} om een open lijn af te maken, of klik nogmaals op het eerste hoekpunt om hem te sluiten.

De nieuwe lijn is geselecteerd en begint als breeklijn van het bestaande maaiveld, rustend op het maaiveld.

## Bogen

Een segment kan een boog in het plan zijn waarvan de uiteinden op verschillende hoogten liggen: een hoekbocht van een opsluiting, een gebogen greppel, een helling die draait. De helling loopt gelijkmatig langs de boog, en de lengte wordt langs de kromme gemeten.

- **Tijdens het tekenen:** druk op {{key:C}} (op een touchscreen: {{ui:Boog}} in de balk boven het plan) om bogen aan te zetten. Na een hoekpunt klikt u op een punt op de kromme en daarna op waar de boog eindigt. Druk nogmaals op {{key:C}} voor rechte segmenten. {{key:Backspace}} verwijdert eerst het punt op de kromme.
- **Achteraf:** typ in **Eigenschappen** in het vak **Boog** van het hoekpunt een straal en de draairichting, bijvoorbeeld `50 L` of `50 R` (links of rechts als u de lijn volgt), en druk op {{key:Enter}}. Maak het vak leeg om het segment weer recht te maken. Een straal kleiner dan de halve lengte van het segment wordt geweigerd.

De geselecteerde lijn toont de straal van elke boog naast de helling. **Lengte** is langs de bogen in het plan; **3D-lengte** telt de stijging en daling ook mee. Getrapte offsets behouden de bogen: een boog aan de buitenkant van een bocht groeit, een boog aan de binnenkant krimpt, en een offset voorbij het middelpunt van een boog wordt geweigerd.

Terreinen, de 3D-weergave, en DXF en DWG nemen elke boog als korte rechte stukken die binnen 0.01 van de kromme blijven. LandXML bewaart ze als bogen (zie **Bogen in andere bestanden** hieronder).

## Hoogten en hellingen instellen

**Eigenschappen** toont de hoekpunten met hun afstand langs de lijn, hun **Hoogte** en de **Helling naar volgende** (in procent). Typ het ene of het andere en druk op {{key:Enter}}:

- Een hoogte verplaatst alleen dat hoekpunt.
- Een helling stelt de hoogte in aan het verre eind van het segment; de hoekpunten erna blijven waar ze zijn, zodat de helling van het volgende segment verandert.

Ook in **Eigenschappen**:

| Actie | Wat het doet |
|---|---|
| **Alles omhoog of omlaag met** | Telt de hoogte die u typt bij elk hoekpunt op. |
| {{ui:Hoogten uit het terrein}} | Zet elk hoekpunt terug op het bestaande maaiveld (hoekpunten die naast het terrein liggen houden hun hoogte en worden vermeld). |
| {{ui:Eén helling, van eerste tot laatste}} | Behoudt de eerste en laatste hoogte en zet de hoekpunten ertussen op één gelijkmatige helling. |

De geselecteerde lijn toont zijn hoogten bij de hoekpunten en zijn hellingen langs de segmenten in het plan. Sleep een hoekpunt met {{ui:Selecteren}} om het te verplaatsen; zijn hoogte blijft.

## Getrapte offsets

Typ onder **Getrapte offset** een **Afstand** (positief naar rechts van de richting van de lijn, negatief naar links), daarna een hoogte (omhoog of omlaag met) of een helling in procent, en klik op {{ui:De offsetlijn maken}}. De kopie is een nieuwe elementlijn: bijvoorbeeld de achterkant van een opsluiting 0.5 ft opzij en 0.5 ft hoger, of een greppelrand 6 ft uit op 2 %. Een afstand die de kopie bij een krappe bocht over zichzelf zou vouwen, wordt geweigerd.

## Hellingen en hoogten op het scherm

Druk op {{key:E}}, of vink **Hellingen en hoogten op elementlijnen** aan onder Weergave, om de helling van elke elementlijn langs elk segment te zien (met een klein pijltje dat bergafwaarts wijst) en zijn hoogte bij de hoekpunten. Ze worden alleen op het scherm getoond: er wordt niets aan de tekening toegevoegd, en de PDF, DXF en DWG blijven zoals ze zijn. Korte segmenten en drukke hoekpunten blijven zonder label tot u inzoomt. De geselecteerde lijn toont altijd zijn eigen hellingen en hoogten.

## In de profielweergave

Een elementlijn die een tracé kruist, verschijnt in de profielweergave van dat tracé, met zijn naam en hoogte op het kruispunt; lijnen die ernaast lopen kunnen ook getoond worden. Zie [Een verticaal profiel ontwerpen](topic:profile).

## Wat de terreinen ermee doen

Kies **Gebruik**:

| Gebruik | Wat er gebeurt |
|---|---|
| Breeklijn van het bestaande maaiveld | Het bestaande maaiveld loopt door de lijn op zijn hoogten, zoals een getekende breeklijn. |
| Gegradeerd in het ontwerp | Een **gesloten** lijn wordt een hellend plateau: het ontwerpterrein erbinnen wordt gegradeerd naar zijn rand. Schakel **Ontgravingslijn naar het maaiveld** in om ontgravings- en ophogingstaluds (horizontaal tot 1 verticaal) van zijn rand naar het maaiveld te laten lopen, zoals een plateau dat doet; elk talud begint daar op de eigen hoogte van de rand. |
| Alleen getekend | Hij blijft op het plan en gaat mee naar DXF, DWG en PDF (laag C-GRAD-FEAT, 3D-polylijnen), maar de terreinen negeren hem. |

Volumes, doorsneden en de 3D-weergave nemen elementlijnen op die in het ontwerp gegradeerd zijn, zoals plateaus. Elke wijziging is één stap: {{key:Mod+Z}} maakt ze ongedaan.

## Lijnen delen met uw team

In een tekening die u vanuit uw cloudbestanden in CadCraft Studio opent, met een teamabonnement, heeft de Eigenschappen van het project (niets geselecteerd) een sectie **Team** met {{ui:Teamlijnen…}}: de lijnen die uw team heeft gedeeld, elk met zijn revisie, zonder eerst een elementlijn te selecteren. Selecteer een lijn om hem te delen, een nieuwe revisie te uploaden, de revisie van het team op te halen, of het delen te stoppen. Buiten die instelling zegt de sectie wat ze nodig heeft.

## Bogen in andere bestanden

| Bestand | Wat er gebeurt met een elementlijn met bogen |
|---|---|
| CivilCraft-project | Precies behouden. |
| LandXML | Geschreven als een plan-element van lijnen en bogen met hun hoogten, en teruggelezen met zijn bogen. Een elementlijn uit een ander programma komt binnen als **Alleen getekend**: kies zijn **Gebruik** om hem in een terrein te zetten. |
| DWG en DXF | Een 3D-polylijn kan geen boog bevatten, dus de lijn wordt geschreven als korte stukken binnen 0.01 van elke boog. CivilCraft noteert in de tekening ook welke stukken bogen waren: wanneer u de tekening als lijnwerk opent, brengt {{ui:Elementlijnen}} de lijnen terug als elementlijnen met hun bogen. Andere programma's zien een gewone 3D-polylijn. |
