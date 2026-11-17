---
title: Okusha ku-0.9
summary: Izifanekiso zekhoridoro nezomhlaba, ukunamathela nezinkinobho zokukhetha ngesikhathi sokudweba, ukuhlaziya kwe-GIS nethebula lezici, izifundo zethunzi, amandla elanga, induduzo nomoya zendawo, ukubuka okungu-3D ngokuthi Renda, kanye nezengezo zamafu amaphoyinti kanye ne-WaterCraft.
keywords: okusha, 0.9, amanothi okukhishwa, izifanekiso zekhoridoro, izifanekiso zomhlaba, umhleli wezifanekiso, isigaba esijwayelekile, amakhoridoro amaningi, namathela, namathelo, khetha, hambisa, kopisha, zungeza, ithenjenti, renda, renda 3d, ukuhlaziya kwe-gis, ibhafa, ukumboza, ukuhlanganisa kwendawo, ithebula lezici, hlobisa ngokwesici, isifundo sethunzi, amandla elanga, utci, induduzo yangaphandle, isifundo somoya, openfoam, amafu amaphoyinti, las, laz, watercraft, ukugeleza komlilo, hydrant, ubudala bamanzi, i-chlorine, izidingo, amathiphu, ukwakheka, okusha, izinguquko, 0.8, 0.8.1, inguqulo, izici ezintsha, imvula, isiphepho, ukuchitheka kwamanzi, ukugcwala, ukusebenza komhlaba, ukulinganisa, ukumba nokugcwalisa, ukuthutha, indlela engcono kakhulu, umzila, ichibi lokugcina, ukukhipha, ukwehla kwamanzi, ukuphakama kwesikhala, inqubekelaphambili, ukuhlola, idrone, isitokhi, ikheli kuya esizeni, ipaseli, inhlabathi, ukugeleza kwamanzi, ukuzinza kwethambeka, bishop, ukuhla, ukuhlangana, imikhondo, izimpawu, ukubona kwesibonakude, ukulungisa, least squares, traverse, umgodi ovulekile, imodeli yebhlokhi, uxhumo lomsakazo, fresnel, uxhumo lwesitimela, izinhlelo zolimi, izinkinga, live, dwg
from: d7ac5b14
---

Lokhu yikho okushintshile ku-CivilCraft 0.9, uma kuqhathaniswa ne-0.8.1. I-CivilCraft 0.9 ingxenye ye-CadCraft Studio 0.9 nezinhlelo zayo eziyisishiyagalombili. Izingxenye ezinkulu yizifanekiso zekhoridoro nezomhlaba, ukunamathela lapho udweba, izifundo zelanga, amandla elanga, induduzo nomoya zendawo, kanye nezengezo ezimbili: Amafu amaphoyinti kanye ne-WaterCraft.

## Okusha

### Izifanekiso zekhoridoro nezomhlaba

- **Izifanekiso zekhoridoro.** Vula {{ui:Surface}} › {{ui:More}} › {{ui:Izifanekiso zekhoridoro…}} (noma bhala {{cmd:TEMPLATES}}). Isifanekiso siyisigaba esincane esinezingxenye, okusuka, amathambeka, izinto nekhodi zamaphoyinti. Zigcine kuphrojekthi, ku-{{ui:My library}} noma njengefayela `.cctemplates.json`. Umhleli wezifanekiso ubonisa umdwebo wesikali sangempela futhi ubhala izinkinga njengoba uthayipha.
- **Yakha ngezifanekiso ngesiteshi.** Khetha umzila bese uvula {{ui:Build from templates by station}} kuZizithakazelo zawo. Uhlangothi ngalunye lwesifunda ngalunye lunohlu lwalo lomgwaqo kanye nesimo sokuphela salo. {{ui:Add a corridor}} ngaphansi kwe-{{ui:Corridors on this alignment}} ibeka amakhoridoro amaningi emzileni owodwa.
- **Izifanekiso zomhlaba.** {{ui:Surface}} › {{ui:More}} › {{ui:Izifanekiso zomhlaba…}} (noma bhala {{cmd:TERRAINTEMPLATES}}) ibeka izingqimba zezinto ezifana nomhlabathi wangaphezulu noma umgwaqo ibe nesisekelo somhlaba, ibale indawo nevolumu ngayinye yengqimba. Bheka [Izifanekiso zekhoridoro nezifanekiso zomhlaba](topic:corridor-templates).

### Ukudweba

- **Ukunamathela.** Amathuluzi i-Alignment, Pad, Parcel, Mass, Feature line, Measure, Boundary kanye ne-Catchment anamathela kumaphoyinti okuhlola, ama-PI, amakhona, izinhlangothi nezakhiwo, nelebula eseduze kwesimaki. Bamba {{key:Alt}} ukuze uthole iphoyinti elikhululekile.
- **Izinkinobho zokukhetha, ithenjenti nokuhambisa, kopisha, zungeza.** Amakhona e-Pad, e-parcel nomugqa wesici anamabhokisi athayipha e-Easting ne-Northing kanye nenkinobho ethi {{ui:Khetha}} enesibonakude. Izakhiwo futhi zinendawo ethi {{ui:Tangent from two points}} yemizila kanye ne-{{ui:Move, copy and rotate}} yemizila, ama-pad, ama-parcel nemigqa yezici. Bheka [Dweba ngokunamathela, amakhona akhethiwe nokuhambisa, kopisha, zungeza](topic:draft-with-snaps).
- **Ukubuka i-Render ngo-3D.** Inkinobho ethi {{ui:Render}} kwibha ye-3D idweba umhlaba ngemibala yemvelo, isibhakabhaka, umswakama nemithunzi ethambile. Ayishintshi imodeli. Imenyu ethi {{ui:Sun}} manje inezinkinobho ezithi {{ui:Apply}} no-{{ui:Close}}. Bheka [Buka indawo nge-3D](topic:site-3d).
- **Amaphaneli avula isigaba esisodwa ngesikhathi.** Ipaneli yangakwesobunxele neyeZakhiwo zivula isigaba esisodwa zivale ezinye, futhi amathayela eRibhoni yeLandscape anamathuluzi amaningi ayizinkinobho ezihlukene.

### Ukuhlaziya kwe-GIS

- **Hlaziya.** {{ui:Surface}} › {{ui:More}} › {{ui:Analyze}} unikeza ibhafa, ukumboza, ukuhlanganisa kwendawo, ukukhetha ngesici noma ngesimo, nokulinganisa. Ithuluzi ngalinye lenza ungqimba olusha ngesinyathelo esisodwa sokuhlehlisa.
- **Ithebula lezici.** Imenyu yamachashazi amathathu yungqimba ine-{{ui:Attribute table…}} ne-{{ui:Style by attribute…}}. Bheka [Hlaziya izingqimba ze-GIS](topic:gis-analysis) kanye [Sebenza ngethebula lezici lengqimba](topic:gis-table).

### Indawo: ilanga, amandla elanga, induduzo nomoya

- **Isigaba semvelo.** Khetha isisindo: isigaba i-{{ui:Environment}} sisesansi ye-{{ui:Sun hours}} kuZizithakazelo zaso. Sinesifundo sethunzi (imephu, ithebula, ukunyakaza, i-CSV), amandla elanga kusuka efayeleni lesimo sezulu lonyaka ojwayelekile (.epw) nokujabula kwangaphandle (UTCI).
- **Umoya, ukuhlola kuphela.** I-{{ui:Run wind study}} idweba umhlabathi kusukela ekumeni kuya kokungakhululeki ngasinye isiqondiso somoya esifayelini lesimo sezulu. Awuqinisekisiwe futhi ipaneli iyasho lokho.
- **Umoya wabahambi ngezinyawo (i-OpenFOAM) yengezo.** Icishe ivaliwe uze uyivule ku-{{ui:Izilungiselelo}} › {{ui:Okwengeziwe}}. I-OpenFOAM yisofthiwe okufanele uyifake ngokwakho. Bheka [Ithunzi, amandla elanga nokujabula kwangaphandle](topic:environment).

### Amafu amaphoyinti (yengezo)

- Vula {{ui:Amafu amaphoyinti}} ku-{{ui:Izilungiselelo}} › {{ui:Okwengeziwe}}; ithebhu yAmafu amaphoyinti iyavela ephaneli yangakwesokudla. Vula ifayela le-LAS noma le-LAZ, lihlanze, lihlele libe ngumhlabathi, izitshalo nezakhiwo, bese wakha umhlabathi, izingqikithi kanye nama-volumu, bese uthumela njenge-LAS noma i-LAZ. Bheka [Amafu amaphoyinti avela kudrone noma kusikena](topic:point-clouds).

### WaterCraft (yengezo)

- Vula {{ui:WaterCraft (ukusabalalisa kwamanzi)}} ku-{{ui:Izilungiselelo}} › {{ui:Okwengeziwe}}; ithebhu ye-WaterCraft iyavela. Inezidingo zamakhasimende, ukugeleza komlilo kuwo wonke ama-hydrant, ukuthi yiphi ukuphazamiseka kwepayipi eliyinhloko okubaluleke kakhulu, nobudala bamanzi ne-chlorine, ngasinye sigcinwa njenge-CSV. Bheka [WaterCraft: izidingo, ukugeleza komlilo, ukuphazamiseka nobudala bamanzi](topic:watercraft).

### Ukusebenza ndawonye

- Ku-seshini ye-Live ubona amakhesa nemibhalo kabani nomunye endizeni. Izitshalo zelabhulali: i-CivilCraft Landscape iqala kuqoqo layo elizenzakalelayo le-Library, {{ui:CivilCraft landscape}}.

## Kuzo zonke izinhlelo

- Izeluleko zivela njengamathiphu e-Bootstrap, futhi ithiphu yokuqala ingavalwa.
- Ibhendi yamathebhu ephaneli engakwanele iyaskrola esikhundleni sokusikwa.
- Izihloko zamathebhu esiphequluli zifundeka ngokuthi `<document> - CivilCraft | CadCraft`.
- I-{{ui:Settings}} inesigaba seUkwakheka lapho ukwakheka kuwuhlu olwehla lwezinketho ezimbili imigqa.
- Iyunithi zesisindo nokushisa zisezi-{{ui:Settings}} › {{ui:Global}} › {{ui:Units}}.
- Uhlu lwezilimi lubonisa izilimi ibhilidi enamafayela alo. Izilimi ngaphandle kwesiNgisi ziyizinhlaka ezenziwe yimishini.

## Okulungisiwe

- Izengezo zokubheka ikheli kanye nokuhlola kwe-EnergyPlus bezingavulwa; manje ziyavuleka.
- Usizo luthi manje i-engezo yamafu amaphoyinti ibhala ifu elihlanziwe njenge-LAS 1.4 noma i-LAZ.
- Ukuchofoza isigiyo sento ekhethiwe ngokwayo akusaqali ukudonsa isigiyo esimisa iPick elindile.

## Imikhawulo eqinisekile

- Izifanekiso zekhoridoro zesibonelo ziyizindawo ezibambe iqhaza ezingasekelwe kunoma yisiphi isitandade; unjiniyela kumele azihlole. Izifanekiso zomhlaba azengezi ngaphezulu futhi azidwetshwa ku-3D noma endaweni yesigaba. Ikhoridoro lesibili emzileni alifakiwe ku-IFC export. Asikho ukuncipha phakathi kwezifanekiso ezimbili ngesiteshi.
- Amafu amaphoyinti ahlolwe ngamafayela enziwe, hhayi ukuhlola kwangempela kwedrone. Ifunda kuphela i-LAS ne-LAZ.
- Ukuhlaziya kwe-GIS kuhlolwe ngezingqimba ezenziwe.
- Ithunzi, amandla elanga nokujabula kuyizilinganiso zokuhlela; umoya uyisikrini esingaqinisekisiwe. Akukho lutho kwalokhu oluyinani lokwakha.
- I-WaterCraft iyisisekeli sokubala esihlolwe ngamanethiwekhi enziwe. Unjiniyela wamanzi unquma ukuthi izinombolo zinani.
- Izilimi ngaphandle kwesiNgisi ziyizinhlaka ezenziwe yimishini.
- Abafakeli be-Windows abasayiniwe ngekhodi, nesithombe sedisiki se-macOS asiqinisekisiwe.

## Ngaphambili: 0.8 no-0.8.1

Lokhu yikho okushintshile ku-CivilCraft 0.8 (2026-11-01) ne-0.8.1 (2026-11-02), uma kuqhathaniswa ne-0.7. Izingxenye ezinkulu ezintsha yizinto ezihlola ukulinganisa kwakho nendawo yakho (imvula, umsebenzi womhlaba, izindlela, amachibi, inqubekelaphambili) kanye nezizenzo zokubala eziyisithupha zomhlaba, imigwaqo, ukuhlola, izimayini, uxhumo nesitimela.

### Okusha

**Hlola ukulinganisa kwakho**

- **Yenza imvula.** {{ui:Yenza imvula…}} (ngaphansi kwe-{{ui:Surface}}) wehlisa isiphepho emhlabathini olinganisiwe. Ubona amanzi egeleza kumapad, ehlanganisa emakhoneni aphansi, nagcwala emachibini amancane kakhulu. Ukusebenza kuyenziwa kube nesithombe, kunikeze amavolumu, ukukhishwa kwesikhulu kanye ne-CSV yachibi ngalinye. Iseli elizenzakalelayo liyinkulu ukuze ukubuka kokuqala kube sheshi; iseli elingcono liyahamba kancane. Amachibi agcwele aphinde avele kwiphaneli yeZinkinga.
- **Isilinganisi somhlabathi.** {{ui:Isilinganisi somhlabathi…}} siphakamisa noma sehlise i-pad uze ukumba kulingane nokugcwalisa, bese sibonisa ithebula lokuthutha phakathi kwazo.
- **Indlela engcono kakhulu.** {{ui:Indlela engcono kakhulu…}}: khetha isiqalo nokuphela, bese i-CivilCraft ithola indlela eshibhile kakhulu ngaphezulu komhlaba egcina imikhawulo yakho yethambeka nevolumu, bese yenza umzila kuyo.
- **Amachibi okulawula.** {{ui:Amachibi okulawula…}} ibala isigaba nesitoreji kusuka emhlabathini wakho, ithatha amadivayisi okukhipha (orifice, weir, V-notch, spillway), ihambisa isiphepho ngechibi bese ihlola iphakade elibanjiwe, isikhathi sokwehla kwamanzi nokuphakama kwesikhala.
- **Inqubekelaphambili kusuka ezifundweni.** {{ui:Inqubekelaphambili kusuka ekuhloleni…}} iqhathanisa izindawo zedrone noma zokuskena ezivela ezinsukwini ezahlukene nomhlabathi njengoba wawunjalo nanjengoba uklelwe: iphesenti eliqediwe ngevolumu, izindawo ezimbiwe kakhulu nezigcwele kakhulu, izitokhi, nokuthi umsebenzi uzophela nini kulesi sivinini (kumakiwe njengesilinganiso).

**Yazi indawo**

- **Ikheli kuya esizeni.** {{ui:Ikheli kuya esizeni…}} ihlanganisa idatha evulekile yepaseli, yesakhiwo, yokuhlelwa kwezindawo, yenhlabathi, yesikhukhula kanye nomhlaba endaweni eyodwa. Ungayigcina indawo kufayela lephrojekthi: ikheli olibhalile, umthombo ngamunye ngosuku owawutholwe ngalo nelayisensi yawo, nento eyabuyiswa. Vula kabusha noma yabelana ngephrojekthi indawo isengakhona, ingatholwanga futhi. Ungayilondoloza futhi njengefayela lendawo noma uyithumele ku-BimCraft. Bheka [Ikheli kuya esizeni](topic:address-to-site).

**Umhlaba, imigwaqo, ukuhlola, izimayini, uxhumo nesitimela**

- **Izinhlabathi nokuthambeka.** {{ui:Izinhlabathi nokuthambeka…}} idweba iphrofayili yenhlabathi phakathi kwezimbobo ozibhalayo. Indlela kaBishop bese isesha ijikeleze ebucayi emhlabathini wakho, ngomgeqo wamanzi, isisindo esengeziwe nesilinganiso sokunyakaza komhlaba; ukuhla kwesisekelo kuthola ukuhlanganiswa, ukuhla okusheshayo nesikhathi.
- **Izixhumanisi nokumaka.** {{ui:Izixhumanisi nokumaka…}} ihlanganisa imilenze ngamajika omphetho wesikhawu (irediyasi eyodwa ngomlenze, noma amajika amathathu-isikhungo), ububanzi bokubona kwesivinini sokwakha, ukuhlolwa kwezinxantathu zokubona, izindawo zokuwela, imigqa yokuma, imiklomelo nezimpawu ngohlu lwezimpawu. Zidwetshwe kumdwebo bese zigcinwa njenge-.dxf ngezingqimba ezinamagama.
- **Ukulungisa ukuhlola.** {{ui:Ukulungisa ukuhlola…}} yenza ukulungiswa kwe-least-squares kwe-traverse noma unethiwekhi: izixhumanganisi ezilungisiwe, ama-ellipse amaphutha, ukuhlolwa kwe-chi-squared kanye nophawu esilinganisweni esingalingani. Unethiwekhi wamahhala, ukuvala i-traverse ngomthetho wekhampasi kanye ne-RW5, amafayela asensimini ka-GSI, JobXML noma CSV ayafakiwe, namaphoyinti alungisiwe agcinwa njenge-CSV.
- **Imigodi evulekile.** {{ui:Imigodi evulekile…}} iguqula amasampula okubhoboza ibe yimodeli yebhlokhi kanye nomgodi wokugcina ngaphakathi kwe-engeli yethambeka lakho, nesilinganiso sendawo, ithebula ngebhentshi nevini lesilinganiso nethani. Kukhona namagodi ahlukene ngesilinganiso sengeniso kanye nohlelo lokukhiqiza olunentengo esehliswayo.
- **Izixhumi zomsakazo.** {{ui:Izixhumi zomsakazo…}} ihlola umugqa wokubona phezu komhlaba wakho ngokuvuvuka kwebhola lomhlaba, isigaba sokuqala se-Fresnel, isabelomali sokuxhuma, umkhawulo wokufiphala nokuphazamiseka kwe-multipath, bese inikeza ukuphakama kwemasti okuzosula indlela. Yenza futhi nezabelomali zokulahleka kwe-fibre, izinani lemizila nomoya ophezu kwethawa.
- **Izinkinobho zesitimela.** {{ui:Amaswichi omgwaqo wesitimela…}} yenza iswichi ngenombolo yayo ye-frog, ukudlula phakathi kwamadlelo afanayo, nesikali sesakhiwo esithambekile ngenxa ye-cant futhi sandiswe ejikeleni. Iswichi ingahlala esiteshini semzila.

Bheka [Izinhlabathi, izixhumanisi, ukulungiswa kokuhlola, izimayini, izixhumi zomsakazo namaswichi](topic:soils-roads-survey-mines-links).

### Kuzo zonke izinhlelo

- **Izilimi.** Izilimi ezingama-54, eziyishumi zazo zintsha. Izilimi ngaphandle kwesiNgisi ziyizinhlaka ezenziwe yimishini kuze kufundwe umuntu onolimi lwendabuko. Izihloko zosizo zisekhona zingesiNgisi ikakhulu.
- **Imigqa yebha yamathuluzi.** {{ui:Izilungiselelo}} › {{ui:General}} › {{ui:Toolbar rows}}: Wrap (njengangaphambili), imigqa emi-2 noma umugqa oyi-1. I-Ribbon ye-CivilCraft ibonisa ithuluzi elisetshenziswa kakhulu likhulu, elilandelayo lincane, nezinye zisemuva kwe-arrow yegama leqoqo.
- **Amadivayisi okufaka.** I-trackpad, ipeni, imouse ye-3D, isilawuli ne-MIDI zingasebenza izinhlelo.
- **Izinkinga.** Ipaneli yeZinkinga exwayisa kuzo zonke izinhlelo, nokuhlola okufunda amaphakheji emithetho.
- **Live.** Ukubuka ukuthi ubani ukuphi kuseshini ye-Live.
- **Yengezo.** Uhlu lwezengezo, nezengezo zokukhanyisa.
- **Xhuma i-AI yakho.** Noma yisiphi isisizi osixhumayo singashayela amathuluzi e-CivilCraft. Iza nenothi yokuthi ukuxhuma ngokuchofoza kube kodwa ku-CadCraft Studio nexhumanisi elisesiphezulu azilungele okwamanje. Bheka [Vumela isisizi se-AI sisebenze nendawo yakho](topic:assistants).

### Okulungisiwe ku-0.8.1

- **Isigaba sezigaba ze-DWG.** Sasifundwa njengohlobo olungalungile (GitHub cadcraft#5). Kulungisiwe ku-CivilCraft kanye ne-CadCraft, BimCraft, ModelCraft kanye ne-TakeoffCraft.
- **Ukushintsha ulimi kusasebenza.** I-CadCraft Studio nezinhlobo ezipakiwe zingashintsha ulimi ngesikhathi sokusebenza. Kwakuqala kuphela ngesiNgisi. Akukahlolwa kuzo zonke izinkundla: sitshele uma ulimi lungashintshi.

### Akukakufakwa kule nguqulo

- **Lezi yizisizi zokubala.** Yonke imiphumela yezindawo ezintsha idinga ukuhlolwa yinjiniyela. Amandla omhlabathi aqala kumanani ajwayelekile eqoqo lenhlabathi, futhi iwindi liyasho lokho.
- **Yenza imvula.** Ukusebenza esiteshini sesampula kungathatha ngaphezu kwemizuzu emibili ebhrawuzeni ngeseli elicolile. Kuhlolwe ngamacala ngesandla nangokuqoqwa kwamanzi okunesimo se-V, akukahlolwa emhlabathini wangempela owulinganisiwe.
- **Ikheli kuya esizeni.** Ifunda amafayela edatha evulekile oyiletha, futhi ihlolwe kumafayela ethu kuphela. Imithi ayisiyo umthombo. Ukulanda imithombo ngawe kulinda umbhalo wemfihlo.
- **Inqubekelaphambili kusuka ezifundweni.** Ihlolwe ezifundweni ezenziwe kuphela. Inqubekelaphambili kumashidi nakumamaki (MarkupCraft) kanye nokuskena kuqhathaniswa nemodeli (BimCraft) akwakhiwe.
- **Izinhlabathi nokuthambeka.** Izindawo ezijikelezayo kuphela: akukho kusesha kwewedge noma kwebhlokhi futhi akukho ukuqhekeka kokuqina.
- **Izixhumanisi.** Irediyasi eyodwa ngomlenze, akukho ama-swept paths amalori, futhi azikangeni ekhoridorweni okwamanje.
- **Amafayela asensimini.** Abafundi bakhiwe ngezincazelo zefomethi zoluhlobo oluvulekile futhi bahlolwe emafayelini esiwenzile. Kudingeka amafayela angempela ezinsimbi.
- **Izixhumi nesitimela.** Izixhumi zomsakazo: ukulahleka kwesikhala esingenamoya nomnyango wemipathi kuphela (akukho ukungena kwemvula noma amaphethini wenkanyezi), futhi akukho nomgomo wesitimela: lonke umkhawulo wesitimela ibhokisi lokubamba, nezinombolo zokusalungiswa ezingakahlolwa unjiniyela wesitimela.
- **I-Windows ne-macOS.** I-0.8 ayisayinwanga ngekhodi. I-Windows ingasho isexwayiso, futhi i-macOS icela ukuchofoza ngesokudla bese Vula.

Konke okunye kukuhlu [Akukakwakhiwa](topic:not-built-yet). Ukuze uthole inguqulo yangaphambili, bheka [Okusha ku-0.7](topic:whats-new-0-7).
