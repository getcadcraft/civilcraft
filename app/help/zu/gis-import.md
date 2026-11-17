---
title: Ngenisa idatha ye-GIS
summary: Letha ama-shapefile, GeoJSON ne-GeoPackage kuphrojekthi njengezingqimba ze-GIS, zibeke ngohlelo lokuxhumanisa olufanele, bheke izici zazo, bese uzisebenzisela umphezulu.
keywords: gis, izinkomba, bhala izici, izici ephlanini, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, ngenisa, izingqimba, izici, uhlelo lokuxhumanisa, epsg, ububanzi, ubude, ama-contour, izigaxa, imigqa yokwephula, umngcele
from: f6b235cc
---

Imiphakathi kanye nezifunda zinikeza umongo wesayithi njengamafayela e-GIS: izigaxa, amalungelo okudlula, ama-contour, izinsiza, ukulawula kokuhlola. I-CivilCraft ivula izinhlobo ezintathu zawo njengezingqimba ze-**GIS** ezihlala ngaphansi kwedizayini yakho ephlanini.

| Ifayela | Okufanele ukuvule |
|---|---|
| Shapefile | I-`.shp` kanye ne-`.shx`, `.dbf`, `.prj` ne-`.cpg` (zikhethe zonke), noma i-`.zip` ezifike ngayo. I-zip enama-shapefile amaningi inikeza izingqimba eziningi. |
| GeoJSON | Ifayela le-`.geojson` (ifayela le-`.json` okusho kumugqa wokuqala `FeatureCollection` noma `Feature` nalo liyasebenza). |
| GeoPackage | Ifayela le-`.gpkg`. Wonke amathebula ezici kuwo ayadwetshwa. |
| KML noma KMZ | Ifayela le-`.kml` (elivela ku-Google Earth noma kumephu wewebhu), noma i-`.kmz` ezipwe. Ifolda ngayinye iba yisingqimba (ihlukaniswe ibe amaphoyinti, imigqa namapholigoni uma inezinhlobo eziningi); igama lesimakisi, incazelo nedatha yaso engeziwe kuba yizici zaso. Ukuphakama kusemamitheni, nobude nobubanzi, njenge-GeoJSON. |

Amaphoyinti, ama-multipoint, imigqa, amapholigoni anezimbobo nezimo ezinezingxenye eziningi ayafundwa, kanye nokuphakama kwawo (z) uma efayeleni linakho. Amanani okulinganisa (M) ayashiywa. Amagridi okuphakama ne-LiDAR avulwa ngendlela efanayo: bona [Amagridi okuphakama ne-LiDAR](topic:elevation-grids-and-lidar).

## Vula amafayela

1. Chofoza {{ui:Ngenisa}} eqenjini le-**GIS** (noma {{ui:Vula}}), khetha amafayela, noma wawise ephlanini. Amafayela afundwa kulolu khompyutha; akukho okulayishwa.
2. Ingxoxo **Ngenisa idatha ye-GIS** ibhala zonke izingqimba ezitholakele: uhlobo lwazo, izici zingaki (nezingaki ezingenayo ijometri), izinsimu zezici zingaki, nohlelo lokuxhumanisa ifayela licaphuna. Khipha izingqimba ongazidingi.
3. Funda ingxenye ye-**Uhlelo lokuxhumanisa** (ngezansi) nomugqa we-**Okuzoenzeka**, bese uchofoza {{ui:Ngenisa}}.
4. Izingqimba zivela ephlanini naphansi kwe-**Izingqimba ze-GIS** esaneni lesobunxele. Ukungenisa kuyisinyathelo esisodwa: {{key:Mod+Z}} sikuhlehlisa.

Ifayela elikhulu libonisa umugqa wenqubekela phambili phezu kwephlani nenkinobho {{ui:Khansela}}.

## Uhlelo lokuxhumanisa

Amafayela e-GIS athi aphi ngohlelo lokuxhumanisa (i-`.prj` yeshapefile, ithebula lesikhala sendawo le-GeoPackage; i-GeoJSON ihlala ibe ububanzi nobude). I-CivilCraft iguqula ingqimba ngayinye isuka kuhlelo lwayo iye kohlelo lwephrojekthi. Ayikaze iqagele:

- **Iphrojekthi inohlelo lokuxhumanisa** (olusethwe kwi-{{ui:Amakhoordinethi}}): yonke ingqimba enohlelo oluyo iguqulelwa kulo, kubandakanya nokulungisa komhlaba noma endawo. Ifayela elingenayo i-`.prj` linikeza izinketho ezimbili: **Okufanayo nephrojekthi** (izinombolo zalo zilayishwa njengoba zinjalo) noma **Khetha uhlelo lwefayela**.
- **Iphrojekthi ayinalo, nefayela lisesistimini ephrojekthini ngamayunithi ephrojekthi** (isigaba sesifunda sendawo ngo-US survey feet ephrojekthini ye-feet, isibonelo): ingxoxo inikeza **Sebenzisa lolo hlelo njengohlelo lokuxhumanisa lwephrojekthi**. Lisethwa esinyathelweni esifanayo sokungenisa. Akukho okunyakazayo ephrojekthini; uhlelo kuphela luchaza ukuthi izinombolo zisho ini. Ungakhetha olunye uhlelo lwephrojekthi esikhundleni salo, bese izingqimba ziguqulelwa kulo.
- **Iphrojekthi ayinalo, nefayela lisebubanzini nobudeni** (yonke i-GeoJSON) **noma emayunithini ahlukile**: {{ui:Ngenisa}} ihlala ifiphele kuze ukhethe uhlelo lokuxhumanisa lwephrojekthi. Isikhethi siqala eduze kwedatha.
- **Akukho phrojekthi noma amafayela akhomba uhlelo**: izinombolo ziyalayishwa njengoba zinjalo, futhi ingxoxo iyasho lokho.

Ukuphakama nakho kuyaguqulwa: ukuphakama kwe-GeoJSON kusemamitheni (umgomo we-GeoJSON uthi kanjalo); ukuphakama kwamanye amafayela kuthathwa ngeyunithi yohlelo lwawo.

:::warning
Izikhundla ku-GeoJSON ezingaphandle kobubanzi ±180° noma ubude ±90° akusibo ubude nobubanzi. Lezo zici ziyashiywa futhi ingxoxo iyasho ukuthi zingaki. Leli fayela ngokuvamile liyifayela elihlelwe elagcinwa ngaphandle kohlelo lwalo; cela elinye, noma i-shapefile ene-`.prj` yalo.
:::

I-NAD83 ithathwa njengofanayo ne-WGS 84 (uhlelo i-GeoJSON esebenzisa); la maciko amabili ahluka ngamamitha ambalwa e-North America, ngakho idatha ye-GeoJSON ingahluka ngalokho. Lapho ukushintsha okuhle kakhulu kudinga ifayela legridi (i-NADCON ye-NAD27, isibonelo), i-CivilCraft isebenzisa ukushintsha okungaphelele okushicilelwe futhi ingxoxo yohlelo lokuxhumanisa ikhombisa ukuthi kungaphelele kangakanani (ye-NAD27, cishe ama-20 m), kuze wengeze ifayela legridi: bona [Amafayela okushintsha kwegridi](topic:coordinate-systems).

## Izingqimba ze-GIS

Umugqa ngamunye ongaphansi kwe-**Izingqimba ze-GIS** unalezi:

- ibhokisi lokukhetha lokubonisa noma lokufihla ingqimba (izingqimba ezifihliwe nazo azikhethwa);
- umbala wayo, okhethwa kuhlu;
- imenyu (amachashaza amathathu) enezinketho {{ui:Sondeza kuze}}, {{ui:Sebenzisela umphezulu…}}, {{ui:Qamba kabusha…}} kanye {{ui:Susa}}.

Ukubonisa, ukufihla, ukushintsha umbala, ukuqamba kabusha nokususa kuyizinyathelo zokuhlehlisa. Izingqimba ze-GIS zigcinwa efayelweni lephrojekthi futhi zibuya uma uyilivula. Ziphinde zaphume nge-PDF plot yephlani kanye nokuthunyelwa kwayo kwe-DXF ne-DWG, ngayinye engqimbeni enegama elithi `GIS-` nenombolo yalo.

## Bhala izici ngesici

Kumenyu ye-{{ui:Okuningi}} yengqimba (amachashaza amathathu ku-**Izingqimba ze-GIS**), khetha insimu ngaphansi kwe-**Bhala ngesici**: yonke into ibonisa inani layo ephlanini, ngombala wengqimba. Amaphoyinti abhalwa eduze kwephoyinti, imigqa ibhalwa eduze kwengxenye yayo ende kakhulu (iguqulwe ukuze ifundeke isuka kwesobunxele iye kwesokudla), amapholigoni ephakathi kwawo. Izinombolo zibonisa kuze kube amadesimali amathathu. Amalebula angu-1.8 mm ngobude ephepheni kunoma yisiphi isilinganiso, futhi ayangena ku-PDF plot, DXF ne-DWG. Khetha **Azikho amalebula** ukuze uwasuse; ushintsho ngalunye luyisinyathelo esisodwa ({{key:Mod+Z}} siyawuhlehlisa). Ingqimba ibhala izici ezingaphezu kuka-5,000 kuzo.

## Bheka isici

Uma {{ui:Khetha}} evuliwe, chofoza isici. **Izakhiwo** ikhombisa ingqimba yalo, ukuthi yisiphi isici, ukwakheka kwalo (izingxenye, izimbobo, izimo), ukuphakama kwalo, ifayela elivela kulo nohlelo lokuxhumanisa lwaleyo fayela, bese kuba zonke izinsimu zedatha etafuleni. Izici zifundeka kuphela: i-CivilCraft ibonisa idatha ye-GIS njengoba yafika, ayihleli.

Amaphoyinti anqoba imigqa uma kokubili kungaphansi kwenkomba; ngaphakathi kwepholigoni, kukhethwa ipholigoni elincane kakhulu.

## Sebenzisela umphezulu

Vula imenyu yengqimba bese ukhetha {{ui:Sebenzisela umphezulu…}} (noma inkinobho ku-**Izakhiwo**). Okutholakalayo kuncike engqimbeni:

| Ingqimba | Ingaba |
|---|---|
| Imigqa enokuphakama (imigqa ye-3D) | Imigqa yokwephula ngokuphakama kwayo |
| Imigqa engenakuphakama kodwa enensimu yenombolo (ama-contour) | Imigqa yokwephula ngokuphakama osensimini okhetha yona |
| Amapholigoni | Umngcele womphezulu (ipholigoni okhethiwe, noma elikhulu kunawo wonke), noma imigqa yokwephula emiphethweni yawo |
| Amaphoyinti anokuphakama, noma anensimu yokuphakama | Amaphoyinti okuhlola, achazwe ngegama lengqimba ukuze akhe iqembu lamaphoyinti |

Ukusetshenziswa ngakunye kuyisinyathelo esisodwa sokuhlehlisa esikopisha ijometri kuphrojekthi; ingqimba ngokwayo ihlala njengoba injalo. Ukuphakama kuthathwa ngamayunithi ephrojekthi.

## Amafayela wamaphoyinti anobude nobubanzi

Ifayela lamaphoyinti okuthi ikhanda lalo likhomba amakholomu e-**latitude** ne-**longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) lifundwa njengamadigri, hhayi njenge-northing ne-easting. Ingxoxo yokungenisa iyasho lokho. Lapho uchofoza {{ui:Ngenisa}}, amaphoyinti aguqulelwa kuhlelo lokuxhumanisa lwephrojekthi; iphrojekthi engenalo icela ukuthi uyikhethele kuqala. Amadigri akuyikuze alayishwe njengama-feet. Imigqa ngaphandle kobubanzi ±90° noma ubude ±180° iyenqatshwa nesizathu. Ikholomu yokuphakama ithathwa njengoba injalo, ngamayunithi ephrojekthi.

## Amafayela e-LandXML akhomba uhlelo lokuxhumanisa

Uma ifayela le-LandXML olivulayo linesakhi se-`CoordinateSystem` (ikhodi ye-EPSG, incazelo ye-WKT noma igama lohlelo), i-CivilCraft iyinikeza njengohlelo lokuxhumanisa lwephrojekthi. Akukho okunyakazayo uma uyamukela; uhlelo luchaza kuphela ukuthi izinombolo zisho ini.

## Okuhlolwe

- Konke ukufunda kuqhathaniswe ne-GDAL, ithala elisetshenziswa izinhlelo eziningi ze-GIS ukuze lifunde lawa mafayela, emafayeleni i-GDAL ayebhale: ama-shapefile ezinhlobo zonke, anokuphakama nangaphandle kwakho, imigqa eminingi yezingxenye, amapholigoni anezimbobo, ijometri engenalutho, izinsimu zombhalo, zezinombolo, zedethi nezeqiniso/amanga, umbhalo we-UTF-8 ne-Windows-1252 nangaphandle kwe-`.cpg`, i-zip yama-shapefile amaningi, i-GeoJSON yazo zonke izinhlobo zejometri, nGeoPackage enamathebula amane. Yonke ijometri, ukuphakama nensimu kuhambisane.
- Izikhundla eziguqulwe kububanzi nobude, nasekuUTM, zahambisana ne-PROJ (ithala lemephu elisemuva kwe-GDAL) ku-3 mm.
- Amafayela alimele (aqhekeziwe, akhombisa usayizi wamanga, ama-zip angalungile, ama-GeoPackage angalungile) anikeza umyalezo oodwa ocacile; akukho okumisayo.
- Akukakavulwa lutho lapha ezinhlelweni zanoma yimuphi omunye we-GIS, futhi ama-geodatabase amafayela, i-KML ne-KMZ akukafundwa (bona [Akukakwakhiwa](topic:not-built-yet)).
