---
title: Inženýrské sítě a OpenStreetMap
summary: Trasy vody, kanalizace, dešťové kanalizace, plynu, elektřiny a telekomunikací s materiálem, velikostí, krytím a vlastníkem; data OpenStreetMap ze souboru Overpass JSON; křížení, výkopy tras a objemy; servisní vrstvy v DWG, DXF a PDF; segmenty potrubí a kabelů v IFC.
keywords: inženýrské sítě, sítě, síť, utility, osm, openstreetmap, overpass, potrubí, kabel, plyn, kanalizace, dešťová kanalizace, telekomunikace, elektřina, voda, hydrant, šachta, výkop, křížení, odstup, krytí, hloubka, dwg, ifc, georeferencovaný, vrstvy
from: 8a85dace
---

Nakreslete podzemní inženýrské sítě lokality jako jednu síť pro každou službu, zkontrolujte, kde se kříží, a exportujte je jako vrstvy výkresu a jako IFC.

## Vytvoření tras

Otevřete **Povrch, Více, Inženýrské sítě...**

- **Vytvořit trasu z výběru** převede vybranou osu, čáru terénu nebo potrubí na trasu zvolené služby. Poté v tabulce vyplňte materiál, velikost (mm), krytí (hloubku k hornímu okraji potrubí nebo kabelu) a vlastníka.
- **Načíst data OpenStreetMap** načte soubor Overpass JSON, který jste uložili (dotaz s `out geom;`). Projekt nejprve potřebuje souřadnicový systém, protože pozice v OpenStreetMap jsou zeměpisná šířka a délka. Načtou se potrubní vedení (podle látky), podzemní silové a telekomunikační kabely, hydranty, šachty a dešťové kanalizace. Cokoli jiného se počítá jako vynechané a je to uvedeno ve zprávě. Nadzemní vedení jsou vynechána.
- **Přidat mapu OpenStreetMap** přidá mapu OpenStreetMap pod půdorys. Kreslí se jen tehdy, když jsou v Nastavení zapnuté mapové vrstvy z internetu.

## Kontroly a výstupy

- **Křížení**: trasy různých služeb, které se v půdorysu kříží, jsou vypsány se světlou výškou mezi nimi tam, kde je k dispozici povrch terénu; minimum je zástupná hodnota, kterou nastavujete vy, a není to číslo z normy.
- **Výkop**: každá trasa dostane výkop (velikost potrubí plus odstup na každou stranu, sklon svahu, lože) s objemem. Celkový součet se zobrazí v okně i v CSV.
- **Výkres**: trasy a body jsou na vrstvách služeb (například U-WATR-RUN, U-POWR-RUN), takže se dostanou do PDF, DXF a DWG.
- **IFC**: trasy jdou do exportu IFC jako segmenty potrubí a kabelů spolu s hydranty, armaturami a šachtami, jeden systém na službu, v souřadnicovém systému projektu.

## Data OpenStreetMap

Data OpenStreetMap jsou autorským dílem přispěvatelů OpenStreetMap a jsou licencována podle ODbL. Uvedení autora se přidává do výkresu, CSV a IFC. Pokud sdílíte soubor, který obsahuje data OpenStreetMap, ponechte uvedení autora a přečtěte si podmínky licence o sdílení za stejných podmínek.

## Co ještě není hotovo

Trasy zatím nelze kreslit bod po bodu na půdorysu nástrojem a křížení zatím nejsou kreslena v pohledu profilu (výpočet je připraven). Hloubky, velikosti a odstupy jsou zatím zástupné hodnoty: použijte čísla vaší normy.
