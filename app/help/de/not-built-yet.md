---
title: Noch nicht umgesetzt
summary: Was diese Version von CivilCraft noch nicht kann und was Sie heute stattdessen tun können.
keywords: fehlend, Einschränkungen, Fahrplan, nicht verfügbar, Spiralen, Verbreiterung, dwg, dxf, Einläufe, Rückhaltebecken, Querprofile, kommt später, Grenzen
from: b91588d4
---

CivilCraft befindet sich in einem frühen Stadium. Diese Seite listet auf, was die aktuelle Version nicht kann, damit Sie nicht danach suchen. Für nichts hier ist ein Termin zugesagt.

## Punkte

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Eine zweite Punktdatei zur ersten hinzufügen | Die Dateien vorher in einem Texteditor oder einer Tabellenkalkulation zusammenführen |
| Eine Punkttextdatei exportieren | LandXML exportieren (Punkte gehen als CgPoints hinaus), GIS-{{ui:Exportieren}} verwenden (Punkte mit den Feldern P, N, E, Z und D) oder die Punkte per {{ui:Kopieren}} in eine Tabellenkalkulation kopieren |
| Punktbeschriftungsstile, Symbole je Beschreibungsschlüssel, Bögen aus Liniencodes, eine Beschreibungsschlüsseldatei zum Teilen zwischen Projekten | Beschriftungen zeigen die Nummer, die Höhe und die Beschreibung oder weniger ([CivilCraft-Einstellungen](topic:settings)); Schlüssel werden in der Projektdatei gespeichert |
| Einheitenumrechnung | Die Datei vor dem Import umrechnen; **Einheiten** beschriftet nur neu |

## Geländemodelle

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Mehr als ein Geländemodell aus Punkten | Ein Projekt je Geländemodell |
| Innere Grenzen ausblenden | **Längste äußere Kante** oder eine äußere Begrenzung verwenden |
| Eine gezeichnete Bruchkante einzeln auswählen oder bearbeiten | {{key:Mod+Z}} oder {{ui:Gezeichnete Bruchkanten entfernen}} und neu zeichnen |
| Ein aus LandXML gelesenes Geländemodell bearbeiten (Bruchkanten, Grenze) | {{ui:Geländemodell aus den Punkten neu erstellen}} |
| Ein aus einem Höhenraster erstelltes Geländemodell bearbeiten | Das Raster mit anderen Einstellungen erneut importieren |
| Ein aus LandXML gelesenes Geländemodell umrechnen, wenn sich das Koordinatensystem ändert | Zuerst {{ui:Geländemodell aus den Punkten neu erstellen}} |
| Beschriftete Höhenpunkte und Neigungswerte | In der Statusleiste ablesen oder die Oberfläche nach Neigung mit {{ui:Neigungsanalyse}} im Arbeitsbereich Landschaft einfärben ([Geländeplanung für Landschaft](topic:landscape-grading#grading-checks)) |

## Trassen und Längsschnitte

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Spiralen außer Klothoiden; eine Spirale zwischen zwei Bögen (zusammengesetzte Übergänge) | Klothoidenspiralen an den Enden eines Bogens sind verfügbar; die anderen werden beim LandXML-Import benannt und übersprungen |
| Einen PI zwischen zwei anderen einfügen | Die Trasse neu zeichnen oder die PI-Koordinaten neu eingeben |
| Trassen aus Objekten, Versätzen, Verbreiterungen | Mit PIs zeichnen |
| K für eine vertikale Ausrundung eingeben | L eingeben (K wird angezeigt) |
| Kreisförmige und unsymmetrische vertikale Ausrundungen | Nur symmetrische Parabel-Ausrundungen |
| Mehr als ein Entwurfslängsschnitt je Trasse | Eine Trasse je Variante |
| Die Längsschnittansicht zoomen, Längsschnittbänder unter dem Längsschnitt | Die Längsschnittansicht passt die ganze Trasse ein; auf [Lage- und Längsschnittblättern](topic:plan-profile-sheets) plotten |
| Querprofile in DWG oder LandXML | Querprofilblätter als PDF; {{ui:CSV}} der Flächen und Volumen |
| Schnittlinien schräg oder mit unterschiedlichen Breiten entlang der Straße | Eine Breite je Seite für die ganze Trasse |

## Korridore

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Mittelstreifen, Leitplanken und eine Überhöhung, die Vorlagen dreht | Als Vorlagen zeichnen ([Korridorvorlagen](topic:corridor-templates)); Vorlagen nach Station nehmen die Überhöhung noch nicht auf |
| Ein allmählicher Wechsel zwischen den Vorlagen zweier Abschnitte (Übergänge, Verjüngungen) | Die Vorlage an einer Station wechseln oder einem Punkt eine Breitenvorgabe zu einer als Verjüngung gezeichneten Linie geben |
| Drehung um eine Kante, Überhöhung in LandXML | Die Überhöhung dreht bei Kreisbögen um die Achse; einen Fahrstreifen mit einer Breitenvorgabe zu einer Feature-Linie verbreitern |
| Ziele für die Böschungen (Böschungslinie zu einer Linie oder einem Geländemodell), eigene Geländemodelle der Korridore | Ziele verschieben die Fahrbahnkanten und Banketten ([Korridore](topic:corridor)); der Korridor wird ins neue Geländemodell modelliert |
| Bordsteinrundungen, Abbiegespuren und Inseln, in eine Einmündung modelliert; das Ende einer Nebenstraße schräg an die Kante der Hauptstraße angeschnitten; ein Weg im Plan mit einer Straße verbunden, in seiner Länge und Fläche | Straßen, die sich treffen, werden rechtwinklig verbunden, wobei die Kante der Hauptstraße geöffnet und die Nebenstraße daran angeglichen wird ([Wo Straßen sich treffen](topic:corridor#where-roads-meet-roads-pads-and-paths)); ein Weg endet an der Straßenkante im neuen Geländemodell und in 3D |
| Korridore als LandXML-Straßen exportiert; ein zweiter Korridor auf einer Trasse im IFC-Export | Das neue Geländemodell wird exportiert |
| Geländevorlagen, die das neue Geländemodell ändern, in 3D oder in den Querprofilen | Sie geben Flächen und Volumen jeder Schicht ([Geländevorlagen](topic:corridor-templates#terrain-templates)) |
| Schleppkurven mit Geschwindigkeit, Reifenschlupf, Lenkzeit, Lenkanhängern oder Karosserieabstand; eine Bibliothek genormter Bemessungsfahrzeuge; eine Schleppkurve durch Ziehen des Fahrzeugs zeichnen | Schleppkurven mit niedriger Geschwindigkeit entlang einer Feature-Linie oder Trasse, mit Ihren eigenen Fahrzeugmaßen ([Fahrzeugschleppkurven](topic:swept-paths)) |

## Modellierung und Erdmassen

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Bermen, offene Feature-Linien, in den Entwurf modelliert, Modellierung zu einer Feature-Linie von anderswo | Feature-Linie schließen ([Feature-Linien](topic:feature-lines)) oder als Bruchkante des bestehenden Geländes verwenden |
| Einen Knoten einer Feature-Linie einfügen oder entfernen | Die Linie neu zeichnen oder einen gestuften Versatz davon erstellen |
| Bögen in gezeichneten Bruchkanten (durch Vermessungspunkte), Spiralen in Feature-Linien | Eine Feature-Linie mit Bögen zeichnen und als Bruchkante des bestehenden Geländes verwenden |
| Modellierung auf einen Abstand, eine Höhe oder ein anderes Geländemodell | Nur Böschung zum bestehenden Gelände |
| Eine Bauplatzecke hinzufügen oder entfernen | Den Bauplatz löschen und neu zeichnen |
| TIN-zu-TIN-Volumen (Prisma), Wahl der Rastergröße | Rasterverfahren, die Zellgröße wird für Sie gewählt |
| Auflockerung und Verdichtung, Oberboden, Fahrbahnstärken | Faktoren selbst auf die ausgegebenen Werte anwenden |
| Kosten für freie Förderung und Mehrförderung, Transport zwischen verschiedenen Trassen, Entnahmestellen und Deponien im Plan | Das Massenförderdiagramm mit Ausgleichspunkten, bewegten Volumen und mittleren Förderweiten |

## Rohrnetze

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Mehr als ein Netz je Projekt | Getrennte Projekte für Regen- und Schmutzwasser |
| Wasserleitungen: Wasserqualität und -alter, regelbasierte Steuerungen, andere Ventiltypen (Durchflussregelung, Drossel, Halteventil), Pumpen mit Leistungsangabe, Bedarf, der vom Druck abhängt, eine Darcy-Weisbach-Option, ein Rohrkatalog mit Wandstärken und Druckstufen. Der Rest der Druckleitungsnetze ist im Labor: [Wasserleitungen](topic:water-mains) | Diese in einer Software für Wasserverteilung prüfen; Bemessungsabflüsse für Schmutzwasser stehen in [Schmutzwasser-Bemessungsabflüsse](topic:sanitary-design) |
| Kanalabflüsse über die Zeit (Ganglinien, dynamische Wasserspiegelberechnung, Speicher, Pumpen, Überläufe) | [Schmutzwasser-Bemessungsabflüsse](topic:sanitary-design) gibt den stationären Spitzenabfluss, den ein Bemessungsblatt verwendet |
| Einlaufkapazität, Rinnenausbreitung, Rückhalteberechnung, Ganglinien, Energieverluste außer einem Knotenbeiwert | In anderer Software prüfen; Abflüsse, Dimensionen und Gradienten stehen in [Regenwasserentwässerung](topic:storm-drainage) |
| Einzugsgebiete im PDF-Plot, DWG, DXF oder LandXML; Einzugsgebiete aus dem Geländemodell (Wasserscheiden) | Einzugsgebiete von Hand zeichnen; sie werden in der Projektdatei gespeichert |
| Rohrkataloge, nicht runde Rohre, Bauwerke, die keine stehenden Kästen oder Zylinder sind (Kegel, Stufen, Berme), eine Entwässerungskategorie in der Bibliothek | Bauwerkstypen aus Parametern ([Rohrnetz](topic:pipe-network)); Rohre mit einem Durchmesser |
| Rohre in der Längsschnittansicht, gekrümmte Rohre | Sohlen und Überdeckung im rechten Bereich ablesen |

## Flurstücke

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Grundstücke nach Fläche oder Frontlänge aufteilen, Flurstücke aus den umgebenden Linien, Wegerecht | Jedes Flurstück über seine Ecken zeichnen oder seine Strecken eingeben |
| Bogentabellen und Linientabellen im Plan; Beschriftungen von Hand verschoben | Jeder Abschnitt ist entlang seiner selbst beschriftet |
| Flurstücke in LandXML | Flurstücke werden in der Projektdatei gespeichert und gehen in PDF, DWG und DXF |

## Traversen

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Ausgleichung nach der Methode der kleinsten Quadrate, Transitregel, Gewichtung von Winkeln gegen Strecken | Die Kompassregel |
| Deflexionswinkel, Zenitwinkel und Schrägstrecken, Höhen durch trigonometrische Höhenmessung | Auf horizontale Strecken und Winkel richtig reduzieren oder Richtungswinkel verwenden |
| Seitenaufnahmen, Rohdatendateien von Datensammlern | Die Punkte als Punktdatei importieren |

## Absteckung

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Versatzpfähle (Bezugspunkte hinter dem Pfahl), Böschungspfähle am Anschnittpunkt | Pfähle an den benötigten Versätzen setzen, auch über den Bankettrand hinaus |
| Pfähle direkt im eigenen Format eines Datensammlers senden | Die CSV öffnet sich in der Bürosoftware der meisten Datensammler |
| Rohre, Bauplätze und Flurstücke abstecken | Vermessungspunkte nahe einer Trasse verwenden oder die Strecken des Flurstücks |

## Dateien und Ausgabe

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Text, Schraffuren und Bemaßungen aus DWG oder DXF; Papierbereich; externe Referenzen (Xrefs); binäres DXF | Linienwerk aus dem Modellbereich öffnet sich ([Eine DWG oder DXF als Linienwerk öffnen](topic:open-dwg-dxf)); externe Referenzen separat öffnen |
| Mehrere Punkte gleichzeitig durch Ziehen verschieben | Ausschneiden und einfügen oder einzeln bearbeiten |
| Hochformat-Blätter, eigene Schriftfelder, Ansichtsfenster, die Sie anordnen, Lage- und Längsschnittblätter in DWG | Ein Lageplanblatt im Querformat je PDF oder Lage- und Längsschnittblätter entlang einer Trasse (PDF) |
| Höhenbänder und Längsschnitte plotten | Bänder nur auf dem Bildschirm; einen Screenshot machen, wenn Sie sie brauchen |
| Layernamen, Farben oder Beschriftungsstile ändern | In einem CAD-Programm nach dem DXF-Export ändern |
| Cloud-Speicherung und Versionsverlauf | `.civilcraft.json`-Dateien speichern und sichern; um ein Projekt gemeinsam zu bearbeiten, eine Live-Sitzung in CadCraft Studio verwenden ([Ein Gelände gemeinsam live planen](topic:work-live)) |
| CadCraft Studio für iPad und iPhone sowie aus dem Google Play Store | CivilCraft im Browser auf dem Gerät verwenden; unter Android wird CadCraft Studio über seine APK von getcadcraft.com/download installiert |
| Mehrere Punkt- oder Projektdateien gleichzeitig öffnen | Eine Datei je Öffnung (GIS-Dateien, die zusammengehören, etwa die Teile eines Shapefiles, öffnen sich zusammen) |

## Landschaft

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Sprinkler- und Düsen der Hersteller | Allgemeine Köpfe oder eigene Köpfe aus einer Datei hinzufügen; Herstellerdaten kommen, sobald die Hersteller die Freigabe erteilen |
| Maximale Seitenlängen für Tropfleitungen, Abflüsse über die Zeit, Pumpen, vermaschte Rohrnetze | Tropfstränge auf die vom Hersteller veröffentlichte Länge halten; die Prüfung braucht ein verzweigtes Netz |
| Der genaue Umriss eines konkaven Freiformobjekts; sein Volumen unter Gelände exakt gemessen | Die konvexe Hülle wird modelliert, und das Volumen unter Gelände ist eine Schätzung (in den Eigenschaften angegeben) |
| Pflanzen über das eigene Platzieren aus der Bibliothek in BimCraft und ModelCraft | Landschafts-IFC exportieren und in BimCraft neben dem Gebäude öffnen |
| Detaillierte Pflanzenmodelle (Blätter, Äste, Jahreszeiten) in der 3D-Ansicht; Freiformobjekte und Bewässerung in der 3D-Ansicht | Pflanzen erscheinen in 3D als einfache Formen, nach der Pflanzenliste bemessen ([Das Gelände in 3D ansehen](topic:site-3d)); die Streuung von ModelCraft erstellt Pflanzbilder |
| Befestigte Mauern, die auf der Oberfläche ein modelliertes Niveau dahinter halten | Einer Plattform oder einem Bauplatz senkrechte Seiten geben: sie sind Stützmauern auf der Oberfläche ([Modellierung](topic:grading)) |
| SVG-Transformationen in Ihren eigenen Symbolen; Texturen und Farben Ihrer eigenen GLB-Pflanzenmodelle; komprimierte GLB-Geometrie | Transformationen in Ihrem Zeichenprogramm zuerst auflösen; Modelle werden in der Farbe der Pflanze gezeichnet; die GLB ohne Komprimierung exportieren ([Pflanzengrafiken](topic:plant-graphics)) |
| Ihre eigene Pflanzenliste in Ihrem Bibliothekskonto (in der App bearbeitet) | Die eigene Liste des Projekts in der Pflanzentabelle bearbeiten und als Pflanzendatei speichern |
| Die Landschaftswerkzeuge für Assistenten ohne Fenster (der Dateiserver und die Befehlszeile) | Sie arbeiten, wenn das CivilCraft-Fenster geöffnet ist ([Einen KI-Assistenten mit Ihrem Gelände arbeiten lassen](topic:assistants)) |

## Freileitungen

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Die Norm eines Landes eingebaut (Lastfälle, Abstände, Faktoren) | Die Werte Ihrer Norm in {{ui:Lastfälle und Grenzwerte…}} setzen und zusammen mit Ihrer Bibliothek als Paket speichern, um sie wiederzuverwenden und zu teilen ([Pakete](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Der seitliche Abstand von einem Leiter zu einer Baumkrone oder einer Wand neben der Leitung | Der senkrechte Abstand nach oben über Pflanzen und Wände, die die Leitung quert ([Freileitungsprüfungen](topic:power-line-checks#clearances)) |
| Leiterkriechen und die Dehnung eines neuen Leiters | Berücksichtigen Sie sie über die Temperaturen in der Seiltabelle |
| Thermische Bemessung erdverlegter Kabel (Strombelastbarkeit aus der Verlegungsart) | Die Strombelastbarkeit Ihres Lieferanten am Kabelelement eingeben |
| Kurzschluss-, Schutz- und Erdungsstudien | Ein eigenes Elektroprogramm verwenden; CivilCraft liefert die Längen und Kabel des Netzes |
| Gittermasten, Stab für Stab bemessen, und Abspannanker im Boden | Maste werden über ihre Nennlast geprüft; Abspannungen über ihre Nennlast |
| Eine `.DON`-Studiendatei, geprüft im Programm, das sie liest | Die Datei dort prüfen; senden Sie uns eine Probe, damit wir an einer echten testen können |
| Freileitungen in der 3D-Ansicht und in IFC | Der Plan, das Leitungsprofil, die Blätter und GIS-Ebenen |
| Die Freileitungswerkzeuge für Assistenten ohne Fenster | Sie arbeiten, wenn das CivilCraft-Fenster geöffnet ist ([Einen KI-Assistenten mit Ihrem Gelände arbeiten lassen](topic:assistants)) |

## Baumassen

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Eine Bibliothek mit Bebauungsplänen oder den Regeln einer Stadt | Die Grenzwerte aus Ihrer eigenen Satzung eingeben ([Bebauungsgrenzwerte](topic:zoning-limits)) |
| Himmelslicht an den Wänden (Fassadentageslicht), Wind | [Sonnenstunden](topic:sun-hours) zählt nur direkte Sonne |
| Schatten von Bäumen, Pflanzen oder allem, das nicht als Baumasse gezeichnet ist | Nachbargebäude als Baumassen zeichnen |
| Dachformen an Baumassen | Baumassen mit flachem Dach |
| Öffnungen, Dächer und Wandtypen, wenn eine Baumasse in BimCraft ausgearbeitet wird | BimCraft erstellt auf jeder Ebene und einer Decke einfache Außenwände; den Rest dort ergänzen |

## GIS und Koordinatensysteme

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| File Geodatabase; KML-Stile, Symbole, Bodenüberlagerungen und Netzwerklinks | Zuerst in GeoPackage, Shapefile oder GeoJSON umwandeln; KML-Marker werden ohne ihre Stile gelesen |
| GIS-Objekte oder ihre Attribute bearbeiten | In einem GIS-Programm bearbeiten und erneut importieren. Der Bereich Analysieren erstellt neue Layer (Puffer, Überlagerung, Verknüpfung, Auswahl) und fügt Flächen- und Längenfelder hinzu, bearbeitet aber kein Objekt direkt |
| Netzwerk- und Rasteranalyse, Puffer mit flachen oder eckigen Enden und einseitige Puffer, Zeilen in der Attributtabelle hinzufügen oder löschen und den Typ eines Feldes ändern, manuelle Klassenfarben, eine Legende der Stile in Plots | Mit {{ui:Wählen}} Objekte auswählen und daraus einen Layer erstellen; flache Enden werden nicht angeboten. Die Färbung nach Attribut und die Attributtabelle sind fertig: siehe [Einen Layer nach einem Attribut gestalten](topic:gis-symbology) und [Mit der Attributtabelle eines Layers arbeiten](topic:gis-table) |
| Beschriftungsstile (Größe, Platzierung) und Beschriftungen, die einander ausweichen | Beschriftungen haben eine Größe und können sich überlappen, wo Objekte dicht liegen |
| Höhenbezugssysteme und Geoidmodelle | Höhen werden so verwendet, wie die Datei sie angibt; das Höhenbezugssystem selbst prüfen |
| Rasterverschiebungen außer NAD27 nach NAD83, nach Gebiet vorgeschlagen (OSTN15; NTv2 für andere Bezugssysteme funktioniert, wenn Sie die Datei hinzufügen), mehrere Raster gleichzeitig, vertikale Raster | Die Rasterdatei für Ihr Bezugssystem selbst hinzufügen; ein Raster je Projekt |
| Kartenebenen im DXF oder in 3D-Exporten | Kartenebenen gehen in den PDF-Plot und neben die DWG als Bild |
| Kartendienste, die eine Anmeldung, einen Schlüssel oder ein Token brauchen | Öffentliche Dienste verwenden oder eine georeferenzierte Bilddatei |
| LAS- oder LAZ-Dateien aus einem Geländemodell, dem Gelände oder den Höhenraster- und LiDAR-Werkzeugen schreiben | Geländemodelle als GeoTIFF-Höhenraster exportieren. Das [Punktwolken](topic:point-clouds)-Add-on schreibt eine bereinigte Wolke als LAS 1.4 oder LAZ |
| LiDAR-Intensität, Farbe und Rückläufe; Höhenraster mit mehreren Bändern; Raster- oder LiDAR-Dateien über 200 MB | LiDAR wird nur nach Klasse gefiltert, Raster verwenden ihr erstes Band; große Dateien vorher in Kacheln schneiden |

## Eingabe

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Rahmenauswahl per Touch (sie braucht {{key:Shift}}) | Jeden Vermessungspunkt lange drücken, um ihn hinzuzufügen |
| Koordinaten oder Strecken eingeben, während gezeichnet wird | Grob zeichnen und dann die genauen PI-Koordinaten in der PI-Tabelle der Trasse eingeben |
| Koordinaten für Bauplatzecken und Bauwerke eingeben | Deren Griffe ziehen; für Genauigkeit einzoomen und E und N in der Statusleiste beobachten |
| Einrasten an Objekte (außer Vermessungspunkten für Bruchkanten) | Einzoomen und die Statusleiste beobachten |

## 3D-Ansicht

| Noch nicht umgesetzt | Stattdessen, heute |
|---|---|
| Zeichnen oder Bearbeiten in der 3D-Ansicht | Im Plan zeichnen und bearbeiten; die 3D-Ansicht folgt jeder Änderung |
| Korridor-Feature-Linien oder GIS-Objekte durch Klicken in 3D auswählen | Im Plan anklicken |
| Die überhöhte Ansicht oder in Fuß exportieren | Exporte sind im wahren Maßstab in Metern; siehe [Das Gelände in 3D exportieren](topic:export-3d) |
| Beschriftungen in GLB- oder OBJ-Exporten, Beschriftungsgrößen und -stile in 3D | Beschriftungen erscheinen nur in der 3D-Ansicht, in einer Größe; siehe [Das Gelände in 3D ansehen](topic:site-3d) |
| Texturen aus Fotos, eine Fahrt als Video aufzeichnen, Schatten von außerhalb des Geländes, Sonnenstunden in der 3D-Ansicht | Kartenebenen auf die Oberflächen gelegt; fahren und die Sonnenposition zu einer Zeit; [Sonnenstunden](topic:sun-hours) für einen Tag oder eine Jahreszeit im Plan |
