---
title: Ordne panelene og bruk en andre skjerm
summary: Fest sidepanelene til venstre, høyre eller nederst, stable dem, gruppér dem som faner, fest eller skjul dem, flyt dem over tegningen, gjør layouten tettere, velg hvor mange linjer verktøylinjen bruker, eller flytt dem til et eget vindu på en annen skjerm.
keywords: paneler, fest, flyt, flytt panel, dra, layout, faner, fanegruppe, stable, skjul automatisk, skjul panel, lukk panel, kompakt, layouttetthet, tett, verktøylinjerader, bryt, 1 rad, 2 rader, verktøylinjer, andre skjerm, to skjermer, dobbel skjerm, flere skjermer, vindu, sprettoppvindu, tilbakestill layout
from: 49530239
---

Panelene ved siden av tegningen kan flyttes. Plasser dem der de passer deg, eller gi dem et eget vindu på en andre skjerm, slik at tegningen får hele den første skjermen.

:::note
Hvert panel har en tittellinje: en smal linje med panelets navn, en {{ui:⋯}}-meny, en knapp for automatisk skjuling og en lukkeknapp øverst i panelet. Versjoner før 0.7 har bare navnet og {{ui:⋯}}-menyen.
:::

## Flytt et panel i vinduet

1. Dra panelet etter navnet øverst.
2. Mens du drar, vises omrissede områder til venstre, høyre og nederst i tegningen. Slipp panelet på ett av dem for å feste det der. Området du er over, mørkes.
3. Slipp det et annet sted over tegningen for å gjøre det flytende.

Paneler kan dele én side: de stables, og hver linje mellom to av dem kan dras for å dele plassen (når en linje har fokus, flytter piltastene den, og dobbeltklikk på den deler plassen likt). Dra den indre kanten av en festet side for å gjøre den bredere eller smalere; dobbeltklikk kanten for å sette den tilbake.

Et flytende panel blir værende over tegningen. Flytt det etter navnet, og endre størrelse ved å dra nedre høyre hjørne (eller gå til hjørnet med {{key:Tab}} og bruk piltastene). Dobbeltklikk på navnet for å feste det igjen der det var.

:::touch
Dra med ett finger på panelets navn. Dra nedre høyre hjørne av et flytende panel med ett finger for å endre størrelse, og kantene mellom festede paneler på samme måte. For å flytte over tegningen eller feste uten å dra, bruk {{ui:⋯}}-menyen.
:::

## Gruppér paneler som faner

To paneler kan dele én ramme og vise ett om gangen. Dra et panel etter navnet over tittellinjen til et annet panel (linjen blir omrisset mens du er over den), og slipp: rammen får nå en fane for hvert panel, i tittellinjen. Klikk en fane for å vise panelet. Med en fane i fokus bytter {{key:Left}} og {{key:Right}} faner, og {{key:Home}} og {{key:End}} går til den første og den siste.

For å ta et panel ut av gruppen, velg {{ui:Flytt ut av fanegruppen}} i panelets {{ui:⋯}}-meny, eller dra det et annet sted. Velg {{ui:Legg i fane med}} og et panels navn for å gruppere dem uten å dra.

## Skjul automatisk, skjul og hent tilbake

- Knappen i et panels tittellinje gjør det til **skjult automatisk**: panelet forlater festet og blir en liten fane på den kanten. Pek på fanen, sett fokus på den eller klikk den, så glir panelet ut over tegningen; flytt bort (eller trykk {{key:Esc}}), så glir det tilbake. Trykk på knappen igjen, eller velg {{ui:Slå av automatisk skjuling}}, for å feste det for godt.
- Lukkeknappen, eller {{ui:Skjul dette panelet}} i menyen, skjuler panelet og trekker sammen festet. En stiplet fane på kanten henter det frem igjen: klikk på den, eller sett fokus på den og trykk {{key:Enter}}.

## Gjør layouten tettere

{{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Layouttetthet}} har to valg. {{ui:Romslig}} er standard. {{ui:Kompakt}} strammer inn radhøydene, panelmarginene, verktøylinjeknappene og panelteksten i den appen, slik at mer får plass på skjermen. Valget lagres for hver app. En berøringsskjerm beholder de store knappene i begge, og en telefon beholder sin egen layout. {{ui:Tilbakestill layout}} endrer ikke tettheten du har valgt.

## Velg hvor mange linjer verktøylinjen bruker

{{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Verktøylinjerader}} har tre valg. {{ui:Bryt}} er standard: hver verktøygruppe vises, på så mange linjer som den trenger. {{ui:2 rader}} holder verktøylinjen på to linjer og {{ui:1 rad}} på én, slik at tegningen får høyden; gruppene som ikke får plass, ruller sidelengs inne i verktøylinjen (bruk musehjulet, et tofingersveip eller {{key:Tab}} til et verktøy). En verktøylinje som allerede får plass på to linjer, blir som den er under {{ui:2 rader}}, fordi et rutenett bare ville gjort den høyere. Valget lagres for hver app. En berøringsskjerm og en telefon beholder sin egen layout. CadCraft har sin egen innstilling for verktøylinjen, under {{ui:Innstillinger}} › {{ui:CadCraft}}.

## Bruk tastaturet

Hvert panels {{ui:⋯}}-knapp åpner en meny: {{ui:Fest til venstre}}, {{ui:Fest til høyre}}, {{ui:Fest nederst}}, {{ui:Flyt over tegningen}}, {{ui:Skjul automatisk ved kanten}}, {{ui:Skjul dette panelet}}, {{ui:Legg i fane med}} et annet panel, {{ui:Flytt til et nytt vindu}} og {{ui:Sett det tilbake}}. Gå til knappen med {{key:Tab}}, trykk {{key:Enter}}, flytt med piltastene og trykk {{key:Enter}} igjen. {{key:Esc}} lukker menyen.

## Legg panelene på en andre skjerm

1. Velg {{ui:⋯}} på et panel, og så {{ui:Flytt alle paneler til et nytt vindu}}. Du kan også velge {{ui:Flytt paneler til et nytt vindu}} i {{ui:Innstillinger}}.
2. Et lite vindu åpnes med panelene i seg. Dra det over til den andre skjermen og gjør det så stort du vil.
3. Fortsett å arbeide: panelene virker på tegningen som før, og tegningen fyller hovedvinduet.

Snarveier fungerer fortsatt mens panelvinduet er foran: taster du trykker der, unntatt når du skriver i en boks, går til tegningen. Spørsmål og dialoger som appen stiller, åpnes fortsatt i hovedvinduet, så se der når en vises. Temaet og størrelsen på panelteksten følger hovedvinduet.

:::chromium
Chrome og Edge kan plassere vinduet på den andre skjermen for deg. Med en andre skjerm tilkoblet, velg {{ui:Legg det på den andre skjermen min}} i panelvinduet (eller {{ui:Legg panelene på den andre skjermen min}} i et panels {{ui:⋯}}-meny). Nettleseren spør én gang om denne siden får se skjermene dine; når du har tillatt det, åpnes panelvinduet på den skjermen hver gang.
:::

:::firefox safari
Dra panelvinduet over til den andre skjermen selv. Det åpnes på samme sted og i samme størrelse neste gang.
:::

## Mer enn ett panelvindu

Hvert panel kan ha et eget vindu: opptil fire panelvinduer, for eksempel ett per skjerm.

- I et panels {{ui:⋯}}-meny åpner {{ui:Flytt til et nytt vindu}} et nytt vindu for det panelet, og {{ui:Flytt til panelvindu 2}} (og så videre) flytter det inn i et som er åpent. Det andre vinduet kalles «paneler 2».
- Dra et panel etter navnet fra ett vindu til et annet: slipp over hovedvinduet for å feste det der (de omrissede områdene vises mens du er over det) eller for å gjøre det flytende, og over et annet panelvindu for å flytte det inn. Slipp et annet sted, og det blir værende der det var.
- Et panelvindu uten flere paneler lukkes av seg selv.

Etter en oppdatering tilbyr appen deg panelvinduene dine igjen. Nettlesere åpner ett vindu per klikk, så velg {{ui:Åpne neste}} én gang for hvert vindu.

## Samme måte for alle deler av en layout

Båndet, verktøykassen, verktøyradene og statuslinjen får et eget vindu på samme måte som et panel: åpne {{ui:⋯}}-menyen på delen og velg {{ui:Flytt til et nytt vindu}}; {{ui:Sett det tilbake}} (eller å lukke vinduet) tar det hjem igjen. Taster du trykker i det vinduet, når appen, slik de gjør fra panelvinduet. Hver del har én slik meny.

## Flytt en dialogboks

Hver dialogboks kan flyttes unna tegningen: trykk på tittellinjen og dra. Dialogboksen husker hvor du slapp den, hver dialogboks for seg, og kommer tilbake dit neste gang den åpnes. Dobbeltklikk på tittellinjen for å sentrere den igjen.

Fra tastaturet trykker du {{key:Alt}}+{{key:Shift}}+en piltast mens fokus er inne i dialogboksen, for å flytte den 16 piksler om gangen; legg til {{key:Ctrl}} for 64. En dialogboks som havner utenfor skjermen (etter et mindre vindu eller en mindre skjerm), blir hentet tilbake.

På en telefon forblir dialogbokser fullbredde-ark, og de flyttes ikke.

I CadCraft Studio har dialogboksen Plott til PDF i CadCraft, som du kan la stå åpen mens du arbeider, en knapp i tittellinjen: {{ui:Åpne i eget vindu}}. Dialogboksen flyttes til et eget vindu som du kan sette på en annen skjerm. Når du lukker dialogboksen, lukkes vinduet, og når du lukker vinduet, lukkes dialogboksen.

## Sett panelene tilbake

- Velg {{ui:Sett panelene tilbake}} i panelvinduet, eller lukk det ganske enkelt. Panelene går tilbake dit de var.
- Å lukke eller laste hovedvinduet på nytt lukker også panelvinduet. Når appen åpnes igjen, sier den at panelene dine var i et eget vindu; velg {{ui:Åpne den}} for å hente vinduet tilbake, eller {{ui:Behold dem her}}.
- {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Tilbakestill layout}} setter hvert panel tilbake der det startet.

:::tip
Hvis ingenting åpnes når du flytter paneler til et nytt vindu, blokkerte nettleseren sprettoppvinduet. Appen sier fra om det og lar panelene bli der de var. Tillat sprettoppvinduer for getcadcraft.com, og prøv igjen.
:::

Layouten lagres for hver app i denne nettleseren, sammen med de andre innstillingene dine.
