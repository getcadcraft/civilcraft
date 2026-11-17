---
title: Landschaftsschnitte und der Veröffentlichungssatz
summary: Schnittlinien, die das vorhandene und das geplante Gelände schneiden, Mauern mit Fundamenten, Aufbauten für Pflaster und bepflanzte Flächen, Stufen und Pflanzen in ausgewachsener Größe, jeweils auf eigenen Blättern; ein Veröffentlichungssatz mit einer Blattliste, einer PDF-Datei und einer DWG-Datei je Blatt.
keywords: Schnitt, Querschnitt, Ansicht, Schnittmarkierung, Schnittlinie, Veröffentlichen, Blattsatz, Blattliste, Zeichnungsverzeichnis, PDF-Satz, DWG je Blatt
from: 7271ac50
---

{{ui:Höhen}} › {{ui:Schnittlinie}}: Klicken Sie auf den Anfang und das Ende. Schnitte erhalten die Namen A, B, C… (Sie benennen sie in den Eigenschaften um). Ein Schnitt zeichnet entlang seiner Linie:

- das vorhandene Gelände (gestrichelt) und das geplante Gelände;
- Mauern mit ihren Fundamenten, dort wo die Linie sie kreuzt;
- Pflaster- und Wegeaufbauten sowie Mulch und Oberboden bepflanzter Flächen (nach dem Zuschneiden), unterhalb der fertigen Oberfläche hängend;
- Stufen im Profil;
- Pflanzen innerhalb des eingestellten Abstands zur Linie, als Silhouetten in ausgewachsener Größe.

Über die Eigenschaften stellen Sie diesen Abstand und eine Höhenüberhöhung ein. Im Dialogfeld Blätter setzt **Schnitte** sie auf eigene Blätter, bis zu vier pro Blatt, jeweils in einem passenden Standardmaßstab.

## Der Veröffentlichungssatz

{{ui:Veröffentlichungssatz (.zip)}} im Dialogfeld Blätter erstellt in einer .zip-Datei:

- eine PDF-Datei, die mit der **Blattliste** beginnt und dann alle Landschaftsblätter enthält, nummeriert L-1, L-2… (Bepflanzung, Geländemodellierung, Bewässerung, Details, Schnitte, Auswertungen);
- eine **DWG-Datei je Planblatt** mit den Layern dieses Blatts (Namen `L-*` bleiben erhalten) und eine DWG-Datei je Schnittzeichnung.

Jede Schnittlinie im Plan zeigt an, auf welchem Blatt sie liegt (`A / L-5`). Die Nummer wird jedes Mal aus dem Satz berechnet; beim Hinzufügen, Entfernen oder Umbenennen von Schnitten werden die Nummern daher neu vergeben.
