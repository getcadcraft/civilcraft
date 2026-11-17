---
title: Wartości początkowe i symbole zastępcze
summary: Każda wartość, z którą startuje CivilCraft: dla nowych projektów, wyświetlania, osi, placów, korytarzy, sieci rurociągów, objętości i wydruków, oraz te, które są symbolami zastępczymi do wymiany.
keywords: wartości domyślne, ustawienia, wartości początkowe, symbole zastępcze, kryteria projektowe, normy, zasady, założenia
from: fbfc7432
---

CivilCraft nie ma okna ustawień ani szablonu. Oto wartości, z którymi startują elementy. Wartości oznaczone **symbol zastępczy** nie pochodzą z żadnej normy: zamień je na kryteria swojego projektu, zanim polegasz na sprawdzeniu lub ilości.

## Nowy projekt

| Ustawienie | Wartość |
|---|---|
| Nazwa | Nienazwany teren (nazwa pierwszego pliku punktów ją zastępuje) |
| Jednostki | Stopy US |
| Nazwa powierzchni | Istniejący teren |
| Grupy punktów | Każda grupa zaczyna jako {{ui:Points}} |
| Najdłuższa krawędź zewnętrzna | 0 (zachowaj każdy trójkąt) |
| Zachowane kroki cofania | 200 |

## Wyświetlanie

| Ustawienie | Wartość |
|---|---|
| Powierzchnia | {{ui:Existing ground}} |
| Warstwice co | 1 (ft lub m) |
| Główne co | co 5. warstwica |
| Pasma | 8 |
| Włączone | Warstwice, {{ui:Contour labels}}, punkty, linie przełamań, krawędź powierzchni, rurociągi |
| Wyłączone | Trójkąty, pasma rzędnych, strzałki spadków, opisy punktów |

## Osie i niweleta

| Ustawienie | Wartość |
|---|---|
| Nazwa | Oś 1, Oś 2 … |
| Kilometraż początkowy | 0+00 |
| Promień łuku w każdym wewnętrznym PI | 100 ft lub 30 m, mniejszy, jeśli nie mieści się w połowie każdej stycznej |
| Niweleta projektowa | Brak, dopóki jej nie zaczniesz; {{ui:Start from the ground}} stawia PVI na terenie na każdym końcu |
| Długość łuku pionowego | 0 (bez łuku), dopóki jej nie wpiszesz |

## Place

| Ustawienie | Wartość |
|---|---|
| Nazwa | Plac 1, Plac 2 … |
| Rzędna | Teren w środku placu, zaokrąglony do 0.1 (0, jeśli środek jest poza powierzchnią) |
| Skarpa wykopu | 2 : 1 (symbol zastępczy) |
| Skarpa nasypu | 3 : 1 (symbol zastępczy) |

## Zestaw korytarza (symbole zastępcze)

| Ustawienie | Stopy US | Metry |
|---|---|---|
| Szerokość pasa | 12 ft | 3.6 m |
| Spadek pasa | 2% | 2% |
| Szerokość pobocza | 4 ft | 1.2 m |
| Spadek pobocza | 4% | 4% |
| Skarpa wykopu | 2 : 1 | 2 : 1 |
| Skarpa nasypu | 3 : 1 | 3 : 1 |
| Przekrój co | 10 ft | 5 m |

## Sieć rurociągów

| Ustawienie | Stopy US | Metry |
|---|---|---|
| Nazwa i typ | Burzowa, burzowa | Burzowa, burzowa |
| Najmniejszy spadek (symbol zastępczy) | 0.50% | 0.50% |
| Najmniejsze przykrycie (symbol zastępczy) | 2 ft | 0.6 m |
| Obniżenie w budowlach (symbol zastępczy) | 0.10 ft | 0.03 m |
| Średnica nowej budowli | 48 in | 1200 mm |
| Średnica nowego rurociągu | 12 in | 300 mm |
| Głębokość osadnika | 0 | 0 |
| Krawędź włazu | Z powierzchni | Z powierzchni |

Sieć rurociągów otwarta z LandXML także używa tych zasad, ponieważ LandXML ich nie przenosi.

## Objętości

| Ustawienie | Wartość |
|---|---|
| Metoda | Siatka, próbkowana w środkach komórek wewnątrz linii wyjścia |
| Rozmiar komórki | Dobierany tak, aby prostokąt opisany na wykopie zawierał około 250 000 komórek (1, 2 lub 5 razy potęga dziesięciu) |
| Spulchnienie i zagęszczenie | Brak |

## Wydruk

| Ustawienie | Wartość |
|---|---|
| Obszar | {{ui:Everything}} |
| Papier | Tabloid 11 × 17 in (projekty w stopach), ISO A3 (projekty w metrach); zawsze poziomo |
| Skala | Największa z wymienionych skal, która się mieści |
| Kolory atramentu | {{ui:Layer colors}} |

Opisy w DXF są dobierane do skali, w której wszystko mieści się na Tabloid (stopy) lub A3 (metry).
