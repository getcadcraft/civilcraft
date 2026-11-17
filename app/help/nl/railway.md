---
title: Een spoorbaan ontwerpen
summary: Maak van een tracé een spoorbaan: overgangen (klothoïde, kubische parabool, Bloss, Helmert, halve sinusgolf, sinus), overhoging in elke boog met de evenwichtsoverhoging, overhoogtetekort en overhoogteoverschot, grenzen voor overhoging en spoorgeometrie als waarschuwingen, wissels en kruisverbindingen per stationering, een vrijruimteprofiel dat langs het spoor wordt geveegd, en een spoor met rails, dwarsliggers en een ballastbed, gebouwd als corridor, in plan, doorsneden, lengteprofiel, 3D en hoeveelheden.
keywords: spoorweg, rail, spoorlijn, spoor, trein, metro, tram, overhoging, superelevatie, overhoogtetekort, overhoogteoverschot, evenwichtsoverhoging, overgang, overgangsboog, klothoïde, kubische parabool, bloss, helmert, halve sinusgolf, cosinus, spoorwijdte, normaalspoor, breedspoor, meterspoor, smalspoor, dwarsligger, ballast, onderballast, onderbouw, berm, hartafstand sporen, 60E1, 54E1, UIC60, 115RE, 136RE, helling van overhoging, verandering van overhoging, wissel, kruisverbinding, hartstuk, hartstuknummer, wisselkop, sluitboog, afbuigsnelheid, vrijruimte, vrijhoudprofiel, vrijruimteprofiel, kinematische omhullende, perron, perronhiaat, spoorafstand, helling, verticale boog, minimale straal, LandXML-overhoging
from: 99de9745
---

Elk tracé kan een spoorbaan zijn. De bogen krijgen dan overgangen en een overhoging (de superelevatie van de rails), en de corridor wordt gebouwd als spoor: rails op dwarsliggers op een ballastbed, en net als een weg in het terrein gegraveerd. Wissels en kruisverbindingen worden per stationering geplaatst, en een vrijruimteprofiel kan langs het spoor worden geveegd en worden gecontroleerd op wat er naast het spoor staat.

Elk getal hieronder is een **tijdelijke waarde**, geen norm. Spoorwegen stellen hun grenzen vast op basis van de lijnsnelheid, het spoortype en het land; stel ze in op basis van de standaard van uw eigen spoorweg. CivilCraft levert geen nationale tabel mee.

## Het tracé tot spoorweg maken

1. Selecteer het tracé en zoek **Spoorweg** in Eigenschappen.
2. Vink **Dit tracé is een spoorbaan** aan. Elke wijziging is één stap ongedaan maken.
3. Stel de **Ontwerpsnelheid** in bovenaan de Eigenschappen van het tracé: dat is de lijnsnelheid waartegen de overhoging wordt gecontroleerd. **Langzaamste treinen** (in het blok Spoorweg) is de snelheid waartegen het overhogingsoverschot wordt gecontroleerd.

## Overgangen

Geef elke boog aan beide uiteinden een overgangslengte in de PI-tabel (**Overgang in**, **Overgang uit**). Kies daarna het type in de boogtabel van het blok Spoorweg, of kies **Overgang voor elke boog**:

| Type | Kromming langs de overgang |
|---|---|
| Klothoïde | groeit gelijkmatig (de wegspiraal) |
| Kubische parabool | y = x³ / (6·R·L), met L gemeten langs de raaklijn; de boog zelf is iets langer |
| Bloss | 3u² − 2u³ van de volledige kromming (u = het aandeel van de lengte): begint en eindigt zacht |
| Helmert | twee parabolen, eerst 2u² en daarna 1 − 2(1 − u)² |
| Halve sinusgolf | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Alle typen behalve de kubische parabool draaien over L / 2R, net als de klothoïde. Stationering loopt langs de werkelijke lengte. LandXML bewaart het type (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Overhoging

Typ de **Overhoging** van elke boog in millimeter. De tabel toont voor elke boog:

- **Evenwicht**-overhoging = G·v² / (g·R), waarbij G de afstand tussen de hartlijnen van de rails is (**Hartafstand rails**: de spoorwijdte plus de kopbreedte van de rail, tenzij u die zelf typt). Met G = 1500 mm is dit de bekende 11.8·V² / R (V in km/h, R in m).
- **Tekort** = evenwichtsoverhoging bij de lijnsnelheid − toegepaste overhoging.
- **Overschot** = toegepaste overhoging − evenwichtsoverhoging bij de snelheid van de langzaamste treinen.
- **Helling**: de steilste verandering van de overhoging langs de hellingstroken, in mm per meter.

De overhoging loopt over elke overgang op, gevormd naar de kromming: recht bij een klothoïde of een kubische parabool, Bloss-vormig bij Bloss, enzovoort. Een boogeinde zonder overgang loopt op in het rechte stuk ervoor, zo lang als de grens voor de helling van de overhoging vereist, en dat wordt vermeld: de overhoging verandert dan waar de kromming dat niet doet.

**Overhoging draait om** geeft aan welke rail op het ontwerpprofiel blijft: **de lage rail** (de gebruikelijke), **de binnenrail** of **de spoorhart** (elke rail verplaatst zich de helft van de overhoging). Het ontwerpprofiel is daar de bovenkant van de rail.

Het **Overhogingsdiagram** tekent de hoogte van elke rail boven het profiel langs de stationering; het lengteprofiel en de plan- en profielbladen krijgen hetzelfde als strook onder het profiel.

## Grenzen en waarschuwingen voor overhoging

**Grootste toegepaste overhoging**, **Grootste overhogingstekort**, **Grootste overhogingsoverschot**, **Steilste helling van overhoging** en **Snelste verandering van overhoging** (de helling bij de lijnsnelheid, in mm/s) worden op elke boog gecontroleerd. Een waarde boven een grens is een waarschuwing in het blok Spoorweg en in het paneel Problemen, met de grens en de gevonden waarde. Zonder ontwerpsnelheid worden het tekort en de snelheid van verandering niet gecontroleerd (een opmerking zegt dat).

## Het spoor

Stel de **Spoorwijdte** in (de voorinstellingen normaalspoor 1435 mm, breedspoor, meterspoor of smalspoor, of een eigen waarde), het **Railprofiel** (60E1, 54E1, 49E1, 115RE, 136RE: alleen hun gepubliceerde afmetingen), het aantal **Sporen** en hun **Hartafstand sporen**. Stel daarna **Dwarsliggers en ballast** in: materiaal, lengte, breedte, hoogte en afstand van de dwarsliggers; de dikte van de ballast onder de dwarsligger (bij de lage rail), de berm, het talud en hoe ver de bovenkant ervan onder de dwarsliggers ligt; de dikte van de onderballast, de berm voorbij de teen van de ballast, en de dwarshelling van de onderbouw.

Druk op **Spoor bouwen**. Dit wordt ingeschakeld op de corridor van het tracé, gebouwd als spoor langs het ontwerpprofiel: de rails en dwarsliggers kantelen mee met de overhoging, de onderbouw niet. Taluds van het maaiveld lopen vanaf de rand van de berm bij de ontgraving- en ophogingstaluds van de corridor, en het spoor loopt net als een weg over in het nieuwe maaiveld.

- **Plan**: beide rails van elk spoor (laag C-RAIL-TRAK) en, bij meer dan één spoor, de hartlijn van elk spoor (C-RAIL-CNTR), op het scherm, in DXF, DWG, PDF en in de plan- en profielbladen.
- **Doorsneden**: de dwarsliggers, rails, en de onderkant van de ballast en onderballast in elke doorsnede.
- **3D**: de rails, elke dwarsligger en het ballastbed (Toon › Spoor), ook in GLB, OBJ en USD.
- **Hoeveelheden**: sporlengte, rail (beide rails van elk spoor, langs de eigen lijn van elk spoor), dwarsliggers, het ballastbed en de ballast min de dwarsliggers, en de onderballast, volgens het gemiddelde van de eindoppervlakken tussen doorsneden.

## Controles op spoorgeometrie

Naast de overhoging controleert het blok Spoorweg de lijn zelf tegen zes andere grenzen (allemaal tijdelijke waarden, allemaal van u om in te stellen):

- **Steilste helling** van het ontwerpprofiel, in mm per meter.
- **Kleinste straal van de verticale boog**, als factor k in R ≥ k·V² (R in meter, V in km/h). Een parabolische verticale boog met lengte L tussen twee hellingen heeft een straal van L gedeeld door de verandering van de helling.
- **Kortste verticale boog**.
- **Kleinste boogstraal** in plan (0 schakelt de controle uit).
- **Kortste boog of rechte stuk**, als seconden reistijd bij de lijnsnelheid: een cirkelboog, of de rechte tussen twee bogen, die korter is dan die afstand, krijgt een waarschuwing. 1,8 s is de bekende "de helft van de snelheid in km/h, in meter".
- **Verandering van het overhogingstekort** langs elke overgang, in mm/s bij de lijnsnelheid.

**Spoorgeometrie** toont de gevonden steilste helling en elke verticale boog met zijn straal en de straal die de lijnsnelheid vereist. Een verticale boog die op een overgang of een hellingstrook van de overhoging ligt, krijgt een opmerking. Zonder ontwerpprofiel of ontwerpsnelheid worden de controles die die nodig hebben overgeslagen, en een opmerking zegt dat.

## Wissels en kruisverbindingen

Druk onder **Wissels en kruisverbindingen** op **Wissel toevoegen**. Die wordt op de langste rechte stuk geplaatst; stel in de tabel in:

- **Wisselpunt-stationering**: waar de wissel op dit tracé begint.
- **Hartstuk**: het hartstuknummer N (1:N). De hartstukhoek is 2·atan(1 / 2N).
- **Zijde**: links of rechts, kijkend in de richting van de stationering.
- **Afstand kruisverbinding** in meter: boven 0 wordt de wissel een kruisverbinding naar een evenwijdig spoor op die afstand (twee wissels en de rechte stuk ertussen).

De tabel toont de **Wisselkop** (wisselpunt tot hartstuk), de **Straal** van de sluitboog en de **Afbuigsnelheid** die die straal toelaat bij uw grens voor overhogingstekort en zonder overhoging. **Spoor ervan maken** maakt van de afbuigende route een eigen tracé (de wissel, de sluitboog, en daarna rechtdoor onder de hartstukhoek) met dezelfde instellingen voor de spoorweg, klaar om verlengd te worden.

Het plan tekent de twee afbuigende rails van elke wissel, zijn hartlijn, een streepje bij het wisselpunt en bij het hartstuk, en "1:N" (laag C-RAIL-TURN), op het scherm en in DXF, DWG, PDF en bladen. De 3D-weergave tekent de afbuigende rails op het niveau van het hoofdspoor.

De vorm is een **tijdelijke waarde**: een rechte wissel en één sluitboog vanaf het hartstuknummer. Een gebouwde wissel volgt de standaard van de spoorweg en de tekening van de fabrikant. Waarschuwingen: een wissel die buiten het tracé loopt, op een boog, een overgang, een overhoging of een verticale boog ligt, of een andere wissel overlapt; en een opmerking wanneer de lijnsnelheid boven zijn afbuigsnelheid ligt.

## Vrijruimteprofiel

Vink **Een vrijruimteprofiel langs dit spoor vegen** aan. Kies de **Contour** (twee tijdelijke vormen, of **Eigen contour** getypt als één punt per regel: afstand vanaf de spoorhart, en dan hoogte boven de bovenkant van de rail, in meter), de **Voertuiglengte** en de **Draaistelhartafstand**, en, als die er is, een **Perronrand** (zijde, afstand tot de spoorhart, hoogte boven de rail).

Bij elke stationering wordt de contour met de overhoging gekanteld rond de lage rail en door de boog verbreed: het midden van het voertuig beweegt naar binnen met b² / 8R, de uiteinden naar buiten met (L² − b²) / 8R (b de draaistelhartafstand, L de voertuiglengte, R de straal daar, de overgang volgend). Het blok tekent de doorsnede op de rechte stuk en waar die het breedst is, en toont:

- het **breedste vrijhoudprofiel** en waar dat is,
- de **hartafstand van de sporen** af te zetten tegen de hartafstand die twee naburige profielen nodig hebben,
- de ruimte die overblijft bij de **perronrand**, of hoe ver die naar binnen ligt,
- elke elementlijn, leiding, kunstwerk en ander spoortracé dat **binnen het profiel** ligt.

Een elementlijn met hoogten wordt beoordeeld tegen de contour op zijn hoogte boven de rail; zonder ontwerpprofiel, of voor een punt zonder hoogte, wordt alleen in plan beoordeeld, en de lijst zegt dat. Het plan toont de twee randen van het profiel (laag C-RAIL-CLRN) met een kruis bij elk object binnen het profiel.

De contouren die worden aangeboden zijn **tijdelijke waarden, geen spoorwijdte van een spoorweg**. Typ de vrijruimte van uw spoorweg voordat u op een resultaat vertrouwt.

## In andere programma's

- **LandXML**: een spoortracé wordt geschreven met zijn overgangen (spiType) en een `Cant`-blok: de spoorwijdte, het draaipunt, de lijnsnelheid, en een stationering waar elke hellingstrook van de overhoging begint en eindigt, met de toegepaste overhoging, de evenwichtsoverhoging en het tekort. Een LandXML-bestand met een `Cant`-blok openen maakt dat tracé een spoorweg met die overhogingen.
- **IFC**: het tracé met zijn overhogingssegmenten, de rails, dwarsliggers, ballast en onderballast.

## Nog niet beschikbaar

Wissels in de IFC-export, wisselfamilies naast de enkele sluitboog (gebogen wissels, wissels met zwenkhartstuk, kruisingen, diamanten), kinematische regels voor de spoorwijdte (het profiel is een vaste contour met boogverschuiving), bovenleiding en seinen.

**Welke norm.** In het blok Spoorweg kiest **Te citeren norm** tussen Geen en Europees. Kiezen van Europees noemt de documenten die een Europees project citeert (EN 13803 voor de tracéparameters, EN 13232 voor wissels en kruisingen, EN 15273 voor de spoorwijdte, EN 13848 voor de kwaliteit van de spoorgeometrie) en geeft elke grens een vak voor de clausule waaruit die komt. Geen enkel getal uit een norm is ingebouwd: de grenzen voor overhoging, tekort, overschot, helling en verandering, de wisselgeometrie en de vrijruimte zijn allemaal nog tijdelijke waarden, en het venster zegt dat. Een spoorwegingenieur controleert elke waarde tegen de eigen tekst van de norm en typt de clausule ernaast voordat er iets wordt gebouwd. Zuid-Afrika en de AREMA-tabellen zitten niet in deze uitgave.
