---
title: Baukörper gegen die von Ihnen eingegebenen Baurechtswerte prüfen
summary: Geben Sie die Grenzabstände eines Grundstücks Zeile für Zeile, eine Höhenbegrenzung, eine Schrägebene, eine Geschossflächenzahl und eine Grundflächenzahl ein, sehen Sie die bebaubare Hülle im Plan und lesen Sie ab, welche Baukörper welchen Wert verletzen.
keywords: baurecht, grenzabstand, grenzabstände, vorne, seitlich, hinten, hülle, bebaubare fläche, höhenbegrenzung, schrägebene, himmelsebene, geschossflächenzahl, GFZ, grundflächenzahl, GRZ, grundstück, flurstück, satzung, bebauungsplan, prüfung
from: 3e267b31
---

**CivilCraft enthält kein Baurecht.** Es kennt die Regeln keiner Stadt und liefert keine Bibliothek davon mit. Jede Zahl auf dieser Seite ist eine, die Sie eingeben, aus Ihrer eigenen Satzung, und jedes Ergebnis sagt, dass es gegen die von Ihnen eingegebenen Werte gemessen wurde. Es zeigt, wie die Grenzen eines Grundstücks ein Gebäude formen, und ist keine Entscheidung darüber, ob ein Entwurf zulässig ist.

## Die Werte eingeben

Wählen Sie in den **Eigenschaften** unter **Baukörper** ein **Flurstück** (oder wählen Sie einen Baukörper: Die Werte seines Flurstücks werden darunter angezeigt). Füllen Sie dann aus, was zutrifft; lassen Sie ein Feld leer für „keine Begrenzung“:

- **Straßenlinie**: die Grundstücksgrenze an der Straße. Der **Vordere Grenzabstand** gilt für sie, der **Hintere Grenzabstand** für die ihr am gegenüberliegende Linie, und der **Seitliche Grenzabstand** für die übrigen.
- **Höhenbegrenzung**.
- **Schrägebene**: Sie beginnt auf einer Höhe an der Grundstücksgrenze und steigt um den Betrag, den Sie für jede 1 Tiefe nach innen eingeben, gemessen von der Straßenlinie oder von jeder Grundstücksgrenze (2 bedeutet 2 zu 1). Die über einem Punkt zulässige Höhe ist die niedrigere von Ebene und Höhenbegrenzung.
- **Geschossflächenzahl** (Bruttogeschossfläche der Baukörper auf dem Grundstück geteilt durch die Fläche des Grundstücks) und **Grundflächenzahl** (ihre Grundflächen geteilt durch die Fläche des Grundstücks, in Prozent eingegeben).

## Die Hülle

Setzen Sie den Haken bei **Hülle im Plan anzeigen**, um sie auf der Ebene `A-MASS-ENVL` zu zeichnen. Die Hülle ist das Grundstück, das von jeder Grundstücksgrenze um deren eigenen Grenzabstand verkleinert wird, wobei sich die versetzten Linien in auf Gehrung geschnittenen Ecken treffen. Eine Grundstücksgrenze aus einer Kurve wird durch kurze Sehnen innerhalb von 0.01 der Kurve angenähert. Konvexe und konkave Grundstücke funktionieren beide. Wenn sich die Grenzabstände selbst überschneiden (ein tiefer Grenzabstand auf einem schmalen oder sehr konkaven Grundstück), gibt es keine Hülle, und die Eigenschaften sagen es; versuchen Sie kleinere Abstände.

## Das Ergebnis

Unter den Feldern erhält jeder Baukörper und jeder Wert eine Zeile mit einem Häkchen oder einem Kreuz:

- **Grenzabstände**: die Fläche des Baukörpers, die außerhalb der Hülle liegt;
- **Höhe**: die Höhe des Baukörpers gegen das höchste Maß, das über seiner Grundfläche zulässig ist (ein Prisma mit einer Höhe wird durch die niedrigste zulässige Höhe an seinen Ecken begrenzt);
- **Geschossflächenzahl** und **Grundflächenzahl**: alle Baukörper auf dem Flurstück zusammengerechnet.
