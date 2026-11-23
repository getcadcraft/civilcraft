---
title: Een verticaal profiel ontwerpen
summary: De profielweergave openen, een ontwerpprofiel vanaf het maaiveld starten, PVI's toevoegen en slepen, lengtes van verticale bogen instellen, en hellingen, K-waarden en hoge en lage punten aflezen.
keywords: profiel, verticale ligging, pvi, verticale boog, helling, k-waarde, kruin, hol, bvc, evc, profielweergave, afgewerkt niveau, fg, bestaand maaiveldprofiel, elementlijnen in profiel, kruisingen, geprojecteerd, kantsteen, greppel, labels
from: dbb1f32d
---

Elk tracé heeft één ontwerpprofiel: een lijst van PVI's (station en hoogte) verbonden door rechte hellingen, met bij elk tussenliggend PVI dat een lengte heeft een symmetrische parabolische verticale boog. Het bestaande maaiveldprofiel wordt voor u uit het oppervlak bemonsterd.

## De profielweergave openen

1. Selecteer het tracé (klik erop met {{ui:Selecteren}}).
2. Druk op {{key:R}}, of klik op {{ui:Profiel}} in de werkbalk, of op {{ui:Profielweergave}} onderaan het rechterpaneel.
   De profielweergave opent onder het plan met het bestaande maaiveld langs het tracé. Met twee of meer tracés kiest u er één in de lijst links in de profielbalk.

De weergave toont eerst het hele tracé en rekt de hoogtes uit om het paneel te vullen; de overdrijving staat linksonder vermeld, bijvoorbeeld "Verticale overdrijving 10×".

## Het profiel zoomen en verschuiven

- **Zoomen:** draai aan het muiswiel (of knijp op een trackpad) en de weergave zoomt rond de aanwijzer. Houd {{key:Shift}} ingedrukt om alleen de stationeringen te zoomen, of {{key:Alt}} om alleen de hoogtes te zoomen (dat verandert de overdrijving). Met de profielweergave in focus zoomen de plus- en mintoetsen vanuit het midden.
- **Verschuiven:** sleep met de rechter of middelste muisknop, of veeg met twee vingers op een trackpad.
- **Passend maken:** dubbelklik op het profiel of druk op {{key:F}} om het hele tracé weer te tonen.

Een PVI bewerken behoudt de zoom die u koos; de weergave springt niet terug naar passend.

Beweeg de aanwijzer langs het profiel: de balk toont het station, het maaiveld- en ontwerpniveau, de helling en de ontgraving of ophoging daar, en een stip volgt op het tracé in het plan.

## Het ontwerpprofiel starten

1. Klik in het rechterpaneel onder **Ontwerpprofiel** op {{ui:Beginnen vanaf het maaiveld}}.
   Twee PVI's worden op het maaiveld geplaatst aan de twee uiteinden van het tracé, verbonden door één rechte helling. De statusbalk zegt: "Ontwerpprofiel gestart op het maaiveld aan beide uiteinden. Schakel PVI's toevoegen in en klik om hellingsbreuken toe te voegen; geef ze een lengte voor de boog in de tabel."

Als het tracé het oppervlak niet kruist, krijgt u "Dit tracé heeft geen maaiveld onder zich om vanaf te beginnen." Voeg dan PVI's toe door te klikken (volgende sectie).

## PVI's toevoegen

1. Druk op {{key:I}}, of klik op {{ui:PVI's toevoegen}} in de profielbalk. Hij blijft ingedrukt.
2. Klik in het profiel waar u een hellingsbreuk wilt. Een PVI wordt op dat station en die hoogte toegevoegd, afgerond op 0.01, en geselecteerd.
3. Voeg er zoveel toe als nodig, en druk daarna nogmaals op {{key:I}} om te stoppen met toevoegen.

Een klik waar al een PVI is wordt geweigerd ("Er is al een PVI bij …"). PVI's blijven altijd in stationsvolgorde.

## Snappen bij toevoegen of slepen

De knop **Snap** in de profielbalk staat in het begin aan. Zolang hij aan staat, komt een PVI die u toevoegt of sleept op het dichtstbijzijnde PVI, maaiveldpunt, PVI-station of de maaiveldlijn, en een label bij de markering zegt welke. Houd {{key:Alt}} ingedrukt voor een vrij punt, overal.

## PVI's aanpassen

- **Sleep** een PVI in het profiel om hem te verplaatsen. Hij kan zijn buren niet passeren. De verplaatsing is één stap voor Ongedaan maken.
- **Typ** exacte waarden in de PVI-tabel in het rechterpaneel: **Station**, **Hoogte**, **Helling %** en **Boog L** (lengte van de verticale boog). Druk na elke waarde op {{key:Enter}}.
- **Kies** een waarde uit het profiel: de kleine knop naast het station of de hoogte van een PVI wacht op één klik in de profielweergave en vult die waarde in. De klik snapt zoals PVI's toevoegen; houd {{key:Alt}} ingedrukt voor een vrij punt; {{key:Esc}} annuleert.
- **Helling %** is de helling van de raaklijn die bij dat PVI begint en naar het volgende loopt. Typen ervan verplaatst de hoogte van het **volgende** PVI (zijn station verandert nooit). Is het volgende PVI vergrendeld, dan verplaatst de hoogte van het vorige PVI.
- **Vergrendel** een PVI met het hangslotje aan het eind van zijn rij. Een vergrendeld PVI wordt niet gesleept, en een hellingbewerking verplaatst hem niet. Zijn beide uiteinden van een raaklijn vergrendeld, dan kan zijn helling niet veranderen: de statusbalk zegt dat, en u ontgrendelt eerst één uiteinde. De vergrendeling wordt in het bestand opgeslagen.
- **Verwijder** een PVI met het kruisje aan het eind van zijn rij, of selecteer hem (klik erop) en druk op {{key:Delete}}. Wanneer de profielweergave de focus heeft, verwijdert {{key:Backspace}} hem ook.

Het eerste en laatste PVI krijgen nooit een boog.

## Verticale bogen

1. Typ een lengte in **Boog L** voor een tussenliggend PVI, bijvoorbeeld 200.
2. De boog wordt gecentreerd op het PVI getekend. Het profiel en het rechterpaneel tonen zijn soort (kruin of hol), L en K, de BVC- en EVC-stations en -hoogtes, en zijn hoge of lage punt wanneer er één binnen de boog ligt.

K wordt berekend uit L (K = L gedeeld door het algebraïsche verschil in hellingen, in procent). U typt L; K direct typen is nog niet beschikbaar.

Past een verticale boog niet, dan zegt een rood vak waarom: hij loopt terug in het PVI of de boog ervoor, of voorbij het volgende PVI, en hoeveel ruimte er aan die kant is (een boog heeft de helft van zijn lengte aan elke kant van zijn PVI nodig). De knop stelt **de langste boog die past** in, met zijn K, als één stap ({{key:Mod+Z}} maakt die ongedaan). Of verplaats de PVI's uit elkaar.

## De feiten lezen

Onder de PVI-tabel geeft een lijst elke helling in procent ("Helling 1: +1.25%") en elke boog, bijvoorbeeld "Kruin bij 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", gevolgd door "Hoog punt 1+62.40, 254.12".

Bereiken de PVI's niet beide uiteinden van het tracé, dan zegt een notitie dat. Een corridor wordt alleen gebouwd waar het profiel en het tracé overlappen.

## Elementlijnen in het profiel

Elementlijnen worden ook in de profielweergave getoond, zodat u een kantsteen, een greppel of een muurtop kunt zien tegen het profiel van de weg.

- Waar een elementlijn het tracé **kruist**, toont het profiel een klein ruitje op dat station en die hoogte, met de naam van de lijn en zijn hoogte daar (de eigen hoogte van de lijn, berekend langs het segment dat kruist).
- Typ een afstand in {{ui:Naast het tracé binnen}} om ook de elementlijnen te tekenen die **naast** het tracé lopen binnen die afstand, als gestreepte lijnen op hun eigen hoogte. Leeg of 0 toont alleen de kruisingen.
- De markeringen en labels volgen elke wijziging: verplaatst u een hoekpunt, typt u een helling of verhoogt u de lijn, dan toont het profiel meteen de nieuwe hoogtes.
- Klik op het ruitje van een kruising om die elementlijn te selecteren; de geselecteerde lijn wordt in de markeringskleur getekend.
- {{ui:Elementlijnen}} in de profielbalk verbergt of toont ze allemaal. Beide instellingen worden met het project opgeslagen.

Zie [Elementlijnen](topic:feature-lines).

## Volgende

- [Een wegcorridor uitvegen](topic:corridor) langs het tracé en dit profiel.
- Het profiel wordt samen met het tracé naar LandXML geschreven; zie [LandXML uitwisselen](topic:landxml).
