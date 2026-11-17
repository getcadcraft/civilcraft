---
title: Chambua tabaka za GIS
summary: Kuzunguka eneo (buffer), kuweka juu (intersect, union, erase, dissolve), kuunganisha kwa nafasi (spatial join), kuchagua kwa sifa na kupima tabaka za GIS katika mradi; kila moja inaunda tabaka jipya unaloweza kulitendua.
keywords: gis, uchambuzi, buffer, overlay, intersect, union, erase, clip, dissolve, spatial join, join, chagua kwa sifa, hoji, where, usemi, takwimu, eneo, urefu, mzingo, pima, viwanja, haki ya kupita, nafasi ya kurudi nyuma, shapefile, geopackage, jedwali la sifa
from: a6b2d3f9
---

Mara tu mradi unapokuwa na tabaka za GIS (tazama [Ingiza data ya GIS](topic:gis-import)), kitufe cha **Chambua** katika kikundi cha GIS (kinachoandikwa `GISANALYSIS`, `ANALYZE` au `BUFFER`) hufungua paneli yenye vichupo vitano. Paneli hubaki wazi kando ya mpango, hivyo unachokichagua kinachorwa kwenye mpango wakati unafanya kazi.

Kila zana inayotengeneza kitu **huongeza tabaka jipya** na huacha tabaka ilizosoma kama zilivyokuwa. Kila moja ni hatua moja ya kutendua: {{ui:Tendua}} kwenye paneli (au Ctrl+Z) huondoa tabaka jipya. Hamisha matokeo kama tabaka lolote kwa kutumia [Hamisha data ya as-built kwa GIS](topic:gis-export) kama shapefile, GeoJSON au GeoPackage.

Jedwali kamili la tabaka, lenye kupanga, kuhariri na kikokotoo cha sehemu, liko katika [Fanya kazi na jedwali la sifa la tabaka](topic:gis-table). Kupaka rangi kwa sehemu kuko katika [Mtindo wa tabaka kwa sifa](topic:gis-symbology).

Kila kitu kinafanywa kwenye mpango, katika vitengo vya mradi (futi au mita). Mradi daima uko katika mfumo wa ramani au wa ndani, kwa hiyo umbali wa 50 unamaanisha futi 50 au mita 50, si digrii kamwe. Urefu (z) haubakizwi katika matokeo.

## Buffer

Huchora eneo la umbali uliowekwa kuzunguka kila kipengele, kama tabaka jipya la poligoni. Nukta zinakuwa duara, mistari inakuwa ukanda wenye ncha za mviringo, poligoni zinakua. **Umbali hasi** unapunguza poligoni (mraba wa 100 kwa 100 ukipunguzwa kwa 5 unakuwa 90 kwa 90; ukipunguzwa kwa 60 hakuna kilichobaki, na paneli inasema hivyo). Chukua umbali kutoka sehemu ya namba ili kila kipengele kipate wake, au weka alama **Unganisha mizunguko yote kuwa umbo moja** ili kuziunganisha.

Sehemu zilizozunguka ni vipande vilivyonyooka vilivyochorwa ndani ya mkunjo halisi, kwa hiyo buffer ni ndogo kidogo kuliko duara halisi: takriban 0.6 % kwa eneo katika mpangilio wa kawaida, 0.16 % katika Fine. Tumia Fine kwa chochote utakachopima.

## Overlay

| Zana | Unachopata |
|---|---|
| Intersect | Vipande ambapo tabaka la ingizo linakutana na poligoni za juu, kila kimoja kikiwa na sehemu za zote mbili. Mistari na nukta zinakatwa kulingana na poligoni. |
| Union | Tabaka zote mbili za poligoni zikikatwa kando ya mipaka ya kila moja: vipande vilivyoshirikiwa vina sehemu za tabaka zote mbili, vilivyobaki vina sehemu za tabaka moja (sehemu za nyingine ni tupu). |
| Erase | Poligoni za ingizo baada ya kuondoa poligoni za juu. Sehemu zinabaki na ingizo. Kipengele kilichofutwa kabisa kinaachwa nje (paneli inavihesabu). |
| Dissolve | Inaunganisha poligoni zinazogusana au kuingiliana, zote au umbo moja kwa kila thamani ya sehemu. Inaongeza `COUNT` na `AREA`. |

Jina la sehemu ambalo tabaka zote mbili zinalo linabakizwa kwa tabaka la kwanza, na la tabaka la pili linaandikwa kwa `_2`. Vipengele ndani ya tabaka moja visipaswe kuingiliana: pale vinapoingiliana, Union inahesabu mwingiliano kwa pande zote mbili.

## Join

Spatial join inanakili sifa kutoka tabaka la **chanzo** kwenda kila kipengele **lengwa** kinachokutana nacho, na inatoa tabaka jipya lenye maumbo ya lengwa. Chagua wakati wanapokutana: wanagusana au kuingiliana, lengwa likiwa ndani ya poligoni ya chanzo, lengwa likishikilia kipengele cha chanzo, kipengele cha chanzo kilicho karibu zaidi (kwa kikomo cha hiari), au kipengele chochote cha chanzo ndani ya umbali.

Vipengele kadhaa vya chanzo vinapolingana, unachukua sifa za cha kwanza (kilicho karibu zaidi, kwa miunganisho ya karibu zaidi na ya umbali; `DISTANCE` inaongezwa), au **unavihesabu na kujumlisha sehemu zao za namba**: `COUNT`, na `SUM_`, `MEAN_`, `MIN_`, `MAX_` kwa kila sehemu ya namba. Ondoa tiki ya **Weka vipengele lengwa visivyopata mlingano** ili kuviacha nje. Sehemu zilizounganishwa ni tupu pale ambapo hakuna kilicholingana, na paneli inahesabu zisizolingana.

## Chagua

Andika swali kuhusu sifa au umbo, bonyeza **Chagua**, na vipengele vinachorwa kwenye mpango pamoja na idadi yake, jedwali na jumla ya eneo, urefu au namba. Kisha vifanye kuwa tabaka lao wenyewe, vikuze au ondoa uteuzi.

| Unaweza kuandika | Mfano |
|---|---|
| Sehemu kwa jina; tumia "nukuu" au [mabano] ikiwa jina lina nafasi | `VALUE`, `"Lot Number"` |
| Namba, 'maandishi', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (maandishi hayajali herufi kubwa au ndogo; katika `like`, `%` ni mfululizo wowote na `_` ni herufi moja) | `Notes contains 'corner'` |
| `is null`, `is not null` (thamani tupu inahesabiwa kama null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` na mabano | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Thamani za umbo `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Swali ambalo halijakamilika au linalotaja sehemu ambayo tabaka halina linakataliwa kwa sentensi inayoonyesha wapi lilipokosea.

## Pima

Inaonyesha jumla ya eneo na mzingo, urefu au idadi ya tabaka, na **inaongeza sehemu** kwake: `AREA` na `PERIMETER` kwa poligoni, `LENGTH` kwa mistari (urefu wa mpango), `X` na `Y` kwa nukta. Sehemu iliyopo tayari haiandikwi juu; mpya inaitwa `AREA_2`. Hii ni hatua moja ya kutendua. **Takwimu** inatoa idadi, jumla, wastani, kiwango cha chini na cha juu cha sehemu ya namba, kwa hiari kwa kila thamani ya sehemu nyingine.

:::note
Hesabu zinazosimamia zana hizi zinafanywa kwa mkono katika jaribio (`node bin/test-civilcraft-gisanalysis.mjs`): kwa mfano, viwanja vya 100 kwa 100 chini ya eneo la 100 kwa 80 vinaingiliana kwa 3,000 pamoja na 3,000, na mstari wa urefu wa 100 uliozungushwa kwa 10 ni 2,000 pamoja na duara.
:::
