---
title: Zaprojektuj profil pionowy
summary: Otwórz widok profilu, zacznij profil projektowy od terenu, dodawaj i przeciągaj PVI, ustaw długości łuków pionowych i odczytaj spadki, wartości K oraz punkty najwyższe i najniższe.
keywords: profil, wyrównanie pionowe, PVI, łuk pionowy, spadek, wartość K, grzbiet, dolina, BVC, EVC, widok profilu, niweleta projektowa, FG, profil terenu istniejącego, linie charakterystyczne w profilu, przecięcia, rzut, krawężnik, rów, etykiety
from: dbb1f32d
---

Każda trasa ma jeden profil projektowy: listę PVI (kilometraż i rzędna) połączonych prostymi spadkami, z symetrycznym parabolicznym łukiem pionowym w każdym wewnętrznym PVI, który ma długość. Profil terenu istniejącego jest pobierany z powierzchni za Ciebie.

## Otwórz widok profilu

1. Wybierz trasę (kliknij ją narzędziem {{ui:Zaznacz}}).
2. Naciśnij {{key:R}}, kliknij {{ui:Profil}} na pasku narzędzi albo {{ui:Widok profilu}} na dole prawego panelu.
   Widok profilu otwiera się pod planem, z terenem istniejącym wzdłuż trasy. Gdy jest dwie lub więcej tras, wybierz jedną z listy po lewej stronie paska profilu.

Widok zaczyna od pokazania całej trasy i rozciągnięcia rzędnych na cały panel; przewyższenie jest wypisane w lewym dolnym rogu, na przykład „Przewyższenie pionowe 10×”.

## Powiększanie i przesuwanie profilu

- **Powiększenie:** obracaj kółko myszy (albo rozsuń palce na gładziku), a widok powiększa się wokół wskaźnika. Przytrzymaj {{key:Shift}}, by powiększać tylko kilometraż, albo {{key:Alt}}, by powiększać tylko rzędne (to zmienia przewyższenie). Gdy widok profilu ma fokus, klawisze plus i minus powiększają od środka.
- **Przesuwanie:** przeciągnij prawym lub środkowym przyciskiem myszy albo przesuń dwoma palcami po gładziku.
- **Dopasuj:** kliknij dwukrotnie profil albo naciśnij {{key:F}}, by znów pokazać całą trasę.

Edycja PVI zachowuje wybrane powiększenie; nie wraca do dopasowania.

Przesuwaj wskaźnik wzdłuż profilu: pasek pokazuje kilometraż, rzędne terenu i projektowe, spadek oraz wykop lub nasyp w tym miejscu, a kropka podąża za nim po trasie w planie.

## Zacznij profil projektowy

1. W prawym panelu, w sekcji **Profil projektowy**, kliknij {{ui:Zacznij od terenu}}.
   Dwa PVI kładzione są na terenie na dwóch końcach trasy, połączone jednym prostym spadkiem. Pasek stanu mówi: „Profil projektowy rozpoczęto od terenu na obu końcach. Włącz Dodaj PVI i kliknij, aby dodać załamania spadku; podaj im długość łuku w tabeli.”

Jeśli trasa nie przecina powierzchni, pojawia się komunikat: „Ta trasa nie ma pod sobą terenu, od którego można zacząć.” Wtedy dodaj PVI przez kliknięcie (w następnej sekcji).

## Dodaj PVI

1. Naciśnij {{key:I}} albo kliknij {{ui:Dodaj PVI}} na pasku profilu. Przycisk zostaje wciśnięty.
2. Kliknij w profilu tam, gdzie chcesz załamanie spadku. PVI dodaje się na tym kilometrażu i rzędnej, zaokrąglonych do 0.01, i jest zaznaczone.
3. Dodaj tyle, ile potrzebujesz, potem naciśnij {{key:I}} ponownie, by przestać dodawać.

Kliknięcie w miejscu, gdzie PVI już jest, jest odrzucane („W tym miejscu jest już PVI przy …”). PVI zawsze pozostają w kolejności kilometrażu.

## Przyciąganie przy dodawaniu lub przeciąganiu

Przycisk **Przyciąganie** na pasku profilu jest włączony od początku. Gdy jest włączony, dodawany lub przeciągany PVI ląduje na najbliższym PVI, punkcie terenu, kilometrażu PVI albo linii terenu, a etykieta przy znaczniku mówi, który. Przytrzymaj {{key:Alt}}, aby postawić punkt swobodnie, gdziekolwiek.

## Korekta PVI

- **Przeciągnij** PVI w profilu, by go przesunąć. Nie może przejść obok sąsiadów. Przesunięcie to jeden krok cofania.
- **Wpisz** dokładne wartości w tabeli PVI w prawym panelu: **Kilometraż**, **Rzędna**, **Spadek %** i **Długość łuku L** (długość łuku pionowego). Po każdej naciśnij {{key:Enter}}.
- **Wskaż** wartość w profilu: mały przycisk obok kilometrażu lub rzędnej PVI czeka na jedno kliknięcie w widoku profilu i wpisuje tę wartość. Kliknięcie przyciąga się jak przy Dodaj PVI; przytrzymaj {{key:Alt}} dla swobodnego punktu; {{key:Esc}} anuluje.
- **Spadek %** to spadek stycznej, która zaczyna się w tym PVI i biegnie do następnego. Wpisanie go przesuwa rzędną **następnego** PVI (jego kilometraż nigdy się nie zmienia). Jeśli następny PVI jest zablokowany, zamiast tego przesuwa się rzędna poprzedniego.
- **Zablokuj** PVI kłódką na końcu jego wiersza. Zablokowanego PVI nie da się przeciągnąć, a edycja spadku go nie przesuwa. Jeśli oba końce stycznej są zablokowane, jej spadek nie może się zmienić: pasek stanu to mówi i najpierw trzeba odblokować jeden koniec. Blokada jest zapisywana w pliku.
- **Usuń** PVI krzyżykiem na końcu jego wiersza albo zaznacz je (kliknij) i naciśnij {{key:Delete}}. Gdy widok profilu ma fokus, {{key:Backspace}} również je usuwa.

Pierwszy i ostatni PVI nigdy nie dostają łuku.

## Łuki pionowe

1. Wpisz długość w **Długość łuku L** dla wewnętrznego PVI, na przykład 200.
2. Łuk rysuje się wyśrodkowany na PVI. Profil i prawy panel pokazują jego rodzaj (grzbiet lub dolina), L i K, kilometraże i rzędne BVC oraz EVC, a także punkt najwyższy lub najniższy, gdy leży w łuku.

K wylicza się z L (K = L podzielone przez algebraiczną różnicę spadków w procentach). Wpisujesz L; wpisanie K bezpośrednio nie jest jeszcze dostępne.

Jeśli łuk pionowy się nie mieści, czerwona ramka mówi dlaczego: wchodzi z powrotem w poprzedni PVI lub łuk albo za następny PVI oraz ile miejsca jest po tej stronie (łuk potrzebuje połowy swojej długości po każdej stronie PVI). Jego przycisk ustawia **najdłuższy łuk, który się mieści**, wraz z jego K, jako jeden krok ({{key:Mod+Z}} to cofa). Albo rozsuń PVI.

## Odczytaj dane

Pod tabelą PVI lista podaje każdy spadek w procentach („Spadek 1: +1.25%”) i każdy łuk, na przykład „Grzbiet przy 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)”, a następnie „Punkt najwyższy 1+62.40, 254.12”.

Jeśli PVI nie sięgają obu końców trasy, notatka to mówi. Korytarz buduje się tylko tam, gdzie profil i trasa się pokrywają.

## Linie charakterystyczne w profilu

Linie charakterystyczne pokazują się również w widoku profilu, więc widać krawężnik, rów lub koronę muru na tle profilu drogi.

- Tam, gdzie linia charakterystyczna **przecina** trasę, profil pokazuje mały romb na tym kilometrażu i rzędnej, podpisany nazwą linii i jej rzędną w tym miejscu (własna rzędna linii, wyliczona wzdłuż przecinającego odcinka).
- Wpisz odległość w {{ui:Obok, w odległości}}, aby narysować też linie charakterystyczne, które **biegną obok** trasy w tej odległości, jako linie przerywane na własnych rzędnych. Puste albo 0 pokazuje tylko przecięcia.
- Znaczniki i etykiety podążają za każdą zmianą: przesuń wierzchołek, wpisz spadek albo podnieś linię, a profil od razu pokaże nowe rzędne.
- Kliknij romb przecięcia, by zaznaczyć tę linię charakterystyczną; zaznaczona linia jest rysowana w kolorze podświetlenia.
- {{ui:Linie charakterystyczne}} na pasku profilu ukrywa lub pokazuje je wszystkie. Oba ustawienia są zapisywane z projektem.

Zobacz [Linie charakterystyczne](topic:feature-lines).

## Dalej

- [Przeciągnij korytarz drogowy](topic:corridor) wzdłuż tej trasy i tego profilu.
- Profil zapisywany jest w LandXML razem z trasą; zobacz [Wymiana LandXML](topic:landxml).
