---
title: Eksport i import IFC
summary: Zapisz cały projekt jako jeden plik IFC w wersji IFC 4.3, IFC4 lub IFC2x3 (osie tras, drogi, roboty ziemne, powierzchnie, mury, rurociągi) oraz otwieraj pliki IFC, aby odczytać ich osie tras i powierzchnie.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, oś trasy, ifcalignment, droga, ifcroad, roboty ziemne, TIN, dokumentacja do przekazania, zamówienie publiczne, eksport ifc, import ifc
from: 6b998bcf
---

IFC to otwarty format wymiany, o który wielu publicznych zamawiających prosi jako o dokumentację do przekazania. CivilCraft zapisuje cały projekt w jednym pliku IFC i odczytuje osie tras oraz powierzchnie z plików IFC.

## Eksport

1. Kliknij {{ui:IFC}} w grupie **Eksport** (w stylach wstążki: {{ui:Wyjście}} › {{ui:Eksport}} › {{ui:IFC}}).
2. Wybierz schemat. **IFC 4.3 ADD2** jest pierwszy i domyślny: to wydanie z osiami tras, drogami i robotami ziemnymi. Wybierz IFC4 lub IFC2x3 tylko wtedy, gdy oprogramowanie odbiorcy nie czyta wersji 4.3.
3. Okno dialogowe mówi, co zawiera plik i czego nie obejmuje wybrany schemat. Kliknij {{ui:Eksport IFC}}.
   Plik pobiera się jako "*nazwa projektu*-ifc4x3.ifc", "-ifc4.ifc" lub "-ifc2x3.ifc". CivilCraft pamięta schemat wybrany ostatnio.

## Co zawiera każdy schemat

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Osie tras | IfcAlignment z układem poziomym (odcinki, łuki kołowe, spirale klotoidalne) i pionowym (spadki, łuki paraboliczne), ich krzywe (IfcCompositeCurve, IfcGradientCurve), kilometraż początkowy i zdarzenia przechyłki | Polilinia 3D na elemencie civil | Polilinia 3D na obiekcie proxy |
| Korytarze | IfcRoad z częściami drogi; pasy, pobocza, rowy i chodniki jako IfcPavement, krawężniki jako IfcKerb, pasy zieleni; każda warstwa nawierzchni jako IfcCourse z grubością, materiałem i objętością; skarpy jako IfcEarthworksCut i IfcEarthworksFill z objętościami wykopu i nasypu; prędkość projektowa i klasa | Elementy civil nazwane zgodnie z tym, czym są, pogrupowane na drogę | Obiekty proxy, pogrupowane na drogę |
| Powierzchnie | IfcGeographicElement TERRAIN z nieregularną siatką trójkątów (TIN) | Zbiory ścian trójkątnych | Modele powierzchni oparte na ścianach (większe pliki) |
| Place i mury | Górna powierzchnia placu, jego skarpy jako roboty ziemne, mury oporowe jako IfcWall RETAININGWALL | Tak samo, mur jako typ muru zdefiniowany przez użytkownika | Tak samo, typ muru w ObjectType |
| Sieci rurociągów | IfcPipeSegment i IfcDistributionChamberElement w IfcDistributionSystem | Tak samo | IfcFlowSegment i studzienki w IfcSystem |
| Georeferencja | IfcProjectedCRS i IfcMapConversion | Tak samo | ePSet_ProjectedCRS i ePSet_MapConversion na terenie budowy |

Linia **kolejowa** (oś trasy z włączoną opcją **Kolej**) trafia do IFC 4.3 jako IfcRailway: jej przejścia jako osobne typy (klotoida, parabola sześcienna, Bloss, Helmert, półfala sinusoidy jako krzywa cosinusowa, sinusoida), jej przechyłka jako IfcAlignmentCant, a tor jako szyny, podkłady i podsypka z podbudową pod nią. IFC4 i IFC2x3 otrzymują te same części jako elementy civil lub obiekty proxy. Otwarcie linii kolejowej IFC 4.3 przywraca jej przejścia i przechyłkę.

Każdy plik zawiera też działki (obrysy), rośliny i nawierzchnie z przestrzeni roboczej Krajobraz oraz bryły budynków (każda jako IfcBuilding z kondygnacjami), wszystko na jednym terenie budowy. Zestawy właściwości przechowują to, co zaprojektowano: kilometraże, przekrój typowy, pochylenia wykopów i nasypów, szerokość i liczbę pasów, rzędne dna, rzędne włazów, wysokości murów; ilości (długości, pola, objętości) są zestawami IfcElementQuantity.

## Jednostki i współrzędne

Plik używa jednostki długości projektu (metry lub US survey feet); pola i objętości są w metrach kwadratowych i sześciennych. Przy układzie współrzędnych (GIS › Współrzędne) plik zostaje umieszczony na mapie: wschód i północ jego początku oraz obrót i skala lokalnego układu (terenowego) są zapisane w przekształceniu mapy. Bez układu plik zapisuje swój lokalny początek w zestawie właściwości i nie jest umieszczany na mapie.

## Import

Otwórz plik .ifc przyciskiem {{ui:Otwórz}} albo upuść go na plan. Okno importu mówi, co zawiera plik:

- **Osie tras** z IFC 4.3 (układy poziomy i pionowy) oraz krzywe osi tras z IFC 4x1 stają się osiami tras CivilCraft z ich PI, promieniami, długościami spiral i PVI. Oś, której model PI CivilCraft nie może przechować (krzywe złożone, spirale między dwiema krzywymi, oś zaczynająca się lub kończąca w krzywej), nie jest importowana, a okno mówi dlaczego.
- **Powierzchnie**: wybierz tę, która stanie się terenem istniejącym, albo zachowaj tę z projektu.
- **Wszystko inne** (oraz pozostałe powierzchnie) można pokazać w widoku 3D jako odniesienie. Elementy odniesienia pozostają, dopóki projekt jest otwarty; nie są zapisywane w pliku projektu.

Plik zapisany przez CivilCraft w IFC4 lub IFC2x3 odtwarza swoje osie tras dokładnie z zestawów właściwości.

## Jeszcze nie zbudowano

- Przechyłka drogi jest zapisywana jako zdarzenia przechyłki i w powierzchniach drogi (przechyłka toru dotyczy kolei).
- Zapisywanie elementów odniesienia w pliku projektu oraz import sieci rurociągów lub placów z IFC jako obiektów edytowalnych.
