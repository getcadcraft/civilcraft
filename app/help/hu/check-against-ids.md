---
title: Az IFC-export ellenőrzése az ügyfél IDS-ével
summary: Töltse be az ügyféltől vagy a közútkezelőtől kapott .ids fájlt, és a Problémák panelen lássa az összes exportált elemet, amely nem felel meg neki.
keywords: ids, information delivery specification, buildingsmart, követelmények, átadás, ellenőrzés, validálás, minőségbiztosítás, qa, ifc-export, ifc 4.3, nyomvonal, út, közbeszerzés
from: 183d9a0e
---

## Mit fog csinálni

Az IDS (Information Delivery Specification, buildingSMART-szabvány) felsorolja, mit kell tartalmaznia egy IFC-nek. A közbeszerzések gyakran küldenek egyet a munkához. A CivilCraft ezt a projektet exportált IFC-jét ellenőrzi az Ön által az exporthoz választott IFC-verzióban, és felsorolja az összes olyan elemet, amely nem felel meg neki.

## Lépések

1. Nyissa meg a projektet.
2. Kattintson az eszköztár Export csoportjában lévő {{ui:IFC}} gombra. A párbeszédpanelen válassza ki az IFC-verziót, amelyet átad.
3. Kattintson a {{ui:Ellenőrzés IDS ellen…}} gombra.
4. Kattintson a {{ui:.ids fájl betöltése…}} gombra, és válassza ki a fájlt. Semmi nem töltődik fel.
5. Olvassa le az eredményt: minden specifikáció mellett a {{ui:Megfelel}} vagy a {{ui:Nem felel meg}} jelöléssel, és azzal, hány elemre vonatkozik.
6. Nyissa meg a Problémák panelt ({{key:Ctrl+Shift+M}}), és kattintson egy hibára: így kijelölődik az a nyomvonal, tereplépcső, cső, műtárgy vagy épülettömeg, amelyből származik.

## Mit kell látnia

- Egy figyelmeztetés minden exportált elemre és minden olyan követelményre, amelyet nem teljesít: a specifikáció nevével, azzal, amit az IDS kér, és azzal, amit az export tartalmaz.
- Az ellenőrzési jelentés (a Problémák panelen) az IDS-szel kezdődik: a címével, verziójával, szerzőjével és minden specifikáció darabszámaival.

## Jó tudni

- Az IDS a projektfájlban mentődik, így a projekt megnyitásakor újra ellenőrződik. Az IDS betöltése vagy elfelejtése egy visszavonható lépés.
- Minden változást kicsit később újra ellenőrzünk. A nagy felületek kiírása hosszabb ideig tart, így az ellenőrzés ilyenkor kicsit tovább vár a futások között.
- Az ellenőrzés ugyanazt a fájlt használja, amelyet az {{ui:IFC}} export ír, abban a verzióban, amelyet ott utoljára választott ki (ha nem választott, az IFC 4.3).
- A számokat SI-egységekben hasonlítjuk össze: a lábban megadott projektet először méterre váltjuk.

- Az IDS mintáit teljes értékként olvassuk. Az elején álló `^` és a végén álló `$` is „a teljes érték” jelentésű, ahogy a legtöbb IDS-fájl gondolja.

## Tovább

- [IFC exportálása](topic:ifc)
