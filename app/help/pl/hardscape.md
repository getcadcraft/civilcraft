---
title: Nawierzchnie, mury i schody
summary: Nawierzchnia ze spadkami do wpustu lub ze spadkiem poprzecznym, wzór i konstrukcja warstw; ścieżki idące za terenem; mury oporowe i wolnostojące z schodkowymi stopami; krawężniki; rampy i schody sprawdzane względem limitów; eksport IFC.
keywords: nawierzchnia utwardzona, nawierzchnia, kostka, taras, patio, spadki, wpust, spadek poprzeczny, jodełka, wiązanie rzędowe, ścieżka, chodnik, mur oporowy, mur ogrodowy, stopa fundamentowa, murek, krawężnik, obrzeże, rampa, dostępność, schody, stopnie, podstopnie, spocznik
from: d34b4466
---

Nawierzchnia utwardzona jest wyliczana od nowa z terenu za każdym razem, więc podąża za ukształtowaniem i odtwarza się, gdy zmienia się teren albo jego linia. Przeciągaj jej narożniki w planie jak każdą linię. Otwórz ją z {{ui:Nawierzchnie utwardzone}} w grupie Krajobraz.

## Nawierzchnia

Kliknij narożniki i naciśnij {{key:Enter}}. We Właściwościach:

- **Poziom**: puste = średnia terenu pod nią.
- **Spadki**: poziomo, **spadek poprzeczny** (% w wybranym kierunku) albo **do wpustu**: CivilCraft prosi o kliknięcie, gdzie jest wpust, a potem każdy narożnik wznosi się od wpustu o ustalony spadek. Strzałki w planie pokazują spadki.
- **Wzór** (siatka, wiązanie rzędowe, jodełka) z rozmiarem jednostki, spoiną i kątem; **Obrzeże** o podanej szerokości. Na arkuszu spoiny węższe niż milimetr są pomijane.
- Nawierzchnia jest częścią powierzchni projektowej. Jej warstwy (kostka, podsypka, podbudowa) trafiają do IFC i do ilości.

## Ścieżki

Kliknij wzdłuż ścieżki i naciśnij {{key:Enter}}. Ścieżka idzie za terenem, ze **spadkiem poprzecznym** skierowanym w prawą stronę. Ścieżka stromsza niż **Najbardziej stromy dozwolony** jest w planie oznaczona `!` w tym miejscu, a Właściwości mówią, jak stroma się robi.

Tam, gdzie ścieżka styka się z drogą zbudowaną przez korytarz, zatrzymuje się na zewnętrznej krawędzi drogi, na poziomie chodnika lub pobocza, w powierzchni projektowej i w widoku 3D. Ścieżka przecinająca drogę jest wyrównywana i pokazywana jako dwa odcinki. Koniec narysowany krócej niż dwukrotność szerokości ścieżki przed drogą jest przedłużany do jej krawędzi. Plan nadal pokazuje ścieżkę tak, jak ją narysowano, a jej długość i pole liczą całą linię. Zobacz [Przeciągnij korytarz drogowy](topic:corridor).

## Mury

Kliknij wzdłuż muru i naciśnij {{key:Enter}}. Mur jest **oporowy** albo **wolnostojący**. Bez **Góry** stoi na wysokości **Wysokość** nad terenem na całej długości; wpisz górę, aby utrzymać go poziomo. Jego **stopa** leży na ustalonej głębokości pod terenem i schodzi w dół w pełnych stopniach, więc między nimi pozostaje poziomo. Właściwości podają długość, wysokości, pole powierzchni licowej i stopnie stopy; plan podpisuje górę i dół muru (TW / BW) na każdym końcu.

:::warning
Mur oporowy wyższy niż 1.2 m (4 ft) jest oznaczany: projektuje go inżynier.
:::

## Krawężniki

Kliknij wzdłuż krawężnika i naciśnij {{key:Enter}}; ustaw jego szerokość i wysokość wystawania.

## Rampy

Kliknij od dołu do góry i naciśnij {{key:Enter}}. Rzędne pochodzą z terenu na każdym końcu, chyba że wpiszesz je ręcznie. Rampa dostaje spocznik co wzniesienie 750 mm (2.5 ft) i jest sprawdzana względem **Najbardziej stromy dozwolony** (na start 1:12) oraz minimalnej szerokości. Właściwości podają, jak długa musiałaby być.

## Schody

Kliknij przednią krawędź dolnego stopnia, potem miejsce, w którym schody docierają do góry, i naciśnij {{key:Enter}}. Liczba podstopnic wynika z wysokości i **Największa podstopnica**; bieg (going) z reguły komfortu 2R + G ≈ 630 mm, nigdy poniżej **Najmniejszy bieg**; spocznik co **Najwięcej podstopni w biegu**. Właściwości mówią, czy schody mieszczą się między dwoma punktami, czy ile jeszcze potrzebują długości.

:::note
Limity dla ramp i schodów to oznaczone wartości domyślne. Ustaw te, których wymaga Twój przepis budowlany.
:::

## Poza CivilCraft

- Więcej › {{ui:Eksportuj IFC krajobrazu}}: nawierzchnia i ścieżki jako `IfcPavement`, mury jako `IfcWall` (mury oporowe jako RETAININGWALL) wraz z ich warstwami, krawężniki jako `IfcKerb`, rampy jako `IfcRamp`, schody jako `IfcStair` z podstopnicami i stopnicami.
- **Wyślij do TakeoffCraft** w zestawieniu roślin przenosi pola nawierzchni i objętości warstw, pola licowe murów i ich długości, długości krawężników oraz liczbę stopni.
- Arkusz szczegółów rysuje przekrój każdego muru, konstrukcję każdej nawierzchni i każdy bieg schodów. Zobacz [Arkusze krajobrazu](topic:landscape-sheets).
