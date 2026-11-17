---
title: Pflanzendarstellung nach Maßstab, eigene Zeichen und 3D-Pflanzen
summary: Wie Pflanzen im Plan je Zeichenmaßstab und Detailstufe gezeichnet werden und wie ein Pflanzendatensatz ein eigenes Zeichen (SVG oder einen DXF- bzw. DWG-Block) und ein eigenes 3D-Modell (OBJ, STL oder GLB) erhält.
keywords: Pflanzendarstellung, Pflanzenzeichen, Zeichen nach Maßstab, Detailstufe, einfacher Kreis, Umriss, detailliertes Zeichen, eigenes Zeichen, Block, SVG, DXF, DWG, 3D-Pflanze, eigenes 3D-Modell, OBJ, STL, GLB, glTF, Baummodell, Pflanzen in 3D
from: 875837d9
---

## Pflanzenzeichen nach Maßstab

Landschaft › {{ui:Mehr}} › {{ui:Pflanzendarstellung}} legt fest, wie Pflanzen im Plan gezeichnet werden. **Automatisch nach Maßstab** wählt aus dem Zeichenmaßstab eine von drei Stufen:

- **Einfacher Kreis** (gröber als 1:500): ein Kreis mit der Breite der Pflanze.
- **Umriss mit Mittelpunkt** (von 1:500 bis 1:200): der Kreis und ein kleines Mittelpunktkreuz.
- **Detailliertes Zeichen** (feiner als 1:200): das eigene Zeichen des Datensatzes, falls vorhanden, sonst das eingebaute Zeichen.

Ändern Sie die beiden Maßstäbe mit **Einfach ab 1:** und **Umriss ab 1:** oder wählen Sie eine Stufe für alle Maßstäbe. Jeder Blattsatz im Dialog Blätter hat einen eigenen **Detailgrad der Pflanzen im Plan**, sodass sich ein Lageplan 1:500 und ein Pflanzplan 1:100 unterscheiden können. Die Einstellungen werden mit dem Projekt gespeichert.

## Eigenes Zeichen

Wählen Sie eine Pflanze im Bereich Pflanzen und drücken Sie {{ui:Eigenes Zeichen…}}. Das liest eine SVG-Datei oder einen Block einer DXF- bzw. DWG-Zeichnung (hat die Zeichnung mehrere Blöcke, wählen Sie einen). Das Zeichen wird an die Breite der Pflanze angepasst und in der detaillierten Stufe gezeichnet. Es wird im Projekt gespeichert, sodass die Datei mit ihm wandert.

- Aus einer SVG werden Linien, Polylinien, Polygone, Rechtecke, Kreise, Ellipsen und Pfade gelesen. Skripte, Stile, Links und Bilder darin werden nie beachtet. Transformationen werden nicht angewendet: Sie erhalten eine Meldung, wenn die Datei welche enthält; reduzieren Sie sie vorher in Ihrem Zeichenprogramm.
- Grenzen: 512 KB SVG und 2000 Formen. Eine größere Datei wird unter Angabe des Grundes abgelehnt.

## Eigene 3D-Pflanze

{{ui:Eigenes 3D-Modell…}} am selben Datensatz liest eine Datei im Format **OBJ**, **STL** oder **GLB**. Stellen Sie dann unter Pflanzendarstellung **Pflanzen in 3D** auf **Eigenes Modell jedes Datensatzes** ein: Jede Pflanze dieses Datensatzes zeigt Ihr Modell, skaliert auf Höhe und Breite. Datensätze ohne eigenes Modell behalten die eingebauten Formen. Wählen Sie **Einfache Massen** für schnelle Ansichten großer Geländeflächen.

Eine GLB-Datei wird nur für ihre Form gelesen:

- Alles, was das Modell braucht, muss in der .glb-Datei stehen. Ein Modell, das auf andere Dateien verweist (eine separate .bin oder Bilder über eine Adresse), wird abgelehnt: Es wird nichts heruntergeladen.
- Komprimierte oder gepackte Geometrie (Draco, meshopt, quantisierte Positionen) wird nicht gelesen. Exportieren Sie ohne Komprimierung.
- Texturen und Farben in der Datei werden nicht verwendet: Das Modell wird in der eigenen Farbe der Pflanze gezeichnet. Texturen werden trotzdem geprüft, und eine Textur mit mehr als 4096 Pixeln Seitenlänge wird abgelehnt.
- Grenzen: 32 MB Dateigröße, 50 000 Dreiecke (jede mehrfach platzierte Kopie eines Teils mitgezählt), 64 Bilder und 16 MB Bilddaten.

Jede Grenze lehnt die Datei unter Angabe des Grundes ab; nichts nur teilweise Gelesenes wird behalten. Ein Schritt Rückgängig gibt dem Datensatz sein Zeichen oder Modell, und {{ui:Eigenes Zeichen entfernen}} bzw. {{ui:Eigenes 3D-Modell entfernen}} nimmt es wieder weg.

Siehe [Pflanzendatensätze](topic:plant-records) für den Datensatz selbst und [Die Anlage in 3D ansehen](topic:site-3d).
