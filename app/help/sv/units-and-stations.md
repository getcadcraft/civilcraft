---
title: Enheter, stationer och talformat
summary: Fot- och meterprojekt, hur stationer, lutningar, sidoslänter, riktningsvinklar, areor, volymer och ledningsdimensioner skrivs och anges, och vad ändring av enheter gör.
keywords: ange en längd, aritmetik, räknare, summa, bråk, fot och tum, 4+7/16, enheter, fot, US survey feet, meter, metrisk, imperial, stationsformat, stationering, lutning, procent, sidoslänt, h:v, riktningsvinkel, kubikyard, diameter
from: 0b9b5b6b
---

## Projektets enheter

Ett projekt är i **US-fot** eller **meter** (**Enheter** i vänster panel). Varje koordinat, höjd, längd och station i projektet är i den enheten.

:::warning
Att ändra **Enheter** ändrar etiketterna, stationsformatet, standardvärdena och hur filer skrivs. Det omvandlar **inte** några tal. En plats som mätts i fot och som växlas till meter behåller samma tal, nu lästa som meter. Statusfältet säger "Enheterna är nu meter. Koordinaterna konverterades inte." Ställ in enheterna så att de stämmer med dina data innan du projekterar.
:::

Det här beror på enheterna:

| | US-fot | Meter |
|---|---|---|
| Stationsformat | `12+34.56` (stationer på 100 ft) | `1+234.567` (stationer på 1000 m) |
| Erbjudna höjdkurvintervall | 0.25 till 20 ft | 0.1 till 10 m |
| Area | sq ft | sq m |
| Volym | cu yd | cu m |
| Lednings- och konstruktionsdiameter | tum | millimeter |
| Standardradie för kurvor | 100 ft | 30 m |
| Stationeringsstreck i planen | var 50 ft, etiketter var 100 ft | var 20 m, etiketter var 100 m |
| Plottskalor | 1" = 5' till 1" = 1000' | 1:50 till 1:10000 |
| LandXML-längdenhet | USSurveyFoot | meter |

Ett nytt projekt startar i fot, eller i meter när längdenheten som är stjärnmarkerad i {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Enheter}} är en metrisk. Listan **Enheter** visar de enheter som är påslagna där, och alltid projektets egen. Med en area- eller volymenhet stjärnmarkerad där (acres, hektar, acre-feet …) redovisas areor och volymer i den i stället för kolumnen ovan. Se [Enheter, skrivna värden och enhetslistorna](common:unit-lists).

När du öppnar LandXML tar projektet filens enheter. En fil i internationella fot öppnas som ett fotprojekt; talen ändras inte.

## Skriva längder och summor

Varje ruta som tar en längd eller en höjd läser mer än ett vanligt tal: tryck på {{key:Enter}} och rutan visar resultatet i projektets enheter.

| Du skriver | I ett fotprojekt | I ett metriskt projekt |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | samma längder i meter |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | i fot | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, och de andra i US survey feet | samma längder i meter |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | summan, i fot | summan, i meter |

Alla längdbeteckningar i den gemensamma enhetstabellen fungerar, med sin exakta storlek: ett projekts fot är US survey feet, så `10 US ft` är 10 och `3 ch` (kedjan i internationella fot) är 197.9996. Använd `+ - * /` och parenteser, samt `abs`, `round`, `ceil` och `floor`. Ett bindestreck skrivet i en längd är en del av den (`24'-6"`, `6-1/2`); med mellanslag runt det subtraherar det (`24' - 6"` = 23.5 ft). Ett vanligt tal multiplicerar eller dividerar en längd, och är en längd i projektets enheter när det adderas till en. Om CivilCraft inte kan läsa det du skrev markeras rutan och statusfältet säger var.

Stationer är inga summor: `10+00` i en stationsruta är station 10+00. Lutningar i procent, punktnummer och beskrivningar läses som de är.

## Stationer

En station är ett avstånd längs en linjeföring, skrivet med ett plustecken:

- Fot: delen före plustecknet är hundratals fot. `12+34.56` är 1,234.56 ft.
- Meter: delen före plustecknet är tusentals meter. `1+234.567` är 1,234.567 m.
- Negativa stationer behåller tecknet framför: `-0+50.00`.

Var du än skriver en station (**Startstation**, en PVI:s **Station**) kan du skriva den med plustecknet (`12+34.56`) eller som ett vanligt tal (`1234.56`). Mellanslag ignoreras.

## Lutningar och slänter

- **Lutningar** (profiler, ledningar, körfälts- och vägkantslutningar) anges i procent: `+1.25%` stiger i stationsriktningen, `-0.50%` faller.
- **Sidoslänter** (plattans schakt och fyllning, korridorens schakt och fyllning) anges som horisontellt mot vertikalt: `3` betyder 3 : 1, tre åt sidan för en upp eller ner.
- **K** för en vertikalkurva är dess längd delat med förändringen i lutning i procent.

## Riktningsvinklar och vinklar

Riktningsvinklar är kvadrantvinklar i grader, minuter och sekunder: `N 63°12'05" E`. Kurvornas avböjningar (Δ) använder samma grader, minuter och sekunder, med "vänster" eller "höger".

## Förskjutningar

Förskjutningar från en linjeföring är vinkelräta avstånd, märkta **L** (vänster) eller **R** (höger) när man tittar i stationsriktningen.

## Talvisning

- Koordinater och höjder visar 2 decimaler i paneler och statusfältet (3 för en markerad mätpunkt).
- Areor och volymer grupperas i tusental: `128,250 sq ft`, `454.9 cu yd`.
- Koordinater grupperas aldrig, så de kan kopieras som de är.

## Koordinater

CivilCraft arbetar i ett plant plan: östvärde åt höger, nordvärde uppåt. Projekteringen sker alltid i projicerade koordinater (state plane, UTM eller ett lokalt rutnät). Du kan tala om för CivilCraft vilket koordinatsystem de ligger i, och om de är rutnäts-, mark- eller lokala koordinater; då visar det latitud och longitud och placerar GIS-filer och kartlager, men det ändrar aldrig enheter eller flyttar dina koordinater på egen hand. Se [Ange projektets koordinatsystem](topic:coordinate-systems) och [Mark- och lokala koordinater](topic:ground-and-local-coordinates). Stora state plane-värden (miljontals fot) är bra; CivilCraft arbetar internt relativt platsen för att behålla precisionen.
