---
title: Tabele linii energetycznych, ilości, arkusze i GIS
summary: Tabele naciągu i podpór, ilości materiałów do arkusza kalkulacyjnego lub TakeoffCraft, arkusze planu i profilu z raportem analizy w jednym PDF oraz warstwy GIS z danymi każdego obiektu.
keywords: tabela naciągu, tabela podpór, ilości, zestawienie materiałów, takeoffcraft, arkusze, raport, pdf, arkusz profilu, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Wszystko tutaj znajduje się pod {{ui:Więcej}} w grupie Linie energetyczne.

| Wynik | Co otrzymujesz |
|---|---|
| {{ui:Tabele naciągu…}} | Dla każdego odcinka poziome naprężenie i strzałka każdego przęsła w każdej temperaturze; zapis jako CSV. {{ui:Zapisz tabelę słupów (CSV)}}: rola każdej podpory, element, teren, mocowanie, największe obciążenie, nominalne, OK, sugestia, fundament, wychylenie, wyciąganie |
| {{ui:Ilości…}} | Przewód (długości łuku łańcuchowego × przewody × obwody + 2 % na połączenia przewodów i końce martwe), podpory i urządzenia według elementu biblioteki, kabla, wykopu, robót ziemnych, kanałów i złączy. CSV, Excel lub plik ilości TakeoffCraft |
| {{ui:Arkusze i raport…}} | Jeden PDF: plan; arkusz profilu dla każdej linii z przewodem przy przypadkach obciążenia, które wybierzesz, oraz pasek długości przęseł, strzałek i najniższych prześwitów; raport analizy (zestaw reguł, odcinki, tabele naciągu, podpory, każda kontrola) |
| {{ui:Eksportuj do GIS…}} | Podpory, przęsła, trasy kabli, urządzenia i przeszkody jako warstwy z ich danymi (wysokości, obciążenia, strzałki, prześwity, co nie spełnia wymagań), jako GeoPackage, shapefile, GeoJSON, KML lub KMZ |

GeoJSON i KML wymagają układu współrzędnych projektu ([Układy współrzędnych](topic:coordinate-systems)); bez niego GeoPackage i shapefile zawierają własne liczby projektu.
