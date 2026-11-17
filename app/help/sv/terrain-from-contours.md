---
title: Terräng från höjdkurvor
summary: Gör markytan av en höjdkurvekarta: välj linjelagren, ange varifrån varje linjes höjd kommer, kontrollera korsningar och dubbletter, och bygg. Höjdkurvor blir brytlinjer, med platta trianglar på ryggar och i dalar åtgärdade. En karta som ritats från en bild eller en PDF kan skalas och placeras med två kända punkter.
keywords: höjdkurvor, höjdkurvelinjer, terräng från höjdkurvor, markyta från höjdkurvor, topografisk karta, mätkarta, inga koordinater, brytlinjer, platta trianglar, rygg, dal, kulle, korsande höjdkurvor, dubbla höjdkurvor, ekvidistans, skala karta, två punkter, placera karta, DXF, DWG, shapefile
from: e6161653
---

En mätare skickar ibland en höjdkurvekarta: linjer med höjder, men inga punkter. CivilCraft bygger den befintliga marken av dessa linjer.

## Ta in höjdkurvorna

Öppna kartan som linjer: en DXF- eller DWG-ritning, en shapefil eller GeoJSON (**GIS** › {{ui:Importera}}, eller släpp filen på planen). Linjerna kommer in som **kartlager**. Under **Terrängmodell** › {{ui:Mer}} väljer du {{ui:Terräng från höjdkurvor}}.

## Ange varifrån varje höjd kommer

Markera lagren som innehåller höjdkurvor, och välj sedan **Höjd från**:

- {{ui:Linjernas egna höjder}}: en linje vars hörn alla har samma höjd (en 3D-polylinje, eller en polylinje med en höjd). En linje på 0 är planritning och har ingen nivå.
- Ett **talfält** i lagret (till exempel ELEV), när kartan kom med ett.
- {{ui:En start och ett intervall, i den ordning linjerna listas}}: för linjer som inte har någon höjd alls. Den första listade linjen får **Första linjens höjd**, nästa den plus **Ekvidistans**, och så vidare. Lista linjerna från den lägsta uppåt (eller ordna om dem i lagret).

## Kontrollera, bygg sedan

{{ui:Kontrollera}} listar vad som är fel, med ord, innan något ändras:

- en linje utan **höjd** eller med färre än två punkter;
- en **dubblett** (samma form två gånger, även ritad åt andra hållet);
- två linjer som **korsar** varandra, på olika höjder eller på samma höjd (en linje som korsar sig själv också), med platsen;
- en höjd som **inte ligger på ekvidistansen** (ett skrivfel som 105.5 på en 1 m-karta).

Bocka i {{ui:Utelämna linjer som korsar en annan}} för att släppa den linje som korsar flest andra (sedan nästa, tills ingen korsar). En lös linje som skär igenom alla höjdkurvor är den som tas bort, inte höjdkurvorna. **Förenkla linjer inom** tunnar ut hörn som ligger närmare en rak sträcka än det avståndet.

{{ui:Bygg marken}} lägger till linjerna i den befintliga marken som brytlinjer (ett ångra-steg), så att ytan går exakt genom varje höjdkurva. Med {{ui:Åtgärda platta trianglar på ryggar, dalar och kullar}} ibockad och en ekvidistans angiven lägger CivilCraft även till en punkt inuti varje platt triangel (en triangel vars hörn alla ligger på samma höjdkurva), på den höjd som lutningen intill den fortsätter till, aldrig mer än en halv ekvidistans från höjdkurvan. Utan det blir ryggkrönen, dalbottnarna och kullarna platta plattor. På en testkulle minskade felet mot den verkliga ytan med en fjärdedel; på en rygg med 40 %.

## En karta utan koordinater

För en höjdkurvekarta som ritats från en bild eller en PDF, öppna **Skala och placera lagren med två kända punkter**. Ange två punkter på kartan och var de verkligen ligger; de markerade lagren skalas, vrids och flyttas för att passa (ett ångra-steg; höjderna ändras inte). Samma två punkter ger skalan (visas i meddelandet) och rotationen.

Ytan är så bra som kartan: mellan två höjdkurvor är den ett plan, så den verkliga marken mellan dem är inte känd. Kontrollera resultatet mot punkthöjder innan du förlitar dig på det.
