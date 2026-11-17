---
title: Ukuthunzi, isivuno selanga nenduduzo yangaphandle
summary: Hlola ukuthunzi okuphonswa yizinqwaba zezakhiwo zakho ngosuku noma ngonyaka, bona i-animation yakho, ubale ukuthi amaphaneli elanga ophahleni nasezindongeni angakhiqiza kangakanani ugesi ngonyaka ojwayelekile, bone ukuthi isitaladi esiseduze nesakhiwo sinenduduzo kangakanani (UTCI), futhi uthole ukufunda kokuhlola komoya wabahambi ngezinyawo.
keywords: ukuhlolwa kokuthunzi, isithunzi, amahora elanga, i-animation, solar, PV, photovoltaic, amaphaneli, isivuno, kWh, EPW, ifayela lesimo sezulu, UTCI, induduzo yokushisa, induduzo yangaphandle, ukucindezeleka kokushisa, umoya
from: 96e7af4d
---

Isigaba se-**Imvelo** sisemuva kwe-**Amahora elanga** ku-**Izakhiwo** zenqwaba. Sisebenzisa izinqwaba ozidwebile njengezakhiwo.

## Layisha ifayela lesimo sezulu

Khetha ifayela lesimo sezulu lonyaka ojwayelekile (**.epw**) edolobheni lakho. Lamafayela ahhala kusayithi lesimo sezulu le-EnergyPlus nakusuka ku-climate.onebuilding.org. Ifayela lihlala kusiphequluli sakho kule vakashi. Isivuno selanga nocwaningo lwenduduzo kuyawudinga; ukuhlolwa kokuthunzi kusebenza ngaphandle kwalo uma iphrojekthi inohlelo lwezixhumanisi.

## Ukuhlolwa kokuthunzi

Khetha usuku (noma tshekela **Isikhathi sonyaka** nosuku lokugcina nesinyathelo ngezinsuku) nesikhathi sendawo, bese **Qalisa ukuhlolwa kokuthunzi**. Uzothola imephu yamahora elanga, noma ethunzi, emhlabeni ozungeze izinqwaba; ithebula lokuthi ingakanani yomhlaba ethunzini ngosuku; ne-animation yalolo suku ongayidlala noma uyinyathelo ngalinye. **Londoloza imephu**, **Londoloza izimo ze-animation** (zonke izimo esithombeni esisodwa) kanye **Londoloza amahora** (CSV) ziyagcina imiphumela.

Umhlaba uthathwa njengolingene ezingeni lenqwaba esezansi kakhulu. Ukuthunzi emhlabathini othambekile sebenzisa **Amahora elanga**, afunda ubuso bomhlaba.

## Isivuno selanga

Setha ukusebenza kwephaneli, ukuthi kumboziwe kangakanani uphahla nodonga ngalunye kanye nokulahleka kwesistimu, bese **Qalisa isivuno selanga**. Ophahleni nasodongeni ngalunye uzothola ugesi isikwele samitha yephaneli esingawukhiqiza ngonyaka ojwayelekile, nokuthi izinqwaba eziseduze zithatha kangakanani kuwo, nesamba sangenqwabeni ngayinye. Imodeli ibhalwe ngamagama alula eduze kwenkinobho: ilinganiselo lokuhlela ngonyaka ojwayelekile, hhayi isiqinisekiso.

## Induduzo yangaphandle

**Qalisa induduzo** ibala i-Universal Thermal Climate Index (UTCI) komuntu ome emhlabeni ovulekile nasecaleni lenqwaba yokuqala (izinhlangothi ezingasezansi, ezingasenyakatho, ezingempumalanga nezingasentshonalanga), ngethunzi lenqwaba ngayinye. Ibonisa ukuthi isibhakabhaka esiningi kangakanani siyabonakala, i-UTCI yemini ephakathi, namahora angaphezu kuka-32 (ukucindezeleka kokushisa) nangaphansi kuka-0 (ukucindezeleka kokubanda).

## Umoya (ukuhlola kuqala)

**Qalisa ukuhlolwa komoya** ixazulula ukugeleza komoya ozungeze izinqwaba zakho kanye, ngayinye yezinhlangothi zomoya ezivunguza kwifayela lakho lesimo sezulu (4, 8, 12 noma 16 izinhlangothi), phezu kwendawo ozikhethela yona (izwe elivulekile, idolobhana noma isifunda sasedolobheni), bese ufaka ndawonye umoya wonke wonyaka ngamahora. Imephu ipenda umhlaba ngeklasi yenduduzo, kusuka oluhlaza (**ukuhlala phansi**) kuya ku-**ukuma**, **ukuhamba** kanye **nokuhamba ngezinyawo** kuya kobomvu (**akuphathekile**): isenzo esingalungelwa isivinini sayo somkhawulo (4, 6, 8 no-10 m/s) esidlula amaphesenti angu-5 amahora kuphela. Ithebula lesibili linikeza ibanga le-NEN 8100 (A kuya kwe-E) kusuka esabelweni samahora lapho umoya udlula i-5 m/s. Isici sesikhukhula siphindaphinda isilinganiso samahora somoya ukuze sinikeze isivunguzo esisebenzayo.

Ukusebenza, ngamagama alula: isixazululi somgeleko womoya i-lattice-Boltzmann large-eddy (esethu, kulabhulali `lib/wind`) ebhokisini elizungeze izakhiwo, iphrofayili yesivinini somoya ekhuphuka ngokuphakama ngokuya ngokuqina okukhethiwe, nesivinini cishe ngo-1.5 m phezu komhlaba eqhathaniswa nesivinini ngaphambili kwe-10 m. **Ukuhlola** kuyashesha futhi kungaqondile kakhulu; **Okujwayelekile** kusebenzisa amaseli amaningi futhi kuthatha isikhathi eside kakhulu. Uma iphaneli isho ukuthi igridi ingaqondile (ngaphansi kwamaseli angu-10 phezu kwesakhiwo esiphakeme kunazo zonke), noma ukugeleza bekusashintsha, ikholwe imephu kancane.

**Akuyona lokhu.** Isixazululi sihlolwe ngokugeleza okuvela encwadini (umfudlana, isikhala esihanjiswa yisiciko), futhi sasetshenziswa ekhubeni ukuze kubonakale ukuthi umsila nokukhawuleza kwesivinini emakhoneni kubukeka kahle. **Akukaqinisekiswa** ngokulinganisa kwesiqhwaga somoya ezakhiweni, ngakho yonke imiphumela imakwe njengengaqinisekisiwe. Ungayisebenzisi njengenani lokuklama, umthwalo womoya noma isitifiketi sokuhlela: uchwepheshe womoya kufanele enze futhi aqinisekise ucwaningo olufanele. Umhlaba oyisicaba, izindonga ezibushelelezi zezakhiwo, isinqamuleli sokuqina kwesiteshi sesimo sezulu nethebula lemikhawulo kuyizinqubo ezilula; imikhawulo ingahluka kumithetho yomphathi wakho.

## Umoya nge-OpenFOAM (i-add-on)

Injini yomoya ekhona ngenhla ayisekho esigabeni sokuhlola. Ukuze uthole isixazululi sokugeleza esifanele, vula i-add-on ethi **Umoya wabahambi ngezinyawo (OpenFOAM)** ku-**Izilungiselelo > Okwengeziwe** (icimile kuze kube wukuthi uyivule). Isofthiwe yayo ine-GPL yayo, igcinwa ngaphandle kwesinye se-CadCraft, futhi ayihlanganisi i-OpenFOAM: uyifake wena. Bese **Injini** ebhulokini lomoya ibala i-OpenFOAM.

Okulungiselelwa kanye:

1. **Faka i-OpenFOAM** (uchungechunge lwe-ESI v-series ku-openfoam.com; i-add-on ihlolwe nge-v2512). Ku-Ubuntu noma Debian (nakwi-WSL ngaphakathi kwe-Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, bese `sudo apt install openfoam2512-default`. Ifakwa ngaphansi kwe-`/usr/lib/openfoam/openfoam2512`. I-CivilCraft idinga i-`blockMesh`, i-`snappyHexMesh` ne-`simpleFoam` ukuze isebenze. (Iphakheji endala ye-`openfoam` 1912 ku-archive yoMbuso waseUbuntu nayo iyasebenza, kodwa ama-function objects ayo ayaphazamiseka; i-add-on ke ifunda amafayela emiphumela ngokwayo.)
2. **Qalisa umsizi** kusuka kwifolda ye-`runner` ye-add-on nge-Node.js: `node cc-openfoam-runner.mjs serve`. Uma i-OpenFOAM ingekho endleleni yokusesha, yinike i-`runner.json` encane enendlela ye-`etc/bashrc` ye-OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) bese uyiqalisa nge-`--config runner.json`. Umsizi ulalela le kompyutha kuphela futhi ukhipha ithokheni.
3. **Namathisela ithokheni** ezindaweni ze-add-on ebhulokini lomoya (ikheli lihlala `http://127.0.0.1:8765`) bese ucindezela **Hlola umsizi**.

Bese **Qalisa ukuhlolwa komoya** lusebenza ngecala elilodwa ngesiqondiso ngasinye somoya esifayeleni lesimo sezulu: izinqwaba zakho ziba umphezulu (STL) ebhokisini elilinganiselwe ngomhlahlandlela ojwayelekile (izakhiwo ezi-5 phezulu nasemacaleni, ezi-10 ngemuva), zikhiqizwe zibe yigridi nge-blockMesh ne-snappyHexMesh, zisebenze njenge-k-epsilon RANS ezinzile nenkomba ye-atmospheric boundary layer ngaphezu kokuqina okukhethiwe, futhi isivinini ku-1.5 m sifundwa bese siguqulelwa ezigabeni ezifanayo ze-Lawson ne-NEN 8100. Akukho okushiya ikhompyutha yakho.

**Okuhlolwe.** Umbhalo ongaphezulu emiphumelweni uyakusho lokho ngokusobala, futhi ingxenye yeCSV yonke elondolozwe. Ukubhalwa kwecala le-add-on, ukufundwa kwemiphumela nomugqa wonke kuhlolwe ngaphandle kwe-OpenFOAM, futhi ikhyubu eyodwa iqhutshwe nge-OpenFOAM yangempela ngobukhulu bemeshi abathathu (izinombolo zisemanothini ephrojekthi). **Ayikaqinisekiswa** ngokulinganisa kwesiqhwaga somoya ezakhiweni. Ukuhlolwa okuyinkomba yokuhlola, hhayi inani lokwakha futhi hhayi isitifiketi. I-k-epsilon ejwayelekile iyakhulisa ukuqina kokuphazamiseka phambi kwezakhiwo, umhlaba uyisicaba, izindonga zibushelelezi, futhi kakhona akukho ukuma kwezintaba noma izitshalo.
