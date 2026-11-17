---
title: Alaprajz- és hossz-szelvény lapok
summary: Nyomvonal kirajzolása alaprajzi és hossz-szelvényi lapok sorozataként egyetlen PDF-ben, illesztővonalakkal közöttük.
keywords: alaprajz és hossz-szelvény, lapok, plottolás, pdf, illesztővonal, tervkészítés, útterv, hossz-szelvény plottolása, függőleges nagyítás, rajzlapkészlet
from: 34b4ec78
---

Az alaprajz- és hossz-szelvény lapok készítik általában az útterveket: minden lap az út egy szakaszát kétszer mutatja, felül az alaprajzot, alul a hossz-szelvényt, azonos vízszintes méretarányban, így egy szelvény mindkettőben ugyanazon a helyen van.

## Lapok készítése

1. Jelölje ki a nyomvonalat. A **Tulajdonságok** részben kattintson a {{ui:Alaprajz- és hossz-szelvény lapok}} gombra.
2. Válassza ki a **Papírt**, az **Alaprajzi méretarányt** és a **Hossz-szelvény függőleges nagyítását** (hányszor magasabban rajzolódik a hossz-szelvény, mint amilyen hosszú; kezdésnek 10×). A párbeszédpanel megmutatja, hány lap lesz, és a nyomvonalnak mekkora része jelenik meg egy-egy lapon.
3. Ha a nyomvonal egy részét szeretné plottolni, módosítsa a **Kezdő szelvény** és a **Záró szelvény** értékét.
4. Kattintson a {{ui:PDF letöltése}} gombra. A PDF-nek lapsoronként egy oldala lesz.

## Mi van a lapon

| Rész | Mit mutat |
|---|---|
| Alaprajz | Az alaprajzon minden (szintvonalak, felmérési pontok, a nyomvonal és a szelvényezése, sávok, tereplépcsők, jellemzővonalak, csövek, mintavételi vonalak), úgy elforgatva, hogy ez a szakasz keresztben fusson a lapon, és az északi nyíl is ehhez igazodva forog |
| Illesztővonalak | Pontvonal, a nyomvonalra merőlegesen, minden végén annak a szakasznak, amely egy másik lapon folytatódik; felirata: "Illesztővonal sta 5+50.00, lásd a 2. lapot" |
| Hossz-szelvény | A meglévő terep (szaggatott), a tervezett hossz-szelvény (piros), minden egyenes szakasz lejtése és minden függőleges ív PVI-je, magassága, L és K értéke; a szelvényszámok alul, a magasságok mindkét oldalon |
| Rajzfej | A projekt neve, a nyomvonal és szelvénytartománya, "1. lap / 3", a vízszintes és a függőleges méretarány, valamint a nagyítás |

Egy lapon látható szakasz hossza az adott méretarányban az alaprajz-ablak méretétől függ, lefelé kerekítve egész 50 ft-re (20 m) hosszú szakaszoknál, vagy egész 10 ft-re (5 m) rövid szakaszoknál.

:::note
Ha a hossz-szelvény magassági értékei a választott nagyítással nem férnének el, a CivilCraft minden lapot a 10×, 5×, 4×, 2× és 1× közül a legnagyobbal rajzolja meg, amely még elfér, és erről az állapotsor tájékoztat. Egy ívelt nyomvonal a szakasz kezdő- és végpontja közötti iránnyal van elforgatva, így az út a lapon enyhén emelkedhet vagy eshet.
:::
