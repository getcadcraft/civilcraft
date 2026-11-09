---
title: Çfarë ka të re në 0.8 dhe 0.8.1
summary: CivilCraft 0.8 shton Bëje të bjerë shi (një stuhi mbi terrenin e niveluar), një balancues të dherave, gjetësin e rrugës më të mirë, liqene retensioni, përparimin nga matjet, një importues adresë-në-vend që e mban vendin brenda projektit, dhe dritare për tokat dhe pjerrësitë, kryqëzimet dhe shënjimin, rregullimin e rilevimit, gropat e hapura, lidhjet radio dhe ndarjet e hekurudhës. 0.8.1 rregullon mënyrën si lexohen skedarët DWG.
keywords: çfarë ka të re, what's new, shënime versioni, changelog, ndryshime, 0.8, 0.8.1, version, veçori të reja, shi, stuhi, ngopje, tejmbushje, dhera, balancim, prerje dhe mbushje, transport, rruga më e mirë, kosto më e ulët, aks rrugor, liqen retensioni, dalje, ulje e nivelit, bordi i lirë, progres, rilevim, dron, deponi, adresë në vend, parcelë, tokë, përmbytje, qëndrueshmëri e pjerrësisë, bishop, zhvendosje, kryqëzim, shënjim, shenja, distancë shikimi, rregullim, katror më i vogël, poligon, gropë e hapur, model blloku, lidhje radio, fresnel, ndarje, kryqëzim, gjuhë, probleme, drejtpërdrejt, dwg
from: b0932cf0
---

Ky është ndryshimi në CivilCraft 0.8 (2026-11-01) dhe 0.8.1 (2026-11-02), krahasuar me 0.7. Pjesët kryesore të reja janë vegla që testojnë terrenin e niveluar dhe vendin tuaj (shi, dheratë, rrugët, liqenet, progresi), dhe gjashtë dritare llogaritjeje për tokën, rrugët, rilevimin, minierat, lidhjet dhe hekurudhën.

## Të reja

### Testoni nivelimin tuaj

- **Bëje të bjerë shi.** {{ui:Bëje të bjerë shi…}} (nën {{ui:Sipërfaqe}}) lëshon një stuhi mbi tokën e niveluar. Shihni ujin që rrjedh nga platformat, grumbullohet në qoshet e ulëta dhe tejmbush liqenet që janë shumë të vegjël. Ecuria është e animuar dhe jep vëllimet, rrjedhjen maksimale dhe një CSV për çdo liqen. Qeliza e parazgjedhur është e trashë, që një shikim i parë të jetë i shpejtë; një qelizë më e imët është më e ngadaltë. Liqenet që tejmbushen shfaqen gjithashtu në panelin e Problemeve.
- **Balancuesi i dherave.** {{ui:Balancuesi i dherave…}} ngre ose ul një platformë derisa prerja të jetë e barabartë me mbushjen, dhe tregon tabelën e transportit ndërmjet tyre.
- **Rruga më e mirë.** {{ui:Rruga më e mirë…}}: zgjidhni një pikë fillimi dhe një pikë fundi, dhe CivilCraft gjen shtegun më të lirë përmes terrenit që i përmbahet kufijve të pjerrësisë dhe lakimit tuaj, pastaj krijon nga ai një aks rrugor.
- **Liqene retensioni.** {{ui:Liqene retensioni…}} llogarit fazën dhe depozitimin nga terreni juaj, pranon pajisjet e daljes (orific, pragu, V-notch, derdhësi), kalon një stuhi përmes liqenit dhe kontrollon rrjedhjen maksimale të mbajtur, kohën e uljes së nivelit dhe bordin e lirë.
- **Përparimi nga matjet.** {{ui:Përparimi nga matjet…}} krahason sipërfaqet e dronëve ose skanimeve nga data të ndryshme me tokën siç ishte dhe me projektin: përqindjen e përfunduar sipas vëllimit, zonat e gërmuara tepër dhe të mbushura tepër, deponitë, dhe kur punimi përfundon me këtë ritëm (e shënuar si vlerësim).

### Njihni vendin

- **Adresë në vend.** {{ui:Adresë në vend…}} bashkon në një vend të dhënat e hapura të parcelës, ndërtesës, zonimit, tokës, përmbytjes dhe terrenit. Mund ta mbani vendin brenda skedarit të projektit: adresën e shkruar, çdo burim me ditën kur e morët dhe licencën e tij, dhe atë që u kthye. Rihapni ose ndani projektin dhe vendi mbetet aty, pa u marrë asgjë përsëri. Mund ta ruani edhe si skedar vendi ose ta dërgoni te BimCraft. Shihni [Adresë në vend](topic:address-to-site).

### Toka, rrugët, rilevimi, minierat, lidhjet dhe hekurudha

- **Tokat dhe pjerrësitë.** {{ui:Tokat dhe pjerrësitë…}} vizaton profilin e tokës ndërmjet sondazheve që shkruani. Metoda e Bishop-it kërkon pastaj rrethin kritik mbi terrenin tuaj, me një nivel uji nëntokësor, një ngarkesë shtesë dhe një koeficient tërmeti; zhvendosja e një themeli merr konsolidimin, zhvendosjen e menjëhershme dhe kohën.
- **Kryqëzimet dhe shënjimi.** {{ui:Kryqëzimet dhe shënjimi…}} bashkon degët me kthesa bordure (një rreze për degë, ose kthesa me tre qendra), distancën e shikimit për shpejtësinë e projektimit, një kontroll të trekëndëshave të shikimit, kalimet e këmbësorëve, vijat e ndalimit, shënjimet dhe tabelat me një tabelë shenjash. Ato vizatohen në plan dhe ruhen si .dxf me shtresa të emërtuara.
- **Rregullimi i rilevimit.** {{ui:Rregullimi i rilevimit…}} kryen një rregullim me katror më të vegjël të një poligoni ose rrjeti: koordinata të rregulluara, elipsa gabimi, testin chi-katror dhe një shenjë te matja që nuk përshtatet. Përfshihen rrjetet e lira, mbyllja e poligonit me rregullin e busullës dhe skedarët e fushës RW5, GSI, JobXML ose CSV, dhe pikat e rregulluara ruhen si CSV.
- **Gropat e hapura.** {{ui:Gropat e hapura…}} i kthen mostrat e shpimit në një model blloku dhe gropën përfundimtare brenda këndit tuaj të pjerrësisë, me raportin e shiritit, një tabelë sipas gradinës dhe një kurbë të nivelit dhe tonazhit. Gjithashtu ka gropa të brendshme sipas faktorit të të ardhurave dhe një program prodhimi me rrjedhë parash të zbritur.
- **Lidhjet radio.** {{ui:Lidhjet radio…}} kontrollon shikimin e drejtpërdrejtë mbi terrenin tuaj me përkuljen e Tokës, zonën e parë të Fresnel-it, buxhetin e lidhjes, rezervën e zbehjes dhe ndërprerjen nga shumërrugëzimi, dhe jep lartësinë e shtyllës që do ta linte shtegun të lirë. Bën gjithashtu buxhetet e humbjes së fibrës, sasitë e rrugës dhe erën mbi një kullë.
- **Ndarjet e hekurudhës.** {{ui:Ndarjet e hekurudhës…}} krijon një ndarje nga numri i kryqëzimit të saj, kryqëzime midis binarëve paralelë dhe një kalibër strukture të prirur nga pjerrësia e tërthortë dhe i zgjeruar në një kthesë. Një ndarje mund të vendoset në një stacion të një aksi rrugor.

Shihni [Tokat, kryqëzimet, rregullimi i rilevimit, gropat, lidhjet radio dhe ndarjet](topic:soils-roads-survey-mines-links).

## Në çdo aplikacion

- **Gjuhët.** 54 gjuhë, dhjetë prej tyre të reja. Gjuhët e tjera nga anglishtja janë skica me makinë derisa t'i lexojë një folës amtare. Faqet e ndihmës janë ende kryesisht në anglisht.
- **Rreshtat e shiritit të veglave.** {{ui:Cilësimet}} › {{ui:Të përgjithshme}} › {{ui:Rreshtat e shiritit të veglave}}: Mbështjell (si më parë), 2 rreshta ose 1 rresht. Ribbon-i i CivilCraft shfaq veglën më të përdorur të madhe, pastaj të tjerat të vogla, dhe pjesën tjetër pas shigjetës së emrit të grupit.
- **Pajisjet e hyrjes.** Trackpad-i, stilolapsi, miu 3D, kontrolluesi dhe MIDI mund t'i drejtojnë aplikacionet.
- **Problemet.** Një panel Problemesh që paralajmëron në çdo aplikacion, me kontrolle që lexojnë paketat e rregullave.
- **Drejtpërdrejt.** Një pamje e kujt është ku në një sesion Drejtpërdrejt.
- **Shtojcat.** Një listë shtojcash, me shtojca ndriçimi.
- **Lidhni AI-n tuaj.** Çdo asistent që lidhni mund t'i drejtojë veglat e CivilCraft. Vjen me një shënim se lidhja me një klik brenda CadCraft Studio dhe lidhësi i hostuar nuk janë gati ende. Shihni [Lëreni një asistent AI të punojë me vendin tuaj](topic:assistants).

## Rregulluar në 0.8.1

- **Seksioni i klasave DWG.** Lexohej si lloj i gabuar (GitHub cadcraft#5). Rregulluar në CivilCraft së bashku me CadCraft, BimCraft, ModelCraft dhe TakeoffCraft.
- **Ndryshimi i gjuhës gjatë punës.** CadCraft Studio dhe edicionet e paketuara mund ta ndryshojnë gjuhën gjatë ekzekutimit. Më parë ishin vetëm në anglisht. Nuk është testuar ende në çdo platformë: na tregoni nëse gjuha nuk ndryshon.

## Jo ende në këtë version

- **Këto janë ndihma llogaritjeje.** Çdo rezultat në dritaret e reja ka nevojë për kontrollin e një inxhinieri. Forcat e tokës fillojnë nga vlera tipike për grupin e tokës, dhe dritarja e thotë këtë.
- **Bëje të bjerë shi.** Një ekzekutim në vendin shembull mund të zgjasë mbi dy minuta në shfletues me një qelizë të imët. U kontrollua me raste të llogaritura me dorë dhe një zonë grumbullimi në formë V, jo ende në një vend të niveluar realisht.
- **Adresë në vend.** Lexon skedarë të hapur të dhënash që sillni ju, dhe u testua vetëm me skedarët tanë. Pemët nuk janë burim. Marrja e burimeve për ju pret tekstin e privatësisë.
- **Përparimi nga matjet.** U testua vetëm me matje të trilluara. Përparimi mbi fleta dhe shënime (MarkupCraft) dhe krahasimi i skanimit me modelin (BimCraft) nuk janë ndërtuar.
- **Tokat dhe pjerrësitë.** Vetëm sipërfaqe rrethore: pa kërkim me kunj ose bllok dhe pa plasaritje tensioni.
- **Kryqëzimet.** Një rreze për degë, pa shtegje të rrotave të kamionëve, dhe nuk futen ende në korridor.
- **Skedarët e fushës.** Lexuesit u shkruan nga përshkrimet publike të formatit dhe u provuan me skedarë që ne bëmë. Nevojiten skedarë të vërtetë instrumentesh.
- **Lidhjet dhe hekurudha.** Lidhjet radio: vetëm humbje në hapësirë të lirë dhe shumërrugëzim (pa zbehje nga shi ose modele antenash), dhe pa standard hekurudhor: çdo kufi hekurudhor është vend-mbajtës, me numra skicë që asnjë inxhinier hekurudhor nuk i ka kontrolluar.
- **Windows dhe macOS.** 0.8 nuk është e nënshkruar me kod. Windows mund të paralajmërojë, dhe macOS kërkon klikim me butonin e djathtë e pastaj Hap.

Çdo gjë tjetër është te [Të pa ndërtuara ende](topic:not-built-yet). Për versionin e mëparshëm, shihni [Çfarë ka të re në 0.7](topic:whats-new-0-7).
