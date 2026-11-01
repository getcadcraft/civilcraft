---
title: Filer du kan åbne, gemme og eksportere
summary: Punktfiler, LandXML og CivilCraft-projekter ind; projekter, LandXML, DXF og PDF ud; hvad hver fil gemmer, hvor filerne havner, og hvad der ændrer sig offline.
keywords: åbn, gem, eksportér, importér, filformater, csv, txt, landxml, xml, dxf, pdf, json, download, projektfil
from: a7debb61
---

CivilCraft åbner filer fra din computer og gemmer ved at hente filer tilbage til den. Intet uploades, og intet gemmes på en server. Se også [Dine filer](common:your-files).

## Hvad den åbner

Klik på {{ui:Åbn}} (eller tryk {{key:Mod+O}}) og vælg en fil, eller træk filen fra {{pick:mac=Finder|windows=Stifinder|linux=din filhåndtering}} over på planen. Én fil ad gangen; filer over 200 MB afvises.

| Type | Filnavne | Hvad sker der |
|---|---|---|
| Punktfil | `.csv`, `.txt`, `.pnt`, `.xyz` (enhver tekstfil) | Dialogboksen **Importér punkter** åbnes. Punkterne erstatter projektets punkter; tracéer, byggeplateauer og rør bevares. |
| LandXML | `.xml`, `.landxml` | Der oprettes et **nyt projekt** ud fra filen (du bliver spurgt først, hvis det aktuelle har ikke-gemte ændringer). |
| CivilCraft-projekt | `.civilcraft.json` (enhver `.json`) | Projektet åbnes, som det blev gemt (du bliver spurgt først, hvis det aktuelle har ikke-gemte ændringer). |

CivilCraft afgør efter filendelsen og derefter efter filens første tegn: tekst, der begynder med `{`, læses som et projekt, tekst, der begynder med `<`, som LandXML, og alt andet som en punktfil. En fil, som åbn-dialogen gør gråt, kan stadig slippes på planen.

:::note
Import af en punktfil i et projekt, der allerede har punkter, erstatter dem uden at spørge, og det rydder fortrydelseshistorikken (når du åbner en fil, starter fortrydelse forfra). Hvis terrænet kom fra LandXML, skifter import af punkter det tilbage til et terræn bygget af punkterne. Gem først, hvis du måske vil have de gamle punkter tilbage.
:::

Detaljer: [Punktfilsformater](topic:point-file-formats), [LandXML: hvad der læses og skrives](topic:landxml-reference).

## Hvad den gemmer

{{ui:Gem}} ({{key:Mod+S}}) skriver to filer side om side, navngivet efter **Navn** i venstre panel: `<name>.civilcraft.json`, projektet, du fortsætter med at redigere, og `<name>.ifc`, samme design som IFC 4.3 til alle andre (se [IFC-eksport og -import](topic:ifc)). Hver fil registrerer den anden, og IFC-filen indeholder også en komprimeret kopi af projektet, så en IFC-fil, der sendes alene, stadig kan åbnes igen som fuldt redigerbar.

- **I Studio** skrives begge filer side om side, på stedet.
- **I Chrome og Edge** spørger den første gemning efter en mappe og skriver begge filer til den; senere gemninger går til samme mappe. Annullér mappespørgsmålet for i stedet at hente begge filer.
- **I andre browsere** hentes begge filer, projektfilen først.

Åbning af en af filerne leder efter den anden. Åbn begge sammen (eller slip begge), eller åbn én: i Studio findes den anden i samme mappe; i en browser spørger CivilCraft, om du vil tilføje den, eller fortsætte med den, du har. Hvis IFC-filen er ændret af et andet program, efter CivilCraft gemte den, eller den ene fil er ældre end den anden, åbnes projektet ud fra det nyeste design, og problempanelet fortæller, hvad der skete, med **Gem nu** (skriver begge filer igen) og **Vis IFC'ens geometri som reference**. En IFC-fil alene, som et andet program har ændret, åbnes ud fra sin kopi af projektet med det, der stadig passer: tracéer, den har ændret, får dens geometri; objekter, den har fjernet, udelades; og resten af dens ændringer vises på listen, men tages ikke i brug. En projektfil fra før 0.7.1 åbnes som før.

Projektfilen gemmer:

- alle punkter (nummer, koordinater, kote, beskrivelse) og navnet på den punktfil, de kom fra
- terrænindstillingerne: gruppevalg, tegnede brudlinjer, afgrænsningen, den længste ydre kant og et TIN læst fra LandXML
- visningsindstillingerne
- tracéer med deres PI'er, radier og startstation, deres designprofiler (PVI'er og kurvelængder) og korridorindstillinger
- byggeplateauer og rørnettet med dets regler

Den gemmer ikke fortrydelseshistorikken. Terræner, højdekurver, skæringslinjer og mængder gemmes ikke; de genopbygges ud fra de gemte inputs, når projektet åbnes. En projektfil fra en nyere CivilCraft afvises med en besked, der nævner dens version.

## Hvad den eksporterer

| Knap | Fil | Indhold |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punkter, det eksisterende terræn (og det planerede terræn, når der er et) som TIN-terræner, tracéer, terræn- og designprofiler, rørnettet |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF af liniearbejdet i planen, som det vises, på navngivne lag |
| {{ui:DWG}} | `<name>.dwg` | Det samme liniearbejde som en DWG-tegning, i det format du vælger (2000 til 2018) |
| {{ui:PDF}} | `<name>.pdf` | Et vektorplot af planen på et ark, i en målestok du vælger |
| {{ui:GLB}} eller {{ui:OBJ}} (på 3D-visningens værktøjslinje) | `<name>-3d.glb`, `<name>-3d.obj` | Hvad 3D-visningen viser som en 3D-model: meter, Y op, rigtig skala, om et registreret lokalt origo |

Hvad hver enkelt udelader: [Udveksling af LandXML](topic:landxml), [Eksportér planen til DXF](topic:dxf-export) (DWG også), [Plot planen til PDF](topic:plot-pdf), [Eksportér området i 3D](topic:export-3d).

## Hvor filerne havner

Gemte og eksporterede filer havner, hvor din browser lægger hentede filer, typisk mappen Overførsler. For at vælge en mappe hver gang:

:::chromium
Åbn browserens **Indstillinger**, derefter **Overførsler**, og slå **Spørg, hvor hver fil skal gemmes, før den hentes** til.
:::

:::firefox
Åbn **Indstillinger**, derefter **Generelt**, og under **Filer og programmer** vælg **Spørg altid, hvor filer skal gemmes**.
:::

:::safari
Åbn **Safari > Indstillinger > Generelt** og sæt **Placering af hentede filer** til **Spørg ved hver hentning**.
:::

Hvis du gemmer to gange med samme navn, kan browseren tilføje et nummer til den anden fil, for eksempel `Site (1).civilcraft.json`. Åbn den nyeste næste gang.

## Online og offline

CivilCraft virker kun på din computer under alle omstændigheder: åbning læser filen i browseren, gemning henter den. For at åbne CivilCraft uden forbindelse overhovedet, gem den til offlinebrug først:

1. Mens du er online, klik på {{ui:Gem til offline brug}} i appbaren øverst.
2. Knappen tæller op (»Gemmer 12 af 30«) og viser derefter {{ui:Klar offline}}. CivilCraft er lille (ca. 0.6 MB), så det tager et øjeblik. Den gemte kopi indeholder denne hjælp og eksempelområdet.
3. Uden forbindelse åbnes samme adresse (eller et bogmærke til den). Alt virker, inklusive {{ui:Åbn eksempelområdet}}.

Knappens øvrige tilstande:

- {{ui:Kunne ikke gemme}}: nogle filer blev ikke hentet. Tjek forbindelsen, og klik for at prøve igen.
- {{ui:Offline er ikke tilgængelig}}: dette browservindue kan ikke gemme en offlinekopi (private vinduer og nogle administrerede computere blokerer det). Brug et almindeligt vindue.

Klik på {{ui:Klar offline}} for at se, hvornår kopien blev gemt, med to valg: {{ui:Gem igen (hent den nyeste version)}} og {{ui:Fjern offlinekopien}}. Gem igen før et besøg på stedet, så kopien matcher den nyeste build. Mere under [Offline](common:offline).

:::offline
Du er offline nu. Hvis CivilCraft er gemt til offlinebrug, virker alt, inklusive eksempelområdet. Hvis ikke, bliver du ved med at arbejde i denne fane, men genindlæs den ikke, før du er online igen; uden en gemt kopi fejler {{ui:Åbn eksempelområdet}} med »Eksemplet kunne ikke indlæses«.
:::

:::tip
Til brug i felten: gem CivilCraft til offlinebrug, og tag dine punktfiler med på selve laptoppen. Projekter og eksporter gemmes som hentninger uden forbindelse, så du kan importere en dags målinger, kontrollere terrænet og gemme projektet på stedet.
:::

Gemning i skyen er ikke tilgængelig endnu, og desktopbuilds er ikke udgivet endnu. I dag er de filer, du gemmer, den eneste kopi: gem dem et sted, hvor der tages backup.

## Add-ons en fil bruger

Når du gemmer et projekt, der indeholder data fra et add-on (Byggeregler-afkrydsningerne eller en Address to site-kilde), noterer filen, hvilke add-ons og hvilke versioner. Åbner du den på en computer, der mangler et af dem, siger en linje over planen det og tilbyder at tilføje det fra din kontos liste. Noteringen er kun en oplysning: filen åbnes under alle omstændigheder.

## Fortryd fra Studio

Inde i CadCraft Studio meldes hvert trin, du afslutter i CivilCraft, til Studio, så dens fortrydelse på projektniveau kan tage det seneste trin tilbage på tværs af programmerne. Studio fortryder kun et trin, når CivilCrafts egen fortrydelsesstak er præcis, som trinnet efterlod den; når du åbner en anden fil, springer den dette vindue over.

## Lukning med ikke-gemte ændringer

Når projektet har ikke-gemte ændringer, og du lukker fanen, genindlæser siden eller forlader siden, spørger browseren, om du vil forlade den. Dens formulering og udseende hører til browseren og kan ikke ændres af CivilCraft. {{ui:Ny}} og åbning af et projekt- eller LandXML-fil spørger i stedet i CivilCrafts egen boks **Ikke-gemte ændringer** med {{ui:Annuller}}, {{ui:Gem ikke}} og {{ui:Gem en kopi}}.
