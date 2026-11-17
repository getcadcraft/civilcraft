---
title: Wprowadź ciąg poligonowy i wyrównaj go regułą kompasową
summary: Wpisz kąty lub kierunki oraz odległości, sprawdź domknięcie kątowe i liniowe oraz dokładność, wyrównaj regułą kompasową i dodaj stanowiska jako punkty pomiarowe albo pętlę jako działkę.
keywords: ciąg poligonowy, ciąg zamknięty, pętla, kąty w prawo, wsteczne nawiązanie, kierunki, azymuty, odległości, domknięcie, błąd domknięcia, dokładność, reguła kompasowa, bowditch, wyrównanie, geodezja
from: 56ce5a8c
---

Ciąg poligonowy to ciąg zmierzonych odcinków: na każdym stanowisku kąt (lub kierunek) i odległość do następnego. Kliknij **Wprowadź ciąg poligonowy** w obszarze **Ciąg poligonowy** w prawym panelu, gdy nic nie jest zaznaczone.

## Skąd zaczyna się i gdzie kończy

1. **Początek w punkcie pomiarowym**: jego numer. Albo wpisz północną i wschodnią współrzędną.
2. **Odcinki jako**: **Kąty w prawo i odległości** albo **Kierunki i odległości**.
3. Przy kątach podaj, skąd się liczą: **Punkt pomiarowy wstecznego nawiązania** albo **jego azymut** (od pierwszego stanowiska w stronę punktu wstecznego, zgodnie z ruchem wskazówek zegara od północy).
4. **Koniec**: **z powrotem na początku (pętla)** albo **w punkcie pomiarowym** i jego numer (ciąg otwarty między znanymi punktami).

## Wpisz odcinki

Jeden odcinek w jednym wierszu: najpierw kąt lub kierunek, potem odległość, a po niej, jeśli chcesz, nazwa stanowiska, do którego dochodzi:

- Kąty w prawo, mierzone zgodnie z ruchem wskazówek zegara na stanowisku, z którego odcinek wychodzi, od stanowiska poprzedniego do następnego: `270°00'10" 125.50 B`. Działają też `270-00-10`, `270 00 10` i `270.0028`.
- Kierunki: `N 45°30'15" E 125.50 B`, albo azymut jako jedno słowo: `AZ 45-30-15 125.50 B`.
- W pętli z kątami zakończ wierszem `close` i kątem na początku, mierzonym od ostatniego stanowiska do drugiego: `close 270°00'05"`. To on sprawdza kąty.

Wiersze, których nie da się odczytać, są wymienione z numerami wierszy. Słowo „feet”, przecinki i wiersze komentarza `#` są w porządku.

## Odczytaj domknięcie

Podczas wpisywania okno dialogowe pokazuje:

- **Błąd domknięcia kątowego**: o ile kąty nie domykają się i udział każdego kąta w tym błędzie. Bez kąta zamykającego kąty nie są sprawdzane, a ich ewentualny błąd ujawni się w błędzie domknięcia liniowego.
- **Błąd domknięcia liniowego**: o ile ciąg kończy się za daleko od miejsca, w którym powinien się kończyć, i w którym kierunku.
- **Dokładność**: długość ciągu podzielona przez błąd domknięcia liniowego: 1 : 10,000 oznacza 1 ft na 10,000 ft.
- Stanowiska po wyrównaniu i o ile przesunęło się każde z nich.

## Wyrównanie

Najpierw błąd domknięcia kątowego rozkładany jest równomiernie na kąty. Potem błąd domknięcia liniowego rozkładany jest na odcinki regułą kompasową (Bowditcha): każde stanowisko przesuwa się przeciwnie do błędu proporcjonalnie do długości przebytej drogi do niego, dzięki czemu ciąg kończy się dokładnie tam, gdzie powinien.

:::note
Reguła kompasowa jest standardowym wyrównaniem, a nie metodą najmniejszych kwadratów, i nie waży kątów względem odległości. To, czy dokładność jest wystarczająca, ocenia się według własnych norm i przepisów obowiązujących w danym kraju.
:::

## Wykorzystanie wyniku

- **Dodaj jako punkty pomiarowe**: wyrównane stanowiska stają się punktami pomiarowymi o nazwach, które podałeś (w przeciwnym razie kolejne wolne numery), opisem `TRAV` i bez rzędnej. Ostatnie stanowisko pętli jest jej początkiem, więc nie jest dodawane drugi raz. Jeden krok: {{key:Mod+Z}} cofa to.
- **Dodaj jako działkę** (pętle): wyrównane stanowiska stają się [działką](topic:parcels), z jej opisami i opisem prawnym.
- **Raport (CSV)**: wiersze domknięcia, a potem dla każdego stanowiska kierunek, odległość, współrzędne przed i po wyrównaniu oraz poprawki.
