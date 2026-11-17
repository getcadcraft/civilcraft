---
title: Hlaziya izingqimba ze-GIS
summary: Yenza i-buffer, ukubeka phezulu (intersect, union, erase, dissolve), ukuhlanganisa ngendawo, ukukhetha ngesici nokukala izingqimba ze-GIS kuphrojekthi, ngayinye njengesingqimba esisha ongasihlehlisa.
keywords: gis, ukuhlaziya, buffer, overlay, intersect, union, erase, clip, dissolve, spatial join, join, ukukhetha ngesici, query, where, expression, izibalo, indawo, ubude, perimeter, ukulinganisa, parcels, easement, setback, shapefile, geopackage, ithebula lezici
from: a6b2d3f9
---

Uma iphrojekthi sesinezingqimba ze-GIS (bona [Ngenisa idatha ye-GIS](topic:gis-import)), inkinobho **Hlaziya** eqenjini le-GIS (ibhalwa `GISANALYSIS`, `ANALYZE` noma `BUFFER`) ivula iphaneli enamathebhu amahlanu. Ihlala ivulekile eduze kwephlani, ngakho okukhethwayo kudwetshwa ephlanini ngenkathi usebenza.

Yonke into eyenza okuthile **yengeza isingqimba esisha** futhi ishiya izingqimba eyazifunda njengoba zazinjalo. Ngayinye iyisinyathelo esisodwa sokuhlehlisa: {{ui:Hlehlisa}} kuphaneli (noma Ctrl+Z) isusa isingqimba esisha. Thumela umphumela njenganoma yisiphi isingqimba nge-[Thumela idatha ye-as-built ye-GIS](topic:gis-export) njenge-shapefile, njenge-GeoJSON noma njenge-GeoPackage.

Ithebula eliphelele lengqimba, nokuhlela, nesibali sensimu, likuthebhu [Sebenza nethebula lezici lesingqimba](topic:gis-table); ukunikeza umbala ngensimu kuthebhu [Hlobisa isingqimba ngesici](topic:gis-symbology).

Konke kwenziwa ephlanini, ngamayunithi ephrojekthi (feet noma meters). Iphrojekthi ihlala ohlelweni olunamaprojection noma olwendawo, ngakho ibanga elingu-50 libhekisela ku-50 feet noma ku-50 meters, hhayi ngamadigri. Ukuphakama (z) akugcinwa emiphumeleni.

## Buffer

Idweba indawo yebanga elibekiwe kuzo zonke izinto, njengesingqimba esisha sepholigoni. Amaphoyinti aba yimibuthano, imigqa iba yimikhondo enemiphetho ejikelezayo, amapholigoni ayakhula. **Ibanga elingaphansi kuka-0** lincisha amapholigoni (isikwele esingu-100 by 100 esincishwe nge-5 siba ngu-90 by 90; esincishwe nge-60 asisali lutho, futhi ipaneli iyakutshela lokho). Thatha ibanga kusimu yenombolo ukuze unike yonke into eyayo, noma khetha ibhokisi **Hlanganisa wonke ama-buffer abe yisimo esisodwa** ukuze uwancibilike.

Izingxenye ezigudlile ziyizingcezu ezilula ezidwetshwe ngaphakathi kwesiyingi sangempela, ngakho i-buffer incane kancane kunesiyingi esiqondile: cishe ngo-0.6 % endaweni ngesilungiselelo esijwayelekile, ngo-0.16 % ku-**Okuhle**. Sebenzisa **Okuhle** kunoma yini ozoyilinganisa.

## Overlay

| Ithuluzi | Okuzuzayo |
|---|---|
| Ukuhlangana (intersect) | Izingcezu lapho isingqimba sokufaka sihlangana khona namapholigoni okubekwa phezulu, ngayinye nezimo zazo zombili. Imigqa namaphoyinti ayagudlwa ngamapholigoni. |
| Umanyano (union) | Izingqimba zombili zamapholigoni zinqunywa ngemiphetho yazo ngokuhlangene: izingcezu ezabelwanayo zithwala izimo zazo zombili, okunye konke kuthwala isimo sesingqimba esisodwa (esinye sinezimo ezingenalutho). |
| Ukususa (erase) | Amapholigoni okufaka ngaphandle kwamapholigoni okubekwa phezulu asusiwe kuwo. Izimo zihlala nesokufaka. Isici esisuswe ngokuphelele siyashiywa (ipaneli iyazibala). |
| Ukuncibilika (dissolve) | Ihlanganisa amapholigoni ahlanganayo noma ahlanganayo, wonke noma isimo esisodwa ngenani ngalinye lensimu. Yengeza `COUNT` no `AREA`. |

Igama lensimu elabelwa zombili izingqimba ligcinwa kwesokuqala, nensimu yesibili ibhalwa ngo-`_2`. Izici ezikhona engqimbeni eyodwa akumele zihlanganise, uma zihlanganisa, i-Umanyano ibala ukuhlanganisa kokubili.

## Ukuhlanganisa

Ukuhlanganisa ngendawo kukopisha izici kusingqimba **somthombo** kusici ngasinye **somgomo** esihlangana naso, bese kunikeza isingqimba esisha nezimo zesingqimba somgomo. Khetha ukuthi zihlangana nini: zithinta noma ziyahlangana, umgomo usendaweni yephoyinti kusingqimba somthombo, umgomo ubamba isici somthombo, isici somthombo esiseduze (nomkhawulo ongaba khona), noma noma yisiphi isici somthombo esiphakathi kwebanga.

Uma izici eziningi zomthombo zihambisana, uthatha izici zesokuqala (eziseduze kakhulu, kumahlanganisa aseduze nama-distance; `DISTANCE` iyangezwa), noma **uyazibala futhi uzengeze izinombolo zazo**: `COUNT`, kanye no-`SUM_`, `MEAN_`, `MIN_`, `MAX_` ngensimu ngayinye yenombolo. Ukhiphe ibhokisi **Gcina izici zomgomo ezingathole ukuhambisana** ukuze uzishiye ngaphandle. Izimo ezihlanganisiwe zingenalutho lapho kungahambisani lutho, futhi ipaneli ibala ezingahambisani.

## Khetha

Bhala umbuzo mayelana nezimo noma ukuma, bese ucindezela **Khetha**, bese izici zidwetshwa ephlanini nenani lazo, ithebula, nendawo yonke, ubude noma inani. Bese ungenza zibe yisingqimba sazo, uzisondeze noma ususe ukukhetha.

| Ungabhala | Isibonelo |
|---|---|
| Insimu ngegama; sebenzisa "amagwebu" noma [izikwele] uma igama linezikhala | `VALUE`, `"Lot Number"` |
| Izinombolo, 'umbhalo', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (umbhalo awubheki ukuthi uphezulu noma uphansi; ku-`like`, `%` iyinoma yiluphi uchungechunge kanti `_` inhlamvu eyodwa) | `Notes contains 'corner'` |
| `is null`, `is not null` (inani elingenalutho libalwa njenge-null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` nezibambo | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Amanani okumo `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Umbuzo ongaphelele noma oqamba insimu engaba khona engqimbeni awamukelwa, kuncane isisho esichaza ukuthi kuphi.

## Linganisa

Ibonisa indawo yonke ne-perimeter, ubude noma inani lengqimba, futhi **yengeza izinsimu** kuyo: `AREA` no `PERIMETER` wamapholigoni, `LENGTH` wemigqa (ubude kuphlani), `X` no `Y` wamaphoyinti. Insimu esivele ikhona ayikaze ibhalwe phezulu: eyintsha ibizwa ngokuthi `AREA_2`. Lesi yisinyathelo esisodwa sokuhlehlisa. **Izibalo** zinikeza inani, isamba, inani eliphakathi, okuncane nokukhulu kwensimu yenombolo, ngokuzikhethela ngenani ngalinye lensimu enye.

:::note
Izinhlolo ezingemuva kwalezi zithuluzi zenziwa ngesandla ekuhloleni (`node bin/test-civilcraft-gisanalysis.mjs`): isibonelo, amapaseli angu-100 by 100 ngaphansi kwendawo engu-100 by 80 ahlangana ngo-3,000 plus 3,000, nomugqa ongu-100 ubude owenziwe i-buffer nge-10 ungu-2,000 plus isiyingi.
:::
