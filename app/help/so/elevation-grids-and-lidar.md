---
title: Gridka dhererka iyo LiDAR
summary: Dhulka jira ka dhis DEM (GeoTIFF ama ASCII grid) ama barooyinka LiDAR (LAS, LAZ) — dooro aagga, dhimi xogta, dooro fasallada oo hubi cutubyada dhererka — kadibna dusha ku soo celi GeoTIFF gridka dhererka.
keywords: dem, dtm, gridka dhererka, geotiff, tif, ascii grid, asc, lidar, las, laz, daruurta barooyinka, fasallada, dhulka, dhimista, nodata, raster, dhoofi geotiff, gis
from: c8b2d18a
---

Xogta dhererka ee dadweynaha ah waxay u timaadaa laba habood: **gridka dhererka** (DEM: hal dhererka unug kasta oo laba geesood leh, badanaa GeoTIFF `.tif` ama ASCII grid `.asc`) iyo **barooyinka LiDAR** (malaayiin laser ah oo ku jira fayl `.las`, ama `.laz` marka la kaydiyo). CivilCraft wuxuu midkoodba u beddelaa barooyin sahan ama dusha, browser-ka gudihiisa: waxba lama soo rarayo.

## Fur faylka

1. Riix {{ui:Open}} (ama {{ui:Import}} kooxda GIS) oo dooro faylka, ama jiid oo dhig qorshaha. ASCII grid ah, dooro sidoo kale faylka `.prj`, si CivilCraft u ogaado nidaamka isku-xidhkiisa.
2. Sanduuqa soo geynta wuxuu muujinayaa waxa faylku sheegayo naftiisa: cabbirkiisa, unugyada ama barooyinka, nidaamka isku-xidhka, goobtiisa latitude iyo longitude, iyo kala-duwanaanta dhererka. LiDAR-ka, marka hore wuxuu akhrisaa barta kastaa mar si uu u tiriyo **fasallada** (cabbir-horumarka waa la muujiyaa; {{ui:Cancel}} ayaa joojiya).

GeoTIFF oo leh saddex ama afar kanaal (cas, cagaar, buluug) waa sawir, mana aha dhererro: waxay tagaa layers-ka khariidadda.

## Dooro waxa la soo gelinayo

- **Aagga**: {{ui:The project’s extents and a margin}} (qor cidhifka), {{ui:What the plan shows now}}, ama {{ui:The whole file}}. Qaybtaas faylka keliya ayaa la akhriyaa.
- **Dhimo ilaa**: masaafada u dhexaysa barooyinka aad heshid, cutubyada mashruuca. Xariiqda hoose ee dejinta waxay muujinaysaa inta barood oo ay taasi siinayso intaad qorto. Gridka, CivilCraft wuxuu hayaa unug kasta labaad, saddexaad … sidaas awgeed dhererrada waxay sii joogaan sida faylka oo kale; ma celceliyo unugyada. LiDAR-ka, aagga waxa loo jarayaa labajibaaro cabbirkaas leh, mid kasta waxa lagu hayaa hal bar: {{ui:The point nearest each cell’s center}} (waa default-ka), {{ui:The lowest point in each cell}} (wanaagsan marka faylka aanu fasal dhul lahayn: dhulku wuxuu hoostaa geedaha), ama {{ui:The average of each cell’s points}}.
- **Fasallada** (LiDAR): dhulka (fasal 2) waa la calaamadiyaa marka faylka leeyahay; dhismayaasha, geedaha iyo buuqa waa la dhaafaa. Marka aanu fasal dhul lahayn, fasal kasta waa la calaamadiyaa, wadahadalkuna wuu sheegaa.
- **Dhulka** (LiDAR, 0.8): daruur drone ah ma lahan fasal dhul. Marka faylka aanu lahayn, wadahadalku wuxuu ku bilaabaa {{ui:Find the ground myself (drone clouds, no ground class)}}: fasal kasta marka laga reebo buuqa waa la akhriyaa, barta ugu hooseysa unug kasta waa la hayaa, kadibna CivilCraft wuxuu dhismayaasha, geedaha iyo barooyinka hoose ee kala firidhsan ka saaraa shaandhe morphology-ka oo horumaraysa (Zhang iyo kuwa kale, 2003) oo aad hagi karto: **Shayga ugu weyn ee la saaro** (ballaca dhismaha ugu weyn; daaqadaha way weynaadaan ilaa ay daboolaan; 0 waxay ka dhigan tahay 20 unug) iyo **Jiidka dhulka ee ugu jiifka badan**. Shaqada waxay ku dhacdaa gridka barooyinka ugu hooseeya, sidaas darteed daruur ka kooban toban milyan oo barood ma kharash badan tahay tirada unugyadeeda (dhimista waa hal marin oo socda). Masaafadu waa unugga: mid ka weyn waa dhakhso badan yahay, oo wax yar oo yaryar ka sii luntaa intaad filan tahay, mid ka yar wuxuu hayaa faahfaahin dhulka badan. Warbixinta waxay sheegaysaa inta barood oo la hayay dhul ahaan, inta unug oo lagu saaray shay ahaan, iyo inta barood hoose oo kala firidhsan oo la tuuray. Sahan drone ah oo 300 m ah oo la sameeyay, oo leh shan dhismood, 70 geed iyo 200 barood hoose oo dibadda ah, barooyinka la hayay waxay ku jireen 3 cm dhexdooda dhulka runta ah, mana hayn saqaf ama geed.
- **Dhererka faylka**: mitir, fiit, ama fiit US survey. Marka faylku sheego, cutubkiisa horay ayaa la doortaa. Marka aanu sheegin, waa inaad dooratid: sanduuqu wuxuu muujinayaa kala-duwanaanta dhererka labada jid, si aad u ogaato kan macquul u ah goobta.
- **Soo geli sida** (gridka kaliya): {{ui:Survey points (description DEM)}}, ama {{ui:The surface itself (a grid of triangles)}}.

Hal soo gelin ma qaadan karto ka badan 500,000 bar. Marka doorashadu ka badan siiso, sanduuqu wuxuu sheegaa inta ay ka badan tahay iyo masaafada ku habboon, {{ui:Import}} wuu damaa.

Riix {{ui:Import}}. Cabbir-horumarka akhrinta ayaa muuqda; {{ui:Cancel}} waa joojiyaa, waxna ma beddela.

:::warning
Cutubyada dhererka waa dhibaato caadi ah. DEM-yo badan oo state plane ah waxay leeyihiin bari iyo woqooyi fiit ah, laakiin dhererro mitir ah. Kala-duwanaanta uu sanduuqu muujiyo ka hubi wixii aad ka garanayso goobta.
:::

## Waxa aad hesho

- **Barooyinka sahanka**: waxay lambar u helaan ka dib barta ugu lambarka weyn, sharaxaadda `DEM` (gridka) ama `LIDAR`, si ay u sameeyaan koox barooyin oo keliya hoosta **Barooyin**, dusha ayay u dhisaan sida barooyinka kale. Soo gelinta waa hal tallaabo: {{key:Mod+Z}} ayaa mar kale ka saaraa.
- **Dusha laftiisa**: dusha TIN ee gridka, laba saddexagallo unug kasta, oo lagu kala jeexay jiifka koonfur-galbeed ilaa waqooyi-bari. Saddexagallo leh geesta aan xog lahayn waa la dhaafaa, sidaas awgeed godadka xogta ayaa godad ah. Dusha waxay la mid tahay gridka barta kasta oo gridka ah, waxayna dhexdooda tahay dayax fidsan oo saddexagallo kasta gudihiisa. Waxay beddeshaa dusha mashruuca (sanduuqu wuu weyddiinayaa hore), {{key:Mod+Z}} ayaa dib u soo celinaysa dusha hore. Cinwaanka xagga bidix wuxuu leeyahay **Dusha (ka gridka dhererka)**.

## Nidaamyada isku-xidhka

- Haddii mashruucu leeyahay nidaam isku-xidhka faylkuna sheego mid kale, barta kasta waa la beddelaa nidaamka mashruuca (iyo dhulka ama isku-xidhka maxalliga ah haddii ay leeyihiin).
- Haddii mashruucu aanu lahayn, nidaamka faylkuna yahay cutubka mashruuca (fiit ama mitir), sanduuqu wuxuu soo jeedinayaa in la ka dhigo nidaamka isku-xidhka mashruuca, isla tallaabada qalinka ee barooyinka.
- Haddii faylku yahay latitude iyo longitude, ama mitir mashruuc fiit ah, sanduuqu wuxuu weyddiinayaa inaad marka hore doorato nidaamka isku-xidhka mashruuca.
- Haddii faylku aanu sheegin, lambarradiisa waxaa loo qaadanayaa inay yihiin isku-xidhka mashruuca. Waxaad doortaa nidaamka faylka halkii.

## Dhoofi dusha sida GeoTIFF

1. Riix {{ui:Export}} kooxda GIS.
2. Qaybta GeoTIFF dooro dusha (dhulka jira ama dusha la sawiray) iyo cabbirka unugga. Default-ka wuxuu ka imanayaa celceliska geesta saddexagallada dusha. Sanduuqu wuxuu muujinayaa cabbirka gridka uu qori doono.
3. Riix {{ui:Download GeoTIFF}}.

Faylku waa hal kanaal oo dhererro point-ka kaymaha 32-bit ah, unugyada mashruuca, oo dusha ballaadhkeeda ku jira; unugyada ka baxsan dusha waa "nodata" (−3.4028235e38). Qiimaha unug kasta waa dhererka dusha dhexdhexaadka unugga. Isku-xidhku waa **grid**: mashruuc dhul ama isku-xidh maxalli ah waxa lagu beddelaa gridka. Faylku wuxuu sheegaa nidaamka isku-xidhka mashruuca koodka EPSG; nidaam aan koodka EPSG lahayn lama qori karo, sanduuquna wuu kaa digayaa inaad u sheegto waaxda GIS nidaamka uu yahay.

## Hubinta

- Akhristayaasha GeoTIFF iyo ASCII grid waa la hubiyay GDAL (rasterio ahaan), maktabada barnaamijyada GIS badankood u isticmaalaan inay akhriyaan faylasha kanu: gridyada 32-bit float iyo 16-bit integer, tiled iyo stripped, DEFLATE iyo LZW, nodata, scale iyo offset, pixel-is-point, gridka UTM, gridka state plane oo fiit US survey ah, iyo gridka latitude/longitude — qiimaha walba waa isku mid.
- Akhristayaasha LAS iyo LAZ waa la hubiyay laspy: LAS 1.2 iyo 1.4, qaababka barooyinka 0, 1, 3, 6, 7 iyo 8, nidaamka isku-xidhka oo leh iyo oo aan lahayn, iyo LAZ oo ay qorday dhabarka LASzip-ka u dhiganta — barta kasta waa isku mid.
- Isku-xidhyada la beddelay waa la hubiyay PROJ ilaa 1 mm.
- GeoTIFF-yada la dhoofiyay waa lagu akhriyay GDAL: nidaamka isku-xidhka, goobaha unugyada, nodata, cutubyada, iyo qiimayaasha oo la mid ah dusha ilaa 0.0001.
- Waxba halkan laguma furin barnaamijyada GIS ama CAD kale.

## Weli lama dhisin

- Beddelka datum-ka dhererka (moodelada geoid): dhererrada waxa loo isticmaalaa sida faylku leeyahay.
- Xogta waveform-ka, jawaabaha LiDAR ee aan ahayn fasal, midabyada iyo iftiinka.
- Dhowr kanaal, overviews, ama faylal ka weyn 200 MB.
- Qorista LAS ama LAZ dusha ama qalabkan (add-on-ka [Daruurta barooyinka](topic:point-clouds) wuxuu qoraa daruur la nadiifiyay oo ah LAS 1.4 ama LAZ).
