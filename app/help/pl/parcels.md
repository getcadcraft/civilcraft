---
title: Rysowanie działek i opisów prawnych
summary: Narysuj działkę po jej narożnikach albo wpisz odcinki z aktu lub mapy, sprawdź, jak dobrze odcinki się domykają, podpisz kierunki i odległości na planie, zamień dowolny odcinek w łuk i skopiuj roboczy opis prawny.
keywords: działki, parcele, granice, akt, mapa, opis granic, kierunek, odległość, domknięcie, błąd domknięcia, dokładność, opis prawny, punkt początkowy, łuk, promień, pole, akry
from: 6793d6ce
---

Działki leżą na planie z kierunkiem i odległością wzdłuż każdego prostego odcinka (łuk pokazuje promień, długość i kąt środkowy), a ich nazwa i pole pojawiają się w środku. Trafiają do wydruku PDF oraz eksportów DWG i DXF, na warstwach `V-PROP` (linie) i `V-PROP-TEXT` (etykiety). Wszystko znajduje się pod **Działki** w prawym panelu, gdy nic nie jest zaznaczone.

## Narysuj działkę

1. Kliknij **Narysuj działkę**.
2. Klikaj narożniki, zaczynając od punktu początkowego. Kliknięcie w pobliżu punktu pomiarowego przejmuje jego dokładne położenie.
3. Kliknij pierwszy narożnik ponownie lub naciśnij {{key:Enter}}, aby zakończyć. {{key:Backspace}} cofa ostatni narożnik; {{key:Esc}} porzuca dotychczasowe narożniki; naciśnij go ponownie, aby wyjść z narzędzia.

## Wpisz odcinki z aktu

1. Kliknij **Wpisz odcinki z aktu**.
2. Podaj, skąd zaczynają się odcinki: numer punktu pomiarowego albo północną i wschodnią współrzędną.
3. Wpisz lub wklej odcinki, po jednym w wierszu:
   - odcinek: kierunek i odległość, na przykład `N 45°30'15" E 125.50`. Działają też `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` oraz azymuty (`AZ 45°30'15"`); słowa „thence” i „feet” oraz przecinki są ignorowane.
   - łuk: `C R 300 L 52.36 right` (promień i długość łuku) lub `C R 300 D 10°00'00" left` (promień i kąt środkowy). Łuk następuje po odcinku przed nim; jeśli nie, dodaj jego kierunek cięciwy: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` zaczyna wiersz komentarza.
4. Podczas pisania okno pokazuje długość odcinków, **błąd domknięcia** (jak daleko od początku kończą się i w którą stronę), **dokładność** (długość podzielona przez błąd domknięcia, np. 1 : 10,000) oraz pole. Wiersze, których nie może odczytać, są wypisane z numerami wierszy.
5. **Dodaj działkę**. Gdy odcinki się nie domykają, działka zamyka się prostym odcinkiem przez lukę: sprawdź odcinki z aktem. Aby rozłożyć błąd ciągu poligonowego terenu na jego odcinki, najpierw go wyrównaj.

## Łuki

We **Właściwościach** działki każdy odcinek ma **Promień**. Wpisz promień, aby zamienić ten odcinek w łuk między tymi samymi dwoma narożnikami (promień mniejszy niż połowa odległości między narożnikami nie może dotrzeć, więc jest odrzucany), i wybierz **Prawo** lub **Lewo** w **Łukach**: łuk w prawo ma środek po prawej stronie kierunku ruchu, jak w akcie. Wyczyść promień, aby odcinek znów był prosty. Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa.

## Opis prawny

Właściwości działki kończą się jej opisem prawnym, zapisanym z rysunku:

- „Zaczynając w” **Punkt początkowy**, który wpiszesz (na przykład „północno-wschodni narożnik działki 4”), a w przeciwnym razie północna i wschodnia współrzędna pierwszego narożnika albo punkt pomiarowy, od którego zaczęły się odcinki.
- „następnie” każdy odcinek: kierunek i odległość, albo łuk z jego promieniem, długością łuku, kątem środkowym oraz kierunkiem i odległością cięciwy.
- „Obejmująca” jej pole w stopach kwadratowych i akrach (w projekcie w metrach: metry kwadratowe i hektary).

**Kopiuj** umieszcza go w schowku; **Pobierz jako tekst** zapisuje go jako plik `.txt`.

:::warning
Opis prawny to roboczy szkic z rysunku, a nie pomiar geodezyjny. Licencjonowany geodeta musi go sprawdzić z dokumentacją i podpisać, zanim ktokolwiek na nim polega.
:::

Kliknij wewnątrz działki na planie, aby ją zaznaczyć; {{key:Delete}} ją usuwa. Działki są zapisywane w pliku projektu.
