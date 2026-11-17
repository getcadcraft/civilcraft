---
title: Výkazy: rozpisy propojené s objekty
summary: Uložené výkazy s řádky z rostlin, osázených ploch, dlažeb, zdí, schodů, úprav terénu nebo všech množství; vlastní sloupce a vzorce, skupiny a součty; CSV, XLSX a tabulka na listech, vždy aktuální.
keywords: výkaz, rozpis, rozpis rostlin, rozpis zpevněných ploch, množství, sloupce, vzorec, součet, počet, skupina, filtr, csv, xlsx, tabulkový sešit, tabulka na listu
from: 11bc1bac
---

{{ui:Výkazy}} (Krajina › Více) otevře výkazy tohoto projektu. Poprvé se pro vás vytvoří **rozpis rostlin** a **rozpis zpevněných ploch a ploch**. Výkaz se při každém zobrazení, uložení nebo umístění na list přepočítá z objektů: změníte-li záhon, změní se jeho počty všude.

- **Řádky z**: rostliny (jeden řádek na druh, kultivar a velikost), osázené plochy, dlažby, zdi, schody, úpravy terénu (výkop a násyp) nebo všechna množství.
- **Sloupce**: pole (`qty`, `area`, `botanical`, nebo název v hranatých závorkách, například `[Net area]`), nebo vzorec: `+ - * / ^ %`, `&` pro spojení textu, `= <> < <= > >=`, a `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Vzorec, který nelze vypočítat, ukáže v buňce `#ERR` (nebo `#DIV/0`). Vzorce čte vlastní analyzátor CadCraft; nic v nich se nespouští jako kód.
- **Součet** pro každý sloupec (součet, počet, průměr, nejmenší, největší), **Seskupit podle** (mezisoučty pro každou skupinu) a **Pouze řádky, kde**.
- {{ui:Uložit jako CSV}}, {{ui:Uložit jako XLSX}} a **Umístit tento výkaz na listy** (Listy › Výkazy jej nakreslí jako tabulku přes tolik listů, kolik potřebuje).

Popisky na rostlinách a plochách čtou stejné názvy polí (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
