---
title: Mugga dhulka la qodo iyo la buuxiyo
summary: Akhri mugga la gooyo, la buuxiyo iyo kan net-ka ah ee u dhexeeya dhulka jira iyo dusha la soo jeediyay, pad kasta, koridoor kasta iyo wadarta, oo fahan habka grid ee ka dambeeya.
keywords: mugga, dhulka, gooyn, buuxin, net, gooyn iyo buuxin, tirooyin, habka grid, isbarbardhigga dusha, dusha mugga, yaard saddex-geesood, mitir saddex-geesood
from: 299d7bc7
---

Mar kasta oo pad ama koridoor si aan dhibaato lahayn u shaqeeyo, CivilCraft wuxuu barbar dhigaa dusha la soo jeediyay iyo dhulka jira, wuxuuna warbixinayaa gooyn iyo buuxin. Tirooyinku isbeddel kasta waa la cusboonaysiinayaa.

## Meelaha lagu akhriyo

- **Earthwork** ee panel-ka midig marka waxba la xulan (muuqaalka **Project**), markii ugu yaraan hal pad ama hal koridoor la jiro.
- **Earthwork** ee panel-ka midig marka pad la xulay (wadarta isku mid ah ee mashruuca oo dhan).
- Sadarka hoose ee dejinta koridoorka, oo leh gooynta iyo buuxinta koridoorkaas.

Block-ka **Earthwork** wuxuu muujinayaa:

- **Cut**, **Fill** iyo **Net** (oo ay ku xigto "fill" ama "cut", kii weyn)
- sadar kasta marka ka badan tahay mid hal, tusaale: "Pad 1: cut 120.4 cu yd, fill 310.2 cu yd"
- sadarka habka: "Grid method: existing ground and the graded surface sampled every 0.5 ft inside the daylight lines (92,891 cells). No swell or shrink applied." Tarjumaadda: "Habka grid: dhulka jira iyo dusha la hagaaseeyay oo lagu soo qaaday 0.5 ft kasta gudaha jeexyada daylight (92,891 unug). Ma jiro isbeddel kor-u-kac ama hoos-u-dhac la dabaqay."

Mugga waxaa lagu qoraa cu yd mashruuc feet ah iyo cu m mashruuc mitir ah.

## U dir TakeoffCraft

Si aad qiimeyso shaqada dhulka, dooro {{ui:U dir TakeoffCraft}} hoosta block-ka **Earthwork**. CivilCraft wuxuu kaydiyaa fayl tirooyin (`<site>.quantities.json`) oo leh laba tiro: gooyn iyo buuxin, cu yd (mashruuc feet) ama cu m (mashruuc mitir), isla tirooyinka block-ka, ilaa boqolka. Fur gudaha TakeoffCraft adigoo isticmaalaya **Fur xisaabinta qadarka**, ama dhig halkaas: waxay noqdaan laba shay oo aad qiimeyn kartaa ([Gooyn iyo buuxin oo CivilCraft ka timid](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Mar kale dir kadib isbeddel, kadibna fur faylka cusub: shayada isku mid ahi waxay qaadanayaan tirooyinka cusub.

Wadarta keliya ayaa la diraa, sidaas awgeed waxba laba jeer lama tirinayo; sadarka faylku wuxuu liistaa gooynta iyo buuxinta pad kasta iyo koridoor kasta.

## Sida loo xisaabiyo

CivilCraft wuxuu isticmaalaa **habka grid**:

1. Shabakad unugyo labajibbaaran ah ayaa lagu daboolaa meesha ku jirta jeex kasta oo daylight.
2. Bartta unug kasta dhexdeeda, labada dusha ayaa la tijaabiyaa.
3. Unug kasta waxaa loo tiriyaa sida prism: farqiga sare-joogga oo lagu dhufto baaxadda unugga. Meesha dusha la soo jeediyay ka hooseyso, waa gooyn; ka sarreyso, waa buuxin.
4. Unugyada oo dhan waa la isku geeyaa.

Cabbirka unugga adiga lagama doorto: wuxuu la falgalaa si uu afar-geesoodka ku wareegsan meelaha la shaqeeyey u qabto ilaa 250,000 unug, oo loo wareejiyay qiime tayo leh (1, 2 ama 5 jeer awood tobanka). Weli ma dooran kartid adigu. Sadarka habku wuxuu sheegayaa cabbirka iyo tirada unugyada. Unugyada yaryar waxay ka saxsan yihiin xuduudaha; unugyada oo dhan ee u dhexeeya dusha siman ee fidsan natiijadu waa sax.

## Waxa aad ogaataa

- Kaliya baaxadda gudaha jeexyada daylight ayaa la tiriyaa. Dhulka ka baxsan waa isla sidiisii.
- Pad ama koridoor dhibaato leh lama gooyo, lamana buuxin, wax ku darna ma leh. Haddii block-ka yiraahdo "No volumes yet: a pad needs to grade without problems.", fiiri sanduuqa cas ee ka sarreeya.
- Meelaha ay shayadu isku dhacaan, midda dambe ayaa midda hore ka beddelaa gudaha jeexdeeda daylight, isku dhacuna hal mar ayaa la tiriyaa.
- Ma jiro isbeddel kor-u-kac ama hoos-u-dhac la dabaqay. Natiijooyinka isku dhufo haddii aad u baahan tahay mugga bank, loose ama compacted.
- Qodista dhulka sare, qoto dheerka waddada iyo dhulka hoose, iyo mugga TIN-to-TIN prism weli ma diyaar.

## Hubinta natiijada

- Ku shid **Proposed (graded)** ee **Bandhigga** oo eeg kontuurrada gudaha jeexyada daylight.
- Mowshirka ku dhaaf meesha la shaqeeyey: status bar-ku wuxuu muujinayaa **Ground** iyo **Graded**. Farqigu waa qotodheerka gooyn ama buuxin meeshaas.
- Koridoor ahaan, sadarka muuqaalka dherer wuxuu muujinayaa gooyn ama buuxin dhexe kasta.
