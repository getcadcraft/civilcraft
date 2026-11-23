---
title: Co nowego w wersji 0.9 (wcześniej)
summary: Szablony korytarzy i terenu, przyciąganie oraz przyciski Wskaż przy rysowaniu, analiza GIS z tabelą atrybutów, badania cienia, plonu słonecznego, komfortu i wiatru dla terenu, widok renderowania 3D oraz dodatki Chmury punktów i WaterCraft.
keywords: co nowego 0.9, wcześniejsze wydanie, co nowego, 0.9, informacje o wydaniu, szablony korytarzy, szablony terenu, edytor szablonów, przekrój typowy, kilka korytarzy, przyciąganie, wskaż, przesuń, kopiuj, obróć, styczna, renderowanie, renderowanie 3D, analiza GIS, bufor, nakładka, łączenie przestrzenne, tabela atrybutów, styl według atrybutu, badanie cienia, plon słoneczny, UTCI, komfort na zewnątrz, badanie wiatru, OpenFOAM, chmury punktów, LAS, LAZ, WaterCraft, przepływ pożarowy, hydrant, wiek wody, chlor, zapotrzebowania, podpowiedzi, układ, co nowego, dziennik zmian, zmiany, 0.8, 0.8.1, wersja, nowe funkcje, deszcz, kanalizacja burzowa, zastoiska, przelew, roboty ziemne, bilans, wykop i nasyp, transport, najlepsza trasa, najmniejszy koszt, trasa, zbiornik retencyjny, wypływ, obniżenie zwierciadła, zapas wysokości, postęp, pomiar, dron, zwał, adres na teren, działka, gleba, powódź, stateczność skarp, Bishop, osiadanie, skrzyżowanie, oznakowanie, widoczność, wyrównanie, metoda najmniejszych kwadratów, ciąg poligonowy, wyrobisko odkrywkowe, łącze radiowe, rozjazd, języki, problemy, na żywo, DWG
from: 4664522c
---

Oto, co zmieniło się w CivilCraft 0.9 w porównaniu z 0.8.1. CivilCraft 0.9 jest częścią CadCraft Studio 0.9 i jego ośmiu aplikacji. Najważniejsze części to szablony korytarzy i terenu, przyciąganie podczas rysowania, analiza GIS, badania słońca, plonu słonecznego, komfortu i wiatru dla terenu oraz dwa dodatki: Chmury punktów i WaterCraft.

## Nowości

### Szablony korytarzy i terenu

- **Szablony korytarzy.** Otwórz {{ui:Powierzchnia}} › {{ui:Więcej}} › {{ui:Szablony korytarzy…}} (albo wpisz {{cmd:TEMPLATES}}). Szablon to mały przekrój poprzeczny z elementami, odsunięciami, spadkami, materiałami i kodami punktów. Przechowuj je w projekcie, w {{ui:Moja biblioteka}} albo jako plik `.cctemplates.json`. Edytor szablonów pokazuje rysunek w skali rzeczywistej i wypisuje problemy w miarę wpisywania.
- **Buduj z szablonów według kilometrażu.** Wybierz trasę i włącz {{ui:Buduj z szablonów według kilometrażu}} we Właściwościach. Każda strona każdego odcinka ma własną listę nawierzchni i własny warunek końcowy. {{ui:Dodaj korytarz}} pod {{ui:Korytarze na tej trasie}} umieszcza kilka korytarzy na jednej trasie.
- **Szablony terenu.** {{ui:Powierzchnia}} › {{ui:Więcej}} › {{ui:Szablony terenu…}} (albo wpisz {{cmd:TERRAINTEMPLATES}}) rozkłada warstwowe materiały, takie jak humus lub nawierzchnia i podbudowa, na terenie, z polem i objętością dla każdej warstwy. Zobacz [Szablony korytarzy i szablony terenu](topic:corridor-templates).

### Rysowanie

- **Przyciąganie.** Narzędzia Trasa, Plac, Działka, Masa, Linia charakterystyczna, Zmierz, Granica i Zlewnia przyciągają się do punktów pomiarowych, PI, narożników, wierzchołków i obiektów, z etykietą przy znaczniku. Przytrzymaj {{key:Alt}}, aby uzyskać punkt swobodny.
- **Przyciski Wskaż, styczna oraz przesuń, kopiuj, obróć.** Narożniki placu, działki i linii charakterystycznej mają pola Easting i Northing oraz przycisk Wskaż z celownikiem. Właściwości mają też {{ui:Styczna z dwóch punktów}} dla tras oraz {{ui:Przesuń, kopiuj i obróć}} dla tras, placów, działek i linii charakterystycznych. Zobacz [Rysuj z przyciąganiem, wskazanymi narożnikami oraz przesuwaniem, kopiowaniem i obracaniem](topic:draft-with-snaps).
- **Widok renderowania w 3D.** Przycisk {{ui:Renderowanie}} na pasku 3D rysuje teren w naturalnych kolorach, z niebem, mgiełką i miękkimi cieniami. Nie zmienia modelu. Menu {{ui:Słońce}} ma teraz przyciski {{ui:Zastosuj}} i {{ui:Zamknij}}. Zobacz [Zobacz teren w 3D](topic:site-3d).
- **Panele otwierają się po jednej sekcji.** Lewy panel i panel Właściwości otwierają jedną sekcję i zamykają pozostałe, a kafelki wstążki Krajobrazu, które mieszczą kilka narzędzi, są przyciskami dzielonymi.

### Analiza GIS

- **Analiza.** {{ui:Powierzchnia}} › {{ui:Więcej}} › {{ui:Analiza}} oferuje bufor, nakładkę, łączenie przestrzenne, wybór według atrybutu lub kształtu oraz pomiar. Każde narzędzie tworzy nową warstwę jednym krokiem cofania.
- **Tabela atrybutów.** Menu z trzema kropkami przy warstwie ma {{ui:Tabela atrybutów…}} i {{ui:Styl według atrybutu…}}. Zobacz [Analiza warstw GIS](topic:gis-analysis) oraz [Praca z tabelą atrybutów warstwy](topic:gis-table).

### Teren: słońce, energia słoneczna, komfort i wiatr

- **Sekcja środowiska.** Wybierz bryłę: sekcja {{ui:Środowisko}} znajduje się pod {{ui:Godziny nasłonecznienia}} we Właściwościach. Ma badanie cienia (mapa, tabela, animacja, CSV), plon słoneczny z pliku pogodowego typowego roku (.epw) oraz komfort na zewnątrz (UTCI).
- **Wiatr, tylko do wstępnej oceny.** {{ui:Uruchom badanie wiatru}} koloruje teren od miejsc do siedzenia po niekomfortowe dla każdego kierunku wiatru z pliku pogodowego. Nie jest zweryfikowane, a panel to mówi.
- **Dodatek wiatru przy pieszych (OpenFOAM).** Wyłączony, dopóki go nie włączysz w {{ui:Ustawienia}} › {{ui:Dodatki}}. OpenFOAM to oprogramowanie, które instalujesz samodzielnie. Zobacz [Cień, plon słoneczny i komfort na zewnątrz](topic:environment).

### Chmury punktów (dodatek)

- Włącz {{ui:Chmury punktów}} w {{ui:Ustawienia}} › {{ui:Dodatki}}; w prawym panelu pojawia się karta Chmury punktów. Otwórz plik LAS lub LAZ, oczyść go, posortuj na grunt, roślinność i budynki, zbuduj teren, poziomice i objętości, a potem wyeksportuj LAS lub LAZ. Zobacz [Chmury punktów z drona lub skanera](topic:point-clouds).

### WaterCraft (dodatek)

- Włącz {{ui:WaterCraft (dystrybucja wody)}} w {{ui:Ustawienia}} › {{ui:Dodatki}}; pojawia się karta WaterCraft. Ma zapotrzebowania od odbiorców, przepływ pożarowy przy każdym hydrancie, to, która awaria przewodu ma największe znaczenie, oraz wiek wody i chlor, każde zapisywane jako CSV. Zobacz [WaterCraft: zapotrzebowanie, przepływ pożarowy, awarie i wiek wody](topic:watercraft).

### Praca wspólna

- W sesji Live widzisz nawzajem swoje kursory i nazwy w planie. Rośliny z biblioteki: Krajobraz CivilCraft zaczyna od domyślnej kolekcji biblioteki, {{ui:Krajobraz CivilCraft}}.

## We wszystkich aplikacjach

- Podpowiedzi pokazują się jako dymki Bootstrap, a wskazówkę startową można zamknąć.
- Pasek kart panelu, który się nie mieści, przewija się zamiast być ucięty.
- Tytuły kart przeglądarki mają postać `<dokument> - CivilCraft | CadCraft`.
- {{ui:Ustawienia}} ma sekcję Układ, w której układy są listą rozwijaną z dwuwierszowymi wyborami.
- Jednostki masy i temperatury są w {{ui:Ustawienia}} › {{ui:Globalne}} › {{ui:Jednostki}}.
- Lista języków pokazuje języki, dla których build ma pliki. Języki inne niż angielski to wersje robocze tłumaczone maszynowo.

## Naprawione

- Dodatki sprawdzania adresu i EnergyPlus nie dało się włączyć; teraz można.
- Pomoc mówi teraz, że dodatek Chmury punktów zapisuje oczyszczoną chmurę jako LAS 1.4 lub LAZ.
- Kliknięcie własnego uchwytu zaznaczonego obiektu nie uruchamia już przeciągania uchwytu, które zatrzymywało oczekujące wskazanie.

## Uczciwe ograniczenia

- Przykładowe szablony korytarzy są wartościami zastępczymi bez żadnej normy; inżynier musi je sprawdzić. Szablony terenu nie dodają powierzchni i nie są rysowane w 3D ani w widoku przekroju. Drugi korytarz na trasie nie jest w eksporcie IFC. Nie ma przejścia między dwoma szablonami według kilometrażu.
- Chmury punktów testowano na wymyślonych plikach, a nie na rzeczywistym nalocie drona. Czytane są tylko LAS i LAZ.
- Analizę GIS testowano na wymyślonych warstwach.
- Cień, energia słoneczna i komfort to szacunki planistyczne; wiatr to niezweryfikowana wstępna ocena. Żadne z nich nie jest wartością projektową.
- WaterCraft to pomoc w obliczeniach sprawdzona na wymyślonych sieciach. Inżynier wodny decyduje, ile warte są liczby.
- Języki inne niż angielski to wersje robocze tłumaczone maszynowo.
- Instalatory Windows nie mają podpisu kodem, a obraz dysku macOS nie jest notaryzowany.

## Wcześniej: 0.8 i 0.8.1

Oto, co zmieniło się w CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02) w porównaniu z 0.7. Najważniejsze nowe części to narzędzia sprawdzające wyrównanie i teren (deszcz, roboty ziemne, trasy, zbiorniki, postęp) oraz sześć okien obliczeniowych dla terenu, dróg, pomiarów, kopalni, łączy i kolei.

### Nowości

**Sprawdź wyrównanie**

- **Zrób deszcz.** {{ui:Zrób deszcz…}} (pod {{ui:Powierzchnia}}) rzuca burzę na wyrównany teren. Obserwujesz, jak woda spływa z placów, zbiera się w niskich narożnikach i przelewa przez zbyt małe zbiorniki. Przebieg jest animowany i podaje objętości, szczytowy odpływ oraz CSV każdego zbiornika. Domyślna komórka jest gruba, więc pierwsze spojrzenie jest szybkie; drobniejsza komórka jest wolniejsza. Zbiorniki, które się przelewają, pokazują się też w panelu Problemy.
- **Bilans robót ziemnych.** {{ui:Bilans robót ziemnych…}} podnosi lub obniża plac, aż wykop będzie równy nasypowi, i pokazuje tabelę transportu między nimi.
- **Najlepsza trasa.** {{ui:Najlepsza trasa…}}: wybierz początek i koniec, a CivilCraft znajdzie najtańszą ścieżkę przez teren, która mieści się w Twoich limitach spadku i promienia łuku, i z niej tworzy trasę.
- **Zbiorniki retencyjne.** {{ui:Zbiorniki retencyjne…}} wylicza rzędne piętrzenia i pojemność z Twojego terenu, przyjmuje urządzenia wylotowe (otwór, przelew, przelew trójkątny, upust awaryjny), przepuszcza burzę przez zbiornik i sprawdza zatrzymany szczyt przepływu, czas opróżniania i zapas wysokości.
- **Postęp z pomiarów.** {{ui:Postęp z pomiarów…}} porównuje powierzchnie z dronów lub skanów z różnych dat z terenem, jaki był, i z projektem: procent ukończenia według objętości, obszary przekopane i przysypane, zwały oraz to, kiedy prace się skończą przy tym tempie (oznaczone jako szacunek).

**Poznaj teren**

- **Adres na teren.** {{ui:Adres na teren…}} zestawia na jednym terenie otwarte dane o działce, budynku, planie zagospodarowania, glebie, powodzi i ukształtowaniu terenu. Możesz zachować teren w pliku projektu: wpisany adres, każde źródło z dniem jego pobrania i licencją oraz to, co wróciło. Otwórz lub udostępnij projekt ponownie, a teren nadal tam będzie, bez ponownego pobierania czegokolwiek. Możesz też zapisać go jako plik terenu albo wysłać do BimCraft. Zobacz [Adres na teren](topic:address-to-site).

**Grunt, drogi, pomiary, kopalnie, łącza i kolej**

- **Grunty i skarpy.** {{ui:Grunty i skarpy…}} rysuje profil gruntu między wpisanymi przez Ciebie otworami wiertniczymi. Metoda Bishopa szuka wtedy krytycznego okręgu na Twoim terenie, z zwierciadłem wody, obciążeniem dodatkowym i współczynnikiem sejsmicznym; osiadanie stopy fundamentowej uwzględnia konsolidację, osiadanie natychmiastowe i czas.
- **Skrzyżowania i oznakowanie.** {{ui:Skrzyżowania i oznakowanie…}} łączy wloty z zaokrągleniami krawężników (jeden promień na wlot albo zaokrąglenia trzycentrowe), widoczność dla prędkości projektowej, sprawdzenie trójkątów widoczności, przejścia dla pieszych, linie zatrzymania, oznakowanie poziome i znaki z wykazem znaków. Są rysowane w planie i zapisywane jako plik .dxf z nazwanymi warstwami.
- **Wyrównanie pomiarów.** {{ui:Wyrównanie pomiarów…}} wykonuje wyrównanie metodą najmniejszych kwadratów ciągu lub sieci: wyrównane współrzędne, elipsy błędów, test chi-kwadrat i flagę na pomiarze, który nie pasuje. Sieci swobodne, zamykanie ciągu regułą kompasu oraz pliki terenowe RW5, GSI, JobXML lub CSV są w zestawie, a wyrównane punkty zapisują się jako CSV.
- **Wyrobiska odkrywkowe.** {{ui:Wyrobiska odkrywkowe…}} zamienia próbki z wierceń w model bloków i, przy zadanym kącie nachylenia skarpy, granicę ostatecznego wyrobiska ze wskaźnikiem nadkładu, tabelą według uskoku oraz krzywą zawartości i tonażu. Zagnieżdżone wyrobiska według współczynnika przychodu oraz harmonogram produkcji ze zdyskontowanym przepływem pieniężnym też są dostępne.
- **Łącza radiowe.** {{ui:Łącza radiowe…}} sprawdza widoczność nad Twoim terenem z uwzględnieniem wypukłości Ziemi, pierwszą strefę Fresnela, bilans łącza, zapas na zanik i przerwę wielodrogową, i podaje wysokość masztu, która oczyściłaby tor. Wykonuje też bilanse strat światłowodu, wyliczenia ilości trasy i obciążenie wiatrem na wieżę.
- **Rozjazdy kolejowe.** {{ui:Rozjazdy kolejowe…}} tworzy rozjazd z jego liczby krzyżownicy, łącznice między równoległymi torami oraz obrys prześwitu, przechylany przez przechyłkę i poszerzany na łuku. Rozjazd może leżeć na kilometrażu trasy.

Zobacz [Grunty, skrzyżowania, wyrównanie pomiarów, wyrobiska, łącza radiowe i rozjazdy](topic:soils-roads-survey-mines-links).

### We wszystkich aplikacjach

- **Języki.** 54 języki, z czego dziesięć nowych. Języki inne niż angielski są wersjami roboczymi tłumaczonymi maszynowo, dopóki native speaker ich nie przeczyta. Tematy pomocy nadal są w większości po angielsku.
- **Wiersze paska narzędzi.** {{ui:Ustawienia}} › {{ui:Ogólne}} › {{ui:Wiersze paska narzędzi}}: Zawijaj (jak wcześniej), 2 wiersze albo 1 wiersz. Wstążka CivilCraft pokazuje najczęściej używane narzędzie duże, kolejne małe, a resztę za strzałką przy nazwie grupy.
- **Urządzenia wejściowe.** Gładzik, pióro, mysz 3D, kontroler i MIDI mogą sterować aplikacjami.
- **Problemy.** Panel Problemy ostrzega we wszystkich aplikacjach i sprawdza według pakietów przepisów.
- **Na żywo.** Widok tego, kto gdzie jest w sesji Live.
- **Dodatki.** Lista dodatków, z dodatkami oświetlenia.
- **Podłącz swojego asystenta AI.** Każdy asystent, którego podłączysz, może sterować narzędziami CivilCraft. Dołączono notę, że łączenie jednym kliknięciem w CadCraft Studio oraz hostowany łącznik nie są jeszcze gotowe. Zobacz [Pozwól asystentowi AI pracować z Twoim terenem](topic:assistants).

### Naprawione w 0.8.1

- **Sekcja klas DWG.** Była odczytywana jako zły typ (GitHub cadcraft#5). Naprawiono w CivilCraft razem z CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Zmiana języka w działaniu.** CadCraft Studio i wersje pakietowe mogą zmieniać język w trakcie działania. Wcześniej działały tylko po angielsku. Nie przetestowano jeszcze na każdej platformie: daj znać, jeśli język się nie zmienia.

### Jeszcze nie w tej wersji

- **To są pomoce obliczeniowe.** Każdy wynik nowych okien wymaga sprawdzenia przez inżyniera. Wytrzymałości gruntu startują od typowych wartości dla grupy gruntu, a okno to mówi.
- **Deszcz.** Przebieg na przykładowym terenie może w przeglądarce trwać ponad dwie minuty przy drobnej komórce. Sprawdzono go na ręcznych przypadkach i zlewni w kształcie litery V, jeszcze nie na rzeczywistym wyrównanym terenie.
- **Adres na teren.** Czyta otwarte pliki danych, które przynosisz, i testowano go tylko na naszych własnych plikach. Drzewa nie są źródłem. Pobieranie źródeł za Ciebie czeka na sformułowania dotyczące prywatności.
- **Postęp z pomiarów.** Testowano na wymyślonych pomiarach. Postęp na arkuszach i adnotacjach (MarkupCraft) oraz skan względem modelu (BimCraft) nie są zbudowane.
- **Grunty i skarpy.** Tylko powierzchnie kołowe: bez wyszukiwania klinowego ani blokowego i bez szczeliny naprężeniowej.
- **Skrzyżowania.** Jeden promień na wlot, bez zamiatanych ścieżek ciężarówek; nie wchodzą jeszcze do korytarza.
- **Pliki terenowe.** Czytniki napisano na podstawie publicznych opisów formatów i wypróbowano na plikach, które sami wykonaliśmy. Potrzebne są rzeczywiste pliki z przyrządów.
- **Łącza i kolej.** Radio: tylko tłumienie w wolnej przestrzeni i wielodrogowość (bez zaniku deszczowego ani charakterystyk anten). Brak normy kolejowej: każdy limit kolejowy to wartość zastępcza, z roboczymi liczbami, których nie sprawdził żaden inżynier kolejowy.
- **Windows i macOS.** 0.8 nie ma podpisu kodem. Windows może ostrzegać, a macOS wymaga kliknięcia prawym przyciskiem i wyboru Otwórz.

Wszystko inne jest w [Jeszcze nie zbudowano](topic:not-built-yet). Wcześniejsze wydanie opisuje [Co nowego w 0.7](topic:whats-new-0-7).
