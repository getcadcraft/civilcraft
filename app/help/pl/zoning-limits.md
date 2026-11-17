---
title: Sprawdź bryły względem limitów zagospodarowania, które wpisujesz
summary: Wpisz odsunięcia działki linia po linii, limit wysokości, płaszczyznę ekspozycji na niebo, wskaźnik intensywności zabudowy i udział zabudowy, zobacz dopuszczalny obrys na planie i odczytaj, które bryły łamią które limity.
keywords: zagospodarowanie, odsunięcie, odsunięcia, przednie, boczne, tylne, obrys, dopuszczalna powierzchnia, limit wysokości, płaszczyzna ekspozycji na niebo, wskaźnik intensywności zabudowy, udział zabudowy, działka, parcela, przepis, sprawdzenie zgodności
from: 3e267b31
---

**CivilCraft nie zawiera żadnego kodeksu zagospodarowania.** Nie zna przepisów żadnego miasta i nie dostarcza ich biblioteki. Każda liczba na tej stronie to ta, którą wpisujesz z własnego przepisu lokalnego, a każdy wynik mówi, że został zmierzony względem limitów, które wpisałeś. To sposób, by zobaczyć, jak limity działki kształtują budynek, a nie orzeczenie, czy projekt jest dozwolony.

## Wpisz limity

We **Właściwościach**, w sekcji **Bryły budynków**, wybierz **Działkę** (lub wybierz bryłę: limity jej działki pokażą się pod nią). Następnie wypełnij to, co dotyczy; zostaw pole puste dla „bez limitu”:

- **Linia ulicy**: granica działki przy ulicy. **Odsunięcie czołowe** dotyczy jej, **odsunięcie tylne** dotyczy linii najbardziej przeciwnej do niej, a **odsunięcie boczne** dotyczy pozostałych.
- **Limit wysokości**.
- **Płaszczyzna ekspozycji na niebo**: zaczyna się na wysokości przy granicy działki i rośnie o wpisaną wartość na każdą 1 jednostkę odległości do wnętrza, mierzoną od linii ulicy lub od każdej granicy działki (2 oznacza 2 do 1). Dopuszczalna wysokość nad punktem to najniższa z płaszczyzny i limitu wysokości.
- **Wskaźnik intensywności zabudowy** (powierzchnia użytkowa brutto brył na działce podzielona przez pole działki) oraz **Udział zabudowy** (ich rzuty podzielone przez pole działki, wpisywane w procentach).

## Obrys dopuszczalny

Zaznacz **Pokaż obrys dopuszczalny na planie**, aby narysować go na warstwie `A-MASS-ENVL`. Obrys to działka pomniejszona o odsunięcie każdej granicy, a linie przesunięte schodzą się w narożnikach ściętych na ukos. Granica działki złożona z krzywej jest brana jako krótkie cięciwy w odległości 0.01 od krzywej. Działają zarówno działki wypukłe, jak i wklęsłe. Jeśli odsunięcia nachodzą na siebie (głębokie odsunięcie na wąskiej lub bardzo wklęsłej działce), obrysu nie ma, a Właściwości to mówią; spróbuj mniejszych odległości.

## Wynik

Pod polami każda bryła i każdy limit dostają linię z ptaszkiem lub krzyżykiem:

- **odsunięcia**: pole części bryły leżącej poza obrysem;
- **wysokość**: wysokość bryły w porównaniu z największą dopuszczalną nad jej rzutem (bryła o jednej wysokości jest ograniczona najniższą dopuszczalną wysokością w dowolnym z jej narożników);
- **wskaźnik intensywności zabudowy** i **udział zabudowy**: wszystkie bryły na działce zsumowane.
