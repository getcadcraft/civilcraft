---
title: Tangenter och mus
summary: Varje tangentbordsgenväg samt mus-, styrplatte- och touchåtgärd i CivilCraft, grupperade, med skillnader mellan webbläsare och plattform.
keywords: tangentbord, genvägar, snabbtangenter, tangenter, mus, styrplatta, touch, panorera, zooma, nyp, hjul, högerklick, mac, Command-tangenten
from: a9756f46
---

Enkeltecknade tangenter fungerar när du inte skriver i en ruta. Genvägar med {{key:Mod}} använder Command på en Mac och Ctrl annars. Se även [Tangenter i webbläsaren](common:keys).

## Filer och redigering

| Tangent | Åtgärd |
|---|---|
| {{key:Mod+O}} | Öppna en punktfil, LandXML eller ett projekt |
| {{key:Mod+S}} | Spara projektet (laddar ner en `.civilcraft.json`-fil) |
| {{key:Mod+P}} | Plotta planen till PDF (öppnar plotdialogen, inte webbläsarens utskrift) |
| {{key:Mod+Z}} | Ångra |
| {{key:Mod+Y}} | Gör om |
| {{key:Delete}} | Ta bort de markerade punkterna, linjeföringen, byggplattan, brunnen, ledningen eller PVI:n |
| {{key:Mod+C}} | Kopiera de markerade punkterna (även som punktrader för ett kalkylblad) |
| {{key:Mod+X}} | Klipp ut de markerade punkterna |
| {{key:Mod+V}} | Klistra in punkter: de följer pekaren, klicka där de ska ligga |
| {{key:Mod+Shift+V}} | Klistra in på plats: på punkternas egna koordinater |
| {{key:Mod+D}} | Duplicera de markerade punkterna: en kopia följer pekaren |
| {{key:Mod+A}} | Markera alla punkter |
| {{key:Esc}} | Avmarkera allt (och avbryt en inklistring) |

{{key:Mod+S}}, {{key:Mod+O}} och {{key:Mod+P}} fungerar även när du skriver i en ruta. {{key:Mod+Z}} och {{key:Mod+Y}} i en textruta ångrar din skrivning i stället, som vanligt, och likaså {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} och {{key:Mod+A}}: i en ruta kopierar, klipper ut, klistrar in och markerar de i sin text. Med text markerad på sidan (i en panel) kopierar {{key:Mod+C}} den texten. {{key:Mod+Shift+Z}} gör ingenting i CivilCraft: använd {{key:Mod+Y}} eller knappen {{ui:Gör om}}.

:::mac
Tangenten som på en Mac heter **delete** är {{key:Backspace}} för webbläsaren. För att ta bort en markering, tryck på {{key:Delete}} (Fn och delete), eller välj {{ui:Ta bort}} i verktygsfältets {{ui:Mer}}-meny.
:::

## Verktyg

| Tangent | Verktyg |
|---|---|
| {{key:V}} | {{ui:Markera}} |
| {{key:M}} | {{ui:Mät}}: avstånd, areor och lutningar på planen ([Mät](topic:measure)) |
| {{key:A}} | {{ui:Linjeföring}} |
| {{key:G}} | {{ui:Byggplatta}} |
| {{key:P}} | {{ui:Ledningar}} |
| {{key:B}} | {{ui:Brytlinje}} |
| {{key:O}} | {{ui:Gräns}} |
| {{key:R}} | Visa eller dölj profilvyn |
| {{key:I}} | Slå {{ui:Lägg till PVI}} av eller på (öppnar profilvyn om den är stängd) |
| {{key:F}} | {{ui:Anpassa}}: visa allt |
| {{key:D}} | {{ui:3D}}: visa tomten i 3D, eller gå tillbaka till planen |
| {{key:E}} | Visa eller dölj lutningar och höjder längs varje funktionslinje (endast på skärmen) |

Trycker du på det aktiva verktygets tangent igen går du tillbaka till {{ui:Markera}}. Bokstäver med Shift gör ingenting.

## Medan du ritar

| Tangent | Åtgärd |
|---|---|
| {{key:Enter}} | Avsluta linjeföringen, byggplattan, ledningssträckan, brytlinjen eller gränsen |
| {{key:Backspace}} | Ta bort den senast klickade punkten |
| {{key:C}} | Funktionslinje: slå bågar av eller på (efter ett hörn klickar du en punkt på kurvan, sedan dess slut) |
| {{key:Esc}} | Avbryt ritningen (eller inklistringen); trycker du igen (eller när inget är ritat), går du tillbaka till {{ui:Markera}} och rensar markeringen |

## Planvyn

| Tangent eller åtgärd | Resultat |
|---|---|
| Hjul | Zooma in eller ut vid pekaren |
| Dra på tom yta | Panorera (i valfritt verktyg; ett kort klick klickar fortfarande; med {{key:Shift}} nedtryckt ritar den en markeringsruta i stället) |
| Dra med mittenknappen | Panorera |
| Dra med högerknappen | Panorera (ingen meny öppnas) |
| {{key:Space}} och dra | Panorera |
| Klick | Markera (med {{ui:Markera}}), eller placera en punkt (med ett ritverktyg) |
| {{key:Shift}} och klick | Lägg till en punkt i markeringen, eller ta bort den |
| {{key:Shift}} och dra | Rita en ruta: punkterna i den läggs till i markeringen. Dra runt dem för ett [lasso](topic:lasso-selection) |
| {{key:Space}} medan du ritar ett lasso | Fönster, sedan korsande, sedan staket |
| Klick vid inklistring | Lägg de inklistrade punkterna där ({{key:Enter}} lägger dem på deras egna koordinater) |
| Dra ett handtag | Flytta en PI, byggplattehörn eller brunn (ett ångra-steg) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Panorera, när planen har fokus (klicka på den först) |
| {{key:Plus}} och {{key:Minus}} | Zooma in och ut i mitten, när planen har fokus |

Tangenten = zoomar in som {{key:Plus}}, så du behöver inte Shift.

## Profilvyn

| Åtgärd | Resultat |
|---|---|
| Klick med {{ui:Lägg till PVI}} på | Lägg till en PVI där |
| Klick på en PVI | Markera den |
| Dra en PVI | Flytta den (ett ångra-steg) |
| {{key:Delete}} eller {{key:Backspace}} | Ta bort den markerade PVI:n ({{key:Backspace}} bara när profilvyn har fokus) |

Profilvyn zoomar eller panorerar inte.

## Skärm och hjälp

| Tangent | Åtgärd |
|---|---|
| {{key:F1}} | Öppna eller stäng den här hjälpen (sidpanelen); {{ui:Hjälp}} i appfältet gör detsamma |
| {{key:Esc}} | Stäng hjälppanelen när den är öppen |
| {{key:Ctrl+Shift+F}} | Byt skärmläge: helskärm, helskärm med verktygsfälten dolda, normalt |
| {{key:Esc}} | Lämna helskärm (webbläsarens egen tangent) |

{{key:F1}} når hjälpen innan CivilCraft ser den, så den fungerar i alla verktyg. På de flesta Mac-tangentbord trycker du fn med F1, eller klickar på {{ui:Hjälp}}. {{key:Ctrl+Shift+F}} använder Control-tangenten på alla plattformar, även en Mac. Se [Använda hjälpen](common:help) för hur du söker i den här hjälpen.

## Mus, styrplatta och touch

:::mouse
- Hjulet zoomar vid pekaren. En mus med ett fritt roterande hjul zoomar snabbt: ge det korta varv.
- Panorera med valfri dra på tom yta, mittenknappen, högerknappen, eller {{key:Space}} och dra.
:::

:::mac
På en Macs styrplatta:

- Tvåfingersrullning **zoomar** (den panorerar inte), och nypning zoomar också.
- För att panorera, tryck och dra på tom yta med ett finger, eller håll {{key:Space}} nedtryckt och dra.
- Ett tvåfingerklick (högerklick) öppnar ingen meny och gör inget på egen hand.
:::

:::touch
På en touchskärm:

- Den första beröringen gör knappar och menyrader fingervänliga.
- Tryck för att markera eller placera en punkt; ett finger som dras på tom yta panorerar. En tryckning kan vackla lite: den panorerar först när fingret har rört sig cirka 10 pixlar.
- Två fingrar nyper för att zooma och rör sig tillsammans för att panorera.
- Dra ett handtag eller en PVI med ett finger. Handtagen tar emot ett fingers bredd runt sig.
- Medan du ritar en linjeföring, byggplatta, brytlinje, gräns, ledningssträcka, funktionslinje eller fastighet visar ett fält över planen {{ui:Klar}} ({{key:Enter}}), {{ui:Ångra punkt}} ({{key:Backspace}}) och {{ui:Avbryt}} ({{key:Esc}}). Ett långt tryck (en halv sekund utan att röra sig) avslutar också.
- I {{ui:Markera}} lägger ett långt tryck på en punkt till den i markeringen, eller tar bort den, precis som {{key:Shift}}+klick gör.
- I 3D-vyn kretsar ett finger runt, två nyper och panorerar, och en tryckning väljer.
- Det finns ingen hovring på touch, så statusfältets avläsningar uppdateras bara medan ett finger är nedtryckt.
:::

## Webbläsartangenter som vinner

Vissa tangenter tillhör webbläsaren och når aldrig CivilCraft, till exempel {{key:Mod+W}} (stäng flik), {{key:Mod+T}} (ny flik), {{key:Mod+N}} (nytt fönster) och {{key:F11}} (helskärm i Windows- och Linux-webbläsare). CivilCraft använder dem inte. Om en genväg i stället öppnar något i webbläsaren, klicka en gång på planen så att sidan får fokus, och försök igen.

## Var Flytta finns

Det finns inget Flytta-kommando: välj {{ui:Markera}} och dra en punkt eller ett hörn, eller redigera dess koordinater i {{ui:Egenskaper}}. Se [Redigera punkter](topic:edit-points).
