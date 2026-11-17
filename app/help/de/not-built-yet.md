---
title: Noch nicht umgesetzt
summary: Was dieser Build von CivilCraft noch nicht kann und was Sie heute stattdessen tun können.
keywords: fehlend, Einschränkungen, Fahrplan, nicht verfügbar, Klothoiden, Verbreiterung, DWG, DXF, Einläufe, Rückhaltung, Querprofile, kommt später, Grenzen
from: a2d970ef
---

CivilCraft ist in einer frühen Phase. Diese Seite listet auf, was der aktuelle Build nicht kann, damit Sie danach nicht suchen müssen. Für nichts davon gibt es einen zugesagten Termin.

## Punkte

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Zwei Punktdateien zusammenführen | Die Dateien zuerst in einem Texteditor oder einer Tabellenkalkulation zusammenführen |
| Eine Textdatei mit Punkten exportieren | LandXML exportieren (Punkte werden als CgPoints ausgegeben), den GIS-{{ui:Exportieren}} verwenden (Punkte mit den Feldern P, N, E, Z und D) oder die Punkte mit {{ui:Kopieren}} in eine Tabellenkalkulation übernehmen |
| Beschriftungsstile für Punkte, Symbole je Beschreibungsschlüssel, Bögen aus Linien-Codes, eine Beschreibungsschlüssel-Datei zur Weitergabe zwischen Projekten | Beschriftungen zeigen Nummer, Höhe und Beschreibung oder weniger ([Einstellungen von CivilCraft](topic:settings)); Schlüssel werden in der Projektdatei gespeichert |
| Einheitenumrechnung | Die Datei vor dem Import umrechnen; **Einheiten** beschriftet nur neu |

## Geländemodelle

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Mehr als ein aus Punkten erstelltes Geländemodell | Ein Projekt je Geländemodell |
| (Innere) Grenzen ausblenden | **Längste äußere Kante** oder eine äußere Grenze verwenden |
| Eine gezeichnete Bruchkante wählen oder bearbeiten | {{key:Mod+Z}}, oder {{ui:Gezeichnete Bruchkanten entfernen}} und neu zeichnen |
| Ein aus LandXML gelesenes Geländemodell bearbeiten (Bruchkanten, Grenze) | {{ui:Geländemodell aus den Punkten neu erstellen}} |
| Ein aus einem Höhenraster erstelltes Geländemodell bearbeiten | Das Raster mit anderen Optionen erneut importieren |
| Ein aus LandXML gelesenes Geländemodell umrechnen, wenn sich das Koordinatensystem ändert | Zuerst {{ui:Geländemodell aus den Punkten neu erstellen}} |
| Beschriftete Höhenkoten und Neigungswerte | In der Statusleiste ablesen oder das Gelände mit **Neigungsanalyse** im Arbeitsbereich Landschaft nach Neigung einfärben ([Geländemodellierung für Landschaft](topic:landscape-grading#grading-checks)) |

## Trassen und Längsschnitte

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Spiralen außer Klothoiden; eine Spirale zwischen zwei Bögen (zusammengesetzte Übergänge) | Klothoiden an den Enden eines Bogens sind verfügbar; die übrigen werden beim LandXML-Import benannt und übersprungen |
| Einen PI zwischen zwei anderen einfügen | Die Trasse neu zeichnen oder die PI-Koordinaten neu eingeben |
| Trassen aus Objekten, Versätzen, Verbreiterungen | Mit PIs zeichnen |
| K für eine Ausrundung eingeben | L eingeben (K wird angezeigt) |
| Kreisförmige und unsymmetrische Ausrundungen | Nur symmetrische Parabel-Ausrundungen |
| Mehr als ein Entwurfslängsschnitt je Trasse | Eine Trasse je Variante |
| Zoomen der Längsschnittansicht, Längsschnittbänder unter dem Längsschnitt | Die Längsschnittansicht passt die ganze Trasse ein; plotten Sie sie auf [Lageplan- und Längsschnittblättern](topic:plan-profile-sheets) |
| Schnitte in DWG oder LandXML | Schnittblätter als PDF; {{ui:CSV}} der Flächen und Volumen |
| Schnittlinien im Winkel oder mit unterschiedlichen Breiten entlang der Straße | Eine Breite je Seite für die ganze Trasse |

## Korridore

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Mittelstreifen, Leitplanken und eine Querneigung, die Regelquerschnitte dreht | Als Regelquerschnitte zeichnen ([Regelquerschnitte für Korridore](topic:corridor-templates)); Regelquerschnitte nach Station übernehmen die Querneigung noch nicht |
| Ein allmählicher Wechsel zwischen den Regelquerschnitten zweier Abschnitte (Übergänge, Verziehungen) | Den Regelquerschnitt an einer Station wechseln, oder einem als Verziehung gezeichneten Linienzug ein Breitenziel an einem Punkt geben |
| Drehung um eine Kante, Querneigung in LandXML | Die Querneigung dreht bei Kreisbögen um die Mittelachse; eine Fahrspur mit einem Breitenziel zur Feature-Linie verbreitern |
| Vorgaben für die Böschungen (Böschungsschnittpunkt zu einer Linie oder einer Fläche), eigene Korridoroberflächen | Vorgaben verschieben die Kanten von Fahrbahn und Bankett ([Korridore](topic:corridor)); der Korridor wird in das Planungsgelände eingearbeitet |
| Korridore als LandXML-Straßen exportiert; ein zweiter Korridor an einer Trasse im IFC-Export | Das Planungsgelände wird exportiert |
| Geländeschablonen, die das Planungsgelände ändern, in 3D oder in den Schnitten | Sie liefern Flächen und Volumen je Schicht ([Geländeschablonen](topic:corridor-templates#terrain-templates)) |
| Schleppkurven mit Geschwindigkeit, Reifenschlupf, Lenkzeit, Lenkanhängern oder Fahrzeugüberhang; eine Bibliothek mit Standard-Bemessungsfahrzeugen; eine Schleppkurve, die durch Ziehen des Fahrzeugs gezeichnet wird | Schleppkurven bei niedriger Geschwindigkeit entlang einer Feature-Linie oder Trasse mit eigenen Fahrzeugmaßen ([Schleppkurven für Fahrzeuge](topic:swept-paths)) |

## Modellierung und Massen

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Bermen, offene Feature-Linien, die in den Entwurf eingearbeitet werden, Modellierung bis zu einer Feature-Linie von anderswo | Die Feature-Linie schließen ([Feature-Linien](topic:feature-lines)) oder als Bruchkante des Bestandsgeländes verwenden |
| Einen Eckpunkt einer Feature-Linie einfügen oder entfernen | Die Linie neu zeichnen oder einen gestuften Versatz davon erstellen |
| Bögen in gezeichneten Bruchkanten (durch Vermessungspunkte), Spiralen in Feature-Linien | Eine Feature-Linie mit Bögen zeichnen und als Bruchkante des Bestandsgeländes verwenden |
| Modellierung auf eine Entfernung, Höhe oder eine andere Fläche | Nur Böschungsschnittpunkt zum Bestandsgelände |
| Eine Bauplatz-Ecke hinzufügen oder entfernen | Den Bauplatz löschen und neu zeichnen |
| TIN-zu-TIN-Volumen (Prisma), Wahl der Rastergröße | Rastermethode, die Zellgröße wird für Sie gewählt |
| Auflockerung und Verdichtung, Oberboden, Befestigungsstärken | Faktoren selbst auf die ausgegebenen Werte anwenden |
| Freitransport- und Überführungskosten, Transport über verschiedene Trassen, auf dem Plan platzierte Entnahmestellen und Deponien | Das Massenlinien-Diagramm mit Ausgleichspunkten, bewegten Volumen und mittleren Transportweiten |

## Rohrnetze

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Mehr als ein Netz je Projekt | Eigene Projekte für Regenwasser und Schmutzwasser |
| Wasserleitungen: Wasserqualität und Alter, regelbasierte Steuerungen, andere Armaturentypen (Durchflussregelung, Drossel, Halteventil), Pumpen mit Leistungsangabe, vom Druck abhängige Entnahme, eine Darcy–Weisbach-Option, ein Rohrkatalog mit Wandstärken und Druckstufen. Der Rest der Druckrohrnetze ist im Labor: [Wasserleitungen](topic:water-mains) | Diese in einer Software für Wasserverteilung prüfen; Schmutzwasser-Bemessungsabflüsse stehen in [Schmutzwasser-Bemessungsabflüsse](topic:sanitary-design) |
| Kanalabflüsse über die Zeit (Ganglinien, dynamische Abflussberechnung, Speicher, Pumpen, Überläufe) | [Schmutzwasser-Bemessungsabflüsse](topic:sanitary-design) liefert den stationären Spitzenabfluss, den ein Bemessungsblatt verwendet |
| Einlaufleistung, Rinnenausbreitung, Rückhalte-Abflussberechnung, Ganglinien, Energieverluste außer einem Knotenbeiwert | In anderer Software prüfen; Abflüsse, Dimensionen und Drucklinien stehen in [Regenwasserentwässerung](topic:storm-drainage) |
| Einzugsgebiete im PDF-Plot, DWG, DXF oder LandXML; Einzugsgebiete aus dem Geländemodell (Wasserscheiden) | Einzugsgebiete von Hand zeichnen; sie werden in der Projektdatei gespeichert |
| Rohrkataloge, nicht runde Rohre, Bauwerke, die keine stehenden Kästen oder Zylinder sind (Kegel, Stufen, Berme), eine Entwässerungskategorie in der Bibliothek | Bauwerkstypen aus Parametern ([Rohrnetz](topic:pipe-network)); Rohre mit einem Durchmesser |
| Rohre in der Längsschnittansicht, gekrümmte Rohre | Sohlen und Überdeckung im rechten Bereich ablesen |

## Flurstücke

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Baugrundstücke nach Fläche oder Frontlänge anordnen, Flurstücke aus den umgebenden Linien, Straßenland | Jedes Flurstück über seine Ecken zeichnen oder seine Angaben eingeben |
| Kurventabellen und Linientabellen auf dem Plan; von Hand verschobene Beschriftungen | Jeder Grenzabschnitt ist entlang seiner selbst beschriftet |
| Flurstücke in LandXML | Flurstücke werden in der Projektdatei gespeichert und gehen in PDF, DWG und DXF |

## Polygonzüge

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Ausgleichung nach kleinsten Quadraten, Transitregel, Gewichtung der Winkel gegen die Strecken | Die Kompassregel |
| Deflexionswinkel, Zenitwinkel und Schrägstrecken, Höhen durch trigonometrische Höhenmessung | Auf horizontale Strecken und rechtsdrehende Winkel reduzieren, oder Richtungswinkel verwenden |
| Seitenaufnahmen, Rohdatendateien von Datenerfassungsgeräten | Die Punkte als Punktdatei importieren |

## Absteckung

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Versatzpfähle (Bezugspunkte hinter der Absteckung), Böschungspfähle am Einbindepunkt | An den nötigen Versätzen abstecken, auch hinter dem Bankett |
| Absteckpunkte direkt im eigenen Format des Datenerfassungsgeräts ausgeben | Die CSV-Datei öffnet sich in der Büro-Software der meisten Datenerfassungsgeräte |
| Rohre, Bauplätze und Flurstücke abstecken | Vermessungspunkte nahe einer Trasse oder die Grenzabschnitte des Flurstücks verwenden |

## Dateien und Ausgabe

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Text, Schraffuren und Bemaßungen aus DWG oder DXF; Papierbereich; externe Referenzen (Xrefs); binäres DXF | Linien aus dem Modellbereich werden geöffnet ([DWG oder DXF als Linien öffnen](topic:open-dwg-dxf)); externe Referenzen separat öffnen |
| Mehrere Punkte gleichzeitig durch Ziehen verschieben | Ausschneiden und Einfügen, oder einzeln bearbeiten |
| Hochformat-Blätter, eigene Schriftfelder, selbst angeordnete Ansichtsfenster, Lageplan- und Längsschnittblätter in DWG | Ein Lageplanblatt im Querformat je PDF, oder Lageplan- und Längsschnittblätter entlang einer Trasse (PDF) |
| Plotten von Höhenbändern und Längsschnitten | Bänder gibt es nur am Bildschirm; bei Bedarf einen Bildschirmfoto machen |
| Layer-Namen, Farben oder Beschriftungsstile ändern | Nach dem DXF-Export in einem CAD-Programm ändern |
| Cloud-Speicherung und Versionsverlauf | `.civilcraft.json`-Dateien speichern und sichern; um gemeinsam an einem Projekt zu arbeiten, eine Live-Sitzung in CadCraft Studio nutzen ([Ein Gelände gemeinsam live planen](topic:work-live)) |
| CadCraft Studio für iPad und iPhone sowie aus Google Play | CivilCraft im Browser auf dem Gerät verwenden; unter Android wird CadCraft Studio aus seiner APK-Datei auf getcadcraft.com/download installiert |
| Mehrere Punkt- oder Projektdateien gleichzeitig öffnen | Eine Datei je Öffnen (GIS-Dateien, die zusammengehören, etwa die Teile einer Shapefile, werden gemeinsam geöffnet) |

## Landschaft

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Sprinklerköpfe und Düsen der Hersteller | Allgemeine Sprinklerköpfe, oder eigene aus einer Datei hinzufügen; Herstellerdaten werden übernommen, sobald diese freigegeben werden |
| Maximale Seitenlängen für Tropfleitungen, Abflüsse über die Zeit, Pumpen, vermaschte Rohrnetze | Tropfstrecken auf die vom Hersteller angegebene Länge begrenzen; die Prüfung braucht ein verzweigtes Netz |
| Der genaue Umriss eines konkaven Freiform-Objekts; sein unterirdisches Volumen exakt gemessen | Die konvexe Hülle wird modelliert, und das unterirdische Volumen ist eine Schätzung (sie wird in den Eigenschaften angegeben) |
| Pflanzen in der eigenen Funktion „Aus Bibliothek platzieren“ von BimCraft und ModelCraft | Landschafts-IFC exportieren und neben dem Gebäude in BimCraft öffnen |
| Detaillierte Pflanzenmodelle (Blätter, Äste, Jahreszeiten) in der 3D-Ansicht; Freiform-Objekte und Bewässerung in der 3D-Ansicht | Pflanzen erscheinen in 3D als einfache Formen, deren Größe aus der Pflanzenliste stammt ([Gelände in 3D ansehen](topic:site-3d)); das Streuwerkzeug von ModelCraft erzeugt Pflanzbilder |
| Hartflächen-Stützwände, die ein modelliertes Niveau dahinter auf der Oberfläche halten | Einem Podest oder Bauplatz senkrechte Seiten geben: sie sind Stützmauern auf der Oberfläche ([Geländemodellierung](topic:grading)) |
| SVG-Transformationen in eigenen Symbolen; Texturen und Farben eigener GLB-Pflanzenmodelle; komprimierte GLB-Geometrie | Transformationen zuerst im Zeichenprogramm auflösen; Modelle werden in der Farbe der Pflanze gezeichnet; die GLB ohne Komprimierung exportieren ([Pflanzengrafiken](topic:plant-graphics)) |
| Eigene Pflanzenliste im Bibliothekskonto (in der App bearbeitet) | Die eigene Liste des Projekts in der Pflanzentabelle bearbeiten und als Pflanzendatei speichern |
| Die Landschaftswerkzeuge für Assistenten ohne Fenster (der Dateiserver und die Befehlszeile) | Sie funktionieren, wenn das Fenster von CivilCraft geöffnet ist ([Einen KI-Assistenten mit Ihrem Gelände arbeiten lassen](topic:assistants)) |

## Freileitungen

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Der Standard eines Landes fest eingebaut (Lastfälle, Abstände, Faktoren) | Die Werte Ihres Standards in {{ui:Lastfälle und Grenzwerte…}} festlegen und zusammen mit Ihrer Bibliothek als Paket speichern, um es wiederzuverwenden und weiterzugeben ([Pakete](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Der seitliche Abstand von einem Leiterseil zu einer Baumkrone oder einer Wand neben der Leitung | Der lotrechte Abstand über Pflanzen und Wänden, die die Leitung kreuzt ([Freileitungsprüfungen](topic:power-line-checks#clearances)) |
| Seilkriechen und die Dehnung eines neuen Leiterseils | Dafür über die Temperaturen in der Seilspannungstabelle Reserve einplanen |
| Thermische Auslegung von Erdkabeln (Strombelastbarkeit aus der Verlegeart) | Die Strombelastbarkeit Ihres Lieferanten am Kabelelement eingeben |
| Kurzschluss-, Schutz- und Erdungsberechnungen | Ein eigenes Elektroprogramm verwenden; CivilCraft liefert die Netzlängen und Kabel |
| Gittermasten, Stab für Stab bemessen, und Abspannanker im Boden | Masten werden über ihre Nennlast geprüft; Abspannungen über ihre Bemessungslast |
| Eine `.DON`-Studiendatei, geprüft in dem Programm, das sie liest | Die Datei dort prüfen; senden Sie uns ein Beispiel, damit wir mit einer echten Datei testen können |
| Freileitungen in der 3D-Ansicht und in IFC | Der Plan, das Leitungsprofil, die Blätter und die GIS-Layer |
| Die Freileitungswerkzeuge für Assistenten ohne Fenster | Sie funktionieren, wenn das Fenster von CivilCraft geöffnet ist ([Einen KI-Assistenten mit Ihrem Gelände arbeiten lassen](topic:assistants)) |

## Baukörper

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Eine Bibliothek mit Bauplanungsvorschriften oder den Regeln einer Stadt | Die Grenzwerte aus Ihrer eigenen Satzung eingeben ([Baugrenzwerte](topic:zoning-limits)) |
| Himmelslicht auf den Wänden (Fassadentageslicht), Wind | [Sonnenstunden](topic:sun-hours) zählt nur direkte Sonne |
| Schatten von Bäumen, Pflanzen oder allem, was nicht als Baukörper gezeichnet ist | Nachbargebäude als Baukörper zeichnen |
| Dachformen an Baukörpern | Baukörper mit flachem Abschluss |
| Öffnungen, Dächer und Wandtypen, wenn ein Baukörper in BimCraft ausgearbeitet wird | BimCraft erstellt auf jedem Geschoss einfache Außenwände; das Übrige dort ergänzen |

## GIS und Koordinatensysteme

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| File Geodatabase; KML-Stile, Symbole, Bodenüberlagerungen und Netzwerkverknüpfungen | Zuerst in GeoPackage, Shapefile oder GeoJSON umwandeln; KML-Platzmarken werden ohne ihre Stile gelesen |
| GIS-Objekte oder deren Attribute bearbeiten | In einem GIS-Programm bearbeiten und erneut importieren. Der Bereich Analysieren erstellt neue Layer (Puffer, Überlagerung, Verbindung, Auswahl) und ergänzt Flächen- und Längenfelder, bearbeitet ein Objekt aber nicht direkt |
| Netzwerk- und Rasteranalyse, Puffer mit flachen oder quadratischen Enden und einseitige Puffer, Zeilen hinzufügen oder löschen und den Feldtyp in der Attributtabelle ändern, manuelle Klassenfarben, eine Stil-Legende in Plots | Wählen verwenden, um Objekte auszuwählen und daraus einen Layer zu erstellen; flache Enden werden nicht angeboten. Einfärben nach Attribut und die Attributtabelle sind vorhanden: siehe [Einen Layer nach einem Attribut gestalten](topic:gis-symbology) und [Mit der Attributtabelle eines Layers arbeiten](topic:gis-table) |
| Beschriftungsstile (Größe, Platzierung) und Beschriftungen, die einander ausweichen | Beschriftungen haben eine Größe und können sich überlappen, wo Objekte dicht liegen |
| Höhenbezugssysteme und Geoidmodelle | Höhen werden so verwendet, wie die Datei sie angibt; das Höhenbezugssystem selbst prüfen |
| Andere Gitterverschiebungen als NAD27 zu NAD83, die nach Gebiet vorgeschlagen werden (OSTN15; NTv2 für andere Bezugssysteme funktioniert, wenn Sie die Datei hinzufügen), mehrere Gitter gleichzeitig, vertikale Gitter | Die Gitterdatei für Ihr Bezugssystem selbst hinzufügen; ein Gitter je Projekt |
| Kartenlayer in DXF- oder 3D-Exporten | Kartenlayer gehen in den PDF-Plot und neben die DWG als Bild |
| Kartenserver, die eine Anmeldung, einen Schlüssel oder ein Token brauchen | Öffentliche Dienste verwenden oder eine georeferenzierte Bilddatei |
| LAS- oder LAZ-Dateien aus einem Geländemodell oder mit den Höhenraster- und LiDAR-Werkzeugen schreiben | Geländemodelle als GeoTIFF-Höhenraster exportieren. Das Add-on [Punktwolken](topic:point-clouds) schreibt eine bereinigte Wolke als LAS 1.4 oder LAZ |
| LiDAR-Intensität, Farbe und Echos; Höhenraster mit mehreren Bändern; Raster- oder LiDAR-Dateien über 200 MB | LiDAR wird nur nach Klasse gefiltert, Raster verwenden ihr erstes Band; große Dateien vorher in Kacheln schneiden |

## Eingabe

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Auswahlrahmen per Touch (dafür wird {{key:Shift}} benötigt) | Jeden Vermessungspunkt lange antippen, um ihn hinzuzufügen |
| Koordinaten oder Strecken beim Zeichnen eingeben | Grob zeichnen, dann genaue PI-Koordinaten in der PI-Tabelle der Trasse eingeben |
| Koordinaten für Bauplatz-Ecken und Bauwerke eingeben | Ihre Griffe ziehen; für Genauigkeit hineinzoomen und E und N in der Statusleiste beobachten |
| Objektfang an Objekten (außer an Vermessungspunkten für Bruchkanten) | Hineinzoomen und die Statusleiste beobachten |

## 3D-Ansicht

| Noch nicht umgesetzt | Stattdessen heute |
|---|---|
| Zeichnen oder Bearbeiten in der 3D-Ansicht | Im Plan zeichnen und bearbeiten; die 3D-Ansicht folgt jeder Änderung |
| Korridor-Feature-Linien oder GIS-Objekte per Klick in 3D wählen | Sie im Plan anklicken |
| Die überhöhte Ansicht oder in Fuß exportieren | Exporte sind maßstabsgetreu in Metern; siehe [Gelände in 3D exportieren](topic:export-3d) |
| Beschriftungen in GLB- oder OBJ-Exporten, Beschriftungsgrößen und -stile in 3D | Beschriftungen erscheinen nur in der 3D-Ansicht, in einer Größe; siehe [Gelände in 3D ansehen](topic:site-3d) |
| Texturen aus Fotos, Aufzeichnung einer Fahrt als Video, Schatten von außerhalb des Geländes, Sonnenstunden in der 3D-Ansicht | Kartenlayer auf die Oberflächen gelegt; Fahrt und Sonnenstand zu einem Zeitpunkt; [Sonnenstunden](topic:sun-hours) für einen Tag oder eine Jahreszeit im Plan |
