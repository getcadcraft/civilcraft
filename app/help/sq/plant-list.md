---
title: Lista e bimëve
summary: Rreth 420 bimë të zakonshme të klimës së butë dhe mesdhetare me madhësitë, qëndrueshmërinë, dritën dhe ujin e tyre, të kërkueshme në çdo gjuhë, plus lista juaj e vetme e ruajtur me projektin.
keywords: lista e bimëve, baza e bimëve, specie, emri botanik, emri i zakonshëm, paleta e bimëve, listë fidanishtesh, zona e qëndrueshmërisë, csv, importo bimët, eksporto bimët, bimët e mia, listë pemësh, listë shkurresh, bibliotekë bimësh
from: 7ed09e7e
---

Seksioni **Bimët** i panelit të majtë liston çdo bimë që mund të vendosni. Klikoni një për të parë madhësitë e saj dhe për ta bërë bimën që përdorin **Bimë**, **Shtrat** dhe **Gardh gjelbër**.

## Kërko dhe filtro

Shkruani te **Kërko**: çdo fjalë e emrit të një bime në çdo gjuhë (anglisht, spanjisht, portugalisht), emrin e saj botanik, llojin ose një fjalë në shënimet e saj. Çdo fjalë që shkruani duhet të përputhet, kështu që `quercus evergreen` gjen ahat e përhershme. Shkronjat me theks nuk kanë rëndësi.

Ngushtoni listën me **Llojin**, **Dritën**, **Ujin** dhe **Zonën e qëndrueshmërisë** (zona USDA ku ndodhet vendi juaj: një bimë shfaqet kur zona është brenda intervalit të saj).

## Çfarë mban një bimë

| Fusha | Kuptimi |
|---|---|
| Lloji | Pemë, shkurre, gardh, bar (përfshirë lëndinat), shumëvjeçare, mbulesë tokësore ose hipëse |
| Në pjekuri | Lartësia dhe përhapja e bimës e rritur në kopsht ose në rrugë, në metra |
| Në mbjellje | Madhësia me të cilën mbillet, dhe enë e saj |
| Distanca | Nga qendra në qendër në një shtrat ose përgjatë një gardhi |
| Zona e qëndrueshmërisë | Zonat USDA ku zakonisht rezistohet |
| Drita, uji, toka | Çfarë i nevojitet |
| Shënime | Përdorime dhe paralajmërime, si pjesë toksike ose një bimë që përhapet |

:::note
Lista e integruar u shkrua për CadCraft nga njohuritë e përgjithshme hortikulturore: madhësi tipike, të rrumbullakosura. Nuk është katalogu i ndonjë fidanishteje. Kontrolloni madhësitë dhe qëndrueshmërinë me një fidanishte lokale. Bimët invazive më të njohura të Iberisë dhe të pjesës më të madhe të botës së butë janë lënë jashtë me qëllim, dhe disa që janë invazive diku kanë një shënim.
:::

## Bimët e tua

- **Shto në listën e këtij projekti** kopjon një bimë në listën e vetë projektit, ku ruhet me projektin. Një bimë në listën tuaj zëvendëson atë të integruar me të njëjtin çelës, kështu që mund t'i ndryshoni madhësitë për rajonin tuaj.
- **Importo një listë bimësh…** lexon një CSV (ose një skedar bimësh). CSV-ja ka nevojë për një kolonë me emrin botanik dhe, në mënyrë ideale, llojin, lartësinë dhe përhapjen; emrat e kolonave me fjalët tuaja funksionojnë (Latin, Emri i zakonshëm, Lartësia, Përhapja, Gjerësia, Zona). Lexohen presje, pikëpresje ose tab-e, si dhe presje dhjetore. Madhësitë bosh të mbjelljes, distancat dhe enët marrin parazgjedhje të arsyeshme për llojin.
- **Eksporto si CSV** ruan listën tuaj (ose, nëse nuk ka, bimët që tregon kërkimi) për ta hapur në një fletëllogaritëse.

Një listë bimësh lexohet si çdo skedar nga jashtë: çdo gjë që nuk mund ta përdorë lihet jashtë dhe numërohet.

## Bimët në aplikacione të tjera

Lista e bimëve është një bibliotekë për çdo aplikacion CadCraft: BimCraft dhe ModelCraft mbajnë të njëjtën listë, por "Vendos nga biblioteka" e tyre nuk ofron ende bimë. Sot bimët arrijnë te një model BIM përmes IFC-së së peizazhit të CivilCraft (çdo bimë si një `IfcGeographicElement`). Shih [Mbjellja](topic:planting#ifc).
