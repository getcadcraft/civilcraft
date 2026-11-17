---
title: Soma kontua, miinuko na miteremko
summary: Weka muda wa kontua na kontua kuu, onyesha mikanda ya mwinuko, mishale ya mteremko na pembetatu, na usome mwinuko wa ardhi chini ya kielekezi.
keywords: kontua, muda wa kontua, kontua kuu, lebo, mikanda ya mwinuko, mishale ya mteremko, pembetatu, mwinuko wa nukta, uchambuzi wa uso, uchambuzi wa mwinuko, uchambuzi wa mteremko
from: 585e500a
---

Uso unaonyeshwa kwa kontua mara tu unapokuwepo. Kila kitu katika mada hii kinawekwa chini ya **Onyesha** kwenye paneli ya kushoto. Mipangilio ya onyesho hubadilisha tu kile unachokiona (na kile unachohamisha nje); hazina hatua za kutendua.

## Weka muda wa kontua

1. Chini ya **Onyesha**, chagua thamani kwenye **Kontua kila**.
   - Kwa futi: 0.25, 0.5, 1, 2, 5, 10 au 20 ft.
   - Kwa mita: 0.1, 0.25, 0.5, 1, 2, 5 au 10 m.
2. Chagua **Kontua kuu kila**: kontua ya 2, ya 4, ya 5 au ya 10.
   Kontua kuu huchorwa nene zaidi na huwekwa lebo ya mwinuko wake. Huangukia kwenye vizidisho kamili vya nafasi kuu (kwa kontua za 1 ft na kila kontua ya 5 kuwa kuu: 245, 250, 255 …).
3. Zima {{ui:Lebo za kontua}} ikiwa lebo zinasongamana kwenye kiwanja kidogo.

Mradi mpya huanza na kipimo 1, na kila kontua ya 5 ikiwa kuu. Kontua hujipinda kwenye mistari ya kuvunja; zikikatiza moja kwa moja mstari wa mtiririko au tuta, mstari huo bado si mstari wa kuvunja (angalia [Jenga na boresha uso](topic:build-surface)).

:::note
Kontua huchorwa tu pale kuna viwango visivyozidi 2,000 kati ya nukta ya chini kabisa na ya juu kabisa. Kwenye eneo lenye tofauti kubwa ya urefu na muda mdogo sana, mpango hauonyeshi kontua kabisa: chagua muda mkubwa zaidi.
:::

## Laini kontua

Kontua huchorwa kama vipande vilivyonyooka, kipande kimoja kuvuka kila pembetatu ya uso, kwa hiyo hugeuka kona ndogo kwenye kila ukingo wa pembetatu. **Ulainishaji wa kontua** chini ya **Onyesha** huzungusha kona hizo:

- **Hakuna (vipande vilivyonyooka)**: mistari iliyochorwa kama ilivyo. Hii ndiyo inayoonyeshwa kwenye mchoro mpya au wa zamani.
- **Hafifu**: kona zimezungushwa kidogo. Mstari hausogei zaidi ya 10% ya njia kuelekea kontua inayofuata, wala hauendi mbali zaidi ya sehemu moja ya sita ya urefu wa kipande chake kilichonyooka.
- **Kali**: mkunjo unaotiririka. Mstari hausogei zaidi ya 25% ya njia kuelekea kontua inayofuata, wala hauendi mbali zaidi ya sehemu moja ya tatu ya urefu wa kipande chake kilichonyooka.

Kwa chaguo lolote kati ya hayo, kontua iliyolainishwa bado inavuka kila ukingo wa pembetatu kwenye nukta ile ile kama iliyochorwa, inabaki ndani ya pembetatu ambayo kila kipande kinavuka, na kwa hiyo haiwezi kamwe kuvuka au kugusa kontua nyingine. Mahali kontua inavuka mstari wa kuvunja au mpaka, huhifadhi mkunjo wake mkali. Mistari iliyolainishwa ndiyo inayochapishwa na kuhamishwa nje (DXF, DWG, PDF, GIS na 3D), ikiwa na vipeo vingi zaidi kuliko mistari iliyochorwa.

Ulainishaji hubadilisha mistari iliyochorwa tu. Mwinuko, ujazo, wasifu na sehemu za mkato bado husomwa kutoka kwenye uso wenyewe. Kontua inayopita hasa kwenye nukta za upimaji (nukta yenye 250.00 kwenye kontua ya 250) huhifadhi kona ndogo kwenye kila nukta kama hiyo.

## Jinsi uso nyuma ya kontua unavyotengenezwa

Kontua hufuata uso, na uso hufuata **Njia ya kuchora kontua** chini ya **Uso** kwenye paneli ya kushoto. Chaguo-msingi, **Upembetatuzi kwa ukadiriaji wa mstari**, huunganisha nukta zako kuwa pembetatu na huhifadhi kila nukta na kila mstari wa kuvunja kwa usahihi. Mbinu nyingine kwanza hupangilia gridi ya kawaida juu ya nukta (kriging, minimum curvature, natural neighbor, inverse distance na nyingine), jambo linalotoa kontua laini zaidi kati ya nukta lakini halipiti kwa usahihi kwenye kila nukta; ripoti ya uso chini ya **Uso** inaonyesha matokeo yanatofautiana kiasi gani kwenye nukta zako.

**ABOS (approximation based on smoothing)** ni mojawapo ya mbinu za gridi. Ina mipangilio miwili yake: **Ulaini** (0.5 mwanzoni; chini ni laini zaidi) na **Usahihi** (1 mwanzoni: uso huletwa ndani ya 1% ya safu ya urefu wa eneo kwenye nukta zako; andika namba ndogo kwa ulinganifu wa karibu zaidi). Ikishindwa kufikia usahihi kwenye gridi iliyopo, ripoti ya uso inasema hivyo: andika **Nafasi ya gridi** ndogo zaidi.

## Soma mwinuko popote

Sogeza kielekezi juu ya mpango. Upau wa hali unaonyesha:

- **E** na **N** chini ya kielekezi
- **Ground** na mwinuko wa ardhi iliyopo hapo, uliokadiriwa kwenye pembetatu iliyo chini ya kielekezi
- **Graded** na mwinuko uliopendekezwa, pale jukwaa au ukanda umebadilisha ardhi
- "Nje ya uso" nje ya uso

Ili kusoma nukta ya upimaji kwa usahihi, chagua {{ui:Chagua}} kisha ubofye nukta: paneli ya kulia inaonyesha nambari yake, easting, northing, mwinuko, maelezo na kikundi.

## Onyesha mikanda ya mwinuko

1. Weka tiki {{ui:Mikanda ya mwinuko}}.
   Uso unajazwa rangi kutoka chini (buluu-kijani) hadi juu (kahawia ya ocha). Ufunguo wa rangi chini ya visanduku vya tiki unaorodhesha safu ya mwinuko wa kila mkanda.
2. Chagua idadi ya mikanda kwenye **Mikanda**: 5, 8, 10 au 12. Mikanda hugawanya safu kutoka mwinuko wa chini kabisa hadi wa juu kabisa kuwa hatua sawa.

Mikanda ni kwa kuangalia tu. Haihamishwi kwenda DXF wala kuchapishwa kwenda PDF.

## Onyesha mishale ya mteremko

Weka tiki {{ui:Mishale ya mteremko}}. Mshale mfupi kwenye kila pembetatu iliyo kubwa vya kutosha kuushikilia unaelekeza chini ya mteremko. Pembetatu tambarare hazipati mshale. Mishale ni ukaguzi wa haraka wa mwelekeo wa mifereji ya maji; thamani ya mteremko yenyewe bado haina lebo.

## Onyesha pembetatu, nukta na ukingo

- {{ui:Pembetatu}} huchora ukingo wa TIN. Iwashe ili kukagua jinsi uso unavyounganisha nukta, hasa kando ya mistari ya kuvunja na nje.
- {{ui:Nukta}} huchora kila nukta ya upimaji; {{ui:Lebo za nukta}} huongeza nambari yake, mwinuko na maelezo (au kidogo zaidi: angalia **Lebo za nukta** katika [Mipangilio ya CivilCraft](topic:settings)).
- {{ui:Mistari ya kuvunja}} huchora mistari ya kuvunja (na mpaka) kwa rangi ya chungwa.
- {{ui:Ukingo wa uso}} huchora mstari wa nje wa uso.

## Iliyopo au inayopendekezwa

Jukwaa au ukanda ukishasawazishwa bila matatizo, **Uso** chini ya **Onyesha** hutoa {{ui:Pendekezo (lililosawazishwa)}}. Kontua, mikanda na mishale hapo huonyesha uso uliosawazishwa, ili uone ardhi mpya na daylight inayoizunguka. Rudi kwa {{ui:Ardhi iliyopo}} ili kuona upimaji.

## Kinachohamishwa nje

Matokeo ya DXF na PDF hufuata mipangilio hii: kilichozimwa hakiandikwi, na kontua ni zile za uso unaoonyeshwa. Mikanda ya mwinuko kamwe haihamishwi nje.
