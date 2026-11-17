---
title: Zbuduj i popraw powierzchnię
summary: Jak CivilCraft tworzy triangulację istniejącego gruntu i jak go kształtować grupami linii przełamań, narysowanymi liniami przełamań, zewnętrzną granicą i najdłuższą zewnętrzną krawędzią.
keywords: tin, powierzchnia, triangulacja, linia przełamania, granica, istniejący grunt, eg, utwórz powierzchnię, delaunay, trójkąty, maks. krawędź, zewnętrzna granica
from: b9eea3f3
---

CivilCraft ma jedną istniejącą powierzchnię gruntu na projekt. Jest to TIN (nieregularna siatka trójkątów) zbudowana z Twoich punktów, a przebudowuje się automatycznie przy każdej zmianie danych wejściowych. Nie ma polecenia „przebuduj” ani nieaktualnej powierzchni.

## Co wchodzi do powierzchni

- Każdy punkt z rzędną w grupie ustawionej na {{ui:Punkty}}.
- Każda grupa ustawiona na {{ui:Linia przełamania}}, połączona w kolejności numerów punktów.
- Każda linia przełamania narysowana narzędziem {{ui:Linia przełamania}}.
- Zewnętrzna granica, jeśli ją narysujesz.
- Ustawienie **Najdłuższa zewnętrzna krawędź**.

Trójkąty nigdy nie przecinają linii przełamania: powierzchnia jest zmuszana, by nią biegła, a potem wyrównywana tak równomiernie, jak to możliwe wokół niej (wszędzie indziej Delaunay).

## Zamień kodowane linie w linie przełamań

1. W lewym panelu, pod **Punkty**, znajdź grupę (na przykład FL).
2. Ustaw jej wybór **Powierzchnia** na {{ui:Linia przełamania}}.
   Powierzchnia się przebuduje, linia zostanie narysowana na pomarańczowo (przy włączonych {{ui:Linie przełamań}} w **Wyświetlanie**), a **Linie przełamań** w danych powierzchni wzrośnie o jeden.
3. Sprawdź linię w planie. Musi biec punkt po punkcie w kolejności, w jakiej została zmierzona. Jeśli jest zygzakowata, grupa zawiera więcej niż jedną linię albo punkty nie są ponumerowane po kolei: ustaw grupę z powrotem na {{ui:Punkty}} i narysuj linie ręcznie (następna sekcja).

## Narysuj linię przełamania przez punkty

1. Naciśnij {{key:B}} albo kliknij {{ui:Linia przełamania}} w grupie **Powierzchnia**.
   Podpowiedź brzmi: „Linia przełamania: wskaż punkty pomiarowe po kolei (pobiera ich rzędne). Enter kończy.”
2. Przesuń wskaźnik blisko punktu. Mały pomarańczowy kwadrat oznacza punkt, który zostanie wzięty.
3. Wskazuj punkty linii jeden po drugim. Każde kliknięcie podaje nazwę punktu i jego rzędną w pasku stanu.
4. Naciśnij {{key:Enter}}, aby zakończyć.
   Pasek stanu mówi: „Dodano linię przełamania 1; powierzchnia została przebudowana.”

Kliknięcia muszą trafiać w punkt pomiarowy z rzędną; kliknięcie gdzie indziej jest odrzucane z komunikatem „Wskaż punkt pomiarowy z rzędną: linia przełamania pobiera rzędne punktów.” {{key:Backspace}} usuwa ostatni punkt; {{key:Esc}} anuluje całą linię.

:::warning
Zakończ klawiszem {{key:Enter}}. Podwójne kliknięcie też kończy, ale w tej wersji usuwa punkt, w który kliknąłeś dwukrotnie. Kliknij ostatni punkt raz, a potem naciśnij {{key:Enter}}.
:::

Aby usunąć naraz wszystkie narysowane linie przełamań, kliknij {{ui:Usunięcie narysowanych linii przełamań}} w sekcji **Powierzchnia**. Aby usunąć tylko ostatnią, użyj {{key:Mod+Z}}. Narysowanych linii przełamań nie można jeszcze zaznaczać ani edytować pojedynczo.

## Narysuj zewnętrzną granicę

Granica przycina powierzchnię do obszaru, któremu ufasz, na przykład granic pomiaru, tak aby długie trójkąty przez niezmierzone narożniki zniknęły.

1. Naciśnij {{key:O}} albo kliknij {{ui:Granica}}.
2. Wskazuj narożniki po kolei wokół obszaru. Przerywana linia pokazuje kształt.
3. Naciśnij {{key:Enter}}.
   Pasek stanu mówi: „Granica ustawiona; trójkąty poza nią zostały usunięte.” **Granica** w danych powierzchni mówi „Tak” i podaje liczbę narożników.

Warto wiedzieć:

- Jest jedna granica. Narysowanie kolejnej zastępuje poprzednią. {{ui:Usuń granicę}} ją usuwa.
- Może tylko odejmować: granica sięgająca poza punkty jest przycinana do ich obrysu, z uwagą „Granica sięga poza punkty; została przycięta do ich obrysu.”
- Jej narożniki biorą rzędne z powierzchni, więc krawędź dokładnie podąża za terenem.
- Granice ukryte (wewnętrzne) nie są jeszcze dostępne.

## Przytnij długie zewnętrzne trójkąty

Bez granicy powierzchnia wypełnia cały obrys punktów, łącznie z długimi, cienkimi trójkątami przez wklęsłe krawędzie.

1. W **Powierzchnia** wpisz długość w **Najdłuższa zewnętrzna krawędź** i naciśnij {{key:Enter}}. Zacznij od około dwóch-trzech razy typowego odstępu między pomiarami.
2. Zewnętrzne trójkąty, których zewnętrzna krawędź jest dłuższa, są usuwane, idąc do środka, aż każda zewnętrzna krawędź będzie dostatecznie krótka. Krawędź będąca linią przełamania nigdy nie jest usuwana.
3. Wpisz 0, aby znów zachować każdy trójkąt.

## Odczytaj raport powierzchni

Pod danymi powierzchni pole wypisuje, co zrobił budowniczy. Z ochrową belką po lewej stronie to informacja; z czerwoną belką zawiera błąd i nie ma powierzchni.

| Komunikat | Znaczenie |
|---|---|
| „3 punkty leżały w tym samym miejscu co inny i połączyły się z nim.” | Punkty bliższe niż 0.0001 w planie stały się jednym wierzchołkiem (pierwszy zostaje). |
| „2 miejsca mają dwie różne rzędne …” | Punkty leżące jeden na drugim albo przecinające się linie przełamań różnią się wysokością. Wygrywa rzędna linii przełamania, potem pierwsza. |
| „1 odcinek linii przełamania nie mógł zostać wciśnięty w powierzchnię.” | Bardzo krótki albo prawie nakładający się odcinek linii przełamania się nie zmieścił; sprawdź to miejsce. |
| „Powierzchnia wymaga co najmniej trzech punktów z rzędnymi.” | Za mało punktów: sprawdź kolejność kolumn i grupy. |
| „Punkty leżą wszystkie na jednej linii: brak trójkątów.” | Punkty nie mają szerokości, na przykład pojedyncza linia ciągu poligonowego. |
| „Granica nie nachodzi na punkty.” | Granica jest gdzie indziej, często przez pomyłkę jednostek albo układu współrzędnych. |
| „Wewnątrz granicy nie zostały żadne trójkąty.” | Granica jest za mała albo źle umieszczona. |

## Powierzchnia odczytana z LandXML

Gdy otwierasz LandXML, jego pierwsza powierzchnia TIN jest używana bez zmian: nagłówek **Powierzchnia** mówi „Powierzchnia (z LandXML)”, a **Najdłuższa zewnętrzna krawędź** jest wyszarzona. Dopóki ta powierzchnia jest w użyciu, grupy linii przełamań, narysowane linie przełamań i nowa granica jej nie zmieniają. Aby zbudować powierzchnię z punktów pliku, kliknij {{ui:Przebuduj powierzchnię z punktów}}. {{key:Mod+Z}} przywraca powierzchnię z LandXML.

## Powiązane

- [Odczytaj warstwice, rzędne i spadki](topic:contours).
- [Importuj punkty pomiarowe](topic:import-points).
