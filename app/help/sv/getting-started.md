---
title: Kom igång med CivilCraft
summary: Vad CivilCraft gör, hur du öppnar det och de första tio minuterna med exempelplatsen, från punkter till höjdkurvor, en väg och ett sparat projekt.
keywords: start, första körningen, exempelplats, introduktion, snabbstart, handledning, börja, nytt projekt
from: c9b6dd8e
---

CivilCraft är appen för mark- och platsprojektering i CadCraft-familjen. Den gör inmätningspunkter till en terrängmodell (ett TIN) med höjdkurvor och låter dig sedan lägga ut linjeföringar med projekteringsprofiler, svepa fram en enkel vägkorridor, planera byggplattor till släntkrön, kontrollera ett självfallsledningsnät mot dina regler och se schakt- och fyllningsvolymer. Den läser och skriver LandXML, exporterar planen som DXF och plottar den till PDF.

Om du har använt Civil 3D känns idéerna igen: punkter, punktgrupper, brytlinjer, linjeföringar med skärningspunkter (PI), profiler med PVI, korridorer, planering, ledningsnät. Arbetssättet är annorlunda och mycket mindre: det finns ingen kommandorad, inga stilar och ingen ritningsfil. Läs [Du kommer från annan markprogramvara](topic:coming-from) en gång innan ditt första riktiga jobb.

## Det här behöver du

- En ny webbläsare för dator: Chrome, Edge, Firefox eller Safari. Se [Webbläsare](common:browsers).
- En mus eller styrplatta och ett tangentbord, eller en pekskärm: vid ritning finns knapparna {{ui:Klar}}, {{ui:Ångra punkt}} och {{ui:Avbryt}} på skärmen (se [Mus, styrplatta och touch](topic:keyboard#mouse-trackpad-and-touch)).
- Planen ritas i 2D med webbläsarens canvas. [3D-vyn](topic:site-3d) använder webbläsarens WebGL-grafik; om den inte kan starta anger statusfältet varför, och planen fungerar ändå.
- Inget konto och ingen uppladdning. Filer öppnas på din dator och sparas som nedladdningar. Se [Dina filer](common:your-files).

:::note
CivilCraft körs i dag som en tidig webbläsarversion som fortfarande utvecklas. Det finns inga skrivbordsversioner ännu och molnlagring finns inte ännu. Allt du gör stannar på din dator tills du sparar eller exporterar det.
:::

## Öppna CivilCraft

1. Öppna CivilCraft i webbläsaren.
2. Vänta tills skärmen fylls: ett verktygsfält längst upp, en panel till vänster, planen i mitten och en panel **Egenskaper** till höger.
3. På en tom plan ser du en ruta med rubriken **Börja med inmätningspunkter**. Den listar de första stegen och har en länk, {{ui:Öppna exempelplatsen}}.

För att använda CivilCraft utan uppkoppling senare klickar du på {{ui:Spara för offline}} i appfältet och väntar tills {{ui:Redo för offline}} visas. Det omfattar den här hjälpen, exempelplatsen samt 3D- och GIS-biblioteken. Se [Offline](common:offline). Tryck på {{key:F1}} eller klicka på {{ui:Hjälp}} när som helst för att öppna den här hjälpen bredvid appen.

## Dina första tio minuter: exempelplatsen

Exempelplatsen är en liten inmätning i amerikanska fot: 276 punkter i state plane-koordinater, en rygg, en svacka med en rännlinje och två släntkrön. Den följer med appen, så du kan följa med utan en egen fil.

1. Klicka på {{ui:Öppna exempelplatsen}} i rutan på planen.
   Dialogrutan **Importera punkter** öppnas. Den säger ”276 punkter lästes som PNEZD (från rubrikraden), åtskilda av kommatecken.” och visar de första raderna.
2. Klicka på {{ui:Importera}}.
   Planen fylls med punkter, höjdkurvor och terrängmodellens kant. Statusfältet längst ned anger att punkterna importerades och hur många trianglar terrängmodellen har (546).
3. Titta i vänstra panelen under **Punkter**. Punkterna är grupperade efter det första ordet i beskrivningen: CP, FL, GRD, RIDGE, TBN, TBS och TREE.
4. I kolumnen **Terrängmodell** i den tabellen ställer du in **FL**, **RIDGE**, **TBN** och **TBS** på {{ui:Brytlinje}}.
   Terrängmodellen byggs om direkt. Fakta om **Terrängmodell** säger nu ”Brytlinjer: 4”, och höjdkurvorna böjer skarpt längs rännlinjen och ryggen i stället för att skära rakt över dem.
5. För pekaren över planen. Statusfältet visar östvärde och nordvärde under pekaren och markhöjden där.
6. Under **Visning** ställer du in {{ui:Höjdkurvor var}} på 0,5 ft och slår på {{ui:Höjdband}}. En färgskala visas med en teckenförklaring under kryssrutorna. Slå av banden igen när du är klar.

Nu har du en befintlig markyta. Därnäst en väg.

## Lägg ut en kort väg

1. Tryck på {{key:A}} (eller klicka på {{ui:Linjeföring}} i gruppen **Projektering**).
2. Klicka på tre punkter över platsen, en efter en. En röd linje följer pekaren och visar längd och riktning för nästa raksträcka.
3. Tryck på {{key:Enter}} för att avsluta.
   Linjeföringen visas med stationering. Högerpanelen visar **Linjeföring**: dess längd, PI-tabellen och kurvan i mittersta PI (radie 100 ft, eller mindre om 100 ft inte får plats).
4. I högerpanelen, under **Projekteringsprofil**, klickar du på {{ui:Starta från marken}}.
   Profilvyn öppnas under planen med befintlig mark och en rak projekterad lutning från ände till ände.
5. Tryck på {{key:I}} för att slå på {{ui:Lägg till PVI}} och klicka sedan en gång i profilvyn nära mitten. En PVI visas.
6. I PVI-tabellen till höger skriver du en kurvlängd (till exempel 100) i rutan **Kurva L** för den mittersta PVI och trycker på {{key:Enter}}. Profilen har nu en vertikalkurva, med sitt K-värde angivet.
7. Under **Korridor** kryssar du i **Svep en sammansättning längs projekteringsprofilen**.
   Vägen planeras in i marken: körfält, vägrenar och slänter till släntkrön. Blocket **Markarbeten** visar schakt och fyllning.

Oroa dig inte för exakta värden. Varje tal kan ändras i högerpanelen, och {{key:Mod+Z}} ångrar den senaste ändringen.

## Spara ditt arbete

1. Skriv ett namn i **Namn** överst i vänstra panelen.
2. Tryck på {{key:Mod+S}} (eller klicka på {{ui:Spara}}).
   Webbläsaren laddar ner en fil som är uppkallad efter platsen och slutar på `.civilcraft.json`. Den innehåller punkterna, terrängmodellens inställningar, linjeföringar, profiler, korridorer, byggplattor och ledningar.
3. För att fortsätta senare klickar du på {{ui:Öppna}} (eller trycker på {{key:Mod+O}}) och väljer den filen, eller släpper den på planen.

:::warning
Det finns ingen automatisk sparning. Om du stänger fliken med osparade ändringar frågar webbläsaren om du vill lämna sidan; lämnar du den är ändringarna borta. Spara ofta.
:::

## Vart du går härnäst

- [Importera inmätningspunkter](topic:import-points) från dina egna filer.
- [Bygg och förfina terrängmodellen](topic:build-surface) med brytlinjer och en gräns.
- [Skärmen, del för del](topic:workspace).
- [Tangenter och mus](topic:keyboard).
