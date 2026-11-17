---
title: Nivelimi për peizazh
summary: Platforma, bermë, kanale drenazhimi dhe nivelim i lirë me kota pikësore dhe izoipsa që tërhiq, prerje dhe mbushje në kohë reale, analizë e pjerrësisë, shigjeta rrjedhjeje dhe grumbullim uji, të gjitha në sipërfaqen e propozuar të CivilCraft.
keywords: mur mbajtës, mure mbajtëse, anë vertikale, mur në vend të pjerrësisë, pjerrësi për anë, nivelim, nivelim peizazhi, platformë, teracë, bermë, tumë, kanal drenazhimi, kotë pikësore, kotë pike, izoipsa, redakto izoipsat, prerje dhe mbushje, punë dheu, analizë pjerrësie, qasshmëri, pjerrësi e thellë, shigjeta rrjedhjeje, drenazh, grumbullim, pellgje
from: e1559eb9
---

Gjithçka këtu niveleohet në **sipërfaqen e propozuar** me të njëjtin nivelim si platformat dhe korridoret. **Terreni ekzistues** nuk ndryshohet kurrë, dhe Punë dheu i llogarit të gjitha. Menuja Nivelimi është te grupi Peizazh.

## Platformat

{{ui:Nivelimi}} › {{ui:Platformë}}, pastaj kliko cepat dhe shtyp {{key:Enter}}. Platforma fillon në lartësinë mesatare të terrenit nën të; shkruaj një **Kotë** për ta vendosur, ose e zbraz për ta ndjekur përsëri terrenin. Një **Rënie** në % dhe **Bie drejt** në gradë (0 = lindje, 90 = veri) e pririn. Anët e saj niveleohen deri te terreni me **Pjerrësinë e prerjes** dhe **Pjerrësinë e mbushjes** (horizontalisht deri në 1).

## Pjerrësi për anë dhe mure mbajtëse

Te **Anët dhe muret mbajtëse** në Vetitë e një platforme, një bermë, çdo anë mund të niveleohet në mënyrën e saj. Ana 1 shkon nga cepi i parë që klikove te i dyti, ana 2 nga i dyti te i treti, e kështu me radhë.

- **Të gjitha anët**: **Me pjerrësi** përdor pjerrësitë e prerjes dhe mbushjes më lart në çdo anë; **Vertikale: muret mbajtëse** vendos një mur në çdo anë.
- Për çdo anë: **Pjerrësi më lart**, **Pjerrësitë e veta** (shkruaj një pjerrësi prerjeje dhe mbushjeje për atë anë) ose **Vertikale (mur mbajtës)**.
- Shkruaj një pjerrësi si `3` ose `3:1` (horizontalisht deri në 1 vertikalisht), `33%` ose `18.4°`; shfaqet si H:1. **Pjerrësia e prerjes** dhe **Pjerrësia e mbushjes** të platformës marrin të njëjtën gjë.
- Një anë vertikale nuk ka skarpatë: një mur mbajtës shtrihet përgjatë skajit, nga platforma poshtë te terreni ekzistues (në mbushje) ose nga terreni poshtë te platforma (në prerje). **Trashësia e murit** (0.3 m ose 1 ft në fillim) është sa larg hapet terreni nga skaji i platformës te terreni ekzistues. Vëllimet e prerjes dhe mbushjes nuk përfshijnë skarpatën që ajo anë nuk e ka më.
- Aty ku një mur takon një anë me pjerrësi, pjerrësia përkulet rreth fundit të murit; dy mure takohen në një këndore.
- Nën fushat: gjatësia e mureve, sipërfaqja e ekspozuar e fasadës (lartësi × gjatësi), lartësia më e lartë dhe mesatare.

Plani vizaton fasadën e jashtme të çdo muri me vija të shkurtra përgjatë saj dhe lartësinë e tij në të dy skajet dhe në pikën më të lartë (në shtresën e mureve mbajtës, që shkon edhe në DXF dhe DWG). Pamja 3D i shfaq muret si trupa të ngurtë (Shfaq › Muret mbajtëse), dhe eksportet GLB, OBJ dhe USD i përfshijnë. Seksionet përgjatë skajit tregojnë hapin.

**Paralajmërimet** (në Vetitë, dhe në panelin Problemet): një mur më i lartë se **Paralajmëro mbi një lartësi muri prej** (1.0 m ose 3.3 ft në fillim) "mund të kërkojë një mur të projektuar ose leje; kontrollo rregullat vendore", dhe, kur shkruan **Pjerrësinë më të thellë që mban toka**, çdo anë me pjerrësi prerjeje ose mbushjeje më të thellë se ajo. Ato janë paralajmërime: nivelimi ndërtohet ende. Çdo ndryshim është një hap për {{key:Mod+Z}}.

## Bermat

{{ui:Nivelimi}} › {{ui:Bermë}}: një tumë, maja e së cilës është **Lartësia** e saj mbi terrenin mesatar nën të, me anët e nivelura.

## Kanalet e drenazhimit

{{ui:Nivelimi}} › {{ui:Kanal drenazhimi}}, pastaj kliko përgjatë kanalit **në drejtimin ku rrjedh uji** dhe shtyp {{key:Enter}}. Cakto **Thellësinë**, **Gjerësinë e fundit** (0 për V) dhe **Pjerrësinë e anës**. Pa **Rënie**, fundi i tij ndjek terrenin, me thellësinë e tij nën të, dhe nuk shkon kurrë lart; shkruaj një rënie për t'i dhënë një të qëndrueshme nga fillimi i tij.

## Kota pikësore dhe izoipsa

1. {{ui:Nivelimi}} › {{ui:Zonë nivelimi}}: kliko konturin e zonës që dëshiron ta formosh.
2. {{ui:Nivelimi}} › {{ui:Kotë pike}}: kliko brenda zonës. Shkruaj lartësinë e saj te Vetitë, ose përdor butonat ▲ ▼.
3. {{ui:Nivelimi}} › {{ui:Redakto një kontur}}: kliko një izoipsë brenda zonës për ta marrë si vijë që mund ta ri-formosh.

Zgjidh një kotë ose një izoipsë dhe **tërhiqe** (ose pikat e saj) në plan: sipërfaqja ndjek kur e lë, si një hap zhbërjeje. Brenda zonës terreni rindërtohet nga skaji i tij (aty ku takon terrenin ekzistues), kotat pikësore dhe izoipsat e redaktuara.

## Prerja dhe mbushja, në kohë reale

Vetitë e çdo objekti nivelimi shfaqin **Prerjen** dhe **Mbushjen** e tij dhe të gjithë vendit, me metodën e rrjetës që përdor Punë dheu, ndërsa e ndryshon. Problemet (jashtë sipërfaqes, një kontur që kryqëzohet me veten) listohen aty.

## Kontrollet e nivelimit

Te seksioni **Kontrollet e nivelimit** në të majtë:

- **Analiza e pjerrësisë** ngjyros sipërfaqen sipas pjerrësisë: deri te kufiri i butë, midis, dhe më e thellë se kufiri i thellë (5 % dhe 33.3 % në fillim: 1:20 e zakonshme për rrugët e qasshme dhe 1:3 për prerjen me kosë). Legjenda thotë sa nga sipërfaqja bie në secilën. Zonat e thella shtypen edhe në fletë.
- **Shigjetat e rrjedhjes dhe grumbullimi** vizaton nga cili drejtim rrjedh uji dhe rrethon çdo vend ku do të grumbullohej, me thellësinë e tij; seksioni thotë sa vende janë, më i thelli dhe sa ujë mbajnë.

Kontrollet lexojnë sipërfaqen e propozuar kur diçka është niveluar, përndryshe terrenin ekzistues.
