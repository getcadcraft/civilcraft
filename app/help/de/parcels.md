---
title: Flurstücke zeichnen und Flurstücksbeschreibungen schreiben
summary: Ein Flurstück über seine Eckpunkte zeichnen oder die Grenzangaben aus einer Urkunde eingeben, prüfen, wie gut die Angaben schließen, Richtungswinkel und Abstände im Plan beschriften, eine Strecke zu einem Bogen machen und einen Entwurf der Flurstücksbeschreibung kopieren.
keywords: Flurstücke, Parzellen, Grundstücksgrenzen, Grenze, Urkunde, Katasterplan, Grenzbeschreibung, Richtungswinkel, Abstand, Schlussfehler, Genauigkeit, Flurstücksbeschreibung, Ausgangspunkt, Bogen, Radius, Fläche, Acres
from: 6793d6ce
---

Flurstücke liegen im Plan mit dem Richtungswinkel und dem Abstand entlang jeder geraden Strecke (ein Bogen zeigt seinen Radius, seine Länge und seinen Zentriwinkel), dazu in der Mitte ihren Namen und ihre Fläche. Sie gehen in den PDF-Plot sowie in die DWG- und DXF-Exporte ein, auf den Layern `V-PROP` (Linien) und `V-PROP-TEXT` (Beschriftungen). Alles befindet sich unter **Flurstücke** im rechten Bereich, wenn nichts ausgewählt ist.

## Flurstück zeichnen

1. Klicken Sie auf **Flurstück zeichnen**.
2. Klicken Sie die Eckpunkte an, beginnend beim Ausgangspunkt. Ein Klick nahe einem Vermessungspunkt übernimmt dessen genaue Lage.
3. Klicken Sie erneut auf den ersten Eckpunkt oder drücken Sie {{key:Enter}}, um abzuschließen. {{key:Backspace}} nimmt den letzten Eckpunkt zurück; {{key:Esc}} verwirft die bisherigen Eckpunkte; drücken Sie es erneut, um das Werkzeug zu verlassen.

## Grenzangaben aus einer Urkunde eingeben

1. Klicken Sie auf **Grenzangaben eingeben**.
2. Geben Sie an, wo die Angaben beginnen: die Nummer eines Vermessungspunkts oder einen Hoch- und Rechtswert.
3. Geben Sie die Angaben ein oder fügen Sie sie ein, eine pro Zeile:
   - eine Linie: ein Richtungswinkel und ein Abstand, etwa `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` und Azimute (`AZ 45°30'15"`) funktionieren ebenso, und „thence“, Kommas und „feet“ werden ignoriert.
   - ein Bogen: `C R 300 L 52.36 right` (Radius und Bogenlänge) oder `C R 300 D 10°00'00" left` (Radius und Zentriwinkel). Ein Bogen schließt an die Strecke davor an; wenn nicht, geben Sie seinen Sehnenrichtungswinkel an: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` beginnt eine Kommentarzeile.
4. Während Sie tippen, zeigt das Dialogfeld die Länge der Angaben, den **Schlussfehler** (wie weit vom Start sie enden und in welche Richtung), die **Genauigkeit** (die Länge geteilt durch den Schlussfehler, 1 : 10,000 und so weiter) und die Fläche. Zeilen, die es nicht lesen kann, werden mit ihren Zeilennummern aufgelistet.
5. **Flurstück hinzufügen**. Wenn die Angaben nicht schließen, wird das Flurstück mit einer geraden Strecke über die Lücke geschlossen: Prüfen Sie die Angaben anhand der Urkunde. Um den Fehler eines Polygonzugs auf seine Strecken zu verteilen, passen Sie ihn zuerst an.

## Bögen

In den **Eigenschaften** eines Flurstücks hat jede Strecke einen **Radius**. Geben Sie einen ein, um diese Strecke zu einem Bogen durch dieselben zwei Eckpunkte zu machen (ein Radius, der kleiner als die halbe Entfernung zwischen den Eckpunkten ist, kann nicht erreicht werden und wird daher abgelehnt). Wählen Sie unter **Kurven** **Rechts** oder **Links**: Ein Bogen nach rechts hat seinen Mittelpunkt rechts von der Laufrichtung, wie in einer Urkunde. Löschen Sie den Radius, um ihn wieder gerade zu machen. Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig.

## Die Flurstücksbeschreibung

Die Eigenschaften eines Flurstücks enden mit seiner Flurstücksbeschreibung, die aus der Zeichnung erstellt wird:

- „Beginn bei“ den von Ihnen eingegebenen **Ausgangspunkt** (zum Beispiel „die Nordostecke von Flurstück 4“), andernfalls den Hoch- und Rechtswert des ersten Eckpunkts oder den Vermessungspunkt, bei dem die Angaben begannen.
- „danach“ jede Strecke: ein Richtungswinkel und ein Abstand, oder ein Bogen mit seinem Radius, seiner Bogenlänge, seinem Zentriwinkel sowie Sehnenrichtungswinkel und Sehnenabstand.
- „Enthält“ seine Fläche in SF und Acres (in einem Projekt mit Metern in m² und ha).

**Kopieren** legt sie in die Zwischenablage; **Als Text herunterladen** speichert sie als `.txt`-Datei.

:::warning
Die Flurstücksbeschreibung ist ein Entwurf aus der Zeichnung, keine Vermessung. Ein zugelassener Vermessungsingenieur muss sie anhand der Unterlagen prüfen und unterzeichnen, bevor sich jemand darauf verlässt.
:::

Klicken Sie im Plan in ein Flurstück, um es auszuwählen; {{key:Delete}} entfernt es. Flurstücke werden in der Projektdatei gespeichert.
