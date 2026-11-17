---
title: Eksport terenu w 3D
summary: Zapisz to, co pokazuje widok 3D, jako plik GLB lub OBJ dla innych programów 3D, w metrach z osią Y w górę, względem lokalnego punktu początkowego zapisanego w pliku.
keywords: glb, gltf, obj, eksport 3d, eksport modelu, silnik gry, wizualizacja, przeglądarka 3d, metry, oś y w górę, początek, lokalny początek, układ płaski
from: 07d23992
---

Widok 3D eksportuje to, co pokazuje, jako model 3D, który może otworzyć inny program: przeglądarka 3D, modeler, silnik gry lub narzędzie wizualizacji.

## Eksport

1. Otwórz widok 3D ({{key:D}}) i wybierz, co ma być widoczne, używając {{ui:Pokaż}}. To, co jest ukryte, nie jest eksportowane.
2. Kliknij {{ui:GLB}} albo {{ui:OBJ}} na pasku.
   Plik pobiera się jako "*nazwa projektu*-3d.glb" lub "-3d.obj", a pasek stanu podaje początek.

## Co zawierają pliki

| | GLB | OBJ |
|---|---|---|
| Powierzchnie | Siatki z normalnymi oraz kolorami pasm lub powierzchni | Siatki z normalnymi (bez kolorów) |
| Rurociągi i budowle | Okrągłe siatki, problematyczne na czerwono | Okrągłe siatki |
| Warstwice, linie przełamania, trasy, znaczniki, krawędzie korytarza i linie placów | Linie, każdy zestaw w swoim kolorze | Rekordy linii (`l`) |
| Punkty pomiarowe | Punkty | Rekordy punktów (`p`) |

Każdy zestaw zachowuje swoją nazwę („Istniejący teren”, „Rurociągi”, „Główne warstwice” itd.), dzięki czemu możesz ukryć go lub nadać mu styl w drugim programie.

## Jednostki, osie i początek

- **Metry.** Projekt w stopach jest przeliczany z US survey feet (1 ft = 1200/3937 m).
- **Oś Y w górę**, zwykła konwencja tych formatów: wschód staje się +X, rzędna +Y, a północ −Z.
- **Skala rzeczywista.** Przewyższenie pionowe widoku nie jest stosowane.
- **Lokalny początek.** Współrzędne układu płaskiego to miliony stóp, zbyt duże dla liczb pojedynczej precyzji, które te formaty przechowują, dlatego plik jest zapisywany względem pobliskiego początku: własnego początku istniejącego terenu dla wschodu i północy, a dla rzędnej — jego najniższej wartości zaokrąglonej w dół. Początek w jednostkach projektu jest zapisany w pliku: w GLB jako `extras` na scenie i jej węźle głównym, w OBJ jako wiersz komentarza blisko początku pliku (`# origin easting … northing … elevation …`). Aby umieścić model z powrotem we współrzędnych projektu, dodaj początek (po przeliczeniu metrów z powrotem na stopy w projekcie w stopach).

## Jeszcze nie zbudowano

- Eksport przewyższonego widoku albo eksport w jednostkach projektu zamiast w metrach.
- Tekstury, plik materiałów dla OBJ (.mtl) oraz właściwości obiektów (nazwy rurociągów i budowli są tylko w CivilCraft).
- Eksport korytarza jako osobnych brył albo widoku profilu w 3D.
