---
title: Rysowanie linii napowietrznej
summary: Ustaw słupy w rzucie, pozwól CivilCraft określić rolę każdego słupa i odcinki między słupami odciągowymi, a słupy przesuwaj w rzucie lub na profilu linii.
keywords: linia napowietrzna, słup, przęsło, odcinek, odciągowy, narożny, przelotowy, profil, wysokość, traweres, odciąg, stay, guy
from: b8e5e272
---

## Rysowanie

1. Musi istnieć powierzchnia: teren pod linią pochodzi z niej ([Utwórz powierzchnię](topic:build-surface)). Słup bez terenu pod nim jest wymieniony w **Kontrolach**; zamiast tego wpisz jego **Rzędną terenu** we Właściwościach.
2. Kliknij {{ui:Linia}} w grupie Linie napowietrzne i kliknij każdy słup w rzucie.
3. Kliknij dwukrotnie ostatni słup albo naciśnij Enter.

Linia dostaje przewód, słup i wyposażenie, których użyto ostatnio na tym komputerze (za pierwszym razem: przykłady z biblioteki). Zmień je we Właściwościach.

## Linia we Właściwościach

Zaznacz linię (kliknij przęsło), aby ustawić jej **Przewód**, **Przewody na obwód**, **Obwody**, **Napięcie**, **Regułę prześwitu**, który musi zachować nad terenem, oraz wyposażenie **Na każdym słupie** (traweres, izolatory, osprzęt). Tabela wymienia jej **odcinki** z przęsłem miarodajnym, naprężeniem eksploatacyjnym i przypadkiem obciążenia, który je określa.

## Słupy

Kliknij słup, aby go zaznaczyć. We Właściwościach:

- **Słup**: jego element biblioteki. Gdy jest za słaby, {{ui:Użyj …}} wstawia najmniejszy słup z tego samego materiału w bibliotece, który przenosi obciążenie.
- **Rola**: Automatycznie, Przelotowy, Narożny albo Odciągowy. Automatycznie oznacza: pierwszy i ostatni słup są odciągowe; zwrot większy niż kąt z zestawu reguł daje słup narożny, a większy zwrot — odciągowy.
- **Wysokość nad terenem**: puste pole pobiera ją z elementu biblioteki (jego długość minus głębokość w gruncie).
- **Na tym słupie też**: dodatkowe wyposażenie, np. **odciąg** (stay). Słup z odciągiem przenosi naciąg linii na swój odciąg.
- **Istniejący słup**: jest sprawdzany jak pozostałe, ale pomijany w przedmiarach.

{{ui:Słup}} dodaje słup na przęśle najbliższym kliknięciu. Przeciągnij słup w rzucie, aby go przesunąć. {{ui:Usuń}} usuwa go (linia zachowuje co najmniej dwa słupy).

Odcinki biegną między słupami odciągowymi: wewnątrz odcinka przewód swobodnie przechodzi przez zaciski przelotowe, więc jedno naprężenie obowiązuje na cały odcinek.

## Profil linii

Kliknij {{ui:Profil}} (albo **Profil** we Właściwościach linii). Panel pod rzutem pokazuje teren wzdłuż linii, każdy słup od terenu do jego wierzchu, najniższą fazę przewodu przy wybranym **Przypadku obciążenia** oraz prześwit, jaki linia musi zachować, jako linię przerywaną. Przęsło, które nie spełnia warunków, jest czerwone; liczba pod każdym przęsłem to jego najmniejszy prześwit.

- **Linia** wybiera linię napowietrzną do pokazania. Zaznaczenie innej linii albo jej słupa w rzucie przełącza profil na nią.
- Najedź wskaźnikiem na profil: linia prowadząca podąża za nim, a etykieta podaje odległość wzdłuż linii, teren, przewód i prześwit w tym miejscu (i informuje, gdy prześwit jest poniżej reguły linii).
- {{ui:Zmierz}} na pasku profilu: kliknij dwa punkty, aby uzyskać odległość w poprzek, różnicę wysokości, prostą odległość i spadek między nimi. Kliknięcie w pobliżu terenu, przewodu albo wierzchu słupa przyciąga do niego. Kliknij ponownie {{ui:Zmierz}}, aby zakończyć.
- Przeszkody, które linia przecina, wznoszą się od terenu: narysowane jako słupki, rośliny z Krajobrazu jako korony, mury jako słupki (zob. [Kontrole linii napowietrznych](topic:power-line-checks#clearances)). Trasy kablowe i rurociągi, które linia przecina, są zaznaczone pod terenem na ich wierzchu, z nazwą.

- Przeciągnij słup w bok, aby przesunąć go wzdłuż linii.
- Przeciągnij jego wierzch w górę lub w dół, aby ustawić wysokość nad terenem.
