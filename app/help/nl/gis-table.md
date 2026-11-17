---
title: Met de attributentabel van een laag werken
summary: Elk object van een GIS-laag als tabel bekijken, sorteren en filteren, rijen en objecten samen selecteren, waarden corrigeren, velden toevoegen, nieuwe waarden berekenen en de tabel als CSV opslaan.
keywords: attributentabel, tabel, velden, kolommen, rijen, sorteren, filteren, expressie, selecteren, bewerken, veldrekenmachine, berekenen, veld toevoegen, veld hernoemen, veld verwijderen, csv, exporteren, gis, shapefile, geopackage, symboliek
from: fd9d6c11
---

Open de tabel van een laag via het **drie puntjes**-menu in de lijst GIS-lagen ({{ui:Attributentabel…}}), via Oppervlak › Meer › {{ui:Attributentabel}}, of door `ATTRIBUTES`, `ATTTABLE` of `TABLE` te typen. De tabel opent naast het plan en blijft open terwijl u werkt. Alleen de zichtbare rijen worden getekend, dus een laag met duizenden objecten opent en scrolt snel.

## Sorteren, filteren en selecteren

- **Sorteren:** klik op een kolomtitel. Een tweede klik keert de volgorde om, een derde zet de volgorde van het bestand terug. Lege waarden blijven altijd onderaan. Sorteren verandert alleen wat u ziet, nooit de laag.
- **Filteren:** typ in het filterveld. Een expressie zoals `AREA > 500 and USE = 'Res'` houdt de rijen waar ze waar is (dezelfde woorden als het tabblad Selecteren van [GIS-lagen analyseren](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Alles wat geen expressie is, zoals `oak maple`, zoekt die woorden in elke kolom.
- **Rijen selecteren:** klik op een rij. Ctrl+klik voegt er één toe of verwijdert hem, Shift+klik selecteert een reeks, en {{ui:Getoonde rijen selecteren}} neemt elke rij die het filter doorstaat. De geselecteerde objecten worden op het plan getekend, en een klik op een object op het plan selecteert hier zijn rij.
- Met geselecteerde rijen kunt u {{ui:Zoomen}} naar ze, een **laag maken uit de selectie**, en het totale oppervlak of de lengte in de statusregel lezen.

## Waarden corrigeren

Dubbelklik op een cel (of ga er met de pijltjestoetsen naartoe en druk op Enter), typ de nieuwe waarde en druk op Enter. Esc laat hem zoals hij was. Een waarde moet in de kolom passen: getallen als getallen, datums als `JJJJ-MM-DD`, ja/nee als ja, nee, true of false. Een waarde die niet past, wordt geweigerd met een zin, en er verandert niets. Een leeg vak maakt de waarde leeg. Elke bewerking is één stap ongedaan te maken: {{ui:Ongedaan maken}} en {{ui:Opnieuw}} staan onderaan de tabel, en Ctrl+Z werkt op het plan.

## Velden

Onder **Velden** kunt u een veld toevoegen (tekst, getal, datum of ja/nee), er één hernoemen, of er één verwijderen. Een nieuw veld begint leeg. Een hernoeming werkt door: het labelveld en de [stijl op basis van een attribuut](topic:gis-symbology) van de laag gaan naar de nieuwe naam, en het verwijderen van een veld haalt het label en de stijl die het gebruikten weg. Elk is één stap ongedaan te maken, waarmee alles terugkomt.

## Veldrekenmachine

Schrijft een waarde in elke rij (of alleen in de geselecteerde rijen), op basis van de andere velden van de rij, de geometrie en een paar functies. Kies een bestaand veld of **Een nieuw veld…** en geef het een naam en een type. Niets wordt als code uitgevoerd: de expressie wordt gelezen door een kleine parser met een vaste lijst functies.

| Groep | Woorden |
|---|---|
| Getallen | `+ - * /`, haakjes, `abs round(x, digits) floor ceil sqrt pow min max` |
| Tekst | `upper lower trim len substr(text, from, count) left right replace concat` (tekst gaat tussen 'enkele aanhalingstekens'; een veldnaam met spaties gaat tussen "dubbele aanhalingstekens" of [vierkante haken]) |
| Kiezen | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datums | `year month day` van een waarde `JJJJ-MM-DD` |
| Geometrie | `$area $perimeter $length $x $y $vertices`, in de eenheden van het project |

Een resultaat dat niet in het type van het veld past (tekst in een getalveld), wordt leeg gelaten en in het bericht geteld. Delen door nul geeft een lege waarde. Bijvoorbeeld `round($area / 43560, 2)` schrijft acres uit vierkante voet.

## Exporteren

{{ui:CSV exporteren}} slaat de rijen op die u ziet (na het filter en de sortering) als UTF-8 CSV-bestand, met de veldnamen op de eerste regel. Een tekst die begint met `=`, `+`, `-` of `@` krijgt een voorloopse apostrof, zodat een spreadsheet die niet als formule uitvoert. Om de laag zelf op te slaan, gebruikt u [As-built-gegevens voor GIS exporteren](topic:gis-export).

## Beperkingen

De tabel toont de laag in één sorteervolgorde en met één filter tegelijk. Rijen kunnen hier niet worden toegevoegd of verwijderd (maak in plaats daarvan een nieuwe laag uit een selectie), geometrie wordt niet bewerkt, en het type van een veld kan niet worden gewijzigd nadat het is gemaakt.
