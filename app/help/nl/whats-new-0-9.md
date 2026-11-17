---
title: Wat is er nieuw in 0.9
summary: Sjablonen voor corridors en terrein, snaps en kiesknoppen tijdens het tekenen, GIS-analyse met een attributentabel, schaduw-, zonne-opbrengst-, comfort- en windstudies voor een terrein, een 3D-renderweergave, en de add-ons Puntenwolken en WaterCraft.
keywords: wat is er nieuw, 0.9, release notes, corridorsjablonen, terreinsjablonen, sjabloneneditor, typische dwarsdoorsnede, meerdere corridors, snap, snaps, kiezen, verplaatsen, kopiëren, roteren, raaklijn, renderen, 3d-render, gis-analyse, buffer, overlay, ruimtelijke koppeling, attributentabel, opmaak op basis van attribuut, schaduwstudie, zonne-opbrengst, utci, buitencomfort, windstudie, openfoam, puntenwolken, las, laz, watercraft, brandweerdebiet, brandkraan, waterleeftijd, chloor, afnames, tooltips, indeling, wijzigingenlijst, 0.8, 0.8.1, versie, nieuwe functies, regen, riool, ponding, overstroming, grondbalans, ontgraving, ophoging, transport, beste route, minste kosten, tracé, retentiebassin, afvoer, leegloopt, vrijboord, voortgang, opmeting, drone, stapel, adres naar terrein, perceel, bodem, overstroming, hellingstabiliteit, bishop, zetting, kruispunt, markering, borden, zichtafstand, vereffening, kleinste kwadraten, polygoon, open pit, blokmodel, radioverbinding, fresnel, wissel, kruisingsspoor, talen, problemen, live, dwg
from: d7ac5b14
---

Dit is wat er is veranderd in CivilCraft 0.9, vergeleken met 0.8.1. CivilCraft 0.9 is onderdeel van CadCraft Studio 0.9 en de acht apps. De grote onderdelen zijn sjablonen voor corridors en terrein, snaps tijdens het tekenen, GIS-analyse, studies van de zon, zonne-opbrengst, comfort en wind op een terrein, en twee add-ons: Puntenwolken en WaterCraft.

## Nieuw

### Sjablonen voor corridors en terrein

- **Corridorsjablonen.** Open {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Corridorsjablonen…}} (of typ {{cmd:TEMPLATES}}). Een sjabloon is een kleine dwarsdoorsnede met onderdelen, offsets, hellingen, materialen en puntcodes. Bewaar ze in het project, in {{ui:Mijn bibliotheek}} of als een `.cctemplates.json`-bestand. De sjabloneneditor toont een tekening op ware schaal en somt problemen op terwijl u typt.
- **Bouwen vanuit sjablonen per stationering.** Selecteer een tracé en zet {{ui:Bouwen vanuit sjablonen per stationering}} aan in de eigenschappen ervan. Elke kant van elke regio heeft een eigen lijst met verhardingen en een eigen eindvoorwaarde. {{ui:Corridor toevoegen}} onder {{ui:Corridors op dit tracé}} zet meerdere corridors op één tracé.
- **Terreinsjablonen.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Terreinsjablonen…}} (of typ {{cmd:TERRAINTEMPLATES}}) legt gelaagde materialen, zoals teelaarde of verharding en fundering, over een terrein, met oppervlakte en volume per laag. Zie [Corridorsjablonen en terreinsjablonen](topic:corridor-templates).

### Tekenen

- **Snaps.** De hulpmiddelen Tracé, Vlak, Perceel, Massa, Elementlijn, Meten, Grens en Afvoergebied snappen naar opmetingspunten, PI's, hoeken, hoekpunten en constructies, met een label naast de markering. Houd {{key:Alt}} ingedrukt voor een vrij punt.
- **Kiesknoppen, raaklijn en verplaatsen, kopiëren, roteren.** Vlak-, perceel- en elementlijnhoeken hebben getypte vakken voor Easting en Northing en een kiesknop met kruishaar. Eigenschappen heeft ook {{ui:Raaklijn vanuit twee punten}} voor tracés en {{ui:Verplaatsen, kopiëren en roteren}} voor tracés, vlakken, percelen en elementlijnen. Zie [Tekenen met snaps, gekozen hoeken en verplaatsen, kopiëren, roteren](topic:draft-with-snaps).
- **Renderweergave in 3D.** De knop {{ui:Renderen}} op de 3D-balk tekent het land met natuurlijke kleuren, lucht, nevel en zachte schaduwen. Het verandert het model niet. Het menu {{ui:Zon}} heeft nu de knoppen {{ui:Toepassen}} en {{ui:Sluiten}}. Zie [Het terrein in 3D bekijken](topic:site-3d).
- **Panelen openen één sectie tegelijk.** Het linkerpaneel en het paneel Eigenschappen openen één sectie en sluiten de andere, en de tegels van het lint Landschap die meerdere hulpmiddelen bevatten, zijn gesplitste knoppen.

### GIS-analyse

- **Analyseren.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Analyseren}} biedt buffer, overlay, ruimtelijke koppeling, selecteren op attribuut of vorm, en meten. Elk hulpmiddel maakt een nieuwe laag in één stap ongedaan maken.
- **Attributentabel.** Het menu met de drie puntjes van een laag heeft {{ui:Attributentabel…}} en {{ui:Opmaak op basis van attribuut…}}. Zie [GIS-lagen analyseren](topic:gis-analysis) en [Werken met de attributentabel van een laag](topic:gis-table).

### Het terrein: zon, zonne-energie, comfort en wind

- **Sectie Omgeving.** Selecteer een massa: de sectie {{ui:Omgeving}} staat onder {{ui:Zonuren}} in de eigenschappen ervan. Die heeft een schaduwstudie (kaart, tabel, animatie, CSV), zonne-opbrengst uit een weerbestand van een typisch jaar (.epw) en buitencomfort (UTCI).
- **Wind, alleen als screening.** {{ui:Windstudie uitvoeren}} kleurt de grond van zitten tot oncomfortabel voor elke windrichting in het weerbestand. Het is niet gevalideerd en het paneel zegt dat ook.
- **Add-on Windvoetgangers (OpenFOAM).** Uit tot u hem inschakelt onder {{ui:Instellingen}} › {{ui:Add-ons}}. OpenFOAM is software die u zelf installeert. Zie [Schaduw, zonne-opbrengst en buitencomfort](topic:environment).

### Puntenwolken (add-on)

- Schakel {{ui:Puntenwolken}} in onder {{ui:Instellingen}} › {{ui:Add-ons}}; er verschijnt een tabblad Puntenwolken in het paneel rechts. Open een LAS- of LAZ-bestand, maak het schoon, sorteer het in grond, begroeiing en gebouwen, bouw het terrein, de hoogtelijnen en volumes, en exporteer LAS of LAZ. Zie [Puntenwolken van een drone of scanner](topic:point-clouds).

### WaterCraft (add-on)

- Schakel {{ui:WaterCraft (waterdistributie)}} in onder {{ui:Instellingen}} › {{ui:Add-ons}}; er verschijnt een tabblad WaterCraft. Het heeft afnames van klanten, brandweerdebiet bij elke brandkraan, welke uitval van een hoofdleiding het zwaarst weegt, en waterleeftijd en chloor, elk opgeslagen als CSV. Zie [WaterCraft: afnames, brandweerdebiet, uitval en waterleeftijd](topic:watercraft).

### Samenwerken

- In een Live-sessie ziet u elkaars aanwijzers en namen in het plan. Planten uit de bibliotheek: CivilCraft Landschap begint met de standaardcollectie van de bibliotheek, {{ui:CivilCraft landschap}}.

## In elke app

- Hints worden getoond als Bootstrap-tooltips, en de starttip kan worden gesloten.
- De tabbladenbalk van een paneel die niet past, scrolt in plaats van afgesneden te worden.
- Titels van browsertabbladen luiden `<document> - CivilCraft | CadCraft`.
- {{ui:Instellingen}} heeft een sectie Indeling, waarbij de indelingen een keuzelijst zijn met keuzes van twee regels.
- Eenheden voor gewicht en temperatuur staan onder {{ui:Instellingen}} › {{ui:Algemeen}} › {{ui:Eenheden}}.
- De taallijst toont de talen waarvoor de build bestanden heeft. Talen anders dan Engels zijn machineconcepten.

## Opgelost

- De add-ons voor adreszoeken en de EnergyPlus-controle konden niet worden ingeschakeld; nu kan dat wel.
- De help zegt nu dat de add-on Puntenwolken een schoongemaakte wolk schrijft als LAS 1.4 of LAZ.
- Klikken op het eigen handvat van het geselecteerde object start niet langer een handvatsleep die een wachtende Kies stopte.

## Eerlijke beperkingen

- De voorbeeldcorridorsjablonen zijn aanduidingen zonder norm; een ingenieur moet ze controleren. Terreinsjablonen voegen geen oppervlak toe en worden niet in 3D of in de dwarsdoorsnedeweergave getekend. De tweede corridor op een tracé zit niet in de IFC-export. Er is geen overgang tussen twee sjablonen per stationering.
- Puntenwolken zijn getest op verzonnen bestanden, niet op een echte drone-opmeting. Alleen LAS en LAZ worden gelezen.
- GIS-analyse is getest op verzonnen lagen.
- Schaduw, zon en comfort zijn schattingen voor planning; wind is een niet-gevalideerde screening. Geen daarvan is een ontwerpwaarde.
- WaterCraft is een rekenhulp, gecontroleerd op verzonnen netwerken. Een waterbouwkundige bepaalt wat de getallen waard zijn.
- Talen anders dan Engels zijn machineconcepten.
- Windows-installatieprogramma's zijn niet voorzien van een codesignatuur, en het macOS-schijfbeeld is niet genotariseerd.

## Eerder: 0.8 en 0.8.1

Dit is wat er is veranderd in CivilCraft 0.8 (2026-11-01) en 0.8.1 (2026-11-02), vergeleken met 0.7. De grote nieuwe onderdelen zijn hulpmiddelen die uw grading en uw terrein testen (regen, grondbalans, routes, bassins, voortgang) en zes rekenvensters voor grond, wegen, opmeting, mijnen, verbindingen en spoor.

### Nieuw

**Uw grading testen**

- **Laat het regenen.** {{ui:Laat het regenen…}} (onder {{ui:Oppervlak}}) laat een bui vallen op het gegradeerde terrein. U ziet het water van de vlakken aflopen, zich verzamelen in de lage hoeken en de bassins die te klein zijn overlopen. De run is geanimeerd en geeft de volumes, de piekafvoer en een CSV van elk bassin. De standaardcel is grof zodat een eerste blik snel gaat; een fijnere cel is trager. Bassins die overlopen, verschijnen ook in het paneel Problemen.
- **Grondbalans.** {{ui:Grondbalans…}} verhoogt of verlaagt een vlak tot ontgraving gelijk is aan ophoging, en toont de transporttabel tussen beide.
- **Beste route.** {{ui:Beste route…}}: kies een begin en een eind, en CivilCraft zoekt het goedkoopste pad over het terrein dat binnen uw grenzen voor helling en bocht blijft, en maakt daaruit een tracé.
- **Retentiebassins.** {{ui:Retentiebassins…}} berekent peil en opslag uit uw grond, neemt afvoerinrichtingen (opening, overlaat, V-overlaat, noodoverlaat), routeert een bui door het bassin en controleert de piek die wordt tegengehouden, de tijd tot het bassin leegloopt en de vrijboord.
- **Voortgang uit opmetingen.** {{ui:Voortgang uit opmetingen…}} vergelijkt oppervlakken van drones of scans van verschillende data met het terrein zoals het was en met het ontwerp: procent voltooid op volume, te diep en te hoog gegraven gebieden, stapels grond, en wanneer het werk bij dit tempo klaar is (als schatting gemarkeerd).

**Het terrein kennen**

- **Adres naar terrein.** {{ui:Adres naar terrein…}} brengt open gegevens over percelen, gebouwen, bestemming, bodem, overstroming en terrein op één terrein samen. U kunt het terrein in het projectbestand bewaren: het ingetypte adres, elke bron met de dag waarop u hem ophaalde en zijn licentie, en wat er terugkwam. Heropen of deel het project en het terrein is er nog, zonder dat er opnieuw iets wordt opgehaald. U kunt het ook opslaan als terreinbestand of naar BimCraft sturen. Zie [Adres naar terrein](topic:address-to-site).

**Grond, wegen, opmeting, mijnen, verbindingen en spoor**

- **Bodem en hellingen.** {{ui:Bodem en hellingen…}} tekent het bodemprofiel tussen boringen die u intypt. De methode van Bishop zoekt daarna de kritieke cirkel op uw terrein, met een grondwaterpeil, een extra belasting en een aardbevingscoëfficiënt; zetting van een fundering krijgt consolidatie, directe zetting en tijd.
- **Kruispunten en markering.** {{ui:Kruispunten en markering…}} zet takken samen met stoepbochten (één straal per tak, of bochten met drie middelpunten), de zichtafstand voor de ontwerpsnelheid, een controle van de zichtdriehoeken, zebrapaden, stopstrepen, markeringen en borden met een bordenlijst. Ze worden op het plan getekend en opgeslagen als .dxf met benoemde lagen.
- **Vereffening van opmeting.** {{ui:Vereffening van opmeting…}} voert een vereffening volgens de kleinste kwadraten uit van een polygoon of netwerk: vereffende coördinaten, foutellipsen, de chi-kwadraattoets en een markering op de meting die niet past. Vrije netwerken, het sluiten van een polygoon met de kompasregel en RW5-, GSI-, JobXML- of CSV-veldbestanden zijn inbegrepen, en de vereffende punten worden als CSV opgeslagen.
- **Open pits.** {{ui:Open pits…}} zet boormonsters om in een blokmodel en de uiteindelijke put binnen uw taludhoek, met de strip-ratio, een tabel per bank en een gehalte- en tonnagecurve. Geneste putten op basis van een opbrengstfactor en een productieplanning met een verdisconteerde kasstroom zijn er ook.
- **Radioverbindingen.** {{ui:Radioverbindingen…}} controleert het zichtlijn over uw terrein met de bolling van de aarde, de eerste Fresnelzone, het linkbudget, de fademarge en de uitval door meerpadontvangst, en geeft de masthoogte die het pad vrij zou maken. Het doet ook glasvezelverliesbudgetten, hoeveelheden voor routes en de wind op een mast.
- **Spoorwissels.** {{ui:Spoorwissels…}} maakt een wissel uit het nummer van de wisselneus, kruisingssporen tussen evenwijdige sporen en een profielspeling die door de overhoging is gekanteld en in een bocht is verbreed. Een wissel kan op een station van een tracé staan.

Zie [Grond, wegen, opmeting, mijnen, verbindingen en spoor](topic:soils-roads-survey-mines-links).

### In elke app

- **Talen.** 54 talen, waarvan tien nieuw. Talen anders dan Engels zijn machineconcepten tot een moedertaalspreker ze leest. Help-onderwerpen zijn grotendeels nog Engels.
- **Werkbalkrijen.** {{ui:Instellingen}} › {{ui:Algemeen}} › {{ui:Werkbalkrijen}}: Terugloop (zoals voorheen), 2 rijen of 1 rij. Het lint van CivilCraft toont het meest gebruikte hulpmiddel groot, de volgende klein, en de rest achter de pijl van de groepsnaam.
- **Invoerapparaten.** Trackpad, pen, 3D-muis, controller en MIDI kunnen de apps bedienen.
- **Problemen.** Een paneel Problemen dat in elke app waarschuwt, met controles die regelpakketten lezen.
- **Live.** Een weergave van wie waar is in een Live-sessie.
- **Add-ons.** Een lijst met add-ons, met add-ons voor verlichting.
- **Verbind uw AI.** Elke assistent die u verbindt, kan de hulpmiddelen van CivilCraft aansturen. Er staat een opmerking bij dat verbinden met één klik in CadCraft Studio en de gehoste connector nog niet klaar zijn. Zie [Laat een AI-assistent met uw terrein werken](topic:assistants).

### Opgelost in 0.8.1

- **Sectie DWG-klassen.** Die werd als het verkeerde type gelezen (GitHub cadcraft#5). Opgelost in CivilCraft, samen met CadCraft, BimCraft, ModelCraft en TakeoffCraft.
- **Taal wisselen terwijl het programma draait.** CadCraft Studio en de verpakte edities kunnen tijdens het draaien van taal wisselen. Vroeger was dat alleen Engels. Nog niet op elk platform getest: laat ons weten als de taal niet verandert.

### Nog niet in deze versie

- **Dit zijn rekenhulpen.** Elk resultaat in de nieuwe vensters heeft een controle door een ingenieur nodig. Sterkten van bodem beginnen bij typische waarden voor de bodemgroep, en het venster zegt dat.
- **Laat het regenen.** Een run op het voorbeeldterrein kan in de browser bij een fijne cel meer dan twee minuten duren. Het is gecontroleerd met handgevallen en een V-vormig afvoergebied, nog niet op een echt gegradeerd terrein.
- **Adres naar terrein.** Het leest open gegevensbestanden die u aanlevert, en is alleen getest op onze eigen bestanden. Bomen zijn geen bron. Het ophalen van bronnen voor u wacht op de privacytekst.
- **Voortgang uit opmetingen.** Alleen getest op verzonnen opmetingen. Voortgang op bladen en markeringen (MarkupCraft) en vergelijken van scan met model (BimCraft) zijn niet gebouwd.
- **Bodem en hellingen.** Alleen cirkelvormige oppervlakken: geen wig- of blokzoektocht en geen trekscheur.
- **Kruispunten.** Één straal per tak, geen geveegde paden van vrachtwagens, en ze gaan nog niet in de corridor.
- **Veldbestanden.** De lezers zijn geschreven op basis van openbare formaatbeschrijvingen en getest op bestanden die wij maakten. Echte bestanden van meetinstrumenten zijn gewenst.
- **Verbindingen en spoor.** Radioverbindingen: alleen vrije-ruimteverlies en meerpadontvangst (geen regenvervaging of antennepatronen), en geen spoorstandaard: elke spoorgrens is een aanduiding, met conceptgetallen die geen spoorwegingenieur heeft gecontroleerd.
- **Windows en macOS.** 0.8 heeft geen codesignatuur. Windows kan waarschuwen, en macOS vraagt om met de rechtermuisknop te klikken en daarna Openen.

Al het andere staat in [Nog niet beschikbaar](topic:not-built-yet). Voor de eerdere uitgave, zie [Wat is er nieuw in 0.7](topic:whats-new-0-7).
