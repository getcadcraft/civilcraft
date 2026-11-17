---
title: Mit der Attributtabelle eines Layers arbeiten
summary: Jedes Objekt eines GIS-Layers als Tabelle ansehen, sortieren und filtern, Zeilen und Objekte gemeinsam auswählen, Werte korrigieren, Felder hinzufügen, neue Werte berechnen und die Tabelle als CSV speichern.
keywords: attributtabelle, tabelle, felder, spalten, zeilen, sortieren, filtern, ausdruck, auswählen, bearbeiten, feldrechner, berechnen, feld hinzufügen, feld umbenennen, feld entfernen, csv, export, gis, shapefile, geopackage, symbolik
from: fd9d6c11
---

Öffnen Sie die Tabelle eines Layers über sein Menü mit den **drei Punkten** in der Liste der GIS-Layer ({{ui:Attributtabelle…}}), über Geländemodell › Mehr › {{ui:Attributtabelle}} oder durch Eingabe von `ATTRIBUTES`, `ATTTABLE` oder `TABLE`. Die Tabelle öffnet sich neben dem Plan und bleibt offen, während Sie arbeiten. Nur die sichtbaren Zeilen werden gezeichnet, daher öffnet und scrollt sich ein Layer mit Tausenden von Objekten schnell.

## Sortieren, filtern und auswählen

- **Sortieren:** klicken Sie auf eine Spaltenüberschrift. Ein zweiter Klick kehrt sie um, ein dritter stellt die Reihenfolge der Datei wieder her. Leere Werte bleiben immer unten. Sortieren ändert nur, was Sie sehen, nie den Layer.
- **Filtern:** Geben Sie in das Filterfeld etwas ein. Ein Ausdruck wie `AREA > 500 and USE = 'Res'` behält die Zeilen, für die er wahr ist (dieselben Wörter wie im Reiter Auswahl von [GIS-Layer analysieren](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Alles, was kein Ausdruck ist, wie `oak maple`, sucht diese Wörter in jeder Spalte.
- **Zeilen auswählen:** klicken Sie auf eine Zeile. Ctrl+Klick fügt eine hinzu oder entfernt sie, Shift+Klick wählt einen Bereich, und {{ui:Angezeigte Zeilen auswählen}} nimmt alle Zeilen, die den Filter bestehen. Die ausgewählten Objekte werden im Plan gezeichnet, und ein Klick auf ein Objekt im Plan wählt hier seine Zeile.
- Bei ausgewählten Zeilen können Sie auf sie {{ui:Zoom}} anwenden, einen **Layer aus der Auswahl** erstellen und die Gesamtfläche oder -länge in der Statuszeile lesen.

## Werte korrigieren

Doppelklicken Sie auf eine Zelle (oder gehen Sie mit den Pfeiltasten dorthin und drücken Sie Enter), geben Sie den neuen Wert ein und drücken Sie Enter. Esc lässt ihn, wie er war. Ein Wert muss zur Spalte passen: Zahlen als Zahlen, Datum als `YYYY-MM-DD`, Ja/Nein als yes, no, true oder false. Ein Wert, der nicht passt, wird mit einem Satz abgelehnt, und nichts ändert sich. Ein leeres Feld macht den Wert leer. Jede Bearbeitung ist ein Schritt für Rückgängig: {{ui:Rückgängig}} und {{ui:Wiederholen}} stehen unten in der Tabelle, und Ctrl+Z funktioniert im Plan.

## Felder

Unter **Felder** können Sie ein Feld hinzufügen (Text, Zahl, Datum oder Ja/Nein), eines umbenennen oder eines entfernen. Ein neues Feld beginnt leer. Eine Umbenennung wird übernommen: das Beschriftungsfeld und die [Gestaltung nach Attribut](topic:gis-symbology) des Layers wandern zum neuen Namen, und das Entfernen eines Feldes verwirft die Beschriftung und Gestaltung, die es verwendet haben. Jede Aktion ist ein Schritt für Rückgängig, der alles wiederherstellt.

## Feldrechner

Schreibt einen Wert in jede Zeile (oder nur in die ausgewählten Zeilen), aus den anderen Feldern der Zeile, ihrer Geometrie und einigen Funktionen. Wählen Sie ein bestehendes Feld oder **Neues Feld …** und geben Sie ihm einen Namen und einen Typ. Nichts wird als Code ausgeführt: Der Ausdruck wird von einem kleinen Parser mit fester Funktionsliste gelesen.

| Gruppe | Wörter |
|---|---|
| Zahlen | `+ - * /`, Klammern, `abs round(x, digits) floor ceil sqrt pow min max` |
| Text | `upper lower trim len substr(text, from, count) left right replace concat` (Text steht in 'einfachen Anführungszeichen'; ein Feldname mit Leerzeichen steht in "doppelten Anführungszeichen" oder [eckigen Klammern]) |
| Auswahl | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datum | `year month day` eines `YYYY-MM-DD`-Werts |
| Geometrie | `$area $perimeter $length $x $y $vertices`, in den Einheiten des Projekts |

Ein Ergebnis, das im Typ des Feldes nicht gespeichert werden kann (Text in einem Zahlenfeld), bleibt leer und wird in der Meldung gezählt. Division durch null ergibt einen leeren Wert. Zum Beispiel schreibt `round($area / 43560, 2)` Acres aus Quadratfuß.

## Export

{{ui:CSV exportieren}} speichert die Zeilen, die Sie sehen (nach Filter und Sortierung), als UTF-8-CSV-Datei mit den Feldnamen in der ersten Zeile. Ein Text, der mit `=`, `+`, `-` oder `@` beginnt, erhält ein vorangestelltes Apostroph, damit eine Tabellenkalkulation ihn nicht als Formel ausführt. Um den Layer selbst zu speichern, verwenden Sie [GIS-Ist-Daten exportieren](topic:gis-export).

## Grenzen

Die Tabelle zeigt den Layer in einer einzigen Sortierreihenfolge und jeweils mit einem Filter. Zeilen können hier nicht hinzugefügt oder gelöscht werden (erstellen Sie stattdessen einen neuen Layer aus einer Auswahl), die Geometrie wird nicht bearbeitet, und der Typ eines Feldes lässt sich nach dem Erstellen nicht ändern.
