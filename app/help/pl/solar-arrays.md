---
title: Rozmieść pola solarne na terenie
summary: Ustaw naziemne stoły fotowoltaiczne w działce lub na placu, z rzędami rozstawionymi dla gruntu, na którym stoi każdy stół, z pominięciem stromego terenu, obliczeniem rocznej produkcji energii i pokazaniem stołów na planie oraz w 3D.
keywords: pole solarne, pv, fotowoltaika, pole, montaż naziemny, stoły, rzędy, rozstaw rzędów, zacienienie, teren, nachylenie, pale, uzysk, kWp, energia, horyzont
from: 95593fd6
---

## Czego się nauczysz

Jak rozmieścić pole stołów fotowoltaicznych na terenie, który nie jest płaski, i co oznaczają liczby. Otwórz to z Powierzchnia › Więcej › Pola solarne.

## Rozmieść stoły

1. Wybierz **Gdzie**: działkę lub plac projektu albo wpisz narożniki obszaru. Zaznacz wszystkie place lub działki, które mają pozostać **puste** (budynek, staw).
2. Wpisz **szerokość i długość geograficzną** lokalizacji. Od nich zależy położenie Słońca; niczego nie zgaduje się. Jeśli projekt ma układ współrzędnych, **Ustaw z układu współrzędnych** wypełni je.
3. Ustaw nachylenie, orientację (puste oznacza w stronę równika), liczbę modułów w stole oraz moc i wymiary modułu. Wartości modułu zaczynają się od ogólnych i są tak oznaczone; wpisz własne.
4. Naciśnij **Rozmieść stoły**. Okno podaje liczbę stołów i modułów, wielkość w kWp oraz odległość między rzędami.

Każdy stół jest ustawiany w obszarze od strony przedniej, a potem przesuwany w tył. Stół jest ustawiany tylko tam, gdzie grunt pod nim mieści się w limicie nachylenia, wewnątrz obszaru i odsunięcia, oraz gdzie wymagane pale nie są wyższe niż ustawiony limit. Miejsca, w których to się nie udaje, zostają puste, a okno podaje ich liczbę i przyczynę.

## Rzędy są rozstawione zgodnie z terenem

Na płaskim terenie rzędy stoją w odległości wynikającej z zwykłej reguły braku zacienienia: cień rzędu w południe przesilenia zimowego nie może sięgać dolnej krawędzi rzędu za nim. Na zboczu CivilCraft stosuje tę samą regułę do gruntu, na którym faktycznie stoi następny rząd. Tam, gdzie teren wznosi się za stołem, rzędy mogą stać bliżej; tam, gdzie opada, stoją dalej. Okno pokazuje najmniejszy, największy i średni rozstaw obok rozstawu dla płaskiego terenu, więc widać, co zrobił teren.

Płaszczyzna stołu jest podnoszona na palach, aż każdy punkt pod nią będzie nad gruntem o ustawiony prześwit. Najwyższy pal pojawia się w wyniku.

## Roczna produkcja energii

**Roczna produkcja energii** wylicza światło na nachylonej płaszczyźnie dla reprezentatywnego dnia każdego miesiąca, temperaturę ogniw, wpisane straty, wzajemne zacienianie stołów oraz wzgórza na horyzoncie, które zabierają Słońce, jakie zasłaniają. Niebo jest bezchmurne, więc wynik to górna granica; prawdziwa pogoda da mniej. To wstępny szacunek projektowy, a nie raport o uzysku.

## Zachowaj

**Zapisz w projekcie** zachowuje dane wejściowe i wyniki w pliku projektu; stoły są wyliczane ponownie z terenu przy otwarciu pliku, więc zmieniona powierzchnia je przesuwa. Pokazują się na planie i w 3D (Pokaż › Pola solarne). Lista stołów pobiera się jako CSV. Jeden krok cofnięcia usuwa pole lub je przywraca.

## Jeszcze nie zbudowano

Dane pogodowe zamiast bezchmurnego nieba, stoły podążające za terenem w kierunku wschód–zachód, trackery oraz projekt elektryczny (stringi, przewody, falowniki) w CivilCraft. Panel Solar PV w BimCraft ma stringi i schemat jednoliniowy dla dachów.
