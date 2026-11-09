---
title: Kilicho kipya katika 0.8 na 0.8.1
summary: CivilCraft 0.8 inaongeza Leta mvua (dhoruba inayopita juu ya uwekaji wa ardhi wako), kisawazisha udongo, mtafutaji wa njia bora, mabwawa ya kuhifadhi, maendeleo kutoka kwa upimaji, kiingizi cha anwani hadi eneo kinachoweka eneo ndani ya mradi, na madirisha ya udongo na miteremko, makutano na mistari ya barabara, marekebisho ya upimaji, mashimo ya wazi, viungo vya redio na mipinda ya reli. 0.8.1 inarekebisha jinsi faili za DWG zinavyosomwa.
keywords: kilicho kipya, nini kipya, maelezo ya toleo, orodha ya mabadiliko, mabadiliko, 0.8, 0.8.1, toleo, vipengele vipya, mvua, dhoruba, kujaa maji, kufurika, uwekaji wa ardhi, usawa, kata na jaza, usafirishaji, njia bora, gharama ndogo zaidi, mpangilio wa njia, bwawa la kuhifadhi, kutoka, kushuka, ubao wa usalama, maendeleo, upimaji, drone, rundo la akiba, anwani hadi eneo, kiwanja, udongo, mafuriko, uthabiti wa mteremko, bishop, makazi, makutano, mistari ya barabara, alama, umbali wa kuona, marekebisho, least squares, traverse, shimo wazi, modeli ya vizuizi, kiungo cha redio, fresnel, mpinda, crossover, lugha, matatizo, moja kwa moja, dwg
from: b0932cf0
---

Hii ndiyo iliyobadilika katika CivilCraft 0.8 (2026-11-01) na 0.8.1 (2026-11-02), ikilinganishwa na 0.7. Sehemu kubwa mpya ni zana zinazopima uwekaji wa ardhi wako na eneo lako (mvua, uchimbaji na ujazaji, njia, mabwawa, maendeleo), pamoja na madirisha sita ya hesabu kwa ardhi, barabara, upimaji, migodi, viungo na reli.

## Mpya

### Pima uwekaji wa ardhi wako

- **Leta mvua.** {{ui:Make it rain…}} (chini ya {{ui:Surface}}) inadondosha dhoruba juu ya ardhi iliyosawazishwa. Unaona maji yakitiririka kutoka kwenye viwanja, yakikusanyika kwenye pembe za chini na kufurika kwenye mabwawa yaliyo madogo mno. Mwendo unaonyeshwa kwa uhuishaji na unatoa ujazo, kiwango cha juu cha maji yanayotoka, na faili ya CSV ya kila bwawa. Seli ya chaguo-msingi ni kubwa ili uangalizi wa kwanza uwe wa haraka; seli ndogo zaidi ni polepole. Mabwawa yanayofurika pia yanaonekana kwenye Paneli ya Matatizo.
- **Kisawazisha udongo.** {{ui:Earthwork balancer…}} hupandisha au kushusha kiwanja hadi kukata kulingane na kujaza, na kuonyesha jedwali la usafirishaji kati yao.
- **Njia bora.** {{ui:Best route…}}: chagua mwanzo na mwisho, na CivilCraft hutafuta njia ya bei nafuu zaidi kuvuka ardhi inayofuata mipaka yako ya mteremko na mkunjo, kisha kutengeneza mpangilio wa njia kutoka hapo.
- **Mabwawa ya kuhifadhi.** {{ui:Detention ponds…}} hukokotoa hatua na uhifadhi kutoka ardhini kwako, inapokea vifaa vya kutoka (orifice, weir, V-notch, spillway), inapitisha dhoruba kupitia bwawa na kukagua kiwango cha juu kinachozuiliwa, muda wa kushuka na ubao wa usalama (freeboard).
- **Maendeleo kutoka kwa upimaji.** {{ui:Progress from surveys…}} inalinganisha nyuso za drone au skana za tarehe tofauti na ardhi ilivyokuwa na na muundo: asilimia iliyokamilika kwa ujazo, maeneo yaliyochimbwa kupita kiasi na yaliyojazwa kupita kiasi, marundo ya akiba, na wakati kazi itakapokamilika kwa kasi hii (imewekwa alama kama makadirio).

### Jua eneo

- **Anwani hadi eneo.** {{ui:Address to site…}} inakusanya data wazi ya kiwanja, jengo, ukanda, udongo, mafuriko na ardhi kwenye eneo moja. Unaweza kuhifadhi eneo ndani ya faili la mradi: anwani uliyoandika, kila chanzo pamoja na siku uliyokipata na leseni yake, na kilichorudishwa. Ukifungua upya au kushiriki mradi, eneo bado lipo, bila kupakua tena chochote. Pia unaweza kuhifadhi kama faili la eneo au kulituma kwa BimCraft. Tazama [Anwani hadi eneo](topic:address-to-site).

### Ardhi, barabara, upimaji, migodi, viungo na reli

- **Udongo na miteremko.** {{ui:Soils and slopes…}} huchora wasifu wa udongo kati ya mashimo ya uchunguzi unayoandika. Njia ya Bishop kisha hutafuta duara muhimu kwenye ardhi yako, pamoja na kiwango cha maji ya ardhini, mzigo wa ziada na mgawo wa tetemeko la ardhi; kutulia kwa msingi kunajumuisha ukandamizaji, kutulia kwa papo hapo na muda.
- **Makutano na mistari ya barabara.** {{ui:Junctions and striping…}} hukusanya miguu pamoja kwa mizunguko ya ukingo (radius moja kwa kila mguu, au mizunguko ya vituo vitatu), umbali wa kuona kwa kasi ya muundo, ukaguzi wa pembetatu za kuona, vivuko vya watembea kwa miguu, mistari ya kusimama, alama na ishara pamoja na jedwali la ishara. Zinachorwa kwenye mpango na kuhifadhiwa kama .dxf zenye tabaka zenye majina.
- **Marekebisho ya upimaji.** {{ui:Survey adjustment…}} huendesha marekebisho ya least-squares ya traverse au mtandao: viratibu vilivyorekebishwa, duaradufu za makosa, jaribio la chi-squared na alama kwenye kipimo kisicholingana. Mitandao huru, kufunga traverse kwa kanuni ya dira na RW5, faili za uwanjani za GSI, JobXML au CSV zimejumuishwa, na pointi zilizorekebishwa huhifadhiwa kama CSV.
- **Mashimo ya wazi.** {{ui:Open pits…}} hubadilisha sampuli za uchimbaji kuwa modeli ya vizuizi na shimo la mwisho ndani ya pembe yako ya mteremko, pamoja na uwiano wa ukanda, jedwali kwa kila benchi na mkunjo wa daraja na tani. Mashimo yaliyoingizwa kwa kipengele cha mapato na ratiba ya uzalishaji yenye mtiririko wa fedha uliopunguzwa pia yapo.
- **Viungo vya redio.** {{ui:Radio links…}} hukagua mstari wa kuona juu ya ardhi yako ukizingatia mvimbo wa dunia, eneo la kwanza la Fresnel, bajeti ya kiungo, akiba ya kufifia na hitilafu ya njia nyingi, na kutoa urefu wa mlingoti unaohitajika ili njia iwe wazi. Pia hufanya bajeti za hasara ya nyuzi, kiasi cha njia na upepo kwenye mnara.
- **Mipinda ya reli.** {{ui:Rail turnouts…}} hutengeneza mpinda kutoka namba yake ya frog, makutano ya kuvuka kati ya njia sambamba, na kipimo cha muundo kinachoinamishwa kwa cant na kupanuliwa kwenye mkunjo. Mpinda unaweza kuwa kwenye kituo cha mpangilio wa njia.

Tazama [Udongo, makutano, marekebisho ya upimaji, mashimo, viungo vya redio na mipinda](topic:soils-roads-survey-mines-links).

## Katika kila programu

- **Lugha.** Lugha 54, kumi kati yake ni mpya. Lugha zisizo Kiingereza ni rasimu za mashine hadi mzungumzaji wa asili azisome. Mada za msaada bado ni Kiingereza kwa sehemu kubwa.
- **Safu za upau wa zana.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Wrap (kama awali), safu 2 au safu 1. Ribbon ya CivilCraft huonyesha zana inayotumika zaidi kubwa, zinazofuata ndogo, na zilizobaki nyuma ya mshale wa jina la kundi.
- **Vifaa vya kuingiza.** Trackpad, kalamu, kipanya cha 3D, kidhibiti na MIDI vinaweza kuendesha programu.
- **Matatizo.** Paneli ya Matatizo inayoonya katika kila programu, pamoja na ukaguzi unaosoma seti za kanuni.
- **Moja kwa moja.** Mwonekano wa nani yuko wapi katika kipindi cha Moja kwa moja.
- **Programu-jalizi.** Orodha ya programu-jalizi, pamoja na programu-jalizi za mwanga.
- **Unganisha AI yako.** Msaidizi yeyote wa AI utakayounganisha anaweza kuendesha zana za CivilCraft. Unakuja na onyo kwamba kuunganisha kwa kubofya mara moja ndani ya CadCraft Studio na kiunganishi kilichopangishwa bado havijawa tayari. Tazama [Mruhusu msaidizi wa AI afanye kazi na eneo lako](topic:assistants).

## Imerekebishwa katika 0.8.1

- **Sehemu ya madarasa ya DWG.** Ilisomwa kama aina isiyo sahihi (GitHub cadcraft#5). Imerekebishwa katika CivilCraft pamoja na CadCraft, BimCraft, ModelCraft na TakeoffCraft.
- **Kubadilisha lugha wakati programu inaendeshwa.** CadCraft Studio na matoleo yaliyofungashwa yanaweza kubadilisha lugha wakati wa kuendeshwa. Hapo awali yalikuwa Kiingereza pekee. Bado hayajajaribiwa kwenye kila jukwaa: tujulishe ikiwa lugha haibadiliki.

## Bado haipo katika toleo hili

- **Hizi ni misaada ya hesabu.** Kila matokeo katika madirisha mapya yanahitaji ukaguzi wa mhandisi. Nguvu za udongo huanza kutoka thamani za kawaida kwa kundi la udongo, na dirisha linasema hivyo.
- **Leta mvua.** Uendeshaji kwenye eneo la sampuli unaweza kuchukua zaidi ya dakika mbili kwenye kivinjari kwa seli ndogo. Ulikaguliwa dhidi ya kesi za mkono na eneo la mkusanyiko wa maji lenye umbo la V, lakini bado si kwenye eneo halisi lenye ardhi iliyosawazishwa.
- **Anwani hadi eneo.** Inasoma faili wazi za data unazoleta, na imejaribiwa kwenye faili zetu wenyewe pekee. Miti si chanzo. Kupakua vyanzo kwa ajili yako kunasubiri maneno ya faragha.
- **Maendeleo kutoka kwa upimaji.** Imejaribiwa kwenye upimaji wa kubuniwa pekee. Maendeleo kwenye laha na alama (MarkupCraft) na skana dhidi ya modeli (BimCraft) bado hayajajengwa.
- **Udongo na miteremko.** Nyuso za mduara pekee: hakuna utafutaji wa kabari au wa kizuizi, wala nyufa za mvutano.
- **Makutano.** Radius moja kwa kila mguu, hakuna njia za kugeuka za lori, na bado haziingii kwenye ukanda.
- **Faili za uwanjani.** Wasomaji waliandikwa kutoka maelezo ya umma ya muundo na kujaribiwa kwenye faili tulizozitengeneza. Faili halisi za vyombo vya kupimia zinahitajika.
- **Viungo na reli.** Viungo vya redio: hasara ya nafasi huru na njia nyingi pekee (hakuna kufifia kwa mvua wala mifumo ya antena), na hakuna kiwango cha reli: kila kikomo cha reli ni nafasi ya kushikilia, pamoja na namba za rasimu ambazo mhandisi wa reli hajazikagua.
- **Windows na macOS.** 0.8 haijasainiwa kwa msimbo. Windows inaweza kuonya, na macOS huomba ubofye kulia kisha Fungua.

Kila kitu kingine kiko katika [Bado hakijajengwa](topic:not-built-yet). Kwa toleo lililotangulia, tazama [Kilicho kipya katika 0.7](topic:whats-new-0-7).
