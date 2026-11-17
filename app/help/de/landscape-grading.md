---
title: Modellierung für die Landschaft
summary: Plattformen, Erdwälle, Mulden und freie Modellierung mit Höhenkoten und Höhenlinien, die Sie ziehen; Abtrag und Auftrag live; Gefälleanalyse, Fließpfeile und Staunässe – alles im Planungsgelände von CivilCraft.
keywords: Stützmauer, Stützmauern, senkrechte Seite, Mauer statt Böschung, Böschung je Seite, Damm, Modellierung, Landschaftsmodellierung, Plateau, Terrasse, Erdwall, Hügel, Mulde, Höhenkote, Höhenpunkt, Höhenlinien, Höhenlinien bearbeiten, Abtrag und Auftrag, Erdarbeiten, Gefälleanalyse, Barrierefreiheit, steile Böschungen, Fließpfeile, Entwässerung, Staunässe, Pfützen
from: e1559eb9
---

Alles hier wird mit derselben Modellierung wie Plateaus und Korridore in das **Planungsgelände** modelliert. Das **Bestandsgelände** wird nie verändert, und die Erdarbeiten zählen alles. Das Menü {{ui:Grade}} ist in der Gruppe Landschaft.

## Plattformen

{{ui:Grade}} › {{ui:Platform}}, dann klicken Sie die Ecken und drücken Sie {{key:Enter}}. Die Plattform beginnt auf der mittleren Geländehöhe darunter; geben Sie eine **Höhe** ein, um sie festzulegen, oder leeren Sie das Feld, um wieder dem Gelände zu folgen. Ein **Gefälle** in % und eine **Gefällerichtung** in Grad (0 = Ost, 90 = Nord) neigen sie. Ihre Seiten werden mit der **Abtragsböschung** und der **Auftragsböschung** (horizontal zu 1) bis zum Gelände modelliert.

## Böschungen je Seite und Stützmauern

Unter **Seiten und Stützmauern** in den Eigenschaften eines Plateaus, einer Plattform oder eines Erdwalls kann jede Seite auf ihre eigene Art modelliert werden. Seite 1 verläuft vom ersten Eckpunkt, den Sie geklickt haben, zum zweiten, Seite 2 vom zweiten zum dritten und so weiter.

- **Alle Seiten**: **Geneigt** verwendet die oben genannten Abtrags- und Auftragsböschungen auf jeder Seite; **Senkrecht: Stützmauern** setzt auf jede Seite eine Mauer.
- Je Seite: **Oben festgelegte Böschungen**, **Eigene Böschungen** (geben Sie für diese Seite eine Abtrags- und eine Auftragsböschung ein) oder **Senkrecht (Stützmauer)**.
- Geben Sie eine Böschung als `3` oder `3:1` ein (horizontal zu 1 vertikal), `33%` oder `18.4°`; sie wird als H:1 angezeigt. Die eigene **Abtragsböschung** und **Auftragsböschung** des Plateaus akzeptieren dasselbe.
- Eine senkrechte Seite hat keinen Damm: Eine Stützmauer verläuft entlang der Kante, vom Plateau hinunter zum Bestandsgelände (im Auftrag) oder vom Gelände hinunter zum Plateau (im Abtrag). Die **Wanddicke** (anfangs 0.3 m oder 1 ft) ist, wie weit das Gelände von der Plateaukante zum Bestandsgelände springt. Abtrag- und Auftragsvolumen lassen den Damm weg, den diese Seite nicht mehr hat.
- Wo eine Mauer auf eine geneigte Seite trifft, läuft die Böschung um das Ende der Mauer herum; zwei Mauern treffen sich auf Gehrung.
- Unter den Feldern: Länge der Mauern, sichtbare Fläche (Höhe × Länge), größte und mittlere Höhe.

Der Plan zeichnet die Außenfläche jeder Mauer mit kurzen Strichen quer darüber und ihre Höhe an beiden Enden und an ihrem höchsten Punkt (auf dem Layer Stützmauern, der auch in DXF und DWG übergeht). Die 3D-Ansicht zeigt die Mauern als Körper (Anzeigen › Stützmauern), und die Exporte GLB, OBJ und USD enthalten sie. Schnitte über die Kante zeigen die Stufe.

**Warnungen** (in den Eigenschaften und im Bereich Probleme): Eine Mauer, die höher als **Warnung ab einer Mauerhöhe von** (anfangs 1.0 m oder 3.3 ft) ist, „kann eine von einem Ingenieur geplante Mauer oder eine Genehmigung erfordern; örtliche Regeln prüfen“. Außerdem jede Seite, deren Abtrags- oder Auftragsböschung steiler ist als die **Steilste Böschung, die der Boden hält**, wenn Sie sie eingeben. Es sind Warnungen: Die Modellierung wird trotzdem erstellt. Jede Änderung ist ein Schritt für {{key:Mod+Z}}.

## Erdwälle

{{ui:Grade}} › {{ui:Berm}}: ein Hügel, dessen Oberkante seine **Höhe** über der mittleren Geländehöhe darunter beträgt, mit Seiten, die bis zum Gelände modelliert sind.

## Mulden

{{ui:Grade}} › {{ui:Swale}}, dann klicken Sie entlang der Mulde **in Fließrichtung des Wassers** und drücken Sie {{key:Enter}}. Stellen Sie ihre **Tiefe**, **Sohlbreite** (0 für ein V) und **Böschungsneigung** ein. Ohne **Gefälle** folgt ihre Sohle dem Gelände, in ihrer Tiefe darunter, und verläuft nie bergauf; geben Sie ein Gefälle ein, um ihr von ihrem Anfang an ein gleichmäßiges zu geben.

## Höhenkoten und Höhenlinien

1. {{ui:Grade}} › {{ui:Grading area}}: Klicken Sie den Umriss des Bereichs, den Sie formen möchten.
2. {{ui:Grade}} › {{ui:Spot elevation}}: Klicken Sie innerhalb des Bereichs. Geben Sie seine Höhe in den Eigenschaften ein oder nutzen Sie die Schaltflächen ▲ ▼.
3. {{ui:Grade}} › {{ui:Edit a contour}}: Klicken Sie eine Höhenlinie innerhalb des Bereichs an, um sie als Linie zu übernehmen, die Sie umformen können.

Wählen Sie eine Höhenkote oder eine Höhenlinie und **ziehen** Sie sie (oder ihre Punkte) im Plan: Das Geländemodell folgt, wenn Sie loslassen, als ein Rückgängig-Schritt. Innerhalb des Bereichs wird das Gelände von seiner Kante neu aufgebaut (dort, wo es auf das Bestandsgelände trifft), aus den Höhenkoten und den bearbeiteten Höhenlinien.

## Abtrag und Auftrag, live

Die Eigenschaften jedes Modellierungsobjekts zeigen seinen **Abtrag** und **Auftrag** sowie die des ganzen Geländes, nach der Rastermethode, die auch die Erdarbeiten verwenden, und zwar während Sie es ändern. Probleme (außerhalb des Geländemodells, ein Umriss, der sich selbst kreuzt) werden dort aufgelistet.

## Modellierungsprüfungen

Im Bereich **Modellierungsprüfungen** links:

- Die **Gefälleanalyse** färbt das Geländemodell nach Neigung: bis zur sanften Grenze, dazwischen und steiler als die steile Grenze (anfangs 5 % und 33.3 %: das übliche 1:20 für barrierefreie Wege und 1:3 für das Mähen). Die Legende zeigt, wie viel der Fläche in jede Klasse fällt. Die steilen Bereiche werden auch auf Blättern gedruckt.
- **Fließpfeile und Staunässe** zeichnen, in welche Richtung das Wasser fließt, und umkreisen jede Stelle, an der sich Wasser sammeln würde, mit ihrer Tiefe. Der Bereich nennt die Anzahl dieser Stellen, die tiefste und wie viel Wasser sie halten.

Die Prüfungen lesen das Planungsgelände, sobald etwas modelliert ist, sonst das Bestandsgelände.
