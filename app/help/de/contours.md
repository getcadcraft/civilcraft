---
title: Höhenlinien, Höhen und Gefälle ablesen
summary: Höhenlinienabstand und Hauptlinien festlegen, Höhenstufen, Gefällepfeile und Dreiecke anzeigen und die Geländehöhen unter dem Zeiger ablesen.
keywords: Höhenlinien, Höhenlinienabstand, Hauptlinien, Beschriftungen, Höhenstufen, Gefällepfeile, Dreiecke, Höhenkote, Geländeanalyse, Höhenanalyse, Gefälleanalyse
from: 585e500a
---

Das Geländemodell wird mit Höhenlinien angezeigt, sobald es existiert. Alles in diesem Thema wird unter **Anzeige** im linken Bereich eingestellt. Anzeigeeinstellungen ändern nur, was Sie sehen (und was Sie exportieren); sie sind keine Schritte für Rückgängig.

## Höhenlinienabstand festlegen

1. Wählen Sie unter **Anzeige** einen Wert bei **Höhenlinien alle**.
   - In Fuß: 0.25, 0.5, 1, 2, 5, 10 oder 20 ft.
   - In Metern: 0.1, 0.25, 0.5, 1, 2, 5 oder 10 m.
2. Wählen Sie **Hauptlinien alle**: die 2., 4., 5. oder 10. Höhenlinie.
   Hauptlinien werden stärker gezeichnet und mit ihrer Höhe beschriftet. Sie liegen auf ganzzahligen Vielfachen des Hauptabstands (bei 1-ft-Höhenlinien und jeder 5. Hauptlinie: 245, 250, 255 …).
3. Schalten Sie {{ui:Höhenlinienbeschriftung}} aus, wenn die Beschriftungen einen kleinen Plan überladen.

Ein neues Projekt beginnt mit 1 Einheit, wobei jede 5. Höhenlinie eine Hauptlinie ist. Höhenlinien knicken an Bruchkanten ab. Schneiden sie eine Fließlinie oder einen Rücken geradlinig, ist diese Linie noch keine Bruchkante (siehe [Geländemodell aufbauen und verfeinern](topic:build-surface)).

:::note
Höhenlinien werden nur gezeichnet, wenn es zwischen dem tiefsten und dem höchsten Punkt höchstens 2,000 Stufen gibt. Bei stark bewegtem Gelände und einem sehr kleinen Abstand zeigt der Plan gar keine Höhenlinien: Wählen Sie dann einen größeren Abstand.
:::

## Höhenlinien glätten

Höhenlinien werden als gerade Stücke nachgezeichnet, jeweils eines über jedes Dreieck der Fläche. Dadurch bilden sie an jeder Dreieckskante eine kleine Ecke. Die **Höhenlinienglättung** unter **Anzeige** rundet diese Ecken:

- **Keine (gerade Stücke)**: Die nachgezeichneten Linien bleiben, wie sie sind. So zeigt sich eine neue oder ältere Zeichnung.
- **Leicht**: Ecken leicht gerundet. Eine Linie wandert nie mehr als 10 % des Weges zur nächsten Höhenlinie und nie weiter von ihrem geraden Stück weg als ein Sechstel der Länge dieses Stücks.
- **Stark**: ein fließender Bogen. Eine Linie wandert nie mehr als 25 % des Weges zur nächsten Höhenlinie und nie weiter von ihrem geraden Stück weg als ein Drittel der Länge dieses Stücks.

Bei beiden Einstellungen schneidet eine geglättete Höhenlinie jede Dreieckskante weiterhin am selben Punkt wie die nachgezeichnete Linie. Sie bleibt innerhalb des Dreiecks, das ihr Stück durchquert, und kann deshalb nie eine andere Höhenlinie schneiden oder berühren. Wo eine Höhenlinie eine Bruchkante oder die Begrenzung kreuzt, behält sie ihren scharfen Knick. Gezeichnet und exportiert (DXF, DWG, PDF, GIS und 3D) werden die geglätteten Linien, die mehr Stützpunkte haben als die nachgezeichneten.

Die Glättung ändert nur die gezeichneten Linien. Höhen, Volumen, Längsschnitte und Querprofile werden weiterhin aus dem Geländemodell selbst gelesen. Eine Höhenlinie, die genau durch Vermessungspunkte verläuft (ein Punkt bei 250.00 auf der 250-Höhenlinie), behält an jedem solchen Punkt eine kleine Ecke.

## Wie das Geländemodell hinter den Höhenlinien entsteht

Höhenlinien folgen dem Geländemodell, und das Geländemodell folgt der **Methode für Höhenlinien** unter **Geländemodell** im linken Bereich. Die Standardeinstellung **Triangulation mit linearer Interpolation** verbindet Ihre Punkte zu Dreiecken und behält jeden Punkt und jede Bruchkante exakt bei. Die anderen Methoden passen zuerst ein regelmäßiges Raster an die Punkte an (Kriging, minimale Krümmung, natürlicher Nachbar, inverse Distanz und andere). Dadurch werden die Höhenlinien zwischen den Punkten runder, doch die Fläche verläuft nicht exakt durch jeden Punkt. Der Geländemodellbericht unter **Geländemodell** zeigt, wie weit das Ergebnis an Ihren Punkten abweicht.

**ABOS (Approximation auf Basis von Glättung)** ist eine der rasterbasierten Methoden. Sie hat zwei eigene Einstellungen: **Glätte** (anfangs 0.5; niedriger ist glatter) und **Genauigkeit** (anfangs 1: Die Fläche wird an Ihren Punkten auf 1 % der Höhenspanne des Geländes gebracht; geben Sie einen kleineren Wert ein für eine genauere Anpassung). Erreicht sie die Genauigkeit im vorhandenen Raster nicht, meldet der Geländemodellbericht das. Geben Sie dann einen kleineren **Rasterabstand** ein.

## Höhe an beliebiger Stelle ablesen

Bewegen Sie den Zeiger über den Plan. Die Statusleiste zeigt:

- **E** und **N** unter dem Zeiger
- **Gelände** und die Höhe des Bestandsgeländes dort, interpoliert im Dreieck unter dem Zeiger
- **Modelliert** und die geplante Höhe, wo ein Plateau oder ein Korridor das Gelände verändert hat
- „Außerhalb des Geländemodells“ außerhalb der Fläche

Um einen Vermessungspunkt genau abzulesen, wählen Sie {{ui:Wählen}} und klicken Sie auf den Punkt. Der rechte Bereich zeigt seine Nummer, seinen Rechtswert, Hochwert, seine Höhe, Beschreibung und Gruppe.

## Höhenstufen anzeigen

1. Aktivieren Sie {{ui:Höhenstufen}}.
   Das Geländemodell wird farbig gefüllt, von niedrig (blaugrün) bis hoch (ockerbraun). Eine Legende unter den Kontrollkästchen listet den Höhenbereich jeder Stufe auf.
2. Wählen Sie bei **Stufen** die Anzahl der Stufen: 5, 8, 10 oder 12. Die Stufen teilen den Bereich vom niedrigsten bis zum höchsten Punkt in gleiche Schritte.

Höhenstufen dienen nur der Ansicht. Sie werden nicht nach DXF exportiert und nicht in PDF geplottet.

## Gefällepfeile anzeigen

Aktivieren Sie {{ui:Gefällepfeile}}. Auf jedem Dreieck, das groß genug ist, zeigt ein kurzer Pfeil bergab. Flache Dreiecke erhalten keinen Pfeil. Die Pfeile dienen als schneller Check der Entwässerungsrichtung. Der Gefällewert selbst wird noch nicht beschriftet.

## Dreiecke, Punkte und Kanten anzeigen

- {{ui:Dreiecke}} zeichnet die Kanten des TIN. Schalten Sie es ein, um zu prüfen, wie die Fläche die Punkte verbindet, besonders entlang der Bruchkanten und am Rand.
- {{ui:Punkte}} zeichnet jeden Vermessungspunkt. {{ui:Punktbeschriftung}} fügt seine Nummer, Höhe und Beschreibung hinzu (oder weniger; siehe **Punktbeschriftung** in [CivilCraft-Einstellungen](topic:settings)).
- {{ui:Bruchkanten}} zeichnet Bruchkanten (und die Begrenzung) in Orange.
- {{ui:Geländemodellrand}} zeichnet den Umriss des Geländemodells.

## Bestand oder Planung

Sobald ein Plateau oder ein Korridor ohne Probleme modelliert, bietet **Geländemodell** unter **Anzeige** {{ui:Geplant (modelliert)}} an. Höhenlinien, Stufen und Pfeile zeigen dann das modellierte Gelände, sodass Sie das neue Gelände und die Böschungen darum sehen. Wechseln Sie zurück zu {{ui:Bestandsgelände}}, um die Vermessung zu sehen.

## Was exportiert wird

Die DXF- und PDF-Ausgabe folgt diesen Einstellungen: Was Sie ausgeschaltet haben, wird nicht geschrieben, und die Höhenlinien sind die des angezeigten Geländemodells. Höhenstufen werden nie exportiert.
