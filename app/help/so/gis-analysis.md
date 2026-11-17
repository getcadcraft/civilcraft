---
title: Falanqee lakabyada GIS
summary: Buffer, overlay (intersect, union, erase, dissolve), spatial join, dooro sifada ku salaysan iyo qiyaas lakabyada GIS ee mashruuca, mid kasta oo ah lakab cusub oo aad ka noqon karto.
keywords: gis, falanqeyn, buffer, overlay, intersect, union, erase, clip, dissolve, spatial join, join, dooro sifada, baaritaan, where, expression, tirakoob, bed, dherer, perimeter, qiyaas, qaybaha dhulka, easement, setback, shapefile, geopackage, miiska sifooyinka
from: a6b2d3f9
---

Marka mashruucu lakabyo GIS leeyahay (eeg [Soo dhoofi xogta GIS](topic:gis-import)), badhanka **Falanqee** ee kooxda GIS (lagu qoro `GISANALYSIS`, `ANALYZE` ama `BUFFER`) wuxuu furaa daaqad leh shan tab. Waxay ku sii jirtaa dhinaca qorshaha, sidaas darteed waxa aad dooratid waxaa lagu muujinayaa qorshaha intaad ku shaqeynayso.

Qalab kasta oo wax soo saara **wuxuu ku daraa lakab cusub** oo wuxuu uga tagaa lakabyada uu akhriyay sida ay ahaayeen. Mid kasta waa hal tallaabo oo dib loo noqdo: {{ui:Ka noqo}} daaqadda (ama Ctrl+Z) wuxuu tirtiraa lakabka cusub. Natiijada u dhoofi sida lakab kasta oo ah [Dhoofi xogta dhismaha dhabta ah ee GIS](topic:gis-export) oo ah shapefile, GeoJSON ama GeoPackage.

Miiska buuxa ee lakab, oo leh habaynta, tafatirka iyo xisaabiyaha goobta, waxa ku jira [Ka shaqee miiska sifooyinka lakabka](topic:gis-table); midabaynta goob ka saaran waxa ku jira [Qaab lakab sifo ku salaysan](topic:gis-symbology).

Wax walba qorshaha ayaa lagu shaqeeyaa, cutubyada mashruuca (fiit ama mitir). Mashruucu had iyo jeer wuxuu ku jiraa nidaam la saadaalin ama maxalli ah, sidaas darteed masaafada 50 waxay ka dhigan tahay 50 fiit ama 50 mitir, weligeed ma aha darajo. Dhererka (z) natiijooyinka lama hayo.

## Buffer

Wuxuu sawiraa aag masaafo la dejiyay oo ku wareegsan qalab kasta, oo ah lakab poligon cusub. Dhibcaha waxay noqdaan goobo, xariiqyadu waxay noqdaan waddo leh dhamaadyo go'an, poligonadu way weynaadaan. Masaafo **taban** ayaa poligonada yareeya (murabbac 100 ku 100 oo lagu yareeyay 5 wuxuu noqdaa 90 ku 90; haddii lagu yareeyo 60 waxba ma harto, daaqaddana way sheegtaa). Masaafada ka qaado goob tiro ah si qalab kasta u helo mid u gaar ah, ama calaamadee **Isku dar dhammaan buffer-yada hal qaab** si aad u milmiso.

Qaybaha go'an waa qaybo toosan oo lagu sawiray dhinaca gudaha ee khadka go'an ee run ah, sidaas darteed buffer-ku wuxuu ka yar yahay wareegga saxda ah dhudhun yar: ku dhawaad 0.6 % aagga habaynta caadiga ah, 0.16 % marka la doorto Fine. Waxa aad cabbirayso oo dhan isticmaal Fine.

## Dul-saar (Overlay)

| Qalabka | Waxa aad hesho |
|---|---|
| Intersect | Qaybaha halka lakabka soo gelinta uu isku kulmo poligonada dul-saarka, mid walba leh goobaha labada lakab. Xariiqyada iyo dhibcaha waa lagu gooyaa poligonada. |
| Union | Labada lakab ee poligon oo midba kan kale gees ahaan u gooyay: qaybaha wadaagga ah waxay leeyihiin goobaha labada lakab, kuwa kale mid lakab keliya (goobaha kale way madhan yihiin). |
| Erase | Poligonada soo gelinta oo laga saaray poligonada dul-saarka. Goobaha waxay ku sii jiraan soo gelinta. Qalab si buuxda loo tirtiray waa la iska tago (guddiga wuu tiriyaa). |
| Dissolve | Wuxuu milmiyaa poligonada taabanaya ama isku dhaafsiinaya, dhammaantood ama hal qaab qiimo kasta oo goob ah. Wuxuu ku daraa `COUNT` iyo `AREA`. |

Magaca goob ay labada lakab leeyihiin waxaa loo hayaa lakabka koowaad, goobta lakabka labaad waxaa lagu qoraa `_2`. Qalabka gudaha hal lakab waa inaysan isku dhaafsiin: meelaha ay isku dhaafsiin yihiin, Union waxay tirinaysaa isku dhaafsiinta labadaba.

## Ku biirinta (Join)

Ku biirinta goobta ee meelaha (spatial join) waxay ku koobiyaysaa sifooyinka lakabka **isha** hal hal ah dhibcaha **bartilmaameedka** ee isku kulma, waxayna siinaysaa lakab cusub oo leh qaabka bartilmaameedka. Dooro goorta ay isku kulmaan: taabanaya ama isku dhaafsiinaya, bartilmaameedka oo ku jira poligon isha gudihiisa, bartilmaameedka oo qabta goobta isha, goobta isha ugu dhow (xadka ikhtiyaari ah), ama goob kasta oo isha ah masaafo gudaheeda.

Marka goobo badan oo isha ah isku mid yihiin waxaad qaadanaysaa sifooyinka midka kowaad (kan ugu dhow, ku biirinta ugu dhow iyo masaafada; `DISTANCE` waa la darayaa), ama **tiri iyaga oo wadar ku samee goobaha tirooyinka**: `COUNT`, iyo `SUM_`, `MEAN_`, `MIN_`, `MAX_` goob tiro kasta. Ka saar calaamadda **Ku hay goobaha bartilmaameedka aan wax la helin** si aad uga tagto kuwaas. Goobaha la biiriyay waxay madhan yihiin meelaha wax aan la helin, daaqaddana way tirisaa kuwa aan la helin.

## Dooro

Qor su'aal ku saabsan sifooyinka ama qaabka, riix **Dooro**, goobaha waxaa lagu sawiraa qorshaha iyo tiradooda, miis, iyo wadarta aagga, dherer ama tirada. Kadib ka dhig lakab u gaar ah, ku weynee ilaa iyaga ama nadiifi xulashada.

| Waxaad qori kartaa | Tusaale |
|---|---|
| Goob magaceeda; isticmaal "xigasho" ama [xidhmo] haddii magaca ku jiro meel bannaan | `VALUE`, `"Lot Number"` |
| Tirooyin, 'qoraal', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (qoraalku ma xisaabiyo xarfaha weyn/yar; `like`-ta, `%` waa xariiq kasta, `_` waa hal xaraf) | `Notes contains 'corner'` |
| `is null`, `is not null` (qiimo madhan waxaa loo tiriyaa null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` iyo xidhmooyin | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Qiimaha qaabka `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Su'aal aan dhammaystirnayn ama magac goob lakabku ma lahan waa la diidaa, iyadoo jumlad sheegta meesha ay ku sugan tahay.

## Qiyaas

Wuxuu muujinayaa wadarta aagga iyo perimeter-ka, dherer ama tirada lakabka, wuxuuna **ku daraa goobo** lakabka: `AREA` iyo `PERIMETER` poligonada, `LENGTH` xariiqyada (dherer qorshaha), `X` iyo `Y` dhibcaha. Goob hore u jirtay ma la qori doono: kan cusub waxa loo magacaabaa `AREA_2`. Tani waa hal tallaabo oo dib loo noqdo. **Tirakoob** wuxuu siinayaa tirada, wadarta, celceliska, ugu yar iyo ugu badan ee goob tiro ah, si ikhtiyaari ah goob kasta oo qiime kale.

:::note
Hubinta ka dambaysa qalabkan waxaa lagu sameeyay gacanta imtixaanka (`node bin/test-civilcraft-gisanalysis.mjs`): tusaale ahaan qaybo dhul ah 100 ku 100 oo hoostooda aag 100 ku 80 ah wuxuu isgoysaa 3,000 oo ku dar 3,000, iyo xariiq dheer 100 oo buffer lagu sameeyay 10 waa 2,000 iyo goobo.
:::
