---
title: Verktøylinjereferanse
summary: Hver knapp i verktøylinjen i CivilCraft, hva den gjør, tasten den har, og når den er gråtonet eller nekter.
keywords: verktøylinje, knapper, kommandoer, verktøy, fil, eksport, terrengmodell, prosjektering, rediger, visning, meny
from: 4c4352bc
---

Verktøylinjen går over toppen av appen i sju grupper. Hver knapp viser sitt verktøytips og sin tast når du holder musepekeren over den.

## Fil

| Knapp | Tast | Hva den gjør |
|---|---|---|
| {{ui:Ny}} | ingen | Starter et tomt prosjekt. Spør først hvis det finnes ulagrede endringer. |
| {{ui:Åpne}} | {{key:Mod+O}} | Åpner en punktfil (CSV, TXT), LandXML eller et CivilCraft-prosjekt. |
| {{ui:Lagre}} | {{key:Mod+S}} | Laster ned prosjektet som `<name>.civilcraft.json`. |

## Eksport

| Knapp | Tast | Hva den gjør |
|---|---|---|
| {{ui:LandXML}} | ingen | Laster ned `<name>.xml`: punkter, overflater, veglinjer, lengdeprofiler og rørnettverket som LandXML 1.2. "Ingenting å eksportere ennå." når prosjektet er tomt. |
| {{ui:DXF}} | ingen | Laster ned `<name>.dxf`: planens tegningslinjer som R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Åpner **Plott planen til PDF**. "Ingenting å plotte ennå." når prosjektet er tomt. |

## Terrengmodell

| Knapp | Tast | Hva den gjør |
|---|---|---|
| {{ui:Bruddlinje}} | {{key:B}} | Klikk oppmålingspunkter i rekkefølge, {{key:Enter}} for å avslutte. Bruddlinjen tar punktenes høyder. |
| {{ui:Avgrensning}} | {{key:O}} | Klikk hjørnene av den ytre avgrensningen, {{key:Enter}} for å avslutte. Erstatter enhver avgrensning. |

Begge sier "Det finnes ingen overflate ennå: åpne oppmålingspunkter først." når det ikke finnes noen overflate.

## Prosjektering

| Knapp | Tast | Hva den gjør |
|---|---|---|
| {{ui:Veglinje}} | {{key:A}} | Klikk PI-ene i rekkefølge, {{key:Enter}} for å avslutte. |
| {{ui:Byggeplate}} | {{key:G}} | Klikk byggeplatens hjørner, {{key:Enter}} for å avslutte. Som overflateverktøyene advarer den når det ikke finnes noen overflate; en byggeplate planeres bare på en slik. |
| {{ui:Rør}} | {{key:P}} | Klikk kummer fra oppstrøms og nedover (klikk en eksisterende for å koble til den), {{key:Enter}} for å avslutte. |
| {{ui:Lengdeprofil}} | {{key:R}} | Viser eller skjuler lengdeprofilvisningen under planen. |

## Rediger

| Knapp | Tast | Hva den gjør |
|---|---|---|
| {{ui:Angre}} | {{key:Mod+Z}} | Angrer den siste endringen (opptil 200). Gråtonet når det ikke finnes noe å angre. |
| {{ui:Gjør om}} | {{key:Mod+Y}} | Gjør om det som ble angret. Gråtonet når det ikke finnes noe å gjøre om. |
| {{ui:Kopier}} | {{key:Mod+C}} | Kopierer de valgte oppmålingspunktene, og legger dem på utklippstavlen som punktrader et regneark kan ta imot. Gråtonet til punkter er valgt. |
| {{ui:Lim inn}} | {{key:Mod+V}} | Limer inn punkter: de følger pekeren, og et klikk setter dem ned med numre ingen andre punkter har. Punktrader kopiert i et regneark limes også inn. |
| {{ui:Mer}} | ingen | Åpner menyen under. |

{{ui:Mer}}-menyen:

| Post | Tast | Hva den gjør |
|---|---|---|
| {{ui:Klipp ut}} | {{key:Mod+X}} | Kopierer de valgte punktene og sletter dem (ett angre-steg). |
| {{ui:Kopier}} | {{key:Mod+C}} | Som {{ui:Kopier}}-knappen. |
| {{ui:Lim inn}} | {{key:Mod+V}} | Som {{ui:Lim inn}}-knappen. |
| {{ui:Lim inn på samme sted}} | {{key:Mod+Shift+V}} | Limer inn punktene på sine egne koordinater, med numre ingen andre punkter har. |
| {{ui:Dupliser}} | {{key:Mod+D}} | En kopi av de valgte punktene følger pekeren; klikk der de skal. Utklippstavlen røres ikke. |
| {{ui:Slett}} | {{key:Delete}} | Sletter de valgte oppmålingspunktene, eller den valgte veglinjen, byggeplaten, kummen (med sine rør), røret eller PVI-en. |
| {{ui:Velg alle punkter}} | {{key:Mod+A}} | Velger alle oppmålingspunkter. |
| {{ui:Fjern utvalg}} | {{key:Esc}} | Fjerner utvalget. |

En post som ikke kan utføres akkurat nå, er gråtonet, og verktøytipset sier hvorfor. Detaljer: [Velg, kopier og lim inn oppmålingspunkter](topic:copy-paste-points).

Angre dekker endringer i designet, overflateinnstillingene og oppmålingspunktene (lim inn, klipp ut, dupliser, slett). Den dekker ikke visningsinnstillinger, og å åpne eller importere en fil tømmer den.

## GIS

| Knapp | Tast | Hva den gjør |
|---|---|---|
| {{ui:Koordinater}} | ingen | Åpner dialogboksen **Koordinatsystem**: si hvilket system prosjektet er i, eller bruk terreng- eller lokale koordinater. Se [Sett prosjektets koordinatsystem](topic:coordinate-systems) og [Terreng- og lokale koordinater](topic:ground-and-local-coordinates). |
| {{ui:Importer}} | ingen | Importerer GIS-data: shapefiler, GeoJSON, GeoPackage, høydegrid og LiDAR. Se [Importer GIS-data](topic:gis-import). |
| {{ui:Eksporter}} | ingen | Eksporterer som-bygget-data for en GIS-avdeling. Se [Eksporter som-bygget-data for GIS](topic:gis-export). |
| {{ui:Analyser}} | ingen | Åpner GIS-analysepanelet: buffer, overlegg, romlig sammenkobling, velg etter attributt, mål. Se [Analyser GIS-lag](topic:gis-analysis). |
| {{ui:Attributttabell}} | ingen | I Terrengmodell › Mer. Åpner attributttabellen til et GIS-lag: sorter, filtrer, velg, rediger, legg til felt, beregn, lagre som CSV. Se [Arbeid med et lags attributttabell](topic:gis-table). |
| {{ui:Kart}} | ingen | Åpner dialogboksen **Kartlag**: et georeferert bilde, eller kartservere du legger til, tegnet under planen. Se [Vis kartlag under planen](topic:map-layers). |

GIS-verktøyene lastes første gang du bruker en av disse knappene, åpner en GIS-fil, eller åpner et prosjekt som har et koordinatsystem eller GIS-lag.

## Visning

| Knapp | Tast | Hva den gjør |
|---|---|---|
| {{ui:Velg}} | {{key:V}} eller {{key:Esc}} | Klikk for å velge veglinjer, byggeplater, kummer, rør og punkter ({{key:Shift}} og et klikk eller et dra legger til punkter); dra håndtak for å flytte PI-er, byggeplatehjørner og kummer. |
| {{ui:Tilpass}} | {{key:F}} | Zoomer planen slik at den viser overflaten, punktene, veglinjene og byggeplatene (i 3D-visningen: viser alt). |
| {{ui:3D}} | {{key:D}} | Viser stedet i 3D over planen, eller går tilbake til planen. Linjen over 3D-visningen setter visningen, overdrivelsen, fargelegging og hva som vises, og eksporterer GLB eller OBJ. Se [Vis stedet i 3D](topic:site-3d). |

## Knapper i panelene

| Knapp | Hvor | Hva den gjør |
|---|---|---|
| {{ui:Åpne eksempelstedet}} | Boksen på en tom plan | Laster inn eksempelmålingen (krever en tilkobling, med mindre CivilCraft er lagret for frakoblet bruk) |
| {{ui:Fjern avgrensningen}} | Venstre panel, Terrengmodell | Fjerner den ytre avgrensningen |
| {{ui:Fjern tegnede bruddlinjer}} | Venstre panel, Terrengmodell | Fjerner hver bruddlinje tegnet med verktøyet (ikke bruddlinjegruppene) |
| {{ui:Bygg terrengmodellen på nytt fra punktene}} | Venstre panel, Terrengmodell (kun LandXML-overflate) | Fjerner LandXML-TIN-en og bygger fra punktene; kan ikke angres |
| {{ui:Start fra terrenget}} | Høyre panel, Veglinje | Starter en prosjektert lengdeprofil med en PVI på terrenget i hver ende |
| {{ui:Lengdeprofilvisning}} | Høyre panel, Veglinje | Åpner lengdeprofilvisningen for denne veglinjen |
| {{ui:Legg til PVI-er}} | Profillinjen | Mens den er trykt inn, legger et klikk i profilen til en PVI |
| {{ui:Sett alle bunnkoter fra reglene}} | Høyre panel, Rørnettverk | Setter alle rørenes bunnkoter fra reglene |
| {{ui:Sett bunnkotene fra reglene}} | Høyre panel, Rør | Setter dette rørets bunnkoter fra reglene |
