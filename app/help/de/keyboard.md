---
title: Tasten und Maus
summary: Jeder Tastaturkürzel sowie jede Maus-, Trackpad- und Touch-Aktion in CivilCraft, gruppiert, mit den Unterschieden je nach Browser und Plattform.
keywords: Tastatur, Tastenkürzel, Shortcuts, Hotkeys, Tasten, Maus, Trackpad, Touch, Pan, Zoom, Pinch, Mausrad, Rechtsklick, Mac, Befehlstaste
from: a9756f46
---

Einzelbuchstaben-Tasten funktionieren, wenn Sie nicht in einem Feld tippen. Tastenkürzel mit {{key:Mod}} verwenden auf dem Mac die Cmd-Taste, sonst Ctrl. Siehe auch [Tasten im Browser](common:keys).

## Dateien und Bearbeiten

| Taste | Aktion |
|---|---|
| {{key:Mod+O}} | Eine Punktdatei, LandXML oder ein Projekt öffnen |
| {{key:Mod+S}} | Das Projekt speichern (lädt eine `.civilcraft.json`-Datei herunter) |
| {{key:Mod+P}} | Den Plan als PDF plotten (öffnet den Plot-Dialog, nicht den Druck des Browsers) |
| {{key:Mod+Z}} | Rückgängig |
| {{key:Mod+Y}} | Wiederholen |
| {{key:Delete}} | Die ausgewählten Vermessungspunkte, die Trasse, das Plateau, das Bauwerk, das Rohr oder den PVI löschen |
| {{key:Mod+C}} | Die ausgewählten Vermessungspunkte kopieren (auch als Punktzeilen für eine Tabellenkalkulation) |
| {{key:Mod+X}} | Die ausgewählten Vermessungspunkte ausschneiden |
| {{key:Mod+V}} | Punkte einfügen: Sie folgen dem Zeiger; klicken Sie, wo sie hinkommen |
| {{key:Mod+Shift+V}} | An gleicher Position einfügen: an den eigenen Koordinaten der Punkte |
| {{key:Mod+D}} | Die ausgewählten Punkte duplizieren: eine Kopie folgt dem Zeiger |
| {{key:Mod+A}} | Alle Vermessungspunkte auswählen |
| {{key:Esc}} | Auswahl aufheben (und ein Einfügen abbrechen) |

{{key:Mod+S}}, {{key:Mod+O}} und {{key:Mod+P}} funktionieren auch, während Sie in einem Feld tippen. {{key:Mod+Z}} und {{key:Mod+Y}} machen in einem Textfeld stattdessen Ihre Eingabe rückgängig oder wiederholen sie, wie üblich, und ebenso {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} und {{key:Mod+A}}: In einem Feld kopieren, ausschneiden, einfügen und wählen sie seinen Text. Ist auf der Seite (in einem Bereich) Text markiert, kopiert {{key:Mod+C}} diesen Text. {{key:Mod+Shift+Z}} tut in CivilCraft nichts: Verwenden Sie {{key:Mod+Y}} oder die Schaltfläche {{ui:Redo}}.

:::mac
Die Mac-Taste mit der Beschriftung **delete** ist für den Browser {{key:Backspace}}. Zum Löschen einer Auswahl drücken Sie {{key:Delete}} (Fn und delete) oder wählen {{ui:Delete}} in der Symbolleiste im Menü {{ui:More}}.
:::

## Werkzeuge

| Taste | Werkzeug |
|---|---|
| {{key:V}} | {{ui:Select}} |
| {{key:M}} | {{ui:Measure}}: Strecken, Flächen und Neigungen im Plan ([Messen](topic:measure)) |
| {{key:A}} | {{ui:Alignment}} |
| {{key:G}} | {{ui:Pad}} |
| {{key:P}} | {{ui:Pipes}} |
| {{key:B}} | {{ui:Breakline}} |
| {{key:O}} | {{ui:Boundary}} |
| {{key:R}} | Profilansicht ein- oder ausblenden |
| {{key:I}} | {{ui:Add PVIs}} ein- oder ausschalten (öffnet die Profilansicht, wenn sie geschlossen ist) |
| {{key:F}} | {{ui:Fit}}: alles anzeigen |
| {{key:D}} | {{ui:3D}}: das Grundstück in 3D anzeigen oder zurück zum Plan |
| {{key:E}} | Gefälle und Höhen entlang jeder Feature-Linie ein- oder ausblenden (nur auf dem Bildschirm) |

Wenn Sie die Taste des aktiven Werkzeugs erneut drücken, kehren Sie zu {{ui:Select}} zurück. Buchstaben mit Shift bewirken nichts.

## Beim Zeichnen

| Taste | Aktion |
|---|---|
| {{key:Enter}} | Die Trasse, das Plateau, den Rohrzug, die Bruchkante oder die Grenze abschließen |
| {{key:Backspace}} | Den zuletzt angeklickten Punkt entfernen |
| {{key:C}} | Feature-Linie: Bögen ein- oder ausschalten (nach einem Eckpunkt klicken Sie einen Punkt auf der Kurve, dann deren Ende) |
| {{key:Esc}} | Das Zeichnen abbrechen (oder das Einfügen); bei erneutem Drücken (oder wenn nichts gezeichnet ist) zurück zu {{ui:Select}} und die Auswahl aufheben |

## Planansicht

| Taste oder Aktion | Ergebnis |
|---|---|
| Mausrad | Zoom hinein oder hinaus am Zeiger |
| Ziehen auf leerer Fläche | Pan (in jedem Werkzeug; ein kurzer Klick klickt weiterhin; mit gehaltener {{key:Shift}}-Taste wird stattdessen ein Auswahlrechteck gezogen) |
| Ziehen mit der mittleren Taste | Pan |
| Ziehen mit der rechten Taste | Pan (kein Menü öffnet sich) |
| {{key:Space}} und Ziehen | Pan |
| Klicken | Wählen (mit {{ui:Select}}) oder einen Punkt setzen (mit einem Zeichenwerkzeug) |
| {{key:Shift}} und Klicken | Einen Vermessungspunkt zur Auswahl hinzufügen oder daraus entfernen |
| {{key:Shift}} und Ziehen | Ein Rechteck ziehen: Die Vermessungspunkte darin werden zur Auswahl hinzugefügt. Ziehen Sie drumherum für ein [Lasso](topic:lasso-selection) |
| {{key:Space}} beim Zeichnen eines Lassos | Fenster, dann Kreuzen, dann Zaun |
| Klicken beim Einfügen | Die eingefügten Punkte dort setzen ({{key:Enter}} setzt sie an ihre eigenen Koordinaten) |
| Einen Griff ziehen | Eine PI, eine Plateau-Ecke oder ein Bauwerk verschieben (ein Rückgängig-Schritt) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Pan, wenn der Plan den Fokus hat (zuerst anklicken) |
| {{key:Plus}} und {{key:Minus}} | Zoom hinein und hinaus in der Mitte, wenn der Plan den Fokus hat |

Die Taste = zoomt wie {{key:Plus}} hinein, Sie brauchen also kein Shift.

## Profilansicht

| Aktion | Ergebnis |
|---|---|
| Klicken mit eingeschaltetem {{ui:Add PVIs}} | Dort einen PVI hinzufügen |
| Einen PVI anklicken | Ihn auswählen |
| Einen PVI ziehen | Ihn verschieben (ein Rückgängig-Schritt) |
| {{key:Delete}} oder {{key:Backspace}} | Den ausgewählten PVI entfernen ({{key:Backspace}} nur, wenn die Profilansicht den Fokus hat) |

Die Profilansicht lässt sich weder zoomen noch verschieben.

## Bildschirm und Hilfe

| Taste | Aktion |
|---|---|
| {{key:F1}} | Diese Hilfe (den Seitenbereich) öffnen oder schließen; {{ui:Help}} in der App-Leiste tut dasselbe |
| {{key:Esc}} | Den Hilfebereich schließen, wenn er geöffnet ist |
| {{key:Ctrl+Shift+F}} | Durch die Bildschirmmodi wechseln: Vollbild, Vollbild mit ausgeblendeten Leisten, normal |
| {{key:Esc}} | Vollbild verlassen (die eigene Taste des Browsers) |

{{key:F1}} erreicht die Hilfe, bevor CivilCraft es sieht, sodass es in jedem Werkzeug funktioniert. Auf den meisten Mac-Tastaturen drücken Sie fn mit F1 oder klicken auf {{ui:Help}}. {{key:Ctrl+Shift+F}} verwendet auf jeder Plattform, auch auf dem Mac, die Control-Taste. Wie Sie in dieser Hilfe suchen, steht unter [Hilfe verwenden](common:help).

## Maus, Trackpad und Touch

:::mouse
- Das Mausrad zoomt am Zeiger. Eine Maus mit frei drehendem Rad zoomt schnell: Drehen Sie es nur kurz an.
- Pan mit jedem Ziehen auf leerer Fläche, der mittleren Taste, der rechten Taste oder {{key:Space}} und Ziehen.
:::

:::mac
Auf einem Mac-Trackpad:

- Zwei-Finger-Scrollen **zoomt** (es verschiebt nicht), und Zusammenziehen zoomt ebenfalls.
- Zum Verschieben drücken Sie mit einem Finger auf leerer Fläche und ziehen, oder halten Sie {{key:Space}} und ziehen.
- Ein Zwei-Finger-Klick (Rechtsklick) öffnet kein Menü und tut für sich nichts.
:::

:::touch
Auf einem Touchscreen:

- Die erste Berührung macht Schaltflächen und Menüzeilen fingergerecht.
- Tippen zum Wählen oder zum Setzen eines Punkts; ein Finger, der auf leerer Fläche gezogen wird, verschiebt den Plan. Ein Tippen kann leicht wackeln: Erst nachdem sich der Finger um etwa 10 Pixel bewegt hat, verschiebt die Ansicht.
- Zwei Finger ziehen zusammen zum Zoomen und bewegen sich gemeinsam zum Verschieben.
- Einen Griff oder PVI ziehen Sie mit einem Finger. Griffe nehmen eine Fingerbreite um sich herum ein.
- Während Sie eine Trasse, ein Plateau, eine Bruchkante, eine Grenze, einen Rohrzug, eine Feature-Linie oder eine Parzelle zeichnen, bietet eine Leiste über dem Plan {{ui:Finish}} ({{key:Enter}}), {{ui:Undo point}} ({{key:Backspace}}) und {{ui:Cancel}} ({{key:Esc}}). Ein langes Drücken (eine halbe Sekunde ohne Bewegung) schließt ebenfalls ab.
- Im Werkzeug {{ui:Select}} fügt ein langes Drücken auf einem Vermessungspunkt ihn zur Auswahl hinzu oder nimmt ihn heraus, wie es {{key:Shift}}+Klicken tut.
- In der 3D-Ansicht dreht ein Finger die Ansicht, zwei Finger zoomen und verschieben, und ein Tippen wählt aus.
- Bei Touch gibt es kein Überfahren mit dem Zeiger; die Anzeigen der Statusleiste aktualisieren sich daher nur, während ein Finger aufliegt.
:::

## Browsertasten, die gewinnen

Manche Tasten gehören dem Browser und erreichen CivilCraft nie, zum Beispiel {{key:Mod+W}} (Tab schließen), {{key:Mod+T}} (neuer Tab), {{key:Mod+N}} (neues Fenster) und {{key:F11}} (Vollbild in Browsern unter Windows und Linux). CivilCraft verwendet sie nicht. Öffnet ein Kürzel stattdessen etwas im Browser, klicken Sie einmal auf den Plan, damit die Seite den Fokus hat, und versuchen Sie es erneut.

## Wo Verschieben zu finden ist

Es gibt keinen Befehl „Verschieben“: Wählen Sie {{ui:Select}} und ziehen Sie einen Punkt oder Eckpunkt, oder bearbeiten Sie seine Koordinaten unter {{ui:Properties}}. Siehe [Punkte bearbeiten](topic:edit-points).
