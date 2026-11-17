---
title: Einen Vermessungspunkt bearbeiten
summary: Ändern Sie Nummer, Koordinaten, Höhe oder Beschreibung eines Punkts oder ziehen Sie ihn an eine neue Stelle im Lageplan.
keywords: Punkt bearbeiten, Punkt verschieben, Höhe ändern, umnummerieren, Punktnummer, Beschreibung, ziehen, Hochwert, Rechtswert, Punkt fixieren, Fehlmessung
from: 375ae2e9
---

Eine Fehlmessung, eine falsche Lattenhöhe, eine falsch getippte Beschreibung: Korrigieren Sie den einen Punkt, dann folgt die Fläche.

## Die Werte eines Punkts ändern

1. Klicken Sie mit {{ui:Wählen}} auf den Punkt im Lageplan. **Eigenschaften** zeigt Nummer, Rechtswert, Hochwert, Höhe und Beschreibung in Feldern.
2. Tippen Sie den neuen Wert und drücken Sie {{key:Enter}} (oder klicken Sie daneben). Lassen Sie **Höhe** leer bei einem Punkt ohne Höhe.
3. Das Geländemodell, die Höhenlinien und alles, was darauf aufbaut, werden sofort aktualisiert.

Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig, {{key:Mod+Y}} wiederholt sie. Ein Wert, den CivilCraft nicht verwenden kann (eine Nummer, die schon ein anderer Punkt hat, Buchstaben in einer Koordinate), wird abgelehnt: Das Feld wird umrandet, und die Statusleiste nennt den Grund.

Ein neuer Beschreibungsschlüssel erzeugt eine neue Punktgruppe, wie bei einem Import (siehe [Geländemodell erstellen](topic:build-surface)).

## Einen Punkt im Lageplan verschieben

1. Wählen Sie den Punkt (er erhält einen Ring).
2. Ziehen Sie den Ring. Die Statusleiste zeigt Rechts- und Hochwert, wohin er kommt.
3. Lassen Sie los, um ihn zu verschieben; seine Höhe bleibt. Drücken Sie {{key:Esc}}, bevor Sie loslassen, um ihn zurückzusetzen.

## Bruchkanten folgen dem Punkt

Eine mit dem Werkzeug {{ui:Bruchkante}} gezeichnete Bruchkante übernimmt die Punkte, durch die sie läuft. Wenn Sie einen Punkt verschieben oder seine Höhe ändern, wandern die Eckpunkte der Bruchkante auf ihm im selben Schritt mit. Bruchkantengruppen aus Beschreibungen werden immer aus den Punkten neu erstellt.

:::note
Ein aus einer LandXML-Datei gelesenes Geländemodell behält seine eigenen Dreiecke: Punktänderungen wirken darauf erst nach {{ui:Geländemodell aus den Punkten neu erstellen}}.
:::
