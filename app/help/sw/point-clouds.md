---
title: Mawingu ya nukta kutoka ndege isiyo na rubani au kichanganuzi
summary: Ukiwa na programu-jalizi ya Mawingu ya nukta, fungua faili ya LAS au LAZ yenye mamilioni ya nukta, itazame yote, isafishe, ipange kuwa ardhi, mimea na majengo, kisha jenge ardhi, kontua na ujazo kutoka humo.
keywords: wingu la nukta, las, laz, ndege isiyo na rubani, photogrammetry, recap, lidar, skani, ardhi, panga, kelele, rundo, ujazo, kata na jaza, kontua, mstari wa mapumziko, eye-dome, orthomosaic, ortho, funika, safu ya ramani, export las, export laz, bana
from: e4a4901f
---

Watu wengi hawahitaji hili, kwa hiyo ni programu-jalizi. Washa {{ui:Point clouds}} katika Mipangilio › Programu-jalizi; kichupo cha {{ui:Point clouds}} kitaonekana kwenye paneli ya kulia. Faili inasomwa kwenye kivinjari chako na kukatwa vigae vinavyohifadhiwa kwenye hifadhi ya kivinjari chako yenyewe (au folda unayochagua). **Hakuna chochote kinachopakiwa.**

:::warning
Kila kitu ambacho kichupo hiki kinaripoti ni namba kutoka data yako, si cheti. Kilijaribiwa kwenye eneo la kubuni, bado si kwenye upimaji halisi wa ndege isiyo na rubani: soma matokeo ya kwanza kwa uangalifu na utuambie utakachokiona. Mtaalamu aliyesajiliwa ndiye anayeamua thamani ya ardhi, kontua na ujazo.
:::

## Fungua wingu

Chini ya {{ui:Open a cloud}} chagua faili ya LAS au LAZ. Kichupo kinaonyesha ina nukta ngapi, mfumo wake wa kuratibu na vipimo, na nafasi ambayo ujenzi unahitaji; bonyeza {{ui:Build the cloud}}. Ujenzi unaweza kusimamishwa na kuendelea kwa {{ui:Resume}} (chagua faili ile ile tena). Faili haibadilishwi kamwe. Faili ya nukta milioni 100 inajengwa ndani ya dakika kwenye kompyuta ya kazi, na inachukua nafasi takriban sawa na ukubwa wa faili.

Chini ya {{ui:Clouds on this computer}} unafungua au kuondoa wingu. {{ui:Keep clouds in a folder…}} (Chrome, Edge na programu ya Studio) huweka vigae kwenye folda unayochagua, kwa mfano folda ya mawingu ya CadCraft kwenye Documents, ili wingu la GB 10 lisilazimike kutoshea kwenye hifadhi ya kivinjari; mawingu yaliyojengwa awali yanabaki pale yalipojengwa. Kivinjari kinauliza ruhusa tena baada ya kuanzisha upya: bonyeza {{ui:Use the folder … again}}.

## Itazame

{{ui:Look at it in 3D}} inachora wingu kutoka vigae vibovu na kuliboresha unapokaribia, bila kuzidi {{ui:Most points drawn}} kwa wakati mmoja (milioni 2.5; laki 5 kwenye simu). Paka rangi kwa rangi ya faili yenyewe, urefu, daraja, nguvu ya mwangaza au mabaki. {{ui:Eye-dome lighting}} hutia kivuli kingo kwa kina ili umbo lisomeke bila normali (imezimwa kwenye simu); {{ui:Points shrink with distance}} hufanya nukta za mbali kuwa ndogo na za karibu kuwa kubwa; {{ui:Point size}} huweka ukubwa. Mpango unaonyesha wingu kama raster chini ya mchoro wako, na **huboresha unapokuza** hadi sehemu yake.

## Safisha

Chini ya {{ui:Clean}} chora lasso, kisanduku au poligoni kwenye mpango (au kwenye 3D kutoka mwonekano wa juu: kwenye 3D mstari wa nje unachukuliwa moja kwa moja chini, kwa hiyo ni sahihi tu kutoka juu). Kichupo kinaonyesha nukta ngapi ziko ndani **kabla** ya kutumia: {{ui:Delete these points}}, {{ui:Change their class}}, {{ui:Restore deleted points}} au {{ui:Crop to this boundary}}. {{ui:Undo}} na {{ui:Redo}} hupitia kumbukumbu ya mabadiliko; faili yenyewe haibadilishwi kamwe. {{ui:Noise filter…}} huweka alama kwenye nukta zilizopotea kama nukta za chini (daraja 7) au kelele ya juu (daraja 18).

## Panga

{{ui:Find the ground}} inafanya kazi kigae kwa kigae na kuweka alama ardhi (daraja 2) na nukta za chini; uvumilivu ni 0.15 m, au 0.08 m ukiwa na swichi ya kiwango cha upimaji. Inaripoti mishono ya vigae isiyolingana. {{ui:Classify vegetation and buildings}} kisha huweka alama mimea ya chini, ya kati na ya juu pamoja na majengo, kutokana na urefu juu ya ardhi na jinsi maeneo ya jirani yalivyo tambarare. Hakuna ujifunzaji wa mashine, kwa hiyo banda lenye paa tambarare chini ya miti linaweza kukosewa: liangalie.

## Ardhi, kontua, mistari ya mapumziko

{{ui:Build ground}} hutengeneza ardhi iliyopo kutoka nukta za ardhi na kuiongeza kwenye mradi kwa njia ile ile ya kuingiza LAS (hatua moja ya kutendua). Kisha inalinganisha nukta nayo: wastani, RMS, asilimia ya 95, sehemu iliyo ndani ya uvumilivu, na sehemu kumi zinazotofautiana zaidi, kila moja ikiwa na {{ui:Go there}}. Kupaka rangi kwa {{ui:Residual}} kunaonyesha mahali ardhi na wingu havikubaliani.

**Mstari wa mapumziko** (ukingo, mtaro au juu ya benki) huchaguliwa kwenye wingu: {{ui:Pick a breakline on the cloud}} kwenye mwonekano wa 3D huchukua nukta iliyo karibu zaidi inayochorwa kwa kila bofya, na {{ui:Pick a breakline in the plan}} huchukua nukta iliyo karibu zaidi ya wingu (ardhi kwanza) chini ya kila bofya; bofya mara mbili au bonyeza Enter kumaliza mstari. {{ui:Build ground}} inayofuata inautumia. {{ui:Show contours}} huchora kontua juu ya wingu kwenye picha ndogo na kuweka muda wa kontua wa mradi.

## Ujazo

{{ui:Stockpile volume…}} huhesabu ujazo wa uso ulio juu ya msingi ndani ya mpaka unaouchora. Chora mpaka kwenye ardhi tambarare kuzunguka rundo na uchague msingi: nukta ya chini kabisa ya mpaka, ndege, msingi laini uliopinda, uso unaopita kwenye mpaka, au kiwango unachoandika. Kwenye ardhi yenye mteremko au iliyopinda tumia ndege au msingi uliopinda; nukta ya chini kabisa husomeka juu sana. Nukta za mpaka zinazosimama juu kuliko nyingine (mti kwenye mstari) zinaachwa nje ya msingi. {{ui:Flight to flight}} hutoa kata na jaza kati ya mawingu mawili. Zote mbili zinaweza kuhifadhiwa kama CSV.

## Orthomosaic

Chini ya {{ui:Orthomosaic (picture from above)}} chagua orthomosaic ya ndege isiyo na rubani pamoja na faili yake ya dunia na `.prj` ikiwa ina: GeoTIFF, au PNG au JPEG. Inakuwa **safu ya ramani** ya mradi, kwa hiyo mpango unaionyesha chini ya mchoro wako, na mwonekano wa 3D (rangi {{ui:Map}}) unaipaka juu ya ardhi uliyojenga, kwa hiyo jenga {{ui:Build ground}} kwanza. Kichupo kinaonyesha wingu kiasi gani picha inafunika, na kinaonya ikiwa haifuniki chochote: sababu ya kawaida ni mfumo tofauti wa kuratibu, kwa hiyo toa pia faili ya `.prj`. Usipokuwa na `.prj`, programu inauliza kuratibu ziko wapi. Picha inahifadhiwa ndani ya faili ya mradi; GeoTIFF zaidi ya MB 200 inakataliwa, na mosaic kubwa sana hupunguzwa hadi megapiksel 16, kwa hiyo kwa upimaji mkubwa kata mosaic kwenye eneo kwanza.

## Hamisha

{{ui:Export}} huandika wingu lililosafishwa na kupangwa kama faili mpya (nukta zote, madaraja safi, au ardhi pekee). Chini ya {{ui:File type}} chagua:

- **LAS 1.4 (haijabanwa)**: umbizo la nukta 6, au 7 pamoja na rangi.
- **LAZ (imebanwa)**: nukta zile zile zilizobanwa bila kupoteza, kwa hiyo kila nukta inarudi ikiwa sawa kabisa. Inaandikwa kama umbizo la nukta 0, au 2 pamoja na rangi, kwenye faili ya LAS 1.4. Kwenye eneo la kubuni la mita 300, LAZ ilikuwa karibu sehemu moja ya tano ya ukubwa wa faili ya LAS 1.4. Umbizo la LAZ 0 na 2 linashikilia madaraja 0 hadi 31 pekee: nukta yenye daraja kubwa zaidi inakataliwa kwa ujumbe, kwa hiyo hamisha wingu hilo kama LAS 1.4.

LAZ imeandikwa na kibanaji cha CadCraft chenyewe, kilichotengenezwa kutoka vipimo vilivyochapishwa vya LAZ. Tumekagua kwamba kisomaji chetu na visomaji viwili huru vya LAZ (laz-perf, ambayo programu hutumia kufungua faili za LAZ, na laspy pamoja na lazrs) vinasoma kila nukta ikiwa sawa kabisa, na kwamba faili za LAZ zilizotengenezwa na laspy zinatoka zikiwa zinafanana baiti kwa baiti pale tunapoandika upya nukta zao. Programu nyingine bado hazijajaribiwa, kwa hiyo ikiwa moja haitafungua faili, tuambie ni ipi.

Kivinjari kikiweza kuandika faili kadiri kinavyoendelea, unachagua faili kwanza na wingu kubwa sana linaandikwa humo kigae kwa kigae badala ya kukusanywa kwenye kumbukumbu; vinginevyo faili inakusanywa na kupakuliwa, jambo ambalo ni sawa hadi megabaiti mia chache.

## Isichofanya

Inasoma LAS na LAZ pekee (E57, PLY na PCD bado hazijaunganishwa kwenye kichupo hiki, na faili kadhaa za safari moja hazijaunganishwa), haibadilishi makadirio ya wingu (mfumo na mita za mradi zinachukuliwa), haisomi faili za RCP au RCS za Autodesk, haitengenezi uso kutoka picha, na haitafuti nguzo, kingo au mabomba yenyewe.
