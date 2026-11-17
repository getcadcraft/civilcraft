---
title: Växtlistan
summary: Cirka 420 vanliga tempererade och medelhavsväxter med deras storlekar, härdighet, ljus och vatten, sökbara på vilket språk som helst, plus din egen lista som sparas med projektet.
keywords: växtlista, växtdatabas, art, botaniskt namn, vanligt namn, växtpalett, plantskolelista, härdighetszon, csv, importera växter, exportera växter, mina växter, trädlista, buskelista, växtförteckning, växtbibliotek
from: 7ed09e7e
---

Avsnittet **Växter** i den vänstra panelen listar varje växt du kan placera. Klicka på en för att se dess storlekar och göra den till den växt som verktygen **Växt**, **Bädd** och **Häck** använder.

## Sök och filtrera

Skriv i **Sök**: valfritt ord i en växts namn på vilket språk som helst (engelska, spanska, portugisiska), dess botaniska namn, dess typ eller ett ord i dess anteckningar. Varje ord du skriver måste matcha, så `quercus evergreen` hittar de vintergröna ekarna. Accenter spelar ingen roll.

Smalna av listan med **Typ**, **Ljus**, **Vatten** och **Härdighetszon** (USDA-zonen din plats ligger i: en växt visas när zonen ligger inom dess intervall).

## Vad en växt innehåller

| Fält | Betydelse |
|---|---|
| Typ | Träd, buske, häck, gräs (inklusive gräsmattor), perenn, marktäckare eller klättrare |
| Vid mognad | Höjd och spridning för växten när den vuxit i en trädgård eller på en gata, i meter |
| Vid plantering | Storleken den planteras i, och dess behållare |
| Avstånd | Centrum till centrum i en bädd eller längs en häck |
| Härdighetszon | De USDA-zoner den vanligen klarar sig i |
| Ljus, vatten, jord | Vad den behöver |
| Anteckningar | Användningsområden och varningar, till exempel giftiga delar eller en växt som sprider sig |

:::note
Den inbyggda listan skrevs för CadCraft utifrån allmän trädgårdskunskap: typiska storlekar, avrundade. Den är inte någon plantskolas katalog. Kontrollera storlekar och härdighet med en lokal plantskola. De mest kända invasiva växterna på Iberiska halvön och i stora delar av den tempererade zonen är avsiktligt utelämnade, och några som är invasiva på vissa platser har en anteckning.
:::

## Egna växter

- **Lägg till i projektets lista** kopierar en växt till projektets egen lista, där den sparas med projektet. En växt i din lista ersätter den inbyggda med samma nyckel, så du kan ändra dess storlekar för din region.
- **Importera en växtlista…** läser en CSV (eller en växtfil). CSV-filen behöver en kolumn med det botaniska namnet och helst typ, höjd och spridning; kolumnnamn på egna ord fungerar (Latin, Common name, Height, Spread, Width, Zone). Kommatecken, semikolon eller tabbar, och decimalkommatecken, läses. Tomma planteringsstorlekar, avstånd och behållare får rimliga standardvärden för typen.
- **Exportera som CSV** sparar din lista (eller, om den är tom, de växter sökningen visar) för att öppnas i ett kalkylblad.

En växtlista läses som alla filer från utsidan: allt den inte kan använda utelämnas och räknas.

## Växter i andra appar

Växtlistan är ett bibliotek för alla CadCraft-appar: BimCraft och ModelCraft har samma lista, men deras egen Placera från bibliotek erbjuder inte växter än. Idag når växter en BIM-modell genom CivilCraft:s landskaps-IFC (varje växt en `IfcGeographicElement`). Se [Planting](topic:planting#ifc).
