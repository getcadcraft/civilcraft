---
title: Oblicz godziny nasłonecznienia na terenie
summary: Wybierz dzień (albo porę roku) i strefę czasową, a zobaczysz godziny bezpośredniego słońca na każdej ścianie każdej bryły oraz na terenie wokół nich, z terenem narysowanym na planie i liczbami jako CSV.
keywords: słońce, godziny słońca, cień, zacienienie, dostęp do słońca, godziny dzienne, elewacja, ściana, pora roku, przesilenie, równonoc, strefa czasowa, czas letni, szerokość, długość, CSV, raster
from: 4e32a314
---

**Godziny nasłonecznienia** liczą godziny bezpośredniego słońca docierającego do każdej ściany każdej bryły budynku oraz do terenu wokół nich, w wybrany dzień albo uśrednione dla pory roku. Bryły i sam teren rzucają cień; nic innego nie (brak drzew i sąsiednich budynków, których nie narysowano). Światło nieba niebędące bezpośrednim słońcem nie jest liczone.

## Zanim zaczniesz

Położenie Słońca wynika z szerokości i długości geograficznej lokalizacji, które pochodzą z **układu współrzędnych** projektu. Projekt bez niego zostaje odrzucony z komunikatem: najpierw ustaw go (**Współrzędne** w grupie GIS). Szerokość i długość wpisane ręcznie byłyby zgadywaniem, dlatego nie ma na nie pola.

## Wylicz

We **Właściwościach**, pod **Bryły budynków**, **Godziny nasłonecznienia**:

1. Wybierz **Dzień**. Zaczyna od dnia, w którym Słońce jest najniżej w twoim miejscu (21 grudnia, albo 21 czerwca na półkuli południowej). Dla pory roku zaznacz **Przez porę roku**, wybierz **Ostatni dzień** i co ile dni próbkować.
2. Wpisz **Strefę czasową**: nazwę, np. `America/Mexico_City`, albo przesunięcie względem UTC, np. `-6`. Nazwa stosuje reguły czasu letniego tej strefy dla danego dnia; przesunięcie, które wpiszesz, jest używane dokładnie tak, jak wpisano, więc użyj tego, które obowiązuje tego dnia. Linia pod polem mówi, jakie przesunięcie znaleziono.
3. Wybierz, jak często ustawiać Słońce (co 5, 10, 15 albo 30 minut), a potem **Wylicz godziny nasłonecznienia**. Pora roku działa w tle; **Zatrzymaj** ją anuluje.

## Co dostajesz

- Tabela według bryły: **najgorsza ściana**, **średnia** i **najlepsza ściana**, w godzinach dziennie, oraz tabela każdej ściany z kierunkiem, w który jest zwrócona, i jej godzinami piętro po piętrze.
- Teren wokół brył, narysowany na planie od ciemnego (brak słońca) do żółtego (najwięcej, ile dostaje dowolna komórka), z legendą. Komórki pod bryłą są puste. **Pokaż teren na planie** wyłącza go.
- **Ściany jako CSV** i **Teren jako CSV** zapisują liczby.

Dla pory roku wartości to średnia dzienna z próbkowanych dni. Nic nie jest zapisywane w projekcie: wynik służy do oglądania, a ponowne uruchomienie tworzy go od nowa.

## Warto wiedzieć

- Ściana liczy chwilę jako słoneczną tylko wtedy, gdy jest zwrócona do słońca i nic jej nie zasłania. Ściana odwrócona nic nie dostaje.
- Teren jest próbkowany na siatce zależnej od wielkości terenu, a położenie Słońca wyznaczane jest w środku każdego kroku czasowego, więc godziny są poprawne z dokładnością do wybranego kroku.
- Położenie Słońca to opublikowany wzór astronomiczny, dokładny do około minuty kątowej.
