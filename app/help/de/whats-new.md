---
title: Neuigkeiten in 0.8 und 0.8.1
summary: CivilCraft 0.8 bringt Regen simulieren (ein Sturm über Ihre Geländemodellierung), einen Erdmassenausgleich, die Suche nach der besten Route, Rückhaltebecken, Fortschritt aus Vermessungen, einen Import von Adressen zu Grundstücken, der das Grundstück im Projekt behält, und Fenster für Böden und Böschungen, Knotenpunkte und Markierungen, Vermessungsausgleich, Tagebaue, Funkstrecken und Weichen. 0.8.1 behebt, wie DWG-Dateien gelesen werden.
keywords: whats new, what's new, Neuigkeiten, Was ist neu, Versionshinweise, Änderungsprotokoll, Änderungen, 0.8, 0.8.1, Version, neue Funktionen, Regen, Sturm, Stauung, Überströmung, Erdmassen, Ausgleich, Abtrag und Auftrag, Transport, beste Route, geringste Kosten, Trasse, Rückhaltebecken, Auslauf, Absenkung, Freibord, Fortschritt, Vermessung, Drohne, Halde, Adresse zum Grundstück, Flurstück, Boden, Hochwasser, Böschungsstabilität, Bishop, Setzung, Knotenpunkt, Markierung, Schilder, Sichtweite, Ausgleichung, kleinste Quadrate, Polygonzug, Tagebau, Blockmodell, Funkstrecke, Fresnel, Weiche, Sprachen, Probleme, live, DWG
from: b0932cf0
---

Das ist, was sich in CivilCraft 0.8 (2026-11-01) und 0.8.1 (2026-11-02) gegenüber 0.7 geändert hat. Die großen neuen Teile sind Werkzeuge, mit denen Sie Ihre Geländemodellierung und Ihr Grundstück prüfen (Regen, Erdmassen, Routen, Becken, Fortschritt), und sechs Berechnungsfenster für Gelände, Straßen, Vermessung, Tagebau, Funkstrecken und Schiene.

## Neu

### Ihre Geländemodellierung prüfen

- **Regen simulieren.** {{ui:Make it rain…}} (unter {{ui:Surface}}) lässt einen Sturm auf das modellierte Gelände fallen. Sie sehen, wie das Wasser von den Bauplätzen abfließt, sich in den tiefen Ecken staut und die zu kleinen Rückhaltebecken überströmt. Der Lauf ist animiert und liefert die Volumina, den Spitzenabfluss und eine CSV-Datei mit allen Becken. Die Standardzelle ist grob, damit ein erster Blick schnell geht; eine feinere Zelle dauert länger. Becken, die überströmen, erscheinen auch im Bereich „Probleme“.
- **Erdmassenausgleich.** {{ui:Earthwork balancer…}} hebt oder senkt einen Bauplatz, bis Abtrag gleich Auftrag ist, und zeigt dazwischen die Transporttabelle.
- **Beste Route.** {{ui:Best route…}}: Wählen Sie Anfang und Ende. CivilCraft findet den günstigsten Weg quer durch das Gelände, der Ihre Neigungs- und Krümmungsgrenzen einhält, und erstellt daraus eine Trasse.
- **Rückhaltebecken.** {{ui:Detention ponds…}} ermittelt Wasserstand und Speicher aus Ihrem Gelände, nimmt Auslaufbauwerke auf (Blende, Wehr, V-Kerbe, Überlauf), leitet einen Sturm durch das Becken und prüft den zurückgehaltenen Spitzenabfluss, die Entleerungszeit und den Freibord.
- **Fortschritt aus Vermessungen.** {{ui:Progress from surveys…}} vergleicht Drohnen- oder Scanoberflächen von verschiedenen Terminen mit dem Gelände, wie es war, und mit der Planung: Fertigstellungsgrad nach Volumen, zu tief ausgehobene und zu hoch aufgefüllte Bereiche, Halden und das voraussichtliche Ende der Arbeiten bei diesem Tempo (als Schätzung gekennzeichnet).

### Das Grundstück kennen

- **Adresse zum Grundstück.** {{ui:Address to site…}} führt offene Daten zu Flurstück, Gebäude, Flächennutzung, Boden, Hochwasser und Gelände auf einem Grundstück zusammen. Sie können das Grundstück in der Projektdatei behalten: die eingegebene Adresse, jede Quelle mit dem Tag des Abrufs und ihrer Lizenz sowie das Ergebnis. Öffnen oder teilen Sie das Projekt erneut, ist das Grundstück noch da, ohne dass etwas erneut abgerufen wird. Sie können es auch als Grundstücksdatei speichern oder an BimCraft senden. Siehe [Adresse zum Grundstück](topic:address-to-site).

### Gelände, Straßen, Vermessung, Bergbau, Funk und Schiene

- **Böden und Böschungen.** {{ui:Soils and slopes…}} zeichnet das Bodenprofil zwischen den Bohrungen, die Sie eingeben. Das Bishop-Verfahren sucht dann den kritischen Gleitkreis im Gelände, mit Grundwasserspiegel, Auflast und Erdbebenbeiwert; die Setzung eines Fundaments umfasst Konsolidierung, Sofortsetzung und Zeit.
- **Knotenpunkte und Markierungen.** {{ui:Junctions and striping…}} setzt Schenkel mit Bordsteinrundungen zusammen (ein Radius je Schenkel oder dreizentrische Rundungen), die Sichtweite für die Entwurfsgeschwindigkeit, eine Prüfung der Sichtdreiecke, Fußgängerüberwege, Haltelinien, Markierungen und Schilder mit einer Schilderliste. Sie werden im Plan gezeichnet und als .dxf mit benannten Layern gespeichert.
- **Vermessungsausgleich.** {{ui:Survey adjustment…}} führt eine Ausgleichung nach der Methode der kleinsten Quadrate für einen Polygonzug oder ein Netz durch: ausgeglichene Koordinaten, Fehlerellipsen, den Chi-Quadrat-Test und eine Markierung bei jeder Messung, die nicht passt. Freie Netze, das Schließen eines Polygonzugs nach der Kompassregel sowie Felddateien in RW5, GSI, JobXML oder CSV sind enthalten, und die ausgeglichenen Punkte lassen sich als CSV speichern.
- **Tagebaue.** {{ui:Open pits…}} macht aus Bohrproben ein Blockmodell und die endgültige Grube innerhalb Ihres Böschungswinkels, mit Abraumverhältnis, einer Tabelle nach Etage sowie einer Gehalts-Tonnage-Kurve. Verschachtelte Gruben nach Erlösfaktor und ein Produktionsplan mit abgezinstem Cashflow sind ebenfalls enthalten.
- **Funkstrecken.** {{ui:Radio links…}} prüft die Sichtverbindung über Ihr Gelände unter Berücksichtigung der Erdkrümmung, der ersten Fresnel-Zone, der Linkbilanz, der Schwundreserve und des Mehrwegeausfalls und ermittelt die Masthöhe, die die Strecke freimacht. Außerdem berechnet es Dämpfungsbilanzen für Glasfaser, Streckenmengen und die Windlast auf einen Turm.
- **Weichen.** {{ui:Rail turnouts…}} erstellt eine Weiche aus ihrer Herzstücknummer, Gleisverbindungen zwischen parallelen Gleisen und ein Lichtraumprofil, das durch die Überhöhung geneigt und in einer Kurve verbreitert wird. Eine Weiche kann an einer Station einer Trasse liegen.

Siehe [Böden, Knotenpunkte, Vermessungsausgleich, Tagebaue, Funkstrecken und Weichen](topic:soils-roads-survey-mines-links).

## In jeder App

- **Sprachen.** 54 Sprachen, davon zehn neu. Andere Sprachen als Englisch sind maschinelle Entwürfe, bis eine Person mit dieser Muttersprache sie gelesen hat. Die Hilfethemen sind noch überwiegend auf Englisch.
- **Symbolleistenzeilen.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Umbrechen (wie bisher), 2 Zeilen oder 1 Zeile. Das Menüband von CivilCraft zeigt das meistgenutzte Werkzeug groß, die nächsten klein und den Rest hinter dem Pfeil des Gruppennamens.
- **Eingabegeräte.** Trackpad, Stift, 3D-Maus, Controller und MIDI können die Apps steuern.
- **Probleme.** Ein Bereich „Probleme“, der in jeder App warnt, mit Prüfungen anhand von Regelwerken.
- **Live.** Eine Ansicht, wer bei einer Live-Sitzung wo ist.
- **Add-ons.** Eine Liste der Add-ons, darunter Beleuchtungs-Add-ons.
- **Eigene KI anbinden.** Jeder Assistent, den Sie anbinden, kann die Werkzeuge von CivilCraft steuern. Er wird mit dem Hinweis ausgeliefert, dass das Verbinden mit einem Klick in CadCraft Studio und der gehostete Connector noch nicht fertig sind. Siehe [Einen Assistenten mit Ihrem Grundstück arbeiten lassen](topic:assistants).

## In 0.8.1 behoben

- **DWG-Klassenabschnitt.** Er wurde als falscher Typ gelesen (GitHub cadcraft#5). In CivilCraft zusammen mit CadCraft, BimCraft, ModelCraft und TakeoffCraft behoben.
- **Sprache während des Betriebs wechseln.** CadCraft Studio und die gepackten Ausgaben können die Sprache zur Laufzeit wechseln. Vorher gab es nur Englisch. Noch nicht auf allen Plattformen getestet: Sagen Sie uns Bescheid, wenn sich die Sprache nicht ändert.

## In dieser Version noch nicht umgesetzt

- **Dies sind Berechnungshilfen.** Jedes Ergebnis in den neuen Fenstern braucht die Prüfung durch einen Ingenieur. Die Bodenfestigkeiten gehen von Richtwerten für die Bodengruppe aus, und das Fenster weist darauf hin.
- **Regen simulieren.** Ein Lauf auf der Beispielfläche kann im Browser bei feiner Zelle über zwei Minuten dauern. Er wurde an Handrechnungen und einem V-förmigen Einzugsgebiet geprüft, noch nicht an einer echten modellierten Baustelle.
- **Adresse zum Grundstück.** Es liest offene Datendateien, die Sie mitbringen, und wurde nur an eigenen Dateien getestet. Bäume sind keine Quelle. Das Abrufen von Quellen für Sie wartet auf den Datenschutztext.
- **Fortschritt aus Vermessungen.** Nur an erfundenen Vermessungen getestet. Fortschritt auf Blättern und Markierungen (MarkupCraft) sowie Scan gegen Modell (BimCraft) sind nicht umgesetzt.
- **Böden und Böschungen.** Nur kreisförmige Gleitflächen: keine Keil- oder Blocksuche und keine Zugrisse.
- **Knotenpunkte.** Ein Radius je Schenkel, keine Schleppkurven für Lkw, und sie fließen noch nicht in den Korridor ein.
- **Felddateien.** Die Leser wurden nach öffentlichen Formatbeschreibungen geschrieben und an selbst erstellten Dateien ausprobiert. Echte Gerätedateien werden benötigt.
- **Funkstrecken und Schiene.** Funkstrecken: nur Freiraumdämpfung und Mehrwege (keine Regendämpfung oder Antennendiagramme), und kein Bahnstandard: jeder Grenzwert für die Schiene ist ein Platzhalter mit Entwurfswerten, die noch kein Bahningenieur geprüft hat.
- **Windows und macOS.** 0.8 ist nicht codesigniert. Windows warnt möglicherweise, und macOS verlangt Rechtsklick und dann Öffnen.

Alles Weitere steht unter [Noch nicht umgesetzt](topic:not-built-yet). Zur früheren Version siehe [Neuigkeiten in 0.7](topic:whats-new-0-7).
