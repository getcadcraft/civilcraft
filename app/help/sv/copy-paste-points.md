---
title: Markera, kopiera och klistra in mätpunkter
summary: Markera punkter med klick, Shift och en ruta eller alla på en gång; kopiera, klipp ut, klistra in, klistra in på plats, duplicera och ta bort dem med nya punktnummer som aldrig krockar; klistra in punktrader till och från ett kalkylblad.
keywords: kopiera, klistra in, klipp ut, duplicera, ta bort punkter, markera punkter, markera alla, rutmarkering, fönster, urklipp, kalkylblad, CSV, numrera om, punktnummer, klistra in på plats, klona, utsättning
from: 78a6aea7
---

Punkter kan kopieras och klistras in inom ett projekt, mellan projekt i två webbläsarflikar och till och från ett kalkylblad. Varje ändring är ett ångra-steg, och terrängmodellen byggs om direkt från de nya punkterna.

## Markera punkter

Med {{ui:Markera}} ({{key:V}}):

- **Klicka** på en punkt för att markera den (och bara den). Dess nummer visas under **Egenskaper**.
- {{key:Shift}} och **klicka** lägger till en punkt i markeringen, eller tar bort den.
- {{key:Shift}} och **dra** ritar en ruta: punkterna inuti den läggs till i markeringen. Dra runt punkterna i stället så blir det ett lasso; se [Lassomarkering av punkter](topic:lasso-selection). Ett drag utan {{key:Shift}} panorerar, som vanligt.
- {{key:Mod+A}} (eller {{ui:Mer}} › {{ui:Markera alla punkter}}) markerar varje punkt.
- {{key:Esc}} (eller {{ui:Mer}} › {{ui:Avmarkera}}) rensar markeringen.

Markerade punkter har en ring. När fler än en är markerad visar **Egenskaper** hur många de är, deras nummer, deras höjdintervall och deras grupper.

## Kopiera, klipp ut och ta bort

- {{ui:Kopiera}} eller {{key:Mod+C}} kopierar de markerade punkterna. CivilCraft behåller kopian och lägger den dessutom på systemets urklipp som punktrader, så att du kan klistra in den direkt i ett kalkylblad eller en textfil.
- {{ui:Mer}} › {{ui:Klipp ut}} eller {{key:Mod+X}} kopierar dem och tar bort dem, i ett steg.
- {{ui:Mer}} › {{ui:Ta bort}} eller {{key:Delete}} tar bort dem. {{key:Mod+Z}} återställer dem.

Raderna är punkt, nordvärde, östvärde, höjd, beskrivning (P,N,E,Z,D), åtskilda med kommatecken, med tre decimaler. Om du vill ha östvärde före nordvärde ställer du in **Punktrader** i [CivilCraft-inställningar](topic:settings). En beskrivning som ett kalkylblad skulle tolka som formel (börjar med =, +, - eller @) får ett apostrof framför sig, så att den förblir text.

## Klistra in

1. Tryck på {{key:Mod+V}} eller klicka på {{ui:Klistra in}}. Punkterna följer pekaren som små kryss, med en prickad linje tillbaka till var de kom ifrån.
2. Klicka där de ska ligga. Mitten av de kopierade punkterna hamnar på klicket.
3. Eller tryck på {{key:Enter}} för att lägga dem på sina egna koordinater, eller på {{key:Esc}} för att avbryta.

{{ui:Mer}} › {{ui:Klistra in på plats}} eller {{key:Mod+Shift+V}} klistrar in på punkternas egna koordinater direkt. De inklistrade punkterna markeras efteråt, så att du kan kopiera, flytta eller ta bort dem igen.

:::note
Ett klick på {{ui:Klistra in}} i verktygsfältet läser systemets urklipp. Första gången kan webbläsaren fråga om CivilCraft får se urklippet. Om du nekar pastar verktygsknappen bara in CivilCraft:s egna kopia; {{key:Mod+V}} klistrar fortfarande in rader från ett kalkylblad utan att fråga.
:::

## Punktnummer krockar aldrig

Två punkter delar aldrig ett nummer. När du klistrar in:

- En inklistrad punkt behåller sitt nummer när ingen punkt i projektet har det. Så efter **Klipp ut** klistras punkterna tillbaka med sina egna nummer, och punkter kopierade från ett annat projekt behåller sina där de är lediga.
- En inklistrad punkt vars nummer är upptaget får ett nytt heltal: ett mer än det högsta numret som används, räknat uppåt.
- Statusfältet säger vad som hände, till exempel ”1 behöll sitt nummer; 9 fick nya nummer: 10–18 blev 277–285”.

I [CivilCraft-inställningar](topic:settings) kan du välja **Alltid nya nummer**, och ett nummer för de nya att börja på, till exempel 5000 för projekteringspunkter.

:::warning
Punktgrupper som bygger terrängmodellen som en **brytlinje** förbinder sina punkter i nummerordning. Inklistrade kopior av brytlinjepunkter (till exempel FL-mätningar) får nya, högre nummer och ansluter till slutet av den brytlinjen, eventuellt med ett långt hopp. Kontrollera planen efter att du har klistrat in sådana punkter, eller ställ in deras grupp till {{ui:Punkter}}.
:::

## Duplicera

{{ui:Mer}} › {{ui:Duplicera}} eller {{key:Mod+D}} gör en kopia av de markerade punkterna som följer pekaren: klicka där den ska ligga. Kopiorna får alltid nya nummer, och CivilCraft:s urklipp lämnas som det var.

## Från ett kalkylblad eller en textfil

Markera rader med punkter i ett kalkylblad (punkt, nordvärde, östvärde, höjd, beskrivning) och kopiera dem. I CivilCraft trycker du på {{key:Mod+V}} och klickar där de ska ligga, eller trycker på {{key:Mod+Shift+V}} för att lägga dem på deras egna koordinater, vilket oftast är det du vill ha för riktig mätdata.

Raderna läses exakt som en [punktfil](topic:point-file-formats): kommatecken, tabbar eller mellanslag, en rubrikrad om en sådan finns. Utan rubrikrad kommer kolumnordningen från **Punktrader** i [CivilCraft-inställningar](topic:settings).

När båda finns avgör CivilCraft efter vad som är nyast: rader på systemets urklipp som skiljer sig från CivilCraft:s senaste kopia kopierades senare, så de klistras in. Text som inte innehåller några punkter ignoreras, och CivilCraft:s egen kopia klistras in i stället.

## Mellan projekt och flikar

Kopian sparas i den här webbläsaren, så en andra CivilCraft-flik kan klistra in den, även efter att den första fliken har stängts. Punkter kopierade i ett projekt i meter och inklistrade i ett projekt i fot behåller sina nummer som de är: inget omvandlas, och statusfältet säger det.

## Det som inte kopieras

Bara mätpunkter kopieras för närvarande. Linjeföringar, byggplattor, ledningsnät, brytlinjer och gränser kan inte kopieras eller klistras in ännu. Att klistra in kan inte flytta befintliga punkter: använd {{ui:Klipp ut}} och klistra in, eller flytta en punkt i taget ([Redigera en mätpunkt](topic:edit-points)).
