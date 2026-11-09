---
title: Maxaa cusub 0.8 iyo 0.8.1
summary: CivilCraft 0.8 wuxuu ku daraa Roobka keen (roob ku socda naqshadda dhulka), isku-dheelitiraha dhulka, helitaanka waddada ugu wanaagsan, balliyada ilaalinta, horumarka sahamyada, lataliye ciwaanka-ilaa-goobta oo hayaa goobta mashruuca gudihiisa, iyo daaqadaha ciidda iyo jeexjeexyada, isgoysyada iyo calaamadaynta, hagaajinta sahaminta, godadka furan, xidhiidhada raadiyaha iyo laf-jeexyada tareenka. 0.8.1 wuxuu hagaajinayaa sida loo akhriyo faylalka DWG.
keywords: maxaa cusub, release notes, changelog, isbeddel, 0.8, 0.8.1, nooca, astaamo cusub, roob, duufaan, ponding, overtopping, shaqada dhulka, dheelitir, jar iyo buuxin, waddada ugu wanaagsan, least cost, jid-hagaha, balli ilaalin, outlet, drawdown, freeboard, horumar, sahan, drone, kayd, cinwaanka ilaa goobta, parcel, ciid, daad, xasilloonida jeexjeexyada, bishop, dejin, isgoys, calaamad, aragtida masaafada, hagaajin, least squares, traverse, godad furan, block model, xidhiidh raadiyo, fresnel, laf-jeexyo, crossover, luqadaha, dhibaatooyin, live, dwg
from: b0932cf0
---

Waa waxa isbeddelay CivilCraft 0.8 (2026-11-01) iyo 0.8.1 (2026-11-02), marka la barbar dhigo 0.7. Qaybaha cusub ee waaweyn waa qalabyo tijaabiya naqshaddaada dhulka iyo goobtaada (roob, shaqada dhulka, waddooyin, balliyo, horumar), iyo lix daaqadood oo xisaabeed oo dhulka, waddooyinka, sahanka, macdanta, xiriirrada iyo tareenka ah.

## Cusub

### Tijaabi naqshaddaada dhulka

- **Roob keen.** {{ui:Roobka keen…}} (hoosta {{ui:Dusha}}) wuxuu soo rogaa roobaad dhulka naqshadda ah. Waxaad aragtaa biyaha oo ka socda padyada, ku ururaya burcadaha hoose, iyo balliyada yaryar ee ka dhex furmaya. Socodka waa dhaqdhaqaaq, wuxuuna siinayaa mugyada, cadadka ugu sareeya ee wax soo saarka (peak outflow) iyo CSV ah balli kasta. Unugga caadiga ah waa mid qiiqo ah si nadar hore u dhakhso; unug fiican waa gaabis. Balliyada ka dhex furma waxay sidoo kale ka muuqdaan panelka Dhibaatooyinka.
- **Isku-dheelitiraha dhulka.** {{ui:Isku-dheelitiraha dhulka…}} wuxuu kor ama hoos u qaadaa padka ilaa jarista ay le'eg tahay buuxinta, wuxuuna muujiyaa miiska qaadista ee u dhexeeya.
- **Waddada ugu wanaagsan.** {{ui:Waddada ugu wanaagsan…}}: dooro bilow iyo dhamaad, CivilCraft wuxuu helaa jidka ugu jaban dhulka oo ku xaddidan xadka dhalkaaga iyo qallooca, kadibna wuxuu ka sameeyaa jid-hagaha.
- **Balliyada ilaalinta.** {{ui:Balliyada ilaalinta…}} wuxuu xisaabiyaa heerka iyo kaydka ka dhulka, wuxuu qaataa qalabka dhoofinta (orifice, weir, V-notch, spillway), wuxuu roobka ku socodsiiyaa ballida, wuxuuna hubiyaa wax-ka-hayntii ugu sarreysay, wakhtiga hoos u dhaca iyo freeboard-ka.
- **Horumarka sahamyada.** {{ui:Horumarka sahamyada…}} wuxuu isbarbar dhigaa dusha drone-ka ama scan-ka taariikho kala duwan leh dhulka sida uu ahaa iyo naqshadda: boqolkiiba la dhammeeyay ee mugga, goobaha la qodayo ka badan iyo la buuxiyay ka badan, kaydka, iyo marka shaqadu dhammaanayso xawaaraha hadda (oo lagu calaamadiyay qiyaas).

### Ogow goobta

- **Cinwaanka ilaa goobta.** {{ui:Cinwaanka ka geli goobta…}} wuxuu isku dhigaa xogta furan ee parcel-ka, dhismaha, qeexidda, ciidda, daadka iyo dhulka hal goobta. Goobta waad ku hayn kartaa faylka mashruuca: cinwaanka la qoray, isha kasta oo leh maalinta aad soo qaadatay iyo liisanskeeda, iyo waxa soo laabtay. Mar kale fur ama la wadaag mashruuca goobtuna way jirtaa, mana jirto wax dib loo soo qaadanayo. Waad sidoo kale ku kaydin kartaa sida fayl goob ah ama u diri kartaa BimCraft. Eeg [Cinwaanka ilaa goobta](topic:address-to-site).

### Dhulka, waddooyinka, sahanka, macdanta, xiriirrada iyo tareenka

- **Ciidda iyo jeexjeexyada.** {{ui:Ciidda iyo jeexjeexyada…}} wuxuu sawiraa qaabka ciidda ee u dhexeeya godadka aad qortay. Habka Bishop wuxuu markaa raadiyaa goobta giraanta halista ah dhulkaaga, oo leh miiska biyaha, culeys dheeraad ah iyo heerka dhulgariirka; degidda aasaaska waxay heleysaa adkaynta, degidda isla markiiba iyo wakhtiga.
- **Isgoysyada iyo calaamadaynta.** {{ui:Isgoysyada iyo calaamadaynta…}} wuxuu isku dhigaa cagaha iyo curb returns (hal radius cag kasta, ama curb returns saddex-dhexe), masaafada aragtida xawaaraha naqshadda, hubinta saddexagallada aragtida, dhambaalada socodka, xariiqyada istaag, calaamadaynta iyo calaamadaha oo leh jadwal calaamadeed. Waxay ku sawirmaan qorshaha waxayna u kaydiyaan sida .dxf oo leh layer-yo magacaaban.
- **Hagaajinta sahaminta.** {{ui:Hagaajinta sahaminta…}} wuxuu sameeyaa hagaajin least-squares oo traverse ama shabakad ah: isku-xirka la hagaajiyay, ellipse-yada qaladka, tijaabada chi-squared iyo calaamad ku taal cabbirka aan ku habboonayn. Shabakadaha xor ah, xidhida traverse-ka iyada oo la adeegsanayo xeerka compass iyo RW5, faylal goobeed GSI, JobXML ama CSV way ku jiraan, barooyinka la hagaajiyay waxay ku kaydmaan sida CSV.
- **Godad furan.** {{ui:Godad furan…}} wuxuu beddelaa tusaalaha qodista block model, iyo godka ugu sarreeya ee ku jira xagaaga dhalkaaga, oo leh isbadalka xoogga, miis sida qaybta ka mid ah iyo khad heer iyo tiro. Godad isku dhex jira oo ku saleysan qiimaha dakhliga, iyo jadwal wax soo saar oo leh qiimaha hadda (discounted cash flow) ayaa sidoo kale jira.
- **Xidhiidhada raadiyaha.** {{ui:Xidhiidhada raadiyaha…}} wuxuu hubiyaa aragtida khadka dhulkaaga iyada oo la gelinayo dhamaad-bulaaca dhulka, Fresnel-ka koowaad, miisaanka xidhiidhka, lumitaanka fade-ka iyo multipath-ka, wuxuuna siinayaa dhererka tiirka ku filan si uu jidka u furmo. Waxa kale oo uu sameeyaa miisaanka lumitaanka fibre-ka, tirada xidhiidhka iyo dabaysha tiir.
- **Laf-jeexyada tareenka.** {{ui:Laf-jeexyada tareenka…}} wuxuu sameeyaa laf-jeex xagga frog number-kiisa, crossovers u dhexeeya jidadka isbarbar socda, iyo cabbirka qaabka oo la jiifsaday cant-ka oo la ballaadhiyay qallooc kasta. Laf-jeex wuxuu ku jiri karaa station ka mid ah jid-hagaha.

Eeg [Ciidda, isgoysyada, hagaajinta sahaminta, godadka, xidhiidhada raadiyaha iyo laf-jeexyada](topic:soils-roads-survey-mines-links).

## Dhammaan app-yada

- **Luqadaha.** 54 luqadood, toban ka mid ah cusub. Luqadaha aan Ingiriisi ahayn waa qabyo otomaatig ah ilaa uu afaf-hooyo akhriyo. Mawduucyada caawimaadda badanaa weli Ingiriisi bay yihiin.
- **Safafka qalabka.** {{ui:Dejinta}} › {{ui:Guud}} › {{ui:Safafka qalabka}}: Duubi (sida hore), 2 safaf ama 1 safaf. Ribbon-ka CivilCraft wuxuu muujiyaa qalabka ugu badan la isticmaalo oo weyn, kuwa xiga yar, kuwa kalena waxay ku jiraan xagga fallaadha magaca kooxda.
- **Aaladaha gelinta.** Trackpad, qalin, 3D mouse, kontoroolar iyo MIDI ayaa wax ka qabanaya app-yada.
- **Dhibaatooyin.** Panel Dhibaatooyinka oo digniinaya app kasta, oo leh hubin akhrinaya xirmooyinka xeerarka.
- **Live.** Muuqaal ah cidda meesha ku jirta fadhiga Live.
- **Kordhin.** Liiska kordhinnada, oo ay ku jiraan kordhinnada iftiinka.
- **Ku xidh AI-gaaga.** Caawiye kasta oo aad ku xidhto wuxuu maamuli karaa qalabka CivilCraft. Waxaa lagu daray qoraal ah in hal-guji-xidhidh gudaha CadCraft Studio iyo isku-xidhka martida aanay diyaar ahayn. Eeg [Ka dhig caawiyaha AI inuu goobtaada ka shaqeeyo](topic:assistants).

## Waa la hagaajiyay 0.8.1

- **Qaybta fasalada DWG.** Waxa loo akhriyay nooc qalad ah (GitHub cadcraft#5). Waa la hagaajiyay CivilCraft iyo CadCraft, BimCraft, ModelCraft iyo TakeoffCraft.
- **Beddelka luqadda marka barnaamijku socdo.** CadCraft Studio iyo nooca la xirmay ayaa luqadda beddeli karaa marka ay socdaan. Ka hor waxay ahaayeen Ingiriisi keliya. Weli looma tijaabin dhammaan nidaamyada: noo sheeg haddii luqaddu ka beddelmin.

## Weli kuma jiraan nooca tan

- **Kuwani waa caawimo xisaabeed.** Natiijo kasta oo daaqadaha cusub ah waxay u baahan tahay hubin injineer. Xoogga ciidda waxay ka bilaabaan qiyaasaha caadiga ah ee kooxda ciidda, daaqaddu way sheegtaa.
- **Roob keen.** Socodka goobta tusaalaha wuxuu qaadan karaa in ka badan laba daqiiqo browser-ka unugga qiiqo ah. Waa la isbarbar dhigay kiisaska gacanta iyo catchment qaab V ah, laakiin weli lagama tijaabin goob dhulka laga qabtay oo dhab ah.
- **Cinwaanka ilaa goobta.** Wuxuu akhriyaa faylalka furan ee aad keento, waana la tijaabiyay faylalkeena keliya. Geedaha ma aha isha. Soo qaadista isha kuu ah waxay sugaysaa qoraalka asturnaanta.
- **Horumarka sahamyada.** Waa la tijaabiyay sahamyo la sameeyay oo ah kuwo ma jiraan keliya. Horumarka xaashiyada iyo calaamadaha (MarkupCraft) iyo scan marka la barbar dhigo moodeelka (BimCraft) ma la dhisin.
- **Ciidda iyo jeexjeexyada.** Dusha goobeed ee wareega keliya: ma jiraan dusha xidhan ama habka block iyo waxa aan la xidhin.
- **Isgoysyada.** Hal radius cag kasta, ma jiraan jidka baabuurta weyn ee la wareego, oo ma gelin korridorka weli.
- **Faylalka goobta.** Akhristayaashu waxay ka dhisan yihiin qeexidda bannaan ee qaabka, waana la tijaabiyay faylal aan nala samayn. Faylal qalab dhab ah ayaa la doonayaa.
- **Xidhiidhada iyo laf-jeexyada.** Xidhiidhada raadiyaha: lumitaanka hawada-bannaan iyo multipath keliya (ma jiro roobka fade ama qaabka antenna), iyo ma jiro heer tareen: xadka kasta waa placeholder, lambaro qabyo ah oo injineer tareen ah aanu hubin.
- **Windows iyo macOS.** 0.8 lama saxiixin code-ka. Windows waa suurtagal inay digniiso, macOS wuxuu weydiiyaa inaad midig-guji ka dibna fur.

Wax kale oo dhan waxay ku jiraan [Weli lama dhisin](topic:not-built-yet). Nooca hore, eeg [Maxaa cusub 0.7](topic:whats-new-0-7).
