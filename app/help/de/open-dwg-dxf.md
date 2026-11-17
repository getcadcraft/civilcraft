---
title: DWG oder DXF als Linien öffnen
summary: Die Linien einer Zeichnung Layer für Layer auf dem Plan öffnen, ihre Höhenlinien, 3D-Polylinien und geschlossenen Umrisse für das Geländemodell nutzen und ihre Punktblöcke in Vermessungspunkte umwandeln.
keywords: Vermessungsprüfung, Höhen als Text, dwg, dxf, cad, Zeichnung, Linien, Höhenlinien, Bruchkanten, Grenze, Polylinie, 3D-Polylinie, Layer, Hintergrundplan, Topo, Vermessungszeichnung, Blöcke, Blockreferenzen, Vermessungspunkte aus Blöcken, Attribute, Punktblöcke, Einfügepunkt
from: da0f4c58
---

Ein topografisches Aufmaß kommt oft als Zeichnung: Höhenlinien als Polylinien auf ihrer Höhe, Bruchkanten als 3D-Polylinien, der Geländeumriss als geschlossene Polylinie. CivilCraft öffnet den **Modellbereich** der Zeichnung als Layer auf dem Plan und kann diese Linien direkt in das Geländemodell übernehmen.

## Die Zeichnung öffnen

1. Klicken Sie in der Gruppe **Geländemodell** auf {{ui:Linien}} (oder auf {{ui:Öffnen}}, oder ziehen Sie die Datei auf den Plan) und wählen Sie eine `.dwg`- oder `.dxf`-Datei. Die Zeichnung wird auf diesem Computer gelesen; nichts wird hochgeladen. DWG von 2000 bis 2018 und ASCII-DXF werden gelesen.
2. Das Dialogfeld **Linien** listet die Layer der Zeichnung, die Linien, geschlossene Formen oder Punkte enthalten, und ob sie **Höhen** haben. Layer, die in der Zeichnung ausgeschaltet sind, starten ohne Häkchen. Text, Schraffuren, Bemaßungen und andere Objekte, die keine Linien sind, werden gezählt und weggelassen (das Dialogfeld sagt, welche).
3. Prüfen Sie die **Zeichnungseinheiten**. Wenn die Zeichnung ihre Einheiten angibt, rechnet CivilCraft sie in die des Projekts um (Millimeter in Meter, Meter in Fuß, Zoll in Fuß). Eine Zeichnung in Fuß wird als US-Survey-Fuß ohne Skalierung gelesen: Beide unterscheiden sich um 2 ppm, und eine Skalierung von State-Plane-Koordinaten würde sie um Fuß verschieben. Gibt die Zeichnung ihre Einheiten nicht an, werden ihre Zahlen in den Einheiten des Projekts gelesen; wählen Sie in der Liste die richtigen Einheiten, wenn das nicht stimmt.
4. Unter **Für das Geländemodell verwenden** legen Sie fest, was jeder Layer dem Geländemodell gibt (oder lassen **Nur anzeigen** stehen). Layer mit Namen wie Höhenlinien (TOPO, CONT, CNTR), die Höhen haben, starten als Bruchkanten.
5. Klicken Sie auf {{ui:Hinzufügen}}. Die Layer erscheinen unter **GIS-Layer** im linken Bereich; jede Verwendung wird ins Geländemodell übernommen. Jeder Teil ist ein eigener Schritt: {{key:Mod+Z}} nimmt sie einzeln zurück.

## Was jede Layer-Art liefern kann

| Der Layer enthält | Für das Geländemodell verwenden |
|---|---|
| Höhenlinien (Polylinien auf einer Höhe) | Bruchkanten auf der eigenen Höhe der Linien oder auf dem Feld ELEV |
| 3D-Polylinien | Bruchkanten auf ihren eigenen Höhen |
| Einen geschlossenen Umriss | Die Geländegrenze (die größte geschlossene Form oder die von Ihnen gewählte) |
| Punkte mit Höhe | Vermessungspunkte, beschrieben mit dem Layernamen |
| Linien auf Höhe 0 (Planlinien) | Nichts: sie bleiben als Grundzeichnung auf dem Plan |

Eine von CivilCraft geschriebene Zeichnung hält ihre Feature-Linien als 3D-Polylinien, die sich ihre Bögen merken. Das Dialogfeld zeigt dann **Feature-Linien**: Lassen Sie es angehakt, um sie als Feature-Linien mit ihren Bögen und Verwendungen zurückzuholen (ein Rückgängig-Schritt), oder entfernen Sie den Haken, um sie wie jeden anderen Layer als Linien zu lesen.

Später verwenden Sie {{ui:Für das Geländemodell verwenden}} im Menü des Layers unter **GIS-Layer**, um dasselbe für einen Layer zu tun, den Sie nur angezeigt haben.

## Vermessungspunkte aus Blöcken

Vermessungszeichnungen tragen ihre Punkte oft als Blöcke: ein kleines Symbol an jeder Messung, mit Attributen für die Punktnummer, die Beschreibung und die Höhe. Hat die Zeichnung Blockreferenzen, enthält das Dialogfeld den Abschnitt **Vermessungspunkte aus Blöcken**:

1. Haken Sie die Blöcke an, die übernommen werden sollen (die Tabelle zeigt, wie viele Referenzen jeder hat, auf welchen Layern und mit welchen Attributen), oder haken Sie Layer an, um jede Blockreferenz auf ihnen zu übernehmen.
2. Wählen Sie, woher **Nummer**, **Beschreibung** und **Höhe** jedes Punktes kommen: aus einem Attribut, dem Namen des Blocks oder Layers, den nächsten freien Nummern oder der Z-Koordinate des Einfügepunkts. CivilCraft beginnt mit den wahrscheinlichen Attributen (PT, DESC, ELEV und ähnliche) und übernimmt die Höhe aus einem Attribut nur, wenn die Blöcke auf null liegen.
3. Entfernen Sie den Haken bei den Linien-Layern, wenn Sie nur die Punkte wollen, und klicken Sie dann auf {{ui:Hinzufügen}}.

Jede Referenz wird ein Vermessungspunkt an ihrem Einfügepunkt. Nur Referenzen im Modellbereich zählen; Blöcke, die in anderen Blöcken verschachtelt sind, nicht. Nummern, die schon im Projekt stehen oder zweimal in der Zeichnung vorkommen, erhalten neue Nummern nach der höchsten; ein Höhenattribut, das keine Zahl ist, lässt diesen Punkt ohne Höhe; die Statusleiste zählt beides. Die Zeichnung wird nie verändert, und jeder Punkt merkt sich seinen Block: Seine Eigenschaften zeigen **Aus Block** mit Block, Layer und Handle. Das Hinzufügen der Punkte ist ein Schritt, sodass {{key:Mod+Z}} alle auf einmal entfernt.

## Höhen als Text und die Prüfung

Als Text geschriebene Höhenangaben (oder in einem Blockattribut, das kein Vermessungspunkt-Block ist) sind keine Linien. Der Abschnitt **Vermessungshöhen und Prüfung** kann sie als Vermessungspunkte übernehmen und listet auf, was an der Zeichnung verdächtig wirkt: Einheiten, Koordinatensystem, Abstand zum Nullpunkt, flache Höhenlinien, ungewöhnliche Höhen, doppelte Punkte. Siehe [Vermessungszeichnung beim Import prüfen](topic:survey-check).

## Wie die Zeichnung gelesen wird

- Bögen, Kreise, Ellipsen, gewölbte Polylinienabschnitte und Splines werden zu kurzen geraden Stücken (höchstens alle 5°).
- Blockreferenzen werden dort gezeichnet, wo sie platziert sind, auch verschachtelte Blöcke; was ein Block auf Layer 0 enthält, übernimmt den Layer der Referenz.
- Objekte in einer anderen Ebene (andere Extrusionsrichtung) werden in Weltkoordinaten gesetzt.
- Jedes Objekt erhält drei Felder: LAYER, TYPE (der Objekttyp) und ELEV (seine Höhe, wenn alle seine Punkte dieselbe haben).
- Koordinaten werden so übernommen, wie sie sind: Die Zeichnung muss dieselben Koordinaten wie das Projekt verwenden (etwa dieselbe State-Plane-Zone). Externe Referenzen (Xrefs) werden nicht geöffnet: Öffnen Sie sie einzeln.

:::tip
Eine Höhenlinienzeichnung ergibt das beste Geländemodell mit einigen Höhenpunkten auf Kuppen und in Mulden, wo Höhenlinien allein flache Dreiecke lassen. Fügen Sie sie als Vermessungspunkte hinzu, oder aus einem Punkt-Layer der Zeichnung.
:::
