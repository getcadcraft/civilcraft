---
title: Hladiny pôdorysu
summary: Pevné názvy hladín, farby a hrúbky čiar, ktoré CivilCraft používa na obrazovke, v DXF a v PDF, a ktoré nastavenie zobrazenia každú z nich ovláda.
keywords: hladiny, názvy hladín, ncs, farby, aci, hrúbky čiar, hladiny dxf, pdf, nastavenia zobrazenia, čiary
from: c2aa8475
---

Všetko v pôdoryse patrí do hladiny. Názvy nasledujú bežný civilný vzor (disciplína, hlavná skupina, vedľajšia skupina). Hladiny sú v tomto zostavení pevné: nemôžete ich premenovať, meniť ich farby ani pridávať vlastné. V DXF má každá hladina uvedené číslo farby; v PDF s {{ui:Layer colors}} sa používajú rovnaké farby a pri {{ui:Black}} sa všetko tlačí čierno.

| Hladina | Obsahuje | Farba (číslo DXF) | Zobrazí sa, keď |
|---|---|---|---|
| C-TOPO-MINR | Vedľajšie vrstevnice | Sivá (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Hlavné vrstevnice | Biela alebo čierna (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Popisky vrstevníc | Biela alebo čierna (7) | {{ui:Contours}} a {{ui:Contour labels}} |
| C-TOPO-TINN | Hrany trojuholníkov | Sivá (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Hrany zlomu a hranica | Oranžová (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Okraj povrchu | Biela alebo čierna (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Šípky sklonu | Azúrová (4) | {{ui:Slope arrows}} |
| V-NODE | Body zamerania | Zelená (3) | {{ui:Points}} |
| V-NODE-TEXT | Popisky bodov: číslo, výška, popis | Zelená (3) | {{ui:Points}} a {{ui:Point labels}} |
| V-NODE-LINE | Čiary z kódov čiar (skupiny, ktoré nie sú hranami zlomu) | Zelená (3) | {{ui:Points}} |
| C-ROAD-CNTR | Osi trás | Červená (1) | Vždy |
| C-ROAD-STAN | Značky staničenia a popisky, PC a PT | Červená (1) | Vždy |
| C-ROAD-CORR | Okraje koridorov | Žltá (2) | Vždy |
| C-ROAD-SCTN | Priečne rezy (vzorkovacie čiary, kde sa vedú rezy) | Sivá (8) | Keď má os vzorkovacie čiary |
| C-GRAD-PADS | Obrysy plošín | Modrá (5) | Vždy |
| C-GRAD-DAYL | Čiary hraníc výkopu a násypu | Purpurová (6) | Vždy |
| C-GRAD-SLOP | Čiary sklonu terénnych úprav | Purpurová (6) | Vždy |
| C-GRAD-FEAT | Charakteristické čiary (3D) | Zelená (3) | Vždy |
| C-ROAD-SWPT | Zametacie trajektórie: obrys, vonkajšie stopy kolies, názov | Oranžová (30) | Vždy |
| C-STRM-PIPE | Potrubia | Modrá (5) | {{ui:Pipes}} |
| C-STRM-STRC | Konštrukcie | Modrá (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Popisky potrubí a konštrukcií | Modrá (5) | {{ui:Pipes}} |
| C-STRM-PROB | Potrubia a konštrukcie s problémami | Červená (1) | {{ui:Pipes}} |

Hrany zlomu sa kreslia len vtedy, keď je **Povrch** v časti **Zobrazenie** nastavený na {{ui:Existing ground}}; hranica sa kreslí pri ktoromkoľvek povrchu.

## Hrúbky čiar v PDF

| Hrúbka | Hladiny |
|---|---|
| 0.50 mm | Osi trás, plošiny, potrubia, potrubia s problémami |
| 0.35 mm | Hlavné vrstevnice, čiary hraníc výkopu a násypu, konštrukcie |
| 0.25 mm | Hrany zlomu |
| 0.13 mm | Vedľajšie vrstevnice |
| 0.09 mm | Hrany trojuholníkov, čiary sklonu terénnych úprav |
| 0.18 mm | Všetko ostatné |

Súbory DXF neobsahujú hrúbky čiar; nastavte ich podľa hladiny vo svojom CAD programe.

## Veľkosti popiskov

Popisky sa dimenzujú na papieri: popisky vrstevníc 2.0 mm, popisky staničenia 1.8 mm, popisky PC a PT a popisky potrubí a konštrukcií 1.6 mm, popisky bodov 1.5 mm. Popisky potrubí uvádzajú názov, priemer a sklon; popisky konštrukcií uvádzajú názov a kótu vrchnej hrany. Na obrazovke zostávajú rovnako veľké pri priblížení. V DXF sa upravujú podľa mierky uvedenej v správe o exporte; pozri [Export pôdorysu do DXF](topic:dxf-export).

## Nezobrazuje sa v žiadnej hladine

Pásy výšok sa kreslia pod čiarami len na obrazovke. Pohľad na profil nie je súčasťou pôdorysu.
