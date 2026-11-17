---
title: Obliczanie przepływów projektowych kanalizacji sanitarnej i sprawdzanie kanału
summary: Wpisz ludzi i powierzchnię wpływającą w każdej studzience sieci kanalizacji sanitarnej; CivilCraft sumuje je w dół sieci, wylicza przepływ szczytowy ze współczynnikiem szczytu i infiltracją oraz sprawdza przepustowość i prędkość każdej rury.
keywords: sanitarna, kanał, kanalizacja sanitarna, ścieki, przepływ projektowy, przepływ szczytowy, współczynnik szczytu, harmon, babbitt, infiltracja, ludność, na mieszkańca, procent napełnienia, samooczyszczanie, prędkość, dobór rur, arkusz obliczeniowy
from: 73ba197a
---

Przepływy projektowe kanalizacji sanitarnej działają na [sieci rur](topic:pipe-network), gdy jej {{ui:Type}} to {{ui:Sanitary}}. Gdy nic nie jest zaznaczone, prawy panel pokazuje wtedy **Przepływy projektowe sanitarne** w miejscu, w którym sieć deszczowa pokazuje odwodnienie deszczowe.

## Wpisz, co wpływa

1. Zaznacz studzienkę. Pod **Przepływy projektowe sanitarne** wpisz {{ui:People entering here}} i {{ui:Area entering here}} (hektary w projekcie metrycznym, akry w projekcie w stopach).
2. Dla sklepów, biur lub przemysłu wpisz równoważną liczbę osób: powierzchnię pomnożoną przez liczbę osób na hektar (lub akr), jakiej używa Twoja instytucja. Powierzchnia liczy się do infiltracji w każdym przypadku.
3. Powtórz dla każdej studzienki, do której podłączona jest ulica lub działka. Studzienka, do której nic nie jest podłączone, ma obie wartości równe 0.

Każda rura niesie wszystko, co wpływa do jej górnej studzienki i powyżej. Zaznacz studzienkę, aby zobaczyć, co przez nią przepływa.

## Ustawienia

| Ustawienie | Co oznacza |
|---|---|
| {{ui:Flow per person}} | średni przepływ jednej osoby na dobę: litry (projekt metryczny) lub galony amerykańskie (projekt w stopach) |
| {{ui:Infiltration}} | woda gruntowa, która się przedostaje: litry na sekundę na hektar lub galony na dobę na akr |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), albo Babbitt, 5 / P^0,2, gdzie P to ludność w tysiącach |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | współczynnik jest utrzymywany między tymi dwiema wartościami |
| {{ui:Manning n}} | do przepustowości i prędkości |
| {{ui:Least velocity}} / {{ui:Most velocity}} | przy głębokości w rurze odpowiadającej przepływowi szczytowemu |
| {{ui:Most of full capacity}} | jak bardzo rura może być napełniona przy szczycie, jako procent tego, co przenosi, płynąc pełnym przekrojem |

Wartości startowe są zastępcze, a nie normą. Używaj wartości, które publikuje Twoja instytucja.

## Co jest wyliczane

Dla każdej rury, w kolejności przepływu:

- przepływ szczytowy = ludzie × przepływ na osobę × współczynnik szczytu + powierzchnia × infiltracja
- przepustowość przy pełnym przekroju (równanie Manninga przy spadku rury) oraz to, jak bardzo szczyt ją napełnia
- głębokość normalna przepływu szczytowego i prędkość przy niej

Tabela **Wyniki sanitarne** wypisuje dla każdej rury liczbę osób, współczynnik szczytu, przepływ szczytowy (l/s, lub gpm i stopy sześcienne na sekundę), procent napełnienia i prędkość. Pod nią wypisane są problemy: rura napełniona bardziej niż dopuszcza limit, wolniejsza niż najmniejsza prędkość (może się nie oczyszczać), szybsza niż największa albo bez spadku. {{ui:Size the pipes for these flows}} wybiera dla każdej rury najmniejszy standardowy rozmiar (200 mm lub 8 cali i więcej), który przenosi jej szczyt w granicach limitu; jedno {{key:Mod+Z}} to cofa.

:::note
To jest ustalony przepływ szczytowy, jaki wylicza arkusz obliczeniowy, sprawdzony względem opublikowanego arkusza z dokładnością do zaokrągleń drukowanych w nim. Nie jest to model kanału w czasie: bez hydrogramów, retencji, pomp i przelewów. Zobacz [Jeszcze nie zbudowano](topic:not-built-yet).
:::

Prędkości liczone są równaniem Manninga z tym samym n na każdej głębokości. Niektóre instytucje mają wykresy częściowego napełnienia, w których n zmienia się z głębokością; daje to nieco mniejszą prędkość w rurze napełnionej w 60 do 70 procentach (około 3 procent mniej).
