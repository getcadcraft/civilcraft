---
title: Kagua mchoro wa upimaji unapoingizwa
summary: Soma viwango vilivyoandikwa kama maandishi au kwenye sifa za block kama nukta za upimaji, na kagua DWG au DXF kwa vipimo visivyo sahihi, kukosekana kwa mfumo wa kuratibu, asili iliyo mbali, kontua tambarare, viwango vya ajabu na nukta zilizorudiwa kabla ya kujenga ardhi kutoka kwake.
keywords: ukaguzi wa upimaji, ukaguzi wa uingizaji, viwango vya upimaji, viwango vya nukta, viwango kama maandishi, sifa, vipimo, mfumo wa kuratibu, mbali na asili, kontua kwa sifuri, thamani zilizo mbali, matatizo, mbunifu wa mandhari, mchoro wa upimaji
from: d46acd24
---

Mchoro wa upimaji unaweza kuonekana sahihi na bado ukawa si sahihi kwa ardhi: vipimo vyake vinaweza kuwa vimekisiwa, kontua zake zinaweza kuwa tambarare kwenye urefu 0, au viwango vyake vinaweza kuandikwa kama maandishi ambayo si jiometri hata kidogo. Sehemu ya **Viwango vya upimaji na ukaguzi** kwenye kisanduku cha {{ui:Mistari}} (angalia [Fungua DWG au DXF kama mistari](topic:open-dwg-dxf)) inasoma viwango hivyo na kukuambia kile kinachoonekana kuwa kibaya kabla ya chochote kuongezwa.

## Viwango vilivyoandikwa kama maandishi au kwenye sifa

Michoro mingi ya upimaji huweka kiwango cha nukta kama maandishi madogo karibu na msalaba, kama `104.37` au `EL 104.37`, au kama sifa ya block ya nukta. Hizi si mistari, kwa hiyo msomaji wa mistari anaziacha. Sehemu inaorodhesha ngapi imezipata na inakuruhusu kuzichukua kama **nukta za upimaji**:

1. Weka alama kwenye **Chukua … viwango kama nukta za upimaji**. Zinaanza bila alama, kwa sababu si kila namba kwenye mchoro ni urefu.
2. Maandishi yanasomwa yanapokuwa kiwango peke yake: namba yenye sehemu ya desimali (`104.37`, `+104,37`, `-3.50`), au namba baada ya `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` au `LEVEL`, pamoja na `m`, `ft` au `'` hiari baada yake. Namba nzima peke yake (`12`) inasomwa kama namba ya kiwanja au karatasi, si kiwango; maandishi kama `GATE 3` au tarehe hayasomwi kamwe. Misimbo ya umbizo la maandishi inapuuzwa.
3. Kwa sifa za block, chagua **Sifa ya block inayoshikilia kiwango**. CivilCraft inatafuta lebo inayoitwa ELEV, Z, LEVEL, RL au kama hizo yenyewe; chagua nyingine kutoka orodha ikiwa mchoro unatumia yake. Chaguo linakumbukwa kwa jina hilo la faili kwenye kompyuta hii, kwa hiyo likifunguliwa tena linaanza kwenye lebo ile ile. Lebo uliyochagua inachukua namba nzima kama viwango pia.
4. Bonyeza {{ui:Ongeza}}. Nukta zinapewa namba baada ya namba ya juu zaidi kwenye mradi, kila nukta inaelezwa kwa tabaka lake (au block yake), na urefu unabadilishwa kuwa vipimo vya mradi kama mchoro mzima. Yote ni hatua moja: {{key:Mod+Z}} inaziondoa.

Maandishi yanakaa kwenye nukta yake ya kuingiza (au nukta yake ya kupanga ikiwa ina moja). Maandishi ndani ya blocks hayasomwi, na mchoro haubadilishwi kamwe.

## Ukaguzi

Ukaguzi unaendeshwa kwenye kile unachotaka kuingiza, na unaorodhesha unachopata, mstari mmoja kwa kila aina ya tatizo:

| Inasema | Maana yake |
|---|---|
| **Vipimo havijatajwa** | Mchoro hausemi vipimo vyake ni nini, kwa hiyo namba zake zinasomwa kama vipimo vya mradi. Kagua umbali mmoja unaoujua. |
| **Vipimo vimebadilishwa** | Vipimo vya mchoro vinatofautiana na vya mradi na vinapimwa upya (ni kumbukumbu, si hitilafu). |
| **Data inaenea … km** au **… m** | Upana ni zaidi ya km 200 au chini ya nusu mita, jambo linalomaanisha kipimo kibaya mara nyingi (milimita zikisomwa kama mita, au kinyume chake). |
| **Hakuna mfumo wa kuratibu** | Mradi hauna. Ni onyo pale data iko mbali na sifuri, kama kuratibu za state plane au gridi ya kitaifa. Angalia [Mifumo ya kuratibu](topic:coordinate-systems). |
| **Mbali na asili** | Data iko zaidi ya km 100 kutoka sifuri. Ikiwa mbali na sifuri, mionekano ya 3D na mauzo ya data yanapoteza usahihi na kutetemeka. |
| **Tabaka la kontua … halina urefu** | Tabaka lenye jina kama kontua (TOPO, CONT, CNTR, CONTOUR) lina mistari ya urefu 0, kwa hiyo ardhi iliyojengwa kutoka kwake ingekuwa tambarare. |
| **Viwango vya 0 kabisa** | Baadhi ya viwango ni 0 wakati kiwango cha kawaida kiko mbali nacho: pengine urefu haupo. |
| **Viwango vilivyo mbali na vingine** | Viwango vichache viko mbali sana nje ya vingine (vinapimwa dhidi ya katikati ya viwango vyote, kwa hiyo eneo lenye mteremko mkali na upana mkubwa halialamishwi), au juu ya m 9,000 au chini ya m -11,000. |
| **Nukta juu ya nukta nyingine** | Nukta mbili mahali pamoja zenye kiwango kimoja, au zenye viwango tofauti. |

Baada ya kubonyeza {{ui:Ongeza}}, mistari hiyo hiyo inaenda kwenye **Matatizo**, moja kwa kila aina, pamoja na jina la faili, ili uweze kurudi kwake. Ukaguzi unahukumu mchoro; hauubadilishi, na hauzuii kutumia mchoro.

:::tip
Ukaguzi ukisema kontua ni tambarare kwa 0 na kuna viwango vilivyoandikwa kama maandishi, chukua viwango kama nukta za upimaji: mara nyingi vinabeba urefu halisi ambao mistari ya kontua haina.
:::

## Kisichokaguliwa

Ukaguzi haulinganishi mchoro na upimaji wa pili, na hauwezi kubainisha mchoro uko kwenye mfumo gani wa kuratibu: unaonyesha tu kwamba hakuna uliowekwa.
