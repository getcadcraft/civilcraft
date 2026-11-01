---
title: Filer du kan åpne, lagre og eksportere
summary: Punktfiler, LandXML og CivilCraft-prosjekter inn; prosjekter, LandXML, DXF og PDF ut; hva hver lagrer, hvor filene havner, og hva som endres frakoblet.
keywords: åpne, lagre, eksportere, importere, filformater, csv, txt, landxml, xml, dxf, pdf, json, last ned, prosjektfil
from: a7debb61
---

CivilCraft åpner filer fra datamaskinen din og lagrer ved å laste dem ned til den igjen. Ingenting lastes opp, og ingenting lagres på en server. Se også [Dine filer](common:your-files).

## Hva den åpner

Klikk {{ui:Åpne}} (eller trykk {{key:Mod+O}}) og velg en fil, eller dra filen fra {{pick:mac=Finder|windows=Filutforsker|linux=filbehandleren din}} over til planen. Én fil om gangen; filer over 200 MB avvises.

| Type | Filnavn | Hva skjer |
|---|---|---|
| Punktfil | `.csv`, `.txt`, `.pnt`, `.xyz` (enhver tekstfil) | Dialogboksen **Importer punkter** åpnes. Punktene erstatter prosjektets punkter; veglinjer, byggeplater og rør blir værende. |
| LandXML | `.xml`, `.landxml` | Et **nytt prosjekt** lages fra filen (du blir spurt først hvis det nåværende har ulagrede endringer). |
| CivilCraft-prosjekt | `.civilcraft.json` (enhver `.json`) | Prosjektet åpnes slik det var lagret (du blir spurt først hvis det nåværende har ulagrede endringer). |

CivilCraft avgjør etter filendelsen, og deretter etter de første tegnene: tekst som starter med `{` leses som et prosjekt, tekst som starter med `<` som LandXML, og alt annet som en punktfil. En fil som åpne-dialogen gråtoner, kan likevel slippes på planen.

:::note
Import av en punktfil i et prosjekt som allerede har punkter, erstatter dem uten å spørre, og det tømmer angrehistorikken (å åpne en hvilken som helst fil er en ny start for angre). Hvis terrengmodellen kom fra LandXML, bytter import av punkter den tilbake til en terrengmodell bygget av punktene. Lagre først hvis du kanskje vil ha de gamle punktene tilbake.
:::

Detaljer: [Punktfilformater](topic:point-file-formats), [LandXML: hva som leses og skrives](topic:landxml-reference).

## Hva den lagrer

{{ui:Lagre}} ({{key:Mod+S}}) skriver to filer side om side, oppkalt etter **Navn** i venstre panel: `<name>.civilcraft.json`, prosjektet du fortsetter å redigere, og `<name>.ifc`, den samme utformingen som IFC 4.3 for alle andre (se [IFC-eksport og -import](topic:ifc)). Hver fil registrerer den andre, og IFC-filen har også en komprimert kopi av prosjektet, slik at en IFC som sendes alene fortsatt kan åpnes igjen og redigeres fullt ut.

- **I Studio** skrives begge filene ved siden av hverandre, på stedet.
- **I Chrome og Edge** spør første lagring etter en mappe og skriver begge filene dit; senere lagringer går til samme mappe. Avbryt mappespørsmålet for i stedet å laste ned begge.
- **I andre nettlesere** lastes begge filene ned, prosjektfilen først.

Åpning av en av filene ser etter den andre. Åpne begge sammen (eller slipp begge), eller åpne én: i Studio finnes den andre i samme mappe; i en nettleser ber CivilCraft deg legge den til, eller fortsette med den du har. Hvis IFC-filen ble endret av et annet program etter at CivilCraft lagret den, eller den ene filen er eldre enn den andre, åpnes prosjektet fra den nyeste utformingen, og panelet **Problemer** forteller hva som skjedde, med **Lagre nå** (skriver begge filene på nytt) og **Vis IFC-geometrien som referanse**. En IFC alene som et annet program har endret, åpnes fra sin kopi av prosjektet med det som fortsatt stemmer: veglinjer den har endret, får sin geometri, objekter den har fjernet, utelates, og resten av endringene listes opp, men tas ikke med. En prosjektfil fra før 0.7.1 åpnes som før.

Prosjektfilen beholder:

- alle punkter (nummer, koordinater, kote, beskrivelse) og navnet på punktfilen de kom fra
- innstillingene for terrengmodellen: gruppevalg, tegnede bruddlinjer, grensen, den lengste ytterkanten, og en TIN lest fra LandXML
- visningsinnstillingene
- veglinjer med deres PI-er, radier og startprofilnummer, deres designprofiler (PVI-er og kurvelengder) og korridorinnstillinger
- byggeplater og rørnettet med dets regler

Den beholder ikke angrehistorikken. Terrengmodeller, høydekurver, skjæringsskjæringer og volumer lagres ikke; de bygges på nytt fra de lagrede inndataene når prosjektet åpnes. En prosjektfil fra en nyere CivilCraft avvises med en melding som oppgir versjonen.

## Hva den eksporterer

| Knapp | Fil | Innhold |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punkter, eksisterende terreng (og den planerte terrengmodellen når det finnes en) som TIN-flater, veglinjer, terreng- og designprofiler, rørnettet |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF av planlinjeverket slik det vises, på navngitte layere |
| {{ui:DWG}} | `<name>.dwg` | Den samme linjeføringen som en DWG-tegning, i formatet du velger (2000 til 2018) |
| {{ui:PDF}} | `<name>.pdf` | En vektorplott av planen på et ark, i en målestokk du velger |
| {{ui:GLB}} eller {{ui:OBJ}} (på 3D-visningens verktøylinje) | `<name>-3d.glb`, `<name>-3d.obj` | Det 3D-visningen viser som en 3D-modell: meter, Y opp, riktig målestokk, rundt et lagret lokalt origo |

Hva hver enkelt utelater: [Utveksle LandXML](topic:landxml), [Eksporter planen til DXF](topic:dxf-export) (DWG også), [Plott planen til PDF](topic:plot-pdf), [Eksporter tomten i 3D](topic:export-3d).

## Hvor filene havner

Lagrede og eksporterte filer havner der nettleseren legger nedlastinger, vanligvis mappen Nedlastinger. For å velge en mappe hver gang:

:::chromium
Åpne nettleserens **Innstillinger**, deretter **Nedlastinger**, og slå på **Spør hvor hver fil skal lagres før nedlasting**.
:::

:::firefox
Åpne **Innstillinger**, deretter **Generelt**, og velg under **Filer og programmer** **Spør alltid hvor filer skal lagres**.
:::

:::safari
Åpne **Safari > Innstillinger > Generelt** og sett **Plassering for nedlastede filer** til **Spør for hver nedlasting**.
:::

Hvis du lagrer to ganger med samme navn, kan nettleseren legge til et tall på den andre filen, for eksempel `Site (1).civilcraft.json`. Åpne den nyeste neste gang.

## Tilkoblet og frakoblet

CivilCraft fungerer bare på datamaskinen din uansett: åpning leser filen i nettleseren, lagring laster den ned. For å åpne CivilCraft uten noen forbindelse i det hele tatt, lagre den for frakoblet bruk først:

1. Mens du er tilkoblet, klikk {{ui:Lagre for frakoblet bruk}} i verktøylinjen øverst.
2. Knappen teller opp («Lagrer 12 av 30») og viser deretter {{ui:Klar frakoblet}}. CivilCraft er lite (omtrent 0.6 MB), så dette tar et øyeblikk. Den lagrede kopien inkluderer denne hjelpen og eksempelområdet.
3. Uten forbindelse åpner du samme adresse (eller et bokmerke til den). Alt fungerer, inkludert {{ui:Åpne eksempelområdet}}.

Knappens andre tilstander:

- {{ui:Kunne ikke lagre}}: noen filer ble ikke lastet ned. Sjekk forbindelsen og klikk den for å prøve igjen.
- {{ui:Frakoblet bruk er ikke tilgjengelig}}: dette nettleservinduet kan ikke beholde en frakoblet kopi (private vinduer og noen administrerte datamaskiner blokkerer det). Bruk et vanlig vindu.

Klikk {{ui:Klar frakoblet}} for å se når kopien ble lagret, med to valg: {{ui:Lagre på nytt (hent nyeste versjon)}} og {{ui:Fjern den frakoblede kopien}}. Lagre på nytt før et besøk på tomten, slik at kopien samsvarer med den nyeste versjonen. Mer i [Frakoblet](common:offline).

:::offline
Du er frakoblet nå. Hvis CivilCraft ble lagret for frakoblet bruk, fungerer alt, inkludert eksempelområdet. Hvis ikke, fortsett å jobbe i denne fanen, men ikke last den inn på nytt før du er tilkoblet igjen; uten en lagret kopi mislykkes {{ui:Åpne eksempelområdet}} med «Eksempelet kunne ikke lastes».
:::

:::tip
Ved bruk i felt: lagre CivilCraft for frakoblet bruk og ha punktfilene dine på selve den bærbare datamaskinen. Prosjekter og eksporter lagres som nedlastinger uten forbindelse, så du kan importere dagens målinger, kontrollere terrengmodellen og lagre prosjektet på stedet.
:::

Skylagring er ikke tilgjengelig ennå, og skrivebordsversjoner er ikke ute ennå. I dag er filene du lagrer den eneste kopien: oppbevar dem et sted som sikkerhetskopieres.

## Tillegg en fil bruker

Når du lagrer et prosjekt som inneholder data fra et tillegg (avmerkingene for Byggeforskrifter, eller en Adresse til tomt-kilde), registrerer filen hvilke tillegg og hvilke versjoner. Åpner du den på en datamaskin som mangler ett, sier en linje over planen fra, og tilbyr å legge det til fra kontolisten din. Registreringen er bare et notat: filen åpnes uansett.

## Angre fra Studio

I CadCraft Studio meldes hvert steg du fullfører i CivilCraft til Studio, slik at dets angring på prosjektnivå kan ta tilbake det siste steget på tvers av programmer. Studio angrer bare et steg når CivilCraft sin egen angrestabel er akkurat slik steget la den; etter at du åpner en annen fil, hopper den over dette vinduet.

## Lukke med ulagrede endringer

Når prosjektet har ulagrede endringer og du lukker fanen, laster inn siden på nytt, eller forlater siden, spør nettleseren om du vil forlate den. Ordlyden og utseendet hører til nettleseren og kan ikke endres av CivilCraft. {{ui:Ny}}, og åpning av et prosjekt- eller LandXML-fil, spør i stedet i CivilCraft sin egen boks for **Ulagrede endringer**, med {{ui:Avbryt}}, {{ui:Ikke lagre}} og {{ui:Lagre en kopi}}.
