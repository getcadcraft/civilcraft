---
title: Trasy przejazdu pojazdów
summary: Przejedź pojazdem z maksymalnie trzema przyczepami wzdłuż linii elementu albo osi, do przodu lub wstecz, i zobacz obszar, który zakreśla, ślady kół, skręt kierownicą oraz miejsce, w którym pojazd się przełamuje.
keywords: trasa przejazdu, ślad skrętu, symulacja pojazdu, szablon skrętu, pojazd projektowy, ciężarówka, autobus, przyczepa, naczepa, cofanie, przełamanie zespołu, przegub, zakres kierownicy, przesunięcie kół, ślad koła, rampa załadunkowa, promień skrętu
from: 8caafb8a
---

Trasa przejazdu prowadzi pojazd wzdłuż linii i pokazuje grunt, po którym przejeżdża jego nadwozie. Użyj jej, aby sprawdzić, czy ciężarówka pokona zakręt, dojedzie do rampy załadunkowej albo cofnie przyczepę na miejsce bez wyjeżdżania poza nawierzchnię.

## Przejedź pojazdem wzdłuż linii

1. Narysuj linię, którą jedzie pojazd, zgodnie z kierunkiem jazdy: linię elementu (łuki są dozwolone: naciśnij {{key:C}} w trakcie rysowania, zob. [Linie elementów](topic:feature-lines)) albo oś.
2. Zaznacz ją i kliknij {{ui:Trasa pojazdu…}} we **Właściwościach**.
3. Pod **Start od** wybierz pojazd, potem ustaw jego wymiary z własnego pojazdu projektowego: szerokość, zwis przedni, rozstaw osi, zwis tylny, rozstaw kół i **Zakres skrętu**. Dodaj do trzech przyczep, każdą z miejscem zaczepienia, długością od zaczepu do osi, zwisami i **Największym zgięciem**.
4. Wybierz **Jazdę**: do przodu albo wstecz. Kliknij {{ui:Przejedź}}.

:::warning
Pojazdy startowe są wartościami zastępczymi, a nie normą. Ustaw wymiary według pojazdu projektowego, którego używa twój projekt.
:::

## Do przodu i wstecz

| Jazda | Co podąża za linią | Co wylicza CivilCraft |
|---|---|---|
| **Do przodu** | Środek osi przedniej | Gdzie znajdą się oś tylna i każda przyczepa, kąt skrętu oraz zgięcie |
| **Wstecz** | Środek ostatniej osi (tył przyczepy) | Dokąd dojedzie każda jednostka przed nim i skręt, jakiego potrzebuje kabina, aby tam ustawić przyczepę |

Cofanie to sposób sprawdzania manewru wstecz: wskaż, gdzie ma stanąć przyczepa, a CivilCraft powie, czy kabina to zrobi.

## Odczytaj wynik

Trasa przejazdu jest rysowana na planie na pomarańczowo: jej obrys i przerywaną linią ślady najbardziej wysuniętych kół. Zaznacz ją (kliknij wewnątrz), aby zobaczyć we **Właściwościach**:

- **Przejechaną długość**, największy kąt **Skrętu** i **Zgięcia** względem ich limitów oraz **Powierzchnię przejazdu**.
- Każdy problem wzdłuż linii z jego odległością: skręt ponad zakres kierownicy albo przyczepę skręcającą ponad limit zgięcia (przełamanie zespołu).
- **Pojazd wzdłuż linii**: przesuń suwak, aby zobaczyć pojazd w dowolnym punkcie, z jego skrętem i zgięciem w tym miejscu.

Zmień linię, a trasa przejazdu za nią podąży. {{ui:Zmień pojazd…}} zmienia wymiary; **Jazda** przełącza między jazdą do przodu a wstecz. Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa. {{key:Delete}} usuwa zaznaczoną trasę przejazdu (linia zostaje).

Obrys i ślady kół trafiają do PDF, DXF i DWG na warstwie C-ROAD-SWPT.

## Jak to jest wyliczane

Każda jednostka obraca się wokół linii swojej osi tylnej i jest ciągnięta przez punkt przed nią (oś przednią albo zaczep). To model małej prędkości bez poślizgu, którego używają sprawdzenia tras przejazdu. Powierzchnia przejazdu to suma obrysów nadwozia we wszystkich położeniach. Nie modeluje prędkości, poślizgu opon, czasu potrzebnego na obrót kierownicy, przyczep skrętnych ani prześwitu pod nadwoziem.
