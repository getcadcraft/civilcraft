---
title: Kivuli, mavuno ya jua na starehe ya nje
summary: Chunguza kivuli ambacho misa zako za majengo zinatupa mchana mzima au msimu, tazama uhuishaji wake, kadiria umeme ambao paneli za jua kwenye paa na kuta zingetengeneza katika mwaka wa kawaida, tazama jinsi barabara iliyo kando ya jengo ilivyo starehe (UTCI), na upate kipimo cha uchunguzi wa starehe ya upepo kwa watembea kwa miguu.
keywords: utafiti wa kivuli, kivuli, saa za jua, uhuishaji, jua, solar, PV, photovoltaic, paneli, mavuno, kWh, EPW, faili la hali ya hewa, UTCI, starehe ya joto, starehe ya nje, msongo wa joto, upepo
from: 96e7af4d
---

Sehemu ya **Mazingira** inakaa chini ya **Saa za jua** kwenye **Sifa** ya misa. Inatumia misa ulizochora kama majengo.

## Pakia faili la hali ya hewa

Chagua faili la hali ya hewa la mwaka wa kawaida (**.epw**) kwa mji wako. Ni bure kutoka tovuti ya hali ya hewa ya EnergyPlus na kutoka climate.onebuilding.org. Faili linabaki kwenye kivinjari chako kwa ziara hii. Mavuno ya jua na utafiti wa starehe vinalihitaji; utafiti wa kivuli unafanya kazi bila hilo mradi una mfumo wa viwianishi.

## Utafiti wa kivuli

Chagua tarehe (au weka alama **Msimu** kisha tarehe ya mwisho na hatua kwa siku) na eneo la saa, kisha **Endesha utafiti wa kivuli**. Unapata ramani ya saa za jua, au za kivuli, kwenye ardhi inayozunguka misa; jedwali la kiasi cha ardhi iliyo kivulini siku nzima; na uhuishaji wa siku unaoweza kuucheza au kuupitia hatua kwa hatua. **Hifadhi ramani**, **Hifadhi fremu za uhuishaji** (fremu zote kwenye picha moja) na **Hifadhi saa** (CSV) zinahifadhi matokeo.

Ardhi inachukuliwa kuwa bapa kwenye kiwango cha misa ya chini kabisa. Kwa kivuli kwenye ardhi yenye mteremko, tumia **Saa za jua**, ambayo inasoma mandhari.

## Mavuno ya jua

Weka ufanisi wa paneli, sehemu ya kila paa na ukuta inayofunikwa, na hasara za mfumo, kisha **Endesha mavuno ya jua**. Kwa kila paa na ukuta unapata umeme ambao mita moja ya mraba ya paneli ingetengeneza katika mwaka wa kawaida, ni kiasi gani misa jirani zinachukua, na jumla kwa kila misa. Modeli imeandikwa kwa maneno rahisi karibu na kitufe: ni makadirio ya kupanga kutoka mwaka wa kawaida, si dhamana.

## Starehe ya nje

**Endesha starehe** inahesabu Universal Thermal Climate Index (UTCI) kwa mtu aliyesimama kwenye ardhi wazi na kando ya misa ya kwanza (pande za kusini, kaskazini, mashariki na magharibi), pamoja na kivuli cha kila misa. Inaonyesha anga kiasi gani linaonekana, UTCI ya wastani ya mchana, na saa zilizo juu ya 32 (msongo wa joto) na chini ya 0 (msongo wa baridi).

## Upepo (uchunguzi)

**Endesha utafiti wa upepo** inatatua mtiririko wa hewa kuzunguka misa zako mara moja kwa kila mwelekeo wa upepo unaovuma kwenye faili lako la hali ya hewa (mielekeo 4, 8, 12 au 16), juu ya mazingira unayochagua (nchi wazi, kitongoji au katikati ya mji), kisha inajumlisha upepo wa saa kwa saa wa mwaka mzima. Ramani inapaka ardhi kwa daraja la starehe, kuanzia kijani (**kukaa**) kupitia **kusimama**, **kutembea polepole** na **kutembea**, hadi nyekundu (**haifai**): shughuli ambayo kasi yake ya kikomo (4, 6, 8 na 10 m/s) inazidishwa kwa si zaidi ya 5 % ya saa. Jedwali la pili linatoa daraja la NEN 8100 (A hadi E) kutokana na sehemu ya saa ambazo upepo unapita 5 m/s. Kipengele cha mvuvumko kinazidisha wastani wa saa ili kupata mvuvumko unaofanya kazi.

Jinsi inavyofanya kazi, kwa maneno rahisi: kitatuzi cha mtiririko wa lattice-Boltzmann large-eddy (chetu, kwenye maktaba `lib/wind`) kwenye kisanduku kinachozunguka majengo, wasifu wa kasi ya upepo unaopanda kadri urefu unavyoongezeka juu ya ukali uliochaguliwa, na kasi karibu mita 1.5 juu ya ardhi ikilinganishwa na kasi ya upepo wa juu zaidi kwa mita 10. **Uchunguzi** ni wa haraka na mbaya; **Kawaida** inatumia seli zaidi na inachukua muda mrefu zaidi. Ikiwa paneli inasema gridi ni mbaya (chini ya seli 10 juu ya jengo refu zaidi), au mtiririko ulikuwa bado unabadilika, amini ramani kidogo.

**Hiki si nini.** Kitatuzi kimekaguliwa kwenye mitiririko ya kitabuni (mfereji, tundu lenye mfuniko unaosukumwa), na kuendeshwa kwenye mchemraba kuona kwamba mkia wa nyuma na ongezeko la kasi kwenye pembe vinaonekana sahihi. **Hakijathibitishwa** dhidi ya vipimo vya handaki la upepo la majengo, kwa hiyo kila matokeo yameandikwa kama yasiyothibitishwa. Usikitumie kwa thamani ya usanifu, mzigo wa upepo au cheti cha mipango: mhandisi wa upepo lazima aendeshe na kuthibitisha utafiti sahihi. Ardhi bapa, kuta laini za majengo, njia ya mkato ya ukali wa kituo cha hali ya hewa na jedwali la vizingiti ni kurahisisha; vizingiti vinaweza kutofautiana na vigezo vinavyotumiwa na mamlaka yako.

## Upepo kwa OpenFOAM (nyongeza)

Injini ya upepo iliyojengewa ndani hapo juu ni ya majaribio. Kwa kitatuzi sahihi cha mtiririko, washa nyongeza ya **Upepo wa watembea kwa miguu (OpenFOAM)** kwenye **Mipangilio > Programu-jalizi** (imezimwa hadi uiwashe). Ni programu yenye leseni yake ya GPL, imetenganishwa na sehemu nyingine za CadCraft, na haijumuishi OpenFOAM: unaisakinisha wewe mwenyewe. Kisha **Injini** kwenye kizuizi cha upepo inaorodhesha OpenFOAM.

Kinachohitajika kusanidiwa, mara moja:
1. **Sakinisha OpenFOAM** (ESI v-series kutoka openfoam.com; nyongeza imejaribiwa na v2512). Kwenye Ubuntu au Debian (pia ndani ya WSL kwenye Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, kisha `sudo apt install openfoam2512-default`. Inasakinisha chini ya `/usr/lib/openfoam/openfoam2512`. CadCraft inahitaji `blockMesh`, `snappyHexMesh` na `simpleFoam` ili kuendesha. (Kifurushi cha zamani cha `openfoam` 1912 kutoka hifadhi ya Ubuntu nacho kinafanya kazi, lakini vitendakazi vyake vya kitu vinaanguka; nyongeza basi inasoma faili za matokeo yenyewe.)
2. **Anzisha msaidizi** kutoka folda ya `runner` ya nyongeza kwa Node.js: `node cc-openfoam-runner.mjs serve`. Ikiwa OpenFOAM haiko kwenye njia ya kutafuta, mpe `runner.json` ndogo yenye njia ya `etc/bashrc` ya OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`), kisha uanzishe kwa `--config runner.json`. Msaidizi anasikiliza kwenye kompyuta hii pekee na anachapisha tokeni.
3. **Bandika tokeni** kwenye sehemu za nyongeza kwenye kizuizi cha upepo (anwani inabaki `http://127.0.0.1:8765`), kisha ubonyeze **Kagua msaidizi**.

Kisha **Endesha utafiti wa upepo** inafanya kazi kesi moja kwa kila mwelekeo wa upepo kwenye faili la hali ya hewa: misa zako zinakuwa uso (STL) kwenye kisanduku chenye ukubwa wa mwongozo wa kawaida (urefu 5 wa jengo kuzunguka na juu yake, 10 nyuma), zinatengenezewa mesh kwa blockMesh na snappyHexMesh, zinaendeshwa kama RANS ya k-epsilon ya hali thabiti yenye ingizo la tabaka la anga la mpaka juu ya ukali unaochagua, na kasi kwenye mita 1.5 inasomwa tena na kubadilishwa kuwa madaraja yale yale ya Lawson na NEN 8100. Hakuna kinachotoka kwenye kompyuta yako.

**Kilichokaguliwa.** Maandishi yaliyo juu ya matokeo yanasema hivyo waziwazi na ni sehemu ya kila CSV iliyohifadhiwa. Uandishi wa kesi wa nyongeza, usomaji wa matokeo na mfumo mzima wa kazi vimejaribiwa bila OpenFOAM, na mchemraba mmoja umeendeshwa kupitia OpenFOAM halisi kwa ukubwa tatu wa mesh (nambari ziko kwenye vidokezo vya mradi). **Haijathibitishwa** dhidi ya vipimo vya handaki la upepo la majengo. Ni usomaji wa uchunguzi, si thamani ya usanifu wala cheti. K-epsilon ya kawaida inakadiria mtikisiko kupita kiasi mbele ya majengo, ardhi ni bapa, kuta ni laini, na hakuna mandhari wala mimea.
