---
title: Siatki wysokości i LiDAR
summary: Zbuduj istniejący teren z DEM (GeoTIFF lub siatki ASCII) albo z punktów LiDAR (LAS, LAZ) — wybierz obszar, przerzedź dane, wybierz klasy i sprawdź jednostki wysokości — a powierzchnię zwróć jako siatkę wysokości GeoTIFF.
keywords: dem, dtm, siatka wysokości, geotiff, tif, siatka ascii, asc, lidar, las, laz, chmura punktów, klasy, teren, przerzedzanie, nodata, raster, eksport geotiff, gis
from: c8b2d18a
---

Publiczne dane wysokościowe występują na dwa sposoby: **siatki wysokości** (DEM: jedna wysokość na kwadratową komórkę, zwykle plik GeoTIFF `.tif` lub siatka ASCII `.asc`) oraz **punkty LiDAR** (miliony odbić lasera w pliku `.las`, albo `.laz` w postaci skompresowanej). CivilCraft zamienia jedne i drugie na punkty pomiarowe albo powierzchnię, w przeglądarce: nic nie jest wysyłane.

## Otwórz plik

1. Kliknij {{ui:Otwórz}} (albo {{ui:Importuj}} w grupie **GIS**) i wybierz plik albo przeciągnij go na rzut. Dla siatki ASCII wybierz także jej plik `.prj`, aby CivilCraft znał jej układ współrzędnych.
2. Okno importu pokazuje, co plik mówi o sobie: rozmiar, komórki lub punkty, układ współrzędnych, położenie w szerokości i długości geograficznej oraz zakres wysokości. Dla LiDAR najpierw odczytuje każdy punkt raz, aby policzyć **klasy** (pasek postępu pokazuje, jak daleko to jest; {{ui:Anuluj}} go zatrzymuje).

GeoTIFF z trzema lub czterema pasmami (czerwonym, zielonym, niebieskim) to obraz, a nie wysokości: trafia do warstw mapy.

## Wybór danych do importu

- **Obszar**: {{ui:Zasięg projektu z marginesem}} (wpisz margines), {{ui:To, co pokazuje teraz plan}} albo {{ui:Cały plik}}. Odczytywana jest tylko ta część pliku.
- **Przerzedź do**: odstęp między uzyskanymi punktami, w jednostkach projektu. Linia pod ustawieniami pokazuje, ile punktów to daje, gdy wpisujesz wartość. Dla siatki CivilCraft zachowuje co drugą, co trzecią … komórkę, tak aby wysokości pozostały dokładnie takie, jak w pliku; nigdy nie uśrednia komórek. Dla LiDAR obszar jest dzielony na kwadraty o tym rozmiarze i zachowywany jest jeden punkt na kwadrat: {{ui:Punkt najbliższy środkowi każdej komórki}} (domyślnie), {{ui:Najniższy punkt w każdej komórce}} (dobre, gdy plik nie ma klasy terenu: teren jest pod drzewami) albo {{ui:Średnia punktów każdej komórki}}.
- **Klasy** (LiDAR): klasa terenu (klasa 2) jest zaznaczona, gdy plik ją ma; budynki, drzewa i szumy są pomijane. Gdy nie ma klasy terenu, zaznaczone są wszystkie klasy, a okno o tym informuje.
- **Teren** (LiDAR, 0.8): chmura z drona nie ma klasy terenu. Gdy plik jej nie ma, okno zaczyna od {{ui:Znajdź teren samodzielnie (chmury z drona, bez klasy terenu)}}: czytane są wszystkie klasy oprócz szumu, zachowywany jest najniższy punkt w każdej komórce, a potem CivilCraft usuwa budynki, drzewa i przypadkowe niskie punkty za pomocą progresywnego filtra morfologicznego (Zhang i in., 2003), który można sterować: **Największy obiekt do usunięcia** (szerokość największego budynku; okna filtra rosną, aż go pokryją; 0 oznacza 20 komórek) oraz **Najostrzejszy spadek terenu**. Praca wykonywana jest na siatce najniższych punktów, więc chmura liczona w dziesiątkach milionów punktów kosztuje nie więcej niż liczba jej komórek (przerzedzenie to jeden przebieg strumieniowy). Odstęp to rozmiar komórki: grubsza jest szybsza i gubi małe obiekty rzadziej, niż można by sądzić, drobniejsza zachowuje więcej szczegółów terenu. Raport podaje, ile punktów zachowano jako teren, ile komórek usunięto jako obiekty i ile przypadkowych niskich punktów odrzucono. Na zmyślonym badaniu z drona o długości 300 m, z pięcioma budynkami, 70 drzewami i 200 niskimi odstającymi punktami, zachowane punkty mieściły się w 3 cm od rzeczywistego terenu, a żaden dach ani korona drzewa nie zostały zachowane.
- **Wysokości w pliku**: metry, stopy lub US survey feet. Gdy plik to podaje, jednostka jest już wybrana. Gdy nie, musisz ją wybrać: okno pokazuje zakres wysokości w obu wariantach, abyś mógł ocenić, który ma sens dla terenu.
- **Importuj jako** (tylko siatki): {{ui:Punkty pomiarowe (opis DEM)}} albo {{ui:Sama powierzchnia (siatka trójkątów)}}.

Jeden import obejmuje najwyżej 500,000 punktów. Gdy wybór dałby więcej, okno podaje, o ile za dużo i jaki odstęp by się zmieścił, a przycisk {{ui:Importuj}} pozostaje nieaktywny.

Kliknij {{ui:Importuj}}. Pasek postępu pokazuje odczyt; {{ui:Anuluj}} go zatrzymuje i nic się nie zmienia.

:::warning
Jednostki wysokości to częsta pułapka. Wiele DEM w układzie płaskim ma wschody i północy w stopach, ale rzędne w metrach. Porównaj zakres pokazany w oknie z tym, co wiesz o terenie.
:::

## Co otrzymujesz

- **Punkty pomiarowe**: numerowane po najwyższym numerze punktu, z opisem `DEM` (siatki) lub `LIDAR`, tak że tworzą jedną grupę punktów w sekcji **Punkty** i budują powierzchnię jak każde inne punkty. Import jest jednym krokiem: {{key:Mod+Z}} usuwa je ponownie.
- **Sama powierzchnia**: siatka TIN, dwa trójkąty na komórkę, podzielone wzdłuż przekątnej od południowego zachodu do północnego wschodu. Trójkąt, którego narożnik nie ma danych, jest pomijany, więc dziury w danych pozostają dziurami. Powierzchnia równa się siatce w każdym punkcie siatki i jest płaską płaszczyzną wewnątrz każdego trójkąta między nimi. Zastępuje powierzchnię projektu (okno pyta najpierw); {{key:Mod+Z}} przywraca poprzednią powierzchnię. Nagłówek lewego panelu brzmi **Powierzchnia (z siatki wysokości)**.

## Układy współrzędnych

- Gdy projekt ma układ współrzędnych, a plik podaje inny, każdy punkt jest przeliczany na układ projektu (i na współrzędne terenowe lub lokalne, jeśli je ma).
- Gdy projekt go nie ma, a układ pliku jest w jednostkach projektu (stopy lub metry), okno proponuje ustawienie go jako układu współrzędnych projektu, w tym samym kroku cofania co punkty.
- Gdy plik jest w szerokości i długości geograficznej albo w metrach dla projektu w stopach, okno najpierw prosi o wybranie układu współrzędnych projektu.
- Gdy plik tego nie podaje, jego liczby są traktowane jako współrzędne projektu. Zamiast tego możesz wybrać układ pliku.

## Eksport powierzchni jako GeoTIFF

1. Kliknij {{ui:Eksport}} w grupie **GIS**.
2. W części GeoTIFF wybierz powierzchnię (istniejący teren lub powierzchnię po niwelacji) i rozmiar komórki. Wartość domyślna pochodzi ze średniej krawędzi trójkąta powierzchni. Okno pokazuje rozmiar siatki, którą zapisze.
3. Kliknij {{ui:Pobierz GeoTIFF}}.

Plik to jedno pasmo 32-bitowych wartości zmiennoprzecinkowych wysokości w jednostkach projektu, obejmujące zasięg powierzchni; komórki poza powierzchnią to "brak danych" (−3.4028235e38). Wartość każdej komórki to wysokość powierzchni w środku komórki. Współrzędne są **siatkowe**: projekt w współrzędnych terenowych lub lokalnych jest przeliczany z powrotem na siatkę. Plik podaje układ współrzędnych projektu kodem EPSG; układ bez kodu EPSG nie jest zapisywany, a okno ostrzega, abyś poinformował dział GIS, o jaki układ chodzi.

## Co sprawdzono

- Czytniki GeoTIFF i siatek ASCII sprawdzono z GDAL (przez rasterio), biblioteką, której używa większość programów GIS do tych plików: siatki 32-bitowe zmiennoprzecinkowe i 16-bitowe całkowite, kafelkowane i paskowe, DEFLATE i LZW, nodata, skala i przesunięcie, piksel jako punkt, siatka UTM, siatka układu płaskiego w US survey feet oraz siatka szerokości i długości geograficznej — każda wartość równa.
- Czytniki LAS i LAZ sprawdzono z laspy: LAS 1.2 i 1.4, formaty punktów 0, 1, 3, 6, 7 i 8, z układem współrzędnych i bez niego, oraz LAZ zapisany przez backend zgodny z LASzip — każdy punkt równy.
- Przeliczone współrzędne sprawdzono z PROJ z dokładnością do 1 mm.
- Wyeksportowane pliki GeoTIFF odczytano z powrotem w GDAL: układ współrzędnych, położenie komórek, nodata, jednostki i wartości równe powierzchni z dokładnością do 0.0001.
- Nic tutaj nie zostało otwarte w innych programach GIS ani CAD.

## Jeszcze nie zbudowano

- Zmiany datum pionowego (modele geoidy): wysokości są używane tak, jak plik je podaje.
- Dane przebiegu fali, odbicia LiDAR inne niż według klasy, kolory i intensywności.
- Kilka pasm, przeglądy (overviews) lub pliki powyżej 200 MB.
- Zapis LAS lub LAZ z powierzchni albo z tego narzędzia (dodatek [Chmury punktów](topic:point-clouds) zapisuje oczyszczoną chmurę jako LAS 1.4 lub LAZ).
