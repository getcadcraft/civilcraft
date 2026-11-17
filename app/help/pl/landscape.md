---
title: Obszar roboczy Krajobraz
summary: Plany nasadzeń, niwelacja, nawierzchnie, mury, schody, nawadnianie i arkusze krajobrazowe na tym samym terenie, z tymi samymi powierzchniami i w tym samym pliku co prace drogowe i inżynierskie.
keywords: krajobraz, architektura krajobrazu, ogród, nasadzenia, rośliny, drzewa, niwelacja, nawierzchnie utwardzone, nawadnianie, zraszacze, obszar roboczy, projekt terenu, plan krajobrazu
from: eea929d1
---

Obszar roboczy Krajobraz dodaje narzędzia do projektowania krajobrazu do terenu CivilCraft, który już masz: te same punkty pomiarowe, ten sam istniejący teren, tę samą projektowaną powierzchnię i ten sam plik projektu.

## Otwieranie

Wybierz {{ui:Powierzchnia}} › {{ui:Więcej}} › {{ui:Obszar roboczy Krajobraz}}. Pasek narzędzi pokaże wtedy wybór **Obszar roboczy** oraz grupę **Krajobraz**, a grupy Powierzchnia, Projekt i GIS zejdą z drogi. Aby wrócić, wybierz **Drogowy** w polu Obszar roboczy. CivilCraft pamięta, którego obszaru roboczego używałeś ostatnio na tym komputerze.

Lewy panel zyskuje u góry trzy sekcje:

- **Rośliny**: lista roślin, do przeszukiwania i wyboru tego, co umieszczasz. Zobacz [Listę roślin](topic:plant-list).
- **Sprawdzenia niwelacji**: analiza spadków, strzałki spływu i zastoiny wody. Zobacz [Niwelację](topic:landscape-grading).
- **Nawadnianie**: zraszacze i rury, które umieszczasz dalej, oraz ustawienia zasilania wody. Zobacz [Nawadnianie](topic:irrigation).

## Co jest w grupie Krajobraz

| Narzędzie | Co robi | Temat |
|---|---|---|
| **Roślina**, **Rabata**, **Żywopłot** | Pojedyncze rośliny, rabaty wypełniane w rozstawie roślin, żywopłoty wzdłuż linii | [Nasadzenia](topic:planting) |
| **Niwelacja** | Platformy, wały ziemne, rowy chłonne, obszary niwelacji z rzędnymi punktowymi i warstwicami, sprawdzenia spadków i spływu | [Niwelacja](topic:landscape-grading) |
| **Nawierzchnie utwardzone** | Nawierzchnie, ścieżki, mury, krawężniki, rampy i schody, które podążają za terenem | [Nawierzchnie utwardzone](topic:hardscape) |
| **Obszary** | Obszary roślinne: trawniki, rabaty, łąki i okrywy z zabudową, przycinane wokół nawierzchni | [Obszary roślinne](topic:planted-areas) |
| **Rzędne** | Modyfikatory terenu w kolejności z wykopem i nasypem, rzędne punktowe, strzałki spadku, linie przekroju | [Modyfikatory terenu](topic:ground-modifiers), [Przekroje](topic:landscape-sections) |
| **Nawadnianie** | Zraszacze, rury, zawory, linie kroplujące, zasilanie, zasięg i kontrola hydrauliczna | [Nawadnianie](topic:irrigation) |
| **Więcej** | Z linii (obiekty powiązane z liniami rysunku), zestawienie roślin, tabela roślin, zestawienia, grafika roślin, obiekty swobodne, arkusze krajobrazowe i zestaw publikacji, eksport IFC, rozmiar i etykiety roślin | [Obiekty z linii](topic:objects-from-lines), [Rekordy roślin](topic:plant-records), [Zestawienia](topic:worksheets), [Arkusze krajobrazowe](topic:landscape-sheets), [Obiekty swobodne](topic:freeform-objects) |

Wszystko, co dodasz, to jeden krok cofnięcia, jest zapisywane w pliku projektu i rysuje się na planie w warstwach o nazwach `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` i `L-IRRG-…`, więc eksporty DXF, DWG i PDF też je zawierają.

## Jedna powierzchnia dla wszystkiego

Platformy, wały ziemne, rowy chłonne, obszary niwelacji, nawierzchnie i ścieżki są wyrównywane do **projektowanej powierzchni**, tej samej, z której korzystają korytarze i place. **Istniejący teren** nigdy się nie zmienia. Rośliny stoją na gruncie, który jest pod nimi, więc przemieszczają się, gdy zmienia się niwelacja. Roboty ziemne uwzględniają niwelację krajobrazu razem ze wszystkim innym.

:::tip
Nowy w tym? [Zaprojektuj ogród od początku do końca](topic:landscape-walkthrough) przechodzi przez cały obszar roboczy na przykładowej działce.
:::
