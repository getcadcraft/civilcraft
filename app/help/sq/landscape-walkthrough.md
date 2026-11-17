---
title: Projekto një kopsht, nga fillimi në fund
summary: Dhjetë hapat e arkitektit të peizazhit, nga rilevimi te grupi i publikuar, me atë që bën sot hapësira e peizazhit për secilin hap dhe atë që nuk bën ende.
keywords: udhëzues, hap pas hapi, si të, projektim peizazhi, projektim kopshti, si të fillosh, shembull, mostër, hap pas hapi, rilevim, vija, terren, mbjellje, tabelë, fletë, publikim, një projekt
from: 87900bf5
---

Një projektim peizazhi bën një rreth: rilevim, skicë, vija, toka, zona, kota, mbjellje, tabela, fletë, dhe kthehet sërish. Këta janë dhjetë hapat, me atë që ekziston për secilin. Ku një hap ka një boshllëk, ai emërtohet te **Nuk është ndërtuar ende** në fund, dhe nuk fshihet brenda hapit.

Mund ta ndiqni në vendin mostër, ose në vizatimin tuaj të rilevimit. Me vizatimin tuaj, filloni nga hapi 1.

## 1. Sillni rilevimin

{{ui:Sipërfaqe}} › {{ui:Vija nga një vizatim…}}, zgjidhni vizatimin e rilevimit (DWG 2000–2018 ose DXF). Kontrolloni njësitë, merrni izoipsat, polivijat 3D dhe kufirin për sipërfaqen, dhe blloqet e pikave si pika rilevimi. Seksioni **Kotat e rilevimit dhe kontrolli** lexon kotat e shkruara si tekst ose atribut dhe liston çfarë duket e gabuar (njësitë, sistemi koordinativ, distanca nga zero, izoipsa të sheshta, kota të çuditshme, pika të dyfishta) përpara se të shtoni ndonjë gjë. Shihni [Kontrolloni një vizatim rilevimi gjatë importit](topic:survey-check) dhe [Hapni një DWG ose DXF si vija](topic:open-dwg-dxf). Vendosni sistemin koordinativ me {{ui:Sistemi koordinativ…}}.

## 2. Skicat me dorë

Një fletë në letër, si një rilevim i vjetër ose një kopje e shënuar, hyn me {{ui:Skano…}} (Fillo nga një skanim): vendoset në shkallë ose në koordinata të njohura nën planimetri, dhe mund të ndiqet në vija. ModelCraft lexon një foto të një skice me dorë (Skedar › Importo një foto skice…). Vetë CivilCraft nuk ka mjet për skicën me dorë: vendosni fletën nën planimetri dhe vizatoni mbi të.

## 3. Nga skica te vijat

Vizatoni vijat e karakteristikave dhe konturet mbi rilevimin në CivilCraft, ose vizatojini në vizatimin 2D. Peizazh › Më shumë › {{ui:Nga një vijë}} e kthen një vijë në shtresim, zonë me bimësi, mur, shkallë, vijë karakteristike dhe më shumë, të lidhura: zhvendosni vijën dhe objekti e ndjek. Shihni [Objektet nga vijat](topic:objects-from-lines). Në SuperCad Studio, hapni vendin, vizatimin dhe modelin e ndërtesës në një projekt: hapësira **Peizazh** ka mjetet e të tre, dhe një vijë e zgjedhur në vizatimin 2D mund të bëhet objekt peizazhi që e ndjek (Ctrl+K, {{ui:Objekt peizazhi nga vija e zgjedhur e vizatimit}}).

## 4. Toka e projektuar

Hapni {{ui:Sipërfaqe}} › {{ui:Më shumë}} › {{ui:Hapësira e peizazhit}}. Ndërtoni tokën e projektuar me {{ui:Platformë}}, {{ui:Bermë}}, {{ui:Kanal drenazhimi}} dhe zona nivelimi me kota pikësore dhe izoipsa; shtresimet, shtigjet, muret, rampat dhe shkallët që shtoni nivelohen në të njëjtën sipërfaqe të projektuar. Toka ekzistuese nuk ndryshon kurrë. {{ui:Kotat}} › {{ui:Modifikuesit e terrenit…}} liston gjithçka që e formon tokën, në një rend të vetëm, me prerjen dhe mbushjen për secilën. Shihni [Nivelimi](topic:landscape-grading) dhe [Modifikuesit e terrenit dhe kotat aktive](topic:ground-modifiers).

## 5. Shtresimi dhe zonat me bimësi

{{ui:Elemente të ngurta}} › {{ui:Shtresim}}, {{ui:Shteg}}, {{ui:Mur}}, {{ui:Kordon}}, {{ui:Rampë}} dhe {{ui:Shkallë}}. {{ui:Sipërfaqet}} vizaton një prato, shtrat, livadh ose mbulesë toke me ndërtimin e vet; ajo pritet vetë rreth shtresimit, mureve dhe shkallëve. {{ui:Shtrat}} mbush një zonë sipas distancës së bimëve, nga një përzierje bimësh. Shihni [Elementet e ngurta](topic:hardscape), [Zonat me bimësi](topic:planted-areas) dhe [Mbjellja](topic:planting).

## 6. Kotat, pjerrësitë dhe kryqëzimet

Te **Kontrollet e nivelimit**, shënoni **Analiza e pjerrësisë** dhe **Shigjetat e rrjedhjes dhe grumbullimi i ujit**. Nëse uji grumbullohet pranë një terrace, shtoni një {{ui:Kanal drenazhimi}} rreth tij. Vetitë ju tregojnë sa ngritës u duhen shkallëve dhe nëse përshtaten, dhe ku një shteg është më i pjerrët se kufiri i tij. Paneli i Problemeve liston ku objektet takohen keq: një mur i tejkaluar, një shtrat mbi shtresimin, shkallë që nuk e arrijnë pllakën e pushimit. {{ui:Kotë pikësore}} dhe {{ui:Shigjetë pjerrësie}} shënojnë tokën dhe përditësohen vetë.

## 7. Mbjellja

Te **Bimët**, kërkoni listën e bimëve (disa qindra specie, ose listën tuaj), zgjidhni një, dhe {{ui:Bimë}}, {{ui:Shtrat}} ose {{ui:Gardh gjelbër}}. Vendosni madhësinë dhe etiketat e bimës nga Më shumë. Më shumë › {{ui:Tabela e bimëve}} redakton regjistrat tuaj: kultivarët, madhësitë e furnizuara, dendësinë, shënimet e specifikimit. Çdo regjistër mund të mbajë simbolin dhe modelin tuaj 3D (OBJ, STL ose GLB), dhe Më shumë › {{ui:Grafika e bimëve}} vizaton bimët më thjesht në shkallë më të trasha. Shihni [Lista e bimëve](topic:plant-list), [Regjistrat e bimëve](topic:plant-records) dhe [Grafika e bimëve](topic:plant-graphics).

## 8. Sasitë dhe tabelat

Më shumë › {{ui:Tabelat e punës}}: tabelat e bimëve dhe të elementeve të ngurta, dhe ato tuajat, mbeten të lidhura me objektet; ruajini si CSV ose XLSX ose vendosini në fletë (shihni [Tabelat e punës](topic:worksheets)). Më shumë › {{ui:Tabela e bimëve…}} dërgon numërimet te TakeoffCraft. Sasitë e elementeve të ngurta janë te Vetitë e shtresimit, të murit dhe të shkallëve. Ujitja ka listën e vet të materialeve: {{ui:Ujitje}} › **Kontrollo sistemin…**. Shihni [Ujitja](topic:irrigation).

## 9. Vizatimet dhe fletët

Më shumë › {{ui:Fletë peizazhi…}}: planet e mbjelljes, nivelimit dhe ujitjes, me detaje. {{ui:Kotat}} › {{ui:Vijë prerjeje}} vizaton prerje nëpër tokë, mure, ndërtime, shkallë dhe bimë. Shihni [Fletët e peizazhit](topic:landscape-sheets) dhe [Prerjet dhe grupi i publikimit](topic:landscape-sections).

## 10. Publikimi

{{ui:Grupi i publikimit (.zip)}} te dialogu i fletëve bën një PDF me listën e fletëve dhe një DWG për çdo fletë. Më shumë › {{ui:Eksporto IFC të peizazhit}} i jep BimCraft bimët dhe elementet e ngurta. Ruani projektin: çdo gjë është në një skedar të vetëm.

## Ndryshoni një gjë: shkallët

Pika e mbajtjes së gjithçkaje në një projekt është që një ndryshim të kalojë kudo. Provojeni me një fluturë shkallësh midis dy terracave:

1. Vizatoni vijën e fluturës si vijë karakteristike (ose si vijë në vizatim), pastaj Peizazh › Më shumë › {{ui:Nga një vijë}} › {{ui:Shkallë}}. Te Vetitë e shkallëve shënoni **Formon tokën**, dhe vendosni kotat e poshtme dhe të sipërme në dy terracat.
2. Vizatoni një shtrat të mbjellë pranë dhe nën fluturën me {{ui:Sipërfaqet}}, dhe shtresim mbi terracat. Shtrati pritet vetë rreth shkallëve dhe shtresimit, dhe tabela e bimëve numëron vetëm atë që është mbjellë.
3. Rrisni kotën e sipërme të fluturës te Vetitë. Toka e projektuar, kotat pikësore, shigjetat e pjerrësisë dhe prerja dhe mbushja ndryshojnë menjëherë. Nëse fluturja nuk takohet më me terracën e sipërme, paneli i Problemeve thotë sa.
4. Zhvendosni vijën e fluturës. Shkallët e ndjekin vijën e tyre në të njëjtin hap zhbërjeje; shtrati pritet sërish dhe rinumërohet, dhe tabelat e punës dhe tabelat tregojnë numrat e rinj.
5. Shtypni Ctrl+Z një herë: vija, shkallët, toka dhe shtrati kthehen bashkë.

Shihni [Modifikuesit e terrenit dhe kotat aktive](topic:ground-modifiers), [Zonat me bimësi](topic:planted-areas) dhe [Tabelat e punës](topic:worksheets).

## Nuk është ndërtuar ende

Këto kërkohen dhe nuk janë në këtë version:

- Mure që formojnë tokën (ata raportojnë ku e takojnë atë, dhe maja e tyre mund ta ndjekë).
- Redaktimi i listës sime të bimëve nga Biblioteka në aplikacion (redaktoni listën e projektit dhe ruajeni si skedar bimësh).
- Teksturat dhe ngjyrat e modeleve tuaja GLB të bimëve (forma lexohet; përdoret ngjyra e bimës).

Shihni [Hapësira e peizazhit](topic:landscape) për çdo mjet.
