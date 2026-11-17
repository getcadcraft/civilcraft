---
title: Növénygrafika méretarányonként, saját jelképek és 3D-s növények
summary: Hogyan rajzolódnak ki a növények az alaprajzon minden rajzi méretarányban és részletességi szinten, és hogyan kaphat egy növényrekord saját jelképet (SVG vagy DXF/DWG blokk) és saját 3D-s modellt (OBJ, STL vagy GLB).
keywords: növénygrafika, növényjelkép, jelkép méretarány szerint, részletességi szint, részletesség, egyszerű kör, körvonal, részletes jelkép, saját jelkép, blokk, svg, dxf, dwg, 3D-s növény, saját 3D-s modell, obj, stl, glb, gltf, fa modell, növények 3D-ben
from: 875837d9
---

## Alaprajzi jelképek méretarány szerint

{{ui:Továbbiak}} › {{ui:Növénygrafika}} határozza meg, hogyan rajzolódnak ki a növények az alaprajzon. Az **Automatikus, méretarány szerint** beállítás a rajzi méretarányból három szint közül választ:

- **Egyszerű kör** (1:500-nál durvább): kör a növény terjedelménél.
- **Körvonal középponttal** (1:500-tól 1:200-ig): a kör és egy kis középpontkereszt.
- **Részletes jelkép** (1:200-nál finomabb): a rekord saját jelképe, ha van ilyen, különben a beépített jelkép.

A két méretarányt a **Egyszerű 1:-tól** és a **Körvonal 1:-tól** mezőkkel módosíthatja, vagy minden méretarányhoz választhat egy szintet. A Lapok párbeszédpanel minden rajzlapkészlete saját **Növény részletessége alaprajzon** beállítással rendelkezik, így egy 1:500-as helyszínrajz és egy 1:100-as ültetési terv eltérő lehet. A beállítások a projekttel együtt mentődnek.

## Saját jelkép

Válassza ki a növényt a Növények szakaszban, és nyomja meg a {{ui:Saját jelkép…}} gombot. Ez egy SVG-t vagy egy DXF- vagy DWG-rajz blokkját olvassa be (ha a rajzon több blokk van, egyet kell választania). A jelkép a növény terjedelmére illeszkedik, és részletes szinten rajzolódik ki. A projektben tárolódik, így a fájl a projekttel együtt utazik.

- Az SVG-ből a vonalak, töröttvonalak, sokszögek, téglalapok, körök, ellipszisek és útvonalak olvasódnak be. A szkriptek, stílusok, hivatkozások és képek nem kerülnek vizsgálatra. Az átalakítások nem alkalmazódnak: ha a fájlban vannak, erről értesítést kap, ezért előbb a rajzprogramjában oldja fel őket.
- Korlátok: 512 KB SVG és 2000 alakzat. A nagyobb fájl elutasításra kerül, az okával együtt.

## Saját 3D-s növény

{{ui:Saját 3D-s modell…}} ugyanezen a rekordon egy **OBJ**, **STL** vagy **GLB** fájlt olvas be. Ezután a Növénygrafikában állítsa a **Növények 3D-ben** beállítást **Minden rekord saját modellje** értékre: a rekord minden növénye a saját modelljét mutatja, a magasságához és terjedelméhez igazítva. A saját modell nélküli rekordok megtartják a beépített formákat. Nagy területek gyors nézetéhez válassza az **Egyszerű tömegek** lehetőséget.

A GLB-fájlból csak az alak olvasódik be:

- A modellhez szükséges mindennek a .glb fájlon belül kell lennie. Az olyan modell, amely más fájlokra hivatkozik (külön .bin fájl vagy címmel megadott képek), elutasításra kerül: semmi nem töltődik le.
- A tömörített vagy csomagolt geometria (Draco, meshopt, kvantált pozíciók) nem olvasódik be. Tömörítés nélkül exportálja.
- A fájl textúrái és színei nem használatosak: a modell a növény saját színével rajzolódik ki. A textúrák továbbra is ellenőrzésre kerülnek, és a 4096 pixelnél nagyobb oldalú textúra elutasításra kerül.
- Korlátok: 32 MB-os fájl, 50 000 háromszög (minden olyan alkatrész-példányt beleszámítva, amely többször szerepel), 64 kép és 16 MB képadat.

Minden korlát az okával együtt elutasítja a fájlt; félig beolvasott adat nem marad meg. Egy visszavonási lépés adja a rekordnak a jelképet vagy a modellt, a {{ui:Saját jelkép eltávolítása}} vagy a {{ui:Saját 3D-s modell eltávolítása}} pedig ismét eltávolítja.

A rekordról magáról lásd: [Növényrekordok](topic:plant-records), a helyszín 3D-s megtekintéséről pedig: [A helyszín megtekintése 3D-ben](topic:site-3d).
