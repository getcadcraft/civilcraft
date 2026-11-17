---
title: Objekte nga vijat e vizatimit, të mbajtura të lidhura
summary: Bëj shtrim, zonë të mbjellë, shtrat, gardh, shteg, mur, bordurë, shkallë, rampë, platformë, kanal ujëmbledhës ose vijë karakteristike nga një vijë; ndjek vijën kur ajo lëviz, deri sa ta këputësh lidhjen.
keywords: nga një vijë, vijat e vizatimit, DWG, DXF, lidhje, i lidhur, ndjek, rigjenero, këput lidhjen, vijë karakteristike, vijë karakteristike nga vija e vizatimit, shtresë e importuar, kontur, vijë vizatimi
from: eb67a0c6
---

{{ui:Nga një vijë}} (Peizazh › {{ui:Më shumë}}): kliko një vijë karakteristike, ose një vijë ose kontur të një shtrese DWG/DXF të importuar. Një vijë e mbyllur mund të bëjë shtrim, lëndinë, zonë të mbjellë, livadh, mbulesë toke, shtrat ose platformë; një vijë e hapur një shteg, mur, bordurë, shkallë (pika e parë dhe e fundit), rampë, gardh ose kanal ujëmbledhës. Të dy llojet mund të bëjnë një **vijë karakteristike**, përveç vetë një vije karakteristike.

## Vijë karakteristike nga një vijë

Një vijë karakteristike e bërë nga një vijë merr pikat e saj, e mbyllur nëse vija ishte e mbyllur. Kotat e saj vendosen në tokën ekzistuese (0 aty ku nuk ka ende), dhe përdorimi i saj është **Jashtë**: nuk formon asnjë tokë deri sa të zgjedhësh një përdorim dhe të vendosësh kotat e saj te Vetitë. Kur vija lëviz, një vijë karakteristike me të njëjtin numër pikash mban çdo kotë që ke vendosur; kur vija fiton ose humbet pika, kotat vendosen përsëri mbi tokë. Shih [Vijat karakteristike](topic:feature-lines).

Objekti i ri mban një **lidhje** me vijën e tij. Kur vija lëviz (tërheq pikat e saj, ose vizatimi zhvendoset ose rilexohet), objekti merr formën e re në të njëjtin hap zhbërjeje, dhe përmes modifikuesve të tokës tokës së propozuar e ndjek. Vetitë thonë me çfarë është i lidhur; {{ui:Këput lidhjen}} e bën të lirë.

Vijat kontrollohen së pari: një vijë ka nevojë për të paktën 2 pika (3 për një kontur), më së shumti 5000, numra realë; një kontur duhet të jetë i mbyllur dhe të mos kryqëzohet me vetveten. Një vijë që dështon nuk përdoret: objekti mbetet siç ishte dhe paneli Problemet shpjegon arsyen. Nëse vija fshihet, objekti mbetet dhe paneli Problemet e shënon këtë.

## Në SuperCad Studio

Hap vendin dhe vizatimin 2D në të njëjtin projekt. Zgjidh një vijë ose polivijë në vizatimin 2D, shtyp Ctrl+K dhe ekzekuto {{ui:Objekt peizazhi nga vija e zgjedhur e vizatimit}}: CivilCraft pyet çfarë të krijojë, si më sipër, dhe objekti mbetet i lidhur me atë vijë të vizatimit. Pasi ndryshon vijat në vizatim, Ctrl+K {{ui:Përditëso peizazhin nga vizatimi}} i bën objektet t'i ndjekin, me një hap zhbërjeje për çdo vijë. Skedari i lidhjeve të projektit regjistron cili objekt ndjek cilën vijë. Ndihma e vetë SuperCad Studio ka një temë për Peizazhin.
