---
title: Design af en længdeprofil
summary: Åbn profilvisningen, start et designprofil fra terrænet, tilføj og træk PVI'er, angiv længder for vertikale kurver, og læs fald, K-værdier og høj- og lavpunkter.
keywords: profil, længdeprofil, lodret tracé, pvi, vertikal kurve, fald, k-værdi, top, bund, bvc, evc, profilvisning, færdigt fald, fg, eksisterende terrænprofil, feature-linjer i profil, krydsninger, projiceret, kantsten, grøft, etiketter
from: e9182bfa
---

Hvert tracé har ét designprofil: en liste af PVI'er (station og kote), forbundet med rette fald, og en symmetrisk parabolsk vertikal kurve ved ethvert indre PVI, der har en længde. Det eksisterende terrænprofil samples fra overfladen for dig.

## Åbn profilvisningen

1. Vælg tracéet (klik på det med {{ui:Vælg}}).
2. Tryk {{key:R}}, eller klik {{ui:Længdeprofil}} i værktøjslinjen, eller {{ui:Længdeprofilvisning}} nederst i det højre panel.
   Profilvisningen åbnes under planen med det eksisterende terræn langs tracéet. Med to eller flere tracéer vælger du et i listen til venstre i profillinjen.

Visningen viser altid hele tracéet og strækker kotene, så de fylder panelet; overdrivelsen skrives nederst til venstre, fx »Vertikal overdrivelse 10×«. Den zoomer eller panorerer ikke.

Flyt markøren langs profilet: linjen viser station, terræn- og designkoter, faldet og afgravning eller opfyld der, og en prik følger på tracéet i planen.

## Start designprofilet

1. Klik på {{ui:Start fra terrænet}} i det højre panel under **Designprofil**.
   To PVI'er placeres på terrænet i de to ender af tracéet, forbundet med ét rett fald. Statuslinjen siger »Designprofil startet på terrænet i begge ender. Slå Tilføj PVI'er til og klik for at tilføje faldbrud; angiv en kurvelængde i tabellen.«

Hvis tracéet ikke skærer overfladen, får du »Dette tracé har intet terræn under sig at starte fra.« Tilføj så PVI'er ved at klikke i stedet (næste afsnit).

## Tilføj PVI'er

1. Tryk {{key:I}}, eller klik på {{ui:Tilføj PVI'er}} i profillinjen. Den forbliver nedtrykt.
2. Klik i profilet, hvor du vil have et faldbrud. Et PVI tilføjes ved den station og kote, afrundet til 0.01, og markeres.
3. Tilføj så mange, du har brug for, og tryk derefter {{key:I}} igen for at stoppe.

Et klik, hvor der allerede er et PVI, afvises (»Der er allerede et PVI ved …«). PVI'er står altid i stationsorden.

## Juster PVI'er

- **Træk** et PVI i profilet for at flytte det. Det kan ikke passere sine naboer. Flytningen er ét trin at fortryde.
- **Skriv** præcise værdier i PVI-tabellen i det højre panel: **Station**, **Kote** og **Kurve L** (vertikal kurves længde). Tryk {{key:Enter}} efter hver.
- **Fjern** et PVI med x'et i enden af dens række, eller vælg det (klik på det) og tryk {{key:Delete}}. Når profilvisningen har fokus, fjerner {{key:Backspace}} det også.

Det første og det sidste PVI får aldrig en kurve.

## Vertikale kurver

1. Skriv en længde i **Kurve L** for et indre PVI, fx 200.
2. Kurven tegnes centreret på PVI'et. Profilet og det højre panel viser dens type (top eller bund), L og K, BVC- og EVC-stationerne og -koterne samt dens høj- eller lavpunkt, når der er et inde i kurven.

K regnes ud fra L (K = L divideret med den algebraiske forskel i fald, i procent). Du skriver L; at skrive K direkte er endnu ikke muligt.

Hvis en vertikal kurve ikke passer, forklarer en rød boks hvorfor: den løber tilbage ind i PVI'et eller kurven før den, eller forbi det næste PVI, og hvor meget plads der er på den side (en kurve har brug for halvdelen af sin længde på hver side af sit PVI). Dens knap sætter **den længste kurve, der passer**, med dens K, som ét trin ({{key:Mod+Z}} fortryder det). Ellers flyt PVI'erne fra hinanden.

## Læs fakta

Under PVI-tabellen viser en liste hvert fald i procent (»Fald 1: +1.25%«) og hver kurve, fx »Top ved 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)«, derefter »Højpunkt 1+62.40, 254.12«.

Hvis PVI'erne ikke når begge ender af tracéet, siger en note det. En korridor bygges kun, hvor profilet og tracéet overlapper.

## Feature-linjer i profilet

Feature-linjer vises også i profilvisningen, så du kan se en kantsten, en grøft eller en muropkant mod vejens profil.

- Hvor en feature-linje **krydser** tracéet, viser profilet en lille rombe ved den station og kote, med linjens navn og dens kote der (linjens egen kote, regnet ud langs det krydsende segment).
- Skriv en afstand i {{ui:Ved siden af inden for}} for også at tegne de feature-linjer, der **løber ved siden af** tracéet inden for den afstand, som stiplede linjer ved deres egne koter. Tomt eller 0 viser kun krydsningerne.
- Mærker og etiketter følger alle ændringer: flyt et hjørnepunkt, skriv et fald eller hæv linjen, og profilet viser de nye koter med det samme.
- Klik på en krydsnings rombe for at vælge feature-linjen; den valgte linje tegnes i fremhævningsfarven.
- {{ui:Feature-linjer}} i profillinjen skjuler eller viser dem alle. Begge indstillinger gemmes med projektet.

Se [Feature-linjer](topic:feature-lines).

## Næste

- [Tegn en vejkorridor](topic:corridor) langs tracéet og dette profil.
- Profilet skrives til LandXML sammen med tracéet; se [Udveksl LandXML](topic:landxml).
