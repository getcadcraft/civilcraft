---
title: WaterCraft: zapotrzebowania, przepływ pożarowy, wyłączenia i wiek wody
summary: Dzięki dodatkowi WaterCraft zamień odbiorców w zapotrzebowania na swoich magistralach wodociągowych, sprawdź przepływ dostępny przy każdym hydrancie, zobacz, które wyłączenie magistrali najbardziej szkodzi, i śledź wiek wody oraz chlor w ciągu doby.
keywords: watercraft, dystrybucja wody, zapotrzebowania, odbiorcy, współczynnik szczytu, wzorzec zapotrzebowania, przepływ pożarowy, hydrant, ciśnienie resztkowe, krytyczność, wyłączenie, odcinek z zasuwami, wiek wody, chlor, pozostałość, śledzenie źródła, ślepy koniec, csv, dodatek
from: 76809f01
---

WaterCraft to dodatek, który działa na sieci wodociągowej, już narysowanej narzędziami Magistrale wodociągowe. Dodaje kartę do panelu po prawej stronie z czterema sekcjami.

:::warning
Tylko pomoc obliczeniowa. Sprawdzono ją na porównaniu z obliczeniami ręcznymi na wymyślonych sieciach, a nie na rzeczywistym modelu przedsiębiorstwa wodociągowego. Inżynier wodociągowy musi sprawdzić każdy wynik. Nie ma jeszcze stacji podnoszenia ciśnienia, rozkładu drugiego rzędu ani scenariuszy.
:::

## Co zrobisz

- Umieścisz odbiorców w sieci jako zapotrzebowania.
- Znajdziesz hydranty, przy których przepływ jest za mały.
- Znajdziesz magistrale, których wyłączenie najbardziej szkodzi.
- Znajdziesz wodę o długim czasie przebywania i niski poziom chloru.

## Kroki

1. Otwórz {{ui:Ustawienia}} › {{ui:Dodatki}} i włącz {{ui:WaterCraft (dystrybucja wody)}}. W panelu po prawej stronie pojawi się karta {{ui:WaterCraft}}.
2. Najpierw narysuj zbiornik, węzły i rurociągi narzędziami Magistrale wodociągowe (zob. [Magistrale wodociągowe](topic:water-mains)). Bez sieci karta podpowie, co zrobić.
3. W sekcji {{ui:Zapotrzebowania}} wklej jednego odbiorcę w wierszu: identyfikator, x, y, rodzaj, ilość. Wybierz {{ui:Współczynnik szczytu}} i {{ui:wzorzec godzinowy}} (dzień mieszkalny, dzień handlowy, płaski lub zachowaj obecny wzorzec). Naciśnij {{ui:Sprawdź}}, aby zobaczyć, gdzie trafia każdy odbiorca (najbliższy węzeł), a następnie {{ui:Umieść w sieci}}. {{ui:Cofnij}} cofa zapotrzebowania.
4. W sekcji {{ui:Przepływ pożarowy}} ustaw potrzebny przepływ i ciśnienie resztkowe, wybierz, czy ciśnienie resztkowe ma być utrzymane {{ui:Tylko przy hydrancie}} czy {{ui:Wszędzie w systemie (surowiej)}}, i naciśnij {{ui:Długość w rzucie}}. Każdy hydrant jest wypisany od najgorszego, jako spełnia lub nie spełnia wymagań.
5. W sekcji {{ui:Która magistrala jest najważniejsza}} wybierz {{ui:jedna rura naraz}} albo {{ui:jeden odcinek z zasuwami naraz}} i naciśnij {{ui:Długość w rzucie}}. Każde wyłączenie pokazuje odcięte zapotrzebowanie, odcięte węzły, węzły, które nowo spadły poniżej minimalnego ciśnienia, oraz najniższe pozostałe ciśnienie.
6. W sekcji {{ui:Wiek wody i chlor}} wybierz, co śledzić (wiek wody, chlor lub śledzenie źródła), ustaw godziny obliczeń i limity, i naciśnij {{ui:Długość w rzucie}}. Wypisane są węzły poza Twoimi limitami.
7. Aby zachować dowolną tabelę, naciśnij pod nią {{ui:Zapisz jako CSV}}.

## Uwagi

- Potrzebny przepływ pożarowy oraz zużycie na dom lub na akr to wartości startowe, a nie normy. Użyj własnych danych przedsiębiorstwa.
- Rura częściowo odcięta zasuwą jest zamykana w całości, więc pokazane wyłączenie jest nieco gorsze niż rzeczywiste.
- Uruchom sekcję jakości wody na tyle długo, aby dobowy wzorzec się powtórzył, zanim odczytasz ostatni dzień.
- {{ui:Zatrzymaj}} kończy długie obliczenie wcześniej; lista pokazuje wtedy tylko to, co zostało wykonane.
- Twoja sieć pozostaje w tym projekcie i na tym komputerze. Nic nie jest nigdzie wysyłane.
