---
title: Obiekty z linii, z zachowanym powiązaniem
summary: Twórz nawierzchnię, obszar nasadzeń, rabatę, żywopłot, ścieżkę, mur, krawężnik, schody, pochylnię, platformę, zagłębienie odwadniające albo linię charakterystyczną z linii; obiekt podąża za linią, gdy ta się przesunie, dopóki nie przerwiesz powiązania.
keywords: z linii, linie rysunku, DWG, DXF, powiązanie, powiązany, podążaj, regeneruj, przerwij powiązanie, linia charakterystyczna, linia z rysunku, zaimportowana warstwa, zarys, SuperCad Studio, linia rysunku
from: eb67a0c6
---

{{ui:Z linii}} (Krajobraz › {{ui:Więcej}}): kliknij linię charakterystyczną albo linię lub zarys zaimportowanej warstwy DWG/DXF. Linia zamknięta może utworzyć nawierzchnię, trawnik, obsadzoną rabatę, łąkę, okrywę roślinną, klomb albo platformę; linia otwarta — ścieżkę, mur, krawężnik, schody (ich pierwszy i ostatni punkt), pochylnię, żywopłot lub zagłębienie odwadniające. Każdy rodzaj może utworzyć **linię charakterystyczną**, z wyjątkiem samej linii charakterystycznej.

## Linia charakterystyczna z linii

Linia charakterystyczna utworzona z linii przejmuje jej punkty, zamknięta, jeśli linia była zamknięta. Jej rzędne są układane na istniejącym terenie (0, gdy tego terenu jeszcze nie ma), a jej zastosowanie to **Wyłącz**: nie kształtuje terenu, dopóki nie wybierze się zastosowania i nie ustawi rzędnych we Właściwościach. Gdy linia się przesunie, linia charakterystyczna o tej samej liczbie punktów zachowuje każdą ustawioną rzędną; gdy linia zyska albo straci punkty, rzędne są układane na terenie od nowa. Zobacz [Linie charakterystyczne](topic:feature-lines).

Nowy obiekt zachowuje **powiązanie** ze swoją linią. Gdy linia się przesunie (przeciągnięte punkty, przesunięty albo ponownie odczytany rysunek), obiekt przyjmuje nowy kształt w tym samym kroku cofnięcia, a przez modyfikatory terenu podąża za nim projektowany teren. Właściwości mówią, z czym obiekt jest powiązany; {{ui:Przerwij powiązanie}} czyni go wolnym.

Linie są najpierw sprawdzane: linia potrzebuje co najmniej 2 punktów (3 dla zarysu), co najwyżej 5000, liczb rzeczywistych; zarys musi być zamknięty i nie może przecinać samego siebie. Linia, która nie przechodzi kontroli, nie jest używana: obiekt pozostaje taki, jaki był, a panel Problemy podaje przyczynę. Jeśli linia zostanie usunięta, obiekt pozostaje, a panel Problemy to odnotowuje.

## W SuperCad Studio

Otwórz teren i rysunek 2D w tym samym projekcie. Wybierz jedną linię lub polilinię w rysunku 2D, naciśnij Ctrl+K i uruchom {{ui:Obiekt krajobrazu z wybranej linii rysunku}}: CivilCraft pyta, co utworzyć, jak wyżej, a obiekt pozostaje powiązany z tą linią rysunku. Po zmianie linii w rysunku Ctrl+K {{ui:Zaktualizuj krajobraz z rysunku}} sprawia, że obiekty podążają za nimi, po jednym kroku cofnięcia na każdą linię. Plik powiązań projektu zapisuje, który obiekt podąża za którą linią. Własna pomoc SuperCad Studio ma temat Krajobraz.
