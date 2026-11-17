---
title: Izifanekiso zekhoridoro nezifanekiso zomhlaba
summary: Yenza izifanekiso ezincane ezisetshenziswa kabusha (umphetho nomfantu, indlela yezinyawo, udonga, umfantu), yakhe ikhoridoro kusuka kuzo ngesiteshi kanye nesobunxele nesokudla kuhlukaniswe, hlukanisa umzila ube amakhoridoro amaningi, futhi ufake izendlalelo zezinto emhlabeni.
keywords: isifanekiso, izifanekiso, umtapo wezifanekiso, ukudala isifanekiso, isigaba esijwayelekile, ukuhlanganiswa, subassembly, izingxenye, amakhodi wamaphoyinti, isimo sokuphela, ukukhanya kwemini, umfantu, udonga wokubamba, umphetho, izifunda, ibanga lesiteshi, amakhoridoro amaningi, kwesobunxele nokwesokudla, isifanekiso somhlaba, udaka oluphezulu, ipavement, isisekelo, ukumbozwa, izinto, izinani
from: ce70e58b
---

**Isifanekiso** ingumugqa ophambanayo omncane odwetshwa kanye uphinde usetshenziswe: amaphoyinti anokubekwa, ukuthambeka namakhodi wamaphoyinti, nezingxenye nezinto zazo. Ikhoridoro lingakhiwa kusuka ezifanekisweni ngesiteshi, ngokuhlukile ohlangothini ngalunye nezifanekiso zalo zomgwaqo kanye nesimo sokuphela salo, futhi izifanekiso ezifanayo zingambozwa emhlabeni.

:::warning
Izifanekiso zesibonelo ziyizindawo ezibambayo zokuqala. Izinombolo zazo azithathwanga kunoma yisiphi isitandade noma ihhovisi. Unjiniyela kumele ahlole yonke isifanekiso, nayo yonke inani onginikeza kuyo, ngaphambi kokuthi isetshenziselwe idizayini.
:::

## Vula izifanekiso

Vula {{ui:Umphezulu}} › {{ui:Okuningi}} › {{ui:Izifanekiso zekhoridoro…}} (noma bhala {{cmd:TEMPLATES}}). Iwindi linezinhlu ezintathu:

- **Kule phrojekthi**: izifanekiso amakhoridoro nezifanekiso zomhlaba walesi sihlobo esizisebenzisayo. Zigcinwa kufayela leprojekthi.
- **Umtapo wami**: izifanekiso ezigcinwe kulesi siphequluli futhi ezitholakala kuyo yonke iprojekthi. Sebenzisa {{ui:Londoloza kumtapo wami}} kwisifanekiso seprojekthi ukuze usigcine.
- **Izibonelo**: imigwaqo emibili enezingqimba, umphetho nomfantu, indlela yezinyawo, ukukhanya kwemini, umfantu, udonga wokubamba, udaka oluphezulu ngaphansi komhlaba, nomgwaqo emhlabeni. Ngayinye imakwe ngokuthi "Ukuhlolwa yiunjiniyela".

{{ui:Sebenzisa kule phrojekthi}} ikopisha isifanekiso sethala noma sesibonelo kule phrojekthi. {{ui:Thumela amathempulethi alale kule phrojekthi}} iwagcina njengefayela le-`.cctemplates.json`, kanti {{ui:Ngenisa ifayela}} ifunda elilodwa libe seprojekthini nakumtapo wami. Sebenzisa ifayela ukwabelana ngezifanekiso noma ukuzithutha kwenye khompyutha.

## Yenza isifanekiso

{{ui:Ithempulethi entsha}} (noma {{ui:Hlela}} kwisifanekiso seprojekthi) ivula umhleli wezifanekiso. Dweba uhlangothi lwesokudla, kuphuma kwiphoyinti lesifanekiso elingu-0,0; uhlangothi lwesobunxele lusebenzisa isifanekiso esifanayo kuphuma ngakwesobunxele.

1. Yinike igama nohlobo: **Ipavement** (isifanekiso esilandelayo sihlanganiswa ekugcineni kwaso), **Isimo sokuphela** (sihlangabezana nomhlaba) noma **Isifanekiso somhlaba**.
2. Engeza **amanani**: izinombolo ezinamagama njengobubanzi `w` noma ukuthambeka `s`. Ibhokisi lenombolo noma yisiphi isikhathi kusifanekiso lamukela inombolo noma igama lenani; `-t` ingumzimba `t` ophenduke wangaba negethivu. Ikhoridoro lingapha ukusetshenziswa ngakunye kwesifanekiso amanani awo, ngakho isifanekiso esisodwa somphetho sisebenzela yonke ukuphakama komphetho.
3. Engeza **amaphoyinti** ngokulandelana. Ngalinye libekwa kusuka kwephoyinti elidlule (noma iphoyinti elingu-0,0) ngomkhawulo waleli:

| Umkhawulo | Ibeka iphoyinti |
|---|---|
| Ukubekwa ngaphandle ngokuthambeka | Ukubekwa okuphuma ngaphandle nokuthambeka (ukukhuphuka ngomgijimo; −0.02 wehla ngo-2%) |
| Ukubekwa nokukhuphuka | Ukubekwa nokukhuphuka |
| Ngqo phezulu noma phansi | Ukukhuphuka kuphela |
| Ukuthambeka kwecala kuya emhlabeni | Kuphuma kwiphoyinti laso kuya emhlabeni, ngesilinganiso sokusika lapho umhlaba ukhuphuka khona nesilinganiso sokugcwalisa lapho wehla khona |
| Kuya emhlabeni | Ukubekwa, bese kuqondile phezulu noma phansi kuya emhlabeni |
| Udonga wokubamba | Udonga wobukhulu obunikezwayo: ekusikeni uphezulu walo uhlangana nomhlaba ngobuso bomgwaqo, ekugcwaleni umgwaqo ugeleza phezu kwalo nobuso balo bangaphandle buwela emhlabeni |

   Faka itiki ku-**Phezulu** kumaphoyinti indawo esiphelele edlula kuyo. Iphoyinti lokugcina eliphezulu yindawo isifanekiso esilandelayo kuleso sohlangothi siqala kuyo. I-**Umgomo** ivumela ikhoridoro ukuthi lihambise iphoyinti: ukubekwa kwalo noma ukuphakama kwalo kuvela komugqa.
4. Engeza **izingxenye**: izimo ezivaliwe ngamakhodi wamaphoyinti (`0` ingumphoyinti ka-0,0), ngalinye linegama, impahla yokwakha nohlobo. Izindawo zazo zinika imithamo.

Umdwebo ulandela yonke inguquko ngesilinganiso sangempela, nohlu olungaphansi kwawo lutshela okungalungile (iphoyinti elihlangabezana nomhlaba ngaphambi kokuphela, inani isifanekiso esingalinaso, ingxenye engenayo indawo). {{ui:Engeza kule projekthi}} noma {{ui:Londoloza}} iyakugcina, njengesinyathelo esisodwa sokuhlehlisa.

## Yakha ikhoridoro kusuka ezifanekisweni

Khetha umzila onekhoridoro bese, ku-**Izici** zawo, vula {{ui:Yakha ngezifanekiso ngesiteshi}}. Ikhoridoro liqala ngezibonelo zemigwaqo emibili nokukhanya kwemini ngakozombili izinhlangothi.

- **Izifunda.** Ngayinye indawo iqala esiteshini bese iqhubeka kuze kufike esifundeni esilandelayo. {{ui:Engeza indawo}} yengeza enye; shintsha isiteshi sayo sokuqala ebhokisini layo.
- **Kwesobunxele nakwesokudla kuhlukene.** Uhlangothi ngalunye lwesifunda lunohlu lwalo **lwe-Pavement**, kusukela emgqeni omaphakathi kuya ngaphandle, nesimo sayo **sokuphela**: ukukhanya kwemini, umfantu, udonga, noma noma yisiphi isifanekiso esihlangabezana nomhlaba. Uma kungekho simo sokuphela, uhlangothi lukhanyisa ekusikeni nasezindaleni zekhoridoro. {{ui:Kopisha kwesobunxele kuya kwesokudla}} ikopisha uhlangothi.
- **Amanani nezinhloso.** Ngaphansi kwesifanekiso ngasinye ohlangothini, ibhokisi ngalinye lenani (ingenalutho = inani lesifanekiso uqobo) kanye, uma iphoyinti lithatha umgomo, umugqa wesici noma womunye ikhoridoro olunyakazisa lona.
- **Kusuka** no-**Kuya** bakhawula ikhoridoro engxenyeni yomzila.

Izigaba, imigqa yepulani yakho yonke ikhodi yephoyinti, indawo ehlongozwayo, ukumaka nomsebenzi womhlaba konke kuyalandela. **Izici** zibhala umthamo wengxenye ngayinye ngohlangothi nangesifunda (izindawo zokuphela ezimaphakathi komugqa omaphakathi). Ukuphakanyiswa kwejika nezinhloso zomphetho wekhoridoro akusetshenziswa lapho ikhoridoro lakhiwa ngezifanekiso.

## Amakhoridoro amaningi kumzila owodwa

Ngaphansi kwe-**Amakhoridoro kulo mzila**, {{ui:Engeza ikhoridoro}} yengeza ikhoridoro engxenyeni esele yomzila: ikhoridoro lokuqala linikezwa isiteshi sokuphela esiphakathi (noma libe nelakhe), bese elisha liqala lapho ngesifunda sokugcina sezifanekiso zokuqala. Ikhoridoro ngalinye linegama lalo, ibanga lesiteshi, izifanekiso namsebenzi womhlaba. Vala elilodwa ngebhokisi layo elithi {{ui:Vulekile}}. Lapho amabanga amabili ehlangana, ikhoridoro elisha lihlanganisa phezu kwelokuqala.

## Izifanekiso zomhlaba

Isifanekiso somhlaba sembozela izendlalelo zesifanekiso emhlabeni kusukela ephoyinteni lakhe elingu-0,0: isendlalelo esingaphansi kwephoyinti elingu-0,0 siya emhlabeni (udaka oluphezulu okufanele luhlutshwe), isendlalelo esingaphezulu kwalo sihlala emhlabeni (ingqimba yesisekelo nomgwaqo epaki). Ububanzi nokuthambeka akubalulekile, kubalulekile kuphela ukujula kwengxenye ngayinye ngaphezu noma ngaphansi kwephoyinti elingu-0,0.

Vula {{ui:Umphezulu}} › {{ui:Okuningi}} › {{ui:Izifanekiso zomhlaba…}} (noma bhala {{cmd:TERRAINTEMPLATES}}); ibhlokhi itholakala nakuZici zeprojekthi. {{ui:Engeza isifanekiso somhlaba}} iyengeza enye ngesibonelo sodaka oluphezulu. Ngakunye khetha:

- **isifanekiso** (amanani ayo angashintshwa kulesi),
- **umhlaba**: umhlaba okhona noma indawo ehlongozwayo,
- **isimo** esisika kuso: umhlaba wonke, isigaba, ipedi noma umugqa wesici ovaliwe. Izifanekiso zomhlaba eziningi zingasebenzisa izimo ezihlukile emhlabeni ofanayo.

Ingqimba ngayinye ibhala ubukhulu bayo, indawo yepulani nomthamo. Umthamo ungindawo yepulani ephindaphindwe ngobukhulu, ubukhulu bukalwa uqondile phansi; indawo ilinganiswa egridini, futhi indawo ethambekile nayo iyanikezwa. Izimo zidwetshwa epulanini kwisendlalelo C-TOPO-TMPL. Izifanekiso zomhlaba azishintshi indawo ehlongozwayo.

## Izinto nezinani

Ibhlokhi ye-Earthwork yeprojekthi ihlu **Izinto ezivela ezifanekisweni**: yonke ingxenye yekhoridoro nendlalelo yesifanekiso somhlaba ngomthamo wayo. {{ui:Thumela ku-TakeoffCraft}} iyababhala efayeleni lezinani ngemva kokusika nokugcwalisa, into eyodwa ngayinye, ngamayadi amakhyubhu (amaprojekthi amafidi) noma ngamamitha amakhyubhu.

## Amafayela

Izifanekiso, izifunda, amakhoridoro engeziwe nezifanekiso zomhlaba zigcinwa kufayela leprojekthi. Iprojekthi engasebenzisi lutho kulokhu igcinwa njengakuqala, futhi izinguqulo ezidala ze-CivilCraft ziyavula iprojekthi esebenzisa kona (zinganaki izifanekiso futhi zakha ukuhlanganiswa kwekhoridoro lazo).
