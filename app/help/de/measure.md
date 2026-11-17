---
title: Entfernungen, Flächen und Neigungen messen
summary: Auf dem Plan durch Klicken auf Punkte messen — die Länge und der Richtungswinkel jeder Seite, die laufende Summe, die Länge entlang des Geländes, die Neigung, sowie Fläche und Umfang einer geschlossenen Form — und zwischen zwei Punkten im Längsschnitt einer Freileitung.
keywords: messen, Messung, Abstand, Länge, Fläche, Umfang, Richtungswinkel, Neigung, Gefälle, Lineal, Maßband, entlang des Geländes, Längsschnitt, Höhenunterschied
from: d614eb25
---

{{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Messen}} (auch im Menü {{ui:Mehr}} des Arbeitsbereichs Freileitungen, oder {{key:M}} drücken) misst, ohne dem Projekt etwas hinzuzufügen.

## Auf dem Plan

1. Wählen Sie {{ui:Messen}} und klicken Sie dann Punkte an. Ein Klick nahe einem Vermessungspunkt übernimmt dessen Lage und Höhe.
2. Die Statusleiste zeigt die Anzahl der Punkte und die Gesamtlänge, die Länge und den Richtungswinkel der letzten Seite, ihre Neigung, wenn das Gelände an beiden Enden bekannt ist, sowie die Länge entlang des Geländes. Neben dem Zeiger stehen die gerade gezeichnete Seite und die laufende Summe.
3. Klicken Sie den ersten Punkt erneut an, um die Form zu schließen: Die Statusleiste ergänzt dann ihre **Fläche** und ihren **Umfang**. Der nächste Klick beginnt eine neue Messung.
4. {{key:Enter}} beendet die Messung und behält ihre Werte in der Statusleiste; {{key:Backspace}} nimmt den letzten Punkt zurück; {{key:Esc}} löscht die Messung, und ein weiteres {{key:Esc}} führt zurück zu {{ui:Wählen}}.

Längen werden in der Einheit des Projekts angegeben, Flächen in dessen Quadrateinheit. Neigung und Länge entlang des Geländes beziehen sich auf das Planungsgelände, sofern vorhanden, sonst auf das Bestandsgelände; außerhalb der Oberfläche werden sie weggelassen.

## Am Profil einer Freileitung

Im [Leitungsprofil](topic:overhead-line#the-line-profile) benötigt {{ui:Messen}} in der Leiste des Profils zwei Klicks und liest den seitlichen Abstand, den Höhenunterschied, die direkte Entfernung und die Neigung zwischen ihnen ab. Ein Klick nahe dem Gelände, dem Leiterseil oder der Mastspitze rastet dort ein. Klicken Sie erneut auf {{ui:Messen}}, um zu beenden.
