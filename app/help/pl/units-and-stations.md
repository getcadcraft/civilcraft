---
title: Jednostki, kilometraże i formaty liczb
summary: Projekty w stopach i metrach, sposób zapisu i wpisywania kilometraży, spadków, skarp, kierunków, pól, objętości i średnic rur oraz skutki zmiany jednostek.
keywords: wpisywanie długości, arytmetyka, kalkulator, suma, ułamek, stopy i cale, 4+7/16, jednostki, stopy, stopy US survey, metry, metryczne, imperialne, format kilometrażu, kilometraż, spadek, procent, skarpa, h:v, kierunek, jardy sześcienne, średnica
from: 0b9b5b6b
---

## Jednostki projektu

Projekt jest w **US feet** albo w **metrach** (**Jednostki** w lewym panelu). Każda współrzędna, rzędna, długość i kilometraż w projekcie są w tej jednostce.

:::warning
Zmiana **Jednostek** zmienia etykiety, format kilometrażu, wartości domyślne i sposób zapisu plików. **Nie** przelicza ona żadnej liczby. Teren zmierzony w stopach i przełączony na metry zachowuje te same liczby, które są teraz odczytywane jako metry. Pasek stanu mówi: "Jednostki to teraz metry. Współrzędne nie zostały przeliczone." Ustaw jednostki zgodnie ze swoimi danymi, zanim zaczniesz projektować.
:::

Na co wpływają jednostki:

| | US feet | Metry |
|---|---|---|
| Format kilometrażu | `12+34.56` (kilometraż co 100 ft) | `1+234.567` (kilometraż co 1000 m) |
| Dostępne odstępy poziomic | od 0.25 do 20 ft | od 0.1 do 10 m |
| Pole | sq ft | sq m |
| Objętość | cu yd | cu m |
| Średnica rur i budowli | cale | milimetry |
| Domyślny promień łuku | 100 ft | 30 m |
| Podziałka kilometrażu na planie | co 50 ft, podpisy co 100 ft | co 20 m, podpisy co 100 m |
| Skale wydruku | 1" = 5' do 1" = 1000' | 1:50 do 1:10000 |
| Jednostka liniowa LandXML | USSurveyFoot | meter |

Nowy projekt zaczyna się w stopach albo, gdy jednostka długości zaznaczona gwiazdką w {{ui:Ustawienia}} › {{ui:Ogólne}} › {{ui:Jednostki}} jest metryczna, w metrach. Lista **Jednostki** pokazuje jednostki włączone tam oraz zawsze własne jednostki projektu. Gdy tam zaznaczona jest jednostka powierzchni lub objętości (akry, hektary, akro-stopy …), pola i objętości są podawane w niej zamiast w kolumnie powyżej. Zobacz [Jednostki, wpisywane wartości i listy jednostek](common:unit-lists).

Po otwarciu LandXML projekt przejmuje jednostki pliku. Plik w międzynarodowych stopach otwiera się jako projekt w stopach; liczby nie są zmieniane.

## Wpisywanie długości i sum

Każde pole przyjmujące długość lub rzędną odczytuje więcej niż zwykłą liczbę: naciśnij {{key:Enter}}, a pole pokaże wynik w jednostkach projektu.

| Wpisujesz | W projekcie w stopach | W projekcie w metrach |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | te same długości w metrach |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | w stopach | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, a pozostałe w stopach US survey | te same długości w metrach |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | suma, w stopach | suma, w metrach |

Działa każdy znacznik długości ze wspólnej tabeli jednostek, o dokładnej wielkości: stopy projektu to stopy US survey, więc `10 US ft` to 10, a `3 ch` (łańcuch w stopach międzynarodowych) to 197.9996. Używaj `+ - * /` i nawiasów oraz `abs`, `round`, `ceil` i `floor`. Myślnik wpisany w długości jest jej częścią (`24'-6"`, `6-1/2`); ze spacjami wokół oznacza odejmowanie (`24' - 6"` = 23.5 ft). Zwykła liczba mnoży lub dzieli długość, a po dodaniu do długości jest długością w jednostkach projektu. Jeśli CivilCraft nie może odczytać tego, co wpisano, pole zostaje oznaczone, a pasek stanu mówi, gdzie jest błąd.

Kilometraże nie są sumami: `10+00` w polu kilometrażu to kilometraż 10+00. Spadki w procentach, numery punktów i opisy są odczytywane tak, jak są.

## Kilometraż

Kilometraż to odległość wzdłuż trasy, zapisywana ze znakiem plus:

- Stopy: część przed plusem to setki stóp. `12+34.56` to 1,234.56 ft.
- Metry: część przed plusem to tysiące metrów. `1+234.567` to 1,234.567 m.
- Ujemne kilometraże zachowują znak z przodu: `-0+50.00`.

Wszędzie tam, gdzie wpisujesz kilometraż (**Kilometraż początkowy**, **Kilometraż** PVI), możesz wpisać go z plusem (`12+34.56`) albo jako zwykłą liczbę (`1234.56`). Spacje są ignorowane.

## Spadki i skarpy

- **Spadki** (profile, rurociągi, spadki pasa i pobocza) są w procentach: `+1.25%` to wzrost w kierunku rosnącego kilometrażu, `-0.50%` spadek.
- **Skarpy boczne** (wykop i nasyp placu, wykop i nasyp korytarza) podawane są jako poziomo do pionowo: `3` oznacza 3 : 1, czyli trzy w poziomie na jeden w pionie, w górę lub w dół.
- **K** dla łuku pionowego to jego długość podzielona przez zmianę spadku w procentach.

## Kierunki i kąty

Kierunki to kierunki ćwiartkowe w stopniach, minutach i sekundach: `N 63°12'05" E`. Kąty zwrotu łuków (Δ) używają tych samych stopni, minut i sekund, z oznaczeniem "lewo" lub "prawo".

## Odsunięcia

Odsunięcia od trasy to odległości prostopadłe do niej, oznaczone **L** (lewe) albo **R** (prawe), patrząc w kierunku rosnącego kilometrażu.

## Wyświetlanie liczb

- Współrzędne i rzędne pokazują 2 miejsca po przecinku w panelach i pasku stanu (3 dla zaznaczonego punktu pomiarowego).
- Pola i objętości są grupowane co tysiąc: `128,250 sq ft`, `454.9 cu yd`.
- Współrzędne nigdy nie są grupowane, więc można je skopiować tak, jak są.

## Współrzędne

CivilCraft pracuje na płaszczyźnie: wschód w prawo, północ w górę. Projektowanie zawsze odbywa się we współrzędnych w odwzorowaniu (układ państwowy, UTM albo lokalna siatka). Możesz podać CivilCraft, w jakim układzie są dane i czy są to współrzędne siatki, terenowe czy lokalne; wtedy pokazuje szerokość i długość geograficzną oraz umieszcza pliki GIS i warstwy map, ale nigdy sam nie zmienia jednostek ani nie przesuwa współrzędnych. Zobacz [Ustawianie układu współrzędnych projektu](topic:coordinate-systems) oraz [Współrzędne terenowe i lokalne](topic:ground-and-local-coordinates). Duże wartości układu państwowego (miliony stóp) są w porządku; CivilCraft wewnętrznie pracuje względem lokalizacji, aby zachować dokładność.
