---
title: Vendosja e parkingut
summary: Vendosni vende parkimi, korsi, vende për persona me aftësi të kufizuara dhe furgona, dhe ishuj brenda një konture; nivelloni parkingun me pjerrësi drejt kullave kundrejt terrenit ekzistues, pastaj shtroni dhe mbilleni. Gjithashtu i disponueshëm për një asistent.
keywords: parkim, vend parkimi, korsi, aksesibël, ada, furgon, ishull, kullues, pjerrësi, nivelim, prerje, mbushje, shtrim, pllaka, mbjellje, pemë, terren, re pikash, mcp, asistent
from: 06c14da9
---

Vendosni një parking brenda një parcele, platforme ose vije karakteristike të mbyllur, dhe merrni numërimet, nivelimin dhe shtrimin në një hap.

## Vendoseni

1. Përzgjidhni një parcelë, një platformë ose një vijë karakteristike të mbyllur në plan.
2. Hapni **Sipërfaqe, Më shumë, Parkingu...**
3. Zgjidhni rregullat, këndin e vendit të parkimit (90, 75, 60, 45, 30 gradë ose paralel) dhe korsitë një-drejtimëshe ose dy-drejtimëshe. Madhësitë e vendit, të korsisë dhe të ishullit fillojnë nga tabela dhe çdo një mund të shkruhet mbi to.
4. Zgjidhni **Vendos**.

Rreshtat shtrihen përgjatë skajit të konturës që jep më shumë vende (ose sipas këndit që shkruani). Një vend numërohet vetëm nëse shtrihet tërësisht brenda konturës. Aty ku ka vend për një rresht dhe një korsi, shtohet një brez me një rresht. Dritarja liston hapësirat, hapësirat për persona me aftësi të kufizuara dhe për furgona, ishujt, kullues dhe sipërfaqen për hapësirë; plani i tregon vendet e parkimit, hapësirat për persona me aftësi të kufizuara me korsitë e tyre të hijëzuara të aksesit, ishujt, vijat qendrore të korsive dhe kullues në shtresat e tyre (C-PARK-...), kështu që arrijnë në PDF, DXF dhe DWG.

## Hapësirat për persona me aftësi të kufizuara

Me rregullat e Shteteve të Bashkuara, numërimi ndjek tabelën 208.2 të Standardeve ADA 2010 për hapësirat e parashikuara (një në gjashtë, rrumbullakuar lart, është një hapësirë për furgon), të vendosura më afër këndit të parë të konturës (hyrjes), secila me një korsi aksesi; dy ndajnë një. Një vend më i ngushtë se gjerësia për persona me aftësi të kufizuara, ose një pjerrësi më e madhe se 1:48 te hapësirat për persona me aftësi të kufizuara, shfaqet si problem. **Këta numra u shkruan nga standardi siç i mbanim mend dhe nuk janë kontrolluar me standardin e printuar.** Madhësitë tipike të vendeve dhe korsive vijnë nga udhëzuesit e projektimit të parkingjeve dhe gjithashtu nuk janë kontrolluar. Kontrolloni të dyja, dhe kodin tuaj lokal, përpara se t'u besoni. Zgjidhni **Personalizuar** për të futur numrin tuaj të hapësirave për persona me aftësi të kufizuara.

## Pjerrësitë drejt kullave, prerja dhe mbushja

Përveç nëse e çaktivizoni, parkingu bëhet një zonë nivelimi në hapësirën e Peizazhit. Kullues vendosen në vijat qendrore të korsive, rreth çdo 100 feet (30 m); sipërfaqja ngrihet nga çdo kullues me pjerrësinë që jepni (1.5 për qind në fillim), kështu që çdo pikë bie drejt kulluesit më të afërt. Niveli zgjidhet që prerja dhe mbushja e parkingut të balancohen mbi terrenin ekzistues. Terreni ekzistues është sipërfaqja ekzistuese e projektit, që mund të vijë nga pikat e matjes, LandXML, një re pikash lidar ose skanimi e kthyer në sipërfaqe, ose konturet. Dritarja shfaq vlerësimin e prerjes dhe mbushjes; vëllimet e vetë projektit japin shifrën e saktë më vonë. Zona e nivelimit e mban skajin e saj mbi terrenin ekzistues, kështu që aty ku sipërfaqja e re ndryshon nga terreni te skaji, del një shkallë, dhe dritarja tregon sa e madhe është.

## Shtrimi dhe mbjellja

I gjithë perimetri merr një shtrim me pllaka (një model me shtrirje që mund ta ndryshoni te Peizazh, Shtrim i ngurtë), dhe çdo ishull merr një shtrat shkurresh dhe, kur është mjaft i gjerë, një pemë, nga lista e bimëve. Pas kësaj, çdo gjë është një objekt i zakonshëm i Peizazhit: redaktojeni, ose zgjidhni **Vendos përsëri** për të zëvendësuar atë që ka krijuar parkingu. Heqja e parkingut heq atë që ka krijuar.

## Nga një asistent

I njëjti parking mund të kërkohet përmes MCP: `parking_layout` shfaq pamjen paraprake, `parking_build` shkruan, `parking_remove` heq parkingun. Kërkojeni me emrin e parcelës ose dërgoni konturën.

## Çfarë nuk bëhet

Nuk kontrollohet nëse korsitë arrijnë te një rrugë. Shtrimi mbulon tërë konturën, kështu që sipërfaqja e tij përfshin edhe ishujt. Zgjedhjet e materialit të shtrimit nga Biblioteka dhe një tip Biblioteke për vendet nuk janë ndërtuar; modeli i shtrimit është ai i Shtrimit të ngurtë. Nuk janë ndërtuar rregullat e ndonjë vendi tjetër.
