---
title: Adres na terrein
summary: Verander 'n adres in wat 'n terrein moet weet: die erf, geboue rondom, sonering, grond en vloedsone, uit oopdata wat jy per knoppie vra of as lêers bring, en gee dit as voorstelle aan BimCraft.
keywords: adres, geokodering, terrein, erf, geboue, sonering, grond, vloed, oopdata, openstreetmap, fema, ssurgo, usgs, konteks, ccsite, bimcraft
from: 125d848a
---

## Wat dit doen

Oppervlak › Meer › Adres na terrein gee antwoord, vir 'n punt: in watter erf dit is, die geboue rondom, die sonering, die grond en die vloedsone. Die data is oop: lêers wat jy byvoeg (GeoJSON, shapefile, KML, GeoPackage) en, wanneer jy die byvoegings aanskakel, knoppies wat elk een oop diens vra.

## Hoe om dit te gebruik

1. Tik 'n adres en druk die adressoekknoppie (die byvoeging "Adressoek"), of tik die breedte- en lengtegraad.
2. Voeg lae by: lêers met "Voeg lêers by", of die ander bronknoppies (vloedsone, geboue, grond, grondhoogte, graafskapserwe). 'n Diens word net gevra wanneer jy die knoppie daarvan druk; niks word by die begin gehaal nie.
3. Druk die loopknop vir die antwoord in woorde, met 'n CSV.
4. "Stoor die terrein as 'n lêer" of "Stuur na BimCraft as voorstelle" gee die omtrekke aan BimCraft of ModelCraft; hulle lys dit en voeg net by wat jy aankruis.

## Wat om te weet

- Die adressoek gaan via getcadcraft.com, wat vir jou OpenStreetMap se Nominatim vra (hoogstens een versoek per sekonde; antwoorde word 90 dae bewaar sodat dieselfde adres nooit twee keer gevra word nie; slegs 'n hash van die adres word gestoor, nooit wie gevra het nie). Die ander knoppies gaan direk van jou blaaier na hulle diens.
- Elke bron het sy eie lisensie (OpenStreetMap is ODbL: hou die erkenningsreël).
- Die lae is so goed as die oopdata in jou plek. Kontroleer wat saak maak teen 'n opmeting.
