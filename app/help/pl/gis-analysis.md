---
title: Analiza warstw GIS
summary: Bufor, nakładanie (przecięcie, suma, wymazanie, rozpuszczenie), łączenie przestrzenne, wybór według atrybutu i pomiar warstw GIS w projekcie, każde jako nowa warstwa, którą można cofnąć.
keywords: gis, analiza, bufor, nakładanie, przecięcie, suma, wymazanie, przycinanie, rozpuszczenie, łączenie przestrzenne, łączenie, wybór według atrybutu, zapytanie, where, wyrażenie, statystyka, powierzchnia, długość, obwód, pomiar, działki, służebność, odległość od granicy, shapefile, geopackage, tabela atrybutów
from: a6b2d3f9
---

Gdy projekt ma warstwy GIS (zob. [Importuj dane GIS](topic:gis-import)), przycisk **Analizuj** w grupie GIS (wpisywany jako `GISANALYSIS`, `ANALYZE` lub `BUFFER`) otwiera panel z pięcioma kartami. Panel pozostaje otwarty obok planu, więc to, co zaznaczysz, jest rysowane na planie podczas pracy.

Każde narzędzie, które coś tworzy, **dodaje nową warstwę** i zostawia warstwy, z których korzystało, bez zmian. Każde z nich to jeden krok cofania: {{ui:Cofnij}} w panelu (albo Ctrl+Z) usuwa nową warstwę. Wynik wyeksportuj jak każdą warstwę, za pomocą [Eksport danych powykonawczych do GIS](topic:gis-export), jako shapefile, GeoJSON lub GeoPackage.

Pełna tabela warstwy, z sortowaniem, edycją i kalkulatorem pól, jest opisana w [Praca z tabelą atrybutów warstwy](topic:gis-table); kolorowanie według pola — w [Styl warstwy według atrybutu](topic:gis-symbology).

Wszystko wykonuje się na planie, w jednostkach projektu (stopy lub metry). Projekt zawsze używa układu rzutowego lub lokalnego, więc odległość 50 oznacza 50 stóp lub 50 metrów, nigdy stopnie. Wysokości (z) nie są zachowywane w wynikach.

## Bufor

Rysuje strefę o zadanej odległości wokół każdego obiektu, jako nową warstwę poligonową. Punkty stają się okręgami, linie — korytarzami z zaokrąglonymi końcami, poligony rosną. **Ujemna** odległość zmniejsza poligony (kwadrat 100 na 100 zmniejszony o 5 ma 90 na 90; zmniejszony o 60 nie zostaje nic, a panel to podaje). Odległość możesz wziąć z pola liczbowego, by każdy obiekt miał własną, albo zaznaczyć **Połącz wszystkie bufory w jeden kształt**, by je rozpuścić.

Zaokrąglone fragmenty są prostymi odcinkami wpisanymi w prawdziwą krzywą, więc bufor jest odrobinę mniejszy od dokładnego okręgu: około 0,6 % pola przy normalnym ustawieniu, 0,16 % przy ustawieniu Dokładne. Do wszystkiego, co będziesz mierzyć, używaj ustawienia Dokładne.

## Nakładanie

| Narzędzie | Co otrzymujesz |
|---|---|
| Przecięcie | Fragmenty, w których warstwa wejściowa spotyka poligony nakładki, każdy z polami obu warstw. Linie i punkty są przycinane do poligonów. |
| Suma | Obie warstwy poligonowe ścięte wzdłuż krawędzi drugiej: wspólne fragmenty mają pola obu warstw, pozostałe — pola jednej warstwy (pola drugiej są puste). |
| Wymazanie | Poligony wejściowe z wyjętymi poligonami nakładki. Pola zostają z warstwy wejściowej. Obiekt wymazany w całości jest pomijany (panel je liczy). |
| Rozpuszczenie | Scala poligony, które się stykają lub nakładają: wszystkie razem albo jeden kształt dla każdej wartości pola. Dodaje `COUNT` i `AREA`. |

Nazwa pola, które mają obie warstwy, zostaje zachowana dla pierwszej warstwy, a pole drugiej zapisuje się z `_2`. Obiekty wewnątrz jednej warstwy nie powinny się nakładać: jeśli się nakładają, Suma liczy nakładanie w obu warstwach.

## Łączenie

Łączenie przestrzenne kopiuje atrybuty z warstwy **źródłowej** na każdy obiekt **docelowy**, który się z nią styka, i daje nową warstwę o kształtach obiektów docelowych. Wybierz, kiedy się stykają: dotykając się lub nakładając, obiekt docelowy leży wewnątrz poligonu źródłowego, obiekt docelowy zawiera obiekt źródłowy, najbliższy obiekt źródłowy (z opcjonalnym limitem) albo dowolny obiekt źródłowy w zadanej odległości.

Gdy pasuje kilka obiektów źródłowych, bierzesz atrybuty pierwszego z nich (najbliższego — przy łączeniu z najbliższym i z odległością; dodawane jest `DISTANCE`) albo **zliczasz je i sumujesz ich pola liczbowe**: `COUNT` oraz `SUM_`, `MEAN_`, `MIN_`, `MAX_` dla każdego pola liczbowego. Odznacz **Zachowaj obiekty docelowe bez dopasowania**, by je pominąć. Dołączone pola są puste tam, gdzie nic nie pasowało, a panel liczy niedopasowane.

## Zaznacz

Wpisz pytanie o atrybuty lub kształt, naciśnij **Zaznacz**, a obiekty zostaną narysowane na planie wraz z liczbą, tabelą i łączną powierzchnią, długością lub liczbą. Potem możesz z nich zrobić osobną warstwę, powiększyć do nich widok albo wyczyścić zaznaczenie.

| Możesz napisać | Przykład |
|---|---|
| Pole po nazwie; użyj "cudzysłowów" lub [nawiasów kwadratowych], jeśli nazwa ma spacje | `VALUE`, `"Lot Number"` |
| Liczby, 'tekst', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (tekst bez względu na wielkość liter; w `like` znak `%` oznacza dowolny ciąg, a `_` jedną literę) | `Notes contains 'corner'` |
| `is null`, `is not null` (pusta wartość liczy się jako null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` i nawiasy | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Wartości kształtu `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Pytanie niepełne albo odwołujące się do pola, którego warstwa nie ma, zostaje odrzucone zdaniem, które wskazuje, gdzie jest problem.

## Pomiar

Pokazuje łączną powierzchnię i obwód, długość lub liczbę obiektów warstwy i **dodaje do niej pola**: `AREA` i `PERIMETER` dla poligonów, `LENGTH` dla linii (długość na planie), `X` i `Y` dla punktów. Istniejące pole nigdy nie zostaje nadpisane: nowe nazywa się `AREA_2`. To jeden krok cofania. **Statystyki** podają liczbę, sumę, średnią, minimum i maksimum pola liczbowego, opcjonalnie dla każdej wartości innego pola.

:::note
Sprawdzenia stojące za tymi narzędziami wykonuje się ręcznie w teście (`node bin/test-civilcraft-gisanalysis.mjs`): na przykład działki 100 na 100 pod strefą 100 na 80 przecinają się na 3,000 plus 3,000, a linia o długości 100, zbuforowana o 10, to 2,000 plus okrąg.
:::
