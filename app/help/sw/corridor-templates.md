---
title: Violezo vya ukanda na violezo vya ardhi
summary: Tengeneza violezo vidogo vinavyotumika tena (ukingo na mfereji wa maji, njia ya watembea kwa miguu, ukuta, mfereji), jenga ukanda kutoka kwao kwa kituo na kushoto na kulia vikitenganishwa, gawa mpangilio wa njia kuwa ukanda kadhaa, na weka tabaka za nyenzo juu ya ardhi.
keywords: kiolezo, violezo, maktaba ya violezo, kutengeneza kiolezo, sehemu ya kawaida, mkusanyiko, mkusanyiko mdogo, vipengele, msimbo wa nukta, hali ya mwisho, daylight, mfereji, ukuta wa kubakiza, ukingo, mfereji wa maji, njia ya watembea kwa miguu, maeneo, safu ya vituo, ukanda kadhaa, ukanda nyingi, kushoto na kulia, kiolezo cha ardhi, udongo wa juu, lami, msingi, kuweka juu, nyenzo, kiasi
from: ce70e58b
---

**Kiolezo** ni sehemu ndogo ya msalaba unayoichora mara moja na kuitumia tena: nukta zenye umbali wa pembeni, mteremko na misimbo ya nukta, na vipengele vyenye nyenzo. Ukanda unaweza kujengwa kutoka violezo kwa kituo, kila upande ukiwa na violezo vyake vya lami na hali yake ya mwisho, na violezo hivyohivyo vinaweza kuwekwa juu ya ardhi.

:::warning
Violezo vya mfano ni vishika nafasi vya kuanzia navyo. Namba zake hazikutolewa kutoka kiwango chochote au shirika lolote. Mhandisi lazima akague kila kiolezo, na kila thamani unayompa, kabla hakijatumika kwa muundo.
:::

## Fungua violezo

Fungua {{ui:Uso}} › {{ui:Zaidi}} › {{ui:Violezo vya ukanda…}} (au andika {{cmd:TEMPLATES}}). Dirisha lina orodha tatu:

- **Katika mradi huu**: violezo ambavyo ukanda na violezo vya ardhi vya mradi huu vinatumia. Vinahifadhiwa kwenye faili la mradi.
- **Maktaba yangu**: violezo vilivyohifadhiwa kwenye kivinjari hiki na kupatikana kwenye kila mradi. Tumia {{ui:Hifadhi kwenye Maktaba yangu}} kwenye kiolezo cha mradi ili kukihifadhi.
- **Mifano**: njia mbili zenye tabaka, ukingo na mfereji wa maji, njia ya watembea kwa miguu, daylight, mfereji, ukuta wa kubakiza, udongo wa juu chini ya ardhi, na lami juu ya ardhi. Kila kimoja kimewekwa alama "Kwa ukaguzi na mhandisi".

{{ui:Tumia katika mradi huu}} hunakili kiolezo cha maktaba au cha mfano kwenye mradi. {{ui:Hamisha violezo vya mradi huu}} huvihifadhi kama faili la `.cctemplates.json`, na {{ui:Leta faili}} hulisoma kwenye mradi na Maktaba yangu. Tumia faili hilo kushiriki violezo au kuvihamisha kwenda kompyuta nyingine.

## Tengeneza kiolezo

{{ui:Kiolezo kipya}} (au {{ui:Hariri}} kwenye kiolezo cha mradi) hufungua kihariri cha violezo. Chora upande wa kulia, ukitoka kwenye nukta ya kiolezo ya 0,0 kuelekea nje; upande wa kushoto unatumia kiolezo kile kile kuelekea nje kwenda kushoto.

1. Kipe jina na aina: **Lami** (kiolezo kinachofuata kinaambatana mwishoni mwake), **Hali ya mwisho** (kinakutana na ardhi) au **Kiolezo cha ardhi**.
2. Ongeza **thamani**: namba zenye majina kama upana `w` au mteremko `s`. Kisanduku cha namba popote kwenye kiolezo kinakubali namba au jina la thamani; `-t` ni thamani `t` iliyofanywa hasi. Ukanda unaweza kupa kila matumizi ya kiolezo thamani zake, kwa hiyo kiolezo kimoja cha ukingo kinatumika kwa kila urefu wa ukingo.
3. Ongeza **nukta** kwa mpangilio. Kila moja huwekwa kutoka nukta ya awali (au nukta ya 0,0) kwa kizuizi chake:

| Kizuizi | Huweka nukta |
|---|---|
| Umbali wa pembeni kwa mteremko | Umbali wa pembeni kwenda nje na mteremko (kupanda kwa kila urefu; −0.02 ina maana kushuka kwa 2%) |
| Umbali wa pembeni na kupanda | Umbali wa pembeni na kupanda |
| Moja kwa moja juu au chini | Kupanda tu |
| Mteremko wa pembeni hadi ardhini | Kutoka nukta yake kwenda ardhini, kwa uwiano wa ukataji pale ardhi iko juu na uwiano wa ujazaji pale iko chini |
| Hadi ardhini | Umbali wa pembeni, kisha moja kwa moja juu au chini hadi ardhini |
| Ukuta wa kubakiza | Ukuta wa unene uliotoa: kwenye ukataji juu yake hugusa ardhi kwenye uso wa barabara, kwenye ujazaji barabara inapita juu yake na uso wake wa nje unashuka hadi ardhini |

   Weka tiki **Juu** kwa nukta ambazo uso uliokamilika unapita. Nukta ya mwisho ya juu ndipo kiolezo kinachofuata upande huo kinapoanzia. **Lengo** linaruhusu ukanda kuhamisha nukta: umbali wake wa pembeni au mwinuko wake unatoka kwenye mstari.
4. Ongeza **vipengele**: maumbo yaliyofungwa kupitia misimbo ya nukta (`0` ni nukta ya 0,0), kila kimoja na jina, nyenzo na aina. Maeneo yao yanatoa ujazo.

Mchoro unafuata kila mabadiliko kwa kipimo halisi, na orodha chini yake inaonyesha kilicho na tatizo (nukta inayogusa ardhi kabla ya mwisho, thamani ambayo kiolezo hakina, kipengele bila eneo). {{ui:Ongeza kwenye mradi huu}} au {{ui:Hifadhi}} kinaihifadhi, kama hatua moja ya kutendua.

## Jenga ukanda kutoka violezo

Chagua mpangilio wa njia wenye ukanda na, kwenye Sifa zake, washa {{ui:Jenga kutoka violezo kwa kituo}}. Ukanda unaanza na mifano ya njia mbili na daylight pande zote mbili.

- **Maeneo.** Kila eneo linaanza kwenye kituo na kuendelea hadi eneo linalofuata. {{ui:Ongeza eneo}} linaongeza moja; badilisha kituo chake cha kuanzia kwenye kisanduku chake.
- **Kushoto na kulia vikitenganishwa.** Kila upande wa kila eneo una orodha yake ya **Lami**, kutoka mstari wa katikati kwenda nje, na **Hali ya mwisho** yake: daylight, mfereji, ukuta, au kiolezo chochote kinachogusa ardhi. Bila hali ya mwisho, upande unaishia daylight kwenye mteremko wa ukataji na ujazaji wa ukanda. {{ui:Nakili kutoka kushoto kwenda kulia}} hunakili upande mmoja.
- **Thamani na lengo.** Chini ya kila kiolezo kwenye upande, kuna kisanduku kwa kila thamani (tupu = thamani ya kiolezo chenyewe) na, kwa nukta inayochukua lengo, mstari wa sifa au mstari wa ukanda mwingine unaoihamisha.
- **Kutoka na Hadi** vinapunguza ukanda kwenye sehemu ya mpangilio wa njia.

Sehemu za mkato, mistari ya mpango kwa kila msimbo wa nukta, uso uliopendekezwa, uwekaji vigingi na kazi ya ardhi vyote vinafuata. Sifa zinaorodhesha ujazo wa kila kipengele kwa kila upande na eneo (wastani wa maeneo ya sehemu kando ya mstari wa katikati). Superelevation na malengo ya ukingo wa ukanda hayatumiki wakati ukanda unajengwa kutoka violezo.

## Ukanda kadhaa kwenye mpangilio mmoja wa njia

Chini ya **Ukanda kwenye mpangilio huu**, {{ui:Ongeza ukanda}} huongeza ukanda kwenye sehemu iliyobaki ya mpangilio wa njia: ukanda wa kwanza unapewa kituo cha mwisho katikati (au unabakiza wako), na mpya unaanzia hapo pamoja na eneo la mwisho la violezo vya ukanda wa kwanza. Kila ukanda una jina lake, safu ya vituo, violezo na kazi ya ardhi. Izime kwa kisanduku chake cha {{ui:Zimewashwa}}. Safu zikiingiliana, ukanda wa baadaye unasawazisha juu ya ule wa awali.

## Violezo vya ardhi

Kiolezo cha ardhi kinaweka tabaka za kiolezo kwenye ardhi kuanzia nukta yake ya 0,0: tabaka iliyo chini ya nukta ya 0,0 inaingia ardhini (udongo wa juu wa kuondolewa), tabaka iliyo juu yake inakaa juu ya ardhi (msingi na lami kwenye eneo la maegesho). Upana na mteremko havijalishi; ni kina cha kila kipengele juu au chini ya nukta ya 0,0 tu kinachojalisha.

Fungua {{ui:Uso}} › {{ui:Zaidi}} › {{ui:Violezo vya ardhi…}} (au andika {{cmd:TERRAINTEMPLATES}}); kizuizi hicho pia kiko kwenye Sifa za mradi. {{ui:Ongeza kiolezo cha ardhi}} huongeza kimoja chenye mfano wa udongo wa juu. Kwa kila kimoja chagua:

- **kiolezo** (thamani zake zinaweza kubadilishwa kwa kiolezo hiki),
- **ardhi**: ardhi iliyopo au uso uliopendekezwa,
- **umbo** linalokikata: ardhi nzima, kiwanja, jukwaa au mstari wa sifa uliofungwa. Violezo kadhaa vya ardhi vinaweza kutumia maumbo tofauti kwenye ardhi moja.

Kila tabaka inaorodhesha unene wake, eneo la mpango na ujazo. Ujazo ni eneo la mpango likizidishwa kwa unene, unene ukipimwa moja kwa moja chini; eneo linapimwa kwenye gridi, na eneo lililoteremka pia linatolewa. Maumbo yanachorwa kwenye mpango kwenye tabaka C-TOPO-TMPL. Violezo vya ardhi havibadilishi uso uliopendekezwa.

## Nyenzo na kiasi

Kizuizi cha Kazi ya ardhi cha mradi kinaorodhesha **Vifaa kutoka violezo**: kila kipengele cha ukanda na kila tabaka ya kiolezo cha ardhi pamoja na ujazo wake. {{ui:Tuma kwa TakeoffCraft}} huziandika kwenye faili la kiasi baada ya ukataji na ujazaji, kipengee kimoja kila kimoja, katika yadi za ujazo (miradi ya futi) au mita za ujazo.

## Faili

Violezo, maeneo, ukanda wa ziada na violezo vya ardhi vinahifadhiwa kwenye faili la mradi. Mradi usiotumia hata kimoja unahifadhiwa kama ulivyokuwa, na matoleo ya zamani ya CivilCraft yanafungua mradi unaovitumia (yanavipuuza violezo na kujenga mkusanyiko wa ukanda wenyewe).
