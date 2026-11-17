---
title: Shabllonet e koridorit dhe shabllonet e terrenit
summary: Krijo shabllona të vegjël që riperdoren (bordurë dhe kanal ujërash, trotuar, mur, kanal), ndërto një koridor nga ata sipas stacionit me të majtën dhe të djathtën të ndara, ndaj një aksi rrugor në disa koridore, dhe shtrij shtresa materialesh mbi një terren.
keywords: shabllon, shabllonet, biblioteka e shabllonave, krijimi i shabllonit, prerje tipike, montim, nënmontim, komponentë, kodet e pikave, kushti i fundit, kontakt me terrenin, kanal, mur mbajtës, bordurë, kanal ujërash, trotuar, zona, intervali i stacionit, disa koridore, majtas dhe djathtas, shabllon terreni, mbulesë bimore, rrugëzim, bazë, shtrim, materiale, sasi
from: ce70e58b
---

Një **shabllon** është një prerje e vogël tërthore që e vizatoni një herë dhe e ripërdorni: pika me zhvendosje, pjerrësi dhe kode pikash, dhe komponentë me materiale. Një koridor mund të ndërtohet nga shabllona sipas stacionit, me çdo anë me shabllonet e vet të rrugëzimit dhe kushtin e vet të fundit, dhe të njëjtët shabllona mund të shtrihen mbi një terren.

:::warning
Shabllonet shembull janë vende-mbajtëse për të filluar. Vlerat e tyre nuk janë marrë nga asnjë standard ose agjenci. Një inxhinier duhet të kontrollojë çdo shabllon dhe çdo vlerë që i jepni, para se të përdoret për një projektim.
:::

## Hap shabllonet

Hap {{ui:Sipërfaqe}} › {{ui:Më shumë}} › {{ui:Shabllonet e koridorit…}} (ose shkruaj {{cmd:TEMPLATES}}). Dritarja ka tre lista:

- **Në këtë projekt**: shabllonet që përdorin koridoret dhe shabllonet e terrenit të këtij projekti. Ruhen në skedarin e projektit.
- **Biblioteka ime**: shabllona të mbajtur në këtë shfletues dhe të ofruar në çdo projekt. Përdorni {{ui:Ruaj te Biblioteka ime}} mbi një shabllon projekti për ta mbajtur.
- **Shembuj**: dy korsi me shtresa, bordurë dhe kanal ujërash, trotuar, kontakt me terrenin, kanal, mur mbajtës, mbulesë bimore nën terren, dhe rrugëzim mbi terren. Çdo njëri është i shënuar "Për kontroll nga një inxhinier".

{{ui:Përdor në këtë projekt}} kopjon një shabllon nga biblioteka ose nga shembujt në projekt. {{ui:Eksporto shabllonet e këtij projekti}} i ruan si skedar `.cctemplates.json`, dhe {{ui:Importo një skedar}} lexon një të tillë në projekt dhe në Bibliotekën time. Përdoreni skedarin për të ndarë shabllona ose për t'i zhvendosur në një kompjuter tjetër.

## Krijo një shabllon

{{ui:Shabllon i ri}} (ose {{ui:Redakto}} mbi një shabllon projekti) hap redaktorin e shabllonit. Vizato anën e djathtë, duke dalë nga pika 0,0 e shabllonit; ana e majtë përdor të njëjtin shabllon duke dalë majtas.

1. Jepini një emër dhe një lloj: **Rrugëzim** (shablloni tjetër lidhet në fund të tij), **Kushti i fundit** (takon terrenin) ose **Shabllon terreni**.
2. Shtoni **vlera**: numra të emërtuar, si një gjerësi `w` ose një pjerrësi `s`. Një kuti numri kudo në shabllon merr një numër ose emrin e një vlere; `-t` është vlera `t` e kthyer negative. Një koridor mund t'i japë çdo përdorimi të shabllonit vlerat e veta, kështu që një shabllon bordure shërben për çdo lartësi bordure.
3. Shtoni **pika** me radhë. Secila vendoset nga një pikë më e hershme (ose nga pika 0,0) sipas kufizimit të vet:

| Kufizimi | Vendos pikën |
|---|---|
| Zhvendosje me pjerrësi | Një zhvendosje jashtë dhe një pjerrësi (rritje për vrapim; −0.02 zbret 2%) |
| Zhvendosje dhe ngritje | Një zhvendosje dhe një ngritje |
| Drejt lart ose poshtë | Vetëm një ngritje |
| Pjerrësi anësore deri në terren | Jashtë nga pika e saj deri te terreni, me raportin e prerjes aty ku terreni është mbi të dhe raportin e mbushjes aty ku është poshtë |
| Deri në terren | Një zhvendosje, pastaj drejt lart ose poshtë deri në terren |
| Mur mbajtës | Një mur me trashësinë që jepni: në prerje maja e tij takon terrenin te faqja e rrugës, në mbushje rruga kalon mbi të dhe faqja e jashtme zbret deri në terren |

   Shëno **Maja** për pikat që kalon sipërfaqja e përfunduar. Pika e fundit me maja është vendi ku fillon shablloni i ardhshëm në atë anë. Një **Objektiv** lejon një koridor ta zhvendosë pikën: zhvendosja ose kota e saj vjen nga një vijë.
4. Shtoni **komponentë**: forma të mbyllura nëpërmjet kodeve të pikave (`0` është pika 0,0), secila me një emër, një material dhe një lloj. Sipërfaqet e tyre japin vëllimet.

Vizatimi ndjek çdo ndryshim në shkallë të vërtetë, dhe lista nën të thotë çfarë nuk shkon (një pikë që takon terrenin para fundit, një vlerë që shabllonit i mungon, një komponent pa sipërfaqe). {{ui:Shto në këtë projekt}} ose {{ui:Ruaj}} e mban, si një hap zhbërjeje.

## Ndërto një koridor nga shabllonet

Zgjidh një aks rrugor me koridor dhe, te Vetitë e tij, aktivizo {{ui:Ndërto nga shabllonet sipas stacionit}}. Koridori fillon me shembujt e dy korsive dhe të kontaktit me terrenin në të dy anët.

- **Zonat.** Çdo zonë fillon në një stacion dhe shkon deri te stacioni i zonës tjetër. {{ui:Shto një zonë}} shton një; ndryshoni stacionin e saj të fillimit në kutinë e vet.
- **Majtas dhe djathtas të ndara.** Çdo anë e çdo zone ka listën e vet të **Rrugëzimit**, nga boshti qendror jashtë, dhe **Kushtin e fundit** të vet: kontakt me terrenin, një kanal, një mur, ose çdo shabllon që takon terrenin. Pa kusht fundi, ana takon terrenin te pjerrësitë e prerjes dhe të mbushjes së koridorit. {{ui:Kopjo nga e majta në të djathtën}} kopjon një anë.
- **Vlerat dhe objektivat.** Nën çdo shabllon në një anë, një kuti për çdo vlerë (bosh = vlera e vetë shabllonit) dhe, për një pikë që merr objektiv, vijën e karakteristikës ose vijën e një koridori tjetër që e zhvendos.
- **Nga dhe Deri** e kufizojnë koridorin në një pjesë të aksit.

Prerjet, vijat e planit për çdo kod pike, sipërfaqja e propozuar, vendosja me kunj dhe punimet e tokës ndjekin të gjitha. Vetitë listojnë vëllimin e çdo komponenti për anë dhe zonë (mesatare e sipërfaqeve të fundit përgjatë boshtit qendror). Superelevimi dhe objektivat e skajeve të koridorit nuk përdoren ndërkohë që koridori ndërtohet nga shabllonet.

## Disa koridore në një akset

Nën **Koridoret në këtë aks**, {{ui:Shto një koridor}} shton një koridor në pjesën tjetër të aksit: koridori i parë merr një stacion fundi në mes (ose e mban të vetin), dhe i riu fillon atje me zonën e fundit të shabllonave të koridorit të parë. Çdo koridor ka emrin e vet, gamën e stacioneve, shabllonet dhe punimet e tokës. Fikni një me kutinë e vet {{ui:Aktivizuar}}. Aty ku dy gama mbivendosen, koridori i mëvonshëm nivelon mbi atë të mëparshmin.

## Shabllonet e terrenit

Një shabllon terreni shtrin shtresat e një shablloni mbi një terren nga pika e tij 0,0: një shtresë nën pikën 0,0 hyn në tokë (dheu i sipërm për t'u hequr), një shtresë mbi të qëndron mbi tokë (bazë dhe rrugëzim në një parking). Gjerësitë dhe pjerrësitë nuk kanë rëndësi, vetëm thellësia e çdo komponenti mbi ose nën pikën 0,0.

Hap {{ui:Sipërfaqe}} › {{ui:Më shumë}} › {{ui:Shabllonet e terrenit…}} (ose shkruaj {{cmd:TERRAINTEMPLATES}}); blloku është gjithashtu te Vetitë e projektit. {{ui:Shto një shabllon terreni}} shton një me shembullin e dheut të sipërm. Për secilin zgjidhni:

- **shabllonin** (vlerat e tij mund të ndryshohen për këtë rast),
- **terrenin**: terrenin ekzistues ose sipërfaqen e propozuar,
- **formën** që e pret: të gjithë terrenin, një parcelë, një platformë ose një vijë karakteristike të mbyllur. Disa shabllona terreni mund të përdorin forma të ndryshme mbi të njëjtin terren.

Çdo shtresë liston trashësinë, sipërfaqen në plan dhe vëllimin e saj. Vëllimi është sipërfaqja në plan shumëzuar me trashësinë, ku trashësia matet drejt poshtë; sipërfaqja matet në një rrjet dhe jepet edhe sipërfaqja e shtrirë (e pjerrët). Format vizatohen në plan në shtresën C-TOPO-TMPL. Shabllonet e terrenit nuk e ndryshojnë sipërfaqen e propozuar.

## Materialet dhe sasitë

Blloku i Punimeve të tokës së projektit liston **Materiale nga shabllonet**: çdo komponent koridori dhe çdo shtresë shabllon terreni me vëllimin e vet. {{ui:Dërgo te TakeoffCraft}} i shkruan ato në skedarin e sasive pas gërmimit dhe mbushjes, një artikull për çdo njërin, në jarde kub (projekte në këmbë) ose metra kub.

## Skedarët

Shabllonet, zonat, koridoret shtesë dhe shabllonet e terrenit ruhen në skedarin e projektit. Një projekt që nuk përdor asnjë prej tyre ruhet saktësisht si më parë, dhe versionet e vjetra të CivilCraft-it hapin një projekt që i përdor (ato i injorojnë shabllonet dhe ndërtojnë montimin e vet të koridorit).
