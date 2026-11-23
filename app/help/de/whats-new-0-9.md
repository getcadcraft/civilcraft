---
title: Neu in 0.9 (früher)
summary: Korridor- und Geländevorlagen, Einrasten und Abgreifen-Schaltflächen beim Zeichnen, GIS-Analyse mit Attributtabelle, Schatten-, Solar-, Komfort- und Windstudien für ein Gelände, eine 3D-Renderansicht sowie die Add-ons Punktwolken und WaterCraft.
keywords: neu in 0.9, früheres Release, Neuerungen, 0.9, Versionshinweise, Korridorvorlagen, Geländevorlagen, Vorlageneditor, Regelquerschnitt, mehrere Korridore, Einrasten, Fang, Abgreifen, Verschieben, Kopieren, Drehen, Tangente, Rendern, 3D-Rendern, GIS-Analyse, Puffer, Überlagerung, räumliche Verknüpfung, Attributtabelle, nach Attribut gestalten, Schattenstudie, Solarertrag, UTCI, Außenkomfort, Windstudie, OpenFOAM, Punktwolken, LAS, LAZ, WaterCraft, Löschwasser, Hydrant, Wasseralter, Chlor, Bedarfe, Tooltips, Layout, Neuerungen, Versionshinweise, Änderungen, 0.8, 0.8.1, Version, neue Funktionen, Regen, Regenwasser, Überflutung, Erdmassen, Ausgleich, Abtrag und Auftrag, Förderung, beste Route, geringste Kosten, Trasse, Rückhaltebecken, Auslauf, Absenkung, Freibord, Fortschritt, Vermessung, Drohne, Halde, Adresse zum Grundstück, Flurstück, Boden, Hochwasser, Böschungsstabilität, Bishop, Setzung, Knotenpunkt, Markierungen, Schilder, Sichtweite, Ausgleichung, kleinste Quadrate, Traverse, Tagebau, Blockmodell, Funkstrecke, Fresnel, Weiche, Kreuzungsweiche, Sprachen, Probleme, live, dwg
from: 4664522c
---

Das ist, was sich in CivilCraft 0.9 gegenüber 0.8.1 geändert hat. CivilCraft 0.9 ist Teil von CadCraft Studio 0.9 und seinen acht Apps. Die großen Teile sind Korridor- und Geländevorlagen, Einrasten beim Zeichnen, GIS-Analyse, Studien zu Sonne, Solarertrag, Komfort und Wind auf einem Gelände sowie zwei Add-ons: Punktwolken und WaterCraft.

## Neu

### Korridor- und Geländevorlagen

- **Korridorvorlagen.** Öffnen Sie {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Korridorvorlagen…}} (oder geben Sie {{cmd:TEMPLATES}} ein). Eine Vorlage ist ein kleiner Querschnitt mit Komponenten, Versätzen, Neigungen, Materialien und Punktcodes. Bewahren Sie sie im Projekt, in {{ui:Meine Bibliothek}} oder als `.cctemplates.json`-Datei auf. Der Vorlageneditor zeigt eine Zeichnung im wahren Maßstab und listet Probleme auf, während Sie tippen.
- **Aus Vorlagen nach Station erstellen.** Wählen Sie eine Trasse und schalten Sie in ihren Eigenschaften {{ui:Aus Vorlagen nach Station erstellen}} ein. Jede Seite jedes Abschnitts hat ihre eigene Fahrbahnliste und ihren eigenen Endzustand. {{ui:Korridor hinzufügen}} unter {{ui:Korridore auf dieser Trasse}} setzt mehrere Korridore auf eine Trasse.
- **Geländevorlagen.** {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Geländevorlagen…}} (oder {{cmd:TERRAINTEMPLATES}} eingeben) legt geschichtete Materialien wie Oberboden oder Fahrbahn und Unterbau über ein Gelände, mit Fläche und Volumen je Schicht. Siehe [Korridorvorlagen und Geländevorlagen](topic:corridor-templates).

### Zeichnen

- **Einrasten.** Die Werkzeuge Trasse, Bauplatz, Flurstück, Massen, Feature-Linie, Messen, Grenze und Einzugsgebiet rasten an Vermessungspunkte, PIs, Ecken, Knoten und Bauwerke ein, mit einer Beschriftung am Marker. Halten Sie {{key:Alt}} für einen freien Punkt.
- **Abgreifen-Schaltflächen, Tangente sowie Verschieben, Kopieren, Drehen.** Ecken von Bauplätzen, Flurstücken und Feature-Linien haben Felder für Rechtswert und Hochwert sowie eine Schaltfläche Abgreifen mit Fadenkreuz. Die Eigenschaften haben außerdem {{ui:Tangente aus zwei Punkten}} für Trassen und {{ui:Verschieben, Kopieren und Drehen}} für Trassen, Bauplätze, Flurstücke und Feature-Linien. Siehe [Mit Einrasten, abgegriffenen Ecken sowie Verschieben, Kopieren und Drehen zeichnen](topic:draft-with-snaps).
- **Rendern-Ansicht in 3D.** Die Schaltfläche {{ui:Rendern}} auf der 3D-Leiste zeichnet das Land mit natürlichen Farben, Himmel, Dunst und weichen Schatten. Sie ändert das Modell nicht. Das Menü {{ui:Sonne}} hat jetzt die Schaltflächen {{ui:Übernehmen}} und {{ui:Schließen}}. Siehe [Das Gelände in 3D ansehen](topic:site-3d).
- **Bereiche öffnen jeweils einen Abschnitt.** Das linke Panel und das Eigenschaftenpanel öffnen einen Abschnitt und schließen die anderen, und die Ribbon-Kacheln der Landschaft mit mehreren Werkzeugen sind geteilte Schaltflächen.

### GIS-Analyse

- **Analysieren.** {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Analysieren}} bietet Puffer, Überlagerung, räumliche Verknüpfung, Auswahl nach Attribut oder Form und Messen. Jedes Werkzeug erstellt einen neuen Layer in einem Schritt für Rückgängig.
- **Attributtabelle.** Das Dreipunkt-Menü eines Layers hat {{ui:Attributtabelle…}} und {{ui:Nach Attribut gestalten…}}. Siehe [GIS-Layer analysieren](topic:gis-analysis) und [Mit der Attributtabelle eines Layers arbeiten](topic:gis-table).

### Das Gelände: Sonne, Solar, Komfort und Wind

- **Abschnitt Umgebung.** Wählen Sie eine Baumasse: Der Abschnitt {{ui:Umgebung}} liegt unter {{ui:Sonnenstunden}} in ihren Eigenschaften. Er hat eine Schattenstudie (Karte, Tabelle, Animation, CSV), Solarertrag aus einer Wetterdatei eines typischen Jahres (.epw) und Außenkomfort (UTCI).
- **Wind, nur zur Vorprüfung.** {{ui:Windstudie ausführen}} färbt das Gelände von sitzend bis unangenehm für jede Windrichtung der Wetterdatei. Sie ist nicht validiert, und das Panel sagt es.
- **Fußgängerwind-Add-on (OpenFOAM).** Aus, bis Sie es in {{ui:Einstellungen}} › {{ui:Add-ons}} einschalten. OpenFOAM ist Software, die Sie selbst installieren. Siehe [Schatten, Solarertrag und Außenkomfort](topic:environment).

### Punktwolken (Add-on)

- Schalten Sie {{ui:Punktwolken}} in {{ui:Einstellungen}} › {{ui:Add-ons}} ein; ein Reiter Punktwolken erscheint im rechten Bereich. Öffnen Sie eine LAS- oder LAZ-Datei, bereinigen Sie sie, sortieren Sie sie in Boden, Vegetation und Gebäude, erstellen Sie Gelände, Höhenlinien und Volumen, und exportieren Sie LAS oder LAZ. Siehe [Punktwolken von einer Drohne oder einem Scanner](topic:point-clouds).

### WaterCraft (Add-on)

- Schalten Sie {{ui:WaterCraft (Wasserverteilung)}} in {{ui:Einstellungen}} › {{ui:Add-ons}} ein; ein Reiter WaterCraft erscheint. Er bietet Bedarfe von Kunden, Löschwasser an jedem Hydranten, die Frage, welcher Leitungsausfall am meisten zählt, sowie Wasseralter und Chlor, jeweils als CSV gespeichert. Siehe [WaterCraft: Bedarfe, Löschwasser, Ausfälle und Wasseralter](topic:watercraft).

### Zusammenarbeit

- In einer Live-Sitzung sehen Sie die Cursor und Namen der anderen im Plan. Bibliothekspflanzen: CivilCraft-Landschaft startet mit seiner Standard-Bibliothekssammlung, {{ui:CivilCraft-Landschaft}}.

## In jeder App

- Hinweise erscheinen als Bootstrap-Tooltips, und der Starttipp lässt sich schließen.
- Eine Reiterleiste eines Panels, die nicht passt, scrollt, statt abgeschnitten zu werden.
- Browser-Tab-Titel lauten `<Dokument> - CivilCraft | CadCraft`.
- {{ui:Einstellungen}} hat einen Abschnitt Layout, in dem die Layouts eine Auswahlliste mit zweizeiligen Optionen sind.
- Gewichts- und Temperatureinheiten stehen in {{ui:Einstellungen}} › {{ui:Global}} › {{ui:Einheiten}}.
- Die Sprachliste zeigt die Sprachen, für die der Build Dateien hat. Andere Sprachen als Englisch sind maschinelle Entwürfe.

## Behoben

- Die Add-ons Adresssuche und EnergyPlus-Prüfung ließen sich nicht einschalten; jetzt geht es.
- Die Hilfe sagt jetzt, dass das Add-on Punktwolken eine bereinigte Wolke als LAS 1.4 oder LAZ schreibt.
- Ein Klick auf den eigenen Griff des gewählten Objekts startet nicht mehr einen Griffzug, der ein wartendes Abgreifen beendet.

## Ehrliche Grenzen

- Die Beispiel-Korridorvorlagen sind Platzhalter ohne Norm; ein Ingenieur muss sie prüfen. Geländevorlagen fügen keine Oberfläche hinzu und werden weder in 3D noch in der Querprofilansicht gezeichnet. Der zweite Korridor auf einer Trasse ist nicht im IFC-Export. Es gibt keine Verjüngung zwischen zwei Vorlagen nach Station.
- Punktwolken wurden an selbst erstellten Dateien getestet, nicht an einer echten Drohnenbefliegung. Nur LAS und LAZ werden gelesen.
- GIS-Analyse wurde an selbst erstellten Layern getestet.
- Schatten, Solar und Komfort sind Planungsschätzungen; Wind ist eine nicht validierte Vorprüfung. Nichts davon ist ein Bemessungswert.
- WaterCraft ist eine Berechnungshilfe, geprüft an selbst erstellten Netzen. Ein Wasseringenieur entscheidet, was die Zahlen wert sind.
- Sprachen über Englisch hinaus sind maschinelle Entwürfe.
- Windows-Installer sind nicht code-signiert, und das macOS-Image ist nicht notarisiert.

## Früher: 0.8 und 0.8.1

Das ist, was sich in CivilCraft 0.8 (2026-11-01) und 0.8.1 (2026-11-02) gegenüber 0.7 geändert hat. Die großen neuen Teile sind Werkzeuge, die Ihre Modellierung und Ihr Gelände prüfen (Regen, Erdmassen, Routen, Becken, Fortschritt), und sechs Berechnungsfenster für Gelände, Straßen, Vermessung, Bergbau, Verbindungen und Schiene.

### Neu

**Ihre Modellierung prüfen**

- **Regen simulieren.** {{ui:Regen simulieren…}} (unter {{ui:Geländemodell}}) lässt einen Sturm auf das modellierte Gelände fallen. Sie sehen, wie das Wasser von den Bauplätzen abläuft, sich in den tiefen Ecken staut und die zu kleinen Becken überläuft. Der Lauf ist animiert und liefert die Volumen, den Spitzenabfluss und eine CSV jedes Beckens. Die Standardzelle ist grob, damit ein erster Blick schnell geht; eine feinere Zelle dauert länger. Überlaufende Becken erscheinen auch im Bereich Probleme.
- **Erdmassenausgleich.** {{ui:Erdmassenausgleich…}} hebt oder senkt einen Bauplatz, bis Abtrag gleich Auftrag ist, und zeigt die Förderungstabelle zwischen ihnen.
- **Beste Route.** {{ui:Beste Route…}}: Wählen Sie einen Anfang und ein Ende, und CivilCraft findet den günstigsten Weg über das Gelände, der Ihre Neigungs- und Kurvengrenzen einhält, und erstellt daraus eine Trasse.
- **Rückhaltebecken.** {{ui:Rückhaltebecken…}} berechnet Stau und Speicher aus Ihrem Gelände, nimmt Auslasseinrichtungen (Blende, Wehr, V-Kerbe, Überlaufrinne), führt einen Sturm durch das Becken und prüft den zurückgehaltenen Spitzenabfluss, die Entleerungszeit und den Freibord.
- **Fortschritt aus Vermessungen.** {{ui:Fortschritt aus Vermessungen…}} vergleicht Drohnen- oder Scanoberflächen von verschiedenen Terminen mit dem Gelände, wie es war, und mit der Planung: prozentualer Fortschritt nach Volumen, zu tief ausgehobene und zu hoch aufgefüllte Flächen, Halden und wann die Arbeit bei diesem Tempo fertig ist (als Schätzung gekennzeichnet).

**Das Gelände kennen**

- **Adresse zum Grundstück.** {{ui:Adresse zum Grundstück…}} bringt offene Flurstücks-, Gebäude-, Bebauungs-, Boden-, Hochwasser- und Geländedaten auf einem Grundstück zusammen. Sie können das Grundstück in der Projektdatei behalten: die eingegebene Adresse, jede Quelle mit dem Tag, an dem Sie sie abgerufen haben, und ihrer Lizenz, und was zurückkam. Öffnen oder teilen Sie das Projekt erneut, und das Grundstück ist noch da, ohne dass etwas erneut abgerufen wird. Sie können es auch als Grundstücksdatei speichern oder an BimCraft senden. Siehe [Adresse zum Grundstück](topic:address-to-site).

**Gelände, Straßen, Vermessung, Bergbau, Verbindungen und Schiene**

- **Böden und Böschungen.** {{ui:Böden und Böschungen…}} zeichnet das Bodenprofil zwischen Bohrungen, die Sie eingeben. Das Verfahren nach Bishop sucht dann den kritischen Kreis auf Ihrem Gelände, mit einem Grundwasserspiegel, einer Auflast und einem Erdbebenbeiwert; die Setzung eines Fundaments berücksichtigt Konsolidierung, Sofortsetzung und Zeit.
- **Knotenpunkte und Markierungen.** {{ui:Knotenpunkte und Markierungen…}} verbindet Äste mit Bordsteinrundungen (ein Radius je Ast oder dreizentrige Rundungen), die Sichtweite für die Entwurfsgeschwindigkeit, eine Prüfung der Sichtdreiecke, Fußgängerüberwege, Haltelinien, Markierungen und Schilder mit einer Schilderliste. Sie werden im Plan gezeichnet und als .dxf mit benannten Layern gespeichert.
- **Vermessungsausgleich.** {{ui:Vermessungsausgleich…}} führt eine Ausgleichung nach der Methode der kleinsten Quadrate einer Traverse oder eines Netzes aus: ausgeglichene Koordinaten, Fehlerellipsen, den Chi-Quadrat-Test und eine Markierung der Messung, die nicht passt. Freie Netze, das Schließen einer Traverse nach der Kompassregel und RW5-, GSI-, JobXML- oder CSV-Felddateien sind enthalten, und die ausgeglichenen Punkte speichern sich als CSV.
- **Tagebaue.** {{ui:Tagebaue…}} macht aus Bohrproben ein Blockmodell und die endgültige Grube innerhalb Ihres Böschungswinkels, mit dem Abraumverhältnis, einer Tabelle nach Stufe und einer Gehalts- und Tonnagekurve. Verschachtelte Gruben nach Erlösfaktor und ein Förderplan mit einer abgezinsten Cashflow-Rechnung sind ebenfalls enthalten.
- **Funkstrecken.** {{ui:Funkstrecken…}} prüft die Sichtverbindung über Ihr Gelände mit der Erdkrümmung, der ersten Fresnel-Zone, dem Linkbudget, der Fadingreserve und dem Multipath-Ausfall und gibt die Masthöhe an, die die Strecke frei machen würde. Es rechnet auch Glasfaser-Dämpfungsbudgets, Streckenmengen und den Wind auf einen Mast.
- **Weichen.** {{ui:Weichen…}} erstellt eine Weiche aus ihrer Herzstückzahl, Kreuzungsweichen zwischen parallelen Gleisen und ein Lichtraumprofil, das durch Überhöhung geneigt und in einem Bogen erweitert wird. Eine Weiche kann an einer Station einer Trasse liegen.

Siehe [Böden, Knotenpunkte, Vermessungsausgleich, Tagebaue, Funkstrecken und Weichen](topic:soils-roads-survey-mines-links).

### In jeder App (0.8)

- **Sprachen.** 54 Sprachen, davon zehn neu. Andere Sprachen als Englisch sind maschinelle Entwürfe, bis ein Muttersprachler sie gelesen hat. Hilfethemen sind überwiegend auf Englisch.
- **Symbolleistenzeilen.** {{ui:Einstellungen}} › {{ui:Allgemein}} › {{ui:Symbolleistenzeilen}}: Umbrechen (wie zuvor), 2 Zeilen oder 1 Zeile. Das Ribbon von CivilCraft zeigt das meistgenutzte Werkzeug groß, die nächsten klein und den Rest hinter dem Pfeil am Gruppennamen.
- **Eingabegeräte.** Trackpad, Stift, 3D-Maus, Controller und MIDI können die Apps steuern.
- **Probleme.** Ein Bereich Probleme, der in jeder App warnt, mit Prüfungen, die Regelpakete lesen.
- **Live.** Eine Ansicht, wer wo in einer Live-Sitzung ist.
- **Add-ons.** Eine Liste der Add-ons, mit Beleuchtungs-Add-ons.
- **KI verbinden.** Jeder Assistent, den Sie verbinden, kann die Werkzeuge von CivilCraft steuern. Er wird mit dem Hinweis ausgeliefert, dass das Verbinden mit einem Klick in CadCraft Studio und der gehostete Connector noch nicht bereit sind. Siehe [Einen KI-Assistenten mit Ihrem Gelände arbeiten lassen](topic:assistants).

### Behoben in 0.8.1

- **Abschnitt DWG-Klassen.** Er wurde als falscher Typ gelesen (GitHub cadcraft#5). In CivilCraft zusammen mit CadCraft, BimCraft, ModelCraft und TakeoffCraft behoben.
- **Sprachwechsel während des Betriebs.** CadCraft Studio und die gepackten Ausgaben können die Sprache zur Laufzeit wechseln. Vorher gab es nur Englisch. Noch nicht auf jeder Plattform getestet: Sagen Sie uns Bescheid, wenn sich die Sprache nicht ändert.

### Noch nicht in dieser Version

- **Dies sind Berechnungshilfen.** Jedes Ergebnis in den neuen Fenstern braucht die Prüfung eines Ingenieurs. Bodenfestigkeiten starten mit typischen Werten für die Bodengruppe, und das Fenster sagt es.
- **Regen simulieren.** Ein Lauf am Beispielgelände kann im Browser bei einer feinen Zelle über zwei Minuten dauern. Er wurde gegen Handfälle und ein V-förmiges Einzugsgebiet geprüft, noch nicht an einem echten modellierten Gelände.
- **Adresse zum Grundstück.** Es liest offene Datendateien, die Sie mitbringen, und wurde nur an unseren eigenen Dateien getestet. Bäume sind keine Quelle. Das Abrufen von Quellen für Sie wartet auf den Datenschutzhinweis.
- **Fortschritt aus Vermessungen.** An selbst erstellten Vermessungen getestet. Fortschritt auf Blättern und Markierungen (MarkupCraft) sowie Vergleich von Scan und Modell (BimCraft) sind nicht umgesetzt.
- **Böden und Böschungen.** Nur kreisförmige Flächen: keine Keil- oder Blocksuche und kein Zugriss.
- **Knotenpunkte.** Ein Radius je Ast, keine Schleppkurven für Lkw, und sie gehen noch nicht in den Korridor.
- **Felddateien.** Die Leser wurden anhand öffentlicher Formatbeschreibungen geschrieben und an Dateien getestet, die wir selbst erstellt haben. Echte Gerätedateien werden gesucht.
- **Funkstrecken und Schiene.** Funkstrecken: nur Freiraumdämpfung und Multipath (kein Regenschwund oder Antennendiagramme), und kein Bahnstandard: jede Grenze für die Schiene ist ein Platzhalter mit Entwurfswerten, die kein Bahningenieur geprüft hat.
- **Windows und macOS.** 0.8 ist nicht code-signiert. Windows kann warnen, und macOS verlangt Rechtsklick und dann Öffnen.

Alles Übrige steht unter [Noch nicht umgesetzt](topic:not-built-yet). Zur früheren Version siehe [Neu in 0.7](topic:whats-new-0-7).
