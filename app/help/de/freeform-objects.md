---
title: Freiformobjekte
summary: Bringen Sie eine Form aus einer anderen App (STL, OBJ oder ein Bibliothekselement) auf das Baufeld; sie steht auf dem Gelände oder wird ins Gelände eingeschnitten, und ihr Volumen, ihre Oberfläche und ihre Grundfläche werden wie alles andere gezählt.
keywords: Freiform, benutzerdefiniertes Objekt, Skulptur, Pflanzkübel, Sitz, Netz, stl, obj, Bibliothekselement, geländebezogen, dem Gelände folgen, ins Gelände schneiden, Mengen, Volumen, ifc
from: ec835f33
---

Eine Einzelanfertigung (ein Pflanzkübel, eine Sitzmauer, eine Skulptur, ein Spielhügel) kann in ModelCraft oder PartCraft erstellt und hier platziert werden, damit sie im selben Modell und in denselben Listen steht wie alles andere.

1. Gelände › Mehr › {{ui:Freiformobjekt…}} und wählen Sie eine **STL**- oder **OBJ**-Datei (in den Einheiten des Projekts: Fuß in einem Fuß-Projekt, Meter in einem Meter-Projekt) oder ein CadCraft-**Bibliothekselement** (`.json`) mit einem Netzkörper.
2. Klicken Sie, wo es hinkommt.

## Seine Aufstandsfläche

- **Folgt dem Gelände**: Sein tiefster Punkt liegt auf dem tiefsten Gelände unter seinem Grundriss, sodass nichts schwebt. Die Eigenschaften schätzen, wie viel davon unter dem Gelände liegt.
- **Schneidet ins Gelände**: Seine Basis wird auf eine Höhe gesetzt, und das Gelände innerhalb seines Grundrisses wird mit Böschungsschnitten auf sie modelliert. Das wird in den **Erdarbeiten** wie ein Bauplatz gezählt.

Drehen Sie es mit **Drehen**, ziehen Sie es im Lageplan, um es zu verschieben.

## Gezählt

Die Eigenschaften geben sein **Volumen** (für einen geschlossenen Körper), seine **Oberfläche**, seine **Grundfläche** und seine **Höhe** an, gemessen am Netz. Der IFC-Export schreibt es mit der **IFC-Klasse**, die Sie wählen, und diesen Mengen.

:::note
Die Grundfläche ist die konvexe Hülle des Umrisses: Eine konkave Form (ein L-förmiger Pflanzkübel) wird so modelliert, als wäre sie ausgefüllt.
:::
