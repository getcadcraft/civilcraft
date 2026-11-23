---
title: Linie przekrojów i przekroje poprzeczne
summary: Wycinaj przekroje prostopadle do trasy, oglądaj teren, projekt oraz wykop i nasyp na każdym kilometrażu i licz objętości metodą średnich pól przekrojów.
keywords: diagram mas, diagram masowy, punkt bilansowy, kurczenie, pęcznienie, odległość transportu, dowóz (borrow), odpad (waste), arkusze przekrojów, arkusze przekrojów poprzecznych, PDF przekrojów, przekroje, przekroje poprzeczne, linie przekrojów, widok przekroju, wykop, nasyp, pola, średnie pole przekroju, objętości metodą pól, roboty ziemne, kilometraż, odsunięcie, csv
from: 09639ce2
---

Przekrój poprzeczny pokazuje drogę tak, jak zostanie zbudowana: w poprzek trasy na jednym kilometrażu, istniejący teren, projekt (korytarz albo wyrównany plac) oraz wykop i nasyp między nimi.

## Dodaj linie przekrojów

1. Wybierz trasę. We **Właściwościach**, w sekcji **Linie przekrojów**, kliknij {{ui:Dodaj linie przekrojów}}.
2. Ustaw **Co** (odstęp: na start 50 ft albo 20 m), **Szerokość lewa** i **Szerokość prawa** (jak daleko każdy przekrój sięga od osi).
3. Aby wyciąć przekrój na konkretnym kilometrażu, wpisz go w **Dodaj kilometraż** (na przykład `2+35`) i naciśnij {{key:Enter}}.

Przekroje wycina się co każdą pełną wielokrotność odstępu, na obu końcach trasy, na początku i końcu każdego łuku (PC i PT) oraz na dodanych kilometrażach. Linie przekrojów pokazują się w planie jako szare linie w poprzek trasy; trafiają też do DXF, DWG i PDF na warstwie C-ROAD-SCTN. Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa.

## Widok przekroju

Otwórz go z {{ui:Widok przekroju}} we **Właściwościach** trasy, z {{ui:Przekroje}} pod {{ui:Powierzchnia}} › {{ui:Więcej}} albo klawiszem {{key:X}}. Zajmuje miejsce widoku profilu pod planem.

- Przechodź między przekrojami strzałkami na pasku, listą kilometraży albo klawiszami {{key:Left}} i {{key:Right}} przy fokusie na widoku przekroju ({{key:Home}} i {{key:End}} dla pierwszego i ostatniego).
- Szara linia to teren istniejący, czerwona to projekt. Wykop jest zacieniowany na pomarańczowo, nasyp na zielono. Punkty korytarza są oznaczone: CL (oś), EOP (krawędź jezdni), SH (pobocze) i DL (linia zrównania).
- Nagłówek podaje kilometraż, pola wykopu i nasypu tego przekroju oraz przewyższenie pionowe. {{ui:Dopasuj}} wypełnia panel; wybierz 1×, aby zobaczyć przekrój w skali rzeczywistej.
- Gruba linia w planie pokazuje, który przekrój jest na ekranie.
- **Powiększanie i przesuwanie:** kółko myszy powiększa wokół wskaźnika, a przeciąganie przesuwa widok. {{ui:Dopasuj}} (albo {{key:F}}, albo dwukrotne kliknięcie) dopasowuje cały przekrój ponownie.

## Pomiar w przekroju

1. Kliknij {{ui:Zmierz}} na pasku przekroju albo naciśnij {{key:M}}. Podpowiedź mówi: „Kliknij pierwszy punkt, potem drugi.”
2. Kliknij dwa punkty. Każdy przyciąga się do końca linii albo punktu korytarza (CL, EOP, SH, DL); przytrzymaj {{key:Alt}}, aby uzyskać punkt swobodny.
3. Odczyt podaje odległość poziomą (ΔH), pionową (ΔV), nachylenie w procentach z jego stosunkiem oraz długość prostą, w jednostkach projektu.

Kliknij ponownie, by zacząć nowy pomiar. {{key:Esc}} go czyści, a {{key:M}} wyłącza {{ui:Zmierz}}.

## Arkusze przekrojów

{{ui:Arkusze przekrojów (PDF)}} pod **Linie przekrojów** umieszcza każdy przekrój na stronach PDF, w rzędach od lewej do prawej i od góry do dołu, w kolejności kilometrażu. Wybierz **Papier**, **Skala planu** (skala pozioma przekrojów) oraz **Przewyższenie profilu** (1×, 2×, 5× lub 10×); okno dialogowe mówi, ile przekrojów mieści się na stronie i ile wyjdzie stron.

Każdy przekrój pokazuje siatkę z odsunięciami i rzędnymi, teren (przerywany), projekt, wykop i nasyp zacieniowane (pomarańczowo i na zielono), punkty korytarza, a pod nim kilometraż oraz pola wykopu i nasypu. Wszystkie przekroje na arkuszach mają ten sam rozmiar, dość wysoki, by zmieścić największy; gdy przy danym przewyższeniu nie mieści się na stronie, CivilCraft używa największego, który się mieści, i to zgłasza. Pasek tytułowy podaje nazwę trasy, kilometraże na tej stronie, skale oraz „Arkusz 1 z 3”.

## Do czego mierzy się wykop i nasyp

Korytarz może mieć warstwy pod nawierzchnią: warstwy nawierzchni, składniki szablonu, tor. Wybór **Objętości mierzone do** na pasku przekroju decyduje, do czego sięgają wykop i nasyp:

- **Powierzchnia dolna** (domyślnie): do dołu tych składników, więc wykop obejmuje głębokość konstrukcji nawierzchni.
- **Powierzchnia górna**: tylko do góry projektu, jak wcześniej, gdy składniki nie były liczone.

Pola w nagłówku, objętości poniżej, CSV i diagram mas podążają za tym wyborem, a on jest zapisywany z projektem.

## Objętości metodą średnich pól przekrojów

Między dwoma sąsiednimi przekrojami objętość to średnia ich dwóch pól pomnożona przez odległość między kilometrażami. Pasek pokazuje sumy dla trasy, a {{ui:CSV}} pobiera pola i objętości każdego przekroju wraz z sumami narastającymi (cu yd dla projektów w stopach, m³ dla metrycznych).

**Właściwości** pokazują te same sumy obok objętości metodą siatki z [Objętości robót ziemnych](topic:volumes). Oba to różne przybliżenia: bliższe przekroje zbliżają je do siebie, a na prostym odcinku drogi na płaskim terenie są takie same.

:::note
Wykop i nasyp liczy się tylko w obrębie wyrównanych obszarów (linii zrównania korytarza albo placu), tak jak robi to metoda siatki. Bez korytarza lub placu projekt jest terenem, więc przekrój nie pokazuje wykopu ani nasypu.
:::

## Diagram mas

**Diagram mas** pod **Linie przekrojów** rysuje diagram mas z tych samych objętości metodą średnich pól: wzdłuż kilometrażu, bieżącą sumę wykopu minus nasyp.

- **Skurczenie (−) lub pęcznienie (+) wykopu** mówi, ile metra sześciennego wykopu daje po ułożeniu jako nasyp: −10 % (wartość startowa, zastępcza) oznacza, że kurczy się do 0.9; grunt, który pęcznieje, może mieć +5 %. Użyj wartości z raportu geotechnicznego.
- Tam, gdzie linia rośnie, droga jest w wykopie; tam, gdzie opada, w nasypie. Powyżej zera (zacieniowane na pomarańczowo) ziemia przesuwa się w stronę wyższego kilometrażu; poniżej zera (zielone) w stronę niższego.
- **Punkty bilansowe** to miejsca, w których linia przecina zero: między dwoma z nich wykop i nasyp się równoważą. Tabela wylicza każdy zrównoważony odcinek, przesuniętą objętość (jego najwyższy lub najniższy punkt) i średnią odległość transportu (zacieniowane pole podzielone przez tę objętość).
- Tam, gdzie linia kończy się poza zerem, pozostałość to **odpad** (waste, powyżej) albo **dowóz** (borrow, poniżej). Na tym ostatnim odcinku liczy się tylko ziemia ponad poziomem, na którym się kończy.

**CSV** zapisuje rzędną diagramu mas w każdym przekroju, odcinki i współczynnik.
