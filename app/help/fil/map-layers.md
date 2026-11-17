---
title: Ipakita ang map layer sa ilalim ng plano
summary: Ilagay ang georeferenced na larawan, map tile, WMS o WMTS server o map service sa ilalim ng plano bilang site context, kasama ang internet setting, opacity, pagkakasunod-sunod at attribution.
keywords: map layers, basemap, base map, background, aerial, orthophoto, imagery, satellite, raster, world file, pgw, jgw, tfw, wld, geotiff, georeferenced na larawan, xyz, tiles, slippy map, wms, wmts, getcapabilities, map service, rest, mapserver, imageserver, usgs, national map, attribution, opacity
from: 32d7718e
---

Ang map layer ay mga larawang iginuguhit sa ilalim ng disenyo mo: aerial photo kasama ang world file nito, o mga mapa mula sa server sa internet. Site context lamang ang mga ito sa screen: **hindi** ang mga ito nasa PDF plot, DXF o DWG export, o sa 3D view.

Piliin ang {{ui:Map}} sa grupong {{ui:GIS}}. Inililista ng dialog na **Map layers** ang mga layer ng project at nagdaragdag ng bago. Kailangan ng mga map layer ang coordinate system ng project ([Itakda ang coordinate system ng project](topic:coordinate-systems)), maliban sa larawang gumagamit ng sarili nitong coordinates ng project ang world file nito.

## Ang setting ng internet

Hindi kailanman humihiling ang CivilCraft ng kahit ano sa map server hangga't hindi mo ito pinapayagan: {{ui:Mga setting}}, {{ui:CivilCraft}}, **Map layers from the internet**: **Off** (sa simula) o **On**.

:::note
Kapag on, humihiling ang CivilCraft sa mga map server na idinagdag mo ng mga larawan ng lugar sa screen. Nananatili sa computer na ito ang drawing mo; nakikita ng server ang lugar at ang internet address mo.
:::

Habang naka-off, nakalista sa dialog ang mga internet layer pero naka-gray out, kasama ang dahilan, at walang iginuguhit o hinihiling. Ang pagbubukas ng project na may pangalan ng map server ay hindi rin sila kinokontak. Gumagana ang larawang mula sa file sa alinmang paraan. Dadalhin ka ng button ng dialog na {{ui:Buksan ang Mga setting}} doon.

## Georeferenced na larawan (gumagana offline)

1. Sa **Add a layer**, panatilihin ang **Georeferenced picture** at piliin ang mga file: ang larawan (PNG o JPEG) **kasama ang** world file nito (`.pgw` para sa PNG, `.jgw` para sa JPEG, o `.wld`) at, kung mayroon, ang `.prj` nito. Maaari mo rin silang i-drop nang sabay sa plano.
2. Kung walang `.prj`, itatanong ng CivilCraft kung aling system ang gamit ng world file: {{ui:Ang system ng project}} (pinakakaraniwan), {{ui:Pumili ng system…}}, o, sa project na walang system, **Project coordinates**.
3. Lumalabas ang larawan sa ilalim ng plano at kasama ito ng {{ui:Fit}}.

Ang RGB GeoTIFF (aerial photo na naka-save bilang GeoTIFF) ay may sarili nitong placement at system: buksan ito nang mag-isa. Ang larawan ay itinatago **sa loob ng project file** (hanggang 25 MB); ang mas malaki ay tinatanggihan kasama ang laki nito, kaya i-save ang mas maliit na kopya (mas kaunting pixel, o JPEG).

## Tile, WMS, WMTS at map service

I-on muna ang **Map layers from the internet**. Pagkatapos, sa **Add a layer**:

| Mula sa | Ang ipe-paste | Ano ang ginagawa ng CivilCraft |
|---|---|---|
| Tile URL | Isang template na may `{z}`, `{x}` at `{y}` (o `{-y}`), at `{s}` para sa letter ng server, halimbawa `https://tile.example.org/{z}/{x}/{y}.png`. Bigyan ito ng pangalan at attribution nito. | Mga tile sa web Mercator para sa lugar at zoom sa screen. |
| WMS server | Address ng server, o ang GetCapabilities link nito. Piliin ang {{ui:Kunin ang mga layer}}, pagkatapos ang layer. | Isang larawan ng lugar sa screen, hinihiling sa EPSG code ng project kapag iniaalok ito ng server, kung hindi, sa web Mercator o WGS 84. |
| WMTS server | Address ng server, o ang `WMTSCapabilities.xml` nito. Piliin ang {{ui:Kunin ang mga layer}}, pagkatapos ang layer at tile matrix set. | Mga tile mula sa set sa system ng project kapag mayroon, kung hindi, sa web Mercator. |
| ArcGIS map service (REST) | URL na nagtatapos sa `/MapServer` o `/ImageServer`. Piliin ang {{ui:Basahin ang service}}. | Ang mga cached na web Mercator service ay iginuguhit mula sa kanilang tile; ang iba ay hinihingan ng isang larawan ng lugar sa screen. |

Walang server na nakatakda na. Mga pampublikong halimbawa, lahat mula sa USGS National Map (public domain):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Map service: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (pati `USGSImageryOnly` para sa aerial photo)

Maraming departamento ng GIS ng lungsod at county ang naglalathala ng sarili nilang WMS o map service; nasa kanilang GIS page ang address. Hindi gumagana ang server na humihingi ng sign-in o key: hindi nagpapadala ang CivilCraft ng user name, password o key.

## Paano iginuguhit ang mga layer

- Ang mga larawang nasa ibang system kaysa sa project ay ginagawang warp papasok dito: hinihiwa ang larawan sa mga piraso, bawat isa ay inilalagay nang nasa loob ng isang-kapat ng screen pixel mula sa kung saan ito dapat ilagay ng eksaktong conversion.
- Pinipili ang mga tile para sa lugar sa screen at sa zoom: hindi lalampas sa 64 bawat view, 6 sabay-sabay. Kapag nag-pan o nag-zoom ka, kinakansela ang mga kahilingan para sa lumang view. Mga 200 tile ang itinatago sa memory (walang iniimbak sa disk).
- Ang larawan ng WMS o map service ay hinihingan kapag tumigil nang gumalaw ang view; hanggang dumating ito, nananatili sa lugar ang huli.
- Lumalabas nang maliit sa kanang ibaba ng plano ang attribution ng bawat layer sa screen.

## Palitan, ayusin at tanggalin ang mga layer

Sa dialog, may checkbox ang bawat layer para ipakita o itago ito, slider na **Opacity**, mga arrow para iguhit ito nang mas maaga (mas ibaba) o mas huli (mas itaas), zoom button (para sa larawan) at remove button. Ang unang layer sa listahan ay iginuguhit sa pinakailalim. Bawat pagbabago ay isang undo step.

## Kapag walang lumalabas sa layer

Lumalabas nang isang beses ang dahilan sa status line at nananatili sa ilalim ng pangalan ng layer sa dialog:

| Mensahe | Ano ang gagawin |
|---|---|
| Off: naka-off ang map layer mula sa internet sa Mga setting. | I-on ang **Map layers from the internet**. |
| Kailangan ang coordinate system ng project | Itakda ito sa ilalim ng {{ui:Coordinates}}. |
| Hindi pinayagan ng server ang pahinang ito na gamitin ang mga larawan nito (CORS), o hindi maabot. | Hindi pinapayagan ng server ang web page na gamitin ang mga larawan nito, o down ito. Pagkatapos ng apat na pagtanggi, humihinto sa paghingi ang CivilCraft; itago at ipakita ang layer para subukang muli. |
| Sumagot ang server ng 404 … / Nagpadala ang server ng text/xml, hindi larawan: … | Mali ang URL, layer o style, o sinasabi ng mensahe ng server kung ano ang gusto nito. |
| Hindi iniaalok ang layer na ito sa system ng project, sa web Mercator o WGS 84 | Hindi kayang iguhit ng server kung saan ito maaaring ilagay ng CivilCraft. |

## Ano ang sinuri

- Sinuri ang mga numero ng tile laban sa standard na web Mercator tiling; binasa ang mga sagot ng WMS 1.1.1 at 1.3.0, WMTS at map service mula sa mga file na isinulat nang kamay at mula sa mga totoong sagot na na-save mula sa USGS National Map at terrestris OpenStreetMap server; inilalagay ng mga kahilingang WMS 1.3.0 ang latitude muna para sa EPSG:4326, gaya ng nakasaad sa standard.
- Ikinumpara ang warping sa eksaktong conversion bawat pixel gamit ang mga numero ng PROJ: loob ng 0.13 px para sa mga tile, WMS na larawan at larawang laki ng county, sa laki ng site at naka-zoom out.
- Iginuhit ang larawang may world file nito at ang RGB GeoTIFF na isinulat ng GDAL (sa pamamagitan ng rasterio) kung saan sinasabi ng placement nila, at sinuri pixel-by-pixel sa browser.
- Sa browser, laban sa pamalit na server sa test computer: napupunta ang mga tile sa tile kung saan inilalagay ng PROJ ang bawat punto, ang larawang WMS ay nasa loob ng 2 px, hanggang 6 na kahilingan ang tumatakbo nang sabay-sabay, at kapag naka-off ang setting, walang kahilingang umaalis sa page. Ang USGS National Map map service sa itaas ay nabasa at naiguhit nang live sa browser nang isang beses (dumating at naiguhit ang mga tile nito, kasama ang copyright text nito); ang ibang pampublikong server ay nabasa mula sa mga na-save na sagot lamang.
