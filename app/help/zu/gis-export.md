---
title: Thumela idatha ye-as-built ye-GIS
summary: Nikeza izinkomba zokuhlola, ama-contour, ama-alignment, amaphedi, amapayipi nezakhiwo emnyangweni wedolobha noma wesifunda ngama-shapefile, GeoPackage, GeoJSON noma KML, ngamakhoordinethi egridi yohlelo lwephrojekthi.
keywords: gis, thumela, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, amapayipi, izakhiwo, izinsiza, idolobha, isifunda, igridi, umhlaba, epsg, prj
from: bba4fea5
---

Amadolobha amaningi namazwe acela idatha ye-as-built ngefomethi ye-GIS lapho iphrojekthi iphela: ukuthi amapayipi nezakhiwo zihamba kuphi, amazinga okugcina, umugqa womgwaqo ophakathi. **GIS › Thumela** ibhala okuphethwe yi-CivilCraft njengezingqimba ze-GIS, eyodwa ngohlobo ngalunye lwento.

## Ngaphambi kokuthumela

1. Setha uhlelo lokuxhumanisa lephrojekthi kwi-{{ui:Amakhoordinethi}}. Umnyango we-GIS udinga ukwazi ukuthi izinombolo zisendaweni nini; ngaphandle kohlelo, amafayela athwala izinombolo zephrojekthi uqobo futhi awabizi lutho.
2. Hlola umphezulu, ama-alignment, amaphedi nenethiwekhi yamapayipi ngendlela ofuna ngayo ukuthi inikezwe.
3. Buza umnyango ukuthi ufuna ifomethi nohlelo lokuxhumanisa oluphi. Abaningi basacela ama-shapefile ohlelweni lwesifunda sendawo; amasistimu amasha asamukela i-GeoPackage.

## Thumela

1. Chofoza {{ui:Thumela}} eqenjini le-**GIS**.
2. Ngaphansi kwe-**Yini**, khetha izinhlobo ozothumela. Ngayinye ikhombisa ukuthi inezinto ezingakanani; izinhlobo ezingenalutho azikakwenziwa zifiphele.
3. Ngaphansi kwe-**Njenge**, khetha ifomethi.
4. Funda amanothi mayelana namakhoordinethi namayunithi, bese uchofoza inkinobho yokulanda. Umugqa wesimo utshela ukuthi yini efakiwe, namagama ensimu afinyeziwe, uma kukhona.

Ingxoxo iphinde ibambe ukuthunyelwa kwegridi yokuphakama ({{ui:Umphezulu njengegridi yokuphakama ye-GeoTIFF}}); bona [Amagridi okuphakama ne-LiDAR](topic:elevation-grids-and-lidar).

## Yini ngayinye ebamba

| Uhlobo | Ukwakheka | Izinsimu |
|---|---|---|
| Amaphoyinti okuhlola | Amaphoyinti anokuphakama | `P` inombolo yephoyinti, `N` northing (enyakatho), `E` easting (empumalanga), `Z` ukuphakama, `D` incazelo |
| Ama-contour womhlaba okhona, womphezulu oqhutshiwe | Imigqa ngokuphakama kwayo | `ELEV` |
| Imigqa yokwephula | Imigqa enokuphakama | `NAME` |
| Umngcele womphezulu | Ipholigoni (umngcele odwelwe, noma kungenjalo umphetho womphezulu) | `NAME` |
| Ama-alignment | Imigqa ephakathi | `NAME`, `LENGTH`, `STA_START`, `STA_END` (izikhundla njengezinombolo ezilula) |
| Amaphedi | Amapholigoni ekuphakameni kwephedi | `NAME`, `ELEV`, `AREA` |
| Imigqa yokukhanya kwemini | Imigqa enokuphakama (amaphedi namakhorido) | `NAME` |
| Imigqa yezici zekhorido | Imigqa enokuphakama: phakathi, imiphetho yomgwaqo, izinhlangothi | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Amapayipi | Imigqa isuka ku-invert ephezulu iye ku-invert engaphansi | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (phesenti), `LENGTH`, `NETWORK` |
| Izakhiwo | Amaphoyinti emaphethelweni | `NAME`, `RIM`, `INVERT` (i-invert ephansi kakhulu yepayipi lapho), `SUMP`, `DIA`, `DIA_UNIT` |
| Ngayinye yezingqimba ze-GIS | Njengoba kungeniswe | Izinsimu zayo |

Ubude, izikhundla namakhulu okuphakama kusemayunithini ephrojekthi (US survey feet noma metres). Ububanzi bamapayipi nezakhiwo buseminithini (inches) kumaphrojekthi e-feet nasemamilimitha kumaphrojekthi e-metre; `DIA_UNIT` iveza ukuthi yiyiphi.

## Amafomethi

- **Shapefile**: i-`.zip` eyodwa enama-shapefile ngohlobo ngalunye (`.shp`, `.shx`, `.dbf`), i-`.cpg` ethi umbhalo ungu-UTF-8, ne-`.prj` ekhomba uhlelo lokuxhumanisa. Izimo ezinokuphakama zibhalwa njengezinhlobo ze-Z ze-shapefile. Amagama ensimu amade kuna-10 izinhlamvu ayafinyezwa, njengoba ifomethi idinga, futhi umugqa wesimo uwadalela.
- **GeoPackage**: ifayela elilodwa le-`.gpkg` elinethebula ngohlobo ngalunye, uhlelo lokuxhumanisa lugcinwe ngekhodi yalo ye-EPSG. Ifayela elilodwa esikhundleni sezinengi, namagama ensimu amade agcinwa.
- **KML** noma **KMZ** (i-KML ezipwe): ifayela elilodwa lobude nobubanzi bendawo ze-Google Earth namamephu ewebhu, ifolda ngohlobo ngalunye, isici ngasinye siyisimakisi esibizwa ngensimu yaso ye-NAME nazo zonke izinsimu njengedatha engeziwe; ukuphakama kusemamitheni (imodi yokuphakama i-absolute). Njenge-GeoJSON, idinga uhlelo lokuxhumanisa lwephrojekthi.
- **GeoJSON**: ifayela elilodwa lobude nobubanzi (umgomo we-GeoJSON awuvumi okunye) lapho isici ngasinye sithwala impahla ethi `kind` (`pipes`, `structures`, …) ukuze umamukeli akwazi ukuzihlukanisa. Ukuphakama kuguqulelwa kumamitha, njengoba umgomo ufuna; kuhlala kudathasethi yakho yokuphakama yephrojekthi (i-CivilCraft ayinayo imodeli ye-geoid). Iphrojekthi engenalo uhlelo lokuxhumanisa ayikwazi ukuthumela i-GeoJSON, futhi ingxoxo iyasho ukuthi kungani.

## Igridi, hhayi umhlaba

Imiphakathi ye-GIS igcina idatha yayo ezindaweni zegridi zohlelo lokuxhumanisa. Uma iphrojekthi yakho isebenzisa amakhoordinethi womhlaba noma endawo (asethwe kwi-{{ui:Amakhoordinethi}}), wonke amakhoordinethi aguqulelwa egridini ekuphumeni: izinombolo emafayelweni zihluke kuleyo yephlani ngesilinganiso sakho sokuskeyla (nokujikeka, kohlelo lwendawo). Izinsimu zamaphoyinti `N` no `E` nazo zibamba amanani egridi. Ingxoxo iyakukhumbuza.

:::tip
Thumela inothi elifushane namafayela: uhlelo lokuxhumanisa nekhodi yalo ye-EPSG, idathasethi yokuphakama kwezinga lakho, amayunithi, nokuthi yiyiphi ifayela ngalinye.
:::

## Okuhlolwe

- Ifayela ngalinye elibhaliwe lafundwa kabusha yi-GDAL, ithala lolwazi elisetshenziswa izinhlelo eziningi ze-GIS ukuze lifunde lawa mafayela: ngayinye yesimo, ukuphakama nesici, izinombolo zezinto, nohlelo lokuxhumanisa njengekhodi yalo ye-EPSG (`.prj` ne-GeoPackage). Izifundi zethu nazo zawafunda ngendlela efanayo.
- Amafayela e-GeoJSON alandela i-RFC 7946: ubude phambi kobubanzi, akukho ilungu le-`crs`, imibuthano yangaphandle ijikeleza ngokuphambene nokunyathela iwashi nezimbobo zijikeleza ngokunyathela iwashi; izikhundla zahambisana ne-PROJ ku-2 mm.
- Iphrojekthi yamakhoordinethi omhlaba yathunyelwa, futhi wonke amaphoyinti ahlolwa ngamakhoordinethi awo egridi.
- Akukakavulwa lutho lapha ezinhlelweni zanoma yimuphi omunye we-GIS. Hlola ukuthunyelwa kokuqala nomnyango ngaphambi kokuthembela kukho.
