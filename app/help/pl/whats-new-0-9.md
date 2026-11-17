---
title: Co nowego w 0.9
summary: Szablony korytarzy i terenu, przyciąganie i przyciski Wybierz podczas rysowania, analiza GIS z tabelą atrybutów, badania cienia, uzysku słonecznego, komfortu i wiatru dla terenu, widok renderowania 3D oraz dodatki Chmury punktów i WaterCraft.
keywords: co nowego, 0.9, informacje o wydaniu, szablony korytarzy, szablony terenu, edytor szablonów, przekrój typowy, kilka korytarzy, przyciąganie, przyciąganie, wybierz, przesuń, kopiuj, obróć, styczna, renderowanie, renderowanie 3d, analiza gis, bufor, nakładka, łączenie przestrzenne, tabela atrybutów, styl według atrybutu, badanie cienia, uzysk słoneczny, utci, komfort na zewnątrz, badanie wiatru, openfoam, chmury punktów, las, laz, watercraft, przepływ pożarowy, hydrant, wiek wody, chlor, zapotrzebowania, podpowiedzi, układ, co nowego, zmiany, dziennik zmian, 0.8, 0.8.1, wersja, nowe funkcje, deszcz, burza, piętrzenie wody, przelew, wykop i nasyp, bilans, transport mas, najlepsza trasa, najmniejszy koszt, oś, zbiornik retencyjny, odpływ, opróżnianie, zapas wysokości, postęp, pomiar, dron, hałda, adres na teren, działka, grunt, powódź, stateczność skarp, bishop, osiadanie, węzeł, oznakowanie poziome, znaki, widoczność, wyrównanie, metoda najmniejszych kwadratów, ciąg poligonowy, odkrywka, łącze radiowe, fresnel, rozjazd, skrzyżowanie torów, języki, problemy, live, dwg
from: d7ac5b14
---

To jest lista zmian w CivilCraft 0.9 w porównaniu z 0.8.1. CivilCraft 0.9 jest częścią CadCraft Studio 0.9 i jego ośmiu aplikacji. Największe części to szablony korytarzy i terenu, przyciąganie podczas rysowania, analiza GIS, badania nasłonecznienia, uzysku słonecznego, komfortu i wiatru dla terenu oraz dwa dodatki: Chmury punktów i WaterCraft.

## Nowe

### Szablony korytarzy i terenu

- **Szablony korytarzy.** Otwórz {{ui:Powierzchnia}} › {{ui:Więcej}} › {{ui:Szablony korytarzy…}} (lub wpisz {{cmd:TEMPLATES}}). Szablon to niewielki przekrój poprzeczny z elementami, odsunięciami, nachyleniami, materiałami i kodami punktów. Przechowuj je w projekcie, w {{ui:Moja biblioteka}} lub jako plik `.cctemplates.json`. Edytor szablonów pokazuje rysunek w prawdziwej skali i wypisuje problemy w miarę pisania.
- **Buduj z szablonów według kilometrażu.** Wybierz oś i włącz {{ui:Buduj z szablonów według kilometrażu}} we jej Właściwościach. Każda strona każdego regionu ma własną listę nawierzchni i własny warunek końcowy. {{ui:Dodaj korytarz}} w sekcji {{ui:Korytarze na tej trasie}} umieszcza kilka korytarzy na jednej osi.
- **Szablony terenu.** {{ui:Powierzchnia}} › {{ui:Więcej}} › {{ui:Szablony terenu…}} (lub wpisz {{cmd:TERRAINTEMPLATES}}) nakłada warstwowe materiały, takie jak humus czy nawierzchnia i podbudowa, na teren, z powierzchnią i objętością dla każdej warstwy. Zob. [Szablony korytarzy i szablony terenu](topic:corridor-templates).

### Rysowanie

- **Przyciąganie.** Narzędzia Oś, Podkład, Działka, Bryła, Linia charakterystyczna, Zmierz, Granica i Zlewnia przyciągają do punktów pomiarowych, PI, narożników, wierzchołków i konstrukcji, z opisem przy znaczniku. Przytrzymaj {{key:Alt}}, aby uzyskać swobodny punkt.
- **Przyciski Wybierz, styczna oraz przesuń, kopiuj, obróć.** Narożniki podkładu, działki i linii charakterystycznej mają wpisywane pola Wschód i Północ oraz przycisk Wybierz z krzyżykiem. We Właściwościach jest także {{ui:Styczna z dwóch punktów}} dla osi oraz {{ui:Przesuń, kopiuj i obróć}} dla osi, podkładów, działek i linii charakterystycznych. Zob. [Rysuj z przyciąganiem, wybranymi narożnikami oraz przesuń, kopiuj, obróć](topic:draft-with-snaps).
- **Widok renderowania w 3D.** Przycisk {{ui:Renderowanie}} na pasku 3D rysuje ziemię z naturalnymi kolorami, niebem, zamgleniem i łagodnymi cieniami. Nie zmienia modelu. Menu {{ui:Słońce}} ma teraz przyciski {{ui:Zastosuj}} i {{ui:Zamknij}}. Zob. [Zobacz teren w 3D](topic:site-3d).
- **Panele otwierają jedną sekcję naraz.** Lewy panel i panel Właściwości otwierają jedną sekcję i zamykają pozostałe, a kafelki wstążki Krajobraz, które mieszczą kilka narzędzi, są przyciskami z rozwijaniem.

### Analiza GIS

- **Analiza.** {{ui:Powierzchnia}} › {{ui:Więcej}} › {{ui:Analiza}} oferuje bufor, nakładkę, łączenie przestrzenne, wybór według atrybutu lub kształtu oraz pomiar. Każde narzędzie tworzy nową warstwę w jednym kroku cofnięcia.
- **Tabela atrybutów.** Menu z trzema kropkami przy warstwie ma {{ui:Tabela atrybutów…}} i {{ui:Styl według atrybutu…}}. Zob. [Analiza warstw GIS](topic:gis-analysis) oraz [Praca z tabelą atrybutów warstwy](topic:gis-table).

### Teren: słońce, energia słoneczna, komfort i wiatr

- **Sekcja Środowisko.** Wybierz bryłę: sekcja {{ui:Środowisko}} znajduje się pod {{ui:Godziny nasłonecznienia}} we jej Właściwościach. Ma badanie cienia (mapa, tabela, animacja, CSV), uzysk słoneczny z typowego pliku pogodowego roku (.epw) oraz komfort na zewnątrz (UTCI).
- **Wiatr, tylko do wstępnej oceny.** {{ui:Uruchom badanie wiatru}} koloruje grunt od siedzenia po niewygodę dla każdego kierunku wiatru z pliku pogodowego. Nie jest zwalidowane, a panel to mówi.
- **Dodatek wiatru pieszych (OpenFOAM).** Wyłączony, dopóki nie włączysz go w {{ui:Ustawienia}} › {{ui:Dodatki}}. OpenFOAM to oprogramowanie, które instalujesz sam. Zob. [Cień, uzysk słoneczny i komfort na zewnątrz](topic:environment).

### Chmury punktów (dodatek)

- Włącz {{ui:Chmury punktów}} w {{ui:Ustawienia}} › {{ui:Dodatki}}; pojawi się karta Chmury punktów w panelu po prawej stronie. Otwórz plik LAS lub LAZ, wyczyść go, posortuj na grunt, roślinność i budynki, zbuduj grunt, warstwice i objętości oraz wyeksportuj LAS lub LAZ. Zob. [Chmury punktów z drona lub skanera](topic:point-clouds).

### WaterCraft (dodatek)

- Włącz {{ui:WaterCraft (dystrybucja wody)}} w {{ui:Ustawienia}} › {{ui:Dodatki}}; pojawi się karta WaterCraft. Ma zapotrzebowania od odbiorców, przepływ pożarowy przy każdym hydrancie, to, które wyłączenie magistrali jest najważniejsze, oraz wiek wody i chlor, każde zapisywane jako CSV. Zob. [WaterCraft: zapotrzebowania, przepływ pożarowy, wyłączenia i wiek wody](topic:watercraft).

### Praca wspólna

- W sesji Live widzisz nawzajem swoje kursory i imiona na planie. Obiekty z biblioteki roślin: CivilCraft Krajobraz zaczyna od swojej domyślnej kolekcji biblioteki, {{ui:CivilCraft krajobraz}}.

## We wszystkich aplikacjach

- Podpowiedzi są pokazywane jako dymki Bootstrap, a podpowiedź startowa może zostać zamknięta.
- Pasek kart panelu, który się nie mieści, przewija się zamiast być ucinany.
- Tytuły kart przeglądarki mają postać `<dokument> - CivilCraft | CadCraft`.
- {{ui:Ustawienia}} ma sekcję Układ, w której układy są listą rozwijaną dwuwierszowych opcji.
- Jednostki masy i temperatury są w {{ui:Ustawienia}} › {{ui:Globalne}} › {{ui:Jednostki}}.
- Lista języków pokazuje języki, dla których kompilacja ma pliki. Języki inne niż angielski to wersje robocze wygenerowane maszynowo.

## Naprawiono

- Dodatki sprawdzania adresów i sprawdzania EnergyPlus nie dawały się włączyć; teraz się dają.
- Pomoc mówi teraz, że dodatek Chmury punktów zapisuje oczyszczoną chmurę jako LAS 1.4 lub LAZ.
- Kliknięcie własnego uchwytu zaznaczonego obiektu nie uruchamia już przeciągania uchwytu, które zatrzymywało oczekujące Wybierz.

## Uczciwe ograniczenia

- Przykładowe szablony korytarzy to zastępcze wzory bez standardu; inżynier musi je sprawdzić. Szablony terenu nie dodają powierzchni i nie są rysowane w 3D ani w widoku przekroju. Drugi korytarz na osi nie wchodzi do eksportu IFC. Nie ma przejścia zwężającego między dwoma szablonami według kilometrażu.
- Chmury punktów testowano na wymyślonych plikach, a nie na prawdziwym zdjęciu z drona. Odczytywane są tylko LAS i LAZ.
- Analizę GIS testowano na wymyślonych warstwach.
- Cień, uzysk słoneczny i komfort to szacunki planistyczne; wiatr to niezwalidowana wstępna ocena. Żadna z tych wartości nie jest wartością projektową.
- WaterCraft to pomoc obliczeniowa sprawdzona na wymyślonych sieciach. Inżynier wodociągowy decyduje, ile warte są te liczby.
- Języki inne niż angielski to wersje robocze maszynowe, dopóki native speaker ich nie przeczyta.
- Instalatory dla Windows nie mają podpisu kodu, a obraz dysku dla macOS nie jest notaryzowany.

## Wcześniej: 0.8 i 0.8.1

To jest lista zmian w CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02) w porównaniu z 0.7. Największe nowe części to narzędzia do testowania niwelacji i terenu (deszcz, bilans robót ziemnych, trasy, zbiorniki, postęp) oraz sześć okien obliczeniowych dla gruntu, dróg, pomiarów, kopalń, łączy i kolei.

### Nowe

**Testuj swoją niwelację**

- **Zrób deszcz.** {{ui:Zrób deszcz…}} (w {{ui:Powierzchnia}}) wprowadza burzę na niwelowany grunt. Obserwujesz, jak woda spływa z podkładów, piętrzy się w niskich narożnikach i przelewa przez zbyt małe zbiorniki. Przebieg jest animowany i podaje objętości, szczytowy odpływ oraz CSV każdego zbiornika. Domyślna komórka jest gruba, więc pierwszy rzut oka jest szybki; drobniejsza komórka jest wolniejsza. Zbiorniki, które się przelewają, pojawiają się też w panelu Problemy.
- **Bilans robót ziemnych.** {{ui:Bilans robót ziemnych…}} podnosi lub obniża podkład, aż wykop będzie równy nasypowi, i pokazuje tabelę transportu między nimi.
- **Najlepsza trasa.** {{ui:Najlepsza trasa…}}: wybierz początek i koniec, a CivilCraft znajdzie najtańszą ścieżkę przez teren, która trzyma się Twoich limitów spadku i łuku, i z niej tworzy oś.
- **Zbiorniki retencyjne.** {{ui:Zbiorniki retencyjne…}} wyznacza stopień i pojemność z Twojego gruntu, przyjmuje urządzenia odpływowe (otwór, jaz, przelew trójkątny, przelew), przepuszcza burzę przez zbiornik i sprawdza zatrzymany szczyt, czas opróżniania oraz zapas wysokości.
- **Postęp z pomiarów.** {{ui:Postęp z pomiarów…}} porównuje powierzchnie z dronów lub skanów z różnych dat z gruntem takim, jaki był, i z projektem: procent ukończenia według objętości, obszary przekopane i przesypane, hałdy oraz kiedy praca się skończy przy tym tempie (oznaczone jako szacunek).

**Poznaj teren**

- **Adres na teren.** {{ui:Adres na teren…}} zestawia otwarte dane o działkach, budynkach, zagospodarowaniu, glebie, powodzi i terenie na jednym terenie. Możesz zachować teren w pliku projektu: wpisany adres, każde źródło z dniem jego pobrania i licencją oraz to, co wróciło. Po ponownym otwarciu lub udostępnieniu projektu teren nadal tam jest, bez ponownego pobierania czegokolwiek. Możesz też zapisać go jako plik terenu lub wysłać do BimCraft. Zob. [Adres na teren](topic:address-to-site).

**Grunt, drogi, pomiary, kopalnie, łącza i kolej**

- **Grunty i skarpy.** {{ui:Grunty i skarpy…}} rysuje profil gruntu między wierceniami, które wpiszesz. Metoda Bishopa następnie szuka krytycznego okręgu na Twoim gruncie, z zwierciadłem wody, obciążeniem dodatkowym i współczynnikiem trzęsienia ziemi; osiadanie stopy uwzględnia konsolidację, osiadanie natychmiastowe i czas.
- **Węzły i oznakowanie.** {{ui:Skrzyżowania i oznakowanie…}} łączy ramiona z łukami krawężników (jeden promień na ramię lub łuki trzech środków), widoczność dla prędkości projektowej, sprawdzenie trójkątów widoczności, przejścia, linie zatrzymania, oznakowanie poziome i znaki z zestawieniem znaków. Są rysowane na planie i zapisywane jako .dxf z nazwanymi warstwami.
- **Wyrównanie pomiarów.** {{ui:Wyrównanie pomiarów…}} przeprowadza wyrównanie metodą najmniejszych kwadratów ciągu lub sieci: wyrównane współrzędne, elipsy błędów, test chi-kwadrat i flagę na pomiarze, który nie pasuje. Zawarte są sieci swobodne, zamykanie ciągu metodą kompasową oraz RW5, GSI, pliki terenowe JobXML lub CSV, a wyrównane punkty zapisują się jako CSV.
- **Odkrywki.** {{ui:Odkrywki…}} zamienia próbki z wierceń w model blokowy i ostateczną odkrywkę w obrębie Twojego kąta nachylenia, z współczynnikiem odsłonięcia, tabelą według piętra oraz krzywą zawartości i tonażu. Zagnieżdżone odkrywki według współczynnika przychodu oraz harmonogram produkcji z zdyskontowanym przepływem pieniędzy też są dostępne.
- **Łącza radiowe.** {{ui:Łącza radiowe…}} sprawdza widoczność przez Twój grunt z uwzględnieniem wypukłości Ziemi, pierwszej strefy Fresnela, budżetu łącza, zapasu na zanik i przerwy wielodrogowej, i podaje wysokość masztu, która oczyściłaby trasę. Robi też budżety strat światłowodu, ilości tras i wiatr na wieży.
- **Rozjazdy kolejowe.** {{ui:Rozjazdy kolejowe…}} tworzy rozjazd z jego numeru iglicy, skrzyżowania między równoległymi torami oraz prześwit konstrukcji nachylony przez przechyłkę i poszerzony na łuku. Rozjazd może stać na stacji osi.

Zob. [Grunty, skrzyżowania, wyrównanie pomiarów, odkrywki, łącza radiowe i rozjazdy](topic:soils-roads-survey-mines-links).

### We wszystkich aplikacjach

- **Języki.** 54 języki, z czego dziesięć nowych. Języki inne niż angielski to wersje robocze maszynowe, dopóki native speaker ich nie przeczyta. Tematy pomocy są w większości nadal po angielsku.
- **Wiersze paska narzędzi.** {{ui:Ustawienia}} › {{ui:Ogólne}} › {{ui:Wiersze paska narzędzi}}: Zawijaj (jak wcześniej), 2 wiersze lub 1 wiersz. Wstążka CivilCraft pokazuje najczęściej używane narzędzie dużo, następne małe, a resztę za strzałką nazwy grupy.
- **Urządzenia wejściowe.** Gładzik, rysik, mysz 3D, kontroler i MIDI mogą sterować aplikacjami.
- **Problemy.** Panel Problemy, który ostrzega we wszystkich aplikacjach, z kontrolami czytającymi pakiety przepisów.
- **Live.** Widok tego, kto gdzie jest w sesji Live.
- **Dodatki.** Lista dodatków, z dodatkami oświetleniowymi.
- **Połącz swoją AI.** Każdy asystent, którego podłączysz, może sterować narzędziami CivilCraft. Dołączono uwagę, że łączenie jednym kliknięciem w CadCraft Studio oraz hostowany łącznik nie są jeszcze gotowe. Zob. [Pozwól asystentowi AI pracować z Twoim terenem](topic:assistants).

### Naprawiono w 0.8.1

- **Sekcja klas DWG.** Była odczytywana jako zły typ (GitHub cadcraft#5). Naprawiono w CivilCraft wraz z CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Zmiana języka w trakcie działania.** CadCraft Studio i wersje pakietowe mogą zmieniać język w czasie działania. Wcześniej działały tylko po angielsku. Jeszcze nie przetestowano na każdej platformie: daj znać, jeśli język się nie zmienia.

### Jeszcze nie w tej wersji

- **To są pomoce obliczeniowe.** Każdy wynik w nowych oknach wymaga sprawdzenia przez inżyniera. Wytrzymałości gruntu zaczynają od typowych wartości dla grupy gruntów, a okno to mówi.
- **Zrób deszcz.** Przebieg na przykładowym terenie może w przeglądarce trwać ponad dwie minuty przy drobnej komórce. Sprawdzono go na ręcznych przypadkach i zlewni w kształcie litery V, jeszcze nie na prawdziwym niwelowanym terenie.
- **Adres na teren.** Czyta otwarte pliki danych, które przynosisz, i testowano go tylko na naszych własnych plikach. Drzewa nie są źródłem. Pobieranie źródeł za Ciebie czeka na sformułowania dotyczące prywatności.
- **Postęp z pomiarów.** Testowano tylko na wymyślonych pomiarach. Postęp na arkuszach i adnotacjach (MarkupCraft) oraz porównanie skanu z modelem (BimCraft) nie są zbudowane.
- **Grunty i skarpy.** Tylko powierzchnie kołowe: bez szukania klinowego ani blokowego i bez szczeliny napięciowej.
- **Węzły.** Jeden promień na ramię, bez ścieżek zamiatania przez ciężarówki, i jeszcze nie wchodzą do korytarza.
- **Pliki terenowe.** Czytniki napisano na podstawie publicznych opisów formatów i wypróbowano na plikach, które sami wykonaliśmy. Potrzebne są prawdziwe pliki z przyrządów.
- **Łącza i kolej.** Łącza radiowe: tylko strata w przestrzeni wolnej i przerwy wielodrogowe (bez zaniku przez deszcz i charakterystyk anten), oraz brak standardu kolejowego: każdy limit kolejowy to zastępnik, z wstępnymi liczbami, których żaden inżynier kolejowy nie sprawdził.
- **Windows i macOS.** 0.8 nie ma podpisu kodu. Windows może ostrzegać, a macOS wymaga kliknięcia prawym przyciskiem, a potem Otwórz.

Wszystko inne jest w [Jeszcze nie zbudowano](topic:not-built-yet). Poprzednie wydanie znajdziesz w [Co nowego w 0.7](topic:whats-new-0-7).
