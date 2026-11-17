---
title: Szablony korytarzy i szablony terenu
summary: Twórz małe, wielokrotnego użytku szablony (krawężnik i ściek, chodnik, mur, rów), buduj z nich korytarz według kilometrażu z lewą i prawą stroną osobno, dziel oś na kilka korytarzy i nakładaj warstwy materiałów na teren.
keywords: szablon, szablony, biblioteka szablonów, tworzenie szablonów, przekrój typowy, zestaw, podzespół, komponenty, kody punktów, warunek końcowy, daylight, rów, mur oporowy, krawężnik, ściek, chodnik, regiony, zakres kilometrażu, kilka korytarzy, wiele korytarzy, lewa i prawa, szablon terenu, humus, nawierzchnia, podbudowa, nałóż, materiały, ilości
from: ce70e58b
---

**Szablon** to mały przekrój poprzeczny, który rysujesz raz i używasz wielokrotnie: punkty z odsunięciami, spadkami i kodami punktów oraz komponenty z materiałami. Korytarz może być zbudowany z szablonów według kilometrażu, przy czym każda strona ma własne szablony nawierzchni i własny warunek końcowy, a te same szablony mogą być nałożone na teren.

:::warning
Przykładowe szablony są symbolicznymi punktami wyjścia. Ich liczby nie pochodzą z żadnej normy ani zarządcy drogi. Inżynier musi sprawdzić każdy szablon i każdą wartość, którą mu podasz, zanim zostanie użyty w projekcie.
:::

## Otwórz szablony

Otwórz {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (lub wpisz {{cmd:TEMPLATES}}). Okno ma trzy listy:

- **W tym projekcie**: szablony, których używają korytarze i szablony terenu tego projektu. Są zapisane w pliku projektu.
- **Moja biblioteka**: szablony przechowywane w tej przeglądarce i oferowane w każdym projekcie. Użyj {{ui:Save to My library}} na szablonie projektu, aby go zachować.
- **Przykłady**: dwa pasy ruchu z warstwami, krawężnik i ściek, chodnik, wyjście skarpy (daylight), rów, mur oporowy, humus poniżej terenu oraz nawierzchnia na terenie. Każdy jest oznaczony jako „Do sprawdzenia przez inżyniera”.

{{ui:Use in this project}} kopiuje szablon z biblioteki lub przykładów do projektu. {{ui:Export this project's templates}} zapisuje je jako plik `.cctemplates.json`, a {{ui:Import a file}} wczytuje jeden do projektu i do Mojej biblioteki. Użyj pliku, aby udostępnić szablony lub przenieść je na inny komputer.

## Utwórz szablon

{{ui:New template}} (lub {{ui:Edit}} na szablonie projektu) otwiera edytor szablonów. Narysuj prawą stronę, wychodząc na zewnątrz od punktu 0,0 szablonu; lewa strona używa tego samego szablonu, wychodząc na zewnątrz w lewo.

1. Nadaj nazwę i rodzaj: **Nawierzchnia** (następny szablon przylega do jej końca), **Warunek końcowy** (spotyka teren) albo **Szablon terenu**.
2. Dodaj **wartości**: nazwane liczby, na przykład szerokość `w` lub spadek `s`. Pole liczby w dowolnym miejscu szablonu przyjmuje liczbę lub nazwę wartości; `-t` to wartość `t` z minusem. Korytarz może nadać każdemu użyciu szablonu własne wartości, więc jeden szablon krawężnika obsługuje każdą wysokość krawężnika.
3. Dodaj **punkty** w kolejności. Każdy jest umieszczany od wcześniejszego punktu (lub punktu 0,0) według swojego ograniczenia:

| Ograniczenie | Umieszcza punkt |
|---|---|
| Odsunięcie przy spadku | Odsunięcie na zewnątrz i spadek (wzniesienie na odcinek poziomy; −0.02 oznacza spadek 2%) |
| Odsunięcie i wzniesienie | Odsunięcie i wzniesienie |
| Prosto w górę lub w dół | Samo wzniesienie |
| Skarpa do terenu | Na zewnątrz od swojego punktu do terenu, przy stosunku wykopu, gdy teren jest powyżej, i stosunku nasypu, gdy poniżej |
| Do terenu | Odsunięcie, a potem prosto w górę lub w dół do terenu |
| Mur oporowy | Mur o podanej grubości: w wykopie jego góra spotyka teren przy licu drogi, w nasypie droga biegnie nad nim, a jego zewnętrzna ściana opada do terenu |

   Zaznacz **Górny** dla punktów, przez które przechodzi gotowa powierzchnia. Ostatni górny punkt to miejsce, w którym zaczyna się następny szablon po tej stronie. **Cel** pozwala korytarzowi przesunąć punkt: jego odsunięcie lub rzędna pochodzi z linii.
4. Dodaj **komponenty**: zamknięte kształty przez kody punktów (`0` to punkt 0,0), każdy z nazwą, materiałem i rodzajem. Ich pola dają objętości.

Rysunek podąża za każdą zmianą w prawdziwej skali, a lista pod nim mówi, co jest nie tak (punkt spotyka teren przed końcem, wartość, której szablon nie ma, komponent bez pola). {{ui:Add to this project}} lub {{ui:Save}} zachowuje go jako jeden krok cofania.

## Zbuduj korytarz z szablonów

Wybierz oś z korytarzem i we jej **Właściwościach** włącz {{ui:Build from templates by station}}. Korytarz zaczyna się od przykładów dwóch pasów i wyjścia skarpy po obu stronach.

- **Regiony.** Każdy region zaczyna się od kilometrażu i trwa do początku następnego. {{ui:Add a region}} dodaje jeden; zmień jego kilometraż początkowy w jego polu.
- **Lewa i prawa osobno.** Każda strona każdego regionu ma własną listę **Nawierzchnia**, od osi na zewnątrz, i własny **Warunek końcowy**: wyjście skarpy, rów, mur albo dowolny szablon, który spotyka teren. Bez warunku końcowego strona wychodzi na skarpy wykopu i nasypu korytarza. {{ui:Copy left to right}} kopiuje stronę.
- **Wartości i cele.** Pod każdym szablonem po stronie pole dla każdej wartości (puste = własna wartość szablonu) i, dla punktu przyjmującego cel, linia charakterystyczna lub linia innego korytarza, która go przesuwa.
- **Od** i **Do** ograniczają korytarz do części osi.

Przekroje, linie planu dla każdego kodu punktu, zaprojektowana powierzchnia, wytyczenie i roboty ziemne podążają za tym wszystkim. Właściwości pokazują objętość każdego komponentu na stronę i region (metodą średnich pól przekrojów wzdłuż osi). Przechyłka i cele krawędzi korytarza nie są używane, gdy korytarz jest budowany z szablonów.

## Kilka korytarzy na jednej osi

Pod **Korytarze na tej osi** {{ui:Add a corridor}} dodaje korytarz na reszcie osi: pierwszy korytarz dostaje kilometraż końcowy w środku (lub zachowuje własny), a nowy zaczyna się tam z ostatnim regionem szablonów pierwszego. Każdy korytarz ma własną nazwę, zakres kilometrażu, szablony i roboty ziemne. Wyłącz jeden polem {{ui:On}}. Tam, gdzie zakresy się nakładają, późniejszy korytarz wyprofiluje się nad wcześniejszym.

## Szablony terenu

Szablon terenu nakłada warstwy szablonu na teren od jego punktu 0,0: warstwa poniżej punktu 0,0 wchodzi w grunt (humus do zdjęcia), a warstwa powyżej leży na gruncie (podbudowa i nawierzchnia na parkingu). Szerokości i spadki nie mają znaczenia, liczy się tylko głębokość każdego komponentu powyżej lub poniżej punktu 0,0.

Otwórz {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (lub wpisz {{cmd:TERRAINTEMPLATES}}); blok jest też we Właściwościach projektu. {{ui:Add a terrain template}} dodaje jeden z przykładowym humusem. Dla każdego wybierz:

- **szablon** (jego wartości można zmienić dla tego jednego),
- **teren**: istniejący grunt lub projektowaną powierzchnię,
- **kształt**, który go przycina: cały teren, działkę, plac lub zamkniętą linię charakterystyczną. Kilka szablonów terenu może używać różnych kształtów na tym samym terenie.

Każda warstwa podaje swoją grubość, pole w planie i objętość. Objętość to pole w planie razy grubość, z grubością mierzoną prosto w dół; pole mierzy się na siatce, a podaje się też pole pochylonej powierzchni. Kształty są rysowane na planie na warstwie C-TOPO-TMPL. Szablony terenu nie zmieniają projektowanej powierzchni.

## Materiały i ilości

Blok Ziemne roboty projektu wymienia **Materiały z szablonów**: każdy komponent korytarza i każdą warstwę szablonu terenu wraz z objętością. {{ui:Send to TakeoffCraft}} zapisuje je do pliku ilości po wykopie i nasypie, jako po jednej pozycji, w jardach sześciennych (projekty w stopach) lub metrach sześciennych.

## Pliki

Szablony, regiony, dodatkowe korytarze i szablony terenu są zapisywane w pliku projektu. Projekt, który ich nie używa, jest zapisywany dokładnie jak wcześniej, a starsze wersje CivilCraft otwierają projekt, który ich używa (ignorują szablony i budują własny zestaw korytarza).
