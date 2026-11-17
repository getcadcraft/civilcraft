---
title: Cień, uzysk energii słonecznej i komfort na zewnątrz
summary: Zbadaj cień, jaki bryły budynków rzucają w ciągu dnia lub roku, zobacz jego animację, oblicz, ile energii elektrycznej wytworzą panele słoneczne na dachach i ścianach w typowym roku, sprawdź komfort ulicy przy budynku (UTCI) i uzyskaj orientacyjną ocenę komfortu wiatru dla pieszych.
keywords: badanie cienia, cień, godziny słoneczne, animacja, energia słoneczna, PV, fotowoltaika, panele, uzysk, kWh, EPW, plik pogodowy, UTCI, komfort cieplny, komfort na zewnątrz, stres cieplny, wiatr
from: 96e7af4d
---

Sekcja **Środowisko** znajduje się pod **Godziny słoneczne** we **Właściwościach** bryły. Używa narysowanych brył jako budynków.

## Wczytaj plik pogodowy

Wybierz plik pogodowy typowego roku (**.epw**) dla swojego miasta. Są bezpłatne na stronie pogodowej EnergyPlus i na climate.onebuilding.org. Plik pozostaje w przeglądarce na czas tej wizyty. Uzysk energii słonecznej i badanie komfortu go potrzebują; badanie cienia działa bez niego, gdy projekt ma układ współrzędnych.

## Badanie cienia

Wybierz datę (albo zaznacz **Sezon** i ostatnią datę oraz krok w dniach) i strefę czasową, a potem **Uruchom badanie cienia**. Otrzymujesz mapę godzin nasłonecznienia albo cienia na gruncie wokół brył; tabelę tego, jaka część gruntu jest zacieniona w ciągu dnia; oraz animację dnia, którą można odtwarzać lub przeglądać krok po kroku. **Zapisz mapę**, **Zapisz klatki animacji** (wszystkie klatki na jednym obrazie) i **Zapisz godziny** (CSV) zachowują wyniki.

Grunt przyjęto jako płaski, na poziomie najniższej bryły. Aby uzyskać cień na zboczu, użyj **Godzin słonecznych**, które odczytują ukształtowanie terenu.

## Uzysk energii słonecznej

Ustaw sprawność paneli, jaką część każdego dachu i ściany pokrywają oraz straty systemu, a następnie **Uruchom uzysk energii słonecznej**. Dla każdego dachu i ściany otrzymujesz, ile energii elektrycznej metr kwadratowy paneli wytworzyłby w typowym roku, ile z tego zabierają sąsiednie bryły oraz sumę dla każdej bryły. Model jest opisany prostymi słowami obok przycisku: to szacunek planistyczny na podstawie typowego roku, a nie gwarancja.

## Komfort na zewnątrz

**Uruchom komfort** wylicza Uniwersalny Wskaźnik Klimatu Termicznego (UTCI) dla stojącej osoby na otwartym terenie i przy pierwszej bryle (strony południowa, północna, wschodnia i zachodnia), z uwzględnieniem cienia każdej bryły. Pokazuje, ile nieba jest widoczne, średni dzienny UTCI oraz godziny powyżej 32 (stres cieplny) i poniżej 0 (stres zimna).

## Wiatr (orientacyjnie)

**Uruchom badanie wiatru** rozwiązuje przepływ powietrza wokół brył jeden raz dla każdego kierunku wiatru, który wieje w pliku pogodowym (4, 8, 12 lub 16 kierunków), w otoczeniu, które wybierasz (otwarty teren, przedmieście lub centrum miasta), a następnie sumuje godzinowy wiatr z całego roku. Mapa koloruje grunt według klasy komfortu, od zielonego (**siedzenie**) przez **stanie**, **spacer** i **chodzenie** do czerwonego (**niekomfortowo**): aktywność, której prędkość graniczna (4, 6, 8 i 10 m/s) jest przekraczana przez nie więcej niż 5 % godzin. Druga tabela podaje klasę NEN 8100 (od A do E) na podstawie udziału godzin, w których wiatr przekracza 5 m/s. Współczynnik porywów mnoży średnią godzinową, dając efektywny poryw.

Jak to działa, prostymi słowami: solver przepływu lattice-Boltzmann large-eddy (nasz własny, w bibliotece `lib/wind`) w pudełku wokół budynków, profil prędkości wiatru rosnący z wysokością według wybranej szorstkości oraz prędkość na wysokości około 1.5 m nad gruntem porównywana z prędkością przed budynkami na 10 m. **Orientacyjne** jest szybkie i zgrubne; **Standardowe** używa większej liczby komórek i działa znacznie dłużej. Jeśli panel podaje, że siatka jest zgrubna (poniżej 10 komórek nad najwyższym budynkiem) albo przepływ wciąż się zmieniał, mapie ufaj mniej.

**Czym to nie jest.** Solver sprawdzono na podręcznikowych przepływach (kanał, wnęka z ruchomą pokrywą) i uruchomiono na sześcianie, aby zobaczyć, czy ślad za nim i przyspieszenie przepływu na narożnikach wyglądają poprawnie. **Nie** został zweryfikowany na pomiarach w tunelu aerodynamicznym dla budynków, dlatego każdy wynik jest oznaczony jako niezweryfikowany. Nie używaj go do wartości projektowej, obciążenia wiatrem ani certyfikatu planistycznego: inżynier wiatrowy musi przeprowadzić i potwierdzić właściwe badanie. Płaski grunt, gładkie ściany budynków, skrót szorstkości ze stacji pogodowej i tabela progów to uproszczenia; progi mogą się różnić od kryteriów obowiązujących w twoim urzędzie.

## Wiatr z OpenFOAM (dodatek)

Wbudowany silnik wiatru powyżej jest eksperymentalny. Aby uzyskać właściwy solver przepływu, włącz dodatek **Wiatr pieszych (OpenFOAM)** w **Ustawienia > Dodatki** (jest wyłączony, dopóki tego nie zrobisz). To oprogramowanie na licencji GPL, niezależne od reszty CadCraft, i nie zawiera OpenFOAM: OpenFOAM instalujesz samodzielnie. Wtedy **Silnik** w bloku wiatru wyświetla OpenFOAM.

Co konfigurujesz, raz:
1. **Zainstaluj OpenFOAM** (seria ESI v z openfoam.com; dodatek jest testowany z v2512). Na Ubuntu lub Debianie (także w WSL w Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, a potem `sudo apt install openfoam2512-default`. Instaluje się w `/usr/lib/openfoam/openfoam2512`. CadCraft potrzebuje `blockMesh`, `snappyHexMesh` i `simpleFoam`, aby działać. (Starszy pakiet `openfoam` 1912 z archiwum Ubuntu też działa, ale jego obiekty funkcji ulegają awarii; wtedy dodatek sam odczytuje pliki wyników.)
2. **Uruchom pomocnika** z folderu `runner` dodatku przez Node.js: `node cc-openfoam-runner.mjs serve`. Jeśli OpenFOAM nie jest na ścieżce wyszukiwania, dodaj mały plik `runner.json` ze ścieżką do `etc/bashrc` OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) i uruchom go z `--config runner.json`. Pomocnik nasłuchuje tylko na tym komputerze i wypisuje token.
3. **Wklej token** w pola dodatku w bloku wiatru (adres pozostaje `http://127.0.0.1:8765`) i naciśnij **Sprawdź pomocnika**.

Wtedy **Uruchom badanie wiatru** wykonuje jeden przypadek dla każdego kierunku wiatru z pliku pogodowego: twoje bryły stają się powierzchnią (STL) w pudełku o wymiarach zgodnych ze zwykłą wytyczną (5 wysokości budynku dookoła i nad nim, 10 za nim), siatkowanej przez blockMesh i snappyHexMesh, uruchamianej jako ustalone RANS k-epsilon z wlotem warstwy granicznej atmosfery o wybranej szorstkości. Prędkość na 1.5 m jest odczytywana i zamieniana na te same klasy Lawsona i NEN 8100. Nic nie opuszcza twojego komputera.

**Co sprawdzono.** Tekst nad wynikami mówi to wprost i jest częścią każdego zapisanego pliku CSV. Zapis przypadków, odczyt wyników i cały potok dodatku są testowane bez OpenFOAM, a pojedynczy sześcian został przeliczony przez prawdziwy OpenFOAM przy trzech rozmiarach siatki (liczby są w notatkach projektu). **Nie** został zweryfikowany na pomiarach w tunelu aerodynamicznym dla budynków. To odczyt orientacyjny, nie wartość projektowa i nie certyfikat. Standardowy model k-epsilon przeszacowuje turbulencję przed budynkami, grunt jest płaski, ściany gładkie i nie ma ukształtowania terenu ani roślinności.
