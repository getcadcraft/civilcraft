---
title: Ogrodzenia
summary: Ogrodzenie wzdłuż linii, działki lub placu: słupki, poprzeczki, panele lub sztachety, bramy, pochyłe lub schodkowe na terenie, zestawienie, symbole na planie i elementy IFC. Dostępne także dla asystenta.
keywords: ogrodzenie, słupki, poprzeczki, panele, sztachety, brama, pochyłe, schodkowe, teren, zestawienie, ifc, balustrada, granica
from: c0e7b84a
---

Wykonaj ogrodzenie wzdłuż linii elementu, osi trasy, działki lub placu, a słupki i bramy zostaną ustawione za Ciebie.

## Wykonaj ogrodzenie

1. Zaznacz linię, działkę lub plac.
2. Otwórz **Powierzchnia, Więcej, Ogrodzenia...**
3. Wybierz styl (panele, poprzeczki lub sztachety), pochyłe lub schodkowe, wysokość, rozstaw słupków i szerokość bramy, a następnie **Ogrodzenie wzdłuż zaznaczenia** albo **Z bramą**, aby umieścić bramę na środku najdłuższego prostego odcinka.

Słupki stawiane są na końcach, w każdym narożniku (wierzchołku, który skręca o 20 stopni lub więcej), po obu krawędziach każdej bramy oraz w równych przęsłach pomiędzy nimi, żadne nie dłuższe niż rozstaw. **Pochyłe** panele podążają za terenem między swoimi słupkami. **Schodkowe** panele pozostają poziome i schodzą stopniami przy słupkach; szczelina pod panelem jest najszersza przy słupku położonym niżej, a okno ostrzega, gdy szczelina przekracza limit lub gdy teren wznosi się pod panelem. Bramy o szerokości 6 stóp (1.8 m) i większej mają dwa skrzydła; plan pokazuje skrzydła otwarte wraz z kierunkiem obrotu.

## Zestawienie i wyniki

Każde ogrodzenie pokazuje swoją długość, słupki według rodzaju, panele, bramy i stopnie, a także zestawienie **CSV** słupków, paneli, poprzeczek, sztachet i bram. Plan zawiera warstwy ogrodzenia (C-FENC, C-FENC-POST, C-FENC-GATE) dla PDF, DXF i DWG. Eksport IFC zawiera słupki (IfcMember, post), panele (IfcRailing, user defined fence panel), poprzeczki (IfcMember) i bramy (IfcDoor, gate), jeden system na każde ogrodzenie.

## Od asystenta

`fence_build` tworzy ogrodzenie (punkty albo nazwaną linię, działkę lub plac, bramy według kilometrażu), a `fence_list` wyświetla ogrodzenia wraz z ich zestawieniem.

## Czego nie ma

Wymiary startowe są typowymi wyborami, a nie normą. Typy z Biblioteki są przenoszone tylko jako nazwa. Bramy muszą leżeć w jednym prostym odcinku. BimCraft nie ma jeszcze tego narzędzia.
