---
title: Kubuni njia ya reli
summary: Geuza mstari wa usawa kuwa reli: mpito wa reli (klothoidi, parabola ya ujazo, Bloss, Helmert, nusu-wimbi ya sine, sine), mwinuko wa kona kwenye kila mkunjo pamoja na mwinuko wake wa usawa, upungufu na ziada, mipaka ya mwinuko na jiometri ya njia kama onyo, swichi na njia za kuvuka kwa kituo, mkunjo wa nafasi ya kupita unaopitishwa kando ya mstari, na njia yenye reli, mbao na changarawe iliyojengwa kama ukanda, katika mpango, sehemu, wasifu, 3D na kiasi.
keywords: reli, njia ya reli, reli, treni, metro, tramu, mwinuko wa kona, upungufu wa mwinuko, ziada ya mwinuko, mwinuko wa usawa, mpito, mkunjo wa mpito, klothoidi, parabola ya ujazo, bloss, helmert, nusu-wimbi ya sine, kosine, kipimo, kipimo cha kawaida, kipimo pana, kipimo cha mita, kipimo chembamba, mbao za reli, changarawe, changarawe ndogo, msingi wa njia, ukingo, umbali wa njia, 60E1, 54E1, UIC60, 115RE, 136RE, kasi ya mabadiliko ya mwinuko, swichi, njia ya kuvuka, frog, nambari ya frog, mteremko, mkunjo wima, radius ndogo zaidi, nafasi ya kupita, mkunjo wa nafasi ya kupita, kipimo cha muundo, kipimo cha mzigo, jukwaa, pengo la jukwaa, mwinuko wa kona wa LandXML
from: 99de9745
---

Mstari wowote unaweza kuwa njia ya reli. Mikunjo yake kisha hupata mpito wa reli na mwinuko wa kona (mwinuko wa juu wa reli), na ukanda wake unajengwa kama njia: reli juu ya mbao, juu ya kitanda cha changarawe, zikiwekwa kwenye ardhi kama barabara. Swichi na njia za kuvuka huwekwa kwa kituo, na mkunjo wa nafasi ya kupita unaweza kupitishwa kando ya mstari na kukaguliwa dhidi ya kilichosimama kando ya njia.

Kila nambari hapa chini ni **kishikilia nafasi**, si kiwango. Reli huweka mipaka yake kwa kasi ya mstari, aina ya njia na nchi; ziweke kutoka kiwango cha reli yako. CivilCraft haina jedwali la kitaifa.

## Fanya mstari uwe reli

1. Chagua mstari kisha utafute **Reli** katika {{ui:Sifa}}.
2. Weka alama kwenye **Mstari huu ni njia ya reli**. Kila mabadiliko ni hatua moja ya kutendua.
3. Weka **Kasi ya usanifu** juu ya {{ui:Sifa}} za mstari: ni kasi ya mstari ambayo mwinuko wa kona hukaguliwa dhidi yake. **Treni zenye mwendo wa polepole zaidi** (katika kisanduku cha Reli) ni kasi ambayo ziada ya mwinuko hukaguliwa dhidi yake.

## Mpito

Weka urefu wa ond kwa kila mwisho wa mkunjo katika jedwali la PI (**Ond ya kuingia**, **Ond ya kutoka**), kisha chagua aina yake katika jedwali la mikunjo la kisanduku cha Reli, au **Mpito kwa kila mkunjo**:

| Aina | Mkunjo kando ya mpito |
|---|---|
| Klothoidi | unakua sawasawa (ond ya barabara) |
| Parabola ya ujazo | y = x³ / (6·R·L), na L ikipimwa kando ya tanjenti; mkunjo wenyewe ni mrefu kidogo |
| Bloss | 3u² − 2u³ ya mkunjo kamili (u = sehemu ya urefu): huanza na kumaliza kwa upole |
| Helmert | parabola mbili, 2u² kisha 1 − 2(1 − u)² |
| Nusu-wimbi ya sine | (1 − cos πu) / 2 |
| Sine | u − sin(2πu) / 2π |

Zote isipokuwa parabola ya ujazo hugeuka kwa L / 2R, kama klothoidi. Vituo hufuata urefu halisi. LandXML huhifadhi aina (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Mwinuko wa kona

Andika **Mwinuko wa kona** wa kila mkunjo kwa milimita. Jedwali linaonyesha kwa kila mkunjo:

- **Mwinuko wa usawa** = G·v² / (g·R), ambapo G ni umbali kati ya vituo vya reli (**Vituo vya reli**, yaani kipimo pamoja na upana wa kichwa cha reli isipokuwa uandike wewe). Kwa G = 1500 mm hii ni fomula inayojulikana 11.8·V² / R (V kwa km/h, R kwa m).
- **Upungufu** = mwinuko wa usawa kwa kasi ya mstari − mwinuko wa kona uliotumika.
- **Ziada** = mwinuko wa kona uliotumika − mwinuko wa usawa kwa kasi ya treni zenye mwendo wa polepole zaidi.
- **Mteremko**: mteremko mkali zaidi wa mwinuko wa kona kando ya njia zake, kwa milimita kwa mita.

Mwinuko wa kona hupanda juu ya kila mpito, ukifuata umbo la mkunjo wake: ni wa moja kwa moja kwa klothoidi au parabola ya ujazo, wenye umbo la Bloss kwa Bloss, na kadhalika. Mwisho wa mkunjo usio na mpito hupanda kwenye sehemu ya moja kwa moja iliyo mbele yake, kwa urefu unaohitajika na kikomo cha mteremko wa mwinuko, na hilo hutajwa: mwinuko kisha hubadilika mahali ambapo mkunjo haubadiliki.

**Mwinuko hugeuka kuzunguka** huonyesha reli ipi hubaki kwenye wasifu wa usanifu: **reli ya chini** (ya kawaida), **reli ya ndani**, au **katikati ya njia** (kila reli husogea nusu ya mwinuko). Wasifu wa usanifu hapo ndio juu ya reli.

**Mchoro wa mwinuko** huchora urefu wa kila reli juu ya wasifu kando ya vituo; mwonekano wa wasifu na karatasi za mpango na wasifu hupata kitu hicho hicho kama bendi chini ya wasifu.

## Mipaka ya mwinuko na onyo

**Mwinuko mkubwa zaidi uliotumika**, **Upungufu mkubwa zaidi wa mwinuko**, **Ziada kubwa zaidi ya mwinuko**, **Mteremko mkali zaidi wa mwinuko** na **Mabadiliko ya haraka zaidi ya mwinuko** (mteremko kwa kasi ya mstari, mm kwa sekunde) hukaguliwa kwenye kila mkunjo. Thamani inayozidi kikomo ni onyo katika kisanduku cha Reli na katika paneli ya {{ui:Matatizo}}, pamoja na kikomo na thamani iliyopatikana. Bila kasi ya usanifu, upungufu na kasi ya mabadiliko hayakaguliwi (maelezo yanasema hivyo).

## Njia

Weka **Kipimo** (kipimo cha kawaida 1435 mm, au mipangilio ya awali ya pana, ya mita au chembamba, au yako mwenyewe), **Sehemu ya reli** (60E1, 54E1, 49E1, 115RE, 136RE: vipimo vyao vilivyochapishwa tu), idadi ya **Njia** na **Vituo vya njia**, kisha **Mbao na changarawe**: nyenzo ya mbao, urefu, upana, kina na umbali kati yake; kina cha changarawe chini ya mbao (kwenye reli ya chini), bega, mteremko, umbali ambao juu yake uko chini ya mbao; kina cha changarawe ndogo, ukingo nje ya mwisho wa changarawe, na mteremko wa msingi wa njia kuvuka.

Bonyeza **Jenga njia**. Hili huwasha ukanda wa mstari, uliojengwa kama njia kwenye wasifu wa usanifu: reli na mbao huinama pamoja na mwinuko wa kona, lakini msingi wa njia haufanyi hivyo. Miteremko ya mwanga hushuka kutoka ukingo wa ukataji kwenye ukanda, na miteremko ya kujaza, na njia inashuka kwenye uso uliopendekezwa kama barabara.

- **Mpango**: reli zote mbili za kila njia (tabaka C-RAIL-TRAK) na, kukiwa na zaidi ya njia moja, katikati ya kila njia (C-RAIL-CNTR), kwenye skrini, katika DXF, DWG, PDF na karatasi za mpango na wasifu.
- **Sehemu**: mbao, reli, na chini ya changarawe na changarawe ndogo katika kila sehemu.
- **3D**: reli, kila mbao na kitanda cha changarawe (Onyesha › Njia), pia katika GLB, OBJ na USD.
- **Kiasi**: urefu wa njia, reli (reli zote mbili za kila njia, kando ya mstari wa kila njia), mbao, kitanda cha changarawe na changarawe bila mbao, na changarawe ndogo, kwa wastani wa maeneo ya ncha kati ya sehemu.

## Ukaguzi wa jiometri ya njia

Mbali na mwinuko wa kona, kisanduku cha Reli hukagua mstari wenyewe dhidi ya mipaka mingine sita (yote ni kishikilia nafasi, yote ni yako kuweka):

- **Mteremko mkali zaidi** wa wasifu wa usanifu, kwa milimita kwa mita.
- **Radius ndogo zaidi ya mkunjo wima**, kama kipengele k katika R ≥ k·V² (R kwa mita, V kwa km/h). Mkunjo wima wa parabola wenye urefu L kati ya miteremko miwili una radius ya L ikigawanywa kwa mabadiliko ya mteremko.
- **Mkunjo wima mfupi zaidi**.
- **Radius ndogo zaidi ya mkunjo** katika mpango (0 huzima ukaguzi huu).
- **Upinde au sehemu ya moja kwa moja fupi zaidi**, kama sekunde za safari kwa kasi ya mstari: upinde wa mviringo, au sehemu ya moja kwa moja kati ya mikunjo miwili, fupi kuliko umbali huo hutolewa onyo. 1.8 s ni kipimo kinachojulikana cha "nusu ya kasi kwa km/h, kwa mita".
- **Kasi ya mabadiliko ya upungufu wa mwinuko** kando ya kila mpito, kwa mm kwa sekunde kwa kasi ya mstari.

**Jiometri ya njia** huorodhesha mteremko mkali zaidi uliopatikana na kila mkunjo wima pamoja na radius yake na radius ambayo kasi ya mstari inahitaji. Mkunjo wima unaolala kwenye mpito au kwenye mteremko wa mwinuko hupata maelezo. Bila wasifu wa usanifu au bila kasi ya usanifu, ukaguzi unaohitaji vitu hivyo unaruka na maelezo yanasema hivyo.

## Swichi na njia za kuvuka

Chini ya **Swichi na njia za kuvuka**, bonyeza **Ongeza swichi**. Inawekwa kwenye sehemu ndefu zaidi ya moja kwa moja; weka kwenye jedwali:

- **Kituo cha ncha ya swichi**: mahali swichi inapoanzia kwenye mstari huu.
- **Frog**: nambari ya frog N (1:N). Pembe ya frog ni 2·atan(1 / 2N).
- **Upande**: kushoto au kulia, ukiangalia kuelekea juu ya vituo.
- **Umbali wa njia ya kuvuka** kwa mita: zaidi ya 0, swichi inageuka kuwa njia ya kuvuka hadi njia sambamba umbali huo (swichi mbili na sehemu ya moja kwa moja kati yake).

Jedwali linaonyesha **Mbele** (ncha ya swichi hadi frog), **Radius** ya mkunjo wa kufunga na **Kasi ya kugawanyika** ambayo radius hiyo inaruhusu kwa kikomo chako cha upungufu wa mwinuko bila mwinuko wowote. **Tengeneza njia yake** hugeuza njia ya kugawanyika kuwa mstari wake wenyewe (swichi, mkunjo wa kufunga, kisha moja kwa moja kwenye pembe ya frog) pamoja na mipangilio ile ile ya reli, tayari kurefushwa.

Mpango huchora reli mbili za kugawanyika za kila swichi, mstari wake wa katikati, alama ndogo kwenye ncha ya swichi na kwenye frog, na "1:N" (tabaka C-RAIL-TURN), kwenye skrini na katika DXF, DWG, PDF na karatasi. Mwonekano wa 3D huchora reli za kugawanyika katika kiwango cha njia kuu.

Umbo ni **kishikilia nafasi**: swichi iliyonyooka na mkunjo mmoja wa kufunga kutoka nambari ya frog. Swichi halisi iliyojengwa hufuata kiwango cha reli na mchoro wa mtengenezaji. Onyo: swichi inayotoka nje ya mstari, inayokaa juu ya mkunjo, mpito, mwinuko au mkunjo wima, au inayoingiliana na nyingine; na maelezo wakati kasi ya mstari iko juu ya kasi yake ya kugawanyika.

## Mkunjo wa nafasi ya kupita

Weka alama kwenye **Pitisha mkunjo wa nafasi ya kupita kando ya njia hii**. Chagua **Muhtasari** (maumbo mawili ya kishikilia nafasi, au **Muhtasari wako** ulioandikwa kama nukta moja kwa kila mstari: umbali kutoka katikati ya njia, kisha urefu juu ya juu ya reli, kwa mita), **Urefu wa gari** na **Vituo vya bogi**, na, kama ipo, **Ukingo wa jukwaa** (upande, umbali kutoka katikati ya njia, urefu juu ya reli).

Katika kila kituo muhtasari huinama pamoja na mwinuko wa kona kuzunguka reli ya chini, na hupanuka kwa mkunjo: katikati ya gari husogea ndani kwa b² / 8R, ncha zake nje kwa (L² − b²) / 8R (b ni vituo vya bogi, L ni urefu wa gari, R ni radius hapo, kufuata mpito). Kisanduku kinachora sehemu kwenye sehemu ya moja kwa moja na mahali ilipo pana zaidi, na kinaorodhesha:

- **mkunjo mpana zaidi** na mahali ulipo,
- **vituo vya njia** vilivyowekwa dhidi ya vituo ambavyo mikunjo miwili jirani inahitaji,
- nafasi iliyobaki kwenye **ukingo wa jukwaa**, au kwa umbali gani iko ndani,
- kila mstari wa kipengele, bomba na muundo mwingine, na mstari mwingine wa reli, uliopatikana **ndani ya mkunjo**.

Mstari wenye miinuko hukaguliwa dhidi ya muhtasari katika urefu wake juu ya reli; bila wasifu wa usanifu, au kwa nukta isiyo na mwinuko, hukaguliwa kwenye mpango tu na orodha inasema hivyo. Mpango unaonyesha kingo mbili za mkunjo (tabaka C-RAIL-CLRN) pamoja na msalaba kwenye kila kitu kilicho ndani.

Muhtasari unaotolewa ni **kishikilia nafasi, si kipimo cha reli yoyote**. Andika kipimo cha muundo wa reli yako kabla ya kutegemea matokeo.

## Katika programu nyingine

- **LandXML**: mstari wa reli huandikwa pamoja na mipito yake (spiType) na kizuizi cha `Cant`: kipimo, nukta ya mzunguko, kasi ya mstari, na kituo mahali kila mteremko wa mwinuko unapoanzia na kuishia, pamoja na mwinuko wa kona uliotumika, mwinuko wa usawa na upungufu. Kufungua faili ya LandXML yenye kizuizi cha `Cant` hufanya mstari huo kuwa reli yenye mwinuko huo.
- **IFC**: mstari pamoja na sehemu zake za mwinuko, reli, mbao, changarawe na changarawe ndogo.

## Bado haijajengwa

Swichi katika usafirishaji wa IFC, familia za swichi zaidi ya mkunjo mmoja wa kufunga (swichi zilizopinda, frog za pua inayozunguka, slips, diamonds), kanuni za kipimo cha kinematiki (muhtasari ni umbo lisilobadilika lenye mkunjo tu), nyaya za juu na mawimbi.

**Kiwango gani.** Katika kisanduku cha Reli, "Kiwango cha kutajwa" huchukua Hakuna au Ulaya (UIC na EN). Ukichagua Ulaya, dirisha hutaja hati ambazo mradi wa Ulaya hutaja (EN 13803 kwa vigezo vya mstari, EN 13232 kwa swichi na makutano, EN 15273 kwa vipimo, EN 13848 kwa ubora wa jiometri ya njia) na hutoa kisanduku kwa kila kikomo cha kifungu kinachotoka. Hakuna nambari kutoka kiwango chochote iliyojengwa ndani: mipaka ya mwinuko, upungufu, ziada, mteremko na kasi, jiometri ya swichi na kipimo cha muundo bado ni vishikilia nafasi, na dirisha linasema hivyo. Mhandisi wa reli hukagua kila thamani dhidi ya maandishi ya kiwango chenyewe, na kuandika kifungu kando yake, kabla ya chochote kujengwa. Afrika Kusini na jedwali la AREMA hazipo katika toleo hili.
