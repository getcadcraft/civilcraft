---
title: Planet e mbjelljes dhe tabelat
summary: Vendos bimë të vetme, shtrate mbjelljeje të mbushura sipas distancës së bimëve me bimë të përziera sipas përqindjes, dhe gardhe; etiketoji; numëroji në një tabelë bimësh për një fletëllogaritëse ose TakeoffCraft.
keywords: plan mbjelljeje, tabelë bimësh, shtrat mbjelljeje, mbjellje masive, gardh gjelbër, pemë, shkurre, mbulesë tokësore, distancë, distancë trekëndore, numërim bimësh, sasi, etiketa, kurorë, simbolet e bimëve, ifc, takeoff
from: ab49eab5
---

## Vendos bimë

1. Zgjidhni një bimë te **Bimët** në të majtë.
2. Klikoni {{ui:Bimë}}, pastaj klikoni në plan: çdo klikim vendos një bimë. Shtypni {{key:Esc}} për të ndalur.

Simboli i bimës vizatohet me përhapjen e saj në pjekuri; Më shumë › {{ui:Shfaq në madhësinë e mbjelljes}} vizaton çdo bimë me madhësinë me të cilën mbillet. Pemët qëndrojnë në tokë nën to: kur më vonë e niveloni sitin, ato e ndjekin atë. Për ta fiksuar një bimë në një kotë, shkruajeni te **Kota** në Vetitë.

## Shtrate mbjelljeje

1. Zgjidhni bimën kryesore, klikoni {{ui:Shtrat}} dhe klikoni cepat e shtratit. Shtypni {{key:Enter}} (ose klikoni përsëri cepin e parë) për ta mbyllur.
2. Shtrati mbushet me atë bimë sipas distancës së saj, në model **trekëndor** (zakonisht: çdo bimë në të njëjtën distancë nga gjashtë të tjerat), gjysmë distancë brenda nga buza.
3. Te Vetitë, **Shto një bimë** përzien bimën e zgjedhur në të majtë. Vendosni **Përqindjen e pjesës** të secilës bimë: shtrati merr saktësisht aq nga secila, e shpërndarë në të gjithë. **Përzie përsëri** ndryshon vendet.

**Distanca** bosh përdor distancën e vetë bimëve (e peshuar me pjesët e tyre); shkruani një për ta përdorur për çdo bimë. **Modeli** mund të jetë katror, dhe **Rreshtat në** i kthen rreshtat.

## Gardhe

Zgjidhni bimën e gardhit, klikoni {{ui:Gardh gjelbër}}, klikoni përgjatë gardhit dhe shtypni {{key:Enter}}. Bimët vendosen përgjatë vijës sipas distancës së tyre, të qendërzuara në mënyrë që të dy skajet të kenë të njëjtën hapësirë. Një gardh mund të jetë **dy rreshta, të zhvendosur**, në një distancë të caktuar.

## Etiketat

Bimët e vetme etiketohen me cilësimin e etiketës (`{name}` si parazgjedhje); shkruani etiketën tuaj për një bimë në Vetitë. Shtretë etiketohen me numrin e secilës bimë, gardhet me të tyren. Më shumë › {{ui:Etiketat e bimëve}} i ndez dhe i fik etiketat. Fushat e etiketës: `{name}`, `{botanical}`, `{size}` (enë), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Tabela e bimëve

Më shumë › {{ui:Tabela e bimëve…}} numëron çdo bimë sipas specieve, nga bimët e vetme, shtretë dhe gardhe së bashku, me madhësinë e mbjelljes. Ruajeni si **CSV** ose **XLSX**, ose **Dërgo te TakeoffCraft**: një skedar sasish që TakeoffCraft e hap për të çmuar bimët (me sasitë e shtrimit dhe ujitjes pranë tyre).

## IFC

Më shumë › {{ui:Eksporto IFC të peizazhit}} ruan peizazhin si skedar IFC (IFC 4.3) që një model BIM mund ta mbajë: çdo bimë është një `IfcGeographicElement` i tipit VEGETATION, i emërtuar sipas specieve me vetitë e bimës (emri botanik, madhësitë, qëndrueshmëria, uji, drita); çdo shtrat dhe gardh është një element me numrat e vet, në vend. BimCraft e hap pranë ndërtesës.
