---
title: Yakha umgqa wesitimela
summary: Yenza umzila ube ngumgqa wesitimela: izinguquko zemigqa (i-clothoid, iparabola ye-cubic, i-Bloss, i-Helmert, i-sine half-wave, i-sine), ukuphendeka kwegobolondo ngalinye elinokulingana kwalo, ukweqisa nokweqa, imikhawulo yokuphendeka nojometshi womgqa njengezexwayiso, amapointi nokuwela ngesiteshi, imvilophu yesikhala esiqhubeka emgqeni, kanye nomgqa onamarele, izilala nombhede webhalasti owakhiwa njengekhoridoro, ku-plan, ezigabeni, ephrofayilini, ku-3D nasezinanini.
keywords: isitimela, umgqa wesitimela, rail, railroad, track, train, metro, tram, ukuphendeka, cant, superelevation, ukweqisa, ukweqa, ukuphendeka okulinganayo, isiguquko, transition, transition curve, clothoid, cubic parabola, bloss, helmert, sine half-wave, cosine, igeji, standard gauge, broad gauge, metre gauge, narrow gauge, isilala, tie, crosstie, ibhalasti, sub-ballast, ifomethini, cess, track centres, 60E1, 54E1, UIC60, 115RE, 136RE, cant gradient, rate of change of cant, ukushintsha komgqa, switch, points, crossover, frog, frog number, lead, closure curve, diverging speed, clearance, clearance envelope, structure gauge, loading gauge, kinematic envelope, iplatifomu, platform gap, track spacing, gradient, vertical curve, minimum radius, LandXML cant
from: 99de9745
---

Noma yiliphi umzila lingaba ngumgqa wesitimela. Amajika alo angathola izinguquko zemigqa nokuphendeka (ukuphakama kwamarele emgqeni), ikhoridoro lawo lakhiwe njengomgqa: amarele emisebenzini phezu kwezilala, phezu kombhede webhalasti, egxilwe emhlabathini njengomgwaqo. Ukushintsha komgqa nokuwela kufakwa kuwo ngesiteshi, futhi imvilophu yesikhala ingadlulisa emgqeni iqhathaniswe nento ezungeze umgqa.

Zonke izinombolo ezingezansi ziyizibambi, hhayi izinga elisemthethweni. Izitimela zibeka imikhawulo yazo ngesivinini somgqa, ngohlobo lomgqa nangezwe; zibeke ngokusho kwenqubomgomo yesitimela sakho. I-CivilCraft ayinatafula kazwelonke.

## Yenza umzila ube umgqa wesitimela

1. Khetha umzila bese uthola **Isitimela** ku-**Izakhiwo**.
2. Thikha **Lo mzila ungumgqa wesitimela**. Ushintsho ngalunye lungesinyathelo esisodwa sokuhlehlisa.
3. Setha **Isivinini sokuklama** phezulu kwezakhiwo zomzila: yisivinini somgqa ukuphendeka okuhlolwa ngaso. **Izitimela ezihamba kancane kakhulu** (kwibhlokhi yesitimela) yisivinini okuhlolwa ngaso ukweqisa kokuphendeka.

## Izinguquko

Nika igobolondo ngalinye ubude bokuguquka ekugcineni kwalo kokubili kutafula lamaphoyinti (**Spiral in**, **Spiral out**), bese ukhetha uhlobo lwalo kutafula lamagobolondo webhlokhi yesitimela, noma **Isiguquko sigobolondo ngalinye**:

| Uhlobo | Ukugoba kusuka ekuguqukeni |
|---|---|
| Clothoid | iyakhula ngokulinganayo (igobolondo lomgwaqo) |
| Cubic parabola | y = x³ / (6·R·L), kulinganiswa u-L ngokuya ethangenteni; igobolondo ngokwalo lingaba side kancane |
| Bloss | 3u² − 2u³ wokugoba okugcwele (u = ingxenye yobude): iqala futhi iphele kancane |
| Helmert | iparabola ezimbili, 2u² bese 1 − 2(1 − u)² |
| Sine half-wave | (1 − cos πu) / 2 |
| Sine | u − sin(2πu) / 2π |

Zonke ngaphandle kweparabola ye-cubic zigoba ngo-L / 2R, njengeclothoid. Izinanini zihamba ngobude beqiniso. I-LandXML igcina uhlobo (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Ukuphendeka

Bhala **Ukuphendeka** kwegobolondo ngalinye ngamamilimitha. Ithebula libonisa ngegobolondo ngalinye:

- **Ukuphendeka okulinganayo** = G·v² / (g·R), G kungukuhlukana phakathi kwamacwecwe **Izimpakamo zamareyili** (igeji kanye nobubanzi bekhanda lereyili uma ungakubhali). Uma G = 1500 mm lokhu kungu-11.8·V² / R ojwayelekile (V ngama-km/h, R ngama-m).
- **Ukungalingani** = ukuphendeka okulinganayo ngesivinini somgqa − ukuphendeka okusetshenzisiwe.
- **Ukweqisa** = ukuphendeka okusetshenzisiwe − ukuphendeka okulinganayo ngesivinini sezitimela ezihamba kancane kakhulu.
- **Ukwehla**: ukuthambeka okukhulu kakhulu kokuphendeka emarampeni awo, ngamamilimitha ngemitha.

Ukuphendeka kukhuphuka phezu kwesiguquko ngasinye, kumile njengokugoba kwaso: kuqonde kugigobolondo i-clothoid noma i-parabola ye-cubic, kufane ne-Bloss kwi-Bloss, njalo njalo. Ukuphela kwegobolondo okungenaso isiguquko kukhuphuka emgqeni ongaphambili, kuze kube yilapho umkhawulo wokuthambeka kokuphendeka udinga, futhi kuyakubonisa lokho: ngalokho ukuphendeka kushintsha lapho ukugoba kungashintshi khona.

**Ukuphendeka kuzungeza** kuchaza ukuthi yiliphi ireyili elihlala ophenjini loklama: **ireyili elisezansi** (ejwayelekile), **ireyili langaphakathi**, noma **isikhungo somgqa** (ngayinye ireyili linyakaza ingxenye yesine yokuphendeka). Iphrofayili yokuklama yindawo ephezulu kwereyili lapho.

I-**Idayagremu yokuphendeka** idweba ukuphakama kwerreyili ngalinye phezu kwephrofayili ngesiteshi; umbono wephrofayili namashidi eplan nephrofayili athola okufanayo njengebhendi ngaphansi kwephrofayili.

## Imikhawulo yokuphendeka nezexwayiso

**Ukuphendeka okukhulu kakhulu okusetshenzisiwe**, **Ukungalingani okukhulu kakhulu**, **Ukweqisa okukhulu kakhulu**, **Ukuthambeka okukhulu kakhulu kokuphendeka** kanye **Ushintsho olusheshayo lokuphendeka** (ukuthambeka ngesivinini somgqa, mm/s) kuhlolwa kuwo wonke igobolondo. Inani eliphezu komkhawulo liba yisexwayiso ebhlokhini yesitimela nasesigabeni sezinkinga, kubonise umkhawulo nenani etholakele. Uma kungekho sivinini sokuklama, ukungalingani nezinga lokushintsha akuhlolwa (inothi iyakutshela lokho).

## Umgqa

Setha **Igeji** (izilungiselelo ezijwayelekile ezi-1435 mm, ezibanzi, ezingamamitha noma ezincane, noma eyakho), **Uhlobo lereyili** (60E1, 54E1, 49E1, 115RE, 136RE: izilinganiso zazo ezishicilelwe kuphela), inani lemigqa **Imigqa** kanye **Izimpakamo zemigqa**, bese **Izilala nebhalasti**: impahla yezilala, ubude, ububanzi, ukujula nokuhlukana; ukujula kwebhalasti ngaphansi kwesilala (ngaphansi kwereyili elisezansi), amahlombe, ukuthambeka, nokuthi phezulu kwalo kuphansi kangakanani kwezilala; ukujula kwe-sub-ballast, i-cess ngaphesheya kwenhloko yebhalasti, nokuthambeka okuwela kwesisekelo.

Cindezela **Yakha umgqa**. Lokhu kuvula ikhoridoro lomzila, lakhiwe njengomgqa phezu kwephrofayili yokuklama: amareyili nezilala kuyathambama ngokuphendeka, kodwa isisekelo asithambami. Imigqa yokukhanya ehlanganisa imiphetho yesikhungo sekhoridoro, kanye nezindawo zokugcwalisa, zenza kanjalo, futhi umgqa uzungeza phezu komhlaba omusha njengomgwaqo.

- **Plan**: imigqa yokubili yomgqa ngamunye (ungqimba C-RAIL-TRAK) kanye, uma kukhona imigqa engaphezu kweyodwa, isikhungo somgqa ngamunye (C-RAIL-CNTR), esikrinini, ku-DXF, DWG, PDF nasemashidini eplan nephrofayili.
- **Izigaba**: izilala, amareyili, nezinhlobo zezansi zebhalasti nesub-ballast kuzo zonke izigaba.
- **3D**: amareyili, zonke izilala nombhede webhalasti (Bonisa › Umgqa), futhi ku-GLB, OBJ nase-USD.
- **Izinani**: ubude bomgqa, amareyili (wonke amareyili emigqeni yonke, ngomugqa ngamunye), izilala, imbhede yebhalasti nebhalasti ngaphandle kwezilala, kanye ne-sub-ballast, ngokulinganisa izindawo zezinkomba phakathi kwezigaba.

## Ukuhlolwa kwejometri yomgqa

Ngaphezu kokuphendeka, ibhlokhi yesitimela ihlola umgqa ngokuchasene nezinye imikhawulo eyisithupha (zonke ziyizibambi, zonke zakho ukuzisetha):

- **Ukuthambeka okukhulu kakhulu** kwephrofayili yokuklama, ngamamilimitha ngemitha.
- **Ukuqonda okuncane kakhulu kweradiyasi evundlile**, njengenombolo k kuR ≥ k·V² (R ngamamitha, V ngama-km/h). Igobolondo elivundlile lebanga L phakathi kwamathambeka amabili linayo iradiyasi enesilinganiso sobude L ngokuhlukana kwesithambeka.
- **Igobolondo elivundlile elifushane kakhulu**.
- **Iradiyasi encane kakhulu yegobolondo ku-plan** (0 icisha lokhu kuhlola).
- **I-arc noma umugqa omfushane kakhulu**, njengamasekhondi okuhamba ngesivinini somgqa: i-arc yesiyingi noma umugqa phakathi kwamagobolondo amabili omfushane kunalelo banga uyaxwayiswa. I-1.8 s iyinombolo ejwayelekile ethi "ingxenye yesivinini ku-km/h, ngamamitha".
- **Ukushintsha kokungalingani kokuphendeka** ngakunye kwesiguquko, ngamamilimitha ngesekhondi ngesivinini somgqa.

**Ijometri yomgqa** ibala ukuthambeka okukhulu okutholakele kanye nawo wonke amagobolondo avundlile ngeradiyasi yawo kanye neradiyasi isivinini somgqa esiyidingayo. Igobolondo elivundlile elisemgqeni wokuguquka noma emarampeni okuphendeka linikeza inothi. Uma kungekho phrofayili yokuklama noma kungekho sivinini sokuklama, ukuhlolwa okudinga lokho kuyadlulwa futhi inothi iyakutshela.

## Izinkomba nokuwela

Ngaphansi kwe-**Izinkomba nokuwela**, cindezela **Engeza ushintsho lomgqa**. Iyabekwa emgqeni omude kakhulu ongaphambili; yenza ngokusebenza kutafula:

- **Isiphethu sokushintsha ngesiteshi**: lapho ushintsho lomgqa luqala khona kulo mzila.
- **Ifulogi**: inombolo yefulogi N (1:N). I-engile yefulogi ingu 2·atan(1 / 2N).
- **Uhlangothi**: kwesobunxele noma kwesokudla, uma ubheka ngasemva kwesiteshi.
- **Ububanzi bokuwela** ngamamitha: ngaphezu kwe-0, ushintsho lulunga ukuwela komugqa ofanayo ngalokho kubanga (izinkomba ezimbili nomugqa oqondile phakathi kwazo).

Ukutafula kubonisa i-**Lead** (isiphethu sokushintsha kuya efulogini), iradiyasi **Iradiyasi** yegobolondo elivala, kanye **Isivinini sokuhlukana** esiyiyo leyo radiyasi evumela ngomkhawulo wakho wokungalingani kokuphendeka nangaphandle kokuphendeka. **Yenza umgqa wakhe** iguqula indlela yokuhlukanisa ibe umzila wayo (ushintsho, igobolondo elivala, bese uqhubeka uqondile ku-engile yefulogi) ngezilungiselelo zesitimela ezifanayo, ilungele ukwelulwa.

Iplan idweba amareyili amabili ahlukanayo kashintsho ngalunye, umugqa wawo omaphakathi, uphawu ku-isiphethu sokushintsha nasefulogini, kanye no-"1:N" (ungqimba C-RAIL-TURN), esikrinini nasku-DXF, DWG, PDF nasemashidini. Umbono we-3D udweba amareyili ahlukanayo ngezinga lomgqa oyinhloko.

Ukwakheka kuyisibambi: iswichi eqondile negobolondo elivala elilodwa elisuselwa kunombolo yefulogi. Ushintsho olwakhiwe kumele lulandele inqubomgomo yesitimela nomdwebo womkhiqizi. Izexwayiso: ushintsho oqhuma kumzila, olusemgqeni wegobolondo, ukuphendeka, ukuphendeka noma igobolondo elivundlile, noma oluhlanganayo nomunye; nenothi uma isivinini somgqa siphezu kwesivinini sokuhlukana sawo.

## Imvilophu yesikhala

Thikha **Hambisa imvilophu yesikhala kulo mgqa**. Khetha i-**Umbuthano** (izimo ezimbili zesibambi, noma **Umbuthano wakho** obhalwe njengephoyinti eyodwa emgqeni: ukuphambuka kusukela esikhungweni somgqa, bese ukuphakama ngaphezu kwesiphezu sereyili, ngamamitha), i-**Ubude besithuthi** kanye **Izimpakamo zamabhodi**, futhi, uma ikhona, **Umphetho weplatifomu** (uhlangothi, ibanga kusukela esikhungweni somgqa, ukuphakama ngaphezu kwereyili).

Ezitezini ngayinye umbuthano uyathambiswa ngokuphendeka ngokuzungeza ireyili elisezansi, futhi uyandiswa ngegobolondo: maphakathi nesithuthi ngena ngo b² / 8R, izingxenye zaso eziphelayo ziphume ngo (L² − b²) / 8R (b kungamabanga ezimpakamo zamabhodi, L kungubude besithuthi, R iradiyasi lapho, nokulandela isiguquko). Ibhlokhi idweba isigaba endaweni eqondile nalapho sibanzi kakhulu, futhi ibala:

- **imvilophu ebanzi kakhulu** nokuthi iphi,
- **izikhungo zomgqa** eqhathaniswe nezikhungo ezidingwa yimvilophu ezimbili eziseduze,
- **indawo esele ku-umphetho weplatifomu**, noma ukuthi ingaphakathi kangakanani,
- yonke imigqa yesici, izinhlelo zamapayipi nezinye izinhlelo zomgqa wesitimela ezitholakale **ngaphakathi kwemvilophu**.

Umugqa wesici onokuphakama ulinganiswa ngombuthano ngokuphakama kwawo ngaphezu kwereyili; uma kungekho phrofayili yokuklama, noma ephoyinti elingenakuphakama, ulinganiswa ku-plan kuphela futhi uhlu luyakutshela lokho. Iplan iveza imiphetho emibili yemvilophu (ungqimba C-RAIL-CLRN) nesiphambano ngayinye yento ngaphakathi.

Imibuthano enikezwayo ingamasampula, **hhayi igeji lanoma yisiphi isitimela**. Thayipha igeji lesakhiwo sesitimela sakho ngaphambi kokuthembela emphumeleni.

## Kwezinye izinhlelo

- **LandXML**: umzila wesitimela ubhalwa ngezinguquko zawo (spiType) kanye nebhlokhi ye-`Cant`: igeji, indawo yokuzungeza, isivinini somgqa, kanye nesiteshi lapho kuqala khona nokuphela khona ngalinye ramp lokuphendeka, nokuphendeka okusetshenzisiwe, ukuphendeka okulinganayo kanye nokungalingani. Ukuvula ifayela le-LandXML elinebhlokhi ye-`Cant` kwenza lowo mzila ube yisitimela nalawo mapendeka.
- **IFC**: umzila onezigaba zokuphendeka, amareyili, izilala, ibhalasti kanye ne-sub-ballast.

## Okungakakhiwa

Izinkomba ku-IFC export, imindeni yezinkomba ngaphezu kwegobolondo elivala eli-lodwa (iziswichi ezigoba, amafulogi anenzipho ezinyakazayo, izilayidi, amadayimani), imithetho yegeji ye-kinematic (imvilophu iyisikhundla esingashintshi esinokugoba komgqa), imigqa yezinsimbi zomoya nokuqondisa.

**Isiqinisekiso.** Ku-Block yesitimela, "Isilinganiso esiyacashwa" sithatha u-None noma European (UIC ne-EN). Ukukhetha European kubala imibhalo okucashwa yiyo amaphrojekthi aseYurophu (EN 13803 zamapharamitha womzila, EN 13232 zamaswichi nokuwela, EN 15273 zamageji, EN 13848 kumsebenzi wejometri yomgqa) futhi kunikeza ngayinye imikhawulo ibhokisi lokubhala isigatshana esiphuma kuso. Ayikho inombolo evela kunoma yisiphi isilinganiso esakhiwe ngaphakathi: ukuphendeka, ukungalingani, ukweqisa, ukuthambeka, izinga lokushintsha, ijometri yezinkomba kanye negeji lesakhiwo konke kusasele kuyizibambi, futhi ifasitela liyakutshela lokho. Unjiniyela wezitimela ukuhlola ngayinye inani ngokombhalo wesilinganiso ngokwaso, abhale isigatshana eduze kwalo, ngaphambi kokuthi kwakhiwe lutho. I-Ningizimu Afrika nethebula le-AREMA akukho kulokhu kukhishwa.
