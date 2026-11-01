---
title: Het scherm, onderdeel voor onderdeel
summary: Een rondleiding langs elke balk en elk paneel in CivilCraft met de naam zoals die op het scherm staat, van de werkbalk tot de statusbalk.
keywords: interface, scherm, werkbalk, panelen, eigenschappen, statusbalk, profielweergave, indeling, rondleiding, ui
from: 76272010
---

CivilCraft heeft één scherm. Er zijn geen tabbladen en geen indelingen. De zijpanelen kunnen worden verplaatst, zwevend gemaakt of naar een eigen venster gebracht: zie [De panelen indelen en een tweede monitor gebruiken](common:arrange-panels). Van boven naar beneden en van links naar rechts:

- de **appbalk** (CadCraft-merkteken, appnaam, versie, Over, schermmodus, Help, Opslaan voor offline gebruik, Papier en Model)
- de **werkbalk** met zeven groepen knoppen
- het **linkerpaneel**: Terrein, Punten, Oppervlak, Weergave en, zodra u er een aantal importeert, GIS-lagen
- het **plan** in het midden, met daaronder de **profielweergave** als die open is
- het **rechterpaneel**: Eigenschappen van wat is geselecteerd
- de **statusbalk** langs de onderkant

## Appbalk

De smalle balk helemaal bovenaan hoort bij de CadCraft-site, niet bij CivilCraft zelf.

- Het versiemenu toont welke build u gebruikt.
- {{ui:Over CivilCraft}} opent de pagina van de app op de site.
- {{ui:Volledig scherm}} schakelt tussen de schermmodi: volledig scherm, daarna volledig scherm met verborgen balken, daarna terug naar normaal. {{key:Ctrl+Shift+F}} doet hetzelfde op elk platform, ook op een Mac (daar is het de Control-toets, niet Command). Zijn de balken verborgen, beweeg dan de aanwijzer naar de bovenrand om ze terug te halen.
- {{ui:Help}} (of {{key:F1}}) opent deze Help in een zijpaneel; {{key:F1}} of {{key:Esc}} sluit hem.
- {{ui:Opslaan voor offline gebruik}} bewaart CivilCraft in deze browser zodat het zonder verbinding opent; het toont dan {{ui:Klaar voor offline gebruik}}. Zie [Bestanden die u kunt openen, opslaan en exporteren](topic:files#online-and-offline).
- {{ui:Papier}} en {{ui:Model}} schakelen tussen een licht en een donker thema. Het plan en het profiel volgen het thema; pdf's worden altijd op wit afgedrukt.

## Werkbalk

Elke groep heeft een klein label boven zijn knoppen. Wijs een knop aan om de tooltip en de toets te zien.

| Groep | Knoppen | Wat ze doen |
|---|---|---|
| Bestand | {{ui:Nieuw}}, {{ui:Openen}}, {{ui:Opslaan}} | Opnieuw beginnen, een puntenbestand, LandXML of project openen, het project als download opslaan |
| Exporteren | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | LandXML 1.2, een R12-DXF of een DWG van het plan schrijven, of het plan naar PDF plotten |
| Oppervlak | {{ui:Breeklijn}}, {{ui:Begrenzing}} | Een breeklijn door meetpunten tekenen; de buitenste begrenzing tekenen |
| Ontwerp | {{ui:Tracé}}, {{ui:Plateau}}, {{ui:Leidingen}}, {{ui:Profiel}} | Een tracé, een plateau, een leidingtraject tekenen; de profielweergave tonen of verbergen |
| Bewerken | {{ui:Ongedaan maken}}, {{ui:Opnieuw}}, {{ui:Kopiëren}}, {{ui:Plakken}}, {{ui:Meer}} | Meetpunten ongedaan maken, opnieuw doen, kopiëren en plakken; {{ui:Meer}} bevat Knippen, Plakken op dezelfde plaats, Dupliceren, Verwijderen, Alle punten selecteren en Selectie opheffen |
| GIS | {{ui:Coördinaten}}, {{ui:Importeren}}, {{ui:Exporteren}}, {{ui:Kaart}} | Het coördinatenstelsel instellen, GIS-bestanden importeren en exporteren, kaartlagen onder het plan tonen |
| Weergave | {{ui:Selecteren}}, {{ui:Passend maken}}, {{ui:3D}} | Dingen kiezen en verplaatsen; zoomen om alles te tonen; het terrein in 3D tonen ([Het terrein in 3D bekijken](topic:site-3d)) |

Een tekengereedschap blijft ingedrukt zolang het actief is. Er nogmaals op klikken, op {{key:Esc}} drukken of op {{key:V}} drukken brengt u terug naar {{ui:Selecteren}}. {{ui:Ongedaan maken}}, {{ui:Opnieuw}}, {{ui:Kopiëren}} en de items in {{ui:Meer}} zijn grijs als ze niets kunnen doen; de tooltip zegt waarom (bijvoorbeeld "Selecteer eerst meetpunten"). Elke knop staat in de [Werkbalkreferentie](topic:toolbar).

In een smal venster scrolt de werkbalk zijwaarts.

## Linkerpaneel

### Terrein

- **Naam**: de projectnaam. Hij geeft de naam aan elk bestand dat u opslaat of exporteert en staat in de titelstrook van de pdf.
- **Eenheden**: {{ui:US feet}} of {{ui:Meter}}. Dit zegt wat de getallen betekenen. Het wijzigen ervan converteert de coördinaten **niet**; zie [Eenheden, stationering en getalformaten](topic:units-and-stations).

### Punten

Leeg zegt het hoe u een puntenbestand opent. Met punten toont het de bestandsnaam, het aantal punten en hoeveel een hoogte hebben, en daarna een tabel met **puntengroepen**: één rij per eerste woord van de beschrijving (GRD, FL, TBS …), met een aantal en een keuze voor **Oppervlak**:

- {{ui:Punten}}: de punten gaan in het oppervlak (de standaard voor elke groep).
- {{ui:Breeklijn}}: de punten van de groep worden, in puntnummervolgorde, tot één breeklijn verbonden.
- {{ui:Weggelaten}}: de groep raakt het oppervlak niet.

### Oppervlak

Feiten over het bestaande maaiveld: punten, driehoeken, laagste en hoogste hoogte, gemiddelde hoogte, 2D- en 3D-oppervlakte, breeklijnen en of er een begrenzing is. Onder de feiten somt een vak alles op wat de oppervlaktebouwer moest herstellen of niet kon. Daarna:

- **Langste buitenrand**: 0 behoudt elke buitendriehoek; een getal snijdt lange, dunne driehoeken van de buitenkant af.
- Koppelingen die verschijnen als ze van toepassing zijn: {{ui:De begrenzing verwijderen}}, {{ui:Getekende breeklijnen verwijderen}} en, voor een oppervlak dat uit LandXML is gelezen, {{ui:Het oppervlak opnieuw bouwen uit de punten}}.

### Weergave

- **Oppervlak**: {{ui:Bestaand terrein}} of {{ui:Voorgesteld (afgewerkt)}}. Het tweede is beschikbaar zodra een plateau of corridor zonder problemen afgraaft.
- **Hoogtelijnen elke**, **Hoofdlijn elke** en **Banden** (het aantal kleurbanden).
- Selectievakjes: {{ui:Hoogtelijnen}}, {{ui:Hoogtelijnlabels}}, {{ui:Driehoeken}}, {{ui:Hoogtebanden}}, {{ui:Hellingpijlen}}, {{ui:Punten}}, {{ui:Puntlabels}}, {{ui:Breeklijnen}}, {{ui:Rand van het oppervlak}}, {{ui:Leidingen}}.
- Een legenda van bandhoogtes verschijnt als banden aanstaan.

Weergave-instellingen worden met het project opgeslagen maar zijn geen stappen voor ongedaan maken: {{key:Mod+Z}} zet nooit een selectievakje terug.

## Plan

Het plan toont de punten, het oppervlak en alles wat u ontwerpt, in plattegrond met het noorden boven. Met het wiel zoomt u op de aanwijzer, met slepen op lege ruimte verschuift u. De volledige lijst staat in [Toetsen en muis](topic:keyboard).

- Op een leeg project somt een vak met de titel **Begin met meetpunten** de eerste stappen op en biedt {{ui:Het voorbeeldterrein openen}} aan.
- Terwijl een tekengereedschap actief is, zegt een hint bovenaan het plan waarop u moet klikken en hoe u afrondt.
- Een bestand over het plan slepen toont "Zet een puntenbestand, LandXML of project neer".
- Geselecteerde dingen worden gemarkeerd. Een geselecteerd tracé of plateau toont vierkante grips op zijn PI's of hoeken; een geselecteerd kunstwerk toont één grip. Sleep een grip om te verplaatsen.
- Geselecteerde meetpunten hebben een ring. {{key:Shift}} en een klik voegt een punt toe of verwijdert het; {{key:Shift}} en slepen tekent een vak (of, rond ze gesleept, een lasso) dat de punten erbinnen toevoegt. Zie [Meetpunten selecteren, kopiëren en plakken](topic:copy-paste-points).

## Profielweergave

Druk op {{key:R}} of klik op {{ui:Profiel}} om hem onder het plan te openen. De balk heeft:

- een tracélijst (beschikbaar als er twee of meer tracés zijn)
- {{ui:PVI's toevoegen}}: zolang de knop is ingedrukt, voegt een klik in het profiel een PVI toe ({{key:I}} schakelt hem om)
- een uitlezing van station, maaiveld, ontwerphoogte, helling en ontgraving of ophoging onder de aanwijzer
- een sluitknop

Het profiel toont het bestaande maaiveld, het ontwerpprofiel, hellingen op elke raaklijn, het station en de hoogte van elke PVI, de L en K van elke verticale boog met zijn BVC en EVC, hoge en lage punten en de verticale overdrijving. Het past altijd het hele tracé: het zoomt of verschuift niet. Beweegt u de aanwijzer erlangs, dan komt er een stip op het tracé in het plan.

## Rechterpaneel: Eigenschappen

De kop zegt wat het toont.

- **Project** (niets geselecteerd): de tracés en plateaus als koppelingen, het blok **Grondverzet** en het blok **Leidingnet** met zijn regels en problemen.
- **Tracé**: naam, beginstation, lengte, de PI-tabel, de bogen, de PVI-tabel en feiten van het ontwerpprofiel, en de instellingen van **Corridor**.
- **Plateau**: naam, hoogte, ontgravings- en ophogingstaluds, oppervlakte, feiten over de dagzoom en grondverzet.
- **Kunstwerk** of **Leiding**: maten, randen, inverts, helling, dekking en eventuele problemen.
- **Punt** en zijn nummer: de coördinaten, hoogte, beschrijving en groep van het punt (alleen-lezen).

Velden werken door als u op {{key:Enter}} drukt of het veld verlaat. Een waarde die niet wordt geaccepteerd, wordt als ongeldig gemarkeerd en er verandert niets.

## Statusbalk

- **E** en **N**: oostwaarde en noordwaarde onder de aanwijzer.
- **Maaiveld**hoogte daar (en **Afgewerkt** waar een plateau of corridor haar wijzigde), of "Buiten het oppervlak".
- Het dichtstbijzijnde tracé (of het geselecteerde) met het **Sta** en de offset (**L** of **R**) onder de aanwijzer.
- Rechts berichten: wat er net gebeurde, of waarom iets werd geweigerd. Een bericht verdwijnt na een paar seconden vanzelf.

## Dialoogvensters

- **Punten importeren**: opent bij elk puntenbestand. Zie [Meetpunten importeren](topic:import-points).
- **Het plan plotten naar PDF**: zie [Het plan plotten naar PDF](topic:plot-pdf).
- **Niet-opgeslagen wijzigingen**: vraagt het voordat {{ui:Nieuw}} of het openen van een project of LandXML-bestand niet-opgeslagen werk weggooit. {{ui:Een kopie opslaan}} downloadt eerst het project.

## Kleine schermen

Tot 760 pixels breed, zoals op een telefoon, houdt het plan het scherm: de werkbalk is één rij die zijwaarts scrolt, en de panelen openen als bladen vanuit een balk onderaan. {{ui:Gereedschappen}} verbergt de werkbalk en {{ui:Verplaatsen}} zet hem onderaan.
