---
title: Odczytaj warstwice, rzędne i spadki
summary: Ustaw interwał warstwic i warstwice główne, pokaż pasma rzędnych, strzałki spadków i trójkąty oraz odczytaj rzędne terenu pod kursorem.
keywords: warstwice, interwał warstwic, warstwice główne, opisy, pasma rzędnych, strzałki spadków, trójkąty, rzędna punktowa, analiza powierzchni, analiza rzędnych, analiza spadków
from: 585e500a
---

Powierzchnia jest pokazywana z warstwicami, gdy tylko istnieje. Wszystko w tym temacie ustawia się w sekcji **Wyświetlanie** w lewym panelu. Ustawienia wyświetlania zmieniają tylko to, co widzisz (i co eksportujesz); nie są krokami cofania.

## Ustaw interwał warstwic

1. W sekcji **Wyświetlanie** wybierz wartość w polu **Warstwice co**.
   - W stopach: 0.25, 0.5, 1, 2, 5, 10 lub 20 ft.
   - W metrach: 0.1, 0.25, 0.5, 1, 2, 5 lub 10 m.
2. Wybierz **Główne co**: co 2., 4., 5. lub 10. warstwicę.
   Warstwice główne są rysowane grubiej i opisywane swoją rzędną. Leżą na pełnych wielokrotnościach odstępu głównego (przy warstwicach co 1 ft i co 5. warstwicy głównej: 245, 250, 255 …).
3. Wyłącz {{ui:Contour labels}}, jeśli opisy zagęszczają się na małym wydruku.

Nowy projekt zaczyna się od interwału 1 jednostki, przy czym co 5. warstwica jest główna. Warstwice załamują się na liniach przełamania; jeśli przecinają prostopadle linię spływu lub grzbiet, ta linia nie jest jeszcze linią przełamania (zob. [Buduj i udoskonalaj powierzchnię](topic:build-surface)).

:::note
Warstwice są rysowane tylko wtedy, gdy między najniższym a najwyższym punktem jest nie więcej niż 2000 poziomów. Na terenie o dużym przewyższeniu i bardzo małym interwale plan nie pokaże żadnych warstwic: wybierz większy interwał.
:::

## Wygładź warstwice

Warstwice są prowadzone jako proste odcinki, po jednym na każdym trójkącie powierzchni, dlatego na każdej krawędzi trójkąta skręcają pod małym kątem. **Wygładzanie warstwic** w sekcji **Wyświetlanie** zaokrągla te narożniki:

- **Brak (proste odcinki)**: linie w swojej pierwotnej postaci. Tak wyglądają nowe lub starsze rysunki.
- **Lekkie**: narożniki lekko zaokrąglone. Linia nigdy nie przesuwa się o więcej niż 10% drogi w stronę następnej warstwicy i nigdy nie oddala się od swojego prostego odcinka o więcej niż jedną szóstą jego długości.
- **Mocne**: płynna krzywa. Linia nigdy nie przesuwa się o więcej niż 25% drogi w stronę następnej warstwicy i nigdy nie oddala się od swojego prostego odcinka o więcej niż jedną trzecią jego długości.

Przy obu wyborach wygładzona warstwica nadal przecina każdą krawędź trójkąta w tym samym punkcie co linia prowadzona, pozostaje wewnątrz trójkąta, który przecina dany odcinek, i dlatego nigdy nie przetnie ani nie dotknie innej warstwicy. Tam, gdzie warstwica przecina linię przełamania lub granicę, zachowuje ostry zakręt. Wygładzone linie są drukowane i eksportowane (DXF, DWG, PDF, GIS i 3D) i mają więcej wierzchołków niż linie prowadzone.

Wygładzanie zmienia tylko rysowane linie. Rzędne, objętości, profile i przekroje są nadal odczytywane z samej powierzchni. Warstwica przechodząca dokładnie przez punkty pomiarowe (punkt o rzędnej 250.00 na warstwicy 250) zachowuje w każdym takim punkcie mały zakręt.

## Jak powstaje powierzchnia pod warstwicami

Warstwice podążają za powierzchnią, a powierzchnia za **Metodą tworzenia warstwic** w sekcji **Powierzchnia** w lewym panelu. Domyślna, **Triangulacja z interpolacją liniową**, łączy punkty w trójkąty i zachowuje każdy punkt oraz każdą linię przełamania dokładnie. Pozostałe metody najpierw dopasowują regularną siatkę do punktów (kriging, minimalna krzywizna, najbliższy sąsiad, odwrotna odległość i inne), co daje gładsze warstwice między punktami, ale nie przechodzi dokładnie przez każdy punkt. Raport powierzchni w sekcji **Powierzchnia** podaje, jak bardzo wynik odbiega w Twoich punktach.

**ABOS (aproksymacja oparta na wygładzaniu)** jest jedną z metod siatkowych. Ma dwa własne ustawienia: **Gładkość** (na początek 0.5; im mniejsza, tym gładsza) i **Dokładność** (na początek 1: powierzchnia jest doprowadzana do 1% zakresu wysokości terenu w Twoich punktach; wpisz mniejszą liczbę, aby uzyskać ściślejsze dopasowanie). Jeśli nie może osiągnąć dokładności na posiadanej siatce, raport powierzchni o tym informuje: wpisz mniejszy **Odstęp siatki**.

## Odczytaj rzędną w dowolnym miejscu

Przesuń kursor nad plan. Pasek stanu pokazuje:

- **E** i **N** pod kursorem
- **Teren** i rzędną istniejącego terenu w tym miejscu, interpolowaną na trójkącie pod kursorem
- **Wyprofilowany** i rzędną projektową, tam gdzie plac lub korytarz zmienił teren
- „Poza powierzchnią” poza powierzchnią

Aby odczytać dokładnie punkt pomiarowy, wybierz {{ui:Select}} i kliknij punkt: prawy panel pokaże jego numer, współrzędną E, współrzędną N, rzędną, opis i grupę.

## Pokaż pasma rzędnych

1. Zaznacz {{ui:Elevation bands}}.
   Powierzchnia jest wypełniona kolorem od niskiego (niebieskozielonego) do wysokiego (ochrowobrązowego). Legenda pod polami wyboru wymienia zakres rzędnych każdego pasma.
2. Wybierz liczbę pasm w polu **Pasma**: 5, 8, 10 lub 12. Pasma dzielą zakres od najniższej do najwyższej rzędnej na równe kroki.

Pasma służą wyłącznie do oglądania. Nie są eksportowane do DXF ani drukowane do PDF.

## Pokaż strzałki spadków

Zaznacz {{ui:Slope arrows}}. Krótka strzałka na każdym trójkącie, dość dużym, by ją pomieścić, wskazuje kierunek w dół spadku. Trójkąty płaskie nie dostają strzałki. Strzałki służą do szybkiego sprawdzenia kierunku odpływu; sama wartość spadku nie jest jeszcze opisywana.

## Pokaż trójkąty, punkty i krawędzie

- {{ui:Triangles}} rysuje krawędzie TIN. Włącz, aby sprawdzić, jak powierzchnia łączy punkty, zwłaszcza wzdłuż linii przełamań i na zewnętrznym obrysie.
- {{ui:Points}} rysuje każdy punkt pomiarowy; {{ui:Point labels}} dodaje jego numer, rzędną i opis (albo mniej: zob. **Opisy punktów** w [Ustawieniach CivilCraft](topic:settings)).
- {{ui:Breaklines}} rysuje linie przełamań (oraz granicę) na pomarańczowo.
- {{ui:Surface edge}} rysuje obrys powierzchni.

## Istniejący teren czy projektowany

Gdy plac lub korytarz wyprofiluje teren bez problemów, **Powierzchnia** w sekcji **Wyświetlanie** oferuje {{ui:Proposed (graded)}}. Warstwice, pasma i strzałki pokazują wtedy powierzchnię wyprofilowaną, dzięki czemu widzisz nowy teren i wyjścia skarp wokół niego. Przełącz z powrotem na {{ui:Existing ground}}, aby zobaczyć pomiar.

## Co jest eksportowane

Wyjście DXF i PDF podąża za tymi ustawieniami: to, co wyłączyłeś, nie jest zapisywane, a warstwice są tymi z aktualnie pokazywanej powierzchni. Pasma rzędnych nigdy nie są eksportowane.
