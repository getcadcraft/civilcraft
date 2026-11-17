---
title: Designa en trädgård från start till mål
summary: Landskapsarkitektens tio steg, från mätningen till den publicerade uppsättningen, med vad arbetsytan Landskap gör för vart och ett idag och vad den inte gör ännu.
keywords: handledning, genomgång, hur man, landskapsdesign, trädgårdsdesign, komma igång, exempel, provexempel, steg för steg, mätning, linjer, terräng, plantering, förteckning, blad, publicera, ett projekt
from: 87900bf5
---

En landskapsdesign går i ett kretslopp: mätning, skiss, linjer, mark, ytor, nivåer, plantering, förteckningar, blad och tillbaka igen. Här är de tio stegen, med vad som finns för vart och ett. Där ett steg har en lucka nämns den under **Finns inte ännu** i slutet, och döljs inte i steget.

Du kan följa med på exempeltomten eller på din egen mätningsritning. Med din egen börjar du vid steg 1.

## 1. Hämta in mätningen

{{ui:Terrängmodell}} › {{ui:Linjer från en ritning…}}, välj mätningsritningen (DWG 2000–2018 eller DXF). Kontrollera enheterna, ta höjdkurvorna, 3D-polylinjerna och gränsen för terrängmodellen, och punktblocken som mätpunkter. Avsnittet **Mätnivåer och kontroll** läser nivåer skrivna som text eller som attribut och listar det som ser fel ut (enheter, koordinatsystem, avstånd från noll, platta höjdkurvor, udda nivåer, dubbla punkter) innan du lägger till något. Se [Kontrollera en mätningsritning vid import](topic:survey-check) och [Öppna en DWG- eller DXF-fil som linjer](topic:open-dwg-dxf). Ange koordinatsystemet med {{ui:Koordinatsystem…}}.

## 2. Handskisser

Ett pappersblad, till exempel en gammal mätning eller en markerad utskrift, importeras med {{ui:Skanna…}} (Starta från en skanning): det placeras i rätt skala eller på kända koordinater under planen och kan följas upp till linjer. ModelCraft läser ett foto av en handskiss (Fil › Importera ett skissfoto…). CivilCraft har inget eget verktyg för handskisser: placera bladet under planen och rita över det.

## 3. Från skiss till linjer

Rita funktionslinjer och konturer över mätningen i CivilCraft, eller rita dem i 2D-ritningen. Landskap › Mer › {{ui:Från en linje}} gör en linje till beläggning, en planteringsyta, en mur, trappsteg, en funktionslinje och mer, kopplat: flyttar du linjen följer objektet med. Se [Objekt från linjer](topic:objects-from-lines). I SuperCad Studio öppnar du tomten, ritningen och byggnadsmodellen i ett projekt: arbetsytan **Landskap** har verktygen för alla, och en linje som väljs i 2D-ritningen kan bli ett landskapsobjekt som följer den (Ctrl+K, {{ui:Landskapsobjekt från den valda ritningslinjen}}).

## 4. Den planerade marken

Öppna {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Arbetsytan Landskap}}. Bygg den planerade marken med {{ui:Platå}}, {{ui:Vall}}, {{ui:Svacka}} och planeringsområden med punkthöjder och höjdkurvor; beläggningen, stigarna, murarna, ramperna och trappstegen du lägger till planeras in i samma planerade yta. Den befintliga marken ändras aldrig. {{ui:Nivåer}} › {{ui:Markmodifierare…}} listar allt som formar marken i en och samma ordning, med schakt och fyllning för varje. Se [Planering](topic:landscape-grading) och [Markmodifierare och levande nivåer](topic:ground-modifiers).

## 5. Beläggning och planteringsytor

{{ui:Hårdgjorda ytor}} › {{ui:Beläggning}}, {{ui:Stig}}, {{ui:Mur}}, {{ui:Kantsten}}, {{ui:Ramp}} och {{ui:Trappsteg}}. {{ui:Ytor}} ritar en gräsmatta, bädd, äng eller marktäckare med sin uppbyggnad; den klipper sig själv runt beläggning, murar och trappsteg. {{ui:Bädd}} fyller en yta med växternas avstånd, från en blandning av växter. Se [Hårdgjorda ytor](topic:hardscape), [Planteringsytor](topic:planted-areas) och [Plantering](topic:planting).

## 6. Nivåer, lutningar och övergångar

Under **Planeringskontroller** bockar du för **Lutningsanalys** och **Flödespilar och uppdämning**. Om vatten samlas mot en terrass lägger du till en {{ui:Svacka}} runt den. Palett visar hur många sättsteg trappan behöver och om de passar, och var en stig är brantare än sin gräns. Problempanelen listar var objekt möts illa: en mur som är för hög, en bädd över beläggningen, trappsteg som missar sitt vilplan. {{ui:Punkthöjd}} och {{ui:Lutningspil}} märker ut marken och uppdateras av sig själva.

## 7. Plantering

Under **Växter** söker du i växtlistan (några hundra arter, eller din egen lista), väljer en och använder {{ui:Växt}}, {{ui:Bädd}} eller {{ui:Häck}}. Ställ in växtens storlek och etiketter under Mer. Mer › {{ui:Växtlista}} redigerar dina egna poster: sorter, levererade storlekar, täthet och specifikationsanteckningar. Varje post kan innehålla din egen symbol och 3D-modell (OBJ, STL eller GLB), och Mer › {{ui:Växtgrafik}} ritar växter enklare i grövre skalor. Se [Växtlistan](topic:plant-list), [Växtposter](topic:plant-records) och [Växtgrafik](topic:plant-graphics).

## 8. Mängder och förteckningar

Mer › {{ui:Kalkylblad}}: växt- och hårdgjorda förteckningar, och dina egna, förblir kopplade till objekten; spara dem som CSV eller XLSX, eller lägg dem på bladen (se [Kalkylblad](topic:worksheets)). Mer › {{ui:Växtförteckning…}} skickar antalen till TakeoffCraft. Mängderna för de hårdgjorda ytorna finns i Palett för beläggning, mur och trappsteg. Bevattningen har sin egen materialförteckning: {{ui:Bevattning}} › **Kontrollera systemet…**. Se [Bevattning](topic:irrigation).

## 9. Ritningar och blad

Mer › {{ui:Landskapsblad…}}: plantering-, planerings- och bevattningsplaner, med detaljer. {{ui:Nivåer}} › {{ui:Snittlinje}} ritar sektioner genom marken, murarna, uppbyggnaderna, trappstegen och växterna. Se [Landskapsblad](topic:landscape-sheets) och [Sektioner och utgivningsuppsättningen](topic:landscape-sections).

## 10. Publicera

{{ui:Utgivningsuppsättning (.zip)}} i dialogrutan för blad skapar en PDF med en bladförteckning och en DWG per blad. Mer › {{ui:Exportera landskaps-IFC}} ger BimCraft växterna och de hårdgjorda ytorna. Spara projektet: allt finns i en och samma fil.

## Ändra en sak: trappan

Poängen med att hålla allt i ett projekt är att en ändring går igenom. Prova det med en trappa mellan två terrasser:

1. Rita trappans linje som en funktionslinje (eller en linje i ritningen), och sedan Landskap › Mer › {{ui:Från en linje}} › {{ui:Trappsteg}}. I trappstegens Palett bockar du för **Formar marken** och ställer in nedre och övre nivå till de två terrasserna.
2. Rita en planteringsbädd bredvid och under trappan med {{ui:Ytor}}, och beläggning på terrasserna. Bädden klipper sig själv runt trappstegen och beläggningen, och växtförteckningen räknar bara det som planteras.
3. Höj trappans övre nivå i Palett. Den planerade marken, punkthöjderna, lutningspilarna och schakt och fyllning ändras på en gång. Om trappan inte längre möter den övre terrassen, säger Problempanelen med hur mycket.
4. Flytta trappans linje. Trappstegen följer sin linje i samma ångra-steg; bädden klipps om och räknas om, och kalkylbladen och förteckningarna visar de nya siffrorna.
5. Tryck en gång på Ctrl+Z: linjen, trappstegen, marken och bädden går tillbaka tillsammans.

Se [Markmodifierare och levande nivåer](topic:ground-modifiers), [Planteringsytor](topic:planted-areas) och [Kalkylblad](topic:worksheets).

## Finns inte ännu

Dessa efterfrågas men finns inte i den här versionen:

- Murar som formar marken (de rapporterar var de möter den och att deras överkant kan följa den).
- Redigering av din egen växtlista från biblioteket i appen (redigera projektets lista och spara den som en växtfil).
- Texturer och färger i dina egna GLB-växtmodeller (formen läses; växtens färg används).

Se [Arbetsytan Landskap](topic:landscape) för alla verktyg.
