---
title: Ist-Daten für GIS exportieren
summary: Vermessungspunkte, Höhenlinien, Trassen, Plateaus, Rohre und Bauwerke als Shapefiles, GeoPackage, GeoJSON oder KML an eine Stadt- oder Kreis-GIS-Stelle exportieren, in Gitterkoordinaten des Koordinatensystems des Projekts.
keywords: gis, export, kml, kmz, google earth, ist-daten, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, rohre, bauwerke, leitungen, stadt, kreis, gitter, boden, epsg, prj
from: bba4fea5
---

Viele Städte und Kreise verlangen bei Projektabschluss Ist-Daten in einem GIS-Format: wo die Rohre und Bauwerke liegen, die endgültigen Höhen, die Straßenachse. **GIS › Exportieren** schreibt, was CivilCraft enthält, als GIS-Layer, je einen pro Objektart.

## Vor dem Export

1. Legen Sie das Koordinatensystem des Projekts in {{ui:Koordinaten}} fest. Eine GIS-Stelle muss wissen, wo die Zahlen liegen; ohne System enthalten die Dateien nur die eigenen Zahlen des Projekts und nennen keines.
2. Prüfen Sie Gelände, Trassen, Plateaus und Rohrnetz so, wie Sie sie übergeben wollen.
3. Fragen Sie bei der Stelle nach, welches Format und welches Koordinatensystem sie möchte. Viele verlangen noch Shapefiles in der regionalen State-Plane-Zone; neuere Systeme nehmen GeoPackage.

## Exportieren

1. Klicken Sie in der Gruppe **GIS** auf {{ui:Exportieren}}.
2. Wählen Sie unter **Was** die zu sendenden Arten aus. Jede zeigt, wie viele Objekte sie hat; Arten ohne Inhalt sind ausgegraut.
3. Wählen Sie unter **Als** das Format.
4. Lesen Sie die Hinweise zu Koordinaten und Einheiten und klicken Sie dann auf die Schaltfläche zum Herunterladen. Die Statuszeile sagt, was enthalten ist und welche Feldnamen gekürzt wurden.

Der Dialog enthält auch den Export des Höhenrasters ({{ui:Geländemodell als GeoTIFF-Höhenraster}}); siehe [Höhenraster und LiDAR](topic:elevation-grids-and-lidar).

## Was jede Art enthält

| Art | Form | Felder |
|---|---|---|
| Vermessungspunkte | Punkte mit Höhe | `P` Punktnummer, `N` Hochwert, `E` Rechtswert, `Z` Höhe, `D` Beschreibung |
| Höhenlinien des bestehenden Geländes, der modellierten Fläche | Linien auf ihrer Höhe | `ELEV` |
| Bruchkanten | Linien mit Höhen | `NAME` |
| Geländegrenze | Polygon (die gezeichnete Grenze, sonst der Rand des Geländemodells) | `NAME` |
| Trassen | Achsen | `NAME`, `LENGTH`, `STA_START`, `STA_END` (Stationen als reine Zahlen) |
| Plateaus | Polygone auf der Plateauhöhe | `NAME`, `ELEV`, `AREA` |
| Böschungsschnittlinien | Linien mit Höhen (Plateaus und Korridore) | `NAME` |
| Korridor-Feature-Linien | Linien mit Höhen: Achse, Fahrbahnränder, Bankette | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Rohre | Linien von der oberen zur unteren Sohle | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (Prozent), `LENGTH`, `NETWORK` |
| Bauwerke | Punkte am Deckel | `NAME`, `RIM`, `INVERT` (die niedrigste Rohrsohle dort), `SUMP`, `DIA`, `DIA_UNIT` |
| Jeder GIS-Layer | Wie importiert | Eigene Felder |

Längen, Stationen und Höhen sind in den Einheiten des Projekts (US-Survey-Fuß oder Meter). Durchmesser von Rohren und Bauwerken sind in Zoll bei Projekten in Fuß und in Millimetern bei Projekten in Metern; `DIA_UNIT` sagt, welches.

## Die Formate

- **Shapefile**: eine `.zip`-Datei mit einem Shapefile je Art (`.shp`, `.shx`, `.dbf`), einer `.cpg`-Datei, die angibt, dass der Text UTF-8 ist, und einer `.prj`, die das Koordinatensystem nennt. Formen mit Höhen werden als Z-Typen des Shapefiles geschrieben. Feldnamen mit mehr als 10 Zeichen werden gekürzt, wie das Format es verlangt; die Statuszeile listet sie auf.
- **GeoPackage**: eine `.gpkg`-Datei mit einer Tabelle je Art; das Koordinatensystem wird mit seinem EPSG-Code gespeichert. Eine Datei statt vieler, lange Feldnamen bleiben erhalten.
- **KML** oder **KMZ** (gezipptes KML): eine Datei mit Breiten- und Längengraden für Google Earth und Webkarten, ein Ordner je Art, jedes Objekt eine Markierung, benannt nach seinem Feld NAME, mit allen Feldern als erweiterte Daten; Höhen in Metern (Höhenmodus absolut). Wie GeoJSON braucht es das Koordinatensystem des Projekts.
- **GeoJSON**: eine Datei mit Breiten- und Längengraden (der GeoJSON-Standard erlaubt nichts anderes), wobei jedes Objekt eine Eigenschaft `kind` trägt (`pipes`, `structures`, …), damit der Empfänger sie trennen kann. Höhen werden, wie der Standard verlangt, in Meter umgerechnet; sie bleiben auf dem Höhenbezugssystem Ihres Projekts (CivilCraft hat kein Geoidmodell). Ein Projekt ohne Koordinatensystem kann nicht nach GeoJSON exportieren; der Dialog sagt, warum.

## Gitter, nicht Boden

GIS-Stellen führen ihre Daten in **Gitter**koordinaten eines Koordinatensystems. Wenn Ihr Projekt Boden- oder lokale Koordinaten nutzt (in {{ui:Koordinaten}} festgelegt), wird jede Koordinate beim Export zurück ins Gitter umgerechnet: Die Zahlen in den Dateien unterscheiden sich von denen des Plans um Ihren Maßstabsfaktor (und bei einem lokalen System um die Drehung). Die Punktfelder `N` und `E` enthalten ebenfalls die Gitterwerte. Der Dialog erinnert Sie daran.

:::tip
Legen Sie den Dateien einen kurzen Hinweis bei: das Koordinatensystem und seinen EPSG-Code, das Höhenbezugssystem Ihrer Höhen, die Einheiten und was jede Datei ist.
:::

## Was geprüft wurde

- Jede geschriebene Datei wurde von GDAL zurückgelesen, der Bibliothek, die die meisten GIS-Programme für diese Dateien verwenden: jede Form, Höhe und jedes Attribut, die Objektanzahlen und das Koordinatensystem als EPSG-Code (`.prj` und GeoPackage). Unsere eigenen Leser lesen sie ebenso zurück.
- GeoJSON-Dateien folgen RFC 7946: Länge vor Breite, kein Element `crs`, äußere Ringe gegen den Uhrzeigersinn und Löcher im Uhrzeigersinn; Positionen stimmten mit PROJ auf 2 mm überein.
- Ein Projekt mit Bodenkoordinaten wurde exportiert und jeder Punkt gegen seine Gitterkoordinaten geprüft.
- Hier wurde noch nichts in anderen GIS-Programmen geöffnet. Prüfen Sie die erste Lieferung mit der Stelle, bevor Sie sich darauf verlassen.
