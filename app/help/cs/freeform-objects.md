---
title: Volné objekty
summary: Přeneste na pozemek tvar vytvořený v jiné aplikaci (STL, OBJ nebo položku knihovny); stojí na terénu nebo je do něj zapuštěn a jeho objem, plocha a půdorys se počítají jako u ostatních prvků.
keywords: volný tvar, vlastní objekt, socha, truhlík, sedátko, síť, stl, obj, položka knihovny, reaguje na terén, držet se terénu, zapuštění do terénu, množství, objem, ifc
from: ec835f33
---

Jednorázový prvek (truhlík, zídka lavičky, socha, hrací násep) lze vytvořit v ModelCraft nebo PartCraft a umístit sem, aby byl ve stejném modelu a výkazech jako všechno ostatní.

1. Krajina › Více › {{ui:Volný objekt…}} a vyberte soubor **STL** nebo **OBJ** (v jednotkách projektu: stopy u projektu ve stopách, metry u projektu v metrech), nebo **položku knihovny** CadCraft (`.json`) s tělem sítě.
2. Klikněte, kam má objekt jít.

## Jeho základna

- **Drží se terénu**: jeho nejnižší bod sedí na nejnižším terénu pod půdorysem, takže nic nelevituje. Vlastnosti odhadují, kolik z něj je pod terénem.
- **Zapuštěn do terénu**: jeho základna je nastavena na výšku a terén uvnitř půdorysu je k ní upraven se svahy odkryvu, započítán v **Zemních pracích** jako plošina.

Otočte jej pomocí **Otočit**, přesuňte jej přetažením v půdorysu.

## Počítané

Vlastnosti udávají jeho **objem** (u uzavřeného tělesa), **plochu povrchu**, **půdorys** a **výšku**, měřené ze sítě. Export IFC jej zapíše s **třídou IFC**, kterou zvolíte, a s těmito množstvími.

:::note
Půdorys je konvexní obal obrysu: nekonvexní tvar (truhlík ve tvaru písmene L) se upraví, jako by byl vyplněn.
:::
