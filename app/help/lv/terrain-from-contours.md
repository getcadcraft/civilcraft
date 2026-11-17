---
title: Reljefs no horizontālajām līnijām
summary: Izveidot zemes virsmu no horizontāļu kartes: izvēlēties līniju slāņus, norādīt, no kurienes nāk katras līnijas augstums, pārbaudīt krustošanos un dublikātus un veidot. Horizontālās līnijas kļūst par lūzumlīnijām, un plakanie trijstūri uz kalnu kores, ieplakām un virsotnēm tiek laboti. Karte, kas pārzīmēta no attēla vai PDF, var tikt mērogota un novietota pēc diviem zināmiem punktiem.
keywords: horizontāles, horizontālās līnijas, reljefs no horizontālēm, virsma no horizontālēm, topogrāfiskā karte, uzmērījuma karte, bez koordinātēm, lūzumlīnijas, plakanie trijstūri, kore, ieplaka, virsotne, krustojošās horizontāles, dublētās horizontāles, horizontāļu intervāls, kartes mērogošana, divi punkti, kartes novietošana, DXF, DWG, shapefile
from: e6161653
---

Uzmērītājs reizēm nosūta horizontāļu karti: līnijas ar augstumiem, bet bez punktiem. CivilCraft izveido esošo zemi no šīm līnijām.

## Horizontāļu ievietošana

Atveriet karti kā līnijzīmējumu: DXF vai DWG zīmējumu, shapefile vai GeoJSON (**GIS** › {{ui:Importēt}} vai ievelciet failu plānā). Līnijas ienāk kā **kartes slāņi**. Zem **Virsma** › {{ui:Vairāk}} izvēlieties {{ui:Reljefs no horizontālēm}}.

## Norādiet, no kurienes nāk augstums

Atzīmējiet slāņus, kas satur horizontāles, tad izvēlieties **Augstums no**:

- {{ui:Pašu līniju augstumi}}: līnija, kuras visām virsotnēm ir viens augstums (3D polilīnija vai polilīnija ar augstumu). Līnija 0 augstumā ir plāna līnijzīmējums un augstuma nav.
- Slāņa **skaitliskais lauks** (piemēram, ELEV), ja karte to ir atnesusi.
- {{ui:Sākuma vērtība un solis, tādā secībā, kādā līnijas uzskaitītas}}: līnijām bez jebkāda augstuma. Pirmajai uzskaitītajai līnijai tiek piešķirts **Pirmās līnijas augstums**, nākamajai — tas pats plus **Horizontāļu intervāls**, un tā tālāk. Uzskaitiet līnijas no zemākās uz augšu (vai pārkārtojiet tās slānī).

## Pārbaudiet un veidojiet

{{ui:Pārbaudīt}} uzskaita, kas nav kārtībā, vārdos, pirms kaut kas mainās:

- līnija bez **augstuma** vai ar mazāk nekā diviem punktiem;
- **dublēta** līnija (tā pati forma divreiz, pat ja zīmēta pretējā virzienā);
- divas līnijas, kas **krustojas**, ar dažādiem vai vienādiem augstumiem (arī līnija, kas krustojas pati ar sevi), ar vietu;
- augstums, kas **nav uz intervāla** (rakstīšanas kļūda, piemēram, 105.5 1 m kartē).

Atzīmējiet {{ui:Izslēgt līnijas, kas krusto citu}}, lai atmestu līniju, kas krusto visvairāk citu (tad nākamo, līdz neviena nekrusto): ārpusē esoša līnija, kas šķeļ katru horizontāli, ir tā, kas tiek izņemta, nevis horizontāles. **Vienkāršot līnijas ar attālumu** samazina virsotnes, kas ir tuvāk taisnai posmam nekā šis attālums.

{{ui:Veidot zemi}} pievieno līnijas esošajai zemei kā lūzumlīnijas (viens atsaukšanas solis), tā ka virsma tieši iet cauri katrai horizontālei. Ar atzīmētu {{ui:Labot plakanos trijstūrus uz kalnu kores, ieplakām un virsotnēm}} un norādītu intervālu CivilCraft arī pievieno punktu katram plakanam trijstūrim (trijstūrim, kura stūri visi atrodas uz vienas horizontāles) tādā augstumā, kādā turpinās blakus esošā nogāze, nekad tālāk par pusi intervāla no horizontāles. Bez tā kalnu kores, ieleju dibeni un virsotnes izskatās kā plakanas plāksnes. Testa kalnā kļūda pret patieso virsmu samazinājās par ceturtdaļu; uz kores — par 40 %.

## Karte bez koordinātēm

Horizontāļu kartei, kas pārzīmēta no attēla vai PDF, atveriet **Mērogot un novietot slāņus pēc diviem zināmiem punktiem**. Norādiet divus punktus kartē un to patiesās vietas; atzīmētie slāņi tiek mērogoti, pagriezti un pārvietoti, lai atbilstu (viens atsaukšanas solis; augstumi netiek mainīti). Tie paši divi punkti dod mērogu (parādīts ziņojumā) un pagriezienu.

Virsma ir tikpat laba kā karte: starp divām horizontālēm tā ir plakne, tāpēc īstā zeme starp tām nav zināma. Pārbaudiet rezultātu pret punktveida augstumiem, pirms paļaujaties uz to.
