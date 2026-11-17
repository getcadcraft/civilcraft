---
title: Xisaabi socodka naqshadda biyo-qashinka iyo hubi marinka
summary: Gali dadka iyo aagga ku imanaya god kasta oo shabakada biyo-qashinka ah; CivilCraft wuxuu isku daraa hoosta shabakada, wuxuu xisaabiyaa socodka ugu sarreeya tirada kororka iyo biyaha dhulka galaya, wuxuuna hubiyaa awoodda iyo xawaaraha tuubo kasta.
keywords: biyo-qashin, marinka biyo-qashinka, biyo-qashin (wastewater), socodka naqshadda, socodka ugu sarreeya, tirada kororka, harmon, babbitt, biyaha dhulka galaya, dadka, dad halkii qof, boqolkiiba buuxda, is-nadiifin, xawaaraha, cabbirka tuubada, xaashida naqshadda
from: 73ba197a
---

Socodka naqshadda biyo-qashinka wuxuu ku shaqeeyaa [shabakada tuubooyinka](topic:pipe-network) marka {{ui:Type}} tahay {{ui:Sanitary}}. Marka waxba la dooran, panelka midig wuxuu markaas muujinayaa **Socodka naqshadda biyo-qashinka**, halka shabakada duufaanka ay muujinto socodka duufaanka.

## Gali waxa soo gala

1. Dooro manhole. Hoosta **Socodka naqshadda biyo-qashinka**, qor {{ui:People entering here}} iyo {{ui:Area entering here}} (hectare mashruuc metric ah, acre mashruuc feet ah).
2. Dukaamada, xafiisyada ama warshadaha, qor dadka u dhigma: aagga oo lagu dhufto dadka halkii hectare (ama acre) oo ay hay'addaadu isticmaasho. Aagga wuxuu u tirsan yahay biyaha dhulka galaya labadaba.
3. Ku celi god kasta oo waddo ama lot ku xirma. God aan waxba ku xirnayn waxaa lagu hayaa labadaba 0.

Tuub kasta waxay qaadaa wax kasta oo ku soo galaya manhole-kiisa sare iyo waxa ka sarreeya. Dooro manhole si aad u aragto waxa ka gudba.

## Dejinta

| Dejinta | Macnaheeda |
|---|---|
| {{ui:Flow per person}} | socodka celceliska ee hal qof maalin kasta: litir (mashruuc metric) ama US gallon (mashruuc feet) |
| {{ui:Infiltration}} | biyaha dhulka ka soo galaya: litir ilbiriqsi hectare kasta, ama gallon maalin acre kasta |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), ama Babbitt, 5 / P^0.2, iyadoo P ay tahay dadka oo kun-kun ah |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | factor-ka waa la hayaa labadan dhexdooda |
| {{ui:Manning n}} | awoodda iyo xawaaraha |
| {{ui:Least velocity}} / {{ui:Most velocity}} | qoto-dheer tuubada ee socodka ugu sarreeya |
| {{ui:Most of full capacity}} | sida tuubadu u buuxi karto socodka ugu sarreeya, boqolkiiba awoodda ay qaadi karto markii buuxda socoto |

Qiimaha bilowga ah waa meel-hayn, ma aha heer. Isticmaal qiimaha hay'addaadu daabacdo.

## Waxa ay xisaabiso

Tuub kasta, marka loo raaco socodka:

- socodka ugu sarreeya = dad × socodka hal qof × factor-ka kororka + aag × biyaha dhulka galaya
- awoodda marka buuxda socoto (isle'egta Manning ee gradient-ka tuubada), iyo sida uu socodka ugu sarreeya u buuxiyo
- qoto-dheer caadi ee socodka ugu sarreeya iyo xawaaraha meeshaas

Miiska **Natiijooyinka biyo-qashinka** wuxuu liistaa dadka tuub kasta, factor-ka kororka, socodka ugu sarreeya (L/s, ama gpm iyo cubic feet per second), boqolkiiba buuxda iyo xawaaraha. Dhibaatooyinka waxaa hoosta lagu liistaa: tuub ka buuxsan xadka, ka gaabsan xawaaraha ugu yar (waxay laga yaabaa inaysan isnadiifin), ka dhakhso badan xawaaraha ugu badan, ama aan hoos-u-dhac lahayn. {{ui:Size the pipes for these flows}} wuxuu tuub kasta u dooraa cabbirka caadiga ah ee ugu yar (200 mm ama 8 inches iyo ka weyn) oo qaada socodka ugu sarreeya xadka gudihiisa; hal {{key:Mod+Z}} ayaa ka noqda.

:::note
Tani waa socodka joogtada ah ee ugu sarreeya ee xisaabiya xaashida naqshadda, la hubiyay xaashi naqshadeed la daabacay ilaa xagga la daabacay. Ma aha moodel shabakada waqtiga: ma jiro hydrograph, kaydin, pump ama overflow. Eeg [Wali lama dhisin](topic:not-built-yet).
:::

Xawaaraha waxay isticmaalaan isle'egta Manning oo leh n isku mid qoto-dheer kasta. Hay'ado qaar waxay ka dhigaan n inuu isbedelo qoto-dheerka, taas oo keenta xawaare yar oo xoogaa ah tuubo buuxda 60 ilaa 70 boqolkiiba (qiyaastii 3 boqolkiiba ka yar).
