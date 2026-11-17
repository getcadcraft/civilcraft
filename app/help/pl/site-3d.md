---
title: Teren w widoku 3D
summary: Otwórz widok 3D, orbituj, przesuwaj i powiększaj, ustaw przewyższenie pionowe i kolorowanie, wybierz, co ma być widoczne, i klikaj osie trasy, place, linie charakterystyczne, linie załamań, rury, konstrukcje i punkty, aby je zaznaczyć.
keywords: etykiety, etykiety 3d, tablica, etykiety zwrócone do kamery, etykiety pikiet, etykiety warstwic, etykiety punktów, drapowanie, lotniczy, warstwy map na powierzchni, 3d, trzy wymiary, widok 3d, kostka widoku, kompas, orbita, perspektywa, równoległy, izometryczny, iso, przewyższenie pionowe, teren, model, model terenu, przelot, wizualizacja, renderowanie, rury w 3d, konstrukcje, studzienki, korytarz 3d, droga w 3d, nawierzchnia drogi, pasy ruchu, krawężniki, chodniki, rośliny w 3d, drzewa w 3d, krzewy, żywopłoty, krajobraz 3d, rampy w 3d, schody, mury, bruk, twarde nawierzchnie 3d
from: a16bafe1
---

Widok 3D pokazuje teren jako jeden model: istniejący grunt i wyrównany teren, warstwice narysowane na nich, linie załamań i krawędź powierzchni, każdą oś trasy na jej linii projektowej z kreskami kilometrażu, linie charakterystyczne korytarza oraz samą drogę (pasy ruchu, pobocza, rynny, krawężniki, pasy i chodniki w ich własnych kolorach), place z liniami przecięcia z terenem, sieć rur z rurami i konstrukcjami na ich rzeczywistych rzędnych oraz, z obszaru roboczego Krajobraz, rośliny, nawierzchnie, ścieżki, mury, obrzeża, rampy i schody. Czyta ten sam projekt co plan, więc każda edycja jest widoczna w obu.

## Otwórz widok 3D

1. Otwórz punkty geodezyjne (albo plik LandXML lub projekt), aby istniała powierzchnia. Same rośliny, nawierzchnie lub rampy też wystarczą, aby go otworzyć.
2. Naciśnij {{key:D}} albo kliknij {{ui:3D}} w grupie {{ui:View}} na pasku narzędzi.
   Widok 3D otwiera się nad planem, patrząc na cały teren z południowego wschodu. Za pierwszym razem ładowanie trwa chwilę.
3. Naciśnij {{key:D}} ponownie albo kliknij ponownie {{ui:3D}}, aby wrócić do planu. Wybór narzędzia rysunkowego, takiego jak {{ui:Alignment}} lub {{ui:Pad}}, także przełącza na plan, ponieważ rysowanie odbywa się tam.

## Poruszanie się

| Aby | Zrób to |
|---|---|
| Orbitować | Przeciągnij lewym lub środkowym przyciskiem |
| Przesunąć | Przeciągnij prawym przyciskiem albo {{key:Shift}} i przeciągnij |
| Powiększyć | Obracaj kółkiem; powiększa w kierunku wskaźnika |
| Orbitować na gładziku | Przesuń dwoma palcami ({{key:Shift}} i przesunięcie przesuwa) |
| Powiększyć na gładziku | Rozsuń palce |
| Dotyk | Jeden palec orbituje; dwa palce rozsuwają, aby powiększyć, i przesuwają, aby przesunąć |
| Klawisze (widok ma fokus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitują, z {{key:Shift}} przesuwają; {{key:Plus}} i {{key:Minus}} powiększają |

Pasek nad widokiem ma resztę:

- Lista widoków: **Iso**, **Góra**, **Dół**, **Przód** (patrząc na północ), **Tył**, **Lewo**, **Prawo**.
- {{ui:Perspective}}: wciśnięte to widok perspektywiczny; kliknij, aby przejść na rzut równoległy (bez skrótu perspektywicznego).
- {{ui:Extents}}: pokazuje wszystko ponownie. {{key:F}} robi to samo, gdy widok 3D jest otwarty.

## Kostka widoku

Kostka widoku w prawym górnym rogu obraca się razem z widokiem. Kliknij stronę, krawędź lub narożnik, aby patrzeć na teren z tego miejsca (kamera obraca się płynnie, chyba że system prosi o ograniczenie ruchu). Przeciągnij kostkę, aby orbitować. Pierścień kompasu pod nią pokazuje północ (północ siatki, +Y): przeciągnij pierścień, aby obrócić teren wokół pionu, albo kliknij N, E, S lub W, aby patrzeć z tej strony. {{ui:Home}}, mały domek w jej lewym górnym rogu, wraca do widoku izometrycznego całego terenu. Klawiaturą: {{key:Tab}} do kostki, strzałki wybierają stronę, krawędź lub narożnik, {{key:Enter}} patrzy z tego miejsca.

Na planie ta sama kostka pokazuje górę. Kliknij dowolną inną stronę, krawędź lub narożnik (albo ją przeciągnij), aby otworzyć widok 3D patrzący z tego miejsca: to najszybsza droga do 3D z danego kierunku. Aby zamienić kostkę na małą ikonę osi albo ją ukryć, zobacz **Wskaźnik narożnika** w [Ustawieniach CivilCraft](topic:settings).

## Przewyższenie rzędnych

Tereny są zwykle znacznie szersze niż wyższe, więc rzędne są na początku rozciągnięte **2×**. Wybierz **1×**, **2×**, **3×**, **5×** lub **10×** na liście na pasku albo w **Przewyższenie pionowe 3D** w [Ustawieniach CivilCraft** (oba to jedno ustawienie). Zmienia się tylko widok: objętości, profile i eksporty pozostają w skali rzeczywistej.

## Kolorowanie powierzchni

- **Pasma wysokości**: te same pasma i kolory co pasma wysokości na planie (liczbę pasm ustawia się w **Wyświetlanie** w lewym panelu). Każda krawędź pasma jest przecinana dokładnie na swojej rzędnej.
- **Jeden kolor**: istniejący teren i wyrównana powierzchnia, każdy w jednolitym kolorze.
- **Warstwy map**: warstwy map widoczne pod planem (obraz georeferencyjny, kafle map lub usługa map; zobacz [Warstwy map](topic:map-layers)) nałożone na powierzchnie jak arkusz, więc zdjęcie lotnicze pokazuje się na wzgórzach. Obrazy, które wciąż napływają, uzupełniają się w miarę nadejścia. Gdy żadna warstwa mapy nie jest widoczna, powierzchnie zachowują swoje pasma wysokości, a widok to mówi. Obraz służy do ekranu: eksporty GLB i OBJ go nie zawierają.

Gdy widoczne są obie powierzchnie, istniejący teren jest półprzezroczysty nad wyrównaną powierzchnią, dzięki czemu widać wykop (teren powyżej projektu) i nasyp.

## Wybierz, co ma być widoczne

Kliknij {{ui:Show}} na pasku i zaznacz lub odznacz:

| Element | Co to jest |
|---|---|
| Istniejący teren | Powierzchnia zbudowana z punktów geodezyjnych (albo odczytana z LandXML) |
| Wyrównana powierzchnia | Istniejący teren z wprowadzonymi korytarzami i placami (tylko gdy takie są) |
| Krawędzie trójkątów | Każda krawędź TIN, jako linie |
| Warstwice | Warstwice zwykłe i główne każdej pokazanej powierzchni, w interwale planu |
| Krawędź powierzchni | Zewnętrzna krawędź każdej pokazanej powierzchni, na jej rzędnych |
| Linie załamań | Każda linia załamań, na jej rzędnych |
| Osie i kilometraże | Każda oś na swojej linii projektowej (na terenie tam, gdzie nie ma profilu), z kreskami co 50 ft lub 20 m |
| Linie charakterystyczne korytarza | Krawędź jezdni, pobocze i linia przecięcia z terenem po obu stronach |
| Powierzchnie drogi | Droga, którą buduje każdy korytarz, z jego przekroju: pasy ruchu, pobocza, rynny, krawężniki, pasy i chodniki, każdy we własnym kolorze, na wyrównanej powierzchni |
| Rośliny | Każda roślina oraz rośliny w rabatach i żywopłotach, jako proste bryły o wielkości z listy roślin: drzewo to pień i okrągła korona (stożek dla iglaka, pęk na wysokim pniu dla palmy), krzewy, byliny i rośliny okrywowe to kopuły, trawy to kępy, pnącza to cienkie słupki. Stoją na wyrównanej powierzchni (albo na istniejącym terenie) w wielkości, jaką pokazuje plan: dojrzałej albo w chwili sadzenia |
| Twarde nawierzchnie | Nawierzchnie i ścieżki z ich spadkami, mury, obrzeża, schody oraz rampy, które wspinają się w biegach z poziomymi spocznikami między nimi |
| Place i linie przecięcia | Obrys każdego placu na jego rzędnej i jego linia przecięcia z terenem |
| Rury i konstrukcje | Rury jako okrągłe rury między ich dnami wewnętrznymi, konstrukcje od włazu do sumpu |
| Punkty geodezyjne | Kropka przy każdym punkcie z rzędną (na początku wyłączone) |
| Warstwy GIS | Warstwy GIS pokazane na planie, w ich kolorach: linie i obrysy z ich własnymi rzędnymi na tych rzędnych, inne położone na istniejącym terenie (dokładnie za nim podążają); punkty jako małe krzyżyki. Kształty bez rzędnych poza powierzchnią są pomijane, a widok mówi, ile ich jest |
| Etykiety | Nazwy i wartości zawsze zwrócone do Ciebie: nazwa każdej osi na jej początku i jej kilometraże co 100 ft (lub 100 m), rzędna każdej warstwicy głównej, place, linie charakterystyczne i konstrukcje po nazwie, a przy zaznaczonym **Punkty geodezyjne** numer i rzędna każdego punktu |

Etykiety pozostają tego samego rozmiaru i pionowe, bez względu na obrót lub powiększenie, a wzgórze przed etykietą ją zasłania. Tam, gdzie się zagęszczają, najważniejsze pokazują się, a reszta czeka, aż powiększysz: najpierw osie, potem konstrukcje, place, linie charakterystyczne, kilometraże, warstwice i punkty, bliższe najpierw. Są tylko na ekranie; eksporty i wydruki je pomijają.

Twoje wybory, przewyższenie i kolorowanie są zapamiętywane w tej przeglądarce.

Droga jest budowana na istniejącym terenie. Gdy są oś i korytarz, ale nie ma jeszcze punktów geodezyjnych ani powierzchni, droga jest rysowana na zastępczym płaskim terenie: na średniej rzędnej jej linii projektowej albo na poziomie rzędnej 0, gdy nie ma również profilu. Ostrzeżenie u dołu widoku 3D i we właściwościach korytarza to mówi. To tylko obraz: nie wynikają z niego żadne objętości ani przekroje. Otwórz punkty geodezyjne lub powierzchnię, a droga sama przesunie się na prawdziwy teren.

Przewyższenie pionowe rozciąga teren, a nie rośliny: stoją na przewyższonym terenie w swojej prawdziwej wysokości i rozpiętości, więc drzewo wygląda jak drzewo przy każdym ustawieniu. Rośliny to proste kształty, a nie szczegółowe modele: tysiące z nich pozostają szybkie do obracania i powiększania.

## Rury i konstrukcje

- Rura jest rysowana tak, że jej dno wewnętrzne leży na dnach, które ustawiłeś, a jej wierzch (korona) jest o jedną średnicę wewnętrzną wyżej. Średnice są w calach w projekcie w stopach i w milimetrach w projekcie metrycznym, jak w prawym panelu.
- Konstrukcja biegnie od swojego włazu (wpisanego albo z powierzchni) w dół do sumpu (najniższe dno minus głębokość sumpu). Bez żadnego dna jest rysowana na głębokość 5 ft (1,5 m).
- Rury i konstrukcje z problemem (zobacz sprawdzenie sieci w prawym panelu) są rysowane na czerwono.
- Rura bez den nie jest rysowana; uwaga na dole widoku mówi, ile ich jest.

## Wybieranie z widoku 3D

Kliknij oś trasy (lub jej drogę), plac, linię charakterystyczną, rurę, konstrukcję, punkt geodezyjny, roślinę, rampę lub inną twardą nawierzchnię. Zostaje zaznaczona tak samo, jak gdybyś kliknął ją na planie: jej właściwości otwierają się w prawym panelu, gdzie możesz je edytować, i jest rysowana w kolorze zaznaczenia na wierzchu wszystkiego w 3D. Cokolwiek zaznaczysz na planie, jest też podświetlone w 3D. Podpowiedź przy wskaźniku nazywa to, co kliknąłeś, wraz z jego wschodnią współrzędną, północną i rzędną. Rury i konstrukcje można kliknąć nawet tam, gdzie są pod ziemią; linii ukrytej za wzgórzem nie da się kliknąć przez nie.

Kliknij linię załamań, aby zobaczyć, którą to jest: zostaje podświetlona, a pasek stanu ją nazywa (linie załamań nie mają własnych właściwości).

Kliknij grunt, aby odczytać w podpowiedzi wschodnią współrzędną, północną i rzędną tego miejsca.

## Jazda wzdłuż osi

Kliknij **Jazda** na pasku 3D i wybierz oś trasy. Widok przenosi się na miejsce kierowcy: 3,5 ft (1,07 m) nad drogą, na jej linii projektowej (na istniejącym terenie wzdłuż osi, gdy jeszcze jej nie ma), patrząc przed siebie wzdłuż niej.

- **Odtwórz** albo {{key:Space}} jedzie z prędkością, którą wybierzesz (10 do 65 mph lub 15 do 100 km/h); {{key:Space}} ponownie wstrzymuje. Zatrzymuje się na końcu; **Odtwórz** zaczyna wtedy od początku.
- Suwak przeskakuje do dowolnego kilometrażu; {{key:Left}} i {{key:Right}} cofają lub przesuwają o 10 ft (5 m).
- Przeciągnięcie w widoku wstrzymuje jazdę i pozwala się rozejrzeć.
- **Zatrzymaj** albo {{key:Esc}} przywraca widok do poprzedniego miejsca.

Przewyższenie pionowe działa także podczas jazdy: ustaw 1×, aby zobaczyć drogę tak, jak będzie.

## Światło słoneczne

Otwórz **Słońce** na pasku 3D i zaznacz **Światło słoneczne**. Podaj datę, godzinę zegarową i jej strefę czasową (przesunięcie względem UTC: latem, z czasem letnim), oraz szerokość i długość geograficzną terenu. Gdy projekt ma układ współrzędnych, są one wypełniane z niego.

Teren jest wtedy oświetlany z miejsca, w którym jest słońce, z **Cieniami** na gruncie, korytarzu i placach; menu podaje azymut słońca i jego wysokość albo to, że jest pod horyzontem. Pozycje pochodzą z równań słonecznych NOAA. Cienie padają we właściwą stronę przy każdym przewyższeniu, ale kończą się na krawędzi terenu: wzgórza i budynki poza nią nie rzucają ich.

## Eksport widoku 3D

Kliknij {{ui:GLB}} lub {{ui:OBJ}} na pasku. To, co pokazuje widok, zostaje zapisane w skali rzeczywistej (bez przewyższenia), w metrach, z osią Y skierowaną w górę. Szczegóły: [Eksport terenu w 3D](topic:export-3d).
