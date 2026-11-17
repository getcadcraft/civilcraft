---
title: Projekto një profil vertikal
summary: Hap pamjen e profilit, nis një profil projekti nga terreni, shto dhe zhvendos PVI-të, vendos gjatësitë e lakoreve vertikale, dhe lexo pjerrësitë, vlerat K dhe pikat e larta e të ulëta.
keywords: profil, aks vertikal, pvi, lakore vertikale, pjerrësi, vlerë k, kreshtë, gropë, bvc, evc, pamje profili, nivel përfundimtar, fg, profili i terrenit ekzistues, vijat karakteristike në profil, kryqëzime, projektuar, bordurë, kanal, etiketa
from: e9182bfa
---

Çdo aks ka një profil projekti: një listë PVI-sh (stacion dhe kotë) të lidhura me pjerrësi të drejta, me një lakore vertikale parabolike simetrike në çdo PVI të brendshme që ka një gjatësi. Profili i terrenit ekzistues merret nga sipërfaqja automatikisht.

## Hap pamjen e profilit

1. Zgjidh aksin (kliko me {{ui:Përzgjidh}}).
2. Shtyp {{key:R}}, ose kliko {{ui:Profil gjatësor}} te shiriti i veglave, ose {{ui:Hap pamjen e profilit}} në fund të panelit të djathtë.
   Pamja e profilit hapet nën planimetri me terrenin ekzistues përgjatë aksit. Me dy ose më shumë akse, zgjidh një në listën në të majtë të shiritit të profilit.

Pamja shfaq gjithmonë të gjithë aksin dhe i shtrin kotat për të mbushur panelin; ekzagjerimi shtypet në këndin e poshtëm majtas, për shembull "Ekzagjerimi vertikal 10×". Nuk ka zmadhim dhe lëvizje pamjeje.

Lëviz treguesin përgjatë profilit: shiriti tregon stacionin, kotat e terrenit dhe të projektit, pjerrësinë dhe prerjen ose mbushjen aty, dhe një pikë ndjek aksin në planimetri.

## Nis profilin e projektit

1. Në panelin e djathtë, nën **Profili i projektit**, kliko {{ui:Nis nga terreni}}.
   Dy PVI vendosen në terren në dy skajet e aksit, të lidhura me një pjerrësi të drejtë. Shiriti i statusit thotë "Profili i projektit nisi nga terreni në të dy skajet. Ndiz Shto PVI-të dhe kliko për të shtuar thyerje pjerrësie; jepu një gjatësi lakoreje në tabelë."

Nëse aksi nuk pret sipërfaqen, merr "Ky aks nuk ka terren nën të nga ku të nisë." Atëherë shto PVI-të duke klikuar (seksioni tjetër).

## Shto PVI-të

1. Shtyp {{key:I}}, ose kliko {{ui:Shto PVI-të}} te shiriti i profilit. Mbetet e shtypur.
2. Kliko në profil aty ku dëshiron një thyerje pjerrësie. Një PVI shtohet në atë stacion dhe kotë, e rrumbullakosur në 0.01, dhe përzgjidhet.
3. Shto sa të duash, pastaj shtyp {{key:I}} përsëri për të ndaluar shtimin.

Një klik aty ku ka tashmë një PVI refuzohet ("Ka tashmë një PVI në …"). PVI-të mbeten gjithmonë në rend stacioni.

## Rregullo PVI-të

- **Tërhiq** një PVI në profil për ta zhvendosur. Nuk mund të kalojë fqinjët e saj. Zhvendosja është një hap zhbërjeje.
- **Shkruaj** vlera të sakta në tabelën e PVI-ve në panelin e djathtë: **Stacioni**, **Kota** dhe **Gjatësia e lakores L**. Shtyp {{key:Enter}} pas çdo vlere.
- **Hiq** një PVI me x në fund të rreshtit të saj, ose përzgjidhe (kliko) dhe shtyp {{key:Delete}}. Kur pamja e profilit ka fokusin, {{key:Backspace}} gjithashtu e heq.

PVI-ja e parë dhe ajo e fundit nuk marrin kurrë lakore.

## Lakoret vertikale

1. Shkruaj një gjatësi te **Gjatësia e lakores L** për një PVI të brendshme, për shembull 200.
2. Lakorja vizatohet e qendërzuar në PVI. Profili dhe paneli i djathtë tregojnë llojin e saj (kreshtë ose gropë), L dhe K, stacionet dhe kotat BVC dhe EVC, dhe pikën e saj të lartë ose të ulët kur ka një brenda lakores.

K llogaritet nga L (K = L pjesëtuar me ndryshimin algjebrik të pjerrësive, në përqind). Ti shkruan L; shkrimi i K drejtpërdrejt nuk është akoma i mundur.

Nëse një lakore vertikale nuk përshtatet, një kuti e kuqe thotë pse: ajo hyn mbrapsht në PVI-në ose lakoren para saj, ose kalon PVI-në tjetër, dhe sa hapësirë ka në atë anë (një lakore ka nevojë për gjysmën e gjatësisë në secilën anë të PVI-së së vet). Butoni i saj vendos **lakoren më të gjatë që përshtatet**, me K-në e saj, si një hap ({{key:Mod+Z}} e zhbën). Ose largo PVI-të.

## Lexo të dhënat

Nën tabelën e PVI-ve, një listë jep çdo pjerrësi në përqind ("Pjerrësia 1: +1.25%") dhe çdo lakore, për shembull "Kreshtë në 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", pastaj "Pika e lartë 1+62.40, 254.12".

Nëse PVI-të nuk arrijnë të dy skajet e aksit, një shënim e thotë këtë. Një korridor ndërtohet vetëm aty ku profili dhe aksi mbivendosen.

## Vijat karakteristike në profil

Vijat karakteristike shfaqen edhe në pamjen e profilit, kështu që mund të shohësh një bordurë, një kanal ose majën e një muri kundrejt profilit të rrugës.

- Aty ku një vijë karakteristike **kryqëzon** aksin, profili tregon një romb të vogël në atë stacion dhe kotë, me emrin e vijës dhe kotën e saj aty (kota e vetë vijës, e llogaritur përgjatë segmentit që kryqëzon).
- Shkruaj një distancë te {{ui:Përbri brenda}} për të vizatuar edhe vijat karakteristike që **kalojnë përbri** aksit brenda kësaj distance, si vija me pika në kotat e tyre. Bosh ose 0 shfaq vetëm kryqëzimet.
- Shenjat dhe etiketat ndjekin çdo ndryshim: zhvendos një kulm, shkruaj një pjerrësi ose ngri vijën, dhe profili tregon kotat e reja menjëherë.
- Kliko rombin e një kryqëzimi për të përzgjedhur atë vijë karakteristike; vija e përzgjedhur vizatohet me ngjyrën e theksit.
- {{ui:Vijat karakteristike}} te shiriti i profilit i fsheh ose shfaq të gjitha. Të dy cilësimet ruhen me projektin.

Shih [Vijat karakteristike](topic:feature-lines).

## Më pas

- [Shtrijë një korridor rrugor](topic:corridor) përgjatë këtij aksi dhe këtij profili.
- Profili shkruhet në LandXML me aksin; shih [Shkëmbe LandXML](topic:landxml).
