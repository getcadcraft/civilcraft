---
title: Praca z tabelą atrybutów warstwy
summary: Zobacz każdy obiekt warstwy GIS jako tabelę, sortuj i filtruj ją, zaznaczaj wiersze i obiekty razem, poprawiaj wartości, dodawaj pola, obliczaj nowe wartości i zapisz tabelę jako CSV.
keywords: tabela atrybutów, tabela, pola, kolumny, wiersze, sortowanie, filtr, wyrażenie, zaznaczanie, edycja, kalkulator pól, oblicz, dodaj pole, zmień nazwę pola, usuń pole, csv, eksport, gis, shapefile, geopackage, symbolika
from: fd9d6c11
---

Otwórz tabelę warstwy z menu **trzech kropek** na liście warstw GIS ({{ui:Tabela atrybutów…}}), z **Powierzchnia › Więcej › {{ui:Tabela atrybutów}}** albo wpisując `ATTRIBUTES`, `ATTTABLE` lub `TABLE`. Tabela otwiera się obok planu i pozostaje otwarta podczas pracy. Rysowane są tylko widoczne wiersze, więc warstwa z tysiącami obiektów otwiera się i przewija szybko.

## Sortowanie, filtrowanie i zaznaczanie

- **Sortowanie:** kliknij tytuł kolumny. Drugie kliknięcie odwraca kolejność, trzecie przywraca kolejność z pliku. Puste wartości zawsze zostają na dole. Sortowanie zmienia tylko to, co widzisz, nigdy samą warstwę.
- **Filtr:** wpisz w polu filtra. Wyrażenie, takie jak `AREA > 500 and USE = 'Res'`, zostawia wiersze, w których jest prawdziwe (te same słowa co w karcie Zaznacz w [Analizie warstw GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Coś, co nie jest wyrażeniem, takie jak `oak maple`, szuka tych słów w każdej kolumnie.
- **Zaznaczanie wierszy:** kliknij wiersz. Ctrl+kliknięcie dodaje lub usuwa jeden, Shift+kliknięcie zaznacza ciąg, a {{ui:Zaznacz pokazane wiersze}} bierze każdy wiersz, który przechodzi filtr. Zaznaczone obiekty są rysowane na planie, a kliknięcie obiektu na planie zaznacza tutaj jego wiersz.
- Przy zaznaczonych wierszach możesz {{ui:Powiększenie}} do nich, zrobić **warstwę z zaznaczenia** i odczytać łączną powierzchnię lub długość w wierszu stanu.

## Poprawianie wartości

Kliknij dwukrotnie komórkę (albo przejdź do niej strzałkami i naciśnij Enter), wpisz nową wartość i naciśnij Enter. Escape zostawia wartość bez zmian. Wartość musi pasować do kolumny: liczby jako liczby, daty jako `YYYY-MM-DD`, a tak/nie jako yes, no, true lub false. Wartość, która nie pasuje, jest odrzucana z komunikatem i nic się nie zmienia. Puste pole czyni wartość pustą. Każda edycja to jeden krok cofania: {{ui:Cofnij}} i {{ui:Ponów}} są na dole tabeli, a Ctrl+Z działa na planie.

## Pola

Pod **Pola** możesz dodać pole (tekst, liczbę, datę lub tak/nie), zmienić jego nazwę albo je usunąć. Nowe pole zaczyna puste. Zmiana nazwy idzie dalej: pole etykiety i [styl według atrybutu](topic:gis-symbology) warstwy przechodzą na nową nazwę, a usunięcie pola usuwa etykietę i styl, które z niego korzystały. Każde z tych działań to jeden krok cofania, który przywraca wszystko.

## Kalkulator pól

Zapisuje wartość w każdym wierszu (albo tylko w zaznaczonych) na podstawie pozostałych pól wiersza, jego geometrii i kilku funkcji. Wybierz istniejące pole albo **Nowe pole…** i podaj nazwę oraz typ. Nic nie jest uruchamiane jako kod: wyrażenie czyta mały parser z ustaloną listą funkcji.

| Grupa | Słowa |
|---|---|
| Liczby | `+ - * /`, nawiasy, `abs round(x, digits) floor ceil sqrt pow min max` |
| Tekst | `upper lower trim len substr(text, from, count) left right replace concat` (tekst w 'apostrofach'; nazwa pola ze spacjami w "cudzysłowach" lub [nawiasach kwadratowych]) |
| Wybór | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Daty | `year month day` z wartości w formacie `YYYY-MM-DD` |
| Geometria | `$area $perimeter $length $x $y $vertices`, w jednostkach projektu |

Wynik, którego nie da się zapisać w typie pola (tekst w polu liczbowym), zostaje pusty i jest liczony w komunikacie. Dzielenie przez zero daje wartość pustą. Na przykład `round($area / 43560, 2)` zapisuje akry z stóp kwadratowych.

## Eksport

{{ui:Eksportuj CSV}} zapisuje wiersze, które widzisz (po filtrze i sortowaniu), jako plik CSV w UTF-8 z nazwami pól w pierwszym wierszu. Tekst zaczynający się od `=`, `+`, `-` lub `@` dostaje wiodący apostrof, by arkusz kalkulacyjny nie uruchomił go jako formuły. Aby zapisać samą warstwę, użyj [Eksportu danych powykonawczych do GIS](topic:gis-export).

## Ograniczenia

Tabela pokazuje warstwę w jednej kolejności sortowania i z jednym filtrem naraz. Wierszy nie można tu dodawać ani usuwać (zamiast tego zrób nową warstwę z zaznaczenia), geometria nie jest edytowana, a typ pola nie może być zmieniony po jego utworzeniu.
