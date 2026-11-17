---
title: Einen Layer nach einem Attribut gestalten
summary: Die Objekte eines GIS-Layers nach den Werten eines Feldes einfärben (eine Farbe je Wert oder nach Zahlenbereichen), Punkte nach einer Zahl in der Größe abstufen, Polygone tönen und eine Legende im Plan anzeigen.
keywords: symbolik, gestalten, farbe, kategorisiert, abgestuft, eindeutige werte, gleiches intervall, quantil, natürliche unterbrechungen, jenks, farbverlauf, farbenblind, legende, größe, punkte, choroplethen, klassen, gis
from: a3a69add
---

Öffnen Sie das Menü mit den **drei Punkten** in der Liste der GIS-Layer und wählen Sie {{ui:Nach Attribut gestalten…}}.

## Drei Gestaltungen

- **Einfaches Symbol:** die Farbe des Layers wie bisher.
- **Kategorisiert:** eine Farbe je unterschiedlichem Wert eines beliebigen Feldes. Bis zu acht Werte erhalten die acht Okabe-Ito-Farben (so gewählt, dass sie bei den gängigen Formen der Farbenblindheit unterscheidbar bleiben); bei mehr Werten erhalten die sieben häufigsten je eine Farbe, und der Rest teilt sich eine graue Klasse **Andere**. Objekte ohne Wert sind grau.
- **Abgestuft:** ein Zahlenfeld wird in 2 bis 9 Bereiche geteilt, jeder mit einer Farbe aus einem Verlauf. Ein Wert genau auf einer Grenze gehört zum unteren Bereich.

## Wie die Bereiche geschnitten werden

| Methode | Grenzen |
|---|---|
| Gleiches Intervall | Der Bereich vom kleinsten bis zum größten Wert wird in gleich breite Teile geteilt. Werte von 0 bis 30 in drei Bereichen: 0, 10, 20, 30. |
| Quantil | Ungefähr gleich viele Objekte in jedem Bereich. Die Grenzen werden aus den sortierten Werten mit der üblichen linearen Interpolation gelesen: für 1 bis 10 in zwei Bereichen ist die Grenze 5,5. |
| Natürliche Unterbrechungen (Jenks) | Die Schnitte, die innerhalb jedes Bereichs die geringste Streuung lassen, sodass Gruppen ähnlicher Werte beisammen bleiben. Bei mehr als 1.500 Werten arbeitet es mit 1.500 gleichmäßig verteilten und sagt das. |

## Farben

Viridis und Cividis laufen von dunkel nach hell mit einer gleichmäßigen Änderung der Helligkeit, sodass die Reihenfolge der Bereiche auch in Graustufen oder bei Farbenblindheit lesbar ist. Blues läuft von hell nach dunkel. Rot bis Blau ist ein zweiseitiger Verlauf für Werte um eine Mitte. **Farben umkehren** dreht jeden davon um. Der Dialog listet vor dem Übernehmen die Bereiche und die Anzahl der Objekte in jedem auf.

## Größe, Füllung und Legende

- **Punktgröße nach** einem Zahlenfeld macht das Quadrat jedes Punktes größer, je größer der Wert ist, zwischen den zwei Größen, die Sie angeben (halbe Seitenlänge, in Millimetern auf Papier).
- **Innenfläche der Polygone tönen** füllt jedes Polygon mit seiner Klassenfarbe (Löcher bleiben leer). Die Tönung ist auf dem Bildschirm; Plots sowie DXF/DWG zeigen die farbigen Umrisse.
- **Legende im Plan anzeigen** zeichnet die Klassen, ihre Anzahlen und den Größenbereich unten links im Plan. Die Legende ist auf dem Bildschirm; sie ist nicht im Plot.
- Um Objekte mit einem Feld zu beschriften, verwenden Sie **Beschriften mit** im selben Menü.

Die Gestaltung wird in der Projektdatei gespeichert. Ein Programmstand, der Gestaltungen nicht kennt, öffnet die Datei mit der Farbe des Layers. Plots, DXF und DWG tragen die Klassen als getrennte Layer, benannt nach dem Layer und der Klasse, in der nächstliegenden der neun grundlegenden CAD-Farben. Ein Layer mit mehr als 200.000 Objekten wird in einer einzigen Farbe gezeichnet.
