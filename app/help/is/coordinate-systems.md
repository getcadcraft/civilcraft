---
title: Stilla hnitakerfi verkefnisins
summary: Segðu í hvaða hnitakerfi mælingin er, svo CivilCraft geti sýnt breiddar- og lengdargráður, staðsett GIS-skrár og kortalög og skrifað .prj-skrár. Veldu eftir kóða, nafni, sjálfum hnitunum eða úr .prj-skrá.
keywords: hnitakerfi, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, varpun, prj, wkt, grunnvarpun, breiddargráða, lengdargráða, lat long, landfræðilegt, reitur, landstaðsetning, stilla hnitakerfi
from: 964250e2
---

Hnit verkefnisins eru einfaldar tölur þar til þú segir hvað þær þýða. Að stilla hnitakerfið **færir aldrei neitt**: það segir CivilCraft til dæmis að E 6,150,000 N 2,080,000 séu state plane-hnit fyrir svæði 6 í Kaliforníu í US survey feet. Um leið og það veit það:

- sýnir stöðustikan breiddar- og lengdargráður bendilsins,
- eru GIS-skrár í öðrum kerfum (shapefiles, GeoJSON, GeoPackage, hæðarreitir, LiDAR) umbreyttar inn í verkefnið um leið og þær eru opnaðar,
- má teikna kortalög undir teikningunni ([Sýna kortalög undir teikningunni](topic:map-layers)),
- ber útflutningur í GIS-snið kerfið með sér (`.prj` fyrir shapefiles, EPSG-kóðinn fyrir GeoPackage og GeoTIFF).

## Velja kerfið

1. Veldu {{ui:Hnit}} í {{ui:GIS}}-hópnum á tækjastikunni. Glugginn **Hnitakerfi** opnast. Efst segir hvaða kerfi verkefnið er í núna, eða **Ekkert — hnit eru bara tölur**.
2. Finndu kerfið á einn af þessum hátt:
   - **Leit**: skrifaðu EPSG-kóðann (`2277`, `EPSG:2277`) eða orð úr heitinu (`texas central`, `utm 14n`, `lambert-93`). Kóðar raðast eftir því sem þú skrifaðir; orð raða kerfum sem hafa öll orðin í heitinu.
   - {{ui:Kerfi sem þessi hnit passa við}} (þegar verkefnið hefur punkta eða yfirborð): CivilCraft les miðju verkefnisins í öllum kerfum af sömu mælieiningafjölskyldu og listar þau kerfi sem svæðið nær yfir. Hnit state plane passa venjulega aðeins við fá svæði: verkefni í Texas á E 3,115,000 N 10,070,000 US survey feet passar við fjögur Texas Central-afbrigði (NAD83, NAD83(2011), HARN, NSRS2007). Hver færsla sýnir hvar miðja verkefnisins myndi lenda.
   - **Nálægt (breidd, lengd)** og {{ui:Stinga upp á}}: skrifaðu hvar svæðið er, til dæmis `30.27, -97.74` eða `30°16′N 97°44′W`, og CivilCraft listar varpaðar kerfi sem svæðið nær yfir, þjóðkerfi og ríkiskerfi fyrst.
   - {{ui:Lesa .prj-skrá…}}: opnaðu `.prj`-skrána sem fylgdi shapefile eða teikningu. CivilCraft ber hana saman við listann sinn eftir varpunarútreikningum (þannig að `.prj` sem nefnir grunnvarpun öðru vísi finnur samt rétt kerfi) og segir hvaða kerfi það er; ef ekkert passar nákvæmlega er lýsing skráarinnar notuð. Þú getur líka dregið `.prj` á gluggann, eða opnað eða dregið eina á teikninguna eina og sér.
3. Smelltu á kerfi í listanum. Undir **Valið** sýnir það heitið, EPSG-kóðann, mælieininguna, hversu vel grunnvarpun þess er tengd við WGS 84, notkunarsvæði þess í breiddar- og lengdargráðum og hvar miðja verkefnisins liggur í því.
4. Hafðu **Reitakerfi** valið (flest verkefni; sjá [Land- og staðbundin hnit](topic:ground-and-local-coordinates) fyrir hin) og veldu {{ui:Beita}}.

Stöðustikan sýnir nú breidd og lengd bendilsins við hliðina á E og N. Að stilla kerfið er eitt afturköllunarskref: {{key:Mod+Z}} tekur það til baka.

:::note
Einingarnar verða að passa: verkefni í fetum tekur kerfi í US survey feet eða alþjóðlegum fetum, verkefni í metrum tekur kerfi í metrum. CivilCraft útskýrir höfnun („Verkefnið er í fetum en þetta kerfi er í metrum…“). Verkefni í fetum með kerfi í US survey foot notar survey feet: „ft“ verkefnisins þýðir fet kerfisins. Landfræðileg kerfi (breiddar- og lengdargráður, eins og WGS 84 sjálft) geta ekki verið kerfi verkefnis: teikningar þurfa austur- og norðurhnit.
:::

## Breyta eða fjarlægja kerfið

Opnaðu {{ui:Hnit}} aftur, veldu annað kerfi og veldu {{ui:Beita}}. Þegar verkefnið hefur punkta eða hönnun spyr CivilCraft **Eru hnitin í … nú þegar?**

- {{ui:Já — ekkert færist}}: tölurnar haldast eins og þær eru og aðeins merking þeirra breytist. Notaðu þetta þegar gamla kerfið var valið fyrir mistök.
- {{ui:Nei — umbreyta þeim}}: sérhver mælipunktur, brotlína, mörk, PI-punktur veglínu, horn palls og brunnur er umbreytt úr gamla kerfinu í það nýja, í einu afturköllunarskrefi. Yfirborð sem lesið er úr LandXML sem þríhyrningar er ekki hægt að umbreyta; byggðu það fyrst upp aftur úr punktunum.

{{ui:Fjarlægja kerfið}} tekur kerfið í burtu (ekkert færist). GIS-lög sem þegar eru í verkefninu haldast þar sem þau eru.

## Breiddar- og lengdargráður í stöðustikunni

Á meðan verkefnið hefur kerfi sýnir stöðustikan breiddar- og lengdargráðu bendilsins á WGS 84, til dæmis `30°18′00.00″ N  97°42′00.00″ W`. Til að fá gráður sem tugabrot í staðinn velurðu það undir {{ui:Stillingar}}, {{ui:CivilCraft}}, **Breiddar- og lengdargráður** ([Stillingar CivilCraft](topic:settings)). Með land- eða staðbundnum hnitum fer aflesturinn fyrst í gegnum það skref, þannig að hann er réttur fyrir punktinn undir bendlinum.

## Hversu góð grunnvarpunarfærslan er

Breiddar- og lengdargráður, GeoJSON og kortalög eru öll á WGS 84. Tenging hvers kerfis við WGS 84 birtist í glugganum:

| Það sem glugginn segir | Hvað það þýðir |
|---|---|
| WGS 84 sjálft | Engin færsla. |
| NAD83 er tekið sem WGS 84 | Þessi tvö skilja sig um metra eða tvo á flestum svæðum í Norður-Ameríku, í mesta lagi nokkra metra. Gott fyrir kortalög og samhengi svæðis; ekki fyrir mælistýripunkta. |
| Þekkt upp á um *n* m (tala EPSG) | Birt færsla; kortalög og GeoJSON geta skeikað um það bil þessa tölu. |
| Ekki þekkt fyrir þennan grunn | Engin birt færsla er til án ristarfærsluskrár: kortalög og GeoJSON geta skeikað um hundruð metra. |
| Úr ristarfærsluskránni … | Ristarfærsluskrá er í notkun (hér að neðan): innan um 10 cm frá NAD83 innan ristarinnar. |

Hnit verkefnisins fara aldrei í gegnum grunnvarpunarfærslu: aðeins það sem er umbreytt til eða frá breiddar- og lengdargráðum gerir það. Lóðréttir grunnar og jarðfræðileg líkön eru ekki meðhöndluð (hæðir eru aldrei umbreyttar). Þar sem besta færslan þarf ristarfærsluskrá listar kerfið grófari birta færslu og glugginn sýnir nákvæmni hennar (NAD27-kerfi til dæmis um 20 m), þangað til þú bætir ristinni við.

## Ristarfærsluskrár

Fyrir NAD27-kerfi setur **Ristarfærsluskrá** í glugga hnitakerfisins breiddar- og lengdargráður, GIS-skrár og kortalög innan um 10 cm frá NAD83 í stað um 20 m:

- **Sækja** ristina sem hann stingur upp á fyrir svæði kerfisins (NADCON5 fyrir meginland Bandaríkjanna, NADCON fyrir Alaska, NTv2 fyrir Kanada) frá cdn.proj.org, opinberum ristarþjóni PROJ. Aðeins skráarheiti ristarinnar er sent.
- Eða **Bæta við ristarskrá…** sem þú átt nú þegar: NTv2 (`.gsb`) eða PROJ GeoTIFF-rist (`.tif`), allt að 20 MB.

Ristin er vistuð í verkefnisskránni, þannig að hún fylgir verkefninu. Hlutinn segir hvort miðja verkefnisins er innan ristarinnar: utan hennar er engin færsla notuð, þannig að notaðu rist sem nær yfir svæðið. **Hætta að nota ristina** fer aftur í grófu færsluna. Hver breyting er eitt skref: {{key:Mod+Z}} afturkallar hana.

GIS-lög sem þegar eru í verkefninu haldast þar sem þau eru þegar ristin breytist; fluttu þau inn aftur til að staðsetja þau í gegnum ristina. Hnit verkefnisins færast aldrei.

## Hvað var athugað

- Hver umbreyting var borin saman við PROJ (pyproj 3.7.1 með PROJ 9.5.1), hnitasafnið sem flest GIS-forrit nota, á yfir 330 kerfum: state plane í US survey feet og fetum, UTM norður og suður, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator og web Mercator meðal annarra. Austur- og norðurhnit stemma innan 1 cm með sömu grunnfærslu (flest vel undir 1 mm), og varpunarútreikningarnir stemma við skilgreiningar PROJ innan 1 cm.
- `.prj`-skrár sem PROJ skrifar í báðum algengum gerðum (ESRI og OGC) voru lesnar til baka fyrir 105 kerfi: 208 af 210 pössuðu við nákvæma EPSG-kóðann sinn og hin tvö við kerfi með sömu útreikninga á sama sporbaug. `.prj`-skrár sem CivilCraft skrifar eru lesnar af PROJ sem sama kerfi. ESRI `.prj`-skrár fyrir pólstereógrafísk kerfi (UPS, Alaska-pól) er ekki hægt að lesa; veldu þau kerfi eftir kóða.
- Breiddar- og lengdargráðurnar í stöðustikunni stemma við PROJ innan 0.01″ í vafranum.
