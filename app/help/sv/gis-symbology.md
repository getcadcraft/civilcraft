---
title: Formatera ett lager efter ett attribut
summary: Färgsätt objekten i ett GIS-lager efter värdena i ett fält (en färg per värde, eller efter talintervall), storleksanpassa punkter efter ett tal, tona polygoner och visa en teckenförklaring på planen.
keywords: symbologi, format, formatera, färg, kategoriserad, graderad, unika värden, lika intervall, kvantil, naturliga brytpunkter, jenks, skala, färgblind, teckenförklaring, storlek, punkter, koropleth, klasser, gis
from: a3a69add
---

Öppna ett lagers **tre prickar**-meny i listan GIS-lager och välj {{ui:Style by attribute…}}.

## Tre format

- **Enkel symbol:** lagrets färg, som tidigare.
- **Kategoriserad:** en färg per särskilt värde i valfritt fält. Upp till åtta värden får de åtta Okabe-Ito-färgerna (valda för att hålla isär vid de vanligaste typerna av färgblindhet); med fler värden får de sju vanligaste var sin färg, och resten delar en grå klass **Övrigt**. Objekt utan värde är grå.
- **Graderad:** ett talfält delas i 2 till 9 intervall, var och en med en färg från en skala. Ett värde på en brytpunkt hamnar i det lägre intervallet.

## Så delas intervallen

| Metod | Brytpunkter |
|---|---|
| Lika intervall | Intervallet från minsta till största värdet delas i lika breda steg. Värdena 0 till 30 i tre intervall: 0, 10, 20, 30. |
| Kvantil | Ungefär samma antal objekt i varje intervall. Brytpunkterna läses från de sorterade värdena med den vanliga räta linjeinterpolationen: för 1 till 10 i två intervall blir brytpunkten 5.5. |
| Naturliga brytpunkter (Jenks) | De snitt som lämnar minst spridning inom varje intervall, så att klumpar av liknande värden hålls samman. Vid fler än 1,500 värden arbetar den med 1,500 jämnt fördelade och säger det. |

## Färger

Viridis och Cividis går från mörkt till ljust med en jämn förändring i ljushet, så ordningen på intervallen kan läsas även i gråskala eller vid färgblindhet. Blues går från ljust till mörkt. Röd till blå är en tvåvägsskala för värden runt ett mittvärde. **Vänd färgerna** vänder vilken som helst av dem. Dialogrutan listar intervallen och antalet objekt i varje innan du tillämpar den.

## Storlek, fyllning och teckenförklaring

- **Punktstorlek efter** ett talfält gör varje punkts kvadrat större ju större värdet är, mellan de två storlekar du anger (halva sidan, i millimeter på papper).
- **Tona insidan av polygoner** fyller varje polygon i sin klassfärg (hål förblir tomma). Tonen syns på skärmen; utskrifter och DXF/DWG visar de färgade konturerna.
- **Visa en teckenförklaring på planen** ritar klasserna, deras antal och storlekskalan nere till vänster på planen. Teckenförklaringen syns på skärmen; den ingår inte i en utskrift.
- För att etikettera objekt med ett fält, använd **Etikettera med** i samma meny.

Formatet sparas i projektfilen. En version som inte känner till format öppnar filen med lagrets färg. Utskrifter, DXF och DWG bär klasserna som separata lager som heter efter lagret och klassen, i den närmaste av de nio grundläggande CAD-färgerna. Ett lager med fler än 200,000 objekt ritas i en enda färg.
