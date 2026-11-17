---
title: Çfarë ka të re në 0.9
summary: Shabllone koridoresh dhe terreni, kapje dhe butona Zgjedh gjatë vizatimit, analizë GIS me tabelë atributesh, studime hije, prodhimi diellor, komforti dhe era për një vend, një pamje Render 3D, dhe shtojcat Point clouds dhe WaterCraft.
keywords: çfarë ka të re, 0.9, shënime publikimi, shabllone koridori, shabllone terreni, redaktuesi i shablloneve, prerje tipike, disa koridore, kapje, kapje, zgjedh, lëviz, kopjo, rrotullo, tangjente, render, render 3d, analizë gis, buffer, mbivendosje, bashkim hapësinor, tabela e atributeve, stilo sipas atributit, studim hije, prodhim diellor, utci, komfort i jashtëm, studim ere, openfoam, retë e pikave, las, laz, watercraft, rrjedha për zjarrin, hidrant, mosha e ujit, klori, kërkesat, udhëzime, paraqitja, çfarë ka të re, regjistri i ndryshimeve, ndryshime, 0.8, 0.8.1, version, veçori të reja, shi, stuhi, grumbullim uji, punime dheu, balancim, prerje dhe mbushje, transport, rruga më e mirë, kosto më e ulët, aks rrugor, liqen retensioni, dalje, ulje, bordi i lirë, përparimi, rilevim, dron, grumbull materiali, adresa në vend, parcelë, tokë, përmbytje, qëndrueshmëria e pjerrësisë, bishop, shpërndarje, kryqëzim, shënjim, tabela, distanca e shikimit, rregullim, katrorët më të vegjël, poligonal, gropë e hapur, model blloku, lidhje radio, fresnel, ndarje hekurudhe, kryqëzim binarësh, gjuhët, problemet, live, dwg
from: d7ac5b14
---

Kjo është ajo që ndryshoi në CivilCraft 0.9, krahasuar me 0.8.1. CivilCraft 0.9 është pjesë e CadCraft Studio 0.9 dhe tetë aplikacioneve të tij. Pjesët kryesore janë shablloni të koridoreve dhe të terrenit, kapjet gjatë vizatimit, analiza GIS, studimet e diellit, prodhimit diellor, komfortit dhe erës për një vend, dhe dy shtojca: Point clouds dhe WaterCraft.

## Të reja

### Shabllonet e koridorit dhe të terrenit

- **Shabllonet e koridorit.** Hap {{ui:Sipërfaqe}} › {{ui:Më shumë}} › {{ui:Shabllonet e koridorit…}} (ose shkruaj {{cmd:TEMPLATES}}). Një shablon është një prerje e vogël tërthore me komponentë, devijime, pjerrësi, materiale dhe kode pikash. Mbaji në projekt, te {{ui:Biblioteka ime}} ose si skedar `.cctemplates.json`. Redaktuesi i shablloneve shfaq një vizatim në përmasa reale dhe liston problemet ndërsa shkruan.
- **Ndërto nga shabllonet sipas stacionit.** Zgjidh një aks rrugor dhe ndiz {{ui:Ndërto nga shabllonet sipas stacionit}} te Vetitë e tij. Çdo anë e çdo rajoni ka listën e vet të shtresës së rrugës dhe kushtin e vet të fundit. {{ui:Shto një koridor}} nën {{ui:Koridoret në këtë aks rrugor}} vendos disa koridore në një aks rrugor.
- **Shabllonet e terrenit.** {{ui:Sipërfaqe}} › {{ui:Më shumë}} › {{ui:Shabllonet e terrenit…}} (ose shkruaj {{cmd:TERRAINTEMPLATES}}) shtrin materiale shtresore, si dheu i sipërm ose shtrimi dhe baza, mbi një terren, me sipërfaqe dhe vëllim për çdo shtresë. Shih [Shabllonet e koridorit dhe shabllonet e terrenit](topic:corridor-templates).

### Vizatimi

- **Kapje.** Veglat Aks rrugor, Platformë, Parcelë, Masë, Vijë karakteristike, Mas, Kufi dhe Zona e grumbullimit kapen te pikat e rilevimit, PI-të, qoshet, kulmet dhe strukturat, me një etiketë pranë shenjuesit. Mbaj {{key:Alt}} për një pikë të lirë.
- **Butonat Zgjedh, tangjente dhe lëviz, kopjo, rrotullo.** Qoshet e platformës, të parcelës dhe të vijës karakteristike kanë kutitë e shkruara të Lindjes dhe Veriut dhe një buton Zgjedh me kryq. Vetitë kanë gjithashtu {{ui:Tangjente nga dy pika}} për aks rrugorët dhe {{ui:Zhvendos, kopjo dhe rrotullo}} për aks rrugorët, platformat, parcelat dhe vijat karakteristike. Shih [Vizato me kapje, qoshe të zgjedhura dhe zhvendos, kopjo, rrotullo](topic:draft-with-snaps).
- **Pamja e render-it në 3D.** Butoni {{ui:Renderim}} në shiritin 3D vizaton tokën me ngjyra natyrale, qiellin, mjegullën dhe hijet e butë. Nuk e ndryshon modelin. Menuja {{ui:Dielli}} ka tani butonat {{ui:Apliko}} dhe {{ui:Mbyll}}. Shih [Shiko vendin në 3D](topic:site-3d).
- **Panelet hapen një seksion në një herë.** Paneli i majtë dhe paneli i Vetive hapin një seksion dhe mbyllin të tjerët, dhe pllakat e shiritit të Peizazhit që mbajnë disa vegla janë butona të ndarë.

### Analiza GIS

- **Analizo.** {{ui:Sipërfaqe}} › {{ui:Më shumë}} › {{ui:Analizo}} ofron buffer, mbivendosje, bashkim hapësinor, zgjedhje sipas atributit ose formës, dhe matje. Çdo vegël krijon një shtresë të re në një hap zhbërjeje.
- **Tabela e atributeve.** Menuja me tre pika e një shtrese ka {{ui:Tabela e atributeve…}} dhe {{ui:Stilo sipas atributit…}}. Shih [Analizo shtresat GIS](topic:gis-analysis) dhe [Puno me tabelën e atributeve të një shtrese](topic:gis-table).

### Vendi: dielli, prodhimi diellor, komforti dhe era

- **Seksioni i mjedisit.** Zgjidh një masë: seksioni {{ui:Mjedisi}} shfaqet nën {{ui:Orët e diellit}} te Vetitë e saj. Ka një studim hije (hartë, tabelë, animacion, CSV), prodhim diellor nga një skedar moti i një viti tipik (.epw) dhe komfort të jashtëm (UTCI).
- **Era, vetëm për shqyrtim.** {{ui:Ekzekuto studimin e erës}} ngjyros tokën nga të qëndruarit deri te të pakëndshmit për çdo drejtim ere në skedarin e motit. Nuk është e vërtetuar dhe paneli e thotë këtë.
- **Shtojca e erës së këmbësorëve (OpenFOAM).** E fikur derisa ta ndezësh te {{ui:Cilësimet}} › {{ui:Shtojcat}}. OpenFOAM është program që instalon vetë. Shih [Hija, prodhimi diellor dhe komforti i jashtëm](topic:environment).

### Point clouds (shtojcë)

- Ndiz {{ui:Point clouds}} te {{ui:Cilësimet}} › {{ui:Shtojcat}}; shfaqet një skedë Point clouds në panelin e djathtë. Hap një skedar LAS ose LAZ, pastroje, rendite në tokë, bimësi dhe ndërtesa, ndërto tokën, izoipsët dhe vëllimet, dhe eksporto LAS ose LAZ. Shih [Retë e pikave nga një dron ose skaner](topic:point-clouds).

### WaterCraft (shtojcë)

- Ndiz {{ui:WaterCraft (shpërndarja e ujit)}} te {{ui:Cilësimet}} › {{ui:Shtojcat}}; shfaqet një skedë WaterCraft. Ka kërkesa nga klientët, rrjedhën e zjarrit te çdo hidrant, cila ndërprerje tubi ka më shumë rëndësi, dhe moshën e ujit dhe klorin, secila e ruajtur si CSV. Shih [WaterCraft: kërkesat, rrjedha për zjarrin, ndërprerjet dhe mosha e ujit](topic:watercraft).

### Puna së bashku

- Në një sesion Live shihni kursorët dhe emrat e njëri-tjetrit në plan. Pikat e bimëve të bibliotekës: CivilCraft Landscape fillon nga koleksioni i tij i parazgjedhur i Bibliotekës, {{ui:CivilCraft landscape}}.

## Në çdo aplikacion

- Udhëzimet shfaqen si të Bootstrap, dhe udhëzimi i nisjes mund të mbyllet.
- Shiriti i skedave të një paneli që nuk futet rrokulliset në vend që të pritet.
- Titujt e skedave të shfletuesit lexojnë `<dokument> - CivilCraft | CadCraft`.
- {{ui:Cilësimet}} ka një seksion Paraqitjeje ku paraqitjet janë një listë e hapshme me zgjedhje me dy rreshta.
- Njësitë e peshës dhe të temperaturës janë te {{ui:Cilësimet}} › {{ui:Globale}} › {{ui:Njësitë}}.
- Lista e gjuhëve tregon gjuhët për të cilat ka skedarë ndërtimi. Gjuhët e tjera nga anglishtja janë draft të bëra me makinë.

## Të rregulluara

- Shtojcat e kërkimit të adresës dhe të EnergyPlus nuk mund të ndiheshin; tani mund.
- Ndihma thotë tani që shtojca Point clouds shkruan një re të pastruar si LAS 1.4 ose LAZ.
- Klikimi mbi kapësen e vetë objektit të zgjedhur nuk nis më një tërheqje kapëse që ndalonte një Zgjedhje në pritje.

## Kufijtë e ndershëm

- Shabllonet e shembullit të koridorit janë vende mbajtëse pa standard; një inxhinier duhet t'i kontrollojë. Shabllonet e terrenit nuk shtojnë asnjë sipërfaqe dhe nuk vizatohen në 3D ose në pamjen e prerjes. Koridori i dytë në një aks rrugor nuk është në eksportin IFC. Nuk ka ngushtim midis dy shablloneve sipas stacionit.
- Re pikash u testuan me skedarë të trilluar, jo me një rilevim të vërtetë me dron. Lexohen vetëm LAS dhe LAZ.
- Analiza GIS u testua me shtresa të trilluara.
- Hija, prodhimi diellor dhe komforti janë vlerësime planifikimi; era është shqyrtim i pavërtetuar. Asnjë nga këto nuk është vlerë projektimi.
- WaterCraft është një mjet llogaritjeje i kontrolluar mbi rrjete të trilluara. Një inxhinier uji vendos se çfarë vlejnë numrat.
- Gjuhët përtej anglishtes janë draft të bëra me makinë derisa një folës amtare t'i lexojë.
- Instaluesit e Windows nuk kanë nënshkrim kodi, dhe imazhi i diskut të macOS nuk është noterizuar.

## Më herët: 0.8 dhe 0.8.1

Kjo është ajo që ndryshoi në CivilCraft 0.8 (2026-11-01) dhe 0.8.1 (2026-11-02), krahasuar me 0.7. Pjesët e reja kryesore janë vegla që testojnë nivelimin dhe vendin (shi, punime dheu, rrugë, liqene, progres), dhe gjashtë dritare llogaritjeje për tokën, rrugët, rilevimin, minierat, lidhjet dhe hekurudhën.

### Të reja

**Testo nivelimin tënd**

- **Bëje të bjerë shi.** {{ui:Bëje të bjerë shi…}} (nën {{ui:Sipërfaqe}}) lëshon një stuhi mbi tokën e nivelluar. Sheh ujin që rrjedh nga platformat, grumbullohet në cepat e ulëta dhe vershon liqet që janë shumë të vegjël. Ekzekutimi animohet dhe jep vëllimet, rrjedhën maksimale dalëse dhe një CSV të çdo liqeni. Qeliza e parazgjedhur është e trashë, kështu që një shikim i parë është i shpejtë; një qelizë më e imët është më e ngadaltë. Liqet që vershojnë shfaqen edhe në panelin e Problemeve.
- **Balancuesi i dherave.** {{ui:Balancuesi i dherave…}} ngre ose ul një platformë deri sa prerja të barazohet me mbushjen, dhe shfaq tabelën e transportit midis tyre.
- **Rruga më e mirë.** {{ui:Rruga më e mirë…}}: zgjidh një fillim dhe një fund, dhe CivilCraft gjen shtegun më të lirë nëpër terren që mbahet brenda kufijve të pjerrësisë dhe të kurbës, pastaj krijon një aks rrugor nga ai.
- **Liqene retensioni.** {{ui:Liqene retensioni…}} llogarit nivelin dhe ruajtjen nga toka jote, merr pajisje daljeje (vrimë, pragje, V-shkurtim, derdhje), kalon një stuhi nëpër liqen dhe kontrollon rrjedhën maksimale të mbajtur, kohën e uljes dhe bordin e lirë.
- **Përparimi nga rilevimet.** {{ui:Përparimi nga rilevimet…}} krahason sipërfaqet e dronit ose skanerit nga data të ndryshme me tokën siç ishte dhe me projektin: përqindjen e përfunduar sipas vëllimit, zonat e gërmuara tepër dhe të mbushura tepër, grumbuj materiali, dhe kur do të përfundojë puna me këtë ritëm (e shënuar si vlerësim).

**Njih vendin**

- **Adresa në vend.** {{ui:Adresa në vend…}} vendos në një vend të vetëm të dhëna të hapura për parcelën, ndërtesën, zonizimin, tokën, përmbytjen dhe terrenin. Mund ta mbash vendin në skedarin e projektit: adresën e shkruar, çdo burim me ditën kur e more dhe licencën e tij, dhe atë që u kthye. Rihap ose ndaj projektin dhe vendi është ende aty, pa të marrë asgjë përsëri. Mund ta ruash edhe si skedar vendi ose ta dërgosh te BimCraft. Shih [Adresa në vend](topic:address-to-site).

**Toka, rrugët, rilevimi, minierat, lidhjet dhe hekurudha**

- **Tokat dhe pjerrësitë.** {{ui:Tokat dhe pjerrësitë…}} vizaton profilin e tokës midis sondazheve që shkruan ti. Metoda e Bishop-it kërkon pastaj rrethin kritik në terrenin tënd, me një nivel uji nëntokësor, një ngarkesë shtesë dhe një koeficient tërmeti; ulja e një themeli merr konsolidim, ulje të menjëhershme dhe kohën.
- **Kryqëzimet dhe shënjimi.** {{ui:Kryqëzimet dhe shënjimi…}} bashkon degët me kthesa bordure (një rreze për degë, ose kthesa me tre qendra), distancën e shikimit për shpejtësinë e projektimit, një kontroll të trekëndëshave të shikimit, kalime për këmbësorë, vija ndalese, shënjime dhe tabela me një listë tabelash. Vizatohen në plan dhe ruhen si .dxf me shtresa të emërtuara.
- **Rregullimi i rilevimit.** {{ui:Rregullimi i rilevimit…}} kryen një rregullim me katrorët më të vegjël të një poligonali ose rrjeti: koordinata të rregulluara, elipsa gabimi, testin chi-katror dhe një shenjë te matja që nuk përshtatet. Rrjetat e lira, mbyllja e një poligonali me rregullin e busullës dhe RW5, skedarët e fushës GSI, JobXML ose CSV janë të përfshira, dhe pikat e rregulluara ruhen si CSV.
- **Gropat e hapura.** {{ui:Gropat e hapura…}} shndërron mostrat e shpimit në një model blloku dhe gropën përfundimtare brenda këndit tënd të pjerrësisë, me raportin e shtresës, një tabelë sipas gradinës dhe një kurbë notash dhe tonazhi. Ka gjithashtu gropa të brendshme sipas faktorit të të ardhurave dhe një program prodhimi me rrjedhë të zbritur të parave.
- **Lidhjet radio.** {{ui:Lidhjet radio…}} kontrollon shikimin e drejtpërdrejtë mbi tokën tënde me fryrjen e tokës, zonën e parë të Fresnel-it, buxhetin e lidhjes, rezervën e zbehjes dhe ndërprerjen nga shumëfishimi i sinjalit, dhe jep lartësinë e shtyllës që do ta pastronte shtegun. Bën gjithashtu buxhete humbjeje për fibrën, sasi të rrugës dhe erën mbi një kullë.
- **Ndarjet e hekurudhës.** {{ui:Ndarjet e hekurudhës…}} bën një ndarje nga numri i saj i kryqëzimit, kryqëzime midis binarëve paralelë dhe një kalibër strukture të pjerrur nga pjerrësia dhe i zgjeruar në një kurbë. Një ndarje mund të vendoset në një stacion të një aksi rrugor.

Shih [Tokat, kryqëzimet, rregullimi i rilevimit, gropat, lidhjet radio dhe ndarjet](topic:soils-roads-survey-mines-links).

### Në çdo aplikacion

- **Gjuhët.** 54 gjuhë, dhjetë prej tyre të reja. Gjuhët përtej anglishtes janë draft të bëra me makinë derisa një folës amtare t'i lexojë. Temat e ndihmës janë ende kryesisht në anglisht.
- **Rreshtat e shiritit të veglave.** {{ui:Cilësimet}} › {{ui:Të përgjithshme}} › {{ui:Rreshtat e shiritit të veglave}}: Mbështjell (si më parë), 2 rreshta ose 1 rresht. Shiriti i CivilCraft shfaq veglën më të përdorur të madhe, pastaj ato të tjerat të vogla, dhe pjesën tjetër pas shigjetës së emrit të grupit.
- **Pajisjet e hyrjes.** Shiriti i prekjes, lapsi, miu 3D, kontrolluesi dhe MIDI mund të drejtojnë aplikacionet.
- **Problemet.** Një panel Problemesh që paralajmëron në çdo aplikacion, me kontrolle që lexojnë paketat e rregulloreve.
- **Live.** Një pamje e kujt është ku në një sesion Live.
- **Shtojcat.** Një listë shtojcash, me shtojca ndriçimi.
- **Lidh AI-in tënd.** Çdo asistent që lidh mund të drejtojë veglat e CivilCraft. Vjen me një shënim se lidhja me një klik brenda CadCraft Studio dhe lidhësi i strehuar nuk janë gati ende. Shih [Lëre një asistent AI të punojë me vendin tënd](topic:assistants).

### Të rregulluara në 0.8.1

- **Seksioni i klasave DWG.** Lexohej si lloj i gabuar (GitHub cadcraft#5). U rregullua në CivilCraft së bashku me CadCraft, BimCraft, ModelCraft dhe TakeoffCraft.
- **Ndryshimi i gjuhës gjatë punës.** CadCraft Studio dhe edicionet e paketuara mund ta ndryshojnë gjuhën gjatë ekzekutimit. Më parë ishin vetëm në anglisht. Nuk është testuar ende në çdo platformë: thuaj nëse gjuha nuk ndryshon.

### Jo ende në këtë version

- **Këto janë mjete llogaritjeje.** Çdo rezultat në dritaret e reja ka nevojë për kontrollin e një inxhinieri. Forcat e tokës fillojnë nga vlera tipike për grupin e tokës, dhe dritarja e thotë këtë.
- **Bëje të bjerë shi.** Një ekzekutim në vendin shembull mund të zgjasë mbi dy minuta në shfletues me një qelizë të imët. U kontrollua me raste me dorë dhe një pellg në formë V, jo ende në një vend të nivelluar të vërtetë.
- **Adresa në vend.** Lexon skedarë të hapur të dhënash që sjell ti, dhe u testua vetëm me skedarët tanë. Pemët nuk janë burim. Marrja e burimeve për ty pret tekstin e privatësisë.
- **Përparimi nga rilevimet.** U testua vetëm me rilevime të trilluara. Përparimi në fletë dhe shënime (MarkupCraft) dhe skanimi kundrejt modelit (BimCraft) nuk janë ndërtuar.
- **Tokat dhe pjerrësitë.** Vetëm sipërfaqe rrethore: pa kërkim me kunjë ose blloqe dhe pa çarje tensioni.
- **Kryqëzimet.** Një rreze për degë, pa shtegje me kamion të kthyer, dhe nuk hyjnë ende në koridor.
- **Skedarët e fushës.** Lexuesit u shkruan nga përshkrimet publike të formateve dhe u provuan me skedarë që bëmë ne. Kërkohen skedarë të vërtetë instrumentesh.
- **Lidhjet dhe hekurudha.** Lidhjet radio: vetëm humbje në hapësirë të lirë dhe shumëfishim (pa zbehje nga shiu ose modele antenash), dhe pa standard hekurudhor: çdo kufi hekurudhor është vend mbajtës, me numra draft që asnjë inxhinier hekurudhor nuk i ka kontrolluar.
- **Windows dhe macOS.** 0.8 nuk ka nënshkrim kodi. Windows mund të paralajmërojë, dhe macOS kërkon klik me butonin e djathtë pastaj Hap.

Gjithçka tjetër është në [Jo të ndërtuara ende](topic:not-built-yet). Për versionin e mëparshëm, shih [Çfarë ka të re në 0.7](topic:whats-new-0-7).
