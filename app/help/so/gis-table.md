---
title: Ka shaqee miiska sifooyinka lakabka
summary: Eeg goob kasta oo lakab GIS ah sida miis, habee oo shaandhee, dooro safafka iyo goobaha, hagaaji qiimayaasha, ku dar goobo, xisaabi qiyamka cusub, oo kaydi miiska sida CSV.
keywords: miiska sifooyinka, miis, goobo, tiirar, safaf, habayn, shaandhayn, expression, dooro, tafatir, xisaabiyaha goobta, xisaabi, ku dar goob, magac u beddel goob, ka saar goob, csv, dhoofin, gis, shapefile, geopackage, qaab
from: fd9d6c11
---

Fur miiska lakab ka **saddex dhibic** liiska lakabyada GIS ({{ui:Miiska sifooyinka…}}), ka Dusha › Wax dheeraad ah › {{ui:Miiska sifooyinka}}, ama ku qor `ATTRIBUTES`, `ATTTABLE` ama `TABLE`. Miiska wuxuu furmaa dhinaca qorshaha wuuna sii joogaa intaad ku shaqeynayso. Safafka aad aragto oo keliya ayaa la sawiraa, sidaas darteed lakab leh kun-kun goob wuu furmaa oo wuu si degdeg ah u dhaqaaqaa.

## Habayn, shaandhee iyo dooro

- **Habayn:** riix cinwaanka tiirka. Riix labaad wuu rogaa, saddexaad wuxuu soo celinayaa amarka faylka. Qiimayaasha madhan had iyo jeer waxay ku sii jiraan hoose. Habaynta waxay beddeshaa wixii aad aragto oo keliya, lakabka ma beddesho.
- **Shaandhee:** ku qor sanduuqa shaandhaynta. Expression sida `AREA > 500 and USE = 'Res'` wuxuu hayaa safafka ay run tahay (erayada isku mid ah ee tabka Dooro ee [Falanqee lakabyada GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Wax aan expression ahayn, sida `oak maple`, ayaa erayadaas ka raadiya tiir kasta.
- **Dooro safafka:** riix safka. Ctrl+riix wuxuu ku daraa ama wuu ka saaraa mid, Shift+riix wuxuu doortaa silsilad, {{ui:Dooro safafka la muujiyay}} wuxuu qaadaa safaf kasta oo shaandhaha sii dhaafa. Goobaha la doortay waxa lagu sawiraa qorshaha, riix goob qorshaha ku jirta wuxuu doortaa safkeeda halkan.
- Markii safafka la doortay, waxaad {{ui:Weynee}} ilaa iyaga, samayn kartaa **lakab xulashada ka**, oo ka akhrisan kartaa wadarta aagga ama dhererka sadarka xaaladda.

## Hagaaji qiimayaasha

Riix laba jeer unugga (ama u gudub arrow keys oo riix Enter), qor qiimaha cusub oo riix Enter. Escape wuxuu ka tagayaa sidii ay ahayd. Qiimuhu waa inuu ku habboonaado tiirka: tirooyinka sida tirooyin, taariikhaha sida `YYYY-MM-DD`, haa/maya sida yes, no, true ama false. Qiime aan ku habboonayn waa la diidaa, sabab-sheegidda, wixna ma beddelmo. Sanduuq madhan ayaa qiimaha madhan dhigaysa. Tafatir kasta waa hal tallaabo oo dib loo noqdo: {{ui:Ka noqo}} iyo {{ui:Samee mar kale}} waa hoosta miiska, Ctrl+Z wuxuu ka shaqeeyaa qorshaha.

## Goobaha

Hoosta **Goobaha** waxaad ku dari kartaa goob (qoraal, tiro, taariikh ama haa/maya), magac u beddeli kartaa mid, ama ka saari kartaa mid. Goob cusub wuxuu ku bilaabmaa madhan. Magac-beddelku wuu raacaa: goobta calaamadda iyo [qaabka sifada ku salaysan](topic:gis-symbology) ee lakabka ayaa u gudba magaca cusub, iyo goob ka saaridda waxay tirtiraysaa calaamadda iyo qaabka ku isticmaalay. Mid kasta waa hal tallaabo oo dib loo noqdo oo wax walba soo celinaysa.

## Xisaabiyaha goobta

Wuxuu qori qiime safaf kasta (ama safafka la doortay oo keliya) iyada oo laga qaadayo goobaha kale ee safka, qaabkiisa iyo shaqooyin yar. Dooro goob jirta ama **Goob cusub…** oo siiso magac iyo nooc. Waxba lama fuliyo sida code: expression-ka waxa akhrisa falanqeeye yar oo leh liis go'an oo shaqooyin.

| Koox | Erayada |
|---|---|
| Tirooyin | `+ - * /`, xidhmooyin, `abs round(x, digits) floor ceil sqrt pow min max` |
| Qoraal | `upper lower trim len substr(text, from, count) left right replace concat` (qoraalku wuxuu galaa 'xigasho hoose'; magaca goob meel bannaan ku jiro wuxuu galaa "xigasho laba jibbaaran" ama [xidhmo jibbaaran]) |
| Doorasho | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Taariikhaha | `year month day` oo ah qiime `YYYY-MM-DD` |
| Geometry | `$area $perimeter $length $x $y $vertices`, cutubyada mashruuca |

Natiijo aan lagu kaydin karin nooca goobta (qoraal goob tiro ah) waa madhan tahay oo wuxuu tirin fariinta. Qaybinta eber wuxuu siiyaa qiime madhan. Tusaale ahaan `round($area / 43560, 2)` wuxuu qoraa acre-yada laga bilaabo fiit laba jibbaaran.

## Dhoofinta

{{ui:Dhoofi CSV}} wuxuu kaydiyaa safafka aad aragto (kadib shaandhaha iyo habaynta) sida faylka CSV ee UTF-8 leh magacyada goobaha sadarka koowaad. Qoraal ku bilaabma `=`, `+`, `-` ama `@` wuxuu helaa apostrophe horteeda si spreadsheet-ku uusan u fulin sida formula. Si aad lakabka laftiisa u kaydiso, isticmaal [Dhoofi xogta dhismaha dhabta ah ee GIS](topic:gis-export).

## Xaddidaadyo

Miiska wuxuu muujinayaa lakabka hal amar habayn iyo hal shaandhe mar kasta. Safafka halkan lama dari karo ama lama tirtiri karo (ku samee lakab cusub xulasho ka), geometry-ga lama tafatiro, nooca goob lama beddeli karo markii la sameeyo.
