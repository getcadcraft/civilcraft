---
title: Shtrirja e një koridori rrugor
summary: Ndiz një koridor për një aks rrugor, vendos vlerat e korsisë, bankinës dhe pjerrësisë anësore, dhe lexo prerjet, vijat e kontaktit me terrenin dhe punën me tokë që prodhon.
keywords: kryqëzim, ndërprerje, rrugë që takon rrugën, rrugë anësore, kryqëzim në T, kalim, kotë platforme, lidhje, lidhje me terrenin, superelevim, zhdrejtim kthese, zonë kalimi, zonë zbutjeje, tabelë normash, pjerrësi tërthore, rrotullim, koridor, montim, nënmontim, prerje tipike, rrugë, korsi, bankinë, pjerrësi tërthore, pjerrësi anësore, vijë kontakti, hapje, mbushje, prerje, objektiv, objektiv gjerësie, objektiv kote, objektiv zhvendosjeje, zgjerim, skaj asfalti, ndiq një koridor tjetër
from: 6dcb92b3
---

Një koridor shtrin një prerje tipike të thjeshtë (një montim) përgjatë një aksi rrugor dhe profilit të tij projektues, e nivelon me terrenin ekzistues dhe e shton rezultatin te sipërfaqja e propozuar. Një aks rrugor mund të mbajë disa koridore në intervale stacionesh të ndryshme, dhe një koridor mund të ndërtohet nga shabllone të ripërdorshme sipas stacionit ([Shabllonet e koridorit](topic:corridor-templates)). Montimi i thjeshtë më poshtë është i njëjtë në të dy anët; për t'i dhënë çdo ane pjesët e veta, shih [Ndërto çdo anë nga pjesë](topic:corridor#build-each-side-from-parts).

## Montimi

Nga boshti qendror nga jashtë, në çdo anë:

1. një **korsi** me gjerësi të caktuar, që bie nga kurora me **pjerrësinë e korsisë**
2. një **bankinë** me gjerësi të caktuar me **pjerrësinë e bankinës**
3. një **pjerrësi anësore** nga skaji i bankinës deri aty ku takon terrenin: **pjerrësia e hapjes** kur terreni është mbi të, **pjerrësia e mbushjes** kur është poshtë

Vlerat fillestare janë vende-mbajtëse, jo standard projektimi:

| Vlera | Këmbë (SHBA) | Metra |
|---|---|---|
| Gjerësia e korsisë | 12 ft | 3.6 m |
| Pjerrësia e korsisë | 2% | 2% |
| Gjerësia e bankinës | 4 ft | 1.2 m |
| Pjerrësia e bankinës | 4% | 4% |
| Pjerrësia e hapjes | 2 : 1 | 2 : 1 |
| Pjerrësia e mbushjes | 3 : 1 | 3 : 1 |
| Prerje çdo | 10 ft | 5 m |

Pjerrësitë anësore jepen horizontale me vertikale (H:V): 3 : 1 do të thotë 3 horizontalisht për 1 vertikalisht.

## Ndërtimi i koridorit

Të duhet një aks rrugor pa gabime dhe një profil projektues me të paktën dy PVI dhe pa gabime.

1. Përzgjidh aksin rrugor.
2. Në panelin e djathtë, nën **Koridor**, shëno **Shtri një montim përgjatë profilit projektues**.
   Fushat shfaqen dhe koridori ndërtohet menjëherë. Plani tregon skajet e korsisë dhe bankinës dhe vijat e kontaktit me terrenin; me {{ui:E propozuar (e nivelluar)}} të zgjedhur nën **Shfaq**, kurbat e nivelit tregojnë terrenin e ri.
3. Ndrysho çdo vlerë: **Gjerësia e korsisë**, **Pjerrësia e korsisë**, **Gjerësia e bankinës**, **Pjerrësia e bankinës**, **Pjerrësia e hapjes**, **Pjerrësia e mbushjes**, **Prerje çdo**. Shtyp {{key:Enter}} pas secilës. Hapja, mbushja dhe hapësira e prerjeve duhet të jenë më të mëdha se 0.
4. Lexo rreshtin nën fushat, për shembull "39 prerje nga 0+00.00 në 3+86.36; hapje 240.2 cu yd, mbushje 556.0 cu yd."

Prerjet bëhen në çdo hap të **Prerje çdo**, në skaje, dhe në fillim dhe në fund të çdo kthese horizontale dhe vertikale. Çdo prerje dhe vijat që kalojnë nëpër to (boshti qendror, skajet e korsisë dhe bankinës, vija e kontaktit) bëhen vija thyerjeje të sipërfaqes së propozuar.

Për ta fikur koridorin, hiq shenjën te kutia. Vlerat e tij ruhen për herën tjetër.

## Kur nuk ndërtohet

Një kuti e kuqe nën fusha thotë arsyen:

| Mesazhi | Çfarë të bësh |
|---|---|
| "Koridori ka nevojë për një profil projektues pa gabime." | Shto PVI, ose ndreq kurbat vertikale që mbivendosen (shih [Hartimi i një profili gjatësor](topic:profile)). |
| "Profili projektues nuk mbivendoset me aksin rrugor." | Zhvendos PVI-të në intervalin e stacioneve të aksit rrugor. |
| "Koridori ka nevojë për të paktën dy prerje në sipërfaqe." | Pjesa më e madhe e koridorit është jashtë terrenit ekzistues. |
| "4 pjerrësi anësore dalin nga sipërfaqja përpara se të takojnë terrenin." | Pranë skajit të sipërfaqes pjerrësia nuk mund të arrijë terrenin. Mbaje rrugën larg skajit, ose ule lartësinë e mbushjes ose hapjes atje. |
| "Vijat e kontaktit të koridorit kryqëzohen (prerjet mbivendosen, për shembull në anën e brendshme të një kthese të ngushtë). Përdor një rreze më të madhe ose montim më të ngushtë." | Prerjet në anën e brendshme të një kthese të mprehtë mbivendosen. Rrit rrezen ose ngushto montimin. |

Një koridor me problem nuk nivelohet dhe nuk llogaritet në punën me tokë.

## Koridoret dhe platformat së bashku

Sipërfaqja e propozuar ndërtohet me radhë: fillimisht çdo koridor, pastaj çdo platformë. Kur nivelimi i një platforme mbivendoset me një koridor, fiton platforma. Kur një element i mëvonshëm mbivendoset me një rrugë, zëvendësohet vetëm pjesa e rrugës brenda vijës së kontaktit të elementit të mëvonshëm; pjesa tjetër e rrugës, dhe çdo vijë thyerjeje e terrenit që kalon rrugën, mban formën e vet. Vëllimet llogariten brenda të gjitha vijave të kontaktit së bashku; shih [Vëllimet e punës me tokë](topic:volumes).

## Superelevimi

Përgjatë një kthese rruga mund të priret nga brenda, kështu trafiku shtyhet më pak nga jashtë. Shëno **Superelevo kthesat** nën **Superelevim** te **Vetitë** e aksit rrugor:

- Çdo kthesë rrethore merr një normë **e** nga tabela e normave: rreshtin e parë te rrezja e të cilit arrin kthesa (një rresht me normë bosh mban kurorën normale). Tabela dhe **Pjerrësia maksimale relative** (0.5 % në fillim) janë vende-mbajtëse, jo standard: vendosi sipas kritereve tuaja të projektimit. Shto ose hiq rreshta sipas nevojës.
- Korsitë rrotullohen rreth boshtit qendror. Përpara kthesës korsia e jashtme sheshohet gjatë **zonës së zbutjes** (kurora normale ÷ e × zona e kalimit), pastaj gjatë **zonës së kalimit** (gjerësia e korsisë × e ÷ pjerrësia) korsia e jashtme vazhdon të rrotullohet derisa e gjithë rruga të pjerrët me e nga brenda; dy të tretat e zonës së kalimit shtrihen përpara kthesës dhe një e treta mbi të. Pas kthesës ndodh e njëjta gjë në drejtim të kundërt.
- Një bankinë në anën e ulët nuk është kurrë më e sheshtë se korsia e vet; në anën e lartë mban pjerrësinë e vet (rrokulliset).
- Tabela nën të liston rrezen, normën, zonën e kalimit dhe zonën e zbutjes të çdo kthese, dhe ku fillon e ku mbaron superelevimi i plotë. **Diagrami i superelevimit** vizaton pjerrësitë tërthore të të dy korsive përgjatë stacioneve (korsia e majtë e plotë, e djathta me vija).
- Një kthesë shumë e shkurtër për të arritur superelevimin e plotë, ose dy kthesa kalimet e të cilave mbivendosen, tregohet në një kuti mbi tabelë.

Prerjet, vëllimet, pamja 3D dhe fletët tregojnë rrugën e pjerrët. Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën.

## Objektivat

Një objektiv zhvendos një pikë të njërës anë të rrugës te një vijë: **Skaji i asfaltit** ose **Skaji i bankinës**, në **Majtas** ose **Djathtas**. Çdo prerje e takon vijën në kënd të drejtë me boshtin qendror, duke dalë vetëm në atë anë, kështu një objektiv në të djathtë nuk zhvendos kurrë anën e majtë.

| Cakton | Çfarë ndodh aty ku prerja takon vijën |
|---|---|
| **Gjerësia** | Pika qëndron mbi vijë: korsia (ose bankina) zgjerohet ose ngushtohet deri aty, duke ruajtur pjerrësinë e saj tërthore. |
| **Kota** | Pika merr kotën e vijës aty, në largësinë e vet: pjerrësia tërthore e korsisë (ose bankinës) ndjek. |

Vija mund të jetë një vijë karakteristike (çfarëdo qoftë **Përdorimi** i saj) ose vijë e një koridori tjetër: boshti qendror, skajet e asfaltit, skajet e bankinave ose vijat e kontaktit. Vija e një koridori ndjek atë koridor: ndrysho rrugën tjetër dhe kjo ndjek. CivilCraft ndërton së pari koridorin tjetër; dy koridore që do të synonin njëri-tjetrin në unazë refuzohen në një anë, dhe tabela tregon cilin.

1. Përzgjidh aksin rrugor dhe ndiz koridorin e tij.
2. Nën **Objektivat**, kliko {{ui:Shto një objektiv}}.
3. Zgjidh **Anën**, **Pikën**, çfarë **Cakton** dhe **Te vija**. Çdo ndryshim është një hap zhbërjeje.

**Rezultati** thotë te sa prerje u arrit vija. Prerjet që nuk e arrijnë (përtej skajeve të saj, ose aty ku është pas boshtit qendror) mbajnë vlerat e montimit. Një vijë që fshihet e lë koridorin ashtu si ishte para objektivit, dhe tabela e thotë këtë. Një anë mund të ketë një objektiv gjerësie dhe një objektiv kote për çdo pikë.

## Ndërto çdo anë nga pjesë

Ndiz **Ndërto çdo anë nga pjesë** nën cilësimet e koridorit. Çdo anë ka atëherë listën e vet, nga boshti qendror nga jashtë: korsitë, një bankinë, një kanal, një bordurë, një shirit mbjelljeje, një trotuar dhe, në fund, pjerrësia anësore deri në terren (me raportet e veta të hapjes dhe mbushjes). Fillo nga {{ui:Rrugë rurale}} ose {{ui:Rrugë urbane}}, shto dhe hiq pjesë, zhvendosi me shigjetat, dhe {{ui:Kopjo}} një anë në tjetrën. Çdo ndryshim është një hap zhbërjeje.

Pjerrësia tërthore është rënia larg rrugës, kështu një trotuar që drenon drejt rrugës është negativ. Një bordurë është një faqe me lartësinë që jep, një majë me gjerësinë që jep dhe një rënie opsionale në pjesën e pasme. Superelevimi kthen çdo korsi në rreshtin e parë; kanali, bordura, shiriti dhe trotuari varen nga skaji i korsive ashtu siç janë ndërtuar. Objektivat ende zhvendosin skajin e korsive dhe pjesën e fundit. Prerjet tërthore shënojnë rrjedhën e kanalit, majën dhe pjesën e pasme të bordurës, dhe të tjerat. Në një kthesë me spiralë, zona e kalimit është spirali: kurora e nivelit te TS, superelevimi i plotë te SC.

## Shtresat e rrugës

Një korsi, bankinë, kanal, shirit mbjelljeje ose trotuar mund të mbajë strukturën e vet: nën pjesën, {{ui:Shto një shtresë}} shton një shtresë me emër, material, trashësi dhe llojin e saj (sipërfaqësore, lidhëse, bazë, nënbazë, mbulesë ose tjetër), nga lart poshtë. Shtresat nuk e zhvendosin sipërfaqen e rrugës (maja e saj është sipërfaqja projektuese); çdo shtresë shtrihet nën pjesën e vet, thellësia e së cilës matet drejt poshtë. Prerjet tërthore vizatojnë fundin e çdo shtrese si vijë me pika, dhe {{ui:Shtresat e rrugës: sasitë}} liston sipërfaqen në plan dhe vëllimin e çdo shtrese (sipërfaqja përgjatë koridorit nga prerjet e saj, vëllimi = sipërfaqe × trashësi). Eksporti IFC shkruan çdo shtresë si element të vet me trashësinë dhe materialin e saj (shih [Eksporti dhe importi IFC](topic:ifc)). Trashësia që shkruan është e jotja: CivilCraft nuk i llogarit trashësitë e shtresave.

## Ku rrugët takojnë rrugët, platformat dhe shtigjet

Me {{ui:Bashko rrugët dhe platformat që takon}} të ndezur (është i ndezur për çdo koridor), CivilCraft lidh një koridor me atë që takon në plan:

- **Një rrugë që mbaron mbi një rrugë tjetër** (fundi i aksit të saj shtrihet mbi rrugën tjetër, ose brenda rreth gjysmës së gjerësisë së vet të asfaltit nga skaji i asaj rruge) është rruga anësore e një kryqëzimi. Rruga që takon hap skajin e vet për asfaltin e rrugës anësore: përgjatë grykës, bankina, bordura, shiriti dhe trotuari shtrihen sipas pjerrësisë tërthore të korsisë dhe vizatohen si asfalt. Rruga anësore shtrihet mbi sipërfaqen e rrugës kryesore aty ku mbivendosen, dhe ngrihet ose ulet drejt saj përgjatë qasjes.
- **Dy rrugë që kryqëzohen** lidhen në të njëjtën mënyrë nga të dyja anët. Rruga e listuar e para te **Aksët rrugorë** është rruga kalimtare; tjetra ndjek sipërfaqen e saj gjatë kalimit.
- **Një rrugë që mbaron te një platformë** (brenda saj, ose brenda rreth gjysmës së gjerësisë së asfaltit nga skaji i saj) arrin nivelin e platformës dhe lehtësohet drejt tij përgjatë qasjes.
- **Një shteg** (Peizazh › {{ui:Elemente të ngurta}}) ndalon te skaji i jashtëm i rrugës, në nivelin e trotuarit ose bankinës aty, në vend që të shtrihet mbi rrugë. Një shteg që kryqëzon një rrugë bëhet dy pjesë. Një fund i vizatuar pak më shkurt se rruga (brenda dyfishit të gjerësisë së shtegut) vazhdon deri te skaji i saj.

**Vetitë** thonë çfarë lidh çdo koridor, sa është ngritur ose ulur aty dhe mbi çfarë gjatësie. Ajo gjatësi është më e madhja mes 10 m (30 ft) dhe njëzet herë ndryshimit, dhe kurrë më shumë se 45% e koridorit. **Profili projektues nuk ndryshohet**: pamja e profilit ende tregon vijën e pjerrësisë që vizatove, dhe prerjet, sipërfaqja e propozuar, vëllimet dhe pamja 3D tregojnë rrugën ashtu si është lidhur. Për ta bërë lidhjen të saktë sipas projektit, zhvendos PVI-në e fundit te kota që raporton Vetitë.

Fik ndërrimin te një koridor për ta lënë saktësisht siç thonë profili dhe montimi i tij; atëherë nuk merr pjesë në asnjë kryqëzim, as si rrugë anësore as si rrugë kalimtare. Rrugët që takohen pothuajse në vijë (nën rreth 20°) lihen të paprekura, dhe po kështu edhe shtigjet.

Ç'nuk bën ende një kryqëzim: nuk ka kthime bordure (këndet janë të drejta), as korsi kthimi ose ishuj; fundi i rrugës anësore priten në kënd të drejtë me aksin e vet; dhe një koridor i ndërtuar nga shabllone hap skajin e vet në të njëjtën mënyrë të thjeshtë (një kanal ose mur në gjendjen e fundit nivelohet përgjatë grykës, pa tombino). Për kthimet e bordurës në plan, trekëndëshat e shikimit dhe shënjimin shih [Toka, rrugët, matjet, minierat dhe lidhjet](topic:soils-roads-survey-mines-links).

## Ç'nuk është ndërtuar ende

Objektivat për pjerrësinë e vijës së kontaktit nuk janë ende të disponueshëm. Për një koridor që ndryshon përgjatë rrugës, me majtas dhe djathtas të ndara, përdor [Shabllonet e koridorit](topic:corridor-templates). Shih [Ende nuk është ndërtuar](topic:not-built-yet).
