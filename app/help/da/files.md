---
title: Filer du kan åbne, gemme og eksportere
summary: Punktfiler, LandXML og CivilCraft-projekter ind; projekter, LandXML, DXF og PDF ud; hvad hver gemmer, hvor filerne går hen, og hvad der ændrer sig offline.
keywords: åbn, gem, eksportér, importér, filformater, csv, txt, landxml, xml, dxf, pdf, json, download, projektfil
from: 82bff559
---

CivilCraft åbner filer fra din computer og gemmer ved at hente filer tilbage til den. Intet uploades, og intet gemmes på en server. Se også [Dine filer](common:your-files).

## Hvad den åbner

Klik på {{ui:Open}} (eller tryk {{key:Mod+O}}) og vælg en fil, eller træk filen fra {{pick:mac=Finder|windows=File Explorer|linux=din filhåndtering}} over planen. En fil ad gangen; filer over 200 MB afvises. En LandXML- eller projektfil over 32 MB læses i stykker på omkring 4 MB, aldrig som én tekstblok. Mens en LandXML åbnes, skal du regne med, at den bruger omkring 13 gange filens størrelse i hukommelsen (en 69 MB-fil brugte omkring 0.9 GB i vores test).

| Type | Filnavne | Hvad sker der |
|---|---|---|
| Punktfil | `.csv`, `.txt`, `.pnt`, `.xyz` (enhver tekstfil) | Dialogen **Importér punkter** åbnes. Punkterne erstatter projektets punkter; linjeføringer, byggeplateauer og rør bliver. |
| LandXML | `.xml`, `.landxml` | Der laves et **nyt projekt** ud fra filen (du bliver spurgt først, hvis det nuværende projekt har ikke-gemte ændringer). |
| CivilCraft-projekt | `.civilcraft.json` (enhver `.json`) | Projektet åbnes, som det blev gemt (du bliver spurgt først, hvis det nuværende projekt har ikke-gemte ændringer). |

CivilCraft afgør efter filens endelse, og derefter efter de første tegn: tekst, der starter med `{`, læses som et projekt, tekst, der starter med `<`, som LandXML, og alt andet som en punktfil. En fil, som åbn-boksen gråner ud, kan stadig slippes på planen.

:::note
Import af en punktfil i et projekt, der allerede har punkter, erstatter dem uden at spørge, og det rydder fortrydelseshistorikken (at åbne en fil er en ny start for fortryd). Hvis overfladen kom fra LandXML, skifter import af punkter den tilbage til en overflade bygget af punkterne. Gem først, hvis du måske vil have de gamle punkter tilbage.
:::

Detaljer: [Punktfilformater](topic:point-file-formats), [LandXML: hvad der læses og skrives](topic:landxml-reference).

## Hvad den gemmer

{{ui:Save}} ({{key:Mod+S}}) skriver to filer side om side, navngivet efter **Navn** i venstre panel: `<name>.civilcraft.json`, projektet du fortsætter med at redigere, og `<name>.ifc`, det samme design som IFC 4.3 til alle andre (se [IFC-eksport og -import](topic:ifc)). Hver fil peger på den anden, og IFC-filen indeholder også en komprimeret kopi af projektet, så en IFC, der sendes alene, stadig kan åbnes igen som et fuldt redigerbart projekt.

- **I Studio** skrives begge filer ved siden af hinanden, på stedet.
- **I Chrome og Edge** beder den første gemning om en mappe og skriver begge filer til den; senere gemninger går til samme mappe. Annuller mappespørgsmålet for i stedet at hente begge filer.
- **I andre browsere** hentes begge filer, projektfilen først.

Når du åbner en af filerne, leder CivilCraft efter den anden. Åbn begge sammen (eller træk dem begge), eller åbn kun én: i Studio findes den anden i samme mappe; i en browser beder CivilCraft dig om at tilføje den, eller om at fortsætte med den, du har. Hvis IFC-filen er ændret af et andet program, efter CivilCraft gemte den, eller hvis den ene fil er ældre end den anden, åbnes projektet ud fra det nyeste design, og panelet **Problemer** forklarer, hvad der skete, med **Gem nu** (skriver begge filer igen) og **Vis IFC'ens geometri som reference**. En IFC alene, som et andet program har ændret, åbnes ud fra sin kopi af projektet med det, der stadig passer: linjeføringer, som den har ændret, får dens geometri; objekter, den har fjernet, udelades, og resten af dens ændringer vises på en liste, men tages ikke over. En projektfil fra før 0.7.1 åbnes som før.

Projektfilen gemmer:

- alle punkter (nummer, koordinater, kote, beskrivelse) og navnet på den punktfil, de kom fra
- overfladeindstillingerne: gruppevalg, tegnede brudlinjer, grænsen, den længste ydre kant og et TIN læst fra LandXML
- visningsindstillingerne
- linjeføringer med deres PI'er, radier og startstation, deres designprofiler (PVI'er og kurvelængder) og korridorindstillinger
- byggeplateauer og rørnettet med dets regler

Den gemmer ikke fortrydelseshistorikken. Overflader, højdekurver, skæringslinjer i terræn og volumener gemmes ikke; de genopbygges ud fra de gemte input, når projektet åbnes. En projektfil fra en nyere CivilCraft afvises med en besked, der nævner dens version.

## Hvad den eksporterer

| Knap | Fil | Indhold |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punkter, det eksisterende terræn (og den planerede overflade, når der er en) som TIN-overflader, linjeføringer, terræn- og designprofiler, rørnettet |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF af planens linjer, som de vises, på navngivne lag |
| {{ui:DWG}} | `<name>.dwg` | De samme linjer som en DWG-tegning, i det format du vælger (2000 til 2018) |
| {{ui:PDF}} | `<name>.pdf` | En vektorplot af planen på et ark i en skala, du vælger |
| {{ui:GLB}} eller {{ui:OBJ}} (på 3D-visningens værktøjslinje) | `<name>-3d.glb`, `<name>-3d.obj` | Det, 3D-visningen viser, som en 3D-model: meter, Y op, rigtig skala, omkring en registreret lokal oprindelse |

Hvad hver enkelt udelader: [Udveksling af LandXML](topic:landxml), [Eksportér planen til DXF](topic:dxf-export) (DWG også), [Plot planen til PDF](topic:plot-pdf), [Eksportér stedet i 3D](topic:export-3d).

## Hvor filerne går hen

Gemte og eksporterede filer går dertil, hvor din browser placerer overførsler, normalt mappen Overførsler. For at vælge en mappe hver gang:

:::chromium
Åbn browserens **Indstillinger**, derefter **Overførsler**, og slå **Spørg, hvor hver fil skal gemmes, før den hentes** til.
:::

:::firefox
Åbn **Indstillinger**, derefter **Generelt**, og vælg under **Filer og programmer** **Spørg altid, hvor filer skal gemmes**.
:::

:::safari
Åbn **Safari > Indstillinger > Generelt** og sæt **Placering af filhentninger** til **Spørg ved hver hentning**.
:::

Hvis du gemmer to gange med samme navn, kan browseren tilføje et nummer til den anden fil, for eksempel `Site (1).civilcraft.json`. Åbn den nyeste næste gang.

## Online og offline

CivilCraft virker kun på din computer under alle omstændigheder: åbning læser filen i browseren, og gemning henter den. For at åbne CivilCraft uden nogen forbindelse overhovedet skal du først gemme den til offline brug:

1. Mens du er online, klik på {{ui:Save for offline}} i appbaren øverst.
2. Knappen tæller op ("Gemmer 12 af 30") og viser derefter {{ui:Offline ready}}. CivilCraft er lille (omkring 0.6 MB), så det tager et øjeblik. Den gemte kopi inkluderer denne hjælp og eksempelstedet.
3. Uden forbindelse åbner du samme adresse (eller et bogmærke til den). Alt virker, inklusive {{ui:Åbn eksempelstedet}}.

Knappens andre tilstande:

- {{ui:Kunne ikke gemme}}: nogle filer blev ikke hentet. Kontrollér forbindelsen, og klik for at prøve igen.
- {{ui:Offline er ikke tilgængelig}}: dette browservindue kan ikke gemme en offlinekopi (private vinduer og nogle administrerede computere blokerer det). Brug et normalt vindue.

Klik på {{ui:Klar offline}} for at se, hvornår kopien blev gemt, med to valg: {{ui:Gem igen (hent den nyeste version)}} og {{ui:Fjern offlinekopien}}. Gem igen før et besøg på stedet, så kopien matcher den nyeste build. Mere i [Offline](common:offline).

:::offline
Du er offline nu. Hvis CivilCraft blev gemt til offline brug, virker alt, inklusive eksempelstedet. Hvis ikke, kan du blive i denne fane, men genindlæs den ikke, før du er online igen; uden en gemt kopi fejler {{ui:Åbn eksempelstedet}} med "Eksemplet kunne ikke indlæses".
:::

:::tip
Til brug i felten: gem CivilCraft til offline brug, og tag dine punktfiler med på selve laptoppen. Projekter og eksporter gemmes som downloads uden forbindelse, så du kan importere en dags målinger, kontrollere overfladen og gemme projektet på stedet.
:::

Skylagring er ikke tilgængelig endnu, og desktopbuilds er ikke udgivet endnu. I dag er de filer, du gemmer, den eneste kopi: gem dem et sted, der er sikkerhedskopieret.

## Add-ons en fil bruger

Når du gemmer et projekt, der har data fra et add-on (bygningsreglementets afkrydsninger eller en Adresse til sted-kilde), registrerer filen, hvilke add-ons og hvilke versioner. Åbnes den på en computer, der mangler et af dem, viser en linje over planen det og tilbyder at tilføje det fra din kontos liste. Registreringen er kun en note: filen åbnes under alle omstændigheder.

## Fortryd fra Studio

Inde i CadCraft Studio meldes hvert trin, du afslutter i CivilCraft, til Studio, så dets fortryd på projektniveau kan tage det seneste trin tilbage på tværs af programmer. Studio fortryder kun et trin, når CivilCraft's egen fortrydelsesstak står præcis, som trinnet efterlod den; når du åbner en anden fil, springer den dette vindue over.

## Lukning med ikke-gemte ændringer

Når projektet har ikke-gemte ændringer, og du lukker fanen, genindlæser siden eller forlader den, spørger browseren, om du vil forlade den. Dens formulering og udseende tilhører browseren og kan ikke ændres af CivilCraft. {{ui:Ny}} samt åbning af en projekt- eller LandXML-fil spørger i stedet i CivilCraft's egen boks **Ikke-gemte ændringer** med {{ui:Annuller}}, {{ui:Gem ikke}} og {{ui:Gem en kopi}}.
