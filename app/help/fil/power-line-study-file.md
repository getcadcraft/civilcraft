---
title: Mga study file para sa ibang line program (.DON)
summary: I-save ang isang overhead line bilang .DON study file, o basahin ang mga support ng isa papasok sa bagong line. Hindi pa nasusubukan sa program na bumabasa nito.
keywords: don, .don, study file, xml, export, import, overhead line program, stringing, canton
from: 1abc4d07
---

May ilang overhead-line program na nagtatago ng study sa `.DON` file (XML text). Maisusulat ng CivilCraft ang isang linya bilang ganoong file at makakabasa ng mga support ng isa.

:::warning
**Hindi pa nasusubukan.** Ginawa namin ito mula sa listahan ng mga pangalan ng field ng format na ibinahagi ng isang user, hindi mula sa totoong file, at hindi pa namin nabubuksan ang mga file namin sa program na bumabasa nito. Buksan ang file doon at suriin ang bawat value bago mo ito pagkatiwalaan. Kung maibabahagi mo ang isang `.DON` file (na tinanggalan ng detalye ng kliyente), makakatulong ito para maayos namin ito nang tama.
:::

## I-save ang study file

1. Bigyan ang linya ng conductor at siguraduhing may resulta ito (walang "not worked out" sa Properties nito).
2. {{ui:More}} › {{ui:Save a study file (.DON)…}}, piliin ang linya, magdagdag ng description at job number.
3. {{ui:Save the study file}}.

Nasa file ang mga support ng linya (coordinates, ground, taas, tungkulin, crossarm, ang support na itinago o mungkahi, load bawat load case, foundation), isang seksyon bawat bahagi sa pagitan ng mga dead-end (conductor, boltahe, ruling span, span, tension at catenary parameter, ang pinakamalaking tension bawat load case) at ang stringing tables. Nasa metro ang mga haba at nasa daN ang mga puwersa; nakasulat ang teksto sa Latin-1, kaya ang karakter na wala roon ay nagiging `?`.

## Basahin ang study file

{{ui:More}} › {{ui:Open a study file (.DON)…}} ay binabasa ang mga support papasok sa bagong linya. Itinutugma ang conductor, support at crossarm sa library mo ayon sa pangalan; ang anumang hindi nakita ay iiwan para pumili ka sa Properties.
