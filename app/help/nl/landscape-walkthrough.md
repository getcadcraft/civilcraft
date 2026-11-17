---
title: Een tuin ontwerpen, van begin tot eind
summary: De tien stappen van de landschapsarchitect, van de opmeting tot de gepubliceerde publicatieset, met wat de werkomgeving Landschap voor elke stap nu doet en wat ze nog niet doet.
keywords: zelfstudie, stap-voor-stap-gids, hoe, landschapsontwerp, tuinontwerp, aan de slag, voorbeeld, voorbeeldterrein, stap voor stap, opmeting, lijnwerk, terrein, beplanting, staat, bladen, publiceren, één project
from: 87900bf5
---

Een landschapsontwerp gaat in een kring: opmeting, schets, lijnwerk, maaiveld, gebieden, niveaus, beplanting, staten, bladen, en weer terug. Dit zijn de tien stappen, met wat er voor elke stap is. Waar een stap een gat heeft, wordt dat onder **Nog niet beschikbaar** aan het eind genoemd en niet verborgen in de stap.

U kunt meelopen op het voorbeeldterrein, of op uw eigen opmetingstekening. Bij uw eigen tekening begint u bij stap 1.

## 1. De opmeting binnenhalen

{{ui:Oppervlak}} › {{ui:Lijnwerk uit een tekening…}}, kies de opmetingstekening (DWG 2000–2018 of DXF). Controleer de eenheden, neem de hoogtelijnen, 3D-polylijnen en de grens voor het oppervlak, en de puntblokken als opmetpunten. De sectie **Opmetniveaus en controle** leest niveaus die als tekst of als attribuut zijn geschreven en somt op wat verdacht lijkt (eenheden, coördinatenstelsel, afstand tot nul, vlakke hoogtelijnen, rare niveaus, dubbele punten) voordat u iets toevoegt. Zie [Een opmetingstekening controleren bij importeren](topic:survey-check) en [Een DWG of DXF openen als lijnwerk](topic:open-dwg-dxf). Stel het coördinatenstelsel in met {{ui:Coördinatenstelsel…}}.

## 2. Handschetsen

Een blad op papier, zoals een oude opmeting of een gemarkeerde print, komt binnen met {{ui:Scannen…}} (Starten vanuit een scan): het wordt op schaal of op bekende coördinaten onder het plan geplaatst en kan worden overgetekend als lijnwerk. ModelCraft leest een foto van een handschets (Bestand › Een schetsfoto importeren…). CivilCraft zelf heeft geen hulpmiddel voor een handschets: plaats het blad onder het plan en teken eroverheen.

## 3. Van schets naar lijnwerk

Teken elementlijnen en contouren over de opmeting in CivilCraft, of teken ze in de 2D-tekening. Landschap › Meer › {{ui:Vanuit een lijn}} maakt van een lijn verharding, een beplant gebied, een muur, trappen, een elementlijn en meer, gekoppeld gehouden: verplaatst u de lijn, dan volgt het object. Zie [Objecten vanuit lijnwerk](topic:objects-from-lines). In SuperCad Studio opent u het terrein, de tekening en het gebouwmodel in één project: de werkomgeving **Landschap** heeft de hulpmiddelen van alle drie, en een lijn die in de 2D-tekening is aangewezen kan een landschapsobject worden dat hem volgt (Ctrl+K, {{ui:Landschapsobject uit de aangewezen tekeningslijn}}).

## 4. Het ontwerpmaaiveld

Open {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Werkomgeving Landschap}}. Bouw het ontwerpmaaiveld met {{ui:Plateau}}, {{ui:Berm}}, {{ui:Wadi}} en grading-gebieden met hoogtepunten en hoogtelijnen; de verharding, paden, muren, hellingbanen en trappen die u toevoegt, leggen zich in hetzelfde ontwerpoppervlak. Het bestaande maaiveld verandert nooit. {{ui:Niveaus}} › {{ui:Maaiveldaanpassingen…}} somt alles op wat het maaiveld vormt, in één volgorde, met afgraving en ophoging voor elk. Zie [Grading](topic:landscape-grading) en [Maaiveldaanpassingen en live niveaus](topic:ground-modifiers).

## 5. Bestrating en beplante gebieden

{{ui:Verharding}} › {{ui:Bestrating}}, {{ui:Pad}}, {{ui:Muur}}, {{ui:Stoeprand}}, {{ui:Hellingbaan}} en {{ui:Trap}}. {{ui:Gebieden}} tekent een gazon, vak, weide of grondbedekker met zijn opbouw; het snijdt zichzelf bij de bestrating, muren en trappen bij. {{ui:Vak}} vult een gebied op de plantafstand, uit een mengsel van planten. Zie [Verharding](topic:hardscape), [Beplante gebieden](topic:planted-areas) en [Beplanting](topic:planting).

## 6. Niveaus, hellingen en aansluitingen

Vink onder **Grading-controles** **Hellingsanalyse** en **Stroompijlen en waterplassen** aan. Als water tegen een terras blijft staan, voeg dan een {{ui:Wadi}} eromheen toe. Eigenschappen vertellen u hoeveel optreden de trappen nodig hebben en of ze passen, en waar een pad steiler is dan zijn grens. Het paneel Problemen somt op waar objecten slecht samenkomen: een muur die te hoog uitkomt, een vak boven de bestrating, trappen die hun bordes missen. {{ui:Hoogtepunt}} en {{ui:Hellingpijl}} benoemen het maaiveld en werken zichzelf bij.

## 7. Beplanting

Zoek in **Planten** in de plantenlijst (enkele honderden soorten, of uw eigen lijst), kies er een, en {{ui:Plant}}, {{ui:Vak}} of {{ui:Haag}}. Stel de maat en de labels van de plant in via Meer. Meer › {{ui:Plantentabel}} bewerkt uw eigen gegevens: cultivars, geleverde maten, dichtheid, specificatienotities. Elk gegeven kan uw eigen symbool en 3D-model dragen (OBJ, STL of GLB), en Meer › {{ui:Plantsymbolen}} tekent planten eenvoudiger bij grovere schalen. Zie [De plantenlijst](topic:plant-list), [Plantgegevens](topic:plant-records) en [Plantsymbolen](topic:plant-graphics).

## 8. Hoeveelheden en staten

Meer › {{ui:Werkbladen}}: de plant- en verhardingsstaten, en uw eigen staten, blijven gekoppeld aan de objecten; sla ze op als CSV of XLSX, of zet ze op de bladen (zie [Werkbladen](topic:worksheets)). Meer › {{ui:Plantenstaat…}} stuurt de aantallen naar TakeoffCraft. De verhardingshoeveelheden staan in de Eigenschappen van bestrating, muren en trappen. {{ui:Beregening}} heeft een eigen materiaallijst: {{ui:Beregening}} › **Systeem controleren…**. Zie [Beregening](topic:irrigation).

## 9. Tekeningen en bladen

Meer › {{ui:Landschapsbladen…}}: beplantings-, grading- en beregeningsplannen, met details. {{ui:Niveaus}} › {{ui:Doorsnedelijn}} tekent doorsneden door het maaiveld, muren, opbouw, trappen en planten. Zie [Landschapsbladen](topic:landscape-sheets) en [Doorsneden en de publicatieset](topic:landscape-sections).

## 10. Publiceren

{{ui:Publicatieset (.zip)}} in het dialoogvenster Bladen maakt één PDF met een bladenlijst en een DWG per blad. Meer › {{ui:Landschaps-IFC exporteren}} geeft BimCraft de planten en de verharding. Sla het project op: alles staat in het ene bestand.

## Eén ding wijzigen: de trap

Het idee achter alles in één project is dat een wijziging doorwerkt. Probeer het met een trap tussen twee terrassen:

1. Teken de lijn van de trap als elementlijn (of als lijn in de tekening), en kies dan Landschap › Meer › {{ui:Vanuit een lijn}} › {{ui:Trap}}. Vink in de Eigenschappen van de trap **Vormt het maaiveld** aan, en zet het onder- en bovenniveau op de twee terrassen.
2. Teken een beplant vak naast en onder de trap met {{ui:Gebieden}}, en bestrating op de terrassen. Het vak snijdt zichzelf bij de trap en de bestrating bij, en de plantenstaat telt alleen wat geplant is.
3. Verhoog het bovenniveau van de trap in Eigenschappen. Het ontwerpmaaiveld, de hoogtepunten, de hellingpijlen en de afgraving en ophoging veranderen meteen. Als de trap de bovenste terrasrand niet meer raakt, zegt het paneel Problemen met hoeveel.
4. Verplaats de lijn van de trap. De trap volgt zijn lijn in dezelfde ongedaan-te-maken-stap; het vak snijdt zich opnieuw bij en wordt opnieuw geteld, en de werkbladen en staten tonen de nieuwe getallen.
5. Druk één keer op Ctrl+Z: de lijn, de trap, het maaiveld en het vak gaan samen terug.

Zie [Maaiveldaanpassingen en live niveaus](topic:ground-modifiers), [Beplante gebieden](topic:planted-areas) en [Werkbladen](topic:worksheets).

## Nog niet beschikbaar

Dit is gevraagd en zit nog niet in deze versie:

- Muren die het maaiveld vormen (ze melden waar ze het raken, en hun bovenkant kan het volgen).
- Uw eigen plantenlijst in de bibliotheek bewerken in de app (bewerk de plantenlijst van het project en sla die op als plantenbestand).
- Texturen en kleuren van uw eigen GLB-plantmodellen (de vorm wordt gelezen; de kleur van de plant wordt gebruikt).

Zie [De werkomgeving Landschap](topic:landscape) voor elk hulpmiddel.
