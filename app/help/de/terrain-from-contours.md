---
title: Gelände aus Höhenlinien
summary: Die Geländeoberfläche aus einem Höhenlinienplan erstellen: Linienlayer wählen, festlegen, woher die Höhe jeder Linie stammt, auf Kreuzungen und Dubletten prüfen und dann erstellen. Höhenlinien werden zu Bruchkanten, und flache Dreiecke auf Kämmen und in Tälern werden korrigiert. Ein aus einem Bild oder einer PDF übertragener Plan lässt sich über zwei bekannte Punkte skalieren und platzieren.
keywords: Höhenlinien, Höhenlinienplan, Gelände aus Höhenlinien, Oberfläche aus Höhenlinien, topografische Karte, Vermessungskarte, ohne Koordinaten, Bruchkanten, flache Dreiecke, Grat, Tal, Kuppe, sich kreuzende Höhenlinien, doppelte Höhenlinien, Höhenlinienabstand, Karte skalieren, zwei Punkte, Karte platzieren, DXF, DWG, Shapefile
from: e6161653
---

Ein Vermessungsbüro schickt manchmal einen Höhenlinienplan: Linien mit Höhen, aber ohne Punkte. CivilCraft erstellt aus diesen Linien das bestehende Gelände.

## Die Höhenlinien einlesen

Öffnen Sie den Plan als Linien: eine DXF- oder DWG-Zeichnung, ein Shapefile oder GeoJSON (**GIS** › {{ui:Importieren}} oder die Datei in den Plan ziehen). Die Linien kommen als **Kartenlayer** herein. Wählen Sie unter **Geländemodell** › {{ui:Mehr}} die Option {{ui:Gelände aus Höhenlinien}}.

## Festlegen, woher die Höhe jeder Linie stammt

Markieren Sie die Layer, die Höhenlinien enthalten, und wählen Sie dann **Höhe aus**:

- {{ui:Den eigenen Höhen der Linien}}: eine Linie, deren Eckpunkte alle dieselbe Höhe haben (eine 3D-Polylinie oder eine Polylinie mit einer Höhe). Eine Linie auf 0 ist planimetrische Zeichnung und hat keine Höhe.
- Ein **Zahlenfeld** des Layers (zum Beispiel ELEV), wenn der Plan eines mitbringt.
- {{ui:Einem Anfangswert und einem Intervall, in der Reihenfolge der aufgelisteten Linien}}: für Linien ganz ohne Höhe. Die erste aufgelistete Linie erhält die **Höhe der ersten Linie**, die nächste diesen Wert plus den **Höhenlinienabstand**, und so weiter. Listen Sie die Linien von unten nach oben auf (oder ordnen Sie sie im Layer neu).

## Prüfen, dann erstellen

{{ui:Prüfen}} listet vor jeder Änderung in Worten auf, was falsch ist:

- eine Linie **ohne Höhe** oder mit weniger als zwei Punkten;
- eine **doppelte** Linie (dieselbe Form zweimal, auch wenn sie in umgekehrter Richtung gezeichnet ist);
- zwei Linien, die sich **kreuzen**, auf verschiedenen oder auf derselben Höhe (auch eine Linie, die sich selbst kreuzt), mit der Stelle;
- eine Höhe, die **nicht im Abstand liegt** (ein Tippfehler wie 105.5 auf einem Plan mit 1 m Abstand).

Markieren Sie {{ui:Linien auslassen, die eine andere kreuzen}}, um die Linie zu entfernen, die die meisten anderen kreuzt (dann die nächste, bis sich keine mehr kreuzt): Eine einzelne Ausreißerlinie, die jede Höhenlinie durchschneidet, ist die, die weggeht, nicht die Höhenlinien. **Linien vereinfachen innerhalb** streicht Eckpunkte, die näher an einer geraden Strecke liegen als dieser Abstand.

{{ui:Gelände erstellen}} fügt die Linien dem bestehenden Gelände als Bruchkanten hinzu (ein Rückgängig-Schritt), sodass die Oberfläche jede Höhenlinie genau durchläuft. Wenn {{ui:Flache Dreiecke an Kämmen, Tälern und Kuppen korrigieren}} markiert und ein Abstand angegeben ist, fügt CivilCraft außerdem in jedes flache Dreieck (ein Dreieck, dessen Ecken alle auf einer Höhenlinie liegen) einen Punkt auf der Höhe ein, auf der die daneben liegende Neigung weiterläuft, und zwar nie mehr als einen halben Abstand von der Höhenlinie entfernt. Ohne das werden Gratlinien, Talsohlen und Kuppen als flache Platten dargestellt. An einem Testhügel verringerte sich der Fehler gegenüber der tatsächlichen Oberfläche um ein Viertel, an einem Grat um 40 %.

## Eine Karte ohne Koordinaten

Für einen Höhenlinienplan, der aus einem Bild oder einer PDF übertragen wurde, öffnen Sie **Layer durch zwei bekannte Punkte skalieren und platzieren**. Geben Sie zwei Punkte auf der Karte und ihre tatsächliche Lage an; die markierten Layer werden skaliert, gedreht und verschoben, sodass sie passen (ein Rückgängig-Schritt; die Höhen bleiben unverändert). Dieselben zwei Punkte liefern den Maßstab (im Hinweis angezeigt) und die Drehung.

Die Oberfläche ist nur so gut wie der Plan: Zwischen zwei Höhenlinien ist sie eine Ebene, daher ist das wirkliche Gelände dazwischen nicht bekannt. Prüfen Sie das Ergebnis anhand von Höhenpunkten, bevor Sie sich darauf verlassen.
