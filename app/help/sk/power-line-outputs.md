---
title: Tabuľky, množstvá, listy a GIS pre elektrické vedenia
summary: Tabuľky vešania a podpier, množstvá materiálu pre tabuľkový procesor alebo TakeoffCraft, profilové a pôdorysné listy so štúdijnou správou v jednom PDF a vrstvy GIS so všetkými údajmi o prvkoch.
keywords: tabuľka vešania, tabuľka podpier, množstvá, kusovník, takeoffcraft, listy, správa, pdf, profilový list, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Všetko tu je pod {{ui:Viac}} v skupine Elektrické vedenia.

| Výstup | Čo dostanete |
|---|---|
| {{ui:Tabuľky vešania…}} | Pre každý úsek vodorovné napnutie a previsnutie každého úseku pri každej teplote; uložiť ako CSV. {{ui:Uložiť tabuľku podpier (CSV)}}: úloha každej podpery, položka, terén, uchytenie, najväčšie zaťaženie, menovité, OK, návrh, základ, výchylka, nadvihnutie |
| {{ui:Množstvá…}} | Vodič (dĺžky závesu × vodiče × okruhy + 2 % na prepojky a koncové podpery), podpery a zariadenie podľa položky knižnice, kábel, ryha, výkop, chráničky, spojky. CSV, Excel alebo súbor množstiev TakeoffCraft |
| {{ui:Listy a správa…}} | Jedno PDF: pôdorys; profilový list pre každé vedenie s vodičom pri zaťažovacích stavoch, ktoré vyberiete, a pásom dĺžok úsekov, previsnutí a najnižších odstupov; a štúdijná správa (pravidlá, úseky, tabuľky vešania, podpery, každá kontrola) |
| {{ui:Exportovať do GIS…}} | Podpery, úseky, trasy káblov, zariadenia a prekážky ako vrstvy s ich údajmi (výšky, zaťaženia, previsnutia, odstupy, čo zlyháva), ako GeoPackage, shapefile, GeoJSON, KML alebo KMZ |

GeoJSON a KML potrebujú súradnicový systém projektu ([Súradnicové systémy](topic:coordinate-systems)); bez neho si GeoPackage a shapefile nesú vlastné čísla projektu.
