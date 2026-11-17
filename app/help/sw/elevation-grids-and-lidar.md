---
title: Gridi za mwinuko na LiDAR
summary: Jenga ardhi iliyopo kutoka DEM (GeoTIFF au gridi ya ASCII) au nukta za LiDAR (LAS, LAZ) — chagua eneo, punguza data, chagua madaraja na uangalie vitengo vya mwinuko — kisha rudisha uso kama gridi ya mwinuko ya GeoTIFF.
keywords: dem, dtm, gridi ya mwinuko, geotiff, tif, gridi ya ascii, asc, lidar, las, laz, wingu la nukta, madaraja, ardhi, kupunguza, nodata, raster, hamisha geotiff, gis
from: c8b2d18a
---

Data ya mwinuko wa umma inakuja kwa njia mbili: **gridi za mwinuko** (DEM: mwinuko mmoja kwa kila seli ya mraba, kwa kawaida GeoTIFF `.tif` au gridi ya ASCII `.asc`) na **nukta za LiDAR** (mamilioni ya miale ya leza kwenye faili la `.las`, au `.laz` likiwa limebanwa). CivilCraft inageuza yoyote kati ya hizo kuwa nukta za upimaji au uso, ndani ya kivinjari: hakuna kinachopakiwa.

## Fungua faili

1. Bofya {{ui:Open}} (au {{ui:Import}} kwenye kikundi cha GIS) kisha uchague faili, auliburute kwenye mpango. Kwa gridi ya ASCII, chagua pia faili lake la `.prj`, ili CivilCraft ijue mfumo wake wa viwianishi.
2. Kisanduku cha uingizaji kinaonyesha faili linasema nini kuhusu yenyewe: ukubwa wake, seli au nukta zake, mfumo wake wa viwianishi, lilipo kwa latitudo na longitudo, na safu ya mwinuko wake. Kwa LiDAR, kwanza husoma kila nukta mara moja kuhesabu **madaraja** (upau wa maendeleo unaonyesha inafika wapi; {{ui:Cancel}} unasimamisha).

GeoTIFF yenye bendi tatu au nne (nyekundu, kijani, bluu) ni picha, si mwinuko: inaenda kwenye tabaka za ramani badala yake.

## Chagua kinachoingizwa

- **Eneo**: {{ui:The project’s extents and a margin}} (andika pambizo), {{ui:What the plan shows now}}, au {{ui:The whole file}}. Sehemu hiyo tu ya faili ndiyo inayosomwa.
- **Punguza hadi**: nafasi kati ya nukta utakazopata, katika vitengo vya mradi. Mstari chini ya mipangilio unaonyesha nukta ngapi hiyo inatoa unapoandika. Kwa gridi, CivilCraft huhifadhi kila seli ya pili, ya tatu … kwa hiyo mwinuko unabaki sawa kabisa na faili; haichanganyi seli pamoja kamwe. Kwa LiDAR, eneo linakatwa katika mraba wa ukubwa huo na nukta moja huhifadhiwa kwa kila mraba: {{ui:The point nearest each cell’s center}} (chaguo-msingi), {{ui:The lowest point in each cell}} (nzuri faili linapokosa daraja la ardhi: ardhi iko chini ya miti) au {{ui:The average of each cell’s points}}.
- **Madaraja** (LiDAR): ardhi (daraja 2) inatiwa alama faili linapokuwa nayo; majengo, miti na kelele zimeachwa. Faili lisipokuwa na daraja la ardhi, madaraja yote yanatiwa alama, na kisanduku kinasema hivyo.
- **Ardhi** (LiDAR, 0.8): wingu la drone halina daraja la ardhi. Faili lisipokuwa nalo, kisanduku kinaanza kwenye {{ui:Find the ground myself (drone clouds, no ground class)}}: madaraja yote isipokuwa kelele yanasomwa, nukta ya chini kabisa kwa kila seli inahifadhiwa, kisha CivilCraft inaondoa majengo, miti na nukta chache za chini zilizopotea kwa kichujio cha morfolojia cha kuendelea (Zhang na wengine, 2003) unachoweza kukiongoza: **Kitu kikubwa zaidi cha kuondoa** (upana wa jengo kubwa zaidi; madirisha yanakua hadi yanalifunika; 0 maana yake seli 20) na **Mteremko mkali zaidi wa ardhi**. Kazi inafanywa kwenye gridi ya nukta za chini kabisa, kwa hiyo wingu lenye mamilioni kadhaa ya nukta haligharimu zaidi ya idadi ya seli zake (kupunguza ni pasi moja ya kutiririsha). Nafasi ndiyo ukubwa wa seli: seli kubwa zaidi ni ya haraka na hukosa vitu vidogo kidogo kuliko unavyotarajia, seli ndogo zaidi huhifadhi maelezo zaidi ya ardhi. Ripoti inasema nukta ngapi zilihifadhiwa kama ardhi, seli ngapi ziliondolewa kama vitu na nukta ngapi za chini zisizo za kawaida zilitupwa. Katika uchunguzi wa drone wa mita 300 wa kubuni, wenye majengo matano, miti 70 na nukta 200 za chini zisizo za kawaida, nukta zilizohifadhiwa zilikuwa ndani ya sentimita 3 kutoka ardhi halisi, na hakuna paa wala dari ya miti iliyohifadhiwa.
- **Mwinuko katika faili**: mita, futi au futi za upimaji wa Marekani. Faili linaposema, kitengo chake tayari kimechaguliwa. Lisposema hivyo, lazima uchague: kisanduku kinaonyesha safu ya mwinuko kwa njia zote mbili ili uweze kuona ipi ina maana kwa eneo.
- **Ingiza kama** (gridi tu): {{ui:Survey points (description DEM)}}, au {{ui:The surface itself (a grid of triangles)}}.

Uingizaji mmoja unachukua nukta 500,000 zaidi. Chaguo likitoa zaidi, kisanduku kinasema kwa kiasi gani na nafasi gani ingetosha, na {{ui:Import}} inabaki imezimwa.

Bofya {{ui:Import}}. Upau wa maendeleo unaonyesha usomaji; {{ui:Cancel}} unausimamisha, na hakuna kinachobadilika.

:::warning
Vitengo vya wima ni mtego wa kawaida. DEM nyingi za state plane zina easting na northing kwa futi lakini mwinuko kwa mita. Linganisha safu inayoonyeshwa na kisanduku na unachojua kuhusu eneo.
:::

## Utapata nini

- **Nukta za upimaji**: zinahesabiwa kuanzia nambari yako ya juu zaidi ya nukta, zikiwa na maelezo `DEM` (gridi) au `LIDAR`, kwa hiyo zinaunda kikundi kimoja cha nukta chini ya **Nukta** na kujenga uso kama nukta nyingine yoyote. Kuziingiza ni hatua moja: {{key:Mod+Z}} inaziondoa tena.
- **Uso wenyewe**: TIN ya gridi, pembetatu mbili kwa kila seli, zikigawanywa kwenye mlalo wa kusini-magharibi hadi kaskazini-mashariki. Pembetatu yenye kona isiyo na data inaachwa, kwa hiyo mashimo kwenye data yanabaki mashimo. Uso ni sawa na gridi kwenye kila nukta ya gridi, na ni ndege bapa ndani ya kila pembetatu kati yao. Unabadilisha uso wa mradi (kisanduku kinauliza kwanza); {{key:Mod+Z}} inarudisha uso uliotangulia. Kichwa cha paneli ya kushoto kinasema **Uso (kutoka gridi ya mwinuko)**.

## Mifumo ya viwianishi

- Mradi ukiwa na mfumo wa viwianishi na faili likitaja mwingine, kila nukta inabadilishwa kuwa mfumo wa mradi (na kuwa viwianishi vya ardhi au vya ndani inapokuwa navyo).
- Mradi usipokuwa nao na mfumo wa faili uko katika vitengo vya mradi (futi au mita), kisanduku kinatoa kuufanya mfumo wa viwianishi wa mradi, katika hatua moja ya kutendua pamoja na nukta.
- Faili likiwa kwa latitudo na longitudo, au kwa mita kwa mradi wa futi, kisanduku kinakuomba kwanza uchague mfumo wa viwianishi wa mradi.
- Faili lisposema, nambari zake huchukuliwa kama viwianishi vya mradi. Unaweza kuchagua mfumo wa faili badala yake.

## Hamisha uso kama GeoTIFF

1. Bofya {{ui:Export}} kwenye kikundi cha GIS.
2. Katika sehemu ya GeoTIFF chagua uso (ardhi iliyopo au uso uliosawazishwa) na ukubwa wa seli. Chaguo-msingi linatokana na wastani wa ukingo wa pembetatu wa uso. Kisanduku kinaonyesha ukubwa wa gridi itakayoandikwa.
3. Bofya {{ui:Download GeoTIFF}}.

Faili ni bendi moja ya mwinuko wa nukta-kuelea ya biti 32 katika vitengo vya mradi, juu ya eneo la uso; seli zilizo nje ya uso ni "hakuna data" (−3.4028235e38). Thamani ya kila seli ni mwinuko wa uso kwenye kituo cha seli. Viwianishi ni viwianishi vya **gridi**: mradi wenye viwianishi vya ardhi au vya ndani unageuzwa tena kuwa gridi. Faili linataja mfumo wa viwianishi wa mradi kwa msimbo wake wa EPSG; mfumo usio na msimbo wa EPSG hauandikwi, na kisanduku kinakuonya umwambie idara ya GIS mfumo huo ni upi.

## Kilichokaguliwa

- Visomaji vya GeoTIFF na gridi ya ASCII vilikaguliwa dhidi ya GDAL (kupitia rasterio), maktaba ambayo programu nyingi za GIS hutumia kusoma faili hizi: gridi za nukta-kuelea za biti 32 na za nambari kamili za biti 16, zilizopangwa kwa vigae na kwa mistari, DEFLATE na LZW, nodata, kipimo na mkabala, nukta-ni-pointi, gridi ya UTM, gridi ya state plane kwa futi za upimaji wa Marekani, na gridi ya latitudo/longitudo — kila thamani ilikuwa sawa.
- Visomaji vya LAS na LAZ vilikaguliwa dhidi ya laspy: LAS 1.2 na 1.4, miundo ya nukta 0, 1, 3, 6, 7 na 8, vyenye na visivyo na mfumo wa viwianishi, na LAZ iliyoandikwa na kiendeshi chenye utangamano wa LASzip — kila nukta ilikuwa sawa.
- Viwianishi vilivyobadilishwa vilikaguliwa dhidi ya PROJ hadi milimita 1.
- GeoTIFF zilizohamishwa zilisomwa tena na GDAL: mfumo wa viwianishi, nafasi za seli, nodata, vitengo, na thamani sawa na uso hadi 0.0001.
- Hakuna kitu hapa kilichofunguliwa kwenye programu nyingine za GIS au CAD.

## Bado hazijajengwa

- Mabadiliko ya datum ya wima (modeli za geoidi): mwinuko unatumika kama faili unavyouwasilisha.
- Data ya umbo la wimbi, miale ya LiDAR isiyo kwa daraja, rangi na ukubwa wa mwanga.
- Bendi kadhaa, overviews, au faili zinazozidi MB 200.
- Kuandika LAS au LAZ kutoka kwenye uso au kutoka zana hii ([nyongeza ya Mawingu ya nukta](topic:point-clouds) huandika wingu lililosafishwa kama LAS 1.4 au LAZ).
