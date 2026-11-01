---
title: Erste Schritte mit CivilCraft
summary: Was CivilCraft kann, wie Sie es öffnen und die ersten zehn Minuten mit dem Beispielgrundstück: von Punkten über Höhenlinien zu einer Straße und einem gespeicherten Projekt.
from: c9b6dd8e
keywords: Start, erster Start, Beispielgrundstück, Einführung, Schnellstart, Tutorial, Anfang, neues Projekt
---

CivilCraft ist die App für Tiefbau und Grundstücksplanung in der CadCraft-Familie. Sie macht aus Vermessungspunkten ein Geländemodell (ein TIN) mit Höhenlinien, danach legen Sie Trassen mit Längsschnitten der Planung an, führen einen einfachen Straßenkorridor entlang, modellieren Bauplateaus bis zum Böschungsschnittpunkt, prüfen ein Freigefällenetz gegen Ihre Regeln und sehen Abtrags- und Auftragsmengen. CivilCraft liest und schreibt LandXML, exportiert den Lageplan als DXF und plottet ihn als PDF.

Wenn Sie Civil 3D kennen, sind die Ideen vertraut: Punkte, Punktgruppen, Bruchkanten, Trassen über Schnittpunkte (PI), Längsschnitte über Tangentenschnittpunkte (PVI), Korridore, Geländemodellierung, Rohrnetze. Die Arbeitsweise ist anders und viel kleiner: Es gibt keine Befehlszeile, keine Stile und keine Zeichnungsdatei. Lesen Sie [Umstieg von anderer Tiefbau-Software](topic:coming-from) einmal, bevor Sie den ersten echten Auftrag beginnen.

## Was Sie brauchen

- Einen aktuellen Desktop-Browser: Chrome, Edge, Firefox oder Safari. Siehe [Browser](common:browsers).
- Maus oder Trackpad und Tastatur oder einen Touchscreen: Beim Zeichnen gibt es dort die Schaltflächen {{ui:Fertig}}, {{ui:Punkt zurück}} und {{ui:Abbrechen}} auf dem Bildschirm (siehe [Maus, Trackpad und Touch](topic:keyboard#mouse-trackpad-and-touch)).
- Der Lageplan wird in 2D mit der Canvas des Browsers gezeichnet. Die [3D-Ansicht](topic:site-3d) nutzt die WebGL-Grafik des Browsers; wenn sie nicht starten kann, nennt die Statusleiste den Grund, und der Lageplan funktioniert weiter.
- Kein Konto und kein Hochladen. Dateien werden auf Ihrem Computer geöffnet und als Download gespeichert. Siehe [Ihre Dateien](common:your-files).

:::note
CivilCraft läuft heute als früher Browser-Build, an dem noch gearbeitet wird. Desktop-Builds gibt es noch nicht, und Speichern in der Cloud ebenfalls nicht. Alles, was Sie erstellen, bleibt auf Ihrem Computer, bis Sie es speichern oder exportieren.
:::

## CivilCraft öffnen

1. CivilCraft im Browser öffnen.
2. Warten, bis sich der Bildschirm füllt: eine Symbolleiste oben, ein Bereich links, der Lageplan in der Mitte und rechts ein Bereich **Eigenschaften**.
3. Auf einem leeren Lageplan sehen Sie einen Kasten mit dem Titel **Mit Vermessungspunkten beginnen**. Er nennt die ersten Schritte und enthält den Link {{ui:Das Beispielgrundstück öffnen}}.

Um CivilCraft später ohne Verbindung zu nutzen, klicken Sie in der Anwendungsleiste auf {{ui:Für Offline speichern}} und warten auf {{ui:Offline bereit}}. Enthalten sind diese Hilfe, das Beispielgrundstück sowie die 3D- und GIS-Bibliotheken. Siehe [Offline](common:offline). Mit {{key:F1}} oder einem Klick auf {{ui:Hilfe}} öffnen Sie diese Hilfe jederzeit neben der App.

## Ihre ersten zehn Minuten: das Beispielgrundstück

Das Beispielgrundstück ist eine kleine Vermessung in US-Fuß: 276 Punkte in State-Plane-Koordinaten, ein Kamm, eine Mulde mit Muldentiefstlinie und zwei Böschungsoberkanten. Es gehört zur App, Sie können also ohne eigene Datei mitmachen.

1. Klicken Sie im Kasten auf dem Lageplan auf {{ui:Das Beispielgrundstück öffnen}}.
   Das Dialogfeld **Punkte importieren** öffnet sich. Es meldet „276 points read as PNEZD (from the header row), separated by commas.“ und zeigt die ersten Zeilen.
2. Klicken Sie auf {{ui:Importieren}}.
   Der Lageplan füllt sich mit Punkten, Höhenlinien und dem Rand des Geländemodells. Die Statusleiste unten meldet, dass die Punkte importiert wurden und wie viele Dreiecke das Geländemodell hat (546).
3. Sehen Sie im linken Bereich unter **Punkte** nach. Die Punkte sind nach dem ersten Wort ihrer Beschreibung gruppiert: CP, FL, GRD, RIDGE, TBN, TBS und TREE.
4. Stellen Sie in der Spalte **Geländemodell** dieser Tabelle **FL**, **RIDGE**, **TBN** und **TBS** auf {{ui:Bruchkante}}.
   Das Geländemodell wird sofort neu erstellt. Die Angaben zum **Geländemodell** lauten jetzt „Breaklines: 4“, und die Höhenlinien knicken scharf entlang der Muldentiefstlinie und des Kamms, statt sie zu durchschneiden.
5. Bewegen Sie den Zeiger über den Lageplan. Die Statusleiste zeigt Rechtswert und Hochwert unter dem Zeiger und die Geländehöhe dort.
6. Stellen Sie unter **Anzeige** {{ui:Höhenlinien alle}} auf 0,5 ft und schalten Sie {{ui:Höhenstufen}} ein. Eine Farbskala erscheint mit einer Legende unter den Kontrollkästchen. Schalten Sie die Stufen danach wieder aus.

Damit haben Sie ein Bestandsgeländemodell. Als Nächstes eine Straße.

## Eine kurze Straße anlegen

1. {{key:A}} drücken (oder in der Gruppe **Planung** auf {{ui:Trasse}} klicken).
2. Klicken Sie nacheinander drei Punkte über das Grundstück. Eine rote Linie folgt dem Zeiger und zeigt Länge und Richtungswinkel der nächsten Geraden.
3. {{key:Enter}} drücken, um abzuschließen.
   Die Trasse erscheint mit Stationierung. Rechts zeigt der Bereich **Trasse** ihre Länge, die PI-Tabelle und den Kreisbogen am mittleren PI (100 ft Radius oder kleiner, wenn 100 ft nicht passen).
4. Klicken Sie im rechten Bereich unter **Längsschnitt der Planung** auf {{ui:Vom Gelände aus beginnen}}.
   Die Längsschnittansicht öffnet sich unter dem Lageplan mit dem Bestandsgelände und einer geraden Planungsneigung von Ende zu Ende.
5. {{key:I}} drücken, um {{ui:PVIs hinzufügen}} einzuschalten, und dann in der Längsschnittansicht etwa in der Mitte einmal klicken. Ein PVI erscheint.
6. Geben Sie in der PVI-Tabelle rechts im Feld **Kurve L** des mittleren PVI eine Kurvenlänge ein (zum Beispiel 100) und drücken Sie {{key:Enter}}. Der Längsschnitt hat nun eine Ausrundung, mit beschriftetem K-Wert.
7. Setzen Sie unter **Korridor** das Häkchen bei **Einen Regelquerschnitt entlang des Längsschnitts der Planung führen**.
   Die Straße wird ins Gelände modelliert: Fahrstreifen, Bankette und Böschungen bis zum Böschungsschnittpunkt. Der Block **Erdarbeiten** zeigt Abtrag und Auftrag.

Sorgen Sie sich nicht um genaue Werte. Jede Zahl lässt sich im rechten Bereich ändern, und {{key:Mod+Z}} macht die letzte Änderung rückgängig.

## Arbeit speichern

1. Geben Sie oben im linken Bereich unter **Name** einen Namen ein.
2. {{key:Mod+S}} drücken (oder auf {{ui:Speichern}} klicken).
   Der Browser lädt eine nach dem Grundstück benannte Datei herunter, die auf `.civilcraft.json` endet. Sie enthält Punkte, Einstellungen des Geländemodells, Trassen, Längsschnitte, Korridore, Plateaus und Rohre.
3. Um später weiterzuarbeiten, klicken Sie auf {{ui:Öffnen}} (oder drücken {{key:Mod+O}}) und wählen diese Datei, oder ziehen sie auf den Lageplan.

:::warning
Es gibt kein automatisches Speichern. Wenn Sie den Tab mit nicht gespeicherten Änderungen schließen, fragt der Browser, ob Sie die Seite verlassen wollen; wenn Sie sie verlassen, sind die Änderungen weg. Speichern Sie oft.
:::

## Wie es weitergeht

- [Vermessungspunkte importieren](topic:import-points) mit Ihren eigenen Dateien.
- [Das Geländemodell erstellen und verfeinern](topic:build-surface) mit Bruchkanten und einer Grenze.
- [Der Bildschirm, Teil für Teil](topic:workspace).
- [Tasten und Maus](topic:keyboard).
