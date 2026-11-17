---
title: Dateien öffnen, speichern und exportieren
summary: Punktdateien, LandXML und CivilCraft-Projekte einlesen; Projekte, LandXML, DXF und PDF ausgeben; was jede Datei enthält, wohin die Dateien gehen und was sich offline ändert.
keywords: öffnen, speichern, exportieren, importieren, Dateiformate, csv, txt, landxml, xml, dxf, pdf, json, herunterladen, Projektdatei
from: 82bff559
---

CivilCraft öffnet Dateien von Ihrem Computer und speichert, indem Dateien zurück auf den Computer heruntergeladen werden. Nichts wird hochgeladen, und nichts wird auf einem Server gespeichert. Siehe auch [Ihre Dateien](common:your-files).

## Was geöffnet werden kann

Klicken Sie auf {{ui:Öffnen}} (oder drücken Sie {{key:Mod+O}}) und wählen Sie eine Datei, oder ziehen Sie die Datei aus {{pick:mac=Finder|windows=Datei-Explorer|linux=Ihrem Dateimanager}} auf den Plan. Jeweils eine Datei; Dateien über 200 MB werden abgelehnt. Eine LandXML- oder Projektdatei über 32 MB wird in Teilen von etwa 4 MB gelesen, niemals als ein einziger Textblock. Während eine LandXML-Datei geöffnet wird, rechnen Sie damit, dass sie etwa das 13-Fache der Dateigröße im Speicher benötigt (eine 69-MB-Datei benötigte in unserem Test etwa 0.9 GB).

| Art | Dateinamen | Was passiert |
|---|---|---|
| Punktdatei | `.csv`, `.txt`, `.pnt`, `.xyz` (jede Textdatei) | Das Dialogfeld **Punkte importieren** wird geöffnet. Die Punkte ersetzen die Punkte des Projekts; Trassen, Bauplätze und Rohre bleiben erhalten. |
| LandXML | `.xml`, `.landxml` | Aus der Datei wird ein **neues Projekt** erstellt (Sie werden zuerst gefragt, wenn das aktuelle Projekt nicht gespeicherte Änderungen hat). |
| CivilCraft-Projekt | `.civilcraft.json` (jede `.json`) | Das Projekt wird so geöffnet, wie es gespeichert wurde (Sie werden zuerst gefragt, wenn das aktuelle Projekt nicht gespeicherte Änderungen hat). |

CivilCraft entscheidet anhand der Dateiendung, dann anhand der ersten Zeichen: Text, der mit `{` beginnt, wird als Projekt gelesen, Text, der mit `<` beginnt, als LandXML, alles andere als Punktdatei. Eine Datei, die das Öffnen-Dialogfeld ausgraut, kann trotzdem auf den Plan gezogen werden.

:::note
Wenn Sie eine Punktdatei in ein Projekt importieren, das bereits Punkte hat, werden diese ohne Nachfrage ersetzt, und der Rückgängig-Verlauf wird gelöscht (jedes Öffnen einer Datei beginnt den Rückgängig-Verlauf neu). Stammt das Geländemodell aus LandXML, wird es beim Import von Punkten wieder zu einem aus den Punkten erstellten Geländemodell. Speichern Sie zuerst, wenn Sie die alten Punkte womöglich zurückholen möchten.
:::

Details: [Punktdateiformate](topic:point-file-formats), [LandXML: was gelesen und geschrieben wird](topic:landxml-reference).

## Was gespeichert wird

Mit {{ui:Speichern}} ({{key:Mod+S}}) werden zwei Dateien nebeneinander geschrieben, benannt nach **Name** im linken Bereich: `<name>.civilcraft.json`, das Projekt, das Sie weiter bearbeiten, und `<name>.ifc`, derselbe Entwurf als IFC 4.3 für alle anderen (siehe [IFC-Export und -Import](topic:ifc)). Jede Datei verweist auf die andere, und die IFC-Datei enthält außerdem eine komprimierte Kopie des Projekts, damit eine IFC-Datei, die allein weitergegeben wird, weiterhin vollständig bearbeitbar geöffnet werden kann.

- **In Studio** werden beide Dateien nebeneinander direkt am Speicherort geschrieben.
- **In Chrome und Edge** fragt das erste Speichern nach einem Ordner und schreibt beide Dateien dorthin; spätere Speicherungen landen im selben Ordner. Brechen Sie die Ordnerabfrage ab, um stattdessen beide Dateien herunterzuladen.
- **In anderen Browsern** werden beide Dateien heruntergeladen, zuerst die Projektdatei.

Beim Öffnen einer der beiden Dateien wird nach der anderen gesucht. Öffnen Sie beide gemeinsam (oder ziehen Sie beide hinein), oder öffnen Sie nur eine: In Studio wird die andere im selben Ordner gefunden; in einem Browser fragt CivilCraft, ob Sie sie hinzufügen oder mit der vorhandenen weiterarbeiten möchten. Wurde die IFC-Datei von einem anderen Programm geändert, nachdem CivilCraft sie gespeichert hat, oder ist eine Datei älter als die andere, wird das Projekt aus dem neueren Entwurf geöffnet, und der Bereich Problems beschreibt, was passiert ist, mit **Jetzt speichern** (schreibt beide Dateien erneut) und **Geometrie der IFC als Referenz anzeigen**. Eine IFC-Datei allein, die ein anderes Programm geändert hat, wird aus deren Projektkopie geöffnet, mit dem, was noch zusammenpasst: Trassen, die geändert wurden, übernehmen deren Geometrie, entfernte Objekte fallen weg, und die übrigen Änderungen werden aufgelistet, aber nicht übernommen. Eine Projektdatei von vor 0.7.1 öffnet sich wie bisher.

Die Projektdatei enthält:

- jeden Punkt (Nummer, Koordinaten, Höhe, Beschreibung) und den Namen der Punktdatei, aus der sie stammen
- die Einstellungen des Geländemodells: Gruppenauswahl, gezeichnete Bruchkanten, die Begrenzung, die längste äußere Kante und ein aus LandXML gelesenes TIN
- die Anzeigeeinstellungen
- Trassen mit ihren PIs, Radien und Anfangsstation, ihre Entwurfslängsschnitte (PVIs und Kurvenlängen) und die Korridoreinstellungen
- Bauplätze und das Leitungsnetz mit seinen Regeln

Der Rückgängig-Verlauf wird nicht gespeichert. Geländemodelle, Höhenlinien, Böschungsschnittlinien und Volumen werden nicht gespeichert; sie werden beim Öffnen des Projekts aus den gespeicherten Eingaben neu erstellt. Eine Projektdatei aus einer neueren CivilCraft-Version wird mit einer Meldung abgelehnt, die deren Version nennt.

## Was exportiert wird

| Schaltfläche | Datei | Inhalt |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: Punkte, das bestehende Gelände (und das geplante Geländemodell, falls vorhanden) als TIN-Flächen, Trassen, Gelände- und Entwurfslängsschnitte, das Leitungsnetz |
| {{ui:DXF}} | `<name>.dxf` | R12-DXF der Planlinien wie angezeigt, auf benannten Layern |
| {{ui:DWG}} | `<name>.dwg` | Dieselben Linien als DWG-Zeichnung im gewählten Format (2000 bis 2018) |
| {{ui:PDF}} | `<name>.pdf` | Ein Vektor-Plot des Plans auf einem Blatt, in einem von Ihnen gewählten Maßstab |
| {{ui:GLB}} oder {{ui:OBJ}} (in der Leiste der 3D-Ansicht) | `<name>-3d.glb`, `<name>-3d.obj` | Was die 3D-Ansicht als 3D-Modell zeigt: Meter, Y nach oben, wahrer Maßstab, um einen aufgezeichneten lokalen Ursprung |

Was jeweils weggelassen wird: [LandXML-Austausch](topic:landxml), [Plan nach DXF exportieren](topic:dxf-export) (DWG ebenso), [Plan als PDF plotten](topic:plot-pdf), [Gelände in 3D exportieren](topic:export-3d).

## Wo die Dateien gespeichert werden

Gespeicherte und exportierte Dateien landen dort, wo Ihr Browser Downloads ablegt, meist im Ordner Downloads. Um jedes Mal einen Ordner zu wählen:

:::chromium
Öffnen Sie die **Einstellungen** des Browsers, dann **Downloads**, und aktivieren Sie **Vor dem Herunterladen nach dem Speicherort jeder Datei fragen**.
:::

:::firefox
Öffnen Sie **Einstellungen**, dann **Allgemein**, und wählen Sie unter **Dateien und Anwendungen** die Option **Immer nach dem Speicherort fragen**.
:::

:::safari
Öffnen Sie **Safari > Einstellungen > Allgemein** und stellen Sie **Ort für Dateidownloads** auf **Für jeden Download fragen**.
:::

Wenn Sie zweimal mit demselben Namen speichern, hängt der Browser der zweiten Datei womöglich eine Nummer an, zum Beispiel `Site (1).civilcraft.json`. Öffnen Sie beim nächsten Mal die neueste.

## Online und offline

CivilCraft arbeitet in beiden Fällen nur auf Ihrem Computer: Beim Öffnen wird die Datei im Browser gelesen, beim Speichern wird sie heruntergeladen. Um CivilCraft ganz ohne Verbindung zu öffnen, speichern Sie es zuerst für die Offline-Nutzung:

1. Klicken Sie online oben in der App-Leiste auf {{ui:Für Offline speichern}}.
2. Die Schaltfläche zählt hoch („Speichern 12 von 30“) und zeigt danach {{ui:Offline bereit}}. CivilCraft ist klein (etwa 0.6 MB), daher dauert dies einen Moment. Die gespeicherte Kopie enthält diese Hilfe und den Beispielstandort.
3. Ohne Verbindung öffnen Sie dieselbe Adresse (oder ein Lesezeichen dafür). Alles funktioniert, einschließlich {{ui:Beispielstandort öffnen}}.

Die weiteren Zustände der Schaltfläche:

- {{ui:Speichern nicht möglich}}: Einige Dateien wurden nicht heruntergeladen. Prüfen Sie die Verbindung und klicken Sie darauf, um es erneut zu versuchen.
- {{ui:Offline nicht verfügbar}}: Dieses Browserfenster kann keine Offline-Kopie speichern (private Fenster und manche verwalteten Computer blockieren das). Verwenden Sie ein normales Fenster.

Klicken Sie auf {{ui:Offline bereit}}, um zu sehen, wann die Kopie gespeichert wurde, mit zwei Möglichkeiten: {{ui:Erneut speichern (neueste Version holen)}} und {{ui:Offline-Kopie entfernen}}. Speichern Sie erneut vor einem Ortstermin, damit die Kopie zur neuesten Version passt. Mehr unter [Offline](common:offline).

:::offline
Sie sind jetzt offline. Wenn CivilCraft für die Offline-Nutzung gespeichert wurde, funktioniert alles, einschließlich des Beispielstandorts. Wenn nicht, arbeiten Sie in diesem Tab weiter, laden Sie ihn aber erst neu, wenn Sie wieder online sind; ohne gespeicherte Kopie schlägt {{ui:Beispielstandort öffnen}} mit „Das Beispiel konnte nicht geladen werden“ fehl.
:::

:::tip
Für den Feldeinsatz speichern Sie CivilCraft für die Offline-Nutzung und bringen Ihre Punktdateien direkt auf dem Laptop mit. Projekte und Exporte werden ohne Verbindung als Downloads gespeichert, sodass Sie die Messungen eines Tages importieren, das Geländemodell prüfen und das Projekt vor Ort speichern können.
:::

Cloud-Speicherung ist noch nicht umgesetzt, und Desktop-Versionen sind noch nicht verfügbar. Derzeit sind die gespeicherten Dateien die einzige Kopie: Bewahren Sie sie an einem gesicherten Ort auf.

## Add-ons, die eine Datei verwendet

Wenn Sie ein Projekt speichern, das Daten aus einem Add-on enthält (die Häkchen der Bauvorschriften oder eine Quelle „Adresse zum Grundstück“), vermerkt die Datei, welche Add-ons und welche Versionen verwendet werden. Öffnen Sie sie auf einem Computer, dem eines davon fehlt, zeigt eine Leiste über dem Plan dies an und bietet an, es aus der Liste Ihres Kontos hinzuzufügen. Der Vermerk ist nur eine Notiz: Die Datei öffnet sich in jedem Fall.

## Rückgängig aus Studio

Innerhalb von CadCraft Studio wird jeder Schritt, den Sie in CivilCraft abschließen, an Studio gemeldet, sodass dessen projektweites Rückgängig den letzten Schritt über alle Apps hinweg zurücknehmen kann. Studio macht einen Schritt nur dann rückgängig, wenn der eigene Rückgängig-Stapel von CivilCraft genau so ist, wie dieser Schritt ihn hinterlassen hat; nachdem Sie eine andere Datei geöffnet haben, überspringt es dieses Fenster.

## Schließen mit nicht gespeicherten Änderungen

Wenn das Projekt nicht gespeicherte Änderungen hat und Sie den Tab schließen, neu laden oder die Seite verlassen, fragt der Browser, ob Sie die Seite verlassen möchten. Wortlaut und Aussehen gehören dem Browser und können von CivilCraft nicht geändert werden. Stattdessen fragen {{ui:Neu}} sowie das Öffnen einer Projekt- oder LandXML-Datei im eigenen Dialogfeld **Nicht gespeicherte Änderungen** von CivilCraft nach, mit {{ui:Abbrechen}}, {{ui:Nicht speichern}} und {{ui:Kopie speichern}}.
