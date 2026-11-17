---
title: Formaty plików punktów
summary: Kolejność kolumn, jaką odczytuje CivilCraft, sposób wykrywania separatora i wiersza nagłówka, rozpoznawane nazwy nagłówków oraz sposób sprawdzania wierszy.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format pliku punktów, kolumny, nagłówek, separator
from: 84fab42e
---

Plik punktów to zwykły tekst, jeden punkt w wierszu. CivilCraft odczytuje go w przeglądarce; nic nie jest przesyłane.

## Kolejność kolumn

Litery nazywają kolumny od lewej do prawej: **P** numer lub nazwa punktu, **N** northing (współrzędna północna), **E** easting (współrzędna wschodnia), **Z** rzędna, **D** opis.

| Kolejność | Kolumny | Przykładowy wiersz |
|---|---|---|
| PNEZD | punkt, północ, wschód, rzędna, opis | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punkt, wschód, północ, rzędna, opis | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punkt, północ, wschód, rzędna | `101,2080000.00,6150000.00,250.00` |
| PENZ | punkt, wschód, północ, rzędna | `101,6150000.00,2080000.00,250.00` |
| NEZD | północ, wschód, rzędna, opis | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | wschód, północ, rzędna, opis | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | północ, wschód, rzędna | `2080000.00 6150000.00 250.00` |
| ENZ | wschód, północ, rzędna | `6150000.00 2080000.00 250.00` |

Kolejności bez P numerują punkty 1, 2, 3 … w kolejności pliku. X to wschód, a Y to północ.

## Separatory

CivilCraft patrzy na pierwsze 20 wierszy i wybiera pierwszy z tych znaków, który pojawia się w co najmniej 60% z nich: przecinek, tabulator, średnik. W przeciwnym razie dzieli wiersze na ciągi spacji.

- W plikach z przecinkiem, tabulatorem i średnikiem pole w cudzysłowach może zawierać separator (`"FL, NORTH"`), a `""` wewnątrz cudzysłowów to jeden znak cudzysłowu.
- W plikach rozdzielanych spacjami opis na końcu wiersza może zawierać spacje: wszystko po ostatniej kolumnie współrzędnych jest opisem.
- Wiersze zaczynające się od `#`, `;` lub `//` oraz puste wiersze są pomijane.
- Znacznik kolejności bajtów na początku pliku jest ignorowany.

## Wiersz nagłówka

Pierwszy wiersz traktowany jest jako nagłówek, gdy mniej niż dwa jego pola są liczbami. Gdy każde pole nagłówka to nazwa rozpoznawana przez CivilCraft, kolejność kolumn pochodzi z niego („z wiersza nagłówka”). Nazwy są dopasowywane bez względu na wielkość liter, spacje, kropki, podkreślenia, myślniki i nawiasy:

| Kolumna | Rozpoznawane nazwy |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Jeśli jakakolwiek nazwa w nagłówku nie jest rozpoznawana albo nazwy nie tworzą jednej z ośmiu kolejności, nagłówek jest pomijany, a kolejność jest zgadywana z liczby kolumn.

:::warning
Nagłówek, który nazywa zarówno kolumnę szerokości geograficznej (`lat`, `latitude`), jak i długości geograficznej (`lon`, `long`, `longitude`), jest odczytywany jako stopnie, a nie jako północ i wschód. Przy {{ui:Import}} punkty są przeliczane przez układ współrzędnych projektu, a projekt bez układu najpierw prosi o jego wybranie. Wiersze spoza ±90° szerokości lub ±180° długości są odrzucane. Zobacz [Import danych GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Zgadywanie z liczby kolumn

Bez użytecznego nagłówka i przy **Kolumny** pozostawionym na {{ui:Wykryj}}:

- 5 lub więcej kolumn: PNEZD.
- 4 kolumny: PNEZ, gdy pierwsza kolumna jest liczbą całkowitą we wszystkich próbkowanych wierszach, a czwarta jest liczbą; w przeciwnym razie NEZD.
- 3 kolumny: NEZ.

PNEZD i PENZD nie dają się odróżnić po samych liczbach. Zgadywanie podąża za **Wiersze punktów** w [Ustawieniach CivilCraft](topic:settings): P, N, E, Z, D na początku albo P, E, N, Z, D (wtedy cztery kolumny są odczytywane jako PENZ, a trzy jako ENZ). Okno dialogowe mówi: „zgadnięto z liczby kolumn — sprawdź, czy północ i wschód nie są zamienione”. Jeśli podgląd wygląda źle, wybierz właściwą kolejność w **Kolumny**.

## Sprawdzanie wierszy

- Wiersz może nie mieć opisu.
- Północ i wschód muszą być liczbami. Rzędna może być pusta (punkt jest zachowany, ale nie jest używany w powierzchni).
- Numer punktu może być dowolnym tekstem (także z literami, na przykład `CP1`), ale nie może być pusty.
- Jeśli numer punktu się powtarza, zachowywany jest pierwszy wiersz, a pozostałe są wymieniane jako nieodczytane.
- Opisy są zachowywane do 200 znaków; znaki sterujące stają się spacjami.
- Do 200 nieodczytanych wierszy jest zachowywanych dla okna dialogowego (pokazywanych jest 25), a wszystkie są liczone.

## Grupy punktów

Grupą punktu jest pierwsze słowo jego opisu zapisane wielkimi literami. „GRD”, „grd shot” i „Grd” należą wszystkie do grupy GRD. Punkt bez opisu znajduje się w grupie „(brak opisu)”. Zobacz [Import punktów geodezyjnych](topic:import-points).

## Zapis punktów

CivilCraft nie eksportuje jeszcze pliku tekstowego punktów. Punkty wychodzą w formacie LandXML (jako CgPoints), w pliku projektu oraz przez {{ui:Eksport}} GIS jako shapefile, GeoPackage lub GeoJSON z polami P, N, E, Z i D ([Eksport danych powykonawczych do GIS](topic:gis-export)). Zobacz [Jeszcze nie zbudowano](topic:not-built-yet).
