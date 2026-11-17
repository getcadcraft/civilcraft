---
title: Neuerungen in 0.9
summary: Vorlagen für Korridore und Gelände, Fangfunktionen und Auswahlschaltflächen beim Zeichnen, GIS-Analyse mit Attributtabelle, Schatten-, Solarertrags-, Komfort- und Windstudien für ein Grundstück, eine 3D-Ansicht Rendern sowie die Add-ons Punktwolken und WaterCraft.
keywords: neuerungen, 0.9, Versionshinweise, Korridorvorlagen, Geländevorlagen, Vorlageneditor, Regelquerschnitt, mehrere Korridore, Fang, Fänge, Auswahl, verschieben, kopieren, drehen, Tangente, rendern, 3D-Rendern, GIS-Analyse, Puffer, Überlagerung, räumliche Verknüpfung, Attributtabelle, Nach Attribut gestalten, Schattenstudie, Solarertrag, UTCI, Außenkomfort, Windstudie, OpenFOAM, Punktwolken, LAS, LAZ, watercraft, Löschwasser, Hydrant, Wasseralter, Chlor, Bedarfe, Tooltips, Layout, Neuerungen, Versionshinweise, Änderungsprotokoll, Änderungen, 0.8, 0.8.1, Version, neue Funktionen, Regen, Regenwasser, Staunässe, Überflutung, Erdmassen, Massenausgleich, Auftrag, Abtrag, Transport, beste Route, geringste Kosten, Trasse, Rückhaltebecken, Auslass, Entleerung, Freibord, Fortschritt, Vermessung, Drohne, Halde, Adresse zum Grundstück, Flurstück, Boden, Hochwasser, Böschungsstabilität, Bishop, Setzung, Knotenpunkt, Markierung, Schilder, Sichtweite, Ausgleich, Methode der kleinsten Quadrate, Polygonzug, Tagebau, Blockmodell, Funkstrecke, Fresnel, Weiche, Kreuzungsweiche, Sprachen, Probleme, Live, DWG
from: d7ac5b14
---

Das hat sich in CivilCraft 0.9 gegenüber 0.8.1 geändert. CivilCraft 0.9 ist Teil von CadCraft Studio 0.9 und seinen acht Apps. Die großen Teile sind Vorlagen für Korridore und Gelände, Fangfunktionen beim Zeichnen, GIS-Analyse, Studien zu Sonne, Solarertrag, Komfort und Wind für ein Grundstück sowie zwei Add-ons: Punktwolken und WaterCraft.

## Neu

### Vorlagen für Korridore und Gelände

- **Korridorvorlagen.** Öffnen Sie {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Korridorvorlagen…}} (oder geben Sie {{cmd:TEMPLATES}} ein). Eine Vorlage ist ein kleiner Querschnitt mit Komponenten, Versätzen, Neigungen, Materialien und Punktcodes. Bewahren Sie sie im Projekt, in {{ui:Meine Bibliothek}} oder als Datei `.cctemplates.json` auf. Der Vorlageneditor zeigt eine Zeichnung im wahren Maßstab und listet Probleme auf, während Sie tippen.
- **Aus Vorlagen nach Station erstellen.** Wählen Sie eine Trasse und schalten Sie in ihren Eigenschaften {{ui:Aus Vorlagen nach Station erstellen}} ein. Jede Seite jedes Abschnitts hat ihre eigene Liste der Befestigungen und ihre eigene Endbedingung. Mit {{ui:Korridor hinzufügen}} unter {{ui:Korridore auf dieser Trasse}} legen Sie mehrere Korridore auf eine Trasse.
- **Geländevorlagen.** {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Geländevorlagen…}} (oder geben Sie {{cmd:TERRAINTEMPLATES}} ein) legt geschichtete Materialien wie Oberboden oder Befestigung und Unterbau auf ein Gelände, mit Fläche und Volumen je Schicht. Siehe [Korridorvorlagen und Geländevorlagen](topic:corridor-templates).

### Zeichnen

- **Fänge.** Die Werkzeuge Trasse, Plattform, Flurstück, Baukörper, Geländelinie, Messen, Grenze und Einzugsgebiet fangen an Vermessungspunkte, PIs, Ecken, Eckpunkte und Bauwerke, mit einer Beschriftung neben der Markierung. Halten Sie {{key:Alt}} für einen freien Punkt.
- **Auswahlschaltflächen, Tangente sowie Verschieben, Kopieren, Drehen.** Die Ecken von Plattformen, Flurstücken und Geländelinien haben eingetippte Felder für Rechtswert und Hochwert sowie eine Auswahlschaltfläche mit Fadenkreuz. Die Eigenschaften enthalten außerdem {{ui:Tangente aus zwei Punkten}} für Trassen und {{ui:Verschieben, Kopieren und Drehen}} für Trassen, Plattformen, Flurstücke und Geländelinien. Siehe [Mit Fängen, gewählten Ecken sowie Verschieben, Kopieren und Drehen zeichnen](topic:draft-with-snaps).
- **Rendern-Ansicht in 3D.** Die Schaltfläche {{ui:Rendern}} in der 3D-Leiste zeichnet das Land mit natürlichen Farben, Himmel, Dunst und weichen Schatten. Das Modell ändert sich dabei nicht. Das Menü {{ui:Sonne}} hat nun die Schaltflächen {{ui:Übernehmen}} und {{ui:Schließen}}. Siehe [Das Grundstück in 3D ansehen](topic:site-3d).
- **Bereiche öffnen jeweils einen Abschnitt.** Der linke Bereich und der Bereich Eigenschaften öffnen einen Abschnitt und schließen die anderen; die Kacheln des Menübands Landschaft mit mehreren Werkzeugen sind geteilte Schaltflächen.

### GIS-Analyse

- **Analysieren.** {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Analysieren}} bietet Puffer, Überlagerung, räumliche Verknüpfung, Auswahl nach Attribut oder Form sowie Messen. Jedes Werkzeug erstellt eine neue Ebene in einem Rückgängig-Schritt.
- **Attributtabelle.** Das Dreipunkt-Menü einer Ebene enthält {{ui:Attributtabelle…}} und {{ui:Nach Attribut gestalten…}}. Siehe [GIS-Ebenen analysieren](topic:gis-analysis) und [Mit der Attributtabelle einer Ebene arbeiten](topic:gis-table).

### Das Grundstück: Sonne, Solar, Komfort und Wind

- **Bereich Umgebung.** Wählen Sie einen Baukörper: Der Bereich {{ui:Umgebung}} steht in seinen Eigenschaften unter {{ui:Sonnenstunden}}. Er enthält eine Schattenstudie (Karte, Tabelle, Animation, CSV), den Solarertrag aus einer Wetterdatei eines typischen Jahres (.epw) und den Außenkomfort (UTCI).
- **Wind, nur zur Vorprüfung.** {{ui:Windstudie ausführen}} färbt den Boden von „sitzen“ bis „unbequem“ für jede Windrichtung in der Wetterdatei. Sie ist nicht validiert, und der Bereich sagt das.
- **Fußgängerwind (OpenFOAM-Add-on).** Aus, bis Sie es in {{ui:Einstellungen}} › {{ui:Add-ons}} einschalten. OpenFOAM ist Software, die Sie selbst installieren. Siehe [Schatten, Solarertrag und Außenkomfort](topic:environment).

### Punktwolken (Add-on)

- Schalten Sie {{ui:Punktwolken}} in {{ui:Einstellungen}} › {{ui:Add-ons}} ein; eine Registerkarte Punktwolken erscheint im rechten Bereich. Öffnen Sie eine LAS- oder LAZ-Datei, bereinigen Sie sie, sortieren Sie sie in Boden, Vegetation und Gebäude, erstellen Sie Gelände, Höhenlinien und Volumen und exportieren Sie LAS oder LAZ. Siehe [Punktwolken von einer Drohne oder einem Scanner](topic:point-clouds).

### WaterCraft (Add-on)

- Schalten Sie {{ui:WaterCraft (Wasserverteilung)}} in {{ui:Einstellungen}} › {{ui:Add-ons}} ein; eine Registerkarte WaterCraft erscheint. Sie bietet Bedarfe von Kunden, Löschwasser an jedem Hydranten, welcher Leitungsausfall am meisten wiegt, sowie Wasseralter und Chlor, jeweils als CSV gespeichert. Siehe [WaterCraft: Bedarfe, Löschwasser, Ausfälle und Wasseralter](topic:watercraft).

### Zusammenarbeit

- In einer Live-Sitzung sehen Sie die Cursor und Namen der anderen im Plan. Bibliothekspflanzen: CivilCraft Landschaft startet aus seiner Standardsammlung Bibliothek, {{ui:CivilCraft-Landschaft}}.

## In jeder App

- Hinweise erscheinen als Bootstrap-Tooltips, und der Starttipp lässt sich schließen.
- Eine Registerkartenleiste eines Bereichs, die nicht passt, scrollt, statt abgeschnitten zu werden.
- Browser-Tab-Titel lauten `<Dokument> - CivilCraft | CadCraft`.
- {{ui:Einstellungen}} hat einen Bereich Layout, in dem die Layouts ein Auswahlmenü aus zweizeiligen Optionen sind.
- Gewichts- und Temperatureinheiten befinden sich unter {{ui:Einstellungen}} › {{ui:Global}} › {{ui:Einheiten}}.
- Die Sprachliste zeigt die Sprachen, für die der Build Dateien hat. Andere Sprachen als Englisch sind maschinelle Entwürfe.

## Behoben

- Die Zusatzmodule Adresssuche und EnergyPlus-Prüfung ließen sich nicht einschalten; nun geht es.
- Die Hilfe sagt jetzt, dass das Add-on Punktwolken eine bereinigte Wolke als LAS 1.4 oder LAZ schreibt.
- Ein Klick auf den eigenen Griff des ausgewählten Objekts startet keinen Griffzug mehr, der ein wartendes Auswählen beendete.

## Ehrliche Grenzen

- Die Beispiel-Korridorvorlagen sind Platzhalter ohne Norm; ein Ingenieur muss sie prüfen. Geländevorlagen fügen keine Oberfläche hinzu und werden weder in 3D noch in der Querschnittsansicht gezeichnet. Der zweite Korridor einer Trasse ist nicht im IFC-Export enthalten. Es gibt keine Verjüngung zwischen zwei Vorlagen nach Station.
- Punktwolken wurden an erfundenen Dateien getestet, nicht an einer echten Drohnenvermessung. Nur LAS und LAZ werden gelesen.
- Die GIS-Analyse wurde an erfundenen Ebenen getestet.
- Schatten, Solar und Komfort sind Planungsschätzungen; Wind ist eine ungeprüfte Vorprüfung. Nichts davon ist ein Entwurfswert.
- WaterCraft ist eine Berechnungshilfe, geprüft an erfundenen Netzen. Ein Wasserbau-Ingenieur entscheidet, was die Zahlen wert sind.
- Sprachen außer Englisch sind maschinelle Entwürfe, bis ein Muttersprachler sie liest.
- Windows-Installationsprogramme sind nicht code-signiert, und das macOS-Abbild ist nicht notariell beglaubigt.

## Früher: 0.8 und 0.8.1

Das hat sich in CivilCraft 0.8 (2026-11-01) und 0.8.1 (2026-11-02) gegenüber 0.7 geändert. Die großen neuen Teile sind Werkzeuge, die Ihre Modellierung und Ihr Grundstück prüfen (Regen, Erdmassen, Routen, Becken, Fortschritt), und sechs Berechnungsfenster für Gelände, Straßen, Vermessung, Bergbau, Funkstrecken und Bahn.

### Neu

**Modellierung prüfen**

- **Regen simulieren.** {{ui:Regen simulieren…}} (unter {{ui:Geländemodell}}) lässt einen Sturm auf das modellierte Gelände fallen. Sie sehen, wie das Wasser von den Plattformen abläuft, sich in den tiefen Ecken staut und die zu kleinen Becken überläuft. Der Lauf ist animiert und liefert die Volumen, den Spitzenabfluss und eine CSV-Datei aller Becken. Die Standardzelle ist grob, damit ein erster Blick schnell geht; eine feinere Zelle dauert länger. Becken, die überlaufen, erscheinen auch im Bereich Probleme.
- **Erdmassenausgleich.** {{ui:Erdmassenausgleich…}} hebt oder senkt eine Plattform, bis Abtrag gleich Auftrag ist, und zeigt die Transporttabelle zwischen beiden.
- **Beste Route.** {{ui:Beste Route…}}: Wählen Sie einen Anfang und ein Ende; CivilCraft findet den günstigsten Weg über das Gelände, der Ihre Grenzen für Neigung und Krümmung einhält, und erstellt daraus eine Trasse.
- **Rückhaltebecken.** {{ui:Rückhaltebecken…}} ermittelt Stufe und Speicher aus Ihrem Gelände, nimmt Auslassbauwerke (Blende, Wehr, V-Kerbe, Überlauf), leitet einen Sturm durch das Becken und prüft den zurückgehaltenen Spitzenabfluss, die Entleerungszeit und den Freibord.
- **Fortschritt aus Vermessungen.** {{ui:Fortschritt aus Vermessungen…}} vergleicht Drohnen- oder Scanoberflächen von verschiedenen Terminen mit dem Gelände, wie es war, und mit der Planung: Prozent fertig nach Volumen, zu tief und zu hoch ausgehobene Bereiche, Halden und wann die Arbeit bei diesem Tempo fertig ist (als Schätzung markiert).

**Das Grundstück kennen**

- **Adresse zum Grundstück.** {{ui:Adresse zum Grundstück…}} bringt offene Daten zu Flurstück, Gebäude, Planungsrecht, Boden, Hochwasser und Gelände auf einem Grundstück zusammen. Sie können das Grundstück in der Projektdatei behalten: die eingegebene Adresse, jede Quelle mit dem Tag des Abrufs und ihrer Lizenz sowie das Ergebnis. Öffnen oder teilen Sie das Projekt erneut, und das Grundstück ist noch da, ohne dass etwas neu abgerufen wird. Sie können es auch als Grundstücksdatei speichern oder an BimCraft senden. Siehe [Adresse zum Grundstück](topic:address-to-site).

**Gelände, Straßen, Vermessung, Bergbau, Verbindungen und Bahn**

- **Böden und Böschungen.** {{ui:Böden und Böschungen…}} zeichnet das Bodenprofil zwischen Bohrungen, die Sie eingeben. Das Verfahren nach Bishop sucht dann den kritischen Kreis auf Ihrem Gelände, mit einem Grundwasserspiegel, einer Zusatzlast und einem Erdbebenbeiwert; die Setzung eines Fundaments umfasst Konsolidierung, Sofortsetzung und Zeit.
- **Knotenpunkte und Markierungen.** {{ui:Knotenpunkte und Markierungen…}} verbindet Zufahrten mit Bordsteinbögen (ein Radius je Zufahrt oder dreizentrige Bögen), die Sichtweite für die Entwurfsgeschwindigkeit, eine Prüfung der Sichtdreiecke, Fußgängerüberwege, Haltelinien, Markierungen und Schilder mit einer Schilderliste. Sie werden im Plan gezeichnet und als .dxf mit benannten Ebenen gespeichert.
- **Vermessungsausgleich.** {{ui:Vermessungsausgleich…}} führt einen Ausgleich nach der Methode der kleinsten Quadrate für einen Polygonzug oder ein Netz durch: ausgeglichene Koordinaten, Fehlerellipsen, den Chi-Quadrat-Test und eine Markierung der Messung, die nicht passt. Freie Netze, das Schließen eines Polygonzugs nach der Kompassregel und RW5-, GSI-, JobXML- oder CSV-Felddateien sind enthalten, und die ausgeglichenen Punkte lassen sich als CSV speichern.
- **Tagebaue.** {{ui:Tagebaue…}} macht aus Bohrproben ein Blockmodell und die endgültige Grube innerhalb Ihres Böschungswinkels, mit dem Abraumverhältnis, einer Tabelle nach Bank sowie einer Gehalts- und Tonnagekurve. Verschachtelte Gruben nach Erlösfaktor und ein Förderplan mit einem abgezinsten Cashflow sind ebenfalls enthalten.
- **Funkstrecken.** {{ui:Funkstrecken…}} prüft die Sichtverbindung über Ihr Gelände unter Berücksichtigung der Erdkrümmung, der ersten Fresnel-Zone, der Linkbilanz, der Fadingreserve und des Ausfalls durch Mehrwegeausbreitung und gibt die Masthöhe an, die den Pfad freihält. Es berechnet außerdem Glasfaser-Dämpfungsbudgets, Mengen für Trassen und den Wind auf einen Mast.
- **Weichen.** {{ui:Weichen…}} erstellt eine Weiche aus ihrer Herzstückzahl, Kreuzungsweichen zwischen parallelen Gleisen und ein Lichtraumprofil, das durch Überhöhung geneigt und in einem Bogen verbreitert wird. Eine Weiche kann an einer Station einer Trasse liegen.

Siehe [Böden, Knotenpunkte, Vermessungsausgleich, Tagebaue, Funkstrecken und Weichen](topic:soils-roads-survey-mines-links).

### In jeder App

- **Sprachen.** 54 Sprachen, davon zehn neu. Sprachen außer Englisch sind maschinelle Entwürfe, bis ein Muttersprachler sie liest. Die Hilfethemen sind meist noch auf Englisch.
- **Symbolleistenzeilen.** {{ui:Einstellungen}} › {{ui:Allgemein}} › {{ui:Symbolleistenzeilen}}: Umbrechen (wie zuvor), 2 Zeilen oder 1 Zeile. Das Menüband von CivilCraft zeigt das meistgenutzte Werkzeug groß, die nächsten klein und den Rest hinter dem Pfeil des Gruppennamens.
- **Eingabegeräte.** Trackpad, Stift, 3D-Maus, Controller und MIDI können die Apps steuern.
- **Probleme.** Ein Bereich Probleme, der in jeder App warnt, mit Prüfungen, die Regelwerkspakete lesen.
- **Live.** Eine Ansicht, wer wo ist, in einer Live-Sitzung.
- **Add-ons.** Eine Liste der Add-ons, mit Beleuchtungs-Add-ons.
- **Verbinden Sie Ihre KI.** Jeder Assistent, den Sie verbinden, kann die Werkzeuge von CivilCraft steuern. Er enthält einen Hinweis, dass das Verbinden mit einem Klick in CadCraft Studio und der gehostete Konnektor noch nicht bereit sind. Siehe [Einen KI-Assistenten mit Ihrem Grundstück arbeiten lassen](topic:assistants).

### Behoben in 0.8.1

- **Abschnitt Klassen in DWG.** Er wurde als falscher Typ gelesen (GitHub cadcraft#5). Behoben in CivilCraft zusammen mit CadCraft, BimCraft, ModelCraft und TakeoffCraft.
- **Sprache während des Betriebs wechseln.** CadCraft Studio und die gepackten Ausgaben können die Sprache zur Laufzeit wechseln. Vorher waren sie nur auf Englisch. Noch nicht auf jeder Plattform getestet: Sagen Sie uns Bescheid, wenn die Sprache sich nicht ändert.

### Noch nicht in dieser Version

- **Dies sind Berechnungshilfen.** Jedes Ergebnis in den neuen Fenstern braucht die Prüfung durch einen Ingenieur. Bodenfestigkeiten beginnen mit typischen Werten für die Bodengruppe, und das Fenster sagt das.
- **Regen simulieren.** Ein Lauf auf dem Beispielgrundstück kann im Browser bei feiner Zelle über zwei Minuten dauern. Geprüft wurde er an Handfällen und einem V-förmigen Einzugsgebiet, noch nicht an einem echten modellierten Grundstück.
- **Adresse zum Grundstück.** Es liest offene Datendateien, die Sie mitbringen, und wurde nur an unseren eigenen Dateien getestet. Bäume sind keine Quelle. Das Abrufen von Quellen für Sie wartet auf den Datenschutztext.
- **Fortschritt aus Vermessungen.** Nur an erfundenen Vermessungen getestet. Fortschritt auf Blättern und Markierungen (MarkupCraft) sowie Abgleich von Scan und Modell (BimCraft) sind nicht umgesetzt.
- **Böden und Böschungen.** Nur kreisförmige Flächen: keine Keil- oder Blocksuche und kein Zugriss.
- **Knotenpunkte.** Ein Radius je Zufahrt, keine Schleppkurven für Lastwagen, und sie gehen noch nicht in den Korridor.
- **Felddateien.** Die Leser wurden nach öffentlichen Formatbeschreibungen geschrieben und an Dateien getestet, die wir selbst erstellt haben. Echte Dateien von Messgeräten werden gesucht.
- **Verbindungen und Bahn.** Funkstrecken: nur Freiraumdämpfung und Mehrwegeausbreitung (kein Regenschwund und keine Antennendiagramme), und kein Bahnstandard: jede Bahngrenze ist ein Platzhalter mit Entwurfswerten, die kein Bahningenieur geprüft hat.
- **Windows und macOS.** 0.8 ist nicht code-signiert. Windows warnt möglicherweise, und macOS verlangt Rechtsklick und dann Öffnen.

Alles Übrige steht unter [Noch nicht umgesetzt](topic:not-built-yet). Zur früheren Version siehe [Neuerungen in 0.7](topic:whats-new-0-7).
