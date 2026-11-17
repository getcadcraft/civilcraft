---
title: Birta kortalög undir grunnmyndinni
summary: Settu landtilvísaða mynd, kortflísar, WMS- eða WMTS-þjón eða kortaþjónustu undir grunnmyndina sem staðarsamhengi, með internetstillingunni, ógegnsæi, röð og heimildartilvísun.
keywords: kortalög, grunnkort, bakgrunnur, loftmynd, loftljósmynd, gervihnattamynd, raster, heimsskrá, pgw, jgw, tfw, wld, geotiff, landtilvísuð mynd, xyz, flísar, kortaflísar, wms, wmts, getcapabilities, kortaþjónusta, rest, mapserver, imageserver, usgs, national map, heimildartilvísun, ógegnsæi
from: 32d7718e
---

Kortalög eru myndir sem teiknast undir hönnuninni þinni: loftmynd með heimsskrá sinni, eða kort frá þjónum á internetinu. Þau eru staðarsamhengi á skjánum eingöngu: þau eru **ekki** í PDF-prentun, DXF- eða DWG-útflutningi, né í 3D-sýninni.

Veldu {{ui:Kort}} í {{ui:GIS}}-hópnum. Glugginn **Kortalög** listar lög verkefnisins og bætir við nýjum. Kortalög þurfa hnitakerfi verkefnisins ([Stilltu hnitakerfi verkefnisins](topic:coordinate-systems)), nema mynd þar sem heimsskráin notar hnit verkefnisins sjálfs.

## Internetstillingin

CivilCraft biður aldrei kortaþjón um neitt fyrr en þú leyfir það: {{ui:Stillingar}}, {{ui:CivilCraft}}, **Kortalög af internetinu**: **Slökkt** (upphafið) eða **Kveikt**.

:::note
Þegar kveikt er á því biður CivilCraft kortaþjónana sem þú bætir við um myndir af svæðinu á skjánum. Teikningin þín er áfram á þessari tölvu; þjónninn sér svæðið og internetfangið þitt.
:::

Meðan slökkt er á því eru internetlög skráð í glugganum en grá út, ásamt ástæðunni, og ekkert er teiknað né beðið um neitt. Að opna verkefni sem nefnir kortaþjóna hefur heldur ekki samband við þá. Mynd úr skrá virkar hvort sem er. Hnappurinn {{ui:Opna stillingar}} í glugganum fer þangað.

## Landtilvísuð mynd (virkar án nettengingar)

1. Í **Bæta við lagi** heldurðu **Landtilvísuð mynd** valið og velur skrárnar: myndina (PNG eða JPEG) **ásamt** heimsskrá hennar (`.pgw` fyrir PNG, `.jgw` fyrir JPEG, eða `.wld`) og, ef hún er til, `.prj`-skrána. Þú getur líka slept þeim saman á grunnmyndina.
2. Án `.prj` spyr CivilCraft hvaða kerfi heimsskráin notar: {{ui:Kerfi verkefnisins}} (algengast), {{ui:Veldu kerfi…}}, eða, í verkefni án kerfis, **Hnit verkefnisins**.
3. Myndin birtist undir grunnmyndinni og {{ui:Passa}} tekur hana með.

RGB GeoTIFF (loftljósmynd vistuð sem GeoTIFF) ber sína eigin staðsetningu og kerfi: opnaðu hana ein og sér. Myndin er geymd **inni í verkefnaskránni** (allt að 25 MB); stærri mynd er hafnað með stærð sinni, svo vistaðu minna afrit (færri pixla, eða JPEG).

## Flísar, WMS, WMTS og kortaþjónustur

Kveiktu fyrst á **Kortalög af internetinu**. Síðan í **Bæta við lagi**:

| Frá | Hvað á að líma | Hvað CivilCraft gerir |
|---|---|---|
| Flísaslóð | Sniðmát með `{z}`, `{x}` og `{y}` (eða `{-y}`), og `{s}` fyrir stafinn á þjóninum, til dæmis `https://tile.example.org/{z}/{x}/{y}.png`. Gefðu því heiti og heimildartilvísun þess. | Flísar í web Mercator fyrir svæðið og aðdráttinn á skjánum. |
| WMS-þjónn | Vistfang þjónsins, eða GetCapabilities-tengill hans. Veldu {{ui:Sækja lögin}}, síðan lagið. | Ein mynd af svæðinu á skjánum, beðin um í EPSG-kóða verkefnisins þegar þjónninn býður hann, annars í web Mercator eða WGS 84. |
| WMTS-þjónn | Vistfang þjónsins, eða `WMTSCapabilities.xml` hans. Veldu {{ui:Sækja lögin}}, síðan lagið og flísafylkjasettið (tile matrix set). | Flísar úr settinu í kerfi verkefnisins þegar það er til, annars web Mercator. |
| ArcGIS-kortaþjónusta (REST) | Slóð sem endar á `/MapServer` eða `/ImageServer`. Veldu {{ui:Lesa þjónustuna}}. | Þjónustur með skyndiminni í web Mercator eru teiknaðar úr flísunum sínum; aðrar eru beðnar um eina mynd af svæðinu á skjánum. |

Engir þjónar eru settir fram fyrirfram. Opinber dæmi, öll frá USGS National Map (almenningseign):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Kortaþjónusta: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (einnig `USGSImageryOnly` fyrir loftmyndir)

Mörg borgar- og sýslu-GIS-embætti birta eigin WMS- eða kortaþjónustur; GIS-síður þeirra gefa upp vistfangið. Þjónn sem biður um innskráningu eða lykil virkar ekki: CivilCraft sendir engin notandanöfn, lykilorð eða lykla.

## Hvernig lögin eru teiknuð

- Myndir í öðru kerfi en kerfi verkefnisins eru færðar yfir í það: myndin er skorin í búta, hver settur þannig að hann er innan fjórðungs úr skjápixli frá því sem nákvæm umbreyting setur hann.
- Flísar eru valdar fyrir svæðið á skjánum og aðdráttinn: aldrei fleiri en 64 fyrir sýn, 6 í einu. Þegar þú hreyfir eða aðdrar eru beiðnir fyrir gömlu sýnina hætt við. Um 200 flísar eru geymdar í minni (ekkert er vistað á disk).
- Mynd úr WMS eða kortaþjónustu er beðin um þegar sýnin hefur hætt að hreyfast; þar til hún kemur helst síðasta mynd á sínum stað.
- Heimildartilvísun hvers lags á skjánum birtist smátt neðst í hægra horni grunnmyndarinnar.

## Breyta, raða og fjarlægja lög

Í glugganum hefur hvert lag gátreit til að sýna eða fela það, **Ógegnsæi**-sleða, örvar til að teikna það fyrr (neðar) eða síðar (ofar), aðdráttarhnapp (myndir) og fjarlægingarhnapp. Fyrsta lagið í listanum er teiknað neðst. Hver breyting er eitt afturkallsskref.

## Þegar lag sýnir ekkert

Ástæðan birtist einu sinni í stöðulínunni og helst undir heiti lagsins í glugganum:

| Skilaboð | Hvað á að gera |
|---|---|
| Slökkt: kortalög af internetinu eru slökkt í stillingum. | Kveiktu á **Kortalög af internetinu**. |
| Þarf hnitakerfi verkefnisins | Stilltu það undir {{ui:Hnit}}. |
| Þjónninn leyfði ekki að þessi síða notaði myndir hans (CORS), eða ekki náðist í hann. | Þjónninn leyfir ekki vefsíðum að nota myndir sínar, eða hann er niðri. Eftir fjórar hafnanir hættir CivilCraft að biðja; felaðu og sýndu lagið aftur til að reyna aftur. |
| Þjónninn svaraði 404 … / Þjónninn sendi text/xml, ekki mynd: … | Slóðin, lagið eða stíllinn er rangt, eða skilaboð þjónsins segja hvað hann vill. |
| Þetta lag er ekki boðið í kerfi verkefnisins, web Mercator eða WGS 84 | Þjónninn getur ekki teiknað þar sem CivilCraft getur staðsett það. |

## Hvað var prófað

- Flísanúmer voru prófuð gegn stöðluðu web Mercator-flísakerfinu; WMS 1.1.1 og 1.3.0, WMTS og svör kortaþjónustu voru lesin úr handskrifuðum skrám og úr raunverulegum svörum vistuðum frá USGS National Map og terrestris OpenStreetMap-þjónum. WMS 1.3.0-beiðnir setja breiddargráðu fyrst fyrir EPSG:4326, eins og staðallinn segir.
- Umröðun var borin saman við nákvæma umbreytingu fyrir hvern pixla með tölum PROJ: innan 0,13 px fyrir flísar, WMS-myndir og sýslustærða mynd, í mælikvarða svæðisins og aðdregið.
- Mynd með heimsskrá sinni og RGB GeoTIFF skrifuð af GDAL (í gegnum rasterio) voru teiknuð þar sem staðsetning þeirra segir, athugað pixla fyrir pixla í vafranum.
- Í vafranum, gegn eftirlíkingarþjóni á prófunartölvunni: flísar lenda í þeirri flís sem PROJ setur hvern punkt í, WMS-mynd lendir innan 2 px, mest 6 beiðnir keyra í einu, og með stillingunni slökkt fer engin beiðni af síðunni. Kortaþjónustan frá USGS National Map hér að ofan var einnig lesin og teiknuð í beinni í vafranum einu sinni (flísarnar komu og voru teiknaðar, með höfundarréttartextanum sínum); hinir opinberu þjónarnir voru lesnir úr vistuðum svörum eingöngu.
