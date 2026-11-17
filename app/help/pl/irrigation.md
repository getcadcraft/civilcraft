---
title: Projektowanie nawadniania
summary: Pomoc obliczeniowa, a nie zatwierdzony projekt: zraszacze, przewody rozdzielcze, przewód główny, zawory i linie kroplujące na działce; strefy wyznaczone z rur; spadek ciśnienia wg Hazena–Williamsa, zraszacz w najgorszym przypadku, przepływ i ciśnienie względem zasilania, intensywność opadu, czasy pracy, pokrycie i zestawienie materiałów.
keywords: nawadnianie, system nawadniania, zraszacz, zraszacze, rozpylacz, zraszacz obrotowy, dysza obrotowa, bąbelkowy, kroplowanie, linia kroplująca, kroplownik, zawór, strefa, sekcja, sterownik, przewód główny, przewód rozdzielczy, punkt przyłączenia, zasilanie wodą, ciśnienie, psi, kPa, przepływ, gpm, straty tarcia, Hazen Williams, intensywność opadu, czas pracy, pokrycie, zraszacz do zraszacza, zestawienie materiałów
from: 7d6342c1
---

:::warning
Jest to pomoc obliczeniowa, a nie zatwierdzony projekt: projektant nawodnień sprawdza każdy wynik, zanim cokolwiek zostanie zbudowane.
:::

## Zaplanuj układ

1. W sekcji **Nawadnianie** po lewej wybierz **Zraszacz**, jego **Kąt** i miejsce, w którym zaczyna się kąt, oraz średnice rur dla przewodów rozdzielczych i przewodu głównego.
2. {{ui:Nawadnianie}} › {{ui:Punkt przyłączenia}}: kliknij miejsce, w którym dołącza zasilanie wodą. Ustaw jego **ciśnienie**, **dostępny przepływ** oraz straty na wodomierzu i zabezpieczeniu przed cofką we Właściwościach.
3. {{ui:Nawadnianie}} › {{ui:Zawór}}: kliknij miejsce zaworu każdej strefy. Zawór rozpoczyna strefę.
4. {{ui:Nawadnianie}} › {{ui:Zraszacz}}: kliknij, aby umieścić zraszacze; każde kliknięcie umieszcza jeden.
5. {{ui:Nawadnianie}} › {{ui:Przewód rozdzielczy}}: kliknij od zaworu przez jego zraszacze i naciśnij {{key:Enter}}. {{ui:Przewód główny}}: od punktu przyłączenia do każdego zaworu.

Końce rur przyciągają się do zraszaczy, zaworów, zasilania i innych końców rur, dzięki czemu sieć się łączy. Strefa to wszystko, do czego dociera się od zaworu przewodami rozdzielczymi; przewód główny przenosi jedną strefę naraz.

## Kroplowanie

{{ui:Nawadnianie}} › {{ui:Linia kroplująca}}: kliknij wzdłuż linii, zaczynając od miejsca, w którym jest zasilana (koniec przewodu rozdzielczego lub zawór). We Właściwościach ustaw **przepływ kroplownika** i **rozstaw**; jej przepływ to suma kroplowników wzdłuż niej.

## Sprawdzenie

{{ui:Nawadnianie}} › {{ui:Sprawdź system…}} wypisuje każdą strefę:

| Kolumna | Jak jest wyliczana |
|---|---|
| Przepływ | Suma przepływów zraszaczy (i linii kroplujących) |
| Przy zaworze | Ciśnienie robocze zraszacza w najgorszym przypadku plus straty w rurach do niego (Hazen–Williams, średnica wewnętrzna rury, zmiana wysokości) oraz strata na zaworze |
| Przy zasilaniu | To samo plus strata przewodu głównego niosącego tę strefę oraz straty na wodomierzu i zabezpieczeniu przed cofką |
| Intensywność opadu | Przepływ zraszaczy podzielony przez powierzchnię, którą podlewają przy rozstawie zraszacz do zraszacza |
| Minuty tygodniowo | Do zastosowania ustawienia **Woda tygodniowo** |
| Problemy | Prędkość powyżej limitu, zraszacz poza zakresem ciśnienia, rozpylacze i wirniki przy jednym zaworze, za mało ciśnienia lub przepływu przy zasilaniu, zraszacze bez strefy, pętle |

Zaznacz zawór, aby zobaczyć wyniki jego strefy i zraszacz w najgorszym przypadku zaznaczony okręgiem na planie. Zestawienie materiałów liczy zraszacze według rodzaju i kąta, rury według średnicy, zawory, linię kroplującą i kroplowniki oraz sekcje sterownika. **Zapisz jako CSV** zachowuje oba.

Ustawienia w sekcji Nawadnianie: **Współczynnik C Hazena–Williamsa** (150 dla nowych rur z tworzywa), **największa prędkość przepływu** w rurze (1,5 m/s), **strata na zaworze** oraz **Woda tygodniowo**. Są oznaczone jako wartości domyślne.

## Pokrycie

{{ui:Nawadnianie}} › {{ui:Pokaż zasięg}} podaje, jaka część obszaru pozostaje sucha między zraszaczami, jaka część jest podlewana przez dwa lub więcej zraszaczy i które zraszacze nie sięgają sąsiada (rozstaw zraszacz do zraszacza).

## Zraszacze

Wymienione zraszacze to **ogólne** rodzaje zapisane przez CadCraft na podstawie projektowych intensywności opadu (rozpylacze stałe, dysze obrotowe, wirniki zębate, bąbelkowe, mikrorozpylacze, kroplowniki), a nie produkty żadnego producenta. **Dodaj zraszacze z pliku…** odczytuje własne zraszacze (listę JSON z zasięgiem strumienia, przepływem lub intensywnością opadu każdego zraszacza oraz zakresem ciśnienia); są zapisywane razem z projektem. Opublikowane dane producenta dodaje się tylko za zgodą tego producenta.

Poniżej ogólnych zraszaczy lista zawiera **typowe zraszacze** (ich nazwy kończą się na "typical values"): rozmiary dysz rozpylaczy stałych, dysz obrotowych i wirników zębatych, mikrorozpylaczy, bąbelków i kroplowników, z promieniem, przepływem i zakresem ciśnienia. CadCraft wylicza je z opublikowanych zależności (równanie otworu dla przepływu, skalowanie zasięgu strumienia dla promienia) oraz nominalnych klas przepływu, wyłącznie z otwartych źródeł; żadna tabela producenta nie jest kopiowana. Po wybraniu jednego selektor pokazuje jego podstawę i licencję. Projekt, który go używa, zachowuje zraszacz i jego źródło w pliku projektu. Są przeznaczone do planowania: przed budową sprawdź dane właściwe dla danego zraszacza.
