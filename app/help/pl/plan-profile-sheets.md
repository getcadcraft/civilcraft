---
title: Arkusze planu i profilu
summary: Wydrukuj trasę jako zestaw arkuszy planu i profilu w jednym PDF, z liniami dopasowania między nimi.
keywords: plan i profil, arkusze, wydruk, pdf, linia dopasowania, produkcja planów, plany drogowe, wydruk profilu, przewyższenie pionowe, zestaw arkuszy
from: 34b4ec78
---

Arkusze planu i profilu to sposób, w jaki zwykle rysuje się plany dróg: każdy arkusz pokazuje jeden odcinek drogi dwukrotnie, plan u góry i profil na dole, w tej samej skali poziomej, dzięki czemu kilometraż znajduje się w tym samym miejscu w obu widokach.

## Tworzenie arkuszy

1. Wybierz trasę. We **Właściwościach** kliknij {{ui:Arkusze planu i profilu}}.
2. Wybierz **Papier**, **Skalę planu** i **Przewyższenie profilu** (ile razy profil jest rysowany wyższy, niż jest długi; na start 10×). Okno dialogowe podaje, ile powstanie arkuszy i jaką część trasy pokazuje każdy z nich.
3. Aby wydrukować część trasy, zmień **Od kilometrażu** i **Do kilometrażu**.
4. Kliknij {{ui:Pobierz PDF}}. PDF ma jedną stronę na arkusz.

## Co znajduje się na arkuszu

| Część | Co pokazuje |
|---|---|
| Plan | Wszystko z planu (poziomice, punkty pomiarowe, trasa i jej kilometraż, korytarze, place, linie charakterystyczne, rurociągi, linie przekrojów), obrócone tak, by ten odcinek biegł w poprzek arkusza, ze strzałką północy obróconą odpowiednio |
| Linie dopasowania | Linia kreskowo-kropkowa prostopadła do trasy na każdym końcu, który kontynuuje się na innym arkuszu, opisana „Linia dopasowania km 5+50.00, zob. arkusz 2" |
| Profil | Istniejący teren (linia przerywana), niweleta projektowa (czerwona), spadek każdego odcinka prostego i każdego łuku pionowego: punkt PVI, rzędna, L i K; kilometraże u dołu, rzędne po obu stronach |
| Pasek tytułowy | Nazwa projektu, trasa i jej zakres kilometrażu, „Arkusz 1 z 3", skala pozioma i pionowa oraz przewyższenie |

Długość odcinka na arkusz jest tak duża, na ile pozwala okno planu przy danej skali, zaokrąglona w dół do pełnych 50 ft (20 m) na długich odcinkach albo do pełnych 10 ft (5 m) na krótkich.

:::note
Gdy rzędne profilu nie zmieściłyby się przy wybranym przewyższeniu, CivilCraft rysuje każdy arkusz w największym z przewyższeń 10×, 5×, 4×, 2× i 1×, który się mieści, a pasek stanu o tym informuje. Trasa łukowa jest obracana o kierunek od początku do końca każdego odcinka, więc droga na arkuszu może lekko wznosić się lub opadać.
:::
