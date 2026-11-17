---
title: Sprawdź eksport IFC względem IDS klienta
summary: Wczytaj plik .ids, który dał Ci klient lub zarząd drogi, i zobacz w Problemach każdy wyeksportowany element, który go nie spełnia.
keywords: ids, specyfikacja dostarczania informacji, buildingsmart, wymagania, dostarczenie, sprawdzanie, walidacja, qa, eksport ifc, ifc 4.3, trasa, droga, zamówienia publiczne
from: 183d9a0e
---

## Co zrobisz

IDS (Information Delivery Specification, norma buildingSMART) to lista tego, co musi zawierać IFC. Zamówienia publiczne często przysyłają ją razem z zadaniem. CivilCraft sprawdza IFC eksportowany z tego projektu, w wersji IFC wybranej do eksportu, względem tej listy i wypisuje każdy element, który nie spełnia wymagań.

## Kroki

1. Otwórz swój projekt.
2. Kliknij {{ui:IFC}} w grupie **Eksport** na pasku narzędzi. W oknie wybierz wersję IFC, którą dostarczysz.
3. Kliknij {{ui:Sprawdź względem IDS…}}.
4. Kliknij {{ui:Wczytaj plik .ids…}} i wskaż plik. Nic nie jest przesyłane.
5. Odczytaj wynik: każda specyfikacja z {{ui:Spełnia}} albo {{ui:Nie spełnia}} i liczbą elementów, których dotyczy.
6. Otwórz Problemy ({{key:Ctrl+Shift+M}}) i kliknij błąd, aby zaznaczyć trasę, plac, rurociąg, konstrukcję albo bryłę zabudowy, z której pochodzi.

## Co powinieneś zobaczyć

- Jedno ostrzeżenie na każdy wyeksportowany element i wymaganie, którego brakuje, z nazwą specyfikacji, tym, czego żąda IDS, i tym, co ma eksport.
- Raport sprawdzenia (w Problemach) zaczyna się od IDS: tytuł, wersja, autor i liczby dla każdej specyfikacji.

## Warto wiedzieć

- IDS jest zapisywany w pliku projektu, więc jest sprawdzany ponownie przy otwarciu projektu. Wczytanie go albo zapomnienie o nim to jeden krok, który możesz cofnąć.
- Każda zmiana jest sprawdzana ponownie chwilę później. Duże powierzchnie zapisują się dłużej, więc wtedy sprawdzenie czeka trochę dłużej między przebiegami.
- Sprawdzenie korzysta z tego samego pliku, który zapisuje eksport {{ui:IFC}}, w wersji wybranej tam ostatnio (IFC 4.3, gdy nie wybrano żadnej).
- Liczby są porównywane w jednostkach SI: projekt w stopach jest najpierw przeliczany na metry.

- Wzorce w IDS są odczytywane jako cała wartość. Znak `^` na początku i `$` na końcu są również traktowane jako „cała wartość”, tak jak większość plików IDS je rozumie.

## Dalej

- [Eksportuj IFC](topic:ifc)
