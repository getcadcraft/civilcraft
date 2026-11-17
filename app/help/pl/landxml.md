---
title: Wymiana LandXML
summary: Otwieraj LandXML z innego oprogramowania branży inżynierskiej jako nowy projekt, eksportuj punkty, powierzchnie, trasy, profile i sieć rurociągów jako LandXML 1.2 i wiedz, co nie przechodzi.
keywords: landxml, xml, import, eksport, wymiana, tin, powierzchnia, trasa, profil, sieć rurociągów, interoperacyjność, wymiana danych
from: 870d5ece
---

LandXML to otwarty format wymiany, który czyta i zapisuje większość programów branży inżynierskiej. CivilCraft odczytuje i zapisuje LandXML 1.2. Jeśli używałeś Civil 3D, jego okna importu i eksportu LandXML są najbliższym odpowiednikiem; tutaj nie ma wyborów do dokonania, a uwagi mówią, co zostało pominięte.

## Otwieranie pliku LandXML

1. Kliknij {{ui:Otwórz}} (albo naciśnij {{key:Mod+O}}) i wybierz plik `.xml` lub `.landxml` albo upuść go na plan.
2. Jeśli bieżący projekt ma niezapisane zmiany, CivilCraft najpierw pyta. Wybierz {{ui:Zapisz kopię}}, {{ui:Nie zapisuj}} lub {{ui:Anuluj}}.
3. Tworzony jest **nowy projekt**. Wiersz stanu mówi, co zostało odczytane, na przykład „Otwarto site.xml: 412 punktów, 2 powierzchnie, 3 trasy.”
4. Spójrz na pole pod **Powierzchnią**. Wypisuje ono wszystko, co zostało pominięte lub zmienione, na przykład:
   - „Otwarto tylko pierwszą powierzchnię („EG”); w pliku jest jeszcze 1.”
   - „Trasa „Ramp A” ma elementy, których CivilCraft jeszcze nie potrafi narysować (nie linie, łuki ani klotoidy); została pominięta.”
   - „Reguł sieci rurociągów nie było w pliku; w użyciu są symbole zastępcze — ustaw własne w **Projekcie**.”

Co trafia do czego:

| W pliku | W CivilCraft |
|---|---|
| Jednostki (Imperial lub Metric) | **Jednostki** projektu (stopy lub metry) |
| Nazwa projektu | Nazwa projektu **Name** |
| CgPoints | Punkty projektu; opis (lub kod) określa grupę |
| Pierwsza powierzchnia TIN | Istniejący teren, użyty bez zmian („Surface (from LandXML)”) |
| Każda trasa z linii, łuków i klotoid | Trasa z jej PI, promieniami i długościami spiral, odtworzona z łuków |
| Pierwszy profil projektowy każdej trasy | Jej profil projektowy, z parabolicznymi łukami pionowymi |
| Pierwsza sieć rurociągów | Sieć rurociągów, z jej wieńcami, dnami studzienek i rzędnymi dna |
| Linie charakterystyczne z linii i łuków | Linie charakterystyczne, łuki zachowane; z innego programu zaczynają jako **Only drawn** |

Pełna lista elementów i atrybutów jest w [LandXML: co jest odczytywane i zapisywane](topic:landxml-reference).

:::note
Powierzchnia odczytana z LandXML nie jest przebudowywana, gdy zmienisz grupy punktów lub rysujesz linie wymuszające. Kliknij {{ui:Przebuduj powierzchnię z punktów}} w sekcji **Powierzchnia**, by zbudować ją z punktów zamiast tego ({{key:Mod+Z}} przywraca powierzchnię z LandXML).
:::

## Eksport LandXML

1. Kliknij {{ui:LandXML}} w grupie **Eksport**.
2. Przeglądarka pobiera `<nazwa>.xml`. Wiersz stanu mówi, co zostało zapisane, na przykład „Wyeksportowano LandXML 1.2: 276 punktów, 2 powierzchnie, 1 trasa, sieć rurociągów. Place nie wchodzą tutaj w skład LandXML; wchodzi w niego powierzchnia zniwelowana.”

Plik zawiera:

- **Jednostki**: stopy geodezyjne USA albo metry.
- **CgPoints**: każdy punkt z numerem jako nazwą, opisem i grupą jako kodem.
- **Powierzchnie**: istniejący teren jako TIN z liniami wymuszającymi i zewnętrzną granicą jako danymi źródłowymi; a gdy place lub korytarze są niwelowane, drugą powierzchnię TIN o nazwie „Proposed”.
- **Trasy**: linie, łuki i klotoidy z ich kilometrażem, każda z profilem zawierającym istniejący teren próbkowany wzdłuż niej oraz profil projektowy (PVI i paraboliczne łuki), gdy ma co najmniej dwa PVI.
- **PipeNetworks**: konstrukcje z ich wieńcami, dnami studzienek i rzędną dna dla każdej rury oraz rury ze średnicą, długością i spadkiem.
- **PlanFeatures**: każda linia charakterystyczna jako linie i łuki z rzędną na każdym końcu oraz tym, do czego służy.

## Czego to nie przenosi

- Place i korytarze jako obiekty. Ich wynik jest w powierzchni „Proposed”.
- Trasy z błędami (na przykład nakładające się łuki): pomijane i liczone w komunikacie stanu.
- Rury bez obu rzędnych dna oraz sieci z mniej niż dwiema konstrukcjami.
- Wieniec pobrany z powierzchni jest zapisywany jako stały wieniec. Po ponownym otwarciu konstrukcja zachowuje tę liczbę, nawet jeśli powierzchnia się zmieni.
- Reguły sieci (najmniejszy spadek, przykrycie, różnica poziomów): LandXML nie ma dla nich miejsca.
- Ustawienia wyświetlania i wybory powierzchni dla grup punktów: zapisz projekt CivilCraft, by je zachować.

Przy otwieraniu CivilCraft nie odczytuje spiral innych niż klotoidy, powierzchni siatkowych, punktów odnoszących się tylko do innych punktów, działek, spiral w liniach charakterystycznych, dróg ani danych pomiarowych. Każde z nich jest wymienione w uwagach, nigdy nie jest zgadywane.

## Wymiana w obie strony

Aby przekazać pracę komuś, kto używa innego oprogramowania branży inżynierskiej, i odebrać ją z powrotem, wyeksportuj LandXML, pozwól mu go edytować i otwórz jego LandXML jako nowy projekt. Zachowaj też własny plik `.civilcraft.json`: to jedyny plik, który przechowuje wszystko, co wie CivilCraft.
