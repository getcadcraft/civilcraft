---
title: Kipya katika 0.9
summary: Violezo vya ukanda na ardhi, snaps na vitufe vya Pick wakati wa kuchora, uchambuzi wa GIS wenye jedwali la sifa, utafiti wa kivuli, mavuno ya jua, faraja na upepo kwa eneo, mwonekano wa 3D wa kutengeneza picha, na nyongeza za Wingu la nukta na WaterCraft.
keywords: nini kipya, whats new, what's new, 0.9, maelezo ya toleo, violezo vya ukanda, violezo vya ardhi, mhariri wa violezo, sehemu ya kawaida, ukanda kadhaa, snap, snaps, chagua, sogeza, nakili, zungusha, tanjenti, render, render 3d, uchambuzi wa gis, buffer, overlay, spatial join, jedwali la sifa, mtindo kwa sifa, utafiti wa kivuli, mavuno ya jua, utci, faraja ya nje, utafiti wa upepo, openfoam, wingu la nukta, las, laz, watercraft, mtiririko wa moto, hidranti, umri wa maji, klorini, mahitaji, vidokezo, mpangilio, mabadiliko, orodha ya mabadiliko, 0.8, 0.8.1, toleo, vipengele vipya, mvua, dhoruba, kujaa maji, kufurika, uchimbaji na ujazo, usawa, njia, njia bora, bwawa la kuhifadhi, mtiririko wa maji nje, kupungua kwa maji, ubao huru, maendeleo, upimaji, ndege isiyo na rubani, rundo la akiba, anwani hadi eneo, kiwanja, udongo, mafuriko, uthabiti wa miteremko, bishop, kutulia, makutano, mistari ya barabara, ishara, umbali wa kuona, marekebisho, mraba-dogo zaidi, kipimo cha njia, mashimo ya wazi, modeli ya vizuizi, kiungo cha redio, fresnel, mpinda, kivuko, lugha, matatizo, live, dwg
from: d7ac5b14
---

Haya ndiyo yaliyobadilika katika CivilCraft 0.9, ikilinganishwa na 0.8.1. CivilCraft 0.9 ni sehemu ya CadCraft Studio 0.9 na programu zake nane. Sehemu kubwa ni violezo vya ukanda na ardhi, snaps wakati wa kuchora, uchambuzi wa GIS, tafiti za jua, nishati ya jua, faraja na upepo wa eneo, na nyongeza mbili: Wingu la nukta na WaterCraft.

## Mpya

### Violezo vya ukanda na ardhi

- **Violezo vya ukanda.** Fungua {{ui:Uso}} › {{ui:Zaidi}} › {{ui:Violezo vya ukanda…}} (au andika {{cmd:TEMPLATES}}). Kiolezo ni sehemu ndogo ya msalaba yenye vipengele, mizunguko, miteremko, vifaa na misimbo ya nukta. Vihifadhi kwenye mradi, katika {{ui:Maktaba yangu}} au kama faili la `.cctemplates.json`. Kihariri cha violezo kinaonyesha mchoro wa ukubwa halisi na kuorodhesha matatizo unapoandika.
- **Jenga kutoka violezo kwa kituo.** Chagua mpangilio wa njia na uwashe {{ui:Jenga kutoka violezo kwa kituo}} kwenye Sifa zake. Kila upande wa kila eneo una orodha yake ya lami na hali yake ya mwisho. {{ui:Ongeza ukanda}} chini ya {{ui:Mikanda kwenye mpangilio huu}} huweka mikanda kadhaa kwenye mpangilio mmoja wa njia.
- **Violezo vya ardhi.** {{ui:Uso}} › {{ui:Zaidi}} › {{ui:Violezo vya ardhi…}} (au andika {{cmd:TERRAINTEMPLATES}}) hufunika vifaa vya tabaka kama udongo wa juu au lami na msingi juu ya ardhi, ukiwa na eneo na ujazo kwa kila tabaka. Angalia [Violezo vya ukanda na violezo vya ardhi](topic:corridor-templates).

### Kuchora

- **Snaps.** Zana za Mpangilio wa njia, Jukwaa, Kiwanja, Umbo la jengo, Mstari wa kipengele, Pima, Mpaka na Eneo la mkusanyiko wa maji hunasa kwenye nukta za upimaji, PI, pembe, vipeo na miundo, zikiwa na lebo karibu na alama. Shikilia {{key:Alt}} kwa nukta huru.
- **Vitufe vya kuchagua, tanjenti, sogeza, nakili, zungusha.** Pembe za jukwaa, kiwanja na mstari wa kipengele zina visanduku vya Easting na Northing vya kuandika na kitufe cha kuchagua chenye msalaba. Sifa pia zina {{ui:Tanjenti kutoka nukta mbili}} kwa mipangilio ya njia na {{ui:Sogeza, nakili na zungusha}} kwa mipangilio ya njia, majukwaa, viwanja na mistari ya kipengele. Angalia [Rasimu kwa snaps, pembe zilizochaguliwa na sogeza, nakili, zungusha](topic:draft-with-snaps).
- **Mwonekano wa 3D wa kutengeneza picha.** Kitufe cha {{ui:Tengeneza picha}} kwenye upau wa 3D kinachora ardhi kwa rangi asilia, anga, ukungu na vivuli laini. Hakibadilishi modeli. Menyu ya {{ui:Jua}} sasa ina vitufe vya {{ui:Tumia}} na {{ui:Funga}}. Angalia [Tazama eneo kwa 3D](topic:site-3d).
- **Paneli hufunguka sehemu moja kwa wakati.** Paneli ya kushoto na paneli ya Sifa hufungua sehemu moja na kufunga nyingine, na vigae vya Ribbon ya Landscape vinavyoshikilia zana kadhaa ni vitufe vilivyogawanyika.

### Uchambuzi wa GIS

- **Chambua.** {{ui:Uso}} › {{ui:Zaidi}} › {{ui:Chambua}} inatoa buffer, overlay, spatial join, chagua kwa sifa au umbo, na pima. Kila zana hutengeneza tabaka jipya kwa hatua moja ya kutendua.
- **Jedwali la sifa.** Menyu ya nukta tatu ya tabaka ina {{ui:Jedwali la sifa…}} na {{ui:Mtindo kwa sifa…}}. Angalia [Chambua tabaka za GIS](topic:gis-analysis) na [Fanya kazi na jedwali la sifa la tabaka](topic:gis-table).

### Eneo: jua, nishati ya jua, faraja na upepo

- **Sehemu ya Mazingira.** Chagua umbo la jengo: sehemu ya {{ui:Mazingira}} iko chini ya {{ui:Saa za jua}} kwenye Sifa zake. Ina utafiti wa kivuli (ramani, jedwali, uhuishaji, CSV), mavuno ya jua kutoka faili ya hali ya hewa ya mwaka wa kawaida (.epw) na faraja ya nje (UTCI).
- **Upepo, uchunguzi tu.** {{ui:Endesha utafiti wa upepo}} hupaka rangi ardhi kutoka "kukaa" hadi "isiyo ya starehe" kwa kila mwelekeo wa upepo kwenye faili ya hali ya hewa. Haijathibitishwa, na paneli inasema hivyo.
- **Nyongeza ya upepo wa watembea kwa miguu (OpenFOAM).** Imezimwa hadi uiwashe kwenye {{ui:Mipangilio}} › {{ui:Programu-jalizi}}. OpenFOAM ni programu unayoisakinisha mwenyewe. Angalia [Kivuli, mavuno ya jua na faraja ya nje](topic:environment).

### Wingu la nukta (nyongeza)

- Washa {{ui:Wingu la nukta}} kwenye {{ui:Mipangilio}} › {{ui:Programu-jalizi}}; kichupo cha Wingu la nukta kinaonekana kwenye paneli ya kulia. Fungua faili ya LAS au LAZ, isafishe, ipange katika ardhi, mimea na majengo, jenga ardhi, kontua na ujazo, kisha hamisha LAS au LAZ. Angalia [Mawingu ya nukta kutoka ndege isiyo na rubani au skana](topic:point-clouds).

### WaterCraft (nyongeza)

- Washa {{ui:WaterCraft (usambazaji wa maji)}} kwenye {{ui:Mipangilio}} › {{ui:Programu-jalizi}}; kichupo cha WaterCraft kinaonekana. Kina mahitaji kutoka kwa wateja, mtiririko wa moto kwenye kila hidranti, bomba kuu lipi likikatika linajali zaidi, na umri wa maji na klorini, kila kimoja kikihifadhiwa kama CSV. Angalia [WaterCraft: mahitaji, mtiririko wa moto, kukatika na umri wa maji](topic:watercraft).

### Kufanya kazi pamoja

- Katika kipindi cha Live unaona vielekezi na majina ya kila mmoja kwenye mpango. Mimea ya maktaba: CivilCraft Landscape inaanza kutoka mkusanyiko wake chaguo-msingi wa Maktaba, {{ui:CivilCraft mandhari}}.

## Katika kila programu

- Vidokezo vinaonekana kama vidokezo vya Bootstrap, na kidokezo cha kuanza kinaweza kufungwa.
- Upau wa vichupo wa paneli usiotoshea unasogezwa badala ya kukatwa.
- Vichwa vya vichupo vya kivinjari husomeka `<hati> - CivilCraft | CadCraft`.
- {{ui:Mipangilio}} ina sehemu ya Mpangilio ambapo chaguo ni orodha kunjuzi ya chaguo za mistari miwili.
- Vipimo vya uzito na joto viko katika {{ui:Mipangilio}} › {{ui:Kimataifa}} › {{ui:Vipimo}}.
- Orodha ya lugha inaonyesha lugha ambazo muundo una faili zake. Lugha zisizo Kiingereza ni rasimu za mashine.

## Zilizorekebishwa

- Nyongeza za utafutaji wa anwani na ukaguzi wa EnergyPlus hazikuweza kuwashwa; sasa zinaweza.
- Msaada sasa unasema nyongeza ya Wingu la nukta huandika wingu lililosafishwa kama LAS 1.4 au LAZ.
- Kubofya mpini wa kitu kilichochaguliwa wenyewe hakuanzishi tena buruta ya mpini iliyosimamisha Pick iliyokuwa ikisubiri.

## Mipaka halisi

- Violezo vya mfano vya ukanda ni vishikilia nafasi visivyotokana na kiwango chochote; mhandisi lazima azikague. Violezo vya ardhi haviongezi uso wowote na havichorwi kwa 3D wala katika mwonekano wa sehemu ya mkato. Ukanda wa pili kwenye mpangilio wa njia haupo katika usafirishaji wa IFC. Hakuna upunguzaji wa taratibu kati ya violezo viwili kwa kituo.
- Mawingu ya nukta yalijaribiwa kwa faili zilizotengenezwa, si upimaji halisi wa ndege isiyo na rubani. LAS na LAZ pekee ndizo zinazosomwa.
- Uchambuzi wa GIS ulijaribiwa kwa tabaka zilizotengenezwa.
- Kivuli, nishati ya jua na faraja ni makadirio ya kupanga; upepo ni uchunguzi usiothibitishwa. Hakuna kati ya hivyo ni thamani ya usanifu.
- WaterCraft ni msaada wa hesabu uliokaguliwa kwa mitandao iliyotengenezwa. Mhandisi wa maji ndiye anayeamua thamani ya namba hizo.
- Lugha zaidi ya Kiingereza ni rasimu za mashine.
- Visakinishi vya Windows havijasainiwa kwa msimbo, na picha ya diski ya macOS haijathibitishwa na mthibitishaji.

## Awali: 0.8 na 0.8.1

Haya ndiyo yaliyobadilika katika CivilCraft 0.8 (2026-11-01) na 0.8.1 (2026-11-02), ikilinganishwa na 0.7. Sehemu kubwa mpya ni zana zinazojaribu mteremko na eneo lako (mvua, uchimbaji na ujazo, njia, mabwawa, maendeleo) na madirisha sita ya hesabu kwa ardhi, barabara, upimaji, migodi, viungo na reli.

### Mpya

**Jaribu mteremko wako**

- **Leta mvua.** {{ui:Leta mvua…}} (chini ya {{ui:Uso}}) inaachia dhoruba juu ya ardhi iliyopimwa mteremko. Unaona maji yakitiririka kutoka kwenye majukwaa, yakikusanyika kwenye pembe za chini, na mabwawa madogo mno yakifurika. Mchakato umehuishwa na unatoa ujazo, kiwango cha juu cha maji yanayotoka, na CSV ya kila bwawa. Seli ya kawaida ni kubwa ili uangalizi wa kwanza uwe wa haraka; seli ndogo zaidi ni polepole. Mabwawa yanayofurika pia yanaonekana kwenye paneli ya Matatizo.
- **Kisawazisha udongo.** {{ui:Kisawazisha udongo…}} hupandisha au kushusha jukwaa hadi kukata kuwe sawa na kujaza, na kuonyesha jedwali la usafirishaji kati yake.
- **Njia bora.** {{ui:Njia bora…}}: chagua mwanzo na mwisho, na CivilCraft inatafuta njia ya bei nafuu zaidi juu ya ardhi inayofuata mipaka yako ya mteremko na mkunjo, kisha inatengeneza mpangilio wa njia kutoka humo.
- **Mabwawa ya kuhifadhi.** {{ui:Mabwawa ya kuhifadhi…}} hukokotoa kiwango na hifadhi kutoka kwenye ardhi yako, hupokea vifaa vya kutolea maji (tundu, kizingiti, V-notch, njia ya kumwagika), hupitisha dhoruba kupitia bwawa, na kukagua kiwango cha juu kilichozuiwa, muda wa kushuka kwa maji na ubao huru (freeboard).
- **Maendeleo kutoka kwa upimaji.** {{ui:Maendeleo kutoka kwa upimaji…}} hulinganisha nyuso za ndege isiyo na rubani au za skani za tarehe tofauti na ardhi ilivyokuwa, na na muundo: asilimia iliyokamilika kwa ujazo, maeneo yaliyochimbwa kupita kiasi na yaliyojazwa kupita kiasi, rundo za akiba, na kazi itakamilika lini kwa kasi hii (imewekwa alama kama makadirio).

**Jua eneo lako**

- **Anwani hadi eneo.** {{ui:Anwani hadi eneo…}} hukusanya data wazi za kiwanja, jengo, matumizi ya ardhi, udongo, mafuriko na ardhi kwenye eneo moja. Unaweza kuhifadhi eneo kwenye faili la mradi: anwani uliyoandika, kila chanzo pamoja na siku uliyokipata na leseni yake, na kilichorejeshwa. Fungua upya au shiriki mradi na eneo bado lipo, bila kupata chochote tena. Unaweza pia kulihifadhi kama faili la eneo au kulituma kwa BimCraft. Angalia [Anwani hadi eneo](topic:address-to-site).

**Ardhi, barabara, upimaji, migodi, viungo na reli**

- **Udongo na miteremko.** {{ui:Udongo na miteremko…}} huchora wasifu wa udongo kati ya mashimo ya uchunguzi unayoandika. Mbinu ya Bishop kisha hutafuta mduara muhimu kwenye ardhi yako, pamoja na kiwango cha maji ardhini, mzigo wa ziada na mgawo wa tetemeko la ardhi; kutulia kwa msingi kunapata ukandamizaji, kutulia mara moja na muda.
- **Makutano na mistari ya barabara.** {{ui:Makutano na mistari ya barabara…}} huunganisha matawi kwa mikunjo ya ukingo (radius moja kwa kila tawi, au mikunjo ya vituo vitatu), umbali wa kuona kwa kasi ya usanifu, ukaguzi wa pembetatu za kuona, njia za watembea kwa miguu, mistari ya kusimama, alama za barabarani na ishara pamoja na ratiba ya ishara. Zinachorwa kwenye mpango na kuhifadhiwa kama .dxf zenye tabaka zenye majina.
- **Marekebisho ya upimaji.** {{ui:Marekebisho ya upimaji…}} huendesha marekebisho ya mraba-dogo zaidi ya njia au mtandao: viwianishi vilivyorekebishwa, duaradufu za makosa, jaribio la chi-squared na alama kwenye kipimo kisicholingana. Mitandao huru, kufunga njia kwa kanuni ya dira, na faili za uwanjani za RW5, GSI, JobXML au CSV zimejumuishwa, na pointi zilizorekebishwa zinahifadhiwa kama CSV.
- **Mashimo ya wazi.** {{ui:Mashimo ya wazi…}} hubadilisha sampuli za uchimbaji kuwa modeli ya vizuizi na shimo la mwisho ndani ya pembe yako ya mteremko, pamoja na uwiano wa ukanda, jedwali kwa kila benchi, na mkunjo wa daraja na tani. Mashimo yaliyoingizwa kwa kipengele cha mapato na ratiba ya uzalishaji yenye mtiririko wa fedha uliopunguzwa pia yapo.
- **Viungo vya redio.** {{ui:Viungo vya redio…}} hukagua mstari wa kuona juu ya ardhi yako kwa kuzingatia mviringo wa dunia, eneo la kwanza la Fresnel, bajeti ya kiungo, kiwango cha kufifia na kukatika kwa njia nyingi, na kutoa urefu wa nguzo utakaoondoa kizuizi kwenye njia. Pia hufanya bajeti za upotevu wa nyuzi, kiasi cha njia na upepo kwenye mnara.
- **Mipinda ya reli.** {{ui:Mipinda ya reli…}} hutengeneza mpinda kutoka namba ya kiwiko chake, vivuko kati ya njia sambamba, na kipimo cha muundo kilichoinamishwa kwa mwinuko wa mkunjo na kupanuliwa kwenye mkunjo. Mpinda unaweza kukaa kwenye kituo cha mpangilio wa njia.

Angalia [Udongo, makutano, marekebisho ya upimaji, mashimo, viungo vya redio na mipinda](topic:soils-roads-survey-mines-links).

### Katika kila programu

- **Lugha.** Lugha 54, kumi kati yake mpya. Lugha zisizo Kiingereza ni rasimu za mashine hadi mzungumzaji mzawa azisome. Mada za msaada bado nyingi ni Kiingereza.
- **Safu za upau wa zana.** {{ui:Mipangilio}} › {{ui:Kwa ujumla}} › {{ui:Safu za upau wa zana}}: Kufunga mistari (kama awali), safu 2 au safu 1. Ribbon ya CivilCraft huonyesha zana inayotumika zaidi kubwa, zinazofuata ndogo, na zilizobaki nyuma ya mshale wa jina la kikundi.
- **Vifaa vya kuingiza.** Trackpad, kalamu, kipanya cha 3D, kidhibiti na MIDI vinaweza kuendesha programu.
- **Matatizo.** Paneli ya Matatizo inayotoa onyo katika kila programu, yenye ukaguzi unaosoma vifurushi vya kanuni.
- **Live.** Mwonekano wa nani yuko wapi katika kipindi cha Live.
- **Nyongeza.** Orodha ya nyongeza, pamoja na nyongeza za mwanga.
- **Unganisha AI yako.** Msaidizi yeyote unayemunganisha anaweza kuendesha zana za CivilCraft. Inakuja na kumbuka kwamba kuunganisha kwa kubofya mara moja ndani ya CadCraft Studio na kiunganishi kilichoandaliwa bado hakiko tayari. Angalia [Ruhusu msaidizi wa AI afanye kazi na eneo lako](topic:assistants).

### Zilizorekebishwa katika 0.8.1

- **Sehemu ya madarasa ya DWG.** Ilisomwa kama aina isiyo sahihi (GitHub cadcraft#5). Imerekebishwa katika CivilCraft pamoja na CadCraft, BimCraft, ModelCraft na TakeoffCraft.
- **Kubadilisha lugha ukiwa unaendesha.** CadCraft Studio na matoleo yaliyofungashwa yanaweza kubadilisha lugha wakati wa kuendesha. Awali yalikuwa Kiingereza pekee. Bado hayajajaribiwa kwenye kila jukwaa: tuambie lugha isipobadilika.

### Bado haipo katika toleo hili

- **Hivi ni misaada ya hesabu.** Kila matokeo katika madirisha mapya yanahitaji ukaguzi wa mhandisi. Nguvu za udongo zinaanzia kwenye thamani za kawaida za kundi la udongo, na dirisha linasema hivyo.
- **Leta mvua.** Uendeshaji kwenye eneo la sampuli unaweza kuchukua zaidi ya dakika mbili kwenye kivinjari kwenye seli ndogo. Ulikaguliwa dhidi ya kesi za mkono na eneo la mkusanyiko wa maji lenye umbo la V, bado si kwenye eneo halisi lililopimwa mteremko.
- **Anwani hadi eneo.** Inasoma faili za data wazi unazoleta, na ilijaribiwa kwenye faili zetu wenyewe pekee. Miti si chanzo. Kupata vyanzo kwa ajili yako kunasubiri maneno ya faragha.
- **Maendeleo kutoka kwa upimaji.** Imejaribiwa kwa upimaji uliotengenezwa pekee. Maendeleo kwenye karatasi na alama (MarkupCraft) na skani dhidi ya modeli (BimCraft) bado hayajajengwa.
- **Udongo na miteremko.** Nyuso za duara pekee: hakuna utafutaji wa kabari wala wa vizuizi, wala ufa wa mvutano.
- **Makutano.** Radius moja kwa kila tawi, hakuna njia za magari makubwa zilizofagiliwa, na bado hayaingii kwenye ukanda.
- **Faili za uwanjani.** Visomaji viliandikwa kutoka maelezo ya umbizo ya umma na kujaribiwa kwenye faili tulizotengeneza. Faili halisi za vifaa zinahitajika.
- **Viungo na reli.** Viungo vya redio: upotevu wa nafasi huru na njia nyingi pekee (hakuna kufifia kwa mvua wala muundo wa antena), na hakuna kiwango cha reli: kila kikomo cha reli ni kishikilia nafasi, chenye namba za rasimu ambazo hakuna mhandisi wa reli aliyezikagua.
- **Windows na macOS.** 0.8 haijasainiwa kwa msimbo. Windows inaweza kutoa onyo, na macOS inauliza ubofye kulia kisha Fungua.

Mengine yote yako katika [Bado hayajajengwa](topic:not-built-yet). Kwa toleo lililotangulia, angalia [Kipya katika 0.7](topic:whats-new-0-7).
