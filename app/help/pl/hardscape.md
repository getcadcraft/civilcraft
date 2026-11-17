---
title: Nawierzchnie, mury i schody
summary: Nawierzchnia ze spadkami do odpływu lub spadkiem poprzecznym, jej wzór i układ warstw; ścieżki podążające za terenem; mury oporowe i wolnostojące ze schodkowanymi stopami; krawężniki; rampy i schody sprawdzane względem ich granic; eksport do IFC.
keywords: nawierzchnie utwardzone, nawierzchnia, kostka, taras, patio, spadki, odpływ, spadek poprzeczny, jodełka, wiązanie rzędowe, ścieżka, chodnik, mur oporowy, mur ogrodowy, stopa fundamentowa, nakrywa, krawężnik, obrzeże, rampa, dostępność, schody, podstopnice, stopnice, spocznik
from: 51475877
---

Nawierzchnie utwardzone są za każdym razem wyliczane na nowo z terenu, więc podążają za ukształtowaniem i odtwarzają się, gdy zmienia się teren lub jego linia. Przeciągaj ich narożniki na planie jak każdą linię. Otwórz je z {{ui:Nawierzchnie utwardzone}} w grupie Krajobraz.

## Nawierzchnia

Kliknij narożniki i naciśnij {{key:Enter}}. We **Właściwościach**:

- **Rzędna**: puste = średnia rzędna terenu pod nią.
- **Spadki**: poziome, **spadek poprzeczny** (% w wybranym kierunku) albo **do odpływu**: CivilCraft prosi o kliknięcie miejsca odpływu, a potem każdy narożnik wznosi się od odpływu ze spadkiem. Strzałki na planie pokazują spadki.
- **Wzór** (siatka, wiązanie rzędowe, jodełka) z rozmiarem jednostki, spoiną i kątem; szerokość **Obrzeża**. Na arkuszu spoiny węższe niż 1 mm są pomijane.
- Nawierzchnia jest częścią powierzchni projektowanej. Jej warstwy (kostka, podsypka, podbudowa) trafiają do IFC i do ilości.

## Ścieżki

Klikaj wzdłuż ścieżki i naciśnij {{key:Enter}}. Podąża ona za terenem, ze **spadkiem poprzecznym** w stronę prawej. Ścieżka bardziej stroma niż **Największe dopuszczalne nachylenie** jest oznaczona `!` na planie w miejscu, gdzie występuje, a Właściwości mówią, jak stroma się robi.

## Mury

Klikaj wzdłuż muru i naciśnij {{key:Enter}}. Mur jest **oporowy** albo **wolnostojący**. Bez **Wierzchu** stoi na całej długości na swojej **Wysokości** nad terenem; wpisz wierzch, aby utrzymać go na poziomie. Jego **stopa** leży na ustawionej głębokości pod terenem i schodzi w pełnych stopniach, więc między nimi pozostaje na poziomie. Właściwości podają jego długość, wysokości, pole powierzchni licowej i stopnie stopy; na planie góra i dół muru (TW / BW) są opisane na obu końcach.

:::warning
Mur oporowy wyższy niż 1,2 m (4 ft) jest oznaczany: projektuje go inżynier.
:::

## Krawężniki

Klikaj wzdłuż krawężnika i naciśnij {{key:Enter}}; ustaw jego szerokość i wysokość wystawania.

## Rampy

Klikaj od dołu do góry i naciśnij {{key:Enter}}. Rzędne pochodzą z terenu na każdym końcu, chyba że je wpiszesz. Rampa dostaje spocznik co każde wzniesienie 750 mm (2,5 ft) i jest sprawdzana względem **Największego dopuszczalnego nachylenia** (na początek 1:12) oraz minimalnej szerokości; Właściwości mówią, jak długa musiałaby być.

## Schody

Kliknij przednią krawędź dolnego stopnia, a potem miejsce, w którym schody sięgają góry, i naciśnij {{key:Enter}}. Liczba podstopnic wynika z wysokości i **Największej podstopnicy**; szerokość stopnicy z reguły wygody 2R + G ≈ 630 mm, nigdy mniejsza niż **Najmniejsza szerokość stopnicy**; spocznik co **Podstopnic w biegu** (najwyżej). Właściwości mówią, czy schody mieszczą się między dwoma punktami, czy ile jeszcze potrzebują.

:::note
Granice dla ramp i schodów są oznaczone jako wartości domyślne. Ustaw te, których wymagają przepisy budowlane.
:::

## Poza CivilCraft

- Więcej › {{ui:Eksportuj IFC krajobrazu}}: nawierzchnie i ścieżki jako `IfcPavement`, mury jako `IfcWall` (mury oporowe jako RETAININGWALL) wraz z ich warstwami, krawężniki jako `IfcKerb`, rampy jako `IfcRamp`, schody jako `IfcStair` z podstopnicami i stopnicami.
- **Wyślij do TakeoffCraft** z zestawienia roślin przenosi pola nawierzchni i objętości warstw, pola i długości powierzchni licowych murów, długości krawężników oraz liczbę stopni.
- Arkusz szczegółów rysuje przekrój każdego muru, układ warstw każdej nawierzchni i każdy bieg schodów. Zobacz [Arkusze krajobrazu](topic:landscape-sheets).
