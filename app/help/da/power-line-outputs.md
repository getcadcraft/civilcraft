---
title: Elledningstabeller, mængder, ark og GIS
summary: Optrækningstabeller og understøtningstabeller, materialemængder til et regneark eller TakeoffCraft, plan- og længdeprofilark med en undersøgelsesrapport som én PDF og GIS-lag med alle aktivers data.
keywords: optrækningstabel, understøtningstabel, mængder, stykliste, takeoffcraft, ark, rapport, pdf, længdeprofilark, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Alt her ligger under {{ui:Mere}} i gruppen Elledninger.

| Output | Hvad du får |
|---|---|
| {{ui:Optrækningstabeller…}} | Pr. sektion den vandrette spænding og hvert spends gennemhængning ved hver temperatur; gem som CSV. {{ui:Gem tabellen over understøtninger (CSV)}}: hver understøtnings rolle, emne, terræn, fastgørelse, største last, nominel, OK, forslag, fundament, udsving, optrækning |
| {{ui:Mængder…}} | Leder (kædelængder × ledere × kredse + 2 % til springere og endeforankringer), understøtninger og udstyr pr. bibliotekemne, kabel, grøft, udgravning, rør og samlinger. CSV, Excel eller en TakeoffCraft-mængdefil |
| {{ui:Ark og rapport…}} | Én PDF: planen; et længdeprofilark for hver linje med lederen ved de lasttilfælde, du vælger, og en strimmel med spændlængder, gennemhængninger og laveste frihøjder; og en undersøgelsesrapport (regelsæt, sektioner, optrækningstabeller, understøtninger og hver kontrol) |
| {{ui:Eksportér til GIS…}} | Understøtninger, spænd, kabelruter, udstyr og forhindringer som lag med deres data (højder, laster, gennemhængninger, frihøjder, hvad der fejler), som GeoPackage, shapefiler, GeoJSON, KML eller KMZ |

GeoJSON og KML kræver projektets koordinatsystem ([Koordinatsystemer](topic:coordinate-systems)); uden et, bærer GeoPackage og shapefiler projektets egne tal.
