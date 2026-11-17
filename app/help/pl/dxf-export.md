---
title: Eksport rzutu do DXF
summary: Zapisz linie rzutu jako DXF R12 na nazwanych warstwach, z warstwicami na ich rzędnych i liniami przełamania w 3D, dla dowolnego programu CAD.
keywords: dxf, dwg, cad, eksport, linie rysunkowe, r12, 2000, 2004, 2007, 2010, 2013, 2018, warstwy, warstwice, wymiana rysunków, podkład mapowy, tło
from: f2d8ede9
---

{{ui:DXF}} zapisuje to, co pokazuje rzut, jako plik DXF w formacie R12, czyli w wersji, którą otworzy każdy program CAD. Jeśli korzystasz z AutoCAD lub Civil 3D, otwórz go lub wstaw tak samo jak dowolny plik DXF.

## Eksport

1. Ustaw rzut tak, jak chcesz mieć rysunek: w sekcji **Wyświetlanie** wybierz powierzchnię (istniejącą lub projektowaną), interwał warstwic oraz to, co ma być włączone (warstwice, etykiety, punkty, etykiety punktów, trójkąty, linie przełamania, krawędź powierzchni, rurociągi, strzałki spadku).
2. Kliknij {{ui:DWG/DXF}} w grupie **Eksport** i wybierz {{ui:DXF (R12, tekst) — zwykły plik wymiany}}, a następnie {{ui:Pobierz}}.
3. Przeglądarka pobiera plik `<name>.dxf`. Pasek stanu pokazuje na przykład: "Wyeksportowano R12 DXF: 2,140 obiektów; etykiety dopasowane do 1" = 40'. Pasma nie są eksportowane."

Współrzędne są zapisywane w jednostkach projektu, w ich rzeczywistych wartościach (współrzędne układu płaskiego pozostają bez zmian). Nic nie jest skalowane ani przesuwane.

## Zawartość pliku

| Element | Obiekt DXF | Warstwa |
|---|---|---|
| Warstwice pomocnicze i główne | Polilinie 2D na swojej rzędnej | C-TOPO-MINR, C-TOPO-MAJR |
| Etykiety warstwic | Tekst | C-TOPO-TEXT |
| Trójkąty | Polilinie | C-TOPO-TINN |
| Linie przełamania i granica | Polilinie 3D | C-TOPO-BRKL |
| Krawędź powierzchni | Polilinie | C-TOPO-BNDY |
| Strzałki spadku | Polilinie | C-TOPO-SLOP |
| Punkty pomiarowe i ich etykiety | Punkty (z rzędną), tekst | V-NODE, V-NODE-TEXT |
| Linie z kodów linii | Polilinie 3D | V-NODE-LINE |
| Osie tras | Linie i łuki | C-ROAD-CNTR |
| Znaczniki i etykiety kilometrażu | Polilinie, tekst | C-ROAD-STAN |
| Krawędzie korytarza | Polilinie | C-ROAD-CORR |
| Linie przekroju | Polilinie | C-ROAD-SCTN |
| Place, linie daylight, linie spadku | Polilinie | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Linie charakterystyczne | Polilinie 3D (łuki jako odcinki w odległości do 0.01 od łuku; zob. [Linie charakterystyczne](topic:feature-lines)) | C-GRAD-FEAT |
| Ścieżki przejazdu | Polilinie, tekst | C-ROAD-SWPT |
| Rurociągi, budowle, etykiety | Polilinie, tekst | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Rurociągi i budowle z problemami | Polilinie | C-STRM-PROB |

Każda warstwa ma kolor. Pełna lista znajduje się w [Warstwy rzutu](topic:plan-layers).

## Rozmiar etykiet

Tekst musi mieć rozmiar w jednostkach rysunku. CivilCraft dobiera rozmiar etykiet do skali, w której cały rzut mieści się na arkuszu Tabloid (stopy) lub arkuszu A3 (metry), i podaje tę skalę w komunikacie na pasku stanu. Jeśli drukujesz w innej skali w programie CAD, przeskaluj tam tekst.

## Czego nie eksportuje

- Pasma rzędnych (tylko na ekranie).
- Widok profilu. Profile są wysyłane jako LandXML, a nie jako rysunek.
- Sama powierzchnia jako obiekt 3D. Użyj LandXML dla TIN albo włącz {{ui:Trójkąty}}, aby uzyskać jej krawędzie jako linie.
- Wszystko, co wyłączysz w sekcji **Wyświetlanie**.

## DWG

{{ui:DWG/DXF}} zapisuje te same linie jako rysunek DWG. Jego okno pyta o format: DXF albo DWG w wersji 2000, 2004, 2007, 2010, 2013 lub 2018. Wersja 2000 otworzy się w prawie każdym programie CAD, zarówno starym, jak i nowym; wybierz nowszą, gdy odbiorca rysunku o nią poprosi. Twój wybór jest zapamiętywany w tej przeglądarce.

1. Kliknij {{ui:DWG}} w grupie **Eksport**.
2. Wybierz **Format** i kliknij **Pobierz DWG**.
3. Przeglądarka pobiera plik `<name>.dwg`. Pasek stanu informuje, co zostało zapisane, na przykład "Wyeksportowano DWG (format 2018): 12 polilinii, 40 etykiet na 9 warstwach".

DWG ma te same warstwy, kolory, warstwice (jako polilinie na swojej rzędnej), linie przełamania 3D, etykiety i punkty co DXF, w tych samych współrzędnych. Nazwy warstw, których DWG nie może przechować, są zmieniane, a pasek stanu o tym informuje. CivilCraft zapisuje DWG własnym kodem, więc nic nie opuszcza twojego komputera.

### Warstwy mapy w DWG

Rysunek DWG nie może zawierać obrazu wewnątrz siebie: programy CAD pokazują obraz leżący obok rysunku. Gdy widoczne są warstwy mapy, okno oferuje **Warstwy mapy jako obraz obok rysunku**. Po zaznaczeniu tej opcji pobierany jest plik `.zip` zawierający `<name>.dwg`, `<name>-map.png` (warstwy mapy nad całym rysunkiem, do 4,096 pikseli szerokości) i `<name>-map.pgw` (plik świata dla programów GIS). Rysunek pokazuje obraz jako grafikę na warstwie G-MAP-IMAG, we właściwym miejscu. Rozpakuj pliki do jednego folderu i trzymaj je razem.
