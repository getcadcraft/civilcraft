---
title: Wykonaj raport tyczenia
summary: Zestaw paliki wzdłuż osi na kilometrażach i odsunięciach albo punkty pomiarowe w jej pobliżu, z kilometrażem, odsunięciem, współrzędnymi północną i wschodnią, rzędnymi projektowymi i terenu oraz wykopem lub nasypem, i zapisz raport jako CSV lub PDF.
keywords: tyczenie, raport tyczenia, palik, arkusz wykopów, arkusz niwelacji, kilometraż, odsunięcie, wykop, nasyp, rozplanowanie, tyczenie budowy, powykonawczy
from: d8a4e9f1
---

Wybierz oś trasy i kliknij **Raport tyczenia** w jej **Właściwościach**.

## Paliki na kilometrażach i odsunięciach

1. **Od** i **do**: kilometraże do wytyczenia (1+50 albo 150).
2. **co**: interwał. Paliki stawiane są co wielokrotność, na obu końcach oraz (przy zaznaczonym polu) tam, gdzie zaczynają się i kończą łuki osi.
3. **Odsunięcia**: w lewo i w prawo od osi, patrząc w stronę rosnącego kilometrażu: `12 L, 0, 12 R`, `L12 CL R12` albo `-12, 0, 12` (lewo to minus). Oś z korytarzem zaczyna od krawędzi nawierzchni i poboczy.
4. **Numeruj od** i **z prefiksem** nadają nazwy palikom: 1, 2, 3 albo S101, S102.

## Punkty pomiarowe w pobliżu osi

Wybierz **punkty pomiarowe w pobliżu osi** i jak blisko. Każdy punkt w tej odległości dostaje kilometraż i odsunięcie, projektową rzędną w tym miejscu oraz własną rzędną jako teren: to sprawdzenie punktów wytyczonych albo zmierzonych jako powykonawcze.

## Co mówi raport

| Kolumna | Co to jest |
|---|---|
| Punkt | Nazwa palika albo numer punktu pomiarowego |
| Kilometraż, Odsunięcie | Położenie wzdłuż osi: L lewo, R prawo |
| Północ, Wschód | Jego współrzędne |
| Rzędna projektowa | Powierzchnia zaprojektowanego korytarza w tym miejscu (od linii zrzutu do linii zrzutu), a jeśli jej nie ma, profil projektowy na osi |
| Rzędna terenu | Istniejąca powierzchnia w tym miejscu albo własna rzędna punktu pomiarowego |
| Wykop/nasyp | C, gdy teren jest powyżej projektu (ściąć), F, gdy poniżej (zasypać), z dokładnością do setnych |

Palik bez rzędnej projektowej (poza korytarzem albo na osi bez niej, poza osią) nie ma wykopu ani nasypu; okno podaje, ile ich jest.

## Zapisz

- **CSV**: wiersz tytułu, potem kolumny powyżej, plus wykop lub nasyp jako liczba ze znakiem (teren minus projekt) do arkuszy kalkulacyjnych i rejestratorów danych.
- **PDF**: strony tabeli na wybranym formacie papieru, jeden palik w wierszu, wykopy na pomarańczowo, nasypy na zielono, z tabliczką rysunkową jak w pozostałych arkuszach.

:::note
Paliki są wyliczane z projektu. Sprawdź je z zatwierdzonymi planami, zanim cokolwiek zostanie zbudowane.
:::
