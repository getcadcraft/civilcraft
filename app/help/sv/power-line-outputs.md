---
title: Kraftledningstabeller, mängder, blad och GIS
summary: Uppspännings- och stödtabeller, materialmängder för ett kalkylblad eller TakeoffCraft, plan- och profilblad med en studierapport i en PDF, och GIS-lager med alla tillgångars data.
keywords: uppspänningstabell, stödtabell, mängder, materialförteckning, takeoffcraft, blad, rapport, pdf, profilblad, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Allt här finns under {{ui:Mer}} i gruppen Kraftledningar.

| Resultat | Vad du får |
|---|---|
| {{ui:Uppspänningstabeller…}} | Per sektion, den horisontella spänningen och varje spanns hängning vid varje temperatur; sparas som CSV. {{ui:Spara stödtabellen (CSV)}}: varje stöds roll, objekt, mark, fäste, största last, nominell last, OK, förslag, grund, utsving, uppåtlyft |
| {{ui:Mängder…}} | Lina (kedjelinjelängder × linor × kretsar + 2 % för hoppledare och ändfästen), stöd och utrustning per biblioteksobjekt, kabel, kabelgrav, schakt, rör, skarvar. CSV, Excel eller en mängdfil för TakeoffCraft |
| {{ui:Blad och rapport…}} | En PDF: planen; ett profilblad för varje linje med linan vid de lastfall du väljer och en remsa med spannlängder, hängningar och lägsta fria höjd; och en studierapport (regeluppsättning, sektioner, uppspänningstabeller, stöd, varje kontroll) |
| {{ui:Exportera till GIS…}} | Stöd, spann, kabelrutter, utrustning och hinder som lager med sina data (höjder, laster, hängningar, fria höjder, vad som inte klarar kraven), som GeoPackage, shapefiler, GeoJSON, KML eller KMZ |

GeoJSON och KML kräver projektets koordinatsystem ([Koordinatsystem](topic:coordinate-systems)); utan ett sådant bär GeoPackage och shapefiler projektets egna värden.
