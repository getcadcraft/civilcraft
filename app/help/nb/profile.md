---
title: Tegn en vertikal profil
summary: Åpne profilvisningen, start en designprofil fra terrenget, legg til og dra PVI-er, sett lengder på vertikalkurver, og les stigninger, K-verdier og høye og lave punkter.
keywords: profil, vertikal linjeføring, pvi, vertikalkurve, stigning, k-verdi, toppkurve, sigkurve, bvc, evc, profilvisning, ferdig terreng, fg, eksisterende terrengprofil, formlinjer i profil, kryssinger, projisert, kantstein, grøft, etiketter
from: e9182bfa
---

Hver linjeføring har én designprofil: en liste over PVI-er (profilnummer og kote) forbundet med rette stigninger, med en symmetrisk parabolsk vertikalkurve ved ethvert innvendig PVI som har en lengde. Den eksisterende terrengprofilen hentes fra flaten for deg.

## Åpne profilvisningen

1. Velg linjen (klikk på den med {{ui:Velg}}).
2. Trykk {{key:R}}, eller klikk {{ui:Lengdeprofil}} på verktøylinjen, eller {{ui:Lengdeprofilvisning}} nederst i høyre panel.
   Profilvisningen åpnes under planen med eksisterende terreng langs linjen. Med to eller flere linjer velger du en i listen til venstre i profillinjen.

Visningen viser alltid hele linjen og strekker kotene for å fylle panelet; overdrivelsen står nederst til venstre, for eksempel «Vertikal overdrivelse 10×». Den zoomer eller panorerer ikke.

Flytt pekeren langs profilet: linjen viser profilnummer, terreng- og designkoter, stigningen og avgraving eller fylling der, og en prikk følger på linjen i planen.

## Start designprofilet

1. I høyre panel under **Designprofil** klikker du {{ui:Start fra terrenget}}.
   To PVI-er settes på terrenget i de to endene av linjen, forbundet med én rett stigning. Statuslinjen sier «Designprofil startet på terrenget i begge ender. Slå på Legg til PVI-er og klikk for å legge til stigningsbrudd; gi dem en kurvelengde i tabellen.»

Hvis linjen ikke krysser flaten, får du «Denne linjen har ingen terreng under seg å starte fra.» Legg da til PVI-er ved å klikke i stedet (neste avsnitt).

## Legg til PVI-er

1. Trykk {{key:I}}, eller klikk {{ui:Legg til PVI-er}} i profillinjen. Den står nedtrykt.
2. Klikk i profilet der du vil ha et stigningsbrudd. En PVI legges til ved den stasjonen og koten, avrundet til 0,01, og velges.
3. Legg til så mange du trenger, og trykk {{key:I}} igjen for å slutte å legge til.

Et klikk der det allerede er en PVI, avvises («Det finnes allerede en PVI ved …»). PVI-er står alltid i profilnummerrekkefølge.

## Juster PVI-er

- **Dra** en PVI i profilet for å flytte den. Den kan ikke passere naboene sine. Flyttingen er ett steg for å angre.
- **Skriv** eksakte verdier i PVI-tabellen i høyre panel: **Profilnummer**, **Kote** og **Kurve L** (lengde på vertikalkurven). Trykk {{key:Enter}} etter hver.
- **Fjern** en PVI med x-en på slutten av raden, eller velg den (klikk på den) og trykk {{key:Delete}}. Når profilvisningen har fokus, fjerner {{key:Backspace}} den også.

Den første og siste PVI-en får aldri kurve.

## Vertikalkurver

1. Skriv en lengde i **Kurve L** for en innvendig PVI, for eksempel 200.
2. Kurven tegnes sentrert på PVI-en. Profilet og høyre panel viser typen (topp eller sig), L og K, BVC- og EVC-profilnumrene og kotene, og høyde- eller lavpunktet når det ligger innenfor kurven.

K beregnes fra L (K = L delt på den algebraiske forskjellen i stigninger, i prosent). Du skriver inn L; å skrive K direkte er ikke tilgjengelig ennå.

Hvis en vertikalkurve ikke passer, forklarer en rød boks hvorfor: den går tilbake inn i PVI-en eller kurven før den, eller forbi neste PVI, og hvor mye plass det er på den siden (en kurve trenger halvparten av lengden på hver side av sin PVI). Knappen setter **den lengste kurven som passer**, med dens K, som ett steg ({{key:Mod+Z}} angrer det). Eller flytt PVI-ene fra hverandre.

## Les fakta

Under PVI-tabellen gir en liste hver stigning i prosent («Stigning 1: +1.25%») og hver kurve, for eksempel «Topp ved 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)», og deretter «Høypunkt 1+62.40, 254.12».

Hvis PVI-ene ikke når begge ender av linjen, sier en merknad det. En korridor bygges bare der profilet og linjen overlapper.

## Formlinjer i profilet

Formlinjer vises også i profilvisningen, slik at du kan se en kantstein, en grøft eller en muroverkant mot veiens profil.

- Der en formlinje **krysser** linjen, viser profilet en liten diamant ved den stasjonen og koten, merket med linjens navn og dens kote der (linjens egen kote, regnet ut langs segmentet som krysser).
- Skriv en avstand i {{ui:Langsmed innenfor}} for også å tegne formlinjene som **løper ved siden av** linjen innenfor den avstanden, som stiplede linjer i sine egne koter. Tomt eller 0 viser bare kryssingene.
- Merkene og etikettene følger alle endringer: flytt et hjørnepunkt, skriv en stigning eller hev linjen, og profilet viser de nye kotene med en gang.
- Klikk på diamanten til en kryssing for å velge den formlinjen; den valgte linjen tegnes i markeringsfargen.
- {{ui:Formlinjer}} i profillinjen skjuler eller viser dem alle. Begge innstillingene lagres med prosjektet.

Se [Formlinjer](topic:feature-lines).

## Neste

- [Sveip en veikorridor](topic:corridor) langs linjen og denne profilen.
- Profilet skrives til LandXML sammen med linjen; se [Utveksle LandXML](topic:landxml).
