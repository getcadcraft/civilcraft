---
title: Een bovengrondse lijn tekenen
summary: Plaats masten op het plan, laat CivilCraft de rol van elke mast en de vakken tussen de eindmasten bepalen, en verplaats masten op het plan of op het lijnprofiel.
keywords: bovengrondse lijn, mast, paal, overspanning, vak, eindmast, hoekmast, hangmast, profiel, hoogte, dwarsarm, trekkabel, spanmast
from: b8e5e272
---

## De lijn tekenen

1. Zorg voor een oppervlak: het maaiveld onder de lijn komt daaruit ([Een oppervlak bouwen](topic:build-surface)). Een mast zonder maaiveld eronder wordt vermeld onder **Controles**; typ in plaats daarvan zijn **Maaiveldhoogte** in de Eigenschappen.
2. Klik op {{ui:Lijn}} in de groep Hoogspanningslijnen en klik op elke mast op het plan.
3. Dubbelklik op de laatste, of druk op Enter.

De lijn krijgt de geleider, mast en uitrusting die u als laatst op deze computer gebruikte (de eerste keer: voorbeelden uit de bibliotheek). Wijzig ze in de Eigenschappen.

## De lijn in de Eigenschappen

Selecteer de lijn (klik op een overspanning) om zijn **Geleider**, **Geleiders per circuit**, **Circuits**, **Spanning**, de **Vrije-afstandsregel** die hij boven de grond moet houden, en de uitrusting **Op elke mast** (een dwarsarm, isolatoren, bevestigingen) in te stellen. De tabel toont zijn **secties** met bij elk de maatgevende overspanning, de dagelijkse spanning en het belastinggeval dat geldt.

## Masten

Klik op een mast om hem te selecteren. In de Eigenschappen:

- **Mast**: het bibliotheekitem. Wanneer hij te zwak is, plaatst {{ui:Gebruik …}} de kleinste mast van hetzelfde materiaal in uw bibliotheek die de belasting draagt.
- **Rol**: Automatisch, Hangmast, Hoek of Eindmast. Automatisch betekent: de eerste en laatste masten zijn eindmasten; een bocht boven de hoek van de regelset maakt een hoekmast; een grotere bocht een eindmast.
- **Hoogte boven de grond**: leeg laat die over van het bibliotheekitem (zijn lengte min de diepte in de grond).
- **Ook op deze mast**: extra uitrusting, zoals een **trekkabel** (spanmast). Een mast met trekkabel geeft de trek van de lijn door aan zijn trekkabel.
- **Bestaande mast**: hij wordt net als de andere gecontroleerd, maar niet meegeteld in de hoeveelheden.

{{ui:Mast}} voegt een mast toe op de overspanning die het dichtst bij uw klik ligt. Sleep een mast op het plan om hem te verplaatsen. Delete verwijdert hem (een lijn houdt er minstens twee).

Secties lopen tussen eindmasten: binnen een sectie loopt de geleider vrij door de hangklemmen, zodat één spanning voor de hele sectie geldt.

## Het lijnprofiel

Klik op {{ui:Profiel}} (of op **Profiel** in de Eigenschappen van de lijn). Het paneel onder het plan toont het maaiveld langs de lijn, elke mast van het maaiveld tot zijn top, de laagste fase van de geleider bij het **Belastinggeval** dat u kiest, en de vrije afstand die de lijn moet houden als gestreepte lijn. Een overspanning die niet voldoet is rood; het getal onder elke overspanning is de laagste vrije afstand.

- **Lijn** kiest de bovengrondse lijn die u toont. Wanneer u op het plan een andere lijn of een van zijn masten selecteert, schakelt het profiel naar die lijn.
- Beweeg de aanwijzer over het profiel: een hulplijn volgt hem, en het label toont de afstand langs de lijn, het maaiveld, de geleider en de vrije afstand daar (en zegt wanneer de vrije afstand onder de regel van de lijn ligt).
- {{ui:Meten}} in de balk van het profiel: klik twee punten aan om de horizontale afstand, het hoogteverschil, de rechte afstand en de helling ertussen te krijgen. Een klik nabij het maaiveld, de geleider of de top van een mast snapt daarnaar. Klik nogmaals op {{ui:Meten}} om te stoppen.
- Obstakels die de lijn kruist staan op van het maaiveld: getekende als balken, planten van het landschap als hun kroon, muren als balken (zie [Controles van hoogspanningslijnen](topic:power-line-checks#clearances)). Kabeltrajecten en leidingen die de lijn kruist, worden onder het maaiveld aan hun bovenkant gemarkeerd, met hun naam.

- Sleep een mast zijwaarts om hem langs de lijn te verplaatsen.
- Sleep zijn top omhoog of omlaag om zijn hoogte boven het maaiveld in te stellen.
