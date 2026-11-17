---
title: Projektowanie niwelety podłużnej
summary: Otwórz widok profilu, rozpocznij projektową niweletę od terenu, dodawaj i przeciągaj PVI, ustawiaj długości łuków pionowych i odczytuj spadki, wartości K oraz punkty najwyższe i najniższe.
keywords: niweleta, profil, pvi, łuk pionowy, spadek, wartość k, garb, wklęsłość, bvc, evc, widok profilu, niweleta projektowa, teren istniejący, linie charakterystyczne w profilu, przecięcia, rzutowane, krawężnik, rów, etykiety
from: e9182bfa
---

Każda trasa ma jedną projektową niweletę: listę PVI (kilometraż i rzędna) połączonych prostymi spadkami, z symetrycznym parabolicznym łukiem pionowym w każdym wewnętrznym PVI, który ma długość. Istniejący profil terenu jest pobierany z powierzchni za Ciebie.

## Otwórz widok profilu

1. Zaznacz trasę (kliknij ją narzędziem {{ui:Zaznacz}}).
2. Naciśnij {{key:R}}, kliknij {{ui:Profil}} na pasku narzędzi albo {{ui:Widok profilu}} na dole prawego panelu.
   Widok profilu otwiera się pod planem z istniejącym terenem wzdłuż trasy. Przy dwóch lub więcej trasach wybierz jedną z listy po lewej stronie paska profilu.

Widok zawsze pokazuje całą trasę i rozciąga rzędne, aby wypełnić panel; przewyższenie jest wypisane w lewym dolnym rogu, na przykład „Przewyższenie pionowe 10×”. Nie przybliża ani nie przesuwa.

Porusz wskaźnikiem wzdłuż profilu: pasek pokazuje kilometraż, rzędne terenu i projektowe, spadek oraz wykop lub nasyp w tym miejscu, a kropka podąża za trasą w planie.

## Rozpocznij projektową niweletę

1. W prawym panelu, w sekcji **Niweleta projektowa**, kliknij {{ui:Zacznij od terenu}}.
   Dwa PVI są umieszczane na terenie na obu końcach trasy, połączone jednym prostym spadkiem. Pasek stanu mówi: „Niweleta projektowa rozpoczęta od terenu na obu końcach. Włącz Dodaj PVI i klikaj, aby dodać załamania spadku; nadaj im długość łuku w tabeli.”

Jeśli trasa nie przecina powierzchni, pojawi się komunikat: „Ta trasa nie ma pod sobą terenu, od którego można zacząć.” Wtedy dodaj PVI, klikając (następna sekcja).

## Dodaj PVI

1. Naciśnij {{key:I}} albo kliknij {{ui:Dodaj PVI}} na pasku profilu. Przycisk pozostaje wciśnięty.
2. Kliknij w profilu tam, gdzie chcesz załamanie spadku. PVI jest dodawany w tym kilometrażu i rzędnej, zaokrąglonych do 0,01, i zostaje zaznaczony.
3. Dodaj tyle, ile potrzebujesz, a potem ponownie naciśnij {{key:I}}, aby przestać dodawać.

Kliknięcie tam, gdzie PVI już jest, jest odrzucane („Już jest PVI przy …”). PVI zawsze pozostają w kolejności kilometrażu.

## Dostosuj PVI

- **Przeciągnij** PVI w profilu, aby go przesunąć. Nie może przejść przez sąsiednie. Przesunięcie to jeden krok cofnięcia.
- **Wpisz** dokładne wartości w tabeli PVI w prawym panelu: **Kilometraż**, **Rzędna** i **Długość łuku L** (długość łuku pionowego). Po każdej naciśnij {{key:Enter}}.
- **Usuń** PVI krzyżykiem na końcu jego wiersza albo zaznacz go (kliknij) i naciśnij {{key:Delete}}. Gdy widok profilu ma fokus, {{key:Backspace}} również go usuwa.

Pierwszy i ostatni PVI nigdy nie dostają łuku.

## Łuki pionowe

1. Wpisz długość w **Długość łuku L** dla wewnętrznego PVI, na przykład 200.
2. Łuk jest rysowany wyśrodkowany na PVI. Profil i prawy panel pokazują jego rodzaj (garb lub wklęsłość), L i K, kilometraże i rzędne BVC oraz EVC, a także punkt najwyższy lub najniższy, jeśli leży wewnątrz łuku.

K jest wyliczane z L (K = L podzielone przez różnicę algebraiczną spadków, w procentach). Wpisujesz L; wpisywanie K bezpośrednio nie jest jeszcze dostępne.

Jeśli łuk pionowy się nie mieści, czerwone pole mówi dlaczego: wchodzi z powrotem w PVI lub łuk przed nim albo za następny PVI, oraz ile miejsca jest po tej stronie (łuk potrzebuje połowy swojej długości po każdej stronie PVI). Jego przycisk ustawia **najdłuższy łuk, który się mieści**, wraz z jego K, jako jeden krok ({{key:Mod+Z}} cofa go). Możesz też rozsunąć PVI.

## Odczytaj dane

Pod tabelą PVI lista podaje każdy spadek w procentach („Spadek 1: +1.25%”) oraz każdy łuk, na przykład „Garb przy 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)”, a następnie „Punkt najwyższy 1+62.40, 254.12”.

Jeśli PVI nie sięgają obu końców trasy, uwaga o tym informuje. Korytarz jest budowany tylko tam, gdzie profil i trasa się pokrywają.

## Linie charakterystyczne w profilu

Linie charakterystyczne są również widoczne w widoku profilu, dzięki czemu widzisz krawężnik, rów lub szczyt muru na tle niwelety drogi.

- Tam, gdzie linia charakterystyczna **przecina** trasę, profil pokazuje mały romb w tym kilometrażu i rzędnej, podpisany nazwą linii i jej rzędną w tym miejscu (własna rzędna linii, wyliczona wzdłuż przecinającego ją odcinka).
- Wpisz odległość w {{ui:Obok, w odległości}}, aby narysować też linie charakterystyczne, które **biegną obok** trasy w tej odległości, jako przerywane linie na ich własnych rzędnych. Puste pole lub 0 pokazuje tylko przecięcia.
- Znaczniki i etykiety podążają za każdą zmianą: przesuń wierzchołek, wpisz spadek albo podnieś linię, a profil od razu pokaże nowe rzędne.
- Kliknij romb przecięcia, aby zaznaczyć tę linię charakterystyczną; zaznaczona linia jest rysowana w kolorze podświetlenia.
- {{ui:Linie charakterystyczne}} na pasku profilu ukrywa lub pokazuje je wszystkie. Oba ustawienia są zapisywane z projektem.

Zobacz [Linie charakterystyczne](topic:feature-lines).

## Dalej

- [Przeciągnij korytarz drogowy](topic:corridor) wzdłuż tej trasy i tego profilu.
- Profil jest zapisywany do LandXML razem z trasą; zobacz [Wymiana LandXML](topic:landxml).
