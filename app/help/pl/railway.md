---
title: Projektowanie toru kolejowego
summary: Zamień trasę w tor kolejowy: przejścia (klotoida, parabola sześcienna, Bloss, Helmert, półfala sinusoidy, sinus), przechyłka na każdym łuku z przechyłką równowagową, niedobór i nadmiar, ograniczenia przechyłki i geometrii toru jako ostrzeżenia, rozjazdy i łącznice według kilometrażu, obrys prześwitu przeciągany wzdłuż linii oraz tor z szynami, podkładami i podsypką, zbudowany jako korytarz: w planie, przekrojach, profilu, 3D i ilościach.
keywords: kolej, szyna, tor, metro, tramwaj, przechyłka, nadmiar przechyłki, niedobór przechyłki, przechyłka równowagowa, przejście, łuk przejściowy, klotoida, parabola sześcienna, Bloss, Helmert, półfala sinusoidy, cosinus, rozstaw szyn, rozstaw normalny, rozstaw szeroki, rozstaw metrowy, rozstaw wąski, podkład, podsypka, podbudowa, korona, pobocze, osie torów, 60E1, 54E1, UIC60, 115RE, 136RE, gradient przechyłki, szybkość zmiany przechyłki, rozjazd, zwrotnica, krzyżownica, liczba krzyżownicy, łącznica, lead, łuk zamykający, prędkość na odgałęzieniu, prześwit, obrys prześwitu, gabaryt budowli, gabaryt ładunkowy, obrys kinematyczny, peron, przerwa peronowa, odstęp torów, pochylenie, łuk pionowy, minimalny promień, przechyłka LandXML
from: 99de9745
---

Każda trasa może być torem kolejowym. Jej łuki otrzymują wtedy przejścia i przechyłkę (pochylenie szyn w łuku), a jej korytarz jest budowany jako tor: szyny na podkładach, na podsypce, wkopane w grunt jak droga. Rozjazdy i łącznice dodaje się według kilometrażu, a obrys prześwitu można przeciągnąć wzdłuż trasy i sprawdzić względem obiektów stojących przy torze.

Każda liczba poniżej jest **wartością zastępczą**, a nie normą. Kolej ustala swoje ograniczenia według prędkości linii, typu toru i kraju; ustaw je według własnego standardu kolejowego. CivilCraft nie zawiera żadnej krajowej tabeli.

## Zamiana trasy w tor kolejowy

1. Zaznacz trasę i znajdź blok **Kolej** we Właściwościach.
2. Zaznacz pole wyboru **Ta trasa jest torem kolejowym**. Każda zmiana to jeden krok cofnięcia.
3. Ustaw **Prędkość projektową** u góry Właściwości trasy: to prędkość linii, względem której sprawdzana jest przechyłka. **Najwolniejsze pociągi** (w bloku Kolej) to prędkość, względem której sprawdzany jest nadmiar przechyłki.

## Przejścia

Podaj długość spirali na każdym końcu łuku w tabeli PI (**Spirala wejściowa**, **Spirala wyjściowa**), a następnie wybierz jego rodzaj w tabeli łuków bloku Kolej lub użyj **Przejście dla każdego łuku**:

| Rodzaj | Krzywizna wzdłuż przejścia |
|---|---|
| Klotoida | rośnie równomiernie (spirala drogowa) |
| Parabola sześcienna | y = x³ / (6·R·L), przy czym L mierzone wzdłuż stycznej; sam łuk jest nieco dłuższy |
| Bloss | 3u² − 2u³ pełnej krzywizny (u = udział długości): łagodny początek i koniec |
| Helmert | dwie parabole: 2u², a następnie 1 − 2(1 − u)² |
| Półfala sinusoidy | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Wszystkie oprócz paraboli sześciennej skręcają o L / 2R, jak klotoida. Kilometraż biegnie wzdłuż rzeczywistej długości. LandXML zachowuje rodzaj (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Przechyłka

Wpisz **Przechyłkę** każdego łuku w milimetrach. Tabela pokazuje dla każdego łuku:

- **Przechyłka równowagowa** = G·v² / (g·R), gdzie G to odległość między osiami szyn (**Osie szyn**: rozstaw szyn plus szerokość główki szyny, chyba że wpiszesz wartość ręcznie). Przy G = 1500 mm daje to znany wzór 11.8·V² / R (V w km/h, R w m).
- **Niedobór** = przechyłka równowagowa przy prędkości linii − zastosowana przechyłka.
- **Nadmiar** = zastosowana przechyłka − przechyłka równowagowa przy prędkości najwolniejszych pociągów.
- **Rampa**: najbardziej strome nachylenie przechyłki wzdłuż jej ramp, w mm na metr.

Przechyłka narasta na każdym przejściu, kształtem zgodnym z jego krzywizną: prosto dla klotoidy lub paraboli sześciennej, w kształcie Blossa dla Blossa itd. Koniec łuku bez przejścia ma rampę na prostej przed nim, o długości wymaganej przez ograniczenie gradientu przechyłki, i jest to zaznaczone: przechyłka zmienia się wtedy tam, gdzie krzywizna się nie zmienia.

**Przechyłka obraca się wokół** wskazuje, która szyna pozostaje na projektowanej niwelecie: **szyna niska** (zwykle), **szyna wewnętrzna** albo **oś toru** (każda szyna przesuwa się o połowę przechyłki). Projektowana niweleta to tu wierzch szyny.

**Diagram przechyłki** rysuje wysokość każdej szyny nad profilem wzdłuż kilometrażu; widok profilu oraz arkusze planu i profilu dostają to samo jako pasmo pod profilem.

## Ograniczenia przechyłki i ostrzeżenia

**Największa zastosowana przechyłka**, **Największy niedobór przechyłki**, **Największy nadmiar przechyłki**, **Najbardziej stromy gradient przechyłki** oraz **Najszybsza zmiana przechyłki** (gradient przy prędkości linii, w mm/s) są sprawdzane na każdym łuku. Wartość przekraczająca ograniczenie jest ostrzeżeniem w bloku Kolej i w panelu Problemy, z podaniem ograniczenia i znalezionej wartości. Bez prędkości projektowej niedobór i szybkość zmiany nie są sprawdzane (uwaga o tym informuje).

## Tor

Ustaw **Rozstaw szyn** (nastawy: normalny 1435 mm, szeroki, metrowy lub wąski, albo własny), **Przekrój szyny** (60E1, 54E1, 49E1, 115RE, 136RE: wyłącznie ich opublikowane wymiary), liczbę **Torów** i ich **Odstęp torów**, a następnie **Podkłady i podsypkę**: materiał podkładów, długość, szerokość, wysokość i rozstaw; grubość podsypki pod podkładem (przy szynie niskiej), ramię podsypki, nachylenie skarpy oraz o ile jej wierzch leży poniżej podkładów; grubość podbudowy, **pobocze** za krawędzią podsypki oraz poprzeczne pochylenie korony.

Naciśnij **Zbuduj tor**. Działanie dotyczy korytarza trasy, zbudowanego jako tor wzdłuż projektowanej niwelety: szyny i podkłady przechylają się z przechyłką, korona nie. Skarpy wykopu i nasypu zaczynają się od krawędzi pobocza, a tor układa się w projektowaną powierzchnię jak droga.

- **Plan**: obie szyny każdego toru (warstwa C-RAIL-TRAK) i, przy więcej niż jednym torze, oś każdego toru (C-RAIL-CNTR), na ekranie, w DXF, DWG, PDF oraz w arkuszach planu i profilu.
- **Przekroje**: podkłady, szyny oraz spody podsypki i podbudowy w każdym przekroju.
- **3D**: szyny, każdy podkład i podsypka (Pokaż › Tor), także w GLB, OBJ i USD.
- **Ilości**: długość toru, szyny (obie szyny każdego toru, wzdłuż własnej linii każdego toru), podkłady, podsypka, podsypka pomniejszona o podkłady oraz podbudowa, metodą średnich pól przekrojów między przekrojami.

## Sprawdzanie geometrii toru

Oprócz przechyłki blok Kolej sprawdza sam tor względem sześciu kolejnych ograniczeń (wszystkie są wartościami zastępczymi, wszystkie do ustawienia przez ciebie):

- **Najbardziej strome pochylenie** projektowanej niwelety, w mm na metr.
- **Najmniejszy promień łuku pionowego** jako współczynnik k w R ≥ k·V² (R w metrach, V w km/h). Paraboliczny łuk pionowy o długości L między dwoma pochyleniami ma promień równy L podzielone przez zmianę pochylenia.
- **Najkrótszy łuk pionowy**.
- **Najmniejszy promień łuku** w planie (0 wyłącza sprawdzenie).
- **Najkrótszy łuk lub prosta** jako sekundy jazdy przy prędkości linii: łuk kołowy albo prosta między dwoma łukami krótsza niż ta odległość daje ostrzeżenie. 1.8 s to znana zasada „połowa prędkości w km/h, w metrach”.
- **Zmiana niedoboru przechyłki** wzdłuż każdego przejścia, w mm/s przy prędkości linii.

**Geometria toru** wypisuje znalezione najbardziej strome pochylenie i każdy łuk pionowy z jego promieniem oraz promieniem wymaganym przez prędkość linii. Łuk pionowy leżący na przejściu lub rampie przechyłki dostaje uwagę. Bez projektowanej niwelety albo bez prędkości projektowej sprawdzenia, które ich wymagają, są pomijane, a uwaga o tym informuje.

## Rozjazdy i łącznice

Pod **Rozjazdy i łącznice** naciśnij **Dodaj rozjazd**. Rozjazd zostaje umieszczony na najdłuższej prostej; ustaw w tabeli:

- **Kilometraż początku zwrotnicy**: miejsce, w którym rozjazd zaczyna się na tej trasie.
- **Krzyżownica**: liczba krzyżownicy N (1:N). Kąt krzyżownicy to 2·atan(1 / 2N).
- **Strona**: lewa lub prawa, patrząc w kierunku rosnącego kilometrażu.
- **Odstęp łącznicy** w metrach: powyżej 0 rozjazd staje się łącznicą do równoległego toru w tej odległości (dwa rozjazdy i prosta między nimi).

Tabela pokazuje **Lead** (od początku zwrotnicy do krzyżownicy), **Promień** łuku zamykającego oraz **Prędkość na odgałęzieniu**, jaką ten promień dopuszcza przy twoim ograniczeniu niedoboru przechyłki i bez przechyłki. **Utwórz jego tor** zamienia odgałęzioną drogę w osobną trasę (zwrotnica, łuk zamykający, a potem prosto pod kątem krzyżownicy) z tymi samymi ustawieniami kolei, gotową do wydłużenia.

Plan rysuje dwie odgałęzione szyny każdego rozjazdu, jego oś, kreskę przy początku zwrotnicy i przy krzyżownicy oraz „1:N” (warstwa C-RAIL-TURN), na ekranie oraz w DXF, DWG, PDF i arkuszach. Widok 3D rysuje odgałęzione szyny na poziomie toru głównego.

Kształt jest **wartością zastępczą**: prosta zwrotnica i jeden łuk zamykający wyliczony z liczby krzyżownicy. Zbudowany rozjazd musi odpowiadać standardowi kolei i rysunkowi producenta. Ostrzeżenia: rozjazd wychodzący poza trasę, leżący na łuku, przejściu, przechyłce lub łuku pionowym albo nakładający się na inny; oraz uwaga, gdy prędkość linii przekracza jego prędkość na odgałęzieniu.

## Obrys prześwitu

Zaznacz **Przeciągnij obrys prześwitu wzdłuż tego toru**. Wybierz **Zarys** (dwa kształty zastępcze lub **Własny zarys** wpisany jako punkty, po jednym w wierszu: przesunięcie od osi toru, a następnie wysokość nad wierzchem szyny, w metrach), **Długość pojazdu** i **Rozstaw wózków**, a jeśli jest, **Krawędź peronu** (strona, odległość od osi toru, wysokość nad szyną).

Na każdym kilometrażu zarys jest przechylany z przechyłką wokół szyny niskiej i poszerzany przez łuk: środek pojazdu przesuwa się do wewnątrz o b² / 8R, a jego końce na zewnątrz o (L² − b²) / 8R (b to rozstaw wózków, L długość pojazdu, R promień w tym miejscu, z uwzględnieniem przejścia). Blok rysuje przekrój na prostej i tam, gdzie obrys jest najszerszy, oraz wypisuje:

- **najszerszy obrys** i jego miejsce,
- **odstępy torów** zestawione z odstępami, jakich wymagają dwa sąsiednie obrysy,
- zapas na **krawędzi peronu** albo informację, o ile jest on wewnątrz,
- każdą linię obiektu, budowlę rurową i inną trasę kolejową znalezioną **wewnątrz obrysu**.

Linia obiektu z rzędnymi jest oceniana względem zarysu na jej wysokości nad szyną; bez projektowanej niwelety albo dla punktu bez rzędnej ocena jest tylko w planie, a lista to mówi. Plan pokazuje dwie krawędzie obrysu (warstwa C-RAIL-CLRN) z krzyżykiem przy każdym obiekcie wewnątrz.

Proponowane zarysy są **wartościami zastępczymi, a nie gabarytem jakiejkolwiek kolei**. Wpisz gabaryt budowli swojej kolei, zanim polegasz na wyniku.

## W innych programach

- **LandXML**: trasa kolejowa jest zapisywana z przejściami (spiType) i blokiem `Cant`: rozstaw szyn, punkt obrotu, prędkość linii oraz kilometraż, w którym zaczyna się i kończy każda rampa przechyłki, wraz z zastosowaną przechyłką, przechyłką równowagową i niedoborem. Otwarcie pliku LandXML z blokiem `Cant` zamienia tę trasę w tor kolejowy z tymi przechyłkami.
- **IFC**: trasa z segmentami przechyłki, szynami, podkładami, podsypką i podbudową.

## Jeszcze nie zbudowano

Rozjazdy w eksporcie IFC; rodziny rozjazdów poza jednym łukiem zamykającym (zwrotnice łukowe, krzyżownice z iglicą ruchomą, skrzyżowania torów, rombowe); zasady gabarytu kinematycznego (obrys jest stałym zarysem z odchyleniem na łuku); sieć trakcyjna i sygnalizacja.

**Jaka norma.** W bloku Kolej pozycja „Norma do powołania” przyjmuje wartości Brak lub Europejska (UIC i EN). Wybór Europejska wymienia dokumenty, na które powołuje się projekt europejski (EN 13803 dla parametrów trasy, EN 13232 dla rozjazdów i skrzyżowań torów, EN 15273 dla gabarytów, EN 13848 dla jakości geometrii toru) i daje każdemu ograniczeniu pole na punkt normy, z którego pochodzi. Żadna liczba z żadnej normy nie jest wbudowana: ograniczenia przechyłki, niedoboru, nadmiaru, pochylenia i zmiany, geometria rozjazdu oraz gabaryt budowli są nadal wartościami zastępczymi, a okno to mówi. Inżynier kolejowy sprawdza każdą wartość względem tekstu danej normy i wpisuje obok numer punktu, zanim cokolwiek zostanie zbudowane. Republika Południowej Afryki i tabele AREMA nie są w tym wydaniu.
