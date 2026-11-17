---
title: Zaznaczaj, kopiuj i wklejaj punkty pomiarowe
summary: Zaznaczaj punkty pomiarowe kliknięciem, Shift i prostokątem albo wszystkie naraz; kopiuj, wycinaj, wklejaj, wklejaj w miejscu, duplikuj i usuwaj je z nowymi numerami, które nigdy się nie zderzają; wklejaj wiersze punktów do i z arkusza kalkulacyjnego.
keywords: kopiuj, wklej, wytnij, duplikuj, usuń punkty, zaznacz punkty, zaznacz wszystko, zaznaczenie prostokątem, okno, schowek, arkusz kalkulacyjny, csv, przenumeruj, numery punktów, wklej w miejscu, klon, tyczenie
from: 78a6aea7
---

Punkty pomiarowe można kopiować i wklejać w obrębie projektu, między projektami w dwóch kartach przeglądarki oraz do i z arkusza kalkulacyjnego. Każda zmiana to jeden krok cofania, a powierzchnia od razu przebudowuje się z nowych punktów.

## Zaznacz punkty

Przy {{ui:Select}} ({{key:V}}):

- **Kliknij** punkt, aby go zaznaczyć (i tylko go). Jego numery pokazują się we **Właściwościach**.
- {{key:Shift}} i **kliknięcie** dodaje punkt do zaznaczenia albo go z niego usuwa.
- {{key:Shift}} i **przeciągnięcie** rysuje prostokąt: punkty w jego środku są dodawane do zaznaczenia. Jeśli zamiast tego przeciągniesz dookoła punktów, powstaje lasso; zob. [Zaznaczanie punktów lassem](topic:lasso-selection). Przeciągnięcie bez {{key:Shift}} przesuwa widok, jak zawsze.
- {{key:Mod+A}} (lub {{ui:More}} › {{ui:Select all points}}) zaznacza każdy punkt.
- {{key:Esc}} (lub {{ui:More}} › {{ui:Select none}}) czyści zaznaczenie.

Zaznaczone punkty mają pierścień. Gdy zaznaczonych jest więcej niż jeden, **Właściwości** pokazują ich liczbę, numery, zakres rzędnych i grupy.

## Kopiuj, wytnij i usuń

- {{ui:Copy}} lub {{key:Mod+C}} kopiuje zaznaczone punkty. CivilCraft zachowuje kopię i umieszcza ją także w schowku systemowym jako wiersze punktów, więc możesz wkleić ją od razu do arkusza kalkulacyjnego lub pliku tekstowego.
- {{ui:More}} › {{ui:Cut}} lub {{key:Mod+X}} kopiuje je i usuwa w jednym kroku.
- {{ui:More}} › {{ui:Delete}} lub {{key:Delete}} usuwa je. {{key:Mod+Z}} je przywraca.

Wiersze mają postać: punkt, północ, wschód, rzędna, opis (P,N,E,Z,D), oddzielone przecinkami, z trzema miejscami po przecinku. Aby wschód był przed północą, ustaw **Wiersze punktów** w [Ustawieniach CivilCraft](topic:settings). Opis, który arkusz potraktowałby jako formułę (zaczynający się od =, +, - lub @), dostaje z przodu apostrof, aby pozostał tekstem.

## Wklej

1. Naciśnij {{key:Mod+V}} lub kliknij {{ui:Paste}}. Punkty podążają za kursorem jako małe krzyżyki, z przerywaną linią prowadzącą do miejsca, z którego pochodzą.
2. Kliknij, gdzie mają trafić. Środek skopiowanych punktów ląduje w miejscu kliknięcia.
3. Albo naciśnij {{key:Enter}}, aby umieścić je we własnych współrzędnych, lub {{key:Esc}}, aby anulować.

{{ui:More}} › {{ui:Paste in place}} lub {{key:Mod+Shift+V}} wkleja punkty od razu, we własnych współrzędnych. Wklejone punkty są potem zaznaczone, więc możesz je znów skopiować, przesunąć lub usunąć.

:::note
Kliknięcie {{ui:Paste}} na pasku narzędzi odczytuje schowek systemowy. Za pierwszym razem przeglądarka może zapytać, czy CivilCraft może zobaczyć schowek. Jeśli odmówisz, przycisk na pasku wkleja tylko własną kopię CivilCraft; {{key:Mod+V}} nadal wkleja wiersze z arkusza bez pytania.
:::

## Numery punktów nigdy się nie zderzają

Dwa punkty nigdy nie mają tego samego numeru. Przy wklejaniu:

- Wklejony punkt zachowuje swój numer, gdy żaden punkt w projekcie go nie ma. Więc po **Wytnij** punkty wklejają się z własnymi numerami, a punkty skopiowane z innego projektu zachowują swoje, jeśli są wolne.
- Wklejony punkt, którego numer jest zajęty, dostaje nowy numer całkowity: o jeden większy od najwyższego używanego, liczony w górę.
- Pasek stanu mówi, co się stało, na przykład „1 punkt zachował swój numer; 9 punktów dostało nowe numery: 10–18 zmieniono na 277–285”.

W [Ustawieniach CivilCraft](topic:settings) możesz wybrać **Zawsze nowe numery** oraz numer, od którego nowe numery mają się zaczynać, na przykład 5000 dla punktów projektowych.

:::warning
Grupy punktów, które budują powierzchnię jako **linię przełamania**, łączą punkty w kolejności numerów. Wklejone kopie punktów linii przełamania (na przykład pomiary FL) dostają nowe, wyższe numery i dołączają się do końca tej linii, być może z długim skokiem. Sprawdź plan po wklejeniu takich punktów albo ustaw ich grupę na {{ui:Points}}.
:::

## Duplikuj

{{ui:More}} › {{ui:Duplicate}} lub {{key:Mod+D}} tworzy kopię zaznaczonych punktów, która podąża za kursorem: kliknij, gdzie ma trafić. Kopie zawsze dostają nowe numery, a schowek CivilCraft pozostaje bez zmian.

## Z arkusza kalkulacyjnego lub pliku tekstowego

Zaznacz wiersze punktów w arkuszu (punkt, północ, wschód, rzędna, opis) i skopiuj je. W CivilCraft naciśnij {{key:Mod+V}} i kliknij, gdzie mają trafić, albo naciśnij {{key:Mod+Shift+V}}, aby umieścić je we własnych współrzędnych, co zwykle jest tym, czego chcesz przy prawdziwych danych pomiarowych.

Wiersze są czytane dokładnie tak jak [plik punktów](topic:point-file-formats): przecinki, tabulatory lub spacje, wiersz nagłówka, jeśli jest. Bez nagłówka kolejność kolumn pochodzi z **Wiersze punktów** w [Ustawieniach CivilCraft](topic:settings).

Gdy oba są obecne, CivilCraft decyduje według tego, co jest nowsze: wiersze w schowku systemowym, różniące się od ostatniej kopii CivilCraft, zostały skopiowane później, więc są wklejane. Tekst niezawierający punktów jest ignorowany, a zamiast niego wklejana jest własna kopia CivilCraft.

## Między projektami i kartami

Kopia jest przechowywana w tej przeglądarce, więc druga karta CivilCraft może ją wkleić, nawet po zamknięciu pierwszej. Punkty skopiowane w projekcie w metrach i wklejone do projektu w stopach zachowują swoje numery bez zmian: nic nie jest przeliczane, a pasek stanu to mówi.

## Czego nie kopiuje się

Na razie kopiowane są tylko punkty pomiarowe. Trasy (osie), place, sieci rurociągów, linie przełamań i granice nie mogą być jeszcze kopiowane ani wklejane. Wklejanie nie może przesunąć istniejących punktów: użyj {{ui:Cut}} i wklej, albo przesuń po jednym punkcie ([Edytuj punkt pomiarowy](topic:edit-points)).
