---
title: Export lokality do 3D
summary: Uložte to, čo zobrazuje 3D pohľad, ako súbor GLB alebo OBJ pre iné 3D programy, v metroch s osou Y nahor, okolo lokálneho počiatku, ktorý súbor zapíše.
keywords: glb, gltf, obj, export 3d, export modelu, herný engine, vizualizácia, 3D prehliadač, metre, y nahor, počiatok, lokálny počiatok, štátna rovinná sústava
from: 07d23992
---

3D pohľad exportuje to, čo zobrazuje, ako 3D model, ktorý môže otvoriť iný program: 3D prehliadač, modelovací program, herný engine alebo vizualizačný nástroj.

## Export

1. Otvorte 3D pohľad ({{key:D}}) a vyberte, čo sa zobrazí pomocou {{ui:Zobraziť}}. To, čo je skryté, sa neexportuje.
2. Kliknite na {{ui:GLB}} alebo {{ui:OBJ}} na paneli.
   Súbor sa stiahne ako "*názov projektu*-3d.glb" alebo "-3d.obj" a stavový riadok uvedie počiatok.

## Čo súbory obsahujú

| | GLB | OBJ |
|---|---|---|
| Povrchy | Siete s normálami a farbami pásiem alebo povrchov | Siete s normálami (bez farieb) |
| Potrubia a objekty | Okrúhle siete, problematické červené | Okrúhle siete |
| Vrstevnice, hrany zlomu, osi trás, značky, hrany koridoru a plošín | Čiary, každá sada vo svojej farbe | Záznamy čiar (`l`) |
| Zamerané body | Body | Záznamy bodov (`p`) |

Každá sada si ponechá svoj názov ("Existing ground", "Pipes", "Major contours" a podobne), takže ju môžete v inom programe skryť alebo upraviť jej štýl.

## Jednotky, osi a počiatok

- **Metre.** Projekt v stopách sa prevedie z amerických prieskumných stôp (1 ft = 1200/3937 m).
- **Y nahor**, obvyklá konvencia pre tieto formáty: východ sa stane +X, výška +Y a sever −Z.
- **Skutočná mierka.** Vertikálne zveličenie pohľadu sa neuplatní.
- **Lokálny počiatok.** Súradnice štátnej rovinnej sústavy sú milióny stôp, príliš veľké pre jednoduché čísla s jednoduchou presnosťou, ktoré tieto formáty ukladajú, preto sa súbor zapíše relatívne k blízkemu počiatku: vlastný počiatok jestvujúceho terénu pre X a Y a jeho najnižšia výška zaokrúhlená nadol. Počiatok v jednotkách projektu sa zapíše do súboru: v GLB ako `extras` na scéne a jej hornom uzle, v OBJ ako komentárový riadok pri začiatku (`# origin easting … northing … elevation …`). Ak chcete model umiestniť späť do súradníc projektu, pripočítajte počiatok (po prevode metrov späť na stopy pri projekte v stopách).

## Ešte nie je hotové

- Export zveličeného pohľadu alebo export v jednotkách projektu namiesto metrov.
- Textúry, materiálový súbor pre OBJ (.mtl) a vlastnosti jednotlivých objektov (názvy potrubí a objektov sú len v CivilCraft).
- Export koridoru ako samostatných telies alebo pohľadu na profil v 3D.
