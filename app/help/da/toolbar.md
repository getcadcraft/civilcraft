---
title: Værktøjslinjens reference
summary: Hver værktøjslinjeknap i CivilCraft, hvad den gør, dens genvej, og hvornår den er gråtonet eller afviser.
keywords: værktøjslinje, knapper, kommandoer, værktøjer, fil, eksport, overflade, design, rediger, visning, menu
from: 4c4352bc
---

Værktøjslinjen løber hen over toppen af appen i syv grupper. Hver knap viser sit værktøjstip og sin genvej, når du holder musen over den.

## Fil

| Knap | Genvej | Hvad den gør |
|---|---|---|
| {{ui:Ny}} | ingen | Starter et tomt projekt. Spørger først, hvis der er ikke-gemte ændringer. |
| {{ui:Åbn}} | {{key:Mod+O}} | Åbner en punktfil (CSV, TXT), LandXML eller et CivilCraft-projekt. |
| {{ui:Gem}} | {{key:Mod+S}} | Henter projektet som `<name>.civilcraft.json`. |

## Eksport

| Knap | Genvej | Hvad den gør |
|---|---|---|
| {{ui:LandXML}} | ingen | Henter `<name>.xml`: punkter, overflader, tracéer, længdeprofiler og rørnettet som LandXML 1.2. »Intet at eksportere endnu.« når projektet er tomt. |
| {{ui:DXF}} | ingen | Henter `<name>.dxf`: planens stregtegning som R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Åbner **Plot planen til PDF**. »Intet at plotte endnu.« når projektet er tomt. |

## Terræn

| Knap | Genvej | Hvad den gør |
|---|---|---|
| {{ui:Brudlinje}} | {{key:B}} | Klik på opmålingspunkter i rækkefølge, {{key:Enter}} for at afslutte. Brudlinjen tager punkternes koter. |
| {{ui:Afgrænsning}} | {{key:O}} | Klik på hjørnerne af den ydre afgrænsning, {{key:Enter}} for at afslutte. Erstatter enhver afgrænsning. |

Begge viser »Der er endnu ingen overflade: åbn først opmålingspunkter.« når der ikke er nogen overflade.

## Design

| Knap | Genvej | Hvad den gør |
|---|---|---|
| {{ui:Tracé}} | {{key:A}} | Klik på PI'erne i rækkefølge, {{key:Enter}} for at afslutte. |
| {{ui:Byggeplateau}} | {{key:G}} | Klik på byggeplateauets hjørner, {{key:Enter}} for at afslutte. Ligesom overfladeværktøjerne advarer den, når der ikke er nogen overflade; et byggeplateau planeres kun på en. |
| {{ui:Rør}} | {{key:P}} | Klik på bygværker fra opstrøms og nedad (klik på et eksisterende for at forbinde til det), {{key:Enter}} for at afslutte. |
| {{ui:Længdeprofil}} | {{key:R}} | Viser eller skjuler længdeprofilvisningen under planen. |

## Rediger

| Knap | Genvej | Hvad den gør |
|---|---|---|
| {{ui:Fortryd}} | {{key:Mod+Z}} | Fortryder den sidste ændring (op til 200). Gråtonet, når der ikke er noget at fortryde. |
| {{ui:Gentag}} | {{key:Mod+Y}} | Gentager det, der blev fortrudt. Gråtonet, når der ikke er noget at gentage. |
| {{ui:Kopiér}} | {{key:Mod+C}} | Kopierer de valgte opmålingspunkter og lægger dem på udklipsholderen som punktrækker, som et regneark kan tage imod. Gråtonet, indtil punkter er valgt. |
| {{ui:Sæt ind}} | {{key:Mod+V}} | Sætter punkter ind: de følger markøren, og et klik sætter dem ned med numre, som intet andet punkt har. Punktrækker kopieret fra et regneark sættes også ind. |
| {{ui:Mere}} | ingen | Åbner menuen nedenfor. |

Menuen {{ui:Mere}}:

| Post | Genvej | Hvad den gør |
|---|---|---|
| {{ui:Klip}} | {{key:Mod+X}} | Kopierer de valgte punkter og sletter dem (ét trin med fortryd). |
| {{ui:Kopiér}} | {{key:Mod+C}} | Som knappen {{ui:Kopiér}}. |
| {{ui:Sæt ind}} | {{key:Mod+V}} | Som knappen {{ui:Sæt ind}}. |
| {{ui:Sæt ind på samme sted}} | {{key:Mod+Shift+V}} | Sætter punkterne ind på deres egne koordinater, med numre som intet andet punkt har. |
| {{ui:Duplikér}} | {{key:Mod+D}} | En kopi af de valgte punkter følger markøren; klik, hvor den skal hen. Udklipsholderen røres ikke. |
| {{ui:Slet}} | {{key:Delete}} | Sletter de valgte opmålingspunkter, eller det valgte tracé, byggeplateau, bygværk (med dets rør), rør eller PVI. |
| {{ui:Vælg alle punkter}} | {{key:Mod+A}} | Vælger alle opmålingspunkter. |
| {{ui:Fravælg alle}} | {{key:Esc}} | Rydder valget. |

Et punkt, der ikke kan virke lige nu, er gråtonet, og dets værktøjstip siger hvorfor. Detaljer: [Vælg, kopiér og sæt opmålingspunkter ind](topic:copy-paste-points).

Fortryd dækker ændringer af designet, overfladeindstillingerne og opmålingspunkterne (indsæt, klip, duplikér, slet). Det dækker ikke visningsindstillinger, og åbning eller import af en fil rydder det.

## GIS

| Knap | Genvej | Hvad den gør |
|---|---|---|
| {{ui:Koordinater}} | ingen | Åbner dialogen **Koordinatsystem**: sig, hvilket system projektet er i, eller brug jord- eller lokale koordinater. Se [Angiv projektets koordinatsystem](topic:coordinate-systems) og [Jord- og lokale koordinater](topic:ground-and-local-coordinates). |
| {{ui:Importér}} | ingen | Importerer GIS-data: shapefiler, GeoJSON, GeoPackage, højdegrid og LiDAR. Se [Importér GIS-data](topic:gis-import). |
| {{ui:Eksportér}} | ingen | Eksporterer som bygget-data til en GIS-afdeling. Se [Eksportér som bygget-data til GIS](topic:gis-export). |
| {{ui:Analysér}} | ingen | Åbner GIS-analysepanelet: buffer, overlay, rumlig sammenføjning, vælg efter attribut, mål. Se [Analysér GIS-lag](topic:gis-analysis). |
| {{ui:Attributtabel}} | ingen | Under Terræn › Mere. Åbner attributtabellen for et GIS-lag: sortér, filtrér, vælg, rediger, tilføj felter, beregn, gem som CSV. Se [Arbejd med et lags attributtabel](topic:gis-table). |
| {{ui:Kort}} | ingen | Åbner dialogen **Kortlag**: et georefereret billede, eller kortservere du tilføjer, tegnet under planen. Se [Vis kortlag under planen](topic:map-layers). |

GIS-værktøjerne indlæses første gang, du bruger en af disse knapper, åbner en GIS-fil eller åbner et projekt, der har et koordinatsystem eller GIS-lag.

## Visning

| Knap | Genvej | Hvad den gør |
|---|---|---|
| {{ui:Vælg}} | {{key:V}} eller {{key:Esc}} | Klik for at vælge tracéer, byggeplateauer, bygværker, rør og punkter ({{key:Shift}} og et klik eller et træk tilføjer punkter); træk i greb for at flytte PI'er, byggeplateauhjørner og bygværker. |
| {{ui:Tilpas}} | {{key:F}} | Zoomer planen, så overfladen, punkterne, tracéerne og byggeplateauerne vises (i 3D-visningen: viser alt). |
| {{ui:3D}} | {{key:D}} | Viser stedet i 3D over planen, eller vender tilbage til planen. Linjen over 3D-visningen angiver visningen, overdrivelsen, farvelægningen og hvad der vises, og eksporterer GLB eller OBJ. Se [Vis stedet i 3D](topic:site-3d). |

## Knapper i panelerne

| Knap | Hvor | Hvad den gør |
|---|---|---|
| {{ui:Åbn eksempelgrunden}} | Boksen på en tom plan | Indlæser eksempelopmålingen (kræver en forbindelse, medmindre CivilCraft er gemt til offline brug) |
| {{ui:Fjern afgrænsningen}} | Venstre panel, Terræn | Fjerner den ydre afgrænsning |
| {{ui:Fjern tegnede brudlinjer}} | Venstre panel, Terræn | Fjerner alle brudlinjer tegnet med værktøjet (ikke brudlinjegrupperne) |
| {{ui:Genopbyg overfladen fra punkterne}} | Venstre panel, Terræn (kun LandXML-overflade) | Fjerner LandXML-TIN'et og bygger ud fra punkterne; kan ikke fortrydes |
| {{ui:Start fra terrænet}} | Højre panel, Tracé | Starter en projekteret længdeprofil med et PVI på terrænet i hver ende |
| {{ui:Længdeprofilvisning}} | Højre panel, Tracé | Åbner længdeprofilvisningen for dette tracé |
| {{ui:Tilføj PVI'er}} | Profillinjen | Mens den er trykket ned, tilføjer et klik i profilen et PVI |
| {{ui:Sæt alle bundkoter ud fra reglerne}} | Højre panel, Rørnet | Sætter alle rørs bundkoter ud fra reglerne |
| {{ui:Sæt dets bundkoter ud fra reglerne}} | Højre panel, Rør | Sætter dette rørs bundkoter ud fra reglerne |
