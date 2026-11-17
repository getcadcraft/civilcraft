---
title: Oblicz przepływy deszczowe, średnice rur i linię ciśnień hydraulicznych
summary: Narysuj zlewnie, z których woda spływa do każdej budowli, zsumuj przepływy w sieci metodą racjonalną, dobierz rury wzorem Manninga i zobacz, gdzie linia ciśnień hydraulicznych biegnie pełnym przekrojem albo sięga powierzchni.
keywords: kanalizacja deszczowa, zlewnia, obszar zlewni, metoda racjonalna, współczynnik spływu, czas koncentracji, natężenie opadu, idf, manning, dobór rur, linia ciśnień hydraulicznych, hgl, linia energii, egl, piętrzenie, zalanie, woda dolna
from: e44872ec
---

Kanalizacja deszczowa działa na [sieci rurociągów](topic:pipe-network): najpierw narysuj sieć, potem obszary, które się do niej spuszczają. Wszystko pojawia się pod **Kanalizacja deszczowa** w prawym panelu, gdy nic nie jest zaznaczone.

## Narysuj zlewnię

1. Kliknij **Narysuj zlewnię** pod **Kanalizacją deszczową**.
2. Kliknij narożniki obszaru, który spływa do jednej budowli. {{key:Enter}} albo podwójne kliknięcie kończy; {{key:Backspace}} cofa ostatni narożnik, {{key:Esc}} przerywa.
3. Zlewnia spływa do budowli leżącej w jej obrębie, a jeśli takiej nie ma, do najbliższej. Otwierają się jej **Właściwości**: ustaw nazwę, **Współczynnik spływu C** (udział opadu, który spływa, od 0 do 1), **Czas koncentracji** w minutach oraz budowlę, do której **Spływa do**.

**Narysuj kolejną zlewnię** we Właściwościach zlewni zaczyna następną. Kliknij wewnątrz zlewni na planie, aby ją zaznaczyć; {{key:Delete}} ją usuwa. Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa.

## Ustaw projektowy opad

Natężenie opadu wynosi i = a ÷ (tc + b) podniesione do potęgi c, w calach na godzinę dla projektu w stopach i w milimetrach na godzinę dla projektu w metrach. Dopasuj **Natężenie a**, **b** i **c** do własnej krzywej IDF (natężenia opadu w zależności od czasu trwania i częstości) dla okresu powrotu, na który projektujesz.

:::warning
Startowa krzywa natężenia, Manning n (0.013) i strata na połączeniu (0.5) są wartościami zastępczymi, a nie normą. Ustaw je na podstawie własnych danych opadowych i kryteriów projektowych.
:::

- **Najkrótszy czas koncentracji**: żadna rura nie jest liczona przy krótszym czasie (na start 10 minut).
- **Manning n**: szorstkość rur.
- **Strata na połączeniu**: wysokość strat w każdej budowli jako udział wysokości prędkości V²/2g rury wypływającej z niej.
- **Poziom wody na wylocie**: woda dolna, do której opróżnia się ostatnia rura. Zostaw puste, gdy wylot jest swobodny.

## Jak sumują się przepływy

Każda rura niesie wszystkie zlewnie powyżej siebie. Q = C × i × A, gdzie C × A sumuje się w dół sieci, a i to natężenie przy najdłuższym czasie koncentracji napływającej wody: własny czas zlewni albo czas z zlewni wyżej plus czas przepływu przez rury (długość ÷ prędkość przy pełnym przekroju). Q podawane jest w stopach sześciennych na sekundę (A w akrach) albo w metrach sześciennych na sekundę (A w hektarach).

## Dobierz rury

Tabela pod **Przepływy i linie ciśnień** pokazuje dla każdej rury przepływ, to, co przenosi przy pełnym przekroju przy swoim spadku, prędkość, linię ciśnień na górze i u stopy oraz głębokość przepływu.

**Dobierz rury do tych przepływów** nadaje każdej rurze najmniejszy standardowy rozmiar, który przenosi jej przepływ przy własnym spadku (12–72 cale albo 300–1800 mm). To jeden krok. Rzędne dna zostają na miejscu: jeśli rozmiary się zmienią, użyj **Ustaw wszystkie dna według zasad**, aby zachować przykrycie, a potem sprawdź tabelę ponownie.

## Odczytaj linie ciśnień

Linia ciśnień hydraulicznych (HGL) wylicza się od wylotu w górę:

- Rura płynąca częściowo pełna ma HGL na powierzchni wody: rzędna dna plus głębokość normalna.
- Gdy woda poniżej jest wyżej niż wierzch rury albo rura niesie więcej, niż mogłaby przy pełnym przekroju, płynie pełnym przekrojem (pod ciśnieniem) i jej HGL rośnie o spadek tarcia na długości.
- W każdej budowli HGL to HGL górnej rury wypływającej plus strata na połączeniu.
- Linia energii (EGL) to HGL plus wysokość prędkości.

Rura płynąca pełnym przekrojem jest wymieniona, podobnie każda budowla, w której HGL jest powyżej krawędzi włazu: woda tam sięga powierzchni, a budowla jest zaznaczona na czerwono na planie. Zaznacz rurę lub budowlę, aby zobaczyć we Właściwościach jej przepływ, głębokość, prędkość i obie linie.

## Przeprowadź opad

Metoda racjonalna daje jeden szczyt dla każdej rury. {{ui:Przelicz deszcz}} (pod wynikami, we Właściwościach sieci) wylicza cały opad: spływ każdej zlewni w czasie, przeprowadzony rurami z ich czasem przepływu i retencją, i dodany tam, gdzie się łączą.

1. Zostaw puste pola {{ui:Deszcz trwa}} i {{ui:Natężenie deszczu}}, aby użyć najdłuższego czasu koncentracji i krzywej opadu powyżej, albo wpisz własne.
2. Naciśnij {{ui:Przelicz deszcz}}. Tabela podaje dla każdej rury najwyższy przepływ wpływający i wypływający, o ile niższy jest szczyt wypływu, jaką część pełnej przepustowości rury wykorzystuje oraz minutę, w której osiąga szczyt.
3. Każdy wylot dostaje mały wykres przepływu w czasie oraz {{ui:Pobierz hydrogram (CSV)}}.

Zlewnia oddaje opad uśredniony w czasie swojego czasu koncentracji, więc burza krótsza od niego osiąga szczyt niżej niż C × i × A. Każda rura jest przeprowadzana metodą Muskingum–Cunge, z głębokością przepływu, którą metoda racjonalna już wyznaczyła. Dwie gałęzie o różnych czasach koncentracji nie osiągają szczytu razem, więc ich suma jest niższa niż suma ich szczytów.

Nie modeluje to pracy pod ciśnieniem, piętrzenia wody, retencji w budowlach ani zalania. Rura, której przeprowadzony szczyt przekracza pełną przepustowość, jest wymieniona, a jej woda jest przekazywana tak, jakby się mieściła. Służy to do oceny czasu i tłumienia szczytu, a nie do doboru rury. To pomoc obliczeniowa: sprawdza ją inżynier.

## Zapisywane z projektem

Zlewnie i ustawienia opadu są zapisane w pliku projektu. Nie ma ich jeszcze w wydruku PDF, DWG, DXF ani w LandXML: zob. [Jeszcze nie zbudowano](topic:not-built-yet).
