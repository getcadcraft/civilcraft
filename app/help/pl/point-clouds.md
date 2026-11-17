---
title: Chmury punktów z drona lub skanera
summary: Dzięki dodatkowi Chmury punktów otwórz plik LAS lub LAZ z milionami punktów, obejrzyj go w całości, oczyść, posortuj na teren, roślinność i budynki oraz zbuduj z niego teren, warstwice i objętości.
keywords: chmura punktów, las, laz, dron, fotogrametria, recap, lidar, skan, teren, klasyfikacja, szum, hałda, objętość, wykop i nasyp, warstwice, linia załamania, eye-dome, ortomozaika, orto, nałożenie, warstwa mapy, eksport las, eksport laz, kompresja
from: e4a4901f
---

Większość osób nigdy tego nie potrzebuje, dlatego jest to dodatek. Włącz {{ui:Chmury punktów}} w Ustawienia › Dodatki; w prawym panelu pojawi się karta {{ui:Chmury punktów}}. Plik jest odczytywany w przeglądarce i dzielony na kafle, które są przechowywane we własnej pamięci przeglądarki (lub w wybranym przez Ciebie folderze). **Nic nie jest przesyłane.**

:::warning
Wszystko, co pokazuje ta karta, to liczba wyliczona z Twoich danych, a nie certyfikat. Sprawdzono to na wymyślonym terenie, a jeszcze nie na prawdziwym przelocie drona: pierwsze wyniki czytaj ostrożnie i daj nam znać, co znajdziesz. O tym, ile warte są teren, warstwice i objętości, decyduje uprawniony inżynier.
:::

## Otwórz chmurę

W sekcji {{ui:Otwórz chmurę}} wybierz plik LAS lub LAZ. Karta podaje, ile punktów zawiera, jego układ współrzędnych i jednostki oraz ile miejsca potrzebuje budowa; naciśnij {{ui:Zbuduj chmurę}}. Budowę można zatrzymać i wznowić przyciskiem {{ui:Wznów}} (wybierz ponownie ten sam plik). Plik nigdy nie jest zmieniany. Plik ze 100 milionami punktów buduje się w ciągu kilku minut na stacji roboczej i potrzebuje tyle miejsca, ile sam plik.

W sekcji {{ui:Chmury na tym komputerze}} otwierasz lub usuwasz chmurę. {{ui:Zachowaj chmury w folderze…}} (Chrome, Edge i aplikacja Studio) zapisuje kafle w wybranym przez Ciebie folderze, na przykład w folderze chmur CadCraft w Dokumentach, dzięki czemu chmura o rozmiarze 10 GB nie musi mieścić się w pamięci przeglądarki; chmury zbudowane wcześniej zostają tam, gdzie zostały zbudowane. Po ponownym uruchomieniu przeglądarka ponownie prosi o zgodę: naciśnij {{ui:Użyj ponownie folderu …}}.

## Obejrzyj ją

{{ui:Obejrzyj w 3D}} rysuje chmurę z grubych kafli i zwiększa szczegółowość, gdy się zbliżasz, nigdy jednak nie więcej niż {{ui:Najwięcej rysowanych punktów}} naraz (2,5 miliona; 500 tysięcy na telefonie). Kolorowanie wg koloru z pliku, wysokości, klasy, intensywności lub {{ui:Odchyłki}}. {{ui:Oświetlenie eye-dome}} cieniuje krawędzie według głębi, dzięki czemu kształt jest czytelny bez wektorów normalnych (wyłączone na telefonie); {{ui:Punkty maleją z odległością}} sprawia, że dalekie punkty są mniejsze, a bliskie większe; {{ui:Rozmiar punktu}} ustawia wielkość. Plan pokazuje chmurę jako raster pod rysunkiem i **zwiększa szczegółowość po przybliżeniu** do jej fragmentu.

## Oczyść ją

W sekcji {{ui:Oczyść}} narysuj w planie lasso, prostokąt lub wielokąt (albo w 3D z widoku z góry: w 3D obrys jest rzutowany pionowo, więc jest dokładny tylko z góry). Karta pokazuje, ile punktów znajduje się wewnątrz, **zanim** zastosujesz: {{ui:Usuń te punkty}}, {{ui:Zmień ich klasę}}, {{ui:Przywróć usunięte punkty}} lub {{ui:Przytnij do tej granicy}}. {{ui:Cofnij}} i {{ui:Ponów}} przechodzą przez dziennik edycji; sam plik nigdy nie jest zmieniany. {{ui:Filtr szumów…}} oznacza błądzące punkty jako niskie (klasa 7) lub wysoki szum (klasa 18).

## Posortuj ją

{{ui:Znajdź teren}} działa kafel po kaflu i oznacza punkty terenu (klasa 2) oraz niskie; tolerancja wynosi 0,15 m, lub 0,08 m przy włączonym przełączniku klasy geodezyjnej. Zgłasza łączenia kafli, które się nie zgadzają. {{ui:Klasyfikuj roślinność i budynki}} następnie oznacza niską, średnią i wysoką roślinność oraz budynki na podstawie wysokości nad terenem i tego, jak płaskie jest otoczenie. Nie ma uczenia maszynowego, więc płaskodachowa wiata pod drzewami może zostać oznaczona błędnie: sprawdź.

## Teren, warstwice, linie załamania

{{ui:Zbuduj teren}} tworzy istniejący teren z punktów terenu i dodaje go do projektu tak samo jak import LAS (jeden krok cofnięcia). Następnie porównuje z nim punkty: średnią, RMS, 95. percentyl, udział w tolerancji oraz dziesięć miejsc, które różnią się najbardziej, każde z przyciskiem {{ui:Przejdź tam}}. Kolorowanie {{ui:Odchyłka}} pokazuje, gdzie teren i chmura się nie zgadzają.

**Linia załamania** (krawężnik, rów lub krawędź skarpy) jest wskazywana na chmurze: {{ui:Wskaż linię załamania na chmurze}} w widoku 3D pobiera najbliższy rysowany punkt przy każdym kliknięciu, a {{ui:Wskaż linię załamania na planie}} pobiera najbliższy punkt chmury (najpierw teren) pod każdym kliknięciem; podwójne kliknięcie lub Enter kończy linię. Następne {{ui:Zbuduj teren}} z niej korzysta. {{ui:Pokaż warstwice}} rysuje warstwice nad chmurą na małym obrazku i ustawia interwał projektu.

## Objętości

{{ui:Objętość hałdy…}} oblicza objętość powierzchni ponad podstawą w obrębie granicy, którą narysujesz. Narysuj granicę na płaskim terenie wokół hałdy i wybierz podstawę: najniższy punkt granicy, płaszczyznę, gładką podstawę krzywoliniową, powierzchnię przechodzącą przez granicę lub poziom, który wpiszesz. Na pochyłym lub zakrzywionym terenie użyj płaszczyzny lub podstawy krzywoliniowej; najniższy punkt daje zbyt wysoki wynik. Punkty granicy wystające ponad resztę (drzewo na linii) są pomijane przy wyznaczaniu podstawy. {{ui:Między przelotami}} podaje wykop i nasyp między dwiema chmurami. Oba wyniki można zapisać jako CSV.

## Ortomozaika

W sekcji {{ui:Ortomozaika (obraz z góry)}} wybierz ortomozaikę drona razem z jej plikiem georeferencji i plikiem `.prj`, jeśli je ma: GeoTIFF albo PNG lub JPEG. Staje się ona **warstwą mapy** projektu, więc plan pokazuje ją pod rysunkiem, a widok 3D (kolor {{ui:Mapa}}) nanosi ją na zbudowany teren, dlatego najpierw użyj {{ui:Zbuduj teren}}. Karta podaje, jaką część chmury obraz pokrywa, i ostrzega, gdy nie pokrywa jej wcale: zwykłą przyczyną jest inny układ współrzędnych, więc podaj razem z nim plik `.prj`. Gdy nie ma pliku `.prj`, program pyta, gdzie są współrzędne. Obraz jest przechowywany w pliku projektu; GeoTIFF większy niż 200 MB jest odrzucany, a bardzo duża mozaika jest zmniejszana do 16 megapikseli, więc przy dużym przelocie najpierw przytnij mozaikę do terenu.

## Eksport

{{ui:Eksport}} zapisuje oczyszczoną, sklasyfikowaną chmurę jako nowy plik (wszystkie punkty, wybrane klasy lub tylko teren). W sekcji {{ui:Typ pliku}} wybierz:

- **LAS 1.4 (bez kompresji)**: format punktu 6 lub 7 z kolorem.
- **LAZ (skompresowany)**: te same punkty skompresowane bezstratnie, więc każdy punkt wraca dokładnie taki sam. Zapisywany jest jako format punktu 0 lub 2 z kolorem, w pliku LAS 1.4. Na wymyślonym terenie 300 m plik LAZ miał około jednej piątej rozmiaru pliku LAS 1.4. Formaty LAZ 0 i 2 obejmują tylko klasy od 0 do 31: punkt o wyższej klasie jest odrzucany z komunikatem, więc taką chmurę wyeksportuj jako LAS 1.4.

LAZ zapisuje własny kompresor CadCraft, zbudowany na podstawie opublikowanej specyfikacji LAZ. Sprawdziliśmy, że nasz własny czytnik oraz dwa niezależne czytniki LAZ (laz-perf, którego aplikacja używa do otwierania plików LAZ, oraz laspy z lazrs) odczytują każdy punkt dokładnie, a pliki LAZ zapisane przez laspy wychodzą bajt w bajt takie same, gdy ponownie zapiszemy ich punkty. Inne programy nie były jeszcze testowane, więc jeśli któryś nie otworzy pliku, napisz nam, który.

Gdy przeglądarka potrafi zapisywać plik na bieżąco, najpierw wybierasz plik, a bardzo duża chmura jest zapisywana do niego kafel po kaflu zamiast gromadzenia w pamięci; w przeciwnym razie plik jest zbierany i pobierany, co jest w porządku do kilkuset megabajtów.

## Czego nie robi

Odczytuje tylko LAS i LAZ (E57, PLY i PCD nie są jeszcze podłączone do tej karty, a kilka plików z jednego przelotu nie jest łączonych), nie przelicza układu chmury (zakładany jest układ projektu i metry), nie odczytuje plików RCP ani RCS firmy Autodesk, nie tworzy powierzchni ze zdjęć i nie znajduje samodzielnie słupów, krawężników ani rur.
