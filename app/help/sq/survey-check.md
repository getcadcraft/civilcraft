---
title: Kontrollo një vizatim rilevimi gjatë importit
summary: Lexo kotat e shkruara si tekst ose në atribute blloqesh si pika rilevimi, dhe kontrollo një DWG ose DXF për njësi të gabuara, pa sistem koordinatash, origjinë shumë larg, izoipsa të sheshta, kota të çuditshme dhe pika të dyfishuara, përpara se të ndërtosh tokë prej tij.
keywords: kontroll rilevimi, kontroll importi, kota rilevimi, kota pikash, kota tekstesh, kota si tekst, atribute, njësi, sistem koordinatash, larg origjinës, izoipsa në zero, vlera të jashtme, pika të dyfishuara, probleme, arkitekt peizazhi, vizatim rilevimi
from: d46acd24
---

Një vizatim rilevimi mund të duket i saktë dhe të jetë i gabuar për një tokë: njësitë e tij mund të jenë supozuar, izoipsat e tij mund të qëndrojnë të sheshta në lartësi 0, ose kotat e tij mund të jenë shkruar si tekst që fare nuk është gjeometri. Seksioni **Kotat e rilevimit dhe kontrolli** i dialogut {{ui:Vijat e vizatimit}} (shih [Hap një DWG ose DXF si vija vizatimi](topic:open-dwg-dxf)) i lexon ato kota dhe të thotë çfarë duket e gabuar përpara se të shtohet ndonjë gjë.

## Kota të shkruara si tekst ose në atribute

Shumë vizatime rilevimi japin një kotë pike si një tekst të vogël pranë një kryqi, si `104.37` ose `EL 104.37`, ose si atribut i një blloku pike. Këto nuk janë vija, prandaj lexuesi i vijave i le jashtë. Seksioni liston sa gjeti dhe të lejon t'i marrësh si **pika rilevimi**:

1. Shëno **Merr … kota si pika rilevimi**. Fillojnë pa u shënuar, sepse jo çdo numër në një vizatim është lartësi.
2. Teksti lexohet kur është një kotë vetvetiu: një numër me pjesë dhjetore (`104.37`, `+104,37`, `-3.50`), ose një numër pas `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ose `LEVEL`, me `m`, `ft` ose `'` opsionalisht pas tij. Një numër i plotë i vetëm (`12`) lexohet si numër parcele ose fletë, jo si kotë; teksti si `GATE 3` ose një datë nuk lexohet kurrë. Kodet e formatimit të tekstit injorohen.
3. Për atributet e blloqeve, zgjidh **Atributi i blokut që mban kotën**. CivilCraft gjen vetë një etiketë të quajtur ELEV, Z, LEVEL, RL ose të ngjashme; zgjidh një tjetër nga lista nëse vizatimi përdor të vetin. Zgjedhja mbahet mend për atë emër skedari në këtë kompjuter, kështu që hapja sërish fillon me të njëjtën etiketë. Një etiketë që zgjedh merr edhe numrat e plotë si kota.
4. Kliko {{ui:Shto}}. Pikat numërohen pas numrit më të lartë në projekt, çdo pikë përshkruhet me shtresën e vet (ose blokun e vet), dhe lartësitë shndërrohen në njësitë e projektit si pjesa tjetër e vizatimit. E gjithë kjo është një hap: {{key:Mod+Z}} i heq pikat.

Teksti vendoset në pikën e vet të futjes (ose pikën e shtrirjes kur ka një të tillë). Teksti brenda blloqeve nuk lexohet, dhe vizatimi nuk ndryshohet kurrë.

## Kontrolli

Kontrolli ekzekutohet mbi atë që ke ndërmend të sjellësh dhe liston çfarë gjen, një rresht për çdo lloj problemi:

| Thotë | Çfarë do të thotë |
|---|---|
| **Njësitë nuk janë deklaruar** | Vizatimi nuk thotë cilat janë njësitë e tij, prandaj numrat e tij lexohen si njësitë e projektit. Kontrollo një distancë që njeh. |
| **Njësitë u konvertuan** | Njësitë e vizatimit ndryshojnë nga ato të projektit dhe shkallëzohen (një shënim, jo një gabim). |
| **Të dhënat shtrihen … km** ose **… m** | Shtrirja është më e madhe se 200 km ose më e vogël se gjysmë metri, që zakonisht do të thotë njësi të gabuar (milimetra të lexuara si metra, ose e kundërta). |
| **Pa sistem koordinatash** | Projekti nuk ka. Është paralajmërim kur të dhënat janë larg zeros, si koordinatat e planit shtetëror ose të rrjetit kombëtar. Shih [Sistemet e koordinatave](topic:coordinate-systems). |
| **Larg origjinës** | Të dhënat janë më shumë se 100 km larg zeros. Larg zeros, pamjet 3D dhe eksportet humbin saktësi dhe dridhen. |
| **Shtresa e izoipsave … nuk ka lartësi** | Një shtresë me emër si izoipsat (TOPO, CONT, CNTR, CONTOUR) mban vija në lartësi 0, kështu që një tokë e ndërtuar prej tyre do të ishte e sheshtë. |
| **Kota të sakta 0** | Disa kota janë 0 ndërsa kota tipike është larg saj: ndoshta lartësi që mungojnë. |
| **Kota larg pjesës tjetër** | Disa kota qëndrojnë shumë jashtë të tjerave (matur kundrejt mesit të të gjitha kotave, kështu që një pjerrësi e fortë me shtrirje të gjerë nuk shënohet), ose mbi 9,000 m ose nën -11,000 m. |
| **Pika mbi një pikë tjetër** | Dy pika në të njëjtin vend me të njëjtën kotë, ose me kota të ndryshme. |

Pasi kliko {{ui:Shto}}, të njëjtat rreshta shkojnë te **Problemet**, një për çdo lloj, me emrin e skedarit, që të kthehesh tek ato. Kontrolli gjykon vizatimin; nuk ndryshon asgjë në të, dhe nuk të pengon ta përdorësh vizatimin.

:::tip
Kur kontrolli thotë se izoipsat janë të sheshta në 0 dhe ka kota të shkruara si tekst, merri kotat si pika rilevimi: shpesh mbajnë lartësitë reale që u mungojnë vijave të izoipsave.
:::

## Çfarë nuk kontrollohet

Kontrolli nuk e krahason vizatimin me një rilevim të dytë, dhe nuk mund të thotë në cilin sistem koordinatash është vizatimi: thotë vetëm se nuk është vendosur asnjë.
