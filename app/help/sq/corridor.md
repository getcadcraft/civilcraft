---
title: Shtrij një koridor rruge
summary: Aktivizo një koridor për një aks rrugor, vendos vlerat e korsisë, bankinës dhe pjerrësisë anësore, dhe lexo prerjet, vijat e kontaktit dhe punimet e tokës që prodhon.
keywords: superelevim, super, pjerrësi tërthore, tranzicion, rrotullim, tabela e normës, pjerrësi tërthore, rrotullim, koridor, montim, nënmontim, prerje tipike, rrugë, korsi, bankinë, pjerrësi tërthore, pjerrësi anësore, kontakt me terrenin, gërmim, mbushje, prerje, objektiv, objektiv gjerësie, objektiv kote, objektiv zhvendosjeje, zgjerim, kufiri i rrugëzimit, ndiq një koridor tjetër
from: 91303189
---

Një koridor shtrin një prerje të thjeshtë tipike (një montim) përgjatë një aksi rrugor dhe profilit të tij të projektimit, e nivelon në terrenin ekzistues dhe e shton rezultatin te sipërfaqja e propozuar. Një aks mund të mbajë disa koridore në gama të ndryshme stacionesh, dhe një koridor mund të ndërtohet nga shabllona të ripërdorshëm sipas stacionit ([Shabllonet e koridorit](topic:corridor-templates)). Montimi i thjeshtë më poshtë është i njëjtë në të dy anët; për t'i dhënë çdo ane pjesët e veta, shih [Ndërto çdo anë nga pjesët](topic:corridor#build-each-side-from-parts).

## Montimi

Nga boshti qendror jashtë, në çdo anë:

1. një **korsi** me një gjerësi të caktuar, që zbret nga kurora me **pjerrësinë e korsisë**
2. një **bankinë** me një gjerësi të caktuar me **pjerrësinë e bankinës**
3. një **pjerrësi anësore** nga skaji i bankinës deri aty ku takon terrenin: **pjerrësia e gërmimit** aty ku terreni është mbi të, dhe **pjerrësia e mbushjes** aty ku është poshtë

Vlerat fillestare janë vende-mbajtëse, jo një standard projektimi:

| Vlera | US feet | Metra |
|---|---|---|
| Gjerësia e korsisë | 12 ft | 3.6 m |
| Pjerrësia e korsisë | 2% | 2% |
| Gjerësia e bankinës | 4 ft | 1.2 m |
| Pjerrësia e bankinës | 4% | 4% |
| Pjerrësia e gërmimit | 2 : 1 | 2 : 1 |
| Pjerrësia e mbushjes | 3 : 1 | 3 : 1 |
| Prerje çdo | 10 ft | 5 m |

Pjerrësitë për pjerrësitë anësore janë horizontale me vertikale (H:V): 3 : 1 do të thotë 3 horizontal për 1 vertikal.

## Ndërto koridorin

Ju duhet një aks pa gabime dhe një profil projektimi me të paktën dy PVI dhe pa gabime.

1. Zgjidh aksin.
2. Në panelin e djathtë, nën **Koridor**, shëno **Shtrij një montim përgjatë profilit të projektimit**.
   Fushat shfaqen dhe koridori ndërtohet menjëherë. Plani tregon skajet e korsisë dhe të bankinës dhe vijat e kontaktit; me {{ui:E propozuar (e nivelluar)}} të zgjedhur nën **Shfaqja**, izoipsat tregojnë terrenin e ri.
3. Ndrysho çdo vlerë: **Gjerësia e korsisë**, **Pjerrësia e korsisë**, **Gjerësia e bankinës**, **Pjerrësia e bankinës**, **Pjerrësia e gërmimit**, **Pjerrësia e mbushjes**, **Prerje çdo**. Shtyp {{key:Enter}} pas secilës. Gërmimi, mbushja dhe hapësira e prerjeve duhet të jenë më të mëdha se 0.
4. Lexo rreshtin nën fusha, për shembull "39 prerje nga 0+00.00 deri në 3+86.36; gërmim 240.2 cu yd, mbushje 556.0 cu yd."

Prerjet bëhen çdo hap **Prerje çdo**, në skaje, dhe në fillimin dhe fundin e çdo kurbe horizontale dhe vertikale. Çdo prerje dhe linjat që kalojnë nëpër to (boshti qendror, skajet e korsisë dhe të bankinës, vijat e kontaktit) bëhen vija të thyerjes së sipërfaqes së propozuar.

Për ta fikur koridorin, hiq shenjën e kutisë. Vlerat e tij ruhen për herën tjetër.

## Kur nuk ndërtohet

Një kuti e kuqe nën fusha thotë arsyen:

| Mesazhi | Çfarë të bëni |
|---|---|
| "Koridori ka nevojë për një profil projektimi pa gabime." | Shtoni PVI, ose rregulloni kurbat vertikale që mbivendosen (shih [Projekto një profil vertikal](topic:profile)). |
| "Profili i projektimit nuk mbivendoset me aksin." | Zhvendosni PVI-të në gamën e stacioneve të aksit. |
| "Koridori ka nevojë për të paktën dy prerje mbi sipërfaqen." | Pjesa më e madhe e koridorit është jashtë terrenit ekzistues. |
| "4 pjerrësi anësore dalin jashtë sipërfaqes përpara se të takojnë terrenin." | Pranë skajit të sipërfaqes pjerrësia nuk mund të arrijë terrenin. Mbajeni rrugën larg skajit, ose ulni lartësinë e mbushjes ose të gërmimit aty. |
| "Vijat e kontaktit të koridorit kryqëzohen (prerjet mbivendosen, për shembull në anën e brendshme të një kthese të ngushtë). Përdorni një rreze më të madhe ose montim më të ngushtë." | Prerjet në anën e brendshme të një kthese të mprehtë mbivendosen. Rrisni rrezen ose ngushtoni montimin. |

Një koridor me problem nuk nivelohet dhe nuk llogaritet në punimet e tokës.

## Koridoret dhe platformat së bashku

Sipërfaqja e propozuar ndërtohet me radhë: fillimisht çdo koridor, pastaj çdo platformë. Aty ku nivelimi i një platforme mbivendoset me një koridor, platforma fiton. Vëllimet llogariten brenda të gjitha vijave të kontaktit së bashku; shih [Vëllimet e gërmimit](topic:volumes).

## Superelevimi

Gjatë një kurbe, rruga mund të pjerrët nga ana e brendshme, kështu që trafiku shtyhet më pak nga jashtë. Shëno **Superelevo kurbat** nën **Superelevimin** te **Vetitë** e aksit:

- Çdo kurbë rrethore merr një normë **e** nga tabela e normave: rreshtin e parë rrezja e të cilit e arrin kurba (një rresht me normë bosh e mban kurorën normale). Tabela dhe **Pjerrësia maksimale relative** (0.5% në fillim) janë vende-mbajtëse, jo një standard: caktojini sipas kritereve tuaja të projektimit. Shtoni ose hiqni rreshta sipas nevojës.
- Korsitë rrotullohen rreth boshtit qendror. Para kurbës, korsia e jashtme sheshohet mbi **tranzicionin e daljes** (kurora normale ÷ e × tranzicioni), pastaj mbi **tranzicionin** (gjerësia e korsisë × e ÷ gradienti) korsia e jashtme vazhdon të rrotullohet deri sa e gjithë rruga zbret me e nga ana e brendshme; dy të tretat e tranzicionit shtrihen para kurbës dhe një e treta mbi të. Pas kurbës ndodh e kundërta.
- Një bankinë në anën e ulët nuk është kurrë më e sheshtë se korsia e saj; në anën e lartë mban pjerrësinë e vet (rrokulliset).
- Tabela nën të liston rrezen, normën, tranzicionin dhe daljen e çdo kurbe, dhe ku fillon dhe mbaron superelevimi i plotë. **Diagrami i superelevimit** vizaton pjerrësitë tërthore të të dy korsive përgjatë stacioneve (korsia e majtë me vijë të plotë, e djathta me vijë të ndërprerë).
- Një kurbë shumë e shkurtër për të arritur superelevimin e plotë, ose dy kurba tranzicionet e të cilave mbivendosen, thuhet në një kuti mbi tabelë.

Prerjet, vëllimet, pamja 3D dhe fletët tregojnë të gjitha rrugën e prirur. Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën.

## Objektivat

Një objektiv zhvendos një pikë të një ane të rrugës deri në një vijë: **Kufirin e rrugëzimit** ose **Kufirin e bankinës**, në **Majtas** ose **Djathtas**. Çdo prerje takon vijën në kënd të drejtë me boshtin qendror, duke dalë vetëm në atë anë, kështu që një objektiv djathtas nuk zhvendos kurrë anën e majtë.

| Vendos | Çfarë ndodh aty ku prerja takon vijën |
|---|---|
| **Gjerësi** | Pika ndodhet mbi vijën: korsia (ose bankina) zgjerohet ose ngushtohet deri te ajo, duke mbajtur pjerrësinë e saj tërthore. |
| **Kotë** | Pika merr kotën e vijës aty, në zhvendosjen e vet: pjerrësia tërthore e korsisë (ose bankinës) ndjek. |

Vija mund të jetë një vijë karakteristike (me çfarëdo **Përdorimi** të ketë) ose një vijë e një koridori tjetër: boshti i tij qendror, kufijtë e rrugëzimit, kufijtë e bankinës ose vijat e kontaktit. Vija e një koridori ndjek atë koridor: ndryshoni rrugën tjetër dhe kjo ndjek. CivilCraft ndërton koridorin tjetër të parin; dy koridore që do të synonin njëri-tjetrin në një lak refuzohen në njërën anë, dhe tabela thotë cila.

1. Zgjidh aksin dhe ndiz koridorin e tij.
2. Nën **Objektivat**, kliko {{ui:Shto një objektiv}}.
3. Zgjidh **Anën**, **Pikën**, çfarë **Vendos** dhe **Te vija**. Çdo ndryshim është një hap zhbërjeje.

**Rezultati** thotë në sa prerje u arrit vija. Prerjet që nuk e arrijnë (përtej skajeve të saj, ose aty ku është pas boshtit qendror) mbajnë vlerat e montimit. Një vijë që fshihet e lë koridorin siç ishte para objektivit, dhe tabela e thotë këtë. Një anë mund të ketë një objektiv gjerësie dhe një objektiv kote për çdo pikë.

## Ndërto çdo anë nga pjesët

Ndiz **Ndërto çdo anë nga pjesët** nën cilësimet e koridorit. Çdo anë ka atëherë listën e vet, nga boshti qendror jashtë: korsi, bankinë, kanal ujërash, bordurë, shirit mbjelljeje, trotuar dhe, në fund, pjerrësia anësore deri në terren (me raportet e veta të gërmimit dhe të mbushjes). Nisuni nga {{ui:Rrugë rurale}} ose {{ui:Rrugë urbane}}, shtoni dhe hiqni pjesë, zhvendosini me shigjetat, dhe {{ui:Kopjo}} një anë në tjetrën. Çdo ndryshim është një hap zhbërjeje.

Pjerrësia tërthore është rënia larg rrugës, kështu që një trotuar që kulloset drejt rrugës është negativ. Një bordurë është një faqe me lartësinë që jepni, një majë me gjerësinë që jepni dhe një zbritje opsionale në pjesën e pasme. Superelevimi kthen çdo korsi në rreshtin e parë; kanali i ujërave, bordura, shiriti dhe trotuari varen nga skaji i korsive siç janë ndërtuar. Objektivat ende zhvendosin skajin e korsive dhe pjesën e fundit. Prerjet tërthore shënojnë rrjedhën e kanalit të ujërave, majën dhe pjesën e pasme të bordurës, dhe pjesën tjetër. Në një kthesë me spirale, tranzicioni është spirala: kurora e nivelit te TS, superelevimi i plotë te SC.

## Shtresat e rrugës

Një korsi, bankinë, kanal ujërash, shirit mbjelljeje ose trotuar mund të mbajë ndërtimin e vet: nën pjesën, **Shto një shtresë** shton një shtresë me një emër, një material, një trashësi dhe llojin e saj (sipërfaqësore, lidhëse, bazë, nënbazë, mbulesë ose tjetër), nga lart poshtë. Shtresat nuk e zhvendosin sipërfaqen e rrugës (maja e saj është sipërfaqja e projektimit); çdo shtresë shtrihet nën pjesën e vet, me thellësinë e matur drejt poshtë. Prerjet tërthore vizatojnë fundin e çdo shtrese si vijë të ndërprerë, dhe {{ui:Shtresat e rrugës: sasitë}} liston sipërfaqen në plan dhe vëllimin e çdo shtrese (sipërfaqja përgjatë koridorit nga prerjet e tij, vëllimi = sipërfaqja × trashësia). Eksporti IFC e shkruan çdo shtresë si elementin e vet me trashësinë dhe materialin e saj (shih [Eksporti dhe importi IFC](topic:ifc)). Trashësia që shkruani është e juaja: CivilCraft nuk i dimensionon rrugëzimet.

## Çfarë nuk është ndërtuar ende

Objektivat për pjerrësinë e kontaktit nuk janë ende të disponueshëm. Për një koridor që ndryshon përgjatë rrugës, me të majtën dhe djathtën të ndara, përdorni [Shabllonet e koridorit](topic:corridor-templates). Shih [Ç'nuk është ndërtuar ende](topic:not-built-yet).
