---
title: Vis kortlag under planen
summary: Sæt et georefereret billede, kortfliser, en WMS- eller WMTS-server eller en kortservice under planen som områdekontekst, med internetindstillingen, opacitet, rækkefølge og kildeangivelse.
keywords: kortlag, baggrundskort, basiskort, baggrund, luftfoto, ortofoto, billeder, satellit, raster, world file, pgw, jgw, tfw, wld, geotiff, georefereret billede, xyz, fliser, slippy map, wms, wmts, getcapabilities, kortservice, rest, mapserver, imageserver, usgs, national map, kildeangivelse, opacitet
from: 32d7718e
---

Kortlag er billeder, der tegnes under dit design: et luftfoto med sin world file, eller kort fra servere på internettet. De er kun områdekontekst på skærmen: de er **ikke** med i PDF-plots, DXF- eller DWG-eksporter eller 3D-visningen.

Vælg {{ui:Kort}} i gruppen {{ui:GIS}}. Dialogen **Kortlag** lister projektets lag og tilføjer nye. Kortlag kræver projektets koordinatsystem ([Angiv projektets koordinatsystem](topic:coordinate-systems)), undtagen et billede, hvis world file bruger projektets egne koordinater.

## Internetindstillingen

CivilCraft spørger aldrig en kortserver om noget, før du tillader det: {{ui:Indstillinger}}, {{ui:CivilCraft}}, **Kortlag fra internettet**: **Fra** (start) eller **Til**.

:::note
Når den er til, beder CivilCraft de kortservere, du tilføjer, om billeder af området på skærmen. Din tegning bliver på denne computer; serveren ser området og din internetadresse.
:::

Mens den er fra, står internetlag på listen i dialogen, men er nedtonet med årsagen, og intet tegnes eller hentes. Når et projekt åbnes, der navngiver kortservere, kontaktes de heller ikke. Et billede fra en fil virker under begge. Dialogens knap {{ui:Åbn Indstillinger}} fører dig dertil.

## Et georefereret billede (virker offline)

1. Under **Tilføj et lag** beholder du **Georefereret billede** og vælger filerne: billedet (PNG eller JPEG) **sammen med** dets world file (`.pgw` for PNG, `.jgw` for JPEG eller `.wld`) og, hvis der er en, dens `.prj`. Du kan også slippe dem på planen samtidig.
2. Uden en `.prj` spørger CivilCraft, hvilket system world-filen bruger: {{ui:Projektets system}} (mest almindeligt), {{ui:Vælg et system…}} eller, i et projekt uden system, **Projektkoordinater**.
3. Billedet vises under planen, og {{ui:Tilpas}} medtager det.

En RGB GeoTIFF (et luftfoto gemt som GeoTIFF) har sin egen placering og sit eget system: åbn den alene. Billedet gemmes **inde i projektfilen** (op til 25 MB); et større afvises med sin størrelse, så gem en mindre kopi (færre pixels, eller JPEG).

## Fliser, WMS, WMTS og kortservices

Slå først **Kortlag fra internettet** til. Derefter under **Tilføj et lag**:

| Fra | Hvad du indsætter | Hvad CivilCraft gør |
|---|---|---|
| Flise-URL | En skabelon med `{z}`, `{x}` og `{y}` (eller `{-y}`), og `{s}` for et serverbogstav, fx `https://tile.example.org/{z}/{x}/{y}.png`. Giv den et navn og dens kildeangivelse. | Fliser i web Mercator for området og zoomet på skærmen. |
| WMS-server | Serverens adresse, eller dens GetCapabilities-link. Vælg {{ui:Hent lagene}}, derefter laget. | Ét billede af området på skærmen, bedt om i projektets EPSG-kode, når serveren tilbyder den, ellers i web Mercator eller WGS 84. |
| WMTS-server | Serverens adresse, eller dens `WMTSCapabilities.xml`. Vælg {{ui:Hent lagene}}, derefter laget og flisematrixsættet. | Fliser fra sættet i projektets system, når der er et, ellers web Mercator. |
| ArcGIS-kortservice (REST) | En URL, der slutter med `/MapServer` eller `/ImageServer`. Vælg {{ui:Læs tjenesten}}. | Cachede web Mercator-tjenester tegnes ud fra deres fliser; andre bedes om ét billede af området på skærmen. |

Ingen servere er forudvalgt. Offentlige eksempler, alle fra USGS National Map (public domain):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Kortservice: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (også `USGSImageryOnly` for luftfotos)

Mange by- og amts-GIS-afdelinger udgiver deres egne WMS- eller kortservices; deres GIS-sider angiver adressen. En server, der beder om login eller en nøgle, virker ikke: CivilCraft sender ingen brugernavne, adgangskoder eller nøgler.

## Sådan tegnes lag

- Billeder i et andet system end projektets omformes til det: billedet skæres i stykker, og hvert stykke placeres, så det ligger inden for en fjerdedel af en skærmpixel fra, hvor en præcis omregning sætter det.
- Fliser vælges for området på skærmen og zoomet: aldrig mere end 64 for en visning, 6 ad gangen. Når du panorerer eller zoomer, annulleres forespørgsler for den gamle visning. Cirka 200 fliser holdes i hukommelsen (intet gemmes på disken).
- Et WMS- eller kortservicebillede bedes om, når visningen er holdt op med at bevæge sig; indtil det kommer, bliver det sidste liggende.
- Kildeangivelsen for hvert lag vises småt nederst til højre på planen.

## Ændr, sortér og fjern lag

I dialogen har hvert lag et afkrydsningsfelt til at vise eller skjule det, en **Opacitet**-skyder, pile til at tegne det tidligere (lavere) eller senere (øverst), en zoomknap (billeder) og en fjern-knap. Det første lag i listen tegnes nederst. Hver ændring er ét fortrydelsestrin.

## Når et lag ikke viser noget

Årsagen vises én gang i statuslinjen og står under lagets navn i dialogen:

| Besked | Hvad du gør |
|---|---|
| Fra: kortlag fra internettet er slået fra i Indstillinger. | Slå **Kortlag fra internettet** til. |
| Kræver projektets koordinatsystem | Angiv det under {{ui:Koordinater}}. |
| Serveren tillod ikke denne side at bruge dens billeder (CORS), eller den kunne ikke nås. | Serveren lader ikke websider bruge dens billeder, eller den er nede. Efter fire afvisninger holder CivilCraft op med at spørge; skjul og vis laget for at prøve igen. |
| Serveren svarede 404 … / Serveren sendte text/xml, ikke et billede: … | URL'en, laget eller stilen er forkert, eller serverens besked siger, hvad den vil have. |
| Dette lag tilbydes ikke i projektets system, web Mercator eller WGS 84 | Serveren kan ikke tegne, hvor CivilCraft kan placere det. |

## Hvad der er kontrolleret

- Flisenumrene er kontrolleret mod den standardiserede web Mercator-flisedeling. Svar fra WMS 1.1.1 og 1.3.0, WMTS og kortservices blev læst fra håndskrevne filer og fra rigtige svar gemt fra USGS National Map- og terrestris OpenStreetMap-servere. WMS 1.3.0-forespørgsler sætter breddegraden først for EPSG:4326, som standarden siger.
- Omformning blev sammenlignet med en præcis omregning pr. pixel gennem PROJ's tal: inden for 0,13 px for fliser, WMS-billeder og et billede på amtsstørrelse, både i projektskala og zoomet ud.
- Et billede med sin world file og en RGB GeoTIFF skrevet af GDAL (gennem rasterio) blev tegnet, hvor deres placering siger, og kontrolleret pixel for pixel i browseren.
- I browseren, mod en stedfortræderserver på testcomputeren: fliser lander i den flise, PROJ placerer hvert punkt i; et WMS-billede lander inden for 2 px; højst 6 forespørgsler kører ad gangen; og med indstillingen fra går ingen forespørgsel ud af siden. USGS National Map-kortservicen ovenfor blev også læst og tegnet live i browseren én gang (dens fliser kom og blev tegnet, med dens ophavsretstekst); de andre offentlige servere blev kun læst fra gemte svar.
