---
title: Stylování vrstvy podle atributu
summary: Obarvěte prvky vrstvy GIS podle hodnot pole (jedna barva na hodnotu, nebo podle číselných rozsahů), zvětšete body podle čísla, vybarvěte mnohoúhelníky a zobrazte na půdorysu legendu.
keywords: symbologie, styl, barva, color, kategorizovaně, stupňovitě, jedinečné hodnoty, stejný interval, kvantil, přirozené přestávky, jenks, přechod, barvoslepost, legenda, velikost, body, choropleth, třídy, gis
from: a3a69add
---

Otevřete nabídku **tři tečky** vrstvy v seznamu vrstev GIS a zvolte {{ui:Style by attribute…}}.

## Tři styly

- **Jednoduchý symbol:** barva vrstvy, jako dříve.
- **Kategorizovaně:** jedna barva pro každou odlišnou hodnotu libovolného pole. Až osm hodnot dostane osm barev Okabe-Ito (vybraných tak, aby zůstaly rozlišitelné u běžných typů barvosleposti); u více hodnot dostanou barvu sedm nejčastějších a zbytek sdílí šedou třídu **Ostatní**. Prvky bez hodnoty jsou šedé.
- **Stupňovitě:** číselné pole se rozdělí na 2 až 9 rozsahů, každý s barvou z přechodu. Hodnota na hranici spadá do nižšího rozsahu.

## Jak se rozsahy dělí

| Metoda | Hranice |
|---|---|
| Stejný interval | Rozsah od nejmenší do největší hodnoty rozdělený na stejně široké části. Hodnoty 0 až 30 ve třech rozsazích: 0, 10, 20, 30. |
| Kvantil | Přibližně stejný počet prvků v každém rozsahu. Hranice se čtou z seřazených hodnot s obvyklou lineární interpolací: pro 1 až 10 ve dvou rozsazích je hranice 5.5. |
| Přirozené přestávky (Jenks) | Řezy, které nechají nejmenší rozptyl uvnitř každého rozsahu, takže shluky podobných hodnot zůstanou pohromadě. U více než 1,500 hodnot pracuje na 1,500 rovnoměrně rozmístěných a říká to. |

## Barvy

Viridis a Cividis jdou od tmavé ke světlé se plynulou změnou světlosti, takže pořadí rozsahů se dá přečíst i v šedé nebo u barvosleposti. Blues jde od světlé k tmavé. Červená k modré je obousměrný přechod pro hodnoty kolem středu. **Obrátit barvy** převrátí kterýkoli z nich. Dialog před použitím vypíše rozsahy a počet prvků v každém.

## Velikost, výplň a legenda

- **Velikost bodu podle** číselného pole zvětší čtverec každého bodu, čím větší je hodnota, a to mezi dvěma velikostmi, které zadáte (polovina strany, v milimetrech na papíře).
- **Obarvit vnitřek mnohoúhelníků** vyplní každý mnohoúhelník barvou jeho třídy (otvory zůstanou prázdné). Obarvení je na obrazovce; výstupy a DXF/DWG ukazují barevné obrysy.
- **Zobrazit legendu na půdorysu** nakreslí třídy, jejich počty a rozsah velikostí v levém dolním rohu půdorysu. Legenda je na obrazovce; ve výstupu není.
- Popisky prvků podle pole vytvoříte pomocí **Popisovat podle** ve stejné nabídce.

Styl se ukládá do souboru projektu. Sestavení, které styly nezná, otevře soubor s barvou vrstvy. Výstupy, DXF a DWG nesou třídy jako samostatné vrstvy pojmenované podle vrstvy a třídy, v nejbližší z devíti základních barev CAD. Vrstva s více než 200,000 prvky se kreslí jednou barvou.
