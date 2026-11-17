---
title: Przeciągnij korytarz drogowy
summary: Włącz korytarz dla osi, ustaw wartości pasa, pobocza i skarpy bocznej oraz odczytaj przekroje, linie wyjścia i roboty ziemne, które powstają.
keywords: przechyłka, superelevation, pochylenie, wybieg, rampa, tabela rampy, spadek poprzeczny, obrót, korytarz, zestaw, podzespół, przekrój typowy, droga, pas ruchu, pobocze, skarpa boczna, daylight, wykop, nasyp, przekroje, cel, cele, cel szerokości, cel rzędnej, cel odsunięcia, poszerzenie, krawędź nawierzchni, podążaj za innym korytarzem
from: 91303189
---

Korytarz przeciąga jeden prosty przekrój typowy (zestaw) wzdłuż osi i jej niwelety projektowej, wyprofilowuje go w teren istniejący i dodaje wynik do powierzchni projektowanej. Na jednej osi może być kilka korytarzy na różnych zakresach kilometrażu, a korytarz może być zbudowany z wielokrotnego użytku szablonów według kilometrażu ([Szablony korytarzy](topic:corridor-templates)). Poniższy prosty zestaw jest taki sam po obu stronach; aby nadać każdej stronie własne części, zob. [Buduj każdą stronę z części](topic:corridor#build-each-side-from-parts).

## Zestaw

Od osi na zewnątrz, po każdej stronie:

1. **pas ruchu** o podanej szerokości, opadający od osi przy **spadku pasa**
2. **pobocze** o podanej szerokości przy **spadku pobocza**
3. **skarpa boczna** od krawędzi pobocza do miejsca, w którym spotyka teren: **skarpa wykopu**, gdzie teren jest wyżej, i **skarpa nasypu**, gdzie jest niżej

Wartości początkowe są symboliczne, a nie normą projektową:

| Wartość | Stopy US | Metry |
|---|---|---|
| Szerokość pasa | 12 ft | 3.6 m |
| Spadek pasa | 2% | 2% |
| Szerokość pobocza | 4 ft | 1.2 m |
| Spadek pobocza | 4% | 4% |
| Skarpa wykopu | 2 : 1 | 2 : 1 |
| Skarpa nasypu | 3 : 1 | 3 : 1 |
| Przekrój co | 10 ft | 5 m |

Spadki skarp są podawane poziomo do pionowo (H:V): 3 : 1 oznacza 3 w poziomie na 1 w pionie.

## Zbuduj korytarz

Potrzebujesz osi bez błędów oraz niwelety projektowej z co najmniej dwoma PVI, bez błędów.

1. Zaznacz oś.
2. W prawym panelu, pod **Korytarz**, zaznacz **Przeciągnij zestaw wzdłuż niwelety projektowej**.
   Pola się pojawiają, a korytarz buduje się od razu. Plan pokazuje krawędzie pasa i pobocza oraz linie wyjścia; przy wyborze {{ui:Proposed (graded)}} w **Wyświetlaniu** warstwice pokazują nowy teren.
3. Zmień dowolną wartość: **Szerokość pasa**, **Spadek pasa**, **Szerokość pobocza**, **Spadek pobocza**, **Skarpa wykopu**, **Skarpa nasypu**, **Przekrój co**. Naciśnij {{key:Enter}} po każdej. Wykop, nasyp i odstęp przekrojów muszą być większe od 0.
4. Przeczytaj linię pod polami, na przykład „39 przekrojów od 0+00.00 do 3+86.36; wykop 240.2 cu yd, nasyp 556.0 cu yd.”

Przekroje są wykonywane co **Przekrój co**, na końcach oraz na początku i na końcu każdego łuku poziomego i pionowego. Każdy przekrój i linie przez nie (oś, krawędzie pasa i pobocza, wyjście) stają się liniami przełamania powierzchni projektowanej.

Aby wyłączyć korytarz, odznacz pole. Jego wartości są zachowane na następny raz.

## Gdy się nie buduje

Czerwona ramka pod polami mówi, dlaczego:

| Komunikat | Co zrobić |
|---|---|
| „Korytarz wymaga niwelety projektowej bez błędów.” | Dodaj PVI albo popraw nakładające się łuki pionowe (zob. [Projektuj profil pionowy](topic:profile)). |
| „Niweleta projektowa nie pokrywa się z osią.” | Przesuń PVI na zakres kilometrażu osi. |
| „Korytarz potrzebuje co najmniej dwóch przekrojów na powierzchni.” | Większość korytarza leży poza istniejącym terenem. |
| „4 skarpy boczne wychodzą poza powierzchnię, zanim spotkają teren.” | Przy krawędzi powierzchni skarpa nie może dosięgnąć terenu. Trzymaj drogę z dala od krawędzi albo obniż tam wysokość nasypu lub wykopu. |
| „Linie wyjścia korytarza przecinają się (przekroje nakładają się, na przykład po wewnętrznej stronie ciasnego łuku). Użyj większego promienia lub węższego zestawu.” | Przekroje po wewnętrznej stronie ostrego łuku nakładają się. Zwiększ promień lub zawęż zestaw. |

Korytarz z problemem nie jest wyprofilowany i nie wlicza się do robót ziemnych.

## Korytarze i place razem

Powierzchnia projektowana jest budowana w kolejności: najpierw każdy korytarz, potem każdy plac. Tam, gdzie profilowanie placu nakłada się na korytarz, wygrywa plac. Objętości liczone są wewnątrz wszystkich linii wyjścia razem; zob. [Objętości robót ziemnych](topic:volumes).

## Przechyłka

Na łuku droga może się przechylać ku wewnętrznej stronie, tak że ruch jest mniej wypychany na zewnątrz. Zaznacz **Przechyl łuki** pod **Przechyłką** we **Właściwościach** osi:

- Każdy łuk kołowy dostaje wskaźnik **e** z tabeli: pierwszy wiersz, do którego sięga promień łuku (wiersz z pustym wskaźnikiem zachowuje normalny daszek). Tabela i **Maks. względny spadek** (na początek 0.5 %) są symboliczne, a nie normą: ustaw je według własnych kryteriów projektowych. Dodawaj lub usuwaj wiersze według potrzeb.
- Pasy obracają się wokół osi. Przed łukiem zewnętrzny pas wypłaszcza się na **wybiegu** (runout; normalny daszek ÷ e × rampa), potem na **rampie** (runoff; szerokość pasa × e ÷ spadek) zewnętrzny pas dalej się obraca, aż cała droga pochyla się o e ku wewnętrznej stronie; dwie trzecie rampy leżą przed łukiem, a jedna trzecia na nim. Po łuku dzieje się to w odwrotnej kolejności.
- Pobocze po niskiej stronie nigdy nie jest płaskie niż jego pas; po wysokiej stronie zachowuje własny spadek (przewraca się).
- Tabela pod spodem wymienia promień, wskaźnik, rampę i wybieg każdego łuku oraz miejsca, w których zaczyna się i kończy pełna przechyłka. **Schemat przechyłki** rysuje spadki poprzeczne obu pasów wzdłuż kilometrażu (lewy pas linią ciągłą, prawy przerywaną).
- Łuk zbyt krótki, by osiągnąć pełną przechyłkę, albo dwa łuki, których przejścia się nakładają, są zgłaszane w ramce nad tabelą.

Przekroje, objętości, widok 3D i arkusze pokazują pochyloną drogę. Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa.

## Cele

Cel przesuwa jeden punkt jednej strony drogi do linii: **Krawędź nawierzchni** albo **Krawędź pobocza**, po stronie **Lewej** lub **Prawej**. Każdy przekrój spotyka linię prostopadle do osi, idąc na zewnątrz tylko po tej stronie, więc cel po prawej nigdy nie przesuwa lewej strony.

| Ustawia | Co się dzieje tam, gdzie przekrój spotyka linię |
|---|---|
| **Szerokość** | Punkt leży na linii: pas (lub pobocze) poszerza się lub zwęża do niej, zachowując swój spadek poprzeczny. |
| **Rzędną** | Punkt przyjmuje tam rzędną linii, przy własnym odsunięciu: spadek poprzeczny pasa (lub pobocza) idzie za nią. |

Linia może być linią charakterystyczną (dowolnego **Zastosowania**) albo linią innego korytarza: jego osią, krawędziami nawierzchni, krawędziami pobocza lub liniami wyjścia. Linia korytarza podąża za tym korytarzem: zmień drugą drogę, a ta podąży. CivilCraft buduje najpierw inny korytarz; dwa korytarze, które celowałyby w siebie w pętli, są odrzucane po jednej stronie, a tabela mówi, która.

1. Zaznacz oś i włącz jej korytarz.
2. Pod **Cele** kliknij {{ui:Add a target}}.
3. Wybierz **Stronę**, **Punkt**, co **Ustawia** i **Do linii**. Każda zmiana to jeden krok cofania.

**Wynik** mówi, przy ilu przekrojach linia została osiągnięta. Przekroje, które jej nie osiągają (za jej końcami albo tam, gdzie jest za osią), zachowują wartości zestawu. Usunięta linia zostawia korytarz taki, jaki był przed celem, a tabela to mówi. Jedna strona może mieć jeden cel szerokości i jeden cel rzędnej dla każdego punktu.

## Buduj każdą stronę z części

Włącz **Buduj każdą stronę z części** w ustawieniach korytarza. Każda strona ma wtedy własną listę, od osi na zewnątrz: pasy, pobocze, ściek, krawężnik, pas zieleni, chodnik i na końcu skarpę boczną do terenu (z własnymi stosunkami wykopu i nasypu). Zacznij od {{ui:Rural road}} lub {{ui:Urban street}}, dodawaj i usuwaj części, przesuwaj je strzałkami i kopiuj jedną stronę na drugą za pomocą {{ui:Copy}}. Każda zmiana to jeden krok cofania.

Spadek poprzeczny to spadek w stronę od drogi, więc chodnik odprowadzający wodę w stronę drogi ma wartość ujemną. Krawężnik to ściana o podanej wysokości, góra o podanej szerokości i opcjonalne opuszczenie z tyłu. Przechyłka obraca każdy pas w pierwszym wierszu; ściek, krawężnik, pas zieleni i chodnik zwisają z krawędzi pasów takich, jakie zostały zbudowane. Cele nadal przesuwają koniec pasów i ostatnią część. Przekroje oznaczają linię spływu ścieku, górę i tył krawężnika oraz resztę. Na łuku z krzywymi przejściowymi wybieg to krzywa przejściowa: poziomy daszek w TS, pełna przechyłka w SC.

## Warstwy konstrukcyjne nawierzchni

Pas, pobocze, ściek, pas zieleni lub chodnik mogą mieć swoją konstrukcję: pod częścią {{ui:Add a course}} dodaje warstwę z nazwą, materiałem, grubością i rodzajem (ścieralna, wiążąca, podbudowa, podbudowa pomocnicza, ulepszone podłoże lub inna), od góry w dół. Warstwy nie przesuwają powierzchni drogi (jej górna część to powierzchnia projektowa); każda leży pod swoją częścią, a jej głębokość mierzona jest prosto w dół. Przekroje rysują dolną krawędź każdej warstwy linią przerywaną, a {{ui:Pavement courses: quantities}} wymienia pole w planie i objętość każdej warstwy (pole wzdłuż korytarza z jego przekrojów, objętość = pole × grubość). Eksport IFC zapisuje każdą warstwę jako osobny element z jej grubością i materiałem (zob. [Eksport i import IFC](topic:ifc)). Wpisana przez Ciebie grubość jest Twoja: CivilCraft nie dobiera wymiarów nawierzchni.

## Czego jeszcze nie zbudowano

Cele dla skarpy wyjścia nie są jeszcze dostępne. Dla korytarza, który zmienia się wzdłuż drogi, z lewą i prawą stroną osobno, użyj [Szablonów korytarzy](topic:corridor-templates). Zob. [Jeszcze nie zbudowano](topic:not-built-yet).
