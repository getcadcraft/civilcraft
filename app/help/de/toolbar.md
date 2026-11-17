---
title: Symbolleisten-Referenz
summary: Jede Schaltfläche der Symbolleiste in CivilCraft, was sie tut, ihre Taste und wann sie ausgegraut ist oder die Ausführung verweigert.
keywords: Symbolleiste, Schaltflächen, Befehle, Werkzeuge, Datei, Export, Geländemodell, Entwurf, Bearbeiten, Ansicht, Menü
from: 4c4352bc
---

Die Symbolleiste verläuft oben in der App in sieben Gruppen. Jede Schaltfläche zeigt beim Darüberfahren mit der Maus ihren Tooltipp und ihre Taste.

## Datei

| Schaltfläche | Taste | Funktion |
|---|---|---|
| {{ui:Neu}} | keine | Startet ein leeres Projekt. Fragt vorher nach, wenn es nicht gespeicherte Änderungen gibt. |
| {{ui:Öffnen}} | {{key:Mod+O}} | Öffnet eine Punktdatei (CSV, TXT), LandXML oder ein CivilCraft-Projekt. |
| {{ui:Speichern}} | {{key:Mod+S}} | Lädt das Projekt als `<name>.civilcraft.json` herunter. |

## Export

| Schaltfläche | Taste | Funktion |
|---|---|---|
| {{ui:LandXML}} | keine | Lädt `<name>.xml` herunter: Punkte, Oberflächen, Trassen, Längsschnitte und das Rohrnetz als LandXML 1.2. „Noch nichts zu exportieren.“, wenn das Projekt leer ist. |
| {{ui:DXF}} | keine | Lädt `<name>.dxf` herunter: die Linien des Plans als R12-DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Öffnet **Plan als PDF plotten**. „Noch nichts zu plotten.“, wenn das Projekt leer ist. |

## Geländemodell

| Schaltfläche | Taste | Funktion |
|---|---|---|
| {{ui:Bruchkante}} | {{key:B}} | Klicken Sie Vermessungspunkte der Reihe nach an, {{key:Enter}} beendet. Die Bruchkante übernimmt die Höhen der Punkte. |
| {{ui:Grenze}} | {{key:O}} | Klicken Sie die Ecken der äußeren Grenze an, {{key:Enter}} beendet. Ersetzt jede bestehende Grenze. |

Beide zeigen „Noch kein Geländemodell vorhanden: zuerst Vermessungspunkte öffnen.“, wenn kein Geländemodell vorhanden ist.

## Entwurf

| Schaltfläche | Taste | Funktion |
|---|---|---|
| {{ui:Trasse}} | {{key:A}} | Klicken Sie die PIs der Reihe nach an, {{key:Enter}} beendet. |
| {{ui:Plateau}} | {{key:G}} | Klicken Sie die Ecken des Plateaus an, {{key:Enter}} beendet. Wie bei den Geländewerkzeugen wird gewarnt, wenn kein Geländemodell vorhanden ist; ein Plateau wird nur auf einem Geländemodell modelliert. |
| {{ui:Rohre}} | {{key:P}} | Klicken Sie Bauwerke von oben nach unten an (klicken Sie ein vorhandenes an, um sich anzuschließen), {{key:Enter}} beendet. |
| {{ui:Längsschnitt}} | {{key:R}} | Zeigt oder verbirgt die Längsschnittansicht unter dem Plan. |

## Bearbeiten

| Schaltfläche | Taste | Funktion |
|---|---|---|
| {{ui:Rückgängig}} | {{key:Mod+Z}} | Macht die letzte Änderung rückgängig (bis zu 200). Ausgegraut, wenn nichts rückgängig zu machen ist. |
| {{ui:Wiederholen}} | {{key:Mod+Y}} | Stellt wieder her, was rückgängig gemacht wurde. Ausgegraut, wenn nichts zum Wiederholen da ist. |
| {{ui:Kopieren}} | {{key:Mod+C}} | Kopiert die ausgewählten Vermessungspunkte und legt sie als Punktzeilen in die Zwischenablage, die eine Tabellenkalkulation übernehmen kann. Ausgegraut, bis Punkte ausgewählt sind. |
| {{ui:Einfügen}} | {{key:Mod+V}} | Fügt Punkte ein: Sie folgen dem Zeiger, und ein Klick setzt sie mit Nummern ab, die kein anderer Punkt hat. In einer Tabellenkalkulation kopierte Punktzeilen werden ebenfalls eingefügt. |
| {{ui:Mehr}} | keine | Öffnet das folgende Menü. |

Das Menü {{ui:Mehr}}:

| Eintrag | Taste | Funktion |
|---|---|---|
| {{ui:Ausschneiden}} | {{key:Mod+X}} | Kopiert die ausgewählten Punkte und löscht sie (ein Rückgängig-Schritt). |
| {{ui:Kopieren}} | {{key:Mod+C}} | Wie die Schaltfläche {{ui:Kopieren}}. |
| {{ui:Einfügen}} | {{key:Mod+V}} | Wie die Schaltfläche {{ui:Einfügen}}. |
| {{ui:An gleicher Position einfügen}} | {{key:Mod+Shift+V}} | Fügt die Punkte an ihren eigenen Koordinaten ein, mit Nummern, die kein anderer Punkt hat. |
| {{ui:Duplizieren}} | {{key:Mod+D}} | Eine Kopie der ausgewählten Punkte folgt dem Zeiger; klicken Sie, wo sie hin soll. Die Zwischenablage bleibt unverändert. |
| {{ui:Löschen}} | {{key:Delete}} | Löscht die ausgewählten Vermessungspunkte oder die ausgewählte Trasse, das Plateau, das Bauwerk (mit seinen Rohren), das Rohr oder den PVI. |
| {{ui:Alle Punkte auswählen}} | {{key:Mod+A}} | Wählt jeden Vermessungspunkt aus. |
| {{ui:Auswahl aufheben}} | {{key:Esc}} | Hebt die Auswahl auf. |

Ein Eintrag, der im Moment nicht ausgeführt werden kann, ist ausgegraut, und sein Tooltipp sagt, warum. Einzelheiten: [Vermessungspunkte auswählen, kopieren und einfügen](topic:copy-paste-points).

Rückgängig umfasst Änderungen am Entwurf, an den Geländeeinstellungen und an den Vermessungspunkten (Einfügen, Ausschneiden, Duplizieren, Löschen). Anzeigeeinstellungen sind nicht enthalten; das Öffnen oder Importieren einer Datei leert den Rückgängig-Verlauf.

## GIS

| Schaltfläche | Taste | Funktion |
|---|---|---|
| {{ui:Koordinaten}} | keine | Öffnet das Dialogfeld **Koordinatensystem**: Legen Sie fest, in welchem System das Projekt liegt, oder verwenden Sie Gelände- oder lokale Koordinaten. Siehe [Koordinatensystem des Projekts festlegen](topic:coordinate-systems) und [Gelände- und lokale Koordinaten](topic:ground-and-local-coordinates). |
| {{ui:Importieren}} | keine | Importiert GIS-Daten: Shapefiles, GeoJSON, GeoPackage, Höhenraster und LiDAR. Siehe [GIS-Daten importieren](topic:gis-import). |
| {{ui:Exportieren}} | keine | Exportiert Ist-Daten für eine GIS-Abteilung. Siehe [Ist-Daten für GIS exportieren](topic:gis-export). |
| {{ui:Analysieren}} | keine | Öffnet den GIS-Analysebereich: Pufferung, Überlagerung, räumliche Verknüpfung, Auswahl nach Attribut, Messung. Siehe [GIS-Layer analysieren](topic:gis-analysis). |
| {{ui:Attributtabelle}} | keine | In Geländemodell › Mehr. Öffnet die Attributtabelle eines GIS-Layers: sortieren, filtern, auswählen, bearbeiten, Felder hinzufügen, berechnen, als CSV speichern. Siehe [Mit der Attributtabelle eines Layers arbeiten](topic:gis-table). |
| {{ui:Karte}} | keine | Öffnet das Dialogfeld **Kartenlayer**: ein georeferenziertes Bild oder Kartenserver, die Sie hinzufügen und die unter dem Plan gezeichnet werden. Siehe [Kartenlayer unter dem Plan anzeigen](topic:map-layers). |

Die GIS-Werkzeuge werden beim ersten Gebrauch einer dieser Schaltflächen geladen, beim Öffnen einer GIS-Datei oder beim Öffnen eines Projekts mit Koordinatensystem oder GIS-Layern.

## Ansicht

| Schaltfläche | Taste | Funktion |
|---|---|---|
| {{ui:Wählen}} | {{key:V}} oder {{key:Esc}} | Klicken Sie, um Trassen, Plateaus, Bauwerke, Rohre und Punkte auszuwählen ({{key:Shift}} und ein Klick oder Ziehen fügt Punkte hinzu); ziehen Sie Griffe, um PIs, Plateauecken und Bauwerke zu verschieben. |
| {{ui:Einpassen}} | {{key:F}} | Zoomt den Plan so, dass das Geländemodell, die Punkte, Trassen und Plateaus sichtbar sind (in der 3D-Ansicht: alles). |
| {{ui:3D}} | {{key:D}} | Zeigt das Gelände in 3D über dem Plan oder kehrt zum Plan zurück. Die Leiste über der 3D-Ansicht legt Ansicht, Überhöhung, Farbgebung und Anzeigeumfang fest und exportiert GLB oder OBJ. Siehe [Das Gelände in 3D ansehen](topic:site-3d). |

## Schaltflächen in den Bereichen

| Schaltfläche | Ort | Funktion |
|---|---|---|
| {{ui:Beispielgelände öffnen}} | Das Feld auf einem leeren Plan | Lädt die Beispielvermessung (benötigt eine Verbindung, sofern CivilCraft nicht für die Offline-Nutzung gespeichert ist) |
| {{ui:Die Grenze entfernen}} | Linker Bereich, Geländemodell | Entfernt die äußere Grenze |
| {{ui:Gezeichnete Bruchkanten entfernen}} | Linker Bereich, Geländemodell | Entfernt jede mit dem Werkzeug gezeichnete Bruchkante (nicht die Bruchkantengruppen) |
| {{ui:Geländemodell aus den Punkten neu erstellen}} | Linker Bereich, Geländemodell (nur LandXML-Geländemodell) | Verwirft das LandXML-TIN und erstellt das Modell aus den Punkten neu; kann nicht rückgängig gemacht werden |
| {{ui:Vom Gelände aus beginnen}} | Rechter Bereich, Trasse | Beginnt ein Sollprofil mit einem PVI auf dem Gelände an jedem Ende |
| {{ui:Längsschnittansicht}} | Rechter Bereich, Trasse | Öffnet die Längsschnittansicht für diese Trasse |
| {{ui:PVIs hinzufügen}} | Profilleiste | Solange sie gedrückt ist, fügt ein Klick im Profil einen PVI hinzu |
| {{ui:Jede Sohle nach den Regeln festlegen}} | Rechter Bereich, Rohrnetz | Legt die Sohlen aller Rohre nach den Regeln fest |
| {{ui:Seine Sohlen nach den Regeln festlegen}} | Rechter Bereich, Rohr | Legt die Sohlen dieses Rohrs nach den Regeln fest |
