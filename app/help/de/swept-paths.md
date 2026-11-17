---
title: Schleppkurven von Fahrzeugen
summary: Ein Fahrzeug mit bis zu drei Anhängern entlang einer Freilinie oder einer Trasse vorwärts oder rückwärts fahren lassen und die überstrichene Fläche, die Radspuren, den Lenkeinschlag und die Stelle sehen, an der es einknickt.
keywords: Schleppkurve, Wendekurve, Fahrzeugschleppkurve, Wendeschablone, Bemessungsfahrzeug, Lkw, Bus, Anhänger, Sattelanhänger, Rückwärtsfahren, Rückwärtsfahrt, Einknicken, Knickwinkel, Lenkanschlag, Schleppabweichung, Radspur, Laderampe, Wenderadius
from: 8caafb8a
---

Eine Schleppkurve lässt ein Fahrzeug entlang einer Linie fahren und zeigt die Fläche des Geländes, über die sein Aufbau fährt. Verwenden Sie sie, um zu prüfen, ob ein Lkw eine Ecke nehmen, eine Laderampe erreichen oder einen Anhänger ohne Verlassen der Befestigung einrangieren kann.

## Ein Fahrzeug entlang einer Linie fahren lassen

1. Zeichnen Sie die Linie, der das Fahrzeug in Fahrtrichtung folgt: eine Freilinie (Bögen sind möglich: Drücken Sie beim Zeichnen {{key:C}}, siehe [Freilinien](topic:feature-lines)) oder eine Trasse.
2. Wählen Sie sie aus und klicken Sie in ihren **Eigenschaften** auf {{ui:Schleppkurve …}}.
3. Wählen Sie unter **Ausgehend von** ein Fahrzeug und legen Sie dann seine Maße anhand Ihres eigenen Bemessungsfahrzeugs fest: Breite, vorderer Überhang, Radstand, hinterer Überhang, Spurweite und **Lenkanschlag**. Fügen Sie bis zu drei Anhänger hinzu, jeweils mit der Stelle, an der er angehängt ist, seiner Länge von der Anhängerkupplung bis zu seiner Achse, seinen Überhängen und seinem **Größten Knickwinkel**.
4. Wählen Sie die **Fahrtrichtung**: vorwärts oder rückwärts. Klicken Sie auf {{ui:Befahren}}.

:::warning
Die Fahrzeuge, mit denen Sie beginnen können, sind Platzhalter, keine Norm. Legen Sie die Maße anhand des Bemessungsfahrzeugs fest, das Ihr Projekt verwendet.
:::

## Vorwärts und rückwärts

| Fahrtrichtung | Was der Linie folgt | Was CivilCraft berechnet |
|---|---|---|
| **Vorwärts** | Die Mitte der Vorderachse | Wohin die Hinterachse und jeder Anhänger fahren, der Lenkwinkel und der Knickwinkel |
| **Rückwärts** | Die Mitte der letzten Achse (das Ende des Anhängers) | Wohin jede vordere Einheit fährt und welche Lenkung das Fahrerhaus braucht, um den Anhänger dorthin zu bringen |

Rückwärtsfahren ist die Art, wie ein Rangiervorgang geprüft wird: Sagen Sie, wohin der Anhänger soll, und CivilCraft sagt, ob das Fahrerhaus es schafft.

## Das Ergebnis lesen

Die Schleppkurve wird im Plan orange gezeichnet: ihr Umriss und, gestrichelt, die Spuren der äußersten Räder. Wählen Sie sie aus (klicken Sie in sie hinein), um in den **Eigenschaften** zu sehen:

- **Gefahrene Länge**, den größten **Lenkwinkel** und den **Knickwinkel** im Vergleich zu ihren Grenzwerten sowie die **Schleppfläche**.
- Jedes Problem entlang der Linie mit seiner Entfernung: die Lenkung über dem Anschlag oder ein Anhänger, der seinen Knickwinkel-Grenzwert überschreitet (er knickt ein).
- **Das Fahrzeug entlang der Linie**: Bewegen Sie den Schieberegler, um das Fahrzeug an jedem Punkt zu sehen, mit seiner Lenkung und seinem Knickwinkel dort.

Ändern Sie die Linie, folgt die Schleppkurve. {{ui:Das Fahrzeug bearbeiten …}} ändert die Maße; **Fahrtrichtung** wechselt zwischen vorwärts und rückwärts. Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig. {{key:Delete}} löscht die ausgewählte Schleppkurve (die Linie bleibt).

Umriss und Radspuren gehen in die PDF-, DXF- und DWG-Ausgabe auf dem Layer C-ROAD-SWPT.

## Wie es berechnet wird

Jede Einheit dreht sich um die Linie ihrer Hinterachse und wird vom Punkt vor ihr gezogen (der Vorderachse oder der Anhängerkupplung). Das ist das Modell mit niedriger Geschwindigkeit und ohne Schlupf, das Schleppkurven-Prüfungen verwenden. Die überstrichene Fläche ist die Vereinigung der Aufbauumrisse an allen Positionen. Nicht modelliert werden Geschwindigkeit, Reifenschlupf, die Zeit, die die Lenkung zum Einschlagen braucht, gelenkte Anhänger und die Bodenfreiheit unter dem Aufbau.
