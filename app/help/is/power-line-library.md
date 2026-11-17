---
title: Safnið þitt af raflínuhlutum
summary: Búðu til eigin leiðara, jarðkapla, möstur, búnað og skurðargerðir, í flokkum sem þú nefnir, og deildu þeim sem skrám.
keywords: safn, leiðari, kapall, staur, mastur, þverslá, einangrari, tengihlutur, strekkivír, stag, spennir, skápur, samskeyti, skurður, flokkur, csv, flytja inn, flytja út
from: 88733744
---

Hlutinn **Safn** í vinnusvæði raflínanna geymir alla hluti sem lína eða kapall getur notað. Ekkert í honum er bundið við land eða framleiðanda: þú býrð til þá hluti sem þú vinnur með.

## Þrjár tegundir hluta

| Tegund | Hvar hún er | Er hægt að breyta henni? |
|---|---|---|
| **Dæmi** | Fylgja CivilCraft, með almennum tölum sem við reiknuðum út frá efniseiginleikum | Nei: {{ui:Afrita í mitt safn}} fyrst |
| **Í verkefni** | Komu með verkefnisskránni sem þú opnaðir | Nei: {{ui:Afrita í mitt safn}} fyrst |
| **Mitt** | Þínir eigin hlutir, geymdir í þessum vafra | Já, og breytingar vistast strax |

Sérhvert verkefni geymir afrit af hverjum hlut sem það notar, þannig að verkefni opnast á hvaða tölvu sem er með sína eigin leiðara og möstur.

:::warning
Dæmishlutirnir eru dæmi: athugaðu allar tölur gegn gögnum birgjans þíns. Jarðkaplar hafa enga straumeinkunn viljandi, því hún fer eftir því hvernig kapallinn er lagður.
:::

## Búa til hlut

1. Í **Safn** veldu **Tegund** (loftleiðara, jarðkapla, möstur, búnað eða skurðargerðir).
2. Smelltu á {{ui:Nýr hlutur}}, eða veldu dæmi og smelltu á {{ui:Afrita í mitt safn}} eða {{ui:Tvöfalda}}.
3. Fylltu inn reitina. Reitir merktir `*` eru þeir sem athuganirnar þurfa; hlutur sem vantar einn þeirra er merktur `!` og skráður undir **Athuganir** þegar lína notar hann.
4. Gefðu honum **Flokk**, með `/` á milli laga: `Loftlínur/LV/Samsett`, `Möstur/Steypa/12 m`. Trjábyggingin fylgir flokkunum þínum.

Það sem hver tegund þarf:

| Tegund | Þarf fyrir athuganirnar |
|---|---|
| Loftleiðari | þversnið, þvermál, massi á metra, brotþol, teygjustuðull, varmaþensla |
| Jarðkapall | kjarnar, þversnið, spenna, þvermál, viðnám, straumeinkunn |
| Mastur | heildarlengd, nafnálag (tekið í punkti undir toppnum), dýpt í jörðu |
| Búnaður | gerð hans; álagseinkunn fyrir þverslár, tengihluti og strekkivíra; fasabil og fall fyrir þverslár; lengd fyrir einangrara; hornið fyrir strekkivíra |
| Skurðargerð | dýpt, breidd, yfirlag yfir kaplana |

## Deila

- {{ui:Vista safnið mitt}} vistar alla hluti þína sem eina `.cclines.json`-skrá; {{ui:Opna safn…}} les hana aftur (hlutir með sama lykli eru skipt út).
- {{ui:Vista sem CSV}} vistar þá tegund sem þú ert að skoða sem töflureikni; {{ui:Opna safn…}} les CSV-skrá af þeirri tegund aftur. Dálkar mega vera í hvaða röð sem er; skrá með semíkommu getur notað aukastafakomma.
