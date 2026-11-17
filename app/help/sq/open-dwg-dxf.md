---
title: Hap një DWG ose DXF si vijëzim
summary: Hap vijat e vizatimit në planimetri, shtresë për shtresë, përdor konturet, polivijat 3D dhe konturet e mbyllura për sipërfaqen, dhe kthe blloqet e pikave të tij në pika rilevimi.
keywords: kontroll rilevimi, kota në tekst, dwg, dxf, cad, vizatim, vijëzim, kontur, vija e thyerjes, kufi, polivijë, polivijë 3D, shtresa, hartë bazë, topo, vizatim rilevimi, blloqe, referenca blloqesh, pika rilevimi nga blloqet, atribute, blloqe pikash, pika e futjes
from: da0f4c58
---

Një rilevim topografik shpesh vjen si vizatim: konturet si polivija në kotën e tyre, vijat e thyerjes si polivija 3D, kufiri i vendit si një polivijë e mbyllur. CivilCraft e hap **hapësirën e modelit** të vizatimit si shtresa në planimetri, dhe mund t'i kthejë ato vija drejtpërdrejt në sipërfaqe.

## Hap vizatimin

1. Kliko {{ui:Vijat e vizatimit}} te grupi **{{ui:Sipërfaqe}}** (ose {{ui:Hap}}, ose lësho skedarin në planimetri) dhe zgjidh një skedar `.dwg` ose `.dxf`. Vizatimi lexohet në këtë kompjuter; asgjë nuk ngarkohet. Lexohen DWG nga 2000 deri 2018 dhe DXF ASCII.
2. Dialogu **Vijat e vizatimit** liston shtresat e vizatimit që përmbajnë vija, forma të mbyllura ose pika, dhe nëse kanë **kota**. Shtresat që janë të fikura në vizatim fillojnë pa shenjë. Tekstet, vijëzimet, përmasat dhe objektet e tjera që nuk janë vija numërohen dhe lihen jashtë (dialogu thotë cilat).
3. Kontrollo **Njësitë e vizatimit**. Kur vizatimi tregon njësitë e veta, CivilCraft i konverton ato në njësitë e projektit (milimetra në metra, metra në këmbë, inç në këmbë). Një vizatim në këmbë lexohet si US survey feet pa shkallëzim: ato ndryshojnë me 2 pjesë për milion, dhe shkallëzimi i koordinatave state plane me këtë do t'i zhvendoste me këmbë. Kur vizatimi nuk i tregon njësitë e veta, numrat e tij lexohen në njësitë e projektit; zgjidh njësitë e duhura në listë nëse nuk janë.
4. Te **Përdor për sipërfaqen**, zgjidh çfarë i jep secila shtresë sipërfaqes (ose lëre **Vetëm shfaqe**). Shtresat me emra si konturet (TOPO, CONT, CNTR) që kanë kota fillojnë si vija thyerjeje.
5. Kliko {{ui:Shto}}. Shtresat shfaqen nën **Shtresat GIS** në panelin e majtë; çdo përdorim futet në sipërfaqe. Çdo pjesë është një hap i vetë: {{key:Mod+Z}} i heq një nga një.

## Çfarë mund të japë secili lloj shtrese

| Shtresa përmban | Përdor për sipërfaqen |
|---|---|
| Konturet (polivija në një kotë) | Vija thyerjeje në kotën e vetë vijave, ose në fushën ELEV |
| Polivija 3D | Vija thyerjeje në kotat e tyre |
| Një kontur i mbyllur | Kufiri i sipërfaqes (forma më e madhe e mbyllur, ose ajo që ke zgjedhur) |
| Pika me kotë | Pika rilevimi, të përshkruara me emrin e shtresës |
| Vija në kotën 0 (vijëzim planimetrik) | Asgjë: mbetet në planimetri si vizatim bazë |

Një vizatim që CivilCraft e ka shkruar mban vijat e veta karakteristike si polivija 3D që kujtojnë harqet e tyre. Dialogu atëherë shfaq **Vijat karakteristike**: lëre të zgjedhur për t'i kthyer si vija karakteristike me harqet dhe përdorimet e tyre (një hap zhbërjeje), ose hiqe zgjedhjen për t'i lexuar si vija vizatimi si çdo shtresë tjetër.

Më vonë, përdor {{ui:Përdor për sipërfaqen}} në menunë e shtresës nën **Shtresat GIS** për të bërë të njëjtën gjë me një shtresë që e ke vetëm shfaqur.

## Pikat e rilevimit nga blloqet

Vizatimet e rilevimit shpesh mbajnë pikat e tyre si blloqe: një simbol i vogël në çdo matje, me atribute për numrin e pikës, përshkrimin dhe kotën. Kur vizatimi ka referenca blloqesh, dialogu ka një seksion **Pikat e rilevimit nga blloqet**:

1. Zgjidh blloqet për t'i marrë (tabela tregon sa referenca ka secili, në cilat shtresa dhe cilët atribute), ose zgjidh shtresa për të marrë çdo referencë bloku mbi to.
2. Zgjidh nga ku vijnë **numri**, **përshkrimi** dhe **kota** e çdo pike: një atribut, emri i bllokut ose i shtresës, numrat e lirë të radhës, ose Z e pikës së futjes. CivilCraft fillon te atributet e mundshëm (PT, DESC, ELEV dhe të ngjashëm), dhe e merr kotën nga një atribut vetëm kur blloqet janë në zero.
3. Hiq zgjedhjen e shtresave të vijave nëse do vetëm pikat, pastaj kliko {{ui:Shto}}.

Çdo referencë bëhet një pikë rilevimi në pikën e vet të futjes. Numrohen vetëm referencat e vendosura në hapësirën e modelit; blloqet e futur brenda blloqeve të tjerë nuk numërohen. Numrat që janë tashmë në projekt, ose të përdorur dy herë në vizatim, marrin numra të rinj pas më të madhit, dhe një atribut kote që nuk është numër e lë atë pikë pa kotë; rreshti i gjendjes i numëron të dyja. Vizatimi nuk ndryshohet kurrë, dhe çdo pikë kujton bllokun e vet: vetitë e saj tregojnë **Nga blloku** me bllokun, shtresën dhe dorezën. Shtimi i pikave është një hap, pra {{key:Mod+Z}} i heq të gjitha.

## Nivele të shkruara si tekst, dhe kontrolli

Kotat e pikave të shkruara si tekst (ose në një atribut bloku që nuk është bllok pike rilevimi) nuk janë vijëzim. Seksioni **Kotat e rilevimit dhe kontrolli** mund t'i marrë si pika rilevimi, dhe liston çfarë duket e gabuar në vizatim: njësitë, sistemi koordinativ, distanca nga zero, konturet e sheshta, kotat e çuditshme, pikat e dyfishta. Shih [Kontrollo një vizatim rilevimi gjatë importit](topic:survey-check).

## Si lexohet vizatimi

- Harqet, rrathët, elipset, segmentet e polivijës me fryrje dhe kurbat (splines) bëhen copa të shkurtra të drejta (çdo 5° më së shumti).
- Referencat e blloqeve vizatohen aty ku janë vendosur, edhe blloqet e futur; ajo që mban një bllok në shtresën 0 merr shtresën e referencës.
- Objektet e vizatuara në një plan tjetër (drejtim tjetër ekstruzioni) vendosen në koordinata botërore.
- Çdo objekt merr tre fusha: LAYER, TYPE (lloji i objektit) dhe ELEV (kota e tij kur të gjitha pikat e tij ndajnë një kotë).
- Koordinatat merren siç janë: vizatimi duhet të përdorë të njëjtat koordinata si projekti (p.sh. të njëjtën zonë state plane). Vizatimet e lidhura (xref) nuk hapen: hapi ato veç e veç.

:::tip
Një vizatim konturesh jep sipërfaqen më të mirë me disa kota pike në majat e kodrave dhe në depresione, aty ku vetëm konturet lënë trekëndësha të sheshtë. Shtoji si pika rilevimi, ose nga një shtresë pikash në vizatim.
:::
