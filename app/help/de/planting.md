---
title: Pflanzpläne und Pflanzenlisten
summary: Einzelne Pflanzen, Pflanzbeete mit Pflanzen im Abstand der Pflanzen und nach Anteilen gemischt, sowie Hecken setzen; beschriften; in einer Pflanzenliste für eine Tabellenkalkulation oder TakeoffCraft zählen.
keywords: Pflanzplan, Pflanzenliste, Pflanzbeet, Massenpflanzung, Hecke, Baum, Strauch, Bodendecker, Abstand, Dreiecksabstand, Pflanzenanzahl, Mengen, Beschriftungen, Krone, Pflanzenzeichen, IFC, TakeoffCraft
from: ab49eab5
---

## Pflanzen setzen

1. Wählen Sie links im Bereich **Pflanzen** eine Pflanze.
2. Klicken Sie auf {{ui:Pflanze}} und dann auf den Plan: Jeder Klick setzt eine Pflanze. Drücken Sie {{key:Esc}}, um aufzuhören.

Ein Pflanzenzeichen wird mit seiner Breite im ausgewachsenen Zustand gezeichnet; Mehr › {{ui:In Pflanzgröße anzeigen}} zeichnet jede Pflanze in der Größe, in der sie gesetzt wird. Bäume sitzen auf dem Gelände: Wenn Sie das Gelände später modellieren, folgen sie ihm. Um eine Pflanze auf eine bestimmte Höhe festzulegen, geben Sie sie unter **Höhe** in den Eigenschaften ein.

## Pflanzbeete

1. Wählen Sie die Hauptpflanze, klicken Sie auf {{ui:Beet}} und klicken Sie auf die Ecken des Beets. Drücken Sie {{key:Enter}} (oder klicken Sie erneut auf die erste Ecke), um es zu schließen.
2. Das Beet füllt sich mit dieser Pflanze im Abstand der Pflanze, in einem **dreieckigen** Muster (das übliche: jede Pflanze hat denselben Abstand zu sechs anderen), einen halben Abstand vom Rand entfernt.
3. Unter den Eigenschaften mischt **Pflanze hinzufügen** die links gewählte Pflanze ein. Setzen Sie den **Anteil %** jeder Pflanze: Das Beet nimmt genau so viele davon, verteilt über die Fläche. **Neu mischen** verteilt die Pflanzen neu.

Bleibt **Abstand** leer, werden die eigenen Abstände der Pflanzen verwendet (gewichtet nach ihren Anteilen); geben Sie einen Wert ein, um ihn für alle Pflanzen zu verwenden. **Muster** kann quadratisch sein, und **Reihen ausrichten** dreht die Reihen.

## Hecken

Wählen Sie die Heckenpflanze, klicken Sie auf {{ui:Hecke}}, klicken Sie entlang der Hecke und drücken Sie {{key:Enter}}. Die Pflanzen stehen auf der Linie im Abstand der Pflanze, so zentriert, dass beide Enden denselben Abstand zum Rand haben. Eine Hecke kann **zweireihig, versetzt** sein, mit einem festen Abstand zwischen den Reihen.

## Beschriftungen

Einzelne Pflanzen werden mit der Beschriftungseinstellung beschriftet (standardmäßig `{name}`); geben Sie für eine Pflanze unter den Eigenschaften eine eigene Beschriftung ein. Beete werden mit der Anzahl jeder Pflanze beschriftet, Hecken mit ihrer Anzahl. Mehr › {{ui:Pflanzenbeschriftungen}} schaltet Beschriftungen ein und aus. Beschriftungsfelder: `{name}`, `{botanical}`, `{size}` (der Behälter), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Die Pflanzenliste

Mehr › {{ui:Pflanzenliste…}} zählt jede Pflanze nach Art, aus einzelnen Pflanzen, Beeten und Hecken zusammen, mit ihrer Pflanzgröße. Speichern Sie sie als **CSV** oder **XLSX** oder senden Sie sie **an TakeoffCraft**: eine Mengendatei, die TakeoffCraft öffnet, um die Pflanzen zu bepreisen (mit den Hartflächen- und Bewässerungsmengen daneben).

## IFC

Mehr › {{ui:Landschafts-IFC exportieren}} speichert die Landschaft als IFC-Datei (IFC 4.3), die ein BIM-Modell aufnehmen kann: jede Pflanze als `IfcGeographicElement` vom Typ VEGETATION, nach ihrer Art typisiert, mit den Eigenschaften der Pflanze (botanischer Name, Größen, Winterhärte, Wasser, Licht); jedes Beet und jede Hecke als ein Element mit ihren Zählungen, auf dem Gelände. BimCraft öffnet es neben dem Gebäude.
