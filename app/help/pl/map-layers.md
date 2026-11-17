---
title: Pokaż warstwy mapy pod planem
summary: Umieść zgeoreferencjonowany obraz, kafelki map, serwer WMS lub WMTS albo usługę map pod planem jako kontekst terenu, z ustawieniem internetu, kryciem, kolejnością i atrybucją.
keywords: warstwy mapy, podkład mapowy, tło, zdjęcie lotnicze, ortofotomapa, zdjęcia satelitarne, raster, plik świata, pgw, jgw, tfw, wld, geotiff, obraz zgeoreferencjonowany, xyz, kafelki, mapa kafelkowa, wms, wmts, getcapabilities, usługa map, rest, mapserver, imageserver, usgs, national map, atrybucja, krycie
from: 32d7718e
---

Warstwy mapy to obrazy rysowane pod projektem: zdjęcie lotnicze z plikiem świata albo mapy z serwerów w internecie. Są kontekstem terenu tylko na ekranie: **nie** trafiają do wydruków PDF, eksportów DXF ani DWG ani do widoku 3D.

Wybierz {{ui:Mapa}} w grupie {{ui:GIS}}. Okno dialogowe **Warstwy mapy** wypisuje warstwy projektu i dodaje nowe. Warstwy mapy wymagają układu współrzędnych projektu ([Ustaw układ współrzędnych projektu](topic:coordinate-systems)), z wyjątkiem obrazu, którego plik świata używa współrzędnych samego projektu.

## Ustawienie internetu

CivilCraft nigdy nie pyta serwera map o nic, dopóki na to nie pozwolisz: {{ui:Ustawienia}}, {{ui:CivilCraft}}, **Warstwy mapy z internetu**: **Wyłączone** (na starcie) albo **Włączone**.

:::note
Po włączeniu CivilCraft pyta dodane przez Ciebie serwery map o obrazy obszaru na ekranie. Rysunek zostaje na tym komputerze; serwer widzi obszar i Twój adres internetowy.
:::

Gdy opcja jest wyłączona, warstwy internetowe są wypisane w oknie, ale wyszarzone, z podaniem przyczyny, a nic nie jest rysowane ani pobierane. Otwarcie projektu, który wskazuje serwery map, też ich nie wywołuje. Obraz z pliku działa w obu przypadkach. Przycisk {{ui:Otwórz Ustawienia}} w oknie prowadzi tam wprost.

## Zgeoreferencjonowany obraz (działa offline)

1. W **Dodaj warstwę** pozostaw **Zgeoreferencjonowany obraz** i wybierz pliki: obraz (PNG lub JPEG) **razem z** jego plikiem świata (`.pgw` dla PNG, `.jgw` dla JPEG albo `.wld`) oraz, jeśli istnieje, jego `.prj`. Można też upuścić je razem na plan.
2. Bez `.prj` CivilCraft pyta, z jakiego układu korzysta plik świata: {{ui:Układ projektu}} (najczęstszy), {{ui:Wybierz układ…}} albo, w projekcie bez układu, **Współrzędne projektu**.
3. Obraz pojawia się pod planem, a {{ui:Dopasuj}} go uwzględnia.

RGB GeoTIFF (zdjęcie lotnicze zapisane jako GeoTIFF) niesie własne położenie i układ: otwórz go samodzielnie. Obraz jest zapisywany **w pliku projektu** (do 25 MB); większy jest odrzucany z podaniem rozmiaru, więc zapisz mniejszą kopię (mniej pikseli albo JPEG).

## Kafelki, WMS, WMTS i usługi map

Najpierw włącz **Warstwy mapy z internetu**. Następnie w **Dodaj warstwę**:

| Źródło | Co wkleić | Co robi CivilCraft |
|---|---|---|
| Adres kafelków | Szablon z `{z}`, `{x}` i `{y}` (albo `{-y}`) oraz `{s}` dla litery serwera, na przykład `https://tile.example.org/{z}/{x}/{y}.png`. Podaj nazwę i jej atrybucję. | Kafelki w projekcji web Mercator dla obszaru i powiększenia na ekranie. |
| Serwer WMS | Adres serwera albo jego link GetCapabilities. Wybierz {{ui:Pobierz warstwy}}, a potem warstwę. | Jeden obraz obszaru na ekranie, żądany w kodzie EPSG projektu, gdy serwer go oferuje; w przeciwnym razie w web Mercator lub WGS 84. |
| Serwer WMTS | Adres serwera albo jego `WMTSCapabilities.xml`. Wybierz {{ui:Pobierz warstwy}}, potem warstwę i zestaw macierzy kafelków. | Kafelki z zestawu w układzie projektu, gdy jest, w przeciwnym razie web Mercator. |
| Usługa map ArcGIS (REST) | Adres kończący się na `/MapServer` lub `/ImageServer`. Wybierz {{ui:Odczytaj usługę}}. | Usługi web Mercator z pamięcią podręczną są rysowane z kafelków; pozostałe są pytane o jeden obraz obszaru na ekranie. |

Żaden serwer nie jest ustawiony z góry. Publiczne przykłady, wszystkie z USGS National Map (domena publiczna):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Usługa map: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (także `USGSImageryOnly` dla zdjęć lotniczych)

Wiele wydziałów GIS miast i powiatów publikuje własne WMS lub usługi map; ich strony GIS podają adres. Serwer, który żąda logowania albo klucza, nie działa: CivilCraft nie wysyła nazw użytkowników, haseł ani kluczy.

## Jak rysowane są warstwy

- Obrazy w innym układzie niż projektu są przekształcane do niego: obraz jest cięty na kawałki, każdy ustawiony tak, by był w odległości ćwierci piksela ekranu od miejsca, w którym dokładna konwersja go umieszcza.
- Kafelki są wybierane dla obszaru na ekranie i powiększenia: nigdy więcej niż 64 na widok, po 6 naraz. Przy przesuwaniu lub powiększaniu żądania dla starego widoku są anulowane. Około 200 kafelków jest trzymanych w pamięci (nic nie jest zapisywane na dysku).
- Obraz WMS lub usługi map jest pobierany, gdy widok przestanie się przesuwać; do czasu jego nadejścia pozostaje poprzedni.
- Atrybucja każdej warstwy na ekranie jest wyświetlana małą czcionką w prawym dolnym rogu planu.

## Zmiana, kolejność i usuwanie warstw

W oknie każda warstwa ma pole wyboru do pokazania lub ukrycia, suwak **Krycie**, strzałki do rysowania wcześniej (niżej) lub później (wyżej), przycisk powiększenia (obrazy) i przycisk usunięcia. Pierwsza warstwa na liście jest rysowana na dole. Każda zmiana to jeden krok cofnięcia.

## Gdy warstwa nic nie pokazuje

Przyczyna pojawia się raz w wierszu stanu i pozostaje pod nazwą warstwy w oknie:

| Komunikat | Co zrobić |
|---|---|
| Wyłączone: warstwy map z internetu są wyłączone w Ustawieniach. | Włącz **Warstwy mapy z internetu**. |
| Wymaga układu współrzędnych projektu | Ustaw go w {{ui:Współrzędne}}. |
| Serwer nie zezwolił tej stronie na użycie jego obrazów (CORS) albo nie udało się go osiągnąć. | Serwer nie pozwala stronom internetowym używać jego obrazów albo jest niedostępny. Po czterech odmowach CivilCraft przestaje pytać; ukryj i pokaż warstwę, by spróbować ponownie. |
| Serwer odpowiedział 404 … / Serwer wysłał text/xml, a nie obraz: … | Adres URL, warstwa lub styl są błędne, albo komunikat serwera mówi, czego chce. |
| Ta warstwa nie jest oferowana w układzie projektu, web Mercator ani WGS 84 | Serwer nie może narysować w miejscu, w którym CivilCraft może ją umieścić. |

## Co sprawdzono

- Numery kafelków sprawdzono ze standardowym podziałem web Mercator; odpowiedzi WMS 1.1.1 i 1.3.0, WMTS oraz usług map odczytano z ręcznie pisanych plików oraz z prawdziwych odpowiedzi zapisanych z USGS National Map i serwerów terrestris OpenStreetMap; żądania WMS 1.3.0 podają szerokość geograficzną jako pierwszą dla EPSG:4326, zgodnie z normą.
- Przekształcanie obrazów porównano z dokładną konwersją piksel po pikselu przy użyciu wartości PROJ: w granicach 0,13 px dla kafelków, obrazów WMS i obrazu wielkości powiatu, w skali terenu i przy oddaleniu.
- Obraz z plikiem świata oraz RGB GeoTIFF zapisany przez GDAL (przez rasterio) były rysowane tam, gdzie wskazuje ich położenie, sprawdzone piksel po pikselu w przeglądarce.
- W przeglądarce, przy zastępczym serwerze na komputerze testowym: kafelki trafiają w kafel, w który PROJ umieszcza każdy punkt; obraz WMS trafia w odległości do 2 px; co najwyżej 6 żądań działa naraz, a przy wyłączonym ustawieniu żadne żądanie nie opuszcza strony. Usługa map USGS National Map opisana wyżej została też raz odczytana i narysowana na żywo w przeglądarce (jej kafelki dotarły i zostały narysowane wraz z tekstem praw autorskich); pozostałe publiczne serwery odczytano tylko z zapisanych odpowiedzi.
