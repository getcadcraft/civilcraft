---
title: Studiendateien für ein anderes Freileitungsprogramm (.DON)
summary: Speichern Sie eine Freileitung als .DON-Studiendatei oder lesen Sie die Masten einer solchen Datei in eine neue Leitung ein. Mit dem Programm, das sie liest, nicht getestet.
keywords: don, .don, Studiendatei, xml, exportieren, importieren, Freileitungsprogramm, Seilzug, Kanton
from: 1abc4d07
---

Einige Freileitungsprogramme speichern eine Studie in einer `.DON`-Datei (XML-Text). CivilCraft kann eine Leitung als solche Datei schreiben und die Maste einer solchen Datei lesen.

:::warning
**Nicht getestet.** Wir haben dies aus einer Liste der Feldnamen des Formats erstellt, die ein Nutzer geteilt hat, nicht aus einer echten Datei. Wir haben unsere Dateien auch nicht in dem Programm geöffnet, das sie liest. Öffnen Sie die Datei dort und prüfen Sie jeden Wert, bevor Sie sich darauf verlassen. Wenn Sie eine `.DON`-Datei teilen können (ohne die Angaben des Kunden), hilft uns das, dies richtig umzusetzen.
:::

## Eine Studiendatei speichern

1. Geben Sie der Leitung einen Leiter und stellen Sie sicher, dass sie Ergebnisse hat (kein „nicht berechnet“ in ihren Eigenschaften).
2. {{ui:Mehr}} › {{ui:Studiendatei speichern (.DON)…}}: Wählen Sie die Leitung, fügen Sie eine Beschreibung und eine Auftragsnummer hinzu.
3. {{ui:Studiendatei speichern}}.

Die Datei enthält die Maste der Leitung (Koordinaten, Gelände, Höhen, Rollen, Traverse, der behaltene oder vorgeschlagene Mast, Lasten je Lastfall, Fundament), einen Abschnitt je Strecke zwischen Endmasten (Leiter, Spannung, Regelspannfeld, Felder, Zugkraft und Kettenlinienparameter, die größte Zugkraft je Lastfall) und die Seilzugtabellen. Längen sind in Metern und Kräfte in daN angegeben. Text wird in Latin-1 geschrieben, daher wird ein Zeichen außerhalb davon zu `?`.

## Eine Studiendatei lesen

{{ui:Mehr}} › {{ui:Studiendatei öffnen (.DON)…}} liest die Maste in eine neue Leitung ein. Leiter, Maste und Traversen werden über ihren Namen mit Ihrer Bibliothek abgeglichen. Was nicht gefunden wird, wählen Sie in den Eigenschaften aus.
