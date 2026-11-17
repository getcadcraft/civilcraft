---
title: Plany nasadzeń i zestawienia
summary: Umieszczaj pojedyncze rośliny, rabaty wypełniane według rozstawu roślin z mieszanką procentową i żywopłoty; opisuj je etykietami i licz w zestawieniu roślin do arkusza kalkulacyjnego lub TakeoffCraft.
keywords: plan nasadzeń, zestawienie roślin, rabata, nasadzenie masowe, żywopłot, drzewo, krzew, roślina okrywowa, rozstaw, rozstaw trójkątny, liczba roślin, ilości, etykiety, korona, symbole roślin, ifc, takeoff
from: ab49eab5
---

## Umieszczanie roślin

1. Wybierz roślinę w sekcji **Rośliny** po lewej.
2. Kliknij {{ui:Roślina}}, a potem kliknij w planie: każde kliknięcie umieszcza jedną roślinę. Naciśnij {{key:Esc}}, aby zakończyć.

Symbol rośliny jest rysowany w jej rozpiętości w dojrzałości; Więcej › {{ui:Pokaż w rozmiarze sadzenia}} rysuje każdą roślinę w rozmiarze, w jakim jest sadzona. Drzewa są osadzone na gruncie: gdy później wyrównasz teren, podążają za nim. Aby przypisać roślinę do rzędnej, wpisz ją w polu **Rzędna** we Właściwościach.

## Rabaty nasadzeń

1. Wybierz główną roślinę, kliknij {{ui:Rabata}} i kliknij narożniki rabaty. Naciśnij {{key:Enter}} (albo kliknij pierwszy narożnik ponownie), aby ją zamknąć.
2. Rabata wypełnia się tą rośliną w jej rozstawie, we wzorze **trójkątnym** (zwykłym: każda roślina jest w tej samej odległości od sześciu innych), w połowie rozstawu od krawędzi.
3. We Właściwościach **Dodaj roślinę** miesza w roślinę wybraną po lewej. Ustaw **Udział %** każdej rośliny: rabata zajmuje dokładnie tyle każdej, rozłożonych po całej powierzchni. **Mieszaj ponownie** przetasowuje ich położenie.

Jeśli **Rozstaw** jest pusty, używany jest własny rozstaw roślin (ważony ich udziałami); wpisz wartość, aby użyć jej dla każdej rośliny. **Wzór** może być kwadratowy, a **Rzędy pod kątem** obraca rzędy.

## Żywopłoty

Wybierz roślinę żywopłotu, kliknij {{ui:Żywopłot}}, kliknij wzdłuż żywopłotu i naciśnij {{key:Enter}}. Rośliny ustawiają się wzdłuż linii w swoim rozstawie, wyśrodkowane tak, by na obu końcach był ten sam odstęp. Żywopłot może mieć **dwa rzędy, przesunięte**, w ustalonej odległości od siebie.

## Etykiety

Pojedyncze rośliny mają etykiety według ustawienia etykiety (domyślnie `{name}`); własną etykietę dla jednej rośliny wpisz we Właściwościach. Rabaty są opisywane liczbą każdej rośliny, a żywopłoty ich liczbą. Więcej › {{ui:Opisy roślin}} włącza i wyłącza etykiety. Pola etykiety: `{name}`, `{botanical}`, `{size}` (pojemnik), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Zestawienie roślin

Więcej › {{ui:Zestawienie roślin…}} liczy każdą roślinę według gatunku, łącznie z pojedynczymi roślinami, rabatami i żywopłotami, wraz z jej rozmiarem sadzenia. Zapisz je jako **CSV** lub **XLSX** albo **Wyślij do TakeoffCraft**: plik ilości, który TakeoffCraft otwiera, aby wycenić rośliny (obok ilości nawierzchni twardych i nawadniania).

## IFC

Więcej › {{ui:Eksportuj IFC krajobrazu}} zapisuje krajobraz jako plik IFC (IFC 4.3), który może zawierać model BIM: każda roślina jako `IfcGeographicElement` typu VEGETATION, z typem według gatunku i właściwościami rośliny (nazwa botaniczna, rozmiary, mrozoodporność, woda, światło), każda rabata i żywopłot jako jeden element z liczbami, na terenie. BimCraft otwiera go obok budynku.
