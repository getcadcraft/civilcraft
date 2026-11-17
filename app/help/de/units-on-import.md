---
title: Einheiten beim Import: Eine Datei gibt ihre Einheiten an, oder Sie werden zuerst gefragt
summary: Wenn eine Zeichnung oder ein Netz, das Sie in ein Projekt bringen, seine Einheiten angibt, rechnet CivilCraft um und sagt es. Wenn nicht, fragt CivilCraft, bevor es die Datei einliest, und merkt sich Ihre Antwort für diese Datei.
keywords: Einheiten, Import, DWG, DXF, STL, OBJ, Vermessung, Fuß, US-Survey-Fuß, Meter, Millimeter, Maßstab, falsche Größe, zu groß, zu klein, fragen, gemerkt, INSUNITS, Zeichnungseinheiten
from: 60921963
---

## Was Sie tun

Bringen Sie eine Datei in ein Projekt und stellen Sie sicher, dass sie in der richtigen Größe hineinkommt.

## Schritte

1. Öffnen Sie die Datei wie gewohnt: {{ui:Öffnen}}, ziehen Sie sie auf den Plan oder verwenden Sie den CAD-Zeichenbefehl.
2. Gibt die Datei ihre Einheiten an, wird nichts gefragt: Der Importdialog zeigt sie als **Wie in der Zeichnung angegeben**.
3. Wenn nicht, fragt ein Dialog nach **Einheiten von** der Datei, bevor der Importdialog öffnet. Wählen Sie, was eine Einheit in der Datei ist, und klicken Sie auf {{ui:Diese Einheiten verwenden}}.
4. {{ui:Abbrechen}} (oder {{key:Esc}}) überspringt die Datei. Nichts davon wird in das Projekt eingelesen.

## Welche Dateien ihre Einheiten angeben

- **DWG und DXF**: die Einfügeeinheiten der Zeichnung (`$INSUNITS`). Bei einer Datei ohne sie wird nachgefragt. Die Liste **Zeichnungseinheiten** im Importdialog beginnt mit Ihrer Antwort und kann noch geändert werden.
- **STL und OBJ** (Geländeformen in freier Form): geben nie Einheiten an. Sie werden gefragt.
- **Punktlisten** (CSV, TXT) und Vermessungslisten: Eine Liste, die ihre Einheit in den ersten Zeilen angibt, wird umgerechnet, und die Statuszeile sagt es. Bei einer Liste ohne Angabe wird beim Drücken von {{ui:Importieren}} nachgefragt, bevor die Punkte hineinkommen. Spalten für Breiten- und Längengrad laufen stattdessen über das Koordinatensystem.
- **Das Add-on Punktwolken**: fragt, wenn Sie eine Wolke aus einer Datei ohne Einheitenangabe erstellen, und beschriftet die Zahlen der Wolke in der Einheit, die sie mitführt.
- **IFC und LandXML**: geben ihre Einheiten an; sie werden in die Projekteinheiten umgerechnet.
- **LAS, LAZ und Höhenraster**: werden nach ihrem Koordinatensystem platziert; der Geländedialog fragt nach der Höheneinheit, wenn die Datei sie nicht angibt.

## Gut zu wissen

- Die Antwort wird für diese Datei auf diesem Computer gemerkt, in jeder CadCraft-App. Beim nächsten Import werden Sie nicht gefragt.
- Um erneut gefragt zu werden: die Befehlspalette ({{key:Mod+K}}) › **Einheiten importierter Dateien erneut abfragen**.
- Die Einheit, die eine Liste angibt, wird aus ihren ersten acht Zeilen gelesen: eine Zeile wie `units: ft` oder Spaltenüberschriften, die alle dieselbe Einheit in Klammern tragen, etwa `Elevation (m)`.
