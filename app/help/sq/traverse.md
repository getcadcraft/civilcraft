---
title: Fut një poligonal dhe rregulloje me rregullën e busullës
summary: Shkruaj këndet ose drejtimet e fushës dhe distancat, kontrollo mbylljen këndore dhe lineare dhe saktësinë, rregullo me rregullën e busullës, dhe shto stacionet si pika rilevimi ose unazën si parcelë.
keywords: poligonal, poligon i mbyllur, unazë, kënde djathtas, vizë mbrapa, drejtime, distanca, mbyllje, mospërputhje, saktësi, rregulla e busullës, bowditch, rregullim, rilevim
from: 56ce5a8c
---

Një poligonal është një seri segmentesh të matura: në çdo stacion një kënd (ose një drejtim) dhe një distancë deri te stacioni tjetër. Kliko **Fut një poligonal** nën **Poligonal** në panelin e djathtë kur nuk ka asgjë të zgjedhur.

## Ku fillon dhe ku mbaron

1. **Fillo nga pika e rilevimit**: numri i saj. Ose shkruaj koordinatën veriore dhe lindore.
2. **Segmentet si**: **Kënde djathtas dhe distanca**, ose **Drejtime dhe distanca**.
3. Me kënde, thuaj nga ku fillojnë: një **Pika e rilevimit për vizën mbrapa**, ose **azimuti i saj** (nga stacioni i parë drejt vizës mbrapa, në drejtim orar nga veriu).
4. **Mbaron**: **kthehu te fillimi (një unazë)**, ose **në pikën e rilevimit** dhe numrin e saj (një poligonal i hapur midis pikave të njohura).

## Shkruaj segmentet

Një segment në një rresht, pastaj distanca, pastaj, nëse dëshiron, një emër për stacionin që arrin.

- Kënde djathtas, të matura në drejtim orar te stacioni nga ku del segmenti, nga stacioni prapa te stacioni tjetër: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` dhe `270.0028` gjithashtu funksionojnë.
- Drejtime: `N 45°30'15" E 125.50 B`, ose një azimut si një fjalë e vetme: `AZ 45-30-15 125.50 B`.
- Në një unazë me kënde, mbaro me `close` dhe këndin te fillimi përsëri, të matur nga stacioni i fundit te i dyti: `close 270°00'05"`. Kjo është ajo që kontrollon këndet.

Rreshtat që nuk mund të lexohen listohen me numrat e tyre të rreshtit. "feet", presjet dhe rreshtat komentues me `#` janë në rregull.

## Lexo mbylljen

Ndërsa shkruan, dialogu tregon:

- **Mospërputhja këndore**: sa larg janë këndet nga mbyllja, dhe pjesa që merr secili kënd. Pa kënd mbyllës, këndet nuk kontrollohen, dhe çdo gabim në to del në mospërputhjen lineare.
- **Mospërputhja lineare**: sa larg nga vendi ku duhet të mbarojë poligonali mbaron ai, dhe në cilin drejtim.
- **Saktësia**: gjatësia e poligonalit pjesëtuar me mospërputhjen lineare: 1 : 10,000 do të thotë 1 ft në 10,000 ft.
- Stacionet pas rregullimit, dhe sa larg lëvizi secili.

## Rregullimi

Së pari, mospërputhja këndore shpërndahet në mënyrë të barabartë mes këndeve. Pastaj mospërputhja lineare shpërndahet mes segmenteve me rregullën e busullës (Bowditch): çdo stacion lëviz kundër mospërputhjes në përpjesëtim me gjatësinë e përshkuar për ta arritur, kështu që poligonali mbaron saktësisht aty ku duhet.

:::note
Rregulla e busullës është një rregullim standard, jo me katrorët më të vegjël, dhe nuk peshon këndet kundrejt distancave. Nëse saktësia është mjaftueshmërisht e mirë, kjo varet nga standardet tuaja dhe nga juridiksioni juaj për ta vendosur.
:::

## Përdor rezultatin

- **Shto si pika rilevimi**: stacionet e rregulluara bëhen pika rilevimi me emrat që i dhe ti (përndryshe numrat e lirë të radhës), përshkrim `TRAV`, pa kotë. Stacioni i fundit i një unaze është fillimi i saj, kështu që nuk shtohet dy herë. Një hap: {{key:Mod+Z}} e zhbën.
- **Shto si parcelë** (unaza): stacionet e rregulluara bëhen një [parcelë](topic:parcels), me etiketat dhe përshkrimin e saj ligjor.
- **Raport (CSV)**: rreshtat e mbylljes, pastaj drejtimi, distanca, koordinatat e pa rregulluara dhe të rregulluara, dhe korrigjimet e secilit stacion.
