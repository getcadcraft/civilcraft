---
title: Solaranlagen auf dem Gelände anordnen
summary: Bodenmontierte Modultische innerhalb einer Parzelle oder eines Plateaus platzieren, mit Reihenabständen, die auf das tatsächliche Gelände jeder Reihe abgestimmt sind, steiles Gelände frei lassen, den Jahresertrag berechnen und die Modultische im Plan und in 3D anzeigen.
keywords: Solar, PV, Photovoltaik, Anlage, Freiaufstellung, Modultische, Reihen, Reihenabstand, Verschattung, Gelände, Gefälle, Pfähle, Ertrag, kWp, Energie, Horizont
from: 95593fd6
---

## Was Sie lernen

Wie Sie ein Feld mit Modultischen auf einem nicht ebenen Gelände anordnen und was die Zahlen bedeuten. Öffnen Sie es über Geländemodell › Mehr › Solaranlagen.

## Modultische anordnen

1. Wählen Sie **Wo**: eine Parzelle oder ein Plateau des Projekts oder geben Sie die Eckpunkte eines Bereichs ein. Markieren Sie alle Plateaus oder Parzellen, die **frei** bleiben müssen (ein Gebäude, ein Teich).
2. Geben Sie den **Breiten- und Längengrad** des Standorts ein. Die Sonne hängt davon ab; hier wird nichts geschätzt. Hat das Projekt ein Koordinatensystem, übernimmt **Aus dem Koordinatensystem übernehmen** die Werte.
3. Legen Sie die Neigung, die Ausrichtung (leer bedeutet nach Süden), die Anzahl der Module pro Modultisch sowie Leistung und Größe des Moduls fest. Die Modulwerte sind zunächst allgemeine Werte und entsprechend gekennzeichnet; geben Sie Ihre eigenen Werte ein.
4. Drücken Sie **Modultische anordnen**. Das Dialogfeld zeigt die Anzahl der Modultische und Module, die Größe in kWp und den Abstand von Reihe zu Reihe.

Jeder Modultisch ist eine Spalte im Bereich, die von vorn gesetzt und nach hinten fortgeführt wird. Ein Modultisch wird nur dort platziert, wo das Gelände darunter innerhalb der Gefällegrenze liegt, innerhalb des Bereichs und des Abstands zur Grenze, und wo die benötigten Pfähle nicht höher sind als die eingestellte Grenze. Stellen, die die Bedingungen nicht erfüllen, bleiben frei; das Dialogfeld zeigt an, wie viele es sind und warum.

## Reihenabstände richten sich nach dem Gelände

Auf ebenem Gelände stehen die Reihen im üblichen Abstand ohne Verschattung: Der Schatten einer Reihe zur Mittagszeit an der Wintersonnenwende darf nicht die untere Kante der dahinterliegenden Reihe erreichen. An einem Hang wendet CivilCraft dieselbe Regel auf das Gelände an, auf dem die nächste Reihe tatsächlich steht. Steigt das Gelände hinter einem Modultisch an, können die Reihen näher beieinander stehen; fällt es ab, stehen sie weiter auseinander. Das Dialogfeld zeigt den kleinsten, den größten und den mittleren Abstand neben dem Abstand auf ebenem Gelände, damit Sie sehen, welche Wirkung das Gelände hat.

Die Ebene eines Modultisches wird auf Pfählen angehoben, bis jeder Messpunkt darunter den eingestellten Mindestabstand zum Gelände hat. Die höchste Pfahllänge wird im Ergebnis angezeigt.

## Die Jahresenergie

**Jahresenergie** berechnet das Licht auf der geneigten Ebene für einen repräsentativen Tag jedes Monats, die Zelltemperatur, die eingegebenen Verluste, die gegenseitige Verschattung der Modultische und die Hügel am Horizont, die die Sonne verdecken. Der Himmel wird als wolkenlos angenommen, daher ist das Ergebnis eine obere Grenze; reales Wetter liefert weniger. Es handelt sich um eine Schätzung für die frühe Entwurfsphase, nicht um einen Ertragsbericht.

## Speichern

**Im Projekt speichern** sichert die Eingaben und Ergebnisse in der Projektdatei; die Modultische werden beim Öffnen der Datei aus dem Gelände neu berechnet, sodass eine geänderte Geländefläche sie verschiebt. Sie werden im Plan und in 3D angezeigt (Anzeigen › Solaranlagen). Die Tabelle der Modultische lässt sich als CSV herunterladen. Ein Schritt von Rückgängig entfernt eine Anlage oder stellt sie wieder her.

## Noch nicht umgesetzt

Wetterdaten anstelle des klaren Himmels, Modultische, die dem Gelände in Ost-West-Richtung folgen, Nachführungen sowie die elektrische Planung (Strings, Leitungen, Wechselrichter) in CivilCraft. Der Bereich Solar-PV von BimCraft enthält Strings und das Einliniendiagramm für Dächer.
