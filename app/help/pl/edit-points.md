---
title: Edycja punktu pomiarowego
summary: Zmień numer, współrzędne, rzędną lub opis jednego punktu albo przeciągnij go w nowe miejsce na rzucie.
keywords: edycja punktu, przesuń punkt, zmień rzędną, zmień numer, numer punktu, opis, przeciągnij, północ, wschód, napraw punkt, zepsuty pomiar
from: 375ae2e9
---

Zepsuty pomiar, zła wysokość tyczki, źle wpisany opis: popraw jeden punkt, a powierzchnia pójdzie za nim.

## Zmiana wartości punktu

1. Narzędziem {{ui:Zaznacz}} kliknij punkt na rzucie. **Właściwości** pokazują jego numer, wschód, północ, **Rzędną** i opis w polach.
2. Wpisz nową wartość i naciśnij {{key:Enter}} (albo kliknij poza polem). Zostaw pole **Rzędna** puste dla punktu bez rzędnej.
3. Powierzchnia, warstwice i wszystko, co na nich zbudowano, zaktualizują się od razu.

Każda zmiana to jeden krok: {{key:Mod+Z}} ją cofa, a {{key:Mod+Y}} ją ponawia. Wartość, której CivilCraft nie może użyć (numer, który ma już inny punkt, litery we współrzędnej), zostaje odrzucona: pole zostaje obramowane, a pasek stanu podaje powód.

Nowy kod opisu tworzy nową grupę punktów, tak jak robi to import (zob. [Budowa powierzchni](topic:build-surface)).

## Przesunięcie punktu na rzucie

1. Zaznacz punkt (dostaje pierścień).
2. Przeciągnij pierścień. Pasek stanu pokazuje wschód i północ, dokąd punkt trafi.
3. Puść, aby przesunąć; jego rzędna pozostaje. Naciśnij {{key:Esc}} przed puszczeniem, aby go przywrócić.

## Linie przełamania podążają za punktem

Linia przełamania narysowana narzędziem {{ui:Linia przełamania}} kopiuje punkty, przez które przechodzi. Gdy przesuniesz punkt albo zmienisz jego rzędną, narożniki linii przełamania na nim przesuwają się razem z nim, w tym samym kroku. Grupy linii przełamania utworzone z opisów są zawsze przebudowywane z punktów.

:::note
Powierzchnia odczytana z pliku LandXML zachowuje własne trójkąty: edycje punktów zmieniają ją dopiero po użyciu {{ui:Przebuduj powierzchnię z punktów}}.
:::
