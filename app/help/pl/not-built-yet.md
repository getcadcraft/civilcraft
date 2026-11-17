---
title: Jeszcze nie zbudowano
summary: Czego obecna wersja CivilCraft jeszcze nie robi i co zrobić zamiast tego dziś.
keywords: brak, ograniczenia, mapa drogowa, niedostępne, krzywe przejściowe, poszerzenia, dwg, dxf, wpusty, retencja, przekroje poprzeczne, dostępne później, limity
from: a2d970ef
---

CivilCraft jest we wczesnej fazie. Ta strona wymienia to, czego obecna wersja nie robi, aby nie szukać tego na próżno. Dla żadnej z tych pozycji nie podano terminu.

## Punkty

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Dołączanie drugiego pliku punktów do pierwszego | Połącz pliki w edytorze tekstu lub arkuszu kalkulacyjnym wcześniej |
| Eksport pliku tekstowego punktów | Eksportuj LandXML (punkty trafiają jako CgPoints), użyj {{ui:Eksport}} GIS (punkty z polami P, N, E, Z i D) albo {{ui:Kopiuj}} punkty do arkusza kalkulacyjnego |
| Style etykiet punktów, symbole dla każdego kodu opisowego, łuki z kodów linii, plik kodów opisowych do współdzielenia między projektami | Etykiety pokazują numer, rzędną i opis albo mniej ([Ustawienia CivilCraft](topic:settings)); kody są zapisane w pliku projektu |
| Konwersja jednostek | Przekonwertuj plik przed importem; **Jednostki** tylko zmieniają etykiety |

## Powierzchnie

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Więcej niż jedna powierzchnia zbudowana z punktów | Jeden projekt na jedną powierzchnię |
| Ukrywanie granic (wewnętrznych) | Użyj **Najdłuższa zewnętrzna krawędź** albo granicy zewnętrznej |
| Zaznaczanie lub edycja jednej narysowanej linii przełamania | {{key:Mod+Z}} albo {{ui:Usunięcie narysowanych linii przełamań}} i narysuj ponownie |
| Edycja powierzchni odczytanej z LandXML (linie przełamań, granica) | {{ui:Przebuduj powierzchnię z punktów}} |
| Edycja powierzchni z siatki rzędnych | Zaimportuj siatkę ponownie z innymi wyborami |
| Konwersja powierzchni odczytanej z LandXML, gdy zmienia się układ współrzędnych | Najpierw {{ui:Przebuduj powierzchnię z punktów}} |
| Opisane rzędne punktowe i wartości spadku | Odczytaj je w pasku stanu albo pokoloruj powierzchnię według spadku poleceniem **Analiza spadku** w obszarze Krajobraz ([Niwelacja dla krajobrazu](topic:landscape-grading#grading-checks)) |

## Trasy i profile

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Krzywe przejściowe inne niż klotoida; krzywa przejściowa między dwoma łukami (przejścia złożone) | Klotoidy na końcach łuku są dostępne; pozostałe są nazwane i pomijane przy imporcie LandXML |
| Wstawianie PI (punktu załamania) między dwoma innymi | Narysuj trasę od nowa albo wpisz ponownie współrzędne PI |
| Trasy z obiektów, odsunięć, poszerzeń | Rysuj przez PI |
| Wpisanie K dla krzywej pionowej | Wpisz L (K jest pokazywane) |
| Krzywe pionowe kołowe i niesymetryczne | Tylko symetryczne krzywe paraboliczne |
| Więcej niż jeden profil projektowy na trasę | Jedna trasa na wariant |
| Powiększanie widoku profilu, pasy pod profilem | Widok profilu mieści całą trasę; wydrukuj go na [arkuszach planu i profilu](topic:plan-profile-sheets) |
| Przekroje w DWG lub LandXML | Arkusze przekrojów jako PDF; {{ui:CSV}} powierzchni i objętości |
| Linie przekrojów pod kątem albo o różnych szerokościach wzdłuż drogi | Jedna szerokość z każdej strony dla całej trasy |

## Korytarze

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Pasy dzielące, bariery i przechyłka obracająca szablony | Rysuj je jako szablony ([Szablony korytarza](topic:corridor-templates)); szablony według kilometrażu jeszcze nie uwzględniają przechyłki |
| Płynna zmiana między szablonami dwóch odcinków (przejścia, zwężenia) | Zmień szablon w kilometrażu albo nadaj punktowi docelową szerokość linii narysowanej jako zwężenie |
| Obrót wokół krawędzi, przechyłka w LandXML | Przechyłka obraca się wokół osi na łukach kołowych; poszerz pas, nadając linii charakterystycznej docelową szerokość |
| Cele dla skarp (wcięcie do linii lub powierzchni), własne powierzchnie korytarza | Cele przesuwają krawędzie nawierzchni i poboczy ([Korytarze](topic:corridor)); korytarz jest niwelowany do powierzchni projektowej |
| Korytarze eksportowane jako drogi LandXML; drugi korytarz na trasie w eksporcie IFC | Eksportowana jest powierzchnia projektowa |
| Szablony terenu zmieniające powierzchnię projektową, w 3D lub w przekrojach | Dają pola i objętości każdej warstwy ([Szablony terenu](topic:corridor-templates#terrain-templates)) |
| Trajektorie z prędkością, poślizgiem opon, czasem skrętu, przyczepami lub prześwitem nadwozia; biblioteka standardowych pojazdów projektowych; trajektoria rysowana przez przeciąganie pojazdu | Trajektorie przy małej prędkości wzdłuż linii charakterystycznej lub trasy, z własnymi wymiarami pojazdów ([Trajektorie pojazdów](topic:swept-paths)) |

## Niwelacja i objętości

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Półki, otwarte linie charakterystyczne niwelowane do projektu, niwelacja do linii charakterystycznej z innego miejsca | Zamknij linię charakterystyczną ([Linie charakterystyczne](topic:feature-lines)) albo użyj jej jako linii przełamania istniejącego terenu |
| Wstawianie lub usuwanie wierzchołka linii charakterystycznej | Narysuj linię ponownie albo wykonaj jej odsunięcie schodkowe |
| Łuki w narysowanych liniach przełamań (przez punkty pomiarowe), krzywe przejściowe w liniach charakterystycznych | Narysuj linię charakterystyczną z łukami i użyj jej jako linii przełamania istniejącego terenu |
| Niwelacja do odległości, rzędnej lub innej powierzchni | Wcięcie tylko do istniejącego terenu |
| Dodawanie lub usuwanie narożnika placu | Usuń plac i narysuj go ponownie |
| Objętości TIN-do-TIN (graniastosłupy), wybór rozmiaru komórki siatki | Metoda siatkowa, rozmiar komórki wybrany automatycznie |
| Spulchnienie i kurczenie, humus, grubości nawierzchni | Zastosuj współczynniki do podanych liczb samodzielnie |
| Koszty przewozu swobodnego i dodatkowego, przewóz między różnymi trasami, wyrobiska i składowiska umieszczone w rzucie | Diagram mas z punktami bilansowymi, objętościami przemieszczonymi i średnimi odległościami przewozu |

## Sieci rurociągów

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Więcej niż jedna sieć w projekcie | Osobne projekty dla deszczowej i sanitarnej |
| Wodociągi: jakość i wiek wody, sterowanie regułowe, inne typy zaworów (regulacja przepływu, dławiący, podtrzymujący), pompy zasilane mocą, zapotrzebowanie zależne od ciśnienia, opcja Darcy–Weisbach, katalog rur z grubościami ścianek i klasami ciśnienia. Reszta sieci ciśnieniowych jest w fazie testowej: [Wodociągi](topic:water-mains) | Sprawdź je w oprogramowaniu do dystrybucji wody; przepływy projektowe kanalizacji są w [Przepływach projektowych sanitarnych](topic:sanitary-design) |
| Przepływy kanalizacyjne w czasie (hydrogramy, trasowanie dynamiczne, retencja, pompy, przelewy) | [Przepływy projektowe sanitarne](topic:sanitary-design) podają ustalony przepływ szczytowy, którego używa arkusz projektu |
| Wydajność wpustu, rozpływ w rynsztoku, trasowanie retencji, hydrogramy, straty energii inne niż jeden współczynnik węzła | Sprawdź je w innym oprogramowaniu; przepływy, wymiary i linie ciśnień są w [Odwodnieniu deszczowym](topic:storm-drainage) |
| Zlewnie w wydruku PDF, DWG, DXF lub LandXML; zlewnie z powierzchni (działy wodne) | Rysuj zlewnie ręcznie; są zapisywane w pliku projektu |
| Katalogi rur, rury nieokrągłe, budowle inne niż pionowe prostopadłościany lub walce (stożki, stopnie, wyprofilowania), kategoria odwodnienia w bibliotece | Typy budowli z parametrów ([Sieć rurociągów](topic:pipe-network)); rury o średnicy |
| Rury w widoku profilu, rury krzywoliniowe | Odczytaj dna i przykrycie w prawym panelu |

## Działki

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Wytyczanie działek według powierzchni lub frontu, działki z otaczających je linii, pas drogowy | Narysuj każdą działkę po jej narożnikach albo wpisz jej przebiegi |
| Tabele łuków i tabele linii w rzucie; etykiety przesuwane ręcznie | Każdy odcinek jest opisany wzdłuż siebie |
| Działki w LandXML | Działki są zapisywane w pliku projektu i trafiają do PDF, DWG i DXF |

## Ciągi poligonowe

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Wyrównanie metodą najmniejszych kwadratów, reguła transitu, ważenie kątów odległościami | Reguła kompasowa |
| Kąty odchylenia, kąty zenitalne i odległości skośne, rzędne z niwelacji trygonometrycznej | Sprowadź poprawnie do odległości poziomych i kątów albo do kierunków |
| Pomiary boczne, surowe pliki danych z rejestratorów | Zaimportuj punkty jako plik punktów |

## Tyczenie

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Paliki odsunięte (punkty odniesienia cofnięte od palika), paliki skarpowe w punkcie wcięcia | Tycz w potrzebnych odsunięciach, także za poboczem |
| Wysyłanie palików wprost w formacie rejestratora | CSV otwiera się w oprogramowaniu biurowym większości rejestratorów |
| Tyczenie rurociągów, placów i działek | Użyj punktów pomiarowych w pobliżu trasy albo odcinków działki |

## Pliki i wyjście

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Tekst, kreskowania i wymiary z DWG lub DXF; przestrzeń papieru; rysunki dołączone (xref); binarny DXF | Otwiera się geometria z przestrzeni modelu ([Otwórz DWG lub DXF jako linie rysunku](topic:open-dwg-dxf)); dołączone rysunki otwórz osobno |
| Przesuwanie kilku punktów naraz przez przeciąganie | Wytnij i wklej je albo edytuj jeden po drugim |
| Arkusze pionowe, własne tabliczki rysunkowe, okna widokowe ustawiane ręcznie, arkusze planu i profilu w DWG | Jeden poziomy arkusz planu na PDF albo arkusze planu i profilu wzdłuż trasy (PDF) |
| Wydruk pasów rzędnych i profili | Pasy są tylko na ekranie; zrób zrzut ekranu, jeśli są potrzebne |
| Zmiana nazw warstw, kolorów lub stylów etykiet | Zmień je w programie CAD po eksporcie DXF |
| Zapis w chmurze i historia wersji | Zapisuj pliki `.civilcraft.json` i wykonuj ich kopie zapasowe; do wspólnej pracy nad jednym projektem użyj sesji Live w CadCraft Studio ([Wspólne projektowanie terenu na żywo](topic:work-live)) |
| CadCraft Studio na iPad i iPhone oraz z Google Play | Używaj CivilCraft w przeglądarce na urządzeniu; na Androidzie CadCraft Studio instaluje się z pliku APK na getcadcraft.com/download |
| Otwieranie kilku plików punktów lub projektów naraz | Jeden plik naraz; pliki GIS, które do siebie należą (na przykład części shapefile), otwierają się razem |

## Krajobraz

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Głowice i dysze producentów | Ogólne głowice albo dodaj własne z pliku; dane producentów są dodawane, gdy udzielą zgody |
| Maksymalne długości bocznych linii kroplujących, przepływy w czasie, pompy, pierścieniowe sieci rurociągów | Utrzymuj odcinki kroplujące w długości opublikowanej przez producenta; sprawdzenie wymaga sieci rozgałęzionej |
| Dokładny zarys wklęsłego obiektu swobodnego; jego objętość poniżej terenu mierzona dokładnie | Otoczka wypukła jest niwelowana, a objętość poniżej terenu jest szacunkiem (podawanym we Właściwościach) |
| Rośliny z własnego Umieść z biblioteki w BimCraft i ModelCraft | Eksportuj IFC krajobrazu i otwórz go w BimCraft obok budynku |
| Szczegółowe modele roślin (liście, gałęzie, pory roku) w widoku 3D; obiekty swobodne i nawadnianie w widoku 3D | Rośliny pokazywane w 3D jako proste formy o rozmiarach z listy roślin ([Zobacz teren w 3D](topic:site-3d)); rozrzucanie w ModelCraft tworzy wizualizacje nasadzeń |
| Ściany twarde, które zatrzymują wyrównany poziom za nimi na powierzchni | Nadaj platformie lub placowi pionowe boki: są murami oporowymi na powierzchni ([Niwelacja](topic:grading)) |
| Transformacje SVG we własnych symbolach; tekstury i kolory własnych modeli roślin GLB; skompresowana geometria GLB | Spłaszcz transformacje w programie do rysowania; modele są rysowane kolorem rośliny; eksportuj GLB bez kompresji ([Grafika roślin](topic:plant-graphics)) |
| Własna lista roślin zapisana na koncie w bibliotece (edytowana w aplikacji) | Edytuj listę projektu w tabeli roślin i zapisz ją jako plik roślin |
| Narzędzia krajobrazu dla asystentów bez okna (serwer plików i wiersz poleceń) | Działają, gdy okno CivilCraft jest otwarte ([Pozwól asystentowi AI pracować z terenem](topic:assistants)) |

## Linie napowietrzne

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Wbudowany standard kraju (przypadki obciążeń, prześwity, współczynniki) | Ustaw wartości standardu w {{ui:Przypadki obciążeń i ograniczenia…}} i zapisz je wraz z biblioteką jako pakiet do ponownego użycia i udostępniania ([Pakiety](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Odległość boczna od przewodu do korony drzewa lub muru obok linii | Prześwit pionowo w górę nad roślinami i murami, które linia przecina ([Kontrole linii napowietrznych](topic:power-line-checks#clearances)) |
| Pełzanie przewodu i wydłużenie nowego przewodu | Uwzględnij je przez temperatury w tabeli napinania |
| Obciążalność cieplna kabli w ziemi (prąd dopuszczalny z ułożenia) | Wpisz obciążalność prądową od dostawcy na pozycji kabla |
| Analizy zwarciowe, zabezpieczeń i uziemienia | Użyj dedykowanego programu elektrycznego; CivilCraft podaje długości sieci i kable |
| Słupy kratowe projektowane element po elemencie oraz kotwy odciągów w gruncie | Słupy są sprawdzane według nominalnego obciążenia, a odciągi według obciążenia znamionowego |
| Plik analizy `.DON` sprawdzany w programie, który go czyta | Sprawdź plik tam; wyślij nam próbkę, abyśmy mogli testować na prawdziwym pliku |
| Linie napowietrzne w widoku 3D i w IFC | Rzut, profil linii, arkusze i warstwy GIS |
| Narzędzia linii napowietrznych dla asystentów bez okna | Działają, gdy okno CivilCraft jest otwarte ([Pozwól asystentowi AI pracować z terenem](topic:assistants)) |

## Bryły zabudowy

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Biblioteka kodów zagospodarowania lub przepisów dowolnego miasta | Wpisz limity z własnego przepisu ([Limity zabudowy](topic:zoning-limits)) |
| Światło nieba na ścianach (nasłonecznienie elewacji), wiatr | [Godziny nasłonecznienia](topic:sun-hours) liczą wyłącznie bezpośrednie słońce |
| Cień od drzew, roślin lub czegokolwiek, co nie jest narysowane jako bryła | Rysuj sąsiednie budynki jako bryły |
| Kształty dachów na bryłach | Bryły z płaskim wierzchem |
| Otwory, dachy i rodzaje ścian, gdy bryła jest rozwijana w BimCraft | BimCraft buduje proste ściany zewnętrzne na każdym poziomie i stropie; resztę dodaj tam |

## GIS i układy współrzędnych

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Geobaza plików; style KML, ikony, nakładki terenowe i łącza sieciowe | Konwertuj najpierw do GeoPackage, shapefile lub GeoJSON; znaczniki KML są odczytywane bez stylów |
| Edycja obiektów GIS lub ich atrybutów | Edytuj je w programie GIS i importuj ponownie. Panel Analiza tworzy nowe warstwy (bufor, nakładka, złączenie, zaznaczenie) i dodaje pola powierzchni oraz długości, ale nie edytuje obiektu w miejscu |
| Analiza sieciowa i rastrowa, bufory z płaskimi lub kwadratowymi końcami oraz bufory jednostronne, dodawanie lub usuwanie wierszy i zmiana typu pola w tabeli atrybutów, ręczne kolory klas, legenda stylu na wydrukach | Użyj {{ui:Zaznacz}}, aby wybrać obiekty i utworzyć z nich warstwę; płaskie końce nie są oferowane. Kolorowanie według atrybutu i tabela atrybutów są zbudowane: zobacz [Stylizacja warstwy według atrybutu](topic:gis-symbology) i [Praca z tabelą atrybutów warstwy](topic:gis-table) |
| Style etykiet (rozmiar, położenie) i etykiety, które się nie nakładają | Etykiety mają jeden rozmiar i mogą nachodzić na siebie tam, gdzie obiektów jest dużo |
| Układy wysokościowe i modele geoidy | Rzędne są używane tak, jak podaje plik; sprawdź układ wysokościowy samodzielnie |
| Przesunięcia siatek inne niż NAD27 do NAD83 proponowane według obszaru (OSTN15; NTv2 dla innych układów odniesienia działa po dodaniu pliku), kilka siatek naraz, siatki wysokościowe | Dodaj plik siatki dla swojego układu odniesienia samodzielnie; jedna siatka na projekt |
| Warstwy mapy w eksportach DXF lub 3D | Warstwy mapy trafiają do wydruku PDF, a obok DWG jako obraz |
| Serwery map wymagające logowania, klucza lub tokenu | Użyj publicznych usług albo pliku obrazu z georeferencją |
| Zapis plików LAS lub LAZ z powierzchni, modelu terenu albo narzędzi siatki rzędnych i LiDAR | Eksportuj powierzchnie jako siatkę rzędnych GeoTIFF. Dodatek [Chmury punktów](topic:point-clouds) zapisuje oczyszczoną chmurę jako LAS 1.4 lub LAZ |
| Intensywność, kolor i odbicia LiDAR; siatki rzędnych z kilkoma pasmami; pliki siatek lub LiDAR powyżej 200 MB | LiDAR jest filtrowany tylko według klasy, a siatki używają pierwszego pasma; najpierw podziel duże pliki na kafelki |

## Wprowadzanie

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Zaznaczanie prostokątem dotykiem (wymaga {{key:Shift}}) | Długie przytrzymanie każdego punktu pomiarowego, aby go dodać |
| Wpisywanie współrzędnych lub odległości podczas rysowania | Narysuj mniej więcej, a potem wpisz dokładne współrzędne PI w tabeli PI trasy |
| Wpisywanie współrzędnych narożników placów i budowli | Przeciągnij ich uchwyty; przybliż dla dokładności i obserwuj E oraz N w pasku stanu |
| Przyciąganie do obiektów (inne niż punkty pomiarowe dla linii przełamań) | Przybliż i obserwuj pasek stanu |

## Widok 3D

| Jeszcze nie zbudowano | Zamiast tego, dziś |
|---|---|
| Rysowanie lub edycja w widoku 3D | Rysuj i edytuj w rzucie; widok 3D śledzi każdą zmianę |
| Zaznaczanie linii charakterystycznych korytarza lub obiektów GIS klikaniem w 3D | Kliknij je w rzucie |
| Eksport widoku z przesadą wysokości lub w stopach | Eksporty są w skali rzeczywistej w metrach; zobacz [Eksport terenu w 3D](topic:export-3d) |
| Etykiety w eksportach GLB lub OBJ, rozmiary i style etykiet w 3D | Etykiety są pokazywane tylko w widoku 3D, w jednym rozmiarze; zobacz [Zobacz teren w 3D](topic:site-3d) |
| Tekstury ze zdjęć, nagrywanie przejazdu jako wideo, cienie spoza terenu, godziny nasłonecznienia w widoku 3D | Warstwy mapy nałożone na powierzchnie; przejazd i pozycja słońca w jednym czasie; [godziny nasłonecznienia](topic:sun-hours) dla dnia lub pory roku w rzucie |
