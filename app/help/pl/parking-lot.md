---
title: Układ parkingu
summary: Rozmieść miejsca postojowe, przejazdy, miejsca dla niepełnosprawnych i furgonetek oraz wyspy wewnątrz obrysu, wyprofiluj plac ze spadkami do wpustów względem istniejącego terenu, a potem wykonaj nawierzchnię i nasadzenia. Dostępne także dla asystenta.
keywords: parking, plac, miejsce postojowe, przejazd, dostępne, ada, furgonetka, wyspa, wpust, spadek, niwelacja, wykop, nasyp, nawierzchnia, kostka, nasadzenia, drzewa, teren, chmura punktów, mcp, asystent
from: 06c14da9
---

Dopasuj parking do działki, placu lub zamkniętej linii elementu i uzyskaj liczby, niwelację oraz nawierzchnię w jednym kroku.

## Rozmieść

1. Zaznacz na planie działkę, plac lub zamkniętą linię elementu.
2. Otwórz **Powierzchnia, Więcej, Parking...**
3. Wybierz reguły, kąt miejsc (90, 75, 60, 45, 30 stopni lub równolegle) oraz przejazdy jednokierunkowe albo dwukierunkowe. Rozmiary miejsc, przejazdów i wysp startują z tabeli, a każdy można nadpisać wpisując własną wartość.
4. Wybierz **Rozmieść**.

Rzędy biegną wzdłuż tej krawędzi obrysu, która daje najwięcej miejsc (lub pod kątem, który wpiszesz). Miejsce liczy się tylko wtedy, gdy leży w całości wewnątrz obrysu. Tam, gdzie zostaje miejsce na jeden rząd i przejazd, dodawany jest pas jednostronny. Okno wylicza miejsca, miejsca dla niepełnosprawnych i furgonetek, wyspy, wpusty oraz powierzchnię na miejsce, a plan pokazuje miejsca postojowe, miejsca dla niepełnosprawnych z zakreskowanymi przejazdami dostępu, wyspy, osie przejazdów i wpusty na własnych warstwach (C-PARK-...), dzięki czemu trafiają do PDF, DXF i DWG.

## Miejsca dla niepełnosprawnych

Przy regułach Stanów Zjednoczonych liczba wynika z tabeli 208.2 ADA Standards 2010 dla zapewnionych miejsc (co szóste, zaokrąglone w górę, jest miejscem dla furgonetek), umieszczonych najbliżej pierwszego narożnika obrysu (wejścia), każde z przejazdem dostępu; dwa mogą dzielić jeden. Miejsce węższe niż szerokość dla niepełnosprawnych albo spadek stromszy niż 1:48 na miejscach dla niepełnosprawnych jest pokazywany jako problem. **Te liczby zostały wpisane z normy z pamięci i nie zostały sprawdzone z wydrukowaną normą.** Typowe rozmiary miejsc i przejazdów pochodzą z poradników projektowania parkingów i również nie zostały sprawdzone. Sprawdź oba oraz lokalne przepisy, zanim na nich polegasz. Wybierz **Niestandardowe**, aby wpisać własną liczbę miejsc dla niepełnosprawnych.

## Spadki do wpustów, wykop i nasyp

Jeśli tego nie wyłączysz, plac staje się obszarem niwelacji w obszarze roboczym Landscape. Wpusty umieszczane są na osiach przejazdów około co 100 stóp (30 m); powierzchnia wznosi się od każdego wpustu przy podanym spadku (na start 1,5 procent), więc każdy punkt spada do najbliższego wpustu. Poziom wybierany jest tak, aby wykop i nasyp placu zrównoważyły się na istniejącym terenie. Istniejący teren to istniejąca powierzchnia projektu, która może pochodzić z punktów pomiarowych, LandXML, chmury punktów z lidara lub skanu zamienionej na powierzchnię, albo z warstwic. Okno pokazuje szacunek wykopu i nasypu; dokładną wartość pokażą później objętości projektu. Obszar niwelacji zachowuje swoją krawędź na istniejącym terenie, więc jeśli nowa powierzchnia różni się od terenu przy krawędzi, powstaje uskok, a okno mówi, jak duży.

## Nawierzchnia i nasadzenia

Cały obrys dostaje nawierzchnię z kostki (wzór cegiełkowy, który można zmienić w Landscape, Hardscape), a każda wyspa dostaje klomb z krzewami i, jeśli jest dość szeroka, drzewo, wzięte z listy roślin. Po tym wszystko to zwykłe obiekty Landscape: edytuj je albo wybierz **Rozmieść ponownie**, aby zastąpić to, co plac wykonał. Usunięcie placu usuwa to, co wykonał.

## Od asystenta

Ten sam plac można zamówić przez MCP: `parking_layout` pokazuje podgląd, `parking_build` zapisuje, `parking_remove` usuwa plac. Zamawiaj według nazwy działki lub wyślij obrys.

## Czego nie ma

Nie jest sprawdzane, czy przejazdy dochodzą do ulicy. Nawierzchnia pokrywa cały obrys, więc jej powierzchnia obejmuje też wyspy. Wybory materiału nawierzchni z Biblioteki oraz typ z Biblioteki dla miejsc nie są zbudowane; wzór nawierzchni to wzór Hardscape. Przepisy innych krajów nie są zbudowane.
