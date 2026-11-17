---
title: Einen Garten entwerfen, von Anfang bis Ende
summary: Die zehn Schritte des Landschaftsarchitekten, von der Vermessung bis zum veröffentlichten Satz, mit dem, was der Arbeitsbereich Landschaft heute für jeden Schritt leistet und was er noch nicht kann.
keywords: Anleitung, Schritt-für-Schritt-Anleitung, Gartenentwurf, Landschaftsplanung, Einstieg, Beispiel, Vermessung, Linien, Gelände, Bepflanzung, Listen, Blätter, veröffentlichen, ein Projekt
from: 87900bf5
---

Ein Landschaftsentwurf läuft im Kreis: Vermessung, Skizze, Linien, Gelände, Flächen, Höhen, Bepflanzung, Listen, Blätter und wieder zurück. Dies sind die zehn Schritte mit dem, was es für jeden davon gibt. Wo ein Schritt eine Lücke hat, wird sie am Ende unter **Noch nicht umgesetzt** genannt und nicht im Schritt versteckt.

Sie können dem Beispielgelände folgen oder Ihrer eigenen Vermessungszeichnung. Mit eigenen Daten beginnen Sie bei Schritt 1.

## 1. Die Vermessung einlesen

{{ui:Geländemodell}} › {{ui:Linien aus einer Zeichnung …}}, wählen Sie die Vermessungszeichnung (DWG 2000–2018 oder DXF). Prüfen Sie die Einheiten, übernehmen Sie für das Geländemodell die Höhenlinien, 3D-Polylinien und die Grenze, und die Punktblöcke als Vermessungspunkte. Der Abschnitt **Vermessungshöhen und Prüfung** liest Höhen, die als Text oder als Attribut geschrieben sind, und listet auf, was verdächtig aussieht (Einheiten, Koordinatensystem, Abstand vom Nullpunkt, flache Höhenlinien, ungewöhnliche Höhen, doppelte Punkte), bevor Sie etwas hinzufügen. Siehe [Vermessungszeichnung beim Import prüfen](topic:survey-check) und [DWG oder DXF als Linien öffnen](topic:open-dwg-dxf). Legen Sie das Koordinatensystem mit {{ui:Koordinatensystem …}} fest.

## 2. Handskizzen

Ein Blatt auf Papier, etwa eine alte Vermessung oder ein markierter Ausdruck, wird mit {{ui:Scan…}} (Aus einem Scan beginnen) eingelesen: Es wird maßstabsgerecht oder auf bekannten Koordinaten unter den Plan gelegt und kann in Linien nachgezeichnet werden. ModelCraft liest ein Foto einer Handskizze (Datei › Skizzenfoto importieren…). CivilCraft selbst hat kein Werkzeug für Handskizzen: Legen Sie das Blatt unter den Plan und zeichnen Sie darüber.

## 3. Von der Skizze zu den Linien

Zeichnen Sie Feature-Linien und Umrisse über der Vermessung in CivilCraft oder zeichnen Sie sie in der 2D-Zeichnung. Landschaft › Mehr › {{ui:Aus einer Linie}} macht aus einer Linie Pflaster, eine bepflanzte Fläche, eine Mauer, Stufen, eine Feature-Linie und mehr, verknüpft gehalten: Verschieben Sie die Linie, folgt das Objekt. Siehe [Objekte aus Linien](topic:objects-from-lines). In SuperCad Studio öffnen Sie das Gelände, die Zeichnung und das Gebäudemodell in einem Projekt: Der Arbeitsbereich **Landschaft** hat die Werkzeuge aller drei, und eine in der 2D-Zeichnung gewählte Linie kann zu einem Landschaftsobjekt werden, das ihr folgt (Ctrl+K, {{ui:Landschaftsobjekt aus der gewählten Zeichnungslinie}}).

## 4. Das geplante Gelände

Öffnen Sie {{ui:Geländemodell}} › {{ui:Mehr}} › {{ui:Arbeitsbereich Landschaft}}. Bauen Sie das geplante Gelände mit {{ui:Plattform}}, {{ui:Erdwall}}, {{ui:Mulde}} und Geländebereichen mit Höhenpunkten und Höhenlinien auf; das Pflaster, die Wege, Mauern, Rampen und Stufen, die Sie hinzufügen, werden in dieselbe geplante Oberfläche eingearbeitet. Das vorhandene Gelände ändert sich nie. {{ui:Höhen}} › {{ui:Geländeänderungen…}} listet alles auf, was das Gelände formt, in einer Reihenfolge, mit Abtrag und Auftrag für jedes. Siehe [Geländemodellierung](topic:landscape-grading) und [Geländeänderungen und Live-Höhen](topic:ground-modifiers).

## 5. Pflaster und bepflanzte Flächen

{{ui:Befestigte Flächen}} › {{ui:Pflaster}}, {{ui:Weg}}, {{ui:Mauer}}, {{ui:Bordstein}}, {{ui:Rampe}} und {{ui:Stufen}}. {{ui:Flächen}} zeichnet einen Rasen, ein Beet, eine Wiese oder Bodendecker mit seinem Aufbau; er passt sich automatisch an Pflaster, Mauern und Stufen an. {{ui:Beet}} füllt eine Fläche im Pflanzabstand aus einer Mischung von Pflanzen. Siehe [Befestigte Flächen](topic:hardscape), [Bepflanzte Flächen](topic:planted-areas) und [Bepflanzung](topic:planting).

## 6. Höhen, Neigungen und Übergänge

Aktivieren Sie unter **Geländeprüfungen** die **Neigungsanalyse** und **Fließpfeile und Wasserstau**. Staut sich Wasser an einer Terrasse, legen Sie eine {{ui:Mulde}} rundherum an. Die Eigenschaften zeigen Ihnen, wie viele Setzstufen die {{ui:Stufen}} benötigen und ob sie passen, und wo ein Weg steiler ist als sein Grenzwert. Der Problembereich listet auf, wo Objekte schlecht aufeinandertreffen: eine Mauer, die überragt wird, ein Beet über dem Pflaster, Stufen, die ihr Podest verfehlen. {{ui:Höhenpunkt}} und {{ui:Gefällepfeil}} beschriften das Gelände und aktualisieren sich selbst.

## 7. Bepflanzung

Suchen Sie unter **Pflanzen** in der Pflanzenliste (einige hundert Arten oder Ihrer eigenen Liste), wählen Sie eine aus und dann {{ui:Pflanze}}, {{ui:Beet}} oder {{ui:Hecke}}. Stellen Sie Größe und Beschriftungen der Pflanze unter Mehr ein. Mehr › {{ui:Pflanzentabelle}} bearbeitet Ihre eigenen Datensätze: Sorten, gelieferte Größen, Dichte, Spezifikationshinweise. Jeder Datensatz kann Ihr eigenes Symbol und Ihr eigenes 3D-Modell enthalten (OBJ, STL oder GLB), und Mehr › {{ui:Pflanzendarstellung}} zeichnet Pflanzen bei kleineren Maßstäben vereinfacht. Siehe [Die Pflanzenliste](topic:plant-list), [Pflanzendatensätze](topic:plant-records) und [Pflanzendarstellung](topic:plant-graphics).

## 8. Mengen und Listen

Mehr › {{ui:Auswertungen}}: Die Listen der Pflanzen und der befestigten Flächen sowie Ihre eigenen bleiben mit den Objekten verknüpft; speichern Sie sie als CSV oder XLSX oder setzen Sie sie auf die Blätter (siehe [Auswertungen](topic:worksheets)). Mehr › {{ui:Pflanzenliste…}} sendet die Anzahlen an TakeoffCraft. Die Mengen der befestigten Flächen stehen in den Eigenschaften von Pflaster, Mauer und Stufen. Die Bewässerung hat eine eigene Stückliste: {{ui:Bewässerung}} › **System prüfen…**. Siehe [Bewässerung](topic:irrigation).

## 9. Zeichnungen und Blätter

Mehr › {{ui:Landschaftsblätter…}}: Bepflanzungs-, Geländemodellierungs- und Bewässerungspläne, mit Details. {{ui:Höhen}} › {{ui:Schnittlinie}} zeichnet Schnitte durch das Gelände, Mauern, Aufbauten, Stufen und Pflanzen. Siehe [Landschaftsblätter](topic:landscape-sheets) und [Schnitte und der Veröffentlichungssatz](topic:landscape-sections).

## 10. Veröffentlichen

{{ui:Veröffentlichungssatz (.zip)}} im Dialogfeld Blätter erstellt eine PDF-Datei mit einer Blattliste und eine DWG-Datei je Blatt. Mehr › {{ui:Landschafts-IFC exportieren}} übergibt BimCraft die Pflanzen und die befestigten Flächen. Speichern Sie das Projekt: Alles steckt in der einen Datei.

## Eine Sache ändern: die Treppe

Der Sinn, alles in einem Projekt zu halten, ist, dass sich eine Änderung durchzieht. Probieren Sie es aus mit einem Treppenlauf zwischen zwei Terrassen:

1. Zeichnen Sie die Linie des Treppenlaufs als Feature-Linie (oder als Linie in der Zeichnung), dann Landschaft › Mehr › {{ui:Aus einer Linie}} › {{ui:Stufen}}. Aktivieren Sie in den Eigenschaften der Stufen **Formt das Gelände** und legen Sie die unteren und oberen Höhen auf die beiden Terrassen fest.
2. Zeichnen Sie mit {{ui:Flächen}} ein bepflanztes Beet neben und unter dem Treppenlauf sowie Pflaster auf den Terrassen. Das Beet passt sich automatisch um die Stufen und das Pflaster an, und die Pflanzenliste zählt nur, was tatsächlich gepflanzt ist.
3. Erhöhen Sie in den Eigenschaften die obere Höhe des Treppenlaufs. Das geplante Gelände, die Höhenpunkte, die Gefällepfeile sowie Abtrag und Auftrag ändern sich sofort. Trifft der Treppenlauf die obere Terrasse nicht mehr, sagt der Problembereich, um wie viel.
4. Verschieben Sie die Linie des Treppenlaufs. Die Stufen folgen ihrer Linie im selben Rückgängig-Schritt; das Beet passt sich erneut an und wird neu gezählt, und die Auswertungen und Listen zeigen die neuen Zahlen.
5. Drücken Sie einmal Ctrl+Z: Linie, Stufen, Gelände und Beet kehren gemeinsam zurück.

Siehe [Geländeänderungen und Live-Höhen](topic:ground-modifiers), [Bepflanzte Flächen](topic:planted-areas) und [Auswertungen](topic:worksheets).

## Noch nicht umgesetzt

Diese werden gewünscht, sind aber in dieser Version nicht enthalten:

- Mauern, die das Gelände formen (sie melden, wo sie darauf treffen, und ihre Oberkante kann ihm folgen).
- Bearbeiten Ihrer eigenen Pflanzenliste aus der Bibliothek in der App (bearbeiten Sie die Liste des Projekts und speichern Sie sie als Pflanzendatei).
- Texturen und Farben Ihrer eigenen GLB-Pflanzenmodelle (die Form wird gelesen; die Farbe der Pflanze wird verwendet).

Alle Werkzeuge finden Sie unter [Der Arbeitsbereich Landschaft](topic:landscape).
