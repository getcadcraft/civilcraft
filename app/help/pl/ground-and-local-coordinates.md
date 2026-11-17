---
title: Współrzędne terenowe i lokalne
summary: Pracuj we współrzędnych terenowych (powierzchni), skalowanych od siatki łącznym współczynnikiem skali, który wpisujesz lub obliczasz w punkcie, albo w przyjętej siatce lokalnej powiązanej z układem dwoma punktami osnowy.
keywords: współrzędne terenowe, współrzędne powierzchni, siatka na teren, łączny współczynnik skali, csf, łączny współczynnik, współczynnik siatki, współczynnik wysokości, współczynnik poziomu morza, zbieżność, kąt odwzorowania, współczynnik skali, współrzędne przyjęte, współrzędne lokalne, lokalna siatka, 5000 5000, punkty osnowy, lokalizacja, kalibracja, dwa punkty, niedomknięcie
from: 3d7453de
---

Współrzędne stanowego układu płaskiego (state plane) i UTM są współrzędnymi **siatki**: odwzorowanie kartograficzne rozciąga lub ściska odległości nieznacznie (dziesiątki ppm), a im wyżej leży teren, tym bardziej zmierzona odległość terenowa różni się od odległości na siatce. Wiele pomiarów przekazuje więc współrzędne **terenowe**, przeskalowane tak, by odległości na planie były równe odległościom mierzonym na gruncie, albo **przyjętą** siatkę lokalną (5000, 5000 w punkcie osnowy). CivilCraft zachowuje twoje liczby takie, jakie są, i zapisuje, jak się mają do siatki, więc szerokość i długość geograficzna, pliki GIS oraz warstwy map nadal trafiają we właściwe miejsce.

Otwórz {{ui:Współrzędne}} w grupie {{ui:GIS}}, wybierz (albo zostaw) układ, a potem w sekcji **Siatka, teren lub współrzędne lokalne** wybierz:

| Wybór | Twoje współrzędne to | Jak się mają do siatki |
|---|---|---|
| {{ui:Siatka}} | Własne współrzędne układu (na starcie) | Te same liczby |
| {{ui:Grunt}} | Przeskalowane do odległości terenowych | siatka = baza + łączny współczynnik × (teren − baza) |
| {{ui:Lokalne}} | Przyjęta siatka lokalna | Przesunięta, obrócona i przeskalowana na siatkę dwoma punktami osnowy |

Wybór jest zapisywany w projekcie i jest jednym krokiem cofania; nic się nie przesuwa.

## Współrzędne terenowe

1. Wybierz {{ui:Grunt}}.
2. Wpisz **Łączny współczynnik skali** z pomiaru (na przykład `0.99987`) albo go oblicz:
   1. Pod **Oblicz współczynnik w punkcie** punkt zaczyna się w środku projektu. Wybierz {{ui:Wskaż punkt na planie}} i kliknij miejsce (kliknięcie blisko punktu pomiarowego bierze ten punkt) albo wpisz E i N.
   2. Rzędna pochodzi z powierzchni w tym miejscu; wpisz inną, jeśli trzeba.
   3. Wybierz {{ui:Oblicz}}. CivilCraft pokazuje:
      - **Współczynnik skali siatki k**: o ile odwzorowanie rozciąga tam odległości.
      - **Współczynnik wysokości**: o ile krótsze są odległości na elipsoidzie niż na tej wysokości.
      - **Łączny współczynnik** = k × współczynnik wysokości: odległość na siatce = odległość terenowa × ten współczynnik.
      - **Zbieżność**: kąt od północy siatki do północy rzeczywistej w tym miejscu (azymut geodezyjny = azymut siatki + zbieżność).
   4. Wybierz przycisk {{ui:Zastosowanie}} pod liczbami, by wstawić łączny współczynnik do pola.
3. Ustaw **Punkt bazowy**, w którym współrzędne terenowe i siatki są takie same. Startuje w 0, 0: większość jurysdykcji publikujących współrzędne terenowe skaluje względem początku układu, więc współrzędne terenowe pozostają rozpoznawalnie bliskie siatkowym. Niektóre pomiary skalują względem punktu osnowy projektu: użyj tego, co podaje pomiar.
4. Wybierz {{ui:Zastosuj}}.

:::warning
Wysokość jest brana jako wysokość nad elipsoidą. CivilCraft nie ma modelu geoidy, więc tam, gdzie geoida leży 30 m (100 ft) poniżej lub powyżej elipsoidy, współczynnik wysokości jest błędny o około 5 ppm. Gdy pomiar podaje swój łączny współczynnik, wpisz ten.
:::

## Współrzędne lokalne (przyjęte)

1. Wybierz {{ui:Lokalne}}.
2. Przy **Punkt osnowy 1** wpisz numer punktu pomiarowego (albo wybierz {{ui:Wskaż}} i kliknij go na planie). Jego współrzędne lokalne pokażą się obok.
3. Wpisz jego **siatkowe** E i N albo szerokość i długość geograficzną w trzecim polu (na przykład `30.2672, -97.7431`).
4. Zrób to samo dla **Punktu osnowy 2**, jak najdalej od pierwszego.
5. CivilCraft pokazuje znalezione **Skalę** i **Obrót** i przypomina: **Dwa punkty zawsze pasują dokładnie — sprawdź trzeci.**
6. Podaj **Punkt kontrolny** w ten sam sposób. CivilCraft pokazuje, o ile dopasowanie przesuwa go od wpisanych współrzędnych siatki (jego niedomknięcie, w jednostkach projektu i w ppm). Duże niedomknięcie oznacza zły punkt, błąd wpisania albo współrzędne w innej jednostce.
7. Wybierz {{ui:Zastosuj}}.

Skala daleka od 1 (poza zakresem od 0.5 do 2) jest odrzucana: sprawdź punkty i ich jednostki.

## Co sprawdzono

- Współczynnik skali i zbieżność zgadzają się z PROJ (pyproj 3.7.1 z PROJ 9.5.1), biblioteką współrzędnych, z której korzysta większość programów GIS, z dokładnością 1 części na miliard, dla ponad 300 układów o odwzorowaniach konforemnych (stanowy układ płaski, UTM, poprzeczne Mercatora, stożkowe konforemne Lamberta), oraz w przeglądarce przy punkcie wskazanym na planie.
- Kroki terenowe i lokalne przeliczają się tam i z powrotem z dokładnością 1 części na miliard; dwa punkty osnowy zwracają skalę i obrót, z którymi zostały wykonane; punkt kontrolny odsunięty o 0.05 ft pokazuje niedomknięcie 0.05 ft.
