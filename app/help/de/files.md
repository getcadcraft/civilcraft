---
title: Dateien, die Sie öffnen, speichern und exportieren können
summary: Punktdateien, LandXML und CivilCraft-Projekte einlesen; Projekte, LandXML, DXF und PDF ausgeben; was jeweils gespeichert wird, wohin die Dateien gehen und was sich offline ändert.
keywords: öffnen, speichern, exportieren, importieren, Dateiformate, csv, txt, landxml, xml, dxf, pdf, json, herunterladen, Projektdatei
from: a7debb61
---

CivilCraft öffnet Dateien von Ihrem Computer und speichert, indem Dateien auf Ihren Computer heruntergeladen werden. Nichts wird hochgeladen, und nichts wird auf einem Server gespeichert. Siehe auch [Ihre Dateien](common:your-files).

## Was sich öffnen lässt

Klicken Sie auf {{ui:Öffnen}} (oder drücken Sie {{key:Mod+O}}) und wählen Sie eine Datei, oder ziehen Sie die Datei aus {{pick:mac=Finder|windows=Datei-Explorer|linux=Ihrem Dateimanager}} auf den Plan. Jeweils eine Datei; Dateien über 200 MB werden abgelehnt.

| Art | Dateinamen | Was passiert |
|---|---|---|
| Punktdatei | `.csv`, `.txt`, `.pnt`, `.xyz` (jede Textdatei) | Das Dialogfeld **Punkte importieren** öffnet sich. Die Punkte ersetzen die Punkte des Projekts; Trassen, Bauplätze und Rohre bleiben erhalten. |
| LandXML | `.xml`, `.landxml` | Aus der Datei wird ein **neues Projekt** erstellt (Sie werden zuerst gefragt, wenn das aktuelle Projekt nicht gespeicherte Änderungen hat). |
| CivilCraft-Projekt | `.civilcraft.json` (jede `.json`) | Das Projekt öffnet sich so, wie es gespeichert wurde (Sie werden zuerst gefragt, wenn das aktuelle Projekt nicht gespeicherte Änderungen hat). |

CivilCraft entscheidet anhand der Dateiendung und danach anhand der ersten Zeichen: Text, der mit `{` beginnt, wird als Projekt gelesen, Text, der mit `<` beginnt, als LandXML, alles andere als Punktdatei. Eine Datei, die das Öffnen-Dialogfeld ausgraut, kann trotzdem auf den Plan gezogen werden.

:::note
Das Importieren einer Punktdatei in ein Projekt, das bereits Punkte hat, ersetzt sie ohne Nachfrage und löscht den Rückgängig-Verlauf (jedes Öffnen einer Datei beginnt den Verlauf neu). Stammt das Geländemodell aus LandXML, wird es beim Importieren von Punkten wieder in ein aus den Punkten erstelltes Geländemodell umgewandelt. Speichern Sie vorher, wenn Sie die alten Punkte eventuell zurückholen möchten.
:::

Details: [Punktdateiformate](topic:point-file-formats), [LandXML: was gelesen und geschrieben wird](topic:landxml-reference).

## Was gespeichert wird

{{ui:Speichern}} ({{key:Mod+S}}) schreibt zwei Dateien nebeneinander, benannt nach **Name** im linken Bereich: `<name>.civilcraft.json`, das Projekt, das Sie weiter bearbeiten, und `<name>.ifc`, denselben Entwurf als IFC 4.3 für alle anderen (siehe [IFC-Export und -Import](topic:ifc)). Jede Datei verweist auf die andere, und die IFC-Datei enthält zusätzlich eine komprimierte Kopie des Projekts, sodass eine IFC-Datei allein weiterhin vollständig bearbeitbar geöffnet werden kann.

- **In Studio** werden beide Dateien direkt am Speicherort nebeneinander geschrieben.
- **In Chrome und Edge** fragt das erste Speichern nach einem Ordner und schreibt beide Dateien dorthin; spätere Speicherungen gehen in denselben Ordner. Brechen Sie die Ordnerabfrage ab, um stattdessen beide Dateien herunterzuladen.
- **In anderen Browsern** werden beide Dateien heruntergeladen, zuerst die Projektdatei.

Beim Öffnen einer der beiden Dateien wird nach der anderen gesucht. Öffnen Sie beide zusammen (oder ziehen Sie beide hinein) oder nur eine: In Studio wird die andere im selben Ordner gefunden; in einem Browser fragt CivilCraft, ob Sie sie hinzufügen möchten, oder ob Sie mit der vorhandenen Datei weitermachen wollen. Wurde die IFC-Datei nach dem Speichern durch CivilCraft von einem anderen Programm geändert oder ist eine der Dateien älter als die andere, wird das Projekt aus dem neueren Entwurf geöffnet, und der Bereich **Probleme** beschreibt, was passiert ist, mit **Jetzt speichern** (schreibt beide Dateien erneut) und **IFC-Geometrie als Referenz anzeigen**. Eine IFC-Datei allein, die ein anderes Programm geändert hat, wird aus deren Projektkopie geöffnet, mit dem, was noch passt: Trassen, die es geändert hat, übernehmen seine Geometrie; entfernte Objekte bleiben weg; der Rest der Änderungen wird aufgelistet, nicht übernommen. Eine Projektdatei von vor 0.7.1 öffnet sich wie bisher.

Die Projektdatei behält:

- jeden Punkt (Nummer, Koordinaten, Höhe, Beschreibung) und den Namen der Punktdatei, aus der er stammt
- die Einstellungen des Geländemodells: Gruppenauswahl, gezeichnete Bruchkanten, die Begrenzung, die längste Außenkante und ein aus LandXML gelesenes TIN
- die Anzeigeeinstellungen
- Trassen mit ihren PIs, Radien und Anfangsstation, ihre Entwurfsprofile (PVIs und Kurvenlängen) und die Korridoreinstellungen
- Bauplätze und das Leitungsnetz mit seinen Regeln

Der Rückgängig-Verlauf wird nicht gespeichert. Geländemodelle, Höhenlinien, Böschungsschnittlinien und Volumen werden nicht gespeichert; sie werden beim Öffnen des Projekts aus den gespeicherten Eingaben neu erstellt. Eine Projektdatei aus einer neueren CivilCraft-Version wird mit einer Meldung abgelehnt, die deren Version nennt.

## Was exportiert wird

| Schaltfläche | Datei | Inhalt |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: Punkte, das Bestandsgelände (und das Planungsgelände, falls vorhanden) als TIN-Flächen, Trassen, Gelände- und Entwurfsprofile, das Leitungsnetz |
| {{ui:DXF}} | `<name>.dxf` | R12-DXF der Planlinien so, wie sie angezeigt werden, auf benannten Layern |
| {{ui:DWG}} | `<name>.dwg` | Dieselben Linien als DWG-Zeichnung im gewählten Format (2000 bis 2018) |
| {{ui:PDF}} | `<name>.pdf` | Ein Vektorplot des Plans auf einem Blatt, im gewählten Maßstab |
| {{ui:GLB}} oder {{ui:OBJ}} (in der Leiste der 3D-Ansicht) | `<name>-3d.glb`, `<name>-3d.obj` | Was die 3D-Ansicht als 3D-Modell zeigt: Meter, Y nach oben, wahrer Maßstab, um einen gespeicherten lokalen Ursprung |

Was jeweils weggelassen wird: [LandXML-Austausch](topic:landxml), [Plan nach DXF exportieren](topic:dxf-export) (DWG ebenso), [Plan nach PDF plotten](topic:plot-pdf), [Grundstück in 3D exportieren](topic:export-3d).

## Wohin die Dateien gehen

Gespeicherte und exportierte Dateien landen dort, wo Ihr Browser Downloads ablegt, meist im Ordner Downloads. Um jedes Mal einen Ordner zu wählen:

:::chromium
Öffnen Sie die **Einstellungen** des Browsers, dann **Downloads**, und aktivieren Sie **Vor dem Herunterladen jeder Datei nach dem Speicherort fragen**.
:::

:::firefox
Öffnen Sie **Einstellungen**, dann **Allgemein**, und wählen Sie unter **Dateien und Anwendungen** die Option **Immer nachfragen, wo Dateien gespeichert werden sollen**.
:::

:::safari
Öffnen Sie **Safari > Einstellungen > Allgemein** und stellen Sie **Speicherort für Dateidownloads** auf **Bei jedem Download fragen**.
:::

Wenn Sie zweimal mit demselben Namen speichern, fügt der Browser der zweiten Datei eventuell eine Nummer hinzu, zum Beispiel `Site (1).civilcraft.json`. Öffnen Sie beim nächsten Mal die neueste.

## Online und offline

CivilCraft arbeitet in jedem Fall nur auf Ihrem Computer: Beim Öffnen wird die Datei im Browser gelesen, beim Speichern wird sie heruntergeladen. Um CivilCraft ganz ohne Verbindung zu öffnen, speichern Sie es zuerst für die Offline-Nutzung:

1. Klicken Sie bei bestehender Verbindung oben in der App-Leiste auf {{ui:Für Offline speichern}}.
2. Die Schaltfläche zählt hoch („Speichern 12 von 30“) und zeigt dann {{ui:Offline bereit}} an. CivilCraft ist klein (etwa 0.6 MB), daher dauert das einen Moment. Die gespeicherte Kopie enthält diese Hilfe und das Beispielgrundstück.
3. Öffnen Sie ohne Verbindung dieselbe Adresse (oder ein Lesezeichen dafür). Alles funktioniert, auch {{ui:Das Beispielgrundstück öffnen}}.

Die anderen Zustände der Schaltfläche:

- {{ui:Speichern nicht möglich}}: Einige Dateien wurden nicht heruntergeladen. Prüfen Sie die Verbindung und klicken Sie erneut darauf, um es noch einmal zu versuchen.
- {{ui:Offline nicht verfügbar}}: Dieses Browserfenster kann keine Offline-Kopie behalten (private Fenster und manche verwalteten Computer blockieren das). Verwenden Sie ein normales Fenster.

Klicken Sie auf {{ui:Offline bereit}}, um zu sehen, wann die Kopie gespeichert wurde; dort stehen zwei Möglichkeiten zur Wahl: {{ui:Erneut speichern (neueste Version holen)}} und {{ui:Offline-Kopie entfernen}}. Speichern Sie vor einem Vor-Ort-Termin erneut, damit die Kopie dem neuesten Build entspricht. Mehr dazu unter [Offline](common:offline).

:::offline
Sie sind jetzt offline. Wenn CivilCraft für die Offline-Nutzung gespeichert wurde, funktioniert alles, auch das Beispielgrundstück. Falls nicht, arbeiten Sie in diesem Tab weiter, laden Sie ihn aber erst neu, wenn Sie wieder online sind; ohne gespeicherte Kopie schlägt {{ui:Das Beispielgrundstück öffnen}} mit „Das Beispiel konnte nicht geladen werden“ fehl.
:::

:::tip
Für den Einsatz im Feld speichern Sie CivilCraft für die Offline-Nutzung und bringen Ihre Punktdateien direkt auf dem Laptop mit. Projekte und Exporte werden ohne Verbindung als Downloads gespeichert, sodass Sie die Messungen eines Tages importieren, das Geländemodell prüfen und das Projekt vor Ort speichern können.
:::

Cloud-Speicherung ist noch nicht verfügbar, und Desktop-Versionen gibt es noch nicht. Derzeit sind die Dateien, die Sie speichern, die einzige Kopie: Bewahren Sie sie an einem Ort mit Datensicherung auf.

## Add-ons, die eine Datei nutzt

Wenn Sie ein Projekt speichern, das Daten aus einem Add-on enthält (die Häkchen zu den Bauvorschriften oder eine Adresse-zu-Grundstück-Quelle), vermerkt die Datei, welche Add-ons in welcher Version verwendet wurden. Öffnen Sie sie auf einem Computer, auf dem eines fehlt, zeigt eine Leiste über dem Plan dies an und bietet an, es aus der Liste Ihres Kontos hinzuzufügen. Der Vermerk ist nur eine Notiz: Die Datei öffnet sich in jedem Fall.

## Rückgängig machen aus Studio

In CadCraft Studio wird jeder Schritt, den Sie in CivilCraft abschließen, an Studio gemeldet, sodass dessen projektweites Rückgängig den letzten Schritt über alle Apps hinweg zurücknehmen kann. Studio macht einen Schritt nur dann rückgängig, wenn der eigene Rückgängig-Verlauf von CivilCraft genau so aussieht, wie der Schritt ihn hinterlassen hat; nachdem Sie eine andere Datei geöffnet haben, überspringt Studio dieses Fenster.

## Schließen mit nicht gespeicherten Änderungen

Wenn das Projekt nicht gespeicherte Änderungen hat und Sie den Tab schließen, neu laden oder die Seite verlassen, fragt der Browser, ob Sie die Seite verlassen möchten. Wortlaut und Aussehen gehören zum Browser und können von CivilCraft nicht geändert werden. {{ui:Neu}} sowie das Öffnen einer Projekt- oder LandXML-Datei fragen stattdessen im eigenen Feld **Nicht gespeicherte Änderungen** von CivilCraft nach, mit {{ui:Abbrechen}}, {{ui:Nicht speichern}} und {{ui:Kopie speichern}}.
