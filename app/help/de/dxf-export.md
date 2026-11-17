---
title: Lageplan als DXF exportieren
summary: Schreibt die Linien des Lageplans als R12-DXF auf benannte Layer, mit Höhenlinien auf ihrer Höhe und Bruchkanten in 3D, für jedes CAD-Programm.
keywords: dxf, dwg, cad, export, Linienzüge, r12, 2000, 2004, 2007, 2010, 2013, 2018, layer, Höhenlinien, Zeichnungsaustausch, Basiskarte, Hintergrund
from: f2d8ede9
---

{{ui:DXF}} schreibt, was der Lageplan zeigt, als DXF-Datei im R12-Format, der Version, die jedes CAD-Programm öffnet. Wenn Sie mit AutoCAD oder Civil 3D gearbeitet haben, öffnen oder fügen Sie die Datei wie jede andere DXF-Datei ein.

## Exportieren

1. Richten Sie den Lageplan so ein, wie Sie die Zeichnung haben möchten: Wählen Sie unter **Anzeige** das Geländemodell (bestehend oder geplant), das Höhenlinienintervall und welche Elemente eingeschaltet sind (Höhenlinien, Beschriftungen, Punkte, Punktbeschriftungen, Dreiecke, Bruchkanten, Flächenrand, Rohre, Gefällepfeile).
2. Klicken Sie in der Gruppe **Exportieren** auf {{ui:DWG/DXF}} und wählen Sie {{ui:DXF (R12, Text) — die einfache Austauschdatei}}, dann {{ui:Herunterladen}}.
3. Der Browser lädt `<name>.dxf` herunter. Die Statusleiste meldet zum Beispiel: "Exportiert R12-DXF: 2,140 Objekte; Beschriftungen bemessen für 1" = 40'. Höhenbänder werden nicht exportiert."

Koordinaten werden in Ihren Projekteinheiten mit ihren echten Werten geschrieben (State-Plane-Koordinaten bleiben, wie sie sind). Nichts wird skaliert oder verschoben.

## Was in der Datei enthalten ist

| Element | DXF-Objekt | Layer |
|---|---|---|
| Kleine und große Höhenlinien | 2D-Polylinien auf ihrer Höhe | C-TOPO-MINR, C-TOPO-MAJR |
| Höhenlinienbeschriftungen | Text | C-TOPO-TEXT |
| Dreiecke | Polylinien | C-TOPO-TINN |
| Bruchkanten und Begrenzung | 3D-Polylinien | C-TOPO-BRKL |
| Flächenrand | Polylinien | C-TOPO-BNDY |
| Gefällepfeile | Polylinien | C-TOPO-SLOP |
| Vermessungspunkte und ihre Beschriftungen | Punkte (mit Höhe), Text | V-NODE, V-NODE-TEXT |
| Linien aus Linien-Codes | 3D-Polylinien | V-NODE-LINE |
| Trassenachsen | Linien und Bögen | C-ROAD-CNTR |
| Stationierungsstriche und Beschriftungen | Polylinien, Text | C-ROAD-STAN |
| Korridorränder | Polylinien | C-ROAD-CORR |
| Querprofilachsen | Polylinien | C-ROAD-SCTN |
| Bauplätze, Böschungsschnittlinien, Böschungslinien | Polylinien | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Feature-Linien | 3D-Polylinien (Bögen als Stücke innerhalb von 0.01; siehe [Feature-Linien](topic:feature-lines)) | C-GRAD-FEAT |
| Schleppkurven | Polylinien, Text | C-ROAD-SWPT |
| Rohre, Bauwerke, Beschriftungen | Polylinien, Text | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Rohre und Bauwerke mit Problemen | Polylinien | C-STRM-PROB |

Jeder Layer hat eine Farbe. Die vollständige Liste finden Sie unter [Plan-Layer](topic:plan-layers).

## Beschriftungsgröße

Text braucht eine Größe in Zeichnungseinheiten. CivilCraft bemisst die Beschriftungen für den Maßstab, in dem der ganze Lageplan auf ein Tabloid-Blatt (Fuß) oder ein A3-Blatt (Meter) passt, und nennt diesen Maßstab in der Statusmeldung. Wenn Sie in Ihrem CAD-Programm in einem anderen Maßstab plotten, skalieren Sie den Text dort.

## Was nicht exportiert wird

- Höhenbänder (nur auf dem Bildschirm).
- Die Profilansicht. Profile werden als LandXML exportiert, nicht als Zeichnung.
- Das Geländemodell selbst als 3D-Objekt. Verwenden Sie LandXML für das TIN, oder schalten Sie {{ui:Dreiecke}} ein, um dessen Kanten als Linien zu erhalten.
- Alles, was Sie unter **Anzeige** ausgeschaltet haben.

## DWG

{{ui:DWG/DXF}} schreibt dieselben Linien auch als DWG-Zeichnung. Der Dialog fragt nach dem Format: DXF oder DWG von 2000, 2004, 2007, 2010, 2013 oder 2018. 2000 öffnet sich in fast jedem CAD-Programm, alt wie neu; wählen Sie ein neueres Format, wenn die Person, die die Zeichnung erhält, es verlangt. Ihre Auswahl wird in diesem Browser gespeichert.

1. Klicken Sie in der Gruppe **Exportieren** auf {{ui:DWG}}.
2. Wählen Sie das **Format** und klicken Sie auf **DWG herunterladen**.
3. Der Browser lädt `<name>.dwg` herunter. Die Statusleiste meldet, was enthalten ist, zum Beispiel "Exportiert DWG (Format 2018): 12 Polylinien, 40 Beschriftungen auf 9 Layern".

Die DWG enthält dieselben Layer, Farben, Höhenlinien (als Polylinien auf ihrer Höhe), 3D-Bruchkanten, Beschriftungen und Punkte wie die DXF, in denselben Koordinaten. Layernamen, die eine DWG nicht aufnehmen kann, werden geändert, und die Statusmeldung sagt das. CivilCraft schreibt die DWG mit eigenem Code, daher verlässt nichts Ihren Computer.

### Kartenlayer in der DWG

Eine DWG-Zeichnung kann kein Bild in sich enthalten: CAD-Programme zeigen ein Bild, das neben der Zeichnung liegt. Sind Kartenlayer sichtbar, bietet der Dialog **Kartenlayer als Bild neben der Zeichnung** an. Ist das Kästchen angekreuzt, ist der Download eine `.zip`-Datei mit `<name>.dwg`, `<name>-map.png` (die Kartenlayer über der ganzen Zeichnung, bis zu 4,096 Pixel breit) und `<name>-map.pgw` (ihrer Weltdatei für GIS-Programme). Die Zeichnung zeigt das Bild als Bild auf dem Layer G-MAP-IMAG an der richtigen Stelle. Entpacken Sie die Dateien in einen Ordner und halten Sie sie zusammen.
