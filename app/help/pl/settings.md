---
title: Ustawienia CivilCraft
summary: Wybierz kolejność kolumn dla skopiowanych i wklejonych wierszy punktów oraz do zgadywania kolumn pliku, sposób numerowania wklejonych punktów, co pokazują opisy punktów, wskaźnik narożnika, przewyższenie pionowe 3D, sposób wyświetlania szerokości i długości geograficznej oraz to, czy warstwy map pochodzą z internetu.
keywords: ustawienia, preferencje, pnezd, penzd, kolejność kolumn, wiersze punktów, przenumeruj, numery punktów, numer początkowy, opisy punktów, etykiety, opis, rzędna, kostka widoku, ikona osi, wskaźnik narożnika, kompas, przewyższenie pionowe, 3d, szerokość, długość, dms, stopnie dziesiętne, warstwy map, internet, prywatność
from: 64b9cb92
---

Otwórz {{ui:Settings}} ikoną koła zębatego na pasku aplikacji lub przez {{key:Mod+,}}. Pierwsza karta, {{ui:CivilCraft}}, zawiera ustawienia należące do tej aplikacji; {{ui:General}} zawiera te, które wspólnie mają wszystkie aplikacje CadCraft (motyw, pasek narzędzi, panele). Ustawienia CivilCraft istnieją tylko w aplikacji: zmieniasz je tutaj, a ta przeglądarka je pamięta. {{ui:Reset CivilCraft settings}} przywraca każde ustawienie do wartości startowej.

## Wiersze punktów

**P, N, E, Z, D** (start) lub **P, E, N, Z, D**: punkt, północne, wschodnie, rzędna, opis lub wschodnie przed północnym. Jest używane w trzech miejscach:

- **Kopiowanie**: wiersze, które CivilCraft umieszcza w schowku systemowym dla arkusza kalkulacyjnego.
- **Wklejanie**: wiersze wklejone z arkusza kalkulacyjnego lub pliku tekstowego, które nie mają wiersza nagłówka.
- **Import**: domyślna kolejność w oknie **Importuj punkty**, gdy plik nie ma wiersza nagłówka (plik z czterema kolumnami jest odczytywany jako PENZ, a z trzema jako ENZ). Zobacz [Formaty plików punktów](topic:point-file-formats).

Wiersz nagłówka, który nazywa swoje kolumny, zawsze ma pierwszeństwo, tak samo jak wybór w liście **Kolumny** w oknie importu.

## Numery dla wklejonych punktów

- **Zachowuj wolne numery** (start): wklejony punkt zachowuje swój numer, gdy żaden punkt go nie ma; tylko punkty kolidujące dostają nowe numery.
- **Zawsze nowe numery**: każdy wklejony punkt dostaje nowy numer, nawet jeśli jego własny jest wolny.

**Nowe numery zaczynają się od**: pozostaw puste, aby liczyć od jednego więcej niż najwyższy używany numer. Wpisz numer, na przykład 5000, aby nowe punkty dostawały numery od 5000 w górę; numery już używane są pomijane. Żadne dwa punkty nigdy nie dostają tego samego numeru w żadnym z trybów. Zobacz [Zaznaczanie, kopiowanie i wklejanie punktów geodezyjnych](topic:copy-paste-points#point-numbers-never-clash).

## Opisy punktów

Co pokazuje opis punktu, gdy {{ui:Point labels}} jest włączone w sekcji **Wyświetlanie**: **Numer**, **Numer i rzędna** albo **Numer, rzędna i opis** (start). Eksporty DXF, DWG i PDF pokazują te same opisy, co ekran.

## Wskaźnik narożnika

Co znajduje się w rogu planu i widoku 3D: **Kostka widoku** (start), **Ikona osi** albo **Brak**.

- **Kostka widoku** (prawy górny róg). Na planie pokazuje górę z pierścieniem kompasu: N to północ siatki (w górę planu). Kliknij dowolną inną stronę, krawędź lub narożnik kostki albo ją przeciągnij, a [widok 3D](topic:site-3d) otworzy się z tego kierunku. {{ui:Home}} na kostce planu dopasowuje plan.
- W widoku 3D kostka obraca się razem z widokiem: kliknij stronę, krawędź lub narożnik, aby patrzeć z tego miejsca; przeciągnij kostkę, aby orbitować; przeciągnij pierścień kompasu, aby obrócić wokół pionu; kliknij literę, aby patrzeć z tej strony; a {{ui:Home}} daje widok izometryczny całego terenu. Gdy patrzysz prosto na stronę, małe strzałki przechodzą do następnej strony, a zakrzywione strzałki obracają widok o ćwierć obrotu.
- **Ikona osi** (lewy dolny róg): mały znacznik X (wschód) i Y (północ) na planie, X, Y i Z (w górę) w 3D.

## Przewyższenie pionowe 3D

Jak bardzo widok 3D rozciąga rzędne: **1×**, **2×** (start), **3×**, **5×** lub **10×**. Lista na pasku widoku 3D to to samo ustawienie, więc zmiana jednego zmienia oba. Objętości, profile i eksporty 3D pozostają w skali rzeczywistej.

## Szerokość i długość geograficzna

Jak pasek stanu pokazuje szerokość i długość geograficzną wskaźnika, gdy projekt ma układ współrzędnych: **stopnie, minuty i sekundy** (start, na przykład `30°18′00.00″ N`) albo **stopnie dziesiętne** (`30.300000° N`). Zobacz [Ustaw układ współrzędnych projektu](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Warstwy map z internetu

**Wyłączone** (start) albo **Włączone**. Gdy włączone, CivilCraft prosi dodane serwery map o obrazy obszaru na ekranie. Twój rysunek pozostaje na tym komputerze; serwer widzi obszar i Twój adres internetowy. Gdy jest wyłączone, żaden serwer map nie jest o nic pytany, nawet gdy otwierany projekt wskazuje jeden z nich; obraz georeferencyjny z pliku działa w obu przypadkach. Zobacz [Pokaż warstwy map pod planem](topic:map-layers).

## Asystenci

**Zezwalaj asystentom AI i skryptom na korzystanie z CivilCraft** (na początku wyłączone) pozwala asystentowi na Twoim komputerze sięgnąć do otwartego terenu przez CadCraft Studio: **Odczyt** opisuje teren i podaje punkty, rzędne powierzchni, kilometraże, profile, objętości i działki; **Edycja** pozwala mu zaznaczać i dodawać punkty geodezyjne; **Zapis** oraz **Eksport** pozwalają mu zapisać projekt lub zapisać LandXML albo DWG. **Foldery, z których może korzystać** (w Studio) to miejsca, w których może zapisywać i eksportować. **Aktywność** wypisuje jego wywołania. Zobacz [Pozwól asystentowi AI pracować z Twoim terenem](topic:assistants).
