---
title: Ein Gebäudeplateau modellieren
summary: Eine ebene Fläche zeichnen, ihre Höhe und ihre Abtrags- und Auftragsböschungen festlegen; CivilCraft lässt sie bis zum bestehenden Gelände auslaufen und fügt sie dem geplanten Geländemodell hinzu.
keywords: stützmauer, stützmauern, senkrechte seite, mauer statt böschung, böschung je seite, damm, geländemodellierung, plateau, gebäudeplateau, böschungsschnittlinie, abtrag, auftrag, fertiges gelände, geplante fläche, geländemodell, modellierungsgruppe
from: 482319a6
---

Ein Plateau ist eine ebene Fläche auf einer Höhe. Von seinem Rand aus modelliert CivilCraft nach außen: mit Ihrer Abtragsböschung, wo das Gelände höher liegt als das Plateau, und mit Ihrer Auftragsböschung, wo es tiefer liegt, bis die Böschung auf das bestehende Gelände trifft. Diese Trefferlinie ist die Böschungsschnittlinie. Das Plateau und seine Böschungen ersetzen das bestehende Gelände innerhalb der Böschungsschnittlinie und ergeben das geplante Geländemodell.

## Plateau zeichnen

Sie brauchen zuerst eine bestehende Geländefläche.

1. Drücken Sie {{key:G}} oder klicken Sie in der Gruppe **Entwurf** auf {{ui:Plateau}}.
   Der Hinweis lautet: "Plateau: Ecken anklicken. Enter oder Doppelklick beendet, Backspace entfernt die letzte, Esc bricht ab."
2. Klicken Sie die Ecken des Plateaus der Reihe nach an, in beliebiger Richtung. Eine blaue Umrisslinie folgt dem Zeiger.
3. Drücken Sie {{key:Enter}} nach der letzten Ecke (mindestens drei).
   Das Plateau wird gezeichnet und ausgewählt. Es beginnt auf der Geländehöhe in seiner Mitte, auf 0,1 gerundet, mit einer 2:1-Abtragsböschung und einer 3:1-Auftragsböschung. Die Statusleiste zeigt zum Beispiel: "Plateau 1 auf Höhe 254.3 (das Gelände in seiner Mitte), Abtrag 2:1, Auftrag 3:1. Ändern Sie sie unter Eigenschaften."

:::warning
Beenden Sie mit {{key:Enter}}. Ein Doppelklick beendet ebenfalls, verwirft in diesem Build aber die Ecke, auf die Sie doppelgeklickt haben. Klicken Sie die letzte Ecke einmal an und drücken Sie dann {{key:Enter}}.
:::

Die Plateau-Umrisslinie darf sich nicht selbst kreuzen ("Die Plateau-Umrisslinie kreuzt sich selbst.").

## Höhe und Böschungen festlegen

Bei ausgewähltem Plateau zeigt das rechte Panel **Plateau**:

1. **Name**.
2. **Höhe**: die ebene Höhe des Plateaus.
3. **Abtragsböschung** und **Auftragsböschung**, als H:V (2 bedeutet 2:1). Beide müssen größer als 0 sein.
4. **Plateaufläche** und **Ecken** werden zur Information angezeigt.

Drücken Sie nach jedem Wert {{key:Enter}}. Die Trefferlinie, das geplante Geländemodell und die Massen aktualisieren sich sofort.

Unter den Feldern steht zum Beispiel eine Zeile wie "Böschungsschnittlinie: 48 Böschungslinien (20 im Abtrag, 28 im Auftrag), am weitesten 31.20 ft entfernt." Der Plan zeigt die Böschungsschnittlinie und die Böschungslinien in Magenta.

## Wie die Böschungsschnittlinie gefunden wird

- Böschungslinien verlassen jede Kante senkrecht dazu, etwa alle zwanzigstel der Größe des Plateaus.
- An äußeren Ecken fächern sie alle 10° auf, sodass die Böschung um die Ecke herumläuft.
- An inneren Ecken verläuft eine Linie entlang der Winkelhalbierenden, wo sich die Böschungen der beiden Kanten treffen.
- Jede Linie steigt mit der Abtragsböschung oder fällt mit der Auftragsböschung, bis sie das Gelände erreicht.

## Böschungen je Seite und Stützmauern

Unter **Seiten und Stützmauern** in den Eigenschaften eines Plateaus, einer Plattform oder eines Walls kann jede Seite eigens modelliert werden. Seite 1 verläuft von der ersten Ecke, die Sie angeklickt haben, zur zweiten, Seite 2 von der zweiten zur dritten, und so weiter.

- **Alle Seiten**: **Geböscht** verwendet die oben genannten Abtrags- und Auftragsböschungen an jeder Seite; **Senkrecht: Stützmauern** setzt auf jede Seite eine Mauer.
- Je Seite: **Böschungen oben**, **Eigene Böschungen** (geben Sie eine Abtrags- und eine Auftragsböschung für diese Seite ein) oder **Senkrecht (Stützmauer)**.
- Geben Sie eine Böschung als `3` oder `3:1` (horizontal zu 1 vertikal), `33%` oder `18.4°` ein; sie wird als H:1 angezeigt. Die eigenen **Abtragsböschung** und **Auftragsböschung** des Plateaus nehmen dasselbe an.
- Eine senkrechte Seite hat keine Böschung: Eine Stützmauer verläuft entlang der Kante, vom Plateau hinunter zum bestehenden Gelände (im Auftrag) oder vom Gelände hinauf zum Plateau (im Abtrag). **Mauerstärke** (anfangs 0,3 m bzw. 1 ft) ist die Strecke, um die das Gelände von der Plateaukante zum bestehenden Gelände abgesetzt wird. Abtrags- und Auftragsmassen lassen die Böschung dieser Seite weg, die es nicht mehr gibt.
- Wo eine Mauer auf eine geböschte Seite trifft, läuft die Böschung um das Mauerende herum; zwei Mauern treffen sich auf Gehrung.
- Unter den Feldern: Länge der Mauern, sichtbare Fläche (Höhe × Länge), höchste und durchschnittliche Höhe.

Der Plan zeichnet die äußere Fläche jeder Mauer mit kurzen Strichen quer darüber und ihre Höhe an beiden Enden und an ihrer höchsten Stelle (im Layer der Stützmauern, der auch in DXF und DWG geht). Die 3D-Ansicht zeigt die Mauern als Volumenkörper (Anzeige › Stützmauern), und GLB-, OBJ- und USD-Exporte enthalten sie. Schnitte über die Kante zeigen die Stufe.

**Warnungen** (in den Eigenschaften und im Panel Probleme): Eine Mauer, die höher ist als **Warnen ab einer Mauerhöhe von** (anfangs 1,0 m bzw. 3,3 ft), "kann eine konstruierte Mauer oder eine Genehmigung erfordern; örtliche Vorschriften prüfen". Außerdem jede Seite, deren Abtrags- oder Auftragsböschung steiler ist als die **Steilste Böschung, die der Boden hält**, wenn Sie diese eingeben. Es sind Warnungen: Die Modellierung wird trotzdem erstellt. Jede Änderung ist ein Schritt für {{key:Mod+Z}}.

## Ecken verschieben

Wählen Sie das Plateau und ziehen Sie dann an einem quadratischen Griff an einer Ecke. Jedes Ziehen ist ein Schritt für Rückgängig. Eine Ecke hinzufügen oder entfernen ist noch nicht verfügbar: Löschen Sie das Plateau und zeichnen Sie es neu.

## Wenn die Modellierung nicht gelingt

Ein rotes Feld unter **Erdbewegung** nennt das Plateau und das Problem:

| Meldung | Was zu tun ist |
|---|---|
| "3 Böschungslinien laufen vom Geländemodell ab, bevor sie es treffen: das Plateau liegt zu nah am Rand des Geländemodells oder ist zu hoch/zu tief." | Verschieben Sie das Plateau vom Rand des Geländemodells weg, oder bringen Sie seine Höhe näher an das Gelände. |
| "Die Böschungsschnittlinie kreuzt sich selbst (Böschungen von verschiedenen Seiten des Plateaus laufen ineinander). Formen Sie das Plateau um oder ändern Sie die Böschungen." | Typisch für schmale oder L-förmige Plateaus bei tiefem Abtrag oder hohem Auftrag. Verbreitern Sie das Plateau, verringern Sie den Höhenunterschied oder machen Sie die Böschungen steiler. |
| "Die Plateau-Umrisslinie kreuzt sich selbst." | Zeichnen Sie die Ecken der Reihe nach um das Plateau neu. |

Ein Plateau mit einem Problem wird aus dem geplanten Geländemodell und den Massen ausgelassen, bis es behoben ist.

## Das Ergebnis ansehen

1. Setzen Sie unter **Anzeige** die **Geländemodell**-Ansicht auf {{ui:Geplant (modelliert)}}.
   Die Höhenlinien verlaufen nun flach über das Plateau und folgen den Böschungen bis zur Böschungsschnittlinie.
2. Bewegen Sie den Zeiger über das Plateau: Die Statusleiste zeigt die Höhen **Boden** und **Modelliert**.
3. Lesen Sie Abtrag und Auftrag unter **Erdbewegung**; siehe [Erdbewegungsmassen](topic:volumes).

Plateaus werden nach Korridoren modelliert, in der Reihenfolge, in der sie gezeichnet wurden. Ein späteres Plateau ersetzt alles, was vorher innerhalb seiner eigenen Böschungsschnittlinie lag.

## Plateau löschen

Wählen Sie es aus und drücken Sie {{key:Delete}} (auf dem Mac Fn und Delete), oder klicken Sie auf {{ui:Löschen}}.

## Noch nicht umgesetzt

Plateaus sind eben: geneigte Plateaus, Geländelinien mit wechselndem Gefälle, Absätze sowie Modellierung bis zu einer Entfernung oder einer Höhe als Ziel sind noch nicht verfügbar. Siehe [Noch nicht umgesetzt](topic:not-built-yet).
