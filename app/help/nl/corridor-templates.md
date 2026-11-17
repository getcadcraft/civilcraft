---
title: Corridorsjablonen en terreinsjablonen
summary: Maak kleine herbruikbare sjablonen (kantsteen en goot, trottoir, keermuur, greppel), bouw er per stationering een corridor van met links en rechts apart, splits een tracé in meerdere corridors, en drapeer gelaagde materialen op een terrein.
keywords: sjabloon, sjablonen, sjabloonbibliotheek, sjabloon maken, typische doorsnede, samenstelling, subsamenstelling, onderdelen, puntcodes, eindvoorwaarde, overgang, greppel, keermuur, kantsteen, goot, trottoir, gebieden, stationsbereik, meerdere corridors, links en rechts, terreinsjabloon, teelaarde, verharding, fundering, drapeeren, materialen, hoeveelheden
from: ce70e58b
---

Een **sjabloon** is een kleine dwarsdoorsnede die u één keer tekent en daarna hergebruikt: punten met offsets, hellingen en puntcodes, en onderdelen met materialen. Een corridor kan uit sjablonen per stationering worden opgebouwd, met elke zijde een eigen verhardingssjablonen en een eigen eindvoorwaarde, en dezelfde sjablonen kunnen op een terrein worden gedrapeerd.

:::warning
De voorbeeldsjablonen zijn tijdelijke invullingen om mee te beginnen. Hun getallen komen niet uit een norm of van een instantie. Een ingenieur moet elk sjabloon en elke waarde die u erin invult controleren voordat het voor een ontwerp wordt gebruikt.
:::

## Open de sjablonen

Open {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Corridorsjablonen…}} (of typ {{cmd:TEMPLATES}}). Het venster heeft drie lijsten:

- **In dit project**: de sjablonen die de corridors en terreinsjablonen van dit project gebruiken. Ze worden in het projectbestand opgeslagen.
- **Mijn bibliotheek**: sjablonen die in deze browser worden bewaard en in elk project worden aangeboden. Gebruik {{ui:Opslaan in Mijn bibliotheek}} op een projectsjabloon om het te bewaren.
- **Voorbeelden**: twee rijstroken met lagen, kantsteen en goot, trottoir, overgang, greppel, keermuur, teelaarde onder het terrein, en verharding op het terrein. Elk is gemarkeerd als "Ter controle door een ingenieur".

{{ui:Gebruiken in dit project}} kopieert een bibliotheek- of voorbeeldsjabloon naar het project. {{ui:Sjablonen van dit project exporteren}} slaat ze op als een `.cctemplates.json`-bestand, en {{ui:Bestand importeren}} leest er een in het project en in Mijn bibliotheek. Gebruik het bestand om sjablonen te delen of naar een andere computer te verplaatsen.

## Maak een sjabloon

{{ui:Nieuw sjabloon}} (of {{ui:Bewerken}} bij een projectsjabloon) opent de sjabloneditor. Teken de rechterzijde, naar buiten vanaf het 0,0-punt van het sjabloon; de linkerzijde gebruikt hetzelfde sjabloon naar buiten, naar links.

1. Geef het een naam en een soort: **Verharding** (het volgende sjabloon sluit aan op het einde), **Eindvoorwaarde** (het raakt het terrein) of **Terreinsjabloon**.
2. Voeg **waarden** toe: benoemde getallen zoals een breedte `w` of een helling `s`. Een getalvak ergens in het sjabloon neemt een getal of de naam van een waarde; `-t` is de waarde `t` met een negatief teken. Een corridor kan elk gebruik van het sjabloon eigen waarden geven, zodat één kantsteen-sjabloon elke kantsteenhoogte bedient.
3. Voeg **punten** toe, in volgorde. Elk wordt geplaatst vanaf een eerder punt (of het 0,0-punt) volgens zijn beperking:

| Beperking | Plaatst het punt |
|---|---|
| Offset op een helling | Een offset naar buiten en een helling (stijging per horizontale lengte; −0.02 daalt 2%) |
| Offset en stijging | Een offset en een stijging |
| Recht omhoog of omlaag | Alleen een stijging |
| Zijhelling tot het terrein | Naar buiten vanaf het punt tot het terrein, bij de ontgravingsverhouding waar het terrein erboven ligt en de ophogingsverhouding waar het eronder ligt |
| Tot het terrein | Een offset, daarna recht omhoog of omlaag tot het terrein |
| Keermuur | Een muur met de dikte die u opgeeft: in ontgraving raakt de bovenkant het terrein bij de wegrand; in ophoging loopt de weg eroverheen en daalt de buitenkant tot het terrein |

   Vink **Boven** aan voor de punten waar het afgewerkte oppervlak doorheen loopt. Het laatste bovenpunt is waar het volgende sjabloon aan die zijde begint. Een **Doel** laat een corridor het punt verplaatsen: de offset of de hoogte komt uit een lijn.
4. Voeg **onderdelen** toe: gesloten vormen via puntcodes (`0` is het 0,0-punt), elk met een naam, een materiaal en een soort. Hun oppervlakten geven de volumes.

De tekening volgt elke wijziging op ware schaal, en de lijst eronder zegt wat er niet klopt (een punt dat het terrein raakt vóór het einde, een waarde die het sjabloon niet heeft, een onderdeel zonder oppervlak). {{ui:Aan dit project toevoegen}} of {{ui:Opslaan}} bewaart het, als één ongedaan-stap.

## Bouw een corridor uit sjablonen

Selecteer een tracé met een corridor en zet in de eigenschappen ervan {{ui:Bouwen vanuit sjablonen per stationering}} aan. De corridor start met de voorbeelden van twee rijstroken en overgang aan beide zijden.

- **Gebieden.** Elk gebied begint bij een station en loopt tot het begin van het volgende gebied. {{ui:Gebied toevoegen}} voegt er een toe; wijzig het startstation in het vakje ervan.
- **Links en rechts apart.** Elke zijde van elk gebied heeft een eigen lijst **Verharding**, vanaf de as naar buiten, en een eigen **Eindvoorwaarde**: overgang, een greppel, een muur, of elk sjabloon dat het terrein raakt. Zonder eindvoorwaarde loopt de zijde over in de ontgravings- en ophogingshellingen van de corridor. {{ui:Links naar rechts kopiëren}} kopieert een zijde.
- **Waarden en doelen.** Onder elk sjabloon aan een zijde staat per waarde een vakje (leeg = de eigen waarde van het sjabloon) en, voor een punt dat een doel neemt, de elementlijn of de lijn van een andere corridor die het verplaatst.
- **Van** en **Tot** beperken de corridor tot een deel van het tracé.

De doorsneden, de plattegrondlijnen voor elke puntcode, het afgewerkte oppervlak, uitzetten en grondverzet volgen allemaal. Eigenschappen toont het volume van elk onderdeel per zijde en gebied (gemiddelde eindoppervlakken langs de as). Superelevatie en de randdoelen van de corridor worden niet gebruikt zolang de corridor uit sjablonen is opgebouwd.

## Meerdere corridors op één tracé

Onder **Corridors op dit tracé** voegt {{ui:Corridor toevoegen}} een corridor toe op het rest van het tracé: de eerste corridor krijgt een eindstation in het midden (of behoudt het eigen), en de nieuwe begint daar met het laatste gebied van sjablonen van de eerste. Elke corridor heeft een eigen naam, stationsbereik, sjablonen en grondverzet. Zet er één uit met het vakje {{ui:Aan}}. Waar twee bereiken overlappen, legt de latere corridor het afgewerkte terrein over de eerdere heen.

## Terreinsjablonen

Een terreinsjabloon drapeert de lagen van een sjabloon op een terrein vanaf zijn 0,0-punt: een laag onder het 0,0-punt gaat de grond in (teelaarde om af te graven), een laag erboven ligt op het terrein (fundering en verharding op een parkeerplaats). Breedtes en hellingen doen er niet toe, alleen de diepte van elk onderdeel boven of onder het 0,0-punt.

Open {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Terreinsjablonen…}} (of typ {{cmd:TERRAINTEMPLATES}}); het blok staat ook in de eigenschappen van het project. {{ui:Terreinsjabloon toevoegen}} voegt er een toe met het voorbeeld van teelaarde. Kies voor elk:

- het **sjabloon** (de waarden ervan kunnen voor deze keer worden gewijzigd),
- het **terrein**: het bestaande terrein of het voorgestelde oppervlak,
- de **vorm** die het afknipt: het hele terrein, een perceel, een plaat of een gesloten elementlijn. Meerdere terreinsjablonen kunnen verschillende vormen op hetzelfde terrein gebruiken.

Elke laag toont zijn dikte, plattegrondoppervlak en volume. Het volume is het plattegrondoppervlak maal de dikte, waarbij de dikte recht omlaag wordt gemeten; het oppervlak wordt op een raster gemeten, en het gedrapeerde (hellende) oppervlak wordt ook gegeven. De vormen worden op het plan getekend op laag C-TOPO-TMPL. Terreinsjablonen wijzigen het afgewerkte oppervlak niet.

## Materialen en hoeveelheden

Het blok Grondverzet van het project toont **Materialen uit sjablonen**: elk corridoronderdeel en elke laag van een terreinsjabloon met zijn volume. {{ui:Naar TakeoffCraft sturen}} schrijft ze na het grondverzet in het hoeveelhedenbestand, één post per stuk, in kubieke yards (projecten in voet) of kubieke meter.

## Bestanden

Sjablonen, gebieden, de extra corridors en de terreinsjablonen worden in het projectbestand opgeslagen. Een project dat er geen gebruikt, wordt precies zoals voorheen opgeslagen, en oudere versies van CivilCraft openen een project dat ze wel gebruikt (ze negeren de sjablonen en bouwen de eigen samenstelling van de corridor).
