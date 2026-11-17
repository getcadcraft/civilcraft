---
title: Sieci uzbrojenia i OpenStreetMap
summary: Odcinki wody, kanalizacji, wód opadowych, gazu, energetyki i telekomunikacji z materiałem, średnicą, przykryciem i właścicielem; dane OpenStreetMap z pliku JSON Overpass; kolizje, przekroje wykopów i objętości; warstwy usług w DWG, DXF i PDF; segmenty rur i kabli IFC.
keywords: uzbrojenie, uzbrojenie terenu, sieć, osm, openstreetmap, overpass, rura, kabel, gaz, kanalizacja, deszczowa, telekomunikacja, zasilanie, woda, hydrant, studzienka, wykop, kolizja, prześwit, przykrycie, głębokość, dwg, ifc, georeferencyjny, warstwy
from: 8a85dace
---

Narysuj podziemne instalacje terenu jako jedną sieć dla każdej usługi, sprawdź, gdzie się przecinają, i wyślij je jako warstwy rysunku oraz jako IFC.

## Utwórz odcinki

Otwórz **Powierzchnia, Więcej, Sieci uzbrojenia...**

- **Utwórz odcinek z zaznaczenia** zamienia zaznaczoną trasę (oś), linię charakterystyczną lub rurę w odcinek wybranej usługi. Następnie wypełnij w tabeli materiał, średnicę (mm), przykrycie (głębokość do wierzchu rury lub kabla) i właściciela.
- **Odczytaj dane OpenStreetMap** odczytuje zapisany plik JSON Overpass (zapytanie z `out geom;`). Projekt najpierw potrzebuje układu współrzędnych, ponieważ pozycje OpenStreetMap są podawane jako szerokość i długość geograficzna. Odczytywane są rurociągi (według substancji), podziemne kable energetyczne i telekomunikacyjne, hydranty, studzienki oraz kanały deszczowe. Wszystko inne jest liczone jako pominięte i podawane w komunikacie. Linie napowietrzne są pomijane.
- **Dodaj mapę OpenStreetMap** dodaje mapę OpenStreetMap pod planem. Rysowana jest tylko wtedy, gdy warstwy map z internetu są włączone w Ustawieniach.

## Kontrole i wyniki

- **Kolizje**: odcinki różnych usług, które przecinają się w rzucie, są wymienione wraz z wysokością prześwitu między nimi, jeśli istnieje powierzchnia terenu. Minimum jest wartością zastępczą, którą ustawiasz, a nie liczbą z normy.
- **Wykop**: każdy odcinek ma wykop (średnica rury plus prześwit z każdej strony, nachylenie skarpy, podsypka) wraz z objętością. Suma pokazuje się w oknie i w pliku CSV.
- **Rysunek**: odcinki i punkty leżą na warstwach usług (na przykład U-WATR-RUN, U-POWR-RUN), więc trafiają do PDF, DXF i DWG.
- **IFC**: odcinki trafiają do eksportu IFC jako segmenty rur i segmenty kabli, wraz z hydrantami, zaworami i komorami. Każda usługa to osobny system, we współrzędnych projektu.

## Dane OpenStreetMap

Dane OpenStreetMap są objęte prawami autorskimi OpenStreetMap contributors i udostępniane na licencji ODbL. Atrybucja jest dodawana do rysunku, pliku CSV i IFC. Jeśli udostępniasz plik zawierający dane OpenStreetMap, zachowaj atrybucję i zapoznaj się z warunkami licencji dotyczącymi udostępniania na tych samych warunkach.

## Czego jeszcze nie ma

Odcinków nie rysuje się jeszcze punkt po punkcie na planie za pomocą narzędzia, a kolizji nie rysuje się jeszcze w widoku profilu (obliczenie jest gotowe). Głębokości, średnice i prześwity są wartościami zastępczymi: użyj wartości z własnej normy.
