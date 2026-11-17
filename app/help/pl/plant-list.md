---
title: Lista roślin
summary: Około 420 popularnych roślin strefy umiarkowanej i śródziemnomorskiej z ich rozmiarami, mrozoodpornością, światłem i wodą, przeszukiwanych w dowolnym języku, plus własna lista zapisana razem z projektem.
keywords: lista roślin, baza roślin, gatunek, nazwa botaniczna, nazwa zwyczajowa, paleta roślin, lista szkółki, strefa mrozoodporności, csv, import roślin, eksport roślin, moje rośliny, lista drzew, lista krzewów, biblioteka roślin
from: 7ed09e7e
---

Sekcja **Rośliny** lewego panelu zawiera wszystkie rośliny, które możesz umieścić. Kliknij roślinę, aby zobaczyć jej rozmiary i ustawić ją jako roślinę, której używają **Roślina**, **Rabata** i **Żywopłot**.

## Wyszukiwanie i filtrowanie

Wpisz w polu **Szukaj**: dowolne słowo z nazwy rośliny w dowolnym języku (angielskim, hiszpańskim, portugalskim), jej nazwę botaniczną, typ albo słowo z jej notatek. Każde wpisane słowo musi pasować, więc `quercus evergreen` znajdzie dęby zimozielone. Znaki diakrytyczne nie mają znaczenia.

Zawęź listę za pomocą **Typ**, **Światło**, **Woda** i **Strefa mrozoodporności** (strefa USDA, w której leży twój teren: roślina jest na liście, gdy strefa mieści się w jej zakresie).

## Co zawiera roślina

| Pole | Znaczenie |
|---|---|
| Typ | Drzewo, krzew, żywopłot, trawa (także trawniki), bylina, roślina okrywowa lub pnąca |
| W dojrzałości | Wysokość i rozpiętość rośliny wyrośniętej w ogrodzie lub na ulicy, w metrach |
| Przy sadzeniu | Rozmiar, w jakim roślina jest sadzona, i jej pojemnik |
| Rozstaw | Od środka do środka w rabacie lub wzdłuż żywopłotu |
| Strefa mrozoodporności | Strefy USDA, w których zwykle przezimowuje |
| Światło, woda, gleba | Czego potrzebuje |
| Notatki | Zastosowania i ostrzeżenia, np. trujące części albo roślina, która się rozrasta |

:::note
Wbudowana lista została przygotowana dla CadCraft na podstawie ogólnej wiedzy ogrodniczej: typowe rozmiary, zaokrąglone. To nie jest katalog żadnej szkółki. Rozmiary i mrozoodporność sprawdź w lokalnej szkółce. Najbardziej znane gatunki inwazyjne Półwyspu Iberyjskiego i dużej części strefy umiarkowanej są celowo pominięte, a kilka gatunków inwazyjnych w niektórych regionach ma adnotację.
:::

## Własne rośliny

- **Dodaj do listy tego projektu** kopiuje roślinę do własnej listy projektu, gdzie jest zapisywana razem z projektem. Roślina z twojej listy zastępuje wbudowaną o tym samym kluczu, więc możesz zmienić jej rozmiary dla swojego regionu.
- **Importuj listę roślin…** odczytuje plik CSV (albo plik roślin). Plik CSV potrzebuje kolumny z nazwą botaniczną i najlepiej typu, wysokości i rozpiętości; nazwy kolumn w twoich własnych słowach też działają (Latin, Common name, Height, Spread, Width, Zone). Odczytywane są separatory: przecinki, średniki lub tabulatory, a także przecinki dziesiętne. Puste rozmiary sadzenia, rozstawy i pojemniki otrzymują rozsądne wartości domyślne dla typu.
- **Eksportuj jako CSV** zapisuje twoją listę (a gdy jej nie ma, rośliny pokazane przez wyszukiwanie), aby otworzyć ją w arkuszu kalkulacyjnym.

Lista roślin jest odczytywana jak każdy plik z zewnątrz: wszystko, czego nie da się użyć, zostaje pominięte i policzone.

## Rośliny w innych aplikacjach

Lista roślin jest jedną biblioteką dla każdej aplikacji CadCraft: BimCraft i ModelCraft mają tę samą listę, ale ich własne Umieść z biblioteki nie oferuje jeszcze roślin. Obecnie rośliny trafiają do modelu BIM przez krajobrazowy IFC CivilCraft (każda roślina jako `IfcGeographicElement`). Zobacz [Sadzenie](topic:planting#ifc).
