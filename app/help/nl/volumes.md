---
title: Grondverzetvolumes
summary: Lees ontgraving, ophoging en nettovolumes tussen het bestaande maaiveld en het voorgestelde terrein, per plateau en corridor en in totaal, en begrijp de rastermethode erachter.
keywords: volumes, grondverzet, ontgraving, ophoging, netto, ontgraving en ophoging, hoeveelheden, rastermethode, terreinvergelijking, volumeterrein, kubieke yard, kubieke meter
from: 299d7bc7
---

Zodra een plateau of corridor zonder problemen kan worden afgewerkt, vergelijkt CivilCraft het voorgestelde terrein met het bestaande maaiveld en rapporteert ontgraving en ophoging. De getallen worden bijgewerkt bij elke wijziging.

## Waar u ze leest

- **Grondverzet** in het rechterpaneel wanneer niets is geselecteerd (de weergave **Project**), zodra er minstens één plateau of één corridor is.
- **Grondverzet** in het rechterpaneel wanneer een plateau is geselecteerd (dezelfde totalen voor het hele project).
- De regel onder de instellingen van een corridor, met de eigen ontgraving en ophoging van die corridor.

Het blok **Grondverzet** toont:

- **Ontgraving**, **Ophoging** en **Netto** (met "ophoging" of "ontgraving" erachter, welke het grootst is)
- een regel per item wanneer er meer dan één is, bijvoorbeeld "Plateau 1: ontgraving 120.4 yd³, ophoging 310.2 yd³"
- de methoderegel: "Rastermethode: bestaand maaiveld en het afgewerkte terrein bemonsterd elke 0.5 ft binnen de ontgravingslijnen (92,891 cellen). Geen zwel- of krimpfactor toegepast."

Volumes zijn in kubieke yard in een feetproject en in kubieke meter in een meterproject.

## Naar TakeoffCraft sturen

Om het grondverzet te prijzen, kiest u {{ui:Naar TakeoffCraft sturen}} onderaan het blok **Grondverzet**. CivilCraft slaat een hoeveelhedenbestand op (`<site>.quantities.json`) met twee hoeveelheden: ontgraving en ophoging, in kubieke yard (feetproject) of kubieke meter (meterproject), dezelfde getallen als in het blok, tot op de honderdste. Open het in TakeoffCraft met **Opmeting openen**, of sleep het daarheen: ze worden twee items die u kunt prijzen ([Ontgraving en ophoging uit CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Stuur opnieuw na een wijziging en open het nieuwe bestand: dezelfde items krijgen de nieuwe getallen.

Alleen de totalen worden verstuurd, zodat niets dubbel wordt geteld; de notitie van het bestand somt de eigen ontgraving en ophoging van elk plateau en elke corridor op.

## Hoe ze worden berekend

CivilCraft gebruikt de **rastermethode**:

1. Een raster van vierkante cellen wordt gelegd over het gebied binnen elke ontgravingslijn.
2. In het midden van elke cel worden beide terreinen bemonsterd.
3. Elke cel telt als een prisma: het verschil in hoogte maal het oppervlak van de cel. Waar het voorgestelde terrein lager ligt, is het ontgraving; hoger, ophoging.
4. De cellen worden opgeteld.

De celgrootte wordt voor u gekozen zodat de rechthoek om de afgewerkte gebieden ongeveer 250,000 cellen bevat, afgerond op een nette waarde (1, 2 of 5 maal een macht van tien). U kunt dit zelf nog niet instellen. De methoderegel vertelt u de grootte en het aantal cellen. Kleinere cellen zijn nauwkeuriger langs de randen; bij hele cellen tussen vlakke vlakken is het resultaat exact.

## Let op

- Alleen het gebied binnen de ontgravingslijnen wordt geteld. Maaiveld daarbuiten blijft ongewijzigd.
- Een plateau of corridor met een probleem wordt niet ingewerkt en telt niet mee. Als het blok zegt "Nog geen volumes: een plateau moet zonder problemen kunnen worden afgewerkt.", zoek dan naar een rood vak erboven.
- Waar items overlappen, heeft het latere het eerdere binnen zijn ontgravingslijn vervangen, en de overlap wordt één keer geteld.
- Er wordt geen zwel- of krimpfactor toegepast. Vermenigvuldig de resultaten zelf als u volumes in losse, vaste of verdichte staat nodig heeft.
- Afgraven van teelaarde, dieptes van verharding en ondergrond, en TIN-naar-TIN-prismavolumes zijn nog niet beschikbaar.

## Een resultaat controleren

- Zet {{ui:Voorgesteld (afgewerkt)}} aan onder **Weergave** en bekijk de hoogtelijnen binnen de ontgravingslijnen.
- Beweeg de aanwijzer over het afgewerkte gebied: de statusbalk toont **Maaiveld** en **Afgewerkt**. Het verschil is de diepte van de ontgraving of ophoging op die plek.
- Voor een corridor toont de uitlezing van het profielbeeld de ontgraving of ophoging op de as bij elke stationering.
