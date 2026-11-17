---
title: Export území do 3D
summary: Uložte to, co ukazuje 3D pohled, jako soubor GLB nebo OBJ pro jiné 3D programy, v metrech s osou Y nahoru, kolem místního počátku, který soubor zaznamenává.
keywords: glb, gltf, obj, export 3D, export modelu, herní engine, vizualizace, 3D prohlížeč, metry, osa Y nahoru, počátek, místní počátek, státní rovina
from: 07d23992
---

3D pohled exportuje to, co zobrazuje, jako 3D model, který jiný program dokáže otevřít: 3D prohlížeč, modelář, herní engine nebo vizualizační nástroj.

## Export

1. Otevřete 3D pohled ({{key:D}}) a vyberte, co se zobrazí, pomocí {{ui:Zobrazit}}. Co je skryté, se neexportuje.
2. Klikněte na {{ui:GLB}} nebo {{ui:OBJ}} na liště.
   Soubor se stáhne jako "*název projektu*-3d.glb" nebo "-3d.obj" a stavový řádek uvede počátek.

## Co soubory obsahují

| | GLB | OBJ |
|---|---|---|
| Povrchy | Sítě s normálami a barvami pásem nebo povrchů | Sítě s normálami (bez barev) |
| Potrubí a objekty | Kulaté sítě, problémové červeně | Kulaté sítě |
| Vrstevnice, lomové hrany, osy tras, značky, linie koridoru a plošin | Čáry, každá sada ve své barvě | Záznamy čar (`l`) |
| Zaměřovací body | Body | Záznamy bodů (`p`) |

Každá sada si zachová svůj název ("Stávající terén", "Potrubí", "Hlavní vrstevnice" a tak dále), takže ji můžete v druhém programu skrýt nebo upravit.

## Jednotky, osy a počátek

- **Metry.** Projekt ve stopách se převede z US survey feet (1 ft = 1200/3937 m).
- **Y nahoru**, obvyklá konvence pro tyto formáty: východ se stává +X, výška +Y a sever −Z.
- **Skutečné měřítko.** Svislé zveličení pohledu se neuplatní.
- **Místní počátek.** Souřadnice státní roviny jsou miliony stop, příliš velké pro čísla s jednoduchou přesností, která tyto formáty ukládají, takže se soubor zapíše vzhledem k blízkému počátku: vlastní počátek stávajícího terénu pro východ a sever a jeho nejnižší výška zaokrouhlená dolů. Počátek v jednotkách projektu je zaznamenán v souboru: v GLB jako `extras` na scéně a jejím horním uzlu, v OBJ jako komentářový řádek blízko začátku (`# origin easting … northing … elevation …`). Abyste model umístili zpět do souřadnic projektu, přičtěte počátek (u projektu ve stopách až po převodu metrů zpět na stopy).

## Ještě není hotovo

- Export zveličeného pohledu nebo export v jednotkách projektu místo metrů.
- Textury, materiálový soubor pro OBJ (.mtl) a vlastnosti jednotlivých objektů (názvy potrubí a objektů jsou jen v CivilCraftu).
- Export koridoru jako samostatných těles nebo pohledu na profil ve 3D.
