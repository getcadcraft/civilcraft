---
title: Hannaðu garð frá upphafi til enda
summary: Tíu skref landslagsarkitektsins, frá mælingunni til útgefna safnsins, með því sem Landslagsvinnusvæðið gerir fyrir hvert þeirra í dag og því sem það gerir ekki enn.
keywords: kennsla, leiðbeiningar, hvernig á að, landslagshönnun, garðhönnun, byrjun, dæmi, sýnishorn, skref fyrir skref, mæling, línuteikning, landlíkan, landmótun, gróðursetning, listi, blöð, útgáfa, eitt verkefni
from: 87900bf5
---

Landslagshönnun gengur í hring: mæling, skissa, línuvinna, landlíkan, svæði, kótar, gróðursetning, listar, blöð, og aftur til baka. Þetta eru tíu skrefin, með því sem er til fyrir hvert þeirra. Þar sem skref hefur eyðu er hún nefnd í **Ekki byggt enn** aftast, og ekki falin í skrefinu.

Þú getur fylgt eftir á sýnisvæðinu, eða á þinni eigin mæliteikningu. Með þinni eigin byrjar þú á skrefi 1.

## 1. Flyttu inn mælinguna

{{ui:Yfirborð}} › {{ui:Línur úr teikningu…}}, veldu mæliteikninguna (DWG 2000–2018 eða DXF). Athugaðu einingarnar, taktu hæðarlínurnar, 3D-fjölllínurnar og mörkin fyrir yfirborðið, og punktablokkirnar sem mælipunkta. Hlutinn **Mælikótar og athugun** les kóta skrifaða sem texta eða sem eigind og listar það sem lítur illa út (einingar, hnitakerfi, fjarlægð frá núlli, flatar hæðarlínur, undarlegir kótar, tvöfaldir punktar) áður en þú bætir einhverju við. Sjá [Athugaðu mæliteikningu við innflutning](topic:survey-check) og [Opnaðu DWG eða DXF sem línuteikningu](topic:open-dwg-dxf). Stilltu hnitakerfið með {{ui:Hnitakerfi…}}.

## 2. Handskissur

Blað á pappír, eins og gömul mæling eða merkt útprentun, kemur inn með {{ui:Skanna…}} (Byrja frá skönnun): það er staðsett í réttum mælikvarða eða á þekktum hnitum undir grunnmyndinni, og má rekja í línuteikningu. ModelCraft les ljósmynd af handskissu (Skrá › Flytja inn ljósmynd af skissu…). CivilCraft sjálft hefur ekkert verkfæri fyrir handskissu: settu blaðið undir grunnmyndina og teiknaðu yfir það.

## 3. Úr skissu í línuteikningu

Teiknaðu eiginlínur og útlínur yfir mælinguna í CivilCraft, eða teiknaðu þær í 2D-teikningunni. Landslag › Meira › {{ui:Úr línu}} breytir línu í stéttarlögn, gróðursvæði, vegg, þrep, eiginlínu og fleira, og heldur tengslunum: færðu línuna og hluturinn fylgir. Sjá [Hlutir úr línuteikningu](topic:objects-from-lines). Í SuperCad Studio opnar þú lóðina, teikninguna og byggingarlíkanið í einu verkefni: **Landslag**-vinnusvæðið hefur verkfæri allra þeirra, og lína valin í 2D-teikningunni getur orðið landslagshlutur sem fylgir henni (Ctrl+K, {{ui:Landslagshlutur úr völdu teikningarlínunni}}).

## 4. Fyrirhugað landslag

Opnaðu {{ui:Yfirborð}} › {{ui:Meira}} › {{ui:Landslagsvinnusvæði}}. Byggðu fyrirhugað landslag með {{ui:Stallur}}, {{ui:Jarðhryggur}}, {{ui:Grunnskurður}} og landmótunarsvæðum með punktakótum og hæðarlínum; stéttarlagnirnar, stígarnir, veggirnir, rampar og þrep sem þú bætir við eru mótuð inn í sama fyrirhugaða yfirborðið. Núverandi landslag breytist aldrei. {{ui:Kótar}} › {{ui:Landbreytingar…}} listar allt sem mótar landið í einni röð, með skurði og fyllingu fyrir hvert. Sjá [Landmótun](topic:landscape-grading) og [Landbreytingar og lifandi kótar](topic:ground-modifiers).

## 5. Stéttarlagnir og gróðursvæði

{{ui:Harðyfirborð}} › {{ui:Stéttarlögn}}, {{ui:Stígur}}, {{ui:Veggur}}, {{ui:Kantsteinn}}, {{ui:Rampa}} og {{ui:Þrep}}. {{ui:Svæði}} teiknar flöt, beð, engi eða jarðhulu með uppbyggingu sinni; það klippir sig sjálft í kringum stéttarlagnir, veggi og þrep. {{ui:Beð}} fyllir svæði með bili plantnanna, úr blöndu plantna. Sjá [Harðyfirborð](topic:hardscape), [Gróðursvæði](topic:planted-areas) og [Gróðursetning](topic:planting).

## 6. Kótar, hallar og tengingar

Undir **Landmótunarathugunum** hakarðu við **Hallagreining** og **Flæðisörvar og vatnssöfnun**. Ef vatn safnast við verönd, bættu {{ui:Grunnskurður}} utan um hana. Eiginleikar segja þér hversu margar hækkanir þrepin þurfa og hvort þau passa, og hvar stígur er brattari en mörk hans. Vandamálaspjaldið listar hvar hlutir mætast illa: veggur yfir hæð sinni, beð fyrir ofan stéttarlögnina, þrep sem ná ekki í pallinn sinn. {{ui:Punktakóti}} og {{ui:Hallaörv}} merkja landið og uppfærast sjálfkrafa.

## 7. Gróðursetning

Í **Plöntum** leitarðu í plöntulistanum (nokkur hundruð tegundir, eða þinn eigin lista), velur eina og {{ui:Planta}}, {{ui:Beð}} eða {{ui:Limgerði}}. Stilltu stærð plöntunnar og merkingar úr {{ui:Meira}}. {{ui:Meira}} › {{ui:Plöntutafla}} breytir þínum eigin færslum: yrkjum, gefnum stærðum, þéttleika, forskriftaskýringum. Hver færsla getur borið þitt eigið tákn og 3D-líkan (OBJ, STL eða GLB), og {{ui:Myndmerki gróðurs}} teiknar plöntur einfaldari við grófari mælikvarða. Sjá [Plöntulistinn](topic:plant-list), [Plöntufærslur](topic:plant-records) og [Myndmerki gróðurs](topic:plant-graphics).

## 8. Magn og listar

{{ui:Meira}} › {{ui:Vinnublöð}}: gróðurlistinn og harðyfirborðslistinn, og þínir eigin, haldast tengdir hlutunum; vistaðu þá sem CSV eða XLSX eða settu þá á blöðin (sjá [Vinnublöð](topic:worksheets)). {{ui:Meira}} › {{ui:Plöntulisti…}} sendir fjöldana til TakeoffCraft. Magntölur harðyfirborðsins eru í eiginleikum stéttarlagna, veggja og þrepa. Áveita hefur sinn eigin efnislista: {{ui:Áveita}} › **Athuga kerfið…**. Sjá [Áveita](topic:irrigation).

## 9. Teikningar og blöð

{{ui:Meira}} › {{ui:Landslagsblöð…}}: gróðursetningar-, landmótunar- og áveituáætlanir, með smáatriðum. {{ui:Kótar}} › {{ui:Sniðlína}} teiknar snið í gegnum landið, veggi, uppbyggingar, þrep og plöntur. Sjá [Landslagsblöð](topic:landscape-sheets) og [Snið og útgáfusafnið](topic:landscape-sections).

## 10. Gefa út

{{ui:Útgáfusafn (.zip)}} í blaðaglugganum býr til eina PDF-skrá með blaðalista og DWG-skrá fyrir hvert blað. {{ui:Meira}} › {{ui:Flytja út landslags-IFC}} gefur BimCraft plönturnar og harðyfirborðið. Vistaðu verkefnið: allt er í einni skrá.

## Breyttu einu: stiganum

Tilgangurinn með því að halda öllu í einu verkefni er að breyting fylgir alla leið. Prófaðu það með stiga milli tveggja verönda:

1. Teiknaðu línu stigans sem eiginlínu (eða línu í teikningunni), og síðan Landslag › Meira › {{ui:Úr línu}} › {{ui:Þrep}}. Hakaðu í **Mótar landið** í eiginleikum þrepanna, og stilltu neðri og efri kóta á veröndurnar tvær.
2. Teiknaðu gróðurbeð við hlið og undir stiganum með {{ui:Svæði}}, og stéttarlögn á veröndunum. Beðið klippir sig í kringum þrepin og stéttarlögnina, og plöntulistinn telur aðeins það sem er gróðursett.
3. Hækkaðu efri kóta stigans í eiginleikum. Fyrirhugað landslag, punktakótarnir, hallaörvarnar og skurður og fylling breytast í einu. Ef stiginn nær ekki lengur efri verönd, segir Vandamálaspjaldið hversu mikið.
4. Færðu línu stigans. Þrepin fylgja línu sinni í sama afturkallsskrefi; beðið klippir sig aftur og er talið aftur, og vinnublöð og listar sýna nýju tölurnar.
5. Ýttu einu sinni á Ctrl+Z: línan, þrepin, landið og beðið fara öll til baka saman.

Sjá [Landbreytingar og lifandi kótar](topic:ground-modifiers), [Gróðursvæði](topic:planted-areas) og [Vinnublöð](topic:worksheets).

## Ekki byggt enn

Þetta er óskað eftir og er ekki í þessari útgáfu:

- Veggir sem móta landið (þeir sýna hvar þeir mætast því og veggkápan þeirra getur fylgt því).
- Breyting á þínum eigin plöntulista úr Safni í forritinu (breyttu lista verkefnisins og vistaðu hann sem plöntuskrá).
- Áferð og litir þinna eigin GLB-plöntulíkana (lögunin er lesin; litur plöntunnar er notaður).

Sjá [Landslagsvinnusvæðið](topic:landscape) fyrir hvert verkfæri.
