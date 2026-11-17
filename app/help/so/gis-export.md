---
title: Dhoofi xogta dhismaha dhabta ah ee GIS
summary: Dhoofi barta sahanka, konturada, khadadka, padka, tuubooyinka iyo qaab-dhismaha xafiiska magaalada ama degmada shapefile, GeoPackage, GeoJSON ama KML, oo ku jira shabakad koordinates-ka nidaamka mashruuca.
keywords: gis, dhoofin, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, tuubooyin, qaab-dhismo, adeegyada, magaalo, degmo, shabakad, dhul, epsg, prj
from: bba4fea5
---

Magaalooyin badan iyo degmooyin waxay weydiiyaan xogta dhismaha dhabta ah ee qaabka GIS markii mashruucu xirmo: meesha ay tuubooyinka iyo qaab-dhismaha ku aadeen, heerarka ugu dambeeya, xariiqda dhulka waddada. **GIS › Dhoofi** wuxuu qoraa waxa CivilCraft hayo sida lakabyada GIS, hal lakab oo ah nooc kasta oo shay.

## Ka hor inta aadan dhoofin

1. Dejiso nidaamka koordinates-ka mashruuca ee {{ui:Coordinates}}. Waaxda GIS waa inay ogaataa meesha tirooyinku ku yaalliin; nidaam la'aan, faylasha waxay qaadan doonaan tirooyinka mashruuca keligood, mana magacaabayaan wax.
2. Hubi dusha, khadadka, padka iyo shabakadda tuubooyinka sida aad rabto in la gaarsiiyo.
3. Weydii waaxda qaabka iyo nidaamka koordinates-ka ee ay rabaan. Qaar badan wali waxay weydiistaan shapefile oo ku jira aagga state plane ee maxalliga ah; nidaamyada cusub waxay qaataan GeoPackage.

## Dhoofinta

1. Riix {{ui:Dhoofi}} kooxda **GIS**.
2. Hoosta **Waxa**, calaamadi noocyada la dirayo. Mid kasta wuxuu muujiyaa inta shay ee uu leeyahay; noocyada aan weli wax lahayn waa lagu caddeeyay (ma dooran karto).
3. Hoosta **Sida**, dooro qaabka.
4. Akhri xusuusta ku saabsan isku xirka iyo cabbirka, kadib riix badhanka soo dejinta. Sadarka xaaladdu wuxuu sheegayaa waxa gudaha galay, iyo magacyada goobaha la gaabiyay.

Daaqaddan waxa kaloo ku jira dhoofinta shabakadda heerarka ({{ui:Dusha sida shabakadda heerarka GeoTIFF}}); eeg [Shabakadaha heerarka iyo LiDAR](topic:elevation-grids-and-lidar).

## Noocyada kasta waxa uu hayaa

| Nooca | Qaabka | Goobaha |
|---|---|---|
| Dhibcaha sahanka | Dhibcaha leh dhererka | `P` lambarka dhibcaha, `N` waqooyi (northing), `E` bari (easting), `Z` dhererka, `D` sharraxaad |
| Konturada dhulka jira, ee dusha la sameeyay | Xariiqyo heerkooda | `ELEV` |
| Khadadka jejebinta (breaklines) | Xariiqyo leh heerar | `NAME` |
| Xuduudda dusha | Poligon (xuduudda la sawiray, haddii kale geedka dusha) | `NAME` |
| Khadadka jihaynta | Khadadka dhexe | `NAME`, `LENGTH`, `STA_START`, `STA_END` (saldhigyada tirooyin fudud) |
| Padyada | Poligonada heerka padka | `NAME`, `ELEV`, `AREA` |
| Khadadka iftiinka | Xariiqyo leh heerar (padyada iyo waddooyinka) | `NAME` |
| Khadadka waddada | Xariiqyo heerar leh: dhexe, geesaha dhulka jilicsan, garbaha | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Tuubooyinka | Xariiqyo ka bilaabma inverta sare ilaa inverta hoose | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (boqolkiiba), `LENGTH`, `NETWORK` |
| Qaab-dhismaha | Dhibcaha ku yaal bartamaha afka | `NAME`, `RIM`, `INVERT` (inverta tuubada ugu hooseysa halkaas), `SUMP`, `DIA`, `DIA_UNIT` |
| Lakab kasta oo GIS | Sida la soo dhoofiyay | Goobaheeda |

Dherer, saldhig iyo dhererka waxay ku jiraan cutubyada mashruuca (fiit sahan Mareykan ah ama mitir). Dhexroorka tuubooyinka iyo qaab-dhismaha waa inji mashruucyada fiitka, iyo millimitir mashruucyada mitirka; `DIA_UNIT` wuxuu sheegaa kii.

## Qaababka

- **Shapefile**: hal `.zip` oo ku jira shapefile nooc kasta (`.shp`, `.shx`, `.dbf`), fayl `.cpg` oo sheegaya qoraalku waa UTF-8, iyo `.prj` oo magacaabaya nidaamka koordinates-ka. Qaababka leh dhererro waxaa loo qoraa noocyada Z ee shapefile-ka. Magacyada goobaha ka dheer 10 xaraf waa la gaabiyay, sida qaabku shardi ku yahay, sadarka xaaladdu waa liistaa.
- **GeoPackage**: hal fayl `.gpkg` oo leh miis nooc kasta, nidaamka koordinates-ka oo lagu kaydiyay koodkiisa EPSG. Hal fayl halkii laga bixin lahaa badan, magacyada goobaha dheer waa la hayaa.
- **KML** ama **KMZ** (KML oo zipped): hal fayl oo latitude iyo longitude ah oo loogu talagalay Google Earth iyo khariidadaha webka, folder nooc kasta, mid walba waa placemark oo magaciisa ka yimid goobta NAME oo leh goob kasta sida xog dheeraad ah; dhererrada waa mitir (altitude mode absolute). Sida GeoJSON, wuxuu u baahan yahay nidaamka koordinates-ka mashruuca.
- **GeoJSON**: hal fayl oo latitude iyo longitude ah (heerka GeoJSON ma oggolaado wax kale), mid walba wuxuu leeyahay hanti `kind` (`pipes`, `structures`, …) si qaataha loo kala saaro. Dhererrada waxa loo beddelaa mitir sida heerku doonayo; waxay ku sii jiraan darajadaada dhererka mashruuca (CivilCraft ma laha moodel geoid). Mashruuc aan nidaam koordinates lahayn ma dhoofin karo GeoJSON, daaqaddana way sheegtaa sababta.

## Shabakad, ma aha dhul

Waaxaha GIS xogtooda waxay ku hayaan **shabakad** koordinates-ka nidaam koordinates. Haddii mashruucaagu isticmaalo koordinates dhul ama maxalli ah (lagu dejiyay {{ui:Coordinates}}), koordinates kasta waxa dib loogu beddelaa shabakad markii la dhoofinayo: tirooyinka faylasha waxay ka duwan yihiin kuwa qorshaha iyadoo la adeegsanayo cabbirkaaga (iyo jeexjeexa, nidaamka maxalliga ah). Goobaha dhibcaha `N` iyo `E` waxay haystaan qiimaha shabakadda sidoo kale. Daaqaddu way xasuusinaysaa.

:::tip
Faylasha la socdo ku dir qoraal gaaban: nidaamka koordinates-ka iyo koodkiisa EPSG, datum-ka dhererka ee dhererkaaga, cutubyada, iyo waxa fayl kasta yahay.
:::

## Waxa la hubiyay

- Fayl kasta oo la qoray ayaa GDAL akhriyay, maktabadda ay GIS badan u isticmaalaan si ay faylashan u akhriyaan: qaab kasta, dherer iyo sifo, tirada goobaha, iyo nidaamka koordinates-ka sida koodkiisa EPSG (`.prj` iyo GeoPackage). Akhristayaashayada ayaa isla sidaas u akhriyay.
- Faylasha GeoJSON waxay raacaan RFC 7946: longitude ka hor latitude, ma jiro xubin `crs`, goobaha dibadda waxay ka soo wareegaan wareegga ka soo horjeedda saacadda, godadka wareegga saacadda; booska waxa uu la mid ahaa PROJ ilaa 2 mm.
- Mashruuc koordinates dhul ah ayaa la dhoofiyay, dhibic kasta waa la hubiyay koordinates-ka shabakadda.
- Waxba halkan lagama furin barnaamijyo GIS kale weli. Marka hore gaarsiinta hubi waaxda ka hor intaadan isku hallayn.
