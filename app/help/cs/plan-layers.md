---
title: Vrstvy půdorysu
summary: Pevné názvy vrstev, barvy a tloušťky čar, které CivilCraft používá na obrazovce, v DXF a v PDF, a které nastavení zobrazení je ovládá.
keywords: vrstvy, názvy vrstev, ncs, barvy, aci, tloušťky čar, vrstvy dxf, pdf, nastavení zobrazení, čárová kresba
from: c2aa8475
---

Vše na půdorysu patří do některé vrstvy. Názvy odpovídají běžnému schématu civilních vrstev (obor, hlavní skupina, vedlejší skupina). Vrstvy jsou v této verzi pevně dané: nelze je přejmenovat, změnit jejich barvy ani přidat vlastní. V DXF má každá vrstva uvedené číslo barvy; v PDF s {{ui:Barvy vrstev}} se použijí stejné barvy a s {{ui:Černě}} se vše vytiskne černě.

| Vrstva | Obsahuje | Barva (číslo DXF) | Zobrazeno, když |
|---|---|---|---|
| C-TOPO-MINR | Vedlejší vrstevnice | Šedá (8) | {{ui:Vrstevnice}} |
| C-TOPO-MAJR | Hlavní vrstevnice | Bílá nebo černá (7) | {{ui:Vrstevnice}} |
| C-TOPO-TEXT | Popisky vrstevnic | Bílá nebo černá (7) | {{ui:Vrstevnice}} a {{ui:Popisky vrstevnic}} |
| C-TOPO-TINN | Hrany trojúhelníků | Šedá (8) | {{ui:Trojúhelníky}} |
| C-TOPO-BRKL | Lomové hrany a hranice | Oranžová (30) | {{ui:Lomové hrany}} |
| C-TOPO-BNDY | Okraj povrchu | Bílá nebo černá (7) | {{ui:Okraj povrchu}} |
| C-TOPO-SLOP | Šipky sklonu | Azurová (4) | {{ui:Šipky sklonu}} |
| V-NODE | Geodetické body | Zelená (3) | {{ui:Body}} |
| V-NODE-TEXT | Popisky bodů: číslo, kóta, popis | Zelená (3) | {{ui:Body}} a {{ui:Popisky bodů}} |
| V-NODE-LINE | Čáry z kódů čar (skupiny, které nejsou lomovými hranami) | Zelená (3) | {{ui:Body}} |
| C-ROAD-CNTR | Osy trasy | Červená (1) | Vždy |
| C-ROAD-STAN | Značky a popisky staničení, PC a PT | Červená (1) | Vždy |
| C-ROAD-CORR | Hrany koridoru | Žlutá (2) | Vždy |
| C-ROAD-SCTN | Vzorkovací čáry (kde se řezy vedou) | Šedá (8) | Když osa trasy má vzorkovací čáry |
| C-GRAD-PADS | Obrysy plošek | Modrá (5) | Vždy |
| C-GRAD-DAYL | Čáry napojení na terén | Purpurová (6) | Vždy |
| C-GRAD-SLOP | Čáry sklonu úpravy terénu | Purpurová (6) | Vždy |
| C-GRAD-FEAT | Hranové čáry (3D) | Zelená (3) | Vždy |
| C-ROAD-SWPT | Zametací trajektorie: obrys, vnější stopy kol, název | Oranžová (30) | Vždy |
| C-STRM-PIPE | Potrubí | Modrá (5) | {{ui:Potrubí}} |
| C-STRM-STRC | Objekty (šachty a vtoky) | Modrá (5) | {{ui:Potrubí}} |
| C-STRM-TEXT | Popisky potrubí a objektů | Modrá (5) | {{ui:Potrubí}} |
| C-STRM-PROB | Potrubí a objekty s problémy | Červená (1) | {{ui:Potrubí}} |

Lomové hrany se kreslí jen tehdy, když je **Povrch** v části **Zobrazení** nastaven na {{ui:Stávající terén}}; hranice se kreslí u obou povrchů.

## Tloušťky čar v PDF

| Tloušťka | Vrstvy |
|---|---|
| 0.50 mm | Osy tras, plošky, potrubí, problémové potrubí |
| 0.35 mm | Hlavní vrstevnice, čáry napojení na terén, objekty |
| 0.25 mm | Lomové hrany |
| 0.13 mm | Vedlejší vrstevnice |
| 0.09 mm | Hrany trojúhelníků, čáry sklonu úpravy terénu |
| 0.18 mm | Vše ostatní |

Soubory DXF tloušťky čar neobsahují; nastavte je podle vrstev ve svém CAD programu.

## Velikosti popisků

Popisky mají velikost na papíře: popisky vrstevnic 2.0 mm, popisky staničení 1.8 mm, popisky PC a PT a popisky potrubí a objektů 1.6 mm, popisky bodů 1.5 mm. Popisky potrubí uvádějí název, průměr a sklon; popisky objektů název a kótu poklopu. Na obrazovce zůstávají při přibližování stejně velké. V DXF se škálují pro měřítko uvedené ve zprávě o exportu; viz [Export půdorysu do DXF](topic:dxf-export).

## Nezobrazeno na žádné vrstvě

Pásma výšek se na obrazovce kreslí jen pod čárovou kresbou. Pohled profilu není součástí půdorysu.
