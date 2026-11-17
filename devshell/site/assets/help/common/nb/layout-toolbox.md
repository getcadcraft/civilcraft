---
title: Arbeid i layouten med verktøykasse og infoboks
summary: Bytt appen til en kolonne med verktøy til venstre med plass til dine egne, en infoboks over toppen som følger det kjørende verktøyet eller det du valgte, en navigator til høyre, en fane for hver visning, hurtigvalg og en redigeringspalett, og bytt tilbake til den klassiske layouten når du vil.
keywords: layout, arbeidsområde, verktøykasse, verktøykolonne, infoboks, infolinje, navigator, prosjektkart, hurtiglinje, hurtigvalg, redigeringspalett, hurtigpalett, mine verktøy, favorittverktøy, visningsfaner, verktøykassevindu, klassisk layout, endre layout, bytt layout
from: ec341666
---

**Verktøykasse og infoboks** er et av appens tre layouter for arbeidsområdet. Tegneverktøyene står i en kolonne til venstre, en infoboks over toppen viser hva det kjørende verktøyet trenger eller det du har valgt, hver visning har en fane, og en hurtiglinje under tegningen holder noen daglige valg. Verktøyene er appens egne: alt du kan gjøre i den klassiske layouten, fungerer også her, og tegningen, menystilen og tastene dine forblir som de er.

## Velg den

1. Åpne {{ui:Innstillinger}} (tannhjulet, eller {{key:Mod+,}}).
2. Velg fanen {{ui:Globalt}}, og gå til {{ui:Layout}} › {{ui:Arbeidsområde}}.
3. Velg {{ui:Verktøykasse og infoboks}}.

Layouten endres med en gang. Valget gjelder for alle apper i denne nettleseren: hver app åpnes i den fra da av, og den er på plass før siden tegnes, så du ser aldri den klassiske layouten først.

## Hva som er hvor

- **Verktøylinje:** appens egen verktøylinje blir øverst i tegneområdet, med sine menyer.
- **Infoboks:** under verktøylinjen. Mens et verktøy kjører, viser den verktøyet og det det ber om. Når du velger noe, viser den hovedinnstillingene (for en vegg: type, tykkelse, lengde, plasseringslinje og høyde), og du kan endre dem der: en endring der er den samme som i Egenskaper, og {{key:Mod+Z}} angrer den. Uten noe valgt står det «Ingenting er valgt». Hver app legger til egne bokser her, som det aktive layeret eller nivået, eller det åpne dokumentet.
- **Verktøykasse:** kolonnen til venstre, appens verktøy i grupper. Klikk på en gruppes navn for å skjule den eller åpne den igjen. Verktøyet som kjører, er tent.
- **Mine verktøy:** første gruppe i verktøykassen, åtte tomme plasser for verktøyene du bruker mest. Klikk en tom plass for å velge et hvilket som helst verktøy eller en kommando i appen; eller høyreklikk et verktøy i verktøykassen og velg {{ui:Legg til i Mine verktøy}}; eller dra et verktøy til en plass. Høyreklikk en plass for å endre den eller tømme den. Plassene dine lagres for hver app i denne nettleseren.
- **Navigator:** høyre panel. Appens prosjektleser står øverst (planer, snitt, fasader, 3D-visninger, tabeller, ark, så langt appen har dem): klikk på en for å åpne den. Under den står {{ui:Egenskaper}} og en fane med høyre panels andre innhold.
- **Visningsfaner:** en fane for hver visning i den åpne filen (et ark, en plan, en scene…), over tegningen.
- **Hurtiglinje:** under tegningen, visningsinnstillingene og de daglige valgene appen har, for eksempel målestokk, detaljnivå, visningsområde, tilpass, plan, del eller 3D, fang og enheter.
- **Redigeringspalett:** klikk på noe i tegningen, og en liten palett kommer ved pekeren med appens redigeringskommandoer for det, for eksempel flytt, kopier, roter, speil, dupliser eller slett, og {{ui:Egenskaper}}. {{key:Esc}}, musehjulet, et nytt klikk eller lukkeknappen skjuler den.

Et verktøy som ikke kan kjøres akkurat nå, er gråtonet, og verktøytipset sier hvorfor. Klikk på det, eller trykk {{key:Enter}} på det, for å lese årsaken i en boks.

{{key:Esc}} avslutter det kjørende verktøyet først, som i den klassiske layouten, og alle snarveier og {{key:Ctrl+Shift+F}} (skjermmodus) virker som før.

## Gi verktøykassen et eget vindu

{{ui:Flytt verktøykassen}}-knappen øverst i verktøykassen har {{ui:Flytt til et nytt vindu}}: verktøykassen åpnes i et smalt eget vindu som du kan sette ved siden av appen eller på en andre skjerm. Taster som trykkes der, når appen. {{ui:Sett verktøykassen tilbake}}, eller lukking av vinduet, tar den hjem igjen.

Verktøylinjeinnstillingene gjelder også verktøykassen: {{ui:Innstillinger}} › {{ui:Globalt}} › {{ui:Verktøylinje}} › {{ui:Ikoner og etiketter}}, {{ui:Bare ikoner}} eller {{ui:Bare etiketter}}, og {{ui:Vis gruppenavn (Fil, Tegn, …)}}.

## Panelene dine forblir dine

Venstre og høyre panel beholder alt som er beskrevet i [Ordne panelene](common:arrange-panels): feste, flytte over tegningen, skjule automatisk, skjule, faner, {{ui:Flytt til et nytt vindu}} og {{ui:Tilbakestill layout}}.

## Gå tilbake til den klassiske layouten

Åpne {{ui:Innstillinger}} › {{ui:Globalt}} › {{ui:Layout}} › {{ui:Arbeidsområde}} og velg {{ui:CadCraft klassisk}}. Hver verktøylinje, fane og panel går tilbake dit det var.

:::note
På en telefon, eller i et vindu på 760 piksler bredt eller smalere, bruker appen telefonlayouten uansett hva du valgte. Et bredere vindu henter layouten din tilbake.
:::

For å prøve et annet oppsett, se [layouten med bånd og prosjektleser](common:layout-ribbon).

For å endre hva denne layouten viser, se [Endre en layout på skjermen](common:layout-edit); for et mørkt oppsett med menylinje og bånd, se [tegnelayouten](common:layout-drafting).
