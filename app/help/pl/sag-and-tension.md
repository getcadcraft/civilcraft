---
title: Zwis i naprężenie
summary: Twoje przypadki obciążeń (temperatura, wiatr, oblodzenie) i granice naprężeń, sposób, w jaki CivilCraft wylicza naprężenie każdego odcinka, oraz tabele naciągu.
keywords: zwis, naprężenie, przypadek obciążenia, temperatura, wiatr, oblodzenie, asymetryczne oblodzenie, przęsło miarodajne, przęsło zastępcze, zmiana stanu, łańcznica, tabela naciągu, wytrzymałość na zerwanie, codzienne naprężenie
from: f8876c35
---

## Przypadki obciążeń i ograniczenia

{{ui:More}} › {{ui:Load cases and limits…}} edytuje reguły, którym podlega każda linia w projekcie.

- **Przypadki obciążeń**: temperatura, ciśnienie wiatru na przewód (Pa) oraz oblodzenie radialne (mm, z jego gęstością). Pierwszy przypadek jest odniesieniem.
- **Granice naprężeń**: udział wytrzymałości przewodu na zerwanie, dotyczący naprężenia poziomego lub największego naprężenia przy podporze, w jednym przypadku obciążenia. Albo podaj samodzielnie naprężenie poziome.
- **Odległości**: prześwit, jaki przewód zachowuje nad terenem, drogą, budynkiem i tak dalej. Dodawaj, zmieniaj nazwy i usuwaj je: są Twoje. Poniżej nich wybierz reguły dla **Roślinność krajobrazowa pod linią**, **Ściany krajobrazowe pod linią** oraz **Przejścia podziemne**.
- **Przypadki używane przez sprawdzenia**: który przypadek daje największy zwis (gorący), wychylenie izolatora (wiatr), oblodzenie oraz oblodzenie po jednej stronie podpory.
- **Współczynniki**: współczynnik odstępu faz k, największe wychylenie izolatora, współczynnik obciążeń podpór i osprzętu, kąty skrętu, które tworzą podpory narożne i końcowe, najmniejsze przykrycie kabli podziemnych oraz największy spadek napięcia.

## Pakiety: reguły i biblioteka dla kraju

Żadne przepisy kraju nie są wbudowane w CivilCraft. **Pakiet** trzyma razem zestaw reguł i bibliotekę w jednym pliku (`.cclinepack.json`), dla kraju, operatora sieci lub firmy:

- **Zapisz jako pakiet…** w {{ui:Load cases and limits…}} zapisuje pokazany zestaw reguł i Twoją bibliotekę (albo, gdy Twoja biblioteka jest jeszcze pusta, elementy używane w tym projekcie). Najpierw wpisz **Kraj lub region**.
- **Otwórz zestaw reguł lub pakiet…** wczytuje pakiet, plik reguł lub plik biblioteki. Reguły pakietu są pokazane w oknie (kliknij **Zastosuj**, aby ich użyć), a jego elementy trafiają do Twojej biblioteki.
- Pakiety udostępniane przez innych są wymienione na stronie dodatków w sekcji **Pakiety linii energetycznych**. Dwa przykładowe pakiety pokazują format; nie są przepisami żadnego kraju.

Każdy pakiet jest sprawdzany przy otwarciu, jak każdy plik. Sprawdź każdą wartość względem obowiązującej normy, zanim cokolwiek zostanie zbudowane.

Dwa przykładowe zestawy reguł są gotowe do rozpoczęcia pracy: **Przykład: klimat chłodny** i **Przykład: klimat łagodny**. Ich liczby nie pochodzą z żadnej normy: ustaw wartości zgodne z Twoją normą. {{ui:Save rules}} i {{ui:Open rules…}} udostępniają zestaw reguł jako plik.

## Jak wylicza się naprężenie

Dla każdego odcinka między końcowymi podporami:

1. **Przęsło miarodajne** to √(ΣL³ ÷ ΣL) jego przęseł.
2. Każde ograniczenie jest przeliczane na naprężenie poziome w przypadku odniesienia za pomocą **równania zmiany stanu** dla przęsła miarodajnego: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Najbardziej restrykcyjne ustala naprężenie.
3. Naprężenie każdego przypadku obciążenia wynika z tego jednego, a kształt każdego przęsła to dokładna **łańcznica** przechodząca przez jego dwa punkty zawieszenia (także przęsła na zboczu): zwis z cięciwy, długość i naprężenie na każdym końcu.

Obciążenie na metr w przypadku: ciężar plus oblodzenie (pole oblodzenia × gęstość × g) w pionie; ciśnienie wiatru × średnica z oblodzeniem w poziomie.

## Tabele naciągu

{{ui:More}} › {{ui:Stringing tables…}} wyświetla dla każdego odcinka naprężenie poziome oraz zwis każdego przęsła przy każdej temperaturze z zestawu reguł (na początek od −5 °C do 40 °C co 5 °C), w bezwietrznym powietrzu. Zapisz je, wraz z tabelą podpór, jako CSV.

Nie są uwzględniane: pełzanie przewodu w ciągu lat oraz wydłużenie nowego przewodu. Dodaj je, wprowadzając temperatury, w których naciągasz przewód.
