---
title: Çfarë ka të re në 0.9 (më herët)
summary: Shabllonet e koridorit dhe të terrenit, kapjet dhe butonat e zgjedhjes gjatë hartimit, analiza GIS me tabelë atributesh, studime hije, prodhim diellor, komfort dhe erë për një vend, një pamje Render 3D, dhe shtojcat Retë e pikave dhe WaterCraft.
keywords: çfarë ka të re 0.9, version më i hershëm, çfarë ka të re, 0.9, shënime versioni, shabllonet e koridorit, shabllonet e terrenit, redaktori i shabllonit, prerje tipike, disa koridore, kapje, kapjet, zgjedh, zhvendos, kopjo, rrotullo, tangjente, render, render 3d, analiza gis, buffer, mbivendosje, bashkim hapësinor, tabela e atributeve, stilo sipas atributit, studim hije, prodhim diellor, utci, komfort i jashtëm, studim ere, openfoam, retë e pikave, las, laz, watercraft, rrjedha për zjarrin, hidrant, mosha e ujit, klori, kërkesat, paraqitja, ndryshime, 0.8, 0.8.1, version, veçori të reja, shi, stuhi, ngopje, vëllime, ekuilibër, prerje dhe mbushje, transport, rruga më e mirë, kosto më e ulët, aks rrugor, pellg retensioni, dalje, zbritje, lirë, progres, matje, dron, grumbull, adresë në vend, parcelë, tokë, përmbytje, stabiliteti i pjerrësisë, bishop, zbritje, kryqëzim, shënjim, distanca e shikimit, rregullim, katrorët më të vegjël, traversë, minierë me hapje, lidhje radio, fresnel, devijim hekurudhor, kalim, gjuhët, probleme, live, dwg
from: 4664522c
---

Kjo është ajo që ndryshoi në CivilCraft 0.9, krahasuar me 0.8.1. CivilCraft 0.9 është pjesë e CadCraft Studio 0.9 dhe tetë aplikacioneve të tij. Pjesët kryesore janë shabllonet e koridorit dhe të terrenit, kapjet gjatë vizatimit, analiza GIS, studimet e diellit, prodhimit diellor, komfortit dhe erës së një vendi, dhe dy shtojca: Retë e pikave dhe WaterCraft.

## E re

### Shabllonet e koridorit dhe të terrenit

- **Shabllonet e koridorit.** Hap {{ui:Sipërfaqe}} › {{ui:Më shumë}} › {{ui:Shabllonet e koridorit…}} (ose shkruaj {{cmd:TEMPLATES}}). Një shabllon është një prerje e vogël tërthore me përbërës, zhvendosje, pjerrësi, materiale dhe kode pikash. Mbaji në projekt, në {{ui:Biblioteka ime}} ose si skedar `.cctemplates.json`. Redaktori i shabllonit shfaq një vizatim në shkallë reale dhe liston problemet ndërsa shkruan.
- **Ndërtimi nga shabllonet sipas stacionit.** Përzgjidh një aks rrugor dhe ndiz {{ui:Ndërto nga shabllonet sipas stacionit}} te Vetitë e tij. Çdo anë e çdo zone ka listën e vet të asfaltit dhe kushtin e vet të fundit. {{ui:Shto një koridor}} nën {{ui:Koridoret në këtë aks rrugor}} vendos disa koridore në një aks rrugor.
- **Shabllonet e terrenit.** {{ui:Sipërfaqe}} › {{ui:Më shumë}} › {{ui:Shabllonet e terrenit…}} (ose shkruaj {{cmd:TERRAINTEMPLATES}}) vendos materiale me shtresa si dheu sipërfaqësor ose asfalti dhe baza mbi një terren, me sipërfaqe dhe vëllim për çdo shtresë. Shih [Shabllonet e koridorit dhe të terrenit](topic:corridor-templates).

### Hartimi

- **Kapjet.** Veglat Aksi rrugor, Platforma, Parcela, Masa, Vija karakteristike, Matja, Kufiri dhe Zona e grumbullimit kapen te pikat e matjes, PI, këndet, kulmet dhe strukturat, me një etiketë pranë shenjës. Mbaj {{key:Alt}} për një pikë të lirë.
- **Butonat e zgjedhjes, tangjenta dhe zhvendos, kopjo, rrotullo.** Këndet e platformës, parcelës dhe vijës karakteristike kanë kutitë e shkruara Lindja dhe Veriu dhe një buton Zgjidh me kryq. Vetitë kanë gjithashtu {{ui:Tangjente nga dy pika}} për aksët rrugorë dhe {{ui:Zhvendos, kopjo dhe rrotullo}} për aksët, platformat, parcelat dhe vijat karakteristike. Shih [Harto me kapje, kënde të zgjedhura dhe zhvendos, kopjo, rrotullo](topic:draft-with-snaps).
- **Pamja Render në 3D.** Butoni {{ui:Renderim}} te shiriti 3D vizaton tokën me ngjyra natyrale, qiell, mjegull dhe hije të buta. Nuk e ndryshon modelin. Menuja {{ui:Dielli}} ka tani butonat {{ui:Apliko}} dhe {{ui:Mbyll}}. Shih [Shiko vendin në 3D](topic:site-3d).
- **Panelet hapen një seksion në çdo herë.** Paneli i majtë dhe paneli i Vetive hapin një seksion dhe i mbyllin të tjerët, dhe pllakat e shiritit të Peizazhit që mbajnë disa vegla janë butona të ndarë.

### Analiza GIS

- **Analizo.** {{ui:Sipërfaqe}} › {{ui:Më shumë}} › {{ui:Analizo}} ofron buffer, mbivendosje, bashkim hapësinor, përzgjedhje sipas atributit ose formës, dhe matje. Çdo vegël krijon një shtresë të re në një hap zhbërjeje.
- **Tabela e atributeve.** Menuja me tre pika e një shtrese ka {{ui:Tabela e atributeve…}} dhe {{ui:Stilo sipas atributit…}}. Shih [Analizo shtresat GIS](topic:gis-analysis) dhe [Puno me tabelën e atributeve të një shtrese](topic:gis-table).

### Vendi: dielli, prodhimi diellor, komforti dhe era

- **Seksioni i mjedisit.** Përzgjidh një masë: seksioni {{ui:Mjedisi}} ndodhet nën {{ui:Orët e diellit}} te Vetitë e saj. Ka një studim hijeje (hartë, tabelë, animacion, CSV), prodhim diellor nga një skedar moti i një viti tipik (.epw) dhe komfort të jashtëm (UTCI).
- **Era, vetëm për shqyrtim paraprak.** {{ui:Ekzekuto studimin e erës}} ngjyros tokën nga e ulur deri në të pakëndshme për çdo drejtim ere në skedarin e motit. Nuk është e vlerësuar dhe paneli e thotë këtë.
- **Shtojca e erës për këmbësorët (OpenFOAM).** E fikur derisa e ndez në {{ui:Cilësimet}} › {{ui:Shtojcat}}. OpenFOAM është program që instalon vetë. Shih [Hija, prodhimi diellor dhe komforti i jashtëm](topic:environment).

### Retë e pikave (shtojcë)

- Ndiz {{ui:Retë e pikave}} në {{ui:Cilësimet}} › {{ui:Shtojcat}}; në panelin e djathtë shfaqet një skedë Retë e pikave. Hap një skedar LAS ose LAZ, pastroje, rendite në tokë, bimësi dhe ndërtesa, ndërto tokën, kurbat e nivelit dhe vëllimet, dhe eksporto LAS ose LAZ. Shih [Retë e pikave nga një dron ose skaner](topic:point-clouds).

### WaterCraft (shtojcë)

- Ndiz {{ui:WaterCraft (shpërndarja e ujit)}} në {{ui:Cilësimet}} › {{ui:Shtojcat}}; shfaqet një skedë WaterCraft. Ka kërkesa nga klientët, rrjedhën për zjarrin te çdo hidrant, cila ndërprerje tubi ka më shumë rëndësi, dhe moshën e ujit dhe klorin, secili i ruajtur si CSV. Shih [WaterCraft: kërkesat, rrjedha për zjarrin, ndërprerjet dhe mosha e ujit](topic:watercraft).

### Puna bashkë

- Në një sesion Live shihni kursorët dhe emrat e njëri-tjetrit në plan. Bimët e bibliotekës: CivilCraft Peizazhi nis nga koleksioni i tij i parazgjedhur i Bibliotekës, {{ui:CivilCraft peizazh}}.

## Në çdo aplikacion

- Ndihmësit shfaqen si tooltip-e Bootstrap, dhe këshilla e fillimit mund të mbyllet.
- Shiriti i skedave të një paneli që nuk futet lëviz në vend që të pritet.
- Titujt e skedave të shfletuesit lexojnë `<dokument> - CivilCraft | CadCraft`.
- {{ui:Cilësimet}} ka një seksion Paraqitjeje ku paraqitjet janë një listë me zgjedhje me dy rreshta.
- Njësitë e peshës dhe të temperaturës janë te {{ui:Cilësimet}} › {{ui:Globale}} › {{ui:Njësitë}}.
- Lista e gjuhëve tregon gjuhët për të cilat ka skedarë ky build. Gjuhët e tjera nga anglishtja janë draft të përkthyer me makinë.

## Të rregulluara

- Shtojcat e kërkimit të adresës dhe të kontrollit EnergyPlus nuk mund të ndizeshin; tani mund.
- Ndihma tani thotë se shtojca Retë e pikave shkruan një re të pastruar si LAS 1.4 ose LAZ.
- Klikimi te doreza e vetë objektit të përzgjedhur nuk nis më një zvarritje dorezash që ndalonte një zgjedhje në pritje.

## Kufijtë e vërtetë

- Shabllonet shembull të koridorit janë vend-mbajtës pa standard; një inxhinier duhet t'i kontrollojë. Shabllonet e terrenit nuk shtojnë sipërfaqe dhe nuk vizatohen në 3D ose në pamjen e prerjes. Koridori i dytë në një aks rrugor nuk është në eksportin IFC. Nuk ka konicitet midis dy shabllonesh sipas stacionit.
- Retë e pikave u testuan me skedarë të trilluar, jo me një matje të vërtetë me dron. Lexohen vetëm LAS dhe LAZ.
- Analiza GIS u testua me shtresa të trilluara.
- Hija, prodhimi diellor dhe komforti janë vlerësime planifikimi; era është shqyrtim paraprak i pavlerësuar. Asnjë nga këto nuk është vlerë projektimi.
- WaterCraft është një mjet llogaritjeje i kontrolluar në rrjete të trilluara. Një inxhinier uji vendos sa vlejnë shifrat.
- Gjuhët përtej anglishtes janë draft të përkthyer me makinë.
- Instaluesit për Windows nuk janë të nënshkruar me kod, dhe imazhi i diskut për macOS nuk është noterizuar.

## Më herët: 0.8 dhe 0.8.1

Kjo është ajo që ndryshoi në CivilCraft 0.8 (2026-11-01) dhe 0.8.1 (2026-11-02), krahasuar me 0.7. Pjesët kryesore të reja janë vegla që testojnë nivelimin dhe vendin tuaj (shi, punë me tokë, rrugë, pellgje, progres) dhe gjashtë dritare llogaritjeje për tokën, rrugët, matjet, minierat, lidhjet dhe hekurudhën.

### E re

**Testo nivelimin**

- **Bëje të bjerë shi.** {{ui:Bëje të bjerë shi…}} (nën {{ui:Sipërfaqe}}) lëshon një stuhi mbi tokën e niveluar. Shikon ujin që rrjedh nga platformat, mblidhet në pellgje në këndet e ulëta dhe tejmbush pellgjet që janë shumë të vogla. Ekzekutimi është i animuar dhe jep vëllimet, rrjedhjen maksimale dhe një CSV për çdo pellg. Qeliza e parazgjedhur është e trashë, kështu një shikim i parë është i shpejtë; një qelizë më e imët është më e ngadaltë. Pellgjet që tejmbushen shfaqen edhe në panelin e Problemeve.
- **Balancuesi i punës me tokë.** {{ui:Balancuesi i dherave…}} ngre ose ul një platformë derisa hapja të barazohet me mbushjen, dhe tregon tabelën e transportit ndërmjet tyre.
- **Rruga më e mirë.** {{ui:Rruga më e mirë…}}: zgjidh një fillim dhe një fund, dhe CivilCraft gjen rrugën më të lirë përmes terrenit që mbetet brenda kufijve të pjerrësisë dhe kthesës, pastaj bën një aks rrugor prej saj.
- **Pellgje retensioni.** {{ui:Liqene retensioni…}} llogarit nivelin dhe ruajtjen nga terreni yt, merr pajisje daljeje (orific, pragu, V-prerje, shkarkues), e drejton një stuhi përmes pellgut dhe kontrollon pikën e mbajtur, kohën e uljes dhe bordin e lirë.
- **Progresi nga matjet.** {{ui:Progresi nga matjet…}} krahason sipërfaqet e dronit ose skanimit nga data të ndryshme me terrenin siç ishte dhe me projektin: përqindja e përfunduar sipas vëllimit, zonat e gërmuara dhe të mbushura tepër, grumbujt e materialit, dhe kur përfundon puna me këtë ritëm (e shënuar si vlerësim).

**Njihe vendin**

- **Adresa te vendi.** {{ui:Adresa te vendi…}} vendos në një vend të vetëm të dhënat e hapura të parcelave, ndërtesave, zonimit, tokës, përmbytjes dhe terrenit. Vendin mund ta mbash në skedarin e projektit: adresën e shkruar, çdo burim me ditën kur e more dhe licencën e tij, dhe çfarë u kthye. Rihap ose ndaj projektin dhe vendi është ende aty, pa marrë asgjë sërish. Mund ta ruash edhe si skedar vendi ose ta dërgosh te BimCraft. Shih [Adresa te vendi](topic:address-to-site).

**Toka, rrugët, matjet, minierat, lidhjet dhe hekurudha**

- **Tokat dhe pjerrësitë.** {{ui:Tokat dhe pjerrësitë…}} vizaton profilin e tokës midis shpimeve që shkruan. Metoda e Bishop-it kërkon pastaj rrethin kritik në terrenin tënd, me nivelin e ujit nëntokësor, një ngarkesë shtesë dhe një koeficient tërmeti; zbritja e një themeli merr konsolidimin, zbritjen e menjëhershme dhe kohën.
- **Kryqëzimet dhe shënjimi.** {{ui:Kryqëzimet dhe shënjimi…}} vendos krahët së bashku me kthime bordure (një rreze për krah, ose kthime me tre qendra), distancën e shikimit për shpejtësinë e projektit, një kontroll të trekëndëshave të shikimit, kalimet e këmbësorëve, vijat e ndalimit, shenjat rrugore dhe tabelën e shenjave. Vizatohen në plan dhe ruhen si .dxf me shtresa të emërtuara.
- **Rregullimi i matjeve.** {{ui:Rregullimi i rilevimit…}} kryen një rregullim me katrorët më të vegjël të një traverse ose rrjeti: koordinatat e rregulluara, elipsat e gabimit, testi chi-katror dhe një shenjë te matja që nuk përshtatet. Përfshihen rrjetet e lira, mbyllja e një traverse me rregullin e busullës dhe skedarët e fushës RW5, GSI, JobXML ose CSV, dhe pikat e rregulluara ruhen si CSV.
- **Gropat e hapura.** {{ui:Gropat e hapura…}} i kthen mostrat e shpimit në një model blloku dhe gropën përfundimtare brenda këndit tënd të pjerrësisë, me raportin e shiritit, një tabelë sipas gradinës dhe një kurbë të nivelit dhe tonazhit. Gropat e fole sipas faktorit të të ardhurave dhe një orar prodhimi me rrjedhë parash të zbritur janë gjithashtu aty.
- **Lidhjet radio.** {{ui:Lidhjet radio…}} kontrollon shikimin e drejtpërdrejtë mbi terrenin tënd me përkuljen e tokës, zonën e parë Fresnel, buxhetin e lidhjes, margjinën e zbehjes dhe ndërprerjen me shumë rrugë, dhe jep lartësinë e shtyllës që do ta pastronte shtegun. Bën gjithashtu buxhetet e humbjes së fibrës, sasitë e rrugës dhe erën mbi një kullë.
- **Ndarjet e hekurudhës.** {{ui:Ndarjet e hekurudhës…}} bën një devijim nga numri i tij i kryqëzimit, kalimet midis shinave paralele dhe një kalibër strukture të pjerrët nga ngritja dhe i zgjeruar në kthesë. Një devijim mund të vendoset në një stacion të një aksi rrugor.

Shih [Tokat, kryqëzimet, rregullimi i matjeve, gropat, lidhjet radio dhe devijimet](topic:soils-roads-survey-mines-links).

### Në çdo aplikacion

- **Gjuhët.** 54 gjuhë, dhjetë prej tyre të reja. Gjuhët e tjera nga anglishtja janë draft me makinë derisa t'i lexojë një folës amtar. Temat e ndihmës janë ende kryesisht në anglisht.
- **Rreshtat e shiritit të veglave.** {{ui:Cilësimet}} › {{ui:Të përgjithshme}} › {{ui:Rreshtat e shiritit të veglave}}: Mbështjell (si më parë), 2 rreshta ose 1 rresht. Shiriti i CivilCraft tregon veglën më të përdorur të madhe, pastaj ato të tjerat të vogla, dhe pjesën tjetër pas shigjetës së emrit të grupit.
- **Pajisjet hyrëse.** Trackpad-i, stilolapsi, miu 3D, kontrolluesi dhe MIDI mund të drejtojnë aplikacionet.
- **Problemet.** Një panel Problemesh që paralajmëron në çdo aplikacion, me kontrolle që lexojnë paketat e rregulloreve.
- **Live.** Një pamje e kujt është ku në një sesion Live.
- **Shtojcat.** Një listë shtojcash, me shtojca ndriçimi.
- **Lidh AI-në tënde.** Çdo asistent që lidh mund të drejtojë veglat e CivilCraft. Vjen me një shënim që lidhja me një klik brenda CadCraft Studio dhe lidhësi i hostuar nuk janë ende gati. Shih [Lëre një asistent AI të punojë me vendin tënd](topic:assistants).

### Të rregulluara në 0.8.1

- **Seksioni i klasave DWG.** Lexohej si lloj i gabuar (GitHub cadcraft#5). U rregullua në CivilCraft bashkë me CadCraft, BimCraft, ModelCraft dhe TakeoffCraft.
- **Ndryshimi i gjuhës gjatë punës.** CadCraft Studio dhe edicionet e paketuara mund të ndryshojnë gjuhën gjatë ekzekutimit. Më parë ishin vetëm në anglisht. Nuk është testuar ende në çdo platformë: na thuaj nëse gjuha nuk ndryshon.

### Nuk është në këtë version ende

- **Këto janë mjete llogaritjeje.** Çdo rezultat në dritaret e reja ka nevojë për kontrollin e një inxhinieri. Forcat e tokës fillojnë nga vlera tipike për grupin e tokës, dhe dritarja e thotë këtë.
- **Bëje të bjerë shi.** Një ekzekutim në vendin shembull mund të zgjasë mbi dy minuta në shfletues me një qelizë të imët. U kontrollua me raste me dorë dhe një zonë grumbullimi në formë V, jo ende në një vend të vërtetë të niveluar.
- **Adresa te vendi.** Lexon skedarë të hapur të dhënash që sjell, dhe u testua vetëm në skedarët tanë. Pemët nuk janë burim. Marrja e burimeve për ty pret tekstin e privatësisë.
- **Progresi nga matjet.** Testuar vetëm në matje të trilluara. Progresi në fletë dhe shënime (MarkupCraft) dhe skanimi kundrejt modelit (BimCraft) nuk janë ndërtuar.
- **Tokat dhe pjerrësitë.** Vetëm sipërfaqe rrethore: pa kërkim me pykë ose blloqe dhe pa çarje tensioni.
- **Kryqëzimet.** Një rreze për krah, pa shtigje rrotullimi të kamionëve, dhe nuk hyjnë ende në koridor.
- **Skedarët e fushës.** Lexuesit u shkruan nga përshkrimet publike të formatit dhe u provuan në skedarë që bëmë vetë. Kërkohen skedarë të vërtetë instrumentesh.
- **Lidhjet dhe hekurudha.** Lidhjet radio: vetëm humbja në hapësirë të lirë dhe shumë-rrugëshe (pa zbehje nga shiu ose modele antenash), dhe pa standard hekurudhor: çdo kufi hekurudhor është vend-mbajtës, me shifra drafti që asnjë inxhinier hekurudhor nuk i ka kontrolluar.
- **Windows dhe macOS.** 0.8 nuk është i nënshkruar me kod. Windows mund të paralajmërojë, dhe macOS kërkon klik me butonin e djathtë e pastaj Hap.

Gjithçka tjetër është në [Ende nuk është ndërtuar](topic:not-built-yet). Për versionin e mëparshëm, shih [Çfarë ka të re në 0.7](topic:whats-new-0-7).
