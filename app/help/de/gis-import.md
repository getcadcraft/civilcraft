---
title: GIS-Daten importieren
summary: Shapefiles, GeoJSON und GeoPackages als GIS-Layer in ein Projekt holen, über das richtige Koordinatensystem platzieren, ihre Attribute ansehen und sie für das Geländemodell verwenden.
keywords: gis, beschriftungen, objekte beschriften, attribute im plan, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importieren, layer, attribute, koordinatensystem, epsg, breite, länge, höhenlinien, flurstücke, bruchkanten, grenze
from: f6b235cc
---

Stadt- und Kreis-GIS-Stellen geben Standortkontext als GIS-Dateien heraus: Flurstücke, Dienstbarkeiten, Höhenlinien, Leitungen, Vermessungspunkte. CivilCraft öffnet drei Arten davon als **GIS-Layer**, die unter Ihrem Entwurf im Plan liegen.

| Datei | Was öffnen |
|---|---|
| Shapefile | Die `.shp` zusammen mit ihren `.shx`, `.dbf`, `.prj` und `.cpg` (wählen Sie alle aus) oder die `.zip`-Datei, in der sie geliefert wurden. Eine Zip-Datei mit mehreren Shapefiles ergibt mehrere Layer. |
| GeoJSON | Die `.geojson`-Datei (eine `.json`-Datei, deren erste Zeilen `FeatureCollection` oder `Feature` enthalten, funktioniert ebenfalls). |
| GeoPackage | Die `.gpkg`-Datei. Jede Objekttabelle darin wird aufgelistet. |
| KML oder KMZ | Die `.kml`-Datei (aus Google Earth oder einer Webkarte) oder die gezippte `.kmz`. Jeder Ordner wird ein Layer (bei mehreren Arten in Punkte, Linien und Polygone aufgeteilt); Name, Beschreibung und erweiterte Daten einer Markierung werden zu ihren Attributen. Höhen sind in Metern und Breiten-/Längengrade, wie bei GeoJSON. |

Punkte, Multipunkte, Linien, Polygone mit Löchern und Formen aus mehreren Teilen werden gelesen, mit ihren Höhen (z), wenn die Datei sie enthält. Messwerte (M) werden weggelassen. Höhenraster und LiDAR öffnen sich auf die gleiche Weise: siehe [Höhenraster und LiDAR](topic:elevation-grids-and-lidar).

## Dateien öffnen

1. Klicken Sie in der Gruppe **GIS** auf {{ui:Importieren}} (oder {{ui:Öffnen}}), wählen Sie die Dateien aus oder ziehen Sie sie auf den Plan. Die Dateien werden auf diesem Computer gelesen; nichts wird hochgeladen.
2. Der Dialog **GIS-Daten importieren** listet jeden gefundenen Layer auf: seine Art, wie viele Objekte (und wie viele ohne Geometrie), wie viele Attributfelder und das Koordinatensystem, das die Datei nennt. Entfernen Sie den Haken bei Layern, die Sie nicht wollen.
3. Lesen Sie den Abschnitt **Koordinatensystem** (unten) und die Zeile **Was geschieht** und klicken Sie dann auf {{ui:Importieren}}.
4. Die Layer erscheinen im Plan und unter **GIS-Layer** im linken Bereich. Der Import ist ein einziger Schritt: {{key:Mod+Z}} nimmt ihn zurück.

Eine große Datei zeigt eine Fortschrittszeile über dem Plan mit einer Schaltfläche {{ui:Abbrechen}}.

## Das Koordinatensystem

GIS-Dateien geben ihren Ort über ein Koordinatensystem an (die `.prj` eines Shapefiles, die Tabelle der Raumbezugssysteme eines GeoPackages; GeoJSON ist immer Breiten- und Längengrad). CivilCraft rechnet jeden Layer aus seinem eigenen System in das des Projekts um. Es rät nie:

- **Das Projekt hat ein Koordinatensystem** (in {{ui:Koordinaten}} festgelegt): Jeder Layer mit eigenem System wird hineingerechnet, einschließlich einer Boden- oder lokalen Anpassung. Eine Datei ohne `.prj` bekommt zwei Möglichkeiten: **Wie das Projekt** (ihre Zahlen werden unverändert geladen) oder **System der Datei wählen**.
- **Das Projekt hat keines, und die Datei liegt in einem projizierten System in den Einheiten Ihres Projekts** (etwa eine State-Plane-Zone in US-Survey-Fuß für ein Projekt in Fuß): Der Dialog bietet **Dieses System als Koordinatensystem des Projekts verwenden** an. Es wird im selben Schritt wie der Import gesetzt. Nichts im Projekt bewegt sich; das System sagt nur, was die Zahlen bedeuten. Sie können stattdessen ein anderes System für das Projekt wählen, und die Layer werden hineingerechnet.
- **Das Projekt hat keines, und die Datei liegt in Breiten- und Längengraden** (jede GeoJSON) **oder in anderen Einheiten**: {{ui:Importieren}} bleibt ausgegraut, bis Sie das Koordinatensystem des Projekts wählen. Die Auswahl beginnt in der Nähe der Daten.
- **Weder Projekt noch Dateien nennen ein System**: Die Zahlen werden unverändert geladen, und der Dialog sagt es.

Höhen werden ebenfalls umgerechnet: GeoJSON-Höhen sind Meter (so sagt es der GeoJSON-Standard); die Höhen anderer Dateien werden in der Einheit ihres eigenen Systems übernommen.

:::warning
Positionen in einer GeoJSON-Datei außerhalb von ±180° Länge oder ±90° Breite sind keine Breiten- und Längengrade. Diese Objekte werden weggelassen, und der Dialog sagt, wie viele es sind. Eine solche Datei ist meist eine projizierte Datei, die ohne ihr System gespeichert wurde; fordern Sie sie erneut an oder das Shapefile mit seiner `.prj` an.
:::

NAD83 wird wie WGS 84 behandelt (das System, das GeoJSON verwendet); beide unterscheiden sich in Nordamerika um einige Meter, daher können GeoJSON-Daten um so viel abweichen. Wo die beste Verschiebung eine Rasterdatei braucht (zum Beispiel NADCON für NAD27), verwendet CivilCraft eine gröbere veröffentlichte Verschiebung, und der Dialog des Koordinatensystems zeigt, wie grob (für NAD27 etwa 20 m), bis Sie die Datei ergänzen: siehe [Gitter-Verschiebungsdateien](topic:coordinate-systems).

## GIS-Layer

Jede Zeile unter **GIS-Layer** hat:

- ein Kontrollkästchen, um den Layer ein- oder auszublenden (ausgeblendete Layer werden auch nicht ausgewählt);
- seine Farbe, aus der Liste gewählt;
- ein Menü (die drei Punkte) mit {{ui:Zoomen auf}}, {{ui:Für das Geländemodell verwenden …}}, {{ui:Umbenennen …}} und {{ui:Entfernen}}.

Ein- und Ausblenden, Umfärben, Umbenennen und Entfernen sind Schritte für Rückgängig. GIS-Layer werden in der Projektdatei gespeichert und kommen beim Öffnen wieder. Sie gehen auch mit dem PDF-Plot des Plans sowie seinen DXF- und DWG-Exporten hinaus, jeweils auf einem Layer namens `GIS-` mit seiner Nummer.

## Beschriftung aus einem Attribut

Im Menü {{ui:Mehr}} des Layers (die drei Punkte unter **GIS-Layer**) wählen Sie unter **Beschriften mit** ein Feld: Jedes Objekt zeigt seinen Wert im Plan, in der Farbe des Layers. Punkte werden neben dem Punkt beschriftet, Linien entlang der Mitte ihres längsten Teils (so gedreht, dass sie von links nach rechts lesbar sind), Polygone in ihrer Mitte. Zahlen werden mit bis zu drei Nachkommastellen angezeigt. Beschriftungen sind auf Papier bei jedem Maßstab 1,8 mm hoch und gehen in den PDF-Plot, DXF und DWG. Wählen Sie **Keine Beschriftung**, um sie zu entfernen; jede Änderung ist ein Schritt ({{key:Mod+Z}} macht sie rückgängig). Ein Layer beschriftet höchstens 5.000 Objekte.

## Ein Objekt ansehen

Mit eingeschaltetem {{ui:Wählen}} klicken Sie auf ein Objekt. **Eigenschaften** zeigt seinen Layer, welches Objekt es ist, seine Form (Teile, Löcher, Eckpunkte), seine Höhen, die Datei, aus der es stammt, und das Koordinatensystem dieser Datei, danach jedes Attribut in einer Tabelle. Attribute sind nur lesbar: CivilCraft zeigt GIS-Daten so, wie sie geliefert wurden; es bearbeitet sie nicht.

Punkte haben Vorrang vor Linien, wenn beide unter dem Zeiger liegen; innerhalb eines Polygons wird das kleinste Polygon gewählt.

## Für das Geländemodell verwenden

Öffnen Sie das Menü eines Layers und wählen Sie {{ui:Für das Geländemodell verwenden …}} (oder die Schaltfläche in **Eigenschaften**). Was angeboten wird, hängt vom Layer ab:

| Layer | Kann werden |
|---|---|
| Linien mit Höhen (3D-Linien) | Bruchkanten auf ihren eigenen Höhen |
| Linien ohne Höhen, aber mit einem Zahlenfeld (Höhenlinien) | Bruchkanten auf der Höhe im gewählten Feld |
| Polygone | Die Geländegrenze (das gewählte Polygon, sonst das größte), oder Bruchkanten entlang ihrer Ränder |
| Punkte mit Höhen oder mit einem Höhenfeld | Vermessungspunkte, beschrieben mit dem Namen des Layers, damit sie eine Punktgruppe bilden |

Jede Verwendung ist ein Schritt für Rückgängig, der die Geometrie in das Projekt kopiert; der Layer selbst bleibt unverändert. Höhen werden in Projekteinheiten übernommen.

## Punktdateien mit Breiten- und Längengraden

Eine Punktdatei, deren Kopfzeile Spalten **latitude** und **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) nennt, wird als Grad gelesen, nicht als Hoch- und Rechtswert. Der Importdialog sagt es. Beim Klick auf {{ui:Importieren}} werden die Punkte in das Koordinatensystem des Projekts umgerechnet; ein Projekt ohne eines fragt Sie zuerst danach. Grad werden nie als Fuß geladen. Zeilen außerhalb von ±90° Breite oder ±180° Länge werden mit dem Grund abgelehnt. Die Höhenspalte wird unverändert übernommen, in Projekteinheiten.

## LandXML-Dateien mit einem Koordinatensystem

Wenn eine LandXML-Datei, die Sie öffnen, ein Element `CoordinateSystem` hat (ein EPSG-Code, eine WKT-Beschreibung oder ein Systemname), bietet CivilCraft es als Koordinatensystem des Projekts an. Nichts bewegt sich, wenn Sie annehmen; das System sagt nur, was die Zahlen bedeuten.

## Was geprüft wurde

- Jeder Leser wurde mit GDAL verglichen, der Bibliothek, die die meisten GIS-Programme für diese Dateien verwenden, an Dateien, die GDAL geschrieben hat: Shapefiles jeder Art mit und ohne Höhen, mehrteilige Linien, Polygone mit Löchern, leere Geometrien, Text-, Zahl-, Datums- und Wahr/Falsch-Attribute, UTF-8- und Windows-1252-Text mit und ohne `.cpg`, eine Zip-Datei mit mehreren Shapefiles, GeoJSON mit jedem Geometrietyp und ein GeoPackage mit vier Tabellen. Jede Geometrie, Höhe und jedes Attribut stimmte überein.
- Aus Breiten- und Längengraden sowie aus UTM umgerechnete Positionen stimmten mit PROJ (der Projektionsbibliothek hinter GDAL) auf 3 mm überein.
- Beschädigte Dateien (abgeschnitten, falsche Größenangaben, defekte Zip-Dateien, defekte GeoPackages) ergeben eine einfache Meldung; nichts hängt sich auf.
- Hier wurde noch nichts in anderen GIS-Programmen geöffnet; Datei-Geodatenbanken, KML und KMZ werden noch nicht gelesen (siehe [Noch nicht umgesetzt](topic:not-built-yet)).
