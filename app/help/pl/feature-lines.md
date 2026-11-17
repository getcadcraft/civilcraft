---
title: Linie charakterystyczne
summary: Rysuj linie 3D, które niwelujesz wierzchołek po wierzchołku, twórz z nich odsunięcia schodkowe i używaj ich jako linii przełamania terenu albo jako placów ze spadkiem w projekcie.
keywords: łuk, krzywa, promień, łuk 3d, helisa, zakrzywiony krawężnik, nakładka spadków, nakładka rzędnych, strzałki spadku, linia charakterystyczna, spadek, rzędna, nachylenie, odsunięcie schodkowe, odsunięcie, linia przełamania, krawężnik, rów, nasyp, plac ze spadkiem, daylight, niwelacja, polilinia 3d
from: d55b25fb
---

Linia charakterystyczna to linia z rzędną w każdym wierzchołku: krawężnik, linia spływu rowu, korona nasypu, krawędź placu ze spadkiem. Rzędne ustawiasz liczbą albo spadkiem, kopiujesz ją w bok ze skokiem w górę lub w dół i wybierasz, co powierzchnie z nią robią.

## Narysuj jedną

1. Wybierz **Powierzchnia** › {{ui:Więcej}} › {{ui:Linia charakterystyczna}} albo naciśnij {{key:L}}.
2. Kliknij jej wierzchołki na rzucie. Kliknięcie na punkt pomiarowy przejmuje jego położenie i rzędną; w innym miejscu wierzchołek przejmuje rzędną istniejącego terenu w tym miejscu.
3. Naciśnij {{key:Enter}}, aby zakończyć otwartą linię, albo kliknij ponownie pierwszy wierzchołek, aby ją zamknąć.

Nowa linia jest zaznaczona i zaczyna jako linia przełamania istniejącego terenu, leżąca na gruncie.

## Łuki

Odcinek może być łukiem w rzucie, którego końce leżą na różnych rzędnych: zakończenie krawężnika, zakrzywiony rów, rampa, która skręca. Jego spadek biegnie równomiernie wzdłuż łuku, a jego długość jest mierzona wzdłuż krzywej.

- **Podczas rysowania:** naciśnij {{key:C}} (na ekranie dotykowym {{ui:Łuk}} na pasku nad rzutem), aby włączyć łuki. Po wierzchołku kliknij punkt na krzywej, a potem miejsce, w którym łuk się kończy. Naciśnij ponownie {{key:C}}, aby wrócić do odcinków prostych. {{key:Backspace}} najpierw usuwa punkt na krzywej.
- **Później:** w **Właściwościach** wpisz promień i kierunek skrętu w polu **Łuk** wierzchołka, na przykład `50 L` albo `50 R` (w lewo lub w prawo, idąc wzdłuż linii), i naciśnij {{key:Enter}}. Opróżnij pole, aby odcinek znów był prosty. Promień mniejszy niż połowa odcinka zostaje odrzucony.

Wybrana linia pokazuje promień każdego łuku obok jego spadku. **Długość** to długość wzdłuż łuków w rzucie; **Długość 3D** uwzględnia także wzniesienia i spadki. Odsunięcia schodkowe zachowują łuki: łuk na zewnętrznej stronie zakrętu rośnie, ten na wewnętrznej maleje, a odsunięcie za środek łuku jest odrzucane.

Powierzchnie, widok 3D oraz DXF i DWG traktują każdy łuk jako krótkie odcinki proste, które leżą w odległości do 0.01 od krzywej. LandXML zachowuje je jako łuki (zob. **Łuki w innych plikach** niżej).

## Ustawianie rzędnych i spadków

**Właściwości** wymieniają wierzchołki wraz z ich odległością wzdłuż linii, ich **Rzędną** i **Spadkiem do następnego** (w procentach). Wpisz jedno z nich i naciśnij {{key:Enter}}:

- Rzędna przesuwa tylko ten wierzchołek.
- Spadek ustawia rzędną na dalszym końcu swojego odcinka; wierzchołki za nim pozostają na miejscu, więc spadek następnego odcinka się zmienia.

Również w **Właściwościach**:

| Działanie | Co robi |
|---|---|
| **Podnieś lub obniż wszystkie o** | Dodaje wpisaną wysokość do każdego wierzchołka. |
| {{ui:Rzędne z terenu}} | Ustawia każdy wierzchołek z powrotem na istniejącym terenie (wierzchołki poza powierzchnią zachowują swoje rzędne i są wymienione). |
| {{ui:Jeden spadek, od pierwszego do ostatniego}} | Zachowuje pierwszą i ostatnią rzędną, a wierzchołki pomiędzy ustawia na jednym równym spadku. |

Wybrana linia pokazuje na rzucie swoje rzędne przy wierzchołkach i spadki wzdłuż odcinków. Przeciągnij wierzchołek narzędziem {{ui:Zaznacz}}, aby go przesunąć; jego rzędna pozostaje.

## Odsunięcia schodkowe

W sekcji **Odsunięcie schodkowe** wpisz **Odległość** (dodatnią w prawo od kierunku linii, ujemną w lewo), potem wysokość (o ile w górę lub w dół) albo spadek w procentach, i kliknij {{ui:Utwórz linię odsunięcia}}. Kopia jest nową linią charakterystyczną: na przykład tył krawężnika 0.5 ft w bok i 0.5 ft wyżej albo krawędź rowu 6 ft na zewnątrz przy 2 %. Odległość, która sklei kopię z samą sobą na ostrym zakręcie, zostaje odrzucona.

## Spadki i rzędne na ekranie

Naciśnij {{key:E}} albo zaznacz **Spadki i rzędne na liniach charakterystycznych** w sekcji **Wyświetlanie**, aby zobaczyć spadek każdej linii charakterystycznej wzdłuż każdego odcinka (z małą strzałką wskazującą w dół zbocza) i jej rzędną przy wierzchołkach. Są widoczne tylko na ekranie: nic nie jest dodawane do rysunku, a PDF, DXF i DWG pozostają bez zmian. Krótkie odcinki i zagęszczone wierzchołki pozostają bez etykiet, dopóki nie przybliżysz widoku. Wybrana linia zawsze pokazuje własne spadki i rzędne.

## W widoku profilu

Linia charakterystyczna przecinająca trasę pokazuje się w widoku profilu tej trasy, z nazwą i rzędną w miejscu przecięcia; linie biegnące obok mogą być też pokazane. Zob. [Projektowanie profilu podłużnego](topic:profile).

## Co robią z nią powierzchnie

Wybierz **Użycie**:

| Użycie | Co się dzieje |
|---|---|
| Linia przełamania istniejącego terenu | Istniejący teren przechodzi przez linię na jej rzędnych, jak narysowana linia przełamania. |
| Wyprofilowana w projekcie | **Zamknięta** linia staje się placem ze spadkiem: projektowana powierzchnia wewnątrz niej jest niwelowana do jej krawędzi. Włącz **Daylight do terenu**, aby poprowadzić skarpy wykopu i nasypu (poziomo do 1 pionowo) od jej krawędzi do terenu, tak jak robi to plac; każda skarpa zaczyna się tam na własnej rzędnej krawędzi. |
| Tylko narysowana | Pozostaje na rzucie i wychodzi w DXF, DWG i PDF (warstwa C-GRAD-FEAT, polilinie 3D), ale powierzchnie ją ignorują. |

Objętości, przekroje i widok 3D uwzględniają linie charakterystyczne wyprofilowane w projekcie, jak place. Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa.

## Udostępnianie linii zespołowi

W rysunku otwartym z plików w chmurze w CadCraft Studio, w planie zespołowym, sekcja **Właściwości** projektu (bez zaznaczenia) ma część **Zespół** z {{ui:Linie zespołu…}}: linie udostępnione przez zespół, każda z numerem wersji, bez wcześniejszego zaznaczania linii charakterystycznej. Zaznacz linię, aby ją udostępnić, wysłać nową wersję, pobrać wersję zespołu lub przestać udostępniać. Poza tym ustawieniem sekcja mówi, czego potrzebuje.

## Łuki w innych plikach

| Plik | Co dzieje się z linią charakterystyczną z łukami |
|---|---|
| Projekt CivilCraft | Zachowana dokładnie. |
| LandXML | Zapisywana jako element planu z liniami i łukami wraz z ich rzędnymi, a odczytywana z łukami. Linia charakterystyczna z innego programu trafia jako **Tylko narysowana**: wybierz jej **Użycie**, aby wstawić ją do powierzchni. |
| DWG i DXF | Polilinia 3D nie może przechować łuku, więc linia jest zapisywana jako krótkie odcinki w odległości do 0.01 od każdego łuku. CivilCraft zapisuje też w rysunku, które odcinki były łukami: gdy otwierasz rysunek jako linie, {{ui:Linie charakterystyczne}} przywraca linie jako linie charakterystyczne z ich łukami. Inne programy widzą zwykłą polilinię 3D. |
