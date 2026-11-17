---
title: Ingiza data ya GIS
summary: Leta shapefiles, GeoJSON na GeoPackages katika mradi kama tabaka za GIS, ziweke kupitia mfumo sahihi wa kuratibu, tazama sifa zake, na uzitumie kwa uso.
keywords: gis, lebo, lebo za vipengele, sifa kwenye mpango, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, ingiza, tabaka, sifa, mfumo wa kuratibu, epsg, latitudo, longitudo, kontua, viwanja, mistari ya kuvunja, mpaka
from: f6b235cc
---

Idara za GIS za miji na kaunti hutoa muktadha wa eneo kama faili za GIS: viwanja, haki za kupita, kontua, huduma, na alama za udhibiti wa upimaji. CivilCraft inafungua aina tatu kati yake kama **tabaka za GIS** zinazokaa chini ya muundo wako kwenye mpango.

| Faili | Cha kufungua |
|---|---|
| Shapefile | `.shp` pamoja na `.shx`, `.dbf`, `.prj` na `.cpg` (zichague zote), au `.zip` walichokuja nacho. Zip lenye shapefiles kadhaa linatoa tabaka kadhaa. |
| GeoJSON | Faili la `.geojson` (faili la `.json` ambalo mistari yake ya kwanza inasema `FeatureCollection` au `Feature` pia linafanya kazi). |
| GeoPackage | Faili la `.gpkg`. Kila jedwali la vipengele ndani yake linaorodheshwa. |
| KML au KMZ | Faili la `.kml` (kutoka Google Earth au ramani ya wavuti), au `.kmz` iliyobanwa. Kila folda inakuwa tabaka (inagawanywa kuwa nukta, mistari na poligoni pale inapokuwa na aina kadhaa); jina la alama, maelezo na data ya ziada vinakuwa sifa zake. Miinuko iko katika mita, na latitudo na longitudo, kama GeoJSON. |

Nukta, pointi nyingi, mistari, poligoni zenye mashimo na maumbo ya sehemu nyingi vinasomwa, pamoja na miinuko (z) faili inapokuwa nayo. Thamani za kipimo (M) zinaachwa nje. Gridi za miinuko na LiDAR zinafunguka kwa njia ile ile: tazama [Gridi za miinuko na LiDAR](topic:elevation-grids-and-lidar).

## Fungua faili

1. Bonyeza {{ui:Ingiza}} katika kikundi cha **GIS** (au {{ui:Fungua}}), chagua faili, au uziangushe kwenye mpango. Faili zinasomwa kwenye kompyuta hii; hakuna kinachopakiwa.
2. Kisanduku cha **Ingiza data ya GIS** kinaorodhesha kila tabaka lililopatikana: aina yake, vipengele vingapi (na vingapi havina jiometri), sehemu ngapi za sifa, na mfumo wa kuratibu ambao faili linautaja. Ondoa tiki kwenye tabaka usizotaka.
3. Soma sehemu ya **Mfumo wa kuratibu** (hapa chini) na mstari wa **Kitakachotokea**, kisha bonyeza {{ui:Ingiza}}.
4. Tabaka zinaonekana kwenye mpango na chini ya **Tabaka za GIS** katika paneli ya kushoto. Uingizaji ni hatua moja: {{key:Mod+Z}} unaurudisha.

Faili kubwa huonyesha mstari wa maendeleo juu ya mpango pamoja na kitufe cha {{ui:Ghairi}}.

## Mfumo wa kuratibu

Faili za GIS zinaonyesha zilipo kupitia mfumo wa kuratibu (`.prj` ya shapefile, jedwali la marejeo ya anga la GeoPackage; GeoJSON daima ni latitudo na longitudo). CivilCraft inabadilisha kila tabaka kutoka mfumo wake hadi wa mradi. Haikisii kamwe:

- **Mradi una mfumo wa kuratibu** (uliowekwa katika {{ui:Kuratibu}}): kila tabaka lenye mfumo wake linabadilishwa kuwa huo, pamoja na marekebisho ya ardhi au ya ndani. Faili lisilo na `.prj` linapata chaguo mbili: **Sawa na mradi** (namba zake zinapakiwa kama zilivyo) au **Chagua mfumo wa faili**.
- **Mradi hauna, na faili liko katika mfumo wa ramani kwa vitengo vya mradi wako** (ukanda wa state plane kwa futi za US survey kwa mradi wa futi, kwa mfano): mazungumzo yanatoa **Tumia mfumo huo kama mfumo wa kuratibu wa mradi**. Unawekwa katika hatua moja ya kutendua pamoja na uingizaji. Hakuna kitu katika mradi kinachosogea; mfumo unaeleza tu maana ya namba. Unaweza kuchagua mfumo mwingine wa mradi badala yake, na tabaka zitabadilishwa kuwa huo.
- **Mradi hauna, na faili liko katika latitudo na longitudo** (GeoJSON zote) **au katika vitengo vingine**: {{ui:Ingiza}} inabaki imefifia hadi uchague mfumo wa kuratibu wa mradi. Kiteuzi kinaanza karibu na data.
- **Mradi na faili havitaji mfumo wowote**: namba zinapakiwa kama zilivyo, na mazungumzo yanasema hivyo.

Miinuko nayo inabadilishwa: miinuko ya GeoJSON ni mita (kiwango cha GeoJSON kinasema hivyo); miinuko ya faili nyingine inachukuliwa katika kitengo cha mfumo wao.

:::warning
Nafasi katika faili la GeoJSON nje ya ±180° longitudo au ±90° latitudo si latitudo na longitudo. Vipengele hivyo vinaachwa nje na mazungumzo yanasema ni vingapi. Faili kama hilo mara nyingi ni faili la ramani lililohifadhiwa bila mfumo wake; liombe tena, au upate shapefile yenye `.prj` yake.
:::

NAD83 inachukuliwa sawa na WGS 84 (mfumo ambao GeoJSON hutumia); hizo mbili zinatofautiana kwa mita chache Amerika Kaskazini, kwa hiyo data ya GeoJSON inaweza kuwa nje kwa kiasi hicho. Pale ambapo mabadiliko bora yanahitaji faili la gridi (NADCON kwa NAD27, kwa mfano), CivilCraft inatumia mabadiliko mabaya zaidi yaliyochapishwa, na mazungumzo ya mfumo wa kuratibu yanaonyesha ni mabaya kiasi gani (kwa NAD27, takriban m 20), mpaka uongeze faili la gridi: tazama [Faili za mabadiliko ya gridi](topic:coordinate-systems).

## Tabaka za GIS

Kila safu chini ya **Tabaka za GIS** ina:

- kisanduku cha kuteua cha kuonyesha au kuficha tabaka (tabaka zilizofichwa pia hazichaguliwi);
- rangi yake, iliyochaguliwa kutoka orodha;
- menyu (vitone vitatu) yenye {{ui:Kuza hadi}}, {{ui:Tumia kwa uso…}}, {{ui:Badilisha jina…}} na {{ui:Ondoa}}.

Kuonyesha, kuficha, kubadili rangi, kubadili jina na kuondoa ni hatua za kutendua. Tabaka za GIS zinahifadhiwa katika faili la mradi na zinarudi unapolifungua. Pia zinatoka pamoja na chapa ya PDF ya mpango na hamisho zake za DXF na DWG, kila moja kwenye tabaka lililoitwa `GIS-` pamoja na namba yake.

## Weka lebo kutoka kwa sifa

Katika menyu ya {{ui:Zaidi}} ya tabaka (vitone vitatu katika **Tabaka za GIS**), chagua sehemu chini ya **Weka lebo kwa**: kila kipengele kinaonyesha thamani yake kwenye mpango, kwa rangi ya tabaka. Nukta zinawekewa lebo kando ya nukta, mistari kando ya sehemu yake ndefu zaidi (zinageuzwa ili zisomeke kutoka kushoto kwenda kulia), na poligoni katikati yake. Namba zinaonyesha hadi desimali tatu. Lebo zina urefu wa 1.8 mm kwenye karatasi katika kipimo chochote, na zinaingia kwenye chapa ya PDF, DXF na DWG. Chagua **No labels** (Hakuna lebo) ili kuziondoa; kila mabadiliko ni hatua moja ({{key:Mod+Z}} inaitendua). Tabaka moja linaweka lebo kwa vipengele 5,000 pekee.

## Angalia kipengele

Ukiwa na {{ui:Chagua}} umewashwa, bonyeza kipengele. **Mali** inaonyesha tabaka lake, ni kipengele kipi, umbo lake (sehemu, mashimo, vituo), miinuko yake, faili lilikotoka na mfumo wa kuratibu wa faili hilo, kisha sifa zote katika jedwali. Sifa ni za kusoma tu: CivilCraft inaonyesha data ya GIS kama ilivyokuja, haiihariri.

Pale vyote viwili vinapokuwa chini ya kielekezi, nukta zinatangulia kuliko mistari; ndani ya poligoni, ile ndogo kabisa ndiyo inachaguliwa.

## Tumia kwa uso

Fungua menyu ya tabaka na chagua {{ui:Tumia kwa uso…}} (au kitufe katika **Mali**). Kinachotolewa kinategemea tabaka:

| Tabaka | Inaweza kuwa |
|---|---|
| Mistari yenye miinuko (mistari ya 3D) | Mistari ya kuvunja katika miinuko yake |
| Mistari isiyo na miinuko lakini yenye sehemu ya namba (kontua) | Mistari ya kuvunja katika miinuko ya sehemu unayochagua |
| Poligoni | Mpaka wa uso (poligoni iliyochaguliwa, la sivyo kubwa zaidi), au mistari ya kuvunja kando ya kingo zake |
| Nukta zenye miinuko, au zenye sehemu ya miinuko | Pointi za upimaji, zilizoelezewa kwa jina la tabaka ili ziunde kikundi cha pointi |

Kila matumizi ni hatua moja ya kutendua inayonakili jiometri kwenye mradi; tabaka lenyewe linabaki kama lilivyo. Miinuko inachukuliwa katika vitengo vya mradi.

## Faili za pointi zenye latitudo na longitudo

Faili la pointi ambalo kichwa chake kinataja safu wima za **latitude** na **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) linasomwa kama digrii, si kama northing na easting. Mazungumzo ya uingizaji yanasema hivyo. Kwenye {{ui:Ingiza}}, pointi zinabadilishwa kuwa mfumo wa kuratibu wa mradi; mradi usio nao unakuomba uuchague kwanza. Digrii hazipakiwi kamwe kama futi. Safu zilizo nje ya latitudo ±90° au longitudo ±180° zinakataliwa, pamoja na sababu. Safu ya miinuko inachukuliwa kama ilivyo, katika vitengo vya mradi.

## Faili za LandXML zinazotaja mfumo wa kuratibu

Faili la LandXML unalofungua likiwa na kipengele cha `CoordinateSystem` (msimbo wa EPSG, maelezo ya WKT au jina la mfumo), CivilCraft inautoa kama mfumo wa kuratibu wa mradi. Hakuna kinachosogea ukikubali; mfumo unaeleza tu maana ya namba.

## Kilichokaguliwa

- Kila msomaji alilinganishwa na GDAL, maktaba ambayo programu nyingi za GIS hutumia kusoma faili hizi, kwa faili ambazo GDAL yenyewe iliziandika: shapefiles za kila aina zenye na zisizo na miinuko, mistari ya sehemu nyingi, poligoni zenye mashimo, jiometri tupu, sifa za maandishi, namba, tarehe na kweli/uongo, maandishi ya UTF-8 na Windows-1252 yenye na yasiyo na `.cpg`, zip ya shapefiles kadhaa, GeoJSON za kila aina ya jiometri, na GeoPackage yenye jedwali nne. Kila jiometri, miinuko na sifa vililingana.
- Pointi zilizobadilishwa kutoka latitudo na longitudo, na kutoka UTM, zililingana na PROJ (maktaba ya ramani nyuma ya GDAL) ndani ya 3 mm.
- Faili zilizoharibika (zilizokatika, zinazodanganya ukubwa wake, zips mbaya, GeoPackages mbaya) zinatoa ujumbe mmoja wa kawaida; hakuna kinachokwama.
- Hakuna hapa kilichofunguliwa katika programu nyingine za GIS bado, na file geodatabases, KML na KMZ hazisomwi bado (tazama [Bado haijajengwa](topic:not-built-yet)).
