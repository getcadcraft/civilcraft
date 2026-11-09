---
title: Wat is er nieuw in 0.8 en 0.8.1
summary: CivilCraft 0.8 voegt Laat het regenen toe (een stormberekening over uw grading), een grondbalans, een zoeker naar de beste route, retentiebassins, voortgang uit opmetingen, een importeur van adres naar bouwplaats die de bouwplaats in het project bewaart, en vensters voor bodem en hellingen, kruispunten en markering, opmetingsvereffening, dagbouwputten, radioverbindingen en wissels. 0.8.1 repareert hoe DWG-bestanden worden gelezen.
keywords: wat is er nieuw, what's new, uitgavenotities, wijzigingslijst, wijzigingen, 0.8, 0.8.1, versie, nieuwe functies, regen, storm, wateropstapeling, overloop, grondverzet, balans, ontgraving en ophoging, massatransport, beste route, laagste kosten, tracé, retentiebassin, uitlaat, leegloop, vrijboord, voortgang, opmeting, drone, stapel, adres naar bouwplaats, perceel, bodem, overstroming, hellingstabiliteit, Bishop, zetting, kruispunt, markering, borden, zichtafstand, vereffening, kleinste kwadraten, polygoon, dagbouwput, blokmodel, radioverbinding, Fresnel, wissel, dwarsverbinding, talen, problemen, Live, DWG
from: b0932cf0
---

Dit is wat er is veranderd in CivilCraft 0.8 (2026-11-01) en 0.8.1 (2026-11-02), vergeleken met 0.7. De grote nieuwe onderdelen zijn hulpmiddelen om uw grading en uw bouwplaats te testen (regen, grondverzet, routes, bassins, voortgang) en zes rekenvensters voor terrein, wegen, opmeting, mijnen, verbindingen en spoor.

## Nieuw

### Test uw grading

- **Laat het regenen.** {{ui:Make it rain…}} (onder {{ui:Surface}}) laat een storm neerkomen op het aangelegde terrein. U ziet het water van de plateaus afstromen, in de lage hoeken blijven staan en over de bassins lopen die te klein zijn. De berekening is geanimeerd en geeft de volumes, de piekafvoer en een CSV met elk bassin. De standaardcel is grof, zodat een eerste blik snel gaat; een fijnere cel is trager. Bassins die overlopen, verschijnen ook in het paneel Problemen.
- **Grondbalans.** {{ui:Earthwork balancer…}} verhoogt of verlaagt een plateau tot ontgraving gelijk is aan ophoging, en toont de massabalanstabel ertussen.
- **Beste route.** {{ui:Best route…}}: kies een begin en een eind, dan zoekt CivilCraft het goedkoopste pad over het terrein dat binnen uw helling- en boogbeperkingen blijft, en maakt daaruit een tracé.
- **Retentiebassins.** {{ui:Detention ponds…}} berekent peil en berging uit uw terrein, neemt uitlaatvoorzieningen mee (opening, overlaat, V-keep, overlaatgoot), laat een bui door het bassin lopen en controleert de tegengehouden piek, de leeglooptijd en de vrijboord.
- **Voortgang uit opmetingen.** {{ui:Progress from surveys…}} vergelijkt drone- of scanoppervlakken van verschillende data met het terrein zoals het was en met het ontwerp: percentage gereed op volume, te diep en te hoog opgehoogde gebieden, stapels, en wanneer het werk in dit tempo klaar is (gemarkeerd als schatting).

### Ken de bouwplaats

- **Adres naar bouwplaats.** {{ui:Address to site…}} brengt open gegevens van perceel, gebouw, bestemming, bodem, overstroming en terrein samen op één bouwplaats. U kunt de bouwplaats in het projectbestand bewaren: het ingetypte adres, elke bron met de dag waarop u die hebt opgehaald en de licentie, en wat er terugkwam. Open het project opnieuw of deel het, dan is de bouwplaats er nog, zonder dat er opnieuw iets wordt opgehaald. U kunt het ook opslaan als bouwplaatsbestand of naar BimCraft sturen. Zie [Adres naar bouwplaats](topic:address-to-site).

### Terrein, wegen, opmeting, mijnen, verbindingen en spoor

- **Bodem en hellingen.** {{ui:Soils and slopes…}} tekent het grondprofiel tussen de boringen die u invoert. De Bishop-methode zoekt daarna de kritieke cirkel in uw terrein, met een grondwaterstand, een bovenbelasting en een aardbevingscoëfficiënt; zetting van een fundering krijgt consolidatie, directe zetting en tijd.
- **Kruispunten en markering.** {{ui:Junctions and striping…}} voegt takken samen met boordstenenbochten (één radius per tak, of driecentrische bochten), de zichtafstand voor de ontwerpsnelheid, een controle van de zichtdriehoeken, oversteekplaatsen, stopstrepen, markeringen en verkeersborden met een bordenstaat. Ze worden in het plan getekend en opgeslagen als .dxf met benoemde lagen.
- **Opmetingsvereffening.** {{ui:Survey adjustment…}} voert een vereffening volgens de kleinste kwadraten uit van een polygoon of netwerk: vereffende coördinaten, foutellipsen, de chi-kwadraattoets en een markering bij de meting die niet past. Vrije netwerken, het sluiten van een polygoon met de kompasregel en veldbestanden RW5, GSI, JobXML of CSV zijn inbegrepen, en de vereffende punten worden opgeslagen als CSV.
- **Dagbouwputten.** {{ui:Open pits…}} zet boormonsters om in een blokmodel en de uiteindelijke dagbouwput binnen uw hellingshoek, met de ontgravingsverhouding, een tabel per bank en een gehalte- en tonnagecurve. Geneste dagbouwputten op basis van de opbrengstfactor en een productieplanning met een verdisconteerde kasstroom zijn er ook.
- **Radioverbindingen.** {{ui:Radio links…}} controleert het zicht over uw terrein met de aardkromming, de eerste Fresnelzone, de linkbudget, de fademarge en multipath-uitval, en geeft de masthoogte die het pad vrijmaakt. Ook doet het glasvezelverliesbudgetten, routehoeveelheden en de wind op een toren.
- **Wissels.** {{ui:Rail turnouts…}} maakt een wissel op basis van zijn hartstuknummer, dwarsverbindingen tussen parallelle sporen en een profielvrije ruimte die door de overhoging wordt gekanteld en in een boog wordt verbreed. Een wissel kan op een station van een tracé liggen.

Zie [Bodem, kruispunten, opmetingsvereffening, dagbouwputten, radioverbindingen en wissels](topic:soils-roads-survey-mines-links).

## In elke app

- **Talen.** 54 talen, waarvan tien nieuw. Andere talen dan Engels zijn machinale concepten totdat een moedertaalspreker ze heeft gelezen. Helponderwerpen zijn nog grotendeels in het Engels.
- **Werkbalkrijen.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Terugloop (zoals voorheen), 2 rijen of 1 rij. Het lint van CivilCraft toont het meest gebruikte hulpmiddel groot, de volgende klein, en de rest achter de pijl van de groepsnaam.
- **Invoerapparaten.** Trackpad, pen, 3D-muis, controller en MIDI kunnen de apps bedienen.
- **Problemen.** Een paneel Problemen dat in elke app waarschuwt, met controles die regelgevingspakketten lezen.
- **Live.** Een weergave van wie waar is in een Live-sessie.
- **Add-ons.** Een overzicht van add-ons, met verlichtings-add-ons.
- **Verbind uw AI.** Elke assistent die u koppelt, kan de hulpmiddelen van CivilCraft aansturen. Er wordt bij vermeld dat koppelen met één klik binnen CadCraft Studio en de gehoste connector nog niet beschikbaar zijn. Zie [Laat een AI-assistent met uw bouwplaats werken](topic:assistants).

## Opgelost in 0.8.1

- **Sectie DWG-klassen.** Het werd als het verkeerde type gelezen (GitHub cadcraft#5). Opgelost in CivilCraft, samen met CadCraft, BimCraft, ModelCraft en TakeoffCraft.
- **Taal wisselen tijdens het draaien.** CadCraft Studio en de verpakte edities kunnen de taal tijdens het draaien wijzigen. Voorheen waren ze alleen in het Engels. Nog niet op elk platform getest: laat ons weten als de taal niet verandert.

## Nog niet beschikbaar in deze versie

- **Dit zijn rekenhulpmiddelen.** Elk resultaat in de nieuwe vensters heeft een controle door een ingenieur nodig. Grondsterktes beginnen bij typische waarden voor de grondgroep, en het venster zegt dat.
- **Laat het regenen.** Een berekening op het voorbeeldterrein kan in de browser bij een fijne cel meer dan twee minuten duren. Ze is gecontroleerd met handmatige gevallen en een V-vormig stroomgebied, nog niet op een echte aangelegde bouwplaats.
- **Adres naar bouwplaats.** Het leest open databestanden die u meebrengt, en is alleen getest op onze eigen bestanden. Bomen zijn geen bron. Het ophalen van bronnen voor u wacht op de privacytekst.
- **Voortgang uit opmetingen.** Alleen getest op verzonnen opmetingen. Voortgang op bladen en markups (MarkupCraft) en scan tegen model (BimCraft) zijn nog niet beschikbaar.
- **Bodem en hellingen.** Alleen cirkelvormige oppervlakken: geen wig- of blokzoektocht en geen trekscheur.
- **Kruispunten.** Eén radius per tak, geen afgelegde paden van vrachtwagens, en ze gaan nog niet in de corridor.
- **Veldbestanden.** De lezers zijn geschreven op basis van openbare formaatbeschrijvingen en getest op bestanden die we zelf maakten. Echte instrumentbestanden zijn welkom.
- **Verbindingen en spoor.** Radioverbindingen: alleen vrije-ruimteverlies en multipath (geen regenfading of antennepatronen), en geen spoornorm: elke spoorlimiet is een tijdelijke invulling, met conceptgetallen die geen spoorwegingenieur heeft gecontroleerd.
- **Windows en macOS.** 0.8 is niet code-ondertekend. Windows kan waarschuwen, en macOS vraagt om met de rechtermuisknop te klikken en dan Open te kiezen.

Al het andere staat in [Nog niet beschikbaar](topic:not-built-yet). Voor de vorige uitgave, zie [Wat is er nieuw in 0.7](topic:whats-new-0-7).
