---
title: Het terrein in 3D bekijken
summary: Open de 3D-weergave, draai, verschuif en zoom, stel de verticale overdrijving en kleuring in, kies wat er getoond wordt, en klik op tracés, plateaus, elementlijnen, breeklijnen, leidingen, kunstwerken en punten om ze te selecteren.
keywords: labels, 3d-labels, billboard, labels die naar de camera gericht zijn, stationlabels, hoogtelijnlabels, puntlabels, drapen, luchtfoto, kaartlagen op het oppervlak, 3d, drie d, 3d-weergave, oriëntatiekubus, kompas, draaien, perspectief, parallel, isometrisch, iso, verticale overdrijving, terrein, model, terreinmodel, rondvliegen, visualiseren, renderen, leidingen in 3d, kunstwerken, putten, corridor 3d, weg in 3d, wegoppervlak, rijstroken, kantstenen, trottoirs, planten in 3d, bomen in 3d, struiken, hagen, landschap 3d, hellingbanen in 3d, trappen, muren, bestrating, verharding 3d
from: a16bafe1
---

De 3D-weergave toont het terrein als één model: het bestaande terrein en het geplaneerde oppervlak, hoogtelijnen erop getekend, breeklijnen en de rand van het oppervlak, elk tracé op zijn ontwerpprofiel met stationsstreepjes, de corridor-elementlijnen en de weg zelf (rijstroken, bermen, goten, kantstenen, stroken en trottoirs in hun eigen kleuren), plateaus met hun daglichtlijnen, het leidingnetwerk met leidingen en kunstwerken op hun werkelijke hoogte, en vanuit de werkomgeving Landschap de beplanting, bestrating, paden, muren, kantstenen, hellingbanen en trappen. Het leest hetzelfde project als het plan, dus elke bewerking verschijnt in beide.

## De 3D-weergave openen

1. Open meetpunten (of een LandXML- of projectbestand) zodat er een oppervlak is. Beplanting, bestrating of hellingbanen alleen zijn ook genoeg om hem te openen.
2. Druk op {{key:D}}, of klik op {{ui:3D}} in de groep {{ui:Weergave}} van de werkbalk.
   De 3D-weergave opent over het plan en kijkt naar het hele terrein vanuit het zuidoosten. De eerste keer duurt het even om te laden.
3. Druk nogmaals op {{key:D}}, of klik weer op {{ui:3D}}, om terug te gaan naar het plan. Het kiezen van een tekenhulpmiddel zoals {{ui:Tracé}} of {{ui:Plaat}} gaat ook terug naar het plan, omdat er daar getekend wordt.

## Rondbewegen

| Om te | Doe dit |
|---|---|
| Draaien | Sleep met de linker- of de middelste knop |
| Verschuiven | Sleep met de rechterknop, of houd {{key:Shift}} ingedrukt en sleep |
| Zoomen | Draai het wiel; het zoomt naar de aanwijzer |
| Draaien op een trackpad | Veeg met twee vingers ({{key:Shift}} en vegen verschuift) |
| Zoomen op een trackpad | Knijp |
| Aanraken | Eén vinger draait; twee vingers knijpen om te zoomen en bewegen om te verschuiven |
| Toetsen (de weergave heeft de focus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} draaien, met {{key:Shift}} verschuiven; {{key:Plus}} en {{key:Minus}} zoomen |

De balk boven de weergave bevat de rest:

- De weergavelijst: **Iso**, **Boven**, **Onder**, **Voor** (kijkend naar het noorden), **Achter**, **Links**, **Rechts**.
- {{ui:Perspectief}}: ingedrukt is een perspectiefweergave; klik erop voor een parallelprojectie (zonder verkorting).
- {{ui:Alles tonen}}: toont alles weer. {{key:F}} doet hetzelfde terwijl de 3D-weergave open is.

## De oriëntatiekubus

De kubus in de rechterbovenhoek draait mee met de weergave. Klik op een zijde, rand of hoek om het terrein vanuit die richting te bekijken (de camera draait soepel, tenzij uw systeem om verminderde beweging vraagt). Sleep de kubus om te draaien. De kompasring eronder toont het noorden (rasternoorden, +Y): sleep de ring om het terrein om de verticale as te draaien, of klik op N, O, Z of W om vanaf die kant te kijken. {{ui:Start}}, het kleine huisje linksboven, gaat terug naar de isometrische weergave van het hele terrein. Met het toetsenbord: {{key:Tab}} naar de kubus, pijltjes kiezen een zijde, rand of hoek, en {{key:Enter}} kijkt vanaf daar.

Op het plan toont dezelfde kubus de bovenkant. Klik op een andere zijde, rand of hoek (of sleep hem) om de 3D-weergave te openen die vanuit die richting kijkt: dit is de snelste weg naar 3D vanuit een bepaalde richting. Om de kubus te vervangen door een klein assenpictogram, of hem te verbergen, zie **Hoekindicator** in [CivilCraft-instellingen](topic:settings).

## Hoogtes overdrijven

Terreinen zijn meestal veel breder dan hoog, dus de hoogtes worden in het begin met **2×** uitgerekt. Kies **1×**, **2×**, **3×**, **5×** of **10×** in de lijst op de balk, of onder **3D-verticale overdrijving** in [CivilCraft-instellingen](topic:settings) (beide zijn één instelling). Alleen de weergave verandert: volumes, profielen en exports blijven op ware schaal.

## Oppervlakken kleuren

- **Hoogtebanden**: dezelfde banden en kleuren als de hoogtebanden van het plan (het aantal banden wordt ingesteld onder **Weergave** in het linkerpaneel). Elke bandrand wordt precies op zijn hoogte gesneden.
- **Eén kleur**: het bestaande terrein en het geplaneerde oppervlak elk in een effen kleur.
- **Kaartlagen**: de kaartlagen die onder het plan worden getoond (een georefereerd beeld, kaarttegels of een kaartdienst; zie [Kaartlagen](topic:map-layers)) worden als een laag over de oppervlakken gelegd, zodat een luchtfoto op de heuvels verschijnt. Beelden die nog binnenkomen, vullen zich stap voor stap in. Zonder kaartlaag behouden de oppervlakken hun hoogtebanden en de weergave zegt dat. Het beeld is alleen voor het scherm: GLB- en OBJ-exports bevatten het niet.

Wanneer beide oppervlakken getoond worden, is het bestaande terrein doorzichtig over het geplaneerde oppervlak, zodat u de snede (terrein boven het ontwerp) en de ophoging ziet.

## Kiezen wat wordt getoond

Klik op {{ui:Tonen}} op de balk en vink aan of uit:

| Onderdeel | Wat het is |
|---|---|
| Bestaand terrein | Het oppervlak opgebouwd uit de meetpunten (of gelezen uit LandXML) |
| Geplaneerd oppervlak | Het bestaande terrein met de corridors en plateaus erin geplaneerd (alleen wanneer die er zijn) |
| Driehoeksranden | Elke TIN-rand, als lijnen |
| Hoogtelijnen | Kleine en grote hoogtelijnen van elk getoond oppervlak, op het interval van het plan |
| Rand van het oppervlak | De buitenrand van elk getoond oppervlak, op zijn hoogten |
| Breeklijnen | Elke breeklijn, op zijn hoogten |
| Tracés en stations | Elk tracé op zijn ontwerpprofiel (op het terrein waar er geen profiel is), met streepjes elke 50 ft of 20 m |
| Corridor-elementlijnen | Verhardingsrand, berm en daglicht aan beide zijden |
| Wegoppervlakken | De weg die elke corridor bouwt, uit zijn dwarsprofiel: rijstroken, bermen, goten, kantstenen, stroken en trottoirs, elk in zijn eigen kleur, op het geplaneerde oppervlak |
| Planten | Elke plant, en de planten in bedden en hagen, als eenvoudige vormen naar grootte uit de plantenlijst: een boom is een stam met een ronde kroon (een kegel voor een naaldboom, een pluim op een hoge stam voor een palm); struiken, haagplanten, vaste planten en bodembedekkers zijn koepels, grassen zijn pollen en klimplanten dunne zuiltjes. Ze staan op het geplaneerde oppervlak (of het bestaande terrein) op de grootte die het plan toont: volwassen, of bij het planten |
| Verharding | Bestrating en paden met hun helling, muren, kantstenen, trappen, en hellingbanen die in trajecten met vlakke bordessen ertussen klimmen |
| Plateaus en daglicht | Elke plateau-omtrek op zijn hoogte, en zijn daglichtlijn |
| Leidingen en kunstwerken | Leidingen als ronde buizen tussen hun invertpeilen, kunstwerken van rand tot slibvang |
| Meetpunten | Een stip bij elk punt met een hoogte (eerst uit) |
| GIS-lagen | De GIS-lagen die op het plan getoond worden, in hun kleuren: lijnen en omtrekken op hun eigen hoogten, andere op het bestaande terrein gelegd (ze volgen het precies); punten als kleine kruisjes. Vormen zonder hoogten buiten het oppervlak worden weggelaten, en de weergave zegt hoeveel |
| Labels | Namen en waarden die altijd naar u toe gericht zijn: de naam van elk tracé bij het begin en de stations elke 100 ft (of 100 m), de hoogte van elke hoofdhoogtelijn, plateaus, elementlijnen en kunstwerken op naam, en met **Meetpunten** aangevinkt het nummer en de hoogte van elk punt |

Labels blijven even groot en rechtop, hoe u ook draait of zoomt, en een heuvel voor een label verbergt het. Waar ze te veel op elkaar zouden komen, verschijnt het belangrijkste en wacht de rest tot u inzoomt: eerst tracés, dan kunstwerken, plateaus, elementlijnen, stations, hoogtelijnen en punten, dichterbij eerst. Ze staan alleen op het scherm; exports en plots laten ze weg.

Uw keuzes, de overdrijving en de kleuring worden in deze browser onthouden.

Een weg wordt op het bestaande terrein gebouwd. Met een tracé en een corridor maar zonder meetpunten of oppervlak nog, wordt de weg getekend op vlak tijdelijk terrein: op de gemiddelde hoogte van zijn ontwerpprofiel, of gelijk op hoogte 0 als er ook geen profiel is. Een waarschuwing onderaan de 3D-weergave en in de eigenschappen van de corridor zegt dat. Het is alleen een beeld: er komen geen volumes of doorsneden uit. Open meetpunten of een oppervlak, en de weg verschuift vanzelf naar het echte terrein.

De verticale overdrijving rekt het terrein uit, niet de planten: ze staan op het overdreven terrein op hun werkelijke hoogte en breedte, dus een boom ziet er bij elke instelling als een boom uit. Planten zijn eenvoudige vormen, geen gedetailleerde modellen: duizenden ervan blijven snel om te draaien en te zoomen.

## Leidingen en kunstwerken

- Een leiding wordt getekend met zijn onderkant binnen de invertpeilen die u instelt, en zijn bovenkant (de kruin) één binnendiameter hoger. Diameters zijn in inch op een project in feet en in millimeter op een metrisch project, zoals in het rechterpaneel.
- Een kunstwerk loopt van zijn rand (getypt, of uit het oppervlak) naar beneden tot zijn slibvang (het laagste invertpeil min de slibvangdiepte). Zonder invert wordt het 5 ft (1.5 m) diep getekend.
- Leidingen en kunstwerken met een probleem (zie de netwerkcontrole in het rechterpaneel) worden in rood getekend.
- Een leiding zonder inverts wordt niet getekend; een opmerking onderaan de weergave zegt hoeveel.

## Selecteren vanuit de 3D-weergave

Klik op een tracé (of zijn weg), een plateau, een elementlijn, een leiding, een kunstwerk, een meetpunt, een plant, een hellingbaan of andere verharding. Het wordt geselecteerd alsof u er in het plan op klikte: de eigenschappen openen in het rechterpaneel, waar u ze kunt bewerken, en het wordt in 3D in de selectiekleur bovenop alles getekend. Wat u op het plan selecteert, wordt ook in 3D gemarkeerd. Een tip naast de aanwijzer noemt wat u heeft aangeklikt, met de Easting, Northing en hoogte. Leidingen en kunstwerken kunnen worden aangeklikt ook waar ze onder de grond liggen; een lijn die achter een heuvel verborgen is, kan er niet doorheen worden aangeklikt.

Klik op een breeklijn om te zien welke het is: hij wordt gemarkeerd en de statusbalk noemt hem (breeklijnen hebben zelf geen eigenschappen).

Klik op het terrein om de Easting, Northing en hoogte daar in de tip af te lezen.

## Rijden langs een tracé

Klik op **Rijden** op de 3D-balk en kies een tracé. De weergave verplaatst naar de bestuurdersstoel: 3.5 ft (1.07 m) boven de weg, op het ontwerpprofiel (op het bestaande terrein langs de hartlijn wanneer er nog geen is), kijkend vooruit langs het tracé.

- **Afspelen** of {{key:Space}} rijdt aan de snelheid die u kiest (10 tot 65 mph, of 15 tot 100 km/h); {{key:Space}} nog eens pauzeert. Het stopt aan het einde; **Afspelen** start dan opnieuw vanaf het begin.
- De schuif springt naar elk station; {{key:Left}} en {{key:Right}} gaan 10 ft (5 m) terug en vooruit.
- Slepen in de weergave pauzeert en laat u rondkijken.
- **Stoppen** of {{key:Esc}} zet de weergave terug waar hij was.

De verticale overdrijving geldt ook tijdens het rijden: zet hem op 1× om de weg te zien zoals hij zal worden.

## Licht van de zon

Open **Zon** op de 3D-balk en vink **Licht van de zon** aan. Geef een datum, een kloktijd en de tijdzone (het verschil met UTC: in de zomer die met zomertijd), en de breedte- en lengtegraad van het terrein. Wanneer het project een coördinatenstelsel heeft, worden ze daaruit ingevuld.

Het terrein wordt dan verlicht vanuit de positie van de zon, met **Schaduwen** over het terrein, de corridor en de plateaus; het menu zegt de azimut van de zon en hoe hoog hij staat, of dat hij onder de horizon is. De posities komen uit de zonnevergelijkingen van NOAA. Schaduwen vallen bij elke overdrijving de goede kant op, maar ze stoppen aan de rand van het terrein: heuvels en gebouwen erbuiten werpen er geen.

## De 3D-weergave exporteren

Klik op {{ui:GLB}} of {{ui:OBJ}} op de balk. Wat de weergave toont, wordt opgeslagen op ware schaal (zonder overdrijving), in meters, met Y omhoog. Details: [Het terrein in 3D exporteren](topic:export-3d).
