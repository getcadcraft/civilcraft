---
title: Menu's, toetsen en muis
summary: Kies een menustijl die aansluit bij uw manier van werken, geef elk commando een eigen toets, verplaats commando's naar andere lintbladen, en stel in wat het wiel en de muisknoppen doen in het plan en in 3D.
keywords: menustijl, menu's, lint, civiel lint, werkbalk, opdrachtregel, klassiek tekenen, sneltoetsen, toetsen, aanpassen, opnieuw toewijzen, muis, wiel, omkeren, zoomrichting, middelste knop, rechter knop, verschuiven, draaien, exporteren, importeren, overschakelen, vertrouwd
from: 07ac73a0
---

De commando's van CivilCraft zijn hetzelfde, welke weg u ook neemt. Een **menustijl** bepaalt alleen waar ze op het scherm staan, hoe ze daar heten en met welke toetsen ze worden uitgevoerd, zodat u uw gewoonten kunt behouden. Kies er een in {{ui:Instellingen}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menu's, toetsen en muis}}; de wijziging is direct zichtbaar, en deze browser onthoudt haar.

## De drie stijlen

| Stijl | Wat u krijgt |
|---|---|
| {{ui:CivilCraft}} | De eigen werkbalk van CivilCraft ({{ui:Bestand}}, {{ui:Exporteren}}, {{ui:Oppervlak}}, Ontwerp, Bewerken, GIS, {{ui:Weergave}}) en enkele toetsen: {{key:A}} tracé, {{key:G}} plateau, {{key:P}} leidingen, {{key:B}} breeklijn, {{key:O}} grens, {{key:L}} featurelijn, {{key:R}} profiel, {{key:X}} doorsneden, {{key:E}} hellingen, {{key:D}} 3D, {{key:F}} passend maken, {{key:V}} selecteren. Het beginpunt. |
| {{ui:Klassiek tekenen}} | Een klein lint ({{ui:Start}}, {{ui:Invoegen}}, {{ui:Uitvoer}}) en een opdrachtregel, voor wie commando's typt: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (ongedaan maken), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Begin overal met typen en de letters gaan naar de opdrachtregel; {{key:Enter}} voert uit, {{key:Enter}} zonder invoer herhaalt het laatste commando, {{key:Esc}} wist de invoer. De middelste knop verschuift. |
| {{ui:Civiel lint}} | Tabbladen met grote knoppen, zoals civiele ontwerpprogramma's hun gereedschappen groeperen: {{ui:Start}} (terreingegevens, ontwerp maken, profiel- en doorsnedeweergaven), {{ui:Oppervlakken}}, {{ui:Wijzigen}}, {{ui:Geolocatie}}, {{ui:Weergave}} en {{ui:Uitvoer}}, met een menu {{ui:Bestand}} en snelknoppen rechts. De enkele toetsen blijven. De middelste knop verschuift het plan; in 3D verschuift de middelste knop, en {{key:Shift}} met de middelste knop draait om het model. |

Elke stijl behoudt de {{key:Mod}}-toetsen: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Een toets die bij de eigen indeling van CivilCraft hoort, maar die uw stijl aan een ander commando heeft gegeven, doet niets, en de statusbalk meldt waar het commando naartoe is gegaan ("In Mijn toetsen is Plateau Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} en de pijltjes behouden altijd hun betekenis, en terwijl u een lijn tekent, behouden de punten hun toetsen ({{key:Backspace}}, {{key:Enter}}).
:::

## Pas het aan naar uw wens

1. Kies de stijl die het dichtst bij wat u wilt ligt, en klik daarna op {{ui:Aanpassen…}}.
2. Zoek op {{ui:Toetsen en menu's}} een commando (het zoekvak helpt). Klik op {{ui:Een sleutel toevoegen}} en druk op de toets, of op twee toetsen achter elkaar voor een toets met twee letters. Klik op een toets om die te verwijderen.
3. Bij een lint verplaatst {{ui:Waar het staat}} het commando naar een ander tabblad en paneel, naar het menu {{ui:Bestand}}, of naar {{ui:Alleen toetsen}}.
4. Stel op {{ui:Muis}} het wiel in, de knoppen die het plan verschuiven, en wat elke knop in de 3D-weergave doet.
5. Geef het een naam en klik op {{ui:Opslaan}}.

Een ingebouwde stijl opslaan maakt een eigen kopie ("Mijn Civiel lint"); de ingebouwde stijl verandert nooit. Een toets die aan twee commando's is gegeven, of een toets die zou worden uitgevoerd voordat een toets met twee letters getypt kan worden, wordt rood weergegeven en moet worden opgelost voordat u kunt opslaan.

## Muis

- **Muiswiel**: {{ui:Omhoog scrollen zoomt in}} (het beginpunt) of {{ui:Omhoog scrollen zoomt uit}}, en hoe snel, in het plan en in 3D. Samenknijpen op een touchpad zoomt altijd zoals uw vingers bewegen.
- **Het plan verschuiven met**: de middelste knop, de rechter knop, of beide. {{key:Space}} en slepen verschuift ook. De linker knop selecteert en tekent altijd.
- **Slepen in de 3D-weergave**: {{ui:Eigen per weergave}} behoudt de knoppen van CivilCraft (links draaien, rechts verschuiven). Of stel elke knop in op draaien, verschuiven, zoomen of niets; {{key:Shift}} met de knop wisselt draaien en verschuiven om. Een klik zonder slepen selecteert nog steeds.

## Neem het mee

{{ui:Exporteren}} slaat de gebruikte stijl op als een klein `.ccinput.json`-bestand; {{ui:Importeren…}} voegt er een toe, van een andere computer of van een collega. Een geïmporteerd bestand kan alleen naar commando's van CivilCraft zelf verwijzen: al het andere erin wordt weggelaten en geteld in de statusbalk. {{ui:Deze stijl verwijderen}} verwijdert een van uw eigen stijlen.

:::note
Deze instellingen blijven in deze browser. {{ui:Deze stijl in elke app gebruiken}} onder de stijlkaarten zorgt ervoor dat elke app opent in de bijbehorende stijl (de eigen werkbalk, een lint of Klassiek tekenen), met de wijzigingen die u in elke app hebt gemaakt. CivilCraft heeft geen menubalkstijl: wanneer de menubalk van een andere app voor elke app is gekozen, behoudt CivilCraft zijn eigen werkbalk.
:::

Gerelateerd: [Toetsenbord en muis](topic:keyboard) · [Instellingen van CivilCraft](topic:settings) · [Overstappen van andere civiele software](topic:coming-from)
