---
title: Wat is er nieuw in 0.9 (eerder)
summary: Corridor- en terreinsjablonen, snappen en Kiezen-knoppen bij het tekenen, GIS-analyse met een attributentabel, schaduw, zonneopbrengst, comfort- en windstudies voor een terrein, een 3D-renderweergave, en de add-ons Puntenwolken en WaterCraft.
keywords: wat is er nieuw 0.9, eerdere uitgave, wat is er nieuw, 0.9, releasenotities, corridorsjablonen, terreinsjablonen, sjabloneneditor, dwarsprofiel, meerdere corridors, snap, snappen, kiezen, verplaatsen, kopiëren, roteren, raaklijn, render, 3d-render, gis-analyse, buffer, overlay, ruimtelijke samenvoeging, attributentabel, opmaak op attribuut, schaduwstudie, zonneopbrengst, utci, buitencomfort, windstudie, openfoam, puntenwolken, las, laz, watercraft, brandweerdebiet, brandkraan, waterleeftijd, chloor, vragen, infotips, indeling, wat is er nieuw, releasenotities, changelog, wijzigingen, 0.8, 0.8.1, versie, nieuwe functies, regen, riolering, ponding, overstorten, grondverzet, balans, ontgraving en ophoging, aanvoer, beste route, minste kosten, tracé, retentiebassin, uitstroom, leegloop, vrijboord, voortgang, opmeting, drone, stapel, adres naar terrein, perceel, bodem, overstroming, taludstabiliteit, bishop, zetting, kruispunt, markering, borden, zichtafstand, vereffening, kleinste kwadraten, polygoon, open mijn, blokmodel, radioverbinding, fresnel, wissel, kruisingspoor, talen, problemen, live, dwg
from: 4664522c
---

Dit is wat er is veranderd in CivilCraft 0.9, vergeleken met 0.8.1. CivilCraft 0.9 maakt deel uit van CadCraft Studio 0.9 en zijn acht apps. De grote onderdelen zijn corridor- en terreinsjablonen, snappen tijdens het tekenen, GIS-analyse, studies van de zon, zonneopbrengst, comfort en wind op een terrein, en twee add-ons: Puntenwolken en WaterCraft.

## Nieuw

### Corridor- en terreinsjablonen

- **Corridorsjablonen.** Open {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Corridorsjablonen…}} (of typ {{cmd:TEMPLATES}}). Een sjabloon is een klein dwarsprofiel met onderdelen, offsets, hellingen, materialen en puntcodes. Bewaar ze in het project, in {{ui:Mijn bibliotheek}} of als een `.cctemplates.json`-bestand. De sjabloneneditor toont een tekening op ware schaal en somt problemen op terwijl u typt.
- **Opbouwen uit sjablonen per station.** Selecteer een tracé en zet {{ui:Bouwen vanuit sjablonen per stationering}} aan in zijn Eigenschappen. Elke zijde van elk gebied heeft zijn eigen verhardingslijst en zijn eigen eindconditie. {{ui:Corridor toevoegen}} onder {{ui:Corridors op dit tracé}} zet meerdere corridors op één tracé.
- **Terreinsjablonen.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Terreinsjablonen…}} (of typ {{cmd:TERRAINTEMPLATES}}) legt gelaagde materialen zoals teelaarde of verharding en fundering op een terrein, met oppervlakte en volume per laag. Zie [Corridorsjablonen en terreinsjablonen](topic:corridor-templates).

### Tekenen

- **Snappen.** De tools Tracé, Plateau, Perceel, Massa, Elementlijn, Meten, Grens en Stroomgebied snappen op opmeetpunten, PI's, hoeken, hoekpunten en constructies, met een label bij de markering. Houd {{key:Alt}} ingedrukt voor een vrij punt.
- **Kies-knoppen, raaklijn en verplaatsen, kopiëren, roteren.** Plateau-, perceel- en elementlijnhoeken hebben getypte Easting- en Northing-vakjes en een Kies-knop met kruishaar. Eigenschappen heeft ook {{ui:Raaklijn vanuit twee punten}} voor tracés en {{ui:Verplaatsen, kopiëren en roteren}} voor tracés, plateaus, percelen en elementlijnen. Zie [Tekenen met snappen, gekozen hoeken en verplaatsen, kopiëren, roteren](topic:draft-with-snaps).
- **Renderweergave in 3D.** De knop {{ui:Renderen}} op de 3D-balk tekent het land met natuurlijke kleuren, lucht, nevel en zachte schaduwen. Het verandert het model niet. Het menu {{ui:Zon}} heeft nu knoppen {{ui:Toepassen}} en {{ui:Sluiten}}. Zie [De locatie in 3D bekijken](topic:site-3d).
- **Panelen openen één sectie tegelijk.** Het linkerpaneel en het paneel Eigenschappen openen één sectie en sluiten de andere, en de lintvakken van Landschap die meerdere tools bevatten zijn gesplitste knoppen.

### GIS-analyse

- **Analyseren.** {{ui:Oppervlak}} › {{ui:Meer}} › {{ui:Analyseren}} biedt buffer, overlay, ruimtelijke samenvoeging, selecteren op attribuut of vorm, en meten. Elke tool maakt een nieuwe laag in één stap voor Ongedaan maken.
- **Attributentabel.** Het menu met de drie puntjes van een laag heeft {{ui:Attributentabel…}} en {{ui:Opmaak op basis van attribuut…}}. Zie [GIS-lagen analyseren](topic:gis-analysis) en [Werken met de attributentabel van een laag](topic:gis-table).

### Het terrein: zon, zonneopbrengst, comfort en wind

- **Omgevingssectie.** Selecteer een massa: de sectie {{ui:Omgeving}} staat onder {{ui:Zonuren}} in zijn Eigenschappen. Die heeft een schaduwstudie (kaart, tabel, animatie, CSV), zonneopbrengst uit een weerbestand van een typisch jaar (.epw) en buitencomfort (UTCI).
- **Wind, alleen als screening.** {{ui:Windstudie uitvoeren}} kleurt het terrein van zitten tot onaangenaam voor elke windrichting in het weerbestand. Die is niet gevalideerd en het paneel zegt dat.
- **Add-on voor windstroming op voetgangersniveau (OpenFOAM).** Uit tot u hem aanzet in {{ui:Instellingen}} › {{ui:Add-ons}}. OpenFOAM is software die u zelf installeert. Zie [Schaduw, zonneopbrengst en buitencomfort](topic:environment).

### Puntenwolken (add-on)

- Zet {{ui:Puntenwolken}} aan in {{ui:Instellingen}} › {{ui:Add-ons}}; een tabblad Puntenwolken verschijnt in het rechterpaneel. Open een LAS- of LAZ-bestand, maak het schoon, sorteer het in grond, vegetatie en gebouwen, bouw het terrein, hoogtelijnen en volumes, en exporteer LAS of LAZ. Zie [Puntenwolken van een drone of scanner](topic:point-clouds).

### WaterCraft (add-on)

- Zet {{ui:WaterCraft (waterdistributie)}} aan in {{ui:Instellingen}} › {{ui:Add-ons}}; een tabblad WaterCraft verschijnt. Het heeft vragen van klanten, brandweerdebiet bij elke brandkraan, welke storing van een hoofdleiding het zwaarst weegt, en waterleeftijd en chloor, elk opgeslagen als CSV. Zie [WaterCraft: afnemers, brandweerdebiet, storingen en waterleeftijd](topic:watercraft).

### Samen werken

- In een Live-sessie ziet u elkaars cursors en namen in het plan. Bibliotheekplanten: CivilCraft Landscape begint met zijn standaardverzameling Bibliotheek, {{ui:CivilCraft-landschap}}.

## In elke app

- Infotips verschijnen als Bootstrap-tooltips, en de starttip kan worden gesloten.
- Een tabbalk van een paneel die niet past, scrolt in plaats van afgesneden te worden.
- Titels van browsertabbladen luiden `<document> - CivilCraft | CadCraft`.
- {{ui:Instellingen}} heeft een sectie Indeling waarin de indelingen een keuzelijst zijn van keuzes van twee regels.
- Eenheden voor gewicht en temperatuur staan in {{ui:Instellingen}} › {{ui:Algemeen}} › {{ui:Eenheden}}.
- De talenlijst toont de talen waarvoor de build bestanden heeft. Talen anders dan Engels zijn machinale concepten.

## Opgelost

- De adreszoek- en EnergyPlus-controle-add-ons konden niet worden aangezet; nu kan dat wel.
- De help zegt nu dat de add-on Puntenwolken een opgeschoonde wolk als LAS 1.4 of LAZ schrijft.
- Klikken op het eigen handvat van het geselecteerde object start niet langer een handvatsleep die een wachtende Kies stopte.

## Eerlijke grenzen

- De voorbeeldcorridorsjablonen zijn tijdelijke waarden zonder norm; een ingenieur moet ze controleren. Terreinsjablonen voegen geen oppervlak toe en worden niet in 3D of in de doorsnedeweergave getekend. De tweede corridor op een tracé zit niet in de IFC-export. Er is geen overgang tussen twee sjablonen per station.
- Puntenwolken zijn getest op verzonnen bestanden, niet op een echte drone-opmeting. Alleen LAS en LAZ worden gelezen.
- GIS-analyse is getest op verzonnen lagen.
- Zon, zonneopbrengst en comfort zijn planningsschattingen; wind is niet-gevalideerde screening. Niets daarvan is een ontwerpwaarde.
- WaterCraft is een rekenhulp, gecontroleerd op verzonnen netwerken. Een waterdeskundige beslist wat de cijfers waard zijn.
- Talen anders dan Engels zijn machinale concepten.
- Windows-installaties zijn niet code-ondertekend, en het macOS-schijfbeeld is niet genotariseerd.

## Eerder: 0.8 en 0.8.1

Dit is wat er is veranderd in CivilCraft 0.8 (2026-11-01) en 0.8.1 (2026-11-02), vergeleken met 0.7. De grote nieuwe onderdelen zijn tools die uw afwerking en terrein testen (regen, grondverzet, routes, bassins, voortgang) en zes rekenvensters voor grond, wegen, opmeting, mijnen, verbindingen en spoor.

### Nieuw

**Test uw afwerking**

- **Laat het regenen.** {{ui:Laat het regenen…}} (onder {{ui:Oppervlak}}) laat een bui vallen op het afgewerkte terrein. U ziet het water van de plateaus afstromen, zich in de lage hoeken verzamelen en de bassins die te klein zijn overlopen. De run is geanimeerd en geeft de volumes, de piekafvoer en een CSV van elk bassin. De standaardcel is grof zodat een eerste blik snel is; een fijnere cel is trager. Bassins die overlopen verschijnen ook in het paneel Problemen.
- **Grondbalans.** {{ui:Grondbalans…}} verhoogt of verlaagt een plateau tot ontgraving gelijk is aan ophoging, en toont de aanvoertabel ertussen.
- **Beste route.** {{ui:Beste route…}}: kies een begin en een eind, en CivilCraft vindt het goedkoopste pad over het terrein dat binnen uw helling- en boogsgrenzen blijft, en maakt daar een tracé van.
- **Retentiebassins.** {{ui:Retentiebassins…}} berekent peil en berging uit uw terrein, neemt uitstroomvoorzieningen (opening, overlaat, V-keep, overloopdrempel), routeert een bui door het bassin en controleert de piekafvoer die wordt tegengehouden, de leegloopduur en de vrijboord.
- **Voortgang uit opmetingen.** {{ui:Voortgang uit opmetingen…}} vergelijkt drone- of scanoppervlakken van verschillende data met het terrein zoals het was en met het ontwerp: percentage voltooid naar volume, te diep en te hoog gegraven gebieden, stapels grond, en wanneer het werk in dit tempo klaar is (als schatting gemarkeerd).

**Ken het terrein**

- **Adres naar terrein.** {{ui:Adres naar terrein…}} brengt open perceel-, gebouw-, bestemmings-, bodem-, overstromings- en terreingegevens samen op één terrein. U kunt het terrein in het projectbestand bewaren: het getypte adres, elke bron met de dag dat u hem ophaalde en zijn licentie, en wat terugkwam. Heropen of deel het project en het terrein is er nog, zonder dat iets opnieuw wordt opgehaald. U kunt het ook als terreinbestand opslaan of naar BimCraft sturen. Zie [Adres naar terrein](topic:address-to-site).

**Grond, wegen, opmeting, mijnen, verbindingen en spoor**

- **Bodem en hellingen.** {{ui:Bodem en hellingen…}} tekent het bodemprofiel tussen boringen die u typt. De methode van Bishop zoekt dan de kritieke cirkel op uw terrein, met een grondwaterspiegel, een extra belasting en een aardbevingscoëfficiënt; zetting van een fundering krijgt consolidatie, directe zetting en tijd.
- **Kruispunten en markering.** {{ui:Kruispunten en markering…}} zet takken samen met kantsteenbogen (één straal per tak, of bogen met drie middelpunten), de zichtafstand voor de ontwerpsnelheid, een controle van de zichttriangels, oversteekplaatsen, stopstrepen, markeringen en borden met een bordenlijst. Ze worden op het plan getekend en als .dxf met benoemde lagen opgeslagen.
- **Opmetingsvereffening.** {{ui:Opmetingsvereffening…}} voert een vereffening volgens de kleinste kwadraten uit van een polygoon of netwerk: vereffende coördinaten, foutellipsen, de chi-kwadraattoets en een markering op de meting die niet past. Vrije netwerken, het sluiten van een polygoon met de kompasregel en RW5-, GSI-, JobXML- of CSV-veldbestanden zijn inbegrepen, en de vereffende punten worden als CSV opgeslagen.
- **Open mijnen.** {{ui:Open mijnen…}} zet boorstalen om in een blokmodel en de uiteindelijke mijn binnen uw taludhoek, met de stripverhouding, een tabel per bank en een gehalte- en tonnagecurve. Geneste mijnen per opbrengstfactor en een productieplanning met een verdisconteerde kasstroom zijn er ook.
- **Radioverbindingen.** {{ui:Radioverbindingen…}} controleert het zicht over uw terrein met de bolling van de aarde, de eerste Fresnel-zone, de verbindingsbalans, de vervagingsmarge en storing door meerweg, en geeft de masthoogte die het traject vrijmaakt. Het doet ook verliesbalansen voor glasvezel, hoeveelheden voor de route en de wind op een mast.
- **Wissels.** {{ui:Wissels…}} maakt een wissel uit zijn hartstukgetal, kruisingssporen tussen evenwijdige sporen, en een profiel van de spoorvrijheid dat door overhoging wordt gekanteld en in een boog wordt verbreed. Een wissel kan op een station van een tracé staan.

Zie [Bodem, kruispunten, opmetingsvereffening, mijnen, radioverbindingen en wissels](topic:soils-roads-survey-mines-links).

### In elke app

- **Talen.** 54 talen, waarvan tien nieuw. Talen anders dan Engels zijn machinale concepten tot een moedertaalspreker ze heeft gelezen. Help-onderwerpen zijn nog grotendeels Engels.
- **Werkbalkrijen.** {{ui:Instellingen}} › {{ui:Algemeen}} › {{ui:Werkbalkrijen}}: Terugloop (zoals voorheen), 2 rijen of 1 rij. Het lint van CivilCraft toont het meest gebruikte hulpmiddel groot, de volgende klein, en de rest achter de pijl van de groepsnaam.
- **Invoerapparaten.** Trackpad, pen, 3D-muis, controller en MIDI kunnen de apps bedienen.
- **Problemen.** Een paneel Problemen dat in elke app waarschuwt, met controles die regelpakketten lezen.
- **Live.** Een weergave van wie waar is in een Live-sessie.
- **Add-ons.** Een lijst van add-ons, met verlichtings-add-ons.
- **Verbind uw AI.** Elke assistent die u verbindt kan de tools van CivilCraft aansturen. Hij komt met een notitie dat verbinden met één klik binnen CadCraft Studio en de gehoste connector nog niet klaar zijn. Zie [Laat een AI-assistent met uw terrein werken](topic:assistants).

### Opgelost in 0.8.1

- **Sectie DWG-klassen.** Die werd als het verkeerde type gelezen (GitHub cadcraft#5). Opgelost in CivilCraft samen met CadCraft, BimCraft, ModelCraft en TakeoffCraft.
- **Taal wisselen tijdens het draaien.** CadCraft Studio en de verpakte edities kunnen tijdens het draaien van taal wisselen. Dat ging vroeger alleen in het Engels. Nog niet op elk platform getest: laat het ons weten als de taal niet verandert.

### Nog niet in deze versie

- **Dit zijn rekenhulpmiddelen.** Elk resultaat in de nieuwe vensters heeft een controle door een ingenieur nodig. Grondsterktes starten van typische waarden voor de grondgroep, en het venster zegt dat.
- **Laat het regenen.** Een run op het voorbeeldterrein kan in de browser meer dan twee minuten duren bij een fijne cel. Het is gecontroleerd tegen handberekeningen en een V-vormig stroomgebied, nog niet op een echt afgewerkt terrein.
- **Adres naar terrein.** Het leest open gegevensbestanden die u aanbrengt, en is alleen getest op onze eigen bestanden. Bomen zijn geen bron. Het ophalen van bronnen voor u wacht op de privacytekst.
- **Voortgang uit opmetingen.** Getest op verzonnen opmetingen alleen. Voortgang op bladen en markeringen (MarkupCraft) en scan tegen model (BimCraft) zijn niet gebouwd.
- **Bodem en hellingen.** Alleen cirkelvormige oppervlakken: geen wig- of blokzoektocht en geen trekscheur.
- **Kruispunten.** Één straal per tak, geen gereden paden van vrachtwagens, en ze gaan nog niet in de corridor.
- **Veldbestanden.** De lezers zijn geschreven op basis van openbare formaatbeschrijvingen en getest op bestanden die we zelf maakten. Echte instrumentbestanden worden gezocht.
- **Verbindingen en spoor.** Radioverbindingen: alleen vrije-ruimteverlies en meerweg (geen regenvervaging of antennepatronen), en geen spoorwegnorm: elke spoorgrens is een tijdelijke waarde, met concept-getallen die geen spoorwegingenieur heeft gecontroleerd.
- **Windows en macOS.** 0.8 is niet code-ondertekend. Windows kan waarschuwen, en macOS vraagt om rechtsklik en daarna Openen.

Alles anders staat in [Nog niet beschikbaar](topic:not-built-yet). Voor de vorige uitgave, zie [Wat is er nieuw in 0.7](topic:whats-new-0-7).
