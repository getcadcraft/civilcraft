---
title: Punkt-Dateiformate
summary: Die Spaltenreihenfolgen, die CivilCraft liest, wie es Trennzeichen und Kopfzeile findet, welche Kopfzeilennamen es erkennt und wie Zeilen geprüft werden.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, Punkt-Dateiformat, Spalten, Kopfzeile, Trennzeichen
from: 84fab42e
---

Eine Punktdatei ist reiner Text mit einem Punkt pro Zeile. CivilCraft liest sie im Browser; nichts wird hochgeladen.

## Spaltenreihenfolgen

Die Buchstaben benennen die Spalten von links nach rechts: **P** Punktnummer oder Name, **N** Nordwert, **E** Ostwert, **Z** Höhe, **D** Beschreibung.

| Reihenfolge | Spalten | Beispielzeile |
|---|---|---|
| PNEZD | Punkt, Nordwert, Ostwert, Höhe, Beschreibung | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | Punkt, Ostwert, Nordwert, Höhe, Beschreibung | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | Punkt, Nordwert, Ostwert, Höhe | `101,2080000.00,6150000.00,250.00` |
| PENZ | Punkt, Ostwert, Nordwert, Höhe | `101,6150000.00,2080000.00,250.00` |
| NEZD | Nordwert, Ostwert, Höhe, Beschreibung | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | Ostwert, Nordwert, Höhe, Beschreibung | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | Nordwert, Ostwert, Höhe | `2080000.00 6150000.00 250.00` |
| ENZ | Ostwert, Nordwert, Höhe | `6150000.00 2080000.00 250.00` |

Reihenfolgen ohne P nummerieren die Punkte 1, 2, 3 … in Dateireihenfolge. X ist der Ostwert und Y der Nordwert.

## Trennzeichen

CivilCraft prüft die ersten 20 Zeilen und wählt das erste dieser Zeichen, das in mindestens 60 % davon vorkommt: Komma, Tabulator, Semikolon. Andernfalls wird an Folgen von Leerzeichen getrennt.

- In Komma-, Tabulator- und Semikolondateien kann ein Feld in doppelten Anführungszeichen das Trennzeichen enthalten (`"FL, NORTH"`), und `""` innerhalb von Anführungszeichen ist ein Anführungszeichen.
- In Dateien mit Leerzeichen als Trennzeichen darf eine Beschreibung am Zeilenende Leerzeichen enthalten: Alles nach der letzten Koordinatenspalte ist die Beschreibung.
- Zeilen, die mit `#`, `;` oder `//` beginnen, sowie Leerzeilen werden übersprungen.
- Eine Byte-Order-Mark am Dateianfang wird ignoriert.

## Kopfzeile

Die erste Zeile gilt als Kopfzeile, wenn weniger als zwei ihrer Felder Zahlen sind. Wenn jedes Feld der Kopfzeile ein Name ist, den CivilCraft erkennt, ergibt sich die Spaltenreihenfolge daraus („aus der Kopfzeile“). Namen werden ohne Beachtung von Groß- und Kleinschreibung, Leerzeichen, Punkten, Unterstrichen, Bindestrichen und Klammern verglichen:

| Spalte | Erkannte Namen |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Wenn ein Kopfzeilenname nicht erkannt wird oder die Namen keine der acht Reihenfolgen ergeben, wird die Kopfzeile übersprungen und die Reihenfolge aus der Spaltenzahl geschätzt.

:::warning
Eine Kopfzeile, die sowohl eine Breitengradspalte (`lat`, `latitude`) als auch eine Längengradspalte (`lon`, `long`, `longitude`) nennt, wird als Grad gelesen, nicht als Nord- und Ostwert. Beim {{ui:Importieren}} werden die Punkte über das Koordinatensystem des Projekts umgerechnet. Ein Projekt ohne Koordinatensystem fragt Sie zuerst danach. Zeilen außerhalb von ±90° Breite oder ±180° Länge werden abgelehnt. Siehe [GIS-Daten importieren](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Schätzung aus der Spaltenzahl

Ohne brauchbare Kopfzeile und mit **Spalten** auf {{ui:Erkennen}}:

- 5 oder mehr Spalten: PNEZD.
- 4 Spalten: PNEZ, wenn die erste Spalte in jeder geprüften Zeile eine ganze Zahl ist und die vierte eine Zahl ist; sonst NEZD.
- 3 Spalten: NEZ.

PNEZD und PENZD lassen sich anhand der Zahlen nicht unterscheiden. Die Schätzung folgt **Punktzeilen** in den [CivilCraft-Einstellungen](topic:settings): P, N, E, Z, D am Anfang oder P, E, N, Z, D (dann werden vier Spalten als PENZ und drei als ENZ gelesen). Der Dialog meldet „aus der Spaltenzahl geschätzt, prüfen Sie, ob Nord- und Ostwert vertauscht sind“. Wählen Sie unter **Spalten** die richtige Reihenfolge, wenn die Vorschau falsch aussieht.

## Wie Zeilen geprüft werden

- Eine Zeile darf die Beschreibung auslassen.
- Nord- und Ostwert müssen Zahlen sein. Die Höhe darf leer sein; der Punkt bleibt dann erhalten, wird aber nicht in der Oberfläche verwendet.
- Die Punktnummer darf beliebigen Text enthalten, auch Buchstaben wie `CP1`, darf aber nicht leer sein.
- Wenn sich eine Punktnummer wiederholt, bleibt die erste Zeile erhalten. Die anderen werden als nicht gelesen aufgeführt.
- Beschreibungen werden bis zu 200 Zeichen behalten. Steuerzeichen werden zu Leerzeichen.
- Bis zu 200 nicht gelesene Zeilen werden für den Dialog behalten (25 davon angezeigt), und alle werden gezählt.

## Punktgruppen

Die Gruppe eines Punktes ist das erste Wort seiner Beschreibung in Großbuchstaben. „GRD“, „grd shot“ und „Grd“ gehören alle zur Gruppe GRD. Ein Punkt ohne Beschreibung gehört zu „(ohne Beschreibung)“. Siehe [Vermessungspunkte importieren](topic:import-points).

## Schreiben von Punkten

CivilCraft exportiert noch keine Punkt-Textdatei. Punkte werden als LandXML (als CgPoints), in der Projektdatei und über den GIS-{{ui:Exportieren}} als Shapefile, GeoPackage oder GeoJSON mit den Feldern P, N, E, Z und D ausgegeben ([Ist-Daten für GIS exportieren](topic:gis-export)). Siehe [Noch nicht umgesetzt](topic:not-built-yet).
