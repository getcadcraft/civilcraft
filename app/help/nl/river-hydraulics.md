---
title: Waterspiegelprofielen van een rivier
summary: Modelleer een rivier uit het terreinoppervlak en bereken stationaire waterspiegelprofielen met de standaardstapmethode: waterpeilen, energie, snelheden, Froude-getallen en het overstroomde gebied op het plan. Een labfunctie; elk resultaat vereist een beoordeling door een ingenieur.
keywords: dijk, ineffectief stroomgebied, doorsnede-editor, rivier, hydraulica, waterspiegelprofiel, backwater, standaardstapmethode, stationaire stroming, 1d, dwarsprofielen, manning, ruwheid, transportvermogen, kritieke diepte, normale diepte, froude, energielijn, overstroomd gebied, uiterwaard, overstroming, oevers, vaklengtes, contractie, expansie, subkritisch, superkritisch, gemengd regime, hydraulische sprong
from: fb8bf425
---

CivilCraft berekent stationaire, eendimensionale waterspiegelprofielen langs een rivier: voor elke afvoer die u geeft, het waterpeil bij elke dwarsdoorsnede, uit de energiebalans tussen naburige doorsneden (de standaardstapmethode). De functie staat in het lab terwijl ze wordt gecontroleerd.

**Alleen een ontwerphulpmiddel.** De waterpeilen vereisen een beoordeling door een gekwalificeerde ingenieur voordat iemand erop vertrouwt: een 1D-model is slechts zo goed als zijn doorsneden, ruwheidswaarden, vaklengtes en randvoorwaarden, en het weet niets van bruggen, duikers of afvoer die de rivier verlaat.

## De rivier tekenen

1. Maak eerst het bestaande terreinoppervlak (punten, breeklijnen of een TIN die u heeft geopend).
2. Kies onder **Terrein** › {{ui:Meer}} de optie {{ui:Rivier}}.
3. Klik langs de hartlijn van de rivier **van stroomopwaarts naar stroomafwaarts**, en druk daarna op {{key:Enter}} of dubbelklik.

CivilCraft snijdt elke 50 m (200 ft) een doorsnede loodrecht op de hartlijn, 100 m (300 ft) naar elke kant, uit het terrein. Rivierstations worden gemeten vanaf het stroomafwaartse uiteinde, dus ze lopen op naar stroomopwaarts. De oevers beginnen als schatting 10 m (30 ft) aan weerszijden van het laagste punt van elke doorsnede.

Om een doorsnede toe te voegen waar de rivier smaller wordt of waar een kunstwerk ligt, selecteert u de rivier, klikt u op {{ui:Een doorsnede toevoegen}} en tekent u er een snijlijn doorheen (in beide richtingen: hij wordt gedraaid zodat hij van links naar rechts loopt, kijkend stroomafwaarts).

## De rivier instellen

Selecteer de rivier om die in **Eigenschappen** te zien:

- **Stromingsregime**: subkritisch (het gebruikelijke geval: berekend stroomopwaarts vanaf de stroomafwaartse randvoorwaarde), superkritisch (berekend stroomafwaarts vanaf de stroomopwaartse randvoorwaarde) of gemengd (beide, daarna het regime met de grootste specifieke kracht per doorsnede; een voorbeeld).
- **Afvoerprofielen**: een naam en een afvoer voor elk (bijvoorbeeld een afvoer van 10 jaar en een van 100 jaar), en de randvoorwaarde aan het stroomafwaartse uiteinde (en aan het stroomopwaartse uiteinde wanneer het regime niet subkritisch is): **Normale diepte** met een energiehelling (de bodemhelling is een eerste schatting), een **Bekend wateroppervlak** op een hoogte, of **Kritieke diepte**.
- **Doorsneden uit het terrein**: de tussenafstand, hoe ver links en rechts, de schatting van de oevers en de twee Manning's n-waarden. {{ui:Doorsneden opnieuw snijden}} vervangt de doorsneden (één stap ongedaan maken).
- **De doorsnedetabel**: voor elke doorsnede de offsets van de linker- en rechteroever, de n van de geul en de n van de overstroombare zone, de vaklengtes tot de volgende doorsnede stroomafwaarts (linker overstroombare zone, geul, rechter overstroombare zone; eerst gemeten op het plan) en de contractie- en expansiecoëfficiënten (0.1 en 0.3 om mee te beginnen: geleidelijke overgangen). {{ui:Bewerken}} opent de doorsnede-editor (hierna); een stip erachter betekent dat de doorsnede een dijk of een ineffectief gebied heeft.

Elke wijziging is één stap ongedaan maken ({{key:Mod+Z}}).

## Een doorsnede bewerken: oevers, dijken en ineffectieve gebieden

{{ui:Bewerken}} op een doorsnede tekent het terrein en laat u slepen wat de oplosser leest: de **linker- en rechteroever** (zij verdelen de doorsnede in de linker overstroombare zone, de hoofdgeul en de rechter overstroombare zone), een **dijk** aan elke kant en **ineffectieve stroomgebieden**. Elk handvat kan ook met de pijltjestoetsen worden verplaatst, en elk getal kan naast de grafiek worden getypt. {{ui:Toepassen}} is één stap ongedaan maken.

- Een **dijk** heeft een plaats (offset) en een kruinhoogte. Het terrein achter de dijk, weg van de rivier, wordt van de rivier afgesneden zolang het wateroppervlak onder de kruin ligt: het oppervlak, de natte omtrek en het transportvermogen ervan worden weggelaten. Boven de kruin telt de hele doorsnede weer mee. Een dijk staat buiten de oever die hij beschermt; een dijk binnen de oevers wordt gemarkeerd.
- Een **ineffectief stroomgebied** houdt water vast maar voert geen afvoer (een kom achter een dijk, stilstaand water naast een brugtoegang). Geef de twee offsets en, als u wilt, een waterpeil waaronder het ineffectief is ({{ui:altijd}} als het leeg is): boven dat peil stroomt het net als de rest. Een gebied dat een deel van de hoofdgeul bedekt, wordt gemarkeerd.
- Tussen twee doorsneden laat het overstroomde gebied het terrein achter een dijk die beide doorsneden hebben droog, zolang het wateroppervlak daar onder de kruin ligt (de lijn tussen de twee kruinen is recht).

## Berekenen en de resultaten lezen

Klik op {{ui:Waterspiegelprofielen}}. Voor het profiel dat u kiest, krijgt u:

- een **grafiek** langs de rivier (stroming van links naar rechts): geulbodem, oevers, wateroppervlak, energielijn en kritiek wateroppervlak; doorsneden die op kritieke diepte worden gehouden, zijn omcirkeld;
- een **tabel** per doorsnede: rivierstation, afvoer, geulbodem, wateroppervlak, kritiek wateroppervlak, energielijn, diepte, snelheid in de geul en in totaal, het Froude-getal van de geul, stroomoppervlak, bovenbreedte, de afvoer in elke overstroombare zone en in de geul, de energiehelling en waarschuwingen;
- **waarschuwingen** in gewone woorden, bijvoorbeeld een doorsnede die op kritieke diepte staat, water boven de uiteinden van een doorsnede, of een grote verandering in transportvermogen tussen twee doorsneden (voeg doorsneden ertussen toe).

{{ui:Tabel (CSV)}}, {{ui:Rapport}} (platte tekst met de methode, de randvoorwaarden en elke tabel) en {{ui:Grafiek (SVG)}} slaan op in uw downloads. Elk bevat de beoordelingsregel.

Vink {{ui:De overstroomde zone tonen}} aan in **Eigenschappen** om het natte gebied op het plan te arceren voor het gekozen profiel, met de waterlijn getekend waar de diepte nul is. Tussen doorsneden ligt het wateroppervlak horizontaal over de rivier en verandert het lineair met het rivierstation. Terrein achter een dijk blijft droog zolang het water onder de kruin ligt. Ander laag terrein binnen het corridor van de rivier dat het water niet kan bereiken (bijvoorbeeld achter een wegdijk) wordt nog steeds gearceerd: controleer het.

## In de tekening en in Problemen

De lijnen van de rivier gaan naar het plan, de PDF en de DWG op hun eigen lagen: **C-WATR-CNTR** (de hartlijn), **C-WATR-SCTN** (elke snijlijn, met zijn rivierstation) en **C-WATR-FLOD** (de waterlijn van het overstroomde gebied, wanneer {{ui:De overstroomde zone tonen}} voor een profiel is aangevinkt). De waarschuwingen van de rivier (een doorsnede op kritieke diepte, water boven de doorsneduiteinden, een verandering in transportvermogen die meer doorsneden vraagt, een energiebalans die niet sluit, een dijk binnen de oevers) gaan ook naar het paneel **Problemen**, over de rivier en geplaatst bij de doorsnede waar ze vandaan komen.

## Hoe het wordt berekend

- Energie tussen twee doorsneden: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Transportvermogen door onderverdeling: elke overstroombare zone wordt gesplitst waar zijn n verandert, K = Σ (1/n)·A·R^(2/3) (1.486/n in US-eenheden); de geul is één stuk, met een samengestelde n wanneer zijn n verandert. α komt uit hoe het transportvermogen wordt verdeeld.
- Wrijvingshelling uit het gemiddelde transportvermogen, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², over de door de afvoer gewogen vaklengte.
- Contractiecoëfficiënt wanneer de stroming stroomafwaarts versnelt, expansiecoëfficiënt wanneer hij vertraagt.
- Kritieke diepte = minimale specifieke energie. Elk waterpeil wordt opgelost op een interval, dus het springt nooit naar de verkeerde kant van kritiek; wanneer er geen antwoord bestaat, wordt het op kritieke diepte gezet en gemarkeerd.

Het programma is gecontroleerd tegen de normale diepte van Manning, de kritieke diepte in een rechthoekige geul en het backwatervoorbeeld van Chow (*Open-Channel Hydraulics*, 1959, hoofdstuk 10), onafhankelijk geïntegreerd. Dezelfde methode wordt gebruikt door de gangbare 1D-rivierprogramma's, dus een handberekening of de aantekeningen van een student stemmen daarmee overeen.

## Duikers en bruggen

In de **Eigenschappen** van de rivier, onder **Duikers en bruggen**, plaatst {{ui:Een duiker toevoegen}} of {{ui:Een brug toevoegen}} er een tussen twee doorsneden (elk vak houdt minstens twee doorsneden). Het profiel eronder blijft ongewijzigd; het wateroppervlak net boven het kunstwerk komt van het kunstwerk, en het profiel loopt vanaf daar stroomopwaarts verder. **Resultaten** voegt een tabel toe van elk kunstwerk: staartwater, kopwaterpeil, welke regeling bepalend is, de afvoer door de opening en de afvoer over de weg of het dek. Alleen subkritische stroming.

- **Duiker** (kokervormig of rond, één of meer gelijke buizen). De inlaatregeling is overlaatstroming zolang de inlaat vrij is en openingsstroming zodra hij verdronken is, gemengd tussen een kopwater van één en anderhalf keer de stijging. De uitlaatregeling is de energiebalans: inlaatverlies, wrijving en uitstroomsnelheidshoogte, over het hoogste van het staartwater en het midden van de kritieke diepte en de kruin, min het verval langs de buis. Het kopwater is het grootste van de twee. Vink **Water kan over de weg stromen** aan en de overlaatstroming van de weg deelt de afvoer met de buizen.
- **Brug.** De opening is de doorsnede onder de brug, afgesneden bij de landhoofden, met elke pijler als een gebied zonder afvoer. Het wateroppervlak in de opening komt van de doorsnede eronder (expansiecoëfficiënt), en dat van de doorsnede erboven komt uit de opening (contractiecoëfficiënt). Als de opening de afvoer bij dat staartwater niet kan doorlaten, stroomt hij op kritieke diepte en wordt de brug gemarkeerd als verstopt. Als het water de onderkant van de ligger bereikt, is de stroming drukstroming (schuiftype zolang het staartwater onder de onderkant ligt, verdronken erboven), en water over het dek voegt overlaatstroming toe; het stroomopwaartse peil is het peil waarbij ze samen de afvoer geven.

De coëfficiënten (afvoer, inlaatverlies, overlaat) zijn ingetypte ronde standaardwaarden. Wijzig ze voor uw ontwerp. Het zijn niet de gefitte grafieken die handboeken voor duikerontwerp afdrukken, dus behandel het kopwater van een duiker dicht bij zijn grens als een schatting. Water over een weg of dek, een verdronken inlaat, een verstopte opening en snelle stroming in een buis worden getoond in **Problemen**.

## Niet-stationaire stroming

{{ui:Niet-stationaire stroming…}} in de **Eigenschappen** van de rivier stuurt een hoogwaterhydrograaf door de doorsneden. Typ de instroom als uren en afvoeren, één paar per regel, de stroomafwaartse helling (normale diepte) en hoelang het moet lopen. Het begint vanaf het stationaire wateroppervlak bij de eerste afvoer en lost de volledige eendimensionale vergelijkingen op (het impliciete vierpuntsschema, gewogen 0.6 in de tijd). U krijgt het piekwaterpeil en de piekafvoer bij elke doorsnede met het uur waarop elk optreedt, een grafiek van de afvoer aan de twee uiteinden, en de volumecontrole (in, uit en de opgeslagen verandering). Het wordt gecontroleerd op: stationaire stroming die stationair blijft, een stap in de instroom die eindigt bij het stationaire profiel van de nieuwe afvoer, een sluitend volume, en de snelheid van de hoogwatergolf tegen de kinematische golf. Subkritische stroming, één vak, geen zijinstroom, en geen duikers of bruggen binnen de run.

## Samenvloeiingen

Vakken die stroming naar één uitlaat samenvoegen: de afvoeren tellen op, en het wateroppervlak aan het begin van het stroomafwaartse vak wordt doorgetrokken naar de uiteinden van de vakken die erop aansluiten (hetzelfde wateroppervlak bij de samenvloeiing, de eenvoudige methode: geen hoek, geen impuls, dus geschikt voor lage Froude-getallen). Het model en de tests staan klaar (`river-structures.js`); een paneel om twee rivieren op het plan samen te voegen is nog niet beschikbaar.

## Nog niet beschikbaar

Stuwen en sluizen als eigen kunstwerken, een paneel voor samenvloeiingen, kunstwerken binnen een niet-stationaire run, en niet-stationaire superkritische stroming. Een run met gemengd regime markeert een hydraulische sprong tussen twee doorsneden, maar plaatst hem niet.

**Waar rivieren samenkomen.** In de Eigenschappen van een rivier noemt "Stroomt in" de rivier waarin hij uitmondt. De rivieren die samenkomen worden samen opgelost: de rivier waarin ze stromen draagt de som van hun afvoeren, en elk eindigt bij het wateroppervlak van de eerste doorsnede van die rivier (de methode van gelijk wateroppervlak; die laat de hoek en de impuls van de stromen weg). Om een hoofdrivier en een beek samen te voegen, tekent u een korte rivier onder de samenvloeiing en laat u beide erin stromen. De resultaten tonen een samenvloeiingstabel. De standaardwaarden in deze resultaten (contractie 0.1, expansie 0.3, een geul in één stuk met een samengestelde ruwheid, het gemengde regime op specifieke kracht) blijven staan tot een ingenieur ze heeft beoordeeld, en de Resultaten zeggen dat.
