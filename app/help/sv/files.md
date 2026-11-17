---
title: Filer du kan öppna, spara och exportera
summary: Punktfiler, LandXML och CivilCraft-projekt in; projekt, LandXML, DXF och PDF ut; vad varje fil behåller, var filerna hamnar och vad som ändras offline.
keywords: öppna, spara, exportera, importera, filformat, csv, txt, landxml, xml, dxf, pdf, json, ladda ner, projektfil
from: 82bff559
---

CivilCraft öppnar filer från din dator och sparar genom att ladda ner filer till den. Ingenting laddas upp och ingenting lagras på en server. Se även [Dina filer](common:your-files).

## Vad den öppnar

Klicka på {{ui:Open}} (eller tryck på {{key:Mod+O}}) och välj en fil, eller dra filen från {{pick:mac=Finder|windows=Utforskaren|linux=din filhanterare}} till planen. En fil i taget; filer över 200 MB avvisas. En LandXML- eller projektfil över 32 MB läses i delar på cirka 4 MB, aldrig som en enda textmassa. Medan en LandXML-fil öppnas kan den använda ungefär 13 gånger filens storlek i minnet (en fil på 69 MB använde cirka 0.9 GB i vårt test).

| Typ | Filnamn | Vad som händer |
|---|---|---|
| Punktfil | `.csv`, `.txt`, `.pnt`, `.xyz` (valfri textfil) | Dialogrutan **Importera punkter** öppnas. Punkterna ersätter projektets punkter; linjeföringar, byggplattor och ledningar ligger kvar. |
| LandXML | `.xml`, `.landxml` | Ett **nytt projekt** skapas av filen (du får först en fråga om det nuvarande har osparade ändringar). |
| CivilCraft-projekt | `.civilcraft.json` (valfri `.json`) | Projektet öppnas så som det sparades (du får först en fråga om det nuvarande har osparade ändringar). |

CivilCraft avgör utifrån filens ändelse och sedan utifrån dess första tecken: text som börjar med `{` läses som ett projekt, text som börjar med `<` som LandXML och allt annat som en punktfil. En fil som öppningsrutan gråmarkerar kan ändå släppas på planen.

:::note
Att importera en punktfil i ett projekt som redan har punkter ersätter dem utan att fråga, och det rensar ångrahistoriken (att öppna en fil är alltid en ny start för ångra). Om ytan kom från LandXML växlar import av punkter tillbaka till en yta byggd av punkterna. Spara först om du kanske vill ha tillbaka de gamla punkterna.
:::

Mer information: [Punktfilsformat](topic:point-file-formats), [LandXML: vad som läses och skrivs](topic:landxml-reference).

## Vad den sparar

{{ui:Save}} ({{key:Mod+S}}) skriver två filer bredvid varandra, namngivna efter **Namn** i den vänstra panelen: `<name>.civilcraft.json`, projektet du fortsätter redigera, och `<name>.ifc`, samma design som IFC 4.3 för alla andra (se [IFC-export och import](topic:ifc)). Varje fil refererar till den andra, och IFC-filen innehåller också en komprimerad kopia av projektet, så att en IFC-fil som skickas ensam ändå går att öppna helt redigerbar igen.

- **I Studio** skrivs båda filerna bredvid varandra, på plats.
- **I Chrome och Edge** frågar det första sparandet efter en mapp och skriver båda filerna dit; senare sparanden går till samma mapp. Avbryt frågan om mapp för att i stället ladda ner båda.
- **I andra webbläsare** laddas båda filerna ner, projektfilen först.

Att öppna någon av filerna letar efter den andra. Öppna båda samtidigt (eller släpp båda), eller öppna en: i Studio hittas den andra i samma mapp; i en webbläsare ber CivilCraft dig lägga till den, eller fortsätta med den du har. Om IFC-filen ändrats av ett annat program efter att CivilCraft sparade den, eller om en av filerna är äldre än den andra, öppnas projektet från den nyare designen och panelen **Problem** berättar vad som hänt, med **Spara nu** (skriver båda filerna igen) och **Visa IFC:ns geometri som referens**. En IFC-fil ensam som ett annat program ändrat öppnas från sin kopia av projektet med det som fortfarande stämmer: linjeföringar som ändrats tar dess geometri, objekt som tagits bort lämnas utanför, och resten av ändringarna listas men tas inte över. En projektfil från före 0.7.1 öppnas som tidigare.

Projektfilen behåller:

- varje punkt (nummer, koordinater, höjd, beskrivning) och namnet på punktfilen de kom från
- ytinställningarna: val av grupper, ritade brytlinjer, avgränsningen, den längsta yttre kanten och en TIN som lästes från LandXML
- visningsinställningarna
- linjeföringar med deras PI:er, radier och startstation, deras designprofiler (PVI:er och kurvlängder) och korridorinställningarna
- byggplattor och rörnätet med dess regler

Den behåller inte ångrahistoriken. Ytor, höjdkurvor, släntkrönslinjer och volymer lagras inte; de byggs om från de sparade indata när projektet öppnas. En projektfil från en nyare CivilCraft avvisas med ett meddelande som anger dess version.

## Vad den exporterar

| Knapp | Fil | Innehåll |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punkter, befintlig mark (och den planerade ytan när det finns en) som TIN-ytor, linjeföringar, mark- och designprofiler, rörnätet |
| {{ui:DXF}} | `<name>.dxf` | R12-DXF av planens linjeverk så som det visas, på namngivna lager |
| {{ui:DWG}} | `<name>.dwg` | Samma linjeverk som en DWG-ritning, i det format du väljer (2000 till 2018) |
| {{ui:PDF}} | `<name>.pdf` | En vektorplott av planen på ett ark, i en skala du väljer |
| {{ui:GLB}} eller {{ui:OBJ}} (på 3D-vyns verktygsfält) | `<name>-3d.glb`, `<name>-3d.obj` | Det 3D-vyn visar som en 3D-modell: meter, Y uppåt, verklig skala, runt en inspelad lokal origo |

Vad var och en utelämnar: [LandXML-utbyte](topic:landxml), [Exportera planen till DXF](topic:dxf-export) (DWG också), [Plotta planen till PDF](topic:plot-pdf), [Exportera tomten i 3D](topic:export-3d).

## Var filerna hamnar

Sparade och exporterade filer hamnar där din webbläsare lägger nedladdningar, oftast mappen Hämtade filer. För att välja en mapp varje gång:

:::chromium
Öppna webbläsarens **Inställningar**, sedan **Hämtade filer**, och slå på **Fråga var varje fil ska sparas innan den laddas ner**.
:::

:::firefox
Öppna **Inställningar**, sedan **Allmänt**, och under **Filer och program** välj **Fråga alltid var filer ska sparas**.
:::

:::safari
Öppna **Safari > Inställningar > Allmänt** och ställ in **Plats för nedladdningar** på **Fråga vid varje nedladdning**.
:::

Om du sparar två gånger med samma namn kan webbläsaren lägga till ett nummer på andra filen, till exempel `Site (1).civilcraft.json`. Öppna den senaste nästa gång.

## Online och offline

CivilCraft fungerar bara på din dator oavsett: öppning läser filen i webbläsaren, sparande laddar ner den. För att öppna CivilCraft utan någon anslutning alls, spara det för offlineanvändning först:

1. Klicka när du är online på {{ui:Save for offline}} i appfältet överst.
2. Knappen räknar upp ("Sparar 12 av 30") och visar sedan {{ui:Offline ready}}. CivilCraft är litet (cirka 0.6 MB), så det tar en stund. Den sparade kopian innehåller denna hjälp och exempelplatsen.
3. Utan anslutning öppnar du samma adress (eller ett bokmärke till den). Allt fungerar, inklusive {{ui:Open the sample site}}.

Knappens andra lägen:

- {{ui:Could not save}}: några filer laddades inte ner. Kontrollera anslutningen och klicka för att försöka igen.
- {{ui:Offline not available}}: det här webbläsarfönstret kan inte spara en offlinekopia (privata fönster och vissa hanterade datorer blockerar det). Använd ett vanligt fönster.

Klicka på {{ui:Offline ready}} för att se när kopian sparades, med två val: {{ui:Save again (get the newest version)}} och {{ui:Remove the offline copy}}. Spara igen före ett platsbesök så att kopian matchar den senaste versionen. Mer i [Offline](common:offline).

:::offline
Du är offline nu. Om CivilCraft sparades för offlineanvändning fungerar allt, inklusive exempelplatsen. Om inte, fortsätt arbeta i den här fliken, men ladda inte om den förrän du är online igen; utan sparad kopia misslyckas {{ui:Open the sample site}} med ”Exemplet kunde inte läsas in”.
:::

:::tip
För fältarbete: spara CivilCraft för offlineanvändning och ta med dina punktfiler på själva datorn. Projekt och exporter sparas som nedladdningar utan anslutning, så du kan importera en dags mätningar, kontrollera ytan och spara projektet på plats.
:::

Molnsparande finns inte ännu, och skrivbordsversioner finns inte ännu. Idag är filerna du sparar den enda kopian: förvara dem någonstans som säkerhetskopieras.

## Tillägg som en fil använder

När du sparar ett projekt som innehåller data från ett tillägg (kryssrutorna för byggregler, eller en adress-till-tomt-källa), noterar filen vilka tillägg och vilka versioner. Öppnar du den på en dator som saknar ett tillägg visar en rad ovanför planen det och erbjuder att lägga till det från ditt kontos lista. Noteringen är bara en anteckning: filen öppnas ändå.

## Ångra från Studio

I CadCraft Studio meddelas Studio varje steg du slutför i CivilCraft, så att dess ångra på projektnivå kan ta tillbaka det senaste steget över apparna. Studio ångrar bara ett steg när CivilCraft:s egen ångrahistorik ligger exakt kvar som steget lämnade den; efter att du öppnat en annan fil hoppar den över det här fönstret.

## Stänger med osparade ändringar

När projektet har osparade ändringar och du stänger fliken, laddar om sidan eller lämnar sidan frågar webbläsaren om du vill lämna. Dess ordalydelse och utseende hör till webbläsaren och kan inte ändras av CivilCraft. {{ui:New}}, samt att öppna en projekt- eller LandXML-fil, frågar i stället i CivilCraft:s egen ruta **Osparade ändringar**, med {{ui:Cancel}}, {{ui:Don’t save}} och {{ui:Save a copy}}.
