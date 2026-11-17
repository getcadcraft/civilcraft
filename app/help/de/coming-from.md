---
title: Umstieg von anderer Tiefbau-Software
summary: Wie vertraute Tiefbau-Arbeitsabläufe auf CivilCraft abgebildet werden und welche Unterschiede erfahrene Nutzer in der ersten Stunde stolpern lassen.
keywords: Umstieg, Migration, vertraut, Unterschiede, Arbeitsablauf, Befehle, Zuordnung, COGO, Korridor, Geländemodellierung, Rohrnetz, Stile, Befehlszeile
from: feae37d6
---

Wenn Sie Civil 3D kennen, kennen Sie die Ideen in CivilCraft bereits: Punkte und Punktgruppen, TIN-Geländemodelle mit Bruchkanten und Grenzen, Trassen über PIs, Längsschnitte über PVIs, Querschnitte, die zu Korridoren gezogen werden, Geländeanschluss über Böschungen, Freispiegel-Rohrnetze und LandXML. Anders ist fast alles drumherum: Es gibt keine Zeichnungsdatei, keine Befehlszeile (außer Sie wählen die Menüart {{ui:Klassisches Zeichnen}}), keine Stile, keinen Prospector und keine Einstellungsdialoge. CivilCraft ist ein kleines, fokussiertes Werkzeug im Browser, und in dieser Version leistet es nur einen Bruchteil dessen, was ein vollständiges Tiefbaupaket kann. Diese Seite ordnet Ihr Wissen dem zu, was hier vorhanden ist.

:::tip
Wenn Ihnen das Menüband von Civil 3D gefällt, wählen Sie die Menüart {{ui:Tiefbau-Menüband}} unter {{ui:Einstellungen}} › {{ui:CivilCraft}} › {{ui:Menüs, Tasten und Maus}}: Registerkarten Start, Geländemodelle, Ändern, Geolokalisierung, Ansicht und Ausgabe. Die mittlere Maustaste verschiebt, und {{key:Shift}} mit der mittleren Maustaste dreht die 3D-Ansicht. Wenn Sie Befehle eintippen, fügt {{ui:Klassisches Zeichnen}} eine Befehlszeile hinzu (ALIGNMENT, PAD, PROFILE, ZOOM …). Siehe [Menüs, Tasten und Maus](topic:menus-keys-and-mouse).
:::

## Ablaufkarte

| Was Sie tun möchten | Vertrauter Weg | In CivilCraft |
|---|---|---|
| Vermessungspunkte einlesen | Punkte mit einem Punktdateiformat importieren | {{ui:Öffnen}}, dann die Spaltenreihenfolge unter **Punkte importieren** prüfen ([Vermessungspunkte importieren](topic:import-points)) |
| Punkte sortieren | Punktgruppen, Beschreibungsschlüssel | Automatische Gruppen nach dem ersten Wort der Beschreibung; keine Beschreibungsschlüssel |
| Einen Punkt bearbeiten | Punkteditor, Griffe | Anklicken und in Eigenschaften eingeben oder ziehen ([Vermessungspunkt bearbeiten](topic:edit-points)) |
| Bestandsgelände aufbauen | Geländemodell erstellen, Punktgruppen als Daten hinzufügen | Automatisch: Das Geländemodell wird neu erstellt, wenn sich seine Eingaben ändern |
| Bruchkanten hinzufügen | Bruchkanten aus Polylinien oder Feature-Linien hinzufügen | Eine Punktgruppe auf {{ui:Bruchkante}} setzen, oder Punkte mit dem Werkzeug {{ui:Bruchkante}} ({{key:B}}) anklicken |
| Geländemodell beschneiden | Äußere Grenze, Ausblendgrenze, maximale Dreieckslänge | {{ui:Grenze}} ({{key:O}}, nur außen) und **Längste äußere Kante** |
| Höhenlinien anzeigen | Geländestil | **Anzeige** im linken Bedienfeld: Abstand, Hauptlinie alle, Beschriftungen, Bänder, Gefällepfeile |
| Achse anlegen | Werkzeuge zur Trassenerstellung, Einstellungen für Bögen und Übergangsbögen | {{ui:Trasse}} ({{key:A}}): PIs anklicken, {{key:Enter}}. Radien und Übergangslängen in der PI-Tabelle |
| Längsschnittansicht erstellen | Assistent für Längsschnittansichten, Bänder | {{ui:Längsschnitt}} ({{key:R}}): eine Längsschnittansicht unter dem Plan, immer eingepasst |
| Gefälle entwerfen | Werkzeuge zur Längsschnittplanung | {{ui:Vom Gelände aus beginnen}}, {{ui:PVIs hinzufügen}} ({{key:I}}), PVIs ziehen, **Ausrundung L** eingeben |
| Straße bauen | Regelquerschnitt, Teilquerschnitte, Korridor, Ziele, Bereiche | Unter der Trasse das Häkchen bei **Regelquerschnitt entlang des Entwurfslängsschnitts ziehen** setzen. Je Seite ein Fahrstreifen, Bankett und Böschung, oder jede Seite aus Teilen (Rinne, Bordstein, Gehweg …) |
| Plateau modellieren | Feature-Linien, Geländegruppen, Kriterien | {{ui:Plateau}} ({{key:G}}): ein ebenes Plateau mit Abtrags- und Auftragsböschungen bis zum Böschungsschnittpunkt |
| Erdarbeiten berechnen | Volumenflächen, Volumen-Übersicht | **Erdarbeiten** im rechten Bedienfeld, Rastermethode, aktualisiert sich laufend |
| Regen- oder Schmutzwasserkanal anlegen | Rohrnetz mit Teileliste, Regeln | {{ui:Rohre}} ({{key:P}}): Bauwerke flussabwärts anklicken; drei Regeln, die Sie festlegen; automatische Sohlen |
| Mit anderen austauschen | LandXML-Import und -Export | {{ui:Öffnen}} eine LandXML-Datei; {{ui:LandXML}} zum Exportieren ([LandXML austauschen](topic:landxml)) |
| Linienwerk an CAD senden | Export nach DWG | {{ui:DWG}} (Format 2000 bis 2018) oder {{ui:DXF}} (R12) |
| Plotten | Layouts, Ansichtsfenster, Blattsätze | {{ui:PDF}}: ein Querformat-Blatt des Plans im gewählten Maßstab; Lage- und Längsschnittblätter sowie Querschnittsblätter als PDF |
| Arbeit zwischen Dateien teilen | Datenverknüpfungen, Referenzen | Nicht verfügbar: ein Projekt je Datei |
| Rückgängig | Rückgängig | {{key:Mod+Z}} und {{key:Mod+Y}}, 200 Schritte. Anzeigeeinstellungen sind keine Rückgängig-Schritte |

## Unterschiede, die Menschen stolpern lassen

**Es gibt keine Befehlszeile**, außer Sie wählen die Menüart {{ui:Klassisches Zeichnen}}. Werkzeuge sind Symbolleisten-Schaltflächen und einzelne Buchstaben: {{key:A}} Trasse, {{key:G}} Plateau, {{key:P}} Rohre, {{key:B}} Bruchkante, {{key:O}} Grenze, {{key:R}} Längsschnitt, {{key:I}} PVIs hinzufügen, {{key:V}} Wählen, {{key:F}} Einpassen. In den anderen Menüarten tut das Eintippen eines Befehlsnamens nichts. Siehe [Tasten und Maus](topic:keyboard).

**Enter beendet; ein Doppelklick ist riskant.** Klicken Sie den letzten Punkt einmal an und drücken Sie dann {{key:Enter}}. In dieser Version beendet ein Doppelklick ebenfalls, verwirft aber den Punkt, auf den Sie doppelgeklickt haben. Ein Rechtsklick beendet oder wiederholt nichts. Er verschiebt nur, wenn Sie damit ziehen.

**Alles ist dynamisch, immer.** Ändern Sie eine Punktgruppe, einen Radius, einen PVI oder eine Plateauneigung, und Geländemodell, Höhenlinien, Korridor, Böschungslinien und Volumen aktualisieren sich sofort. Es gibt nichts neu zu erstellen, und nichts ist veraltet.

**Nichts ist ein Zeichnungsobjekt.** Der Plan ist eine Ansicht des Entwurfs, keine Zeichnung, die Sie mit CAD-Befehlen bearbeiten können. Sie können keine eigenen Linien oder Texte hinzufügen, die Farbe eines Layers nicht ändern und nichts zerlegen. Exportieren Sie nach DXF und vollenden Sie die Zeichnung in einem CAD-Programm.

**Keine Stile.** Farben, Linienstärken, Beschriftungsgrößen und Layernamen sind festgelegt (siehe [Planlayer](topic:plan-layers)). Papier und Modell in der App-Leiste schalten zwischen hellem und dunklem Bildschirm um.

**Je eines.** Ein bestehendes Geländemodell, ein Ergebnis der Geländemodellierung und ein Rohrnetz je Projekt. Viele Trassen und Plateaus sind in Ordnung.

**Einheiten sind nur Bezeichnungen.** Die Wahl von {{ui:US feet}} oder {{ui:Metres}} rechnet nichts um. Es gibt keinen Zeichnungsmaßstab. Ein Koordinatensystem ist optional: Stellen Sie eins unter {{ui:Koordinaten}} ein, und nichts verschiebt sich. Es sagt nur, was die Zahlen bedeuten (siehe [Koordinatensystem des Projekts festlegen](topic:coordinate-systems)). Fuß werden beim Schreiben nach LandXML als US-Survey-Fuß behandelt.

**Bruchkantengruppen verbinden sich in der Reihenfolge der Punktnummern.** Eine Gruppe, die auf {{ui:Bruchkante}} gesetzt ist, wird zu einer Linie durch alle ihre Punkte, in der Nummernfolge. Geteilte Codes (zwei Fließlinien mit dem Code „FL“) ergeben eine Zickzacklinie. Zeichnen Sie solche Linien von Hand.

**Stationen sehen gleich aus, Meter unterscheiden sich.** Fuß verwenden 100-ft-Stationen (12+34.56), Meter verwenden 1000-m-Stationen (1+234.567).

**Löschen auf dem Mac.** Die Mac-Taste mit der Bezeichnung delete ist im Browser {{key:Backspace}}. Verwenden Sie {{key:Delete}} (Fn und delete) oder die Schaltfläche {{ui:Löschen}}, um eine Auswahl zu löschen.

**Dateien sind Downloads.** {{ui:Speichern}} lädt jedes Mal eine `.civilcraft.json`-Datei herunter. Es gibt kein „über die geöffnete Datei speichern“. Eine Sicherungskopie nicht gespeicherter Arbeit wird in diesem Browser aufbewahrt ([Nicht gespeicherte Änderungen wiederherstellen](common:recover)). Das Öffnen einer Punktdatei ersetzt die Punkte, ohne nachzufragen. Siehe [Dateien öffnen, speichern und exportieren](topic:files).

**Regeln sind Ihre.** Die Regeln für das Rohrnetz und der Korridor-Regelquerschnitt beginnen mit Platzhaltern, die kein Standard sind. Legen Sie Ihre eigenen fest, bevor Sie einer Prüfung vertrauen.

**Volumen sind rasterbasiert.** Abtrag und Auftrag stammen aus einem feinen Raster zwischen den beiden Flächen, innerhalb der Böschungslinien, ohne Auflockerung und Setzung. Sie sind nahe an einem TIN-zu-TIN-Volumen, aber nicht gleich.

## Was fehlt

Andere Übergangsbögen als Klothoiden, Regelquerschnitte, die sich entlang der Straße ändern, geneigte Plateaus, Einlaufkapazität und Rückhaltung, Teilekataloge, Rohre im Längsschnitt, Parzellenlayouts und Grundstücksgrößen, Ausgleichung nach der Methode der kleinsten Quadrate und Vermessungsdatenbanken, das Öffnen von DWG und mehr. Die vollständige Liste mit dem, was Sie heute stattdessen tun können, steht unter [Noch nicht umgesetzt](topic:not-built-yet).
