---
title: Koordinatensystem des Projekts festlegen
summary: Festlegen, in welchem Koordinatensystem die Vermessung liegt, damit CivilCraft Breiten- und Längengrad anzeigt, GIS-Dateien und Kartenebenen einordnet und .prj-Dateien schreibt. Auswahl über Code, Name, die Koordinaten selbst oder eine .prj-Datei.
keywords: Koordinatensystem, CRS, EPSG, SRID, State Plane, SPCS, UTM, NAD83, WGS 84, Projektion, PRJ, WKT, Datum, Breitengrad, Längengrad, Lat Long, geografisch, Raster, Georeferenzierung, Koordinatensystem zuweisen
from: 964250e2
---

Die Koordinaten eines Projekts sind reine Zahlen, bis Sie festlegen, was sie bedeuten. Das Festlegen des Koordinatensystems **verschiebt nie etwas**: Es teilt CivilCraft mit, dass zum Beispiel E 6,150,000 N 2,080,000 Koordinaten im State Plane der Zone 6 Kalifornien in US survey feet sind. Sobald CivilCraft das weiß:

- zeigt die Statusleiste Breiten- und Längengrad des Zeigers,
- werden GIS-Dateien in anderen Systemen (Shapefiles, GeoJSON, GeoPackage, Höhenraster, LiDAR) beim Öffnen in das Projekt umgerechnet,
- können Kartenebenen unter dem Plan gezeichnet werden ([Kartenebenen unter dem Plan anzeigen](topic:map-layers)),
- enthalten Exporte in GIS-Formate das System (eine `.prj` für Shapefiles, den EPSG-Code für GeoPackage und GeoTIFF).

## System auswählen

1. Wählen Sie {{ui:Koordinaten}} in der Gruppe {{ui:GIS}} der Symbolleiste. Das Dialogfeld **Koordinatensystem** öffnet sich. Oben steht, in welchem System das Projekt aktuell liegt, oder **Keines — Koordinaten sind nur Zahlen**.
2. Suchen Sie das System auf eine dieser Arten:
   - **Suche**: Geben Sie den EPSG-Code ein (`2277`, `EPSG:2277`) oder Wörter aus dem Namen (`texas central`, `utm 14n`, `lambert-93`). Bei Codes werden Systeme ab dem eingegebenen Code aufgelistet. Bei Wörtern werden Systeme aufgelistet, deren Name alle Wörter enthält.
   - {{ui:Systeme, in die diese Koordinaten passen}} (wenn das Projekt Punkte oder eine Fläche hat): CivilCraft liest die Mitte Ihres Projekts in jedem System der Einheitenfamilie des Projekts und listet die auf, deren Anwendungsbereich sie enthält. State-Plane-Koordinaten passen meist nur zu wenigen Zonen: Ein Projekt in Texas mit E 3,115,000 N 10,070,000 US survey feet passt zu den vier Varianten Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Jeder Eintrag zeigt, wo die Mitte Ihres Projekts läge.
   - **In der Nähe (Breite, Länge)** und {{ui:Vorschlagen}}: Geben Sie ein, wo das Gelände liegt, zum Beispiel `30.27, -97.74` oder `30°16′N 97°44′W`. CivilCraft listet die projizierten Systeme, in deren Bereich es liegt, zuerst die nationalen und staatlichen Raster.
   - {{ui:Eine .prj-Datei lesen …}}: Öffnen Sie die `.prj`-Datei, die zu einem Shapefile oder einer Zeichnung gehört. CivilCraft ordnet sie anhand der Projektionsberechnung seiner Liste zu (eine `.prj`, die ein Datum anders benennt, findet also trotzdem das richtige System) und nennt, welches es ist. Wenn nichts genau passt, wird die eigene Beschreibung der Datei verwendet. Sie können eine `.prj` auch auf das Dialogfeld ziehen oder allein auf den Plan öffnen oder dort ablegen.
3. Klicken Sie auf ein System in der Liste. Unter **Gewählt** werden Name, EPSG-Code, Einheit, wie gut sein Datum an WGS 84 angebunden ist, sein Anwendungsbereich in Breiten- und Längengrad und die Lage der Mitte Ihres Projekts darin angezeigt.
4. Lassen Sie **Raster** ausgewählt (bei den meisten Projekten; für die anderen siehe [Gelände- und lokale Koordinaten](topic:ground-and-local-coordinates)) und wählen Sie {{ui:Übernehmen}}.

Die Statusleiste zeigt nun Breiten- und Längengrad des Zeigers neben E und N. Das Festlegen des Systems ist ein Schritt für Rückgängig: {{key:Mod+Z}} macht es rückgängig.

:::note
Die Einheiten müssen übereinstimmen: Ein Projekt in Fuß nimmt Systeme in US survey feet oder internationalen Fuß, ein Projekt in Metern nimmt Systeme in Metern. CivilCraft erklärt eine Ablehnung („Das Projekt ist in Fuß, dieses System ist aber in Metern …“). Ein Projekt in Fuß mit einem System in US survey feet verwendet Survey-Fuß: Das „ft“ des Projekts bedeutet den Fuß des Systems. Geografische Systeme (Breiten- und Längengrad, wie WGS 84 selbst) können nicht das System eines Projekts sein: Zeichnungen brauchen Rechts- und Hochwerte.
:::

## System ändern oder entfernen

Öffnen Sie {{ui:Koordinaten}} erneut, wählen Sie ein anderes System und wählen Sie {{ui:Übernehmen}}. Hat das Projekt Punkte oder einen Entwurf, fragt CivilCraft **Liegen die Koordinaten schon in …?**

- {{ui:Ja — nichts verschieben}}: Die Zahlen bleiben, wie sie sind, und nur ihre Bedeutung ändert sich. Verwenden Sie das, wenn das alte System versehentlich gewählt wurde.
- {{ui:Nein — umrechnen}}: Jeder Vermessungspunkt, jede Bruchkante, jede Begrenzung, jeder PI der Trasse, jede Plateauecke und jedes Bauwerk wird vom alten in das neue System umgerechnet, in einem Schritt für Rückgängig. Eine als Dreiecke aus LandXML eingelesene Fläche kann nicht umgerechnet werden; bauen Sie sie zuerst aus den Punkten neu auf.

{{ui:Das System entfernen}} nimmt das System weg (nichts wird verschoben). GIS-Ebenen, die bereits im Projekt sind, bleiben, wo sie sind.

## Breiten- und Längengrad in der Statusleiste

Solange das Projekt ein System hat, zeigt die Statusleiste Breiten- und Längengrad des Zeigers auf WGS 84, zum Beispiel `30°18′00.00″ N  97°42′00.00″ W`. Wählen Sie stattdessen Dezimalgrad unter {{ui:Einstellungen}}, {{ui:CivilCraft}}, **Breiten- und Längengrad** ([CivilCraft-Einstellungen](topic:settings)). Bei Gelände- oder lokalen Koordinaten läuft die Anzeige zuerst durch diesen Schritt, sodass sie für den Punkt unter dem Zeiger stimmt.

## Wie gut die Datumsverschiebung ist

Breiten- und Längengrad, GeoJSON und Kartenebenen liegen alle auf WGS 84. Die Anbindung jedes Systems an WGS 84 wird im Dialogfeld angezeigt:

| Was das Dialogfeld sagt | Was es bedeutet |
|---|---|
| WGS 84 selbst | Gar keine Verschiebung. |
| NAD83 wird als WGS 84 angenommen | Beide unterscheiden sich in weiten Teilen Nordamerikas um ein bis zwei Meter, höchstens einige Meter. Gut für Kartenebenen und den Kontext des Geländes; nicht für Vermessungsfestpunkte. |
| Bekannt auf etwa *n* m (Angabe von EPSG) | Eine veröffentlichte Verschiebung; Kartenebenen und GeoJSON können um etwa diesen Betrag abweichen. |
| Für dieses Datum nicht bekannt | Ohne Rasterdatei gibt es keine veröffentlichte Verschiebung: Kartenebenen und GeoJSON können um Hunderte Meter abweichen. |
| Aus der Rasterverschiebungsdatei … | Eine Rasterverschiebungsdatei wird verwendet (unten): innerhalb des Rasters etwa 10 cm genau gegenüber NAD83. |

Die eigenen Koordinaten Ihres Projekts durchlaufen nie eine Datumsverschiebung: Nur was in Breiten- und Längengrad umgerechnet wird oder daraus kommt, tut das. Vertikale Datums und Geoidmodelle werden nicht behandelt (Höhen werden nie umgerechnet). Wo die beste Verschiebung eine Rasterdatei braucht, enthält die Liste eine gröbere veröffentlichte Verschiebung. Das Dialogfeld zeigt deren Genauigkeit (etwa 20 m bei NAD27-Systemen), bis Sie das Raster hinzufügen.

## Rasterverschiebungsdateien

Bei einem NAD27-System bringt **Rasterverschiebungsdatei** im Dialogfeld Koordinatensystem Breiten- und Längengrad, GIS-Dateien und Kartenebenen auf etwa 10 cm genau gegenüber NAD83 statt etwa 20 m:

- **Herunterladen** des Rasters, das für den Bereich des Systems vorgeschlagen wird (NADCON5 für die zusammenhängenden USA, NADCON für Alaska, NTv2 für Kanada), von cdn.proj.org, dem öffentlichen Rasterserver von PROJ. Nur der Dateiname des Rasters wird gesendet.
- Oder **Rasterdatei hinzufügen …**, wenn Sie bereits eine haben: NTv2 (`.gsb`) oder ein PROJ-GeoTIFF-Raster (`.tif`), bis 20 MB.

Das Raster wird in der Projektdatei gespeichert und wandert so mit dem Projekt. Der Abschnitt sagt, ob die Mitte des Projekts im Raster liegt. Außerhalb wird gar keine Verschiebung angewendet, verwenden Sie also ein Raster, das das Gelände abdeckt. **Raster nicht mehr verwenden** führt zur groben Verschiebung zurück. Jede Änderung ist ein Schritt: {{key:Mod+Z}} macht sie rückgängig.

GIS-Ebenen, die bereits im Projekt sind, bleiben an ihrer Stelle, wenn sich das Raster ändert. Importieren Sie sie erneut, um sie über das Raster zu platzieren. Die eigenen Koordinaten des Projekts werden nie verschoben.

## Was geprüft wurde

- Jede Umrechnung wurde mit PROJ verglichen (pyproj 3.7.1 mit PROJ 9.5.1), der Koordinatenbibliothek, die die meisten GIS-Programme verwenden, bei über 330 Systemen: State Plane in US survey feet und Fuß, UTM Nord und Süd, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator und Web-Mercator unter anderem. Rechts- und Hochwerte stimmen mit derselben Datumsverschiebung auf 1 cm überein (meist deutlich unter 1 mm), und die Projektionsberechnungen stimmen mit den eigenen Definitionen von PROJ auf 1 cm überein.
- `.prj`-Dateien, die PROJ in beiden gängigen Formen (ESRI und OGC) schreibt, wurden für 105 Systeme zurückgelesen: 208 von 210 stimmten mit ihrem exakten EPSG-Code überein, die beiden anderen mit einem System mit derselben Berechnung auf demselben Ellipsoid. Von CivilCraft geschriebene `.prj`-Dateien liest PROJ als dasselbe System. ESRI-`.prj`-Dateien für polarstereografische Systeme (UPS, Alaska polar) können nicht gelesen werden; wählen Sie diese Systeme über den Code aus.
- Breiten- und Längengrad in der Statusleiste stimmten im Browser mit PROJ auf 0.01″ überein.
