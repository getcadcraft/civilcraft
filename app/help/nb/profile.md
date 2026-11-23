---
title: Prosjekter et vertikalt lengdeprofil
summary: Åpne lengdeprofilvisningen, start et prosjektert lengdeprofil fra terrenget, legg til og dra PVI-er, angi lengder på vertikalkurver, og les fall, K-verdier og høyeste og laveste punkter.
keywords: profil, vertikal veglinje, pvi, vertikalkurve, fall, k-verdi, topp, søkk, bvc, evc, lengdeprofilvisning, ferdig terreng, fg, eksisterende lengdeprofil, formlinjer i profilet, kryssinger, projisert, kantstein, grøft, etiketter
from: dbb1f32d
---

Hver veglinje har ett prosjektert lengdeprofil: en liste over PVI-er (profilnummer og høyde) forbundet med rette fall, med en symmetrisk parabolsk vertikalkurve ved hver indre PVI som har en lengde. Profilet for eksisterende terreng hentes fra terrengmodellen for deg.

## Åpne lengdeprofilvisningen

1. Velg veglinjen (klikk på den med {{ui:Velg}}).
2. Trykk {{key:R}}, eller klikk {{ui:Profile}} i verktøylinjen, eller {{ui:Profile view}} nederst i høyre panel.
   Lengdeprofilvisningen åpnes under planen med eksisterende terreng langs veglinjen. Med to eller flere veglinjer velger du én i listen til venstre i profilraden.

Visningen starter med å vise hele veglinjen og strekker høydene for å fylle panelet; overdrivelsen står nederst til venstre, for eksempel «Vertikal overdrivelse 10×».

## Zoom og panorering av profilet

- **Zoom:** snurr musehjulet (eller klyp på styreflaten), og visningen zoomer om pekeren. Hold {{key:Shift}} for å zoome bare profilnumrene, eller {{key:Alt}} for å zoome bare høydene (det endrer overdrivelsen). Når lengdeprofilvisningen har fokus, zoomer pluss- og minustastene om midten.
- **Panorer:** dra med høyre eller midtre museknapp, eller sveip med to fingre på styreflaten.
- **Tilpass:** dobbeltklikk profilet eller trykk {{key:F}} for å vise hele veglinjen igjen.

Redigering av en PVI beholder zoomen du valgte; den hopper ikke tilbake til tilpasset visning.

Flytt pekeren langs profilet: raden viser profilnummer, terreng- og prosjekterte høyder, fallet og skjæringen eller fyllingen der, og en prikk følger på veglinjen i planen.

## Start det prosjekterte lengdeprofilet

1. I høyre panel under **Prosjektert lengdeprofil** klikker du {{ui:Start fra terrenget}}.
   To PVI-er plasseres på terrenget i de to endene av veglinjen, forbundet med ett rett fall. Statuslinjen sier: «Prosjektert lengdeprofil startet på terrenget i begge ender. Slå på {{ui:Legg til PVI-er}} og klikk for å legge til fallbrudd; gi dem en kurvelengde i tabellen.»

Hvis veglinjen ikke krysser terrengmodellen, får du «Denne veglinjen har ikke terreng under seg å starte fra.» Legg da til PVI-er ved å klikke i stedet (neste avsnitt).

## Legg til PVI-er

1. Trykk {{key:I}}, eller klikk {{ui:Legg til PVI-er}} i profilraden. Den forblir trykket.
2. Klikk i profilet der du vil ha et fallbrudd. En PVI legges til ved det profilnummeret og den høyden, avrundet til 0.01, og velges.
3. Legg til så mange du trenger, og trykk deretter {{key:I}} igjen for å avslutte.

Et klikk der det allerede finnes en PVI, avvises («Det finnes allerede en PVI ved …»). PVI-er står alltid i profilnummerrekkefølge.

## Fang til mens du legger til eller drar

Knappen **Fang** i profilraden er på fra start. Mens den er på, havner en PVI du legger til eller drar, på nærmeste PVI, terrengpunkt, PVI-profilnummer eller terrenglinjen, og en etikett ved markøren sier hvilken. Hold {{key:Alt}} for et fritt punkt, hvor som helst.

## Juster PVI-er

- **Dra** en PVI i profilet for å flytte den. Den kan ikke passere naboene sine. Flyttingen er ett angrestegg.
- **Skriv inn** nøyaktige verdier i PVI-tabellen i høyre panel: **Profilnummer**, **Høyde**, **Fall %** og **Kurve L** (lengde på vertikalkurven). Trykk {{key:Enter}} etter hver.
- **Plukk** en verdi fra profilet: den lille knappen ved en PVIs profilnummer eller høyde venter på ett klikk i lengdeprofilvisningen og fyller inn verdien. Klikket fester seg som ved Legg til PVI-er; hold {{key:Alt}} for et fritt punkt; {{key:Esc}} avbryter.
- **Fall %** er stigningen på tangenten som starter ved den PVI-en og går til den neste. Skriver du det inn, flyttes **neste** PVIs høyde (profilnummeret flyttes aldri). Er neste PVI låst, flyttes i stedet den forrige PVIs høyde.
- **Lås** en PVI med hengelåsen ved enden av raden. En låst PVI dras ikke, og en endring av fall flytter den ikke. Er begge ender av en tangent låst, kan fallet ikke endres: statuslinjen sier det, og du må låse opp én ende først. Låsen lagres i filen.
- **Fjern** en PVI med x-en ved enden av raden, eller velg den (klikk på den) og trykk {{key:Delete}}. Når lengdeprofilvisningen har fokus, fjerner {{key:Backspace}} den også.

Den første og siste PVI-en får aldri en kurve.

## Vertikalkurver

1. Skriv inn en lengde i **Kurve L** for en indre PVI, for eksempel 200.
2. Kurven tegnes sentrert på PVI-en. Profilet og høyre panel viser typen (topp eller søkk), L og K, BVC- og EVC-profilnummer og -høyder, og dens høyeste eller laveste punkt når det ligger innenfor kurven.

K beregnes fra L (K = L delt på den algebraiske forskjellen i fall, i prosent). Du skriver inn L; å skrive inn K direkte er ikke tilgjengelig ennå.

Hvis en vertikalkurve ikke får plass, forklarer en rød boks hvorfor: den går tilbake inn i PVI-en eller kurven før den, eller forbi neste PVI, og hvor mye plass det er på den siden (en kurve trenger halve lengden på hver side av sin PVI). Knappen setter **den lengste kurven som får plass**, med sin K, som ett steg ({{key:Mod+Z}} angrer det). Eller flytt PVI-ene fra hverandre.

## Les fakta

Under PVI-tabellen gir en liste hvert fall i prosent («Fall 1: +1.25%») og hver kurve, for eksempel «Topp ved 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)», og deretter «Høyeste punkt 1+62.40, 254.12».

Hvis PVI-ene ikke når begge ender av veglinjen, sier en merknad det. En korridor bygges bare der profilet og veglinjen overlapper.

## Formlinjer i profilet

Formlinjer vises også i lengdeprofilvisningen, slik at du kan se en kantstein, en grøft eller en muroverkant mot veiens profil.

- Der en formlinje **krysser** veglinjen, viser profilet et lite rutemerke ved det profilnummeret og den høyden, merket med linjens navn og høyden der (linjens egen høyde, beregnet langs strekningen som krysser).
- Skriv inn en avstand i {{ui:Langsmed innenfor}} for også å tegne formlinjene som **går ved siden av** veglinjen innen den avstanden, som stiplede linjer i sine egne høyder. Tomt eller 0 viser bare kryssingene.
- Merkene og etikettene følger alle endringer: flytt et hjørnepunkt, skriv inn et fall eller hev linjen, og profilet viser de nye høydene med én gang.
- Klikk på rutemerket for en kryssing for å velge formlinjen; den valgte linjen tegnes i markeringsfargen.
- {{ui:Formlinjer}} i profilraden skjuler eller viser dem alle. Begge innstillingene lagres med prosjektet.

Se [Formlinjer](topic:feature-lines).

## Neste

- [Feie en veikorridor](topic:corridor) langs veglinjen og dette profilet.
- Profilet skrives til LandXML sammen med veglinjen; se [Utveksle LandXML](topic:landxml).
