---
title: Twoja biblioteka linii energetycznych
summary: Twórz własne przewody, kable podziemne, podpory, urządzenia i typy wykopów w kategoriach, które nazwiesz, i udostępniaj je jako pliki.
keywords: biblioteka, przewód, kabel, słup, podpora, traversa, izolator, osprzęt, odciąg, transformator, szafka, złącze, wykop, kategoria, csv, import, eksport
from: 88733744
---

Sekcja **Biblioteka** obszaru roboczego Linie energetyczne zawiera każdy element, którego może użyć linia lub kabel. Nic w niej nie jest powiązane z krajem ani producentem: tworzysz elementy, z którymi pracujesz.

## Trzy rodzaje elementów

| Rodzaj | Gdzie się znajduje | Czy można go zmienić? |
|---|---|---|
| **Przykłady** | Dostarczane z CivilCraft, z ogólnymi wartościami wyliczonymi z właściwości materiałów | Nie: najpierw {{ui:Kopiuj do mojej biblioteki}} |
| **W projekcie** | Przyszły z plikiem projektu, który otworzyłeś | Nie: najpierw {{ui:Kopiuj do mojej biblioteki}} |
| **Moje** | Twoje własne elementy, zachowane w tej przeglądarce | Tak, a zmiany zapisują się od razu |

Każdy projekt zachowuje kopię każdego używanego elementu, dzięki czemu projekt otwiera się na każdym komputerze z własnymi przewodami i słupami.

:::warning
Elementy przykładowe są przykładami: sprawdź każdą wartość z danymi dostawcy. Kable podziemne celowo nie mają obciążalności prądowej, ponieważ zależy ona od sposobu ułożenia kabla.
:::

## Utwórz element

1. W **Bibliotece** wybierz **Rodzaj** (przewody napowietrzne, kable podziemne, podpory, urządzenia lub typy wykopów).
2. Kliknij {{ui:Nowy element}} albo wybierz przykład i kliknij {{ui:Kopiuj do mojej biblioteki}} lub {{ui:Duplikuj}}.
3. Wypełnij jego pola. Pola oznaczone `*` to te, których potrzebują kontrole; element z brakującym polem jest oznaczony `!` i wymieniony w sekcji **Kontrole**, gdy używa go linia.
4. Nadaj mu **Kategorię**, z `/` między poziomami: `Napowietrzne/NN/Wiązkowe`, `Podpory/Beton/12 m`. Drzewo podąża za Twoimi kategoriami.

Czego potrzebuje każdy rodzaj:

| Rodzaj | Potrzebne do kontroli |
|---|---|
| Przewód napowietrzny | przekrój, średnica, masa na metr, wytrzymałość na zerwanie, moduł sprężystości, rozszerzalność cieplna |
| Kabel podziemny | żyły, przekrój, napięcie, średnica, rezystancja, obciążalność prądowa |
| Podpora | długość całkowita, obciążenie nominalne (przyjmowane w punkcie poniżej szczytu), głębokość w gruncie |
| Urządzenie | jego typ; obciążenie znamionowe dla traverse, osprzętu i odciągów; odstęp faz i spadek dla traverse; długość dla izolatorów; kąt dla odciągów |
| Typ wykopu | głębokość, szerokość, przykrycie kabli |

## Udostępnianie

- {{ui:Zapisz moją bibliotekę}} zapisuje wszystkie Twoje elementy jako jeden plik `.cclines.json`; {{ui:Otwórz bibliotekę…}} odczytuje go z powrotem (elementy o tym samym kluczu są zastępowane).
- {{ui:Zapisz jako CSV}} zapisuje rodzaj, który oglądasz, jako arkusz kalkulacyjny; {{ui:Otwórz bibliotekę…}} odczytuje z powrotem CSV tego rodzaju. Kolumny mogą być w dowolnej kolejności; plik rozdzielany średnikiem może używać przecinka dziesiętnego.
