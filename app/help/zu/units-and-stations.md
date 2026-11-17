---
title: Iyunithi, iziteshi nefomethi zezinombolo
summary: Amaprojekthi amafidi namamitha, indlela okubhalwa ngayo nokuthayipha ngayo iziteshi, amagredi, ama-side slope, ama-bearing, izindawo, amavolumu nosayizi bamapayipi, nokuthi ukushintsha iyunithi kwenzani.
keywords: thayipha ubude, izibalo, isibalo, isamba, ingxenye, amafidi namaintshi, amafidi aseMelika, iyunithi, amafidi, amamitha, metric, imperial, ifomethi yeziteshi, ukuhlelwa kweziteshi, igredi, iphesenti, side slope, h:v, ibheringi, amayadi ayiqhubu, idayamitha
from: 0b9b5b6b
---

## Iyunithi yephrojekthi

Iphrojekthi ingeyamafidi e-**US** noma amamitha (**Iyunithi** ku-left panel). Yonke i-coordinate, ukuphakama, ubude nesiteshi ephrojekthini kusekuleyo yuniti.

:::warning
Ukushintsha **Iyunithi** kushintsha amalebula, ifomethi yeziteshi, okuzenzakalelayo nokuthi amafayela abhalwa kanjani. **Akuguquli** noma yisiphi isibalo. Isayithi elilinganiswe ngamafidi bese lishintshelwa kumamithaligcina izinombolo ezifanayo, manje ezifundwa njengamamitha. Ibha yesimo ithi "Units are now metres. Coordinates were not converted." Setha iyunithi ihambelane nedatha yakho ngaphambi kokuklama.
:::

Okuncike eyunithini:

| | US feet | Metres |
|---|---|---|
| Ifomethi yeziteshi | `12+34.56` (iziteshi ezi-100 ft) | `1+234.567` (iziteshi ezi-1000 m) |
| Izikhala zekhonthuwa ezitholakalayo | 0.25 kuya ku-20 ft | 0.1 kuya ku-10 m |
| Indawo | sq ft | sq m |
| Ivolumu | cu yd | cu m |
| Idayamitha yepayipi nesakhiwo | amaintshi | amamilimitha |
| Umsebe wejika ozenzakalelayo | 100 ft | 30 m |
| Amamaki wokuhlelwa kweziteshi epulanini | njalo ngo-50 ft, amalebula njalo ngo-100 ft | njalo ngo-20 m, amalebula njalo ngo-100 m |
| Izikali zokukhishwa | 1" = 5' kuya ku-1" = 1000' | 1:50 kuya ku-1:10000 |
| Iyunithi yomugqa ye-LandXML | USSurveyFoot | meter |

Iphrojekthi entsha iqala ngamafidi, noma ngamamitha uma iyunithi yobude ekhethwe ngenkanyezi ku-{{ui:Izilungiselelo}} › {{ui:Okujwayelekile}} › {{ui:Iyunithi}} ingeyemethrikhi. Uhlu lwe-**Iyunithi** lubonisa iziyunithi ezivuliwe lapho, nalezo zephrojekthi kuphela. Uma kukhona iyunithi yendawo noma yevolumu ekhethwe lapho (ama-acre, ama-hectare, ama-acre-feet …), izindawo namavolumu ibhalwa ngayo esikhundleni sekholomu engenhla. Bheka [Iyunithi, izinombolo ezithayiphiwe nohlu lweyunithi](common:unit-lists).

Lapho uvula i-LandXML, iphrojekthi ithatha iyunithi yefayela. Ifayela ngamafidi angamafidi amazwe ngamazwe livula njengephrojekthi yamafidi; izinombolo azishintshwa.

## Ukuthayipha ubude nezibalo

Noma yibhokisi elamukela ubude noma ukuphakama lifunda okungaphezu kwenombolo elula: cindezela {{key:Enter}} bese ibhokisi liveza umphumela ngeyunithi yephrojekthi.

| Uthayipha | Kuphrojekthi yamafidi | Kuphrojekthi yamamitha |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | ubude obufanayo ngamamitha |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | ngamafidi | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, nezinye ngamafidi aseMelika ayisisekelo | ubude obufanayo ngamamitha |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | isamba, ngamafidi | isamba, ngamamitha |

Yonke iyunithi yobude etafuleni elabelwanayo iyasebenza, ngosayizi wayo oqondile: amafidi ephrojekthi ayi-US survey feet, ngakho i-`10 US ft` ingu-10 kanti i-`3 ch` (i-chain yamafidi ayisisekelo) ingu-197.9996. Sebenzisa `+ - * /` nezibambi, kanye ne-`abs`, `round`, `ceil` kanye ne-`floor`. Ichashazi elibhalwe ebudeni liyingxenye yalo (`24'-6"`, `6-1/2`); uma kukhona izikhala ozungeze ngazo, liyakhipha (`24' - 6"` = 23.5 ft). Inombolo engenalutho iphindaphinda noma ihlukanise ubude, futhi iba ubude ngeyunithi yephrojekthi uma ingezwa kuwo. Uma i-CivilCraft ingakwazi ukufunda okuthayiphile, ibhokisi liyamakwa futhi ibha yesimo ithi ikuphi.

Iziteshi azisona izibalo: i-`10+00` ebhokisini leziteshi iyisiteshi 10+00. Amagredi ngamaphesenti, izinombolo zamaphoyinti nezincazelo zifundwa njengoba zinjalo.

## Iziteshi

Isiteshi ibanga elisemgqeni womzila, ibhalwa ngophawu lokuhlanganisa:

- Amafidi: ingxenye engaphambi kwe-plus ingamakhulu amafidi. `12+34.56` ingu-1,234.56 ft.
- Amamitha: ingxenye engaphambi kwe-plus inginkulungwane zamamitha. `1+234.567` ingu-1,234.567 m.
- Iziteshi ezinegethivu zigcina uphawu ngaphambili: `-0+50.00`.

Noma kuphi lapho uthayipha isiteshi (**Isiteshi sokuqala**, **Isiteshi** se-PVI), ungathayipha ngophawu lokuhlanganisa (`12+34.56`) noma njengenombolo elula (`1234.56`). Izikhala ziyanyanyeka.

## Amagredi namathambeka

- **Amagredi** (amaphrofayili, amapayipi, amathambeka emigqa nensimbi) angamaphesenti: `+1.25%` ukhuphuka ngokuya kusiteshi, `-0.50%` wehla.
- **Ama-side slope** (ukusika nokugcwalisa kwe-pad, nokusika nokugcwalisa kwe-corridor) angokuvundlile kuya ohlangothini: `3` kusho 3 : 1, okusho amathathu ngokuvundlile ngokukhuphuka noma ukwehla kwesisodwa.
- **K** yejika elithi phezulu-phansi ingubude bayo ihlukaniswe ngoshintsho lwegredi ngamaphesenti.

## Ama-bearing nama-engle

Ama-bearing ayi-quadrant bearing ngamadigri, amaminithi namasekhondi: `N 63°12'05" E`. Ama-deflection ejika (Δ) asebenzisa amadigri, amaminithi namasekhondi afanayo, nokuthi "left" noma "right".

## Ama-offset

Ama-offset kumzila ayizinkonjana ezisongelana nawo, amakwa **L** (kwesobunxele) noma **R** (kwesokudla) ngokubheka ukukhuphuka ngesiteshi.

## Ukubonisa izinombolo

- Ama-coordinate nokuphakama kubonisa izinhlamvu ezi-2 zamadesimali emapanelini nakwe-status bar (ezi-3 kwephoyinti lokuhlola elikhethiwe).
- Izindawo namavolumu ahlukaniswa ngezinkulungwane: `128,250 sq ft`, `454.9 cu yd`.
- Ama-coordinate awahlukaniswa neze, ukuze akwazi ukukopishwa njengoba enjalo.

## Ama-coordinate

I-CivilCraft isebenza endizeni eyisicaba: easting ngakwesokudla, northing ngaphezulu. Umsebenzi wedizayini uhlala wenziwa ku-projected coordinates (state plane, UTM noma i-local grid). Ungatshela i-CivilCraft ukuthi zisesimweni sini sohlelo lwe-coordinate, nokuthi ziyigridi, ground noma local coordinates; khona-ke ibonisa i-latitude ne-longitude futhi ibeka amafayela e-GIS nezendlalelo zemephu, kodwa ayiguquli iyunithi noma ihambise ama-coordinate ngokwayo. Bheka [Setha uhlelo lwama-coordinate lweprojekthi](topic:coordinate-systems) kanye [Ama-coordinate womhlaba nasendaweni](topic:ground-and-local-coordinates). Amanani amakhulu ohlelo lwe-state plane (izigidi zamafidi) ayamukelekile; i-CivilCraft isebenza ngokuhlobene nesayithi ngaphakathi ukuze igcine ukunemba.
