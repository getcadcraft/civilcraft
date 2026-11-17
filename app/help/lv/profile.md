---
title: Projektēt vertikālo garenprofilu
summary: Atveriet garenprofila skatu, sāciet projektējamo garenprofilu no terēna, pievienojiet un velciet PVI, iestatiet vertikālo līkņu garumus un nolasiet slīpumus, K vērtības un augstākos un zemākos punktus.
keywords: garenprofils, vertikālā trase, pvi, vertikālā līkne, slīpums, k vērtība, kalns, ieplaka, bvc, evc, garenprofila skats, projektētā atzīme, fg, esošā terēna profils, raksturlīnijas garenprofilā, krustojumi, projicēts, apmale, grāvis, uzraksti
from: e9182bfa
---

Katrai trasei ir viens projektējamais garenprofils: PVI saraksts (stacija un augstums), kurus savieno taisni slīpumi, ar simetrisku parabolisku vertikālo līkni jebkurā iekšējā PVI, kuram ir garums. Esošā terēna profils tiek ņemts no virsmas jūsu vietā.

## Garenprofila skata atvēršana

1. Izvēlieties trasi (noklikšķiniet uz tās ar {{ui:Atlasīt}}).
2. Nospiediet {{key:R}}, vai noklikšķiniet uz {{ui:Garenprofils}} rīkjoslā, vai uz {{ui:Garenprofila skats}} labā paneļa apakšā.
   Garenprofila skats atveras zem plāna ar esošo terēnu gar trasi. Ja ir divas vai vairākas trases, izvēlieties vienu sarakstā garenprofila joslas kreisajā pusē.

Skats vienmēr rāda visu trasi un izstiepj augstumus, lai aizpildītu paneli; pārspīlējums ir norādīts apakšējā kreisajā stūrī, piemēram, „Vertikālais pārspīlējums 10×”. Skats netiek tuvināts vai pārvietots.

Pārvietojiet rādītāju pa garenprofilu: josla rāda staciju, terēna un projektētos augstumus, slīpumu un izrakumu vai uzbērumu šajā vietā, un punkts seko trasei plānā.

## Projektējamā garenprofila sākšana

1. Labajā panelī sadaļā **Projektētais garenprofils** noklikšķiniet uz {{ui:Sākt no terēna}}.
   Divi PVI tiek novietoti uz terēna trases abos galos, savienoti ar vienu taisnu slīpumu. Statusa joslā ir rakstīts: „Projektētais garenprofils sākts no terēna abos galos. Ieslēdziet Pievienot PVI un noklikšķiniet, lai pievienotu slīpuma lūzumus; tabulā norādiet tiem līknes garumu.”

Ja trase nešķērso virsmu, parādās: „Šai trasei nav terēna, no kura sākt.” Tad pievienojiet PVI, noklikšķinot (nākamā sadaļa).

## PVI pievienošana

1. Nospiediet {{key:I}} vai noklikšķiniet uz {{ui:Pievienot PVI}} garenprofila joslā. Tā paliek nospiesta.
2. Noklikšķiniet garenprofilā vietā, kur vēlaties slīpuma lūzumu. PVI tiek pievienots šajā stacijā un augstumā, noapaļots līdz 0.01, un tiek atlasīts.
3. Pievienojiet tik, cik vajag, tad vēlreiz nospiediet {{key:I}}, lai pārtrauktu pievienošanu.

Klikšķis vietā, kur jau ir PVI, tiek noraidīts („Šeit jau ir PVI pie …”). PVI vienmēr paliek stacijas secībā.

## PVI pielāgošana

- **Velciet** PVI garenprofilā, lai to pārvietotu. Tas nevar pārvietoties pāri kaimiņiem. Pārvietošana ir viens atsaukšanas solis.
- **Ierakstiet** precīzas vērtības PVI tabulā labajā panelī: **Stacija**, **Augstums** un **Līknes L** (vertikālās līknes garums). Pēc katras nospiediet {{key:Enter}}.
- **Noņemiet** PVI ar x rindas beigās vai atlasiet to (noklikšķiniet) un nospiediet {{key:Delete}}. Kad garenprofila skats ir fokusā, {{key:Backspace}} arī noņem to.

Pirmais un pēdējais PVI nekad nesaņem līkni.

## Vertikālās līknes

1. Ierakstiet garumu laukā **Līknes L** iekšējam PVI, piemēram, 200.
2. Līkne tiek zīmēta centrēta ap PVI. Garenprofils un labais panelis rāda tās veidu (kalns vai ieplaka), L un K, BVC un EVC stacijas un augstumus, kā arī tās augstāko vai zemāko punktu, ja tas atrodas līknes iekšpusē.

K tiek aprēķināts no L (K = L dalīts ar slīpumu algebrisko starpību procentos). Jūs ierakstāt L; K tieši ierakstīt vēl nav iespējams.

Ja vertikālā līkne neietilpst, sarkana kaste pasaka, kāpēc: tā iet atpakaļ iekšā PVI vai līknē pirms tās, vai pāri nākamajam PVI, un cik vietas ir šajā pusē (līknei vajag pusi no sava garuma katrā pusē no sava PVI). Tās poga iestata **garāko līkni, kas ietilpst**, ar savu K, kā vienu soli ({{key:Mod+Z}} to atsauc). Vai arī attāliniet PVI.

## Faktu nolasīšana

Zem PVI tabulas saraksts dod katru slīpumu procentos („Slīpums 1: +1.25%”) un katru līkni, piemēram, „Kalns pie 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)”, tad „Augstākais punkts 1+62.40, 254.12”.

Ja PVI nesasniedz abus trases galus, piezīme to norāda. Koridors tiek veidots tikai tur, kur garenprofils un trase pārklājas.

## Raksturlīnijas garenprofilā

Raksturlīnijas tiek rādītas arī garenprofila skatā, lai varētu redzēt apmali, grāvi vai sienas augšu attiecībā pret ceļa garenprofilu.

- Ja raksturlīnija **šķērso** trasi, garenprofilā tās stacijā un augstumā ir redzams mazs rombs, kas apzīmēts ar līnijas nosaukumu un tās augstumu tur (paša līnijas augstums, aprēķināts pa šķērsojošo segmentu).
- Ierakstiet attālumu laukā {{ui:Blakus, tuvāk par}}, lai rādītu arī raksturlīnijas, kas **iet blakus** trasei šajā attālumā, kā punktētas līnijas to paša augstumos. Tukšs lauks vai 0 rāda tikai krustojumus.
- Atzīmes un uzraksti seko katrai izmaiņai: pārvietojiet virsotni, ierakstiet slīpumu vai paceliet līniju, un garenprofils uzreiz rāda jaunos augstumus.
- Noklikšķiniet uz krustojuma romba, lai atlasītu šo raksturlīniju; atlasītā līnija tiek zīmēta izceltajā krāsā.
- {{ui:Raksturlīnijas}} garenprofila joslā paslēpj vai parāda tās visas. Abi iestatījumi tiek saglabāti ar projektu.

Skatiet [Raksturlīnijas](topic:feature-lines).

## Tālāk

- [Izveidot ceļa koridoru](topic:corridor) gar trasi un šo garenprofilu.
- Garenprofils tiek rakstīts LandXML kopā ar trasi; skatiet [LandXML apmaiņa](topic:landxml).
