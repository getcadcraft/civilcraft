---
title: Niwelacja pod krajobraz
summary: Platformy, wały ziemne, rowy chłonne i niwelacja swobodna z rzędnymi punktowymi i warstwicami, które można przeciągać, a wykop i nasyp zmieniają się na żywo; analiza pochyleń, strzałki przepływu i zastoiska – wszystko w projektowanej powierzchni CivilCraft.
keywords: mur oporowy, mury oporowe, pionowy bok, mur zamiast skarpy, pochylenie każdego boku, nasyp, niwelacja, niwelacja pod krajobraz, platforma, taras, plac, wał ziemny, kopiec, rów chłonny, rzędna punktowa, rzędna, warstwice, edycja warstwic, wykop i nasyp, roboty ziemne, analiza pochyleń, dostępność, strome zbocza, strzałki przepływu, odwodnienie, zastoisko, kałuże
from: e1559eb9
---

Wszystko to jest niwelowane do **powierzchni projektowanej** tą samą niwelacją co place i korytarze. **Teren istniejący** nigdy nie jest zmieniany, a Roboty ziemne uwzględniają go w całości. Menu {{ui:Niwelacja}} znajduje się w grupie Krajobraz.

## Platformy

{{ui:Niwelacja}} › {{ui:Platforma}}, potem kliknij narożniki i naciśnij {{key:Enter}}. Platforma zaczyna się na średniej rzędnej terenu pod nią; wpisz **Rzędną**, aby ją ustawić, albo opróżnij pole, aby znów podążała za terenem. **Spadek** w % oraz **Spadek w kierunku** w stopniach (0 = wschód, 90 = północ) ją pochylają. Jej boki są wyprowadzone do terenu przy **Pochyleniu wykopu** i **Pochyleniu nasypu** (poziomo do 1).

## Pochylenia każdego boku i mury oporowe

W sekcji **Boki i mury oporowe** we Właściwościach placu, platformy lub wału każdy bok może być niwelowany na własny sposób. Bok 1 biegnie od pierwszego klikniętego narożnika do drugiego, bok 2 od drugiego do trzeciego, i tak dalej.

- **Wszystkie boki**: **Pochyły** używa powyższych pochyleń wykopu i nasypu na każdym boku; **Pionowe: mury oporowe** stawia mur na każdym boku.
- Dla każdego boku osobno: **Pochylenia jak wyżej**, **Własne pochylenia** (wpisz pochylenie wykopu i nasypu dla tego boku) albo **Pionowy (mur oporowy)**.
- Wpisz pochylenie jako `3` lub `3:1` (poziomo do 1 w pionie), `33%` albo `18.4°`; jest pokazywane jako H:1. Własne **Pochylenie wykopu** i **Pochylenie nasypu** placu przyjmują to samo.
- Pionowy bok nie ma nasypu: mur oporowy biegnie wzdłuż krawędzi, od placu w dół do terenu istniejącego (w nasypie) albo od terenu w dół do placu (w wykopie). **Grubość muru** (na początek 0,3 m lub 1 ft) to odległość, o jaką teren schodzi od krawędzi placu do terenu istniejącego. Objętości wykopu i nasypu pomijają nasyp, którego ten bok już nie ma.
- Tam, gdzie mur spotyka pochyły bok, pochylenie obejmuje koniec muru; dwa mury łączą się na ukos.
- Pod polami: długość murów, odsłonięta powierzchnia (wysokość × długość), najwyższa i średnia wysokość.

Plan rysuje zewnętrzną powierzchnię każdego muru krótkimi kreskami w poprzek oraz jego wysokość na obu końcach i w najwyższym punkcie (na warstwie murów oporowych, która trafia także do DXF i DWG). Widok 3D pokazuje mury jako bryły (Pokaż › Mury oporowe), a eksporty GLB, OBJ i USD je zawierają. Przekroje przez krawędź pokazują stopień.

**Ostrzeżenia** (we Właściwościach i w panelu Problemy): mur wyższy niż **Ostrzegaj powyżej wysokości muru** (na początek 1,0 m lub 3,3 ft) – „może być potrzebny projekt konstrukcyjny lub pozwolenie; sprawdź lokalne przepisy”, oraz, po wpisaniu **Najstromsze pochylenie, jakie utrzyma grunt**, każdy bok, którego pochylenie wykopu lub nasypu jest bardziej strome. To ostrzeżenia: niwelacja i tak się buduje. Każda zmiana to jeden krok dla {{key:Mod+Z}}.

## Wały ziemne

{{ui:Niwelacja}} › {{ui:Wał ziemny}}: kopiec, którego wierzch leży na **Wysokości** nad średnim terenem pod nim, z wyprowadzonymi bokami.

## Rowy chłonne

{{ui:Niwelacja}} › {{ui:Rów chłonny}}, potem kliknij wzdłuż rowu **w kierunku spływu wody** i naciśnij {{key:Enter}}. Ustaw jego **Głębokość**, **Szerokość dna** (0 dla kształtu V) i **Pochylenie boku**. Bez **Spadku** dno podąża za terenem, na swojej głębokości pod nim, i nigdy nie biegnie pod górę; wpisz spadek, aby nadać mu stały od początku.

## Rzędne punktowe i warstwice

1. {{ui:Niwelacja}} › {{ui:Obszar niwelacji}}: kliknij obrys obszaru, który chcesz ukształtować.
2. {{ui:Niwelacja}} › {{ui:Rzędna punktowa}}: kliknij wewnątrz obszaru. Wpisz jego rzędną we Właściwościach albo użyj przycisków ▲ ▼.
3. {{ui:Niwelacja}} › {{ui:Edytuj warstwicę}}: kliknij warstwicę wewnątrz obszaru, aby pobrać ją jako linię do przekształcenia.

Zaznacz rzędną punktową lub warstwicę i **przeciągnij** ją (albo jej punkty) na planie: powierzchnia podąża za nią po puszczeniu, jako jeden krok cofania. Wewnątrz obszaru teren jest odbudowywany od swojej krawędzi (tam, gdzie styka się z terenem istniejącym), z rzędnymi punktowymi i edytowanymi warstwicami.

## Wykop i nasyp na żywo

We Właściwościach każdego obiektu niwelacji widać jego **Wykop** i **Nasyp** oraz wartości dla całego terenu, liczone metodą siatki używaną przez Roboty ziemne, na bieżąco podczas zmian. Problemy (poza powierzchnią, obrys przecinający sam siebie) są tam wypisane.

## Kontrole niwelacji

W sekcji **Kontrole niwelacji** po lewej stronie:

- **Analiza pochyleń** koloruje powierzchnię według spadku: do limitu łagodnego, pomiędzy nimi i bardziej stromo niż limit stromy (na początek 5 % i 33,3 %: zwykle 1:20 dla tras dostępnych i 1:3 pod koszenie). Legenda mówi, jaka część obszaru przypada na każdy przedział. Strome obszary są także drukowane na arkuszach.
- **Strzałki przepływu i zastoiska** rysują, w którą stronę spływa woda, i zakreślają każde miejsce, w którym woda by się zbierała, wraz z jej głębokością; sekcja podaje, ile jest takich miejsc, najgłębsze z nich i ile wody mieszczą.

Kontrole odczytują powierzchnię projektowaną, gdy cokolwiek jest niwelowane, a w przeciwnym razie teren istniejący.
