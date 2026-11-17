---
title: Bonisa izingqimba zemephu ngaphansi kwepulani
summary: Beka isithombe esinesikhundla somhlaba, amathayili emephu, i-WMS noma i-WMTS noma inkonzo yemephu ngaphansi kwepulani njengesimo sesayithi, ngesethingi yokuxhuma, ukukhanya, ukuhleleka nokuvunywa.
keywords: izingqimba zemephu, isisekelo semephu, isisekelo, ingemuva, i-aerial, i-orthophoto, izithombe, isathelayithi, raster, ifayela lomhlaba, pgw, jgw, tfw, wld, geotiff, isithombe esinesikhundla, xyz, amathayili, slippy map, wms, wmts, getcapabilities, inkonzo yemephu, rest, mapserver, imageserver, usgs, national map, ukuvunywa, ukukhanya
from: 32d7718e
---

Izingqimba zemephu yizithombe ezidwetshwe ngaphansi kwomklamo wakho: isithombe se-aerial nefayela lakhe lomhlaba, noma imephu evela kumaseva ku-inthanethi. Zisesimweni sesayithi esikrinini kuphela: **azikho** emanothini wePDF, ekuthunyelweni kwe-DXF noma i-DWG, noma kubukwa kwe-3D.

Khetha {{ui:Imephu}} eqenjini le-{{ui:GIS}}. Ingxoxo ye-**Izingqimba zemephu** ibala izingqimba zeprojekthi futhi yengeza ezintsha. Izingqimba zemephu zidinga uhlelo lwamakhoordinethi lweprojekthi ([Setha uhlelo lwamakhoordinethi lweprojekthi](topic:coordinate-systems)), ngaphandle kwesithombe lapho ifayela lomhlaba lisebenzisa amakhoordinethi eprojekthi ngokwawo.

## Isethingi yokuxhuma

I-CivilCraft ayikaze icele iseva yemephu lutho uze uvume: {{ui:Izilungiselelo}}, {{ui:CivilCraft}}, **Izingqimba zemephu ezivela ku-inthanethi**: **Ukuvaliwe** (okuqala) noma **Kuvuliwe**.

:::note
Uma kuvuliwe, i-CivilCraft icela amaseva emephu owengezayo izithombe zesifunda esikrinini. Idwebo lakho lihlala kulesi kompyutha; iseva ibona isifunda nekheli lakho le-inthanethi.
:::

Ngenkathi kuvaliwe, izingqimba ze-inthanethi zikhona engxoxweni kodwa zingakhonjiswa ngombala ogqamile, nesizathu, futhi akukho okudwetshwayo noma okucelwayo. Ukuvula iprojekthi enamaseva emephu akuxhumani nawo. Isithombe esivela kufayela sisebenza noma kunjalo. Inkinobho ye-{{ui:Vula Izilungiselelo}} engxoxweni ikuyisa lapho.

## Isithombe esinesikhundla somhlaba (sisebenza ngaphandle kwe-inthanethi)

1. Ku-**Engeza isendlalelo**, gcina i-**Isithombe esinesikhundla somhlaba** bese ukhetha amafayela: isithombe (PNG noma JPEG) **kanye** nefayela laso lomhlaba (`.pgw` ye-PNG, `.jgw` ye-JPEG, noma `.wld`) kanye ne-`.prj` uma likhona. Ungaphonsa wonke amafayela epulanini ndawonye.
2. Uma kungekho `.prj`, i-CivilCraft ibuza ukuthi ifayela lomhlaba lisebenzisa uhlelo oluphi: {{ui:Uhlelo lwephrojekthi}} (oluvame kakhulu), {{ui:Khetha uhlelo…}}, noma, eprojekthini engenalo uhlelo, **Amakhoordinethi eprojekthi**.
3. Isithombe sivela ngaphansi kwepulani futhi {{ui:Lingana}} siyasifaka.

I-RGB GeoTIFF (isithombe se-aerial esigciniwe njenge-GeoTIFF) siqukethe indawo yaso nohlelo lwaso: iyivule yodwa. Isithombe sigcinwa **ngaphakathi kwefayela leprojekthi** (kuze kube ngu-25 MB); esikhulu sinqatshwa ngosayizi waso, ngakho gcina ikhophi encane (amaphikiseli ambalwa, noma i-JPEG).

## Amathayili, i-WMS, i-WMTS namasevisi emephu

Vula **Izingqimba zemephu ezivela ku-inthanethi** kuqala. Bese, ku-**Engeza isendlalelo**:

| Kusuka ku | Okufanele uyinamathisele | Okwenziwa yi-CivilCraft |
|---|---|---|
| Ikheli lethayili | Isifaniso esinezi-`{z}`, `{x}` kanye ne-`{y}` (noma `{-y}`), kanye ne-`{s}` yohlamvu lweseva, isibonelo `https://tile.example.org/{z}/{x}/{y}.png`. Yinike igama kanye nokuvunywa kwayo. | Amathayili ku-web Mercator yesifunda nesikali esikrinini. |
| Iseva ye-WMS | Ikheli leseva, noma isixhumanisi sayo se-GetCapabilities. Khetha {{ui:Thola izingqimba}}, bese isendlalelo. | Isithombe esisodwa sesifunda esikrinini, esicelwa ngekhodi ye-EPSG yeprojekthi uma iseva inikeza yona, kungenjalo ku-web Mercator noma WGS 84. |
| Iseva ye-WMTS | Ikheli leseva, noma i-`WMTSCapabilities.xml` yayo. Khetha {{ui:Thola izingqimba}}, bese isendlalelo nesethi yamathayili. | Amathayili esethi ohlelweni lweprojekthi uma lukhona, kungenjalo ku-web Mercator. |
| Inkonzo yemephu ye-ArcGIS (REST) | Ikheli elibhekela ku-`/MapServer` noma `/ImageServer`. Khetha {{ui:Funda isevisi}}. | Amasevisi we-web Mercator agciniwe adweba ngamathayili awo; abanye bacelelwa isithombe esisodwa sesifunda esikrinini. |

Awukho amaseva alungiselelwe ngaphambili. Izibonelo zomphakathi, zonke ezivela ku-USGS National Map (i-public domain):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Inkonzo yemephu: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (futhi `USGSImageryOnly` kumafoto e-aerial)

Imikhandlu eminingi yamasipala nezigodi ze-GIS zishicilela amaseva wazo we-WMS noma amasevisi emephu; amakhasi wabo we-GIS anikeza ikheli. Iseva ecela ukungena ngemvume noma ukhiye ayisebenzi: i-CivilCraft ayithumeli amagama omsebenzisi, amaphasiwedi noma okhiye.

## Indlela izingqimba ezidwetshwa ngayo

- Izithombe ezisesistimu ehlukile kunaleyo yeprojekthi zigoqwa ziyiswe kuyo: isithombe siyasikwa sibe izingcezu, ngayinye ibekwa ukuze ibe ngaphakathi kwesikhwama sephikseli esisodwa esingu-quarter kwendawo okufanele ibe khona ngokuguqulwa okunembile.
- Amathayili akhethwa ngesifunda nesikali esikrinini: akukaze abe ngaphezu kuka-64 ngombono, angu-6 ngesikhathi esisodwa. Lapho uhamba noma usondeza, izicelo zombono wakuqala ziyakhanselwa. Cishe amathayili angu-200 agcinwa enkumbulweni (akukho okugcinwa kudiski).
- Isithombe se-WMS noma senkonzo yemephu sicelwa lapho ukubuka sekumile; kuze kufike, isithombe sangaphambilini sihlala endaweni yaso.
- Ukuvunywa kwengqimbi ngayinye kubonakala kancane ngaphansi kwesobunxele sepulani.

## Shintsha, hlela nesuse izingqimba

Engxoxweni ingqimbi ngayinye inebhokisi lokukhetha lokubonisa noma lokufihla, isilayidi se-**Ukuqina**, izikhombi zokudweba kwangaphambili (phansi) noma kamuva (phezulu), inkinobho yokuzoomisa (izithombe), nenkinobho yokususa. Isendlalelo sokuqala uhlwini sidwetshwa phansi kakhulu. Ushintsho ngalunye lungesinyathelo sokuhlehlisa esisodwa.

## Lapho isendlalelo singabonisi lutho

Isizathu sibonakala kanye emugqeni wesimo futhi sihlala ngaphansi kwegama lengqimba engxoxweni:

| Umlayezo | Yenza ini |
|---|---|
| Ivaliwe: izingqimba zemephu ezivela ku-inthanethi zivaliwe ezilungiselelweni. | Vula **Izingqimba zemephu ezivela ku-inthanethi**. |
| Idinga uhlelo lwamakhoordinethi lweprojekthi | Setha ngaphansi kwe-{{ui:Amakhoordinethi}}. |
| Iseva ayivumelanga lelikhasi lisebenzise izithombe zayo (CORS), noma alikwazanga ukufinyelela. | Iseva ayivumeli amakhasi ewebhu asebenzise izithombe zayo, noma ayiphumile. Ngemva kokwenqaba kane, i-CivilCraft iyeka ukucela; fihla bese ubonisa isendlalelo ukuze uzame futhi. |
| Iseva ibuyisele 404 … / Iseva ithumele text/xml, hhayi isithombe: … | Ikheli, isendlalelo noma isitayela asilungile, noma umlayezo weseva ukutshela ukuthi ifuna ini. |
| Lesi sendlalelo asinikezwa ohlelweni lweprojekthi, ku-web Mercator noma ku-WGS 84 | Iseva ayikwazi ukudweba lapho i-CivilCraft ingabeka khona. |

## Okuhlolwe

- Izinombolo zamathayili zihlolwe ngokuhlelwa kwamathayili okujwayelekile e-web Mercator; izimpendulo ze-WMS 1.1.1 ne-1.3.0, WMTS namasevisi emephu zifundwe emafayeleni abhalwe ngesandla nasezimpendulweni ezigciniwe ezivela ku-USGS National Map namaseva e-OpenStreetMap ka-terrestris; izicelo ze-WMS 1.3.0 zibeka ububanzi kuqala ngo-EPSG:4326, njengoba umgomo ubala.
- Ukugoqa kuqhathaniswe nokuguqulwa okunembile kephikseli ngephikseli kusetshenziswa izinombolo ze-PROJ: ngaphakathi kuka-0.13 px kumathayili, izithombe ze-WMS nesithombe esingesifunda sekhawunti, esikalini sesayithi nasekukhishweni ekude.
- Isithombe nefayela lomhlaba kanye ne-RGB GeoTIFF ebhalwe yi-GDAL (nge-rasterio) bedwetshwe lapho isimo sabo sikhomba khona, zihlolwe ephikseli ngephikseli kusiphequluli.
- Kusiphequluli, ngokuchema neseva elingeniswe kukhompyutha yokuhlola: amathayili afika kwithayili i-PROJ ibeka kuyo ingqikithi ngayinye, isithombe se-WMS sifika ku-2 px, izicelo ezingu-6 kuphela zisebenza ngesikhathi esisodwa, futhi ngesethingi evaliwe akukho celo elishiya ikhasi. Inkonzo yemephu ye-USGS National Map ekhonjiwe ngenhla nayo yafundwa yadwetshwa ngokuqondile kusiphequluli kanye (amathayili afika adwetshwa, nombhalo wayo wobunikazi wabonakala); amanye amaseva omphakathi afundwa kuphela ezimpendulweni ezigciniwe.
