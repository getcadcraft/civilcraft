---
title: WaterCraft: afnames, brandweerdebiet, uitval en waterleeftijd
summary: Met de add-on WaterCraft maakt u van klanten afnames op uw waterleidingen, controleert u het debiet dat bij elke brandkraan beschikbaar is, ziet u welke uitval van een hoofdleiding het zwaarst weegt en volgt u waterleeftijd en chloor gedurende een dag.
keywords: watercraft, waterdistributie, afnames, klanten, piekfactor, afnamepatroon, brandweerdebiet, brandkraan, restdruk, kritikaliteit, uitval, afsluitbaar deel, waterleeftijd, chloor, restdruk, brontracering, doodlopende leiding, csv, add-on
from: 76809f01
---

WaterCraft is een add-on die werkt op het waternet dat u al hebt getekend met de hulpmiddelen voor waterleidingen. Het voegt een tabblad toe aan het paneel rechts, met vier secties.

:::warning
Alleen een rekenhulp. Het is gecontroleerd met handberekeningen op verzonnen netwerken, niet op een echt model van een waterbedrijf. Een waterbouwkundige moet elk resultaat controleren. Er zijn nog geen boosterstations, geen afbraak van de tweede orde en nog geen scenario's.
:::

## Wat u gaat doen

- Zet klanten als afnames op het netwerk.
- Zoek de brandkranen die minder debiet hebben dan u nodig heeft.
- Zoek de leidingen waarvan de uitval het meest uitmaakt.
- Zoek oud water en laag chloor.

## Stappen

1. Open {{ui:Instellingen}} › {{ui:Add-ons}} en schakel {{ui:WaterCraft (waterdistributie)}} in. Er verschijnt een tabblad {{ui:WaterCraft}} in het paneel rechts.
2. Teken eerst een reservoir, knooppunten en leidingen met de hulpmiddelen voor waterleidingen (zie [Waterleidingen](topic:water-mains)). Zonder netwerk vertelt het tabblad u dat.
3. Plak onder {{ui:Afnames}} één klant per regel: id, x, y, soort, hoeveelheid. Kies de {{ui:Piekfactor}} en het {{ui:Uurpatroon}} (dagpatroon wonen, dagpatroon commercieel, vlak, of het patroon behouden zoals het is). Klik op {{ui:Controleren}} om te zien waar elke klant terechtkomt (het dichtstbijzijnde knooppunt), en klik daarna op {{ui:In het netwerk plaatsen}}. Ongedaan maken haalt de afnames weer weg.
4. Stel onder {{ui:Brandweerdebiet}} het benodigde debiet en de restdruk in, kies of de restdruk wordt gehandhaafd {{ui:Alleen bij de brandkraan}} of {{ui:Overal in het systeem (strenger)}}, en klik op {{ui:Loop}}. Elke brandkraan staat op de lijst, de slechtste eerst, als voldoet of tekort.
5. Kies onder {{ui:Welke hoofdleiding het zwaarst weegt}} {{ui:één leiding tegelijk}} of {{ui:één afsluitbaar deel tegelijk}} en klik op {{ui:Loop}}. Elke uitval toont de afname die wegvalt, de knooppunten die wegvallen, de knooppunten die nieuw onder de minimumdruk komen en de laagste druk die overblijft.
6. Kies onder {{ui:Waterleeftijd en chloor}} wat u wilt volgen (waterleeftijd, chloor of een brontracering), stel de uren in die het moet draaien en de grenzen die u wilt, en klik op {{ui:Loop}}. Knooppunten buiten uw grenzen worden vermeld.
7. Klik onder elke tabel op {{ui:Opslaan als CSV}} om hem te bewaren.

## Opmerkingen

- Het benodigde brandweerdebiet en het gebruik per woning of per acre zijn startwaarden, geen normen. Gebruik de eigen cijfers van uw waterbedrijf.
- Een leiding die deels door een afsluiter wordt afgesloten, wordt geheel gesloten. De getoonde uitval is daardoor iets erger dan een echte uitval.
- Laat het deel over waterkwaliteit lang genoeg draaien zodat het dagpatroon zich herhaalt, voordat u de laatste dag leest.
- {{ui:Stoppen}} beëindigt een lange run vroegtijdig; de lijst toont dan alleen wat er al is gedaan.
- Uw netwerk blijft in dit project en op deze computer. Er wordt niets ergens naartoe gestuurd.
