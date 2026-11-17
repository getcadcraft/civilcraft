---
title: Hubi sawirka sahanka markaad soo dhoofinayso
summary: Akhri heerarka qoraal ahaan ama sifooyinka jarxadaha sida barrooyin sahan, oo hubi DWG ama DXF oo ay ka mid yihiin cabbir aan la sheegin, nidaam isku-xiriye aan lahayn, asal fog, konturo siman, heer xun iyo barro isku dhafan ka hor intaadan dhul ka dhisin.
keywords: hubinta sahanka, hubinta soo dhoofinta, heerarka sahanka, heerarka qoraalka, sifooyinka, cabbirka, nidaamka isku-xirka, fog asalka, konturada eber, dhibaatooyin, naqshadeeyaha dhulka, sawirka sahanka
from: d46acd24
---

Sawirka sahanka wuxuu u muuqan karaa mid sax ah, laakiin wuxuu noqon karaa mid khaldan dhulka: cabbirkiisa waa la qiyaasay, konturadiisu waxay ku taagan yihiin heerka 0, ama heerarkiisa waxaa lagu qoray qoraal aan xarriiq ahayn. Qaybta **Heerarka sahanka iyo hubinta** ee daaqadda {{ui:Linework}} (eeg [Fur DWG ama DXF sida xarriiqyo](topic:open-dwg-dxf)) waxay akhrisaa heerarkaas, oo waxay kuu sheegaysaa waxa khaldan ka hor intaan wax lagu daro.

## Heerar qoraal ahaan ama sifooyin ahaan

Sawiro badan ayaa siiya heer dhul oo qoraal yar oo ku taal calaamad (cross) sida `104.37` ama `EL 104.37`, ama sifo ka mid ah jarxadda barta. Kuwani ma aha xarriiqyo, sidaas darteed akhriyaha xarriiqyada ayaa ka tagaya. Qaybtu waxay tirinaysaa inta ay heshay, waxayna kuu ogolaanaysaa inaad qaadato **barrooyin sahan**:

1. Calaamadi **Qaado … heerar sida barrooyin sahan**. Waa lagu calaamadin bilowga, sababtoo ah ma aha tiro kasta oo sawirka ku jirta inay tahay dhererka.
2. Qoraalka waa la akhriyaa marka uu yahay heer keligiis: tiro leh qeyb tobanle (`104.37`, `+104,37`, `-3.50`), ama tiro ka dambeysa `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ama `LEVEL`, oo ay ku xigto `m`, `ft` ama `'` haddii la doono. Tiro buuxa oo keligeed ah (`12`) waxaa loo akhriyaa lambar dhul ama warqad, ma aha heer; qoraal sida `GATE 3` ama taariikh lama akhriyo abid. Calaamadaha qaabaynta qoraalka waa la iska indho tiraa.
3. Sifooyinka jarxadda, dooro **Sifada jarxadda ee haysa heerka**. CivilCraft wuxuu si toos ah u helaa calaamad magaceedu yahay ELEV, Z, LEVEL, RL ama mid la mid ah; ka dooro mid kale liiska haddii sawirku isticmaalo mid gaar ah. Doorashadu waxaa lagu xusaa magaca faylka kumbuyuutarkan, sidaas darteed markii dib loo furo wuxuu ku bilaabmaa isla calaamadda. Calaamad aad doorato tirooyinka oo dhan ayay u qaadataa heerar.
4. Guji {{ui:Add}}. Barrooyinka waxaa loo lambar siiyaa iyada oo ka dambeysa lambarka ugu sarreeya mashruuca, barta kasta waxaa lagu sharraxaa layer-kiisa (ama jarxaddiisa), heerarkana waxay u beddelmaan cutubyada mashruuca sida qaybta kale ee sawirka. Dhammaantood waa hal tallaabo: {{key:Mod+Z}} ayaa iyaga ka saara.

Qoraalka wuxuu ku jiraa barta uu gelinta ka yaalo (ama barta isku-toosidda haddii uu leeyahay). Qoraalka gudaha jarxaddaha lama akhriyo, sawirkana weligiis lama beddelo.

## Hubinta

Hubintu waxay ku shaqeysaa waxa aad hadda soo geliyeyso, waxayna liistaa wax kasta oo ay ogaato, hal sadar mid kasta nooc dhibaato ah:

| Waxay leedahay | Macnaha |
|---|---|
| **Cabbirka lama sheegin** | Sawirku ma sheegin cabbirkiisa, sidaas darteed tirooyinkiisa waxaa loo akhriyaa cabbirka mashruuca. Hubi hal masaafo aad taqaanno. |
| **Cabbirka waa la beddelay** | Cabbirka sawirka wuu ka duwan yahay kan mashruuca, waana la miisaamay (fiiro gaar ah, ma aha khalad). |
| **Xogtu waxay gaartaa … km** ama **… m** | Ballaca waa ka weyn yahay 200 km ama ka yar yahay nus mitir, taas oo badanaa tilmaamaysa cabbir khaldan (millimitir loo akhriyay mitir, ama beddelka). |
| **Nidaamka isku-xirka ma jiro** | Mashruucu ma leh. Waa digniin marka xogta ay meel ka fog eber ku taal, sida koorsiyada state plane ama grid-ka qaranka. Eeg [Nidaamyada isku-xirka](topic:coordinate-systems). |
| **Ka fog asalka** | Xogta waxay ku taal in ka badan 100 km eber. Meel fog eber, muuqaalada 3D iyo dhoofinta sax ma aha oo way gariiraan. |
| **Layer-ka konturka … ma leh heer** | Layer-ka magaciisu la mid yahay konturada (TOPO, CONT, CNTR, CONTOUR) wuxuu ku jiraa xarriiqyo heerkoodu yahay 0, sidaas darteed dhul laga dhisay wuu siman noqon lahaa. |
| **Heerarka oo dhan 0** | Qaar heerarka waa 0 halka heerka caadiga ahi uu aad uga fog yahay: badanaa kor-u-jeedsiyada maqan. |
| **Heerarka ka fog kuwa kale** | Qaar heerar ayaa aad uga baxsan kuwa kale (waxaa la ogaadaa iyadoo lagu barbar dhigayo bartamaha dhammaan heerarka, sidaas darteed goob janjeer leh oo ballac weyn ayaa aan la calaamadin), ama ka sarreeya 9,000 m ama ka hooseeya -11,000 m. |
| **Barro korka barta kale** | Laba barood oo isku meel ku jira, oo heer isku mid ah ama kala duwan leh. |

Markii aad gujiso {{ui:Add}}, isla sadarradaas waxay tagaan **Dhibaatooyin**, mid kasta nooc kasta, magaca faylka lagu daray, si aad dib ugu noqon karto. Hubintu waxay xukuntaa sawirka; ma beddesho waxba gudihiisa, ma-na joojinayso inaad isticmaasho sawirka.

:::tip
Marka hubintu sheegto in konturadu ay siman yihiin 0 oo ay jiraan heerar qoraal ahaan, ku qaad heerarka barrooyin sahan: badanaa waxay sidaas u xambaaraan heerarka dhabta ah ee konturadu ku maqan.
:::

## Waxa aan la hubin

Hubintu ma barbar dhigto sawirka sahan kale, ma-na garanayso nidaamka isku-xirka ee sawirku ku jiro: waxay kaliya kuu sheegtaa in mid aan la dejin.
