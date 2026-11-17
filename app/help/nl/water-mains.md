---
title: Waterleidingen: drukken, debieten en brandweerdebiet
summary: Teken een drukleidingnetwerk van knooppunten, reservoirs, tanks, leidingen, pompen en drukreduceerventielen op het plan; CivilCraft berekent de opvoerhoogten, drukken en debieten (Hazen–Williams, lusnetwerken), het beschikbare debiet voor een brand en een dag verbruik. Een labfunctie; elk resultaat vereist een controle door een ingenieur.
keywords: water, waterleiding, waterverdeling, druknetwerk, drukleiding, lusnetwerk, hazen-williams, C-factor, drukverlies, restdruk, brandweerdebiet, brandkraan, verbruik, knooppunt, reservoir, tank, pomp, pompcurve, drukreduceerventiel, prv, terugslagklep, uitgebreide periode, epanet, inp, snelheid
from: df46bf6d
---

Waterleidingen vormen de drukkant van een terrein: leidingen die altijd vol staan, met water dat wordt voortgestuwd door een reservoir, een tank of een pomp. CivilCraft berekent de opvoerhoogte en druk bij elk knooppunt en het debiet in elke leiding, ook voor lusnetwerken waarin het water meer dan één weg kan nemen. Het zit in het lab terwijl het wordt gecontroleerd.

**Alleen een rekenhulpmiddel.** Elk getal vereist een controle door een gekwalificeerde ingenieur: het antwoord is zo goed als de verbruiken, hoogten, leidingdiameters en ruwheidswaarden die u erin zet, en een stationair model weet niets van waterslag, waterkwaliteit of het echte gedrag van een brandpomp.

## Het netwerk tekenen

1. Kies onder **Terrein** › {{ui:Meer}} de optie {{ui:Waterleidingen…}}. Het venster blijft open terwijl u aan het plan werkt.
2. Kies {{ui:Reservoir}} en klik op het plan waar de toevoer is. De opvoerhoogte begint 100 ft (30 m) boven het maaiveld; wijzig dat in Eigenschappen.
3. Kies {{ui:Knooppunt}} en klik op elke plek waar water wordt afgenomen of leidingen samenkomen. Een knooppunt krijgt zijn hoogte van het maaiveld; typ in Eigenschappen een andere hoogte om die te overschrijven.
4. Kies {{ui:Leiding}}, klik op een knooppunt en daarna op het knooppunt waarmee het wordt verbonden. Het gereedschap blijft aan voor de volgende leiding. Een {{ui:Pomp}} en een {{ui:Drukreduceerventiel}} worden op dezelfde manier getekend, van het zuig- (of bovenstroomse) knooppunt naar het persings- (of benedenstroomse) knooppunt. Een {{ui:Tank}} wordt geplaatst als een knooppunt.
5. Selecteer een knooppunt en typ zijn {{ui:Verbruik}} (gpm, of L/s in een meterproject). Selecteer een leiding en stel zijn {{ui:Diameter}} in (in, of mm) en, als u die kent, zijn Hazen–Williams C.

Elke wijziging is één stap ongedaan maken. Met {{key:Delete}} verwijdert u het knooppunt en de leidingen die erop eindigen.

## Wat elk onderdeel betekent

- **Leiding.** De lengte wordt langs het plan gemeten, tenzij u er een typt. C is de Hazen–Williams-ruwheid (130 om mee te beginnen; wijzig de standaard in het venster). Een coëfficiënt voor kleine verliezen K telt de verliezen van bochten en fittingen op. Vink **Terugslagklep** aan voor een leiding die geen water achteruit mag laten stromen; een **Gesloten** leiding voert niets af.
- **Reservoir.** Een bron op een vaste opvoerhoogte: het waterniveau dat het boven het referentievlak houdt. Het levert of neemt wat het netwerk nodig heeft.
- **Tank.** Een niveau dat over een dag verandert. In de stationaire resultaten is het een bron op zijn huidige niveau.
- **Pomp.** Eén ontwerppunt (debiet en opvoerhoogte) levert de gebruikelijke pompcurve erdoorheen: de opvoerhoogte bij nul debiet is 133 % van de ontwerpopvoerhoogte, en de opvoerhoogte is nul bij het dubbele van het ontwerpdebiet. Een pomp duwt water nooit achteruit.
- **Drukreduceerventiel.** Houdt de druk vast die u stroomafwaarts instelt wanneer de toevoer hoger is. Wanneer de toevoer lager is, staat het open en houdt het niets vast; als het water achteruit zou stromen, sluit het.

## De resultaten lezen

Het venster toont de opvoerhoogte en druk van elk knooppunt en het debiet, de snelheid en het drukverlies per 1,000 ft (of per km) van elke verbinding, met de knooppunten op het plan gekleurd: groen is tussen uw laagste en hoogste druk, rood eronder, oranje erboven. Stroompijlen tonen de richting. Selecteer een knooppunt of een leiding om de getallen in Eigenschappen te lezen.

Onder de tabellen staat een lijst van wat u moet bekijken: lage of hoge druk, een leiding die sneller is dan uw grens, een knooppunt dat van elke bron is afgesneden, of een oplosser die niet convergeerde. Dezelfde bevindingen staan in het paneel Problemen. Stel de grenzen in het venster in (20 psi, 100 psi en 10 ft/s om mee te beginnen; 140 kPa, 700 kPa en 3 m/s in een meterproject).

## Brandweerdebiet

{{ui:Brandweerdebiet…}} tekent een debiet bij één knooppunt en toont de druk daar en de laagste druk ergens in het netwerk. Het vindt ook het debiet dat op dat knooppunt beschikbaar is, terwijl het zwakste knooppunt in het netwerk de restdruk houdt die u opgeeft. Andere verbruiken blijven zoals ze zijn.

## Een dag verbruik

{{ui:Een dag verbruik…}} draait het netwerk uur voor uur. Geef het verbruikspatroon op in de instellingen van het bestand (een lijst met vermenigvuldigers die zich herhaalt); tanks vullen en lopen leeg met het in- en uitgaande debiet, en een pomp kan een aan/uit-patroon volgen. Een tank die zijn hoogste of laagste niveau bereikt, wordt in de lijst genoemd: CivilCraft sluit de inlaat of uitlaat niet voor u af, dus lees dat als "deze tank is te klein of de pomp te groot".

## EPANET-tekst

{{ui:Opslaan als EPANET-tekst (.inp)}} schrijft het netwerk in het platte tekstformaat dat veel waterprogramma's lezen, en {{ui:EPANET-tekst (.inp) openen…}} leest er een. Alleen wat CivilCraft modelleert komt mee: knooppunten, reservoirs, tanks, leidingen, pompen met een opvoercurve, drukreduceerventielen, verbruikspatronen en de tijden. Andere kleptypen, pompen die op vermogen zijn opgegeven, en andere formules voor drukverlies worden genoemd en weggelaten. Het bestand moet dezelfde eenheden gebruiken als het project.

## Brandkranen, kleppen en fittingen

Selecteer een knooppunt en vink **Brandkraan** aan om er een te plaatsen; selecteer een hoofdleiding en druk op **Toevoegen in het midden** om er een klep, een luchtklep, een spuiklep of een meter op te zetten. Het zijn objecten van het netwerk: ze verplaatsen mee, en één stap ongedaan maken verwijdert ze.

De opzet impliceert ook fittingen, en CivilCraft somt ze op zonder dat u erom vraagt: een **T-stuk** waar drie hoofdleidingen samenkomen, een **kruis** waar er vier samenkomen, een **bocht** (met zijn hoek) waar twee hoofdleidingen 5° of meer draaien, een **verloop** waar twee maten samenkomen, en een **dop** op een doodlopend uiteinde. {{ui:Fittingstaat (CSV)}} telt ze en de hoofdleidingen per maat. Dit is wat de opzet impliceert: een opmeting om te controleren tegen uw eigen details, geen lijst om te bestellen.

Hoofdleidingen worden aangelegd op het maaiveld minus een dekking (4 ft of 1.2 m), zodat ze in 3D getekend en gemodelleerd kunnen worden; de drukken hierboven hangen daar nooit van af.

## Op het plan en in bestanden

Het plan, de PDF en de DWG of DXF dragen de hoofdleidingen op **C-WATR-MAIN** met hun maten op **C-WATR-TEXT**, brandkranen op **C-WATR-HYDR**, kleppen op **C-WATR-VALV** en de fittingen op **C-WATR-FITT**. LandXML-export schrijft een waterleidingnetwerk (een kunstwerk voor elk knooppunt, een leiding voor elke hoofdleiding, brandkranen met naam); LandXML-import leest er een terug als waterleidingen, zonder verbruiken, pompen of kleppen, die LandXML niet meedraagt. De IFC-export schrijft de hoofdleidingen als leidingsegmenten, brandkranen, kleppen en fittingen in één watersysteem. Deze bestanden zijn gecontroleerd met onze eigen lezers en schrijvers; probeer ze in uw andere programma's en laat ons weten wat die ervan zeggen.

## Wat hier nog niet is

Waterkwaliteit en leeftijd, regelingen en regels die verder gaan dan het aan/uit-patroon van een pomp, andere kleptypen, verbruik afhankelijk van druk, leidingen met een veranderende diameter, en rioolafvoeren in de tijd. Zie [Nog niet beschikbaar](topic:not-built-yet). Ontwerpafvoeren voor vuilwater, een andere berekening, staan in [Ontwerpafvoeren vuilwater](topic:sanitary-design).
