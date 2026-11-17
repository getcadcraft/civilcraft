---
title: Badilishana LandXML
summary: Fungua LandXML kutoka programu nyingine za kiraia kama mradi mpya, hamisha nukta, nyuso, mipangilio ya njia, wasifu na mtandao wa mabomba kama LandXML 1.2, na ujue kisichosafiri.
keywords: landxml, xml, ingiza, hamisha, badilishana, tin, uso, mpangilio wa njia, wasifu, mtandao wa mabomba, ushirikiano, kubadilishana data
from: 870d5ece
---

LandXML ni muundo wazi wa kubadilishana ambao programu nyingi za kiraia zinasoma na kuandika. CivilCraft inasoma na kuandika LandXML 1.2. Ikiwa umetumia Civil 3D, mazungumzo yake ya kuingiza na kuhamisha LandXML ndiyo yanayokaribiana zaidi; hapa hakuna chaguo za kufanya, na maelezo yanakuambia kilichoachwa.

## Fungua faili la LandXML

1. Bofya {{ui:Fungua}} (au bonyeza {{key:Mod+O}}) na uchague faili la `.xml` au `.landxml`, au liangushe kwenye mpango.
2. Ikiwa mradi wa sasa una mabadiliko ambayo hayajahifadhiwa, CivilCraft inauliza kwanza. Chagua {{ui:Hifadhi nakala}}, {{ui:Usihifadhi}} au {{ui:Ghairi}}.
3. **Mradi mpya** unatengenezwa. Upau wa hali unasema kilichosomwa, kwa mfano "Imefungua site.xml: nukta 412, nyuso 2, mipangilio 3 ya njia."
4. Angalia kisanduku chini ya ukweli wa **Uso**. Kinaorodhesha kila kilichoruka au kubadilishwa, kwa mfano:
   - "Uso wa kwanza tu ("EG") ndio ulifunguliwa; faili lina moja zaidi."
   - "Mpangilio wa njia "Ramp A" una elementi ambazo CivilCraft bado haiwezi kuchora (si mistari, mikunjo wala spirali za clothoid); umeruka."
   - "Kanuni za mtandao wa mabomba hazikuwa kwenye faili; viwakilishi vya nafasi vinatumika. Weka zako chini ya Mradi."

Kinachogeuka kuwa nini:

| Kwenye faili | Kwenye CivilCraft |
|---|---|
| Vitengo (Imperial au Metric) | **Vitengo** vya mradi (futi au mita) |
| Jina la mradi | **Jina** la mradi |
| CgPoints | Nukta za mradi; maelezo (au msimbo) yanatoa kundi |
| TIN ya kwanza | Ardhi iliyopo, inayotumika kama ilivyo ("Uso (kutoka LandXML)") |
| Kila mpangilio wa njia wa mistari, mikunjo na spirali za clothoid | Mpangilio wa njia wenye PI zake, radii na urefu wa spirali uliojengwa upya kutoka kwenye mikunjo |
| Wasifu wa kwanza wa usanifu wa kila mpangilio | Wasifu wake wa usanifu, pamoja na mikunjo ya wima ya parabola |
| Mtandao wa kwanza wa mabomba | Mtandao wa mabomba, pamoja na ukingo, sumpu na invert zake |
| Vipengele vya mpango vya mistari na mikunjo | Mistari ya kipengele na mikunjo iliyohifadhiwa; kutoka programu nyingine huanza kama **Imechorwa tu** |

Orodha kamili ya elementi na sifa iko kwenye [LandXML: kinachosomwa na kuandikwa](topic:landxml-reference).

:::note
Uso uliosomwa kutoka LandXML haujengwi upya unapobadilisha vikundi vya nukta au kuchora mistari ya kuvunja. Bofya {{ui:Jenga upya uso kutoka kwenye nukta}} katika sehemu ya **Uso** ili kuujenga kutoka kwenye nukta badala yake ({{key:Mod+Z}} inarudisha uso wa LandXML).
:::

## Hamisha LandXML

1. Bofya {{ui:LandXML}} katika kikundi cha **Hamisha**.
2. Kivinjari kinapakua `<name>.xml`. Upau wa hali unasema kilichoingia, kwa mfano "Imehamishwa LandXML 1.2: nukta 276, nyuso 2, mpangilio 1 wa njia, mtandao wa mabomba. Pedi hazimo katika LandXML hapa; uso uliosawazishwa ndio."

Faili lina:

- **Vitengo**: futi za uchunguzi wa Marekani au mita.
- **CgPoints**: kila nukta yenye namba yake kama jina, maelezo yake na kundi lake kama msimbo.
- **Nyuso**: ardhi iliyopo kama TIN, pamoja na mistari yake ya kuvunja na mpaka wa nje kama data ya chanzo; na, pedi au korido zinaposawazisha, uso wa pili wa TIN uliopewa jina "Proposed".
- **Mipangilio ya njia**: mistari, mikunjo na spirali za clothoid pamoja na vituo vyake, kila moja ikiwa na wasifu unaoshikilia ardhi iliyopo iliyopimwa kando yake, na wasifu wa usanifu (PVI na mikunjo ya parabola) inapokuwa na PVI angalau mbili.
- **PipeNetworks**: miundo yenye ukingo wake, sumpu na invert kwa kila bomba, na mabomba yenye kipenyo, urefu na mteremko.
- **PlanFeatures**: kila mstari wa kipengele kama mistari na mikunjo yenye mwinuko kila mwisho, na kile unachotumika.

## Visivyosafiri

- Pedi na korido kama vitu. Matokeo yake yako kwenye uso wa "Proposed".
- Mipangilio ya njia yenye makosa (kwa mfano mikunjo inayoingiliana): inaachwa, na inahesabiwa kwenye ujumbe wa hali.
- Mabomba yasiyo na invert zote mbili, na mitandao yenye miundo chini ya miwili.
- Ukingo unaochukuliwa kutoka kwenye uso unaandikwa kama ukingo uliowekwa. Ukifunguliwa tena, muundo unabaki na namba hiyo hata uso ukibadilika.
- Kanuni za mtandao (mteremko mdogo, kifuniko, kushuka): LandXML haina nafasi kwa ajili yake.
- Mipangilio ya onyesho na chaguo za uso za vikundi vya nukta: hifadhi mradi wa CivilCraft kwa ajili ya hizo.

Wakati wa kufungua, CivilCraft haisomi spirali zisizo za clothoid, nyuso za gridi, nukta zinazorejelea nukta nyingine tu, viwanja, spirali katika vipengele vya mpango, barabara au data ya upimaji. Kila kimoja kinatajwa kwenye maelezo, na kamwe hakikisiwi.

## Mizunguko kamili

Ili kumkabidhi mtu anayetumia programu nyingine za kiraia kazi na kuipata tena, hamisha LandXML, mwache aihariri, kisha fungua LandXML yake kama mradi mpya. Weka pia `.civilcraft.json` yako mwenyewe: ndilo faili pekee linalohifadhi kila kitu ambacho CivilCraft inakijua.
