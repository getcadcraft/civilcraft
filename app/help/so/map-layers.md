---
title: Muuji lakabyada khariidadda hoosta qorshaha
summary: Dhig sawir juqraafi ahaan lagu xidhay, dhajinta khariidadda, server WMS ama WMTS, ama adeeg khariidad sida xaaladda goobta, iyadoo la dejinayo internetka, iftiinka, kala horreynta iyo tixraaca ilaha.
keywords: lakabyada khariidadda, basemap, saldhigga khariidadda, background, sawirka dayax-gacmeedka, orthophoto, sawir, satellite, raster, world file, pgw, jgw, tfw, wld, geotiff, sawir juqraafi ahaan lagu xidhay, xyz, tiles, slippy map, wms, wmts, getcapabilities, adeeg khariidad, rest, mapserver, imageserver, usgs, national map, tixraac, iftiin
from: 32d7718e
---

Lakabyada khariidadda waa sawirro laga sawiro hoosta naqshaddaada: sawir dayax-gacmeed oo leh world file-kiisa, ama khariidado ka timid server-yada internetka. Waa **aan** ku jirin PDF plots, DXF ama DWG exports, ama muuqaalka 3D; waa macluumaad goobeed oo kaliya shaashadda lagu arko.

Dooro {{ui:Map}} kooxda {{ui:GIS}}. Daaqada **Lakabyada khariidadda** ayaa liisanaysa lakabyada mashruuca oo ku darta kuwa cusub. Lakabyada khariidadda waxay u baahan yihiin nidaamka isku-xirka mashruuca ([Deji nidaamka isku-xirka mashruuca](topic:coordinate-systems)), marka laga reebo sawir uu world file-kiisu isticmaalo isku-xirka mashruuca gaarka ah.

## Dejinta internetka

CivilCraft waligiis ma weydiiyo server-ka khariidadda wax ilaa aad ogolaato: {{ui:Settings}}, {{ui:CivilCraft}}, **Lakabyada khariidadda internetka**: **Damsan** (bilowga) ama **Furan**.

:::note
Marka uu furan yahay, CivilCraft wuxuu weydiinayaa server-yada aad ku darto sawirrada goobta shaashadda. Naqshaddaadu waxay ku sii jirtaa kombuutarkan; server-ku wuxuu arkaa goobta iyo cinwaanka internetka.
:::

Intii uu damsan yahay, lakabyada internetka waxay ku liisan yihiin daaqada laakiin waa lagu dhex-madoobeeyay, sababta ayaa la sheegay, wax kasta oo la sawiro ama la weydiiyo ma jiro. Furidda mashruuc oo magacyada server-yada ku qoran ma xiriirto iyaga. Sawir faylka ka yimid wuu shaqeeyaa labadaba. Badhanka {{ui:Open Settings}} ee daaqada ayaa kuu geeya meeshaas.

## Sawir juqraafi ahaan lagu xidhay (internet la'aan ayuu shaqeeyaa)

1. Ku **Ku dar lakab**, hay **Sawir juqraafi ahaan lagu xidhay** oo dooro faylalka: sawirka (PNG ama JPEG) **iyo** world file-kiisa (`.pgw` PNG-ga, `.jgw` JPEG-ga, ama `.wld`) iyo, haddii uu jiro, `.prj`-kiisa. Waxaad sidoo kale ku ridi kartaa qorshaha hal mar.
2. Haddii `.prj` aanu jirin, CivilCraft wuxuu weydiin doonaa nidaamka uu world file-ku isticmaalo: {{ui:The project’s system}} (ugu badan), {{ui:Pick a system…}}, ama, mashruuc aan nidaam lahayn, **Isku-xirka mashruuca**.
3. Sawirka wuxuu ka muuqdaa qorshaha hoosteeda, {{ui:Fit}} wuxuu ku daraa.

GeoTIFF RGB (sawir dayax-gacmeed oo loo kaydiyay GeoTIFF) wuxuu leeyahay goobtiisa iyo nidaamkiisa: fura keligiis. Sawirka waxaa lagu kaydiyaa **gudaha faylka mashruuca** (ilaa 25 MB); mid ka weyn waa la diidaa, cabbirkiisa ayaa la sheegaa, sidaas darteed kaydi nuqul yar (pixel yar, ama JPEG).

## Tiles, WMS, WMTS iyo adeegyada khariidadda

Marka hore **Lakabyada khariidadda internetka** shaqee. Kadibna, **Ku dar lakab** ku:

| Ka | Waxa la dhejiyo | Waxa CivilCraft sameeyo |
|---|---|---|
| URL-ka tile-ka | Template oo leh `{z}`, `{x}` iyo `{y}` (ama `{-y}`), iyo `{s}` oo ah xaraf server; tusaale, `https://tile.example.org/{z}/{x}/{y}.png`. Bixi magac iyo tixraacdeeda. | Tiles web Mercator goobta iyo weynaynta shaashadda. |
| Server WMS | Cinwaanka server-ka, ama xidhiidhka GetCapabilities. Dooro {{ui:Get the layers}}, kadibna lakabka. | Hal sawir oo goobta shaashadda ah, oo la weydiiyo koodka EPSG ee mashruuca marka server-ku bixiyo; haddii kale web Mercator ama WGS 84. |
| Server WMTS | Cinwaanka server-ka, ama `WMTSCapabilities.xml`. Dooro {{ui:Get the layers}}, kadibna lakabka iyo tile matrix set-ka. | Tiles ka set-ka nidaamka mashruuca marka uu jiro; haddii kale web Mercator. |
| ArcGIS map service (REST) | URL oo ku dhammaanaya `/MapServer` ama `/ImageServer`. Dooro {{ui:Read the service}}. | Adeegyada web Mercator ee kaydsan waxaa laga sawiraa tilesyadooda; kuwa kale waxaa loo weydiiyaa hal sawir oo goobta shaashadda ah. |

Server ma jiraan oo hore loo dejiyay. Tusaalooyin dadweyne, dhammaantood USGS National Map (xuquuq dadweyne):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Adeeg khariidad: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (sidoo kale `USGSImageryOnly` sawirrada dayax-gacmeedka)

Xafiisyo badan oo GIS-ka magaalooyinka iyo degmooyinka ayaa daabaca WMS ama adeegyadooda khariidadda; bogagooda GIS-ka ayaa siiya cinwaankooda. Server-ka oo weydiiya gelitaan ama fure ma shaqeeyo: CivilCraft ma diro magacyo isticmaaleed, erayo sir ah ama furayaal.

## Sida lakabyada loo sawiro

- Sawirrada nidaam ka duwan kan mashruuca waxaa lagu wareejiyaa gudaha: sawirka waxaa loo jeexaa qaybo, mid kastaa wuxuu ku yaal meel ka fog ugu badnaan robaqa pixel-ka shaashadda oo ka mid ah meesha isbeddel sax ah geeyo.
- Tiles waxaa la doortaa goobta shaashadda iyo weynaynta: ugu badnaan 64 muuqaal kasta, 6 mar kasta. Marka aad wareejiso ama weyneyso, codsiyada muuqaalka hore waa la joojiyaa. Qiyaastii 200 tiles ayaa xusuusta lagu hayaa (waxba lama kaydiyo diskka).
- Sawirka WMS ama adeegga khariidadda waa la weydiiyaa markii muuqaalku joogsado; ilaa uu imaado, midka hore ayaa meeshiisa ku sii jira.
- Tixraaca lakab kasta ee shaashadda ayaa yar ku muuqda qorshaha hoose-midig.

## Beddel, kala horreyn iyo ka saar lakabyada

Daaqada lakab kastaa wuxuu leeyahay sanduuq calaamad ah oo muujinaya ama qarinaya, jiid-ah **Opacity** (iftiinka), fallaadho ah oo u dhigaya hoose (hore) ama dambe (korka), badhanka weynaynta (sawirrada) iyo badhanka ka saarista. Lakabka ugu horreeya liiska ayaa lagu sawiraa hoose. Isbeddel kasta waa hal tallaabo oo ka noqod ah.

## Marka lakab aanu wax muujin

Sababtu mar ayay ka muuqataa status-khaddka, waxayna ku sii jirtaa magaca lakabka daaqada hoosteeda:

| Fariinta | Waxa la sameeyo |
|---|---|
| Damsan: lakabyada khariidadda internetka waa damsan yihiin Dejinta. | Shaqee **Lakabyada khariidadda internetka**. |
| Waxay u baahan tahay nidaamka isku-xirka mashruuca | Deji hoos {{ui:Coordinates}}. |
| Server-ku ma oggolayn bogan inuu isticmaalo sawirradiisa (CORS), ama lama gaari karo. | Server-ku ma oggolayo bogagga webka inay isticmaalaan sawirradiisa, ama wuu hoos yimid. Afar diidmo ka dib CivilCraft wuu joojiyaa weydiinta; qari oo muuji lakabka si aad dib isku daydo. |
| Server-ku wuxuu ku jawaabay 404 … / Server-ku wuxuu diray text/xml, mana aha sawir: … | URL-ka, lakabka ama habka waa khalad, ama fariinta server-ku waxay sheegaysaa waxa uu rabo. |
| Lakabkan lama bixin nidaamka mashruuca, web Mercator ama WGS 84 | Server-ku ma gelin karo meesha CivilCraft ku dhejin karo. |

## Waxa la hubiyay

- Lambarada tiles-ka waxaa lagu hubiyay nidaamka caadiga ah ee web Mercator; jawaabaha WMS 1.1.1 iyo 1.3.0, WMTS iyo adeegga khariidadda waxaa laga akhriyay faylal gacanta lagu qoray iyo jawaabo dhab ah oo laga kaydiyay USGS National Map iyo server-yada OpenStreetMap ee terrestris; WMS 1.3.0 codsiyada waxay dhigaan latitude-ka marka hore EPSG:4326, sida heerku sheegayo.
- Wareejinta waxaa lagu barbardhigay isbeddel sax ah oo pixel kasta, oo ku salaysan tirooyinka PROJ: dhow 0.13 px tiles, sawirrada WMS iyo sawir cabbirkiisu yahay degmo, cabbirka goobta iyo marka laga fogeeyo.
- Sawir leh world file-kiisa iyo GeoTIFF RGB uu GDAL qoray (rasterio ku dhex) waxay sawiro meesha ay tilmaamayso, oo browser-ka lagu hubiyay pixel kasta.
- Browser-ka, server-ka tusaalaha ah ee kombuutarka tijaabada: tiles waxay ku dhacaan tile-ka PROJ dhigayo barta kasta; sawirka WMS wuxuu ku dhacaa 2 px dhexdeeda; ugu badnaan 6 codsi ayaa socda mar kasta; dejinta damsan, codsi kasta oo bogga ka baxa ma baxo. Adeegga khariidadda ee USGS National Map ee kor lagu sheegay waa la akhriyay oo browser-ka laga sawiray hal mar (tiles-kiisii way yimaadeen oo la sawiray, iyo qoraalkiisa xuquuqda); server-yada dadweynaha kale waxaa laga akhriyay jawaabo kaydsan oo keliya.
