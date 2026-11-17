---
title: Rita fastigheter och skriv deras fastighetsbeteckningar
summary: Rita en fastighet efter dess hörn eller ange sträckorna från en köpehandling eller fastighetskarta, kontrollera hur väl sträckorna sluter, märk ut riktningar och avstånd på planen, gör en sträcka till en kurva och kopiera ett utkast till fastighetsbeteckning.
keywords: fastigheter, tomter, fastighetsgränser, gräns, köpehandling, fastighetskarta, gränsbeskrivning, riktningsvinkel, avstånd, slutning, misslutning, precision, fastighetsbeteckning, startpunkt, kurva, radie, area, acres
from: 6793d6ce
---

Fastigheter ligger på planen med riktning och avstånd längs varje rak sträcka (en kurva visar sin radie, längd och centrivinkel) och deras namn och area i mitten. De går med i PDF-plotten och DWG- och DXF-exporterna, på lagren `V-PROP` (linjer) och `V-PROP-TEXT` (etiketter). Allt finns under **Fastigheter** i den högra panelen när inget är markerat.

## Rita en fastighet

1. Klicka på **Rita en fastighet**.
2. Klicka på hörnen, med början i startpunkten. Ett klick nära en mätpunkt tar punktens exakta läge.
3. Klicka på det första hörnet igen, eller tryck på {{key:Enter}}, för att avsluta. {{key:Backspace}} tar tillbaka det senaste hörnet; {{key:Esc}} tar bort de hörn som finns så långt; tryck igen för att lämna verktyget.

## Ange sträckorna från en köpehandling

1. Klicka på **Ange sträckor från köpehandling**.
2. Ange var sträckorna börjar: en mätpunkts nummer, eller en nordlig och östlig koordinat.
3. Skriv eller klistra in sträckorna, en per rad:
   - en rak sträcka: en riktning och ett avstånd, till exempel `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` och azimut (`AZ 45°30'15"`) fungerar också, och ”thence”, kommatecken och ”feet” ignoreras.
   - en kurva: `C R 300 L 52.36 right` (radie och bågängd), eller `C R 300 D 10°00'00" left` (radie och centrivinkel). En kurva följer på den sträcka som ligger före den; när den inte gör det, lägg till dess kordriktning: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` inleder en kommentarrad.
4. Medan du skriver visar dialogrutan sträckornas längd, **misslutningen** (hur långt från starten de slutar, och åt vilket håll), **precisionen** (längden delat med misslutningen, 1 : 10,000 och så vidare) och arean. Rader som inte kan läsas listas med sina radnummer.
5. **Lägg till fastigheten**. När sträckorna inte sluter stängs fastigheten med en rak sträcka över gapet: kontrollera sträckorna mot köpehandlingen. För att fördela ett fältpolygontågs fel över dess sträckor, justera det först.

## Kurvor

I en fastighets **Egenskaper** har varje sträcka en **Radie**. Skriv en radie för att göra den sträckan till en kurva mellan samma två hörn (en radie mindre än halva avståndet mellan hörnen går inte att nå, och avvisas), och välj **Höger** eller **Vänster** under **Kurvor**: en kurva åt höger har sitt centrum till höger om färdriktningen, som i en köpehandling. Rensa radien för att göra den rak igen. Varje ändring är ett steg: {{key:Mod+Z}} ångrar det.

## Fastighetsbeteckningen

En fastighets egenskaper avslutas med dess fastighetsbeteckning, skriven utifrån ritningen:

- ”Beginning at” (börjar vid) startpunkten du skriver (till exempel ”the northeast corner of Lot 4”), annars det första hörnets nordliga och östliga koordinat, eller mätpunkten som sträckorna började från.
- ”thence” (därifrån) varje sträcka: en riktning och ett avstånd, eller en kurva med dess radie, bågängd, centrivinkel samt kordriktning och kordavstånd.
- ”Containing” (innefattar) dess area i kvadratfot och acres (kvadratmeter och hektar i ett projekt i meter).

**Kopiera** lägger den på urklipp; **Ladda ner som text** sparar den som en `.txt`-fil.

:::warning
Fastighetsbeteckningen är ett utkast utifrån ritningen, inte en förrättning. En auktoriserad lantmätare måste kontrollera den mot registret och signera den innan någon förlitar sig på den.
:::

Klicka inuti en fastighet på planen för att markera den; {{key:Delete}} tar bort den. Fastigheter sparas i projektfilen.
