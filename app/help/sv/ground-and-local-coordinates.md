---
title: Markkoordinater och lokala koordinater
summary: Arbeta i markkoordinater (ytkoordinater) skalade från rutnätet med en kombinerad skalfaktor som du skriver in eller beräknar i en punkt, eller i ett antaget platsnät kopplat till systemet med två kontrollpunkter.
keywords: markkoordinater, ytkoordinater, rutnät till mark, kombinerad skalfaktor, csf, kombinerad faktor, rutnätsfaktor, höjdfaktor, havsnivåfaktor, konvergens, avbildningsvinkel, skalfaktor, antagna koordinater, lokala koordinater, platsnät, 5000 5000, kontrollpunkter, lokalisering, kalibrering, två punkter, misslutning
from: 3d7453de
---

State plane- och UTM-koordinater är **rutnätskoordinater**: en kartprojektion sträcker eller krymper avstånd lite (tiotals delar per miljon), och ju högre platsen ligger, desto mer skiljer sig ett uppmätt markavstånd från rutnätsavståndet. Många mätningar lämnar därför över **markkoordinater**, skalade så att planavstånden är lika med avstånd mätta på marken, eller ett **antaget** platsnät (5000, 5000 vid en kontrollpunkt). CivilCraft behåller dina siffror som de är och antecknar hur de förhåller sig till rutnätet, så att latitud och longitud, GIS-filer och kartlager fortfarande hamnar rätt.

Öppna {{ui:Coordinates}} i gruppen {{ui:GIS}}, välj (eller behåll) systemet, och välj sedan under **Rutnäts-, mark- eller lokala koordinater**:

| Val | Dina koordinater är | Hur de förhåller sig till rutnätet |
|---|---|---|
| {{ui:Grid}} | Systemets egna (utgångspunkten) | Samma siffror |
| {{ui:Ground}} | Skalade till markavstånd | rutnät = bas + kombinerad faktor × (mark − bas) |
| {{ui:Local}} | Ett antaget platsnät | Förskjutna, vridna och skalade till rutnätet via två kontrollpunkter |

Det du väljer sparas med projektet och är ett steg i ångra; ingenting flyttas.

## Markkoordinater

1. Välj {{ui:Ground}}.
2. Skriv in den **kombinerade skalfaktorn** från mätningen (till exempel `0.99987`), eller beräkna den:
   1. Under **Beräkna faktorn i en punkt** startar punkten i projektets mitt. Välj {{ui:Pick a point on the plan}} och klicka på platsen (ett klick nära en mätpunkt tar den punkten), eller skriv in E och N.
   2. Höjden tas från ytan där; skriv in en annan om du behöver det.
   3. Välj {{ui:Compute}}. CivilCraft visar:
      - **Rutnätets skalfaktor k**: hur mycket kartprojektionen sträcker avstånd där.
      - **Höjdfaktor**: hur mycket kortare avstånden är på ellipsoiden än på den höjden.
      - **Kombinerad faktor** = k × höjdfaktor: rutnätsavstånd = markavstånd × detta.
      - **Konvergens**: vinkeln från rutnätets nord till sann nord där.
   4. Välj knappen {{ui:Use}} under siffrorna för att lägga in den kombinerade faktorn i rutan.
3. Ange **Basen**, där mark- och rutnätskoordinater är samma. Den börjar på 0, 0: de flesta myndigheter som publicerar markkoordinater skalar kring origo, så att markkoordinaterna förblir igenkännbart nära rutnätskoordinaterna. Vissa mätningar skalar i stället kring projektets kontrollpunkt: använd det mätningen anger.
4. Välj {{ui:Apply}}.

:::warning
Höjden tas som höjd över ellipsoiden. CivilCraft har ingen geoidmodell, så där geoiden ligger 30 m (100 ft) under eller över ellipsoiden är höjdfaktorn fel med cirka 5 ppm. När mätningen anger sin kombinerade faktor, skriv in den.
:::

## Lokala (antagna) koordinater

1. Välj {{ui:Local}}.
2. För **Kontrollpunkt 1**, skriv mätpunktens nummer (eller välj {{ui:Pick}} och klicka på den på planen). Dess lokala koordinater visas bredvid.
3. Skriv in dess **rutnäts**-E och N, eller dess latitud och longitud i den tredje rutan (till exempel `30.2672, -97.7431`).
4. Gör likadant för **Kontrollpunkt 2**, så långt från den första som möjligt.
5. CivilCraft visar **Skala** och **Rotation** som hittats, och påminner dig: **Två punkter passar alltid exakt — kontrollera en tredje.**
6. Ange en **Verifieringspunkt** på samma sätt. CivilCraft visar hur långt anpassningen placerar den från de rutnätskoordinater du skrev (dess misslutning, i projektets enheter och i delar per miljon). En stor misslutning betyder en felaktig punkt, ett skrivfel eller koordinater i en annan enhet.
7. Välj {{ui:Apply}}.

En skala långt från 1 (utöver 0.5 till 2) avvisas: kontrollera punkterna och deras enheter.

## Vad som kontrollerats

- Skalfaktorn och konvergensen stämmer mot PROJ (pyproj 3.7.1 med PROJ 9.5.1), koordinatbiblioteket de flesta GIS-program använder, med 1 del på en miljard för över 300 system med konforma projektioner (state plane, UTM, transversal Mercator, Lamberts konforma koniska), och i webbläsaren vid en punkt som väljs på planen.
- Mark- och lokala steg konverteras fram och tillbaka med 1 del på en miljard; två kontrollpunkter ger tillbaka den skala och rotation de skapades med; en verifieringspunkt 0.05 ft från rätt plats visar en misslutning på 0.05 ft.
