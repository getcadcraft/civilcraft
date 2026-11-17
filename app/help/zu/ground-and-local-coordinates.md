---
title: Amakhoordinethi womhlaba nendawo
summary: Sebenza ngamakhoordinethi womhlaba (womphezulu) askalwe kusuka egridini ngesilinganiso sokuskeyla esiphelele osibhalayo noma osibalayo endaweni, noma egridini yesayithi eqagelwayo ehlanganiswe nohlelo ngamaphoyinti amabili okulawula.
keywords: amakhoordinethi womhlaba, amakhoordinethi womphezulu, igridi iye kumhlaba, isilinganiso sokuskeyla esiphelele, csf, isilinganiso esiphelele, isilinganiso segridi, isilinganiso sokuphakama, isilinganiso selwandle, ukuguquka, ukungeniswa kwesilinganiso, amakhoordinethi aqagelwayo, amakhoordinethi endawo, igridi yesayithi, 5000 5000, amaphoyinti okulawula, ukulinganisa, ukulinganisa kabili, ukungavumelani
from: 3d7453de
---

Amakhoordinethi e-State plane ne-UTM ngamakhoordinethi **egridi**: iphrojekthi yemephu yelula noma ibambe amabanga kancane (amashumi ezingxenye ezingu-parts per million), futhi isayithi eliphakeme kakhulu, ibanga lomhlaba elilinganiswe lihluke kakhulu kwelegridi. Ngakho izinhlolo eziningi zinikeza **amakhoordinethi womhlaba**, askalwe ukuze amabanga ephlanini alingane namabanga alinganiswe emhlabeni, noma igridi yesayithi **eqagelwe** (5000, 5000 kwiphoyinti lokulawula). I-CivilCraft igcina izinombolo zakho njengoba zinjalo futhi irekhoda ukuthi zihlobana kanjani negridi, ngakho ubude nobubanzi, amafayela e-GIS nezingqimba zemephu asafika endaweni efanele.

Vula {{ui:Amakhoordinethi}} eqenjini le-{{ui:GIS}}, khetha (noma gcina) uhlelo, bese ukhetha ngaphansi kwe-**Igridi, umhlaba noma amakhoordinethi endawo**:

| Ukukhetha | Amakhoordinethi akho ayi- | Ukuthi ahlobana kanjani negridi |
|---|---|---|
| {{ui:Igridi}} | Ohlelweni lwawo (okokuqala) | Izinombolo ezifanayo |
| {{ui:Umhlaba}} | Askalwe kumabanga omhlaba | igridi = isisekelo + isilinganiso esiphelele × (umhlaba − isisekelo) |
| {{ui:Indawo}} | Igridi yesayithi eqagelwe | Ihanjiswe, iphendulwe futhi ishintshwe ibe egridini ngamaphoyinti amabili okulawula |

Noma yini okhethile igcinwa nephrojekthi futhi iyisinyathelo esisodwa sokuhlehlisa; akukho okunyakazayo.

## Amakhoordinethi womhlaba

1. Khetha {{ui:Umhlaba}}.
2. Bhala **Isilinganiso esiphelele sokuskeyla** ocaphuna esurveyeni (isibonelo `0.99987`), noma uyibale:
   1. Ngaphansi kwe-**Bala isilinganiso endaweni**, iphoyinti liqala emaphakathi kweprojekthi. Khetha {{ui:Khetha iphoyinti ephuleni}} bese uchofoza indawo (ukuchofoza eduze kwephoyinti lokuhlola kuthatha leliphoyinti), noma bhala E no N.
   2. Ukuphakama kuvela emphezulwini lapho; bhala elinye uma udinga.
   3. Khetha {{ui:Bala}}. I-CivilCraft ibonisa:
      - **Isilinganiso segridi k**: iphrojekthi yemephu ilula kangakanani amabanga lapho.
      - **Isilinganiso sokuphakama**: amabanga afushane kangakanani ku-ellipsoid kunasekuphakameni okunikeziwe.
      - **Isilinganiso esiphelele** = k × isilinganiso sokuphakama: ibanga legridi = ibanga lomhlaba × lesi.
      - **Ukuhlangana**: i-engeli kusukela enyakatho yegridi iye enyakatho yangempela lapho (i-azimuth ye-geodetic = i-azimuth yegridi + ukuhlangana).
   4. Khetha inkinobho {{ui:Ukusetshenziswa}} ngaphansi kwezinombolo ukuze ubeke isilinganiso esiphelele kubhokisi.
3. Setha **Iphoyinti lesisekelo**, lapho amakhoordinethi womhlaba nawegridi efana khona. Liqala ku-0, 0: izifunda eziningi ezishicilela amakhoordinethi womhlaba zisukela emvelaphi, ngakho amakhoordinethi womhlaba ahlala esondele kakhulu kawegridi. Ezinye izinhlolo zisukela eliphoyinti lokulawula lephrojekthi: sebenzisa okushiwo yisurvey.
4. Khetha {{ui:Sebenzisa}}.

:::warning
Ukuphakama kuthathwa njengobude ngaphezu kwe-ellipsoid. I-CivilCraft ayinayo imodeli ye-geoid, ngakho lapho i-geoid ingu-30 m (100 ft) ngaphansi noma ngaphezu kwe-ellipsoid isilinganiso sokuphakama sishiya cishe ngo-5 ppm. Uma i-survey iveza isilinganiso sayo esiphelele, bhala leso.
:::

## Amakhoordinethi endawo (aqagelwayo)

1. Khetha {{ui:Indawo}}.
2. Ye-**Iphoyinti lokulawula 1**, bhala inombolo yephoyinti le-survey (noma khetha {{ui:Khetha}} bese uchofoza ephlanini). Amakhoordinethi awo endawo abonakala eduze kwalo.
3. Bhala i-E ne-N **yegridi** yalo, noma ububanzi nobude balo kubhokisi lesithathu (isibonelo `30.2672, -97.7431`).
4. Yenza okufanayo ku-**Iphoyinti lokulawula 2**, likhashane kakhulu ngangokunokwenzeka kowokuqala.
5. I-CivilCraft ibonisa **Isikali** ne-**Ukujikeka** okutholakele, futhi iyakukhumbuza: **Amaphoyinti amabili ahambisana ngokuphelele — hlola kowesithathu.**
6. Nika **iphoyinti lokuhlola** ngendlela efanayo. I-CivilCraft ibonisa ukuthi ukufaneleka kulibeka kangakanani kumakhoordinethi egridi obhale (ukungavumelani kwalo, ngamayunithi ephrojekthi nangama-parts per million). Ukungavumelani okukhulu kusho iphoyinti elingalungile, iphutha lokubhala, noma amakhoordinethi kwenye iyunithi.
7. Khetha {{ui:Sebenzisa}}.

Isikali esikude no-1 (ngaphezu kuka-0.5 kuya ku-2) siyenqatshwa: hlola amaphoyinti namayunithi awo.

## Okuhlolwe

- Isilinganiso sokuskeyla nokuhlangana kuhambisana ne-PROJ (pyproj 3.7.1 ne-PROJ 9.5.1), ithala lamakhoordinethi elisetshenziswa izinhlelo eziningi ze-GIS, ngesilinganiso sengxenye eyodwa ebhiliyoneni ezinhlelweni ezingaphezu kwezingu-300 ezinamaprojection aphindaphindwayo (state plane, UTM, transverse Mercator, Lambert conformal conic), nasebhrawzeni ephoyinteni elikhethwe ephlanini.
- Izinyathelo zomhlaba nendawo ziguqulwa emuva nangaphambili ngesilinganiso sengxenye eyodwa ebhiliyoneni; amaphoyinti amabili okulawula anikeza kabusha isikali nokujikeka ayenziwa ngakho; iphoyinti lokuhlola elingu-0.05 ft ngaphandle likhombisa ukungavumelani okungu-0.05 ft.
