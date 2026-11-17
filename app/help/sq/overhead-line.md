---
title: Vizato një linjë ajrore
summary: Vendos mbajtëset në planimetri, lëre CivilCraft të përcaktojë rolin e secilës mbajtëse dhe prerjet midis fundeve të mbyllura, dhe lëviz mbajtëset në planimetri ose në profilin e linjës.
keywords: linjë ajrore, mbajtëse, shtyllë, hapësirë, prerje, fund i mbyllur, kënd, pezullim, profil, lartësi, traversë, tiran, mbajtëse me tiran
from: b8e5e272
---

## Vizato

1. Duhet të ketë një sipërfaqe: toka nën linjë vjen prej saj ([Ndërto një sipërfaqe](topic:build-surface)). Një mbajtëse pa tokë nën të renditet te **Kontrollet**; shkruaje **Kotën e tokës** në Vetitë.
2. Kliko {{ui:Linja}} te grupi Linjat elektrike dhe kliko çdo mbajtëse në planimetri.
3. Klikon dy herë te e fundit, ose shtyp {{key:Enter}}.

Linja merr përçuesin, mbajtësen dhe pajisjen që ke përdorur së fundmi në këtë kompjuter (herën e parë: shembuj nga biblioteka). Ndryshoji në Vetitë.

## Linja në Vetitë

Zgjidh linjën (kliko një hapësirë) për të vendosur **Përçuesin**, **Përçuesit për qark**, **Qarqet**, **Tensionin**, **Rregullin e hapësirës** që duhet të mbajë mbi tokë, dhe pajisjen **Në çdo mbajtëse** (një traversë, izolatorë, pjesë lidhëse). Tabela liston **prerjet** e saj me hapësirën e rregullimit, tensionin e përditshëm dhe rastin e ngarkesës që e qeveris.

## Mbajtëset

Kliko një mbajtëse për ta zgjedhur. Në Vetitë:

- **Mbajtësja**: artikulli i saj nga biblioteka. Kur është shumë e dobët, {{ui:Përdor …}} vendos mbajtësen më të vogël të të njëjtit material në bibliotekën tënde që e mban ngarkesën.
- **Roli**: Automatik, Pezullim, Kënd ose Fund i mbyllur. Automatik do të thotë: mbajtësja e parë dhe e fundit janë fund i mbyllur; një kthesë mbi këndin e rregullit bën një mbajtëse këndore; një kthesë më e madhe një fund të mbyllur.
- **Lartësia mbi tokë**: bosh e merr nga artikulli i bibliotekës (gjatësia e tij minus thellësinë në tokë).
- **Edhe në këtë mbajtëse**: pajisje shtesë, si një **tiran** (mbajtës). Një mbajtëse me tiran ia kalon tërheqjen e linjës tiranit të saj.
- **Mbajtëse ekzistuese**: kontrollohet si të tjerat, por lihet jashtë sasive.

{{ui:Mbajtëse}} shton një mbajtëse në hapësirën më të afërt me klikimin tënd. Tërhiq një mbajtëse në planimetri për ta lëvizur. {{ui:Fshi}} e heq (një linjë mban të paktën dy).

Prerjet shtrihen midis fundeve të mbyllura: brenda një prerjeje përçuesi kalon lirshëm nëpër pincat e pezullimit, kështu që një tension mban gjithë prerjen.

## Profili i linjës

Kliko {{ui:Profil gjatësor}} (ose **Profil gjatësor** te Vetitë e linjës). Paneli nën planimetri tregon tokën përgjatë linjës, çdo mbajtëse nga toka deri në majën e saj, fazën më të ulët të përçuesit me **Rastin e ngarkesës** që zgjedh, dhe hapësirën që linja duhet të mbajë si vijë me pika. Një hapësirë që dështon është e kuqe; numri nën çdo hapësirë është hapësira e saj më e ulët.

- **Linja** zgjedh linjën ajrore që shfaqet. Zgjedhja e një linje tjetër, ose e një mbajtëse të saj, në planimetri e kalon profilin tek ajo.
- Lëviz treguesin mbi profil: një vijë udhëzuese e ndjek, dhe etiketa lexon distancën përgjatë linjës, tokën, përçuesin dhe hapësirën atje (dhe thotë kur hapësira është nën rregullin e linjës).
- {{ui:Mas}} në shiritin e profilit: kliko dy pika për të marrë distancën tërthore, ndryshimin e lartësisë, distancën e drejtë dhe pjerrësinë midis tyre. Një klikim afër tokës, përçuesit ose majës së një mbajtëseje kapet në to. Kliko {{ui:Mas}} përsëri për ta ndaluar.
- Pengesat që linja kalon ngrihen nga toka: ato të vizatuara si shirita, bimët e Peizazhit si kurorën e tyre, muret si shirita (shih [Kontrollet e linjës elektrike](topic:power-line-checks#clearances)). Rrugët e kabllove dhe tubat që linja i kalon shënohen nën tokë, në majën e tyre, me emrin.

- Tërhiq një mbajtëse anash për ta zhvendosur përgjatë linjës.
- Tërhiq majën e saj lart ose poshtë për të vendosur lartësinë mbi tokë.
