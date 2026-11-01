---
title: Ordne panelene og bruk en ekstra skjerm
summary: Fest sidepanelene til venstre, høyre eller nederst, stable dem, gruppér dem som faner, fest dem til kanten eller skjul dem, flytt dem over tegningen, gjør layouten tettere, velg hvor mange linjer verktøylinjen bruker, eller flytt dem til eget vindu på en annen skjerm.
keywords: panel, fest, dra, flytt panel, flytt, layout, faner, fanegruppe, stable, fest til kanten, auto-skjul, skjul panel, lukk panel, kompakt, layouttetthet, tett, verktøylinjerader, bryt, 1 rad, 2 rader, verktøylinjer, andre skjerm, to skjermer, dobbel skjerm, flere skjermer, vindu, sprettoppvindu, tilbakestill layout
from: 32a8dae2
---

Panelene ved siden av tegningen kan flyttes. Plasser dem der det passer deg, eller gi dem et eget vindu på en ekstra skjerm, slik at tegningen får hele den første skjermen.

:::note
Hvert panel har en tittellinje: en smal linje med panelets navn, en {{ui:⋯}}-meny, en festeknapp og en lukkeknapp øverst på panelet. Versjoner før 0.7 har bare navnet og {{ui:⋯}}-menyen.
:::

## Flytt et panel i vinduet

1. Dra panelet etter navnet øverst.
2. Mens du drar, vises omrisser av områder på venstre, høyre og nederst i tegningen. Slipp panelet på ett av dem for å feste det der. Området du er over, blir mørkere.
3. Slipp det et annet sted over tegningen for at det skal flyte.

Paneler kan dele én side: de stables, og hver linje mellom to av dem kan dras for å dele plassen (når en linje har fokus, flytter piltastene den, og dobbeltklikk på den deler plassen likt). Dra den indre kanten av en festet side for å gjøre den bredere eller smalere; dobbeltklikk kanten for å sette den tilbake.

Et flytende panel blir værende over tegningen. Flytt det etter navnet, og endre størrelsen ved å dra nedre høyre hjørne (eller bruk {{key:Tab}} til hjørnet og piltastene). Dobbeltklikk på navnet for å feste det igjen der det var.

:::touch
Dra med ett finger på panelets navn. Dra nedre høyre hjørne på et flytende panel med ett finger for å endre størrelsen, og kantene mellom festede paneler på samme måte. For å flyte eller feste uten å dra, bruk {{ui:⋯}}-menyen.
:::

## Gruppér paneler som faner

To paneler kan dele én ramme og vise ett om gangen. Dra et panel etter navnet over tittellinjen til et annet panel (linjen markeres mens du er over den), og slipp: rammen får nå én fane for hvert panel, i tittellinjen. Klikk på en fane for å vise panelet. Når en fane har fokus, bytter {{key:Left}} og {{key:Right}} faner, og {{key:Home}} og {{key:End}} går til første og siste.

For å ta et panel ut av gruppen, velg {{ui:Flytt ut av fanegruppen}} i panelets {{ui:⋯}}-meny, eller dra det et annet sted. Velg {{ui:Lag fane med}} og et panels navn for å gruppere dem uten å dra.

## Fest til kanten, skjul og hent tilbake

- Festeknappen i et panels tittellinje gjør det til **auto-skjul**: panelet forlater festet sitt og blir en liten fane på den kanten. Pek på fanen, gi den fokus eller klikk på den, så glir panelet ut over tegningen; flytt bort (eller trykk {{key:Esc}}), så glir det tilbake. Trykk festeknappen igjen, eller velg {{ui:Løsne}}, for å feste det for godt.
- Lukkeknappen, eller {{ui:Skjul dette panelet}} i menyen, skjuler panelet og lukker festet. En stiplet fane på kanten henter det frem igjen: klikk på den, eller gi den fokus og trykk {{key:Enter}}.

## Gjør layouten tettere

{{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Layouttetthet}} har to valg. {{ui:Romslig}} er standard. {{ui:Kompakt}} strammer inn radhøyden, panelmarginene, verktøylinjeknappene og panelteksten i den appen, slik at mer får plass på skjermen. Valget lagres for hver app. En berøringsskjerm beholder de store knappene i begge, og en telefon beholder sitt eget oppsett. {{ui:Tilbakestill layout}} beholder tettheten du har valgt.

## Velg hvor mange linjer verktøylinjen bruker

{{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Verktøylinjerader}} har tre valg. {{ui:Bryt}} er standard: alle verktøygrupper vises, på så mange linjer som det trengs. {{ui:2 rader}} holder verktøylinjen på to linjer og {{ui:1 rad}} på én, slik at tegningen får høyden. Gruppene som ikke får plass, ruller sideveis inne i verktøylinjen (bruk musehjulet, et tofingersveip eller {{key:Tab}} til et verktøy). En verktøylinje som allerede får plass på to linjer, blir som den er under {{ui:2 rader}}, fordi et rutenett bare ville gjort den høyere. Valget lagres for hver app. En berøringsskjerm og en telefon beholder sitt eget oppsett. CadCraft har en egen innstilling for verktøylinjen, under {{ui:Innstillinger}} › {{ui:CadCraft}}.

## Bruk tastaturet

Hvert panels {{ui:⋯}}-knapp åpner en meny: {{ui:Fest til venstre}}, {{ui:Fest til høyre}}, {{ui:Fest nederst}}, {{ui:Flyt over tegningen}}, {{ui:Fest til kanten}}, {{ui:Skjul dette panelet}}, {{ui:Lag fane med}} et annet panel, {{ui:Flytt til et nytt vindu}} og {{ui:Sett det tilbake}}. Bruk {{key:Tab}} til knappen, trykk {{key:Enter}}, flytt med piltastene og trykk {{key:Enter}} igjen. {{key:Esc}} lukker menyen.

## Legg panelene på en ekstra skjerm

1. Velg {{ui:⋯}} på et panel, og så {{ui:Flytt alle paneler til et nytt vindu}}. Du kan også velge {{ui:Flytt paneler til et nytt vindu}} i {{ui:Innstillinger}}.
2. Et lite vindu åpnes med panelene i seg. Dra det til den andre skjermen og gjør det så stort du vil.
3. Fortsett å arbeide: panelene virker på tegningen som før, og tegningen fyller hovedvinduet.

Snarveier fungerer fortsatt når panelvinduet er foran: taster du trykker der, unntatt når du skriver i en boks, går til tegningen. Spørsmål og dialoger som appen stiller, åpnes fortsatt i hovedvinduet, så se der når en vises. Temaet og størrelsen på panelteksten følger hovedvinduet.

:::chromium
Chrome og Edge kan plassere vinduet på den andre skjermen for deg. Når en ekstra skjerm er koblet til, velg {{ui:Legg det på den andre skjermen min}} i panelvinduet (eller {{ui:Legg panelene på den andre skjermen min}} i et panels {{ui:⋯}}-meny). Nettleseren spør én gang om dette nettstedet får se skjermene dine; når du har tillatt det, åpnes panelvinduet på den skjermen hver gang.
:::

:::firefox safari
Dra panelvinduet til den andre skjermen selv. Det åpnes på samme sted og i samme størrelse neste gang.
:::

## Mer enn ett panelvindu

Hvert panel kan ha et eget vindu: opptil fire panelvinduer, for eksempel ett per skjerm.

- I et panels {{ui:⋯}}-meny åpner {{ui:Flytt til et nytt vindu}} et nytt vindu for det panelet, og {{ui:Flytt til panelvindu 2}} (og så videre) flytter det inn i et som er åpent. Det andre vinduet kalles «panelvindu 2».
- Dra et panel etter navnet fra ett vindu til et annet: slipp over hovedvinduet for å feste det der (områdene med omriss vises mens du er over det) eller for å la det flyte, og over et annet panelvindu for å flytte det inn. Slipper du et annet sted, blir det der det var.
- Et panelvindu uten flere paneler lukkes av seg selv.

Etter en omlasting tilbyr appen deg panelvinduene dine igjen. Nettlesere åpner ett vindu per klikk, så velg {{ui:Åpne den neste}} én gang for hvert vindu.

## Flytt en dialogboks

Hver dialogboks kan flyttes unna tegningen: trykk og dra tittellinjen. Dialogen husker hvor du lot den stå, hver dialog for seg, og kommer tilbake til samme sted neste gang den åpnes. Dobbeltklikk tittellinjen for å sentrere den igjen.

Fra tastaturet, med fokus inne i dialogen, trykker du {{key:Alt}}+{{key:Shift}}+en piltast for å flytte den 16 piksler om gangen; legg til {{key:Ctrl}} for 64. En dialog som havner utenfor skjermen (etter et mindre vindu eller en mindre skjerm), hentes tilbake.

På en telefon forblir dialoger fullbredde ark, og de flyttes ikke.

I CadCraft Studio har CadCraft sin dialog {{ui:Plott til PDF}}, som du kan la stå åpen mens du arbeider, en knapp i tittellinjen: {{ui:Åpne i eget vindu}}. Dialogen flyttes inn i et eget vindu som du kan plassere på en annen skjerm. Lukker du dialogen, lukkes vinduet, og lukker du vinduet, lukkes dialogen.

## Sett panelene tilbake

- Velg {{ui:Sett panelene tilbake}} i panelvinduet, eller lukk det bare. Panelene går tilbake dit de var.
- Å lukke eller laste hovedvinduet på nytt lukker også panelvinduet. Når appen åpnes igjen, sier den at panelene dine var i eget vindu; velg {{ui:Åpne det}} for å hente vinduet tilbake, eller {{ui:Behold dem her}}.
- {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Tilbakestill layout}} setter hvert panel tilbake der det startet.

:::tip
Hvis ingenting åpnes når du flytter paneler til et nytt vindu, har nettleseren blokkert sprettoppvinduet. Appen sier fra om det og lar panelene være der de var. Tillat sprettoppvinduer for getcadcraft.com, og prøv igjen.
:::

Layouten lagres for hver app i denne nettleseren, sammen med de andre innstillingene dine.
