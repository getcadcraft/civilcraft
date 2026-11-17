---
title: Einen Längsschnitt entwerfen
summary: Die Längsschnittansicht öffnen, einen Entwurfslängsschnitt vom Gelände aus beginnen, PVIs hinzufügen und ziehen, Ausrundungslängen festlegen sowie Gefälle, K-Werte und Hoch- und Tiefpunkte ablesen.
keywords: Längsschnitt, Höhentrassierung, pvi, Ausrundung, Gefälle, K-Wert, Kuppe, Wanne, bvc, evc, Längsschnittansicht, Planungsgelände, fg, Bestandsgeländeprofil, Feature-Linien im Längsschnitt, Kreuzungen, projiziert, Bordstein, Graben, Beschriftungen
from: e9182bfa
---

Jede Trasse hat einen Entwurfslängsschnitt: eine Liste von PVIs (Station und Höhe), die durch gerade Gefälle verbunden sind, mit einer symmetrischen parabelförmigen Ausrundung an jedem inneren PVI, dem eine Länge gegeben ist. Das Bestandsgeländeprofil wird für Sie aus der Oberfläche abgetastet.

## Die Längsschnittansicht öffnen

1. Wählen Sie die Trasse (klicken Sie sie mit {{ui:Wählen}} an).
2. Drücken Sie {{key:R}}, oder klicken Sie in der Symbolleiste auf {{ui:Längsschnitt}} oder unten im rechten Bereich auf {{ui:Längsschnittansicht}}.
   Die Längsschnittansicht öffnet sich unter dem Plan mit dem Bestandsgelände entlang der Trasse. Bei zwei oder mehr Trassen wählen Sie eine in der Liste links in der Längsschnittleiste.

Die Ansicht zeigt immer die ganze Trasse und streckt die Höhen, um das Feld zu füllen. Die Überhöhung steht unten links, zum Beispiel „Überhöhung 10×“. Sie lässt sich weder zoomen noch verschieben.

Bewegen Sie den Zeiger entlang des Längsschnitts: Die Leiste zeigt Station, Gelände- und Entwurfshöhen, das Gefälle und dort den Abtrag oder Auftrag. Ein Punkt folgt im Plan auf der Trasse.

## Den Entwurfslängsschnitt beginnen

1. Klicken Sie im rechten Bereich unter **Entwurfslängsschnitt** auf {{ui:Vom Gelände aus beginnen}}.
   Zwei PVIs werden am Gelände an den beiden Enden der Trasse gesetzt und durch ein gerades Gefälle verbunden. Die Statusleiste meldet: „Entwurfslängsschnitt am Gelände an beiden Enden begonnen. Schalten Sie PVIs hinzufügen ein und klicken Sie, um Gefällewechsel hinzuzufügen, und geben Sie ihnen in der Tabelle eine Ausrundungslänge.“

Wenn die Trasse keine Oberfläche schneidet, erhalten Sie die Meldung „Diese Trasse liegt über keinem Gelände, von dem aus begonnen werden kann.“ Fügen Sie dann PVIs durch Klicken hinzu (nächster Abschnitt).

## PVIs hinzufügen

1. Drücken Sie {{key:I}}, oder klicken Sie in der Längsschnittleiste auf {{ui:PVIs hinzufügen}}. Die Schaltfläche bleibt gedrückt.
2. Klicken Sie im Längsschnitt dorthin, wo Sie einen Gefällewechsel wünschen. Ein PVI wird an dieser Station und Höhe gesetzt, auf 0.01 gerundet, und ausgewählt.
3. Fügen Sie so viele hinzu, wie Sie brauchen, und drücken Sie dann {{key:I}} erneut, um das Hinzufügen zu beenden.

Ein Klick, an dem bereits ein PVI liegt, wird abgelehnt („Bei … liegt bereits ein PVI“). PVIs bleiben immer in Stationsreihenfolge.

## PVIs anpassen

- **Ziehen** Sie einen PVI im Längsschnitt, um ihn zu verschieben. Er kann nicht an seinen Nachbarn vorbei. Die Verschiebung ist ein Schritt zum Rückgängigmachen.
- **Tippen** Sie genaue Werte in die PVI-Tabelle im rechten Bereich: **Station**, **Höhe** und **Ausrundung L** (Länge der vertikalen Ausrundung). Drücken Sie nach jedem Wert {{key:Enter}}.
- **Entfernen** Sie einen PVI mit dem x am Ende seiner Zeile, oder wählen Sie ihn aus (klicken Sie ihn an) und drücken Sie {{key:Delete}}. Wenn die Längsschnittansicht den Fokus hat, entfernt auch {{key:Backspace}} ihn.

Der erste und der letzte PVI erhalten nie eine Ausrundung.

## Vertikale Ausrundungen

1. Tippen Sie eine Länge in **Ausrundung L** für einen inneren PVI, zum Beispiel 200.
2. Die Ausrundung wird mittig am PVI gezeichnet. Der Längsschnitt und der rechte Bereich zeigen ihre Art (Kuppe oder Wanne), L und K, die Stationen und Höhen von BVC und EVC sowie ihren Hoch- oder Tiefpunkt, wenn er innerhalb der Ausrundung liegt.

K wird aus L berechnet (K = L geteilt durch die algebraische Differenz der Gefälle, in Prozent). Sie geben L ein. K direkt einzugeben ist noch nicht möglich.

Passt eine vertikale Ausrundung nicht, zeigt ein rotes Feld den Grund: Sie läuft in den PVI oder die Ausrundung davor zurück oder über den nächsten PVI hinaus. Außerdem zeigt es, wie viel Platz auf dieser Seite ist (eine Ausrundung braucht die halbe Länge auf jeder Seite ihres PVI). Die Schaltfläche darin setzt **die längste passende Ausrundung** mit ihrem K als einen Schritt ({{key:Mod+Z}} macht es rückgängig). Oder rücken Sie die PVIs auseinander.

## Die Fakten ablesen

Unter der PVI-Tabelle nennt eine Liste jedes Gefälle in Prozent („Gefälle 1: +1.25%“) und jede Ausrundung, zum Beispiel „Kuppe bei 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, gefolgt von „Hochpunkt 1+62.40, 254.12“.

Wenn die PVIs nicht bis zu beiden Enden der Trasse reichen, weist eine Notiz darauf hin. Ein Korridor wird nur dort gebaut, wo sich Längsschnitt und Trasse überschneiden.

## Feature-Linien im Längsschnitt

Feature-Linien werden auch in der Längsschnittansicht gezeigt, damit Sie einen Bordstein, einen Graben oder eine Mauerkrone gegen den Längsschnitt der Straße sehen.

- Wo eine Feature-Linie die Trasse **kreuzt**, zeigt der Längsschnitt eine kleine Raute an dieser Station und Höhe. Sie ist mit dem Namen der Linie und ihrer Höhe dort beschriftet (die eigene Höhe der Linie, berechnet entlang des kreuzenden Segments).
- Geben Sie einen Abstand in {{ui:Daneben innerhalb von}} ein, um außerdem die Feature-Linien zu zeichnen, die **neben** der Trasse innerhalb dieses Abstands verlaufen, als gestrichelte Linien auf ihrer eigenen Höhe. Leer oder 0 zeigt nur die Kreuzungen.
- Die Markierungen und Beschriftungen folgen jeder Änderung: Verschieben Sie einen Scheitelpunkt, geben Sie ein Gefälle ein oder heben Sie die Linie an, und der Längsschnitt zeigt sofort die neuen Höhen.
- Klicken Sie auf die Raute einer Kreuzung, um diese Feature-Linie auszuwählen. Die ausgewählte Linie wird in der Hervorhebungsfarbe gezeichnet.
- {{ui:Feature-Linien}} in der Längsschnittleiste blendet alle aus oder ein. Beide Einstellungen werden mit dem Projekt gespeichert.

Siehe [Feature-Linien](topic:feature-lines).

## Weiter

- [Einen Straßenkorridor](topic:corridor) entlang der Trasse und dieses Längsschnitts erstellen.
- Der Längsschnitt wird mit der Trasse in LandXML geschrieben; siehe [LandXML austauschen](topic:landxml).
