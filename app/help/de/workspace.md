---
title: Der Bildschirm, Teil für Teil
summary: Ein Rundgang durch jede Leiste und jeden Bereich in CivilCraft, mit dem Namen, der auf dem Bildschirm steht, von der Symbolleiste bis zur Statusleiste.
from: 76272010
keywords: Oberfläche, Bildschirm, Symbolleiste, Bereiche, Eigenschaften, Statusleiste, Längsschnittansicht, Layout, Rundgang, UI
---

CivilCraft hat einen einzigen Bildschirm. Es gibt keine Registerkarten und keine Layouts. Die seitlichen Bereiche lassen sich verschieben, schweben lassen oder in ein eigenes Fenster legen: siehe [Bereiche anordnen und einen zweiten Monitor nutzen](common:arrange-panels). Von oben nach unten und von links nach rechts:

- die **Anwendungsleiste** (CadCraft-Zeichen, App-Name, Version, Info, Bildschirmmodus, Hilfe, Für Offline speichern, Papier und Modell)
- die **Symbolleiste** mit sieben Gruppen von Schaltflächen
- der **linke Bereich**: Grundstück, Punkte, Geländemodell, Anzeige und, sobald Sie welche importieren, GIS-Layer
- der **Lageplan** in der Mitte, mit der **Längsschnittansicht** darunter, wenn sie geöffnet ist
- der **rechte Bereich**: Eigenschaften des Gewählten
- die **Statusleiste** am unteren Rand

## Anwendungsleiste

Die schmale Leiste ganz oben gehört zur CadCraft-Website, nicht zu CivilCraft selbst.

- Das Versionsmenü zeigt, welchen Build Sie verwenden.
- {{ui:Über CivilCraft}} öffnet die Seite der App auf der Website.
- {{ui:Vollbild}} schaltet die Bildschirmmodi durch: Vollbild, dann Vollbild mit ausgeblendeten Leisten, dann zurück zur Normalansicht. {{key:Ctrl+Shift+F}} tut auf jeder Plattform dasselbe, auch auf dem Mac (dort ist es die Control-Taste, nicht Command). Bei ausgeblendeten Leisten bringen Sie diese zurück, indem Sie den Zeiger an den oberen Rand bewegen.
- {{ui:Hilfe}} (oder {{key:F1}}) öffnet diese Hilfe in einem Seitenbereich; {{key:F1}} oder {{key:Esc}} schließt sie.
- {{ui:Für Offline speichern}} behält CivilCraft in diesem Browser, damit es ohne Verbindung startet; danach zeigt die Schaltfläche {{ui:Offline bereit}}. Siehe [Dateien, die Sie öffnen, speichern und exportieren können](topic:files#online-and-offline).
- {{ui:Papier}} und {{ui:Modell}} wechseln zwischen einem hellen und einem dunklen Design. Lageplan und Längsschnitt folgen dem Design; PDFs werden immer auf Weiß gedruckt.

## Symbolleiste

Jede Gruppe hat über ihren Schaltflächen eine kleine Beschriftung. Bewegen Sie den Zeiger über eine Schaltfläche, um den Tooltip und die Taste zu sehen.

| Gruppe | Schaltflächen | Was sie tun |
|---|---|---|
| Datei | {{ui:Neu}}, {{ui:Öffnen}}, {{ui:Speichern}} | Neu beginnen, eine Punktdatei, LandXML oder ein Projekt öffnen, das Projekt als Download speichern |
| Export | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | LandXML 1.2, eine R12-DXF oder eine DWG des Lageplans schreiben oder den Lageplan als PDF plotten |
| Geländemodell | {{ui:Bruchkante}}, {{ui:Grenze}} | Eine Bruchkante durch Vermessungspunkte zeichnen; die äußere Grenze zeichnen |
| Planung | {{ui:Trasse}}, {{ui:Plateau}}, {{ui:Rohre}}, {{ui:Längsschnitt}} | Eine Trasse, ein Plateau, einen Rohrstrang zeichnen; die Längsschnittansicht zeigen oder ausblenden |
| Bearbeiten | {{ui:Rückgängig}}, {{ui:Wiederholen}}, {{ui:Kopieren}}, {{ui:Einfügen}}, {{ui:Mehr}} | Vermessungspunkte rückgängig machen, wiederholen, kopieren und einfügen; {{ui:Mehr}} enthält Ausschneiden, An gleicher Position einfügen, Duplizieren, Löschen, Alle Punkte auswählen und Auswahl aufheben |
| GIS | {{ui:Koordinaten}}, {{ui:Importieren}}, {{ui:Exportieren}}, {{ui:Karte}} | Das Koordinatensystem festlegen, GIS-Dateien importieren und exportieren, Kartenlayer unter dem Lageplan zeigen |
| Ansicht | {{ui:Wählen}}, {{ui:Einpassen}}, {{ui:3D}} | Dinge wählen und verschieben; zoomen, bis alles sichtbar ist; das Grundstück in 3D zeigen ([Das Grundstück in 3D ansehen](topic:site-3d)) |

Ein Zeichenwerkzeug bleibt gedrückt, solange es aktiv ist. Ein erneuter Klick darauf, {{key:Esc}} oder {{key:V}} führt zurück zu {{ui:Wählen}}. {{ui:Rückgängig}}, {{ui:Wiederholen}}, {{ui:Kopieren}} und die Einträge unter {{ui:Mehr}} sind ausgegraut, wenn sie nicht wirken können; der Tooltip nennt den Grund (zum Beispiel „Select survey points first“). Jede Schaltfläche steht in der [Referenz der Symbolleiste](topic:toolbar).

In einem schmalen Fenster lässt sich die Symbolleiste seitlich scrollen.

## Linker Bereich

### Grundstück

- **Name**: der Projektname. Er benennt jede Datei, die Sie speichern oder exportieren, und steht im Titelstreifen des PDFs.
- **Einheiten**: {{ui:US Feet}} oder {{ui:Meter}}. Das legt fest, was die Zahlen bedeuten. Eine Änderung rechnet Koordinaten **nicht** um; siehe [Einheiten, Stationen und Zahlenformate](topic:units-and-stations).

### Punkte

Leer sagt der Bereich, wie Sie eine Punktdatei öffnen. Mit Punkten zeigt er den Dateinamen, die Zahl der Punkte und wie viele eine Höhe haben, dann eine Tabelle der **Punktgruppen**: eine Zeile je erstem Wort der Beschreibung (GRD, FL, TBS …), mit einer Anzahl und einer Auswahl **Geländemodell**:

- {{ui:Punkte}}: Die Punkte fließen ins Geländemodell ein (Standard für jede Gruppe).
- {{ui:Bruchkante}}: Die Punkte der Gruppe werden in der Reihenfolge der Punktnummern zu einer Bruchkante verbunden.
- {{ui:Ausgelassen}}: Die Gruppe berührt das Geländemodell nicht.

### Geländemodell

Angaben zum Bestandsgelände: Punkte, Dreiecke, tiefste und höchste Höhe, mittlere Höhe, 2D- und 3D-Fläche, Bruchkanten und ob eine Grenze vorhanden ist. Unter den Angaben listet ein Kasten alles auf, was der Geländemodell-Aufbau korrigieren musste oder nicht leisten konnte. Danach:

- **Längste Außenkante**: 0 behält jedes äußere Dreieck; eine Zahl schneidet lange, schmale Dreiecke am Rand ab.
- Links, die erscheinen, wenn sie zutreffen: {{ui:Die Grenze entfernen}}, {{ui:Gezeichnete Bruchkanten entfernen}} und, für ein aus LandXML gelesenes Geländemodell, {{ui:Geländemodell aus den Punkten neu erstellen}}.

### Anzeige

- **Geländemodell**: {{ui:Bestandsgelände}} oder {{ui:Geplant (modelliert)}}. Das zweite ist verfügbar, sobald ein Plateau oder Korridor ohne Probleme modelliert.
- **Höhenlinien alle**, **Hauptlinien alle** und **Stufen** (die Zahl der Farbstufen).
- Kontrollkästchen: {{ui:Höhenlinien}}, {{ui:Höhenlinienbeschriftung}}, {{ui:Dreiecke}}, {{ui:Höhenstufen}}, {{ui:Gefällepfeile}}, {{ui:Punkte}}, {{ui:Punktbeschriftung}}, {{ui:Bruchkanten}}, {{ui:Geländemodellrand}}, {{ui:Rohre}}.
- Eine Legende der Stufenhöhen erscheint, wenn die Stufen eingeschaltet sind.

Anzeigeeinstellungen werden mit dem Projekt gespeichert, sind aber keine Rückgängig-Schritte: {{key:Mod+Z}} schaltet nie ein Kontrollkästchen zurück.

## Lageplan

Der Lageplan zeigt die Punkte, das Geländemodell und alles, was Sie planen, in der Draufsicht mit Norden oben. Mit dem Rad zoomen Sie am Zeiger, durch Ziehen im leeren Bereich verschieben Sie die Ansicht. Die vollständige Liste steht unter [Tasten und Maus](topic:keyboard).

- In einem leeren Projekt nennt ein Kasten mit dem Titel **Mit Vermessungspunkten beginnen** die ersten Schritte und bietet {{ui:Das Beispielgrundstück öffnen}} an.
- Solange ein Zeichenwerkzeug aktiv ist, sagt ein Hinweis oben im Lageplan, was Sie anklicken und wie Sie abschließen.
- Zieht man eine Datei über den Lageplan, erscheint „Drop a point file, LandXML or project“.
- Gewähltes wird hervorgehoben. Eine gewählte Trasse oder ein gewähltes Plateau zeigt quadratische Griffe an ihren PIs oder Ecken; ein gewähltes Bauwerk zeigt einen Griff. Ziehen Sie an einem Griff, um ihn zu verschieben.
- Gewählte Vermessungspunkte haben einen Ring. {{key:Shift}} und ein Klick fügt einen Punkt hinzu oder entfernt ihn; {{key:Shift}} und Ziehen zeichnet ein Rechteck (oder, rundherum gezogen, ein Lasso), das die Punkte darin hinzufügt. Siehe [Vermessungspunkte wählen, kopieren und einfügen](topic:copy-paste-points).

## Längsschnittansicht

Drücken Sie {{key:R}} oder klicken Sie auf {{ui:Längsschnitt}}, um sie unter dem Lageplan zu öffnen. Ihre Leiste enthält:

- eine Trassenliste (aktiv, wenn es zwei oder mehr Trassen gibt)
- {{ui:PVIs hinzufügen}}: Solange es gedrückt ist, fügt ein Klick im Längsschnitt einen PVI hinzu ({{key:I}} schaltet es um)
- eine Anzeige von Station, Gelände, Planungshöhe, Gefälle und Abtrag oder Auftrag unter dem Zeiger
- eine Schaltfläche zum Schließen

Der Längsschnitt zeigt das Bestandsgelände, den Längsschnitt der Planung, die Gefälle jeder Tangente, Station und Höhe jedes PVI, L und K jeder Ausrundung mit ihrem BVC und EVC, Hoch- und Tiefpunkte sowie die Überhöhung. Er passt immer die ganze Trasse ein: Er lässt sich weder zoomen noch verschieben. Bewegt man den Zeiger darin, erscheint ein Punkt auf der Trasse im Lageplan.

## Rechter Bereich: Eigenschaften

Seine Überschrift sagt, was er zeigt.

- **Projekt** (nichts gewählt): die Trassen und Plateaus als Links, der Block **Erdarbeiten** und der Block **Rohrnetz** mit seinen Regeln und Problemen.
- **Trasse**: Name, Anfangsstation, Länge, die PI-Tabelle, die Kreisbögen, die PVI-Tabelle des Längsschnitts der Planung samt Angaben und die Einstellungen des **Korridors**.
- **Plateau**: Name, Höhe, Abtrags- und Auftragsböschungen, Fläche, Angaben zum Böschungsschnittpunkt und Erdarbeiten.
- **Bauwerk** oder **Rohr**: Größen, Deckelhöhen, Sohlen, Gefälle, Überdeckung und eventuelle Probleme.
- **Punkt** und seine Nummer: Koordinaten, Höhe, Beschreibung und Gruppe des Punkts (nur lesbar).

Felder werden wirksam, wenn Sie {{key:Enter}} drücken oder das Feld verlassen. Ein nicht akzeptierter Wert wird als ungültig markiert, und nichts ändert sich.

## Statusleiste

- **E** und **N**: Rechtswert und Hochwert unter dem Zeiger.
- **Gelände**höhe dort (und **Modelliert**, wo ein Plateau oder Korridor sie geändert hat), oder „Off the surface“.
- Die nächste Trasse (oder die gewählte) mit der **Sta** und dem Abstand (**L** oder **R**) unter dem Zeiger.
- Rechts Meldungen: was gerade geschehen ist oder warum etwas abgelehnt wurde. Eine Meldung verschwindet nach einigen Sekunden von selbst.

## Dialogfelder

- **Punkte importieren**: öffnet sich bei jeder Punktdatei. Siehe [Vermessungspunkte importieren](topic:import-points).
- **Den Lageplan als PDF plotten**: siehe [Den Lageplan als PDF plotten](topic:plot-pdf).
- **Nicht gespeicherte Änderungen**: fragt nach, bevor {{ui:Neu}} oder das Öffnen eines Projekts oder einer LandXML-Datei nicht gespeicherte Arbeit verwirft. {{ui:Kopie speichern}} lädt das Projekt vorher herunter.

## Kleine Bildschirme

Bis 760 Pixel Breite, etwa auf einem Telefon, behält der Lageplan den Bildschirm: Die Symbolleiste ist eine Zeile, die sich seitlich scrollen lässt, und die Bereiche öffnen sich als Blätter aus einer Leiste am unteren Rand. {{ui:Werkzeuge}} blendet die Symbolleiste aus, und {{ui:Verschieben}} setzt sie an den unteren Rand.
