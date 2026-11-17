---
title: Kraftlinjetabeller, mengder, ark og GIS
summary: Strekke- og mastetabeller, materialmengder til et regneark eller TakeoffCraft, plan- og profilark med en studierapport som én PDF, og GIS-lag med alle eiendelenes data.
keywords: strekketabell, mastetabell, mengder, materialliste, takeoffcraft, ark, rapport, pdf, profilark, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Alt her ligger under {{ui:Mer}} i Kraftlinjer-gruppen.

| Resultat | Hva du får |
|---|---|
| {{ui:Strekketabeller…}} | Per strekk, den horisontale spenningen og hvert spenns sigdybde ved hver temperatur; lagre som CSV. {{ui:Lagre mastetabellen (CSV)}}: hver masts rolle, element, terreng, feste, største last, nominell, OK, forslag, fundament, utslag, oppløft |
| {{ui:Mengder…}} | Leder (kjedelinjelengder × ledere × kretser + 2 % for hoppere og endeforankringer), master og utstyr etter biblioteks­element, kabel, grøft, utgraving, rør og skjøter. CSV, Excel eller en mengdefil for TakeoffCraft |
| {{ui:Ark og rapport…}} | Én PDF: planen; et profilark for hver linje med lederen ved lastsituasjonene du velger og en stripe med spennlengder, sigdybder og laveste frirom; og en studierapport (regelsett, strekk, strekketabeller, master, hver kontroll) |
| {{ui:Eksporter til GIS…}} | Master, spenn, kabelruter, utstyr og hindringer som lag med sine data (høyder, laster, sigdybder, frirom, hva som feiler), som GeoPackage, shapefiler, GeoJSON, KML eller KMZ |

GeoJSON og KML trenger prosjektets koordinatsystem ([Koordinatsystemer](topic:coordinate-systems)); uten et, bærer GeoPackage og shapefiler prosjektets egne tall.
