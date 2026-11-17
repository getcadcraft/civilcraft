---
title: Geländemodell aufbauen und verfeinern
summary: Wie CivilCraft das bestehende Gelände trianguliert und wie Sie es mit Bruchkantengruppen, gezeichneten Bruchkanten, einer äußeren Grenze und der längsten äußeren Kante formen.
keywords: TIN, Geländemodell, Triangulation, Bruchkante, Grenze, Bestandsgelände, Geländemodell erstellen, Delaunay, Dreiecke, maximale Kante, äußere Grenze
from: b9eea3f3
---

CivilCraft hat je Projekt genau ein bestehendes Geländemodell. Es ist ein TIN (triangulated irregular network, unregelmäßiges Dreiecksnetz) aus Ihren Punkten und wird jedes Mal automatisch neu erstellt, wenn sich eine Eingabe ändert. Es gibt keinen Befehl zum Neuerstellen und kein veraltetes Geländemodell.

## Was in das Geländemodell eingeht

- Jeder Punkt mit einer Höhe in einer Gruppe, die auf {{ui:Punkte}} gesetzt ist.
- Jede Gruppe, die auf {{ui:Bruchkante}} gesetzt ist, verbunden in der Reihenfolge der Punktnummern.
- Jede Bruchkante, die Sie mit dem Werkzeug {{ui:Bruchkante}} zeichnen.
- Die äußere Grenze, falls Sie eine zeichnen.
- Die Einstellung **Längste äußere Kante**.

Dreiecke kreuzen nie eine Bruchkante. Das Geländemodell wird gezwungen, ihr zu folgen, und dann so gleichmäßig wie möglich um sie herum gebildet (überall sonst nach Delaunay).

## Codierte Linien in Bruchkanten umwandeln

1. Suchen Sie im linken Bedienfeld unter **Punkte** die Gruppe (zum Beispiel FL).
2. Setzen Sie deren Auswahl **Geländemodell** auf {{ui:Bruchkante}}.
   Das Geländemodell wird neu erstellt. Die Linie wird orange gezeichnet (mit {{ui:Bruchkanten}} unter **Anzeige** eingeschaltet), und **Bruchkanten** in den Angaben zum Geländemodell steigt um eins.
3. Prüfen Sie die Linie im Plan. Sie muss von Punkt zu Punkt in der Reihenfolge verlaufen, in der sie vermessen wurde. Wenn sie im Zickzack verläuft, enthält die Gruppe mehr als eine Linie, oder die Punkte sind nicht in Reihenfolge nummeriert. Setzen Sie die Gruppe dann zurück auf {{ui:Punkte}} und zeichnen Sie die Linien von Hand (nächster Abschnitt).

## Eine Bruchkante durch Punkte zeichnen

1. Drücken Sie {{key:B}} oder klicken Sie in der Gruppe **Geländemodell** auf {{ui:Bruchkante}}.
   Der Hinweis lautet: „Bruchkante: Vermessungspunkte der Reihe nach anklicken (übernimmt deren Höhen). Enter beendet.“
2. Bewegen Sie den Zeiger nahe an einen Punkt. Ein kleines oranges Quadrat markiert den Punkt, den die Linie übernimmt.
3. Klicken Sie nacheinander die Punkte der Linie an. Jeder Klick nennt den Punkt und seine Höhe in der Statusleiste.
4. Drücken Sie {{key:Enter}}, um abzuschließen.
   Die Statusleiste zeigt „Bruchkante 1 hinzugefügt; das Geländemodell wurde neu erstellt.“

Ein Klick muss auf einen Vermessungspunkt mit Höhe treffen. Ein Klick daneben wird mit „Klicken Sie auf einen Vermessungspunkt mit Höhe: Eine Bruchkante übernimmt die Höhen der Punkte.“ abgelehnt. {{key:Backspace}} entfernt den letzten Punkt, {{key:Esc}} bricht die ganze Linie ab.

:::warning
Beenden Sie mit {{key:Enter}}. Ein Doppelklick beendet ebenfalls, verwirft in dieser Version aber den Punkt, auf den Sie doppelgeklickt haben. Klicken Sie den letzten Punkt einmal an und drücken Sie dann {{key:Enter}}.
:::

Um alle gezeichneten Bruchkanten auf einmal zu entfernen, klicken Sie im Abschnitt **Geländemodell** auf {{ui:Gezeichnete Bruchkanten entfernen}}. Um nur die letzte zu entfernen, verwenden Sie {{key:Mod+Z}}. Gezeichnete Bruchkanten können noch nicht einzeln ausgewählt oder bearbeitet werden.

## Die äußere Grenze zeichnen

Eine Grenze beschneidet das Geländemodell auf den Bereich, dem Sie vertrauen, zum Beispiel die Vermessungsgrenzen. So fallen lange Dreiecke über unvermessene Ecken weg.

1. Drücken Sie {{key:O}} oder klicken Sie auf {{ui:Grenze}}.
2. Klicken Sie die Ecken des Bereichs der Reihe nach an. Eine gestrichelte Linie zeigt die Form.
3. Drücken Sie {{key:Enter}}.
   Die Statusleiste sagt: „Grenze festgelegt; Dreiecke außerhalb sind entfernt.“ **Grenze** in den Angaben zum Geländemodell zeigt „Ja“ und die Anzahl der Ecken.

Wissenswertes:

- Es gibt genau eine Grenze. Eine neue zu zeichnen, ersetzt sie. {{ui:Die Grenze entfernen}} nimmt sie weg.
- Sie kann nur wegnehmen. Eine Grenze, die über die Punkte hinausreicht, wird auf deren Umriss zurückgeschnitten, mit dem Hinweis „Die Grenze reicht über die Punkte hinaus; sie wurde auf deren Umriss zurückgeschnitten.“
- Ihre Ecken übernehmen ihre Höhen aus dem Geländemodell, sodass die Kante dem Gelände genau folgt.
- Innere Grenzen zum Ausblenden sind noch nicht verfügbar.

## Lange äußere Dreiecke beschneiden

Ohne Grenze füllt das Geländemodell den ganzen Umriss der Punkte aus, einschließlich langer, dünner Dreiecke über konkave Kanten.

1. Geben Sie unter **Geländemodell** eine Länge bei **Längste äußere Kante** ein und drücken Sie {{key:Enter}}. Beginnen Sie etwa mit dem Zwei- bis Dreifachen Ihres üblichen Messpunktabstands.
2. Äußere Dreiecke, deren äußere Kante länger ist, werden entfernt, und zwar schrittweise nach innen, bis jede äußere Kante kurz genug ist. Eine Kante, die eine Bruchkante ist, wird nie abgelöst.
3. Geben Sie 0 ein, um wieder alle Dreiecke zu behalten.

## Den Bericht zum Geländemodell lesen

Unter den Angaben zum Geländemodell listet ein Feld auf, was der Aufbau getan hat. Mit einem ockerfarbenen Balken links ist es eine Information. Mit einem roten Balken enthält es einen Fehler, und es gibt dann kein Geländemodell.

| Meldung | Bedeutung |
|---|---|
| „3 Punkte lagen an derselben Stelle wie ein anderer und wurden zusammengeführt.“ | Punkte, die im Plan näher als 0.0001 beieinander liegen, wurden zu einem Eckpunkt (der erste bleibt erhalten). |
| „2 Stellen haben zwei unterschiedliche Höhen …“ | Punkte übereinander oder sich kreuzende Bruchkanten stimmen in der Höhe nicht überein. Die Höhe der Bruchkante gewinnt, dann die des ersten Punkts. |
| „1 Bruchkantenstück konnte nicht in das Geländemodell eingepasst werden.“ | Ein sehr kurzes oder fast überlappendes Bruchkantenstück passte nicht. Prüfen Sie diese Stelle. |
| „Ein Geländemodell braucht mindestens drei Punkte mit Höhen.“ | Zu wenige Punkte. Prüfen Sie die Spaltenreihenfolge und die Gruppen. |
| „Die Punkte liegen alle auf einer Linie: keine Dreiecke.“ | Die Punkte haben keine Breite, zum Beispiel bei einer einzelnen Polygonzuglinie. |
| „Die Grenze überschneidet die Punkte nicht.“ | Die Grenze liegt woanders, oft durch eine Verwechslung von Einheiten oder Koordinatensystem. |
| „Innerhalb der Grenze bleiben keine Dreiecke.“ | Die Grenze ist zu klein oder falsch platziert. |

## Ein aus LandXML gelesenes Geländemodell

Wenn Sie LandXML öffnen, wird dessen erste TIN-Fläche unverändert übernommen. Die Überschrift **Geländemodell** sagt dann „Geländemodell (aus LandXML)“, und **Längste äußere Kante** ist ausgegraut. Solange diese Fläche verwendet wird, ändern Bruchkantengruppen, gezeichnete Bruchkanten und eine neue Grenze sie nicht. Um das Geländemodell aus den Punkten der Datei zu erstellen, klicken Sie auf {{ui:Geländemodell aus den Punkten neu erstellen}}. {{key:Mod+Z}} bringt die LandXML-Fläche zurück.

## Verwandt

- [Höhenlinien, Höhen und Gefälle lesen](topic:contours).
- [Vermessungspunkte importieren](topic:import-points).
