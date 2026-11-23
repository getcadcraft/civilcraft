---
title: "WaterCraft: afnemers, brandweerdebiet, storingen en waterleeftijd"
summary: Met de add-on WaterCraft maakt u van klanten vragen op uw waterleidingen, controleert u het beschikbare debiet bij elke brandkraan, ziet u welke storing van een hoofdleiding het meeste schade doet, en volgt u waterleeftijd en chloor door een dag.
keywords: watercraft, waterdistributie, vragen, klanten, piekfactor, vraagpatroon, brandweerdebiet, brandkraan, restdruk, kritiekheid, storing, afsluitbaar vak, waterleeftijd, chloor, rest, brontrace, doodlopend, csv, add-on
from: 066fb17a
---

WaterCraft is een add-on die werkt op het waternetwerk dat u al tekende met de tools Waterleidingen. Hij voegt een tabblad toe aan het rechterpaneel met vier secties.

:::warning
Alleen een rekenhulp. Hij is gecontroleerd tegen handmatige antwoorden op verzonnen netwerken, niet op een echt model van een waterbedrijf. Een waterdeskundige moet elk resultaat controleren. Scenario's, regelregels, afsluiters en veldmetingen hebben hun eigen onderwerpen, "Scenario's" en "Studies", in de help van de add-on WaterCraft.
:::

## Wat u gaat doen

- Klanten als vragen op het netwerk zetten.
- De brandkranen vinden die minder debiet hebben dan u nodig hebt.
- De hoofdleidingen vinden waarvan de storing het zwaarst weegt.
- Oud water en laag chloor vinden.

## Stappen

1. Open {{ui:Instellingen}} › {{ui:Add-ons}} en zet {{ui:WaterCraft (waterdistributie)}} aan. Een tabblad {{ui:WaterCraft}} verschijnt in het rechterpaneel.
2. Teken eerst een reservoir, knooppunten en leidingen met de tools Waterleidingen (zie [Waterleidingen](topic:water-mains)). Zonder netwerk meldt het tabblad dat.
3. Plak onder {{ui:Vraag}} één klant per regel: id, x, y, soort, hoeveelheid. Kies de {{ui:Piekfactor}} en het {{ui:Uurpatroon}} (dagpatroon wonen, dagpatroon commercieel, vlak, of het patroon behouden zoals het is). Druk op {{ui:Controleren}} om te zien waar elke klant uitkomt (het dichtstbijzijnde knooppunt), en daarna op {{ui:In het netwerk zetten}}. Ongedaan maken haalt de vragen weer weg.
4. Stel onder {{ui:Brandweerdebiet}} het benodigde debiet en de restdruk in, kies of de restdruk wordt aangehouden {{ui:Alleen bij de brandkraan}} of {{ui:Overal in het systeem (strenger)}}, en druk op {{ui:Loop}}. Elke brandkraan staat in de lijst, het slechtst eerst, als voldoet of tekort.
5. Kies onder {{ui:Welke hoofdleiding het meest telt}} {{ui:één leiding tegelijk}} of {{ui:één afsluitbaar vak tegelijk}} en druk op {{ui:Loop}}. Elke storing toont de afgesneden vraag, de afgesneden knooppunten, de knooppunten die nieuw onder de minimumdruk komen en de laagste druk die overblijft.
6. Kies onder {{ui:Waterleeftijd en chloor}} wat u wilt volgen (waterleeftijd, chloor of een brontrace), stel de uren in die het moet draaien en de grenzen die u wilt, en druk op {{ui:Loop}}. Knooppunten buiten uw grenzen worden getoond.
7. Druk onder elke tabel op {{ui:Opslaan als CSV}} om hem te bewaren.

## Opmerkingen

- Het benodigde brandweerdebiet en het verbruik per woning of per acre zijn startwaarden, geen normen. Gebruik de eigen cijfers van uw waterbedrijf.
- Een leiding die deels door een afsluiter wordt afgesneden, wordt geheel gesloten, zodat de getoonde storing iets slechter is dan een echte.
- Laat het waterkwaliteitsdeel lang genoeg draaien zodat het dagpatroon zich herhaalt voordat u de laatste dag leest.
- {{ui:Stoppen}} beëindigt een lange run vroegtijdig; de lijst toont dan alleen wat er gedaan is.
- Uw netwerk blijft in dit project en op deze computer. Er wordt niets ergens naartoe gestuurd.
