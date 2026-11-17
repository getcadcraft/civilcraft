---
title: Tabulky, množství, listy a GIS pro elektrická vedení
summary: Tabulky napínání a podpěr, množství materiálu pro tabulku nebo TakeoffCraft, listy půdorysu a profilu se studijní zprávou v jednom PDF a vrstvy GIS se všemi údaji o každém prvku.
keywords: montážní tabulka, tabulka podpěr, množství, výkaz výměr, takeoffcraft, listy, zpráva, pdf, profilový list, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Vše zde je pod {{ui:Více}} ve skupině Elektrická vedení.

| Výstup | Co dostanete |
|---|---|
| {{ui:Montážní tabulky…}} | Pro každý úsek vodorovné napětí a průvěs každého rozpětí při každé teplotě; uložit jako CSV. {{ui:Uložit tabulku podpěr (CSV)}}: role každé podpěry, položka, terén, uchycení, největší zatížení, jmenovitá hodnota, OK, návrh, základ, výkyv, vytržení |
| {{ui:Množství…}} | Vodič (délky řetězovky × vodiče × obvody + 2 % na propojky a koncová upevnění), podpěry a zařízení podle položky knihovny, kabel, výkop, zemní práce, chráničky, spojky. CSV, Excel nebo soubor množství pro TakeoffCraft |
| {{ui:Listy a zpráva…}} | Jedno PDF: půdorys; profilový list pro každé vedení s vodičem při zatěžovacích stavech, které zvolíte, a pruh délek rozpětí, průvěsů a nejnižších světlých výšek; a studijní zpráva (sada pravidel, úseky, montážní tabulky, podpěry, každá kontrola) |
| {{ui:Exportovat do GIS…}} | Podpěry, rozpětí, trasy kabelů, zařízení a překážky jako vrstvy s jejich údaji (výšky, zatížení, průvěsy, světlé výšky, co nevyhovuje), jako GeoPackage, shapefile, GeoJSON, KML nebo KMZ |

GeoJSON a KML potřebují souřadnicový systém projektu ([Souřadnicové systémy](topic:coordinate-systems)). Bez něj nesou GeoPackage a shapefile vlastní souřadnice projektu.
