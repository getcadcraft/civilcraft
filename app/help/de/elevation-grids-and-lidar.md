---
title: Höhengitter und LiDAR
summary: Erstellen Sie das bestehende Gelände aus einem DEM (GeoTIFF oder ASCII-Gitter) oder aus LiDAR-Punkten (LAS, LAZ): Wählen Sie den Bereich, dünnen Sie die Daten aus, wählen Sie die Klassen und prüfen Sie die Höheneinheiten, und geben Sie eine Fläche als GeoTIFF-Höhengitter zurück.
keywords: dem, dtm, Höhengitter, geotiff, tif, ascii-gitter, asc, lidar, las, laz, Punktwolke, Klassen, Gelände, Ausdünnung, nodata, Raster, GeoTIFF exportieren, gis
from: c8b2d18a
---

Öffentliche Höhendaten gibt es auf zwei Wegen: **Höhengitter** (ein DEM: eine Höhe pro quadratischer Zelle, meist ein GeoTIFF `.tif` oder ein ASCII-Gitter `.asc`) und **LiDAR-Punkte** (Millionen Laserrückläufer in einer `.las`-Datei, oder `.laz`, wenn komprimiert). CivilCraft macht daraus Vermessungspunkte oder eine Fläche, im Browser: Es wird nichts hochgeladen.

## Die Datei öffnen

1. Klicken Sie auf {{ui:Öffnen}} (oder {{ui:Importieren}} in der Gruppe GIS) und wählen Sie die Datei, oder ziehen Sie sie auf den Lageplan. Bei einem ASCII-Gitter wählen Sie auch dessen `.prj`-Datei, damit CivilCraft sein Koordinatensystem kennt.
2. Der Importdialog zeigt, was die Datei über sich selbst aussagt: Größe, Zellen oder Punkte, Koordinatensystem, Lage in Breiten- und Längengrad und Höhenbereich. Bei LiDAR wird zuerst jeder Punkt einmal gelesen, um die **Klassen** zu zählen (ein Fortschrittsbalken zeigt den Stand; mit {{ui:Abbrechen}} stoppen Sie ihn).

Ein GeoTIFF mit drei oder vier Bändern (Rot, Grün, Blau) ist ein Bild und keine Höhenangabe: Es wird stattdessen den Kartenlayern zugeordnet.

## Auswählen, was übernommen wird

- **Bereich**: {{ui:Die Grenzen des Projekts und ein Rand}} (geben Sie den Rand ein), {{ui:Was der Lageplan jetzt zeigt}} oder {{ui:Die ganze Datei}}. Nur dieser Teil der Datei wird gelesen.
- **Ausdünnen auf**: der Abstand der Punkte, die Sie erhalten, in den Einheiten des Projekts. Die Zeile unter den Einstellungen zeigt beim Tippen, wie viele Punkte das ergibt. Bei einem Gitter behält CivilCraft jede zweite, dritte … Zelle, sodass die Höhen genau die der Datei bleiben; es mittelt nie Zellen. Bei LiDAR wird der Bereich in Quadrate dieser Größe geteilt, und pro Quadrat bleibt ein Punkt: {{ui:Der Punkt, der der Mitte jeder Zelle am nächsten liegt}} (Standard), {{ui:Der tiefste Punkt in jeder Zelle}} (gut, wenn die Datei keine Geländeklasse hat: Das Gelände liegt unter den Bäumen) oder {{ui:Der Durchschnitt der Punkte jeder Zelle}}.
- **Klassen** (LiDAR): Gelände (Klasse 2) ist angekreuzt, wenn die Datei sie hat; Gebäude, Bäume und Rauschen bleiben weg. Gibt es keine Geländeklasse, sind alle Klassen angekreuzt, und der Dialog sagt das.
- **Gelände** (LiDAR, 0.8): Eine Drohnenwolke hat keine Geländeklasse. Hat die Datei keine, startet der Dialog bei {{ui:Das Gelände selbst finden (Drohnenwolken, keine Geländeklasse)}}: Jede Klasse außer Rauschen wird gelesen, der tiefste Punkt jeder Zelle bleibt, und dann entfernt CivilCraft Gebäude, Bäume und vereinzelte tiefe Punkte mit einem progressiven morphologischen Filter (Zhang und andere, 2003), den Sie steuern können: **Größtes zu entfernendes Objekt** (die Breite des größten Gebäudes; Fenster wachsen, bis sie es bedecken; 0 bedeutet 20 Zellen) und **Steilste Geländeneigung**. Die Arbeit erfolgt auf dem Gitter der tiefsten Punkte, sodass eine Wolke mit zig Millionen Punkten nicht mehr kostet als ihre Zellenzahl (das Ausdünnen ist ein einziger Durchlauf im Stream). Der Abstand ist die Zelle: Eine gröbere ist schneller und übersieht kleine Objekte weniger, als man erwartet; eine feinere behält mehr Geländedetails. Der Bericht sagt, wie viele Punkte als Gelände behalten, wie viele Zellen als Objekte entfernt und wie viele vereinzelte tiefe Punkte verworfen wurden. Bei einer synthetischen 300-m-Drohnenbefliegung mit fünf Gebäuden, 70 Bäumen und 200 tiefen Ausreißern lagen die behaltenen Punkte innerhalb von 3 cm des wahren Geländes, und kein Dach und keine Baumkrone blieb erhalten.
- **Höhen in der Datei**: Meter, Fuß oder US-Vermessungsfuß. Sagt die Datei es, ist ihre Einheit schon gewählt. Sagt sie es nicht, müssen Sie wählen: Der Dialog zeigt den Höhenbereich in beiden Einheiten, damit Sie sehen, welche für den Standort sinnvoll ist.
- **Importieren als** (nur Gitter): {{ui:Vermessungspunkte (Beschreibung DEM)}} oder {{ui:Das Geländemodell selbst (ein Raster aus Dreiecken)}}.

Ein Import umfasst höchstens 500,000 Punkte. Würde eine Auswahl mehr ergeben, nennt der Dialog, um wie viel, und welcher Abstand passen würde, und {{ui:Importieren}} bleibt deaktiviert.

Klicken Sie auf {{ui:Importieren}}. Ein Fortschrittsbalken zeigt das Einlesen; {{ui:Abbrechen}} stoppt es, und nichts ändert sich.

:::warning
Die Höheneinheiten sind eine häufige Falle. Viele DEMs im State-Plane-System haben Rechts- und Hochwerte in Fuß, die Höhen aber in Metern. Vergleichen Sie den Bereich, den der Dialog zeigt, mit dem, was Sie über den Standort wissen.
:::

## Was Sie erhalten

- **Vermessungspunkte**: nummeriert nach Ihrer höchsten Punktnummer, mit der Beschreibung `DEM` (Gitter) oder `LIDAR`, sodass sie eine Punktgruppe unter **Punkte** bilden und die Fläche wie jede andere Punkte erzeugen. Der Import ist ein einziger Schritt: {{key:Mod+Z}} entfernt sie wieder.
- **Das Geländemodell selbst**: ein TIN aus dem Gitter, zwei Dreiecke pro Zelle, geteilt an der Diagonale von Südwest nach Nordost. Ein Dreieck mit einer Ecke ohne Daten bleibt weg, sodass Lücken in den Daten Lücken bleiben. Die Fläche entspricht dem Gitter an jedem Gitterpunkt und ist innerhalb jedes Dreiecks eine ebene Fläche zwischen ihnen. Sie ersetzt das Geländemodell des Projekts (der Dialog fragt vorher); {{key:Mod+Z}} holt das vorherige Geländemodell zurück. Die Überschrift des linken Bereichs lautet **Geländemodell (aus einem Höhengitter)**.

## Koordinatensysteme

- Hat das Projekt ein Koordinatensystem und die Datei nennt ein anderes, wird jeder Punkt in das System des Projekts umgerechnet (und in dessen Gelände- oder lokale Koordinaten, wenn vorhanden).
- Hat das Projekt keines, und ist das System der Datei in den Einheiten des Projekts (Fuß oder Meter), bietet der Dialog an, es zum Koordinatensystem des Projekts zu machen, im selben Rückgängig-Schritt wie die Punkte.
- Ist die Datei in Breiten- und Längengrad oder in Metern bei einem Fuß-Projekt, bittet der Dialog Sie zuerst, das Koordinatensystem des Projekts zu wählen.
- Sagt die Datei nichts dazu, werden ihre Zahlen als Koordinaten des Projekts übernommen. Sie können stattdessen das System der Datei wählen.

## Eine Fläche als GeoTIFF exportieren

1. Klicken Sie in der Gruppe GIS auf {{ui:Exportieren}}.
2. Wählen Sie im GeoTIFF-Teil die Fläche (bestehendes Gelände oder das Planungsgelände) und die Zellgröße. Der Standard stammt von der mittleren Dreieckskante der Fläche. Der Dialog zeigt die Größe des Gitters, das geschrieben wird.
3. Klicken Sie auf {{ui:GeoTIFF herunterladen}}.

Die Datei ist ein Band mit 32-Bit-Gleitkommahöhen in den Einheiten des Projekts, über die Ausdehnung der Fläche; Zellen außerhalb der Fläche sind „no data“ (−3.4028235e38). Der Wert jeder Zelle ist die Höhe der Fläche in der Mitte der Zelle. Die Koordinaten sind **Gitter**koordinaten: Ein Projekt in Gelände- oder lokalen Koordinaten wird zurück in das Gitter umgerechnet. Die Datei nennt das Koordinatensystem des Projekts über seinen EPSG-Code; ein System ohne EPSG-Code wird nicht geschrieben, und der Dialog warnt Sie, der GIS-Abteilung mitzuteilen, um welches System es sich handelt.

## Was geprüft wurde

- Die Leser für GeoTIFF und ASCII-Gitter wurden gegen GDAL (über rasterio) geprüft, die Bibliothek, die die meisten GIS-Programme zum Lesen dieser Dateien verwenden: 32-Bit-Float- und 16-Bit-Integer-Gitter, gekachelt und in Streifen, DEFLATE und LZW, nodata, Skalierung und Offset, Pixel-ist-Punkt, ein UTM-Gitter, ein State-Plane-Gitter in US-Vermessungsfuß und ein Breiten-/Längengrad-Gitter – alle Werte gleich.
- Die LAS- und LAZ-Leser wurden gegen laspy geprüft: LAS 1.2 und 1.4, Punktformate 0, 1, 3, 6, 7 und 8, mit und ohne Koordinatensystem, sowie LAZ, geschrieben von seinem LASzip-kompatiblen Backend – alle Punkte gleich.
- Umgerechnete Koordinaten wurden gegen PROJ auf 1 mm geprüft.
- Exportierte GeoTIFFs wurden von GDAL zurückgelesen: Koordinatensystem, Zellpositionen, nodata, Einheiten und Werte, die bis auf 0.0001 der Fläche entsprechen.
- Nichts davon wurde in anderen GIS- oder CAD-Programmen geöffnet.

## Noch nicht umgesetzt

- Änderungen des Höhenbezugs (Geoidmodelle): Höhen werden so verwendet, wie die Datei sie hat.
- Wellenformdaten, LiDAR-Rückläufer außer nach Klasse, Farben und Intensitäten.
- Mehrere Bänder, Übersichten oder Dateien über 200 MB.
- Schreiben von LAS oder LAZ aus einer Fläche oder aus diesem Werkzeug (das Add-on [Punktwolken](topic:point-clouds) schreibt eine bereinigte Wolke als LAS 1.4 oder LAZ).
