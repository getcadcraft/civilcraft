---
title: Jeszcze nie zbudowano
summary: Czego ta wersja CivilCraft jeszcze nie robi i co zrobić zamiast tego dzisiaj.
keywords: brakujące, ograniczenia, plan rozwoju, niedostępne, klotoidy, poszerzenie, dwg, dxf, wpusty, zbiorniki retencyjne, przekroje poprzeczne, przyszłe wydania, limity
from: b91588d4
---

CivilCraft jest we wczesnej fazie. Ta strona wymienia to, czego obecna wersja nie robi, abyś tego nie szukał. Nic tutaj nie ma podanej daty.

## Punkty

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Dodawanie drugiego pliku punktów do pierwszego | Połącz pliki w edytorze tekstu albo arkuszu kalkulacyjnym |
| Eksport pliku tekstowego punktów | Eksportuj LandXML (punkty wychodzą jako CgPoints), użyj GIS {{ui:Eksport}} (punkty z polami P, N, E, Z i D) albo {{ui:Kopiuj}} punkty do arkusza kalkulacyjnego |
| Style etykiet punktów, symbole według kodu opisowego, łuki z kodów linii, plik kodów opisowych do współdzielenia między projektami | Etykiety pokazują numer, rzędną i opis albo mniej ([Ustawienia CivilCraft](topic:settings)); kody są zapisane w pliku projektu |
| Przeliczanie jednostek | Przelicz plik przed importem; **Jednostki** tylko zmieniają etykiety |

## Powierzchnie

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Więcej niż jedna powierzchnia zbudowana z punktów | Jeden projekt na jedną powierzchnię |
| Ukrywanie granic wewnętrznych | Użyj **Najdłuższej zewnętrznej krawędzi** albo granicy zewnętrznej |
| Zaznaczanie lub edycja jednej narysowanej linii przełamania | {{key:Mod+Z}} albo {{ui:Usunięcie narysowanych linii przełamań}} i narysuj ponownie |
| Edycja powierzchni odczytanej z LandXML (linie przełamań, granica) | {{ui:Przebuduj powierzchnię z punktów}} |
| Edycja powierzchni zrobionej z siatki rzędnych | Zaimportuj siatkę ponownie z innymi wyborami |
| Przeliczanie powierzchni odczytanej z LandXML, gdy zmienia się układ współrzędnych | Najpierw {{ui:Przebuduj powierzchnię z punktów}} |
| Opisane rzędne punktowe i wartości spadków | Odczytaj je w pasku stanu albo pokoloruj powierzchnię według spadku poleceniem **Analiza spadków** w obszarze roboczym Krajobraz ([Zagospodarowanie terenu](topic:landscape-grading#grading-checks)) |

## Trasy i profile

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Klotoidy inne niż clothoid; klotoida między dwoma łukami (przejścia złożone) | Klotoidy na końcach łuku są dostępne; pozostałe są nazwane i pomijane przy imporcie LandXML |
| Wstawianie PI między dwa inne | Narysuj trasę ponownie albo wpisz ponownie współrzędne PI |
| Trasy z obiektów, odsunięć, poszerzeń | Rysuj przez PI |
| Wpisywanie K dla łuku pionowego | Wpisz L (K jest pokazywane) |
| Okrągłe i niesymetryczne łuki pionowe | Tylko symetryczne łuki paraboliczne |
| Więcej niż jeden profil projektowy na trasę | Jedna trasa na jeden wariant |
| Powiększanie widoku profilu, pasy profilu pod profilem | Widok profilu dopasowuje całą trasę; wydrukuj go na [arkuszach planu i profilu](topic:plan-profile-sheets) |
| Przekroje w DWG albo LandXML | Arkusze przekrojów jako PDF; {{ui:CSV}} z polami i objętościami |
| Linie próbkowania pod kątem albo o różnych szerokościach wzdłuż drogi | Jedna szerokość na każdą stronę dla całej trasy |

## Korytarze

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Pasy dzielące, bariery i przechyłka obracająca szablony | Narysuj je jako szablony ([Szablony korytarzy](topic:corridor-templates)); szablony według kilometrażu nie uwzględniają jeszcze przechyłki |
| Płynna zmiana między szablonami dwóch regionów (przejścia, zwężenia) | Zmień szablon na danym kilometrażu albo nadaj punktowi cel szerokości do linii narysowanej jako zwężenie |
| Obrót wokół krawędzi, przechyłka w LandXML | Przechyłka obraca się wokół osi na łukach kołowych; poszerz pas celem szerokości do linii charakterystycznej |
| Cele dla skarp bocznych (linia zrównania do linii lub powierzchni), własne powierzchnie korytarzy | Cele przesuwają krawędzie jezdni i pobocza ([Korytarze](topic:corridor)); korytarz wyrównuje się do powierzchni projektowej |
| Narożne zaokrąglenia krawężników, pasy skrętne i wysepki wyrównane w skrzyżowaniu; koniec drogi bocznej cięty do krawędzi drogi głównej przy skosie; ścieżka połączona z drogą w planie, w jej długości i polu | Drogi, które się łączą, są łączone prostopadle: krawędź drogi głównej jest otwarta, a droga boczna wyrównana do niej ([Gdzie drogi się łączą](topic:corridor#where-roads-meet-roads-pads-and-paths)); ścieżka zatrzymuje się na krawędzi drogi w powierzchni projektowej i w 3D |
| Korytarze eksportowane jako drogi LandXML; drugi korytarz na trasie w eksporcie IFC | Eksportowana jest powierzchnia projektowa |
| Szablony terenu zmieniające powierzchnię projektową, w 3D albo w przekrojach | Dają pola i objętości każdej warstwy ([Szablony terenu](topic:corridor-templates#terrain-templates)) |
| Ścieżki przejazdu z prędkością, poślizgiem opon, czasem skrętu, przyczepami albo prześwitem nadwozia; biblioteka standardowych pojazdów projektowych; ścieżka przejazdu rysowana przez przeciąganie pojazdu | Ścieżki przejazdu przy małej prędkości wzdłuż linii charakterystycznej albo trasy, z własnymi wymiarami pojazdu ([Ścieżki przejazdu pojazdów](topic:swept-paths)) |

## Wyrównanie i objętości

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Ławy, otwarte linie charakterystyczne wyrównane do projektu, wyrównanie do linii charakterystycznej z innego miejsca | Zamknij linię charakterystyczną ([Linie charakterystyczne](topic:feature-lines)) albo użyj jej jako linii przełamania istniejącego terenu |
| Wstawianie lub usuwanie wierzchołka linii charakterystycznej | Narysuj linię ponownie albo zrób jej odsunięcie schodkowe |
| Łuki w narysowanych liniach przełamań (przez punkty pomiarowe), klotoidy w liniach charakterystycznych | Narysuj linię charakterystyczną z łukami i użyj jej jako linii przełamania istniejącego terenu |
| Wyrównanie do odległości, rzędnej albo innej powierzchni | Tylko linia zrównania do istniejącego terenu |
| Dodawanie lub usuwanie narożnika placu | Usuń plac i narysuj go ponownie |
| Objętości TIN-do-TIN (pryzmaty), wybór rozmiaru komórki siatki | Metoda siatki, rozmiar komórki wybrany za Ciebie |
| Spęcznienie i kurczenie, humus, grubości nawierzchni | Zastosuj współczynniki do podanych liczb samodzielnie |
| Koszty transportu darmowego i nadmiernego, transport między różnymi trasami, pożyczkowe wyrobiska i wysypiska zaznaczone w planie | Diagram mas z punktami bilansowymi, przesuniętymi objętościami i średnimi odległościami transportu |

## Systemy rurociągów

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Więcej niż jedna sieć w projekcie | Osobne projekty dla burzowej i sanitarnej |
| Przewody wodociągowe: jakość i wiek wody, sterowanie oparte na regułach, inne typy zasuw (regulacyjne, dławiące, podtrzymujące), pompy podane mocą, zapotrzebowanie zależne od ciśnienia, opcja Darcy–Weisbach, katalog rur z grubościami ścianek i klasami ciśnienia. Reszta sieci ciśnieniowych jest w laboratorium: [Przewody wodociągowe](topic:water-mains) | Sprawdź je w oprogramowaniu do dystrybucji wody; przepływy projektowe kanalizacji sanitarnej są w [Przepływy projektowe sanitarne](topic:sanitary-design) |
| Przepływy kanalizacyjne w czasie (hydrogramy, trasowanie dynamiczne, retencja, pompy, przelewy) | [Przepływy projektowe sanitarne](topic:sanitary-design) podają stałą wartość szczytową, której używa arkusz projektowy |
| Wydajność wpustu, rozlew w ściekach, trasowanie w zbiornikach retencyjnych, hydrogramy, straty energii inne niż jeden współczynnik na węźle | Sprawdź je w innym oprogramowaniu; przepływy, rozmiary i linie niwelety są w [Odwodnieniu burzowym](topic:storm-drainage) |
| Zlewnie w wydruku PDF, DWG, DXF albo LandXML; zlewnie wynikające z powierzchni (działy wodne) | Rysuj zlewnie ręcznie; są zapisywane w pliku projektu |
| Katalogi rur, rury nieokrągłe, konstrukcje, które nie są prostymi skrzynkami albo walcami (stożki, stopnie, ławy), kategoria odwodnienia w bibliotece | Typy konstrukcji z parametrów ([Sieć rurociągów](topic:pipe-network)); rury o średnicy |
| Rury w widoku profilu, zakrzywione rury | Odczytaj spody i nadkłady w prawym panelu |

## Działki

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Wyznaczanie działek według powierzchni lub frontu, działki z linii je otaczających, prawo drogi | Rysuj każdą działkę po jej narożnikach albo wpisz jej osnowę |
| Tabele łuków i tabele prostych w planie; etykiety przesuwane ręcznie | Każdy odcinek jest podpisany wzdłuż siebie |
| Działki w LandXML | Działki są zapisywane w pliku projektu i trafiają do PDF, DWG i DXF |

## Ciągi poligonowe

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Wyrównanie metodą najmniejszych kwadratów, reguła transitu, ważenie kątów względem odległości | Reguła kompasu |
| Kąty odchylenia, kąty zenitalne i odległości pochyłe, rzędne przez niwelację trygonometryczną | Sprowadź do odległości poziomych i kątów poprawnie albo do azymutów |
| Pomiary boczne, surowe pliki danych z rejestratorów | Zaimportuj punkty jako plik punktów |

## Wytyczenie

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Palki odsunięte (punkty odniesienia cofnięte od palika), palki skarpowe w punkcie zrzutu | Wytycz w odsunięciach, które potrzebujesz, także poza krawędzią pobocza |
| Wysyłanie palików wprost do własnego formatu rejestratora | Plik CSV otwiera się w oprogramowaniu biurowym większości rejestratorów |
| Wytyczanie rur, placów i działek | Użyj punktów pomiarowych w pobliżu trasy albo kursów działki |

## Pliki i wyjście

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Tekst, kreskowania i wymiary z DWG albo DXF; przestrzeń papierowa; dołączone rysunki (xref); binarny DXF | Otwiera się rysunek liniowy z przestrzeni modelu ([Otwórz DWG lub DXF jako rysunek liniowy](topic:open-dwg-dxf)); otwórz dołączone rysunki osobno |
| Przesuwanie kilku punktów naraz przeciąganiem | Wytnij i wklej je albo edytuj po jednym |
| Arkusze pionowe, własne tabliczki rysunkowe, okna widokowe, które ustawiasz samodzielnie, arkusze planu i profilu w DWG | Jeden arkusz planu w poziomie na PDF albo arkusze planu i profilu wzdłuż trasy (PDF) |
| Drukowanie pasów rzędnych i profili | Pasy są tylko na ekranie; zrób zrzut ekranu, jeśli ich potrzebujesz |
| Zmiana nazw warstw, kolorów lub stylów etykiet | Zmień je w programie CAD po eksporcie DXF |
| Zapis w chmurze i historia wersji | Zapisuj pliki `.civilcraft.json` i trzymaj kopię zapasową; aby pracować nad projektem wspólnie, użyj sesji na żywo w CadCraft Studio ([Wspólnie na żywo nad jedną działką](topic:work-live)) |
| CadCraft Studio na iPad i iPhone oraz z Google Play | Użyj CivilCraft w przeglądarce na urządzeniu; na Androidzie CadCraft Studio instaluje się z pliku APK na getcadcraft.com/download |
| Otwieranie kilku plików punktów albo projektów naraz | Jeden plik na jedno otwarcie (pliki GIS, które do siebie należą, na przykład części shapefile, otwierają się razem) |

## Krajobraz

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Głowice i dysze producentów | Ogólne głowice albo dodaj własne z pliku; dane producentów pojawią się, gdy udzielą zgody |
| Maksymalne długości bocznic dla przewodów kroplujących, przepływy w czasie, pompy, pętlowe sieci rurociągów | Trzymaj odcinki kroplujące w opublikowanej przez producenta długości; kontrola wymaga sieci rozgałęzionej |
| Dokładny zarys wklęsłego swobodnego obiektu; jego objętość pod ziemią mierzona dokładnie | Wyrównuje się wypukła otoczka, a objętość pod ziemią jest szacunkiem (podanym we Właściwościach) |
| Rośliny w natywnym Umieść z biblioteki BimCraft i ModelCraft | Wyeksportuj IFC krajobrazu i otwórz go w BimCraft obok budynku |
| Szczegółowe modele roślin (liście, gałęzie, pory roku) w widoku 3D; swobodne obiekty i nawadnianie w widoku 3D | Rośliny w 3D pokazują się jako proste formy, dobrane wielkością z listy roślin ([Zobacz teren w 3D](topic:site-3d)); rozproszenie w ModelCraft tworzy wizualizacje nasadzeń |
| Ściany podporowe utrzymujące wyrównany poziom za sobą na powierzchni | Nadaj platformie albo placowi pionowe boki: są ścianami oporowymi na powierzchni ([Wyrównanie](topic:grading)) |
| Przekształcenia SVG we własnych symbolach; tekstury i kolory własnych modeli roślin GLB; skompresowana geometria GLB | Najpierw spłaszcz przekształcenia w programie do rysunku; modele są rysowane w kolorze rośliny; eksportuj GLB bez kompresji ([Grafika roślin](topic:plant-graphics)) |
| Własna lista roślin przechowywana na koncie Biblioteki (edytowana w aplikacji) | Edytuj własną listę projektu w tabeli roślin i zapisz ją jako plik roślin |
| Narzędzia krajobrazu dla asystentów bez okna (serwer plików i wiersz poleceń) | Działają, gdy okno CivilCraft jest otwarte ([Pozwól asystentowi AI pracować z Twoim terenem](topic:assistants)) |

## Linie energetyczne

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Standard kraju wbudowany (przypadki obciążeń, prześwity, współczynniki) | Ustaw wartości swojego standardu w {{ui:Przypadki obciążeń i ograniczenia…}} i zapisz je wraz z biblioteką jako pakiet do ponownego użycia i udostępnienia ([Pakiety](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Odległość w bok od przewodu do korony drzewa albo ściany obok linii | Prześwit pionowo w górę nad roślinami i ścianami, które linia przecina ([Kontrole linii energetycznych](topic:power-line-checks#clearances)) |
| Pełzanie przewodu i wydłużenie nowego przewodu | Uwzględnij je przez temperatury w tabeli napinania |
| Obciążalność cieplna zakopanych kabli (obciążalność prądowa z ułożenia) | Wpisz obciążalność prądową dostawcy przy pozycji kabla |
| Badania zwarciowe, zabezpieczeń i uziemienia | Użyj dedykowanego programu elektrycznego; CivilCraft podaje długości sieci i kable |
| Słupy kratowe projektowane element po elemencie i kotwy odciągów w gruncie | Słupy sprawdza się według obciążenia nominalnego; odciągi według obciążenia znamionowego |
| Plik badania `.DON` sprawdzany w programie, który go czyta | Sprawdź plik tam; wyślij nam próbkę, abyśmy mogli przetestować na prawdziwym pliku |
| Linie energetyczne w widoku 3D i w IFC | Plan, profil linii, arkusze i warstwy GIS |
| Narzędzia linii energetycznych dla asystentów bez okna | Działają, gdy okno CivilCraft jest otwarte ([Pozwól asystentowi AI pracować z Twoim terenem](topic:assistants)) |

## Bryły zabudowy

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Biblioteka kodów zagospodarowania albo przepisów dowolnego miasta | Wpisz limity z własnej uchwały ([Limity zagospodarowania](topic:zoning-limits)) |
| Światło dzienne na ścianach (oświetlenie elewacji), wiatr | [Godziny nasłonecznienia](topic:sun-hours) liczą tylko bezpośrednie słońce |
| Cień od drzew, roślin albo czegokolwiek, co nie jest narysowane jako bryła | Narysuj sąsiednie budynki jako bryły |
| Kształty dachów na bryłach | Bryły o płaskich dachach |
| Otwory, dachy i rodzaje ścian, gdy bryła jest rozwijana w BimCraft | BimCraft buduje proste ściany zewnętrzne na każdej kondygnacji i stropie; resztę dodaj tam |

## GIS i układy współrzędnych

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Geobaza plikowa; style KML, ikony, nakładki i łącza sieciowe | Najpierw przekonwertuj do GeoPackage, shapefile albo GeoJSON; znaczniki KML są czytane bez stylów |
| Edycja obiektów GIS albo ich atrybutów | Edytuj je w programie GIS i zaimportuj ponownie. Panel Analiza tworzy nowe warstwy (bufor, nakładka, złączenie, zaznaczenie) i dodaje pola powierzchni i długości, ale nie edytuje obiektu w miejscu |
| Analiza sieci i rastrów, bufory o płaskich lub kwadratowych końcach i bufory jednostronne, dodawanie lub usuwanie wierszy i zmiana typu pola w tabeli atrybutów, ręczne kolory klas, legenda stylów w wydrukach | Użyj Zaznacz, aby wybrać obiekty i utworzyć z nich warstwę; płaskie końce nie są oferowane. Kolorowanie według atrybutu i tabela atrybutów są zbudowane: zobacz [Styl warstwy według atrybutu](topic:gis-symbology) i [Praca z tabelą atrybutów warstwy](topic:gis-table) |
| Style etykiet (rozmiar, położenie) i etykiety, które nie nachodzą na siebie | Etykiety mają jeden rozmiar i mogą się nakładać tam, gdzie obiektów jest dużo |
| Pionowe układy odniesienia i modele geoidy | Rzędne są używane tak, jak podaje je plik; sprawdź pionowy układ odniesienia samodzielnie |
| Przesunięcia siatki inne niż do NAD83 z NAD27 proponowane według obszaru (OSTN15; NTv2 dla innych układów działa po dodaniu pliku), kilka siatek naraz, siatki pionowe | Dodaj samodzielnie plik siatki dla swojego układu; jedna siatka na projekt |
| Warstwy map w DXF albo w eksportach 3D | Warstwy map trafiają do wydruku PDF i obok DWG jako obraz |
| Serwery map wymagające logowania, klucza albo tokena | Użyj publicznych usług albo pliku obrazu z georeferencją |
| Zapisywanie plików LAS lub LAZ z powierzchni, modelu terenu albo narzędzi siatki rzędnych i LiDAR | Eksportuj powierzchnie jako siatkę rzędnych GeoTIFF. Dodatek [Chmury punktów](topic:point-clouds) zapisuje oczyszczoną chmurę jako LAS 1.4 albo LAZ |
| Intensywność, kolor i powroty LiDAR; siatki rzędnych z kilkoma pasmami; pliki siatki lub LiDAR większe niż 200 MB | LiDAR jest filtrowany tylko według klasy, siatki używają pierwszego pasma; duże pliki najpierw podziel na kafle |

## Wejście

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Zaznaczanie prostokątem dotykiem (wymaga {{key:Shift}}) | Przytrzymaj każdy punkt pomiarowy, aby go dodać |
| Wpisywanie współrzędnych albo odległości w trakcie rysowania | Narysuj mniej więcej, a potem wpisz dokładne współrzędne PI w tabeli PI trasy |
| Wpisywanie współrzędnych narożników placów i konstrukcji | Przeciągnij ich uchwyty; przybliż, by uzyskać precyzję, i obserwuj E i N w pasku stanu |
| Przyciąganie do obiektów (inne niż punkty pomiarowe dla linii przełamań) | Przybliż i obserwuj pasek stanu |

## Widok 3D

| Jeszcze nie zbudowano | Zamiast tego, dzisiaj |
|---|---|
| Rysowanie lub edycja w widoku 3D | Rysuj i edytuj w planie; widok 3D podąża za każdą zmianą |
| Zaznaczanie linii charakterystycznych korytarza albo obiektów GIS kliknięciem w 3D | Kliknij je w planie |
| Eksport widoku z przewyższeniem albo w stopach | Eksporty są w skali rzeczywistej w metrach; zobacz [Eksport terenu w 3D](topic:export-3d) |
| Etykiety w eksportach GLB albo OBJ, rozmiary i style etykiet w 3D | Etykiety pokazują się tylko w widoku 3D, jednego rozmiaru; zobacz [Zobacz teren w 3D](topic:site-3d) |
| Tekstury ze zdjęć, nagrywanie przejazdu jako wideo, cienie spoza terenu, godziny nasłonecznienia w widoku 3D | Warstwy map nałożone na powierzchnie; przejazd i położenie słońca w jednym czasie; [godziny nasłonecznienia](topic:sun-hours) dla dnia albo pory roku w planie |
