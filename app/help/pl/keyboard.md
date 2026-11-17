---
title: Klawisze i mysz
summary: Każdy skrót klawiszowy oraz każde działanie myszy, gładzika i dotyku w CivilCraft, pogrupowane, z różnicami między przeglądarkami i platformami.
keywords: klawiatura, skróty, klawisze, mysz, gładzik, dotyk, przesuwanie, powiększanie, szczypanie, kółko, prawy przycisk, mac, klawisz command
from: a9756f46
---

Pojedyncze klawisze literowe działają, gdy kursor nie znajduje się w polu tekstowym. Skróty z {{key:Mod}} używają Command na Macu, a Ctrl w pozostałych systemach. Zobacz też [Klawisze w przeglądarce](common:keys).

## Pliki i edycja

| Klawisz | Działanie |
|---|---|
| {{key:Mod+O}} | Otwórz plik punktów, LandXML lub projekt |
| {{key:Mod+S}} | Zapisz projekt (pobiera plik `.civilcraft.json`) |
| {{key:Mod+P}} | Wydrukuj plan do PDF (otwiera okno wydruku, a nie drukowanie przeglądarki) |
| {{key:Mod+Z}} | Cofnij |
| {{key:Mod+Y}} | Ponów |
| {{key:Delete}} | Usuń zaznaczone punkty pomiarowe, oś trasy, plac, budowlę, rurę lub PVI |
| {{key:Mod+C}} | Kopiuj zaznaczone punkty pomiarowe (także jako wiersze punktów do arkusza) |
| {{key:Mod+X}} | Wytnij zaznaczone punkty pomiarowe |
| {{key:Mod+V}} | Wklej punkty: podążają za wskaźnikiem, kliknij, gdzie mają trafić |
| {{key:Mod+Shift+V}} | Wklej w miejscu: przy własnych współrzędnych punktów |
| {{key:Mod+D}} | Duplikuj zaznaczone punkty: kopia podąża za wskaźnikiem |
| {{key:Mod+A}} | Zaznacz wszystkie punkty pomiarowe |
| {{key:Esc}} | Odznacz wszystko (i anuluj wklejanie) |

{{key:Mod+S}}, {{key:Mod+O}} i {{key:Mod+P}} działają także wtedy, gdy kursor jest w polu tekstowym. {{key:Mod+Z}} i {{key:Mod+Y}} w polu tekstowym cofają lub ponawiają pisanie, jak zwykle, i tak samo działają {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} i {{key:Mod+A}}: w polu kopiują, wycinają, wklejają i zaznaczają jego tekst. Gdy tekst jest zaznaczony na stronie (w panelu), {{key:Mod+C}} kopiuje ten tekst. {{key:Mod+Shift+Z}} nic nie robi w CivilCraft: użyj {{key:Mod+Y}} lub przycisku {{ui:Ponów}}.

:::mac
Klawisz oznaczony **delete** na Macu jest dla przeglądarki klawiszem {{key:Backspace}}. Aby usunąć zaznaczenie, naciśnij {{key:Delete}} (fn i delete) albo wybierz {{ui:Usuń}} na pasku narzędzi w menu {{ui:Więcej}}.
:::

## Narzędzia

| Klawisz | Narzędzie |
|---|---|
| {{key:V}} | {{ui:Zaznacz}} |
| {{key:M}} | {{ui:Zmierz}}: odległości, pola i spadki na planie ([Zmierz](topic:measure)) |
| {{key:A}} | {{ui:Oś trasy}} |
| {{key:G}} | {{ui:Plac}} |
| {{key:P}} | {{ui:Rurociągi}} |
| {{key:B}} | {{ui:Linia przełamania}} |
| {{key:O}} | {{ui:Granica}} |
| {{key:R}} | Pokaż lub ukryj widok profilu |
| {{key:I}} | Włącz lub wyłącz {{ui:Dodaj PVI}} (otwiera widok profilu, jeśli jest zamknięty) |
| {{key:F}} | {{ui:Dopasuj}}: pokaż wszystko |
| {{key:D}} | {{ui:3D}}: pokaż teren w 3D lub wróć do planu |
| {{key:E}} | Pokaż lub ukryj spadki i rzędne wzdłuż każdej linii (tylko na ekranie) |

Ponowne naciśnięcie klawisza aktywnego narzędzia wraca do {{ui:Zaznacz}}. Litery z {{key:Shift}} nic nie robią.

## Podczas rysowania

| Klawisz | Działanie |
|---|---|
| {{key:Enter}} | Zakończ oś trasy, plac, odcinek rurociągu, linię przełamania lub granicę |
| {{key:Backspace}} | Usuń ostatnio kliknięty punkt |
| {{key:C}} | Linia charakterystyczna: włącz lub wyłącz łuki (po wierzchołku kliknij punkt na krzywej, a potem jej koniec) |
| {{key:Esc}} | Anuluj rysowanie (lub wklejanie); naciśnięty ponownie (lub gdy nic nie jest rysowane) wraca do {{ui:Zaznacz}} i czyści zaznaczenie |

## Widok planu

| Klawisz lub działanie | Wynik |
|---|---|
| Kółko | Przybliż lub oddal przy wskaźniku |
| Przeciągnij po pustym miejscu | Przesuń (w każdym narzędziu; krótkie kliknięcie nadal klika; przy przytrzymanym {{key:Shift}} rysuje prostokąt zaznaczenia) |
| Przeciągnij środkowym przyciskiem | Przesuń |
| Przeciągnij prawym przyciskiem | Przesuń (menu się nie otwiera) |
| {{key:Space}} i przeciągnij | Przesuń |
| Kliknij | Zaznacz (przy {{ui:Zaznacz}}) albo postaw punkt (przy narzędziu rysowania) |
| {{key:Shift}} i kliknij | Dodaj punkt pomiarowy do zaznaczenia albo usuń go z niego |
| {{key:Shift}} i przeciągnij | Narysuj prostokąt: punkty pomiarowe w nim są dodawane do zaznaczenia. Przeciągnij wokół nich, aby użyć [lasso](topic:lasso-selection) |
| {{key:Space}} podczas rysowania lasso | Okno, potem przecięcie, potem płot |
| Kliknij podczas wklejania | Umieść tam wklejone punkty ({{key:Enter}} umieszcza je przy ich własnych współrzędnych) |
| Przeciągnij uchwyt | Przesuń PI, narożnik placu lub budowlę (jeden krok cofania) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Przesuń, gdy plan ma fokus (najpierw kliknij go) |
| {{key:Plus}} i {{key:Minus}} | Przybliż i oddal na środku, gdy plan ma fokus |

Klawisz = przybliża jak {{key:Plus}}, więc {{key:Shift}} nie jest potrzebny.

## Widok profilu

| Działanie | Wynik |
|---|---|
| Kliknięcie przy włączonym {{ui:Dodaj PVI}} | Dodaj tam PVI |
| Kliknij PVI | Zaznacz go |
| Przeciągnij PVI | Przesuń go (jeden krok cofania) |
| {{key:Delete}} lub {{key:Backspace}} | Usuń zaznaczone PVI ({{key:Backspace}} tylko wtedy, gdy widok profilu ma fokus) |

Widok profilu nie przybliża się ani nie przesuwa.

## Ekran i pomoc

| Klawisz | Działanie |
|---|---|
| {{key:F1}} | Otwórz lub zamknij tę pomoc (panel boczny); {{ui:Pomoc}} na pasku aplikacji robi to samo |
| {{key:Esc}} | Zamknij panel pomocy, gdy jest otwarty |
| {{key:Ctrl+Shift+F}} | Przełączaj tryby ekranu: pełny ekran, pełny ekran z ukrytymi paskami, zwykły |
| {{key:Esc}} | Wyjdź z pełnego ekranu (klawisz przeglądarki) |

{{key:F1}} trafia do pomocy, zanim CivilCraft go zobaczy, więc działa w każdym narzędziu. Na większości klawiatur Mac naciśnij fn z F1 albo kliknij {{ui:Pomoc}}. {{key:Ctrl+Shift+F}} używa klawisza Control na każdej platformie, także na Macu. Zobacz [Korzystanie z pomocy](common:help), aby dowiedzieć się, jak przeszukiwać tę pomoc.

## Mysz, gładzik i dotyk

:::mouse
- Kółko przybliża przy wskaźniku. Mysz z kółkiem obracającym się swobodnie przybliża szybko: wykonuj krótkie obroty.
- Przesuwaj przeciągnięciem po pustym miejscu, środkowym lub prawym przyciskiem albo przytrzymując {{key:Space}} i przeciągając.
:::

:::mac
Na gładziku Mac:

- Przewijanie dwoma palcami **przybliża** (nie przesuwa), a szczypanie też przybliża.
- Aby przesunąć, naciśnij i przeciągnij jednym palcem po pustym miejscu albo przytrzymaj {{key:Space}} i przeciągnij.
- Kliknięcie dwoma palcami (prawy przycisk) nie otwiera menu i samo z siebie nic nie robi.
:::

:::touch
Na ekranie dotykowym:

- Pierwszy dotyk powiększa przyciski i wiersze menu do rozmiaru palca.
- Stuknij, aby zaznaczyć lub postawić punkt; przeciągnięcie jednym palcem po pustym miejscu przesuwa. Stuknięcie może lekko drgnąć: przesuwanie zaczyna się dopiero po przesunięciu palca o około 10 pikseli.
- Szczypnij dwoma palcami, aby przybliżyć; przesuń je razem, aby przesunąć.
- Przeciągnij uchwyt lub PVI jednym palcem. Uchwyty mają wokół siebie obszar o szerokości palca.
- Podczas rysowania osi trasy, placu, linii przełamania, granicy, odcinka rurociągu, linii charakterystycznej lub działki pasek nad planem oferuje {{ui:Zakończ}} ({{key:Enter}}), {{ui:Cofnij punkt}} ({{key:Backspace}}) i {{ui:Anuluj}} ({{key:Esc}}). Długie przytrzymanie (pół sekundy bez ruchu) też kończy rysowanie.
- W {{ui:Zaznacz}} długie przytrzymanie punktu pomiarowego dodaje go do zaznaczenia albo go z niego usuwa, tak jak kliknięcie z {{key:Shift}}.
- W widoku 3D jeden palec obraca, dwa szczypią i przesuwają, a stuknięcie wybiera.
- Na dotyku nie ma najechania wskaźnikiem, więc odczyty na pasku stanu aktualizują się tylko wtedy, gdy palec jest przyłożony.
:::

## Klawisze przeglądarki, które mają pierwszeństwo

Niektóre klawisze należą do przeglądarki i nigdy nie docierają do CivilCraft, na przykład {{key:Mod+W}} (zamknij kartę), {{key:Mod+T}} (nowa karta), {{key:Mod+N}} (nowe okno) i {{key:F11}} (pełny ekran w przeglądarkach Windows i Linux). CivilCraft ich nie używa. Jeśli skrót otwiera coś w przeglądarce, kliknij raz plan, aby strona otrzymała fokus, i spróbuj ponownie.

## Gdzie jest przesuwanie

Nie ma polecenia Przesuń: wybierz {{ui:Zaznacz}} i przeciągnij punkt lub wierzchołek albo edytuj jego współrzędne we {{ui:Właściwościach}}. Zobacz [Edycja punktów](topic:edit-points).
