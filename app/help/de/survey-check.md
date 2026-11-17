---
title: Eine Vermessungszeichnung beim Import prüfen
summary: Höhen als Text oder in Blockattributen als Vermessungspunkte einlesen und eine DWG oder DXF auf falsche Einheiten, fehlendes Koordinatensystem, einen weit entfernten Ursprung, flache Höhenlinien, auffällige Höhen und doppelte Punkte prüfen, bevor Sie daraus ein Gelände erstellen.
keywords: Vermessungsprüfung, Importprüfung, Vermessungshöhen, Höhenpunkte, Texthöhen, Höhen als Text, Attribute, Einheiten, Koordinatensystem, weit vom Ursprung, Höhenlinien bei null, Ausreißer, doppelte Punkte, Probleme, Landschaftsarchitekt, Vermessungszeichnung
from: d46acd24
---

Eine Vermessungszeichnung kann richtig aussehen und dennoch für ein Gelände falsch sein: Ihre Einheiten sind möglicherweise geraten, ihre Höhenlinien liegen flach auf der Höhe 0, oder ihre Höhen stehen als Text, der überhaupt keine Geometrie ist. Der Abschnitt **Vermessungshöhen und Prüfung** im Dialogfeld {{ui:Linien}} (siehe [DWG oder DXF als Linien öffnen](topic:open-dwg-dxf)) liest diese Höhen ein und zeigt, was falsch aussieht, bevor etwas hinzugefügt wird.

## Höhen als Text oder in Attributen

Viele Vermessungszeichnungen geben eine Höhenkote als kleinen Text neben einem Kreuz an, etwa `104.37` oder `EL 104.37`, oder als Attribut eines Punktblocks. Das sind keine Linien, daher lässt der Linienleser sie aus. Der Abschnitt zeigt an, wie viele er gefunden hat, und lässt Sie sie als **Vermessungspunkte** übernehmen:

1. Markieren Sie **… Höhen als Vermessungspunkte übernehmen**. Die Markierung ist zunächst nicht gesetzt, weil nicht jede Zahl in einer Zeichnung eine Höhe ist.
2. Text wird eingelesen, wenn er allein eine Höhe darstellt: eine Zahl mit Dezimalteil (`104.37`, `+104,37`, `-3.50`) oder eine Zahl nach `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` oder `LEVEL`, optional gefolgt von `m`, `ft` oder `'`. Eine ganze Zahl allein (`12`) wird als Los- oder Blattnummer gelesen, nicht als Höhe; Text wie `GATE 3` oder ein Datum wird nie gelesen. Textformatierungscodes werden ignoriert.
3. Bei Blockattributen wählen Sie **Blockattribut, das die Höhe enthält**. CivilCraft findet selbst ein Feld namens ELEV, Z, LEVEL, RL oder ähnlich; wählen Sie aus der Liste ein anderes, wenn die Zeichnung ein eigenes verwendet. Die Auswahl wird für diesen Dateinamen auf diesem Computer gespeichert, sodass das erneute Öffnen mit demselben Feld beginnt. Ein von Ihnen gewähltes Feld übernimmt auch ganze Zahlen als Höhen.
4. Klicken Sie auf {{ui:Hinzufügen}}. Die Punkte werden nach dem höchsten Punktnamen im Projekt nummeriert, jeder Punkt wird mit seinem Layer (oder seinem Block) beschrieben, und die Höhen werden wie der Rest der Zeichnung in die Einheiten des Projekts umgerechnet. Alles ist ein Schritt: {{key:Mod+Z}} entfernt die Punkte wieder.

Der Text sitzt an seinem eigenen Einfügepunkt (oder an seinem Ausrichtungspunkt, falls vorhanden). Text in Blöcken wird nicht gelesen, und die Zeichnung wird nie verändert.

## Die Prüfung

Die Prüfung läuft über das, was Sie gerade einlesen wollen, und listet auf, was sie findet, eine Zeile für jede Art von Problem:

| Meldung | Bedeutung |
|---|---|
| **Einheiten nicht angegeben** | Die Zeichnung sagt nicht, welche Einheiten sie verwendet, daher werden ihre Zahlen in den Einheiten des Projekts gelesen. Prüfen Sie einen Abstand, den Sie kennen. |
| **Einheiten umgerechnet** | Die Einheiten der Zeichnung weichen von denen des Projekts ab und werden skaliert (ein Hinweis, kein Fehler). |
| **Die Daten umfassen … km** oder **… m** | Die Ausdehnung ist größer als 200 km oder kleiner als einen halben Meter, was meist auf eine falsche Einheit hindeutet (Millimeter als Meter gelesen oder umgekehrt). |
| **Kein Koordinatensystem** | Das Projekt hat keines. Es ist eine Warnung, wenn die Daten weit von null entfernt liegen, wie es bei Gauß-Krüger- oder nationalen Koordinaten der Fall ist. Siehe [Koordinatensysteme](topic:coordinate-systems). |
| **Weit vom Ursprung entfernt** | Die Daten liegen mehr als 100 km von null entfernt. Weit von null verlieren 3D-Ansichten und Exporte an Genauigkeit und wackeln. |
| **Höhenlinien-Layer … hat keine Höhe** | Ein Layer mit einem Namen wie Höhenlinien (TOPO, CONT, CNTR, CONTOUR) enthält Linien auf der Höhe 0, daher wäre ein daraus erstelltes Gelände flach. |
| **Höhen genau 0** | Einige Höhen sind 0, während die übliche Höhe weit davon entfernt liegt: vermutlich fehlende Höhen. |
| **Höhen weit vom Rest entfernt** | Einige Höhen liegen weit außerhalb der übrigen (gemessen am Mittelwert aller Höhen, sodass ein steiles Gelände mit großer Spanne nicht markiert wird) oder über 9.000 m oder unter -11.000 m. |
| **Punkte auf einem anderen Punkt** | Zwei Punkte an derselben Stelle mit derselben Höhe oder mit unterschiedlichen Höhen. |

Nachdem Sie auf {{ui:Hinzufügen}} geklickt haben, werden dieselben Zeilen in **Probleme** eingetragen, eine für jede Art, mit dem Dateinamen, damit Sie später darauf zurückkommen können. Die Prüfung beurteilt die Zeichnung, ändert aber nichts an ihr, und sie hindert Sie nicht daran, die Zeichnung zu verwenden.

:::tip
Meldet die Prüfung, dass Höhenlinien auf 0 flach liegen und es Höhen als Text gibt, übernehmen Sie die Höhen als Vermessungspunkte: Sie tragen oft die echten Höhen, die den Höhenlinien fehlen.
:::

## Was nicht geprüft wird

Die Prüfung vergleicht die Zeichnung nicht mit einer zweiten Vermessung, und sie kann nicht erkennen, in welchem Koordinatensystem die Zeichnung vorliegt: Sie zeigt nur an, dass keines festgelegt ist.
