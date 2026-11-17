---
title: Flytja inn GIS-gögn
summary: Færðu shapefile, GeoJSON og GeoPackage inn í verkefni sem GIS-lög, staðsettu þau í gegnum rétt hnitakerfi, skoðaðu eigindi þeirra og notaðu þau fyrir yfirborðið.
keywords: gis, merkimiðar, merkja hluti, eigindi á grunnmynd, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, innflutningur, lög, eigindi, hnitakerfi, epsg, breiddargráða, lengdargráða, hæðarlínur, lóðir, brotlínur, mörk
from: f6b235cc
---

GIS-deildir borga og sýslna dreifa samhengi lóðar sem GIS-skrám: lóðum, kvöðum, hæðarlínum, veitum, mælistýringu. CivilCraft opnar þrjár tegundir þeirra sem **GIS-lög** sem liggja undir hönnun þinni á grunnmyndinni.

| Skrá | Hvað á að opna |
|---|---|
| Shapefile | `.shp` ásamt `.shx`, `.dbf`, `.prj` og `.cpg` (veldu þær allar), eða `.zip` sem þær komu í. Zip-skrá með nokkrum shapefile gefur nokkur lög. |
| GeoJSON | `.geojson`-skráin (`.json`-skrá sem byrjar á `FeatureCollection` eða `Feature` virkar líka). |
| GeoPackage | `.gpkg`-skráin. Sérhver hlutatafla í henni er talin upp. |
| KML eða KMZ | `.kml`-skráin (frá Google Earth eða vefkorti), eða þjappaða `.kmz`. Hver mappa verður að lagi (skipt í punkta, línur og marghyrninga þegar hún geymir margar tegundir); nafn, lýsing og viðbótargögn staðmerkis verða að eigindum þess. Hæðir eru í m og breiddar- og lengdargráður, eins og í GeoJSON. |

Punktar, fjölpunktar, línur, marghyrningar með götum og fjölhluta lögun eru lesin, með hæðum sínum (z) þegar skráin hefur þær. M-gildi eru skilin eftir. Hæðarnet og LiDAR opnast á sama hátt: sjá [Hæðarnet og LiDAR](topic:elevation-grids-and-lidar).

## Opna skrárnar

1. Smelltu á {{ui:Flytja inn}} í **GIS**-hópnum (eða {{ui:Opna}}), veldu skrárnar, eða slepptu þeim á grunnmyndina. Skrárnar eru lesnar á þessari tölvu; ekkert er hlaðið upp.
2. Glugginn **Flytja inn GIS-gögn** telur upp hvert lag sem fannst: tegund þess, hversu marga hluti (og hversu margir hafa enga rúmfræði), hversu marga eigindareiti og hnitakerfið sem skráin nefnir. Afhakaðu lögin sem þú vilt ekki.
3. Lestu hlutann **Hnitakerfi** (hér að neðan) og línuna **Hvað gerist**, smelltu síðan á {{ui:Flytja inn}}.
4. Lögin birtast á grunnmyndinni og undir **GIS-lög** í vinstra spjaldinu. Innflutningurinn er eitt skref: {{key:Mod+Z}} tekur hann til baka.

Stór skrá sýnir framvinduslínu yfir grunnmyndinni með {{ui:Hætta við}} hnappi.

## Hnitakerfið

GIS-skrár segja hvar þær eru í gegnum hnitakerfi (`.prj` shapefile, landfræðitöflu GeoPackage; GeoJSON er alltaf breiddar- og lengdarhnit). CivilCraft umbreytir hverju lagi úr eigin kerfi yfir í kerfi verkefnisins. Það giskar aldrei:

- **Verkefnið hefur hnitakerfi** (stillt í {{ui:Hnit}}): sérhvert lag með eigið kerfi er umbreytt yfir í það, þar með talin jarðar- eða staðbundin aðlögun. Skrá án `.prj` fær tvo kosti: **Sama og verkefnið** (tölurnar hennar eru hlaðnar eins og þær eru) eða **Velja kerfi skrárinnar**.
- **Verkefnið hefur ekkert, og skráin er í varpaðu kerfi í einingum verkefnisins** (state plane-belti í US survey ft fyrir ft-verkefni, til dæmis): glugginn býður **Nota það kerfi sem hnitakerfi verkefnisins**. Það er stillt í sama afturköllunarskrefi og innflutningurinn. Ekkert í verkefninu hreyfist; kerfið segir aðeins hvað tölurnar þýða. Þú getur valið annað kerfi fyrir verkefnið í staðinn og lögin eru þá umbreytt í það.
- **Verkefnið hefur ekkert, og skráin er í breiddar- og lengdargráðum** (sérhver GeoJSON) **eða í öðrum einingum**: {{ui:Flytja inn}} er áfram grátt þar til þú velur hnitakerfi verkefnisins. Valið byrjar nálægt gögnunum.
- **Hvorki verkefnið né skrárnar nefna kerfi**: tölurnar eru hlaðnar eins og þær eru, og glugginn segir það.

Hæðir eru einnig umbreyttar: GeoJSON-hæðir eru í m (GeoJSON-staðallinn segir það); hæðir annarra skráa eru teknar í einingu eigin kerfis þeirra.

:::warning
Staðsetningar í GeoJSON-skrá utan ±180° lengdar eða ±90° breiddar eru ekki breiddar- og lengdargráður. Þeir hlutir eru skildir eftir og glugginn segir hversu margir. Slík skrá er yfirleitt varpuð skrá vistuð án kerfis síns; biddu um hana aftur, eða um shapefile með `.prj`.
:::

NAD83 er meðhöndlað sem það sama og WGS 84 (kerfið sem GeoJSON notar); þau munu um nokkra metra í Norður-Ameríku, þannig að GeoJSON-gögn geta skeikað um það. Þar sem besta færslan þarf netskrá (NADCON fyrir NAD27, til dæmis), notar CivilCraft grófari birta færslu og glugginn fyrir hnitakerfi sýnir hversu gróf hún er (fyrir NAD27, um 20 m), þar til þú bætir netinu við: sjá [Netfærsluskrár](topic:coordinate-systems).

## GIS-lög

Hver röð undir **GIS-lög** hefur:

- gátreit til að sýna eða fela lagið (falin lög eru heldur ekki valin);
- lit þess, valinn af listanum;
- valmynd (þrír punktar) með {{ui:Þysja að}}, {{ui:Nota fyrir yfirborðið…}}, {{ui:Endurnefna…}} og {{ui:Fjarlægja}}.

Sýning, fel, endurlitun, endurnefning og fjarlæging eru skref í afturköllun. GIS-lög eru vistuð í verkefnaskránni og koma aftur þegar þú opnar hana. Þau fara einnig út með PDF-teikningu grunnmyndarinnar og DXF- og DWG-útflutningi hennar, hvert á lagi sem heitir `GIS-` og númerið þess.

## Merkja hluti út frá eigind

Í valmynd lagsins {{ui:Meira}} (þrír punktar í **GIS-lög**) velurðu reit undir **Merkja með**: sérhver hlutur sýnir gildi sitt á grunnmyndinni, í lit lagsins. Punktar fá merki við hliðina á punktinum, línur eftir miðju lengsta hluta þeirra (snúið til að lesast frá vinstri til hægri), marghyrningar í miðju sinni. Tölur birtast með allt að þremur aukastöfum. Merkimiðar eru 1.8 mm háir á pappír í hvaða kvarða sem er, og fara í PDF-teikninguna, DXF og DWG. Veldu **Engir merkimiðar** til að fjarlægja þá; hver breyting er eitt skref ({{key:Mod+Z}} afturkallar henni). Lag merkir að hámarki 5,000 hluti.

## Skoða hlut

Með {{ui:Velja}} virku smellirðu á hlut. **Eiginleikar** sýnir lag hans, hvaða hlutur það er, lögun hans (hluta, göt, hornpunkta), hæðir hans, skrána sem hann kom úr og hnitakerfi þeirrar skráar, og síðan öll eigindi í töflu. Eigindi eru lesin eingöngu: CivilCraft sýnir GIS-gögn eins og þau komu, það breytir þeim ekki.

Punktar hafa forgang fram yfir línur þegar hvort tveggja er undir bendlinum; innan marghyrnings er minnsti marghyrningurinn valinn.

## Nota fyrir yfirborðið

Opnaðu valmynd lags og veldu {{ui:Nota fyrir yfirborðið…}} (eða hnappinn í **Eiginleikum**). Það sem er í boði fer eftir laginu:

| Lag | Getur orðið |
|---|---|
| Línur með hæðum (3D-línur) | Brotlínur í eigin hæðum |
| Línur án hæða en með talnareit (hæðarlínur) | Brotlínur í hæðinni í reitnum sem þú velur |
| Marghyrningar | Jaðar yfirborðs (valinn marghyrningur, annars sá stærsti), eða brotlínur eftir jöðrum þeirra |
| Punktar með hæðum, eða með hæðarreit | Mælipunktar, lýstir með nafni lagsins svo þeir myndi punktahóp |

Sérhver notkun er eitt skref í afturköllun sem afritar rúmfræðina inn í verkefnið; lagið sjálft helst óbreytt. Hæðir eru teknar í einingum verkefnisins.

## Punktaskrár með breiddar- og lengdargráðum

Punktaskrá sem haus hennar nefnir dálkana **latitude** og **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) er lesin sem gráður, ekki sem norður- og austurhnit. Innflutningsglugginn segir það. Við {{ui:Flytja inn}} eru punktarnir umbreyttir í hnitakerfi verkefnisins; verkefni án þess biður þig fyrst um að velja það. Gráður eru aldrei hlaðnar sem ft. Línur utan ±90° breiddar eða ±180° lengdar eru hafnaðar og ástæðan gefin. Hæðardálkurinn er tekinn eins og hann er, í einingum verkefnisins.

## LandXML-skrár sem nefna hnitakerfi

Þegar LandXML-skrá sem þú opnar hefur `CoordinateSystem`-þátt (EPSG-kóða, WKT-lýsingu eða heiti kerfis), býður CivilCraft hana sem hnitakerfi verkefnisins. Ekkert hreyfist ef þú samþykkir; kerfið segir aðeins hvað tölurnar þýða.

## Hvað var prófað

- Sérhver lesari var borinn saman við GDAL, bókasafnið sem flest GIS-forrit nota til að lesa þessar skrár, á skrám sem GDAL skrifaði: shapefile af öllum tegundum með og án hæða, fjölhluta línur, marghyrninga með götum, tóma rúmfræði, texta-, talna-, dagsetninga- og satt/ósatt-eigindi, UTF-8 og Windows-1252 texta með og án `.cpg`, zip með nokkrum shapefile, GeoJSON með öllum rúmfræðigerðum og GeoPackage með fjórum töflum. Öll rúmfræði, hæðir og eigindi stemmdu.
- Staðsetningar umbreyttar úr breiddar- og lengdargráðum og úr UTM stemmdu við PROJ (varpunarbókasafnið á bak við GDAL) innan 3 mm.
- Skemmdar skrár (styttar, með röngum stærðum, gölluð zip, gallaðar GeoPackage-skrár) gefa eitt einfalt skilaboð; ekkert frýs.
- Ekkert af þessu hefur enn verið opnað í öðrum GIS-forritum, og file geodatabases, KML og KMZ eru ekki lesin enn (sjá [Ekki smíðað enn](topic:not-built-yet)).
