---
title: Házemelvények lejtős telken
summary: Tereplépcső kialakítása dombon: támfalak mint tereplépcső-élek, a bevágás-feltöltés térkép mélység szerint árnyalva, pontszintekkel (terv és 3D), szabad metszet a terepen és a terven át, valamint rámpák vagy lejtős tereplépcsők a behajtókhoz.
keywords: emelvény, tereplépcső, házalap, lejtős telek, dombos telek, támfal, bevágás és feltöltés, bevágás-feltöltés térkép, pontszintek, szabad keresztszelvény, metszetvonal, önkormányzati tervek, behajtó, rámpa, lejtős tereplépcső, lejtés, földmunka
from: daa08a3f
---

A házemelvény egy **tereplépcső** (**Tervezés** › {{ui:Tereplépcső}}): egy síkban fekvő sokszög, amely a talajba van simítva. Négy dolog segít lejtőn.

## Támfalak mint tereplépcső-élek

Jelölje ki a tereplépcsőt, és egy oldalát állítsa {{ui:Függőleges (támfal)}} értékre lejtő helyett (**Tulajdonságok** › {{ui:Oldalak és támfalak}}, vagy {{ui:Függőleges: támfalak}} az összes oldalra egyszerre). A fal magasságát a mentén lévő talajból olvassa ki: a teteje a talajon, az alja a tereplépcsőn, mindkét végén és a legmagasabb pontján a terven látszik, és figyelmeztetés jelzi, ha magasabb a beállított határnál. A falak és a lejtők egymás mellett is kombinálhatók.

## A bevágás-feltöltés térkép

Jelölje be a {{ui:Bevágás-feltöltés térkép}} opciót a **Megjelenítés** alatt. A terv annak megfelelően árnyalódik, milyen mély a bevágás vagy a feltöltés, egyenlő lépcsőkben (a bevágás meleg, a feltöltés kék, a szinte szintes halvány), jelmagyarázattal. A **pontszintek** a tereplépcsőn vannak feltüntetve: a szintváltozás a rács pontjaiban, a legmélyebb bevágás és a legmagasabb feltöltés ▲ jellel jelölve. A cellák azonosak azokkal, amelyekből a földmunka-térfogatok számolnak, így a térkép és a számok mindig egyeznek.

A 3D nézetben a színlistából válassza a **Bevágás és feltöltés** elemet, hogy ugyanezek a színek a talajra és a tervre is rákerüljenek.

A duzzadási vagy zsugorodási tényező a tömegdiagram-eszközben van (**Tervezés** › {{ui:Tömegdiagram}}); a tereplépcső térfogataira nem alkalmazzák.

## Szabad metszet

A **Felület** › {{ui:Továbbiak}} alatt válassza a {{ui:Szabad keresztszelvény}} elemet, kattintson a metszetvonal pontjaira bárhol (a vonal törhet), és nyomja meg az {{key:Enter}} billentyűt. Egy párbeszédpanel rajzolja meg a metszetet: a meglévő talajt, a tervezett szintet (szaggatott vonallal) és a kettő közötti bevágást és feltöltést, árnyékolva, a területükkel együtt (a tervezett szint csak a tereplépcsők és utak belsejében számít). A {{ui:Magassági túlzás}} alapértelmezetten úgy igazodik, hogy a rajz kiférjen; a {{ui:Mentés SVG-ként}} és a {{ui:Mentés CSV-ként}} gombok rajzot adnak az önkormányzatnak, a számokat pedig táblázatban.

## Rámpák és lejtős tereplépcsők

A **Felület** › {{ui:Továbbiak}} alatt válassza a {{ui:Rámpa vagy lejtős tereplépcső}} elemet, kattintson az alacsony végére, majd a magas végére, nyomja meg az {{key:Enter}} billentyűt, és adja meg a szélességet, az alacsony végi szintet és a lejtést. A tereplépcső egy csík, amelynek sarkai ezeket a szinteket hordozzák (két sarok közötti él állandó lejtésű), és úgy simul a talajba, mint bármely tereplépcső. Bármely tereplépcső sarkai saját szintet is kaphatnak, így a behajtó, a rámpa vagy a megdöntött terasz egy olyan tereplépcső, amelynek minden sarkán van szint.
