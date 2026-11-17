---
title: "Prognozy klimatyczne: powódź, upał i pożar na 2050 i 2080"
summary: W Adresie na teren podnieś poziom powodzi na terenie dla przyszłego klimatu, oceń wstępnie narażenie na pożar i przekształć plik pogodowy, porównując go z przyszłością, z pakietu danych klimatycznych (SSP2-4.5 i SSP5-8.5, 2050 i 2080).
keywords: klimat, zmiana klimatu, przyszłość, 2050, 2080, ssp, cmip6, scenariusz, poziom morza, powódź, bazowy poziom powodzi, bfe, fema, upał, plik pogodowy, epw, morfing, pożar, pożar buszu
from: b0d2ee38
---

Dane klimatyczne pochodzą z **pakietu danych**, a nie z aplikacji. Włącz dodatek {{ui:Prognozy klimatyczne}} w Ustawienia › Dodatki albo wczytaj własny plik pakietu w bloku {{ui:Prognoza klimatyczna}}.

:::warning
Pakiet dołączony do dodatku to **próbka**: trzy miejsca (Denver, Miami, Johannesburg), jeden model klimatyczny, pięć lat w każdym 20-letnim okresie. Służy do wypróbowania narzędzi, **nie do projektowania**. Pełny pakiet buduje się za pomocą `tools/climate/build-pack.mjs` z danych NASA NEX-GDDP-CMIP6.
:::

## Gdzie to jest

Powierzchnia › Więcej › Adres na teren. Ustaw punkt, dodaj warstwy (warstwa FEMA daje bazowy poziom powodzi) i naciśnij przycisk, który odczytuje teren. Pod wierszami terenu jest blok {{ui:Prognoza klimatyczna}}: wybierz **Scenariusz** (SSP2-4.5 lub SSP5-8.5) i **Rok** (2050 = 2041-2060, 2080 = 2071-2090, oba względem 1995-2014). Używane jest miejsce z pakietu najbliższe punktu albo wybrane przez Ciebie; gdy jest daleko od każdego miejsca, używane są średnie globalne zmiany, a panel to mówi.

## Projektowy poziom powodzi

Obecny poziom to bazowy poziom powodzi FEMA, gdy warstwa powodzi go zawierała (w stopach, NAVD 88); w przeciwnym razie wpisz własny. Wybierz typ powodzi (przybrzeżna, rzeczna albo ulewne deszcze, albo obie), głębokość powodzi na terenie dla części opadowej i wolną burtę, jeśli chcesz. {{ui:Podnieś poziom powodzi}} pokazuje obecny i przyszły poziom obok siebie, części od poziomu morza i opadów oraz założenia: cały wzrost poziomu morza jest dodawany do poziomu przybrzeżnego; przepływ rzeki rośnie jeden do jednego z opadem najmokrszego dnia, a głębokość podąża za przepływem w potędze 0,6 (Manning, szeroki kanał); części są dodawane.

:::warning
To oszacowanie zmiany, a nie studium powodziowe. Projektowy poziom powodzi należy do urzędu albo do Twojego inżyniera.
:::

## Wstępna ocena narażenia na pożar (tylko wstępnie)

Najbliższa roślinność, zbocze w górę od niej i odległość dają pas od bardzo niskiego do ekstremalnego, obecnie i w przyszłości (przyszłość mnoży się przez zmianę wskaźnika zagrożenia pożarowego z pakietu). **Tylko wstępna ocena:** nasza własna skala względna, pozwalająca stwierdzić, czy teren wymaga właściwej oceny zagrożenia pożarowego; nie jest to ocena normowa.

## Upał: przyszły plik pogodowy

Wybierz obecny plik `.epw` i {{ui:Utwórz przyszły plik pogodowy}}: zostaje on przekształcony metodą przesunięcia i rozciągnięcia (Belcher, Hacker i Powell 2005), a upał jest porównywany (średnia i najwyższa temperatura, temperatury projektowe, godziny powyżej 30 °C i 35 °C, stopniodni). {{ui:Zapisz przyszły plik pogodowy}} zapisuje go dla panelu Środowisko, sprawdzenia energetycznego BimCraft albo Twoich własnych narzędzi.

## Skąd są liczby

NASA NEX-GDDP-CMIP6 (wyniki modeli CMIP6 w zmniejszonej skali, CC BY 4.0 na model) dla temperatury, wilgotności, nasłonecznienia, opadów i pogody pożarowej; średnia globalna IPCC AR6 dla wzrostu poziomu morza, chyba że pakiet zawiera lokalne dane. Panel pokazuje źródło pakietu, licencję i datę.
