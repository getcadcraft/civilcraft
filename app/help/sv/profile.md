---
title: Designa en längdprofil
summary: Öppna profilvyn, starta en projekterad profil från marken, lägg till och dra PVI:er, ange längder för vertikalkurvor och läs av lutningar, K-värden och hög- och lågpunkter.
keywords: profil, längdprofil, linjeföring, pvi, vertikalkurva, lutning, k-värde, krön, dal, bvc, evc, profilvy, fg, befintlig markprofil, funktionslinjer i profil, korsningar, projicerad, kantsten, dike, etiketter
from: e9182bfa
---

Varje linjeföring har en projekterad profil: en lista med PVI:er (station och höjd) sammanbundna av räta lutningar, med en symmetrisk parabolisk vertikalkurva vid varje inre PVI som har en längd. Den befintliga markprofilen samplas åt dig från ytan.

## Öppna profilvyn

1. Markera linjeföringen (klicka på den med {{ui:Markera}}).
2. Tryck på {{key:R}}, eller klicka på {{ui:Profil}} i verktygsfältet, eller på {{ui:Profilvy}} längst ned i den högra panelen.
   Profilvyn öppnas under planen med den befintliga marken längs linjeföringen. Med två eller fler linjeföringar väljer du en i listan till vänster i profilfältet.

Vyn visar alltid hela linjeföringen och sträcker ut höjderna så att de fyller panelen; överdrivningen skrivs ut i nedre vänstra hörnet, till exempel ”Vertikal överdrivning 10×”. Den zoomar eller panorerar inte.

Flytta pekaren längs profilen: fältet visar stationen, marken och de projekterade höjderna, lutningen och schakten eller fyllningen där, och en punkt följer linjeföringen i planen.

## Starta den projekterade profilen

1. Klicka på {{ui:Starta från marken}} i den högra panelen under **Projekterad längdprofil**.
   Två PVI:er placeras på marken vid linjeföringens två ändar, sammanbundna av en rak lutning. Statusfältet säger ”Projekterad längdprofil startad vid marken i båda ändarna. Slå på Lägg till PVI och klicka för att lägga till lutningsbrytningar; ange en kurvlängd för dem i tabellen.”

Om linjeföringen inte korsar ytan får du ”Den här linjeföringen har ingen mark under sig att starta från.” Lägg då till PVI:er genom att klicka i stället (nästa avsnitt).

## Lägg till PVI:er

1. Tryck på {{key:I}}, eller klicka på {{ui:Lägg till PVI}} i profilfältet. Knappen förblir nedtryckt.
2. Klicka i profilen där du vill ha en lutningsbrytning. En PVI läggs till vid den stationen och höjden, avrundad till 0.01, och markeras.
3. Lägg till så många du behöver och tryck sedan på {{key:I}} igen för att sluta lägga till.

Ett klick där det redan finns en PVI avvisas (”Det finns redan en PVI vid …”). PVI:er står alltid i stationsordning.

## Justera PVI:er

- **Dra** en PVI i profilen för att flytta den. Den kan inte passera sina grannar. Förflyttningen är ett ångra-steg.
- **Skriv** exakta värden i PVI-tabellen i den högra panelen: **Station**, **Höjd** och **Kurva L** (vertikalkurvans längd). Tryck på {{key:Enter}} efter varje.
- **Ta bort** en PVI med x:et i slutet av dess rad, eller markera den (klicka på den) och tryck på {{key:Delete}}. När profilvyn har fokus tar {{key:Backspace}} också bort den.

Första och sista PVI:n får aldrig någon kurva.

## Vertikalkurvor

1. Skriv en längd i **Kurva L** för en inre PVI, till exempel 200.
2. Kurvan ritas centrerad på PVI:n. Profilen och den högra panelen visar dess typ (krön eller dal), L och K, BVC- och EVC-stationerna och höjderna samt dess högpunkt eller lågpunkt när den har en inne i kurvan.

K räknas ut från L (K = L delat med den algebraiska skillnaden i lutningar, i procent). Du skriver L; att skriva K direkt finns ännu inte.

Om en vertikalkurva inte får plats visar en röd ruta varför: den går tillbaka in i PVI:n eller kurvan före den, eller förbi nästa PVI, och hur mycket utrymme det finns på den sidan (en kurva behöver hälften av sin längd på varje sida av sin PVI). Dess knapp anger **den längsta kurva som får plats**, med dess K, som ett steg ({{key:Mod+Z}} ångrar det). Eller flytta isär PVI:erna.

## Läs av uppgifterna

Under PVI-tabellen ger en lista varje lutning i procent (”Lutning 1: +1.25%”) och varje kurva, till exempel ”Krön vid 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)”, följt av ”Högpunkt 1+62.40, 254.12”.

Om PVI:erna inte når båda ändarna av linjeföringen står det en notis om det. En korridor byggs bara där profilen och linjeföringen överlappar.

## Funktionslinjer i profilen

Funktionslinjer visas även i profilvyn, så att du kan se en kantsten, ett dike eller en murkrön mot vägens profil.

- Där en funktionslinje **korsar** linjeföringen visar profilen en liten romb vid den stationen och höjden, märkt med linjens namn och dess höjd där (linjens egen höjd, beräknad längs segmentet som korsar).
- Skriv ett avstånd i {{ui:Bredvid inom}} för att även rita de funktionslinjer som **löper bredvid** linjeföringen inom det avståndet, som streckade linjer vid deras egna höjder. Tomt eller 0 visar bara korsningarna.
- Markeringarna och etiketterna följer alla ändringar: flytta en hörnpunkt, skriv en lutning eller höj linjen, så visar profilen de nya höjderna direkt.
- Klicka på en korsnings romb för att markera funktionslinjen; den markerade linjen ritas i markeringsfärgen.
- {{ui:Funktionslinjer}} i profilfältet döljer eller visar alla. Båda inställningarna sparas med projektet.

Se [Funktionslinjer](topic:feature-lines).

## Nästa

- [Svep en vägkorridor](topic:corridor) längs linjeföringen och denna profil.
- Profilen skrivs till LandXML tillsammans med linjeföringen; se [Utbyt LandXML](topic:landxml).
