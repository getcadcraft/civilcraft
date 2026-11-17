---
title: Zäune
summary: Ein Zaun entlang einer Linie, eines Flurstücks oder eines Bauplatzes: Pfosten, Riegel, Felder oder Latten, Tore, geneigt oder gestuft am Gelände, eine Liste, Planzeichen und IFC-Elemente. Auch für einen Assistenten verfügbar.
keywords: Zaun, Pfosten, Riegel, Felder, Latten, Tor, geneigt, gestuft, Gelände, Liste, ifc, Geländer, Grenze
from: c0e7b84a
---

Erstellen Sie einen Zaun entlang einer Feature-Linie, einer Trasse, eines Flurstücks oder eines Bauplatzes; Pfosten und Tore werden für Sie platziert.

## Zaun erstellen

1. Wählen Sie eine Linie, ein Flurstück oder einen Bauplatz aus.
2. Öffnen Sie **Geländemodell, Mehr, Zäune...**
3. Wählen Sie den Stil (Felder, Riegel oder Latten), geneigt oder gestuft, die Höhe, den Pfostenabstand und die Torbreite und dann **Zaun entlang Auswahl** oder **Mit Tor**, um ein Tor in die Mitte des längsten geraden Abschnitts zu setzen.

Pfosten stehen an den Enden, an jeder Ecke (ein Knoten, der um 20 Grad oder mehr abbiegt), an beiden Kanten jedes Tores und dazwischen in gleichen Feldern, keines länger als der Abstand. **Geneigte** Felder folgen dem Gelände zwischen ihren Pfosten. **Gestufte** Felder bleiben waagerecht und springen an den Pfosten; der Spalt unter einem Feld ist am talseitigen Pfosten am breitesten, und das Fenster warnt, wenn dieser Spalt über dem Grenzwert liegt oder wenn das Gelände durch ein Feld hindurch ansteigt. Tore ab 6 ft (1.8 m) Breite erhalten zwei Flügel; der Plan zeigt die Flügel geöffnet mit ihrem Schwenkbereich.

## Liste und Ausgaben

Jeder Zaun zeigt seine Länge, Pfosten nach Art, Felder, Tore und Stufen, mit einer **CSV**-Liste der Pfosten, Felder, Riegel, Latten und Tore. Der Plan hat Zaun-Layer (C-FENC, C-FENC-POST, C-FENC-GATE) für PDF, DXF und DWG. Der IFC-Export enthält die Pfosten (IfcMember, post), Felder (IfcRailing, user defined fence panel), Riegel (IfcMember) und Tore (IfcDoor, gate), je ein System pro Zaun.

## Über einen Assistenten

`fence_build` erstellt einen Zaun (Punkte oder eine benannte Linie, Flurstück oder Bauplatz, Tore nach Station) und `fence_list` listet die Zäune mit ihrer Liste auf.

## Was noch nicht umgesetzt ist

Die Startmaße sind übliche Vorgaben, keine Norm. Typen aus der Bibliothek werden nur als Name übernommen. Tore müssen in einem geraden Abschnitt liegen. BimCraft hat dieses Werkzeug noch nicht.
