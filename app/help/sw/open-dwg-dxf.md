---
title: Fungua DWG au DXF kama mistari
summary: Fungua mistari ya mchoro kwenye mpango, tabaka kwa tabaka, tumia mikunjo yake, polilaini za 3D na muhtasari uliofungwa kwa uso, na geuza nukta zake za vitalu kuwa nukta za upimaji.
keywords: ukaguzi wa upimaji, viwango vya maandishi, dwg, dxf, cad, mchoro, mistari, mikunjo, mivunjiko, mpaka, polilaini, polilaini ya 3D, tabaka, ramani ya msingi, topo, mchoro wa upimaji, vitalu, marejeo ya vitalu, nukta za upimaji kutoka vitalu, sifa, nukta za vitalu, nukta ya kuingiza
from: da0f4c58
---

Upimaji wa topografia mara nyingi huja kama mchoro: mikunjo kama polilaini kwenye mwinuko wake, mistari ya mvunjiko kama polilaini za 3D, na mpaka wa eneo kama polilaini iliyofungwa. CivilCraft inafungua **nafasi ya modeli** ya mchoro kama tabaka kwenye mpango, na inaweza kugeuza mistari hiyo moja kwa moja kuwa uso.

## Fungua mchoro

1. Bofya {{ui:Mistari}} kwenye kikundi cha **Uso** (au {{ui:Fungua}}, au dondosha faili kwenye mpango) kisha chagua faili la `.dwg` au `.dxf`. Mchoro unasomwa kwenye kompyuta hii; hakuna kinachopakiwa. DWG kuanzia 2000 hadi 2018 na DXF ya ASCII zinasomwa.
2. Mazungumzo ya **Mistari** yanaorodhesha tabaka za mchoro zenye mistari, maumbo yaliyofungwa au nukta, na kama zina **mwinuko**. Tabaka zilizozimwa kwenye mchoro zinaanza bila tiki. Maandishi, vijazo, vipimo na vitu vingine visivyo mistari vinahesabiwa na kuachwa (mazungumzo yanasema yapi).
3. Angalia **Vitengo vya mchoro**. Mchoro unaposema vitengo vyake, CivilCraft inavibadilisha kuwa vya mradi (milimita kuwa mita, mita kuwa futi, inchi kuwa futi). Mchoro wa futi unasomwa kama futi za US survey bila kubadilishwa kipimo: tofauti yake ni sehemu 2 kwa milioni, na kubadilisha kipimo cha viwianishi vya state plane kwa tofauti hiyo kungezihamisha kwa futi. Mchoro usipotaja vitengo vyake, namba zake zinasomwa katika vitengo vya mradi; chagua vitengo sahihi kwenye orodha ikiwa si sahihi.
4. Kwenye **Tumia kwa uso**, chagua kile kila tabaka linachotoa kwa uso (au acha **Onyesha tu**). Tabaka zenye majina kama mikunjo (TOPO, CONT, CNTR) zenye mwinuko zinaanza kama mistari ya mvunjiko.
5. Bofya {{ui:Ongeza}}. Tabaka zinaonekana chini ya **Tabaka za GIS** kwenye paneli ya kushoto; kila matumizi yanawekwa kwenye uso. Kila sehemu ni hatua yake: {{key:Mod+Z}} inazirudisha moja moja.

## Kile kila aina ya tabaka inaweza kutoa

| Tabaka lina | Tumia kwa uso |
|---|---|
| Mikunjo (polilaini kwenye mwinuko) | Mistari ya mvunjiko kwa mwinuko wa mistari yenyewe, au kwenye uga wa ELEV |
| Polilaini za 3D | Mistari ya mvunjiko kwa miinuko yao wenyewe |
| Muhtasari uliofungwa | Mpaka wa uso (umbo kubwa zaidi lililofungwa, au ule uliouchagua) |
| Nukta zenye mwinuko | Nukta za upimaji, zinazoelezwa kwa jina la tabaka |
| Mistari kwenye mwinuko 0 (mistari ya mpango) | Hakuna: inabaki kwenye mpango kama mchoro wa msingi |

Mchoro ambao CivilCraft iliandika unashikilia mistari yake ya kipengele kama polilaini za 3D zinazokumbuka mikunjo yake. Mazungumzo basi yanaonyesha **Mistari ya kipengele**: iache ikiwa imetiwa tiki ili kuirudisha kama mistari ya kipengele pamoja na mikunjo na matumizi yake (hatua moja ya kutendua), au ondoa tiki ili isomwe kama mistari ya kawaida kama tabaka nyingine yoyote.

Baadaye, tumia {{ui:Tumia kwa uso}} kwenye menyu ya tabaka chini ya **Tabaka za GIS** kufanya hivyo kwa tabaka ulilolionyesha tu.

## Nukta za upimaji kutoka vitalu

Michoro ya upimaji mara nyingi huwa na nukta zake kama vitalu: alama ndogo kwenye kila upimaji, pamoja na sifa za namba ya nukta, maelezo na mwinuko. Mchoro unapokuwa na marejeo ya vitalu, mazungumzo yana sehemu ya **Nukta za upimaji kutoka vitalu**:

1. Tia tiki vitalu vya kuchukua (jedwali linaonyesha marejeo mangapi kila kizuizi kina, kwenye tabaka zipi, na sifa zipi), au tia tiki tabaka ili kuchukua kila marejeo ya vitalu juu yake.
2. Chagua mahali kila **namba**, **maelezo** na **mwinuko** wa nukta vinatoka: sifa, jina la kizuizi au tabaka, namba zinazofuata zisizotumika, au Z ya nukta ya kuingiza. CivilCraft inaanza na sifa zinazowezekana (PT, DESC, ELEV na kadhalika), na inachukua mwinuko kutoka sifa pekee pale vitalu vinapokaa kwenye sifuri.
3. Ondoa tiki tabaka za mistari ikiwa unataka nukta pekee, kisha bofya {{ui:Ongeza}}.

Kila marejeo linakuwa nukta moja ya upimaji kwenye nukta yake ya kuingiza. Marejeo yaliyowekwa kwenye nafasi ya modeli pekee yanahesabiwa; vitalu vilivyowekwa ndani ya vitalu vingine havihesabiwi. Namba zilizopo tayari kwenye mradi, au zilizotumika mara mbili kwenye mchoro, zinapata namba mpya baada ya ile ya juu kabisa, na sifa ya mwinuko isiyokuwa namba inaacha nukta hiyo bila mwinuko; mstari wa hali unahesabu zote mbili. Mchoro haubadilishwi kamwe, na kila nukta inakumbuka kizuizi chake: Sifa zake zinaonyesha **Kutoka kizuizi** pamoja na kizuizi, tabaka na handle. Kuongeza nukta ni hatua moja, kwa hiyo {{key:Mod+Z}} inaziondoa zote.

## Viwango vilivyoandikwa kama maandishi, na ukaguzi

Viwango vya sehemu vilivyoandikwa kama maandishi (au kwenye sifa ya kizuizi ambacho si kizuizi cha nukta za upimaji) si mistari. Sehemu ya **Viwango vya upimaji na ukaguzi** inaweza kuvichukua kama nukta za upimaji, na inaorodhesha kisichoonekana sawa kwenye mchoro: vitengo, mfumo wa kuratibu, umbali kutoka sifuri, mikunjo tambarare, viwango visivyo vya kawaida, nukta zilizorudiwa. Tazama [Kagua mchoro wa upimaji unapoingiza](topic:survey-check).

## Jinsi mchoro unavyosomwa

- Arcs, duara, duaradufu, sehemu za polilaini zilizovimba na splines zinakuwa vipande vifupi vilivyonyooka (kila 5° kwa kiwango cha juu).
- Marejeo ya vitalu yanachorwa pale yalipowekwa, pamoja na vitalu vilivyowekwa ndani ya vingine; kilichomo kwenye kizuizi cha tabaka 0 kinachukua tabaka la marejeo.
- Vitu vilivyochorwa kwenye ndege nyingine (mwelekeo tofauti wa extrusion) vinawekwa kwenye viwianishi vya dunia.
- Kila kitu kinapata sehemu tatu: LAYER, TYPE (aina ya kitu) na ELEV (mwinuko wake pale nukta zake zote zinaposhiriki moja).
- Viwianishi vinachukuliwa kama vilivyo: mchoro lazima utumie viwianishi sawa na mradi (kwa mfano eneo sawa la state plane). Michoro iliyounganishwa (xrefs) haifunguliwi: fungua peke yake.

:::tip
Mchoro wa mikunjo unatoa uso bora zaidi wenye viwango vichache vya doa kwenye vilele na mashimo, pale mikunjo pekee inaacha pembetatu tambarare. Viongeze kama nukta za upimaji, au kutoka kwenye tabaka la nukta kwenye mchoro.
:::
