---
title: Klucze opisów i kody linii
summary: Zamieniaj kody terenowe na grupy punktów z opisami i łącz kodowane punkty w linie (początek, koniec, zamknięcie), które stają się liniami przełamań.
keywords: klucze opisów, kody terenowe, kody linii, figury, rysunek liniowy, początek, koniec, zamknij, grupy punktów, kody, kody pomiarowe, rejestrator danych, linie przełamań, krawężnik, krawędź nawierzchni
from: b3d1af8d
---

Ekipy pomiarowe kodują każdy pomiar w terenie: `EP` dla krawędzi nawierzchni, `TC` dla góry krawężnika, `BLDG` dla narożnika budynku. Kod to pierwsze słowo opisu punktu. CivilCraft grupuje punkty według niego i zamienia kody linii po nim w linie.

## Kody linii

Kod linii to słowo zaraz po kodzie terenowym:

| Opis | Znaczenie |
|---|---|
| `EP B` | Rozpocznij nową linię krawędzi nawierzchni w tym punkcie |
| `EP` | Kontynuuj bieżącą linię EP |
| `EP E` | Zakończ bieżącą linię EP w tym punkcie |
| `BLDG C` | Zamknij budynek: połącz ten punkt z pierwszym punktem linii |

Punkty z tym samym kodem są łączone w kolejności numerów. Różne kody to różne linie, nawet gdy należą do tej samej grupy, więc `EP1` i `EP2` dają dwie krawędzie naraz. Kod, który nigdy nie używa kodu linii, jest łączony przez wszystkie swoje punkty, jak w poprzednich wersjach.

Linie w grupie używanej jako **Linia przełamania** stają się liniami przełamań, po jednej na linię, więc krawężnik z przerwą nie jest rozciągany przez tę przerwę. Linie w innych grupach są rysowane na planie (warstwa V-NODE-LINE) i trafiają do DXF, DWG i PDF.

Słowa dla początku, końca i zamknięcia to `B`, `BEG`, `START`; `E`, `END`; oraz `C`, `CLO`, `CLOSE`. Zmień je albo wyłącz kody linii w oknie poniżej.

## Klucze opisów

Klucz opisu zamienia kod w grupę punktów, zastosowanie i długi opis.

1. Pod **Punkty** kliknij {{ui:Description keys and line codes}}.
2. Kliknij {{ui:Add a key}} i wypełnij wiersz:
   - **Kod**: kod terenowy do dopasowania. `*` oznacza dowolne znaki, a `?` jeden, więc `EP*` łapie EP, EP1 i EP12.
   - **Grupa**: grupa punktów, do której te punkty się dołączają (puste = sam kod). `EP*` z grupą `EP` umieszcza EP1 i EP2 w jednej grupie, choć pozostają oddzielnymi liniami.
   - **Zastosowanie**: Punkty, Linia przełamania lub Pomiń, dla momentu, gdy grupa pojawia się po raz pierwszy (albo zostaw to tabeli **Punkty**).
   - **Opis**: długa nazwa, pokazywana we **Właściwościach** punktu.
3. Kolumna **Punkty** liczy punkty, które każdy klucz łapie, gdy wpisujesz. Pierwszy klucz pasujący do kodu wygrywa.
4. Kliknij {{ui:Apply}}. Grupy, powierzchnia i plan podążają w jednym kroku: {{key:Mod+Z}} to cofa.

Grupa zachowuje zastosowanie, które jej nadałeś w tabeli **Punkty**; zastosowanie klucza ustawia je tylko dla nowej grupy. Klucze i kody linii są zapisywane w pliku projektu.
