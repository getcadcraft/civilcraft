---
title: Kaartlagen onder het plan tonen
summary: Een georefereerde afbeelding, kaarttegels, een WMS- of WMTS-server of een kaartservice onder het plan als terreincontext plaatsen, met de internetinstelling, dekking, volgorde en bronvermelding.
keywords: kaartlagen, achtergrondkaart, basiskaart, achtergrond, luchtfoto, orthofoto, beeldmateriaal, satelliet, raster, wereldbestand, pgw, jgw, tfw, wld, geotiff, georefereerde afbeelding, xyz, tegels, verschuifbare kaart, wms, wmts, getcapabilities, kaartservice, rest, mapserver, imageserver, usgs, national map, bronvermelding, dekking
from: 32d7718e
---

Kaartlagen zijn afbeeldingen die onder uw ontwerp worden getekend: een luchtfoto met zijn wereldbestand, of kaarten van servers op internet. Ze zijn alleen terreincontext op het scherm: ze staan **niet** in PDF-afdrukken, DXF- of DWG-exports, of de 3D-weergave.

Kies {{ui:Kaart}} in de groep {{ui:GIS}}. Het dialoogvenster **Kaartlagen** toont de lagen van het project en voegt nieuwe toe. Kaartlagen hebben het coördinatenstelsel van het project nodig ([Het coördinatenstelsel van het project instellen](topic:coordinate-systems)), behalve een afbeelding waarvan het wereldbestand de eigen coördinaten van het project gebruikt.

## De internetinstelling

CivilCraft vraagt nooit iets aan een kaartserver totdat u dat toestaat: {{ui:Instellingen}}, {{ui:CivilCraft}}, **Kaartlagen van internet**: **Uit** (de start) of **Aan**.

:::note
Wanneer deze aan staat, vraagt CivilCraft aan de kaartservers die u toevoegt om afbeeldingen van het gebied op het scherm. Uw tekening blijft op deze computer; de server ziet het gebied en uw internetadres.
:::

Zolang deze uit staat, worden internetlagen wel in het dialoogvenster getoond, maar grijs, met de reden, en wordt niets getekend of opgevraagd. Het openen van een project dat kaartservers noemt, neemt ook geen contact met ze op. Een afbeelding uit een bestand werkt in beide gevallen. De knop {{ui:Instellingen openen}} van het dialoogvenster brengt u erheen.

## Een georefereerde afbeelding (werkt offline)

1. Houd bij **Een laag toevoegen** **Georefereerde afbeelding** geselecteerd en kies de bestanden: de afbeelding (PNG of JPEG) **samen met** zijn wereldbestand (`.pgw` voor PNG, `.jgw` voor JPEG, of `.wld`) en, als die er is, zijn `.prj`. U kunt ze ook samen op het plan zetten.
2. Zonder `.prj` vraagt CivilCraft welk stelsel het wereldbestand gebruikt: {{ui:Het stelsel van het project}} (het meest voorkomend), {{ui:Kies een stelsel…}}, of, in een project zonder stelsel, **Projectcoördinaten**.
3. De afbeelding verschijnt onder het plan en {{ui:Passend}} neemt haar mee.

Een RGB-GeoTIFF (een luchtfoto opgeslagen als GeoTIFF) bevat zijn eigen plaatsing en stelsel: open hem op zichzelf. De afbeelding wordt **in het projectbestand** bewaard (tot 25 MB); een grotere wordt geweigerd met zijn grootte, dus sla een kleinere kopie op (minder pixels, of JPEG).

## Tegels, WMS, WMTS en kaartservices

Zet eerst **Kaartlagen van internet** aan. Kies dan bij **Een laag toevoegen**:

| Van | Wat u plakt | Wat CivilCraft doet |
|---|---|---|
| Tegel-URL | Een sjabloon met `{z}`, `{x}` en `{y}` (of `{-y}`), en `{s}` voor een serverletter, bijvoorbeeld `https://tile.example.org/{z}/{x}/{y}.png`. Geef het een naam en zijn bronvermelding. | Tegels in web-Mercator voor het gebied en de zoom op het scherm. |
| WMS-server | Het adres van de server, of zijn GetCapabilities-link. Kies {{ui:De lagen ophalen}}, dan de laag. | Eén afbeelding van het gebied op het scherm, opgevraagd in de EPSG-code van het project wanneer de server die biedt, anders in web-Mercator of WGS 84. |
| WMTS-server | Het adres van de server, of zijn `WMTSCapabilities.xml`. Kies {{ui:De lagen ophalen}}, dan de laag en de tilematrixset. | Tegels uit de set in het stelsel van het project wanneer er een is, anders web-Mercator. |
| ArcGIS-kaartservice (REST) | Een URL die eindigt op `/MapServer` of `/ImageServer`. Kies {{ui:Service lezen}}. | Gecachete web-Mercator-services worden getekend uit hun tegels; andere worden opgevraagd als één afbeelding van het gebied op het scherm. |

Er zijn geen servers vooraf ingesteld. Openbare voorbeelden, allemaal van de USGS National Map (publiek domein):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Kaartservice: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (ook `USGSImageryOnly` voor luchtfoto's)

Veel gemeentelijke en regionale GIS-afdelingen publiceren hun eigen WMS of kaartservices; hun GIS-pagina's geven het adres. Een server die om een inlog of een sleutel vraagt, werkt niet: CivilCraft stuurt geen gebruikersnamen, wachtwoorden of sleutels.

## Hoe lagen worden getekend

- Afbeeldingen in een ander stelsel dan dat van het project worden erin vervormd: de afbeelding wordt in stukken gesneden, elk zo geplaatst dat het binnen een kwart schermpixel ligt van waar een exacte omzetting het plaatst.
- Tegels worden gekozen voor het gebied op het scherm en de zoom: nooit meer dan 64 per beeld, 6 tegelijk. Wanneer u verschuift of zoomt, worden verzoeken voor het oude beeld geannuleerd. Ongeveer 200 tegels worden in het geheugen bewaard (er wordt niets op schijf opgeslagen).
- Een WMS- of kaartserviceafbeelding wordt opgevraagd zodra het beeld stilstaat; tot die er is, blijft de vorige staan.
- De bronvermelding van elke laag op het scherm staat klein rechtsonder in het plan.

## Lagen wijzigen, ordenen en verwijderen

In het dialoogvenster heeft elke laag een vinkje om hem te tonen of te verbergen, een schuifregelaar **Dekking**, pijlen om hem eerder (lager) of later (bovenop) te tekenen, een zoomknop (afbeeldingen) en een verwijderknop. De eerste laag in de lijst wordt onderaan getekend. Elke wijziging is één stap ongedaan te maken.

## Wanneer een laag niets toont

De reden verschijnt eenmaal in de statusregel en blijft onder de naam van de laag in het dialoogvenster staan:

| Melding | Wat u doet |
|---|---|
| Uit: kaartlagen van internet staan uit in Instellingen. | Zet **Kaartlagen van internet** aan. |
| Heeft het coördinatenstelsel van het project nodig | Stel het in onder {{ui:Coördinaten}}. |
| De server stond deze pagina niet toe zijn afbeeldingen te gebruiken (CORS), of was niet bereikbaar. | De server staat webpagina's niet toe zijn afbeeldingen te gebruiken, of hij is uitgevallen. Na vier weigeringen stopt CivilCraft met vragen; verberg en toon de laag om het opnieuw te proberen. |
| De server antwoordde 404 … / De server stuurde text/xml, geen afbeelding: … | De URL, laag of stijl klopt niet, of het bericht van de server zegt wat hij wil. |
| Deze laag wordt niet aangeboden in het stelsel van het project, web-Mercator of WGS 84 | De server kan niet tekenen waar CivilCraft hem kan plaatsen. |

## Wat is gecontroleerd

- Tegelnummers zijn gecontroleerd tegen de standaard web-Mercator-tegelindeling. WMS 1.1.1 en 1.3.0, WMTS- en kaartserviceantwoorden zijn gelezen uit met de hand geschreven bestanden en uit echte antwoorden die zijn opgeslagen van de USGS National Map en de terrestris OpenStreetMap-servers. WMS 1.3.0-verzoeken zetten de breedtegraad eerst voor EPSG:4326, zoals de standaard voorschrijft.
- De vervorming is vergeleken met een exacte omzetting per pixel met de getallen van PROJ: binnen 0.13 px voor tegels, WMS-afbeeldingen en een afbeelding op provinciale schaal, op terreinschaal en uitgezoomd.
- Een afbeelding met zijn wereldbestand en een RGB-GeoTIFF die door GDAL is geschreven (via rasterio) zijn getekend waar hun plaatsing aangeeft, pixel voor pixel gecontroleerd in de browser.
- In de browser, tegen een vervangende server op de testcomputer: tegels komen terecht in de tegel die PROJ voor elk punt aanwijst, een WMS-afbeelding komt binnen 2 px terecht, er lopen hoogstens 6 verzoeken tegelijk, en met de instelling uit gaat geen verzoek de pagina uit. De hierboven genoemde kaartservice van de USGS National Map is ook eens live in de browser gelezen en getekend (zijn tegels kwamen binnen en werden getekend, met zijn copyrightvermelding); de andere openbare servers zijn alleen uit opgeslagen antwoorden gelezen.
