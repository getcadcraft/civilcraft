---
title: Filer du kan åpne, lagre og eksportere
summary: Punktfiler, LandXML og CivilCraft-prosjekter inn; prosjekter, LandXML, DXF og PDF ut; hva hver fil beholder, hvor filene havner, og hva som endrer seg frakoblet.
keywords: åpne, lagre, eksporter, importer, filformater, csv, txt, landxml, xml, dxf, pdf, json, last ned, prosjektfil
from: 82bff559
---

CivilCraft åpner filer fra datamaskinen din og lagrer ved å laste dem ned til den igjen. Ingenting lastes opp, og ingenting lagres på en server. Se også [Dine filer](common:your-files).

## Hva den åpner

Klikk {{ui:Open}} (eller trykk {{key:Mod+O}}) og velg en fil, eller dra filen fra {{pick:mac=Finder|windows=Utforsker|linux=filbehandleren din}} over planen. Én fil om gangen; filer over 200 MB avvises. En LandXML- eller prosjektfil over 32 MB leses i biter på omtrent 4 MB, aldri som én tekstblokk. Mens en LandXML-fil åpnes, må du regne med at den bruker omtrent 13 ganger filstørrelsen i minnet (en fil på 69 MB brukte omtrent 0.9 GB i vår test).

| Type | Filnavn | Hva skjer |
|---|---|---|
| Punktfil | `.csv`, `.txt`, `.pnt`, `.xyz` (enhver tekstfil) | Dialogboksen **Importer punkter** åpnes. Punktene erstatter prosjektets punkter; veglinjer, byggeplater og rør blir værende. |
| LandXML | `.xml`, `.landxml` | Et **nytt prosjekt** lages fra filen (du blir spurt først hvis det nåværende har ulagrede endringer). |
| CivilCraft-prosjekt | `.civilcraft.json` (enhver `.json`) | Prosjektet åpnes slik det ble lagret (du blir spurt først hvis det nåværende har ulagrede endringer). |

CivilCraft avgjør etter filendelsen, deretter etter de første tegnene: tekst som begynner med `{` leses som et prosjekt, tekst som begynner med `<` som LandXML, alt annet som en punktfil. En fil som åpne-boksen gråner ut, kan fortsatt slippes på planen.

:::note
Importerer du en punktfil i et prosjekt som allerede har punkter, erstattes de uten å spørre, og angrehistorikken tømmes (å åpne en fil er alltid en ny start for angre). Hvis terrengmodellen kom fra LandXML, går den over til en modell bygget av punktene når du importerer punkter. Lagre først hvis du kanskje vil ha de gamle punktene tilbake.
:::

Detaljer: [Punktfilformater](topic:point-file-formats), [LandXML: hva som leses og skrives](topic:landxml-reference).

## Hva den lagrer

{{ui:Save}} ({{key:Mod+S}}) skriver to filer ved siden av hverandre, navngitt etter **Navn** i venstre panel: `<navn>.civilcraft.json`, prosjektet du fortsetter å redigere, og `<navn>.ifc`, den samme utformingen som IFC 4.3 for andre (se [IFC-eksport og -import](topic:ifc)). Hver fil peker på den andre, og IFC-filen inneholder også en komprimert kopi av prosjektet, slik at en IFC som sendes alene, fortsatt kan åpnes fullt redigerbar.

- **I Studio** skrives begge filene ved siden av hverandre, på stedet.
- **I Chrome og Edge** spør første lagring etter en mappe og skriver begge dit; senere lagringer går til samme mappe. Avbryter du mappevalget, lastes begge ned i stedet.
- **I andre nettlesere** lastes begge filene ned, prosjektfilen først.

Når du åpner en av filene, leter CivilCraft etter den andre. Åpne begge sammen (eller slipp begge), eller åpne én: i Studio finnes den andre i samme mappe; i en nettleser spør CivilCraft om du vil legge den til, eller om du vil fortsette med den du har. Hvis IFC-filen er endret av et annet program etter at CivilCraft lagret den, eller den ene filen er eldre enn den andre, åpnes prosjektet fra den nyeste utformingen, og Problemer-panelet forklarer hva som skjedde, med **Lagre nå** (skriver begge filene på nytt) og **Vis IFC-ens geometri som referanse**. En IFC alene som et annet program har endret, åpnes fra sin kopi av prosjektet med det som fortsatt stemmer: linjer den har endret, får sin geometri; objekter den har fjernet, utelates; resten av endringene listes opp, men tas ikke med. En prosjektfil fra før 0.7.1 åpnes som før.

Prosjektfilen beholder:

- hvert punkt (nummer, koordinater, høyde, beskrivelse) og navnet på punktfilen de kom fra
- innstillingene for terrengmodellen: gruppevalg, tegnede bruddlinjer, grensen, den lengste ytre kanten og en TIN lest fra LandXML
- visningsinnstillingene
- veglinjer med PI-ene, radiene og startprofilnummeret, lengdeprofilene deres (PVI-er og kurvelengder) og korridorinnstillingene
- byggeplater og rørnettet med reglene sine

Den beholder ikke angrehistorikken. Terrengmodeller, høydekurver, dagslinjer og volumer lagres ikke; de bygges på nytt fra de lagrede inndataene når prosjektet åpnes. En prosjektfil fra en nyere CivilCraft avvises med en melding som oppgir versjonen.

## Hva den eksporterer

| Knapp | Fil | Innhold |
|---|---|---|
| {{ui:LandXML}} | `<navn>.xml` | LandXML 1.2: punkter, eksisterende terreng (og den bygde overflaten når den finnes) som TIN-flater, veglinjer, terreng- og designprofiler, rørnettet |
| {{ui:DXF}} | `<navn>.dxf` | R12 DXF av plantegningen slik den vises, på navngitte lag |
| {{ui:DWG}} | `<navn>.dwg` | De samme linjene som en DWG-tegning, i formatet du velger (2000 til 2018) |
| {{ui:PDF}} | `<navn>.pdf` | En vektorplott av planen på et ark, i en målestokk du velger |
| {{ui:GLB}} eller {{ui:OBJ}} (på 3D-visningens linje) | `<navn>-3d.glb`, `<navn>-3d.obj` | Det 3D-visningen viser som en 3D-modell: meter, Y opp, riktig målestokk, rundt et registrert lokalt origo |

Hva hver av dem utelater: [Utveksling med LandXML](topic:landxml), [Eksporter planen til DXF](topic:dxf-export) (DWG også), [Plott planen til PDF](topic:plot-pdf), [Eksporter området i 3D](topic:export-3d).

## Hvor filene havner

Lagrede og eksporterte filer går dit nettleseren legger nedlastinger, vanligvis mappen Nedlastinger. For å velge mappe hver gang:

:::chromium
Åpne nettleserens **Innstillinger**, deretter **Nedlastinger**, og slå på **Spør hvor hver fil skal lagres før nedlasting**.
:::

:::firefox
Åpne **Innstillinger**, deretter **Generelt**, og under **Filer og programmer** velg **Spør alltid hvor filer skal lagres**.
:::

:::safari
Åpne **Safari > Innstillinger > Generelt** og sett **Plassering for nedlasting av filer** til **Spør for hver nedlasting**.
:::

Lagrer du to ganger med samme navn, kan nettleseren legge et nummer til den andre filen, for eksempel `Tomt (1).civilcraft.json`. Åpne den nyeste neste gang.

## Online og frakoblet

CivilCraft fungerer uansett bare på datamaskinen din: åpning leser filen i nettleseren, lagring laster den ned. For å åpne CivilCraft uten noen tilkobling i det hele tatt, lagre det for frakoblet bruk først:

1. Mens du er tilkoblet, klikk {{ui:Save for offline}} i appfeltet øverst.
2. Knappen teller opp («Lagrer 12 av 30») og viser deretter {{ui:Offline ready}}. CivilCraft er lite (omtrent 0.6 MB), så dette tar et øyeblikk. Den lagrede kopien inkluderer denne hjelpen og eksempeltomten.
3. Uten tilkobling åpner du samme adresse (eller et bokmerke til den). Alt fungerer, inkludert {{ui:Åpne eksempeltomten}}.

Knappens andre tilstander:

- {{ui:Could not save}}: noen filer ble ikke lastet ned. Sjekk tilkoblingen og klikk for å prøve igjen.
- {{ui:Offline not available}}: denne nettleservinduet kan ikke ta vare på en frakoblet kopi (private vinduer og noen administrerte datamaskiner blokkerer det). Bruk et vanlig vindu.

Klikk {{ui:Offline ready}} for å se når kopien ble lagret, med to valg: {{ui:Save again (get the newest version)}} og {{ui:Remove the offline copy}}. Lagre på nytt før et besøk på tomten, slik at kopien stemmer med den nyeste versjonen. Mer i [Frakoblet](common:offline).

:::offline
Du er frakoblet nå. Hvis CivilCraft er lagret for frakoblet bruk, fungerer alt, inkludert eksempeltomten. Hvis ikke, fortsett å arbeide i denne fanen, men ikke last den inn på nytt før du er tilkoblet igjen; uten lagret kopi vil {{ui:Åpne eksempeltomten}} mislykkes med «Eksempelet kunne ikke lastes».
:::

:::tip
For bruk i felt: lagre CivilCraft for frakoblet bruk og ta med punktfilene dine på selve den bærbare datamaskinen. Prosjekter og eksporter lagres som nedlastinger uten tilkobling, så du kan importere en dags målinger, kontrollere terrengmodellen og lagre prosjektet på stedet.
:::

Skylagring er ikke tilgjengelig ennå, og skrivebordsversjoner er ikke ute ennå. Foreløpig er filene du lagrer den eneste kopien: oppbevar dem et sted som er sikkerhetskopiert.

## Tillegg som en fil bruker

Når du lagrer et prosjekt som inneholder data fra et tillegg (avmerkingene for byggeforskrift, eller en adresse-til-tomt-kilde), registrerer filen hvilke tillegg og hvilke versjoner. Åpner du den på en datamaskin som mangler ett, viser en linje over planen det og tilbyr å legge det til fra kontolisten din. Registreringen er bare et notat: filen åpnes uansett.

## Angre fra Studio

Inne i CadCraft Studio blir hvert steg du fullfører i CivilCraft meldt til Studio, slik at prosjektnivåets angre kan ta tilbake det siste steget på tvers av apper. Studio angrer bare et steg når CivilCraft sin egen angrestabel er akkurat slik steget la den; etter at du åpner en annen fil, hopper den over dette vinduet.

## Lukke med ulagrede endringer

Når prosjektet har ulagrede endringer og du lukker fanen, laster siden inn på nytt eller forlater siden, spør nettleseren om du vil forlate siden. Ordlyden og utseendet hører til nettleseren og kan ikke endres av CivilCraft. {{ui:New}}, og åpning av et prosjekt eller en LandXML-fil, spør i stedet i CivilCraft sin egen boks **Ulagrede endringer**, med {{ui:Avbryt}}, {{ui:Ikke lagre}} og {{ui:Lagre en kopi}}.
