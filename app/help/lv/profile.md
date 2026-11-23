---
title: Vertikālā garenprofila projektēšana
summary: Atveriet garenprofila skatu, sāciet projektēto garenprofilu no terēna, pievienojiet un velciet PVI, iestatiet vertikālo līkņu garumus un izlasiet slīpumus, K vērtības un augstākos un zemākos punktus.
keywords: profils, vertikālā trase, pvi, vertikālā līkne, slīpums, k vērtība, izliekums, ieliekums, bvc, evc, garenprofila skats, gala slīpums, fg, esošā terēna profils, raksturlīnijas garenprofilā, krustojumi, projicēts, bordiūra, grāvis, etiķetes
from: dbb1f32d
---

Katrai trasei ir viens projektētais garenprofils: PVI saraksts (pikets un augstums), kas savienoti ar taisniem slīpumiem, un simetriska parabolas vertikālā līkne jebkurā iekšējā PVI, kuram ir garums. Esošā terēna garenprofilu jums paraugo no virsmas.

## Atvērt garenprofila skatu

1. Atlasiet trasi (noklikšķiniet uz tās ar {{ui:Atlasīt}}).
2. Nospiediet {{key:R}}, vai noklikšķiniet uz {{ui:Garenprofils}} rīkjoslā, vai uz {{ui:Garenprofila skats}} labā paneļa apakšā.
   Garenprofila skats atveras zem plāna un rāda esošo terēnu gar trasi. Ja ir divas vai vairākas trases, izvēlieties vienu sarakstā garenprofila joslas kreisajā pusē.

Skats sākumā rāda visu trasi un izstiepj augstumus, lai aizpildītu paneli; pārspīlējums ir norādīts apakšējā kreisajā stūrī, piemēram, "Vertikālais pārspīlējums 10×".

## Tuvināt un pārvietot garenprofilu

- **Tuvināt:** grieziet peles ritentiņu (vai saspiediet uz skārienpaliktņa), un skats tuvinās ap rādītāju. Turiet {{key:Shift}}, lai tuvinātu tikai pikets, vai {{key:Alt}}, lai tuvinātu tikai augstumus (tas maina pārspīlējumu). Kad garenprofila skats ir fokusēts, plus un mīnus taustiņi tuvina pa vidu.
- **Pārvietot:** velciet ar labo vai vidējo peles pogu, vai pabīdiet ar diviem pirkstiem uz skārienpaliktņa.
- **Pielāgot:** veiciet dubultklikšķi uz garenprofila vai nospiediet {{key:F}}, lai atkal parādītu visu trasi.

PVI rediģēšana saglabā jūsu izvēlēto tuvinājumu; skats neatgriežas pie pielāgošanas.

Pārvietojiet rādītāju pa garenprofilu: josla rāda pikets, terēna un projektētos augstumus, slīpumu un izrakumu vai uzbērumu tur, un punkts seko trasei plānā.

## Sākt projektēto garenprofilu

1. Labā paneļa sadaļā **Projektētais garenprofils** noklikšķiniet uz {{ui:Sākt no terēna}}.
   Divi PVI tiek novietoti uz terēna trases abos galos un savienoti ar vienu taisnu slīpumu. Statusa joslā rakstīts: "Projektētais garenprofils sākts no terēna abos galos. Ieslēdziet Pievienot PVI un noklikšķiniet, lai pievienotu slīpuma lūzumus; tabulā norādiet tiem līknes garumu."

Ja trase nešķērso virsmu, redzēsiet: "Šai trasei nav terēna, no kura sākt." Tad pievienojiet PVI, noklikšķinot (nākamajā sadaļā).

## Pievienot PVI

1. Nospiediet {{key:I}} vai noklikšķiniet uz {{ui:Pievienot PVI}} garenprofila joslā. Poga paliek nospiesta.
2. Noklikšķiniet garenprofilā tur, kur vēlaties slīpuma lūzumu. PVI tiek pievienots šajā piketā un augstumā, noapaļots līdz 0.01, un atlasīts.
3. Pievienojiet tik, cik vajag, tad vēlreiz nospiediet {{key:I}}, lai pārtrauktu pievienošanu.

Klikšķis vietā, kur jau ir PVI, tiek noraidīts ("Jau ir PVI pie …"). PVI vienmēr paliek piketu secībā.

## Piesaiste pievienojot vai velkot

Poga **Piesaiste** garenprofila joslā sākumā ir ieslēgta. Kamēr tā ir ieslēgta, pievienots vai vilkts PVI nolaižas uz tuvāko PVI, terēna punktu, PVI piketu vai terēna līniju, un blakus marķierim etiķete norāda, kura. Turiet {{key:Alt}}, lai iegūtu brīvu punktu jebkurā vietā.

## Pielāgot PVI

- **Velciet** PVI garenprofilā, lai to pārvietotu. Tas nevar iziet cauri kaimiņiem. Pārvietošana ir viens atsaukšanas solis.
- **Ierakstiet** precīzas vērtības PVI tabulā labajā panelī: **Pikets**, **Augstums**, **Slīpums %** un **Līknes L** (vertikālās līknes garums). Pēc katras nospiediet {{key:Enter}}.
- **Izvēlieties** vērtību no profila: maza poga blakus PVI piketam vai augstumam gaida vienu klikšķi garenprofila skatā un ieraksta šo vērtību. Klikšķis piesaistās tāpat kā Pievienot PVI; turiet {{key:Alt}} brīvam punktam; {{key:Esc}} atceļ.
- **Slīpums %** ir tangentes slīpums, kas sākas šajā PVI un iet līdz nākamajam. Ierakstot to, tiek pārvietots **nākamā** PVI augstums (tā pikets nekad nemainās). Ja nākamais PVI ir bloķēts, tā vietā pārvietojas iepriekšējā PVI augstums.
- **Bloķējiet** PVI ar slēdzeni rindas galā. Bloķētu PVI nevelk, un slīpuma rediģēšana to nepārvieto. Ja abi tangentes gali ir bloķēti, tās slīpumu nevar mainīt: statusa joslā tiek paziņots, un vispirms jāatbloķē viens gals. Bloķējums tiek saglabāts failā.
- **Noņemiet** PVI ar x rindas galā vai atlasiet to (noklikšķiniet) un nospiediet {{key:Delete}}. Kad garenprofila skats ir fokusēts, {{key:Backspace}} arī to noņem.

Pirmais un pēdējais PVI nekad nesaņem līkni.

## Vertikālās līknes

1. Ierakstiet garumu **Līknes L** iekšējam PVI, piemēram, 200.
2. Līkne tiek zīmēta centrēta ap PVI. Garenprofils un labais panelis rāda tās veidu (izliekums vai ieliekums), L un K, BVC un EVC piketu un augstumus, kā arī augstāko vai zemāko punktu, ja tāds ir līknes iekšpusē.

K tiek aprēķināts no L (K = L dalīts ar slīpumu algebrisko starpību procentos). Jūs ierakstāt L; K tieši ierakstīt vēl nav iespējams.

Ja vertikālā līkne neiederas, sarkans lodziņš paskaidro: tā iet atpakaļ PVI vai iepriekšējā līknē, vai aiz nākamā PVI, un norāda, cik vietas ir šajā pusē (līknei vajag pusi no tās garuma katrā PVI pusē). Tās poga iestata **garāko iederīgo līkni** ar tās K kā vienu soli ({{key:Mod+Z}} to atsauc). Vai pārvietojiet PVI tālāk viens no otra.

## Lasīt faktus

Zem PVI tabulas saraksts dod katru slīpumu procentos ("Slīpums 1: +1.25%") un katru līkni, piemēram, "Izliekums pie 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", tad "Augstākais punkts 1+62.40, 254.12".

Ja PVI nesasniedz abus trases galus, piezīme to norāda. Koridors tiek veidots tikai tur, kur garenprofils un trase pārklājas.

## Raksturlīnijas garenprofilā

Raksturlīnijas tiek rādītas arī garenprofila skatā, lai jūs varētu redzēt bordiūru, grāvi vai sienas augšu pret ceļa profilu.

- Kur raksturlīnija **krusto** trasi, garenprofilā redzams neliels rombs tajā piketā un augstumā, ar līnijas nosaukumu un tās augstumu tur (pašas līnijas augstums, aprēķināts gar krustojošo segmentu).
- Ierakstiet attālumu laukā {{ui:Blakus, tuvāk par}}, lai attēlotu arī raksturlīnijas, kas iet **gar** trasi šajā attālumā, kā punktētas līnijas to augstumos. Tukšs vai 0 rāda tikai krustojumus.
- Atzīmes un etiķetes seko katrai izmaiņai: pārvietojiet virsotni, ierakstiet slīpumu vai pacelieties līniju, un garenprofils uzreiz rāda jaunos augstumus.
- Noklikšķiniet uz krustojuma romba, lai atlasītu šo raksturlīniju; atlasītā līnija tiek zīmēta izcelšanas krāsā.
- {{ui:Raksturlīnijas}} garenprofila joslā paslēpj vai parāda visas. Abi iestatījumi tiek saglabāti kopā ar projektu.

Skatiet [Raksturlīnijas](topic:feature-lines).

## Tālāk

- [Ceļa koridora izveide](topic:corridor) gar trasi un šo garenprofilu.
- Garenprofils tiek ierakstīts LandXML kopā ar trasi; skatiet [LandXML apmaiņa](topic:landxml).
