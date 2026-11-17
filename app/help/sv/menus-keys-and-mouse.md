---
title: Menyer, tangenter och mus
summary: Välj en menystil som passar ditt sätt att arbeta, ge valfritt kommando en egen tangent, flytta kommandon mellan menyflikar och bestäm vad hjulet och musknapparna gör i planen och i 3D.
keywords: menystil, menyer, menyflik, civil-menyflik, verktygsfält, kommandorad, klassisk ritning, tangentbordsgenvägar, snabbtangenter, tangenter, anpassa, ändra tangent, mus, hjul, invertera, zoomriktning, mittknapp, högerknapp, panorera, kretsa, export, import, byta, bekant
from: 07ac73a0
---

Kommandona i CivilCraft är desamma oavsett hur du når dem. En **menystil** avgör bara var de sitter på skärmen, vad de heter där och vilka tangenter som kör dem, så att du kan behålla dina vanor. Välj en i {{ui:Inställningar}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menyer, tangenter och mus}}; ändringen gäller direkt, och den här webbläsaren kommer ihåg den.

## De tre stilarna

| Stil | Vad du får |
|---|---|
| {{ui:CivilCraft}} | CivilCrafts egna verktygsfält (Fil, Exportera, Terrängmodell, Design, Redigera, GIS, Visa) och enkeltangenter: {{key:A}} linjeföring, {{key:G}} byggplatta, {{key:P}} ledningar, {{key:B}} brytlinje, {{key:O}} avgränsning, {{key:L}} funktionslinje, {{key:R}} profil, {{key:X}} tvärsektioner, {{key:E}} lutningar, {{key:D}} 3D, {{key:F}} anpassa, {{key:V}} markera. Utgångsläget. |
| {{ui:Klassisk ritning}} | En liten menyflik ({{ui:Start}}, {{ui:Infoga}}, {{ui:Utdata}}) och en kommandorad, för dig som skriver kommandon: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (ångra), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Börja skriva var som helst så går bokstäverna till kommandoraden; {{key:Enter}} kör, {{key:Enter}} utan något upprepar det senaste kommandot, {{key:Esc}} rensar det. Mittknappen panorerar. |
| {{ui:Civil-menyflik}} | Flikar med stora knappar, grupperade på samma sätt som civila konstruktionsprogram grupperar sina verktyg: {{ui:Start}} (markdata, skapa design, profil- och tvärsektionsvyer), {{ui:Terrängmodeller}}, {{ui:Ändra}}, {{ui:Geoplacering}}, {{ui:Visa}} och {{ui:Utdata}}, med en {{ui:Fil}}-meny och snabbknappar till höger. Enkeltangenterna finns kvar. Mittknappen panorerar planen; i 3D panorerar mittknappen, och {{key:Shift}} med mittknappen kretsar. |

Varje stil behåller {{key:Mod}}-tangenterna: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
En tangent som hör till CivilCrafts egna layout men som din stil gav ett annat kommando gör ingenting, och statusraden anger vart dess kommando tog vägen ("I Mina tangenter är Pad Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} och piltangenterna behåller alltid sin betydelse, och när du ritar en linje behåller dess punkter sina tangenter ({{key:Backspace}}, {{key:Enter}}).
:::

## Gör den till din egen

1. Välj stilen som ligger närmast det du vill ha och klicka sedan på {{ui:Anpassa…}}.
2. Under {{ui:Tangenter och menyer}}, hitta ett kommando (sökrutan hjälper). Klicka på {{ui:Lägg till en nyckel}} och tryck på tangenten, eller på två tangenter i följd för en tvåbokstavstangent. Klicka på en tangent för att ta bort den.
3. Med en menyflik flyttar {{ui:Var det sitter}} kommandot till en annan flik och panel, till menyn {{ui:Fil}} eller till {{ui:Bara tangenter}}.
4. Under {{ui:Mus}} ställer du in hjulet, de knappar som panorerar planen och vad varje knapp gör i 3D-vyn.
5. Ge stilen ett namn och klicka på {{ui:Spara}}.

Sparar du en inbyggd stil får du en egen kopia ("Min Civil-menyflik"); den inbyggda ändras aldrig. En tangent som tilldelats två kommandon, eller en som skulle köras innan en tvåbokstavstangent hinner skrivas, visas i rött och måste åtgärdas innan du kan spara.

## Mus

- **Musens hjul**: {{ui:Rulla uppåt zoomar in}} (utgångsläget) eller {{ui:Rulla uppåt zoomar ut}}, och hur snabbt, i planen och i 3D. En nypning på styrplattan zoomar alltid åt det håll som fingrarna rör sig.
- **Panorera planen med**: mittknappen, högerknappen eller båda. {{key:Space}} och dra panorerar också. Vänsterknappen väljer och ritar alltid.
- **Dra i 3D-vyn**: {{ui:Varje vys egna}} behåller CivilCrafts knappar (vänster kretsar, höger panorerar). Eller ställ in varje knapp till kretsa, panorera, zooma eller ingenting; {{key:Shift}} med knappen byter kretsa och panorera. Ett klick utan att dra väljer fortfarande.

## Ta med dig den

{{ui:Exportera}} sparar stilen i bruk som en liten `.ccinput.json`-fil; {{ui:Importera…}} lägger till en, från en annan dator eller en kollega. En importerad fil kan bara peka på CivilCrafts egna kommandon: allt annat i den utelämnas och räknas i statusraden. {{ui:Ta bort den här stilen}} tar bort en av dina egna.

:::note
Dessa inställningar stannar i den här webbläsaren. {{ui:Använd den här stilen i alla appar}} under stilkorten gör att varje app öppnas i motsvarande stil (sin egen verktygsrad, en menyflik eller Klassisk ritning), med de ändringar du gjort i den appen. CivilCraft har ingen menyradsstil: när en annan apps menyrad väljs för alla appar behåller CivilCraft sin egen verktygsrad.
:::

Se även: [Tangentbord och mus](topic:keyboard) · [CivilCraft-inställningar](topic:settings) · [Övergång från annan civil programvara](topic:coming-from)
