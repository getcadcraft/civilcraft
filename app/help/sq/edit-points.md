---
title: Redakto një pikë rilevimi
summary: Ndrysho numrin, koordinatat, kotën ose përshkrimin e një pike, ose tërhiqe në një vend tjetër të planimetrisë.
keywords: redakto pikën, zhvendos pikën, ndrysho kotën, ri-numëro, numri i pikës, përshkrim, tërhiq, veri, lindje, rregullo një pikë, gabim matjeje
from: 375ae2e9
---

Një matje e gabuar, një lartësi e gabuar e shufrës, një përshkrim i shkruar keq: rregulloni vetëm pikën dhe sipërfaqja ndjek.

## Ndrysho vlerat e një pike

1. Me {{ui:Select}}, klikoni pikën në planimetri. **Vetitë** tregon numrin, lindjen, veriun, kotën dhe përshkrimin në kutitë e tyre.
2. Shkruani vlerën e re dhe shtypni {{key:Enter}} (ose klikoni jashtë). Lëreni **Kotën** bosh për një pikë pa kotë.
3. Sipërfaqja, izoipsat dhe gjithçka e ndërtuar mbi to përditësohen menjëherë.

Çdo ndryshim është një hap: {{key:Mod+Z}} e zhbën dhe {{key:Mod+Y}} e ribën. Një vlerë që CivilCraft nuk e pranon (një numër që e ka tashmë një pikë tjetër, shkronja në një koordinatë) refuzohet: kutia merr kontur dhe shiriti i statusit thotë pse.

Një kod i ri përshkrimi krijon një grup të ri pikash, ashtu si bën një import (shih [Ndërto një sipërfaqe](topic:build-surface)).

## Zhvendos një pikë në planimetri

1. Përzgjidhni pikën (merr një unazë).
2. Tërhiqni unazën. Shiriti i statusit tregon lindjen dhe veriun ku do të shkojë.
3. Lëshoni për ta zhvendosur; kota e saj mbetet. Shtypni {{key:Esc}} përpara se ta lëshoni për ta kthyer aty ku ishte.

## Vijat e thyerjes ndjekin pikën

Një vijë thyerjeje e vizatuar me mjetin {{ui:Breakline}} kopjon pikat nga të cilat kalon. Kur zhvendosni një pikë ose ndryshoni kotën e saj, pikat e kthesës së vijës së thyerjes mbi të zhvendosen me të, në të njëjtin hap. Grupet e vijave të thyerjes të bëra nga përshkrimet rindërtohen gjithmonë nga pikat.

:::note
Një sipërfaqe e lexuar nga një skedar LandXML e mban trekëndëshat e vet: ndryshimet e pikave e ndryshojnë atë vetëm pasi të përdorni {{ui:Rebuild the surface from the points}}.
:::
