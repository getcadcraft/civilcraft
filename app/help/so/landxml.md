---
title: Isweydaarsashada LandXML
summary: Ka fur LandXML ka software kale oo civil ah sida mashruuc cusub, dhoofi barooyinka, dusha, toosinta, muuqaalka iyo shabakada tuubooyinka sida LandXML 1.2, oo ogow waxa aan ka dhicin safarka.
keywords: landxml, xml, soo-geli, dhoofin, isweydaarsasho, tin, dusha, toosin, muuqaalka, shabakada tuubooyinka, is-kaashi, isweydaarsashada xogta
from: 870d5ece
---

LandXML waa qaab furan oo isweydaarsasho oo barnaamijyada civil ee badankood akhriyaan oo qoraan. CivilCraft wuxuu akhriyaa oo qoraa LandXML 1.2. Haddii aad Civil 3D isticmaashay, daaqadaha soo-geli iyo dhoofinta LandXML-ka ayaa ku dhow. Halkan ma jiraan doorasho aad sameyso; faahfaahinta ayaa kuu sheegaysa waxa laga reebay.

## Fur fayl LandXML

1. Guji {{ui:Open}} (ama riix {{key:Mod+O}}) oo dooro faylka `.xml` ama `.landxml`, ama ku ridi qorshaha.
2. Haddii mashruuca hadda jira uu leeyahay isbeddel aan la kaydin, CivilCraft ayaa marka hore weydiin doona. Dooro {{ui:Save a copy}}, {{ui:Don’t save}} ama {{ui:Cancel}}.
3. **Mashruuc cusub** ayaa la sameeyaa. Status bar-ku wuxuu sheegayaa waxa la akhriyay, tusaale ahaan "Waa la furay site.xml: 412 barood, 2 dusha, 3 toosin."
4. Eeg sanduuqa ku hoos jira xogta **Dusha**. Wuxuu liistaa wax kasta oo la reebay ama la beddelay, tusaale ahaan:
   - "Dusha koowaad ("EG") oo keliya ayaa la furay; faylka waxa uu leeyahay 1 oo kale."
   - "Toosinta "Ramp A" waxa ku jira elementiyo CivilCraft aan weli xariiq ahaan u sawiri karin (ma aha xariiqyo, qaansoyo ama spiral-yo clothoid ah); waa la reebay."
   - "Xeerarka shabakada tuubooyinka ma ku jirin faylka; placeholder-yada ayaa la isticmaalayaa — dejiso kaaga Mashruuca ku jira."

Waxa noqda waxa:

| Faylka gudihiisa | CivilCraft gudihiisa |
|---|---|
| Unit-yada (Imperial ama Metric) | **Unit-yada** mashruuca (cagaha ama mitirka) |
| Magaca mashruuca | **Magaca** mashruuca |
| CgPoints | Barooyinka mashruuca; sharraxaadda (ama code-ka) waxay bixisaa kooxda |
| TIN-ka koowaad | Dhulka jira, sida uu yahay ("Surface (from LandXML)") |
| Toosin kasta oo xariiqyo, qaansoyo iyo clothoid spirals | Toosin leh PI-yadeeda, radius-yadeeda iyo dhererka spiral-ka dib loo dhisay curve-yada |
| Muuqaalka naqshadda ee koowaad ee toosin kasta | Muuqaalka naqshaddiisa, leh dhuuntada parabolic-ka ah |
| Shabakada koowaad ee tuubooyinka | Shabakada tuubooyinka, oo leh rim-yadeeda, sump-yadeeda iyo invert-yadeeda |
| Khad muuqaalka xariiqyada iyo qaansoyada | Khadadka muuqaalka, qaansoyada oo la xaajiyay; kuwa app kale ka yimid waxay ku bilaabmaan **Kaliya la sawiray** |

Liiska buuxa ee elementiyada iyo sifooyinka waa ku jira [LandXML: waxa la akhriyo oo la qoro](topic:landxml-reference).

:::note
Dusha laga akhriyay LandXML lama dib u dhisin marka aad beddesho kooxaha barooyinka ama aad xariiqyo jaajuul ah sawirto. Guji {{ui:Rebuild the surface from the points}} qaybta **Dusha** si aad uga dhisto barooyinka halkii ay ka ahaan lahayd (ayaa {{key:Mod+Z}} soo celinaysa dusha LandXML).
:::

## Dhoofi LandXML

1. Guji {{ui:LandXML}} kooxda **Dhoofinta**.
2. Browser-ku wuxuu soo dejiyaa `<name>.xml`. Status bar-ku wuxuu sheegayaa waxa gudihiisa galay, tusaale ahaan "Waa la dhoofiyay LandXML 1.2: 276 barood, 2 dusha, 1 toosin, shabakada tuubooyinka. Pad-yada ma ku jiraan LandXML halkan; dusha sare-u-qaadan ayaa ku jira."

Faylku wuxuu leeyahay:

- **Unit-yada**: cagaha survey-ka Mareykanka ama mitirka.
- **CgPoints**: barta kasta oo lambarkeeda magac u ah, sharraxaaddeeda iyo kooxdeeda code u ah.
- **Surfaces**: dhulka jira sida TIN, oo leh xariiqyadiisa jajabka iyo xuduudka dibadda sida xogta isha; iyo, marka pad-yada ama corridor-yada sare-u-qaadaan, dusha TIN ee labaad oo lagu magacaabay "Proposed".
- **Alignments**: xariiqyo, qaansoyo iyo clothoid spirals oo leh stations-kooda, mid kasta leh muuqaal ku jira dhulka jira ee la tusaalayo iyo muuqaalka naqshadda (PVI-yada iyo dhuuntada parabolic-ka) marka uu leeyahay ugu yaraan laba PVI.
- **PipeNetworks**: qalabka oo leh rim-yadooda, sump-yadooda iyo invert tuubo kasta, iyo tuubooyinka oo leh diameter, dherer iyo slope.
- **PlanFeatures**: khad muuqaal kasta oo ah xariiqyo iyo qaansoyo oo leh dhererka dhammaadka kasta iyo waxa loo isticmaalo.

## Waxa aan ka dhicin safarka

- Pad-yada iyo corridor-yada sida shay. Natiijadooda waxay ku jirtaa dusha "Proposed".
- Toosinta leh khaladaad (tusaale ahaan qaansoyo isku-dhacaya): waa la reebay, waxaana lagu tiriyaa fariinta status-ka.
- Tuubooyinka aan labada invert lahayn, iyo shabakadaha ka yar laba qalab.
- Rim-ka laga qaatay dusha waxa loo qoraa rim go'an. Marka dib loo furo, qalabku wuxuu hayaa lambaraas xitaa haddii dusha isbeddesho.
- Xeerarka shabakada (slope-ka ugu yar, daboolka, hoos-u-dhicid): LandXML ma leh meel loogu talagalay.
- Dejinta muuqaalka iyo doorashooyinka dusha ee kooxaha barooyinka: u kaydi mashruuca CivilCraft sidaas.

Marka la furayo, CivilCraft ma akhrin karo spiral-yo aan clothoid ahayn, dusha grid-ka, barooyin kaliya tixraacaya barooyin kale, parcels, spiral-yo khad muuqaal ah, roadways ama xogta sahanka. Mid kasta waa la xusayaa fariimaha, waana aan la male-awaaynin.

## Wareegyada

Si aad shaqada u siiso qof isticmaalaya software civil kale oo aad mar kale hesho, dhoofi LandXML, ha u sahlo inuu tafatiro, kadibna fur LandXML-kiisa sida mashruuc cusub. Sii hay `.civilcraft.json` adigu, sababtoo ah waa faylka keliya ee wax kasta oo CivilCraft yaqaan kaydiya.
