---
title: Fehlerbehebung
summary: Symptome, Ursachen und Lösungen für Probleme in CivilCraft, mit den genauen Meldungen, die die App anzeigt.
keywords: Probleme, Fehler, funktioniert nicht, beheben, Hilfe, Meldungen, Fehlerbehebung, abgelehnt, fehlt, falsch, vertauscht, Höhenlinien fehlen
from: a9f7dedc
---

Meldungen erscheinen in der Statusleiste unten rechts, in Kästen in den linken und rechten Bereichen sowie in den Dialogfeldern. Sie werden hier so zitiert, wie die App sie anzeigt.

## Dateien öffnen

**„Diese Datei ist größer als 200 MB; CivilCraft öffnet so große Dateien noch nicht.“**
Teilen Sie die Punktdatei oder reduzieren Sie die Datenmenge, bevor Sie sie öffnen.

**„site.json konnte nicht geöffnet werden: Dies ist keine CivilCraft-Projektdatei.“**
Die Datei endet auf `.json` oder beginnt mit `{`, ist aber kein CivilCraft-Projekt. Punktdateien dürfen nicht mit `{` beginnen.

**„… konnte nicht geöffnet werden. Diese Projektdatei stammt aus einer neueren CivilCraft-Version (Version 2).“**
Das Projekt wurde mit einer neueren Version gespeichert. Öffnen Sie es dort oder exportieren Sie daraus LandXML.

**„… konnte nicht geöffnet werden. Dies ist XML, aber kein LandXML (das Wurzelelement ist <…>).“**
Die Datei ist eine andere Art von XML. Exportieren Sie LandXML aus dem anderen Programm.

**„… enthält keine Punkte, TIN-Flächen oder Trassen, die CivilCraft lesen kann.“**
Alles in der Datei wird von CivilCraft übersprungen (zum Beispiel nur Rasterflächen oder nur Spiral-Trassen). Der Rest der Meldung sagt, was vorhanden war. Siehe [LandXML: was gelesen und geschrieben wird](topic:landxml-reference).

**„Das Beispiel konnte nicht geladen werden: …“**
{{ui:Beispielstandort öffnen}} liest eine Datei von der CadCraft-Website. Ohne Verbindung funktioniert das nur, wenn CivilCraft für die Offline-Nutzung gespeichert wurde (die Schaltfläche in der App-Leiste zeigt {{ui:Offline bereit}}). Stellen Sie eine Verbindung her, klicken Sie auf {{ui:Für Offline speichern}}, dann funktioniert es ab da offline. Siehe [Offline](common:offline).

**{{ui:Für Offline speichern}} zeigt {{ui:Speichern nicht möglich}}.**
Einige Dateien wurden nicht heruntergeladen. Prüfen Sie die Verbindung und klicken Sie erneut auf die Schaltfläche.

**{{ui:Für Offline speichern}} zeigt {{ui:Offline nicht verfügbar}}.**
Dieses Browserfenster kann keine Offline-Kopie speichern, meist weil es ein privates Fenster ist oder der Computer verwaltet wird. Öffnen Sie CivilCraft in einem normalen Fenster.

**Offline startet die App gar nicht.**
Sie wurde in diesem Browser nicht für die Offline-Nutzung gespeichert, oder der Browser hat ihre Websitedaten gelöscht (Safari tut das bei Websites, die mehrere Wochen nicht besucht wurden). Stellen Sie eine Verbindung her, öffnen Sie CivilCraft und klicken Sie auf {{ui:Für Offline speichern}}.

**Die Offline-Kopie ist eine ältere Version.**
Klicken Sie auf {{ui:Offline bereit}} und dann online auf {{ui:Erneut speichern (neueste Version holen)}}.

**Eine Datei ist im Öffnen-Dialog ausgegraut.**
Das Feld listet nur Punktdateien, LandXML und Projektdateien anhand ihrer Endungen auf. Ziehen Sie die Datei stattdessen auf den Plan oder benennen Sie sie in `.txt` um.

## Punkte importieren

**„Aus dieser Datei konnten keine Punkte gelesen werden.“**
Wählen Sie die Spaltenreihenfolge unter **Spalten** von Hand. Wenn nichts funktioniert, öffnen Sie die Datei in einem Texteditor und prüfen Sie, ob jede Zeile einen Punkt mit Zahlen enthält.

**Die Fläche sieht gespiegelt, gedreht oder zu einer Linie gestreckt aus.**
Hochwert und Rechtswert sind vertauscht. In der Zusammenfassung stand „aus der Spaltenanzahl geschätzt“. Wählen Sie unter **Spalten** PENZD statt PNEZD (oder umgekehrt) oder importieren Sie erneut.

**Punkte weit weg vom Rest, und der Plan ist auf einen Punkt herausgezoomt.**
Eine Zeile hat einen Tippfehler in einer Koordinate, oder die Datei mischt Koordinatensysteme. Suchen Sie den Punkt (klicken Sie darauf, um seine Nummer zu sehen) und korrigieren Sie die Datei.

**Zeilen unter „Rows not read“ aufgelistet.**
Siehe die Tabelle in [Punkte importieren](topic:import-points#rows-that-are-not-read).

**Meine alten Punkte sind weg.**
Das Importieren einer Punktdatei ersetzt alle Punkte und löscht den Rückgängig-Verlauf. Öffnen Sie Ihr gespeichertes Projekt, um sie zurückzuholen.

## Das Geländemodell

**„Geländemodell: noch nicht vorhanden“ mit einem roten Kasten.**
Der Kasten sagt, warum: „Ein Geländemodell braucht mindestens drei Punkte mit Höhen.“, „Die Punkte liegen alle auf einer Linie: keine Dreiecke.“, „Keine Punkte mit Höhen.“, „Die Begrenzung überschneidet die Punkte nicht.“ oder „Innerhalb der Begrenzung sind keine Dreiecke übrig.“ Prüfen Sie die Spaltenreihenfolge, die Punktgruppen (sind sie auf {{ui:Ausgelassen}} gesetzt?) und die Begrenzung.

**Höhenlinien laufen quer über einen Graben oder Rücken.**
Diese Linie ist keine Bruchkante. Setzen Sie ihre Gruppe auf {{ui:Bruchkante}} oder zeichnen Sie sie mit dem Werkzeug {{ui:Bruchkante}}. Siehe [Geländemodell erstellen und verfeinern](topic:build-surface).

**Eine Bruchkantengruppe zeichnet einen Zickzack.**
Die Gruppe enthält mehr als eine Linie, oder ihre Punkte sind nicht entlang der Linie nummeriert. Setzen Sie die Gruppe zurück auf {{ui:Punkte}} und zeichnen Sie jede Linie mit dem Werkzeug {{ui:Bruchkante}}.

**Lange, dünne Dreiecke am Rand.**
Zeichnen Sie eine Begrenzung ({{key:O}}) oder setzen Sie **Längste äußere Kante**.

**Gar keine Höhenlinien, obwohl das Geländemodell erstellt ist.**
Entweder ist {{ui:Höhenlinien}} unter **Anzeige** ausgeschaltet, oder der Abstand ist so klein, dass mehr als 2,000 Höhenlinien entstehen würden. Wählen Sie einen größeren Abstand.

**Bruchkanten oder eine Begrenzung bewirken nichts.**
Das Geländemodell stammt aus LandXML („Geländemodell (aus LandXML)“). Es wird so verwendet, wie es ist. Klicken Sie auf {{ui:Geländemodell aus den Punkten neu erstellen}}, um stattdessen aus den Punkten zu bauen.

**„Es gibt noch kein Geländemodell: Importieren Sie zuerst Punkte.“**
Bruchkante, Begrenzung und Bauplatz brauchen ein bestehendes Geländemodell. Importieren Sie zuerst Punkte.

**„Klicken Sie auf einen Punkt mit Höhe: Eine Bruchkante übernimmt die Höhen der Punkte.“**
Das Werkzeug {{ui:Bruchkante}} wählt nur Punkte aus. Zoomen Sie hinein und klicken Sie auf einen Punkt (ein oranges Quadrat zeigt den Punkt, den es übernimmt).

## Zeichnen

**Mein letzter Punkt verschwand, als ich zum Abschließen doppelklickte.**
In dieser Version beendet ein Doppelklick die Trasse, den Bauplatz, die Bruchkante oder die Begrenzung, verwirft aber den Punkt, auf den Sie doppelgeklickt haben. Klicken Sie den letzten Punkt einmal an und drücken Sie {{key:Enter}}. Wenn es schon passiert ist, verwenden Sie {{key:Mod+Z}} und zeichnen Sie erneut.

**Ich kann eine Zeichnung auf einem Tablet nicht abschließen.**
Zum Abschließen braucht es {{key:Enter}}; eine Schaltfläche auf dem Bildschirm gibt es noch nicht. Schließen Sie eine Tastatur an. Siehe [Maus, Trackpad und Touch](topic:keyboard#mouse-trackpad-and-touch).

**Ziehen zum Setzen eines Punkts verschiebt stattdessen die Ansicht.**
Ein Ziehen um mehr als wenige Pixel verschiebt den Plan in jedem Werkzeug. Klicken Sie, ohne zu bewegen.

**„Eine Trasse braucht mindestens zwei Punkte.“ / „Ein Bauplatz braucht mindestens drei Ecken.“ / „Eine Rohrstrecke braucht mindestens zwei Bauwerke.“**
Sie haben {{key:Enter}} zu früh gedrückt. Die Zeichnung wird verworfen; beginnen Sie neu.

**Tasten wie A oder G tun nichts.**
Ein Textfeld oder eine Liste im Bereich hat noch den Fokus, daher gehen die Buchstaben dorthin. Klicken Sie einmal auf den Plan und drücken Sie dann die Taste. Auf einem Mac ist die Löschtaste für den Browser Backspace: Verwenden Sie Fn und Delete, um eine Auswahl zu löschen.

## Trassen und Längsschnitte

**„Die Kurven an PI 2 und PI 3 überschneiden sich: … Verwenden Sie kleinere Radien.“**
Zwei Kurven brauchen mehr Tangente, als zwischen ihren PIs liegt. Verringern Sie einen oder beide Radien in der PI-Tabelle oder rücken Sie die PIs auseinander.

**„PI 3 knickt direkt zurück; er kann keine Kurve aufnehmen.“**
Die Trasse kehrt an diesem PI in sich zurück. Verschieben oder entfernen Sie den PI.

**„Unter dieser Trasse gibt es kein Gelände, von dem aus sie beginnen kann.“**
Die Trasse liegt außerhalb des Geländemodells. Verschieben Sie sie auf das Geländemodell oder fügen Sie PVIs hinzu, indem Sie bei eingeschaltetem {{ui:PVIs hinzufügen}} klicken.

**„Die Vertikalkurve an PVI 3 (L = …) beginnt, bevor die Kurve oder der PVI davor endet.“ / „… reicht über den nächsten PVI hinaus.“**
Verkürzen Sie die Kurvenlänge oder rücken Sie die PVIs auseinander.

**„Bei … existiert bereits ein PVI.“**
An dieser Station gibt es bereits einen PVI. Klicken Sie an eine andere Stelle oder ziehen Sie den vorhandenen.

**Die Längsschnittansicht ist leer: „Zeichnen Sie eine Trasse, um ihren Längsschnitt zu sehen.“**
Es gibt keine Trasse, oder die ausgewählte hat Fehler.

## Korridore und Bauplätze

**„Der Korridor braucht einen Entwurfslängsschnitt ohne Fehler.“**
Beginnen Sie einen Entwurfslängsschnitt ({{ui:Vom Gelände aus beginnen}}) und beheben Sie alle Kurvenüberschneidungen.

**„… Seitenböschungen laufen vom Geländemodell ab, bevor sie auf das Gelände treffen.“ / „… Böschungslinien laufen vom Geländemodell ab, bevor sie es erreichen …“**
Die Modellierung erreicht den Rand des Geländemodells, bevor sie auf das Gelände trifft. Rücken Sie den Entwurf vom Rand weg oder bringen Sie ihn näher an das Gelände. Ein neuer Bauplatz, der teilweise außerhalb des Geländemodells liegt, beginnt möglicherweise bei Höhe 0: Geben Sie eine echte Höhe ein.

**„Die Böschungsschnittlinien des Korridors kreuzen …“ / „Die Böschungsschnittlinie kreuzt sich selbst …“**
Böschungen von verschiedenen Seiten laufen ineinander: enge Kurven, schmale Bauplätze, tiefe Abträge oder hohe Aufträge. Verwenden Sie einen größeren Radius, einen schmaleren Regelquerschnitt, einen breiteren Bauplatz oder steilere Böschungen.

**„Noch keine Erdmassen: Ein Bauplatz muss ohne Probleme modelliert werden.“**
Beheben Sie die Probleme, die im roten Kasten darüber aufgeführt sind.

**{{ui:Geplant (modelliert)}} ist ausgegraut.**
Noch kein Bauplatz und kein Korridor ist modelliert.

## Rohrleitungen

**„P2 hat noch keine Sohlen.“**
Klicken Sie auf {{ui:Seine Sohlen nach den Regeln festlegen}} oder geben Sie die Sohlen ein.

**„P1: kein Gelände bei S1, von dem aus begonnen werden kann.“**
Das stromaufwärts liegende Bauwerk liegt außerhalb des Geländemodells und hat keinen Deckel. Geben Sie dafür eine Deckelhöhe ein.

**Jede Rohrleitung ist markiert, nachdem ich ein Bauwerk verschoben habe.**
Das Verschieben eines Bauwerks ändert die Sohlen nicht. Klicken Sie auf {{ui:Jede Sohle nach den Regeln festlegen}}.

Alle Netzmeldungen werden in [Ein Freispiegel-Rohrnetz anlegen](topic:pipe-network#read-and-fix-problems) erklärt.

## Speichern und Exportieren

**„Noch nichts zu exportieren.“ / „Noch nichts zu plotten.“**
Das Projekt ist leer. Importieren Sie zuerst Punkte.

**Ich finde die gespeicherte Datei nicht.**
Sie liegt im Download-Ordner des Browsers (meist im Ordner Downloads). Siehe [Dateien öffnen, speichern und exportieren](topic:files#where-the-files-go).

**Der PDF-Maßstab stimmt auf dem Papier nicht.**
Drucken Sie mit 100 % oder in tatsächlicher Größe, nicht mit „An Seite anpassen“.

**Fragezeichen im PDF-Text.**
Namen oder Beschreibungen enthalten Zeichen außerhalb des westeuropäischen Zeichensatzes. Die Statusmeldung zählt sie. Benennen Sie sie mit einfachen Zeichen um.

**Der Plot ist an den Rändern abgeschnitten.**
Der Maßstab ist für das Blatt zu groß. Wählen Sie den Maßstab mit der Markierung „(passt)“, ein größeres Blatt oder {{ui:Was auf dem Bildschirm ist}}.

**{{key:Mod+P}} hat den Druckdialog des Browsers geöffnet.**
Die Seite hatte den Fokus nicht. Schließen Sie den Dialog, klicken Sie auf den Plan und drücken Sie {{key:Mod+P}} erneut, oder klicken Sie auf {{ui:PDF}}.

## Die App selbst

**Der Bildschirm ist leer oder die Symbolleiste tut nichts.**
Verwenden Sie eine aktuelle Version von Chrome, Edge, Firefox oder Safari und laden Sie neu. Siehe [Browser](common:browsers).

**Die App ist bei einer großen Punktdatei langsam.**
Schalten Sie {{ui:Dreiecke}}, {{ui:Punktbeschriftung}} und {{ui:Höhenstufen}} aus und verwenden Sie einen größeren Höhenlinienabstand. Sehr große Geländemodelle brauchen nach jeder Änderung einen Moment zum Neuaufbau.

**Der Browser fragt „Seite verlassen?“**
Das Projekt hat nicht gespeicherte Änderungen. Bleiben Sie, speichern Sie mit {{key:Mod+S}} und verlassen Sie dann die Seite.
