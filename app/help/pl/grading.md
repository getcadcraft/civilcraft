---
title: Niweluj plac pod budynek
summary: Narysuj płaski plac, ustaw jego rzędną oraz skarpy wykopu i nasypu, a CivilCraft wyprowadzi go do istniejącego terenu i doda do powierzchni projektowanej.
keywords: ściana oporowa, ściany oporowe, pionowa ściana, ściana zamiast skarpy, skarpa dla każdego boku, nasyp, niwelacja, plac, plac pod budynek, przecięcie z terenem, linia charakterystyczna, grupa niwelacji, skarpa wykopu, skarpa nasypu, niweleta wykończenia, powierzchnia projektowana, niwelacja terenu
from: 482319a6
---

Plac to płaski obszar o jednej rzędnej. Od jego krawędzi CivilCraft prowadzi skarpę na zewnątrz: skarpą wykopu, gdy teren jest wyżej niż plac, i skarpą nasypu, gdy jest niżej, aż skarpa natrafi na istniejący teren. Ta linia styku to linia przecięcia z terenem (daylight line). Plac i jego skarpy zastępują istniejący teren wewnątrz linii przecięcia, tworząc powierzchnię projektowaną.

## Rysowanie placu

Najpierw potrzebna jest istniejąca powierzchnia terenu.

1. Naciśnij {{key:G}} albo kliknij {{ui:Plac}} w grupie **Projekt**.
   Podpowiedź brzmi: „Plac: kliknij jego narożniki. Enter lub podwójne kliknięcie kończy, Backspace usuwa ostatni, Esc anuluje.”
2. Klikaj narożniki placu po kolei, w dowolnym kierunku. Niebieski kontur podąża za wskaźnikiem.
3. Naciśnij {{key:Enter}} po ostatnim narożniku (co najmniej trzy).
   Plac zostaje narysowany i zaznaczony. Zaczyna się na rzędnej terenu w jego środku, zaokrąglonej do 0.1, ze skarpą wykopu 2 : 1 i skarpą nasypu 3 : 1. Pasek stanu mówi na przykład: „Plac 1 na rzędnej 254.3 (teren w jego środku), wykop 2:1, nasyp 3:1. Zmień je we Właściwościach.”

:::warning
Zakończ klawiszem {{key:Enter}}. Podwójne kliknięcie też kończy, ale w tej wersji usuwa klikany narożnik. Kliknij ostatni narożnik raz, a potem naciśnij {{key:Enter}}.
:::

Kontur placu nie może przecinać samego siebie („Kontur placu przecina sam siebie.”).

## Ustawianie rzędnej i skarp

Gdy plac jest zaznaczony, prawy panel pokazuje **Plac**:

1. **Nazwa**.
2. **Rzędna**: płaska rzędna placu.
3. **Skarpa wykopu** i **Skarpa nasypu**, jako H:V (2 oznacza 2 : 1). Obie muszą być większe od 0.
4. **Powierzchnia placu** i **Narożniki** są pokazane dla orientacji.

Naciśnij {{key:Enter}} po każdej wartości. Linia przecięcia, powierzchnia projektowana i objętości aktualizują się od razu.

Pod polami czytasz na przykład: „Linia przecięcia z terenem: 48 linii skarp (20 w wykopie, 28 w nasypie), najdalej 31.20 ft od krawędzi.” Plan pokazuje linię przecięcia i linie skarp kolorem magenta.

## Jak znajdowana jest linia przecięcia

- Linie skarp wychodzą z każdej krawędzi prostopadle do niej, mniej więcej co dwudziestą część wielkości placu.
- Na zewnętrznych narożnikach rozchodzą się co 10°, tak że skarpa oplata narożnik.
- Na wewnętrznych narożnikach jedna linia biegnie wzdłuż dwusiecznej, gdzie spotykają się skarpy z dwóch krawędzi.
- Każda linia wspina się ze skarpą wykopu albo opada ze skarpą nasypu, aż dotrze do terenu.

## Skarpy dla każdego boku i ściany oporowe

Pod **Boki i ściany oporowe** we Właściwościach placu, platformy lub wału każdy bok może być niwelowany na swój sposób. Bok 1 biegnie od pierwszego klikniętego narożnika do drugiego, bok 2 od drugiego do trzeciego, i tak dalej.

- **Wszystkie boki**: **Skarpy** używa powyższych skarp wykopu i nasypu na każdym boku; **Pionowo: ściany oporowe** stawia ścianę na każdym boku.
- Dla każdego boku: **Skarpy powyżej**, **Własne skarpy** (wpisz skarpę wykopu i nasypu dla tego boku) albo **Pionowo (ściana oporowa)**.
- Wpisz skarpę jako `3` lub `3:1` (poziomo do 1 pionowo), `33%` albo `18.4°`; zostanie pokazana jako H:1. Własne **Skarpa wykopu** i **Skarpa nasypu** placu przyjmują to samo.
- Bok pionowy nie ma nasypu: ściana oporowa biegnie wzdłuż krawędzi, od placu w dół do istniejącego terenu (w nasypie) albo od terenu w dół do placu (w wykopie). **Grubość ściany** (na start 0,3 m lub 1 ft) to odległość, o jaką teren schodzi od krawędzi placu do istniejącego terenu. Objętości wykopu i nasypu pomijają nasyp, którego ten bok już nie ma.
- Tam, gdzie ściana styka się z bokiem skarpowym, skarpa oplata koniec ściany; dwie ściany łączą się na ukos.
- Pod polami podane są: długość ścian, widoczna powierzchnia (wysokość × długość), najwyższa i średnia wysokość.

Plan rysuje zewnętrzną powierzchnię każdej ściany krótkimi kreskami poprzecznymi oraz jej wysokość na obu końcach i w najwyższym punkcie (na warstwie ścian oporowych, która też trafia do DXF i DWG). Widok 3D pokazuje ściany jako bryły (Pokaż › Ściany oporowe), a eksporty GLB, OBJ i USD je uwzględniają. Przekroje przez krawędź pokazują stopień.

**Ostrzeżenia** (we Właściwościach i w panelu Problemy): ściana wyższa niż **Ostrzegaj powyżej wysokości ściany** (na start 1.0 m lub 3.3 ft) „może wymagać ściany zaprojektowanej przez inżyniera lub pozwolenia; sprawdź lokalne przepisy”, oraz — gdy wpiszesz **Najbardziej stromą skarpę, jaką utrzymuje grunt** — każdy bok, którego skarpa wykopu lub nasypu jest bardziej stroma niż to. To tylko ostrzeżenia: niweleta i tak się buduje. Każda zmiana to jeden krok dla {{key:Mod+Z}}.

## Przesuwanie narożników

Zaznacz plac, a potem przeciągnij kwadratowy uchwyt przy narożniku. Każde przeciągnięcie to jeden krok cofania. Dodawanie lub usuwanie narożników nie jest jeszcze dostępne: usuń plac i narysuj go ponownie.

## Gdy nie daje niwelacji

Czerwona ramka pod **Roboty ziemne** podaje nazwę placu i problem:

| Komunikat | Co zrobić |
|---|---|
| „3 linie skarp wychodzą poza powierzchnię, zanim ją spotkają: plac jest za blisko krawędzi powierzchni albo ma zbyt wysoką lub zbyt niską rzędną.” | Przesuń plac od krawędzi powierzchni albo przybliż jego rzędną do terenu. |
| „Linia przecięcia z terenem przecina sama siebie (skarpy z różnych boków placu wchodzą na siebie). Zmień kształt placu albo skarpy.” | Typowe dla wąskich lub L-kształtnych placów w głębokim wykopie albo wysokim nasypie. Poszerz plac, zmniejsz różnicę wysokości albo stromij skarpy. |
| „Kontur placu przecina sam siebie.” | Narysuj narożniki od nowa, po kolei dookoła placu. |

Plac z problemem jest pomijany w powierzchni projektowanej i w objętościach, dopóki nie zostanie naprawiony.

## Zobacz wynik

1. W sekcji **Wyświetlanie** ustaw **Powierzchnia** na {{ui:Projektowana (wyprowadzona)}}. Poziomice biegną teraz płasko przez plac i wzdłuż skarp aż do linii przecięcia.
2. Najedź wskaźnikiem na plac: pasek stanu pokazuje rzędne **Grunt** i **Wyprowadzona**.
3. Odczytaj wykop i nasyp w sekcji **Roboty ziemne**; zob. [Objętości robót ziemnych](topic:volumes).

Place są niwelowane po korytarzach, w kolejności, w jakiej je narysowano. Późniejszy plac zastępuje wszystko, co wcześniej leżało w jego własnej linii przecięcia.

## Usuwanie placu

Zaznacz go i naciśnij {{key:Delete}} (na Macu Fn i Delete) albo kliknij {{ui:Usuń}}.

## Jeszcze niezbudowane

Place są płaskie: pochyłe place, linie charakterystyczne o zmiennym spadku, ławy oraz niwelacja do zadanej odległości lub rzędnej nie są jeszcze dostępne. Zob. [Jeszcze nie zbudowano](topic:not-built-yet).
