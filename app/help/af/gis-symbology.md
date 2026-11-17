---
title: Styl 'n laag volgens 'n eienskap
summary: Kleur die kenmerke van 'n GIS-laag volgens die waardes van 'n veld (een kleur per waarde, of volgens getalreekse), maak punte groter volgens 'n getal, tint poligone en wys 'n verklaring op die plan.
keywords: simbologie, styl, kleur, colour, gekategoriseer, gegradeer, unieke waardes, gelyke interval, kwantiel, natuurlike breuke, jenks, reeks, kleurblind, verklaring, grootte, punte, koroplet, klasse, gis
from: a3a69add
---

Maak 'n laag se **drie kolletjies**-kieslys in die GIS-lae-lys oop en kies {{ui:Styl volgens eienskap…}}.

## Drie style

- **Enkel simbool:** die laagkleur, soos voorheen.
- **Gekategoriseer:** een kleur per duidelike waarde van enige veld. Tot agt waardes kry die agt Okabe-Ito-kleure (gekies om uitmekaar te bly vir die algemene soorte kleurblindheid); met meer waardes kry die sewe algemeenste elk 'n kleur, en die res deel 'n grys **Ander**-klas. Kenmerke sonder 'n waarde is grys.
- **Gegradeer:** 'n getalveld word in 2 tot 9 reekse gesny, elk met 'n kleur uit 'n reeks. 'n Waarde op 'n grens gaan in die laer reeks.

## Hoe die reekse gesny word

| Metode | Breuke |
|---|---|
| Gelyke interval | Die reeks van die kleinste tot die grootste waarde, in gelyke breedtes verdeel. Waardes 0 tot 30 in drie reekse: 0, 10, 20, 30. |
| Kwantiel | Ongeveer dieselfde getal kenmerke in elke reeks. Die breuke word uit die gesorteerde waardes gelees met die gewone reguitlyn-interpolasie: vir 1 tot 10 in twee reekse is die breuk 5.5. |
| Natuurlike breuke (Jenks) | Die snitte wat die minste verspreiding binne elke reeks laat, sodat groepe soortgelyke waardes saam bly. By meer as 1,500 waardes werk dit op 1,500 gelyk verspreide daarvan, en sê so. |

## Kleure

Viridis en Cividis loop van donker na lig met 'n gelyke verandering in ligtheid, so die volgorde van die reekse kan gelees word, selfs in grys of met kleurblindheid. Blues is lig na donker. Rooi na blou is 'n tweerigting-reeks vir waardes rondom 'n middelpunt. **Keer die kleure om** draai enige van hulle om. Die dialoog lys die reekse en die getal kenmerke in elk, voordat jy dit toepas.

## Grootte, vulling en verklaring

- **Puntgrootte volgens** 'n getalveld maak elke punt se vierkant groter hoe groter die waarde, tussen die twee groottes wat jy gee (die helfte van die sy, in millimeter op papier).
- **Tint die binnekant van poligone** vul elke poligoon in sy klaskleur (gate bly leeg). Die tint is op die skerm; plotte en DXF/DWG wys die gekleurde buitelyne.
- **Wys 'n verklaring op die plan** teken die klasse, hul tellings en die grootte-reeks in die onderste linkerhoek van die plan. Die verklaring is op die skerm; dit is nie in 'n plot nie.
- Om kenmerke met 'n veld te etiketteer, gebruik **Etiketteer met** in dieselfde kieslys.

Die styl word in die projeklêer gestoor. 'n Bou wat nie van style weet nie, open die lêer met die laagkleur. Plotte, DXF en DWG dra die klasse as aparte lae wat na die laag en die klas genoem word, in die naaste van die nege basiese CAD-kleure. 'n Laag van meer as 200,000 kenmerke word in een kleur geteken.
