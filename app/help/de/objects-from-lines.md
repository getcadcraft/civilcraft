---
title: Objekte aus Linien, mit Verknüpfung
summary: Pflaster, eine bepflanzte Fläche, ein Beet, eine Hecke, einen Weg, eine Mauer, einen Bordstein, Stufen, eine Rampe, ein Podest, eine Mulde oder eine Feature-Linie aus einer Linie erstellen; es folgt, wenn sich die Linie bewegt, bis Sie die Verknüpfung lösen.
keywords: aus einer Linie, Linien, DWG, DXF, Verknüpfung, verknüpft, folgen, neu erzeugen, Verknüpfung lösen, Feature-Linie, Feature-Linie aus Linien, importierter Layer, Umriss, SuperCad Studio, Zeichnungslinie
from: eb67a0c6
---

{{ui:Aus einer Linie}} (Landschaft › {{ui:Mehr}}): Klicken Sie eine Feature-Linie oder eine Linie bzw. einen Umriss eines importierten DWG/DXF-Layers an. Eine geschlossene Linie kann Pflaster, einen Rasen, ein bepflanztes Beet, eine Wiese, Bodendecker, ein Beet oder ein Podest ergeben; eine offene Linie einen Weg, eine Mauer, einen Bordstein, Stufen (ihr erster und letzter Punkt), eine Rampe, eine Hecke oder eine Mulde. Beide Arten können eine **Feature-Linie** ergeben, außer eine Feature-Linie selbst.

## Eine Feature-Linie aus einer Linie

Eine aus einer Linie erstellte Feature-Linie übernimmt deren Punkte, geschlossen, wenn die Linie geschlossen war. Ihre Höhen werden auf das Bestandsgelände gelegt (0, wo es noch keines gibt), und ihre Verwendung ist **Aus**: Sie formt kein Gelände, bis Sie eine Verwendung wählen und ihre Höhen in ihren Eigenschaften festlegen. Wenn sich die Linie bewegt, behält eine Feature-Linie mit gleicher Punktzahl jede Höhe bei, die Sie festgelegt haben; gewinnt oder verliert die Linie Punkte, werden die Höhen erneut auf das Gelände gelegt. Siehe [Feature-Linien](topic:feature-lines).

Das neue Objekt behält eine **Verknüpfung** zu seiner Linie. Wenn sich die Linie bewegt (Sie ziehen ihre Punkte, oder die Zeichnung wird verschoben oder erneut gelesen), nimmt das Objekt die neue Form im selben Rückgängig-Schritt an, und über die Geländemodifikatoren folgt das Planungsgelände. Die Eigenschaften zeigen, womit es verknüpft ist; {{ui:Verknüpfung lösen}} macht es frei.

Linien werden zuerst geprüft: Eine Linie braucht mindestens 2 Punkte (3 für einen Umriss), höchstens 5000, reelle Zahlen; ein Umriss muss geschlossen sein und darf sich nicht selbst schneiden. Eine Linie, die die Prüfung nicht besteht, wird nicht verwendet: Das Objekt bleibt unverändert, und der Bereich Probleme nennt den Grund. Wird die Linie gelöscht, bleibt das Objekt bestehen, und der Bereich Probleme vermerkt es.

## In SuperCad Studio

Öffnen Sie das Gelände und die 2D-Zeichnung im selben Projekt. Wählen Sie eine Linie oder Polylinie in der 2D-Zeichnung aus, drücken Sie Ctrl+K und führen Sie {{ui:Landschaftsobjekt aus der gewählten Zeichnungslinie}} aus: CivilCraft fragt, was erstellt werden soll, wie oben, und das Objekt bleibt mit dieser Zeichnungslinie verknüpft. Nachdem Sie Linien in der Zeichnung geändert haben, lassen die Objekte per Ctrl+K folgen, wenn Sie {{ui:Landschaft aus der Zeichnung aktualisieren}} ausführen, ein Rückgängig-Schritt je Linie. Die Verknüpfungsdatei des Projekts hält fest, welches Objekt welcher Linie folgt. Die eigene Hilfe von SuperCad Studio enthält ein Thema zur Landschaft.
