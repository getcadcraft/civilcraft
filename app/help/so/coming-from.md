---
title: Ka timid software kale oo dhismaha dhulka
summary: Sida nidaamyada naqshadeynta dhismaha dhulka ee caadiga ah ula mid yihiin CivilCraft, iyo kala duwanaanshaha ku dhaca isticmaalayaasha waayo-aragnimada leh saacadda ugu horreysa.
keywords: beddelka, u guurid, caadi, kala duwanaansho, nidaamka shaqada, amarrada, khariidad, cogo, corridor, simaynta dhulka, pipe network, qaababka, command line
from: feae37d6
---

Haddii aad isticmaashay Civil 3D, waad ogtahay fikradaha CivilCraft: dhibcaha iyo kooxyada dhibcaha, dusha TIN oo leh xariiqyada jebinta iyo xuduudaha, jid-hagayaasha PI-yada, muuqaalka dherer ee PVI-yada, assemblies oo lagu kala saaray corridor-ka, simaynta dhulka ilaa daylight, shabakadda tuubooyinka xagga-dhaqaajinta, LandXML. Waxa kala duwan waa intii ku wareegsan oo dhan: ma jiro faylka naqshadda, ma jiro sadar amar (marka aadan dooran qaabka menu-ga {{ui:Drafting classic}}), ma jiro qaababka, ma jiro Prospector, iyo ma jiro daaqadaha dejinta. CivilCraft waa qalab yar oo xoog leh oo ku jira brawsar, oo nooca hadda uu sameeyo qayb yar oo ka mid ah wixii shaqada dhismaha dhulka buuxa sameeyaa. Bogaggan wuxuu ku qabanqaabinayaa waxa aad og tahay meesha uu ku yaal halkan.

:::tip
Haddii aad jeceshahay ribbon-ka Civil 3D, dooro qaabka menu-ga {{ui:Civil ribbon}} ee {{ui:Settings}} › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}: tabs-ka Home, Surfaces, Modify, Geolocation, View iyo Output, badhanka dhexe wuu dul marayaa, {{key:Shift}} oo leh badhanka dhexe wuu wareegaa muuqaalka 3D. Haddii aad qorto amarro, {{ui:Drafting classic}} wuxuu ku daraa command line (ALIGNMENT, PAD, PROFILE, ZOOM …). Eeg [Menyuyaasha, furayaasha iyo mouse-ka](topic:menus-keys-and-mouse).
:::

## Khariidadda shaqada

| Waxa aad rabto inaad samayso | Habka caadiga ah | CivilCraft |
|---|---|---|
| Soo geli dhibcaha sahanka | Soo geli dhibcaha qaab fayl dhibic | {{ui:Open}}, ka dib hubi tirtirka tiirarka **Import points** ([Soo geli dhibcaha sahanka](topic:import-points)) |
| Kala saar dhibcaha | Kooxyada dhibcaha, furayaasha sharaxaadda | Kooxyo toos ah oo ku salaysan ereyga koowaad ee sharaxaadda; ma jiraan furayaal sharaxaad |
| Tafatir dhibic | Tafatiraha dhibcaha, gacmo-qabasho | Guji oo ku qor Properties, ama jiid ([Tafatir dhibic sahan](topic:edit-points)) |
| Dhis dhulka jira | Samee dusha, ku dar kooxyada dhibcaha xog ahaan | Toos: dusha waa dib loo dhisayaa marka aan gelinta isbeddelo |
| Ku dar xariiqyada jebinta | Ku dar xariiqyada jebinta polylines ama feature lines ka | Dejin kooxda dhibcaha {{ui:Breakline}}, ama guji dhibcaha qalabka {{ui:Breakline}} ({{key:B}}) |
| Jar dusha | Xadka dibadda, xadka qarsan, dherer saddex-geesle oo ugu weyn | {{ui:Boundary}} ({{key:O}}, dibadda keliya) iyo **Longest outside edge** |
| Muuji xariiqyada heerka | Qaabka dusha | **Display** ee dhinaca bidix: waqtiga u dhexeeya, major every, labels, bands, falaadhaha jiifka |
| Qorso xariiqa dhexe | Qalabka abuurista jid-hagaha, dejinta wareega iyo spiraalka | {{ui:Alignment}} ({{key:A}}): guji PI-yada, {{key:Enter}}; radius-ka iyo dherarka spiraalka miiska PI |
| Samee muuqaal dherer | Wizard-ka muuqaalka dherer, bands | {{ui:Profile}} ({{key:R}}): hal muuqaal dherer oo ka hooseeya qorshaha, had iyo jeer la habeeyay |
| Naqshadee heerka | Qalabka qorshaha heerka | {{ui:Start from the ground}}, {{ui:Add PVIs}} ({{key:I}}), jiid PVI-yada, qor **Curve L** |
| Dhis waddo | Assembly, subassemblies, corridor, targets, regions | Calaamadi **Sweep an assembly along the design profile** hoosta jid-hagaha; xariiq, garbaha iyo jiif kasta dhinac, ama dhinac kasta oo laga dhisay qaybo (gutter, curb, sidewalk …) |
| Simaynta pad | Feature lines, kooxaha simaynta, shuruudaha simaynta | {{ui:Pad}} ({{key:G}}): pad fidsan oo leh jiifka goynta iyo buuxinta ilaa daylight |
| Xisaabi shaqada dhulka | Volume surfaces, dashboard-ka mugga | **Earthwork** dhinaca midig, habka grid, wuu cusboonaadaa isla markiiba |
| Qorso storm ama sanitary | Shabakadda tuubada oo leh liis qaybaha, xeerarka | {{ui:Pipes}} ({{key:P}}): guji qaab-dhismeedyada downstream; saddex xeerar oo aad dejiso; inverts-ka otomaatig |
| Is-weydaarso xogta kale | LandXML soo geli iyo dhoofin | {{ui:Open}} faylka LandXML; {{ui:LandXML}} si aad u dhoofiso ([Is-weydaarso LandXML](topic:landxml)) |
| Dir xariiqyada CAD | Dhoofin DWG | {{ui:DWG}} (qaabka 2000 ilaa 2018) ama {{ui:DXF}} (R12) |
| Daabac | Layouts, viewports, sheet sets | {{ui:PDF}}: hal xaashi oo dhererka qorshaha ah oo miisaan la doortay; qorshaha iyo goynta xaashiyada PDF ahaan |
| Wadaag shaqada faylalka kale | Data shortcuts, references | Ma jirto: hal mashruuc hal fayl |
| Ka noqo | Undo | {{key:Mod+Z}} iyo {{key:Mod+Y}}, 200 tallaabo; dejinta bandhigga ma aha tallaabo ka noqo |

## Kala duwanaanshaha dadka ku dhacaya

**Ma jiro command line** marka aadan dooran qaabka menu-ga {{ui:Drafting classic}}. Qalabyadu waa badhamo toolbar iyo xarfo keliya: {{key:A}} jid-hagaha, {{key:G}} pad, {{key:P}} tuubooyin, {{key:B}} xariiqa jebinta, {{key:O}} xadka, {{key:R}} muuqaal dherer, {{key:I}} ku dar PVI, {{key:V}} dooro, {{key:F}} fit. Qaabka menu-ga kale, qorista magaca amarka waxba ma samayso. Eeg [Furayaasha iyo mouse-ka](topic:keyboard).

**Enter wuu dhammaysiiyaa; laba jeer guji waa khatar.** Guji dhibicda ugu dambeysa hal mar, ka dibna riix {{key:Enter}}. Daabacaadan laba jeer guji ayaa sidoo kale dhammaysta, laakiin wuxuu tirtiraa dhibicda aad laba jeer gujisay. Guji midig ma dhammaysto ama ma ku celinayo, waxay kaliya dul mariyaa marka aad jiidayso.

**Waxa oo dhan waa firfircoon, mar walba.** Beddel kooxda dhibcaha, radius, PVI ama jiifka pad, dusha, contours, corridor, daylight lines iyo mugyadu isla markiiba way cusboonaadaan. Ma jiro wax dib loo dhisaa, ma jirto wax duugoobay.

**Waxba ma aha shay naqshad.** Qorshuhu waa muuqaal naqshadeyn, ma aha naqshad aad ku tafatiri karto amarrada CAD. Ma ku dari kartid xariiq ama qoraal, ma beddeli kartid midabka lakabka, ma jebin kartid wax. Dhoofi DXF oo dhammaystir naqshada barnaamij CAD ah.

**Ma jiro qaababka.** Midabyada, khadadka culeyska, cabbirrada labels-ka iyo magacyada lakabyada waa go'an yihiin (eeg [Lakabyada qorshaha](topic:plan-layers)). Paper iyo Model ee app bar-ka waxay u beddelaan shaashad iftiin ah iyo mid mugdi ah.

**Mid kasta hal.** Hal dusha dhulka jira, hal natiijo simayn, hal shabakad tuubooyin mashruuc kasta. Jid-hagayaal iyo pad badan waa wanaagsan yihiin.

**Unit-yadu waa calaamado.** Dooranaya {{ui:US feet}} ama {{ui:Metres}} ma beddelo wax. Ma jiro miisaan naqshad. Nidaamka isku-xirka waa ikhtiyaari: deji hoosta {{ui:Coordinates}} oo waxba ma dhaqdhaqaaqo, kaliya wuxuu sheegaa macnaha lambarrada (eeg [Dejinta nidaamka isku-xirka mashruuca](topic:coordinate-systems)). Feet waxaa loo tixgeliyaa feet sahan US ah markii lagu qorayo LandXML.

**Kooxaha xariiqa jebinta waxay ku biiraan tirada dhibicda.** Kooxda loo dejiyay {{ui:Breakline}} waxay noqotaa hal xariiq oo dhan dhibcahooda, tirada ay leeyihiin. Koodyo wadaag ah (laba xariiq socod oo labaduba la yiraahdo "FL") waxay sameeyaan hal xariiq zig-zag; kuwaas gacanta ku sawir.

**Stations-ku waa isku mid, mitirku waa kala duwan.** Feet waxay isticmaalaan stations 100 ft ah (12+34.56); mitirka waxay isticmaalaan stations 1000 m ah (1+234.567).

**Tirtirka Mac-ka.** Furaha Mac-ka oo lagu sheegay delete waa Backspace brawsarka. Isticmaal Fn iyo delete, ama badhanka {{ui:Delete}}, si aad u tirtirto wax la doortay.

**Faylashu waa soo dejin.** {{ui:Save}} wuxuu soo dejiyaa fayl `.civilcraft.json` mar kasta; ma jiro "kaydi ku qor faylka furan". Nuqul soo kabasho oo shaqada aan la kaydin ayaa lagu kaydiyaa brawsarkan ([Soo kabso shaqada aan la kaydin](common:recover)). Furidda faylka dhibcaha waxay beddeshaa dhibcaha adigoon la weydiinin. Eeg [Faylalka aad furi, kaydi iyo dhoofin karto](topic:files).

**Xeerarku waa kaaga.** Xeerarka shabakadda tuubooyinka iyo assembly-ga corridor-ka waxay ku bilaabmaan qiyam placeholder ah oo aan caadi ahayn. Dejiso kuwaaga ka hor intaadan isku halayn hubin kasta.

**Mugyadu waxay ku saleysan yihiin grid-ka.** Goynta iyo buuxinta waxay ka imanayaan grid nadiif ah oo u dhexeeya labada dusha, gudaha xariiqyada daylight, iyada oo aan swell ama shrink jirin. Waxay u dhow yihiin laakiin ma aha isku mid TIN-to-TIN.

## Waxa ka maqan

Spiraalyo aan clothoid ahayn, assemblies oo isbeddelaya jidka dhexdiisa, pad-yada jiifka, awoodda sooca iyo kaydinta, catalogs-ka qaybaha, tuubooyinka muuqaalka dherer, naqshadaha qeybta dhulka iyo cabbirka lot, isku-dheelitirka least-squares iyo kaydka sahanka, furidda DWG, iyo wax kale oo badan. Liiska dhamaystiran, iyo waxa loo baahan yahay maanta, waa [Weli ma la dhisin](topic:not-built-yet).
