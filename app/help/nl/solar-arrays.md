---
title: Zonnepanelenvelden op de grond leggen
summary: Plaats op de grond gemonteerde zonnetafels binnen een perceel of plateau, met de rijen op afstand van elkaar voor de grond waarop elke rij werkelijk staat, steile grond leeg gelaten, de jaarenergie berekend en de tafels getoond op het plan en in 3D.
keywords: zonnepanelen, pv, fotovoltaïsch, opstelling, grondmontage, tafels, rijen, rijafstand, schaduw, terrein, helling, palen, opbrengst, kWp, energie, horizon
from: 95593fd6
---

## Wat u leert

Hoe u een veld met zonnetafels legt op een terrein dat niet vlak is, en wat de getallen betekenen. Open het via Terrein › {{ui:Meer}} › Zonnepanelenvelden.

## De tafels indelen

1. Kies **Waar**: een perceel of een plateau van het project, of typ de hoekpunten van een gebied. Vink de plateaus of percelen aan die **leeg** moeten blijven (een gebouw, een vijver).
2. Typ de **breedtegraad en lengtegraad** van de locatie. De zon hangt ervan af; er wordt niets geraden. Heeft het project een coördinatenstelsel, dan vult **Plaatsen vanuit het coördinatenstelsel** ze in.
3. Stel de kanteling, de oriëntatie (leeg betekent naar de evenaar), het aantal modules per tafel en het vermogen en formaat van de module in. De modulewaarden beginnen als algemene waarden en zijn zo gemarkeerd; typ uw eigen waarden in.
4. Druk op **Tafels indelen**. Het venster geeft het aantal tafels en modules, het formaat in kWp en de afstand van rij tot rij.

Elke tafel is een kolom in het gebied, geplaatst vanaf de voorkant en naar achteren doorgelopen. Een tafel wordt alleen geplaatst waar de grond eronder binnen de maximale helling ligt, binnen het gebied en de afstand tot de bouwgrens, en waar de palen die nodig zijn niet hoger zijn dan de grens die u instelt. Plaatsen die niet voldoen blijven leeg, en het venster meldt hoeveel het er zijn en waarom.

## Rijen afgestemd op de grond

Op vlakke grond staan de rijen op de gebruikelijke afstand volgens de regel voor schaduwvrije afstand: de schaduw van een rij op het middaguur met de winterzonnewende mag de onderrand van de rij erachter niet bereiken. Op een helling past CivilCraft dezelfde regel toe op de grond waarop de volgende rij werkelijk staat. Waar de grond achter een tafel stijgt, kunnen de rijen dichter bij elkaar staan; waar hij daalt, staan ze verder uit elkaar. Het venster toont de kleinste, de grootste en de gemiddelde afstand naast de afstand op vlakke grond, zodat u ziet wat het terrein heeft gedaan.

Het vlak van een tafel wordt op palen opgehoogd totdat elk meetpunt eronder minstens de ingestelde vrije ruimte boven de grond ligt. De hoogste paal wordt in het resultaat getoond.

## De jaarenergie

**Jaarenergie** berekent het licht op het gekantelde vlak voor een representatieve dag per maand, de celtemperatuur, de ingevoerde verliezen, de tafels die elkaar beschaduwen en de heuvels aan de horizon die de zon die zij verbergen uit de berekening halen. De lucht is helder, dus het antwoord is een bovengrens; echt weer geeft minder. Het is een schatting in een vroeg ontwerpstadium, geen opbrengstrapport.

## Bewaren

Met **Opslaan in het project** blijven de invoer en de getallen in het projectbestand bewaard; de tafels worden bij het openen van het bestand opnieuw uit de grond berekend, zodat een gewijzigd oppervlak ze verplaatst. Ze worden getoond op het plan en in 3D (Weergeven › Zonnepanelenvelden). De tabellijst wordt als CSV gedownload. Eén stap ongedaan maken verwijdert of herstelt een veld.

## Nog niet beschikbaar

Weergegevens in plaats van de heldere lucht, tafels die de grond in oost-westrichting volgen, trackers, en het elektrisch ontwerp (strings, kabel, omvormers) in CivilCraft. Het paneel Solar PV van BimCraft heeft strings en het eenlijnschema voor daken.
