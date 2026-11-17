---
title: Problemy i BCF
summary: Przypnij problem do planu, staja trasy, punktu powierzchni lub rury, nadaj mu status i komentarze, i wymieniaj problemy jako pliki BCF 2.1 obok pliku LandXML.
keywords: problem, problemy, bcf, komentarz, adnotacja, usterka, defekt, plac budowy, pinezka, status, otwarty, rozwiązany, zamknięty, bim collaboration format, landxml, problemy
from: e44153b1
---

Problem to notatka przypięta do miejsca w Twoim rysunku CivilCraft, z tytułem, statusem i komentarzami. Użyj jej, aby powiedzieć pracownikom placu budowy lub innemu programowi, na co mają zwrócić uwagę, i odczytać ich odpowiedzi.

## Dodawanie problemu

1. Otwórz **Powierzchnia, Więcej, Problemy (BCF)...**
2. Wpisz tytuł i opis tego, co jest nie tak.
3. Wybierz, gdzie go przypiąć: środek widoku planu, punkt powierzchni w środku, staj wybranej trasy (wpisz staj i odsunięcie, w prawo jest dodatnie) albo wybraną rurę, budowlę lub linię charakterystyczną.
4. Naciśnij **Dodaj problem**. Pinezka pojawi się na planie jako mały romb z numerem.

Kliknij tytuł problemu, aby go powiększyć, zmień jego status na liście (Otwarty, Aktywny, Rozwiązany, Zamknięty) i dodaj komentarze. Każda zmiana to jeden krok cofnięcia, a problemy są zapisywane w pliku projektu.

## Wymiana problemów w formacie BCF

- **Eksportuj BCF** zapisuje plik BCF 2.1 z jednym tematem na problem: tytuł, status, komentarze oraz jeden widok z ortogonalną kamerą planu i pinezką.
- **Importuj BCF** odczytuje plik BCF (pliki 2.0 i 3.0 są odczytywane w zakresie zgodnym z 2.1). Temat z identyfikatorem guid, który już masz, aktualizuje ten problem (status, nowe komentarze) zamiast dodawać drugi.
- **Z problemów** tworzy problem z każdej otwartej pozycji w panelu Problemy, która podaje, gdzie się znajduje.

BCF przechowuje metry we współrzędnych tego projektu, bez przesunięcia. Drugi program musi używać tego samego układu współrzędnych co Twój plik LandXML, aby pinezki trafiły we właściwe miejsce. Element, na który wskazuje pinezka (trasa, staj, odsunięcie, rura), jest przekazywany jako etykiety zaczynające się od „cc:”, które CivilCraft odczytuje z powrotem.

## Czego nie sprawdzono

Pinezki i widoki zostały przetestowane tylko przez zapisanie pliku i odczytanie go z powrotem w CivilCraft. Żaden inny program BIM jeszcze ich nie otworzył, a to, czy w BCF „view to world scale” oznacza pełną, czy połowiczną wysokość widoku, różni się między programami: CivilCraft zapisuje pełną wysokość.
