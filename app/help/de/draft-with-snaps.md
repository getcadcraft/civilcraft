---
title: Zeichnen mit Fang, ausgewählten Ecken sowie Verschieben, Kopieren und Drehen
summary: Trassen, Plateaus, Flurstücke und Feature-Linien genau auf vorhandene Punkte und Ecken setzen, Rechts- und Hochwert einer Ecke eingeben oder auswählen, eine Tangente zu zwei Punkten drehen und ein Objekt um eine Strecke oder einen Winkel verschieben, kopieren oder drehen.
keywords: Fang, Fänge, Objektfang, auf Punkt fangen, auf Ecke fangen, PI, Scheitelpunkt, Ecke, auswählen, Fadenkreuz, Rechtswert, Hochwert, Koordinaten, eingegebene Koordinaten, Tangente, Richtung, Peilung, verschieben, kopieren, drehen, transformieren, gedreht kopieren, duplizieren, Alt, freier Punkt, Zeichnen
from: 49864dda
---

Neu in 0.9: Beim Zeichnen springt der Cursor auf die Punkte und Ecken, die bereits im Plan liegen. Eine Plateau-, Flurstücks- oder Feature-Linien-Ecke kann eingegeben oder ausgewählt werden. Dieses Thema führt durch die drei Werkzeuge.

## Was Sie tun

- Mit Fang zeichnen, sodass eine neue Trasse, ein Plateau, ein Flurstück oder eine Linie genau auf etwas Vorhandenem beginnt und endet.
- Rechtswert und Hochwert einer Ecke festlegen, indem Sie sie eingeben oder eine Stelle im Plan auswählen.
- Eine Tangente der Trasse zu zwei ausgewählten Punkten drehen.
- Ein ganzes Objekt verschieben, kopieren oder drehen.

## Schritte

1. Wählen Sie ein Zeichenwerkzeug, zum Beispiel {{ui:Trasse}}, {{ui:Plateau}}, {{ui:Flurstück}} oder {{ui:Feature-Linie}}. Bewegen Sie den Zeiger nahe an einen Vermessungspunkt, einen PI der Trasse, eine Ecke eines Plateaus, Flurstücks oder einer Massenecke, einen Scheitel einer Feature-Linie oder ein Regenwasser-Bauwerk. Es erscheint eine Markierung mit einer Beschriftung (PI, Ecke, Scheitel, Bauwerk oder Punkt und seine Nummer) sowie dem Rechts- und Hochwert, auf den sie fällt. Klicken Sie, um den Punkt dort zu setzen.
2. Um einen Punkt frei zu setzen, halten Sie {{key:Alt}} beim Klicken gedrückt. Der Fang wird ausgeschaltet.
3. Wählen Sie ein Plateau, Flurstück oder eine Feature-Linie aus. In den Eigenschaften listet der Block {{ui:Ecken}} jede Ecke mit einem Feld Rechtswert und einem Feld Hochwert. Geben Sie neue Zahlen ein oder drücken Sie die Fadenkreuz-Schaltfläche neben einer Ecke und klicken Sie eine Stelle im Plan an. Die Ecke übernimmt diesen Rechts- und Hochwert. Drücken Sie {{key:Esc}}, um eine Auswahl abzubrechen. Das Fadenkreuz funktioniert nur im Plan: Schließen Sie zuerst die 3D-Ansicht.
4. Um eine Tangente zu drehen, wählen Sie eine Trasse aus. Wählen Sie in den Eigenschaften unter {{ui:Tangente aus zwei Punkten}} die Tangente, drücken Sie {{ui:Erster Punkt}} und klicken Sie im Plan, drücken Sie {{ui:Zweiter Punkt}} und klicken Sie erneut, und drücken Sie dann {{ui:Richtung festlegen}}. Die Tangente dreht sich, sodass sie vom ersten Punkt zum zweiten verläuft, und behält ihre Länge.
5. Zum Verschieben, Kopieren oder Drehen wählen Sie eine Trasse, ein Plateau, ein Flurstück oder eine Feature-Linie aus. Geben Sie in den Eigenschaften unter {{ui:Verschieben, Kopieren und Drehen}} bei {{ui:Nach Osten verschieben}} und {{ui:Nach Norden verschieben}} Werte ein (negative Zahlen gehen nach Westen und Süden) und drücken Sie {{ui:Verschieben}} oder {{ui:Kopieren}}. Oder drücken Sie {{ui:Abstand aus zwei Punkten}} und klicken Sie den Punkt, von dem aus verschoben wird, und den Punkt, zu dem verschoben wird.
6. Zum Drehen geben Sie den Winkel bei {{ui:Gegen den Uhrzeigersinn drehen}} (Grad) ein und drücken dann {{ui:Drehen}} oder {{ui:Gedreht kopieren}}. Es dreht sich um die Mitte seiner Ecken, sofern Sie nicht mit dem Fadenkreuz neben dem Winkel einen Punkt wählen, um den gedreht wird.

## Hinweise

- Eine Kopie lässt das Original an seiner Stelle. Danach wird die Kopie ausgewählt.
- Jedes Verschieben, Kopieren, Drehen, jede ausgewählte Ecke und jede gedrehte Tangente ist ein Schritt für Rückgängig.
- Der Fang reicht 10 Bildschirmpixel weit vom Cursor. Eine Fangmarkierung bietet nur eine Stelle an; nichts wird geändert, bis Sie klicken.
- Dasselbe Fadenkreuz steht bei den PI-Zeilen einer Trasse. Siehe [Trassen](topic:alignment), [Flurstücke](topic:parcels) und [Feature-Linien](topic:feature-lines).
