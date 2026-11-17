---
title: Baukörper auf einem Grundstück zeichnen
summary: Einen Baukörper auf einer Parzelle zeichnen, ihm Geschosse und eine Geschosshöhe geben, seine Bruttogeschossfläche sehen, wählen, wie er auf geneigtem Gelände sitzt, seine Höhe in 3D drücken und ziehen, und ihn an BimCraft senden oder als IFC-Datei speichern.
keywords: Baukörper, Massenmodell, Volumen, Grundfläche, Geschosse, Geschosshöhe, Bruttogeschossfläche, BGF, Hang, Sockel, Abtrag und Auftrag, Drücken Ziehen, 3D, Grundstücksstudie, Vorentwurf, IFC, entwickeln, BimCraft, A-MASS
from: e5a67c16
---

Ein Baukörper ist eine Grundfläche, eine Anzahl Geschosse und eine Geschosshöhe. Er beantwortet die frühe Frage: wie viel Gebäude hier hineinpasst und was es mit dem Gelände macht. Baukörper liegen mit ihrem Namen, ihrer Geschosszahl und ihrer Bruttogeschossfläche im Plan. Sie gehen mit den Ebenen `A-MASS` und `A-MASS-TEXT` in den PDF-Plot und in die DWG- und DXF-Exporte und werden in der Projektdatei gespeichert.

## Einen Baukörper zeichnen

1. Klicken Sie in **Eigenschaften** unter **Baukörper** auf **Baukörper zeichnen**. (Er ist auch im Menü **Mehr** der Symbolleiste neben **Geländemodell** zu finden.)
2. Klicken Sie die Ecken der Grundfläche an. Ein Klick nahe einer Parzellenecke oder einem Vermessungspunkt übernimmt dessen genaue Lage.
3. Klicken Sie die erste Ecke erneut an oder drücken Sie {{key:Enter}}, um abzuschließen. {{key:Backspace}} nimmt die letzte Ecke zurück, {{key:Esc}} hört auf.

Ein neuer Baukörper hat drei Geschosse und eine Geschosshöhe von 12 ft (3.6 m). Er gehört zu der Parzelle, in der seine Mitte liegt.

## Geschosse, Höhe und Fläche

Klicken Sie einen Baukörper an, um seinen **Namen**, seine **Nutzung**, die **Geschosse**, die **Geschosshöhe** und die **Parzelle** zu ändern. **Höhe** ist Geschosse mal Geschosshöhe. Geben Sie eine Höhe ein, dann wird die Geschosszahl auf die nächste ganze Zahl gesetzt (nie weniger als eins). **Grundfläche** und **Bruttogeschossfläche** (Grundfläche mal Geschosse) werden für Sie berechnet.

## Auf geneigtem Gelände

Das Gelände unter einem Baukörper wird aus dem Geländemodell gelesen: das bestehende Gelände oder das geplante Gelände, wenn Sie **Geplantes Gelände (planiert)** gewählt haben. **Auf geneigtem Gelände** legt fest, wo das Erdgeschoss liegt:

- **Gestuft**: auf Höhe des mittleren Geländes unter der Grundfläche. Die tiefe Seite wird bis dahin aufgefüllt, die hohe Seite abgegraben. Beides gleicht sich nahezu aus.
- **Sockel**: auf dem höchsten Gelände. Ein massiver Sockel füllt die tiefe Seite auf.
- **Abtrag**: auf dem tiefsten Gelände. Die hohe Seite wird in den Hang abgetragen.

Eigenschaften zeigt die Spanne des Geländes unter dem Baukörper, das **Erdgeschossniveau** und das Volumen an Auftrag und Abtrag zwischen dem Gelände und diesem Niveau. Ein Punkt der Grundfläche, der außerhalb der Oberfläche liegt, wird ausgelassen. Eigenschaften sagt, wie viele es sind.

## In der 3D-Ansicht

Baukörper werden in der 3D-Geländeansicht gezeichnet, mit einer Linie um jedes Geschoss und ihren Namen über dem Dach. **Anzeigen** hat ein Kontrollkästchen für **Baukörper**. Klicken Sie einen an, um ihn auszuwählen. Bei ausgewähltem Baukörper:

- Ziehen Sie sein Dach nach oben oder unten, um es geschossweise zu drücken oder zu ziehen, oder drücken Sie {{key:PageUp}} und {{key:PageDown}};
- die gesamte Verschiebung ist ein Schritt, den Sie rückgängig machen können.

Die Straßenansicht von **Fahren** zeigt die Baukörper ebenfalls, und **Sonne** wirft ihre Schatten auf das Gelände.

## Weitergeben

- **Baukörper als IFC** speichert jeden Baukörper als IFC4-Datei: ein Grundstück, ein Gebäude mit seinen Geschossen und den Baukörper als Gebäudeelement, dessen Werte im Eigenschaftssatz `CadCraft_SiteMass` stehen. Ist am Projekt ein Koordinatensystem eingestellt, wird die Datei auf die Karte gesetzt und trägt Breiten- und Längengrad des Grundstücks. Ohne Koordinatensystem sagt sie nichts über ihre Lage.
- **In BimCraft entwickeln** öffnet BimCraft in einem neuen Tab mit den Baukörpern. Dort zeigt die Auswahl eines Baukörpers seine Werte und **Diesen Baukörper entwickeln**. Das erstellt auf jedem Geschoss Wände und unter dem Gebäude aus der Grundfläche eine Decke, in einem Schritt, den Sie rückgängig machen können. Nichts wird hochgeladen: Die Datei wandert zwischen den beiden Tabs dieses Browsers.

Siehe auch **Zonierungsgrenzen** und **Sonnenstunden**.
