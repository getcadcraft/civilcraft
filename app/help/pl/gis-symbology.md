---
title: Styl warstwy według atrybutu
summary: Koloruj obiekty warstwy GIS według wartości pola (jeden kolor na wartość albo według przedziałów liczbowych), skaluj punkty według liczby, zabarwiaj poligony i pokaż legendę na planie.
keywords: symbolika, styl, kolor, kolorowanie kategorii, stopniowanie, unikalne wartości, przedziały równe, kwantyle, naturalne przerwy, jenks, gradient, daltonizm, legenda, rozmiar, punkty, choropleta, klasy, gis
from: a3a69add
---

Otwórz menu **trzech kropek** warstwy na liście warstw GIS i wybierz {{ui:Styl według atrybutu…}}.

## Trzy style

- **Pojedynczy symbol:** kolor warstwy, jak dotąd.
- **Kategoryzowany:** jeden kolor na każdą odrębną wartość dowolnego pola. Do ośmiu wartości dostaje osiem kolorów Okabe-Ito (dobranych tak, by pozostawały rozróżnialne przy częstych rodzajach daltonizmu); przy większej liczbie siedem najczęstszych dostaje po jednym kolorze, a reszta dzieli szarą klasę **Inne**. Obiekty bez wartości są szare.
- **Stopniowany:** pole liczbowe dzieli się na od 2 do 9 zakresów, każdy z kolorem z gradientu. Wartość leżąca na granicy trafia do niższego zakresu.

## Jak wyznaczane są zakresy

| Metoda | Granice |
|---|---|
| Przedziały równe | Zakres od najmniejszej do największej wartości podzielony na równe szerokości. Wartości od 0 do 30 w trzech zakresach: 0, 10, 20, 30. |
| Kwantyle | Mniej więcej tyle samo obiektów w każdym zakresie. Granice odczytuje się z posortowanych wartości zwykłą interpolacją liniową: dla wartości od 1 do 10 w dwóch zakresach granica to 5,5. |
| Naturalne przerwy (Jenks) | Podziały, które zostawiają najmniejszy rozrzut wewnątrz każdego zakresu, więc skupiska podobnych wartości zostają razem. Przy ponad 1,500 wartościach działa na 1,500 równomiernie rozłożonych i mówi o tym. |

## Kolory

Viridis i Cividis przechodzą od ciemnego do jasnego z płynną zmianą jasności, więc kolejność zakresów da się odczytać nawet w odcieniach szarości lub przy daltonizmie. Blues idzie od jasnego do ciemnego. Czerwony do niebieskiego to gradient dwukierunkowy dla wartości wokół środka. **Odwróć kolory** odwraca dowolny z nich. Okno wymienia zakresy i liczbę obiektów w każdym, zanim zastosujesz zmiany.

## Rozmiar, wypełnienie i legenda

- **Rozmiar punktu według** pola liczbowego powiększa kwadrat każdego punktu tym bardziej, im większa wartość, między dwoma rozmiarami, które podasz (połowa boku, w milimetrach na papierze).
- **Zabarwij wnętrze poligonów** wypełnia każdy poligon kolorem jego klasy (otwory pozostają puste). Zabarwienie jest widoczne na ekranie; wydruki i pliki DXF/DWG pokazują kolorowe kontury.
- **Pokaż legendę na planie** rysuje klasy, ich liczby i zakres rozmiaru w lewym dolnym rogu planu. Legenda jest widoczna na ekranie; nie trafia do wydruku.
- Aby opisać obiekty polem, użyj **Etykietuj według** w tym samym menu.

Styl jest zapisywany w pliku projektu. Wersja, która nie zna stylów, otwiera plik z kolorem warstwy. Wydruki, DXF i DWG zawierają klasy jako osobne warstwy, nazwane od warstwy i klasy, w najbliższym z dziewięciu podstawowych kolorów CAD. Warstwa z ponad 200,000 obiektów jest rysowana jednym kolorem.
