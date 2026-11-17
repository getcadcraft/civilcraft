---
title: Rediģēt uzmērījuma punktu
summary: Mainīt viena punkta numuru, koordinātas, augstumu vai aprakstu vai pavilkt to uz jaunu vietu plānā.
keywords: rediģēt punktu, pārvietot punktu, mainīt augstumu, pārnumurēt, punkta numurs, apraksts, vilkt, ziemeļu koordināta, austrumu koordināta, labot punktu, kļūdains mērījums
from: 375ae2e9
---

Kļūdains mērījums, nepareizs stieņa augstums, nepareizi ierakstīts apraksts: izlabojiet vienu punktu, un virsma seko tam.

## Mainīt punkta vērtības

1. Ar {{ui:Atlasīt}} noklikšķiniet uz punkta plānā. **Rekvizīti** rāda tā numuru, austrumu koordinātu, ziemeļu koordinātu, augstumu un aprakstu lodziņos.
2. Ierakstiet jauno vērtību un nospiediet {{key:Enter}} (vai noklikšķiniet citur). Punktam bez augstuma atstājiet lauku **Augstums** tukšu.
3. Virsma, horizontāles un viss, kas uz tām balstīts, tiek atjaunināti uzreiz.

Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc, un {{key:Mod+Y}} to atkārto. Vērtība, ko CivilCraft nevar izmantot (numurs, ko jau ir cits punkts, burti koordinātā), tiek noraidīta: lodziņš tiek iezīmēts, un statusa joslā norādīts iemesls.

Jauns aprakstu kods izveido jaunu punktu grupu, kā to dara imports (skatīt [Virsmas veidošana](topic:build-surface)).

## Pārvietot punktu plānā

1. Atlasiet punktu (tam parādās gredzens).
2. Velciet gredzenu. Statusa josla rāda austrumu un ziemeļu koordinātas, kur punkts nonāks.
3. Atlaidiet, lai pārvietotu; augstums paliek. Pirms atlaišanas nospiediet {{key:Esc}}, lai punktu atgrieztu vietā.

## Lūzumlīnijas seko punktam

Lūzumlīnija, ko zīmējat ar rīku {{ui:Lūzumlīnija}}, kopē punktus, caur kuriem tā iet. Kad pārvietojat punktu vai mainiet tā augstumu, lūzumlīnijas stūri uz tā pārvietojas kopā ar to tajā pašā solī. Lūzumlīniju grupas, kas izveidotas no aprakstiem, vienmēr tiek pārbūvētas no punktiem.

:::note
Virsma, kas ielasīta no LandXML faila, saglabā savus trijstūrus: punktu rediģēšana to maina tikai pēc {{ui:Pārbūvēt virsmu no punktiem}}.
:::
