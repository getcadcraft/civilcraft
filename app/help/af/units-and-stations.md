---
title: Eenhede, stasies en getalformate
summary: Voet- en meterprojekte, hoe stasies, gradiënte, sywaartse hellings, rigtings, oppervlaktes, volumes en pypgroottes geskryf en getik word, en wat die verandering van eenhede doen.
keywords: tik 'n lengte, rekenkunde, sakrekenaar, som, breuk, voet en duim, 4+7/16, eenhede, voet, US-landmeetvoet, meter, metriese, imperiaal, stasieformaat, stasionering, gradiënt, persent, sywaartse helling, h:v, rigting, kubieke yard, deursnee
from: 0b9b5b6b
---

## Projekeenhede

'n Projek is in **US-voet** of **meter** (**Eenhede** in die linkerpaneel). Elke koördinaat, hoogte, lengte en stasie in die projek is in daardie eenheid.

:::warning
Die verandering van **Eenhede** verander die etikette, die stasieformaat, die verstekwaardes en hoe lêers geskryf word. Dit skakel **nie** enige getal om nie. 'n Terrein wat in voet opgemeet is en na meter geskakel word, hou dieselfde getalle, wat nou as meter gelees word. Die statusbalk sê "Eenhede is nou meter. Koördinate is nie omgeskakel nie." Stel die eenhede in om by jou data te pas voordat jy ontwerp.
:::

Wat van die eenhede afhang:

| | US-voet | Meter |
|---|---|---|
| Stasieformaat | `12+34.56` (100 ft-stasies) | `1+234.567` (1000 m-stasies) |
| Kontoerintervalle aangebied | 0.25 tot 20 ft | 0.1 tot 10 m |
| Oppervlakte | sq ft | sq m |
| Volume | cu yd | cu m |
| Pyp- en struktuurdeursnee | duim | millimeter |
| Verstekkurwe-radius | 100 ft | 30 m |
| Stasioneringmerkers op die plan | elke 50 ft, etikette elke 100 ft | elke 20 m, etikette elke 100 m |
| Uitdrukskale | 1" = 5' tot 1" = 1000' | 1:50 tot 1:10000 |
| LandXML lineêre eenheid | USSurveyFoot | meter |

'n Nuwe projek begin in voet, of in meter as die lengte-eenheid wat in {{ui:Instellings}} › {{ui:Algemeen}} › {{ui:Eenhede}} met 'n ster gemerk is 'n metriese een is. Die **Eenhede**-lys wys die eenhede wat daar aangeskakel is, en altyd die projek s'n. Met 'n oppervlakte- of volume-eenheid met 'n ster daar (acres, hektaar, acre-feet …), word oppervlaktes en volumes daarin gerapporteer in plaas van die kolom hierbo. Sien [Eenhede, getikte waardes en die eenheidslyste](common:unit-lists).

Wanneer jy LandXML oopmaak, neem die projek die lêer se eenhede oor. 'n Lêer in internasionale voet maak as 'n voetprojek oop; die getalle word nie verander nie.

## Lengtes en somme tik

Enige kassie wat 'n lengte of 'n hoogte neem, lees meer as 'n gewone getal: druk {{key:Enter}} en die kassie wys die resultaat in die projek se eenhede.

| Jy tik | In 'n voetprojek | In 'n meterprojek |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | dieselfde lengtes in meter |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | in voet | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, en die ander in US-landmeetvoet | dieselfde lengtes in meter |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | die som, in voet | die som, in meter |

Enige lengte-merk uit die gedeelde eenheidstabel werk, met sy presiese grootte: 'n projek se voet is US-landmeetvoet, dus is `10 US ft` 10 en `3 ch` (die internasionale-voetketting) 197.9996. Gebruik `+ - * /` en hakies, en `abs`, `round`, `ceil` en `floor`. 'n Koppelteken wat in 'n lengte geskryf word, is deel daarvan (`24'-6"`, `6-1/2`); met spasies daaromheen trek dit af (`24' - 6"` = 23.5 ft). 'n Gewone getal vermenigvuldig of deel 'n lengte, en is 'n lengte in die projek se eenhede wanneer dit by een getel word. As CivilCraft nie kan lees wat jy getik het nie, word die kassie gemerk en die statusbalk sê waar.

Stasies is nie somme nie: `10+00` in 'n stasiekassie is stasie 10+00. Gradiënte in persent, puntnommers en beskrywings word gelees soos hulle is.

## Stasies

'n Stasie is 'n afstand langs 'n belyning, geskryf met 'n plusteken:

- Voet: die deel voor die plus is honderde voet. `12+34.56` is 1,234.56 ft.
- Meter: die deel voor die plus is duisende meter. `1+234.567` is 1,234.567 m.
- Negatiewe stasies hou die teken vooraan: `-0+50.00`.

Waar jy 'n stasie intik (**Beginstasie**, 'n PVI se **Stasie**), kan jy dit met die plus (`12+34.56`) of as 'n gewone getal (`1234.56`) intik. Spasies word geïgnoreer.

## Gradiënte en hellings

- **Gradiënte** (lengteprofiele, pype, baan- en skouerhellings) is in persent: `+1.25%` styg stasie-op, `-0.50%` daal.
- **Sywaartse hellings** (platform-afgrawing en -ophoging, korridor-afgrawing en -ophoging) is horisontaal tot vertikaal: `3` beteken 3 : 1, drie horisontaal vir een op of af.
- **K** vir 'n vertikale kurwe is sy lengte gedeel deur die verandering in gradiënt in persent.

## Rigtings en hoeke

Rigtings is kwadrantrigtings in grade, minute en sekondes: `N 63°12'05" E`. Kurwe-afwykings (Δ) gebruik dieselfde grade, minute en sekondes, met "links" of "regs".

## Afsettings

Afsettings vanaf 'n belyning is afstande reghoekig daarop, gemerk **L** (links) of **R** (regs) wat stasie-op kyk.

## Getalvertoning

- Koördinate en hoogtes wys 2 desimale in panele en die statusbalk (3 vir 'n gekose opmetingspunt).
- Oppervlaktes en volumes is in duisendtalle gegroepeer: `128,250 sq ft`, `454.9 cu yd`.
- Koördinate word nooit gegroepeer nie, sodat hulle gekopieer kan word soos hulle is.

## Koördinate

CivilCraft werk in 'n plat vlak: oos na regs, noord op. Ontwerpwerk gebeur altyd in geprojekteerde koördinate (staatsvlak, UTM of 'n plaaslike rooster). Jy kan CivilCraft sê watter koördinaatstelsel hulle in is, en of hulle rooster-, grond- of plaaslike koördinate is; dit wys dan breedte- en lengtegrade en plaas GIS-lêers en kaartlae, maar dit verander nooit eenhede of skuif jou koördinate uit eie beweging nie. Sien [Stel die projek se koördinaatstelsel](topic:coordinate-systems) en [Grond- en plaaslike koördinate](topic:ground-and-local-coordinates). Groot staatsvlakwaardes (miljoene voet) is in orde; CivilCraft werk intern relatief tot die terrein om presisie te behou.
