---
title: Filer du kan öppna, spara och exportera
summary: Punktfiler, LandXML och CivilCraft-projekt in; projekt, LandXML, DXF och PDF ut; vad varje format behåller, var filerna hamnar och vad som ändras offline.
keywords: öppna, spara, exportera, importera, filformat, csv, txt, landxml, xml, dxf, pdf, json, ladda ner, projektfil
from: a7debb61
---

CivilCraft öppnar filer från din dator och sparar genom att ladda ner filer till den. Inget laddas upp och inget lagras på en server. Se även [Dina filer](common:your-files).

## Vad den öppnar

Klicka på {{ui:Open}} (eller tryck {{key:Mod+O}}) och välj en fil, eller dra filen från {{pick:mac=Finder|windows=Utforskaren|linux=Filhanteraren}} till planen. En fil i taget; filer över 200 MB avvisas.

| Typ | Filnamn | Vad händer |
|---|---|---|
| Punktfil | `.csv`, `.txt`, `.pnt`, `.xyz` (valfri textfil) | Dialogrutan **Importera punkter** öppnas. Punkterna ersätter projektets punkter; linjeföringar, byggplattor och ledningar står kvar. |
| LandXML | `.xml`, `.landxml` | Ett **nytt projekt** skapas av filen (du tillfrågas först om det nuvarande har osparade ändringar). |
| CivilCraft-projekt | `.civilcraft.json` (valfri `.json`) | Projektet öppnas så som det sparades (du tillfrågas först om det nuvarande har osparade ändringar). |

CivilCraft avgör efter filens ändelse, sedan efter dess första tecken: text som börjar med `{` läses som ett projekt, text som börjar med `<` som LandXML, allt annat som en punktfil. En fil som öppna-rutan gråar ut kan ändå släppas på planen.

:::note
Att importera en punktfil i ett projekt som redan har punkter ersätter dem utan att fråga, och rensar ångrahistoriken (att öppna en fil är en ny start för ångra). Om ytan kom från LandXML växlar import av punkter tillbaka till en yta byggd från punkterna. Spara först om du kanske vill ha tillbaka de gamla punkterna.
:::

Mer: [Punktfilsformat](topic:point-file-formats), [LandXML: vad som läses och skrivs](topic:landxml-reference).

## Vad den sparar

{{ui:Save}} ({{key:Mod+S}}) skriver två filer bredvid varandra, namngivna efter **Namn** i den vänstra panelen: `<name>.civilcraft.json`, projektet du fortsätter redigera, och `<name>.ifc`, samma konstruktion i IFC 4.3 för alla andra (se [IFC-export och -import](topic:ifc)). Varje fil refererar till den andra, och IFC-filen bär också en komprimerad kopia av projektet, så en IFC som skickas ensam öppnas ändå fullt redigerbar.

- **I Studio** skrivs båda filerna bredvid varandra, på samma plats.
- **I Chrome och Edge** frågar första sparningen efter en mapp och skriver båda dit; senare sparningar går till samma mapp. Avbryt mappfrågan för att ladda ner båda i stället.
- **I andra webbläsare** laddas båda filerna ner, projektfilen först.

Att öppna någon av filerna letar efter den andra. Öppna båda tillsammans (eller släpp båda), eller öppna en: i Studio hittas den andra i samma mapp; i en webbläsare frågar CivilCraft om du vill lägga till den, eller om du vill fortsätta med den du har. Om IFC-filen ändrats av ett annat program efter att CivilCraft sparade den, eller om en fil är äldre än den andra, öppnas projektet från den nyare konstruktionen och panelen Problem berättar vad som hände, med **Spara nu** (skriver båda filerna igen) och **Visa IFC:ns geometri som referens**. En IFC på egen hand som ett annat program ändrat öppnas från sin kopia av projektet med det som fortfarande stämmer: linjeföringar som det ändrat tar över dess geometri, objekt det tagit bort utelämnas, och resten av ändringarna listas utan att tillämpas. En projektfil från före 0.7.1 öppnas som tidigare.

Projektfilen behåller:

- varje punkt (nummer, koordinater, höjd, beskrivning) och namnet på punktfilen de kom från
- ytinställningarna: grupperingsval, ritade brytlinjer, avgränsningen, den längsta yttre kanten och en TIN lästes från LandXML
- visningsinställningarna
- linjeföringar med deras PI:er, radier och startstation, deras projekteringsprofiler (PVI:er och kurvlängder) och korridorinställningar
- byggplattor och ledningsnätet med dess regler

Den behåller inte ångrahistoriken. Ytor, nivålinjer, dagsljuslinjer och volymer lagras inte; de byggs om från de sparade indata när projektet öppnas. En projektfil från en nyare CivilCraft avvisas med ett meddelande som anger dess version.

## Vad den exporterar

| Knapp | Fil | Innehåll |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punkter, befintlig mark (och den planerade ytan när det finns en) som TIN-ytor, linjeföringar, mark- och projekteringsprofiler, ledningsnätet |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF av planlinjerna så som de visas, på namngivna lager |
| {{ui:DWG}} | `<name>.dwg` | Samma linjer som en DWG-ritning, i det format du väljer (2000 till 2018) |
| {{ui:PDF}} | `<name>.pdf` | En vektorplott av planen på ett blad, i en skala du väljer |
| {{ui:GLB}} eller {{ui:OBJ}} (i 3D-vyns verktygsfält) | `<name>-3d.glb`, `<name>-3d.obj` | Det 3D-vyn visar som en 3D-modell: meter, Y uppåt, verklig skala, runt en inspelad lokal origo |

Vad var och en utelämnar: [Utbyt LandXML](topic:landxml), [Exportera planen till DXF](topic:dxf-export) (DWG också), [Plotta planen till PDF](topic:plot-pdf), [Exportera platsen i 3D](topic:export-3d).

## Var filerna hamnar

Sparade och exporterade filer hamnar där webbläsaren lägger nedladdningar, oftast i mappen Hämtade filer. För att välja mapp varje gång:

:::chromium
Öppna webbläsarens **Inställningar**, sedan **Hämtade filer**, och slå på **Fråga var varje fil ska sparas innan den hämtas**.
:::

:::firefox
Öppna **Inställningar**, sedan **Allmänt**, och under **Filer och program** välj **Fråga alltid var filer ska sparas**.
:::

:::safari
Öppna **Safari > Inställningar > Allmänt** och ställ in **Plats för filnedladdningar** på **Fråga för varje nedladdning**.
:::

Om du sparar två gånger med samma namn kan webbläsaren lägga till ett nummer på den andra filen, till exempel `Site (1).civilcraft.json`. Öppna den senaste nästa gång.

## Online och offline

CivilCraft fungerar bara på din dator i båda fallen: att öppna läser filen i webbläsaren, att spara laddar ner den. För att öppna CivilCraft utan någon anslutning alls, spara det för offlineanvändning först:

1. Medan du är online klickar du på {{ui:Save for offline}} i appfältet högst upp.
2. Knappen räknar upp ("Sparar 12 av 30") och visar sedan {{ui:Offline ready}}. CivilCraft är litet (0.6 MB), så det tar en stund. Den sparade kopian innehåller denna hjälp och exempelplatsen.
3. Utan anslutning öppnar du samma adress (eller ett bokmärke till den). Allt fungerar, inklusive {{ui:Open the sample site}}.

Knappens övriga lägen:

- {{ui:Could not save}}: några filer laddades inte ner. Kontrollera anslutningen och klicka för att försöka igen.
- {{ui:Offline not available}}: det här webbläsarfönstret kan inte behålla en offlinekopia (privata fönster och vissa hanterade datorer blockerar det). Använd ett vanligt fönster.

Klicka på {{ui:Offline ready}} för att se när kopian sparades, med två val: {{ui:Save again (get the newest version)}} och {{ui:Remove the offline copy}}. Spara igen före ett platsbesök så att kopian stämmer med den senaste versionen. Mer i [Offline](common:offline).

:::offline
Du är offline nu. Om CivilCraft sparades för offlineanvändning fungerar allt, inklusive exempelplatsen. Om inte, fortsätt arbeta i den här fliken, men ladda inte om den förrän du är online igen; utan en sparad kopia misslyckas {{ui:Open the sample site}} med meddelandet ”Exemplet kunde inte läsas in”.
:::

:::tip
För användning i fält: spara CivilCraft för offlineanvändning och ta med dina punktfiler på själva laptopen. Projekt och exporter sparas som nedladdningar utan anslutning, så du kan importera dagens mätningar, kontrollera ytan och spara projektet på platsen.
:::

Molnlagring finns inte ännu, och skrivbordsversioner finns inte ännu. Idag är filerna du sparar den enda kopian: förvara dem någonstans där de säkerhetskopieras.

## Tillägg som en fil använder

När du sparar ett projekt som innehåller data från ett tillägg (kryssrutorna för Byggregler, eller en källa Adress till plats), noterar filen vilka tillägg och vilka versioner. Öppnar du den på en dator som saknar ett av dem visas en rad ovanför planen som säger det och erbjuder att lägga till det från ditt kontos lista. Noteringen är bara en anteckning: filen öppnas ändå.

## Ångra från Studio

Inuti CadCraft Studio meddelas Studio om varje steg du slutför i CivilCraft, så att dess projektomfattande ångra kan ta tillbaka det senaste steget över apparna. Studio ångrar bara ett steg när CivilCraft:s egen ångrastack är exakt som steget lämnade den; efter att du öppnat en annan fil hoppar den över det här fönstret.

## Stänga med osparade ändringar

När projektet har osparade ändringar och du stänger fliken, laddar om eller lämnar sidan frågar webbläsaren om du vill lämna. Dess text och utseende ligger hos webbläsaren och kan inte ändras av CivilCraft. {{ui:New}} samt att öppna ett projekt eller en LandXML-fil frågar i stället i CivilCraft:s egen ruta **Osparade ändringar**, med {{ui:Cancel}}, {{ui:Don’t save}} och {{ui:Save a copy}}.
