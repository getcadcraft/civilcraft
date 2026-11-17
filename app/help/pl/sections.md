---
title: Linie przekrojów i przekroje poprzeczne
summary: Wytnij przekroje prostopadle do osi trasy, zobacz teren, projekt oraz wykop i nasyp na każdym kilometrażu, i uzyskaj objętości metodą średnich pól przekrojów.
keywords: wykres mas, diagram mas, punkt bilansowy, skurcz, rozpulchnienie, odległość transportu, dowóz, odwóz, arkusze przekrojów, arkusze przekrojów poprzecznych, pdf przekrojów, przekroje, przekroje poprzeczne, linie przekrojów, widok przekroju, wykop, nasyp, pola, średnie pole przekroju, objętości metodą pól przekrojów, roboty ziemne, kilometraż, odsunięcie, csv
from: 5060173c
---

Przekrój poprzeczny pokazuje drogę tak, jak zostanie zbudowana: w poprzek osi trasy na jednym kilometrażu, istniejący teren, projekt (korytarz lub plac wkomponowany w teren) oraz wykop i nasyp między nimi.

## Dodaj linie przekrojów

1. Zaznacz oś trasy. We **Właściwościach**, w sekcji **Linie przekrojów**, kliknij {{ui:Add sample lines}}.
2. Ustaw **Co** (odstęp: 50 ft lub 20 m na początek), **Szerokość lewą** i **Szerokość prawą** (jak daleko każdy przekrój sięga od osi).
3. Aby wyciąć przekrój na konkretnym kilometrażu, wpisz go w **Dodaj kilometraż** (na przykład `2+35`) i naciśnij {{key:Enter}}.

Przekroje są wycinane co każdą pełną wielokrotność odstępu, na obu końcach osi trasy, na początku i końcu każdego łuku (PC i PT) oraz na kilometrażach, które dodasz. Linie przekrojów pokazują się na planie jako szare linie w poprzek osi; trafiają też do DXF, DWG i PDF na warstwie C-ROAD-SCTN. Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa.

## Widok przekroju

Otwórz go przez {{ui:Section view}} we **Właściwościach** osi trasy, przez {{ui:Sections}} w **Powierzchnia** › {{ui:More}} lub przez {{key:X}}. Zajmuje miejsce widoku profilu pod planem.

- Przechodź między przekrojami strzałkami na jego pasku, listą kilometraży lub klawiszami {{key:Left}} i {{key:Right}}, gdy widok przekroju ma fokus ({{key:Home}} i {{key:End}} dla pierwszego i ostatniego).
- Szara linia to istniejący teren, czerwona linia to projekt. Wykop jest zacieniowany na pomarańczowo, nasyp na zielono. Punkty korytarza są oznaczone: CL (oś), EOP (krawędź jezdni), SH (pobocze) i DL (linia przecięcia z terenem).
- Nagłówek podaje kilometraż, pola wykopu i nasypu tego przekroju oraz przewyższenie pionowe. **Dopasuj** wypełnia panel; wybierz 1× , aby zobaczyć przekrój w rzeczywistej skali.
- Gruba linia na planie pokazuje, który przekrój jest na ekranie.

## Arkusze przekrojów

{{ui:Section sheets (PDF)}} w sekcji **Linie przekrojów** umieszcza każdy przekrój na stronach PDF, w rzędach od lewej do prawej i od góry do dołu, w kolejności kilometrażu. Wybierz **Papier**, **Skalę planu** (poziomą skalę przekrojów) oraz **Przewyższenie profilu** (1×, 2×, 5× lub 10×); okno dialogowe mówi, ile przekrojów mieści się na stronie i ile stron to daje.

Każdy przekrój pokazuje siatkę z odsunięciami i rzędnymi, teren (przerywany), projekt, wykop i nasyp zacieniowane (pomarańczowo i zielono), punkty korytarza oraz pod nim kilometraż i pola wykopu i nasypu. Każdy przekrój na arkuszach ma ten sam rozmiar, dość wysoki dla największego; gdy przy danym przewyższeniu nie mieści się na stronie, CivilCraft używa największego, który się mieści, i to mówi. Pasek tytułowy podaje oś trasy, kilometraże na tej stronie, skale oraz „Arkusz 1 z 3”.

## Objętości metodą średnich pól przekrojów

Między dwoma sąsiednimi przekrojami objętość to średnia ich dwóch pól pomnożona przez odległość między kilometrażami. Pasek pokazuje sumy dla osi trasy, a {{ui:CSV}} pobiera pola i objętości każdego przekroju wraz z sumami narastającymi (jardy sześcienne w projektach w stopach, metry sześcienne w metrycznych).

**Właściwości** pokazują te same sumy obok objętości metodą siatki z [Objętości robót ziemnych](topic:volumes). Są to dwa różne przybliżenia: bliższe przekroje zbliżają je do siebie, a na prostym odcinku drogi na płaskim terenie są takie same.

:::note
Wykop i nasyp liczą się tylko wewnątrz obszarów wyrównanych (linii przecięcia z terenem korytarza lub placu), tak jak w metodzie siatki. Bez korytarza lub placu projekt to teren, więc przekrój nie pokazuje wykopu ani nasypu.
:::

## Wykres mas

**Wykres mas** w sekcji **Linie przekrojów** rysuje diagram mas z tych samych objętości metodą pól przekrojów: wzdłuż kilometraży, narastającą sumę wykopu minus nasypu.

- **Skurcz (−) lub rozpulchnienie (+) wykopu** określa, ile metrów sześciennych wykopu daje po ułożeniu jako nasyp: −10 % (wartość startowa, zastępcza) oznacza skurcz do 0,9; skała, która się rozpulchnia, może mieć +5 %. Użyj wartości z raportu geotechnicznego.
- Tam, gdzie linia rośnie, droga jest w wykopie; tam, gdzie opada, w nasypie. Powyżej zera (zacieniowane na pomarańczowo) ziemia przemieszcza się w górę kilometrażu; poniżej zera (zielone), w dół kilometrażu.
- **Punkty bilansowe** to miejsca, w których linia przecina zero: między dwoma z nich wykop i nasyp się równoważą. Tabela wypisuje każdy zrównoważony odcinek, przemieszczoną objętość (jego najwyższy lub najniższy punkt) oraz średnią odległość transportu (zacieniowane pole podzielone przez tę objętość).
- Tam, gdzie linia kończy się poza zerem, pozostałość to **odpad** (powyżej) lub **dowóz** (poniżej). Na tym ostatnim odcinku liczy się tylko ziemia powyżej poziomu, na którym się kończy.

**CSV** zapisuje rzędną masy na każdym przekroju, odcinki oraz współczynnik.
