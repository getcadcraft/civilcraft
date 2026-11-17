---
title: Zaprojektuj ogród od początku do końca
summary: Dziesięć kroków pracy architekta krajobrazu, od pomiaru do opublikowanego zestawu, z tym, co obszar roboczy Krajobraz robi dziś dla każdego z nich i czego jeszcze nie robi.
keywords: samouczek, instrukcja, jak zrobić, projektowanie krajobrazu, projektowanie ogrodu, pierwsze kroki, przykład, próbka, krok po kroku, pomiar, linie, teren, nasadzenia, zestawienie, arkusze, publikacja, jeden projekt
from: 87900bf5
---

Projekt krajobrazu zatacza koło: pomiar, szkic, linie, teren, obszary, rzędne, nasadzenia, zestawienia, arkusze i znów od początku. Oto dziesięć kroków i to, co istnieje dla każdego z nich. Tam, gdzie krok ma lukę, jest ona wskazana w **Jeszcze nie zbudowano** na końcu, a nie ukryta w kroku.

Możesz iść za przykładową działką albo własnym rysunkiem pomiarowym. Przy własnym zacznij od kroku 1.

## 1. Wczytaj pomiar

{{ui:Powierzchnia}} › {{ui:Linie z rysunku…}}, wybierz rysunek pomiarowy (DWG 2000–2018 lub DXF). Sprawdź jednostki, weź warstwice, polilinie 3D i granicę na potrzeby powierzchni oraz bloki punktów jako punkty pomiarowe. Sekcja **Rzędne pomiaru i sprawdzenie** odczytuje rzędne zapisane jako tekst lub atrybut i wypisuje, co wygląda źle (jednostki, układ współrzędnych, odległość od zera, płaskie warstwice, dziwne rzędne, podwojone punkty), zanim cokolwiek dodasz. Zobacz [Sprawdzanie rysunku pomiarowego przy imporcie](topic:survey-check) oraz [Otwieranie DWG lub DXF jako linii](topic:open-dwg-dxf). Ustaw układ współrzędnych przyciskiem {{ui:Układ współrzędnych…}}.

## 2. Ręczne szkice

Arkusz na papierze, na przykład stary pomiar lub zaznaczony wydruk, wczytuje się przez {{ui:Skanuj…}} (Zacznij od skanu): zostaje umieszczony w skali lub na znanych współrzędnych pod planem i może zostać obrysowany jako linie. ModelCraft odczytuje zdjęcie ręcznego szkicu (Plik › Importuj zdjęcie szkicu…). Sam CivilCraft nie ma narzędzia do ręcznych szkiców: umieść arkusz pod planem i narysuj nad nim.

## 3. Od szkicu do linii

Rysuj linie charakterystyczne i zarysy nad pomiarem w CivilCraft albo w rysunku 2D. Krajobraz › Więcej › {{ui:Z linii}} zamienia linię w nawierzchnię, obszar roślinny, mur, schody, linię charakterystyczną i więcej, z zachowanym powiązaniem: przesuniesz linię, a obiekt podąży za nią. Zobacz [Obiekty z linii](topic:objects-from-lines). W SuperCad Studio otwórz teren, rysunek i model budynku w jednym projekcie: obszar roboczy **Krajobraz** ma narzędzia wszystkich trzech, a linia wybrana w rysunku 2D może stać się obiektem krajobrazu, który za nią podąża (Ctrl+K, {{ui:Obiekt krajobrazu z wybranej linii rysunku}}).

## 4. Projektowany teren

Otwórz {{ui:Powierzchnia}} › {{ui:Więcej}} › {{ui:Obszar roboczy Krajobraz}}. Zbuduj projektowany teren za pomocą {{ui:Platforma}}, {{ui:Wał ziemny}}, {{ui:Rów chłonny}} oraz obszarów niwelacji z rzędnymi punktowymi i warstwicami; nawierzchnie, ścieżki, mury, rampy i schody, które dodasz, są wyrównane do tej samej projektowanej powierzchni. Istniejący teren nigdy się nie zmienia. {{ui:Rzędne}} › {{ui:Modyfikatory terenu…}} wymienia wszystko, co kształtuje teren, w jednej kolejności, z wykopem i nasypem dla każdego. Zobacz [Niwelację](topic:landscape-grading) i [Modyfikatory terenu i żywe rzędne](topic:ground-modifiers).

## 5. Nawierzchnie i obszary roślinne

{{ui:Nawierzchnie utwardzone}} › {{ui:Nawierzchnia}}, {{ui:Ścieżka}}, {{ui:Mur}}, {{ui:Krawężnik}}, {{ui:Rampa}} i {{ui:Schody}}. {{ui:Obszary}} rysuje trawnik, rabatę, łąkę lub okrywę z jej zabudową; sam przycina się wokół nawierzchni, murów i schodów. {{ui:Rabata}} wypełnia obszar w rozstawie roślin, z mieszanki roślin. Zobacz [Nawierzchnie utwardzone](topic:hardscape), [Obszary roślinne](topic:planted-areas) i [Nasadzenia](topic:planting).

## 6. Rzędne, spadki i połączenia

W sekcji **Sprawdzenia niwelacji** zaznacz **Analizę spadków** i **Strzałki spływu i zastoiny wody**. Jeśli woda zbiera się przy tarasie, dodaj wokół niego {{ui:Rów chłonny}}. Właściwości podają, ile podstopni potrzebują schody i czy się mieszczą oraz gdzie ścieżka jest stromsza od swojego limitu. Panel Problemy wypisuje miejsca, w których obiekty źle się łączą: mur zbyt wysoki, rabata powyżej nawierzchni, schody, które nie trafiają w spocznik. {{ui:Rzędna punktowa}} i {{ui:Strzałka spadku}} opisują teren i same się aktualizują.

## 7. Nasadzenia

W sekcji **Rośliny** przeszukaj listę roślin (kilkaset gatunków albo własna lista), wybierz jedną i użyj {{ui:Roślina}}, {{ui:Rabata}} lub {{ui:Żywopłot}}. Rozmiar i etykiety rośliny ustawiasz w menu Więcej. Więcej › {{ui:Tabela roślin}} edytuje Twoje własne rekordy: odmiany uprawne, dostarczane rozmiary, zagęszczenie, uwagi do specyfikacji. Każdy rekord może mieć własny symbol i model 3D (OBJ, STL lub GLB), a Więcej › {{ui:Grafika roślin}} rysuje rośliny prościej przy większych skalach. Zobacz [Listę roślin](topic:plant-list), [Rekordy roślin](topic:plant-records) i [Grafikę roślin](topic:plant-graphics).

## 8. Ilości i zestawienia

Więcej › {{ui:Zestawienia}}: zestawienia roślin i nawierzchni oraz Twoje własne pozostają powiązane z obiektami; zapisz je jako CSV lub XLSX albo umieść na arkuszach (zobacz [Zestawienia](topic:worksheets)). Więcej › {{ui:Zestawienie roślin…}} przekazuje liczby do TakeoffCraft. Ilości nawierzchni są we Właściwościach nawierzchni, murów i schodów. Nawadnianie ma własne zestawienie materiałów: {{ui:Nawadnianie}} › **Sprawdź system…**. Zobacz [Nawadnianie](topic:irrigation).

## 9. Rysunki i arkusze

Więcej › {{ui:Arkusze krajobrazowe…}}: plany nasadzeń, niwelacji i nawadniania wraz z detalami. {{ui:Rzędne}} › {{ui:Linia przekroju}} rysuje przekroje przez teren, ściany, zabudowy, schody i rośliny. Zobacz [Arkusze krajobrazowe](topic:landscape-sheets) oraz [Przekroje i zestaw publikacji](topic:landscape-sections).

## 10. Publikacja

{{ui:Zestaw publikacji (.zip)}} w oknie dialogowym arkuszy tworzy jeden PDF z listą arkuszy i DWG na każdy arkusz. Więcej › {{ui:Eksportuj IFC krajobrazu}} przekazuje BimCraft rośliny i nawierzchnie. Zapisz projekt: wszystko jest w jednym pliku.

## Zmiana jednej rzeczy: schody

Sens trzymania wszystkiego w jednym projekcie jest taki, że zmiana przechodzi przez cały projekt. Wypróbuj to na biegu schodów między dwoma tarasami:

1. Narysuj linię biegu jako linię charakterystyczną (albo linię w rysunku), a potem Krajobraz › Więcej › {{ui:Z linii}} › {{ui:Schody}}. We Właściwościach schodów zaznacz **Kształtuje teren** i ustaw poziomy dolny i górny na dwa tarasy.
2. Narysuj obszar roślinny obok i pod biegiem za pomocą {{ui:Obszary}} oraz nawierzchnię na tarasach. Rabata przycina się wokół schodów i nawierzchni, a zestawienie roślin liczy tylko to, co jest posadzone.
3. Podnieś górny poziom biegu we Właściwościach. Projektowany teren, rzędne punktowe, strzałki spadku oraz wykop i nasyp zmienią się od razu. Jeśli bieg przestanie łączyć się z górnym tarasem, panel Problemy powie, o ile.
4. Przesuń linię biegu. Schody podążą za swoją linią w tym samym kroku cofania; rabata przytnie się ponownie i zostanie policzona na nowo, a zestawienia i tabele pokażą nowe liczby.
5. Naciśnij jeden raz Ctrl+Z: linia, schody, teren i rabata cofną się razem.

Zobacz [Modyfikatory terenu i żywe rzędne](topic:ground-modifiers), [Obszary roślinne](topic:planted-areas) i [Zestawienia](topic:worksheets).

## Jeszcze nie zbudowano

To jest żądane i nie ma tego w tej wersji:

- Ściany, które kształtują teren (zgłaszają, gdzie się z nim spotykają, a ich wierzch może za nim podążać).
- Edycja własnej listy roślin z biblioteki w aplikacji (edytuj listę projektu i zapisz ją jako plik roślin).
- Tekstury i kolory własnych modeli roślin GLB (kształt jest odczytywany; używany jest kolor rośliny).

Zobacz [Obszar roboczy Krajobraz](topic:landscape), by poznać każde narzędzie.
