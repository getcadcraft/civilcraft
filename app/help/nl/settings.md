---
title: CivilCraft-instellingen
summary: Kies de kolomvolgorde voor gekopieerde en geplakte puntrijen en voor het raden van de kolommen van een bestand, hoe geplakte punten worden genummerd, wat puntlabels tonen, de hoekindicator, de verticale overdrijving in 3D, hoe breedte- en lengtegraad worden getoond, en of kaartlagen van internet komen.
keywords: instellingen, voorkeuren, pnezd, penzd, kolomvolgorde, puntrijen, hernummeren, puntnummers, startnummer, puntlabels, labels, beschrijving, hoogte, oriëntatiekubus, assenpictogram, hoekindicator, kompas, verticale overdrijving, 3d, breedtegraad, lengtegraad, dms, decimale graden, kaartlagen, internet, privacy
from: 64b9cb92
---

Open {{ui:Instellingen}} met het tandwiel in de appbalk of met {{key:Mod+,}}. Het eerste tabblad, {{ui:CivilCraft}}, bevat de instellingen die bij deze app horen; {{ui:Algemeen}} bevat de instellingen die elke CadCraft-app deelt (thema, werkbalk, paneel). CivilCraft-instellingen bestaan alleen in de app: u wijzigt ze hier, en deze browser onthoudt ze. {{ui:CivilCraft-instellingen opnieuw instellen}} zet elke instelling terug naar de startwaarde.

## Puntrijen

**P, N, E, Z, D** (de start) of **P, E, N, Z, D**: punt, noorden, oosten, hoogte, beschrijving, of oosten vóór noorden. Het wordt op drie plaatsen gebruikt:

- **Kopiëren**: de rijen die CivilCraft op het klembord zet voor een spreadsheet.
- **Plakken**: rijen die uit een spreadsheet of tekstbestand zijn geplakt zonder kopregel.
- **Importeren**: de gok in het dialoogvenster **Punten importeren** wanneer een bestand geen kopregel heeft (een bestand met vier kolommen wordt als PENZ gelezen, met drie als ENZ). Zie [Formaten van puntbestanden](topic:point-file-formats).

Een kopregel die de kolommen benoemt, wint altijd, en dat geldt ook voor een keuze in de lijst **Kolommen** van het importvenster.

## Nummers voor geplakte punten

- **Vrije nummers behouden** (de start): een geplakt punt houdt zijn nummer wanneer geen ander punt het heeft; alleen botsende punten krijgen een nieuw nummer.
- **Altijd nieuwe nummers**: elk geplakt punt krijgt een nieuw nummer, zelfs als zijn eigen nummer vrij is.

**Nieuwe nummers beginnen bij**: laat leeg om te tellen vanaf één hoger dan het hoogste nummer in gebruik. Typ een nummer, bijvoorbeeld 5000, om nieuwe punten nummers vanaf 5000 te geven; nummers die al in gebruik zijn, worden overgeslagen. Twee punten delen op beide manieren nooit een nummer. Zie [Meetpunten selecteren, kopiëren en plakken](topic:copy-paste-points#point-numbers-never-clash).

## Puntlabels

Wat een puntlabel toont wanneer {{ui:Puntlabels}} aan staat onder **Weergave**: **Nummer**, **Nummer en hoogte** of **Nummer, hoogte en beschrijving** (de start). De DXF-, DWG- en PDF-exports tonen dezelfde labels als het scherm.

## Hoekindicator

Wat er in de hoek van het plan en van de 3D-weergave staat: **Kubus (weergave)** (de start), **Assenpictogram** of **Geen**.

- **Kubus (weergave)** (rechtsboven). Op het plan toont ze de bovenkant, met de kompasring: N is het rasternoorden (omhoog in het plan). Klik op een andere zijde, rand of hoek van de kubus, of sleep hem, en de [3D-weergave](topic:site-3d) opent vanuit die richting. {{ui:Start}} op de plankubus past het plan erin.
- In de 3D-weergave draait de kubus mee met de weergave: klik op een zijde, rand of hoek om vanaf daar te kijken, sleep de kubus om te draaien, sleep de kompasring om om de verticale as te draaien, klik op een letter om vanaf die zijde te kijken, en gebruik {{ui:Start}} voor de isometrische weergave van het hele terrein. Kijkt u recht op een zijde, dan gaan de kleine pijlen naar de volgende zijde en draaien de gebogen pijlen de weergave een kwartslag.
- **Assenpictogram** (linksonder): een kleine markering X (oost) en Y (noord) op het plan, X, Y en Z (omhoog) in 3D.

## 3D-verticale overdrijving

Hoeveel de 3D-weergave de hoogtes uitrekt: **1×**, **2×** (de start), **3×**, **5×** of **10×**. De lijst op de balk van de 3D-weergave is dezelfde instelling, dus wijzigen van een van beide wijzigt beide. Volumes, profielen en 3D-exports blijven op ware schaal.

## Breedtegraad en lengtegraad

Hoe de statusbalk de breedte- en lengtegraad van de aanwijzer toont wanneer het project een coördinatenstelsel heeft: **graden, minuten en seconden** (de start, bijvoorbeeld `30°18′00.00″ N`) of **decimale graden** (`30.300000° N`). Zie [Het coördinatenstelsel van het project instellen](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Kaartlagen van internet

**Uit** (de start) of **Aan**. Wanneer aan, vraagt CivilCraft aan de kaartservers die u toevoegt om beelden van het gebied op het scherm. Uw tekening blijft op deze computer; de server ziet het gebied en uw internetadres. Zolang het uit staat, wordt geen kaartserver iets gevraagd, zelfs niet wanneer een project dat u opent er een noemt; een georefereerd beeld uit een bestand werkt in beide gevallen. Zie [Kaartlagen onder het plan tonen](topic:map-layers).

## Assistenten

**Laat AI-assistenten en scripts CivilCraft gebruiken** (uit bij de start) laat een assistent op uw computer het geopende terrein bereiken via CadCraft Studio: **Lezen** beschrijft het terrein en geeft punten, terreinhoogten, stations, profielen, volumes en percelen; **Bewerken** laat hem meetpunten selecteren en toevoegen; **Opslaan** en **Exporteren** laten hem het project opslaan en LandXML of DWG schrijven. **Mappen die hij mag gebruiken** (in Studio) zijn waar hij mag opslaan en exporteren. **Activiteit** toont zijn aanroepen. Zie [Een AI-assistent laten werken met uw terrein](topic:assistants).
