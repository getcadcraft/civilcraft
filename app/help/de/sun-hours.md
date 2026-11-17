---
title: Sonnenstunden auf einem Grundstück berechnen
summary: Einen Tag (oder eine Jahreszeit) und eine Zeitzone wählen und die Stunden direkter Sonne an jeder Wand jedes Baukörpers und auf dem Gelände um sie herum sehen, mit dem Gelände im Plan und den Zahlen als CSV.
keywords: Sonne, Sonnenstunden, Schatten, Verschattung, Besonnung, Tageslichtstunden, Fassade, Wand, Jahreszeit, Sonnenwende, Tagundnachtgleiche, Zeitzone, Sommerzeit, Breitengrad, Längengrad, CSV, Raster
from: 4e32a314
---

**Sonnenstunden** zählt die Stunden direkter Sonne, die auf jede Wand jedes Baukörpers und auf das Gelände um sie herum treffen, an einem Tag, den Sie wählen, oder gemittelt über eine Jahreszeit. Die Baukörper und das Gelände selbst werfen Schatten; sonst nichts (keine Bäume, keine Nachbargebäude, die Sie nicht gezeichnet haben). Himmelslicht, das nicht direkte Sonne ist, wird nicht gezählt.

## Vor dem Start

Der Sonnenstand ergibt sich aus Breiten- und Längengrad des Standorts, die aus dem **Koordinatensystem** des Projekts stammen. Ein Projekt ohne Koordinatensystem wird mit einer Meldung abgelehnt: Legen Sie es zuerst fest (**Koordinaten** in der Gruppe GIS). Einen von Hand eingegebenen Breiten- und Längengrad gäbe es nur als Schätzung, daher gibt es dafür kein Feld.

## Berechnen

Unter **Eigenschaften**, bei **Baukörper**, **Sonnenstunden**:

1. Wählen Sie den **Tag**. Er beginnt mit dem Tag, an dem die Sonne am niedrigsten steht (21. Dezember oder 21. Juni auf der Südhalbkugel). Für eine Jahreszeit markieren Sie **Über eine Jahreszeit**, wählen den **Letzten Tag** und wie viele Tage auseinander abgetastet werden soll.
2. Geben Sie die **Zeitzone** ein: einen Namen wie `America/Mexico_City` oder eine Abweichung von UTC wie `-6`. Ein Name folgt für diesen Tag den Sommerzeitregeln dieser Zeitzone; eine eingegebene Abweichung wird genau so verwendet, wie eingegeben, verwenden Sie also die an diesem Tag gültige. Die Zeile unter dem Feld zeigt, welche Abweichung gefunden wurde.
3. Wählen Sie, wie oft die Sonne platziert wird (alle 5, 10, 15 oder 30 Minuten), und dann **Sonnenstunden berechnen**. Eine Jahreszeit läuft in Hintergrundprozessen; **Stoppen** bricht sie ab.

## Ergebnisse

- Eine Tabelle je Baukörper: die **ungünstigste Wand**, der **Mittelwert** und die **günstigste Wand** in Stunden pro Tag sowie eine Tabelle aller Wände mit ihrer Ausrichtung und ihren Stunden je Geschoss.
- Das Gelände um die Baukörper wird im Plan dargestellt, von Dunkel (keine Sonne) bis Gelb (das Höchstmaß, das eine Zelle erreicht), mit einer Legende. Zellen unter einem Baukörper bleiben leer. **Gelände im Plan anzeigen** schaltet es aus.
- **Wände als CSV** und **Gelände als CSV** speichern die Zahlen.

Bei einer Jahreszeit sind die Werte der Durchschnitt pro Tag über die abgetasteten Tage. Im Projekt wird nichts gespeichert: Das Ergebnis dient zur Ansicht, und bei einer erneuten Berechnung entsteht es neu.

## Gut zu wissen

- Eine Wand zählt einen Zeitpunkt nur dann als sonnig, wenn sie zur Sonne zeigt und nichts im Weg steht. Eine abgewandte Wand bekommt nichts.
- Das Gelände wird auf einem Raster abgetastet, dessen Größe von der Größe des Grundstücks abhängt, und der Sonnenstand wird in der Mitte jedes Zeitschritts ermittelt; die Stunden sind daher bis auf den gewählten Schritt genau.
- Der Sonnenstand ist eine veröffentlichte astronomische Formel, genau bis auf etwa eine Bogenminute.
