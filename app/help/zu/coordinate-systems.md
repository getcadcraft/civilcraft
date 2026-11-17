---
title: Setha uhlelo lwamakhoordinethi lweprojekthi
summary: Tshela ukuthi uhlelo lwamakhoordinethi lwesivivinyo luphi, ukuze i-CivilCraft ibonise ububanzi bomhlaba nobude bomhlaba, ibeke amafayela e-GIS namalungiselelo emephu, futhi ibhale amafayela .prj. Khetha ngekhodi, ngegama, ngamakhoordinethi uqobo noma ngefayela .prj.
keywords: uhlelo lwamakhoordinethi, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, iphrojekshini, prj, wkt, datum, ububanzi, ubude, ububanzi nobude, lat long, ejografi, igridi, georeference, georeferencing, faka uhlelo lwamakhoordinethi
from: 964250e2
---

Amakhoordinethi eprojekthi ngamanani avamile uze utshele ukuthi asho ni. Ukusetha uhlelo lwamakhoordinethi **akuhambisi lutho**: kutshela i-CivilCraft ukuthi, ngokwesibonelo, E 6,150,000 N 2,080,000 ngamakhoordinethi e-state plane e-California zone 6 ngamafidi wesivivinyo sase-US. Kanti uma isikwazi:

- ibha yesimo ibonisa ububanzi bomhlaba nobude bomhlaba besikhombisi,
- amafayela e-GIS ezinhlelweni ezihlukile (ama-shapefile, i-GeoJSON, i-GeoPackage, amagridi okuphakama, i-LiDAR) aguqulelwa eprojekthini njengoba evulwa,
- izendlalelo zemephu zingadwetshwa ngaphansi kwepulani ([Bonisa izendlalelo zemephu ngaphansi kwepulani](topic:map-layers)),
- okuthunyelwa ngaphandle kwamafomethi e-GIS kuthwala uhlelo (i-`.prj` ye-shapefile, ikhodi ye-EPSG ye-GeoPackage ne-GeoTIFF).

## Khetha uhlelo

1. Khetha {{ui:Amakhoordinethi}} eqenjini {{ui:GIS}} kwibha yamathuluzi. Ingxoxo **Uhlelo lwamakhoordinethi** iyavula. Phezulu ikutshela ukuthi iprojekthi ikuphi manje, noma **Akukho — amakhoordinethi ngamanani nje**.
2. Thola uhlelo ngenye yalezi zindlela:
   - **Sesha**: bhala ikhodi ye-EPSG (`2277`, `EPSG:2277`) noma amagama asegameni (`texas central`, `utm 14n`, `lambert-93`). Amakhodi ahlu kusukela kowubhalile; amagama ahlu ngezinhlelo okuqukethe wonke amagama.
   - {{ui:Amahlelo lezi zixhumanisi ezilingana nawo}} (uma iprojekthi inamaphoyinti noma indawo): i-CivilCraft ifunda phakathi kweprojekthi kuwo wonke amahlelo womndeni wamayunithi weprojekthi bese idweba olwenza indawo yokusebenza ilingane nawo. Amakhoordinethi e-state plane ngokuvamile alingana namazone ambalwa kuphela: iprojekthi eTexas ku-E 3,115,000 N 10,070,000 ngamafidi wesivivinyo sase-US ilingana nezinhlobo ezine ze-Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Ingenisi ngayinye ibonisa lapho phakathi kweprojekthi kuyoba khona.
   - **Eduze (ububanzi, ubude)** ne-{{ui:Phakamisa}}: bhala lapho kukhona isayithi, isibonelo `30.27, -97.74` noma `30°16′N 97°44′W`, bese i-CivilCraft ibhala amahlelo aprojektwe ayinde lapho, kuqala amagridi kazwelonke nawesifunda.
   - {{ui:Funda ifayela le-.prj…}}: vula i-`.prj` eyeza nale-shapefile noma nomdwebo. I-CivilCraft iyilinganisa nohla lwayo ngokwezibalo zeprojekshini (ngakho i-`.prj` ethi idatum ngendlela ehlukile isathola uhlelo olulungile) bese ishoma ukuthi yiliphi; uma kungekho okufanayo ngokuphelele, kusetshenziswa incazelo yefayela uqobo. Ungaphinda uphonse i-`.prj` engxoxweni, noma uvule noma uphonse enye epulanini wedwa.
3. Chofoza uhlelo ohlwini. Ngaphansi kwe-**Okukhethiwe** kubonisa igama, ikhodi ye-EPSG, iyunithi, ukuthi idatum yalo ihlanganiswe kangakanani ne-WGS 84, indawo yokusebenza yalo ngububanzi nobude, nokuthi phakathi kweprojekthi kuwela kuphi kuwo.
4. Shiya **Igridi** likhethiwe (iningi leprojekthi; bona [Umhlaba namakhoordinethi endawo](topic:ground-and-local-coordinates) ezinye) bese ukhetha {{ui:Sebenzisa}}.

Ibha yesimo manje ibonisa ububanzi nobude besikhombisi eduze kwe-E no-N. Ukusetha uhlelo kuyisinyathelo esisodwa sokuhlehlisa: {{key:Mod+Z}} iyakubuyisela emuva.

:::note
Amayunithi kumele afane: iprojekthi ngamafidi ithatha amahlelo ngamafidi wesivivinyo sase-US noma amafidi ajwayelekile, iprojekthi ngamamitha ithatha amahlelo ngamamitha. I-CivilCraft ichaza ukwenqaba ("Iprojekthi ingamafidi kodwa lolu hlelo ngamamitha…"). Iprojekthi yamafidi ene-US survey foot isebenzisa amafidi wesivivinyo: i-"ft" yeprojekthi isho i-foot yohlelo. Amahlelo ejografi (ububanzi nobude, njenge-WGS 84 ngokwayo) angeke abe uhlelo lweprojekthi: imidwebo idinga ama-easting nama-northing.
:::

## Shintsha noma susa uhlelo

Vula {{ui:Amakhoordinethi}} futhi, khetha esinye uhlelo bese ukhetha {{ui:Sebenzisa}}. Uma iprojekthi inamaphoyinti noma idizayini, i-CivilCraft iyabuza **Ingabe amakhoordinethi sekuse-… na?**

- {{ui:Yebo — akukho okuhambayo}}: amanani ahlala njengoba ayunjalo, kuphela incazelo yawo ishintsha. Sebenzisa lokhu uma uhlelo lwakuqala lwakhethwa ngephutha.
- {{ui:Cha — guqulela}}: lo lonke iphoyinti lokuhlola, umugqa wokwephula, umngcele, i-PI yomzila, ikhona lepedi nesakhiwo kuguqulelwa kusuka kuhlelo lwakuqala kuya kolusha, ngesinyathelo esisodwa sokuhlehlisa. Indawo efundwe kwi-LandXML njengonxantathu ayikwazi ukuguqulelwa; yakhe kabusha kusukela emaphointini kuqala.

{{ui:Susa uhlelo}} luyasusa uhlelo (akukho okuhambayo). Izendlalelo ze-GIS ezisevele eprojekthini zihlala lapho zikhona.

## Ububanzi nobude ebhayeni lesimo

Kuyilapho iprojekthi inohlelo, ibha yesimo ibonisa ububanzi nobude besikhombisi ku-WGS 84, isibonelo `30°18′00.00″ N  97°42′00.00″ W`. Khetha amadigri adecimal kunalokho ngaphansi kwe-{{ui:Izilungiselelo}}, {{ui:CivilCraft}}, **Ububanzi nobude** ([Izilungiselelo ze-CivilCraft](topic:settings)). Uma kukhona amakhoordinethi womhlaba noma wendawo, ukufunda kuhamba ngalesi sinyathelo kuqala, ngakho kuyalunga phoyinti eliphansi kwesikhombisi.

## Ukushintsha kwedatum kulungile kangakanani

Ububanzi, ubude, i-GeoJSON nezendlalelo zemephu zonke ku-WGS 84. Ukuxhumana kwesistimu ngayinye ne-WGS 84 kubonakala engxoxweni:

| Okushiwo yingxoxo | Okusho lokho |
|---|---|
| WGS 84 uqobo | Akukho ukushintsha. |
| I-NAD83 ithathwa njengeWGS 84 | Ezimbili zihlukana ngomitha noma amabili kuningi lase-North America, amamitha ambalwa kakhulu. Kuhle ezendlalelweni zemephu nasemongweni wesayithi; hhayi ekulawuleni ukuhlola. |
| Kwaziwa cishe ku-*n* m (inani le-EPSG) | Ukushintsha okushicilelwe; izendlalelo zemephu ne-GeoJSON zingaba ngaphandle cishe ngalokho. |
| Akwaziwa kule datum | Akukho kushintsha okushicilelwe ngaphandle kwefayela legridi: izendlalelo zemephu ne-GeoJSON zingaba ngaphandle ngamamitha amakhulu. |
| Kusukela efayeleni lokushintsha kwegridi … | Ifayela lokushintsha legridi liyasetshenziswa (ngezansi): cishe ngaphakathi kuka-10 cm ye-NAD83 ngaphakathi kwegridi. |

Amakhoordinethi weprojekthi wakho awakaze adlule ekushintsheni kwedatum: kuphela okuguqulelwa kuya noma kusuka kububanzi nobude kudlula kukho. Ama-datum aqondile namamodeli e-geoid aphathwa (amaphakamo awakaze aguqulelwe). Lapho ukushintsha okuhle kudinga ifayela legridi, uhlu luphethe ukushintsha okushicilelwe okungaqondile, nengxoxo ibonisa ukunemba kwalo (amahlelo e-NAD27, isibonelo, cishe 20 m), kuze wengeze igridi.

## Amafayela okushintsha kwegridi

Kuhlelo lwe-NAD27, **Ifayela lokushintsha legridi** engxoxweni yohlelo lwamakhoordinethi ibeka ububanzi nobude, amafayela e-GIS nezendlalelo zemephu cishe ngaphakathi kuka-10 cm ye-NAD83 esikhundleni sokuba cishe ngu-20 m:

- **Landa** igridi elisikisela ngesifunda sohlelo (i-NADCON5 ye-United States eqhubekayo, i-NADCON ye-Alaska, i-NTv2 ye-Canada) kusuka ku-cdn.proj.org, iseva yegridi evulekile ye-PROJ. Kuthunyelwa igama lefayela legridi kuphela.
- Noma **Engeza ifayela legridi…** osinalo: i-NTv2 (`.gsb`) noma igridi ye-PROJ GeoTIFF (`.tif`), kuya kuma-20 MB.

Igridi igcinwa kufayela leprojekthi, ngakho ihamba neprojekthi. Isigaba sitshela ukuthi phakathi kweprojekthi kukhona yini ngaphakathi kwegridi: ngaphandle kwayo, akukho kushintsha okusetshenziswa, ngakho sebenzisa igridi emboze isayithi. **Yeka ukusebenzisa igridi** ibuyela ekushintsheni okungaqondile. Yonke inguquko yisinyathelo esisodwa: {{key:Mod+Z}} iyayihlehlisa.

Izendlalelo ze-GIS ezisevele eprojekthini zihlala lapho zikhona uma igridi lishintsha; zingenise futhi ukuze uzibeke ngegridi. Amakhoordinethi weprojekthi awakaze ahambe.

## Okuhlolwe

- Yonke inguquko iqhathaniswe ne-PROJ (pyproj 3.7.1 ne-PROJ 9.5.1), ilabhulali yamakhoordinethi amaningi ezinhlelo ze-GIS ayisebenzisayo, kumahlelo angaphezu kuka-330: i-state plane ngamafidi wesivivinyo sase-US nangamafidi, i-UTM enyakatho nesingatha, i-Lambert-93, i-British National Grid, i-GDA2020 MGA, i-New Zealand Transverse Mercator kanye ne-web Mercator, phakathi kwawo. Ama-easting nama-northing ahambisana ne-1 cm ngokushintsha kwedatum okufanayo (iningi lingaphansi kakhulu kwe-1 mm), nezibalo zeprojekshini zihambisana nezincazelo ze-PROJ ngo-1 cm.
- Amafayela e-`.prj` abhalwe yi-PROJ ngazo zombili izindlela ezivamile (ESRI ne-OGC) afundwe emuva kumahlelo angu-105: angu-208 kwangu-210 afanana nekhodi yawo ye-EPSG ngqo, kanti amabili kwenye indlela enezibalo ezifanayo ellipsoid efanayo. Amafayela e-`.prj` e-CivilCraft ayawabhalayo afundwa yi-PROJ njengohlelo oluyefanayo. Amafayela e-ESRI `.prj` wamahlelo e-polar stereographic (i-UPS, i-polar yase-Alaska) awakwazi ukufundwa; khetha lawo mahlelo ngekhodi.
- Ububanzi nobude ebhayeni lesimo bahambisana ne-PROJ ku-0.01″ kusiphequluli.
