---
title: Fanya kazi na jedwali la sifa la tabaka
summary: Ona kila kipengele cha tabaka la GIS kama jedwali, panga na chuja, chagua safu mlalo na vipengele pamoja, rekebisha thamani, ongeza sehemu, kokotoa thamani mpya na uhifadhi jedwali kama CSV.
keywords: jedwali la sifa, jedwali, sehemu, safu wima, safu mlalo, panga, chuja, usemi, chagua, hariri, kikokotoo cha sehemu, kokotoa, ongeza sehemu, badilisha jina la sehemu, ondoa sehemu, csv, hamisha, gis, shapefile, geopackage, mtindo
from: fd9d6c11
---

Fungua jedwali la tabaka kutoka menyu ya **vitone vitatu** katika orodha ya Tabaka za GIS ({{ui:Jedwali la sifa…}}), kutoka Uso › Zaidi › {{ui:Jedwali la sifa}}, au kwa kuandika `ATTRIBUTES`, `ATTTABLE` au `TABLE`. Jedwali linafunguka kando ya mpango na linabaki wazi unapofanya kazi. Safu mlalo unazoziona tu ndizo zinazochorwa, kwa hiyo tabaka lenye maelfu ya vipengele hufunguka na kusogea haraka.

## Panga, chuja na chagua

- **Panga:** bofya kichwa cha safu wima. Bofya ya pili inageuza mpangilio, ya tatu inarudisha mpangilio wa faili. Thamani tupu zinabaki chini kila wakati. Kupanga kunabadilisha unachokiona tu, si tabaka.
- **Chuja:** andika kwenye kisanduku cha kuchuja. Usemi kama `AREA > 500 and USE = 'Res'` unahifadhi safu mlalo ambazo ni kweli (maneno yale yale ya kichupo cha Chagua cha [Chambua tabaka za GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Chochote kisicho usemi, kama `oak maple`, kinatafuta maneno hayo katika kila safu wima.
- **Chagua safu mlalo:** bofya safu mlalo. Ctrl+bofya inaongeza au kuondoa moja, Shift+bofya inachagua mfululizo, na {{ui:Chagua safu zinazoonyeshwa}} inachukua kila safu mlalo inayopita kichujio. Vipengele vilivyochaguliwa vinachorwa kwenye mpango, na kubofya kipengele kwenye mpango kunachagua safu yake hapa.
- Ukiwa na safu mlalo zilizochaguliwa unaweza {{ui:Kuza}} kwazo, kutengeneza **tabaka kutoka kwenye uteuzi**, na kusoma jumla ya eneo au urefu kwenye mstari wa hali.

## Rekebisha thamani

Bofya mara mbili kisanduku (au sogea kwake kwa vitufe vya mshale na ubonyeze Enter), andika thamani mpya na ubonyeze Enter. Escape inaiacha kama ilivyokuwa. Thamani lazima itoshee safu wima: namba kama namba, tarehe kama `YYYY-MM-DD`, ndiyo/hapana kama yes, no, true au false. Thamani isiyotoshea inakataliwa kwa sentensi na hakuna kinachobadilika. Kisanduku tupu kinafanya thamani kuwa tupu. Kila uhariri ni hatua moja ya kutendua: {{ui:Tendua}} na {{ui:Rudia}} zipo chini ya jedwali, na Ctrl+Z inafanya kazi kwenye mpango.

## Sehemu

Chini ya **Sehemu** unaweza kuongeza sehemu (maandishi, namba, tarehe au ndiyo/hapana), kubadilisha jina, au kuondoa. Sehemu mpya inaanza tupu. Kubadilisha jina kunafuatwa: sehemu ya lebo na [mtindo kwa sifa](topic:gis-symbology) wa tabaka vinahamia jina jipya, na kuondoa sehemu kunaondoa lebo na mtindo uliokuwa ukiitumia. Kila kitendo ni hatua moja ya kutendua inayorudisha kila kitu.

## Kikokotoo cha sehemu

Kinaandika thamani kwenye kila safu mlalo (au safu mlalo zilizochaguliwa pekee) kutoka sehemu nyingine za safu mlalo, jiometri yake na kazi chache. Chagua sehemu iliyopo au **Sehemu mpya…**, kisha upe jina na aina yake. Hakuna kinachoendeshwa kama msimbo: usemi unasomwa na kichanganuzi kidogo chenye orodha maalum ya kazi.

| Kundi | Maneno |
|---|---|
| Namba | `+ - * /`, mabano, `abs round(x, digits) floor ceil sqrt pow min max` |
| Maandishi | `upper lower trim len substr(text, from, count) left right replace concat` (maandishi huwekwa kwenye 'nukuu moja'; jina la sehemu lenye nafasi huwekwa kwenye "nukuu mbili" au [mabano ya mraba]) |
| Kuchagua | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Tarehe | `year month day` za thamani ya `YYYY-MM-DD` |
| Jiometri | `$area $perimeter $length $x $y $vertices`, katika vitengo vya mradi |

Thamani isiyoweza kuhifadhiwa katika aina ya sehemu (maandishi katika sehemu ya namba) inaachwa tupu na kuhesabiwa katika ujumbe. Kugawanya kwa sifuri kunatoa thamani tupu. Kwa mfano, `round($area / 43560, 2)` inaandika ekari kutoka futi za mraba.

## Hamisha

{{ui:Hamisha CSV}} inahifadhi safu mlalo unazoziona (baada ya kichujio na kupanga) kama faili la CSV la UTF-8 lenye majina ya sehemu kwenye mstari wa kwanza. Maandishi yanayoanza na `=`, `+`, `-` au `@` yanapata nukuu moja mbele ili lahajedwali lisiyaendeshe kama fomula. Ili kuhifadhi tabaka lenyewe, tumia [Hamisha data ya as-built kwa GIS](topic:gis-export).

## Mipaka

Jedwali linaonyesha tabaka katika mpangilio mmoja wa kupanga na kichujio kimoja kwa wakati. Safu mlalo haziwezi kuongezwa wala kufutwa hapa (tengeneza tabaka jipya kutoka kwenye uteuzi badala yake), jiometri haihaririwi, na aina ya sehemu haiwezi kubadilishwa baada ya kuundwa.
