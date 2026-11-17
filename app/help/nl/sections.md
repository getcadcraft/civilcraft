---
title: Steekproeflijnen en dwarsprofielen
summary: Snijd dwarsprofielen loodrecht op een tracé, bekijk het terrein, het ontwerp en de snede en ophoging bij elk station, en krijg volumes met gemiddelde eindoppervlakken.
keywords: massadiagram, massaverdeling, balanspunt, krimp, zwelling, transportafstand, aanvoer, overschot, dwarsprofielbladen, doorsnedebladen, dwarsprofielen, doorsneden, steekproeflijnen, doorsneeweergave, snede, ophoging, oppervlakken, gemiddeld eindoppervlak, volumes eindoppervlak, grondverzet, station, offset, csv
from: 5060173c
---

Een dwarsprofiel toont de weg zoals hij zal worden gebouwd: dwars op het tracé bij één station, het bestaande terrein, het ontwerp (het corridor of plateau ingepast) en de snede en ophoging ertussen.

## Steekproeflijnen toevoegen

1. Selecteer een tracé. Klik in **Eigenschappen**, onder **Steekproeflijnen**, op {{ui:Steekproeflijnen toevoegen}}.
2. Stel **Elke** in (de tussenafstand: 50 ft of 20 m om mee te beginnen), **Linker breedte** en **Rechter breedte** (hoe ver elk dwarsprofiel van de hartlijn reikt).
3. Om een dwarsprofiel bij een bepaald station te snijden, typt u het in **Station toevoegen** (bijvoorbeeld `2+35`) en drukt u op {{key:Enter}}.

Dwarsprofielen worden gesneden op elk geheel veelvoud van de tussenafstand, aan beide uiteinden van het tracé, bij het begin en het einde van elke bocht (PC en PT), en bij de stations die u toevoegt. De steekproeflijnen worden op het plan als grijze lijnen over het tracé getoond; ze gaan ook mee naar DXF, DWG en PDF op laag C-ROAD-SCTN. Elke wijziging is één stap: {{key:Mod+Z}} maakt ze ongedaan.

## De doorsneeweergave

Open haar met {{ui:Doorsnedeweergave}} in de **Eigenschappen** van het tracé, met {{ui:Doorsneden}} onder **Terrein** › {{ui:Meer}}, of met {{key:X}}. Ze vervangt de profielweergave onder het plan.

- Blader door de dwarsprofielen met de pijlen in de balk, de stationslijst, of met {{key:Left}} en {{key:Right}} wanneer de doorsneeweergave de focus heeft ({{key:Home}} en {{key:End}} voor het eerste en het laatste).
- De grijze lijn is het bestaande terrein, de rode lijn het ontwerp. Snede is oranje gearceerd, ophoging groen. Corridorpunten zijn gemarkeerd: CL (hartlijn), EOP (verhardingsrand), SH (berm) en DL (daglicht).
- De kop geeft het station, de snede- en ophogingsoppervlakken van dit dwarsprofiel en de verticale overdrijving. **Passend** vult het paneel; kies 1× om het dwarsprofiel op ware schaal te zien.
- De dikke lijn op het plan toont welk dwarsprofiel op het scherm staat.

## Dwarsprofielbladen

{{ui:Doorsnedebladen (PDF)}} onder **Steekproeflijnen** zet elk dwarsprofiel op PDF-pagina's, in rijen van links naar rechts en van boven naar beneden in stationvolgorde. Kies het **Papier**, de **Plan-schaal** (de horizontale schaal van de dwarsprofielen) en de **Profielvergroting** (1×, 2×, 5× of 10×); het dialoogvenster zegt hoeveel dwarsprofielen op een pagina passen en hoeveel pagina's dat maakt.

Elk dwarsprofiel toont een raster met offsets en hoogten, het terrein (gestreept), het ontwerp, de snede en ophoging gearceerd (oranje en groen), de corridorpunten, en eronder het station en de snede- en ophogingsoppervlakken. Elk dwarsprofiel op de bladen wordt even groot getekend, hoog genoeg voor het grootste. Past dat niet op de pagina bij uw vergroting, dan gebruikt CivilCraft het grootste dat wel past en zegt dat. De titelstrook noemt het tracé, de stations op die pagina, de schalen en "Blad 1 van 3".

## Volumes met gemiddelde eindoppervlakken

Tussen twee naburige dwarsprofielen is het volume het gemiddelde van hun twee oppervlakken maal de afstand tussen hun stations. De balk toont de totalen voor het tracé, en {{ui:CSV}} downloadt de oppervlakken en volumes van elk dwarsprofiel met lopende totalen (kubieke yards voor projecten in feet, kubieke meter voor metrische projecten).

**Eigenschappen** toont dezelfde totalen naast de volumes met de rastermethode uit [Grondverzetvolumes](topic:volumes). De twee zijn verschillende benaderingen: dichtere dwarsprofielen brengen ze dichter bij elkaar, en op een rechte weg in vlak terrein zijn ze gelijk.

:::note
Snede en ophoging worden alleen geteld binnen de geprofileerde gebieden (de daglichtlijnen van een corridor of plateau), zoals bij de rastermethode. Zonder corridor of plateau is het ontwerp het terrein, dus een dwarsprofiel toont geen snede of ophoging.
:::

## Massadiagram

**Massadiagram** onder **Steekproeflijnen** tekent het massadiagram uit dezelfde volumes met eindoppervlakken: langs de stations het lopende totaal van snede min ophoging.

- **Krimp (−) of zwelling (+) van de snede** zegt wat een kubieke yard snede wordt als hij als ophoging is aangebracht: −10 % (de startwaarde, een placeholder) betekent krimp tot 0.9; rots die zwelt kan +5 % zijn. Gebruik het cijfer uit uw geotechnisch rapport.
- Waar de lijn stijgt, ligt de weg in snede; waar hij daalt, in ophoging. Boven nul (oranje gearceerd) verplaatst grond zich stroomopwaarts; onder nul (groen) stroomafwaarts.
- **Balanspunten** zijn de plekken waar de lijn nul kruist: tussen twee daarvan zijn snede en ophoging in evenwicht. De tabel toont elk in evenwicht stuk, het verplaatste volume (zijn hoogste of laagste punt) en de gemiddelde transportafstand (het gearceerde oppervlak gedeeld door dat volume).
- Waar de lijn buiten nul eindigt, is wat overblijft **overschot** (boven) of **aanvoer** (onder). In dat laatste stuk telt alleen de grond boven het niveau waarop de lijn eindigt als verplaatst.

**CSV** slaat de massaordinaat bij elk dwarsprofiel op, de stukken en de factor.
