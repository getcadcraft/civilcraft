---
title: Eksport danych powykonawczych do GIS
summary: Przekaż punkty pomiaru, poziomice, osie tras, place, rurociągi i budowle do działu GIS miasta lub powiatu jako shapefile, GeoPackage, GeoJSON lub KML, we współrzędnych siatki układu współrzędnych projektu.
keywords: gis, eksport, kml, kmz, google earth, powykonawcze, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, rurociągi, budowle, uzbrojenie, miasto, powiat, siatka, grunt, epsg, prj
from: bba4fea5
---

Wiele miast i powiatów wymaga danych powykonawczych w formacie GIS po zamknięciu projektu: gdzie poszły rurociągi i budowle, końcowe niwelety, oś drogi. **GIS › Eksport** zapisuje to, co CivilCraft przechowuje, jako warstwy GIS, po jednej na każdy rodzaj obiektu.

## Przed eksportem

1. Ustaw układ współrzędnych projektu w {{ui:Współrzędne}}. Dział GIS musi wiedzieć, gdzie są liczby; bez układu pliki zawierają własne liczby projektu i nie podają żadnego układu.
2. Sprawdź powierzchnię, osie, place i sieć rurociągów tak, jak chcesz je dostarczyć.
3. Zapytaj dział, jaki format i jaki układ współrzędnych preferuje. Wiele z nich nadal chce shapefile w strefie stanowego układu płaskiego (state plane); nowsze systemy przyjmują GeoPackage.

## Eksport

1. Kliknij {{ui:Eksport}} w grupie **GIS**.
2. W sekcji **Co** zaznacz rodzaje do wysłania. Każdy pokazuje, ile ma obiektów; rodzaje, w których nic jeszcze nie ma, są wyszarzone.
3. W sekcji **Jako** wybierz format.
4. Przeczytaj uwagi o współrzędnych i jednostkach, potem kliknij przycisk pobierania. Wiersz stanu mówi, co weszło i które nazwy pól zostały skrócone.

Okno zawiera też eksport siatki rzędnych ({{ui:Powierzchnia jako siatka rzędnych GeoTIFF}}); zob. [Siatki rzędnych i LiDAR](topic:elevation-grids-and-lidar).

## Co zawiera każdy rodzaj

| Rodzaj | Kształt | Pola |
|---|---|---|
| Punkty pomiaru | Punkty z rzędną | `P` numer punktu, `N` północ, `E` wschód, `Z` rzędna, `D` opis |
| Poziomice terenu istniejącego i powierzchni projektowanej | Linie na swojej rzędnej | `ELEV` |
| Linie charakterystyczne | Linie z rzędnymi | `NAME` |
| Granica powierzchni | Poligon (narysowana granica, a w jej braku krawędź powierzchni) | `NAME` |
| Trasy | Osie | `NAME`, `LENGTH`, `STA_START`, `STA_END` (kilometraż jako zwykłe liczby) |
| Place | Poligony na rzędnej placu | `NAME`, `ELEV`, `AREA` |
| Linie przecięcia z terenem | Linie z rzędnymi (place i korytarze) | `NAME` |
| Linie charakterystyczne korytarza | Linie z rzędnymi: oś, krawędzie jezdni, pobocza | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Rurociągi | Linie od górnego do dolnego dna | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (procenty), `LENGTH`, `NETWORK` |
| Budowle | Punkty na obrzeżu włazu | `NAME`, `RIM`, `INVERT` (najniższe dno rurociągu w tym miejscu), `SUMP` (osadnik), `DIA`, `DIA_UNIT` |
| Każda warstwa GIS | Jak zaimportowana | Jej własne pola |

Długości, kilometraże i rzędne są w jednostkach projektu (stopy amerykańskie US survey feet lub metry). Średnice rurociągów i budowli są w calach dla projektów w stopach i w milimetrach dla projektów w metrach; `DIA_UNIT` mówi, które.

## Formaty

- **Shapefile**: jeden plik `.zip` z shapefile dla każdego rodzaju (`.shp`, `.shx`, `.dbf`), plik `.cpg` mówiący, że tekst jest w UTF-8, oraz `.prj` podający układ współrzędnych. Kształty z rzędnymi są zapisywane jako typy Z shapefile. Nazwy pól dłuższe niż 10 znaków są skracane, jak wymaga format; wiersz stanu je wymienia.
- **GeoPackage**: jeden plik `.gpkg` z tabelą dla każdego rodzaju, układ współrzędnych zapisany wraz z kodem EPSG. Jeden plik zamiast wielu, długie nazwy pól zachowane.
- **KML** lub **KMZ** (KML spakowany): jeden plik szerokości i długości geograficznej dla Google Earth i map internetowych, folder dla każdego rodzaju, każdy obiekt jako znacznik nazwany z pola NAME, ze wszystkimi polami jako dane rozszerzone; wysokości w metrach (tryb wysokości absolutnej). Podobnie jak GeoJSON, wymaga układu współrzędnych projektu.
- **GeoJSON**: jeden plik szerokości i długości geograficznej (standard GeoJSON nie dopuszcza nic innego), z każdym obiektem mającym właściwość `kind` (`pipes`, `structures`, …), by odbiorca mógł je rozdzielić. Wysokości są przeliczane na metry, jak wymaga standard; pozostają w pionowym układzie odniesienia projektu (CivilCraft nie ma modelu geoidy). Projekt bez układu współrzędnych nie może wyeksportować GeoJSON, a okno podaje powód.

## Siatka, nie grunt

Działy GIS trzymają dane we współrzędnych **siatki** układu współrzędnych. Jeśli projekt używa współrzędnych terenowych lub lokalnych (ustawianych w {{ui:Współrzędne}}), każda współrzędna jest przeliczana z powrotem na siatkę przy wyjściu: liczby w plikach różnią się od tych na planie o twój współczynnik skali (a przy układzie lokalnym także o obrót). Pola punktów `N` i `E` też zawierają wartości siatki. Okno o tym przypomina.

:::tip
Dołącz do plików krótką notatkę: układ współrzędnych i jego kod EPSG, pionowy układ odniesienia rzędnych, jednostki oraz opis każdego pliku.
:::

## Co sprawdzono

- Każdy zapisany plik został odczytany z powrotem przez GDAL, bibliotekę, z której korzysta większość programów GIS: każdy kształt, rzędna i atrybut, liczby obiektów oraz układ współrzędnych jako kod EPSG (`.prj` i GeoPackage). Nasze własne czytniki odczytują je tak samo.
- Pliki GeoJSON są zgodne z RFC 7946: długość przed szerokością, bez elementu `crs`, zewnętrzne pierścienie przeciwnie do ruchu wskazówek zegara, a otwory zgodnie z nim; położenia zgodne z PROJ do 2 mm.
- Wyeksportowano projekt we współrzędnych terenowych i każdy punkt sprawdzono względem jego współrzędnych siatki.
- Nic z tego nie zostało jeszcze otwarte w innych programach GIS. Sprawdź pierwszą dostawę z działem, zanim na niej polegasz.
