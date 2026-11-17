---
title: Eksport terenu 3D jako USD
summary: Zapisz widok 3D terenu (powierzchnie, linie, trasy, rurociągi i punkty pomiarowe) jako USD w prawdziwej skali i prawdziwych współrzędnych.
keywords: usd, usda, usdc, usdz, openusd, eksport, 3d, teren, powierzchnia, trasa, punkty pomiarowe, współrzędne, składanie sceny
from: e7be08ec
---

W widoku 3D {{ui:USD}} obok {{ui:GLB}} i {{ui:OBJ}} zapisuje to, co pokazuje widok, jako USD.

1. Otwórz widok 3D i wybierz, co pokazać.
2. Otwórz {{ui:USD}} i wybierz {{ui:Tekst (.usda)}}, {{ui:Binarny (.usdc)}} albo {{ui:Paczka (.usdz)}}.

Plik jest w prawdziwej skali (przewyższenie pionowe jest cofane), w metrach, z osią Z skierowaną w górę. Teren znajduje się w swoich współrzędnych wschodnich, północnych i rzędnych projektu i podaje swój układ współrzędnych, jeśli projekt go ma. Powierzchnie, rurociągi i budowle są siatkami z ich kolorami; poziomice, linie przełamania i linie korytarza są liniami; każda trasa jest osobną linią pod swoją nazwą; punkty pomiarowe zachowują swoje numery.
