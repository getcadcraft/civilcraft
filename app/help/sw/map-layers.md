---
title: Onyesha tabaka za ramani chini ya mpango
summary: Weka picha iliyowekwa kwenye kuratibu, vigae vya ramani, seva ya WMS au WMTS, au huduma ya ramani chini ya mpango kama muktadha wa tovuti, pamoja na mpangilio wa intaneti, uwazi, mpangilio na uhusishaji.
keywords: tabaka za ramani, msingi wa ramani, msingi, mandharinyuma, angani, orthophoto, picha, setilaiti, raster, faili la dunia, pgw, jgw, tfw, wld, geotiff, picha iliyowekwa kwenye kuratibu, xyz, vigae, ramani ya slippy, wms, wmts, getcapabilities, huduma ya ramani, rest, mapserver, imageserver, usgs, national map, uhusishaji, uwazi
from: 32d7718e
---

Tabaka za ramani ni picha zinazochorwa chini ya muundo wako: picha ya angani pamoja na faili lake la dunia, au ramani kutoka seva za intaneti. Ni muktadha wa tovuti kwenye skrini tu: **hazimo** katika chapa za PDF, usafirishaji wa DXF au DWG, wala mwonekano wa 3D.

Chagua {{ui:Ramani}} katika kikundi cha {{ui:GIS}}. Kidirisha cha **Tabaka za ramani** kinaorodhesha tabaka za mradi na kuongeza mpya. Tabaka za ramani zinahitaji mfumo wa viwianishi wa mradi ([Weka mfumo wa viwianishi wa mradi](topic:coordinate-systems)), isipokuwa picha ambayo faili lake la dunia linatumia viwianishi vya mradi wenyewe.

## Mpangilio wa intaneti

CivilCraft haiombi seva ya ramani chochote mpaka uiruhusu: {{ui:Mipangilio}}, {{ui:CivilCraft}}, **Tabaka za ramani kutoka intaneti**: **Imezimwa** (mwanzo) au **Imewashwa**.

:::note
Ikiwa imewashwa, CivilCraft inaziomba seva za ramani unazoziongeza picha za eneo lililo kwenye skrini. Mchoro wako unabaki kwenye kompyuta hii; seva inaona eneo na anwani yako ya intaneti.
:::

Wakati imezimwa, tabaka za intaneti zinaorodheshwa kwenye kidirisha lakini zimefifia, pamoja na sababu, na hakuna kinachochorwa wala kuombwa. Kufungua mradi unaotaja seva za ramani pia hakuwasiliani nazo. Picha kutoka kwenye faili inafanya kazi kwa njia yoyote. Kitufe cha {{ui:Open Settings}} cha kidirisha kinakupeleka huko.

## Picha iliyowekwa kwenye kuratibu (inafanya kazi nje ya mtandao)

1. Katika **Ongeza tabaka**, weka **Picha iliyowekwa kwenye kuratibu** na uchague faili: picha (PNG au JPEG) **pamoja na** faili lake la dunia (`.pgw` kwa PNG, `.jgw` kwa JPEG, au `.wld`) na, kama lipo, faili lake la `.prj`. Unaweza pia kuziangusha kwenye mpango pamoja.
2. Bila `.prj`, CivilCraft inauliza mfumo gani faili la dunia linatumia: {{ui:The project’s system}} (wa kawaida zaidi), {{ui:Pick a system…}}, au, katika mradi usio na mfumo, **Viwianishi vya mradi**.
3. Picha inaonekana chini ya mpango, na {{ui:Fit}} inaijumuisha.

GeoTIFF ya RGB (picha ya angani iliyohifadhiwa kama GeoTIFF) ina mahali pake na mfumo wake: ifungue peke yake. Picha inahifadhiwa **ndani ya faili la mradi** (hadi MB 25); kubwa zaidi inakataliwa pamoja na ukubwa wake, kwa hiyo hifadhi nakala ndogo (pikseli chache, au JPEG).

## Vigae, WMS, WMTS na huduma za ramani

Kwanza washa **Tabaka za ramani kutoka intaneti**. Kisha, katika **Ongeza tabaka**:

| Kutoka | Bandika nini | CivilCraft inafanya nini |
|---|---|---|
| URL ya vigae | Kiolezo chenye `{z}`, `{x}` na `{y}` (au `{-y}`), na `{s}` kwa herufi ya seva, kwa mfano `https://tile.example.org/{z}/{x}/{y}.png`. Ipe jina na uhusishaji wake. | Vigae katika web Mercator kwa eneo na ukuzaji kwenye skrini. |
| Seva ya WMS | Anwani ya seva, au kiungo chake cha GetCapabilities. Chagua {{ui:Get the layers}}, kisha tabaka. | Picha moja ya eneo kwenye skrini, iliyoombwa kwa msimbo wa EPSG wa mradi seva inapoutoa; vinginevyo katika web Mercator au WGS 84. |
| Seva ya WMTS | Anwani ya seva, au `WMTSCapabilities.xml` yake. Chagua {{ui:Get the layers}}, kisha tabaka na seti ya matriki ya vigae. | Vigae kutoka seti katika mfumo wa mradi ukiwepo; vinginevyo web Mercator. |
| Huduma ya ramani ya ArcGIS (REST) | URL inayoishia kwa `/MapServer` au `/ImageServer`. Chagua {{ui:Read the service}}. | Huduma za web Mercator zilizohifadhiwa kwenye akiba zinachorwa kutoka vigae vyake; nyingine zinaombwa picha moja ya eneo kwenye skrini. |

Hakuna seva zilizowekwa tayari. Mifano ya umma, yote kutoka USGS National Map (kikoa cha umma):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Huduma ya ramani: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (pia `USGSImageryOnly` kwa picha za angani)

Idara nyingi za GIS za miji na kaunti huchapisha WMS au huduma zao za ramani; kurasa zao za GIS zinatoa anwani. Seva inayoomba kuingia au ufunguo haifanyi kazi: CivilCraft haituma majina ya watumiaji, nywila wala funguo.

## Jinsi tabaka zinavyochorwa

- Picha katika mfumo tofauti na wa mradi zinapinda ndani yake: picha inakatwa vipande, kila kimoja kikiwekwa ili kiwe ndani ya robo ya pikseli ya skrini kutoka pale ubadilishaji sahihi unapoiweka.
- Vigae vinachaguliwa kwa eneo kwenye skrini na ukuzaji: kamwe si zaidi ya 64 kwa mwonekano, sita kwa wakati mmoja. Unaposogeza au kukuza, maombi ya mwonekano wa zamani yanaghairiwa. Takriban vigae 200 vinahifadhiwa kwenye kumbukumbu (hakuna kinachohifadhiwa kwenye diski).
- Picha ya WMS au huduma ya ramani inaombwa mara mwonekano unapoacha kusogea; mpaka ifike, ya mwisho inabaki mahali pake.
- Uhusishaji wa kila tabaka kwenye skrini unaonekana kidogo chini kulia mwa mpango.

## Badilisha, panga na ondoa tabaka

Kwenye kidirisha, kila tabaka lina kisanduku cha kuteua cha kuonyesha au kuficha, kitelezi cha **Uwazi**, mishale ya kuichora mapema (chini) au baadaye (juu), kitufe cha kukuza (picha) na kitufe cha kuondoa. Tabaka ya kwanza kwenye orodha inachorwa chini kabisa. Kila mabadiliko ni hatua moja ya kutendua.

## Tabaka isipoonyesha kitu

Sababu inaonekana mara moja kwenye upau wa hali na inabaki chini ya jina la tabaka kwenye kidirisha:

| Ujumbe | Cha kufanya |
|---|---|
| Imezimwa: tabaka za ramani kutoka intaneti zimezimwa kwenye Mipangilio. | Washa **Tabaka za ramani kutoka intaneti**. |
| Inahitaji mfumo wa viwianishi wa mradi | Iweke chini ya {{ui:Coordinates}}. |
| Seva haikuruhusu ukurasa huu kutumia picha zake (CORS), au haikuweza kufikiwa. | Seva haziruhusu kurasa za wavuti kutumia picha zake, au iko chini. Baada ya kukataliwa mara nne, CivilCraft inaacha kuomba; ficha kisha onyesha tabaka ili ujaribu tena. |
| Seva ilijibu 404 … / Seva ilituma text/xml, si picha: … | URL, tabaka au mtindo si sahihi, au ujumbe wa seva unaeleza unachotaka. |
| Tabaka hii haitolewi katika mfumo wa mradi, web Mercator wala WGS 84 | Seva haiwezi kuchora mahali ambapo CivilCraft inaweza kuiweka. |

## Kilichokaguliwa

- Namba za vigae zilikaguliwa dhidi ya upangaji wa vigae wa kawaida wa web Mercator. Majibu ya WMS 1.1.1 na 1.3.0, WMTS na huduma ya ramani yalisomwa kutoka faili zilizoandikwa kwa mkono na kutoka majibu halisi yaliyohifadhiwa kutoka USGS National Map na seva za terrestris OpenStreetMap. Maombi ya WMS 1.3.0 huweka latitudo kwanza kwa EPSG:4326, kama kiwango kinavyosema.
- Kupinda kulilinganishwa na ubadilishaji sahihi wa kila pikseli kupitia namba za PROJ: ndani ya 0.13 px kwa vigae, picha za WMS na picha ya ukubwa wa kaunti, katika kipimo cha tovuti na kwa kukuza nje.
- Picha pamoja na faili lake la dunia, na GeoTIFF ya RGB iliyoandikwa na GDAL (kupitia rasterio), zilichorwa pale mahali pao panaposema, zikikaguliwa pikseli kwa pikseli kwenye kivinjari.
- Kwenye kivinjari, dhidi ya seva ya mbadala kwenye kompyuta ya majaribio: vigae vinatua kwenye kigae ambacho PROJ inaweka kila nukta, picha ya WMS inatua ndani ya pikseli 2, maombi yasiyozidi sita yanaendeshwa kwa wakati mmoja, na mpangilio ukiwa umezimwa hakuna ombi linalotoka kwenye ukurasa. Huduma ya ramani ya USGS National Map hapo juu pia ilisomwa na kuchorwa moja kwa moja kwenye kivinjari mara moja (vigae vyake vilifika na kuchorwa, pamoja na maandishi yake ya hakimiliki); seva nyingine za umma zilisomwa kutoka majibu yaliyohifadhiwa tu.
