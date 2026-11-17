---
title: Den Plan als PDF plotten
summary: Alles oder die aktuelle Ansicht als Vektor-PDF auf einem Standardblatt im technischen oder metrischen Maßstab plotten, in Layerfarben oder Schwarz.
keywords: plotten, drucken, PDF, Blatt, Maßstab, Papierformat, Planblatt, veröffentlichen, Schriftfeld, Nordpfeil, Maßstabsleiste
from: 9af396ca
---

{{ui:PDF}} plottet den Plan als Vektor-PDF auf ein Blatt, mit einem Schriftfeld, einem Nordpfeil und einer Maßstabsleiste. Die PDF wird im Browser erstellt und heruntergeladen; sie läuft nicht über den Druckdialog des Browsers.

## Plotten

1. Richten Sie den Plan unter **Anzeige** ein: die angezeigte Oberfläche, den Höhenlinienabstand und welche Dinge eingeschaltet sind. Der Plot folgt diesen Einstellungen.
2. Wenn Sie nur einen Teil des Geländes wollen, zoomen und verschieben Sie den Plan dorthin.
3. Klicken Sie in der Gruppe **Exportieren** auf {{ui:PDF}} oder drücken Sie {{key:Mod+P}}.
   Der Dialog **Den Plan als PDF plotten** öffnet sich.
4. Wählen Sie den **Bereich**: {{ui:Alles}} oder {{ui:Was auf dem Bildschirm ist}}.
5. Wählen Sie das **Papier**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 oder A1. Ein Projekt in Fuß beginnt mit Tabloid, ein Projekt in Metern mit A3. Blätter sind immer im Querformat.
6. Wählen Sie den **Maßstab**. Die Liste markiert den größten Maßstab, der passt, mit „(passt)“, und wählt ihn aus.
   - Fuß: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Meter: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Wählen Sie die **Farbe**: {{ui:Layerfarben}} oder {{ui:Schwarz}}.
8. Lesen Sie die Zeile unter den Auswahlen. Sie nennt die Größe des Bereichs auf dem Papier und die Blattgröße, zum Beispiel „Der Bereich ist 297 × 222 mm groß bei 1" = 40' auf einem Blatt von 432 × 279 mm (Querformat).“
9. Klicken Sie auf {{ui:PDF herunterladen}}.
   Der Browser lädt `<name>.pdf` herunter. Die Statusleiste meldet „<name>.pdf geplottet bei 1" = 40'.“

Ist der Bereich im gewählten Maßstab größer als das Blatt, wird der Plot zentriert und die Ränder werden abgeschnitten. Wählen Sie dann den Maßstab mit „(passt)“ oder ein größeres Blatt.

## Was auf dem Blatt ist

- Der Plan, im Zeichenbereich zentriert, als echte Vektoren: Höhenlinien, Beschriftungen, Trassen mit Stationierung, Korridore, Bauplätze und Böschungsschnittlinien, Rohre, Punkte.
- Linienstärken nach Layer: Trassen, Bauplätze und Rohre schwerer; Dreiecke und Nebenhöhenlinien fein.
- Ein Schriftfeld unten mit dem **Namen** des Projekts, dem Maßstab, einem Hinweis auf den Höhenlinienabstand und welche Oberfläche (bestehend oder geplant) gezeigt wird, rechts das Datum und die Version.
- Ein Nordpfeil oben rechts (Plan-Nord zeigt nach oben) und eine Maßstabsleiste im Schriftfeld.
- Die Kartenebenen unter dem Plan (ein Bild, Kachelkarten oder ein Kartendienst), wenn **Kartenebenen unter dem Plan** angehakt ist: Sie werden als ein Bild des gesamten Zeichenbereichs mit 150 dpi unter den Linien gezeichnet, und der Quellenhinweis einer Karte steht im Schriftfeld. CivilCraft wartet bis zu 8 Sekunden auf Kartenbilder, die noch eintreffen; fehlen noch welche, meldet die Statusleiste das.

Text verwendet die eingebaute Helvetica der PDF. Zeichen außerhalb des westeuropäischen Zeichensatzes (Windows-1252) werden als „?“ gedruckt, und die Statusmeldung zählt sie.

## Was nicht geplottet wird

- Höhenbänder.
- Die Profilansicht. Das Plotten von Profilen ist noch nicht verfügbar.
- Mehr als ein Blatt (für eine Trasse verwenden Sie [Lageplan- und Längsschnittblätter](topic:plan-profile-sheets)), Ansichtsfenster, ein eigenes Schriftfeld oder Hochformat-Blätter.

:::note
Der Dialog sagt, dass Gefällepfeile nur auf dem Bildschirm erscheinen. In dieser Version werden Gefällepfeile, die unter **Anzeige** eingeschaltet sind, geplottet (und nach DXF exportiert). Schalten Sie sie vor dem Plotten aus, wenn Sie das nicht wünschen.
:::

## Auf Papier drucken

Öffnen Sie die heruntergeladene PDF in einem beliebigen PDF-Betrachter und drucken Sie sie mit 100 % (Originalgröße), damit der Maßstab stimmt. „An Seite anpassen“ ändert den Maßstab.
