---
title: LandXML: was gelesen und geschrieben wird
summary: Die LandXML-1.2-Elemente und -Attribute, die CivilCraft liest und schreibt, Element für Element, und alles, was es überspringt.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, Feature-Linie, Schema
from: ca3cf359
---

CivilCraft schreibt LandXML 1.2 mit dem offiziellen Namensraum und der Schemaadresse. Es liest jede Datei, deren Wurzelelement `LandXML` ist, und übernimmt die unten genannten Elemente anhand ihres Namens (Namensraum-Präfixe werden ignoriert; die Version wird nicht geprüft). Der XML-Leser akzeptiert nur die fünf Standardentitäten und numerische Zeichenreferenzen; er lädt nie eine DTD oder externe Datei. Die Schritte finden Sie unter [LandXML austauschen](topic:landxml).

LandXML schreibt Koordinaten mit dem Hochwert zuerst: ein Punkt ist "N E" oder "N E Z".

## Geschrieben

| Element | Was CivilCraft schreibt |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, Flächen in Quadratfuß, Volumen in Kubikyard, Durchmesser in Zoll) oder `Metric` (Meter, Quadratmeter, Kubikmeter, Millimeter) |
| `Project` | `name` = der Projektname |
| `Application` | Name CivilCraft, Hersteller CadCraft |
| `CgPoints` / `CgPoint` | `name` = Punktnummer, `desc` = Beschreibung, `code` = Gruppe; Text "N E Z" (oder "N E" ohne Höhe) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw oder ccw, `radius`, `length`, `staStart`, `chord`, `delta` (Grad), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | das vorhandene Gelände entlang der Trasse als Paare aus Station und Höhe (`PntList2D`), geteilt dort, wo es die Oberfläche verlässt |
| `Profile` / `ProfAlign` | das Entwurfsprofil (benannt „<alignment> design“): `PVI` für Enden und Knickpunkte, `ParaCurve` mit `length` für Vertikalkurven |
| `Surfaces` / `Surface` | `name` und `desc`; zuerst das vorhandene Gelände, dann "Proposed", wenn Bauplätze oder Korridore die Geländemodellierung ändern |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (nur vorhandenes Gelände) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (nur vorhandenes Gelände, falls vorhanden) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` mit `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm oder sanitary |
| `Struct` | `name`, `elevRim` (der verwendete Deckel, festgelegt oder aus der Oberfläche), `elevSump`; `Center`; `CircStruct` mit `diameter`; `Invert` mit `elev`, `flowDir` in oder out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` mit `diameter` |
| `PlanFeatures` / `PlanFeature` | eine je Feature-Linie: `name`; `CoordGeom` mit `Line` (`length`, `Start`, `End`) und `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` und `End` als "N E Z", `Center` als "N E"); `Feature` `code="CivilCraft"` mit `Property`-Verwendung und geschlossen |

Nicht geschrieben: Bauplätze und Korridore als Objekte (ihr Ergebnis ist die Oberfläche "Proposed"), Trassen mit Fehlern, Rohre ohne beide Sohlen, Netzregeln.

## Gelesen

| Element | Was CivilCraft übernimmt |
|---|---|
| `Units` | `Imperial` oder `Metric` und ihr `linearUnit` entscheiden über Fuß oder Meter. Eine unbekannte Einheit wird vermerkt. |
| `Project` | `name` wird zum Projektnamen. |
| `CgPoints` / `CgPoint` (auch verschachtelt) | Name (oder `oID`), "N E" oder "N E Z", `desc` (oder `code`) als Beschreibung |
| `Surface` mit `Definition surfType="TIN"` | `Pnts` und `Faces` als vorhandenes Gelände (nur die erste Oberfläche); unsichtbare Flächen (`i="1"`) werden ausgelassen |
| `SourceData` / `Breaklines` | 3D-Bruchkanten, bleiben mit der Oberfläche erhalten |
| `SourceData` / `Boundaries` | die äußere Grenze |
| `Alignment` / `CoordGeom` | `Line`- und `Curve`-Elemente; PIs werden aus dem `PI` jeder Kurve oder aus ihrem `Center` und den Tangenten neu aufgebaut; `staStart` |
| `Profile` / `ProfAlign` | `PVI` und `ParaCurve` (mit `length`); das erste Entwurfsprofil mit mindestens zwei PVIs |
| `PlanFeatures` / `PlanFeature` | jeweils als Feature-Linie: `Line`, `Curve` (ihre `Start`, `Center`, `End` und `rot`) und `IrregularLine` (`PntList3D` oder `PntList2D`), Ende an Ende verbunden (eine Lücke wird mit einem geraden Segment verbunden und vermerkt); geschlossen, wenn sie dort endet, wo sie begann; Verwendung und Geschlossenheit aus dem eigenen `Feature` von CivilCraft, sonst **Nur gezeichnet**. Punkte ohne Höhe erhalten 0 (vermerkt). |
| `Spiral` | Klothoiden neben einer `Curve` (ein- und ausgehend; gelesen als PI mit Radius und Spirallängen, zurückgeschrieben mit `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | das erste Netz mit Rohren: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct`-Durchmesser, `Invert` je Rohr) und `Pipe` (`refStart`, `refEnd`, `CircPipe`-Durchmesser) |

## Übersprungen und in den Hinweisen genannt

- Oberflächen nach der ersten, Rasteroberflächen und andere Nicht-TIN-Oberflächen
- Trassen, die `IrregularLine`- oder `Chain`-Elemente enthalten, Spiralen außer Klothoiden, eine Spirale zwischen zwei Kurven oder Trassen ohne Geometrie
- Entwurfsprofile nach dem ersten; vertikale Kurven `CircCurve` und `UnsymParaCurve` (ihre PVIs bleiben ohne Kurve erhalten)
- Punkte, die nur auf andere Punkte verweisen (`pntRef`), und Punkte ohne lesbare Koordinaten
- Wiederholte Punktnamen (der erste bleibt erhalten)
- Grenzen zum Ausblenden, Einblenden und für Datenbeschnitt; Bruchkanten ohne 3D-Punkte
- Rohrnetze nach dem ersten; andere Netztypen als storm und sanitary (als storm gelesen)
- Rechteckige, Einlauf- und Auslaufbauwerke (als rund gelesen); Ei-, elliptische und Kastenrohre und -kanäle (als runde Rohre ohne Größe gelesen)
- `Spiral`-Elemente in Feature-Linien
- `Parcels`, `Roadways`, `GradeModel` und `Survey`

Geländeprofile (`ProfSurf`) in einer Datei werden nicht verwendet: CivilCraft entnimmt das Gelände direkt aus der Oberfläche.

## Meldungen, wenn eine Datei nicht geöffnet werden kann

| Meldung | Bedeutung |
|---|---|
| „Das ist XML, aber kein LandXML (das Wurzelelement ist <…>).“ | Die Datei ist eine andere Art XML. |
| „… hat keine Punkte, TIN-Oberflächen oder Trassen, die CivilCraft lesen kann.“ | Alles in der Datei steht auf der Liste der übersprungenen Elemente. Die Hinweise danach sagen, was vorhanden war. |
| „Nicht passendes End-Tag …“, „Nicht geschlossenes Tag …“, „Die Datei endet innerhalb von …“ | Die Datei ist beschädigt oder abgeschnitten. |
