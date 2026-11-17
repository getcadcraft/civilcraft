---
title: LandXML uitwisselen
summary: LandXML van andere civiele software openen als nieuw project, punten, oppervlakken, tracés, profielen en het leidingnetwerk exporteren als LandXML 1.2, en weten wat niet meegaat.
keywords: landxml, xml, importeren, exporteren, uitwisseling, tin, terrein, tracé, profiel, leidingnetwerk, interoperabiliteit, gegevensuitwisseling
from: 870d5ece
---

LandXML is het open uitwisselingsformaat dat de meeste civiele programma's lezen en schrijven. CivilCraft leest en schrijft LandXML 1.2. Als u Civil 3D hebt gebruikt, komen de dialogen voor LandXML-import en -export daar het dichtst bij in de buurt; hier zijn geen keuzes te maken, en de opmerkingen vertellen wat er is weggelaten.

## Een LandXML-bestand openen

1. Klik op {{ui:Openen}} (of druk op {{key:Mod+O}}) en kies het `.xml`- of `.landxml`-bestand, of zet het op het plan.
2. Als het huidige project niet-opgeslagen wijzigingen heeft, vraagt CivilCraft eerst. Kies {{ui:Een kopie opslaan}}, {{ui:Niet opslaan}} of {{ui:Annuleren}}.
3. Er wordt een **nieuw project** gemaakt. De statusbalk zegt wat er is gelezen, bijvoorbeeld "site.xml geopend: 412 punten, 2 oppervlakken, 3 tracés."
4. Kijk in het vak onder de gegevens van het **Oppervlak**. Daarin staat alles wat is overgeslagen of gewijzigd, bijvoorbeeld:
   - "Alleen het eerste oppervlak ("EG") is geopend; het bestand heeft er nog 1."
   - "Tracé "Ramp A" heeft elementen die CivilCraft nog niet kan tekenen (geen lijnen, bogen of klothoïdespiralen); het is overgeslagen."
   - "Regels voor het leidingnetwerk stonden niet in het bestand; de tijdelijke waarden worden gebruikt; stel de uwe in onder Project."

Wat wordt wat:

| In het bestand | In CivilCraft |
|---|---|
| Units (Imperial of Metric) | De **Eenheden** van het project (voet of meter) |
| Projectnaam | De **Naam** van het project |
| CgPoints | De punten van het project; de beschrijving (of code) geeft de groep |
| Het eerste TIN-oppervlak | Het bestaande maaiveld, ongewijzigd gebruikt ("Oppervlak (uit LandXML)") |
| Elk tracé van lijnen, bogen en klothoïdespiralen | Een tracé met zijn PI's, stralen en spiraallengtes, opnieuw opgebouwd uit de bogen |
| Het eerste ontwerpprofiel van elk tracé | Het ontwerpprofiel, met parabolische verticale bogen |
| Het eerste leidingnetwerk | Het leidingnetwerk, met zijn bovenranden, zinkputten en invertniveaus |
| Planelementen van lijnen en bogen | Elementlijnen, bogen behouden; uit een ander programma beginnen ze als **Alleen getekend** |

De volledige lijst van elementen en attributen staat in [LandXML: wat wordt gelezen en geschreven](topic:landxml-reference).

:::note
Een oppervlak dat uit LandXML is gelezen, wordt niet opnieuw opgebouwd wanneer u puntgroepen wijzigt of breeklijnen tekent. Klik op {{ui:Het oppervlak opnieuw bouwen uit de punten}} in de sectie **Oppervlak** om het uit de punten te bouwen ({{key:Mod+Z}} brengt het LandXML-oppervlak terug).
:::

## LandXML exporteren

1. Klik op {{ui:LandXML}} in de groep **Exporteren**.
2. De browser downloadt `<naam>.xml`. De statusbalk zegt wat erin is gegaan, bijvoorbeeld "LandXML 1.2 geëxporteerd: 276 punten, 2 oppervlakken, 1 tracé, het leidingnetwerk. Plateaus horen hier niet bij LandXML; het aangepaste oppervlak wel."

Het bestand bevat:

- **Units**: US survey feet of meter.
- **CgPoints**: elk punt met zijn nummer als naam, zijn beschrijving en zijn groep als code.
- **Surfaces**: het bestaande maaiveld als TIN, met zijn breeklijnen en buitenste begrenzing als brongegevens; en, wanneer plateaus of corridors het maaiveld aanpassen, een tweede TIN-oppervlak genaamd "Proposed".
- **Alignments**: lijnen, bogen en klothoïdespiralen met hun stations, elk met een profiel dat het bestaande maaiveld langs het tracé bevat en het ontwerpprofiel (PVI's en parabolische bogen) wanneer het ten minste twee PVI's heeft.
- **PipeNetworks**: constructies met hun bovenranden, zinkputten en invert per leiding, en de leidingen met diameter, lengte en helling.
- **PlanFeatures**: elke elementlijn als lijnen en bogen met de hoogte aan elk einde, en waarvoor hij wordt gebruikt.

## Wat niet meegaat

- Plateaus en corridors als objecten. Hun resultaat staat in het oppervlak "Proposed".
- Tracés met fouten (bijvoorbeeld overlappende bogen): weggelaten en geteld in de statusmelding.
- Leidingen zonder beide invertniveaus, en netwerken met minder dan twee constructies.
- Een bovenrand die uit het oppervlak is genomen, wordt als vaste bovenrand geschreven. Opnieuw geopend houdt de constructie dat getal, ook als het oppervlak verandert.
- Netwerkregels (kleinste helling, dekking, verval): LandXML heeft er geen plek voor.
- Weergave-instellingen en de oppervlakkeuzes van puntgroepen: sla daarvoor een CivilCraft-project op.

Bij het openen leest CivilCraft geen andere spiralen dan klothoïde, geen rasteroppervlakken, geen punten die alleen naar andere punten verwijzen, geen percelen, geen spiralen in planelementen, geen wegen en geen opmetingsgegevens. Elk daarvan wordt in de opmerkingen genoemd, nooit geraden.

## Heen en terug

Om werk aan iemand te geven die andere civiele software gebruikt en het terug te krijgen, exporteert u LandXML, laat hij het bewerken, en opent u zijn LandXML als nieuw project. Bewaar ook uw eigen `.civilcraft.json`: dat is het enige bestand dat alles bewaart wat CivilCraft weet.
