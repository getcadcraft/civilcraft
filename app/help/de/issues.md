---
title: Themen und BCF
summary: Heften Sie ein Problem an den Plan, eine Trassenstation, einen Geländepunkt oder ein Rohr, geben Sie ihm einen Status und Kommentare und tauschen Sie die Themen als BCF-2.1-Dateien neben der LandXML-Datei aus.
keywords: Thema, Themen, bcf, Kommentar, Markierung, Mangel, Defekt, Baufeld, anheften, Status, offen, gelöst, geschlossen, bim collaboration format, landxml, Probleme
from: e44153b1
---

Ein Thema ist eine Notiz, die an eine Stelle in Ihrer CivilCraft-Zeichnung angeheftet wird, mit einem Titel, einem Status und Kommentaren. Verwenden Sie es, um Mitarbeitern auf der Baustelle oder einem anderen Programm mitzuteilen, was sie prüfen sollen, und um deren Antworten zu lesen.

## Thema hinzufügen

1. Öffnen Sie **Geländemodell, Mehr, Themen (BCF)...**
2. Geben Sie einen Titel ein und beschreiben Sie, was falsch ist.
3. Wählen Sie, wo das Thema angeheftet werden soll: die Mitte der Planansicht, den Geländemodellpunkt in der Mitte, eine Station der ausgewählten Trasse (geben Sie die Station und einen Versatz ein; rechts ist positiv) oder das ausgewählte Rohr, Bauwerk oder die ausgewählte Feature-Linie.
4. Drücken Sie **Thema hinzufügen**. Die Markierung wird im Plan als kleine Raute mit ihrer Nummer angezeigt.

Klicken Sie auf den Titel eines Themas, um darauf zu zoomen, ändern Sie seinen Status in der Liste (Offen, Aktiv, Gelöst, Geschlossen) und fügen Sie Kommentare hinzu. Jede Änderung ist ein Schritt für Rückgängig, und Themen werden in der Projektdatei gespeichert.

## Als BCF austauschen

- **BCF exportieren** schreibt eine BCF-2.1-Datei mit je einem BCF-Thema pro Thema: Titel, Status, Kommentare und eine Ansicht mit einer orthogonalen Kamera der Planansicht und der Markierung.
- **BCF importieren** liest eine BCF-Datei (2.0- und 3.0-Dateien werden gelesen, soweit sie zu 2.1 passen). Ein BCF-Thema mit einer GUID, die Sie bereits haben, aktualisiert dieses Thema (Status, neue Kommentare), statt ein zweites hinzuzufügen.
- **Aus Problemen** erstellt ein Thema aus jedem offenen Eintrag im Bereich „Probleme“, der angibt, wo er liegt.

BCF enthält Meter in den eigenen Koordinaten dieses Projekts, ohne Verschiebung. Das andere Programm muss im selben Koordinatensystem wie Ihre LandXML-Datei liegen, damit die Markierungen an der richtigen Stelle erscheinen. Das Element, auf das eine Markierung zeigt (Trasse, Station, Versatz, Rohr), wird als Labels übertragen, die mit "cc:" beginnen; CivilCraft liest sie wieder ein.

## Was nicht geprüft wurde

Die Markierungen und Ansichten wurden nur getestet, indem eine Datei geschrieben und in CivilCraft wieder gelesen wurde. Noch kein anderes BIM-Programm hat sie geöffnet, und ob eine BCF-Angabe „view to world scale“ die volle oder halbe Höhe der Ansicht meint, unterscheidet sich zwischen den Programmen: CivilCraft schreibt die volle Höhe.
