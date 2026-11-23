---
title: WaterCraft: eftirspurn, brunaflæði, rof og vatnsaldur
summary: Með WaterCraft-viðbótinni breytirðu viðskiptavinum í eftirspurn á vatnslagnirnar þínar, athugar rennslið sem er tiltækt við hvern brunahana, sérð hvaða rof á lögn skaðar mest, og fylgist með vatnsaldri og klór yfir einn dag.
keywords: watercraft, vatnsdreifing, eftirspurn, viðskiptavinir, álagsstuðull, eftirspurnarmynstur, brunaflæði, brunahani, leifarþrýstingur, mikilvægi, rof, lokað hluti, vatnsaldur, klór, leifar, uppruna rakning, blindgata, csv, viðbót
from: 066fb17a
---

WaterCraft er viðbót sem vinnur á vatnsnetinu sem þú hefur þegar teiknað með verkfærunum fyrir vatnslagnir. Hún bætir flipa við hægra spjaldið með fjórum hlutum.

:::warning
Aðeins reiknihjálp. Hún var prófuð gegn handreiknuðum svörum á tilbúnum netum, ekki á raunverulegu líkani veitu. Vatnsverkfræðingur verður að athuga hverja niðurstöðu. Sviðsmyndir, stýrireglur, lokar og vettvangsmælingar hafa sín eigin efni, „Sviðsmyndir“ og „Rannsóknir“, í hjálp viðbótarinnar WaterCraft.
:::

## Það sem þú gerir

- Setur viðskiptavini á netið sem eftirspurn.
- Finnur brunahana sem ná ekki því rennsli sem þú þarft.
- Finnur lagnir sem tap þeirra skiptir mestu máli.
- Finnur gamalt vatn og lágt klór.

## Skref

1. Opnaðu {{ui:Stillingar}} › {{ui:Viðbætur}} og kveiktu á {{ui:WaterCraft (vatnsdreifing)}}. Flipinn {{ui:WaterCraft}} birtist í hægra spjaldinu.
2. Teiknaðu geymi, hnúta og pípur með verkfærunum fyrir vatnslagnir fyrst (sjá [Vatnsveitulagnir](topic:water-mains)). Án nets segir flipinn þér að gera það.
3. Undir {{ui:Eftirspurn}} límirðu einn viðskiptavin í línu: auðkenni, x, y, tegund, magn. Veldu {{ui:Álagsstuðull}} og {{ui:Klukkustundarmynstur}} (íbúðardagur, atvinnudagur, flatt, eða haltu mynstrinu eins og það er). Ýttu á {{ui:Athuga}} til að sjá hvar hver viðskiptavinur lendir (næsti hnútur), og síðan á {{ui:Setja inn í netið}}. {{ui:Afturkalla}} tekur eftirspurnina aftur.
4. Undir {{ui:Brunaflæði}} stillirðu nauðsynlegt rennsli og leifarþrýsting, velur hvort leifarþrýstingurinn er haldinn {{ui:Aðeins við brunahana}} eða {{ui:Alls staðar í kerfinu (strangara)}}, og ýtir á {{ui:Lengd}}. Hver brunahani er skráður, verstur fyrst, sem nægur eða ófullnægjandi.
5. Undir {{ui:Hvaða lögn skiptir mestu máli}} velurðu {{ui:eina pípu í einu}} eða {{ui:einn hluta með lokum í einu}} og ýtir á {{ui:Lengd}}. Hvert rof sýnir eftirspurnina sem er skorin af, hnútana sem eru skornir af, hnútana sem fara nýlega niður fyrir lágmarksþrýsting og lægsta þrýstinginn sem eftir er.
6. Undir {{ui:Vatnsaldur og klór}} velurðu hvað skal fylgjast með (vatnsaldur, klór eða uppruna rakning), stillir klukkustundirnar sem keyra og þau mörk sem þú vilt, og ýtir á {{ui:Lengd}}. Hnútar utan markanna þinna eru skráðir.
7. Ýttu á {{ui:Vista sem CSV}} undir hvaða töflu sem er til að geyma hana.

## Athugasemdir

- Nauðsynlegt brunarennsli og notkun á hvert heimili eða hvern ekru eru upphafsgildi, ekki staðlar. Notaðu tölur þinnar eigin veitu.
- Pípa sem er að hluta lokuð af loka er lokuð í heild, þannig að rofið sem sýnt er er aðeins verra en raunverulegt rof.
- Keyrðu vatnsgæðahlutann nógu lengi til að daglega mynstrið endurtaki sig áður en þú lest síðasta daginn.
- {{ui:Stöðva}} endar langri keyrslu snemma; listinn sýnir þá aðeins það sem var gert.
- Netið þitt er áfram í þessu verkefni og á þessari tölvu. Ekkert er sent neitt.
