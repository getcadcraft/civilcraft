---
title: Hartimi i një profili gjatësor
summary: Hap pamjen e profilit, nis një profil projektues nga terreni, shto dhe zvarrit PVI, vendos gjatësitë e kurbave vertikale, dhe lexo pjerrësitë, vlerat K dhe pikat më të larta e më të ulëta.
keywords: profil, aks vertikal, pvi, kurbë vertikale, pjerrësi, vlerë k, kreshtë, luginë, bvc, evc, pamje e profilit, kotë përfundimtare, fg, profili i terrenit ekzistues, vijat karakteristike në profil, kryqëzime, i projektuar, bordurë, kanal, etiketa
from: dbb1f32d
---

Çdo aks rrugor ka një profil projektues: një listë PVI (stacion dhe kotë) të lidhura me pjerrësi të drejta, me një kurbë vertikale parabolike simetrike te çdo PVI e brendshme që ka gjatësi. Profili i terrenit ekzistues merret nga sipërfaqja për ty.

## Hap pamjen e profilit

1. Përzgjidh aksin rrugor (kliko me {{ui:Përzgjidh}}).
2. Shtyp {{key:R}}, ose kliko {{ui:Profil gjatësor}} te shiriti i veglave, ose {{ui:Hap pamjen e profilit}} në fund të panelit të djathtë.
   Pamja e profilit hapet nën plan me terrenin ekzistues përgjatë aksit rrugor. Me dy ose më shumë akse rrugore, zgjidh një në listën në të majtë të shiritit të profilit.

Pamja fillon duke treguar gjithë aksin rrugor dhe duke shtrirë kotat për të mbushur panelin; zmadhimi shkruhet në qoshen e poshtme majtas, për shembull "Zmadhimi vertikal 10×".

## Zmadho dhe lëviz profilin

- **Zmadhimi:** rrotullo rrotën e miut (ose prek me dy gishta në trackpad) dhe pamja zmadhohet rreth treguesit. Mbaj {{key:Shift}} për të zmadhuar vetëm stacionet, ose {{key:Alt}} për të zmadhuar vetëm kotat (kjo ndryshon zmadhimin). Me pamjen e profilit të fokusuar, tastet plus dhe minus zmadhojnë në mes.
- **Lëvizja:** zvarrit me butonin e djathtë ose të mesit të miut, ose rrëshqit me dy gishta në trackpad.
- **Përshtat:** kliko dy herë profilin ose shtyp {{key:F}} për të treguar përsëri gjithë aksin rrugor.

Redaktimi i një PVI ruan zmadhimin që zgjodhe; nuk kthehet te përshtatja.

Lëviz treguesin përgjatë profilit: shiriti tregon stacionin, kotat e terrenit dhe të projektit, pjerrësinë dhe hapjen ose mbushjen aty, dhe një pikë ndjek aksin rrugor në plan.

## Fillo profilin projektues

1. Në panelin e djathtë nën **Profilin projektues**, kliko {{ui:Nis nga terreni}}.
   Dy PVI vendosen në terren në dy skajet e aksit rrugor, të lidhura me një pjerrësi të drejtë. Shiriti i statusit thotë "Profili projektues filloi nga terreni në të dy skajet. Ndiz Shto PVI-të dhe kliko për të shtuar ndërprerje pjerrësie; jepu atyre një gjatësi kurbe në tabelë."

Nëse aksi rrugor nuk kalon sipërfaqen, merr mesazhin "Ky aks rrugor nuk ka terren nën të për të nisur." Atëherë shto PVI me klikim (seksioni tjetër).

## Shto PVI-të

1. Shtyp {{key:I}}, ose kliko {{ui:Shto PVI-të}} në shiritin e profilit. Mbetet e shtypur.
2. Kliko në profil aty ku do një ndërprerje pjerrësie. Një PVI shtohet në atë stacion dhe kotë, rrumbullakosur në 0.01, dhe përzgjidhet.
3. Shto sa të duash, pastaj shtyp përsëri {{key:I}} për të ndaluar shtimin.

Një klikim aty ku ka tashmë një PVI refuzohet ("Ka tashmë një PVI te …"). PVI-të qëndrojnë gjithmonë në rendin e stacioneve.

## Kapja gjatë shtimit ose zvarritjes

Butoni **Kapje** në shiritin e profilit është i ndezur që në fillim. Ndërsa është i ndezur, një PVI që shton ose zvarrit bie mbi PVI-në më të afërt, pikën e terrenit, stacionin e PVI ose vijën e terrenit, dhe një etiketë pranë shenjës thotë cilën. Mbaj {{key:Alt}} për një pikë të lirë, kudo.

## Rregullo PVI-të

- **Zvarrit** një PVI në profil për ta zhvendosur. Nuk mund të kalojë fqinjët e saj. Zhvendosja është një hap zhbërjeje.
- **Shkruaj** vlera të sakta në tabelën e PVI në panelin e djathtë: **Stacioni**, **Kota**, **Pjerrësia %** dhe **Kurba L** (gjatësia e kurbës vertikale). Shtyp {{key:Enter}} pas secilës.
- **Zgjidh** një vlerë nga profili: butoni i vogël pranë stacionit ose kotës së një PVI pret një klikim në pamjen e profilit dhe plotëson atë vlerë. Klikimi kapet si te Shto PVI-të; mbaj {{key:Alt}} për një pikë të lirë; {{key:Esc}} anulon.
- **Pjerrësia %** është pjerrësia e tangjentes që nis te ajo PVI dhe shkon deri te tjetra. Shkruarja e saj zhvendos kotën e PVI-së **tjetër** (stacioni i saj nuk lëviz kurrë). Nëse PVI tjetër është e kyçur, zhvendoset kota e PVI-së së mëparshme.
- **Kyç** një PVI me simbolin e bravës në fund të rreshtit të saj. Një PVI e kyçur nuk zvarritet, dhe redaktimi i pjerrësisë nuk e zhvendos. Nëse të dy skajet e një tangjenteje janë të kyçura, pjerrësia e saj nuk mund të ndryshojë: shiriti i statusit e thotë këtë, dhe ti hap fillimisht njërin skaj. Kyçja ruhet në skedar.
- **Hiq** një PVI me x-in në fund të rreshtit, ose përzgjidhe (kliko) dhe shtyp {{key:Delete}}. Kur pamja e profilit ka fokusin, {{key:Backspace}} e heq gjithashtu.

PVI e para dhe e fundit nuk marrin kurrë kurbë.

## Kurbat vertikale

1. Shkruaj një gjatësi në **Kurba L** për një PVI të brendshme, për shembull 200.
2. Kurba vizatohet e qendërzuar te PVI. Profili dhe paneli i djathtë tregojnë llojin e saj (kreshtë ose luginë), L dhe K, stacionet dhe kotat e BVC dhe EVC, dhe pikën e saj të lartë ose të ulët kur ka një brenda kurbës.

K llogaritet nga L (K = L pjesëtuar me ndryshimin algjebrik të pjerrësive, në përqind). Ti shkruan L; shkruarja direkt e K nuk është ende e disponueshme.

Nëse një kurbë vertikale nuk përshtatet, një kuti e kuqe thotë arsyen: hyn mbrapsht në PVI-në ose kurbën para saj, ose përtej PVI-së tjetër, dhe sa hapësirë ka nga ai anë (një kurbë ka nevojë për gjysmën e gjatësisë së saj në secilën anë të PVI-së së vet). Butoni i saj vendos **kurbën më të gjatë që përshtatet**, me K-në e saj, si një hap ({{key:Mod+Z}} e zhbën). Ose largo PVI-të nga njëra-tjetra.

## Lexo të dhënat

Nën tabelën e PVI, një listë jep çdo pjerrësi në përqind ("Pjerrësia 1: +1.25%") dhe çdo kurbë, për shembull "Kreshtë te 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", pastaj "Pika e lartë 1+62.40, 254.12".

Nëse PVI-të nuk arrijnë në të dy skajet e aksit rrugor, një shënim e thotë këtë. Një koridor ndërtohet vetëm aty ku profili dhe aksi mbivendosen.

## Vijat karakteristike në profil

Vijat karakteristike shfaqen edhe në pamjen e profilit, kështu mund të shohësh një bordurë, një kanal ose majën e një muri kundrejt profilit të rrugës.

- Aty ku një vijë karakteristike **kryqëzon** aksin rrugor, profili tregon një romb të vogël në atë stacion dhe kotë, me emrin e vijës dhe kotën e saj aty (kota e vetë vijës, llogaritur përgjatë segmentit që kryqëzon).
- Shkruaj një distancë te {{ui:Përbri brenda}} për të vizatuar gjithashtu vijat karakteristike që **shtrihen përbri** aksit rrugor brenda asaj distance, si vija me pika në kotat e tyre. Bosh ose 0 tregon vetëm kryqëzimet.
- Shenjat dhe etiketat ndjekin çdo ndryshim: zhvendos një kulm, shkruaj një pjerrësi ose ngrit vijën, dhe profili tregon kotat e reja menjëherë.
- Kliko rombin e një kryqëzimi për të përzgjedhur atë vijë karakteristike; vija e përzgjedhur vizatohet me ngjyrën e theksimit.
- {{ui:Vijat karakteristike}} te shiriti i profilit i fsheh ose i shfaq të gjitha. Të dy cilësimet ruhen me projektin.

Shih [Vijat karakteristike](topic:feature-lines).

## Më tej

- [Shtrirja e një koridori rrugor](topic:corridor) përgjatë aksit rrugor dhe këtij profili.
- Profili shkruhet në LandXML me aksin rrugor; shih [Shkëmbimi LandXML](topic:landxml).
