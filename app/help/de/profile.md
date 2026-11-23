---
title: Einen Entwurfslängsschnitt gestalten
summary: Die Längsschnittansicht öffnen, einen Entwurfslängsschnitt am Gelände beginnen, PVIs hinzufügen und ziehen, Längen der vertikalen Ausrundungen setzen und Neigungen, K-Werte sowie Hoch- und Tiefpunkte ablesen.
keywords: Längsschnitt, Vertikalführung, PVI, vertikale Ausrundung, Neigung, K-Wert, Kuppe, Wanne, BVC, EVC, Längsschnittansicht, Fertiggelände, fg, Geländelängsschnitt, Feature-Linien im Längsschnitt, Kreuzungen, projiziert, Bordstein, Graben, Beschriftungen
from: dbb1f32d
---

Jede Trasse hat einen Entwurfslängsschnitt: eine Liste von PVIs (Station und Höhe), die durch gerade Neigungen verbunden sind, mit einer symmetrischen Parabel-Ausrundung an jedem inneren PVI, der eine Länge hat. Der bestehende Geländelängsschnitt wird für Sie aus dem Geländemodell abgegriffen.

## Die Längsschnittansicht öffnen

1. Wählen Sie die Trasse (klicken Sie sie mit {{ui:Wählen}} an).
2. Drücken Sie {{key:R}}, oder klicken Sie in der Werkzeugleiste {{ui:Längsschnitt}} an oder unten im rechten Bereich {{ui:Längsschnittansicht}}.
   Die Längsschnittansicht öffnet sich unter dem Plan mit dem bestehenden Gelände entlang der Trasse. Bei zwei oder mehr Trassen wählen Sie eine in der Liste links in der Längsschnittleiste.

Die Ansicht zeigt zuerst die ganze Trasse und streckt die Höhen, um das Feld zu füllen; die Überhöhung steht unten links, zum Beispiel „Vertikale Überhöhung 10×“.

## Den Längsschnitt zoomen und verschieben

- **Zoom:** Drehen Sie das Mausrad (oder ziehen Sie auf dem Trackpad zusammen); die Ansicht zoomt um den Zeiger. Halten Sie {{key:Shift}}, um nur die Stationen zu zoomen, oder {{key:Alt}}, um nur die Höhen zu zoomen (das ändert die Überhöhung). Wenn die Längsschnittansicht den Fokus hat, zoomen die Plus- und Minustasten um die Mitte.
- **Verschieben:** Ziehen Sie mit der rechten oder mittleren Maustaste, oder wischen Sie auf dem Trackpad mit zwei Fingern.
- **Einpassen:** Doppelklicken Sie den Längsschnitt oder drücken Sie {{key:F}}, um wieder die ganze Trasse zu zeigen.

Das Verschieben eines PVI behält den gewählten Zoom; die Ansicht springt nicht zurück zum Einpassen.

Bewegen Sie den Zeiger entlang des Längsschnitts: Die Leiste zeigt Station, Gelände- und Entwurfshöhen, die Neigung sowie Abtrag oder Auftrag an dieser Stelle, und ein Punkt folgt auf der Trasse im Plan.

## Den Entwurfslängsschnitt beginnen

1. Klicken Sie im rechten Bereich unter **Entwurfslängsschnitt** auf {{ui:Vom Gelände aus beginnen}}.
   Zwei PVIs werden an den beiden Enden der Trasse auf das Gelände gesetzt und durch eine gerade Neigung verbunden. Die Statusleiste sagt: „Entwurfslängsschnitt am Gelände an beiden Enden begonnen. PVIs hinzufügen einschalten und klicken, um Neigungswechsel hinzuzufügen; ihnen in der Tabelle eine Ausrundungslänge geben.“

Schneidet die Trasse die Oberfläche nicht, erhalten Sie: „Diese Trasse hat kein Gelände darunter, von dem aus begonnen werden kann.“ Fügen Sie dann PVIs durch Klicken hinzu (nächster Abschnitt).

## PVIs hinzufügen

1. Drücken Sie {{key:I}} oder klicken Sie in der Längsschnittleiste auf {{ui:PVIs hinzufügen}}. Er bleibt eingedrückt.
2. Klicken Sie im Längsschnitt dort, wo Sie einen Neigungswechsel möchten. Ein PVI wird bei dieser Station und Höhe gesetzt, auf 0.01 gerundet, und ausgewählt.
3. Fügen Sie so viele hinzu, wie Sie brauchen, und drücken Sie dann {{key:I}} erneut, um das Hinzufügen zu beenden.

Ein Klick dort, wo schon ein PVI liegt, wird abgelehnt („Hier gibt es bereits einen PVI bei …“). PVIs bleiben immer in Stationsreihenfolge.

## Einrasten beim Hinzufügen oder Ziehen

Die Schaltfläche **Einrasten** in der Längsschnittleiste ist zu Beginn eingeschaltet. Solange sie an ist, rastet ein hinzugefügter oder gezogener PVI auf den nächsten PVI, Geländepunkt, PVI-Station oder die Geländelinie ein; eine Beschriftung am Marker sagt, welcher. Halten Sie {{key:Alt}} für einen freien Punkt an beliebiger Stelle.

## PVIs anpassen

- **Ziehen** Sie einen PVI im Längsschnitt, um ihn zu verschieben. Er kann seine Nachbarn nicht überschreiten. Die Verschiebung ist ein Schritt für Rückgängig.
- **Geben** Sie genaue Werte in der PVI-Tabelle im rechten Bereich ein: **Station**, **Höhe**, **Neigung %** und **Ausrundung L** (Länge der vertikalen Ausrundung). Drücken Sie nach jedem Wert {{key:Enter}}.
- **Abgreifen**: Die kleine Schaltfläche neben der Station oder Höhe eines PVI wartet auf einen Klick im Längsschnitt und füllt diesen Wert ein. Der Klick rastet wie bei PVIs hinzufügen ein; halten Sie {{key:Alt}} für einen freien Punkt; {{key:Esc}} bricht ab.
- **Neigung %** ist die Steigung der Tangente, die bei diesem PVI beginnt und bis zum nächsten verläuft. Ein Eintrag verschiebt die Höhe des **nächsten** PVI (seine Station verschiebt sich nie). Ist der nächste PVI gesperrt, verschiebt sich stattdessen die Höhe des vorherigen PVI.
- **Sperren** Sie einen PVI mit dem Schloss am Ende seiner Zeile. Ein gesperrter PVI wird nicht gezogen, und eine Neigungsänderung verschiebt ihn nicht. Sind beide Enden einer Tangente gesperrt, lässt sich ihre Neigung nicht ändern: Die Statusleiste sagt es, und Sie entsperren zuerst ein Ende. Die Sperre wird in der Datei gespeichert.
- **Entfernen** Sie einen PVI mit dem x am Ende seiner Zeile, oder wählen Sie ihn (anklicken) und drücken Sie {{key:Delete}}. Hat die Längsschnittansicht den Fokus, entfernt auch {{key:Backspace}} ihn.

Der erste und der letzte PVI erhalten nie eine Ausrundung.

## Vertikale Ausrundungen

1. Geben Sie in **Ausrundung L** für einen inneren PVI eine Länge ein, zum Beispiel 200.
2. Die Ausrundung wird zentriert am PVI gezeichnet. Der Längsschnitt und der rechte Bereich zeigen ihre Art (Kuppe oder Wanne), L und K, die BVC- und EVC-Stationen und -Höhen sowie ihren Hoch- oder Tiefpunkt, wenn er innerhalb der Ausrundung liegt.

K wird aus L berechnet (K = L geteilt durch den algebraischen Unterschied der Neigungen, in Prozent). Sie geben L ein; K direkt einzugeben ist noch nicht verfügbar.

Passt eine vertikale Ausrundung nicht, sagt ein rotes Feld warum: Sie läuft in den PVI oder die Ausrundung davor zurück oder über den nächsten PVI hinaus, und es zeigt, wie viel Platz auf dieser Seite ist (eine Ausrundung braucht die halbe Länge auf jeder Seite ihres PVI). Ihre Schaltfläche setzt **die längste passende Ausrundung** mit ihrem K als einen Schritt ({{key:Mod+Z}} macht es rückgängig). Oder verschieben Sie die PVIs weiter auseinander.

## Die Fakten ablesen

Unter der PVI-Tabelle listet eine Liste jede Neigung in Prozent („Neigung 1: +1.25%“) und jede Ausrundung, zum Beispiel „Kuppe bei 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, dann „Hochpunkt 1+62.40, 254.12“.

Reichen die PVIs nicht bis an beide Enden der Trasse, weist eine Notiz darauf hin. Ein Korridor wird nur dort gebaut, wo sich Längsschnitt und Trasse überlappen.

## Feature-Linien im Längsschnitt

Feature-Linien erscheinen auch in der Längsschnittansicht, sodass Sie einen Bordstein, einen Graben oder eine Mauerkrone gegen den Längsschnitt der Straße sehen können.

- Wo eine Feature-Linie die Trasse **kreuzt**, zeigt der Längsschnitt eine kleine Raute bei dieser Station und Höhe, beschriftet mit dem Namen der Linie und ihrer Höhe dort (die eigene Höhe der Linie, entlang des kreuzenden Segments berechnet).
- Geben Sie in {{ui:Daneben innerhalb von}} eine Distanz ein, um auch die Feature-Linien zu zeichnen, die **neben** der Trasse innerhalb dieser Distanz verlaufen, als gestrichelte Linien auf ihren eigenen Höhen. Leer oder 0 zeigt nur die Kreuzungen.
- Die Markierungen und Beschriftungen folgen jeder Änderung: Verschieben Sie einen Knoten, geben Sie eine Neigung ein oder heben Sie die Linie, und der Längsschnitt zeigt sofort die neuen Höhen.
- Klicken Sie die Raute einer Kreuzung an, um diese Feature-Linie auszuwählen; die gewählte Linie wird in der Hervorhebungsfarbe gezeichnet.
- {{ui:Feature-Linien}} in der Längsschnittleiste blendet alle ein oder aus. Beide Einstellungen werden mit dem Projekt gespeichert.

Siehe [Feature-Linien](topic:feature-lines).

## Weiter

- [Einen Straßenkorridor aufziehen](topic:corridor) entlang dieser Trasse und diesem Längsschnitt.
- Der Längsschnitt wird mit der Trasse in LandXML geschrieben; siehe [LandXML austauschen](topic:landxml).
