---
title: Soo dhoofi xogta GIS
summary: Soo geli shapefile, GeoJSON iyo GeoPackage mashruuc ahaan lakabyo GIS, ku dhig nidaamka koordinates-ka saxda ah, eeg sifooyinkooda, oo isticmaal dusha.
keywords: gis, calaamadee goobaha, sifooyinka qorshaha, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, soo dhoofin, lakabyada, sifooyinka, nidaamka koordinates-ka, epsg, latitude, longitude, konturada, qaybaha dhulka, breaklines, xuduudda
from: f6b235cc
---

Xafiisyada GIS ee magaalada iyo degmada waxay siiyaan xogta deegaanka sida faylasha GIS: qaybaha dhulka, xaqa-maro, konturada, adeegyada, xakamaynta sahanka. CivilCraft wuxuu furaa saddex nooc oo ka mid ah **lakabyo GIS** oo ku jira naqshadaada qorshaha.

| Faylka | Waxa la furo |
|---|---|
| Shapefile | `.shp` oo ay weheliyaan `.shx`, `.dbf`, `.prj` iyo `.cpg` (dhammaantood dooro), ama `.zip` ay ku yimaadeen. Zip ku jira shapefile badan wuxuu siiyaa lakabyo badan. |
| GeoJSON | Faylka `.geojson` (fayl `.json` oo sadarkiisa `FeatureCollection` ama `Feature` ku qoran bal sidoo kale shaqeeya). |
| GeoPackage | Faylka `.gpkg`. Miis kasta oo goob ku jira waa la liistaa. |
| KML ama KMZ | Faylka `.kml` (Google Earth ama khariidad webka), ama `.kmz` oo zipped. Folder kasta wuxuu noqdaa lakab (wuxuu kala go'aa dhibcaha, xariiqyada iyo poligonada haddii ay dhowr nooc ku jiraan); magaca, sharraxaadda iyo xogta dheeraadka ah ee placemark-ka waxay noqdaan sifooyinkiisa. Dhererrada waa mitir, latitude iyo longitude, sida GeoJSON. |

Dhibcaha, dhibco badan, xariiqyada, poligonada godad leh iyo qaabab qaybo badan leh waa la akhriyaa, dhererradooda (z) haddii faylku leeyahay. Qiimaha cabbirka (M) waa la iska tago. Shabakadaha heerarka iyo LiDAR waxay u furmaan sidii oo kale: eeg [Shabakadaha heerarka iyo LiDAR](topic:elevation-grids-and-lidar).

## Fur faylasha

1. Riix {{ui:Soo dhoofi}} kooxda **GIS** (ama {{ui:Fur}}), dooro faylasha, ama ku rid qorshaha. Faylasha waxaa lagu akhriyaa kombiyuutarkan; waxba lama soo dirayo.
2. Wada-hadalka **Soo dhoofi xogta GIS** wuxuu liistaa lakabyo kasta la helay: nooceeda, inta goob (iyo inta aan geometry lahayn), inta goob sifo ah, iyo nidaamka koordinates-ka ee faylku sheegayo. Ka saar lakabyada aanad doonin.
3. Akhri qaybta **Nidaamka koordinates-ka** (hoos) iyo xarriiqda **Waxa dhici doona**, kadib riix {{ui:Soo dhoofi}}.
4. Lakabyada waxay soo muuqan doonaan qorshaha iyo hoosta **Lakabyada GIS** dhinaca bidix. Soo dhoofintu waa hal tallaabo: {{key:Mod+Z}} wuu soo celinayaa.

Fayl weyn wuxuu muujiyaa xariiq horumar ah qorshaha korkiisa, leh badhanka {{ui:Jooji}}.

## Nidaamka koordinates-ka

Faylasha GIS waxay sheegaan meesha ay ku yaallaan nidaam koordinates-ka (`.prj` shapefile-ka, miiska tixraaca goobta GeoPackage; GeoJSON wuxuu weligiis yahay latitude iyo longitude). CivilCraft wuxuu lakab kasta uga beddelaa nidaamkiisa oo gaar ah kan mashruuca. Weligeed ma qiyaaso:

- **Mashruucu wuxuu leeyahay nidaam koordinates** (lagu dejiyay {{ui:Coordinates}}): lakab kasta oo leh nidaam gaar ah waa la beddelaa ilaa mashruuca, oo ay ku jiraan dhul ama maxalli ah. Fayl aan `.prj` lahayn wuxuu helaa laba ikhtiyaar: **Isku mid mashruuca** (tirooyinkiisa waa la soo rarayaa sidooda) ama **Dooro nidaamka faylka**.
- **Mashruucu ma laha, faylku wuxuu ku jiraa nidaam la saadaalin oo ah cutubyada mashruucaaga** (aagga state plane ee fiit sahan Mareykan ah ee mashruuc fiitka, tusaale ahaan): wada-hadalku wuxuu soo bandhigayaa **Isticmaal nidaamkaas sida nidaamka koordinates-ka ee mashruuca**. Waa la dejiyaa isla hal tallaabada soo dhoofinta. Waxba mashruuca kuma dhaqaaqo; nidaamku wuxuu sheegayaa waxa tirooyinku ka dhigan yihiin. Waxaad dooran kartaa nidaam kale oo mashruuca ah, lakabyadana waa la beddelayaa.
- **Mashruucu ma laha, faylku wuxuu ku jiraa latitude iyo longitude** (GeoJSON kasta) **ama cutubyo kale**: {{ui:Soo dhoofi}} waa aan la dooran karin ilaa aad dooratid nidaamka koordinates-ka mashruuca. Doorasho-wadaha wuxuu ka bilaabmaa meel ku dhow xogta.
- **Mashruuc iyo faylal midkoodna ma sheegaan nidaam**: tirooyinka waa la soo rarayaa sidooda, wada-hadalkuna wuu sheegaa.

Dhererradana waa la beddelaa: dhererrada GeoJSON waa mitir (heerka GeoJSON wuu sheegaa); dhererrada faylalka kale waxaa la qaadaa cutubka nidaamkooda gaarka ah.

:::warning
Booska faylka GeoJSON ee ka baxsan longitude ±180° ama latitude ±90° ma aha latitude iyo longitude. Goobahaas waa la iska tago, wada-hadalkuna wuxuu sheegaa tirada. Faylka noocaas badanaa waa fayl la saadaalin oo nidaamkiisa aan lagu kaydin; dib u weydii, ama weydii shapefile oo leh `.prj`.
:::

NAD83 waxa loo qaataa sida WGS 84 (nidaamka GeoJSON isticmaalo); labadaba waxay kala duwan yihiin dhowr mitir Waqooyiga Ameerika, sidaas darteed xogta GeoJSON waxay ku kala duwaan kartaa qadarkaas. Halka isbeddelka ugu fiican u baahan yahay fayl shabakad (tusaale ahaan NADCON ee NAD27), CivilCraft wuxuu isticmaalaa isbeddel qiyaas ah oo la daabacay, wada-hadalka nidaamka koordinates-ka wuxuu muujinayaa inta qiyaasku yahay (NAD27 ku dhawaad 20 m), ilaa aad ku darto shabakadda: eeg [Faylasha isbeddelka shabakadda](topic:coordinate-systems).

## Lakabyada GIS

Safka kasta oo ku hoos yaal **Lakabyada GIS** waxa uu leeyahay:

- calaamad sanduuq si lakabka loo muujiyo ama loo qariyo (lakabyada qarsan lama doorto mana jiraan);
- midabkiisa, oo laga doortay liiska;
- liis (saddex dhibic) oo leh {{ui:Weynee ilaa}}, {{ui:Isticmaal dusha…}}, {{ui:Magac u beddel…}} iyo {{ui:Ka saar}}.

Muujinta, qarinta, midab-beddelka, magac-beddelka iyo ka saaridda waa tallaabo oo dib loo noqdo. Lakabyada GIS waxa lagu kaydiyaa faylka mashruuca oo markaad furto ayay soo noqdaan. Waxay sidoo kale ku baxaan qorshaha PDF plot-kiisa iyo soo dhoofinta DXF iyo DWG, mid kasta lakab la magacaabay `GIS-` iyo lambarkiisa.

## Calaamadee goobaha sifo ka mid ah

Liiska lakabka {{ui:Wax dheeraad ah}} (saddex dhibic oo ku jira **Lakabyada GIS**), dooro goob hoos yaal **Calaamadee iyadoo**: goob kasta wuxuu muujinayaa qiimihiisa qorshaha, midabka lakabka. Dhibcaha waxaa lagu calaamadeeyaa dhinaca dhibcaha, xariiqyada dhexda qaybtooda ugu dheer (la rogay si aad ugu akhrisato bidix ilaa midig), poligonada bartamaha. Tirooyinku waxay muujiyaan ilaa saddex meel oo kasoo horreysa. Calaamadaha waxay ahaan doonaan 1.8 mm dhererka warqadda cabbir kasta, waxayna galaan PDF plot, DXF iyo DWG. Dooro **Calaamad la'aan** si aad uga saarto; isbeddel kasta waa hal tallaabo ({{key:Mod+Z}} wuu soo celinayaa). Lakab wuxuu calaamadeeyaa ugu badnaan 5,000 goob.

## Eeg goob

Markii {{ui:Dooro}} uu shaqaynayo, riix goob. **Guryaha** wuxuu muujinayaa lakabkiisa, goobta ay tahay, qaabkeeda (qaybaha, godadka, geesaha), dhererradeeda, faylka ka yimid iyo nidaamka koordinates-ka faylkaas, kadib sifo kasta miis ku jira. Sifooyinka waa kuwo keliya-akhris: CivilCraft wuxuu muujiyaa xogta GIS sidii ay ahayd, ma tafatiro.

Dhibcaha ayaa ka mudan xariiqyada markii labadaba ay hoos yaalliin calaamadeeyaha; gudaha poligon, poligonka ugu yar ayaa la doortaa.

## Isticmaal dusha

Fur liiska lakabka oo dooro {{ui:Isticmaal dusha…}} (ama badhanka **Guryaha**). Waxa la soo bandhigayo waxaa ku xidhan lakabka:

| Lakabka | Wuxuu noqon karaa |
|---|---|
| Xariiqyo leh dhererro (xariiqyo 3D) | Khadadka jejebinta oo leh dhererradooda |
| Xariiqyo aan dhererro lahayn laakiin leh goob tiro ah (konturo) | Khadadka jejebinta oo leh dhererka goobta aad dooratid |
| Poligonada | Xuduudda dusha (poligonka la doortay, ama kan ugu weyn), ama khadadka jejebinta geesahooda |
| Dhibcaha leh dhererro, ama leh goob dhererka | Dhibcaha sahanka, oo lagu sharraxay magaca lakabka si ay u sameeyaan koox dhibco |

Isticmaal kasta waa hal tallaabo oo dib loo noqdo oo geometry-ga mashruuca ku koobiyaysa; lakabka laftiisu sidii uu ahaa ayuu sii joogaa. Dhererradu waxa la qaadaa cutubyada mashruuca.

## Faylasha dhibcaha leh latitude iyo longitude

Fayl dhibcaha kaas madaxa (header) uu magacaabo tiirarka **latitude** iyo **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) waxa loo akhriyaa darajo, ma aha waqooyi iyo bari. Wada-hadalka soo dhoofinta ayaa sidaas sheegaa. Markii {{ui:Soo dhoofi}}, dhibcaha waa la beddelaa nidaamka koordinates-ka mashruuca; mashruuc aan lahayn wuxuu ku weyddiinayaa inaad dooratid marka hore. Darajooyinka weligood ma la soo rarayo sida fiit. Safafka ka baxsan latitude ±90° ama longitude ±180° waa la diidaa, sababtana waa la sheegayaa. Tiirka dhererka waxa la qaadaa sida uu yahay, cutubyada mashruuca.

## Faylasha LandXML ee sheegaya nidaam koordinates-ka

Markii faylka LandXML aad furto uu leeyahay curiyaha `CoordinateSystem` (koodka EPSG, sharaxaadda WKT ama magaca nidaamka), CivilCraft wuxuu u soo bandhigayaa inuu noqdo nidaamka koordinates-ka mashruuca. Waxba ma dhaqaaqo haddii aad aqbasho; nidaamku wuxuu kaliya sheegayaa waxa tirooyinku ka dhigan yihiin.

## Waxa la hubiyay

- Akhristaha kasta waxaa loo barbar dhigay GDAL, maktabadda GIS badan u isticmaashaan si ay faylashan u akhriyaan, faylal GDAL qoray: shapefile-yo dhammaan noocyada leh iyo aan dhererro lahayn, xariiqyo qaybo badan leh, poligonada godad leh, geometry madhan, qoraal, tiro, taariikh iyo run/been sifooyin, qoraal UTF-8 iyo Windows-1252 oo leh iyo aan `.cpg` lahayn, zip oo shapefile badan, GeoJSON nooc kasta oo geometry leh, iyo GeoPackage afar miis leh. Geometry kasta, dhererro iyo sifo ayaa iswaafaqay.
- Booska laga beddelay latitude iyo longitude, iyo UTM, waxay la mid ahaayeen PROJ (maktabadda saadaasha ee GDAL ka dambaysa) ilaa 3 mm.
- Faylal dillaacay (gaaban, cabbirradooda beenta ah, zip xumaad, GeoPackage xumaad) waxay siiyaan hal fariin oo fudud; waxba ma joogsado.
- Waxba halkan lagama furin barnaamijyo GIS kale weli, geodatabases-ka faylalka, KML iyo KMZ weli lama akhrin (eeg [Wali lama dhisin](topic:not-built-yet)).
