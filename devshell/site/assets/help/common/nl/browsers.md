---
title: Browsers en computers
summary: In welke browsers de apps draaien, wat er tussen verschilt en wat uw computer nodig heeft.
keywords: chrome, edge, firefox, safari, brave, browser, mac, windows, linux, ipad, tablet, webgl, vereisten, geheugen
from: a11b09b1
---

De apps draaien in een webbrowser. Ze doen het werk op uw eigen computer: uw bestanden worden daar geopend en nooit naar ons verzonden (zie [Waar uw bestanden naartoe gaan](common:your-files)).

## Welke browser

Gebruik een actuele versie van een van deze:

| Browser | Engine | Opmerkingen |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | De meest complete: mappen kiezen, opslaan voor offline gebruik, bestandsafhandeling. |
| Firefox | Gecko | Werkt. Een hele map openen gebruikt een eenvoudigere kiezer. Offline opslaan werkt mogelijk niet in privévensters. |
| Safari | WebKit | Werkt op Mac en iPad. Een hele map openen gebruikt een eenvoudigere kiezer. Safari kan een offline kopie verwijderen die u enkele weken niet hebt gebruikt. |

Alle drie de engines zijn prima voor dagelijks werk. Waar een app iets anders doet in een ervan, toont de Help de stappen voor uw browser.

## Wat verschilt tussen browsers

- **Een map openen.** Chromium-browsers tonen een echte mapkiezer en kunnen de map rechtstreeks lezen. Firefox en Safari vragen u een map te kiezen en lezen dan elk bestand erin, wat bij grote projectmappen langer duurt; de map naar de app slepen werkt in alle drie.
- **Opslaan.** De apps slaan op door een bestand te downloaden. Uw browser bepaalt waar downloads naartoe gaan en of hij eerst vraagt.

:::chromium
Zet in Chrome of Edge "Vraag waar elk bestand moet worden opgeslagen voordat het wordt gedownload" aan (in Instellingen, onder Downloads) om telkens een map te kiezen.
:::

:::firefox
Open in Firefox Instellingen, dan Algemeen, dan Bestanden en toepassingen, en kies "Altijd vragen waar bestanden moeten worden opgeslagen" om telkens een map te kiezen.
:::

:::safari
Open in Safari Instellingen, dan Algemeen, en stel "Downloadlocatie" in op "Vraag voor elke download" om telkens een map te kiezen.
:::

## Mac, Windows en Linux

De apps zijn op elke computer hetzelfde. Wat verandert is het toetsenbord: sneltoetsen worden automatisch voor uw computer geschreven. Zie [Toetsen, muizen en trackpads](common:keys).

## Tablets en aanraakschermen

Sommige apps accepteren aanraking (één vinger tekent of selecteert, twee vingers knijpen om te zoomen en te verschuiven). De Help van elke app vermeldt of dat zo is. Gebruik op een iPad Safari of Chrome. Een toetsenbord helpt bij apps die getypte opdrachten gebruiken.

## De oudste browser en het oudste systeem

Dit lezen we uit de code van de 0.7-apps, niet uit een gok: elk bestand is geparseerd en elke taalfunctie die erin wordt gebruikt, is opgezocht in de gepubliceerde compatibiliteitsgegevens van de browsers. Onder deze versies kunnen de apps niet eens starten, omdat de browser de code niet begrijpt.

| | Oudste versie die de apps kan starten |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS en iOS 16.4) |

CadCraft Studio heeft onder Windows zijn eigen webengine, dus het vereist Windows 10 of 11; op een Mac gebruikt het die van het systeem, dus het vereist macOS 13.3 of later. Instellingen › Updates in Studio toont waarop uw exemplaar draait.

Dit is de oudste versie die *start*, gelezen uit de code. Het is geen lijst van oude browsers waarin we de apps hebben uitgevoerd, dus een oudere die start, kan nog steeds een functie missen.

## Wat uw computer nodig heeft

Dit zijn geplande minimumeisen voor de apps, geen gemeten vereisten:

- 8 GB geheugen (16 GB wordt aanbevolen voor grote gefedereerde modellen).
- Een grafische chip met WebGL 2 voor de 3D-apps. Als een 3D-weergave leeg blijft, controleer dan of hardwareversnelling aan staat in de instellingen van uw browser.
- Een scherm van minimaal 1280 pixels breed voor de volledige werkbalken; kleinere schermen laten ze omslaan.

Zeer grote bestanden (grote tekeningensets, grote modellen) gebruiken veel geheugen in een browsertabblad. Sluit andere zware tabbladen als een app traag wordt.
