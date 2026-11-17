---
title: Polygonzug eingeben und nach der Kompassregel ausgleichen
summary: Winkel oder Richtungswinkel und Strecken eingeben, den Winkel- und Linienabschluss sowie die Genauigkeit prüfen, nach der Kompassregel ausgleichen und die Stationen als Punkte oder die Schleife als Flurstück hinzufügen.
keywords: Polygonzug, geschlossener Polygonzug, Schleife, Winkel rechts, Rückblick, Richtungswinkel, Strecken, Abschluss, Schlussfehler, Genauigkeit, Kompassregel, Bowditch, Ausgleich, Vermessung
from: 56ce5a8c
---

Ein Polygonzug ist eine Folge gemessener Strecken: An jeder Station ein Winkel (oder ein Richtungswinkel) und eine Strecke bis zur nächsten. Klicken Sie im rechten Bereich unter **Polygonzug** auf **Polygonzug eingeben**, wenn nichts ausgewählt ist.

## Wo er beginnt und endet

1. **Start am Punkt**: dessen Nummer. Oder einen Hochwert und einen Rechtswert eingeben.
2. **Strecken als**: **Winkel rechts und Strecken** oder **Richtungswinkel und Strecken**.
3. Bei Winkeln angeben, wovon sie ausgehen: einen **Rückblickpunkt** oder **dessen Azimut** (von der ersten Station zum Rückblick, im Uhrzeigersinn ab Norden).
4. **Ende**: **zurück am Start (Schleife)**, oder **auf Punkt** und dessen Nummer (ein offener Polygonzug zwischen bekannten Punkten).

## Die Strecken eingeben

Eine Strecke pro Zeile, dann die Strecke, dann optional ein Name für die Station, die sie erreicht:

- Winkel rechts, im Uhrzeigersinn an der Station gemessen, die die Strecke verlässt, von der Station dahinter zur nächsten: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` und `270.0028` funktionieren auch.
- Richtungswinkel: `N 45°30'15" E 125.50 B`, oder ein Azimut als ein Wort: `AZ 45-30-15 125.50 B`.
- Bei einer Schleife mit Winkeln mit `close` enden und dem Winkel am Start noch einmal angeben, gemessen von der letzten Station zur zweiten: `close 270°00'05"`. Damit werden die Winkel geprüft.

Zeilen, die nicht gelesen werden können, sind mit ihrer Zeilennummer aufgeführt. „feet“, Kommas und Kommentarzeilen mit `#` sind zulässig.

## Den Abschluss lesen

Während Sie eingeben, zeigt der Dialog:

- **Winkelabschluss**: wie weit die Winkel vom Schließen entfernt sind und welchen Anteil jeder Winkel übernimmt. Ohne schließenden Winkel werden die Winkel nicht geprüft, und ein Fehler darin erscheint im Linienabschluss.
- **Linienabschluss**: wie weit der Polygonzug von dem Punkt entfernt endet, an dem er enden sollte, und in welche Richtung.
- **Genauigkeit**: die Länge des Polygonzugs geteilt durch den Linienabschluss: 1 : 10,000 bedeutet 1 ft auf 10,000 ft.
- Die Stationen nach dem Ausgleich und wie weit sich jede bewegt hat.

## Der Ausgleich

Zuerst wird der Winkelabschluss gleichmäßig auf die Winkel verteilt. Dann wird der Linienabschluss nach der Kompassregel (Bowditch) auf die Strecken verteilt: Jede Station verschiebt sich gegen den Abschlussfehler im Verhältnis zur Länge, die bis zu ihr zurückgelegt wurde, sodass der Polygonzug genau dort endet, wo er enden soll.

:::note
Die Kompassregel ist ein Standardausgleich, kein Ausgleich nach der Methode der kleinsten Quadrate, und sie gewichtet Winkel und Strecken nicht gegeneinander. Ob die Genauigkeit ausreicht, entscheiden Ihre eigenen Vorgaben und die Vorgaben Ihres Zuständigkeitsbereichs.
:::

## Das Ergebnis verwenden

- **Als Punkte hinzufügen**: Die ausgeglichenen Stationen werden zu Punkten mit den Namen, die Sie vergeben haben (sonst mit den nächsten freien Nummern), Beschreibung `TRAV`, ohne Höhe. Die letzte Station einer Schleife ist ihr Start und wird daher nicht doppelt hinzugefügt. Ein Schritt: {{key:Mod+Z}} macht es rückgängig.
- **Als Flurstück hinzufügen** (Schleifen): Die ausgeglichenen Stationen werden zu einem [Flurstück](topic:parcels) mit seinen Beschriftungen und der Flurstücksbeschreibung.
- **Bericht (CSV)**: die Abschlusszeilen, dann für jede Station Richtung, Strecke, nicht ausgeglichene und ausgeglichene Koordinaten sowie die Korrekturen.
