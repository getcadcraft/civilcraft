---
title: Amagridi okuphakama ne-LiDAR
summary: Akha umhlaba okhona kusuka ku-DEM (GeoTIFF noma igridi ye-ASCII) noma kumaphoyinti e-LiDAR (LAS, LAZ) — khetha indawo, nciphisa idatha, khetha amaklasi bese uhlola amayunithi okuphakama — bese ubuyisela umphezulu njengegridi yokuphakama ye-GeoTIFF.
keywords: dem, dtm, igridi yokuphakama, geotiff, tif, igridi ye-ascii, asc, lidar, las, laz, ifu lamaphoyinti, amaklasi, umhlaba, ukuncipha, nodata, raster, thumela i-geotiff, gis
from: c8b2d18a
---

Idatha yokuphakama evulekile ifika ngezindlela ezimbili: **amagridi okuphakama** (i-DEM: ukuphakama kweseli eyodwa ngayinye yesikwele, ngokuvamile i-GeoTIFF `.tif` noma igridi ye-ASCII `.asc`) kanye **namaphoyinti e-LiDAR** (izigidi zokubuya kwelaser kwifayela `.las`, noma `.laz` uma ichitshiyelwe). I-CivilCraft iguqula yomibili ibe ngamaphoyinti okuhlola noma umphezulu, ngaphakathi kwesiphequluli: akukho okulayishwa.

## Vula ifayela

1. Chofoza {{ui:Vula}} (noma {{ui:Ngenisa}} eqenjini le-GIS) bese ukhetha ifayela, noma uyidonse epulanini. Ngegridi ye-ASCII, khetha nefayela layo le-`.prj`, ukuze i-CivilCraft yazi uhlelo lwayo lwezixhumanisi.
2. Ingxoxo yokungenisa ibonisa okushiwo yifayela ngalo: usayizi walo, amaseli noma amaphoyinti, uhlelo lwezixhumanisi, indawo yalo ngobude nobubanzi, nebanga lokuphakama. Ye-LiDAR iqala ifunde wonke amaphoyinti kanye ukubala **amaklasi** (ibha yenqubekelaphambili iyakhombisa ukuthi isafika kuphi; {{ui:Khansela}} iyayimisa).

I-GeoTIFF enamabhendi amathathu noma amane (obomvu, oluhlaza, oluhlaza okwesibhakabhaka) iyisithombe, hhayi okuphakama: iya ezingqimbeni zemephu esikhundleni salokho.

## Khetha okuzolethwa

- **Indawo**: {{ui:Ububanzi beprojekthi nomkhawulo}} (thayipha umkhawulo), {{ui:Okuboniswa yipulani manje}}, noma {{ui:Ifayela lonke}}. Kufundwa lolo hlaka kuphela lwefayela.
- **Nciphisa ibe ku-**: ibanga phakathi kwamaphoyinti otholayo, ngamayunithi wephrojekthi. Umugqa ongaphansi kwezilungiselelo ubonisa amaphoyinti angakunikeza njengoba uthayipha. Ngegridi, i-CivilCraft igcina yonke iseli yesibili, yesithathu … ngakho ukuphakama kuhlala kuyefayela ngokuqondile; ayikaze ihlanganise amaseli. Ye-LiDAR, indawo yehlukaniswa ibe yizikwele zalobo bukhulu, futhi iphoyinti elilodwa ligcinwa ngesikwele ngasinye: {{ui:Iphoyinti eliseduze kakhulu nesikhungo seseli ngalinye}} (okuzenzakalelayo), {{ui:Iphoyinti eliphansi kakhulu kuleseli ngalinye}} (kuhle uma ifayela lingenayo iklasi lomhlaba: umhlaba usezansi kwezihlahla) noma {{ui:Isilinganiso samaphoyinti eseli ngalinye}}.
- **Amaklasi** (LiDAR): umhlaba (iklasi 2) uyakhethwa uma ifayela linawo; izakhiwo, izihlahla nomsindo kuyasuswa. Uma kungekho iklasi lomhlaba, wonke amaklasi ayakhethwa, nengxoxo iyakusho lokho.
- **Umhlaba** (LiDAR, 0.8): ifu le-drone alinayo iklasi lomhlaba. Uma ifayela lingenalo, ingxoxo iqala ku-{{ui:Ngithole umhlaba ngokwami (amafu edrone, ngaphandle kweklasi yomhlaba)}}: kufundwa zonke iklasi ngaphandle komsindo, kugcinwa iphoyinti eliphansi kakhulu kuseli ngayinye, bese i-CivilCraft isusa izakhiwo, izihlahla namaphoyinti aphansi angavamile ngesihlungi se-morphological esiqhubekayo (Zhang nabanye, 2003) onganqumayo ngaso: **Into enkulu kakhulu yokususwa** (ububanzi besakhiwo esikhulu kunazo zonke; amawindi akhula aze amboze kona; 0 kusho amaseli angu-20) kanye **Ithambeka elicijile lomhlaba**. Umsebenzi wenziwa ngegridi yamaphoyinti aphansi kakhulu, ngakho ifu lamaphoyinti ayizigidi zamashumi lidla ngaphezu kwenani lamaseli walo kuphela (ukunciphisa kuyipasi eyodwa yokusakaza). Ibanga liyiseli: elikhulu liyashesha futhi lisuse izinto ezincane kancane kunalokho ocabanga ngakho, elincane ligcina imininingwane eminingi yomhlaba. Umbiko utshela ukuthi amaphoyinti angaki agcinwe njengomhlaba, amaseli angaki asuswe njengezinto, nokuthi amaphoyinti aphansi angaki ayilahlwe. Ku-survey ye-drone eyenziwe ngamamitha angu-300 nezakhiwo ezinhlanu, izihlahla ezingu-70 nezingeniso eziphansi ezingu-200, amaphoyinti agcinwe ayesesikhashaneni esingu-3 cm kumhlaba wangempela, futhi akukho uphahla noma umqhele wezihlahla ogcinwe.
- **Ukuphakama kwifayela**: amamitha, amafidi noma amafidi esurvey ye-US. Uma ifayela lisho, iyunithi sele ikhethiwe. Uma lingasho, kufanele ukhethe: ingxoxo ibonisa ibanga lokuphakama ngazo zombili izindlela ukuze ubone elisho kahle esakhiweni.
- **Ngenisa njenge-** (amagridi kuphela): {{ui:Amaphoyinti okuhlola (idatha DEM echaziwe)}}, noma {{ui:Umphezulu uqobo (igridi yezinxantathu)}}.

Ukungenisa okukodwa kuthatha amaphoyinti angu-500,000 kuphela. Uma ukukhetha kuzonikeza amaningi, ingxoxo ithi ngamaphi futhi ibanga elingalingana, bese {{ui:Ngenisa}} ihlala ingasebenzi.

Chofoza {{ui:Ngenisa}}. Ibha yenqubekelaphambili ikhombisa ukufunda; {{ui:Khansela}} iyayimisa futhi akukho okushintsha.

:::warning
Amayunithi aqondile yindida evamile. Amaningi amaDEM endiza yesifunda anama-easting nama-northing ngamafidi kodwa okuphakama ngamamitha. Hlola ibanga elibonisiwe engxoxweni ngokuqhathanisa nolwazi lwakho lwendawo.
:::

## Okuzuza

- **Amaphoyinti okuhlola**: anikezwa izinombolo ngemva kwenombolo yephoyinti lakho eliphezulu kakhulu, ngencazelo `DEM` (amagridi) noma `LIDAR`, ukuze yakhe iqoqo elilodwa lamaphoyinti ngaphansi kwe-**Amaphoyinti** futhi akhe umphezulu njengamanye amaphoyinti. Ukungenisa kwawo kuyisinyathelo esisodwa: {{key:Mod+Z}} uwasusa futhi.
- **Umphezulu uqobo**: i-TIN yegridi, onxantathu ababili ngeseli, ahlukaniswe ngedayagonali esuka eningizimu-ntshonalanga kuya enyakatho-mpumalanga. Unxantathu onekhona elingenayo idatha uyasuswa, ngakho izimbobo zedatha zihlala zimbobo. Umphezulu ulingana negridi kuwo wonke amaphoyinti egridi futhi ungupuleni oluthe tshe phakathi kwanoma yimuphi unxantathu phakathi kwawo. Ushintsha umphezulu wephrojekthi (ingxoxo iyabuza kuqala); {{key:Mod+Z}} ubuyisela umphezulu wangaphambili. Ikhanda lombhalo wesobunxele lithi **Umphezulu (kusuka egrigini yokuphakama)**.

## Uhlelo lwezixhumanisi

- Uma iphrojekthi inohlelo lwezixhumanisi kanti ifayela libiza olunye, wonke amaphoyinti aguqulelwa ohlelweni lwephrojekthi (nasezixhumanisweni zawo zomhlaba noma zendawo uma inazo).
- Uma iphrojekthi ingenalo futhi uhlelo lwefayela lusemayunithini wephrojekthi (amafidi noma amamitha), ingxoxo inikeza ukwenza lowo uhlelo luhlelo lwephrojekthi, ngesinyathelo esisodwa sokuhlehlisa njengamaphoyinti.
- Uma ifayela lisobubanzi nobude, noma lingamamitha ephrojekthi yamafidi, ingxoxo ikucela ukuthi okokuqala ukhethe uhlelo lwezixhumanisi lwephrojekthi.
- Uma ifayela lingasho, izinombolo zalo zithathwa njengezixhumanisi zephrojekthi. Ungakhetha uhlelo lwefayela esikhundleni salokho.

## Thumela umphezulu njenge-GeoTIFF

1. Chofoza {{ui:Thumela}} eqenjini le-GIS.
2. Engxenyeni ye-GeoTIFF khetha umphezulu (umhlaba okhona noma umphezulu owenziwe ngamazinga) nosayizi weseli. Okuzenzakalelayo kuvela emaphethelweni anxantathu wephakathi womphezulu. Ingxoxo ibonisa usayizi wegridi ezoyibhala.
3. Chofoza {{ui:Landa i-GeoTIFF}}.

Ifayela liyibhendi eyodwa yokuphakama kwe-floating point ye-32-bit, ngamayunithi wephrojekthi, phezu kobubanzi bomphezulu; amaseli angaphandle komphezulu ayi-"akukho datha" (−3.4028235e38). Inani ngalinye leseli liyokuphakama komphezulu esikhungweni saleseli. Izixhumanisi ziyizixhumanisi zegridi: iphrojekthi emhlabeni noma ezixhumanisweni zendawo iguqulelwa ibuyele egrigini. Ifayela lichaza uhlelo lwezixhumanisi ngekhodi yalo ye-EPSG; uhlelo olungenayo ikhodi ye-EPSG alubhalwa, futhi ingxoxo iyakusexwayisa ukuthi utshele isiqondisi se-GIS ukuthi uhlelo luyini.

## Okuhlolwe

- Abafundi be-GeoTIFF nege-ASCII grid bahlolwe nge-GDAL (ngo-rasterio), ilabhulali ezinhlelo eziningi ze-GIS ezisebenzisa ukufunda lawa mafayela: amagridi e-32-bit float nale-16-bit integer, athiliwe nama-strip, i-DEFLATE ne-LZW, nodata, isilinganiso nokushintshwa, pixel-is-point, igridi ye-UTM, igridi yendiza yesifunda ngamafidi esurvey ye-US kanye negridi yobude nobubanzi — zonke izinani zilingana.
- Abafundi be-LAS ne-LAZ bahlolwe nge-laspy: i-LAS 1.2 ne-1.4, ifomethi yamaphoyinti 0, 1, 3, 6, 7 no-8, nokungabi nohlelo lwezixhumanisi, kanye ne-LAZ ebhalwe yi-backend ehambisana ne-LASzip — zonke amaphoyinti alingana.
- Izixhumanisi eziguquliwe zihlolwe nge-PROJ kuze kufike ku-1 mm.
- Ama-GeoTIFF athunyelwe afundwe kabusha yi-GDAL: uhlelo lwezixhumanisi, izindawo zamaseli, nodata, amayunithi, namanani alingana nomphezulu kuze kufike ku-0.0001.
- Akukho lapha okuvulwe kwezinye izinhlelo ze-GIS noma ze-CAD.

## Akukakhiwa okwamanje

- Ukushintsha kwedatam ethe tshe (amamodeli e-geoid): ukuphakama kusetshenziswa njengoba kunjalo efayeleni.
- Idatha ye-waveform, okubuyiswa kwe-LiDAR ngaphandle kwamaklasi, imibala namandla.
- Amabhendi amaningi, ukubukwa okujwayelekile, noma amafayela angaphezu kwe-200 MB.
- Ukubhala i-LAS noma i-LAZ kusuka emphezulwini noma kulesi sithuluzi (i-add-on ye-[Amafu amaphoyinti](topic:point-clouds) ibhala ifu elihlanzekile njenge-LAS 1.4 noma i-LAZ).
