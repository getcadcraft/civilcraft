---
title: Obszar roboczy Linie energetyczne
summary: Linie napowietrzne i kable podziemne na Twoim terenie, z własnymi bibliotekami, strzałką i naprężeniem według Twoich przypadków obciążenia, sprawdzeniem prześwitów i wytrzymałości, tabelami naciągu, ilościami, arkuszami i eksportem do GIS.
keywords: linia energetyczna, linia napowietrzna, elektroenergetyka, dystrybucja, słupy, podpory, przewód, strzałka, naprężenie, naciąg, prześwit, kabel podziemny, wykop, obszar roboczy, operator sieci
from: 638dd856
---

Obszar roboczy Linie energetyczne umieszcza linie napowietrzne i kable podziemne na istniejącym już terenie w CivilCraft: te same punkty geodezyjne, ten sam teren, ten sam plik projektu.

:::warning
Narzędzie pomocnicze projektanta. Obszar roboczy wylicza strzałkę, naprężenie, prześwity i obciążenia według **Twoich** przypadków obciążenia i ograniczeń; żadna norma kraju nie jest wbudowana. Inżynier sprawdza każdy wynik względem obowiązującej normy, zanim cokolwiek zostanie zbudowane.
:::

## Otwórz go

Wybierz {{ui:Powierzchnia}} › {{ui:Więcej}} › {{ui:Obszar roboczy Linie energetyczne}} albo **Linie energetyczne** w sekcji Obszar roboczy. Pasek narzędzi wyświetla wtedy grupę **Linie energetyczne**; grupy Projekt i GIS ustępują miejsca. Wybierz **Cywilny** w sekcji Obszar roboczy, aby wrócić. CivilCraft zapamiętuje obszar roboczy, którego użyto ostatnio na tym komputerze.

Lewy panel zyskuje u góry dwie sekcje:

- **Linie energetyczne**: Twoje przypadki obciążeń i ograniczenia, linie i kable w projekcie oraz **Kontrole**, zawsze aktualne. Kliknij kontrolę, aby zaznaczyć to, czego dotyczy.
- **Biblioteka**: Twoje własne przewody, kable, podpory, urządzenia i typy wykopów. Zobacz [Twoja biblioteka linii energetycznych](topic:power-line-library).

## Co jest w grupie Linie energetyczne

| Narzędzie | Co robi | Temat |
|---|---|---|
| **Linia** | Linia napowietrzna: kliknij każdą podporę | [Rysowanie linii napowietrznej](topic:overhead-line) |
| **Podpora** | Dodaje podporę na przęśle | [Rysowanie linii napowietrznej](topic:overhead-line) |
| **Kabel** | Trasa kabla podziemnego w wykopie | [Kable podziemne](topic:underground-cables) |
| **Urządzenie** | Szafka, transformator, złącze albo źródło, z którego zasilana jest sieć | [Kable podziemne](topic:underground-cables) |
| **Przeszkoda** | Coś, co przecina linia: droga, budynek, inna linia | [Kontrole](topic:power-line-checks) |
| **Profil** | Profil linii: teren, podpory i przewód przy każdym przypadku obciążenia | [Rysowanie linii napowietrznej](topic:overhead-line#the-line-profile) |
| **Więcej** | Przypadki obciążeń i ograniczenia, tabele naciągu, ilości, arkusze i raport, GIS, pliki analizy | [Strzałka i naprężenie](topic:sag-and-tension), [Wyniki](topic:power-line-outputs), [Pliki analizy](topic:power-line-study-file) |

Wszystko, co dodasz, to jeden krok cofnięcia, jest zapisywane w pliku projektu i rysowane w planie na warstwach o nazwach `C-POWR-…`, dzięki czemu eksporty DXF, DWG i PDF również je zawierają.
