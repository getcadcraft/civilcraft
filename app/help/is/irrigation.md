---
title: Áveituhönnun
summary: Reiknihjálp, ekki stimpluð hönnun: úðarar, hliðarlagnir, aðallögn, lokar og dropalínur á svæðinu; svæði fundin út frá lögnunum; þrýstitap samkvæmt Hazen–Williams, versti úðari, rennsli og þrýstingur miðað við veituna, vökvunarhraði, keyrslutími, þekja og efnisskrá.
keywords: áveita, sprinkler, sprinklers, sprey, snúningsúðari, snúningsstútur, bubbler, dropi, dropalína, dropari, loki, svæði, stöð, stýring, aðallögn, hliðarlögn, tengipunktur, vatnsveita, þrýstingur, psi, kpa, rennsli, gpm, núningstap, hazen williams, vökvunarhraði, keyrslutími, þekja, úðari í úðara, efnisskrá
from: 7d6342c1
---

:::warning
Þetta er reiknihjálp, ekki stimpluð hönnun: áveituhönnuður yfirfer hverja niðurstöðu áður en nokkuð er byggt.
:::

## Leggðu út kerfið

1. Í hlutanum **Áveita** vinstra megin velurðu **Úðara**, **Boga** hans og hvar boginn byrjar, og lagnastærðir fyrir hliðarlagnir og aðallögn.
2. {{ui:Áveita}} › {{ui:Tengipunktur}}: smelltu þar sem vatnsveitan tengist. Stilltu **þrýsting** hennar, **tiltækt rennsli** og mæli- og bakflæðistap í Eiginleikum.
3. {{ui:Áveita}} › {{ui:Loki}}: smelltu þar sem loki hvers svæðis á að vera. Loki ræsir svæði.
4. {{ui:Áveita}} › {{ui:Úðari}}: smelltu til að setja úðara; hver smellur setur einn.
5. {{ui:Áveita}} › {{ui:Hliðarlögn}}: smelltu frá loka í gegnum úðara hans og ýttu á {{key:Enter}}. {{ui:Aðallögn}}: frá tengipunktinum að hverjum loka.

Endar lagna smella á úðara, loka, veituna og aðra enda lagna, þannig að netið tengist. Svæði er allt sem næst frá loka þess eftir hliðarlögnum; aðallögnin flytur eitt svæði í einu.

## Dropavökvun

{{ui:Áveita}} › {{ui:Dropalína}}: smelltu meðfram línunni, byrjaðu þar sem hún fær vatn (enda hliðarlagnar eða loki). Stilltu **rennsli dropara** og **bil** í Eiginleikum; rennsli hennar er samanlagt rennsli dropanna meðfram henni.

## Athugunin

{{ui:Áveita}} › {{ui:Athuga kerfið…}} sýnir hvert svæði:

| Dálkur | Hvernig það er reiknað |
|---|---|
| Rennsli | Rennsli úðaranna (og dropalínanna) lagt saman |
| Við lokann | Vinnuþrýstingur versta úðarans auk tapa í lögnum að honum (Hazen–Williams, innanmál lagnarinnar, hæðarbreytingin) og tapið í lokanum |
| Við veituna | Hið sama auk taps í aðallögninni sem flytur það svæði, og mæli- og bakflæðistap |
| Vökvunarhraði | Rennsli úðaranna deilt á það svæði sem þeir vökva með úðara-í-úðara bili |
| Mínútur á viku | Til að beita stillingunni **Vökvun á viku** |
| Vandamál | Hraði yfir mörkum, úðari yfir þrýstisviði sínu, úðarar og snúningsúðarar á einum loka, ekki nægur þrýstingur eða rennsli við veituna, úðarar án svæðis, lykkjur |

Veldu loka til að sjá tölur svæðis hans og versta úðarann hans umkringdan á teikningunni. Efnisskráin telur úðara eftir gerð og boga, lagnir eftir stærð, loka, dropalínu og droppara, og stöðvar stýringarinnar. {{ui:Vista sem CSV}} geymir hvort tveggja.

Stillingar í hlutanum Áveita: **Hazen–Williams C** (150 fyrir nýjar plaströr), **mesta rennsli** í lögn (1.5 m/s), **tap í gegnum loka**, og **vökvun á viku**. Þær eru merktar sem sjálfgefin gildi.

## Þekja

{{ui:Áveita}} › {{ui:Sýna þekju}} segir hversu mikið af svæðinu úðararnir skilja eftir þurrt, hversu mikið tveir eða fleiri úðarar vökva, og hvaða úðarar ná ekki til nágranna (bil úðara í úðara).

## Úðarar

Úðararnir sem eru taldir upp eru **almennar** gerðir sem CadCraft skrifar út frá hönnunarvökvunarhraða (fastir úðarar, snúningsstútar, gírsnúðar, bubblerar, örúðarar, droparar), ekki vörur neins framleiðanda. **Bæta úðurum við úr skrá…** les þína eigin úðara (JSON-listi með kastlengd, rennsli eða vökvunarhraða og þrýstisviði hvers úðara); þeir eru vistaðir með verkefninu. Birt gögn framleiðanda eru aðeins sett inn með skráðu leyfi þess framleiðanda.

Fyrir neðan almennu úðarana hefur listinn **dæmigerða úðara** (heiti þeirra enda á "typical values"): stútastærðir fastra úðara, snúningsstúta og gírsnúða, örúðara, bubblera og droparara, með radíus, rennsli og þrýstisviði. CadCraft reiknar þá út frá birtri stærðfræði (flæðijöfnu fyrir rennsli, kvörðun kastlengdar fyrir radíus) og nafnrennslisflokkum, eingöngu úr opnum heimildum; engin tafla framleiðanda er afrituð. Veldu einn og veljarinn sýnir grundvöll hans og leyfi. Verkefni sem notar einn geymir úðarann og uppruna hans í verkefnaskránni. Þeir eru ætlaðir til áætlana: athugaðu eigin gögn raunverulega úðarans áður en þú smíðar.
