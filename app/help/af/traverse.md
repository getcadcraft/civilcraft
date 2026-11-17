---
title: Voer 'n deurloop in en vereffen dit volgens die kompasreël
summary: Tik veldhoeke of rigtings en afstande in, kontroleer die hoek- en lineêre sluiting en die presisie, vereffen volgens die kompasreël, en voeg die stasies as opmetingspunte of die lus as 'n erf by.
keywords: deurloop, geslote deurloop, lus, regshoeke, terugkyk, rigtings, afstande, sluiting, sluitfout, presisie, kompasreël, bowditch, vereffening, opmeting
from: 56ce5a8c
---

'n Deurloop is 'n reeks gemete lyne: by elke stasie 'n hoek (of 'n rigting) en 'n afstand na die volgende. Klik **Voer 'n deurloop in** onder **Deurloop** in die regterpaneel wanneer niks gekies is nie.

## Waar dit begin en eindig

1. **Begin by opmetingspunt**: die nommer daarvan. Of tik 'n noord- en oos-koördinaat in.
2. **Lyne as**: **Regshoeke en afstande**, of **Rigtings en afstande**.
3. Met hoeke, sê waar hulle begin: 'n **Terugkyk-opmetingspunt**, of **sy asimut** (vanaf die eerste stasie na die terugkyk, kloksgewys vanaf noord).
4. **Eindig**: **terug by die begin (’n lus)**, of **by opmetingspunt** en sy nommer (’n oop deurloop tussen bekende punte).

## Tik die lyne in

Een lyn per reël, dan die afstand, dan 'n naam vir die stasie wat dit bereik, as jy wil:

- Regshoeke, kloksgewys gedraai by die stasie waar die lyn vertrek, vanaf die stasie agter na die volgende: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` en `270.0028` werk ook.
- Rigtings: `N 45°30'15" E 125.50 B`, of 'n asimut as een woord: `AZ 45-30-15 125.50 B`.
- By 'n lus met hoeke, eindig met `close` en weer die hoek by die begin, gedraai vanaf die laaste stasie na die tweede: `close 270°00'05"`. Dit is wat die hoeke nagaan.

Reëls wat nie gelees kan word nie, word met hul reëlnommers gelys. "feet", kommas en `#`-kommentaarreëls is in orde.

## Lees die sluiting

Terwyl jy tik, wys die dialoog:

- **Hoeksluitfout**: hoe ver die hoeke van sluiting af is, en die aandeel wat elke hoek neem. Sonder 'n sluithoek word die hoeke nie nagegaan nie, en enige fout daarin verskyn in die lineêre sluitfout.
- **Lineêre sluitfout**: hoe ver die deurloop eindig van waar dit moes eindig, en in watter rigting.
- **Presisie**: die lengte van die deurloop gedeel deur die lineêre sluitfout: 1 : 10,000 beteken 1 ft in 10,000 ft.
- Die stasies na die vereffening, en hoe ver elkeen beweeg het.

## Die vereffening

Eers word die hoeksluitfout eweredig oor die hoeke versprei. Dan word die lineêre sluitfout oor die lyne versprei volgens die kompasreël (Bowditch): elke stasie beweeg teen die sluitfout in verhouding tot die lengte wat afgelê is om daar te kom, sodat die deurloop presies eindig waar dit moet.

:::note
Die kompasreël is 'n standaardvereffening, nie 'n kleinste-kwadrate-vereffening nie, en dit weeg nie hoeke teen afstande nie. Of die presisie goed genoeg is, is aan jou eie standaarde en jou regsgebied se besluit.
:::

## Gebruik die resultaat

- **Voeg as opmetingspunte by**: die vereffende stasies word opmetingspunte met die name wat jy gegee het (anders die volgende vrye nommers), beskrywing `TRAV`, geen hoogte nie. Die laaste stasie van 'n lus is sy begin, dus word dit nie twee keer bygevoeg nie. Een stap: {{key:Mod+Z}} doen dit ongedaan.
- **Voeg as 'n erf by** (lusse): die vereffende stasies word 'n [erf](topic:parcels), met sy etikette en regsbeskrywing.
- **Verslag (CSV)**: die sluitingsreëls, dan elke stasie se rigting, afstand, onvereffende en vereffende koördinate en korreksies.
