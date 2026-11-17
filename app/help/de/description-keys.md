---
title: Beschreibungsschlüssel und Liniencodes
summary: Feldcodes mit Beschreibungen in Punktgruppen umwandeln und codierte Punkte zu Linien verbinden (Anfang, Ende, schließen), die zu Bruchkanten werden.
keywords: Beschreibungsschlüssel, Feldcodes, Liniencodes, Linienzüge, Anfang, Ende, schließen, Punktgruppen, Codes, Vermessungscodes, Datensammler, Bruchkanten, Bordstein, Fahrbahnkante
from: b3d1af8d
---

Vermessungsteams codieren jede Messung im Feld: `EP` für Fahrbahnkante, `TC` für Bordsteinoberkante, `BLDG` für eine Gebäudeecke. Der Code ist das erste Wort der Beschreibung des Punkts. CivilCraft gruppiert Punkte danach und macht aus den Liniencodes danach Linien.

## Liniencodes

Ein Liniencode ist das Wort direkt nach dem Feldcode:

| Beschreibung | Bedeutung |
|---|---|
| `EP B` | Eine neue Fahrbahnkantenlinie an diesem Punkt beginnen |
| `EP` | Die aktuelle EP-Linie fortsetzen |
| `EP E` | Die aktuelle EP-Linie an diesem Punkt beenden |
| `BLDG C` | Das Gebäude schließen: diesen Punkt mit dem ersten Punkt der Linie verbinden |

Punkte mit demselben Code werden in der Reihenfolge ihrer Punktnummern verbunden. Verschiedene Codes sind verschiedene Linien, auch wenn sie dieselbe Gruppe teilen, sodass `EP1` und `EP2` gleichzeitig zwei Kanten ergeben. Ein Code, der nie einen Liniencode verwendet, wird wie in früheren Versionen über alle seine Punkte verbunden.

Linien in einer Gruppe, die als **Bruchkante** verwendet wird, werden zu Bruchkanten, eine pro Linie. So wird ein Bordstein mit Lücke nicht über die Lücke gezogen. Linien in anderen Gruppen werden im Plan gezeichnet (Layer V-NODE-LINE) und in DXF, DWG und PDF ausgegeben.

Die Wörter für Anfang, Ende und schließen sind `B`, `BEG`, `START`; `E`, `END`; und `C`, `CLO`, `CLOSE`. Ändern Sie sie oder schalten Sie Liniencodes im Dialog unten aus.

## Beschreibungsschlüssel

Ein Beschreibungsschlüssel macht aus einem Code eine Punktgruppe, eine Verwendung und eine lange Beschreibung.

1. Klicken Sie unter **Punkte** auf {{ui:Beschreibungsschlüssel und Liniencodes}}.
2. Klicken Sie auf {{ui:Schlüssel hinzufügen}} und füllen Sie die Zeile aus:
   - **Code**: der Feldcode, der passen soll. `*` steht für beliebig viele Zeichen und `?` für eines, sodass `EP*` EP, EP1 und EP12 erfasst.
   - **Gruppe**: die Punktgruppe, der diese Punkte beitreten (leer = der Code selbst). `EP*` mit der Gruppe `EP` legt EP1 und EP2 in eine Gruppe, während sie getrennte Linien bleiben.
   - **Verwendung**: Punkte, Bruchkante oder Weglassen, für den Fall, dass die Gruppe zum ersten Mal erscheint (oder überlassen Sie es der Tabelle **Punkte**).
   - **Beschreibung**: der lange Name, der in den **Eigenschaften** eines Punkts angezeigt wird.
3. Die Spalte **Punkte** zählt die Punkte, die jeder Schlüssel beim Tippen erfasst. Der erste Schlüssel, der zu einem Code passt, gewinnt.
4. Klicken Sie auf {{ui:Übernehmen}}. Die Gruppen, das Geländemodell und der Plan folgen in einem Schritt: {{key:Mod+Z}} macht es rückgängig.

Eine Gruppe behält die Verwendung, die Sie ihr in der Tabelle **Punkte** gegeben haben. Die Verwendung eines Schlüssels legt sie nur für eine neue Gruppe fest. Die Schlüssel und Liniencodes werden in der Projektdatei gespeichert.
