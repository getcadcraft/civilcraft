---
title: Browsere og computere
summary: Hvilke browsere apperne kører i, hvad der adskiller dem, og hvad din computer har brug for.
keywords: chrome, edge, firefox, safari, brave, browser, mac, windows, linux, ipad, tablet, webgl, krav, hukommelse
from: a11b09b1
---

Apperne kører i en webbrowser. De udfører arbejdet på din egen computer: dine filer åbnes dér og sendes aldrig til os (se [Hvor dine filer havner](common:your-files)).

## Hvilken browser

Brug en opdateret version af en af disse:

| Browser | Motor | Bemærkninger |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Den mest komplette: valg af mappe, gemning til offline brug, filhåndtering. |
| Firefox | Gecko | Virker. At åbne en hel mappe bruger en enklere vælger. Offline gemning virker muligvis ikke i private vinduer. |
| Safari | WebKit | Virker på Mac og iPad. At åbne en hel mappe bruger en enklere vælger. Safari kan slette en offlinekopi, du ikke har brugt i nogle uger. |

Alle tre motorer er fine til hverdagsarbejde. Hvor en app gør noget anderledes i en af dem, viser dens hjælp trinene til din browser.

## Hvad der adskiller browserne

- **At åbne en mappe.** Chromium-browsere viser en ægte mappevælger og kan læse mappen direkte. Firefox og Safari beder dig vælge en mappe og læser derefter hver fil i den, hvilket tager længere tid for store projektmapper; at trække mappen over på appen virker i alle tre.
- **Gemning.** Apperne gemmer ved at downloade en fil. Din browser afgør, hvor downloads havner, og om den spørger først.

:::chromium
I Chrome eller Edge slår du »Spørg, hvor hver fil skal gemmes, før den downloades« til (i Indstillinger, under Downloads) for at vælge en mappe hver gang.
:::

:::firefox
I Firefox åbner du Indstillinger, derefter Generelt, derefter Filer og programmer, og vælger »Spørg altid, hvor filer skal gemmes« for at vælge en mappe hver gang.
:::

:::safari
I Safari åbner du Indstillinger, derefter Generelt, og sætter »Placering af download« til »Spørg for hver download« for at vælge en mappe hver gang.
:::

## Mac, Windows og Linux

Apperne er ens på alle computere. Det, der ændrer sig, er tastaturet: genveje skrives automatisk til din computer. Se [Taster, mus og pegefelter](common:keys).

## Tablets og touchskærme

Nogle apps tager imod touch (én finger tegner eller vælger, to fingre knibes for at zoome og panorere). Hver apps hjælp siger, om den gør det. På en iPad bruger du Safari eller Chrome. Et tastatur hjælper i apps, der bruger indtastede kommandoer.

## Den ældste browser og det ældste system

Vi har læst dette i koden til 0.7-apperne, ikke gættet: hver fil blev analyseret, og hver sprogfunktion, den bruger, blev slået op i browsernes offentliggjorte kompatibilitetsdata. Under disse versioner kan apperne ikke engang starte, fordi browseren ikke forstår koden.

| | Ældste version, der kan starte apperne |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS og iOS 16.4) |

CadCraft Studio har sin egen webmotor på Windows, så det kræver Windows 10 eller 11; på en Mac bruger det systemets, så det kræver macOS 13.3 eller nyere. Indstillinger › Opdateringer i Studio viser, hvad din kopi kører på.

Det er den ældste version, der *starter*, læst i koden. Det er ikke en liste over gamle browsere, vi har kørt apperne i, så en ældre, der starter, kan stadig mangle en funktion.

## Hvad din computer har brug for

Det er planlagte minimumskrav til apperne, ikke målte krav:

- 8 GB hukommelse (16 GB anbefales til store føderede modeller).
- Et grafikkort med WebGL 2 til 3D-apperne. Hvis en 3D-visning forbliver tom, så tjek, at hardwareacceleration er slået til i browserens indstillinger.
- En skærm på mindst 1280 pixel i bredden til de fulde værktøjslinjer; mindre skærme ombryder dem.

Meget store filer (store tegningssæt, store modeller) bruger meget hukommelse i en browserfane. Luk andre tunge faner, hvis en app bliver langsom.
