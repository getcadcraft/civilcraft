---
title: Hausplateaus an Hanglagen
summary: Ein Plateau an einem Hang modellieren: Stützmauern als Plateaukanten, die Abtrag-Auftrag-Karte, schattiert nach Tiefe, mit Höhenpunkten (Plan und 3D), ein Schnitt, der überall durch das Gelände und den Entwurf gezeichnet wird, sowie Rampen oder geneigte Plateaus für Zufahrten.
keywords: Plateau, Hausplateau, Baufläche, Hanglage, Hang, Stützmauer, Abtrag und Auftrag, Abtrag-Auftrag-Karte, Höhenpunkte, freier Schnitt, Schnittlinie, Bauamtszeichnungen, Zufahrt, Rampe, geneigtes Plateau, modellieren, Auflockerungsfaktor, Erdarbeiten
from: daa08a3f
---

Ein Hausplateau ist ein **Plateau** (**Entwurf** › {{ui:Pad}}): ein ebenes Polygon auf einer Höhe, ins Gelände modelliert. Vier Dinge helfen am Hang.

## Stützmauern als Plateaukanten

Wählen Sie das Plateau und stellen Sie eine Seite statt auf eine Böschung auf {{ui:Vertical (retaining wall)}} (**Eigenschaften** › {{ui:Sides and retaining walls}}, oder {{ui:Vertical: retaining walls}} für alle Seiten zugleich). Die Höhe der Mauer wird vom Gelände entlang ihr abgelesen: oben am Gelände, unten am Plateau. Sie wird an beiden Enden und an ihrem höchsten Punkt im Plan angezeigt, mit einer Warnung, wenn sie höher ist als die von Ihnen festgelegte Grenze. Mauern und Böschungen lassen sich nebeneinander mischen.

## Die Abtrag-Auftrag-Karte

Aktivieren Sie {{ui:Cut and fill map}} unter **Anzeigen**. Der Plan wird nach der Tiefe von Abtrag oder Auftrag in gleichen Stufen schattiert (Abtrag warm, Auftrag blau, nahezu eben blass), mit einer Legende. **Höhenpunkte** werden auf das Plateau gedruckt: die Höhenänderung an Punkten eines Rasters sowie der tiefste Abtrag und der höchste Auftrag, mit ▲ markiert. Die Zellen sind dieselben, die die Erdarbeitsmengen verwenden, sodass Karte und Zahlen immer übereinstimmen.

In der 3D-Ansicht wählen Sie in der Farbliste **Abtrag und Auftrag**, um dieselben Farben über Gelände und Entwurf zu legen.

Ein Auflockerungs- oder Schrumpfungsfaktor wird in der Massenlinie festgelegt (**Entwurf** › {{ui:Mass haul}}); er wird nicht auf die Volumen eines Plateaus angewendet.

## Ein freier Schnitt

Wählen Sie unter **Geländemodell** › {{ui:More}} die Option {{ui:Free section}}, klicken Sie beliebig die Punkte der Schnittlinie (sie darf knicken) und drücken Sie {{key:Enter}}. Ein Dialog zeichnet den Schnitt: das Bestandsgelände, den modellierten Entwurf (gestrichelt) und den Abtrag und Auftrag dazwischen, schattiert, mit ihren Flächen (der Entwurf zählt nur innerhalb der Plateaus und Straßen). {{ui:Vertical exaggeration}} ist standardmäßig so eingestellt, dass die Zeichnung passt; {{ui:Save as SVG}} und {{ui:Save as CSV}} liefern Ihnen eine Zeichnung für die Behörde und die Zahlen.

## Rampen und geneigte Plateaus

Wählen Sie unter **Geländemodell** › {{ui:More}} die Option {{ui:Ramp or sloped pad}}, klicken Sie das tiefe Ende und dann das hohe Ende, drücken Sie {{key:Enter}} und geben Sie die Breite, die Höhe am tiefen Ende und das Gefälle an. Das Plateau ist ein Streifen, dessen Ecken diese Höhen tragen (die Kante zwischen zwei Ecken verläuft mit gleichbleibendem Gefälle), und es wird wie jedes Plateau ins Gelände modelliert. Auch die Ecken eines beliebigen Plateaus können eigene Höhen tragen; eine Zufahrt, eine Rampe oder eine geneigte Terrasse ist daher ein Plateau mit einer Höhe an jeder Ecke.
