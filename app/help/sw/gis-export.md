---
title: Hamisha data ya as-built kwa GIS
summary: Tuma pointi za upimaji, kontua, mpangilio wa njia, majukwaa, mabomba na miundo kwa idara ya GIS ya jiji au kaunti kama shapefiles, GeoPackage, GeoJSON au KML, katika kuratibu za gridi za mfumo wa kuratibu wa mradi.
keywords: gis, hamisha, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, mabomba, miundo, huduma, jiji, kaunti, gridi, ardhi, epsg, prj
from: bba4fea5
---

Miji na kaunti nyingi huomba data ya as-built katika muundo wa GIS mradi unapofungwa: mahali mabomba na miundo vilipowekwa, miinuko ya mwisho ya ardhi, na mstari wa kati wa barabara. **GIS › Hamisha** inaandika kile CivilCraft inachoshikilia kama tabaka za GIS, moja kwa kila aina ya kitu.

## Kabla ya kuhamisha

1. Weka mfumo wa kuratibu wa mradi katika {{ui:Kuratibu}}. Idara ya GIS inahitaji kujua namba ziko wapi; bila mfumo, faili zitabeba namba za mradi zenyewe na hazitataja jina la mfumo wowote.
2. Hakiki uso, mpangilio wa njia, majukwaa na mtandao wa mabomba jinsi unavyotaka vikabidhiwe.
3. Uliza idara muundo gani na mfumo gani wa kuratibu wanataka. Wengi bado wanaomba shapefiles katika ukanda wa state plane wa eneo; mifumo mipya inakubali GeoPackage.

## Hamisha

1. Bonyeza {{ui:Hamisha}} katika kikundi cha **GIS**.
2. Chini ya **Nini**, weka alama aina za kutuma. Kila moja inaonyesha vipengele vingapi ina; aina ambazo bado hazina kitu zimefifia.
3. Chini ya **Umbizo**, chagua umbizo.
4. Soma maelezo kuhusu kuratibu na vitengo, kisha bonyeza kitufe cha kupakua. Mstari wa hali unasema kilichoingia, na majina yoyote ya sehemu yaliyofupishwa.

Kisanduku cha mazungumzo pia kina hamisho ya gridi ya miinuko ({{ui:Uso kama gridi ya miinuko ya GeoTIFF}}); tazama [Gridi za miinuko na LiDAR](topic:elevation-grids-and-lidar).

## Kila aina inashikilia nini

| Aina | Umbo | Sehemu |
|---|---|---|
| Pointi za upimaji | Pointi zenye miinuko | `P` namba ya pointi, `N` northing, `E` easting, `Z` miinuko, `D` maelezo |
| Kontua za ardhi iliyopo na za uso uliosawazishwa | Mistari katika miinuko yake | `ELEV` |
| Breaklines | Mistari yenye miinuko | `NAME` |
| Mpaka wa uso | Poligoni (mpaka uliochorwa, la sivyo ukingo wa uso) | `NAME` |
| Mpangilio wa njia | Mistari ya kati | `NAME`, `LENGTH`, `STA_START`, `STA_END` (vituo kama namba tupu) |
| Majukwaa | Poligoni katika mwinuko wa jukwaa | `NAME`, `ELEV`, `AREA` |
| Mistari ya daylight | Mistari yenye miinuko (majukwaa na korido) | `NAME` |
| Mistari ya kipengele cha korido | Mistari yenye miinuko: katikati, kingo za lami, mabega | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Mabomba | Mistari kutoka invert ya juu hadi invert ya chini | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (asilimia), `LENGTH`, `NETWORK` |
| Miundo | Pointi kwenye ukingo | `NAME`, `RIM`, `INVERT` (invert ya chini kabisa ya bomba hapo), `SUMP`, `DIA`, `DIA_UNIT` |
| Kila tabaka la GIS | Kama ilivyoingizwa | Sehemu zake |

Urefu, vituo na miinuko viko katika vitengo vya mradi (futi za US survey au mita). Kipenyo cha mabomba na miundo kiko katika inchi kwa miradi ya futi na katika milimita kwa miradi ya mita; `DIA_UNIT` inaonyesha ipi.

## Miundo

- **Shapefile**: `.zip` moja lenye shapefile kwa kila aina (`.shp`, `.shx`, `.dbf`), faili la `.cpg` linaloonyesha kwamba maandishi ni UTF-8, na `.prj` linalotaja mfumo wa kuratibu. Maumbo yenye miinuko yanaandikwa kama aina za Z za shapefile. Majina ya sehemu marefu kuliko herufi 10 yanafupishwa, kama muundo unavyohitaji, na mstari wa hali unayaorodhesha.
- **GeoPackage**: faili moja la `.gpkg` lenye jedwali kwa kila aina, mfumo wa kuratibu ukihifadhiwa pamoja na msimbo wake wa EPSG. Faili moja badala ya nyingi, na majina marefu ya sehemu yanabaki.
- **KML** au **KMZ** (KML iliyobanwa): faili moja la latitudo na longitudo kwa Google Earth na ramani za wavuti, folda kwa kila aina, kila kipengele kikiwa alama iliyopewa jina kutoka sehemu yake ya NAME, na kila sehemu ikiwa data ya ziada; miinuko iko katika mita (altitude mode absolute). Kama GeoJSON, inahitaji mfumo wa kuratibu wa mradi.
- **GeoJSON**: faili moja la latitudo na longitudo (kiwango cha GeoJSON hakiruhusu kingine), kila kipengele kikiwa na sifa ya `kind` (`pipes`, `structures`, …) ili mpokeaji aweze kuvigawanya. Miinuko inabadilishwa kuwa mita, kama kiwango kinavyoomba; inabaki kwenye datum wima ya mradi wako (CivilCraft haina modeli ya geoid). Mradi usio na mfumo wa kuratibu hauwezi kuhamisha GeoJSON, na mazungumzo yanaeleza kwa nini.

## Gridi, si ardhi

Idara za GIS huhifadhi data yao katika kuratibu za **gridi** za mfumo wa kuratibu. Ikiwa mradi wako unatumia kuratibu za ardhi au za ndani (zilizowekwa katika {{ui:Kuratibu}}), kila kuratibu inarudishwa kwenye gridi wakati wa kutoka. Namba katika faili zinatofautiana na zile za mpango kwa kipengele chako cha kipimo (na kwa mzunguko, kwa mfumo wa ndani). Sehemu za pointi `N` na `E` pia zinashikilia thamani za gridi. Mazungumzo yanakukumbusha hilo.

:::tip
Tuma maelezo mafupi pamoja na faili: mfumo wa kuratibu na msimbo wake wa EPSG, datum wima ya miinuko yako, vitengo, na kila faili ni nini.
:::

## Kilichokaguliwa

- Kila faili lililoandikwa lilisomwa tena na GDAL, maktaba ambayo programu nyingi za GIS hutumia kusoma faili hizi: kila umbo, miinuko na sifa, idadi ya vipengele, na mfumo wa kuratibu kama msimbo wake wa EPSG (`.prj` na GeoPackage). Visomaji vyetu vilivisoma kwa njia ile ile.
- Faili za GeoJSON zinafuata RFC 7946: longitudo kabla ya latitudo, hakuna mwanachama `crs`, pete za nje kinyume cha saa na mashimo kwa saa; nafasi zililingana na PROJ ndani ya 2 mm.
- Mradi wa kuratibu za ardhi ulihamishwa na kila pointi ilikaguliwa dhidi ya kuratibu zake za gridi.
- Hakuna hapa kilichofunguliwa katika programu nyingine za GIS bado. Kagua utoaji wa kwanza na idara kabla ya kuutegemea.
