---
title: Vijat karakteristike
summary: Vizatoni vija 3D që i nivelloni kulm për kulm, bëni zhvendosje me shkallë të tyre dhe përdoreni si vija thyerjeje të terrenit ose si platforma me pjerrësi në projekt.
keywords: hark, kurbë, rreze, hark 3d, helikë, bordurë e lakuar, mbivendosje pjerrësie, mbivendosje kote, shigjeta pjerrësie, vijë karakteristike, pjerrësi, kotë, zhvendosje me shkallë, zhvendosje, vijë thyerjeje, bordurë, kanal, berm, platformë me pjerrësi, dritë dite, nivelim, polivijë 3d
from: d55b25fb
---

Një vijë karakteristike është një vijë me një kotë në çdo kulm: një bordurë, një vijë rrjedhjeje kanali, maja e një berme, skaji i një platforme me pjerrësi. Ju vendosni kotat e saj me numër ose me pjerrësi, e kopjoni anash me një hap lart ose poshtë, dhe zgjidhni çfarë bëjnë sipërfaqet me të.

## Vizatoni një

1. Zgjidhni **Sipërfaqja** › {{ui:More}} › {{ui:Feature line}}, ose shtypni {{key:L}}.
2. Klikoni kulmet e saj në planimetri. Një klik mbi një pikë rilevimi merr vendin dhe kotën e pikës; kudo tjetër kulmi i jep kotën e terrenit ekzistues atje.
3. Shtypni {{key:Enter}} për të përfunduar një vijë të hapur, ose klikoni sërish kulmin e parë për ta mbyllur.

Vija e re zgjidhet dhe fillon si vijë thyerjeje e terrenit ekzistues, e shtrirë mbi terren.

## Harqet

Një segment mund të jetë hark në plan, kur skajet e tij janë në kota të ndryshme: një kthesë bordure, një kanal i lakuar, një rampë që kthehet. Pjerrësia e tij shtrihet në mënyrë të barabartë përgjatë harkut, dhe gjatësia e tij matet përgjatë kurbës.

- **Gjatë vizatimit:** shtypni {{key:C}} (në ekran prekjeje, {{ui:Arc}} në shiritin mbi planimetri) për të ndezur harqet. Pas një kulmi, klikoni një pikë në kurbë, pastaj klikoni ku mbaron harku. Shtypni {{key:C}} sërish për segmente të drejta. {{key:Backspace}} e heq fillimisht pikën në kurbë.
- **Më vonë:** te **Vetitë**, shkruani një rreze dhe drejtimin e kthimit në kutinë **Hark** të kulmit, për shembull `50 L` ose `50 R` (majtas ose djathtas kur ecni përgjatë vijës), dhe shtypni {{key:Enter}}. Zbrazeni kutinë për ta bërë segmentin të drejtë përsëri. Një rreze më e vogël se gjysma e segmentit refuzohet.

Vija e zgjedhur tregon rrezen e çdo harku pranë pjerrësisë së tij. **Gjatësia** matet përgjatë harqeve në plan; **Gjatësia 3D** numëron edhe ngritjen dhe rënien. Zhvendosjet me shkallë i ruajnë harqet: një hark në anën e jashtme të një kthese zgjerohet, ai në anën e brendshme ngushtohet, dhe një zhvendosje që kalon qendrën e harkut refuzohet.

Sipërfaqet, pamja 3D, DXF dhe DWG e marrin çdo hark si copa të shkurtra të drejta që qëndrojnë brenda 0.01 nga kurba. LandXML i mban si harqe (shih **Harqet në skedarë të tjerë** më poshtë).

## Vendosni kotat dhe pjerrësitë

**Vetitë** liston kulmet me distancën e tyre përgjatë vijës, **Kotën** e tyre dhe **Pjerrësinë deri te tjetra** (në përqind). Shkruani njërën prej tyre dhe shtypni {{key:Enter}}:

- Një kotë lëviz vetëm atë kulm.
- Një pjerrësi vendos kotën në skajin tjetër të segmentit të saj; kulmet pas tij mbeten aty ku janë, kështu që pjerrësia e segmentit të radhës ndryshon.

Gjithashtu te **Vetitë**:

| Veprimi | Çfarë bën |
|---|---|
| **Ngre ose ul të gjitha me** | Shton lartësinë që shkruani në çdo kulm. |
| {{ui:Elevations from the ground}} | Vendos çdo kulm përsëri në terrenin ekzistues (kulmet jashtë sipërfaqes e mbajnë kotën e tyre, dhe listohen). |
| {{ui:One grade, first to last}} | Mban kotat e parë dhe të fundit dhe vendos kulmet ndërmjet në një pjerrësi të barabartë. |

Vija e zgjedhur tregon kotat e saj te kulmet dhe pjerrësitë përgjatë segmenteve në planimetri. Tërhiqni një kulm me {{ui:Select}} për ta zhvendosur; kota e tij mbetet.

## Zhvendosje me shkallë

Te **Zhvendosja me shkallë**, shkruani një **Distancë** (pozitive në të djathtë të drejtimit të vijës, negative në të majtë), pastaj një lartësi (lart ose poshtë me) ose një pjerrësi në përqind, dhe klikoni {{ui:Make the offset line}}. Kopja është një vijë e re karakteristike: për shembull, pjesa e pasme e një borduri 0.5 ft anash dhe 0.5 ft më lart, ose skaji i një kanali 6 ft jashtë me 2 %. Një distancë që do ta paloste kopjen mbi vetveten në një kthesë të ngushtë refuzohet.

## Pjerrësitë dhe kotat në ekran

Shtypni {{key:E}}, ose zgjidhni **Pjerrësitë dhe kotat te vijat karakteristike** te **Shfaqja**, për të parë pjerrësinë e çdo vije karakteristike përgjatë çdo segmenti (me një shigjetë të vogël që tregon poshtë) dhe kotën e saj te kulmet. Ato shfaqen vetëm në ekran: asgjë nuk shtohet në vizatim, dhe PDF, DXF dhe DWG mbeten ashtu si janë. Segmentet e shkurtra dhe kulmet e ngjeshura nuk etiketohen derisa të zmadhoni. Vija e zgjedhur gjithmonë tregon pjerrësitë dhe kotat e veta.

## Në pamjen e profilit

Një vijë karakteristike që pret një aks rrugor shfaqet në pamjen e profilit të atij aksi, me emrin dhe kotën e saj te prerja; vijat që kalojnë pranë mund të shfaqen gjithashtu. Shih [Hartimi i një profili vertikal](topic:profile).

## Çfarë bëjnë sipërfaqet me të

Zgjidhni **Përdor**:

| Përdorimi | Çfarë ndodh |
|---|---|
| Vijë thyerjeje e terrenit ekzistues | Terreni ekzistues kalon nëpër vijë me kotat e saj, si një vijë thyerjeje e vizatuar. |
| Nivelluar në projekt | Një vijë **e mbyllur** bëhet platformë me pjerrësi: sipërfaqja e propozuar brenda saj nivelohet deri te skaji i saj. Ndizni **Dritën e ditës deri në terren** për të nxjerrë pjerrësi prerjeje dhe mbushjeje (horizontale me vertikale 1) nga skaji i saj deri në terren, si bën një platformë; çdo pjerrësi fillon nga kota e vetë skajit atje. |
| Vetëm e vizatuar | Mbetet në planimetri dhe del në DXF, DWG dhe PDF (shtresa C-GRAD-FEAT, polivija 3D), por sipërfaqet e injorojnë. |

Vëllimet, prerjet dhe pamja 3D përfshijnë vijat karakteristike të nivelluara në projekt, si platformat. Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën.

## Ndajeni vijat me ekipin tuaj

Te një vizatim i hapur nga skedarët tuaj në cloud në CadCraft Studio, në një plan ekipi, **Vetitë** e projektit (pa asgjë të zgjedhur) kanë një seksion **Ekipi** me {{ui:Team lines…}}: vijat që ekipi juaj i ka ndarë, secila me revizionin e vet, pa pasur nevojë të zgjidhni së pari një vijë karakteristike. Zgjidhni një vijë për ta ndarë, për të shtyrë një revizion të ri, për të marrë revizionin e ekipit, ose për të ndaluar ndarjen. Jashtë kësaj cilësimi, seksioni thotë çfarë i nevojitet.

## Harqet në skedarë të tjerë

| Skedari | Çfarë i ndodh një vijë karakteristike me harqe |
|---|---|
| Projekt CivilCraft | Mbahet saktësisht. |
| LandXML | Shkruhet si një vijë karakteristike në plan me vija dhe harqe me kotat e tyre, dhe lexohet përsëri me harqet e saj. Një vijë karakteristike nga një program tjetër hyn si **Vetëm e vizatuar**: zgjidhni **Përdor** të saj për ta vendosur në një sipërfaqe. |
| DWG dhe DXF | Një polivijë 3D nuk mban dot një hark, kështu që vija shkruhet si copa të shkurtra brenda 0.01 nga çdo hark. CivilCraft shënon gjithashtu në vizatim cilat copa ishin harqe: kur e hapni vizatimin si vija, {{ui:Feature lines}} i kthen vijat si vija karakteristike me harqet e tyre. Programet e tjera shohin një polivijë 3D të zakonshme. |
