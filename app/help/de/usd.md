---
title: 3D-Gelände als USD exportieren
summary: Die 3D-Geländeansicht (Oberflächen, Linien, Trassen, Rohrleitungen und Punkte) im wahren Maßstab und mit den echten Koordinaten als USD schreiben.
keywords: usd, usda, usdc, usdz, OpenUSD, Export, 3D, Gelände, Oberfläche, Trasse, Punkte, Koordinaten, Szenenaufbau
from: e7be08ec
---

In der 3D-Ansicht schreibt {{ui:USD}} neben {{ui:GLB}} und {{ui:OBJ}} das, was die Ansicht zeigt, als USD.

1. Öffnen Sie die 3D-Ansicht und wählen Sie, was angezeigt werden soll.
2. Öffnen Sie {{ui:USD}} und wählen Sie {{ui:Text (.usda)}}, {{ui:Binär (.usdc)}} oder {{ui:Paket (.usdz)}}.

Die Datei ist im wahren Maßstab (die vertikale Überhöhung wird wieder herausgerechnet), in Metern mit Z nach oben. Das Gelände liegt bei seinen Projektrechts- und Hochwerten sowie Höhen und nennt sein Koordinatensystem, wenn das Projekt eines hat. Oberflächen, Rohrleitungen und Bauwerke sind Netze mit ihren Farben; Höhenlinien, Bruchkanten und Korridorlinien sind Linien; jede Trasse ist eine eigene Linie unter ihrem Namen; Punkte behalten ihre Nummern.
