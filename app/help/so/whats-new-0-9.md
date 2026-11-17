---
title: Waxa cusub ee 0.9
summary: Qaababka kooridorka iyo dhulka, snaps iyo badhamada Dooro markii la sawirayo, falanqaynta GIS oo leh miis sifooyin, daraasadda hooska, awoodda qorraxda, raaxada iyo dabaysha goobta, aragga 3D ee Render, iyo kordhinnada Point clouds iyo WaterCraft.
keywords: waxa cusub, 0.9, qoraallada sii deynta, qaababka kooridorka, qaababka dhulka, tifaftiraha qaababka, qaabka qaybta, kooridorro badan, snap, snaps, dooro, guuri, koobiyee, leexi, tangent, render, 3d render, falanqaynta gis, buffer, overlay, spatial join, miiska sifooyinka, qaab sifada ku salaysan, daraasadda hooska, solar yield, utci, raaxada dibada, daraasadda dabaysha, openfoam, point clouds, las, laz, watercraft, socodka dab damin, hiidrant, da' biyaha, kloorin, baahiyo, tooltips, layout, waxa cusub, what's new, sii deynta, isbedel, 0.8, 0.8.1, nooca, astaamaha cusub, roobka, duufaanta, ponding, overtopping, earthwork, balance, goyn iyo buuxin, haul, jidka ugu wanaagsan, least cost, alignment, balliga ilaalinta, outlet, drawdown, freeboard, progress, survey, drone, stockpile, cinwaanka goobta, parcel, ciid, daad, slope stability, bishop, settlement, junction, striping, calaamadaha, sight distance, adjustment, least squares, traverse, open pit, block model, radio link, fresnel, turnout, crossover, luuqadaha, dhibaatooyin, live, dwg
from: d7ac5b14
---

Waa wax ka beddelay CivilCraft 0.9, marka la barbar dhigo 0.8.1. CivilCraft 0.9 waa qayb ka mid ah CadCraft Studio 0.9 iyo sideeda barnaamij. Qaybaha waaweyn waa qaababka kooridorka iyo dhulka, snaps markii la sawirayo, falanqaynta GIS, daraasadaha hooska, awoodda qorraxda, raaxada iyo dabaysha goobta, iyo laba kordhin: Point clouds iyo WaterCraft.

## Cusub

### Qaababka kooridorka iyo dhulka

- **Qaababka kooridorka.** Fur {{ui:Dusha}} › {{ui:Wax dheeraad ah}} › {{ui:Qaababka kooridorka…}} (ama ku qor {{cmd:TEMPLATES}}). Qaabku waa qaybta yar oo leh qaybaha, masaafooyinka, sinaha, alaabta iyo koodhadhka dhibcaha. Kaydi mashruuca, {{ui:Maktabaddayda}} ama fayl `.cctemplates.json`. Tifaftiraha qaababka wuxuu muujiyaa sawir dhabta ah oo cabbirka sax ah, wuxuuna liistaa dhibaatooyinka intaad qorayso.
- **Ka dhis qaababka ilaa isteeshanka.** Dooro alignment oo shid {{ui:Ka dhis qaababka isteeshanka}} Properties-kiisa. Dhinac kasta oo gobol kasta wuxuu leeyahay liiskiisa dhulka iyo dhamaadkiisa. {{ui:Ku dar kooridor}} hoos {{ui:Kooridorada khadkan}} wuxuu dhigaa kooridorro badan hal alignment.
- **Qaababka dhulka.** {{ui:Dusha}} › {{ui:Wax dheeraad ah}} › {{ui:Qaababka dhulka…}} (ama ku qor {{cmd:TERRAINTEMPLATES}}) wuxuu dhulka saaraa lakabyo alaab sida dhulka sare ama dhulka aasaaska, iyo dhulka ku wareegsan, oo leh aag iyo mug lakabkiiba. Eeg [Qaababka kooridorka iyo qaababka dhulka](topic:corridor-templates).

### Naqshadaynta

- **Snaps.** Qalabyada Alignment, Pad, Parcel, Mass, Feature line, Measure, Boundary iyo Catchment waxay ku dhejiyaan dhibcaha sahanka, PI-yada, geesaha, dhibcaha iyo dhismayaasha, oo calaamad magac ah ayaa ku taal calaamadda. Hay {{key:Alt}} si aad u hesho dhibac xor ah.
- **Badhamada Dooro, tangent iyo guuri, koobiyee, leexi.** Geesaha pad, parcel iyo feature-line waxay leeyihiin sanduuqyo Easting iyo Northing oo la qoro iyo badhanka Dooro ee calaamadda gaadhiga. Properties waxa kale oo ku jira {{ui:Tangent laba barood ah}} alignments-ka iyo {{ui:Guuri, koobiyee iyo leexi}} alignments-ka, pad-ka, parcel-ka iyo feature-line-ka. Eeg [Naqshadee snaps, geesaha la doortay iyo guuri, koobiyee, leexi](topic:draft-with-snaps).
- **Aragga Render ee 3D.** Badhanka {{ui:Render}} ee bar-ka 3D wuxuu sawiraa dhulka midabbada dabiiciga ah, cirka, ciyaarta iyo hooska jilicsan. Ma beddelo moodelka. Menu-ga {{ui:Qorraxda}} hadda leeyahay badhamada {{ui:Codso}} iyo {{ui:Xir}}. Eeg [Eeg goobta 3D](topic:site-3d).
- **Panelyada waxay furmaan mid mid.** Panelka bidixda iyo panelka Properties waxay furaan hal qayb oo waxay xiraan kuwa kale; tiles-ka Landscape ribbon ee leh qalab badan waa badhamo kala-qaybsan.

### Falanqaynta GIS

- **Falanqee.** {{ui:Dusha}} › {{ui:Wax dheeraad ah}} › {{ui:Falanqee}} wuxuu bixiyaa buffer, overlay, spatial join, dooro sifo ama qaab, iyo cabbir. Qalab kasta wuxuu sameeyaa lakab cusub hal tallaabo oo ka noqo.
- **Miiska sifooyinka.** Menu-ga saddex-dhibcood ee lakab kasta wuxuu leeyahay {{ui:Miiska sifooyinka…}} iyo {{ui:Qaab sifada ku salaysan…}}. Eeg [Falanqee lakabyada GIS](topic:gis-analysis) iyo [Ka shaqee miiska sifooyinka lakabka](topic:gis-table).

### Goobta: qorraxda, awoodda, raaxada iyo dabaysha

- **Qaybta deegaanka.** Dooro tiro: qaybta {{ui:Deegaanka}} waxay ku taal hoosta {{ui:Saacadaha qorraxda}} Properties-kiisa. Waxay leedahay daraasad hooska (meel, miis, muuqaal xarakeeysan, CSV), awoodda qorraxda oo laga helo faylka cimilada sannad dhexe (.epw) iyo raaxada dibada (UTCI).
- **Dabaysha, waa xaqiijin keliya.** {{ui:Samee daraasadda dabaysha}} wuxuu ku midabeeyaa dhulka laga bilaabo fadhiga ilaa aan raaxo lahayn, jiho kasta oo dabaysha ah oo ku jirta faylka cimilada. Lama xaqiijin, guddigu wuu sheegaa taas.
- **Kordhinta dabaysha dadka lugta ku socda (OpenFOAM).** Ma shaqeyso ilaa aad ku shido {{ui:Dejinta}} › {{ui:Kordhinno}}. OpenFOAM waa software aad rakibto adigu. Eeg [Hooska, awoodda qorraxda iyo raaxada dibada](topic:environment).

### Kordhinta Point clouds

- Ku shid {{ui:Point clouds}} {{ui:Dejinta}} › {{ui:Kordhinno}}; tab Point clouds ayaa ka soo muuqanaysa panelka midig. Fur fayl LAS ama LAZ, nadiifi, u kala-saar dhulka, geedaha iyo dhismayaasha, dhis dhulka, kontuurrada iyo mugga, oo dhoofi LAS ama LAZ. Eeg [Point clouds oo ka yimid drone ama scanner](topic:point-clouds).

### Kordhinta WaterCraft

- Ku shid {{ui:WaterCraft (qaybinta biyaha)}} {{ui:Dejinta}} › {{ui:Kordhinno}}; tab WaterCraft ayaa soo muuqanaysa. Waxay leedahay baahiyada macaamiisha, socodka dab damin ee hiidrant kasta, joojinta tuubada ugu muhiimsan, iyo da' biyaha iyo kloorinka, mid kastaa wuxuu kaydinta CSV. Eeg [WaterCraft: baahiyo, socodka dab damin, joojinta iyo da' biyaha](topic:watercraft).

### Wada-shaqaynta

- Live session-ka waxaad aragtaa kursoorada iyo magacyada kuwa kale qorshaha. Geedaha maktabadda: CivilCraft Landscape wuxuu ka bilaabaa Maktabadda caadiga ah, {{ui:CivilCraft landscape}}.

## Dhammaan barnaamijyada

- Qarashyada waxay muuqdaan sida qalabka Bootstrap tooltips, qarashka bilowga ayaa la xiri karaa.
- Safka tabyada panelka oo aan ku habboonayn wuxuu u dhaqaaqaa halkii uu ka jari lahaa.
- Cinwaanka tabyada browser-ka wuxuu akhrinayaa `<dokumenti> - CivilCraft | CadCraft`.
- {{ui:Dejinta}} waxay leedahay qayb Layout ah, halka qaababka ay yihiin liis hoos-u-dhac oo sharraxaad laba-sadar ah.
- Unugyada miisaanka iyo heerkulka waxay ku yaalliin {{ui:Dejinta}} › {{ui:Caalami}} › {{ui:Unugyada}}.
- Liiska luuqadaha wuxuu muujiyaa luuqadaha uu dhismuhu leeyahay faylalkooda. Luuqadaha aan Ingiriisi ahayn waa qabyo aan ka muuqan.

## Waa la hagaajiyay

- Kordhinnada raadinta cinwaanka iyo EnergyPlus ma furmi jireen; hadda way furmaan.
- Caawinta waxay hadda sheegaysaa in kordhinta Point clouds ay qoraysa dhibaato nadiifsan oo LAS 1.4 ama LAZ.
- Riixidda gacmaha dhibcaha la doortay ma bilaabi jirtay jiid gacmo oo joojiyay doorasho sugaysa; hadda ma sameyso.

## Xuduudaha sheegan

- Qaababka kooridorka tusaalaha ah waa meelo-hayn aan ka soo jeedin caadi, injineer ayaa hubin laga rabaa. Qaababka dhulka ma ku daraan dusha, mana lagu sawirin 3D ama aragga qaybta. Kooridorka labaad ee alignment-ka ma ku jiro IFC-ga la dhoofiyo. Ma jiro qaab-yaraynta u dhexeysa laba qaab oo isteeshan ahaan.
- Point clouds waxay ku tijaabisay faylal aan dhab ahayn, ma aha sahan drone dhab ah. Waxaa la akhriyaa LAS iyo LAZ oo keliya.
- Falanqaynta GIS waxay ku tijaabisay lakabyo aan dhab ahayn.
- Hooska, awoodda qorraxda iyo raaxada waa qiyaasaad qorshe; dabaysha waa xaqiijin aan la hubin. Midkoodna ma aha qiime naqshadeed.
- WaterCraft waa qalab xisaab caawiye oo lagu hubiyey shabakado aan dhab ahayn. Injineerka biyaha ayaa go'aaya qiimaha tirooyinka.
- Luuqadaha ka baxsan Ingiriisiga waa qabyo ay sameeyeen mashiinnada.
- Rakibayaasha Windows lama saxiixin koodka, sawirka diskka macOS-na lama xaqiijin.

## Hore: 0.8 iyo 0.8.1

Waa wax ka beddelay CivilCraft 0.8 (2026-11-01) iyo 0.8.1 (2026-11-02), marka la barbar dhigo 0.7. Qaybaha cusub ee ugu waaweyn waa qalabyo tijaabiya simaynta iyo goobta (roobka, shaqada dhulka, jidadka, balliyada, socodka), iyo lix daaqadood oo xisaab ah oo loo isticmaalo dhulka, waddooyinka, sahanka, macdanta, xidhiidhka iyo jidka tareenka.

### Cusub

**Tijaabi simaynta**

- **Roob keen.** {{ui:Roobka keen…}} (hoos {{ui:Dusha}}) wuxuu dhulka la simeeyey ku hoos keenaa duufaan. Waxaad arkaysaa sida biyuhu uga socdaan duubista, ku-taagan ay ku taagan yihiin xagasha hoose, iyo balliyada yaryar ee ay ka wada-socdaan. Socodka waa ay xarakeeysan tahay waxayna siinaysaa mugga, socodka ugu sarreeya iyo CSV ee balliyada oo dhan. Unugga caadiga ah wuu weyn yahay si baaritaan degdeg ah loo sameeyo; unug la fiican wuu gaabiyaa. Balliyada ka wada-socda waxay sidoo kale ku muuqdaan Dhibaatooyinka panelka.
- **Qalabka goyn iyo buuxin.** {{ui:Qalabka goyn iyo buuxin…}} wuxuu kor u qaadaa ama hoos u dhigaa duubis ilaa goynta ay u egtahay buuxinta, wuxuuna muujiyaa miiska gaadiidka u dhexeeya.
- **Jidka ugu wanaagsan.** {{ui:Jidka ugu wanaagsan…}}: dooro bilowga iyo dhamaadka, CivilCraft wuxuu helaa jidka ugu jaban ee dhulka dhexdiisa oo ilaaliya xadadka sinaha iyo jeexa, kadibna wuxuu sameeyaa alignment ka soo baxday.
- **Balliyada ilaalinta.** {{ui:Balliyada ilaalinta…}} wuxuu xisaabiyaa heerka iyo kaydka dhulkaaga, wuxuu qaataa qalabka dhoofinta (orifice, weir, V-notch, spillway), wuxuu ku maraa duufaanta balliga, wuxuuna hubiyaa xaddiga ilaashan, wakhtiga hoos-u-dhaca iyo freeboard.
- **Socodka laga bilaabo sahamyada.** {{ui:Socodka laga bilaabo sahamyada…}} wuxuu isbarbar dhigaa dusha drone-ka ama scan-ka laga soo qaatay taariikhyo kala duwan, dhulka sida ay ahayd iyo naqshadda: boqolkiiba la dhammeeyey mugga, aagagga la qodayo iyo la buuxiyo, kaydka dhulka, iyo goorta shaqadu dhammaanaysa xawaaraha hadda (oo lagu calaamadiyey qiyaas).

**Ogow goobta**

- **Cinwaanka goobta.** {{ui:Cinwaanka ka geli goobta…}} wuxuu isku dhigaa xogta parcel-ka furan, dhismaha, xadka magaalada, ciidda, daadka iyo dhulka hal goob. Goobta waad ku kaydin kartaa faylka mashruuca: cinwaanka qoran, isha kasta oo maalinta aad soo qaadatay iyo ruqsadeeda, iyo waxa soo baxay. Mar kale fur ama wadaag mashruuca oo goobtu way jirtaa, iyagoon mar kale wax la soo qaadan. Waxaad sidoo kale ku kaydin kartaa faylka goob ama u dir BimCraft. Eeg [Cinwaanka ka geli goobta](topic:address-to-site).

**Dhulka, waddooyinka, sahanka, macdanta, xidhiidhka iyo tareenka**

- **Ciidda iyo jeexjeexyada.** {{ui:Ciidda iyo jeexjeexyada…}} wuxuu sawiraa qaabka ciidda ee u dhexeeya godadka aad ku qortay. Habka Bishop wuxuu raadiyaa goobta khatarta ah ee dhulkaaga, oo leh miiska biyaha, culeyska dheeraadka ah iyo tirada dhulgariirka; hoos-u-dhaca aasaaska wuxuu leeyahay isku-dhufashada, hoos-u-dhaca degdegga ah iyo waqtiga.
- **Isgoysyada iyo calaamadaynta.** {{ui:Isgoysyada iyo calaamadaynta…}} wuxuu isku geeyaa xarriiqyada curb-yada soo-noqoshada (hal radius halkii xariiq, ama soo-noqosho saddex-dhexe), masaafada aragga xawaaraha naqshadda, hubinta saddexagalada aragga, meelaha la gudbo, xariiqyada istaska iyo calaamadaha iyo jadwal calaamadeed. Waxay ku sawirmaan qorshaha oo waxaa lagu kaydiyaa .dxf oo leh lakabyo magac leh.
- **Hagaajinta sahanka.** {{ui:Hagaajinta sahaminta…}} wuxuu sameeyaa hagaajin ugu yar-yar-quaad oo traverse ama shabakad ah: isku-xidhka la hagaajiyey, ellipses-ka khaladka, tijaabada chi-squared iyo calaamad ku taal cabbir aan ku habboonayn. Shabakadaha xor ah, xidhida traverse-ka habka compass rule iyo RW5, iyo faylalka goobta GSI, JobXML ama CSV way ku jiraan, dhibcaha la hagaajiyey waxay u kaydsan yihiin CSV.
- **Godadka furan.** {{ui:Godad furan…}} wuxuu beddelaa tijaabooyinka drill-ka block model ah iyo godka ugu dambeeya ee gaarka ah ee ku jira xagashaada jiifka, oo leh cabbirka xagashan, miis bench kasta iyo khadka heerka iyo tiro. Godadka nested ee lagu saleeyey qiimaha dakhliga iyo qorshaha wax-soo-saarka ee lacagta la dhimay ayaa sidoo kale jira.
- **Xidhiidhada raadiyaha.** {{ui:Xidhiidhada raadiyaha…}} wuxuu hubiyaa aragga khadka dhulkaaga oo leh qalloocinta dhulka, Fresnel-ka koowaad, miisaaniyadda xidhiidhka, dhimista fading iyo jabka multipath, wuxuuna siinayaa dhererka tiirka oo baabi'in kara jidka. Wuxuu sidoo kale sameeyaa miisaaniyadda lumista fiber, tirada jidka iyo dabaysha tiirka.
- **Jidka tareenka.** {{ui:Jidka tareenka…}} wuxuu sameeyaa turnout ka lambarkeeda frog, crossover-yada u dhexeeya jidad isbarbar socda, iyo heerka qaab-dhismeed oo la leexiyey cant-ka oo ballaadhiya curve-ka. Turnout-ku wuu ku taagan karaa isteeshan ka mid ah alignment-ka. Eeg [Ciidda, isgoysyada, hagaajinta sahanka, godadka, xidhiidhada raadiyaha iyo jidadka](topic:soils-roads-survey-mines-links).

### Kuwa kale oo dhan

- **Luuqadaha.** 54 luuqadood, toban ka mid ah cusub. Luuqadaha aan Ingiriisi ahayn waa qabyo ay sameeyeen mashiinnada ilaa uu af-hooyo akhriyo. Mawduucyada caawinta waxay weli inta badan ku qoran yihiin Ingiriisi.
- **Safafka qalabka.** {{ui:Dejinta}} › {{ui:Guud}} › {{ui:Safafka qalabka}}: Wrap (sida hore), 2 safaf ama 1 safaf. Ribbon-ka CivilCraft wuxuu muujiyaa qalabka ugu badan la isticmaalo oo weyn, kuwa xiga yar, kuwa kale waxay ku jiraan gadaasha falaxda magaca kooxda.
- **Qalabka gelinta.** Trackpad, qalin, mouse 3D, controller iyo MIDI ayaa wax u qaban kara barnaamijyada.
- **Dhibaatooyin.** Panel Dhibaatooyin oo digniin ka bixiya barnaamij kasta, oo leh hubinno akhrinaya xeerarka nidaamka.
- **Live.** Aragga qofka meesha uu joogo session-ka Live.
- **Kordhinno.** Liis kordhinno, oo ay ku jiraan kordhinno iftiin ah.
- **Ku xidh AI-gaaga.** Caawiyaha aad ku xidho wuxuu wadi karaa qalabka CivilCraft. Waxaa lagu daray qoraal sheegaya in ku xidhidhka hal-tallaabo ee CadCraft Studio iyo xidhiidhka martida aan weli diyaar ahayn. Eeg [Ka dhig caawiye AI inuu kaa shaqeeyo goobtaada](topic:assistants).

### La hagaajiyay 0.8.1

- **Qaybta classes-ka DWG.** Waxaa la akhriyay nooc qaldan (GitHub cadcraft#5). Waa la hagaajiyay CivilCraft iyo CadCraft, BimCraft, ModelCraft iyo TakeoffCraft.
- **Beddelka luuqadda intuu socdo.** CadCraft Studio iyo tifaftiraha lagu xidhay waxay beddeli karaan luuqadda marka ay socdaan. Ka hor waxay ahaayeen Ingiriisi oo keliya. Weli lama tijaabin dhammaan madbacadaha: noo sheeg haddii luuqaddu beddelmin.

### Weli ma jiro nooca hadda

- **Kuwani waa qalab xisaab caawiye.** Natiija kasta oo daaqadaha cusub ah waxay u baahan tahay hubin injineer. Xoogga ciidda wuxuu ka bilaabmaa qiyaasaha caadiga ah ee kooxda ciidda, daaqaddu way sheegtaa taas.
- **Roob keen.** Hal socod goobta tusaalaha ah wuxuu qaadan karaa in ka badan laba daqiiqo browser-ka marka unuggu yahay mid fiican. Waxaa lagu hubiyey kiisas gacmeed iyo cuntada V-shaped, weli ma lagu hubin dhulka dhab ah ee la simeeyey.
- **Cinwaanka goobta.** Waxay akhrisaa faylalka furan ee aad keento, waxaana lagu tijaabiyey faylalkeenna keliya. Geedaha ma aha isha. Soo qaadista ilaha adiga kuu waa sugaysa hadalka qarsoodiga.
- **Progress from surveys.** Waxaa lagu tijaabiyey sahamyo aan dhab ahayn oo keliya. Horumarka xaashiyada iyo calaamadaha (MarkupCraft) iyo isbarbar dhigidda moodelka (BimCraft) lama dhisin.
- **Soils and slopes.** Dusha goobaha keliya: ma jiro raadinta wedge ama block iyo ma jiro jeex xanuun.
- **Junctions.** Hal radius halkii xariiq, ma jiro jidka baabuurta weyn, oo weli ma gelin kooridorka.
- **Field files.** Akhristayaashu waxaa lagu qoray qeexitaanno qaab oo furan, waxaana lagu tijaabiyey faylal aan samaynay. Faylal qalab dhab ah ayaa loo baahan yahay.
- **Links and rail.** Radio links: waxaa jira oo keliya lumitaanka meel bannaan iyo multipath (ma jiro dhimista roobka ama qaabka antenna), iyo ma jiro heer tareen: xadad kasta waa meelo-hayn, oo leh tirooyin qabyo ah oo aan injineer tareen hubin.
- **Windows iyo macOS.** 0.8 lama saxiixin koodka. Windows way digi karta, macOS waxay weydiisaa midig-riix ka dibna Fur.

Waxa kale oo dhan waxaa ku jira [Wali lama dhisin](topic:not-built-yet). Nooca hore, eeg [Waxa cusub ee 0.7](topic:whats-new-0-7).
