---
title: Steekproeflijnen en doorsneden
summary: Doorsneden loodrecht op een tracé snijden, het terrein, het ontwerp en de ontgraving en ophoging op elk station bekijken, en volumes berekenen met gemiddelde eindoppervlakken.
keywords: massaverdeling, massadiagram, evenwichtspunt, krimp, zwel, aanvoerafstand, lenen, storten, doorsnedebladen, dwarsprofielbladen, doorsneden-pdf, doorsneden, dwarsprofielen, steekproeflijnen, doorsnedeweergave, ontgraving, ophoging, oppervlakken, gemiddeld eindoppervlak, eindoppervlakvolumes, grondverzet, station, offset, csv
from: 09639ce2
---

Een dwarsprofiel toont de weg zoals hij gebouwd zal worden: dwars op het tracé op één station, het bestaande terrein, het ontwerp (de corridor of het plateau afgewerkt) en de ontgraving en ophoging ertussen.

## Steekproeflijnen toevoegen

1. Selecteer een tracé. Klik in **Eigenschappen**, onder **Steekproeflijnen**, op {{ui:Steekproeflijnen toevoegen}}.
2. Stel **Elke** in (de tussenafstand: 50 ft of 20 m als start), **Linkerbreedte** en **Rechterbreedte** (hoe ver elke doorsnede van de as reikt).
3. Om op een bepaald station een doorsnede te snijden, typt u het in **Een station toevoegen** (bijvoorbeeld `2+35`) en drukt u op {{key:Enter}}.

Doorsneden worden gesneden op elk heel veelvoud van de afstand, aan beide uiteinden van het tracé, aan begin en eind van elke boog (PC en PT), en op de stations die u toevoegt. De steekproeflijnen worden op het plan als grijze lijnen dwars op het tracé getoond; ze gaan ook mee in DXF, DWG en PDF op laag C-ROAD-SCTN. Elke wijziging is één stap: {{key:Mod+Z}} maakt hem ongedaan.

## De doorsnedeweergave

Open hem met {{ui:Doorsnedeweergave}} in de **Eigenschappen** van het tracé, {{ui:Doorsneden}} onder {{ui:Oppervlak}} › {{ui:Meer}}, of met {{key:X}}. Hij neemt de plaats in van de profielweergave onder het plan.

- Blader door de doorsneden met de pijltjes in zijn balk, de stationslijst, of {{key:Left}} en {{key:Right}} wanneer de doorsnedeweergave focus heeft ({{key:Home}} en {{key:End}} voor de eerste en laatste).
- De grijze lijn is het bestaande terrein, de rode lijn het ontwerp. Ontgraving is oranje gearceerd, ophoging groen. Corridorpunten zijn gemarkeerd: CL (as), EOP (verhardingsrand), SH (berm) en DL (ontgravingslijn).
- De kop geeft het station, de ontgraving- en ophogingsoppervlakken van deze doorsnede en de verticale overdrijving. {{ui:Passend}} vult het paneel; kies 1× om de doorsnede op ware schaal te zien.
- De dikke lijn in het plan toont welke doorsnede op het scherm staat.
- **Zoomen en verschuiven:** het wiel zoomt rond de aanwijzer, en slepen verplaatst de weergave. {{ui:Passend}} (of {{key:F}}, of een dubbelklik) past de hele doorsnede weer.

## Meten in een doorsnede

1. Klik op {{ui:Meten}} in de doorsnedebalk, of druk op {{key:M}}. De hint zegt "Klik op het eerste punt, en daarna op het tweede."
2. Klik op twee punten. Elk snapt op het eind van een lijn of een corridorpunt (CL, EOP, SH, DL); houd {{key:Alt}} ingedrukt voor een vrij punt.
3. De uitlezing geeft de horizontale afstand (ΔH), de verticale afstand (ΔV), de helling in procent met zijn verhouding, en de rechte lengte, in de eenheden van het project.

Klik opnieuw om een nieuwe meting te beginnen. {{key:Esc}} wist hem, en {{key:M}} schakelt Meten uit.

## Doorsnedebladen

{{ui:Doorsnedebladen (PDF)}} onder **Steekproeflijnen** zet elke doorsnede op PDF-pagina's, in rijen van links naar rechts en van boven naar beneden in stationsvolgorde. Kies het **Papier**, de **Plan schaal** (de horizontale schaal van de doorsneden) en de **Profieloverdrijving** (1×, 2×, 5× of 10×); het dialoogvenster zegt hoeveel doorsneden op een pagina passen en hoeveel pagina's dat maakt.

Elke doorsnede toont een raster met afstanden en hoogtes, het terrein (gestreept), het ontwerp, ontgraving en ophoging (oranje en groen gearceerd), de corridorpunten, en eronder het station en de ontgraving- en ophogingsoppervlakken. Elke doorsnede op de bladen wordt even groot getekend, hoog genoeg voor de grootste. Past die niet op de pagina bij uw overdrijving, dan gebruikt CivilCraft de grootste die past en zegt dat. De titelstrook noemt het tracé, de stations op die pagina, de schalen en "Blad 1 van 3".

## Waarop ontgraving en ophoging worden gemeten

Een corridor kan lagen onder de verharding hebben: verhardingslagen, sjabloononderdelen, spoor. De keuzelijst **Volumes gemeten tot** in de doorsnedebalk bepaalt waartoe ontgraving en ophoging lopen:

- **Onderste oppervlak** (de start): tot de onderkant van die onderdelen, zodat de ontgraving de diepte van de verhardingsopbouw omvat.
- **Bovenste oppervlak**: alleen tot de bovenkant van het ontwerp, zoals voorheen toen onderdelen meetelden.

De oppervlakken in de kop, de volumes eronder, het CSV en het massadiagram volgen deze keuze, en ze wordt met het project opgeslagen.

## Volumes met gemiddelde eindoppervlakken

Tussen twee naburige doorsneden is het volume het gemiddelde van hun twee oppervlakken maal de afstand tussen hun stations. De balk toont de totalen voor het tracé, en {{ui:CSV}} downloadt de oppervlakken en volumes van elke doorsnede met lopende totalen (kubieke yards voor voetprojecten, kubieke meters voor metrische).

**Eigenschappen** toont dezelfde totalen naast de rastermethode-volumes uit [Grondverzetvolumes](topic:volumes). De twee zijn verschillende benaderingen: dichtere doorsneden brengen ze dichter bij elkaar, en op een rechte weg op vlak terrein zijn ze gelijk.

:::note
Ontgraving en ophoging worden alleen binnen de afgewerkte gebieden geteld (de ontgravingslijnen van een corridor of plateau), zoals bij de rastermethode. Zonder corridor of plateau is het ontwerp het terrein, dus toont een doorsnede geen ontgraving of ophoging.
:::

## Massadiagram

**Massadiagram** onder **Steekproeflijnen** tekent het massadiagram uit dezelfde eindoppervlaktevolumes: langs de stations, het lopende totaal van ontgraving min ophoging.

- **Krimp (−) of zwel (+) van de ontgraving** zegt wat een kubieke yard ontgraving wordt zodra hij als ophoging is aangebracht: −10 % (de startwaarde, een tijdelijke waarde) betekent dat hij krimpt tot 0.9; gesteente dat zwelt kan +5 % zijn. Gebruik het cijfer uit uw geotechnisch rapport.
- Waar de lijn stijgt is de weg in ontgraving; waar hij daalt, in ophoging. Boven nul (oranje gearceerd) verplaatst grond zich stroomopwaarts; onder nul (groen), stroomafwaarts.
- **Evenwichtspunten** zijn waar de lijn nul kruist: tussen twee ervan zijn ontgraving en ophoging in evenwicht. De tabel toont elk evenwichtig traject, het verplaatste volume (zijn hoogste of laagste punt) en de gemiddelde aanvoerafstand (het gearceerde oppervlak gedeeld door dat volume).
- Waar de lijn eindigt buiten nul, is wat overblijft **overschot** (boven) of **aanvoer** (onder). In dat laatste traject telt alleen de grond boven het niveau waarop hij eindigt als verplaatst.

**CSV** slaat de massaordinaat op elke doorsnede, de trajecten en de factor op.
