---
title: Sprawdź rysunek pomiarowy przy imporcie
summary: Odczytaj rzędne zapisane jako tekst lub w atrybutach bloków jako punkty pomiarowe i sprawdź DWG lub DXF pod kątem złych jednostek, braku układu współrzędnych, odległego początku układu, płaskich warstwic, dziwnych rzędnych i zdublowanych punktów, zanim zbudujesz z niego teren.
keywords: sprawdzenie pomiaru, sprawdzenie importu, rzędne pomiarowe, rzędne tekstowe, rzędne jako tekst, atrybuty, jednostki, układ współrzędnych, daleko od początku, warstwice na zero, wartości odstające, zduplikowane punkty, problemy, architekt krajobrazu, rysunek geodezyjny
from: d46acd24
---

Rysunek pomiarowy może wyglądać poprawnie i być błędny jako podstawa terenu: jego jednostki mogą być zgadywane, warstwice mogą leżeć płasko na wysokości 0, a rzędne mogą być zapisane jako tekst, który w ogóle nie jest geometrią. Sekcja **Rzędne pomiarowe i sprawdzenie** w oknie {{ui:Linie rysunku}} (zob. [Otwieranie DWG lub DXF jako linii rysunku](topic:open-dwg-dxf)) odczytuje te rzędne i mówi, co wygląda źle, zanim cokolwiek zostanie dodane.

## Rzędne zapisane jako tekst lub w atrybutach

Wiele rysunków pomiarowych podaje rzędną punktu jako mały tekst obok krzyżyka, np. `104.37` albo `EL 104.37`, albo jako atrybut punktu bloku. To nie są linie, więc czytnik linii je pomija. Sekcja podaje, ile ich znalazła, i pozwala wziąć je jako **punkty pomiarowe**:

1. Zaznacz **Weź … rzędne jako punkty pomiarowe**. Pole zaczyna niezaznaczone, bo nie każda liczba w rysunku jest wysokością.
2. Tekst jest czytany, gdy jest samą rzędną: liczbą z częścią dziesiętną (`104.37`, `+104,37`, `-3.50`) albo liczbą po `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` lub `LEVEL`, z opcjonalnym `m`, `ft` lub `'` za nią. Sama liczba całkowita (`12`) jest czytana jako numer działki lub arkusza, a nie rzędna; tekst typu `GATE 3` albo data nigdy nie jest czytany. Kody formatowania tekstu są ignorowane.
3. Dla atrybutów bloków wybierz **Atrybut bloku z rzędną**. CivilCraft sam znajduje znacznik o nazwie ELEV, Z, LEVEL, RL lub podobnej; wybierz inny z listy, jeśli rysunek używa własnego. Wybór jest zapamiętywany dla tej nazwy pliku na tym komputerze, więc ponowne otwarcie zaczyna od tego samego znacznika. Wybrany przez ciebie znacznik traktuje też liczby całkowite jako rzędne.
4. Kliknij {{ui:Dodaj}}. Punkty dostają numery po najwyższym numerze w projekcie, każdy jest opisany swoją warstwą (albo blokiem), a wysokości są przeliczane na jednostki projektu tak jak reszta rysunku. Całość to jeden krok: {{key:Mod+Z}} usuwa punkty.

Tekst leży w swoim punkcie wstawienia (albo w punkcie wyrównania, jeśli go ma). Tekst wewnątrz bloków nie jest czytany, a rysunek nigdy nie jest zmieniany.

## Sprawdzenie

Sprawdzenie działa na tym, co zamierzasz wczytać, i wymienia, co znajduje, po jednej linii dla każdego rodzaju problemu:

| Komunikat | Co to znaczy |
|---|---|
| **Nie podano jednostek** | Rysunek nie mówi, jakie ma jednostki, więc jego liczby są czytane jako jednostki projektu. Sprawdź jedną znaną ci odległość. |
| **Jednostki przeliczone** | Jednostki rysunku różnią się od projektu i są skalowane (uwaga, a nie błąd). |
| **Dane obejmują … km** lub **… m** | Zakres jest większy niż 200 km albo mniejszy niż pół metra, co zwykle oznacza złą jednostkę (milimetry odczytane jako metry albo odwrotnie). |
| **Brak układu współrzędnych** | Projekt go nie ma. To ostrzeżenie, gdy dane leżą daleko od zera, jak współrzędne państwowego układu płaskiego lub krajowej siatki. Zob. [Układy współrzędnych](topic:coordinate-systems). |
| **Daleko od początku układu** | Dane leżą ponad 100 km od zera. Daleko od zera widoki 3D i eksporty tracą precyzję i drgają. |
| **Warstwa warstwic … nie ma wysokości** | Warstwa nazwana jak warstwice (TOPO, CONT, CNTR, CONTOUR) zawiera linie na wysokości 0, więc teren zbudowany z nich byłby płaski. |
| **Rzędne równe 0** | Część rzędnych wynosi 0, podczas gdy typowa rzędna jest daleko od zera: prawdopodobnie brakuje wysokości. |
| **Rzędne daleko od reszty** | Kilka rzędnych leży daleko poza innymi (liczone względem środka wszystkich rzędnych, więc stromy teren o szerokim zakresie nie jest oznaczany), albo powyżej 9,000 m lub poniżej -11,000 m. |
| **Punkty na innym punkcie** | Dwa punkty w tym samym miejscu, o tej samej rzędnej albo o różnych rzędnych. |

Po kliknięciu {{ui:Dodaj}} te same linie trafiają do **Problemy**, po jednej dla każdego rodzaju, z nazwą pliku, abyś mógł do nich wrócić. Sprawdzenie ocenia rysunek; niczego w nim nie zmienia i nie blokuje użycia rysunku.

:::tip
Gdy sprawdzenie mówi, że warstwice są płaskie na 0, a są rzędne zapisane jako tekst, weź te rzędne jako punkty pomiarowe: często niosą prawdziwe wysokości, których brakuje liniom warstwic.
:::

## Czego się nie sprawdza

Sprawdzenie nie porównuje rysunku z drugim pomiarem i nie potrafi stwierdzić, w jakim układzie współrzędnych jest rysunek: mówi tylko, że żaden nie jest ustawiony.
