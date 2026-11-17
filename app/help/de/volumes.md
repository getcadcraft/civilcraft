---
title: Erdmassen
summary: Abtrag, Auftrag und Nettomassen zwischen dem bestehenden Gelände und der geplanten Fläche lesen, pro Bauplatz und Korridor sowie insgesamt, und die Rastermethode dahinter verstehen.
keywords: Erdmassen, Erdarbeiten, Abtrag, Auftrag, Netto, Abtrag und Auftrag, Mengen, Rastermethode, Flächenvergleich, Volumenfläche, Kubikyard, Kubikmeter
from: 299d7bc7
---

Sobald ein Bauplatz oder ein Korridor ohne Probleme modelliert ist, vergleicht CivilCraft die geplante Fläche mit dem bestehenden Gelände und meldet Abtrag und Auftrag. Die Zahlen aktualisieren sich bei jeder Änderung.

## Wo Sie sie lesen

- **Erdarbeiten** im rechten Bereich, wenn nichts ausgewählt ist (die Ansicht **Projekt**), sobald mindestens ein Bauplatz oder ein Korridor vorhanden ist.
- **Erdarbeiten** im rechten Bereich, wenn ein Bauplatz ausgewählt ist (dieselben Summen für das ganze Projekt).
- Die Zeile unter den Einstellungen eines Korridors mit dessen eigenem Abtrag und Auftrag.

Der Block **Erdarbeiten** zeigt:

- **Abtrag**, **Auftrag** und **Netto** (mit „Auftrag“ oder „Abtrag“ dahinter, je nachdem, was größer ist)
- eine Zeile pro Element, wenn es mehr als eins gibt, zum Beispiel „Bauplatz 1: Abtrag 120.4 cu yd, Auftrag 310.2 cu yd“
- die Methodenzeile: „Rastermethode: bestehendes Gelände und die modellierte Fläche alle 0.5 ft innerhalb der Böschungsschnittlinien abgetastet (92,891 Zellen). Kein Auflockerungs- oder Schrumpfungsfaktor angewendet.“

Massen werden in Kubikyard in einem Fuß-Projekt und in Kubikmetern in einem Meter-Projekt angegeben.

## An TakeoffCraft senden

Um die Erdarbeiten zu bepreisen, wählen Sie unten im Block **Erdarbeiten** {{ui:An TakeoffCraft senden}}. CivilCraft speichert eine Mengendatei (`<site>.quantities.json`) mit zwei Mengen: Abtrag und Auftrag, in Kubikyard (Fuß-Projekt) oder Kubikmetern (Meter-Projekt), dieselben Zahlen wie im Block, auf zwei Nachkommastellen gerundet. Öffnen Sie sie in TakeoffCraft mit **Mengenermittlung öffnen** oder ziehen Sie sie dorthin: Es werden zwei Positionen daraus, die Sie bepreisen können ([Abtrag und Auftrag aus CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Senden Sie nach einer Änderung erneut und öffnen Sie die neue Datei: Dieselben Positionen erhalten die neuen Zahlen.

Nur die Summen werden gesendet, damit nichts doppelt gezählt wird; die Notiz der Datei listet den eigenen Abtrag und Auftrag jedes Bauplatzes und Korridors auf.

## Wie sie berechnet werden

CivilCraft verwendet die **Rastermethode**:

1. Über die Fläche innerhalb jeder Böschungsschnittlinie wird ein Raster quadratischer Zellen gelegt.
2. In der Mitte jeder Zelle werden beide Flächen abgetastet.
3. Jede Zelle zählt als Prisma: der Höhenunterschied mal die Fläche der Zelle. Wo die modellierte Fläche tiefer liegt, ist es Abtrag; wo sie höher liegt, Auftrag.
4. Die Zellen werden addiert.

Die Zellgröße wird für Sie so gewählt, dass das Rechteck um die modellierten Bereiche etwa 250,000 Zellen enthält, gerundet auf einen glatten Wert (1, 2 oder 5 mal eine Zehnerpotenz). Selbst einstellen können Sie sie noch nicht. Die Methodenzeile nennt Ihnen die Größe und die Anzahl der Zellen. Kleinere Zellen sind an den Rändern genauer; bei ganzen Zellen zwischen ebenen Flächen ist das Ergebnis exakt.

## Wissenswertes

- Nur die Fläche innerhalb der Böschungsschnittlinien wird gezählt. Gelände außerhalb bleibt unverändert.
- Ein Bauplatz oder Korridor mit einem Problem wird nicht eingerechnet und trägt nichts bei. Wenn der Block „Noch keine Erdmassen: Ein Bauplatz muss ohne Probleme modelliert werden.“ sagt, suchen Sie einen roten Kasten darüber.
- Wo Elemente sich überlappen, hat das spätere das frühere innerhalb seiner Böschungsschnittlinie ersetzt, und die Überlappung wird einmal gezählt.
- Es wird kein Auflockerungs- oder Schrumpfungsfaktor angewendet. Multiplizieren Sie die Ergebnisse selbst, wenn Sie anstehende, lose oder verdichtete Massen brauchen.
- Oberbodenabtrag, Tiefen von Befestigung und Unterbau sowie Prismenvolumen TIN-zu-TIN sind noch nicht verfügbar.

## Ein Ergebnis prüfen

- Schalten Sie {{ui:Geplant (modelliert)}} unter **Anzeige** ein und sehen Sie sich die Höhenlinien innerhalb der Böschungsschnittlinien an.
- Bewegen Sie den Zeiger über die modellierte Fläche: Die Statusleiste zeigt **Gelände** und **Modelliert**. Die Differenz ist die Abtrags- oder Auftragstiefe an dieser Stelle.
- Für einen Korridor zeigt die Anzeige des Längsschnitts Abtrag oder Auftrag auf der Mittellinie an jeder Station.
