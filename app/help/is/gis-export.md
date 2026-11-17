---
title: Flytja út gögn eins og byggt fyrir GIS
summary: Flyttu út mælipunkta, hæðarlínur, veglínur, palla, lagnir og mannvirki til GIS-deildar borgar eða sýslu sem shapefile, GeoPackage, GeoJSON eða KML, í netahnitum hnitakerfis verkefnisins.
keywords: gis, útflutningur, eins og byggt, kml, kmz, google earth, shapefile, shp, zip, geopackage, gpkg, geojson, lagnir, mannvirki, veitur, borg, sýsla, net, jörð, epsg, prj
from: bba4fea5
---

Margar borgir og sýslur biðja um gögn eins og byggt í GIS-sniði þegar verkefni lýkur: hvar lagnirnar og mannvirkin lágu, lokamótun, miðlína vegarins. **GIS › Flytja út** skrifar það sem CivilCraft geymir sem GIS-lög, eitt fyrir hverja tegund hlutar.

## Áður en þú flytur út

1. Stilltu hnitakerfi verkefnisins í {{ui:Hnit}}. GIS-deild þarf að vita hvar tölurnar eru; án kerfis bera skrárnar tölur verkefnisins sjálfs og nefna engin.
2. Athugaðu yfirborðið, veglínur, palla og lagnanetið eins og þú vilt að það sé afhent.
3. Spurðu deildina hvaða snið og hvaða hnitakerfi hún vill. Margar biðja enn um shapefile í staðbundnu state plane-belti; nýrri kerfi taka við GeoPackage.

## Útflutningur

1. Smelltu á {{ui:Flytja út}} í **GIS**-hópnum.
2. Undir **Hvað**, hakaðu við tegundirnar sem á að senda. Hver sýnir hversu marga hluti hún hefur; tegundir sem eru enn tómar eru gráar.
3. Undir **Sem**, veldu sniðið.
4. Lestu athugasemdirnar um hnit og einingar, smelltu síðan á niðurhalshnappinn. Stöðulínan segir hvað fór með og hvaða reitanöfnum var stytt.

Gluggin geymir einnig útflutning hæðarnets ({{ui:Yfirborð sem GeoTIFF hæðarnet}}); sjá [Hæðarnet og LiDAR](topic:elevation-grids-and-lidar).

## Hvað hver tegund geymir

| Tegund | Lögun | Reitir |
|---|---|---|
| Mælipunktar | Punktar með hæð | `P` punktnúmer, `N` norðurhnit, `E` austurhnit, `Z` hæð, `D` lýsing |
| Hæðarlínur núverandi lands, mótaðs yfirborðs | Línur í sinni hæð | `ELEV` |
| Brotlínur | Línur með hæðum | `NAME` |
| Jaðar yfirborðs | Marghyrningur (teiknaða jaðarlínan, annars jaðar yfirborðsins) | `NAME` |
| Veglínur | Miðlínur | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stöðvar sem einfaldar tölur) |
| Pallar | Marghyrningar í hæð pallsins | `NAME`, `ELEV`, `AREA` |
| Dagsbirtulínur | Línur með hæðum (pallar og göng) | `NAME` |
| Eiginleikalínur ganga | Línur með hæðum: miðja, brúnir malbiks, axlir | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Lagnir | Línur frá efri botni til neðri | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (percent), `LENGTH`, `NETWORK` |
| Mannvirki | Punktar við brún | `NAME`, `RIM`, `INVERT` (lægsti botn lagnar þar), `SUMP`, `DIA`, `DIA_UNIT` |
| Sérhvert GIS-lag | Eins og flutt var inn | Eigin reitir |

Lengdir, stöðvar og hæðir eru í einingum verkefnisins (US survey ft eða m). Þvermál lagna og mannvirkja eru í in í ft-verkefnum og í mm í m-verkefnum; `DIA_UNIT` segir hvort er.

## Sniðin

- **Shapefile**: ein `.zip` með shapefile fyrir hverja tegund (`.shp`, `.shx`, `.dbf`), `.cpg` sem segir að textinn sé UTF-8, og `.prj` sem nefnir hnitakerfið. Lögun með hæðum er skrifuð sem Z-gerðir shapefile. Reitanöfn lengri en 10 stafir eru stytt eins og sniðið krefst, og stöðulínan telur þau upp.
- **GeoPackage**: ein `.gpkg`-skrá með töflu fyrir hverja tegund, hnitakerfið geymt með EPSG-kóða sínum. Ein skrá í stað margra, löng reitanöfn haldast.
- **KML** eða **KMZ** (KML þjappað): ein skrá með breiddar- og lengdarhnitum fyrir Google Earth og vefkort, mappa fyrir hverja tegund, hver hlutur er staðmerki nefnt eftir NAME-reitnum með öllum reitum sem viðbótargögnum; hæðir í m (altitude mode absolute). Eins og GeoJSON þarf það hnitakerfi verkefnisins.
- **GeoJSON**: ein skrá með breiddar- og lengdarhnitum (GeoJSON-staðallinn leyfir ekkert annað) þar sem sérhver hlutur ber eiginleikann `kind` (`pipes`, `structures`, …) svo viðtakandinn geti skipt þeim. Hæðir eru umreiknaðar í m, eins og staðallinn krefst; þær haldast á lóðrétta viðmiðinu í verkefninu þínu (CivilCraft hefur ekkert geoid-líkan). Verkefni án hnitakerfis getur ekki flutt út GeoJSON, og glugginn segir af hverju.

## Net, ekki jörð

GIS-deildir geyma gögn sín í **neta**-hnitum hnitakerfis. Ef verkefnið þitt notar jarðar- eða staðbundin hnit (stillt í {{ui:Hnit}}), er hverju hnit breytt aftur í net við útflutning: tölurnar í skránum eru frábrugðnar tölunum á grunnmyndinni um kvarðastuðulinn þinn (og snúning, fyrir staðbundið kerfi). Punktareitirnir `N` og `E` geyma einnig netgildin. Glugginn minnir þig á það.

:::tip
Sendu stutta athugasemd með skránum: hnitakerfið og EPSG-kóða þess, lóðrétta viðmiðið fyrir hæðirnar, einingarnar og hvað hver skrá er.
:::

## Hvað var prófað

- Sérhver skrá sem var skrifuð var lesin aftur af GDAL, bókasafninu sem flest GIS-forrit nota til að lesa þessar skrár: hver lögun, hæð og eigind, fjöldi hluta og hnitakerfið sem EPSG-kóði þess (`.prj` og GeoPackage). Okkar eigin lesarar lásu þær eins aftur.
- GeoJSON-skrár fylgja RFC 7946: lengd á undan breidd, enginn `crs`-liður, ytri hringir rangsælis og göt réttsælis; staðsetningar stemmdu við PROJ innan 2 mm.
- Verkefni með jarðarhnitum var flutt út og sérhver punktur athugaður gegn netahnitum sínum.
- Ekkert af þessu hefur enn verið opnað í öðrum GIS-forritum. Athugaðu fyrstu afhendingu með deildinni áður en þú treystir henni.
