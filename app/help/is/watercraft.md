---
title: WaterCraft: eftirspurn, brunaflæði, rof og aldur vatns
summary: Með viðbótinni WaterCraft breytirðu viðskiptavinum í eftirspurn á vatnsveitulögnunum þínum, athugar flæðið sem er tiltækt við hvern brunahana, sérð hvaða rof á aðallögn skaðar mest og fylgist með aldri vatns og klór yfir einn dag.
keywords: watercraft, dreifing vatns, eftirspurn, viðskiptavinir, álagsstuðull, eftirspurnarmynstur, brunaflæði, brunahani, afgangsþrýstingur, mikilvægi, rof, lokaður hluti, aldur vatns, klór, afgangur, uppruni rakinn, botnlangi, csv, viðbót
from: 76809f01
---

WaterCraft er viðbót sem vinnur á vatnsnetinu sem þú hefur þegar teiknað með verkfærunum Vatnsveitulagnir. Hún bætir flipa við hægra spjaldið með fjórum hlutum.

:::warning
Eingöngu reiknihjálp. Hún var prófuð við handreiknuð svör á tilbúnum netum, ekki á raunverulegu líkani veitu. Vatnsverkfræðingur verður að yfirfara allar niðurstöður. Engar dælustöðvar, engin annars stigs niðurbrot og engar sviðsmyndir eru enn til staðar.
:::

## Það sem þú gerir

- Setur viðskiptavini á netið sem eftirspurn.
- Finnur brunahana sem ná ekki því flæði sem þú þarft.
- Finnur lagnirnar þar sem rof skiptir mestu máli.
- Finnur gamalt vatn og lágt klórgildi.

## Skref

1. Opnaðu {{ui:Stillingar}} › {{ui:Viðbætur}} og kveiktu á {{ui:WaterCraft (dreifing vatns)}}. Flipi {{ui:WaterCraft}} birtist í hægra spjaldinu.
2. Teiknaðu lón, hnúta og lagnir fyrst með verkfærunum Vatnsveitulagnir (sjá [Vatnsveitulagnir](topic:water-mains)). Án nets segir flipinn þér að gera það.
3. Undir {{ui:Eftirspurn}} límirðu einn viðskiptavin í hverja línu: auðkenni, x, y, tegund, magn. Veldu {{ui:Álagsstuðull}} og {{ui:Klukkustundamynstur}} (íbúðadagur, atvinnudagur, jafnt eða halda mynstrinu óbreyttu). Ýttu á {{ui:Athuga}} til að sjá hvar hver viðskiptavinur lendir (næsti hnútur), síðan á {{ui:Setja á netið}}. Afturköllun tekur eftirspurnina til baka.
4. Undir {{ui:Brunaflæði}} stillirðu nauðsynlegt flæði og afgangsþrýsting, veltur fyrir þér hvort afgangurinn sé haldinn {{ui:Aðeins við brunahanann}} eða {{ui:Alls staðar í kerfinu (strangara)}}, og ýtir á {{ui:Lengd}}. Hver brunahani er talinn upp, verstur fyrst, sem nægir eða vantar.
5. Undir {{ui:Hvaða lögn skiptir mestu}} velurðu {{ui:eina lögn í einu}} eða {{ui:einn lokaðan hluta í einu}} og ýtir á {{ui:Lengd}}. Hvert rof sýnir eftirspurnina sem slitnar, hnútana sem slitna, hnúta sem falla nýir undir lágmarksþrýsting og lægsta þrýsting sem eftir er.
6. Undir {{ui:Aldur vatns og klór}} velurðu hvað á að fylgjast með (aldur vatns, klór eða uppruni rakinn), stillir klukkustundirnar sem keyra og mörkin sem þú vilt, og ýtir á {{ui:Lengd}}. Hnútar utan marka þinna eru taldir upp.
7. Ýttu á {{ui:Vista sem CSV}} undir hvaða töflu sem er til að geyma hana.

## Athugasemdir

- Nauðsynlegt brunaflæði og notkun á hvert heimili eða ekru eru upphafsgildi, ekki staðlar. Notaðu tölur veitunnar þinnar.
- Lögn sem loki klippir að hluta er lokuð í heild, þannig að rofið sem sýnt er er aðeins verra en raunverulegt rof.
- Keyrðu gæðahlutann nógu lengi til að daglega mynstrið endurtaki sig áður en þú lest síðasta daginn.
- {{ui:Stöðva}} stöðvar langa keyrslu snemma; listinn sýnir þá aðeins það sem var gert.
- Netið þitt helst í þessu verkefni og á þessari tölvu. Ekkert er sent neitt.
