---
title: Een wegcorridor uitvegen
summary: Een corridor voor een tracé inschakelen, waarden voor rijstrook, berm en zijhelling instellen, en de doorsneden, ontgravingslijnen en grondverzet lezen die het oplevert.
keywords: kruispunt, aansluiting, weg kruist weg, zijweg, T-splitsing, kruising, plateauhoogte, aansluiten, koppelen, overhoging, super, overhoogte, overgang, uitloop, overhoogtetabel, dwarshelling, rotatie, corridor, dwarsprofiel, subonderdeel, weg, rijstrook, berm, zijhelling, ontgraving, ophoging, doorsneden, doel, doelen, breedtedoel, hoogtedoel, offsetdoel, verbreding, verhardingsrand, een andere corridor volgen
from: 6dcb92b3
---

Een corridor vegt één eenvoudig dwarsprofiel (een dwarsprofiel) langs een tracé en zijn ontwerpprofiel, werkt het af in het bestaande maaiveld en voegt het resultaat toe aan het voorgestelde oppervlak. Een tracé kan meerdere corridors dragen op verschillende stationsbereiken, en een corridor kan per station worden opgebouwd uit herbruikbare sjablonen ([Corridorsjablonen](topic:corridor-templates)). Het eenvoudige dwarsprofiel hieronder is aan beide zijden gelijk. Wilt u elke zijde eigen onderdelen geven, zie [Elke zijde opbouwen uit onderdelen](topic:corridor#build-each-side-from-parts).

## Het dwarsprofiel

Vanaf de as naar buiten, aan elke zijde:

1. een **rijstrook** met een bepaalde breedte, die vanaf de kruin afloopt met de **rijstrookhelling**
2. een **berm** met een bepaalde breedte bij de **bermhelling**
3. een **zijhelling** vanaf de bermrand tot waar hij het maaiveld raakt: de **ontgravingshelling** waar het terrein boven ligt, de **ophogingshelling** waar het eronder ligt

De startwaarden zijn tijdelijke waarden, geen ontwerpnorm:

| Waarde | US feet | Meter |
|---|---|---|
| Rijstrookbreedte | 12 ft | 3.6 m |
| Rijstrookhelling | 2% | 2% |
| Bermbreedte | 4 ft | 1.2 m |
| Bermhelling | 4% | 4% |
| Ontgravingshelling | 2 : 1 | 2 : 1 |
| Ophogingshelling | 3 : 1 | 3 : 1 |
| Doorsnede elke | 10 ft | 5 m |

Hellingen van zijhellingen zijn horizontaal ten opzichte van verticaal (H:V): 3 : 1 betekent 3 horizontaal voor 1 verticaal.

## De corridor bouwen

U hebt een tracé zonder fouten nodig en een ontwerpprofiel met minstens twee PVI's en zonder fouten.

1. Selecteer het tracé.
2. Zet in het rechterpaneel onder **Corridor** een vinkje bij **Een dwarsprofiel langs het ontwerpprofiel uitvegen**.
   De velden verschijnen en de corridor wordt meteen gebouwd. Het plan toont de randen van rijstrook en berm en de ontgravingslijnen; met {{ui:Voorgesteld (afgewerkt)}} gekozen onder **Weergave** tonen de hoogtelijnen het nieuwe terrein.
3. Wijzig een waarde: **Rijstrookbreedte**, **Rijstrookhelling**, **Bermbreedte**, **Bermhelling**, **Ontgravingshelling**, **Ophogingshelling**, **Doorsnede elke**. Druk na elke wijziging op {{key:Enter}}. Ontgraving, ophoging en doorsnedeafstand moeten groter zijn dan 0.
4. Lees de regel onder de velden, bijvoorbeeld "39 doorsneden van 0+00.00 tot 3+86.36; ontgraving 240.2 cu yd, ophoging 556.0 cu yd."

Doorsneden worden gesneden op elke stap van **Doorsnede elke**, aan de uiteinden, en aan begin en eind van elke horizontale en verticale boog. Elke doorsnede en de lijnen erdoor (as, randen van rijstrook en berm, ontgravingslijn) worden breeklijnen van het voorgestelde oppervlak.

Zet de corridor uit door het vakje uit te vinken. De waarden blijven bewaard voor de volgende keer.

## Als hij niet bouwt

Een rood vak onder de velden zegt waarom:

| Melding | Wat te doen |
|---|---|
| "De corridor heeft een ontwerpprofiel zonder fouten nodig." | PVI's toevoegen, of overlappende verticale bogen oplossen (zie [Een verticaal profiel ontwerpen](topic:profile)). |
| "Het ontwerpprofiel overlapt het tracé niet." | Verplaats de PVI's naar het stationsbereik van het tracé. |
| "De corridor heeft minstens twee doorsneden op het oppervlak nodig." | Het grootste deel van de corridor ligt buiten het bestaande maaiveld. |
| "4 zijhellingen lopen van het oppervlak af voordat ze het maaiveld raken." | Dicht bij de rand van het oppervlak kan de helling het maaiveld niet bereiken. Houd de weg weg van de rand, of verlaag daar de ophogings- of ontgravingshoogte. |
| "De ontgravingslijnen van de corridor kruisen elkaar (doorsneden overlappen, bijvoorbeeld aan de binnenkant van een krappe boog). Gebruik een grotere straal of een smallere dwarsprofiel." | Doorsneden aan de binnenkant van een scherpe boog overlappen. Vergroot de straal of maak het dwarsprofiel smaller. |

Een corridor met een probleem wordt niet afgewerkt en telt niet mee in het grondverzet.

## Corridors en plateaus samen

Het voorgestelde oppervlak wordt in volgorde opgebouwd: eerst elke corridor, dan elk plateau. Waar de afwerking van een plateau overlapt met een corridor, wint het plateau. Waar een later item een weg overlapt, wordt alleen het deel van de weg binnen de ontgravingslijn van het latere item vervangen; de rest van de weg, en elke terreinbreeklijn die de weg kruist, behoudt zijn vorm. Volumes worden berekend binnen alle ontgravingslijnen samen; zie [Grondverzetvolumes](topic:volumes).

## Overhoging

In een boog kan de weg naar de binnenkant hellen, zodat het verkeer minder naar buiten wordt gedrukt. Vink **Bochten overhogen** aan onder **Overhoging** in de **Eigenschappen** van het tracé:

- Elke cirkelboog krijgt een hellingswaarde **e** uit de overhoogtetabel: de eerste rij waarvan de straal de boog bereikt (een rij met een lege waarde houdt de normale kruin). De tabel en de **Maximale relatieve helling** (0.5 % als start) zijn tijdelijke waarden, geen norm: stel ze in op basis van uw eigen ontwerpcriteria. Voeg rijen toe of verwijder ze naar behoefte.
- De rijstroken draaien om de as. Vóór de boog wordt de buitenste rijstrook vlakker over de **uitloop** (normale kruin ÷ e × overgangslengte). Daarna, over de **overgangslengte** (rijstrookbreedte × e ÷ de helling), blijft de buitenste rijstrook draaien tot de hele weg met e naar de binnenkant helt; tweederde van de overgangslengte ligt vóór de boog en eenderde erop. Na de boog gebeurt hetzelfde in omgekeerde volgorde.
- Een berm aan de lage kant is nooit vlakker dan zijn rijstrook; aan de hoge kant houdt hij zijn eigen helling (hij rolt om).
- De tabel eronder geeft per boog de straal, hellingswaarde, overgangslengte en uitloop en waar volledige overhoging begint en eindigt. Het **overhogingsdiagram** toont de dwarshellingen van beide rijstroken langs de stationering (de linker rijstrook doorgetrokken, de rechter gestreept).
- Een boog die te kort is om de volledige overhoging te bereiken, of twee bogen waarvan de overgangen overlappen, wordt gemeld in een vak boven de tabel.

Doorsneden, volumes, de 3D-weergave en de bladen tonen de gekantelde weg. Elke wijziging is één stap: {{key:Mod+Z}} maakt hem ongedaan.

## Doelen

Een doel verplaatst één punt van één zijde van de weg naar een lijn: de **Verhardingsrand** of de **Bermrand**, aan de **Links** of de **Rechts**. Elke doorsnede raakt de lijn haaks op de as en gaat alleen naar die zijde, zodat een doel rechts de linkerzijde nooit verplaatst.

| Stelt in | Wat er gebeurt waar een doorsnede de lijn raakt |
|---|---|
| **Breedte** | Het punt ligt op de lijn: de rijstrook (of berm) wordt breder of smaller tot de lijn, en behoudt zijn dwarshelling. |
| **Hoogte** | Het punt krijgt daar de hoogte van de lijn, op zijn eigen afstand tot de as: de dwarshelling van de rijstrook (of berm) volgt. |

De lijn kan een elementlijn zijn (wat diens **Gebruik** ook is) of een lijn van een andere corridor: diens as, verhardingsranden, bermranden of ontgravingslijnen. De lijn van een corridor volgt die corridor: wijzigt u de andere weg, dan volgt deze. CivilCraft bouwt de andere corridor eerst. Twee corridors die elkaar in een lus als doel zouden hebben, worden aan één kant geweigerd, en de tabel zegt welke.

1. Selecteer het tracé en zet zijn corridor aan.
2. Klik onder **Doelen** op {{ui:Een doel toevoegen}}.
3. Kies de **Zijde**, het **Punt**, wat het **Stelt in** en de **Naar de lijn**. Elke wijziging is één stap voor Ongedaan maken.

**Resultaat** zegt bij hoeveel doorsneden de lijn werd bereikt. Doorsneden die de lijn niet bereiken (voorbij de uiteinden of waar hij achter de as ligt) behouden de waarden van het dwarsprofiel. Een lijn die wordt verwijderd laat de corridor achter zoals hij was vóór het doel, en de tabel meldt dat. Eén zijde kan per punt één breedte- en één hoogtedoel hebben.

## Elke zijde opbouwen uit onderdelen

Zet **Elke zijde opbouwen uit onderdelen** aan onder de instellingen van de corridor. Elke zijde krijgt dan zijn eigen lijst, van de as naar buiten: rijstroken, een berm, een goot, een kantsteen, een plantstrook, een trottoir en, als laatste, de zijhelling naar het maaiveld (met eigen ontgravings- en ophogingsverhoudingen). Begin met {{ui:Landelijke weg}} of {{ui:Stedelijke straat}}, voeg onderdelen toe en verwijder ze, verplaats ze met de pijltjes, en {{ui:Kopiëren}} één zijde naar de andere. Elke wijziging is één stap voor Ongedaan maken.

Een dwarshelling is de helling vanaf de weg, dus een trottoir dat naar de weg afwatert is negatief. Een kantsteen is een vlak met de hoogte die u opgeeft, een bovenkant met de breedte die u opgeeft en een optionele val aan de achterkant. Overhoging draait elke rijstrook in de eerste rij; de goot, kantsteen, strook en trottoir hangen aan de rand van de rijstroken zoals gebouwd. Doelen verplaatsen nog steeds het einde van de rijstroken en het laatste onderdeel. Dwarsprofielen markeren de goottaluweg, de bovenkant en achterkant van de kantsteen, en de rest. Bij een boog met overgangsbogen is de overgang de overgangsboog: vlakke kruin bij de TS, volledige overhoging bij de SC.

## Verhardingsopbouw

Een rijstrook, berm, goot, plantstrook of trottoir kan zijn opbouw dragen: onder het onderdeel voegt {{ui:Een laag toevoegen}} een laag toe met een naam, een materiaal, een dikte en zijn soort (toplaag, binderlaag, fundering, onderfundering, afdeklaag of overig), van boven naar beneden. De lagen veranderen het oppervlak van de weg niet (de bovenkant is het ontwerpoppervlak); elke laag ligt onder zijn onderdeel, en zijn diepte wordt recht naar beneden gemeten. Dwarsprofielen tekenen de onderkant van elke laag als gestreepte lijn, en {{ui:Verhardingslagen: hoeveelheden}} toont het plangebied en het volume van elke laag (oppervlak langs de corridor uit zijn doorsneden, volume = oppervlak × dikte). De IFC-export schrijft elke laag als eigen element met zijn dikte en materiaal (zie [IFC-export en -import](topic:ifc)). De dikte die u invoert is van u: CivilCraft dimensioneert verhardingen niet.

## Waar wegen wegen, plateaus en paden raken

Met {{ui:Voeg de wegen en plateaus die het raakt samen}} aan (dat staat aan voor elke corridor) voegt CivilCraft een corridor samen met wat hij in plan raakt:

- **Een weg die op een andere weg eindigt** (het einde van zijn tracé ligt op de andere weg, of binnen ongeveer de helft van zijn eigen verhardingsbreedte van de rand van die weg) is de zijweg van een kruispunt. De weg die hij raakt opent zijn rand voor de verharding van de zijweg: over de monding worden de berm, kantsteen, strook en trottoir aangelegd op de dwarshelling van de rijstrook en als verharding getekend. De zijweg wordt op het oppervlak van de hoofdweg gelegd waar ze overlappen, en daar over de nadering naar boven of beneden getrokken.
- **Twee wegen die elkaar kruisen** worden aan beide kanten op dezelfde manier samengevoegd. De weg die als eerste onder Tracés staat is de doorgaande weg; de andere volgt diens oppervlak over de kruising.
- **Een weg die op een plateau eindigt** (erin, of binnen ongeveer de helft van zijn verhardingsbreedte van diens rand) komt op het niveau van het plateau en wordt er over de nadering naartoe getrokken.
- **Een pad** (Landschap › Verharding) stopt aan de buitenrand van een weg, op het niveau van het trottoir of de berm daar, in plaats van over de weg te liggen. Een pad dat een weg kruist wordt twee stukken. Een einde dat iets te kort bij een weg is getekend (binnen twee keer de breedte van het pad) wordt doorgetrokken tot zijn rand.

Eigenschappen zegt wat elke corridor heeft samengevoegd, met hoeveel die daar is opgehoogd of verlaagd en over welke lengte. Die lengte is het grotere van 10 m (30 ft) en twintig keer de wijziging, en nooit meer dan 45% van de corridor. **Het ontwerpprofiel wordt niet gewijzigd**: de profielweergave toont nog steeds de hoogtelijn die u tekende, en de doorsneden, het voorgestelde oppervlak, de volumes en de 3D-weergave tonen de weg zoals hij is samengevoegd. Om de aansluiting ontwerpmatig exact te maken, verplaatst u de laatste PVI naar het niveau dat Eigenschappen meldt.

Zet de schakelaar uit op een corridor om hem precies te laten zoals zijn profiel en dwarsprofiel bepalen; hij neemt dan geen deel aan een kruispunt, noch als zijweg noch als doorgaande weg. Wegen die bijna in lijn samenkomen (onder ongeveer 20°) blijven ongemoeid, net als sporen.

Wat een kruispunt nog niet doet: er zijn geen kantsteenbogen (hoeken zijn recht), geen afslaglanen of eilanden, het einde van de zijweg wordt recht afgesneden op zijn eigen tracé, en een corridor die uit sjablonen is opgebouwd opent zijn rand op dezelfde eenvoudige manier (een greppel of muur in zijn eindconditie wordt over de monding vlakgelegd, zonder duiker). Voor kantsteenbogen in plan, zichttriangels en markering zie [Bodem, wegen, opmeting, mijnen en koppelingen](topic:soils-roads-survey-mines-links).

## Wat nog niet beschikbaar is

Doelen voor de ontgravingshelling zijn nog niet beschikbaar. Voor een corridor die langs de weg verandert, met links en rechts apart, gebruikt u [Corridorsjablonen](topic:corridor-templates). Zie [Nog niet beschikbaar](topic:not-built-yet).
