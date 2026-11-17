---
title: Arrangér panelerne og brug en ekstra skærm
summary: Fastgør sidepanelerne til venstre, højre eller nederst, stabl dem, gruppér dem som faner, fastgør eller skjul dem, frigør dem over tegningen, gør layoutet tættere, vælg hvor mange linjer værktøjslinjen bruger, eller flyt dem til deres eget vindue på en anden skærm.
keywords: paneler, fastgør, frigør, flyt panel, træk, layout, faner, fanegruppe, stable, fastgør, skjul automatisk, skjul panel, luk panel, kompakt, layouttæthed, tæt, værktøjslinjens rækker, ombryd, 1 række, 2 rækker, værktøjslinjens linjer, anden skærm, to skærme, dobbelt skærm, flere skærme, vindue, pop-up, nulstil layout
from: 49530239
---

Panelerne ved siden af tegningen kan flyttes. Placer dem, hvor de passer dig, eller giv dem et vindue for sig selv på en anden skærm, så tegningen kan bruge hele den første skærm.

:::note
Hvert panel har en titellinje: en smal linje med panelets navn, en {{ui:⋯}}-menu, en fastgørelsesknap og en lukkeknap øverst i panelet. Versioner før 0.7 har kun navnet og {{ui:⋯}}-menuen.
:::

## Flyt et panel i vinduet

1. Træk panelet i dets navn øverst.
2. Mens du trækker, vises markerede områder til venstre, højre og nederst i tegningen. Slip panelet på et af dem for at fastgøre det der. Området, du er over, bliver mørkere.
3. Slip det et andet sted over tegningen for at frigøre det.

Paneler kan dele én side: de stables, og hver linje mellem to af dem kan trækkes for at dele pladsen (når en linje har fokus, flytter piletasterne den, og et dobbeltklik på den deler pladsen lige). Træk den indre kant af en fastgjort side for at gøre den bredere eller smallere; dobbeltklik på kanten for at sætte den tilbage.

Et frigjort panel bliver over tegningen. Flyt det i dets navn, og ændr størrelsen ved at trække i det nederste højre hjørne (eller tab hen til hjørnet og brug piletasterne). Dobbeltklik på navnet for at fastgøre det igen, hvor det var.

:::touch
Træk med én finger i panelets navn. Træk i det nederste højre hjørne af et frigjort panel med én finger for at ændre størrelsen, og kanterne mellem fastgjorte paneler på samme måde. For at frigøre eller fastgøre uden at trække, brug {{ui:⋯}}-menuen.
:::

## Gruppér paneler som faner

To paneler kan dele én ramme og vise ét ad gangen. Træk et panel i dets navn hen over titellinjen på et andet panel (linjen er markeret, mens du er over den), og slip: rammen får nu en fane for hvert panel i sin titellinje. Klik på en fane for at vise panelet. Når en fane har fokus, skifter {{key:Left}} og {{key:Right}} faner, og {{key:Home}} og {{key:End}} går til den første og sidste.

For at tage et panel ud af gruppen, vælg {{ui:Flyt ud af fanegruppen}} i dets {{ui:⋯}}-menu, eller træk det et andet sted hen. Vælg {{ui:Fanegruppér med}} og et panels navn for at gruppere dem uden at trække.

## Fastgør, skjul og hent frem igen

- Fastgørelsesknappen i et panels titellinje gør det **skjult automatisk**: panelet forlader sin side og bliver en lille fane ved kanten. Peg på fanen, sæt fokus på den eller klik på den, og panelet glider ud over tegningen; flyt væk (eller tryk {{key:Esc}}), så glider det tilbage. Tryk på fastgørelsesknappen igen, eller vælg {{ui:Løsn fastgørelse}}, for at fastgøre det permanent.
- Lukkeknappen, eller {{ui:Skjul dette panel}} i menuen, skjuler panelet og lukker dets side sammen. En stiplet fane ved kanten henter det frem igen: klik på den, eller sæt fokus på den og tryk {{key:Enter}}.

## Gør layoutet tættere

{{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Layouttæthed}} har to valg. {{ui:Rummelig}} er standard. {{ui:Kompakt}} strammer rækkehøjderne, panelernes margener, værktøjslinjens knapper og panelteksten i den pågældende app, så der kan være mere på skærmen. Valget gemmes for hver app. En touchskærm beholder sine store knapper i begge, og en telefon beholder sit eget layout. {{ui:Nulstil layout}} ændrer ikke den tæthed, du har valgt.

## Vælg hvor mange linjer værktøjslinjen bruger

{{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Værktøjslinjens rækker}} har tre valg. {{ui:Ombryd}} er standard: alle værktøjsgrupper vises, på så mange linjer som det kræver. {{ui:2 rækker}} holder værktøjslinjen til to linjer og {{ui:1 række}} til én, så tegningen får højden; de grupper, der ikke passer, ruller vandret inde i værktøjslinjen (brug musehjulet, et fingerswipe med to fingre eller {{key:Tab}} til et værktøj). En værktøjslinje, der allerede passer på to linjer, bliver som den er under {{ui:2 rækker}}, fordi et gitter kun ville gøre den højere. Valget gemmes for hver app. En touchskærm og en telefon beholder deres eget layout. CadCraft har sin egen indstilling for sin værktøjslinje under {{ui:Indstillinger}} › {{ui:CadCraft}}.

## Brug tastaturet

Hvert panels {{ui:⋯}}-knap åbner en menu: {{ui:Fastgør til venstre}}, {{ui:Fastgør til højre}}, {{ui:Fastgør nederst}}, {{ui:Frigør over tegningen}}, {{ui:Fastgør til kanten}}, {{ui:Skjul dette panel}}, {{ui:Fanegruppér med}} et andet panel, {{ui:Flyt til et nyt vindue}} og {{ui:Sæt det tilbage}}. Tab hen til knappen, tryk {{key:Enter}}, flyt med piletasterne, og tryk {{key:Enter}} igen. {{key:Esc}} lukker menuen.

## Læg panelerne på en anden skærm

1. Vælg {{ui:⋯}} på et panel, og vælg derefter {{ui:Flyt alle paneler til et nyt vindue}}. Du kan også vælge {{ui:Flyt paneler til et nyt vindue}} i {{ui:Indstillinger}}.
2. Et lille vindue åbner med panelerne i sig. Træk det over på din anden skærm, og gør det så stort, du vil.
3. Arbejd videre: panelerne virker på tegningen som før, og tegningen fylder hovedvinduet.

Genveje virker stadig, mens panelvinduet er forrest: taster, du trykker der, går til tegningen, medmindre du skriver i et felt. Spørgsmål og dialoger, appen stiller, åbner stadig i hovedvinduet, så kig dér, når en dialog vises. Temaet og panelets tekststørrelse følger hovedvinduet.

:::chromium
Chrome og Edge kan placere vinduet på den anden skærm for dig. Når en anden skærm er tilsluttet, vælg {{ui:Læg det på min anden skærm}} i panelvinduet (eller {{ui:Læg panelerne på min anden skærm}} i et panels {{ui:⋯}}-menu). Browseren spørger én gang, om siden må se dine skærme; når du har givet tilladelse, åbnes panelvinduet på den skærm hver gang.
:::

:::firefox safari
Træk panelvinduet over på den anden skærm selv. Det åbner samme sted og i samme størrelse næste gang.
:::

## Mere end ét panelvindue

Hvert panel kan have et vindue for sig selv: op til fire panelvinduer, for eksempel ét pr. skærm.

- I et panels {{ui:⋯}}-menu åbner {{ui:Flyt til et nyt vindue}} et nyt vindue for det panel, og {{ui:Flyt til panelvindue 2}} (og så videre) flytter det ind i et, der allerede er åbent. Det andet vindue hedder "paneler 2".
- Træk et panel i dets navn fra et vindue til et andet: slip over hovedvinduet for at fastgøre det der (de markerede områder vises, mens du er over det) eller for at frigøre det, og over et andet panelvindue for at flytte det derind. Slipper du et andet sted, bliver det, hvor det var.
- Et panelvindue uden paneler tilbage lukkes af sig selv.

Efter en genindlæsning tilbyder appen dine panelvinduer igen. Browsere åbner ét vindue pr. klik, så vælg {{ui:Åbn den næste}} én gang for hvert vindue.

## Det samme for alle dele af et layout

Båndet, værktøjskassen, værktøjsrækkerne og statuslinjen får et vindue for sig selv på samme måde som et panel: åbn {{ui:⋯}}-menuen på delen, og vælg {{ui:Flyt til et nyt vindue}}; {{ui:Sæt det tilbage}} (eller at lukke vinduet) bringer det hjem. Taster, du trykker i det vindue, når appen, ligesom fra panelvinduet. Hver del har én sådan menu.

## Flyt en dialog

Enhver dialog kan flyttes væk fra tegningen: tryk og træk i dens titellinje. Dialogen husker, hvor du lod den stå, hver dialog for sig, og kommer tilbage til det sted, næste gang den åbnes. Dobbeltklik på titellinjen for at centrere den igen.

Fra tastaturet trykker du {{key:Alt}}+{{key:Shift}}+en piletast, mens fokus er inde i dialogen, for at flytte den 16 pixels ad gangen; tilføj {{key:Ctrl}} for 64. En dialog, der havner uden for skærmen (efter et mindre vindue eller en anden skærm), bringes tilbage.

På en telefon forbliver dialoger fuldbredde-ark og flyttes ikke.

I CadCraft Studio har CadCraft's dialog {{ui:Plot til PDF}}, som du kan lade stå åben, mens du arbejder, en knap i sin titellinje: {{ui:Åbn i eget vindue}}. Dialogen flytter ind i et vindue for sig selv, som du kan lægge på en anden skærm. Lukkes dialogen, lukkes vinduet, og lukkes vinduet, lukkes dialogen.

## Sæt panelerne tilbage

- Vælg {{ui:Sæt panelerne tilbage}} i panelvinduet, eller luk det blot. Panelerne går tilbage, hvor de var.
- Lukkes eller genindlæses hovedvinduet, lukkes panelvinduet også. Når appen åbner igen, siger den, at dine paneler var i deres eget vindue; vælg {{ui:Åbn det}} for at hente vinduet tilbage, eller {{ui:Behold dem her}}.
- {{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Nulstil layout}} sætter hvert panel tilbage, hvor det startede.

:::tip
Hvis intet åbner, når du flytter paneler til et nyt vindue, har browseren blokeret pop-up-vinduet. Appen siger det og lader panelerne blive, hvor de var. Tillad pop-up-vinduer for getcadcraft.com, og prøv igen.
:::

Layoutet gemmes for hver app i denne browser sammen med dine andre indstillinger.
