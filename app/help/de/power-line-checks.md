---
title: Prüfungen für Freileitungen
summary: Was CivilCraft bei jeder Leitung und jedem Kabel prüft, immer aktuell: Abstände, Phasenabstand, Ausschwenkung, Abhebung, Mastlasten und Dimensionierung, Armaturen, Abspannungen, Fundamente, fehlende Daten, Verbindungen, Überlast und Spannungsabfall.
keywords: Prüfungen, Abstand, Bodenabstand, Hindernis, Kreuzung, Phasenabstand, Isolatorausschwenkung, Abhebung, Mastlast, Nennlast, Dimensionierung, Fundament, Abspannung, Armatur, Traverse, Spannungsabfall, Überlast, fehlende Daten, nicht verbunden
from: e6a0da47
---

**Prüfungen** im Bereich Freileitungen listet jedes Problem auf: rot für Fehler, gelb für Warnungen. Klicken Sie auf eine Prüfung, um die Leitung, den Mast, das Kabel oder das Betriebsmittel auszuwählen, um die es geht. Versagende Maste und Felder werden im Plan rot eingekreist, solange der Arbeitsbereich geöffnet ist.

:::warning
Ein Entwurfshilfsmittel: Dies sind Prüfungen Ihres Entwurfs gegen Ihre eigenen Regeln, keine Zertifizierung.
:::

## Abstände

Die niedrigste Phase des Leiters wird über jedes Feld bei jedem Lastfall verfolgt. Ihr geringster Abstand über dem Gelände muss die **Abstandsregel** der Leitung erreichen. Wo ein Feld ein **Hindernis** kreuzt (gezeichnet mit {{ui:Hindernis}}: ein Punkt oder eine Linie, mit seiner Höhe über dem Gelände und seiner eigenen Abstandsregel), wird der Abstand über der Oberkante des Hindernisses ebenso geprüft.

**Was der Arbeitsbereich Landschaft über dem Gelände platziert, zählt ebenfalls.** Einzelne Pflanzen (ihre Krone bei ausgewachsener Ausbreitung und Höhe), Hecken und Pflanzbeete (die höchste Art darin) sowie Mauern (ihre Oberkante) sind unter einer Leitung Hindernisse, ohne dass sie erneut gezeichnet werden müssen. Sie behalten die Regeln, die unter {{ui:Lastfälle und Grenzwerte…}} festgelegt sind: **Landschaftspflanzen unter einer Leitung** (die Beispielsätze verwenden *Bäume und Pflanzen*, 3 m) und **Landschaftsmauern unter einer Leitung** (*Gebäude*). Wählen Sie **Nicht geprüft**, um sie auszulassen. Der Abstand wird senkrecht von der Oberkante der Pflanze oder Mauer bis zum Leiter gemessen, dort wo das Feld sie kreuzt. Der seitliche Abstand zu einer Krone neben der Leitung wird nicht geprüft. Das Verschieben eines Baums oder das Erhöhen einer Mauer ändert die Prüfungen sofort.

Ihre Abstandsregeln sind Ihre eigenen. Öffnen Sie sie über **Regeln…** neben jeder **Abstandsregel** (oder unter {{ui:Lastfälle und Grenzwerte…}}), um sie hinzuzufügen, umzubenennen, zu ändern oder zu entfernen.

## Phasenabstand und Ausschwenkung

- **Benötigter Phasenabstand**: k·√(Durchhang + Isolatorlänge) + U/150, mit dem Durchhang des Warmfalls und der Spannung U in kV (eine übliche Form; k stammt aus Ihrem Regelwerk). Verglichen mit dem Phasenabstand der Traverse.
- **Ausschwenkung des Isolators** an Tragmasten unter dem Windfall: atan(Querlast ÷ Vertikallast), verglichen mit der größten Ausschwenkung des Regelwerks.
- **Abhebung**: Ein Tragmast, der niedriger liegt als seine Nachbarn, kann im Kaltfall hochgezogen werden; er wird markiert.

## Mastlasten und Dimensionierung

Für jeden Mast und Lastfall, mit allen Leitern der Leitung:

- **Quer**: Wind je Meter × das Windfeld (die Hälfte der beiden Felder), zuzüglich 2·H·sin(Winkel ÷ 2) an einer Ecke.
- **Längs zur Leitung**: die Differenz der Zugkräfte beider Seiten an einem Endmast oder Winkelmast. An einem Tragmast nur bei Eis auf einer Seite (jedes Feld für sich berechnet, was auf der sicheren Seite liegt).
- **Vertikal**: die Vertikallast je Meter × das Gewichtsfeld (zwischen den tiefsten Punkten beiderseits) zuzüglich der Betriebsmittel.

Die Horizontallast wird auf den Nennpunkt des Mastes umgerechnet (äquivalente Last = Last × Befestigungshöhe ÷ Höhe des Nennpunkts) und mit seiner **Nennlast** × dem Faktor des Regelwerks verglichen. Ist sie zu schwach, wird der kleinste Mast desselben Materials in Ihrer Bibliothek vorgeschlagen, der sie trägt. Ein Mast mit einer **Abspannung** leitet die Horizontallast an die Abspannung weiter, die Last ÷ sin(Abspannwinkel) trägt und gegen ihre eigene Nennlast geprüft wird.

Armaturen (Klemmen, Isolatoren, Traversen) werden gegen ihre Nennlast geprüft: Eine Verankerungsarmatur trägt die Zugkraft des Leiters, eine Tragarmatur ihren Anteil an der Vertikal- und Querlast. Das angezeigte **Fundament** ist die Tiefe des Mastes im Boden und ein Loch, das etwas breiter ist als sein Fuß.

## Daten, Verbindungen und Strom

- Ein Element, dessen benötigtes Feld leer ist, oder ein Schlüssel, der nicht in der Bibliothek steht.
- Ein Kabelende oder ein Betriebsmittel, das mit nichts verbunden ist.
- **Spannungsabfall** und **Strom** von jeder Quelle (als Quelle markiertes Betriebsmittel) zu den Lasten (kW und Leistungsfaktor am Betriebsmittel), entlang von Freileitungsfeldern und Kabeln: √3·I·L·(R cos φ + X sin φ), mit R bei 20 °C. Mehr Strom als die Strombelastbarkeit des Kabels oder mehr Spannungsabfall, als das Regelwerk erlaubt, wird markiert.
