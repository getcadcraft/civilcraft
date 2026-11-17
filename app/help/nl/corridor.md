---
title: Een wegcorridor uitvegen
summary: Zet een corridor aan voor een tracé, stel waarden in voor rijstrook, berm en zijhelling, en lees de doorsneden, overgangslijnen en het grondverzet die het oplevert.
keywords: superelevatie, super, overhelling, runoff, runout, tabel met hellingswaarden, dwarshelling, rotatie, corridor, samenstelling, subsamenstelling, typische doorsnede, weg, rijstrook, berm, zijhelling, overgang, ontgraving, ophoging, doorsneden, doel, doelen, breedtedoel, hoogtedoel, offsetdoel, verbreding, rand van de verharding, corridor volgen
from: 91303189
---

Een corridor veegt één eenvoudige typische doorsnede (een samenstelling) langs een tracé en het ontwerpprofiel, werkt die in op het bestaande terrein en voegt het resultaat toe aan het afgewerkte oppervlak. Een tracé kan meerdere corridors op verschillende stationsbereiken dragen, en een corridor kan uit herbruikbare sjablonen per stationering worden opgebouwd ([Corridorsjablonen](topic:corridor-templates)). De eenvoudige samenstelling hieronder is aan beide zijden gelijk; om elke zijde eigen onderdelen te geven, zie [Elke zijde opbouwen uit onderdelen](topic:corridor#build-each-side-from-parts).

## De samenstelling

Vanaf de as naar buiten, aan elke zijde:

1. een **rijstrook** van een bepaalde breedte, die vanaf de kruin afloopt met de **rijstrookhelling**
2. een **berm** van een bepaalde breedte, met de **bermhelling**
3. een **zijhelling** vanaf de rand van de berm tot waar hij het terrein raakt: de **ontgravingshelling** waar het terrein hoger ligt, de **ophogingshelling** waar het lager ligt

De startwaarden zijn tijdelijke invullingen, geen ontwerpnorm:

| Waarde | US feet | Meter |
|---|---|---|
| Breedte rijstrook | 12 ft | 3.6 m |
| Rijstrookhelling | 2% | 2% |
| Breedte berm | 4 ft | 1.2 m |
| Bermhelling | 4% | 4% |
| Ontgravingshelling | 2 : 1 | 2 : 1 |
| Ophogingshelling | 3 : 1 | 3 : 1 |
| Doorsnede elke | 10 ft | 5 m |

Hellingen van zijhellingen zijn horizontaal naar verticaal (H:V): 3 : 1 betekent 3 horizontaal voor 1 verticaal.

## De corridor bouwen

U hebt een tracé nodig zonder fouten en een ontwerpprofiel met ten minste twee PVI's en zonder fouten.

1. Selecteer het tracé.
2. Vink in het rechterpaneel, onder **Corridor**, **Samenstelling langs het ontwerpprofiel uitvegen** aan.
   De velden verschijnen en de corridor wordt meteen gebouwd. Het plan toont de randen van rijstrook en berm en de overgangslijnen; met {{ui:Voorgesteld (afgewerkt)}} gekozen onder **Weergave**, tonen de hoogtelijnen het nieuwe terrein.
3. Wijzig een waarde: **Breedte rijstrook**, **Rijstrookhelling**, **Breedte berm**, **Bermhelling**, **Ontgravingshelling**, **Ophogingshelling** of **Doorsnede elke**. Druk na elke wijziging op {{key:Enter}}. Ontgraving, ophoging en de afstand tussen doorsneden moeten meer dan 0 zijn.
4. Lees de regel onder de velden, bijvoorbeeld "39 doorsneden van 0+00.00 tot 3+86.36; ontgraving 240.2 cu yd, ophoging 556.0 cu yd."

Doorsneden worden gesneden op elke stap van **Doorsnede elke**, aan de uiteinden, en aan het begin en einde van elke horizontale en verticale kromme. Elke doorsnede en de lijnen erdoorheen (as, randen van rijstrook en berm, overgang) worden breeklijnen van het afgewerkte oppervlak.

Om de corridor uit te zetten, haalt u het vinkje weg. Zijn waarden worden voor de volgende keer bewaard.

## Wanneer hij niet bouwt

Een rood vak onder de velden zegt waarom:

| Melding | Wat te doen |
|---|---|
| "De corridor heeft een ontwerpprofiel zonder fouten nodig." | Voeg PVI's toe, of los overlappende verticale krommen op (zie [Een verticaal profiel ontwerpen](topic:profile)). |
| "Het ontwerpprofiel overlapt het tracé niet." | Verplaats de PVI's naar het stationsbereik van het tracé. |
| "De corridor heeft ten minste twee doorsneden op het oppervlak nodig." | Het grootste deel van de corridor ligt buiten het bestaande terrein. |
| "4 zijhellingen lopen af van het oppervlak voordat ze het terrein raken." | Dicht bij de rand van het oppervlak kan de helling het terrein niet bereiken. Houd de weg weg van de rand, of verlaag daar de ophogings- of ontgravingshoogte. |
| "De overgangslijnen van de corridor kruisen elkaar (doorsneden overlappen, bijvoorbeeld aan de binnenkant van een scherpe bocht). Gebruik een grotere straal of een smallere samenstelling." | Doorsneden aan de binnenkant van een scherpe bocht overlappen. Vergroot de straal of maak de samenstelling smaller. |

Een corridor met een probleem wordt niet ingewerkt en telt niet mee in het grondverzet.

## Corridors en platen samen

Het afgewerkte oppervlak wordt in volgorde opgebouwd: eerst elke corridor, dan elke plaat. Waar het afwerken van een plaat overlapt met een corridor, wint de plaat. Volumes worden berekend binnen alle overgangslijnen samen; zie [Grondverzetvolumes](topic:volumes).

## Superelevatie

In een bocht kan de weg naar de binnenkant kantelen, zodat het verkeer minder naar buiten wordt gedrukt. Vink **Bochten superelevatie geven** aan onder **Superelevatie** in de **Eigenschappen** van het tracé:

- Elke cirkelboog krijgt een tarief **e** uit de tabel: de eerste rij waarvan de straal de boog bereikt (een rij met een leeg tarief houdt de normale kruin). De tabel en de **Max. relatieve helling** (0.5% om mee te beginnen) zijn tijdelijke invullingen, geen norm: stel ze in op uw eigen ontwerpcriteria. Voeg rijen toe of verwijder ze naar wens.
- De rijstroken draaien om de as. Voor de bocht wordt de buitenste rijstrook afgevlakt over de **uitloop** (runout: normale kruin ÷ e × overgang). Daarna, over de **overgang** (runoff: breedte rijstrook × e ÷ de helling), draait de buitenste rijstrook door tot de hele weg met e naar de binnenkant helt. Tweederde van de overgang ligt vóór de bocht en eenderde erop. Na de bocht gebeurt hetzelfde in omgekeerde volgorde.
- Een berm aan de lage kant is nooit vlakker dan zijn rijstrook; aan de hoge kant houdt hij zijn eigen helling (hij rolt over).
- De tabel eronder toont de straal, het tarief, de overgang en de uitloop van elke bocht, en waar volledige superelevatie begint en eindigt. Het **superelevatiediagram** tekent de dwarshellingen van beide rijstroken langs de stationering (de linker rijstrook doorgetrokken, de rechter gestippeld).
- Een bocht die te kort is om volledige superelevatie te bereiken, of twee bochten waarvan de overgangen overlappen, wordt gemeld in een vak boven de tabel.

Doorsneden, volumes, de 3D-weergave en de bladen tonen allemaal de gekantelde weg. Elke wijziging is één stap: {{key:Mod+Z}} maakt haar ongedaan.

## Doelen

Een doel verplaatst één punt van één zijde van de weg naar een lijn: de **Rand van de verharding** of de **Rand van de berm**, aan de **Links** of **Rechts**. Elke doorsnede snijdt de lijn haaks op de as, en gaat alleen naar buiten aan die zijde, zodat een doel rechts de linkerzijde nooit verplaatst.

| Stelt in | Wat er gebeurt waar een doorsnede de lijn snijdt |
|---|---|
| **Breedte** | Het punt ligt op de lijn: de rijstrook (of de berm) wordt breder of smaller tot daar, met behoud van zijn dwarshelling. |
| **Hoogte** | Het punt krijgt daar de hoogte van de lijn, op zijn eigen offset: de dwarshelling van de rijstrook (of de berm) volgt. |

De lijn kan een elementlijn zijn (ongeacht zijn **Gebruik**) of een lijn van een andere corridor: zijn as, randen van de verharding, randen van de berm of overgangslijnen. De lijn van een corridor volgt die corridor: verandert u de andere weg, dan volgt deze weg. CivilCraft bouwt de andere corridor eerst; twee corridors die elkaar in een lus als doel zouden hebben, worden aan één kant geweigerd, en de tabel zegt welke.

1. Selecteer het tracé en zet de corridor aan.
2. Klik onder **Doelen** op {{ui:Een doel toevoegen}}.
3. Kies de **Zijde**, het **Punt**, wat het **Stelt in** en de **Naar de lijn**. Elke wijziging is één ongedaan-stap.

**Resultaat** zegt bij hoeveel doorsneden de lijn is bereikt. Doorsneden die de lijn niet bereiken (voorbij de uiteinden, of waar hij achter de as ligt) behouden de waarden van de samenstelling. Een lijn die wordt verwijderd laat de corridor zoals ze was vóór het doel, en de tabel zegt dat. Eén zijde kan per punt één breedte- en één hoogtedoel hebben.

## Bouw elke zijde uit onderdelen

Zet **Elke zijde uit onderdelen opbouwen** aan onder de instellingen van de corridor. Elke zijde krijgt dan een eigen lijst, vanaf de as naar buiten: rijstroken, een berm, een goot, een kantsteen, een plantstrook, een trottoir en, als laatste, de zijhelling naar het terrein (met zijn eigen ontgravings- en ophogingsverhoudingen). Begin met {{ui:Landelijke weg}} of {{ui:Stedelijke straat}}, voeg onderdelen toe en verwijder ze, verplaats ze met de pijltjes, en gebruik {{ui:Kopiëren}} om één zijde naar de andere te zetten. Elke wijziging is één ongedaan-stap.

Een dwarshelling is het verloop weg van de weg, dus een trottoir dat naar de weg afwatert is negatief. Een kantsteen is een vlak met de hoogte die u opgeeft, een bovenkant met de breedte die u opgeeft, en een optionele val aan de achterzijde. Superelevatie draait elke rijstrook in de eerste rij; de goot, kantsteen, strook en het trottoir hangen aan de rand van de rijstroken zoals gebouwd. Doelen verplaatsen nog steeds het einde van de rijstroken en het laatste onderdeel. Doorsneden markeren de stroomlijn van de goot, de bovenkant en achterkant van de kantsteen, en de rest. In een bocht met overgangsbogen is de overgang de overgangsboog: vlakke kruin bij de TS, volledige superelevatie bij de SC.

## Verhardingslagen

Een rijstrook, berm, goot, plantstrook of trottoir kan zijn opbouw dragen: onder het onderdeel voegt {{ui:Een laag toevoegen}} een laag toe met een naam, een materiaal, een dikte en zijn soort (toplaag, bindlaag, fundering, onderfundering, afdeklaag of overig), van boven naar beneden. De lagen verplaatsen het oppervlak van de weg niet (de bovenkant is het ontwerpoppervlak); elke laag ligt onder zijn onderdeel, met de diepte recht omlaag gemeten. Dwarsdoorsneden tekenen de onderkant van elke laag als een gestippelde lijn, en {{ui:Verhardingslagen: hoeveelheden}} toont het plattegrondoppervlak en het volume van elke laag (oppervlak langs de corridor uit zijn doorsneden, volume = oppervlak × dikte). De IFC-export schrijft elke laag als eigen element met zijn dikte en materiaal (zie [IFC-export en -import](topic:ifc)). De dikte die u invoert is de uwe: CivilCraft dimensioneert verhardingen niet.

## Wat nog niet is gebouwd

Doelen voor de overgangshelling zijn nog niet beschikbaar. Voor een corridor die langs de weg verandert, met links en rechts apart, gebruikt u [Corridorsjablonen](topic:corridor-templates). Zie [Nog niet beschikbaar](topic:not-built-yet).
