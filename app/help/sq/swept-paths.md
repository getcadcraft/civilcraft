---
title: Shtigjet e lëvizjes së automjetit
summary: Drejto një automjet me deri në tre rimorkio përgjatë një vije karakteristike ose një boshti, përpara ose duke lëvizur prapa, dhe shiko sipërfaqen që kalon, shtigjet e rrotave, timonin dhe vendin ku përkulet.
keywords: shtegu i lëvizjes, shtegu i kthesës, ndjekja e automjetit, shabllon kthese, automjet projektimi, kamion, autobus, rimorkio, gjysmërimorkio, lëvizje prapa, përkulje, artikulim, kufiri i timonit, devijim, shtegu i rrotës, rampë ngarkimi, rreze kthese
from: 8caafb8a
---

Një shteg lëvizjeje e drejton një automjet përgjatë një vije dhe tregon tokën mbi të cilën kalon trupi i tij. Përdore për të kontrolluar që një kamion mund të bëjë një kthesë, të arrijë një rampë ngarkimi ose të lëvizë prapa një rimorkio në vend pa dalë nga shtresa e rrugës.

## Drejto një automjet përgjatë një vije

1. Vizato vijën që ndjek automjeti, sipas drejtimit të lëvizjes: një vijë karakteristike (harqet janë në rregull: shtyp {{key:C}} ndërsa e vizaton, shih [Vijat karakteristike](topic:feature-lines)) ose një bosht.
2. Zgjidhe dhe kliko {{ui:Shtegu i lëvizjes…}} te **Vetitë** e saj.
3. Nën **Nis nga**, zgjidh një automjet, pastaj cakto madhësitë e tij nga automjeti yt i projektimit: gjerësinë, konsolën përpara, distancën midis akseve, konsolën prapa, gjurmën dhe **Kufirin e timonit**. Shto deri në tre rimorkio, secila me vendin ku është lidhur, gjatësinë nga lidhja te boshti i saj, konsolat e saj dhe **Artikulimin më të madh**.
4. Zgjidh **Drejtimin**: përpara ose prapa. Kliko {{ui:Drejto}}.

:::warning
Automjetet nga të cilët fillohet janë vlera të përkohshme, jo standarde. Cakto madhësitë nga automjeti i projektimit që përdor projekti yt.
:::

## Përpara dhe prapa

| Drejtimi | Çfarë ndjek vijën | Çfarë llogarit CivilCraft |
|---|---|---|
| **Përpara** | Qendra e boshtit të përparmë | Ku shkojnë boshti i pasmë dhe çdo rimorkio, këndi i timonit dhe artikulimi |
| **Prapa** | Qendra e boshtit të fundit (prapa rimorkios) | Ku shkon çdo njësi përpara, dhe timoni që i duhet kabinës për ta vendosur rimorkion atje |

Lëvizja prapa është mënyra si kontrollohet një manovër kthimi prapa: thuaj ku duhet të shkojë rimorkio dhe CivilCraft thotë nëse kabina mund ta bëjë.

## Lexo rezultatin

Shtegu i lëvizjes vizatohet në planimetri me portokalli: konturi i tij dhe, me vija të ndërprera, shtegjet e rrotave më të jashtme. Zgjidhe (kliko brenda tij) për të parë te **Vetitë**:

- **Gjatësia e përshkuar**, këndi më i madh i **Timonit** dhe **Artikulimi** kundrejt kufijve të tyre, dhe **Sipërfaqja e kaluar**.
- Çdo problem përgjatë vijës, me largësinë e tij: timoni mbi kufirin, ose një rimorkio që kthehet mbi kufirin e artikulimit (përkulet).
- **Automjeti përgjatë vijës**: lëviz rrëshqitësin për të parë automjetin në çdo pikë, me timonin dhe artikulimin e tij atje.

Ndrysho vijën dhe shtegu i lëvizjes ndiqet. {{ui:Redakto automjetin…}} ndryshon madhësitë; **Drejtimi** ndërron mes përpara dhe prapa. Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën. {{key:Delete}} fshin shtegun e lëvizjes së zgjedhur (vija mbetet).

Konturi dhe shtegjet e rrotave shkojnë në PDF, DXF dhe DWG në shtresën C-ROAD-SWPT.

## Si llogaritet

Çdo njësi rrotullohet rreth vijës së boshtit të saj të pasmë dhe tërhiqet nga pika përpara saj (boshti i përparmë, ose lidhja), modeli me shpejtësi të ulët dhe pa rrëshqitje që përdorin kontrollet e shtegut të lëvizjes. Sipërfaqja e kaluar është bashkimi i konturit të trupit në çdo pozicion. Nuk modelon shpejtësinë, rrëshqitjen e gomave, kohën që i duhet timonit për t'u kthyer, rimorkiot me timon ose hapësirën nën trup.
