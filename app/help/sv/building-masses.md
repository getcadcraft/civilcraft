---
title: Rita byggnadsvolymer på en tomt
summary: Rita en byggnadsvolym på en fastighet, ge den våningar och en våningshöjd, se dess bruttoarea, välj hur den sitter i sluttande mark, tryck och dra dess höjd i 3D, och skicka den till BimCraft eller spara den som en IFC-fil.
keywords: volymstudie, byggnadsvolym, volym, fotavtryck, våningar, våningshöjd, bruttoarea, GFA, BTA, lutning, sockel, schakt och fyllning, tryck och dra, 3D, tomtstudie, tidig design, IFC, utveckla, BimCraft, A-MASS
from: e5a67c16
---

En byggnadsvolym är ett fotavtryck, ett antal våningar och en våningshöjd: den tidiga frågan "hur mycket byggnad ryms här, och vad gör det med marken". Volymer ligger i planen med sitt namn, antal våningar och bruttoarea, ingår i PDF-utskriften och i DWG- och DXF-exporterna på lagren `A-MASS` och `A-MASS-TEXT`, och sparas i projektfilen.

## Rita en volym

1. I **Egenskaper**, under **Byggnadsvolymer**, klicka på **Rita en volym**. (Den finns också i verktygsfältets meny **Mer** bredvid **Terrängmodell**.)
2. Klicka på fotavtryckets hörn. Ett klick nära ett fastighetshörn eller en mätpunkt tar den punktens exakta plats.
3. Klicka på det första hörnet igen, eller tryck på {{key:Enter}}, för att avsluta. {{key:Backspace}} tar tillbaka det sista hörnet; {{key:Esc}} stoppar.

En ny volym har tre våningar och en våningshöjd på 12 ft (3.6 m), och tillhör den fastighet dess mitt ligger i.

## Våningar, höjd och area

Klicka på en volym för att ändra dess **Namn**, **Användning**, **Våningar**, **Våningshöjd** och **Fastighet**. **Höjd** är våningar gånger våningshöjd: skriv en höjd så blir våningsantalet närmaste hela antal våningar (aldrig mindre än en). **Fotavtryck** och **Bruttoarea** (fotavtryck gånger våningar) räknas ut åt dig.

## I sluttande mark

Marken under en volym hämtas från terrängmodellen: befintlig mark, eller den planerade marken där du valt **Planerad mark (planerad)**. **I sluttande mark** anger var bottenvåningen hamnar:

- **Trappad**: vid den genomsnittliga marken under fotavtrycket. Den låga sidan fylls upp till den och den höga sidan schaktas, och de två blir nära att jämna ut sig.
- **Sockel**: vid den högsta marken. En massiv sockel fyller den låga sidan.
- **Schakt**: vid den lägsta marken. Den höga sidan schaktas bort in i backen.

Egenskaper visar spannet av mark under volymen, **Bottenvåningens nivå**, och volymen fyllning och schakt mellan marken och den nivån. En punkt av fotavtrycket som ligger utanför terrängmodellen utelämnas, och Egenskaper säger hur många.

## I 3D-vyn

Volymer ritas i 3D-tomtvyn, med en linje runt varje våning och deras namn över taket. **Visa** har en kryssruta för **Byggnadsvolymer**. Klicka på en för att markera den. Med en volym markerad:

- dra dess tak upp eller ner för att trycka eller dra den en våning i taget, eller tryck på {{key:PageUp}} och {{key:PageDown}};
- hela flytten är ett enda steg att ångra.

Gatuvyn i **Kör** ser också volymerna, och **Sol** kastar deras skuggor på marken.

## Skicka vidare

- **Volymer som IFC** sparar varje volym som en IFC4-fil: en tomt, en byggnad med sina våningsplan, och volymen som ett byggnadselement med sina värden i egenskapsuppsättningen `CadCraft_SiteMass`. Med ett koordinatsystem satt för projektet placeras filen på kartan och bär tomtens latitud och longitud; utan ett säger den ingenting om var den ligger.
- **Utveckla i BimCraft** öppnar BimCraft i en ny flik med volymerna. Där visar ett val av en volym dess värden och **Utveckla den här volymen**, som bygger väggar på varje våningsplan och ett bjälklag under byggnaden från fotavtrycket, i ett enda steg att ångra. Inget laddas upp: filen går mellan de två flikarna i den här webbläsaren.

Se även **Detaljplanegränser** och **Soltimmar**.
