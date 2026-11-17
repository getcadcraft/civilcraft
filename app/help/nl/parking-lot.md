---
title: Indeling parkeerterrein
summary: Vakken, rijbanen, toegankelijke en bestelbusplaatsen en eilanden binnen een omtrek indelen, het terrein aanleggen met hellingen naar afvoeren ten opzichte van het bestaande terrein, en daarna verharden en beplanten. Ook beschikbaar voor een assistent.
keywords: parkeren, parkeerterrein, vak, rijbaan, toegankelijk, ada, bestelbus, eiland, afvoer, helling, afgraven, ophogen, verharding, bestrating, beplanting, bomen, terrein, puntenwolk, mcp, assistent
from: 06c14da9
---

Pas een parkeerterrein in een perceel, een plateau of een gesloten elementlijn, en krijg de aantallen, het terreinontwerp en de verharding in één stap.

## Indelen

1. Selecteer een perceel, een plateau of een gesloten elementlijn op het plan.
2. Open **Terrein, Meer, Parkeerterrein...**
3. Kies de regels, de vakhoek (90, 75, 60, 45, 30 graden of parallel) en eenrichtings- of tweerichtingsrijbanen. De afmetingen van vakken, rijbanen en eilanden beginnen bij de tabel, en elk kan worden overschreven.
4. Kies **Indelen**.

De rijen lopen langs de rand van de omtrek die de meeste vakken oplevert (of onder de hoek die u invoert). Een vak telt alleen mee als het volledig binnen de omtrek ligt. Waar ruimte overblijft voor één rij en een rijbaan, wordt een enkelzijdige strook toegevoegd. Het dialoogvenster toont ruimten, toegankelijke en bestelbusplaatsen, eilanden, afvoeren en het oppervlak per ruimte. Het plan toont vakken, toegankelijke ruimten met hun gearceerde toegangsrijbanen, eilanden, rijbaan-hartlijnen en afvoeren op eigen lagen (C-PARK-...), zodat ze in PDF, DXF en DWG terechtkomen.

## Toegankelijke ruimten

Met de Amerikaanse regels volgt het aantal de tabel 208.2 van de 2010 ADA Standards voor de aangeboden ruimten (één op zes, naar boven afgerond, is een bestelbusplaats). Ze worden geplaatst het dichtst bij het eerste hoekpunt van de omtrek (de ingang), elk met een toegangsrijbaan; twee delen er één. Een vak smaller dan de toegankelijke breedte, of een helling steiler dan 1:48 op toegankelijke ruimten, wordt als probleem getoond. **Deze getallen zijn uit de norm overgenomen zoals ze uit het geheugen zijn genoteerd en niet gecontroleerd tegen de gedrukte norm.** Gebruikelijke vak- en rijbaanafmetingen komen uit parkeerontwerprichtlijnen en zijn evenzo niet gecontroleerd. Controleer beide, en uw lokale bouwregelgeving, voordat u erop vertrouwt. Kies **Aangepast** om uw eigen aantal toegankelijke plaatsen in te voeren.

## Hellingen naar afvoeren, ontgraving en ophoging

Tenzij u het uitschakelt, wordt het terrein een aanlegvlak in de werkomgeving Landschap. Afvoeren worden op de rijbaan-hartlijnen geplaatst, ongeveer elke 100 ft (30 m). Het oppervlak stijgt vanaf elke afvoer met de helling die u opgeeft (eerst 1.5 procent), zodat elk punt naar de dichtstbijzijnde afvoer afloopt. Het niveau wordt zo gekozen dat ontgraving en ophoging van het terrein in evenwicht zijn met het bestaande terrein. Het bestaande terrein is het bestaande oppervlak van het project. Dat kan komen van meetpunten, LandXML, een lidar- of scanpuntenwolk die in een oppervlak is omgezet, of hoogtelijnen. Het dialoogvenster toont de raming van ontgraving en ophoging; de volumes van het project tonen daarna het exacte cijfer. Het aanlegvlak houdt zijn rand op het bestaande terrein. Waar het nieuwe oppervlak bij de rand afwijkt van het terrein, krijgt u dus een trede, en het dialoogvenster zegt hoe groot die is.

## Verharding en beplanting

De hele omtrek krijgt een tegelverharding (een halfsteens verband dat u kunt wijzigen onder Landschap, Verharding). Elk eiland krijgt een heesterbed en, als het breed genoeg is, een boom, uit de plantenlijst. Daarna is alles een gewoon Landschap-object: bewerk het, of kies **Opnieuw indelen** om te vervangen wat het terrein maakte. Het verwijderen van het terrein verwijdert wat het maakte.

## Van een assistent

Hetzelfde terrein kan via MCP worden opgevraagd: `parking_layout` geeft een voorbeeld, `parking_build` schrijft het, en `parking_remove` verwijdert het terrein. Vraag op perceelnaam of stuur de omtrek.

## Wat niet is gedaan

Of de rijbanen op een straat aansluiten, wordt niet gecontroleerd. Verharding dekt de hele omtrek, dus het oppervlak omvat de eilanden. Verhardingsmaterialen uit de bibliotheek en een bibliotheektype voor vakken zijn nog niet beschikbaar; het verhardingspatroon is dat van Verharding. Er zijn nog geen regels van andere landen beschikbaar.
