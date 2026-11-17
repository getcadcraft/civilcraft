---
title: Schaduw, zonneopbrengst en comfort buitenshuis
summary: Bestudeer de schaduw die uw bouwmassa's over een dag of een seizoen werpen, bekijk een animatie ervan, bereken hoeveel elektriciteit zonnepanelen op de daken en wanden in een typisch jaar zouden maken, zie hoe comfortabel de straat naast een gebouw is (UTCI), en krijg een screeningmeting van het windcomfort voor voetgangers.
keywords: schaduwstudie, schaduw, zonuren, animatie, zon, PV, fotovoltaïsch, panelen, opbrengst, kWh, EPW, weerbestand, UTCI, thermisch comfort, comfort buitenshuis, hittestress, wind
from: 96e7af4d
---

De sectie **Omgeving** staat onder **Zonuren** in de **Eigenschappen** van een massa. Hij gebruikt de massa's die u hebt getekend als de gebouwen.

## Een weerbestand laden

Kies een weerbestand van een typisch jaar (**.epw**) voor uw stad. Ze zijn gratis verkrijgbaar bij de EnergyPlus-weersite en bij climate.onebuilding.org. Het bestand blijft voor dit bezoek in uw browser. De zonneopbrengst en de comfortstudie hebben het nodig; de schaduwstudie werkt zonder als het project een coördinatenstelsel heeft.

## Schaduwstudie

Kies een datum (of vink **Seizoen** aan en vul een laatste datum en een stap in dagen in) en een tijdzone, en klik dan op **Schaduwstudie uitvoeren**. U krijgt een kaart van de zonuren, of van de schaduw, op de grond rond de massa's; een tabel van hoeveel van de grond over de dag beschaduwd is; en een animatie van de dag die u kunt afspelen of stap voor stap doorlopen. **Kaart opslaan**, **Animatieframes opslaan** (alle frames op één afbeelding) en **Uren opslaan** (CSV) bewaren de resultaten.

De grond wordt als vlak genomen op het niveau van de laagste massa. Voor schaduw op hellend terrein gebruikt u **Zonuren**, die het terrein leest.

## Zonneopbrengst

Stel het rendement van de panelen in, hoeveel van elk dak en elke wand bedekt is en de systeemverliezen, en klik dan op **Zonneopbrengst uitvoeren**. Voor elk dak en elke wand krijgt u de elektriciteit die een vierkante meter paneel in een typisch jaar zou maken, hoeveel ervan de buurmassa's wegnemen, en een totaal per massa. Het model staat in gewone woorden uitgeschreven naast de knop: het is een planningsschatting op basis van een typisch jaar, geen garantie.

## Comfort buitenshuis

**Comfort uitvoeren** berekent de Universal Thermal Climate Index (UTCI) voor een staande persoon op open grond en naast de eerste massa (zuid-, noord-, oost- en westzijde), met de schaduw van elke massa. Het toont hoeveel van de hemel zichtbaar is, de gemiddelde UTCI overdag, en de uren boven 32 (hittestress) en onder 0 (koudestress).

## Wind (screening)

**Windstudie uitvoeren** berekent de luchtstroming rond uw massa's eenmaal voor elke windrichting die in uw weerbestand waait (4, 8, 12 of 16 richtingen), over de omgeving die u kiest (open land, buitenwijk of stadscentrum), en telt daarna het hele jaarlijkse uurlijkse wind op. De kaart kleurt de grond naar comfortklasse, van groen (**zitten**) via **staan**, **slenteren** en **lopen** naar rood (**onbehaaglijk**): de activiteit waarvan de grenssnelheid (4, 6, 8 en 10 m/s) voor niet meer dan 5 % van de uren wordt overschreden. Een tweede tabel geeft de NEN 8100-klasse (A tot E) op basis van het aandeel uren waarin de wind 5 m/s overschrijdt. De windvlaagfactor vermenigvuldigt het uurgemiddelde om een effectieve windvlaag te geven.

Hoe het werkt, in gewone woorden: een lattice-Boltzmann large-eddy-stromingsoplosser (van ons eigen, in de bibliotheek `lib/wind`) in een doos rond de gebouwen, een windsnelheidsprofiel dat met de hoogte stijgt over de gekozen ruwheid, en de snelheid op ongeveer 1.5 m boven de grond vergeleken met de snelheid stroomopwaarts op 10 m. **Screening** is snel en grof; **Standaard** gebruikt meer cellen en duurt veel langer. Als het paneel zegt dat het raster grof is (minder dan 10 cellen over het hoogste gebouw), of dat de stroming nog veranderde, vertrouw de kaart dan minder.

**Wat dit niet is.** De oplosser is gecontroleerd op leerboekstromingen (een kanaal, een gesloten holte met bewegend deksel) en gedraaid op een kubus om te zien of de windschaduw en de versnelling bij de hoeken er goed uitzien. Hij is **niet** gevalideerd tegen windtunnelmetingen van gebouwen, dus elk resultaat is als ongevalideerd gemarkeerd. Gebruik hem niet voor een ontwerpwaarde, een windbelasting of een vergunningcertificaat: een windexpert moet een goede studie uitvoeren en bevestigen. Het vlakke terrein, gladde gevels, de ruwheidsafkorting van het weerstation en de drempeltabel zijn vereenvoudigingen; de drempelwaarden kunnen verschillen in de criteria van uw overheid.

## Wind met OpenFOAM (add-on)

De ingebouwde windengine hierboven is experimenteel. Voor een echte stromingsoplosser schakelt u de add-on **Voetgangerswind (OpenFOAM)** in via **Instellingen > Add-ons** (hij staat uit tot u dat doet). Het is software met een eigen GPL-licentie, apart gehouden van de rest van CadCraft, en het bevat OpenFOAM niet: dat installeert u zelf. Daarna toont **Engine** in het windblok OpenFOAM als keuze.

Wat u eenmalig instelt:
1. **OpenFOAM installeren** (de ESI v-serie van openfoam.com; de add-on is getest met v2512). Op Ubuntu of Debian (ook binnen WSL op Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, en daarna `sudo apt install openfoam2512-default`. Het installeert onder `/usr/lib/openfoam/openfoam2512`. CadCraft heeft `blockMesh`, `snappyHexMesh` en `simpleFoam` nodig om te draaien. (Het oudere `openfoam` 1912-pakket in het eigen archief van Ubuntu werkt ook, maar de function objects ervan crashen; de add-on leest de resultaatbestanden dan zelf.)
2. **Start de helper** vanuit de map `runner` van de add-on met Node.js: `node cc-openfoam-runner.mjs serve`. Als OpenFOAM niet op het zoekpad staat, geeft u een klein `runner.json` met het pad naar het `etc/bashrc` van OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) en start u hem met `--config runner.json`. De helper luistert alleen op deze computer en toont een token.
3. **Plak het token** in de velden van de add-on in het windblok (het adres blijft `http://127.0.0.1:8765`) en druk op **Helper controleren**.

Daarna werkt **Windstudie uitvoeren** één geval per windrichting in het weerbestand: uw massa's worden een oppervlak (STL) in een doos van de gebruikelijke richtlijn (5 gebouwhoogten rondom en erboven, 10 erachter), gemaasd met blockMesh en snappyHexMesh, gedraaid als stationaire k-epsilon RANS met een atmosferische grenslaaginlaat over de ruwheid die u kiest, en de snelheid op 1.5 m wordt teruggelezen en omgezet naar dezelfde Lawson- en NEN 8100-klassen. Er verlaat niets uw computer.

**Wat is gecontroleerd.** De tekst boven de resultaten zegt dat duidelijk en maakt deel uit van elke opgeslagen CSV. Het schrijven van de cases, het teruglezen van de resultaten en de hele keten van de add-on zijn getest zonder OpenFOAM, en één kubus is door echte OpenFOAM gedraaid op drie maaswijdtes (de getallen staan in de projectnotities). Hij is **niet** gevalideerd tegen windtunnelmetingen van gebouwen. Het is een screeningmeting, geen ontwerpwaarde en geen certificaat. Standaard k-epsilon overschat de turbulentie voor gebouwen, het terrein is vlak, gevels zijn glad en er is geen reliëf of begroeiing.
