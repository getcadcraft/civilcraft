---
title: Cutubyada, istaysinnada iyo qaababka tirada
summary: Mashaariicda feet iyo mitir, sida istaysinnada, heerarka, jiifyada dhinacyada, jihooyinka, baaxadaha, mugga iyo cabbirrada tuubooyinka loo qoro iyo loo qoro, iyo waxa beddelidda cutubyada sameyso.
keywords: qor dherer, xisaab, xisaabiye, wadar, qayb, feet iyo inji, 4+7/16, cutubyo, feet, US survey feet, mitir, metric, imperial, qaabka istaysinka, istaysinka, heerka, boqolleyda, jiifka, h:v, jihada, yaard cubic, dhexroor
from: 0b9b5b6b
---

## Cutubyada mashruuca

Mashruuc wuxuu ku jiraa **US feet** ama **mitir** (**Unugyada** ee panel-ka bidix). Qiime kasta, sare-joog, dherer iyo istaysin mashruuca ku jira waxay ku jiraan unugga ka muuqda.

:::warning
Beddelidda **Unugyada** waxay beddeshaa calaamadaha, qaabka istaysinka, defaults-ka iyo sida faylasha loo qoro. Ma beddesho tiro kasta. Goob laga sameeyay feet oo loo beddelo mitir ayaa haysa tirooyinka isku mid ah, hadda loo akhrinayo sida mitir. Status bar-ku wuxuu leeyahay "Unugyada hadda waa mitir. Koorodinadyada lama beddelin." Dhig unugyada inay ku habboon yihiin xogtaada ka hor intaadan naqshadeyn.
:::

Waxyaabaha ku xidhan unugyada:

| | US feet | Mitir |
|---|---|---|
| Qaabka istaysinka | `12+34.56` (istaysin 100 ft) | `1+234.567` (istaysin 1000 m) |
| Fardaha kontuurka la bixiyo | 0.25 ilaa 20 ft | 0.1 ilaa 10 m |
| Baaxadda | sq ft | sq m |
| Mugga | cu yd | cu m |
| Dhexroorka tuubada iyo qaabka | inji | millimitir |
| Radius-ka wareegga caadiga ah | 100 ft | 30 m |
| Calaamadaha istaysinka ee sawirka | mid kasta 50 ft, sumad kasta 100 ft | mid kasta 20 m, sumad kasta 100 m |
| Miisaanka daabacaadda | 1" = 5' ilaa 1" = 1000' | 1:50 ilaa 1:10000 |
| Unugga dherer ee LandXML | USSurveyFoot | meter |

Mashruuc cusub wuxuu bilaabmaa feet, ama mitir marka unugga dhererka ee lagu xusay {{ui:Dejinta}} › {{ui:Guud}} › {{ui:Unugyada}} uu yahay mid metric ah. Liiska **Unugyada** wuxuu muujinayaa unugyada lagu shido halkaas, mar walbana kan mashruuca. Haddii unug baaxad ama mug la xusay (acres, hectares, acre-feet …), baaxadaha iyo mugga waxaa lagu soo warbixinayaa unugaas halkii unugga kor ku qoran. Eeg [Unugyada, qiimayaasha la qoro iyo liisaska unugyada](common:unit-lists).

Markaad furto LandXML, mashruucu wuxuu qaataa unugyada faylka. Fayl feet caalami ah wuxuu furmaa sida mashruuc feet; tirooyinka lama beddelo.

## Qorista dherer iyo wadar

Sanduuq kasta oo qaadanaya dherer ama sare-joog wuxuu akhrinayaa wax ka badan tiro fudud: riix {{key:Enter}} sanduuqu wuxuu muujinayaa natiijada unugyada mashruuca.

| Waxa aad qortid | Mashruuc feet ah | Mashruuc mitir ah |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | isku dherer oo mitir ah |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | feet | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, iyo kuwa kale US survey feet | isku dherer oo mitir ah |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | wadarta, feet | wadarta, mitir |

Mid kasta oo calaamadda dherer ee miiska unugyada la wadaago ayaa shaqeeya, saxda ahaan. Feet mashruuc waa US survey feet, sidaas awgeed `10 US ft` waa 10 iyo `3 ch` (silsilad ku salaysan international-foot) waa 197.9996. Isticmaal `+ - * /` iyo bracket-yada, iyo `abs`, `round`, `ceil` iyo `floor`. Dhib (-) oo lagu qoray dherer waa qayb ka mid ah (`24'-6"`, `6-1/2`); meel bannaan ayey ku jirtaa, wuu kala jaraa (`24' - 6"` = 23.5 ft). Tiro keliya wuu dhufanayaa ama kala qaybiyaa dherer, dherer ahna wuxuu noqdaa unugyada mashruuca marka lagu daro dherer. Haddii CivilCraft aanu akhrin karin waxa aad qortay, sanduuqa waa la calaamadeeyaa, status bar-kuna wuxuu sheegayaa meesha.

Istaysinnadu maaha wadar: `10+00` sanduuqa istaysinka waa istaysin 10+00. Heerarka boqolleyda, lambarrada barta iyo sharaxaadaha waa la akhrinayaa sida ay yihiin.

## Istaysinnada

Istaysin waa masaafo ku taal jeex, oo lagu qoro calaamadda ku-dar:

- Feet: qaybta ka horeysa calaamadda ku-dar waa boqollaal feet. `12+34.56` waa 1,234.56 ft.
- Mitir: qaybta ka horeysa calaamadda ku-dar waa kun-kun mitir. `1+234.567` waa 1,234.567 m.
- Istaysinnada taban calaamadda taban ayey hor ku jirtaa: `-0+50.00`.

Meel kasta oo aad istaysin ku qorto (**Istaysinka bilowga**, **Istaysinka** PVI), waxaad ku qori kartaa calaamadda ku-dar (`12+34.56`) ama lambar fudud (`1234.56`). Meelaha bannaan waa la dhaafaa.

## Heerarka iyo jiifyada

- **Heerarka** (muuqaalka dherer, tuubooyinka, jiifyada dariiqa iyo garoomada) waa boqolleyda: `+1.25%` wuu kor u kacaa marka istaysinku kordho, `-0.50%` wuu hoos u dhacaa.
- **Jiifyada dhinacyada** (gooynta iyo buuxinta pad-ka, gooynta iyo buuxinta koridoorka) waa toosan iyo tuduc: `3` macnaheedu waa 3 : 1, saddex ka dhinac ah hal kor ama hal hoos.
- **K** ee wareegga toosan waa dhererkiisa oo loo qaybiyay isbeddelka heerka boqolleyda.

## Jihooyinka iyo xagasha

Jihooyinku waa jihooyinka afar-geesoodka ah ee darajooyinka, daqiiqadaha iyo ilbiriqsiyada: `N 63°12'05" E`. Wareegyada jeexdu (Δ) waxay isticmaalaan darajooyin, daqiiqado iyo ilbiriqsi isku mid ah, oo leh "bidix" ama "midig".

## Xagashaha

Xagashaha ka fog jeex waa masaafo toosan, lagu calaamadeeyay **L** (bidix) ama **R** (midig) marka lagu eego sare-istaysinka.

## Muujinta lambarada

- Isku-xirka iyo sare-joogga waxay muujinayaan 2 meelood oo dhibcood panel-ka iyo status bar-ka (3 barta sahan dhulka la doortay).
- Baaxadaha iyo mugga waxaa loo kooxeeyay kun-kun: `128,250 sq ft`, `454.9 cu yd`.
- Koorodinadyada weligood lama kooxeeyo, sidaas awgeed waa la koobiyeyn karaa sida ay yihiin.

## Koorodinadyada

CivilCraft wuxuu ka shaqeeyaa diyaarad caadi ah: bari midig, waqooyi kor. Shaqada naqshadeynta mar walba waxay ku dhacdaa koorodinado la mashruuciyay (state plane, UTM ama shabakad maxalli ah). Waad u sheegi kartaa CivilCraft nidaamka koorodinadyada, iyo haddii ay yihiin koorodinado shabakad, dhul ama maxalli; markaas wuxuu muujinayaa latitude iyo longitude, wuuna dhigaa faylasha GIS iyo layers-ka khariidadda, laakiin weligiis ma beddelo unugyada ama ma dhaqaajiyo koorodinadyadaada. Eeg [Deji nidaamka koorodinadyada mashruuca](topic:coordinate-systems) iyo [Koorodinadyada dhulka iyo kuwa maxalliga ah](topic:ground-and-local-coordinates). Qiyamka state plane ee waaweyn (malaayiin feet) waa fiican yihiin; CivilCraft wuxuu ku shaqeeyaa xagga goobta gudaheeda si uu saxnaanta u ilaaliyo.
