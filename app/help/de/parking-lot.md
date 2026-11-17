---
title: Parkplatzanordnung
summary: Stellplätze, Fahrgassen, barrierefreie und Transporterstellplätze sowie Inseln innerhalb eines Umrisses anordnen, das Gelände mit Gefälle zu Einläufen gegenüber dem Bestandsgelände modellieren und dann pflastern und bepflanzen. Auch für einen Assistenten verfügbar.
keywords: Parkplatz, Stellplatz, Fahrgasse, barrierefrei, ada, Transporter, Insel, Einlauf, Gefälle, Gelände, Abtrag, Auftrag, Pflasterung, Pflastersteine, Bepflanzung, Bäume, Terrain, Punktwolke, mcp, Assistent
from: 06c14da9
---

Passen Sie einen Parkplatz in ein Flurstück, einen Bauplatz oder eine geschlossene Feature-Linie ein und erhalten Sie in einem Schritt die Anzahlen, das Gelände und die Pflasterung.

## Parkplatz anordnen

1. Wählen Sie im Plan ein Flurstück, einen Bauplatz oder eine geschlossene Feature-Linie aus.
2. Öffnen Sie **Geländemodell, Mehr, Parkplatz...**
3. Wählen Sie die Regeln, den Stellplatzwinkel (90, 75, 60, 45, 30 Grad oder parallel) und Einbahn- oder Zweirichtungsfahrgassen. Die Maße für Stellplätze, Fahrgassen und Inseln beginnen mit den Werten aus der Tabelle, und jeder davon kann überschrieben werden.
4. Wählen Sie **Anordnen**.

Die Reihen verlaufen entlang der Umrisskante, die die meisten Stellplätze ergibt (oder im Winkel, den Sie eingeben). Ein Stellplatz zählt nur, wenn er vollständig innerhalb des Umrisses liegt. Wo Platz für eine Reihe und eine Fahrgasse bleibt, wird ein einseitig belegter Streifen hinzugefügt. Das Fenster listet Stellplätze, barrierefreie und Transporterstellplätze, Inseln, Einläufe und die Fläche je Stellplatz auf. Der Plan zeigt Stellplätze, barrierefreie Stellplätze mit ihren schraffierten Zufahrtsgassen, Inseln, Fahrgassen-Mittellinien und Einläufe auf eigenen Layern (C-PARK-...), sodass sie in PDF, DXF und DWG gelangen.

## Barrierefreie Stellplätze

Mit den US-Regeln richtet sich die Anzahl nach der Tabelle 208.2 der ADA Standards 2010 für die vorgesehenen Stellplätze (jeder sechste, aufgerundet, ist ein Transporterstellplatz). Sie werden nahe der ersten Ecke des Umrisses (der Einfahrt) platziert, jeweils mit einer Zufahrtsgasse; zwei teilen sich eine. Ein Stellplatz, der schmaler als die barrierefreie Breite ist, oder ein Gefälle steiler als 1:48 auf barrierefreien Stellplätzen wird als Problem angezeigt. **Diese Werte wurden aus der Norm aus dem Gedächtnis übernommen und nicht gegen die gedruckte Norm geprüft.** Übliche Stellplatz- und Fahrgassenmaße stammen aus Richtlinien für die Parkplatzplanung und sind ebenso ungeprüft. Prüfen Sie beides sowie Ihre örtlichen Vorschriften, bevor Sie sich darauf verlassen. Wählen Sie **Benutzerdefiniert**, um Ihre eigene Anzahl barrierefreier Stellplätze einzugeben.

## Gefälle zu Einläufen, Abtrag und Auftrag

Sofern Sie es nicht ausschalten, wird der Parkplatz im Arbeitsbereich Landschaft zu einem Geländebereich. Einläufe werden etwa alle 100 ft (30 m) auf die Mittellinien der Fahrgassen gesetzt; die Oberfläche steigt von jedem Einlauf mit dem von Ihnen angegebenen Gefälle (anfangs 1.5 Prozent), sodass jeder Punkt zu seinem nächsten Einlauf hin abfällt. Die Höhe wird so gewählt, dass sich Abtrag und Auftrag des Parkplatzes am Bestandsgelände ausgleichen. Das Bestandsgelände ist die vorhandene Oberfläche des Projekts; sie kann aus Vermessungspunkten, LandXML, einer in eine Oberfläche umgewandelten Lidar- oder Scan-Punktwolke oder aus Höhenlinien stammen. Das Fenster zeigt die Schätzung von Abtrag und Auftrag; die eigenen Volumen des Projekts zeigen danach den genauen Wert. Der Geländebereich behält seine Kante am Bestandsgelände. Wo sich die neue Oberfläche am Rand vom Gelände unterscheidet, entsteht also eine Stufe, und das Fenster zeigt deren Größe an.

## Pflasterung und Bepflanzung

Der gesamte Umriss erhält einen Pflasterbelag aus Pflastersteinen (ein Läuferverband, den Sie unter Landschaft, Hardscape ändern können), und jede Insel erhält ein Strauchbeet und, wo sie breit genug ist, einen Baum aus der Pflanzenliste. Danach ist alles ein gewöhnliches Landschaftsobjekt: Bearbeiten Sie es, oder wählen Sie **Erneut anordnen**, um das zu ersetzen, was der Parkplatz erzeugt hat. Wenn Sie den Parkplatz entfernen, werden die von ihm erzeugten Objekte ebenfalls entfernt.

## Über einen Assistenten

Derselbe Parkplatz kann über MCP angefragt werden: `parking_layout` zeigt eine Vorschau, `parking_build` schreibt, `parking_remove` entfernt einen Parkplatz. Fragen Sie nach dem Flurstücksnamen oder senden Sie den Umriss.

## Was noch nicht umgesetzt ist

Ob die Fahrgassen eine Straße erreichen, wird nicht geprüft. Der Belag deckt den gesamten Umriss ab, daher enthält seine Fläche die Inseln. Auswahl an Pflastermaterialien aus der Bibliothek und ein Bibliothekstyp für Stellplätze sind noch nicht vorhanden; das Pflastermuster ist das von Hardscape. Regeln anderer Länder sind noch nicht vorhanden.
