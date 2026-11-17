---
title: Pliki analizy dla innego programu linii (.DON)
summary: Zapisz jedną linię napowietrzną jako plik analizy .DON albo odczytaj podpory z jednego z nich do nowej linii. Niesprawdzone w programie, który je odczytuje.
keywords: don, .don, plik analizy, xml, eksport, import, program linii napowietrznych, naciąg, canton
from: 1abc4d07
---

Niektóre programy do linii napowietrznych przechowują analizę w pliku `.DON` (tekst XML). CivilCraft może zapisać jedną linię jako taki plik i odczytać podpory z jednego z nich.

:::warning
**Niesprawdzone.** Zbudowaliśmy to na podstawie listy nazw pól formatu, którą udostępnił jeden z użytkowników, a nie na prawdziwym pliku, i nie otworzyliśmy naszych plików w programie, który je odczytuje. Otwórz plik tam i sprawdź każdą wartość, zanim na niej polegasz. Jeśli możesz udostępnić plik `.DON` (z usuniętymi danymi klienta), pomoże nam to to naprawić.
:::

## Zapisz plik analizy

1. Przypisz linii przewód i upewnij się, że ma wyniki (brak napisu „nie wyliczono” we Właściwościach).
2. {{ui:Więcej}} › {{ui:Zapisz plik analizy (.DON)…}}, wybierz linię, dodaj opis i numer zlecenia.
3. {{ui:Zapisz plik analizy}}.

Plik zawiera podpory linii (współrzędne, teren, wysokości, role, traversę, podporę zachowaną lub sugerowaną, obciążenia dla każdego przypadku obciążenia, fundament), jeden odcinek na każdy fragment między końcami martwymi (przewód, napięcie, rozpiętość miarodajna, przęsła, naprężenie i parametr łańcuchowy, największe naprężenie dla każdego przypadku obciążenia) oraz tabele naciągu. Długości są w metrach, siły w daN; tekst jest zapisywany w Latin-1, więc znak spoza tego zestawu staje się `?`.

## Odczytaj plik analizy

{{ui:Więcej}} › {{ui:Otwórz plik analizy (.DON)…}} odczytuje podpory do nowej linii. Przewód, podpory i traversy są dopasowywane do Twojej biblioteki po nazwie; to, czego nie znaleziono, zostaje do wybrania we Właściwościach.
