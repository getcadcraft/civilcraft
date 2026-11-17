---
title: Kontrole linii energetycznych
summary: Co CivilCraft sprawdza przy każdej linii i kablu, zawsze aktualne: prześwity, odstępy, wychylenie, wyciąganie, obciążenia podpór i dobór, osprzęt, odciągi, fundamenty, brakujące dane, połączenia, przeciążenia i spadek napięcia.
keywords: kontrole, prześwit, prześwit nad ziemią, przeszkoda, skrzyżowanie, odstęp faz, wychylenie izolatora, wyciąganie, obciążenie podpory, obciążenie nominalne, dobór, fundament, odciąg, osprzęt, traversa, spadek napięcia, przeciążenie, brakujące dane, rozłączony
from: e6a0da47
---

**Kontrole** w sekcji Linie energetyczne wymieniają każdy problem: na czerwono to, co nie spełnia wymagań, a na bursztynowo ostrzeżenia. Kliknij jeden, aby zaznaczyć linię, podporę, kabel lub urządzenie, którego dotyczy; niespełniające wymagań podpory i przęsła są zakreślone na czerwono w planie, gdy obszar roboczy jest otwarty.

:::warning
Narzędzie pomocnicze projektanta: są to sprawdzenia Twojego projektu według Twoich własnych reguł, a nie certyfikacja.
:::

## Prześwity

Najniższa faza przewodu jest śledzona wzdłuż każdego przęsła przy każdym przypadku obciążenia. Jej najmniejszy prześwit nad ziemią musi osiągać **Regułę prześwitu** linii. Tam, gdzie przęsło przecina **przeszkodę** (rysowaną przy użyciu {{ui:Przeszkoda}}: punkt lub linia, z jej wysokością nad ziemią i własną regułą prześwitu), prześwit nad szczytem przeszkody jest sprawdzany w ten sam sposób.

**To, co obszar roboczy Krajobraz umieszcza nad ziemią, też się liczy.** Pojedyncze rośliny (ich korona przy dojrzałej rozpiętości i wysokości), żywopłoty i rabaty (najwyższe gatunki w nich) oraz mury (ich szczyt) są przeszkodami pod linią, bez ponownego rysowania. Zachowują reguły ustawione w {{ui:Przypadki obciążeń i ograniczenia…}}: **Rośliny krajobrazu pod linią** (przykładowe zestawy używają *Drzewa i rośliny*, 3 m) oraz **Mury krajobrazu pod linią** (*Budynek*); wybierz **Nie sprawdzaj**, aby je pominąć. Prześwit mierzy się pionowo w górę od szczytu rośliny lub muru do przewodu w miejscu, gdzie przęsło je przecina; odległość w bok do korony obok linii nie jest sprawdzana. Przesunięcie drzewa lub podniesienie muru od razu zmienia kontrole.

Twoje reguły prześwitu są Twoje: otwórz je przyciskiem **Reguły…** obok dowolnej **Reguły prześwitu** (lub w {{ui:Przypadki obciążeń i ograniczenia…}}), aby dodać, zmienić nazwę, zmienić lub usunąć.

## Odstępy i wychylenie

- **Wymagany odstęp faz**: k·√(strzałka + długość izolatora) + U/150, z strzałką przypadku gorącego i napięciem U w kV (częsta forma; k pochodzi z Twojego zestawu reguł). Porównywany z odstępem faz traversy.
- **Wychylenie izolatora** na podporach wiszących, przy przypadku wiatru: atan(obciążenie poprzeczne ÷ obciążenie pionowe), porównywane z największym wychyleniem z zestawu reguł.
- **Wyciąganie**: podpora wiszącą niższa niż jej sąsiedzi może zostać podciągnięta w zimnie; jest oznaczana.

## Obciążenia podpór i dobór

Dla każdej podpory i każdego przypadku obciążenia, przy wszystkich przewodach linii:

- **Poprzeczne**: wiatr na metr × rozpiętość wiatrowa (połowa sumy dwóch przęseł) plus 2·H·sin(kąt skrętu ÷ 2) przy zwrocie.
- **Wzdłuż linii**: różnica naprężeń dwóch stron przy końcu martwym lub przy kącie; przy podporze wiszącej tylko przy oblodzeniu jednej strony (każde przęsło liczone osobno, co jest po stronie bezpieczeństwa).
- **Pionowe**: pionowe obciążenie na metr × rozpiętość ciężarowa (między najniższymi punktami po obu stronach) plus wyposażenie.

Obciążenie poziome jest przenoszone do nominalnego punktu podpory (obciążenie zastępcze = obciążenie × wysokość mocowania ÷ wysokość punktu nominalnego) i porównywane z jej **obciążeniem nominalnym** × współczynnik z zestawu reguł. Gdy jest za słaba, sugerowana jest najmniejsza podpora tego samego materiału z Twojej biblioteki, która je przeniesie. Podpora z **odciągiem** przenosi obciążenie poziome na odciąg, który niesie obciążenie ÷ sin(kąt odciągu) i jest sprawdzany względem własnej nośności.

Osprzęt (zaciski, izolatory, traverse) jest sprawdzany względem obciążenia znamionowego: osprzęt kotwiczący przenosi naprężenie przewodu, a osprzęt wiszący swój udział w obciążeniu pionowym i poprzecznym. **Fundament** pokazany jest jako głębokość podpory w gruncie i otwór nieco szerszy niż jej stopa.

## Dane, połączenia i prąd

- Element z pustym wymaganym polem albo klucz, którego nie ma w bibliotece.
- Koniec trasy kabla lub urządzenie, niepodłączone do niczego.
- **Spadek napięcia** i **prąd** od każdego źródła (urządzenia oznaczonego jako źródło) do odbiorników (kW i współczynnik mocy na urządzeniu), wzdłuż przęseł napowietrznych i kabli: √3·I·L·(R cos φ + X sin φ), z R w 20 °C. Prąd większy niż obciążalność prądowa kabla albo większy spadek, niż dopuszcza zestaw reguł, jest oznaczany.
