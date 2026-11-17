---
title: Teren z linii warstwic
summary: Utwórz powierzchnię terenu z mapy warstwic: wybierz warstwy linii, określ, skąd pochodzi rzędna każdej linii, sprawdź przecięcia i duplikaty, i zbuduj. Linie warstwic stają się liniami przełamań, a płaskie trójkąty na grzbietach i w dolinach są naprawiane. Mapę obrysowaną z obrazu albo PDF można przeskalować i umieścić na podstawie dwóch znanych punktów.
keywords: warstwice, linie warstwic, teren z warstwic, powierzchnia z warstwic, mapa topograficzna, mapa geodezyjna, brak współrzędnych, linie przełamań, płaskie trójkąty, grzbiet, dolina, wierzchołek wzgórza, przecinające się warstwice, zduplikowane warstwice, interwał warstwic, skalowanie mapy, dwa punkty, umieszczanie mapy, DXF, DWG, shapefile
from: e6161653
---

Geodeta czasem wysyła mapę warstwic: linie z rzędnymi, ale bez punktów. CivilCraft buduje z nich istniejący teren.

## Wczytaj warstwice

Otwórz mapę jako linie rysunku: rysunek DXF lub DWG, shapefile albo GeoJSON (**GIS** › {{ui:Importuj}}, albo upuść plik na plan). Linie wchodzą jako **warstwy mapy**. Pod **Powierzchnia** › {{ui:Więcej}} wybierz {{ui:Teren z warstwic}}.

## Określ, skąd pochodzi rzędna

Zaznacz warstwy zawierające warstwice, a następnie wybierz **Rzędną z**:

- {{ui:Własnych rzędnych linii}}: linia, której wszystkie wierzchołki mają tę samą rzędną (polilinia 3D albo polilinia z rzędną). Linia na 0 to linia planu i nie ma poziomu.
- **Pole liczbowe** warstwy (np. ELEV), gdy mapa je zawiera.
- {{ui:Wartości początkowej i interwału, w kolejności wymienienia linii}}: dla linii bez żadnej rzędnej. Pierwsza wymieniona linia dostaje **Rzędną pierwszej linii**, następna tę wartość plus **Interwał warstwic**, i tak dalej. Wymień linie od najniższej w górę (albo zmień ich kolejność w warstwie).

## Sprawdź, potem zbuduj

{{ui:Sprawdź}} wymienia, co jest źle, słowami, zanim cokolwiek się zmieni:

- linia **bez rzędnej** albo z mniej niż dwoma punktami;
- **duplikat** linii (ten sam kształt dwa razy, nawet narysowany w odwrotnym kierunku);
- dwie linie, które się **przecinają**, na różnych rzędnych albo na tej samej (także linia przecinająca samą siebie), z miejscem;
- rzędna, która **nie leży na interwale** (pomyłka przy wpisywaniu, np. 105.5 na mapie co 1 m).

Zaznacz {{ui:Pomiń linie, które przecinają inną}}, aby usunąć linię przecinającą najwięcej innych (potem następną, aż żadna się nie przecina): usuwana jest przypadkowa linia, która przecina każdą warstwicę, a nie same warstwice. **Uprość linie w tolerancji** usuwa wierzchołki, które są bliższe linii prostej niż ta odległość.

{{ui:Zbuduj teren}} dodaje linie do istniejącego terenu jako linie przełamań (jeden krok cofnięcia), więc powierzchnia przechodzi dokładnie przez każdą warstwicę. Przy zaznaczonym {{ui:Napraw płaskie trójkąty na grzbietach, w dolinach i na wzgórzach}} i podanym interwale CivilCraft dodaje też punkt wewnątrz każdego płaskiego trójkąta (trójkąta, którego wszystkie narożniki leżą na jednej warstwicy), na wysokości, do której ciągnie się sąsiednie nachylenie, nigdy o więcej niż pół interwału od warstwicy. Bez tego szczyty grzbietów, dna dolin i wierzchołki wzgórz wychodzą jako płaskie płyty. Na próbnym wzgórzu błąd względem rzeczywistej powierzchni spadł o jedną czwartą; na grzbiecie o 40 %.

## Mapa bez współrzędnych

Dla mapy warstwic obrysowanej z obrazu albo PDF otwórz **Skaluj i umieść warstwy na dwóch znanych punktach**. Podaj dwa punkty na mapie i ich rzeczywiste położenie; zaznaczone warstwy są skalowane, obracane i przesuwane, aby pasowały (jeden krok cofnięcia; rzędne nie są zmieniane). Te same dwa punkty dają skalę (podaną w komunikacie) i obrót.

Powierzchnia jest tak dobra jak mapa: między dwiema warstwicami jest płaszczyzną, więc rzeczywisty teren między nimi nie jest znany. Przed poleganiem na wyniku sprawdź go względem rzędnych punktowych.
