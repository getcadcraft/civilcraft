---
title: Ohrady
summary: Ohrada pozdĺž čiary, parcely alebo plošiny: stĺpiky, priečniky, panely alebo latky, brány, šikmé alebo schodovité na teréne, tabuľka, značky v pôdoryse a prvky IFC. Dostupná aj pre asistenta.
keywords: ohrada, stĺpiky, priečniky, panely, latky, brána, šikmé, schodovité, terén, tabuľka, ifc, zábradlie, hranica
from: c0e7b84a
---

Vytvorte ohradu pozdĺž charakteristickej čiary, osi trasy, parcely alebo plošiny so stĺpikmi a bránami rozmiestnenými za vás.

## Vytvorenie ohrady

1. Vyberte čiaru, parcelu alebo plošinu.
2. Otvorte **Povrch, Viac, Ohrady...**
3. Zvoľte štýl (panely, priečniky alebo latky), šikmé alebo schodovité, výšku, rozstup stĺpikov a šírku brány, potom **Ohrada pozdĺž výberu**, alebo **S bránou**, aby sa brána umiestnila do stredu najdlhšieho priameho úseku.

Stĺpiky sú na koncoch, v každom rohu (vrchol, ktorý sa láme o 20 ° alebo viac), na oboch okrajoch každej brány a v rovnakých poliach medzi nimi, pričom žiadne nie je dlhšie než rozstup. **Šikmé** panely kopírujú terén medzi svojimi stĺpikmi. **Schodovité** panely zostávajú vodorovné a schodia sa pri stĺpikoch; medzera pod panelom je najširšia pri jeho stĺpiku na spodnej strane svahu a okno upozorní, keď je medzera nad limitom alebo keď terén stúpa cez panel. Brány so šírkou 6 feet (1.8 m) a väčšie majú dve krídla; pôdorys zobrazuje krídla otvorené aj s ich smerom otvárania.

## Tabuľka a výstupy

Každá ohrada zobrazuje svoju dĺžku, stĺpiky podľa druhu, panely, brány a schody, s tabuľkou **CSV** stĺpikov, panelov, priečnikov, latiek a brán. Pôdorys obsahuje vrstvy ohrady (C-FENC, C-FENC-POST, C-FENC-GATE) pre PDF, DXF a DWG. Export IFC obsahuje stĺpiky (IfcMember, post), panely (IfcRailing, user defined fence panel), priečniky (IfcMember) a brány (IfcDoor, gate), jeden systém pre každú ohradu.

## Od asistenta

`fence_build` vytvorí ohradu (body alebo pomenovanú čiaru, parcelu alebo plošinu, brány podľa staničenia) a `fence_list` vypíše ohrady spolu s ich tabuľkou.

## Čo nie je hotové

Počiatočné rozmery sú bežné voľby, nie norma. Typy z knižnice sa prenášajú iba ako názov. Brány musia ležať v jednom priamom úseku. BimCraft zatiaľ tento nástroj nemá.
