---
title: Voľné objekty
summary: Prenesie tvar vytvorený v inej aplikácii (STL, OBJ alebo položka knižnice) na lokalitu; stojí na teréne alebo do neho zapadá a jeho objem, plocha a pôdorysná plocha sa počítajú ako ostatné.
keywords: voľný tvar, vlastný objekt, socha, kvetináč, sedadlo, sieť, stl, obj, položka knižnice, reaguje na terén, nasleduje terén, zarezané do terénu, množstvá, objem, ifc
from: ec835f33
---

Jednorazový prvok (kvetináč, sedacia stena, socha, hrboľ na hranie) možno vytvoriť v ModelCraft alebo PartCraft a umiestniť sem, aby sedel v tom istom modeli a výkazoch ako všetko ostatné.

1. Krajina › Viac › {{ui:Voľný objekt…}} a vyberte súbor **STL** alebo **OBJ** (v jednotkách projektu: stopy v projekte v stopách, metre v projekte v metroch) alebo položku knižnice CadCraft (`.json`) s telesom siete.
2. Kliknite, kam má prísť.

## Jeho základňa

- **Nasleduje terén**: jeho najnižší bod sedí na najnižšom teréne pod jeho pôdorysom, takže nič nepláva. Vlastnosti odhadnú, koľko z neho je pod terénom.
- **Zarezáva do terénu**: jeho základňa sa nastaví na výšku a terén vnútri jeho pôdorysu sa upraví k nej so zarezanými svahmi; počíta sa v Zemných prácach ako plošina.

Otočte ho pomocou **Otočiť** a presuňte ho potiahnutím v pôdoryse.

## Počítané

Vlastnosti uvádzajú jeho **objem** (pre uzavrené teleso), **povrchovú plochu**, **pôdorysnú plochu** a **výšku**, merané zo siete. Export IFC ho zapíše s **triedou IFC**, ktorú zvolíte, a týmito množstvami.

:::note
Pôdorysná plocha je konvexný obal obrysu: tvar s vyhĺbením (L-kvetináč) sa upraví tak, ako keby bol vyplnený.
:::
