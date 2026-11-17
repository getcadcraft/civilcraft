---
title: Vermessungspunkte importieren
summary: Eine CSV- oder Textdatei mit Punkten öffnen, die Spaltenreihenfolge im Dialog Punkte importieren prüfen, nicht lesbare Zeilen korrigieren und die Punkte in Gruppen sortieren.
keywords: Punkte importieren, csv, txt, pnezd, penzd, Punktdatei, Vermessung, COGO-Punkte, Punktgruppen, Spalten, Hochwert, Rechtswert
from: ad33d88a
---

Eine Punktdatei ist eine Textdatei mit einem Punkt pro Zeile: Punktnummer, Hochwert, Rechtswert, Höhe und Beschreibung in beliebiger Reihenfolge, getrennt durch Kommas, Tabs, Semikolons oder Leerzeichen. CivilCraft liest sie im Browser und erstellt sofort daraus ein Geländemodell.

## Vor dem Start

- Kennen Sie die Spaltenreihenfolge der Datei, falls möglich (PNEZD und PENZD sehen für einen Computer gleich aus).
- Kennen Sie ihre Einheiten. CivilCraft rechnet nicht um: Stellen Sie **Einheiten** im linken Bereich passend zur Datei ein (siehe [Einheiten, Stationen und Zahlenformate](topic:units-and-stations)).
- Koordinaten dürfen groß sein (Hoch- und Rechtswerte im Millionenbereich, etwa in Gauß-Krüger-Systemen, sind in Ordnung).

## Die Datei importieren

1. Klicken Sie in der Symbolleiste auf {{ui:Open}} oder drücken Sie {{key:Mod+O}} und wählen Sie die Datei. Sie können sie auch auf den Plan ziehen.
   Der Dialog **Punkte importieren** öffnet sich mit dem Dateinamen, einer Liste **Spalten**, die auf {{ui:Detect}} eingestellt ist, einer Zusammenfassungszeile und den ersten sechs Punkten.
2. Lesen Sie die Zusammenfassungszeile. Sie sagt, wie viele Punkte gelesen wurden, in welcher Spaltenreihenfolge, wie diese Reihenfolge ermittelt wurde und was die Spalten trennt. Die drei Arten, wie die Reihenfolge ermittelt wird:
   - „aus der Kopfzeile“: Die erste Zeile benennt ihre Spalten (Point, Northing, Easting, Elevation, Description oder X, Y, Z …). Das ist am sichersten.
   - „wie gewählt“: Sie haben eine Reihenfolge unter **Spalten** gewählt.
   - „aus der Spaltenanzahl und der Einstellung der Punktzeilen (PNEZD) geschätzt – prüfen Sie, dass Hoch- und Rechtswert nicht vertauscht sind“: Es gab keine brauchbare Kopfzeile. Wenn Ihre Dateien meist mit dem Rechtswert beginnen, stellen Sie **Punktzeilen** auf P, E, N, Z, D in den [CivilCraft-Einstellungen](topic:settings).
3. Prüfen Sie die Vorschautabelle. Ihre Spalten heißen immer **Punkt**, **Hochwert**, **Rechtswert**, **Höhe**, **Beschreibung**, unabhängig von der Reihenfolge der Datei. Hoch- und Rechtswerte eines echten Geländes sind meist deutlich unterschiedlich groß: Wirken sie vertauscht, lag die Schätzung falsch.
4. Ist die Reihenfolge falsch, wählen Sie die richtige unter **Spalten** (z. B. {{ui:PENZD — point, easting, northing, elevation, description}}). Zusammenfassung und Vorschau aktualisieren sich sofort.
5. Unter der Vorschau steht **Nicht gelesene Zeilen**. Jede Zeile nennt die Zeilennummer der Datei, den Grund und den Anfang der Zeile. Siehe [Nicht gelesene Zeilen](topic:import-points#rows-that-are-not-read).
6. Klicken Sie auf {{ui:Import}}.
   Die Punkte erscheinen im Plan, die Ansicht zoomt auf sie und das Geländemodell wird erstellt. Die Statusleiste zeigt zum Beispiel „276 Punkte aus site.csv importiert; Geländemodell: 546 Dreiecke.“

Hat das Projekt noch keinen Namen, übernimmt es den Namen der Datei.

## Gruppen prüfen

Jeder Punkt gehört zu einer Gruppe, die nach dem **ersten Wort seiner Beschreibung** in Großbuchstaben benannt ist: „GRD“, „FL 12“ und „fl“ sind die Gruppen GRD, FL und FL. Punkte ohne Beschreibung kommen in „(keine Beschreibung)“.

1. Schauen Sie in die Tabelle unter **Punkte** im linken Bereich: Gruppe, Anzahl der Punkte und eine Auswahl **Geländemodell**.
2. Jede Gruppe beginnt als {{ui:Points}}. Ändern Sie Fließlinien, Belagskanten, Ober- und Unterkanten von Böschungen, Grate und ähnliche codierte Linien auf {{ui:Breakline}}. Stellen Sie Gruppen, die das Gelände nicht formen sollen (Passpunkte, Baumkronen, Leitungsmasten, die oben eingemessen wurden), auf {{ui:Left out}}.
3. Klicken Sie einen Punkt im Plan an (mit {{ui:Select}}), um seine Nummer, Koordinaten, Höhe, Beschreibung und Gruppe im rechten Bereich zu sehen.

:::warning
Eine Bruchkantengruppe verbindet **alle** ihre Punkte zu **einer** Linie, in der Reihenfolge der Punktnummern. Das klappt, wenn jede codierte Linie in Reihenfolge mit eigenem Code eingemessen wurde. Zwei getrennte Fließlinien, beide mit dem Code „FL“, werden zu einer Linie, die zwischen ihnen im Zickzack verläuft. Wenn Ihre Codes geteilt sind, verwenden Sie stattdessen das Werkzeug {{ui:Breakline}}, um die Punkte jeder Linie anzuklicken (siehe [Geländemodell erstellen und verfeinern](topic:build-surface)).
:::

## Nicht gelesene Zeilen

| Angezeigter Grund | Bedeutung | Was zu tun ist |
|---|---|---|
| „Hochwert oder Rechtswert ist keine Zahl“ | Eine Koordinatenspalte enthält Text | Spaltenreihenfolge prüfen oder eine einzelne Textzeile mitten in der Datei suchen |
| „Höhe ist keine Zahl“ | Die Höhenspalte enthält Text | Falsche Spaltenreihenfolge oder eine Beschreibung in der Höhenspalte |
| „keine Punktnummer“ | Die Punktspalte ist leer | Den Punkt nummerieren oder eine Reihenfolge ohne P wählen (NEZD, NEZ …): Die Punkte werden dann mit 1, 2, 3 … nummeriert |
| „Punkt 12 kommt zweimal vor (der erste bleibt erhalten)“ | Zwei Zeilen teilen sich eine Nummer | Eine davon in der Datei umnummerieren, wenn beide echte Messungen sind |
| „3 Spalten, erwartet 5 (PNEZD)“ | Die Zeile ist zu kurz | Eine abgebrochene Zeile oder die falsche Spaltenreihenfolge |

Ein Punkt mit leerer Höhe wird behalten, aber nicht im Geländemodell verwendet. Die Angaben zu **Punkten** zeigen, wie viele Punkte eine Höhe haben.

Zeilen, die mit `#`, `;` oder `//` beginnen, sind Kommentare und werden übersprungen. Leere Zeilen werden übersprungen.

## Punkte ersetzen oder ergänzen

Ein erneuter Import **ersetzt** alle Punkte; er fügt ihnen nichts hinzu. Ihre Trassen, Plateaus, Rohre, gezeichneten Bruchkanten und die Grenze bleiben erhalten. Der Verlauf für Rückgängig wird gelöscht; speichern Sie das Projekt also zuerst, falls Sie die alten Punkte womöglich zurückwollen. Um zwei Dateien zu kombinieren, verbinden Sie sie vor dem Import in einem Texteditor oder einer Tabellenkalkulation (achten Sie auf doppelte Punktnummern).

Punkte lassen sich in CivilCraft noch nicht verschieben, bearbeiten oder löschen. Korrigieren Sie sie in der Datei und importieren Sie erneut.

## Verwandt

- [Formate von Punktdateien](topic:point-file-formats): jede Spaltenreihenfolge und wie Kopfzeilen erkannt werden.
- [Geländemodell erstellen und verfeinern](topic:build-surface).
