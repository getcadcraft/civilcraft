---
title: Rrjetet e kotave dhe LiDAR
summary: Ndërto terrenin ekzistues nga një DEM (GeoTIFF ose rrjet ASCII) ose pika LiDAR (LAS, LAZ) — zgjidhni zonën, hollojeni të dhënat, zgjidhni klasat dhe kontrolloni njësitë e kotës — dhe ktheni një sipërfaqe si rrjet kotash GeoTIFF.
keywords: dem, dtm, rrjet kotash, geotiff, tif, rrjet ascii, asc, lidar, las, laz, re pikash, klasa, terren, hollim, nodata, raster, eksporto geotiff, gis
from: c8b2d18a
---

Të dhënat publike të kotave vijnë në dy mënyra: **rrjete kotash** (një DEM: një kotë për çdo qelizë katrore, zakonisht një GeoTIFF `.tif` ose një rrjet ASCII `.asc`) dhe **pika LiDAR** (miliona kthime lazeri në një skedar `.las`, ose `.laz` kur është i ngjeshur). CivilCraft e kthen secilin prej tyre në pika rilevimi ose në një sipërfaqe, brenda shfletuesit: asgjë nuk ngarkohet.

## Hapni skedarin

1. Klikoni {{ui:Open}} (ose {{ui:Import}} te grupi GIS) dhe zgjidhni skedarin, ose tërhiqeni mbi planimetri. Për një rrjet ASCII, zgjidhni edhe skedarin e tij `.prj`, që CivilCraft të dijë sistemin e koordinatave.
2. Dialogu i importit tregon çfarë thotë vetë skedari për veten: madhësinë, qelizat ose pikat, sistemin e koordinatave, ku ndodhet në gjerësi dhe gjatësi gjeografike, dhe shtrirjen e kotave. Për LiDAR, ai lexon fillimisht çdo pikë një herë për të numëruar **klasat** (një shirit progresi tregon sa ka mbetur; {{ui:Cancel}} e ndal).

Një GeoTIFF me tre ose katër kanale (e kuqe, jeshile, blu) është një figurë, jo kota: shkon te shtresat e hartës.

## Zgjidhni çfarë të sillet

- **Zona**: {{ui:The project’s extents and a margin}} (shkruani kufirin), {{ui:What the plan shows now}}, ose {{ui:The whole file}}. Lexohet vetëm ajo pjesë e skedarit.
- **Hollo në**: distanca mes pikave që merrni, në njësitë e projektit. Vija nën cilësimet tregon sa pika jep kjo ndërsa shkruani. Për një rrjet, CivilCraft mban çdo qelizë të dytë, të tretë … kështu që kotat mbeten saktësisht ato të skedarit; nuk i mesatëron kurrë qelizat. Për LiDAR, zona ndahet në katrorë të asaj madhësie dhe mbahet një pikë për katror: {{ui:The point nearest each cell’s center}} (parazgjedhja), {{ui:The lowest point in each cell}} (e mirë kur skedari nuk ka klasë terreni: terreni është nën pemë) ose {{ui:The average of each cell’s points}}.
- **Klasat** (LiDAR): terreni (klasa 2) zgjidhet kur skedari e ka; ndërtesat, pemët dhe zhurma lihen jashtë. Kur nuk ka klasë terreni, zgjidhen të gjitha klasat dhe dialogu e thotë këtë.
- **Terreni** (LiDAR, 0.8): një re pikash nga dronët nuk ka klasë terreni. Kur skedari nuk ka asnjë, dialogu fillon me {{ui:Find the ground myself (drone clouds, no ground class)}}: lexohen të gjitha klasat përveç zhurmës, mbahet pika më e ulët në çdo qelizë, dhe pastaj CivilCraft heq ndërtesat, pemët dhe pikat e ulëta të rastit me një filtër morfologjik progresiv (Zhang dhe të tjerë, 2003) që ju mund ta drejtoni: **Objekti më i madh për t'u hequr** (gjerësia e ndërtesës më të madhe; dritaret rriten derisa e mbulojnë; 0 do të thotë 20 qeliza) dhe **Pjerrësia më e madhe e terrenit**. Puna bëhet mbi rrjetin e pikave më të ulëta, kështu që një re me dhjetëra milionë pika nuk kushton më shumë se numri i qelizave të saj (hollimi është një kalim i vetëm rrjedhës). Hapësira është qeliza: një më e madhe është më e shpejtë dhe humb objekte të vogla më pak se sa pritet, një më e imtë mban më shumë detaje të terrenit. Raporti thotë sa pika u mbajtën si terren, sa qeliza u hoqën si objekte dhe sa pika të ulëta të rastit u hoqën. Në një hulumtim të trilluar me dron 300 m, me pesë ndërtesa, 70 pemë dhe 200 pika të ulëta të jashtme, pikat e mbajtura ishin brenda 3 cm nga terreni i vërtetë dhe asnjë çati apo kurorë pemësh nuk u mbajt.
- **Kotat në skedar**: metra, këmbë ose këmbë të anketës amerikane. Kur skedari e thotë, njësia e tij zgjidhet tashmë. Kur nuk e thotë, duhet të zgjidhni: dialogu tregon shtrirjen e kotave në të dyja mënyrat, që të dalloni cila ka kuptim për vendin.
- **Importo si** (vetëm rrjete): {{ui:Survey points (description DEM)}}, ose {{ui:The surface itself (a grid of triangles)}}.

Një import merr më së shumti 500,000 pika. Kur një zgjedhje jep më shumë, dialogu thotë me sa dhe cila hapësirë do të përshtatej, dhe {{ui:Import}} mbetet joaktiv.

Klikoni {{ui:Import}}. Një shirit progresi tregon leximin; {{ui:Cancel}} e ndal dhe asgjë nuk ndryshon.

:::warning
Njësitë vertikale janë një kurth i zakonshëm. Shumë DEM në sistemin state plane kanë lindjet dhe veriet në këmbë, por kotat në metra. Kontrolloni shtrirjen që tregon dialogu me atë që dini për vendin.
:::

## Çfarë merrni

- **Pikat e rilevimit**: të numëruara pas numrit tuaj më të lartë të pikës, me përshkrimin `DEM` (rrjete) ose `LIDAR`, kështu që formojnë një grup pikash nën **Pikat** dhe ndërtojnë sipërfaqen si çdo pikë tjetër. Importi i tyre është një hap: {{key:Mod+Z}} i heq sërish.
- **Vetë sipërfaqja**: një TIN rrjeti, dy trekëndësha për qelizë, të ndarë sipas diagonales jug-perëndim në veri-lindje. Një trekëndësh me një kulm pa të dhëna lihet jashtë, kështu që vrimat në të dhëna mbeten vrima. Sipërfaqja është e barabartë me rrjetin në çdo pikë rrjeti dhe është një rrafsh i sheshtë brenda çdo trekëndëshi midis tyre. Ajo zëvendëson sipërfaqen e projektit (dialogu pyet së pari); {{key:Mod+Z}} e kthen sipërfaqen e mëparshme. Titulli i panelit majtas thotë **Sipërfaqja (nga një rrjet kotash)**.

## Sistemet e koordinatave

- Nëse projekti ka një sistem koordinatash dhe skedari emëron një tjetër, çdo pikë kthehet në sistemin e projektit (dhe në koordinatat e tokës ose lokale kur i ka).
- Nëse projekti nuk ka asnjë dhe sistemi i skedarit është në njësitë e projektit (këmbë ose metra), dialogu ofron ta bëjë atë sistemin e koordinatave të projektit, në të njëjtin hap zhbërjeje me pikat.
- Nëse skedari është në gjerësi dhe gjatësi gjeografike, ose në metra për një projekt në këmbë, dialogu kërkon që së pari të zgjidhni sistemin e koordinatave të projektit.
- Nëse skedari nuk e thotë, numrat e tij merren si koordinatat e projektit. Mund të zgjidhni sistemin e skedarit në vend të kësaj.

## Eksporto një sipërfaqe si GeoTIFF

1. Klikoni {{ui:Export}} te grupi GIS.
2. Te pjesa GeoTIFF zgjidhni sipërfaqen (terrenin ekzistues ose sipërfaqen e nivelluar) dhe madhësinë e qelizës. Parazgjedhja vjen nga brinja mesatare e trekëndëshit të sipërfaqes. Dialogu tregon madhësinë e rrjetit që do të shkruajë.
3. Klikoni {{ui:Download GeoTIFF}}.

Skedari është një kanal kotash me pikë lundruese 32-bit, në njësitë e projektit, mbi shtrirjen e sipërfaqes; qelizat jashtë sipërfaqes janë "pa të dhëna" (−3.4028235e38). Vlera e secilës qelizë është kota e sipërfaqes në qendrën e qelizës. Koordinatat janë koordinata **rrjeti**: një projekt në koordinata tokësore ose lokale kthehet mbrapsht në rrjet. Skedari e emëron sistemin e koordinatave të projektit me kodin e tij EPSG; një sistem pa kod EPSG nuk shkruhet, dhe dialogu ju paralajmëron t'i thoni departamentit GIS cili sistem është.

## Çfarë u kontrollua

- Lexuesit GeoTIFF dhe rrjetit ASCII u kontrolluan me GDAL (përmes rasterio), bibliotekën që përdorin shumica e programeve GIS për t'i lexuar këto skedarë: rrjete float 32-bit dhe integer 16-bit, me pllaka dhe me shirita, DEFLATE dhe LZW, nodata, shkallë dhe zhvendosje, pixel-is-point, një rrjet UTM, një rrjet sistemi shtetëror në këmbë të anketës amerikane dhe një rrjet gjerësi/gjatësie — çdo vlerë e barabartë.
- Lexuesit LAS dhe LAZ u kontrolluan me laspy: LAS 1.2 dhe 1.4, formatet e pikave 0, 1, 3, 6, 7 dhe 8, me dhe pa sistem koordinatash, dhe LAZ të shkruar nga një backend i përputhshëm me LASzip — çdo pikë e barabartë.
- Koordinatat e konvertuara u kontrolluan me PROJ deri në 1 mm.
- GeoTIFF-et e eksportuara u lexuan përsëri nga GDAL: sistemi i koordinatave, pozicionet e qelizave, nodata, njësitë, dhe vlerat e barabarta me sipërfaqen deri në 0.0001.
- Asgjë këtu nuk është hapur ende në programe të tjera GIS ose CAD.

## Ende nuk është ndërtuar

- Ndryshimet e datumit vertikal (modelet gjeoid): kotat përdoren ashtu si i ka skedari.
- Të dhëna forme valore, kthime LiDAR përveç atyre sipas klasës, ngjyra dhe intensitete.
- Disa kanale, pamje të përmbledhura ose skedarë mbi 200 MB.
- Shkrimi i LAS ose LAZ nga një sipërfaqe ose nga ky mjet (shtojca [Re pikash](topic:point-clouds) shkruan një re të pastruar si LAS 1.4 ose LAZ).
