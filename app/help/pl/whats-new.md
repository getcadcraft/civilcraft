---
title: Co nowego w wersji 0.8 i 0.8.1
summary: CivilCraft 0.8 dodaje Zrób deszcz (przebieg burzy po niwelacji), bilans robót ziemnych, wyszukiwanie najlepszej trasy, zbiorniki retencyjne, postęp z pomiarów, import adresu na teren, który zachowuje teren w projekcie, oraz okna dla gruntów i skarp, skrzyżowań i oznakowania, wyrównania pomiarów, wyrobisk odkrywkowych, łączy radiowych i rozjazdów kolejowych. 0.8.1 naprawia odczyt plików DWG.
keywords: co nowego, what's new, informacje o wydaniu, dziennik zmian, zmiany, 0.8, 0.8.1, wersja, nowe funkcje, deszcz, burza, zastoiska wody, przelewanie, roboty ziemne, bilans, wykop i nasyp, wywóz, najlepsza trasa, najmniejszy koszt, trasa, zbiornik retencyjny, wylot, obniżenie, zapas wysokości, postęp, pomiar, dron, zwałowisko, adres na teren, działka, grunt, powódź, stateczność zbocza, Bishop, osiadanie, skrzyżowanie, oznakowanie, znaki, widoczność, wyrównanie, najmniejsze kwadraty, ciąg poligonowy, wyrobisko odkrywkowe, model blokowy, łącze radiowe, Fresnel, rozjazd, przejazd łącznikowy, języki, problemy, Live, DWG
from: b0932cf0
---

Oto, co zmieniono w CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02) w porównaniu z wersją 0.7. Najważniejsze nowe elementy to narzędzia, które sprawdzają niwelację i teren (deszcz, roboty ziemne, trasy, zbiorniki, postęp), oraz sześć okien obliczeniowych dla terenu, dróg, pomiarów, kopalń, łączy i kolei.

## Nowe

### Sprawdź niwelację

- **Zrób deszcz.** {{ui:Zrób deszcz…}} (w ramach {{ui:Powierzchnia}}) zrzuca burzę na niwelowany teren. Widzisz, jak woda spływa z placów, zbiera się w niskich narożnikach i przelewa przez zbyt małe zbiorniki. Przebieg jest animowany i podaje objętości, szczytowy odpływ oraz plik CSV każdego zbiornika. Domyślna komórka jest gruba, więc pierwsze spojrzenie jest szybkie; drobniejsza komórka działa wolniej. Zbiorniki, które się przelewają, pojawiają się też w panelu Problemy.
- **Bilans robót ziemnych.** {{ui:Bilans robót ziemnych…}} podnosi lub obniża plac, aż wykop będzie równy nasypowi, i pokazuje między nimi tabelę wywozu.
- **Najlepsza trasa.** {{ui:Najlepsza trasa…}}: wybierz początek i koniec, a CivilCraft znajdzie najtańszą ścieżkę przez teren, która mieści się w limitach spadku i łuku, a następnie utworzy z niej trasę.
- **Zbiorniki retencyjne.** {{ui:Zbiorniki retencyjne…}} wylicza poziom wody i pojemność z terenu, przyjmuje urządzenia wylotowe (otwór, przelew, przelew trójkątny, przelew upustowy), przepuszcza burzę przez zbiornik i sprawdza zatrzymany szczytowy odpływ, czas opróżniania oraz zapas wysokości.
- **Postęp z pomiarów.** {{ui:Postęp z pomiarów…}} porównuje powierzchnie z dronów lub skanów z różnych dat z terenem, jaki był, oraz z projektem: procent ukończenia według objętości, obszary przekopane i przesypane, zwałowiska oraz kiedy praca się skończy przy tym tempie (oznaczone jako szacunek).

### Poznaj teren

- **Adres na teren.** {{ui:Adres na teren…}} zestawia na jednym terenie otwarte dane o działkach, budynkach, zagospodarowaniu, gruncie, powodzi i rzeźbie terenu. Teren można zachować w pliku projektu: wpisany adres, każde źródło z dniem pobrania i jego licencją oraz to, co zwrócono. Po ponownym otwarciu lub udostępnieniu projektu teren nadal tam jest, bez ponownego pobierania. Można go też zapisać jako plik terenu albo wysłać do BimCraft. Zobacz [Adres na teren](topic:address-to-site).

### Grunt, drogi, pomiary, kopalnie, łącza i kolej

- **Grunty i skarpy.** {{ui:Grunty i skarpy…}} rysuje profil gruntu między wpisanymi otworami. Metoda Bishopa szuka następnie krytycznego okręgu na terenie, z uwzględnieniem zwierciadła wody, obciążenia dodatkowego i współczynnika sejsmicznego; osiadanie stopy fundamentowej obejmuje konsolidację, osiadanie natychmiastowe i czas.
- **Skrzyżowania i oznakowanie.** {{ui:Skrzyżowania i oznakowanie…}} łączy ramiona skrzyżowania łukami krawężnika (jeden promień na ramię lub łuki trzech środków), podaje widoczność dla prędkości projektowej, sprawdza trójkąty widoczności, przejścia dla pieszych, linie zatrzymania, oznakowanie poziome i znaki z zestawieniem znaków. Są rysowane na planie i zapisywane jako .dxf z nazwanymi warstwami.
- **Wyrównanie pomiarów.** {{ui:Wyrównanie pomiarów…}} wykonuje wyrównanie metodą najmniejszych kwadratów ciągu poligonowego lub sieci: współrzędne wyrównane, elipsy błędów, test chi-kwadrat i oznaczenie pomiaru, który nie pasuje. Zawiera sieci swobodne, domykanie ciągu regułą kompasową oraz pliki terenowe RW5, GSI, JobXML lub CSV, a wyrównane punkty zapisują się jako CSV.
- **Wyrobiska odkrywkowe.** {{ui:Wyrobiska odkrywkowe…}} zamienia próbki z wierceń w model blokowy i ostateczne wyrobisko w obrębie kąta nachylenia, z współczynnikiem nadkładu, tabelą według pięter oraz krzywą zawartości i tonażu. Dostępne są także zagnieżdżone wyrobiska według współczynnika przychodu oraz harmonogram produkcji ze zdyskontowanym przepływem środków pieniężnych.
- **Łącza radiowe.** {{ui:Łącza radiowe…}} sprawdza widoczność bezpośrednią nad terenem z uwzględnieniem wypukłości Ziemi, pierwszej strefy Fresnela, bilansu łącza, rezerwy na zanik i przerw wielościeżkowych, i podaje wysokość masztu, która pozwoliłaby na czyste przejście. Oblicza też straty bilansu dla światłowodu, ilości trasy oraz wiatr na wieży.
- **Rozjazdy kolejowe.** {{ui:Rozjazdy kolejowe…}} tworzy rozjazd na podstawie numeru dziobnicy, przejazdy łącznikowe między równoległymi torami oraz skrajnię budowli przechyloną przez przechyłkę i poszerzoną na łuku. Rozjazd może znajdować się na kilometrażu trasy.

Zobacz [Grunty, skrzyżowania, wyrównanie pomiarów, wyrobiska, łącza radiowe i rozjazdy](topic:soils-roads-survey-mines-links).

## We wszystkich aplikacjach

- **Języki.** 54 języki, z czego dziesięć jest nowych. Języki inne niż angielski to wersje robocze wygenerowane maszynowo, dopóki nie przeczyta ich native speaker. Tematy pomocy nadal są w większości po angielsku.
- **Wiersze paska narzędzi.** {{ui:Ustawienia}} › {{ui:Ogólne}} › {{ui:Wiersze paska narzędzi}}: Zawijaj (jak dotąd), 2 wiersze lub 1 wiersz. Wstążka CivilCraft pokazuje najczęściej używane narzędzie dużo, kolejne małe, a resztę za strzałką nazwy grupy.
- **Urządzenia wejściowe.** Gładzik, pióro, mysz 3D, kontroler i MIDI mogą sterować aplikacjami.
- **Problemy.** Panel Problemy ostrzega we wszystkich aplikacjach, z kontrolami, które odczytują pakiety przepisów.
- **Live.** Widok tego, kto gdzie się znajduje w sesji Live.
- **Dodatki.** Lista dodatków, w tym dodatki oświetleniowe.
- **Podłącz AI.** Każdy połączony asystent może sterować narzędziami CivilCraft. Dołączono informację, że połączenie jednym kliknięciem w CadCraft Studio oraz hostowany łącznik nie są jeszcze gotowe. Zobacz [Pozwól asystentowi AI pracować z terenem](topic:assistants).

## Naprawiono w wersji 0.8.1

- **Sekcja klas DWG.** Była odczytywana jako zły typ (GitHub cadcraft#5). Naprawiono w CivilCraft wraz z CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Zmiana języka w trakcie działania.** CadCraft Studio i spakowane wydania mogą zmieniać język w trakcie działania. Wcześniej były tylko po angielsku. Nie przetestowano jeszcze na każdej platformie: daj nam znać, jeśli język się nie zmienia.

## Jeszcze nie w tej wersji

- **To są pomoce obliczeniowe.** Każdy wynik w nowych oknach wymaga sprawdzenia przez inżyniera. Wytrzymałości gruntu zaczynają od typowych wartości dla grupy gruntu, o czym mówi okno.
- **Zrób deszcz.** Przebieg na przykładowym terenie w przeglądarce przy drobnej komórce może trwać ponad dwie minuty. Sprawdzono go na przypadkach ręcznych i zlewni w kształcie litery V, ale jeszcze nie na rzeczywistym niwelowanym terenie.
- **Adres na teren.** Czyta otwarte pliki danych dostarczone przez użytkownika i był testowany tylko na własnych plikach. Drzewa nie są źródłem. Pobieranie źródeł w imieniu użytkownika czeka na sformułowanie dotyczące prywatności.
- **Postęp z pomiarów.** Testowano tylko na zmyślonych pomiarach. Postęp na arkuszach i adnotacjach (MarkupCraft) oraz porównanie skanu z modelem (BimCraft) nie zostały jeszcze zbudowane.
- **Grunty i skarpy.** Tylko powierzchnie kołowe: bez wyszukiwania klinów i bloków oraz bez szczeliny naprężeń rozciągających.
- **Skrzyżowania.** Jeden promień na ramię, bez zamiatanych ścieżek ciężarówek, a skrzyżowania nie trafiają jeszcze do korytarza.
- **Pliki terenowe.** Czytniki napisano na podstawie publicznych opisów formatów i wypróbowano na plikach, które sami przygotowaliśmy. Potrzebne są prawdziwe pliki z przyrządów pomiarowych.
- **Łącza i kolej.** Łącza radiowe: tylko strata w wolnej przestrzeni i wielościeżkowość (bez zaniku deszczowego i charakterystyk anten). Brak normy kolejowej: każdy limit kolejowy to wartość zastępcza z wstępnymi liczbami, których nie sprawdził żaden inżynier kolejowy.
- **Windows i macOS.** 0.8 nie jest podpisany cyfrowo. Windows może ostrzegać, a macOS wymaga kliknięcia prawym przyciskiem myszy, a następnie Otwórz.

Wszystko inne znajdziesz w [Jeszcze nie zbudowano](topic:not-built-yet). Wydanie wcześniejsze: zobacz [Co nowego w wersji 0.7](topic:whats-new-0-7).
