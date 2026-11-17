---
title: Rannsóknarskrár fyrir annað línuforrit (.DON)
summary: Vistaðu eina loftlínu sem .DON-rannsóknarskrá, eða lestu möstur úr einni slíkri inn í nýja línu. Ekki prófað með forritinu sem les þær.
keywords: don, .don, rannsóknarskrá, xml, útflutningur, innflutningur, loftlínuforrit, strengingar, canton
from: 1abc4d07
---

Sum loftlínuforrit geyma rannsókn í `.DON`-skrá (XML-texti). CivilCraft getur skrifað eina línu sem slíka skrá og lesið möstur úr einni.

:::warning
**Ekki prófað.** Við smíðuðum þetta út frá lista yfir heiti sviða skráarsniðsins sem notandi deildi, ekki út frá raunverulegri skrá, og við höfum ekki opnað skrárnar okkar í forritinu sem les þær. Opnaðu skrána þar og athugaðu hvert gildi áður en þú treystir henni. Ef þú getur deilt `.DON`-skrá (með upplýsingum um viðskiptavininn fjarlægðum) hjálpar það okkur að laga þetta.
:::

## Vista rannsóknarskrá

1. Gefðu línunni leiðara og gakktu úr skugga um að hún hafi niðurstöður (ekkert „ekki reiknað út" í eiginleikum hennar).
2. {{ui:Meira}} › {{ui:Vista rannsóknarskrá (.DON)…}}, veldu línuna, bættu við lýsingu og verknúmeri.
3. {{ui:Vista rannsóknarskrána}}.

Skráin geymir möstur línunnar (hnit, undirlag, hæðir, hlutverk, þverslá, mastrið sem er geymt eða stungið upp á, álag eftir álagstilviki, undirstöðu), einn kafla fyrir hvert svæði milli endastöðva (leiðari, spenna, reglubil, bil, átak og keðjulínustuðull, mesta átak eftir álagstilviki) og strengingartöflurnar. Lengdir eru í metrum og kraftar í daN; texti er skrifaður í Latin-1, þannig að stafur utan þess verður `?`.

## Lesa rannsóknarskrá

{{ui:Meira}} › {{ui:Opna rannsóknarskrá (.DON)…}} les möstrin inn í nýja línu. Leiðarinn, möstrin og þverslárnar eru paraðar við safnið þitt eftir heiti; það sem finnst ekki er skilið eftir fyrir þig að velja í eiginleikum.
