---
title: Objekty z čar, zůstávají propojené
summary: Vytvořte z čáry dlažbu, osázenou plochu, záhon, živý plot, cestu, zeď, obrubník, schody, rampu, plošinu, příkop nebo hranovou čáru; objekt sleduje pohyb čáry, dokud propojení nezrušíte.
keywords: z čáry, čáry, DWG, DXF, propojení, propojený, sledovat, obnovit, zrušit propojení, hranová čára, hranová čára z čáry, importovaná vrstva, obrys, supercad studio, kreslicí čára
from: eb67a0c6
---

{{ui:Z čáry}} (Krajina › {{ui:Více}}): klikněte na čáru, nebo na čáru či obrys importované vrstvy DWG/DXF. Uzavřená čára může vytvořit dlažbu, trávník, osázený záhon, louku, půdní pokryv, záhon nebo plošinu; otevřená čára cestu, zeď, obrubník, schody (jejich první a poslední bod), rampu, živý plot nebo příkop. Oba druhy mohou vytvořit **hranovou čáru**, kromě samotné hranové čáry.

## Hranová čára z čáry

Hranová čára vytvořená z čáry převezme její body, uzavřená je, pokud byla čára uzavřená. Její výšky se položí na stávající terén (0, pokud tam ještě není), a její použití je **Vypnuto**: netvaruje žádný terén, dokud nezvolíte použití a nenastavíte výšky v jejích Vlastnostech. Když se čára posune, hranová čára se stejným počtem bodů si ponechá každou výšku, kterou jste nastavili; když čára přidá nebo ztratí body, výšky se položí na terén znovu. Viz [Hranové čáry](topic:feature-lines).

Nový objekt si ponechá **propojení** s čárou. Když se čára posune (přetáhnete její body, nebo se kresba přesune či znovu načte), objekt převezme nový tvar ve stejném kroku zpět a přes modifikátory terénu se navrhovaný terén přizpůsobí. Vlastnosti říkají, s čím je objekt propojen; {{ui:Zrušit propojení}} jej uvolní.

Čáry se nejdříve kontrolují: čára potřebuje alespoň 2 body (3 pro obrys), nejvíce 5000, reálná čísla; obrys musí být uzavřený a nesmí se protínat sám se sebou. Čára, která neprojde, se nepoužije: objekt zůstane beze změny a panel Problémy uvede proč. Když se čára smaže, objekt zůstane a panel Problémy to zaznamená.

## V SuperCad Studio

Otevřete lokalitu a 2D výkres ve stejném projektu. Vyberte jednu čáru nebo mnohočáru ve 2D výkresu, stiskněte Ctrl+K a spusťte {{ui:Krajinný objekt z vybrané čáry výkresu}}: CivilCraft se zeptá, co vytvořit, jak je popsáno výše, a objekt zůstane propojen s touto čárou výkresu. Po změnách čar ve výkresu Ctrl+K {{ui:Aktualizovat krajinu z výkresu}} způsobí, že objekty je budou následovat, s jedním krokem zpět pro každou čáru. Soubor propojení projektu zaznamenává, který objekt sleduje kterou čáru. Nápověda SuperCad Studio má téma Krajina.
