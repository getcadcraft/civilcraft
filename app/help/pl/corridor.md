---
title: Przeciągnij korytarz drogowy
summary: Włącz korytarz dla trasy, ustaw wartości pasa ruchu, pobocza i skarp bocznych, a potem odczytaj przekroje, linie zrównania i roboty ziemne, które powstają.
keywords: skrzyżowanie, węzeł, droga przecina drogę, droga boczna, skrzyżowanie typu T, przecięcie, rzędna placu, połączenie, włączenie, przechyłka, super, pochylenie na łuku, wybieg, runout, tabela wartości, spadek poprzeczny, obrót, korytarz, zestaw, podzestaw, przekrój typowy, droga, pas ruchu, pobocze, skarpa boczna, linia zrównania, wykop, nasyp, przekroje, cel, cele, cel szerokości, cel rzędnej, cel odsunięcia, poszerzenie, krawędź jezdni, podążaj za innym korytarzem
from: 6dcb92b3
---

Korytarz przeciąga jeden prosty przekrój typowy (zestaw, assembly) wzdłuż trasy i jej profilu projektowego, wyrównuje go do istniejącego terenu i dodaje wynik do powierzchni projektowej. Jedna trasa może mieć kilka korytarzy na różnych zakresach kilometrażu, a korytarz można zbudować z wielokrotnego użytku szablonów według kilometrażu ([Szablony korytarzy](topic:corridor-templates)). Prosty zestaw poniżej jest taki sam po obu stronach. Aby każda strona miała własne części, zobacz [Zbuduj każdą stronę z części](topic:corridor#build-each-side-from-parts).

## Zestaw

Od osi na zewnątrz, po każdej stronie:

1. **pas ruchu** o podanej szerokości, opadający od korony drogi ze **spadkiem pasa ruchu**
2. **pobocze** o podanej szerokości, ze **spadkiem pobocza**
3. **skarpa boczna** od krawędzi pobocza do miejsca, w którym styka się z terenem: **skarpa wykopu**, gdy teren jest powyżej, **skarpa nasypu**, gdy jest poniżej

Wartości początkowe są zastępcze, a nie normą projektową:

| Wartość | US feet | Metry |
|---|---|---|
| Szerokość pasa ruchu | 12 ft | 3.6 m |
| Spadek pasa ruchu | 2% | 2% |
| Szerokość pobocza | 4 ft | 1.2 m |
| Spadek pobocza | 4% | 4% |
| Skarpa wykopu | 2 : 1 | 2 : 1 |
| Skarpa nasypu | 3 : 1 | 3 : 1 |
| Przekrój co | 10 ft | 5 m |

Nachylenia skarp bocznych podaje się jako poziomo do pionowo (H:V): 3 : 1 oznacza 3 jednostki w poziomie na 1 w pionie.

## Zbuduj korytarz

Potrzebujesz trasy bez błędów oraz profilu projektowego z co najmniej dwoma PVI i bez błędów.

1. Wybierz trasę.
2. W prawym panelu, w sekcji **Korytarz**, zaznacz **Przeciągnij zestaw wzdłuż profilu projektowego**.
   Pola się pojawiają, a korytarz buduje się od razu. Plan pokazuje krawędzie pasa ruchu i pobocza oraz linie zrównania (daylight). Po wybraniu {{ui:Projektowana (wyprowadzona)}} przy ustawieniu **Wyświetlanie** poziomice pokazują nowy teren.
3. Zmień dowolną wartość: **Szerokość pasa ruchu**, **Spadek pasa ruchu**, **Szerokość pobocza**, **Spadek pobocza**, **Skarpa wykopu**, **Skarpa nasypu**, **Przekrój co**. Po każdej naciśnij {{key:Enter}}. Odstęp wykopu, nasypu i przekrojów musi być większy od 0.
4. Odczytaj linię pod polami, na przykład „39 przekrojów od 0+00.00 do 3+86.36; wykop 240.2 cu yd, nasyp 556.0 cu yd.”

Przekroje wycina się co krok **Przekrój co**, na końcach oraz na początku i końcu każdego łuku poziomego i pionowego. Każdy przekrój i linie przez niego biegnące (oś, krawędzie pasa ruchu i pobocza, linia zrównania) stają się liniami przełamań powierzchni projektowej.

Aby wyłączyć korytarz, odznacz pole. Jego wartości zostaną zachowane na następny raz.

## Gdy nie da się zbudować

Czerwona ramka pod polami podaje powód:

| Komunikat | Co zrobić |
|---|---|
| „Korytarz wymaga profilu projektowego bez błędów.“ | Dodaj PVI albo popraw nakładające się łuki pionowe (zobacz [Zaprojektuj profil pionowy](topic:profile)). |
| „Profil projektowy nie pokrywa się z trasą.“ | Przesuń PVI na zakres kilometrażu trasy. |
| „Korytarz wymaga co najmniej dwóch przekrojów na powierzchni.“ | Większa część korytarza leży poza istniejącym terenem. |
| „4 skarpy boczne wychodzą poza powierzchnię, zanim dotrą do terenu.“ | Przy krawędzi powierzchni skarpa nie może dosięgnąć terenu. Odsuń drogę od krawędzi albo obniż tam wysokość nasypu lub wykopu. |
| „Linie zrównania korytarza przecinają się (przekroje nachodzą na siebie, na przykład po wewnętrznej stronie ciasnego łuku). Użyj większego promienia lub węższego zestawu.“ | Przekroje po wewnętrznej stronie ostrego łuku nachodzą na siebie. Zwiększ promień albo zwęź zestaw. |

Korytarz z problemem nie jest wyrównywany do terenu i nie wlicza się do robót ziemnych.

## Korytarze i place razem

Powierzchnia projektowa buduje się po kolei: najpierw wszystkie korytarze, potem wszystkie place. Tam, gdzie wyrównanie placu nakłada się na korytarz, wygrywa plac. Tam, gdzie późniejszy element nakłada się na drogę, zastępowana jest tylko ta część drogi, która leży wewnątrz linii zrównania późniejszego elementu; reszta drogi i każda linia przełamania terenu, którą droga przecina, zachowuje swój kształt. Objętości liczy się wewnątrz wszystkich linii zrównania razem; zobacz [Objętości robót ziemnych](topic:volumes).

## Przechyłka

Na łuku droga może być pochylona w stronę wewnętrzną, aby pojazdy były mniej spychane na zewnątrz. Zaznacz **Przechyl łuki** pod **Przechyłką** we **Właściwościach** trasy:

- Każdy łuk kołowy dostaje wartość **e** z tabeli wartości: z pierwszego wiersza, którego promień łuk osiąga (wiersz z pustą wartością zachowuje normalny daszek). Tabela i **Maks. spadek względny** (na start 0.5 %) są wartościami zastępczymi, a nie normą: ustaw je według własnych kryteriów projektowych. Dodawaj lub usuwaj wiersze według potrzeb.
- Pasy obracają się wokół osi. Przed łukiem zewnętrzny pas spłaszcza się na **wybiegu** (runout: normalny daszek ÷ e × runoff), potem na **przejściu** (runoff: szerokość pasa × e ÷ spadek podłużny). Zewnętrzny pas dalej się obraca, aż cała droga opada z nachyleniem e w stronę wewnętrzną; dwie trzecie przejścia leży przed łukiem, a jedna trzecia na nim. Po łuku dzieje się to w odwrotnej kolejności.
- Pobocze po niskiej stronie nigdy nie jest płaskie niż jego pas ruchu; po wysokiej stronie zachowuje własny spadek (przechyla się).
- Tabela pod spodem wylicza promień, wartość, przejście i wybieg każdego łuku oraz miejsca, w których zaczyna się i kończy pełna przechyłka. **Diagram przechyłki** rysuje spadki poprzeczne obu pasów wzdłuż kilometrażu (lewy pas linią ciągłą, prawy przerywaną).
- Łuk zbyt krótki, by osiągnąć pełną przechyłkę, albo dwa łuki, których przejścia nakładają się, są zgłaszane w ramce nad tabelą.

Przekroje, objętości, widok 3D i arkusze pokazują pochyloną drogę. Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa.

## Cele

Cel przesuwa jeden punkt jednej strony drogi do linii: **Krawędź jezdni** albo **Krawędź pobocza**, po **Lewej** lub **Prawej** stronie. Każdy przekrój spotyka linię pod kątem prostym do osi, idąc na zewnątrz tylko po tej stronie, więc cel po prawej nigdy nie przesuwa lewej strony.

| Ustawia | Co się dzieje tam, gdzie przekrój spotyka linię |
|---|---|
| **Szerokość** | Punkt leży na linii: pas ruchu (albo pobocze) poszerza się lub zwęża do niej, zachowując swój spadek poprzeczny. |
| **Rzędną** | Punkt przyjmuje tam rzędną linii, przy własnym odsunięciu: spadek poprzeczny pasa (albo pobocza) podąża za nią. |

Linią może być linia charakterystyczna (niezależnie od jej **Użycia**) albo linia innego korytarza: jego oś, krawędzie jezdni, krawędzie pobocza lub linie zrównania. Linia korytarza podąża za tamtym korytarzem: zmień tamtą drogę, a ta też się zmieni. CivilCraft buduje najpierw drugi korytarz. Dwa korytarze, które wskazywałyby na siebie w pętli, są odrzucane po jednej stronie, a tabela mówi, po której.

1. Wybierz trasę i włącz jej korytarz.
2. Pod **Cele** kliknij {{ui:Dodaj cel}}.
3. Wybierz **Stronę**, **Punkt**, co **Ustawia** i **Do linii**. Każda zmiana to jeden krok cofania.

**Wynik** podaje, na ilu przekrojach osiągnięto linię. Przekroje, które jej nie osiągają (poza jej końcami albo tam, gdzie leżą za osią), zachowują wartości zestawu. Usunięta linia zostawia korytarz tak, jak był przed celem, a tabela to mówi. Jedna strona może mieć jeden cel szerokości i jeden cel rzędnej dla każdego punktu.

## Zbuduj każdą stronę z części

Włącz **Zbuduj każdą stronę z części** w ustawieniach korytarza. Każda strona ma wtedy własną listę, od osi na zewnątrz: pasy ruchu, pobocze, ściek, krawężnik, pas zieleni, chodnik i na końcu skarpę boczną do terenu (z własnymi stosunkami wykopu i nasypu). Zacznij od {{ui:Droga poza terenem zabudowanym}} albo {{ui:Ulica miejska}}, dodawaj i usuwaj części, przesuwaj je strzałkami i {{ui:Kopiuj}} jedną stronę na drugą. Każda zmiana to jeden krok cofania.

Spadek poprzeczny to spadek od drogi, więc chodnik odprowadzający wodę w stronę drogi ma wartość ujemną. Krawężnik to ściana o podanej wysokości, górna powierzchnia o podanej szerokości i opcjonalny opad z tyłu. Przechyłka obraca każdy pas w pierwszym wierszu; ściek, krawężnik, pas zieleni i chodnik zawieszone są na krawędzi pasów tak, jak zbudowano. Cele nadal przesuwają koniec pasów i ostatnią część. Przekroje oznaczają linię spływu ścieku, górę i tył krawężnika oraz resztę. Na łuku z klotoidami wybieg to klotoida: na TS poziomy daszek, na SC pełna przechyłka.

## Warstwy nawierzchni

Pas ruchu, pobocze, ściek, pas zieleni lub chodnik mogą mieć swoją konstrukcję: pod daną częścią {{ui:Dodaj warstwę}} dodaje warstwę z nazwą, materiałem, grubością i rodzajem (ścieralna, wiążąca, podbudowa, podbudowa pomocnicza, ulepszone podłoże lub inna), od góry do dołu. Warstwy nie przesuwają powierzchni drogi (jej górna część to powierzchnia projektowa). Każda leży pod swoją częścią, a jej głębokość mierzy się prosto w dół. Przekroje rysują dolną krawędź każdej warstwy linią przerywaną, a {{ui:Warstwy nawierzchni: ilości}} wylicza pole w planie i objętość każdej warstwy (pole wzdłuż korytarza z przekrojów, objętość = pole × grubość). Eksport IFC zapisuje każdą warstwę jako osobny element z grubością i materiałem (zobacz [Eksport i import IFC](topic:ifc)). Grubość, którą wpisujesz, jest Twoja: CivilCraft nie dobiera nawierzchni.

## Gdzie drogi łączą się z drogami, placami i ścieżkami

Gdy włączone jest {{ui:Łącz z drogami i placami, które styka}} (jest włączone dla każdego korytarza), CivilCraft łączy korytarz z tym, co styka w planie:

- **Droga kończąca się na innej drodze** (koniec jej trasy leży na tamtej drodze albo w odległości około połowy własnej szerokości jezdni od jej krawędzi) jest drogą boczną skrzyżowania. Droga, na którą wpada, otwiera swoją krawędź pod jezdnię drogi bocznej: w poprzek wlotu pobocze, krawężnik, pas zieleni i chodnik układane są przy spadku poprzecznym pasa i rysowane jako nawierzchnia. Droga boczna leży na powierzchni drogi głównej tam, gdzie się nakładają, i jest wyrównywana do niej na dojeździe.
- **Dwie drogi przecinające się** łączą się tak samo po obu stronach. Droga wymieniona pierwsza w sekcji Trasy jest drogą przelotową; druga podąża za jej powierzchnią w poprzek.
- **Droga kończąca się przy placu** (wewnątrz niego albo w odległości około połowy szerokości jezdni od jego krawędzi) dociera do poziomu placu i jest do niego wyrównywana na dojeździe.
- **Ścieżka** (Krajobraz › Nawierzchnie utwardzone) zatrzymuje się na zewnętrznej krawędzi drogi, na poziomie chodnika lub pobocza tam, zamiast leżeć na drodze. Ścieżka przecinająca drogę staje się dwoma odcinkami. Koniec narysowany nieco za krótko przed drogą (w odległości do dwukrotności szerokości ścieżki) jest przedłużany do jej krawędzi.

**Właściwości** mówią, co każdy korytarz połączył, o ile go tam podniesiono lub obniżono i na jakiej długości. Ta długość to większa z wartości 10 m (30 ft) i dwudziestokrotności zmiany, nigdy więcej niż 45% korytarza. **Profil projektowy się nie zmienia**: widok profilu nadal pokazuje linię niwelety, którą narysowano, a przekroje, powierzchnia projektowa, objętości i widok 3D pokazują drogę po połączeniu. Aby połączenie było dokładne już w projekcie, przesuń ostatnie PVI na poziom podany we Właściwościach.

Wyłącz przełącznik w korytarzu, aby zostawić go dokładnie tak, jak określają profil i zestaw. Wtedy nie bierze udziału w żadnym skrzyżowaniu, ani jako droga boczna, ani jako przelotowa. Drogi schodzące się niemal w linii (poniżej około 20°) nie są ruszane, podobnie jak drogi gruntowe.

Czego skrzyżowanie jeszcze nie robi: nie ma zaokrągleń krawężnika (narożniki są proste), nie ma pasów skrętnych ani wysepek, koniec drogi bocznej jest cięty prostopadle do jej własnej trasy, a korytarz zbudowany z szablonów otwiera krawędź w ten sam prosty sposób (rów lub mur w warunkach końcowych jest wyrównywany w poprzek wlotu, bez przepustu). Zaokrąglenia krawężników w planie, trójkąty widoczności i oznakowanie poziome znajdziesz w [Grunty, drogi, pomiary, kopalnie i łącza](topic:soils-roads-survey-mines-links).

## Jeszcze nie zbudowano

Cele dla nachylenia skarpy nie są jeszcze dostępne. Dla korytarza, który zmienia się wzdłuż drogi, z lewą i prawą stroną rozdzielonymi, użyj [Szablony korytarzy](topic:corridor-templates). Zobacz [Jeszcze nie zbudowano](topic:not-built-yet).
