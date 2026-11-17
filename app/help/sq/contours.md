---
title: Lexo izoipsat, kotat dhe pjerrësitë
summary: Vendos intervalin e izoipsave dhe izoipsat kryesore, shfaq brezat e kotës, shigjetat e pjerrësisë dhe trekëndëshat, dhe lexo kotat e terrenit nën tregues.
keywords: izoipsa, intervali i izoipsave, izoipsat kryesore, etiketa, brezat e kotës, shigjetat e pjerrësisë, trekëndësha, kota në pikë, analizë e sipërfaqes, analizë e kotave, analizë e pjerrësisë
from: 585e500a
---

Sipërfaqja shfaqet me izoipsa sapo të ekzistojë. Gjithçka në këtë temë vendoset nën **Shfaqja** në panelin e majtë. Cilësimet e shfaqjes ndryshojnë vetëm atë që shihni (dhe atë që eksportoni); ato nuk janë hapa zhbërjeje.

## Vendos intervalin e izoipsave

1. Nën **Shfaqja**, zgjidh një vlerë te **Izoipsat çdo**.
   - Në këmbë: 0.25, 0.5, 1, 2, 5, 10 ose 20 ft.
   - Në metra: 0.1, 0.25, 0.5, 1, 2, 5 ose 10 m.
2. Zgjidh **Kryesoret çdo**: izoipsa e 2-të, e 4-t, e 5-t ose e 10-t.
   Izoipsat kryesore vizatohen më të trasha dhe etiketohen me kotën e tyre. Ato bien në shumëfishat e plotë të hapësirës kryesore (me izoipsa 1 ft dhe çdo izoipsë e 5-t kryesore: 245, 250, 255 …).
3. Fik {{ui:Etiketat e izoipsave}} nëse etiketat ngjeshen në një parcelë të vogël.

Një projekt i ri fillon me 1 njësi, me çdo izoipsë të 5-t kryesore. Izoipsat përkulen te vijat e thyerjes; nëse ato kalojnë drejt përmes një vije rrjedhjeje ose kreshte, ajo vijë nuk është ende vijë e thyerjes (shih [Ndërto dhe rafino sipërfaqen](topic:build-surface)).

:::note
Izoipsat vizatohen vetëm kur ka jo më shumë se 2,000 nivele midis pikës më të ulët dhe asaj më të lartë. Në një vend me shumë reliev dhe interval shumë të vogël, plani nuk shfaq asnjë izoipsë: zgjidh një interval më të madh.
:::

## Lëmo izoipsat

Izoipsat gjurmohen si pjesë të drejta, një për çdo trekëndësh të sipërfaqes, kështu që kthehen me një kënd të vogël në çdo skaj trekëndëshi. **Lëmimi i izoipsave** nën **Shfaqja** i rrumbullakos këto qoshe:

- **Asnjë (pjesë të drejta)**: vijat e gjurmuara ashtu siç janë. Kjo është ajo që shfaq një vizatim i ri ose më i vjetër.
- **I lehtë**: qoshe pak të rrumbullakosura. Një vijë nuk lëviz kurrë më shumë se 10% drejt izoipsës së radhës, dhe kurrë nuk largohet nga pjesa e saj e drejtë më shumë se një e gjashta e gjatësisë së asaj pjese.
- **I fortë**: një kurbë e rrjedhshme. Një vijë nuk lëviz kurrë më shumë se 25% drejt izoipsës së radhës, dhe kurrë nuk largohet nga pjesa e saj e drejtë më shumë se një e treta e gjatësisë së asaj pjese.

Me çdo zgjedhje, një izoipsë e lëmuar akoma kalon çdo skaj trekëndëshi në të njëjtën pikë me atë të gjurmuar, qëndron brenda trekëndëshit që kalon çdo pjesë, dhe kështu nuk mund ta presë ose prekë kurrë një izoipsë tjetër. Aty ku një izoipsë kalon një vijë të thyerjes ose kufirin, ajo ruan kthesën e saj të mprehtë. Vijat e lëmuara janë ato që vizatohen dhe eksportohen (DXF, DWG, PDF, GIS dhe 3D), me më shumë kulme se vijat e gjurmuara.

Lëmimi ndryshon vetëm vijat e vizatuara. Kotat, vëllimet, profilet dhe prerjet lexohen ende nga vetë sipërfaqja. Një izoipsë që kalon saktësisht nëpër pikat e rilevimit (një pikë me 250.00 në izoipsën 250) mban një kthesë të vogël në secilën pikë të tillë.

## Si krijohet sipërfaqja pas izoipsave

Izoipsat ndjekin sipërfaqen, dhe sipërfaqja ndjek **Metodën e izoipsave** nën **Sipërfaqe** në panelin e majtë. Parazgjedhja, **Triangulim me interpolim linear**, bashkon pikat tuaja në trekëndësha dhe ruan çdo pikë dhe çdo vijë të thyerjes saktësisht. Metodat e tjera i përshtasin fillimisht pikat me një rrjet të rregullt (kriging, lakim minimal, fqinji natyror, distancë e anasjellë dhe të tjera), gjë që jep izoipsa më të rrumbullakosura midis pikave, por nuk kalon saktësisht nëpër çdo pikë; raporti i sipërfaqes nën **Sipërfaqe** tregon sa larg është rezultati në pikat tuaja.

**ABOS (aproksimim i bazuar në lëmim)** është një nga metodat me rrjet. Ka dy cilësime të veta: **Lëmueshmëria** (0.5 në fillim; sa më e ulët, aq më e lëmuar) dhe **Saktësia** (1 në fillim: sipërfaqja sillet brenda 1% të gamës së lartësisë së vendit në pikat tuaja; shkruani një numër më të vogël për një përshtatje më të saktë). Nëse nuk arrin saktësinë me rrjetin që ka, raporti i sipërfaqes e thotë këtë: shkruani një **Hapësirë rrjeti** më të vogël.

## Lexo një kotë kudo

Lëvizni treguesin mbi plan. Shiriti i statusit tregon:

- **L** dhe **V** nën tregues
- **Terreni** dhe kotën ekzistuese të terrenit atje, e interpoluar në trekëndëshin nën tregues
- **Nivelluar** dhe kotën e propozuar, aty ku një platformë ose koridor ka ndryshuar terrenin
- "Jashtë sipërfaqes" jashtë sipërfaqes

Për të lexuar saktësisht një pikë rilevimi, zgjidh {{ui:Përzgjidh}} dhe kliko pikën: paneli i djathtë tregon numrin e saj, lindjen, veriun, kotën, përshkrimin dhe grupin.

## Shfaq brezat e kotës

1. Shëno {{ui:Brezat e kotës}}.
   Sipërfaqja mbushet me ngjyra nga e ulëta (blu-gjelbër) në të lartën (ocër-kafe). Një legjendë nën kutitë e zgjedhjes liston intervalin e kotës së secilit brez.
2. Zgjidh sa brez të ketë te **Brezat**: 5, 8, 10 ose 12. Brezat e ndajnë gamën nga kota më e ulët deri në më të lartën në hapa të barabartë.

Brezat janë vetëm për shikim. Ata nuk eksportohen në DXF dhe nuk vizatohen në PDF.

## Shfaq shigjetat e pjerrësisë

Shëno {{ui:Shigjetat e pjerrësisë}}. Një shigjetë e shkurtër në çdo trekëndësh, mjaft e madhe për ta mbajtur, tregon poshtë shpatit. Trekëndëshat e sheshtë nuk marrin shigjetë. Shigjetat janë një kontroll i shpejtë i drejtimit të kullimit; vetë vlera e pjerrësisë nuk është ende e etiketuar.

## Shfaq trekëndëshat, pikat dhe skajet

- {{ui:Trekëndësha}} vizaton skajet e TIN-it. Aktivizojeni për të kontrolluar si lidh sipërfaqja pikat, sidomos përgjatë vijave të thyerjes dhe në të jashtmen.
- {{ui:Pikat}} vizaton çdo pikë rilevimi; {{ui:Etiketat e pikave}} shton numrin, kotën dhe përshkrimin e saj (ose më pak: shih **Etiketat e pikave** te [Cilësimet e CivilCraft](topic:settings)).
- {{ui:Vijat e thyerjes}} vizaton vijat e thyerjes (dhe kufirin) me portokalli.
- {{ui:Kufiri i sipërfaqes}} vizaton konturin e sipërfaqes.

## Ekzistuese ose e propozuar

Sapo një platformë ose koridor të nivelohet pa probleme, **Sipërfaqe** nën **Shfaqja** ofron {{ui:E propozuar (e nivelluar)}}. Izoipsat, brezat dhe shigjetat tregojnë atëherë sipërfaqen e niveluar, që të shihni terrenin e ri dhe daljen e dritës përreth tij. Kthehuni te {{ui:Terreni ekzistues}} për të parë rilevimin.

## Çfarë eksportohet

Eksportet DXF dhe PDF ndjekin këto cilësime: ajo që keni fikur nuk shkruhet, dhe izoipsat janë ato të sipërfaqes që shfaqet. Brezat e kotës nuk eksportohen kurrë.
