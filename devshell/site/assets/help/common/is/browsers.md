---
title: Vafrar og tölvur
summary: Hvaða vafrar forritin keyra í, hvað er ólíkt á milli þeirra og hvað tölvan þín þarf.
keywords: chrome, edge, firefox, safari, brave, vafri, mac, windows, linux, ipad, spjaldtölva, webgl, kröfur, minni
from: a11b09b1
---

Forritin keyra inni í vefvafra. Þau vinna verkið á þinni eigin tölvu: skrárnar þínar eru opnaðar þar og aldrei sendar til okkar (sjá [Hvert skrárnar þínar fara](common:your-files)).

## Hvaða vafra

Notaðu nýjustu útgáfu af einum af þessum:

| Vafri | Vél | Athugasemdir |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Fullkomnastur: val á möppu, vistun til notkunar án nettengingar, meðhöndlun skráa. |
| Firefox | Gecko | Virkar. Opnun heillar möppu notar einfaldari val. Vistun án nettengingar virkar hugsanlega ekki í einkagluggum. |
| Safari | WebKit | Virkar á Mac og iPad. Opnun heillar möppu notar einfaldari val. Safari getur eytt afriti sem þú hefur ekki notað í nokkrar vikur. |

Allar þrjár vélarnar eru góðar í daglegri vinnu. Þar sem forrit gerir eitthvað öðruvísi í einni þeirra sýnir hjálpin skrefin fyrir vafrann þinn.

## Hvað er ólíkt á milli vafra

- **Opnun möppu.** Chromium-vafrar sýna alvöru val á möppu og geta lesið möppuna beint. Firefox og Safari biðja þig um að velja möppu og lesa síðan hverja skrá í henni, sem tekur lengri tíma fyrir stórar verkefnamöppur; að draga möppuna á forritið virkar í öllum þremur.
- **Vistun.** Forritin vista með því að sækja skrá. Vafrinn ákveður hvert niðurhal fer og hvort hann spyr fyrst.

:::chromium
Í Chrome eða Edge skaltu kveikja á „Spyrja hvar á að vista hverja skrá áður en hún er sótt“ (í Stillingum, undir Niðurhal) til að velja möppu í hvert sinn.
:::

:::firefox
Í Firefox skaltu opna Stillingar, síðan Almennt, síðan Niðurhal, og velja „Alltaf spyrja hvar á að vista skrár“ til að velja möppu í hvert sinn.
:::

:::safari
Í Safari skaltu opna Stillingar, síðan Almennt, og stilla „Staðsetning skráaniðurhals“ á „Spyrja við hvert niðurhal“ til að velja möppu í hvert sinn.
:::

## Mac, Windows og Linux

Forritin eru eins á hverri tölvu. Það sem breytist er lyklaborðið: flýtilyklar eru skrifaðir fyrir tölvuna þína sjálfkrafa. Sjá [Lyklar, mýs og snertiborð](common:keys).

## Spjaldtölvur og snertiskjáir

Sum forrit taka við snertingu (einn fingur teiknar eða velur, tveir fingur klípa til að breyta aðdrætti og hliðra). Hjálp hvers forrits segir hvort það gerir það. Á iPad skaltu nota Safari eða Chrome. Lyklaborð hjálpar við forrit sem nota innslegnar skipanir.

## Elstu vafrar og stýrikerfi

Við lesum þetta úr kóða 0.7 forritanna, ekki af ágiskun: hver skrá var þáttuð og hvert tungumálaatriði sem hún notar var flett upp í birtum samhæfnigögnum vafranna. Undir þessum útgáfum geta forritin ekki einu sinni ræst, því vafrinn skilur ekki kóðann.

| | Elsta útgáfa sem getur ræst forritin |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS og iOS 16.4) |

CadCraft Studio ber sína eigin vefvél á Windows, svo það þarf Windows 10 eða 11; á Mac notar það vél kerfisins, svo það þarf macOS 13.3 eða nýrra. Stillingar › Uppfærslur í Studio sýnir á hverju afritið þitt keyrir.

Þetta er elsta útgáfan sem *ræsist*, lesin úr kóðanum. Þetta er ekki listi yfir gamla vafra sem við höfum keyrt forritin í, svo eldri útgáfa sem ræsist gæti samt vantað eiginleika.

## Það sem tölvan þín þarf

Þetta eru áætluð lágmörk fyrir forritin, ekki mældar kröfur:

- 8 GB minni (16 GB er ráðlagt fyrir stór samtengd líkön).
- Skjástýring með WebGL 2 fyrir þrívíddarforritin. Ef þrívíddarsýnin er áfram auð skaltu athuga hvort vélbúnaðarhröðun sé kveikt í stillingum vafrans.
- Skjár að minnsta kosti 1280 pixlar á breidd fyrir allar tækjastikurnar; minni skjáir vefja þær.

Mjög stórar skrár (stór verkteikningasöfn, stór líkön) nota mikið minni í vafraflipa. Lokaðu öðrum þungum flipum ef forrit hægir á sér.
