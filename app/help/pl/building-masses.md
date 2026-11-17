---
title: Rysowanie brył zabudowy na terenie
summary: Narysuj bryłę zabudowy na działce, nadaj jej kondygnacje i wysokość kondygnacji, zobacz jej powierzchnię brutto, wybierz, jak stoi na pochyłym terenie, pchaj i ciągnij jej wysokość w 3D i wyślij ją do BimCraft albo zapisz jako plik IFC.
keywords: bryła, masowanie, bryła zabudowy, objętość, obrys, kondygnacje, wysokość kondygnacji, powierzchnia brutto, GFA, spadek, podium, wykop i nasyp, pchnij i ciągnij, 3D, badanie terenu, wczesny projekt, IFC, opracuj, BimCraft, A-MASS
from: e5a67c16
---

Bryła zabudowy to obrys, liczba kondygnacji i wysokość kondygnacji: wczesne pytanie „ile zabudowy się tu zmieści i co to zrobi z terenem”. Bryły leżą w planie z nazwą, liczbą kondygnacji i powierzchnią brutto, trafiają do wydruku PDF oraz do eksportów DWG i DXF na warstwach `A-MASS` i `A-MASS-TEXT`, i są zapisywane w pliku projektu.

## Narysuj bryłę

1. We **Właściwościach**, pod **Bryły zabudowy**, kliknij **Narysuj bryłę**. (Jest też w menu **Więcej** na pasku narzędzi, obok **Powierzchnia**.)
2. Wskazuj narożniki obrysu. Kliknięcie blisko narożnika działki albo punktu pomiarowego przejmuje dokładne położenie tego punktu.
3. Kliknij pierwszy narożnik ponownie albo naciśnij {{key:Enter}}, aby zakończyć. {{key:Backspace}} cofa ostatni narożnik; {{key:Esc}} przerywa.

Nowa bryła ma trzy kondygnacje i wysokość kondygnacji 12 ft (3.6 m) oraz należy do działki, w której leży jej środek.

## Kondygnacje, wysokość i powierzchnia

Kliknij bryłę, aby zmienić jej **Nazwę**, **Przeznaczenie**, **Kondygnacje**, **Wysokość kondygnacji** i **Działkę**. **Wysokość** to kondygnacje razy wysokość kondygnacji: wpisz wysokość, a liczba kondygnacji stanie się najbliższą liczbą całkowitą (nigdy mniej niż jedna). **Obrys** i **Powierzchnia brutto** (obrys razy kondygnacje) są obliczane za Ciebie.

## Na pochyłym terenie

Grunt pod bryłą jest odczytywany z powierzchni: istniejący grunt albo niwelowany grunt, gdy wybrano **Projektowany grunt (niwelowany)**. **Na pochyłym terenie** mówi, gdzie leży parter:

- **Schodkowo**: na średnim gruncie pod obrysem. Niska strona jest zasypywana do tego poziomu, wysoka odcinana, a obie prawie się równoważą.
- **Podium**: na najwyższym gruncie. Pełna podstawa wypełnia niską stronę.
- **Wykop**: na najniższym gruncie. Wysoka strona jest wycinana w zbocze.

Właściwości pokazują zakres gruntu pod bryłą, **Poziom parteru** oraz objętość nasypu i wykopu między gruntem a tym poziomem. Punkt obrysu leżący poza powierzchnią jest pomijany, a Właściwości mówią, ile ich jest.

## W widoku 3D

Bryły są rysowane w widoku 3D terenu, z linią wokół każdej kondygnacji i ich nazwami nad dachem. **Pokaż** ma pole wyboru dla **Bryły zabudowy**. Kliknij bryłę, aby ją zaznaczyć. Gdy bryła jest zaznaczona:

- przeciągnij jej dach w górę lub w dół, aby pchnąć albo pociągnąć ją o jedną kondygnację naraz, albo naciśnij {{key:PageUp}} i {{key:PageDown}};
- całe przesunięcie to jeden krok cofnięcia.

Widok uliczny **Jazda** też widzi bryły, a **Słońce** rzuca ich cienie na grunt.

## Wyślij dalej

- **Bryły jako IFC** zapisuje każdą bryłę jako plik IFC4: teren, budynek z kondygnacjami i bryłę jako element budynku z jej wartościami w zestawie właściwości `CadCraft_SiteMass`. Gdy w projekcie ustawiono układ współrzędnych, plik jest umieszczony na mapie i zawiera szerokość i długość geograficzną terenu; bez niego nic nie mówi o tym, gdzie się znajduje.
- **Opracuj w BimCraft** otwiera BimCraft w nowej karcie z bryłami. Tam wybór bryły pokazuje jej wartości i przycisk **Opracuj tę bryłę**, który buduje ściany na każdej kondygnacji i podłogę pod budynkiem z obrysu, w jednym kroku cofnięcia. Nic nie jest przesyłane: plik przechodzi między dwiema kartami tej przeglądarki.

Zobacz też **Ograniczenia strefowania** i **Godziny nasłonecznienia**.
