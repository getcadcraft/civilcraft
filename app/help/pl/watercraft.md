---
title: WaterCraft: zapotrzebowanie, przepływ pożarowy, awarie i wiek wody
summary: Z dodatkiem WaterCraft zamieniaj odbiorców w zapotrzebowanie na swoich przewodach wodociągowych, sprawdzaj przepływ dostępny przy każdym hydrancie, zobacz, która awaria przewodu jest najbardziej dotkliwa, i śledź wiek wody oraz chlor w ciągu doby.
keywords: watercraft, dystrybucja wody, zapotrzebowania, odbiorcy, współczynnik szczytu, wzorzec zapotrzebowania, przepływ pożarowy, hydrant, ciśnienie resztkowe, krytyczność, awaria, odcinek z zasuwami, wiek wody, chlor, pozostałość, śledzenie źródła, ślepy koniec, csv, dodatek
from: 066fb17a
---

WaterCraft to dodatek działający na sieci wodociągowej, którą już narysowałeś narzędziami sieci wodociągowej. Dodaje kartę do prawego panelu z czterema sekcjami.

:::warning
Tylko pomoc w obliczeniach. Sprawdzono ją na ręcznych wynikach dla wymyślonych sieci, a nie na rzeczywistym modelu przedsiębiorstwa wodociągowego. Każdy wynik musi sprawdzić inżynier wodny. Scenariusze, reguły sterowania, zasuwy i odczyty z terenu mają własne tematy, „Scenariusze” i „Badania”, w pomocy dodatku WaterCraft.
:::

## Co zrobisz

- Umieść odbiorców w sieci jako zapotrzebowanie.
- Znajdź hydranty, które nie osiągają wymaganego przepływu.
- Znajdź przewody, których utrata ma największe znaczenie.
- Znajdź starą wodę i niski poziom chloru.

## Kroki

1. Otwórz {{ui:Ustawienia}} › {{ui:Dodatki}} i włącz {{ui:WaterCraft (dystrybucja wody)}}. Karta {{ui:WaterCraft}} pojawia się w prawym panelu.
2. Najpierw narysuj zbiornik, węzły i rurociągi narzędziami sieci wodociągowej (zobacz [Sieć wodociągowa](topic:water-mains)). Bez sieci karta mówi, że trzeba to zrobić.
3. Pod {{ui:Zapotrzebowanie}} wklej jednego odbiorcę w wierszu: id, x, y, rodzaj, ilość. Wybierz {{ui:Współczynnik szczytu}} i {{ui:Wzorzec godzinowy}} (dzień mieszkaniowy, dzień handlowy, płaski albo zachowaj wzorzec bez zmian). Naciśnij {{ui:Sprawdź}}, aby zobaczyć, gdzie trafia każdy odbiorca (najbliższy węzeł), a potem {{ui:Wstaw do sieci}}. Cofnij zabiera zapotrzebowanie z powrotem.
4. Pod {{ui:Przepływ pożarowy}} ustaw potrzebny przepływ i ciśnienie resztkowe, wybierz, czy ciśnienie resztkowe jest utrzymywane {{ui:Tylko przy hydrancie}} czy {{ui:W całym systemie (ostrzej)}}, i naciśnij {{ui:Długość w rzucie}}. Każdy hydrant jest wymieniony od najgorszego, jako „spełnia” albo „za mało”.
5. Pod {{ui:Który przewód jest najważniejszy}} wybierz {{ui:jeden rurociąg naraz}} albo {{ui:jeden odcinek z zasuwami naraz}} i naciśnij {{ui:Długość w rzucie}}. Każda awaria pokazuje odcięte zapotrzebowanie, odcięte węzły, węzły, które dopiero teraz spadły poniżej minimalnego ciśnienia, i najniższe pozostałe ciśnienie.
6. Pod {{ui:Wiek wody i chlor}} wybierz, co śledzić (wiek wody, chlor albo śledzenie źródła), ustaw godziny obliczeń i granice, których chcesz, i naciśnij {{ui:Długość w rzucie}}. Węzły poza Twoimi granicami są wymienione.
7. Naciśnij {{ui:Zapisz jako CSV}} pod dowolną tabelą, aby ją zachować.

## Uwagi

- Potrzebny przepływ pożarowy oraz zużycie na dom lub na akr to wartości startowe, nie normy. Użyj własnych danych przedsiębiorstwa wodociągowego.
- Rurociąg częściowo przecięty zasuwą jest zamykany w całości, więc pokazana awaria jest nieco gorsza niż rzeczywista.
- Uruchom część o jakości wody wystarczająco długo, aby dobowy wzorzec się powtórzył, zanim odczytasz ostatni dzień.
- {{ui:Zatrzymaj}} kończy długie obliczenia wcześniej; lista pokazuje wtedy tylko to, co zdążono zrobić.
- Twoja sieć zostaje w tym projekcie i na tym komputerze. Nic nie jest nigdzie wysyłane.
