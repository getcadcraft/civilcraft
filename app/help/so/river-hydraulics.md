---
title: Qorshayaasha dusha biyaha ee webiga
summary: Webiga ka dhig dhulka jira oo xisaabi qorshayaasha dusha biyaha joogtada ah ee socda habka tallaabada heerka (standard step): heerarka biyaha, tamarta, xawaaraha, tirada Froude iyo daadka qorshaha. Qaybta shaybaarka; natiijo kasta waxay u baahan tahay dib-u-eegis injineer.
keywords: xeed (levee), aagga socodka aan waxtar lahayn, tafatiraha qaybta, webi, hayodoolik, qorshaha dusha biyaha, biyo-dib-u-soo-noqod (backwater), habka tallaabada heerka, socod joogto ah, 1d, qaybaha-jarka, manning, adkaan, qaadista (conveyance), qoto-dheer khatar, qoto-dheer caadi, froude, khadka tamarta, aagga daadka, dooxada daadka, daadashada, barta xeebta, dhererka qaybta, yaraynta (contraction), ballaarinta (expansion), ka hooseeya khatarta, ka sarreeya khatarta, nidaam isku-dhafan, dhac hayodoolik
from: fb8bf425
---

CivilCraft wuxuu xisaabiyaa qorshayaasha dusha biyaha joogtada ah ee hal-cabbir ah, dhererka webiga: qiimo kasta oo socod ah oo aad siiso, heerka biyaha qaybta kasta oo laga qaaday, isla-markaana isu-dheelitirka tamarta ee u dhexeeya qaybaha deriska ah (habka tallaabada heerka). Waa mid ku jira shaybaarka inta la hubinayo.

**Kaalmo naqshadeed oo keliya.** Heerarka biyaha waxay u baahan yihiin dib-u-eegis injineer oo khibrad leh intaan qofna isku halayn: moodel 1D waa sida qaybahiisa, qiimaha adkaanta, dhererka qaybta iyo xuduudaha oo kaliya ayay tahay, mana garanayso buundooyinka, dhuunta ama socodka ka baxa webiga.

## Webiga sawir

1. Marka hore dhis dusha dhulka jira (barta, khadadka-jeexa, ama TIN aad furtay).
2. Hoosta **Dusha** › {{ui:More}}, dooro {{ui:River}}.
3. Riix xariiqda dhexe ee webiga **laga bilaabo hoosta-socodka ilaa hoosta** (from upstream to downstream), kadibna riix {{key:Enter}} ama laba-jeex.

CivilCraft wuxuu jarjaraa qayb toos ah oo xariiqda dhexe ah 50 m (200 ft) kasta, 100 m (300 ft) dhinac kasta, dhulka. Saldhigyada webiga waxay ka tirinayaan dhamaadka hoose, sidaas darteed way kordhaan ka sarreeya socodka. Xeebaha waxay bilaabmaan sida qiyaas 10 m (30 ft) labada dhinac qaybta kasta oo ka hooseeya barta ugu hoosaysa.

Si aad u darto qayb meesha webigu yaraado ama qalab uu ku yaal, dooro webiga, riix {{ui:Add a section}} oo jar khad jeexa oo dhaadheer (labada jihoodba way shaqeeyaan: waa la rogaa si uu u socdo bidix ilaa midig marka laga eego hoosta-socodka).

## Webiga dejin

Dooro webiga si aad uga aragto **Sifooyinka**:

- **Flow regime**: ka hooseeya (caadiga: lagu xisaabiyo ka sarreeya socodka xuduudda hoose), ka sarreeya (lagu xisaabiyo hoos-socod xuduudda sare), ama isku-dhafan (labadaba, markaas midka leh force-ka gaarka ah ee weyn qayb kasta; hordhac).
- **Flow profiles**: magac iyo socod kasta (tusaale 10-sano iyo 100-sano), iyo xuduudda hoose (iyo sare marka nidaamku aanu ka hooseyn): **Normal depth** oo leh energy slope (bed slope waa qiyaas hore), heerka **Known water surface**, ama **Critical depth**.
- **Sections from the ground**: fogaanta, inta bidix iyo midig, qiyaasta xeebta iyo labada qiime ee Manning's n; {{ui:Cut sections again}} wuxuu beddelaa qaybaha (hal tallaabo oo laga noqon karo).
- **Miiska qaybaha**: qayb kasta, fogaanshaha xeebta bidix iyo midig, Manning n ee channel-ka iyo overbank-ka, dherer qaybta ilaa qaybta xiga ee hoose (overbank bidix, channel, overbank midig; laga cabbiray qorshaha si uu u bilaabmo) iyo isku-xirnaanta contraction iyo expansion (0.1 iyo 0.3 si loo bilaabo: isbedel tartiib ah). {{ui:Edit}} wuxuu furaa tafatiraha qaybta (xiga); dhibcaha ka dambeeya wuxuu muujinayaa in qaybtaas leedahay xeed ama aag aan waxtar lahayn.

Isbedel kasta waa hal tallaabo oo laga noqon karo ({{key:Mod+Z}}).

## Qaybta tafatirka: xeebaha, xeedka iyo aagagga aan waxtarka lahayn

{{ui:Edit}} qaybta wuxuu sawiraa dhulkeeda, waxaana aad jiidi kartaa waxa xalliyuhu akhriyo: **xeebta bidix iyo midig** (waxay qaybta u kala jebiyaan overbank-ka bidix, channel-ka dhexe iyo overbank-ka midig), **xeed** labada dhinac iyo **aagagga socodka aan waxtar lahayn**. Dhammaan gacmaha waxaa lagu dhaqaajin karaa furayaasha jihada (arrow keys), dhammaan tirooyinka waxaa lagu qori karaa xagga sawirka. {{ui:Apply}} waa hal tallaabo oo laga noqon karo.

- Xeed (**levee**) wuxuu leeyahay meel (fogaansho) iyo sare-dhaadheer qulqulka (crest). Dhulka ka dambeeya, oo ka fog webiga, waa la gooyaa webiga ka hor inta dusha biyaha ka hooseeyo crest-ka: aagiisa, perimeter-ka qoyan iyo conveyance-kiisa waa la reebaa. Ka sarreeya crest-ka qaybta oo dhan ayaa mar kale tirinta. Xeedku wuxuu taagan yahay dibadda xeebta uu ilaaliyo; kan ku jira xeebaha waa la calaamadiyaa.
- **Aagga socodka aan waxtar lahayn** (ineffective flow area) wuxuu haystaa biyo laakiin ma qaadayo socod (godka ka dambeeya bannaanka, biyo dhimanaya dhinaca jidka buundada). Siiso labada fogaansho, iyo haddii aad doonto, heer biyo oo ka hooseeya kaas aagga aan waxtarka lahayn yahay ({{ui:always}} haddii madhan): ka sarreeya heerkaas wuxuu u socdaa sida kuwa kale. Mid qayb ka ah channel-ka ugu weyn waa la calaamadiyaa.
- Labada qaybood dhexdooda, daadka dhulka xeedka ka dambeeya oo labadoodaba leh, wuxuu ka tagaa qalalan, marka dusha biyaha halkaas ka hooseeyo crest-ka (khadka u dhexeeya labada crest waa toos).

## Xisaabi iyo akhri natiijooyinka

Riix {{ui:Water surface profiles}}. Qorshaha aad dooratid waxaad heleysaa:

- **garaaf** dhinaca webiga (socod bidix ilaa midig): hoosta channel-ka, xeebaha, dusha biyaha, khadka tamarta iyo dusha biyaha qoto-dheer khatar; qaybaha lagu hayo qoto-dheer khatar waa la wareegay;
- **miis** qayb kasta: saldhigga webiga, socodka, hoosta channel-ka, dusha biyaha, dusha biyaha qoto-dheer khatar, khadka tamarta, qoto-dheer, xawaaraha channel-ka iyo guud, tirada Froude ee channel-ka, aagga socodka, ballaca sare, socodka overbank kasta iyo channel-ka, isku-dhaca tamarta, iyo digniinaha;
- **digniinaha** erayo cad, tusaale qayb loo dejiyay qoto-dheer khatar, biyo ka sarreeya dhamaadka qaybta, ama isbedel weyn oo conveyance ah labada qayb u dhexeeya (ku dar qaybo dhexe).

{{ui:Table (CSV)}}, {{ui:Report}} (qoraal cad oo leh habka, xuduudaha iyo miisaska oo dhan) iyo {{ui:Plot (SVG)}} waxay kaydiyaan soo dejinta. Mid kastaa wuxuu leeyahay khadka eegista.

Calaamadi {{ui:Show the flood extent}} **Sifooyinka** si aad u iftiimiso aagga qoyan ee qorshaha, qorshaha la doortay, oo leh xariiq dhibcaha biyaha halkaas qoto-dheeruhu eber yahay. Qaybaha u dhexeeya, dusha biyaha waa siman yahay webiga oo dhan, wuxuuna isbedelaa si toos ah dhererka webiga. Dhulka xeedka ka dambeeya waa qalalan inta biyuhu ka hooseeyo crest-ka. Dhulka hoose ee kale ee ku yaal corridor-ka webiga oo biyuhu gaari karin (sida ka dambeeya xeedka waddada) weli waa la iftiimiyaa: hubi.

## Sawirka iyo Dhibaatooyinka

Khadadka webiga waxay u gudbaan qorshaha, PDF-ka iyo DWG-ga lakabyadooda gaarka ah: **C-WATR-CNTR** (xariiqda dhexe), **C-WATR-SCTN** (khadka jarka kasta, leh saldhiggiisa webiga) iyo **C-WATR-FLOD** (khadka daadka, marka {{ui:Show the flood extent}} la calaamadiyo qorshaha). Digniinaha webiga (qayb loo dejiyay qoto-dheer khatar, biyo ka sarreeya dhamaadka qaybta, isbedel conveyance ah oo baahi u leh qaybo dheeraad ah, isku-dheelitir tamarta oo aan xirmin, xeed gudaha xeebaha) waxay kaloo u gudbaan guddiga **Dhibaatooyinka**, oo ku saabsan webiga oo lagu dhejiyay qaybta ay ka timid.

## Sida loo xisaabiyo

- Tamarta labada qayb ee u dhexeeya: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Conveyance-ka qaybo-qaybta: overbank kasta waa la kala jebiyaa meesha n-kiisu isbedelo, K = Σ (1/n)·A·R^(2/3) (1.486/n unitiyada US); channel-ka waa hal qayb, oo leh composite n marka n-kiisu isbedelo. α waxay ka imanaysaa sida conveyance-ka loo kala qaybiyo.
- Friction slope oo ah celceliska conveyance-ka, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², dhererka reach-ka oo la miisaamay socodka.
- Contraction coefficient marka socodku xawaareeyo hoos, expansion marka uu gaabiyo.
- Critical depth = tamarta gaarka ah ee ugu yar. Heer kasta oo biyo waxaa lagu xallaa bracket, markaas kama dhaco dhinaca khaldan ee critical; marka jawaab la'aan, waa la dejiyaa qoto-dheer khatar oo waa la calaamadiyaa.

Barnaamijka waxaa lagu hubiyay Manning normal depth, critical depth channel tikitan (rectangular), iyo tusaalaha backwater ee Chow (*Open-Channel Hydraulics*, 1959, cutubka 10) oo si madax-banaan loo isku-dhafay. Habka ayaa lagu isticmaalaa barnaamijyada webiga 1D ee caadiga ah, sidaas darteed xisaab-gacmeedka ama qoraallada ardaydu way wada-raacaan.

## Dhuunta iyo buundooyinka

Sifooyinka webiga, hoosta **Dhuunta iyo buundooyinka**, {{ui:Add a culvert}} ama {{ui:Add a bridge}} waxay mid dhigtaa labada qaybood u dhexeeya (qayb kasta waxay hayaa ugu yaraan labo qayb). Qorshaha ka hooseeya wuu isla sidaas yahay; dusha biyaha ka sarreeya waxay ka timaadaa dhismaha, qorshuhuna wuu sii socdaa hoos ka sarreeya. **Natiijooyinka** waxay ku daraan miis dhismo kasta: tailwater, heerka headwater, xakamaynta ka talisa, socodka furka iyo socodka waddada ama sagxadda. Socod ka hooseeya oo keliya.

- **Culvert** (sanduuq ama wareeg, hal ama ka badan oo xagal isku mid ah). Xakamaynta gelitaanka waa socod weir inta gelitaanku bilaash yahay, socod orifice markuu biyaha ku buuxo, oo isku-dhafan labada u dhexeeya headwater ah hal iyo hal iyo badh jeer kor-u-kaca. Xakamaynta bixitaanka waa isu-dheelitirka tamarta: luminta gelitaanka, adkaanta iyo cadaadiska xawaaraha bixitaanka, ka sarreeya tailwater-ka iyo dhexdhexaadka qoto-dheer khatar iyo sare-ka (crown), ka dhimma hoos-u-dhaca barrel-ka. Headwater-ku waa mid ka weyn labadii. Calaamadi **Biyuhu waa gudbi karaan waddada** oo socodka weir-ka waddadu wuxuu la wadaagaa socodka barrel-ka.
- **Buundo.** Furku waa qaybta ka hooseysa buundada, oo lagu jaray abutments, iyo pier kasta oo aag ah oo aan socod qaadin. Dusha biyaha furka waxay ka timaadaa qaybta hoose (isku-xirka ballaarinta), qaybta sare-na furka (isku-xirka yaraynta). Haddii furku aanu socodka ka qaadi karin tailwater-kaas, wuxuu ku socdaa qoto-dheer khatar, buundadana waa la calaamadiyaa inay xidhan tahay (choking). Haddii biyuhu gaaro chord-ka hoose, socodku waa socod cadaadis (nooca sluice inta tailwater-ku ka hooseeyo chord-ka hoose, ka dibna nooca drowned ka sarreeya), iyo biyaha dusha waddada ku-darsanaya socod weir; heerka dhinaca sare waa heerka ay isku darsadaan socodka.

Isku-xirnaanta (discharge, luminta gelitaanka, weir) waa qiyam go'an oo lagu qoray tiro wareeg ah. Ku beddel naqshaddaada. Ma aha miisaska khariidadda ee buugagga naqshadda dhuunta ee la daabaco, sidaas darteed u tix-geli headwater-ka dhuun ku dhow xadkiisa sida qiyaas. Biyaha waddada ama sagxadda ka-sarreeya, gelitaanka biyo la'aysay, furka xidhan iyo socodka degdega ah ee barrel-ka waxay ku muuqdaan **Dhibaatooyinka**.

## Socod aan joogtada ahayn

{{ui:Unsteady flow…}} sifooyinka webiga wuxuu u wareejiyaa hydrograph-ka daadka qaybaha hoose. Galinta ku qor sida saacado iyo socod, hal labo kasta sadar, gradient-ka hoose (normal depth) iyo intee le'eg ayuu socdaa. Wuxuu ka bilaabmaa dusha biyaha joogtada ah ee socodka ugu horeeya, wuxuuna xalliyaa isle'egta laba-geesoodka ah ee buuxda (habka afar-barta implicit, miisaanka 0.6 wakhtiga). Waxaad hesha heerka biyaha ugu sarreeya iyo socodka qayb kasta iyo saacadda ay dhacdo, jaantus socodka labada dhamaad, iyo hubinta mugga (gala, bax iyo isbedelka la kaydiyay). Waa la hubiyaa in socodka joogtada ahi uu joogto ahaado, isbedel gelinta ah oo dhamaanaya dusha biyaha cusub, mugga oo xirmaya, iyo xawaaraha mawjadda daadka marka la barbardhigo mawjadda kinematic. Socod ka hooseeya, hal reach, aan gelin dhinac lahayn, aan dhuun ama buundo ku jirin socodka dhexdiisa.

## Isku-xirka

Qaybaha socodka isku xira hal bax: socodyada isku-darsanaya, dusha biyaha madaxa qaybta hoose ayaa loo qaadaa dhamaadka qaybaha ku biiraya (isla dusha biyaha isku-xirka, habka fudud: ma jiro xagal, ma jiro momentum, sidaas darteed waxay ku habboon tahay Froude hoose). Moodelka iyo tijaabooyinka way jiraan (`river-structures.js`); guddi lagu isku xiro laba webi qorshaha ma dhisna weli.

## Wali lama dhisin

Weir-yada iyo irdaha qaab dhismo gooni ah, guddiga isku-xirka, dhismayaasha dhexdooda socodka aan joogtada ahayn, iyo socod aan joogtada ahayn oo ka sarreeya khatarta. Socod nidaam isku-dhafan wuxuu calaamadiyaa dhac hayodoolik oo u dhexeeya laba qayb laakiin ma dhigo.

**Halka webiyaasha ku biiraan.** Sifooyinka webiga, "Flows into" wuxuu magacaabaa webiga uu ku biiro. Webiyaasha isku biirta waa la xalliyaa wada: webiga ay ku biiraan wuxuu qaadaa wadarta socodyadooda, mid kastoo ka mid ahna wuxuu dhammaadaa dusha biyaha qaybta ugu horeysa webigaas (habka dusha biyaha isku-mid ah; ma jiro xagal iyo momentum). Si loo isku xiro webi weyn iyo webi yar, samee webi gaaban hoosta isku-xirka oo ha ku biiraan labadaba. Natiijooyinku waxay muujiyaan miis isku-xirka. Qiyamka caadiga ah ee natiijooyinkan (contraction 0.1, expansion 0.3, channel hal qayb oo leh composite roughness, nidaamka isku-dhafan ee force-ka gaarka ah) ayaa jiraya ilaa injineer uu dib u eego, natiijooyinkuna way sheegaan.
