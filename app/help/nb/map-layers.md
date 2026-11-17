---
title: Vis kartlayere under planen
summary: Legg et georeferert bilde, kartfliser, en WMS- eller WMTS-server eller en karttjeneste under planen som stedskontekst, med internettinnstilling, gjennomsiktighet, rekkefølge og kildehenvisning.
keywords: kartlayer, bakgrunnskart, basiskart, bakgrunn, flyfoto, ortofoto, bilde, satellitt, raster, verdensfil, pgw, jgw, tfw, wld, geotiff, georeferert bilde, xyz, fliser, flisekart, wms, wmts, getcapabilities, karttjeneste, rest, mapserver, imageserver, usgs, national map, kildehenvisning, gjennomsiktighet
from: 32d7718e
---

Kartlayere er bilder som tegnes under designet ditt: et flyfoto med sin verdensfil, eller kart fra servere på internett. De er stedskontekst bare på skjermen: de er **ikke** med i PDF-utskrifter, DXF- eller DWG-eksporter, eller 3D-visningen.

Velg {{ui:Map}} i gruppen {{ui:GIS}}. Dialogen **Kartlayere** lister opp prosjektets layere og legger til nye. Kartlayere trenger prosjektets koordinatsystem ([Angi prosjektets koordinatsystem](topic:coordinate-systems)), bortsett fra et bilde der verdensfilen bruker prosjektets egne koordinater.

## Innstillingen for internett

CivilCraft spør aldri en kartserver om noe før du tillater det: {{ui:Settings}}, {{ui:CivilCraft}}, **Kartlayere fra internett**: **Av** (ved start) eller **På**.

:::note
Når den er på, spør CivilCraft kartserverne du legger til om bilder av området på skjermen. Tegningen din blir på denne maskinen. Serveren ser området og internettadressen din.
:::

Mens den er av, vises internettlayere i dialogen, men nedtonet, med årsaken, og ingenting tegnes eller hentes. Å åpne et prosjekt som nevner kartservere kontakter dem heller ikke. Et bilde fra en fil fungerer uansett. Knappen {{ui:Open Settings}} i dialogen tar deg dit.

## Et georeferert bilde (fungerer frakoblet)

1. Under **Legg til layer** beholder du **Georeferert bilde** og velger filene: bildet (PNG eller JPEG) **sammen med** verdensfilen (`.pgw` for PNG, `.jgw` for JPEG, eller `.wld`) og, hvis den finnes, dens `.prj`. Du kan også slippe dem på planen samtidig.
2. Uten en `.prj` spør CivilCraft hvilket system verdensfilen bruker: {{ui:The project’s system}} (vanligst), {{ui:Pick a system…}}, eller, i et prosjekt uten system, **Prosjektkoordinater**.
3. Bildet vises under planen, og {{ui:Fit}} tar det med.

Et RGB-GeoTIFF (et flyfoto lagret som GeoTIFF) har sin egen plassering og sitt eget system: åpne det alene. Bildet beholdes **inne i prosjektfilen** (opptil 25 MB). Et større avvises med størrelsen, så lagre en mindre kopi (færre piksler, eller JPEG).

## Fliser, WMS, WMTS og karttjenester

Slå først på **Kartlayere fra internett**. Deretter, under **Legg til layer**:

| Fra | Hva du limer inn | Hva CivilCraft gjør |
|---|---|---|
| Adresse til fliser | En mal med `{z}`, `{x}` og `{y}` (eller `{-y}`), og `{s}` for en serverbokstav, for eksempel `https://tile.example.org/{z}/{x}/{y}.png`. Gi den et navn og sin kildehenvisning. | Fliser i web-Mercator for området og zoomen på skjermen. |
| WMS-server | Serverens adresse, eller dens GetCapabilities-lenke. Velg {{ui:Get the layers}}, deretter layeret. | Ett bilde av området på skjermen, forespurt med prosjektets EPSG-kode når serveren tilbyr den, ellers i web-Mercator eller WGS 84. |
| WMTS-server | Serverens adresse, eller dens `WMTSCapabilities.xml`. Velg {{ui:Get the layers}}, deretter layeret og flismatrisesettet. | Fliser fra settet i prosjektets system når det finnes ett, ellers web-Mercator. |
| ArcGIS map service (REST) | En adresse som slutter på `/MapServer` eller `/ImageServer`. Velg {{ui:Read the service}}. | Bufrede web-Mercator-tjenester tegnes fra sine fliser. Andre hentes som ett bilde av området på skjermen. |

Ingen servere er forhåndsvalgt. Offentlige eksempler, alle fra USGS National Map (fri for opphavsrett):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Karttjeneste: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (også `USGSImageryOnly` for flyfoto)

Mange kommuner og fylkers GIS-avdelinger publiserer sine egne WMS- eller karttjenester. Deres GIS-sider gir adressen. En server som ber om innlogging eller nøkkel fungerer ikke: CivilCraft sender ingen brukernavn, passord eller nøkler.

## Slik tegnes layerne

- Bilder i et annet system enn prosjektets blir omformet inn i det: bildet deles i biter, hver plassert slik at den er innenfor en fjerdedel av en skjermpiksel fra der en nøyaktig omregning plasserer den.
- Fliser velges for området på skjermen og zoomen: aldri mer enn 64 for en visning, og 6 om gangen. Når du panorerer eller zoomer, avbrytes forespørsler for den gamle visningen. Omtrent 200 fliser holdes i minnet (ingenting lagres på disk).
- Et bilde fra en WMS eller karttjeneste hentes når visningen har sluttet å bevege seg. Inntil det kommer, står det forrige på plass.
- Kildehenvisningen for hvert layer på skjermen vises i liten skrift nederst til høyre på planen.

## Endre, ordne og fjerne layerne

I dialogen har hvert layer en avkrysningsboks for å vise eller skjule det, en **Gjennomsiktighet**-skyver, piler for å tegne det tidligere (lavere) eller senere (øverst), en zoomknapp (bilder) og en fjernknapp. Det første layeret i listen tegnes nederst. Hver endring er ett angre-steg.

## Når et layer ikke viser noe

Årsaken vises én gang i statuslinjen, og står under layerets navn i dialogen:

| Melding | Hva du gjør |
|---|---|
| Av: kartlayere fra internett er av i Innstillinger. | Slå på **Kartlayere fra internett**. |
| Trenger prosjektets koordinatsystem | Angi det under {{ui:Coordinates}}. |
| Serveren tillot ikke at denne siden brukte bildene (CORS), eller kunne ikke nås. | Serveren lar ikke nettsider bruke bildene sine, eller den er nede. Etter fire avslag slutter CivilCraft å spørre. Skjul og vis layeret for å prøve igjen. |
| Serveren svarte 404 … / Serveren sendte text/xml, ikke et bilde: … | Adressen, layeret eller stilen er feil, eller serverens melding sier hva den vil ha. |
| Dette layeret tilbys ikke i prosjektets system, web-Mercator eller WGS 84 | Serveren kan ikke tegne der CivilCraft kan plassere det. |

## Hva som er kontrollert

- Flisnumrene ble kontrollert mot standard web-Mercator-flisinndeling. WMS 1.1.1 og 1.3.0, WMTS- og karttjenestesvar ble lest fra håndskrevne filer og fra ekte svar lagret fra USGS National Map og terrestris OpenStreetMap-serverne. WMS 1.3.0-forespørsler setter breddegrad først for EPSG:4326, slik standarden sier.
- Omformingen ble sammenlignet med en nøyaktig omregning per piksel med PROJs tall: innenfor 0,13 px for fliser, WMS-bilder og et bilde på fylkesstørrelse, i stedskala og utzoomet.
- Et bilde med verdensfil og et RGB-GeoTIFF skrevet av GDAL (gjennom rasterio) ble tegnet der plasseringen deres sier, kontrollert piksel for piksel i nettleseren.
- I nettleseren, mot en stand-in-server på testmaskinen: fliser havner i flisen PROJ plasserer hvert punkt i, et WMS-bilde havner innen 2 px, høyst 6 forespørsler kjører om gangen, og med innstillingen av forlater ingen forespørsel siden. Karttjenesten fra USGS National Map ovenfor ble også lest og tegnet live i nettleseren én gang (flisene kom og ble tegnet, med opphavsrettsteksten). De andre offentlige serverne ble lest bare fra lagrede svar.
