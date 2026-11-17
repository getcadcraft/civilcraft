---
title: Jou kraglynbiblioteek
summary: Maak jou eie geleiers, ondergrondse kabels, steune, toerusting en slootipes, in kategorieë wat jy benoem, en deel dit as lêers.
keywords: biblioteek, geleier, kabel, paal, steun, dwarsarm, isolator, toebehoor, stut, tou, transformator, kas, verbinding, sloot, kategorie, csv, invoer, uitvoer
from: 88733744
---

Die **Biblioteek**-afdeling van die Kraglynewerkruimte bevat elke item wat 'n lyn of kabel kan gebruik. Niks daarin is aan 'n land of 'n vervaardiger gebind nie: jy maak die items waarmee jy werk.

## Drie soorte items

| Soort | Waar dit woon | Kan jy dit verander? |
|---|---|---|
| **Voorbeelde** | Saam met CivilCraft gelewer, met generiese getalle wat ons uit materiaaleienskappe bereken het | Nee: {{ui:Kopieer na my biblioteek}} eers |
| **In projek** | Het saam met die projeklêer gekom wat jy oopgemaak het | Nee: {{ui:Kopieer na my biblioteek}} eers |
| **Myne** | Jou eie items, in hierdie blaaier bewaar | Ja, en veranderings word dadelik gestoor |

Elke projek hou 'n afskrif van elke item wat dit gebruik, sodat 'n projek op enige rekenaar oopgaan met sy eie geleiers en pale.

:::warning
Die voorbeeld-items is voorbeelde: kontroleer elke getal teen jou verskaffer se data. Die ondergrondse kabels het opsetlik geen stroomgraderig nie, omdat dit afhang van hoe die kabel gelê is.
:::

## Maak 'n item

1. In **Biblioteek**, kies die **Soort** (bogrondse geleiers, ondergrondse kabels, steune, toerusting of slootipes).
2. Klik {{ui:Nuwe item}}, of kies 'n voorbeeld en klik {{ui:Kopieer na my biblioteek}} of {{ui:Dupliseer}}.
3. Vul sy velde in. Velde met `*` is die wat die kontroles nodig het; 'n item wat een mis, word met `!` gemerk en onder **Kontroles** gelys wanneer 'n lyn dit gebruik.
4. Gee dit 'n **Kategorie**, met `/` tussen vlakke: `Bogronds/LS/Gebundel`, `Steune/Beton/12 m`. Die boom volg jou kategorieë.

Wat elke soort nodig het:

| Soort | Nodig vir die kontroles |
|---|---|
| Bogrondse geleier | deursnit, deursnee, massa per meter, breekkrag, elastisiteitsmodulus, termiese uitsetting |
| Ondergrondse kabel | are, deursnit, spanning, deursnee, weerstand, stroomgraderig |
| Steun | totale lengte, nominale lading (geneem by 'n punt onder die bokant), diepte in die grond |
| Toerusting | sy tipe; 'n gegradeerde lading vir dwarsarms, toebehore en stutte; fasespasiëring en verlies vir dwarsarms; lengte vir isolators; die hoek vir stutte |
| Slootipe | diepte, breedte, dekking oor die kabels |

## Deel dit

- {{ui:Stoor my biblioteek}} stoor elke item van jou as een `.cclines.json`-lêer; {{ui:Maak 'n biblioteek oop…}} lees een terug (items met dieselfde sleutel word vervang).
- {{ui:Stoor as CSV}} stoor die soort waarna jy kyk as 'n sigblad; {{ui:Maak 'n biblioteek oop…}} lees 'n CSV van daardie soort terug. Kolomme mag in enige volgorde kom; 'n kommapunt-geskeide lêer mag 'n desimale komma gebruik.
