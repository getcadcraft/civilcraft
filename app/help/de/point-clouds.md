---
title: Punktwolken von einer Drohne oder einem Scanner
summary: Mit dem Add-on Punktwolken öffnen Sie eine LAS- oder LAZ-Datei mit Millionen von Punkten, sehen sich alles an, bereinigen sie, sortieren die Punkte in Gelände, Vegetation und Gebäude und erstellen daraus Gelände, Höhenlinien und Volumen.
keywords: Punktwolke, las, laz, Drohne, Photogrammetrie, recap, lidar, Scan, Gelände, klassifizieren, Rauschen, Haufwerk, Volumen, Auf- und Abtrag, Höhenlinien, Bruchkante, Eye-Dome, Orthomosaik, Ortho, Drapieren, Kartenebene, LAS exportieren, LAZ exportieren, komprimieren
from: e4a4901f
---

Die meisten brauchen das nicht, deshalb ist es ein Add-on. Aktivieren Sie {{ui:Punktwolken}} unter Einstellungen › Add-ons; daraufhin erscheint eine Registerkarte {{ui:Punktwolken}} im rechten Bereich. Die Datei wird in Ihrem Browser gelesen und in Kacheln zerlegt, die im eigenen Speicher Ihres Browsers (oder in einem Ordner Ihrer Wahl) abgelegt werden. **Es wird nichts hochgeladen.**

:::warning
Alles, was diese Registerkarte meldet, ist eine Zahl aus Ihren Daten, kein Zertifikat. Sie wurde an einem erfundenen Gelände getestet, noch nicht an einer echten Drohnenbefliegung: Betrachten Sie die ersten Ergebnisse mit Vorsicht und teilen Sie uns mit, was Sie finden. Der verantwortliche Fachplaner entscheidet, welchen Wert Gelände, Höhenlinien und Volumen haben.
:::

## Eine Wolke öffnen

Unter {{ui:Wolke öffnen}} wählen Sie eine LAS- oder LAZ-Datei. Die Registerkarte zeigt, wie viele Punkte sie enthält, ihr Koordinatensystem und ihre Einheiten sowie wie viel Platz eine Erstellung braucht. Drücken Sie {{ui:Wolke erstellen}}. Eine Erstellung lässt sich anhalten und mit {{ui:Fortsetzen}} weiterführen (wählen Sie dieselbe Datei erneut). Die Datei wird nie verändert. Eine Datei mit 100 Millionen Punkten wird auf einer Workstation in wenigen Minuten erstellt und benötigt etwa so viel Platz wie die Datei selbst.

Unter {{ui:Wolken auf diesem Computer}} öffnen oder entfernen Sie eine Wolke. {{ui:Wolken in einem Ordner speichern…}} (Chrome, Edge und die Studio-App) speichert die Kacheln in einem Ordner Ihrer Wahl, zum Beispiel einem Ordner „CadCraft-Wolken“ in Dokumente. So muss eine 10-GB-Wolke nicht in den Browserspeicher passen. Zuvor erstellte Wolken bleiben, wo sie erstellt wurden. Nach einem Neustart fragt der Browser erneut um Erlaubnis: Drücken Sie {{ui:Ordner … erneut verwenden}}.

## Betrachten

{{ui:In 3D ansehen}} zeichnet die Wolke aus groben Kacheln und verfeinert sie, je näher Sie kommen, jedoch nie mehr als {{ui:Maximal gezeichnete Punkte}} gleichzeitig (2.5 Millionen; 500 Tausend auf einem Telefon). Farbgebung: die eigene Farbe der Datei, Höhe, Klasse, Intensität oder Verbesserung. {{ui:Eye-Dome-Beleuchtung}} schattiert Kanten nach Tiefe, damit die Form ohne Normalen lesbar wird (auf einem Telefon aus). {{ui:Punkte mit Entfernung verkleinern}} macht ferne Punkte kleiner und nahe Punkte größer. {{ui:Punktgröße}} legt die Größe fest. Der Plan zeigt die Wolke als Raster unter Ihrer Zeichnung und **verfeinert sich, wenn Sie in einen Teil davon hineinzoomen**.

## Bereinigen

Unter {{ui:Bereinigen}} zeichnen Sie im Plan ein Lasso, ein Rechteck oder ein Polygon (oder in 3D aus der Draufsicht: In 3D wird der Umriss senkrecht übertragen, daher ist er nur von oben genau). Die Registerkarte zeigt, wie viele Punkte **vor** dem Anwenden innerhalb liegen: {{ui:Diese Punkte löschen}}, {{ui:Klasse ändern}}, {{ui:Gelöschte Punkte wiederherstellen}} oder {{ui:Auf diese Begrenzung zuschneiden}}. {{ui:Rückgängig}} und {{ui:Wiederholen}} gehen das Bearbeitungsprotokoll durch; die Datei selbst wird nie verändert. {{ui:Rauschfilter…}} markiert Streupunkte als niedrige Punkte (Klasse 7) oder als hohes Rauschen (Klasse 18).

## Sortieren

{{ui:Gelände finden}} arbeitet Kachel für Kachel und markiert Gelände (Klasse 2) und niedrige Punkte. Die Toleranz beträgt 0.15 m, oder 0.08 m mit dem Schalter für Vermessungsgenauigkeit. Sich widersprechende Kachelnähte werden gemeldet. {{ui:Vegetation und Gebäude klassifizieren}} markiert danach niedrige, mittlere und hohe Vegetation sowie Gebäude anhand der Höhe über dem Gelände und der Ebenheit der Umgebung. Es gibt kein maschinelles Lernen; ein flachdachiger Schuppen unter Bäumen kann daher falsch eingestuft sein: Prüfen Sie es.

## Gelände, Höhenlinien, Bruchkanten

{{ui:Gelände erstellen}} erzeugt das vorhandene Gelände aus den Geländepunkten und fügt es dem Projekt auf dieselbe Weise hinzu wie ein LAS-Import (ein Schritt zum Rückgängigmachen). Danach vergleicht es die Punkte damit: den Mittelwert, RMS, das 95. Perzentil, den Anteil innerhalb der Toleranz und die zehn am stärksten abweichenden Stellen, jeweils mit {{ui:Dorthin gehen}}. Färben nach {{ui:Verbesserung}} zeigt, wo Gelände und Wolke nicht übereinstimmen.

Eine **Bruchkante** (ein Bordstein, ein Graben oder eine Böschungsoberkante) wird auf der Wolke gewählt. {{ui:Bruchkante auf der Wolke wählen}} in der 3D-Ansicht übernimmt bei jedem Klick den nächsten gezeichneten Punkt. {{ui:Bruchkante im Plan wählen}} übernimmt bei jedem Klick den nächsten Wolkenpunkt darunter (Gelände zuerst). Doppelklick oder Enter beendet die Linie. Das nächste {{ui:Gelände erstellen}} verwendet sie. {{ui:Höhenlinien anzeigen}} zeichnet die Höhenlinien über der Wolke in einem kleinen Bild und legt den Höhenlinienabstand des Projekts fest.

## Volumen

{{ui:Haufwerksvolumen…}} berechnet das Volumen der Fläche über einer Basis innerhalb einer Begrenzung, die Sie zeichnen. Zeichnen Sie die Begrenzung auf ebenem Gelände um den Haufen und wählen Sie die Basis: den tiefsten Begrenzungspunkt, eine Ebene, eine glatte gekrümmte Basis, eine Fläche durch die Begrenzung oder eine Höhe, die Sie eingeben. Auf geneigtem oder gekrümmtem Gelände verwenden Sie die Ebene oder die gekrümmte Basis; der tiefste Punkt liest zu hoch. Begrenzungspunkte, die über den übrigen stehen (ein Baum an der Linie), bleiben bei der Basis unberücksichtigt. {{ui:Flug zu Flug}} ergibt Auf- und Abtrag zwischen zwei Wolken. Beides lässt sich als CSV speichern.

## Orthomosaik

Unter {{ui:Orthomosaik (Luftbild)}} wählen Sie das Orthomosaik der Drohne zusammen mit seiner World-Datei und seiner `.prj`-Datei, sofern vorhanden: ein GeoTIFF oder ein PNG oder JPEG. Es wird zu einer **Kartenebene** des Projekts, sodass der Plan es unter Ihrer Zeichnung zeigt. Die 3D-Ansicht (Farbe {{ui:Karte}}) malt es auf das erstellte Gelände, daher zuerst {{ui:Gelände erstellen}} ausführen. Die Registerkarte zeigt, wie viel der Wolke das Bild abdeckt, und warnt, wenn es keine abdeckt. Die übliche Ursache ist ein anderes Koordinatensystem; geben Sie daher die `.prj`-Datei mit an. Ohne `.prj` fragt das Programm, wo die Koordinaten liegen. Das Bild wird in der Projektdatei gespeichert. Ein GeoTIFF über 200 MB wird abgelehnt, und ein sehr großes Mosaik wird auf 16 Megapixel verkleinert. Schneiden Sie es bei einer großen Befliegung daher zuerst auf das Gelände zu.

## Exportieren

{{ui:Exportieren}} schreibt die bereinigte, klassifizierte Wolke als neue Datei (alle Punkte, die bereinigten Klassen oder nur das Gelände). Wählen Sie unter {{ui:Dateityp}}:

- **LAS 1.4 (nicht komprimiert)**: Punktformat 6, oder 7 mit Farbe.
- **LAZ (komprimiert)**: dieselben Punkte, verlustfrei komprimiert, sodass jeder Punkt exakt zurückkommt. Er wird als Punktformat 0, oder 2 mit Farbe, in einer LAS-1.4-Datei geschrieben. Auf dem erfundenen 300 m großen Gelände war die LAZ-Datei etwa ein Fünftel so groß wie die LAS-1.4-Datei. LAZ-Formate 0 und 2 enthalten nur die Klassen 0 bis 31: Ein Punkt mit höherer Klasse wird mit einer Meldung abgelehnt. Exportieren Sie diese Wolke daher als LAS 1.4.

Die LAZ-Datei wird vom eigenen Kompressor von CadCraft geschrieben, der aus der veröffentlichten LAZ-Spezifikation entwickelt wurde. Wir haben geprüft, dass unser eigener Leser und zwei unabhängige LAZ-Leser (laz-perf, das die App zum Öffnen von LAZ-Dateien verwendet, und laspy mit lazrs) jeden Punkt exakt zurücklesen. Außerdem sind LAZ-Dateien, die mit laspy erstellt wurden, Byte für Byte identisch, wenn wir deren Punkte erneut schreiben. Andere Programme wurden noch nicht getestet. Wenn eines eine Datei nicht öffnet, teilen Sie uns mit, welches.

Wo der Browser eine Datei fortlaufend schreiben kann, wählen Sie die Datei zuerst. Eine sehr große Wolke wird dann kachelweise hineingeschrieben, statt im Speicher gesammelt zu werden. Andernfalls wird die Datei gesammelt und heruntergeladen, was bis zu einigen hundert Megabyte in Ordnung ist.

## Was es nicht tut

Es liest nur LAS und LAZ (E57, PLY und PCD sind in dieser Registerkarte noch nicht eingebunden), und mehrere Dateien eines Flugs werden nicht zusammengeführt. Es projiziert eine Wolke nicht um (das Koordinatensystem und die Meter des Projekts werden vorausgesetzt). Es liest keine RCP- oder RCS-Dateien von Autodesk, erstellt keine Oberfläche aus Fotos und findet Masten, Bordsteine oder Rohre nicht von selbst.
