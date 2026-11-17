---
title: Analysera GIS-lager
summary: Buffert, överlagring (skärning, union, radera, lös upp), rumslig koppling, markering efter attribut och mätning av GIS-lagren i ett projekt, vart och ett som ett nytt lager som du kan ångra.
keywords: gis, analys, buffert, överlagring, skärning, union, radera, klipp, lös upp, rumslig koppling, koppling, markera efter attribut, fråga, where, uttryck, statistik, area, längd, omkrets, mät, fastigheter, servitut, byggnadsgräns, shapefile, geopackage, attributtabell
from: a6b2d3f9
---

När ett projekt har GIS-lager (se [Importera GIS-data](topic:gis-import)) öppnar knappen **Analysera** i gruppen GIS (skriven `GISANALYSIS`, `ANALYZE` eller `BUFFER`) en panel med fem flikar. Den förblir öppen bredvid planen, så det du markerar ritas på planen medan du arbetar.

Varje verktyg som skapar något **lägger till ett nytt lager** och lämnar de lager det läste exakt som de var. Varje är ett steg i ångra: {{ui:Undo}} i panelen (eller Ctrl+Z) tar bort det nya lagret. Exportera resultatet som vilket lager som helst med [Exportera as-built-data för GIS](topic:gis-export) som shapefile, GeoJSON eller GeoPackage.

Hela tabellen för ett lager, med sortering, redigering och en fältkalkylator, finns i [Arbeta med ett lagers attributtabell](topic:gis-table). Färgsättning efter ett fält finns i [Formatera ett lager efter ett attribut](topic:gis-symbology).

Allt görs i planen, i projektets enheter (fot eller meter). Ett projekt ligger alltid i ett projicerat eller lokalt system, så ett avstånd på 50 betyder 50 fot eller 50 meter, aldrig grader. Höjder (z) behålls inte i resultaten.

## Buffert

Ritar en zon med ett angivet avstånd runt varje objekt, som ett nytt polygonlager. Punkter blir cirklar, linjer blir korridorer med rundade ändar, polygoner växer. Ett **negativt** avstånd krymper polygoner (en kvadrat på 100 gånger 100 krympt med 5 blir 90 gånger 90; krympt med 60 finns inget kvar, och panelen säger det). Ta avståndet från ett talfält för att ge varje objekt sitt eget, eller markera **Slå samman alla buffertar till en form** för att lösa upp dem.

De rundade delarna är räta bitar som ritas innanför den verkliga kurvan, så en buffert är en hårsmån mindre än den exakta cirkeln: ungefär 0.6 % i area vid normalinställningen, 0.16 % vid Fin. Använd Fin för allt du tänker mäta.

## Överlagring

| Verktyg | Vad du får |
|---|---|
| Skärning | De delar där indatalagret möter överlagringspolygonerna, var och en med fälten från båda. Linjer och punkter klipps till polygonerna. |
| Union | Båda polygonlagren klipps längs varandras kanter: delade delar bär fälten från båda lagren, övriga bär ett lagers fält (det andra lagrets fält är tomma). |
| Radera | Indatapolygonerna med överlagringspolygonerna borttagna. Fälten stannar hos indata. Ett objekt som raderas helt utelämnas (panelen räknar dem). |
| Lös upp | Slår samman polygoner som tangerar eller överlappar, alla eller en form för varje värde i ett fält. Lägger till `COUNT` och `AREA`. |

Ett fältnamn som båda lagren har behålls för det första lagret, och det andra lagrets skrivs med `_2`. Objekt inuti ett och samma lager bör inte överlappa varandra: där de gör det räknar en Union överlappet i båda.

## Koppling

En rumslig koppling kopierar attribut från ett **källlager** till varje **målobjekt** som möter det, och ger ett nytt lager med målobjektens former. Välj när de möts: när de tangerar eller överlappar, när målet ligger inuti en källpolygon, när målet innehåller källobjektet, närmaste källobjekt (med en valfri gräns) eller vilket källobjekt som helst inom ett avstånd.

När flera källobjekt matchar tar du det första objektets attribut (det närmaste, för närmaste- och avståndskopplingar; `DISTANCE` läggs till), eller **räknar dem och summerar deras talfält**: `COUNT`, och `SUM_`, `MEAN_`, `MIN_`, `MAX_` för varje talfält. Avmarkera **Behåll målobjekt som inte fick någon matchning** för att utelämna dem. Kopplade fält är tomma där ingenting matchade, och panelen räknar de omatchade.

## Markera

Skriv en fråga om attributen eller formen, tryck på **Markera**, så ritas objekten på planen med sitt antal, en tabell och den totala arean, längden eller antalet. Gör sedan dem till ett eget lager, zooma till dem eller rensa markeringen.

| Du kan skriva | Exempel |
|---|---|
| Ett fält med namn; använd ”citattecken” eller [hakparenteser] om namnet har mellanslag | `VALUE`, `"Lot Number"` |
| Tal, 'text', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (text ignorerar versaler; i `like` är `%` valfri följd och `_` en bokstav) | `Notes contains 'corner'` |
| `is null`, `is not null` (ett tomt värde räknas som null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` och parenteser | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Formvärden `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

En fråga som är ofullständig eller nämner ett fält som lagret inte har avvisas med en mening som säger var.

## Mät

Visar lagrets totala area och omkrets, längd eller antal, och **lägger till fält** till det: `AREA` och `PERIMETER` för polygoner, `LENGTH` för linjer (längden på planen), `X` och `Y` för punkter. Ett fält som redan finns skrivs aldrig över: det nya kallas `AREA_2`. Detta är ett steg i ångra. **Statistik** ger antal, summa, medelvärde, minsta och största värde för ett talfält, valfritt för varje värde i ett annat fält.

:::note
Kontrollerna bakom dessa verktyg räknas för hand i testet (`node bin/test-civilcraft-gisanalysis.mjs`): till exempel ger parceller på 100 gånger 100 under en zon på 100 gånger 80 en skärning på 3,000 plus 3,000, och en 100 lång linje buffrad med 10 blir 2,000 plus en cirkel.
:::
