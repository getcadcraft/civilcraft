---
title: Otwórz DWG lub DXF jako linie rysunku
summary: Otwórz geometrię rysunku na rzucie, warstwa po warstwie, użyj jego warstwic, polilinii 3D i zamkniętych zarysów do powierzchni oraz zamień jego bloki z punktami na punkty pomiarowe.
keywords: kontrola pomiaru, rzędne tekstowe, dwg, dxf, cad, rysunek, linie rysunku, warstwice, linie przełamań, granica, polilinia, polilinia 3D, warstwy, podkład, topo, rysunek pomiarowy, bloki, odwołania do bloków, punkty pomiarowe z bloków, atrybuty, bloki punktowe, punkt wstawienia
from: da0f4c58
---

Pomiar topograficzny często przychodzi jako rysunek: warstwice jako polilinie na swojej rzędnej, linie przełamań jako polilinie 3D, obrys terenu jako zamknięta polilinia. CivilCraft otwiera **przestrzeń modelu** rysunku jako warstwy w rzucie i potrafi zamienić te linie bezpośrednio w powierzchnię.

## Otwórz rysunek

1. Kliknij {{ui:Linie rysunku}} w grupie **Powierzchnia** (albo {{ui:Otwórz}}, albo upuść plik na rzut) i wybierz plik `.dwg` lub `.dxf`. Rysunek jest odczytywany na tym komputerze; nic nie jest wysyłane. Odczytywane są pliki DWG od 2000 do 2018 roku oraz DXF w postaci ASCII.
2. Okno **Linie rysunku** wymienia warstwy rysunku, które zawierają linie, zamknięte kształty lub punkty, oraz to, czy mają **rzędne**. Warstwy wyłączone w rysunku zaczynają odznaczone. Tekst, kreskowania, wymiary i inne obiekty, które nie są liniami, są liczone i pomijane (okno mówi, które).
3. Sprawdź **Jednostki rysunku**. Gdy rysunek podaje swoje jednostki, CivilCraft przelicza je na jednostki projektu (milimetry na metry, metry na stopy, cale na stopy). Rysunek w stopach jest odczytywany jako stopy amerykańskie (US survey) bez skalowania: różnią się one o 2 części na milion, a skalowanie współrzędnych State Plane o tę wartość przesunęłoby je o stopy. Gdy rysunek nie podaje jednostek, jego liczby są odczytywane w jednostkach projektu; jeśli nie są właściwe, wybierz poprawne jednostki z listy.
4. W **Użyj do powierzchni** wybierz, co każda warstwa wnosi do powierzchni (albo zostaw **Tylko pokaż**). Warstwy nazwane jak warstwice (TOPO, CONT, CNTR), które mają rzędne, zaczynają jako linie przełamań.
5. Kliknij {{ui:Dodaj}}. Warstwy pojawiają się pod **Warstwami GIS** w lewym panelu; każde zastosowanie trafia do powierzchni. Każda część to osobny krok: {{key:Mod+Z}} cofa je po jednym.

## Co może dać każdy rodzaj warstwy

| Warstwa zawiera | Użyj do powierzchni |
|---|---|
| Warstwice (polilinie na rzędnej) | Linie przełamań na rzędnej własnej linii albo wg pola ELEV |
| Polilinie 3D | Linie przełamań na ich własnych rzędnych |
| Zamknięty zarys | Granica powierzchni (największy zamknięty kształt albo wybrany) |
| Punkty z rzędną | Punkty pomiarowe, opisane nazwą warstwy |
| Linie na rzędnej 0 (linie planu) | Nic: pozostają w rzucie jako rysunek podkładowy |

Rysunek zapisany przez CivilCraft zawiera swoje linie charakterystyczne jako polilinie 3D, które pamiętają swoje łuki. Okno pokazuje wtedy **Linie charakterystyczne**: pozostaw je zaznaczone, aby przywrócić je jako linie charakterystyczne z łukami i zastosowaniami (jeden krok cofnięcia), albo odznacz, aby odczytać je jak każdą inną warstwę, jako linie rysunku.

Później użyj {{ui:Użyj do powierzchni}} w menu warstwy pod **Warstwami GIS**, aby zrobić to samo dla warstwy, którą tylko pokazano.

## Punkty pomiarowe z bloków

Rysunki pomiarowe często zawierają punkty jako bloki: mały symbol przy każdym pomiarze, z atrybutami numeru punktu, opisu i rzędnej. Gdy rysunek ma odwołania do bloków, okno ma sekcję **Punkty pomiarowe z bloków**:

1. Zaznacz bloki do pobrania (tabela podaje, ile odwołań ma każdy, na jakich warstwach i jakie atrybuty), albo zaznacz warstwy, aby pobrać wszystkie odwołania do bloków na nich.
2. Wybierz, skąd pochodzą **numer**, **opis** i **rzędna** każdego punktu: z atrybutu, z nazwy bloku lub warstwy, z kolejnych wolnych numerów albo z Z punktu wstawienia. CivilCraft zaczyna od prawdopodobnych atrybutów (PT, DESC, ELEV i podobnych) i bierze rzędną z atrybutu tylko wtedy, gdy bloki mają rzędną zero.
3. Odznacz warstwy linii, jeśli chcesz tylko punkty, a następnie kliknij {{ui:Dodaj}}.

Każde odwołanie staje się jednym punktem pomiarowym w swoim punkcie wstawienia. Liczą się tylko odwołania umieszczone w przestrzeni modelu; bloki zagnieżdżone w innych blokach nie. Numery już obecne w projekcie albo użyte dwa razy w rysunku dostają nowe numery po najwyższym, a atrybut rzędnej, który nie jest liczbą, pozostawia punkt bez rzędnej; wiersz stanu liczy oba przypadki. Rysunek nigdy nie jest zmieniany, a każdy punkt pamięta swój blok: jego Właściwości pokazują **Z bloku** wraz z blokiem, warstwą i identyfikatorem (handle). Dodanie punktów to jeden krok, więc {{key:Mod+Z}} usuwa je wszystkie.

## Rzędne zapisane jako tekst i kontrola

Rzędne punktowe zapisane jako tekst (albo w atrybucie bloku, który nie jest blokiem punktu pomiarowego) nie są liniami rysunku. Sekcja **Rzędne punktowe i kontrola** może przyjąć je jako punkty pomiarowe i wymienia, co w rysunku wygląda źle: jednostki, układ współrzędnych, odległość od zera, płaskie warstwice, dziwne rzędne, zdublowane punkty. Zobacz [Sprawdź rysunek pomiarowy przy imporcie](topic:survey-check).

## Jak odczytywany jest rysunek

- Łuki, okręgi, elipsy, wypukłe odcinki polilinii i splajny stają się krótkimi prostymi odcinkami (co najwyżej co 5°).
- Odwołania do bloków są rysowane tam, gdzie są umieszczone, także zagnieżdżone bloki; to, co blok ma na warstwie 0, przyjmuje warstwę odwołania.
- Obiekty narysowane w innej płaszczyźnie (inny kierunek wyciągnięcia) są umieszczane we współrzędnych globalnych.
- Każdy obiekt dostaje trzy pola: LAYER, TYPE (typ obiektu) i ELEV (jego rzędna, gdy wszystkie punkty mają jedną wspólną wartość).
- Współrzędne są brane tak, jak są: rysunek musi używać tych samych współrzędnych co projekt (na przykład tej samej strefy State Plane). Rysunki dołączone (xrefs) nie są otwierane: otwórz je osobno.

:::tip
Najlepszą powierzchnię daje rysunek warstwic z kilkoma rzędnymi punktowymi na szczytach i w zagłębieniach, gdzie same warstwice zostawiają płaskie trójkąty. Dodaj je jako punkty pomiarowe albo z warstwy punktów w rysunku.
:::
