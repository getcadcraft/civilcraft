---
title: Absteckungsbericht erstellen
summary: Absteckpunkte entlang einer Trasse bei Stationen und Versätzen oder die Vermessungspunkte in ihrer Nähe auflisten, mit Station, Versatz, Hochwert, Rechtswert, Soll- und Geländehöhe sowie Abtrag oder Auftrag, und den Bericht als CSV oder PDF speichern.
keywords: Absteckung, Absteckbericht, Absteckliste, Abtragsliste, Auftragsliste, Station, Versatz, Abtrag, Auftrag, Lageplan, Bauabsteckung, Ist
from: d8a4e9f1
---

Wählen Sie eine Trasse aus und klicken Sie in ihren **Eigenschaften** auf **Absteckungsbericht**.

## Absteckpunkte bei Stationen und Versätzen

1. **Von** und **bis**: die Stationen, die abgesteckt werden sollen (1+50 oder 150).
2. **Abstand**: der Intervallabstand. Absteckpunkte liegen bei jedem Vielfachen davon, an beiden Enden und (wenn das Kästchen markiert ist) dort, wo die Bögen der Trasse beginnen und enden.
3. **Versätze**: links und rechts der Trasse, in Richtung steigender Station gesehen: `12 L, 0, 12 R`, `L12 CL R12` oder `-12, 0, 12` (links ist minus). Eine Trasse mit Regelquerschnitt beginnt mit ihren Fahrbahn- und Bankettkanten.
4. **Nummerierung ab** und **mit Präfix** benennen die Absteckpunkte: 1, 2, 3 oder S101, S102.

## Vermessungspunkte in der Nähe der Trasse

Wählen Sie **Vermessungspunkte in der Nähe der Trasse** und den Abstand dazu. Jeder Punkt innerhalb dieses Abstands erhält seine Station und seinen Versatz, die Sollhöhe dort und seine eigene Höhe als Gelände: eine Kontrolle für Punkte, die als Ist-Stand abgesteckt oder eingemessen wurden.

## Was der Bericht enthält

| Spalte | Bedeutung |
|---|---|
| Punkt | Der Name des Absteckpunkts oder die Nummer des Vermessungspunkts |
| Station, Versatz | Lage entlang der Trasse: L links, R rechts |
| Hochwert, Rechtswert | Seine Koordinaten |
| Sollhöhe | Die Oberfläche des gelieferten Regelquerschnitts an dieser Stelle (von Böschungsschnittpunkt zu Böschungsschnittpunkt), sonst das Sollprofil in der Achse |
| Geländehöhe | Die bestehende Oberfläche an dieser Stelle oder die eigene Höhe des Vermessungspunkts |
| Abtrag/Auftrag | C, wenn das Gelände über dem Soll liegt (abtragen), F, wenn es darunter liegt (auftragen), auf die Hundertstel genau |

Ein Absteckpunkt ohne Sollhöhe (außerhalb des Regelquerschnitts oder bei einer Trasse ohne Sollhöhe abseits der Achse) hat keinen Abtrag oder Auftrag; das Dialogfeld zeigt an, wie viele es sind.

## Speichern

- **CSV**: eine Titelzeile, dann die oben genannten Spalten, dazu Abtrag oder Auftrag als Zahl mit Vorzeichen (Gelände minus Soll) für Tabellenkalkulationen und Datenerfassungsgeräte.
- **PDF**: Tabellenseiten auf dem gewählten Papier, ein Absteckpunkt pro Zeile, Abtrag in Orange und Auftrag in Grün, mit der Titelleiste der übrigen Blätter.

:::note
Die Absteckpunkte werden aus dem Sollwert im Projekt berechnet. Prüfen Sie sie anhand der genehmigten Pläne, bevor etwas gebaut wird.
:::
