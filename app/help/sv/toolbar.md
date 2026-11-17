---
title: Referens för verktygsfältet
summary: Varje knapp i verktygsfältet i CivilCraft, vad den gör, dess tangent, och när den är gråad eller vägrar.
keywords: verktygsfält, knappar, kommandon, verktyg, fil, export, terrängmodell, design, redigera, vy, meny
from: 4c4352bc
---

Verktygsfältet går tvärs över appens överkant i sju grupper. Varje knapp visar sitt verktygstips och sin tangent när du håller muspekaren över den.

## Fil

| Knapp | Tangent | Vad den gör |
|---|---|---|
| {{ui:Ny}} | ingen | Startar ett tomt projekt. Frågar först om det finns osparade ändringar. |
| {{ui:Öppna}} | {{key:Mod+O}} | Öppnar en punktfil (CSV, TXT), LandXML eller ett CivilCraft-projekt. |
| {{ui:Spara}} | {{key:Mod+S}} | Laddar ner projektet som `<name>.civilcraft.json`. |

## Exportera

| Knapp | Tangent | Vad den gör |
|---|---|---|
| {{ui:LandXML}} | ingen | Laddar ner `<name>.xml`: punkter, ytor, linjeföringar, profiler och ledningsnätet som LandXML 1.2. "Inget att exportera ännu." när projektet är tomt. |
| {{ui:DXF}} | ingen | Laddar ner `<name>.dxf`: planens linjer som R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Öppnar **Plotta planen till PDF**. "Inget att plotta ännu." när projektet är tomt. |

## Terrängmodell

| Knapp | Tangent | Vad den gör |
|---|---|---|
| {{ui:Brytlinje}} | {{key:B}} | Klicka på mätpunkter i ordning, {{key:Enter}} avslutar. Brytlinjen tar punkternas höjder. |
| {{ui:Gräns}} | {{key:O}} | Klicka på hörnen av den yttre gränsen, {{key:Enter}} avslutar. Ersätter befintlig gräns. |

Båda säger "Det finns ingen yta ännu: öppna mätpunkter först." när det inte finns någon yta.

## Design

| Knapp | Tangent | Vad den gör |
|---|---|---|
| {{ui:Linjeföring}} | {{key:A}} | Klicka på PI:erna i ordning, {{key:Enter}} avslutar. |
| {{ui:Byggplatta}} | {{key:G}} | Klicka på byggplattans hörn, {{key:Enter}} avslutar. Liksom ytverktygen varnar den när det inte finns någon yta; en byggplatta planeras bara mot en yta. |
| {{ui:Ledningar}} | {{key:P}} | Klicka på brunnar från uppströms och nedåt (klicka på en befintlig för att ansluta till den), {{key:Enter}} avslutar. |
| {{ui:Profil}} | {{key:R}} | Visar eller döljer profilvyn under planen. |

## Redigera

| Knapp | Tangent | Vad den gör |
|---|---|---|
| {{ui:Ångra}} | {{key:Mod+Z}} | Ångrar den senaste ändringen (upp till 200). Gråad när det inte finns något att ångra. |
| {{ui:Gör om}} | {{key:Mod+Y}} | Gör om det som ångrats. Gråad när det inte finns något att göra om. |
| {{ui:Kopiera}} | {{key:Mod+C}} | Kopierar de markerade mätpunkterna och lägger dem på urklippet som punktrader som ett kalkylblad kan ta emot. Gråad tills punkter är markerade. |
| {{ui:Klistra in}} | {{key:Mod+V}} | Klistrar in punkter: de följer pekaren, och ett klick sätter ner dem med nummer som ingen annan punkt har. Punktrader kopierade i ett kalkylblad klistras också in. |
| {{ui:Mer}} | ingen | Öppnar menyn nedan. |

Menyn {{ui:Mer}}:

| Post | Tangent | Vad den gör |
|---|---|---|
| {{ui:Klipp ut}} | {{key:Mod+X}} | Kopierar de markerade punkterna och tar bort dem (ett ångra-steg). |
| {{ui:Kopiera}} | {{key:Mod+C}} | Som knappen {{ui:Kopiera}}. |
| {{ui:Klistra in}} | {{key:Mod+V}} | Som knappen {{ui:Klistra in}}. |
| {{ui:Klistra in på plats}} | {{key:Mod+Shift+V}} | Klistrar in punkterna vid deras egna koordinater, med nummer som ingen annan punkt har. |
| {{ui:Duplicera}} | {{key:Mod+D}} | En kopia av de markerade punkterna följer pekaren; klicka där den ska ta vägen. Urklippet lämnas orört. |
| {{ui:Ta bort}} | {{key:Delete}} | Tar bort de markerade mätpunkterna, eller den markerade linjeföringen, byggplattan, brunnen (med sina ledningar), ledningen eller PVI:n. |
| {{ui:Markera alla punkter}} | {{key:Mod+A}} | Markerar alla mätpunkter. |
| {{ui:Avmarkera}} | {{key:Esc}} | Rensar markeringen. |

En post som inte kan göras just nu är gråad, och dess verktygstips säger varför. Detaljer: [Markera, kopiera och klistra in mätpunkter](topic:copy-paste-points).

Ångra omfattar ändringar i designen, ytinställningarna och mätpunkterna (klistra in, klipp ut, duplicera, ta bort). Den omfattar inte visningsinställningar, och att öppna eller importera en fil rensar den.

## GIS

| Knapp | Tangent | Vad den gör |
|---|---|---|
| {{ui:Koordinater}} | ingen | Öppnar dialogrutan **Koordinatsystem**: ange vilket system projektet är i, eller använd mark- eller lokala koordinater. Se [Ange projektets koordinatsystem](topic:coordinate-systems) och [Mark- och lokala koordinater](topic:ground-and-local-coordinates). |
| {{ui:Importera}} | ingen | Importerar GIS-data: shapefiler, GeoJSON, GeoPackage, höjdgrids och LiDAR. Se [Importera GIS-data](topic:gis-import). |
| {{ui:Exportera}} | ingen | Exporterar som-byggt-data för en GIS-avdelning. Se [Exportera som-byggt-data för GIS](topic:gis-export). |
| {{ui:Analysera}} | ingen | Öppnar GIS-analyspanelen: buffer, överlagring, spatial join, markera efter attribut, mät. Se [Analysera GIS-lager](topic:gis-analysis). |
| {{ui:Attributtabell}} | ingen | Under Terrängmodell › Mer. Öppnar attributtabellen för ett GIS-lager: sortera, filtrera, markera, redigera, lägg till fält, beräkna, spara som CSV. Se [Arbeta med ett lagers attributtabell](topic:gis-table). |
| {{ui:Karta}} | ingen | Öppnar dialogrutan **Kartlager**: en georefererad bild, eller kartservrar som du lägger till, ritade under planen. Se [Visa kartlager under planen](topic:map-layers). |

GIS-verktygen laddas första gången du använder en av dessa knappar, öppnar en GIS-fil, eller öppnar ett projekt som har ett koordinatsystem eller GIS-lager.

## Vy

| Knapp | Tangent | Vad den gör |
|---|---|---|
| {{ui:Markera}} | {{key:V}} eller {{key:Esc}} | Klicka för att markera linjeföringar, byggplattor, brunnar, ledningar och punkter ({{key:Shift}} och ett klick eller ett drag lägger till punkter); dra handtag för att flytta PI:er, byggplattshörn och brunnar. |
| {{ui:Anpassa}} | {{key:F}} | Zoomar planen så att ytan, punkterna, linjeföringarna och byggplattorna syns (i 3D-vyn: visar allt). |
| {{ui:3D}} | {{key:D}} | Visar platsen i 3D över planen, eller går tillbaka till planen. Fältet över 3D-vyn anger vyn, överdrivningen, färgsättningen och vad som visas, och exporterar GLB eller OBJ. Se [Visa platsen i 3D](topic:site-3d). |

## Knappar i panelerna

| Knapp | Var | Vad den gör |
|---|---|---|
| {{ui:Öppna exempelplatsen}} | Rutan på en tom plan | Läser in exempelmätningen (kräver en anslutning, om inte CivilCraft sparats för offlineanvändning) |
| {{ui:Ta bort gränsen}} | Vänster panel, Terrängmodell | Tar bort den yttre gränsen |
| {{ui:Ta bort ritade brytlinjer}} | Vänster panel, Terrängmodell | Tar bort varje brytlinje som ritats med verktyget (inte brytlinjegrupperna) |
| {{ui:Bygg om terrängmodellen från punkterna}} | Vänster panel, Terrängmodell (endast LandXML-yta) | Tar bort LandXML-TIN:en och bygger från punkterna; kan inte ångras |
| {{ui:Starta från marken}} | Höger panel, Linjeföring | Startar en projekterad profil med en PVI på marken i varje ände |
| {{ui:Profilvy}} | Höger panel, Linjeföring | Öppnar profilvyn för den här linjeföringen |
| {{ui:Lägg till PVI}} | Profilfältet | Medan den är nedtryckt lägger ett klick i profilen till en PVI |
| {{ui:Sätt alla bottennivåer från reglerna}} | Höger panel, Ledningsnät | Sätter varje lednings bottennivåer från reglerna |
| {{ui:Sätt dess bottennivåer från reglerna}} | Höger panel, Ledning | Sätter den här ledningens bottennivåer från reglerna |
