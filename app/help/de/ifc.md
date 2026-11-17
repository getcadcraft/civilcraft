---
title: IFC-Export und -Import
summary: Das ganze Projekt als eine IFC-Datei in IFC 4.3, IFC4 oder IFC2x3 speichern (Trassen, Straßen, Erdarbeiten, Oberflächen, Mauern, Rohre) und IFC-Dateien für ihre Trassen und Oberflächen öffnen.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openBIM, BIM, Trasse, IfcAlignment, Straße, IfcRoad, Erdarbeiten, TIN, Lieferung, Vergabe, IFC exportieren, IFC importieren
from: 6b998bcf
---

IFC ist das offene Austauschformat, das viele öffentliche Auftraggeber als Lieferung verlangen. CivilCraft schreibt das ganze Projekt in eine IFC-Datei und liest Trassen und Oberflächen aus IFC-Dateien zurück.

## Exportieren

1. Klicken Sie {{ui:IFC}} in der Gruppe **Exportieren** (im Menüband-Stil: {{ui:Output}} › {{ui:Export}} › {{ui:IFC}}).
2. Wählen Sie das Schema. **IFC 4.3 ADD2** steht an erster Stelle und ist die Voreinstellung: Es ist die Ausgabe mit Trassen, Straßen und Erdarbeiten. Wählen Sie IFC4 oder IFC2x3 nur, wenn die Software des Empfängers 4.3 nicht lesen kann.
3. Der Dialog sagt, was die Datei enthalten wird und was das gewählte Schema weglässt. Klicken Sie auf {{ui:Export IFC}}.
   Die Datei wird als "*Projektname*-ifc4x3.ifc", "-ifc4.ifc" oder "-ifc2x3.ifc" heruntergeladen. CivilCraft merkt sich das zuletzt gewählte Schema.

## Was jedes Schema enthält

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Trassen | IfcAlignment mit ihren horizontalen (Geraden, Kreisbögen, Klothoiden) und vertikalen (Gefälle, Parabelkurven) Achsen, ihren Kurven (IfcCompositeCurve, IfcGradientCurve), der Anfangsstation und den Querneigungsereignissen | Eine 3D-Polylinie an einem Civil-Element | Eine 3D-Polylinie an einem Proxy |
| Korridore | IfcRoad mit Straßenteilen; Fahrstreifen, Bankette, Rinnen und Gehwege als IfcPavement, Bordsteine als IfcKerb, Begrünungsstreifen; jede Belagsschicht als IfcCourse mit Dicke, Material und Volumen; die Seitenböschungen als IfcEarthworksCut und IfcEarthworksFill mit den Abtrags- und Auftragsvolumen; die Entwurfsgeschwindigkeit und -klasse | Civil-Elemente, benannt nach dem, was sie sind, je Straße gruppiert | Proxies, je Straße gruppiert |
| Oberflächen | IfcGeographicElement TERRAIN mit einem unregelmäßigen Dreiecksnetz (TIN) | Triangulierte Flächensätze | Flächenbasierte Oberflächenmodelle (größere Dateien) |
| Plateaus und Mauern | Die Plateauoberkante, ihre Böschungen als Erdarbeiten, Stützmauern als IfcWall RETAININGWALL | Ebenso, die Mauer als benutzerdefinierter Wandtyp | Ebenso, der Typ der Mauer in ObjectType |
| Rohrnetze | IfcPipeSegment und IfcDistributionChamberElement in einem IfcDistributionSystem | Ebenso | IfcFlowSegment und Schächte in einem IfcSystem |
| Georeferenzierung | IfcProjectedCRS und IfcMapConversion | Ebenso | ePSet_ProjectedCRS und ePSet_MapConversion am Gelände |

Eine **Eisenbahn** (eine Trasse mit aktivierter Option Eisenbahn) geht in IFC 4.3 als IfcRailway über: ihre Übergänge als eigene Typen (Klothoide, kubische Parabel, Bloss, Helmert, Sinus-Halbwelle als Kosinuskurve, Sinus), ihre Überhöhung als IfcAlignmentCant und ihr Gleis als Schienen, Schwellen und Schotterbett, mit dem Unterschotter darunter. IFC4 und IFC2x3 erhalten dieselben Teile als Civil-Elemente oder Proxies. Beim Öffnen einer IFC-4.3-Eisenbahn kommen ihre Übergänge und ihre Überhöhung zurück.

Jede Datei enthält außerdem Flurstücke (Grundflächen), die Pflanzen und befestigten Flächen des Arbeitsbereichs Landschaft sowie Baukörper (jeweils ein IfcBuilding mit seinen Geschossen), alle auf einem Grundstück. Eigenschaftssätze enthalten, was Sie entworfen haben: Stationen, den Regelquerschnitt, Böschungen von Abtrag und Auftrag, Fahrstreifenbreite und -anzahl, Sohlen, Deckelhöhen, Mauerhöhen. Mengen (Längen, Flächen, Volumen) sind IfcElementQuantity-Sätze.

## Einheiten und Koordinaten

Die Datei verwendet die Längeneinheit des Projekts (Meter oder US-Survey-Fuß); Flächen und Volumen sind in Quadrat- und Kubikmetern. Mit einem Koordinatensystem (GIS › Koordinaten) wird die Datei auf der Karte platziert: Rechts- und Hochwert ihres Ursprungs sowie Drehung und Maßstab eines lokalen Gelände-Koordinatensystems stehen in der Kartenumrechnung. Ohne ein Koordinatensystem speichert die Datei ihren lokalen Ursprung in einem Eigenschaftssatz und wird nicht auf einer Karte platziert.

## Importieren

Öffnen Sie eine .ifc-Datei mit {{ui:Open}} oder ziehen Sie sie auf den Plan. Der Importdialog sagt, was die Datei enthält:

- **Trassen** aus IFC 4.3 (die horizontalen und vertikalen Achsen) und Trassenkurven aus IFC 4x1 werden zu CivilCraft-Trassen mit ihren PIs, Radien, Übergangslängen und PVIs. Eine Trasse, die das PI-Modell von CivilCraft nicht halten kann (zusammengesetzte Bögen, Übergänge zwischen zwei Bögen, eine, die in einem Bogen beginnt oder endet), wird nicht importiert, und der Dialog nennt den Grund.
- **Oberflächen**: Wählen Sie die, die zum Bestandsgelände wird, oder behalten Sie die des Projekts.
- **Alles Übrige** (und die übrigen Oberflächen) kann in der 3D-Ansicht als Referenz angezeigt werden. Referenzelemente bleiben geöffnet, solange das Projekt offen ist; sie werden nicht in der Projektdatei gespeichert.

Eine Datei, die CivilCraft in IFC4 oder IFC2x3 geschrieben hat, bringt ihre Trassen über ihre Eigenschaftssätze genau zurück.

## Noch nicht umgesetzt

- Die Querneigung einer Straße wird als Querneigungsereignisse und in den Straßenoberflächen geschrieben (die Überhöhung gilt für Eisenbahnen).
- Das Speichern von Referenzelementen in der Projektdatei sowie das Importieren von Rohrnetzen oder Plateaus aus IFC als bearbeitbare Objekte.
