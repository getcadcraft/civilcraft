---
title: Import punktów pomiarowych
summary: Otwórz plik CSV lub tekstowy z punktami, sprawdź kolejność kolumn w oknie Import punktów, popraw wiersze, których nie da się odczytać, i rozdziel punkty na grupy.
keywords: import punktów, csv, txt, pnezd, penzd, plik punktów, pomiar, punkty cogo, grupy punktów, kolumny, północ, wschód
from: ad33d88a
---

Plik punktów to plik tekstowy z jednym punktem w wierszu: numer punktu, północ, wschód, rzędna i opis w dowolnej kolejności, oddzielone przecinkami, tabulatorami, średnikami lub spacjami. CivilCraft odczytuje go w przeglądarce i od razu buduje z niego powierzchnię.

## Zanim zaczniesz

- Znaj kolejność kolumn w pliku, jeśli to możliwe (PNEZD i PENZD wyglądają dla komputera tak samo).
- Znaj jego jednostki. CivilCraft ich nie przelicza: ustaw **Jednostki** w lewym panelu tak, aby pasowały do pliku (zob. [Jednostki, kilometraże i formaty liczb](topic:units-and-stations)).
- Współrzędne mogą być duże (północ i wschód w państwowych współrzędnych płaskich, liczone w milionach, są w porządku).

## Importuj plik

1. Kliknij {{ui:Otwórz}} na pasku narzędzi albo naciśnij {{key:Mod+O}}, i wybierz plik. Można też przeciągnąć go na plan.
   Otwiera się okno **Import punktów** z nazwą pliku, listą **Kolumny** ustawioną na {{ui:Wykryj}}, wierszem podsumowania i pierwszymi sześcioma punktami.
2. Przeczytaj wiersz podsumowania. Mówi on, ile punktów odczytano, w jakiej kolejności kolumn, jak ta kolejność została ustalona i co rozdziela kolumny. Są trzy sposoby ustalania kolejności:
   - "z wiersza nagłówka": pierwszy wiersz nazywa kolumny (Point, Northing, Easting, Elevation, Description albo X, Y, Z …). To najbezpieczniejsze.
   - "wybrana": kolejność została wybrana w **Kolumny**.
   - "zgadnięta na podstawie liczby kolumn i ustawienia wierszy punktów (PNEZD) — sprawdź, czy północ i wschód nie są zamienione": nie było użytecznego nagłówka. Jeśli pliki zwykle zaczynają się od wschodu, ustaw **Wiersze punktów** na P, E, N, Z, D w [ustawieniach CivilCraft](topic:settings).
3. Sprawdź tabelę podglądu. Jej kolumny to zawsze **Punkt**, **Północ**, **Wschód**, **Rzędna**, **Opis**, niezależnie od kolejności w pliku. Północ i wschód rzeczywistego terenu zwykle mają wyraźnie różne wielkości: jeśli wyglądają na zamienione, zgadywanie było błędne.
4. Jeśli kolejność jest zła, wybierz właściwą w **Kolumny** (na przykład {{ui:PENZD — punkt, wschód, północ, rzędna, opis}}). Podsumowanie i podgląd zaktualizują się od razu.
5. Poniżej podglądu znajdziesz **Wiersze nieodczytane**. Każdy wiersz podaje numer linii w pliku, przyczynę i początek wiersza. Zob. [Wiersze, których nie odczytano](topic:import-points#rows-that-are-not-read).
6. Kliknij {{ui:Import}}.
   Punkty pojawiają się na planie, widok przybliża się do nich, a powierzchnia zostaje zbudowana. Pasek stanu pokazuje na przykład: "Zaimportowano 276 punktów z pliku site.csv; powierzchnia: 546 trójkątów."

Jeśli projekt nie miał jeszcze nazwy, przyjmuje nazwę pliku.

## Sprawdź grupy

Każdy punkt należy do grupy nazwanej od **pierwszego słowa jego opisu**, wielkimi literami: „GRD”, „FL 12” i „fl” to grupy GRD, FL i FL. Punkty bez opisu trafiają do grupy „(brak opisu)”.

1. Spójrz na tabelę pod **Punkty** w lewym panelu: grupa, liczba punktów i wybór **Powierzchnia**.
2. Każda grupa zaczyna jako {{ui:Punkty}}. Zmień linie spadkowe, krawędzie nawierzchni, krawędzie górne i dolne skarp, grzbiety i podobne kodowane linie na {{ui:Linia przełamania}}. Grupy, które nie mają kształtować terenu (punkty kontrolne, wierzchołki drzew, słupy uzbrojenia mierzone na szczycie), ustaw na {{ui:Pominięte}}.
3. Kliknij punkt na planie (narzędziem {{ui:Zaznacz}}), aby zobaczyć jego numer, współrzędne, rzędną, opis i grupę w prawym panelu.

:::warning
Grupa linii przełamania łączy **wszystkie** swoje punkty w **jedną** linię, w kolejności numerów punktów. Działa to, gdy każda kodowana linia została zmierzona po kolei z własnym kodem. Dwie osobne linie spadkowe oznaczone kodem „FL” staną się jedną linią zygzakiem między nimi. Jeśli kody są wspólne, użyj narzędzia {{ui:Linia przełamania}}, aby kliknąć punkty każdej linii (zob. [Budowanie i doskonalenie powierzchni](topic:build-surface)).
:::

## Wiersze, których nie odczytano

| Pokazany powód | Co to znaczy | Co zrobić |
|---|---|---|
| "północ lub wschód nie jest liczbą" | Kolumna współrzędnej zawiera tekst | Sprawdź kolejność kolumn albo przypadkowy wiersz tekstowy w środku pliku |
| "rzędna nie jest liczbą" | Kolumna rzędnej zawiera tekst | Zła kolejność kolumn albo opis w kolumnie rzędnej |
| "brak numeru punktu" | Kolumna punktu jest pusta | Ponumeruj punkt albo wybierz kolejność bez P (NEZD, NEZ …): wtedy punkty są numerowane 1, 2, 3 … |
| "punkt 12 występuje dwa razy (pierwszy zostaje)" | Dwa wiersze mają ten sam numer | Zmień numer jednego z nich w pliku, jeśli oba są prawdziwymi pomiarami |
| "3 kolumny, oczekiwano 5 (PNEZD)" | Wiersz jest za krótki | Przerwana linia albo zła kolejność kolumn |

Punkt z pustą rzędną zostaje, ale nie jest używany w powierzchni. **Dane o punktach** pokazują, ile punktów ma rzędną.

Wiersze zaczynające się od `#`, `;` lub `//` są komentarzami i są pomijane. Puste wiersze również są pomijane.

## Zastąp lub dodaj punkty

Ponowny import **zastępuje** wszystkie punkty; nie dodaje ich do istniejących. Osie tras, place, rurociągi, narysowane linie przełamania i granica pozostają bez zmian. Historia cofania zostaje wyczyszczona, więc zapisz najpierw projekt, jeśli możesz chcieć przywrócić stare punkty. Aby połączyć dwa pliki, złącz je w edytorze tekstu lub arkuszu przed importem (uważaj na powtarzające się numery punktów).

Punktów nie można jeszcze przesuwać, edytować ani usuwać w CivilCraft. Popraw je w pliku i zaimportuj ponownie.

## Powiązane

- [Formaty plików punktów](topic:point-file-formats): wszystkie kolejności kolumn i sposób rozpoznawania nagłówków.
- [Budowanie i doskonalenie powierzchni](topic:build-surface).
