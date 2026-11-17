---
title: Feature-Linien
summary: Zeichnen Sie 3D-Linien und legen Sie ihr Gefälle Eckpunkt für Eckpunkt fest, erzeugen Sie gestaffelte Versätze davon und verwenden Sie sie als Bruchkanten des Geländes oder als geneigte Bauplätze im Entwurf.
keywords: Bogen, Kurve, Radius, 3D-Bogen, Helix, gekrümmter Bordstein, Gefälleüberlagerung, Höhenüberlagerung, Gefällepfeile, Feature-Linie, Gefälle, Neigung, Höhe, gestaffelter Versatz, Versatz, Bruchkante, Bordstein, Graben, Berme, geneigter Bauplatz, Böschungsschnitt, Modellierung, 3D-Polylinie
from: d55b25fb
---

Eine Feature-Linie ist eine Linie mit einer Höhe an jedem Eckpunkt: ein Bordstein, eine Grabensohle, die Oberkante einer Berme, die Kante eines geneigten Bauplatzes. Sie legen ihre Höhen per Zahl oder per Gefälle fest, kopieren sie seitlich mit einem Schritt nach oben oder unten und wählen, was die Flächen mit ihr tun.

## Eine zeichnen

1. Wählen Sie **Geländemodell** › {{ui:Mehr}} › {{ui:Feature-Linie}}, oder drücken Sie {{key:L}}.
2. Klicken Sie ihre Eckpunkte im Lageplan an. Ein Klick auf einen Vermessungspunkt übernimmt Lage und Höhe des Punkts; überall sonst übernimmt der Eckpunkt die Höhe des bestehenden Geländes an dieser Stelle.
3. Drücken Sie {{key:Enter}}, um eine offene Linie zu beenden, oder klicken Sie erneut auf den ersten Eckpunkt, um sie zu schließen.

Die neue Linie ist ausgewählt und beginnt als Bruchkante des bestehenden Geländes, auf dem Gelände liegend.

## Bögen

Ein Abschnitt kann im Grundriss ein Bogen sein, dessen Enden auf unterschiedlichen Höhen liegen: ein Bordsteinradius, ein gekrümmter Graben, eine Rampe, die abbiegt. Sein Gefälle verläuft gleichmäßig entlang des Bogens, und seine Länge wird entlang der Kurve gemessen.

- **Beim Zeichnen:** Drücken Sie {{key:C}} (auf einem Touchscreen {{ui:Bogen}} in der Leiste über dem Lageplan), um Bögen einzuschalten. Nach einem Eckpunkt klicken Sie einen Punkt auf der Kurve an, dann klicken Sie, wo der Bogen endet. Drücken Sie {{key:C}} erneut für gerade Abschnitte. {{key:Backspace}} entfernt zuerst den Punkt auf der Kurve.
- **Danach:** Geben Sie in **Eigenschaften** im Feld **Bogen** des Eckpunkts einen Radius und die Drehrichtung ein, zum Beispiel `50 L` oder `50 R` (links oder rechts, wenn Sie die Linie entlanggehen), und drücken Sie {{key:Enter}}. Leeren Sie das Feld, um den Abschnitt wieder gerade zu machen. Ein Radius, der kleiner als die Hälfte des Abschnitts ist, wird abgelehnt.

Die ausgewählte Linie zeigt den Radius jedes Bogens neben seinem Gefälle. **Länge** ist entlang der Bögen im Grundriss; **3D-Länge** zählt Anstieg und Abfall mit. Gestaffelte Versätze behalten die Bögen: Ein Bogen außen an einer Kurve wird länger, einer innen kürzer, und ein Versatz über den Mittelpunkt eines Bogens hinaus wird abgelehnt.

Die Flächen, die 3D-Ansicht sowie DXF und DWG übernehmen jeden Bogen als kurze gerade Stücke, die innerhalb von 0.01 der Kurve bleiben. LandXML behält sie als Bögen (siehe unten **Bögen in anderen Dateien**).

## Höhen und Gefälle festlegen

**Eigenschaften** listet die Eckpunkte mit ihrem Abstand entlang der Linie, ihrer **Höhe** und dem **Gefälle zum nächsten** (in Prozent). Tippen Sie eines davon ein und drücken Sie {{key:Enter}}:

- Eine Höhe verschiebt nur diesen Eckpunkt.
- Ein Gefälle setzt die Höhe am Ende seines Abschnitts; die Eckpunkte danach bleiben, wo sie sind, sodass sich das Gefälle des nächsten Abschnitts ändert.

Außerdem in **Eigenschaften**:

| Aktion | Was sie bewirkt |
|---|---|
| **Alle anheben oder absenken um** | Addiert die eingegebene Höhe zu jedem Eckpunkt. |
| {{ui:Höhen aus dem Gelände}} | Setzt jeden Eckpunkt zurück auf das bestehende Gelände (Eckpunkte außerhalb der Fläche behalten ihre Höhe und werden aufgelistet). |
| {{ui:Ein Gefälle, erster bis letzter}} | Behält die erste und letzte Höhe und setzt die Eckpunkte dazwischen auf ein gleichmäßiges Gefälle. |

Die ausgewählte Linie zeigt ihre Höhen an den Eckpunkten und ihr Gefälle entlang der Abschnitte im Lageplan. Ziehen Sie einen Eckpunkt mit {{ui:Wählen}}, um ihn zu verschieben; seine Höhe bleibt.

## Gestaffelte Versätze

Geben Sie unter **Gestaffelter Versatz** einen **Abstand** ein (positiv rechts von der Richtung der Linie, negativ links), dann eine Höhe (hoch oder runter um) oder ein Gefälle in Prozent, und klicken Sie auf {{ui:Versatzlinie erzeugen}}.

Die Kopie ist eine neue Feature-Linie, zum Beispiel die Rückseite eines Bordsteins 0.5 ft seitlich und 0.5 ft höher, oder eine Grabenkante 6 ft nach außen bei 2 %. Ein Abstand, der die Kopie an einer engen Kurve über sich selbst falten würde, wird abgelehnt.

## Gefälle und Höhen auf dem Bildschirm

Drücken Sie {{key:E}} oder kreuzen Sie unter **Anzeige** **Gefälle und Höhen an Feature-Linien** an, um das Gefälle jeder Feature-Linie entlang jedes Abschnitts (mit einem kleinen Pfeil bergab) und ihre Höhe an den Eckpunkten zu sehen. Sie erscheinen nur auf dem Bildschirm: Nichts wird der Zeichnung hinzugefügt, und PDF, DXF und DWG bleiben unverändert. Kurze Abschnitte und gedrängte Eckpunkte bleiben unbeschriftet, bis Sie hineinzoomen. Die ausgewählte Linie zeigt immer ihre eigenen Gefälle und Höhen.

## In der Profilansicht

Eine Feature-Linie, die eine Trasse kreuzt, erscheint in der Profilansicht dieser Trasse, mit ihrem Namen und ihrer Höhe an der Kreuzung; Linien, die daneben verlaufen, können ebenfalls angezeigt werden. Siehe [Einen Längsschnitt entwerfen](topic:profile).

## Was die Flächen damit tun

Wählen Sie **Verwendung**:

| Verwendung | Was passiert |
|---|---|
| Bruchkante des bestehenden Geländes | Das bestehende Gelände verläuft mit seinen Höhen durch die Linie, wie eine gezeichnete Bruchkante. |
| In den Entwurf modelliert | Eine **geschlossene** Linie wird zu einem geneigten Bauplatz: Die geplante Fläche darin wird bis zu ihrem Rand modelliert. Schalten Sie **Böschungsschnitt zum Gelände** ein, um Abtrags- und Auftragsböschungen (horizontal zu 1 vertikal) von ihrem Rand zum Gelände laufen zu lassen, wie bei einem Bauplatz; jede Böschung beginnt an der eigenen Höhe des Randes. |
| Nur gezeichnet | Sie bleibt im Lageplan und wird in DXF, DWG und PDF ausgegeben (Layer C-GRAD-FEAT, 3D-Polylinien), aber die Flächen ignorieren sie. |

Volumen, Schnitte und die 3D-Ansicht berücksichtigen in den Entwurf modellierte Feature-Linien wie Bauplätze. Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig.

## Linien mit Ihrem Team teilen

In einer Zeichnung, die Sie aus Ihren Cloud-Dateien in CadCraft Studio öffnen, mit einem Team-Tarif, hat die **Eigenschaften** des Projekts (nichts ausgewählt) einen Bereich **Team** mit {{ui:Team-Linien…}}: die Linien, die Ihr Team geteilt hat, jede mit ihrer Revision, ohne vorher eine Feature-Linie auswählen zu müssen. Wählen Sie eine Linie aus, um sie zu teilen, eine neue Revision hochzuladen, die des Teams abzurufen oder das Teilen zu beenden. Ohne diese Voraussetzung nennt der Bereich, was fehlt.

## Bögen in anderen Dateien

| Datei | Was mit einer Feature-Linie mit Bögen passiert |
|---|---|
| CivilCraft-Projekt | Bleibt genau erhalten. |
| LandXML | Als Lageplan-Feature aus Linien und Bögen mit ihren Höhen geschrieben und mit ihren Bögen zurückgelesen. Eine Feature-Linie aus einem anderen Programm kommt als **Nur gezeichnet** herein: Wählen Sie ihre **Verwendung**, um sie in eine Fläche aufzunehmen. |
| DWG und DXF | Eine 3D-Polylinie kann keinen Bogen speichern, daher wird die Linie als kurze Stücke innerhalb von 0.01 jedes Bogens geschrieben. CivilCraft vermerkt außerdem in der Zeichnung, welche Stücke Bögen waren: Wenn Sie die Zeichnung als Linienzüge öffnen, bringt {{ui:Feature-Linien}} die Linien als Feature-Linien mit ihren Bögen zurück. Andere Programme sehen eine gewöhnliche 3D-Polylinie. |
