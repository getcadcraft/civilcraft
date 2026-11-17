---
title: Kartenlayer unter dem Plan anzeigen
summary: Ein georeferenziertes Bild, Kartenkacheln, einen WMS- oder WMTS-Server oder einen Kartendienst als Geländekontext unter den Plan legen, mit der Internet-Einstellung, Deckkraft, Reihenfolge und Quellenangabe.
keywords: Kartenlayer, Basiskarte, Hintergrund, Luftbild, Orthofoto, Luftbilder, Satellit, Raster, World-Datei, pgw, jgw, tfw, wld, geotiff, georeferenziertes Bild, xyz, Kacheln, Slippy Map, wms, wmts, getcapabilities, Kartendienst, rest, mapserver, imageserver, usgs, national map, Quellenangabe, Deckkraft
from: 32d7718e
---

Kartenlayer sind Bilder, die unter Ihrem Entwurf liegen: ein Luftbild mit seiner World-Datei oder Karten von Servern im Internet. Sie sind nur auf dem Bildschirm Geländekontext: Sie sind **nicht** in PDF-Ausdrucken, DXF- oder DWG-Exporten oder in der 3D-Ansicht enthalten.

Wählen Sie {{ui:Karte}} in der Gruppe {{ui:GIS}}. Das Dialogfeld **Kartenlayer** listet die Layer des Projekts auf und fügt neue hinzu. Kartenlayer benötigen das Koordinatensystem des Projekts ([Das Koordinatensystem des Projekts festlegen](topic:coordinate-systems)), außer bei einem Bild, dessen World-Datei die eigenen Koordinaten des Projekts verwendet.

## Die Internet-Einstellung

CivilCraft fragt einen Kartenserver nie nach etwas, bis Sie es erlauben: {{ui:Einstellungen}}, {{ui:CivilCraft}}, **Kartenlayer aus dem Internet**: **Aus** (der Anfangszustand) oder **Ein**.

:::note
Wenn eingeschaltet, fragt CivilCraft die Kartenserver, die Sie hinzufügen, nach Bildern des Bereichs auf dem Bildschirm. Ihre Zeichnung bleibt auf diesem Computer; der Server sieht den Bereich und Ihre Internetadresse.
:::

Solange sie aus ist, werden Internet-Layer im Dialogfeld aufgelistet, aber ausgegraut mit dem Grund; nichts wird gezeichnet oder angefragt. Das Öffnen eines Projekts, das Kartenserver nennt, kontaktiert diese ebenfalls nicht. Ein Bild aus einer Datei funktioniert in beiden Fällen. Die Schaltfläche {{ui:Einstellungen öffnen}} im Dialogfeld bringt Sie dorthin.

## Ein georeferenziertes Bild (funktioniert offline)

1. Behalten Sie unter **Layer hinzufügen** die Option **Georeferenziertes Bild** und wählen Sie die Dateien: das Bild (PNG oder JPEG) **zusammen mit** seiner World-Datei (`.pgw` für PNG, `.jgw` für JPEG oder `.wld`) und, falls vorhanden, seiner `.prj`. Sie können sie auch gemeinsam auf den Plan ziehen.
2. Ohne `.prj` fragt CivilCraft, welches System die World-Datei verwendet: {{ui:Das System des Projekts}} (am häufigsten), {{ui:System wählen …}} oder, in einem Projekt ohne System, **Projektkoordinaten**.
3. Das Bild erscheint unter dem Plan, und {{ui:Einpassen}} berücksichtigt es.

Ein RGB-GeoTIFF (ein als GeoTIFF gespeichertes Luftbild) enthält seine eigene Platzierung und sein System: Öffnen Sie es für sich allein. Das Bild wird **in der Projektdatei** gespeichert (bis zu 25 MB); ein größeres wird mit seiner Größe abgelehnt, speichern Sie daher eine kleinere Kopie (weniger Pixel oder JPEG).

## Kacheln, WMS, WMTS und Kartendienste

Schalten Sie zuerst **Kartenlayer aus dem Internet** ein. Dann, unter **Layer hinzufügen**:

| Quelle | Was einzufügen ist | Was CivilCraft tut |
|---|---|---|
| Kachel-URL | Eine Vorlage mit `{z}`, `{x}` und `{y}` (oder `{-y}`) sowie `{s}` für einen Serverbuchstaben, zum Beispiel `https://tile.example.org/{z}/{x}/{y}.png`. Geben Sie einen Namen und die Quellenangabe an. | Kacheln in Web Mercator für den Bereich und den Zoom auf dem Bildschirm. |
| WMS-Server | Die Adresse des Servers oder sein GetCapabilities-Link. Wählen Sie {{ui:Die Layer holen}}, dann den Layer. | Ein Bild des Bereichs auf dem Bildschirm, angefragt im EPSG-Code des Projekts, wenn der Server ihn anbietet, sonst in Web Mercator oder WGS 84. |
| WMTS-Server | Die Adresse des Servers oder seine `WMTSCapabilities.xml`. Wählen Sie {{ui:Die Layer holen}}, dann den Layer und das Kachelmatrixset. | Kacheln aus dem Set im System des Projekts, wenn vorhanden, sonst Web Mercator. |
| ArcGIS-Kartendienst (REST) | Eine URL, die auf `/MapServer` oder `/ImageServer` endet. Wählen Sie {{ui:Den Dienst lesen}}. | Zwischengespeicherte Web-Mercator-Dienste werden aus ihren Kacheln gezeichnet; andere werden nach einem Bild des Bereichs auf dem Bildschirm gefragt. |

Es sind keine Server voreingestellt. Öffentliche Beispiele, alle aus dem USGS National Map (gemeinfrei):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Kartendienst: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (außerdem `USGSImageryOnly` für Luftbilder)

Viele Stadt- und Kreis-GIS-Stellen veröffentlichen eigene WMS oder Kartendienste; ihre GIS-Seiten nennen die Adresse. Ein Server, der eine Anmeldung oder einen Schlüssel verlangt, funktioniert nicht: CivilCraft sendet keine Benutzernamen, Passwörter oder Schlüssel.

## Wie Layer gezeichnet werden

- Bilder in einem anderen System als dem des Projekts werden in es verzerrt übertragen: Das Bild wird in Stücke geteilt, jedes so platziert, dass es innerhalb von 0.25 Bildschirmpixeln liegt, wo eine exakte Umrechnung es hinsetzt.
- Kacheln werden für den Bereich auf dem Bildschirm und den Zoom gewählt: nie mehr als 64 für eine Ansicht, 6 gleichzeitig. Beim Verschieben oder Zoomen werden Anfragen für die alte Ansicht abgebrochen. Etwa 200 Kacheln werden im Speicher gehalten (nichts wird auf der Festplatte gespeichert).
- Ein WMS- oder Kartendienstbild wird angefragt, sobald die Ansicht nicht mehr bewegt wird; bis es eintrifft, bleibt das letzte an seiner Stelle.
- Die Quellenangabe jedes Layers erscheint auf dem Bildschirm klein unten rechts im Plan.

## Layer ändern, anordnen und entfernen

Im Dialogfeld hat jeder Layer ein Kontrollkästchen zum Ein- und Ausblenden, einen Schieberegler **Deckkraft**, Pfeile, um ihn früher (tiefer) oder später (oben) zu zeichnen, eine Zoom-Schaltfläche (Bilder) und eine Entfernen-Schaltfläche. Der erste Layer in der Liste wird ganz unten gezeichnet. Jede Änderung ist ein einzelner Rückgängig-Schritt.

## Wenn ein Layer nichts zeigt

Der Grund erscheint einmal in der Statusleiste und bleibt unter dem Namen des Layers im Dialogfeld stehen:

| Meldung | Was zu tun ist |
|---|---|
| Aus: Kartenlayer aus dem Internet sind in den Einstellungen ausgeschaltet. | Schalten Sie **Kartenlayer aus dem Internet** ein. |
| Benötigt das Koordinatensystem des Projekts | Legen Sie es unter {{ui:Koordinaten}} fest. |
| Der Server hat nicht erlaubt, dass diese Seite seine Bilder verwendet (CORS), oder er ist nicht erreichbar. | Der Server erlaubt Webseiten nicht, seine Bilder zu verwenden, oder er ist nicht erreichbar. Nach vier Ablehnungen fragt CivilCraft nicht mehr; blenden Sie den Layer aus und wieder ein, um es erneut zu versuchen. |
| Der Server antwortete mit 404 … / Der Server sendete text/xml statt eines Bildes: … | Die URL, der Layer oder der Stil ist falsch, oder die Meldung des Servers sagt, was er verlangt. |
| Dieser Layer wird im System des Projekts, in Web Mercator oder WGS 84 nicht angeboten | Der Server kann dort nicht zeichnen, wo CivilCraft ihn platzieren kann. |

## Was geprüft wurde

- Kachelnummern wurden gegen die standardmäßige Web-Mercator-Kachelung geprüft; WMS-1.1.1- und 1.3.0-, WMTS- und Kartendienst-Antworten wurden aus handgeschriebenen Dateien und aus echten, vom USGS National Map und von terrestris-OpenStreetMap-Servern gespeicherten Antworten gelesen; WMS-1.3.0-Anfragen setzen für EPSG:4326 laut Standard die Breite zuerst.
- Die Verzerrung wurde mit einer exakten Umrechnung je Pixel anhand der Zahlen von PROJ verglichen: innerhalb von 0.13 px für Kacheln, WMS-Bilder und ein landkreisgroßes Bild, im Geländemaßstab und herausgezoomt.
- Ein Bild mit seiner World-Datei und ein von GDAL (über rasterio) geschriebenes RGB-GeoTIFF wurden dort gezeichnet, wo ihre Platzierung es angibt, und im Browser Pixel für Pixel geprüft.
- Im Browser, gegen einen Ersatzserver auf dem Testcomputer: Kacheln landen in der Kachel, in die PROJ jeden Punkt legt, ein WMS-Bild landet innerhalb von 2 px, höchstens 6 Anfragen laufen gleichzeitig, und bei ausgeschalteter Einstellung verlässt keine Anfrage die Seite. Der oben genannte Kartendienst des USGS National Map wurde außerdem einmal live im Browser gelesen und gezeichnet (seine Kacheln kamen an und wurden gezeichnet, mit seinem Copyright-Text); die anderen öffentlichen Server wurden nur aus gespeicherten Antworten gelesen.
