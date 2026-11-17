---
title: Startwerte und Platzhalter
summary: Alle Werte, mit denen CivilCraft beginnt: für neue Projekte, Anzeige, Trassen, Plateaus, Korridore, Rohrnetze, Volumen und Plots, und welche davon Platzhalter sind, die Sie ersetzen sollten.
keywords: Standardwerte, Einstellungen, Startwerte, Platzhalter, Entwurfskriterien, Normen, Regeln, Annahmen
from: fbfc7432
---

CivilCraft hat keinen Einstellungsdialog und keine Vorlage. Dies sind die Werte, mit denen Dinge beginnen. Werte, die als **Platzhalter** markiert sind, stammen aus keiner Norm: Ersetzen Sie sie durch die Kriterien Ihres Projekts, bevor Sie sich auf eine Prüfung oder eine Menge verlassen.

## Neues Projekt

| Einstellung | Wert |
|---|---|
| Name | Unbenanntes Gelände (der Name der ersten Punktdatei ersetzt ihn) |
| Einheiten | US feet |
| Name des Geländemodells | {{ui:Bestandsgelände}} |
| Punktgruppen | Jede Gruppe beginnt als {{ui:Punkte}} |
| Längste äußere Kante | 0 (jedes Dreieck behalten) |
| Gespeicherte Schritte für Rückgängig | 200 |

## Anzeige

| Einstellung | Wert |
|---|---|
| Geländemodell | {{ui:Bestandsgelände}} |
| Höhenlinien alle | 1 (ft oder m) |
| Hauptlinien alle | jede 5. Höhenlinie |
| Stufen | 8 |
| Ein | Höhenlinien, Höhenlinienbeschriftung, Punkte, Bruchkanten, Geländemodellrand, Rohre |
| Aus | Dreiecke, Höhenstufen, Gefällepfeile, Punktbeschriftung |

## Trassen und Längsschnitte

| Einstellung | Wert |
|---|---|
| Name | Trasse 1, Trasse 2 … |
| Anfangsstation | 0+00 |
| Kurvenradius an jedem inneren PI | 100 ft oder 30 m, kleiner, wenn das nicht in die Hälfte jeder Tangente passt |
| Entwurfslängsschnitt | Keiner, bis Sie einen beginnen; {{ui:Vom Gelände aus beginnen}} setzt an jedem Ende einen PVI auf das Gelände |
| Länge des Vertikalbogens | 0 (kein Bogen), bis Sie einen eingeben |

## Plateaus

| Einstellung | Wert |
|---|---|
| Name | Plateau 1, Plateau 2 … |
| Höhe | Das Gelände in der Mitte des Plateaus, auf 0.1 gerundet (0, wenn die Mitte außerhalb des Geländemodells liegt) |
| Abtragsneigung | 2 : 1 (Platzhalter) |
| Auftragsneigung | 3 : 1 (Platzhalter) |

## Korridor-Assembly (Platzhalter)

| Einstellung | US feet | Meter |
|---|---|---|
| Fahrstreifenbreite | 12 ft | 3.6 m |
| Fahrstreifenneigung | 2% | 2% |
| Bankettbreite | 4 ft | 1.2 m |
| Banketteneigung | 4% | 4% |
| Abtragsneigung | 2 : 1 | 2 : 1 |
| Auftragsneigung | 3 : 1 | 3 : 1 |
| Querschnitt alle | 10 ft | 5 m |

## Rohrnetz

| Einstellung | US feet | Meter |
|---|---|---|
| Name und Typ | Regenwasser, Regenwasser | Regenwasser, Regenwasser |
| Kleinstes Gefälle (Platzhalter) | 0.50% | 0.50% |
| Kleinste Überdeckung (Platzhalter) | 2 ft | 0.6 m |
| Absturz in Bauwerken (Platzhalter) | 0.10 ft | 0.03 m |
| Durchmesser neues Bauwerk | 48 in | 1200 mm |
| Durchmesser neues Rohr | 12 in | 300 mm |
| Sumpftiefe | 0 | 0 |
| Deckelhöhe | Vom Geländemodell | Vom Geländemodell |

Ein aus LandXML geöffnetes Rohrnetz verwendet diese Regeln ebenfalls, weil LandXML sie nicht enthält.

## Volumen

| Einstellung | Wert |
|---|---|
| Methode | Raster, abgetastet an den Zellmitten innerhalb der Böschungslinien |
| Zellgröße | Gewählt so, dass das umschließende Rechteck der modellierten Fläche etwa 250,000 Zellen enthält (1, 2 oder 5 mal eine Zehnerpotenz) |
| Auflockerung und Verdichtung | Keine |

## Plotausgabe

| Einstellung | Wert |
|---|---|
| Bereich | {{ui:Alles}} |
| Papier | Tabloid 11 × 17 in (Fuß-Projekte), ISO A3 (Meter-Projekte); immer Querformat |
| Maßstab | Der größte aufgeführte Maßstab, der passt |
| Farben | {{ui:Layerfarben}} |

DXF-Beschriftungen sind für den Maßstab bemessen, in dem alles auf Tabloid (Fuß) oder A3 (Meter) passt.
