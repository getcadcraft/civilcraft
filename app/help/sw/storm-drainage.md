---
title: Hesabu mitiririko ya dhoruba, ukubwa wa mabomba na mstari wa daraja la majimaji
summary: Chora maeneo yanayomwaga kwenye kila muundo, jumlisha mitiririko kupitia mtandao kwa mbinu ya rational, pima mabomba kwa mlinganyo wa Manning, na uone mahali mstari wa daraja la majimaji unapojaa au kufikia uso.
keywords: mifereji ya dhoruba, eneo la kukusanya maji, eneo la mifereji, mbinu ya rational, mgawo wa kutiririsha maji, muda wa mkusanyiko, ukubwa wa mvua, idf, manning, ukubwa wa bomba, mstari wa daraja la majimaji, hgl, mstari wa daraja la nishati, egl, kujaa kupita kiasi, mafuriko, maji ya mkia
from: e44872ec
---

Mifereji ya dhoruba inafanya kazi kwenye [mtandao wa mabomba](topic:pipe-network): chora mtandao kwanza, kisha maeneo yanayomwaga ndani yake. Kila kitu kinaonekana chini ya **Mifereji ya dhoruba** kwenye paneli ya kulia wakati hakuna kilichochaguliwa.

## Chora eneo la kukusanya maji

1. Bonyeza **Chora eneo la kukusanya maji** chini ya **Mifereji ya dhoruba**.
2. Bonyeza kona za eneo linalomwaga kwenye muundo mmoja. {{key:Enter}} au kubofya mara mbili kunamaliza; {{key:Backspace}} inarudisha nyuma kona ya mwisho, {{key:Esc}} inasimamisha.
3. Eneo linamwaga kwenye muundo ulio ndani yake, la sivyo kwenye ulio karibu zaidi. **Sifa** zake zinafunguka: weka jina lake, **Mgawo wa kutiririsha maji C** (sehemu ya mvua inayotiririka, 0 hadi 1), **Muda wa mkusanyiko** kwa dakika, na muundo gani ambao **Unamwaga kwenye**.

**Chora eneo jingine** kwenye Sifa zake linaanza lifuatalo. Bonyeza ndani ya eneo kwenye mpango ili kulichagua; {{key:Delete}} inaliondoa. Kila mabadiliko ni hatua moja: {{key:Mod+Z}} inayatendua.

## Weka dhoruba ya usanifu

Ukubwa wa mvua ni i = a ÷ (tc + b) kwa nguvu ya c, kwa inchi kwa saa kwa mradi wa futi, na milimita kwa saa kwa mradi wa mita. Linganisha **Ukubwa a**, **b** na **c** na mkunjo wako wa ukubwa-muda-marudio (IDF) kwa kipindi cha kurudia unachobuni.

:::warning
Mkunjo wa awali wa ukubwa, Manning n (0.013) na hasara ya makutano (0.5) ni vishikilia nafasi, si kiwango. Viweke kutoka data yako ya mvua na vigezo vyako vya usanifu.
:::

- **Muda mfupi zaidi wa mkusanyiko**: hakuna bomba linalohesabiwa kwa muda mfupi zaidi ya huo (dakika 10 kuanzia).
- **Manning n**: ukali wa mabomba.
- **Hasara ya makutano**: kichwa kinachopotea kwenye kila muundo, kama sehemu ya kichwa cha kasi V²/2g cha bomba linalotoka.
- **Kiwango cha maji kwenye mtoko**: maji ya mkia, pale bomba la mwisho linapomwaga. Iache tupu mtoko ukiwa huru.

## Mitiririko inavyojumlishwa

Kila bomba linabeba kila eneo lililo juu yake. Q = C × i × A, ambapo C × A inajumlishwa kupitia mtandao, na i ni ukubwa kwenye muda mrefu zaidi wa mkusanyiko wa maji yanayofika: muda wa eneo lenyewe, au muda kutoka eneo la juu pamoja na muda wa kusafiri kupitia mabomba (urefu ÷ kasi ikijaa). Q iko kwa futi za ujazo kwa sekunde (A kwa ekari) au mita za ujazo kwa sekunde (A kwa hekta).

## Pima mabomba

Jedwali chini ya **Mitiririko na mistari ya daraja** linaonyesha, kwa kila bomba, mtiririko, kinachobeba likijaa kwenye mteremko wake, kasi, daraja la majimaji juu na chini yake, na kina kinachotiririka.

**Pima mabomba kwa mitiririko hii** inampa kila bomba ukubwa wa kawaida mdogo zaidi unaobeba mtiririko wake kwenye mteremko wake (inchi 12 hadi 72, au milimita 300 hadi 1800). Ni hatua moja. Kina cha ndani kinabaki zilipo: ukibadilisha ukubwa, tumia {{ui:Weka kila kina cha ndani kutoka kwenye kanuni}} ili kuweka kifuniko, kisha kagua jedwali tena.

## Soma mistari ya daraja

Mstari wa daraja la majimaji (HGL) unahesabiwa kutoka mtoko kuelekea juu:

- Bomba linalotiririka kwa sehemu ya kujaa lina HGL yake kwenye uso wa maji: kina cha ndani pamoja na kina cha kawaida.
- Maji chini yanapokuwa juu kuliko taji lake, au yanapobeba zaidi ya inavyoweza likijaa, bomba linajaa (surcharged) na HGL yake inapanda kwa mteremko wa msuguano juu ya urefu wake.
- Kwenye kila muundo, HGL ni HGL ya juu ya bomba linalotoka pamoja na hasara ya makutano.
- Mstari wa daraja la nishati (EGL) ni HGL pamoja na kichwa cha kasi.

Bomba linalojaa kikamilifu linaorodheshwa, na vivyo hivyo muundo wowote ambapo HGL iko juu ya ukingo: maji yanafikia uso hapo, na muundo unazungushwa kwa nyekundu kwenye mpango. Chagua bomba au muundo kuona mtiririko, kina, kasi na mistari yote miwili ya daraja kwenye Sifa zake.

## Pitisha dhoruba

Mbinu ya rational inatoa kilele kimoja kwa kila bomba. {{ui:Pitisha dhoruba}} (chini ya matokeo, kwenye Sifa za mtandao) inahesabu dhoruba nzima badala yake: mtiririko wa kila eneo kwa muda, unaopitishwa chini ya mabomba pamoja na muda wake wa kusafiri na hifadhi, na kuongezwa pale yanapokutana.

1. Acha {{ui:Mvua inadumu}} na {{ui:Ukubwa wa mvua}} tupu ili kutumia muda mrefu zaidi wa mkusanyiko na mkunjo wa mvua hapo juu, au andika zako.
2. Bonyeza {{ui:Pitisha dhoruba}}. Jedwali linaorodhesha, kwa kila bomba, mtiririko wa juu zaidi unaoingia na kutoka, kilele cha mtiririko unaotoka kimepungua kiasi gani, sehemu ya uwezo kamili wa bomba inayotumika, na dakika ambayo kilele hutokea.
3. Kila mtoko unapata chati ndogo ya mtiririko kwa muda na {{ui:Pakua hidrografu (CSV)}}.

Eneo linatoa mvua iliyowastani kwa muda wake wa mkusanyiko, kwa hiyo dhoruba fupi kuliko huo inafikia kilele chini kuliko C × i × A. Kila bomba linapitishwa kwa mbinu ya Muskingum–Cunge, kwa kutumia kina cha mtiririko ambacho mbinu ya rational tayari imekipata. Matawi mawili yenye nyakati tofauti za mkusanyiko hayafikii kilele pamoja, kwa hiyo jumla yao iko chini ya jumla ya vilele vyao.

Hii haiigi kujaa kupita kiasi, maji kurudi nyuma (backwater), hifadhi kwenye miundo wala mafuriko. Bomba ambalo kilele chake kilichopitishwa kiko juu ya uwezo wake kamili linaorodheshwa, na maji yake yanapitishwa kana kwamba yanatoshea. Itumie kuona muda na upunguzaji, si kupima bomba. Ni msaada wa hesabu: mhandisi anakagua.

## Imehifadhiwa na mradi

Maeneo na mipangilio ya dhoruba vinahifadhiwa kwenye faili la mradi. Bado havimo kwenye chapisho la PDF la mpango, DWG au DXF, wala LandXML: angalia [Bado hakijajengwa](topic:not-built-yet).
