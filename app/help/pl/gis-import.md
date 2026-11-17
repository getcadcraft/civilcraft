---
title: Importuj dane GIS
summary: Wczytaj shapefile, GeoJSON i GeoPackage do projektu jako warstwy GIS, umieść je przez właściwy układ współrzędnych, przejrzyj ich atrybuty i użyj ich do powierzchni.
keywords: gis, etykiety, etykietuj obiekty, atrybuty na planie, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importuj, warstwy, atrybuty, układ współrzędnych, epsg, szerokość, długość, poziomice, działki, linie charakterystyczne, granica
from: f6b235cc
---

Działy GIS miast i powiatów wydają kontekst terenowy jako pliki GIS: działki, służebności, poziomice, uzbrojenie, osnowę pomiarową. CivilCraft otwiera trzy ich rodzaje jako **warstwy GIS**, które leżą pod projektem na planie.

| Plik | Co otworzyć |
|---|---|
| Shapefile | Plik `.shp` razem z `.shx`, `.dbf`, `.prj` i `.cpg` (zaznacz wszystkie) albo `.zip`, w którym przyszły. Zip z kilkoma shapefile daje kilka warstw. |
| GeoJSON | Plik `.geojson` (plik `.json`, którego pierwsze wiersze mówią `FeatureCollection` lub `Feature`, też działa). |
| GeoPackage | Plik `.gpkg`. Wymieniona jest każda tabela obiektów w nim. |
| KML lub KMZ | Plik `.kml` (z Google Earth lub mapy internetowej) albo spakowany `.kmz`. Każdy folder staje się warstwą (rozbijaną na punkty, linie i poligony, gdy zawiera kilka rodzajów); nazwa znacznika, opis i dane rozszerzone stają się jego atrybutami. Wysokości są w metrach, a szerokość i długość geograficzna jak w GeoJSON. |

Punkty, multipunkty, linie, poligony z otworami i kształty wieloczęściowe są odczytywane wraz ze swoimi rzędnymi (z), gdy plik je zawiera. Wartości pomiarowe (M) są pomijane. Siatki rzędnych i LiDAR otwiera się tak samo: zob. [Siatki rzędnych i LiDAR](topic:elevation-grids-and-lidar).

## Otwieranie plików

1. Kliknij {{ui:Importuj}} w grupie **GIS** (lub {{ui:Otwórz}}), wybierz pliki albo upuść je na plan. Pliki są czytane na tym komputerze; nic nie jest wysyłane.
2. Okno **Importuj dane GIS** wymienia każdą znalezioną warstwę: jej rodzaj, liczbę obiektów (i ile z nich nie ma geometrii), liczbę pól atrybutów oraz układ współrzędnych podany w pliku. Odznacz warstwy, których nie chcesz.
3. Przeczytaj część **Układ współrzędnych** (poniżej) i wiersz **Co się stanie**, a potem kliknij {{ui:Importuj}}.
4. Warstwy pojawiają się na planie i pod **Warstwy GIS** w lewym panelu. Import to jeden krok: {{key:Mod+Z}} go cofa.

Duży plik pokazuje nad planem linię postępu z przyciskiem {{ui:Anuluj}}.

## Układ współrzędnych

Pliki GIS mówią, gdzie są, przez układ współrzędnych (`.prj` shapefile, tabela układów przestrzennych GeoPackage; GeoJSON to zawsze szerokość i długość geograficzna). CivilCraft przelicza każdą warstwę z jej własnego układu na układ projektu. Nigdy nie zgaduje:

- **Projekt ma układ współrzędnych** (ustawiony w {{ui:Współrzędne}}): każda warstwa z własnym układem jest przeliczana na niego, łącznie z dopasowaniem terenowym lub lokalnym. Plik bez `.prj` ma dwa wybory: **Taki jak projekt** (jego liczby są wczytywane bez zmian) albo **Wybierz układ pliku**.
- **Projekt nie ma układu, a plik jest w układzie rzutowym w jednostkach projektu** (na przykład strefa stanowego układu płaskiego w stopach amerykańskich dla projektu w stopach): okno proponuje **Użyj tego układu jako układu współrzędnych projektu**. Zostaje on ustawiony w tym samym kroku cofania co import. Nic w projekcie się nie przesuwa; układ mówi tylko, co oznaczają liczby. Zamiast tego możesz wybrać dla projektu inny układ, a warstwy zostaną przeliczone na niego.
- **Projekt nie ma układu, a plik jest w szerokości i długości geograficznej** (każdy GeoJSON) **albo w innych jednostkach**: {{ui:Importuj}} pozostaje wyszarzony, dopóki nie wybierzesz układu współrzędnych projektu. Wybieranie zaczyna się w pobliżu danych.
- **Ani projekt, ani pliki nie podają układu**: liczby są wczytywane bez zmian, a okno to mówi.

Rzędne też są przeliczane: wysokości GeoJSON są w metrach (tak mówi standard GeoJSON); wysokości w innych plikach są brane w jednostce ich własnego układu.

:::warning
Położenia w pliku GeoJSON poza zakresem ±180° długości lub ±90° szerokości geograficznej nie są szerokością i długością geograficzną. Te obiekty są pomijane, a okno podaje, ile ich jest. Taki plik to zwykle plik rzutowy zapisany bez układu; poproś o niego ponownie albo o shapefile z `.prj`.
:::

NAD83 jest traktowany tak samo jak WGS 84 (układ, którego używa GeoJSON); oba różnią się o kilka metrów w Ameryce Północnej, więc dane GeoJSON mogą być przesunięte o tyle. Tam, gdzie najlepsze przesunięcie wymaga pliku siatki (na przykład NADCON dla NAD27), CivilCraft używa zgrubnego opublikowanego przesunięcia, a okno układu współrzędnych pokazuje, jak zgrubne jest (dla NAD27 około 20 m), dopóki nie dodasz siatki: zob. [Pliki przesunięć siatki](topic:coordinate-systems).

## Warstwy GIS

Każdy wiersz pod **Warstwy GIS** ma:

- pole wyboru, by pokazać lub ukryć warstwę (ukryte warstwy też nie są wybierane);
- jej kolor, wybrany z listy;
- menu (trzy kropki) z {{ui:Powiększ do}}, {{ui:Użyj do powierzchni…}}, {{ui:Zmień nazwę…}} i {{ui:Usuń}}.

Pokazywanie, ukrywanie, zmiana koloru, zmiana nazwy i usuwanie to kroki cofania. Warstwy GIS są zapisywane w pliku projektu i wracają po jego otwarciu. Trafiają też do wydruku PDF planu oraz do eksportów DXF i DWG, każda na warstwie o nazwie `GIS-` i jej numerze.

## Etykietowanie obiektów według atrybutu

W menu {{ui:Więcej}} warstwy (trzy kropki w **Warstwy GIS**) wybierz pole pod **Etykietuj według**: każdy obiekt pokaże swoją wartość na planie, kolorem warstwy. Punkty są opisywane obok punktu, linie wzdłuż środka ich najdłuższej części (obrócone tak, by czytać je od lewej do prawej), poligony w swoim środku. Liczby pokazują do trzech miejsc po przecinku. Etykiety mają 1.8 mm wysokości na papierze, w każdej skali, i trafiają do wydruku PDF, DXF i DWG. Wybierz **Bez etykiet**, by je usunąć; każda zmiana to jeden krok ({{key:Mod+Z}} ją cofa). Warstwa etykietuje najwyżej 5,000 obiektów.

## Obejrzyj obiekt

Przy włączonym {{ui:Zaznacz}} kliknij obiekt. **Właściwości** pokazują jego warstwę, to, który to obiekt, jego kształt (części, otwory, wierzchołki), rzędne, plik, z którego pochodzi, i układ współrzędnych tego pliku, a potem wszystkie atrybuty w tabeli. Atrybuty są tylko do odczytu: CivilCraft pokazuje dane GIS takie, jakie przyszły; nie edytuje ich.

Punkty mają pierwszeństwo przed liniami, gdy oba są pod wskaźnikiem; wewnątrz poligonu wybierany jest najmniejszy z nich.

## Użyj do powierzchni

Otwórz menu warstwy i wybierz {{ui:Użyj do powierzchni…}} (albo przycisk we **Właściwościach**). To, co jest oferowane, zależy od warstwy:

| Warstwa | Może stać się |
|---|---|
| Linie z rzędnymi (linie 3D) | Liniami charakterystycznymi o ich własnych rzędnych |
| Linie bez rzędnych, ale z polem liczbowym (poziomice) | Liniami charakterystycznymi o rzędnej z wybranego pola |
| Poligony | Granicą powierzchni (wybrany poligon, w przeciwnym razie największy) albo liniami charakterystycznymi wzdłuż ich krawędzi |
| Punkty z rzędnymi albo z polem rzędnej | Punktami pomiaru, opisanymi nazwą warstwy, tak że tworzą grupę punktów |

Każde użycie to jeden krok cofania, który kopiuje geometrię do projektu; sama warstwa pozostaje bez zmian. Rzędne są brane w jednostkach projektu.

## Pliki punktów z szerokością i długością geograficzną

Plik punktów, którego nagłówek nazywa kolumny **latitude** i **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`), jest czytany jako stopnie, a nie jako północ i wschód. Okno importu to mówi. Po kliknięciu {{ui:Importuj}} punkty są przeliczane na układ współrzędnych projektu; projekt bez układu najpierw prosi o jego wybór. Stopnie nigdy nie są wczytywane jako stopy. Wiersze poza ±90° szerokości lub ±180° długości są odrzucane z podaniem powodu. Kolumna rzędnych jest brana bez zmian, w jednostkach projektu.

## Pliki LandXML z podanym układem współrzędnych

Gdy otwierany plik LandXML ma element `CoordinateSystem` (kod EPSG, opis WKT lub nazwę układu), CivilCraft proponuje go jako układ współrzędnych projektu. Nic się nie przesuwa po zaakceptowaniu; układ mówi tylko, co oznaczają liczby.

## Co sprawdzono

- Każdy czytnik porównano z GDAL, biblioteką, z której korzysta większość programów GIS, na plikach zapisanych przez GDAL: shapefile każdego rodzaju, z rzędnymi i bez, linie wieloczęściowe, poligony z otworami, puste geometrie, atrybuty tekstowe, liczbowe, datowe i prawda/fałsz, tekst UTF-8 i Windows-1252 z `.cpg` i bez, zip z kilkoma shapefile, GeoJSON każdego typu geometrii oraz GeoPackage z czterema tabelami. Każda geometria, rzędna i atrybut się zgadzały.
- Położenia przeliczone z szerokości i długości geograficznej oraz z UTM zgadzały się z PROJ (biblioteką rzutowania stojącą za GDAL) do 3 mm.
- Uszkodzone pliki (ucięte, z błędnymi rozmiarami, złe zipy, złe GeoPackage) dają jeden zrozumiały komunikat; nic się nie zawiesza.
- Nic z tego nie zostało jeszcze otwarte w innych programach GIS, a pliki geobaz plikowych, KML i KMZ nie są jeszcze odczytywane (zob. [Jeszcze nie zbudowano](topic:not-built-yet)).
