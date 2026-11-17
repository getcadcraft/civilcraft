---
title: Versorgungsnetze und OpenStreetMap
summary: Strecken für Wasser, Abwasser, Regenwasser, Gas, Strom und Telekommunikation mit Material, Größe, Überdeckung und Eigentümer; OpenStreetMap-Daten aus einer Overpass-JSON-Datei; Kreuzungen, Grabenquerschnitte und Mengen; Versorgungs-Layer in DWG, DXF und PDF; IFC-Rohr- und Kabelsegmente.
keywords: Versorgung, Versorgungen, Netz, osm, openstreetmap, overpass, Rohr, Kabel, Gas, Kanal, Regenwasser, Telekom, Strom, Wasser, Hydrant, Schacht, Graben, Kreuzung, Lichtmaß, Überdeckung, Tiefe, dwg, ifc, georeferenziert, Layer
from: 8a85dace
---

Zeichnen Sie die erdverlegten Leitungen eines Geländes als ein Netz pro Versorgungsart, prüfen Sie, wo sie sich kreuzen, und geben Sie sie als Layer und als IFC aus.

## Strecken erstellen

Öffnen Sie **Geländemodell, Mehr, Versorgungsnetze...**

- **Strecke aus Auswahl erstellen** wandelt die gewählte Trasse, Feature-Linie oder Rohrleitung in eine Strecke der gewählten Versorgungsart um. Tragen Sie danach in der Tabelle Material, Größe (mm), Überdeckung (die Tiefe bis zur Oberkante des Rohrs oder Kabels) und Eigentümer ein.
- **OpenStreetMap-Daten lesen** liest eine gespeicherte Overpass-JSON-Datei (eine Abfrage mit `out geom;`). Das Projekt braucht zuerst ein Koordinatensystem, weil OpenStreetMap-Positionen Breiten- und Längengrade sind. Rohrleitungen (nach Stoff), unterirdische Stromkabel und Telekommunikationskabel, Hydranten, Schächte und Regenwasserkanäle werden gelesen. Alles andere wird als ausgelassen gezählt und in der Meldung genannt. Freileitungen werden ausgelassen.
- **OpenStreetMap-Karte hinzufügen** fügt die OpenStreetMap-Karte unter dem Plan ein. Sie wird nur gezeichnet, solange Kartenlayer aus dem Internet in den Einstellungen eingeschaltet sind.

## Prüfungen und Ausgaben

- **Kreuzungen**: Strecken verschiedener Versorgungsarten, die sich im Grundriss kreuzen, werden mit der lichten Höhe zwischen ihnen aufgelistet, sofern eine Geländeoberfläche vorhanden ist. Das Minimum ist ein Platzhalter, den Sie festlegen, und nicht der Wert einer Norm.
- **Graben**: Jede Strecke erhält einen Graben (Rohrgröße plus Arbeitsraum auf jeder Seite, Böschungsneigung, Bettung) mit einem Volumen. Die Summe wird im Fenster und in der CSV-Datei angezeigt.
- **Zeichnung**: Strecken und Punkte liegen auf Versorgungs-Layern (zum Beispiel U-WATR-RUN, U-POWR-RUN) und gelangen so in PDF, DXF und DWG.
- **IFC**: Strecken werden als Rohrsegmente und Kabelsegmente in den IFC-Export übernommen, zusammen mit Hydranten, Armaturen und Kammern, ein System pro Versorgungsart, im Koordinatensystem des Projekts.

## OpenStreetMap-Daten

OpenStreetMap-Daten sind urheberrechtlich geschützt durch die OpenStreetMap-Mitwirkenden und unter der ODbL lizenziert. Die Quellenangabe wird in die Zeichnung, die CSV-Datei und das IFC aufgenommen. Wenn Sie eine Datei weitergeben, die OpenStreetMap-Daten enthält, behalten Sie die Quellenangabe bei und beachten Sie die Bedingungen der Lizenz zur Weitergabe unter gleichen Bedingungen.

## Was noch nicht umgesetzt ist

Strecken werden noch nicht Punkt für Punkt mit einem Werkzeug im Plan gezeichnet, und Kreuzungen werden im Längsschnitt noch nicht dargestellt (die Berechnung ist umgesetzt). Tiefen, Größen und Lichtmaße sind Platzhalter. Verwenden Sie die Werte Ihrer eigenen Norm.
