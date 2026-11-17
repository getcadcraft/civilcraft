---
title: Qaababka kooridorka iyo qaababka dhulka
summary: Samee qaababka yar ee dib loo isticmaali karo (kurbi iyo gutter, dhinaca socodka, derbi, waabe), ka dhis kooridor iyaga oo isteeshanka ku salaysan oo bidix iyo midig loo kala saaray, u qaybi jidka kooridoro badan, oo dhig layers-ka walxaha dhulka.
keywords: qaab, qaababka, maktabadda qaababka, samaynta qaabka, qaabka caadiga ah, assembly, subassembly, qaybaha, codes-ka barta, end condition, daylight, waabe, derbi taageero, kurbi, gutter, dhinaca socodka, gobollada, isteeshanka kala duwan, kooridoro badan, bidix iyo midig, qaabka dhulka, ciidda sare, dusha waddada, aasaas, dhig, walxaha, tirooyinka
from: ce70e58b
---

**Qaab** waa qaybta yar ee dhexe oo aad mar sameyso, ka dibna dib u isticmaasho: barood leh offsets, naqas iyo codes-ka barta, iyo qaybo leh walxo. Kooridor waxaa laga dhisi karaa qaababka isteeshanka, dhinac kasta oo leh dusha waddadiisa iyo end condition-kiisa, qaababkana waxaa lagu dhigi karaa dhulka.

:::warning
Qaababka tusaalaha ah waa meelo-hayeen oo lagu bilaabo. Tirooyinkoodu laguma soo qaadanin heer ama hay'ad. Injineer kasta waa inuu hubiyo qaab kasta iyo qiime kasta oo aad siiso ka hor inta aan naqshad loo isticmaalin.
:::

## Fur qaababka

Fur {{ui:Dusha}} › {{ui:Wax dheeraad ah}} › {{ui:Qaababka kooridorka…}} (ama ku qor {{cmd:TEMPLATES}}). Daaqaddu waxay leedahay saddex liis:

- **Mashruucan**: qaababka uu kooridorada iyo qaababka dhulka ee mashruucani isticmaalo. Waxaa lagu kaydiyaa faylka mashruuca.
- **Maktabaddayda**: qaababka lagu kaydiyo browser-kan oo la siiyo mashruuc kasta. Isticmaal {{ui:Ku kaydi Maktabaddayda}} qaab mashruuc si aad u kaydiso.
- **Tusaalooyin**: laba waddo oo leh kurso, kurbi iyo gutter, dhinaca socodka, iftiinka, waabe, derbi taageero, ciidda sare ee dhulka hoose, iyo dusha waddada ee dhulka. Mid kasta waxaa lagu calaamadiyaa "Injineer ayaa hubiya".

{{ui:Mashruucan isticmaal}} waxay qaabka tusaalaha ama maktabadda ku koobiyeysaa mashruuca. {{ui:Qaababka mashruucan u dhoofi}} waxay kaydiyaan sida fayl `.cctemplates.json`, {{ui:Fayl soo dhoof}} waxay akhrisaa fayl mashruuca iyo Maktabaddayda. Isticmaal faylka si aad qaababka u wadaagto ama u wareejiso kumbuyuutar kale.

## Samee qaab

{{ui:Qaab cusub}} (ama {{ui:Tafatir}} qaab mashruuc) wuxuu furaa tafatiraha qaabka. Jihada midig ka bilow, kaashanka qaabka 0,0 dibada u sii; dhinaca bidix wuxuu isticmaalaa isla qaabka dibada bidix.

1. Bixi magac iyo nooc: **Dusha waddada** (qaabka xiga wuxuu ku xidhmaa dhamaadkiisa), **End condition** (wuxuu taabanayaa dhulka) ama **Qaabka dhulka**.
2. Ku dar **qiimayaal**: tirooyin magac leh sida ballac `w` ama naqas `s`. Sanduuqa tirada meel kasta oo qaabka ku jira wuxuu aqbalaa tiro ama magaca qiime; `-t` waa qiimaha `t` oo loo beddelay mid taban. Kooridor kasta wuxuu siin karaa qiimayaashiisa, sidaas darteed kurbi hal qaab ayaa u adeegta dhererro kala duwan.
3. Ku dar **barood** iyagoo kala horreeya. Mid kasta waxaa lagu meeleeyaa barta hore (ama barta 0,0) iyadoo loo marayo xaddidaadda:

| Xaddidaadda | Waxay meeleeysaa barta |
|---|---|
| Offset oo naqas leh | Offset dibada iyo naqas (kor-u-kac marka uu ku dhacayo; −0.02 wuxuu hoos u dhacaa 2%) |
| Offset iyo kor-u-kac | Offset iyo kor-u-kac |
| Toos kor ama hoos | Kor-u-kac keliya |
| Naqaska dhinaca ilaa dhulka | Dibada barteeda ilaa dhulka, qiyaasta gooyida meesha dhulku sare yahay iyo qiyaasta buuxinta meesha ka hooseeyo |
| Ilaa dhulka | Offset, ka dibna toos kor ama hoos ilaa dhulka |
| Derbi taageero | Derbi qaro aad siinayso: gooyga, dusheeda sare waxay taabanaysaa wejiga waddada; buuxinta, waddadu waxay ku socotaa dusheeda, wejigeedii dibada wuu hoos u dhacaa ilaa dhulka |

   Calaamadee **Sare** barahaaga dusha dhammaatay ee ay mari doonto. Barta sare ee ugu dambeysa ayaa meesha qaabka xiga ee dhinacaas ka bilaabmaya. **Bartilmaameed** wuxuu kooridorka u ogolaanayaa inuu barta u guuro: offsetkeeda ama heerkeeda waxay ka timaadaan khad.
4. Ku dar **qaybaha**: qaababka xiritaanka leh codes-ka barta (`0` waa barta 0,0), mid kastaa magac, walax iyo nooc. Balaadhinta ayaa bixisa mugga.

Sawirku wuxuu raacaa isbeddel kasta si cabbir sax ah, liiska hoosteeda ayaa sheegaysa wixii khalad ah (barta dhulka taabanaysa ka hor dhamaadka, qiime uu qaabku ma lahan, qayb aan balaadhin lahayn). {{ui:Ku dar mashruucan}} ama {{ui:Kaydi}} ayaa hayaa, hal tallaabo oo ka noqo.

## Dhis kooridor qaababka

Dooro jid leh kooridor oo, hoosta sifooyinkiisa, daar {{ui:Dhis iyadoo laga kaashanayo qaababka isteeshanka}}. Kooridorku wuxuu bilaabmaa tusaalooyinka laba-waddo iyo iftiinka labada dhinac.

- **Gobollada.** Gobol kasta wuxuu ka bilaabmaa isteeshan oo wuxuu gaaraa kan gobolka xiga. {{ui:Ku dar gobol}} wuxuu ku daraa mid; beddel isteeshankiisa bilowga sanduuqiisa.
- **Bidix iyo midig oo kala saaran.** Dhinac kasta oo gobol kasta wuxuu leeyahay liistiisa **Dusha waddada**, oo ka bilaabanta xariiqa dhexe ee dibada, iyo **End condition**: iftiin, waabe, derbi, ama qaab kasta oo dhulka taabanaya. Haddii end condition aan lahayn, dhinacu wuxuu iftiinka ka gaaraa naqaska jarista iyo buuxinta kooridorka. {{ui:Koobiyee bidixa midig u}} wuxuu koobiyeeyaa dhinac.
- **Qiimayaasha iyo bartilmaameedyada.** Hoosta qaab kasta oo dhinac ah, sanduuq kasta oo qiime ah (madhan = qiimaha qaabka), iyo barta leh bartilmaameed, khadka waxa uu dhaqaajiyo.
- **Laga bilaabo iyo ilaa** wuxuu xaddidaa kooridorka qayb ka mid ah jidka.

Qaybaha, khadadka qorshaha ee codes-ka barta kasta, dusha la soo jeediyay, staking-ka iyo dhulka oo dhan way raacaan. Sifooyinka ayaa muujinaya mugga qayb kasta dhinac iyo gobol kasta (celceliska qaybaha dhexe). Superelevation iyo bartilmaameedyada geesaha kooridorku ma shaqeeyaan markay kooridorku ka dhisan yahay qaababka.

## Kooridoro badan oo jid hal ah

Hoosta **Kooridoradaha jidkan**, {{ui:Ku dar kooridor}} wuxuu ku daraa kooridor qaybta jidka ee hadhay: kooridorka koowaad wuxuu helaa isteeshan dhamaad dhexe (ama wuu hayaa kan uu leeyahay), kooridorka cusubna wuxuu ka bilaabmaa halkaas oo qaababkii gobolkii ugu dambeeyay ee kooridorka koowaad uu ku bilaabmo. Kooridor kasta wuxuu leeyahay magaciisa, kala duwanaanshaha isteeshanka, qaababkiisa iyo mugga dhulka. Dami mid adigoo isticmaalaya sanduuqa {{ui:Ku}}. Meelaha ay kala duwanaanshuhu isku dhacaan, kooridorka dambe wuu ka sarreeyaa kii hore.

## Qaababka dhulka

Qaabka dhulka wuxuu dhigaa layers-ka qaab dhulka dhexdiisa, laga bilaabo barta 0,0: layer ka hooseeya barta 0,0 wuxuu galaa dhulka (ciidda sare ee la qaadayo), layer ka sareeya wuxuu ku fadhiyaa dhulka (aasaas iyo dusha waddada xaafadda baarkinka). Ballacyada iyo naqaska ma muhiimaan, waxa muhiimka ah kaliya qoto dheerka ama sare ee qaybta kasta ee ka hooseeya ama ka sareeya barta 0,0.

Fur {{ui:Dusha}} › {{ui:Wax dheeraad ah}} › {{ui:Qaababka dhulka…}} (ama ku qor {{cmd:TERRAINTEMPLATES}}); blokka waxaa sidoo kale laga helaa sifooyinka mashruuca. {{ui:Ku dar qaab dhulka}} wuxuu ku daraa mid leh ciidda sare ee tusaalaha ah. Mid kasta dooro:

- **qaabka** (qiimayaashiisa waa la beddeli karaa mid kan oo keliya),
- **dhulka**: dhulka jira ama dusha la soo jeediyay,
- **foomka** oo jarta: dhulka oo dhan, parcel, pad ama khad dhamaystiran oo naqshad ah. Qaabab dhulka oo kala duwan ayaa foomaska kala duwan ku isticmaali kara dhulka isku mid ah.

Qayb kasta wuxuu liistaa qaro, aagga qorshaha iyo mugga. Mugga waa aagga qorshaha oo lagu dhufto qaro, qaroda oo toos loo qiyaaso hoos; aagga waxaa lagu qiyaasaa shabakad, aagga dhulka naqasan (ee la jiifay) ayaa sidoo kale la siiyaa. Foomaska waxaa lagu sawiraa qorshaha layer C-TOPO-TMPL. Qaababka dhulka ma beddelaan dusha la soo jeediyay.

## Walxaha iyo tirooyinka

Earthwork block-ka mashruuca wuxuu liistaa **Walxaha qaababka**: qayb kasta oo kooridor ah iyo layer kasta oo qaab dhulka ah oo leh mugga. {{ui:U dir TakeoffCraft}} wuxuu ku qoraa faylka tirooyinka ka dib jarista iyo buuxinta, shay kasta hal safar, mitir kuub ama yaar kuub (mashruucyada fiitka).

## Faylasha

Qaababka, gobollada, kooridoradaha dheeraadka ah iyo qaababka dhulka waxaa lagu kaydiyaa faylka mashruuca. Mashruuc aan isticmaalin midkoodna wuxuu u kaydiyaa sidii hore, nooca CivilCraft ee hore ayaa furi kara mashruuca oo isticmaala (waxay iska indho-tiraan qaababka oo ay dhisaan qaabkii kooridorka).
