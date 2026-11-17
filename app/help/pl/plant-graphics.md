---
title: Grafika roślin wg skali, własne symbole i rośliny 3D
summary: Jak rośliny są rysowane w planie przy każdej skali rysunku i poziomie szczegółowości oraz jak rekord rośliny dostaje własny symbol (SVG albo blok DXF/DWG) i własny model 3D (OBJ, STL lub GLB).
keywords: grafika roślin, symbol rośliny, symbol wg skali, poziom szczegółowości, szczegółowość, prosty okrąg, zarys, szczegółowy symbol, własny symbol, blok, svg, dxf, dwg, roślina 3D, własny model 3D, obj, stl, glb, gltf, model drzewa, rośliny w 3D
from: 875837d9
---

## Symbole w planie wg skali

Krajobraz › {{ui:Więcej}} › {{ui:Grafika roślin}} określa, jak rośliny są rysowane w planie. **Automatycznie, wg skali** wybiera jeden z trzech poziomów na podstawie skali rysunku:

- **Prosty okrąg** (przy skali mniejszej niż 1:500): okrąg o rozpiętości rośliny.
- **Zarys ze środkiem** (od 1:500 do 1:200): okrąg i mały krzyżyk w środku.
- **Szczegółowy symbol** (przy skali większej niż 1:200): własny symbol rekordu, jeśli go ma, w przeciwnym razie wbudowany symbol.

Zmień obie skale przyciskami **Prosty od 1:** i **Zarys od 1:** albo wybierz jeden poziom dla wszystkich skal. Każdy zestaw arkuszy w oknie Arkusze ma własną **Szczegółowość roślin w planie**, więc plan terenu 1:500 i plan nasadzeń 1:100 mogą się różnić. Ustawienia są zapisywane razem z projektem.

## Własny symbol

Wybierz roślinę w sekcji **Rośliny** i wybierz {{ui:Własny symbol…}}. Program odczytuje plik SVG albo blok z rysunku DXF lub DWG (gdy rysunek ma kilka bloków, wybierasz jeden). Symbol jest dopasowywany do rozpiętości rośliny i rysowany na poziomie szczegółowym. Jest zapisywany w projekcie, więc przenosi się razem z nim.

- Z pliku SVG odczytywane są linie, polilinie, wielokąty, prostokąty, okręgi, elipsy i ścieżki. Skrypty, style, odnośniki i obrazy w nim nigdy nie są analizowane. Przekształceń nie stosuje się: program informuje, gdy plik je zawiera, więc najpierw zastosuj je w swoim programie do rysowania.
- Limity: 512 KB pliku SVG i 2000 kształtów. Większy plik zostanie odrzucony z podaniem przyczyny.

## Własna roślina 3D

{{ui:Własny model 3D…}} przy tym samym rekordzie odczytuje plik **OBJ**, **STL** lub **GLB**. Następnie w Grafice roślin ustaw **Rośliny w 3D** na **Własny model każdego rekordu**: każda roślina tego rekordu pokazuje twój model, przeskalowany do jej wysokości i rozpiętości. Rekordy bez własnego modelu zachowują wbudowane formy. Wybierz **Uproszczone bryły**, aby szybko podejrzeć duże tereny.

Z pliku GLB odczytywany jest tylko kształt:

- Wszystko, czego model potrzebuje, musi znajdować się w pliku .glb. Model wskazujący na inne pliki (osobny .bin lub obrazy po adresie) zostanie odrzucony: nic nie jest pobierane.
- Skompresowana lub spakowana geometria (Draco, meshopt, kwantyzowane pozycje) nie jest odczytywana. Eksportuj bez kompresji.
- Tekstury i kolor w pliku nie są używane: model jest rysowany w kolorze rośliny. Tekstury są nadal sprawdzane, a tekstura większa niż 4096 pikseli na bok zostaje odrzucona.
- Limity: plik 32 MB, 50 000 trójkątów (liczone są wszystkie kopie części umieszczonych więcej niż raz), 64 obrazy i 16 MB obrazów.

Każdy limit odrzuca plik z podaniem przyczyny; nic niedoczytanego nie jest zachowywane. Jeden krok cofnięcia przypisuje rekordowi symbol lub model, a {{ui:Usuń własny symbol}} albo {{ui:Usuń własny model 3D}} usuwa go ponownie.

Rekord rośliny opisano w [Rekordy roślin](topic:plant-records), a teren w 3D w [Podgląd terenu w 3D](topic:site-3d).
