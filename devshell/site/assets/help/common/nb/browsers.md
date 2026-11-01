---
title: Nettlesere og datamaskiner
summary: Hvilke nettlesere appene kjører i, hva som skiller dem og hva datamaskinen din trenger.
keywords: chrome, edge, firefox, safari, brave, nettleser, mac, windows, linux, ipad, nettbrett, webgl, krav, minne
from: a11b09b1
---

Appene kjører i en nettleser. De gjør jobben på din egen datamaskin: filene dine åpnes der og sendes aldri til oss (se [Hvor filene dine havner](common:your-files)).

## Hvilken nettleser

Bruk en oppdatert versjon av en av disse:

| Nettleser | Motor | Merknader |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Den mest komplette: valg av mappe, lagring for frakoblet bruk, filhåndtering. |
| Firefox | Gecko | Fungerer. Å åpne en hel mappe bruker en enklere velger. Frakoblet lagring fungerer kanskje ikke i private vinduer. |
| Safari | WebKit | Fungerer på Mac og iPad. Å åpne en hel mappe bruker en enklere velger. Safari kan slette en frakoblet kopi du ikke har brukt på noen uker. |

Alle tre motorene fungerer fint til hverdagsbruk. Der en app gjør noe annerledes i en av dem, viser hjelpen trinnene for nettleseren din.

## Hva som skiller nettleserne

- **Å åpne en mappe.** Chromium-nettlesere viser en ekte mappevelger og kan lese mappen direkte. Firefox og Safari ber deg velge en mappe og leser deretter hver fil i den, noe som tar lengre tid for store prosjektmapper; å dra mappen til appen fungerer i alle tre.
- **Lagring.** Appene lagrer ved å laste ned en fil. Nettleseren din avgjør hvor nedlastinger havner og om den spør først.

:::chromium
I Chrome eller Edge slår du på «Spør hvor hver fil skal lagres før nedlasting» (i Innstillinger, under Nedlastinger) for å velge mappe hver gang.
:::

:::firefox
I Firefox åpner du Innstillinger, deretter Generelt, deretter Filer og programmer, og velger «Spør alltid hvor filer skal lagres» for å velge mappe hver gang.
:::

:::safari
I Safari åpner du Innstillinger, deretter Generelt, og setter «Filnedlastingsmappe» til «Spør for hver nedlasting» for å velge mappe hver gang.
:::

## Mac, Windows og Linux

Appene er like på alle datamaskiner. Det som endres, er tastaturet: hurtigtaster skrives automatisk for din datamaskin. Se [Taster, mus og styreflater](common:keys).

## Nettbrett og berøringsskjermer

Noen apper tar imot berøring (ett finger tegner eller velger, to fingre klyper for å zoome og panorere). Hver apps hjelp sier om den gjør det. På en iPad bruker du Safari eller Chrome. Et tastatur hjelper i apper som bruker skrevne kommandoer.

## Eldste nettleser og system

Dette er lest ut av koden i 0.7-appene, ikke gjettet: hver fil ble analysert, og hver språkfunksjon den bruker, ble slått opp i nettleserprodusentenes publiserte kompatibilitetsdata. Under disse versjonene kan appene ikke engang starte, fordi nettleseren ikke forstår koden.

| | Eldste versjon som kan starte appene |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS og iOS 16.4) |

CadCraft Studio har sin egen nettmotor i Windows, så det krever Windows 10 eller 11; på en Mac bruker det systemets, så det krever macOS 13.3 eller nyere. Innstillinger › Oppdateringer i Studio viser hva din kopi kjører på.

Dette er den eldste versjonen som *starter*, lest ut av koden. Det er ingen liste over gamle nettlesere vi har kjørt appene i, så en eldre som starter, kan likevel mangle en funksjon.

## Hva datamaskinen din trenger

Dette er planlagte minstekrav til appene, ikke målte krav:

- 8 GB minne (16 GB anbefales for store føderte modeller).
- En grafikkbrikke med WebGL 2 for 3D-appene. Hvis en 3D-visning forblir tom, sjekk at maskinvareakselerasjon er slått på i innstillingene til nettleseren.
- En skjerm som er minst 1280 piksler bred for de fullstendige verktøylinjene; mindre skjermer bryter dem over flere rader.

Svært store filer (store tegningssett, store modeller) bruker mye minne i en nettleserfane. Lukk andre tunge faner hvis en app blir treg.
