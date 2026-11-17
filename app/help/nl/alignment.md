---
title: Een horizontaal tracé uitzetten
summary: Teken een tracé aan de hand van zijn PI's, stel boogstralen en het beginstation in, verplaats PI's, en lees de boogdata en de stationering en offset af.
keywords: tracé, geen oplossing, boog past niet, grootste straal, kleinste straal, minimumstraal, ontwerpsnelheid, overlap, as, pi, horizontale boog, straal, stationering, tangent, tracé aanmaken, tracé-indeling, pc, pt, stationering offset
from: 8c5df4aa
---

Een tracé in CivilCraft is een keten van tangenten door snijpunten (PI's), met bij elk tussenliggend PI dat een straal heeft een cirkelboog. Het krijgt een stationering vanaf een beginstation dat u kiest. Een project kan veel tracés bevatten.

## Het tracé tekenen

1. Druk op {{key:A}}, of klik op {{ui:Tracé}} in de groep **Ontwerp**.
   De hint luidt "Tracé: klik de PI's in volgorde. Enter of dubbelklik beëindigt, Backspace verwijdert de laatste, Esc annuleert."
2. Klik op het eerste PI (het begin van het tracé).
3. Klik op elk volgend PI, in volgorde. Een rode lijn volgt de aanwijzer en toont de lengte en richting van de tangent die u tekent, bijvoorbeeld "212.40 ft  N 63°12'05" E".
4. Klik op het laatste PI (het einde van het tracé).
5. Druk op {{key:Enter}}.
   Het tracé wordt getekend met stationering en is geselecteerd. In de statusbalk staat bijvoorbeeld "Tracé 1: 386.36 ft, bogen met straal 100 ft waar ze passen. Stralen wijzigen onder Eigenschappen; Profiel (R) om het verhang te ontwerpen."

Tijdens het tekenen verwijdert {{key:Backspace}} het laatste PI, annuleert {{key:Esc}}, en verschuift slepen op een lege plek het beeld zonder een PI toe te voegen.

:::warning
Beëindig met {{key:Enter}}. Dubbelklikken beëindigt ook, maar in deze versie vervalt het PI waarop u dubbelklikte. Klik het laatste PI eenmaal aan en druk daarna op {{key:Enter}}.
:::

Elk tussenliggend PI krijgt een boog van 100 ft (30 m in een project in meters), of de grootste hele straal die past in de helft van elke tangent als 100 ft niet past. Zeer scherpe of rechtdoorgaande PI's krijgen geen boog.

## Stralen en coördinaten instellen

Met het tracé geselecteerd toont het rechterpaneel **Tracé**:

1. **Naam** en **Beginstation**. Typ een station als `10+00` (ft) of `0+500` (m), of als een gewoon getal. Zie [Eenheden, stationeringen en getalnotaties](topic:units-and-stations).
2. **Lengte** en **Eindstation** worden voor u berekend.
3. De tabel **PI's** toont voor elk PI de **Easting** en **Northing**, en een **Straal** voor elk tussenliggend PI. Typ een nieuwe waarde en druk op {{key:Enter}}.
   - Een straal van 0 maakt een hoekpunt zonder boog.
   - Het eerste en het laatste PI hebben nooit een straal.
   - Het kleine x-je aan het einde van een rij verwijdert dat PI (een tracé houdt minstens twee PI's).
4. Lees de lijst **Bogen**: voor elke boog de stationeringen van PC en PT, straal R, deflectiehoek Δ en richting (links of rechts), lengte L, tangent T, externe afstand E en koorde.
5. De regel onder de bogen geeft de richting van de eerste tangent.

## Wanneer een boog niet past

Als bogen meer tangent nodig hebben dan er tussen hun PI's is, heeft het tracé geen oplossing: het wordt niet correct getekend totdat u het oplost, en het wordt uit LandXML-exports weggelaten. Een rood kader zegt in getallen waarom, en biedt aan wat wel past:

- "De bogen bij PI 2 en PI 3 hebben samen 240.00 ft tangent nodig (130.00 + 110.00), maar de PI's liggen 180.00 ft uit elkaar." — of, wanneer maar één van beide een boog heeft, "De boog bij PI 2 heeft 240.00 ft tangent nodig richting PI 1 …".
- Een knop voor elk PI zet **de grootste straal die past** daar, met de andere boog ongewijzigd (die moet ook passen bij de andere tangent van het PI). Als beide PI's een boog hebben, verkleint **Beide** de twee stralen in verhouding zodat ze precies samenkomen.
- Als één boog alleen al langer is dan de tangent, zegt het kader dat bij het andere PI geen boog past zolang die zo groot is.
- Een PI dat recht terugkeert kan geen boog krijgen; het kader biedt **Geen boog bij PI n** aan.

Elke knop is één stap: {{key:Mod+Z}} zet de stralen terug. Aangeboden stralen worden afgerond naar beneden op 0.01, zodat ze altijd passen.

### Een minimale ontwerpstraal

Typ een **Minimale ontwerpstraal** (bijvoorbeeld op basis van uw ontwerpsnelheid) om elke boog ertegen te laten controleren; laat het leeg voor geen controle. Een boog eronder wordt vermeld met een knop voor **de kleinste straal die aan het minimum voldoet**, wanneer die straal past. Past die niet, dan zegt het kader dat en geeft de grootste straal die de tangenten toestaan, zodat u weet dat u een PI moet verplaatsen of het minimum moet verlagen.

## PI's verplaatsen op het plan

1. Met {{ui:Selecteren}} actief klikt u op het tracé om het te selecteren. Vierkante grepen verschijnen bij de PI's.
2. Sleep een greep. Het tracé, de stationering, het profiel en de corridor volgen.
3. Laat los. De verplaatsing is één stap ongedaan te maken.

Een PI tussen twee bestaande toevoegen is nog niet beschikbaar: verwijder het tracé en teken het opnieuw, of typ nieuwe coördinaten voor de PI's die u heeft.

## Station en offset lezen

Beweeg de aanwijzer over het plan. De statusbalk toont het dichtstbijzijnde tracé (of het geselecteerde) met de stationering en de offset, **L** of **R** gezien in de richting van oplopend station, bijvoorbeeld "Tracé 1: Sta 2+15.30, offset 18.42 R". Voorbij een van beide uiteinden voegt het "(voorbij het einde)" toe.

## Wat wordt getekend

Op het plan, in DXF en in PDF: de as (tangenten als lijnen, bogen als echte bogen), een streepje elke 50 ft (20 m) met een langer streepje en een stationslabel elke 100 eenheden, en PC- en PT-streepjes met hun stationeringen.

## Een tracé verwijderen

Selecteer het en druk op {{key:Delete}}, of klik op {{ui:Verwijderen}} in de werkbalk of onderaan het rechterpaneel. Het profiel en de corridor gaan mee. {{key:Mod+Z}} haalt het terug.

:::mac
Op een Mac-toetsenbord verwijdert de toets met het opschrift **delete** niet de selectie maar werkt als {{key:Backspace}} in de browser. Druk op {{key:Delete}} (Fn en delete), of gebruik de knop {{ui:Verwijderen}}.
:::

## Volgende

- [Een verticaal profiel ontwerpen](topic:profile).

## Ontwerpsnelheid en klasse

Onder de Eigenschappen van het tracé worden **Ontwerpsnelheid** (km/h of mph) en **Ontwerpklasse** bewaard bij het tracé, opgeslagen in het project en weggeschreven naar IFC (Pset_RoadDesignCriteriaCommon). CivilCraft heeft geen tabel die een snelheid koppelt aan een minimumstraal, dus er wordt niets op gecontroleerd: stel **Minimumstraal** in op basis van uw eigen ontwerpnorm.

## Overgangsbogen

Een boog kan aan beide uiteinden een klothoïde-spiraal hebben: tangent, spiraal, boog, spiraal, tangent. Typ in de PI-tabel een lengte bij **Spiraal in** en **Spiraal uit** voor een PI dat een straal heeft. Het PI blijft waar het is; de boog schuift naar binnen om ruimte te maken, zodat de tangentafstand groeit met de offset van de spiraal. De twee lengten mogen verschillen, en een PI met maar één lengte krijgt alleen aan dat uiteinde een spiraal.

De lijst met bogen toont dan TS, SC, CS en ST (tangent naar spiraal, spiraal naar boog, boog naar spiraal, spiraal naar tangent) met de spiraalhoek θs, de tangentafstanden en de externe afstand. Stationeringen lopen langs de spiralen zoals overal. Spiralen die samen meer draaien dan de boog worden geweigerd, met het PI erbij genoemd; een spiraal die langer is dan de tangent toestaat is een overlap, zoals bij elke boog. Superelevatie gebruikt de spiraal als uitloop (zie [Corridor](topic:corridor)).
